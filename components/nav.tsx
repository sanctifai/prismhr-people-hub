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
