import React, { useMemo } from 'react';
import { Property } from '../types';
import { Flame } from 'lucide-react';

interface LatestAuctionsTickerProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
}

export const LatestAuctionsTicker: React.FC<LatestAuctionsTickerProps> = ({
  properties,
  onSelectProperty,
}) => {
  // Format currency concisely
  const formatTickerPrice = (val?: number) => {
    if (!val || val <= 0) return null;
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lac`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Build meaningful, dynamic message without any invented or fake text
  const getTickerItem = (prop: Property) => {
    const title = prop.title.trim();
    const city = prop.location?.city?.trim() || prop.cityName?.trim();
    const state = prop.location?.state?.trim() || prop.stateName?.trim();
    const locationStr = city ? `${city}${state && state !== city ? `, ${state}` : ''}` : '';
    const propType = prop.propertySubType?.trim() || prop.propertyType?.trim() || '';
    const priceStr = formatTickerPrice(prop.reservePrice);

    let prefix = 'Latest Auction';
    if (prop.featured) {
      prefix = 'Special Auction';
    } else if (prop.auctionCategory) {
      prefix = `${prop.auctionCategory} Auction`;
    }

    let detailPart = '';
    if (locationStr && propType) {
      detailPart = `${propType} in ${locationStr}`;
    } else if (locationStr) {
      detailPart = `in ${locationStr}`;
    } else if (propType) {
      detailPart = propType;
    }

    return {
      prefix,
      title,
      detailPart,
      priceStr,
      property: prop,
    };
  };

  // Filter valid properties with a valid title and id
  const validProperties = useMemo(() => {
    return (properties || []).filter(
      (p) => Boolean(p && p.id && p.title && p.title.trim() !== '')
    );
  }, [properties]);

  const tickerItems = useMemo(() => {
    return validProperties.slice(0, 10).map(getTickerItem);
  }, [validProperties]);

  // If no properties, do NOT render the ticker at all (zero whitespace)
  if (tickerItems.length === 0) {
    return null;
  }

  // Duplicate items to ensure seamless infinite continuous scroll loop
  const scrollLoop = [...tickerItems, ...tickerItems];

  return (
    <div
      className="w-full bg-[#142533] text-white border-b border-white/10 overflow-hidden relative select-none"
      role="region"
      aria-label="Latest & Special Auction Announcements Ticker"
    >
      <div className="w-full max-w-[1500px] mx-auto flex items-center">
        {/* Left Fixed Badge: WHAT'S NEW */}
        <div className="relative z-10 flex items-center gap-2 pl-3 sm:pl-6 lg:pl-12 py-2 pr-3 bg-[#142533] border-r border-white/10 shrink-0 shadow-md">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#D89B30] text-[#142533] font-mono font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider shadow-xs shrink-0">
            <Flame className="w-3.5 h-3.5 fill-[#142533] text-[#142533]" />
            <span>WHAT'S NEW</span>
          </span>
        </div>

        {/* Smooth Scrolling Continuous Marquee Track */}
        <div className="relative flex-1 overflow-hidden group py-2">
          {/* Subtle gradient fades on edges */}
          <div className="absolute left-0 inset-y-0 w-6 bg-gradient-to-r from-[#142533] to-transparent z-5 pointer-events-none" />
          <div className="absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-[#142533] to-transparent z-5 pointer-events-none" />

          <div className="animate-ticker-scroll flex items-center">
            {scrollLoop.map((item, idx) => (
              <div key={`${item.property.id}-${idx}`} className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectProperty(item.property)}
                  className="inline-flex items-center gap-2 px-3 py-0.5 rounded text-left group/item hover:bg-white/5 transition-all cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#D89B30]"
                  title={`View property details: ${item.title}`}
                >
                  <span className="inline-block px-1.5 py-0.5 rounded bg-amber-400/15 border border-amber-400/30 text-amber-300 font-mono font-bold text-[10px] uppercase tracking-wider shrink-0">
                    {item.prefix}
                  </span>

                  <span className="font-semibold text-slate-100 group-hover/item:text-[#D89B30] group-hover/item:underline underline-offset-2 transition-colors text-xs shrink-0">
                    {item.title}
                  </span>

                  {item.detailPart && (
                    <span className="text-slate-400 text-[11px] shrink-0 font-medium">
                      • {item.detailPart}
                    </span>
                  )}

                  {item.priceStr && (
                    <span className="inline-block px-2 py-0.5 rounded bg-white/10 text-emerald-300 font-mono text-[10px] font-bold shrink-0">
                      Reserve: {item.priceStr}
                    </span>
                  )}
                </button>

                {/* Separator between items */}
                <span className="text-slate-600 font-bold px-3 select-none">
                  ✦
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
