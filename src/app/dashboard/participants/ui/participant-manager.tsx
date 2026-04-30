"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { participantSchema } from "@/lib/validation";
import { createParticipantAction, exportParticipantsCsvAction, importParticipantsCsvAction, reissueTicketAction, revokeTicketAction } from "@/server/actions/participant-actions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/app/status-badge";

type ParticipantInput = z.infer<typeof participantSchema>;

type Props = {
  events: { id: string; name: string; slug: string }[];
  sessions: { id: string; event_id: string; name: string }[];
  participants: {
    id: string;
    event_id: string;
    full_name: string;
    class_name: string | null;
    student_id: string | null;
    phone: string | null;
    email: string | null;
    session_id: string | null;
    ticket_status: string;
    checkin_status: string;
    photo_status: string;
    ticket_short_code: string;
  }[];
};

export function ParticipantManager({ events, sessions, participants }: Props) {
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [csvText, setCsvText] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id ?? "");
  const form = useForm<ParticipantInput>({
    resolver: zodResolver(participantSchema),
    defaultValues: { event_id: events[0]?.id ?? "", full_name: "" },
  });

  const filtered = useMemo(
    () =>
      participants.filter((p) => {
        const q = search.toLowerCase();
        return (
          p.full_name.toLowerCase().includes(q) ||
          (p.class_name ?? "").toLowerCase().includes(q) ||
          (p.student_id ?? "").toLowerCase().includes(q)
        );
      }),
    [participants, search],
  );

  return (
    <div className="space-y-5">
      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">Add Participant</h2>
        <form
          className="grid gap-3 md:grid-cols-3"
          onSubmit={form.handleSubmit(async (values) => {
            const res = await createParticipantAction(values);
            setMessage(
              res.ok
                ? `Participant created. Raw token (share once): ${res.rawToken ?? "-"}`
                : (res.message ?? "Failed to create participant."),
            );
          })}
        >
          <select className="rounded-xl border px-3 py-2 text-sm" {...form.register("event_id")}>
            {events.map((event) => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>
          <Input placeholder="Full name" {...form.register("full_name")} />
          <Input placeholder="Class" {...form.register("class_name")} />
          <Input placeholder="Student ID" {...form.register("student_id")} />
          <Input placeholder="Phone" {...form.register("phone")} />
          <Input placeholder="Email" {...form.register("email")} />
          <select className="rounded-xl border px-3 py-2 text-sm" {...form.register("session_id")}>
            <option value="">No session</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>{session.name}</option>
            ))}
          </select>
          <Button type="submit">Create + Generate QR</Button>
        </form>
        {message && <p className="text-sm text-zinc-600">{message}</p>}
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">CSV Import / Export</h2>
        <div className="flex flex-wrap gap-2">
          <select className="rounded-xl border px-3 py-2 text-sm" value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
            {events.map((event) => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>
          <Button
            onClick={async () => {
              const res = await exportParticipantsCsvAction(selectedEventId);
              const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = "participants-export.csv";
              a.click();
            }}
          >
            Export CSV
          </Button>
        </div>
        <textarea
          className="h-40 w-full rounded-xl border p-3 text-sm"
          placeholder="Paste CSV data here..."
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
        />
        <Button
          onClick={async () => {
            const res = await importParticipantsCsvAction(selectedEventId, csvText);
            setMessage(res.message);
          }}
        >
          Import CSV
        </Button>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Participants</h2>
          <Input placeholder="Search name / student ID / class" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-left">
              <tr>
                {["Name", "Class", "Student ID", "Check-in", "Photo", "Ticket", "Actions"].map((h) => (
                  <th key={h} className="px-3 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2">{p.full_name}</td>
                  <td className="px-3 py-2">{p.class_name ?? "-"}</td>
                  <td className="px-3 py-2">{p.student_id ?? "-"}</td>
                  <td className="px-3 py-2"><StatusBadge status={p.checkin_status} /></td>
                  <td className="px-3 py-2"><StatusBadge status={p.photo_status} /></td>
                  <td className="px-3 py-2"><StatusBadge status={p.ticket_status} /></td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={async () => setMessage((await reissueTicketAction(p.id)).message)}>Reissue</Button>
                      <Button variant="destructive" onClick={async () => setMessage((await revokeTicketAction(p.id)).message)}>Revoke</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
