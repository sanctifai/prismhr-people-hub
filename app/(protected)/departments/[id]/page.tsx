export default function DepartmentDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Department</h1>
      <p className="mt-2 text-sm text-gray-500">ID: {params.id}</p>
    </div>
  )
}
