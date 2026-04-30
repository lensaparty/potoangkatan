import { getParticipantByRawToken } from "@/lib/tickets";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { GalleryGrid } from "@/components/app/gallery-grid";
import { EmptyState } from "@/components/app/empty-state";

export const dynamic = "force-dynamic";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ eventSlug: string; token: string }>;
}) {
  const { eventSlug, token } = await params;
  const record = await getParticipantByRawToken(eventSlug, token);
  if (!record) {
    return <main className="mx-auto max-w-lg px-4 py-10">Gallery access denied.</main>;
  }

  const { event, participant } = record;
  const supabaseAdmin = getSupabaseAdmin();

  const { data: photos } = await supabaseAdmin
    .from("photos")
    .select("id,file_name,storage_path")
    .eq("event_id", event.id)
    .eq("visibility", "visible")
    .or(
      `participant_id.eq.${participant.id},class_name.eq.${participant.class_name ?? "__none__"},session_id.eq.${participant.session_id ?? "00000000-0000-0000-0000-000000000000"}`,
    );

  const mapped = (photos ?? []).map((p) => ({
    id: p.id,
    file_name: p.file_name,
    storage_path: p.storage_path,
  }));

  const signed = await Promise.all(
    mapped.map(async (photo) => {
      const { data } = await supabaseAdmin.storage
        .from("event-photos")
        .createSignedUrl(photo.storage_path, 60 * 10);
      return {
        id: photo.id,
        file_name: photo.file_name,
        public_url: data?.signedUrl ?? "",
      };
    }),
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold">My Gallery</h1>
      <p className="mt-1 text-sm text-zinc-500">{participant.full_name} • {event.name}</p>
      <div className="mt-4">
        {signed.filter((x) => x.public_url).length ? (
          <GalleryGrid photos={signed.filter((x) => x.public_url)} />
        ) : (
          <EmptyState title="No photos yet" description="Photos will appear here once published by the committee." />
        )}
      </div>
    </main>
  );
}
