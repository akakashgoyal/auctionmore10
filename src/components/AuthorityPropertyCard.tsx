import React, { useState } from 'react';
import { AuthorityProperty } from '../types';
import { formatINR } from '../utils/storage';
import { PropertyWatermark } from './PropertyWatermark';
import { useApi } from '../context/ApiContext';
import {
  MapPin,
  Calendar,
  Landmark,
  ArrowRight,
  Maximize2,
  Layers,
  Bell,
} from 'lucide-react';

export interface AuthorityPropertyCardProps {
  property: AuthorityProperty;
  onViewDetails: (property: AuthorityProperty) => void;
  onEnquire?: (property: AuthorityProperty) => void;
  onSelectAuthority?: (authorityId: number) => void;
}

export function formatAuthorityDateTime(dateStr?: string | null): string {
  if (!dateStr || !dateStr.trim()) return '';
  try {
    const normalized = dateStr.trim().replace(' ', 'T');
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return dateStr.trim();
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr.trim();
  }
}

export function formatAreaValue(area?: number | string | null, unit?: string | null): string {
  if (area === undefined || area === null || area === '') {
    return unit ? unit : '';
  }
  const numVal = typeof area === 'number' ? area : Number(area);
  if (isNaN(numVal)) {
    const rawStr = String(area).trim();
    if (!rawStr) return unit ? unit : '';
    return unit ? `${rawStr} ${unit}` : rawStr;
  }
  const formattedNum = numVal.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  });
  return unit ? `${formattedNum} ${unit}` : formattedNum;
}

export function getStatusLabelAndColor(status?: string | null): {
  label: string;
  textClass: string;
  bgClass: string;
} {
  const raw = (status || '').trim();
  const lower = raw.toLowerCase();
  if (lower === 'active' || lower === 'live' || lower === 'ongoing') {
    return {
      label: raw.charAt(0).toUpperCase() + raw.slice(1),
      textClass: 'text-emerald-800',
      bgClass: 'bg-emerald-50/95 border-emerald-200',
    };
  }
  if (lower === 'upcoming') {
    return {
      label: 'Upcoming',
      textClass: 'text-[#9A6007]',
      bgClass: 'bg-[#FAF1DE]/95 border-[#D89B30]/40',
    };
  }
  if (lower === 'closed' || lower === 'completed' || lower === 'sold' || lower === 'expired') {
    return {
      label: raw.charAt(0).toUpperCase() + raw.slice(1),
      textClass: 'text-slate-700',
      bgClass: 'bg-slate-100/95 border-slate-300',
    };
  }
  return {
    label: raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : '',
    textClass: 'text-[#142533]',
    bgClass: 'bg-white/95 border-slate-200',
  };
}

