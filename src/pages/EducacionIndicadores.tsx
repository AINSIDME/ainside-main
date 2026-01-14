import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, BarChart3, Activity, Target, Waves, LineChart, Compass, Gauge, Sparkles, Zap } from "lucide-react";

const indicadores = [
  {
    id: "rsi",
    nombre: "RSI (Relative Strength Index)",
    icono: <Gauge className="w-8 h-8" />,
    descripcion: "Mide la magnitud de los cambios de precio para evaluar condiciones de sobrecompra o sobreventa.",
    formula: "RSI = 100 - (100 / (1 + RS)), donde RS = (Promedio de ganancias) / (Promedio de pérdidas)",
    parametros: "Período: 14 barras (por defecto)",
    interpretacion: [
      "RSI > 70: Zona de sobrecompra (posible reversión bajista)",
      "RSI < 30: Zona de sobreventa (posible reversión alcista)",
      "Divergencias: Precio hace nuevos máximos/mínimos pero RSI no confirma",
      "Cruces de línea central (50): Cambio de tendencia"
    ],
    usos: [
      "Identificar puntos de entrada/salida",
      "Confirmar tendencias",
      "Detectar divergencias alcistas/bajistas",
      "Filtrar señales en estrategias automatizadas"
    ]
  },
  {
    id: "macd",
    nombre: "MACD (Moving Average Convergence Divergence)",
    icono: <Waves className="w-8 h-8" />,
    descripcion: "Indicador de momentum que muestra la relación entre dos medias móviles exponenciales.",
    formula: "MACD = EMA(12) - EMA(26), Señal = EMA(9) del MACD, Histograma = MACD - Señal",
    parametros: "EMA rápida: 12, EMA lenta: 26, Señal: 9",
    interpretacion: [
      "Cruce MACD sobre Señal: Señal alcista",
      "Cruce MACD bajo Señal: Señal bajista",
      "Histograma creciente: Momentum alcista aumentando",
      "Divergencias: Confirmación de reversiones"
    ],
    usos: [
      "Seguimiento de tendencias",
      "Señales de entrada/salida",
      "Confirmación de momentum",
      "Detección de cambios de tendencia"
    ]
  },
  {
    id: "bollinger",
    nombre: "Bandas de Bollinger",
    icono: <Activity className="w-8 h-8" />,
    descripcion: "Envolvente de volatilidad que se expande y contrae basada en la desviación estándar.",
    formula: "Banda Superior = SMA(20) + (2 × σ), Banda Inferior = SMA(20) - (2 × σ)",
    parametros: "Período: 20, Desviaciones: 2",
    interpretacion: [
      "Precio toca banda superior: Posible sobrecompra",
      "Precio toca banda inferior: Posible sobreventa",
      "Compresión (bandas estrechas): Baja volatilidad, posible ruptura",
      "Expansión: Alta volatilidad, tendencia fuerte"
    ],
    usos: [
      "Identificar niveles de sobrecompra/sobreventa",
      "Medir volatilidad",
      "Detectar rupturas (expansiones)",
      "Estrategias de reversión a la media"
    ]
  },
  {
    id: "ema",
    nombre: "EMA (Exponential Moving Average)",
    icono: <LineChart className="w-8 h-8" />,
    descripcion: "Media móvil que da más peso a los precios recientes.",
    formula: "EMA = Precio × (2/(n+1)) + EMA_anterior × (1 - (2/(n+1)))",
    parametros: "Períodos comunes: 9, 21, 50, 200",
    interpretacion: [
      "Precio sobre EMA: Tendencia alcista",
      "Precio bajo EMA: Tendencia bajista",
      "Cruce EMA rápida sobre lenta: Cruz Dorada (alcista)",
      "Cruce EMA rápida bajo lenta: Cruz de la Muerte (bajista)"
    ],
    usos: [
      "Identificar dirección de tendencia",
      "Niveles de soporte/resistencia dinámicos",
      "Sistemas de cruces",
      "Filtro de tendencia en estrategias"
    ]
  },
  {
    id: "atr",
    nombre: "ATR (Average True Range)",
    icono: <BarChart3 className="w-8 h-8" />,
    descripcion: "Mide la volatilidad del mercado mediante el rango promedio de movimiento.",
    formula: "TR = max(High-Low, |High-Close_prev|, |Low-Close_prev|), ATR = EMA(TR, 14)",
    parametros: "Período: 14 barras",
    interpretacion: [
      "ATR alto: Alta volatilidad, movimientos amplios",
      "ATR bajo: Baja volatilidad, consolidación",
      "ATR creciente: Volatilidad aumentando",
      "ATR decreciente: Mercado calmándose"
    ],
    usos: [
      "Calcular stop loss dinámicos",
      "Determinar tamaño de posición",
      "Ajustar objetivos de profit",
      "Filtrar operaciones por volatilidad"
    ]
  },
  {
    id: "stochastic",
    nombre: "Oscilador Estocástico",
    icono: <Sparkles className="w-8 h-8" />,
    descripcion: "Compara el precio de cierre con su rango de precios durante un período.",
    formula: "%K = 100 × (Close - Low_n) / (High_n - Low_n), %D = SMA(%K, 3)",
    parametros: "%K: 14, %D: 3, Suavizado: 3",
    interpretacion: [
      "%K > 80: Sobrecompra",
      "%K < 20: Sobreventa",
      "Cruce %K sobre %D: Señal alcista",
      "Divergencias: Posibles reversiones"
    ],
    usos: [
      "Identificar puntos de giro",
      "Confirmar sobrecompra/sobreventa",
      "Señales de entrada en rangos",
      "Filtro complementario con tendencia"
    ]
  },
  {
    id: "adx",
    nombre: "ADX (Average Directional Index)",
    icono: <TrendingUp className="w-8 h-8" />,
    descripcion: "Mide la fuerza de la tendencia sin indicar su dirección.",
    formula: "ADX = EMA(DX, 14), donde DX = 100 × |DI+ - DI-| / (DI+ + DI-)",
    parametros: "Período: 14, incluye DI+ y DI-",
    interpretacion: [
      "ADX > 25: Tendencia fuerte",
      "ADX < 20: Sin tendencia, mercado lateral",
      "ADX creciente: Tendencia fortaleciéndose",
      "DI+ > DI-: Tendencia alcista, DI- > DI+: Tendencia bajista"
    ],
    usos: [
      "Filtrar estrategias de tendencia",
      "Evitar operar en rangos",
      "Confirmar fuerza de breakouts",
      "Optimizar parámetros según tendencia"
    ]
  },
  {
    id: "fibonacci",
    nombre: "Retrocesos de Fibonacci",
    icono: <Compass className="w-8 h-8" />,
    descripcion: "Niveles basados en la secuencia de Fibonacci usados como soporte/resistencia.",
    formula: "Niveles: 23.6%, 38.2%, 50%, 61.8%, 78.6%",
    parametros: "Desde punto máximo a mínimo (o viceversa)",
    interpretacion: [
      "38.2% y 61.8%: Niveles más importantes",
      "50%: Nivel psicológico clave",
      "Retroceso + confirmación: Entrada a favor de tendencia",
      "Extensiones (127.2%, 161.8%): Objetivos de profit"
    ],
    usos: [
      "Identificar zonas de entrada",
      "Establecer niveles de stop loss",
      "Proyectar objetivos de precio",
      "Confirmar soportes/resistencias"
    ]
  },
  {
    id: "vwap",
    nombre: "VWAP (Volume Weighted Average Price)",
    icono: <Target className="w-8 h-8" />,
    descripcion: "Precio promedio ponderado por volumen, usado por institucionales.",
    formula: "VWAP = Σ(Precio × Volumen) / Σ(Volumen)",
    parametros: "Se resetea diariamente",
    interpretacion: [
      "Precio > VWAP: Sesión alcista",
      "Precio < VWAP: Sesión bajista",
      "Toque de VWAP: Nivel de reversión intraday",
      "Desviaciones del VWAP: Bandas de volatilidad"
    ],
    usos: [
      "Referencia de ejecución institucional",
      "Identificar valor justo intradiario",
      "Niveles de soporte/resistencia",
      "Filtro direccional para scalping"
    ]
  },
  {
    id: "ichimoku",
    nombre: "Ichimoku Kinko Hyo",
    icono: <Zap className="w-8 h-8" />,
    descripcion: "Sistema completo que muestra soporte, resistencia, dirección y momentum.",
    formula: "Tenkan: (9-high + 9-low)/2, Kijun: (26-high + 26-low)/2, Senkou A: (Tenkan+Kijun)/2, Senkou B: (52-high + 52-low)/2",
    parametros: "Tenkan: 9, Kijun: 26, Senkou B: 52",
    interpretacion: [
      "Precio sobre Nube: Tendencia alcista",
      "Tenkan cruza Kijun: Señal de entrada",
      "Nube verde: Soporte, Nube roja: Resistencia",
      "Chikou sobre precio: Confirmación alcista"
    ],
    usos: [
      "Sistema completo de trading",
      "Identificar tendencia multi-timeframe",
      "Niveles de soporte/resistencia futuros",
      "Confirmación de señales múltiples"
    ]
  }
];

