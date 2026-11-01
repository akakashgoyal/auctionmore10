import React, { useState, useEffect } from 'react';
import { AuctionAsset } from '../../types';
import { getAuctionAssetById } from '../../services/api';
import { formatINR } from '../../utils/storage';
import { PageRoute } from '../Navbar';
import { getShareableUrl } from '../../utils/routes';
import { useApi } from '../../context/ApiContext';
import {
  MapPin,
  Calendar,
  Building2,
  Download,
  Share2,
  ArrowLeft,
  ShieldCheck,
  Phone,
  Recycle,
  Cog,
  FileText,
  AlertCircle,
  Bell,
  MessageSquare,
} from 'lucide-react';

interface AuctionAssetDetailPageProps {
  assetId: number;
  initialAsset?: AuctionAsset | null;
  onNavigate?: (page: PageRoute, customUrl?: string) => void;
  onBack?: () => void;
}

export const AuctionAssetDetailPage: React.FC<AuctionAssetDetailPageProps> = ({
  assetId,
  initialAsset,
  onNavigate,
  onBack,
}) => {
  const { openAuctionAssetEnquiryModal, openShareModal, settings } = useApi();
  const [asset, setAsset] = useState<AuctionAsset | null>(initialAsset || null);
  const [loading, setLoading] = useState<boolean>(!initialAsset);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setImageError(false);
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAuctionAssetById(assetId);
        if (isMounted) {
          if (data.success && data.asset) {
            setAsset(data.asset);
          } else {
            setAsset(null);
            setError(data.message || 'Auction asset not found.');
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch auction asset detail:', err);
        if (isMounted) {
          setError(err.message || 'Unable to load auction asset details.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [assetId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col items-center justify-center py-24">
        <div className="w-12 h-12 border-3 border-[#D89B30] border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-base font-bold text-[#142533]">Loading Auction Details...</div>
        <div className="text-xs text-slate-500 mt-1">Fetching verified asset specifications</div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] py-20 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#142533]">Auction Asset Not Found</h2>
          <p className="text-sm text-slate-600 mt-2">
            {error || 'The requested asset does not exist or has been removed.'}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => (onBack ? onBack() : onNavigate?.('scrap-auctions', '/scrap-auctions'))}
              className="px-4 py-2 rounded-xl bg-[#142533] text-white text-xs font-semibold cursor-pointer"
            >
              Back to Auctions
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isScrap = (asset.category || '').toLowerCase().includes('scrap');
  const hasRealImage = Boolean(!imageError && asset.asset_image && asset.asset_image.trim());
  const locationLabel = [asset.city, asset.state].filter(Boolean).join(', ');
  const hasReservePrice = asset.reserve_price !== null && asset.reserve_price !== undefined && Number(asset.reserve_price) > 0;
  const hasEmdAmount = asset.emd_amount !== null && asset.emd_amount !== undefined && Number(asset.emd_amount) > 0;

  const statusConfig = {
    active: {
      label: 'Live Auction',
      textClass: 'text-emerald-700 bg-emerald-50 border-emerald-200/80',
    },
    upcoming: {
      label: 'Upcoming Auction',
      textClass: 'text-amber-800 bg-amber-50 border-amber-200/80',
    },
    closed: {
      label: 'Auction Closed',
      textClass: 'text-slate-600 bg-slate-100 border-slate-200',
    },
  }[(asset.status || '').toLowerCase()] || {
    label: asset.status,
    textClass: 'text-slate-600 bg-slate-100 border-slate-200',
  };

  // Build dynamic specification rows strictly from non-empty backend fields
  const specRows: Array<{ label: string; value: string; mono?: boolean }> = [];
  if (asset.reference_no) {
    specRows.push({ label: 'Reference Number', value: asset.reference_no, mono: true });
  }
  if (asset.category) {
    specRows.push({ label: 'Category', value: asset.category });
  }
  if (asset.sub_type) {
    specRows.push({ label: 'Sub Type', value: asset.sub_type });
  }
  if (asset.bank_name) {
    specRows.push({ label: 'Bank / Institution', value: asset.bank_name });
  }
  if (asset.seller_name) {
    specRows.push({ label: 'Seller Name', value: asset.seller_name });
  }
  if (asset.seller_type) {
    specRows.push({ label: 'Seller Type', value: asset.seller_type });
  }
  if (asset.listing_source) {
    specRows.push({ label: 'Listing Source', value: asset.listing_source });
  }
  if (asset.auction_platform) {
    specRows.push({ label: 'Auction Platform', value: asset.auction_platform });
  }
  if (asset.possession_status) {
    specRows.push({ label: 'Possession Status', value: asset.possession_status });
  }
  if (asset.condition) {
    specRows.push({ label: 'Condition', value: asset.condition });
  }
  if (asset.sale_basis) {
    specRows.push({ label: 'Sale Basis', value: asset.sale_basis });
  }
  if (asset.quantity !== null && asset.quantity !== undefined && String(asset.quantity).trim() !== '') {
    specRows.push({
      label: 'Quantity',
      value: `${asset.quantity}${asset.unit ? ` ${asset.unit}` : ''}`,
      mono: true,
    });
  }
  if (asset.reserve_price_basis) {
    specRows.push({ label: 'Reserve Price Basis', value: asset.reserve_price_basis });
  }
  if (locationLabel) {
    specRows.push({ label: 'Location', value: locationLabel });
  }
  if (asset.emd_submission_date) {
    specRows.push({
      label: 'EMD Submission Date',
      value: new Date(asset.emd_submission_date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    });
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] pb-20">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-14 sm:top-16 lg:top-18 z-20">
        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-3 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              if (onBack) {
                onBack();
              } else if (onNavigate) {
                onNavigate(
                  isScrap ? 'scrap-auctions' : 'plant-machinery-auctions',
                  isScrap ? '/scrap-auctions' : '/plant-machinery-auctions'
                );
              }
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#142533] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {isScrap ? 'Scrap' : 'Plant & Machinery'} Listings</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openAuctionAssetEnquiryModal(asset)}
              className="px-3.5 py-1.5 rounded-xl bg-[#D89B30] hover:bg-[#C58920] text-[#142533] text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enquire Now</span>
            </button>
            <button
              type="button"
              onClick={() =>
                openShareModal(null, true, getShareableUrl('auction-detail', String(asset.id)))
              }
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-[#D89B30]/50 text-slate-700 hover:text-[#9A6007] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#D89B30]" />
              <span>Share Asset</span>
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols): Media/Header, Specifications, Notice PDF */}
          <div className="lg:col-span-2 space-y-8">
            {/* Asset Hero Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
              {hasRealImage ? (
                <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-slate-100">
                  <img
                    src={asset.asset_image!}
                    alt={asset.title}
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-xl">
                      {isScrap ? (
                        <Recycle className="w-3.5 h-3.5 text-[#D89B30]" />
                      ) : (
                        <Cog className="w-3.5 h-3.5 text-blue-400" />
                      )}
                      <span>{asset.category}</span>
                      {asset.sub_type && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{asset.sub_type}</span>
                        </>
                      )}
                    </div>

                    {asset.status && (
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-bold border backdrop-blur-md ${statusConfig.textClass}`}
                      >
                        {statusConfig.label}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    {asset.reference_no && (
                      <div className="font-mono text-xs font-bold text-amber-300 tracking-wider mb-1">
                        REF: {asset.reference_no}
                      </div>
                    )}
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-serif text-white leading-tight">
                      {asset.title}
                    </h1>
                  </div>
                </div>
              ) : (
                <div className="bg-[#142533] text-white p-6 sm:p-8 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D89B30_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                        {isScrap ? (
                          <Recycle className="w-4 h-4 text-[#D89B30]" />
                        ) : (
                          <Cog className="w-4 h-4 text-blue-400" />
                        )}
                        <span>{asset.category}</span>
                        {asset.sub_type && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-amber-300">{asset.sub_type}</span>
                          </>
                        )}
                      </div>

                      {asset.status && (
                        <span
                          className={`px-3 py-1 rounded-xl text-xs font-bold border ${statusConfig.textClass}`}
                        >
                          {statusConfig.label}
                        </span>
                      )}
                    </div>

                    {asset.reference_no && (
                      <div className="font-mono text-xs font-bold text-[#D89B30] tracking-wider">
                        REF: {asset.reference_no}
                      </div>
                    )}

                    <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white leading-tight">
                      {asset.title}
                    </h1>
                  </div>
                </div>
              )}

              {/* Quick Summary Highlights Strip (only fields present in backend) */}
              {(hasReservePrice || hasEmdAmount || asset.auction_date || locationLabel) && (
                <div className="p-4 sm:p-6 bg-[#FAF8F5] border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {hasReservePrice && (
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Reserve Price
                      </div>
                      <div className="text-base sm:text-lg font-extrabold text-[#142533] font-mono tabular-nums mt-0.5">
                        {formatINR(Number(asset.reserve_price))}
                      </div>
                      {asset.reserve_price_basis && (
                        <div className="text-[10px] text-slate-500">{asset.reserve_price_basis}</div>
                      )}
                    </div>
                  )}

                  {hasEmdAmount && (
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        EMD Amount
                      </div>
                      <div className="text-base sm:text-lg font-bold text-slate-700 font-mono tabular-nums mt-0.5">
                        {formatINR(Number(asset.emd_amount))}
                      </div>
                      {asset.emd_submission_date && (
                        <div className="text-[10px] text-slate-500">
                          Due:{' '}
                          {new Date(asset.emd_submission_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {asset.auction_date && (
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Auction Date
                      </div>
                      <div className="text-sm sm:text-base font-bold text-[#142533] mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#D89B30]" />
                        <span>
                          {new Date(asset.auction_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                  {locationLabel && (
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Location
                      </div>
                      <div className="text-sm sm:text-base font-bold text-[#142533] mt-0.5 truncate flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#D89B30] shrink-0" />
                        <span className="truncate">{locationLabel}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Asset Technical & Commercial Specifications */}
            {(specRows.length > 0 || asset.complete_address || asset.plant_address || asset.inspection_details) && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#142533] font-serif">
                      Asset Details &amp; Specifications
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Official asset and auction parameters as published
                    </p>
                  </div>
                  <span className="font-mono text-xs text-slate-500">ID #{asset.id}</span>
                </div>

                {specRows.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6">
                    {specRows.map((row) => (
                      <div key={row.label}>
                        <div className="text-xs text-slate-500">{row.label}</div>
                        <div
                          className={`text-xs font-bold text-slate-800 mt-1 ${
                            row.mono ? 'font-mono tabular-nums' : ''
                          }`}
                        >
                          {row.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(asset.complete_address || asset.plant_address || asset.inspection_details) && (
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    {asset.complete_address && (
                      <div>
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Complete Address
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50 text-xs text-slate-700 leading-relaxed border border-slate-200/80">
                          {asset.complete_address}
                        </div>
                      </div>
                    )}

                    {asset.plant_address && (
                      <div>
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Factory / Plant Location Address
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50 text-xs text-slate-700 leading-relaxed border border-slate-200/80">
                          {asset.plant_address}
                        </div>
                      </div>
                    )}

                    {asset.inspection_details && (
                      <div>
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Asset Inspection &amp; Site Visit Schedule
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#FAF1DE]/50 text-xs text-[#9A6007] leading-relaxed border border-[#D89B30]/30">
                          {asset.inspection_details}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Official Bank Auction Notice PDF Card (rendered strictly when backend provides a notice URL) */}
            {asset.auction_notice_pdf && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-red-50 text-red-600 border border-red-200/70 shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#142533]">
                        Official Auction Notice PDF
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-md">
                        Download the official published auction notice containing complete terms and conditions.
                      </p>
                    </div>
                  </div>

                  <a
                    href={asset.auction_notice_pdf}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-3 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4 text-[#D89B30]" />
                    <span>Download Official Notice</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (1 Col): Advisory & Asset Enquiry CTA */}
          <div className="space-y-6">
            {/* Express Interest / Enquiry Box */}
            <div className="bg-[#142533] text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D89B30]/10 rounded-full blur-2xl" />

              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#D89B30]" />
                  <span>Bid &amp; Due Diligence Assistance</span>
                </div>

                <h3 className="text-xl font-bold font-serif text-white">
                  Interested in this Auction?
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Submit an enquiry for tender documentation, EMD submission support, site inspection coordination, and live bidding assistance from our advisory desk.
                </p>

                <div className="pt-2 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => openAuctionAssetEnquiryModal(asset)}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#D89B30] hover:bg-[#C58920] text-[#142533] font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Enquire About This Asset</span>
                  </button>

                  {settings.primary_phone && (
                    <a
                      href={`tel:${settings.primary_phone.replace(/\s+/g, '')}`}
                      className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4 text-[#D89B30]" />
                      <span className="font-mono">{settings.primary_phone}</span>
                    </a>
                  )}

                  <a
                    href={`https://wa.me/${(settings.whatsapp_number || settings.primary_phone || '919899897647').replace(/[^0-9]/g, '')}?text=Hi%2C%20I%20am%20interested%20in%20Auction%20Asset%20${encodeURIComponent(asset.reference_no ? `Ref: ${asset.reference_no} - ` : '')}${encodeURIComponent(asset.title)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Advisory Desk</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Statutory Notice Advisory */}
            <div className="bg-[#FAF8F5] rounded-3xl border border-slate-200/80 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#142533]">
                <ShieldCheck className="w-4 h-4 text-[#D89B30]" />
                <span>Statutory Disclosure</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Reserve prices, EMD amounts, and auction dates are displayed as published in the official public notice. Prospective bidders should inspect assets and verify terms prior to bidding.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
