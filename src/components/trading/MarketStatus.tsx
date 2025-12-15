import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Wifi, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export const MarketStatus = () => {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [latency] = useState(Math.floor(Math.random() * 20) + 15); // Simulated latency 15-35ms

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">{t('demo.marketOpen')}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{t('demo.lastTick')}: {currentTime.toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              {t('demo.latency')}: {latency}ms
            </Badge>
            
            <Badge variant="secondary" className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {t('demo.status')}: Active
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};