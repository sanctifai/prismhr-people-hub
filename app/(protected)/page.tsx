import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const DEPT_COLORS = [
  { border: 'border-l-blue-500',    number: 'text-blue-600',    badge: 'bg-blue-50 text-blue-700'    },
  { border: 'border-l-violet-500',  number: 'text-violet-600',  badge: 'bg-violet-50 text-violet-700'  },
  { border: 'border-l-emerald-500', number: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700' },
  { border: 'border-l-amber-500',   number: 'text-amber-600',   badge: 'bg-amber-50 text-amber-700'   },
  { border: 'border-l-rose-500',    number: 'text-rose-600',    badge: 'bg-rose-50 text-rose-700'    },
]

const AVATAR_PALETTE = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
]

function avatarColor(name: string) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_PALETTE.length
  return AVATAR_PALETTE[h]
}

function fmtDate(s: string) {
  return new Date(s + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ data: employees }, { data: departments }] = await Promise.all([
    supabase
      .from('employees')
      .select('id, first_name, last_name, job_title, status, start_date, department_id'),
    supabase
      .from('departments')
      .select('id, name'),
  ])

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const cutoff = thirtyDaysAgo.toISOString().split('T')[0]

  const deptMap = new Map((departments ?? []).map(d => [d.id, d.name]))

  const deptStats = (departments ?? [])
    .map((d, i) => ({
      ...d,
      count: (employees ?? []).filter(e => e.department_id === d.id).length,
      colors: DEPT_COLORS[i % DEPT_COLORS.length],
    }))
    .sort((a, b) => b.count - a.count)

  const recentHires = (employees ?? [])
    .filter(e => e.start_date >= cutoff)
    .sort((a, b) => b.start_date.localeCompare(a.start_date))
    .map(e => ({ ...e, deptName: deptMap.get(e.department_id) ?? '—' }))

  const totalCount  = employees?.length ?? 0
  const activeCount = employees?.filter(e => e.status === 'active').length ?? 0
  const deptCount   = departments?.length ?? 0
  const newCount    = recentHires.length

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  const stats = [
    { label: 'Total Employees', value: totalCount,  sub: 'all time',          accent: 'bg-slate-800',    num: 'text-slate-900'    },
    { label: 'Active',          value: activeCount, sub: 'currently employed', accent: 'bg-emerald-500',  num: 'text-emerald-600'  },
    { label: 'Departments',     value: deptCount,   sub: 'teams',              accent: 'bg-blue-500',     num: 'text-blue-600'     },
    { label: 'New Hires',       value: newCount,    sub: 'last 30 days',       accent: 'bg-violet-500',   num: 'text-violet-600'   },
  ]

  return (
    <div className="space-y-8">

      {/* ── Page header ─────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-0.5 text-sm text-slate-500">{today}</p>
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-5">
        {stats.map(s => (
          <div key={s.label} className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
            <div className={`h-1 w-full ${s.accent}`} />
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{s.label}</p>
              <p
                className={`mt-3 text-6xl font-bold tabular-nums leading-none tracking-tight ${s.num}`}
                style={{ fontFamily: 'var(--font-serif, inherit)' }}
              >
                {s.value}
              </p>
              <p className="mt-2 text-xs text-slate-400">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Department cards ────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Departments</h2>
          <Link href="/departments" className="text-xs font-medium text-blue-600 hover:text-blue-700">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-5">
          {deptStats.map(dept => (
            <Link key={dept.id} href={`/departments/${dept.id}`} className="group block">
              <div
                className={`rounded-xl border border-slate-200/80 border-l-4 ${dept.colors.border} bg-white p-5 shadow-sm transition-shadow group-hover:shadow-md`}
              >
                <p className="truncate text-sm font-semibold text-slate-700">{dept.name}</p>
                <p
                  className={`mt-3 text-5xl font-bold tabular-nums leading-none tracking-tight ${dept.colors.number}`}
                  style={{ fontFamily: 'var(--font-serif, inherit)' }}
                >
                  {dept.count}
                </p>
                <p className="mt-1.5 text-xs text-slate-400">
                  {dept.count === 1 ? 'employee' : 'employees'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Recent hires ────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Recent Hires</h2>
          <span className="text-xs text-slate-400">Last 30 days</span>
        </div>

        {recentHires.length === 0 ? (
          <div className="rounded-xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-slate-400">No new hires in the last 30 days.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Employee</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Title</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Department</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Start Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentHires.map(hire => {
                  const initials = `${hire.first_name[0]}${hire.last_name[0]}`
                  const aColor   = avatarColor(hire.first_name + hire.last_name)
                  return (
                    <tr key={hire.id} className="transition-colors hover:bg-slate-50/50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${aColor}`}>
                            {initials}
                          </div>
                          <span className="font-medium text-slate-900">
                            {hire.first_name} {hire.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{hire.job_title ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {hire.deptName}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{fmtDate(hire.start_date)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  )
}
