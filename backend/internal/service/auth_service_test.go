package service_test

import (
	"context"
	"testing"
	"time"

	"github.com/netparamad/template-nextjs-go/backend/internal/config"
	"github.com/netparamad/template-nextjs-go/backend/internal/domain"
	"github.com/netparamad/template-nextjs-go/backend/internal/repository"
	"github.com/netparamad/template-nextjs-go/backend/internal/service"
	"golang.org/x/crypto/bcrypt"
)

type mockUserStore struct {
	users         map[string]domain.User
	refreshTokens map[string]repository.RefreshToken
}

func newMockUserStore() *mockUserStore {
	return &mockUserStore{
		users:         make(map[string]domain.User),
		refreshTokens: make(map[string]repository.RefreshToken),
	}
}

func (m *mockUserStore) Create(ctx context.Context, input domain.RegisterInput, passwordHash string) (domain.User, error) {
	u := domain.User{
		ID:           "user-123",
		Username:     input.Username,
		Email:        input.Email,
		FullName:     input.FullName,
		PasswordHash: passwordHash,
		Role:         "member",
		Status:       "active",
		CreatedAt:    time.Now().UTC(),
	}
	m.users[u.ID] = u
	return u, nil
}

func (m *mockUserStore) FindByEmail(ctx context.Context, email string) (domain.User, error) {
	for _, u := range m.users {
		if u.Email == email && u.DeletedAt == nil {
			return u, nil
		}
	}
	return domain.User{}, repository.ErrUserNotFound
}

func (m *mockUserStore) FindByID(ctx context.Context, id string) (domain.User, error) {
	if u, ok := m.users[id]; ok && u.DeletedAt == nil {
		return u, nil
	}
	return domain.User{}, repository.ErrUserNotFound
}

func (m *mockUserStore) UpdateLastLogin(ctx context.Context, id string) error {
	if u, ok := m.users[id]; ok {
		now := time.Now().UTC()
		u.LastLoginAt = &now
		m.users[id] = u
		return nil
	}
	return repository.ErrUserNotFound
}

func (m *mockUserStore) CreateRefreshToken(ctx context.Context, userID, tokenHash string, expiresAt time.Time, userAgent, ipAddress string) error {
	m.refreshTokens[tokenHash] = repository.RefreshToken{
		ID:        "rt-" + tokenHash[:8],
		UserID:    userID,
		TokenHash: tokenHash,
		ExpiresAt: expiresAt,
		CreatedAt: time.Now().UTC(),
	}
	return nil
}

func (m *mockUserStore) FindActiveRefreshTokenByHash(ctx context.Context, tokenHash string) (repository.RefreshToken, error) {
	if tok, ok := m.refreshTokens[tokenHash]; ok && tok.UsedAt == nil && tok.ExpiresAt.After(time.Now().UTC()) {
		return tok, nil
	}
	return repository.RefreshToken{}, repository.ErrRefreshTokenNotFound
}

func (m *mockUserStore) MarkRefreshTokenUsed(ctx context.Context, id string) error {
	for k, tok := range m.refreshTokens {
		if tok.ID == id {
			now := time.Now().UTC()
			tok.UsedAt = &now
			m.refreshTokens[k] = tok
			return nil
		}
	}
	return nil
}

func (m *mockUserStore) DeleteRefreshTokensByUserID(ctx context.Context, userID string) error {
	for k, tok := range m.refreshTokens {
		if tok.UserID == userID {
			delete(m.refreshTokens, k)
		}
	}
	return nil
}

func testConfig() config.Config {
	return config.Config{
		App: config.AppConfig{
			Name:        "Test App",
			Env:         "testing",
			FrontendURL: "http://localhost:3000",
		},
		JWT: config.JWTConfig{
			AccessSecret:     "super-secret-access-key-12345",
			RefreshSecret:    "super-secret-refresh-key-12345",
			AccessTTLMinutes: 15,
			RefreshTTLHours:  720,
		},
	}
}

func TestAuthService_Register_Validation(t *testing.T) {
	store := newMockUserStore()
	svc := service.NewAuthService(testConfig(), store)
	ctx := context.Background()

	// Empty username
	_, err := svc.Register(ctx, domain.RegisterInput{
		Username: "",
		Email:    "test@example.com",
		Password: "password123",
	})
	if err != service.ErrInvalidInput {
		t.Fatalf("expected ErrInvalidInput for empty username, got %v", err)
	}

	// Short password (< 8 chars)
	_, err = svc.Register(ctx, domain.RegisterInput{
		Username: "validuser",
		Email:    "test@example.com",
		Password: "short",
	})
	if err != service.ErrInvalidInput {
		t.Fatalf("expected ErrInvalidInput for short password, got %v", err)
	}
}

