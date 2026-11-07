package server_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/netparamad/template-nextjs-go/backend/internal/config"
	"github.com/netparamad/template-nextjs-go/backend/internal/server"
)

func TestMetricsEndpoint(t *testing.T) {
	cfg := config.Config{
		App: config.AppConfig{
			Name: "Test App",
			Env:  "testing",
		},
	}

	router := server.NewRouter(cfg, nil)

	// Make a request to generate metrics
	healthReq := httptest.NewRequest(http.MethodGet, "/health", nil)
	healthRec := httptest.NewRecorder()
	router.ServeHTTP(healthRec, healthReq)

	if healthRec.Code != http.StatusOK {
		t.Fatalf("expected /health status 200, got %d", healthRec.Code)
	}

	// Fetch /metrics
	req := httptest.NewRequest(http.MethodGet, "/metrics", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	body := rec.Body.String()
	if !strings.Contains(body, "http_requests_total") {
		t.Fatalf("expected metrics to contain http_requests_total, got: %s", body)
	}
	if !strings.Contains(body, "http_request_duration_seconds") {
		t.Fatalf("expected metrics to contain http_request_duration_seconds, got: %s", body)
	}
	if !strings.Contains(body, "go_goroutines") {
		t.Fatalf("expected metrics to contain go_goroutines, got: %s", body)
	}
}
