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
            setLoading(true);
            setError("");
            const supabase = createClient();
            const { error: signError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (signError) {
              setError("Login failed.");
              setLoading(false);
              return;
            }
            const { data } = await supabase.from("profiles").select("role").single();
            const destination =
              data?.role === "gate_crew" || data?.role === "photographer"
                ? "/dashboard/scanner"
                : "/dashboard";
            router.push(destination);
            router.refresh();
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </Card>
    </main>
  );
}
