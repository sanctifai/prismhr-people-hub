# Departments Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace both placeholder department pages with fully functional, data-driven UI — a sortable table overview and a detail page with a member roster.

**Architecture:** Both pages are React Server Components that fetch from Supabase server-side using `lib/supabase/server.ts`. Role is read from `supabase.auth.getUser()` → `app_metadata.role` to conditionally show admin controls. No client components needed.

**Tech Stack:** Next.js 14 App Router, Supabase SSR client (`@supabase/ssr`), Tailwind CSS, TypeScript

---

### Task 1: Department Overview Page (`/departments`)

**Files:**
- Modify: `app/(protected)/departments/page.tsx`

**Step 1: Replace placeholder with working server component**

Replace the entire file with:

```tsx
// app/(protected)/departments/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DepartmentsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = user?.app_metadata?.role === 'admin'

  const { data: departments } = await supabase
    .from('departments')
    .select(`
      id,
      name,
      description,
      head:head_id (
        first_name,
        last_name
      ),
      employees ( count )
    `)
    .order('name')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Departments</h1>
          <p className="mt-1 text-sm text-gray-500">
            {departments?.length ?? 0} department{departments?.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && (
          <button
            disabled
            title="Coming soon"
            className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed"
          >
            + New Department
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Head
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                Members
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {departments?.map((dept) => {
              const head = dept.head as { first_name: string; last_name: string } | null
              const count = (dept.employees as unknown as { count: number }[])?.[0]?.count ?? 0

              return (
                <tr
                  key={dept.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/departments/${dept.id}`}
                      className="block font-medium text-gray-900 hover:text-blue-600"
                    >
                      {dept.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {dept.description ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {head ? `${head.first_name} ${head.last_name}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-700">
                    {count}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

**Step 2: Verify in browser**

Navigate to `http://localhost:3100/departments`. Confirm:
- Table renders with all 4 departments
- Head names appear (not UUIDs)
- Member counts match: Engineering=8, Sales=5, Marketing=4, HR=3
- "+ New Department" button visible when logged in as admin, hidden for employee

**Step 3: Commit**

```bash
git add app/(protected)/departments/page.tsx
git commit -m "feat: implement departments overview table"
```

---

### Task 2: Department Detail Page (`/departments/[id]`)

**Files:**
- Modify: `app/(protected)/departments/[id]/page.tsx`

**Step 1: Replace placeholder with working server component**

Replace the entire file with:

```tsx
// app/(protected)/departments/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = user?.app_metadata?.role === 'admin'

  // Fetch department with head employee
  const { data: dept } = await supabase
    .from('departments')
    .select(`
      id,
      name,
      description,
      head:head_id (
        id,
        first_name,
        last_name,
        job_title
      )
    `)
    .eq('id', id)
    .single()

  if (!dept) notFound()

  // Fetch members of this department
  const { data: members } = await supabase
    .from('employees')
    .select('id, first_name, last_name, job_title, start_date, status')
    .eq('department_id', id)
    .order('last_name')

  const head = dept.head as {
    id: string
    first_name: string
    last_name: string
    job_title: string | null
  } | null

  return (
    <div>
      {/* Back link */}
      <Link
        href="/departments"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        ← Departments
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{dept.name}</h1>
          {dept.description && (
            <p className="mt-1 text-sm text-gray-500">{dept.description}</p>
          )}
          {head && (
            <p className="mt-3 text-sm text-gray-700">
              <span className="text-gray-500">Head: </span>
              <Link
                href={`/employees/${head.id}`}
                className="font-medium hover:text-blue-600"
              >
                {head.first_name} {head.last_name}
              </Link>
              {head.job_title && (
                <span className="text-gray-500"> · {head.job_title}</span>
              )}
            </p>
          )}
        </div>
        {isAdmin && (
          <button
            disabled
            title="Coming soon"
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 opacity-50 cursor-not-allowed"
          >
            Edit
          </button>
        )}
      </div>

      {/* Members table */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          Members ({members?.length ?? 0})
        </h2>

        {members && members.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((emp) => {
                  const isHead = head?.id === emp.id
                  const startDate = emp.start_date
                    ? new Date(emp.start_date).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'

                  return (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/employees/${emp.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {emp.first_name} {emp.last_name}
                          {isHead && (
                            <span
                              title="Department Head"
                              className="ml-1.5 text-yellow-500"
                            >
                              ★
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {emp.job_title ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {startDate}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            emp.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {emp.status ?? 'unknown'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No members in this department.</p>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Verify in browser**

Navigate to `http://localhost:3100/departments`, click any row. Confirm:
- Dept name, description, head name + title all show
- Members table renders with correct count
- Head row has ★ star indicator
- Status badges show green for active
- Back link returns to /departments
- Navigate to a bad UUID → should 404

**Step 3: Commit**

```bash
git add app/(protected)/departments/[id]/page.tsx
git commit -m "feat: implement department detail page with member roster"
```

---

### Task 3: Final smoke test

**Step 1: Verify both pages as admin**
- Login as `admin@prismhr.com`
- `/departments` → table loads, "+ New Department" button visible (disabled)
- Click Engineering → detail page loads, 8 members, Edit button visible (disabled)
- Head has ★, all status badges render

**Step 2: Verify as employee**
- Login as `employee@prismhr.com`
- Both pages load correctly
- No "+ New Department" button on overview
- No "Edit" button on detail

**Step 3: Commit docs**

```bash
git add docs/plans/
git commit -m "docs: add departments design and implementation plan"
```
