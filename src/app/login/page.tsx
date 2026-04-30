"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <Card className="w-full space-y-4">
        <h1 className="text-2xl font-semibold">Staff Login</h1>
        <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button
          className="w-full"
          disabled={loading}
          onClick={async () => {
            try {
              setLoading(true);
              setError("");
              const supabase = createClient();
              const { error: signError } = await supabase.auth.signInWithPassword({
                email,
                password,
              });
              if (signError) {
                setError("Login gagal. Cek email/password.");
                return;
              }

              const profilePromise = supabase
                .from("profiles")
                .select("role")
                .single();
              const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("timeout")), 10000),
              );
              const { data } = await Promise.race([profilePromise, timeoutPromise]);

              const destination =
                data?.role === "gate_crew" || data?.role === "photographer"
                  ? "/dashboard/scanner"
                  : "/dashboard";
              router.replace(destination);
              router.refresh();
            } catch {
              setError(
                "Sesi login berhasil, tapi redirect gagal. Coba refresh halaman atau login ulang.",
              );
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </Card>
    </main>
  );
}
