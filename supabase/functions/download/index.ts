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
        <html>
        <head>
          <title>Download Not Found - AInside</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8fafc; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #dc2626; }
            p { color: #475569; line-height: 1.6; }
            a { color: #3b82f6; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Download Not Found</h1>
            <p>The download link is invalid or has expired.</p>
            <p>Please contact us at <a href="mailto:inquiries@ainside.me">inquiries@ainside.me</a> with your Order ID to get new download links.</p>
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
        <html>
        <head>
          <title>File Not Available - AInside</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8fafc; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #f59e0b; }
            p { color: #475569; line-height: 1.6; }
            a { color: #3b82f6; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ File Not Available</h1>
            <p>The file you're trying to download is not available at the moment.</p>
            <p>Please contact us at <a href="mailto:inquiries@ainside.me">inquiries@ainside.me</a> for assistance.</p>
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
