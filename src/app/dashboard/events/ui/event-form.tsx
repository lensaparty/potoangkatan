"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { eventSchema } from "@/lib/validation";
import { createEventAction } from "@/server/actions/event-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type EventInput = z.infer<typeof eventSchema>;

export function EventForm() {
  const [message, setMessage] = useState("");
  const form = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: { name: "", slug: "" },
  });

  return (
    <Card className="space-y-3">
      <h2 className="text-lg font-semibold">Create Event</h2>
      <form
        className="grid gap-3 md:grid-cols-2"
        onSubmit={form.handleSubmit(async (values) => {
          const res = await createEventAction(values);
          setMessage(res.message);
        })}
      >
        <Input placeholder="Event name" {...form.register("name")} />
        <Input placeholder="event-slug" {...form.register("slug")} />
        <Input type="date" {...form.register("date")} />
        <Input placeholder="Location" {...form.register("location")} />
        <Input type="datetime-local" {...form.register("checkin_starts_at")} />
        <Input type="datetime-local" {...form.register("checkin_ends_at")} />
        <div className="md:col-span-2">
          <Textarea rows={3} placeholder="Description" {...form.register("description")} />
        </div>
        <Button type="submit">Create Event</Button>
      </form>
      {message && <p className="text-sm text-zinc-600">{message}</p>}
    </Card>
  );
}

