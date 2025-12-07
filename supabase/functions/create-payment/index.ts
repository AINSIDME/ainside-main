import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const { plan } = await req.json();

    // Server-side plan → amount mapping to prevent tampering
    const PLANS: Record<string, { amount: number; currency: string; description: string }> = {
      micro_monthly: { amount: 99.0, currency: "USD", description: "Micro S&P 500 Monthly" },
      micro_annual:  { amount: 831.6, currency: "USD", description: "Micro S&P 500 Annual" },
      mini_monthly:  { amount: 999.0, currency: "USD", description: "Mini S&P 500 Monthly" },
      mini_annual:   { amount: 8391.6, currency: "USD", description: "Mini S&P 500 Annual" },
      pro_monthly:   { amount: 19.99, currency: "USD", description: "Pro Monthly" },
    };

    const selected = plan && PLANS[plan];
    if (!selected) {
      return new Response(
        JSON.stringify({ error: "Invalid plan", details: "Unknown plan identifier" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    const amountStr = selected.amount.toFixed(2);

    // We already validated 'plan' and resolved amount from server-side mapping

    const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
    const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET");
    const PAYPAL_ENV = Deno.env.get("PAYPAL_ENV") || "sandbox";
    const APP_ORIGIN = Deno.env.get("APP_ORIGIN") || "http://localhost:8080";

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return new Response(JSON.stringify({ error: "PayPal credentials not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const PAYPAL_BASE_URL = PAYPAL_ENV === "live" 
      ? "https://api-m.paypal.com" 
      : "https://api-m.sandbox.paypal.com";

    // Require HTTPS origin in live mode to comply with PayPal callbacks
    if (PAYPAL_ENV === "live" && !APP_ORIGIN.startsWith("https://")) {
      return new Response(
        JSON.stringify({
          error: "Invalid APP_ORIGIN for live mode",
          details: "APP_ORIGIN must be an HTTPS domain in production.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

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
      console.error("PayPal auth failed:", text);
      return new Response(
        JSON.stringify({
          error: "Failed to authenticate with PayPal",
          details: text,
        }),
        {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 502,
      }
      );
    }

    const { access_token } = await authResponse.json();

    // Create PayPal order
    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: selected.currency,
            value: amountStr,
          },
          description: selected.description,
        },
      ],
      application_context: {
        return_url: `${APP_ORIGIN}/payment-success`,
        cancel_url: `${APP_ORIGIN}/payment-cancel`,
        brand_name: "AInside",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
      },
    };

    const orderResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!orderResponse.ok) {
      const text = await orderResponse.text();
      console.error("PayPal order creation failed:", text);
      return new Response(
        JSON.stringify({
          error: "Failed to create PayPal order",
          details: text,
        }),
        {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 502,
      }
      );
    }

    const order = await orderResponse.json();
    const approvalUrl = order.links?.find((link: any) => link.rel === "approve")?.href;

    return new Response(
      JSON.stringify({
        orderId: order.id,
        approvalUrl,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Payment creation error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});