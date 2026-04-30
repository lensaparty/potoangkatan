"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LookupPage() {
  const [url, setUrl] = useState("");
  const [eventSlug, setEventSlug] = useState("");
  const [token, setToken] = useState("");
  const router = useRouter();

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-4 py-10">
      <Card className="space-y-4">
        <h1 className="text-2xl font-semibold">Ticket Lookup</h1>
        <p className="text-sm text-zinc-500">Paste your full ticket URL, or enter event slug + token.</p>
        <Input placeholder="https://.../t/event-slug/token" value={url} onChange={(e) => setUrl(e.target.value)} />
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="event slug" value={eventSlug} onChange={(e) => setEventSlug(e.target.value)} />
          <Input placeholder="raw token" value={token} onChange={(e) => setToken(e.target.value)} />
        </div>
        <Button
          onClick={() => {
            if (url.trim()) {
              try {
                const u = new URL(url);
                router.push(u.pathname);
                return;
              } catch {
                return;
              }
            }
            if (eventSlug && token) router.push(`/t/${eventSlug}/${token}`);
          }}
        >
          Open Ticket
        </Button>
      </Card>
    </main>
  );
}

