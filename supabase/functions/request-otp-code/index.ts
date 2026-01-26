// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

// Traducciones multiidioma
const translations = {
  es: {
    subject: "Código de Autenticación",
    title: "AInside",
    subtitle: "Institutional Algorithmic Trading",
    yourCode: "Su código de verificación:",
    instructions: "Ingrese este código en la plataforma de autenticación para acceder a su cuenta institucional.",
    expiresWarning: "Validez: 10 minutos",
    securityTitle: "AVISO DE SEGURIDAD",
    securityTips: [
      "Este código es estrictamente confidencial y de uso personal",
      "Nuestro equipo nunca solicitará este código por ningún medio",
      "Si no ha solicitado este código, ignore este mensaje y notifique al departamento de seguridad"
    ],
    emailSentTo: "Destinatario:",
    support: "Departamento de Soporte",
    footer: "© 2026 AInside. Todos los derechos reservados."
  },
  en: {
    subject: "Authentication Code",
    title: "AInside",
    subtitle: "Institutional Algorithmic Trading",
    yourCode: "Your verification code:",
    instructions: "Enter this code on the authentication platform to access your institutional account.",
    expiresWarning: "Validity: 10 minutes",
    securityTitle: "SECURITY NOTICE",
    securityTips: [
      "This code is strictly confidential and for personal use only",
      "Our team will never request this code through any channel",
      "If you did not request this code, please ignore this message and notify the security department"
    ],
    emailSentTo: "Recipient:",
    support: "Support Department",
    footer: "© 2026 AInside. All rights reserved."
  },
  fr: {
    subject: "Code d'Authentification",
    title: "AInside",
    subtitle: "Institutional Algorithmic Trading",
    yourCode: "Votre code de vérification:",
    instructions: "Veuillez saisir ce code sur la plateforme d'authentification pour accéder à votre compte institutionnel.",
    expiresWarning: "Validité: 10 minutes",
    securityTitle: "AVIS DE SÉCURITÉ",
    securityTips: [
      "Ce code est strictement confidentiel et à usage personnel uniquement",
      "Notre équipe ne demandera jamais ce code par aucun moyen",
      "Si vous n'avez pas demandé ce code, veuillez ignorer ce message et notifier le département de sécurité"
    ],
    emailSentTo: "Destinataire:",
    support: "Département Support",
    footer: "© 2026 AInside. Tous droits réservés."
  },
  he: {
    subject: "קוד אימות",
    title: "AInside",
    subtitle: "Institutional Algorithmic Trading",
    yourCode: "קוד האימות שלך:",
    instructions: "הזן קוד זה בפלטפורמת האימות כדי לגשת לחשבון המוסדי שלך.",
    expiresWarning: "תוקף: 10 דקות",
    securityTitle: "הודעת אבטחה",
    securityTips: [
      "קוד זה הינו סודי לחלוטין ולשימוש אישי בלבד",
      "הצוות שלנו לעולם לא יבקש קוד זה בשום אמצעי",
      "אם לא ביקשת קוד זה, אנא התעלם מהודעה זו והודע למחלקת האבטחה"
    ],
    emailSentTo: "נמען:",
    support: "מחלקת תמיכה",
    footer: "© 2026 AInside. כל הזכויות שמורות."
  },
  ar: {
    subject: "رمز المصادقة",
    title: "AInside",
    subtitle: "Institutional Algorithmic Trading",
    yourCode: "رمز التحقق الخاص بك:",
    instructions: "أدخل هذا الرمز في منصة المصادقة للوصول إلى حسابك المؤسسي.",
    expiresWarning: "الصلاحية: 10 دقائق",
    securityTitle: "إشعار أمني",
    securityTips: [
      "هذا الرمز سري تمامًا وللاستخدام الشخصي فقط",
      "فريقنا لن يطلب هذا الرمز أبدًا عبر أي قناة",
      "إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة وإخطار قسم الأمن"
    ],
    emailSentTo: "المستلم:",
    support: "قسم الدعم",
    footer: "© 2026 AInside. جميع الحقوق محفوظة."
  },
  ru: {
    subject: "Код Аутентификации",
    title: "AInside",
    subtitle: "Institutional Algorithmic Trading",
    yourCode: "Ваш код подтверждения:",
    instructions: "Введите этот код на платформе аутентификации для доступа к вашему институциональному счету.",
    expiresWarning: "Действителен: 10 минут",
    securityTitle: "УВЕДОМЛЕНИЕ О БЕЗОПАСНОСТИ",
    securityTips: [
      "Этот код строго конфиденциален и предназначен только для личного использования",
      "Наша команда никогда не запросит этот код каким-либо способом",
      "Если вы не запрашивали этот код, пожалуйста, проигнорируйте это сообщение и уведомите отдел безопасности"
    ],
    emailSentTo: "Получатель:",
    support: "Отдел Поддержки",
    footer: "© 2026 AInside. Все права защищены."
  }
};

