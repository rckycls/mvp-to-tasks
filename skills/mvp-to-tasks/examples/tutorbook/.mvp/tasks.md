# TutorBook: Tasks
Plan: Pro · 18 tasks (11 light · 7 heavy) · ~7–8 usage windows · Tool: none

> Work one task per session: say **"next task"**. Each session loads only brief.md,
> the listed handoffs, and the listed files. If you hit the usage limit mid-task,
> the next session resumes from the last checked sub-task.

Status: `[ ]` todo · `[~]` in progress · `[x]` done

## Phase 1: Foundation
**Goal:** A running app with a database schema and working tutor login. · **Exit:** A tutor can sign in with a magic link and land on an empty `/dashboard`.

### [ ] T-001 · Scaffold Next.js app with tooling · S
- **Goal:** Create the project skeleton so every later task has a place to put code and a way to test it.
- **Depends on:** none
- **Model:** light
- **Acceptance:** `pnpm dev` serves the home page; `pnpm lint`, `pnpm test` (1 sample test) and `pnpm build` all pass.
- **Context to load:** brief#Stack, brief#Conventions
- **Link:**
- Sub-tasks:
  - [ ] Create a Next.js App Router + TypeScript app with pnpm, and set up the `src/` folders from the conventions
  - [ ] Add ESLint/Prettier and Vitest with one sample test
  - [ ] Add `.env.example` and a README section listing the commands
  - [ ] Verify: dev, lint, test and build all pass + write handoff

### [ ] T-002 · Database schema with Prisma · M
- **Goal:** Define the full MVP data model once, so later tasks only query it.
- **Depends on:** T-001
- **Model:** heavy
- **Acceptance:** The migration applies to a fresh Postgres database; a seed script creates one tutor with availability; a unique index blocks two active bookings for the same tutor and start time.
- **Context to load:** brief#Data model, brief#Key decisions · H:T-001 · files: `package.json`, `.env.example`
- **Link:**
- Sub-tasks:
  - [ ] Add Prisma and connect to Postgres (local via Docker or a hosted dev database)
  - [ ] Write the Tutor, AvailabilityRule and Booking models, with a partial unique index on (tutorId, startsAt) for active bookings
  - [ ] Add the migration, a seed script and `src/lib/db.ts` (Prisma client singleton)
  - [ ] Verify: migrate and seed on a fresh database, then test the unique index with a duplicate insert + write handoff

### [ ] T-003 · Tutor magic-link sign-in · M
- **Goal:** Tutors can sign in with just their email.
- **Depends on:** T-002
- **Model:** heavy
- **Acceptance:** Entering an email sends a magic link (Resend); clicking it creates or loads the Tutor and opens `/dashboard`; `/dashboard` redirects signed-out users to `/login`.
- **Context to load:** brief#Stack · H:T-002 · files: `prisma/schema.prisma`, `src/lib/db.ts`
- **Link:**
- Sub-tasks:
  - [ ] Set up Auth.js with the Prisma adapter and the Resend email provider, including the auth tables in a migration
  - [ ] Build the `/login` page and the "check your email" state
  - [ ] Protect `/dashboard` with an empty placeholder page and add sign out
  - [ ] Verify: complete the sign-in flow with a real email + write handoff

## Phase 2: Core loop (a student can book a slot)
**Goal:** A tutor publishes availability, and a student can reserve a slot on the public page. · **Exit:** A pending booking is created from `/t/<slug>`, and that slot then disappears.

### [ ] T-004 · Tutor profile settings · S
- **Goal:** The tutor sets the profile fields shown on the public page.
- **Depends on:** T-003
- **Model:** light
- **Acceptance:** `/dashboard/profile` saves the name, subject, bio, price, session length, timezone and a unique slug, with validation errors shown inline.
- **Context to load:** brief#Data model, brief#Conventions · H:T-003 · files: `prisma/schema.prisma`, `src/app/dashboard/`
- **Link:**
- Sub-tasks:
  - [ ] Build the profile form with a server action and zod validation
  - [ ] Check that the slug is unique, and add a timezone picker (IANA list)
  - [ ] Verify: save and reload the page, and confirm a duplicate slug is rejected + write handoff

