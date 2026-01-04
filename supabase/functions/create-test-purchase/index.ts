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
    // Check if this is a test request (add basic security)
    const testKey = req.headers.get('x-test-key')
    if (testKey !== 'test123') {
      return new Response(
        JSON.stringify({ error: 'Invalid test key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Insert test purchase
    const { data, error } = await supabase
      .from('purchases')
      .upsert({
        order_id: 'TEST-001',
        email: 'jonathangolubok@gmail.com',
        plan_name: 'Contrato Micro - S&P 500 (MES) - Suscripcion Mensual',
        plan_type: 'micro-sp500',
        amount: '99.00',
        currency: 'USD',
        status: 'completed'
      }, {
        onConflict: 'order_id'
      })
      .select()

    if (error) {
      console.error('Error inserting test purchase:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test purchase created',
        data 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
