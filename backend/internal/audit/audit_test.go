package audit_test

import (
	"bytes"
	"context"
	"encoding/json"
	"log/slog"
	"testing"

	"github.com/netparamad/template-nextjs-go/backend/internal/audit"
)

func TestAuditLogger(t *testing.T) {
	var buf bytes.Buffer
	jsonHandler := slog.NewJSONHandler(&buf, nil)
	logger := slog.New(jsonHandler)
	auditLogger := audit.NewLogger(logger)

	auditLogger.Log(context.Background(), audit.Record{
		Event:     audit.EventLoginSuccess,
		ActorID:   "user-123",
		Email:     "user@example.com",
		IPAddress: "192.168.1.1",
		Status:    "SUCCESS",
	})

	var data map[string]any
	if err := json.Unmarshal(buf.Bytes(), &data); err != nil {
		t.Fatalf("failed to parse json log: %v", err)
	}

	if data["audit_event"] != "auth.login.success" {
		t.Fatalf("expected audit_event auth.login.success, got %v", data["audit_event"])
	}
	if data["status"] != "SUCCESS" {
		t.Fatalf("expected status SUCCESS, got %v", data["status"])
	}
	if data["email"] != "user@example.com" {
		t.Fatalf("expected email user@example.com, got %v", data["email"])
	}
}
