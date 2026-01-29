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
  if (!jwt) {
    console.error('[requireAdmin2FA] No JWT token');
    throw new Error('Unauthorized');
  }

  const twoFaToken = (req.headers.get('x-admin-2fa-token') ?? '').trim();
  if (!twoFaToken) {
    console.error('[requireAdmin2FA] No 2FA token');
    throw new Error('2FA required');
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    console.error('[requireAdmin2FA] Missing env vars');
    throw new Error('Server misconfigured');
  }

  console.log('[requireAdmin2FA] Verifying user...');
  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
  if (userErr || !userData?.user) {
    console.error('[requireAdmin2FA] User verification failed:', userErr);
    throw new Error('Unauthorized');
  }

  const userId = userData.user.id;
  const email = (userData.user.email ?? '').toLowerCase();
  if (!email) {
    console.error('[requireAdmin2FA] No email');
    throw new Error('Unauthorized');
  }

  console.log('[requireAdmin2FA] User email:', email);
  const allowlist = getAdminEmailAllowlist();
  if (!allowlist.includes(email)) {
    console.error('[requireAdmin2FA] Email not in allowlist:', email);
    throw new Error('Forbidden');
  }

  console.log('[requireAdmin2FA] Checking 2FA session...');
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const { data: session, error: sessionErr } = await supabaseAdmin
    .from('admin_2fa_sessions')
    .select('token,user_id,admin_email,expires_at,revoked')
    .eq('token', twoFaToken)
    .maybeSingle();

  if (sessionErr) {
    console.error('[requireAdmin2FA] Session query error:', sessionErr);
    throw new Error('2FA invalid');
  }
  if (!session) {
    console.error('[requireAdmin2FA] No session found');
    throw new Error('2FA invalid');
  }
  if (session.revoked) {
    console.error('[requireAdmin2FA] Session revoked');
    throw new Error('2FA invalid');
  }
  if (session.user_id !== userId) {
    console.error('[requireAdmin2FA] User ID mismatch');
    throw new Error('2FA invalid');
  }
  if (String(session.admin_email ?? '').toLowerCase() !== email) {
    console.error('[requireAdmin2FA] Email mismatch');
    throw new Error('2FA invalid');
  }
  if (new Date(session.expires_at).getTime() <= Date.now()) {
    console.error('[requireAdmin2FA] Session expired');
    throw new Error('2FA expired');
  }

  console.log('[requireAdmin2FA] Auth successful');
  return { supabaseAdmin, userId, email };
}
