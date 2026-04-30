"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <Card className="w-full space-y-4">
        <h1 className="text-xl font-semibold">Forgot Password</h1>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <Button
          className="w-full"
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.resetPasswordForEmail(email);
            setMessage("If this email exists, reset instructions were sent.");
          }}
        >
          Send Reset Link
        </Button>
        {message && <p className="text-sm text-zinc-600">{message}</p>}
      </Card>
    </main>
  );
}