func TestAuthService_Register_Success(t *testing.T) {
	store := newMockUserStore()
	svc := service.NewAuthService(testConfig(), store)
	ctx := context.Background()

	resp, err := svc.Register(ctx, domain.RegisterInput{
		Username: "validuser",
		Email:    "test@example.com",
		Password: "password123",
		FullName: "Valid User",
	})
	if err != nil {
		t.Fatalf("unexpected error registering user: %v", err)
	}
	if resp.User.Email != "test@example.com" {
		t.Fatalf("expected email test@example.com, got %s", resp.User.Email)
	}
	if resp.User.Status != "active" {
		t.Fatalf("expected active status, got %s", resp.User.Status)
	}
}

func TestAuthService_Login_Workflow(t *testing.T) {
	store := newMockUserStore()
	cfg := testConfig()
	svc := service.NewAuthService(cfg, store)
	ctx := context.Background()

	hash, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	store.users["u1"] = domain.User{
		ID:           "u1",
		Username:     "activeuser",
		Email:        "user@example.com",
		PasswordHash: string(hash),
		Role:         "member",
		Status:       "active",
	}

	// Invalid password
	_, err := svc.Login(ctx, domain.LoginInput{
		Email:    "user@example.com",
		Password: "wrongpassword",
	}, service.SessionMeta{})
	if err != service.ErrInvalidCredentials {
		t.Fatalf("expected ErrInvalidCredentials for wrong password, got %v", err)
	}

	// Successful login
	session, err := svc.Login(ctx, domain.LoginInput{
		Email:    "user@example.com",
		Password: "password123",
	}, service.SessionMeta{UserAgent: "test-agent", IPAddress: "127.0.0.1"})
	if err != nil {
		t.Fatalf("unexpected login error: %v", err)
	}

	if session.AccessToken == "" || session.RefreshToken == "" {
		t.Fatal("expected access and refresh tokens to be populated")
	}

	// Parse Access Token
	parsedID, err := svc.ParseAccessToken(session.AccessToken)
	if err != nil {
		t.Fatalf("failed to parse access token: %v", err)
	}
	if parsedID != "u1" {
		t.Fatalf("expected user id u1, got %s", parsedID)
	}

	// Refresh session
	rotatedSession, err := svc.Refresh(ctx, domain.RefreshInput{
		RefreshToken: session.RefreshToken,
	}, service.SessionMeta{})
	if err != nil {
		t.Fatalf("failed to rotate refresh token: %v", err)
	}
	if rotatedSession.RefreshToken == session.RefreshToken {
		t.Fatal("refresh token must be rotated to a new token")
	}

	// Old refresh token must be rejected
	_, err = svc.Refresh(ctx, domain.RefreshInput{
		RefreshToken: session.RefreshToken,
	}, service.SessionMeta{})
	if err != service.ErrInvalidCredentials {
		t.Fatalf("expected ErrInvalidCredentials for used refresh token, got %v", err)
	}

	// Logout
	err = svc.Logout(ctx, domain.LogoutInput{
		RefreshToken: rotatedSession.RefreshToken,
	})
	if err != nil {
		t.Fatalf("unexpected logout error: %v", err)
	}
}

func TestAuthService_SoftDelete(t *testing.T) {
	store := newMockUserStore()
	cfg := testConfig()
	svc := service.NewAuthService(cfg, store)
	ctx := context.Background()

	hash, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	now := time.Now().UTC()
	store.users["u-deleted"] = domain.User{
		ID:           "u-deleted",
		Username:     "deleteduser",
		Email:        "deleted@example.com",
		PasswordHash: string(hash),
		Role:         "member",
		Status:       "active",
		DeletedAt:    &now,
	}

	// Login with soft-deleted user must fail
	_, err := svc.Login(ctx, domain.LoginInput{
		Email:    "deleted@example.com",
		Password: "password123",
	}, service.SessionMeta{})
	if err != service.ErrInvalidCredentials {
		t.Fatalf("expected ErrInvalidCredentials for soft-deleted user, got %v", err)
	}
}
