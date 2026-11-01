import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  AuthorityInfo,
  AuthorityProperty,
  AuthorityPropertyPagination,
  AuthorityPropertyFilterParams,
  AuthorityFilterMetadata,
} from '../../types';
import {
  getAuthorityPropertiesByAuthority,
  getAuthorityFilterMetadata,
  DEFAULT_AUTHORITY_PAGINATION,
} from '../../services/api';
import { AuthorityPropertyCard } from '../AuthorityPropertyCard';
import { PageRoute } from '../Navbar';
import {
  Search,
  SlidersHorizontal,
  X,
  Landmark,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  MapPin,
} from 'lucide-react';

export interface AuthorityWisePropertiesPageProps {
  authorityId?: number | null;
  onSelectProperty: (property: AuthorityProperty) => void;
  onSelectAuthority: (authorityId: number) => void;
  onBackToAll: () => void;
  onNavigate?: (page: PageRoute, customUrl?: string) => void;
}

type SortPreset =
  | 'latest'
  | 'oldest'
  | 'price_asc'
  | 'price_desc'
  | 'upcoming'
  | 'end_date';

const SORT_OPTIONS: {
  value: SortPreset;
  label: string;
  sort_by: string;
  sort_order: 'asc' | 'desc';
}[] = [
  { value: 'latest', label: 'Latest Properties', sort_by: 'created_at', sort_order: 'desc' },
  { value: 'oldest', label: 'Oldest Properties', sort_by: 'created_at', sort_order: 'asc' },
  { value: 'price_asc', label: 'Lowest Reserve Price', sort_by: 'reserve_price', sort_order: 'asc' },
  { value: 'price_desc', label: 'Highest Reserve Price', sort_by: 'reserve_price', sort_order: 'desc' },
  { value: 'upcoming', label: 'Upcoming Auctions', sort_by: 'auction_start_at', sort_order: 'asc' },
  { value: 'end_date', label: 'Auction End Date', sort_by: 'auction_end_at', sort_order: 'asc' },
];

