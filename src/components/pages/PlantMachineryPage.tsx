import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AuctionAsset,
  AuctionAssetPagination,
  AuctionAssetFilterParams,
  AuctionAssetFilterMetadata,
} from '../../types';
import { AuctionAssetCard } from '../AuctionAssetCard';
import {
  getAuctionAssets,
  getAuctionAssetFilterMetadata,
  invalidateAuctionAssetsCache,
  DEFAULT_AUCTION_ASSET_PAGINATION,
} from '../../services/api';
import {
  Search,
  SlidersHorizontal,
  X,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Cog,
  Sparkles,
  FileText,
} from 'lucide-react';
import { PageRoute } from '../Navbar';
import { getShareableUrl } from '../../utils/routes';
import { useApi } from '../../context/ApiContext';

interface PlantMachineryPageProps {
  onViewAuction: (asset: AuctionAsset) => void;
  onNavigate?: (page: PageRoute, customUrl?: string) => void;
}

const EMPTY_META: AuctionAssetFilterMetadata = {
  scrapSubTypes: [],
  machinerySubTypes: [],
  allSubTypes: [],
  states: [],
  citiesByState: {},
  allCities: [],
  banks: [],
  statuses: [],
  scrapCount: 0,
  machineryCount: 0,
  totalCount: 0,
};

function formatStatusOptionLabel(st: string): string {
  const lower = st.toLowerCase();
  if (lower === 'active') return 'Active';
  if (lower === 'upcoming') return 'Upcoming';
  if (lower === 'closed') return 'Closed';
  return st.charAt(0).toUpperCase() + st.slice(1);
}

