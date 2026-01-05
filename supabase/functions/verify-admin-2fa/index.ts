// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as OTPAuth from "https://esm.sh/otpauth@9.1.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getAdminEmailAllowlist(): string[] {
  const raw = Deno.env.get('ADMIN_EMAILS') ?? '';
  const parsed = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return parsed.length ? parsed : ['jonathangolubok@gmail.com'];
}

function getAdminTotpSecrets(): Record<string, string> {
  // Preferred: JSON object mapping email->base32 secret
  const json = Deno.env.get('ADMIN_2FA_SECRETS_JSON');
  if (json) {
    try {
      const parsed = JSON.parse(json) as Record<string, unknown>;
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === 'string' && v.trim()) out[String(k).toLowerCase()] = v.trim();
      }
      return out;
    } catch {
      // ignore and fall back
    }
  }

  // Secondary: shared secret for all admins (less ideal, but supported)
  const shared = Deno.env.get('ADMIN_2FA_SHARED_SECRET');
  if (shared && shared.trim()) {
    const allow = getAdminEmailAllowlist();
    return Object.fromEntries(allow.map((email) => [email, shared.trim()]));
  }

  return {};
}

function extractBearerToken(authHeader: string | null): string {
  const header = authHeader ?? '';
  return header.toLowerCase().startsWith('bearer ') ? header.slice('bearer '.length) : '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code } = await req.json().catch(() => ({ code: '' }));
    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Código requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jwt = extractBearerToken(req.headers.get('Authorization'));
    if (!jwt) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization bearer token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: 'Server misconfigured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify caller session
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false },
    });

    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = userData.user.id;
    const email = (userData.user.email ?? '').toLowerCase();
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Missing user email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const allowlist = getAdminEmailAllowlist();
    if (!allowlist.includes(email)) {
      return new Response(
        JSON.stringify({ verified: false, error: 'Usuario no autorizado' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const secrets = getAdminTotpSecrets();
    const secret = secrets[email];
    if (!secret) {
      return new Response(
        JSON.stringify({ verified: false, error: '2FA secret not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const totp = new OTPAuth.TOTP({
      issuer: 'AInside',
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });

    const delta = totp.validate({ token: String(code), window: 1 });
    const verified = delta !== null;

    // Service role client for logs + token issuance
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const ua = req.headers.get('user-agent') || 'unknown';

    await supabaseAdmin.from('admin_access_logs').insert({
      admin_email: email,
      action: verified ? '2fa_verification_success' : '2fa_verification_failed',
      ip_address: ip,
      user_agent: ua,
    });

    if (!verified) {
      return new Response(
        JSON.stringify({ verified: false, message: 'Código inválido' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const token = Array.from(tokenBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString();

    const { error: sessionErr } = await supabaseAdmin
      .from('admin_2fa_sessions')
      .insert({
        token,
        user_id: userId,
        admin_email: email,
        expires_at: expiresAt,
        revoked: false,
      });

    if (sessionErr) {
      console.error('Failed to create admin_2fa_sessions row:', sessionErr);
      return new Response(
        JSON.stringify({ verified: false, error: 'Failed to create 2FA session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ verified: true, token, expiresAt, message: 'Código verificado correctamente' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error en verify-admin-2fa:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message ?? 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
