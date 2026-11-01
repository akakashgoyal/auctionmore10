import React from 'react';

interface PropertyWatermarkProps {
  /**
   * 'corner' = crisp watermark badge in top corner (default, clean & non-intrusive)
   * 'center' = pure translucent watermark in middle with zero background box
   * 'both' = subtle center watermark + top corner badge
   */
  variant?: 'corner' | 'center' | 'both';
  position?: 'top-right' | 'bottom-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PropertyWatermark: React.FC<PropertyWatermarkProps> = ({
  variant = 'corner',
  position = 'top-right',
  size = 'md',
  className = '',
}) => {
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 26 : 22;

  // Reusable official brand emblem SVG
  const emblemSvg = (s: number = 20) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-xs"
    >
      <rect width="100" height="100" rx="20" fill="#142533" />
      {/* Roof Line with Chimney */}
      <path d="M16 46L50 16L84 46H74L50 25L26 46H16Z" fill="#FFFFFF" />
      <path d="M72 26V37L80 43V26H72Z" fill="#FFFFFF" />
      {/* Roof shade accent */}
      <path d="M50 25L70 42H64L50 30L36 42H30L50 25Z" fill="#D89B30" opacity="0.6" />
      {/* "Auctions" typography */}
      <text
        x="50"
        y="64"
        textAnchor="middle"
        fill="#D89B30"
        fontWeight="800"
        fontSize="18"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="-0.5px"
      >
        Auctions
      </text>
      {/* "& More" typography */}
      <text
        x="50"
        y="79"
        textAnchor="middle"
        fill="#FFFFFF"
        fontWeight="800"
        fontSize="15"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="-0.2px"
      >
        &amp; More
      </text>
      {/* Wave motifs */}
      <path
        d="M12 88C24 84 34 89 48 91C62 93 72 87 88 88"
        stroke="#D89B30"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );

  const positionClasses = {
    'top-right': 'top-2.5 right-2.5 sm:top-3 sm:right-3',
    'bottom-right': 'bottom-2.5 right-2.5 sm:bottom-3 sm:right-3',
    'top-left': 'top-2.5 left-2.5 sm:top-3 sm:left-3',
  }[position];

  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none z-10 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* 1. Subtle Center Translucent Watermark (Pure SVG paths, ZERO dark container box) */}
      {(variant === 'center' || variant === 'both') && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="flex flex-col items-center justify-center opacity-20 sm:opacity-25 transform -rotate-12 select-none filter drop-shadow-md">
            <div className="flex items-center gap-2">
              {emblemSvg(size === 'sm' ? 28 : size === 'lg' ? 44 : 34)}
              <div className="text-left font-serif leading-none">
                <span className="block text-white font-black tracking-widest text-xs sm:text-sm uppercase drop-shadow-sm">
                  AUCTIONS &amp; MORE
                </span>
                <span className="block text-[#D89B30] font-mono font-bold tracking-widest text-[8px] uppercase mt-0.5">
                  VERIFIED AUCTION ASSET
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top-Right Corner Watermark Pill - Sleek, non-intrusive & never overlaps bottom plates or timers */}
      {(variant === 'corner' || variant === 'both') && (
        <div
          className={`absolute ${positionClasses} flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#142533]/80 backdrop-blur-md border border-white/20 text-white shadow-md`}
        >
          {emblemSvg(iconSize)}
          <span className="text-[10px] sm:text-[11px] font-serif font-bold tracking-wide leading-none text-slate-100 pr-1">
            Auctions &amp; More
          </span>
        </div>
      )}
    </div>
  );
};
