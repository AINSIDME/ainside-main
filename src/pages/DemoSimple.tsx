import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { AlertTriangle, TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";

const Demo = () => {
  const { t } = useTranslation();
  
  const [chartData, setChartData] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState(6025.50);
  const [position, setPosition] = useState<{ type: 'long' | 'short', entry: number, pnl: number } | null>(null);
  const [trades, setTrades] = useState<Array<{ type: string, entry: number, exit: number, pnl: number }>>([]);
  const [totalPnL, setTotalPnL] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generar datos simulados inmediatamente
    const data: any[] = [];
    let price = 6025;
    const now = Date.now();

    for (let i = 0; i < 168; i++) {
      const time = now - (168 - i) * 3600000;
      const open = price;
      const change = (Math.random() - 0.5) * 8;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 4;
      const low = Math.min(open, close) - Math.random() * 4;

      data.push([time, open, high, low, close]);
      price = close;
    }

    setChartData(data);
    setCurrentPrice(price);
    setIsLoading(false);

    // Simulación de trading
    const tradingInterval = setInterval(() => {
      setChartData(prev => {
        if (prev.length === 0) return prev;
        
        const lastCandle = prev[prev.length - 1];
        const lastTime = lastCandle[0];
        const lastClose = lastCandle[4];
        const newTime = lastTime + 3600000;

        const open = lastClose;
        const change = (Math.random() - 0.5) * 6;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * 3;
        const low = Math.min(open, close) - Math.random() * 3;

        setCurrentPrice(close);

        return [...prev, [newTime, open, high, low, close]].slice(-200);
      });
    }, 5000);

    return () => clearInterval(tradingInterval);
  }, []);

  const chartOptions = {
    chart: {
      backgroundColor: '#0a0a0a',
      height: 800,
    },
    title: { text: '' },
    xAxis: {
      type: 'datetime',
      labels: { style: { color: '#94a3b8' } },
    },
    yAxis: {
      opposite: true,
      labels: { style: { color: '#94a3b8' } },
      gridLineColor: '#1e293b'
    },
    series: [{
      name: 'ES=F',
      type: 'candlestick',
      data: chartData,
      color: '#ef4444',
      upColor: '#22c55e',
    }],
    credits: { enabled: false },
    rangeSelector: { enabled: false },
    navigator: { enabled: false },
    scrollbar: { enabled: false }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Activity className="w-12 h-12 text-blue-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">E-mini S&P 500 - Live Demo</h1>
        <p className="text-slate-400">Current Price: ${currentPrice.toFixed(2)}</p>
      </div>
      
      <div className="bg-slate-950 border border-slate-800">
        <HighchartsReact
          highcharts={Highcharts}
          constructorType={'stockChart'}
          options={chartOptions}
        />
      </div>
    </div>
  );
};

export default Demo;
