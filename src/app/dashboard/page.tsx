import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { DashboardCard } from "@/components/app/dashboard-card";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const profile = await requireRole(["super_admin", "admin", "gate_crew", "photographer"]);
  const supabaseAdmin = getSupabaseAdmin();

  const [{ count: total }, { count: checkedIn }, { count: photographed }, { count: photosCount }, { count: invalidScans }] =
    await Promise.all([
      supabaseAdmin.from("participants").select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("participants")
        .select("*", { count: "exact", head: true })
        .eq("checkin_status", "checked_in"),
      supabaseAdmin
        .from("participants")
        .select("*", { count: "exact", head: true })
        .eq("photo_status", "photographed"),
      supabaseAdmin.from("photos").select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("scan_logs")
        .select("*", { count: "exact", head: true })
        .in("scan_result", ["invalid", "already_used", "revoked", "wrong_event"]),
    ]);

  const notCheckedIn = (total ?? 0) - (checkedIn ?? 0);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Dashboard Overview</h1>

      <Card className="space-y-3 border-l-4 border-l-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Quick Start Panitia</p>
        {profile.role === "admin" || profile.role === "super_admin" ? (
          <>
            <h2 className="text-lg font-semibold">Urutan kerja yang direkomendasikan</h2>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-700">
              <li>Buat atau cek event aktif di menu Events.</li>
              <li>Input/import peserta di menu Participants.</li>
              <li>Brief gate crew untuk scan mode Entry Check-In.</li>
              <li>Brief fotografer untuk scan mode Photo Booth.</li>
              <li>Upload foto lalu publish yang sudah siap.</li>
            </ol>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link href="/dashboard/events"><Button variant="outline">Buka Events</Button></Link>
              <Link href="/dashboard/participants"><Button variant="outline">Buka Participants</Button></Link>
              <Link href="/dashboard/scanner"><Button variant="outline">Buka Scanner</Button></Link>
              <Link href="/dashboard/photos"><Button variant="outline">Buka Photos</Button></Link>
            </div>
          </>
        ) : profile.role === "gate_crew" ? (
          <>
            <h2 className="text-lg font-semibold">Panduan cepat gate crew</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
              <li>Masuk ke Scanner dan pilih mode Entry Check-In.</li>
              <li>Hijau: peserta valid, boleh masuk.</li>
              <li>Kuning: QR sudah dipakai, arahkan ke admin.</li>
              <li>Merah: invalid/revoked/wrong event, tolak masuk.</li>
            </ul>
            <Link href="/dashboard/scanner"><Button>Buka Scanner Sekarang</Button></Link>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold">Panduan cepat fotografer</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
              <li>Masuk ke Scanner dan pilih mode Photo Booth.</li>
              <li>Scan QR peserta sebelum sesi foto.</li>
              <li>Upload foto di menu Photos.</li>
              <li>Set visibility jadi visible jika sudah lolos pengecekan.</li>
            </ul>
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/scanner"><Button>Buka Scanner</Button></Link>
              <Link href="/dashboard/photos"><Button variant="outline">Buka Photos</Button></Link>
            </div>
          </>
        )}
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard label="Total Participants" value={total ?? 0} />
        <DashboardCard label="Checked In" value={checkedIn ?? 0} />
        <DashboardCard label="Not Checked In" value={notCheckedIn} />
        <DashboardCard label="Photographed" value={photographed ?? 0} />
        <DashboardCard label="Photos Uploaded" value={photosCount ?? 0} />
        <DashboardCard label="Invalid/Repeated Scans" value={invalidScans ?? 0} />
      </div>
    </div>
  );
}
