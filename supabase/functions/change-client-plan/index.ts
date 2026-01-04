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
    const { clientId, planName } = await req.json();

    if (!clientId || !planName) {
      throw new Error("Missing required parameters");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
