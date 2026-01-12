import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const macNumberRegex = /^\d{10,15}$/;

function base64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

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
    const body = await req.json().catch(() => null);

    const orderId = (body?.orderId ?? "").toString().trim();
    const emailInput = (body?.email ?? "").toString().trim().toLowerCase();
    const nameInput = (body?.name ?? "").toString().trim();
    const hwid = (body?.hwid ?? "").toString().trim();

    if (!orderId || !hwid) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (emailInput && !isEmail(emailInput)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!uuidRegex.test(hwid) && !macNumberRegex.test(hwid)) {
      return new Response(
        JSON.stringify({ error: "Invalid HWID format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

    // 1) Purchase must exist and be completed
    const purchaseQuery = supabase
      .from("purchases")
      .select("order_id, email, status")
      .eq("order_id", orderId)
      .limit(1);

    const { data: purchases, error: purchaseErr } = await (emailInput
      ? purchaseQuery.eq("email", emailInput)
      : purchaseQuery);

    if (purchaseErr) {
      console.error("purchase validation error", purchaseErr);
      return new Response(JSON.stringify({ error: "Failed to validate order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const purchase = purchases?.[0] ?? null;
    if (!purchase) {
      return new Response(
        JSON.stringify({ error: emailInput ? "Order not found or email mismatch" : "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (purchase.status && String(purchase.status).toLowerCase() !== "completed") {
      return new Response(JSON.stringify({ error: "Payment not completed" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = (purchase.email || "").toString().toLowerCase();
    const name = nameInput || email;

    // 2) Enforce order_id is bound to exactly one HWID and cannot change without support
    const { data: existingRegs, error: regErr } = await supabase
      .from("hwid_registrations")
      .select("order_id, email, hwid, status")
      .eq("order_id", orderId)
      .limit(1);

    if (regErr) {
      console.error("registration lookup error", regErr);
      return new Response(JSON.stringify({ error: "Failed to validate existing registration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const existing = existingRegs?.[0] ?? null;
    if (existing) {
      if ((existing.email || "").toString().toLowerCase() !== email) {
        return new Response(JSON.stringify({ error: "Order is already registered to a different email" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if ((existing.hwid || "").toString() !== hwid) {
        return new Response(
          JSON.stringify({
            error: "This Order ID is already locked to a different PC. Contact support to transfer.",
            locked: true,
            orderId,
          }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    } else {
      // Create initial registration for this order
      const { error: insertErr } = await supabase
        .from("hwid_registrations")
        .insert({ order_id: orderId, email, name, hwid, status: "active" });

      if (insertErr) {
        console.error("registration insert error", insertErr);
        return new Response(JSON.stringify({ error: "Failed to register HWID" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 3) Create device lock ONCE. If it already exists, do not re-issue secret.
    const { data: existingLocks, error: lockLookupErr } = await supabase
      .from("device_locks")
      .select("hwid, order_id, revoked_at")
      .eq("hwid", hwid)
      .limit(1);

    if (lockLookupErr) {
      console.error("device lock lookup error", lockLookupErr);
      return new Response(JSON.stringify({ error: "Failed to validate device lock" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const existingLock = existingLocks?.[0] ?? null;
    if (existingLock) {
      if (existingLock.revoked_at) {
        return new Response(JSON.stringify({ error: "Device is revoked" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Device already activated: secret is NOT reissued automatically.
      return new Response(
        JSON.stringify({
          success: true,
          alreadyActivated: true,
          message: "Device already activated. If you reinstalled and lost the device secret, contact support.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const secretBytes = crypto.getRandomValues(new Uint8Array(32));
    const deviceSecret = base64Url(secretBytes);
    const secretHash = await sha256Hex(deviceSecret);

    const { error: lockInsertErr } = await supabase
      .from("device_locks")
      .insert({ hwid, email, order_id: orderId, secret_hash: secretHash });

    if (lockInsertErr) {
      console.error("device lock insert error", lockInsertErr);
      return new Response(JSON.stringify({ error: "Failed to activate device" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, deviceSecret, orderId, email }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("license-activate error:", error);
    return new Response(JSON.stringify({ error: (error as any)?.message || "bad_request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
