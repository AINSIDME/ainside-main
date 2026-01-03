// Test Yahoo Finance API
async function testAPI() {
  try {
    const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/ES=F?interval=5m&range=1d');
    const data = await response.json();
    
    if (data.chart?.result?.[0]) {
      const result = data.chart.result[0];
      const meta = result.meta;
      
      console.log('=== PRECIO ACTUAL DEL FUTURO E-MINI S&P 500 ===');
      console.log('Símbolo:', meta.symbol);
      console.log('Precio de mercado:', meta.regularMarketPrice);
      console.log('Rango del día:', meta.regularMarketDayLow, '-', meta.regularMarketDayHigh);
      console.log('Hora del mercado:', new Date(meta.regularMarketTime * 1000).toLocaleString());
      
      const timestamps = result.timestamp || [];
      const quote = result.indicators.quote[0];
      
      console.log('\n=== DATOS DISPONIBLES ===');
      console.log('Total de velas:', timestamps.length);
      
      if (timestamps.length > 0) {
        console.log('\n=== ÚLTIMAS 3 VELAS ===');
        for (let i = Math.max(0, timestamps.length - 3); i < timestamps.length; i++) {
          const time = new Date(timestamps[i] * 1000).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
          console.log(`\nVela ${i + 1} (${time}):`);
          console.log('  Open:', quote.open[i]);
          console.log('  High:', quote.high[i]);
          console.log('  Low:', quote.low[i]);
          console.log('  Close:', quote.close[i]);
        }
      }
    } else {
      console.log('No se obtuvieron datos:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
