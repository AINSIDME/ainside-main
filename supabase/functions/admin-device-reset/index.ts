import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { requireAdmin2FA } from "../_shared/admin.ts";

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest(req);
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const admin = await requireAdmin2FA(req);

    const body = await req.json().catch(() => null);
    const orderId = (body?.orderId ?? "").toString().trim();
    const newHwid = (body?.newHwid ?? "").toString().trim();
    const revokeReason = (body?.reason ?? "support_reset").toString().trim();

    if (!orderId || !newHwid) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

    const { data: regs, error: regErr } = await supabase
      .from("hwid_registrations")
      .select("order_id, email, hwid, status")
      .eq("order_id", orderId)
      .limit(1);

    if (regErr) {
      console.error("admin-device-reset registration lookup error", regErr);
      return new Response(JSON.stringify({ error: "Failed to load registration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reg = regs?.[0] ?? null;
    if (!reg) {
      return new Response(JSON.stringify({ error: "Order not registered" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Revoke old device lock for the previous hwid (if any)
    const oldHwid = (reg.hwid ?? "").toString();
    if (oldHwid) {
      await supabase
        .from("device_locks")
        .update({ revoked_at: new Date().toISOString(), revoked_reason: revokeReason })
        .eq("hwid", oldHwid);
    }

    // Update registration to new HWID (support-only)
    const { error: updErr } = await supabase
      .from("hwid_registrations")
      .update({ hwid: newHwid, status: "active" })
      .eq("order_id", orderId);

    if (updErr) {
      console.error("admin-device-reset registration update error", updErr);
      return new Response(JSON.stringify({ error: "Failed to update registration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Best-effort audit
    try {
      await supabase.from("admin_access_logs").insert({
        admin_email: admin.email,
        action: "admin.device.reset",
        resource: orderId,
        details: {
          orderId,
          oldHwid,
          newHwid,
          reason: revokeReason,
        },
      });
    } catch {
      // ignore
    }

    return new Response(JSON.stringify({ success: true, orderId, oldHwid, newHwid }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = (error as any)?.message || "Unauthorized";
    const status = msg.toLowerCase().includes("unauthorized") ? 401 : 400;
    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
