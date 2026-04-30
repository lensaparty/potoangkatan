import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "checked_in" || status === "photographed" || status === "active"
      ? "bg-emerald-100 text-emerald-800"
      : status.includes("revoked") || status.includes("invalid")
        ? "bg-red-100 text-red-800"
        : status.includes("already")
          ? "bg-amber-100 text-amber-800"
          : "bg-zinc-100 text-zinc-800";

  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", tone)}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

