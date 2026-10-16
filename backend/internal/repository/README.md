Package `repository` holds database-backed implementations (`db.go`
connection pool, `migrations.go` runner, `demo_seed.go`, per-domain
repositories such as `user_repository.go`).

Add project-specific repositories in this package and wire them through
`internal/server/router.go` like the existing ones.
