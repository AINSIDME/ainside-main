import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Clock, TrendingUp, Calendar, Target, Bot, Users, BarChart2 } from "lucide-react";
import { LanguageGate } from "@/components/LanguageGate";

const tiposTrading = [
  {
    id: "scalping",
    nombre: "Scalping",
    icono: <Zap className="w-8 h-8" />,
    descripcion: "Operaciones ultrarrápidas para capturar movimientos mínimos",
    definicion: "El scalping es un estilo de trading que busca beneficiarse de pequeños movimientos de precio. Los scalpers ejecutan decenas o cientos de operaciones diarias, manteniendo posiciones desde segundos hasta pocos minutos.",
    timeframe: "Gráficos de 1 tick, 1 segundo, 5-15 segundos, 1 minuto",
    duracion: "Segundos a 5 minutos máximo",
    objetivo: "5-20 ticks/pips por operación",
    caracteristicas: [
      "Alta frecuencia de operaciones (50-300+ diarias)",
      "Requiere spreads muy bajos",
      "Apalancamiento alto necesario",
      "Comisiones críticas (deben ser bajísimas)",
      "Conexión ultra rápida (VPS recomendado)",
      "Concentración extrema requerida"
    ],
    ventajas: [
      "Ganancias rápidas y frecuentes",
      "Exposición al mercado mínima",
      "No requiere análisis fundamental",
      "Funciona en mercados laterales",
      "No sufres gaps overnight"
    ],
    desventajas: [
      "Estrés mental muy alto",
      "Comisiones acumulativas significativas",
      "Requiere mucho capital para ser rentable",
      "Slippage puede eliminar ganancias",
      "No apto para principiantes"
    ],
    perfil: "Traders con reflejos rápidos, disciplina férrea, capital significativo y acceso a tecnología de primera. Tiempo completo.",
    mercados: "Futuros (ES, NQ), Forex (EUR/USD, GBP/USD), acciones de alta liquidez",
    capital: "$25,000 - $100,000+ (para vivir de scalping)"
  },
  {
    id: "daytrading",
    nombre: "Day Trading",
    icono: <Clock className="w-8 h-8" />,
    descripcion: "Operaciones intradiarias cerradas antes del cierre de mercado",
    definicion: "Day trading implica abrir y cerrar todas las posiciones dentro del mismo día de trading. No se mantienen posiciones overnight, eliminando riesgo de gaps y eventos fuera de horario.",
    timeframe: "1 minuto, 5 minutos, 15 minutos, 1 hora",
    duracion: "Minutos a horas (siempre cerrado al final del día)",
    objetivo: "0.5% - 2% por operación exitosa",
    caracteristicas: [
      "5-20 operaciones por día típicamente",
      "Seguimiento constante del mercado",
      "Stop loss ajustados",
      "Análisis técnico intensivo",
      "Respeto estricto al horario de mercado",
      "No preocupación por eventos overnight"
    ],
    ventajas: [
      "Sin riesgo de gaps overnight",
      "Posibilidad de ganancias diarias consistentes",
      "Control total sobre posiciones",
      "Resultados inmediatos",
      "Menor estrés que scalping"
    ],
    desventajas: [
      "Requiere dedicación tiempo completo",
      "Patrón PDT en EE.UU. (mínimo $25k)",
      "Comisiones significativas",
      "Pérdida de movimientos grandes multi-día",
      "Fatiga por decisiones constantes"
    ],
    perfil: "Traders activos con tiempo completo, buen análisis técnico, disciplina para cerrar posiciones, y capital suficiente. Experiencia media requerida.",
    mercados: "Todos: futuros, forex, acciones, índices. Requiere volatilidad intradiaria.",
    capital: "$25,000+ (EE.UU. por regla PDT), $10,000 mínimo fuera de EE.UU."
  },
  {
    id: "swing",
    nombre: "Swing Trading",
    icono: <TrendingUp className="w-8 h-8" />,
    descripcion: "Capturar movimientos de precio durante días o semanas",
    definicion: "Swing trading busca capturar 'swings' o oscilaciones de precio que duran varios días o semanas. Se basa en identificar puntos de inflexión en tendencias de corto-medio plazo.",
    timeframe: "1 hora, 4 horas, diario",
    duracion: "2-10 días típicamente (puede extenderse a semanas)",
    objetivo: "3% - 10% por operación",
    caracteristicas: [
      "2-5 operaciones por semana",
      "Análisis técnico combinado con fundamental",
      "Stops más amplios que day trading",
      "Seguimiento menos intensivo",
      "Posiciones overnight comunes",
      "Considera eventos de calendario"
    ],
    ventajas: [
      "No requiere tiempo completo",
      "Menor estrés que intradiario",
      "Comisiones más bajas proporcionalmente",
      "Captura movimientos significativos",
      "Compatible con trabajo regular"
    ],
    desventajas: [
      "Riesgo de gaps adversos",
      "Requiere paciencia para resultados",
      "Exposición a eventos overnight",
      "Necesita stops más amplios (mayor riesgo/operación)",
      "Menos oportunidades que day trading"
    ],
    perfil: "Traders con empleo o negocios, paciencia, buen análisis técnico/fundamental. Experiencia media. Pueden revisar mercado 2-3 veces al día.",
    mercados: "Acciones, futuros, forex, criptomonedas. Funciona mejor con instrumentos con tendencias claras.",
    capital: "$5,000 - $25,000 mínimo recomendado"
  },
  {
    id: "position",
    nombre: "Position Trading",
    icono: <Calendar className="w-8 h-8" />,
    descripcion: "Inversión de largo plazo basada en tendencias macro",
    definicion: "Position trading es el estilo más cercano a la inversión tradicional. Se mantienen posiciones semanas, meses o incluso años, basándose en análisis fundamental y tendencias macroeconómicas.",
    timeframe: "Diario, semanal, mensual",
    duracion: "Semanas a años",
    objetivo: "20% - 100%+ por posición (anual)",
    caracteristicas: [
      "1-5 operaciones por mes (o menos)",
      "Análisis fundamental dominante",
      "Stops muy amplios o inexistentes",
      "Revisión semanal o mensual",
      "Enfoque en tendencias macro",
      "Dividendos/intereses relevantes"
    ],
    ventajas: [
      "Mínimo tiempo requerido",
      "Estrés muy bajo",
      "Comisiones mínimas",
      "Captura tendencias completas",
      "Beneficios fiscales (largo plazo)",
      "Compatible con cualquier trabajo"
    ],
    desventajas: [
      "Resultados muy lentos",
      "Requiere gran capital",
      "Exposición prolongada a riesgos sistémicos",
      "Drawdowns extensos posibles",
      "Paciencia extrema necesaria"
    ],
    perfil: "Inversores con capital considerable, visión macro, paciencia. No requiere experiencia avanzada en trading, pero sí conocimiento económico.",
    mercados: "Acciones (value investing), índices, commodities, forex (carry trades), bonos.",
    capital: "$50,000+ recomendado para diversificación adecuada"
  },
  {
    id: "algorithmic",
    nombre: "Trading Algorítmico",
    icono: <Bot className="w-8 h-8" />,
    descripcion: "Automatización completa mediante algoritmos y robots",
    definicion: "Trading algorítmico utiliza programas informáticos para ejecutar estrategias de forma automática. Los algoritmos analizan mercado, generan señales y ejecutan órdenes sin intervención humana.",
    timeframe: "Cualquiera (desde microsegundos hasta diario)",
    duracion: "Variable según estrategia programada",
    objetivo: "Variable: desde HFT (microsegundos) hasta estrategias de meses",
    caracteristicas: [
      "Ejecución 100% automatizada",
      "Backtesting histórico antes de desplegar",
      "Requiere programación (Python, C++, MQL)",
      "VPS/servidores dedicados",
      "Monitoreo y ajuste periódico",
      "Elimina emociones completamente"
    ],
    ventajas: [
      "Sin emociones en decisiones",
      "Opera 24/7 sin descanso",
      "Velocidad de ejecución superior",
      "Backtesting para validar estrategias",
      "Escalable a múltiples mercados simultáneamente",
      "Disciplina perfecta"
    ],
    desventajas: [
      "Requiere conocimientos de programación",
      "Curva de aprendizaje empinada",
      "Inversión en infraestructura (VPS, datos)",
      "Sobreoptimización (curve fitting) común",
      "Falla catastrófica si hay bugs",
      "Necesita supervisión constante"
    ],
    perfil: "Traders con habilidades técnicas/programación, mentalidad sistemática, paciencia para desarrollo. Capital variable según estrategia.",
    mercados: "Todos, pero especialmente futuros y forex (por apalancamiento y horarios 24h).",
    capital: "$5,000 - $50,000+ (según estrategia y apalancamiento)"
  },
  {
    id: "social",
    nombre: "Social/Copy Trading",
    icono: <Users className="w-8 h-8" />,
    descripcion: "Replicar operaciones de traders exitosos automáticamente",
    definicion: "Social trading permite copiar automáticamente las operaciones de traders experimentados. Plataformas especializadas conectan 'copiadores' con 'proveedores de señales'.",
    timeframe: "Depende del trader copiado",
    duracion: "Depende del trader copiado",
    objetivo: "Replicar rendimiento del trader seguido (menos comisiones)",
    caracteristicas: [
      "Selección de traders a copiar",
      "Copia proporcional al capital",
      "Plataformas especializadas (eToro, ZuluTrade)",
      "Sin necesidad de análisis propio",
      "Diversificación copiando múltiples traders",
      "Comisiones/spreads más altos"
    ],
    ventajas: [
      "No requiere conocimiento de trading",
      "Aprendizaje observando profesionales",
      "Diversificación fácil",
      "Resultados desde día 1",
      "Transparencia de historial"
    ],
    desventajas: [
      "Dependencia completa de terceros",
      "Comisiones elevadas acumulativas",
      "Rendimiento pasado no garantiza futuro",
      "Riesgo de fraude en traders",
      "Menos control sobre capital",
      "Slippage en ejecución de copias"
    ],
    perfil: "Principiantes absolutos o inversores pasivos que quieren exposición a trading sin dedicar tiempo. Capital bajo a medio.",
    mercados: "Principalmente forex y CFDs. Algunas plataformas ofrecen acciones y cripto.",
    capital: "$500 - $5,000 para comenzar (mínimos según plataforma)"
  },
  {
    id: "news",
    nombre: "News Trading",
    icono: <BarChart2 className="w-8 h-8" />,
    descripcion: "Trading basado en eventos de noticias económicas",
    definicion: "News trading capitaliza la volatilidad generada por anuncios económicos importantes (NFP, Fed, earnings, etc.). Requiere reacciones rápidas y gestión de riesgo extrema.",
    timeframe: "1 minuto a 15 minutos (durante evento)",
    duracion: "Minutos a horas tras el anuncio",
    objetivo: "Capturar movimiento explosivo inicial (50-200 pips posible)",
    caracteristicas: [
      "Calendario económico esencial",
      "Entrada antes/durante/después del anuncio",
      "Spreads se amplían dramáticamente",
      "Requiere brokers con ejecución sólida",
      "Stop loss amplios (por volatilidad)",
      "2-10 eventos operables por semana"
    ],
    ventajas: [
      "Movimientos explosivos rápidos",
      "Oportunidades predecibles (calendario)",
      "Alta volatilidad = alta ganancia potencial",
      "No requiere análisis técnico complejo"
    ],
    desventajas: [
      "Slippage masivo común",
      "Requiere reflejos ultrarrápidos",
      "Pérdidas pueden ser catastróficas",
      "Brokers pueden rechazar órdenes",
      "Estrés extremo"
    ],
    perfil: "Traders experimentados con nervios de acero, capital considerable, excelente conexión. Alto riesgo/alta recompensa.",
    mercados: "Forex (USD principalmente), índices (durante anuncios Fed/ECB), commodities (inventarios).",
    capital: "$10,000+ (por riesgo elevado)"
  }
];

