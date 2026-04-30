import { hashTicketToken } from "@/lib/security/tokens";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function getParticipantByRawToken(eventSlug: string, rawToken: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const tokenHash = hashTicketToken(rawToken);
  const { data: event } = await supabaseAdmin
    .from("events")
    .select("id,slug,name,date,location,description,cover_image_url")
    .eq("slug", eventSlug)
    .single();

  if (!event) return null;

  const { data: participant } = await supabaseAdmin
    .from("participants")
    .select("*")
    .eq("event_id", event.id)
    .eq("ticket_token_hash", tokenHash)
    .maybeSingle();

  if (!participant) return null;
  return { event, participant };
}
