package migrations

import "embed"

// Files embeds all up-migration SQL files for automated schema application.
//
//go:embed *.up.sql
var Files embed.FS
