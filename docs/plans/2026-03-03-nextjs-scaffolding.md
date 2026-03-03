# Next.js Scaffolding Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bootstrap a working Next.js 14 App Router application with Supabase auth, route protection, and placeholder pages for every route in the PRD — runnable via `npm run dev` with no errors.

**Architecture:** App Router with route groups: `(auth)` for public login page, `(protected)` for all authenticated routes. Supabase client split into browser, server, and middleware variants. Middleware enforces auth on every protected route server-side. All pages are stubs — no data fetching yet, just the shell.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, @supabase/ssr, @supabase/supabase-js

---

## Task 1: Initialize Next.js App

**Files:**
- Create: (project root — `create-next-app` output)

**Step 1: Run create-next-app**

```bash
cd /Users/tylerthompson/Repository/Playground/prismhr-people-hub
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

When prompted, answer:
- "Would you like to use Turbopack?" → No (keep standard webpack for stability)
- Accept all other defaults

**Step 2: Verify it boots**

```bash
npm run dev
```

Expected: Server starts on http://localhost:3000 with no errors. Kill with Ctrl+C.

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: initialize Next.js 14 app with TypeScript, Tailwind, App Router"
```

---

## Task 2: Install Supabase Dependencies

**Files:**
- Modify: `package.json` (via npm install)

**Step 1: Install packages**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Step 2: Verify install**

```bash
npm ls @supabase/ssr @supabase/supabase-js
```

Expected: Both packages listed with no peer dependency errors.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add Supabase SSR dependencies"
```

---

## Task 3: Environment Variable Setup + Validation

**Files:**
- Create: `.env.local` (gitignored)
- Create: `lib/env.ts`

**Step 1: Create `.env.local`**

```bash
# .env.local — fill in real values from your Supabase project dashboard
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Leave the values blank for now — the validation in the next step will crash loudly if they're missing, which is correct behavior until real values are added.

**Step 2: Create `lib/env.ts`**

```typescript
// lib/env.ts
// Validates all required env vars at startup.
// Missing or empty values crash the process intentionally — fail fast.

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  supabaseUrl: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
}
```

**Step 3: Confirm `.env.local` is gitignored**

```bash
grep ".env.local" .gitignore
```

Expected: `.env.local` appears in the output. If not, add it:

```bash
echo ".env.local" >> .gitignore
```

**Step 4: Commit**

```bash
git add lib/env.ts .gitignore
git commit -m "feat: add env validation with fail-fast startup check"
```

---

## Task 4: Supabase Client Utilities

**Files:**
- Create: `lib/supabase/browser.ts`
- Create: `lib/supabase/server.ts`

**Step 1: Create browser client `lib/supabase/browser.ts`**

```typescript
// lib/supabase/browser.ts
// Used in Client Components ('use client')
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 2: Create server client `lib/supabase/server.ts`**

```typescript
// lib/supabase/server.ts
// Used in Server Components and Route Handlers
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookie setting is a no-op, middleware handles it
          }
        },
      },
    }
  )
}
```

**Step 3: Commit**

```bash
git add lib/supabase/
git commit -m "feat: add Supabase browser and server client utilities"
```

---

## Task 5: Auth Middleware (Route Protection)

**Files:**
- Create: `middleware.ts`

**Step 1: Create `middleware.ts`**

```typescript
// middleware.ts
// Runs on every matched request.
// Refreshes the Supabase session and redirects unauthenticated users to /login.
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isLoginPage = request.nextUrl.pathname === '/login'

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: add auth middleware with redirect for unauthenticated users"
```

---

## Task 6: Root Layout + Navigation Shell

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/(protected)/layout.tsx`
- Create: `components/nav.tsx`

**Step 1: Update root `app/layout.tsx`**

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PrismHR People Hub',
  description: 'Internal HRIS — employee directory and department management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

**Step 2: Create `components/nav.tsx`**

```typescript
// components/nav.tsx
// Top navigation bar shown on all protected pages.
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

export function Nav() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="border-b border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-semibold text-gray-900">PrismHR People Hub</span>
        <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</Link>
        <Link href="/employees" className="text-sm text-gray-600 hover:text-gray-900">Employees</Link>
        <Link href="/departments" className="text-sm text-gray-600 hover:text-gray-900">Departments</Link>
      </div>
      <button
        onClick={handleSignOut}
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        Sign out
      </button>
    </nav>
  )
}
```

**Step 3: Create `app/(protected)/layout.tsx`**

```typescript
// app/(protected)/layout.tsx
// Wraps all protected routes with the top nav.
import { Nav } from '@/components/nav'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add app/layout.tsx app/\(protected\)/layout.tsx components/nav.tsx
git commit -m "feat: add root layout, protected layout with nav shell"
```

---

## Task 7: Login Page

