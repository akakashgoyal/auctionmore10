import React, { useState } from 'react';
import { AuctionAsset } from '../types';
import { formatINR } from '../utils/storage';
import { PropertyWatermark } from './PropertyWatermark';
import { useApi } from '../context/ApiContext';
import {
  MapPin,
  Calendar,
  Building2,
  Share2,
  ArrowRight,
  Recycle,
  Cog,
  Scale,
  Bell,
} from 'lucide-react';

interface AuctionAssetCardProps {
  asset: AuctionAsset;
  onViewDetails: (asset: AuctionAsset) => void;
  onEnquire?: (asset: AuctionAsset) => void;
  onShare?: (asset: AuctionAsset) => void;
}

export const AuctionAssetCard: React.FC<AuctionAssetCardProps> = ({
  asset,
  onViewDetails,
  onEnquire,
  onShare,
}) => {
  const { openAuctionAssetEnquiryModal } = useApi();
  const [imageError, setImageError] = useState(false);

  const normalizedStatus = (asset.status || '').toLowerCase().trim();
  const statusConfig =
    normalizedStatus === 'active' || normalizedStatus === 'live'
      ? {
          label: asset.status || 'Active',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          dotClass: 'bg-emerald-500 animate-pulse',
        }
      : normalizedStatus === 'upcoming'
      ? {
          label: asset.status || 'Upcoming',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
          dotClass: 'bg-amber-500',
        }
      : {
          label: asset.status || '',
          badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
          dotClass: 'bg-slate-400',
        };

  const hasValidImage = Boolean(!imageError && asset.asset_image);
  const isScrap = (asset.category || '').toLowerCase().includes('scrap');

  const formattedDate = asset.auction_date
    ? (() => {
        const d = new Date(asset.auction_date.replace(' ', 'T'));
        return isNaN(d.getTime())
          ? asset.auction_date
          : d.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
      })()
    : '';

  const locationText = [asset.city, asset.state].filter(Boolean).join(', ');
  const reserveNum = asset.reserve_price !== null && asset.reserve_price !== undefined ? Number(asset.reserve_price) : NaN;
  const emdNum = asset.emd_amount !== null && asset.emd_amount !== undefined ? Number(asset.emd_amount) : NaN;
  const hasReserve = !isNaN(reserveNum) && reserveNum > 0;
  const hasEmd = !isNaN(emdNum) && emdNum > 0;
  const hasQuantity = asset.quantity !== null && asset.quantity !== undefined && String(asset.quantity).trim() !== '' && Number(asset.quantity) > 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-[#D89B30]/60 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Image or Branded Asset Header */}
      <div
        onClick={() => onViewDetails(asset)}
        className="relative aspect-[16/10] bg-[#142533] overflow-hidden cursor-pointer flex items-center justify-center"
      >
        {hasValidImage ? (
          <>
            <img
              src={asset.asset_image!}
              alt={asset.title}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <PropertyWatermark variant="corner" position="top-right" size="sm" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#142533] via-[#1C3347] to-[#0D1A24] flex flex-col items-center justify-center p-6 text-center select-none">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-[#D89B30] mb-2.5">
              {isScrap ? <Recycle className="w-6 h-6" /> : <Cog className="w-6 h-6" />}
            </div>
            {asset.category && (
              <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                {asset.category}
              </span>
            )}
            {asset.sub_type && (
              <span className="text-[11px] text-slate-400 mt-0.5">{asset.sub_type}</span>
            )}
          </div>
        )}

        {/* Top Badges Row */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            {asset.category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide backdrop-blur-md bg-white/95 text-[#142533] shadow-xs">
                {isScrap ? (
                  <Recycle className="w-3 h-3 text-[#D89B30]" />
                ) : (
                  <Cog className="w-3 h-3 text-blue-600" />
                )}
                <span>{asset.category}</span>
              </span>
            )}

            {asset.sub_type && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium backdrop-blur-md bg-black/60 text-white border border-white/20">
                {asset.sub_type}
              </span>
            )}
          </div>

          {statusConfig.label && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border backdrop-blur-md shadow-xs ${statusConfig.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
              <span>{statusConfig.label}</span>
            </span>
          )}
        </div>

        {/* Bottom Image Overlay: Reference Number & Bank (only when present) */}
        {(asset.reference_no || asset.bank_name) && (
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-white pointer-events-none">
            <div className="min-w-0">
              {asset.reference_no && (
                <span className="inline-block px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-[#142533]/90 text-amber-300 border border-white/10 tracking-wider">
                  REF: {asset.reference_no}
                </span>
              )}
            </div>

            {asset.bank_name && (
              <div className="flex items-center gap-1 text-[11px] text-white/90 bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs truncate max-w-[55%]">
                <Building2 className="w-3 h-3 text-[#D89B30] shrink-0" />
                <span className="truncate font-medium">{asset.bank_name}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {asset.title && (
          <h3
            onClick={() => onViewDetails(asset)}
            className="text-base font-bold text-[#142533] group-hover:text-[#D89B30] transition-colors line-clamp-2 cursor-pointer leading-snug mb-2"
            title={asset.title}
          >
            {asset.title}
          </h3>
        )}

        {/* Location & Quantity Row */}
        {(locationText || hasQuantity) && (
          <div className="flex items-center justify-between text-xs text-slate-600 gap-2 mb-3">
            {locationText ? (
              <div className="flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#D89B30] shrink-0" />
                <span className="truncate">{locationText}</span>
              </div>
            ) : (
              <span />
            )}

            {hasQuantity && (
              <div className="flex items-center gap-1 font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                <Scale className="w-3 h-3 text-slate-400" />
                <span>
                  {Number(asset.quantity).toLocaleString('en-IN', { maximumFractionDigits: 3 })} {asset.unit || ''}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Pricing Grid (only if reserve or EMD exists) */}
        {(hasReserve || hasEmd) && (
          <div className="mt-auto pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 bg-[#FAF8F5] p-3 rounded-xl mb-4">
            {hasReserve && (
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Reserve Price
                </div>
                <div className="text-sm sm:text-base font-extrabold text-[#142533] font-mono mt-0.5">
                  {formatINR(reserveNum)}
                </div>
              </div>
            )}
            {hasEmd && (
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  EMD Amount
                </div>
                <div className="text-sm sm:text-base font-semibold text-slate-700 font-mono mt-0.5">
                  {formatINR(emdNum)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Auction Date & Card Actions */}
        <div className="space-y-3 mt-auto">
          {(formattedDate || asset.auction_platform) && (
            <div className="flex items-center justify-between text-xs text-slate-600">
              {formattedDate ? (
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#D89B30]" />
                  <span>
                    Auction: <strong className="text-slate-800">{formattedDate}</strong>
                  </span>
                </span>
              ) : (
                <span />
              )}

              {asset.auction_platform && (
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[130px]">
                  {asset.auction_platform}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() =>
                onEnquire ? onEnquire(asset) : openAuctionAssetEnquiryModal(asset)
              }
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-[#D89B30]" />
              <span>Enquire</span>
            </button>

            <button
              type="button"
              onClick={() => onViewDetails(asset)}
              className="py-2.5 px-3 rounded-xl bg-[#FAF1DE] hover:bg-[#F3E2BD] border border-[#D89B30]/40 text-[#9A6007] hover:text-[#142533] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer group/view"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D89B30] group-hover/view:translate-x-0.5 transition-transform" />
            </button>

            {onShare && (
              <button
                type="button"
                onClick={() => onShare(asset)}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-[#D89B30]/50 hover:bg-[#FAF1DE]/50 text-slate-600 hover:text-[#9A6007] transition-colors cursor-pointer shrink-0"
                title="Share this auction"
                aria-label="Share auction"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

