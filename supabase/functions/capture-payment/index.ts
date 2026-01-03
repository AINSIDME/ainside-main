import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      });
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(JSON.stringify({ error: "Order ID is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
    const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET");
    const PAYPAL_ENV = Deno.env.get("PAYPAL_ENV") || "sandbox";

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return new Response(JSON.stringify({ error: "PayPal credentials not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const PAYPAL_BASE_URL = PAYPAL_ENV === "live" 
      ? "https://api-m.paypal.com" 
      : "https://api-m.sandbox.paypal.com";

    // Get PayPal access token
    const authResponse = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!authResponse.ok) {
      const text = await authResponse.text();
      const debugId = authResponse.headers.get("paypal-debug-id");
      console.error("PayPal auth failed:", { text, debugId });
      return new Response(
        JSON.stringify({
          error: "Failed to authenticate with PayPal",
          details: text,
          debugId,
        }),
        {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 502,
      }
      );
    }

    const { access_token } = await authResponse.json();

    // Capture the PayPal order
    const captureResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`,
      },
    });

    if (!captureResponse.ok) {
      const text = await captureResponse.text();
      const debugId = captureResponse.headers.get("paypal-debug-id");
      console.error("PayPal capture failed:", { text, debugId });
      return new Response(
        JSON.stringify({
          error: "Failed to capture payment",
          details: text,
          debugId,
        }),
        {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 502,
      }
      );
    }

    const result = await captureResponse.json();
    
    // Extract payment details
    const capture = result?.purchase_units?.[0]?.payments?.captures?.[0];
    const payerEmail = result?.payer?.email_address;
    const amount = capture?.amount?.value;
    const currency = capture?.amount?.currency_code;
    const status = result?.status;

    const debugId = captureResponse.headers.get("paypal-debug-id");
    return new Response(
      JSON.stringify({
        success: true,
        orderId: result.id,
        status,
        amount,
        currency,
        payerEmail,
        captureTime: capture?.create_time,
        plan: result?.purchase_units?.[0]?.description,
        debugId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Payment capture error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});