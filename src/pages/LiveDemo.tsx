import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import { LiveChart } from "@/components/trading/LiveChart";
import { MarketStatus } from "@/components/trading/MarketStatus";
import { DemoControls } from "@/components/trading/DemoControls";
import { TrendingUp, Activity, DollarSign, BarChart3, Clock } from "lucide-react";

const LiveDemo = () => {
  console.log('LiveDemo: Component rendering');
  const { t } = useTranslation();
  
  // Estados para el control del demo
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [overlays, setOverlays] = useState({
    vwap: true,
    hilo: false,
    riskBox: false
  });

  // Datos basados en backtest real de Mini S&P 500
  const performanceMetrics = [
    { 
      label: "P&L Neto", 
      value: "$6,437.50", 
      change: "+45.56%", 
      trend: "up",
      icon: DollarSign
    },
    { 
      label: "Contratos Activos", 
      value: "1", 
      change: "Mini ES", 
      trend: "neutral",
      icon: BarChart3
    },
    { 
      label: "Win Rate", 
      value: "87.32%", 
      change: "339 trades", 
      trend: "up",
      icon: TrendingUp
    },
    { 
      label: "Profit Factor", 
      value: "2.19", 
      change: "Período: 3 días", 
      trend: "up",
      icon: Clock
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900/95 to-slate-950/98 backdrop-blur-sm">
      {/* Header */}
      <section className="relative py-32 px-4 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/98 backdrop-blur-sm">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="inline-block px-6 py-3 text-xs font-semibold bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-200 rounded-full mb-8 tracking-wide uppercase border border-green-500/30 backdrop-blur-sm shadow-lg">
            {t('demo.live')} EN VIVO
          </div>
          <h1 className="text-5xl md:text-7xl font-light text-slate-100 mb-8 leading-[1.1] tracking-tight">
            Mini S&P 500
            <br />
            <span className="font-normal bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Live Trading
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Sistema de trading en tiempo real con análisis profesional y ejecución automatizada
          </p>
        </div>
      </section>

      {/* Live Trading Dashboard */}
      <section className="py-16 bg-gradient-to-br from-slate-800/60 via-slate-900/80 to-slate-950/90 backdrop-blur-sm border-y border-slate-700/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main Chart Area */}
            <div className="lg:col-span-2">
              <div className="p-8 bg-slate-800/60 border border-slate-700/40 rounded-2xl backdrop-blur-sm h-full">
                <div className="flex flex-row items-center justify-between pb-6 mb-8 border-b border-slate-700/50">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-light text-slate-100 mb-2">
                      Mini S&P 500 (ES)
                    </h2>
                    <p className="text-slate-300 font-light">
                      Trading en vivo con análisis técnico avanzado
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MarketStatus />
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1">
                      ● ACTIVO
                    </Badge>
                  </div>
                </div>
                <LiveChart 
                  isPlaying={isPlaying}
                  speed={speed}
                  overlays={overlays}
                />
              </div>
            </div>

            {/* Controls and Metrics */}
            <div className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 gap-4">
                {performanceMetrics.map((metric, index) => {
                  const IconComponent = metric.icon;
                  return (
                    <div key={index} className="p-4 bg-slate-800/60 border border-slate-700/40 rounded-2xl backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                            <IconComponent className="h-4 w-4 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-400 font-light">{metric.label}</p>
                            <p className="text-lg font-light text-slate-100">{metric.value}</p>
                          </div>
                        </div>
                        <Badge 
                          className={metric.trend === 'up' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-slate-600/20 text-slate-300 border-slate-600/30'}
                        >
                          {metric.change}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Trading Controls */}
              <div className="p-6 bg-slate-800/60 border border-slate-700/40 rounded-2xl backdrop-blur-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-light text-slate-100 mb-2">Controles de Trading</h3>
                  <p className="text-slate-400 font-light text-sm">
                    Gestión de posiciones en tiempo real
                  </p>
                </div>
                <DemoControls 
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  speed={speed}
                  setSpeed={setSpeed}
                  overlays={overlays}
                  setOverlays={setOverlays}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategy Information */}
      <section className="py-32 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-slate-800/60 border border-slate-700/40 rounded-2xl backdrop-blur-sm">
              <div className="mb-6">
                <h3 className="text-xl font-light text-slate-100 mb-2 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  Especificaciones del Contrato
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-light">Instrumento:</span>
                  <span className="font-light text-slate-200">Mini S&P 500 (ES)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-light">Tamaño del Contrato:</span>
                  <span className="font-light text-slate-200">$50 x Índice</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-light">Tick Mínimo:</span>
                  <span className="font-light text-slate-200">0.25 pts ($12.50)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-light">Margen Requerido:</span>
                  <span className="font-light text-slate-200">~$13,200</span>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-800/60 border border-slate-700/40 rounded-2xl backdrop-blur-sm">
              <div className="mb-6">
                <h3 className="text-xl font-light text-slate-100 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  Rendimiento de Hoy
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-light">Trades Ejecutados:</span>
                  <span className="font-light text-slate-200">339</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-light">Trades Ganadores:</span>
                  <span className="font-light text-green-400">296 (87.32%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-light">P&L Neto:</span>
                  <span className="font-light text-green-400">+$6,437.50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-light">Profit Factor:</span>
                  <span className="font-light text-slate-200">2.19</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-light">% Ganancia:</span>
                  <span className="font-light text-green-400">+45.56%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LiveDemo;