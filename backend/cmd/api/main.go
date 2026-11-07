package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"github.com/netparamad/template-nextjs-go/backend/internal/config"
	"github.com/netparamad/template-nextjs-go/backend/internal/repository"
	"github.com/netparamad/template-nextjs-go/backend/internal/server"
)

func main() {
	// Load local development variables when an .env file is present.
	_ = godotenv.Load()

	cfg := config.Load()
	if cfg.App.Env == "production" {
		slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
	} else {
		slog.SetDefault(slog.New(slog.NewTextHandler(os.Stdout, nil)))
	}

	if err := cfg.ValidateProduction(); err != nil {
		slog.Error("invalid production configuration", "error", err)
		os.Exit(1)
	}
	ctx := context.Background()

	db, err := repository.NewPostgresPool(ctx, cfg)
	if err != nil {
		slog.Error("failed to connect to postgres", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	if cfg.App.AutoMigrate {
		if err := repository.RunMigrations(ctx, db); err != nil {
			slog.Error("failed to run database migrations", "error", err)
			os.Exit(1)
		}
	}

	if cfg.Demo.SeedEnabled {
		if cfg.App.Env == "production" {
			slog.Warn("skipping demo seed because APP_ENV is production")
		} else {
			if err := repository.SeedDemoData(ctx, db, cfg); err != nil {
				slog.Error("failed to seed demo data", "error", err)
				os.Exit(1)
			}
		}
	}

	srv := &http.Server{
		Addr:              cfg.Address(),
		Handler:           server.NewRouter(cfg, db),
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
		ReadHeaderTimeout: 5 * time.Second,
	}

	slog.Info("starting server", "app", cfg.App.Name, "address", cfg.Address(), "env", cfg.App.Env)

	serverErrors := make(chan error, 1)
	go func() {
		serverErrors <- srv.ListenAndServe()
	}()

	shutdownSignals := make(chan os.Signal, 1)
	signal.Notify(shutdownSignals, syscall.SIGINT, syscall.SIGTERM)

	select {
	case err := <-serverErrors:
		if err != nil && err != http.ErrServerClosed {
			slog.Error("server error", "error", err)
			os.Exit(1)
		}
	case sig := <-shutdownSignals:
		slog.Info("received shutdown signal", "signal", sig.String(), "app", cfg.App.Name)
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := srv.Shutdown(shutdownCtx); err != nil {
			slog.Error("graceful shutdown failed", "error", err)
			os.Exit(1)
		}
	}
}
