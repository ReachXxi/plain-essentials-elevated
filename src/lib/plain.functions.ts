import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
type JsonObj = Record<string, Json>;

export const getSiteData = createServerFn({ method: "GET" }).handler(async () => {
  const { adminDb } = await import("./plain.server");
  const db = adminDb();
  const [settings, products, gallery] = await Promise.all([
    db.from("site_settings").select("value").eq("key", "site").maybeSingle(),
    db.from("products").select("*").eq("active", true).order("sort_order"),
    db.from("gallery").select("*").order("sort_order"),
  ]);
  return {
    settings: (settings.data?.value ?? {}) as JsonObj,
    products: products.data ?? [],
    gallery: gallery.data ?? [],
  };
});

export const trackEvent = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ kind: z.enum(["view", "click"]), label: z.string().max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { adminDb } = await import("./plain.server");
    await adminDb().from("analytics_events").insert({ kind: data.kind, label: data.label });
    return { ok: true };
  });

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        customer_name: z.string().trim().max(120).default(""),
        phone: z.string().trim().max(40).default(""),
        note: z.string().trim().max(1000).default(""),
        items: z.array(z.record(z.string(), z.unknown())).max(100),
        total_usd: z.number().nonnegative(),
        total_ngn: z.number().nonnegative(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { adminDb, syncSheet } = await import("./plain.server");
    const { data: row, error } = await adminDb()
      .from("orders")
      .insert(data as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    await syncSheet("order", row);
    return row;
  });

export const adminLoad = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const { adminDb, checkPassword } = await import("./plain.server");
    checkPassword(data.password);
    const db = adminDb();
    const [orders, products, gallery, settings, events, contacts] = await Promise.all([
      db.from("orders").select("*").order("created_at", { ascending: false }).limit(500),
      db.from("products").select("*").order("sort_order"),
      db.from("gallery").select("*").order("sort_order"),
      db.from("site_settings").select("value").eq("key", "site").maybeSingle(),
      db
        .from("analytics_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(2000),
      db.from("contacts").select("*").order("created_at", { ascending: false }).limit(2000),
    ]);
    return {
      orders: orders.data ?? [],
      products: products.data ?? [],
      gallery: gallery.data ?? [],
      settings: (settings.data?.value ?? {}) as JsonObj,
      events: events.data ?? [],
      contacts: contacts.data ?? [],
    };
  });

export const adminSaveContacts = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: z.string(),
        contacts: z
          .array(
            z.object({
              name: z.string().trim().max(120).default(""),
              phone: z.string().trim().min(6).max(30),
              tags: z.array(z.string().max(40)).max(10).default([]),
            }),
          )
          .max(2000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { adminDb, checkPassword, syncSheet } = await import("./plain.server");
    checkPassword(data.password);
    const rows = data.contacts
      .map((c) => ({
        name: c.name,
        phone: c.phone.replace(/\D/g, ""),
        tags: c.tags,
        source: "import",
      }))
      .filter((c) => c.phone.length >= 6);
    if (rows.length === 0) return { imported: 0 };
    const { error } = await adminDb()
      .from("contacts")
      .upsert(rows as never, { onConflict: "phone", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
    await syncSheet("contacts.import", { count: rows.length });
    return { imported: rows.length };
  });

export const adminDeleteContact = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: z.string(), id: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const { adminDb, checkPassword } = await import("./plain.server");
    checkPassword(data.password);
    const { error } = await adminDb().from("contacts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminLogBroadcast = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({ password: z.string(), message: z.string().max(2000), recipients: z.number() })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { checkPassword, syncSheet } = await import("./plain.server");
    checkPassword(data.password);
    await syncSheet("newsletter.broadcast", {
      message: data.message,
      recipients: data.recipients,
    });
    return { ok: true };
  });


export const adminSaveSettings = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: z.string(), value: z.record(z.string(), z.unknown()) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { adminDb, checkPassword, syncSheet } = await import("./plain.server");
    checkPassword(data.password);
    const { error } = await adminDb()
      .from("site_settings")
      .upsert({ key: "site", value: data.value as Json });
    if (error) throw new Error(error.message);
    await syncSheet("settings", data.value);
    return { ok: true };
  });

export const adminSaveRow = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: z.string(),
        table: z.enum(["products", "gallery", "orders"]),
        action: z.enum(["upsert", "delete"]),
        row: z.record(z.string(), z.unknown()),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { adminDb, checkPassword, syncSheet } = await import("./plain.server");
    checkPassword(data.password);
    const db = adminDb();
    if (data.action === "delete") {
      const id = data.row["id"];
      if (typeof id !== "string" && typeof id !== "number") throw new Error("Missing id");
      const { error } = await db.from(data.table).delete().eq("id", String(id));
      if (error) throw new Error(error.message);
      await syncSheet(`${data.table}.delete`, { id });
      return { ok: true };
    }
    const row = { ...data.row };
    if (!row["id"]) delete row["id"];
    const { error } = await db.from(data.table).upsert(row as never);
    if (error) throw new Error(error.message);
    await syncSheet(`${data.table}.upsert`, row);
    return { ok: true };
  });

