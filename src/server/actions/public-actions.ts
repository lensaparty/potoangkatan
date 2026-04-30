"use server";

import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { generateRawTicketToken, generateShortCode, hashTicketToken } from "@/lib/security/tokens";

const publicRegistrationSchema = z.object({
  eventSlug: z.string().min(1),
  full_name: z.string().min(2).max(120),
  class_name: z.string().max(80).optional(),
  student_id: z.string().max(64).optional(),
  phone: z.string().max(32).optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export async function registerParticipantPublicAction(
  input: z.infer<typeof publicRegistrationSchema>,
) {
  const supabaseAdmin = getSupabaseAdmin();
  const payload = publicRegistrationSchema.parse(input);
  const { data: event } = await supabaseAdmin
    .from("events")
    .select("id,slug,is_active")
    .eq("slug", payload.eventSlug)
    .single();

  if (!event || !event.is_active) {
    return { ok: false, message: "Event is not available." };
  }

  const rawToken = generateRawTicketToken();
  const { error } = await supabaseAdmin.from("participants").insert({
    event_id: event.id,
    full_name: payload.full_name,
    class_name: payload.class_name || null,
    student_id: payload.student_id || null,
    phone: payload.phone || null,
    email: payload.email || null,
    ticket_token_hash: hashTicketToken(rawToken),
    ticket_short_code: generateShortCode(),
  });

  if (error) return { ok: false, message: "Registration failed." };
  return { ok: true, ticketUrl: `/t/${event.slug}/${rawToken}` };
}
