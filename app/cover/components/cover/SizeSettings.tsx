'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

type SizeSettingsProps = {
  fontSize: number;
  iconSize: number;
  iconRadius: number;
  gap: number;
  linkScale: boolean;
  setFontSize: (v: number) => void;
  setIconSize: (v: number) => void;
  setIconRadius: (v: number) => void;
  setGap: (v: number) => void;
  setLinkScale: (v: boolean) => void;
  onFontSizeChange: (value: number) => void;
  onIconSizeChange: (value: number) => void;
};

export default function SizeSettings({
  fontSize,
  iconSize,
  iconRadius,
  gap,
  linkScale,
  setIconRadius,
  setGap,
  setLinkScale,
  onFontSizeChange,
  onIconSizeChange
}: SizeSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>尺寸设置</span>
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox checked={linkScale} onCheckedChange={setLinkScale} />
            <span className="text-sm font-normal">等比缩放</span>
          </label>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>字体大小: {fontSize}px</Label>
          <Slider value={[fontSize]} onValueChange={(v) => onFontSizeChange(Array.isArray(v) ? v[0] : v)} min={20} max={700} />
        </div>
        <div className="space-y-2">
          <Label>图标大小: {iconSize}px</Label>
          <Slider value={[iconSize]} onValueChange={(v) => onIconSizeChange(Array.isArray(v) ? v[0] : v)} min={20} max={700} />
        </div>
        <div className="space-y-2">
          <Label>图标圆角: {iconRadius}%</Label>
          <Slider value={[iconRadius]} onValueChange={(v) => setIconRadius(Array.isArray(v) ? v[0] : v)} min={0} max={50} />
        </div>
        <div className="space-y-2">
          <Label>间距: {gap}px</Label>
          <Slider value={[gap]} onValueChange={(v) => setGap(Array.isArray(v) ? v[0] : v)} min={0} max={200} />
        </div>
      </CardContent>
    </Card>
  );
}
