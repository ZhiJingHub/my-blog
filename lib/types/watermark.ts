export type WatermarkPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'tile' | 'diagonal-tile' | 'border' | 'band';

export type WatermarkStyle = 'default' | 'emboss' | 'shadow' | 'gradient';

export const WATERMARK_POSITIONS: { value: WatermarkPosition; label: string }[] = [
  { value: 'top-left', label: '左上' },
  { value: 'top-right', label: '右上' },
  { value: 'center', label: '居中' },
  { value: 'bottom-left', label: '左下' },
  { value: 'bottom-right', label: '右下' },
  { value: 'tile', label: '平铺' },
  { value: 'diagonal-tile', label: '对角平铺' },
  { value: 'border', label: '边框' },
  { value: 'band', label: '条带' }
];

export const WATERMARK_STYLES: { value: WatermarkStyle; label: string }[] = [
  { value: 'default', label: '默认' },
  { value: 'emboss', label: '浮雕' },
  { value: 'shadow', label: '阴影' },
  { value: 'gradient', label: '渐变' }
];

export interface WatermarkItem {
  id: string;
  type: 'text' | 'image';
  enabled: boolean;

  // 文字水印
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;

  // 图片水印
  imageUrl?: string;
  imageFile?: File;
  imageSize: number;

  // 样式
  style: WatermarkStyle;
  gradientEndColor: string;
  shadowBlur: number;
  embossDepth: number;

  // 通用设置
  opacity: number;
  rotation: number;
  position: WatermarkPosition;
  tileSpacing: number;
}

export const DEFAULT_WATERMARK: Omit<WatermarkItem, 'id'> = {
  type: 'text',
  enabled: true,
  text: '水印文字',
  fontSize: 24,
  fontFamily: 'Arial, sans-serif',
  color: '#ffffff',
  imageUrl: undefined,
  imageFile: undefined,
  imageSize: 100,
  style: 'default',
  gradientEndColor: '#000000',
  shadowBlur: 4,
  embossDepth: 2,
  opacity: 0.5,
  rotation: 0,
  position: 'bottom-right',
  tileSpacing: 100
};
