import React from 'react';
import { Property, AuthorityProperty, AuctionAsset } from '../../types';
import { COMPANY_INFO } from '../../data/companyInfo';
import { useApi } from '../../context/ApiContext';
import { getAuthorityProperties, getAuctionAssets } from '../../services/api';
import { PropertyCard } from '../PropertyCard';
import { AuthorityPropertyCard } from '../AuthorityPropertyCard';
import { AuctionAssetCard } from '../AuctionAssetCard';
import { TestimonialsSlider } from '../TestimonialsSlider';
import { CustomerRequirementSection } from '../CustomerRequirementSection';
import {
  ShieldCheck,
  Award,
  Landmark,
  Building,
  CheckCircle2,
  ArrowRight,
  Phone,
  Clock,
  FileCheck,
  TrendingDown,
  Scale,
  Users,
  ChevronDown,
  ChevronRight,
  FileText,
  Key,
  Gavel,
  Search,
  Sparkles,
  HelpCircle,
  Recycle,
  Cog,
  Settings,
  Calendar,
} from 'lucide-react';
import { PageRoute } from '../Navbar';
import { getShareableUrl } from '../../utils/routes';
import { AuctionCtaBanner } from '../AuctionCtaBanner';
import { LatestAuctionsTicker } from '../LatestAuctionsTicker';
import { BankLogosSection } from '../BankLogosSection';
import { NoticeModal } from '../NoticeModal';
import { BlogPost } from '../../data/blogData';
import { PropertyWatermark } from '../PropertyWatermark';

interface HomePageProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onExpressInterest: (property: Property) => void;
  onNavigate: (page: PageRoute, customUrl?: string) => void;
  onSelectBlog?: (post: BlogPost) => void;
  onSelectAuthorityProperty?: (property: AuthorityProperty) => void;
  onSelectAuthority?: (authorityId: number) => void;
  onSelectAuction?: (asset: AuctionAsset) => void;
}

type HomeInventoryTab = 'auction' | 'authority' | 'scrap-machinery';

