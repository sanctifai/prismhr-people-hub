# Product Requirements Document: PrismHR People Hub

**Author:** Sarah Chen, Product Manager — PrismHR
**Date:** February 2026
**Version:** 1.0 — MVP
**Status:** Approved for Development

#claude-code #training #prd

---

## Overview

PrismHR People Hub is an internal HRIS (Human Resource Information System) for managing our employee directory and department structure. This is a lightweight tool built for HR admins and managers who currently rely on spreadsheets to track this information.

## Problem Statement

Our HR team manages employee data across multiple spreadsheets. Managers lack visibility into their team structure and headcount. We need a single, simple system that consolidates employee and department information.

## Target Users

| Role | Permissions |
|------|-------------|
| Admin | Full CRUD on employees and departments, view dashboard |
| Employee | View-only access to directory, departments, and dashboard |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Styling | Tailwind CSS |
| Hosting | Vercel (optional) |

## Features

### Feature 1: Employee Directory

A searchable list of all employees in the company.

**Requirements:**
- Display employees in a table: name, email, department, job title, start date
- Search by name or department
- Click an employee to view their full profile
- Admins can add and edit employees (button hidden for employee role)

**Data Model — `employees`:**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| first_name | text | Required |
| last_name | text | Required |
| email | text | Unique, required |
| job_title | text | |
| department_id | uuid | FK → departments |
| start_date | date | |
| status | text | active, inactive |
| avatar_url | text | Optional photo URL |
| created_at | timestamptz | Default now() |

### Feature 2: Department Management

Organize employees into departments with a department head.

**Requirements:**
- List all departments with employee count
- Each department shows its members and head
- Admins can create and edit departments (button hidden for employee role)
- Assign a department head (references an employee)

**Data Model — `departments`:**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| name | text | Unique, required |
| description | text | |
| head_id | uuid | FK → employees (nullable) |
| created_at | timestamptz | Default now() |

### Feature 3: Dashboard

A landing page showing key metrics at a glance.

**Requirements:**
- Total employee count
- Department breakdown (count per department)
- Recent hires (last 30 days)

### Feature 4: Authentication & Role-Based Access

Login with two roles — admins manage everything, employees can only view.

**Requirements:**
- Login page using Supabase Auth (email/password)
- Protect all routes — redirect to login if not authenticated
- Two roles: `admin` and `employee`
- Role is stored in `app_metadata.role` on the Supabase auth user (set via dashboard)
- Admin: full CRUD on employees and departments
- Employee: read-only access across the app
- RLS policies enforce roles at the database level — not just the UI
- UI conditionally shows/hides add and edit buttons based on role
- Sign-out button in the navigation

**Data Model:** Uses Supabase's built-in `auth.users` with `app_metadata` for roles — no custom user/roles table needed.

### Feature 5: Seed Data

Pre-populated data so the app looks real immediately after setup.

**Requirements:**
- 3–4 departments (Engineering, Marketing, HR, Sales)
- 15–20 employees spread across departments
- 2 auth users: one admin (`admin@prismhr.com`) and one employee (`employee@prismhr.com`) with `app_metadata.role` set accordingly
- Seed script runs via `npm run seed` or Supabase SQL

## Pages

```
/login               → Login page (Supabase Auth)
/                    → Dashboard (protected)
/employees           → Employee directory (table + search)
/employees/[id]      → Employee profile
/employees/new       → Add employee form
/employees/[id]/edit → Edit employee form
/departments         → Department list
/departments/[id]    → Department detail with members
```

## Out of Scope (for this version)

- Time-off / PTO tracking
- Granular permissions beyond admin/employee (e.g., per-department access)
- Notifications or email
- Payroll or benefits
- File uploads for employee photos
- Mobile-responsive design (desktop-first is fine)

## Success Criteria

- [ ] Login page authenticates via Supabase Auth
- [ ] Unauthenticated users are redirected to login
- [ ] Admin user can add, edit employees and departments
- [ ] Employee user sees the same pages but without add/edit controls
- [ ] RLS policies enforce roles at the database level (not just UI)
- [ ] Employee directory loads with seed data
- [ ] Departments display with member counts
- [ ] Dashboard shows live metrics from the database

---

**Questions? Contact sarah.chen@prismhr.com**
