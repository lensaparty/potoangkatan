"use client";

import { useState } from "react";
import Link from "next/link";
import { registerParticipantPublicAction } from "@/server/actions/public-actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterClient({ eventSlug }: { eventSlug: string }) {
  const [fullName, setFullName] = useState("");
  const [className, setClassName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message?: string; ticketUrl?: string } | null>(null);

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-4 py-8">
      <Card className="space-y-4">
        <h1 className="text-2xl font-semibold">Participant Registration</h1>
        <p className="text-sm text-zinc-500">Register for this event and get your secure digital ticket.</p>
        <Input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input placeholder="Class name" value={className} onChange={(e) => setClassName(e.target.value)} />
        <Input placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
        <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button
          onClick={async () => {
            const res = await registerParticipantPublicAction({
              eventSlug,
              full_name: fullName,
              class_name: className,
              student_id: studentId,
              phone,
              email,
            });
            setResult(res);
          }}
        >
          Register
        </Button>
        {result?.ok && result.ticketUrl && (
          <p className="text-sm text-emerald-700">
            Registration successful. Open your ticket: <Link href={result.ticketUrl} className="underline">View Ticket</Link>
          </p>
        )}
        {result && !result.ok && (
          <p className="text-sm text-red-600">{result.message}</p>
        )}
      </Card>
    </main>
  );
}

