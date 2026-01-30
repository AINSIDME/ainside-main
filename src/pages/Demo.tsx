import { useEffect, useRef, useState } from "react";
import Highcharts from 'highcharts/highstock';
// import { fetchPreviousDayData } from '../strategies/private/dataFetcher';
// import { runStrategy } from '../strategies/private/strategy';
// import type { Bar } from '../strategies/private/strategy';

interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const Demo = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const barsRef = useRef<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{totalTrades: number, profit: number, winners: number, losers: number} | null>(null);
  const [tradingDate, setTradingDate] = useState<string>('');

  useEffect(() => {
    if (!chartContainerRef.current) return;

    let mounted = true;
    let liveInterval: any = null;

    const loadDataAndRender = async () => {
      try {
        setLoading(true);
        setError(null);

        // Generar datos sintéticos para demostración con más volatilidad
        console.log('🔄 Generando datos de demostración...');
        const bars: Bar[] = [];
        let price = 6000;
        const now = Date.now();
        const barCount = 100; // Más barras para mostrar
        
        for (let i = 0; i < barCount; i++) {
          const time = now - (barCount - i) * 3000; // 3 segundos por barra
          const volatility = 8; // Mayor volatilidad para movimientos visibles
          const trend = Math.sin(i / 10) * 5; // Tendencia ondulatoria
          const open = price;
          const change = trend + (Math.random() - 0.5) * volatility;
          const close = open + change;
          const high = Math.max(open, close) + Math.random() * volatility * 0.5;
          const low = Math.min(open, close) - Math.random() * volatility * 0.5;
          const volume = Math.floor(Math.random() * 2000 + 800);
          
          bars.push({ time, open, high, low, close, volume });
          price = close;
        }
        
        if (!mounted) return;

        const firstBarDate = new Date(bars[0].time);
        setTradingDate(firstBarDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
        
        console.log(`✅ Generadas ${bars.length} velas sintéticas`);

        // Estrategia simple de demostración con más trades
        const strategyResult = { trades: [], indicators: [] };
        let position = 0;
        let entryBar = 0;
        let entryPrice = 0;
        
        for (let i = 20; i < bars.length; i++) {
          const bar = bars[i];
          const prevBar = bars[i - 1];
          const momentum = bar.close - prevBar.close;
          
          // Long entries - más frecuentes
          if (position === 0 && momentum < -3 && Math.random() > 0.6) {
            position = 1;
            entryBar = i;
            entryPrice = bar.close;
          }
          
          // Long exits con profit más realista
          if (position === 1 && (bar.close - entryPrice) >= 5) {
            const profit = (bar.close - entryPrice) * 50;
            strategyResult.trades.push({
              entryBar,
              exitBar: i,
              entryPrice,
              exitPrice: bar.close,
              type: 'long' as const,
              profit
            });
            position = 0;
          }
          
          // Short entries - más frecuentes
          if (position === 0 && momentum > 3 && Math.random() > 0.6) {
            position = -1;
            entryBar = i;
            entryPrice = bar.close;
          }
          
          // Short exits con profit más realista
          if (position === -1 && (entryPrice - bar.close) >= 5) {
            const profit = (entryPrice - bar.close) * 50;
            strategyResult.trades.push({
              entryBar,
              exitBar: i,
              entryPrice,
              exitPrice: bar.close,
              type: 'short' as const,
              profit
            });
            position = 0;
          }
        }
        
        console.log(`📊 Estrategia generó ${strategyResult.trades.length} operaciones`);
        
        // Calcular estadísticas
        const totalProfit = strategyResult.trades.reduce((sum, t) => sum + t.profit, 0);
        const winners = strategyResult.trades.filter(t => t.profit > 0).length;
        const losers = strategyResult.trades.filter(t => t.profit < 0).length;
        const winRate = strategyResult.trades.length > 0 ? (winners / strategyResult.trades.length * 100) : 0;
        
        console.log(`💵 P&L Total: $${totalProfit.toFixed(2)}`);
        console.log(`✅ Ganadoras: ${winners} (${winRate.toFixed(1)}%)`);
        console.log(`❌ Perdedoras: ${losers}`);
        
        if (strategyResult.trades.length > 0) {
          const avgWin = strategyResult.trades.filter(t => t.profit > 0).reduce((sum, t) => sum + t.profit, 0) / (winners || 1);
          const avgLoss = Math.abs(strategyResult.trades.filter(t => t.profit < 0).reduce((sum, t) => sum + t.profit, 0)) / (losers || 1);
          console.log(`📈 Promedio ganador: $${avgWin.toFixed(2)}`);
          console.log(`📉 Promedio perdedor: $${avgLoss.toFixed(2)}`);
        }
        
        setStats({
          totalTrades: strategyResult.trades.length,
          profit: totalProfit,
          winners,
          losers
        });
        
        // Guardar bars en ref para actualizaciones en vivo
        barsRef.current = bars;

        // Convertir a formato Highcharts
        const ohlc: number[][] = bars.map(bar => [
          bar.time,
          parseFloat(bar.open.toFixed(2)),
          parseFloat(bar.high.toFixed(2)),
          parseFloat(bar.low.toFixed(2)),
          parseFloat(bar.close.toFixed(2))
        ]);

        const volume: number[][] = bars.map(bar => [
          bar.time,
          bar.volume
        ]);

        if (!mounted) return;

    const chart = Highcharts.stockChart(chartContainerRef.current, {
      chart: {
        backgroundColor: '#000000',
        height: window.innerHeight - 32,
        style: {
          fontFamily: "'Arial', sans-serif",
        },
        plotBorderWidth: 0,
        margin: [5, 60, 25, 55],
        spacing: [0, 0, 0, 0],
        animation: {
          duration: 300
        },
      },
      title: { text: '' },
      credits: { enabled: false },
      rangeSelector: { enabled: false },
      scrollbar: { enabled: false },
      navigator: { enabled: false },
      xAxis: {
        type: 'datetime',
        gridLineWidth: 0,
        lineColor: '#1a1a1a',
        lineWidth: 0,
        tickColor: '#1a1a1a',
        labels: { 
          enabled: false,
        },
        crosshair: false,
        min: bars[0]?.time,
        max: bars[bars.length - 1]?.time,
      },
      yAxis: [{
        labels: { 
          align: 'right', 
          x: -5, 
          style: { 
            color: '#888',
            fontSize: '10px',
          },
          formatter: function() {
            return (this.value as number).toFixed(2);
          }
        },
        title: { text: '' },
        height: '95%',
        lineWidth: 0,
        gridLineWidth: 0,
      }, {
        labels: { enabled: false },
        title: { text: '' },
        top: '95%',
        height: '5%',
        lineWidth: 0,
        gridLineWidth: 0,
      }],
      tooltip: {
        enabled: false,
      },
      plotOptions: {
        candlestick: {
          color: '#CC0000',
          upColor: '#00CC00',
          lineColor: '#CC0000',
          upLineColor: '#00CC00',
          lineWidth: 1,
        },
        column: {
          color: '#2a2a2a',
        },
        line: {
          marker: { enabled: false },
        },
      },
      series: [
        {
          type: 'candlestick',
          name: 'ES',
          data: ohlc,
          id: 'main',
        },
        {
          type: 'column',
          name: 'Volume',
          data: volume,
          yAxis: 1,
        },
      ],
    });

    // Convertir trades de la estrategia a formato para renderizar
    const tradesToRender = strategyResult.trades.map(trade => {
      const entryBar = bars[trade.entryBar];
      const exitBar = bars[trade.exitBar];
      
      const type = trade.type === 'long' ? 'Long' : 'Short';
      const entryColor = trade.type === 'long' ? '#00FF00' : '#FF0000';
      const above = trade.type === 'short'; // Short arriba, Long abajo
      
      // Calcular puntos de profit/loss
      const points = trade.type === 'long' 
        ? (trade.exitPrice - trade.entryPrice)
        : (trade.entryPrice - trade.exitPrice);
      
      // Formato: +15.50 o -8.25 puntos
      const pointsLabel = points >= 0 ? `+${points.toFixed(2)}` : `${points.toFixed(2)}`;
      
      return {
        entry: {
          x: entryBar.time,
          y: trade.type === 'long' ? entryBar.low : entryBar.high,
          text: `${type}\n@${trade.entryPrice.toFixed(2)}`,
          color: entryColor,
          above: above
        },
        exit: {
          x: exitBar.time,
          y: trade.type === 'long' ? exitBar.high : exitBar.low,
          text: `Exit\n${pointsLabel}pts`,
          color: points >= 0 ? '#00FF00' : '#FF0000',
          above: !above
        }
      };
    });

    // Array para almacenar elementos renderizados
    let renderedElements: any[] = [];

    // Función para renderizar trades
    const renderTrades = () => {
      // Limpiar elementos previos
      renderedElements.forEach(el => el.destroy());
      renderedElements = [];

      // Líneas entre trades
      tradesToRender.forEach(trade => {
        const entryXPos = chart.xAxis[0].toPixels(trade.entry.x, false);
        const entryYPos = chart.yAxis[0].toPixels(trade.entry.y, false);
        const exitXPos = chart.xAxis[0].toPixels(trade.exit.x, false);
        const exitYPos = chart.yAxis[0].toPixels(trade.exit.y, false);
        
        // Línea sólida conectando entrada y salida
        const line = (chart.renderer as any).path([
          ['M', entryXPos, entryYPos],
          ['L', exitXPos, exitYPos]
        ])
        .attr({
          stroke: trade.entry.color,
          'stroke-width': 2,
          zIndex: 2,
          opacity: 0.8,
        })
        .add();
        renderedElements.push(line);
      });

      // Renderizar anotaciones
      const allAnnotations = tradesToRender.flatMap(trade => [trade.entry, trade.exit]);
      
      allAnnotations.forEach(annotation => {
        const xPos = chart.xAxis[0].toPixels(annotation.x, false);
        const yPos = chart.yAxis[0].toPixels(annotation.y, false);
        const offset = annotation.above ? -28 : 28;
        
        const lines = annotation.text.split('\n');
        
        // Tipo de operación
        const text1 = chart.renderer.text(
          lines[0],
          xPos,
          yPos + offset
        )
        .attr({
          zIndex: 100,
          align: 'center',
        })
        .css({
          color: annotation.color,
          fontSize: '11px',
          fontWeight: 'bold',
          textShadow: '0 0 3px rgba(0,0,0,1), 1px 1px 3px rgba(0,0,0,1)',
        })
        .add();
        renderedElements.push(text1);
        
        // P&L
        const text2 = chart.renderer.text(
          lines[1],
          xPos,
          yPos + offset + 14
        )
        .attr({
          zIndex: 100,
          align: 'center',
        })
        .css({
          color: annotation.color,
          fontSize: '11px',
          fontWeight: 'bold',
          textShadow: '0 0 3px rgba(0,0,0,1), 1px 1px 3px rgba(0,0,0,1)',
        })
        .add();
        renderedElements.push(text2);
      });
    };

    // Renderizar inicialmente
    renderTrades();

    // Actualizar en cada redraw
    Highcharts.addEvent(chart, 'redraw', renderTrades);

    chartRef.current = chart;
    setLoading(false);
    
    // INICIAR ACTUALIZACIÓN EN VIVO - Nuevas velas cada 500ms (más rápido)
    liveInterval = setInterval(() => {
      if (!mounted || !chart) return;
      
      const currentBars = barsRef.current;
      if (currentBars.length === 0) return;
      
      const lastBar = currentBars[currentBars.length - 1];
      const newTime = lastBar.time + 3000; // +3 segundos
      
      // Generar movimiento de precio REALISTA y VISIBLE
      const volatility = 4; // Mayor volatilidad para movimientos visibles
      const trend = Math.sin(Date.now() / 10000) * 2; // Tendencia ondulatoria
      const open = lastBar.close;
      const change = trend + (Math.random() - 0.5) * volatility;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 2;
      const low = Math.min(open, close) - Math.random() * 2;
      const volume = Math.floor(Math.random() * 1500 + 500);
      
      const newBar: Bar = {
        time: newTime,
        open,
        high,
        low,
        close,
        volume
      };
      
      // Agregar nueva barra
      currentBars.push(newBar);
      
      // Mantener solo las últimas 100 velas para rendimiento
      if (currentBars.length > 100) {
        currentBars.shift();
      }
      
      // Actualizar serie de velas
      const candleSeries = chart.get('main') as any;
      if (candleSeries && candleSeries.addPoint) {
        candleSeries.addPoint([
          newTime,
          parseFloat(open.toFixed(2)),
          parseFloat(high.toFixed(2)),
          parseFloat(low.toFixed(2)),
          parseFloat(close.toFixed(2))
        ], false, currentBars.length > 100);
      }
      
      // Actualizar volumen
      const volumeSeries = chart.series[1];
      if (volumeSeries) {
        volumeSeries.addPoint([newTime, volume], false, currentBars.length > 100);
      }
      
      // Re-ejecutar estrategia simple sobre datos actualizados
      const trades: any[] = [];
      let position = 0;
      let entryBar = 0;
      let entryPrice = 0;
      
      for (let i = 20; i < currentBars.length; i++) {
        const bar = currentBars[i];
        const prevBar = currentBars[i - 1];
        const momentum = bar.close - prevBar.close;
        
        if (position === 0 && momentum < -3 && Math.random() > 0.7) {
          position = 1;
          entryBar = i;
          entryPrice = bar.close;
        }
        
        if (position === 1 && (bar.close - entryPrice) >= 5) {
          trades.push({
            entryBar, exitBar: i, entryPrice, exitPrice: bar.close,
            type: 'long', profit: (bar.close - entryPrice) * 50
          });
          position = 0;
        }
        
        if (position === 0 && momentum > 3 && Math.random() > 0.7) {
          position = -1;
          entryBar = i;
          entryPrice = bar.close;
        }
        
        if (position === -1 && (entryPrice - bar.close) >= 5) {
          trades.push({
            entryBar, exitBar: i, entryPrice, exitPrice: bar.close,
            type: 'short', profit: (entryPrice - bar.close) * 50
          });
          position = 0;
        }
      }
      
      // Actualizar stats
      const newTotalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
      const newWinners = trades.filter(t => t.profit > 0).length;
      const newLosers = trades.filter(t => t.profit < 0).length;
      
      setStats({
        totalTrades: trades.length,
        profit: newTotalProfit,
        winners: newWinners,
        losers: newLosers
      });
      
      // Redibujar gráfico
      chart.redraw();
      
    }, 500); // Cada 500ms (más rápido y visible)

      } catch (err) {
        console.error('Error loading data:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
          setLoading(false);
        }
      }
    };

    loadDataAndRender();

    return () => {
      mounted = false;
      if (liveInterval) {
        clearInterval(liveInterval);
      }
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      {/* Header minimalista tipo TradeStation */}
      <div className="h-8 bg-black border-b border-[#1a1a1a] flex items-center px-3 justify-between">
        <div className="flex items-center gap-4">
          <span className="text-[#999] text-[11px] font-semibold">
            ES (S&P 500 Futures) - LIVE SIMULATION {tradingDate && `| ${tradingDate}`}
          </span>
          {stats && (
            <span className="text-[#666] text-[10px]">
              Trades: {stats.totalTrades} | 
              <span className={stats.profit >= 0 ? 'text-[#00ff00]' : 'text-[#ff0000]'}>
                {' '}P&L: ${stats.profit.toFixed(2)}
              </span>
              {' '}| Wins: {stats.winners} | Losses: {stats.losers}
              {stats.totalTrades > 0 && ` | Win Rate: ${((stats.winners / stats.totalTrades) * 100).toFixed(1)}%`}
            </span>
          )}
        </div>
        {error && (
          <span className="text-[#ff0000] text-[10px]">Error: {error}</span>
        )}
      </div>
      
      {/* Gráfico a pantalla completa */}
      {loading && (
        <div className="w-full h-[calc(100vh-32px)] bg-black flex items-center justify-center">
          <div className="text-white text-sm">Descargando datos del día anterior...</div>
        </div>
      )}
      <div 
        ref={chartContainerRef} 
        className="w-full h-[calc(100vh-32px)] bg-black" 
        style={{ display: loading ? 'none' : 'block' }}
      />
    </div>
  );
};

export default Demo;
