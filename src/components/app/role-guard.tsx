import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import type { AppRole } from "@/lib/types";

export async function RoleGuard({
  allow,
  children,
}: {
  allow: AppRole[];
  children: ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile || !allow.includes(profile.role)) redirect("/unauthorized");
  return <>{children}</>;
}

