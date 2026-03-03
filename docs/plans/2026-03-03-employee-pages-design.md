# Employee Pages Design

**Date:** 2026-03-03
**Status:** Approved

## Pages

### `/employees` — Employee List
- Server component fetches all employees + departments, joins dept name, passes to client table component
- Client `EmployeeTable` component handles search filtering (name OR department) in-browser, no round-trip
- Table columns: Name (avatar initials), Email, Department (color badge), Job Title, Start Date, Actions
- Add Employee button visible to admins only (role from `app_metadata`)
- Edit link per row visible to admins only

### `/employees/[id]` — Employee Profile
- Server component fetches employee + joined department in one query
- Layout: left card (large avatar, name, title, status badge) + right details panel (email, dept link, start date, status)
- Edit button visible to admins only
- Back link to `/employees`
- `notFound()` if employee ID doesn't exist

## Architecture
- Both pages: Server Components with server-side Supabase data fetch
- Role check: `user.app_metadata.role === 'admin'` server-side, passed as prop
- Search: client component wrapping table with `useState` filter
- Dept badge color: stable hash of dept name → Tailwind color class
