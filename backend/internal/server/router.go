package server

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"runtime/debug"
	"slices"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/netparamad/template-nextjs-go/backend/internal/audit"
	"github.com/netparamad/template-nextjs-go/backend/internal/config"
	httpHandler "github.com/netparamad/template-nextjs-go/backend/internal/handler/http"
	"github.com/netparamad/template-nextjs-go/backend/internal/repository"
	"github.com/netparamad/template-nextjs-go/backend/internal/service"
)

func NewRouter(cfg config.Config, db *pgxpool.Pool) http.Handler {
	mux := http.NewServeMux()

	userRepository := repository.NewUserRepository(db)

	var pinger service.Pinger
	if db != nil {
		pinger = db
	}
	healthService := service.NewHealthService(cfg, pinger)
	authService := service.NewAuthService(cfg, userRepository)

	healthHandler := httpHandler.NewHealthHandler(healthService)
	authHandler := httpHandler.NewAuthHandler(authService, audit.NewLogger(nil))

	metrics := NewMetrics(db)

	mux.Handle("GET /metrics", metrics.Handler())
	mux.HandleFunc("GET /health", healthHandler.Get)
	mux.HandleFunc("GET /livez", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"live"}`))
	})
	mux.HandleFunc("GET /readyz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if err := db.Ping(r.Context()); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			_, _ = w.Write([]byte(`{"status":"unavailable","database":"down"}`))
			return
		}
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ready","database":"connected"}`))
	})

	registerAuthRoutes(mux, authService, authHandler)

	return withRecovery(metrics.Middleware(withCORS(cfg, withSecurityHeaders(withRequestID(withLogging(mux))))))
}

// registerAuthRoutes wires every auth endpoint in one place. Removing auth
// from a project starts here: delete this call and the auth handler,
// service, and token tables listed in docs/remove-auth.md.
func registerAuthRoutes(mux *http.ServeMux, authService service.AuthService, authHandler httpHandler.AuthHandler) {
	authLimiter := newRateLimiter(20, time.Minute)

	mux.Handle("POST /api/v1/auth/register", withRateLimit(authLimiter, http.HandlerFunc(authHandler.Register)))
	mux.Handle("POST /api/v1/auth/login", withRateLimit(authLimiter, http.HandlerFunc(authHandler.Login)))
	mux.Handle("POST /api/v1/auth/refresh", withRateLimit(authLimiter, http.HandlerFunc(authHandler.Refresh)))
	mux.Handle("POST /api/v1/auth/logout", withRateLimit(authLimiter, http.HandlerFunc(authHandler.Logout)))
	mux.Handle("GET /api/v1/auth/me", authMiddleware(authService, http.HandlerFunc(authHandler.Me)))
}

func withSecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("Cross-Origin-Opener-Policy", "same-origin")
		next.ServeHTTP(w, r)
	})
}

func withRequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID := r.Header.Get("X-Request-ID")
		if strings.TrimSpace(requestID) == "" {
			requestID = randomID()
		}

		w.Header().Set("X-Request-ID", requestID)
		next.ServeHTTP(w, r)
	})
}

func randomID() string {
	buffer := make([]byte, 8)
	if _, err := rand.Read(buffer); err != nil {
		return fmt.Sprintf("req-%d", time.Now().UnixNano())
	}

	return hex.EncodeToString(buffer)
}

type statusRecorder struct {
	http.ResponseWriter
	statusCode int
}

func (r *statusRecorder) WriteHeader(statusCode int) {
	r.statusCode = statusCode
	r.ResponseWriter.WriteHeader(statusCode)
}

func withRecovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rec := recover(); rec != nil {
				slog.Error("panic recovered",
					"error", rec,
					"stack", string(debug.Stack()),
					"request_id", w.Header().Get("X-Request-ID"),
				)
				httpHandler.WriteErrorPublic(w, http.StatusInternalServerError, "internal server error")
			}
		}()
		next.ServeHTTP(w, r)
	})
}

func withLogging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rec := &statusRecorder{ResponseWriter: w, statusCode: http.StatusOK}
		next.ServeHTTP(rec, r)

		duration := time.Since(start)
		requestID := w.Header().Get("X-Request-ID")
		status := rec.statusCode

		attrs := []any{
			"method", r.Method,
			"path", r.URL.Path,
			"status", status,
			"duration_ms", duration.Milliseconds(),
			"request_id", requestID,
		}

		if status >= 500 {
			slog.Error("http request", attrs...)
		} else if status >= 400 {
			slog.Warn("http request", attrs...)
		} else {
			slog.Info("http request", attrs...)
		}
	})
}

func withCORS(cfg config.Config, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := strings.TrimSpace(r.Header.Get("Origin"))
		if origin != "" && slices.Contains(cfg.App.CORS.AllowedOrigins, origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-ID")
		w.Header().Set("Access-Control-Expose-Headers", "X-Request-ID")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func authMiddleware(authService service.AuthService, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			_ = json.NewEncoder(w).Encode(httpHandler.ErrorResponse{Error: "missing authorization header"})
			return
		}

		const prefix = "Bearer "
		if !strings.HasPrefix(authHeader, prefix) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			_ = json.NewEncoder(w).Encode(httpHandler.ErrorResponse{Error: "invalid authorization scheme"})
			return
		}

		userID, err := authService.ParseAccessToken(strings.TrimPrefix(authHeader, prefix))
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			_ = json.NewEncoder(w).Encode(httpHandler.ErrorResponse{Error: "invalid access token"})
			return
		}

		next.ServeHTTP(w, r.WithContext(httpHandler.ContextWithUserID(r.Context(), userID)))
	})
}
