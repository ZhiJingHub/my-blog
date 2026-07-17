'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

type Ratio = { label: string; w: number; h: number; checked: boolean };
type ExportConfig = {
  format: 'png' | 'svg';
  scales: number[];
  filename: string;
  transparentBg: boolean;
  exportRatios: string[];
};

type ExportSettingsProps = {
  ratios: Ratio[];
  setRatios: (v: Ratio[]) => void;
  exportConfig: ExportConfig;
  setExportConfig: (v: ExportConfig) => void;
  canvasWidth: number;
  canvasHeight: number;
  activeRatios: Ratio[];
};

export default function ExportSettings({
  ratios,
  setRatios,
  exportConfig,
  setExportConfig,
  canvasWidth,
  canvasHeight,
  activeRatios
}: ExportSettingsProps) {
  const handleRatioChange = (index: number, checked: boolean) => {
    const newRatios = [...ratios];
    newRatios[index] = { ...newRatios[index], checked };
    setRatios(newRatios);
  };

  const handleScaleChange = (scale: number, checked: boolean) => {
    if (checked) {
      setExportConfig({ ...exportConfig, scales: [...exportConfig.scales, scale].sort() });
    } else {
      setExportConfig({ ...exportConfig, scales: exportConfig.scales.filter((s) => s !== scale) });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>导出</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>画板比例</Label>
          <div className="grid grid-cols-2 gap-2">
            {ratios.map((ratio, index) => (
              <label key={ratio.label} className="flex cursor-pointer items-center gap-2 rounded-lg border p-2 hover:bg-accent">
                <Checkbox checked={ratio.checked} onCheckedChange={(checked) => handleRatioChange(index, checked)} />
                <span className="font-mono text-sm">{ratio.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>文件名</Label>
          <Input value={exportConfig.filename} onChange={(e) => setExportConfig({ ...exportConfig, filename: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>格式</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={exportConfig.format === 'png' ? 'default' : 'outline'}
              onClick={() => setExportConfig({ ...exportConfig, format: 'png' })}
            >
              PNG
            </Button>
            <Button
              variant={exportConfig.format === 'svg' ? 'default' : 'outline'}
              onClick={() => setExportConfig({ ...exportConfig, format: 'svg' })}
            >
              SVG
            </Button>
          </div>
        </div>
        {exportConfig.format === 'png' && (
          <div className="space-y-2">
            <Label>缩放倍率</Label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((scale) => (
                <label key={scale} className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border p-2 text-sm hover:bg-accent">
                  <Checkbox
                    checked={exportConfig.scales.includes(scale)}
                    onCheckedChange={(checked) => handleScaleChange(scale, checked)}
                  />
                  <span className="font-mono">{scale}x</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(canvasWidth)}x{Math.round(canvasHeight)} px
            </p>
          </div>
        )}
        <label className="flex cursor-pointer items-center justify-between rounded border p-2">
          <span className="text-sm">背景透明</span>
          <Checkbox
            checked={exportConfig.transparentBg}
            onCheckedChange={(checked) => setExportConfig({ ...exportConfig, transparentBg: checked })}
          />
        </label>
      </CardContent>
    </Card>
  );
}
