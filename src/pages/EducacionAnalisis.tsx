import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Building2, Scale, TrendingUp } from "lucide-react";
import { LanguageGate } from "@/components/LanguageGate";

const analisisTecnico = {
  definicion: "El análisis técnico estudia movimientos históricos de precio y volumen para predecir futuros movimientos. Se basa en la premisa de que toda información está reflejada en el precio y que los patrones históricos tienden a repetirse.",
  principios: [
    {
      titulo: "El mercado lo descuenta todo",
      descripcion: "Toda información (fundamental, económica, psicológica) ya está reflejada en el precio. No necesitas conocer las razones detrás del movimiento."
    },
    {
      titulo: "El precio se mueve en tendencias",
      descripcion: "Los precios siguen tendencias (alcista, bajista, lateral) y es más probable que una tendencia continúe que se revierta."
    },
    {
      titulo: "La historia se repite",
      descripcion: "Los patrones de comportamiento humano (miedo, codicia) se repiten, creando patrones reconocibles en gráficos."
    }
  ],
  herramientas: [
    { nombre: "Gráficos de velas japonesas", uso: "Visualizar precio, apertura, cierre, máximo, mínimo" },
    { nombre: "Líneas de tendencia", uso: "Identificar dirección y fuerza de tendencia" },
    { nombre: "Soportes y resistencias", uso: "Niveles donde precio tiende a rebotar o romper" },
    { nombre: "Indicadores técnicos", uso: "RSI, MACD, Bollinger Bands, etc." },
    { nombre: "Patrones de gráfico", uso: "Cabeza y hombros, triángulos, banderas" },
    { nombre: "Volumen", uso: "Confirmar fuerza de movimientos" },
    { nombre: "Fibonacci", uso: "Retrocesos y extensiones para targets" },
    { nombre: "Medias móviles", uso: "Identificar tendencia y niveles dinámicos" }
  ],
  ventajas: [
    "Aplicable a cualquier mercado y timeframe",
    "No requiere conocimiento profundo del activo",
    "Señales claras de entrada/salida",
    "Útil para timing preciso",
    "Automatizable (trading algorítmico)",
    "Funciona en todos los horizontes temporales"
  ],
  desventajas: [
    "Ignora causas fundamentales del movimiento",
    "Señales falsas frecuentes",
    "Subjetivo (mismos datos, diferentes interpretaciones)",
    "No predice eventos extremos (cisnes negros)",
    "Puede generar sobreoperación",
    "Menos efectivo en mercados ilíquidos"
  ],
  mejorPara: [
    "Day traders y scalpers",
    "Swing traders de corto plazo",
    "Traders activos en general",
    "Mercados forex y futuros",
    "Trading de alta frecuencia",
    "Cuando el timing es crítico"
  ]
};

const analisisFundamental = {
  definicion: "El análisis fundamental evalúa el valor intrínseco de un activo basándose en factores económicos, financieros y cualitativos. Busca determinar si un activo está sobrevalorado o infravalorado respecto a su 'valor justo'.",
  principios: [
    {
      titulo: "Valor intrínseco vs precio de mercado",
      descripcion: "El precio de mercado puede diferir del valor real. Los fundamentalistas buscan esta discrepancia para comprar barato o vender caro."
    },
    {
      titulo: "Causas económicas impulsan precio",
      descripcion: "Ganancias, crecimiento económico, tasas de interés y políticas monetarias son los verdaderos drivers del precio a largo plazo."
    },
    {
      titulo: "Mean reversion a valor justo",
      descripcion: "Con tiempo suficiente, el precio de mercado convergirá hacia el valor intrínseco del activo."
    }
  ],
  herramientas: [
    { categoria: "Estados Financieros", items: ["Balance general", "Estado de resultados", "Flujo de caja", "Ratios financieros"] },
    { categoria: "Métricas de Valoración", items: ["P/E (Price-to-Earnings)", "P/B (Price-to-Book)", "EV/EBITDA", "PEG Ratio"] },
    { categoria: "Indicadores Económicos", items: ["PIB", "Tasa de desempleo", "Inflación (CPI)", "Tasas de interés"] },
    { categoria: "Factores Cualitativos", items: ["Calidad del management", "Ventaja competitiva (moat)", "Industria y tendencias", "Regulación"] },
    { categoria: "Noticias y Eventos", items: ["Earnings reports", "Decisiones de bancos centrales", "Datos macroeconómicos", "Eventos geopolíticos"] }
  ],
  ventajas: [
    "Identifica valor real vs especulación",
    "Perspectiva de largo plazo sólida",
    "Menos ruido de mercado",
    "Encuentra oportunidades antes que el mercado",
    "Base racional para inversiones",
    "Útil para inversión buy-and-hold"
  ],
  desventajas: [
    "No proporciona timing preciso de entrada/salida",
    "Requiere conocimiento profundo y tiempo de análisis",
    "Mercados pueden permanecer irracionales largo tiempo",
    "Menos útil en trading de corto plazo",
    "Difícil de cuantificar factores cualitativos",
    "Información puede estar desactualizada o incompleta"
  ],
  mejorPara: [
    "Inversores de largo plazo",
    "Value investors estilo Warren Buffett",
    "Position traders (semanas/meses)",
    "Inversión en acciones",
    "Macroeconomic traders (forex, commodities)",
    "Cuando el horizonte es >6 meses"
  ]
};

