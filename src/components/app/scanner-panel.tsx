"use client";

import { useEffect, useMemo, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { scanTicketAction } from "@/server/actions/scan-actions";
import { StatusBadge } from "@/components/app/status-badge";

type ScanMode = "entry_checkin" | "photo_booth";

export function ScannerPanel({ eventSlug }: { eventSlug: string }) {
  const [mode, setMode] = useState<ScanMode>("entry_checkin");
  const [manualInput, setManualInput] = useState("");
  const [result, setResult] = useState<{ result: string; message: string } | null>(null);
  const [ready, setReady] = useState(false);
  const scannerId = useMemo(() => "scanner-area", []);

  useEffect(() => {
    const scanner = new Html5Qrcode(scannerId);
    let active = true;

    const start = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          async (decoded) => {
            if (!active) return;
            const payload = extractRawToken(decoded);
            const res = await scanTicketAction({ mode, token: payload, eventSlug });
            setResult({ result: res.scanResult, message: res.message });
            if (navigator.vibrate) navigator.vibrate(res.scanResult === "valid" ? 80 : [70, 80, 70]);
          },
          () => undefined,
        );
        setReady(true);
      } catch {
        setReady(false);
      }
    };

    void start();
    return () => {
      active = false;
      scanner.stop();
      scanner.clear();
    };
  }, [eventSlug, mode, scannerId]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant={mode === "entry_checkin" ? "default" : "secondary"} onClick={() => setMode("entry_checkin")}>
          Entry Check-In
        </Button>
        <Button variant={mode === "photo_booth" ? "default" : "secondary"} onClick={() => setMode("photo_booth")}>
          Photo Booth
        </Button>
      </div>
      <div className="rounded-2xl border bg-black/95 p-2">
        <div id={scannerId} className="min-h-80 w-full overflow-hidden rounded-xl" />
      </div>
      {!ready && (
        <p className="text-sm text-amber-700">
          Camera not ready. Use manual token input below.
        </p>
      )}
      <div className="flex gap-2">
        <Input
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="Paste token or ticket URL"
        />
        <Button
          onClick={async () => {
            const payload = extractRawToken(manualInput);
            const res = await scanTicketAction({ mode, token: payload, eventSlug });
            setResult({ result: res.scanResult, message: res.message });
          }}
        >
          Validate
        </Button>
        <Button variant="outline" onClick={() => setResult(null)}>Clear</Button>
      </div>
      {result && (
        <div
          className={`rounded-2xl border p-4 ${
            result.result === "valid"
              ? "border-emerald-300 bg-emerald-50"
              : result.result === "already_used"
                ? "border-amber-300 bg-amber-50"
                : "border-red-300 bg-red-50"
          }`}
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="font-semibold">Scan Result</p>
            <StatusBadge status={result.result} />
          </div>
          <p className="text-sm text-zinc-600">{result.message}</p>
        </div>
      )}
    </div>
  );
}

function extractRawToken(input: string) {
  try {
    const u = new URL(input);
    const p = u.pathname.split("/");
    return p[p.length - 1] ?? input;
  } catch {
    return input.trim();
  }
}
