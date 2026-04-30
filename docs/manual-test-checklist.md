# Manual Test Checklist

## Setup
1. Run migration.
2. Seed demo data (`npm run seed`).
3. Confirm at least one staff account per role in `profiles`.

## Auth + Role Redirect
1. Login as `admin` -> redirected to `/dashboard`.
2. Login as `gate_crew` -> redirected to `/dashboard/scanner`.
3. Login as `photographer` -> redirected to `/dashboard/scanner`.
4. Access admin pages as gate role -> blocked.

## Ticket + Registration
1. Register participant on `/register/demo-event`.
2. Open returned ticket URL.
3. Verify QR renders and no personal data appears inside QR payload except URL token.

## Gate Check-In
1. Scan valid ticket in `entry_checkin` mode -> result `valid`.
2. Re-scan same ticket -> `already_used`.
3. Revoke ticket and re-scan -> `revoked`.
4. Confirm each scan appears in `/dashboard/logs`.

## Photo Booth
1. Scan valid ticket in `photo_booth` mode -> `valid`.
2. Re-scan -> `already_used`.
3. Upload a photo as photographer/admin.
4. Toggle visibility and verify participant gallery updates.

## Gallery Security
1. Open `/g/{eventSlug}/{token}` for valid token -> only assigned/eligible visible photos.
2. Change token slightly -> access denied.
3. Ensure signed image URLs expire and are not permanent.

## Upload Security
1. Try non-image file upload -> blocked.
2. Try file > 8MB -> blocked.
3. Check stored file names are sanitized.

## Quality Gate
1. Run `npm run lint`.
2. Run `npm run typecheck`.
3. Run `npm run build`.

