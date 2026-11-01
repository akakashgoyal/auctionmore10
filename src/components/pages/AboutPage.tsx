import React, { useState, useRef } from 'react';
import { COMPANY_INFO } from '../../data/companyInfo';
import { Property } from '../../types';
import { useApi } from '../../context/ApiContext';
import { TeamMembersSlider } from '../TeamMembersSlider';
import { formatINR } from '../../utils/storage';
import {
  ShieldCheck,
  Award,
  Building,
  Landmark,
  CheckCircle2,
  Phone,
  Mail,
  ArrowRight,
  Clock,
  FileCheck,
  Search,
  Scale,
  TrendingDown,
  Building2,
  Users,
  Briefcase,
  FileText,
  BadgeCheck,
  Gavel,
  Compass,
  MapPin,
  Sparkles,
  Calendar,
  Lock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PageRoute } from '../Navbar';
import { TestimonialsSlider } from '../TestimonialsSlider';
import { AuctionCtaBanner } from '../AuctionCtaBanner';
import { PropertyWatermark } from '../PropertyWatermark';

interface AboutPageProps {
  onNavigate: (page: PageRoute, customUrl?: string) => void;
  onSelectProperty?: (property: Property) => void;
  onExpressInterest?: (property: Property) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigate,
  onSelectProperty,
  onExpressInterest,
}) => {
  const { properties: apiProperties, homeProperties, settings, openEnquiryModal } = useApi();

  // Dynamic properties loaded from API (prefer isolated home properties or global properties)
  const propertyList = (homeProperties && homeProperties.length > 0) ? homeProperties : (apiProperties || []);
  const topFeaturedProperty = propertyList.length > 0 ? propertyList[0] : null;
  // Statutory Authorities Network Data for Grid Interface
  const authoritiesList = [
    {
      name: 'State Bank of India & PSU Banks',
      category: 'SARFAESI Recovery',
      badge: 'Public Sector Benches',
      description: 'Handling Section 13/14 e-auctions with Authorized Officers across SAMB and Stressed Asset branches nationwide.',
      icon: Landmark,
    },
    {
      name: 'DRT & DRAT Benches',
      category: 'Tribunal Enforcement',
      badge: 'Debts Recovery Appellate',
      description: 'Court-mandated recovery officer auctions, settlement decrees, and legal title conveyances under Section 19.',
      icon: Scale,
    },
    {
      name: 'NCLT Insolvency Liquidations',
      category: 'Corporate Insolvency',
      badge: 'IBC Section 35 Sales',
      description: 'Clean-slate corporate resolution sales with Section 32A immunity from past corporate liabilities.',
      icon: Gavel,
    },
    {
      name: 'Municipal & Urban Authorities',
      category: 'Civic Recovery',
      badge: 'Local Tax Deeds',
      description: 'Municipal corporation tax lien auction sales with verified property tax and betterment charge clearances.',
      icon: Building,
    },
    {
      name: 'Income Tax Department (TRO)',
      category: 'Central Revenue',
      badge: 'Tax Recovery Officer',
      description: 'Statutory e-auctions of seized real estate conducted under the Second Schedule to the Income-tax Act, 1961.',
      icon: FileCheck,
    },
    {
      name: 'Enforcement Directorate (PMLA)',
      category: 'Special Statutes',
      badge: 'Restitution Orders',
      description: 'Properties cleared for commercial release and restitution to legitimate financial creditors.',
      icon: ShieldCheck,
    },
    {
      name: 'State Governments & Revenue Depts',
      category: 'State Land Revenue',
      badge: 'Public Revenue Recovery',
      description: 'Industrial plots and commercial parcel sales under State Land Revenue Codes with verified title records.',
      icon: Building2,
    },
    {
      name: 'Leading Co-operative Banks',
      category: 'Co-op Bank Auctions',
      badge: 'Multi-State Co-op',
      description: 'Secured asset e-auctions under Co-operative Societies Acts and SARFAESI notifications.',
      icon: Landmark,
    },
    {
      name: 'Private Scheduled Commercial Banks',
      category: 'Private Sector Banking',
      badge: 'HDFC, ICICI, Axis & Kotak',
      description: 'High-value distressed penthouses, grade-A corporate IT offices, and retail showrooms under SARFAESI.',
      icon: Award,
    },
  ];

  // 15-Year Evolution Milestones
  const timelineMilestones = [
    {
      year: '2009',
      title: 'Inception as Eagle Capital Services',
      description:
        'Established by seasoned corporate bankers to resolve information asymmetry and legal opaque practices in stressed property auctions in North India.',
      badge: 'Foundation Era',
      stats: 'Initial ₹15 Cr Resolved',
    },
    {
      year: '2014',
      title: 'PSU Bank Recovery Empanelment',
      description:
        'Officially empaneled with premier PSU banks (SBI SAMB, Punjab National Bank, Bank of Baroda) for SARFAESI advisory and physical asset inspections.',
      badge: 'Institutional Scale',
      stats: '150+ Successful Auctions',
    },
    {
      year: '2018',
      title: 'Insolvency & NCLT Resolution Desk',
      description:
        'Pioneered investor bidding on corporate liquidations following the enactment of the Insolvency and Bankruptcy Code (IBC, 2016).',
      badge: 'Statutory Era',
      stats: 'Clean-Slate Asset Titles',
    },
    {
      year: '2022',
      title: '₹500+ Crores Milestone',
      description:
        'Surpassed half a thousand crores in cumulative resolved distress assets across commercial office buildings, industrial plots, and prime penthouses.',
      badge: 'National Track Record',
      stats: '12 Indian States Covered',
    },
    {
      year: 'Present',
      title: 'Incorporated as Auctions & More Pvt Ltd',
      description:
        'Transitioned into an integrated Private Limited platform, bringing end-to-end 30-year due diligence, e-auction bidding, and physical possession guarantees.',
      badge: 'Corporate Standard',
      stats: 'India’s #1 Auction Partner',
    },
  ];

  // 4 Core Institutional Pillars
  const corePillars = [
    {
      num: '01',
      title: 'Absolute Title Sovereignty',
      subtitle: '30-Year Sub-Registrar Audit',
      desc: 'We never list unverified assets. Every single property is subjected to an exhaustive 30-year sub-registrar encumbrance check, mutation verification, and court stay reviews by our empaneled advocates.',
      icon: ShieldCheck,
      deliverables: ['Sub-registrar 30-yr non-encumbrance certificate', 'Civil court & DRT stay order litigation audit', 'Revenue mutation & municipal tax no-dues verification'],
    },
    {
      num: '02',
      title: 'Upfront Distress Valuation',
      subtitle: '20% to 35% Instant Equity',
      desc: 'Property prices are benchmarked directly against IBBI certified valuation reports and prevailing circle rates, allowing buyers and institutions to acquire high-value assets significantly below market rate.',
      icon: TrendingDown,
      deliverables: ['IBBI registered valuer comparative market analysis', 'Ready reckoner / Circle rate variance report', 'Realizable vs distress liquidation value gap analysis'],
    },
    {
      num: '03',
      title: 'Flawless Statutory Filing',
      subtitle: 'Zero Disqualification Assurance',
      desc: 'From Class 3 Digital Signature (DSC) configurations and portal KYC verification to coordinating 10% EMD RTGS/DD transfers with the Authorized Officer, our transaction desk guarantees zero clerical rejections.',
      icon: FileCheck,
      deliverables: ['Class 3 DSC token configuration & mapping', 'Authorized Officer (AO) EMD deposit liaison', 'Live simulation & competitive bidding proxy assistance'],
    },
    {
      num: '04',
      title: '60-Day Physical Possession',
      subtitle: 'Orderly Rule 9 Execution',
      desc: 'Unlike delayed open-market deals, bank auctions operate under statutory timelines. We actively coordinate with Recovery Managers to execute Sale Certificates and peaceful key handovers within 60 days.',
      icon: Clock,
      deliverables: ['Section 14 CMM/DM physical possession enforcement', 'Rule 9 SARFAESI Sale Certificate execution', 'Peaceful lock changeover & on-site security transition'],
    },
  ];

  return (
    <div className="w-full flex flex-col space-y-0">
      {/* 1. HERO SECTION - High-Impact Architectural Split Bento */}
      <section className="relative w-full bg-gradient-to-b from-slate-50/70 via-white to-white text-[#142533] overflow-hidden pt-6 pb-8 sm:pt-8 sm:pb-10 lg:pt-8 lg:pb-12 border-b border-slate-200">
        {/* Subtle architectural backdrop */}
        <div
          className="absolute inset-0 opacity-[0.025] bg-cover bg-center mix-blend-multiply pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80')`,
          }}
        />
        <div className="absolute -top-32 right-1/4 w-96 h-96 rounded-full bg-slate-200/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-10 w-96 h-96 rounded-full bg-[#D89B30]/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Corporate Legacy & Story */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[#0F172A] text-xs font-mono font-bold tracking-wide shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-[#D89B30] flex-shrink-0" />
                <span>ABOUT AUCTIONS &amp; MORE PRIVATE LIMITED · EST. 2009</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#142533] leading-[1.14]">
                15 Years of Distressed Asset Leadership. <br />
                <span className="text-[#9A6007]">Now Incorporated as Auctions &amp; More.</span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed">
                Pioneered under the banner of <strong className="text-[#142533]">Eagle Capital Services</strong> in 2009, our advisory has guided
                hundreds of individual home buyers, business owners, and institutional investment desks through complex
                SARFAESI bank auctions, DRT debt settlements, and NCLT corporate liquidations.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <a
                  href="/properties"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('property', '/properties');
                  }}
                  className="px-6 py-3.5 rounded-xl bg-[#D89B30] hover:bg-[#C58920] text-[#142533] text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer inline-flex"
                >
                  <span>Explore Live Auction Inventory</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href={`tel:${settings.primary_phone}`}
                  className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-[#142533] text-xs sm:text-sm font-semibold transition-all shadow-2xs flex items-center gap-2 inline-flex"
                >
                  <Phone className="w-4 h-4 text-[#9A6007]" />
                  <span>Advisory Desk: {settings.primary_phone}</span>
                </a>

                <a
                  href="/contact"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('contact', '/contact');
                  }}
                  className="px-5 py-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer inline-flex"
                >
                  <Mail className="w-4 h-4 text-emerald-700" />
                  <span>Consult Legal Team</span>
                </a>
              </div>

              {/* Quick Institutional Highlights in Clean Light Cards */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="font-mono text-[#9A6007] font-extrabold text-lg sm:text-xl block">₹500 Cr+</span>
                  <span className="text-slate-500 font-medium">Resolved Assets</span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="font-mono text-[#9A6007] font-extrabold text-lg sm:text-xl block">15+ Years</span>
                  <span className="text-slate-500 font-medium">Continuous Practice</span>
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

            {/* Right Column: Visual Bento Box in Light Theme */}
            <div className="lg:col-span-5 relative">
              {/* Soft warm ambient glow behind card */}
              <div className="absolute -inset-3 bg-gradient-to-tr from-[#D89B30]/15 via-amber-200/20 to-transparent rounded-3xl blur-2xl pointer-events-none" />

              <div className="relative rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden space-y-0">
                {/* Dynamic Auction Asset Image / Corporate Architectural Image */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 group">
                  <img
                    src={
                      topFeaturedProperty?.images?.[0] ||
                      topFeaturedProperty?.rawImages?.[0]?.image_url ||
                      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
                    }
                    alt={topFeaturedProperty?.title || 'Featured Bank Mandate'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  {/* Brand Logo Watermark on Image (Center + Top-Right badge) */}
                  <PropertyWatermark variant="both" position="top-right" size="md" />

                  {/* Top Floating Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-20 pointer-events-none">
                    <span className="px-3.5 py-1.5 rounded-full bg-white/95 text-[#142533] text-[11px] font-mono font-bold border border-slate-200/80 backdrop-blur-md shadow-sm flex items-center gap-1.5 truncate max-w-[calc(100%-140px)]">
                      <Landmark className="w-3.5 h-3.5 text-[#9A6007] shrink-0" />
                      <span className="truncate">
                        {topFeaturedProperty
                          ? `${topFeaturedProperty.location?.city || topFeaturedProperty.cityName || topFeaturedProperty.location?.state || topFeaturedProperty.stateName || 'National'} · ${topFeaturedProperty.propertyType || 'Bank Auction'}`
                          : 'Headquarters · New Delhi'}
                      </span>
                    </span>
                  </div>

                  {/* Bottom Floating Info Plate */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/80 shadow-lg text-[#142533]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-[#9A6007] font-bold block uppercase tracking-wider truncate">
                        Statutory Bank Auction Mandate
                      </span>
                      <span className="text-[10px] font-bold bg-[#FAF1DE] text-[#9A6007] px-2 py-0.5 rounded-md shrink-0">
                        {topFeaturedProperty?.auctionCategory || 'SARFAESI Verified'}
                      </span>
                    </div>
                    <span className="font-bold text-sm sm:text-base text-[#142533] block truncate">
                      {topFeaturedProperty ? topFeaturedProperty.title : (settings?.primary_address || settings?.addresses?.[0] || 'Barakhamba Road, Connaught Place, New Delhi')}
                    </span>
                    <span className="text-slate-500 text-xs mt-0.5 block truncate">
                      {topFeaturedProperty
                        ? [topFeaturedProperty.location?.locality || topFeaturedProperty.areaName, topFeaturedProperty.location?.city || topFeaturedProperty.cityName, topFeaturedProperty.location?.state || topFeaturedProperty.stateName].filter(Boolean).join(', ')
                        : 'Heritage of Eagle Capital Services · Serving Distressed Debt Since 2009'}
                    </span>
                  </div>
                </div>

                {/* Sub-card: Verified Regulated Practice in Light Palette */}
                <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                      {topFeaturedProperty ? 'Verified Reserve & Mandate Due Diligence' : 'Mandate Compliance & Standards'}
                    </span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Title Audited
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-0.5">
                      <span className="text-slate-400 text-[10px] font-mono uppercase block font-semibold">
                        {topFeaturedProperty?.postAuctionPrice ? 'Bank Sale Price' : topFeaturedProperty ? 'Price' : 'Statutory Scope'}
                      </span>
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-[#142533] font-bold text-xs sm:text-sm block text-[#9A6007]">
                          {topFeaturedProperty
                            ? (topFeaturedProperty.postAuctionPrice ? formatINR(topFeaturedProperty.postAuctionPrice) : formatINR(topFeaturedProperty.reservePrice))
                            : 'SARFAESI & IBC 2016'}
                        </span>
                        {topFeaturedProperty?.postAuctionPrice && topFeaturedProperty.reservePrice > 0 && (
                          <span className="text-[10px] text-slate-400 line-through decoration-red-400/80 font-mono">
                            {formatINR(topFeaturedProperty.reservePrice)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 truncate block">
                        {topFeaturedProperty?.postAuctionPriceDate
                          ? `Offered: ${topFeaturedProperty.postAuctionPriceDate}`
                          : topFeaturedProperty && topFeaturedProperty.emdAmount
                          ? `EMD: ${formatINR(topFeaturedProperty.emdAmount)}`
                          : 'Sec. 13/14 Title Perfection'}
                      </span>
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-0.5">
                      <span className="text-slate-400 text-[10px] font-mono uppercase block font-semibold">
                        Due Diligence Standard
                      </span>
                      <span className="text-[#142533] font-bold text-xs sm:text-sm block truncate">
                        30-Year Title Search
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        Section 14 &amp; Clear Encumbrances
                      </span>
                    </div>
                  </div>

                  {/* Interactive Action Bar */}
                  {topFeaturedProperty ? (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectProperty) onSelectProperty(topFeaturedProperty);
                          else onNavigate('property');
                        }}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-[#142533] hover:bg-[#203545] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <span>View Auction Mandate</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#D89B30]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (onExpressInterest) onExpressInterest(topFeaturedProperty);
                          else openEnquiryModal(topFeaturedProperty);
                        }}
                        className="py-2.5 px-3 rounded-xl bg-[#FAF1DE] hover:bg-[#F5E6C7] text-[#9A6007] border border-[#D89B30]/40 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Enquire
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                      <Award className="w-4 h-4 text-[#D89B30] shrink-0" />
                      <span className="font-medium truncate">15+ Years Track Record · 30-Year Sub-Registrar Audits</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORPORATE CREDENTIALS & STATUTORY COMPLIANCE DUAL BENTO CARD */}
      <section className="w-full bg-white border-b border-slate-200 py-8 sm:py-10">
        <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 space-y-6">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D89B30]">
              CORPORATE GOVERNANCE &amp; STATUTORY COMPLIANCE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#142533]">
              The Institutional Standard in Distressed Assets
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Unlike unorganized brokers, Auctions &amp; More operates as a structured corporate advisory with empaneled
              advocates, registered valuers, and direct bank recovery liaisons.
            </p>
          </div>

          <div className="rounded-3xl bg-[#F8FAFC] border border-slate-200 shadow-2xs overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            {/* Left Pane: Corporate Details */}
            <div className="lg:col-span-7 p-8 sm:p-12 space-y-6 border-b lg:border-b-0 lg:border-r border-slate-200">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#9A6007] uppercase tracking-wider">
                  <BadgeCheck className="w-4 h-4 text-[#D89B30]" />
                  <span>OFFICIAL CORPORATE REGISTRATION &amp; HERITAGE</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#142533]">
                  Auctions &amp; More Private Limited
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Incorporated under the Indian Companies Act as a full-service auction resolution firm, bringing 15+ years
                  of proprietary transaction data and recovery relationships to our clients.
                </p>
              </div>

              {/* Verified Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
                  <span className="text-[11px] font-mono font-bold uppercase text-slate-400 block">
                    Institutional Heritage
                  </span>
                  <span className="font-bold text-sm sm:text-base text-[#142533] block">
                    Eagle Capital Services (Est. 2009)
                  </span>
                  <span className="text-xs text-slate-500">15+ Years Continuous Advisory</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
                  <span className="text-[11px] font-mono font-bold uppercase text-slate-400 block">
                    Cumulative Resolved Assets
                  </span>
                  <span className="font-serif text-xl font-extrabold text-[#9A6007] block">
                    ₹500+ Crores
                  </span>
                  <span className="text-xs text-slate-500">Across 12 Indian States</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
                  <span className="text-[11px] font-mono font-bold uppercase text-slate-400 block">
                    Principal Practice Focus
                  </span>
                  <span className="font-semibold text-xs sm:text-sm text-[#142533] block">
                    SARFAESI Act, 2002 &amp; IBC, 2016
                  </span>
                  <span className="text-xs text-slate-500">Bank Recovery &amp; NCLT Asset Sales</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
                  <span className="text-[11px] font-mono font-bold uppercase text-slate-400 block">
                    Corporate Address
                  </span>
                  <span className="font-semibold text-xs sm:text-sm text-[#142533] block">
                    Barakhamba Road, Connaught Place
                  </span>
                  <span className="text-xs text-slate-500">New Delhi 110001, India</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 text-xs text-slate-600 bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Empaneled High Court advocates conducting independent 30-year sub-registrar search reports in Delhi NCR, Mumbai, Bengaluru, and Chandigarh.</span>
              </div>
            </div>

            {/* Right Pane: Statutory Framework */}
            <div className="lg:col-span-5 bg-[#142533] text-white p-8 sm:p-12 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#D89B30] uppercase tracking-wider">
                  <Scale className="w-4 h-4 text-[#D89B30]" />
                  <span>STATUTORY MANDATE FRAMEWORK</span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-bold leading-snug">
                  Strict Legal Compliance &amp; Clean Title Perfection
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Every property acquired through our advisory is protected by statutory safeguards under Indian law:
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-[#D89B30] flex-shrink-0 mt-1" />
                    <span>
                      <strong className="text-white">Rule 9 SARFAESI Security Interest Rules:</strong> Official bank
                      Sale Certificates with direct statutory title standing that supersedes past unregistered liens.
                    </span>
                  </div>

                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-[#D89B30] flex-shrink-0 mt-1" />
                    <span>
                      <strong className="text-white">Section 14 CMM/DM Orders:</strong> Verification of physical
                      vacant possession warrants issued by Magistrates prior to auction bidding.
                    </span>
                  </div>

                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-[#D89B30] flex-shrink-0 mt-1" />
                    <span>
                      <strong className="text-white">Insolvency &amp; Bankruptcy Code (IBC 2016):</strong> Clean-slate
                      asset acquisition under Section 32A, protecting buyers from historic corporate dues.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <a
                  href={`tel:${settings.primary_phone}`}
                  className="w-full py-3.5 rounded-xl bg-[#D89B30] hover:bg-[#C58920] text-[#142533] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Legal &amp; Corporate Desk: {settings.primary_phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUR CORE INSTITUTIONAL PILLARS (Spacious 2-Column Architectural Layout) */}
      <section className="w-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 py-8 sm:py-10 space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[#142533] text-xs font-mono font-bold tracking-wide shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#D89B30] flex-shrink-0" />
            <span>OUR INSTITUTIONAL FOUNDATION</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#142533]">
            Four Pillars That Protect Every Client
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Engineered over 15 years to convert complex distressed assets into predictable, legally protected, high-yield acquisitions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {corePillars.map((p) => {
            const IconComp = p.icon;
            return (
              <div
                key={p.num}
                className="bg-white rounded-3xl p-8 sm:p-10 lg:p-11 border border-slate-200 shadow-2xs hover:border-[#D89B30] hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-8 group relative"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FAF1DE] border border-[#F3DFB4] text-[#9A6007] text-xs font-mono font-bold tracking-wider">
                      <span>PILLAR {p.num}</span>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 text-[#142533] group-hover:bg-[#FAF1DE] group-hover:text-[#9A6007] group-hover:border-[#D89B30]/40 transition-colors flex items-center justify-center shadow-2xs">
                      <IconComp className="w-7 h-7" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#142533] leading-tight">
                      {p.title}
                    </h3>
                    <span className="text-xs sm:text-sm font-mono font-bold text-[#9A6007] uppercase tracking-wider block">
                      {p.subtitle}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    Verified Statutory Deliverables &amp; Protections
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {p.deliverables.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50/90 hover:bg-white p-3.5 rounded-2xl border border-slate-200/80 hover:border-[#D89B30]/50 transition-all flex flex-col justify-between space-y-2 shadow-2xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="text-xs font-medium text-slate-700 leading-snug">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. THE 15-YEAR EVOLUTION TIMELINE - Stately & Clear */}
      <section className="w-full bg-[#F8FAFC] border-y border-slate-200 py-8 sm:py-10">
        <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 space-y-6">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D89B30]">
              OUR 15-YEAR EVOLUTION
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#142533]">
              From Sourcing Pioneer to Corporate Resolution Leader
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Tracing the journey of Eagle Capital Services into India’s most comprehensive auction resolution firm.
            </p>
          </div>

          {/* Timeline Staggered Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {timelineMilestones.map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-6 hover:border-[#D89B30] hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-3xl font-extrabold text-[#142533]">
                      {t.year}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase bg-[#FAF1DE] text-[#9A6007] px-2.5 py-1 rounded-md">
                      {t.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-[#142533] leading-snug">
                    {t.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-[#9A6007]">
                    {t.stats}
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-slate-400">
                    Step 0{idx + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ALL INDIA GOVERNMENT AUCTION AUTHORITIES NETWORK (Responsive Grid - No Scroll) */}
      <section className="w-full bg-[#F8FAFC] border-y border-slate-200 py-8 sm:py-10 space-y-6">
        <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 space-y-6">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[#142533] text-xs font-mono font-bold tracking-wide">
              <Landmark className="w-3.5 h-3.5 text-[#D89B30]" />
              <span>STATUTORY AUTHORITIES INTERFACE</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#142533]">
              Daily Interface with All Major National Recovery Tribunals
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our legal and recovery officers interface directly with Authorized Officers, DRT receivers, and official liquidators across 9 key Indian statutory authorities.
            </p>
          </div>

          {/* Clean Grid Layout - No Horizontal Scroll */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 pt-1">
            {authoritiesList.map((auth, idx) => {
              const IconComp = auth.icon;
              return (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-[#D89B30] hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-[#FAF1DE] text-[#9A6007] border border-[#F3DFB4] flex items-center justify-center group-hover:scale-105 transition-transform">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                        {auth.category}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-serif text-base sm:text-lg font-bold text-[#142533] leading-snug group-hover:text-[#9A6007] transition-colors">
                        {auth.name}
                      </h3>
                      <span className="text-xs font-mono font-semibold text-[#D89B30] block">
                        {auth.badge}
                      </span>
                    </div>

                    <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                      {auth.description}
                    </p>
                  </div>

                  <div className="pt-3.5 border-t border-slate-100 flex items-center gap-2 text-[11px] font-medium text-emerald-800 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/70">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Direct AO &amp; Receiver Liaison</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. LEADERSHIP & EXECUTIVE ADVISORY TEAM (DYNAMIC API SLIDER + READ MORE MODAL) */}
      <TeamMembersSlider />

      {/* 7. MEGLUX-STYLE MULTI-CARD TESTIMONIALS SLIDER SECTION */}
      <section className="w-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 py-6 sm:py-8">
        <TestimonialsSlider />
      </section>

      {/* 8. BOTTOM CALL TO ACTION BANNER WITH ARCHITECTURAL BACKGROUND IMAGE */}
      <AuctionCtaBanner onNavigate={onNavigate} />
    </div>
  );
};
