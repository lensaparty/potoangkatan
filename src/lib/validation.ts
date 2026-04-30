import { z } from "zod";

export const eventSchema = z.object({
  name: z.string().min(3).max(140),
  slug: z
    .string()
    .min(3)
    .max(160)
    .regex(/^[a-z0-9-]+$/),
  date: z.string().optional(),
  location: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  cover_image_url: z.string().url().optional().or(z.literal("")),
  checkin_starts_at: z.string().optional(),
  checkin_ends_at: z.string().optional(),
});

export const participantSchema = z.object({
  event_id: z.string().uuid(),
  full_name: z.string().min(2).max(120),
  class_name: z.string().max(80).optional(),
  student_id: z.string().max(64).optional(),
  phone: z.string().max(32).optional(),
  email: z.string().email().optional().or(z.literal("")),
  session_id: z.string().uuid().optional().or(z.literal("")),
});

export const scanSchema = z.object({
  mode: z.enum(["entry_checkin", "photo_booth"]),
  token: z.string().min(20).max(400),
  eventSlug: z.string().min(1),
});

export const manualTokenSchema = z.object({
  tokenInput: z.string().min(8).max(500),
});
