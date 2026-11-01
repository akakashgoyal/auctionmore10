import React, { useState, useEffect, useCallback } from 'react';
import { AuthorityProperty } from '../../types';
import { getAuthorityPropertyById } from '../../services/api';
import { formatINR } from '../../utils/storage';
import { getStatusLabelAndColor } from '../AuthorityPropertyCard';
import { PropertyWatermark } from '../PropertyWatermark';
import { PageRoute } from '../Navbar';
import { getShareableUrl } from '../../utils/routes';
import { useApi } from '../../context/ApiContext';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Calendar,
  Landmark,
  FileText,
  Download,
  ExternalLink,
  Home,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
  AlertCircle,
  RefreshCw,
  Phone,
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  Building2,
  Navigation,
  CreditCard,
  Bell,
} from 'lucide-react';

export interface AuthorityPropertyDetailPageProps {
  propertyId: number | string;
  initialProperty?: AuthorityProperty | null;
  onBack: () => void;
  onSelectAuthority: (authorityId: number) => void;
  onNavigate: (page: PageRoute, customUrl?: string) => void;
}

function formatFullDateTime(dateStr?: string | null): string {
  if (!dateStr || !dateStr.trim()) return '';
  try {
    const normalized = dateStr.trim().replace(' ', 'T');
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return dateStr.trim();
    const hasTime = dateStr.includes(':') && !dateStr.endsWith('00:00:00');
    if (hasTime) {
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr.trim();
  }
}

function formatDocumentType(docType?: string | null): string {
  if (!docType || !docType.trim()) return '';
  return docType
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export const AuthorityPropertyDetailPage: React.FC<AuthorityPropertyDetailPageProps> = ({
  propertyId,
  initialProperty,
  onBack,
  onSelectAuthority,
  onNavigate,
}) => {
  const { settings, openAuthorityEnquiryModal } = useApi();

  const [property, setProperty] = useState<AuthorityProperty | null>(
    initialProperty && String(initialProperty.id) === String(propertyId) ? initialProperty : null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Gallery & Full-Screen Lightbox states
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [failedImageIds, setFailedImageIds] = useState<Record<number, boolean>>({});
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxZoomed, setLightboxZoomed] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAuthorityPropertyById(propertyId);
      if (res.success && res.property) {
        setProperty(res.property);
        setActiveImageIndex(0);
        setFailedImageIds({});
      } else {
        setProperty(null);
        setError(res.message || 'The requested authority property could not be found.');
      }
    } catch {
      setProperty(null);
      setError('Network error while loading property details.');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const validImages = (property?.images || []).filter(
    (img) => Boolean(img.image_url) && !failedImageIds[img.id]
  );

  // Keyboard navigation for Full-Screen Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
        setLightboxZoomed(false);
      } else if (e.key === 'ArrowRight' && validImages.length > 1) {
        setActiveImageIndex((prev) => (prev + 1) % validImages.length);
        setLightboxZoomed(false);
      } else if (e.key === 'ArrowLeft' && validImages.length > 1) {
        setActiveImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
        setLightboxZoomed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, validImages.length]);

  const handleCopyShareLink = async () => {
    if (typeof window === 'undefined') return;
    try {
      const shareHref = getShareableUrl(
        'authority-property-detail',
        String(property?.id || propertyId)
      );
      await navigator.clipboard.writeText(shareHref);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      // Ignore clipboard permission errors
    }
  };

  // Loading Skeleton View
  if (loading && !property) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] pb-20">
        <div className="bg-[#142533] h-12 border-b border-white/10" />
        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-8 space-y-8 animate-pulse">
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded w-48" />
            <div className="h-10 bg-slate-200 rounded w-2/3" />
            <div className="h-4 bg-slate-200 rounded w-1/3" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="aspect-16/10 bg-slate-200 rounded-3xl" />
              <div className="h-48 bg-white rounded-3xl border border-slate-200" />
              <div className="h-48 bg-white rounded-3xl border border-slate-200" />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="h-72 bg-slate-200 rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error / Not Found State
  if (error || !property) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-20 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 text-center shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-serif text-xl font-bold text-[#142533]">
              Authority Property Not Available
            </h2>
            <p className="text-sm text-slate-600">
              {error || 'The requested property could not be found.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#D89B30]" />
              <span>Back to Authority Properties</span>
            </button>
            <button
              type="button"
              onClick={fetchDetail}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#142533] text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-[#D89B30]" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusLabelAndColor(property.status);
  const currentImage = validImages[activeImageIndex] || validImages[0] || null;

  // Prepare strictly backend-present fields for each required section (A through J)
  // A. Authority Information
  const auth = property.authority;
  const hasAuthoritySection = Boolean(
    auth &&
      (auth.name ||
        auth.short_name ||
        auth.state ||
        auth.city ||
        auth.description)
  );

  // B. Property Information
  const propertyInfoRows: { label: string; value: string }[] = [
    property.title ? { label: 'Property Title', value: property.title } : null,
    property.property_code ? { label: 'Property Code', value: property.property_code } : null,
    property.property_type ? { label: 'Property Type', value: property.property_type } : null,
    property.property_sub_type ? { label: 'Property Sub Type', value: property.property_sub_type } : null,
    property.listing_source ? { label: 'Listing Source', value: property.listing_source } : null,
    property.scheme_name ? { label: 'Scheme Name', value: property.scheme_name } : null,
    statusInfo.label ? { label: 'Property Status', value: statusInfo.label } : null,
    { label: 'Published Status', value: property.is_published ? 'Published' : 'Unpublished' },
  ].filter(Boolean) as { label: string; value: string }[];

  // C. Location Details
  const locationRows: { label: string; value: string }[] = [
    property.state_name ? { label: 'State', value: property.state_name } : null,
    property.city_name ? { label: 'City', value: property.city_name } : null,
    property.address ? { label: 'Complete Address', value: property.address } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const mapQueryParts = [property.address, property.city_name, property.state_name].filter(Boolean);
  const googleMapsUrl =
    mapQueryParts.length > 0
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQueryParts.join(', '))}`
      : '';

  // D. Area Details
  const hasAreaDetails =
    (property.area !== null && property.area !== undefined) || Boolean(property.area_unit);

  // E. Financial Details
  const hasReservePrice = property.reserve_price !== null && property.reserve_price !== undefined;
  const hasEmdAmount = property.emd_amount !== null && property.emd_amount !== undefined;
  const emdSubmissionFormatted = formatFullDateTime(property.emd_submission_at);
  const financialRows: { label: string; value: string; isCurrency?: boolean }[] = [
    property.reserve_price_basis
      ? { label: 'Reserve Price Basis', value: property.reserve_price_basis }
      : null,
    hasReservePrice
      ? { label: 'Reserve Price', value: formatINR(property.reserve_price!), isCurrency: true }
      : null,
    hasEmdAmount
      ? { label: 'EMD Amount', value: formatINR(property.emd_amount!), isCurrency: true }
      : null,
    emdSubmissionFormatted
      ? { label: 'EMD Submission Date', value: emdSubmissionFormatted }
      : null,
  ].filter(Boolean) as { label: string; value: string; isCurrency?: boolean }[];

  // F. Auction Information
  const auctionStartFormatted = formatFullDateTime(property.auction_start_at);
  const auctionEndFormatted = formatFullDateTime(property.auction_end_at);
  const auctionRows: { label: string; value: string }[] = [
    auctionStartFormatted ? { label: 'Auction Start Date', value: auctionStartFormatted } : null,
    auctionEndFormatted ? { label: 'Auction End Date', value: auctionEndFormatted } : null,
    property.auction_platform ? { label: 'Auction Platform', value: property.auction_platform } : null,
    property.seller_type ? { label: 'Seller Type', value: property.seller_type } : null,
    property.seller_name ? { label: 'Seller Name', value: property.seller_name } : null,
    property.inspection_details ? { label: 'Inspection Details', value: property.inspection_details } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const cleanWhatsapp = (settings.whatsapp_number || settings.primary_phone || '').replace(/[^0-9]/g, '');

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-[#142533] pb-20">
      {/* Breadcrumb Bar */}
      <div className="w-full bg-[#142533] text-white border-b border-white/10 py-3">
        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300 min-w-0">
            <button
              type="button"
              onClick={() => onNavigate('home', '/')}
              className="flex items-center gap-1.5 hover:text-[#D89B30] transition-colors shrink-0 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-[#D89B30]" />
              <span>Home</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
            <button
              type="button"
              onClick={onBack}
              className="hover:text-[#D89B30] transition-colors shrink-0 cursor-pointer"
            >
              Authority Properties
            </button>
            {auth?.name && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-500 hidden sm:inline-block shrink-0" />
                <button
                  type="button"
                  onClick={() => onSelectAuthority(auth.id)}
                  className="text-[#D89B30] hover:underline hidden sm:inline-block truncate max-w-[180px] cursor-pointer"
                >
                  {auth.short_name || auth.name}
                </button>
              </>
            )}
            {property.title && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-500 hidden md:inline-block shrink-0" />
                <span className="text-slate-400 truncate max-w-[220px] hidden md:inline-block">
                  {property.title}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#D89B30]" />
              <span>Back to Listings</span>
            </button>

            <button
              type="button"
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors cursor-pointer"
              title="Copy direct property URL"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#D89B30]" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Top Property Identity Banner */}
      <section className="bg-gradient-to-b from-[#F5EFE6] via-[#FAF8F5] to-white border-b border-[#E8E2D5] py-6 sm:py-8">
        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3 max-w-4xl">
              {/* Unboxed Metadata Line */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium">
                {auth?.name && (
                  <button
                    type="button"
                    onClick={() => onSelectAuthority(auth.id)}
                    className="inline-flex items-center gap-1.5 font-bold text-[#9A6007] hover:text-[#142533] transition-colors cursor-pointer"
                  >
                    <Landmark className="w-3.5 h-3.5 text-[#D89B30]" />
                    <span>
                      {auth.name}
                      {auth.short_name ? ` (${auth.short_name})` : ''}
                    </span>
                  </button>
                )}
                {auth?.name && (property.property_type || property.property_sub_type || statusInfo.label) && (
                  <span aria-hidden="true">·</span>
                )}
                {property.property_type && <span>{property.property_type}</span>}
                {property.property_type && property.property_sub_type && <span aria-hidden="true">/</span>}
                {property.property_sub_type && <span>{property.property_sub_type}</span>}
                {(property.property_type || property.property_sub_type) && statusInfo.label && (
                  <span aria-hidden="true">·</span>
                )}
                {statusInfo.label && (
                  <span className={`font-bold ${statusInfo.textClass}`}>
                    Status: {statusInfo.label}
                  </span>
                )}
              </div>

              {/* Property Title */}
              {property.title && (
                <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#142533] tracking-tight leading-tight">
                  {property.title}
                </h1>
              )}

              {/* Code, Scheme & Location Quick Meta */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-600 pt-1">
                {property.property_code && (
                  <span className="font-mono text-slate-700">
                    Property Code: <strong className="text-[#142533]">{property.property_code}</strong>
                  </span>
                )}
                {property.scheme_name && (
                  <span>
                    Scheme: <strong className="text-[#142533]">{property.scheme_name}</strong>
                  </span>
                )}
                {(property.city_name || property.state_name) && (
                  <span className="inline-flex items-center gap-1.5 text-slate-700">
                    <MapPin className="w-4 h-4 text-[#D89B30] shrink-0" />
                    <span>{[property.city_name, property.state_name].filter(Boolean).join(', ')}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Key Price Highlight & Direct Enquiry Action */}
            <div className="bg-white rounded-2xl border border-[#E2DDD2] p-5 shadow-xs shrink-0 min-w-[260px] space-y-3">
              {hasReservePrice && (
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                    Reserve Price
                  </span>
                  <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#142533] tabular-nums">
                    {formatINR(property.reserve_price!)}
                  </span>
                </div>
              )}
              {hasEmdAmount && (
                <div className={hasReservePrice ? 'pt-2 border-t border-slate-100' : ''}>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    EMD Amount
                  </span>
                  <span className="font-mono text-sm font-bold text-[#9A6007] tabular-nums">
                    {formatINR(property.emd_amount!)}
                  </span>
                </div>
              )}
              <div className={hasReservePrice || hasEmdAmount ? 'pt-2 border-t border-slate-100' : ''}>
                <button
                  type="button"
                  onClick={() => openAuthorityEnquiryModal(property)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#D89B30] hover:bg-[#C58920] text-[#142533] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  <span>Enquire Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Two-Column Detail Body */}
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 pt-8 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 8 Columns: Gallery + Sections B, C, D, E, F, H, I, J */}
          <div className="lg:col-span-8 space-y-8">
            {/* G. Property Images Gallery */}
            <section aria-label="Property Images" className="space-y-3">
              <div className="relative rounded-3xl overflow-hidden bg-[#142533] aspect-16/10 border border-[#E2DDD2] shadow-sm group">
                {currentImage ? (
                  <>
                    <img
                      src={currentImage.image_url}
                      alt={currentImage.alt_text || property.title || 'Property Photograph'}
                      referrerPolicy="no-referrer"
                      onClick={() => setLightboxOpen(true)}
                      onError={() =>
                        setFailedImageIds((prev) => ({ ...prev, [currentImage.id]: true }))
                      }
                      className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-102"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/15 pointer-events-none" />
                    <PropertyWatermark variant="corner" position="top-right" size="md" />

                    {/* Top Left Image Count */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
                      <span className="px-3 py-1.5 rounded-xl bg-[#142533]/90 backdrop-blur-xs text-white text-xs font-mono font-semibold border border-white/15 tabular-nums">
                        Image {activeImageIndex + 1} of {validImages.length}
                      </span>
                    </div>

                    {/* Prev / Next Controls if multiple images */}
                    {validImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveImageIndex(
                              (prev) => (prev - 1 + validImages.length) % validImages.length
                            )
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 transition-colors cursor-pointer"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveImageIndex((prev) => (prev + 1) % validImages.length)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 transition-colors cursor-pointer"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {/* Bottom Full-Screen Button */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2">
                      <span className="text-xs text-white/90 font-medium truncate drop-shadow-xs">
                        {currentImage.alt_text || property.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => setLightboxOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black/75 hover:bg-[#142533] text-white text-xs font-semibold border border-white/20 backdrop-blur-xs transition-colors cursor-pointer shrink-0"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-[#D89B30]" />
                        <span>View Full Screen</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-slate-300">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-[#D89B30] mb-3">
                      <Landmark className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-semibold text-white">
                      No Property Photographs Uploaded
                    </p>
                  </div>
                )}
              </div>

              {/* Thumbnail Strip when > 1 image */}
              {validImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {validImages.map((img, idx) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-24 sm:w-28 h-16 sm:h-18 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        idx === activeImageIndex
                          ? 'border-[#D89B30] ring-2 ring-[#D89B30]/30'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt={img.alt_text || `Thumbnail ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedImageIds((prev) => ({ ...prev, [img.id]: true }))
                        }
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* B. Property Information */}
            {propertyInfoRows.length > 0 && (
              <section className="bg-white rounded-3xl border border-[#E2DDD2] p-6 sm:p-8 space-y-5 shadow-2xs">
                <div className="border-b border-[#F1EFEA] pb-3.5 flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-[#D89B30] shrink-0" />
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#142533]">
                    Property Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {propertyInfoRows.map((row) => (
                    <div
                      key={row.label}
                      className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2]"
                    >
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block">
                        {row.label}
                      </span>
                      <span className="text-sm font-bold text-[#142533] mt-1 block break-words">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {property.description && (
                  <div className="pt-3 border-t border-[#F1EFEA] space-y-1.5">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500 block">
                      Property Description
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {property.description}
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* C. Location Details & D. Area Details */}
            {(locationRows.length > 0 || hasAreaDetails) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* C. Location Details */}
                {locationRows.length > 0 && (
                  <section className="bg-white rounded-3xl border border-[#E2DDD2] p-6 space-y-4 shadow-2xs flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="border-b border-[#F1EFEA] pb-3 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#D89B30] shrink-0" />
                        <h2 className="font-serif text-lg sm:text-xl font-bold text-[#142533]">
                          Location Details
                        </h2>
                      </div>
                      <dl className="space-y-3 text-sm">
                        {locationRows.map((row) => (
                          <div key={row.label}>
                            <dt className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                              {row.label}
                            </dt>
                            <dd className="font-semibold text-[#142533] mt-0.5 break-words">
                              {row.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    {googleMapsUrl && (
                      <div className="pt-3 border-t border-[#F1EFEA]">
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9A6007] hover:text-[#142533] transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5 text-[#D89B30]" />
                          <span>View Location on Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </section>
                )}

                {/* D. Area Details */}
                {hasAreaDetails && (
                  <section className="bg-white rounded-3xl border border-[#E2DDD2] p-6 space-y-4 shadow-2xs">
                    <div className="border-b border-[#F1EFEA] pb-3 flex items-center gap-2">
                      <Maximize2 className="w-5 h-5 text-[#D89B30] shrink-0" />
                      <h2 className="font-serif text-lg sm:text-xl font-bold text-[#142533]">
                        Area Details
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {property.area !== null && property.area !== undefined && (
                        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2]">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block">
                            Area
                          </span>
                          <span className="text-lg font-extrabold text-[#142533] font-mono tabular-nums mt-1 block">
                            {property.area.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}

                      {property.area_unit && (
                        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2]">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block">
                            Area Unit
                          </span>
                          <span className="text-lg font-bold text-[#142533] mt-1 block">
                            {property.area_unit}
                          </span>
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* E. Financial Details & F. Auction Information */}
            {(financialRows.length > 0 || auctionRows.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* E. Financial Details */}
                {financialRows.length > 0 && (
                  <section className="bg-white rounded-3xl border border-[#E2DDD2] p-6 space-y-4 shadow-2xs">
                    <div className="border-b border-[#F1EFEA] pb-3 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#D89B30] shrink-0" />
                      <h2 className="font-serif text-lg sm:text-xl font-bold text-[#142533]">
                        Financial Details
                      </h2>
                    </div>

                    <div className="divide-y divide-[#F1EFEA] text-sm">
                      {financialRows.map((row) => (
                        <div key={row.label} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                          <span className="text-xs text-slate-500 font-medium">{row.label}</span>
                          <span
                            className={`font-bold text-[#142533] text-right ${
                              row.isCurrency ? 'font-mono tabular-nums text-base' : 'text-xs font-mono tabular-nums'
                            }`}
                          >
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* F. Auction Information */}
                {auctionRows.length > 0 && (
                  <section className="bg-white rounded-3xl border border-[#E2DDD2] p-6 space-y-4 shadow-2xs">
                    <div className="border-b border-[#F1EFEA] pb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#D89B30] shrink-0" />
                      <h2 className="font-serif text-lg sm:text-xl font-bold text-[#142533]">
                        Auction Information
                      </h2>
                    </div>

                    <div className="divide-y divide-[#F1EFEA] text-sm">
                      {auctionRows.map((row) => (
                        <div key={row.label} className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
                          <span className="text-xs text-slate-500 font-medium shrink-0">{row.label}</span>
                          <span className="font-bold text-[#142533] text-xs font-mono tabular-nums sm:text-right break-words">
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* H. Documents (Strictly public documents returned by backend) */}
            {property.documents.length > 0 && (
              <section className="bg-white rounded-3xl border border-[#E2DDD2] p-6 sm:p-8 space-y-5 shadow-2xs">
                <div className="border-b border-[#F1EFEA] pb-3.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-[#D89B30] shrink-0" />
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#142533]">
                      Documents ({property.documents.length})
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {property.documents.map((doc) => {
                    const formattedType = formatDocumentType(doc.document_type);
                    return (
                      <div
                        key={doc.id}
                        className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2] flex flex-col justify-between gap-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-[#E2DDD2] text-[#9A6007] flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-[#142533] break-words">
                              {doc.title}
                            </h3>
                            {formattedType && (
                              <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                                Type: {formattedType}
                              </span>
                            )}
                          </div>
                        </div>

                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="w-full py-2.5 px-4 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-[#D89B30]" />
                          <span>Download Document</span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* I. Amenities */}
            {property.amenities.length > 0 && (
              <section className="bg-white rounded-3xl border border-[#E2DDD2] p-6 sm:p-8 space-y-5 shadow-2xs">
                <div className="border-b border-[#F1EFEA] pb-3.5 flex items-center gap-2.5">
                  <MapPin className="w-5 h-5 text-[#D89B30] shrink-0" />
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#142533]">
                    Amenities &amp; Proximity
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {property.amenities.map((amenity) => {
                    const hasDistance =
                      amenity.distance_km !== null &&
                      amenity.distance_km !== undefined &&
                      String(amenity.distance_km).trim() !== '';
                    return (
                      <div
                        key={amenity.id}
                        className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2] space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-bold text-[#142533]">{amenity.name}</h3>
                            {amenity.category && (
                              <span className="text-[11px] text-slate-500 capitalize block">
                                Category: {amenity.category.replace(/[_-]+/g, ' ')}
                              </span>
                            )}
                          </div>
                          {hasDistance && (
                            <span className="font-mono text-xs font-bold text-[#9A6007] tabular-nums shrink-0">
                              {Number(amenity.distance_km).toLocaleString('en-IN', {
                                maximumFractionDigits: 2,
                              })}{' '}
                              km
                            </span>
                          )}
                        </div>

                        {amenity.description && (
                          <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-[#EAE3D2]/70">
                            {amenity.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* J. Payment Milestones Table */}
            {property.payment_milestones.length > 0 && (
              <section className="bg-white rounded-3xl border border-[#E2DDD2] p-6 sm:p-8 space-y-5 shadow-2xs">
                <div className="border-b border-[#F1EFEA] pb-3.5 flex items-center gap-2.5">
                  <CreditCard className="w-5 h-5 text-[#D89B30] shrink-0" />
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#142533]">
                    Payment Milestones
                  </h2>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-[#EAE3D2]">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-[#FAF8F5] border-b border-[#EAE3D2] text-[11px] font-mono uppercase tracking-wider text-slate-500">
                        <th className="py-3.5 px-4">Milestone Title</th>
                        <th className="py-3.5 px-4 text-right">Amount</th>
                        <th className="py-3.5 px-4 text-right">Percentage</th>
                        <th className="py-3.5 px-4 text-right">Due Days</th>
                        <th className="py-3.5 px-4">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1EFEA]">
                      {property.payment_milestones.map((ms) => (
                        <tr key={ms.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-[#142533]">{ms.title}</td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#142533] tabular-nums">
                            {ms.amount !== null && ms.amount !== undefined
                              ? formatINR(Number(ms.amount))
                              : '—'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#9A6007] tabular-nums">
                            {ms.percentage !== null && ms.percentage !== undefined
                              ? `${Number(ms.percentage).toLocaleString('en-IN', {
                                  maximumFractionDigits: 2,
                                })}%`
                              : '—'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-700 tabular-nums">
                            {ms.due_days !== null && ms.due_days !== undefined
                              ? `${ms.due_days} ${Number(ms.due_days) === 1 ? 'Day' : 'Days'}`
                              : '—'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 text-xs">
                            {ms.description || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          {/* Right 4 Columns: Section A (Authority Information) + Advisory Desk */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* A. Authority Information */}
            {hasAuthoritySection && auth && (
              <section className="bg-white rounded-3xl border border-[#E2DDD2] p-6 space-y-4 shadow-2xs">
                <div className="border-b border-[#F1EFEA] pb-3.5 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF1DE] text-[#9A6007] flex items-center justify-center shrink-0">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                      Issuing Statutory Body
                    </span>
                    <h2 className="font-serif text-lg font-bold text-[#142533] leading-tight">
                      Authority Information
                    </h2>
                  </div>
                </div>

                <dl className="space-y-3 text-xs">
                  {auth.name && (
                    <div>
                      <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        Authority Name
                      </dt>
                      <dd className="text-sm font-bold text-[#142533] mt-0.5">{auth.name}</dd>
                    </div>
                  )}

                  {auth.short_name && (
                    <div>
                      <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        Short Name
                      </dt>
                      <dd className="font-mono font-bold text-[#9A6007] mt-0.5">{auth.short_name}</dd>
                    </div>
                  )}

                  {auth.state && (
                    <div>
                      <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        State
                      </dt>
                      <dd className="font-semibold text-[#142533] mt-0.5">{auth.state}</dd>
                    </div>
                  )}

                  {auth.city && (
                    <div>
                      <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        City
                      </dt>
                      <dd className="font-semibold text-[#142533] mt-0.5">{auth.city}</dd>
                    </div>
                  )}

                  {auth.description && (
                    <div className="pt-2 border-t border-[#F1EFEA]">
                      <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        Description
                      </dt>
                      <dd className="text-slate-600 leading-relaxed mt-1 whitespace-pre-line">
                        {auth.description}
                      </dd>
                    </div>
                  )}
                </dl>

                {auth.id > 0 && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onSelectAuthority(auth.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#FAF1DE] hover:bg-[#F3E2BD] border border-[#D89B30]/40 text-[#9A6007] hover:text-[#142533] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>
                        View All {auth.short_name || auth.name} Properties
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Investor Assistance & Contact Card */}
            <section className="bg-[#142533] text-white rounded-3xl p-6 space-y-5 border border-white/10 shadow-lg">
              <div className="border-b border-white/10 pb-3.5 space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#D89B30] block">
                  Investor Assistance
                </span>
                <h3 className="font-serif text-lg font-bold text-white">
                  Bidding &amp; Documentation Desk
                </h3>
              </div>

              {(hasReservePrice || hasEmdAmount || auctionStartFormatted || auctionEndFormatted) && (
                <div className="space-y-2 text-xs border-b border-white/10 pb-4">
                  {hasReservePrice && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-300">Reserve Price:</span>
                      <span className="font-mono font-bold text-white tabular-nums text-sm">
                        {formatINR(property.reserve_price!)}
                      </span>
                    </div>
                  )}
                  {hasEmdAmount && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-300">EMD Amount:</span>
                      <span className="font-mono font-bold text-[#D89B30] tabular-nums">
                        {formatINR(property.emd_amount!)}
                      </span>
                    </div>
                  )}
                  {auctionStartFormatted && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-300">Auction Start:</span>
                      <span className="font-mono text-white tabular-nums text-[11px]">
                        {auctionStartFormatted}
                      </span>
                    </div>
                  )}
                  {auctionEndFormatted && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-300">Auction End:</span>
                      <span className="font-mono text-white tabular-nums text-[11px]">
                        {auctionEndFormatted}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => openAuthorityEnquiryModal(property)}
                  className="w-full py-3 px-4 rounded-xl bg-[#D89B30] hover:bg-[#C58920] text-[#142533] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  <span>Enquire About This Property</span>
                </button>

                {settings.primary_phone && (
                  <a
                    href={`tel:${settings.primary_phone.replace(/\s+/g, '')}`}
                    className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-[#D89B30]" />
                    <span className="font-mono">{settings.primary_phone}</span>
                  </a>
                )}

                {cleanWhatsapp && (
                  <a
                    href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                      `Hello, I am interested in Authority Property: ${property.title}${
                        property.property_code ? ` (Code: ${property.property_code})` : ''
                      }`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Advisory Desk</span>
                  </a>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Full-Screen Image Lightbox Modal */}
      {lightboxOpen && currentImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xs flex flex-col justify-between p-4 sm:p-6 select-none"
          onClick={() => {
            setLightboxOpen(false);
            setLightboxZoomed(false);
          }}
        >
          {/* Top Lightbox Controls */}
          <div
            className="flex items-center justify-between gap-4 text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0">
              <span className="text-xs font-mono text-[#D89B30] tabular-nums block">
                Image {activeImageIndex + 1} of {validImages.length}
              </span>
              <h4 className="text-sm sm:text-base font-semibold text-white truncate">
                {currentImage.alt_text || property.title}
              </h4>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setLightboxZoomed((z) => !z)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title={lightboxZoomed ? 'Zoom Out' : 'Zoom In'}
                aria-label={lightboxZoomed ? 'Zoom Out' : 'Zoom In'}
              >
                {lightboxZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setLightboxOpen(false);
                  setLightboxZoomed(false);
                }}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                title="Close full-screen view (Esc)"
                aria-label="Close full-screen view"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Image Stage */}
          <div
            className="relative flex-1 flex items-center justify-center overflow-auto my-4"
            onClick={(e) => e.stopPropagation()}
          >
            {validImages.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  setActiveImageIndex(
                    (prev) => (prev - 1 + validImages.length) % validImages.length
                  );
                  setLightboxZoomed(false);
                }}
                className="absolute left-2 sm:left-6 z-10 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={currentImage.image_url}
              alt={currentImage.alt_text || property.title}
              referrerPolicy="no-referrer"
              onClick={() => setLightboxZoomed((z) => !z)}
              className={`max-h-[78vh] max-w-full object-contain rounded-lg transition-transform duration-200 ${
                lightboxZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
              }`}
            />

            {validImages.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  setActiveImageIndex((prev) => (prev + 1) % validImages.length);
                  setLightboxZoomed(false);
                }}
                className="absolute right-2 sm:right-6 z-10 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails in Lightbox */}
          {validImages.length > 1 && (
            <div
              className="flex items-center justify-center gap-2.5 overflow-x-auto py-1"
              onClick={(e) => e.stopPropagation()}
            >
              {validImages.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => {
                    setActiveImageIndex(idx);
                    setLightboxZoomed(false);
                  }}
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    idx === activeImageIndex
                      ? 'border-[#D89B30] opacity-100'
                      : 'border-transparent opacity-50 hover:opacity-90'
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt={img.alt_text || `Photo ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