export const AuthorityPropertyCard: React.FC<AuthorityPropertyCardProps> = ({
  property,
  onViewDetails,
  onEnquire,
  onSelectAuthority,
}) => {
  const { openAuthorityEnquiryModal } = useApi();
  const [imageError, setImageError] = useState(false);

  const hasValidImage = Boolean(!imageError && property.primary_image);
  const statusInfo = getStatusLabelAndColor(property.status);

  const locationText = [property.city_name, property.state_name].filter(Boolean).join(', ');
  const areaText = formatAreaValue(property.area, property.area_unit);
  const startDateText = formatAuthorityDateTime(property.auction_start_at);
  const endDateText = formatAuthorityDateTime(property.auction_end_at);

  const hasReservePrice = property.reserve_price !== null && property.reserve_price !== undefined;
  const hasEmdAmount = property.emd_amount !== null && property.emd_amount !== undefined;

  return (
    <article className="group bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#D89B30]/60 hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden">
      {/* Primary Property Image */}
      <div
        onClick={() => onViewDetails(property)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onViewDetails(property);
          }
        }}
        className="relative aspect-16/10 w-full overflow-hidden bg-[#142533] flex items-center justify-center cursor-pointer"
        title={property.title || 'View property details'}
      >
        {hasValidImage ? (
          <>
            <img
              src={property.primary_image!}
              alt={property.title || 'Authority Property'}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
            <PropertyWatermark variant="corner" position="top-right" size="sm" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#142533] via-[#1C3347] to-[#0D1A24] flex flex-col items-center justify-center p-6 text-center select-none">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-[#D89B30] mb-2.5">
              <Landmark className="w-6 h-6" />
            </div>
            {property.authority?.short_name || property.authority?.name ? (
              <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                {property.authority.short_name || property.authority.name}
              </span>
            ) : null}
            {property.property_type ? (
              <span className="text-[11px] text-slate-400 mt-0.5">{property.property_type}</span>
            ) : null}
          </div>
        )}

        {/* Top Left Status Indicator (only if status is present in backend) */}
        {statusInfo.label && (
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <span
              className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold border backdrop-blur-xs shadow-2xs ${statusInfo.bgClass} ${statusInfo.textClass}`}
            >
              {statusInfo.label}
            </span>
          </div>
        )}

        {/* Bottom Overlay: Property Code if present */}
        {property.property_code && (
          <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none flex items-center justify-between gap-2">
            <span className="inline-block px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-xs text-amber-300 font-mono text-[11px] font-medium border border-white/15 truncate max-w-full">
              Code: {property.property_code}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Authority Name & Short Name + Property Type / Sub-Type */}
          {(property.authority?.name || property.property_type || property.property_sub_type) && (
            <div className="flex items-center justify-between gap-2 text-xs text-[#64748B]">
              {property.authority?.name ? (
                onSelectAuthority && property.authority.id ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAuthority(property.authority!.id);
                    }}
                    className="inline-flex items-center gap-1.5 font-semibold text-[#9A6007] hover:text-[#142533] transition-colors truncate cursor-pointer text-left"
                    title={`View all properties from ${property.authority.name}`}
                  >
                    <Landmark className="w-3.5 h-3.5 text-[#D89B30] shrink-0" />
                    <span className="truncate">
                      {property.authority.name}
                      {property.authority.short_name ? ` (${property.authority.short_name})` : ''}
                    </span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#9A6007] truncate">
                    <Landmark className="w-3.5 h-3.5 text-[#D89B30] shrink-0" />
                    <span className="truncate">
                      {property.authority.name}
                      {property.authority.short_name ? ` (${property.authority.short_name})` : ''}
                    </span>
                  </span>
                )
              ) : (
                <span />
              )}

              {(property.property_type || property.property_sub_type) && (
                <span className="text-[11px] text-slate-500 font-medium shrink-0 truncate max-w-[45%]">
                  {[property.property_type, property.property_sub_type].filter(Boolean).join(' · ')}
                </span>
              )}
            </div>
          )}

          {/* Property Title */}
          {property.title && (
            <h3
              onClick={() => onViewDetails(property)}
              className="font-serif-title text-base sm:text-lg font-bold text-[#142533] group-hover:text-[#D89B30] transition-colors cursor-pointer line-clamp-2 leading-snug"
            >
              {property.title}
            </h3>
          )}

          {/* Scheme Name (only if present in backend) */}
          {property.scheme_name && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                Scheme: <strong className="font-semibold text-[#142533]">{property.scheme_name}</strong>
              </span>
            </div>
          )}

          {/* Location (City, State) & Area Row */}
          {(locationText || areaText) && (
            <div className="flex items-center justify-between gap-2 text-xs text-[#64748B] pt-0.5">
              {locationText ? (
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-[#D89B30] shrink-0" />
                  <span className="truncate">{locationText}</span>
                </div>
              ) : (
                <span />
              )}

              {areaText && (
                <div className="flex items-center gap-1 font-mono text-[11px] text-[#142533] font-semibold shrink-0 tabular-nums">
                  <Maximize2 className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{areaText}</span>
                </div>
              )}
            </div>
          )}

          {/* Financials: Reserve Price & EMD Amount (only rendered when present in backend) */}
          {(hasReservePrice || hasEmdAmount) && (
            <div className="pt-2.5 border-t border-[#F1EFEA]">
              <div
                className={`grid ${
                  hasReservePrice && hasEmdAmount ? 'grid-cols-2' : 'grid-cols-1'
                } gap-2`}
              >
                {hasReservePrice && (
                  <div className="bg-[#F8F9FA] rounded-xl p-2.5 border border-[#E2E8F0]/70">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#64748B] block">
                      Reserve Price
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-[#142533] font-mono tabular-nums mt-0.5 block">
                      {formatINR(property.reserve_price!)}
                    </span>
                  </div>
                )}

                {hasEmdAmount && (
                  <div className="bg-[#F8F9FA] rounded-xl p-2.5 border border-[#E2E8F0]/70">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#64748B] block">
                      EMD Amount
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#142533] font-mono tabular-nums mt-0.5 block">
                      {formatINR(property.emd_amount!)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Auction Start & End Dates (only rendered when present in backend) */}
          {(startDateText || endDateText) && (
            <div className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] text-xs space-y-1">
              {startDateText && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#64748B] flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#D89B30] shrink-0" />
                    <span>Auction Start:</span>
                  </span>
                  <span className="font-bold text-[#142533] font-mono text-[11px] tabular-nums">
                    {startDateText}
                  </span>
                </div>
              )}
              {endDateText && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#64748B] flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Auction End:</span>
                  </span>
                  <span className="font-bold text-[#142533] font-mono text-[11px] tabular-nums">
                    {endDateText}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enquire & View Details Actions */}
        <div className="pt-2 border-t border-[#F1EFEA] flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onEnquire ? onEnquire(property) : openAuthorityEnquiryModal(property)
            }
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs sm:text-sm font-semibold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-[#D89B30]" />
            <span>Enquire</span>
          </button>

          <button
            type="button"
            onClick={() => onViewDetails(property)}
            className="py-2.5 px-3.5 rounded-xl bg-[#FAF1DE] hover:bg-[#F3E2BD] border border-[#D89B30]/40 text-[#9A6007] hover:text-[#142533] text-xs sm:text-sm font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer group/btn"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D89B30] group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </article>
  );
};
