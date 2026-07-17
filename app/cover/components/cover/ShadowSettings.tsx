'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Icon } from '@iconify/react';
import type { ShadowConfig, ShadowTarget } from './composables/useShadow';

type ShadowSettingsProps = {
  shadowTarget: ShadowTarget;
  setShadowTarget: (v: ShadowTarget) => void;
  textShadow: ShadowConfig;
  iconShadow: ShadowConfig;
  onUpdateShadow: (key: string, value: string | number) => void;
};

export default function ShadowSettings({
  shadowTarget,
  setShadowTarget,
  textShadow,
  iconShadow,
  onUpdateShadow
}: ShadowSettingsProps) {
  const currentShadow = shadowTarget === 'icon' ? iconShadow : textShadow;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>阴影设置</span>
          <div className="flex gap-1 rounded-lg border p-1">
            {[
              { id: 'both' as const, icon: 'mdi:layers', label: '全部' },
              { id: 'text' as const, icon: 'mdi:format-text', label: '文字' },
              { id: 'icon' as const, icon: 'mdi:star', label: '图标' }
            ].map((target) => (
              <Button
                key={target.id}
                variant={shadowTarget === target.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setShadowTarget(target.id)}
                title={target.label}
              >
                <Icon icon={target.icon} className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Label>颜色</Label>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={currentShadow.color}
              onChange={(e) => onUpdateShadow('color', e.target.value)}
              className="h-8 w-24 text-xs"
            />
            <input
              type="color"
              value={currentShadow.color}
              onChange={(e) => onUpdateShadow('color', e.target.value)}
              className="h-8 w-8 cursor-pointer rounded"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2">
            <Label className="text-xs">模糊</Label>
            <Input
              type="number"
              value={currentShadow.blur}
              onChange={(e) => onUpdateShadow('blur', Number(e.target.value))}
              className="h-8"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">水平</Label>
            <Input
              type="number"
              value={currentShadow.x}
              onChange={(e) => onUpdateShadow('x', Number(e.target.value))}
              className="h-8"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">垂直</Label>
            <Input
              type="number"
              value={currentShadow.y}
              onChange={(e) => onUpdateShadow('y', Number(e.target.value))}
              className="h-8"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>不透明度: {Math.round(currentShadow.alpha * 100)}%</Label>
          <Slider value={[currentShadow.alpha]} onValueChange={(v) => onUpdateShadow('alpha', Array.isArray(v) ? v[0] : v)} min={0} max={1} step={0.01} />
        </div>
      </CardContent>
    </Card>
  );
}
