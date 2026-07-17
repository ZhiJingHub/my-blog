'use client';

import { useState, useRef, useMemo } from 'react';
import CoverPreview from './cover/CoverPreview';
import TextSettings from './cover/TextSettings';
import IconSettings from './cover/IconSettings';
import BackgroundSettings from './cover/BackgroundSettings';
import SizeSettings from './cover/SizeSettings';
import ColorSettings from './cover/ColorSettings';
import IconBackgroundSettings from './cover/IconBackgroundSettings';
import ShadowSettings from './cover/ShadowSettings';
import ExportSettings from './cover/ExportSettings';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { useIconSearch } from './cover/composables/useIconSearch';
import { useBgInteraction } from './cover/composables/useBgInteraction';
import { useFontManager } from './cover/composables/useFontManager';
import { useExport } from './cover/composables/useExport';
import { useIcon } from './cover/composables/useIcon';
import { useText } from './cover/composables/useText';
import { useColor } from './cover/composables/useColor';
import { useShadow } from './cover/composables/useShadow';

export default function CoverGenerator() {
  const iconSearch = useIconSearch();
  const bgInteraction = useBgInteraction();
  const fontManager = useFontManager();
  const icon = useIcon();
  const text = useText();
  const colorState = useColor();
  const shadow = useShadow();

  const [iconBgEnabled, setIconBgEnabled] = useState(false);
  const [iconBgRadius, setIconBgRadius] = useState(20);
  const [iconBgColor, setIconBgColor] = useState('#000000');
  const [iconBgOpacity, setIconBgOpacity] = useState(0.2);
  const [iconBgBlur, setIconBgBlur] = useState(0);
  const [iconBgPadding, setIconBgPadding] = useState(10);

  const [ratios, setRatios] = useState([
    { label: '1:1', w: 1, h: 1, checked: false },
    { label: '4:3', w: 4, h: 3, checked: false },
    { label: '16:9', w: 16, h: 9, checked: true },
    { label: '21:9', w: 21, h: 9, checked: false }
  ]);

  const [exportConfig, setExportConfig] = useState({
    format: 'png' as 'png' | 'svg',
    scales: [1] as number[],
    filename: 'cover',
    transparentBg: false,
    exportRatios: [] as string[]
  });

  const svgContainerRef = useRef<SVGSVGElement>(null);

  const BASE_HEIGHT = 600;
  const activeRatios = useMemo(() => ratios.filter((r) => r.checked), [ratios]);
  const visualRatios = useMemo(() => (activeRatios.length > 0 ? activeRatios : [ratios[2]]), [activeRatios, ratios]);
  const maxWidthRatio = useMemo(
    () => visualRatios.reduce((max, r) => (r.w / r.h > max ? r.w / r.h : max), 0),
    [visualRatios]
  );
  const canvasWidth = Math.round(BASE_HEIGHT * maxWidthRatio);
  const canvasHeight = BASE_HEIGHT;

  const exporter = useExport({
    getSvgContainer: () => svgContainerRef.current,
    getCanvasWidth: () => canvasWidth,
    getCanvasHeight: () => canvasHeight,
    getExportConfig: () => exportConfig,
    getActiveRatios: () => activeRatios,
    getBgImage: () => bgInteraction.bgImage,
    getLocalIcon: () => icon.localIcon,
    getCustomFontName: () => fontManager.customFontName,
    getFontDataBase64: () => fontManager.getFontDataBase64()
  });

  function handleColorChange(newColor: string, type: 'text' | 'icon') {
    if (type === 'text') {
      colorState.setColor(newColor);
      if (colorState.linkColor) icon.setIconColor(newColor);
    } else {
      icon.setIconColor(newColor);
      if (colorState.linkColor) colorState.setColor(newColor);
    }
  }

  function handleFontSizeChange(value: number) {
    const result = text.handleFontSizeChange(value, icon.iconSize);
    icon.setIconSize(result.iconSize);
  }

  function handleIconSizeChange(value: number) {
    const result = text.handleIconSizeChange(value, text.fontSize);
    text.setFontSize(result.fontSize);
    icon.setIconSize(value);
  }

  const [activeTab, setActiveTab] = useState('text');

  return (
    <div className="cover-layout">
      <div className="cover-title-col">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">封面制作</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          在线封面图制作工具，支持自定义文本、图标、背景，导出 PNG / SVG 格式
        </p>
      </div>
      <div className="cover-preview-col">
        <CoverPreview
          svgRef={svgContainerRef}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          visualRatios={visualRatios}
          bgImage={bgInteraction.bgImage}
          bgImageX={bgInteraction.bgImageX}
          bgImageY={bgInteraction.bgImageY}
          bgImageScale={bgInteraction.bgImageScale}
          bgBlur={bgInteraction.bgBlur}
          bgOpacity={bgInteraction.bgOpacity}
          bgColor={colorState.bgColor}
          bgColorOpacity={colorState.bgColorOpacity}
          leftText={text.leftText}
          rightText={text.rightText}
          fontSize={text.fontSize}
          fontWeight={text.fontWeight}
          customFontName={fontManager.customFontName}
          color={colorState.color}
          textShadow={shadow.textShadow}
          gap={text.gap}
          showIcon={icon.showIcon}
          iconSvg={icon.iconSvg}
          localIcon={icon.localIcon}
          iconSize={icon.iconSize}
          iconBgPadding={iconBgPadding}
          iconBgEnabled={iconBgEnabled}
          iconBgColor={iconBgColor}
          iconBgOpacity={iconBgOpacity}
          iconBgBlur={iconBgBlur}
          iconBgRadius={iconBgRadius}
          useOriginalIconColor={icon.useOriginalIconColor}
          iconColor={icon.iconColor}
          iconShadow={shadow.iconShadow}
          iconRadius={icon.iconRadius}
          isDragging={bgInteraction.isDragging}
          onPointerDown={bgInteraction.handlePointerDown}
          onPointerMove={bgInteraction.handlePointerMove}
          onPointerUp={bgInteraction.handlePointerUp}
          onWheel={bgInteraction.handleWheel}
        />
        <div className="rounded-xl border border-border bg-card p-4">
          <Button
            onClick={exporter.doExport}
            disabled={activeRatios.length === 0 || exporter.isExporting}
            className="w-full"
            size="lg"
          >
            <Icon icon={exporter.isExporting ? 'mdi:loading' : 'mdi:download'} className="mr-2 h-5 w-5" />
            {exporter.isExporting ? '导出中...' : '导出图片'}
          </Button>
          {exporter.exportStatus && (
            <p
              className={`mt-3 text-center text-sm ${
                exporter.exportStatus.type === 'error' ? 'text-red-500' : 'text-green-600'
              }`}
            >
              {exporter.exportStatus.message}
            </p>
          )}
        </div>
      </div>

      <div className="cover-settings-col">
        <div className="w-full">
          <div className="flex w-full gap-2 border-b">
            {[
              { id: 'text', icon: 'mdi:format-text', label: '文本' },
              { id: 'icon', icon: 'mdi:image-outline', label: '图标' },
              { id: 'background', icon: 'mdi:image-area', label: '背景' },
              { id: 'style', icon: 'mdi:palette-outline', label: '样式' },
              { id: 'export', icon: 'mdi:cog-outline', label: '导出' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-3 py-2 text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-primary font-medium text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon icon={tab.icon} className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3 pt-3">
            {activeTab === 'text' && (
              <>
                <TextSettings
                  leftText={text.leftText}
                  setLeftText={text.setLeftText}
                  rightText={text.rightText}
                  setRightText={text.setRightText}
                  fontWeight={text.fontWeight}
                  setFontWeight={text.setFontWeight}
                  customFontName={fontManager.customFontName}
                  onFontUpload={fontManager.handleFontUpload}
                  onRemoveFont={fontManager.removeFont}
                  onSystemFontSelect={fontManager.handleSystemFontSelect}
                />
                <SizeSettings
                  fontSize={text.fontSize}
                  iconSize={icon.iconSize}
                  iconRadius={icon.iconRadius}
                  gap={text.gap}
                  linkScale={text.linkScale}
                  setFontSize={text.setFontSize}
                  setIconSize={icon.setIconSize}
                  setIconRadius={icon.setIconRadius}
                  setGap={text.setGap}
                  setLinkScale={text.setLinkScale}
                  onFontSizeChange={handleFontSizeChange}
                  onIconSizeChange={handleIconSizeChange}
                />
              </>
            )}

            {activeTab === 'icon' && (
              <>
                <IconSettings
                  showIcon={icon.showIcon}
                  setShowIcon={icon.setShowIcon}
                  localIcon={icon.localIcon}
                  searchQuery={iconSearch.searchQuery}
                  searchResults={iconSearch.searchResults}
                  iconName={icon.iconName}
                  onLocalIconUpload={icon.handleLocalIconUpload}
                  onSearchInput={iconSearch.onSearchInput}
                  onSelectIcon={icon.selectIcon}
                />
                <IconBackgroundSettings
                  iconBgEnabled={iconBgEnabled}
                  setIconBgEnabled={setIconBgEnabled}
                  iconBgColor={iconBgColor}
                  setIconBgColor={setIconBgColor}
                  iconBgPadding={iconBgPadding}
                  setIconBgPadding={setIconBgPadding}
                  iconBgRadius={iconBgRadius}
                  setIconBgRadius={setIconBgRadius}
                  iconBgBlur={iconBgBlur}
                  setIconBgBlur={setIconBgBlur}
                  iconBgOpacity={iconBgOpacity}
                  setIconBgOpacity={setIconBgOpacity}
                />
              </>
            )}

            {activeTab === 'background' && (
              <>
                <BackgroundSettings
                  bgImage={bgInteraction.bgImage}
                  bgBlur={bgInteraction.bgBlur}
                  bgOpacity={bgInteraction.bgOpacity}
                  isBgDragOver={bgInteraction.isBgDragOver}
                  onBgImageUpload={bgInteraction.handleBgImageUpload}
                  onBgImageRemove={() => {
                    bgInteraction.setBgImage(null);
                    bgInteraction.setBgBlur(0);
                    bgInteraction.setBgOpacity(1);
                  }}
                  onBgBlurChange={bgInteraction.setBgBlur}
                  onBgOpacityChange={bgInteraction.setBgOpacity}
                  onBgDragOver={bgInteraction.handleBgDragOver}
                  onBgDragLeave={bgInteraction.handleBgDragLeave}
                  onBgDrop={bgInteraction.handleBgDrop}
                />
                <ColorSettings
                  color={colorState.color}
                  iconColor={icon.iconColor}
                  bgColor={colorState.bgColor}
                  bgColorOpacity={colorState.bgColorOpacity}
                  linkColor={colorState.linkColor}
                  useOriginalIconColor={icon.useOriginalIconColor}
                  setColor={colorState.setColor}
                  setIconColor={icon.setIconColor}
                  setBgColor={colorState.setBgColor}
                  setBgColorOpacity={colorState.setBgColorOpacity}
                  setLinkColor={colorState.setLinkColor}
                  setUseOriginalIconColor={icon.setUseOriginalIconColor}
                  onColorChange={handleColorChange}
                />
              </>
            )}

            {activeTab === 'style' && (
              <ShadowSettings
                shadowTarget={shadow.shadowTarget}
                setShadowTarget={shadow.setShadowTarget}
                textShadow={shadow.textShadow}
                iconShadow={shadow.iconShadow}
                onUpdateShadow={shadow.updateShadow}
              />
            )}

            {activeTab === 'export' && (
              <ExportSettings
                ratios={ratios}
                setRatios={setRatios}
                exportConfig={exportConfig}
                setExportConfig={setExportConfig}
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                activeRatios={activeRatios}
              />
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .cover-layout {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .cover-title-col {
          display: block;
        }
        .cover-preview-col {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
          min-width: 0;
        }
        .cover-settings-col {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
          min-width: 0;
          position: relative;
        }

        @media (min-width: 1024px) {
          .cover-layout {
            display: grid;
            grid-template-columns: 1fr 400px;
            grid-template-rows: auto 1fr;
            gap: 1.5rem;
            align-items: start;
          }
          .cover-title-col {
            grid-column: 1;
            grid-row: 1;
          }
          .cover-preview-col {
            grid-column: 1;
            grid-row: 2;
            position: sticky;
            top: 1.5rem;
          }
          .cover-settings-col {
            grid-column: 2;
            grid-row: 1 / -1;
            max-height: calc(100vh - 3rem);
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: var(--muted-foreground) transparent;
            scrollbar-gutter: stable;
          }
          .cover-settings-col::-webkit-scrollbar {
            width: 6px;
          }
          .cover-settings-col::-webkit-scrollbar-track {
            background: transparent;
          }
          .cover-settings-col::-webkit-scrollbar-thumb {
            background-color: var(--muted-foreground);
            border-radius: 3px;
            min-height: 30px;
          }
        }

        @media (min-width: 1280px) {
          .cover-layout {
            grid-template-columns: 1fr 460px;
          }
        }
      `}</style>
    </div>
  );
}
