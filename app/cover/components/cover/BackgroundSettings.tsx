'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';

type BackgroundSettingsProps = {
  bgImage: string | null;
  bgBlur: number;
  bgOpacity: number;
  isBgDragOver: boolean;
  onBgImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBgImageRemove: () => void;
  onBgBlurChange: (v: number) => void;
  onBgOpacityChange: (v: number) => void;
  onBgDragOver: (e: React.DragEvent) => void;
  onBgDragLeave: (e: React.DragEvent) => void;
  onBgDrop: (e: React.DragEvent) => void;
};

export default function BackgroundSettings({
  bgImage,
  bgBlur,
  bgOpacity,
  isBgDragOver,
  onBgImageUpload,
  onBgImageRemove,
  onBgBlurChange,
  onBgOpacityChange,
  onBgDragOver,
  onBgDragLeave,
  onBgDrop
}: BackgroundSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>背景图片</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <input type="file" accept="image/*" onChange={onBgImageUpload} className="hidden" id="bg-upload" />
          <Label
            htmlFor="bg-upload"
            className={`flex h-24 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed hover:border-primary ${
              isBgDragOver ? 'border-primary bg-primary/10' : ''
            }`}
            onDragOver={onBgDragOver}
            onDragLeave={onBgDragLeave}
            onDrop={onBgDrop}
          >
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <Icon icon="mdi:upload" className="h-6 w-6" />
              <span className="text-xs">{isBgDragOver ? '松开上传' : bgImage ? '点击或拖拽更换' : '点击或拖拽上传'}</span>
            </div>
          </Label>
        </div>
        {bgImage && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>模糊: {bgBlur}px</Label>
              <Button variant="destructive" size="sm" onClick={onBgImageRemove}>
                <Icon icon="mdi:delete" className="h-4 w-4" />
              </Button>
            </div>
            <Slider value={[bgBlur]} onValueChange={(v) => onBgBlurChange(Array.isArray(v) ? v[0] : v)} min={0} max={20} />
            <Label>不透明度: {Math.round(bgOpacity * 100)}%</Label>
            <Slider value={[bgOpacity]} onValueChange={(v) => onBgOpacityChange(Array.isArray(v) ? v[0] : v)} min={0} max={1} step={0.01} />
            <p className="text-xs text-muted-foreground">提示: 拖拽移动位置，滚轮缩放大小</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
