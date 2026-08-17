# Architecture

## Overview

ASCII Studio is a three-tier full-stack application:

- **Client** — React + Vite SPA, styled with Tailwind CSS, talks to the API over REST/JSON (and `multipart/form-data` for uploads).
- **Server** — Node.js + Express REST API. Stateless (JWT auth), horizontally scalable.
- **Database** — MySQL 8, accessed exclusively through parameterized queries via `mysql2`.

## System Diagram

```mermaid
flowchart LR
    subgraph Browser
        UI[React SPA<br/>Vite + Tailwind]
    end

    subgraph Server["Node.js / Express API"]
        AUTH[Auth Controller<br/>JWT + bcrypt]
        ASCII[ASCII Controller<br/>sharp conversion engine]
        ART[Artwork Controller]
        SHARE[Share Controller]
        MW[Middleware<br/>helmet, cors, rate-limit, requireAuth]
    end

    subgraph Data["MySQL 8"]
        USERS[(users)]
        ARTWORKS[(artworks)]
        SHARED[(shared_artworks)]
    end

    UI -- "REST / JSON<br/>multipart uploads" --> MW
    MW --> AUTH
    MW --> ASCII
    MW --> ART
    MW --> SHARE

    AUTH --> USERS
    ART --> ARTWORKS
    SHARE --> SHARED
    ART -.FK.-> USERS
    SHARED -.FK.-> ARTWORKS
```

## Request Flow (typical authenticated request)

1. Client attaches `Authorization: Bearer <JWT>` header (added automatically by the Axios interceptor).
2. Express middleware chain runs: `helmet` → `cors` → rate limiter → route-specific `requireAuth`.
3. `requireAuth` verifies the JWT and attaches `req.user`.
4. Controller delegates to a service module, which performs parameterized SQL queries.
5. Centralized error handler formats any thrown `AppError` into a consistent JSON error response; unexpected errors are logged server-side and never leak stack traces to the client.

## Why this structure

- **Layered backend** (`routes → controllers → services → db`) keeps HTTP concerns separate from business logic, which is what makes the Jest/Supertest suite able to exercise real business logic through the HTTP layer without duplicating it.
- **Stateless JWT auth** means the API can be scaled behind a load balancer without sticky sessions.
- **In-memory image processing** (`multer.memoryStorage()` + `sharp`) avoids ever writing user-uploaded files to disk — nothing to clean up, nothing to accidentally commit to git.

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant C as React Client
    participant A as Express API
    participant DB as MySQL

    U->>C: Submit login form
    C->>A: POST /api/auth/login {email, password}
    A->>DB: SELECT user WHERE email = ?
    DB-->>A: user row (password_hash)
    A->>A: bcrypt.compare(password, hash)
    alt credentials valid
        A->>A: sign JWT {id, email}
        A-->>C: 200 {user, token}
        C->>C: store token in localStorage
        C-->>U: redirect to /dashboard
    else invalid
        A-->>C: 401 Invalid email or password
        C-->>U: show error
    end

    Note over C,A: Subsequent requests attach<br/>Authorization: Bearer token
    C->>A: GET /api/artworks (Bearer token)
    A->>A: requireAuth middleware verifies JWT
    A->>DB: SELECT artworks WHERE user_id = ?
    DB-->>A: rows
    A-->>C: 200 {artworks}
```
