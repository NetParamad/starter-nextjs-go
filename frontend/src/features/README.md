# Features

This folder is now organized by domain instead of by technical layer.

- `auth/`: auth APIs, hooks, forms, and session logic
- `dashboard/`: private owner views and analytics-facing screens
- `home/`: landing-page sections and composition
- `shared/`: cross-feature infrastructure such as query client and stores

Recommended pattern inside each feature:

- `api/`
- `hooks/`
- `services/`
- `store/`
- `types/`
