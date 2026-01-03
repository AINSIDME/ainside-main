/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  }

  // Authoritative plan list (must match create-payment mapping)
  const PLANS: Record<
    string,
    { amount: number; currency: string; description: string }
  > = {
    micro_monthly: {
      amount: 99.0,
      currency: "USD",
      description: "Micro S&P 500 Monthly",
    },
    micro_annual: {
      amount: 831.6,
      currency: "USD",
      description: "Micro S&P 500 Annual",
    },
    mini_monthly: {
      amount: 999.0,
      currency: "USD",
      description: "Mini S&P 500 Monthly",
    },
    mini_annual: {
      amount: 8391.6,
      currency: "USD",
      description: "Mini S&P 500 Annual",
    },
    // Gold variants
    micro_gold_monthly: {
      amount: 99.0,
      currency: "USD",
      description: "Micro Gold Monthly",
    },
    micro_gold_annual: {
      amount: 831.6,
      currency: "USD",
      description: "Micro Gold Annual",
    },
    mini_gold_monthly: {
      amount: 999.0,
      currency: "USD",
      description: "Mini Gold Monthly",
    },
    mini_gold_annual: {
      amount: 8391.6,
      currency: "USD",
      description: "Mini Gold Annual",
    },
  };

  const list = Object.entries(PLANS).map(([id, p]) => ({ id, ...p }));

  return new Response(
    JSON.stringify({ plans: list }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
  );
});
