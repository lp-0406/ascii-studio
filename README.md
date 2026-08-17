# ASCII Studio

**Turn Pixels Into Characters.**

A full-stack web application that lets authenticated users upload images, convert them into ASCII art with fully customizable settings, save their artwork, browse their history, and share or download their creations.

---

## 1. Problem Statement

Turning an image into ASCII art is a classic programming exercise, but it's usually presented as a single throwaway script: run it once, get a text file, done. There's no way to save your favorites, tweak settings and compare results, share what you made with someone else, or come back to your work later — and no demonstration of how such a feature would actually be built, secured, and shipped as part of a real product.

## 2. Solution

ASCII Studio turns the ASCII-conversion algorithm into a proper multi-user product: a React frontend for uploading and tuning conversions, an authenticated Express/MySQL backend that performs the real pixel-by-pixel conversion server-side, persistent per-user artwork history, and public sharable links — all wrapped in the DevOps practices (Docker, automated tests, Jenkins CI/CD) that a real engineering team would use to ship and operate it.

## 3. Features

- Email/password authentication with JWT + bcrypt
- Drag-and-drop image upload (JPG/PNG/WEBP, up to 5MB)
- Real, server-side ASCII conversion engine (not a canned/fake output) with adjustable width, character set, invert, brightness, and contrast
- Save generated artwork to a personal history
- Dashboard with totals and recent artwork
- Search artwork history
- Download artwork as `.txt`
- Public share links for individual artworks (private by default)
- Centralized error handling, rate limiting, security headers
- Dockerized full stack (React + Express + MySQL)
- Jenkins CI/CD pipeline: lint → test → build → Docker build → integration smoke test → deploy

## 4. Architecture

See [`docs/architecture.md`](docs/architecture.md) for the full system diagram, request flow, and authentication sequence diagram. In short:

```
React (Vite + Tailwind)  →  Express REST API  →  MySQL 8
      client/                    server/          database/
```

## 5. Tech Stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Axios
**Backend:** Node.js, Express, JWT, bcrypt, multer, sharp, helmet, express-rate-limit, cors, dotenv
**Database:** MySQL 8 via `mysql2` (parameterized queries, FKs, indexes)
**Testing:** Jest, Supertest
**DevOps:** Docker, Docker Compose, Jenkins (declarative pipeline, Linux + Windows agent support)

## 6. Database Schema

See [`docs/database.md`](docs/database.md) for the full ER diagram and column reference. Three tables: `users`, `artworks` (FK → users), `shared_artworks` (FK → artworks).

## 7. API Endpoints

See [`docs/api.md`](docs/api.md) for the full reference. Summary:

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

POST   /api/ascii/generate

GET    /api/artworks
GET    /api/artworks/:id
POST   /api/artworks
PUT    /api/artworks/:id
DELETE /api/artworks/:id
POST   /api/artworks/:id/share

GET    /api/share/:token
GET    /api/health
```

## 8. Authentication

JWTs are signed on register/login and sent as `Authorization: Bearer <token>`. Passwords are hashed with bcrypt (never stored in plaintext). Protected routes run through a `requireAuth` middleware that verifies the token and attaches `req.user`. Every artwork/share operation additionally checks resource ownership, returning `403` if a user tries to touch someone else's artwork.

## 9. ASCII Conversion Process

See [`docs/ascii-engine.md`](docs/ascii-engine.md). Briefly: the uploaded image is resized (aspect-ratio-corrected for monospace character proportions), converted to grayscale with `sharp`, and every pixel's brightness (after brightness/contrast adjustment) is mapped to a character in the chosen ramp. This happens entirely server-side, in memory, per request.

## 10. Local Setup (without Docker)

Requires Node.js 18+, npm, and a running MySQL 8 server.

```bash
git clone <your-repo-url>
cd ASCII-Studio

# Install all dependencies (root, server, client)
npm run install:all

# Create the database
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql   # optional demo data

# Configure environment
cp .env.example server/.env
# edit server/.env with your DB credentials and a real JWT_SECRET

# Run frontend + backend together
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173 (proxies `/api` to the backend)

## 11. Docker Setup

```bash
cp .env.example .env   # fill in real DB/JWT secrets
docker compose up --build
```

- App: http://localhost
- API health check: http://localhost:5000/api/health

See [`docs/docker.md`](docs/docker.md) for service details and healthchecks.

