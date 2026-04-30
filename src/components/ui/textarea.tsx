import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-400 transition focus:ring-2",
        props.className,
      )}
    />
  );
}

