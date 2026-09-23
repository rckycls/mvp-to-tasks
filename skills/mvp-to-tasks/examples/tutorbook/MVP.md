# TutorBook: MVP

## Problem
Independent tutors juggle bookings over WhatsApp and bank transfers. They lose time, get no-shows and forget to collect payment.

## Who it's for
- **Tutors** (primary): solo tutors teaching 1:1, charging per session.
- **Students or parents:** book and pay for a session in under 2 minutes, without creating an account.

## MVP features
1. The tutor signs up with an email magic link and sets their profile: name, subject, bio, price per session, session length.
2. The tutor sets weekly availability (e.g. Mon/Wed 16:00–20:00) and their time zone.
3. Each tutor gets a public booking page at `/t/<slug>` showing open slots in the student's time zone.
4. A student picks a slot, enters their name and email, and pays by card (Stripe). The booking is only confirmed once payment succeeds, and a slot can't be double-booked.
5. Both sides get a confirmation email, plus a reminder 24 hours before.
6. The tutor dashboard lists upcoming sessions. The tutor can cancel a session, which refunds the student automatically.
7. The student can reschedule once from a link in their email, up to 24 hours before the session.

## Nice to have (later)
Reviews, packages and discounts, group sessions, a built-in video call, calendar sync, a mobile app.

## Tech preferences
Next.js + TypeScript, Postgres, Stripe, and deploy on Vercel. I'm a solo developer using Claude Code on the Pro plan, and I'd like to launch in about 3 weeks.
