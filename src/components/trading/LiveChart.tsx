import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Upload, FileCode, TrendingUp, ArrowRightLeft, BarChart3 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LiveChartProps {
  isPlaying: boolean;
  speed: number;
  overlays: {
    vwap: boolean;
    hilo: boolean;
    riskBox: boolean;
  };
  instrument?: {
    name: string;
    basePrice: number;
    tickSize: number;
    displayName: string;
  };
}

declare global {
  interface Window {
    TradingView: any;
  }
}

export const LiveChart = ({ isPlaying, speed, overlays, instrument }: LiveChartProps) => {
  const [symbol, setSymbol] = useState("CME_MINI:MES1!");
  const [interval, setInterval] = useState("1");
  const [chartType, setChartType] = useState<"tradingview" | "multicharts">("tradingview");
  const [strategyFile, setStrategyFile] = useState<File | null>(null);
  const [easyLanguageCode, setEasyLanguageCode] = useState("");
  const [pineScriptCode, setPineScriptCode] = useState("");
  const [isConverterOpen, setIsConverterOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const multiChartsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const futuresSymbols = [
    { label: "E-mini S&P 500", value: "CME_MINI:MES1!", display: "MES1!" },
    { label: "S&P 500", value: "CME_MINI:ES1!", display: "ES1!" },
    { label: "Nasdaq", value: "CME_MINI:NQ1!", display: "NQ1!" },
    { label: "Russell 2000", value: "CME_MINI:RTY1!", display: "RTY1!" },
    { label: "Dow Jones", value: "CBOT_MINI:YM1!", display: "YM1!" },
    { label: "Crude Oil", value: "NYMEX:CL1!", display: "CL1!" },
    { label: "Gold", value: "COMEX:GC1!", display: "GC1!" },
    { label: "Bitcoin", value: "COINBASE:BTCUSD", display: "BTCUSD" },
    { label: "Ethereum", value: "COINBASE:ETHUSD", display: "ETHUSD" }
  ];

  const timeframes = [
    { label: "1m", value: "1" },
    { label: "5m", value: "5" },
    { label: "15m", value: "15" },
    { label: "30m", value: "30" },
    { label: "1h", value: "60" },
    { label: "4h", value: "240" },
    { label: "1D", value: "1D" }
  ];

  // Generar URL de TradingView
  const getTradingViewUrl = () => {
    const baseUrl = "https://www.tradingview.com/chart/";
    const params = new URLSearchParams({
      symbol: symbol,
      interval: interval,
      theme: 'dark',
      utm_source: 'www.tradingview.com',
      utm_medium: 'widget', 
      utm_campaign: 'chart',
      utm_term: symbol
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const openInNewTab = () => {
    window.open(getTradingViewUrl(), '_blank');
  };

  const openPineEditor = () => {
    window.open('https://www.tradingview.com/pine-editor/', '_blank');
  };

  const openMultiCharts = () => {
    window.open('https://www.multicharts.com/', '_blank');
    toast({
      title: "MultiCharts abierto",
      description: "MultiCharts es 100% compatible con EasyLanguage - no necesitas conversión",
    });
  };

  const openStrategyTester = () => {
    const strategyUrl = `https://www.tradingview.com/chart/?symbol=${symbol}&strategy=true`;
    window.open(strategyUrl, '_blank');
  };

  const uploadToMultiCharts = () => {
    if (easyLanguageCode) {
      toast({
        title: "Código EasyLanguage listo",
        description: "Puedes usar este código directamente en MultiCharts sin conversión",
      });
      openMultiCharts();
    } else {
      toast({
        title: "Información",
        description: "MultiCharts acepta EasyLanguage directamente - no necesitas conversión",
      });
      openMultiCharts();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setStrategyFile(file);
      
      // Leer contenido del archivo
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setEasyLanguageCode(content);
      };
      reader.readAsText(file);
      
      toast({
        title: "Archivo cargado",
        description: `${file.name} cargado - compatible con MultiCharts`,
      });
    }
  };

  const uploadStrategy = () => {
    if (strategyFile) {
      toast({
        title: "Información",
        description: "Las estrategias son para TradeStation/MultiCharts (EasyLanguage)",
      });
      openPineEditor();
    } else {
      fileInputRef.current?.click();
    }
  };

  // Convertir EasyLanguage a Pine Script
  const convertToPineScript = () => {
    if (!easyLanguageCode.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu código EasyLanguage",
        variant: "destructive"
      });
      return;
    }

    // Conversión básica de EasyLanguage a Pine Script
    let pineCode = easyLanguageCode;
    
    // Conversiones básicas comunes
    const conversions = [
      // Declaraciones
      { from: /Input:/gi, to: '//@version=5\nstrategy("Converted Strategy", overlay=true)\n\n// Inputs' },
      { from: /Variables:/gi, to: '// Variables' },
      
      // Funciones básicas
      { from: /Close/g, to: 'close' },
      { from: /Open/g, to: 'open' },
      { from: /High/g, to: 'high' },
      { from: /Low/g, to: 'low' },
      { from: /Volume/g, to: 'volume' },
      
      // Operadores
      { from: /And/gi, to: 'and' },
      { from: /Or/gi, to: 'or' },
      { from: /Not/gi, to: 'not' },
      
      // Promedios móviles
      { from: /Average\(([^,]+),\s*(\d+)\)/gi, to: 'ta.sma($1, $2)' },
      { from: /XAverage\(([^,]+),\s*(\d+)\)/gi, to: 'ta.ema($1, $2)' },
      
      // Condiciones
      { from: /If\s+([^)]+)\s+Then/gi, to: 'if ($1)' },
      { from: /Else/gi, to: 'else' },
      { from: /End;/gi, to: '' },
      
      // Órdenes
      { from: /Buy\s+([^;]+);/gi, to: 'strategy.entry("Long", strategy.long, when=$1)' },
      { from: /Sell\s+([^;]+);/gi, to: 'strategy.entry("Short", strategy.short, when=$1)' },
      { from: /ExitLong\s+([^;]+);/gi, to: 'strategy.close("Long", when=$1)' },
      { from: /ExitShort\s+([^;]+);/gi, to: 'strategy.close("Short", when=$1)' },
      
      // Cruzamientos
      { from: /([^>]+)\s+crosses\s+above\s+([^;]+)/gi, to: 'ta.crossover($1, $2)' },
      { from: /([^>]+)\s+crosses\s+below\s+([^;]+)/gi, to: 'ta.crossunder($1, $2)' },
    ];

    conversions.forEach(({ from, to }) => {
      pineCode = pineCode.replace(from, to);
    });

    setPineScriptCode(pineCode);
    toast({
      title: "Conversión completada",
      description: "Revisa el código Pine Script generado y ajústalo si es necesario",
    });
  };

  const copyPineScript = () => {
    navigator.clipboard.writeText(pineScriptCode);
    toast({
      title: "Copiado",
      description: "Código Pine Script copiado al portapapeles",
    });
  };

  // Efecto para cargar el widget de TradingView
  useEffect(() => {
    if (containerRef.current) {
      // Limpiar contenido anterior
      containerRef.current.innerHTML = '';

      // Crear script para el widget de TradingView
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: symbol,
        interval: interval,
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "es",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        withdateranges: true,
        range: "YTD",
        hide_side_toolbar: false,
        allow_symbol_change: true,
        details: true,
        hotlist: true,
        calendar: false,
        studies: ["STD;MACD", "STD;RSI"], // Agregar estudios básicos
        studies_overrides: {},
        overrides: {},
        enabled_features: ["study_templates"], // Habilitar plantillas de estudios
        disabled_features: [], 
        support_host: "https://www.tradingview.com"
      });

      containerRef.current.appendChild(script);
    }
  }, [symbol, interval]);

  const applyStrategyToChart = () => {
    if (pineScriptCode) {
      // Crear URL con estrategia pre-cargada
      const strategyUrl = `https://www.tradingview.com/pine-editor/#strategy=${encodeURIComponent(pineScriptCode)}&symbol=${symbol}`;
      window.open(strategyUrl, '_blank');
      toast({
        title: "Estrategia aplicada",
        description: "Se abrió TradingView con tu estrategia pre-cargada",
      });
    } else {
      toast({
        title: "Error",
        description: "Primero convierte tu estrategia EasyLanguage a Pine Script",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full">
      {/* Controles */}
      <div className="mb-4 flex gap-2 items-center flex-wrap p-4 bg-background/50 border rounded-lg">
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium">Símbolo:</span>
          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {futuresSymbols.map((sym) => (
                <SelectItem key={sym.value} value={sym.value}>
                  {sym.label} ({sym.display})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium">Timeframe:</span>
          <Select value={interval} onValueChange={setInterval}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeframes.map((tf) => (
                <SelectItem key={tf.value} value={tf.value}>
                  {tf.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Selector de Plataforma */}
        <div className="flex gap-2 items-center border-l pl-4">
          <span className="text-sm font-medium">Plataforma:</span>
          <Select value={chartType} onValueChange={(value) => setChartType(value as "tradingview" | "multicharts")}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tradingview">TradingView</SelectItem>
              <SelectItem value="multicharts">MultiCharts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Controles de Estrategia */}
        <div className="flex gap-2 items-center border-l pl-4">
          <Dialog open={isConverterOpen} onOpenChange={setIsConverterOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                size="sm"
              >
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Convertir EasyLanguage
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Convertir EasyLanguage a Pine Script</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Código EasyLanguage:
                  </label>
                  <Textarea
                    value={easyLanguageCode}
                    onChange={(e) => setEasyLanguageCode(e.target.value)}
                    placeholder="Pega tu código EasyLanguage aquí..."
                    className="h-64 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Pine Script (generado):
                  </label>
                  <Textarea
                    value={pineScriptCode}
                    readOnly
                    className="h-64 font-mono text-sm bg-muted"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={convertToPineScript}>
                  Convertir
                </Button>
                <Button 
                  onClick={copyPineScript}
                  variant="outline"
                  disabled={!pineScriptCode}
                >
                  Copiar Pine Script
                </Button>
                <Button 
                  onClick={applyStrategyToChart}
                  variant="default"
                  disabled={!pineScriptCode}
                >
                  Aplicar al Gráfico
                </Button>
                <Button 
                  onClick={openPineEditor}
                  variant="outline"
                >
                  Abrir Pine Editor
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={uploadStrategy}
            variant="outline"
            size="sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            {strategyFile ? 'Cargar a TV' : 'Subir Estrategia'}
          </Button>
          
          <Button 
            onClick={openPineEditor}
            variant="outline"
            size="sm"
          >
            <FileCode className="w-4 h-4 mr-2" />
            Pine Editor
          </Button>
          
          <Button 
            onClick={openStrategyTester}
            variant="outline"
            size="sm"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Strategy Tester
          </Button>
          
          <Button 
            onClick={uploadToMultiCharts}
            variant="default"
            size="sm"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Usar en MultiCharts
          </Button>
        </div>

        <Button 
          onClick={openInNewTab}
          variant="outline"
          size="sm"
          className="ml-auto"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Abrir en Nueva Pestaña
        </Button>

        <div className="text-sm text-muted-foreground">
          {isPlaying ? (
            <span className="text-green-500">● Live</span>
          ) : (
            <span className="text-red-500">● Paused</span>
          )}
        </div>
      </div>

      {/* Input oculto para archivos */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pine,.txt,.js"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Información de estrategia cargada */}
      {strategyFile && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Estrategia cargada: </span>
              <span className="text-sm text-muted-foreground">{strategyFile.name}</span>
            </div>
            <Button 
              onClick={() => setStrategyFile(null)}
              variant="ghost"
              size="sm"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="border rounded-lg overflow-hidden shadow-lg bg-background">
        {chartType === "tradingview" ? (
          /* TradingView Widget */
          <div className="tradingview-widget-container" style={{ height: "700px", width: "100%" }}>
            <div 
              ref={containerRef}
              className="tradingview-widget-container__widget"
              style={{ height: "calc(100% - 32px)", width: "100%" }}
            />
            <div className="tradingview-widget-copyright">
              <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
                <span className="blue-text">Track all markets on TradingView</span>
              </a>
            </div>
          </div>
        ) : (
          /* MultiCharts Widget */
          <div className="multicharts-container" style={{ height: "700px", width: "100%" }}>
            <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8">
              <BarChart3 className="w-16 h-16 mb-4 text-blue-400" />
              <h3 className="text-xl font-bold mb-2">MultiCharts - PowerLanguage™</h3>
              <p className="text-center text-gray-300 mb-6">
                <strong>Alta compatibilidad</strong> con EasyLanguage TradeStation.<br/>
                Más de 30 años de estrategias EasyLanguage disponibles.
              </p>
              
              <div className="space-y-4 w-full max-w-md">
                <div className="bg-green-900/30 border border-green-500/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-400 mb-2">✅ Ventajas PowerLanguage:</h4>
                  <ul className="text-sm space-y-1 text-gray-300">
                    <li>• Alta compatibilidad con EasyLanguage</li>
                    <li>• Más de 30 años de código disponible</li>
                    <li>• Backtesting y optimización avanzada</li>
                    <li>• Trading automatizado profesional</li>
                    <li>• Portfolio Backtester incluido</li>
                    <li>• Uso comercial sin restricciones</li>
                  </ul>
                </div>
                
                <div className="bg-blue-900/30 border border-blue-500/50 p-3 rounded-lg">
                  <h4 className="font-semibold text-blue-400 mb-2">🚀 Características únicas:</h4>
                  <ul className="text-sm space-y-1 text-gray-300">
                    <li>• High-definition charts</li>
                    <li>• Order & Execution Management</li>
                    <li>• Multi-core optimization</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={uploadToMultiCharts}
                  className="w-full"
                  size="lg"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Abrir MultiCharts
                </Button>
                
                {easyLanguageCode && (
                  <div className="bg-blue-900/30 border border-blue-500/50 p-3 rounded-lg">
                    <p className="text-sm text-blue-300">
                      ✅ Código EasyLanguage detectado - Listo para usar
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};