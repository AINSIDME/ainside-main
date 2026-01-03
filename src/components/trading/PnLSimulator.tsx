import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Trade {
  id: string;
  entry: number;
  exit?: number;
  quantity: number;
  pnl?: number;
  status: 'open' | 'closed';
}

export const PnLSimulator = () => {
  const { t } = useTranslation();
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [currentPrice] = useState(4523.75); // Simulated current price

  const addEntry = () => {
    if (!entryPrice || isNaN(Number(entryPrice))) return;
    
    const newTrade: Trade = {
      id: Date.now().toString(),
      entry: Number(entryPrice),
      quantity: Number(quantity) || 1,
      status: 'open'
    };
    
    setTrades([...trades, newTrade]);
    setEntryPrice("");
  };

  const addExit = (tradeId: string) => {
    if (!exitPrice || isNaN(Number(exitPrice))) return;
    
    setTrades(trades.map(trade => {
      if (trade.id === tradeId && trade.status === 'open') {
        const pnl = (Number(exitPrice) - trade.entry) * trade.quantity * 50; // $50 per point for ES
        return {
          ...trade,
          exit: Number(exitPrice),
          pnl,
          status: 'closed' as const
        };
      }
      return trade;
    }));
    setExitPrice("");
  };

  const clearTrades = () => {
    setTrades([]);
  };

  const openTrades = trades.filter(t => t.status === 'open');
  const closedTrades = trades.filter(t => t.status === 'closed');
  
  const unrealizedPnL = openTrades.reduce((sum, trade) => {
    return sum + ((currentPrice - trade.entry) * trade.quantity * 50);
  }, 0);
  
  const realizedPnL = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const totalTrades = closedTrades.length;
  const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('demo.pnlSimulator')}</CardTitle>
        <CardDescription>
          Educational simulation only - not real trading
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Entry Controls */}
        <div className="space-y-2">
          <Label htmlFor="entry-price" className="text-sm">{t('demo.entry')}</Label>
          <div className="flex gap-2">
            <Input
              id="entry-price"
              type="number"
              placeholder="4523.75"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="text-sm"
            />
            <Button size="sm" onClick={addEntry} disabled={!entryPrice}>
              {t('demo.setEntry')}
            </Button>
          </div>
        </div>

        {/* Exit Controls */}
        {openTrades.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="exit-price" className="text-sm">{t('demo.exit')}</Label>
            <div className="flex gap-2">
              <Input
                id="exit-price"
                type="number"
                placeholder="4525.00"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                className="text-sm"
              />
              <Button 
                size="sm" 
                onClick={() => openTrades[0] && addExit(openTrades[0].id)}
                disabled={!exitPrice || openTrades.length === 0}
              >
                {t('demo.setExit')}
              </Button>
            </div>
          </div>
        )}

        {/* Current Price */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground">Current Price</div>
          <div className="text-lg font-bold">{currentPrice.toFixed(2)}</div>
        </div>

        {/* P&L Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="text-xs text-muted-foreground">{t('demo.unrealizedPnl')}</div>
            <div className={`text-sm font-bold ${unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${unrealizedPnL.toFixed(0)}
            </div>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="text-xs text-muted-foreground">{t('demo.realizedPnl')}</div>
            <div className={`text-sm font-bold ${realizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${realizedPnL.toFixed(0)}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="text-xs text-muted-foreground">{t('demo.totalTrades')}</div>
            <div className="text-sm font-bold">{totalTrades}</div>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="text-xs text-muted-foreground">{t('demo.winRate')}</div>
            <div className="text-sm font-bold">{winRate.toFixed(1)}%</div>
          </div>
        </div>

        {/* Open Positions */}
        {openTrades.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Open Positions</div>
            {openTrades.map(trade => (
              <div key={trade.id} className="p-2 bg-muted/30 rounded text-xs flex justify-between items-center">
                <span>Entry: {trade.entry}</span>
                <Badge variant="secondary" className="text-xs">
                  {((currentPrice - trade.entry) * trade.quantity * 50) >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Clear Button */}
        {trades.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearTrades} className="w-full">
            <Trash2 className="w-4 h-4 mr-2" />
            {t('demo.clearTrades')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};