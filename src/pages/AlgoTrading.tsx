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
    <div className="min-h-screen bg-gradient-to-b from-slate-900/95 to-slate-950/98">
      {/* Hero Section */}
      <section className="relative py-32 px-4 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/98 backdrop-blur-sm">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="mb-16">
            
            <h1 className="text-5xl md:text-7xl font-light text-slate-100 mb-8 leading-[1.1] tracking-tight">
              {t('algoTradingPage.title', 'Algorithmic Trading')}
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-light tracking-wide max-w-4xl mx-auto">
              {t('algoTradingPage.subtitle', 'Excelencia en Sistemas de Trading Cuantitativo de Clase Institucional')}
            </p>
          </div>

          <div className="flex flex-wrap gap-6 justify-center">
            <Link to="/demo">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-10 py-6 text-lg font-medium shadow-2xl shadow-blue-500/20 transition-all duration-300 hover:scale-105">
                {t('algoTradingPage.cta.demo', 'Explorar Plataforma')}
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="border-2 border-slate-600 text-slate-200 hover:bg-slate-800/50 backdrop-blur-sm px-10 py-6 text-lg font-medium transition-all duration-300">
                {t('algoTradingPage.cta.pricing', 'Ver Membresía')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-slate-900/50 backdrop-blur-md border-y border-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 text-center max-w-6xl mx-auto">
            <div className="space-y-3">
              <Building2 className="w-12 h-12 text-blue-400 mx-auto" />
              <div className="text-4xl font-light text-slate-100">Institucional</div>
              <div className="text-sm text-slate-300 uppercase tracking-wider">{t('algoTradingPage.stats.institutions', 'Grado Institucional')}</div>
            </div>
            <div className="space-y-3">
              <Users className="w-12 h-12 text-cyan-400 mx-auto" />
              <div className="text-4xl font-light text-slate-100">Profesional</div>
              <div className="text-sm text-slate-300 uppercase tracking-wider">{t('algoTradingPage.stats.traders', 'Para Traders Avanzados')}</div>
            </div>
            <div className="space-y-3">
              <Globe className="w-12 h-12 text-blue-400 mx-auto" />
              <div className="text-4xl font-light text-slate-100">Global</div>
              <div className="text-sm text-slate-300 uppercase tracking-wider">{t('algoTradingPage.stats.countries', 'Acceso Mundial')}</div>
            </div>
            <div className="space-y-3">
              <TrendingUp className="w-12 h-12 text-cyan-400 mx-auto" />
              <div className="text-4xl font-light text-slate-100">Auto</div>
              <div className="text-sm text-slate-300 uppercase tracking-wider">{t('algoTradingPage.stats.volume', 'Sistema Automatizado')}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-24">
        {/* What is Algorithmic Trading */}
        <section className="mb-32">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-light text-slate-100 mb-6 tracking-tight">
                {t('algoTradingPage.whatIs.title', '¿Qué es el Algorithmic Trading?')}
              </h2>
              <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto"></div>
            </div>

            <Card className="bg-slate-900/40 border border-slate-800/50 shadow-2xl backdrop-blur-lg">
              <CardContent className="p-10 md:p-14 space-y-8">
                <p className="text-xl text-slate-300 leading-relaxed font-light">
                  {t('algoTradingPage.whatIs.p1', 'El trading algorítmico representa la vanguardia de los mercados financieros modernos: sistemas cuantitativos que ejecutan estrategias de inversión mediante modelos matemáticos avanzados, análisis estadístico riguroso y ejecución automatizada de alta frecuencia.')}
                </p>
                
                <p className="text-lg text-slate-300 leading-relaxed">
                  {t('algoTradingPage.whatIs.p2', 'Instituciones líderes, fondos hedge y traders profesionales confían en algoritmos propietarios para eliminar sesgos emocionales, capitalizar ineficiencias del mercado en milisegundos y gestionar portafolios con precisión científica.')}
                </p>

                <div className="grid md:grid-cols-3 gap-8 mt-12 pt-12 border-t border-slate-800/50">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto">
                      <Brain className="w-8 h-8 text-blue-400" />
                    </div>
                    <h4 className="font-medium text-slate-200 text-lg">{t('algoTradingPage.whatIs.quantitative', 'Análisis Cuantitativo')}</h4>
                    <p className="text-sm text-slate-400">Modelos matemáticos avanzados</p>
                  </div>

                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto">
                      <Zap className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h4 className="font-medium text-slate-200 text-lg">{t('algoTradingPage.whatIs.execution', 'Ejecución HFT')}</h4>
                    <p className="text-sm text-slate-400">Alta frecuencia sub-millisegundo</p>
                  </div>

                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto">
                      <Shield className="w-8 h-8 text-blue-400" />
                    </div>
                    <h4 className="font-medium text-slate-200 text-lg">{t('algoTradingPage.whatIs.risk', 'Risk Management')}</h4>
                    <p className="text-sm text-slate-400">Controles institucionales</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Institutional Advantages */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-light text-slate-100 mb-6 tracking-tight">
              {t('algoTradingPage.advantages.title', 'Ventajas Institucionales')}
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              {t('algoTradingPage.advantages.subtitle', 'Por qué las instituciones líderes eligen sistemas algorítmicos')}
            </p>
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mt-8"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: Target,
                title: t('algoTradingPage.advantages.precision.title', 'Precisión Milimétrica'),
                description: t('algoTradingPage.advantages.precision.desc', 'Ejecución exacta de estrategias sin desviación emocional. Backtesting riguroso en décadas de datos históricos con validación cruzada estadística.')
              },
              {
                icon: Brain,
                title: t('algoTradingPage.advantages.intelligence.title', 'Inteligencia Artificial Propietaria'),
                description: t('algoTradingPage.advantages.intelligence.desc', 'Machine Learning avanzado que identifica patrones ocultos, optimiza parámetros dinámicamente y se adapta a regímenes de mercado cambiantes en tiempo real.')
              },
              {
                icon: Zap,
                title: t('algoTradingPage.advantages.speed.title', 'Velocidad Institucional'),
                description: t('algoTradingPage.advantages.speed.desc', 'Latencia ultra-baja co-localizada. Captura oportunidades de arbitraje en microsegundos antes que el mercado se ajuste. Infraestructura de nivel institucional.')
              },
              {
                icon: Shield,
                title: t('algoTradingPage.advantages.riskControl.title', 'Control de Riesgo Sofisticado'),
                description: t('algoTradingPage.advantages.riskControl.desc', 'Estrategias con stops y objetivos predefinidos basados en ATR y volatilidad del mercado. Gestión sistemática del riesgo.')
              },
              {
                icon: BarChart3,
                title: t('algoTradingPage.advantages.diversification.title', 'Diversificación Multi-Estrategia'),
                description: t('algoTradingPage.advantages.diversification.desc', 'Portfolio de algoritmos no correlacionados: momentum, mean reversion, statistical arbitrage, market making. Reducción de drawdown sistémico.')
              },
              {
                icon: LineChart,
                title: t('algoTradingPage.advantages.transparency.title', 'Transparencia Total'),
                description: t('algoTradingPage.advantages.transparency.desc', 'Métricas institucionales detalladas: Sharpe ratio, Sortino, Calmar, Maximum Drawdown, win rate ajustado por volatilidad. Auditoría completa de cada operación.')
              }
            ].map((advantage, index) => (
              <Card key={index} className="bg-slate-900/40 border border-slate-800/50 backdrop-blur-lg hover:border-blue-500/50 transition-all duration-300 shadow-xl group">
                <CardContent className="p-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:border-blue-500/40 transition-all duration-300">
                    <advantage.icon className="w-7 h-7 text-blue-400 group-hover:text-cyan-400 transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-medium text-slate-100 mb-4 leading-tight">{advantage.title}</h3>
                  <p className="text-slate-300 leading-relaxed text-sm">{advantage.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Why AIinside.me */}
        <section className="mb-32 bg-slate-800/30 border border-slate-800/50 rounded-3xl p-12 md:p-16 backdrop-blur-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5"></div>
          
          <div className="relative z-10 max-w-5xl mx-auto text-center space-y-10">
            <div className="inline-block px-6 py-2 text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 rounded-full tracking-wide uppercase border border-blue-500/30">
              {t('algoTradingPage.solution.badge', 'Tecnología Institucional')}
            </div>

            <h2 className="text-4xl md:text-6xl font-light text-slate-100 tracking-tight">
              {t('algoTradingPage.solution.title', 'Por Qué AIinside.me')}
            </h2>

            <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto font-light">
              {t('algoTradingPage.solution.description', 'Estrategias algorítmicas profesionales accesibles para traders que buscan automatización con backtesting verificable.')}
            </p>

            <div className="grid md:grid-cols-3 gap-10 mt-16 pt-12 border-t border-slate-800/50">
              <div className="space-y-3">
                <div className="text-5xl font-light text-blue-400">$0</div>
                <div className="text-slate-300 font-medium text-lg">{t('algoTradingPage.solution.infrastructure', 'Inversión en Infraestructura')}</div>
                <p className="text-sm text-slate-400">Servidores, co-location, feeds de datos premium incluidos</p>
              </div>

              <div className="space-y-3">
                <div className="text-5xl font-light text-cyan-400">Auto</div>
                <div className="text-slate-300 font-medium text-lg">{t('algoTradingPage.solution.operation', 'Sistema Automatizado')}</div>
                <p className="text-sm text-slate-400">Estrategias se ejecutan automáticamente</p>
              </div>

              <div className="space-y-3">
                <div className="text-5xl font-light text-blue-400">{'<'}1ms</div>
                <div className="text-slate-300 font-medium text-lg">{t('algoTradingPage.solution.latency', 'Latencia Promedio')}</div>
                <p className="text-sm text-slate-400">Ejecución institucional de ultra-baja latencia</p>
              </div>
            </div>

            <div className="pt-10">
              <Link to="/pricing">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-12 py-7 text-lg font-medium shadow-2xl shadow-blue-500/20 transition-all duration-300 hover:scale-105">
                  {t('algoTradingPage.solution.cta', 'Solicitar Acceso Institucional')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Academic Excellence */}
        <section className="mb-32">
          <Card className="bg-slate-900/40 border border-slate-800/50 shadow-2xl backdrop-blur-lg">
            <CardContent className="p-12 md:p-16">
              <div className="max-w-5xl mx-auto text-center space-y-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto">
                  <GraduationCap className="w-12 h-12 text-blue-400" />
                </div>
                
                <h2 className="text-4xl md:text-6xl font-light text-slate-100 tracking-tight">
                  {t('algoTradingPage.academic.title', 'Rigor Académico')}
                </h2>

                <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto font-light">
                  {t('algoTradingPage.academic.description', 'Nuestros algoritmos están fundamentados en investigación cuantitativa peer-reviewed, teoría de portafolio moderna (Markowitz), modelos de volatilidad estocástica (GARCH), y frameworks de aprendizaje automático validados académicamente.')}
                </p>

                <div className="grid md:grid-cols-2 gap-10 mt-16 text-left">
                  {[
                    {
                      title: t('algoTradingPage.academic.methodology', 'Metodología Científica'),
                      points: t('algoTradingPage.academic.methodologyPoints', { returnObjects: true }) as string[] || [
                        'Hipótesis estadísticamente testables',
                        'Backtesting con walk-forward analysis',
                        'Out-of-sample validation rigurosa',
                        'Monte Carlo para stress testing'
                      ]
                    },
                    {
                      title: t('algoTradingPage.academic.transparency', 'Transparencia Académica'),
                      points: t('algoTradingPage.academic.transparencyPoints', { returnObjects: true }) as string[] || [
                        'Métricas de performance ajustadas por riesgo',
                        'Divulgación completa de supuestos',
                        'Documentación exhaustiva de estrategias',
                        'Auditoría de resultados verificable'
                      ]
                    }
                  ].map((section, index) => (
                    <div key={index} className="space-y-6">
                      <h3 className="text-2xl font-medium text-slate-100">{section.title}</h3>
                      <ul className="space-y-4">
                        {section.points.map((point, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                            <span className="text-slate-300 text-sm leading-relaxed">{point}</span>
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
        <section className="text-center pb-16">
          <div className="max-w-5xl mx-auto space-y-10 py-20">
            <h2 className="text-4xl md:text-6xl font-light text-slate-100 tracking-tight leading-tight">
              {t('algoTradingPage.finalCta.title', 'Trading Automatizado Profesional')}
            </h2>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
              {t('algoTradingPage.finalCta.description', 'Tecnología institucional, accesibilidad moderna. Sin barreras de entrada de millones de dólares.')}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Link to="/demo">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-12 py-7 text-lg font-medium shadow-2xl shadow-blue-500/20 transition-all duration-300 hover:scale-105">
                  <LineChart className="w-5 h-5 mr-2" />
                  {t('algoTradingPage.finalCta.demo', 'Ver Demostración en Vivo')}
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-2 border-slate-600 text-slate-200 hover:bg-slate-800/50 backdrop-blur-sm px-12 py-7 text-lg font-medium transition-all duration-300">
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
