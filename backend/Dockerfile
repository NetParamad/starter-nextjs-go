FROM --platform=$BUILDPLATFORM golang:1.26-alpine AS builder

ARG TARGETOS
ARG TARGETARCH

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=${TARGETOS:-linux} GOARCH=${TARGETARCH:-amd64} go build -trimpath -ldflags="-s -w" -o /template-nextjs-go-api ./cmd/api
RUN CGO_ENABLED=0 GOOS=${TARGETOS:-linux} GOARCH=${TARGETARCH:-amd64} go build -trimpath -ldflags="-s -w" -o /template-nextjs-go-migrate ./cmd/migrate

# Google Distroless: zero shell, minimal attack surface, nonroot UID 65532, built-in ca-certificates
FROM gcr.io/distroless/static-debian12:nonroot AS runner

WORKDIR /app

COPY --from=builder /template-nextjs-go-api /template-nextjs-go-api
COPY --from=builder /template-nextjs-go-migrate /template-nextjs-go-migrate

EXPOSE 8080

USER nonroot:nonroot

ENTRYPOINT ["/template-nextjs-go-api"]
