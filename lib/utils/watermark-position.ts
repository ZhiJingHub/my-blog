import type { WatermarkPosition } from '@/lib/types/convert';

export function getWatermarkPosition(
  position: WatermarkPosition,
  canvasWidth: number,
  canvasHeight: number,
  watermarkWidth: number,
  watermarkHeight: number,
  margin: number = 20
): { x: number; y: number } {
  switch (position) {
    case 'top-left':
      return { x: margin, y: margin };
    case 'top-right':
      return { x: canvasWidth - watermarkWidth - margin, y: margin };
    case 'bottom-left':
      return { x: margin, y: canvasHeight - watermarkHeight - margin };
    case 'bottom-right':
      return { x: canvasWidth - watermarkWidth - margin, y: canvasHeight - watermarkHeight - margin };
    case 'center':
      return { x: (canvasWidth - watermarkWidth) / 2, y: (canvasHeight - watermarkHeight) / 2 };
    default:
      return { x: margin, y: margin };
  }
}
