package main

import (
	"context"
	"log"
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
	if err := cfg.ValidateProduction(); err != nil {
		log.Fatalf("invalid production configuration: %v", err)
	}
	ctx := context.Background()

	db, err := repository.NewPostgresPool(ctx, cfg)
	if err != nil {
		log.Fatalf("failed to connect to postgres: %v", err)
	}
	defer db.Close()

	if err := repository.RunMigrations(ctx, db); err != nil {
		log.Fatalf("failed to run database migrations: %v", err)
	}

	if err := repository.SeedDemoData(ctx, db, cfg); err != nil {
		log.Fatalf("failed to seed demo data: %v", err)
	}

	srv := &http.Server{
		Addr:              cfg.Address(),
		Handler:           server.NewRouter(cfg, db),
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Printf("starting %s on %s", cfg.App.Name, cfg.Address())
	log.Printf("database url configured for %s", cfg.DB.Name)

	serverErrors := make(chan error, 1)
	go func() {
		serverErrors <- srv.ListenAndServe()
	}()

	shutdownSignals := make(chan os.Signal, 1)
	signal.Notify(shutdownSignals, syscall.SIGINT, syscall.SIGTERM)

	select {
	case err := <-serverErrors:
		if err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	case sig := <-shutdownSignals:
		log.Printf("received %s, shutting down %s", sig.String(), cfg.App.Name)
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := srv.Shutdown(shutdownCtx); err != nil {
			log.Fatalf("graceful shutdown failed: %v", err)
		}
	}
}
