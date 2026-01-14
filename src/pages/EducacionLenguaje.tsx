import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LanguageGate } from "@/components/LanguageGate";

const terminosBasicos = [
  { termino: "Bull / Alcista", significado: "Mercado o trader que espera subidas de precio", emoji: "🐂" },
  { termino: "Bear / Bajista", significado: "Mercado o trader que espera caídas de precio", emoji: "🐻" },
  { termino: "Long / Comprado", significado: "Posición de compra esperando que suba", emoji: "📈" },
  { termino: "Short / Vendido", significado: "Posición de venta esperando que baje", emoji: "📉" },
  { termino: "Pip", significado: "Mínima unidad de cambio en forex (0.0001)", emoji: "📏" },
  { termino: "Tick", significado: "Mínimo movimiento de precio en futuros", emoji: "⚡" },
  { termino: "Spread", significado: "Diferencia entre precio de compra (ask) y venta (bid)", emoji: "💸" },
  { termino: "Leverage / Apalancamiento", significado: "Operar con capital prestado (ej: 10:1 = controlas $10 con $1)", emoji: "🔧" },
  { termino: "Margin / Margen", significado: "Capital requerido para abrir posición apalancada", emoji: "💰" },
  { termino: "Stop Loss", significado: "Orden automática para cerrar posición si precio llega a nivel de pérdida", emoji: "🛑" },
  { termino: "Take Profit", significado: "Orden automática para cerrar posición al alcanzar objetivo de ganancia", emoji: "🎯" },
  { termino: "Breakout", significado: "Ruptura de nivel importante de soporte o resistencia", emoji: "💥" },
  { termino: "Pullback", significado: "Retroceso temporal en una tendencia antes de continuar", emoji: "↩️" },
  { termino: "Gap", significado: "Hueco en gráfico por diferencia entre cierre y apertura", emoji: "⛔" },
  { termino: "Slippage", significado: "Diferencia entre precio esperado y precio ejecutado", emoji: "🎢" }
];

const jergaAvanzada = [
  { termino: "FOMO", significado: "Fear Of Missing Out - Miedo a perderse una oportunidad", contexto: "'Entré por FOMO y me atraparon en el tope'" },
  { termino: "Bag Holder", significado: "Trader atrapado en pérdidas que no cierra posición", contexto: "'Soy bag holder de Tesla desde $400'" },
  { termino: "Diamond Hands 💎🙌", significado: "Mantener posición sin vender pese a volatilidad", contexto: "'Diamond hands en Bitcoin hasta $100k'" },
  { termino: "Paper Hands 📄🙌", significado: "Vender demasiado rápido por miedo o impaciencia", contexto: "'Vendí con paper hands justo antes del pump'" },
  { termino: "Pump & Dump", significado: "Manipulación: subir precio artificialmente y luego vender", contexto: "'Esa shitcoin fue un pump and dump clásico'" },
  { termino: "HODL", significado: "Hold On for Dear Life - Mantener largo plazo (origen: typo 'hold')", contexto: "'HODL Bitcoin sin importar FUD'" },
  { termino: "FUD", significado: "Fear, Uncertainty, Doubt - Noticias negativas que causan pánico", contexto: "'Ese artículo es puro FUD para bajarlo'" },
  { termino: "To the Moon 🚀", significado: "Expectativa de subida explosiva", contexto: "'Tesla to the moon después de earnings'" },
  { termino: "Bag", significado: "Posición grande (especialmente en pérdidas)", contexto: "'Tengo una bag pesada de Nvidia'" },
  { termino: "Ape / Aping In", significado: "Entrar impulsivamente sin análisis", contexto: "'Apeé en esa memecoin y perdí todo'" },
  { termino: "Dip", significado: "Caída temporal en precio (oportunidad de compra)", contexto: "'Buy the dip en S&P 500'" },
  { termino: "Rekt / Wrecked", significado: "Destrozado financieramente por pérdidas masivas", contexto: "'Me quedé rekt operando con 100x leverage'" },
  { termino: "Whale", significado: "Trader/inversor con capital masivo que mueve mercado", contexto: "'Una whale acaba de comprar 1000 BTC'" },
  { termino: "Shitcoin", significado: "Criptomoneda sin valor o proyecto real", contexto: "'No inviertas en esa shitcoin sin utilidad'" },
  { termino: "YOLO", significado: "You Only Live Once - Apuesta arriesgada con todo el capital", contexto: "'YOLO en Tesla calls vencimiento mañana'" }
];

const ordenesEjecucion = [
  { tipo: "Market Order", descripcion: "Orden ejecutada inmediatamente al mejor precio disponible", cuando: "Urgencia, alta liquidez" },
  { tipo: "Limit Order", descripcion: "Orden a precio específico o mejor", cuando: "Quieres controlar precio exacto" },
  { tipo: "Stop Order", descripcion: "Se activa cuando precio alcanza nivel (se convierte en market)", cuando: "Stop loss, entrada en breakout" },
  { tipo: "Stop Limit", descripcion: "Stop que se convierte en limit (no garantiza ejecución)", cuando: "Control de precio en stop" },
  { tipo: "Trailing Stop", descripcion: "Stop que se mueve automáticamente con precio favorable", cuando: "Proteger ganancias mientras corre" },
  { tipo: "OCO (One Cancels Other)", descripcion: "Dos órdenes donde ejecutar una cancela la otra", cuando: "Take profit + stop loss simultáneos" },
  { tipo: "Iceberg Order", descripcion: "Orden grande dividida en partes pequeñas ocultas", cuando: "Institucional, evitar mover mercado" }
];

