# ARTLINE — Alkotói útvonal

Privát idővonal zenei, videós és kreatív projektekhez.

A felhasználó Google-fiókkal belép, és rögzíti saját alkotói projektjeit: cím, leírás, kezdési év + hónap, külső linkek (YouTube, Spotify, SoundCloud stb.), dalszöveg, készítési mód. A projektek év/hónap szerint csoportosított idővonalon jelennek meg.

---

## Tech stack

| Réteg | Technológia |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Stílus | Tailwind CSS (Honda Yellow dark téma) |
| API | Apollo Client — GraphQL (`/graphql`), minimális REST (auth) |
| Állapotkezelés | Zustand (auth state) |
| Formok | react-hook-form + zod |
| Konténer | Docker + nginx |

---

## Fejlesztői környezet

### Előfeltételek

- Node.js 22+
- Futó backend (`http://localhost:8080` alapértelmezetten)

### Indítás

```bash
npm install
npm run dev
```

Az alkalmazás elérhető: `http://localhost:5173`

Login oldal: `http://localhost:5173/login.html`

### Build

```bash
npm run build
```

A kimenet a `dist/` könyvtárba kerül.

---

## Konfiguráció

### Fejlesztéshez

Hozz létre egy `.env.local` fájlt:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### Prioritási sorrend futásidőben

| Prioritás | Forrás | Hogyan |
|---|---|---|
| 1. | `window.__ENV__.API_BASE_URL` | Docker entrypoint injektálja (`env-config.js`) |
| 2. | `VITE_API_BASE_URL` | Vite build-time env változó |
| 3. | `http://localhost:8080` | Hardkódolt fallback |

---

## Docker

### Build

```bash
docker build -t artline-frontend .
```

### Futtatás

```bash
docker run -p 80:80 \
  -e API_BASE_URL=https://api.example.com \
  artline-frontend
```

Az alkalmazás elérhető: `http://localhost`

### Health check

```
GET http://localhost/health → 200 ok
```

---

## GitHub Actions — Release pipeline

A `.github/workflows/release.yml` workflow `v*.*.*` formátumú tag pushnál fut:

1. **Docker image build** → push a GitHub Container Registrybe (`ghcr.io`)
2. **GitHub Release** létrehozása auto-generated release notes-szal

### Új verzió kiadása

```bash
git tag v1.0.0
git push origin v1.0.0
```

A Docker image elérhetővé válik:

```bash
docker pull ghcr.io/<owner>/artline-frontend:v1.0.0
```

---

## GraphQL codegen

Ha fut a backend, a TypeScript típusok regenerálhatók:

```bash
npm run codegen
```

Ez a `src/gql/` könyvtárba generál típusokat az `external/schema.graphql` alapján.

> A projekt codegen nélkül is fordul — a `src/types.ts` manuálisan karbantartott típusokat tartalmaz.

---

## Projekt struktúra

```
src/
├── main.tsx                  — app belépőpont (login.html / index.html routing)
├── types.ts                  — GraphQL TypeScript típusok
├── styles.css                — Tailwind + Honda Yellow dark CSS változók
├── lib/
│   ├── apollo.ts             — Apollo Client konfiguráció
│   ├── auth.ts               — Google login, logout, /auth/me fetch
│   ├── config.ts             — API_BASE_URL konfiguráció
│   └── months.ts             — Magyar hónapnevek
├── stores/
│   └── auth-store.ts         — Zustand auth state
├── graphql/
│   └── creative-projects.ts  — GraphQL query/mutation dokumentumok
├── components/
│   ├── project-dialog.tsx    — CRUD modal (létrehozás / szerkesztés / törlés)
│   └── ui/                   — button, card, field, input, select, textarea
└── pages/
    ├── login-page.tsx         — Google login oldal
    └── timeline-page.tsx      — Alkotói idővonal
```

---

## Backend API

A backend REST és GraphQL endpointokat biztosít. Specifikáció: `external/openapi.yaml` és `external/schema.graphql`.

| Endpoint | Leírás |
|---|---|
| `GET /auth/google/login` | Google OAuth redirect |
| `GET /auth/google/callback` | OAuth callback, session cookie beállítása |
| `POST /auth/logout` | Session törlése |
| `GET /auth/me` | Bejelentkezett felhasználó adatai |
| `POST /graphql` | GraphQL endpoint (projektek CRUD) |

Autentikáció: `artline_session` httpOnly cookie.
