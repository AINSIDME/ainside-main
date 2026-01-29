// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { requireAdmin2FA } from "../_shared/admin.ts";

type Action = 'list' | 'create' | 'toggleActive' | 'delete';

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest(req);
  }

  try {
    const { supabaseAdmin } = await requireAdmin2FA(req);

    const body = (req.method === 'GET') ? {} : await req.json().catch(() => ({}));
    const action: Action = body?.action;

    if (!action) {
      return new Response(JSON.stringify({ error: 'Missing action' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === 'list') {
      console.log('[admin-coupons] Listing coupons...');
      const { data, error } = await supabaseAdmin
        .from('discount_coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[admin-coupons] List error:', error);
        throw error;
      }

      console.log('[admin-coupons] Found', data?.length || 0, 'coupons');
      return new Response(JSON.stringify({ data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === 'create') {
      const code = String(body?.code ?? '').trim();
      const discount_percent = Number(body?.discount_percent ?? 50);
      const duration_months = Number(body?.duration_months ?? 12);
      const max_uses = Number(body?.max_uses ?? 1);
      const expires_at = body?.expires_at ? String(body.expires_at) : null;
      const notes = body?.notes ? String(body.notes) : null;

      if (!code) {
        return new Response(JSON.stringify({ error: 'Missing code' }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabaseAdmin
        .from('discount_coupons')
        .insert({
          code,
          discount_percent,
          duration_months,
          max_uses,
          current_uses: 0,
          is_active: true,
          expires_at,
          notes,
        });

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === 'toggleActive') {
      const id = String(body?.id ?? '').trim();
      const is_active = Boolean(body?.is_active);

      if (!id) {
        return new Response(JSON.stringify({ error: 'Missing id' }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabaseAdmin
        .from('discount_coupons')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === 'delete') {
      const id = String(body?.id ?? '').trim();
      if (!id) {
        return new Response(JSON.stringify({ error: 'Missing id' }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabaseAdmin
        .from('discount_coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('[admin-coupons] Error:', error);
    return new Response(JSON.stringify({ 
      error: error?.message ?? 'Internal error',
      details: String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
