"use server";

import Papa from "papaparse";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { generateRawTicketToken, generateShortCode, hashTicketToken } from "@/lib/security/tokens";
import { participantSchema } from "@/lib/validation";

export async function createParticipantAction(input: z.infer<typeof participantSchema>) {
  await requireRole(["super_admin", "admin"]);
  const supabaseAdmin = getSupabaseAdmin();
  const data = participantSchema.parse(input);
  const rawToken = generateRawTicketToken();
  const tokenHash = hashTicketToken(rawToken);
  const shortCode = generateShortCode();

  const { error, data: row } = await supabaseAdmin
    .from("participants")
    .insert({
      ...data,
      session_id: data.session_id || null,
      ticket_token_hash: tokenHash,
      ticket_short_code: shortCode,
    })
    .select("id")
    .single();

  if (error || !row) {
    return { ok: false, message: error?.message ?? "Failed to create participant." };
  }

  return { ok: true, participantId: row.id, rawToken };
}

const csvParticipantSchema = z.object({
  full_name: z.string().min(2),
  class_name: z.string().optional(),
  student_id: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  session_id: z.string().uuid().optional().or(z.literal("")),
});

export async function importParticipantsCsvAction(eventId: string, csvText: string) {
  await requireRole(["super_admin", "admin"]);
  const supabaseAdmin = getSupabaseAdmin();
  const parseRes = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parseRes.errors.length) {
    return { ok: false, message: "Invalid CSV format." };
  }

  const rows = parseRes.data
    .map((r) => csvParticipantSchema.safeParse(r))
    .filter((r) => r.success)
    .map((r) => r.data);

  if (!rows.length) {
    return { ok: false, message: "No valid rows found." };
  }

  const payload = rows.map((row) => ({
    event_id: eventId,
    ...row,
    session_id: row.session_id || null,
    ticket_token_hash: hashTicketToken(generateRawTicketToken()),
    ticket_short_code: generateShortCode(),
  }));

  const { error } = await supabaseAdmin.from("participants").insert(payload);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: `Imported ${payload.length} participants.` };
}

export async function revokeTicketAction(participantId: string) {
  await requireRole(["super_admin", "admin"]);
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin
    .from("participants")
    .update({ ticket_status: "revoked" })
    .eq("id", participantId);
  return { ok: !error, message: error?.message ?? "Ticket revoked." };
}

export async function reissueTicketAction(participantId: string) {
  await requireRole(["super_admin", "admin"]);
  const supabaseAdmin = getSupabaseAdmin();
  const rawToken = generateRawTicketToken();
  const tokenHash = hashTicketToken(rawToken);
  const shortCode = generateShortCode();

  const { error } = await supabaseAdmin
    .from("participants")
    .update({
      ticket_status: "active",
      ticket_token_hash: tokenHash,
      ticket_short_code: shortCode,
      checkin_status: "not_checked_in",
      checked_in_at: null,
      checked_in_by: null,
    })
    .eq("id", participantId);

  return { ok: !error, message: error?.message ?? "Ticket reissued.", rawToken };
}

export async function exportParticipantsCsvAction(eventId: string) {
  await requireRole(["super_admin", "admin"]);
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from("participants")
    .select("full_name,class_name,student_id,phone,email,checkin_status,photo_status,ticket_short_code")
    .eq("event_id", eventId);

  const csv = Papa.unparse(data ?? []);
  return { csv };
}
