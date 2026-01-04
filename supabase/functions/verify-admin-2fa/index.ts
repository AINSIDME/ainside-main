import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as OTPAuth from "https://esm.sh/otpauth@9.1.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Claves secretas 2FA para cada administrador (en producción, guardar en base de datos)
const ADMIN_2FA_SECRETS: Record<string, string> = {
  'jonathangolubok@gmail.com': 'JBSWY3DPEHPK3PXP', // Cambiar por secreto generado
  'admin@ainside.me': 'JBSWY3DPEHPK3PXQ'  // Cambiar por secreto generado
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, code } = await req.json()

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'Email y código requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar si el email es de un administrador autorizado
    const secret = ADMIN_2FA_SECRETS[email]
    if (!secret) {
      console.log(`Intento de acceso no autorizado: ${email}`)
      return new Response(
        JSON.stringify({ verified: false, error: 'Usuario no autorizado' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Crear objeto TOTP con el secreto del administrador
    const totp = new OTPAuth.TOTP({
      issuer: 'AInside',
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret)
    })

    // Verificar el código TOTP
    // Delta permite códigos dentro de ±1 período (90 segundos en total)
    const delta = totp.validate({
      token: code,
      window: 1
    })

    const verified = delta !== null

    if (verified) {
      console.log(`✓ Verificación 2FA exitosa para: ${email}`)
      
      // Log de acceso exitoso
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Guardar log de acceso
      await supabase
        .from('admin_access_logs')
        .insert({
          admin_email: email,
          action: '2fa_verification_success',
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown'
        })
    } else {
      console.log(`✗ Verificación 2FA fallida para: ${email}`)
      
      // Log de intento fallido
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)

      await supabase
        .from('admin_access_logs')
        .insert({
          admin_email: email,
          action: '2fa_verification_failed',
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown'
        })
    }

    return new Response(
      JSON.stringify({ 
        verified,
        message: verified ? 'Código verificado correctamente' : 'Código inválido'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error en verify-admin-2fa:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
