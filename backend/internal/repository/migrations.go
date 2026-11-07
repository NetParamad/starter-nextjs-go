package repository

import (
	"context"
	"fmt"
	"log/slog"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/netparamad/template-nextjs-go/backend/migrations"
)

const migrationAdvisoryLockID = 847291048201

func RunMigrations(ctx context.Context, db *pgxpool.Pool) error {
	// 1. Acquire advisory lock so concurrent pods don't execute migrations in parallel
	if _, err := db.Exec(ctx, "SELECT pg_advisory_lock($1)", migrationAdvisoryLockID); err != nil {
		return fmt.Errorf("acquire migration advisory lock: %w", err)
	}
	defer func() {
		_, _ = db.Exec(context.Background(), "SELECT pg_advisory_unlock($1)", migrationAdvisoryLockID)
	}()

	// 2. Ensure schema_migrations history table exists
	_, err := db.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version VARCHAR(255) PRIMARY KEY,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
	`)
	if err != nil {
		return fmt.Errorf("ensure schema_migrations table: %w", err)
	}

	// 3. Read applied versions
	rows, err := db.Query(ctx, "SELECT version FROM schema_migrations")
	if err != nil {
		return fmt.Errorf("fetch applied migrations: %w", err)
	}
	defer rows.Close()

	applied := make(map[string]bool)
	for rows.Next() {
		var v string
		if err := rows.Scan(&v); err != nil {
			return fmt.Errorf("scan applied migration version: %w", err)
		}
		applied[v] = true
	}
	if err := rows.Err(); err != nil {
		return fmt.Errorf("iterate applied migrations: %w", err)
	}

	// 4. Collect migration files from shared embedded migrations package
	entries, err := migrations.Files.ReadDir(".")
	if err != nil {
		return fmt.Errorf("read embedded migrations: %w", err)
	}

	fileNames := make([]string, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		name := entry.Name()
		if strings.HasSuffix(name, ".up.sql") {
			fileNames = append(fileNames, name)
		}
	}

	sort.Strings(fileNames)

	// 5. Apply unapplied migrations inside individual transactions
	for _, fileName := range fileNames {
		if applied[fileName] {
			continue
		}

		slog.Info("applying database migration", "version", fileName)
		sqlBytes, err := migrations.Files.ReadFile(fileName)
		if err != nil {
			return fmt.Errorf("read migration file %s: %w", fileName, err)
		}

		tx, err := db.Begin(ctx)
		if err != nil {
			return fmt.Errorf("begin transaction for migration %s: %w", fileName, err)
		}

		if _, err := tx.Exec(ctx, string(sqlBytes)); err != nil {
			_ = tx.Rollback(ctx)
			return fmt.Errorf("exec migration %s: %w", fileName, err)
		}

		if _, err := tx.Exec(ctx, "INSERT INTO schema_migrations (version) VALUES ($1)", fileName); err != nil {
			_ = tx.Rollback(ctx)
			return fmt.Errorf("record migration %s: %w", fileName, err)
		}

		if err := tx.Commit(ctx); err != nil {
			return fmt.Errorf("commit migration %s: %w", fileName, err)
		}
		slog.Info("database migration applied successfully", "version", fileName)
	}

	return nil
}
