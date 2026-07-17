'use client';

import { useState, useCallback } from 'react';

export interface ShadowConfig {
  x: number;
  y: number;
  blur: number;
  color: string;
  alpha: number;
}

export type ShadowTarget = 'both' | 'text' | 'icon';

const DEFAULT_SHADOW: ShadowConfig = { x: 0, y: 0, blur: 0, color: '#000000', alpha: 0 };

export function useShadow() {
  const [textShadow, setTextShadow] = useState<ShadowConfig>({ ...DEFAULT_SHADOW });
  const [iconShadow, setIconShadow] = useState<ShadowConfig>({ ...DEFAULT_SHADOW });
  const [shadowTarget, setShadowTarget] = useState<ShadowTarget>('both');

  const updateShadow = useCallback(
    (key: string, value: string | number) => {
      if (shadowTarget === 'both' || shadowTarget === 'text') {
        setTextShadow((prev) => ({ ...prev, [key]: value }));
      }
      if (shadowTarget === 'both' || shadowTarget === 'icon') {
        setIconShadow((prev) => ({ ...prev, [key]: value }));
      }
    },
    [shadowTarget]
  );

  return {
    textShadow,
    iconShadow,
    shadowTarget,
    setShadowTarget,
    updateShadow
  };
}
