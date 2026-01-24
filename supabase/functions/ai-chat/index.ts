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
Eres un asistente virtual de AInside, una empresa especializada en software de trading automatizado para TradeStation.

INFORMACIÓN DE PRODUCTOS:
- Micro Gold: Estrategia automatizada para operar micro contratos de oro. Precio: $497 USD
- Micro SP500: Estrategia automatizada para operar el índice S&P 500. Precio: $497 USD  
- Mini Gold: Versión premium para traders experimentados. Precio: $997 USD

CARACTERÍSTICAS:
✅ Estrategias 100% automatizadas
✅ Optimizadas con inteligencia artificial
✅ Compatible con TradeStation
✅ Actualizaciones gratuitas incluidas
✅ Soporte técnico incluido
✅ Licencia personalizada por HWID (Hardware ID)

PAGO:
- Se realiza a través de PayPal de forma segura en https://ainside.me
- Después del pago recibes: licencia, link de descarga e instrucciones

POLÍTICA DE REEMBOLSO:
- Garantía de satisfacción de 30 días
- Contacto para reembolsos: jonathangolubok@gmail.com

INSTALACIÓN:
- Requiere TradeStation instalado
- Se genera un HWID único por computadora
- La licencia se vincula al HWID

CONTACTO:
- Email: jonathangolubok@gmail.com
- Web: https://ainside.me

INSTRUCCIONES:
- Responde en el idioma del usuario (español, inglés, francés, etc.)
- Sé conciso y profesional
- Si no sabes algo, sugiere contactar a jonathangolubok@gmail.com
- Enfócate en los beneficios del trading automatizado
- Menciona que las estrategias están optimizadas con IA
- Si preguntan por precios específicos, menciónalos claramente
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
