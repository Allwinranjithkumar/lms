# Smart Learning Platform Backend

Express API for the JAWA EDTECH learning platform, backed by **PostgreSQL via Prisma**. It powers auth, dashboards, courses, assignments, resources, messages, notifications, certificates, and AI assistant flows.

## Setup

```powershell
npm install
copy .env.example .env          # then set DATABASE_URL (default matches docker-compose)

# Start Postgres (from the repo root)
docker compose up -d

# Create the schema and generate the Prisma client
npx prisma migrate dev --name init

# Load demo data
npm run seed

npm start
```

The API runs on `http://localhost:8000` by default.

### Database

- Schema lives in `prisma/schema.prisma`; the Prisma client singleton is in `src/db/prisma.js`.
- `DATABASE_URL` points Prisma at Postgres (see `docker-compose.yml` for a local instance).
- Writes use `prisma.$transaction` for atomicity; `loadStore()` in `src/utils/store.js` returns a
  consistent snapshot shaped like the former JSON store so response bodies are unchanged.
- Reseed anytime with `npm run seed` (wipes and reloads demo content).

## Demo Users

All seeded users use `password123`.

- Teacher: `teacher@smartlearn.test`
- Student: `student@smartlearn.test`

## Key Routes

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/courses`
- `POST /api/courses`
- `PATCH /api/courses/:id`
- `POST /api/courses/:id/enroll`
- `GET /api/student/dashboard`
- `GET /api/teacher/dashboard`
- `GET /api/teacher/students`
- `GET /api/assignments`
- `POST /api/assignments`
- `POST /api/assignments/:id/submit`
- `PATCH /api/submissions/:id/grade`
- `GET /api/live-classes`
- `POST /api/live-classes`
- `GET /api/resources`
- `POST /api/resources`
- `GET /api/messages/conversations`
- `POST /api/messages`
- `GET /api/notifications`
- `PATCH /api/notifications/read-all`
- `GET /api/certificates`
- `POST /api/certificates/issue`
- `GET /api/analytics/teacher`
- `POST /api/ai/teacher-tool`
- `POST /api/ai/student-assistant`

Set `ANTHROPIC_API_KEY` in `.env` to enable live AI responses. Without it, the AI routes return a structured local placeholder so the UI can still be tested.
