"use client";

import { useState } from "react";
import { setPhotoVisibilityAction } from "@/server/actions/photo-actions";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/app/status-badge";

type Photo = {
  id: string;
  file_name: string | null;
  class_name: string | null;
  visibility: "hidden" | "visible";
};

export function PhotoList({ photos }: { photos: Photo[] }) {
  const [message, setMessage] = useState("");

  return (
    <div className="rounded-2xl border bg-white p-4">
      <h2 className="mb-2 text-lg font-semibold">Recent Uploads</h2>
      <div className="space-y-2">
        {photos.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border p-2 text-sm">
            <div>
              <p className="font-medium">{p.file_name ?? "Photo"}</p>
              <p className="text-zinc-500">{p.class_name ?? "-"}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={p.visibility} />
              <Button
                variant="outline"
                onClick={async () => {
                  const next = p.visibility === "visible" ? "hidden" : "visible";
                  const res = await setPhotoVisibilityAction(p.id, next);
                  setMessage(res.message);
                }}
              >
                Toggle
              </Button>
            </div>
          </div>
        ))}
      </div>
      {message && <p className="mt-2 text-sm text-zinc-600">{message}</p>}
    </div>
  );
}

