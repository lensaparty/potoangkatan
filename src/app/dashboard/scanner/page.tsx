import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ScannerPanel } from "@/components/app/scanner-panel";
import { EmptyState } from "@/components/app/empty-state";

export const dynamic = "force-dynamic";

export default async function ScannerPage() {
  await requireRole(["super_admin", "admin", "gate_crew", "photographer"]);
  const supabaseAdmin = getSupabaseAdmin();
  const { data: events } = await supabaseAdmin
    .from("events")
    .select("slug,name")
    .eq("is_active", true)
    .limit(1);

  const event = events?.[0];
  if (!event) return <EmptyState title="No active event" description="Create and activate an event first." />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">QR Scanner</h1>
      <p className="text-sm text-zinc-600">Event: {event.name}</p>
      <ScannerPanel eventSlug={event.slug} />
    </div>
  );
}