export const AuthorityWisePropertiesPage: React.FC<AuthorityWisePropertiesPageProps> = ({
  authorityId: propAuthorityId,
  onSelectProperty,
  onSelectAuthority,
  onBackToAll,
}) => {
  const [resolvedAuthorityId, setResolvedAuthorityId] = useState<number | null>(
    propAuthorityId && propAuthorityId > 0 ? propAuthorityId : null
  );
  const [authority, setAuthority] = useState<AuthorityInfo | null>(null);
  const [properties, setProperties] = useState<AuthorityProperty[]>([]);
  const [pagination, setPagination] = useState<AuthorityPropertyPagination>(DEFAULT_AUTHORITY_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterMeta, setFilterMeta] = useState<AuthorityFilterMetadata>({
    authorities: [],
    propertyTypes: [],
    propertySubTypes: [],
    states: [],
    cities: [],
    statuses: [],
    totalCount: 0,
  });

  // Search, sort, filters & pagination
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [propertySubType, setPropertySubType] = useState('');
  const [stateId, setStateId] = useState('');
  const [cityId, setCityId] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [status, setStatus] = useState('');
  const [sortPreset, setSortPreset] = useState<SortPreset>('latest');
  const [perPage, setPerPage] = useState<number>(12);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const activeRequestRef = useRef(0);

  // Sync when propAuthorityId changes
  useEffect(() => {
    if (propAuthorityId && propAuthorityId > 0) {
      setResolvedAuthorityId(propAuthorityId);
      setCurrentPage(1);
    }
  }, [propAuthorityId]);

  // Load metadata & resolve default authority if none specified in URL
  useEffect(() => {
    let mounted = true;
    getAuthorityFilterMetadata().then((meta) => {
      if (!mounted) return;
      setFilterMeta(meta);
      if ((!propAuthorityId || propAuthorityId <= 0) && meta.authorities.length > 0) {
        const firstId = meta.authorities[0].id;
        setResolvedAuthorityId(firstId);
        onSelectAuthority(firstId);
      } else if ((!propAuthorityId || propAuthorityId <= 0) && meta.authorities.length === 0) {
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [propAuthorityId, onSelectAuthority]);

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch((prev) => {
        if (prev !== searchInput) {
          setCurrentPage(1);
        }
        return searchInput;
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Cities filtered by selected state
  const filteredCities = useMemo(() => {
    if (!stateId) return filterMeta.cities;
    const numericState = Number(stateId);
    return filterMeta.cities.filter(
      (c) => c.state_id === undefined || c.state_id === null || Number(c.state_id) === numericState
    );
  }, [filterMeta.cities, stateId]);

  // Fetch authority profile + authority properties via GET /authority-properties/authority/{authorityId}
  const fetchAuthorityData = useCallback(async () => {
    if (!resolvedAuthorityId) return;

    const reqId = ++activeRequestRef.current;
    setLoading(true);
    setError(null);

    const sortConfig = SORT_OPTIONS.find((s) => s.value === sortPreset) || SORT_OPTIONS[0];
    const params: AuthorityPropertyFilterParams = {
      search: debouncedSearch.trim() || undefined,
      property_type: propertyType || undefined,
      property_sub_type: propertySubType || undefined,
      state_id: stateId || undefined,
      city_id: cityId || undefined,
      min_price: minPrice.trim() || undefined,
      max_price: maxPrice.trim() || undefined,
      status: status || undefined,
      sort_by: sortConfig.sort_by,
      sort_order: sortConfig.sort_order,
      per_page: perPage,
      page: currentPage,
    };

    try {
      const res = await getAuthorityPropertiesByAuthority(resolvedAuthorityId, params);
      if (reqId !== activeRequestRef.current) return;

      if (res.success) {
        if (res.authority) {
          setAuthority(res.authority);
        } else {
          const fallbackAuth = filterMeta.authorities.find((a) => a.id === resolvedAuthorityId) || null;
          setAuthority(fallbackAuth);
        }
        setProperties(res.properties);
        setPagination(res.pagination);
      } else {
        setProperties([]);
        setError(res.message || 'Unable to load properties for this authority.');
      }
    } catch {
      if (reqId === activeRequestRef.current) {
        setProperties([]);
        setError('Network error while connecting to the server.');
      }
    } finally {
      if (reqId === activeRequestRef.current) {
        setLoading(false);
      }
    }
  }, [
    resolvedAuthorityId,
    debouncedSearch,
    propertyType,
    propertySubType,
    stateId,
    cityId,
    minPrice,
    maxPrice,
    status,
    sortPreset,
    perPage,
    currentPage,
    filterMeta.authorities,
  ]);

  useEffect(() => {
    fetchAuthorityData();
  }, [fetchAuthorityData]);

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setPropertyType('');
    setPropertySubType('');
    setStateId('');
    setCityId('');
    setMinPrice('');
    setMaxPrice('');
    setStatus('');
    setSortPreset('latest');
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    debouncedSearch.trim(),
    propertyType,
    propertySubType,
    stateId,
    cityId,
    minPrice.trim(),
    maxPrice.trim(),
    status,
  ].filter(Boolean).length;

  const pageNumbers = useMemo(() => {
    const totalPages = pagination.last_page || 1;
    const current = pagination.current_page || 1;
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);
    for (let i = adjustedStart; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [pagination.current_page, pagination.last_page]);

  const authorityLocation = [authority?.city, authority?.state].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-[#FBF9F5] pb-20">
      {/* Top Breadcrumb & Authority Switcher Bar */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-3 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToAll}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#142533] hover:text-[#D89B30] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#D89B30]" />
            <span>Back to All Authority Properties</span>
          </button>

          {filterMeta.authorities.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Switch Authority:</span>
              <select
                value={resolvedAuthorityId ? String(resolvedAuthorityId) : ''}
                onChange={(e) => {
                  const nextId = Number(e.target.value);
                  if (nextId > 0) {
                    handleResetFilters();
                    onSelectAuthority(nextId);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#142533] focus:outline-hidden focus:border-[#D89B30]"
              >
                {filterMeta.authorities.map((auth) => (
                  <option key={auth.id} value={String(auth.id)}>
                    {auth.name}{auth.short_name ? ` (${auth.short_name})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Selected Authority Information Header (Strictly showing fields present in backend) */}
      <section className="bg-[#142533] text-white py-10 sm:py-12 border-b border-[#D89B30]/20">
        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          {loading && !authority ? (
            <div className="animate-pulse space-y-3 max-w-2xl">
              <div className="h-4 bg-white/15 rounded w-40" />
              <div className="h-9 bg-white/15 rounded w-3/4" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
            </div>
          ) : authority ? (
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-[#D89B30]">
                  <Landmark className="w-4 h-4 text-[#D89B30]" />
                  <span>Authority Profile &amp; Property Inventory</span>
                  {authority.short_name && (
                    <>
                      <span className="text-slate-500">·</span>
                      <span className="text-white font-bold">{authority.short_name}</span>
                    </>
                  )}
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  {authority.name}
                  {authority.short_name ? ` (${authority.short_name})` : ''}
                </h1>

                {authority.description && (
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                    {authority.description}
                  </p>
                )}

                {authorityLocation && (
                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D89B30] shrink-0" />
                      <span>{authorityLocation}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Authority Property Count Summary */}
              <div className="bg-white/5 border border-white/15 rounded-2xl px-6 py-4 shrink-0 min-w-[200px]">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                  Published Listings
                </span>
                <span className="font-serif text-3xl font-extrabold text-[#D89B30] tabular-nums mt-1 block">
                  {pagination.total}
                </span>
                <span className="text-xs text-slate-300 mt-0.5 block">
                  {pagination.total === 1 ? 'Property Available' : 'Properties Available'}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h1 className="font-serif text-3xl font-bold text-white">Authority-wise Properties</h1>
              <p className="text-sm text-slate-300">
                Select an authority to view its profile and published property listings.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Search, Filters, Listings & Pagination */}
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 pt-8 space-y-6">
        {/* Search & Filters Bar */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setDebouncedSearch(searchInput);
                setCurrentPage(1);
              }}
              className="relative flex-1"
            >
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={`Search properties under ${authority?.short_name || authority?.name || 'this authority'}...`}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs sm:text-sm text-[#142533] placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setDebouncedSearch('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <label htmlFor="auth-wise-sort" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                  Sort by:
                </label>
                <select
                  id="auth-wise-sort"
                  value={sortPreset}
                  onChange={(e) => {
                    setSortPreset(e.target.value as SortPreset);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs font-semibold text-[#142533] focus:bg-white focus:outline-hidden focus:border-[#D89B30] cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                className="lg:hidden px-3.5 py-2.5 rounded-xl bg-[#FAF1DE] border border-[#D89B30]/40 text-[#9A6007] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}</span>
              </button>
            </div>
          </div>

          {/* Filter Grid */}
          <div className={`${showFiltersMobile ? 'grid' : 'hidden lg:grid'} grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100`}>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Property Type
              </label>
              <select
                value={propertyType}
                onChange={(e) => {
                  setPropertyType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs text-[#142533]"
              >
                <option value="">All Property Types</option>
                {filterMeta.propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Property Sub Type
              </label>
              <select
                value={propertySubType}
                onChange={(e) => {
                  setPropertySubType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs text-[#142533]"
              >
                <option value="">All Sub Types</option>
                {filterMeta.propertySubTypes.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                State
              </label>
              <select
                value={stateId}
                onChange={(e) => {
                  setStateId(e.target.value);
                  setCityId('');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs text-[#142533]"
              >
                <option value="">All States</option>
                {filterMeta.states.map((st) => (
                  <option key={st.id} value={String(st.id)}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                City
              </label>
              <select
                value={cityId}
                onChange={(e) => {
                  setCityId(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs text-[#142533]"
              >
                <option value="">All Cities</option>
                {filteredCities.map((ct) => (
                  <option key={ct.id} value={String(ct.id)}>
                    {ct.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs text-[#142533]"
              >
                <option value="">All Statuses</option>
                {filterMeta.statuses.map((st) => (
                  <option key={st} value={st}>
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Min Reserve Price (INR)
              </label>
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Min price"
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs text-[#142533] font-mono tabular-nums placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Max Reserve Price (INR)
              </label>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Max price"
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs text-[#142533] font-mono tabular-nums placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Results Per Page
              </label>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs font-mono text-[#142533]"
              >
                <option value={12}>12 Properties</option>
                <option value={24}>24 Properties</option>
                <option value={48}>48 Properties</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span className="tabular-nums">
              {loading
                ? 'Loading authority properties...'
                : pagination.total > 0
                ? `Showing ${pagination.from ?? 1}–${pagination.to ?? properties.length} of ${pagination.total} properties`
                : 'No properties matched'}
            </span>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters ({activeFiltersCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
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
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white rounded-3xl border border-rose-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif text-xl font-bold text-[#142533]">
                Unable to Load Properties
              </h2>
              <p className="text-sm text-slate-600">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchAuthorityData}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-[#D89B30]" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && properties.length === 0 && (
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-10 sm:p-14 text-center max-w-xl mx-auto shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF1DE] text-[#9A6007] flex items-center justify-center mx-auto">
              <Landmark className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-serif text-xl font-bold text-[#142533]">
                No Properties Found
              </h2>
              <p className="text-sm text-slate-600">
                {activeFiltersCount > 0
                  ? 'No published properties for this authority match your current search or filters.'
                  : 'There are currently no published properties listed under this authority.'}
              </p>
            </div>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[#D89B30]" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        )}

        {/* Property Cards Grid & Pagination */}
        {!loading && !error && properties.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <AuthorityPropertyCard
                  key={prop.id}
                  property={prop}
                  onViewDetails={onSelectProperty}
                />
              ))}
            </div>

            {pagination.last_page > 1 && (
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border border-[#E2E8F0] p-4">
                <div className="text-xs text-slate-600 tabular-nums">
                  Page <strong className="text-[#142533]">{pagination.current_page}</strong> of{' '}
                  <strong className="text-[#142533]">{pagination.last_page}</strong> ({pagination.total} total)
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={pagination.current_page <= 1}
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#142533] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {pageNumbers.map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-9 h-9 rounded-xl text-xs font-bold font-mono tabular-nums transition-colors cursor-pointer ${
                        pageNum === pagination.current_page
                          ? 'bg-[#142533] text-white'
                          : 'bg-slate-50 hover:bg-[#FAF1DE] text-[#142533] border border-[#E2E8F0]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={pagination.current_page >= pagination.last_page}
                    onClick={() => {
                      setCurrentPage((p) => Math.min(pagination.last_page, p + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#142533] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
