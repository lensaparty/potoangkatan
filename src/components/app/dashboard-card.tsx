import { Card } from "@/components/ui/card";

export function DashboardCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <Card className="bg-gradient-to-br from-white to-zinc-50">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </Card>
  );
}

