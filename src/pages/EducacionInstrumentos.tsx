import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Building2, Bitcoin, Globe, Gem, Wheat, Fuel, ShieldCheck, RefreshCw } from "lucide-react";

const instrumentos = [
  {
    id: "acciones",
    nombre: "Acciones",
    icono: <TrendingUp className="w-8 h-8" />,
    descripcion: "Participación accionaria en empresas públicas cotizadas en bolsa",
    definicion: "Una acción representa una fracción del capital social de una empresa. Al comprar acciones, te conviertes en propietario parcial de la compañía.",
    caracteristicas: [
      "Liquidez: Alta en mercados principales (NYSE, NASDAQ)",
      "Horario: Sesiones específicas (9:30-16:00 ET en EE.UU.)",
      "Apalancamiento: Limitado (típicamente 2:1 con margen)",
      "Dividendos: Algunas empresas distribuyen ganancias"
    ],
    ventajas: [
      "Propiedad real de empresas",
      "Potencial de dividendos",
      "Derechos de voto en juntas",
      "Regulación transparente"
    ],
    riesgos: [
      "Riesgo de quiebra empresarial",
      "Volatilidad según noticias corporativas",
      "Gap de apertura/cierre",
      "Comisiones por transacción"
    ],
    ejemplos: "Apple (AAPL), Microsoft (MSFT), Amazon (AMZN), Tesla (TSLA)"
  },
  {
    id: "futuros",
    nombre: "Futuros",
    icono: <RefreshCw className="w-8 h-8" />,
    descripcion: "Contratos estandarizados para comprar/vender un activo en fecha futura",
    definicion: "Un contrato de futuros obliga a comprar o vender un activo específico a precio predeterminado en una fecha futura. Son instrumentos derivados con alto apalancamiento.",
    caracteristicas: [
      "Apalancamiento: 10:1 hasta 50:1 según activo",
      "Horario: Casi 24/5 (depende del activo)",
      "Márgenes: Requiere margen inicial y mantenimiento",
      "Vencimiento: Contratos con fechas específicas"
    ],
    ventajas: [
      "Alto apalancamiento",
      "Liquidez institucional",
      "Posiciones cortas sin restricciones",
      "Cobertura (hedging) efectiva"
    ],
    riesgos: [
      "Pérdidas pueden exceder capital inicial",
      "Margin calls (llamadas de margen)",
      "Slippage en mercados volátiles",
      "Complejidad en rollover de contratos"
    ],
    ejemplos: "E-mini S&P 500 (ES), Crude Oil (CL), Gold (GC), EUR/USD futures"
  },
  {
    id: "indices",
    nombre: "Índices",
    icono: <Building2 className="w-8 h-8" />,
    descripcion: "Medidas estadísticas que representan un segmento del mercado",
    definicion: "Un índice es una canasta de acciones u otros activos que representa un sector, mercado o economía. Se opera mediante ETFs, futuros o CFDs.",
    caracteristicas: [
      "Diversificación: Exposición a múltiples empresas",
      "Ponderación: Por capitalización o igual peso",
      "Rebalanceo: Periódico según criterios",
      "No se compra directamente: Vía derivados o ETFs"
    ],
    ventajas: [
      "Diversificación automática",
      "Menor riesgo que acciones individuales",
      "Refleja economía completa",
      "Costos más bajos que comprar cada acción"
    ],
    riesgos: [
      "Movimientos pueden ser lentos",
      "Sesgo a empresas grandes (cap-weighted)",
      "No proteges contra caídas sectoriales",
      "Costos de gestión en ETFs"
    ],
    ejemplos: "S&P 500, Dow Jones, NASDAQ 100, DAX 30, FTSE 100"
  },
  {
    id: "cripto",
    nombre: "Criptomonedas",
    icono: <Bitcoin className="w-8 h-8" />,
    descripcion: "Activos digitales descentralizados basados en blockchain",
    definicion: "Monedas virtuales que utilizan criptografía para asegurar transacciones. Operan en redes descentralizadas sin intermediarios bancarios.",
    caracteristicas: [
      "Disponibilidad: 24/7/365",
      "Volatilidad: Extremadamente alta",
      "Custodia: Wallets digitales (hot/cold)",
      "Regulación: Variable según jurisdicción"
    ],
    ventajas: [
      "Mercado siempre abierto",
      "Sin intermediarios",
      "Transacciones globales rápidas",
      "Potencial de alta rentabilidad"
    ],
    riesgos: [
      "Volatilidad extrema (swings de 10-20%)",
      "Hacks y pérdida de fondos",
      "Regulación incierta",
      "Manipulación de mercado"
    ],
    ejemplos: "Bitcoin (BTC), Ethereum (ETH), Binance Coin (BNB), Solana (SOL)"
  },
  {
    id: "forex",
    nombre: "Forex (Divisas)",
    icono: <Globe className="w-8 h-8" />,
    descripcion: "Mercado de intercambio de monedas internacionales",
    definicion: "El mercado forex es el más grande del mundo (6+ trillones diarios). Se operan pares de divisas donde compras una y vendes otra simultáneamente.",
    caracteristicas: [
      "Volumen: $6.6 trillones diarios",
      "Horario: 24/5 (domingo 17:00 - viernes 17:00 ET)",
      "Apalancamiento: 50:1 hasta 500:1",
      "Spreads: Muy bajos en pares mayores"
    ],
    ventajas: [
      "Máxima liquidez mundial",
      "Apalancamiento alto",
      "Spreads competitivos",
      "Sin comisiones (spread incluido)"
    ],
    riesgos: [
      "Apalancamiento puede amplificar pérdidas",
      "Eventos geopolíticos impactan fuerte",
      "Brokers no regulados (fraudes)",
      "Requiere análisis fundamental complejo"
    ],
    ejemplos: "EUR/USD, GBP/USD, USD/JPY, AUD/USD, USD/CHF"
  },
  {
    id: "metales",
    nombre: "Metales Preciosos",
    icono: <Gem className="w-8 h-8" />,
    descripcion: "Commodities de alto valor usados como reserva de valor",
    definicion: "Metales como oro y plata han sido reservas de valor por milenios. Se usan para protección contra inflación y crisis.",
    caracteristicas: [
      "Oro: Activo refugio por excelencia",
      "Plata: Industrial y monetario",
      "Platino/Paladio: Uso industrial automotriz",
      "Correlación inversa: Con dólar y acciones (a veces)"
    ],
    ventajas: [
      "Protección contra inflación",
      "Activo refugio en crisis",
      "Correlación baja con acciones",
      "Demanda física constante"
    ],
    riesgos: [
      "No generan dividendos ni intereses",
      "Costos de almacenamiento físico",
      "Manipulación por bancos centrales",
      "Volatilidad en plata y platino"
    ],
    ejemplos: "Gold (XAU/USD), Silver (XAG/USD), Platinum, Palladium"
  },
  {
    id: "commodities",
    nombre: "Materias Primas",
    icono: <Wheat className="w-8 h-8" />,
    descripcion: "Recursos naturales y productos agrícolas",
    definicion: "Materias primas son recursos físicos que se extraen, cultivan o producen. Incluyen energía, agricultura y metales industriales.",
    caracteristicas: [
      "Estacionalidad: Agrícolas siguen ciclos de cosecha",
      "Geopolítica: Energía sensible a conflictos",
      "Clima: Impacta agricultura significativamente",
      "Contratos físicos: Requieren entrega o rollover"
    ],
    ventajas: [
      "Diversificación de portafolio",
      "Cobertura contra inflación",
      "Demanda global constante",
      "Patrones estacionales predecibles"
    ],
    riesgos: [
      "Alta volatilidad",
      "Factores climáticos impredecibles",
      "Costos de almacenamiento",
      "Rollover costs en futuros"
    ],
    ejemplos: "Petróleo (WTI, Brent), Gas Natural, Trigo, Maíz, Café, Cobre"
  },
  {
    id: "energia",
    nombre: "Energía",
    icono: <Fuel className="w-8 h-8" />,
    descripcion: "Combustibles fósiles y recursos energéticos",
    definicion: "Los mercados de energía incluyen petróleo crudo, gas natural y productos refinados. Son fundamentales para la economía global.",
    caracteristicas: [
      "Petróleo: WTI (US) y Brent (Europa/Global)",
      "Gas Natural: Alta volatilidad estacional",
      "Inventarios: Publicaciones semanales mueven mercado",
      "OPEC: Controla oferta y precios"
    ],
    ventajas: [
      "Alta volatilidad = oportunidades",
      "Calendarios económicos predecibles",
      "Correlaciones claras con economía",
      "Mercado muy líquido"
    ],
    riesgos: [
      "Eventos geopolíticos extremos",
      "Inventarios pueden causar gaps",
      "Estacionalidad fuerte (invierno/verano)",
      "Transición energética (largo plazo)"
    ],
    ejemplos: "WTI Crude Oil, Brent Crude, Natural Gas (NG), Heating Oil"
  }
];

