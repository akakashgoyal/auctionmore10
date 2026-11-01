import React, { useState } from 'react';
import { Property } from '../types';
import { useApi } from '../context/ApiContext';
import { formatINR, formatINRFull, calculateDiscount } from '../utils/storage';
import {
  X,
  MapPin,
  Landmark,
  ShieldCheck,
  Clock,
  Building,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  FileText,
  Phone,
  ArrowRight,
  Bell,
  ExternalLink,
} from 'lucide-react';
import { PropertyWatermark } from './PropertyWatermark';
import { getPropertyFallbackImage } from '../data/fallbackImages';
import { PropertyVideoPlayer } from './PropertyVideoPlayer';

interface PropertyModalProps {
  property: Property | null;
  onClose: () => void;
  onExpressInterest: (property: Property) => void;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  property,
  onClose,
  onExpressInterest,
}) => {
  const { settings } = useApi();
  if (!property) return null;

  const [activeImage, setActiveImage] = useState(0);
  const discountPercent = calculateDiscount(property.reservePrice, property.marketEstimate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#E2E8F0] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Sticky Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md bg-[#142533] text-white text-xs font-semibold flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-[#D89B30]" />
              <span>{property.authority}</span>
            </span>
            <span className="text-xs text-[#64748B] font-mono">Ref #{property.id.toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#F8F9FA] hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#142533] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Top Title & Location */}
          <div className="space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#142533] leading-tight">
              {property.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#64748B]">
              <a
                href={
                  property.googleMapsUrl ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    [property.location.address, property.location.locality, property.location.city, property.location.pinCode]
                      .filter(Boolean)
                      .join(', ')
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#142533] hover:text-[#D89B30] font-medium transition-colors group cursor-pointer"
                title="Open in Google Maps"
              >
                <MapPin className="w-4 h-4 text-[#D89B30] group-hover:scale-110 transition-transform shrink-0" />
                <span className="underline decoration-dotted decoration-slate-300 underline-offset-4 group-hover:decoration-[#D89B30]">
                  {property.location.address}, {property.location.locality}, {property.location.city} -{' '}
                  {property.location.pinCode}
                </span>
                <ExternalLink className="w-3 h-3 text-[#D89B30] opacity-70 group-hover:opacity-100 shrink-0" />
              </a>
              <span>·</span>
              <span className="text-emerald-700 font-medium">{property.possessionStatus}</span>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="space-y-2">
            <div className="aspect-16/9 rounded-2xl overflow-hidden bg-slate-100 relative">
              <img
                src={
                  (property.images && property.images.length > 0
                    ? property.images[activeImage] || property.images[0]
                    : '') || getPropertyFallbackImage(property.propertyType)
                }
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <PropertyWatermark variant="corner" position="top-right" size="md" />
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-[#D89B30] text-[#142533] font-extrabold text-xs px-3 py-1.5 rounded-lg shadow-md">
                  ~{discountPercent}% Below Estimated Valuation
                </div>
              )}
            </div>

            {property.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activeImage === idx ? 'border-[#D89B30] scale-95' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Financial Breakdown Grid */}
          <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#E5E0D5] space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#9A6007]">
              Financial &amp; Auction Terms
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[11px] text-[#64748B] block">Price</span>
                <span className="text-xl font-extrabold text-[#142533]">{formatINR(property.reservePrice)}</span>
                <span className="text-[10px] text-[#64748B] block">{formatINRFull(property.reservePrice)}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#64748B] block">EMD Deposit (10%)</span>
                <span className="text-xl font-bold text-[#142533]">{formatINR(property.emdAmount)}</span>
                <span className="text-[10px] text-emerald-700 block">Refundable if outbid</span>
              </div>
              <div>
                <span className="text-[11px] text-[#64748B] block">Market Valuation Est.</span>
                <span className="text-xl font-bold text-[#64748B]">
                  {property.marketEstimate ? formatINR(property.marketEstimate) : 'On Request'}
                </span>
                <span className="text-[10px] text-[#D89B30] font-semibold block">Save ~{discountPercent}%</span>
              </div>
              <div>
                <span className="text-[11px] text-[#64748B] block">Bid Increment</span>
                <span className="text-xl font-bold text-[#142533]">{formatINR(property.bidIncrement)}</span>
                <span className="text-[10px] text-[#64748B] block">Minimum step</span>
              </div>
            </div>
          </div>

          {/* Property Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Asset Description &amp; Specifications
            </h4>
            <p className="text-sm text-[#334155] leading-relaxed">{property.description}</p>
          </div>

          {/* Key Highlights */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Investor Key Highlights
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {property.highlights.map((hl, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs text-[#142533]"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{hl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pre-Bid Diligence Dossier Section */}
          <div className="bg-white rounded-2xl border-2 border-[#D89B30]/30 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#FAF1DE] text-[#D89B30]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif-title font-bold text-base text-[#142533]">
                    Pre-Bid Due Diligence &amp; Title Verification
                  </h4>
                  <p className="text-xs text-[#64748B]">
                    Auctions &amp; More statutory verification summary
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
                Verified Mandate
              </span>
            </div>

            {property.diligenceSummary && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0]">
                    <span className="text-[#64748B] block text-[11px]">30-Year Title Search</span>
                    <span className="font-bold text-[#142533] block mt-0.5">
                      {property.diligenceSummary.titleSearchAdvocate}
                    </span>
                  </div>
                  <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0]">
                    <span className="text-[#64748B] block text-[11px]">IBBI Certified Valuer</span>
                    <span className="font-bold text-[#142533] block mt-0.5">
                      {property.diligenceSummary.valuerName}
                    </span>
                  </div>
                  <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0]">
                    <span className="text-[#64748B] block text-[11px]">Govt Circle Rate Value</span>
                    <span className="font-bold text-[#142533] block mt-0.5">
                      {property.diligenceSummary.circleRateEst}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs text-[#475569] space-y-1">
                  <span className="font-semibold text-[#142533] block">Encumbrance &amp; Dues Note:</span>
                  <p>{property.diligenceSummary.duesPending}</p>
                </div>
              </>
            )}
          </div>

          {/* Crucial Deadlines Box */}
          <div className="bg-[#142533] text-white rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D89B30] flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Crucial Auction Dates &amp; Deadlines</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block text-[10px] uppercase">Inspection Schedule</span>
                <span className="font-semibold text-slate-100 block mt-0.5">
                  {property.inspectionDate}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block text-[10px] uppercase">EMD Submission Cutoff</span>
                <span className="font-semibold text-amber-300 block mt-0.5">
                  {new Date(property.emdDeadline).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block text-[10px] uppercase">E-Auction Event Date</span>
                <span className="font-semibold text-emerald-400 block mt-0.5">
                  {new Date(property.auctionDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Property Video Tour (if videos exist) */}
          {property.videos && property.videos.length > 0 && (
            <PropertyVideoPlayer
              videos={property.videos}
              propertyTitle={property.title}
            />
          )}
        </div>

        {/* Modal Sticky Footer CTA */}
        <div className="p-4 sm:p-6 bg-white border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href={`https://wa.me/${(settings.whatsapp_number || settings.primary_phone || '919899897647').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `Hi Auctions & More team, I would like to inquire about "${property.title}" (Ref: ${property.id}).`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 text-xs font-semibold transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp: {settings.whatsapp_number || settings.primary_phone || '+91 9899897647'}</span>
            </a>
          </div>

          <button
            onClick={() => {
              onClose();
              onExpressInterest(property);
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Bell className="w-4 h-4 text-[#D89B30]" />
            <span>Show Interest &amp; Get Bidding Alerts</span>
            <ArrowRight className="w-4 h-4 text-[#D89B30]" />
          </button>
        </div>
      </div>
    </div>
  );
};
