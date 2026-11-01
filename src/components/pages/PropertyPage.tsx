import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Property } from '../../types';
import { PropertyCard } from '../PropertyCard';
import {
  Search,
  SlidersHorizontal,
  X,
  Landmark,
  AlertCircle,
  Building,
  MapPin,
  Loader2,
  Sparkles,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  IndianRupee,
} from 'lucide-react';
import { PageRoute } from '../Navbar';
import { AuctionCtaBanner } from '../AuctionCtaBanner';
import { useApi } from '../../context/ApiContext';
import { SharePropertyModal } from '../SharePropertyModal';
import { ALL_INDIAN_STATES } from '../../services/api';
import { CONCRETE_PROPERTY_TYPES, getSubTypesForPropertyType } from '../../data/propertyTypes';
import { getCitiesForState, findStateForCity, getAllIndianCities } from '../../data/indianLocations';
import { parseUrlFilters, matchesPropertyCriteria } from '../../utils/filterUtils';

interface PropertyPageProps {
  properties?: Property[];
  onSelectProperty: (property: Property) => void;
  onExpressInterest: (property: Property) => void;
  onNavigate?: (page: PageRoute, customUrl?: string) => void;
}

export const PropertyPage: React.FC<PropertyPageProps> = ({
  onSelectProperty,
  onExpressInterest,
  onNavigate,
}) => {
  const {
    properties: apiProperties,
    propertyPagination,
    isLoadingProperties,
    propertiesError,
    refreshProperties,
    openCustomerRequirementModal,
  } = useApi();

  // Read initial filter values from URL query string
  const initialUrlFilters = useMemo(() => parseUrlFilters(), []);

  // Backend API Filter States (100% matched to Laravel backend API parameters & URL synced)
  const [search, setSearch] = useState<string>(initialUrlFilters.search);
  const [propertyType, setPropertyType] = useState<string>(initialUrlFilters.propertyType);
  const [propertySubType, setPropertySubType] = useState<string>(initialUrlFilters.propertySubType);
  const [selectedState, setSelectedState] = useState<string>(initialUrlFilters.state);
  const [selectedCity, setSelectedCity] = useState<string>(initialUrlFilters.city);
  const [preferredAreas, setPreferredAreas] = useState<string>(initialUrlFilters.preferredAreas);
  const [auctionCategory, setAuctionCategory] = useState<string>(initialUrlFilters.auctionCategory);
  const [possessionStatus, setPossessionStatus] = useState<string>(initialUrlFilters.possessionStatus);
  const [minPrice, setMinPrice] = useState<string>(initialUrlFilters.minPrice);
  const [maxPrice, setMaxPrice] = useState<string>(initialUrlFilters.maxPrice);
  const [currentPage, setCurrentPage] = useState<number>(initialUrlFilters.page);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [shareProperty, setShareProperty] = useState<Property | null>(null);

  // Dynamic filter options with full Indian States list & accumulated backend types
  const [availableOptions, setAvailableOptions] = useState<{
    propertyTypes: string[];
    propertySubTypes: string[];
    states: { id: number; name: string }[];
    auctionCategories: string[];
    possessionStatuses: string[];
  }>({
    propertyTypes: [...CONCRETE_PROPERTY_TYPES],
    propertySubTypes: [],
    states: ALL_INDIAN_STATES,
    auctionCategories: [],
    possessionStatuses: [],
  });

  // Stable ref for available options to avoid callback dependency cycles
  const availableOptionsRef = useRef(availableOptions);
  useEffect(() => {
    availableOptionsRef.current = availableOptions;
  }, [availableOptions]);

  // Dynamically compute sub-types matching the selected property type
  const activeSubTypes = useMemo(() => {
    return getSubTypesForPropertyType(propertyType, availableOptions.propertySubTypes);
  }, [propertyType, availableOptions.propertySubTypes]);

  // Dynamically compute cities strictly based on the selected state
  const availableCities = useMemo(() => {
    if (selectedState && selectedState !== 'All' && selectedState !== 'all') {
      const citySet = new Set<string>(getCitiesForState(selectedState));
      // Also collect any cities present in properties whose state matches selectedState
      apiProperties.forEach((p) => {
        const pState = (p.location?.state || p.stateName || '').toLowerCase();
        const sState = selectedState.toLowerCase();
        if (pState && (pState === sState || pState.includes(sState) || sState.includes(pState))) {
          const c = p.location?.city || p.cityName;
          if (c && c.trim()) citySet.add(c.trim());
        }
      });
      return Array.from(citySet).sort((a, b) => a.localeCompare(b));
    }

    // If no state is selected, gather all Indian cities plus any in loaded properties
    const citySet = new Set<string>(getAllIndianCities());
    apiProperties.forEach((p) => {
      const c = p.location?.city || p.cityName;
      if (c && c.trim()) citySet.add(c.trim());
    });
    return Array.from(citySet).sort((a, b) => a.localeCompare(b));
  }, [selectedState, apiProperties]);

  // State selection handler: resets city if it does not belong to the newly selected state
  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    if (newState && newState !== 'All' && newState !== 'all') {
      const allowedCities = getCitiesForState(newState);
      if (selectedCity && !allowedCities.some((c) => c.toLowerCase() === selectedCity.toLowerCase())) {
        setSelectedCity('');
      }
    }
  };

  // City selection handler: automatically infers and sets state if state wasn't selected yet
  const handleCityChange = (newCity: string) => {
    setSelectedCity(newCity);
    if (newCity && (!selectedState || selectedState === 'All' || selectedState === 'all')) {
      const inferredState = findStateForCity(newCity);
      if (inferredState) {
        setSelectedState(inferredState);
      }
    }
  };

  // Synchronize active filter states to browser URL query string (compatible with backend WhatsApp links)
  const syncFiltersToUrl = useCallback(
    (filters: {
      search?: string;
      propertyType?: string;
      propertySubType?: string;
      state?: string;
      city?: string;
      preferred_areas?: string;
      auctionCategory?: string;
      possessionStatus?: string;
      minPrice?: string;
      maxPrice?: string;
      page?: number;
    }) => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams();
      if (filters.search?.trim()) params.set('search', filters.search.trim());
      if (filters.propertyType?.trim() && filters.propertyType !== 'Any') {
        params.set('property_type', filters.propertyType.trim());
      }
      if (filters.propertySubType?.trim()) {
        params.set('property_sub_type', filters.propertySubType.trim());
      }
      if (filters.state?.trim() && filters.state !== 'All' && filters.state !== 'all') {
        params.set('state', filters.state.trim());
      }
      if (filters.city?.trim() && filters.city !== 'All' && filters.city !== 'all') {
        params.set('city', filters.city.trim());
      }
      const activePreferred =
        filters.preferred_areas !== undefined ? filters.preferred_areas : preferredAreas;
      if (activePreferred?.trim()) {
        params.set('preferred_areas', activePreferred.trim());
      }
      if (filters.auctionCategory?.trim()) params.set('auction_category', filters.auctionCategory.trim());
      if (filters.possessionStatus?.trim()) params.set('possession_status', filters.possessionStatus.trim());
      if (filters.minPrice?.trim()) params.set('min_price', filters.minPrice.trim());
      if (filters.maxPrice?.trim()) params.set('max_price', filters.maxPrice.trim());
      if (filters.page && filters.page > 1) params.set('page', String(filters.page));

      const queryString = params.toString();
      const targetUrl = queryString ? `/properties?${queryString}` : '/properties';
      const currentUrl = window.location.pathname + window.location.search;

      if (currentUrl !== targetUrl) {
        window.history.replaceState({ page: 'property' }, '', targetUrl);
      }
    },
    [preferredAreas]
  );

  // Accumulate unique filter values dynamically from backend property responses without triggering infinite re-renders
  useEffect(() => {
    if (apiProperties && apiProperties.length > 0) {
      setAvailableOptions((prev) => {
        const types = new Set([...CONCRETE_PROPERTY_TYPES, ...prev.propertyTypes]);
        const subTypes = new Set(prev.propertySubTypes);
        // Ensure ALL_INDIAN_STATES are always present, and merge any additional from API
        const statesMap = new Map<number, string>(ALL_INDIAN_STATES.map((s) => [s.id, s.name]));
        const categories = new Set(prev.auctionCategories);
        const possessions = new Set(prev.possessionStatuses);

        apiProperties.forEach((p) => {
          if (p.propertyType) types.add(p.propertyType);
          if (p.propertySubType) subTypes.add(p.propertySubType);
          if (p.stateId && (p.location?.state || p.stateName)) {
            statesMap.set(p.stateId, p.location?.state || p.stateName || `State ${p.stateId}`);
          }
          if (p.auctionCategory) categories.add(p.auctionCategory);
          if (p.possessionStatus) possessions.add(p.possessionStatus);
        });

        // Identity check: avoid state updates if no new unique categories were found
        if (
          types.size === prev.propertyTypes.length &&
          subTypes.size === prev.propertySubTypes.length &&
          statesMap.size === prev.states.length &&
          categories.size === prev.auctionCategories.length &&
          possessions.size === prev.possessionStatuses.length
        ) {
          return prev;
        }

        return {
          propertyTypes: Array.from(types).sort(),
          propertySubTypes: Array.from(subTypes).sort(),
          states: Array.from(statesMap.entries())
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name)),
          auctionCategories: Array.from(categories).sort(),
          possessionStatuses: Array.from(possessions).sort(),
        };
      });
    }
  }, [apiProperties]);

  // Keep track of the last executed query payload to prevent duplicate or looping network requests
  const lastFetchedQueryRef = useRef<string>('');
  const isFirstRender = useRef(true);

  // Stable API filter fetcher that reads state list from ref rather than recreating callback
  const executeFilterFetch = useCallback(
    (targetPage = 1) => {
      const parsedMinPrice = minPrice ? Number(minPrice) : undefined;
      const parsedMaxPrice = maxPrice ? Number(maxPrice) : undefined;
      const matchingState = (availableOptionsRef.current?.states || ALL_INDIAN_STATES).find(
        (s) => s.name.toLowerCase() === selectedState.trim().toLowerCase()
      );

      refreshProperties({
        search: search.trim() || undefined,
        property_type: propertyType && propertyType !== 'Any' ? propertyType : undefined,
        property_sub_type: propertySubType || undefined,
        state: selectedState.trim() || undefined,
        state_id: matchingState ? matchingState.id : undefined,
        city: selectedCity.trim() || undefined,
        preferred_areas: preferredAreas.trim() || undefined,
        auction_category: auctionCategory || undefined,
        possession_status: possessionStatus || undefined,
        min_price: parsedMinPrice && !isNaN(parsedMinPrice) ? parsedMinPrice : undefined,
        max_price: parsedMaxPrice && !isNaN(parsedMaxPrice) ? parsedMaxPrice : undefined,
        page: targetPage,
      });
    },
    [
      search,
      propertyType,
      propertySubType,
      selectedState,
      selectedCity,
      preferredAreas,
      auctionCategory,
      possessionStatus,
      minPrice,
      maxPrice,
      refreshProperties,
    ]
  );

  // Sync state when browser Back/Forward is clicked
  useEffect(() => {
    const handlePopState = () => {
      const urlFilters = parseUrlFilters();
      setSearch(urlFilters.search);
      setPropertyType(urlFilters.propertyType);
      setPropertySubType(urlFilters.propertySubType);
      setSelectedState(urlFilters.state);
      setSelectedCity(urlFilters.city);
      setPreferredAreas(urlFilters.preferredAreas);
      setAuctionCategory(urlFilters.auctionCategory);
      setPossessionStatus(urlFilters.possessionStatus);
      setMinPrice(urlFilters.minPrice);
      setMaxPrice(urlFilters.maxPrice);
      setCurrentPage(urlFilters.page);

      const filterKey = JSON.stringify({
        search: urlFilters.search,
        propertyType: urlFilters.propertyType,
        propertySubType: urlFilters.propertySubType,
        selectedState: urlFilters.state,
        selectedCity: urlFilters.city,
        preferredAreas: urlFilters.preferredAreas,
        auctionCategory: urlFilters.auctionCategory,
        possessionStatus: urlFilters.possessionStatus,
        minPrice: urlFilters.minPrice,
        maxPrice: urlFilters.maxPrice,
        page: urlFilters.page,
      });
      lastFetchedQueryRef.current = filterKey;

      const parsedMinPrice = urlFilters.minPrice ? Number(urlFilters.minPrice) : undefined;
      const parsedMaxPrice = urlFilters.maxPrice ? Number(urlFilters.maxPrice) : undefined;
      const matchingState = (availableOptionsRef.current?.states || ALL_INDIAN_STATES).find(
        (s) => s.name.toLowerCase() === urlFilters.state.trim().toLowerCase()
      );

      refreshProperties({
        search: urlFilters.search.trim() || undefined,
        property_type: urlFilters.propertyType || undefined,
        property_sub_type: urlFilters.propertySubType || undefined,
        state: urlFilters.state.trim() || undefined,
        state_id: matchingState ? matchingState.id : undefined,
        city: urlFilters.city.trim() || undefined,
        preferred_areas: urlFilters.preferredAreas.trim() || undefined,
        auction_category: urlFilters.auctionCategory || undefined,
        possession_status: urlFilters.possessionStatus || undefined,
        min_price: parsedMinPrice && !isNaN(parsedMinPrice) ? parsedMinPrice : undefined,
        max_price: parsedMaxPrice && !isNaN(parsedMaxPrice) ? parsedMaxPrice : undefined,
        page: urlFilters.page,
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [refreshProperties]);

  // Trigger backend query & URL sync whenever filter inputs genuinely change
  useEffect(() => {
    const currentFilterKey = JSON.stringify({
      search: search.trim(),
      propertyType,
      propertySubType,
      selectedState: selectedState.trim(),
      selectedCity: selectedCity.trim(),
      preferredAreas: preferredAreas.trim(),
      auctionCategory,
      possessionStatus,
      minPrice: minPrice.trim(),
      maxPrice: maxPrice.trim(),
    });

    if (isFirstRender.current) {
      isFirstRender.current = false;
      const hasInitialFilters =
        initialUrlFilters.search ||
        initialUrlFilters.propertyType ||
        initialUrlFilters.propertySubType ||
        initialUrlFilters.state ||
        initialUrlFilters.city ||
        initialUrlFilters.preferredAreas ||
        initialUrlFilters.auctionCategory ||
        initialUrlFilters.possessionStatus ||
        initialUrlFilters.minPrice ||
        initialUrlFilters.maxPrice ||
        initialUrlFilters.page > 1;

      lastFetchedQueryRef.current = currentFilterKey;

      if (hasInitialFilters) {
        executeFilterFetch(initialUrlFilters.page);
      }
      return;
    }

    // Do NOT fire request if the filter parameters haven't changed
    if (currentFilterKey === lastFetchedQueryRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      lastFetchedQueryRef.current = currentFilterKey;
      setCurrentPage(1);
      syncFiltersToUrl({
        search,
        propertyType,
        propertySubType,
        state: selectedState,
        city: selectedCity,
        preferred_areas: preferredAreas,
        auctionCategory,
        possessionStatus,
        minPrice,
        maxPrice,
        page: 1,
      });
      executeFilterFetch(1);
    }, 450);

    return () => clearTimeout(timer);
  }, [
    search,
    propertyType,
    propertySubType,
    selectedState,
    selectedCity,
    preferredAreas,
    auctionCategory,
    possessionStatus,
    minPrice,
    maxPrice,
    executeFilterFetch,
    syncFiltersToUrl,
  ]);

  // Handle pagination page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > propertyPagination.last_page || newPage === currentPage) return;
    setCurrentPage(newPage);
    syncFiltersToUrl({
      search,
      propertyType,
      propertySubType,
      state: selectedState,
      city: selectedCity,
      auctionCategory,
      possessionStatus,
      minPrice,
      maxPrice,
      page: newPage,
    });
    executeFilterFetch(newPage);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  // Reset all filters to empty & clear URL
  const handleResetFilters = () => {
    setSearch('');
    setPropertyType('');
    setPropertySubType('');
    setSelectedState('');
    setSelectedCity('');
    setPreferredAreas('');
    setAuctionCategory('');
    setPossessionStatus('');
    setMinPrice('');
    setMaxPrice('');
    setCurrentPage(1);
    lastFetchedQueryRef.current = JSON.stringify({
      search: '',
      propertyType: '',
      propertySubType: '',
      selectedState: '',
      selectedCity: '',
      preferredAreas: '',
      auctionCategory: '',
      possessionStatus: '',
      minPrice: '',
      maxPrice: '',
    });
    syncFiltersToUrl({ preferred_areas: '' });
    refreshProperties({ page: 1 });
  };

  // Check active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count++;
    if (propertyType && propertyType !== 'Any') count++;
    if (propertySubType) count++;
    if (selectedState) count++;
    if (selectedCity) count++;
    if (preferredAreas.trim() && !selectedCity) count++;
    if (auctionCategory) count++;
    if (possessionStatus) count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    return count;
  }, [search, propertyType, propertySubType, selectedState, selectedCity, preferredAreas, auctionCategory, possessionStatus, minPrice, maxPrice]);

  // Client-side adherence guarantee: filters properties strictly to match active URL/user filters
  const displayedProperties = useMemo(() => {
    return apiProperties.filter((prop) =>
      matchesPropertyCriteria(prop, {
        search,
        propertyType,
        propertySubType,
        state: selectedState,
        city: selectedCity,
        preferredAreas,
        auctionCategory,
        possessionStatus,
        minPrice,
        maxPrice,
      })
    );
  }, [
    apiProperties,
    search,
    propertyType,
    propertySubType,
    selectedState,
    selectedCity,
    preferredAreas,
    auctionCategory,
    possessionStatus,
    minPrice,
    maxPrice,
  ]);

  return (
    <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-4 sm:py-6 space-y-5 pb-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pt-1">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#D89B30] uppercase tracking-wider">
            <Landmark className="w-4 h-4" />
            <span>DIRECT BANK MANDATES &amp; AUCTIONS</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#142533]">
            Listed Bank Auction Properties
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-3xl">
            Browse verified distressed assets loaded dynamically from live bank auction mandates.
            Click <strong>"Enquire"</strong> to request pre-bid due diligence, property inspection, and EMD assistance.
          </p>
        </div>

        {/* Customer Requirement Trigger Button */}
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={openCustomerRequirementModal}
            className="px-4 py-2 rounded-xl bg-[#FAF1DE] hover:bg-[#F3E2BD] border border-[#D89B30]/40 text-[#9A6007] text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D89B30]" />
            <span>Tell Us What You're Looking For</span>
          </button>
        </div>
      </div>

      {/* Backend API Filters Control Panel */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3.5 sm:p-5 shadow-xs space-y-3">
        {/* Search & Toggle Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Keyword Search (backend search filter) */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search by title, location, bank name, reference number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-sm text-[#142533] placeholder-[#94A3B8] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#142533] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Toggle on Mobile & Reset */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`sm:hidden px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isFiltersOpen || activeFiltersCount > 0
                  ? 'bg-[#142533] text-white border-[#142533]'
                  : 'bg-[#F8F9FA] text-[#142533] border-[#E2E8F0]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
            </button>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2.5 rounded-xl text-xs font-semibold text-[#D89B30] hover:text-[#9A6007] bg-[#FAF8F5] border border-[#E8E2D5] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Backend Filter Fields (Visible always on sm+, collapsible on mobile) */}
        <div className={`space-y-4 ${isFiltersOpen ? 'block' : 'hidden sm:block'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-[#F1EFEA]">
            {/* 1. Property Type Filter */}
            <div>
              <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
                Property Type
              </label>
              <select
                value={propertyType}
                onChange={(e) => {
                  setPropertyType(e.target.value);
                  setPropertySubType('');
                }}
                className="w-full py-2 px-3 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs text-[#142533] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#D89B30] cursor-pointer"
              >
                <option value="">All Property Types</option>
                {availableOptions.propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Property Sub Type Filter */}
            <div>
              <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
                Sub Type {propertyType ? `(${propertyType})` : ''}
              </label>
              <select
                value={propertySubType}
                onChange={(e) => setPropertySubType(e.target.value)}
                className="w-full py-2 px-3 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs text-[#142533] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#D89B30] cursor-pointer"
              >
                <option value="">
                  {propertyType ? `All ${propertyType} Sub Types` : 'All Sub Types'}
                </option>
                {activeSubTypes.map((subType) => (
                  <option key={subType} value={subType}>
                    {subType}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. State Filter */}
            <div>
              <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
                State
              </label>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full py-2 px-3 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs text-[#142533] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#D89B30] cursor-pointer"
              >
                <option value="">All States</option>
                {availableOptions.states.map((st) => (
                  <option key={st.id} value={st.name}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. City / Preferred Area Filter (Filtered strictly on the basis of selected State) */}
            <div>
              <label className="text-[11px] font-semibold text-[#64748B] mb-1 flex items-center justify-between">
                <span>City / Area</span>
                {selectedState && (
                  <span className="text-[10px] text-[#D89B30] font-normal truncate max-w-[80px]">
                    in {selectedState}
                  </span>
                )}
              </label>
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className={`w-full py-2 px-3 rounded-xl border text-xs text-[#142533] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#D89B30] cursor-pointer ${
                  selectedCity
                    ? 'bg-[#FAF1DE] border-[#D89B30]/50 font-medium'
                    : 'bg-[#F8F9FA] border-[#E2E8F0]'
                }`}
              >
                <option value="">
                  {selectedState ? `All Cities in ${selectedState}` : 'All Cities (Select State to filter)'}
                </option>
                {availableCities.map((cityName) => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Auction Category Filter */}
            <div>
              <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
                Auction Category
              </label>
              <select
                value={auctionCategory}
                onChange={(e) => setAuctionCategory(e.target.value)}
                className="w-full py-2 px-3 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs text-[#142533] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#D89B30] cursor-pointer"
              >
                <option value="">All Categories</option>
                {availableOptions.auctionCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Possession Status Filter */}
            <div>
              <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
                Possession Status
              </label>
              <select
                value={possessionStatus}
                onChange={(e) => setPossessionStatus(e.target.value)}
                className="w-full py-2 px-3 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs text-[#142533] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#D89B30] cursor-pointer"
              >
                <option value="">All Possessions</option>
                {availableOptions.possessionStatuses.map((poss) => (
                  <option key={poss} value={poss}>
                    {poss}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 7 & 8. Min Price and Max Price Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#F1EFEA]">
            <div>
              <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
                Min Price (₹)
              </label>
              <div className="relative">
                <IndianRupee className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="number"
                  placeholder="e.g. 2500000"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs text-[#142533] placeholder-[#94A3B8] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#D89B30]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
                Max Price (₹)
              </label>
              <div className="relative">
                <IndianRupee className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="number"
                  placeholder="e.g. 50000000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs text-[#142533] placeholder-[#94A3B8] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#D89B30]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Summary & Count Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-[#64748B] border-t border-[#F1EFEA]">
          <div className="flex items-center gap-2">
            <span>
              Showing{' '}
              <strong className="text-[#142533]">
                {activeFiltersCount > 0
                  ? displayedProperties.length
                  : propertyPagination.total > 0
                  ? `${propertyPagination.from || 1}-${propertyPagination.to || displayedProperties.length}`
                  : displayedProperties.length}
              </strong>{' '}
              of <strong className="text-[#142533]">{activeFiltersCount > 0 ? displayedProperties.length : (propertyPagination.total || displayedProperties.length)}</strong> bank properties
            </span>

            {isLoadingProperties && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D89B30] inline" />
            )}
          </div>

          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {propertyType && (
                <span className="px-2 py-0.5 rounded-md bg-[#FAF1DE] text-[#9A6007] text-[11px] font-medium flex items-center gap-1">
                  Type: {propertyType}
                  <button type="button" onClick={() => setPropertyType('')} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {propertySubType && (
                <span className="px-2 py-0.5 rounded-md bg-[#FAF1DE] text-[#9A6007] text-[11px] font-medium flex items-center gap-1">
                  Sub: {propertySubType}
                  <button type="button" onClick={() => setPropertySubType('')} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedState && (
                <span className="px-2 py-0.5 rounded-md bg-[#FAF1DE] text-[#9A6007] text-[11px] font-medium flex items-center gap-1">
                  State: {selectedState}
                  <button type="button" onClick={() => handleStateChange('')} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCity && (
                <span className="px-2 py-0.5 rounded-md bg-[#FAF1DE] text-[#9A6007] text-[11px] font-medium flex items-center gap-1">
                  City: {selectedCity}
                  <button type="button" onClick={() => setSelectedCity('')} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {preferredAreas && (
                <span className="px-2 py-0.5 rounded-md bg-[#FAF1DE] text-[#9A6007] text-[11px] font-medium flex items-center gap-1">
                  Preferred Areas: {preferredAreas}
                  <button
                    type="button"
                    onClick={() => {
                      setPreferredAreas('');
                      syncFiltersToUrl({ preferred_areas: '' });
                    }}
                    className="hover:text-black cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {auctionCategory && (
                <span className="px-2 py-0.5 rounded-md bg-[#FAF1DE] text-[#9A6007] text-[11px] font-medium flex items-center gap-1">
                  Cat: {auctionCategory}
                  <button type="button" onClick={() => setAuctionCategory('')} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {possessionStatus && (
                <span className="px-2 py-0.5 rounded-md bg-[#FAF1DE] text-[#9A6007] text-[11px] font-medium flex items-center gap-1">
                  Possession: {possessionStatus}
                  <button type="button" onClick={() => setPossessionStatus('')} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {minPrice && (
                <span className="px-2 py-0.5 rounded-md bg-[#FAF1DE] text-[#9A6007] text-[11px] font-medium flex items-center gap-1">
                  Min: ₹{Number(minPrice).toLocaleString('en-IN')}
                  <button type="button" onClick={() => setMinPrice('')} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {maxPrice && (
                <span className="px-2 py-0.5 rounded-md bg-[#FAF1DE] text-[#9A6007] text-[11px] font-medium flex items-center gap-1">
                  Max: ₹{Number(maxPrice).toLocaleString('en-IN')}
                  <button type="button" onClick={() => setMaxPrice('')} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Requirement Match Banner */}
      {initialUrlFilters.fromWhatsApp && (
        <div className="bg-[#FAF1DE]/80 border border-[#D89B30]/40 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#25D366]/15 text-[#128C7E] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-[#D89B30]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#142533] flex items-center gap-2">
                <span>Personalized Requirements Match</span>
                <span className="px-2 py-0.5 rounded-full bg-[#D89B30]/20 text-[#9A6007] text-[10px] font-semibold">
                  WhatsApp Link
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                Displaying bank auction listings matching your requested criteria:
                {preferredAreas && <strong className="text-[#142533] ml-1">Preferred Areas (City): {preferredAreas}</strong>}
                {selectedCity && <strong className="text-[#142533] ml-1">• City: {selectedCity}</strong>}
                {selectedState && !selectedCity && <strong className="text-[#142533] ml-1">• State: {selectedState}</strong>}
                {propertyType && <span className="ml-1">• Type: {propertyType}</span>}
                {propertySubType && <span className="ml-1">({propertySubType})</span>}
                {minPrice && maxPrice && (
                  <span className="ml-1">
                    • Budget: ₹{Number(minPrice).toLocaleString('en-IN')} - ₹{Number(maxPrice).toLocaleString('en-IN')}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-semibold text-[#64748B] hover:text-[#142533] px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white cursor-pointer transition-colors"
            >
              Show All Listings
            </button>
          </div>
        </div>
      )}

      {/* Loading State Spinner / Skeleton */}
      {isLoadingProperties && (
        <div className="py-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#D89B30] mx-auto" />
          <p className="text-xs font-semibold text-[#64748B]">
            Fetching verified properties from backend API...
          </p>
        </div>
      )}

      {/* Error State Banner */}
      {!isLoadingProperties && propertiesError && apiProperties.length === 0 && (
        <div className="bg-rose-50 rounded-2xl p-8 text-center border border-rose-200 space-y-3 max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-rose-900">
            Unable to Load Properties
          </h3>
          <p className="text-xs text-rose-700 leading-relaxed">
            {propertiesError}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => executeFilterFetch(currentPage)}
              className="px-4 py-2 rounded-xl bg-[#142533] text-white text-xs font-semibold hover:bg-[#203545] flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <button
              type="button"
              onClick={openCustomerRequirementModal}
              className="px-4 py-2 rounded-xl bg-[#FAF1DE] border border-[#D89B30]/40 text-[#9A6007] text-xs font-semibold cursor-pointer"
            >
              Tell Us What You're Looking For
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoadingProperties && displayedProperties.length === 0 && !propertiesError && (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E2E8F0] space-y-4 max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF1DE] text-[#D89B30] mx-auto flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-[#142533]">No Properties Found</h3>
            <p className="text-xs text-[#64748B]">
              No auction listings matched your filter criteria from the backend database.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#142533] text-white text-xs font-semibold hover:bg-[#203545] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={openCustomerRequirementModal}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#FAF1DE] border border-[#D89B30]/40 text-[#9A6007] text-xs font-semibold cursor-pointer"
            >
              Share Requirement
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Property Cards Grid */}
      {!isLoadingProperties && displayedProperties.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProperties.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                onSelectProperty={onSelectProperty}
                onExpressInterest={onExpressInterest}
                onShareProperty={(p) => setShareProperty(p)}
              />
            ))}
          </div>

          {/* Dynamic Backend Pagination Controls */}
          {propertyPagination.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-6 flex-wrap gap-4">
              <div className="text-xs text-[#64748B]">
                Page <strong className="text-[#142533]">{propertyPagination.current_page}</strong> of{' '}
                <strong className="text-[#142533]">{propertyPagination.last_page}</strong>
                {propertyPagination.total > 0 && ` (${propertyPagination.total} total properties)`}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Previous Page Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(propertyPagination.current_page - 1)}
                  disabled={propertyPagination.current_page <= 1}
                  className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1 transition-colors ${
                    propertyPagination.current_page <= 1
                      ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
                      : 'border-[#E2E8F0] text-[#142533] hover:bg-[#FAF8F5] cursor-pointer'
                  }`}
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page Number Buttons */}
                {Array.from({ length: propertyPagination.last_page }, (_, i) => i + 1)
                  .filter((p) => {
                    // Show first page, last page, and pages around current page
                    return (
                      p === 1 ||
                      p === propertyPagination.last_page ||
                      Math.abs(p - propertyPagination.current_page) <= 1
                    );
                  })
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && p - prev > 1;

                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && (
                          <span className="px-2 text-xs text-slate-400">...</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handlePageChange(p)}
                          className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            propertyPagination.current_page === p
                              ? 'bg-[#142533] text-white shadow-xs'
                              : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#FAF8F5] hover:text-[#142533]'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}

                {/* Next Page Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(propertyPagination.current_page + 1)}
                  disabled={propertyPagination.current_page >= propertyPagination.last_page}
                  className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1 transition-colors ${
                    propertyPagination.current_page >= propertyPagination.last_page
                      ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
                      : 'border-[#E2E8F0] text-[#142533] hover:bg-[#FAF8F5] cursor-pointer'
                  }`}
                  aria-label="Next Page"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Informational Box & Requirement CTA */}
      <div className="bg-[#FAF8F5] rounded-2xl p-6 border border-[#E5E0D5] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-serif-title font-bold text-base text-[#142533] flex items-center gap-2 justify-center sm:justify-start">
            <Sparkles className="w-4 h-4 text-[#D89B30]" />
            <span>Looking for a specific bank auction asset or off-market property?</span>
          </h4>
          <p className="text-xs text-[#64748B]">
            Tell us your preferred budget, asset class, and locality. We scan all DRT, SARFAESI, and IBC notices nationwide.
          </p>
        </div>

        <button
          type="button"
          onClick={openCustomerRequirementModal}
          className="px-5 py-2.5 rounded-xl bg-[#142533] text-white text-xs font-semibold hover:bg-[#203545] transition-colors whitespace-nowrap shadow-xs cursor-pointer"
        >
          Share Property Requirement
        </button>
      </div>

      {/* Bottom CTA Banner */}
      {onNavigate && <AuctionCtaBanner onNavigate={onNavigate} className="px-0 sm:px-0 lg:px-0 xl:px-0" />}

      {/* Share Property Modal */}
      <SharePropertyModal
        property={shareProperty}
        isOpen={Boolean(shareProperty)}
        onClose={() => setShareProperty(null)}
      />
    </div>
  );
};
