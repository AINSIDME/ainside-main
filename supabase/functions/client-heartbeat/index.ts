import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest(req);
  }

  try {
    const { hwid, plan_name, strategies_active } = await req.json();

    if (!hwid) {
      throw new Error("Missing HWID");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 🔐 Licensing gate: only registered/active HWIDs can connect.
    const { data: reg, error: regError } = await supabase
      .from("hwid_registrations")
      .select("status")
      .eq("hwid", hwid)
      .eq("status", "active")
      .limit(1);

    if (regError) {
      console.error("HWID lookup error:", regError);
      return new Response(JSON.stringify({ error: "server_error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!reg?.[0]) {
      return new Response(JSON.stringify({ error: "unregistered_hwid" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Update or create connection record
    const now = new Date().toISOString();
    
    const { data: existing } = await supabase
      .from("client_connections")
      .select("*")
      .eq("hwid", hwid)
      .maybeSingle();

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from("client_connections")
        .update({
          plan_name: plan_name || existing.plan_name,
          strategies_active: strategies_active || existing.strategies_active,
          last_seen: now,
          updated_at: now,
        })
        .eq("hwid", hwid)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          config: {
            plan_name: data.plan_name,
            strategies_active: data.strategies_active,
            strategies_available: data.strategies_available,
          }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      // Create new connection record
      const { data, error } = await supabase
        .from("client_connections")
        .insert({
          hwid,
          plan_name: plan_name || "Basic",
          strategies_active: strategies_active || [],
          strategies_available: [
            "Scalping Pro",
            "Trend Following",
            "Mean Reversion",
            "Breakout Strategy",
            "Grid Trading"
          ],
          last_seen: now,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          config: {
            plan_name: data.plan_name,
            strategies_active: data.strategies_active,
            strategies_available: data.strategies_available,
          }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201,
        }
      );
    }
  } catch (error) {
    console.error('Heartbeat error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
