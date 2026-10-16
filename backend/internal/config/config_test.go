package config

import "testing"

func TestGetEnvAsSliceTrimsValues(t *testing.T) {
	t.Setenv("CORS_ALLOWED_ORIGINS", " http://localhost:3000, https://example.com ,")

	values := getEnvAsSlice("CORS_ALLOWED_ORIGINS", []string{"fallback"})

	if len(values) != 2 {
		t.Fatalf("expected 2 origins, got %d", len(values))
	}

	if values[0] != "http://localhost:3000" {
		t.Fatalf("unexpected first origin: %s", values[0])
	}

	if values[1] != "https://example.com" {
		t.Fatalf("unexpected second origin: %s", values[1])
	}
}

func TestValidateProductionRejectsPlaceholderSecret(t *testing.T) {
	t.Setenv("APP_ENV", "production")
	t.Setenv("JWT_ACCESS_SECRET", "change-me-access")

	if err := Load().ValidateProduction(); err == nil {
		t.Fatal("expected placeholder secret to be rejected in production")
	}
}

func TestValidateProductionAllowsDevelopmentDefaults(t *testing.T) {
	t.Setenv("APP_ENV", "development")
	t.Setenv("JWT_ACCESS_SECRET", "change-me-access")

	if err := Load().ValidateProduction(); err != nil {
		t.Fatalf("expected development defaults to pass, got %v", err)
	}
}

func TestLoadUsesConfiguredAppName(t *testing.T) {
	t.Setenv("APP_NAME", "Template Next.js Go API")

	cfg := Load()

	if cfg.App.Name != "Template Next.js Go API" {
		t.Fatalf("expected app name to be loaded, got %q", cfg.App.Name)
	}
}
