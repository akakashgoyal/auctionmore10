import React, { useState, useEffect } from 'react';
import { Property } from '../types';
import { formatINR, calculateDiscount } from '../utils/storage';
import {
  MapPin,
  Clock,
  Building,
  Bell,
  CheckCircle2,
  Share2,
  Calendar,
  ShieldCheck,
  Play,
  ArrowRight,
} from 'lucide-react';
import { PropertyWatermark } from './PropertyWatermark';
import { getPropertyFallbackImage } from '../data/fallbackImages';

interface PropertyCardProps {
  property: Property;
  onSelectProperty: (property: Property) => void;
  onExpressInterest: (property: Property) => void;
  onShareProperty?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelectProperty,
  onExpressInterest,
  onShareProperty,
}) => {
  const discountPercent = calculateDiscount(property.reservePrice, property.marketEstimate);

  // Dynamic countdown calculation for auction closing / EMD
  const [isExpired, setIsExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; days: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      if (!property.auctionDate) {
        setIsExpired(true);
        return;
      }
      const target = new Date(property.auctionDate).getTime();
      if (isNaN(target)) {
        setIsExpired(true);
        return;
      }

      const diff = target - Date.now();
      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setIsExpired(false);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [property.auctionDate]);

  const [imageError, setImageError] = useState(false);
  const rawImage = property.images && property.images.length > 0 ? property.images[0] : null;
  const fallbackImage = getPropertyFallbackImage(property.propertyType);
  const displayImage = !imageError && rawImage ? rawImage : fallbackImage;

  const hasPostAuctionPrice = Boolean(
    property.postAuctionPrice &&
    typeof property.postAuctionPrice === 'number' &&
    !isNaN(property.postAuctionPrice) &&
    property.postAuctionPrice > 0
  );
  const postAuctionPrice = hasPostAuctionPrice ? property.postAuctionPrice! : 0;
  const postAuctionDate = property.postAuctionPriceDate;

  const formatOfferDate = (dateStr?: string) => {
    if (!dateStr || !dateStr.trim()) return '';
    try {
      const d = new Date(dateStr.trim());
      if (isNaN(d.getTime())) return dateStr.trim();
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr.trim();
    }
  };

  const formatAuctionDate = (dateStr: string) => {
    if (!dateStr) return 'Date TBA';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <article className="group bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#D89B30]/60 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Top Image & Overlays - Only Countdown / Status on image */}
      <div
        onClick={() => onSelectProperty(property)}
        className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSelectProperty(property);
        }}
        title="Click to view property details"
      >
        <img
          src={displayImage}
          alt={property.title}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />

        {/* Brand Logo Watermark on Property Image - Top Right to avoid any overlap */}
        <PropertyWatermark variant="corner" position="top-right" size="sm" />

        {/* Post-Auction Direct Bank Sale Badge */}
        {hasPostAuctionPrice && (
          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#142533]/95 text-[#D89B30] font-mono font-bold text-[10px] border border-[#D89B30]/40 backdrop-blur-md shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D89B30] animate-pulse" />
            <span>Bank Sale Offer</span>
          </div>
        )}

        {/* Video Tour Available Indicator */}
        {property.videos && property.videos.length > 0 && !hasPostAuctionPrice && (
          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/90 text-white font-mono font-bold text-[9px] backdrop-blur-xs shadow-xs">
            <Play className="w-2.5 h-2.5 fill-white" />
            <span>Video</span>
          </div>
        )}

        {/* Countdown or Auction Ended / Direct Sale overlay on bottom left */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          {hasPostAuctionPrice ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#142533]/95 text-[#D89B30] font-mono font-semibold text-[11px] backdrop-blur-xs border border-[#D89B30]/40 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D89B30] animate-pulse"></span>
              <span>Direct Bank Sale</span>
            </div>
          ) : isExpired ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-700/90 text-white font-semibold text-[11px] backdrop-blur-xs shadow-md border border-rose-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              <span>Auction Ended</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 text-white font-mono text-[11px] backdrop-blur-xs border border-white/20 shadow-md">
              <Clock className="w-3.5 h-3.5 text-[#D89B30]" />
              <span>
                {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
                {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Asset Category / Type */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#64748B]">
            <Building className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="truncate">{property.propertyType || property.auctionCategory || 'Auction Asset'}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelectProperty(property)}
            className="font-serif-title text-base sm:text-lg font-bold text-[#142533] group-hover:text-[#D89B30] transition-colors cursor-pointer line-clamp-2 leading-snug"
          >
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <MapPin className="w-3.5 h-3.5 text-[#D89B30] flex-shrink-0" />
            <span className="truncate">
              {[property.location.locality, property.location.city, property.location.state].filter(Boolean).join(', ') || 'Pan India'}
            </span>
          </div>

          {/* Key Metric Blocks */}
          <div className="pt-2 border-t border-[#F1EFEA] space-y-2.5">
            {hasPostAuctionPrice ? (
              <>
                {/* 1. Post-Auction Discounted Price & Date Showcase */}
                <div className="rounded-xl p-3 sm:p-3.5 bg-gradient-to-br from-[#FAF8F5] via-[#FFFDF9] to-[#FAF1DE]/80 border-2 border-[#D89B30]/60 shadow-xs space-y-2">
                  {/* Header Row: Badge + Cut/Strikethrough Original Reserve Price */}
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#142533] text-[#D89B30] text-[10px] font-mono font-extrabold uppercase tracking-wide shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D89B30] animate-pulse" />
                      <span>Bank Direct Sale</span>
                    </div>

                    {property.reservePrice > 0 && (
                      <div className="flex items-center gap-1.5 text-xs font-mono ml-auto">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Reserve:</span>
                        <span className="line-through text-slate-400 font-bold decoration-red-500/80 decoration-1 sm:decoration-2">
                          {formatINR(property.reservePrice)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Big Discounted Post-Auction Price + Savings Badge */}
                  <div className="flex items-baseline justify-between gap-2 flex-wrap pt-0.5">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#9A6007] block font-mono">
                        Post-Auction Price
                      </span>
                      <span className="font-serif text-xl sm:text-2xl font-black text-[#142533]">
                        {formatINR(postAuctionPrice)}
                      </span>
                    </div>

                    {property.reservePrice > postAuctionPrice && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-extrabold shadow-2xs">
                        <span>Save {formatINR(property.reservePrice - postAuctionPrice)}</span>
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          (-{Math.round(((property.reservePrice - postAuctionPrice) / property.reservePrice) * 100)}%)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Date: Price Offered On / Updated On */}
                  {postAuctionDate && (
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#D89B30]/30 text-xs font-mono">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#D89B30]" />
                        Price Offered On:
                      </span>
                      <span className="font-bold text-[#142533] text-xs">
                        {formatOfferDate(postAuctionDate)}
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Secondary Row: EMD & Increment */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#F8F9FA] rounded-xl p-2.5 border border-[#E2E8F0]/60 flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#64748B] block">
                      EMD Amount (10%)
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#142533] font-mono">
                      {formatINR(property.emdAmount)}
                    </span>
                  </div>

                  <div className="bg-[#F8F9FA] rounded-xl p-2.5 border border-[#E2E8F0]/60 flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#64748B] block">
                      Bid Increment
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#142533] font-mono">
                      {formatINR(property.bidIncrement)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Normal 2-Column Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#F8F9FA] rounded-xl p-2.5 border border-[#E2E8F0]/60 min-h-[76px] flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#64748B] block">
                      Reserve Price
                    </span>
                    <span className="text-base sm:text-lg font-extrabold text-[#142533] font-sans">
                      {formatINR(property.reservePrice)}
                    </span>
                    {property.marketEstimate ? (
                      <span className="text-[11px] text-[#94A3B8] line-through block leading-none">
                        Market: {formatINR(property.marketEstimate)}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 block leading-none">Govt Valuation</span>
                    )}
                  </div>

                  <div className="bg-[#F8F9FA] rounded-xl p-2.5 border border-[#E2E8F0]/60 min-h-[76px] flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#64748B] block">
                      EMD (10%)
                    </span>
                    <span className="text-base sm:text-lg font-bold text-[#142533] font-sans">
                      {formatINR(property.emdAmount)}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium block leading-none">
                      Increment: {formatINR(property.bidIncrement)}
                    </span>
                  </div>
                </div>

                {/* Auction Date Row for regular properties */}
                <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] text-xs">
                  <div className="flex items-center gap-1.5 text-[#142533]">
                    <Calendar className="w-3.5 h-3.5 text-[#D89B30] flex-shrink-0" />
                    <span className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider">
                      Auction Date:
                    </span>
                  </div>
                  <span className="font-bold text-[#142533] text-xs font-mono">
                    {formatAuctionDate(property.auctionDate)}
                  </span>
                </div>
              </>
            )}

            {/* Title Clearance Tag */}
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 rounded-lg px-2.5 py-1 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="font-medium truncate">{property.titleClearanceStatus || 'Title Perfection'} · Verified</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-[#F1EFEA] flex items-center gap-2">
          {/* Property Enquiry Primary CTA (Form 1) */}
          <button
            id={`btn-enquire-${property.id}`}
            onClick={() => onExpressInterest(property)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-[#D89B30]" />
            <span>Enquire</span>
          </button>

          {/* Prominent Redirect Button (Real Property Button with Arrow) */}
          <button
            id={`btn-view-details-${property.id}`}
            onClick={() => onSelectProperty(property)}
            className="py-2.5 px-3.5 rounded-xl bg-[#FAF1DE] hover:bg-[#F3E2BD] border border-[#D89B30]/40 text-[#9A6007] hover:text-[#142533] text-xs sm:text-sm font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer group/view"
            title="Redirect to complete property listing & documents"
          >
            <span>View Property</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D89B30] group-hover/view:translate-x-0.5 transition-transform" />
          </button>

          {/* Quick Share Button */}
          {onShareProperty && (
            <button
              id={`btn-share-${property.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onShareProperty(property);
              }}
              className="p-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#FAF1DE] border border-[#E8E2D5] text-[#9A6007] hover:text-[#142533] transition-colors cursor-pointer"
              title="Share Property"
              aria-label="Share Property"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
