package server

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestWithRecoveryRecoversPanic(t *testing.T) {
	panicHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		panic("unexpected runtime panic")
	})

	handler := withRecovery(panicHandler)
	req := httptest.NewRequest("GET", "/test-panic", nil)
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusInternalServerError {
		t.Fatalf("expected status 500 on panic, got %d", rr.Code)
	}
}

func TestWithLoggingRecordsRequest(t *testing.T) {
	okHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"ok":true}`))
	})

	handler := withLogging(okHandler)
	req := httptest.NewRequest("GET", "/test-log", nil)
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rr.Code)
	}
}