const conceptosAvanzados = [
  {
    nombre: "Swaps",
    descripcion: "Acuerdos para intercambiar flujos de pagos entre dos partes.",
    detalles: [
      "Interest Rate Swaps: Intercambio de tasa fija por variable",
      "Currency Swaps: Intercambio de principal y intereses en diferentes monedas",
      "Commodity Swaps: Fijan precios de materias primas",
      "Credit Default Swaps (CDS): Seguros contra default de deuda"
    ],
    uso: "Principalmente institucional. Hedging de riesgo de tasas, divisas o crédito."
  },
  {
    nombre: "Opciones (Options)",
    descripcion: "Derecho (no obligación) de comprar/vender a precio específico.",
    detalles: [
      "Call: Derecho a comprar",
      "Put: Derecho a vender",
      "Premium: Precio de la opción",
      "Strike Price: Precio de ejercicio",
      "Expiration: Fecha de vencimiento",
      "Greeks: Delta, Gamma, Theta, Vega (sensibilidades)"
    ],
    uso: "Especulación con riesgo limitado, hedging, generación de ingresos (covered calls)."
  },
  {
    nombre: "CFDs (Contracts for Difference)",
    descripcion: "Contratos que replican movimientos de precio sin poseer el activo.",
    detalles: [
      "No hay propiedad del activo subyacente",
      "Apalancamiento alto (10:1 a 500:1)",
      "Costos de financiamiento overnight",
      "Disponible para múltiples activos"
    ],
    uso: "Trading especulativo con apalancamiento. Común en Europa (restringido en EE.UU.)."
  },
  {
    nombre: "ETFs (Exchange Traded Funds)",
    descripcion: "Fondos que cotizan en bolsa y replican índices o sectores.",
    detalles: [
      "Compran canasta de activos automáticamente",
      "Liquidez intraday (se operan como acciones)",
      "Costos bajos vs mutual funds",
      "ETFs inversos y apalancados disponibles"
    ],
    uso: "Inversión pasiva, diversificación instantánea, exposición sectorial."
  },
  {
    nombre: "Carry Trade",
    descripcion: "Estrategia que explota diferencias en tasas de interés entre divisas.",
    detalles: [
      "Pedir prestado en moneda con tasa baja",
      "Invertir en moneda con tasa alta",
      "Beneficio: Diferencial de tasas (swap positivo)",
      "Riesgo: Movimientos adversos de tipo de cambio"
    ],
    uso: "Forex principalmente. Requiere mercados estables."
  },
  {
    nombre: "Dark Pools",
    descripcion: "Plataformas de trading privadas para grandes bloques institucionales.",
    detalles: [
      "No muestran órdenes públicamente",
      "Usados por institucionales para evitar slippage",
      "~40% del volumen de acciones en EE.UU.",
      "Menor transparencia de precios"
    ],
    uso: "Ejecución institucional. No accesible para retail directamente."
  }
];

