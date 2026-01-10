import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

function base64UrlDecodeToString(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((input.length + 3) % 4);
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function getJwtAal(jwt: string): string | null {
  try {
    const parts = jwt.split(".");
    if (parts.length < 2) return null;
    const payloadJson = base64UrlDecodeToString(parts[1]);
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;

    const aal = payload["aal"] ?? payload["authenticator_assurance_level"];
    return typeof aal === "string" ? aal : null;
  } catch {
    return null;
  }
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function validateEmailOtp(params: {
  supabase: ReturnType<typeof createClient>;
  userId: string;
  otp: string;
}): Promise<boolean> {
  const secretSalt = Deno.env.get("DOWNLOAD_EMAIL_OTP_SALT") ?? "change-me";
  const codeHash = await sha256Hex(`${params.userId}:${params.otp}:${secretSalt}`);

  // Get most recent unconsumed OTP for this user/purpose
  const { data, error } = await params.supabase
    .from("download_email_otps")
    .select("id, expires_at, consumed_at, attempts")
    .eq("user_id", params.userId)
    .eq("purpose", "hwid_tool_download")
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("OTP fetch error:", error);
    return false;
  }

  const row: any = data?.[0];
  if (!row?.id) return false;
  if (new Date(row.expires_at).getTime() < Date.now()) return false;

  // Check hash match by looking up exact hash row (avoid leaking which code is valid)
  const { data: match, error: matchError } = await params.supabase
    .from("download_email_otps")
    .select("id")
    .eq("id", row.id)
    .eq("code_hash", codeHash)
    .is("consumed_at", null)
    .limit(1);

  if (matchError || !match?.[0]?.id) {
    // Increment attempts (best-effort)
    await params.supabase
      .from("download_email_otps")
      .update({ attempts: (row.attempts ?? 0) + 1 })
      .eq("id", row.id);
    return false;
  }

  // Consume OTP
  await params.supabase
    .from("download_email_otps")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", row.id);

  return true;
}

async function sendDownloadAlertEmail(params: {
  to: string;
  ip: string | null;
  userAgent: string | null;
  createdAtIso: string;
}): Promise<boolean> {
  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) return false;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AInside <onboarding@resend.dev>",
        to: [params.to],
        subject: "AInside: Se generó un enlace de descarga",
        html: `
          <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height: 1.5;">
            <h2 style="margin: 0 0 12px;">Alerta de seguridad</h2>
            <p style="margin: 0 0 12px;">Se generó un enlace temporal para descargar el <strong>HWID Tool</strong>.</p>
            <table style="border-collapse: collapse;">
              <tr><td style="padding: 4px 10px 4px 0; color: #64748b;">Fecha</td><td style="padding: 4px 0;">${params.createdAtIso}</td></tr>
              <tr><td style="padding: 4px 10px 4px 0; color: #64748b;">IP</td><td style="padding: 4px 0;">${params.ip ?? "-"}</td></tr>
              <tr><td style="padding: 4px 10px 4px 0; color: #64748b;">Dispositivo</td><td style="padding: 4px 0;">${(params.userAgent ?? "-").replace(/</g, "&lt;")}</td></tr>
            </table>
            <p style="margin: 12px 0 0; color: #64748b; font-size: 13px;">Si no fuiste vos, cambiá tu contraseña y cerrá sesiones en otros dispositivos desde tu panel.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      console.error("Resend error:", await response.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("sendDownloadAlertEmail error:", e);
    return false;
  }
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest(req);
  }

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const emailOtp = typeof (body as any)?.emailOtp === "string" ? (body as any).emailOtp.trim() : null;

    const authHeader = req.headers.get("Authorization") ?? req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;

    if (!token) {
      return new Response(JSON.stringify({ error: "missing_authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // User-scoped client (uses the user's JWT) so we can check AAL nextLevel reliably.
    const userScoped = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    // Validate token signature + user
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "invalid_token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("cf-connecting-ip") ?? null;
    const userAgent = req.headers.get("user-agent");
    const createdAtIso = new Date().toISOString();

    // Determine session AAL and whether the account has MFA enabled.
    const aal = getJwtAal(token);
    let mfaEnabled = false;
    try {
      const { data: aalData } = await userScoped.auth.mfa.getAuthenticatorAssuranceLevel();
      const nextLevel = (aalData as any)?.nextLevel as string | undefined;
      mfaEnabled = nextLevel === "aal2";
    } catch {
      mfaEnabled = false;
    }

    // If MFA is enabled on the account, require AAL2 (do not allow email OTP bypass).
    if (mfaEnabled && aal !== "aal2") {
      return new Response(JSON.stringify({ error: "mfa_required", aal: aal ?? null }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If MFA is not enabled, allow either AAL2 or Email OTP.
    if (!mfaEnabled && aal !== "aal2") {
      if (!emailOtp) {
        return new Response(
          JSON.stringify({ error: "verification_required", aal: aal ?? null, methods: ["email"] }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const ok = await validateEmailOtp({ supabase, userId: userData.user.id, otp: emailOtp });
      if (!ok) {
        return new Response(JSON.stringify({ error: "invalid_email_otp" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // NOTE: You must upload the file to Supabase Storage (bucket: products) at this path.
    const filePath = "hwid-tool/ainside_hwid_tool_premium_v5.exe";

    const { data, error } = await supabase.storage.from("products").createSignedUrl(filePath, 300);

    if (error || !data?.signedUrl) {
      return new Response(JSON.stringify({ error: "file_not_available" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Best-effort security alert (do not block download if email fails)
    const email = userData.user.email;
    if (email) {
      void sendDownloadAlertEmail({ to: email, ip, userAgent, createdAtIso });
    }

    return new Response(JSON.stringify({ url: data.signedUrl, expiresIn: 300 }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("download-hwid-tool error:", error);
    return new Response(JSON.stringify({ error: "server_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
