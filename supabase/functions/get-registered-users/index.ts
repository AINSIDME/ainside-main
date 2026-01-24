// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { requireAdmin2FA } from "../_shared/admin.ts";

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
          action: 'admin.users.view',
          details: { endpoint: 'get-registered-users', admin_email: email },
        });
    } catch (_) {
      // ignore
    }

    // Get all users from auth.users
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('[get-registered-users] Error fetching users:', error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    console.log(`[get-registered-users] Fetched ${users?.users?.length || 0} users`);

    // Format user data
    const formattedUsers = (users?.users || []).map((user: any) => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      email_confirmed_at: user.email_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
      user_metadata: user.user_metadata || {},
    }));

    return new Response(
      JSON.stringify({
        users: formattedUsers,
        count: formattedUsers.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const message = (error as Error)?.message ?? 'Unknown error';
    return new Response(
      JSON.stringify({ users: [], error: message, count: 0 }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }
});
