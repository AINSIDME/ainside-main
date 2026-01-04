import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { name, email, orderId, hwid } = await req.json()

    // Validate inputs
    if (!name || !email || !orderId || !hwid) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate HWID format (UUID or MAC address number)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const macNumberRegex = /^\d{10,15}$/
    if (!uuidRegex.test(hwid) && !macNumberRegex.test(hwid)) {
      return new Response(
        JSON.stringify({ error: 'Invalid HWID format. Must be a UUID or MAC address number (from AInside HWID Tool).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if order exists
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .eq('email', email)
      .single()

    if (orderError || !orderData) {
      console.error('Order validation error:', orderError)
      return new Response(
        JSON.stringify({ error: 'Order not found or email mismatch. Please verify your Order ID and email.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if HWID already registered for this order
    const { data: existingHwid, error: hwidCheckError } = await supabase
      .from('hwid_registrations')
      .select('*')
      .eq('order_id', orderId)
      .single()

    if (existingHwid) {
      return new Response(
        JSON.stringify({ 
          error: 'This order already has a registered HWID. Contact support to update it.',
          registeredHwid: existingHwid.hwid,
          registeredAt: existingHwid.created_at
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if HWID is already used by another order
    const { data: hwidInUse, error: hwidUseError } = await supabase
      .from('hwid_registrations')
      .select('order_id')
      .eq('hwid', hwid)
      .single()

    if (hwidInUse) {
      return new Response(
        JSON.stringify({ error: 'This HWID is already registered to another order. Contact support if you need assistance.' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Register HWID
    const { data: registration, error: registrationError } = await supabase
      .from('hwid_registrations')
      .insert([
        {
          order_id: orderId,
          email: email,
          name: name,
          hwid: hwid,
          status: 'active',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (registrationError) {
      console.error('Registration error:', registrationError)
      return new Response(
        JSON.stringify({ error: 'Failed to register HWID. Please try again or contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // TODO: Send confirmation email
    // You can integrate with Resend here to notify the user

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'HWID registered successfully',
        registration: {
          orderId: registration.order_id,
          hwid: registration.hwid,
          status: registration.status,
          registeredAt: registration.created_at
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