### [ ] T-005 · Weekly availability editor · M
- **Goal:** The tutor defines their weekly bookable hours.
- **Depends on:** T-004
- **Model:** light
- **Acceptance:** On `/dashboard/availability`, the tutor can add and remove time ranges per weekday; overlapping ranges are rejected; the rules persist as AvailabilityRule rows.
- **Context to load:** brief#Data model · H:T-004 · files: `prisma/schema.prisma`, `src/app/dashboard/profile/`
- **Link:**
- Sub-tasks:
  - [ ] Add server actions to list, add and delete rules, with overlap validation
  - [ ] Build the weekday grid UI with add/remove ranges
  - [ ] Add unit tests for the overlap validation
  - [ ] Verify: add, remove and reload the rules, and confirm an overlap is rejected + write handoff

### [ ] T-006 · Slot generation function · M
- **Goal:** Compute bookable slots from the rules, the timezone and existing bookings.
- **Depends on:** T-005
- **Model:** heavy
- **Acceptance:** `getOpenSlots(tutorId, fromUtc, days)` returns UTC slots of `sessionMinutes` length, excluding past slots and active bookings; tests cover a DST transition and a student in a different timezone.
- **Context to load:** brief#Conventions, brief#Data model · H:T-005 · files: `prisma/schema.prisma`
- **Link:**
- Sub-tasks:
  - [ ] Write a pure function that turns rules + timezone + date range into candidate slots (no database)
  - [ ] Subtract active bookings and past times, wrapped in `src/lib/slots.ts`
  - [ ] Add Vitest cases: normal week, DST change, cross-timezone, fully booked day
  - [ ] Verify: tests pass + write handoff

### [ ] T-007 · Public booking page · M
- **Goal:** Students see the tutor's profile and open slots in their own timezone.
- **Depends on:** T-004, T-006
- **Model:** light
- **Acceptance:** `/t/<slug>` shows the profile and the next 14 days of open slots, grouped by day in the browser's timezone; an unknown slug returns a 404.
- **Context to load:** brief#Conventions · H:T-004, H:T-006 · files: `src/lib/slots.ts`
- **Link:**
- Sub-tasks:
  - [ ] Build the page's server component that loads the tutor and slots
  - [ ] Add a client component that renders slots in the browser's timezone, grouped by day
  - [ ] Add the 404 and empty state ("no open slots")
  - [ ] Verify: open the seeded tutor's page in two timezones + write handoff

### [ ] T-008 · Reserve a slot (pending booking) · M
- **Goal:** Selecting a slot creates a pending booking without allowing double-booking.
- **Depends on:** T-006, T-007
- **Model:** heavy
- **Acceptance:** Submitting the name and email for a slot creates a `pending` Booking; two simultaneous requests for the same slot result in one success and one "slot just taken" error; pending bookings older than 30 minutes don't block the slot.
- **Context to load:** brief#Key decisions, brief#Assumptions · H:T-006, H:T-007 · files: `src/lib/slots.ts`, `prisma/schema.prisma`, `src/app/t/[slug]/`
- **Link:**
- Sub-tasks:
  - [ ] Add a server action that re-checks the slot is open and inserts the pending booking (relying on the unique index)
  - [ ] Treat stale pending bookings (>30 min) as inactive in slot generation and the index logic
  - [ ] Add the booking form UI with the "slot just taken" handling
  - [ ] Verify: add a concurrency test (parallel inserts) + write handoff

## Phase 3: Payments & notifications
**Goal:** Bookings are paid and confirmed, and everyone gets emails. · **Exit:** Paying with a Stripe test card confirms the booking and sends confirmation emails; a reminder email goes out 24 hours before.