// Función para generar código OTP de 6 dígitos
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Función para generar HTML del email con diseño minimalista elegante
function generateEmailHTML(code: string, email: string, lang: string = "es"): string {
  const t = translations[lang as keyof typeof translations] || translations.es;
  const t = translations[lang as keyof typeof translations] || translations.es;
  
  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.subject} ${code}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: #ffffff; padding: 50px 40px 30px; text-align: center; border-bottom: 1px solid #e5e5e5;">
              <img src="https://ainside.me/brand/logo-master.png" alt="AInside Logo" style="width: 180px; height: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;" />
              <h1 style="margin: 0; color: #000000; font-size: 22px; font-weight: 500; letter-spacing: -0.3px;">${t.title}</h1>
              <p style="margin: 8px 0 0; color: #737373; font-size: 13px; font-weight: 400; text-transform: uppercase; letter-spacing: 2px;">
                ${t.subtitle}
              </p>
            </td>
          </tr>

          <!-- Código OTP -->
          <tr>
            <td style="padding: 50px 40px;">
              <p style="margin: 0 0 30px; color: #404040; font-size: 15px; line-height: 1.6; text-align: center; font-weight: 400;">
                ${t.yourCode}
              </p>
              
              <!-- Código en caja minimalista -->
              <div style="background-color: #fafafa; border: 1px solid #e5e5e5; padding: 40px; margin: 30px 0; text-align: center;">
                <span style="font-size: 42px; font-weight: 600; color: #000000; letter-spacing: 14px; font-family: 'Courier New', monospace; display: inline-block; padding: 15px 25px; background: #ffffff; border: 2px solid #000000;">
                  ${code}
                </span>
              </div>
              
              <p style="margin: 30px 0; color: #737373; font-size: 14px; line-height: 1.6; text-align: center;">
                ${t.instructions}
              </p>
              
              <!-- Advertencia de expiración -->
              <div style="background-color: #fafafa; border-left: 2px solid #000000; padding: 20px; margin: 30px 0;">
                <p style="margin: 0; color: #404040; font-size: 13px; line-height: 1.6; font-weight: 500;">
                  ${t.expiresWarning}
                </p>
              </div>

              <!-- Información de seguridad -->
              <div style="background-color: #ffffff; border: 1px solid #e5e5e5; padding: 25px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px; color: #000000; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">${t.securityTitle}</h3>
                ${t.securityTips.map(tip => `<p style="margin: 8px 0; color: #737373; font-size: 13px; line-height: 1.6;">• ${tip}</p>`).join('')}
              </div>
              
              <!-- Footer info -->
              <p style="margin: 35px 0 0; color: #737373; font-size: 13px; line-height: 1.6; text-align: center;">
                ${t.emailSentTo} <strong style="color: #000000;">${email}</strong>
              </p>
              <p style="margin: 8px 0 0; color: #737373; font-size: 13px; line-height: 1.6; text-align: center;">
                ${t.support} <a href="mailto:support@ainside.me" style="color: #000000; text-decoration: underline; font-weight: 400;">support@ainside.me</a>
              </p>
              
              <p style="margin: 35px 0 0; color: #a3a3a3; font-size: 11px; line-height: 1.6; border-top: 1px solid #e5e5e5; padding-top: 25px; text-align: center;">
                ${t.footer}<br>
                <a href="https://ainside.me" style="color: #737373; text-decoration: none; font-weight: 400;">ainside.me</a>
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

    const { email, lang } = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Email inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validar y establecer idioma (por defecto español)
    const supportedLangs = ['es', 'en', 'fr', 'he', 'ar', 'ru'];
    const userLang = lang && supportedLangs.includes(lang) ? lang : 'es';

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

    // Obtener traducciones para el subject
    const t = translations[userLang as keyof typeof translations] || translations.es;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AInside <noreply@ainside.me>",
        to: [email],
        subject: `${t.subject} ${code}`,
        html: generateEmailHTML(code, email, userLang),
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
