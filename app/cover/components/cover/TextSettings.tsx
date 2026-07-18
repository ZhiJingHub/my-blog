'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';

interface FontData {
  family: string;
  fullName: string;
  postscriptName: string;
  style: string;
}

interface WindowWithLocalFonts extends Window {
  queryLocalFonts(): Promise<FontData[]>;
}

type TextSettingsProps = {
  leftText: string;
  setLeftText: (v: string) => void;
  rightText: string;
  setRightText: (v: string) => void;
  fontWeight: number;
  setFontWeight: (v: number) => void;
  customFontName: string;
  onFontUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFont: () => void;
  onSystemFontSelect: (fontName: string) => void;
};

export default function TextSettings({
  leftText,
  setLeftText,
  rightText,
  setRightText,
  fontWeight,
  setFontWeight,
  customFontName,
  onFontUpload,
  onRemoveFont,
  onSystemFontSelect
}: TextSettingsProps) {
  const [systemFonts, setSystemFonts] = useState<string[]>([]);
  const [fontSearchQuery, setFontSearchQuery] = useState('');
  const [isLoadingFonts, setIsLoadingFonts] = useState(false);
  const [fontApiSupported, setFontApiSupported] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const FONTS_PER_PAGE = 20;

  const filteredFonts = systemFonts.filter((font) => font.toLowerCase().includes(fontSearchQuery.toLowerCase()));
  const totalPages = Math.ceil(filteredFonts.length / FONTS_PER_PAGE);
  const paginatedFonts = filteredFonts.slice((currentPage - 1) * FONTS_PER_PAGE, currentPage * FONTS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [fontSearchQuery]);

  useEffect(() => {
    if ('queryLocalFonts' in window) setFontApiSupported(true);
  }, []);

  async function loadSystemFonts() {
    if (!('queryLocalFonts' in window)) {
      setFontApiSupported(false);
      return;
    }
    setFontApiSupported(true);
    setIsLoadingFonts(true);
    try {
      const fonts = await (window as unknown as WindowWithLocalFonts).queryLocalFonts();
      const fontNames = new Set<string>();
      fonts.forEach((font: FontData) => fontNames.add(font.family));
      setSystemFonts(Array.from(fontNames).sort());
    } catch (error) {
      console.error('获取系统字体失败:', error);
    } finally {
      setIsLoadingFonts(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>文本设置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="left-text">左侧文字</Label>
          <Input id="left-text" value={leftText} onChange={(e) => setLeftText(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="right-text">右侧文字</Label>
          <Input id="right-text" value={rightText} onChange={(e) => setRightText(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>字体粗细: {fontWeight}</Label>
          <Slider
            value={[fontWeight]}
            onValueChange={(v) => setFontWeight(Array.isArray(v) ? v[0] : v)}
            min={100}
            max={900}
            step={100}
          />
        </div>
        <div className="space-y-4 border-t pt-4">
          <Label>自定义字体</Label>
          <div>
            <input type="file" accept=".ttf,.otf,.woff,.woff2" onChange={onFontUpload} className="hidden" id="font-upload" />
            <Label
              htmlFor="font-upload"
              className="flex h-16 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed hover:border-primary"
            >
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <Icon icon="mdi:font-download" className="h-5 w-5" />
                <span className="text-xs">{customFontName || '点击上传字体'}</span>
              </div>
            </Label>
            {customFontName && (
              <Button variant="outline" size="sm" className="mt-2" onClick={onRemoveFont}>
                移除字体
              </Button>
            )}
          </div>
          {fontApiSupported ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>系统字体</Label>
                {systemFonts.length === 0 && (
                  <Button variant="outline" size="sm" onClick={loadSystemFonts} disabled={isLoadingFonts}>
                    {isLoadingFonts ? (
                      <>
                        <Icon icon="mdi:loading" className="mr-2 h-4 w-4 animate-spin" />
                        加载中...
                      </>
                    ) : (
                      <>
                        <Icon icon="mdi:folder-open" className="mr-2 h-4 w-4" />
                        获取系统字体
                      </>
                    )}
                  </Button>
                )}
              </div>
              {systemFonts.length > 0 && (
                <>
                  <Input
                    value={fontSearchQuery}
                    onChange={(e) => setFontSearchQuery(e.target.value)}
                    placeholder="搜索字体..."
                    className="h-9"
                  />
                  <div className="max-h-48 overflow-y-auto rounded-lg border">
                    <div className="divide-y">
                      {paginatedFonts.map((font) => (
                        <button
                          key={font}
                          onClick={() => onSystemFontSelect(font)}
                          className={`w-full px-3 py-2 text-left transition-colors hover:bg-accent ${
                            customFontName === font ? 'bg-primary/10 font-medium' : ''
                          }`}
                          style={{ fontFamily: `'${font}', sans-serif` }}
                        >
                          {font}
                        </button>
                      ))}
                    </div>
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        第 {currentPage} / {totalPages} 页，共 {filteredFonts.length} 个字体
                      </span>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                          <Icon icon="mdi:chevron-double-left" className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                          <Icon icon="mdi:chevron-left" className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                          <Icon icon="mdi:chevron-right" className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                          <Icon icon="mdi:chevron-double-right" className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">您的浏览器不支持本地字体访问 API</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
