// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { requireAdmin2FA } from "../_shared/admin.ts";

function randomCode(len = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(req);
  }

  try {
    const { supabaseAdmin, email: adminEmail } = await requireAdmin2FA(req);

    const body = await req.json().catch(() => ({}));
    const demoEmail = String(body?.email ?? 'demo.client@ainside.me').trim();
    const demoName = String(body?.name ?? 'Demo Client').trim();

    const orderId = String(body?.order_id ?? `DEMO-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomCode(6)}`);
    const hwid = String(body?.hwid ?? crypto.randomUUID());

    const planType = String(body?.plan_type ?? 'demo');
    const planName = String(body?.plan_name ?? 'Demo Access - AInside');
    const amount = String(body?.amount ?? '0.00');
    const currency = String(body?.currency ?? 'USD');

    // purchases
    const { error: purchaseErr } = await supabaseAdmin
      .from('purchases')
      .upsert({
        order_id: orderId,
        email: demoEmail,
        plan_name: planName,
        plan_type: planType,
        amount,
        currency,
        status: 'completed',
      }, { onConflict: 'order_id' });
    if (purchaseErr) throw purchaseErr;

    // hwid_registrations
    const { error: regErr } = await supabaseAdmin
      .from('hwid_registrations')
      .upsert({
        order_id: orderId,
        email: demoEmail,
        name: demoName,
        hwid,
        status: 'active',
        notes: `demo client created by ${adminEmail}`,
      }, { onConflict: 'order_id' });
    if (regErr) throw regErr;

    // client_connections (shows online/offline & plan_name)
    const { error: connErr } = await supabaseAdmin
      .from('client_connections')
      .upsert({
        hwid,
        plan_name: planName,
        strategies_active: [],
        last_seen: new Date().toISOString(),
      }, { onConflict: 'hwid' });
    if (connErr) throw connErr;

    // audit
    try {
      await supabaseAdmin
        .from('admin_access_logs')
        .insert({
          user_id: (await supabaseAdmin.auth.getUser()).data?.user?.id ?? crypto.randomUUID(),
          action: 'admin.clients.seed',
          details: { order_id: orderId, hwid, email: demoEmail },
        });
    } catch (_) {
      // ignore
    }

    return new Response(
      JSON.stringify({
        success: true,
        client: {
          order_id: orderId,
          email: demoEmail,
          name: demoName,
          hwid,
          plan_name: planName,
          plan_type: planType,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error?.message ?? 'Internal error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
