'use client';

import { useState, useCallback } from 'react';

export function useText() {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [fontWeight, setFontWeight] = useState(400);
  const [fontSize, setFontSize] = useState(64);
  const [gap, setGap] = useState(20);
  const [linkScale, setLinkScale] = useState(true);
  const [lastFontSize, setLastFontSize] = useState(64);
  const [lastIconSize, setLastIconSize] = useState(64);

  const handleFontSizeChange = useCallback(
    (value: number, iconSize: number): { fontSize: number; iconSize: number } => {
      let newIconSize = iconSize;
      if (linkScale) {
        const ratio = value / lastFontSize;
        newIconSize = Math.round(iconSize * ratio);
        setLastIconSize(newIconSize);
      }
      setFontSize(value);
      setLastFontSize(value);
      return { fontSize: value, iconSize: newIconSize };
    },
    [linkScale, lastFontSize]
  );

  const handleIconSizeChange = useCallback(
    (value: number, currentFontSize: number): { fontSize: number; iconSize: number } => {
      let newFontSize = currentFontSize;
      if (linkScale) {
        const ratio = value / lastIconSize;
        newFontSize = Math.round(currentFontSize * ratio);
        setLastFontSize(newFontSize);
      }
      setFontSize(newFontSize);
      setLastIconSize(value);
      return { fontSize: newFontSize, iconSize: value };
    },
    [linkScale, lastIconSize]
  );

  return {
    leftText,
    setLeftText,
    rightText,
    setRightText,
    fontWeight,
    setFontWeight,
    fontSize,
    setFontSize,
    gap,
    setGap,
    linkScale,
    setLinkScale,
    lastFontSize,
    lastIconSize,
    handleFontSizeChange,
    handleIconSizeChange
  };
}
