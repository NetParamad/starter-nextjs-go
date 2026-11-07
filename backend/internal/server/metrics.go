package server

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/collectors"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

type Metrics struct {
	Registry     *prometheus.Registry
	httpRequests *prometheus.CounterVec
	httpDuration *prometheus.HistogramVec
	inflight     prometheus.Gauge
}

func NewMetrics(db *pgxpool.Pool) *Metrics {
	reg := prometheus.NewRegistry()

	// Standard Go runtime & process metrics
	reg.MustRegister(collectors.NewProcessCollector(collectors.ProcessCollectorOpts{}))
	reg.MustRegister(collectors.NewGoCollector())

	httpRequests := prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests processed, partitioned by method, route, and status code.",
		},
		[]string{"method", "route", "status"},
	)

	httpDuration := prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "Histogram of response latency for HTTP requests in seconds.",
			Buckets: []float64{0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10},
		},
		[]string{"method", "route", "status"},
	)

	inflight := prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "http_requests_in_flight",
			Help: "Current number of in-flight HTTP requests.",
		},
	)

	reg.MustRegister(httpRequests, httpDuration, inflight)

	if db != nil {
		reg.MustRegister(newDBCollector(db))
	}

	return &Metrics{
		Registry:     reg,
		httpRequests: httpRequests,
		httpDuration: httpDuration,
		inflight:     inflight,
	}
}

func (m *Metrics) Handler() http.Handler {
	return promhttp.HandlerFor(m.Registry, promhttp.HandlerOpts{})
}

func (m *Metrics) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/metrics" || r.URL.Path == "/livez" || r.URL.Path == "/readyz" {
			next.ServeHTTP(w, r)
			return
		}

		m.inflight.Inc()
		defer m.inflight.Dec()

		start := time.Now()
		rec := &statusRecorder{ResponseWriter: w, statusCode: http.StatusOK}

		next.ServeHTTP(rec, r)

		duration := time.Since(start).Seconds()
		status := strconv.Itoa(rec.statusCode)
		route := normalizeRoute(r.URL.Path)

		m.httpRequests.WithLabelValues(r.Method, route, status).Inc()
		m.httpDuration.WithLabelValues(r.Method, route, status).Observe(duration)
	})
}

func normalizeRoute(path string) string {
	switch {
	case strings.HasPrefix(path, "/api/v1/auth/"):
		return path
	case path == "/health":
		return "/health"
	default:
		return "other"
	}
}

type dbCollector struct {
	db          *pgxpool.Pool
	totalConns  *prometheus.Desc
	idleConns   *prometheus.Desc
	activeConns *prometheus.Desc
	maxConns    *prometheus.Desc
}

func newDBCollector(db *pgxpool.Pool) prometheus.Collector {
	return &dbCollector{
		db: db,
		totalConns: prometheus.NewDesc(
			"db_pool_total_connections",
			"Current total connections in the database pool.",
			nil, nil,
		),
		idleConns: prometheus.NewDesc(
			"db_pool_idle_connections",
			"Current idle connections in the database pool.",
			nil, nil,
		),
		activeConns: prometheus.NewDesc(
			"db_pool_acquired_connections",
			"Current acquired/in-use connections in the database pool.",
			nil, nil,
		),
		maxConns: prometheus.NewDesc(
			"db_pool_max_connections",
			"Maximum configured connections in the database pool.",
			nil, nil,
		),
	}
}

func (c *dbCollector) Describe(ch chan<- *prometheus.Desc) {
	ch <- c.totalConns
	ch <- c.idleConns
	ch <- c.activeConns
	ch <- c.maxConns
}

func (c *dbCollector) Collect(ch chan<- prometheus.Metric) {
	stat := c.db.Stat()
	ch <- prometheus.MustNewConstMetric(c.totalConns, prometheus.GaugeValue, float64(stat.TotalConns()))
	ch <- prometheus.MustNewConstMetric(c.idleConns, prometheus.GaugeValue, float64(stat.IdleConns()))
	ch <- prometheus.MustNewConstMetric(c.activeConns, prometheus.GaugeValue, float64(stat.AcquiredConns()))
	ch <- prometheus.MustNewConstMetric(c.maxConns, prometheus.GaugeValue, float64(stat.MaxConns()))
}
