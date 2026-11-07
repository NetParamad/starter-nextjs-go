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

	if cfg.App.Env == "production" {
		slog.Error("cannot seed demo data in production environment")
		os.Exit(1)
	}

	// Force enable seed for this manual seed command
	cfg.Demo.SeedEnabled = true

	ctx := context.Background()
	db, err := repository.NewPostgresPool(ctx, cfg)
	if err != nil {
		slog.Error("failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	slog.Info("seeding demo data", "email", cfg.Demo.Email, "username", cfg.Demo.Username)
	if err := repository.SeedDemoData(ctx, db, cfg); err != nil {
		slog.Error("failed to seed demo data", "error", err)
		os.Exit(1)
	}

	slog.Info("demo data seeded successfully")
}
