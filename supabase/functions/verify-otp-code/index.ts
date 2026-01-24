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

    // Crear o actualizar usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      email_confirm: true,
      user_metadata: {
        email_verified: true,
        auth_method: "otp_email",
      },
    });

    if (authError && authError.message !== "User already registered") {
      console.error("Error creando usuario:", authError);
      throw new Error("Error al autenticar");
    }

    // Si el usuario ya existe, obtenerlo
    let userId = authData?.user?.id;
    
    if (!userId) {
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const user = existingUser?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase().trim());
      userId = user?.id;
    }

    if (!userId) {
      throw new Error("Error al obtener usuario");
    }

    // Generar sesión
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: email.toLowerCase().trim(),
    });

    if (sessionError) {
      console.error("Error generando sesión:", sessionError);
      throw new Error("Error al crear sesión");
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Autenticación exitosa",
        user: {
          id: userId,
          email: email.toLowerCase().trim(),
        },
        session: sessionData,
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
