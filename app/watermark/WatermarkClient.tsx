'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { WATERMARK_POSITIONS, WATERMARK_STYLES } from '@/lib/types/watermark';
import type { WatermarkItem } from '@/lib/types/watermark';
import { DEFAULT_WATERMARK } from '@/lib/types/watermark';
import { loadImage, revokeUrl, formatFileSize } from '@/lib/utils/image';
import type { LoadedImage } from '@/lib/utils/image';
import { generatePreview, exportWatermarkedImage } from './watermark';

export default function WatermarkClient() {
  const [sourceImage, setSourceImage] = useState<LoadedImage | null>(null);
  const [watermarks, setWatermarks] = useState<WatermarkItem[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addWatermark(type: 'text' | 'image') {
    const id = crypto.randomUUID();
    setWatermarks([...watermarks, { ...DEFAULT_WATERMARK, id, type }]);
  }

  function removeWatermark(id: string) {
    const item = watermarks.find((w) => w.id === id);
    if (item?.imageUrl) {
      URL.revokeObjectURL(item.imageUrl);
    }
    setWatermarks(watermarks.filter((w) => w.id !== id));
  }

  function updateWatermark(id: string, updates: Partial<WatermarkItem>) {
    setWatermarks(watermarks.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  }

  async function handleFileUpload(file: File) {
    setError(null);
    setPreviewUrl(null);

    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('文件大小不能超过 50MB');
      return;
    }

    try {
      if (sourceImage) {
        revokeUrl(sourceImage.url);
      }
      setSourceImage(await loadImage(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载图片失败');
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const file = input.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }

  function handleDragenter(event: React.DragEvent) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragover(event: React.DragEvent) {
    event.preventDefault();
  }

  function handleDragleave(event: React.DragEvent) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer?.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }

  async function handlePreview() {
    if (!sourceImage || watermarks.length === 0) return;

    setIsGenerating(true);
    setError(null);

    try {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = await generatePreview(sourceImage.img, watermarks);
      setPreviewUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成预览失败');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleExport() {
    if (!sourceImage || watermarks.length === 0) return;

    setIsGenerating(true);
    setError(null);

    try {
      const blob = await exportWatermarkedImage(sourceImage.img, watermarks, 'image/png');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `watermarked-${sourceImage.file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : '导出失败');
    } finally {
      setIsGenerating(false);
    }
  }

  function handleWatermarkImageUpload(watermarkId: string, file: File) {
    const item = watermarks.find((w) => w.id === watermarkId);
    if (item?.imageUrl) {
      URL.revokeObjectURL(item.imageUrl);
    }

    const url = URL.createObjectURL(file);
    updateWatermark(watermarkId, { imageUrl: url, imageFile: file });
  }

  function handleReset() {
    if (sourceImage) {
      revokeUrl(sourceImage.url);
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    watermarks.forEach((w) => {
      if (w.imageUrl) URL.revokeObjectURL(w.imageUrl);
    });

    setSourceImage(null);
    setPreviewUrl(null);
    setWatermarks([]);
    setError(null);
  }

  useEffect(() => {
    return () => {
      if (sourceImage) revokeUrl(sourceImage.url);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      watermarks.forEach((w) => {
        if (w.imageUrl) URL.revokeObjectURL(w.imageUrl);
      });
    };
  }, []);

  return (
    <div className="watermark-layout">
      <div className="watermark-title-col">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">图片水印</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          在线图片添加水印工具，支持文字水印和图片水印，支持多种水印方案同时添加
        </p>
      </div>

      <div className="watermark-preview-col">
        <div
          className={`upload-area ${isDragging ? 'dragging' : ''} ${sourceImage ? 'has-image' : ''}`}
          onDragEnter={handleDragenter}
          onDragOver={handleDragover}
          onDragLeave={handleDragleave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
          role="button"
          tabIndex={0}
          aria-label="上传图片"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('file-input')?.click(); } }}
        >
          <input
            id="file-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {sourceImage ? (
            <div className="flex w-full flex-col items-center gap-4">
              <div className="relative w-full rounded-xl overflow-hidden border border-border">
                {previewUrl ? (
                  <img src={previewUrl} alt="水印预览" className="mx-auto max-h-[350px] w-full object-contain bg-muted/30" />
                ) : (
                  <img src={sourceImage.url} alt="原图预览" className="mx-auto max-h-[350px] w-full object-contain bg-muted/30" />
                )}
                <Badge variant={previewUrl ? 'default' : 'secondary'} className="absolute left-2 top-2">
                  {previewUrl ? '水印效果' : '原图'}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Icon icon="mdi:file-image" className="size-4" />
                  {sourceImage.file.name}
                </span>
                <span className="flex items-center gap-1">
                  <Icon icon="mdi:resize" className="size-4" />
                  {sourceImage.width} × {sourceImage.height}
                </span>
                <span className="flex items-center gap-1">
                  <Icon icon="mdi:harddisk" className="size-4" />
                  {formatFileSize(sourceImage.file.size)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Icon icon="mdi:image-plus" className="size-12" />
              <div className="text-center">
                <p className="text-lg font-medium">点击或拖拽上传图片</p>
                <p className="mt-1 text-sm">支持 PNG、JPG、WebP、GIF、BMP、SVG</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            <Icon icon="mdi:alert-circle" className="mr-2 inline size-4" />
            {error}
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex gap-3">
            <Button
              className="flex-1 h-11 text-base font-medium"
              size="lg"
              onClick={handlePreview}
              disabled={!sourceImage || watermarks.length === 0 || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Icon icon="mdi:loading" className="mr-2 size-5 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Icon icon="mdi:eye" className="mr-2 size-5" />
                  预览效果
                </>
              )}
            </Button>
            <Button
              className="flex-1 h-11 text-base font-medium"
              size="lg"
              variant="default"
              onClick={handleExport}
              disabled={!sourceImage || watermarks.length === 0 || isGenerating}
            >
              <Icon icon="mdi:download" className="mr-2 size-5" />
              导出图片
            </Button>
          </div>
          <Button variant="outline" className="mt-2 w-full" onClick={handleReset}>
            <Icon icon="mdi:refresh" className="mr-2 size-4" />
            重置
          </Button>
        </div>
      </div>

      <div className="watermark-settings-col">
        <div className="settings-card shadow-sm">
          <h3 className="settings-title">
            <Icon icon="mdi:plus-circle" className="size-4" />
            添加水印
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => addWatermark('text')}>
              <Icon icon="mdi:format-text" className="mr-1 size-4" />
              文字水印
            </Button>
            <Button variant="outline" onClick={() => addWatermark('image')}>
              <Icon icon="mdi:image" className="mr-1 size-4" />
              图片水印
            </Button>
          </div>
        </div>

        {watermarks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            <Icon icon="mdi:watermark" className="size-8" />
            <p className="text-sm">暂无水印</p>
            <p className="text-xs">点击上方按钮添加水印</p>
          </div>
        ) : (
          watermarks.map((watermark) => (
            <div key={watermark.id} className={`settings-card shadow-sm ${watermark.enabled ? '' : 'opacity-60'}`}>
              <div className="flex items-center justify-between">
                <h3 className="settings-title mb-0">
                  <Icon icon={watermark.type === 'text' ? 'mdi:format-text' : 'mdi:image'} className="size-4" />
                  {watermark.type === 'text' ? '文字水印' : '图片水印'}
                </h3>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={watermark.enabled}
                    onCheckedChange={(v) => updateWatermark(watermark.id, { enabled: v })}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-7 p-0 text-destructive"
                    onClick={() => removeWatermark(watermark.id)}
                    aria-label={`删除水印 ${watermark.type === 'text' ? watermark.text : '图片'}`}
                  >
                    <Icon icon="mdi:delete" className="size-4" />
                  </Button>
                </div>
              </div>

              {watermark.enabled && (
                <>
                  {watermark.type === 'text' ? (
                    <>
                      <div>
                        <label htmlFor={`wm-text-${watermark.id}`} className="mb-1 block text-xs text-muted-foreground">水印文字</label>
                        <Input
                          id={`wm-text-${watermark.id}`}
                          type="text"
                          value={watermark.text}
                          onChange={(e) => updateWatermark(watermark.id, { text: e.target.value })}
                          placeholder="请输入水印文字"
                          className="w-full"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-xs text-muted-foreground">字体大小</label>
                          <div className="flex items-center gap-2">
                            <Slider
                              value={[watermark.fontSize]}
                              onValueChange={(v) => updateWatermark(watermark.id, { fontSize: Array.isArray(v) ? v[0] : v })}
                              min={12}
                              max={72}
                              step={1}
                            />
                            <span className="w-8 text-right text-xs text-muted-foreground">{watermark.fontSize}</span>
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-muted-foreground">颜色</label>
                          <input
                            type="color"
                            value={watermark.color}
                            onChange={(e) => updateWatermark(watermark.id, { color: e.target.value })}
                            className="size-9 cursor-pointer rounded border"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">旋转角度</span>
                          <span className="text-xs text-muted-foreground">{watermark.rotation}°</span>
                        </div>
                        <Slider
                          value={[watermark.rotation]}
                          onValueChange={(v) => updateWatermark(watermark.id, { rotation: Array.isArray(v) ? v[0] : v })}
                          min={-180}
                          max={180}
                          step={5}
                        />
                      </div>

                      <div>
                        <p className="mb-1 text-xs text-muted-foreground">水印样式</p>
                        <div className="grid grid-cols-4 gap-1.5">
                          {WATERMARK_STYLES.map((style) => (
                            <Button
                              key={style.value}
                              variant={watermark.style === style.value ? 'default' : 'outline'}
                              size="sm"
                              className="text-xs"
                              onClick={() => updateWatermark(watermark.id, { style: style.value })}
                            >
                              {style.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {watermark.style === 'emboss' && (
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">浮雕深度</span>
                            <span className="text-xs text-muted-foreground">{watermark.embossDepth}px</span>
                          </div>
                          <Slider
                            value={[watermark.embossDepth]}
                            onValueChange={(v) => updateWatermark(watermark.id, { embossDepth: Array.isArray(v) ? v[0] : v })}
                            min={1}
                            max={8}
                            step={1}
                          />
                        </div>
                      )}

                      {watermark.style === 'shadow' && (
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">阴影模糊</span>
                            <span className="text-xs text-muted-foreground">{watermark.shadowBlur}px</span>
                          </div>
                          <Slider
                            value={[watermark.shadowBlur]}
                            onValueChange={(v) => updateWatermark(watermark.id, { shadowBlur: Array.isArray(v) ? v[0] : v })}
                            min={1}
                            max={20}
                            step={1}
                          />
                        </div>
                      )}

                      {watermark.style === 'gradient' && (
                        <div>
                          <label className="mb-1 block text-xs text-muted-foreground">渐变结束色</label>
                          <input
                            type="color"
                            value={watermark.gradientEndColor}
                            onChange={(e) => updateWatermark(watermark.id, { gradientEndColor: e.target.value })}
                            className="size-9 cursor-pointer rounded border"
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">水印图片</label>
                        <div className="flex items-center gap-2">
                          {watermark.imageUrl && (
                            <img src={watermark.imageUrl} alt="水印" className="size-10 rounded border object-contain" />
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById(`wm-image-${watermark.id}`)?.click()}
                          >
                            <Icon icon="mdi:upload" className="mr-1 size-4" />
                            {watermark.imageUrl ? '更换' : '上传'}
                          </Button>
                          {watermark.imageUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (watermark.imageUrl) URL.revokeObjectURL(watermark.imageUrl);
                                updateWatermark(watermark.id, { imageUrl: undefined, imageFile: undefined });
                              }}
                            >
                              <Icon icon="mdi:close" className="size-4" />
                            </Button>
                          )}
                        </div>
                        <input
                          id={`wm-image-${watermark.id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleWatermarkImageUpload(watermark.id, file);
                          }}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">水印大小</label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[watermark.imageSize]}
                            onValueChange={(v) => updateWatermark(watermark.id, { imageSize: Array.isArray(v) ? v[0] : v })}
                            min={20}
                            max={300}
                            step={5}
                          />
                          <span className="w-10 text-right text-xs text-muted-foreground">{watermark.imageSize}px</span>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">位置</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {WATERMARK_POSITIONS.map((pos) => (
                        <Button
                          key={pos.value}
                          variant={watermark.position === pos.value ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs"
                          onClick={() => updateWatermark(watermark.id, { position: pos.value })}
                        >
                          {pos.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">透明度</span>
                      <span className="text-xs text-muted-foreground">{Math.round(watermark.opacity * 100)}%</span>
                    </div>
                    <Slider
                      value={[watermark.opacity]}
                      onValueChange={(v) => updateWatermark(watermark.id, { opacity: Array.isArray(v) ? v[0] : v })}
                      min={0.05}
                      max={1}
                      step={0.05}
                    />
                  </div>

                  {(watermark.position === 'tile' || watermark.position === 'diagonal-tile') && (
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">平铺间距</span>
                        <span className="text-xs text-muted-foreground">{watermark.tileSpacing}px</span>
                      </div>
                      <Slider
                        value={[watermark.tileSpacing]}
                        onValueChange={(v) => updateWatermark(watermark.id, { tileSpacing: Array.isArray(v) ? v[0] : v })}
                        min={50}
                        max={300}
                        step={10}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .watermark-layout {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .watermark-title-col {
          display: block;
        }
        .watermark-preview-col {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
          min-width: 0;
        }
        .watermark-settings-col {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
          min-width: 0;
        }

        .upload-area {
          display: flex;
          min-height: 200px;
          cursor: pointer;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 0.75rem;
          border: 2px dashed;
          padding: 2rem;
          transition: all 0.2s;
          border-color: color-mix(in srgb, var(--muted-foreground) 25%, transparent);
          background: var(--card);
        }
        .upload-area:hover {
          border-color: color-mix(in srgb, var(--primary) 50%, transparent);
        }
        .upload-area.dragging {
          border-color: var(--primary);
          background: color-mix(in srgb, var(--primary) 5%, transparent);
        }
        .upload-area.has-image {
          border-style: solid;
          border-color: var(--border);
        }

        .settings-card {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border-radius: 0.75rem;
          border: 1px solid var(--border);
          background: var(--card);
          padding: 1rem;
        }
        .settings-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        @media (min-width: 1024px) {
          .watermark-layout {
            display: grid;
            grid-template-columns: 1fr 420px;
            grid-template-rows: auto 1fr;
            gap: 1.5rem;
            align-items: start;
          }
          .watermark-title-col {
            grid-column: 1;
            grid-row: 1;
          }
          .watermark-preview-col {
            grid-column: 1;
            grid-row: 2;
            position: sticky;
            top: 1.5rem;
          }
          .watermark-settings-col {
            grid-column: 2;
            grid-row: 1 / -1;
            max-height: calc(100vh - 3rem);
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: var(--muted-foreground) transparent;
            scrollbar-gutter: stable;
          }
          .watermark-settings-col::-webkit-scrollbar {
            width: 6px;
          }
          .watermark-settings-col::-webkit-scrollbar-track {
            background: transparent;
          }
          .watermark-settings-col::-webkit-scrollbar-thumb {
            background-color: var(--muted-foreground);
            border-radius: 3px;
            min-height: 30px;
          }
        }

        @media (min-width: 1280px) {
          .watermark-layout {
            grid-template-columns: 1fr 460px;
          }
        }
      `}</style>
    </div>
  );
}
