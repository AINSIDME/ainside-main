import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import { MarketStatus } from "@/components/trading/MarketStatus";
import { DemoControls } from "@/components/trading/DemoControls";
import { TrendingUp, Activity, DollarSign, BarChart3, Clock } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Link } from "react-router-dom";

const LiveDemo = () => {
  console.log('LiveDemo: Component rendering');
  const { t } = useTranslation();
  
  // Demo control states (visual mock)
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [overlays, setOverlays] = useState({
    vwap: true,
    hilo: false,
    riskBox: false
  });

  // Screenshot gallery (TradeStation/MultiCharts)
  const [slides, setSlides] = useState<{ src: string; caption: string }[]>([]);
  useEffect(() => {
    const candidates = [
      { src: "/guide/ts-1.png", caption: t('liveDemo.slides.ts1', { defaultValue: 'TradeStation: Entries/Exits and ATRStopL/S' }) },
      { src: "/guide/ts-2.png", caption: t('liveDemo.slides.ts2', { defaultValue: 'TradeStation: Short signal and stop management' }) },
      { src: "/guide/ts-3.png", caption: t('liveDemo.slides.ts3', { defaultValue: 'TradeStation: EndOfDay event' }) },
    ];
    Promise.all(
      candidates.map(
        (c) =>
          new Promise<{ ok: boolean; item: { src: string; caption: string } }>((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ ok: true, item: c });
            img.onerror = () => resolve({ ok: false, item: c });
            img.src = c.src;
          })
      )
    ).then((results) => setSlides(results.filter(r => r.ok).map(r => r.item)));
  }, []);

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
            {t('demo.live', { defaultValue: 'LIVE' })}
          </div>
          <h1 className="text-5xl md:text-7xl font-light text-slate-100 mb-6 leading-[1.1] tracking-tight">
            {t('liveDemo.title', { defaultValue: 'Live Demo (Visual)' })}
          </h1>
          <p className="text-lg text-slate-300 mb-4 max-w-3xl mx-auto leading-relaxed font-light">
            {t('liveDemo.description.part1', { defaultValue: 'The real execution of the strategy happens in ' })}
            <strong>TradeStation / MultiCharts</strong> {t('liveDemo.description.part2', { defaultValue: ' with ' })}
            <strong>EasyLanguage</strong>. {t('liveDemo.description.part3', { defaultValue: 'This page is a visualization for context and user experience. To see real signals on your platform, follow the ' })}
            <Link to="/getting-started" className="text-emerald-300 underline">{t('liveDemo.cta.guide', { defaultValue: 'Getting Started Guide' })}</Link>.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild>
              <Link to="/getting-started">{t('liveDemo.cta.guideWithPlatform', { defaultValue: 'Getting Started (EasyLanguage)' })}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/pricing">{t('liveDemo.cta.pricing', { defaultValue: 'See Pricing' })}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Live Trading Dashboard (mock visual) */}
      <section className="py-16 bg-gradient-to-br from-slate-800/60 via-slate-900/80 to-slate-950/90 backdrop-blur-sm border-y border-slate-700/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main Chart Area */}
            <div className="lg:col-span-2">
              <div className="p-8 bg-slate-800/60 border border-slate-700/40 rounded-2xl backdrop-blur-sm h-full">
                <div className="flex flex-row items-center justify-between pb-6 mb-8 border-b border-slate-700/50">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-light text-slate-100 mb-2">{t('liveDemo.chart.title', { defaultValue: 'Flow visualization (example)' })}</h2>
                    <p className="text-slate-300 font-light">{t('liveDemo.chart.subtitle', { defaultValue: 'Illustrative example in the browser' })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MarketStatus />
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1">
                      {t('liveDemo.active', { defaultValue: '● ACTIVE' })}
                    </Badge>
                  </div>
                </div>
                {/* Reemplazo del chart con galería de capturas reales si existen */}
                {slides.length > 0 ? (
                  <div className="relative">
                    <Carousel className="w-full">
                      <CarouselContent>
                        {slides.map((s, idx) => (
                          <CarouselItem key={idx} className="basis-full">
                            <div className="rounded-lg overflow-hidden border bg-muted/30">
                              <img src={s.src} alt={s.caption} className="w-full h-auto" />
                            </div>
                            <p className="mt-2 text-center text-muted-foreground">{s.caption}</p>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </div>
                ) : (
                  <div className="text-slate-400">{t('liveDemo.gallery.empty', { defaultValue: 'Place screenshots in /public/guide to show real examples here.' })}</div>
                )}
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

              {/* Trading Controls (mock) */}
              <div className="p-6 bg-slate-800/60 border border-slate-700/40 rounded-2xl backdrop-blur-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-light text-slate-100 mb-2">Controles de Trading</h3>
                  <p className="text-slate-400 font-light text-sm">
                    Controles de ejemplo para la visualización
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
                    {t('liveDemo.execution.title', { defaultValue: 'Real execution (EasyLanguage)' })}
                  </h3>
                </div>
              <div className="space-y-4">
                <p className="text-slate-300 font-light">
                  {t('liveDemo.execution.p1', { defaultValue: 'The strategy runs natively on ' })}
                  <strong>TradeStation</strong> {t('liveDemo.execution.p2', { defaultValue: ' and ' })}
                  <strong>MultiCharts</strong> {t('liveDemo.execution.p3', { defaultValue: ' using ' })}
                  <strong>EasyLanguage</strong>. {t('liveDemo.execution.p4', { defaultValue: 'The browser only shows a visual representation. To install it in your platform see the ' })}
                  <Link to="/getting-started" className="text-emerald-300 underline">{t('liveDemo.cta.guide', { defaultValue: 'Getting Started Guide' })}</Link>.
                </p>
                <div className="pt-2">
                  <Button asChild className="mr-3"><Link to="/getting-started">{t('liveDemo.cta.install', { defaultValue: 'Install on my platform' })}</Link></Button>
                  <Button variant="outline" asChild><Link to="/pricing">{t('liveDemo.cta.pricing', { defaultValue: 'See Pricing' })}</Link></Button>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-800/60 border border-slate-700/40 rounded-2xl backdrop-blur-sm">
              <div className="mb-6">
                <h3 className="text-xl font-light text-slate-100 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  {t('liveDemo.metrics.title', { defaultValue: 'Example metrics' })}
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-light">{t('liveDemo.metrics.executed', { defaultValue: 'Trades Executed:' })}</span>
                  <span className="font-light text-slate-200">339</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-light">{t('liveDemo.metrics.winners', { defaultValue: 'Winning Trades:' })}</span>
                  <span className="font-light text-green-400">296 (87.32%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-light">{t('liveDemo.metrics.netPnl', { defaultValue: 'Net P&L:' })}</span>
                  <span className="font-light text-green-400">+$6,437.50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-light">{t('liveDemo.metrics.profitFactor', { defaultValue: 'Profit Factor:' })}</span>
                  <span className="font-light text-slate-200">2.19</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-light">{t('liveDemo.metrics.gain', { defaultValue: 'Gain %:' })}</span>
                  <span className="font-light text-green-400">+45.56%</span>
                </div>
                <p className="text-xs text-slate-400 pt-2">{t('liveDemo.metrics.note', { defaultValue: 'Metrics shown are illustrative. For backtests and validations, use your own platform with historical data and indicated settings.' })}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LiveDemo;