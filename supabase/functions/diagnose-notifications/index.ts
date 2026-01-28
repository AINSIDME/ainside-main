import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://odlxhgatqyodxdessxts.supabase.co'
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY no configurada')
  Deno.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA DE NOTIFICACIONES\n')
console.log('=' .repeat(60))

// 1. Verificar últimos mensajes en la base de datos
console.log('\n📊 1. VERIFICANDO MENSAJES EN BASE DE DATOS...')
const { data: messages, error: messagesError } = await supabase
  .from('contact_messages')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(5)

if (messagesError) {
  console.error('❌ Error al obtener mensajes:', messagesError.message)
} else {
  console.log(`✅ Total de mensajes recientes: ${messages?.length || 0}`)
  if (messages && messages.length > 0) {
    console.log('\nÚltimos mensajes:')
    messages.forEach((msg, i) => {
      console.log(`  ${i + 1}. ${msg.name} - ${msg.subject}`)
      console.log(`     Email: ${msg.email}`)
      console.log(`     Fecha: ${new Date(msg.created_at).toLocaleString('es-ES')}`)
      console.log(`     Estado: ${msg.status}\n`)
    })
  } else {
    console.log('⚠️  No hay mensajes recientes')
  }
}

// 2. Verificar RESEND_API_KEY
console.log('\n🔑 2. VERIFICANDO RESEND_API_KEY...')
const resendKey = Deno.env.get('RESEND_API_KEY')
if (resendKey) {
  console.log(`✅ RESEND_API_KEY configurada: ${resendKey.substring(0, 8)}...`)
} else {
  console.log('❌ RESEND_API_KEY NO configurada')
}

// 3. Probar envío de email de prueba
console.log('\n📧 3. PROBANDO ENVÍO DE EMAIL...')
if (resendKey) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'AInside Notifications <notifications@ainside.me>',
        to: ['jonathangolubok@gmail.com'],
        subject: '🧪 Test de Notificaciones - Sistema Automático',
        html: `
          <h2>Test de Sistema de Notificaciones</h2>
          <p>Este es un email de prueba del sistema de notificaciones de AInside.</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
          <p>Si recibes este email, el sistema está funcionando correctamente.</p>
        `
      })
    })

    if (response.ok) {
      const data = await response.json()
      console.log(`✅ Email de prueba enviado exitosamente`)
      console.log(`   ID: ${data.id}`)
    } else {
      const errorText = await response.text()
      console.error('❌ Error al enviar email de prueba:')
      console.error(`   Status: ${response.status}`)
      console.error(`   Error: ${errorText}`)
    }
  } catch (error) {
    console.error('❌ Excepción al enviar email:', error.message)
  }
} else {
  console.log('⚠️  Saltando test de email (RESEND_API_KEY no configurada)')
}

// 4. Verificar trigger en base de datos
console.log('\n⚙️  4. VERIFICANDO TRIGGER EN BASE DE DATOS...')
const { data: triggers, error: triggerError } = await supabase.rpc('sql', {
  query: `
    SELECT tgname, tgrelid::regclass as table_name, tgenabled 
    FROM pg_trigger 
    WHERE tgname = 'on_contact_message_created'
  `
}).catch(() => ({ data: null, error: { message: 'No se puede verificar triggers directamente' } }))

if (triggers) {
  console.log('✅ Trigger encontrado y activo')
} else {
  console.log('ℹ️  No se pudo verificar el trigger (requiere permisos SQL)')
}

// 5. Insertar mensaje de prueba
console.log('\n🧪 5. INSERTANDO MENSAJE DE PRUEBA...')
const testMessage = {
  name: `Test Automático - ${new Date().toISOString()}`,
  email: 'test@ainside.me',
  subject: 'Prueba de Sistema de Notificaciones',
  message: 'Este es un mensaje de prueba generado automáticamente para verificar el sistema de notificaciones.',
  organization: 'AInside Testing'
}

const { data: insertedMessage, error: insertError } = await supabase
  .from('contact_messages')
  .insert([testMessage])
  .select()
  .single()

if (insertError) {
  console.error('❌ Error al insertar mensaje de prueba:', insertError.message)
} else {
  console.log('✅ Mensaje de prueba insertado exitosamente')
  console.log(`   ID: ${insertedMessage.id}`)
  console.log('\n⏳ Esperando 3 segundos para que el trigger se ejecute...')
  await new Promise(resolve => setTimeout(resolve, 3000))
}

// 6. Resumen final
console.log('\n' + '='.repeat(60))
console.log('\n📋 RESUMEN DEL DIAGNÓSTICO:')
console.log('\n1. Base de datos: ' + (messagesError ? '❌ Error' : '✅ OK'))
console.log('2. RESEND_API_KEY: ' + (resendKey ? '✅ Configurada' : '❌ No configurada'))
console.log('3. Envío de email: ' + (resendKey ? '✅ Probado' : '⚠️  No probado'))
console.log('4. Mensaje de prueba: ' + (insertError ? '❌ Error' : '✅ Insertado'))

console.log('\n💡 RECOMENDACIONES:')
if (!resendKey) {
  console.log('   • Configurar RESEND_API_KEY en Supabase Edge Functions')
}
console.log('   • Verificar email en: jonathangolubok@gmail.com')
console.log('   • Revisar logs en: https://supabase.com/dashboard/project/odlxhgatqyodxdessxts/functions/send-contact-email/logs')
console.log('   • Verificar mensajes en: https://ainside.me/admin/messages')

console.log('\n✅ Diagnóstico completado\n')
