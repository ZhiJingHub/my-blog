'use client';

import { hexToRgba } from '@/lib/utils/color';

type Ratio = { label: string; w: number; h: number; checked: boolean };

type CoverPreviewProps = {
  canvasWidth: number;
  canvasHeight: number;
  visualRatios: Ratio[];
  bgImage: string | null;
  bgImageX: number;
  bgImageY: number;
  bgImageScale: number;
  bgBlur: number;
  bgOpacity: number;
  bgColor: string;
  bgColorOpacity: number;
  leftText: string;
  rightText: string;
  fontSize: number;
  fontWeight: number;
  customFontName: string;
  color: string;
  textShadow: { x: number; y: number; blur: number; color: string; alpha: number };
  gap: number;
  showIcon: boolean;
  iconSvg: string;
  localIcon: string | null;
  iconSize: number;
  iconBgPadding: number;
  iconBgEnabled: boolean;
  iconBgColor: string;
  iconBgOpacity: number;
  iconBgBlur: number;
  iconBgRadius: number;
  useOriginalIconColor: boolean;
  iconColor: string;
  iconShadow: { x: number; y: number; blur: number; color: string; alpha: number };
  iconRadius: number;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onWheel: (e: React.WheelEvent) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
};

const BASE_HEIGHT = 600;

export default function CoverPreview({
  canvasWidth,
  canvasHeight,
  visualRatios,
  bgImage,
  bgImageX,
  bgImageY,
  bgImageScale,
  bgBlur,
  bgOpacity,
  bgColor,
  bgColorOpacity,
  leftText,
  rightText,
  fontSize,
  fontWeight,
  customFontName,
  color,
  textShadow,
  gap,
  showIcon,
  iconSvg,
  localIcon,
  iconSize,
  iconBgPadding,
  iconBgEnabled,
  iconBgColor,
  iconBgOpacity,
  iconBgBlur,
  iconBgRadius,
  useOriginalIconColor,
  iconColor,
  iconShadow,
  iconRadius,
  isDragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel,
  svgRef
}: CoverPreviewProps) {
  return (
    <div
      className="preview-area touch-none select-none"
      role="img"
      aria-label="封面预览区域"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        className="preview-svg"
        style={{
          cursor: bgImage ? (isDragging ? 'grabbing' : 'grab') : 'default',
          aspectRatio: `${canvasWidth}/${canvasHeight}`
        }}
        onWheel={onWheel}
      >
        <rect className="bg-fill" width="100%" height="100%" fill={hexToRgba(bgColor, bgColorOpacity)} />

        {bgImage && (
          <image
            href={bgImage}
            x={bgImageX}
            y={bgImageY}
            width={canvasWidth}
            height={canvasHeight}
            transform={`translate(${canvasWidth / 2}, ${canvasHeight / 2}) scale(${bgImageScale}) translate(${-canvasWidth / 2}, ${-canvasHeight / 2})`}
            style={{ filter: `blur(${bgBlur}px)`, opacity: bgOpacity }}
            preserveAspectRatio="xMidYMid meet"
          />
        )}

        <foreignObject x="0" y="0" width={canvasWidth} height={canvasHeight} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: `${gap}px`,
              fontFamily: customFontName || 'sans-serif',
              fontWeight: fontWeight
            }}
          >
            {!leftText && !rightText && !(showIcon && (iconSvg || localIcon)) && (
              <span style={{ fontSize: '24px', color: 'rgba(128,128,128,0.5)', userSelect: 'none' }}>
                在右侧输入文字开始制作
              </span>
            )}

            <span
              style={{
                fontSize: `${fontSize}px`,
                color: color,
                textShadow: `${textShadow.x}px ${textShadow.y}px ${textShadow.blur}px ${hexToRgba(
                  textShadow.color,
                  textShadow.alpha
                )}`,
                lineHeight: 1,
                whiteSpace: 'nowrap'
              }}
            >
              {leftText}
            </span>

            {showIcon && (iconSvg || localIcon) && (
              <div
                style={{
                  width: `${iconSize + iconBgPadding * 2}px`,
                  height: `${iconSize + iconBgPadding * 2}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: iconBgEnabled ? hexToRgba(iconBgColor, iconBgOpacity) : 'transparent',
                  backdropFilter: iconBgEnabled && iconBgBlur > 0 ? `blur(${iconBgBlur}px)` : 'none',
                  WebkitBackdropFilter: iconBgEnabled && iconBgBlur > 0 ? `blur(${iconBgBlur}px)` : 'none',
                  borderRadius: iconBgEnabled ? `${iconBgRadius}%` : '0'
                }}
              >
                <div
                  style={{
                    maxWidth: `${iconSize}px`,
                    maxHeight: `${iconSize}px`,
                    flexShrink: 0,
                    color: useOriginalIconColor ? 'inherit' : iconColor,
                    filter: `drop-shadow(${iconShadow.x}px ${iconShadow.y}px ${iconShadow.blur}px ${hexToRgba(
                      iconShadow.color,
                      iconShadow.alpha
                    )})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: `${iconRadius}%`,
                    overflow: 'hidden'
                  }}
                >
                  {localIcon ? (
                    <img src={localIcon} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Local Icon" />
                  ) : (
                    <div
                      className="icon-svg-box"
                      dangerouslySetInnerHTML={{ __html: iconSvg }}
                    />
                  )}
                </div>
              </div>
            )}

            <span
              style={{
                fontSize: `${fontSize}px`,
                color: color,
                textShadow: `${textShadow.x}px ${textShadow.y}px ${textShadow.blur}px ${hexToRgba(
                  textShadow.color,
                  textShadow.alpha
                )}`,
                lineHeight: 1,
                whiteSpace: 'nowrap'
              }}
            >
              {rightText}
            </span>
          </div>
        </foreignObject>

        <rect
          x="0.5"
          y="0.5"
          width={canvasWidth - 1}
          height={canvasHeight - 1}
          fill="none"
          stroke="rgba(128,128,128,0.4)"
          strokeWidth="1"
          className="canvas-border"
        />

        {visualRatios.map((ratio) => {
          if (BASE_HEIGHT * (ratio.w / ratio.h) < canvasWidth) {
            return (
              <g key={ratio.label} className="ratio-guide">
                <rect
                  x={(canvasWidth - BASE_HEIGHT * (ratio.w / ratio.h)) / 2}
                  y="0"
                  width={BASE_HEIGHT * (ratio.w / ratio.h)}
                  height={BASE_HEIGHT}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="1"
                  strokeDasharray="6 4"
                />
                <text
                  x={(canvasWidth - BASE_HEIGHT * (ratio.w / ratio.h)) / 2 + 8}
                  y="22"
                  fill="rgba(255, 255, 255, 0.4)"
                  fontSize="14"
                >
                  {ratio.label}
                </text>
              </g>
            );
          }
          return null;
        })}
      </svg>

      <style jsx>{`
        .preview-area {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--muted);
          background-image: radial-gradient(circle, var(--border) 0.8px, transparent 0.8px);
          background-size: 20px 20px;
          border-radius: 0.75rem;
          padding: 1rem;
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .preview-svg {
          width: 100%;
          max-height: 50vh;
          border-radius: 0.375rem;
          border: 1px solid var(--border);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        @media (min-width: 768px) {
          .preview-area {
            padding: 1.5rem;
          }

          .preview-svg {
            max-height: 60vh;
          }
        }

        .icon-svg-box {
          width: 100%;
          height: 100%;
        }
        .icon-svg-box svg {
          width: 100% !important;
          height: 100% !important;
          display: block;
        }
      `}</style>
    </div>
  );
}