### [ ] T-009 · Spike: Stripe flow decision · S
- **Goal:** Decide exactly how payment, expiry and refunds will work before building them.
- **Depends on:** T-008
- **Model:** heavy
- **Acceptance:** A decision is recorded in brief#Key decisions covering Checkout Session settings, which webhook events to handle, how expiry maps to the 30-minute pending rule, and the refund approach. A test-mode Checkout link has been created manually to prove the account setup.
- **Context to load:** brief#Key decisions, brief#Assumptions · H:T-008
- **Link:**
- Sub-tasks:
  - [ ] Compare Checkout Session vs Payment Element for this flow and choose one
  - [ ] Define the events (`checkout.session.completed`, `checkout.session.expired`, `charge.refunded`) and the idempotency approach
  - [ ] Verify: record the decision in the brief + write handoff

### [ ] T-010 · Stripe Checkout + confirmation webhook · M
- **Goal:** A pending booking is paid through Stripe and confirmed by the webhook.
- **Depends on:** T-008, T-009
- **Model:** heavy
- **Acceptance:** Reserving redirects to Checkout, and a test payment makes the booking `confirmed`; an expired session makes it `cancelled`; replaying a webhook has no side effects.
- **Context to load:** brief#Key decisions · H:T-008, H:T-009 · files: `src/app/t/[slug]/` (booking action), `prisma/schema.prisma`
- **Link:**
- Sub-tasks:
  - [ ] Create the Checkout Session in the booking action (price, 30-minute expiry, metadata bookingId) and redirect to it
  - [ ] Add `/api/stripe/webhook` with signature verification, handling completed and expired events idempotently
  - [ ] Add success and cancel pages
  - [ ] Verify: run the Stripe CLI `stripe listen`, pay with a test card, and replay the event + write handoff

### [ ] T-011 · Confirmation emails · S
- **Goal:** The tutor and student get an email when a booking is confirmed.
- **Depends on:** T-003, T-010
- **Model:** light
- **Acceptance:** On confirmation, both sides receive an email with the time in their timezone; the student's email includes the reschedule link (token).
- **Context to load:** brief#Stack · H:T-003, H:T-010 · files: `src/app/api/stripe/webhook/`
- **Link:**
- Sub-tasks:
  - [ ] Add a `src/lib/email.ts` send helper that reuses the Resend setup from T-003, with plain templates
  - [ ] Generate the rescheduleToken and send both emails from the completed-webhook handler
  - [ ] Verify: complete a test booking and receive both emails + write handoff

### [ ] T-012 · 24h reminder emails (cron) · M
- **Goal:** Send a reminder to both sides 24 hours before each confirmed session.
- **Depends on:** T-011
- **Model:** light
- **Acceptance:** A protected `/api/cron/reminders` route sends reminders exactly once per booking; `vercel.json` schedules it hourly; it can be run manually in development.
- **Context to load:** brief#Stack · H:T-011 · files: `src/lib/email.ts`, `prisma/schema.prisma`
- **Link:**
- Sub-tasks:
  - [ ] Add a `reminderSentAt` field and migration
  - [ ] Build the cron route with a secret header check, a query for the 23–25 hour window, sending, and marking reminders as sent
  - [ ] Add the `vercel.json` cron config
  - [ ] Verify: seed a booking 24 hours out and run the route twice, confirming one email + write handoff

## Phase 4: Managing bookings
**Goal:** Tutors see and cancel sessions, and students can reschedule. · **Exit:** A cancel refunds in Stripe test mode; a reschedule moves the booking and frees the old slot.

