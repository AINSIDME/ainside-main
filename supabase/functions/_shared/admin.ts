// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function getAdminEmailAllowlist(): string[] {
  const raw = Deno.env.get('ADMIN_EMAILS') ?? '';
  const parsed = raw
    .split(',')
    .map((s: string) => s.trim().toLowerCase())
    .filter(Boolean);
  return parsed.length ? parsed : ['jonathangolubok@gmail.com'];
}

export function extractBearerToken(authHeader: string | null): string {
  const header = authHeader ?? '';
  return header.toLowerCase().startsWith('bearer ') ? header.slice('bearer '.length) : '';
}

export async function requireAdmin2FA(req: Request) {
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
