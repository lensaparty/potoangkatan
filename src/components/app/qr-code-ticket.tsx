"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Image from "next/image";

export function QRCodeTicket({ value }: { value: string }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    void QRCode.toDataURL(value, {
      width: 320,
      margin: 1,
      color: { dark: "#111111", light: "#ffffff" },
    }).then(setUrl);
  }, [value]);

  if (!url) return <div className="h-72 w-72 animate-pulse rounded-2xl bg-zinc-100" />;
  return (
    <Image
      src={url}
      alt="Ticket QR code"
      width={288}
      height={288}
      unoptimized
      className="h-72 w-72 rounded-2xl border p-3"
    />
  );
}
