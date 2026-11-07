APP_NAME=template-nextjs-go-api

.PHONY: run build fmt tidy lint test migrate seed sqlc

GOLANGCI_VERSION ?= v2.14.0

run:
	go run ./cmd/api

sqlc:
	sqlc generate

migrate:
	go run ./cmd/migrate

seed:
	go run ./cmd/seed

build:
	go build ./...

test:
	go test -v ./...

fmt:
	gofmt -w ./cmd ./internal

tidy:
	go mod tidy

lint:
	go run github.com/golangci/golangci-lint/v2/cmd/golangci-lint@$(GOLANGCI_VERSION) run ./...
