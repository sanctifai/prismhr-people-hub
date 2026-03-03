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
  const { data: dept, error: deptError } = await supabase
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

  if (deptError) console.error('[DepartmentDetailPage] dept fetch failed:', deptError.message)
  if (!dept) notFound()

  // Fetch members of this department
  const { data: members, error: membersError } = await supabase
    .from('employees')
    .select('id, first_name, last_name, job_title, start_date, status')
    .eq('department_id', id)
    .order('last_name')

  if (membersError) console.error('[DepartmentDetailPage] members fetch failed:', membersError.message)

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
            type="button"
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Job Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Start Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
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
