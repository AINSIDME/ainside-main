import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DemoControlsProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  overlays: {
    vwap: boolean;
    hilo: boolean;
    riskBox: boolean;
  };
  setOverlays: (overlays: any) => void;
}

export const DemoControls = ({
  isPlaying,
  setIsPlaying,
  speed,
  setSpeed,
  overlays,
  setOverlays
}: DemoControlsProps) => {
  const { t } = useTranslation();

  const speedOptions = [
    { value: 0.5, label: "0.5x" },
    { value: 1, label: "1x" },
    { value: 2, label: "2x" },
    { value: 5, label: "5x" }
  ];

  const handleReset = () => {
    setIsPlaying(false);
    // Reset chart data would happen in parent component
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Playback Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Playback Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              variant={isPlaying ? "secondary" : "default"}
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex-1"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  {t('demo.pause')}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  {t('demo.play')}
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('demo.reset')}
            </Button>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">{t('demo.speed')}</Label>
            <div className="grid grid-cols-4 gap-2">
              {speedOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={speed === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSpeed(option.value)}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Overlays */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('demo.overlays')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="vwap-toggle" className="text-sm">
              {t('demo.vwap')}
            </Label>
            <Switch
              id="vwap-toggle"
              checked={overlays.vwap}
              onCheckedChange={(checked) =>
                setOverlays({ ...overlays, vwap: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="hilo-toggle" className="text-sm">
              {t('demo.hilo')}
            </Label>
            <Switch
              id="hilo-toggle"
              checked={overlays.hilo}
              onCheckedChange={(checked) =>
                setOverlays({ ...overlays, hilo: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="risk-toggle" className="text-sm">
              {t('demo.riskBox')}
            </Label>
            <Switch
              id="risk-toggle"
              checked={overlays.riskBox}
              onCheckedChange={(checked) =>
                setOverlays({ ...overlays, riskBox: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};