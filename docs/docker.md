# Docker

## Services

`docker-compose.yml` defines three services:

| Service | Image/Build | Port | Purpose |
|---|---|---|---|
| `mysql` | `mysql:8.0` | 3306 | Database, auto-initialized from `database/schema.sql` and `database/seed.sql` |
| `server` | `docker/server.Dockerfile` | 5000 | Express API |
| `client` | `docker/client.Dockerfile` (multi-stage → nginx) | 80 | Static React build served by nginx, proxies `/api/*` to `server` |

## Running

```bash
cp .env.example .env   # fill in real secrets for production use
docker compose up --build
```

Then visit `http://localhost` for the app and `http://localhost:5000/api/health` for the API health check directly.

## Health checks

Both `server` and `client` containers define `HEALTHCHECK` instructions. `docker compose ps` will report `healthy`/`unhealthy` status, and `server` won't be considered ready until MySQL's own healthcheck (`mysqladmin ping`) passes, enforced via `depends_on: condition: service_healthy`.

## Why multi-stage for the client

The client Dockerfile builds the Vite production bundle in a `node:20` stage, then copies only the compiled `dist/` output into a lightweight `nginx:alpine` stage. This keeps the final client image small and avoids shipping Node.js, source files, or `node_modules` in production.

## Why `sharp` needs `libvips-dev`

`sharp` is a native binding around `libvips`. The `server.Dockerfile` installs `libvips-dev` before `npm install` so the correct prebuilt/native binary resolves cleanly on the `node:20-bookworm-slim` base image.

## Persisting data

MySQL data is persisted in the named volume `mysql_data`, so `docker compose down` (without `-v`) keeps your data between runs. Use `docker compose down -v` to fully reset the database.

## Note on this repository's own verification

This project's automated build/test process ran the Express API and its full Jest/Supertest suite against a real, natively-installed MySQL 8 server (not a container) because the environment used to build this repository did not have a Docker daemon available. The `docker-compose.yml` and Dockerfiles have been syntax-validated but should be smoke-tested with `docker compose up --build` in an environment with Docker installed before relying on them for deployment.
