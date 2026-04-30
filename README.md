# AngkatanPass

Secure QR ticketing and photo-session management for Foto Angkatan events.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS + reusable UI components
- Supabase (Auth, Postgres, Storage, RLS)
- React Hook Form + Zod

## Quick Start
1. Copy environment variables:
```bash
cp .env.example .env.local
```
2. Fill all values in `.env.local`.
3. Install and run:
```bash
npm install
npm run dev
```

App URL: `http://localhost:3000`

## Supabase Setup
1. Create a Supabase project.
2. Run SQL migration from:
- [supabase/migrations/001_init.sql](/E:/TIKET%20ONLINE/angkatanpass/supabase/migrations/001_init.sql)
3. Create auth users for staff roles.
4. Insert matching `profiles` rows for each auth user id.
5. Seed demo data:
```bash
npm run seed
```

## Scripts
- `npm run dev`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run seed`

## Role Access
- `super_admin`: full control
- `admin`: event + participant + photo management
- `gate_crew`: scanner (entry mode only)
- `photographer`: scanner (photo mode only) + photo upload
- `participant`: ticket/gallery access (token-based links and/or authenticated access via RLS)

## Security Model
- Raw QR token is generated once using cryptographic randomness.
- Database stores only `ticket_token_hash` (HMAC-SHA256 with `TICKET_HASH_SECRET`).
- QR payload contains only URL path `/t/{eventSlug}/{rawToken}` and no PII.
- All sensitive actions are server-side with role checks.
- Service role key is server-only (`src/lib/env/server.ts`) and never imported in client code.
- Every scan attempt writes to `scan_logs` (valid and invalid outcomes).
- Duplicate scans are blocked (`already_used`).
- Revoked tickets are denied.
- Check-in windows are enforced when configured.
- Photo uploads are restricted to JPEG/PNG/WEBP and 8MB max.
- Uploaded filenames are sanitized.
- Private storage bucket with RLS-backed access rules and signed URLs for gallery delivery.

## Operational Guidance (Event Staff)
- Gate crew:
  - Open `/dashboard/scanner`.
  - Keep mode at `Entry Check-In`.
  - Green: allow entry.
  - Yellow (`already used`): call supervisor.
  - Red (`invalid/revoked/wrong event`): deny and escalate.
- Photographer:
  - Switch mode to `Photo Booth`.
  - Scan participant QR before shooting.
  - Upload files in `/dashboard/photos`.
  - Keep photos hidden until QA complete, then toggle visible.
- Admin:
  - Use `/dashboard/participants` for import/export/reissue/revoke.
  - Share ticket URLs securely; do not post in public groups.

## Manual Testing
Use the checklist in:
- [docs/manual-test-checklist.md](/E:/TIKET%20ONLINE/angkatanpass/docs/manual-test-checklist.md)

## Security-Sensitive Assumptions
- Staff roles are assigned correctly in `profiles`.
- `TICKET_HASH_SECRET` is long and rotated securely.
- Service role key is never exposed to browser or mobile app code.
- HTTPS is enabled in production.

