import React, { useState, useEffect, useRef } from 'react';
import { Logo } from './Logo';
import {
  Phone,
  Menu,
  X,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Share2,
  ChevronDown,
  Recycle,
  Cog,
  Landmark,
  Building2,
} from 'lucide-react';
import { useApi } from '../context/ApiContext';
import { getAuctionAssets, getAuthorityFilterMetadata } from '../services/api';
import { AuthorityInfo } from '../types';

export type PageRoute =
  | 'home'
  | 'about'
  | 'property'
  | 'property-detail'
  | 'authority-properties'
  | 'authority-wise-properties'
  | 'authority-property-detail'
  | 'scrap-auctions'
  | 'plant-machinery-auctions'
  | 'auction-detail'
  | 'auction-management'
  | 'blogs'
  | 'blog-detail'
  | 'faq'
  | 'contact'
  | 'privacy'
  | 'terms';

export interface NavbarProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute, customUrl?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [auctionMenuOpen, setAuctionMenuOpen] = useState(false);
  const [authorityMenuOpen, setAuthorityMenuOpen] = useState(false);
  const [mobileAuctionExpanded, setMobileAuctionExpanded] = useState(true);
  const [mobileAuthorityExpanded, setMobileAuthorityExpanded] = useState(true);

  const auctionDropdownRef = useRef<HTMLDivElement>(null);
  const authorityDropdownRef = useRef<HTMLDivElement>(null);
  const { settings, openCustomerRequirementModal, openShareModal } = useApi();

  // Dynamic Scrap & Plant Machinery active counts and subcategories strictly from backend API
  const [assetStats, setAssetStats] = useState<{
    scrapCount: number;
    activeScrapCount: number;
    machineryCount: number;
    activeMachineryCount: number;
    totalLots: number;
    activeTotalLots: number;
    scrapCategoriesWithCount: { name: string; count: number; activeCount: number }[];
    machineryCategoriesWithCount: { name: string; count: number; activeCount: number }[];
  }>({
    scrapCount: 0,
    activeScrapCount: 0,
    machineryCount: 0,
    activeMachineryCount: 0,
    totalLots: 0,
    activeTotalLots: 0,
    scrapCategoriesWithCount: [],
    machineryCategoriesWithCount: [],
  });

  // Dynamic Authority Properties count & authority list strictly from backend API
  const [authorityMeta, setAuthorityMeta] = useState<{
    totalCount: number;
    authorities: AuthorityInfo[];
  }>({
    totalCount: 0,
    authorities: [],
  });

  // Fetch real Scrap & Plant Machinery inventory + active counts strictly from backend API
  useEffect(() => {
    let isMounted = true;
    getAuctionAssets({ per_page: 100 })
      .then((res) => {
        if (!isMounted || !res || !res.assets) return;
        const items = res.assets;
        let scrapTotal = 0;
        let scrapActive = 0;
        let pmTotal = 0;
        let pmActive = 0;
        const scrapCatMap: Record<string, { count: number; activeCount: number }> = {};
        const pmCatMap: Record<string, { count: number; activeCount: number }> = {};

        items.forEach((item) => {
          const cat = (item.category || '').toLowerCase();
          const sub = (item.sub_type || '').trim();
          const isActive = (item.status || '').trim().toLowerCase() === 'active';

          if (cat.includes('scrap')) {
            scrapTotal++;
            if (isActive) scrapActive++;
            if (sub) {
              if (!scrapCatMap[sub]) scrapCatMap[sub] = { count: 0, activeCount: 0 };
              scrapCatMap[sub].count++;
              if (isActive) scrapCatMap[sub].activeCount++;
            }
          } else if (cat.includes('plant') || cat.includes('machinery')) {
            pmTotal++;
            if (isActive) pmActive++;
            if (sub) {
              if (!pmCatMap[sub]) pmCatMap[sub] = { count: 0, activeCount: 0 };
              pmCatMap[sub].count++;
              if (isActive) pmCatMap[sub].activeCount++;
            }
          }
        });

        const scrapCats = Object.entries(scrapCatMap)
          .map(([name, val]) => ({ name, count: val.count, activeCount: val.activeCount }))
          .sort((a, b) => b.activeCount - a.activeCount || b.count - a.count);

        const pmCats = Object.entries(pmCatMap)
          .map(([name, val]) => ({ name, count: val.count, activeCount: val.activeCount }))
          .sort((a, b) => b.activeCount - a.activeCount || b.count - a.count);

        setAssetStats({
          scrapCount: scrapTotal,
          activeScrapCount: scrapActive,
          machineryCount: pmTotal,
          activeMachineryCount: pmActive,
          totalLots: scrapTotal + pmTotal,
          activeTotalLots: scrapActive + pmActive,
          scrapCategoriesWithCount: scrapCats,
          machineryCategoriesWithCount: pmCats,
        });
      })
      .catch((err) => {
        console.warn('Navbar dynamic auction inventory note:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch real Authority Properties metadata strictly from backend API
  useEffect(() => {
    let isMounted = true;
    getAuthorityFilterMetadata()
      .then((meta) => {
        if (!isMounted || !meta) return;
        setAuthorityMeta({
          totalCount: meta.totalCount || 0,
          authorities: meta.authorities || [],
        });
      })
      .catch(() => {
        // Ignore silently
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (auctionDropdownRef.current && !auctionDropdownRef.current.contains(event.target as Node)) {
        setAuctionMenuOpen(false);
      }
      if (authorityDropdownRef.current && !authorityDropdownRef.current.contains(event.target as Node)) {
        setAuthorityMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body & html scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileMenuOpen]);

  // Clean URL mapping for top-level navigation links
  const navLinks: { id: PageRoute; label: string; href: string }[] = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'about', label: 'About Us', href: '/about' },
    { id: 'property', label: 'Auction Properties', href: '/properties' },
  ];

  const handleNav = (route: PageRoute, href?: string) => {
    onNavigate(route, href);
    setMobileMenuOpen(false);
    setAuctionMenuOpen(false);
    setAuthorityMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAuthorityActive =
    currentPage === 'authority-properties' ||
    currentPage === 'authority-wise-properties' ||
    currentPage === 'authority-property-detail';

  const isIndustrialActive =
    currentPage === 'scrap-auctions' ||
    currentPage === 'plant-machinery-auctions' ||
    currentPage === 'auction-detail';

  const cleanWhatsappNumber = (settings.whatsapp_number || settings.primary_phone || '919899897647').replace(/[^0-9]/g, '');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs">
      {/* Top minimal bar (Desktop / Tablet) */}
      <div className="bg-[#142533] text-slate-300 text-[11px] py-1 border-b border-white/10 hidden md:block">
        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-2 lg:gap-3 truncate">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D89B30] shrink-0" />
              <span className="truncate">{settings.company_name} · {settings.tagline}</span>
            </span>
            <span className="text-slate-600 hidden lg:inline">|</span>
            <span className="text-slate-400 hidden lg:inline truncate">SARFAESI · IBC / NCLT · Bank &amp; Authority Auctions</span>
          </div>

          <div className="flex items-center gap-3 lg:gap-4 font-mono text-[11px] shrink-0">
            <a
              href={`tel:${settings.primary_phone}`}
              className="flex items-center gap-1 text-slate-200 hover:text-[#D89B30] transition-colors"
            >
              <Phone className="w-3 h-3 text-[#D89B30] shrink-0" />
              <span>{settings.primary_phone}</span>
            </a>
            <span className="text-slate-600 hidden lg:inline">·</span>
            <a
              href={`mailto:${settings.primary_email}`}
              className="text-slate-300 hover:text-white transition-colors hidden lg:inline"
            >
              {settings.primary_email}
            </a>
            <span className="text-slate-600 hidden lg:inline">·</span>
            <button
              type="button"
              onClick={() => openShareModal(null, true)}
              className="flex items-center gap-1.5 text-slate-300 hover:text-[#D89B30] transition-colors cursor-pointer"
              title="Share Auctions & More Platform"
            >
              <Share2 className="w-3 h-3 text-[#D89B30] shrink-0" />
              <span>Share Website</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="w-full max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 h-14 sm:h-16 lg:h-18 flex items-center justify-between gap-2 lg:gap-3 xl:gap-5 flex-nowrap">
        {/* Brand Logo */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleNav('home', '/');
          }}
          className="cursor-pointer transition-opacity hover:opacity-95 flex-shrink-0"
          aria-label="Auctions and More Home"
        >
          <Logo size="sm" showSubtitle={false} className="sm:hidden" />
          <Logo size="md" className="hidden sm:flex" />
        </a>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 flex-nowrap flex-shrink-0">
          {navLinks.map((link) => {
            const isActive =
              currentPage === link.id ||
              (link.id === 'property' && currentPage === 'property-detail');
            return (
              <a
                key={link.id}
                id={`nav-link-${link.id}`}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(link.id, link.href);
                }}
                className={`relative px-2 py-1.5 xl:px-3 xl:py-2 text-xs xl:text-sm font-medium rounded-lg whitespace-nowrap transition-colors inline-block ${
                  isActive
                    ? 'text-[#142533] font-semibold bg-[#FAF1DE]/80'
                    : 'text-[#475569] hover:text-[#142533] hover:bg-slate-50'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 xl:left-3 xl:right-3 h-0.5 bg-[#D89B30] rounded-full" />
                )}
              </a>
            );
          })}

          {/* Dynamic Authority Properties Menu Item + Dropdown */}
          <div
            className="relative"
            ref={authorityDropdownRef}
            onMouseEnter={() => {
              setAuthorityMenuOpen(true);
              setAuctionMenuOpen(false);
            }}
            onMouseLeave={() => setAuthorityMenuOpen(false)}
          >
            <div
              className={`relative flex items-center rounded-lg whitespace-nowrap transition-colors ${
                isAuthorityActive
                  ? 'text-[#142533] font-semibold bg-[#FAF1DE]/80'
                  : 'text-[#475569] hover:text-[#142533] hover:bg-slate-50'
              }`}
            >
              <a
                id="nav-link-authority-properties"
                href="/authority-properties"
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('authority-properties', '/authority-properties');
                }}
                className="flex items-center gap-1.5 pl-2.5 pr-1 py-1.5 xl:pl-3.5 xl:py-2 text-xs xl:text-sm font-medium"
              >
                <span>Authority Properties</span>
              </a>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAuthorityMenuOpen((prev) => !prev);
                  setAuctionMenuOpen(false);
                }}
                aria-label="Toggle Authority Properties menu"
                aria-expanded={authorityMenuOpen}
                className="pr-2 pl-0.5 py-1.5 xl:pr-2.5 xl:py-2 cursor-pointer"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    authorityMenuOpen ? 'rotate-180 text-[#D89B30]' : 'text-slate-400'
                  }`}
                />
              </button>
              {isAuthorityActive && (
                <span className="absolute bottom-0 left-2 right-2 xl:left-3 xl:right-3 h-0.5 bg-[#D89B30] rounded-full pointer-events-none" />
              )}
            </div>

            {authorityMenuOpen && (
              <div className="absolute left-0 pt-2 w-[340px] z-50">
                <div className="rounded-2xl bg-white shadow-2xl border border-slate-200/90 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <span className="text-xs font-bold text-[#142533]">
                      Authority Properties
                    </span>
                    {authorityMeta.totalCount > 0 && (
                      <span className="text-[11px] font-mono font-semibold text-[#9A6007] tabular-nums">
                        {authorityMeta.totalCount} Published
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <a
                      href="/authority-properties"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNav('authority-properties', '/authority-properties');
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        currentPage === 'authority-properties'
                          ? 'bg-[#FAF1DE] text-[#142533]'
                          : 'text-[#142533] hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-[#D89B30] shrink-0" />
                        <span>All Authority Properties</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#D89B30]" />
                    </a>

                    <a
                      href="/authority-properties/authority"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNav('authority-wise-properties', '/authority-properties/authority');
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        currentPage === 'authority-wise-properties'
                          ? 'bg-[#FAF1DE] text-[#142533]'
                          : 'text-[#142533] hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#D89B30] shrink-0" />
                        <span>Authority-wise Properties</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  </div>

                  {authorityMeta.authorities.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="px-1 text-[11px] font-semibold text-slate-500">
                        Available Authorities
                      </div>
                      <div className="space-y-1 max-h-44 overflow-y-auto">
                        {authorityMeta.authorities.map((auth) => (
                          <a
                            key={auth.id}
                            href={`/authority-properties/authority/${auth.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              handleNav(
                                'authority-wise-properties',
                                `/authority-properties/authority/${auth.id}`
                              );
                            }}
                            className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#FAF1DE] border border-[#EAE3D2] text-xs font-medium text-[#142533] transition-colors"
                          >
                            <span className="truncate">
                              {auth.name}
                              {auth.short_name ? ` (${auth.short_name})` : ''}
                            </span>
                            <ArrowRight className="w-3 h-3 text-[#D89B30] shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Scrap & Plant Machinery Dropdown with Active Counts */}
          <div
            className="relative"
            ref={auctionDropdownRef}
            onMouseEnter={() => {
              setAuctionMenuOpen(true);
              setAuthorityMenuOpen(false);
            }}
            onMouseLeave={() => setAuctionMenuOpen(false)}
          >
            <button
              type="button"
              id="nav-link-scrap-machinery"
              onClick={() => {
                setAuctionMenuOpen((prev) => !prev);
                setAuthorityMenuOpen(false);
              }}
              aria-expanded={auctionMenuOpen}
              className={`relative flex items-center gap-1.5 px-2 py-1.5 xl:px-3 xl:py-2 text-xs xl:text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                isIndustrialActive
                  ? 'text-[#142533] font-semibold bg-[#FAF1DE]/80'
                  : 'text-[#475569] hover:text-[#142533] hover:bg-slate-50'
              }`}
            >
              <span>Scrap &amp; Machinery</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  auctionMenuOpen ? 'rotate-180 text-[#D89B30]' : 'text-slate-400'
                }`}
              />
              {isIndustrialActive && (
                <span className="absolute bottom-0 left-2 right-2 xl:left-3 xl:right-3 h-0.5 bg-[#D89B30] rounded-full" />
              )}
            </button>

            {/* Dynamic Dropdown Mega Menu */}
            {auctionMenuOpen && (
              <div className="absolute right-0 xl:left-1/2 xl:-translate-x-1/2 pt-2 w-[560px] z-50">
                <div className="rounded-2xl bg-white shadow-2xl border border-slate-200/90 p-4">
                  {/* Header bar */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-[#142533]">
                      Industrial Scrap &amp; Plant Machinery Auctions
                    </span>
                    {assetStats.activeTotalLots > 0 && (
                      <a
                        href="/scrap-auctions?category=All&status=Active"
                        onClick={(e) => {
                          e.preventDefault();
                          handleNav('scrap-auctions', '/scrap-auctions?category=All&status=Active');
                        }}
                        className="text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold font-mono tabular-nums underline underline-offset-2"
                      >
                        {assetStats.activeTotalLots} Active Auctions
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Column 1: Scrap Auctions */}
                    <div className="rounded-xl border border-amber-200/70 bg-[#FAF8F3] p-3 flex flex-col justify-between hover:border-amber-300 transition-colors">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="p-1.5 rounded-lg bg-amber-100/80 text-[#D89B30]">
                              <Recycle className="w-4 h-4" />
                            </div>
                            <h4 className="font-bold text-xs text-[#142533]">Scrap Auctions</h4>
                          </div>
                          <a
                            href="/scrap-auctions?status=Active"
                            onClick={(e) => {
                              e.preventDefault();
                              handleNav('scrap-auctions', '/scrap-auctions?status=Active');
                            }}
                            className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold font-mono tabular-nums transition-colors"
                            title="View Active Scrap Auctions"
                          >
                            {assetStats.activeScrapCount} Active
                          </a>
                        </div>

                        {assetStats.scrapCategoriesWithCount.length > 0 && (
                          <>
                            <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
                              Categories
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {assetStats.scrapCategoriesWithCount.map((cat) => (
                                <a
                                  key={cat.name}
                                  href={`/scrap-auctions?sub_type=${encodeURIComponent(cat.name)}&status=Active`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleNav(
                                      'scrap-auctions',
                                      `/scrap-auctions?sub_type=${encodeURIComponent(cat.name)}${
                                        cat.activeCount > 0 ? '&status=Active' : ''
                                      }`
                                    );
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-amber-200 text-[11px] text-[#142533] hover:bg-[#FAF1DE] hover:border-[#D89B30] transition-colors"
                                >
                                  <span>{cat.name}</span>
                                  <span className="text-[10px] font-mono tabular-nums text-emerald-700 font-semibold">
                                    ({cat.activeCount > 0 ? cat.activeCount : cat.count})
                                  </span>
                                </a>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      <a
                        href="/scrap-auctions"
                        onClick={(e) => {
                          e.preventDefault();
                          handleNav('scrap-auctions', '/scrap-auctions');
                        }}
                        className="w-full mt-2 py-2 px-3 rounded-lg bg-[#142533] hover:bg-[#203545] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>Explore Scrap Auctions</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#D89B30]" />
                      </a>
                    </div>

                    {/* Column 2: Plant & Machinery Auctions */}
                    <div className="rounded-xl border border-blue-200/70 bg-blue-50/30 p-3 flex flex-col justify-between hover:border-blue-300 transition-colors">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                              <Cog className="w-4 h-4" />
                            </div>
                            <h4 className="font-bold text-xs text-[#142533]">Plant &amp; Machinery</h4>
                          </div>
                          <a
                            href="/plant-machinery-auctions?status=Active"
                            onClick={(e) => {
                              e.preventDefault();
                              handleNav('plant-machinery-auctions', '/plant-machinery-auctions?status=Active');
                            }}
                            className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold font-mono tabular-nums transition-colors"
                            title="View Active Plant & Machinery Auctions"
                          >
                            {assetStats.activeMachineryCount} Active
                          </a>
                        </div>

                        {assetStats.machineryCategoriesWithCount.length > 0 && (
                          <>
                            <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
                              Categories
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {assetStats.machineryCategoriesWithCount.map((cat) => (
                                <a
                                  key={cat.name}
                                  href={`/plant-machinery-auctions?sub_type=${encodeURIComponent(cat.name)}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleNav(
                                      'plant-machinery-auctions',
                                      `/plant-machinery-auctions?sub_type=${encodeURIComponent(cat.name)}${
                                        cat.activeCount > 0 ? '&status=Active' : ''
                                      }`
                                    );
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-blue-200 text-[11px] text-[#142533] hover:bg-blue-50 hover:border-blue-400 transition-colors"
                                >
                                  <span>{cat.name}</span>
                                  <span className="text-[10px] font-mono tabular-nums text-emerald-700 font-semibold">
                                    ({cat.activeCount > 0 ? cat.activeCount : cat.count})
                                  </span>
                                </a>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      <a
                        href="/plant-machinery-auctions"
                        onClick={(e) => {
                          e.preventDefault();
                          handleNav('plant-machinery-auctions', '/plant-machinery-auctions');
                        }}
                        className="w-full mt-2 py-2 px-3 rounded-lg bg-[#142533] hover:bg-[#203545] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>Explore Plant &amp; Machinery</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#D89B30]" />
                      </a>
                    </div>
                  </div>

                  {/* Dropdown Bottom Bar */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Bank &amp; Institutional Auctions</span>
                    </span>
                    <a
                      href="/scrap-auctions?category=All"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNav('scrap-auctions', '/scrap-auctions?category=All');
                      }}
                      className="text-[#D89B30] hover:text-[#9A6007] font-semibold underline underline-offset-2"
                    >
                      View All Industrial Lots ({assetStats.totalLots})
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Desktop Right CTA Area */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 flex-shrink-0 whitespace-nowrap">
          <button
            type="button"
            onClick={openCustomerRequirementModal}
            className="flex items-center gap-1.5 px-3 py-1.5 xl:px-3.5 xl:py-2 rounded-xl bg-[#FAF1DE] hover:bg-[#F3E2BD] border border-[#D89B30]/40 text-[#9A6007] text-xs font-semibold transition-all whitespace-nowrap cursor-pointer"
            title="Tell Us What You Are Looking For"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D89B30] flex-shrink-0" />
            <span>Find My Property</span>
          </button>

          <a
            href="/properties"
            onClick={(e) => {
              e.preventDefault();
              handleNav('property', '/properties');
            }}
            className="px-3.5 py-2 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
          >
            <span>Explore Properties</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D89B30] flex-shrink-0" />
          </a>
        </div>

        {/* Mobile & Tablet Controls (<1024px) */}
        <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => openShareModal(null, true)}
            className="w-9 h-9 sm:w-auto sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-50 hover:bg-[#FAF1DE] border border-[#E2E8F0] text-[#142533] flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            title="Share Website"
            aria-label="Share Website"
          >
            <Share2 className="w-3.5 h-3.5 text-[#D89B30] shrink-0" />
            <span className="hidden sm:inline font-semibold text-xs">Share</span>
          </button>

          <button
            type="button"
            onClick={openCustomerRequirementModal}
            className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#FAF1DE] border border-[#D89B30]/40 text-[#9A6007] text-xs font-semibold flex items-center gap-1 hover:bg-[#F3E2BD] transition-colors cursor-pointer shrink-0"
            title="Post Your Requirement"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D89B30] shrink-0" />
            <span className="text-[11px] sm:text-xs">Inquire</span>
          </button>

          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[#E2E8F0] text-[#142533] hover:bg-slate-50 transition-colors flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#142533]" /> : <Menu className="w-5 h-5 text-[#142533]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation + Backdrop */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-2xs transition-opacity touch-none"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="relative z-50 lg:hidden border-t border-[#E2E8F0] bg-white px-4 py-4 space-y-2 shadow-2xl max-h-[calc(100vh-4.5rem)] overflow-y-auto">
            <div className="space-y-1.5">
              {navLinks.map((link) => {
                const isActive =
                  currentPage === link.id ||
                  (link.id === 'property' && currentPage === 'property-detail');
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNav(link.id, link.href);
                    }}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                      isActive
                        ? 'bg-[#142533] text-white font-semibold'
                        : 'text-[#475569] hover:bg-slate-50 hover:text-[#142533]'
                    }`}
                  >
                    <span>{link.label}</span>
                  </a>
                );
              })}

              {/* Authority Properties Expandable Group on Mobile */}
              <div className="border border-slate-200/80 rounded-2xl p-1 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setMobileAuthorityExpanded(!mobileAuthorityExpanded)}
                  className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                    isAuthorityActive ? 'bg-[#FAF1DE] text-[#142533]' : 'text-[#142533] hover:bg-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-[#D89B30]" />
                    <span>Authority Properties</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {authorityMeta.totalCount > 0 && (
                      <span className="text-[11px] font-mono font-bold text-[#9A6007] tabular-nums">
                        {authorityMeta.totalCount}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform ${
                        mobileAuthorityExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {mobileAuthorityExpanded && (
                  <div className="pt-1.5 pb-1 px-1 space-y-1.5">
                    <a
                      href="/authority-properties"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNav('authority-properties', '/authority-properties');
                      }}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#142533] hover:border-[#D89B30]"
                    >
                      <span>All Authority Properties</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#D89B30]" />
                    </a>

                    <a
                      href="/authority-properties/authority"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNav('authority-wise-properties', '/authority-properties/authority');
                      }}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#142533] hover:border-[#D89B30]"
                    >
                      <span>Authority-wise Properties</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </a>

                    {authorityMeta.authorities.map((auth) => (
                      <a
                        key={auth.id}
                        href={`/authority-properties/authority/${auth.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNav(
                            'authority-wise-properties',
                            `/authority-properties/authority/${auth.id}`
                          );
                        }}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] text-xs font-medium text-[#142533]"
                      >
                        <span className="truncate">
                          {auth.name}
                          {auth.short_name ? ` (${auth.short_name})` : ''}
                        </span>
                        <ArrowRight className="w-3 h-3 text-[#D89B30] shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Scrap & Machinery Expandable Group on Mobile */}
              <div className="border border-slate-200/80 rounded-2xl p-1 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setMobileAuctionExpanded(!mobileAuctionExpanded)}
                  className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                    isIndustrialActive ? 'bg-[#FAF1DE] text-[#142533]' : 'text-[#142533] hover:bg-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Cog className="w-4 h-4 text-[#D89B30]" />
                    <span>Scrap &amp; Plant Machinery</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {assetStats.activeTotalLots > 0 && (
                      <span className="text-[11px] font-mono font-bold text-emerald-700 tabular-nums">
                        {assetStats.activeTotalLots} Active
                      </span>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform ${
                        mobileAuctionExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {mobileAuctionExpanded && (
                  <div className="pt-2 pb-1 px-1 space-y-2">
                    {/* Scrap Auctions Mobile Item */}
                    <div className="p-2.5 rounded-xl bg-white border border-amber-200/80">
                      <div className="flex items-center justify-between">
                        <a
                          href="/scrap-auctions"
                          onClick={(e) => {
                            e.preventDefault();
                            handleNav('scrap-auctions', '/scrap-auctions');
                          }}
                          className="flex items-center gap-2 text-xs font-bold text-[#142533] hover:text-[#D89B30]"
                        >
                          <Recycle className="w-4 h-4 text-[#D89B30]" />
                          <span>Scrap Auctions</span>
                        </a>
                        <a
                          href="/scrap-auctions?status=Active"
                          onClick={(e) => {
                            e.preventDefault();
                            handleNav('scrap-auctions', '/scrap-auctions?status=Active');
                          }}
                          className="text-[11px] font-bold font-mono tabular-nums px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200"
                        >
                          {assetStats.activeScrapCount} Active
                        </a>
                      </div>
                      {assetStats.scrapCategoriesWithCount.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {assetStats.scrapCategoriesWithCount.map((cat) => (
                            <a
                              key={cat.name}
                              href={`/scrap-auctions?sub_type=${encodeURIComponent(cat.name)}`}
                              onClick={(e) => {
                                e.preventDefault();
                                handleNav(
                                  'scrap-auctions',
                                  `/scrap-auctions?sub_type=${encodeURIComponent(cat.name)}${
                                    cat.activeCount > 0 ? '&status=Active' : ''
                                  }`
                                );
                              }}
                              className="text-[10px] px-2 py-0.5 rounded bg-amber-50/60 text-slate-700 hover:bg-[#FAF1DE] border border-amber-100"
                            >
                              {cat.name} ({cat.activeCount > 0 ? cat.activeCount : cat.count})
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Plant & Machinery Mobile Item */}
                    <div className="p-2.5 rounded-xl bg-white border border-blue-200/80">
                      <div className="flex items-center justify-between">
                        <a
                          href="/plant-machinery-auctions"
                          onClick={(e) => {
                            e.preventDefault();
                            handleNav('plant-machinery-auctions', '/plant-machinery-auctions');
                          }}
                          className="flex items-center gap-2 text-xs font-bold text-[#142533] hover:text-blue-600"
                        >
                          <Cog className="w-4 h-4 text-blue-600" />
                          <span>Plant &amp; Machinery</span>
                        </a>
                        <a
                          href="/plant-machinery-auctions?status=Active"
                          onClick={(e) => {
                            e.preventDefault();
                            handleNav('plant-machinery-auctions', '/plant-machinery-auctions?status=Active');
                          }}
                          className="text-[11px] font-bold font-mono tabular-nums px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200"
                        >
                          {assetStats.activeMachineryCount} Active
                        </a>
                      </div>
                      {assetStats.machineryCategoriesWithCount.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {assetStats.machineryCategoriesWithCount.map((cat) => (
                            <a
                              key={cat.name}
                              href={`/plant-machinery-auctions?sub_type=${encodeURIComponent(cat.name)}`}
                              onClick={(e) => {
                                e.preventDefault();
                                handleNav(
                                  'plant-machinery-auctions',
                                  `/plant-machinery-auctions?sub_type=${encodeURIComponent(cat.name)}${
                                    cat.activeCount > 0 ? '&status=Active' : ''
                                  }`
                                );
                              }}
                              className="text-[10px] px-2 py-0.5 rounded bg-blue-50/60 text-slate-700 hover:bg-blue-100 border border-blue-100"
                            >
                              {cat.name} ({cat.activeCount > 0 ? cat.activeCount : cat.count})
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Buttons in Mobile Drawer */}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openCustomerRequirementModal();
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FAF1DE] text-[#9A6007] font-semibold text-xs border border-[#D89B30]/40 hover:bg-[#F3E2BD] transition-colors min-h-[44px] cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#D89B30]" />
                <span>Tell Us What You're Looking For</span>
              </button>

              <a
                href={`tel:${settings.primary_phone}`}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-50 text-[#142533] font-semibold text-xs border border-[#E2E8F0] min-h-[44px] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#D89B30]" />
                <span>Call Helpline: {settings.primary_phone}</span>
              </a>

              <a
                href={`https://wa.me/${cleanWhatsappNumber}?text=Hi%20Auctions%20%26%20More%2C%20I%20would%20like%20to%20inquire%20about%20bank%20auction%20properties.`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-xs min-h-[44px] transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Desk ({settings.whatsapp_number})</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openShareModal(null, true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FAF8F5] hover:bg-[#FAF1DE] text-[#9A6007] font-semibold text-xs border border-[#E8E2D5] min-h-[44px] transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-[#D89B30]" />
                <span>Share Auctions &amp; More Platform</span>
              </button>

              <a
                href="/properties"
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('property', '/properties');
                }}
                className="w-full text-center py-3 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs font-semibold min-h-[44px] flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View All Auction Properties</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D89B30]" />
              </a>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
