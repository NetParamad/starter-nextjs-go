package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/netparamad/template-nextjs-go/backend/internal/config"
)

func NewPostgresPool(ctx context.Context, cfg config.Config) (*pgxpool.Pool, error) {
	poolConfig, err := pgxpool.ParseConfig(cfg.DatabaseURL())
	if err != nil {
		return nil, err
	}

	maxConns := int32(cfg.DB.MaxConns)
	if maxConns <= 0 {
		maxConns = 10
	}
	minConns := int32(cfg.DB.MinConns)
	if minConns < 0 {
		minConns = 0
	}

	poolConfig.MaxConns = maxConns
	poolConfig.MinConns = minConns
	poolConfig.MaxConnLifetime = 30 * time.Minute
	poolConfig.MaxConnIdleTime = 5 * time.Minute

	if poolConfig.ConnConfig.RuntimeParams == nil {
		poolConfig.ConnConfig.RuntimeParams = make(map[string]string)
	}
	// Enterprise safeguards: abort runaway statements and dangling transactions
	poolConfig.ConnConfig.RuntimeParams["statement_timeout"] = "5000"
	poolConfig.ConnConfig.RuntimeParams["idle_in_transaction_session_timeout"] = "10000"

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return nil, err
	}

	if err := pingWithRetry(ctx, pool); err != nil {
		pool.Close()
		return nil, err
	}

	return pool, nil
}

// pingWithRetry tolerates a database that is still booting (e.g. a fresh
// `docker compose up`), instead of failing the process on the first refused
// connection.
func pingWithRetry(ctx context.Context, pool *pgxpool.Pool) error {
	const maxAttempts = 15
	const delay = 2 * time.Second

	var err error
	for attempt := 1; attempt <= maxAttempts; attempt++ {
		if err = pool.Ping(ctx); err == nil {
			return nil
		}

		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(delay):
		}
	}

	return fmt.Errorf("postgres not reachable after %d attempts: %w", maxAttempts, err)
}
