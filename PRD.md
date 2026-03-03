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

| Role | Needs |
|------|-------|
| HR Admin | Manage all employee records, view org-wide dashboard |
| Manager | View their department and team members |
| Employee | View company directory |

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
- HR admins can add and edit employees

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
- HR admins can create and edit departments
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

### Feature 4: Authentication & Row-Level Security

Simple login so only authorized users can access the system.

**Requirements:**
- Login page using Supabase Auth (email/password)
- Protect all routes — redirect to login if not authenticated
- RLS policies on all tables — must be authenticated to read or write
- Sign-out button in the navigation

**Data Model:** Uses Supabase's built-in `auth.users` table — no custom user table needed.

### Feature 5: Seed Data

Pre-populated data so the app looks real immediately after setup.

**Requirements:**
- 3–4 departments (Engineering, Marketing, HR, Sales)
- 15–20 employees spread across departments
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
- Role-based access control (all authenticated users have equal access for this version)
- Notifications or email
- Payroll or benefits
- File uploads for employee photos
- Mobile-responsive design (desktop-first is fine)

## Success Criteria

- [ ] Login page authenticates via Supabase Auth
- [ ] Unauthenticated users are redirected to login
- [ ] RLS policies prevent unauthenticated database access
- [ ] Employee directory loads with seed data
- [ ] Can add and edit employees
- [ ] Departments display with member counts
- [ ] Dashboard shows live metrics from the database

---

**Questions? Contact sarah.chen@prismhr.com**
