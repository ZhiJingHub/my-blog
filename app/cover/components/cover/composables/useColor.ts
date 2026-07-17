'use client';

import { useState, useCallback } from 'react';

export function useColor() {
  const [color, setColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [bgColorOpacity, setBgColorOpacity] = useState(1);
  const [linkColor, setLinkColor] = useState(true);

  const handleColorChange = useCallback(
    (newColor: string, type: 'text' | 'icon'): { color: string; iconColor: string } => {
      if (type === 'text') {
        setColor(newColor);
        return { color: newColor, iconColor: linkColor ? newColor : '' };
      } else {
        return { color: linkColor ? newColor : '', iconColor: newColor };
      }
    },
    [linkColor]
  );

  return {
    color,
    setColor,
    bgColor,
    setBgColor,
    bgColorOpacity,
    setBgColorOpacity,
    linkColor,
    setLinkColor,
    handleColorChange
  };
}
