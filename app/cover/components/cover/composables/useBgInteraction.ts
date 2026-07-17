'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export function useBgInteraction() {
  const [bgImage, setBgImageState] = useState<string | null>(null);
  const [bgImageX, setBgImageX] = useState(0);
  const [bgImageY, setBgImageY] = useState(0);
  const [bgImageScale, setBgImageScale] = useState(1);
  const [bgBlur, setBgBlur] = useState(0);
  const [bgOpacity, setBgOpacity] = useState(1);
  const [isBgDragOver, setIsBgDragOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const initialImageX = useRef(0);
  const initialImageY = useRef(0);
  const activePointers = useRef(new Map<number, { x: number; y: number }>());
  const initialPinchDistance = useRef(0);
  const initialScale = useRef(1);

  const setBgImage = useCallback((v: string | null) => {
    setBgImageState((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return v;
    });
  }, []);

  const loadBgImageFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      if (bgImage?.startsWith('blob:')) URL.revokeObjectURL(bgImage);
      const url = URL.createObjectURL(file);
      setBgImage(url);
      setBgImageX(0);
      setBgImageY(0);
      setBgImageScale(1);
      setBgBlur(0);
      setBgOpacity(1);
    },
    [bgImage, setBgImage]
  );

  const handleBgImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) loadBgImageFile(file);
    },
    [loadBgImageFile]
  );

  const handleBgDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsBgDragOver(true);
  }, []);

  const handleBgDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsBgDragOver(false);
  }, []);

  const handleBgDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsBgDragOver(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) loadBgImageFile(file);
    },
    [loadBgImageFile]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!bgImage) return;
      e.preventDefault();
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointers.current.size === 1) {
        setIsDragging(true);
        dragStartX.current = e.clientX;
        dragStartY.current = e.clientY;
        initialImageX.current = bgImageX;
        initialImageY.current = bgImageY;
      } else if (activePointers.current.size === 2) {
        setIsDragging(false);
        const points = Array.from(activePointers.current.values());
        initialPinchDistance.current = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
        initialScale.current = bgImageScale;
      }
    },
    [bgImage, bgImageX, bgImageY, bgImageScale]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!bgImage || !activePointers.current.has(e.pointerId)) return;
      e.preventDefault();
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointers.current.size === 2) {
        const points = Array.from(activePointers.current.values());
        const currentDistance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
        if (initialPinchDistance.current > 0) {
          const scaleFactor = currentDistance / initialPinchDistance.current;
          setBgImageScale(Math.max(0.1, Math.min(initialScale.current * scaleFactor, 10)));
        }
      } else if (activePointers.current.size === 1 && isDragging) {
        const deltaX = e.clientX - dragStartX.current;
        const deltaY = e.clientY - dragStartY.current;
        setBgImageX(initialImageX.current + deltaX / bgImageScale);
        setBgImageY(initialImageY.current + deltaY / bgImageScale);
      }
    },
    [bgImage, isDragging, bgImageScale]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    activePointers.current.delete(e.pointerId);
    (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    if (activePointers.current.size < 2) initialPinchDistance.current = 0;
    if (activePointers.current.size === 0) setIsDragging(false);
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!bgImage) return;
      e.preventDefault();
      const scaleFactor = 1.1;
      if (e.deltaY < 0) {
        setBgImageScale((prev) => Math.min(prev * scaleFactor, 10));
      } else {
        setBgImageScale((prev) => Math.max(prev / scaleFactor, 0.1));
      }
    },
    [bgImage]
  );

  useEffect(() => {
    return () => {
      if (bgImage?.startsWith('blob:')) URL.revokeObjectURL(bgImage);
    };
  }, [bgImage]);

  return {
    bgImage,
    setBgImage,
    bgImageX,
    bgImageY,
    bgImageScale,
    bgBlur,
    setBgBlur,
    bgOpacity,
    setBgOpacity,
    isBgDragOver,
    isDragging,
    handleBgImageUpload,
    handleBgDragOver,
    handleBgDragLeave,
    handleBgDrop,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel
  };
}
