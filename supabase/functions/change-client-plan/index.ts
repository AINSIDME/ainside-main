// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

function getAdminEmailAllowlist(): string[] {
  const raw = Deno.env.get('ADMIN_EMAILS') ?? '';
  const parsed = raw
    .split(',')
    .map((s: string) => s.trim().toLowerCase())
    .filter(Boolean);
  return parsed.length ? parsed : ['jonathangolubok@gmail.com'];
}

function extractBearerToken(authHeader: string | null): string {
  const header = authHeader ?? '';
  return header.toLowerCase().startsWith('bearer ') ? header.slice('bearer '.length) : '';
}

async function requireAdmin2FA(req: Request) {
  const jwt = extractBearerToken(req.headers.get('Authorization'));
  if (!jwt) throw new Error('Unauthorized');
  const twoFaToken = (req.headers.get('x-admin-2fa-token') ?? '').trim();
  if (!twoFaToken) throw new Error('2FA required');

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) throw new Error('Server misconfigured');

  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
  if (userErr || !userData?.user) throw new Error('Unauthorized');

  const userId = userData.user.id;
  const email = (userData.user.email ?? '').toLowerCase();
  if (!email) throw new Error('Unauthorized');

  const allowlist = getAdminEmailAllowlist();
  if (!allowlist.includes(email)) throw new Error('Forbidden');

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const { data: session, error: sessionErr } = await supabaseAdmin
    .from('admin_2fa_sessions')
    .select('token,user_id,admin_email,expires_at,revoked')
    .eq('token', twoFaToken)
    .maybeSingle();

  if (sessionErr || !session) throw new Error('2FA invalid');
  if (session.revoked) throw new Error('2FA invalid');
  if (session.user_id !== userId) throw new Error('2FA invalid');
  if (String(session.admin_email ?? '').toLowerCase() !== email) throw new Error('2FA invalid');
  if (new Date(session.expires_at).getTime() <= Date.now()) throw new Error('2FA expired');

  return { supabaseAdmin, userId, email };
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest(req);
  }

  try {
    const { supabaseAdmin: supabase } = await requireAdmin2FA(req);
    const { clientId, planName } = await req.json();

    if (!clientId || !planName) {
      throw new Error("Missing required parameters");
    }

    // Get client HWID
    const { data: reg, error: regError } = await supabase
      .from("hwid_registrations")
      .select("hwid")
      .eq("id", clientId)
      .single();

    if (regError) throw regError;

    // Update or create connection with new plan
    const { data: conn } = await supabase
      .from("client_connections")
      .select("*")
      .eq("hwid", reg.hwid)
      .maybeSingle();

    if (conn) {
      const { error: updateError } = await supabase
        .from("client_connections")
        .update({
          plan_name: planName,
          updated_at: new Date().toISOString(),
        })
        .eq("hwid", reg.hwid);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from("client_connections")
        .insert({
          hwid: reg.hwid,
          plan_name: planName,
          strategies_active: [],
          strategies_available: [
            "Scalping Pro",
            "Trend Following",
            "Mean Reversion",
            "Breakout Strategy",
            "Grid Trading"
          ],
        });

      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, plan_name: planName }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message ?? 'Unknown error' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
