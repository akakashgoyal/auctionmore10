import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  variant?: 'dark' | 'light';
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'dark',
  showSubtitle = true,
  className = '',
}) => {
  const isLight = variant === 'light';
  const navyColor = isLight ? '#FFFFFF' : '#142533';
  const goldColor = '#D89B30';
  const subtextColor = isLight ? '#94A3B8' : '#5E7182';

  const dimensions = {
    sm: { height: 36, iconSize: 32, titleSize: 'text-[15px]', subSize: 'text-[9px]' },
    md: { height: 48, iconSize: 44, titleSize: 'text-xl', subSize: 'text-[10px]' },
    lg: { height: 64, iconSize: 58, titleSize: 'text-2xl', subSize: 'text-xs' },
    hero: { height: 80, iconSize: 74, titleSize: 'text-3xl', subSize: 'text-sm' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Brand SVG Mark */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        <svg
          width={dimensions.iconSize}
          height={dimensions.iconSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-105"
        >
          {/* Outer Rounded Container/Emblem with subtle background if light */}
          {isLight ? (
            <rect width="100" height="100" rx="20" fill="#1C3142" />
          ) : (
            <rect width="100" height="100" rx="20" fill="#F8F6F0" stroke="#E5E0D5" strokeWidth="1.5" />
          )}

          {/* Roof Line with Chimney (Exact motif from uploaded logo) */}
          <path
            d="M16 46L50 16L84 46H74L50 25L26 46H16Z"
            fill={navyColor}
          />
          {/* Chimney */}
          <path
            d="M72 26V37L80 43V26H72Z"
            fill={navyColor}
          />

          {/* Subtle Roof Shade Accent */}
          <path
            d="M50 25L70 42H64L50 30L36 42H30L50 25Z"
            fill={isLight ? '#334E68' : '#94A3B8'}
            opacity="0.35"
          />

          {/* "Auctions" stylized typography in emblem */}
          <text
            x="50"
            y="64"
            textAnchor="middle"
            fill={goldColor}
            fontWeight="800"
            fontSize="18"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="-0.5px"
          >
            Auctions
          </text>

          {/* "& More" in emblem */}
          <text
            x="50"
            y="79"
            textAnchor="middle"
            fill={navyColor}
            fontWeight="800"
            fontSize="15"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="-0.2px"
          >
            &amp; More
          </text>

          {/* Elegant Lower Wave Motifs from logo */}
          <path
            d="M12 88C24 84 34 89 48 91C62 93 72 87 88 88"
            stroke={navyColor}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Text Block */}
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline gap-1.5">
          <span className={`font-extrabold tracking-tight font-sans ${dimensions.titleSize}`} style={{ color: navyColor }}>
            Auctions <span style={{ color: goldColor }}>&amp; More</span>
          </span>
          <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-[#D89B30]/15 text-[#D89B30] border border-[#D89B30]/30 hidden sm:inline-block">
            Pvt Ltd
          </span>
        </div>
        {showSubtitle && (
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`tracking-wider uppercase font-medium ${dimensions.subSize}`}
              style={{ color: subtextColor }}
            >
              Find It. Bid It. Own It.
            </span>
            <span className="w-1 h-1 rounded-full bg-[#D89B30]"></span>
            <span className={`font-mono text-[9px] font-semibold`} style={{ color: goldColor }}>
              Est. 15+ Yrs
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
