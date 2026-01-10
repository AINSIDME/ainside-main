import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

function randomSixDigitCode(): string {
  const value = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return String(value).padStart(6, "0");
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sendOtpEmail(params: { to: string; code: string }): Promise<void> {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "AInside <onboarding@resend.dev>",
      to: [params.to],
      subject: "AInside: Tu código de verificación para descargar",
      html: `
        <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height: 1.5;">
          <h2 style="margin:0 0 10px;">Código de verificación</h2>
          <p style="margin:0 0 12px;">Usá este código para autorizar la descarga:</p>
          <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; padding: 12px 16px; border: 1px solid #e2e8f0; display:inline-block; border-radius: 10px;">${params.code}</div>
          <p style="margin:12px 0 0; color:#64748b; font-size:13px;">Este código expira en 10 minutos. Si no fuiste vos, ignorá este email.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Email provider error: ${text}`);
  }
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest(req);
  }

  try {
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

    const userScoped = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "invalid_token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If MFA is enabled, force users to use TOTP instead of email OTP.
    try {
      const { data: aalData } = await userScoped.auth.mfa.getAuthenticatorAssuranceLevel();
      const nextLevel = (aalData as any)?.nextLevel as string | undefined;
      if (nextLevel === "aal2") {
        return new Response(JSON.stringify({ error: "mfa_enabled_use_totp" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch {
      // ignore
    }

    const email = userData.user.email;
    if (!email) {
      return new Response(JSON.stringify({ error: "missing_email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("cf-connecting-ip") ?? null;
    const userAgent = req.headers.get("user-agent") ?? null;

    const otpCode = randomSixDigitCode();
    const secretSalt = Deno.env.get("DOWNLOAD_EMAIL_OTP_SALT") ?? "change-me";
    const codeHash = await sha256Hex(`${userData.user.id}:${otpCode}:${secretSalt}`);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase
      .from("download_email_otps")
      .insert([
        {
          user_id: userData.user.id,
          email,
          purpose: "hwid_tool_download",
          code_hash: codeHash,
          expires_at: expiresAt,
          ip,
          user_agent: userAgent,
        },
      ]);

    if (insertError) {
      console.error("DB insert error:", insertError);
      return new Response(JSON.stringify({ error: "db_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await sendOtpEmail({ to: email, code: otpCode });

    return new Response(JSON.stringify({ ok: true, expiresIn: 600 }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("request-download-email-otp error:", e);
    return new Response(JSON.stringify({ error: e?.message || "server_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