**Files:**
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/layout.tsx`

**Step 1: Create auth layout `app/(auth)/layout.tsx`**

```typescript
// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      {children}
    </div>
  )
}
```

**Step 2: Create login page `app/(auth)/login/page.tsx`**

```typescript
// app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">PrismHR People Hub</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add app/\(auth\)/
git commit -m "feat: add login page with Supabase email/password auth"
```

---

## Task 8: Placeholder Pages — Protected Routes

**Files:**
- Create: `app/(protected)/page.tsx`
- Create: `app/(protected)/employees/page.tsx`
- Create: `app/(protected)/employees/[id]/page.tsx`
- Create: `app/(protected)/employees/new/page.tsx`
- Create: `app/(protected)/employees/[id]/edit/page.tsx`
- Create: `app/(protected)/departments/page.tsx`
- Create: `app/(protected)/departments/[id]/page.tsx`

**Step 1: Dashboard `app/(protected)/page.tsx`**

```typescript
// app/(protected)/page.tsx
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-sm text-gray-500">Metrics coming soon.</p>
    </div>
  )
}
```

**Step 2: Employee directory `app/(protected)/employees/page.tsx`**

```typescript
// app/(protected)/employees/page.tsx
export default function EmployeesPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
      <p className="mt-2 text-sm text-gray-500">Directory coming soon.</p>
    </div>
  )
}
```

**Step 3: Employee profile `app/(protected)/employees/[id]/page.tsx`**

```typescript
// app/(protected)/employees/[id]/page.tsx
export default function EmployeeProfilePage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Employee Profile</h1>
      <p className="mt-2 text-sm text-gray-500">ID: {params.id}</p>
    </div>
  )
}
```

**Step 4: New employee form `app/(protected)/employees/new/page.tsx`**

```typescript
// app/(protected)/employees/new/page.tsx
export default function NewEmployeePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Add Employee</h1>
      <p className="mt-2 text-sm text-gray-500">Form coming soon.</p>
    </div>
  )
}
```

**Step 5: Edit employee form `app/(protected)/employees/[id]/edit/page.tsx`**

```typescript
// app/(protected)/employees/[id]/edit/page.tsx
export default function EditEmployeePage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Edit Employee</h1>
      <p className="mt-2 text-sm text-gray-500">ID: {params.id}</p>
    </div>
  )
}
```

**Step 6: Department list `app/(protected)/departments/page.tsx`**

```typescript
// app/(protected)/departments/page.tsx
export default function DepartmentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Departments</h1>
      <p className="mt-2 text-sm text-gray-500">Department list coming soon.</p>
    </div>
  )
}
```

**Step 7: Department detail `app/(protected)/departments/[id]/page.tsx`**

```typescript
// app/(protected)/departments/[id]/page.tsx
export default function DepartmentDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Department</h1>
      <p className="mt-2 text-sm text-gray-500">ID: {params.id}</p>
    </div>
  )
}
```

**Step 8: Commit all pages**

```bash
git add app/\(protected\)/
git commit -m "feat: add placeholder pages for all protected routes"
```

---

## Task 9: Seed Script Skeleton

**Files:**
- Create: `scripts/seed.ts`
- Modify: `package.json` (add seed script)

**Step 1: Create `scripts/seed.ts`**

```typescript
// scripts/seed.ts
// Seeds departments and employees into Supabase.
// Run with: npm run seed
// Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
}

const supabase = createClient(url, key)

async function seed() {
  console.log('Seed script ready — implementation coming in a future task.')
  // Departments and employees will be inserted here
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
```

**Step 2: Install dotenv (for seed script)**

```bash
npm install --save-dev dotenv tsx
```

**Step 3: Add seed script to `package.json`**

In `package.json`, add to the `"scripts"` section:

```json
"seed": "tsx scripts/seed.ts"
```

**Step 4: Verify seed runs without crashing**

```bash
npm run seed
```

Expected output:
```
Seed script ready — implementation coming in a future task.
```

**Step 5: Commit**

```bash
git add scripts/seed.ts package.json package-lock.json
git commit -m "feat: add seed script skeleton with env validation"
```

---

## Task 10: Final Verification

**Step 1: Fill in `.env.local` with real Supabase values**

Go to your Supabase project dashboard → Settings → API. Copy:
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Step 2: Run the dev server**

```bash
npm run dev
```

Expected: Server starts on http://localhost:3000 with no TypeScript or build errors.

**Step 3: Manual smoke test**

| Action | Expected Result |
|--------|----------------|
| Visit http://localhost:3000 | Redirected to /login |
| Visit http://localhost:3000/employees | Redirected to /login |
| Log in with valid Supabase credentials | Redirected to /dashboard |
| Click nav links | Each page loads with stub content |
| Click Sign out | Redirected back to /login |

**Step 4: Run lint**

```bash
npm run lint
```

Expected: No errors.

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: verify scaffolding complete and passing lint"
```

---

## Final Structure

```
prismhr-people-hub/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   └── login/page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    ← Dashboard
│   │   ├── employees/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/page.tsx
│   │   └── departments/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   ├── globals.css
│   └── layout.tsx
├── components/
│   └── nav.tsx
├── lib/
│   ├── env.ts
│   └── supabase/
│       ├── browser.ts
│       └── server.ts
├── middleware.ts
├── scripts/
│   └── seed.ts
├── docs/plans/
│   └── 2026-03-03-nextjs-scaffolding.md
├── .env.local              ← gitignored, fill in Supabase values
├── CLAUDE.md
└── PRD.md
```
