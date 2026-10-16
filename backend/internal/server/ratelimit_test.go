package server

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestRateLimiterAllowsUpToLimit(t *testing.T) {
	limiter := newRateLimiter(3, time.Minute)

	for range 3 {
		if !limiter.allow("127.0.0.1") {
			t.Fatal("expected request to be allowed")
		}
	}

	if limiter.allow("127.0.0.1") {
		t.Fatal("expected request over the limit to be denied")
	}
}

func TestRateLimiterIsolatesIPs(t *testing.T) {
	limiter := newRateLimiter(1, time.Minute)

	if !limiter.allow("10.0.0.1") {
		t.Fatal("expected first IP to be allowed")
	}

	if !limiter.allow("10.0.0.2") {
		t.Fatal("expected a different IP to be allowed")
	}
}

func TestRateLimiterWindowExpiry(t *testing.T) {
	limiter := newRateLimiter(1, 20*time.Millisecond)

	if !limiter.allow("127.0.0.1") {
		t.Fatal("expected first request to be allowed")
	}

	if limiter.allow("127.0.0.1") {
		t.Fatal("expected immediate second request to be denied")
	}

	time.Sleep(30 * time.Millisecond)

	if !limiter.allow("127.0.0.1") {
		t.Fatal("expected request after the window to be allowed")
	}
}

func TestWithRateLimitMiddleware(t *testing.T) {
	limiter := newRateLimiter(1, time.Minute)
	handler := withRateLimit(limiter, http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	first := httptest.NewRecorder()
	handler.ServeHTTP(first, httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", nil))
	if first.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", first.Code)
	}

	second := httptest.NewRecorder()
	handler.ServeHTTP(second, httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", nil))
	if second.Code != http.StatusTooManyRequests {
		t.Fatalf("expected 429, got %d", second.Code)
	}
}
