// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { requireAdmin2FA } from "../_shared/admin.ts";

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(req);
  }

  try {
    const { supabaseAdmin, userId, email } = await requireAdmin2FA(req);

    const body = await req.json().catch(() => ({}));
    const limitRaw = Number(body?.limit ?? 200);
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(500, limitRaw)) : 200;

    const { data: logs, error } = await supabaseAdmin
      .from('admin_access_logs')
      .select('id,user_id,action,details,created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // audit (best-effort)
    try {
      await supabaseAdmin
        .from('admin_access_logs')
        .insert({
          user_id: userId,
          action: 'admin.logs.view',
          details: { endpoint: 'admin-logs', admin_email: email, limit },
        });
    } catch (_) {
      // ignore
    }

    return new Response(
      JSON.stringify({ success: true, logs }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error?.message ?? 'Internal error', logs: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
