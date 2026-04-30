import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ParticipantManager } from "./ui/participant-manager";

export const dynamic = "force-dynamic";

export default async function ParticipantsPage() {
  await requireRole(["super_admin", "admin"]);
  const supabaseAdmin = getSupabaseAdmin();
  const [{ data: participants }, { data: events }, { data: sessions }] = await Promise.all([
    supabaseAdmin
      .from("participants")
      .select("id,event_id,full_name,class_name,student_id,phone,email,session_id,ticket_status,checkin_status,photo_status,ticket_short_code")
      .order("created_at", { ascending: false })
      .limit(300),
    supabaseAdmin.from("events").select("id,name,slug").eq("is_active", true),
    supabaseAdmin.from("photo_sessions").select("id,event_id,name"),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Participant Management</h1>
      <ParticipantManager
        events={events ?? []}
        sessions={sessions ?? []}
        participants={participants ?? []}
      />
    </div>
  );
}
