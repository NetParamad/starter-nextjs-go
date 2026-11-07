package audit

import (
	"context"
	"log/slog"
	"time"
)

type Event string

const (
	EventLoginSuccess    Event = "auth.login.success"
	EventLoginFailure    Event = "auth.login.failure"
	EventRegisterSuccess Event = "auth.register.success"
	EventRegisterFailure Event = "auth.register.failure"
	EventRefreshSuccess  Event = "auth.refresh.success"
	EventRefreshFailure  Event = "auth.refresh.failure"
	EventLogoutSuccess   Event = "auth.logout.success"
	EventUserSoftDeleted Event = "user.soft_deleted"
)

type Record struct {
	Event     Event  `json:"event"`
	ActorID   string `json:"actor_id,omitempty"`
	Email     string `json:"email,omitempty"`
	IPAddress string `json:"ip_address,omitempty"`
	UserAgent string `json:"user_agent,omitempty"`
	RequestID string `json:"request_id,omitempty"`
	Status    string `json:"status"` // SUCCESS or FAILURE
	Reason    string `json:"reason,omitempty"`
}

type Logger struct {
	logger *slog.Logger
}

func NewLogger(logger *slog.Logger) *Logger {
	if logger == nil {
		logger = slog.Default()
	}
	return &Logger{logger: logger}
}

func (l *Logger) Log(_ context.Context, r Record) {
	attrs := []any{
		"audit_event", string(r.Event),
		"status", r.Status,
		"timestamp", time.Now().UTC().Format(time.RFC3339),
	}

	if r.ActorID != "" {
		attrs = append(attrs, "actor_id", r.ActorID)
	}
	if r.Email != "" {
		attrs = append(attrs, "email", r.Email)
	}
	if r.IPAddress != "" {
		attrs = append(attrs, "ip_address", r.IPAddress)
	}
	if r.UserAgent != "" {
		attrs = append(attrs, "user_agent", r.UserAgent)
	}
	if r.RequestID != "" {
		attrs = append(attrs, "request_id", r.RequestID)
	}
	if r.Reason != "" {
		attrs = append(attrs, "reason", r.Reason)
	}

	if r.Status == "FAILURE" {
		l.logger.Warn("security audit event", attrs...)
	} else {
		l.logger.Info("security audit event", attrs...)
	}
}
