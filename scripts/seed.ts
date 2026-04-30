import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

const supabase = createClient(
  env("NEXT_PUBLIC_SUPABASE_URL"),
  env("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false } },
);

function hashToken(rawToken: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(rawToken).digest("hex");
}

function randomToken() {
  return crypto.randomBytes(24).toString("base64url");
}

async function run() {
  const secret = env("TICKET_HASH_SECRET");
  const appUrl = env("NEXT_PUBLIC_APP_URL");

  const { data: event, error: eventErr } = await supabase
    .from("events")
    .upsert(
      {
        name: "Foto Angkatan 2026",
        slug: "demo-event",
        location: "Hall A",
        description: "Demo event for AngkatanPass",
        is_active: true,
      },
      { onConflict: "slug" },
    )
    .select("id,slug")
    .single();
  if (eventErr || !event) throw new Error(eventErr?.message ?? "Event create failed");

  const demoRows = [
    { full_name: "Alya Pratama", class_name: "XII IPA 1", student_id: "S-001" },
    { full_name: "Bima Santoso", class_name: "XII IPA 1", student_id: "S-002" },
    { full_name: "Citra Wulandari", class_name: "XII IPS 2", student_id: "S-003" },
  ];

  const created: Array<{ full_name: string; url: string }> = [];
  for (const row of demoRows) {
    const raw = randomToken();
    const hash = hashToken(raw, secret);
    const shortCode = crypto.randomBytes(6).toString("hex").toUpperCase();
    const { error } = await supabase.from("participants").insert({
      event_id: event.id,
      full_name: row.full_name,
      class_name: row.class_name,
      student_id: row.student_id,
      ticket_token_hash: hash,
      ticket_short_code: shortCode,
    });
    if (!error) {
      created.push({ full_name: row.full_name, url: `${appUrl}/t/${event.slug}/${raw}` });
    }
  }

  console.log("Seed complete.");
  console.log("Ticket URLs (share securely):");
  created.forEach((p) => console.log(`${p.full_name}: ${p.url}`));
}

void run();