export const PlantMachineryPage: React.FC<PlantMachineryPageProps> = ({
  onViewAuction,
  onNavigate,
}) => {
  const { openCustomerRequirementModal, openShareModal } = useApi();

  // Filter state
  const [search, setSearch] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [subType, setSubType] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      return sp.get('sub_type') || sp.get('subcategory') || 'All';
    }
    return 'All';
  });
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [bankName, setBankName] = useState<string>('All');
  const [status, setStatus] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      return sp.get('status') || 'All';
    }
    return 'All';
  });
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [auctionDate, setAuctionDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<'auction_date' | 'reserve_price' | 'created_at'>('auction_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Dynamic metadata from backend
  const [filterMeta, setFilterMeta] = useState<AuctionAssetFilterMetadata>(EMPTY_META);

  // Re-sync sub_type and status when URL search changes
  useEffect(() => {
    const syncFromUrl = () => {
      if (typeof window !== 'undefined') {
        const sp = new URLSearchParams(window.location.search);
        const urlSub = sp.get('sub_type') || sp.get('subcategory') || 'All';
        const urlStatus = sp.get('status') || 'All';
        setSubType(urlSub);
        setStatus(urlStatus);
        setCurrentPage(1);
      }
    };
    window.addEventListener('popstate', syncFromUrl);
    window.addEventListener('app-url-change', syncFromUrl);
    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      window.removeEventListener('app-url-change', syncFromUrl);
    };
  }, []);

  const loadFilterMetadata = useCallback(async (forceRefresh = false) => {
    const meta = await getAuctionAssetFilterMetadata(forceRefresh);
    setFilterMeta(meta);
  }, []);

  useEffect(() => {
    loadFilterMetadata();
  }, [loadFilterMetadata]);

  // Data state
  const [assets, setAssets] = useState<AuctionAsset[]>([]);
  const [pagination, setPagination] = useState<AuctionAssetPagination>(DEFAULT_AUCTION_ASSET_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic cities based on selected state
  const availableCities = useMemo(() => {
    if (selectedState && selectedState !== 'All') {
      return filterMeta.citiesByState[selectedState] || [];
    }
    return filterMeta.allCities;
  }, [selectedState, filterMeta]);

  // Fetch data from Laravel API
  const fetchPlantAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: AuctionAssetFilterParams = {
        category: 'Plant & Machinery',
        page: currentPage,
        per_page: 12,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (search.trim()) params.search = search.trim();
      if (referenceNo.trim()) params.reference_no = referenceNo.trim();
      if (subType !== 'All') params.sub_type = subType;
      if (selectedState !== 'All') params.state = selectedState;
      if (selectedCity !== 'All') params.city = selectedCity;
      if (bankName !== 'All') params.bank_name = bankName;
      if (status !== 'All') params.status = status;
      if (minPrice) params.min_price = Number(minPrice);
      if (maxPrice) params.max_price = Number(maxPrice);
      if (auctionDate) params.auction_date = auctionDate;

      const res = await getAuctionAssets(params);
      if (!res.success && res.message) {
        setError(res.message);
      }
      setAssets(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      console.error('Failed to load plant & machinery auction assets:', err);
      setError('Unable to load plant & machinery auctions from server. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    search,
    referenceNo,
    subType,
    selectedState,
    selectedCity,
    bankName,
    status,
    minPrice,
    maxPrice,
    auctionDate,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchPlantAssets();
  }, [fetchPlantAssets]);

  const handleManualRefresh = async () => {
    invalidateAuctionAssetsCache();
    await loadFilterMetadata(true);
    await fetchPlantAssets();
  };

  const resetFilters = () => {
    setSearch('');
    setReferenceNo('');
    setSubType('All');
    setSelectedState('All');
    setSelectedCity('All');
    setBankName('All');
    setStatus('All');
    setMinPrice('');
    setMaxPrice('');
    setAuctionDate('');
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    search,
    referenceNo,
    subType !== 'All',
    selectedState !== 'All',
    selectedCity !== 'All',
    bankName !== 'All',
    status !== 'All',
    minPrice,
    maxPrice,
    auctionDate,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#FBF9F5]">
      {/* Hero Header */}
      <div className="bg-[#142533] text-white pt-10 pb-12 sm:pb-14 relative overflow-hidden border-b border-[#D89B30]/20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3">
                <Cog className="w-3.5 h-3.5 text-[#D89B30]" />
                <span>Heavy Industry, Manufacturing Units &amp; Machinery</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif text-white tracking-tight">
                Plant &amp; Machinery Auctions
              </h1>
              <p className="mt-2.5 text-slate-300 text-sm sm:text-base leading-relaxed">
                Explore bank-authorized SARFAESI &amp; IBC auctions for industrial manufacturing plants, equipment, and factory machinery lots directly from published notices.
              </p>
            </div>

            {/* Quick Action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={openCustomerRequirementModal}
                className="px-5 py-3 rounded-xl bg-[#D89B30] hover:bg-[#C58920] text-[#142533] text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Post Machinery Requirement</span>
              </button>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('scrap-auctions', '/scrap-auctions')}
                  className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>View Scrap Auctions</span>
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Subcategory Filter Buttons (rendered strictly when backend returns subcategories) */}
          {filterMeta.machinerySubTypes.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
                <span>Available Machinery Subcategories</span>
                <span className="text-[11px] text-[#D89B30]">
                  {filterMeta.machinerySubTypes.length}{' '}
                  {filterMeta.machinerySubTypes.length === 1 ? 'Subcategory' : 'Subcategories'}
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => {
                    setSubType('All');
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    subType === 'All'
                      ? 'bg-[#D89B30] text-[#142533] shadow-sm'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  All Machinery ({pagination.total})
                </button>
                {filterMeta.machinerySubTypes.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSubType(cat);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer ${
                      subType === cat
                        ? 'bg-[#D89B30] text-[#142533] font-bold shadow-sm'
                        : 'bg-white/5 text-slate-300 hover:bg-white/15 hover:text-white border border-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-8">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs mb-8 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Title Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search plant & machinery by title, subcategory, city, state, or bank..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30]"
              />
            </div>

            {/* Reference Number Search */}
            <div className="relative md:w-56 shrink-0">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Reference No."
                value={referenceNo}
                onChange={(e) => {
                  setReferenceNo(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30]"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 ${
                isFiltersOpen || activeFiltersCount > 0
                  ? 'bg-[#FAF1DE] border-[#D89B30]/50 text-[#9A6007]'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-[#D89B30]" />
              <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>

            {/* Sort Dropdown */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb as 'auction_date' | 'reserve_price' | 'created_at');
                setSortOrder(so as 'asc' | 'desc');
                setCurrentPage(1);
              }}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#D89B30]/30 shrink-0 cursor-pointer"
            >
              <option value="auction_date-asc">Auction Date (Soonest)</option>
              <option value="auction_date-desc">Auction Date (Latest)</option>
              <option value="reserve_price-asc">Price: Low to High</option>
              <option value="reserve_price-desc">Price: High to Low</option>
              <option value="created_at-desc">Newly Listed</option>
            </select>
          </div>

          {/* Expandable Advanced Filters (Strictly Dynamic Backend Options) */}
          {isFiltersOpen && (
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in duration-150">
              {/* State Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">State</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedCity('All');
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                >
                  <option value="All">All States</option>
                  {filterMeta.states.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setCurrentPage(1);
                  }}
                  disabled={availableCities.length === 0}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#D89B30] disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="All">All Cities</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bank Name Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Bank / Seller</label>
                <select
                  value={bankName}
                  onChange={(e) => {
                    setBankName(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                >
                  <option value="All">All Institutions</option>
                  {filterMeta.banks.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Auction Status Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Auction Status</label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                >
                  <option value="All">All Statuses</option>
                  {filterMeta.statuses.map((st) => (
                    <option key={st} value={st}>
                      {formatStatusOptionLabel(st)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Reserve Price */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Min Reserve Price (₹)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                />
              </div>

              {/* Max Reserve Price */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Max Reserve Price (₹)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                />
              </div>

              {/* Auction Date Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Auction Date (On/After)</label>
                <input
                  type="date"
                  value={auctionDate}
                  onChange={(e) => {
                    setAuctionDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                />
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <div className="flex items-end justify-end pb-1">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear all filters</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Listings Result Count & Refresh */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm font-medium text-slate-700">
            Showing <strong className="text-[#142533]">{assets.length}</strong> of{' '}
            <strong className="text-[#142533]">{pagination.total}</strong> Plant &amp; Machinery Assets
            {subType !== 'All' && (
              <span className="ml-2 text-blue-700 text-xs font-semibold">
                · Subcategory: {subType}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#142533] bg-white border border-slate-200 px-3 py-1.5 rounded-xl cursor-pointer disabled:opacity-50"
            title="Refresh Listings"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#D89B30]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-10 h-10 text-[#D89B30] animate-spin mb-4" />
            <div className="text-base font-bold text-[#142533]">Loading Plant &amp; Machinery Auctions...</div>
            <div className="text-xs text-slate-500 mt-1">Fetching live auction records</div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto my-12">
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              type="button"
              onClick={handleManualRefresh}
              className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : assets.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-2xl mx-auto my-8 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-200/50">
              <Cog className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-serif text-[#142533]">
              No Plant &amp; Machinery Auctions Found
            </h3>
            <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
              No auction listings match your current filters. Try resetting filters or adjusting your search criteria.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
              <button
                type="button"
                onClick={openCustomerRequirementModal}
                className="px-4 py-2 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D89B30]" />
                <span>Submit Machinery Requirement</span>
              </button>
            </div>
          </div>
        ) : (
          /* Grid of AuctionAssetCard */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <AuctionAssetCard
                key={asset.id}
                asset={asset}
                onViewDetails={onViewAuction}
                onShare={() =>
                  openShareModal(null, true, getShareableUrl('auction-detail', String(asset.id)))
                }
              />
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.last_page > 1 && (
          <div className="mt-12 flex items-center justify-between border-t border-slate-200/80 pt-6">
            <div className="text-xs text-slate-500">
              Page <strong className="text-slate-800">{pagination.current_page}</strong> of{' '}
              <strong className="text-slate-800">{pagination.last_page}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1 || loading}
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((pg) => {
                  if (
                    pg === 1 ||
                    pg === pagination.last_page ||
                    (pg >= currentPage - 1 && pg <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pg}
                        type="button"
                        onClick={() => {
                          setCurrentPage(pg);
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentPage === pg
                            ? 'bg-[#142533] text-white shadow-xs'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  }
                  if (pg === 2 && currentPage > 3) {
                    return <span key="ellipsis-1" className="px-1 text-slate-400">...</span>;
                  }
                  if (pg === pagination.last_page - 1 && currentPage < pagination.last_page - 2) {
                    return <span key="ellipsis-2" className="px-1 text-slate-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                type="button"
                disabled={currentPage >= pagination.last_page || loading}
                onClick={() => {
                  setCurrentPage((p) => p + 1);
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