## 12. Jenkins Setup

See [`docs/jenkins.md`](docs/jenkins.md) for full instructions: required plugins/tools, how to create the Pipeline job, credential setup, and GitHub webhook configuration for automatic builds on push.

## 13. CI/CD Pipeline

The `Jenkinsfile` runs: **Checkout → Install Dependencies → Lint → Test → Build Frontend → Build Backend → Docker Build → Integration Test (docker compose + smoke test) → Deploy** (on `main` only). The build fails fast at any stage that fails — nothing is silently skipped or bypassed. See [`docs/jenkins.md`](docs/jenkins.md) for the full diagram.

## 14. Environment Variables

See [`.env.example`](.env.example) for the full list (`PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `MAX_UPLOAD_SIZE_MB`, `UPLOAD_DIR`). Never commit a real `.env` file — only `.env.example` is tracked in git.

## 15. Testing

```bash
npm test --prefix server
```

24 Jest/Supertest tests covering:
- **Auth**: register, duplicate email rejection, login, invalid login, protected route access
- **ASCII**: upload + conversion, invalid file type rejection, oversized file rejection, custom settings
- **Artwork**: create, list (scoped to owner), retrieve, update, delete, unauthorized-access rejection
- **Sharing**: create share link, public access to shared artwork, rejection of unknown/unshared tokens

All 24 tests were run and passed against a real MySQL 8 instance as part of building this project (see verification notes below).

## 16. Deployment

For a simple local/demo deployment, the Jenkins pipeline's `Deploy` stage runs `docker compose down` followed by `docker compose up -d --build`, then re-checks `/api/health`. For a real production deployment you would additionally want: a managed MySQL instance (not the bundled container), a reverse proxy/TLS termination in front of `client`/`server`, and secrets sourced from a proper secrets manager rather than `.env`.

## 17. Demo Credentials

Loaded by `database/seed.sql` — **development/demo use only, never real credentials**:

| Email | Password | Role |
|---|---|---|
| admin@asciistudio.dev | Demo@1234 | Admin (demo) |
| alice@asciistudio.dev | Demo@1234 | User |
| bob@asciistudio.dev | Demo@1234 | User |
| carol@asciistudio.dev | Demo@1234 | User |

> **Before using the seed data for a live demo**, regenerate the bcrypt hash for `Demo@1234` locally (`node -e "console.log(require('bcrypt').hashSync('Demo@1234', 10))"` from `server/`) and paste it into `database/seed.sql` — the placeholder hash included in the repo was not verified against a running bcrypt install in this build environment.

## 18. Screenshots

_Add screenshots of the Landing page, Generator, Dashboard, and Artwork History here before presenting._

## 19. Future Improvements

- Color ASCII output (map RGB to ANSI/HTML-colored characters)
- Animated GIF → ASCII frame sequences
- Public gallery / discovery feed of shared artworks
- Rate-limited anonymous "try it" generator on the landing page
- Refresh tokens + token revocation list for stronger session control
- CDN-backed asset delivery for the client build

## 20. Project Structure

```
ASCII-Studio/
├── client/            React frontend (Vite + Tailwind)
├── server/             Express backend + Jest tests
├── database/           schema.sql, seed.sql
├── docker/              Dockerfiles + nginx config
├── docs/                 architecture, database, api, ascii-engine, docker, jenkins docs
├── uploads/              (empty at rest - uploads are processed in-memory)
├── Jenkinsfile
├── docker-compose.yml
└── README.md
```

## Build/Verification Notes (for the record)

This project was built and verified in a sandboxed Linux environment that had Node.js, npm, and apt access, but **no Docker daemon and no running Jenkins instance**. To still validate real behavior rather than just writing code:

- A real MySQL 8 server was installed and run locally; the schema was applied and the full backend test suite (24 tests) was executed against it and passed.
- The React app was built for production (`vite build`) successfully and linted clean.
- The backend was linted clean and manually smoke-tested (`/api/health` returned `200` with `"database": "connected"`).
- `docker-compose.yml` was validated for correct YAML syntax, but `docker compose up --build` itself was not run in this environment — please run it yourself once Docker is available, and open an issue/fix forward if anything doesn't come up cleanly.
- The `Jenkinsfile` was written to the declarative pipeline spec and reviewed for correctness, but was not executed against a live Jenkins controller.
