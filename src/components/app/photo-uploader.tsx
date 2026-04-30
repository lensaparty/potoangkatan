"use client";

import { useState } from "react";
import { uploadPhotoAction } from "@/server/actions/photo-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PhotoUploader({ eventId }: { eventId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [participantId, setParticipantId] = useState("");
  const [className, setClassName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-3 rounded-2xl border bg-white p-4">
      <h3 className="font-semibold">Upload Photo</h3>
      <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <Input placeholder="Participant ID (optional)" value={participantId} onChange={(e) => setParticipantId(e.target.value)} />
      <Input placeholder="Class name (optional)" value={className} onChange={(e) => setClassName(e.target.value)} />
      <Input placeholder="Session ID (optional)" value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
      <Button
        onClick={async () => {
          if (!file) return setMessage("Please choose a file.");
          const formData = new FormData();
          formData.set("file", file);
          formData.set("eventId", eventId);
          formData.set("participantId", participantId);
          formData.set("className", className);
          formData.set("sessionId", sessionId);
          const res = await uploadPhotoAction(formData);
          setMessage(res.message);
        }}
      >
        Upload
      </Button>
      {message && <p className="text-sm text-zinc-600">{message}</p>}
    </div>
  );
}

