import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  Brain, 
  Target, 
  Shield, 
  Clock, 
  Zap,
  AlertTriangle,
  CheckCircle2,
  LineChart,
  BarChart3,
  Activity
} from "lucide-react";

const Trading = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span className="text-blue-300 font-medium">{t('tradingPage.badge', 'Trading Inteligente')}</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
            {t('tradingPage.title', '¿Qué es el Trading?')}
          </h1>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {t('tradingPage.subtitle', 'Descubre cómo tomar decisiones informadas en los mercados financieros y por qué la tecnología de AInside.me marca la diferencia')}
          </p>
        </div>

        {/* What is Trading */}
        <section className="mb-20">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <LineChart className="w-8 h-8 text-cyan-400" />
                <CardTitle className="text-3xl text-white">
                  {t('tradingPage.whatIs.title', 'Entendiendo el Trading')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 text-slate-300 text-lg leading-relaxed">
              <p>
                {t('tradingPage.whatIs.p1', 'El trading es la compra y venta de activos financieros (acciones, divisas, criptomonedas, futuros) con el objetivo de obtener ganancias aprovechando las fluctuaciones del mercado. A diferencia de la inversión a largo plazo, el trading busca beneficios en plazos más cortos.')}
              </p>
              
              <p>
                {t('tradingPage.whatIs.p2', 'El éxito en el trading no depende de la suerte, sino de estrategias bien definidas, análisis técnico riguroso, gestión de riesgo disciplinada y control emocional. Los traders profesionales pasan años perfeccionando sus sistemas y aprendiendo a interpretar los patrones del mercado.')}
              </p>

              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg">
                  <Activity className="w-10 h-10 text-blue-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Day Trading</h4>
                  <p className="text-sm text-slate-400">
                    {t('tradingPage.whatIs.dayTrading', 'Operaciones que se abren y cierran el mismo día')}
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
                  <BarChart3 className="w-10 h-10 text-purple-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Swing Trading</h4>
                  <p className="text-sm text-slate-400">
                    {t('tradingPage.whatIs.swingTrading', 'Mantener posiciones durante días o semanas')}
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
                  <TrendingUp className="w-10 h-10 text-green-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Scalping</h4>
                  <p className="text-sm text-slate-400">
                    {t('tradingPage.whatIs.scalping', 'Múltiples operaciones rápidas con pequeñas ganancias')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Good Strategies Section */}
        <section className="mb-20">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-8 h-8 text-green-400" />
                <CardTitle className="text-3xl text-white">
                  {t('tradingPage.goodStrategies.title', '¿Cómo Identificar Buenas Estrategias?')}
                </CardTitle>
              </div>
              <CardDescription className="text-lg text-slate-400">
                {t('tradingPage.goodStrategies.description', 'No todas las estrategias son iguales. Aprende a evaluar su efectividad')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  {
                    icon: CheckCircle2,
                    title: t('tradingPage.goodStrategies.backtesting.title', 'Backtesting Riguroso'),
                    description: t('tradingPage.goodStrategies.backtesting.desc', 'Una buena estrategia debe probarse con datos históricos reales durante al menos 3-5 años. Si funcionó en el pasado en diferentes condiciones de mercado, tiene más probabilidades de funcionar en el futuro.'),
                    color: 'text-green-400'
                  },
                  {
                    icon: CheckCircle2,
                    title: t('tradingPage.goodStrategies.winRate.title', 'Tasa de Acierto + Risk/Reward'),
                    description: t('tradingPage.goodStrategies.winRate.desc', 'No necesitas ganar el 90% de las veces. Una estrategia con 40% de acierto pero ratio risk/reward de 1:3 es rentable. Lo importante es que las ganancias superen las pérdidas a largo plazo.'),
                    color: 'text-blue-400'
                  },
                  {
                    icon: CheckCircle2,
                    title: t('tradingPage.goodStrategies.drawdown.title', 'Drawdown Controlado'),
                    description: t('tradingPage.goodStrategies.drawdown.desc', 'Las mejores estrategias limitan las pérdidas máximas. Un drawdown superior al 30% puede ser psicológicamente devastador y financieramente peligroso.'),
                    color: 'text-cyan-400'
                  },
                  {
                    icon: CheckCircle2,
                    title: t('tradingPage.goodStrategies.consistency.title', 'Consistencia Temporal'),
                    description: t('tradingPage.goodStrategies.consistency.desc', 'La estrategia debe mostrar rentabilidad consistente mes a mes, año tras año. Una racha ganadora de 3 meses no garantiza nada. Busca patrones de 2-3 años mínimo.'),
                    color: 'text-purple-400'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4 p-6 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:border-slate-600/50 transition-all">
                    <item.icon className={`w-8 h-8 ${item.color} flex-shrink-0 mt-1`} />
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-2">{item.title}</h4>
                      <p className="text-slate-300 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Alert className="bg-amber-500/10 border-amber-500/30 mt-8">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <AlertDescription className="text-amber-200 ml-2">
                  <strong>{t('tradingPage.goodStrategies.warning.title', 'Advertencia:')}</strong>{' '}
                  {t('tradingPage.goodStrategies.warning.desc', 'Desconfía de estrategias que prometen 100% de acierto o ganancias garantizadas. El trading siempre implica riesgo. Lo que marca la diferencia es cómo gestionas ese riesgo.')}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </section>

        {/* Dangers & Warnings */}
        <section className="mb-20">
          <Card className="bg-slate-900/50 border-red-900/30 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-red-400" />
                <CardTitle className="text-3xl text-white">
                  {t('tradingPage.dangers.title', 'De Qué Debes Cuidarte')}
                </CardTitle>
              </div>
              <CardDescription className="text-lg text-slate-400">
                {t('tradingPage.dangers.description', 'El trading tiene riesgos reales que debes conocer')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: t('tradingPage.dangers.overtrading.title', 'Overtrading (Sobreoperar)'),
                    description: t('tradingPage.dangers.overtrading.desc', 'Abrir demasiadas operaciones por ansiedad o aburrimiento. Cada operación tiene costos (comisiones, spreads) que se acumulan rápidamente.')
                  },
                  {
                    title: t('tradingPage.dangers.revenge.title', 'Revenge Trading'),
                    description: t('tradingPage.dangers.revenge.desc', 'Intentar recuperar pérdidas inmediatamente con operaciones impulsivas. Es la forma más rápida de perder tu capital.')
                  },
                  {
                    title: t('tradingPage.dangers.leverage.title', 'Apalancamiento Excesivo'),
                    description: t('tradingPage.dangers.leverage.desc', 'Usar leverage 100x puede multiplicar ganancias, pero también puede liquidar tu cuenta en minutos. Empieza con leverage bajo (2x-5x).')
                  },
                  {
                    title: t('tradingPage.dangers.fomo.title', 'FOMO y Pánico'),
                    description: t('tradingPage.dangers.fomo.desc', 'Entrar en operaciones porque "todos están ganando" o vender porque "todos están vendiendo" destruye la disciplina.')
                  },
                  {
                    title: t('tradingPage.dangers.noStopLoss.title', 'No Usar Stop Loss'),
                    description: t('tradingPage.dangers.noStopLoss.desc', 'Un stop loss bien colocado te protege de pérdidas catastróficas. Nunca operes sin uno.')
                  },
                  {
                    title: t('tradingPage.dangers.scams.title', 'Señales y Grupos de Telegram'),
                    description: t('tradingPage.dangers.scams.desc', 'El 95% de los "gurús" que venden señales pierden dinero. Si realmente ganaran millones, no necesitarían venderte nada.')
                  }
                ].map((danger, index) => (
                  <div key={index} className="p-6 bg-red-500/5 border border-red-500/20 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-400 mb-3" />
                    <h4 className="text-lg font-semibold text-white mb-2">{danger.title}</h4>
                    <p className="text-slate-300">{danger.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Who Uses These Tools */}
        <section className="mb-20">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Brain className="w-8 h-8 text-indigo-400" />
                <CardTitle className="text-3xl text-white">
                  {t('tradingPage.whoUses.title', '¿Quién Usa Herramientas de Trading Algorítmico?')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 text-slate-300 text-lg leading-relaxed">
              <p>
                {t('tradingPage.whoUses.p1', 'Las herramientas de trading automatizado no son solo para instituciones financieras. Hoy en día, traders individuales, equipos profesionales y fondos de inversión utilizan sistemas algorítmicos para:')}
              </p>

              <ul className="space-y-3 ml-6">
                {[
                  t('tradingPage.whoUses.point1', 'Eliminar el sesgo emocional de las decisiones'),
                  t('tradingPage.whoUses.point2', 'Operar 24/7 sin necesidad de estar frente a la pantalla'),
                  t('tradingPage.whoUses.point3', 'Ejecutar estrategias complejas con precisión milimétrica'),
                  t('tradingPage.whoUses.point4', 'Backtesting rápido de ideas en años de datos históricos'),
                  t('tradingPage.whoUses.point5', 'Gestionar múltiples activos simultáneamente'),
                  t('tradingPage.whoUses.point6', 'Reaccionar a oportunidades en milisegundos')
                ].map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <p className="text-cyan-300 font-medium text-xl mt-8">
                {t('tradingPage.whoUses.p2', 'Desde traders principiantes que quieren aprender sin arriesgar capital real, hasta profesionales que gestionan millones, todos se benefician de sistemas bien diseñados.')}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* AInside.me Solution */}
        <section className="mb-20">
          <Card className="bg-gradient-to-br from-blue-900/30 via-cyan-900/20 to-blue-900/30 border-cyan-500/30 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-8 h-8 text-cyan-400" />
                <CardTitle className="text-3xl text-white">
                  {t('tradingPage.solution.title', 'Por Qué AInside.me es la Solución')}
                </CardTitle>
              </div>
              <CardDescription className="text-lg text-cyan-200">
                {t('tradingPage.solution.subtitle', 'Tecnología de vanguardia al alcance de tu mano')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="text-slate-200 text-lg leading-relaxed space-y-4">
                <p>
                  {t('tradingPage.solution.p1', 'AInside.me no es otro curso de trading ni un grupo de señales. Es una plataforma de trading algorítmico con IA que te permite probar, optimizar y ejecutar estrategias de manera profesional.')}
                </p>

                <p className="text-cyan-300 font-semibold text-xl">
                  {t('tradingPage.solution.highlight', 'Lo que nos diferencia:')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    icon: Brain,
                    title: t('tradingPage.solution.ai.title', 'Inteligencia Artificial Real'),
                    description: t('tradingPage.solution.ai.desc', 'Nuestros algoritmos analizan patrones en tiempo real, optimizan parámetros automáticamente y se adaptan a las condiciones cambiantes del mercado.'),
                    gradient: 'from-purple-500/20 to-pink-500/20',
                    border: 'border-purple-500/30'
                  },
                  {
                    icon: Clock,
                    title: t('tradingPage.solution.time.title', 'Ahorro Masivo de Tiempo'),
                    description: t('tradingPage.solution.time.desc', '¿Pasas 8 horas diarias analizando gráficos? Con AInside.me, el sistema trabaja por ti. Recupera tu vida mientras la IA opera 24/7.'),
                    gradient: 'from-blue-500/20 to-cyan-500/20',
                    border: 'border-blue-500/30'
                  },
                  {
                    icon: Shield,
                    title: t('tradingPage.solution.mentalPeace.title', 'Silencio Mental Total'),
                    description: t('tradingPage.solution.mentalPeace.desc', 'No más ansiedad esperando que el mercado se mueva. No más insomnio por posiciones abiertas. El sistema gestiona el riesgo con reglas claras y objetivas.'),
                    gradient: 'from-green-500/20 to-emerald-500/20',
                    border: 'border-green-500/30'
                  },
                  {
                    icon: Target,
                    title: t('tradingPage.solution.backtesting.title', 'Backtesting Instantáneo'),
                    description: t('tradingPage.solution.backtesting.desc', 'Prueba cualquier estrategia en años de datos históricos en segundos. No más Excel ni cálculos manuales. Ve resultados reales antes de arriesgar un centavo.'),
                    gradient: 'from-amber-500/20 to-orange-500/20',
                    border: 'border-amber-500/30'
                  }
                ].map((feature, index) => (
                  <div key={index} className={`p-6 bg-gradient-to-br ${feature.gradient} border ${feature.border} rounded-lg`}>
                    <feature.icon className="w-12 h-12 text-cyan-400 mb-4" />
                    <h4 className="text-xl font-semibold text-white mb-3">{feature.title}</h4>
                    <p className="text-slate-300">{feature.description}</p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-8 mt-8">
                <h4 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Clock className="w-8 h-8 text-cyan-400" />
                  {t('tradingPage.solution.timeComparison.title', 'Comparación de Tiempo Real')}
                </h4>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <h5 className="font-semibold text-red-400 text-lg">
                      {t('tradingPage.solution.timeComparison.manual', 'Trading Manual Tradicional')}
                    </h5>
                    <ul className="space-y-2 text-slate-300">
                      <li>• 4-8 horas diarias monitoreando gráficos</li>
                      <li>• 2-3 horas analizando noticias</li>
                      <li>• 1-2 horas calculando posiciones/riesgo</li>
                      <li>• Estrés constante 24/7</li>
                      <li>• Pérdida de tiempo con familia</li>
                    </ul>
                    <p className="text-red-400 font-bold text-xl mt-4">
                      = 50-70 horas/semana
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-semibold text-green-400 text-lg">
                      {t('tradingPage.solution.timeComparison.ai', 'Con AInside.me')}
                    </h5>
                    <ul className="space-y-2 text-slate-300">
                      <li>• 30 min configurando estrategia (1 vez)</li>
                      <li>• 15 min diarios revisando performance</li>
                      <li>• Sistema opera 24/7 automáticamente</li>
                      <li>• Tranquilidad mental absoluta</li>
                      <li>• Libertad para vivir tu vida</li>
                    </ul>
                    <p className="text-green-400 font-bold text-xl mt-4">
                      = 2-3 horas/semana
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg p-6">
                  <p className="text-white text-2xl font-bold text-center">
                    {t('tradingPage.solution.timeSaved', 'Ahorro de 45-65 horas semanales')}
                  </p>
                  <p className="text-cyan-300 text-center mt-2 text-lg">
                    {t('tradingPage.solution.timeSavedDesc', 'Eso son 2,400+ horas al año que puedes dedicar a lo que realmente importa')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="bg-gradient-to-br from-blue-600/20 via-cyan-600/20 to-blue-600/20 border-cyan-500/50 backdrop-blur">
            <CardContent className="py-12 px-6">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t('tradingPage.cta.title', '¿Listo para Transformar tu Trading?')}
              </h3>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                {t('tradingPage.cta.description', 'Prueba nuestras estrategias en demo, sin riesgo. Descubre cómo la IA puede cambiar tu forma de operar.')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/demo">
                  <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-8 py-6 text-lg">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    {t('tradingPage.cta.demoButton', 'Ver Demo en Vivo')}
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="outline" className="border-cyan-500 text-cyan-300 hover:bg-cyan-500/10 px-8 py-6 text-lg">
                    {t('tradingPage.cta.pricingButton', 'Ver Planes y Precios')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Trading;
