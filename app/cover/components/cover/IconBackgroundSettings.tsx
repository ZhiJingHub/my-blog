'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

type IconBackgroundSettingsProps = {
  iconBgEnabled: boolean;
  setIconBgEnabled: (v: boolean) => void;
  iconBgColor: string;
  setIconBgColor: (v: string) => void;
  iconBgPadding: number;
  setIconBgPadding: (v: number) => void;
  iconBgRadius: number;
  setIconBgRadius: (v: number) => void;
  iconBgBlur: number;
  setIconBgBlur: (v: number) => void;
  iconBgOpacity: number;
  setIconBgOpacity: (v: number) => void;
};

export default function IconBackgroundSettings({
  iconBgEnabled,
  setIconBgEnabled,
  iconBgColor,
  setIconBgColor,
  iconBgPadding,
  setIconBgPadding,
  iconBgRadius,
  setIconBgRadius,
  iconBgBlur,
  setIconBgBlur,
  iconBgOpacity,
  setIconBgOpacity
}: IconBackgroundSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>图标背景</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex cursor-pointer items-center justify-between">
          <span>启用图标背景</span>
          <Checkbox checked={iconBgEnabled} onCheckedChange={setIconBgEnabled} />
        </label>
        {iconBgEnabled && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Label>背景颜色</Label>
              <div className="flex items-center gap-2">
                <Input type="text" value={iconBgColor} onChange={(e) => setIconBgColor(e.target.value)} className="h-6 w-20 text-xs" />
                <input type="color" value={iconBgColor} onChange={(e) => setIconBgColor(e.target.value)} className="h-6 w-6 cursor-pointer rounded" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>内边距: {iconBgPadding}px</Label>
                <Slider value={[iconBgPadding]} onValueChange={(v) => setIconBgPadding(Array.isArray(v) ? v[0] : v)} min={0} max={100} />
              </div>
              <div className="space-y-2">
                <Label>圆角: {iconBgRadius}%</Label>
                <Slider value={[iconBgRadius]} onValueChange={(v) => setIconBgRadius(Array.isArray(v) ? v[0] : v)} min={0} max={50} />
              </div>
              <div className="space-y-2">
                <Label>模糊: {iconBgBlur}px</Label>
                <Slider value={[iconBgBlur]} onValueChange={(v) => setIconBgBlur(Array.isArray(v) ? v[0] : v)} min={0} max={20} />
              </div>
              <div className="space-y-2">
                <Label>不透明度: {Math.round(iconBgOpacity * 100)}%</Label>
                <Slider value={[iconBgOpacity]} onValueChange={(v) => setIconBgOpacity(Array.isArray(v) ? v[0] : v)} min={0} max={1} step={0.01} />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
