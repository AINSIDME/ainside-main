import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    const payerEmail = result?.payer?.email_address;
    const payerName = result?.payer?.name?.given_name + ' ' + (result?.payer?.name?.surname || '');
    const amount = capture?.amount?.value;
    const currency = capture?.amount?.currency_code;
    const status = result?.status;
    const planName = result?.purchase_units?.[0]?.description;

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

    // Send email with product files
    const emailSent = await sendProductEmail({
      email: payerEmail,
      name: payerName,
      planName,
      amount,
      currency,
      orderId: result.id
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

async function sendProductEmail(data: {
  email: string;
  name: string;
  planName: string;
  amount: string;
  currency: string;
  orderId: string;
}): Promise<boolean> {
  try {
    const resendKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendKey) {
      console.warn('RESEND_API_KEY not configured');
      return false;
    }

    // Determine plan type from plan name
    const planType = data.planName.toLowerCase().includes('basic') ? 'basic' 
                   : data.planName.toLowerCase().includes('professional') ? 'professional'
                   : 'premium';

    // Plan-specific content
    const planContent = {
      basic: {
        color: '#3b82f6',
        icon: '⭐',
        title: 'Basic Plan',
        description: 'Your essential trading toolkit to get started',
        features: [
          '📊 Basic Trading Indicators',
          '📈 Market Analysis Tools',
          '📖 Getting Started Guide',
          '💡 Strategy Templates'
        ]
      },
      professional: {
        color: '#8b5cf6',
        icon: '🚀',
        title: 'Professional Plan',
        description: 'Advanced tools for serious traders',
        features: [
          '📊 All Basic Features',
          '🤖 Advanced Algorithms',
          '📊 Real-time Data Integration',
          '🎯 Custom Indicators',
          '📚 Professional Training Materials',
          '💬 Priority Support'
        ]
      },
      premium: {
        color: '#f59e0b',
        icon: '👑',
        title: 'Premium Plan',
        description: 'Complete professional trading solution',
        features: [
          '📊 All Professional Features',
          '🤖 AI-Powered Strategies',
          '🔥 Real-time Alerts & Signals',
          '📈 Advanced Portfolio Management',
          '🎓 Exclusive Masterclasses',
          '👨‍💻 1-on-1 Consultation',
          '⚡ VIP Support 24/7'
        ]
      }
    };

    const plan = planContent[planType as keyof typeof planContent];

    const emailHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Purchase Confirmation - AInside</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: #f8fafc; padding: 40px 40px 30px; border-radius: 12px 12px 0 0; text-align: center; border-bottom: 2px solid #e2e8f0;">
              <img src="https://ainside.me/brand/logo-master.png" alt="AInside Logo" style="width: 220px; height: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;" />
              <h1 style="margin: 0; color: #059669; font-size: 24px; font-weight: 600;">✓ Payment Successful</h1>
              <p style="margin: 10px 0 0; color: ${plan.color}; font-size: 18px; font-weight: 600;">${plan.icon} ${plan.title}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                Dear ${data.name},
              </p>

              <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                Thank you for purchasing the <strong style="color: ${plan.color};">${plan.title}</strong>! Your payment has been successfully processed.
              </p>

              <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                ${plan.description}
              </p>

              <!-- What's Included -->
              <div style="background-color: #f8fafc; border: 2px solid ${plan.color}; padding: 25px; margin: 30px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; color: #1e293b; font-size: 18px;">${plan.icon} What's Included in Your Plan</h3>
                ${plan.features.map(feature => `<p style="margin: 8px 0; color: #475569; font-size: 14px; line-height: 1.6;">${feature}</p>`).join('')}
              </div>
Download Your Files</h3>
                <p style="margin: 0 0 20px; color: #047857; font-size: 14px;">Access your ${plan.title} materials below
              <div style="background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 15px; color: #1e293b; font-size: 16px;">Order Details</h3>
                <p style="margin: 0 0 8px; color: #475569; font-size: 14px;"><strong>Plan:</strong> ${data.planName}</p>
                <p style="margin: 0 0 8px; color: #475569; font-size: 14px;"><strong>Amount:</strong> ${data.amount} ${data.currency}</p>
                <p style="margin: 0; color: #475569; font-size: 14px;"><strong>Order ID:</strong> ${data.orderId}</p>
              </div>

              <!-- Download Links -->
              <div style="background-color: #ecfdf5; border: 2px solid #10b981; padding: 25px; margin: 30px 0; border-radius: 8px; text-align: center;">
                <h3 style="margin: 0 0 15px; color: #065f46; font-size: 18px;">📦 Your Product Files</h3>
                <p style="margin: 0 0 20px; color: #047857; font-size: 14px;">Click the buttons below to download your files:</p>
                
                <a href="https://ainside.me/downloads/${planType}/${planType}-plan.pdf" 
                   style="display: inline-block; margin: 10px; padding: 14px 30px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">
                  📄 Download PDF Guide
                </a>
                
                <a href="https://ainside.me/downloads/${planType}/${planType}-files.zip" 
                   style="display: inline-block; margin: 10px; padding: 14px 30px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">
                  📦 Download Files (.ZIP)
                </a>
              </div>

              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
                  <strong>⚠️ Important:</strong> Please download your files within 30 days. Keep these files in a safe place as they are only available through this email.
                </p>
              </div>

              <p style="margin: 0 0 10px; color: #475569; font-size: 16px; line-height: 1.6;">
                Need help? Contact us at <a href="mailto:inquiries@ainside.me" style="color: #3b82f6; text-decoration: none;">inquiries@ainside.me</a>
              </p>

              <p style="margin: 20px 0 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Best regards,<br/>
                <strong style="color: #1e293b;">The AInside Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px 40px; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 14px;">
                <strong style="color: #334155;">AInside.me</strong> - Professional Algorithmic Trading Tools
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
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
        subject: `✓ Purchase Confirmed - ${data.planName} - AInside`,
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