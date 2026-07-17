'use client';

import { useState, useCallback } from 'react';

interface ExportConfig {
  format: 'png' | 'svg';
  scales: number[];
  filename: string;
  transparentBg: boolean;
  exportRatios: string[];
}

interface Ratio {
  label: string;
  w: number;
  h: number;
  checked: boolean;
}

interface ExportContext {
  getSvgContainer: () => SVGSVGElement | null;
  getCanvasWidth: () => number;
  getCanvasHeight: () => number;
  getExportConfig: () => ExportConfig;
  getActiveRatios: () => Ratio[];
  getBgImage: () => string | null;
  getLocalIcon: () => string | null;
  getCustomFontName: () => string;
  getFontDataBase64: () => Promise<string | null>;
}

async function blobToDataUrl(blobUrl: string): Promise<string> {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

function downloadLink(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function useExport(ctx: ExportContext) {
  const BASE_HEIGHT = 600;
  const [exportStatus, setExportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const doExport = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportStatus(null);

    const ratioGuides: { el: SVGElement; display: string }[] = [];
    let borderEl: SVGElement | null = null;
    let borderDisplay = '';

    try {
      const svgContainer = ctx.getSvgContainer();
      if (!svgContainer) {
        setExportStatus({ type: 'error', message: '预览区域未初始化，请刷新页面后重试。' });
        return;
      }

      const canvasWidth = ctx.getCanvasWidth();
      const exportConfig = ctx.getExportConfig();
      const activeRatios = ctx.getActiveRatios();
      const bgImage = ctx.getBgImage();
      const localIcon = ctx.getLocalIcon();
      const customFontName = ctx.getCustomFontName();
      const fontBase64 = await ctx.getFontDataBase64();

      const guides = svgContainer.querySelectorAll('.ratio-guide');
      for (const g of guides) {
        ratioGuides.push({ el: g as SVGElement, display: (g as SVGElement).style.display });
        (g as SVGElement).style.display = 'none';
      }

      const border = svgContainer.querySelector('.canvas-border');
      if (border) {
        borderEl = border as SVGElement;
        borderDisplay = borderEl.style.display;
        borderEl.style.display = 'none';
      }

      const svgClone = svgContainer.cloneNode(true) as SVGSVGElement;
      svgClone.setAttribute('width', canvasWidth.toString());
      svgClone.setAttribute('height', BASE_HEIGHT.toString());
      svgClone.removeAttribute('class');
      svgClone.removeAttribute('style');

      if (exportConfig.transparentBg) {
        const bgRects = svgClone.querySelectorAll('.bg-fill');
        for (const r of bgRects) r.remove();
      }

      if (fontBase64) {
        const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        style.textContent = `@font-face { font-family: '${customFontName}'; src: url(${fontBase64}); }`;
        svgClone.insertBefore(style, svgClone.firstChild);
      }

      if (bgImage) {
        const imgEl = svgClone.querySelector('image[href]');
        if (imgEl && bgImage.startsWith('blob:')) {
          try {
            imgEl.setAttribute('href', await blobToDataUrl(bgImage));
          } catch (e) {
            console.warn('[CoverGenerator] Failed to convert bgImage to data URL:', e);
            setExportStatus({ type: 'error', message: '背景图片转换失败，请尝试重新上传背景图片后导出。' });
            return;
          }
        }
      }

      if (localIcon) {
        const localImgEl = svgClone.querySelector('img[src]');
        if (localImgEl && localIcon.startsWith('blob:')) {
          try {
            localImgEl.setAttribute('src', await blobToDataUrl(localIcon));
          } catch (e) {
            console.warn('[CoverGenerator] Failed to convert localIcon to data URL:', e);
            setExportStatus({ type: 'error', message: '本地图标转换失败，请尝试重新上传图标后导出。' });
            return;
          }
        }
      }

      const ratiosToExport =
        exportConfig.exportRatios.length > 0
          ? activeRatios.filter((r) => exportConfig.exportRatios.includes(r.label))
          : activeRatios;

      let exportedCount = 0;
      for (const ratio of ratiosToExport) {
        const ratioWidth = Math.round(BASE_HEIGHT * (ratio.w / ratio.h));
        const ratioHeight = BASE_HEIGHT;
        const xOffset = (canvasWidth - ratioWidth) / 2;

        const ratioSvgClone = svgClone.cloneNode(true) as SVGSVGElement;
        ratioSvgClone.setAttribute('width', ratioWidth.toString());
        ratioSvgClone.setAttribute('height', ratioHeight.toString());
        ratioSvgClone.setAttribute('viewBox', `${xOffset} 0 ${ratioWidth} ${ratioHeight}`);

        const svgData = new XMLSerializer().serializeToString(ratioSvgClone);
        const ratioFilename =
          activeRatios.length > 1
            ? `${exportConfig.filename}-${ratio.label.replace(':', '-')}`
            : exportConfig.filename;

        if (exportConfig.format === 'svg') {
          const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          downloadLink(url, `${ratioFilename}.svg`);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          exportedCount++;
        } else {
          const img = new Image();
          img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Image export failed'));
          });

          const scales = exportConfig.scales.length > 0 ? exportConfig.scales : [1];
          for (const scale of scales) {
            const canvas = document.createElement('canvas');
            canvas.width = ratioWidth * scale;
            canvas.height = ratioHeight * scale;
            const canvasCtx = canvas.getContext('2d');
            if (!canvasCtx) continue;
            canvasCtx.imageSmoothingEnabled = true;
            canvasCtx.imageSmoothingQuality = 'high';
            canvasCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const suffix = scales.length > 1 ? `@${scale}x` : '';
            downloadLink(canvas.toDataURL('image/png'), `${ratioFilename}${suffix}.png`);
            exportedCount++;
          }
        }
      }

      setExportStatus({ type: 'success', message: `导出成功，共 ${exportedCount} 个文件。` });
    } catch (e) {
      console.error('[CoverGenerator] Export failed:', e);
      setExportStatus({
        type: 'error',
        message: e instanceof Error ? `导出失败：${e.message}` : '导出失败，请重试。'
      });
    } finally {
      for (const g of ratioGuides) (g.el as SVGElement).style.display = g.display;
      if (borderEl) (borderEl as SVGElement).style.display = borderDisplay;
      setIsExporting(false);
    }
  }, [isExporting, ctx]);

  return {
    doExport,
    exportStatus,
    isExporting
  };
}