const diferenciasClaves = [
  {
    aspecto: "Horizonte Temporal",
    tecnico: "Corto plazo (minutos a semanas)",
    fundamental: "Largo plazo (meses a años)"
  },
  {
    aspecto: "Datos Utilizados",
    tecnico: "Precio, volumen, indicadores derivados",
    fundamental: "Estados financieros, economía, noticias"
  },
  {
    aspecto: "Objetivo",
    tecnico: "Predecir movimientos de precio",
    fundamental: "Determinar valor intrínseco"
  },
  {
    aspecto: "Pregunta Clave",
    tecnico: "¿Cuándo comprar/vender?",
    fundamental: "¿Qué comprar/vender?"
  },
  {
    aspecto: "Enfoque",
    tecnico: "Timing y momentum",
    fundamental: "Valor y calidad"
  },
  {
    aspecto: "Mercados Preferidos",
    tecnico: "Forex, futuros, trading activo",
    fundamental: "Acciones, bonos, inversión pasiva"
  },
  {
    aspecto: "Complejidad",
    tecnico: "Moderada (patrones visuales)",
    fundamental: "Alta (requiere contabilidad/economía)"
  },
  {
    aspecto: "Automatización",
    tecnico: "Fácilmente automatizable",
    fundamental: "Difícil de automatizar completamente"
  }
];

const enfoqueHibrido = [
  {
    estrategia: "Top-Down",
    descripcion: "Empieza con análisis fundamental (macro → sector → empresa) para seleccionar activos, luego usa técnico para timing de entrada/salida.",
    ejemplo: "Identificas que sector tech está infravalorado (fundamental), luego usas RSI y soportes para entrar en Nvidia en momento óptimo (técnico)."
  },
  {
    estrategia: "Bottom-Up con Confirmación Técnica",
    descripcion: "Análisis fundamental profundo de empresa individual, esperando confirmación técnica para ejecutar.",
    ejemplo: "Apple reporta earnings espectaculares (fundamental). Esperas breakout sobre resistencia en $180 para entrar (técnico)."
  },
  {
    estrategia: "Swing Trading Fundamental",
    descripcion: "Operaciones de días/semanas basadas en eventos fundamentales específicos, usando técnico para gestionar posición.",
    ejemplo: "Fed anuncia recorte de tasas (fundamental alcista para oro). Entras cuando oro rompe máximo previo y usas trailing stop técnico."
  },
  {
    estrategia: "Scalping en Eventos",
    descripcion: "Trading técnico puro pero solo alrededor de publicaciones fundamentales de alto impacto.",
    ejemplo: "5 minutos antes de NFP (nóminas no agrícolas), preparas órdenes técnicas en niveles clave para capturar volatilidad explosiva."
  }
];

