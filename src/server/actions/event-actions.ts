"use server";

import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { eventSchema } from "@/lib/validation";

export async function createEventAction(input: z.infer<typeof eventSchema>) {
  const profile = await requireRole(["super_admin", "admin"]);
  const supabaseAdmin = getSupabaseAdmin();
  const data = eventSchema.parse(input);
  const { error } = await supabaseAdmin.from("events").insert({
    ...data,
    cover_image_url: data.cover_image_url || null,
    checkin_starts_at: data.checkin_starts_at || null,
    checkin_ends_at: data.checkin_ends_at || null,
    created_by: profile.id,
  });

  return { ok: !error, message: error?.message ?? "Event created." };
}