export default function EducacionIndicadores() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900/95 to-slate-950/98 backdrop-blur-sm py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <div className="inline-block px-6 py-3 text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 rounded-full mb-8 tracking-wide uppercase border border-blue-500/30 backdrop-blur-sm shadow-lg">
            EDUCACIÓN TRADING
          </div>
          <h1 className="text-5xl md:text-7xl font-light text-slate-100 mb-8 leading-[1.1] tracking-tight">
            10 Herramientas Esenciales
            <br />
            <span className="font-normal bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              del Algotrading
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
            Domina los indicadores técnicos más utilizados en trading algorítmico. 
            Aprende sus fórmulas, interpretación y aplicaciones prácticas.
          </p>
        </div>

        <Tabs defaultValue={indicadores[0].id} className="space-y-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 h-auto p-2 bg-card">
            {indicadores.map((ind) => (
              <TabsTrigger 
                key={ind.id} 
                value={ind.id}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {ind.icono}
                <span className="hidden sm:inline">{ind.nombre.split('(')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {indicadores.map((ind) => (
            <TabsContent key={ind.id} value={ind.id} className="space-y-6">
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                      {ind.icono}
                    </div>
                    <div>
                      <CardTitle className="text-3xl">{ind.nombre}</CardTitle>
                      <CardDescription className="text-lg mt-2">
                        {ind.descripcion}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Fórmula */}
                  <div className="bg-slate-800/40 p-6 rounded-lg border border-slate-700/40">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      📐 Fórmula Matemática
                    </h3>
                    <code className="block text-sm bg-background p-4 rounded border font-mono">
                      {ind.formula}
                    </code>
                    <p className="text-sm text-muted-foreground mt-3">
                      <strong>Parámetros:</strong> {ind.parametros}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Interpretación */}
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        🔍 Interpretación
                      </h3>
                      <ul className="space-y-2">
                        {ind.interpretacion.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Usos Prácticos */}
                    <div className="bg-slate-800/40 p-6 rounded-lg border border-slate-700/40">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        ⚙️ Usos Prácticos
                      </h3>
                      <ul className="space-y-2">
                        {ind.usos.map((uso, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                            <span className="text-sm">{uso}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Consejos */}
                  <div className="bg-slate-800/60 p-6 rounded-lg border border-slate-700/50">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      💡 Consejo Profesional
                    </h3>
                    <p className="text-sm">
                      {ind.id === 'rsi' && "Combina RSI con análisis de tendencia. En tendencias fuertes, el RSI puede permanecer en zonas extremas por períodos prolongados."}
                      {ind.id === 'macd' && "El MACD funciona mejor en mercados con tendencia. En mercados laterales, puede generar señales falsas frecuentes."}
                      {ind.id === 'bollinger' && "Las bandas de Bollinger son excelentes para identificar volatilidad. Un 'squeeze' (contracción) a menudo precede movimientos explosivos."}
                      {ind.id === 'ema' && "Las EMAs de 20, 50 y 200 períodos son las más observadas. Los cruces entre ellas generan señales institucionales importantes."}
                      {ind.id === 'atr' && "Usa ATR para posicionar stops loss dinámicos. Un stop de 2x ATR debajo del precio es una práctica común."}
                      {ind.id === 'stochastic' && "Mejor en mercados laterales. Evita señales cuando el precio está en fuerte tendencia."}
                      {ind.id === 'adx' && "ADX no indica dirección, solo fuerza. Combínalo siempre con DI+ y DI- para dirección de tendencia."}
                      {ind.id === 'fibonacci' && "Los niveles funcionan mejor cuando confluyen con otros soportes/resistencias técnicas o EMAs importantes."}
                      {ind.id === 'vwap' && "Institucionales usan VWAP como benchmark. Precio alejándose significativamente del VWAP tiende a regresar (mean reversion)."}
                      {ind.id === 'ichimoku' && "Ichimoku es un sistema completo. La confirmación de múltiples componentes (Tenkan/Kijun cruce + precio sobre Kumo + Chikou) genera señales de alta probabilidad."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Sección adicional */}
        <Card className="mt-12 bg-gradient-to-r from-primary/10 to-blue-600/10 border-2">
          <CardHeader>
            <CardTitle className="text-2xl">🎯 Combinando Indicadores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Los traders profesionales rara vez usan un solo indicador. Las estrategias más exitosas combinan:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-background rounded-lg border">
                <h4 className="font-semibold mb-2">📊 Tendencia</h4>
                <p className="text-sm text-muted-foreground">EMA, ADX, Ichimoku para confirmar dirección</p>
              </div>
              <div className="p-4 bg-background rounded-lg border">
                <h4 className="font-semibold mb-2">⚡ Momentum</h4>
                <p className="text-sm text-muted-foreground">RSI, MACD, Stochastic para timing de entrada</p>
              </div>
              <div className="p-4 bg-background rounded-lg border">
                <h4 className="font-semibold mb-2">📈 Volatilidad</h4>
                <p className="text-sm text-muted-foreground">ATR, Bollinger para gestión de riesgo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
