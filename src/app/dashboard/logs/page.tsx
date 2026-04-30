import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { StatusBadge } from "@/components/app/status-badge";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
  await requireRole(["super_admin", "admin"]);
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from("scan_logs")
    .select("id,scan_type,scan_result,created_at,participant_id")
    .order("created_at", { ascending: false })
    .limit(300);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Scan Audit Logs</h1>
      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Result</th>
              <th className="px-3 py-2">Participant</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row) => (
              <tr key={row.id} className="border-t">
                <td className="px-3 py-2">{new Date(row.created_at).toLocaleString()}</td>
                <td className="px-3 py-2">{row.scan_type}</td>
                <td className="px-3 py-2"><StatusBadge status={row.scan_result} /></td>
                <td className="px-3 py-2">{row.participant_id ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
