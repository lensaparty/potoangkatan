import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { DataTable } from "@/components/app/data-table";
import { EventForm } from "./ui/event-form";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  await requireRole(["super_admin", "admin"]);
  const supabaseAdmin = getSupabaseAdmin();
  const { data: events } = await supabaseAdmin
    .from("events")
    .select("id,name,slug,date,location,is_active")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Event Management</h1>
      <EventForm />
      <DataTable
        headers={["Name", "Slug", "Date", "Location", "Status"]}
        rows={(events ?? []).map((event) => [
          event.name,
          event.slug,
          event.date ?? "-",
          event.location ?? "-",
          event.is_active ? "Active" : "Inactive",
        ])}
      />
    </div>
  );
}