export default function EducacionInstrumentos() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Guía Completa de Instrumentos Financieros
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Aprende todo sobre acciones, futuros, divisas, criptomonedas y conceptos avanzados 
            como swaps y derivados. Educación profesional para traders serios.
          </p>
        </div>

        <Tabs defaultValue={instrumentos[0].id} className="space-y-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 h-auto p-2 bg-card">
            {instrumentos.map((inst) => (
              <TabsTrigger 
                key={inst.id} 
                value={inst.id}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground p-3"
              >
                {inst.icono}
                <span>{inst.nombre}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {instrumentos.map((inst) => (
            <TabsContent key={inst.id} value={inst.id} className="space-y-6">
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                      {inst.icono}
                    </div>
                    <div>
                      <CardTitle className="text-3xl">{inst.nombre}</CardTitle>
                      <CardDescription className="text-lg mt-2">
                        {inst.descripcion}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Definición */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="text-xl font-semibold mb-3">📖 ¿Qué es?</h3>
                    <p className="text-muted-foreground">{inst.definicion}</p>
                  </div>

                  {/* Características */}
                  <div className="bg-secondary/30 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">⚙️ Características Clave</h3>
                    <ul className="grid md:grid-cols-2 gap-3">
                      {inst.caracteristicas.map((car, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-background p-3 rounded border">
                          <span className="text-primary mt-1">▪</span>
                          <span className="text-sm">{car}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Ventajas */}
                    <div className="bg-green-50 dark:bg-green-950/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        ✅ Ventajas
                      </h3>
                      <ul className="space-y-2">
                        {inst.ventajas.map((vent, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-600 dark:text-green-400 mt-1">+</span>
                            <span className="text-sm">{vent}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Riesgos */}
                    <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        ⚠️ Riesgos
                      </h3>
                      <ul className="space-y-2">
                        {inst.riesgos.map((riesgo, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-red-600 dark:text-red-400 mt-1">−</span>
                            <span className="text-sm">{riesgo}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Ejemplos */}
                  <div className="bg-purple-50 dark:bg-purple-950/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h3 className="text-lg font-semibold mb-3">🎯 Ejemplos Populares</h3>
                    <p className="text-sm font-mono bg-background p-3 rounded">{inst.ejemplos}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Conceptos Avanzados */}
        <Card className="mt-12 border-2 border-purple-500/30">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <CardTitle className="text-3xl flex items-center gap-3">
              <ShieldCheck className="w-8 h-8" />
              Conceptos Avanzados
            </CardTitle>
            <CardDescription className="text-lg">
              Instrumentos y estrategias para traders e inversores experimentados
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {conceptosAvanzados.map((concepto, idx) => (
                <Card key={idx} className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-xl">{concepto.nombre}</CardTitle>
                    <CardDescription>{concepto.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Detalles:</h4>
                      <ul className="space-y-1">
                        {concepto.detalles.map((det, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{det}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-sm">
                        <strong>Uso típico:</strong> {concepto.uso}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comparativa rápida */}
        <Card className="mt-12 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <CardHeader>
            <CardTitle className="text-2xl">📊 Comparativa Rápida</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left p-3">Instrumento</th>
                    <th className="text-center p-3">Apalancamiento</th>
                    <th className="text-center p-3">Horario</th>
                    <th className="text-center p-3">Volatilidad</th>
                    <th className="text-center p-3">Nivel</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-secondary/20">
                    <td className="p-3 font-medium">Acciones</td>
                    <td className="text-center p-3">Bajo (2:1)</td>
                    <td className="text-center p-3">Sesiones</td>
                    <td className="text-center p-3">Media</td>
                    <td className="text-center p-3">🟢 Principiante</td>
                  </tr>
                  <tr className="border-b hover:bg-secondary/20">
                    <td className="p-3 font-medium">Futuros</td>
                    <td className="text-center p-3">Alto (20:1)</td>
                    <td className="text-center p-3">24/5</td>
                    <td className="text-center p-3">Alta</td>
                    <td className="text-center p-3">🟡 Intermedio</td>
                  </tr>
                  <tr className="border-b hover:bg-secondary/20">
                    <td className="p-3 font-medium">Forex</td>
                    <td className="text-center p-3">Muy Alto (100:1)</td>
                    <td className="text-center p-3">24/5</td>
                    <td className="text-center p-3">Media</td>
                    <td className="text-center p-3">🟡 Intermedio</td>
                  </tr>
                  <tr className="border-b hover:bg-secondary/20">
                    <td className="p-3 font-medium">Cripto</td>
                    <td className="text-center p-3">Variable</td>
                    <td className="text-center p-3">24/7</td>
                    <td className="text-center p-3">Extrema</td>
                    <td className="text-center p-3">🔴 Avanzado</td>
                  </tr>
                  <tr className="border-b hover:bg-secondary/20">
                    <td className="p-3 font-medium">Opciones</td>
                    <td className="text-center p-3">Implícito</td>
                    <td className="text-center p-3">Sesiones</td>
                    <td className="text-center p-3">Alta</td>
                    <td className="text-center p-3">🔴 Avanzado</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
