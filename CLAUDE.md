# CLAUDE.md

## Project
PrismHR People Hub — internal HRIS for employee directories and department structure. See `PRD.md`.

## Tech Stack
- Next.js 14+ App Router, Supabase (PostgreSQL + Auth), Tailwind CSS, Vercel

## Commands
```bash
npm run dev    # dev server
npm run build  # production build
npm run lint
npm run seed   # seed test data
```

## Architecture

### Routes
```
app/
  (auth)/login/
  (protected)/
    page.tsx           # Dashboard
    employees/         # CRUD + /[id]/edit
    departments/       # /departments, /[id]
```

### Auth & RBAC
- Roles in `auth.users.app_metadata.role`: `admin` | `employee`
- No custom roles table — use `app_metadata` directly
- RLS enforces roles at DB level
- Admin: full CRUD; Employee: read-only

### Data Models
**`employees`**: id, first_name, last_name, email (unique), job_title, department_id→departments, start_date, status (active/inactive), avatar_url, created_at

**`departments`**: id, name (unique), description, head_id→employees (nullable), created_at

## Linear
Team: **SanctifAI Dev** | Project: **prismhr-people-hub**
