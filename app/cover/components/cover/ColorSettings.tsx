'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

type ColorSettingsProps = {
  color: string;
  iconColor: string;
  bgColor: string;
  bgColorOpacity: number;
  linkColor: boolean;
  useOriginalIconColor: boolean;
  setColor: (v: string) => void;
  setIconColor: (v: string) => void;
  setBgColor: (v: string) => void;
  setBgColorOpacity: (v: number) => void;
  setLinkColor: (v: boolean) => void;
  setUseOriginalIconColor: (v: boolean) => void;
  onColorChange: (newColor: string, type: 'text' | 'icon') => void;
};

export default function ColorSettings({
  color,
  iconColor,
  bgColor,
  bgColorOpacity,
  linkColor,
  useOriginalIconColor,
  setColor,
  setIconColor,
  setBgColor,
  setBgColorOpacity,
  setLinkColor,
  setUseOriginalIconColor,
  onColorChange
}: ColorSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>颜色设置</span>
          <div className="flex gap-2">
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox checked={linkColor} onCheckedChange={setLinkColor} />
              <span className="text-sm font-normal">颜色同步</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox checked={useOriginalIconColor} onCheckedChange={setUseOriginalIconColor} />
              <span className="text-sm font-normal">原色图标</span>
            </label>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Label>文字颜色</Label>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={color}
              onChange={(e) => onColorChange(e.target.value, 'text')}
              className="h-8 w-24 text-xs"
            />
            <input
              type="color"
              value={color}
              onChange={(e) => onColorChange(e.target.value, 'text')}
              className="h-8 w-8 cursor-pointer rounded"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Label>图标颜色</Label>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={iconColor}
              disabled={useOriginalIconColor}
              onChange={(e) => onColorChange(e.target.value, 'icon')}
              className="h-8 w-24 text-xs"
            />
            <input
              type="color"
              value={iconColor}
              disabled={useOriginalIconColor}
              onChange={(e) => onColorChange(e.target.value, 'icon')}
              className="h-8 w-8 cursor-pointer rounded"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Label>背景颜色</Label>
          <div className="flex items-center gap-2">
            <Input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-8 w-24 text-xs" />
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-8 w-8 cursor-pointer rounded" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>背景不透明度: {Math.round(bgColorOpacity * 100)}%</Label>
          <Slider value={[bgColorOpacity]} onValueChange={(v) => setBgColorOpacity(Array.isArray(v) ? v[0] : v)} min={0} max={1} step={0.01} />
        </div>
      </CardContent>
    </Card>
  );
}
