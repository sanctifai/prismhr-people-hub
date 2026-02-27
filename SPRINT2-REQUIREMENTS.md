# PrismHR People Hub — Phase 2 Change Request

**Author:** Sarah Chen, Product Manager — PrismHR
**Date:** February 2026
**Version:** 2.0
**Status:** Approved — Sprint 2

#claude-code #training #prd #phase-2

---

> Hi team — great work on the MVP! Stakeholders loved the demo. They want to move fast on a few additions before we roll this out company-wide. Here's what we need for the next sprint.

---

## Change 1: Time-Off Request System (High Priority)

The #1 request from the demo. Managers want to stop tracking PTO in email threads.

**Requirements:**
- Employees can submit a request: type, start date, end date, notes
- Managers see pending requests for their department
- Managers can approve or deny with an optional comment
- Employees see their own request history and status
- Types: Vacation, Sick, Personal, Other

**New Data Model — `time_off_requests`:**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| employee_id | uuid | FK → employees |
| type | text | vacation, sick, personal, other |
| start_date | date | Required |
| end_date | date | Required |
| status | text | pending, approved, denied |
| notes | text | From the employee |
| reviewer_comment | text | From the manager |
| reviewed_by | uuid | FK → employees (nullable) |
| created_at | timestamptz | Default now() |

**New Pages:**
```
/time-off            → Time-off request list (filtered by role)
/time-off/new        → Submit time-off request form
```

**Navigation:** Add "Time Off" to the main nav bar.

---

## Change 2: Dashboard Enhancements (Medium Priority)

Now that we're adding time-off, the dashboard needs to reflect it.

**Add to existing dashboard:**
- Pending time-off requests count
- Upcoming time-off (next 7 days)
- Add time-off seed data (5–10 requests in various statuses)

---

## Change 3: Employee Deactivation (Medium Priority)

HR asked for a way to deactivate employees who leave the company without deleting their records.

**Requirements:**
- Add a "Deactivate" button to the employee profile/edit page
- Deactivated employees show a visual indicator (greyed out, badge, etc.)
- Deactivated employees still appear in the directory but are clearly marked
- Dashboard headcount should only count active employees

---

## Change 4: Department Head Assignment (Low Priority)

Right now `head_id` exists in the schema but there's no UI for it.

**Requirements:**
- On the department detail page, show the department head prominently
- Add a dropdown or selector to assign/change the department head
- Only employees in that department should be selectable

---

## Pick Your Feature

You don't need to build all of these. Pick the one that interests you most:

```
┌──────────────────────────────────────────────────────────┐
│  SUGGESTED ORDER BY COMPLEXITY                           │
│                                                          │
│  Start here ──► Change 3: Employee Deactivation          │
│                 (touches existing pages, small scope)     │
│                                                          │
│  Then ────────► Change 4: Dept Head Assignment            │
│                 (new UI on existing page)                 │
│                                                          │
│  Big feature ─► Change 1: Time-Off Request System        │
│                 (new table, new pages, new nav item)      │
│                 Try using plan mode for this one!         │
│                                                          │
│  Bonus ───────► Change 2: Dashboard Enhancements          │
│                 (extend existing page with new queries)   │
└──────────────────────────────────────────────────────────┘
```

---

**Questions? Contact sarah.chen@prismhr.com**
