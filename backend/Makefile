APP_NAME=template-nextjs-go-api

.PHONY: run build fmt tidy lint

GOLANGCI_VERSION ?= v2.14.0

run:
	go run ./cmd/api

build:
	go build ./...

fmt:
	gofmt -w ./cmd ./internal

tidy:
	go mod tidy

lint:
	go run github.com/golangci/golangci-lint/v2/cmd/golangci-lint@$(GOLANGCI_VERSION) run ./...
