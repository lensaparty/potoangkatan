export const roles = [
  "super_admin",
  "admin",
  "gate_crew",
  "photographer",
  "participant",
] as const;

export type AppRole = (typeof roles)[number];

export type TicketStatus = "active" | "revoked" | "used";
export type CheckinStatus = "not_checked_in" | "checked_in";
export type PhotoStatus = "not_photographed" | "photographed";
export type ScanType = "entry_checkin" | "photo_booth";
export type ScanResult =
  | "valid"
  | "invalid"
  | "already_used"
  | "revoked"
  | "wrong_event"
  | "expired_window";

export type Profile = {
  id: string;
  full_name: string | null;
  role: AppRole;
};

export type EventRow = {
  id: string;
  name: string;
  slug: string;
  date: string | null;
  location: string | null;
  description: string | null;
  cover_image_url: string | null;
  checkin_starts_at: string | null;
  checkin_ends_at: string | null;
  is_active: boolean;
};

