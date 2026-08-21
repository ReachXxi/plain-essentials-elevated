import { supabaseAdmin } from "@/integrations/supabase/client.server";

export function adminDb() {
  return supabaseAdmin;
}

export function checkPassword(password: string) {
  const expected = process.env["ADMIN_PASSWORD"] ?? "THEPLAINSOCIETY";
  if (!password || password !== expected) throw new Error("Invalid admin password");
}

/** Mirror any change to the connected Google Sheet (Apps Script web app URL). */
export async function syncSheet(kind: string, payload: unknown) {
  try {
    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "site")
      .maybeSingle();
    const value = (data?.value ?? {}) as Record<string, unknown>;
    const url = typeof value["sheetWebhookUrl"] === "string" ? value["sheetWebhookUrl"] : "";
    if (!url) return;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, payload, at: new Date().toISOString() }),
    });
  } catch (err) {
    console.error("sheet sync failed", err);
  }
}

export async function uploadMedia(filename: string, dataUrl: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
  if (!match?.[2]) throw new Error("Invalid file data");
  const contentType = match[1] ?? "application/octet-stream";
  const bytes = Buffer.from(match[2], "base64");
  const safe = filename.replace(/[^\w.-]/g, "_");
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
  const { error } = await supabaseAdmin.storage
    .from("media")
    .upload(path, bytes, { contentType, upsert: false });
  if (error) throw new Error(error.message);
  return `/api/public/media/${path}`;
}
