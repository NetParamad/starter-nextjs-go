package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/netparamad/template-nextjs-go/backend/internal/config"
	"github.com/netparamad/template-nextjs-go/backend/internal/domain"
	"github.com/netparamad/template-nextjs-go/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrInvalidInput       = errors.New("invalid input")
	ErrUnauthorized       = errors.New("unauthorized")
)

type UserStore interface {
	Create(ctx context.Context, input domain.RegisterInput, passwordHash string) (domain.User, error)
	FindByEmail(ctx context.Context, email string) (domain.User, error)
	FindByID(ctx context.Context, id string) (domain.User, error)
	UpdateLastLogin(ctx context.Context, id string) error
	CreateRefreshToken(ctx context.Context, userID, tokenHash string, expiresAt time.Time, userAgent, ipAddress string) error
	FindActiveRefreshTokenByHash(ctx context.Context, tokenHash string) (repository.RefreshToken, error)
	MarkRefreshTokenUsed(ctx context.Context, id string) error
	DeleteRefreshTokensByUserID(ctx context.Context, userID string) error
}

type AuthService struct {
	cfg   config.Config
	users UserStore
}

// SessionMeta carries request context worth recording alongside a
// refresh-token session. Empty values are stored as NULL.
type SessionMeta struct {
	UserAgent string
	IPAddress string
}

func NewAuthService(cfg config.Config, users UserStore) AuthService {
	return AuthService{
		cfg:   cfg,
		users: users,
	}
}

func (s AuthService) Register(ctx context.Context, input domain.RegisterInput) (domain.RegisterResponse, error) {
	input.Username = strings.TrimSpace(input.Username)
	input.Email = strings.TrimSpace(strings.ToLower(input.Email))
	input.FullName = strings.TrimSpace(input.FullName)

	if input.Username == "" || input.Email == "" || len(input.Password) < 8 {
		return domain.RegisterResponse{}, ErrInvalidInput
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return domain.RegisterResponse{}, err
	}

	user, err := s.users.Create(ctx, input, string(passwordHash))
	if err != nil {
		return domain.RegisterResponse{}, err
	}

	user.PasswordHash = ""

	return domain.RegisterResponse{
		Message: "User registered successfully",
		User:    user,
	}, nil
}

func (s AuthService) Login(ctx context.Context, input domain.LoginInput, meta SessionMeta) (domain.AuthResponse, error) {
	input.Email = strings.TrimSpace(strings.ToLower(input.Email))

	if input.Email == "" || input.Password == "" {
		return domain.AuthResponse{}, ErrInvalidInput
	}

	user, err := s.users.FindByEmail(ctx, input.Email)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			return domain.AuthResponse{}, ErrInvalidCredentials
		}
		return domain.AuthResponse{}, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		return domain.AuthResponse{}, ErrInvalidCredentials
	}

	if err := s.users.UpdateLastLogin(ctx, user.ID); err != nil {
		return domain.AuthResponse{}, err
	}

	refreshedUser, err := s.users.FindByID(ctx, user.ID)
	if err != nil {
		return domain.AuthResponse{}, err
	}

	return s.buildAuthResponse(ctx, refreshedUser, meta)
}

func (s AuthService) Refresh(ctx context.Context, input domain.RefreshInput, meta SessionMeta) (domain.AuthResponse, error) {
	rawToken := strings.TrimSpace(input.RefreshToken)
	if rawToken == "" {
		return domain.AuthResponse{}, ErrInvalidInput
	}

	stored, err := s.users.FindActiveRefreshTokenByHash(ctx, hashResetToken(rawToken))
	if err != nil {
		if errors.Is(err, repository.ErrRefreshTokenNotFound) {
			return domain.AuthResponse{}, ErrInvalidCredentials
		}
		return domain.AuthResponse{}, err
	}

	user, err := s.users.FindByID(ctx, stored.UserID)
	if err != nil {
		return domain.AuthResponse{}, ErrInvalidCredentials
	}

	// Rotate: the presented token is single-use, a fresh pair is minted below.
	if err := s.users.MarkRefreshTokenUsed(ctx, stored.ID); err != nil {
		return domain.AuthResponse{}, err
	}

	return s.buildAuthResponse(ctx, user, meta)
}

func (s AuthService) Logout(ctx context.Context, input domain.LogoutInput) error {
	rawToken := strings.TrimSpace(input.RefreshToken)
	if rawToken == "" {
		return nil
	}

	stored, err := s.users.FindActiveRefreshTokenByHash(ctx, hashResetToken(rawToken))
	if err != nil {
		// Already used, expired, or unknown: logout stays idempotent.
		return nil
	}

	return s.users.MarkRefreshTokenUsed(ctx, stored.ID)
}

func (s AuthService) Me(ctx context.Context, userID string) (domain.User, error) {
	return s.users.FindByID(ctx, userID)
}

func (s AuthService) ParseAccessToken(tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidCredentials
		}
		return []byte(s.cfg.JWT.AccessSecret), nil
	})
	if err != nil {
		return "", ErrInvalidCredentials
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return "", ErrInvalidCredentials
	}

	subject, ok := claims["sub"].(string)
	if !ok || subject == "" {
		return "", ErrInvalidCredentials
	}

	return subject, nil
}

func (s AuthService) buildAuthResponse(ctx context.Context, user domain.User, meta SessionMeta) (domain.AuthResponse, error) {
	expiresAt := time.Now().UTC().Add(time.Duration(s.cfg.JWT.AccessTTLMinutes) * time.Minute)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":   user.ID,
		"email": user.Email,
		"role":  user.Role,
		"exp":   expiresAt.Unix(),
		"iat":   time.Now().UTC().Unix(),
	})

	signedToken, err := token.SignedString([]byte(s.cfg.JWT.AccessSecret))
	if err != nil {
		return domain.AuthResponse{}, err
	}

	refreshToken, refreshTokenHash, err := generateResetToken()
	if err != nil {
		return domain.AuthResponse{}, err
	}

	refreshExpiresAt := time.Now().UTC().Add(time.Duration(s.cfg.JWT.RefreshTTLHours) * time.Hour)
	if err := s.users.CreateRefreshToken(ctx, user.ID, refreshTokenHash, refreshExpiresAt, meta.UserAgent, meta.IPAddress); err != nil {
		return domain.AuthResponse{}, err
	}

	user.PasswordHash = ""

	return domain.AuthResponse{
		AccessToken:      signedToken,
		TokenType:        "Bearer",
		ExpiresAt:        expiresAt,
		RefreshToken:     refreshToken,
		RefreshExpiresAt: refreshExpiresAt,
		User:             user,
	}, nil
}

func generateResetToken() (string, string, error) {
	randomBytes := make([]byte, 32)
	if _, err := rand.Read(randomBytes); err != nil {
		return "", "", err
	}

	token := hex.EncodeToString(randomBytes)
	return token, hashResetToken(token), nil
}

func hashResetToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}
