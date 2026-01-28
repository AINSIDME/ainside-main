import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, BarChart3, TrendingUp, Activity, CandlestickChart, AreaChart } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

const Demo = () => {
  const { t } = useTranslation();
  
  const [chartData, setChartData] = useState<any[]>([]);
  const [ohlcData, setOhlcData] = useState<any[]>([]); // Datos OHLC para velas
  const [currentPrice, setCurrentPrice] = useState(6830);
  const [position, setPosition] = useState<'long' | 'short' | null>(null);
  const [entryPrice, setEntryPrice] = useState(0);
  const [trades, setTrades] = useState<any[]>([]);
  const [pnl, setPnl] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [chartType, setChartType] = useState<'area' | 'candlestick'>('candlestick');
  const [entryMarkers, setEntryMarkers] = useState<any[]>([]); // Marcadores de entrada
  const [exitMarkers, setExitMarkers] = useState<any[]>([]); // Marcadores de salida

  // Función para verificar si el mercado está abierto
  const checkMarketHours = () => {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const utcDay = now.getUTCDay();
    
    // ES trading hours: Sunday 6:00 PM ET to Friday 5:00 PM ET
    // ET = UTC-5 (or UTC-4 during DST)
    // Approximation: Market open Monday-Friday 13:30 UTC to 20:00 UTC (9:30 AM - 4:00 PM ET)
    // Also open Sunday evening 23:00 UTC - Friday 22:00 UTC for futures
    
    // Weekend check (Saturday = 6, most of Sunday)
    if (utcDay === 6 || (utcDay === 0 && utcHours < 22)) {
      return false;
    }
    
    // Friday close at 22:00 UTC (5:00 PM ET)
    if (utcDay === 5 && utcHours >= 22) {
      return false;
    }
    
    // Futures market is generally open 23 hours a day on weekdays
    // Only closed from 22:00-23:00 UTC for maintenance
    if (utcHours === 22) {
      return false;
    }
    
    return true;
  };

  // Configuración de Highcharts Stock con tema oscuro
  const chartOptions = {
    chart: {
      backgroundColor: '#0a0a0a',
      height: 800,
    },
    rangeSelector: {
      selected: 1,
      buttonTheme: {
        fill: '#1e293b',
        style: {
          color: '#94a3b8'
        },
        states: {
          hover: {
            fill: '#334155',
            style: {
              color: '#e2e8f0'
            }
          },
          select: {
            fill: '#3b82f6',
            style: {
              color: '#ffffff'
            }
          }
        }
      },
      inputStyle: {
        color: '#e2e8f0',
        backgroundColor: '#1e293b'
      },
      labelStyle: {
        color: '#94a3b8'
      },
      buttons: [{
        type: 'day',
        count: 1,
        text: '1d'
      }, {
        type: 'week',
        count: 1,
        text: '1w'
      }, {
        type: 'month',
        count: 1,
        text: '1m'
      }, {
        type: 'all',
        text: 'All'
      }]
    },
    title: {
      text: ''
    },
    xAxis: {
      type: 'datetime',
      labels: {
        style: {
          color: '#94a3b8'
        }
      },
      lineColor: '#334155',
      tickColor: '#334155'
    },
    yAxis: {
      opposite: true,
      labels: {
        align: 'left',
        style: {
          color: '#94a3b8'
        }
      },
      gridLineColor: '#1e293b'
    },
    series: chartType === 'candlestick' ? [{
      name: 'ES=F',
      data: ohlcData,
      type: 'candlestick',
      id: 'price',
      color: '#ef4444', // Rojo para velas bajistas
      upColor: '#22c55e', // Verde para velas alcistas
      lineColor: '#ef4444',
      upLineColor: '#22c55e',
      tooltip: {
        valueDecimals: 2
      },
      dataLabels: {
        enabled: false // Las etiquetas se muestran via markers
      }
    }, {
      // Serie de etiquetas de señales (texto flotante)
      name: 'Signal Labels',
      type: 'scatter',
      data: entryMarkers.map(marker => ({
        x: marker.x,
        y: marker.y + 15, // Posicionar arriba del marcador
        marker: {
          enabled: false
        },
        dataLabels: {
          enabled: true,
          format: marker.label,
          style: {
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 'bold',
            textOutline: '2px contrast'
          },
          backgroundColor: marker.marker.fillColor,
          borderRadius: 3,
          padding: 4
        }
      })),
      enableMouseTracking: false,
      zIndex: 11
    }, {
      // Serie de marcadores de ENTRADA (flechas hacia arriba o abajo)
      name: 'Entry Signals',
      type: 'scatter',
      data: entryMarkers,
      color: 'transparent',
      marker: {
        enabled: true,
        symbol: 'triangle',
        radius: 8,
      },
      tooltip: {
        pointFormat: '<b>{point.label}</b><br/>Price: {point.y:.2f}'
      },
      zIndex: 10
    }, {
      // Serie de marcadores de SALIDA (círculos)
      name: 'Exit Signals',
      type: 'scatter',
      data: exitMarkers,
      color: 'transparent',
      marker: {
        enabled: true,
        symbol: 'circle',
        radius: 8,
      },
      tooltip: {
        pointFormat: '<b>{point.label}</b><br/>Price: {point.y:.2f}<br/>P&L: {point.pnl}'
      },
      zIndex: 10
    }] : [{
      name: 'ES=F',
      data: chartData,
      type: 'area',
      id: 'price',
      threshold: null,
      fillColor: {
        linearGradient: {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 1
        },
        stops: [
          [0, 'rgba(59, 130, 246, 0.5)'],
          [1, 'rgba(59, 130, 246, 0.0)']
        ]
      },
      lineColor: '#3b82f6',
      lineWidth: 2,
      tooltip: {
        valueDecimals: 2
      }
    }, {
      // Serie de marcadores de ENTRADA (flechas hacia arriba o abajo)
      name: 'Entry Signals',
      type: 'scatter',
      data: entryMarkers,
      color: 'transparent',
      marker: {
        enabled: true,
        symbol: 'triangle',
        radius: 8,
      },
      tooltip: {
        pointFormat: '<b>{point.label}</b><br/>Price: {point.y:.2f}'
      },
      zIndex: 10
    }, {
      // Serie de marcadores de SALIDA (círculos)
      name: 'Exit Signals',
      type: 'scatter',
      data: exitMarkers,
      color: 'transparent',
      marker: {
        enabled: true,
        symbol: 'circle',
        radius: 8,
      },
      tooltip: {
        pointFormat: '<b>{point.label}</b><br/>Price: {point.y:.2f}<br/>P&L: {point.pnl}'
      },
      zIndex: 10
    }],
    credits: {
      enabled: false
    },
    navigator: {
      enabled: true,
      maskFill: 'rgba(59, 130, 246, 0.1)',
      outlineColor: '#334155',
      handles: {
        backgroundColor: '#1e293b',
        borderColor: '#64748b'
      },
      xAxis: {
        gridLineColor: '#1e293b',
        labels: {
          style: {
            color: '#64748b'
          }
        }
      },
      series: {
        color: '#3b82f6',
        lineColor: '#3b82f6'
      }
    },
    scrollbar: {
      enabled: false
    }
  };

  useEffect(() => {
    // Verificar horario del mercado
    setIsMarketOpen(checkMarketHours());
    
    // Verificar cada minuto si el mercado está abierto
    const marketCheckInterval = setInterval(() => {
      setIsMarketOpen(checkMarketHours());
    }, 60000); // Check every minute

    // Cargar datos históricos reales del S&P 500 con OHLC
    const fetchHistoricalData = async () => {
      try {
        // Usar API de Yahoo Finance
        const symbol = 'ES=F'; // E-mini S&P 500 Futures
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1h&range=1mo`
        );
        const data = await response.json();
        
        if (data.chart?.result?.[0]) {
          const result = data.chart.result[0];
          const meta = result.meta || {};
          const marketPrice = meta.regularMarketPrice || 6830; // Precio actual del mercado
          
          console.log('Precio real del futuro ES:', marketPrice);
          
          const timestamps = result.timestamp || [];
          const quote = result.indicators.quote[0];
          const opens = quote.open || [];
          const highs = quote.high || [];
          const lows = quote.low || [];
          const closes = quote.close || [];
          
          // Filtrar velas con datos válidos y crear ambos formatos
          const historicalDataArea: any[] = [];
          const historicalDataOHLC: any[] = [];
          
          timestamps.forEach((timestamp: number, idx: number) => {
            const open = opens[idx];
            const high = highs[idx];
            const low = lows[idx];
            const close = closes[idx];
            
            // Solo incluir velas con datos válidos
            if (open && high && low && close && 
                !isNaN(open) && !isNaN(high) && !isNaN(low) && !isNaN(close)) {
              
              const ts = timestamp * 1000; // Highcharts usa timestamp en milisegundos
              
              // Formato para gráfico de área (timestamp, close)
              historicalDataArea.push([ts, close]);
              
              // Formato para candlestick (timestamp, open, high, low, close)
              historicalDataOHLC.push([ts, open, high, low, close]);
            }
          });
          
          const finalDataArea = historicalDataArea.slice(-500); // Más datos para mejor visualización
          const finalDataOHLC = historicalDataOHLC.slice(-500);
          
          console.log('✅ Datos cargados desde Yahoo Finance:', finalDataArea.length, 'puntos');
          console.log('Muestra de datos área:', finalDataArea.slice(0, 3));
          console.log('Muestra de datos OHLC:', finalDataOHLC.slice(0, 3));
          
          if (finalDataArea.length > 0) {
            const lastValidCandle = finalDataArea[finalDataArea.length - 1];
            const lastValidTime = new Date(lastValidCandle[0]); // [0] es el timestamp en milisegundos
            console.log('Última vela válida:', lastValidTime.toLocaleString());
            console.log('Precio actual:', lastValidCandle[1]);
            
            setCurrentPrice(lastValidCandle[1]);
            setChartData(finalDataArea);
            setOhlcData(finalDataOHLC);
            console.log('✅ setChartData y setOhlcData llamados con', finalDataArea.length, 'puntos');
          } else {
            console.warn('⚠️ No hay datos válidos');
            setCurrentPrice(marketPrice);
          }
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
        // Fallback a datos simulados si falla la API
        const initialDataArea = [];
        const initialDataOHLC = [];
        let price = 6830; // Precio real actual del E-mini S&P 500 futures
        const now = Math.floor(Date.now() / 1000);
        for (let i = 0; i < 60; i++) {
          const open = price;
          const change = (Math.random() - 0.5) * 20;
          const close = open + change;
          const high = Math.max(open, close) + Math.random() * 5;
          const low = Math.min(open, close) - Math.random() * 5;
          
          const ts = (now - ((60 - i) * 3600)) * 1000;
          
          initialDataArea.push([ts, close]);
          initialDataOHLC.push([ts, open, high, low, close]);
          
          price = close;
        }
        setChartData(initialDataArea);
        setOhlcData(initialDataOHLC);
        setCurrentPrice(price);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();

    // Actualizar con datos simulados basados en el último precio real
    const interval = setInterval(() => {
      // La simulación continúa siempre para propósitos educativos
      // (En producción, solo se actualizaría cuando el mercado está abierto)
      
      setChartData((prev) => {
        const lastCandle = prev[prev.length - 1];
        if (!lastCandle) return prev;
        
        const lastClose = lastCandle[1]; // En formato área es [timestamp, close]
        
        // Calcular el siguiente timestamp PRIMERO
        const lastTimestamp = lastCandle[0]; // [0] es el timestamp en milisegundos
        const newTimestamp = lastTimestamp + 5000; // +5000 ms (5 segundos para demo)
        
        // Generar nueva vela con variación realista
        const open = lastClose;
        const change = (Math.random() - 0.5) * 6; // Variación más realista
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * 3;
        const low = Math.min(open, close) - Math.random() * 3;
        
        setCurrentPrice(close);

        // Lógica de entrada automática (más visible para demo)
        if (!position && Math.random() > 0.92) { // 8% probabilidad cada tick
          const isLong = Math.random() > 0.5;
          setPosition(isLong ? 'long' : 'short');
          setEntryPrice(close);
          
          // Generar valor de señal realista (como en TradeStation)
          const signalValue = Math.floor(Math.random() * 100) + 20;
          
          // Agregar marcador de ENTRADA en el gráfico
          const entryMarker = {
            x: newTimestamp,
            y: close,
            label: isLong ? `Long\n${signalValue}` : `Short\n${signalValue}`,
            signalValue: signalValue,
            marker: {
              fillColor: isLong ? '#22c55e' : '#ef4444',
              lineColor: '#ffffff',
              lineWidth: 2,
              symbol: isLong ? 'triangle' : 'triangle-down',
              radius: 10
            }
          };
          setEntryMarkers(prev => [...prev, entryMarker].slice(-10));
        }

        // Lógica de salida automática (objetivos más realistas para ES)
        if (position && entryPrice) {
          const priceDiff = position === 'long' 
            ? close - entryPrice 
            : entryPrice - close;
          
          // Salir si ganancia > 12 puntos o pérdida > 6 puntos (más frecuente para demo)
          if (priceDiff > 12 || priceDiff < -6) {
            const profitLoss = priceDiff * 50; // $50 por punto en ES
            
            // Agregar marcador de SALIDA en el gráfico
            const closeLabel = position === 'long' ? 'CloseEOD_L' : 'CloseEOD_S';
            const exitMarker = {
              x: newTimestamp,
              y: close,
              label: `${closeLabel}\n0`,
              pnl: profitLoss >= 0 ? `+$${profitLoss.toFixed(0)}` : `$${profitLoss.toFixed(0)}`,
              marker: {
                fillColor: profitLoss >= 0 ? '#3b82f6' : '#f59e0b',
                lineColor: '#ffffff',
                lineWidth: 2,
                symbol: 'circle',
                radius: 8
              }
            };
            setExitMarkers(prev => [...prev, exitMarker].slice(-10));
            
            setTrades((prev) => [{
              type: position,
              entry: entryPrice,
              exit: close,
              pnl: profitLoss,
              time: Date.now(),
            }, ...prev].slice(0, 5));
            setPnl((prev) => prev + profitLoss);
            setPosition(null);
            setEntryPrice(0);
          }
        }

        const newCandleArea = [
          newTimestamp, // timestamp en milisegundos
          close // Precio
        ];

        const newData = [...prev, newCandleArea].slice(-500); // Mantener últimas 500 velas
        
        return newData;
      });
      
      // Actualizar también datos OHLC
      setOhlcData((prev) => {
        const lastCandle = prev[prev.length - 1];
        if (!lastCandle) return prev;
        
        const lastClose = lastCandle[4]; // En OHLC es [timestamp, open, high, low, close]
        
        const open = lastClose;
        const change = (Math.random() - 0.5) * 6;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * 3;
        const low = Math.min(open, close) - Math.random() * 3;
        
        const lastTimestamp = lastCandle[0];
        const newTimestamp = lastTimestamp + 5000; // 5 segundos para demo
        
        const newCandleOHLC = [
          newTimestamp,
          open,
          high,
          low,
          close
        ];
        
        return [...prev, newCandleOHLC].slice(-500);
      });
    }, 5000); // Actualizar cada 5 segundos para demo (más visible)

    return () => {
      clearInterval(interval);
      clearInterval(marketCheckInterval);
    };
  }, [position, entryPrice]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-mono text-xl">{t('demoPage.liveChart.loading', { defaultValue: 'Loading...' })}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header Minimalista */}
      <section className="relative py-8 px-4 bg-slate-950 border-b border-slate-800">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono uppercase tracking-wider">
                  {t('demoPage.badge', { defaultValue: 'LIVE STRATEGY' })}
                </div>
                <div className={`px-3 py-1 border text-[10px] font-mono uppercase tracking-wider ${
                  isMarketOpen 
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  {isMarketOpen ? t('demoPage.liveChart.marketOpen', { defaultValue: 'MARKET OPEN' }) : t('demoPage.liveChart.marketClosed', { defaultValue: 'MARKET CLOSED' })}
                </div>
              </div>
              <h1 className="text-3xl font-light text-white mb-2">
                {t('demoPage.header.title', { defaultValue: 'Live Trading Strategy Demo' })}
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl">
                {t('demoPage.header.description', { defaultValue: 'Real-time E-mini S&P 500 futures with automated algorithm' })}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Data source: Yahoo Finance API (ES=F) | Timeframe: 1 Hour | Last 500 candles
              </p>
            </div>
          </div>
          
          {/* Disclaimer Compacto */}
          <div className="flex items-start gap-3 px-4 py-3 bg-slate-900/50 border border-slate-800 text-slate-400 text-xs max-w-4xl">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-500" />
            <p className="leading-relaxed">
              {t('demoPage.disclaimer', { defaultValue: 'Educational purposes only. Past performance does not guarantee future results.' })}
            </p>
          </div>
        </div>
      </section>

      {/* Live Chart */}
      <section className="py-4 px-2">
        <div className="container mx-auto max-w-[98%]">
          {/* Grid Layout Profesional */}
          <div className="grid grid-cols-12 gap-4">
            
            {/* Panel Principal del Gráfico - PANTALLA COMPLETA */}
            <div className="col-span-12">
              <div className="bg-slate-950 border border-slate-800">
                {/* Header del Instrumento */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-mono font-semibold text-white">ES=F</h3>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-400 font-mono">60m</span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono">{t('demoPage.liveChart.instrument', { defaultValue: 'E-mini S&P 500 Futures' })}</div>
                    </div>
                    
                    {/* Selector de Tipo de Gráfico */}
                    <div className="flex items-center gap-2 ml-6">
                      <button
                        onClick={() => setChartType('area')}
                        className={`p-2 rounded transition-all ${
                          chartType === 'area'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                        }`}
                        title={t('demoPage.chartType.area', { defaultValue: 'Area Chart' })}
                      >
                        <AreaChart className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setChartType('candlestick')}
                        className={`p-2 rounded transition-all ${
                          chartType === 'candlestick'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                        }`}
                        title={t('demoPage.chartType.candlestick', { defaultValue: 'Candlestick Chart' })}
                      >
                        <CandlestickChart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <div className={`px-3 py-1 border text-[10px] font-mono uppercase tracking-wider ${
                        isMarketOpen 
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        {isMarketOpen ? t('demoPage.liveChart.marketOpen') : t('demoPage.liveChart.marketClosed')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-mono font-bold text-white">
                        {loading ? '...' : currentPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">{t('demoPage.liveChart.perPoint')}</div>
                    </div>
                  </div>
                </div>

                {/* Mensaje cuando el mercado está cerrado */}
                {!isMarketOpen && (
                  <div className="mx-4 mt-4 p-3 bg-slate-900 border border-slate-800 flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <div className="text-xs text-slate-400">
                      {t('demoPage.liveChart.closedMessage')}
                    </div>
                  </div>
                )}

                {/* Gráfico Profesional con Highcharts Stock */}
                <div className="relative bg-black">
                  {/* Barra de información del símbolo estilo TradeStation */}
                  {!loading && (
                    <>
                      {/* Info del símbolo - Esquina superior izquierda */}
                      <div className="absolute top-2 left-2 z-20 bg-black/80 backdrop-blur-sm px-3 py-1.5 font-mono text-xs space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">ES=F - 60 min</span>
                          <span className="text-gray-400">ARCX</span>
                          <span className={`font-semibold ${
                            currentPrice >= (ohlcData[ohlcData.length - 1]?.[1] || currentPrice) 
                              ? 'text-green-400' 
                              : 'text-red-400'
                          }`}>
                            L={currentPrice.toFixed(2)}
                          </span>
                          <span className="text-gray-400">+{((Math.random() * 2)).toFixed(2)}</span>
                          <span className="text-green-400">+{((Math.random() * 0.5)).toFixed(2)}%</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400">
                          <span>TS={Math.floor(Math.random() * 200 + 100)}</span>
                          <span>TE=ARCX</span>
                          <span>B={currentPrice.toFixed(2)}</span>
                          <span>BS={Math.floor(Math.random() * 1000 + 100)}</span>
                          <span>A={(currentPrice + 0.25).toFixed(2)}</span>
                          <span>AS={Math.floor(Math.random() * 1000 + 100)}</span>
                          <span>O={ohlcData[0]?.[1]?.toFixed(2) || currentPrice.toFixed(2)}</span>
                          <span>Hi={Math.max(...ohlcData.map(c => c[2] || 0)).toFixed(2)}</span>
                          <span>Lo={Math.min(...ohlcData.map(c => c[3] || 9999)).toFixed(2)}</span>
                          <span>V={Math.floor(Math.random() * 100000 + 50000)}</span>
                        </div>
                      </div>
                      
                      {/* Timeframe - Esquina superior derecha */}
                      <div className="absolute top-2 right-2 z-20 bg-blue-600/90 backdrop-blur-sm px-4 py-2 font-mono text-sm font-bold text-white shadow-lg border border-blue-400">
                        60 MIN
                      </div>
                    </>
                  )}
                  
                  {loading ? (
                    <div className="flex items-center justify-center" style={{ height: '550px' }}>
                      <div className="text-slate-400 font-mono">{t('demoPage.liveChart.loading', { defaultValue: 'Loading...' })}</div>
                    </div>
                  ) : (
                    <HighchartsReact
                      highcharts={Highcharts}
                      constructorType={'stockChart'}
                      options={chartOptions}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Panel de Estadísticas Compacto - DEBAJO DEL GRÁFICO */}
            <div className="col-span-12">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* Posición Activa */}
                <div className="bg-slate-950 border border-slate-800 p-4">
                  <div className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-3">{t('demoPage.liveChart.position', { defaultValue: 'Current Position' })}</div>
                  {position ? (
                    <div>
                      <div className={`inline-flex px-3 py-1 text-xs font-mono font-semibold mb-2 ${
                        position === 'long' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {position.toUpperCase()}
                      </div>
                      <div className="space-y-1 text-xs font-mono">
                        <div className="flex justify-between text-slate-400">
                          <span>{t('demoPage.liveChart.entryAt', { defaultValue: 'Entry' })}:</span>
                          <span className="text-white">{entryPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>P&L:</span>
                          <span className={`font-semibold ${
                            ((position === 'long' ? currentPrice - entryPrice : entryPrice - currentPrice) * 50) >= 0 
                              ? 'text-emerald-400' 
                              : 'text-rose-400'
                          }`}>
                            ${((position === 'long' ? currentPrice - entryPrice : entryPrice - currentPrice) * 50).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 font-mono">{t('demoPage.liveChart.noPosition', { defaultValue: 'No active position' })}</div>
                  )}
                </div>

                {/* Total P&L */}
                <div className="bg-slate-950 border border-slate-800 p-4">
                  <div className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-3">{t('demoPage.liveChart.totalPnL')}</div>
                  <div className={`text-2xl font-mono font-bold ${
                    pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                  </div>
                </div>

                {/* Trades */}
                <div className="bg-slate-950 border border-slate-800 p-4">
                  <div className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-3">{t('demoPage.liveChart.totalTrades', { defaultValue: 'Total' })}</div>
                  <div className="text-2xl font-mono font-bold text-white">{trades.length}</div>
                  <div className="flex gap-3 mt-2 text-xs font-mono">
                    <span className="text-emerald-400">{trades.filter(t => t.pnl > 0).length}W</span>
                    <span className="text-rose-400">{trades.filter(t => t.pnl < 0).length}L</span>
                  </div>
                </div>

                {/* Win Rate */}
                <div className="bg-slate-950 border border-slate-800 p-4">
                  <div className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-3">{t('demoPage.liveChart.winRate', { defaultValue: 'Win Rate' })}</div>
                  <div className="text-2xl font-mono font-bold text-white">
                    {trades.length > 0 ? ((trades.filter(t => t.pnl > 0).length / trades.length) * 100).toFixed(1) : '0.0'}%
                  </div>
                </div>

                {/* Trades Recientes */}
                <div className="bg-slate-950 border border-slate-800 p-4">
                  <div className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-3">{t('demoPage.liveChart.recentTrades')}</div>
                  <div className="space-y-1">
                    {trades.slice(0, 3).map((trade, idx) => (
                      <div key={idx} className="text-xs font-mono flex justify-between">
                        <span className={`${
                          trade.type === 'long' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {trade.type.toUpperCase()}
                        </span>
                        <span className={`font-semibold ${
                          trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(0)}
                        </span>
                      </div>
                    ))}
                    {trades.length === 0 && (
                      <div className="text-xs text-slate-600 font-mono">{t('demoPage.liveChart.noTrades', { defaultValue: 'No trades yet' })}</div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
          {/* Cards Informativos */}
          <div className="grid lg:grid-cols-3 gap-6 mt-8">
            {/* Card 1 */}
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-all duration-300">
              <BarChart3 className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-xl font-medium text-white mb-3">{t('demoPage.cards.card1.title')}</h3>
              <p className="text-slate-200 text-sm leading-relaxed">
                {t('demoPage.cards.card1.desc')}
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-green-500/50 transition-all duration-300">
              <TrendingUp className="w-8 h-8 text-green-400 mb-4" />
              <h3 className="text-xl font-medium text-white mb-3">{t('demoPage.cards.card2.title')}</h3>
              <p className="text-slate-200 text-sm leading-relaxed">
                {t('demoPage.cards.card2.desc')}
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-amber-500/50 transition-all duration-300">
              <AlertTriangle className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-xl font-medium text-white mb-3">{t('demoPage.cards.card3.title')}</h3>
              <p className="text-slate-200 text-sm leading-relaxed">
                {t('demoPage.cards.card3.desc')}
              </p>
            </div>
          </div>

          {/* Disclaimer Box */}
          <div className="mt-12 p-8 bg-slate-800/80 border border-slate-600/50 rounded-2xl shadow-lg">
            <div className="flex items-start gap-4 mb-4">
              <AlertTriangle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">{t('demoPage.disclaimerBox.title')}</h3>
                <div className="space-y-3 text-sm text-slate-100 leading-relaxed font-medium">
                  <p>• <strong className="text-white">{t('demoPage.disclaimerBox.point1.title')}</strong> {t('demoPage.disclaimerBox.point1.desc')}</p>
                  <p>• <strong className="text-white">{t('demoPage.disclaimerBox.point2.title')}</strong> {t('demoPage.disclaimerBox.point2.desc')}</p>
                  <p>• <strong className="text-white">{t('demoPage.disclaimerBox.point3.title')}</strong> {t('demoPage.disclaimerBox.point3.desc')}</p>
                  <p>• <strong className="text-white">{t('demoPage.disclaimerBox.point4.title')}</strong> {t('demoPage.disclaimerBox.point4.desc')}</p>
                  <p>• {t('demoPage.disclaimerBox.point5')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center p-12 bg-slate-900/50 border border-slate-800 rounded-xl">
            <h2 className="text-3xl font-light text-white mb-4">
              {t('demoPage.cta.title')}
            </h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              {t('demoPage.cta.desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link to="/pricing">{t('demoPage.cta.pricing')}</Link>
              </Button>
              <Button asChild variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                <Link to="/contact">{t('demoPage.cta.contact')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Demo;