export const adminImportProducts = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: z.string(),
        rows: z.array(z.record(z.string(), z.unknown())).max(500),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { adminDb, checkPassword, syncSheet } = await import("./plain.server");
    checkPassword(data.password);
    const { error } = await adminDb()
      .from("products")
      .upsert(data.rows as never, { onConflict: "slug" });
    if (error) throw new Error(error.message);
    await syncSheet("products.import", { count: data.rows.length });
    return { imported: data.rows.length };
  });

export const adminUpload = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: z.string(),
        filename: z.string().max(200),
        dataUrl: z.string().max(12_000_000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { checkPassword, uploadMedia } = await import("./plain.server");
    checkPassword(data.password);
    const url = await uploadMedia(data.filename, data.dataUrl);
    return { url };
  });

/** Signed direct-to-storage upload (used for video files that are too big to base64). */
export const adminUploadUrl = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: z.string(), filename: z.string().max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { checkPassword, createSignedUpload } = await import("./plain.server");
    checkPassword(data.password);
    const { path, token, url } = await createSignedUpload(data.filename);
    return { path, token, url };
  });

/** Public: signed upload slot for a customer's pre-order payment receipt. */
export const preorderUploadUrl = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ filename: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const { createSignedUpload } = await import("./plain.server");
    const { path, token, url } = await createSignedUpload(`receipt-${data.filename}`);
    return { path, token, url };
  });

/** Public: record a pre-order with the uploaded transfer receipt. */
export const submitPreorder = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        customer_name: z.string().trim().min(1).max(120),
        phone: z.string().trim().min(6).max(40),
        address: z.string().trim().min(3).max(500),
        note: z.string().trim().max(1000).default(""),
        items: z.array(z.record(z.string(), z.unknown())).min(1).max(50),
        total_usd: z.number().nonnegative(),
        total_ngn: z.number().nonnegative(),
        receipt_url: z.string().max(500).default(""),
        is_preorder: z.boolean().default(true),
        promo_code: z.string().trim().max(40).default(""),
        gift_size: z.string().trim().max(10).default(""),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { adminDb, syncSheet } = await import("./plain.server");
    const db = adminDb();
    // Validate the coupon on the server; totals sent by the client are the pre-discount subtotal.
    let promo: string | null = null;
    let pct = 0;
    const { data: s } = await db.from("site_settings").select("value").eq("key", "site").maybeSingle();
    const v = (s?.value ?? {}) as Record<string, unknown>;
    const items = [...data.items];
    {
      const { giftUnlocked } = await import("@/lib/site");
      const qty = data.items.reduce((a, l) => a + (Number(l["qty"]) || 0), 0);
      if (data.gift_size && giftUnlocked(v as never, qty, data.total_usd)) {
        items.push({
          name: String(v["giftName"] || "Happiness is Free Tee") + " (FREE GIFT)",
          size: data.gift_size,
          color: "",
          qty: 1,
          price: 0,
          image: String(v["giftImage"] || ""),
          gift: true,
        });
      }
    }
    if (data.promo_code) {
      const enabled = v["promoEnabled"] !== false;
      const { findPromo } = await import("@/lib/site");
      const seg = enabled ? findPromo(v as never, data.promo_code) : null;
      if (seg) {
        promo = seg.code.toUpperCase();
        pct = Math.min(90, Math.max(0, Number(seg.percent)));
      }
    }
    const subtotal = data.total_usd;
    const discount = Number(((subtotal * pct) / 100).toFixed(2));
    const factor = subtotal > 0 ? (subtotal - discount) / subtotal : 1;
    const row = {
      customer_name: data.customer_name,
      phone: data.phone,
      address: data.address,
      note: data.note,
      items,
      subtotal_usd: subtotal,
      promo_code: promo,
      discount_percent: pct,
      discount_usd: discount,
      total_usd: Number((subtotal - discount).toFixed(2)),
      total_ngn: Math.round(data.total_ngn * factor),
      receipt_url: data.receipt_url || null,
      is_preorder: data.is_preorder,
      status: "pending_verification",
    };
    if (promo) await db.from("analytics_events").insert({ kind: "click", label: "promo:redeemed" });
    const { data: saved, error } = await adminDb()
      .from("orders")
      .insert(row as never)
      .select("id, reference")
      .single();
    if (error) throw new Error(error.message);
    await syncSheet(data.is_preorder ? "preorder" : "order", saved);
    return { id: saved.id as string, reference: saved.reference as string };
  });
