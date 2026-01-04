import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { clientId, strategy, enable } = await req.json();

    if (!clientId || !strategy || enable === undefined) {
      throw new Error("Missing required parameters");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current client connection
    const { data: reg, error: regError } = await supabase
      .from("hwid_registrations")
      .select("hwid")
      .eq("id", clientId)
      .single();

    if (regError) throw regError;

    // Get or create connection record
    const { data: conn, error: connError } = await supabase
      .from("client_connections")
      .select("*")
      .eq("hwid", reg.hwid)
      .maybeSingle();

    let strategies_active = conn?.strategies_active || [];

    if (enable) {
      // Add strategy if not already active
      if (!strategies_active.includes(strategy)) {
        strategies_active.push(strategy);
      }
    } else {
      // Remove strategy
      strategies_active = strategies_active.filter((s: string) => s !== strategy);
    }

    // Update or insert connection
    if (conn) {
      const { error: updateError } = await supabase
        .from("client_connections")
        .update({
          strategies_active,
          updated_at: new Date().toISOString(),
        })
        .eq("hwid", reg.hwid);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from("client_connections")
        .insert({
          hwid: reg.hwid,
          strategies_active,
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
      JSON.stringify({ success: true, strategies_active }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
