'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { WATERMARK_POSITIONS } from '@/lib/types/convert';
import type {
  ConvertOptions,
  ConvertResult,
  CompressionPreset,
  BatchItem,
  OutputFormat
} from '@/lib/types/convert';
import {
  FORMAT_OPTIONS,
  PRESET_SCALES,
  COMPRESSION_PRESETS
} from '@/lib/types/convert';
import { loadImage, revokeUrl, formatFileSize } from '@/lib/utils/image';
import type { LoadedImage } from '@/lib/utils/image';
import {
  calculateCompressionRate,
  calculateDimensions,
  supportsAVIF,
  generateOutputFilename,
  performConversion,
  getFormatExtension,
  formatSupportsQuality,
  downloadBlob
} from './converter';

export default function ConvertClient() {
  const [sourceImage, setSourceImage] = useState<LoadedImage | null>(null);
  const [convertResult, setConvertResult] = useState<ConvertResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avifSupported, setAvifSupported] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<'single' | 'batch'>('single');

  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isBatchConverting, setIsBatchConverting] = useState(false);

  const [options, setOptions] = useState<ConvertOptions>({
    format: 'image/webp',
    quality: 0.85,
    maintainAspectRatio: true,
    backgroundColor: '#ffffff',
    customFilename: '',
    rotation: 0,
    flipH: false,
    flipV: false,
    watermark: {
      enabled: false,
      type: 'text',
      text: '',
      fontSize: 24,
      color: '#ffffff',
      opacity: 0.5,
      rotation: 0,
      position: 'bottom-right',
      imageUrl: undefined,
      imageFile: undefined,
      imageSize: 100,
      tileSpacing: 100
    }
  });

  const [widthInput, setWidthInput] = useState<string>('');
  const [heightInput, setHeightInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState('format');

  const availableFormats = FORMAT_OPTIONS.filter(
    (f) => f.value !== 'image/avif' || avifSupported
  );

  const showQuality = formatSupportsQuality(options.format);

  const compressionRate = convertResult
    ? calculateCompressionRate(convertResult.originalSize, convertResult.convertedSize)
    : 0;

  useEffect(() => {
    supportsAVIF().then(setAvifSupported);
  }, []);

  async function handleFileUpload(file: File) {
    setError(null);
    setConvertResult(null);

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

      const loaded = await loadImage(file);
      setSourceImage(loaded);
      setWidthInput(loaded.width.toString());
      setHeightInput(loaded.height.toString());
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载图片失败');
    }
  }

  async function handleBatchUpload(files: FileList) {
    setError(null);
    const newItems: BatchItem[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 50 * 1024 * 1024) continue;

      try {
        const loaded = await loadImage(file);
        newItems.push({
          id: crypto.randomUUID(),
          file,
          url: loaded.url,
          img: loaded.img,
          width: loaded.width,
          height: loaded.height,
          status: 'pending'
        });
      } catch (e) {
        console.error('加载图片失败:', file.name, e);
      }
    }

    setBatchItems([...batchItems, ...newItems]);
  }

  function handleBatchFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) {
      handleBatchUpload(event.target.files);
    }
  }

  function removeBatchItem(id: string) {
    const item = batchItems.find((i) => i.id === id);
    if (item) {
      revokeUrl(item.url);
      if (item.result) {
        revokeUrl(item.result.url);
      }
    }
    setBatchItems(batchItems.filter((i) => i.id !== id));
  }

  function clearBatchItems() {
    batchItems.forEach((item) => {
      revokeUrl(item.url);
      if (item.result) {
        revokeUrl(item.result.url);
      }
    });
    setBatchItems([]);
  }

  async function handleBatchConvert() {
    if (batchItems.length === 0) return;

    setIsBatchConverting(true);
    setError(null);

    try {
      const promises = batchItems.map(async (item) => {
        setBatchItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: 'converting' as const } : i))
        );

        try {
          const width = parseInt(widthInput) || undefined;
          const height = parseInt(heightInput) || undefined;

          const result = await performConversion(item.img, item.file.size, {
            ...options,
            width,
            height
          });

          setBatchItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, status: 'done' as const, result } : i))
          );
        } catch (e) {
          setBatchItems((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? { ...i, status: 'error' as const, error: e instanceof Error ? e.message : '转换失败' }
                : i
            )
          );
        }
      });

      await Promise.all(promises);
    } catch (e) {
      setError(e instanceof Error ? e.message : '批量转换失败');
    } finally {
      setIsBatchConverting(false);
    }
  }

  function downloadBatchResults() {
    const doneItems = batchItems.filter((i) => i.status === 'done' && i.result);

    doneItems.forEach((item) => {
      if (item.result) {
        const extension = getFormatExtension(options.format);
        let filename: string;

        if (options.customFilename?.trim()) {
          filename = options.customFilename.trim();
          if (!filename.includes('.')) {
            filename += extension;
          }
          const index = doneItems.indexOf(item) + 1;
          filename = filename.replace(/(\.[^.]+)?$/, `_${index}$1`);
        } else {
          filename = generateOutputFilename(item.file.name, extension);
        }

        downloadBlob(item.result.blob, filename);
      }
    });
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
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

  function handleWidthChange() {
    if (!sourceImage) return;

    const width = parseInt(widthInput);
    if (isNaN(width) || width <= 0) return;

    if (options.maintainAspectRatio) {
      const dims = calculateDimensions(
        { width: sourceImage.width, height: sourceImage.height },
        { width, maintainAspectRatio: true }
      );
      setHeightInput(dims.height.toString());
    }
  }

  function handleHeightChange() {
    if (!sourceImage) return;

    const height = parseInt(heightInput);
    if (isNaN(height) || height <= 0) return;

    if (options.maintainAspectRatio) {
      const dims = calculateDimensions(
        { width: sourceImage.width, height: sourceImage.height },
        { height, maintainAspectRatio: true }
      );
      setWidthInput(dims.width.toString());
    }
  }

  function applyPresetScale(scale: number) {
    if (!sourceImage) return;

    const newWidth = Math.round(sourceImage.width * scale);
    const newHeight = Math.round(sourceImage.height * scale);

    setWidthInput(newWidth.toString());
    setHeightInput(newHeight.toString());
  }

  function applyCompressionPreset(preset: CompressionPreset) {
    setOptions({ ...options, format: preset.format, quality: preset.quality });
  }

  function rotateImage(degrees: number) {
    setOptions({ ...options, rotation: (options.rotation + degrees) % 360 });
  }

  function toggleFlipH() {
    setOptions({ ...options, flipH: !options.flipH });
  }

  function toggleFlipV() {
    setOptions({ ...options, flipV: !options.flipV });
  }

  async function handleConvert() {
    if (!sourceImage) return;

    setIsConverting(true);
    setError(null);

    try {
      const width = parseInt(widthInput) || undefined;
      const height = parseInt(heightInput) || undefined;

      const result = await performConversion(sourceImage.img, sourceImage.file.size, {
        ...options,
        width,
        height
      });

      if (convertResult) {
        revokeUrl(convertResult.url);
      }

      setConvertResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败');
    } finally {
      setIsConverting(false);
    }
  }

  function handleDownload() {
    if (!convertResult || !sourceImage) return;

    const extension = getFormatExtension(options.format);
    let filename: string;

    if (options.customFilename?.trim()) {
      filename = options.customFilename.trim();
      if (!filename.includes('.')) {
        filename += extension;
      }
    } else {
      filename = generateOutputFilename(sourceImage.file.name, extension);
    }

    downloadBlob(convertResult.blob, filename);
  }

  function handleReset() {
    if (sourceImage) {
      revokeUrl(sourceImage.url);
    }
    if (convertResult) {
      revokeUrl(convertResult.url);
    }
    if (options.watermark.imageUrl) {
      URL.revokeObjectURL(options.watermark.imageUrl);
    }

    setSourceImage(null);
    setConvertResult(null);
    setError(null);
    setWidthInput('');
    setHeightInput('');
    setOptions({
      format: 'image/webp',
      quality: 0.85,
      maintainAspectRatio: true,
      backgroundColor: '#ffffff',
      customFilename: '',
      rotation: 0,
      flipH: false,
      flipV: false,
      watermark: {
        enabled: false,
        type: 'text',
        text: '',
        fontSize: 24,
        color: '#ffffff',
        opacity: 0.5,
        rotation: 0,
        position: 'bottom-right',
        imageUrl: undefined,
        imageFile: undefined,
        imageSize: 100,
        tileSpacing: 100
      }
    });
  }

  useEffect(() => {
    return () => {
      if (sourceImage) {
        revokeUrl(sourceImage.url);
      }
      if (convertResult) {
        revokeUrl(convertResult.url);
      }
      if (options.watermark.imageUrl) {
        URL.revokeObjectURL(options.watermark.imageUrl);
      }
      batchItems.forEach((item) => {
        revokeUrl(item.url);
        if (item.result) {
          revokeUrl(item.result.url);
        }
      });
    };
  }, []);

  return (
    <div className="convert-layout">
      <div className="convert-title-col">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">图片格式转换</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          在线图片格式转换工具，支持 PNG、JPG、WebP、AVIF、BMP、GIF、SVG 格式相互转换
        </p>
        <div className="mt-4">
          <div className="inline-flex rounded-lg border bg-muted/30 p-1">
            <button
              onClick={() => setMode('single')}
              className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm transition-all ${
                mode === 'single'
                  ? 'bg-background font-medium shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon icon="mdi:image" className="size-4" />
              单图转换
            </button>
            <button
              onClick={() => setMode('batch')}
              className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm transition-all ${
                mode === 'batch'
                  ? 'bg-background font-medium shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon icon="mdi:image-multiple" className="size-4" />
              批量转换
            </button>
          </div>
        </div>
      </div>

      <div className="convert-preview-col">
        {mode === 'single' ? (
          <>
            <div
              className={`upload-area ${isDragging ? 'dragging' : ''} ${sourceImage ? 'has-image' : ''}`}
              onDragEnter={handleDragenter}
              onDragOver={handleDragover}
              onDragLeave={handleDragleave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
              role="button"
              tabIndex={0}
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
                  <div className="relative w-full">
                    <img
                      src={sourceImage.url}
                      alt="原图预览"
                      className="mx-auto max-h-[300px] rounded-lg object-contain"
                    />
                    <Badge variant="secondary" className="absolute left-2 top-2">原图</Badge>
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

            {convertResult && (
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-full">
                    <img
                      src={convertResult.url}
                      alt="转换结果"
                      className="mx-auto max-h-[300px] rounded-lg object-contain"
                    />
                    <Badge variant="default" className="absolute left-2 top-2">转换后</Badge>
                  </div>

                  <div className="w-full rounded-lg bg-muted/50 p-4">
                    <div className="mb-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">原始大小</span>
                      <span className="font-medium">{formatFileSize(convertResult.originalSize)}</span>
                    </div>
                    <div className="mb-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">转换后大小</span>
                      <span className="font-medium">{formatFileSize(convertResult.convertedSize)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3 text-sm">
                      <span className="text-muted-foreground">压缩率</span>
                      <span
                        className={`font-medium ${
                          compressionRate > 0
                            ? 'text-green-500'
                            : compressionRate < 0
                              ? 'text-red-500'
                              : ''
                        }`}
                      >
                        {compressionRate > 0 ? '↓' : compressionRate < 0 ? '↑' : ''}{Math.abs(compressionRate)}%
                      </span>
                    </div>
                  </div>

                  <Button onClick={handleDownload} className="w-full h-11 text-base font-medium" size="lg">
                    <Icon icon="mdi:download" className="mr-2 size-5" />
                    下载转换结果
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Icon icon="mdi:image-multiple" className="size-4" />
                批量上传
              </h3>
              <div
                className={`upload-area ${isDragging ? 'dragging' : ''}`}
                onDragEnter={handleDragenter}
                onDragOver={handleDragover}
                onDragLeave={handleDragleave}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer?.files.length) {
                    handleBatchUpload(e.dataTransfer.files);
                  }
                }}
                onClick={() => document.getElementById('batch-file-input')?.click()}
                role="button"
                tabIndex={0}
              >
                <input
                  id="batch-file-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleBatchFileChange}
                />
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Icon icon="mdi:image-multiple-plus" className="size-8" />
                  <p className="text-sm font-medium">点击或拖拽上传多张图片</p>
                  <p className="text-xs">已添加 {batchItems.length} 张图片</p>
                </div>
              </div>
            </div>

            {batchItems.length > 0 && (
              <div className="rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Icon icon="mdi:format-list-bulleted" className="size-4" />
                    图片列表
                  </span>
                  <Badge variant="secondary">{batchItems.length} 张</Badge>
                </div>
                <div className="max-h-[400px] divide-y overflow-y-auto">
                  {batchItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3">
                      <img
                        src={item.url}
                        alt={item.file.name}
                        className="size-10 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{item.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.width}×{item.height} · {formatFileSize(item.file.size)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === 'pending' && (
                          <Badge variant="outline" className="text-xs">等待</Badge>
                        )}
                        {item.status === 'converting' && (
                          <Badge variant="secondary" className="text-xs">
                            <Icon icon="mdi:loading" className="mr-1 size-3 animate-spin" />
                            转换中
                          </Badge>
                        )}
                        {item.status === 'done' && (
                          <Badge variant="default" className="bg-green-500 text-xs">完成</Badge>
                        )}
                        {item.status === 'error' && (
                          <Badge variant="destructive" className="text-xs">失败</Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-7 p-0"
                          onClick={() => removeBatchItem(item.id)}
                        >
                          <Icon icon="mdi:close" className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            <Icon icon="mdi:alert-circle" className="mr-2 inline size-4" />
            {error}
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          {mode === 'single' ? (
            <Button
              className="w-full h-11 text-base font-medium"
              size="lg"
              onClick={handleConvert}
              disabled={!sourceImage || isConverting}
            >
              {isConverting ? (
                <>
                  <Icon icon="mdi:loading" className="mr-2 size-5 animate-spin" />
                  转换中...
                </>
              ) : (
                <>
                  <Icon icon="mdi:swap-horizontal" className="mr-2 size-5" />
                  开始转换
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                className="w-full h-11 text-base font-medium"
                size="lg"
                onClick={handleBatchConvert}
                disabled={batchItems.length === 0 || isBatchConverting}
              >
                {isBatchConverting ? (
                  <>
                    <Icon icon="mdi:loading" className="mr-2 size-5 animate-spin" />
                    批量转换中...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:swap-horizontal" className="mr-2 size-5" />
                    批量转换 ({batchItems.length} 张)
                  </>
                )}
              </Button>

              {batchItems.some((i) => i.status === 'done') && (
                <Button
                  className="mt-2 w-full bg-green-600 hover:bg-green-700"
                  onClick={downloadBatchResults}
                >
                  <Icon icon="mdi:download-multiple" className="mr-2 size-5" />
                  下载全部结果
                </Button>
              )}

              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={clearBatchItems}
                disabled={batchItems.length === 0}
              >
                <Icon icon="mdi:delete-sweep" className="mr-2 size-4" />
                清空列表
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="convert-settings-col">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex w-full border-b bg-muted/30">
            {['format', 'adjust', 'advanced'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 text-sm transition-all ${
                  activeTab === tab
                    ? 'bg-background border-b-2 border-primary font-medium text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                {tab === 'format' ? '格式' : tab === 'adjust' ? '调整' : '高级'}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-4">
            {activeTab === 'format' && (
              <>
                <div className="settings-card">
                  <h3 className="settings-title">
                    <Icon icon="mdi:file-image" className="size-4" />
                    输出格式
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {availableFormats.map((format) => {
                      const formatIcons: Record<string, string> = {
                        'image/png': 'mdi:file-png-box',
                        'image/jpeg': 'mdi:file-jpg-box',
                        'image/webp': 'mdi:file-image',
                        'image/avif': 'mdi:file-image',
                        'image/bmp': 'mdi:file-image',
                        'image/gif': 'mdi:file-gif-box',
                        'image/svg+xml': 'mdi:svg'
                      };
                      return (
                        <button
                          key={format.value}
                          className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-all ${
                            options.format === format.value
                              ? 'border-primary bg-primary/5'
                              : 'border-muted hover:border-primary/50'
                          }`}
                          onClick={() => setOptions({ ...options, format: format.value })}
                        >
                          <Icon
                            icon={formatIcons[format.value] || 'mdi:file-image'}
                            className={`size-4 ${options.format === format.value ? 'text-primary' : 'text-muted-foreground'}`}
                          />
                          <span className="text-xs font-medium">{format.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {options.format === 'image/avif' && !avifSupported && (
                    <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                      您的浏览器可能不支持 AVIF 格式
                    </p>
                  )}
                </div>

                <div className="settings-card">
                  <h3 className="settings-title">
                    <Icon icon="mdi:tune-variant" className="size-4" />
                    快速预设
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {COMPRESSION_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        className="flex items-center gap-2 rounded-lg border p-3 text-left transition-all hover:border-primary/50 hover:bg-muted/50"
                        onClick={() => applyCompressionPreset(preset)}
                      >
                        <Icon icon={preset.icon} className="size-4 shrink-0 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{preset.label}</p>
                          <p className="text-xs text-muted-foreground">{preset.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {showQuality && (
                  <div className="settings-card">
                    <div className="flex items-center justify-between">
                      <h3 className="settings-title mb-0">
                        <Icon icon="mdi:quality-high" className="size-4" />
                        输出质量
                      </h3>
                      <Badge variant="secondary">{Math.round(options.quality * 100)}%</Badge>
                    </div>
                    <Slider
                      value={[options.quality]}
                      onValueChange={(v) => setOptions({ ...options, quality: Array.isArray(v) ? v[0] : v })}
                      min={0.1}
                      max={1}
                      step={0.05}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>小文件</span>
                      <span>高质量</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'adjust' && (
              <>
                <div className="settings-card">
                  <div className="flex items-center justify-between">
                    <h3 className="settings-title mb-0">
                      <Icon icon="mdi:resize" className="size-4" />
                      尺寸调整
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">锁定比例</span>
                      <Switch
                        checked={options.maintainAspectRatio}
                        onCheckedChange={(v) => setOptions({ ...options, maintainAspectRatio: v })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="width-input" className="mb-1 block text-xs text-muted-foreground">宽度 (px)</label>
                      <Input
                        id="width-input"
                        type="number"
                        value={widthInput}
                        onChange={(e) => setWidthInput(e.target.value)}
                        onBlur={handleWidthChange}
                        placeholder="宽度"
                        min="1"
                      />
                    </div>
                    <div>
                      <label htmlFor="height-input" className="mb-1 block text-xs text-muted-foreground">高度 (px)</label>
                      <Input
                        id="height-input"
                        type="number"
                        value={heightInput}
                        onChange={(e) => setHeightInput(e.target.value)}
                        onBlur={handleHeightChange}
                        placeholder="高度"
                        min="1"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs text-muted-foreground">
                      <Icon icon="mdi:magnify" className="mr-1 inline size-3" />
                      快速缩放
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_SCALES.map((preset) => (
                        <Button
                          key={preset.label}
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1 px-2 text-xs"
                          onClick={() => applyPresetScale(preset.value)}
                          disabled={!sourceImage}
                        >
                          {preset.value < 1 ? (
                            <Icon icon="mdi:image-size-select-small" className="size-3" />
                          ) : preset.value === 1 ? (
                            <Icon icon="mdi:image-size-select-actual" className="size-3" />
                          ) : (
                            <Icon icon="mdi:image-size-select-large" className="size-3" />
                          )}
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <h3 className="settings-title">
                    <Icon icon="mdi:rotate-3d" className="size-4" />
                    旋转/翻转
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rotateImage(-90)}
                      disabled={!sourceImage}
                    >
                      <Icon icon="mdi:rotate-left" className="mr-1 size-4" />
                      左转 90°
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rotateImage(90)}
                      disabled={!sourceImage}
                    >
                      <Icon icon="mdi:rotate-right" className="mr-1 size-4" />
                      右转 90°
                    </Button>
                    <Button
                      variant={options.flipH ? 'default' : 'outline'}
                      size="sm"
                      onClick={toggleFlipH}
                      disabled={!sourceImage}
                    >
                      <Icon icon="mdi:flip-horizontal" className="mr-1 size-4" />
                      水平翻转
                    </Button>
                    <Button
                      variant={options.flipV ? 'default' : 'outline'}
                      size="sm"
                      onClick={toggleFlipV}
                      disabled={!sourceImage}
                    >
                      <Icon icon="mdi:flip-vertical" className="mr-1 size-4" />
                      垂直翻转
                    </Button>
                  </div>
                  {(options.rotation !== 0 || options.flipH || options.flipV) && (
                    <p className="text-xs text-muted-foreground">
                      {options.rotation !== 0 && <>旋转 {options.rotation}°</>}
                      {options.flipH && <> 水平翻转</>}
                      {options.flipV && <> 垂直翻转</>}
                    </p>
                  )}
                </div>
              </>
            )}

            {activeTab === 'advanced' && (
              <>
                <div className="settings-card">
                  <h3 className="settings-title">
                    <Icon icon="mdi:file-edit" className="size-4" />
                    输出文件名
                  </h3>
                  <Input
                    id="custom-filename"
                    type="text"
                    value={options.customFilename || ''}
                    onChange={(e) => setOptions({ ...options, customFilename: e.target.value })}
                    placeholder="留空则使用原文件名"
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    {options.customFilename?.trim() ? (
                      <>将保存为: <span className="font-medium">{options.customFilename.trim()}{options.customFilename.includes('.') ? '' : getFormatExtension(options.format)}</span></>
                    ) : (
                      <>留空将自动使用原文件名</>
                    )}
                  </p>
                </div>

                {(options.format === 'image/jpeg' || options.format === 'image/bmp') && (
                  <div className="settings-card">
                    <h3 className="settings-title">
                      <Icon icon="mdi:palette" className="size-4" />
                      背景颜色
                    </h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={options.backgroundColor || '#ffffff'}
                        onChange={(e) => setOptions({ ...options, backgroundColor: e.target.value })}
                        className="size-9 cursor-pointer rounded border"
                      />
                      <Input
                        id="bg-color-input"
                        type="text"
                        value={options.backgroundColor || '#ffffff'}
                        onChange={(e) => setOptions({ ...options, backgroundColor: e.target.value })}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      透明图片转 JPG/BMP 时的填充颜色
                    </p>
                  </div>
                )}

                <div className="settings-card">
                  <div className="flex items-center justify-between">
                    <h3 className="settings-title mb-0">
                      <Icon icon="mdi:watermark" className="size-4" />
                      水印
                    </h3>
                    <Switch
                      checked={options.watermark.enabled}
                      onCheckedChange={(v) => setOptions({ ...options, watermark: { ...options.watermark, enabled: v } })}
                    />
                  </div>

                  {options.watermark.enabled && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={options.watermark.type === 'text' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setOptions({ ...options, watermark: { ...options.watermark, type: 'text' } })}
                        >
                          <Icon icon="mdi:format-text" className="mr-1 size-4" />
                          文字水印
                        </Button>
                        <Button
                          variant={options.watermark.type === 'image' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setOptions({ ...options, watermark: { ...options.watermark, type: 'image' } })}
                        >
                          <Icon icon="mdi:image" className="mr-1 size-4" />
                          图片水印
                        </Button>
                      </div>

                      {options.watermark.type === 'text' ? (
                        <>
                          <div>
                            <label htmlFor="watermark-text" className="mb-1 block text-xs text-muted-foreground">水印文字</label>
                            <Input
                              id="watermark-text"
                              type="text"
                              value={options.watermark.text}
                              onChange={(e) => setOptions({ ...options, watermark: { ...options.watermark, text: e.target.value } })}
                              placeholder="请输入水印文字"
                              className="w-full"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-xs text-muted-foreground">字体大小</label>
                              <div className="flex items-center gap-2">
                                <Slider
                                  value={[options.watermark.fontSize]}
                                  onValueChange={(v) => setOptions({ ...options, watermark: { ...options.watermark, fontSize: Array.isArray(v) ? v[0] : v } })}
                                  min={12}
                                  max={72}
                                  step={1}
                                />
                                <span className="w-8 text-right text-xs text-muted-foreground">{options.watermark.fontSize}</span>
                              </div>
                            </div>
                            <div>
                              <label className="mb-1 block text-xs text-muted-foreground">颜色</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={options.watermark.color}
                                  onChange={(e) => setOptions({ ...options, watermark: { ...options.watermark, color: e.target.value } })}
                                  className="size-9 cursor-pointer rounded border"
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label htmlFor="watermark-image" className="mb-1 block text-xs text-muted-foreground">水印图片</label>
                            <div className="flex items-center gap-2">
                              {options.watermark.imageUrl && (
                                <img src={options.watermark.imageUrl} alt="水印预览" className="size-10 rounded border object-contain" />
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById('watermark-image-input')?.click()}
                              >
                                <Icon icon="mdi:upload" className="mr-1 size-4" />
                                {options.watermark.imageUrl ? '更换' : '上传'}
                              </Button>
                              {options.watermark.imageUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (options.watermark.imageUrl) URL.revokeObjectURL(options.watermark.imageUrl);
                                    setOptions({ ...options, watermark: { ...options.watermark, imageUrl: undefined, imageFile: undefined } });
                                  }}
                                >
                                  <Icon icon="mdi:close" className="size-4" />
                                </Button>
                              )}
                            </div>
                            <input
                              id="watermark-image-input"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  if (options.watermark.imageUrl) URL.revokeObjectURL(options.watermark.imageUrl);
                                  setOptions({
                                    ...options,
                                    watermark: {
                                      ...options.watermark,
                                      imageFile: file,
                                      imageUrl: URL.createObjectURL(file)
                                    }
                                  });
                                }
                              }}
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs text-muted-foreground">水印大小</label>
                            <div className="flex items-center gap-2">
                              <Slider
                                value={[options.watermark.imageSize]}
                                onValueChange={(v) => setOptions({ ...options, watermark: { ...options.watermark, imageSize: Array.isArray(v) ? v[0] : v } })}
                                min={20}
                                max={300}
                                step={5}
                              />
                              <span className="w-10 text-right text-xs text-muted-foreground">{options.watermark.imageSize}px</span>
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
                              variant={options.watermark.position === pos.value ? 'default' : 'outline'}
                              size="sm"
                              className="text-xs"
                              onClick={() => setOptions({ ...options, watermark: { ...options.watermark, position: pos.value } })}
                            >
                              {pos.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">透明度</span>
                          <span className="text-xs text-muted-foreground">{Math.round(options.watermark.opacity * 100)}%</span>
                        </div>
                        <Slider
                          value={[options.watermark.opacity]}
                          onValueChange={(v) => setOptions({ ...options, watermark: { ...options.watermark, opacity: Array.isArray(v) ? v[0] : v } })}
                          min={0.05}
                          max={1}
                          step={0.05}
                        />
                      </div>

                      {options.watermark.type === 'text' && (
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">旋转角度</span>
                            <span className="text-xs text-muted-foreground">{options.watermark.rotation}°</span>
                          </div>
                          <Slider
                            value={[options.watermark.rotation]}
                            onValueChange={(v) => setOptions({ ...options, watermark: { ...options.watermark, rotation: Array.isArray(v) ? v[0] : v } })}
                            min={-180}
                            max={180}
                            step={5}
                          />
                        </div>
                      )}

                      {options.watermark.position === 'tile' && (
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">平铺间距</span>
                            <span className="text-xs text-muted-foreground">{options.watermark.tileSpacing}px</span>
                          </div>
                          <Slider
                            value={[options.watermark.tileSpacing]}
                            onValueChange={(v) => setOptions({ ...options, watermark: { ...options.watermark, tileSpacing: Array.isArray(v) ? v[0] : v } })}
                            min={50}
                            max={300}
                            step={10}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleReset}
                >
                  <Icon icon="mdi:refresh" className="mr-2 size-4" />
                  重置所有设置
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .convert-layout {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .convert-title-col {
          display: block;
        }
        .convert-preview-col {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
          min-width: 0;
        }
        .convert-settings-col {
          display: flex;
          flex-direction: column;
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
          .convert-layout {
            display: grid;
            grid-template-columns: 1fr 420px;
            grid-template-rows: auto 1fr;
            gap: 1.5rem;
            align-items: start;
          }
          .convert-title-col {
            grid-column: 1;
            grid-row: 1;
          }
          .convert-preview-col {
            grid-column: 1;
            grid-row: 2;
            position: sticky;
            top: 1.5rem;
          }
          .convert-settings-col {
            grid-column: 2;
            grid-row: 1 / -1;
            max-height: calc(100vh - 3rem);
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: var(--muted-foreground) transparent;
            scrollbar-gutter: stable;
          }
          .convert-settings-col::-webkit-scrollbar {
            width: 6px;
          }
          .convert-settings-col::-webkit-scrollbar-track {
            background: transparent;
          }
          .convert-settings-col::-webkit-scrollbar-thumb {
            background-color: var(--muted-foreground);
            border-radius: 3px;
            min-height: 30px;
          }
        }

        @media (min-width: 1280px) {
          .convert-layout {
            grid-template-columns: 1fr 460px;
          }
        }
      `}</style>
    </div>
  );
}
