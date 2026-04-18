# Dispatch Intake — Ops Console

A production-style Next.js dashboard for managing voice-driven dispatch intakes.

**Architecture**

```
Inbound call
  → ElevenLabs voice agent
    → Make.com webhook
      → /api/intakes/webhook
        → Supabase (dispatch_intakes, internal_notes, activity_logs, profiles)
          → This Next.js console (dashboard, list, detail, settings)
```

This app treats **Make.com as the intake gateway** and **Supabase as the source of truth**. Google Sheets is deliberately **not** in the core loop.

---

## Stack

- **Next.js 14** App Router (Server Components, Server Actions, Route Handlers)
- **TypeScript** end to end
- **Tailwind CSS** with a custom dispatch-ops design system
- **Supabase** for Postgres + Auth (`@supabase/ssr` for cookie-based sessions)
- **Zod** for webhook validation
- **date-fns** for humanized timestamps

Deploys cleanly to **Vercel**.

---

## Features

| Area | Highlights |
|---|---|
| Auth | Email/password via Supabase Auth, middleware route guard, demo mode fallback |
| Dashboard | 6 live metric cards, pipeline snapshot, urgency breakdown, recent intakes, activity feed, architecture summary |
| Intake list | Server-rendered table, filters (status, urgency, assignee, date, search), pagination |
| Intake detail | AI summary + missing fields, load details, transcript viewer, notes thread, activity timeline, quick actions (contacted/quoted/booked/closed/incomplete), assignee dropdown |
| Notes | Team-visible, chronological, attributed, server-action writes |
| Activity | Every status change, assignment change, note, and webhook event is logged |
| Roles | `admin`, `dispatcher`, `sales_rep`, `viewer` with an in-app permission matrix |
| Webhook | `POST /api/intakes/webhook` — secret-guarded, Zod-validated, writes to Supabase + logs activity |
| Settings | Integration status, env diagnostics, team list with roles, configurable defaults |

---

## Folder structure

```
/app
  layout.tsx                    # root html + metadata
  page.tsx                      # redirects to /dashboard
  globals.css
  /login/                       # public
    page.tsx
    LoginForm.tsx               # client
  /(app)/                       # auth-guarded group
    layout.tsx                  # AppShell + role guard
    /dashboard/page.tsx
    /intakes/page.tsx
    /intakes/[id]/page.tsx
    /settings/page.tsx
  /api/intakes/webhook/route.ts # Make.com ingestion

/components
  AppShell.tsx
  Sidebar.tsx
  Header.tsx
  DashboardCards.tsx
  IntakeTable.tsx
  FiltersBar.tsx                # client
  IntakeDetails.tsx
  AISummaryPanel.tsx
  TranscriptPanel.tsx
  NotesPanel.tsx                # client (server action)
  ActivityLog.tsx
  ActionsBar.tsx                # client (server actions)
  StatusBadge.tsx
  UrgencyBadge.tsx
  EmptyState.tsx
  icons.tsx
  /ui                           # primitives (Card, Button, Input, Badge)

/lib
  env.ts                        # env var access + demo-mode detection
  cn.ts                         # tailwind-merge helper
  auth.ts                       # getCurrentUser (respects demo mode)
  permissions.ts                # capability matrix per role
  formatters.ts                 # dates, phones, initials
  validators.ts                 # zod + normalizers for webhook
  queries.ts                    # listIntakes / getIntake / metrics (Supabase or mock)
  actions.ts                    # server actions: status, assign, addNote
  mockData.ts                   # in-memory seed for demo mode
  /supabase
    client.ts                   # browser client
    server.ts                   # server-component client (cookies)
    admin.ts                    # service-role client (webhook only)
    middleware.ts               # cookie refresh + route guard

/types
  intake.ts  note.ts  activity.ts  profile.ts  database.ts

/supabase
  schema.sql                    # tables, enums, triggers, RLS
  seed.sql                      # sample intakes
```

---

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000.

### Demo mode (no Supabase needed)

If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing, the app automatically runs with an in-memory store seeded from `lib/mockData.ts`. You can navigate every page, add notes, change statuses, hit the webhook — all without touching a database. Great for UI iteration and demos.

