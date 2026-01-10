import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest(req);
  }

  // Solo permitir POST (evita errores raros desde navegador)
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => null);

    const nameInput = (body?.name ?? "").toString().trim();
    const emailInput = (body?.email ?? "").toString().trim().toLowerCase();
    const orderId = (body?.orderId ?? "").toString().trim();
    const hwid = (body?.hwid ?? "").toString().trim();

    // Business rule: Order ID (from PayPal) + HWID are enough.
    // Name/email can be derived from the stored purchase when missing.
    if (!orderId || !hwid) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput && !emailRegex.test(emailInput)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const macNumberRegex = /^\d{10,15}$/;
    if (!uuidRegex.test(hwid) && !macNumberRegex.test(hwid)) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid HWID format. Must be a UUID or MAC address number (from AInside HWID Tool).",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Server misconfigured (missing SUPABASE env vars)." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    // Purchase must exist (PayPal order_id is stored in `purchases.order_id`)
    // Use array + limit(1) to avoid .single() errors.
    const purchaseQuery = supabase
      .from("purchases")
      .select("order_id, email, status")
      .eq("order_id", orderId)
      .limit(1);

    const { data: purchases, error: orderError } = await (emailInput
      ? purchaseQuery.eq("email", emailInput)
      : purchaseQuery);

    if (orderError) {
      console.error("Order validation error:", orderError);
      return new Response(JSON.stringify({ error: "Failed to validate order." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const purchase = purchases?.[0] ?? null;
    if (!purchase) {
      return new Response(
        JSON.stringify({
          error: emailInput
            ? "Order not found or email mismatch. Please verify your Order ID and email."
            : "Order not found. Please verify your PayPal Order ID.",
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (purchase.status && String(purchase.status).toLowerCase() !== "completed") {
      return new Response(
        JSON.stringify({ error: "Payment not completed for this order." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const email = purchase.email;
    const name = nameInput || email;

    // Optional: Prevent duplicate customers by name (case-insensitive exact match).
    // Only apply when a real name is provided (not blank and not just the email).
    const normalizedNameInput = nameInput.replace(/[%_]/g, "").trim();
    const shouldCheckName =
      normalizedNameInput.length >= 3 &&
      normalizedNameInput.toLowerCase() !== email.toLowerCase();

    if (shouldCheckName) {
      const { data: regsByName, error: nameCheckError } = await supabase
        .from("hwid_registrations")
        .select("order_id, email, hwid, created_at, status, name")
        .eq("status", "active")
        .ilike("name", normalizedNameInput)
        .limit(1);

      if (nameCheckError) {
        console.error("Name duplicate check error:", nameCheckError);
        return new Response(
          JSON.stringify({ error: "Failed to validate existing customer name." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const existingByName = regsByName?.[0] ?? null;
      if (existingByName && (existingByName.email ?? "").toString().toLowerCase() !== email.toLowerCase()) {
        return new Response(
          JSON.stringify({
            error: "This customer name already exists. Please login with the original email or contact support.",
            registeredName: existingByName.name,
            registeredAt: existingByName.created_at,
            registeredOrderId: existingByName.order_id,
          }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Customer already exists? Enforce one active HWID per email (license bound to one computer).
    // Allow adding more orders only if HWID matches the existing active one.
    const { data: regsByEmail, error: emailUseError } = await supabase
      .from("hwid_registrations")
      .select("order_id, hwid, created_at, status")
      .eq("email", email)
      .eq("status", "active")
      .limit(1);

    if (emailUseError) {
      console.error("Email ownership check error:", emailUseError);
      return new Response(JSON.stringify({ error: "Failed to validate existing customer registration." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const existingByEmail = regsByEmail?.[0] ?? null;
    if (existingByEmail && (existingByEmail.hwid ?? "").toString() !== hwid) {
      return new Response(
        JSON.stringify({
          error: "This email already has an active HWID registered. Contact support to change computer/HWID.",
          registeredHwid: existingByEmail.hwid,
          registeredAt: existingByEmail.created_at,
          registeredOrderId: existingByEmail.order_id,
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Order already has HWID? (array + limit(1))
    const { data: regsByOrder, error: hwidCheckError } = await supabase
      .from("hwid_registrations")
      .select("*")
      .eq("order_id", orderId)
      .limit(1);

    if (hwidCheckError) {
      console.error("HWID check error:", hwidCheckError);
      return new Response(JSON.stringify({ error: "Failed to validate existing HWID registration." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const existingHwid = regsByOrder?.[0] ?? null;
    if (existingHwid) {
      return new Response(
        JSON.stringify({
          success: true,
          alreadyRegistered: true,
          message: "This order already has a registered HWID.",
          registration: {
            orderId: existingHwid.order_id,
            hwid: existingHwid.hwid,
            status: existingHwid.status,
            registeredAt: existingHwid.created_at,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // HWID can be used for multiple orders (e.g., customer buys another plan),
    // but it must not be claimed by a different email.
    const { data: regsByHwid, error: hwidUseError } = await supabase
      .from("hwid_registrations")
      .select("order_id, email")
      .eq("hwid", hwid)
      .limit(1);

    if (hwidUseError) {
      console.error("HWID ownership check error:", hwidUseError);
      return new Response(JSON.stringify({ error: "Failed to validate HWID ownership." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const existingOwner = regsByHwid?.[0] ?? null;
    if (existingOwner && (existingOwner.email ?? "").toString().toLowerCase() !== email) {
      return new Response(
        JSON.stringify({
          error: "This HWID is already registered to a different account. Contact support if you need assistance.",
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert registration
    const { data: registration, error: registrationError } = await supabase
      .from("hwid_registrations")
      .insert([
        {
          order_id: orderId,
          email,
          name,
          hwid,
          status: "active",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (registrationError) {
      console.error("Registration error:", registrationError);
      return new Response(
        JSON.stringify({ error: "Failed to register HWID. Please try again or contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "HWID registered successfully",
        registration: {
          orderId: registration.order_id,
          hwid: registration.hwid,
          status: registration.status,
          registeredAt: registration.created_at,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
