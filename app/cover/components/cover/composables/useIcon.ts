'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function useIcon() {
  const [iconName, setIconName] = useState('');
  const [iconSize, setIconSize] = useState(64);
  const [iconSvg, setIconSvg] = useState('');
  const [localIcon, setLocalIcon] = useState<string | null>(null);
  const [showIcon, setShowIcon] = useState(false);
  const [iconColor, setIconColor] = useState('#000000');
  const [useOriginalIconColor, setUseOriginalIconColor] = useState(true);
  const [iconRadius, setIconRadius] = useState(0);

  const iconFetchController = useRef<AbortController | null>(null);

  useEffect(() => {
    const currentIconName = iconName;
    const currentUseOriginal = useOriginalIconColor;

    if (currentIconName?.includes(':')) {
      if (iconFetchController.current) iconFetchController.current.abort();
      iconFetchController.current = new AbortController();

      const [prefix, name] = currentIconName.split(':');
      fetch(`https://api.iconify.design/${prefix}/${name}.svg`, {
        signal: iconFetchController.current.signal
      })
        .then((res) => {
          if (!res.ok) throw new Error('Icon not found');
          return res.text();
        })
        .then((svg) => {
          let processedSvg = svg
            .replace(/(<svg[^>]*>)\s*/, '$1')
            .replace(/<svg\s([^>]*?)\s+width="[^"]*"/g, '<svg $1')
            .replace(/<svg\s([^>]*?)\s+height="[^"]*"/g, '<svg $1');
          processedSvg = processedSvg.replace(
            /<svg\b([^>]*)>/,
            '<svg$1 width="100%" height="100%" preserveAspectRatio="xMidYMid meet">'
          );
          if (!currentUseOriginal) {
            processedSvg = processedSvg.replace(/fill="[^"]*"/g, 'fill="currentColor"');
          }
          setIconSvg(processedSvg);
        })
        .catch((e) => {
          if (e.name !== 'AbortError') setIconSvg('');
        });
    } else {
      setIconSvg('');
    }

    return () => {
      if (iconFetchController.current) iconFetchController.current.abort();
    };
  }, [iconName, useOriginalIconColor]);

  const handleLocalIconUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (localIcon?.startsWith('blob:')) URL.revokeObjectURL(localIcon);
    const url = URL.createObjectURL(file);
    setLocalIcon(url);
    setIconName('本地图片');
    setIconSvg('');
  }, [localIcon]);

  const selectIcon = useCallback(
    (icon: string) => {
      if (localIcon?.startsWith('blob:')) URL.revokeObjectURL(localIcon);
      setIconName(icon);
      setLocalIcon(null);
    },
    [localIcon]
  );

  const dispose = useCallback(() => {
    if (iconFetchController.current) iconFetchController.current.abort();
    if (localIcon?.startsWith('blob:')) URL.revokeObjectURL(localIcon);
  }, [localIcon]);

  useEffect(() => {
    return () => dispose();
  }, [dispose]);

  return {
    iconName,
    setIconName,
    iconSize,
    setIconSize,
    iconSvg,
    localIcon,
    setLocalIcon,
    showIcon,
    setShowIcon,
    iconColor,
    setIconColor,
    useOriginalIconColor,
    setUseOriginalIconColor,
    iconRadius,
    setIconRadius,
    handleLocalIconUpload,
    selectIcon,
    dispose
  };
}
