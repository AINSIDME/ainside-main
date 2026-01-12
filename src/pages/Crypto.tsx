import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Activity, BarChart3, Zap, Globe, Shield, ChevronUp, ChevronDown } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";
import { Link } from "react-router-dom";

interface CryptoData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  volumeChange: number;
  high24h: number;
  low24h: number;
  lastUpdate: string;
  score?: number;
  strength?: number;
  signal?: string;
  signalPrice?: number;
  signalTimestamp?: number;
  atr?: number;
}

interface AdvancedCryptoData extends CryptoData {
  rsi?: number;
  macd?: { value: number; signal: number; histogram: number };
  bb?: { upper: number; middle: number; lower: number };
  ema?: { ema12: number; ema26: number };
  momentum?: number;
  trend?: 'bullish' | 'bearish' | 'neutral';
  pattern?: string;
}

const Crypto = () => {
  const { t } = useTranslation();
  const [cryptoData, setCryptoData] = useState<AdvancedCryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("gainers");
  const [marketSentiment, setMarketSentiment] = useState<{
    score: number;
    label: string;
    trend: 'bullish' | 'neutral' | 'bearish';
    strength: number;
  }>({ score: 50, label: 'Neutral', trend: 'neutral', strength: 0 });
  const volumeHistoryRef = useRef<{ [key: string]: number[] }>({});
  const signalTimestampsRef = useRef<{ [key: string]: { signal: string; timestamp: number; price: number } }>({});

  // Obtener datos reales de Binance API
  useEffect(() => {
    const symbols = [
      "BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT",
      "ADAUSDT", "AVAXUSDT", "DOGEUSDT", "DOTUSDT", "MATICUSDT",
      "LINKUSDT", "UNIUSDT", "ATOMUSDT", "LTCUSDT", "ETCUSDT"
    ];

    const fetchLiveData = async () => {
      try {
        // Obtener datos de ticker de 24h de Binance
        const responses = await Promise.all(
          symbols.map(symbol =>
            fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
              .then(res => res.json())
              .catch(() => null)
          )
        );

        const newData: AdvancedCryptoData[] = responses
          .filter(data => data && !data.code) // Filtrar errores
          .map((data, index) => {
            const symbol = data.symbol.replace('USDT', '/USDT');
            const currentVolume = parseFloat(data.quoteVolume);
            const currentPrice = parseFloat(data.lastPrice);
            
            // Encontrar datos previos para este símbolo
            const prevData = cryptoData.find(c => c.symbol === symbol);
            
            // Mantener historial de volúmenes (últimos 100 registros = ~5 minutos)
            if (!volumeHistoryRef.current[symbol]) {
              volumeHistoryRef.current[symbol] = [];
            }
            
            volumeHistoryRef.current[symbol].push(currentVolume);
            
            // Mantener solo los últimos 100 valores
            if (volumeHistoryRef.current[symbol].length > 100) {
              volumeHistoryRef.current[symbol].shift();
            }
            
            // Calcular volumen promedio de los primeros registros vs actuales
            let volumeChange = 0;
            const history = volumeHistoryRef.current[symbol];
            
            if (history.length >= 20) {
              // Comparar promedio de los últimos 10 vs los primeros 10
              const recentAvg = history.slice(-10).reduce((a, b) => a + b, 0) / 10;
              const oldAvg = history.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
              
              if (oldAvg > 0) {
                volumeChange = ((recentAvg - oldAvg) / oldAvg) * 100;
              }
            }

            // Calcular ATR simplificado
            const atr = data.highPrice - data.lowPrice;
            const atrPercent = (atr / currentPrice) * 100;

            // Calcular strength basado en múltiples factores
            const priceChangeAbs = Math.abs(parseFloat(data.priceChangePercent));
            const volumeStrength = Math.min(volumeChange / 2, 30); // Max 30 puntos por volumen
            const priceStrength = Math.min(priceChangeAbs * 5, 40); // Max 40 puntos por precio
            const strength = Math.round(Math.min(volumeStrength + priceStrength, 100));

            // Score más sofisticado
            let score = 50; // Base score
            
            // Bonus por cambio de precio positivo
            if (parseFloat(data.priceChangePercent) > 2) score += 15;
            else if (parseFloat(data.priceChangePercent) > 1) score += 10;
            else if (parseFloat(data.priceChangePercent) > 0) score += 5;
            
            // Penalty por cambio negativo
            if (parseFloat(data.priceChangePercent) < -2) score -= 15;
            else if (parseFloat(data.priceChangePercent) < -1) score -= 10;
            else if (parseFloat(data.priceChangePercent) < 0) score -= 5;
            
            // Bonus por volumen alto
            if (volumeChange > 50) score += 20;
            else if (volumeChange > 20) score += 10;
            else if (volumeChange > 10) score += 5;
            
            // Ajustar score entre 0-100
            score = Math.max(0, Math.min(100, score));

            // Determinar señal con lógica más flexible
            let signal = 'Neutral';
            const priceChange = parseFloat(data.priceChangePercent);
            
            // Long: precio subiendo con buen volumen o muy fuerte movimiento
            if ((priceChange > 1.5 && volumeChange > 10) || (priceChange > 3)) {
              signal = 'Long';
            }
            // Short: precio bajando con buen volumen o muy fuerte caída
            else if ((priceChange < -1.5 && volumeChange > 10) || (priceChange < -3)) {
              signal = 'Short';
            }
            // Neutral con tendencia
            else if (priceChange > 0.5) {
              signal = 'Long';
            }
            else if (priceChange < -0.5) {
              signal = 'Short';
            }

            // Detectar patrones técnicos (umbrales reducidos para mayor detección)
            let pattern = '';
            const priceRange = parseFloat(data.highPrice) - parseFloat(data.lowPrice);
            const priceRangePercent = (priceRange / currentPrice) * 100;
            const closeNearHigh = priceRange > 0 ? (currentPrice - parseFloat(data.lowPrice)) / priceRange > 0.75 : false;
            const closeNearLow = priceRange > 0 ? (currentPrice - parseFloat(data.lowPrice)) / priceRange < 0.25 : false;

            // Breakout (precio cerca del máximo + volumen o momentum)
            if (closeNearHigh && (volumeChange > 15 || priceChange > 1.5)) {
              pattern = 'Breakout';
            }
            // Breakdown (precio cerca del mínimo + volumen o momentum)
            else if (closeNearLow && (volumeChange > 15 || priceChange < -1.5)) {
              pattern = 'Breakdown';
            }
            // Strong Uptrend (precio subiendo fuerte)
            else if (priceChange > 2.5) {
              pattern = 'Strong Up';
            }
            // Strong Downtrend (precio bajando fuerte)
            else if (priceChange < -2.5) {
              pattern = 'Strong Down';
            }
            // Volume Spike (volumen muy alto)
            else if (volumeChange > 50 && Math.abs(priceChange) < 3) {
              pattern = 'Volume Spike';
            }
            // Bullish momentum
            else if (priceChange > 1 && volumeChange > 10) {
              pattern = 'Bullish';
            }
            // Bearish momentum
            else if (priceChange < -1 && volumeChange > 10) {
              pattern = 'Bearish';
            }
            // Consolidation (rango estrecho)
            else if (priceRangePercent < 2.5 && Math.abs(priceChange) < 0.8) {
              pattern = 'Consolidation';
            }
            // Trending up
            else if (priceChange > 0.5) {
              pattern = 'Trending Up';
            }
            // Trending down
            else if (priceChange < -0.5) {
              pattern = 'Trending Down';
            }

            // Usar el ref para mantener timestamps persistentes
            const SIGNAL_VALIDITY_MS = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
            const finalSignal = signal;
            let finalSignalPrice = signal !== 'Neutral' ? currentPrice : undefined;
            let finalSignalTimestamp = signal !== 'Neutral' ? Date.now() : undefined;

            // Verificar si hay timestamp almacenado en el ref
            const storedSignal = signalTimestampsRef.current[symbol];
            
            if (signal !== 'Neutral') {
              // Si existe un timestamp previo Y la señal es la MISMA
              if (storedSignal && storedSignal.signal === signal) {
                const timeElapsed = Date.now() - storedSignal.timestamp;
                
                // Si NO ha expirado (menos de 24 horas), mantener el timestamp original
                if (timeElapsed < SIGNAL_VALIDITY_MS) {
                  finalSignalTimestamp = storedSignal.timestamp;
                  finalSignalPrice = storedSignal.price;
                } else {
                  // Señal expirada, crear nueva
                  finalSignalTimestamp = Date.now();
                  finalSignalPrice = currentPrice;
                  signalTimestampsRef.current[symbol] = {
                    signal,
                    timestamp: finalSignalTimestamp,
                    price: finalSignalPrice
                  };
                }
              } else {
                // Nueva señal o señal diferente
                finalSignalTimestamp = Date.now();
                finalSignalPrice = currentPrice;
                signalTimestampsRef.current[symbol] = {
                  signal,
                  timestamp: finalSignalTimestamp,
                  price: finalSignalPrice
                };
              }
            } else {
              // Si la señal es Neutral, limpiar el timestamp almacenado
              if (storedSignal) {
                delete signalTimestampsRef.current[symbol];
              }
            }

            return {
              symbol,
              price: currentPrice,
              change24h: parseFloat(data.priceChangePercent),
              volume24h: currentVolume,
              volumeChange: volumeChange,
              high24h: parseFloat(data.highPrice),
              low24h: parseFloat(data.lowPrice),
              lastUpdate: new Date().toISOString(),
              atr: atrPercent,
              strength,
              score,
              signal: finalSignal,
              signalPrice: finalSignalPrice,
              signalTimestamp: finalSignalTimestamp,
              pattern
            };
          });

        setCryptoData(newData);
        
        // Calcular sentimiento del mercado (AI-based)
        if (newData.length > 0) {
          const avgChange = newData.reduce((sum, c) => sum + c.change24h, 0) / newData.length;
          const avgScore = newData.reduce((sum, c) => sum + (c.score || 50), 0) / newData.length;
          const longSignals = newData.filter(c => c.signal === 'Long').length;
          const shortSignals = newData.filter(c => c.signal === 'Short').length;
          const totalSignals = longSignals + shortSignals;
          const bullishRatio = totalSignals > 0 ? longSignals / totalSignals : 0.5;
          
          // Score ponderado: 40% cambio precio, 30% score promedio, 30% señales
          const sentimentScore = Math.round(
            (avgChange * 10 + 50) * 0.4 + 
            avgScore * 0.3 + 
            bullishRatio * 100 * 0.3
          );
          
          const clampedScore = Math.max(0, Math.min(100, sentimentScore));
          const strength = Math.abs(clampedScore - 50) * 2; // 0-100
          
          let label = 'Neutral';
          let trend: 'bullish' | 'neutral' | 'bearish' = 'neutral';
          
          if (clampedScore >= 65) {
            label = clampedScore >= 80 ? 'Extremely Bullish' : 'Bullish';
            trend = 'bullish';
          } else if (clampedScore <= 35) {
            label = clampedScore <= 20 ? 'Extremely Bearish' : 'Bearish';
            trend = 'bearish';
          } else if (clampedScore > 50) {
            label = 'Slightly Bullish';
            trend = 'bullish';
          } else if (clampedScore < 50) {
            label = 'Slightly Bearish';
            trend = 'bearish';
          }
          
          setMarketSentiment({ score: clampedScore, label, trend, strength });
        }
        
        setIsLoading(false);
        setError(null);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
        setError('Failed to load market data. Retrying...');
        setIsLoading(false);
      }
    };

    // Cargar datos inmediatamente
    fetchLiveData();

    // Actualizar cada 10 segundos para actualizaciones estables
    const interval = setInterval(fetchLiveData, 10000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return price < 1 
      ? `$${price.toFixed(6)}` 
      : `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  const formatTimeElapsed = (timestamp: number) => {
    const now = Date.now();
    const elapsed = now - timestamp;
    
    if (elapsed < 0) return '0m';
    
    const hours = Math.floor(elapsed / (60 * 60 * 1000));
    const minutes = Math.floor((elapsed % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getFilteredData = () => {
    switch (selectedTab) {
      case "gainers":
        return [...cryptoData].sort((a, b) => b.change24h - a.change24h).slice(0, 10);
      case "losers":
        return [...cryptoData].sort((a, b) => a.change24h - b.change24h).slice(0, 10);
      case "volume":
        return [...cryptoData].sort((a, b) => b.volumeChange - a.volumeChange).slice(0, 10);
      default:
        return cryptoData;
    }
  };

  return (
    <>
      <PageSEO
        title={t('cryptoPage.seo.title')}
        description={t('cryptoPage.seo.description')}
        canonical="/crypto"
        ogType="website"
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-900/95 to-slate-950/98 backdrop-blur-sm">
        {/* Hero Section */}
        <section className="relative py-32 px-4 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/98 backdrop-blur-sm">
          <div className="container mx-auto text-center max-w-5xl">
            <div className="inline-block px-6 py-3 text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 rounded-full mb-8 tracking-wide uppercase border border-blue-500/30 backdrop-blur-sm shadow-lg">
              <Activity className="w-3 h-3 inline mr-2" />
              {t('cryptoPage.hero.badge')}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-light text-slate-100 mb-8 leading-[1.1] tracking-tight">
              {t('cryptoPage.hero.title')}
              <br />
              <span className="font-normal bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {t('cryptoPage.hero.titleHighlight')}
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              {t('cryptoPage.hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-200 border-0">
                <Link to="/demo">
                  {t('cryptoPage.hero.ctaDemo')}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 border-slate-600/40 text-slate-200 hover:bg-slate-700/50 rounded-xl font-medium backdrop-blur-sm hover:border-slate-500/50 transition-all duration-200">
                <Link to="/pricing">{t('cryptoPage.hero.ctaPricing')}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Market Overview */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-[1600px]">
            {/* AI Market Sentiment Bar */}
            <div className="mb-12">
              <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-shimmer" 
                     style={{ backgroundSize: '200% 100%' }} />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Activity className="w-5 h-5 text-blue-400" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-light text-slate-100">{t('cryptoPage.sentiment.title')}</h3>
                        <p className="text-xs text-slate-400">Real-time analysis powered by advanced algorithms</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-light text-slate-100 mb-1">{marketSentiment.score}</div>
                      <Badge
                        variant="outline"
                        className={
                          marketSentiment.trend === 'bullish'
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : marketSentiment.trend === 'bearish'
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : "bg-slate-700/30 text-slate-400 border-slate-600/30"
                        }
                      >
                        {marketSentiment.label}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Neon Sentiment Bar */}
                  <div className="relative h-8 bg-slate-900/50 rounded-full overflow-hidden border border-slate-700/50">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 via-slate-500/20 to-emerald-500/20" />
                    
                    {/* Animated glow effect */}
                    <div 
                      className="absolute inset-y-0 left-0 transition-all duration-1000 ease-out"
                      style={{
                        width: `${marketSentiment.score}%`,
                        background: marketSentiment.trend === 'bullish'
                          ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.6) 50%, rgba(16, 185, 129, 0.3) 100%)'
                          : marketSentiment.trend === 'bearish'
                          ? 'linear-gradient(90deg, rgba(244, 63, 94, 0.3) 0%, rgba(244, 63, 94, 0.6) 50%, rgba(244, 63, 94, 0.3) 100%)'
                          : 'linear-gradient(90deg, rgba(100, 116, 139, 0.3) 0%, rgba(100, 116, 139, 0.6) 50%, rgba(100, 116, 139, 0.3) 100%)',
                        boxShadow: marketSentiment.trend === 'bullish'
                          ? `0 0 20px rgba(16, 185, 129, ${0.3 + marketSentiment.strength / 200}), inset 0 0 20px rgba(16, 185, 129, ${0.2 + marketSentiment.strength / 300})`
                          : marketSentiment.trend === 'bearish'
                          ? `0 0 20px rgba(244, 63, 94, ${0.3 + marketSentiment.strength / 200}), inset 0 0 20px rgba(244, 63, 94, ${0.2 + marketSentiment.strength / 300})`
                          : '0 0 10px rgba(100, 116, 139, 0.2)'
                      }}
                    >
                      {/* Neon edge */}
                      <div 
                        className="absolute right-0 inset-y-0 w-1 transition-all duration-1000"
                        style={{
                          background: marketSentiment.trend === 'bullish'
                            ? 'linear-gradient(180deg, transparent, rgba(16, 185, 129, 1), transparent)'
                            : marketSentiment.trend === 'bearish'
                            ? 'linear-gradient(180deg, transparent, rgba(244, 63, 94, 1), transparent)'
                            : 'linear-gradient(180deg, transparent, rgba(100, 116, 139, 1), transparent)',
                          boxShadow: marketSentiment.trend === 'bullish'
                            ? `0 0 10px rgba(16, 185, 129, ${0.8 + marketSentiment.strength / 100}), 0 0 20px rgba(16, 185, 129, ${0.5 + marketSentiment.strength / 150})`
                            : marketSentiment.trend === 'bearish'
                            ? `0 0 10px rgba(244, 63, 94, ${0.8 + marketSentiment.strength / 100}), 0 0 20px rgba(244, 63, 94, ${0.5 + marketSentiment.strength / 150})`
                            : '0 0 5px rgba(100, 116, 139, 0.5)'
                        }}
                      />
                    </div>
                    
                    {/* Scale markers */}
                    <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] text-slate-500 font-medium">
                      <span>Bearish</span>
                      <span>Neutral</span>
                      <span>Bullish</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Strength: {marketSentiment.strength.toFixed(0)}%
                    </span>
                    <span>Updated every 10s</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
              <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    {t('cryptoPage.stats.topGainer')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!isLoading && cryptoData.length > 0 && (
                    <>
                      <div className="text-2xl font-light text-slate-100">
                        {[...cryptoData].sort((a, b) => b.change24h - a.change24h)[0]?.symbol}
                      </div>
                      <div className="text-sm text-green-400 flex items-center gap-1 mt-2">
                        <ArrowUpRight className="w-4 h-4" />
                        +{[...cryptoData].sort((a, b) => b.change24h - a.change24h)[0]?.change24h.toFixed(2)}%
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <ArrowDownRight className="w-4 h-4" />
                    {t('cryptoPage.stats.topLoser')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!isLoading && cryptoData.length > 0 && (
                    <>
                      <div className="text-2xl font-light text-slate-100">
                        {[...cryptoData].sort((a, b) => a.change24h - b.change24h)[0]?.symbol}
                      </div>
                      <div className="text-sm text-red-400 flex items-center gap-1 mt-2">
                        <ArrowDownRight className="w-4 h-4" />
                        {[...cryptoData].sort((a, b) => a.change24h - b.change24h)[0]?.change24h.toFixed(2)}%
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    {t('cryptoPage.stats.volumeLeader')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!isLoading && cryptoData.length > 0 && (
                    <>
                      <div className="text-2xl font-light text-slate-100">
                        {[...cryptoData].sort((a, b) => b.volume24h - a.volume24h)[0]?.symbol}
                      </div>
                      <div className="text-sm text-blue-400 flex items-center gap-1 mt-2">
                        {formatVolume([...cryptoData].sort((a, b) => b.volume24h - a.volume24h)[0]?.volume24h)}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    {t('cryptoPage.stats.volumeSpike')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!isLoading && cryptoData.length > 0 && (
                    <>
                      <div className="text-2xl font-light text-slate-100">
                        {[...cryptoData].sort((a, b) => b.volumeChange - a.volumeChange)[0]?.symbol}
                      </div>
                      <div className="text-sm text-yellow-400 flex items-center gap-1 mt-2">
                        +{[...cryptoData].sort((a, b) => b.volumeChange - a.volumeChange)[0]?.volumeChange.toFixed(0)}%
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Market Screener */}
            <Card className="w-full bg-slate-800/40 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-light text-slate-100">{t('cryptoPage.screener.title')}</CardTitle>
                    <CardDescription className="text-slate-400 mt-2">
                      {t('cryptoPage.screener.description')}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    {t('cryptoPage.screener.liveData')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8 bg-slate-900/50 border border-slate-700/50">
                    <TabsTrigger value="gainers" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-slate-700/50 data-[state=active]:text-blue-400">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                      {t('cryptoPage.screener.tabs.gainers')}
                    </TabsTrigger>
                    <TabsTrigger value="losers" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-slate-700/50 data-[state=active]:text-blue-400">
                      <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      {t('cryptoPage.screener.tabs.losers')}
                    </TabsTrigger>
                    <TabsTrigger value="volume" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-slate-700/50 data-[state=active]:text-blue-400">
                      <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                      {t('cryptoPage.screener.tabs.volume')}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={selectedTab} className="mt-0">
                    {/* Mobile Card View */}
                    <div className="block lg:hidden space-y-4">
                      {isLoading ? (
                        <div className="text-center py-12 text-slate-500">
                          <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            {t('cryptoPage.table.loading')}
                          </div>
                        </div>
                      ) : error ? (
                        <div className="text-center py-12">
                          <div className="flex flex-col items-center gap-3">
                            <div className="text-red-400">{error}</div>
                            <div className="text-sm text-slate-500">Attempting to reconnect...</div>
                          </div>
                        </div>
                      ) : (
                        getFilteredData().map((crypto, index) => (
                          <Card key={index} className="bg-slate-800/40 border-slate-700/50">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center">
                                    <span className="text-xs font-semibold text-blue-400">
                                      {crypto.symbol.split('/')[0].substring(0, 3)}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-slate-200 text-sm">{crypto.symbol}</div>
                                    <div className="font-mono text-slate-300 text-xs">{formatPrice(crypto.price)}</div>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-500 text-white border-0 text-xs px-3 py-1"
                                  onClick={() => {
                                    const tradingViewSymbol = crypto.symbol.replace('/', '');
                                    window.open(`https://www.tradingview.com/chart/?symbol=BINANCE:${tradingViewSymbol}`, '_blank');
                                  }}
                                >
                                  {t('cryptoPage.table.trade')}
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                  <div className="text-xs text-slate-400 mb-1">24h Change</div>
                                  <div className={`flex items-center gap-1 font-medium text-sm ${
                                    crypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                    {crypto.change24h >= 0 ? (
                                      <ArrowUpRight className="w-3 h-3" />
                                    ) : (
                                      <ArrowDownRight className="w-3 h-3" />
                                    )}
                                    {Math.abs(crypto.change24h).toFixed(2)}%
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-400 mb-1">Volume</div>
                                  <div className="font-mono text-slate-300 text-sm">{formatVolume(crypto.volume24h)}</div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-xs text-slate-400">Score</div>
                                <Badge
                                  variant="outline"
                                  className={
                                    crypto.score && crypto.score > 70
                                      ? "bg-green-500/10 text-green-400 border-green-500/30 text-xs"
                                      : crypto.score && crypto.score > 50
                                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs"
                                      : "bg-slate-800/50 text-slate-400 border-slate-700/50 text-xs"
                                  }
                                >
                                  {crypto.score}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-xs text-slate-400">Signal</div>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      crypto.signal === 'Long'
                                        ? 'bg-emerald-500'
                                        : crypto.signal === 'Short'
                                        ? 'bg-rose-500'
                                        : 'bg-slate-600'
                                    }`}
                                    style={{
                                      opacity: crypto.signal === 'Neutral'
                                        ? 0.3
                                        : Math.min(0.4 + (crypto.strength / 100) * 0.6, 1),
                                      boxShadow: crypto.signal === 'Long'
                                        ? `0 0 8px rgba(16, 185, 129, 0.6)`
                                        : crypto.signal === 'Short'
                                        ? `0 0 8px rgba(244, 63, 94, 0.6)`
                                        : 'none'
                                    }}
                                  />
                                  <span className="text-xs text-slate-300">{crypto.signal}</span>
                                </div>
                              </div>
                              
                              {crypto.signalTimestamp && crypto.signal !== 'Neutral' && (
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-xs text-slate-400">Tiempo activa</div>
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs"
                                  >
                                    ⏱️ {formatTimeElapsed(crypto.signalTimestamp)}
                                  </Badge>
                                </div>
                              )}
                              
                              {crypto.pattern && (
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-slate-400">Pattern</div>
                                  <Badge
                                    variant="outline"
                                    className={
                                      crypto.pattern.includes('Breakout') || crypto.pattern.includes('Bullish') || crypto.pattern.includes('Up')
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs"
                                        : crypto.pattern.includes('Breakdown') || crypto.pattern.includes('Bearish') || crypto.pattern.includes('Down')
                                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30 text-xs"
                                        : crypto.pattern.includes('Volume')
                                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-xs"
                                        : crypto.pattern.includes('Strong')
                                        ? "bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs"
                                        : "bg-slate-700/30 text-slate-400 border-slate-600/30 text-xs"
                                    }
                                  >
                                    {crypto.pattern}
                                  </Badge>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                    
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <div className="w-full">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-700/50">
                              <th className="text-left py-2 px-2 font-medium text-slate-400 text-xs">{t('cryptoPage.table.headers.symbol')}</th>
                              <th className="text-right py-2 px-2 font-medium text-slate-400 text-xs">{t('cryptoPage.table.headers.price')}</th>
                              <th className="text-right py-2 px-2 font-medium text-slate-400 text-xs">{t('cryptoPage.table.headers.change24h')}</th>
                              <th className="text-right py-2 px-2 font-medium text-slate-400 text-xs">{t('cryptoPage.table.headers.volume24h')}</th>
                              <th className="text-right py-2 px-2 font-medium text-slate-400 text-xs">{t('cryptoPage.table.headers.volChange')}</th>
                              <th className="text-center py-2 px-2 font-medium text-slate-400 text-xs">{t('cryptoPage.table.headers.strength')}</th>
                              <th className="text-center py-2 px-2 font-medium text-slate-400 text-xs">{t('cryptoPage.table.headers.score')}</th>
                              <th className="text-center py-2 px-2 font-medium text-slate-400 text-xs">{t('cryptoPage.table.headers.signal')}</th>
                              <th className="text-center py-2 px-2 font-medium text-slate-400 text-xs">{t('cryptoPage.table.headers.time')}</th>
                              <th className="text-center py-2 px-2 font-medium text-slate-400 text-xs">{t('cryptoPage.table.headers.pattern')}</th>
                              <th className="text-right py-2 px-2 font-medium text-slate-400 text-xs">{t('cryptoPage.table.headers.atr')}</th>
                              <th className="text-center py-2 px-2 font-medium text-slate-400 text-xs">{t('cryptoPage.table.headers.action')}</th>
                            </tr>
                          </thead>
                        <tbody>
                          {isLoading ? (
                            <tr>
                              <td colSpan={11} className="text-center py-12 text-slate-500">
                                <div className="flex flex-col items-center gap-3">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                  {t('cryptoPage.table.loading')}
                                </div>
                              </td>
                            </tr>
                          ) : error ? (
                            <tr>
                              <td colSpan={12} className="text-center py-12">
                                <div className="flex flex-col items-center gap-3">
                                  <div className="text-red-400">{error}</div>
                                  <div className="text-sm text-slate-500">Attempting to reconnect...</div>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            getFilteredData().map((crypto, index) => (
                              <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                <td className="py-2 px-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center">
                                      <span className="text-[10px] font-semibold text-blue-400">
                                        {crypto.symbol.split('/')[0].substring(0, 3)}
                                      </span>
                                    </div>
                                    <span className="font-medium text-slate-200 text-xs">{crypto.symbol}</span>
                                  </div>
                                </td>
                                <td className="text-right py-2 px-2 font-mono text-slate-200 text-xs">
                                  {formatPrice(crypto.price)}
                                </td>
                                <td className="text-right py-2 px-2">
                                  <span
                                    className={`flex items-center justify-end gap-1 font-medium text-xs ${
                                      crypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                                    }`}
                                  >
                                    {crypto.change24h >= 0 ? (
                                      <ArrowUpRight className="w-3 h-3" />
                                    ) : (
                                      <ArrowDownRight className="w-3 h-3" />
                                    )}
                                    {Math.abs(crypto.change24h).toFixed(2)}%
                                  </span>
                                </td>
                                <td className="text-right py-2 px-2 font-mono text-slate-300 text-xs">
                                  {formatVolume(crypto.volume24h)}
                                </td>
                                <td className="text-right py-2 px-2">
                                  <Badge
                                    variant={crypto.volumeChange > 100 ? "default" : "outline"}
                                    className={
                                      crypto.volumeChange > 100
                                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20 text-xs"
                                        : "bg-slate-800/50 text-slate-400 border-slate-700/50 text-xs"
                                    }
                                  >
                                    {crypto.volumeChange > 0 ? '+' : ''}
                                    {crypto.volumeChange.toFixed(0)}%
                                  </Badge>
                                </td>
                                <td className="text-center py-2 px-2">
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-12 h-2 bg-slate-700 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                                        style={{ width: `${crypto.strength}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-slate-400">{crypto.strength}%</span>
                                  </div>
                                </td>
                                <td className="text-center py-2 px-2">
                                  <Badge
                                    variant="outline"
                                    className={
                                      crypto.score && crypto.score > 70
                                        ? "bg-green-500/10 text-green-400 border-green-500/30 text-xs"
                                        : crypto.score && crypto.score > 50
                                        ? "bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs"
                                        : "bg-slate-800/50 text-slate-400 border-slate-700/50 text-xs"
                                    }
                                  >
                                    {crypto.score}
                                  </Badge>
                                </td>
                                <td className="text-center py-2 px-2">
                                  <div className="flex justify-center">
                                    <div 
                                      className={`w-3 h-3 rounded-full shadow-lg ${
                                        crypto.signal === 'Long'
                                          ? 'bg-emerald-500'
                                          : crypto.signal === 'Short'
                                          ? 'bg-rose-500'
                                          : 'bg-slate-600'
                                      }`}
                                      style={{
                                        opacity: crypto.signal === 'Neutral' 
                                          ? 0.3 
                                          : Math.min(0.4 + (crypto.strength / 100) * 0.6, 1),
                                        boxShadow: crypto.signal === 'Long'
                                          ? `0 0 ${Math.floor(8 + (crypto.strength / 100) * 12)}px rgba(16, 185, 129, ${0.4 + (crypto.strength / 100) * 0.6})`
                                          : crypto.signal === 'Short'
                                          ? `0 0 ${Math.floor(8 + (crypto.strength / 100) * 12)}px rgba(244, 63, 94, ${0.4 + (crypto.strength / 100) * 0.6})`
                                          : '0 0 4px rgba(71, 85, 105, 0.3)'
                                      }}
                                      title={`Strength: ${crypto.strength.toFixed(1)}%`}
                                    />
                                  </div>
                                </td>
                                <td className="text-center py-2 px-2">
                                  {crypto.signalTimestamp && crypto.signal !== 'Neutral' ? (
                                    <Badge
                                      variant="outline"
                                      className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs"
                                    >
                                      ⏱️ {formatTimeElapsed(crypto.signalTimestamp)}
                                    </Badge>
                                  ) : (
                                    <span className="text-slate-600 text-xs">-</span>
                                  )}
                                </td>
                                <td className="text-center py-2 px-2">
                                  {crypto.pattern ? (
                                    <Badge
                                      variant="outline"
                                      className={
                                        crypto.pattern.includes('Breakout') || crypto.pattern.includes('Bullish')
                                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs whitespace-nowrap"
                                          : crypto.pattern.includes('Breakdown') || crypto.pattern.includes('Bearish')
                                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30 text-xs whitespace-nowrap"
                                          : crypto.pattern.includes('Volume Spike')
                                          ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-xs whitespace-nowrap"
                                          : crypto.pattern.includes('Strong')
                                          ? "bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs whitespace-nowrap"
                                          : "bg-slate-700/30 text-slate-400 border-slate-600/30 text-xs whitespace-nowrap"
                                      }
                                    >
                                      {crypto.pattern}
                                    </Badge>
                                  ) : (
                                    <span className="text-slate-600 text-xs">-</span>
                                  )}
                                </td>
                                <td className="text-right py-2 px-2 font-mono text-slate-300 text-xs">
                                  {crypto.atr?.toFixed(2)}%
                                </td>
                                <td className="text-center py-2 px-2">
                                  <Button 
                                    size="sm" 
                                    className="bg-blue-600 hover:bg-blue-500 text-white border-0 text-xs px-2"
                                    onClick={() => {
                                      const tradingViewSymbol = crypto.symbol.replace('/', '');
                                      window.open(`https://www.tradingview.com/chart/?symbol=BINANCE:${tradingViewSymbol}`, '_blank');
                                    }}
                                  >
                                    {t('cryptoPage.table.trade')}
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
              <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-200">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                    <Activity className="w-6 h-6 text-blue-400" />
                  </div>
                  <CardTitle className="text-xl font-light text-slate-100">Real-time Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 leading-relaxed">
                    Professional-grade market data with 10-second updates, ensuring accuracy and stability for informed trading decisions.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-200">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                  </div>
                  <CardTitle className="text-xl font-light text-slate-100">Volume Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 leading-relaxed">
                    Advanced volume detection algorithms to identify significant market movements and opportunities.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-200">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <CardTitle className="text-xl font-light text-slate-100">Smart Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 leading-relaxed">
                    Automated alerts for price movements, volume spikes, and custom trading signals.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/50 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
              <CardContent className="relative py-16 px-8 text-center">
                <div className="inline-block px-6 py-3 text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 rounded-full mb-6 tracking-wide uppercase border border-blue-500/30">
                  Get Started Today
                </div>
                <h2 className="text-4xl md:text-5xl font-light text-slate-100 mb-6">
                  Ready to Trade Smarter?
                </h2>
                <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of traders using advanced analytics and real-time market data to make informed decisions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-200 border-0">
                    <Link to="/pricing">View Pricing Plans</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 border-slate-600/40 text-slate-200 hover:bg-slate-700/50 rounded-xl font-medium backdrop-blur-sm hover:border-slate-500/50 transition-all duration-200">
                    <Link to="/contact">Contact Sales</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
};

export default Crypto;
