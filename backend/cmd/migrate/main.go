package main

import (
	"context"
	"log/slog"
	"os"

	"github.com/joho/godotenv"
	"github.com/netparamad/template-nextjs-go/backend/internal/config"
	"github.com/netparamad/template-nextjs-go/backend/internal/repository"
)

func main() {
	_ = godotenv.Load()

	cfg := config.Load()
	if cfg.App.Env == "production" {
		slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
	} else {
		slog.SetDefault(slog.New(slog.NewTextHandler(os.Stdout, nil)))
	}

	ctx := context.Background()
	db, err := repository.NewPostgresPool(ctx, cfg)
	if err != nil {
		slog.Error("failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	slog.Info("running database migrations", "database", cfg.DB.Name)
	if err := repository.RunMigrations(ctx, db); err != nil {
		slog.Error("failed to run database migrations", "error", err)
		os.Exit(1)
	}

	slog.Info("database migrations completed successfully")
}
