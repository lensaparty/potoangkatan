import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();

  const links = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/events", label: "Events" },
    { href: "/dashboard/participants", label: "Participants" },
    { href: "/dashboard/scanner", label: "Scanner" },
    { href: "/dashboard/photos", label: "Photos" },
    { href: "/dashboard/logs", label: "Scan Logs" },
  ];

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <aside className="border-r bg-white p-4">
        <h2 className="text-lg font-bold">AngkatanPass</h2>
        <p className="mt-1 text-xs text-zinc-500">{profile.role.replace("_", " ")}</p>
        <nav className="mt-4 space-y-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="block rounded-xl px-3 py-2 text-sm hover:bg-zinc-100">
              {link.label}
            </Link>
          ))}
        </nav>
        <form
          action={async () => {
            "use server";
            await supabase.auth.signOut();
            redirect("/login");
          }}
          className="mt-6"
        >
          <Button variant="outline" className="w-full">Sign Out</Button>
        </form>
      </aside>
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}
