// @ts-nocheck
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { email, code } = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email y código requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar código válido
    const { data: otpRecords, error: fetchError } = await supabase
      .from("auth_otp_codes")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .eq("code", code)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("Error buscando OTP:", fetchError);
      throw new Error("Error verificando código");
    }

    if (!otpRecords || otpRecords.length === 0) {
      return new Response(
        JSON.stringify({ error: "Código inválido o expirado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const otpRecord = otpRecords[0];

    // Marcar como usado
    await supabase
      .from("auth_otp_codes")
      .update({ used: true })
      .eq("id", otpRecord.id);

    // Crear o obtener usuario
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error listando usuarios:", listError);
      throw new Error("Error al autenticar");
    }

    let user = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase().trim());

    // Si el usuario no existe, crearlo
    if (!user) {
      const { data: newUserData, error: createError } = await supabase.auth.admin.createUser({
        email: email.toLowerCase().trim(),
        email_confirm: true,
        user_metadata: {
          email_verified: true,
          auth_method: "otp_email",
        },
      });

      if (createError) {
        console.error("Error creando usuario:", createError);
        throw new Error("Error al crear usuario");
      }

      user = newUserData.user;
    }

    if (!user?.id) {
      throw new Error("Error al obtener usuario");
    }

    // Devolver datos para que el frontend llame a verifyOtp
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Código verificado",
        email: email.toLowerCase().trim(),
        code: code,
        // El frontend debe usar estos datos con supabase.auth.verifyOtp()
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error en verify-otp-code:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
