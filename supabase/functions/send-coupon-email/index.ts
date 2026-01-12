import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
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
    title: 'AINSIDE LICENSE TOKEN',
    greeting: 'Hola',
    intro: 'Te enviamos un cupón especial de descuento para los planes de trading automático de',
    couponLabel: 'Tu Código de Cupón',
    copyText: 'Copia este código y úsalo al momento de realizar tu compra',
    benefitsTitle: 'Beneficios del cupón',
    discount: 'de descuento',
    during: 'durante',
    months: 'meses',
    singleUse: 'Uso único',
    exclusive: 'y exclusivo para ti',
    applicable: 'Aplicable',
    allPlans: 'a todos los planes disponibles',
    validUntil: 'Válido hasta:',
    ctaButton: 'Ver Planes y Usar Cupón',
    questions: 'Si tienes alguna pregunta, no dudes en contactarnos en',
    footer: 'Trading automático inteligente con IA',
    subject: 'AINSIDE LICENSE TOKEN'
  },
  en: {
    title: 'AINSIDE LICENSE TOKEN',
    greeting: 'Hello',
    intro: 'We are sending you a special discount coupon for',
    couponLabel: 'Your Coupon Code',
    copyText: 'Copy this code and use it when making your purchase',
    benefitsTitle: 'Coupon benefits',
    discount: 'discount',
    during: 'for',
    months: 'months',
    singleUse: 'Single use',
    exclusive: 'and exclusive for you',
    applicable: 'Applicable',
    allPlans: 'to all available plans',
    validUntil: 'Valid until:',
    ctaButton: 'View Plans and Use Coupon',
    questions: 'If you have any questions, feel free to contact us at',
    footer: 'Intelligent automated trading with AI',
    subject: 'AINSIDE LICENSE TOKEN'
  },
  fr: {
    title: 'AINSIDE LICENSE TOKEN',
    greeting: 'Bonjour',
    intro: 'Nous vous envoyons un coupon de réduction spécial pour les plans de trading automatique de',
    couponLabel: 'Votre Code de Coupon',
    copyText: 'Copiez ce code et utilisez-le lors de votre achat',
    benefitsTitle: 'Avantages du coupon',
    discount: 'de réduction',
    during: 'pendant',
    months: 'mois',
    singleUse: 'Usage unique',
    exclusive: 'et exclusif pour vous',
    applicable: 'Applicable',
    allPlans: 'à tous les plans disponibles',
    validUntil: 'Valable jusqu\'au :',
    ctaButton: 'Voir les Plans et Utiliser le Coupon',
    questions: 'Si vous avez des questions, n\'hésitez pas à nous contacter à',
    footer: 'Trading automatique intelligent avec IA',
    subject: 'AINSIDE LICENSE TOKEN'
  },
  he: {
    title: 'AINSIDE LICENSE TOKEN',
    greeting: 'שלום',
    intro: 'אנו שולחים לך קופון הנחה מיוחד עבור תוכניות המסחר האוטומטי של',
    couponLabel: 'קוד הקופון שלך',
    copyText: 'העתק את הקוד הזה והשתמש בו בעת ביצוע הרכישה',
    benefitsTitle: 'היתרונות של הקופון',
    discount: 'הנחה',
    during: 'במשך',
    months: 'חודשים',
    singleUse: 'שימוש חד-פעמי',
    exclusive: 'ובלעדי עבורך',
    applicable: 'תקף',
    allPlans: 'לכל התוכניות הזמינות',
    validUntil: 'תקף עד:',
    ctaButton: 'צפה בתוכניות והשתמש בקופון',
    questions: 'אם יש לך שאלות, אל תהסס לפנות אלינו בכתובת',
    footer: 'מסחר אוטומטי חכם עם בינה מלאכותית',
    subject: 'AINSIDE LICENSE TOKEN'
  },
  ar: {
    title: 'AINSIDE LICENSE TOKEN',
    greeting: 'مرحباً',
    intro: 'نرسل لك قسيمة خصم خاصة لخطط التداول الآلي من',
    couponLabel: 'رمز القسيمة الخاص بك',
    copyText: 'انسخ هذا الرمز واستخدمه عند إجراء عملية الشراء',
    benefitsTitle: 'فوائد القسيمة',
    discount: 'خصم',
    during: 'لمدة',
    months: 'أشهر',
    singleUse: 'استخدام واحد',
    exclusive: 'وحصري لك',
    applicable: 'قابل للتطبيق',
    allPlans: 'على جميع الخطط المتاحة',
    validUntil: 'صالح حتى:',
    ctaButton: 'عرض الخطط واستخدام القسيمة',
    questions: 'إذا كان لديك أي أسئلة، لا تتردد في الاتصال بنا على',
    footer: 'تداول آلي ذكي بالذكاء الاصطناعي',
    subject: 'AINSIDE LICENSE TOKEN'
  },
  ru: {
    title: 'AINSIDE LICENSE TOKEN',
    greeting: 'Здравствуйте',
    intro: 'Мы отправляем вам специальный купон на скидку для планов автоматической торговли от',
    couponLabel: 'Ваш Код Купона',
    copyText: 'Скопируйте этот код и используйте его при совершении покупки',
    benefitsTitle: 'Преимущества купона',
    discount: 'скидка',
    during: 'на',
    months: 'месяцев',
    singleUse: 'Одноразовое использование',
    exclusive: 'и эксклюзивно для вас',
    applicable: 'Применимо',
    allPlans: 'ко всем доступным планам',
    validUntil: 'Действителен до:',
    ctaButton: 'Посмотреть Планы и Использовать Купон',
    questions: 'Если у вас есть вопросы, свяжитесь с нами по адресу',
    footer: 'Интеллектуальная автоматическая торговля с ИИ',
    subject: 'AINSIDE LICENSE TOKEN'
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
      expiresAt,
      language,
    }: CouponEmailData = await req.json()

    console.log('Received request to send coupon email:', {
      recipientEmail,
      recipientName,
      couponCode,
      discountPercent,
      durationMonths,
      language,
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
      expiresAt,
      language,
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

    // Token-card hero image
    // Priority:
    // 1) COUPON_EMAIL_HERO_IMAGE_URL (explicit URL)
    // 2) Supabase Storage signed URL (private bucket/object)
    // 3) No image (template still includes plain code fallback)
    let heroImageUrl: string | null = Deno.env.get('COUPON_EMAIL_HERO_IMAGE_URL') || null

    if (!heroImageUrl) {
      const bucket = Deno.env.get('COUPON_EMAIL_HERO_BUCKET') || ''
      const path = Deno.env.get('COUPON_EMAIL_HERO_PATH') || ''
      const ttlSeconds = Number(Deno.env.get('COUPON_EMAIL_HERO_SIGNED_URL_TTL') || '2592000') // default 30 days

      if (bucket && path) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        const { data: signed, error: signedError } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, ttlSeconds)

        if (signedError) {
          console.error('Error generating signed hero image URL:', signedError)
          heroImageUrl = null
        } else {
          heroImageUrl = signed?.signedUrl || null
        }
      }
    }

    const localeMap = {
      es: 'es-ES',
      en: 'en-US',
      fr: 'fr-FR',
      he: 'he-IL',
      ar: 'ar-SA',
      ru: 'ru-RU'
    }

    const expirationText = data.expiresAt 
      ? `<p style="margin: 24px 0 0; padding: 14px 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; color: #111827;">
          <strong style="font-weight: 600;">${t.validUntil}</strong>
          <span style="color:#374151;">${new Date(data.expiresAt).toLocaleDateString(localeMap[lang], {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
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
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #0b0d10;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #0b0d10;">
    <tr>
      <td style="padding: 40px 16px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 680px; margin: 0 auto; background: #0f1217; border: 1px solid rgba(201,163,91,0.28); border-radius: 14px; box-shadow: 0 18px 50px rgba(0,0,0,0.55); overflow: hidden;">

          <!-- Header (minimal) -->
          <tr>
            <td style="padding: 22px 26px; border-bottom: 1px solid rgba(201,163,91,0.18); text-align: ${isRTL ? 'right' : 'left'};">
              <p style="margin: 0; font-size: 12px; letter-spacing: 0.18em; color: rgba(229,231,235,0.65); text-transform: uppercase;">
                AInside Trading
              </p>
              <h1 style="margin: 10px 0 0; font-size: 18px; font-weight: 700; color: #f9fafb;">
                ${t.title}
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 28px 32px;" dir="${direction}">
              <p style="margin: 0 0 10px; font-size: 14px; line-height: 1.6; color: rgba(249,250,251,0.92);">
                ${t.greeting} <strong style="font-weight: 700;">${data.recipientName}</strong>
              </p>

              <p style="margin: 0 0 16px; font-size: 13px; line-height: 1.75; color: rgba(229,231,235,0.82);">
                ${t.intro} <strong style="font-weight: 600; color: rgba(201,163,91,0.95);">AInside</strong>.
              </p>

              <!-- Token card image with code overlay (fallback code below for strict email clients) -->
              ${heroImageUrl ? `
              <div style="margin: 18px 0 14px;">
                <div style="position: relative; border-radius: 12px; overflow: hidden; border: 1px solid rgba(201,163,91,0.25);">
                  <img src="${heroImageUrl}" alt="AInside token" style="display:block; width:100%; height:auto; border:0; line-height:100%; outline:none; text-decoration:none;" />
                  <div style="position:absolute; left:0; right:0; top:52%; transform: translateY(-50%); text-align:center; padding: 0 16px;">
                    <span style="display:inline-block; padding: 10px 14px; border-radius: 10px; background: rgba(10, 12, 16, 0.72); border: 1px solid rgba(201,163,91,0.35);">
                      <span style="font-size: 22px; font-weight: 800; color: #f9fafb; letter-spacing: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">
                        ${data.couponCode}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              ` : ''}

              <p style="margin: 0 0 10px; font-size: 13px; color: rgba(229,231,235,0.80); line-height: 1.7;">
                <strong style="color: rgba(249,250,251,0.92);">${t.couponLabel}:</strong>
                <span style="color: rgba(201,163,91,0.95); font-weight: 700;">${data.couponCode}</span>
                <br />
                ${t.copyText}
              </p>

              <!-- Benefits (simple list) -->
              <div style="margin: 16px 0; padding: 16px 16px; border: 1px solid rgba(201,163,91,0.18); border-radius: 12px; background: rgba(255,255,255,0.02);">
                <p style="margin: 0 0 10px; font-size: 13px; font-weight: 700; color: rgba(249,250,251,0.92);">
                  ${t.benefitsTitle}
                </p>
                <p style="margin: 0 0 8px; font-size: 13px; color: rgba(229,231,235,0.82); line-height: 1.7;">
                  <span style="color: rgba(201,163,91,0.95);">✓</span>
                  <strong>${data.discountPercent}%</strong> ${t.discount} ${t.during} <strong>${data.durationMonths}</strong> ${t.months}
                </p>
                <p style="margin: 0 0 8px; font-size: 13px; color: rgba(229,231,235,0.82); line-height: 1.7;">
                  <span style="color: rgba(201,163,91,0.95);">✓</span>
                  <strong>${t.singleUse}</strong> ${t.exclusive}
                </p>
                <p style="margin: 0; font-size: 13px; color: rgba(229,231,235,0.82); line-height: 1.7;">
                  <span style="color: rgba(201,163,91,0.95);">✓</span>
                  <strong>${t.applicable}</strong> ${t.allPlans}
                </p>
              </div>

              ${expirationText}

              <!-- CTA -->
              <div style="text-align: center; margin: 28px 0 12px;">
                <a href="https://ainside.me/pricing" style="display: inline-block; background: rgba(201,163,91,0.95); color: #0b0d10; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-weight: 800; font-size: 13px; letter-spacing: 0.03em;">
                  ${t.ctaButton}
                </a>
              </div>

              <p style="margin: 18px 0 0; font-size: 12px; line-height: 1.8; color: rgba(229,231,235,0.70); text-align: ${isRTL ? 'right' : 'left'};">
                ${t.questions} <a href="mailto:support@ainside.me" style="color: rgba(201,163,91,0.95); text-decoration: underline; font-weight: 700;">support@ainside.me</a>
              </p>
            </td>
          </tr>

          <!-- Footer (minimal) -->
          <tr>
            <td style="padding: 16px 26px; border-top: 1px solid rgba(201,163,91,0.18); text-align: ${isRTL ? 'right' : 'left'};">
              <p style="margin: 0; font-size: 12px; color: rgba(229,231,235,0.70); line-height: 1.6;">
                ${t.footer}
              </p>
              <p style="margin: 10px 0 0; font-size: 12px;">
                <a href="https://ainside.me" style="color: rgba(201,163,91,0.95); text-decoration: underline; font-weight: 700;">ainside.me</a>
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
          subject: `${t.subject} ${data.discountPercent}% - AInside`,
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
            subject: `${t.subject} ${data.discountPercent}% - AInside`
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
