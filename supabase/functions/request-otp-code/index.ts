// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

// Traducciones multiidioma
const translations = {
  es: {
    subject: "🔐 Tu código de verificación:",
    title: "AInside",
    subtitle: "Algotrading Inteligente",
    yourCode: "Tu código de verificación es:",
    instructions: "Ingresa este código en la página de inicio de sesión para acceder a tu cuenta.",
    expiresWarning: "Este código expira en 10 minutos",
    securityTitle: "🛡️ Medidas de Seguridad:",
    securityTips: [
      "No compartas este código con nadie",
      "AInside nunca te pedirá este código por teléfono o email",
      "Si no solicitaste este código, ignora este email"
    ],
    emailSentTo: "Email enviado a:",
    support: "Si tienes problemas, contacta a",
    footer: "© 2026 AInside. Todos los derechos reservados."
  },
  en: {
    subject: "🔐 Your verification code:",
    title: "AInside",
    subtitle: "Intelligent Algotrading",
    yourCode: "Your verification code is:",
    instructions: "Enter this code on the login page to access your account.",
    expiresWarning: "This code expires in 10 minutes",
    securityTitle: "🛡️ Security Measures:",
    securityTips: [
      "Do not share this code with anyone",
      "AInside will never ask for this code by phone or email",
      "If you didn't request this code, ignore this email"
    ],
    emailSentTo: "Email sent to:",
    support: "If you have problems, contact",
    footer: "© 2026 AInside. All rights reserved."
  },
  fr: {
    subject: "🔐 Votre code de vérification:",
    title: "AInside",
    subtitle: "Algotrading Intelligent",
    yourCode: "Votre code de vérification est:",
    instructions: "Entrez ce code sur la page de connexion pour accéder à votre compte.",
    expiresWarning: "Ce code expire dans 10 minutes",
    securityTitle: "🛡️ Mesures de Sécurité:",
    securityTips: [
      "Ne partagez pas ce code avec qui que ce soit",
      "AInside ne vous demandera jamais ce code par téléphone ou email",
      "Si vous n'avez pas demandé ce code, ignorez cet email"
    ],
    emailSentTo: "Email envoyé à:",
    support: "Si vous avez des problèmes, contactez",
    footer: "© 2026 AInside. Tous droits réservés."
  },
  he: {
    subject: "🔐 קוד האימות שלך:",
    title: "AInside",
    subtitle: "אלגו-טריידינג חכם",
    yourCode: "קוד האימות שלך הוא:",
    instructions: "הזן קוד זה בעמוד ההתחברות כדי לגשת לחשבונך.",
    expiresWarning: "קוד זה פג תוקף בעוד 10 דקות",
    securityTitle: "🛡️ אמצעי אבטחה:",
    securityTips: [
      "אל תשתף קוד זה עם אף אחד",
      "AInside לעולם לא תבקש ממך קוד זה בטלפון או באימייל",
      "אם לא ביקשת קוד זה, התעלם מאימייל זה"
    ],
    emailSentTo: "אימייל נשלח אל:",
    support: "אם יש לך בעיות, צור קשר עם",
    footer: "© 2026 AInside. כל הזכויות שמורות."
  },
  ar: {
    subject: "🔐 رمز التحقق الخاص بك:",
    title: "AInside",
    subtitle: "تداول خوارزمي ذكي",
    yourCode: "رمز التحقق الخاص بك هو:",
    instructions: "أدخل هذا الرمز في صفحة تسجيل الدخول للوصول إلى حسابك.",
    expiresWarning: "ينتهي صلاحية هذا الرمز خلال 10 دقائق",
    securityTitle: "🛡️ إجراءات الأمان:",
    securityTips: [
      "لا تشارك هذا الرمز مع أي شخص",
      "AInside لن تطلب منك هذا الرمز عبر الهاتف أو البريد الإلكتروني",
      "إذا لم تطلب هذا الرمز، تجاهل هذا البريد الإلكتروني"
    ],
    emailSentTo: "تم إرسال البريد الإلكتروني إلى:",
    support: "إذا كان لديك مشاكل، اتصل بـ",
    footer: "© 2026 AInside. جميع الحقوق محفوظة."
  },
  ru: {
    subject: "🔐 Ваш код подтверждения:",
    title: "AInside",
    subtitle: "Интеллектуальный Алготрейдинг",
    yourCode: "Ваш код подтверждения:",
    instructions: "Введите этот код на странице входа, чтобы получить доступ к вашей учетной записи.",
    expiresWarning: "Этот код истекает через 10 минут",
    securityTitle: "🛡️ Меры Безопасности:",
    securityTips: [
      "Не делитесь этим кодом ни с кем",
      "AInside никогда не попросит у вас этот код по телефону или электронной почте",
      "Если вы не запрашивали этот код, проигнорируйте это письмо"
    ],
    emailSentTo: "Электронное письмо отправлено:",
    support: "Если у вас есть проблемы, свяжитесь с",
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