const ratiosComunes = [
  { ratio: "Risk/Reward (R:R)", explicacion: "Relación entre riesgo asumido y ganancia potencial", ejemplo: "2:1 = Arriesgo $100 para ganar $200" },
  { ratio: "Win Rate", explicacion: "Porcentaje de operaciones ganadoras", ejemplo: "60% win rate = 60 trades ganadores de 100" },
  { ratio: "Sharpe Ratio", explicacion: "Rentabilidad ajustada por riesgo (>1 es bueno)", ejemplo: "Sharpe 2.5 = excelente rentabilidad vs volatilidad" },
  { ratio: "Max Drawdown", explicacion: "Mayor caída desde pico a valle", ejemplo: "15% max DD = cuenta cayó 15% en peor momento" },
  { ratio: "Profit Factor", explicacion: "Ganancias totales / Pérdidas totales", ejemplo: "PF 2.0 = Ganas $2 por cada $1 perdido" },
  { ratio: "Expectancy", explicacion: "Ganancia promedio esperada por trade", ejemplo: "$50 expectancy = esperas ganar $50/trade a largo plazo" }
];

const sesionesHorarias = [
  { sesion: "Sydney", horario: "17:00-02:00 ET", pares: "AUD/USD, AUD/JPY", volatilidad: "Baja" },
  { sesion: "Tokyo", horario: "19:00-04:00 ET", pares: "USD/JPY, EUR/JPY", volatilidad: "Media" },
  { sesion: "London", horario: "03:00-12:00 ET", pares: "EUR/USD, GBP/USD", volatilidad: "Alta" },
  { sesion: "New York", horario: "08:00-17:00 ET", pares: "Todos los USD", volatilidad: "Muy Alta" },
  { sesion: "Overlap London-NY", horario: "08:00-12:00 ET", pares: "Todos los majors", volatilidad: "Máxima" }
];

