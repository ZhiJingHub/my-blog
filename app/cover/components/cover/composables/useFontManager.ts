'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export function useFontManager() {
  const [customFont, setCustomFont] = useState<string | null>(null);
  const [customFontName, setCustomFontName] = useState('');
  const fontFile = useRef<File | null>(null);

  const getFontDataBase64 = useCallback((): Promise<string | null> => {
    if (!fontFile.current) return Promise.resolve(null);
    const file = fontFile.current;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFontUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (customFont) URL.revokeObjectURL(customFont);
    const fontName = file.name.replace(/\.[^/.]+$/, '');
    setCustomFontName(fontName);
    const fontUrl = URL.createObjectURL(file);
    setCustomFont(fontUrl);
    fontFile.current = file;
    const fontFace = new FontFace(fontName, `url(${fontUrl})`);
    fontFace
      .load()
      .then((loadedFace) => {
        document.fonts.add(loadedFace);
      })
      .catch((e) => {
        console.warn('[FontManager] Failed to load font:', e);
      });
  }, [customFont]);

  const handleSystemFontSelect = useCallback((fontName: string) => {
    setCustomFontName(fontName);
    setCustomFont(null);
    fontFile.current = null;
  }, []);

  const removeFont = useCallback(() => {
    if (customFont) URL.revokeObjectURL(customFont);
    setCustomFont(null);
    setCustomFontName('');
    fontFile.current = null;
  }, [customFont]);

  useEffect(() => {
    return () => {
      if (customFont) URL.revokeObjectURL(customFont);
    };
  }, [customFont]);

  return {
    customFont,
    customFontName,
    getFontDataBase64,
    handleFontUpload,
    handleSystemFontSelect,
    removeFont
  };
}
