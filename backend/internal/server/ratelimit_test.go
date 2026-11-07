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

func TestClientIPHeaderPrecedence(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.RemoteAddr = "192.168.1.1:12345"
	if ip := clientIP(req); ip != "192.168.1.1" {
		t.Fatalf("expected 192.168.1.1, got %s", ip)
	}

	req.Header.Set("X-Forwarded-For", "203.0.113.195, 70.41.3.18")
	if ip := clientIP(req); ip != "203.0.113.195" {
		t.Fatalf("expected 203.0.113.195, got %s", ip)
	}

	req.Header.Set("X-Real-IP", "198.51.100.1")
	if ip := clientIP(req); ip != "198.51.100.1" {
		t.Fatalf("expected 198.51.100.1, got %s", ip)
	}

	req.Header.Set("CF-Connecting-IP", "1.1.1.1")
	if ip := clientIP(req); ip != "1.1.1.1" {
		t.Fatalf("expected 1.1.1.1, got %s", ip)
	}
}
