import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuración de rate limiting
const RATE_LIMIT = {
  MAX_MESSAGES_PER_HOUR: 10,
  COOLDOWN_SECONDS: 3,
  BLOCK_DURATION_HOURS: 24,
  MAX_TOKENS: 500,
};

// Contexto completo de AInside para la AI
const AINSIDE_CONTEXT = `
Eres un asistente experto del Departamento de Atención al Cliente de AInside, empresa profesional especializada en desarrollo de algoritmos de trading automatizado y alquiler de herramientas analíticas institucionales.

═══════════════════════════════════════════════════════════════════════════
🏢 INFORMACIÓN CORPORATIVA
═══════════════════════════════════════════════════════════════════════════

SOBRE AINSIDE:
AInside es una empresa de desarrollo de software especializada en crear algoritmos de trading avanzados y alquilar herramientas analíticas profesionales a traders e instituciones financieras. Fundada para proporcionar soluciones tecnológicas de grado institucional.

MISIÓN:
Desarrollar algoritmos de trading propietarios y alquilar herramientas analíticas profesionales que ayuden a traders e instituciones a analizar los mercados financieros de manera efectiva. Enfoque exclusivo en desarrollo tecnológico, NO en asesoría financiera.

VISIÓN:
Ser líder en desarrollo de algoritmos de trading y herramientas analíticas de calidad, ofreciendo soluciones tecnológicas de alquiler para análisis profesional de mercado.

VALORES FUNDAMENTALES:
• Integridad: Estándares éticos y transparencia
• Innovación: Avance continuo en tecnología financiera
• Excelencia: Calidad y mejora continua
• Alianzas: Relaciones duraderas basadas en confianza

ORGANIZACIÓN:
- Liderazgo Ejecutivo: Dirección estratégica y décadas de experiencia en tecnología financiera
- Equipo de Tecnología: Ingenieros expertos dedicados a innovación en algoritmos
- Equipo de Operaciones: Profesionales comprometidos con excelencia en servicio

DEPARTAMENTOS DE CONTACTO:
- Departamento Comercial y Consultas: inquiries@ainside.me
- Soporte Técnico: support@ainside.me
- Pedidos y Gestión de Licencias: orders@ainside.me
- Servicios y Atención al Cliente: service@ainside.me
- Oficina Corporativa: office@ainside.me

═══════════════════════════════════════════════════════════════════════════
📦 PRODUCTOS Y PRECIOS
═══════════════════════════════════════════════════════════════════════════

🔄 IMPORTANTE: Servicio por SUSCRIPCIÓN mensual o anual (NO es compra única)

CATÁLOGO COMPLETO (4 productos - 2 instrumentos):

📊 S&P 500:
  • Micro S&P 500 (/MES) - Micro contratos del índice
    💳 Mensual: $99 USD/mes
    💳 Anual: $990 USD/año (20% OFF - Pagá 10, Usá 12)
  
  • Mini S&P 500 (/ES) - Contratos estándar premium
    💳 Mensual: $999 USD/mes
    💳 Anual: $9,990 USD/año (20% OFF - Pagá 10, Usá 12)

🥇 GOLD:
  • Micro Gold (/MGC) - Micro contratos de oro
    💳 Mensual: $99 USD/mes
    💳 Anual: $990 USD/año (20% OFF - Pagá 10, Usá 12)
  
  • Mini Gold (/GC) - Contratos estándar de oro premium
    💳 Mensual: $999 USD/mes
    💳 Anual: $9,990 USD/año (20% OFF - Pagá 10, Usá 12)

═══════════════════════════════════════════════════════════════════════════
🛠️ SERVICIOS PROFESIONALES
═══════════════════════════════════════════════════════════════════════════

1. DESARROLLO DE ALGORITMOS DE TRADING
   • Desarrollo de algoritmos a medida
   • Creación de indicadores técnicos propietarios
   • Backtesting y optimización rigurosa
   • Herramientas de análisis en tiempo real
   • Investigación de mercado avanzada

2. SERVICIO DE ALQUILER DE HERRAMIENTAS
   • Modelo de suscripción mensual/anual flexible
   • Acceso a todas las herramientas desarrolladas
   • Compatible con TradeStation y MultiCharts
   • Soporte técnico por email (24-48h respuesta)
   • Actualizaciones mensuales incluidas

3. INTEGRACIÓN DE PLATAFORMAS
   • Compatibilidad total con EasyLanguage
   • Soporte TradeStation Global
   • PowerLanguage de MultiCharts
   • Asistencia en instalación y configuración
   • Documentación técnica completa

4. SEGURIDAD Y CUMPLIMIENTO
   • Protocolos de cifrado avanzados
   • Sistemas de autenticación multifactor
   • SSL de grado bancario
   • Auditorías de seguridad periódicas
   • Marco de cumplimiento regulatorio

═══════════════════════════════════════════════════════════════════════════
✨ CARACTERÍSTICAS TÉCNICAS
═══════════════════════════════════════════════════════════════════════════

✅ Algoritmos de grado institucional con IA
✅ Optimización continua mediante machine learning
✅ Backtesting extensivo en datos históricos
✅ Integración nativa con plataformas líderes
✅ Sistema de licencias HWID (Hardware ID) seguro
✅ Arquitectura de seguridad avanzada
✅ Rendimiento escalable y optimizado
✅ Metodología sistemática rigurosa
✅ Actualizaciones automáticas incluidas
✅ Infraestructura de alcance global

═══════════════════════════════════════════════════════════════════════════
💳 PROCESO DE SUSCRIPCIÓN
═══════════════════════════════════════════════════════════════════════════

PASO A PASO:
1. Seleccionar instrumento (S&P 500 o Gold)
2. Elegir contrato (Micro o Mini)
3. Seleccionar ciclo de facturación (Mensual o Anual)
4. Aplicar cupón de descuento (opcional)
5. Checkout seguro vía PayPal
6. Activación inmediata post-confirmación
7. Recepción de: licencia digital + software + documentación

MODALIDADES:
• Mensual: Renovación automática cada mes
• Anual: 20% descuento (Pagá 10 meses, Usá 12)
• Checkout seguro con SSL grado bancario
• Pago procesado vía PayPal certificado
• Sistema automatizado de generación de licencias

═══════════════════════════════════════════════════════════════════════════
📋 POLÍTICA COMERCIAL
═══════════════════════════════════════════════════════════════════════════

MODELO DE NEGOCIO:
✅ Suscripción mensual o anual (NO compra única)
✅ Licencia vinculada a hardware específico (HWID)
✅ Renovación automática según plan contratado
✅ Cancelación disponible en cualquier momento
❌ NO se procesan reembolsos del período activo
❌ NO hay reembolsos proporcionales
❌ Sin garantía de resultados o ganancias

PRE-EVALUACIÓN DISPONIBLE:
• Demos interactivas en línea
• Demostraciones en vivo: https://ainside.me/demo
• Live Demo: https://ainside.me/live-demo
• Chat en vivo: https://ainside.me/live-chat
• Galería de screenshots

CANCELACIÓN:
• Gestionar en página de suscripción de PayPal
• Sin penalizaciones por cancelación
• Acceso válido hasta fin de período pagado

═══════════════════════════════════════════════════════════════════════════
🖥️ REQUISITOS TÉCNICOS
═══════════════════════════════════════════════════════════════════════════

PLATAFORMAS COMPATIBLES:
✅ TradeStation (recomendado)
✅ TradeStation Global
✅ MultiCharts
✅ EasyLanguage / PowerLanguage

REQUISITOS DEL SISTEMA:
• Plataforma instalada y cuenta activa
• Generación de Hardware ID (HWID) único
• Conexión a internet estable
• Suscripción válida (mensual/anual)
• Datos de mercado del broker

NO INCLUYE:
❌ Cuenta de broker
❌ Datos de mercado en tiempo real
❌ Asesoramiento financiero personal
❌ Gestión de cuentas

SOPORTE TÉCNICO:
• Email: support@ainside.me
• Tiempo de respuesta: 24-48 horas
• Asistencia en instalación y configuración
• Documentación: https://ainside.me/documentation
• Estado del sistema: https://ainside.me/status

═══════════════════════════════════════════════════════════════════════════
❓ PREGUNTAS FRECUENTES (FAQ)
═══════════════════════════════════════════════════════════════════════════

INFORMACIÓN GENERAL:
Q: ¿Qué recibo al contratar?
A: Algoritmo en código EasyLanguage + licencia HWID + documentación completa + actualizaciones mensuales + soporte técnico por email

Q: ¿Diferencia entre Micro y Mini?
A: Micro (/MES, /MGC) = contratos pequeños, menor capital requerido. Mini (/ES, /GC) = contratos estándar, mayor capital requerido

Q: ¿Dónde cancelo mi suscripción?
A: En tu cuenta de PayPal > Pagos automáticos > Seleccionar AInside > Cancelar

REEMBOLSOS:
Q: ¿Garantizan ganancias?
A: NO. El trading implica riesgo. Sin compromiso de resultados. No garantizamos ganancias ni rendimientos.

Q: ¿Puedo obtener reembolso?
A: NO. Productos digitales con licencia HWID no admiten reembolsos una vez entregados. Evalúa demos antes de suscribirte.

Q: ¿Qué capital necesito?
A: Micro: desde $1,000-$2,000. Mini: desde $10,000-$15,000. Depende de broker y gestión de riesgo personal.

COMPATIBILIDAD:
Q: ¿Plataformas compatibles?
A: TradeStation y MultiCharts únicamente. Código en EasyLanguage/PowerLanguage.

Q: ¿Múltiples cuentas?
A: NO. Una licencia HWID por equipo. No transferible a otros ordenadores.

Q: ¿Opera automáticamente 24/7?
A: Sí si activas "Automatizar" en TradeStation/MultiCharts. Requiere PC encendida durante horarios de mercado.

TÉCNICO:
Q: ¿Incluye broker o datos?
A: NO. Necesitas tu propia cuenta de broker y suscripción a datos de mercado.

Q: ¿Puedo modificar el código?
A: Código ofuscado/compilado por seguridad. No editable. Contacta para desarrollo personalizado.

RIESGOS:
Q: ¿Qué riesgos debo conocer?
A: Trading de futuros implica riesgo sustancial. Pérdidas pueden exceder inversión inicial. NO garantizamos resultados.

Q: ¿Muestran resultados en vivo?
A: Mostramos backtests en datos históricos. Resultados pasados NO garantizan rendimientos futuros.

═══════════════════════════════════════════════════════════════════════════
⚠️ ADVERTENCIAS DE RIESGO OBLIGATORIAS
═══════════════════════════════════════════════════════════════════════════

🚨 ADVERTENCIA DE RIESGO IMPORTANTE:
El trading de futuros implica riesgo sustancial de pérdida. Los resultados pasados NO garantizan resultados futuros. NO se garantizan ni se prometen ganancias. Cada trader es responsable de sus propias decisiones de inversión. El capital puede estar en riesgo. Sin compromiso de resultados.

AInside NO proporciona asesoramiento financiero. Solo ofrecemos herramientas tecnológicas de alquiler.

═══════════════════════════════════════════════════════════════════════════
🌐 RECURSOS Y ENLACES
═══════════════════════════════════════════════════════════════════════════

NAVEGACIÓN PRINCIPAL:
• Inicio: https://ainside.me
• Acerca de: https://ainside.me/about
• Servicios: https://ainside.me/services
• Estrategia Demo: https://ainside.me/demo
• Live Demo: https://ainside.me/live-demo
• Chat en Vivo: https://ainside.me/live-chat
• Precios: https://ainside.me/pricing
• FAQ: https://ainside.me/faq
• Contacto: https://ainside.me/contact
• Documentación: https://ainside.me/documentation
• Estado del Sistema: https://ainside.me/status
• Getting Started: https://ainside.me/getting-started

LEGAL:
• Términos y Condiciones: https://ainside.me/legal/terms
• Política de Privacidad: https://ainside.me/legal/privacy
• Descargo de Responsabilidad: https://ainside.me/legal/disclaimer
• Accesibilidad: https://ainside.me/accessibility

═══════════════════════════════════════════════════════════════════════════
🎯 PROTOCOLO DE ATENCIÓN AL CLIENTE
═══════════════════════════════════════════════════════════════════════════

LINEAMIENTOS OBLIGATORIOS:
✅ Responder en idioma del cliente (ES/EN/FR/HE/AR/RU)
✅ Mantener tono profesional, técnico y corporativo
✅ SIEMPRE mencionar riesgo y NO garantía de ganancias
✅ ACLARAR que son suscripciones, NO compras únicas
✅ Mencionar plan anual con 20% OFF (Pagá 10, Usá 12)
✅ Dirigir a departamento apropiado con email específico
✅ Enfatizar naturaleza institucional de algoritmos
✅ Mencionar tecnología de IA y machine learning
✅ Enfocarse en beneficios de automatización y gestión de riesgo
✅ Informar tiempo de respuesta soporte: 24-48h
✅ SIEMPRE incluir "Sin compromiso de resultados"

INFORMACIÓN DE PRECIOS:
• Todos los Micro (MES/MGC): $99/mes o $990/año
• Todos los Mini (ES/GC): $999/mes o $9,990/año
• Plan anual: 20% descuento automático
• Instrumentos: S&P 500 (ES/MES) y Gold (GC/MGC)

PROHIBIDO:
❌ Prometer o garantizar rendimientos específicos
❌ Sugerir que resultados pasados predicen futuros
❌ Dar asesoramiento financiero personal
❌ Minimizar riesgos del trading
❌ Prometer ganancias o ingresos
❌ Hacer afirmaciones de "dinero fácil"

DERIVACIONES:
• Consultas comerciales → inquiries@ainside.me
• Soporte técnico → support@ainside.me
• Gestión de licencias → orders@ainside.me
• Atención general → service@ainside.me
• Asuntos corporativos → office@ainside.me
`;

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { message, sessionId } = await req.json();

    if (!message || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'message and sessionId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obtener IP del usuario
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const identifier = ip;

    // 1. Verificar rate limiting
    const { data: rateLimit, error: rateLimitError } = await supabaseClient
      .from('chat_rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .single();

    const now = new Date();

    // Si está bloqueado
    if (rateLimit?.blocked_until && new Date(rateLimit.blocked_until) > now) {
      return new Response(
        JSON.stringify({ 
          error: 'Demasiados mensajes. Por favor intenta más tarde.',
          blocked: true,
          blockedUntil: rateLimit.blocked_until
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar cooldown
    if (rateLimit?.last_message_at) {
      const secondsSinceLastMessage = (now.getTime() - new Date(rateLimit.last_message_at).getTime()) / 1000;
      if (secondsSinceLastMessage < RATE_LIMIT.COOLDOWN_SECONDS) {
        return new Response(
          JSON.stringify({ 
            error: `Por favor espera ${RATE_LIMIT.COOLDOWN_SECONDS} segundos entre mensajes.`,
            cooldown: true,
            waitSeconds: Math.ceil(RATE_LIMIT.COOLDOWN_SECONDS - secondsSinceLastMessage)
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Verificar límite por hora
    if (rateLimit) {
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      if (new Date(rateLimit.created_at) < hourAgo) {
        // Reset counter si pasó más de una hora
        await supabaseClient
          .from('chat_rate_limits')
          .update({ 
            message_count: 1, 
            last_message_at: now.toISOString(),
            created_at: now.toISOString()
          })
          .eq('identifier', identifier);
      } else if (rateLimit.message_count >= RATE_LIMIT.MAX_MESSAGES_PER_HOUR) {
        // Bloquear por abuso
        const blockedUntil = new Date(now.getTime() + RATE_LIMIT.BLOCK_DURATION_HOURS * 60 * 60 * 1000);
        await supabaseClient
          .from('chat_rate_limits')
          .update({ blocked_until: blockedUntil.toISOString() })
          .eq('identifier', identifier);

        return new Response(
          JSON.stringify({ 
            error: `Has excedido el límite de ${RATE_LIMIT.MAX_MESSAGES_PER_HOUR} mensajes por hora. Bloqueado por ${RATE_LIMIT.BLOCK_DURATION_HOURS} horas.`,
            blocked: true,
            blockedUntil: blockedUntil.toISOString()
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Incrementar contador
        await supabaseClient
          .from('chat_rate_limits')
          .update({ 
            message_count: rateLimit.message_count + 1,
            last_message_at: now.toISOString()
          })
          .eq('identifier', identifier);
      }
    } else {
      // Crear nuevo rate limit
      await supabaseClient
        .from('chat_rate_limits')
        .insert({ 
          identifier, 
          message_count: 1,
          last_message_at: now.toISOString()
        });
    }

    // 2. Obtener o crear conversación
    let { data: conversation } = await supabaseClient
      .from('chat_conversations')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (!conversation) {
      const { data: newConv } = await supabaseClient
        .from('chat_conversations')
        .insert({
          session_id: sessionId,
          ip_address: ip,
          user_agent: req.headers.get('user-agent'),
          messages: [],
          message_count: 0
        })
        .select()
        .single();
      conversation = newConv;
    }

    // 3. Preparar historial (últimos 5 mensajes)
    const messages = (conversation?.messages as any[]) || [];
    const recentMessages = messages.slice(-5);

    // 4. Llamar a OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const openaiMessages = [
      { role: 'system', content: AINSIDE_CONTEXT },
      ...recentMessages,
      { role: 'user', content: message }
    ];

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: openaiMessages,
        max_tokens: RATE_LIMIT.MAX_TOKENS,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI error:', error);
      throw new Error('Error al comunicarse con OpenAI');
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0].message.content;

    // 5. Guardar en conversación
    const updatedMessages = [
      ...messages,
      { role: 'user', content: message, timestamp: now.toISOString() },
      { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
    ];

    await supabaseClient
      .from('chat_conversations')
      .update({
        messages: updatedMessages,
        message_count: updatedMessages.length,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId);

    // 6. Retornar respuesta
    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        tokensUsed: openaiData.usage?.total_tokens || 0,
        remainingMessages: RATE_LIMIT.MAX_MESSAGES_PER_HOUR - ((rateLimit?.message_count || 0) + 1)
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in ai-chat:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
