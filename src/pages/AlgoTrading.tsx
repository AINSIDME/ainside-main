import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  Brain, 
  Target, 
  Shield, 
  Award,
  Zap,
  CheckCircle2,
  LineChart,
  BarChart3,
  Users,
  GraduationCap,
  Building2,
  Globe
} from "lucide-react";

const AlgoTrading = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50">
      {/* Hero Section - Institutional */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-24 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/10 border border-amber-500/30 rounded-full backdrop-blur-sm">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-amber-300 font-semibold tracking-wide uppercase text-sm">
                {t('algoTradingPage.badge', 'Institucional • Elite')}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight">
              {t('algoTradingPage.title', 'Algorithmic Trading')}
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed font-light">
              {t('algoTradingPage.subtitle', 'Excelencia en Sistemas de Trading Cuantitativo de Clase Institucional')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/demo">
                <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg font-semibold shadow-2xl">
                  {t('algoTradingPage.cta.demo', 'Explorar Plataforma')}
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="border-2 border-slate-400 text-slate-300 hover:bg-slate-800 px-8 py-6 text-lg font-semibold">
                  {t('algoTradingPage.cta.pricing', 'Ver Membresía')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <Building2 className="w-12 h-12 text-slate-700 mx-auto" />
              <div className="text-3xl font-bold text-slate-900">500+</div>
              <div className="text-sm text-slate-600 font-medium">{t('algoTradingPage.stats.institutions', 'Instituciones')}</div>
            </div>
            <div className="space-y-2">
              <Users className="w-12 h-12 text-slate-700 mx-auto" />
              <div className="text-3xl font-bold text-slate-900">10K+</div>
              <div className="text-sm text-slate-600 font-medium">{t('algoTradingPage.stats.traders', 'Traders Profesionales')}</div>
            </div>
            <div className="space-y-2">
              <Globe className="w-12 h-12 text-slate-700 mx-auto" />
              <div className="text-3xl font-bold text-slate-900">45+</div>
              <div className="text-sm text-slate-600 font-medium">{t('algoTradingPage.stats.countries', 'Países')}</div>
            </div>
            <div className="space-y-2">
              <TrendingUp className="w-12 h-12 text-slate-700 mx-auto" />
              <div className="text-3xl font-bold text-slate-900">$2B+</div>
              <div className="text-sm text-slate-600 font-medium">{t('algoTradingPage.stats.volume', 'Volumen Operado')}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-20">
        {/* What is Algorithmic Trading */}
        <section className="mb-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
                {t('algoTradingPage.whatIs.title', '¿Qué es el Algorithmic Trading?')}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-amber-600 to-amber-400 mx-auto"></div>
            </div>

            <Card className="bg-white border-2 border-slate-200 shadow-xl">
              <CardContent className="p-8 md:p-12 space-y-6 text-slate-700 text-lg leading-relaxed">
                <p className="text-xl font-light">
                  {t('algoTradingPage.whatIs.p1', 'El trading algorítmico representa la vanguardia de los mercados financieros modernos: sistemas cuantitativos que ejecutan estrategias de inversión mediante modelos matemáticos avanzados, análisis estadístico riguroso y ejecución automatizada de alta frecuencia.')}
                </p>
                
                <p>
                  {t('algoTradingPage.whatIs.p2', 'Instituciones líderes, fondos hedge y traders profesionales confían en algoritmos propietarios para eliminar sesgos emocionales, capitalizar ineficiencias del mercado en milisegundos y gestionar portafolios con precisión científica.')}
                </p>

                <div className="grid md:grid-cols-3 gap-6 mt-10 pt-10 border-t border-slate-200">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                      <Brain className="w-8 h-8 text-blue-700" />
                    </div>
                    <h4 className="font-semibold text-slate-900">{t('algoTradingPage.whatIs.quantitative', 'Análisis Cuantitativo')}</h4>
                    <p className="text-sm text-slate-600">Modelos matemáticos avanzados</p>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                      <Zap className="w-8 h-8 text-emerald-700" />
                    </div>
                    <h4 className="font-semibold text-slate-900">{t('algoTradingPage.whatIs.execution', 'Ejecución HFT')}</h4>
                    <p className="text-sm text-slate-600">Alta frecuencia sub-millisegundo</p>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl flex items-center justify-center mx-auto">
                      <Shield className="w-8 h-8 text-amber-700" />
                    </div>
                    <h4 className="font-semibold text-slate-900">{t('algoTradingPage.whatIs.risk', 'Risk Management')}</h4>
                    <p className="text-sm text-slate-600">Controles institucionales</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Institutional Advantages */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
              {t('algoTradingPage.advantages.title', 'Ventajas Institucionales')}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('algoTradingPage.advantages.subtitle', 'Por qué las instituciones líderes eligen sistemas algorítmicos')}
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-600 to-amber-400 mx-auto mt-4"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Target,
                title: t('algoTradingPage.advantages.precision.title', 'Precisión Milimétrica'),
                description: t('algoTradingPage.advantages.precision.desc', 'Ejecución exacta de estrategias sin desviación emocional. Backtesting riguroso en décadas de datos históricos con validación cruzada estadística.'),
                color: 'from-blue-600 to-blue-400'
              },
              {
                icon: Brain,
                title: t('algoTradingPage.advantages.intelligence.title', 'Inteligencia Artificial Propietaria'),
                description: t('algoTradingPage.advantages.intelligence.desc', 'Machine Learning avanzado que identifica patrones ocultos, optimiza parámetros dinámicamente y se adapta a regímenes de mercado cambiantes en tiempo real.'),
                color: 'from-purple-600 to-purple-400'
              },
              {
                icon: Zap,
                title: t('algoTradingPage.advantages.speed.title', 'Velocidad Institucional'),
                description: t('algoTradingPage.advantages.speed.desc', 'Latencia ultra-baja co-localizada. Captura oportunidades de arbitraje en microsegundos antes que el mercado se ajuste. Infraestructura de nivel institucional.'),
                color: 'from-amber-600 to-amber-400'
              },
              {
                icon: Shield,
                title: t('algoTradingPage.advantages.riskControl.title', 'Control de Riesgo Sofisticado'),
                description: t('algoTradingPage.advantages.riskControl.desc', 'VaR dinámico, stress testing continuo, límites multi-nivel y circuit breakers automáticos. Gestión de riesgo comparable a fondos hedge de $1B+.'),
                color: 'from-red-600 to-red-400'
              },
              {
                icon: BarChart3,
                title: t('algoTradingPage.advantages.diversification.title', 'Diversificación Multi-Estrategia'),
                description: t('algoTradingPage.advantages.diversification.desc', 'Portfolio de algoritmos no correlacionados: momentum, mean reversion, statistical arbitrage, market making. Reducción de drawdown sistémico.'),
                color: 'from-emerald-600 to-emerald-400'
              },
              {
                icon: LineChart,
                title: t('algoTradingPage.advantages.transparency.title', 'Transparencia Total'),
                description: t('algoTradingPage.advantages.transparency.desc', 'Métricas institucionales detalladas: Sharpe ratio, Sortino, Calmar, Maximum Drawdown, win rate ajustado por volatilidad. Auditoría completa de cada operación.'),
                color: 'from-slate-600 to-slate-400'
              }
            ].map((advantage, index) => (
              <Card key={index} className="bg-white border-2 border-slate-200 hover:border-amber-400 transition-all duration-300 shadow-lg hover:shadow-2xl">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 bg-gradient-to-br ${advantage.color} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                    <advantage.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{advantage.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{advantage.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Why AIinside.me */}
        <section className="mb-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-12 md:p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/20 border border-amber-500/40 rounded-full backdrop-blur-sm">
              <GraduationCap className="w-5 h-5 text-amber-300" />
              <span className="text-amber-200 font-semibold tracking-wide uppercase text-sm">
                {t('algoTradingPage.solution.badge', 'Tecnología Institucional')}
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">
              {t('algoTradingPage.solution.title', 'Por Qué AIinside.me')}
            </h2>

            <p className="text-xl text-slate-300 leading-relaxed">
              {t('algoTradingPage.solution.description', 'Acceso democrático a tecnología de trading que antes estaba reservada exclusivamente para fondos hedge de $100M+ y mesas de trading institucionales de Wall Street.')}
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-slate-700">
              <div className="space-y-3">
                <div className="text-4xl font-bold text-amber-400">$0</div>
                <div className="text-slate-400">{t('algoTradingPage.solution.infrastructure', 'Inversión en Infraestructura')}</div>
                <p className="text-sm text-slate-500">Servidores, co-location, feeds de datos premium incluidos</p>
              </div>

              <div className="space-y-3">
                <div className="text-4xl font-bold text-amber-400">24/7</div>
                <div className="text-slate-400">{t('algoTradingPage.solution.operation', 'Operación Autónoma')}</div>
                <p className="text-sm text-slate-500">Monitoreo continuo sin intervención humana</p>
              </div>

              <div className="space-y-3">
                <div className="text-4xl font-bold text-amber-400">{'<'}1ms</div>
                <div className="text-slate-400">{t('algoTradingPage.solution.latency', 'Latencia Promedio')}</div>
                <p className="text-sm text-slate-500">Ejecución institucional de ultra-baja latencia</p>
              </div>
            </div>

            <div className="pt-8">
              <Link to="/pricing">
                <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-12 py-7 text-xl font-semibold shadow-2xl">
                  {t('algoTradingPage.solution.cta', 'Solicitar Acceso Institucional')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Academic Excellence */}
        <section className="mb-24">
          <Card className="bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 shadow-xl">
            <CardContent className="p-12 md:p-16">
              <div className="max-w-4xl mx-auto text-center space-y-8">
                <GraduationCap className="w-20 h-20 text-slate-700 mx-auto" />
                
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900">
                  {t('algoTradingPage.academic.title', 'Rigor Académico')}
                </h2>

                <p className="text-xl text-slate-600 leading-relaxed">
                  {t('algoTradingPage.academic.description', 'Nuestros algoritmos están fundamentados en investigación cuantitativa peer-reviewed, teoría de portafolio moderna (Markowitz), modelos de volatilidad estocástica (GARCH), y frameworks de aprendizaje automático validados académicamente.')}
                </p>

                <div className="grid md:grid-cols-2 gap-8 mt-12 text-left">
                  {[
                    {
                      title: t('algoTradingPage.academic.methodology', 'Metodología Científica'),
                      points: [
                        'Hipótesis estadísticamente testables',
                        'Backtesting con walk-forward analysis',
                        'Out-of-sample validation rigurosa',
                        'Monte Carlo para stress testing'
                      ]
                    },
                    {
                      title: t('algoTradingPage.academic.transparency', 'Transparencia Académica'),
                      points: [
                        'Métricas de performance ajustadas por riesgo',
                        'Divulgación completa de supuestos',
                        'Documentación exhaustiva de estrategias',
                        'Auditoría de resultados verificable'
                      ]
                    }
                  ].map((section, index) => (
                    <div key={index} className="space-y-4">
                      <h3 className="text-2xl font-bold text-slate-900">{section.title}</h3>
                      <ul className="space-y-3">
                        {section.points.map((point, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Final CTA */}
        <section className="text-center">
          <div className="max-w-4xl mx-auto space-y-8 py-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900">
              {t('algoTradingPage.finalCta.title', 'Únase a la Elite del Trading Cuantitativo')}
            </h2>
            
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {t('algoTradingPage.finalCta.description', 'Tecnología institucional, accesibilidad moderna. Sin barreras de entrada de millones de dólares.')}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
              <Link to="/demo">
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-7 text-lg font-semibold shadow-xl">
                  <LineChart className="w-5 h-5 mr-2" />
                  {t('algoTradingPage.finalCta.demo', 'Ver Demostración en Vivo')}
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-2 border-slate-900 text-slate-900 hover:bg-slate-100 px-10 py-7 text-lg font-semibold">
                  {t('algoTradingPage.finalCta.contact', 'Contactar Asesor')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AlgoTrading;
