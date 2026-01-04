import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Insert test purchases
    const purchases = [
      { order_id: 'TEST-001', email: 'jonathangolubok@gmail.com', plan_name: 'Contrato Micro - S&P 500 (MES) - Suscripcion Mensual', plan_type: 'micro-sp500', amount: '99.00' },
      { order_id: 'TEST-002', email: 'jonathangolubok@gmail.com', plan_name: 'Contrato Micro - Oro (MGC) - Suscripcion Mensual', plan_type: 'micro-gold', amount: '99.00' },
      { order_id: 'TEST-003', email: 'jonathangolubok@gmail.com', plan_name: 'Contrato Mini - S&P 500 (ES) - Suscripcion Mensual', plan_type: 'mini-sp500', amount: '999.00' },
      { order_id: 'TEST-004', email: 'jonathangolubok@gmail.com', plan_name: 'Contrato Mini - Oro (GC) - Suscripcion Mensual', plan_type: 'mini-gold', amount: '999.00' }
    ]

    const results = []
    for (const purchase of purchases) {
      const { data, error } = await supabase
        .from('purchases')
        .upsert({
          ...purchase,
          currency: 'USD',
          status: 'completed'
        }, { onConflict: 'order_id' })
        .select()

      if (error) {
        results.push({ order_id: purchase.order_id, success: false, error: error.message })
      } else {
        results.push({ order_id: purchase.order_id, success: true })
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
