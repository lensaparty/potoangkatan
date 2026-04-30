import Link from "next/link";
import Image from "next/image";
import { getParticipantByRawToken } from "@/lib/tickets";
import { getPublicEnv } from "@/lib/env/public";
import { QRCodeTicket } from "@/components/app/qr-code-ticket";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/app/status-badge";

export const dynamic = "force-dynamic";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ eventSlug: string; token: string }>;
}) {
  const { eventSlug, token } = await params;
  const env = getPublicEnv();
  const record = await getParticipantByRawToken(eventSlug, token);
  if (!record) {
    return <main className="mx-auto max-w-lg px-4 py-10">Ticket not found or invalid.</main>;
  }

  const { event, participant } = record;
  const ticketUrl = `/t/${event.slug}/${token}`;

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg px-4 py-8">
      <Card className="space-y-4">
        {event.cover_image_url && (
          <Image
            src={event.cover_image_url}
            alt={event.name}
            width={1200}
            height={400}
            unoptimized
            className="h-44 w-full rounded-xl object-cover"
          />
        )}
        <h1 className="text-2xl font-bold">{event.name}</h1>
        <p className="text-sm text-zinc-500">{participant.full_name} • {participant.class_name ?? "Participant"}</p>
        <div className="flex justify-center">
          <QRCodeTicket value={`${env.NEXT_PUBLIC_APP_URL}${ticketUrl}`} />
        </div>
        <div className="flex gap-2">
          <StatusBadge status={participant.ticket_status} />
          <StatusBadge status={participant.checkin_status} />
          <StatusBadge status={participant.photo_status} />
        </div>
        <p className="text-sm text-amber-700">Do not share this QR code. It grants event access.</p>
        <Link href={`/g/${event.slug}/${token}`} className="text-sm underline">Open my gallery</Link>
      </Card>
    </main>
  );
}
