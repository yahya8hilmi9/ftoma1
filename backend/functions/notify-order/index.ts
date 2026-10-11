// Supabase Edge Function: notify-order
// Called by a database trigger (pg_net) right after a new order is committed.
// Loads the order from the database (the request body is never trusted for content),
// then sends it to the shop owner's WhatsApp through CallMeBot.
//
// Secrets to set (Dashboard > Edge Functions > Secrets):
//   CALLMEBOT_PHONE   owner's number with country code, e.g. +212612345678
//   CALLMEBOT_APIKEY  key received from the CallMeBot bot
import { createClient } from "npm:@supabase/supabase-js@2";

const DELIVERY: Record<string, string> = { city: "داخل المدينة", nation: "باقي المدن", pickup: "استلام من المحل" };
const ok = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  try {
    const { order_id } = await req.json().catch(() => ({}));
    if (!order_id || !/^[0-9a-f-]{36}$/i.test(String(order_id))) return ok({ error: "bad request" }, 400);

    const phone = Deno.env.get("CALLMEBOT_PHONE");
    const key = Deno.env.get("CALLMEBOT_APIKEY");
    if (!phone || !key) return ok({ error: "CALLMEBOT_PHONE / CALLMEBOT_APIKEY not set" }, 500);

    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // claim: only orders that are recent and not yet notified (makes repeated calls harmless)
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: claimed } = await db.from("orders").update({ notified_at: new Date().toISOString() })
      .eq("id", order_id).is("notified_at", null).gte("created_at", since).select("*").maybeSingle();
    if (!claimed) return ok({ skipped: true });

    const { data: items } = await db.from("order_items").select("product_name,quantity,line_total,options").eq("order_id", order_id);
    const o = claimed;
    const lines = (items ?? []).map((i: any) => {
      const op = i.options ?? {};
      const extra = (op.filling ? ` (${op.filling})` : "") + (op.comp ? " [معدّل]" : "");
      return `• ${i.quantity} × ${i.product_name}${extra} — ${i.line_total} د.م`;
    }).join("\n");
    const text = [
      `🛒 *طلب جديد #${o.order_number}*`,
      "",
      lines,
      "",
      `المنتجات: ${o.subtotal} د.م`,
      `التوصيل (${DELIVERY[o.delivery_method] ?? o.delivery_method}): ${Number(o.delivery_fee) ? o.delivery_fee + " د.م" : "مجاني"}`,
      `*المجموع: ${o.total} د.م*`,
      "",
      `👤 ${o.customer_name}`,
      `📞 ${o.customer_phone}`,
      `📍 ${o.customer_city} — ${o.customer_address}`,
      o.customer_notes ? `📝 ${o.customer_notes}` : "",
    ].filter((l) => l !== "").join("\n");

    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(key)}`;
    const r = await fetch(url);
    if (!r.ok) {
      await db.from("orders").update({ notified_at: null }).eq("id", order_id); // allow a retry
      return ok({ error: "callmebot " + r.status, detail: (await r.text()).slice(0, 200) }, 502);
    }
    return ok({ sent: true });
  } catch (e) {
    return ok({ error: String((e as Error).message ?? e) }, 500);
  }
});
