# Departments Pages Design

**Date:** 2026-03-03
**Status:** Approved

## Overview

Flesh out the two department pages from placeholder state to fully functional views, pulling live data from Supabase.

## Pages

### `/departments` — Overview

A sortable table listing all departments. Admin users see a "+ New Department" button (not yet implemented in this pass — button is present, wired to a future route).

**Columns:** Name · Description · Department Head · Member Count
**Interaction:** Click any row navigates to `/departments/[id]`
**Data:** Single query joining `departments` → `employees` (for head name) with a COUNT of members

### `/departments/[id]` — Detail

Shows full department info with a member roster table below.

**Header section:** Department name, description, and department head (name + job title). Admin sees an Edit button (wired to a future `/departments/[id]/edit` route — placeholder for now).

**Members table columns:** Name · Job Title · Start Date · Status
Department head is marked with a star (★) in the Name column.
Clicking a member row navigates to `/employees/[id]`.

If the department ID is not found → 404 via Next.js `notFound()`.

## Architecture

- **Both pages are React Server Components** — no `'use client'`, data fetched server-side via Supabase server client
- **Role detection:** Read `app_metadata.role` from `supabase.auth.getUser()` — `admin` shows action buttons, `employee` sees read-only view
- **No new DB queries beyond what's needed** — overview uses one aggregated query; detail uses two (dept + members)

## Components

No new shared components — inline JSX in each page file is sufficient given the current scale.

## Out of Scope (this pass)

- Create/edit department forms
- Search/filter on the overview table
- Pagination
