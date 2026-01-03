import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, planType, fileType } = await req.json()

    if (!orderId || !planType || !fileType) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate fileType
    if (!['plan', 'files'].includes(fileType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate planType
    const validPlans = ['micro-sp500', 'micro-gold', 'mini-sp500', 'mini-gold']
    if (!validPlans.includes(planType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify order exists in database (you would need to create this table)
    // For now, we'll generate the link if the orderId starts with the right prefix
    const isTestOrder = orderId.startsWith('TEST-')
    const isPayPalOrder = orderId.match(/^[A-Z0-9]{17}$/) // PayPal order ID format

    if (!isTestOrder && !isPayPalOrder) {
      return new Response(
        JSON.stringify({ error: 'Invalid order ID' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate file path
    const extension = fileType === 'plan' ? 'pdf' : 'zip'
    const filePath = `${planType}/${planType}-${fileType}.${extension}`

    // Generate signed URL (expires in 1 hour)
    const { data, error } = await supabase.storage
      .from('products')
      .createSignedUrl(filePath, 3600)

    if (error) {
      console.error('Error generating signed URL:', error)
      return new Response(
        JSON.stringify({ error: 'File not found or error generating download link' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        url: data.signedUrl,
        expiresIn: 3600,
        fileName: `${planType}-${fileType}.${extension}`
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
