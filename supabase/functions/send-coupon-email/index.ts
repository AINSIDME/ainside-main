import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

interface CouponEmailData {
  recipientEmail: string
  recipientName: string
  couponCode: string
  discountPercent: number
  durationMonths: number
  expiresAt: string | null
  language?: string
}

const translations = {
  es: {
    title: '🎉 ¡Tu Cupón de Descuento!',
    greeting: 'Hola',
    intro: 'Te enviamos un cupón especial de descuento para los planes de trading automático de',
    couponLabel: 'Tu Código de Cupón',
    copyText: 'Copia este código y úsalo al momento de realizar tu compra',
    benefitsTitle: '💎 Beneficios de tu cupón:',
    discount: 'de descuento',
    during: 'durante',
    months: 'meses',
    singleUse: 'Uso único',
    exclusive: 'y exclusivo para ti',
    applicable: 'Aplicable',
    allPlans: 'a todos los planes disponibles',
    validUntil: '⏰ Válido hasta:',
    ctaButton: 'Ver Planes y Usar Cupón',
    questions: 'Si tienes alguna pregunta, no dudes en contactarnos en',
    footer: 'Trading automático inteligente con IA',
    subject: 'Tu Cupón de Descuento'
  },
  en: {
    title: '🎉 Your Discount Coupon!',
    greeting: 'Hello',
    intro: 'We are sending you a special discount coupon for',
    couponLabel: 'Your Coupon Code',
    copyText: 'Copy this code and use it when making your purchase',
    benefitsTitle: '💎 Your coupon benefits:',
    discount: 'discount',
    during: 'for',
    months: 'months',
    singleUse: 'Single use',
    exclusive: 'and exclusive for you',
    applicable: 'Applicable',
    allPlans: 'to all available plans',
    validUntil: '⏰ Valid until:',
    ctaButton: 'View Plans and Use Coupon',
    questions: 'If you have any questions, feel free to contact us at',
    footer: 'Intelligent automated trading with AI',
    subject: 'Your Discount Coupon'
  },
  fr: {
    title: '🎉 Votre Coupon de Réduction !',
    greeting: 'Bonjour',
    intro: 'Nous vous envoyons un coupon de réduction spécial pour les plans de trading automatique de',
    couponLabel: 'Votre Code de Coupon',
    copyText: 'Copiez ce code et utilisez-le lors de votre achat',
    benefitsTitle: '💎 Avantages de votre coupon :',
    discount: 'de réduction',
    during: 'pendant',
    months: 'mois',
    singleUse: 'Usage unique',
    exclusive: 'et exclusif pour vous',
    applicable: 'Applicable',
    allPlans: 'à tous les plans disponibles',
    validUntil: '⏰ Valable jusqu\'au :',
    ctaButton: 'Voir les Plans et Utiliser le Coupon',
    questions: 'Si vous avez des questions, n\'hésitez pas à nous contacter à',
    footer: 'Trading automatique intelligent avec IA',
    subject: 'Votre Coupon de Réduction'
  },
  he: {
    title: '🎉 קופון ההנחה שלך!',
    greeting: 'שלום',
    intro: 'אנו שולחים לך קופון הנחה מיוחד עבור תוכניות המסחר האוטומטי של',
    couponLabel: 'קוד הקופון שלך',
    copyText: 'העתק את הקוד הזה והשתמש בו בעת ביצוע הרכישה',
    benefitsTitle: '💎 היתרונות של הקופון שלך:',
    discount: 'הנחה',
    during: 'במשך',
    months: 'חודשים',
    singleUse: 'שימוש חד-פעמי',
    exclusive: 'ובלעדי עבורך',
    applicable: 'תקף',
    allPlans: 'לכל התוכניות הזמינות',
    validUntil: '⏰ תקף עד:',
    ctaButton: 'צפה בתוכניות והשתמש בקופון',
    questions: 'אם יש לך שאלות, אל תהסס לפנות אלינו בכתובת',
    footer: 'מסחר אוטומטי חכם עם בינה מלאכותית',
    subject: 'קופון ההנחה שלך'
  },
  ar: {
    title: '🎉 قسيمة الخصم الخاصة بك!',
    greeting: 'مرحباً',
    intro: 'نرسل لك قسيمة خصم خاصة لخطط التداول الآلي من',
    couponLabel: 'رمز القسيمة الخاص بك',
    copyText: 'انسخ هذا الرمز واستخدمه عند إجراء عملية الشراء',
    benefitsTitle: '💎 فوائد قسيمتك:',
    discount: 'خصم',
    during: 'لمدة',
    months: 'أشهر',
    singleUse: 'استخدام واحد',
    exclusive: 'وحصري لك',
    applicable: 'قابل للتطبيق',
    allPlans: 'على جميع الخطط المتاحة',
    validUntil: '⏰ صالح حتى:',
    ctaButton: 'عرض الخطط واستخدام القسيمة',
    questions: 'إذا كان لديك أي أسئلة، لا تتردد في الاتصال بنا على',
    footer: 'تداول آلي ذكي بالذكاء الاصطناعي',
    subject: 'قسيمة الخصم الخاصة بك'
  },
  ru: {
    title: '🎉 Ваш Купон на Скидку!',
    greeting: 'Здравствуйте',
    intro: 'Мы отправляем вам специальный купон на скидку для планов автоматической торговли от',
    couponLabel: 'Ваш Код Купона',
    copyText: 'Скопируйте этот код и используйте его при совершении покупки',
    benefitsTitle: '💎 Преимущества вашего купона:',
    discount: 'скидка',
    during: 'на',
    months: 'месяцев',
    singleUse: 'Одноразовое использование',
    exclusive: 'и эксклюзивно для вас',
    applicable: 'Применимо',
    allPlans: 'ко всем доступным планам',
    validUntil: '⏰ Действителен до:',
    ctaButton: 'Посмотреть Планы и Использовать Купон',
    questions: 'Если у вас есть вопросы, свяжитесь с нами по адресу',
    footer: 'Интеллектуальная автоматическая торговля с ИИ',
    subject: 'Ваш Купон на Скидку'
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(req);
  }

  try {
    const { 
      recipientEmail, 
      recipientName, 
      couponCode, 
      discountPercent, 
      durationMonths,
      expiresAt 
    }: CouponEmailData = await req.json()

    console.log('Received request to send coupon email:', {
      recipientEmail,
      recipientName,
      couponCode,
      discountPercent,
      durationMonths
    })

    // Validate required fields
    if (!recipientEmail || !recipientName || !couponCode || !discountPercent || !durationMonths) {
      console.error('Missing required fields:', {
        hasEmail: !!recipientEmail,
        hasName: !!recipientName,
        hasCode: !!couponCode,
        hasDiscount: !!discountPercent,
        hasDuration: !!durationMonths
      })
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send coupon email
    const emailSent = await sendCouponEmail({
      recipientEmail,
      recipientName,
      couponCode,
      discountPercent,
      durationMonths,
      expiresAt
    })

    if (!emailSent) {
      console.error('Email sending failed')
      throw new Error('Failed to send email')
    }

    console.log('Email sent successfully to:', recipientEmail)
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Coupon email sent successfully'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function sendCouponEmail(data: CouponEmailData): Promise<boolean> {
  try {
    const resendKey = Deno.env.get('RESEND_API_KEY')
    const sendgridKey = Deno.env.get('SENDGRID_API_KEY')

    console.log('Email service configuration:', {
      hasResend: !!resendKey,
      hasSendGrid: !!sendgridKey
    })

    const lang = data.language || 'en'
    const t = translations[lang] || translations.en
    const isRTL = lang === 'he' || lang === 'ar'
    const direction = isRTL ? 'rtl' : 'ltr'

    const localeMap = {
      es: 'es-ES',
      en: 'en-US',
      fr: 'fr-FR',
      he: 'he-IL',
      ar: 'ar-SA',
      ru: 'ru-RU'
    }

    const expirationText = data.expiresAt 
      ? `<p style="margin: 20px 0 0; padding: 20px; background-color: rgba(251, 191, 36, 0.1); border-left: 4px solid #fbbf24; border-radius: 8px; font-size: 15px; color: #fbbf24;">
          <strong>${t.validUntil}</strong> ${new Date(data.expiresAt).toLocaleDateString(localeMap[lang], { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>`
      : ''

    const emailHTML = `
<!DOCTYPE html>
<html lang="${lang}" dir="${direction}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title} - AInside</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #000000 0%, #0f172a 100%);">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #000000 0%, #0f172a 100%);">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0a0a0a 0%, #1e1b4b 100%); border: 2px solid #3b82f6; border-radius: 16px; box-shadow: 0 20px 60px rgba(59, 130, 246, 0.4);">
          
          <!-- Header with gradient -->
          <tr>
            <td style="padding: 50px 40px 30px; text-align: center; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%); border-radius: 14px 14px 0 0;">
              <div style="display: inline-block; padding: 15px 25px; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); border-radius: 50px; margin-bottom: 20px;">
                <span style="font-size: 36px;">🎁</span>
              </div>
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);">
                ${t.title}
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;" dir="${direction}">
              <p style="margin: 0 0 20px; font-size: 18px; line-height: 1.6; color: #e2e8f0;">
                ${t.greeting} <strong style="color: #ffffff; font-size: 20px;">${data.recipientName}</strong> 👋
              </p>

              <p style="margin: 0 0 35px; font-size: 16px; line-height: 1.7; color: #cbd5e1;">
                ${t.intro} <strong style="color: #60a5fa; font-weight: 600;">AInside</strong>.
              </p>

              <!-- Coupon Code Box - Elegant Design -->
              <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%); border-radius: 16px; padding: 40px; text-align: center; margin: 35px 0; box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4); position: relative; overflow: hidden;">
                <div style="position: absolute; top: -50px; ${isRTL ? 'left' : 'right'}: -50px; width: 150px; height: 150px; background: rgba(255, 255, 255, 0.05); border-radius: 50%; z-index: 0;"></div>
                <div style="position: absolute; bottom: -30px; ${isRTL ? 'right' : 'left'}: -30px; width: 100px; height: 100px; background: rgba(255, 255, 255, 0.05); border-radius: 50%; z-index: 0;"></div>
                
                <p style="position: relative; z-index: 1; margin: 0 0 20px; font-size: 14px; color: #dbeafe; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">
                  ✨ ${t.couponLabel} ✨
                </p>
                <div style="position: relative; z-index: 1; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); border: 3px dashed rgba(255, 255, 255, 0.4); border-radius: 12px; padding: 25px; margin: 0 0 25px;">
                  <code style="font-size: 36px; font-weight: 900; color: #ffffff; letter-spacing: 4px; font-family: 'Courier New', monospace; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);">
                    ${data.couponCode}
                  </code>
                </div>
                <p style="position: relative; z-index: 1; margin: 0; font-size: 14px; color: #dbeafe; line-height: 1.5;">
                  ${t.copyText}
                </p>
              </div>

              <!-- Benefits - Modern Cards -->
              <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border: 2px solid #334155; border-radius: 12px; padding: 30px; margin: 35px 0; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);">
                <p style="margin: 0 0 25px; font-size: 20px; font-weight: 700; color: #ffffff; text-align: center;">
                  ${t.benefitsTitle}
                </p>
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 10px; padding: 18px 25px; margin: 0 0 15px; display: flex; align-items: center; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                  <span style="font-size: 24px; margin-${isRTL ? 'left' : 'right'}: 15px;">💰</span>
                  <span style="font-size: 16px; color: #ffffff; font-weight: 600;">
                    <strong style="font-size: 22px;">${data.discountPercent}%</strong> ${t.discount} ${t.during} <strong>${data.durationMonths}</strong> ${t.months}
                  </span>
                </div>
                <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 10px; padding: 18px 25px; margin: 0 0 15px; display: flex; align-items: center; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
                  <span style="font-size: 24px; margin-${isRTL ? 'left' : 'right'}: 15px;">🎯</span>
                  <span style="font-size: 16px; color: #ffffff; font-weight: 600;">
                    <strong>${t.singleUse}</strong> ${t.exclusive}
                  </span>
                </div>
                <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 10px; padding: 18px 25px; margin: 0; display: flex; align-items: center; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                  <span style="font-size: 24px; margin-${isRTL ? 'left' : 'right'}: 15px;">✓</span>
                  <span style="font-size: 16px; color: #ffffff; font-weight: 600;">
                    <strong>${t.applicable}</strong> ${t.allPlans}
                  </span>
                </div>
              </div>

              ${expirationText}

              <!-- CTA Button - Premium Style -->
              <div style="text-align: center; margin: 45px 0 35px;">
                <a href="https://ainside.me/pricing" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1e40af 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 12px; font-weight: 700; font-size: 17px; box-shadow: 0 8px 20px rgba(59, 130, 246, 0.5); transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 1px;">
                  🚀 ${t.ctaButton}
                </a>
              </div>

              <p style="margin: 35px 0 0; font-size: 14px; line-height: 1.7; color: #94a3b8; text-align: center; padding: 25px; background: rgba(15, 23, 42, 0.5); border-radius: 10px; border: 1px solid #1e293b;">
                ${t.questions}<br>
                <a href="mailto:support@ainside.me" style="color: #60a5fa; text-decoration: none; font-weight: 600;">support@ainside.me</a>
              </p>
            </td>
          </tr>

          <!-- Footer - Elegant -->
          <tr>
            <td style="padding: 35px 40px; text-align: center; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 0 0 14px 14px; border-top: 2px solid #3b82f6;">
              <div style="margin-bottom: 15px;">
                <span style="font-size: 40px;">🤖</span>
              </div>
              <p style="margin: 0 0 10px; font-size: 18px; font-weight: 700; color: #ffffff;">
                AInside Trading
              </p>
              <p style="margin: 0 0 20px; font-size: 13px; color: #94a3b8; line-height: 1.6;">
                ${t.footer}
              </p>
              <p style="margin: 0; font-size: 13px;">
                <a href="https://ainside.me" style="color: #60a5fa; text-decoration: none; font-weight: 600; padding: 8px 20px; background: rgba(59, 130, 246, 0.1); border-radius: 20px; display: inline-block;">
                  🌐 ainside.me
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    // Try Resend first
    if (resendKey) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'AInside <noreply@ainside.me>',
          to: [data.recipientEmail],
          subject: `🎁 ${t.subject} ${data.discountPercent}% - AInside`,
          html: emailHTML
        })
      })

      if (!response.ok) {
        console.error('Resend error:', await response.text())
        return false
      }

      console.log('Coupon email sent via Resend to:', data.recipientEmail)
      return true
    }

    // Try SendGrid
    if (sendgridKey) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: data.recipientEmail, name: data.recipientName }],
            subject: `🎁 ${t.subject} ${data.discountPercent}% - AInside`
          }],
          from: { email: 'noreply@ainside.me', name: 'AInside' },
          content: [{
            type: 'text/html',
            value: emailHTML
          }]
        })
      })

      if (!response.ok) {
        console.error('SendGrid error:', await response.text())
        return false
      }

      console.log('Coupon email sent via SendGrid to:', data.recipientEmail)
      return true
    }

    console.error('No email service configured (RESEND_API_KEY or SENDGRID_API_KEY)')
    return false

  } catch (error) {
    console.error('Email sending error:', error)
    return false
  }
}