export default function EducacionLenguaje() {
  return (
    <LanguageGate allowedLanguages={['es']}>
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <div className="inline-block px-6 py-3 text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full mb-8 tracking-wide uppercase shadow-lg">
            EDUCACIÓN TRADING
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-[1.1] tracking-tight">
            El Lenguaje de los Traders
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Domina la jerga, términos técnicos y expresiones que usan los traders profesionales. 
            Desde conceptos básicos hasta slang avanzado de las comunidades de trading.
          </p>
        </div>

        {/* Términos Básicos */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">📚 Términos Básicos Esenciales</CardTitle>
            <CardDescription>Vocabulario fundamental que todo trader debe conocer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {terminosBasicos.map((item, idx) => (
                <div key={idx} className="p-4 bg-secondary/30 rounded-lg border hover:border-slate-600/60 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{item.emoji}</span>
                    <h3 className="font-semibold">{item.termino}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.significado}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Jerga Avanzada */}
        <Card className="mb-8 bg-gradient-to-r from-orange-500/10 to-red-500/10">
          <CardHeader>
            <CardTitle className="text-2xl">🚀 Jerga y Slang de Traders</CardTitle>
            <CardDescription>Expresiones populares en comunidades de trading y redes sociales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jergaAvanzada.map((item, idx) => (
                <div key={idx} className="p-4 bg-background rounded-lg border">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="text-sm font-bold">{item.termino}</Badge>
                    <p className="text-sm flex-1">{item.significado}</p>
                  </div>
                  <p className="text-sm text-muted-foreground italic ml-2 mt-2">
                    💬 Ejemplo: "{item.contexto}"
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tipos de Órdenes */}
        <Card className="mb-8 bg-slate-800/40 border border-slate-700/40">
          <CardHeader>
            <CardTitle className="text-2xl">📋 Tipos de Órdenes</CardTitle>
            <CardDescription>Órdenes de ejecución que todo trader debe dominar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ordenesEjecucion.map((orden, idx) => (
                <div key={idx} className="p-4 bg-background rounded-lg border flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{orden.tipo}</h3>
                    <p className="text-sm text-muted-foreground">{orden.descripcion}</p>
                  </div>
                  <div className="md:w-1/3">
                    <Badge className="whitespace-normal">Cuándo usar: {orden.cuando}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ratios y Métricas */}
        <Card className="mb-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <CardHeader>
            <CardTitle className="text-2xl">📊 Ratios y Métricas de Performance</CardTitle>
            <CardDescription>Indicadores clave para medir tu rendimiento como trader</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {ratiosComunes.map((ratio, idx) => (
                <div key={idx} className="p-5 bg-background rounded-lg border">
                  <h3 className="font-bold text-lg mb-2 text-slate-300">{ratio.ratio}</h3>
                  <p className="text-sm mb-3">{ratio.explicacion}</p>
                  <div className="bg-secondary/30 p-3 rounded">
                    <p className="text-sm font-mono">
                      <strong>Ejemplo:</strong> {ratio.ejemplo}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sesiones de Trading */}
        <Card className="mb-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
          <CardHeader>
            <CardTitle className="text-2xl">🌍 Sesiones Horarias Globales (Forex)</CardTitle>
            <CardDescription>Horarios de mayor actividad en mercados internacionales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left p-3">Sesión</th>
                    <th className="text-left p-3">Horario (ET)</th>
                    <th className="text-left p-3">Pares más activos</th>
                    <th className="text-center p-3">Volatilidad</th>
                  </tr>
                </thead>
                <tbody>
                  {sesionesHorarias.map((sesion, idx) => (
                    <tr key={idx} className="border-b hover:bg-secondary/20">
                      <td className="p-3 font-semibold">{sesion.sesion}</td>
                      <td className="p-3 font-mono">{sesion.horario}</td>
                      <td className="p-3">{sesion.pares}</td>
                      <td className="text-center p-3">
                        <Badge variant={sesion.volatilidad.includes('Alta') || sesion.volatilidad.includes('Máxima') ? 'default' : 'secondary'}>
                          {sesion.volatilidad}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              💡 <strong>Tip:</strong> El overlap Londres-Nueva York (08:00-12:00 ET) es el período de mayor liquidez 
              y volatilidad en forex. Ideal para day trading de pares EUR/USD y GBP/USD.
            </p>
          </CardContent>
        </Card>

        {/* Expresiones de Estado Emocional */}
        <Card className="border border-slate-700/40">
          <CardHeader>
            <CardTitle className="text-2xl">🎭 Estados Emocionales del Trader</CardTitle>
            <CardDescription>Expresiones que describen el estado mental en trading</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-slate-300 mb-3">✅ Estados Positivos</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-slate-800/40 rounded border border-slate-700/40">
                    <p className="font-semibold">En la Zona</p>
                    <p className="text-sm text-muted-foreground">Estado de flow perfecto, todo sale bien</p>
                  </div>
                  <div className="p-3 bg-slate-800/40 rounded border border-slate-700/40">
                    <p className="font-semibold">Aplastándola</p>
                    <p className="text-sm text-muted-foreground">Racha ganadora espectacular</p>
                  </div>
                  <div className="p-3 bg-slate-800/40 rounded border border-slate-700/40">
                    <p className="font-semibold">Imprimiendo Dinero 🖨️💰</p>
                    <p className="text-sm text-muted-foreground">Ganancias fáciles y consistentes</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-slate-300 mb-3">⚠️ Estados Negativos</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-slate-800/40 rounded border border-slate-700/40">
                    <p className="font-semibold">Descontrolado / Tilt</p>
                    <p className="text-sm text-muted-foreground">Estado emocional comprometido, revenge trading</p>
                  </div>
                  <div className="p-3 bg-slate-800/40 rounded border border-slate-700/40">
                    <p className="font-semibold">Cuenta Reventada</p>
                    <p className="text-sm text-muted-foreground">Cuenta liquidada, pérdida total</p>
                  </div>
                  <div className="p-3 bg-slate-800/40 rounded border border-slate-700/40">
                    <p className="font-semibold">Atrapar Cuchillos Cayendo</p>
                    <p className="text-sm text-muted-foreground">Intentar comprar en caída libre (muy peligroso)</p>
                  </div>
                  <div className="p-3 bg-slate-800/40 rounded border border-slate-700/40">
                    <p className="font-semibold">Trampa FOMO</p>
                    <p className="text-sm text-muted-foreground">Entrar tarde por miedo a perderse el movimiento</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recursos adicionales */}
        <Card className="mt-8 bg-slate-800/40 border border-slate-700/40">
          <CardHeader>
            <CardTitle>🎓 Domina el Lenguaje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              El lenguaje de trading evoluciona constantemente, especialmente con nuevas generaciones 
              de traders en redes sociales (Twitter, Discord, Reddit). Familiarizarte con estos términos te ayudará a:
            </p>
            <ul className="space-y-2 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-slate-400 mt-1">✓</span>
                <span><strong>Comunicarte efectivamente</strong> en comunidades de trading</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400 mt-1">✓</span>
                <span><strong>Entender análisis</strong> de traders profesionales en redes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400 mt-1">✓</span>
                <span><strong>Interpretar noticias</strong> y reportes financieros correctamente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400 mt-1">✓</span>
                <span><strong>Evitar confusiones</strong> al ejecutar órdenes o gestionar riesgo</span>
              </li>
            </ul>
            <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700/50 mt-4">
              <p className="text-sm">
                <strong>⚠️ Advertencia:</strong> Aunque la jerga y memes son parte de la cultura trading, 
                nunca bases decisiones de inversión en FOMO, hype o presión social. Mantén siempre 
                un enfoque disciplinado y basado en análisis.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </LanguageGate>
  );
}
