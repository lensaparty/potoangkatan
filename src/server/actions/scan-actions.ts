"use server";

import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { hashTicketToken } from "@/lib/security/tokens";
import type { ScanResult } from "@/lib/types";
import { scanSchema } from "@/lib/validation";

const rateMap = new Map<string, { count: number; at: number }>();
const RATE_WINDOW_MS = 15_000;
const RATE_LIMIT = 20;

export async function scanTicketAction(input: z.infer<typeof scanSchema>) {
  const supabaseAdmin = getSupabaseAdmin();
  const payload = scanSchema.parse(input);
  const profile = await requireRole([
    "super_admin",
    "admin",
    "gate_crew",
    "photographer",
  ]);

  const { data: event } = await supabaseAdmin
    .from("events")
    .select("id,slug,checkin_starts_at,checkin_ends_at")
    .eq("slug", payload.eventSlug)
    .single();

  if (!event) {
    return { scanResult: "wrong_event" as ScanResult, message: "Event not found." };
  }

  if (profile.role === "gate_crew" && payload.mode !== "entry_checkin") {
    await supabaseAdmin.from("scan_logs").insert({
      event_id: event.id,
      participant_id: null,
      scanned_by: profile.id,
      scan_type: payload.mode,
      scan_result: "invalid",
      raw_token_hash: hashTicketToken(payload.token),
      metadata: { reason: "unauthorized_mode", role: profile.role },
    });
    return { scanResult: "invalid" as ScanResult, message: "Unauthorized scan mode." };
  }
  if (profile.role === "photographer" && payload.mode !== "photo_booth") {
    await supabaseAdmin.from("scan_logs").insert({
      event_id: event.id,
      participant_id: null,
      scanned_by: profile.id,
      scan_type: payload.mode,
      scan_result: "invalid",
      raw_token_hash: hashTicketToken(payload.token),
      metadata: { reason: "unauthorized_mode", role: profile.role },
    });
    return { scanResult: "invalid" as ScanResult, message: "Unauthorized scan mode." };
  }

  const limiterKey = `${profile.id}:${payload.mode}`;
  const now = Date.now();
  const current = rateMap.get(limiterKey);
  if (current && now - current.at < RATE_WINDOW_MS && current.count >= RATE_LIMIT) {
    await supabaseAdmin.from("scan_logs").insert({
      event_id: event.id,
      participant_id: null,
      scanned_by: profile.id,
      scan_type: payload.mode,
      scan_result: "invalid",
      raw_token_hash: hashTicketToken(payload.token),
      metadata: { reason: "rate_limited", role: profile.role },
    });
    return { scanResult: "invalid" as ScanResult, message: "Too many scans. Slow down." };
  }
  rateMap.set(limiterKey, {
    count: current && now - current.at < RATE_WINDOW_MS ? current.count + 1 : 1,
    at: now,
  });

  const rawTokenHash = hashTicketToken(payload.token);
  const { data: participant } = await supabaseAdmin
    .from("participants")
    .select("*")
    .eq("ticket_token_hash", rawTokenHash)
    .maybeSingle();

  let scanResult: ScanResult = "invalid";
  let message = "Ticket not recognized.";

  if (!participant) {
    scanResult = "invalid";
  } else if (participant.event_id !== event.id) {
    scanResult = "wrong_event";
    message = "Ticket belongs to another event.";
  } else if (participant.ticket_status === "revoked") {
    scanResult = "revoked";
    message = "Ticket revoked.";
  } else if (
    payload.mode === "entry_checkin" &&
    event.checkin_starts_at &&
    new Date(event.checkin_starts_at).getTime() > now
  ) {
    scanResult = "expired_window";
    message = "Check-in window has not started.";
  } else if (
    payload.mode === "entry_checkin" &&
    event.checkin_ends_at &&
    new Date(event.checkin_ends_at).getTime() < now
  ) {
    scanResult = "expired_window";
    message = "Check-in window has ended.";
  } else if (
    payload.mode === "entry_checkin" &&
    participant.checkin_status === "checked_in"
  ) {
    scanResult = "already_used";
    message = `Already checked in at ${participant.checked_in_at ?? "-"}.`;
  } else if (
    payload.mode === "photo_booth" &&
    participant.photo_status === "photographed"
  ) {
    scanResult = "already_used";
    message = `Already photographed at ${participant.photographed_at ?? "-"}.`;
  } else {
    scanResult = "valid";
    message =
      payload.mode === "entry_checkin"
        ? "Check-in successful."
        : "Participant marked as photographed.";

    if (payload.mode === "entry_checkin") {
      await supabaseAdmin
        .from("participants")
        .update({
          checkin_status: "checked_in",
          checked_in_at: new Date().toISOString(),
          checked_in_by: profile.id,
          ticket_status: "used",
        })
        .eq("id", participant.id);
    } else {
      await supabaseAdmin
        .from("participants")
        .update({
          photo_status: "photographed",
          photographed_at: new Date().toISOString(),
          photographed_by: profile.id,
        })
        .eq("id", participant.id);
    }
  }

  await supabaseAdmin.from("scan_logs").insert({
    event_id: event.id,
    participant_id: participant?.id ?? null,
    scanned_by: profile.id,
    scan_type: payload.mode,
    scan_result: scanResult,
    raw_token_hash: rawTokenHash,
    metadata: {
      role: profile.role,
      userAgent: "browser",
    },
  });

  return { scanResult, message };
}
