import React, { useState, useEffect } from 'react';
import { Property, PropertyDocument } from '../../types';
import { formatINR, calculateDiscount } from '../../utils/storage';
import { useApi } from '../../context/ApiContext';
import { getPropertyById } from '../../services/api';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Building,
  CheckCircle2,
  Calendar,
  Phone,
  FileText,
  Download,
  Share2,
  Bell,
  ArrowRight,
  MessageSquare,
  Gavel,
  ChevronRight,
  Home,
  Check,
  ExternalLink,
  Play,
  Video,
  Landmark,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { PageRoute } from '../Navbar';
import { AuctionCtaBanner } from '../AuctionCtaBanner';
import { SharePropertyModal } from '../SharePropertyModal';
import { PropertyWatermark } from '../PropertyWatermark';
import { getPropertyFallbackImage } from '../../data/fallbackImages';
import { PropertyVideoPlayer } from '../PropertyVideoPlayer';
import { getYouTubeWatchUrl } from '../../utils/videoUtils';

interface PropertyDetailPageProps {
  property?: Property | null;
  propertyIdOrSlug?: string;
  isLoading?: boolean;
  notFound?: boolean;
  onBack: () => void;
  onExpressInterest: (property: Property) => void;
  onSelectRelatedProperty: (property: Property) => void;
  onNavigate: (page: PageRoute, customUrl?: string) => void;
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  property: initialProperty,
  propertyIdOrSlug,
  isLoading: initialLoading = false,
  notFound: initialNotFound = false,
  onBack,
  onExpressInterest,
  onSelectRelatedProperty,
  onNavigate,
}) => {
  const [property, setProperty] = useState<Property | null>(initialProperty || null);
  const [internalLoading, setInternalLoading] = useState<boolean>(!initialProperty && Boolean(propertyIdOrSlug));
  const [internalNotFound, setInternalNotFound] = useState<boolean>(initialNotFound);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copiedToast, setCopiedToast] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const { properties: apiProperties, settings } = useApi();
  const primaryPhone = settings?.primary_phone || '';
  const whatsappNumber = settings?.whatsapp_number || '';

  // Synchronize initial property or fetch complete property record by id/slug from API
  useEffect(() => {
    if (initialProperty) {
      setProperty(initialProperty);
      setInternalLoading(false);
      setInternalNotFound(false);
      setSelectedImageIndex(0);

      if (initialProperty.id) {
        getPropertyById(initialProperty.id).then((res) => {
          if (res?.success && res?.property) {
            setProperty(res.property);
          }
        });
      }
    } else if (propertyIdOrSlug) {
      setInternalLoading(true);
      setInternalNotFound(false);
      getPropertyById(propertyIdOrSlug)
        .then((res) => {
          setInternalLoading(false);
          if (res?.success && res?.property) {
            setProperty(res.property);
          } else {
            setInternalNotFound(true);
          }
        })
        .catch(() => {
          setInternalLoading(false);
          setInternalNotFound(true);
        });
    }
  }, [initialProperty, propertyIdOrSlug]);

  const isLoading = initialLoading || internalLoading;
  const isNotFound = initialNotFound || internalNotFound || (!property && !isLoading);

  if (isLoading) {
    return (
      <div className="w-full min-h-[65vh] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-48 mb-6" />
        <div className="space-y-3">
          <div className="h-8 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-16/10 bg-slate-200 rounded-2xl" />
            <div className="grid grid-cols-4 gap-3">
              <div className="h-20 bg-slate-200 rounded-xl" />
              <div className="h-20 bg-slate-200 rounded-xl" />
              <div className="h-20 bg-slate-200 rounded-xl" />
              <div className="h-20 bg-slate-200 rounded-xl" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-64 bg-slate-200 rounded-2xl" />
            <div className="h-48 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isNotFound || !property) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-xl w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Listing Not Found</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#142533] font-serif-title">
              Auction Property Not Available
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              The property <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-800">{propertyIdOrSlug || 'requested'}</span> could not be found or has concluded. Please explore our active inventory.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onBack}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Properties</span>
            </button>
            <button
              onClick={() => onNavigate('property', '/properties')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#D89B30] hover:bg-[#c58920] text-[#142533] font-semibold text-sm transition-all shadow-md cursor-pointer"
            >
              <Building className="w-4 h-4" />
              <span>Browse All Bank Auctions</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Actual market estimate from the API (only if explicitly provided)
  const rawMarketEstimate = Number(
    property.raw?.market_estimate || property.raw?.market_value || 0
  );
  const hasRealMarketEstimate = rawMarketEstimate > property.reservePrice;
  const discountPercent = hasRealMarketEstimate
    ? calculateDiscount(property.reservePrice, rawMarketEstimate)
    : 0;
  const savingsAmount = hasRealMarketEstimate ? rawMarketEstimate - property.reservePrice : 0;

  // Post-Auction / Bank Sale Price from API
  const rawPostAuctionPrice =
    property.postAuctionPrice !== undefined && property.postAuctionPrice !== null
      ? Number(property.postAuctionPrice)
      : (property.raw?.post_auction_price !== undefined && property.raw?.post_auction_price !== null && property.raw?.post_auction_price !== ''
          ? Number(property.raw.post_auction_price)
          : undefined);

  const hasPostAuctionPrice = Boolean(
    rawPostAuctionPrice !== undefined &&
    !isNaN(rawPostAuctionPrice) &&
    rawPostAuctionPrice > 0
  );
  const postAuctionPriceValue = hasPostAuctionPrice ? rawPostAuctionPrice! : 0;

  const rawPostAuctionDate =
    property.postAuctionPriceDate ||
    property.raw?.post_auction_price_date ||
    undefined;

  // Format date as "DD MMM YYYY" (e.g. 15 Oct 2024)
  const formatPostAuctionDate = (dateStr?: string) => {
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
  const formattedPostAuctionDate = formatPostAuctionDate(rawPostAuctionDate);

  // Real countdown logic based on actual auction date from API
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const hasValidAuctionDate = Boolean(property.auctionDate && !isNaN(new Date(property.auctionDate).getTime()));

  useEffect(() => {
    if (!hasValidAuctionDate) {
      setTimeLeft(null);
      return;
    }

    const updateCountdown = () => {
      const target = new Date(property.auctionDate).getTime();
      const diff = Math.max(0, target - Date.now());
      if (diff === 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [property.auctionDate, hasValidAuctionDate]);

  // Real location formatting using actual API values
  const addressParts = [
    property.location?.address?.trim(),
    property.areaName || property.location?.locality?.trim(),
    property.cityName || property.location?.city?.trim(),
    property.stateName || property.location?.state?.trim(),
    property.location?.pinCode?.trim(),
  ].filter(Boolean);
  const formattedAddress = Array.from(new Set(addressParts)).join(', ');

  // Direct Google Maps redirect from backend or address search query
  const googleMapsHref =
    property.googleMapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      formattedAddress || [property.location?.address, property.location?.city, property.location?.state].filter(Boolean).join(', ')
    )}`;

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  // Find comparable properties from actual API data
  const relatedProperties = apiProperties
    .filter((p) => p.id !== property.id)
    .filter((p) => p.category === property.category || p.location.city === property.location.city)
    .slice(0, 3);

  // Documents from API
  const propertyDocs: PropertyDocument[] = property.documents || [];

  // Primary YouTube video URL (for click-to-redirect to YouTube)
  const primaryVideo = property.videos && property.videos.length > 0 ? property.videos[0] : null;
  const primaryVideoUrl = primaryVideo
    ? getYouTubeWatchUrl(primaryVideo.video_url || primaryVideo.video_path)
    : '';

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-slate-800 pb-16 selection:bg-[#D89B30]/30">
      {/* 1. ARCHITECTURAL BREADCRUMB BAR */}
      <div className="w-full bg-[#142533] text-white border-b border-white/10 py-3">
        <div className="w-full max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-12 xl:px-16 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-1.5 hover:text-[#D89B30] transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-[#D89B30]" />
              <span>Home</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-500" />
            <button
              onClick={onBack}
              className="hover:text-[#D89B30] transition-colors cursor-pointer"
            >
              Auction Inventory
            </button>
            {property.auctionCategory && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-500 hidden sm:inline-block" />
                <span className="text-[#D89B30] font-mono hidden sm:inline-block">
                  {property.auctionCategory} Auction
                </span>
              </>
            )}
            <ChevronRight className="w-3 h-3 text-slate-500 hidden sm:inline-block" />
            <span className="text-slate-400 font-mono truncate max-w-[200px] sm:max-w-xs">{property.title}</span>
          </div>

          <div className="flex items-center gap-2.5">
            {property.auctionCategory && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300">
                <Gavel className="w-3.5 h-3.5 text-[#D89B30]" />
                <span>{property.auctionCategory} Auction</span>
              </div>
            )}

            {primaryVideoUrl && (
              <a
                href={primaryVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 transition-all cursor-pointer shadow-xs"
                title="Watch on YouTube"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            )}

            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#D89B30]" />
              <span>Back to Listings</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-all cursor-pointer"
              title="Share Property"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TOP HERO HEADER */}
      <section className="relative w-full bg-gradient-to-b from-[#F5EFE6] via-[#FAF8F5] to-white border-b border-[#E8E2D5] py-6 sm:py-8">
        <div className="w-full max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left 8 cols: Property Identity & Dynamic Badges */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                {property.auctionCategory && (
                  <span className="px-3 py-1.5 rounded-lg bg-[#FAF1DE] border border-[#F3DFB4] text-[#9A6007] text-xs font-mono font-bold flex items-center gap-1.5">
                    <Gavel className="w-3.5 h-3.5 text-[#9A6007]" />
                    <span>{property.auctionCategory}</span>
                  </span>
                )}
                {property.propertyType && (
                  <span className="px-3 py-1.5 rounded-lg bg-white border border-[#D5CEBF] text-[#142533] text-xs font-semibold shadow-2xs">
                    {property.propertyType}
                  </span>
                )}
                {property.propertySubType && (
                  <span className="px-3 py-1.5 rounded-lg bg-white border border-[#D5CEBF] text-slate-600 text-xs font-medium shadow-2xs">
                    {property.propertySubType}
                  </span>
                )}
                {primaryVideoUrl && (
                  <a
                    href={primaryVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-red-100 transition-colors shadow-2xs"
                    title="Watch property video tour on YouTube"
                  >
                    <Play className="w-3 h-3 fill-red-600 text-red-600" />
                    <span>Watch on YouTube</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
                {property.status === 'live-today' ? (
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold font-mono flex items-center gap-1.5 animate-pulse shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>LIVE E-AUCTION TODAY</span>
                  </span>
                ) : property.auctionDate ? (
                  <span className="px-3 py-1.5 rounded-lg bg-[#FAF1DE] border border-[#F3DFB4] text-[#9A6007] text-xs font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#9A6007]" />
                    <span>
                      Auction Date:{' '}
                      {new Date(property.auctionDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </span>
                ) : null}
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#142533] tracking-tight leading-tight">
                {property.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-600">
                {formattedAddress && (
                  <>
                    <a
                      href={googleMapsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 font-medium text-slate-700 hover:text-[#D89B30] transition-colors group cursor-pointer"
                      title="Open location in Google Maps"
                    >
                      <MapPin className="w-4 h-4 text-[#D89B30] group-hover:scale-110 transition-transform shrink-0" />
                      <span className="underline decoration-dotted decoration-slate-300 underline-offset-4 group-hover:decoration-[#D89B30]">
                        {formattedAddress}
                      </span>
                      <ExternalLink className="w-3 h-3 text-[#D89B30] opacity-70 group-hover:opacity-100 shrink-0" />
                    </a>
                    <span className="text-slate-300 hidden sm:inline">|</span>
                  </>
                )}
                <span className="flex items-center gap-1.5 font-mono text-slate-500">
                  <span>{property.propertyReferenceNo ? `Ref No: ${property.propertyReferenceNo}` : `Property ID: ${property.id}`}</span>
                </span>
                {property.auctionReferenceNo && (
                  <>
                    <span className="text-slate-300 hidden sm:inline">|</span>
                    <span className="flex items-center gap-1.5 font-mono text-slate-500">
                      <span>Auction Ref: {property.auctionReferenceNo}</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right 4 cols: High-Impact Pricing Snapshot Box */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E2DDD2] p-6 shadow-md flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1EFEA] pb-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  {hasPostAuctionPrice ? 'Auction & Bank Sale Pricing' : 'Price'}
                </span>
                {hasPostAuctionPrice ? (
                  <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-[#FAF1DE] text-[#9A6007] border border-[#D89B30]/40 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#D89B30]" />
                    <span>Direct Bank Sale</span>
                  </span>
                ) : hasRealMarketEstimate && discountPercent > 0 ? (
                  <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Save ~{discountPercent}%
                  </span>
                ) : property.propertyStatus ? (
                  <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                    {property.propertyStatus}
                  </span>
                ) : null}
              </div>

              {/* Price Details */}
              {hasPostAuctionPrice ? (
                <div className="space-y-3">
                  {/* Post-Auction / Bank Sale Price Card with cut-through Reserve Price */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF8F5] via-[#FFFDF9] to-[#FAF1DE]/50 border-2 border-[#D89B30]/60 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-mono font-extrabold uppercase tracking-wide text-[#9A6007]">
                        Post-Auction / Bank Sale Price
                      </span>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-[#D89B30] text-[#142533]">
                        OFFER
                      </span>
                    </div>

                    <div className="flex items-baseline flex-wrap gap-2.5">
                      <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#142533]">
                        {formatINR(postAuctionPriceValue)}
                      </span>
                      {property.reservePrice > 0 && (
                        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-xs sm:text-sm">
                          <span>Reserve:</span>
                          <span className="line-through font-semibold text-slate-400 text-sm sm:text-base decoration-red-500/80 decoration-1 sm:decoration-2">
                            {formatINR(property.reservePrice)}
                          </span>
                        </div>
                      )}
                    </div>

                    {property.reservePrice > postAuctionPriceValue && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                        <span>Save {formatINR(property.reservePrice - postAuctionPriceValue)}</span>
                        <span className="text-[11px] font-normal text-emerald-700">
                          (~{Math.round(((property.reservePrice - postAuctionPriceValue) / property.reservePrice) * 100)}% below Reserve)
                        </span>
                      </div>
                    )}

                    {formattedPostAuctionDate && (
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-[#D89B30]/20 font-mono text-slate-600">
                        <span className="text-[11px] text-slate-500">Price Updated/Offered On:</span>
                        <span className="font-bold text-[#142533]">{formattedPostAuctionDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="font-serif text-3xl sm:text-4xl font-extrabold text-[#142533]">
                    {property.reservePrice > 0 ? formatINR(property.reservePrice) : 'Price on Request'}
                  </div>
                  {hasRealMarketEstimate && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 line-through">Market Est: {formatINR(rawMarketEstimate)}</span>
                      <span className="text-emerald-700 font-bold">
                        (₹{((rawMarketEstimate - property.reservePrice) / 10000000).toFixed(2)} Cr Below Market)
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#F1EFEA] text-xs">
                {property.emdAmount > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">EMD Amount</span>
                    <span className="font-bold text-[#9A6007] font-mono">{formatINR(property.emdAmount)}</span>
                  </div>
                )}
                {property.emdDeadline && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">EMD Deadline</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {new Date(property.emdDeadline).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>

              <button
                id={`btn-hero-express-interest-${property.id}`}
                onClick={() => onExpressInterest(property)}
                className="w-full py-3.5 px-4 rounded-xl bg-[#D89B30] hover:bg-[#C58920] text-[#142533] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span>Express Interest &amp; Enquire</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN DOSSIER BODY & SPLIT COLUMNS */}
      <main className="w-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 py-10 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column (8 cols): Visual Gallery, Verification Tabs & Specifications */}
          <div className="lg:col-span-8 space-y-8">
            {/* Gallery Viewer */}
            <div className="space-y-3">
              <div className="rounded-3xl overflow-hidden bg-slate-900 aspect-16/10 relative border border-[#E2DDD2] shadow-lg group">
                {(() => {
                  const hasRealImages = property.images && property.images.length > 0;
                  const currentImg = hasRealImages
                    ? property.images[selectedImageIndex] || property.images[0]
                    : getPropertyFallbackImage(property.propertyType);

                  return (
                    <>
                      <img
                        src={currentImg}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                      {/* Official Brand Logo Watermark - Placed at Top-Right so it NEVER overlaps bottom address or top-left badges */}
                      <PropertyWatermark variant="corner" position="top-right" size="md" />

                      {/* Floating Top-Left Badges */}
                      <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                        {hasRealImages ? (
                          <span className="px-3 py-1.5 rounded-xl bg-[#142533]/90 backdrop-blur-md text-white text-xs font-mono font-bold border border-white/10 shadow-sm">
                            Photo {selectedImageIndex + 1} of {property.images.length}
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-[#142533]/90 backdrop-blur-md text-amber-300 text-xs font-mono font-bold border border-white/10 shadow-sm">
                            Representative Photo
                          </span>
                        )}
                      </div>
                    </>
                  );
                })()}

                {/* Floating Bottom Info Plate */}
                <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-black/60 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-white text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-4 h-4 text-[#D89B30] shrink-0" />
                    <span className="font-medium truncate">{formattedAddress || property.title}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <a
                      href={googleMapsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-[#D89B30] hover:bg-[#C58920] text-[#142533] font-bold text-[11px] flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                      title="Open location in Google Maps"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Open Map</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    {property.propertyType && (
                      <div className="font-mono text-slate-200 text-[11px]">
                        Type: {property.propertyType} {property.propertySubType ? `(${property.propertySubType})` : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Thumbnails Carousel */}
              {property.images && property.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
                  {property.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-24 sm:w-28 h-16 sm:h-18 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        selectedImageIndex === idx
                          ? 'border-[#D89B30] shadow-md ring-2 ring-[#D89B30]/30 scale-102'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Asset Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Video Tour (YouTube Embed / HTML5 Video Player) */}
            {property.videos && property.videos.length > 0 && (
              <PropertyVideoPlayer
                videos={property.videos}
                propertyTitle={property.title}
              />
            )}

            {/* Property Overview / Description (if provided by API) */}
            {property.description && property.description.trim() && (
              <div className="bg-white rounded-3xl border border-[#E2DDD2] p-6 sm:p-8 space-y-4 shadow-xs">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#142533]">
                  Property Overview &amp; Description
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}

            {/* Verified Listing Details */}
            <div className="bg-white rounded-3xl border border-[#E2DDD2] p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#F1EFEA] pb-4">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#142533]">
                  Listing Details &amp; Specifications
                </h3>
                {property.auctionCategory && (
                  <span className="text-xs font-mono font-bold text-[#9A6007]">
                    {property.auctionCategory}
                  </span>
                )}
              </div>

              {/* Post-Auction / Bank Sale Price Section - ONLY when valid */}
              {hasPostAuctionPrice && (
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#FAF8F5] via-white to-[#FAF1DE]/40 border-2 border-[#D89B30]/40 shadow-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-[#FAF1DE] text-[#9A6007] border border-[#D89B30]/30 shrink-0">
                        <Landmark className="w-4 h-4 text-[#D89B30]" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-base sm:text-lg text-[#142533]">
                          Post-Auction / Bank Sale Price
                        </h4>
                        <p className="text-xs text-slate-500">
                          Direct acquisition opportunity from bank post-auction under statutory mandate
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#142533] text-[#D89B30] text-xs font-mono font-bold">
                      Direct Bank Sale
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E8E2D5]">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                        Original Reserve Price
                      </span>
                      <span className="font-bold text-sm sm:text-base text-slate-400 line-through font-mono">
                        {property.reservePrice > 0 ? formatINR(property.reservePrice) : 'On Request'}
                      </span>
                    </div>

                    <div className="p-3 bg-[#FAF1DE]/60 rounded-xl border border-[#D89B30]/40">
                      <span className="text-[10px] uppercase font-bold text-[#9A6007] block font-mono">
                        Post-Auction / Bank Sale Price
                      </span>
                      <span className="font-extrabold text-base sm:text-lg text-[#142533] font-mono">
                        {formatINR(postAuctionPriceValue)}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                        Price Updated/Offered On
                      </span>
                      <span className="font-bold text-sm sm:text-base text-slate-800 font-mono">
                        {formattedPostAuctionDate || 'Active Mandate'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Area Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {property.totalArea ? (
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D5]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                      Total Area
                    </span>
                    <span className="font-bold text-sm sm:text-base text-[#142533] mt-0.5 block">
                      {property.totalArea.toLocaleString('en-IN')} {property.areaUnit || ''}
                    </span>
                  </div>
                ) : null}

                {property.builtUpArea ? (
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D5]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                      Built-Up Area
                    </span>
                    <span className="font-bold text-sm sm:text-base text-[#142533] mt-0.5 block">
                      {property.builtUpArea.toLocaleString('en-IN')} {property.areaUnit || 'sq.ft'}
                    </span>
                  </div>
                ) : null}

                {property.carpetAreaSqFt ? (
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D5]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                      Carpet Area
                    </span>
                    <span className="font-bold text-sm sm:text-base text-[#142533] mt-0.5 block">
                      {property.carpetAreaSqFt.toLocaleString('en-IN')} sq.ft
                    </span>
                  </div>
                ) : null}

                {property.propertyType && (
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D5]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                      Property Type
                    </span>
                    <span className="font-bold text-sm sm:text-base text-[#142533] mt-0.5 block">
                      {property.propertyType}
                    </span>
                  </div>
                )}
              </div>

              {/* Asset & Statutory Specifications Table */}
              <div className="border border-[#E8E2D5] rounded-2xl overflow-hidden text-xs">
                <div className="bg-[#FAF8F5] px-4 py-2.5 border-b border-[#E8E2D5] font-mono font-bold text-[11px] text-[#9A6007] uppercase">
                  Asset &amp; Statutory Parameters
                </div>
                <div className="divide-y divide-[#E8E2D5]">
                  {property.propertyReferenceNo && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 px-4 py-2.5">
                      <span className="text-slate-500 font-mono">Reference #</span>
                      <span className="col-span-2 sm:col-span-3 font-mono font-bold text-slate-800">{property.propertyReferenceNo}</span>
                    </div>
                  )}
                  {property.propertySubType && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 px-4 py-2.5">
                      <span className="text-slate-500 font-mono">Sub-Type</span>
                      <span className="col-span-2 sm:col-span-3 font-medium text-slate-800">{property.propertySubType}</span>
                    </div>
                  )}
                  {property.location?.city && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 px-4 py-2.5">
                      <span className="text-slate-500 font-mono">City / District</span>
                      <span className="col-span-2 sm:col-span-3 font-bold text-slate-800">{property.location.city}</span>
                    </div>
                  )}
                  {property.location?.state && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 px-4 py-2.5">
                      <span className="text-slate-500 font-mono">State</span>
                      <span className="col-span-2 sm:col-span-3 font-medium text-slate-800">{property.location.state}</span>
                    </div>
                  )}
                  {property.location?.pinCode && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 px-4 py-2.5">
                      <span className="text-slate-500 font-mono">Postal Code</span>
                      <span className="col-span-2 sm:col-span-3 font-mono font-medium text-slate-800">{property.location.pinCode}</span>
                    </div>
                  )}
                  {property.location?.address && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 px-4 py-3 items-center">
                      <span className="text-slate-500 font-mono">Registered Address</span>
                      <div className="col-span-2 sm:col-span-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-slate-700 leading-relaxed font-mono text-[11px]">
                          {property.location.address}
                        </span>
                        <a
                          href={googleMapsHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF1DE] hover:bg-[#F5E5C4] text-[#9A6007] text-xs font-bold transition-colors shrink-0 w-fit cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#D89B30]" />
                          <span>View on Google Maps</span>
                          <ExternalLink className="w-3 h-3 text-[#D89B30]" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Real Amenities from API */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-[#F1EFEA]">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    Amenities &amp; Features:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E8E2D5] text-xs font-medium text-slate-800 flex items-center gap-1.5 shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D89B30]" />
                        <span>{amenity}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Official Uploaded Documents (Only if actually uploaded to API) */}
            {propertyDocs.length > 0 && (
              <div className="bg-white rounded-3xl border border-[#E2DDD2] p-6 sm:p-8 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#F1EFEA] pb-3">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-[#D89B30]" />
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#142533]">
                      Official Notice Documents ({propertyDocs.length})
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {propertyDocs.map((doc, idx) => (
                    <div
                      key={doc.id || idx}
                      className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D5] flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-white border border-[#E2DDD2] text-[#9A6007] shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm break-all">{doc.document_name}</p>
                          <span className="uppercase text-[10px] font-semibold text-slate-500 font-mono">
                            {doc.document_type || 'PDF'}
                          </span>
                        </div>
                      </div>

                      {doc.url && (
                        <div className="pt-2 border-t border-slate-200/60">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D89B30] hover:text-[#9A6007] transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Official Notice</span>
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (4 cols): Sticky Bidding Desk & Direct Advisory Desk */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Live Bidding Box */}
            <div className="bg-[#142533] text-white rounded-3xl p-6 sm:p-7 space-y-5 border border-white/10 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs font-mono font-bold text-[#D89B30] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#D89B30]" />
                  <span>Auction Timeline</span>
                </span>
                {property.auctionCategory && (
                  <span className="text-xs text-slate-300 font-mono">
                    {property.auctionCategory}
                  </span>
                )}
              </div>

              {/* Dynamic Countdown */}
              {hasValidAuctionDate && timeLeft ? (
                <div className="space-y-1 text-center bg-white/5 p-4 rounded-2xl border border-white/10">
                  <span className="text-[11px] font-mono text-slate-300 uppercase tracking-wide block">
                    Time Left for Bidding &amp; EMD
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 text-center pt-2">
                    <div className="bg-black/35 p-2 rounded-xl">
                      <span className="font-serif text-xl sm:text-2xl font-bold text-[#D89B30] block">{timeLeft.days}</span>
                      <span className="text-[9px] uppercase tracking-wider block text-slate-400 font-mono">Days</span>
                    </div>
                    <div className="bg-black/35 p-2 rounded-xl">
                      <span className="font-serif text-xl sm:text-2xl font-bold text-white block">
                        {String(timeLeft.hours).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider block text-slate-400 font-mono">Hours</span>
                    </div>
                    <div className="bg-black/35 p-2 rounded-xl">
                      <span className="font-serif text-xl sm:text-2xl font-bold text-white block">
                        {String(timeLeft.minutes).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider block text-slate-400 font-mono">Mins</span>
                    </div>
                    <div className="bg-black/35 p-2 rounded-xl">
                      <span className="font-serif text-xl sm:text-2xl font-bold text-white block">
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider block text-slate-400 font-mono">Secs</span>
                    </div>
                  </div>
                </div>
              ) : property.auctionDate ? (
                <div className="space-y-1 text-center bg-white/5 p-4 rounded-2xl border border-white/10">
                  <span className="text-[11px] font-mono text-slate-300 uppercase tracking-wide block">
                    Auction Schedule
                  </span>
                  <p className="font-serif text-lg font-bold text-white pt-1">
                    {new Date(property.auctionDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              ) : null}

              {/* Financial Breakdown Rows */}
              <div className="space-y-2.5 text-xs pt-1">
                {/* Show Post-Auction / Bank Sale Price FIRST when valid */}
                {hasPostAuctionPrice && (
                  <div className="p-3 rounded-xl bg-[#D89B30]/15 border border-[#D89B30]/50 space-y-1.5 my-1">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[#D89B30] font-bold text-[11px] font-mono uppercase tracking-wide">
                        Post-Auction / Bank Sale Price:
                      </span>
                      <span className="font-extrabold text-[#D89B30] font-mono text-base">
                        {formatINR(postAuctionPriceValue)}
                      </span>
                    </div>
                    {formattedPostAuctionDate && (
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-300 pt-1 border-t border-white/10">
                        <span>Price Updated/Offered On:</span>
                        <span className="text-white font-semibold">{formattedPostAuctionDate}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-slate-300">
                    {hasPostAuctionPrice ? 'Original Reserve Price:' : 'Reserve Price:'}
                  </span>
                  <span className={`font-mono text-sm ${hasPostAuctionPrice ? 'line-through text-slate-400 font-semibold decoration-red-400/80' : 'font-bold text-white'}`}>
                    {property.reservePrice > 0 ? formatINR(property.reservePrice) : 'On Request'}
                  </span>
                </div>
                {property.emdAmount > 0 && (
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-slate-300">EMD Amount:</span>
                    <span className="font-bold text-[#D89B30] font-mono text-sm">{formatINR(property.emdAmount)}</span>
                  </div>
                )}
                {property.emdDeadline && (
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-slate-300">EMD Deadline:</span>
                    <span className="font-bold text-white font-mono">
                      {new Date(property.emdDeadline).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  id={`btn-express-interest-desk-${property.id}`}
                  onClick={() => onExpressInterest(property)}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#D89B30] hover:bg-[#C58920] text-[#142533] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  <span>Express Interest &amp; Enquire</span>
                </button>

                {primaryVideoUrl && (
                  <a
                    href={primaryVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
                    title="Open official video tour on YouTube"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Watch Video Tour on YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {primaryPhone && (
                  <a
                    href={`tel:${primaryPhone.replace(/\s+/g, '')}`}
                    className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Phone className="w-4 h-4 text-[#D89B30]" />
                    <span>Advisory Desk: {primaryPhone}</span>
                  </a>
                )}

                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi%2C%20I%20am%20interested%20in%20auction%20property%3A%20${encodeURIComponent(
                      property.title
                    )}${property.reservePrice > 0 ? `%20-%20Reserve%3A%20${encodeURIComponent(formatINR(property.reservePrice))}` : ''}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Advisory Desk</span>
                  </a>
                )}
              </div>
            </div>

            {/* Auctions & More Site Inspection & Advisory Liaison Desk Card */}
            <div className="bg-white rounded-3xl border border-[#E2DDD2] p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center gap-2 text-[#9A6007] font-bold">
                <Building className="w-4 h-4" />
                <span>Site Inspection &amp; Liaison</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Schedule an on-site property inspection or request complete legal and title documentation from our advisory desk.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-400 font-mono text-[11px]">By Prior Request</span>
                <button
                  onClick={() => onExpressInterest(property)}
                  className="text-xs font-bold text-[#D89B30] hover:text-[#9A6007] flex items-center gap-1 cursor-pointer"
                >
                  <span>Request Site Visit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Share & Quick Actions */}
            <div className="bg-white rounded-2xl border border-[#E2DDD2] p-4 shadow-2xs flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">Share or save this listing:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Listing</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 4. SIMILAR DISTRESSED AUCTION INVENTORY SECTION */}
      {relatedProperties.length > 0 && (
        <section className="w-full bg-[#FAF8F5] border-t border-[#E8E2D5] pt-10 sm:pt-12 pb-8 sm:pb-10">
          <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#9A6007] block">
                  EXPLORE COMPARABLE OPPORTUNITIES
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#142533]">
                  Similar Distressed Auction Assets
                </h3>
              </div>
              <button
                onClick={onBack}
                className="text-xs sm:text-sm font-semibold text-[#D89B30] hover:text-[#9A6007] flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>View All Inventory</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProperties.map((rel) => {
                const relMarketEst = Number(rel.raw?.market_estimate || rel.raw?.market_value || 0);
                const relHasMarketEst = relMarketEst > rel.reservePrice;
                const relDiscount = relHasMarketEst ? calculateDiscount(rel.reservePrice, relMarketEst) : 0;
                const relImage = rel.images && rel.images.length > 0 ? rel.images[0] : getPropertyFallbackImage(rel.propertyType);
                return (
                  <div
                    key={rel.id}
                    onClick={() => {
                      onSelectRelatedProperty(rel);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-white rounded-2xl border border-[#E2DDD2] overflow-hidden hover:border-[#D89B30] hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group shadow-2xs"
                  >
                    <div className="aspect-16/10 relative overflow-hidden bg-slate-100">
                      <img
                        src={relImage}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <PropertyWatermark variant="corner" position="top-right" size="sm" />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-15">
                        {rel.auctionCategory && (
                          <span className="px-2.5 py-1 rounded bg-[#142533]/90 text-[#D89B30] font-mono text-[10px] font-bold">
                            {rel.auctionCategory}
                          </span>
                        )}
                        {relDiscount > 0 && (
                          <span className="px-2.5 py-1 rounded bg-[#D89B30] text-[#142533] font-bold text-[10px]">
                            Save ~{relDiscount}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        {rel.propertyType && (
                          <span className="text-xs text-slate-500 font-medium">{rel.propertyType}</span>
                        )}
                        <h4 className="font-serif font-bold text-sm text-[#142533] group-hover:text-[#9A6007] transition-colors line-clamp-2">
                          {rel.title}
                        </h4>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#9A6007] block font-mono">
                            {rel.postAuctionPrice ? 'Bank Sale Price' : 'Price'}
                          </span>
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="font-serif font-extrabold text-base text-[#142533]">
                              {rel.postAuctionPrice ? formatINR(rel.postAuctionPrice) : (rel.reservePrice > 0 ? formatINR(rel.reservePrice) : 'On Request')}
                            </span>
                            {rel.postAuctionPrice && rel.reservePrice > 0 && (
                              <span className="text-xs text-slate-400 line-through decoration-red-400/80 font-mono">
                                {formatINR(rel.reservePrice)}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#D89B30] flex items-center gap-1">
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA Banner */}
      <AuctionCtaBanner onNavigate={onNavigate} />

      {/* Share Property Modal */}
      <SharePropertyModal
        property={property}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};
