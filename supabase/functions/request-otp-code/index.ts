// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

// Función para generar código OTP de 6 dígitos
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Función para generar HTML del email
function generateEmailHTML(code: string, email: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Verificación - AInside</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                🔐 AInside
              </h1>
              <p style="margin: 10px 0 0; font-size: 14px; color: #94a3b8;">
                Algotrading Inteligente
              </p>
            </td>
          </tr>

          <!-- Código OTP -->
          <tr>
            <td style="padding: 30px 40px; text-align: center;">
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; border-radius: 12px; margin: 20px 0;">
                <p style="margin: 0 0 15px; font-size: 16px; color: #e0e7ff; font-weight: 500;">
                  Tu código de verificación es:
                </p>
                <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; border: 2px solid rgba(255,255,255,0.2);">
                  <span style="font-size: 42px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                    ${code}
                  </span>
                </div>
              </div>
              
              <p style="margin: 25px 0 10px; font-size: 14px; color: #cbd5e1; line-height: 1.6;">
                Ingresa este código en la página de inicio de sesión para acceder a tu cuenta.
              </p>
              
              <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin-top: 25px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; font-size: 13px; color: #fbbf24; line-height: 1.6;">
                  ⏱️ <strong>Este código expira en 10 minutos</strong>
                </p>
              </div>
            </td>
          </tr>

          <!-- Información de seguridad -->
          <tr>
            <td style="padding: 20px 40px 40px;">
              <div style="background: rgba(239, 68, 68, 0.1); padding: 20px; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.3);">
                <p style="margin: 0 0 10px; font-size: 13px; color: #fca5a5; font-weight: 600;">
                  🛡️ Medidas de Seguridad:
                </p>
                <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #fecaca; line-height: 1.8;">
                  <li>No compartas este código con nadie</li>
                  <li>AInside nunca te pedirá este código por teléfono o email</li>
                  <li>Si no solicitaste este código, ignora este email</li>
                </ul>
              </div>
              
              <p style="margin: 25px 0 0; font-size: 12px; color: #64748b; text-align: center; line-height: 1.6;">
                Email enviado a: <strong style="color: #94a3b8;">${email}</strong><br>
                Si tienes problemas, contacta a soporte@ainside.me
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background: #0f172a; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0; font-size: 11px; color: #475569; line-height: 1.6;">
                © 2026 AInside. Todos los derechos reservados.<br>
                <a href="https://ainside.me" style="color: #3b82f6; text-decoration: none;">ainside.me</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

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

    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Email inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generar código OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Guardar en base de datos
    const { error: insertError } = await supabase
      .from("auth_otp_codes")
      .insert({
        email: email.toLowerCase().trim(),
        code,
        expires_at: expiresAt.toISOString(),
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown",
      });

    if (insertError) {
      console.error("Error guardando OTP:", insertError);
      throw new Error("Error al generar código");
    }

    // Enviar email usando Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY no configurada");
      throw new Error("Servicio de email no configurado");
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AInside <noreply@ainside.me>",
        to: [email],
        subject: `🔐 Tu código de verificación: ${code}`,
        html: generateEmailHTML(code, email),
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Error enviando email:", errorData);
      throw new Error("Error al enviar email");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Código enviado a tu email",
        expiresIn: 600 // 10 minutos en segundos
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error en request-otp-code:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
