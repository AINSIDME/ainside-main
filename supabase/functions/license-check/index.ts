import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return bytes.buffer;
}

function b64ToArrayBuffer(b64: string): ArrayBuffer {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return bytes.buffer;
}

function base64UrlEncode(bytes: Uint8Array): string {
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

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const macNumberRegex = /^\d{10,15}$/;

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
    const hwid = (body?.hwid ?? "").toString().trim();
    const deviceSecret = (body?.deviceSecret ?? "").toString().trim();
    const nonce = (body?.nonce ?? "").toString().trim();

    if (!hwid || !deviceSecret) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
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

    const privateKeyDerB64 = (Deno.env.get("LICENSE_PRIVATE_KEY_B64") ?? "").trim().replace(/\s+/g, "");
    const privateKeyPem = (Deno.env.get("LICENSE_PRIVATE_KEY_PEM") ?? "").trim();
    if (!privateKeyDerB64 && !privateKeyPem) {
      return new Response(JSON.stringify({ error: "Server misconfigured (missing LICENSE_PRIVATE_KEY_B64/PEM)" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

    // 1) Validate device lock secret
    const secretHash = await sha256Hex(deviceSecret);
    const { data: locks, error: lockErr } = await supabase
      .from("device_locks")
      .select("hwid, email, order_id, revoked_at")
      .eq("hwid", hwid)
      .eq("secret_hash", secretHash)
      .limit(1);

    if (lockErr) {
      console.error("device_locks lookup error", lockErr);
      return new Response(JSON.stringify({ error: "server_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lock = locks?.[0] ?? null;
    if (!lock) {
      return new Response(JSON.stringify({ allowed: false, reason: "invalid_device_secret" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (lock.revoked_at) {
      return new Response(JSON.stringify({ allowed: false, reason: "revoked" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Licensing gate: device must still have an active registration
    const { data: regs, error: regErr } = await supabase
      .from("hwid_registrations")
      .select("id")
      .eq("hwid", hwid)
      .eq("status", "active")
      .limit(1);

    if (regErr) {
      console.error("hwid_registrations lookup error", regErr);
      return new Response(JSON.stringify({ error: "server_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const allowed = Boolean(regs?.[0]);

    const now = Date.now();
    const ttlMs = 60_000; // short-lived proof; forces periodic revalidation
    const payload = {
      allowed,
      reason: allowed ? "ok" : "unregistered_hwid",
      hwid,
      orderId: lock.order_id,
      ts: now,
      exp: now + ttlMs,
      nonce: nonce || undefined,
      v: 1,
    };

    // 3) Sign payload (RSASSA-PKCS1-v1_5 / SHA-256)
    const keyBytes = privateKeyDerB64 ? b64ToArrayBuffer(privateKeyDerB64) : pemToArrayBuffer(privateKeyPem);

    const key = await crypto.subtle.importKey(
      "pkcs8",
      keyBytes,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
    const sigBuf = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, payloadBytes);
    const signature = base64UrlEncode(new Uint8Array(sigBuf));

    return new Response(JSON.stringify({ payload, signature, alg: "RS256" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("license-check error:", error);
    return new Response(JSON.stringify({ error: (error as any)?.message || "bad_request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
