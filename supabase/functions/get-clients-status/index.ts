// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { requireAdmin2FA } from "../_shared/admin.ts";


function toLowerSafe(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

function pickLatestPurchase(purchases: any[]): any | null {
  if (!Array.isArray(purchases) || purchases.length === 0) return null;
  return purchases
    .slice()
    .sort((a, b) => new Date(String(b?.created_at ?? 0)).getTime() - new Date(String(a?.created_at ?? 0)).getTime())[0] ?? null;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest(req);
  }

  try {
    const { supabaseAdmin: supabase, userId, email } = await requireAdmin2FA(req);

    // Audit log (best-effort)
    try {
      await supabase
        .from('admin_access_logs')
        .insert({
          user_id: userId,
          action: 'admin.clients.view',
          details: { endpoint: 'get-clients-status', admin_email: email },
        });
    } catch (_) {
      // ignore
    }

    // Meta counts for diagnostics (admin-only)
    const [{ count: registrationsCount }, { count: connectionsCount }, { count: purchasesCount }] = await Promise.all([
      supabase.from("hwid_registrations").select("id", { count: "exact", head: true }),
      supabase.from("client_connections").select("id", { count: "exact", head: true }),
      supabase.from("purchases").select("id", { count: "exact", head: true }),
    ]);

    // Get all registered clients with their status
    const { data: registrations, error: regError } = await supabase
      .from("hwid_registrations")
      .select("*");

    if (regError) {
      console.error('[get-clients-status] Error fetching registrations:', regError);
      throw new Error(`Failed to fetch registrations: ${regError.message}`);
    }

    console.log(`[get-clients-status] Fetched ${registrations?.length || 0} registrations`);

    // Get connection status for each client
    const { data: connections, error: connError } = await supabase
      .from("client_connections")
      .select("*");

    if (connError) {
      console.error('[get-clients-status] Error fetching connections:', connError);
      throw new Error(`Failed to fetch connections: ${connError.message}`);
    }

    console.log(`[get-clients-status] Fetched ${connections?.length || 0} connections`);

    // Purchases (for client context)
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('order_id,email,plan_name,plan_type,status,amount,currency,created_at,coupon_code');
    
    if (purchasesError) {
      console.error('[get-clients-status] Error fetching purchases:', purchasesError);
      throw new Error(`Failed to fetch purchases: ${purchasesError.message}`);
    }

    console.log(`[get-clients-status] Fetched ${purchases?.length || 0} purchases`);

    const purchasesByOrderId = new Map<string, any>();
    const purchasesByEmail = new Map<string, any[]>();

    (purchases ?? []).forEach((p: any) => {
      const orderId = String(p?.order_id ?? '').trim();
      const emailKey = toLowerSafe(p?.email);
      if (orderId) purchasesByOrderId.set(orderId, p);
      if (emailKey) {
        const arr = purchasesByEmail.get(emailKey) ?? [];
        arr.push(p);
        purchasesByEmail.set(emailKey, arr);
      }
    });

    // Merge data
    const clients = registrations.map((reg: any) => {
      const conn = connections?.find((c: any) => c.hwid === reg.hwid);

      const regOrderId = String(reg?.order_id ?? '').trim();
      const regEmail = toLowerSafe(reg?.email);
      const byOrder = regOrderId ? purchasesByOrderId.get(regOrderId) : null;
      const byEmailLatest = regEmail ? pickLatestPurchase(purchasesByEmail.get(regEmail) ?? []) : null;
      const purchase = byOrder || byEmailLatest;
      const purchaseCount = regEmail ? (purchasesByEmail.get(regEmail)?.length ?? 0) : 0;

      const lastSeen = conn?.last_seen || reg.created_at;
      const now = new Date().getTime();
      const lastSeenTime = new Date(lastSeen).getTime();
      const diffMinutes = Math.floor((now - lastSeenTime) / 1000 / 60);
      
      // Consider online if seen in last 2 minutes
      const status = diffMinutes < 2 ? "online" : "offline";

      return {
        id: reg.id,
        order_id: reg.order_id,
        email: reg.email,
        name: reg.name,
        hwid: reg.hwid,
        registration_status: reg.status,
        registered_at: reg.created_at,
        updated_at: reg.updated_at,
        notes: reg.notes,
        plan_name: conn?.plan_name || "Basic",
        status,
        last_seen: lastSeen,
        strategies_active: conn?.strategies_active || [],
        strategies_available: conn?.strategies_available || [
          "Scalping Pro",
          "Trend Following",
          "Mean Reversion",
          "Breakout Strategy",
          "Grid Trading"
        ],

        // Purchase summary (optional)
        purchase_count: purchaseCount,
        last_purchase_at: purchase?.created_at ?? null,
        last_purchase_status: purchase?.status ?? null,
        last_purchase_plan_name: purchase?.plan_name ?? null,
        last_purchase_plan_type: purchase?.plan_type ?? null,
        last_purchase_amount: purchase?.amount ?? null,
        last_purchase_currency: purchase?.currency ?? null,
        last_coupon_code: purchase?.coupon_code ?? null,
      };
    });

    return new Response(
      JSON.stringify({
        clients,
        meta: {
          registrationsCount: registrationsCount ?? 0,
          connectionsCount: connectionsCount ?? 0,
          purchasesCount: purchasesCount ?? 0,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const message = (error as Error)?.message ?? 'Unknown error';
    return new Response(
      JSON.stringify({ clients: [], error: message, meta: null }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }
});
