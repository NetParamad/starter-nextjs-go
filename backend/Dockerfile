FROM golang:1.25.1-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /template-nextjs-go-api ./cmd/api

FROM alpine:3.21 AS runner

RUN adduser -D -u 10001 appuser
WORKDIR /app

COPY --from=builder /template-nextjs-go-api /usr/local/bin/template-nextjs-go-api

EXPOSE 8080

USER appuser

CMD ["template-nextjs-go-api"]
