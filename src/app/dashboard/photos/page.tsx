import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { PhotoUploader } from "@/components/app/photo-uploader";
import { PhotoList } from "./ui/photo-list";

export const dynamic = "force-dynamic";

export default async function PhotosPage() {
  await requireRole(["super_admin", "admin", "photographer"]);
  const supabaseAdmin = getSupabaseAdmin();
  const [{ data: events }, { data: photos }] = await Promise.all([
    supabaseAdmin.from("events").select("id,name").eq("is_active", true).limit(1),
    supabaseAdmin
      .from("photos")
      .select("id,file_name,class_name,visibility,created_at")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const event = events?.[0];
  if (!event) return <p>No active event found.</p>;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Photo Management</h1>
      <PhotoUploader eventId={event.id} />
      <PhotoList photos={(photos ?? []).map((p) => ({ ...p, visibility: p.visibility as "hidden" | "visible" }))} />
    </div>
  );
}
