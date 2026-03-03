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
