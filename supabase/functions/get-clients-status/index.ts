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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all registered clients with their status
    const { data: registrations, error: regError } = await supabase
      .from("hwid_registrations")
      .select("*");

    if (regError) throw regError;

    // Get connection status for each client
    const { data: connections, error: connError } = await supabase
      .from("client_connections")
      .select("*");

    if (connError) throw connError;

    // Merge data
    const clients = registrations.map((reg: any) => {
      const conn = connections?.find((c: any) => c.hwid === reg.hwid);
      const lastSeen = conn?.last_seen || reg.created_at;
      const now = new Date().getTime();
      const lastSeenTime = new Date(lastSeen).getTime();
      const diffMinutes = Math.floor((now - lastSeenTime) / 1000 / 60);
      
      // Consider online if seen in last 2 minutes
      const status = diffMinutes < 2 ? "online" : "offline";

      return {
        id: reg.id,
        email: reg.email,
        name: reg.name,
        hwid: reg.hwid,
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
      };
    });

    return new Response(
      JSON.stringify({ clients }),
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
