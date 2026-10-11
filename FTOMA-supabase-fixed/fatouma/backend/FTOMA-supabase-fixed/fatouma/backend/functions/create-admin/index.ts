// Supabase Edge Function: create-admin
// Lets an existing admin create a new admin account (email + password) from admin.html.
// Uses the service-role key, which Supabase injects as an env var. It never reaches the browser.
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const caller = createClient(url, anon, { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } });
    const { data: { user } } = await caller.auth.getUser();
    if (!user) return json(401, { error: "غير مسجل الدخول" });

    const admin = createClient(url, service);
    const { data: isAdmin } = await admin.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
    if (!isAdmin) return json(403, { error: "ماشي مسؤول" });

    const { email, password } = await req.json();
    const mail = String(email ?? "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) return json(400, { error: "إيميل غير صالح" });
    if (String(password ?? "").length < 10) return json(400, { error: "كلمة السر خاصها 10 أحرف على الأقل" });

    const { data, error } = await admin.auth.admin.createUser({ email: mail, password, email_confirm: true });
    if (error) {
      const exists = /already|registered|exists/i.test(error.message);
      return json(exists ? 409 : 400, { error: exists ? "هاد الإيميل عندو حساب بالفعل" : error.message });
    }
    const { error: e2 } = await admin.from("admin_users").insert({ user_id: data.user.id });
    if (e2) return json(500, { error: e2.message });
    return json(200, { ok: true, user_id: data.user.id });
  } catch (e) {
    return json(500, { error: String((e as Error).message ?? e) });
  }
});
