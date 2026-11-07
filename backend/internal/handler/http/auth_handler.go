package http

import (
	"errors"
	"net"
	"net/http"

	"github.com/netparamad/template-nextjs-go/backend/internal/audit"
	"github.com/netparamad/template-nextjs-go/backend/internal/domain"
	"github.com/netparamad/template-nextjs-go/backend/internal/repository"
	"github.com/netparamad/template-nextjs-go/backend/internal/service"
)

type AuthHandler struct {
	service service.AuthService
	audit   *audit.Logger
}

func NewAuthHandler(service service.AuthService, auditLogger *audit.Logger) AuthHandler {
	if auditLogger == nil {
		auditLogger = audit.NewLogger(nil)
	}
	return AuthHandler{service: service, audit: auditLogger}
}

func (h AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var input domain.RegisterInput
	if err := readJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	meta := sessionMetaFromRequest(r)
	requestID := r.Header.Get("X-Request-ID")

	response, err := h.service.Register(r.Context(), input)
	if err != nil {
		h.audit.Log(r.Context(), audit.Record{
			Event:     audit.EventRegisterFailure,
			Email:     input.Email,
			IPAddress: meta.IPAddress,
			UserAgent: meta.UserAgent,
			RequestID: requestID,
			Status:    "FAILURE",
			Reason:    err.Error(),
		})

		switch {
		case errors.Is(err, service.ErrInvalidInput):
			writeError(w, http.StatusBadRequest, "username, email, and password must be valid")
		case errors.Is(err, repository.ErrUserConflict):
			writeError(w, http.StatusConflict, "user already exists")
		default:
			writeError(w, http.StatusInternalServerError, "failed to register user")
		}
		return
	}

	h.audit.Log(r.Context(), audit.Record{
		Event:     audit.EventRegisterSuccess,
		ActorID:   response.User.ID,
		Email:     response.User.Email,
		IPAddress: meta.IPAddress,
		UserAgent: meta.UserAgent,
		RequestID: requestID,
		Status:    "SUCCESS",
	})

	writeJSON(w, http.StatusCreated, response)
}

func (h AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var input domain.LoginInput
	if err := readJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	meta := sessionMetaFromRequest(r)
	requestID := r.Header.Get("X-Request-ID")

	response, err := h.service.Login(r.Context(), input, meta)
	if err != nil {
		h.audit.Log(r.Context(), audit.Record{
			Event:     audit.EventLoginFailure,
			Email:     input.Email,
			IPAddress: meta.IPAddress,
			UserAgent: meta.UserAgent,
			RequestID: requestID,
			Status:    "FAILURE",
			Reason:    err.Error(),
		})

		switch {
		case errors.Is(err, service.ErrInvalidInput):
			writeError(w, http.StatusBadRequest, "email and password are required")
		case errors.Is(err, service.ErrInvalidCredentials):
			writeError(w, http.StatusUnauthorized, "invalid email or password")
		default:
			writeError(w, http.StatusInternalServerError, "failed to login")
		}
		return
	}

	h.audit.Log(r.Context(), audit.Record{
		Event:     audit.EventLoginSuccess,
		ActorID:   response.User.ID,
		Email:     response.User.Email,
		IPAddress: meta.IPAddress,
		UserAgent: meta.UserAgent,
		RequestID: requestID,
		Status:    "SUCCESS",
	})

	writeJSON(w, http.StatusOK, response)
}

func (h AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	var input domain.RefreshInput
	if err := readJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	meta := sessionMetaFromRequest(r)
	requestID := r.Header.Get("X-Request-ID")

	response, err := h.service.Refresh(r.Context(), input, meta)
	if err != nil {
		h.audit.Log(r.Context(), audit.Record{
			Event:     audit.EventRefreshFailure,
			IPAddress: meta.IPAddress,
			UserAgent: meta.UserAgent,
			RequestID: requestID,
			Status:    "FAILURE",
			Reason:    err.Error(),
		})

		switch {
		case errors.Is(err, service.ErrInvalidInput):
			writeError(w, http.StatusBadRequest, "refresh token is required")
		case errors.Is(err, service.ErrInvalidCredentials):
			writeError(w, http.StatusUnauthorized, "invalid or expired refresh token")
		default:
			writeError(w, http.StatusInternalServerError, "failed to refresh session")
		}
		return
	}

	h.audit.Log(r.Context(), audit.Record{
		Event:     audit.EventRefreshSuccess,
		ActorID:   response.User.ID,
		Email:     response.User.Email,
		IPAddress: meta.IPAddress,
		UserAgent: meta.UserAgent,
		RequestID: requestID,
		Status:    "SUCCESS",
	})

	writeJSON(w, http.StatusOK, response)
}

func (h AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	var input domain.LogoutInput
	if err := readJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	meta := sessionMetaFromRequest(r)
	requestID := r.Header.Get("X-Request-ID")

	if err := h.service.Logout(r.Context(), input); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to log out")
		return
	}

	h.audit.Log(r.Context(), audit.Record{
		Event:     audit.EventLogoutSuccess,
		IPAddress: meta.IPAddress,
		UserAgent: meta.UserAgent,
		RequestID: requestID,
		Status:    "SUCCESS",
	})

	w.WriteHeader(http.StatusNoContent)
}

func sessionMetaFromRequest(r *http.Request) service.SessionMeta {
	ip := r.RemoteAddr
	if host, _, err := net.SplitHostPort(r.RemoteAddr); err == nil {
		ip = host
	}

	return service.SessionMeta{
		UserAgent: r.UserAgent(),
		IPAddress: ip,
	}
}

func (h AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID, ok := UserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "missing authenticated user")
		return
	}

	user, err := h.service.Me(r.Context(), userID)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			writeError(w, http.StatusUnauthorized, "user no longer exists")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to load user")
		return
	}

	user.PasswordHash = ""
	writeJSON(w, http.StatusOK, map[string]any{"data": user})
}
