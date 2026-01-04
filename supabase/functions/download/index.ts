import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const url = new URL(req.url)
    const orderId = url.searchParams.get('order')
    const planType = url.searchParams.get('plan')
    const fileType = url.searchParams.get('file')

    if (!orderId || !planType || !fileType) {
      return new Response('Missing parameters', { status: 400 })
    }

    // Validate inputs
    const validPlans = ['micro-sp500', 'micro-gold', 'mini-sp500', 'mini-gold']
    const validFiles = ['plan', 'files']
    
    if (!validPlans.includes(planType) || !validFiles.includes(fileType)) {
      return new Response('Invalid parameters', { status: 400 })
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify purchase exists
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('*')
      .eq('order_id', orderId)
      .eq('plan_type', planType)
      .single()

    if (purchaseError || !purchase) {
      return new Response(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Download Not Found - AInside</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
              background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            .container { 
              max-width: 600px; 
              width: 100%;
              background: #ffffff; 
              padding: 60px 50px; 
              border-radius: 16px; 
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
              text-align: center;
            }
            .logo {
              width: 200px;
              height: auto;
              margin-bottom: 30px;
            }
            h1 { 
              color: #1e293b;
              font-size: 28px;
              font-weight: 600;
              margin-bottom: 20px;
              letter-spacing: -0.5px;
            }
            .status-icon {
              font-size: 64px;
              margin-bottom: 20px;
              opacity: 0.3;
            }
            p { 
              color: #64748b;
              line-height: 1.8;
              font-size: 16px;
              margin-bottom: 15px;
            }
            .contact-box {
              background: #f8fafc;
              border-left: 4px solid #334155;
              padding: 20px;
              margin: 30px 0;
              border-radius: 6px;
              text-align: left;
            }
            .contact-box strong {
              color: #1e293b;
              display: block;
              margin-bottom: 10px;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            a { 
              color: #3b82f6;
              text-decoration: none;
              font-weight: 500;
              transition: color 0.2s;
            }
            a:hover {
              color: #2563eb;
            }
            .btn {
              display: inline-block;
              margin-top: 20px;
              padding: 14px 32px;
              background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 500;
              transition: transform 0.2s, box-shadow 0.2s;
            }
            .btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(51, 65, 85, 0.4);
              color: #ffffff;
            }
            .footer {
              margin-top: 40px;
              padding-top: 30px;
              border-top: 1px solid #e2e8f0;
              color: #94a3b8;
              font-size: 13px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="https://ainside.me/brand/logo-master.png" alt="AInside Logo" class="logo" />
            <div class="status-icon">🔒</div>
            <h1>Download Not Found</h1>
            <p>The download link you're trying to access is invalid or has expired for security reasons.</p>
            <div class="contact-box">
              <strong>Need Help?</strong>
              <p style="margin: 0; color: #475569;">If you recently made a purchase, please contact our support team with your Order ID and we'll provide you with new download links.</p>
            </div>
            <a href="mailto:inquiries@ainside.me" class="btn">Contact Support</a>
            <div class="footer">
              <strong style="color: #64748b; font-size: 14px;">AInside.me</strong><br>
              Professional Algorithmic Trading Tools
            </div>
          </div>
        </body>
        </html>
      `, {
        status: 404,
        headers: { 'Content-Type': 'text/html' }
      })
    }

    // Generate signed URL
    const extension = fileType === 'plan' ? 'pdf' : 'zip'
    const filePath = `${planType}/${planType}-${fileType}.${extension}`

    const { data: urlData, error: urlError } = await supabase.storage
      .from('products')
      .createSignedUrl(filePath, 3600) // 1 hour

    if (urlError || !urlData) {
      return new Response(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>File Not Available - AInside</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
              background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            .container { 
              max-width: 600px; 
              width: 100%;
              background: #ffffff; 
              padding: 60px 50px; 
              border-radius: 16px; 
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
              text-align: center;
            }
            .logo {
              width: 200px;
              height: auto;
              margin-bottom: 30px;
            }
            h1 { 
              color: #1e293b;
              font-size: 28px;
              font-weight: 600;
              margin-bottom: 20px;
              letter-spacing: -0.5px;
            }
            .status-icon {
              font-size: 64px;
              margin-bottom: 20px;
              opacity: 0.3;
            }
            p { 
              color: #64748b;
              line-height: 1.8;
              font-size: 16px;
              margin-bottom: 15px;
            }
            .contact-box {
              background: #f8fafc;
              border-left: 4px solid #334155;
              padding: 20px;
              margin: 30px 0;
              border-radius: 6px;
              text-align: left;
            }
            .contact-box strong {
              color: #1e293b;
              display: block;
              margin-bottom: 10px;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            a { 
              color: #3b82f6;
              text-decoration: none;
              font-weight: 500;
              transition: color 0.2s;
            }
            a:hover {
              color: #2563eb;
            }
            .btn {
              display: inline-block;
              margin-top: 20px;
              padding: 14px 32px;
              background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 500;
              transition: transform 0.2s, box-shadow 0.2s;
            }
            .btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(51, 65, 85, 0.4);
              color: #ffffff;
            }
            .footer {
              margin-top: 40px;
              padding-top: 30px;
              border-top: 1px solid #e2e8f0;
              color: #94a3b8;
              font-size: 13px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="https://ainside.me/brand/logo-master.png" alt="AInside Logo" class="logo" />
            <div class="status-icon">⚙️</div>
            <h1>File Not Available</h1>
            <p>The file you're trying to download is temporarily unavailable.</p>
            <p>This might be due to a system maintenance or configuration issue.</p>
            <div class="contact-box">
              <strong>Technical Support</strong>
              <p style="margin: 0; color: #475569;">Our team has been notified. Please contact support with your Order ID for immediate assistance.</p>
            </div>
            <a href="mailto:inquiries@ainside.me" class="btn">Contact Support</a>
            <div class="footer">
              <strong style="color: #64748b; font-size: 14px;">AInside.me</strong><br>
              Professional Algorithmic Trading Tools
            </div>
          </div>
        </body>
        </html>
      `, {
        status: 404,
        headers: { 'Content-Type': 'text/html' }
      })
    }

    // Update last download time
    await supabase
      .from('purchases')
      .update({ last_download_at: new Date().toISOString() })
      .eq('order_id', orderId)

    // Redirect to signed URL
    return Response.redirect(urlData.signedUrl, 302)

  } catch (error) {
    console.error('Download error:', error)
    return new Response('Internal server error', { status: 500 })
  }
})
