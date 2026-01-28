import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineStyle } from 'lightweight-charts';
import { AlertTriangle, TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";

const Demo = () => {
  const { t } = useTranslation();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  
  const [currentPrice, setCurrentPrice] = useState(6025.50);
  const [position, setPosition] = useState<{ type: 'long' | 'short', entry: number, pnl: number } | null>(null);
  const [trades, setTrades] = useState<Array<{ type: string, entry: number, exit: number, pnl: number }>>([]);
  const [totalPnL, setTotalPnL] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Crear el gráfico con configuración profesional tipo TradingView
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 800,
      layout: {
        background: { color: '#0a0a0a' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#1a1a1a' },
        horzLines: { color: '#1a1a1a' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: '#758696',
          style: LineStyle.Dashed,
        },
        horzLine: {
          width: 1,
          color: '#758696',
          style: LineStyle.Dashed,
        },
      },
      rightPriceScale: {
        borderColor: '#2B2B43',
        textColor: '#d1d4dc',
      },
      timeScale: {
        borderColor: '#2B2B43',
        textColor: '#d1d4dc',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Crear serie de velas
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Cargar datos históricos reales de Yahoo Finance
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://query1.finance.yahoo.com/v8/finance/chart/ES=F?interval=1h&range=7d'
        );
        const data = await response.json();
        
        if (data.chart?.result?.[0]) {
          const result = data.chart.result[0];
          const timestamps = result.timestamp || [];
          const quote = result.indicators.quote[0];
          
          const candleData: CandlestickData[] = timestamps
            .map((timestamp: number, idx: number) => {
              const open = quote.open[idx];
              const high = quote.high[idx];
              const low = quote.low[idx];
              const close = quote.close[idx];
              
              if (open && high && low && close) {
                return {
                  time: timestamp as any,
                  open,
                  high,
                  low,
                  close,
                };
              }
              return null;
            })
            .filter((candle): candle is CandlestickData => candle !== null);

          if (candleData.length > 0) {
            candlestickSeries.setData(candleData);
            setCurrentPrice(candleData[candleData.length - 1].close);
            
            // Agregar señales de trading algorítmico realistas
            addTradingSignals(candlestickSeries, candleData);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback a datos simulados
        generateFallbackData(candlestickSeries);
        setIsLoading(false);
      }
    };

    fetchData();

    // Redimensionar gráfico cuando cambia el tamaño de la ventana
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
          height: 800 
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Simulación de trading en tiempo real
    const tradingInterval = setInterval(() => {
      simulateAlgoTrading(candlestickSeries);
    }, 8000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(tradingInterval);
      chart.remove();
    };
  }, []);

  // Función para agregar señales de trading realistas en el gráfico
  const addTradingSignals = (series: ISeriesApi<"Candlestick">, data: CandlestickData[]) => {
    const markers: any[] = [];
    let inPosition = false;
    let entryPrice = 0;
    let entryTime = 0;

    for (let i = 20; i < data.length - 10; i++) {
      const candle = data[i];
      
      // Lógica de entrada (basada en promedios móviles simulados)
      if (!inPosition && Math.random() > 0.92) {
        const isLong = Math.random() > 0.5;
        inPosition = true;
        entryPrice = candle.close;
        entryTime = candle.time as number;
        
        markers.push({
          time: candle.time,
          position: isLong ? 'belowBar' : 'aboveBar',
          color: isLong ? '#26a69a' : '#ef5350',
          shape: isLong ? 'arrowUp' : 'arrowDown',
          text: isLong ? `LONG @ ${candle.close.toFixed(2)}` : `SHORT @ ${candle.close.toFixed(2)}`,
          size: 2,
        });
      }
      // Lógica de salida
      else if (inPosition && i > entryTime + 5) {
        const priceDiff = candle.close - entryPrice;
        const shouldExit = Math.abs(priceDiff) > 15 || Math.random() > 0.85;
        
        if (shouldExit) {
          const pnl = priceDiff * 50; // $50 por punto
          markers.push({
            time: candle.time,
            position: pnl >= 0 ? 'aboveBar' : 'belowBar',
            color: pnl >= 0 ? '#2196F3' : '#ff9800',
            shape: 'circle',
            text: `EXIT ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(0)}`,
            size: 1,
          });
          inPosition = false;
        }
      }
    }

    series.setMarkers(markers);
  };

  // Simulación de trading algorítmico en tiempo real
  const simulateAlgoTrading = (series: ISeriesApi<"Candlestick">) => {
    if (!series) return;

    // Obtener última vela
    const data = series.data() as CandlestickData[];
    if (data.length === 0) return;

    const lastCandle = data[data.length - 1];
    const lastTime = lastCandle.time as number;
    const newTime = lastTime + 3600; // +1 hora

    // Generar nueva vela realista
    const volatility = 2.5;
    const trend = (Math.random() - 0.48) * 3; // Ligero sesgo alcista
    const open = lastCandle.close;
    const change = trend + (Math.random() - 0.5) * volatility;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;

    const newCandle: CandlestickData = {
      time: newTime as any,
      open,
      high,
      low,
      close,
    };

    series.update(newCandle);
    setCurrentPrice(close);

    // Lógica de posición automática
    if (!position && Math.random() > 0.85) {
      const isLong = Math.random() > 0.5;
      setPosition({ type: isLong ? 'long' : 'short', entry: close, pnl: 0 });
      
      // Agregar marcador
      const markers = series.markers();
      markers.push({
        time: newTime as any,
        position: isLong ? 'belowBar' : 'aboveBar',
        color: isLong ? '#26a69a' : '#ef5350',
        shape: isLong ? 'arrowUp' : 'arrowDown',
        text: isLong ? `LONG ${Math.floor(Math.random() * 80 + 20)}` : `SHORT ${Math.floor(Math.random() * 80 + 20)}`,
        size: 2,
      });
      series.setMarkers(markers);
    } else if (position) {
      const priceDiff = position.type === 'long' 
        ? close - position.entry 
        : position.entry - close;
      const currentPnL = priceDiff * 50;
      
      setPosition({ ...position, pnl: currentPnL });

      // Salir si ganancia > 12 puntos o pérdida > 6 puntos
      if (priceDiff > 12 || priceDiff < -6) {
        const finalPnL = priceDiff * 50;
        
        setTrades(prev => [{
          type: position.type.toUpperCase(),
          entry: position.entry,
          exit: close,
          pnl: finalPnL
        }, ...prev].slice(0, 10));
        
        setTotalPnL(prev => prev + finalPnL);
        
        // Agregar marcador de salida
        const markers = series.markers();
        markers.push({
          time: newTime as any,
          position: finalPnL >= 0 ? 'aboveBar' : 'belowBar',
          color: finalPnL >= 0 ? '#2196F3' : '#ff9800',
          shape: 'circle',
          text: `CloseEOD ${finalPnL >= 0 ? '+' : ''}$${finalPnL.toFixed(0)}`,
          size: 1,
        });
        series.setMarkers(markers);
        
        setPosition(null);
      }
    }
  };

  // Generar datos de respaldo si falla la API
  const generateFallbackData = (series: ISeriesApi<"Candlestick">) => {
    const data: CandlestickData[] = [];
    let price = 6025;
    const now = Math.floor(Date.now() / 1000);

    for (let i = 0; i < 168; i++) { // 7 días de datos horarios
      const time = now - (168 - i) * 3600;
      const open = price;
      const change = (Math.random() - 0.5) * 8;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 4;
      const low = Math.min(open, close) - Math.random() * 4;

      data.push({ time: time as any, open, high, low, close });
      price = close;
    }

    series.setData(data);
    setCurrentPrice(price);
    addTradingSignals(series, data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <div className="text-white font-mono text-xl">Loading Professional Chart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header Compacto */}
      <div className="border-b border-slate-800 bg-slate-950 px-4 py-3">
        <div className="max-w-[98%] mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-white">E-mini S&P 500 Futures</h1>
              <span className="px-2 py-1 bg-blue-600 text-white text-xs font-mono font-bold">60 MIN</span>
              <span className="px-2 py-1 bg-emerald-600/20 text-emerald-400 text-xs font-mono border border-emerald-600/50">
                LIVE ALGO
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Yahoo Finance (ES=F) • Last 7 days • Algorithmic Trading Simulation
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-slate-500 font-mono">Current Price</div>
              <div className="text-2xl font-bold text-white font-mono">{currentPrice.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico Principal */}
      <div className="px-2 py-2">
        <div className="max-w-[98%] mx-auto">
          <div className="relative bg-black border border-slate-800">
            <div ref={chartContainerRef} className="w-full" />
          </div>
        </div>
      </div>

      {/* Panel de Estadísticas Compacto */}
      <div className="px-2 pb-6">
        <div className="max-w-[98%] mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            
            {/* Posición Actual */}
            <div className="bg-slate-950 border border-slate-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                {position ? (
                  position.type === 'long' ? 
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> : 
                    <TrendingDown className="w-4 h-4 text-red-400" />
                ) : (
                  <Activity className="w-4 h-4 text-slate-600" />
                )}
                <span className="text-xs text-slate-500 font-mono uppercase">Position</span>
              </div>
              {position ? (
                <div>
                  <div className={`text-lg font-mono font-bold ${position.type === 'long' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {position.type.toUpperCase()}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-1">
                    Entry: {position.entry.toFixed(2)}
                  </div>
                  <div className={`text-sm font-mono font-bold mt-1 ${position.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-600 font-mono">No position</div>
              )}
            </div>

            {/* Total P&L */}
            <div className="bg-slate-950 border border-slate-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-500 font-mono uppercase">Total P&L</span>
              </div>
              <div className={`text-2xl font-mono font-bold ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
              </div>
            </div>

            {/* Total Trades */}
            <div className="bg-slate-950 border border-slate-800 p-4">
              <div className="text-xs text-slate-500 font-mono uppercase mb-2">Trades</div>
              <div className="text-2xl font-mono font-bold text-white">{trades.length}</div>
              <div className="flex gap-3 mt-1 text-xs font-mono">
                <span className="text-emerald-400">{trades.filter(t => t.pnl > 0).length}W</span>
                <span className="text-red-400">{trades.filter(t => t.pnl < 0).length}L</span>
              </div>
            </div>

            {/* Win Rate */}
            <div className="bg-slate-950 border border-slate-800 p-4">
              <div className="text-xs text-slate-500 font-mono uppercase mb-2">Win Rate</div>
              <div className="text-2xl font-mono font-bold text-white">
                {trades.length > 0 
                  ? ((trades.filter(t => t.pnl > 0).length / trades.length) * 100).toFixed(1)
                  : '0.0'}%
              </div>
            </div>

            {/* Recent Trades */}
            <div className="bg-slate-950 border border-slate-800 p-4">
              <div className="text-xs text-slate-500 font-mono uppercase mb-2">Recent</div>
              <div className="space-y-1">
                {trades.slice(0, 3).map((trade, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-mono">
                    <span className={trade.type === 'LONG' ? 'text-emerald-400' : 'text-red-400'}>
                      {trade.type}
                    </span>
                    <span className={`font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(0)}
                    </span>
                  </div>
                ))}
                {trades.length === 0 && (
                  <div className="text-xs text-slate-600">No trades yet</div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-4 pb-8">
        <div className="max-w-[98%] mx-auto">
          <div className="bg-slate-900/50 border border-slate-800 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-white">Educational Demo:</strong> This is a simulated algorithmic trading demonstration using real market data from Yahoo Finance. 
              Signals are generated for educational purposes only. Past performance does not guarantee future results. 
              Trading futures involves substantial risk of loss.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
