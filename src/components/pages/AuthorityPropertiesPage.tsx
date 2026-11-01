import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  AuthorityProperty,
  AuthorityPropertyPagination,
  AuthorityPropertyFilterParams,
  AuthorityFilterMetadata,
} from '../../types';
import {
  getAuthorityProperties,
  getAuthorityFilterMetadata,
  DEFAULT_AUTHORITY_PAGINATION,
} from '../../services/api';
import {
  AuthorityPropertyCard,
  formatAuthorityDateTime,
  formatAreaValue,
  getStatusLabelAndColor,
} from '../AuthorityPropertyCard';
import { formatINR } from '../../utils/storage';
import { PageRoute } from '../Navbar';
import { useApi } from '../../context/ApiContext';
import {
  Search,
  SlidersHorizontal,
  X,
  Landmark,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  ArrowRight,
  Sparkles,
  Phone,
  MapPin,
  Bell,
} from 'lucide-react';

export interface AuthorityPropertiesPageProps {
  onSelectProperty: (property: AuthorityProperty) => void;
  onSelectAuthority: (authorityId: number) => void;
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

function parseInitialQueryParams() {
  if (typeof window === 'undefined') {
    return {
      search: '',
      authority_id: '',
      property_type: '',
      property_sub_type: '',
      state_id: '',
      city_id: '',
      min_price: '',
      max_price: '',
      status: '',
      sort: 'latest' as SortPreset,
      per_page: 12,
      page: 1,
    };
  }
  const sp = new URLSearchParams(window.location.search);
  const sortBy = sp.get('sort_by') || '';
  const sortOrder = sp.get('sort_order') || '';
  let sort: SortPreset = 'latest';
  if (sortBy === 'created_at' && sortOrder === 'asc') sort = 'oldest';
  else if (sortBy === 'reserve_price' && sortOrder === 'asc') sort = 'price_asc';
  else if (sortBy === 'reserve_price' && sortOrder === 'desc') sort = 'price_desc';
  else if (sortBy === 'auction_start_at') sort = 'upcoming';
  else if (sortBy === 'auction_end_at') sort = 'end_date';

  return {
    search: sp.get('search') || '',
    authority_id: sp.get('authority_id') || '',
    property_type: sp.get('property_type') || '',
    property_sub_type: sp.get('property_sub_type') || '',
    state_id: sp.get('state_id') || '',
    city_id: sp.get('city_id') || '',
    min_price: sp.get('min_price') || '',
    max_price: sp.get('max_price') || '',
    status: sp.get('status') || '',
    sort,
    per_page: Number(sp.get('per_page')) || 12,
    page: Math.max(1, Number(sp.get('page')) || 1),
  };
}

export const AuthorityPropertiesPage: React.FC<AuthorityPropertiesPageProps> = ({
  onSelectProperty,
  onSelectAuthority,
}) => {
  const { settings, openCustomerRequirementModal, openAuthorityEnquiryModal } = useApi();
  const initial = useMemo(() => parseInitialQueryParams(), []);

  // Filter & query states
  const [searchInput, setSearchInput] = useState(initial.search);
  const [debouncedSearch, setDebouncedSearch] = useState(initial.search);
  const [authorityId, setAuthorityId] = useState(initial.authority_id);
  const [propertyType, setPropertyType] = useState(initial.property_type);
  const [propertySubType, setPropertySubType] = useState(initial.property_sub_type);
  const [stateId, setStateId] = useState(initial.state_id);
  const [cityId, setCityId] = useState(initial.city_id);
  const [minPrice, setMinPrice] = useState(initial.min_price);
  const [maxPrice, setMaxPrice] = useState(initial.max_price);
  const [status, setStatus] = useState(initial.status);
  const [sortPreset, setSortPreset] = useState<SortPreset>(initial.sort);
  const [perPage, setPerPage] = useState<number>(initial.per_page);
  const [currentPage, setCurrentPage] = useState<number>(initial.page);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Data & metadata from backend
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

  const activeRequestRef = useRef(0);

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

  // Load dynamic filter options strictly from backend records
  useEffect(() => {
    let mounted = true;
    getAuthorityFilterMetadata().then((meta) => {
      if (mounted) {
        setFilterMeta(meta);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Re-sync filters when URL changes via header navigation or browser Back/Forward
  useEffect(() => {
    const syncFromUrl = () => {
      if (typeof window === 'undefined' || window.location.pathname !== '/authority-properties') return;
      const parsed = parseInitialQueryParams();
      setSearchInput(parsed.search);
      setDebouncedSearch(parsed.search);
      setAuthorityId(parsed.authority_id);
      setPropertyType(parsed.property_type);
      setPropertySubType(parsed.property_sub_type);
      setStateId(parsed.state_id);
      setCityId(parsed.city_id);
      setMinPrice(parsed.min_price);
      setMaxPrice(parsed.max_price);
      setStatus(parsed.status);
      setSortPreset(parsed.sort);
      setPerPage(parsed.per_page);
      setCurrentPage(parsed.page);
    };
    window.addEventListener('popstate', syncFromUrl);
    window.addEventListener('app-url-change', syncFromUrl);
    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      window.removeEventListener('app-url-change', syncFromUrl);
    };
  }, []);

  // Filter cities based on selected state_id (if any)
  const filteredCities = useMemo(() => {
    if (!stateId) return filterMeta.cities;
    const numericState = Number(stateId);
    const matching = filterMeta.cities.filter(
      (c) => c.state_id === undefined || c.state_id === null || Number(c.state_id) === numericState
    );
    return matching;
  }, [filterMeta.cities, stateId]);

  // Sync URL query parameters
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sortConfig = SORT_OPTIONS.find((s) => s.value === sortPreset) || SORT_OPTIONS[0];
    const sp = new URLSearchParams();
    if (debouncedSearch.trim()) sp.set('search', debouncedSearch.trim());
    if (authorityId) sp.set('authority_id', authorityId);
    if (propertyType) sp.set('property_type', propertyType);
    if (propertySubType) sp.set('property_sub_type', propertySubType);
    if (stateId) sp.set('state_id', stateId);
    if (cityId) sp.set('city_id', cityId);
    if (minPrice.trim()) sp.set('min_price', minPrice.trim());
    if (maxPrice.trim()) sp.set('max_price', maxPrice.trim());
    if (status) sp.set('status', status);
    if (sortPreset !== 'latest') {
      sp.set('sort_by', sortConfig.sort_by);
      sp.set('sort_order', sortConfig.sort_order);
    }
    if (perPage !== 12) sp.set('per_page', String(perPage));
    if (currentPage > 1) sp.set('page', String(currentPage));

    const qs = sp.toString();
    const targetUrl = qs ? `/authority-properties?${qs}` : '/authority-properties';
    if (window.location.pathname === '/authority-properties') {
      const currentFull = window.location.pathname + window.location.search;
      if (currentFull !== targetUrl) {
        window.history.replaceState({ page: 'authority-properties' }, '', targetUrl);
      }
    }
  }, [
    debouncedSearch,
    authorityId,
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
  ]);

  // Fetch Authority Properties from Laravel Backend
  const fetchListings = useCallback(async () => {
    const reqId = ++activeRequestRef.current;
    setLoading(true);
    setError(null);

    const sortConfig = SORT_OPTIONS.find((s) => s.value === sortPreset) || SORT_OPTIONS[0];
    const params: AuthorityPropertyFilterParams = {
      search: debouncedSearch.trim() || undefined,
      authority_id: authorityId || undefined,
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
      const res = await getAuthorityProperties(params);
      if (reqId !== activeRequestRef.current) return;

      if (res.success) {
        setProperties(res.properties);
        setPagination(res.pagination);
      } else {
        setProperties([]);
        setError(res.message || 'Unable to load authority properties right now.');
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
    debouncedSearch,
    authorityId,
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
  ]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setAuthorityId('');
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
    authorityId,
    propertyType,
    propertySubType,
    stateId,
    cityId,
    minPrice.trim(),
    maxPrice.trim(),
    status,
  ].filter(Boolean).length;

  // Build visible page numbers for Laravel pagination
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

  return (
    <div className="min-h-screen bg-[#FBF9F5] pb-20">
      {/* Hero Section */}
      <section className="bg-[#142533] text-white pt-10 pb-12 sm:pb-14 border-b border-[#D89B30]/20 relative overflow-hidden">
        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#D89B30]">
                <Landmark className="w-4 h-4 text-[#D89B30]" />
                <span>Development Authorities &amp; Statutory Schemes</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Authority Properties
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Explore verified residential, commercial, and institutional properties directly listed by urban development authorities and public statutory bodies.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={openCustomerRequirementModal}
                className="px-4 py-2.5 rounded-xl bg-[#D89B30] hover:bg-[#C58920] text-[#142533] text-xs font-bold transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Submit Property Requirement</span>
              </button>

              {settings.primary_phone && (
                <a
                  href={`tel:${settings.primary_phone}`}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-[#D89B30]" />
                  <span className="font-mono">{settings.primary_phone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Authority-wise Quick Access Bar (Strictly authorities present in backend) */}
          {filterMeta.authorities.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-300">
                  Browse Authority-wise Properties:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {filterMeta.authorities.map((auth) => (
                    <button
                      key={auth.id}
                      type="button"
                      onClick={() => onSelectAuthority(auth.id)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-[#D89B30] text-white hover:text-[#142533] border border-white/15 hover:border-[#D89B30] text-xs font-semibold transition-colors cursor-pointer group"
                    >
                      <Landmark className="w-3.5 h-3.5 text-[#D89B30] group-hover:text-[#142533]" />
                      <span>
                        {auth.name}
                        {auth.short_name ? ` (${auth.short_name})` : ''}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-75 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Container */}
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 pt-8 space-y-6">
        {/* Search, Sort & Filter Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-2xs space-y-4">
          {/* Primary Search & Sort Row */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* Search Input */}
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
                placeholder="Search by property title, code, scheme name, address, city or state..."
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

            {/* Sort, Per-Page, View Toggle & Mobile Filter Button */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <label htmlFor="authority-sort" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                  Sort by:
                </label>
                <select
                  id="authority-sort"
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

              {/* View Mode Switcher */}
              <div className="hidden sm:flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-[#142533] shadow-2xs'
                      : 'text-slate-500 hover:text-[#142533]'
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-[#142533] shadow-2xs'
                      : 'text-slate-500 hover:text-[#142533]'
                  }`}
                  title="Table View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
              </div>

              {/* Mobile Filters Toggle */}
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

          {/* Backend Filter Controls Grid (Always visible on desktop, toggleable on mobile) */}
          <div className={`${showFiltersMobile ? 'grid' : 'hidden lg:grid'} grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100`}>
            {/* 1. Authority Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Authority
              </label>
              <select
                value={authorityId}
                onChange={(e) => {
                  setAuthorityId(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs text-[#142533] focus:bg-white focus:outline-hidden focus:border-[#D89B30]"
              >
                <option value="">All Authorities</option>
                {filterMeta.authorities.map((auth) => (
                  <option key={auth.id} value={String(auth.id)}>
                    {auth.name}{auth.short_name ? ` (${auth.short_name})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Property Type Filter */}
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
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs text-[#142533] focus:bg-white focus:outline-hidden focus:border-[#D89B30]"
              >
                <option value="">All Property Types</option>
                {filterMeta.propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Property Sub Type Filter */}
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
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs text-[#142533] focus:bg-white focus:outline-hidden focus:border-[#D89B30]"
              >
                <option value="">All Sub Types</option>
                {filterMeta.propertySubTypes.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Status Filter */}
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
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs text-[#142533] focus:bg-white focus:outline-hidden focus:border-[#D89B30]"
              >
                <option value="">All Statuses</option>
                {filterMeta.statuses.map((st) => (
                  <option key={st} value={st}>
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. State Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                State
              </label>
              <select
                value={stateId}
                onChange={(e) => {
                  const nextState = e.target.value;
                  setStateId(nextState);
                  setCityId('');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs text-[#142533] focus:bg-white focus:outline-hidden focus:border-[#D89B30]"
              >
                <option value="">All States</option>
                {filterMeta.states.map((st) => (
                  <option key={st.id} value={String(st.id)}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. City Filter */}
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
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs text-[#142533] focus:bg-white focus:outline-hidden focus:border-[#D89B30]"
              >
                <option value="">All Cities</option>
                {filteredCities.map((ct) => (
                  <option key={ct.id} value={String(ct.id)}>
                    {ct.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 7. Minimum Reserve Price */}
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
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs text-[#142533] font-mono tabular-nums placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-[#D89B30]"
              />
            </div>

            {/* 8. Maximum Reserve Price */}
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
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs text-[#142533] font-mono tabular-nums placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-[#D89B30]"
              />
            </div>
          </div>

          {/* Results Summary & Reset Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              {loading ? (
                <span>Fetching properties from backend...</span>
              ) : pagination.total > 0 ? (
                <span className="tabular-nums">
                  Showing <strong className="text-[#142533]">{pagination.from ?? 1}</strong>–
                  <strong className="text-[#142533]">{pagination.to ?? properties.length}</strong> of{' '}
                  <strong className="text-[#142533]">{pagination.total}</strong> published properties
                </span>
              ) : (
                <span>No matching authority properties found</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Per page:</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-[#142533]"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
              </div>

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
                Unable to Load Authority Properties
              </h2>
              <p className="text-sm text-slate-600">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchListings}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-[#D89B30]" />
              <span>Try Again</span>
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
                No Authority Properties Found
              </h2>
              <p className="text-sm text-slate-600">
                {activeFiltersCount > 0
                  ? 'No published authority properties match your selected search or filter criteria.'
                  : 'There are currently no published authority properties available in the backend.'}
              </p>
            </div>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[#D89B30]" />
                <span>Clear All Filters</span>
              </button>
            )}
          </div>
        )}

        {/* Property Cards Grid OR Table View */}
        {!loading && !error && properties.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((prop) => (
                  <AuthorityPropertyCard
                    key={prop.id}
                    property={prop}
                    onViewDetails={onSelectProperty}
                    onSelectAuthority={onSelectAuthority}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#FAF8F5] border-b border-[#E2E8F0] text-[#64748B] font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-3.5 px-4">Property</th>
                        <th className="py-3.5 px-4">Authority</th>
                        <th className="py-3.5 px-4">Type &amp; Scheme</th>
                        <th className="py-3.5 px-4">Location &amp; Area</th>
                        <th className="py-3.5 px-4 text-right">Reserve / EMD</th>
                        <th className="py-3.5 px-4">Auction Window</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {properties.map((prop) => {
                        const loc = [prop.city_name, prop.state_name].filter(Boolean).join(', ');
                        const areaStr = formatAreaValue(prop.area, prop.area_unit);
                        const st = getStatusLabelAndColor(prop.status);
                        const startStr = formatAuthorityDateTime(prop.auction_start_at);
                        const endStr = formatAuthorityDateTime(prop.auction_end_at);

                        return (
                          <tr
                            key={prop.id}
                            className="hover:bg-slate-50/80 transition-colors"
                          >
                            <td className="py-3.5 px-4 max-w-[260px]">
                              <div className="flex items-center gap-3">
                                {prop.primary_image ? (
                                  <img
                                    src={prop.primary_image}
                                    alt={prop.title}
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                                    }}
                                    className="w-12 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                                  />
                                ) : (
                                  <div className="w-12 h-10 rounded-lg bg-[#142533] text-[#D89B30] flex items-center justify-center shrink-0">
                                    <Landmark className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <button
                                    type="button"
                                    onClick={() => onSelectProperty(prop)}
                                    className="font-bold text-[#142533] hover:text-[#D89B30] text-left line-clamp-1 cursor-pointer"
                                  >
                                    {prop.title}
                                  </button>
                                  {prop.property_code && (
                                    <div className="text-[11px] font-mono text-slate-500 truncate">
                                      Code: {prop.property_code}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              {prop.authority?.name ? (
                                <button
                                  type="button"
                                  onClick={() => prop.authority && onSelectAuthority(prop.authority.id)}
                                  className="font-semibold text-[#9A6007] hover:underline text-left cursor-pointer"
                                >
                                  {prop.authority.name}
                                  {prop.authority.short_name ? ` (${prop.authority.short_name})` : ''}
                                </button>
                              ) : null}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="text-[#142533] font-medium">
                                {[prop.property_type, prop.property_sub_type].filter(Boolean).join(' · ')}
                              </div>
                              {prop.scheme_name && (
                                <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                                  Scheme: {prop.scheme_name}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              {loc && (
                                <div className="text-slate-700 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-[#D89B30] shrink-0" />
                                  <span>{loc}</span>
                                </div>
                              )}
                              {areaStr && (
                                <div className="font-mono text-[11px] text-slate-500 tabular-nums mt-0.5">
                                  {areaStr}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                              {prop.reserve_price !== null && prop.reserve_price !== undefined && (
                                <div className="font-bold text-[#142533]">
                                  {formatINR(prop.reserve_price)}
                                </div>
                              )}
                              {prop.emd_amount !== null && prop.emd_amount !== undefined && (
                                <div className="text-[11px] text-slate-500">
                                  EMD: {formatINR(prop.emd_amount)}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4 font-mono text-[11px] tabular-nums text-slate-700">
                              {startStr && <div>Start: {startStr}</div>}
                              {endStr && <div>End: {endStr}</div>}
                            </td>

                            <td className="py-3.5 px-4">
                              {st.label && (
                                <span className={`font-semibold ${st.textClass}`}>{st.label}</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => openAuthorityEnquiryModal(prop)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D89B30] hover:bg-[#C58920] text-[#142533] font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  <Bell className="w-3 h-3" />
                                  <span>Enquire</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onSelectProperty(prop)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#142533] hover:bg-[#203545] text-white font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  <span>View Details</span>
                                  <ArrowRight className="w-3 h-3 text-[#D89B30]" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Laravel Pagination Bar */}
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
