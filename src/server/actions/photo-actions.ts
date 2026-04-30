"use server";

import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sanitizeFilename } from "@/lib/utils";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 8 * 1024 * 1024;

export async function uploadPhotoAction(formData: FormData) {
  const profile = await requireRole([
    "super_admin",
    "admin",
    "photographer",
  ]);
  const supabaseAdmin = getSupabaseAdmin();

  const file = formData.get("file");
  const eventId = String(formData.get("eventId") ?? "");
  const participantId = String(formData.get("participantId") ?? "") || null;
  const className = String(formData.get("className") ?? "") || null;
  const sessionId = String(formData.get("sessionId") ?? "") || null;

  if (!(file instanceof File)) return { ok: false, message: "File is required." };
  if (!ALLOWED_TYPES.has(file.type)) return { ok: false, message: "Unsupported file type." };
  if (file.size > MAX_BYTES) return { ok: false, message: "File exceeds 8MB limit." };

  const cleanName = sanitizeFilename(file.name);
  const ext = cleanName.split(".").pop() ?? "jpg";
  const path = `${eventId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const uploadRes = await supabaseAdmin.storage
    .from("event-photos")
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadRes.error) return { ok: false, message: uploadRes.error.message };

  const { error } = await supabaseAdmin.from("photos").insert({
    event_id: eventId,
    participant_id: participantId,
    session_id: sessionId,
    class_name: className,
    storage_path: path,
    file_name: cleanName,
    mime_type: file.type,
    size_bytes: file.size,
    visibility: "hidden",
    uploaded_by: profile.id,
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Photo uploaded successfully." };
}

export async function setPhotoVisibilityAction(photoId: string, visibility: "hidden" | "visible") {
  await requireRole(["super_admin", "admin", "photographer"]);
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin
    .from("photos")
    .update({ visibility })
    .eq("id", photoId);
  return { ok: !error, message: error?.message ?? "Photo updated." };
}
