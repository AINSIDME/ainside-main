import { useEffect, useState, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface FuturesChartProps {
  defaultSymbol?: string;
}

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const FuturesChart = ({ defaultSymbol = 'MES1!' }: FuturesChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [inputSymbol, setInputSymbol] = useState(defaultSymbol);
  const [timeframe, setTimeframe] = useState('5m');
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const { toast } = useToast();

  // Generar datos simulados para futuros con diferentes timeframes
  const generateSimulatedData = (symbol: string, tf: string): CandleData[] => {
    const basePrice = symbol.includes('MES') ? 5800 : 
                     symbol.includes('ES') ? 5800 : 
                     symbol.includes('NQ') ? 20000 : 
                     symbol.includes('YM') ? 42000 : 
                     symbol.includes('RTY') ? 2100 : 100;
    
    // Configuración según timeframe
    const timeframes: { [key: string]: { candles: number; volatility: number; increment: number } } = {
      '1m': { candles: 60, volatility: 0.001, increment: 1 },
      '5m': { candles: 48, volatility: 0.002, increment: 5 },
      '15m': { candles: 32, volatility: 0.003, increment: 15 },
      '30m': { candles: 24, volatility: 0.004, increment: 30 },
      '1h': { candles: 24, volatility: 0.005, increment: 60 },
      '4h': { candles: 18, volatility: 0.008, increment: 240 },
      '1D': { candles: 30, volatility: 0.015, increment: 1440 }
    };

    const config = timeframes[tf] || timeframes['5m'];
    const data: CandleData[] = [];
    let currentPrice = basePrice;
    
    for (let i = 0; i < config.candles; i++) {
      const change = (Math.random() - 0.5) * basePrice * config.volatility * 2;
      const open = currentPrice;
      currentPrice += change;
      
      const volatility = basePrice * config.volatility;
      const high = Math.max(open, currentPrice) + Math.random() * volatility;
      const low = Math.min(open, currentPrice) - Math.random() * volatility;
      const close = low + Math.random() * (high - low);
      
      // Generar tiempo basado en timeframe
      let timeString = '';
      if (tf === '1D') {
        const date = new Date();
        date.setDate(date.getDate() - config.candles + i);
        timeString = date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      } else if (tf === '4h') {
        const hour = 9 + (i * 4) % 24;
        timeString = `${hour}:00`;
      } else if (tf === '1h') {
        const hour = 9 + i;
        timeString = `${hour}:00`;
      } else {
        // Para minutos
        const totalMinutes = 9 * 60 + i * config.increment;
        const hour = Math.floor(totalMinutes / 60);
        const minute = totalMinutes % 60;
        timeString = `${hour}:${String(minute).padStart(2, '0')}`;
      }
      
      data.push({
        time: timeString,
        open: open,
        high: high,
        low: low,
        close: close,
        volume: Math.floor(Math.random() * 1000 * (config.increment / 5)) + 100,
      });
      
      currentPrice = close;
    }
    
    return data;
  };

  // Dibujar velas en canvas con transformaciones
  const drawCandles = () => {
    const canvas = canvasRef.current;
    if (!canvas || chartData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Aplicar transformaciones
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Configuración
    const padding = 60;
    const width = (canvas.width - padding * 2);
    const height = (canvas.height - padding * 2);
    const candleWidth = Math.max(width / chartData.length * 0.7, 2);
    const candleSpacing = width / chartData.length;

    // Encontrar min/max precios
    const prices = chartData.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Función para convertir precio a coordenada Y
    const priceToY = (price: number) => {
      return padding + (maxPrice - price) / priceRange * height;
    };

    // Dibujar grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    
    // Líneas horizontales
    for (let i = 0; i <= 5; i++) {
      const y = padding + (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + width, y);
      ctx.stroke();
      
      // Etiquetas de precio
      const price = maxPrice - (priceRange / 5) * i;
      ctx.fillStyle = '#666';
      ctx.font = '12px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(price.toFixed(2), padding - 10, y + 4);
    }

    // Líneas verticales
    for (let i = 0; i < chartData.length; i += 5) {
      const x = padding + candleSpacing * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + height);
      ctx.stroke();
      
      // Etiquetas de tiempo
      if (chartData[i]) {
        ctx.fillStyle = '#666';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(chartData[i].time, x, canvas.height - 10);
      }
    }

    // Dibujar velas
    chartData.forEach((candle, index) => {
      const x = padding + candleSpacing * index + candleSpacing / 2;
      const openY = priceToY(candle.open);
      const closeY = priceToY(candle.close);
      const highY = priceToY(candle.high);
      const lowY = priceToY(candle.low);

      const isGreen = candle.close > candle.open;
      const bodyTop = Math.min(openY, closeY);
      const bodyBottom = Math.max(openY, closeY);
      const bodyHeight = Math.max(bodyBottom - bodyTop, 1);

      // Color de la vela
      ctx.fillStyle = isGreen ? '#26a69a' : '#ef5350';
      ctx.strokeStyle = isGreen ? '#26a69a' : '#ef5350';
      ctx.lineWidth = 1;

      // Dibujar mecha superior
      if (highY < bodyTop) {
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, bodyTop);
        ctx.stroke();
      }

      // Dibujar mecha inferior
      if (lowY > bodyBottom) {
        ctx.beginPath();
        ctx.moveTo(x, bodyBottom);
        ctx.lineTo(x, lowY);
        ctx.stroke();
      }

      // Dibujar cuerpo de la vela
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    });

    // Restaurar transformaciones
    ctx.restore();

    // Título en posición fija
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${symbol} - Gráfico de Velas`, 20, 30);
  };

  // Eventos de mouse para pan y zoom
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setLastMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      
      const deltaX = currentX - lastMousePos.x;
      const deltaY = currentY - lastMousePos.y;
      
      setOffsetX(prev => prev + deltaX);
      setOffsetY(prev => prev + deltaY);
      
      setLastMousePos({ x: currentX, y: currentY });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.1, Math.min(3, prev * delta)));
  };

  const resetView = () => {
    setOffsetX(0);
    setOffsetY(0);
    setScale(1);
  };

  // Cargar datos del símbolo
  const loadSymbolData = async (symbolToLoad: string, tf: string = timeframe) => {
    setLoading(true);
    try {
      const simulatedData = generateSimulatedData(symbolToLoad, tf);
      setChartData(simulatedData);
      
      toast({
        title: "Datos cargados",
        description: `Gráfico actualizado para ${symbolToLoad}`,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: `No se pudieron cargar datos para ${symbolToLoad}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Efectos
  useEffect(() => {
    loadSymbolData(symbol, timeframe);
  }, [symbol, timeframe]);

  useEffect(() => {
    drawCandles();
  }, [chartData, offsetX, offsetY, scale]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.parentElement?.getBoundingClientRect();
        if (rect) {
          canvas.width = rect.width - 20;
          canvas.height = 400;
          drawCandles();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [chartData]);

  const handleSymbolChange = () => {
    const newSymbol = inputSymbol.trim().toUpperCase();
    if (newSymbol && newSymbol !== symbol) {
      setSymbol(newSymbol);
    }
  };

  const popularFutures = [
    'MES1!', 'ES1!', 'NQ1!', 'RTY1!', 'YM1!', 'CL1!', 'GC1!', 'ZB1!'
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Control de símbolo y timeframe */}
      <div className="mb-3 flex gap-2 items-center flex-wrap">
        <div className="flex gap-2 items-center">
          <Input
            value={inputSymbol}
            onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
            placeholder="Símbolo (ej: MES1!, ES1!)"
            className="w-48 h-8 text-xs font-mono"
            onKeyPress={(e) => e.key === 'Enter' && handleSymbolChange()}
          />
          
          {/* Selector de Timeframe */}
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-20 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1m</SelectItem>
              <SelectItem value="5m">5m</SelectItem>
              <SelectItem value="15m">15m</SelectItem>
              <SelectItem value="30m">30m</SelectItem>
              <SelectItem value="1h">1h</SelectItem>
              <SelectItem value="4h">4h</SelectItem>
              <SelectItem value="1D">1D</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleSymbolChange}
            disabled={loading}
            size="sm"
            className="h-8 text-xs"
          >
            {loading ? 'Cargando...' : 'Cargar'}
          </Button>
          <Button 
            onClick={resetView}
            size="sm"
            variant="outline"
            className="h-8 text-xs"
          >
            Reset Vista
          </Button>
        </div>
        
        {/* Futuros populares */}
        <div className="flex gap-1 flex-wrap">
          {popularFutures.map((fut) => (
            <Button
              key={fut}
              variant={symbol === fut ? "default" : "outline"}
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => {
                setInputSymbol(fut);
                setSymbol(fut);
              }}
            >
              {fut}
            </Button>
          ))}
        </div>
      </div>

      {/* Información del símbolo actual */}
      <div className="mb-2 text-sm text-muted-foreground">
        Gráfico: <span className="font-mono font-bold text-foreground">{symbol}</span>
        <span className="ml-2 text-xs bg-primary/20 px-2 py-1 rounded">{timeframe}</span>
        {chartData.length > 0 && (
          <span className="ml-4">
            Precio: <span className="text-foreground">{chartData[chartData.length - 1]?.close?.toFixed(2)}</span>
          </span>
        )}
      </div>

      {/* Contenedor del gráfico */}
      <div className="bg-black border rounded-lg shadow-lg overflow-hidden">
        <div className="w-full h-[420px] p-2">
          <canvas 
            ref={canvasRef}
            className="w-full h-full cursor-grab"
            style={{ width: '100%', height: '400px' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
        </div>
      </div>
    </div>
  );
};