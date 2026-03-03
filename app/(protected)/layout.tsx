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
