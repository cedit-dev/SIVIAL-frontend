# SinVial Backend

Backend API for SinVial Ocana. It uses Node.js, Express, TypeScript, PostgreSQL and PostGIS.

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The database contract is documented in `docs/database-schema.md`.

## Main endpoints

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/siniestros`
- `GET /api/siniestros/stats`
- `POST /api/siniestros/import`
- `GET /api/decretos`
- `POST /api/decretos`
- `GET /api/senales`

Protected write endpoints require `Authorization: Bearer <token>`.
