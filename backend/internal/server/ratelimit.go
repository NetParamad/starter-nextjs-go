package server

import (
	"net"
	"net/http"
	"sync"
	"time"

	httpHandler "github.com/netparamad/template-nextjs-go/backend/internal/handler/http"
)

// rateLimiter is a minimal in-memory fixed-window limiter keyed by client IP,
// meant to blunt brute-force attempts against public auth endpoints. It is
// not distributed-safe: put a real edge limiter in front for multi-replica
// deployments.
type rateLimiter struct {
	mu       sync.Mutex
	requests map[string][]time.Time
	limit    int
	window   time.Duration
}

func newRateLimiter(limit int, window time.Duration) *rateLimiter {
	return &rateLimiter{
		requests: make(map[string][]time.Time),
		limit:    limit,
		window:   window,
	}
}

func (l *rateLimiter) allow(ip string) bool {
	now := time.Now()
	cutoff := now.Add(-l.window)

	l.mu.Lock()
	defer l.mu.Unlock()

	hits := make([]time.Time, 0, len(l.requests[ip]))
	for _, at := range l.requests[ip] {
		if at.After(cutoff) {
			hits = append(hits, at)
		}
	}

	if len(hits) >= l.limit {
		l.requests[ip] = hits
		return false
	}

	l.requests[ip] = append(hits, now)
	return true
}

func clientIP(r *http.Request) string {
	if host, _, err := net.SplitHostPort(r.RemoteAddr); err == nil {
		return host
	}

	return r.RemoteAddr
}

func withRateLimit(limiter *rateLimiter, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !limiter.allow(clientIP(r)) {
			httpHandler.WriteErrorPublic(w, http.StatusTooManyRequests, "too many requests, please try again later")
			return
		}

		next.ServeHTTP(w, r)
	})
}
