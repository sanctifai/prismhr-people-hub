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
