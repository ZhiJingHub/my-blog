import type { ConvertOptions, ConvertResult, OutputFormat, WatermarkOptions } from '@/lib/types/convert';
import { getWatermarkPosition } from '@/lib/utils/watermark-position';

function drawTextWatermark(
  ctx: CanvasRenderingContext2D,
  options: WatermarkOptions,
  canvasWidth: number,
  canvasHeight: number
): void {
  const fontSize = options.fontSize || 24;
  const fontFamily = 'Arial, sans-serif';
  ctx.font = `${fontSize}px ${fontFamily}`;

  const textMetrics = ctx.measureText(options.text);
  const textWidth = textMetrics.width;
  const textHeight = fontSize;

  ctx.save();
  ctx.globalAlpha = options.opacity;
  ctx.fillStyle = options.color;

  if (options.position === 'tile') {
    const spacing = options.tileSpacing || 100;
    const rotation = (options.rotation * Math.PI) / 180;

    for (let y = -canvasHeight; y < canvasHeight * 2; y += spacing) {
      for (let x = -canvasWidth; x < canvasWidth * 2; x += spacing) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.fillText(options.text, 0, 0);
        ctx.restore();
      }
    }
  } else {
    const pos = getWatermarkPosition(options.position, canvasWidth, canvasHeight, textWidth, textHeight);

    ctx.save();
    ctx.translate(pos.x + textWidth / 2, pos.y + textHeight / 2);
    ctx.rotate((options.rotation * Math.PI) / 180);
    ctx.fillText(options.text, -textWidth / 2, textHeight / 2);
    ctx.restore();
  }

  ctx.restore();
}

function drawImageWatermark(
  ctx: CanvasRenderingContext2D,
  watermarkImage: HTMLImageElement,
  options: WatermarkOptions,
  canvasWidth: number,
  canvasHeight: number
): void {
  const size = options.imageSize || 100;
  const aspectRatio = watermarkImage.naturalWidth / watermarkImage.naturalHeight;
  const watermarkWidth = size;
  const watermarkHeight = size / aspectRatio;

  ctx.save();
  ctx.globalAlpha = options.opacity;

  if (options.position === 'tile') {
    const spacing = options.tileSpacing || 100;

    for (let y = -watermarkHeight; y < canvasHeight + watermarkHeight; y += watermarkHeight + spacing) {
      for (let x = -watermarkWidth; x < canvasWidth + watermarkWidth; x += watermarkWidth + spacing) {
        ctx.drawImage(watermarkImage, x, y, watermarkWidth, watermarkHeight);
      }
    }
  } else {
    const pos = getWatermarkPosition(options.position, canvasWidth, canvasHeight, watermarkWidth, watermarkHeight);
    ctx.drawImage(watermarkImage, pos.x, pos.y, watermarkWidth, watermarkHeight);
  }

  ctx.restore();
}

export async function applyWatermark(
  ctx: CanvasRenderingContext2D,
  watermarkOptions: WatermarkOptions,
  canvasWidth: number,
  canvasHeight: number
): Promise<void> {
  if (!watermarkOptions.enabled || (!watermarkOptions.text && watermarkOptions.type === 'text')) {
    return;
  }

  if (watermarkOptions.type === 'text') {
    drawTextWatermark(ctx, watermarkOptions, canvasWidth, canvasHeight);
  } else if (watermarkOptions.type === 'image' && watermarkOptions.imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        drawImageWatermark(ctx, img, watermarkOptions, canvasWidth, canvasHeight);
        resolve();
      };
      img.onerror = reject;
      img.src = watermarkOptions.imageUrl!;
    });
  }
}

function convertToSVG(
  source: HTMLImageElement,
  options: ConvertOptions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('无法创建 Canvas 上下文'));
      return;
    }

    const width = options.width || source.naturalWidth;
    const height = options.height || source.naturalHeight;

    canvas.width = width;
    canvas.height = height;

    if (options.backgroundColor) {
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(source, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/png');
    const quality = Math.round(options.quality * 100);

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image xlink:href="${dataUrl}" width="${width}" height="${height}"
         style="image-rendering: ${quality > 80 ? 'optimizeQuality' : 'optimizeSpeed'}"/>
</svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    resolve(blob);
  });
}

export async function convertImage(
  source: HTMLImageElement,
  options: ConvertOptions
): Promise<Blob> {
  if (options.format === 'image/svg+xml') {
    return convertToSVG(source, options);
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('无法创建 Canvas 上下文');
  }

  const srcWidth = source.naturalWidth;
  const srcHeight = source.naturalHeight;
  const targetWidth = options.width || srcWidth;
  const targetHeight = options.height || srcHeight;

  const isRotated = options.rotation === 90 || options.rotation === 270;

  canvas.width = isRotated ? targetHeight : targetWidth;
  canvas.height = isRotated ? targetWidth : targetHeight;

  ctx.save();

  ctx.translate(canvas.width / 2, canvas.height / 2);

  if (options.rotation) {
    ctx.rotate((options.rotation * Math.PI) / 180);
  }

  if (options.flipH) {
    ctx.scale(-1, 1);
  }
  if (options.flipV) {
    ctx.scale(1, -1);
  }

  if (options.format === 'image/jpeg' || options.format === 'image/bmp') {
    ctx.fillStyle = options.backgroundColor || '#ffffff';
    ctx.fillRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
  }

  ctx.drawImage(
    source,
    -targetWidth / 2,
    -targetHeight / 2,
    targetWidth,
    targetHeight
  );

  ctx.restore();

  if (options.watermark?.enabled) {
    await applyWatermark(ctx, options.watermark, canvas.width, canvas.height);
  }

  return new Promise((blobResolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          blobResolve(blob);
        } else {
          reject(new Error('图片转换失败'));
        }
      },
      options.format,
      options.quality
    );
  });
}

export async function performConversion(
  source: HTMLImageElement,
  originalSize: number,
  options: ConvertOptions
): Promise<ConvertResult> {
  const blob = await convertImage(source, options);
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    width: options.width || source.naturalWidth,
    height: options.height || source.naturalHeight,
    originalSize,
    convertedSize: blob.size
  };
}

export function getFormatExtension(format: OutputFormat): string {
  const extensions: Record<OutputFormat, string> = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/webp': '.webp',
    'image/avif': '.avif',
    'image/bmp': '.bmp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg'
  };
  return extensions[format];
}

export function formatSupportsQuality(format: OutputFormat): boolean {
  return !['image/png', 'image/bmp', 'image/gif', 'image/svg+xml'].includes(format);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function calculateCompressionRate(original: number, converted: number): number {
  if (original === 0) return 0;
  return Math.round(((original - converted) / original) * 100);
}

export function calculateDimensions(
  original: { width: number; height: number },
  target: { width?: number; height?: number; maintainAspectRatio: boolean }
): { width: number; height: number } {
  if (!target.maintainAspectRatio) {
    return {
      width: target.width || original.width,
      height: target.height || original.height
    };
  }

  const aspectRatio = original.width / original.height;

  if (target.width) {
    return {
      width: target.width,
      height: Math.round(target.width / aspectRatio)
    };
  }

  if (target.height) {
    return {
      width: Math.round(target.height * aspectRatio),
      height: target.height
    };
  }

  return { width: original.width, height: original.height };
}

export async function supportsAVIF(): Promise<boolean> {
  return new Promise((resolve) => {
    const avif = new Image();
    avif.onload = () => resolve(true);
    avif.onerror = () => resolve(false);
    avif.src =
      'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
}

export function generateOutputFilename(originalName: string, newExtension: string): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  return `${baseName}${newExtension}`;
}
