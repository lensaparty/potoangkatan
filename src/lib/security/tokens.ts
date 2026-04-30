import crypto from "node:crypto";
import { getServerEnv } from "@/lib/env/server";

const TOKEN_BYTES = 24;

export function generateRawTicketToken() {
  return crypto.randomBytes(TOKEN_BYTES).toString("base64url");
}

export function hashTicketToken(rawToken: string) {
  const env = getServerEnv();
  return crypto
    .createHmac("sha256", env.TICKET_HASH_SECRET)
    .update(rawToken)
    .digest("hex");
}

export function generateShortCode() {
  return crypto.randomBytes(6).toString("hex").toUpperCase();
}