export default function EducacionAnalisis() {
  return (
    <LanguageGate allowedLanguages={['es']}>
    <div className="min-h-screen bg-gradient-to-b from-slate-900/95 to-slate-950/98 backdrop-blur-sm py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <div className="inline-block px-6 py-3 text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 rounded-full mb-8 tracking-wide uppercase border border-blue-500/30 backdrop-blur-sm shadow-lg">
            EDUCACIÓN TRADING
          </div>
          <h1 className="text-5xl md:text-7xl font-light text-slate-100 mb-8 leading-[1.1] tracking-tight">
            Análisis Técnico vs
            <br />
            <span className="font-normal bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Análisis Fundamental
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
            Descubre las dos escuelas principales de análisis de mercados. Aprende cuándo usar cada una 
            y cómo combinarlas para maximizar tus probabilidades de éxito.
          </p>
        </div>

        <Tabs defaultValue="tecnico" className="space-y-8">
          <TabsList className="grid grid-cols-3 gap-2 h-auto p-2 bg-card">
            <TabsTrigger 
              value="tecnico"
              className="flex items-center gap-2 data-[state=active]:bg-slate-700/60 data-[state=active]:text-slate-100 p-3"
            >
              <LineChart className="w-5 h-5" />
              <span>Análisis Técnico</span>
            </TabsTrigger>
            <TabsTrigger 
              value="fundamental"
              className="flex items-center gap-2 data-[state=active]:bg-slate-700/60 data-[state=active]:text-slate-100 p-3"
            >
              <Building2 className="w-5 h-5" />
              <span>Análisis Fundamental</span>
            </TabsTrigger>
            <TabsTrigger 
              value="comparacion"
              className="flex items-center gap-2 data-[state=active]:bg-slate-700/60 data-[state=active]:text-slate-100 p-3"
            >
              <Scale className="w-5 h-5" />
              <span>Comparación</span>
            </TabsTrigger>
          </TabsList>

          {/* ANÁLISIS TÉCNICO */}
          <TabsContent value="tecnico" className="space-y-6">
            <Card className="border border-slate-700/40">
              <CardHeader className="bg-slate-800/60">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <LineChart className="w-8 h-8 text-slate-300" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl">Análisis Técnico</CardTitle>
                    <CardDescription className="text-lg mt-2">
                      El arte de leer gráficos y patrones de precio
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Definición */}
                <div className="bg-slate-800/40 p-6 rounded-lg border border-slate-700/40">
                  <h3 className="text-xl font-semibold mb-3">📖 ¿Qué es?</h3>
                  <p className="text-muted-foreground">{analisisTecnico.definicion}</p>
                </div>

                {/* Principios */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">🎯 Principios Fundamentales</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {analisisTecnico.principios.map((principio, idx) => (
                      <Card key={idx}>
                        <CardHeader>
                          <CardTitle className="text-lg">{principio.titulo}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{principio.descripcion}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Herramientas */}
                <div className="bg-slate-800/40 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">🛠️ Herramientas Principales</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {analisisTecnico.herramientas.map((herr, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-background p-4 rounded border">
                        <span className="text-slate-400 text-xl">▸</span>
                        <div>
                          <p className="font-semibold">{herr.nombre}</p>
                          <p className="text-sm text-muted-foreground">{herr.uso}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Ventajas */}
                  <div className="bg-slate-800/40 p-6 rounded-lg border border-slate-700/40">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      ✅ Ventajas
                    </h3>
                    <ul className="space-y-2">
                      {analisisTecnico.ventajas.map((vent, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-slate-400 mt-1">+</span>
                          <span className="text-sm">{vent}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Desventajas */}
                  <div className="bg-slate-800/40 p-6 rounded-lg border border-slate-700/40">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      ⚠️ Desventajas
                    </h3>
                    <ul className="space-y-2">
                      {analisisTecnico.desventajas.map((desv, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-slate-400 mt-1">−</span>
                          <span className="text-sm">{desv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Mejor para */}
                <div className="bg-slate-800/40 p-6 rounded-lg border border-slate-700/40">
                  <h3 className="text-lg font-semibold mb-3">👥 Mejor para:</h3>
                  <div className="flex flex-wrap gap-2">
                    {analisisTecnico.mejorPara.map((item, idx) => (
                      <span key={idx} className="bg-background px-3 py-1 rounded-full text-sm border">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANÁLISIS FUNDAMENTAL */}
          <TabsContent value="fundamental" className="space-y-6">
            <Card className="border-2 border-green-500/30">
              <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-800/60 rounded-lg">
                    <Building2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl">Análisis Fundamental</CardTitle>
                    <CardDescription className="text-lg mt-2">
                      La ciencia de evaluar el valor intrínseco
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Definición */}
                <div className="bg-slate-800/40 p-6 rounded-lg border border-slate-700/40">
                  <h3 className="text-xl font-semibold mb-3">📖 ¿Qué es?</h3>
                  <p className="text-muted-foreground">{analisisFundamental.definicion}</p>
                </div>

                {/* Principios */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">🎯 Principios Fundamentales</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {analisisFundamental.principios.map((principio, idx) => (
                      <Card key={idx}>
                        <CardHeader>
                          <CardTitle className="text-lg">{principio.titulo}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{principio.descripcion}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Herramientas */}
                <div className="bg-secondary/30 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">🛠️ Herramientas y Métricas</h3>
                  <div className="space-y-4">
                    {analisisFundamental.herramientas.map((cat, idx) => (
                      <div key={idx} className="bg-background p-4 rounded border">
                        <h4 className="font-semibold mb-2 text-green-600 dark:text-green-400">{cat.categoria}</h4>
                        <div className="flex flex-wrap gap-2">
                          {cat.items.map((item, i) => (
                            <span key={i} className="bg-slate-700/40 px-3 py-1 rounded text-sm">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Ventajas */}
                  <div className="bg-slate-800/40 p-6 rounded-lg border border-slate-700/40">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      ✅ Ventajas
                    </h3>
                    <ul className="space-y-2">
                      {analisisFundamental.ventajas.map((vent, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-slate-400 mt-1">+</span>
                          <span className="text-sm">{vent}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Desventajas */}
                  <div className="bg-slate-800/40 p-6 rounded-lg border border-slate-700/40">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      ⚠️ Desventajas
                    </h3>
                    <ul className="space-y-2">
                      {analisisFundamental.desventajas.map((desv, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-slate-400 mt-1">−</span>
                          <span className="text-sm">{desv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Mejor para */}
                <div className="bg-slate-800/40 p-6 rounded-lg border border-slate-700/40">
                  <h3 className="text-lg font-semibold mb-3">👥 Mejor para:</h3>
                  <div className="flex flex-wrap gap-2">
                    {analisisFundamental.mejorPara.map((item, idx) => (
                      <span key={idx} className="bg-background px-3 py-1 rounded-full text-sm border">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COMPARACIÓN */}
          <TabsContent value="comparacion" className="space-y-6">
            <Card className="border-2 border-purple-500/30">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-800/60 rounded-lg">
                    <Scale className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl">Comparación Directa</CardTitle>
                    <CardDescription className="text-lg mt-2">
                      Diferencias clave entre ambos enfoques
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2">
                        <th className="text-left p-4 font-bold text-lg">Aspecto</th>
                        <th className="text-left p-4 font-bold text-lg bg-blue-50 dark:bg-blue-950/20">
                          Análisis Técnico
                        </th>
                        <th className="text-left p-4 font-bold text-lg bg-slate-800/40">
                          Análisis Fundamental
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {diferenciasClaves.map((diff, idx) => (
                        <tr key={idx} className="border-b hover:bg-slate-800/20">
                          <td className="p-4 font-semibold">{diff.aspecto}</td>
                          <td className="p-4 bg-blue-50/50 dark:bg-blue-950/10">{diff.tecnico}</td>
                          <td className="p-4 bg-slate-800/30">{diff.fundamental}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Enfoque Híbrido */}
            <Card className="border border-slate-700/40">
              <CardHeader className="bg-slate-800/60">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-slate-300" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Enfoque Híbrido: Lo Mejor de Ambos Mundos</CardTitle>
                    <CardDescription className="text-base mt-2">
                      Los traders profesionales combinan ambos análisis para maximizar probabilidades
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {enfoqueHibrido.map((enfoque, idx) => (
                    <Card key={idx} className="border border-slate-700/40 hover:border-slate-600/60 transition-colors">
                      <CardHeader>
                        <CardTitle className="text-lg">{enfoque.estrategia}</CardTitle>
                        <CardDescription>{enfoque.descripcion}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-slate-800/40 p-4 rounded-lg">
                          <p className="text-sm">
                            <strong>📌 Ejemplo:</strong> {enfoque.ejemplo}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Conclusión */}
        <Card className="mt-12 bg-slate-800/40 border border-slate-700/40">
          <CardHeader>
            <CardTitle className="text-2xl">🎯 ¿Cuál Deberías Usar?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg">
              La respuesta depende de tu <strong>estilo de trading</strong>, <strong>horizonte temporal</strong> y <strong>objetivos</strong>:
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-800/40 rounded-lg border border-slate-700/40">
                <h3 className="font-bold text-lg mb-3 text-slate-300">
                  Solo Técnico
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>• Scalping y day trading</li>
                  <li>• Trading de forex/futuros</li>
                  <li>• Horizontes &lt; 1 semana</li>
                  <li>• Trading algorítmico</li>
                </ul>
              </div>

              <div className="p-6 bg-slate-800/40 rounded-lg border border-slate-700/40">
                <h3 className="font-bold text-lg mb-3 text-slate-300">
                  Solo Fundamental
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>• Value investing</li>
                  <li>• Horizontes &gt; 1 año</li>
                  <li>• Construcción de portafolio</li>
                  <li>• Buy-and-hold</li>
                </ul>
              </div>

              <div className="p-6 bg-slate-800/40 rounded-lg border border-slate-700/40">
                <h3 className="font-bold text-lg mb-3 text-slate-300">
                  Híbrido (Recomendado)
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>• Swing trading</li>
                  <li>• Position trading</li>
                  <li>• Horizontes 1 semana - 6 meses</li>
                  <li>• Trading de acciones</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-lg border border-slate-700/50">
              <h3 className="font-semibold mb-3">💡 Consejo de Experto</h3>
              <p className="text-sm mb-3">
                <strong>Warren Buffett</strong> (fundamental puro) y <strong>George Soros</strong> (híbrido técnico-macro) 
                son billonarios con enfoques opuestos. Ambos funcionan si se aplican correctamente.
              </p>
              <p className="text-sm">
                <strong>Recomendación:</strong> Principiantes deberían comenzar con <strong>técnico básico</strong> (más 
                simple y visual) y gradualmente incorporar <strong>análisis fundamental</strong> para decisiones de 
                qué activos tradear. El enfoque híbrido es el más versátil.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </LanguageGate>
  );
}