### [ ] T-013 · Tutor dashboard: upcoming sessions · S
- **Goal:** Tutors see what's coming up.
- **Depends on:** T-003, T-010
- **Model:** light
- **Acceptance:** `/dashboard` lists confirmed upcoming bookings (date/time in the tutor's timezone, student name and email), with an empty state.
- **Context to load:** brief#Conventions · H:T-003, H:T-010 · files: `src/app/dashboard/`
- **Link:**
- Sub-tasks:
  - [ ] Query confirmed future bookings for the signed-in tutor
  - [ ] Build the list UI with an empty state
  - [ ] Verify: seeded bookings appear in the correct timezone + write handoff

### [ ] T-014 · Cancel with automatic refund · M
- **Goal:** A tutor cancellation refunds the student and frees the slot.
- **Depends on:** T-010, T-011, T-013
- **Model:** heavy
- **Acceptance:** Cancel (with a confirmation dialog) creates a Stripe refund, sets the status to `cancelled`, reopens the slot and emails the student; a failed refund leaves the booking unchanged and shows an error.
- **Context to load:** brief#Key decisions · H:T-010, H:T-013 · files: `src/app/dashboard/`, `src/lib/email.ts`
- **Link:**
- Sub-tasks:
  - [ ] Add a cancel server action: refund via the payment intent, then update the status (refund first)
  - [ ] Send the cancellation email to the student
  - [ ] Add the cancel button with a confirmation dialog and error state on the dashboard
  - [ ] Verify: cancel a test booking and check the refund in the Stripe dashboard + write handoff

### [ ] T-015 · Student self-serve reschedule · M
- **Goal:** A student can move their session once, up to 24 hours before it.
- **Depends on:** T-008, T-011
- **Model:** light
- **Acceptance:** Choosing a new slot at `/r/<token>` moves the booking (same payment), sets `rescheduledAt` and emails both sides; the link is rejected when used a second time; it's also rejected within 24 hours of the session.
- **Context to load:** brief#Data model · H:T-008, H:T-011 · files: `src/lib/slots.ts`, `src/lib/email.ts`, `src/app/t/[slug]/`
- **Link:**
- Sub-tasks:
  - [ ] Build the token lookup page and its rules (single use, ≥24 hours before)
  - [ ] Add a move action reusing the slot check and unique-index guard from T-008
  - [ ] Send reschedule emails to both sides
  - [ ] Verify: reschedule once successfully, then confirm the second attempt and the <24h attempt are rejected + write handoff

## Phase 5: Polish & launch
**Goal:** The app is solid enough for real tutors and is live. · **Exit:** The production URL takes a real booking end to end in Stripe live mode (then refund it).

### [ ] T-016 · Validation, error and loading states · M
- **Goal:** No broken or blank screens on the main flows.
- **Depends on:** T-014, T-015
- **Model:** light
- **Acceptance:** Every form shows field errors; every page has loading and error boundaries; the public page works on a 375px-wide mobile screen.
- **Context to load:** brief#Conventions · files: `src/app/` (page list only)
- **Link:**
- Sub-tasks:
  - [ ] Add `error.tsx`/`loading.tsx` for the dashboard, `/t/[slug]` and `/r/[token]`
  - [ ] Check form validation messages everywhere
  - [ ] Fix the mobile layout of the public booking page
  - [ ] Verify: click through every flow on mobile width + write handoff

### [ ] T-017 · End-to-end happy-path test · M
- **Goal:** One Playwright test protects the core loop.
- **Depends on:** T-010, T-016
- **Model:** light
- **Acceptance:** `pnpm e2e` covers seeding a tutor → booking a slot → paying with a Stripe test card → seeing the booking on the dashboard, passing locally.
- **Context to load:** brief#Conventions · H:T-010 · files: `package.json`, `prisma/seed.ts`
- **Link:**
- Sub-tasks:
  - [ ] Set up Playwright with a test database and seed
  - [ ] Write the happy-path spec, using the Stripe test card in hosted Checkout
  - [ ] Verify: `pnpm e2e` passes twice in a row + write handoff

### [ ] T-018 · Deploy to production · M
- **Goal:** TutorBook is live.
- **Depends on:** T-010, T-012, T-017
- **Model:** light
- **Acceptance:** The Vercel production deploy has a hosted Postgres database migrated, live Stripe keys, a production webhook endpoint, Resend domain verification, and an active cron; one real booking is made and then refunded.
- **Context to load:** brief#Stack · H:T-010, H:T-012 · files: `.env.example`, `vercel.json`
- **Link:**
- Sub-tasks:
  - [ ] Set up hosted Postgres and run the production migration
  - [ ] Add the Vercel project and environment variables, then deploy
  - [ ] Set up the Stripe live webhook and Resend domain DNS
  - [ ] Verify: make a real booking, get the emails, then refund it + write handoff
