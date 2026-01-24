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

// Contexto de AInside para la AI
const AINSIDE_CONTEXT = `
Eres un asistente del Departamento de Atención al Cliente de AInside, empresa profesional especializada en desarrollo de algoritmos de trading automatizado para plataformas institucionales.

AInside cuenta con equipos especializados:
- Departamento Comercial y Consultas: inquiries@ainside.me
- Soporte Técnico: support@ainside.me
- Pedidos y Licencias: orders@ainside.me
- Servicios Generales: service@ainside.me
- Oficina Corporativa: office@ainside.me

INFORMACIÓN DE PRODUCTOS Y MODELO DE SUSCRIPCIÓN:

🔄 IMPORTANTE: Servicio por suscripción mensual o anual (NO es compra única)

- Micro Gold: Estrategia automatizada para operar micro contratos de oro
  💳 Suscripción Mensual: $497 USD/mes
  💳 Suscripción Anual: Consultar descuentos en inquiries@ainside.me

- Micro SP500: Estrategia automatizada para operar el índice S&P 500
  💳 Suscripción Mensual: $497 USD/mes
  💳 Suscripción Anual: Consultar descuentos en inquiries@ainside.me

- Mini Gold: Versión premium para traders experimentados
  💳 Suscripción Mensual: $997 USD/mes
  💳 Suscripción Anual: Consultar descuentos en inquiries@ainside.me

⚠️ ADVERTENCIA DE RIESGO IMPORTANTE:
El trading de futuros implica riesgo sustancial de pérdida. Los resultados pasados NO garantizan resultados futuros. NO se garantizan ni se prometen ganancias. Cada trader es responsable de sus propias decisiones de inversión. El capital puede estar en riesgo.

CARACTERÍSTICAS:
✅ Algoritmos de grado institucional desarrollados con inteligencia artificial
✅ Optimización continua mediante machine learning
✅ Integración nativa con TradeStation
✅ Actualizaciones automáticas incluidas
✅ Soporte técnico especializado 24/7
✅ Sistema de licencias por hardware ID (HWID) para máxima seguridad

PROCESO DE SUSCRIPCIÓN:
- Pago recurrente procesado a través de plataforma PayPal certificada
- Modalidades disponibles: Mensual o Anual
- Activación inmediata tras primer pago: licencia digital + software + documentación técnica
- Sistema automatizado de renovación y generación de licencias
- Descuentos aplicables en suscripciones anuales

POLÍTICA COMERCIAL:
- Servicio de suscripción mensual o anual (NO es compra única)
- Licencia vinculada a hardware específico (HWID) durante período activo
- Renovación automática según plan contratado (mensual/anual)
- Cancelación disponible en cualquier momento (sin reembolso de período activo)
- NO se procesan reembolsos proporcionales del período en curso
- Demos interactivas y demostraciones en vivo disponibles para evaluación pre-suscripción
- Consultas sobre planes y descuentos: inquiries@ainside.me

REQUISITOS TÉCNICOS:
- Plataforma TradeStation instalada y activa
- Generación de identificador único por equipo (HWID)
- Vinculación licencia-hardware durante suscripción activa
- Suscripción válida (mensual o anual) para acceso continuo
- Asistencia técnica: support@ainside.me

CANALES DE CONTACTO CORPORATIVOS:
- Consultas generales e información: inquiries@ainside.me
- Soporte técnico e instalación: support@ainside.me
- Pedidos y gestión de licencias: orders@ainside.me
- Servicios y atención al cliente: service@ainside.me
- Oficina corporativa: office@ainside.me
- Portal web: https://ainside.me
- Formulario de contacto: https://ainside.me/contact

PROTOCOLO DE ATENCIÓN:
- Responder en el idioma del cliente (español, inglés, francés)
- Mantener tono profesional y técnico
- SIEMPRE mencionar que el trading implica riesgo y que NO se garantizan ganancias
- ACLARAR que son suscripciones mensuales/anuales, NO compras únicas
- Dirigir consultas específicas al departamento correspondiente indicando el email apropiado
- Enfatizar la naturaleza institucional y profesional de los algoritmos
- Mencionar la tecnología de IA y optimización continua
- Para consultas técnicas específicas o comerciales detalladas, proporcionar el email del departamento correspondiente
- Enfócate en los beneficios del trading automatizado y la gestión de riesgo
- Menciona que las estrategias están optimizadas con IA
- Si preguntan por precios, mencionar claramente que son suscripciones mensuales o anuales
- NUNCA prometer o garantizar rendimientos, ganancias o resultados específicos
- Enfatizar que cada trader es responsable de sus propias decisiones de inversión
- Informar sobre descuentos en suscripciones anuales (contactar inquiries@ainside.me)
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
