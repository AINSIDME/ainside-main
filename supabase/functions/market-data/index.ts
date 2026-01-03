import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FinnhubQuote {
  c: number; // Current price
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

interface FinnhubCandle {
  c: number[]; // Close prices
  h: number[]; // High prices
  l: number[]; // Low prices
  o: number[]; // Open prices
  t: number[]; // Timestamps
  v: number[]; // Volume data
  s: string; // Status
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { instrument = 'SPY' } = await req.json().catch(() => ({}))
    
    const apiKey = Deno.env.get('FINNHUB_API_KEY')
    if (!apiKey) {
      throw new Error('FINNHUB_API_KEY not configured')
    }

    // Get current quote
    const quoteResponse = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${instrument}&token=${apiKey}`
    )
    
    if (!quoteResponse.ok) {
      throw new Error(`Finnhub API error: ${quoteResponse.status}`)
    }

    const quote: FinnhubQuote = await quoteResponse.json()

    // Get historical candle data (last 5 days, 1-minute resolution)
    const to = Math.floor(Date.now() / 1000)
    const from = to - (5 * 24 * 60 * 60) // 5 days ago
    
    const candleResponse = await fetch(
      `https://finnhub.io/api/v1/stock/candle?symbol=${instrument}&resolution=1&from=${from}&to=${to}&token=${apiKey}`
    )

    const candleData: FinnhubCandle = await candleResponse.json()

    // Transform data for our chart
    const chartData = []
    if (candleData.s === 'ok' && candleData.t) {
      const length = Math.min(candleData.t.length, 100) // Last 100 points
      const startIndex = Math.max(0, candleData.t.length - 100)
      
      for (let i = startIndex; i < candleData.t.length; i++) {
        const time = new Date(candleData.t[i] * 1000).toLocaleTimeString()
        const open = candleData.o[i]
        const high = candleData.h[i]
        const low = candleData.l[i]
        const close = candleData.c[i]
        const vwap = (high + low + close) / 3 // Simple VWAP approximation
        
        chartData.push({
          time,
          open,
          high,
          low,
          close,
          vwap
        })
      }
    }

    // If no historical data, create single point from current quote
    if (chartData.length === 0) {
      const time = new Date().toLocaleTimeString()
      chartData.push({
        time,
        open: quote.o,
        high: quote.h,
        low: quote.l,
        close: quote.c,
        vwap: (quote.h + quote.l + quote.c) / 3
      })
    }

    const response = {
      success: true,
      data: chartData,
      currentPrice: quote.c,
      change: quote.c - quote.pc,
      changePercent: ((quote.c - quote.pc) / quote.pc) * 100,
      instrument,
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Market data error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        fallback: true
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})