### Wire up Supabase (real data)

1. Create a Supabase project.
2. Open the **SQL editor** and run `supabase/schema.sql` (tables, enums, triggers, RLS, auto-profile on signup).
3. *(Optional)* Run `supabase/seed.sql` for sample intakes.
4. Create your first user in **Auth → Users** — a `profiles` row with role `dispatcher` is auto-provisioned. Promote yourself to `admin`:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@company.com';
   ```
5. Copy your project URL and keys into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   MAKE_WEBHOOK_SECRET=<long random string>
   ```
6. Restart `npm run dev`. The header will drop the "Demo mode" badge.

---

## Webhook (Make.com → this app)

**Endpoint**

```
POST https://<your-domain>/api/intakes/webhook
Content-Type: application/json
x-webhook-secret: <MAKE_WEBHOOK_SECRET>
```

(You can also pass the secret as `Authorization: Bearer <secret>`.)

**Payload** — every field is optional but structured:

```json
{
  "caller_name": "John Smith",
  "caller_phone": "5551234567",
  "caller_email": "johnsmith@example.com",
  "company_name": "Smith Logistics",
  "pickup_location": "Atlanta, GA",
  "delivery_location": "Nashville, TN",
  "load_type": "Dry Van",
  "trailer_type": "53 ft dry van",
  "weight": "18000 lbs",
  "pickup_date": "2026-04-13",
  "urgency": "high",
  "special_instructions": "Needs pickup before noon",
  "call_summary": "Caller requested dispatch help for same-day dry van load.",
  "transcript": "full transcript here",
  "recommended_action": "Confirm pickup window and quote within 30 minutes",
  "missing_fields": ["insurance_certificate"],
  "priority_score": 82,
  "call_timestamp": "2026-04-13T14:22:00Z",
  "source": "elevenlabs_dispatch_agent",
  "elevenlabs_call_id": "elv_call_001",
  "make_execution_id": "make_exec_001"
}
```

**Response (201)**

```json
{ "ok": true, "id": "uuid-of-new-intake" }
```

Errors: `400` (bad JSON / schema), `401` (bad secret), `500` (DB failure).
`GET` returns endpoint metadata — useful for health checks.

**Local test**

```bash
curl -X POST http://localhost:3000/api/intakes/webhook \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: $MAKE_WEBHOOK_SECRET" \
  -d '{"caller_name":"Test","urgency":"high","call_summary":"Smoke test"}'
```

---

## Roles & permissions

Configured in `lib/permissions.ts` and enforced at both the UI and (via RLS) the database layer.

| Role | Read intakes | Edit intakes | Add notes | Manage settings |
|---|---|---|---|---|
| `admin` | ✅ | ✅ | ✅ | ✅ |
| `dispatcher` | ✅ | ✅ | ✅ | — |
| `sales_rep` | ✅ | status only | ✅ | — |
| `viewer` | ✅ | — | — | — |

New users default to `dispatcher` via the `handle_new_user` trigger — promote to `admin` manually.

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import in Vercel → pick the repo.
3. Add env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `MAKE_WEBHOOK_SECRET`).
4. Deploy. The webhook endpoint is production-ready at `https://<your-domain>/api/intakes/webhook`.

Set Make.com's HTTP module to the production webhook URL with the `x-webhook-secret` header.

---

## What to build next

The foundation is intentionally extensible:

- **Analytics** — drop a `/app/(app)/analytics/page.tsx` and extend `lib/queries.ts` with aggregations.
- **Notifications** — wire `components/ActionsBar.tsx` "Send follow-up" to Resend / Twilio.
- **Companies table** — the `companies` table is already in the schema; join from `dispatch_intakes.company_id` for rollups.
- **Export** — add a CSV route handler at `/api/intakes/export`.
- **Realtime** — flip `queries.ts` to Supabase Realtime channels for live queue updates.

All reused scaffolding (AppShell, cards, tables, badges, server actions) is in place.

---

## Scripts

```bash
npm run dev        # local dev
npm run build      # production build
npm run start      # run built app
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```
