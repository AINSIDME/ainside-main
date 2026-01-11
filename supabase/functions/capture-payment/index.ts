import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getEmailTranslation } from "./email-translations.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest(req);
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
    const customId = result?.purchase_units?.[0]?.custom_id || '';
    const payerEmail = result?.payer?.email_address;
    const payerName = result?.payer?.name?.given_name + ' ' + (result?.payer?.name?.surname || '');
    const amount = capture?.amount?.value;
    const currency = capture?.amount?.currency_code;
    const status = result?.status;
    const planName = result?.purchase_units?.[0]?.description;
    
    // Extract language and coupon data from custom_id
    // Format: "plan|language" or "plan|language|coupon:CODE|PERCENT|DURATION"
    const customParts = customId.split('|');
    const userLanguage = customParts[1] || 'en';
    const emailLanguage = userLanguage;
    
    let couponCode: string | null = null;
    let couponDiscount: number | null = null;
    let couponDuration: number | null = null;
    
    if (customParts.length >= 5 && customParts[2]?.startsWith('coupon:')) {
      couponCode = customParts[2].replace('coupon:', '');
      couponDiscount = parseInt(customParts[3] || '0');
      couponDuration = parseInt(customParts[4] || '0');
    }

    // Verify payment is COMPLETED and APPROVED
    if (status !== 'COMPLETED' || capture?.status !== 'COMPLETED') {
      console.error('Payment not completed:', { status, captureStatus: capture?.status });
      return new Response(
        JSON.stringify({
          error: 'Payment not completed',
          status,
          captureStatus: capture?.status
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Store purchase in database
    await storePurchase({
      orderId: result.id,
      email: payerEmail,
      planName,
      amount,
      currency,
      couponCode: couponCode,
      couponDiscount: couponDiscount,
      couponDuration: couponDuration
    });

    // If coupon was used, mark it as used
    if (couponCode) {
      await markCouponAsUsed(couponCode);
    }

    // Send email with product files
    const emailSent = await sendProductEmail({
      email: payerEmail,
      name: payerName,
      planName,
      amount,
      currency,
      orderId: result.id,
      language: emailLanguage
    });

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
        plan: planName,
        emailSent,
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

async function storePurchase(data: {
  orderId: string;
  email: string;
  planName: string;
  amount: string;
  currency: string;
  couponCode: string | null;
  couponDiscount: number | null;
  couponDuration: number | null;
}): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not configured');
      return;
    }

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Determine plan type from name
    const isMicro = data.planName.toLowerCase().includes('micro');
    const isES = data.planName.toLowerCase().includes('mes') || data.planName.toLowerCase().includes('es') || data.planName.toLowerCase().includes('s&p') || data.planName.toLowerCase().includes('sp500');
    const isGold = data.planName.toLowerCase().includes('mgc') || data.planName.toLowerCase().includes('gc') || data.planName.toLowerCase().includes('gold') || data.planName.toLowerCase().includes('oro');
    
    let planType: string;
    if (isMicro && isES) planType = 'micro-sp500';
    else if (isMicro && isGold) planType = 'micro-gold';
    else if (!isMicro && isES) planType = 'mini-sp500';
    else if (!isMicro && isGold) planType = 'mini-gold';
    else planType = 'micro-sp500';
    
    const purchaseData: any = {
      order_id: data.orderId,
      email: data.email,
      plan_name: data.planName,
      plan_type: planType,
      amount: data.amount,
      currency: data.currency,
      status: 'completed'
    };

    // Add coupon data if present
    if (data.couponCode) {
      purchaseData.coupon_code = data.couponCode;
      purchaseData.coupon_discount_percent = data.couponDiscount;
      purchaseData.coupon_duration_months = data.couponDuration;
      purchaseData.coupon_applied_at = new Date().toISOString();
    }
    
    const { error } = await supabase.from('purchases').insert(purchaseData);

    if (error) {
      console.error('Error storing purchase:', error);
    } else {
      console.log('Purchase stored successfully:', data.orderId);
    }
  } catch (error) {
    console.error('Error in storePurchase:', error);
  }
}

function getPlanFeatures(planType: string, lang: string) {
  const features: Record<string, Record<string, string[]>> = {
    'micro-sp500': {
      en: ['📈 Micro E-mini S&P 500 (MES) contract', '🎯 Exclusive focus on S&P 500', '📊 Algorithms optimized for indices', '💻 Compatible with EasyLanguage platforms', '💬 24/6 international support', '🔄 Monthly updates included', '🔒 Secure PayPal checkout'],
      es: ['📈 Contrato Micro E-mini S&P 500 (MES)', '🎯 Enfoque exclusivo en S&P 500', '📊 Algoritmos optimizados para índices', '💻 Compatible con plataformas EasyLanguage', '💬 Soporte internacional 24/6', '🔄 Actualizaciones mensuales incluidas', '🔒 Checkout seguro con PayPal'],
      fr: ['📈 Contrat Micro E-mini S&P 500 (MES)', '🎯 Focus exclusif sur S&P 500', '📊 Algorithmes optimisés pour les indices', '💻 Compatible avec les plateformes EasyLanguage', '💬 Support international 24/6', '🔄 Mises à jour mensuelles incluses', '🔒 Paiement sécurisé via PayPal'],
      ru: ['📈 Контракт Micro E-mini S&P 500 (MES)', '🎯 Эксклюзивный фокус на S&P 500', '📊 Алгоритмы оптимизированы для индексов', '💻 Совместимость с платформами EasyLanguage', '💬 Международная поддержка 24/6', '🔄 Ежемесячные обновления включены', '🔒 Безопасная оплата через PayPal'],
      ar: ['📈 عقد Micro E-mini S&P 500 (MES)', '🎯 تركيز حصري على S&P 500', '📊 خوارزميات محسّنة للمؤشرات', '💻 متوافق مع منصات EasyLanguage', '💬 دعم دولي 24/6', '🔄 تحديثات شهرية مضمنة', '🔒 دفع آمن عبر PayPal'],
      he: ['📈 חוזה Micro E-mini S&P 500 (MES)', '🎯 התמקדות בלעדית ב-S&P 500', '📊 אלגוריתמים מותאמים למדדים', '💻 תואם לפלטפורמות EasyLanguage', '💬 תמיכה בינלאומית 24/6', '🔄 עדכונים חודשיים כלולים', '🔒 תשלום מאובטח דרך PayPal']
    },
    'micro-gold': {
      en: ['🥇 Micro Gold (MGC) contract', '🎯 Exclusive focus on Gold', '📊 Algorithms optimized for commodities', '💻 Compatible with EasyLanguage platforms', '💬 24/6 international support', '🔄 Monthly updates included', '🔒 Secure PayPal checkout'],
      es: ['🥇 Contrato Micro Gold (MGC)', '🎯 Enfoque exclusivo en Oro', '📊 Algoritmos optimizados para commodities', '💻 Compatible con plataformas EasyLanguage', '💬 Soporte internacional 24/6', '🔄 Actualizaciones mensuales incluidas', '🔒 Checkout seguro con PayPal'],
      fr: ['🥇 Contrat Micro Gold (MGC)', '🎯 Focus exclusif sur l\'Or', '📊 Algorithmes optimisés pour les matières premières', '💻 Compatible avec les plateformes EasyLanguage', '💬 Support international 24/6', '🔄 Mises à jour mensuelles incluses', '🔒 Paiement sécurisé via PayPal'],
      ru: ['🥇 Контракт Micro Gold (MGC)', '🎯 Эксклюзивный фокус на золоте', '📊 Алгоритмы оптимизированы для сырьевых товаров', '💻 Совместимость с платформами EasyLanguage', '💬 Международная поддержка 24/6', '🔄 Ежемесячные обновления включены', '🔒 Безопасная оплата через PayPal'],
      ar: ['🥇 عقد Micro Gold (MGC)', '🎯 تركيز حصري على الذهب', '📊 خوارزميات محسّنة للسلع', '💻 متوافق مع منصات EasyLanguage', '💬 دعم دولي 24/6', '🔄 تحديثات شهرية مضمنة', '🔒 دفع آمن عبر PayPal'],
      he: ['🥇 חוזה Micro Gold (MGC)', '🎯 התמקדות בלעדית בזהב', '📊 אלגוריתמים מותאמים לסחורות', '💻 תואם לפלטפורמות EasyLanguage', '💬 תמיכה בינלאומית 24/6', '🔄 עדכונים חודשיים כלולים', '🔒 תשלום מאובטח דרך PayPal']
    },
    'mini-sp500': {
      en: ['📈 E-mini S&P 500 (ES) contract', '🎯 Exclusive focus on S&P 500', '📊 Advanced algorithms for indices', '💻 Compatible with EasyLanguage platforms', '💬 24/6 international support', '🔄 Monthly updates included', '🔒 Secure PayPal checkout', '⚡ Priority execution'],
      es: ['📈 Contrato E-mini S&P 500 (ES)', '🎯 Enfoque exclusivo en S&P 500', '📊 Algoritmos avanzados para índices', '💻 Compatible con plataformas EasyLanguage', '💬 Soporte internacional 24/6', '🔄 Actualizaciones mensuales incluidas', '🔒 Checkout seguro con PayPal', '⚡ Ejecución prioritaria'],
      fr: ['📈 Contrat E-mini S&P 500 (ES)', '🎯 Focus exclusif sur S&P 500', '📊 Algorithmes avancés pour les indices', '💻 Compatible avec les plateformes EasyLanguage', '💬 Support international 24/6', '🔄 Mises à jour mensuelles incluses', '🔒 Paiement sécurisé via PayPal', '⚡ Exécution prioritaire'],
      ru: ['📈 Контракт E-mini S&P 500 (ES)', '🎯 Эксклюзивный фокус на S&P 500', '📊 Продвинутые алгоритмы для индексов', '💻 Совместимость с платформами EasyLanguage', '💬 Международная поддержка 24/6', '🔄 Ежемесячные обновления включены', '🔒 Безопасная оплата через PayPal', '⚡ Приоритетное исполнение'],
      ar: ['📈 عقد E-mini S&P 500 (ES)', '🎯 تركيز حصري على S&P 500', '📊 خوارزميات متقدمة للمؤشرات', '💻 متوافق مع منصات EasyLanguage', '💬 دعم دولي 24/6', '🔄 تحديثات شهرية مضمنة', '🔒 دفع آمن عبر PayPal', '⚡ تنفيذ ذو أولوية'],
      he: ['📈 חוזה E-mini S&P 500 (ES)', '🎯 התמקדות בלעדית ב-S&P 500', '📊 אלגוריתמים מתקדמים למדדים', '💻 תואם לפלטפורמות EasyLanguage', '💬 תמיכה בינלאומית 24/6', '🔄 עדכונים חודשיים כלולים', '🔒 תשלום מאובטח דרך PayPal', '⚡ ביצוע בעדיפות']
    },
    'mini-gold': {
      en: ['🥇 Gold (GC) contract', '🎯 Exclusive focus on Gold', '📊 Advanced algorithms for commodities', '💻 Compatible with EasyLanguage platforms', '💬 24/6 international support', '🔄 Monthly updates included', '🔒 Secure PayPal checkout', '⚡ Priority execution'],
      es: ['🥇 Contrato Gold (GC)', '🎯 Enfoque exclusivo en Oro', '📊 Algoritmos avanzados para commodities', '💻 Compatible con plataformas EasyLanguage', '💬 Soporte internacional 24/6', '🔄 Actualizaciones mensuales incluidas', '🔒 Checkout seguro con PayPal', '⚡ Ejecución prioritaria'],
      fr: ['🥇 Contrat Gold (GC)', '🎯 Focus exclusif sur l\'Or', '📊 Algorithmes avancés pour les matières premières', '💻 Compatible avec les plateformes EasyLanguage', '💬 Support international 24/6', '🔄 Mises à jour mensuelles incluses', '🔒 Paiement sécurisé via PayPal', '⚡ Exécution prioritaire'],
      ru: ['🥇 Контракт Gold (GC)', '🎯 Эксклюзивный фокус на золоте', '📊 Продвинутые алгоритмы для сырьевых товаров', '💻 Совместимость с платформами EasyLanguage', '💬 Международная поддержка 24/6', '🔄 Ежемесячные обновления включены', '🔒 Безопасная оплата через PayPal', '⚡ Приоритетное исполнение'],
      ar: ['🥇 عقد Gold (GC)', '🎯 تركيز حصري على الذهب', '📊 خوارزميات متقدمة للسلع', '💻 متوافق مع منصات EasyLanguage', '💬 دعم دولي 24/6', '🔄 تحديثات شهرية مضمنة', '🔒 دفع آمن عبر PayPal', '⚡ تنفيذ ذو أولوية'],
      he: ['🥇 חוזה Gold (GC)', '🎯 התמקדות בלעדית בזהב', '📊 אלגוריתמים מתקדמים לסחורות', '💻 תואם לפלטפורמות EasyLanguage', '💬 תמיכה בינלאומית 24/6', '🔄 עדכונים חודשיים כלולים', '🔒 תשלום מאובטח דרך PayPal', '⚡ ביצוע בעדיפות']
    }
  };

  const langCode = lang.toLowerCase().split('-')[0];
  return features[planType]?.[langCode] || features[planType]?.['en'] || [];
}

async function sendProductEmail(data: {
  email: string;
  name: string;
  planName: string;
  amount: string;
  currency: string;
  orderId: string;
  language?: string;
}): Promise<boolean> {
  try {
    const resendKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendKey) {
      console.warn('RESEND_API_KEY not configured');
      return false;
    }

    // Get translations for user's language
    const t = getEmailTranslation(data.language || 'en');

    // Determine plan type and instrument from plan name
    const isMicro = data.planName.toLowerCase().includes('micro');
    const isMini = data.planName.toLowerCase().includes('mini');
    const isES = data.planName.toLowerCase().includes('mes') || data.planName.toLowerCase().includes('es') || data.planName.toLowerCase().includes('s&p') || data.planName.toLowerCase().includes('sp500');
    const isGold = data.planName.toLowerCase().includes('mgc') || data.planName.toLowerCase().includes('gc') || data.planName.toLowerCase().includes('gold') || data.planName.toLowerCase().includes('oro');
    const isMonthly = data.planName.toLowerCase().includes('mensual') || data.planName.toLowerCase().includes('monthly') || data.planName.toLowerCase().includes('mes');
    const isAnnual = data.planName.toLowerCase().includes('anual') || data.planName.toLowerCase().includes('annual') || data.planName.toLowerCase().includes('año');
    
    // Calculate expiration time based on plan type (Mini plans get more time)
    const downloadHours = (isMini) ? 48 : 24; // Mini: 48 hours, Micro: 24 hours
    const expirationDate = new Date(Date.now() + downloadHours * 60 * 60 * 1000);
    
    // Billing cycle info
    const billingInfo = {
      cycle: isAnnual ? t.annual : t.monthly,
      renewalDate: new Date(Date.now() + (isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000).toLocaleDateString(data.language || 'en', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      benefit: isAnnual ? t.savings : t.autoRenewal,
      expirationDateTime: expirationDate.toLocaleString(data.language || 'en', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      downloadHours: downloadHours
    };

    // Determine plan key
    let planType: string;
    if (isMicro && isES) planType = 'micro-sp500';
    else if (isMicro && isGold) planType = 'micro-gold';
    else if (isMini && isES) planType = 'mini-sp500';
    else if (isMini && isGold) planType = 'mini-gold';
    else planType = 'micro-sp500'; // default

    // Plan-specific content
    const planContent = {
      'micro-sp500': {
        color: '#3b82f6',
        icon: '📊',
        title: 'Contrato Micro - S&P 500',
        instrument: 'S&P 500 (MES)',
        description: 'Operación con contratos micro del S&P 500 - Perfecto para comenzar',
        features: [
          '📈 Contrato Micro E-mini S&P 500 (MES)',
          '🎯 Enfoque exclusivo en S&P 500',
          '📊 Algoritmos optimizados para índices',
          '� Compatible con plataformas EasyLanguage',
          '�💬 Soporte internacional 24/6',
          '🔄 Actualizaciones mensuales incluidas',
          '🔒 Checkout seguro con PayPal'
        ]
      },
      'micro-gold': {
        color: '#f59e0b',
        icon: '🥇',
        title: 'Contrato Micro - Oro',
        instrument: 'Oro (MGC)',
        description: 'Operación con contratos micro de Oro - Perfecto para comenzar',
        features: [
          '🥇 Contrato Micro Gold (MGC)',
          '🎯 Enfoque exclusivo en Oro',
          '📊 Algoritmos optimizados para commodities',
          '� Compatible con plataformas EasyLanguage',
          '�💬 Soporte internacional 24/6',
          '🔄 Actualizaciones mensuales incluidas',
          '🔒 Checkout seguro con PayPal'
        ]
      },
      'mini-sp500': {
        color: '#8b5cf6',
        icon: '🚀',
        title: 'Contrato Mini - S&P 500',
        instrument: 'S&P 500 (ES)',
        description: 'Operación con contratos mini del S&P 500 - Para traders con experiencia',
        features: [
          '📈 Contrato E-mini S&P 500 (ES)',
          '🎯 Enfoque exclusivo en S&P 500',
          '📊 Algoritmos avanzados para índices',
          '� Compatible con plataformas EasyLanguage',
          '�💼 Mayor potencial de ganancias',
          '💬 Soporte internacional 24/6',
          '🔄 Actualizaciones mensuales incluidas',
          '🔒 Checkout seguro con PayPal',
          '⚡ Ejecución prioritaria'
        ]
      },
      'mini-gold': {
        color: '#d97706',
        icon: '👑',
        title: 'Contrato Mini - Oro',
        instrument: 'Oro (GC)',
        description: 'Operación con contratos mini de Oro - Para traders con experiencia',
        features: [
          '🥇 Contrato Gold (GC)',
          '🎯 Enfoque exclusivo en Oro',
          '📊 Algoritmos avanzados para commodities',
          '� Compatible con plataformas EasyLanguage',
          '�💼 Mayor potencial de ganancias',
          '💬 Soporte internacional 24/6',
          '🔄 Actualizaciones mensuales incluidas',
          '🔒 Checkout seguro con PayPal',
          '⚡ Ejecución prioritaria'
        ]
      }
    };

    const plan = planContent[planType as keyof typeof planContent];
    const planFeatures = getPlanFeatures(planType, data.language || 'en');

    const emailHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Purchase Confirmation - AInside</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, hsl(215, 60%, 16%) 0%, hsl(215, 50%, 25%) 100%);">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, hsl(215, 60%, 16%) 0%, hsl(215, 50%, 25%) 100%); padding: 50px 0;">
    <tr>
      <td style="padding: 0 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 0; box-shadow: 0 25px 70px rgba(0, 0, 0, 0.25);">
          
          <!-- Header with Corporate Navy -->
          <tr>
            <td style="background: linear-gradient(180deg, hsl(215, 15%, 96%) 0%, hsl(0, 0%, 100%) 100%); padding: 60px 50px 50px; text-align: center; border-bottom: 3px solid hsl(215, 60%, 16%);">
              <img src="https://ainside.me/brand/logo-master.png" alt="AInside Logo" style="width: 240px; height: auto; margin-bottom: 35px; display: block; margin-left: auto; margin-right: auto;" />
              <h1 style="margin: 0; color: hsl(215, 60%, 16%); font-size: 28px; font-weight: 700; letter-spacing: -0.8px;">${t.paymentSuccessful}</h1>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid hsl(215, 15%, 90%);">
                <p style="margin: 0; color: hsl(215, 15%, 45%); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">
                  ${plan.title}
                </p>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 50px 50px 40px;">
              <p style="margin: 0 0 15px; color: hsl(215, 15%, 45%); font-size: 15px; line-height: 1.6;">
                ${t.dear} <strong style="color: hsl(215, 25%, 15%);">${data.name}</strong>,
              </p>

              <p style="margin: 0 0 35px; color: hsl(215, 25%, 15%); font-size: 15px; line-height: 1.8;">
                ${t.thankYou} <strong style="color: hsl(215, 60%, 16%);">${plan.title}</strong>. ${t.paymentProcessed}
              </p>

              <!-- What's Included - Corporate Style -->
              <div style="background: linear-gradient(180deg, hsl(0, 0%, 100%) 0%, hsl(215, 10%, 98%) 100%); border: 1px solid hsl(215, 15%, 90%); padding: 30px; margin: 35px 0; border-radius: 0;">
                <h3 style="margin: 0 0 22px; color: hsl(215, 60%, 16%); font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 2px solid hsl(215, 15%, 90%); padding-bottom: 12px;">${t.whatsIncluded}</h3>
                ${planFeatures.map(feature => `<p style="margin: 12px 0; color: hsl(215, 15%, 45%); font-size: 14px; line-height: 1.8; padding-left: 5px;">${feature}</p>`).join('')}
              </div>

              <!-- Order Details - Corporate Box -->
              <div style="background-color: hsl(215, 15%, 96%); border-left: 4px solid hsl(215, 60%, 16%); padding: 25px 30px; margin: 35px 0; border-radius: 0;">
                <h3 style="margin: 0 0 18px; color: hsl(215, 60%, 16%); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">${t.orderDetails}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: hsl(215, 15%, 45%); font-size: 14px; font-weight: 600;">${t.plan}:</td>
                    <td style="padding: 8px 0; color: hsl(215, 25%, 15%); font-size: 14px; text-align: right;">${data.planName}</td>
                  </tr>
                  <tr style="border-top: 1px solid hsl(215, 15%, 90%);">
                    <td style="padding: 8px 0; color: hsl(215, 15%, 45%); font-size: 14px; font-weight: 600;">${t.amount}:</td>
                    <td style="padding: 8px 0; color: hsl(215, 60%, 16%); font-size: 16px; font-weight: 700; text-align: right;">${data.amount} ${data.currency}</td>
                  </tr>
                  <tr style="border-top: 1px solid hsl(215, 15%, 90%);">
                    <td style="padding: 8px 0; color: hsl(215, 15%, 45%); font-size: 14px; font-weight: 600;">${t.orderId}:</td>
                    <td style="padding: 8px 0; color: hsl(215, 15%, 45%); font-size: 13px; font-family: monospace; text-align: right;">${data.orderId}</td>
                  </tr>
                </table>
              </div>

              <!-- Download Links - Navy Background with Neon Buttons -->
              <div style="background: linear-gradient(135deg, hsl(215, 60%, 16%) 0%, hsl(215, 50%, 25%) 100%); padding: 45px 35px; margin: 40px 0; border-radius: 0; text-align: center; border-top: 3px solid hsl(215, 60%, 16%); border-bottom: 3px solid hsl(215, 60%, 16%);">
                <h3 style="margin: 0 0 10px; color: #ffffff; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">📦 ${t.yourProductFiles}</h3>
                <p style="margin: 0 0 30px; color: hsl(215, 10%, 75%); font-size: 13px; letter-spacing: 0.5px;">${t.clickToDownload}</p>
                
                <a href="https://ainside.me/download?order=${data.orderId}&plan=${planType}&file=plan" 
                   style="display: inline-block; width: 240px; margin: 10px 8px; padding: 18px 30px; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; box-shadow: 0 10px 35px rgba(59, 130, 246, 0.5); border: 2px solid rgba(255, 255, 255, 0.1);">
                  📄 ${t.downloadGuide}
                </a>
                
                <a href="https://ainside.me/download?order=${data.orderId}&plan=${planType}&file=files" 
                   style="display: inline-block; width: 240px; margin: 10px 8px; padding: 18px 30px; background: linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #6366f1 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; box-shadow: 0 10px 35px rgba(16, 185, 129, 0.5); border: 2px solid rgba(255, 255, 255, 0.1);">
                  📦 ${t.downloadFiles}
                </a>
              </div>

              <!-- Warning Box - Corporate Blue -->
              <div style="background-color: hsl(213, 97%, 97%); border-left: 4px solid hsl(213, 94%, 68%); padding: 22px 25px; margin: 30px 0; border-radius: 0;">
                <p style="margin: 0; color: hsl(215, 60%, 16%); font-size: 13px; line-height: 1.8;">
                  <strong style="font-weight: 700; color: hsl(213, 94%, 68%);">⚠️ ${t.important}:</strong> ${t.linksExpireIn || 'Los enlaces de descarga expiran en'} <strong style="color: hsl(215, 60%, 16%);">${billingInfo.downloadHours} ${t.hoursText || 'horas'}</strong> ${t.forSecurity || 'por seguridad'}. ${t.ifExpired || 'Si expiran, contáctanos en'} <a href="mailto:inquiries@ainside.me" style="color: hsl(213, 94%, 68%); text-decoration: none; font-weight: 600;">inquiries@ainside.me</a> ${t.withOrderId}
                </p>
                <p style="margin: 15px 0 0; padding-top: 15px; border-top: 1px solid hsl(213, 97%, 90%); color: hsl(215, 60%, 16%); font-size: 13px;">
                  <strong style="font-weight: 700;">⏰ ${t.expiresOn || 'Expira el'}:</strong> ${billingInfo.expirationDateTime}
                </p>
              </div>

              <!-- Subscription Info -->
              <div style="background-color: hsl(215, 15%, 96%); border: 1px solid hsl(215, 15%, 90%); padding: 20px 25px; margin: 30px 0; border-radius: 0;">
                <p style="margin: 0; color: hsl(215, 25%, 15%); font-size: 13px; line-height: 1.7;">
                  <strong style="font-weight: 700; color: hsl(215, 60%, 16%);">🔄 ${t.manageSubscription}:</strong> ${t.manageInfo} ${billingInfo.cycle.toLowerCase()}, ${t.loginPaypal} <a href="mailto:inquiries@ainside.me" style="color: hsl(215, 60%, 16%); text-decoration: none; font-weight: 600;">inquiries@ainside.me</a>
                </p>
              </div>

              <!-- Support -->
              <div style="margin: 40px 0 30px; padding: 25px 0; border-top: 2px solid hsl(215, 15%, 90%); border-bottom: 2px solid hsl(215, 15%, 90%); text-align: center;">
                <p style="margin: 0; color: hsl(215, 15%, 45%); font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">
                  ${t.needHelp}
                </p>
                <p style="margin: 10px 0 0;">
                  <a href="mailto:inquiries@ainside.me" style="color: hsl(215, 60%, 16%); text-decoration: none; font-size: 15px; font-weight: 700;">inquiries@ainside.me</a>
                </p>
              </div>

              <p style="margin: 0; color: hsl(215, 15%, 45%); font-size: 14px; line-height: 1.6; text-align: center;">
                ${t.bestRegards},<br/>
                <strong style="color: hsl(215, 60%, 16%); font-size: 15px;">${t.theTeam}</strong>
              </p>
            </td>
          </tr>

          <!-- Footer - Corporate -->
          <tr>
            <td style="background: linear-gradient(180deg, hsl(215, 10%, 98%) 0%, hsl(215, 15%, 96%) 100%); padding: 35px 50px; border-top: 3px solid hsl(215, 60%, 16%); text-align: center;">
              <p style="margin: 0 0 8px; color: hsl(215, 60%, 16%); font-size: 15px; font-weight: 700; letter-spacing: 0.5px;">
                AInside.me
              </p>
              <p style="margin: 0 0 15px; color: hsl(215, 15%, 45%); font-size: 12px;">
                ${t.footer}
              </p>
              <p style="margin: 0; color: hsl(215, 15%, 45%); font-size: 11px; letter-spacing: 0.3px;">
                © ${new Date().getFullYear()} AInside. All rights reserved.
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

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'AInside <onboarding@resend.dev>',
        to: [data.email],
        subject: `${t.subject} - ${data.planName} - AInside`,
        html: emailHTML
      })
    });

    if (!response.ok) {
      console.error('Resend error:', await response.text());
      return false;
    }

    console.log('Product email sent successfully to:', data.email);
    return true;

  } catch (error) {
    console.error('Error sending product email:', error);
    return false;
  }
}

// Mark coupon as used
async function markCouponAsUsed(couponCode: string): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not configured');
      return;
    }

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase.rpc('mark_coupon_as_used', {
      coupon_code_input: couponCode
    });

    if (error) {
      console.error('Error marking coupon as used:', error);
    } else if (data) {
      console.log('Coupon marked as used successfully:', couponCode);
    } else {
      console.warn('Coupon could not be marked as used (might already be used):', couponCode);
    }
  } catch (error) {
    console.error('Error in markCouponAsUsed:', error);
  }
}
