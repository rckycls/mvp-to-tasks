# TutorBook: Brief
_Last updated: 2026-09-24 by planning_

## Goal
Solo tutors get a public booking page where students book and pay for a 1:1 session in under 2 minutes, with no account needed.

## Users
- Tutor: sets profile, price and availability; sees and cancels upcoming sessions.
- Student/parent: picks a slot, pays by card, gets confirmation and reminder emails, can reschedule once.

## Scope
**In:** tutor magic-link auth, profile, weekly availability + timezone, public page `/t/<slug>`, slot booking with no double-booking, Stripe payment (confirm on success), confirmation + 24h reminder emails, tutor dashboard, cancel with auto-refund, one self-serve reschedule (≥24h before).
**Out (v2+):** reviews, packages/discounts, group sessions, video, calendar sync, mobile app.

## Stack
Next.js (App Router) + TypeScript · Postgres + Prisma · Auth.js (email magic link) · Stripe Checkout + webhooks · Resend for email · Vercel (hosting + Cron) · Vitest + Playwright.

## Conventions
- `src/app/` routes, `src/lib/` server logic, `src/components/` UI. Server actions for mutations.
- All times stored in UTC; convert at the edges using the tutor's IANA timezone.
- Money stored as integer cents plus a currency.
- Commands: `pnpm dev` · `pnpm test` · `pnpm lint` · `pnpm build`.

## Data model
- Tutor: id, email, slug, name, subject, bio, priceCents, currency, sessionMinutes, timezone
- AvailabilityRule: tutorId, weekday, startMinute, endMinute
- Booking: id, tutorId, startsAt, endsAt, studentName, studentEmail, status (pending|confirmed|cancelled), stripeSessionId, rescheduleToken, rescheduledAt?

## Key decisions
- A booking is created as `pending` and becomes `confirmed` only via the Stripe webhook, so the database is the single source of truth.
- Double-booking is prevented by a unique constraint on (tutorId, startsAt) for active bookings.

## Assumptions
- Prisma, Auth.js, Resend and Vercel Cron were chosen because the MVP didn't specify them.
- One currency per tutor; no taxes or invoices in the MVP.
- Pending bookings expire after 30 minutes if unpaid.