export default function EducacionTiposTrading() {
  return (
    <LanguageGate allowedLanguages={['es']}>
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <div className="inline-block px-6 py-3 text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full mb-8 tracking-wide uppercase shadow-lg">
            EDUCACIÓN TRADING
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-[1.1] tracking-tight">
            Tipos de Trading: Encuentra Tu Estilo
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
            Explora los diferentes estilos de trading desde scalping hasta inversión de largo plazo. 
            Descubre cuál se adapta mejor a tu personalidad, capital y disponibilidad de tiempo.
          </p>
        </div>

        <Tabs defaultValue={tiposTrading[0].id} className="space-y-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 h-auto p-2 bg-white border-2 border-gray-200 shadow-md">
            {tiposTrading.map((tipo) => (
              <TabsTrigger 
                key={tipo.id} 
                value={tipo.id}
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white font-semibold p-3"
              >
                {tipo.icono}
                <span>{tipo.nombre}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tiposTrading.map((tipo) => (
            <TabsContent key={tipo.id} value={tipo.id} className="space-y-6">
              <Card className="border-2 border-blue-200 bg-white shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg text-blue-700">
                      {tipo.icono}
                    </div>
                    <div>
                      <CardTitle className="text-3xl">{tipo.nombre}</CardTitle>
                      <CardDescription className="text-lg mt-2">
                        {tipo.descripcion}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Definición */}
                  <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                    <h3 className="text-xl font-bold mb-3 text-gray-900">📖 Definición</h3>
                    <p className="text-gray-700 font-medium mb-4">{tipo.definicion}</p>
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-white p-3 rounded border-2 border-blue-100">
                        <p className="font-bold mb-1 text-gray-900">⏱️ Timeframes</p>
                        <p className="text-gray-700 font-medium">{tipo.timeframe}</p>
                      </div>
                      <div className="bg-white p-3 rounded border-2 border-blue-100">
                        <p className="font-bold mb-1 text-gray-900">⏳ Duración</p>
                        <p className="text-gray-700 font-medium">{tipo.duracion}</p>
                      </div>
                      <div className="bg-white p-3 rounded border-2 border-blue-100">
                        <p className="font-bold mb-1 text-gray-900">🎯 Objetivo</p>
                        <p className="text-gray-700 font-medium">{tipo.objetivo}</p>
                      </div>
                      <div className="bg-white p-3 rounded border-2 border-blue-100">
                        <p className="font-bold mb-1 text-gray-900">💰 Capital</p>
                        <p className="text-gray-700 font-medium">{tipo.capital}</p>
                      </div>
                    </div>
                  </div>

                  {/* Características */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
                    <h3 className="text-xl font-bold mb-4 text-gray-900">⚙️ Características Principales</h3>
                    <ul className="grid md:grid-cols-2 gap-3">
                      {tipo.caracteristicas.map((car, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-white p-3 rounded border-2 border-purple-100">
                          <span className="text-purple-600 mt-1 font-bold">▪</span>
                          <span className="text-sm text-gray-800 font-medium">{car}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Ventajas */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                        ✅ Ventajas
                      </h3>
                      <ul className="space-y-2">
                        {tipo.ventajas.map((vent, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-600 mt-1 font-bold">+</span>
                            <span className="text-sm text-gray-800 font-medium">{vent}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Desventajas */}
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-lg border-2 border-red-200">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                        ⚠️ Desventajas
                      </h3>
                      <ul className="space-y-2">
                        {tipo.desventajas.map((desv, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-red-600 mt-1 font-bold">−</span>
                            <span className="text-sm text-gray-800 font-medium">{desv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Perfil Ideal */}
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-lg border-2 border-yellow-300">
                    <h3 className="text-lg font-bold mb-3 text-gray-900">👤 Perfil Ideal del Trader</h3>
                    <p className="text-sm mb-4 text-gray-800 font-medium">{tipo.perfil}</p>
                    <div className="pt-3 border-t border-yellow-300">
                      <p className="text-sm text-gray-800 font-medium">
                        <strong>Mercados recomendados:</strong> {tipo.mercados}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Comparativa */}
        <Card className="mt-12 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <CardHeader>
            <CardTitle className="text-2xl">📊 Comparativa Rápida de Estilos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left p-3">Estilo</th>
                    <th className="text-center p-3">Operaciones/día</th>
                    <th className="text-center p-3">Tiempo requerido</th>
                    <th className="text-center p-3">Estrés</th>
                    <th className="text-center p-3">Capital mínimo</th>
                    <th className="text-center p-3">Dificultad</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-secondary/20">
                    <td className="p-3 font-medium">Scalping</td>
                    <td className="text-center p-3">50-300+</td>
                    <td className="text-center p-3">Tiempo completo</td>
                    <td className="text-center p-3">🔴 Extremo</td>
                    <td className="text-center p-3">$25k+</td>
                    <td className="text-center p-3">🔴 Muy Alta</td>
                  </tr>
                  <tr className="border-b hover:bg-secondary/20">
                    <td className="p-3 font-medium">Day Trading</td>
                    <td className="text-center p-3">5-20</td>
                    <td className="text-center p-3">Tiempo completo</td>
                    <td className="text-center p-3">🟡 Alto</td>
                    <td className="text-center p-3">$10-25k</td>
                    <td className="text-center p-3">🟡 Alta</td>
                  </tr>
                  <tr className="border-b hover:bg-secondary/20">
                    <td className="p-3 font-medium">Swing Trading</td>
                    <td className="text-center p-3">0.5-2</td>
                    <td className="text-center p-3">2-3 hrs/día</td>
                    <td className="text-center p-3">🟢 Medio</td>
                    <td className="text-center p-3">$5-25k</td>
                    <td className="text-center p-3">🟢 Media</td>
                  </tr>
                  <tr className="border-b hover:bg-secondary/20">
                    <td className="p-3 font-medium">Position Trading</td>
                    <td className="text-center p-3">0.1-0.5</td>
                    <td className="text-center p-3">1 hr/semana</td>
                    <td className="text-center p-3">🟢 Bajo</td>
                    <td className="text-center p-3">$50k+</td>
                    <td className="text-center p-3">🟢 Baja</td>
                  </tr>
                  <tr className="border-b hover:bg-secondary/20">
                    <td className="p-3 font-medium">Algorítmico</td>
                    <td className="text-center p-3">Variable</td>
                    <td className="text-center p-3">Setup inicial alto</td>
                    <td className="text-center p-3">🟢 Bajo</td>
                    <td className="text-center p-3">$5-50k</td>
                    <td className="text-center p-3">🔴 Muy Alta</td>
                  </tr>
                  <tr className="hover:bg-secondary/20">
                    <td className="p-3 font-medium">Copy Trading</td>
                    <td className="text-center p-3">Automático</td>
                    <td className="text-center p-3">Mínimo</td>
                    <td className="text-center p-3">🟢 Muy Bajo</td>
                    <td className="text-center p-3">$500+</td>
                    <td className="text-center p-3">🟢 Muy Baja</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Consejo final */}
        <Card className="mt-8 bg-white border-2 border-blue-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-gray-900 font-bold">💡 Consejo Profesional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-800 font-medium">
              <strong>No existe un estilo "mejor"</strong> que otro. El mejor estilo de trading es el que:
            </p>
            <ul className="space-y-2 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1 font-bold">✓</span>
                <span className="text-gray-800 font-medium">Se adapta a tu personalidad y nivel de estrés</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1 font-bold">✓</span>
                <span className="text-gray-800 font-medium">Es compatible con tu disponibilidad de tiempo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1 font-bold">✓</span>
                <span className="text-gray-800 font-medium">Se ajusta a tu capital disponible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1 font-bold">✓</span>
                <span className="text-gray-800 font-medium">Coincide con tu nivel de experiencia</span>
              </li>
            </ul>
            <p className="text-gray-700 mt-4 font-medium">
              <strong>Recomendación:</strong> Los principiantes deberían comenzar con swing trading o copy trading 
              para aprender sin el estrés del intradiario. Una vez dominados conceptos fundamentales, 
              pueden progresar a estilos más activos si lo desean.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </LanguageGate>
  );
}