export const HomePage: React.FC<HomePageProps> = ({
  properties,
  onSelectProperty,
  onExpressInterest,
  onNavigate,
  onSelectBlog,
  onSelectAuthorityProperty,
  onSelectAuthority,
  onSelectAuction,
}) => {
  const {
    settings,
    auctionAssetStats,
    isLoadingAuctionStats,
    isLoadingProperties,
    propertyPagination,
    openShareModal,
  } = useApi();
  const [activeInventoryTab, setActiveInventoryTab] = React.useState<HomeInventoryTab>('auction');

  // Dynamic Authority Properties state
  const [authorityProperties, setAuthorityProperties] = React.useState<AuthorityProperty[]>([]);
  const [authorityTotalCount, setAuthorityTotalCount] = React.useState<number>(0);
  const [isLoadingAuthorityProps, setIsLoadingAuthorityProps] = React.useState<boolean>(true);
  const [authorityPropsError, setAuthorityPropsError] = React.useState<string | null>(null);

  // Dynamic Scrap & Plant Machinery state
  const [industrialAssets, setIndustrialAssets] = React.useState<AuctionAsset[]>([]);
  const [industrialTotalCount, setIndustrialTotalCount] = React.useState<number>(0);
  const [isLoadingIndustrial, setIsLoadingIndustrial] = React.useState<boolean>(true);
  const [industrialError, setIndustrialError] = React.useState<string | null>(null);

  const loadHomeAuthorityProperties = React.useCallback(async () => {
    setIsLoadingAuthorityProps(true);
    setAuthorityPropsError(null);
    try {
      const res = await getAuthorityProperties({ per_page: 6, page: 1 });
      if (res.success) {
        setAuthorityProperties(res.properties);
        setAuthorityTotalCount(res.pagination.total || res.properties.length);
      } else {
        setAuthorityPropsError(res.message || 'Unable to load authority properties.');
      }
    } catch {
      setAuthorityPropsError('Unable to load authority properties right now.');
    } finally {
      setIsLoadingAuthorityProps(false);
    }
  }, []);

  const loadHomeIndustrialAssets = React.useCallback(async () => {
    setIsLoadingIndustrial(true);
    setIndustrialError(null);
    try {
      const res = await getAuctionAssets({
        per_page: 6,
        page: 1,
        sort_by: 'auction_date',
        sort_order: 'asc',
      });
      if (res.success) {
        setIndustrialAssets(res.assets);
        setIndustrialTotalCount(res.pagination.total || res.assets.length);
      } else {
        setIndustrialError(res.message || 'Unable to load scrap & machinery auctions.');
      }
    } catch {
      setIndustrialError('Unable to load scrap & machinery auctions right now.');
    } finally {
      setIsLoadingIndustrial(false);
    }
  }, []);

  React.useEffect(() => {
    loadHomeAuthorityProperties();
    loadHomeIndustrialAssets();
  }, [loadHomeAuthorityProperties, loadHomeIndustrialAssets]);

  const featuredProperties = properties.slice(0, 6);
  const heroProperty = properties && properties.length > 0 ? properties[0] : null;
  const subHeroProperties = properties && properties.length > 1 ? properties.slice(1, 4) : [];

  const formatHeroPrice = (val?: number) => {
    if (!val || val <= 0) return 'Price on Request';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lac`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const calculateHeroDiscount = (market?: number, reserve?: number) => {
    if (market && reserve && market > reserve) {
      return Math.round(((market - reserve) / market) * 100);
    }
    return null;
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Enhanced 5-stage roadmap details with rich deliverables
  const processStages = [
    {
      step: '01',
      phase: 'Stage 1 · Pre-Bid Discovery',
      timeline: 'Days 1 – 7',
      title: 'Property Identification & Initial Screening',
      icon: Search,
      desc: 'We curate and verify distressed asset listings directly from PSU banks, DRT, and official liquidators. You get upfront clarity on the property price, property condition, and statutory notices before investing time.',
      highlights: [
        'Verified physical location & boundary survey',
        'IBBI certified price valuation assessment',
        'Immediate notification on DRT & court stay checks',
      ],
    },
    {
      step: '02',
      phase: 'Stage 2 · Due Diligence',
      timeline: 'Days 8 – 20',
      title: '30-Year Legal Title Search & Due Diligence',
      icon: FileText,
      desc: 'Our empaneled legal advocates conduct comprehensive 30-year search reports at the sub-registrar office to ensure zero encumbrances, clear municipal tax records, and authentic CMM/DM possession orders.',
      highlights: [
        'Complete sub-registrar encumbrance check',
        'Section 14 SARFAESI physical order review',
        'Electricity, water & municipal dues clearance check',
      ],
    },
    {
      step: '03',
      phase: 'Stage 3 · Tender Filing',
      timeline: 'Days 21 – 30',
      title: 'Tender Application & EMD Facilitation',
      icon: FileCheck,
      desc: 'Never risk disqualification due to clerical errors. We prepare all tender forms, KYC packages, digital signature certificates (DSC), and coordinate the 10% Earnest Money Deposit (EMD) via RTGS/DD.',
      highlights: [
        'E-Auction portal registration & DSC configuration',
        'Tender document verification with Authorized Officer',
        'Pre-bidding mock walk-through for first-time buyers',
      ],
    },
    {
      step: '04',
      phase: 'Stage 4 · Live Auction',
      timeline: 'Auction Day',
      title: 'Live Bidding Strategy & Real-Time Alerts',
      icon: Gavel,
      desc: 'During the live online auction, our team provides real-time strategic advisory, monitoring auto-extension windows and ensuring you adhere to your predetermined price ceiling without emotional overbidding.',
      highlights: [
        'Real-time bid counter & auto-extension tracking',
        'Instant SMS & WhatsApp milestone alerts',
        'Immediate declaration of successful H1 bidder status',
      ],
    },
    {
      step: '05',
      phase: 'Stage 5 · Possession Handover',
      timeline: 'Days 31 – 60',
      title: 'Statutory Sale Certificate & Physical Handover',
      icon: Key,
      desc: 'Following balance payment (25% on Day 1, balance within statutory timeline), we coordinate with the bank to issue the official Sale Certificate under Rule 9, complete registration, and hand over the physical keys.',
      highlights: [
        'Sale Certificate directly from Authorized Officer',
        'Sub-registrar registration & stamp duty guidance',
        'Guaranteed peaceful physical key handover within 60 days',
      ],
    },
  ];

  // Exactly 4 high-impact statutory & performance metrics (strictly 4 as requested)
  const statsList = [
    {
      icon: Landmark,
      value: '₹500 Cr+',
      label: 'Assets Resolved',
      detail: 'Successful distress acquisitions across 12 Indian states',
    },
    {
      icon: Award,
      value: '15+ Years',
      label: 'Continuous Trust',
      detail: 'Pioneered under Eagle Capital Services since 2009',
    },
    {
      icon: ShieldCheck,
      value: '100% Clear',
      label: '30-Yr Title Deeds',
      detail: 'Sub-registrar encumbrance search & SARFAESI legal audit',
    },
    {
      icon: Clock,
      value: 'Within 60 Days',
      label: 'Possession & Keys',
      detail: 'Statutory Sale Certificate under SARFAESI Rule 9',
    },
  ];

  return (
    <div className="w-full flex flex-col space-y-0">
      {/* Notice Image Popup Modal (Auto-pops if active notices exist and not dismissed) */}
      <NoticeModal />

      {/* Top Bar Announcement: WHAT'S NEW / LATEST AUCTIONS Ticker */}
      <LatestAuctionsTicker
        properties={properties}
        onSelectProperty={onSelectProperty}
      />

      {/* 1. HERO SECTION - Crisp Architectural Split Bento */}
      <section className="relative w-full bg-gradient-to-b from-slate-50/70 via-white to-white text-[#142533] overflow-hidden pt-4 pb-8 sm:pt-6 sm:pb-10 lg:pt-8 lg:pb-12 border-b border-slate-200">
        {/* Subtle zero-network architectural grid backdrop */}
        <div
          className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"
        />
        <div className="absolute -top-32 right-1/4 w-96 h-96 rounded-full bg-slate-200/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-10 w-96 h-96 rounded-full bg-[#D89B30]/5 blur-3xl pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Core Value Proposition */}
            <div className="lg:col-span-7 space-y-5">
              {/* Clean Eyebrow Badge - Crisp Neutral */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 rounded-full bg-slate-100 border border-slate-200 text-[#0F172A] text-[11px] sm:text-xs font-mono font-bold tracking-wide shadow-2xs max-w-full">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D89B30] shrink-0" />
                <span className="truncate">INDIA'S PREMIER DISTRESSED ASSET RESOLUTION PLATFORM</span>
              </div>

              {/* Headline */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#142533] leading-[1.14]">
                Your One-Stop <br className="hidden sm:block" />
                <span className="text-[#9A6007]">Auction Partner.</span>
              </h1>

              {/* Core premise */}
              <p className="text-slate-600 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed">
                From bank auctions and liquidation sales to NCLT investor advisory — we bring 15 years of Eagle Capital
                Services expertise to every deal, now incorporated as{' '}
                <strong className="text-[#142533]">Auctions &amp; More Pvt Ltd</strong>. Acquire verified real estate at 25% to 50% below prevailing market value with guaranteed clear title.
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={() => onNavigate('property')}
                  className="px-6 py-3.5 rounded-xl bg-[#D89B30] hover:bg-[#C58920] text-[#142533] text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Auction Properties</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => scrollToSection('how-we-work')}
                  className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-[#142533] text-xs sm:text-sm font-semibold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
                >
                  <span>See How We Work &amp; Process</span>
                  <ChevronDown className="w-4 h-4 text-[#9A6007]" />
                </button>

                <a
                  href={`tel:${settings.primary_phone}`}
                  className="px-5 py-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold transition-all shadow-2xs flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-emerald-700" />
                  <span>Call {settings.primary_phone}</span>
                </a>
              </div>

              {/* Quick Institutional Highlights in Clean Crisp Cards */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="font-mono text-[#9A6007] font-extrabold text-lg sm:text-xl block">₹500 Cr+</span>
                  <span className="text-slate-500 font-medium">Resolved Assets</span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="font-mono text-[#9A6007] font-extrabold text-lg sm:text-xl block">15+ Years</span>
                  <span className="text-slate-500 font-medium">Continuous Trust</span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="font-mono text-[#9A6007] font-extrabold text-lg sm:text-xl block">100% Clear</span>
                  <span className="text-slate-500 font-medium">30-Yr Title Deeds</span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="font-mono text-[#9A6007] font-extrabold text-lg sm:text-xl block">60 Days</span>
                  <span className="text-slate-500 font-medium">Keys in Hand</span>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Visual Bento Box */}
            <div className="lg:col-span-5 relative">
              {/* Soft warm ambient glow behind card */}
              <div className="absolute -inset-3 bg-gradient-to-tr from-[#D89B30]/15 via-amber-200/20 to-transparent rounded-3xl blur-2xl pointer-events-none" />

              <div className="relative rounded-3xl bg-white border border-[#E2DDD2] shadow-xl overflow-hidden space-y-0">
                {/* Main Showcase Image */}
                {isLoadingProperties && !heroProperty ? (
                  <>
                    <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-200 animate-pulse">
                      <div className="absolute bottom-4 left-4 right-4 bg-white/90 rounded-2xl p-4 space-y-2">
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                        <div className="h-4 bg-slate-200 rounded w-2/3" />
                      </div>
                    </div>
                    <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 space-y-2.5">
                      <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse" />
                      <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 3 }).map((_, idx) => (
                          <div key={idx} className="p-2 rounded-xl bg-white border border-slate-200 space-y-1.5 animate-pulse">
                            <div className="w-full h-12 sm:h-14 rounded-lg bg-slate-200" />
                            <div className="h-2.5 bg-slate-200 rounded w-4/5 mx-auto" />
                            <div className="h-2.5 bg-slate-100 rounded w-3/5 mx-auto" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      onClick={() => (heroProperty ? onSelectProperty(heroProperty) : onNavigate('property'))}
                      className="relative aspect-4/3 w-full overflow-hidden bg-[#142533] group cursor-pointer"
                    >
                      {heroProperty?.images?.[0] ? (
                        <img
                          src={heroProperty.images[0]}
                          alt={heroProperty.title || 'Prime Live Bank Auction Property'}
                          fetchPriority="high"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#142533] via-[#1C3347] to-[#0D1A24] flex items-center justify-center">
                          <Landmark className="w-12 h-12 text-[#D89B30]/60" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Brand Logo Watermark - Non-overlapping subtle corner badge */}
                      <PropertyWatermark variant="corner" position="top-right" size="sm" className="pointer-events-none" />

                      {/* Top Floating Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
                        <span className="px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold font-mono flex items-center gap-1.5 shadow-md">
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          <span>
                            {heroProperty?.auctionDate
                              ? `AUCTION: ${new Date(heroProperty.auctionDate).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                })}`
                              : 'LIVE AUCTION'}
                          </span>
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-white/95 text-[#9A6007] text-[11px] font-mono font-bold border border-slate-200/80 backdrop-blur-md shadow-xs truncate max-w-[180px]">
                          {heroProperty?.auctionCategory ? `${heroProperty.auctionCategory} Auction` : heroProperty?.propertyType || 'Verified Auction'}
                        </span>
                      </div>

                      {/* Floating Asset Highlights Banner in Light Plate */}
                      <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/80 shadow-lg text-[#142533]">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-mono text-[#9A6007] font-bold block uppercase tracking-wider truncate">
                              {heroProperty?.title || 'Featured Live Bank Auction Property'}
                            </span>
                            <div className="flex items-center gap-2 flex-wrap pt-0.5">
                              <span className="text-[#142533] font-bold text-xs sm:text-sm">
                                Reserve: {formatHeroPrice(heroProperty?.reservePrice)}
                              </span>
                              {heroProperty?.marketEstimate &&
                                heroProperty.reservePrice &&
                                heroProperty.marketEstimate > heroProperty.reservePrice && (
                                  <span className="text-slate-400 text-xs line-through hidden sm:inline">
                                    Market: {formatHeroPrice(heroProperty.marketEstimate)}
                                  </span>
                                )}
                              {(() => {
                                const discount = calculateHeroDiscount(
                                  heroProperty?.marketEstimate,
                                  heroProperty?.reservePrice
                                );
                                if (discount) {
                                  return (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      Save {discount}%
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (heroProperty) onSelectProperty(heroProperty);
                              else onNavigate('property');
                            }}
                            className="px-3.5 py-2 rounded-xl bg-[#D89B30] hover:bg-[#C58920] text-[#142533] text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
                          >
                            View Dossier
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Distressed Asset Categories / Real Property Mini-Cards */}
                    {subHeroProperties.length > 0 && (
                      <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                            Verified Live Auctions
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            Title Verified Assets
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {subHeroProperties.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => onSelectProperty(p)}
                              className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors cursor-pointer text-center group"
                            >
                              {p.images?.[0] ? (
                                <img
                                  src={p.images[0]}
                                  alt={p.title}
                                  decoding="async"
                                  className="w-full h-12 sm:h-14 rounded-lg object-cover mb-1.5 group-hover:scale-105 transition-transform"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-12 sm:h-14 rounded-lg bg-[#142533] flex items-center justify-center mb-1.5">
                                  <Building className="w-4 h-4 text-[#D89B30]" />
                                </div>
                              )}
                              <span className="text-[10px] font-bold text-[#142533] block truncate group-hover:text-[#9A6007]">
                                {p.title}
                              </span>
                              <span className="text-[9px] text-[#9A6007] font-mono font-semibold block truncate">
                                {formatHeroPrice(p.reservePrice)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bank Logos Carousel Section (Horizontal Scroll, pauses on hover, auto-scrolls) */}
      <BankLogosSection />

      {/* 2. STATS SECTION - Clean 4-Column Responsive Grid (No Scroll) */}
      <section className="w-full bg-[#F8FAFC] border-b border-slate-200 py-6 sm:py-8">
        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 space-y-4 sm:space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#9A6007]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PROVEN TRACK RECORD &amp; STATS</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#142533]">
              Numbers that speak for 15 years of trust.
            </h2>
          </div>

          {/* Clean 4-Column Grid - No Scrolling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {statsList.map((st, idx) => {
              const IconComp = st.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#D89B30] hover:shadow-md transition-all duration-300 flex flex-col justify-between shadow-2xs group"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[#9A6007] group-hover:scale-105 transition-transform">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      0{idx + 1} / 04
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#142533] tracking-tight block">
                      {st.value}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#9A6007] block font-mono">
                      {st.label}
                    </span>
                    <p className="text-xs text-[#64748B] pt-0.5 leading-snug">
                      {st.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-time Industrial & Scrap Asset Overview */}
          <div className="pt-6 border-t border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#142533]">
                Live Industrial &amp; Scrap Auction Overview
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('scrap-auctions', '/scrap-auctions')}
                className="text-[11px] font-semibold text-[#9A6007] hover:text-[#142533] flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <span>Explore Scrap &amp; Machinery Lots</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Authority Properties Live Count */}
              <div
                onClick={() => onNavigate('authority-properties', '/authority-properties')}
                className="bg-white border border-slate-200 hover:border-[#D89B30] p-3.5 rounded-2xl shadow-2xs hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-semibold text-slate-600">Authority Plots</span>
                  <div className="p-1.5 rounded-lg bg-[#FAF1DE] text-[#9A6007] group-hover:scale-105 transition-transform">
                    <Landmark className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-[#142533] mt-1.5">
                  {isLoadingAuthorityProps ? '...' : authorityTotalCount}
                </div>
                <div className="text-[10px] text-[#9A6007] font-medium mt-0.5 flex items-center gap-1">
                  <span>View Authority List</span>
                  <ArrowRight className="w-2.5 h-2.5 text-[#D89B30] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Total Scrap Auctions */}
              <div
                onClick={() => onNavigate('scrap-auctions', '/scrap-auctions')}
                className="bg-white border border-slate-200 hover:border-[#D89B30]/60 p-3.5 rounded-2xl shadow-2xs hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-semibold text-slate-600">Total Scrap</span>
                  <div className="p-1.5 rounded-lg bg-amber-50 text-[#D89B30] group-hover:scale-105 transition-transform">
                    <Recycle className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-[#142533] mt-1.5">
                  {isLoadingAuctionStats ? '...' : auctionAssetStats.totalScrap}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <span>View Scrap Lots</span>
                  <ArrowRight className="w-2.5 h-2.5 text-[#D89B30] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Total Plant & Machinery Auctions */}
              <div
                onClick={() => onNavigate('plant-machinery-auctions', '/plant-machinery-auctions')}
                className="bg-white border border-slate-200 hover:border-blue-400 p-3.5 rounded-2xl shadow-2xs hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-semibold text-slate-600">Plant &amp; Machinery</span>
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
                    <Cog className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-[#142533] mt-1.5">
                  {isLoadingAuctionStats ? '...' : auctionAssetStats.totalPlantMachinery}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <span>Equipment &amp; Plants</span>
                  <ArrowRight className="w-2.5 h-2.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Active Auctions */}
              <div
                onClick={() => onNavigate('scrap-auctions', '/scrap-auctions?category=All&status=Active')}
                className="bg-emerald-50/50 border border-emerald-200/80 hover:border-emerald-400 p-3.5 rounded-2xl shadow-2xs hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-emerald-700">
                  <span className="text-[11px] font-semibold">Active Auctions</span>
                </div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-emerald-800 mt-1.5">
                  {isLoadingAuctionStats ? '...' : auctionAssetStats.activeAuctions}
                </div>
                <div className="text-[10px] text-emerald-600 mt-0.5">Live Bidding / EMD</div>
              </div>

              {/* Upcoming Auctions */}
              <div
                onClick={() => onNavigate('scrap-auctions', '/scrap-auctions?category=All&status=Upcoming')}
                className="bg-amber-50/50 border border-amber-200/80 hover:border-amber-400 p-3.5 rounded-2xl shadow-2xs hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-amber-800">
                  <span className="text-[11px] font-semibold">Upcoming</span>
                  <Calendar className="w-3.5 h-3.5 text-[#D89B30]" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-[#9A6007] mt-1.5">
                  {isLoadingAuctionStats ? '...' : auctionAssetStats.upcomingAuctions}
                </div>
                <div className="text-[10px] text-amber-700 mt-0.5">Notices Scheduled</div>
              </div>

              {/* Closed Auctions */}
              <div
                onClick={() => onNavigate('scrap-auctions', '/scrap-auctions?category=All&status=Closed')}
                className="bg-slate-50 border border-slate-200 hover:border-slate-300 p-3.5 rounded-2xl shadow-2xs hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-semibold text-slate-600">Closed Auctions</span>
                </div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-slate-700 mt-1.5">
                  {isLoadingAuctionStats ? '...' : auctionAssetStats.closedAuctions}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Completed Sales</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. UNIFIED TABBED INVENTORY SHOWCASE (Auction Properties · Authority Properties · Scrap & Machinery) */}
      <section className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-8 sm:py-12 space-y-6">
        {/* Section Heading + Segmented Tab Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-2 border-b border-slate-200/80">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D89B30]">
              {activeInventoryTab === 'auction' && 'Verified Bank Auction Inventory'}
              {activeInventoryTab === 'authority' && 'Development Authority Allotments & E-Auctions'}
              {activeInventoryTab === 'scrap-machinery' && 'Industrial Scrap & Plant Machinery Lots'}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#142533]">
              {activeInventoryTab === 'auction' && 'Featured Auction Properties'}
              {activeInventoryTab === 'authority' && 'Featured Authority Properties'}
              {activeInventoryTab === 'scrap-machinery' && 'Scrap & Plant Machinery Auctions'}
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl">
              {activeInventoryTab === 'auction' &&
                'Explore SARFAESI, IBC, and DRT bank auction properties with verified valuations and EMD timelines.'}
              {activeInventoryTab === 'authority' &&
                'Verified residential, commercial, and institutional plots published directly by development authorities.'}
              {activeInventoryTab === 'scrap-machinery' &&
                'Live institutional scrap lots, industrial plant units, and heavy machinery auctions from banks and PSUs.'}
            </p>
          </div>

          {/* Interactive 3-Tab Segmented Switcher */}
          <div
            role="tablist"
            aria-label="Featured Inventory Categories"
            className="inline-flex flex-wrap sm:flex-nowrap items-center gap-1 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/90 self-start lg:self-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeInventoryTab === 'auction'}
              onClick={() => setActiveInventoryTab('auction')}
              className={`px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeInventoryTab === 'auction'
                  ? 'bg-[#142533] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#142533] hover:bg-white/60'
              }`}
            >
              <Building className={`w-3.5 h-3.5 shrink-0 ${activeInventoryTab === 'auction' ? 'text-[#D89B30]' : 'text-slate-400'}`} />
              <span>Auction Properties</span>
              {(propertyPagination.total || properties.length) > 0 && (
                <span
                  className={`font-mono text-[11px] tabular-nums ${
                    activeInventoryTab === 'auction' ? 'text-[#D89B30]' : 'text-slate-400'
                  }`}
                >
                  {propertyPagination.total || properties.length}
                </span>
              )}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeInventoryTab === 'authority'}
              onClick={() => setActiveInventoryTab('authority')}
              className={`px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeInventoryTab === 'authority'
                  ? 'bg-[#142533] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#142533] hover:bg-white/60'
              }`}
            >
              <Landmark className={`w-3.5 h-3.5 shrink-0 ${activeInventoryTab === 'authority' ? 'text-[#D89B30]' : 'text-slate-400'}`} />
              <span>Authority Properties</span>
              {authorityTotalCount > 0 && (
                <span
                  className={`font-mono text-[11px] tabular-nums ${
                    activeInventoryTab === 'authority' ? 'text-[#D89B30]' : 'text-slate-400'
                  }`}
                >
                  {authorityTotalCount}
                </span>
              )}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeInventoryTab === 'scrap-machinery'}
              onClick={() => setActiveInventoryTab('scrap-machinery')}
              className={`px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeInventoryTab === 'scrap-machinery'
                  ? 'bg-[#142533] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#142533] hover:bg-white/60'
              }`}
            >
              <Cog className={`w-3.5 h-3.5 shrink-0 ${activeInventoryTab === 'scrap-machinery' ? 'text-[#D89B30]' : 'text-slate-400'}`} />
              <span>Scrap &amp; Machinery</span>
              {(auctionAssetStats.activeAuctions || industrialTotalCount) > 0 && (
                <span
                  className={`font-mono text-[11px] tabular-nums ${
                    activeInventoryTab === 'scrap-machinery' ? 'text-[#D89B30]' : 'text-slate-400'
                  }`}
                >
                  {auctionAssetStats.activeAuctions || industrialTotalCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* TAB 1 PANEL: AUCTION PROPERTIES */}
        {activeInventoryTab === 'auction' && (
          <div role="tabpanel" className="space-y-6">
            {isLoadingProperties && featuredProperties.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden animate-pulse"
                  >
                    <div className="aspect-16/10 bg-slate-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-3 bg-slate-200 rounded w-1/3" />
                      <div className="h-5 bg-slate-200 rounded w-5/6" />
                      <div className="h-3.5 bg-slate-200 rounded w-1/2" />
                      <div className="h-10 bg-slate-200 rounded-xl mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : featuredProperties.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
                No auction properties are currently available.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {featuredProperties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    onSelectProperty={onSelectProperty}
                    onExpressInterest={onExpressInterest}
                    onShareProperty={(p) => openShareModal(p)}
                  />
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('property', '/properties')}
                className="px-6 py-3 rounded-xl bg-[#142533] hover:bg-[#203545] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <span>
                  Explore All {(propertyPagination.total || properties.length) > 0 ? `${propertyPagination.total || properties.length} ` : ''}Auction Properties
                </span>
                <ArrowRight className="w-4 h-4 text-[#D89B30]" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2 PANEL: AUTHORITY PROPERTIES */}
        {activeInventoryTab === 'authority' && (
          <div role="tabpanel" className="space-y-6">
            {isLoadingAuthorityProps ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden animate-pulse"
                  >
                    <div className="aspect-16/10 bg-slate-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-3 bg-slate-200 rounded w-1/3" />
                      <div className="h-5 bg-slate-200 rounded w-5/6" />
                      <div className="h-3.5 bg-slate-200 rounded w-1/2" />
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="h-14 bg-slate-100 rounded-xl" />
                        <div className="h-14 bg-slate-100 rounded-xl" />
                      </div>
                      <div className="h-10 bg-slate-200 rounded-xl mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : authorityPropsError ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3">
                <p className="text-sm text-slate-600">{authorityPropsError}</p>
                <button
                  type="button"
                  onClick={loadHomeAuthorityProperties}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Retry Loading Authority Properties</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D89B30]" />
                </button>
              </div>
            ) : authorityProperties.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
                No published authority properties are currently available.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {authorityProperties.map((item) => (
                  <AuthorityPropertyCard
                    key={item.id}
                    property={item}
                    onViewDetails={(prop) => {
                      if (onSelectAuthorityProperty) {
                        onSelectAuthorityProperty(prop);
                      } else {
                        onNavigate('authority-property-detail', `/authority-properties/${prop.id}`);
                      }
                    }}
                    onSelectAuthority={(authId) => {
                      if (onSelectAuthority) {
                        onSelectAuthority(authId);
                      } else {
                        onNavigate('authority-wise-properties', `/authority-properties/authority/${authId}`);
                      }
                    }}
                  />
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('authority-wise-properties', '/authority-properties/authority')}
                className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-[#142533] font-semibold text-xs sm:text-sm transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Landmark className="w-4 h-4 text-[#D89B30]" />
                <span>Browse Authority-wise Properties</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('authority-properties', '/authority-properties')}
                className="px-6 py-3 rounded-xl bg-[#142533] hover:bg-[#203545] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <span>
                  View All{authorityTotalCount > 0 ? ` ${authorityTotalCount}` : ''} Authority Properties
                </span>
                <ArrowRight className="w-4 h-4 text-[#D89B30]" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3 PANEL: SCRAP & PLANT MACHINERY */}
        {activeInventoryTab === 'scrap-machinery' && (
          <div role="tabpanel" className="space-y-6">
            {isLoadingIndustrial ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden animate-pulse"
                  >
                    <div className="aspect-16/10 bg-slate-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-3 bg-slate-200 rounded w-1/3" />
                      <div className="h-5 bg-slate-200 rounded w-5/6" />
                      <div className="h-3.5 bg-slate-200 rounded w-1/2" />
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="h-14 bg-slate-100 rounded-xl" />
                        <div className="h-14 bg-slate-100 rounded-xl" />
                      </div>
                      <div className="h-10 bg-slate-200 rounded-xl mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : industrialError ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3">
                <p className="text-sm text-slate-600">{industrialError}</p>
                <button
                  type="button"
                  onClick={loadHomeIndustrialAssets}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Retry Loading Scrap &amp; Machinery</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D89B30]" />
                </button>
              </div>
            ) : industrialAssets.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
                No scrap or plant &amp; machinery auction lots are currently available.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {industrialAssets.map((asset) => (
                  <AuctionAssetCard
                    key={asset.id}
                    asset={asset}
                    onViewDetails={(selected) => {
                      if (onSelectAuction) {
                        onSelectAuction(selected);
                      } else {
                        onNavigate('auction-detail', `/auction/${selected.id}`);
                      }
                    }}
                    onShare={() =>
                      openShareModal(null, true, getShareableUrl('auction-detail', String(asset.id)))
                    }
                  />
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('scrap-auctions', '/scrap-auctions')}
                className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-[#142533] font-semibold text-xs sm:text-sm transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Recycle className="w-4 h-4 text-[#D89B30]" />
                <span>Explore Scrap Auctions</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('plant-machinery-auctions', '/plant-machinery-auctions')}
                className="px-6 py-3 rounded-xl bg-[#142533] hover:bg-[#203545] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <Cog className="w-4 h-4 text-[#D89B30]" />
                <span>Explore Plant &amp; Machinery Auctions</span>
                <ArrowRight className="w-4 h-4 text-[#D89B30]" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 4. DEDICATED & REDESIGNED: How We Work & The Process - Clean & Tight */}
      <section
        id="how-we-work"
        className="w-full bg-[#F8FAFC] border-y border-slate-200 py-8 sm:py-10 scroll-mt-20"
      >
        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 space-y-8">
          {/* Header with Clean Typography */}
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[#0F172A] text-xs font-mono font-bold uppercase tracking-wide">
              <span>HOW WE WORK &amp; THE PROCESS</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#142533] tracking-tight">
              From Discovery to Possession in 60 Days
            </h2>
            <p className="text-xs sm:text-sm text-[#5E7182] leading-relaxed">
              Bank auctions can feel intimidating without guidance. We eliminate friction and uncertainty through
              our structured 5-stage statutory protocol, proven over 15 years.
            </p>
          </div>

          {/* 5-Stage Roadmap Grid */}
          <div className="space-y-6">
            {/* Top 3 Stages */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {processStages.slice(0, 3).map((stage) => {
                const IconComponent = stage.icon;
                return (
                  <div
                    key={stage.step}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-2xs hover:shadow-md hover:border-[#D89B30]/60 transition-all duration-300 flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {/* Card Header with Step Numeral & Timeline Badge */}
                      <div className="flex items-center justify-between gap-2 border-b border-[#F1EFEA] pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-[#142533] text-[#D89B30] font-mono font-bold text-base flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                            {stage.step}
                          </div>
                          <div>
                            <span className="text-[11px] font-mono font-bold text-[#9A6007] uppercase tracking-wider block">
                              {stage.phase}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500">
                              {stage.timeline}
                            </span>
                          </div>
                        </div>

                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[#142533]">
                          <IconComponent className="w-4 h-4 text-[#D89B30]" />
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-serif text-lg font-bold text-[#142533] leading-snug">
                        {stage.title}
                      </h3>
                      <p className="text-xs text-[#475569] leading-relaxed">
                        {stage.desc}
                      </p>
                    </div>

                    {/* Deliverables Checklist */}
                    <div className="space-y-1.5 pt-3 border-t border-[#F1EFEA]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Key Deliverables:
                      </span>
                      {stage.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-[#334155]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span className="leading-snug">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom 2 Stages + Dedicated Guarantee Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {processStages.slice(3, 5).map((stage) => {
                const IconComponent = stage.icon;
                return (
                  <div
                    key={stage.step}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-2xs hover:shadow-md hover:border-[#D89B30]/60 transition-all duration-300 flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {/* Card Header with Step Numeral & Timeline Badge */}
                      <div className="flex items-center justify-between gap-2 border-b border-[#F1EFEA] pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-[#142533] text-[#D89B30] font-mono font-bold text-base flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                            {stage.step}
                          </div>
                          <div>
                            <span className="text-[11px] font-mono font-bold text-[#9A6007] uppercase tracking-wider block">
                              {stage.phase}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500">
                              {stage.timeline}
                            </span>
                          </div>
                        </div>

                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[#142533]">
                          <IconComponent className="w-4 h-4 text-[#D89B30]" />
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-serif text-lg font-bold text-[#142533] leading-snug">
                        {stage.title}
                      </h3>
                      <p className="text-xs text-[#475569] leading-relaxed">
                        {stage.desc}
                      </p>
                    </div>

                    {/* Deliverables Checklist */}
                    <div className="space-y-1.5 pt-3 border-t border-[#F1EFEA]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Key Deliverables:
                      </span>
                      {stage.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-[#334155]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span className="leading-snug">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* 3rd Card in bottom row: 60-Day Handover Assurance Card */}
              <div className="bg-[#142533] text-white rounded-2xl p-5 sm:p-6 border border-white/10 shadow-md flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-[11px] font-mono font-bold text-[#D89B30] uppercase tracking-wider">
                      STATUTORY ASSURANCE
                    </span>
                    <Clock className="w-4 h-4 text-[#D89B30]" />
                  </div>

                  <h3 className="font-serif text-lg font-bold text-white leading-snug">
                    Our 60-Day Possession Commitment
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Unlike standard purchases plagued by delays, bank auctions are statutory time-bound
                    mandates. We liaise with the Authorized Officer to guarantee registration and key handover within 60 days.
                  </p>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-[#D89B30]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Free Pre-Bid Consultation with Senior Legal Associates</span>
                  </div>

                  <a
                    href={`tel:${settings.primary_phone}`}
                    className="w-full py-2.5 rounded-xl bg-[#D89B30] hover:bg-[#C58920] text-[#142533] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Consult Our Experts: {settings.primary_phone}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SLIDER SECTION */}
      <section className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-8 sm:py-10">
        <TestimonialsSlider />
      </section>

      {/* Customer Requirement Section (Form 2) */}
      <section className="w-full bg-[#FAF8F5] border-t border-[#E5E0D5]">
        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-6 sm:py-8">
          <CustomerRequirementSection />
        </div>
      </section>

      {/* 6. WHY CHOOSE BANK AUCTIONS */}
      <section className="w-full bg-white border-y border-[#E2E8F0] py-8 sm:py-10">
        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D89B30]">
                THE AUCTION ADVANTAGE
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#142533] leading-tight">
                Why buy through bank auctions with Auctions &amp; More?
              </h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                Purchasing through verified bank auctions provides exceptional advantages over standard open-market real
                estate transactions, backed by statutory authority.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[#D89B30] flex-shrink-0 shadow-2xs">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#142533]">20% to 35% Discount to Market</h4>
                    <p className="text-xs text-[#64748B] pt-0.5">
                      Prices are benchmarked by certified IBBI valuers based on distress realization, giving buyers
                      instant equity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[#D89B30] flex-shrink-0 shadow-2xs">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#142533]">Statutory Title &amp; Court Backing</h4>
                    <p className="text-xs text-[#64748B] pt-0.5">
                      Transactions are governed by statutory sale certificates issued directly by Authorized Bank
                      Officers with full legal standing.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[#D89B30] flex-shrink-0 shadow-2xs">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#142533]">Fast-Track Possession Timeline</h4>
                    <p className="text-xs text-[#64748B] pt-0.5">
                      Our team coordinates with recovery managers to ensure sale certificate registration and physical
                      handover within 60 days.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Quote & Authority Box */}
            <div className="space-y-6">
              <div className="bg-slate-50 p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <blockquote className="font-serif text-lg sm:text-xl italic text-[#142533] leading-relaxed">
                  "{COMPANY_INFO.quote}"
                </blockquote>
                <div className="text-xs font-bold uppercase tracking-wider text-[#D89B30]">
                  — {COMPANY_INFO.quoteAuthor}
                </div>
              </div>

              <div className="bg-[#142533] text-white p-7 sm:p-8 rounded-3xl space-y-3 border border-white/10">
                <h4 className="font-bold text-sm text-[#D89B30] uppercase tracking-wider">
                  All Government Auction Authorities Covered
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  SBI &amp; PSU Banks · Debt Recovery Tribunal (DRT/DRAT) · NCLT Insolvency · Municipal Bodies · Income
                  Tax Department · Enforcement Directorate · Co-operative Banks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CONTACT CTA BANNER */}
      <AuctionCtaBanner onNavigate={onNavigate} />
    </div>
  );
};
