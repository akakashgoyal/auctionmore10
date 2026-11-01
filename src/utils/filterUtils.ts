import { Property } from '../types';
import { PropertyFilterParams, ALL_INDIAN_STATES } from '../services/api';

export interface ParsedUrlFilters {
  search: string;
  propertyType: string;
  propertySubType: string;
  state: string;
  stateId?: string;
  city: string; // Existing manual City filter ONLY
  preferredAreas: string; // NEW SEPARATE incoming Preferred Areas filter (e.g. "East Delhi,Aarah,Noida,Gurgaon")
  preferredAreasList: string[]; // Parsed array of cities/areas e.g. ["East Delhi", "Aarah", "Noida", "Gurgaon"]
  auctionCategory: string;
  possessionStatus: string;
  minPrice: string;
  maxPrice: string;
  page: number;
  fromWhatsApp: boolean;
  hasQueryFilters: boolean;
}

/**
 * Safely decode URL query parameters handling '+', '%20', commas and malformed sequences
 */
export function safeDecodeUrlParam(val?: string | null): string {
  if (!val) return '';
  try {
    // In query strings, '+' often represents space; convert before decodeURIComponent
    const withSpaces = val.replace(/\+/g, ' ');
    return decodeURIComponent(withSpaces).trim();
  } catch {
    return val.replace(/\+/g, ' ').trim();
  }
}

/**
 * Parse preferred_areas parameter as a comma-separated list of trimmed, decoded strings.
 * Example: "East Delhi,Aarah,Noida,Gurgaon" -> ["East Delhi", "Aarah", "Noida", "Gurgaon"]
 */
export function parsePreferredAreas(raw?: string | null): string[] {
  if (!raw) return [];
  const decoded = safeDecodeUrlParam(raw);
  if (!decoded) return [];
  return decoded
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Extract property city strictly from property data.
 * Checks property.city.name, location.city, cityName, and city strings.
 */
export function getPropertyCity(prop: Property): string {
  const raw = prop as any;
  if (typeof raw.city === 'object' && raw.city && typeof raw.city.name === 'string' && raw.city.name.trim()) {
    return raw.city.name.trim();
  }
  if (typeof prop.location?.city === 'string' && prop.location.city.trim()) {
    return prop.location.city.trim();
  }
  if (typeof prop.cityName === 'string' && prop.cityName.trim()) {
    return prop.cityName.trim();
  }
  if (typeof raw.city_name === 'string' && raw.city_name.trim()) {
    return raw.city_name.trim();
  }
  if (typeof raw.city === 'string' && raw.city.trim()) {
    return raw.city.trim();
  }
  return '';
}

/**
 * Extract property state strictly from property data.
 */
export function getPropertyState(prop: Property): string {
  const raw = prop as any;
  if (typeof raw.state === 'object' && raw.state && typeof raw.state.name === 'string' && raw.state.name.trim()) {
    return raw.state.name.trim();
  }
  if (typeof prop.location?.state === 'string' && prop.location.state.trim()) {
    return prop.location.state.trim();
  }
  if (typeof prop.stateName === 'string' && prop.stateName.trim()) {
    return prop.stateName.trim();
  }
  if (typeof raw.state_name === 'string' && raw.state_name.trim()) {
    return raw.state_name.trim();
  }
  if (typeof raw.state === 'string' && raw.state.trim()) {
    return raw.state.trim();
  }
  return '';
}

/**
 * Preferred Areas matching rule:
 * Compares preferred_areas ONLY against the property's CITY.
 *
 * Conceptually:
 * property.city.name IN ("East Delhi", "Aarah", "Noida", "Gurgaon")
 *
 * Do NOT compare preferred_areas against:
 * - property.state
 * - property.area_name
 * - property.address
 * - property.country
 *
 * Case-insensitive & whitespace trimmed.
 */
export function matchesPreferredAreas(prop: Property, preferredAreasList: string[]): boolean {
  if (!preferredAreasList || preferredAreasList.length === 0) {
    return true; // If preferred_areas is missing or empty, do not apply this filter
  }

  const rawCity = getPropertyCity(prop);
  const propCity = rawCity.trim().toLowerCase();
  if (!propCity) {
    return false;
  }

  return preferredAreasList.some((area) => {
    const target = area.trim().toLowerCase();
    if (!target) return false;

    // Exact case-insensitive whitespace-trimmed match
    if (propCity === target) {
      return true;
    }

    // Common transliteration equivalence for Ara / Aarah / Arrah
    const araVariants = ['aarah', 'arrah', 'ara'];
    if (araVariants.includes(target) && araVariants.includes(propCity)) {
      return true;
    }

    return false;
  });
}

/**
 * Parse current URL query string into strongly-typed filters.
 *
 * IMPORTANT:
 * - 'preferred_areas' is a separate incoming filter used specifically for customer matching / WhatsApp links.
 * - 'city' is the existing manual Property Location filter.
 * - They must remain completely independent. Do NOT overwrite one with the other.
 */
export function parseUrlFilters(searchStr?: string): ParsedUrlFilters {
  if (typeof window === 'undefined') {
    return {
      search: '',
      propertyType: '',
      propertySubType: '',
      state: '',
      city: '',
      preferredAreas: '',
      preferredAreasList: [],
      auctionCategory: '',
      possessionStatus: '',
      minPrice: '',
      maxPrice: '',
      page: 1,
      fromWhatsApp: false,
      hasQueryFilters: false,
    };
  }

  const query = searchStr !== undefined ? searchStr : (window.location.search || '');
  const params = new URLSearchParams(query);

  const rawSearch = safeDecodeUrlParam(params.get('search'));
  const rawPropertyType = safeDecodeUrlParam(params.get('property_type'));
  const rawPropertySubType = safeDecodeUrlParam(params.get('property_sub_type'));
  const rawState = safeDecodeUrlParam(params.get('state'));
  const rawStateId = safeDecodeUrlParam(params.get('state_id'));
  const rawCity = safeDecodeUrlParam(params.get('city')); // Existing manual City filter ONLY
  const rawPreferredAreas = safeDecodeUrlParam(params.get('preferred_areas')); // NEW separate Preferred Areas
  const rawAuctionCategory = safeDecodeUrlParam(params.get('auction_category'));
  const rawPossessionStatus = safeDecodeUrlParam(params.get('possession_status'));
  const rawMinPrice = safeDecodeUrlParam(params.get('min_price'));
  const rawMaxPrice = safeDecodeUrlParam(params.get('max_price'));
  const rawPage = Math.max(1, parseInt(params.get('page') || '1', 10) || 1);

  const preferredAreasList = parsePreferredAreas(rawPreferredAreas);

  // Existing State filter: ONLY read from 'state' or 'state_id' parameter
  let resolvedState = rawState;
  if (!resolvedState && rawStateId) {
    const match = ALL_INDIAN_STATES.find((s) => String(s.id) === String(rawStateId));
    if (match) {
      resolvedState = match.name;
    }
  }

  const isFromWhatsApp = Boolean(
    rawPreferredAreas ||
    (rawMinPrice && rawMaxPrice) ||
    params.has('preferred_areas')
  );

  const hasQueryFilters = Boolean(
    rawSearch ||
    rawPropertyType ||
    rawPropertySubType ||
    rawState ||
    rawStateId ||
    rawCity ||
    rawPreferredAreas ||
    rawAuctionCategory ||
    rawPossessionStatus ||
    rawMinPrice ||
    rawMaxPrice ||
    rawPage > 1
  );

  return {
    search: rawSearch,
    propertyType: rawPropertyType,
    propertySubType: rawPropertySubType,
    state: resolvedState,
    stateId: rawStateId || undefined,
    city: rawCity, // Remains strictly the manual City filter
    preferredAreas: rawPreferredAreas, // Independent Preferred Areas filter
    preferredAreasList,
    auctionCategory: rawAuctionCategory,
    possessionStatus: rawPossessionStatus,
    minPrice: rawMinPrice,
    maxPrice: rawMaxPrice,
    page: rawPage,
    fromWhatsApp: isFromWhatsApp,
    hasQueryFilters,
  };
}

/**
 * Convert parsed URL filters into backend PropertyFilterParams payload.
 * Passes city and preferred_areas as independent parameters.
 */
export function urlFiltersToApiParams(filters: ParsedUrlFilters): PropertyFilterParams {
  const parsedMinPrice = filters.minPrice ? Number(filters.minPrice) : undefined;
  const parsedMaxPrice = filters.maxPrice ? Number(filters.maxPrice) : undefined;

  let stateId: number | undefined;
  if (filters.stateId && !isNaN(Number(filters.stateId))) {
    stateId = Number(filters.stateId);
  } else if (filters.state) {
    const match = ALL_INDIAN_STATES.find(
      (s) => s.name.toLowerCase() === filters.state.trim().toLowerCase()
    );
    if (match) stateId = match.id;
  }

  return {
    search: filters.search.trim() || undefined,
    property_type:
      filters.propertyType && filters.propertyType !== 'Any' && filters.propertyType !== 'all'
        ? filters.propertyType.trim()
        : undefined,
    property_sub_type: filters.propertySubType.trim() || undefined,
    state: filters.state.trim() || undefined,
    state_id: stateId,
    city: filters.city.trim() || undefined,
    preferred_areas: filters.preferredAreas.trim() || undefined,
    auction_category: filters.auctionCategory || undefined,
    possession_status: filters.possessionStatus || undefined,
    min_price: parsedMinPrice && !isNaN(parsedMinPrice) ? parsedMinPrice : undefined,
    max_price: parsedMaxPrice && !isNaN(parsedMaxPrice) ? parsedMaxPrice : undefined,
    page: filters.page > 1 ? filters.page : undefined,
  };
}

/**
 * Combined filtering validator for the /properties page.
 *
 * Evaluates:
 * 1. preferred_areas (Match property CITY against ANY of the cities in preferred_areas, OR logic)
 * AND
 * 2. Existing manual City filter (AND logic)
 * AND
 * 3. Existing manual State filter (AND logic)
 * AND
 * 4. Price: reserve_price >= min_price (if min_price exists) AND reserve_price <= max_price (if max_price exists)
 * AND
 * 5. Property Type: property_type matches (unless "Any")
 * AND
 * 6. Property Sub-Type: property_sub_type matches (if provided)
 * AND
 * 7. Search keyword, auction category, possession status
 */
export function matchesPropertyCriteria(
  prop: Property,
  criteria: {
    search?: string;
    propertyType?: string;
    propertySubType?: string;
    state?: string;
    city?: string;
    preferredAreas?: string;
    preferredAreasList?: string[];
    auctionCategory?: string;
    possessionStatus?: string;
    minPrice?: string | number;
    maxPrice?: string | number;
  }
): boolean {
  // 1. Preferred Areas filter (ONLY compares against property CITY, OR across multiple preferred areas)
  const areasList: string[] = [];
  if (criteria.preferredAreasList && criteria.preferredAreasList.length > 0) {
    criteria.preferredAreasList.forEach((a) => {
      const c = a.trim();
      if (c && !areasList.includes(c)) areasList.push(c);
    });
  } else if (criteria.preferredAreas && criteria.preferredAreas.trim()) {
    parsePreferredAreas(criteria.preferredAreas).forEach((a) => {
      const c = a.trim();
      if (c && !areasList.includes(c)) areasList.push(c);
    });
  }

  if (areasList.length > 0) {
    if (!matchesPreferredAreas(prop, areasList)) {
      return false;
    }
  }

  // 2. Existing manual City filter (Independent filter, combined via AND logic)
  if (criteria.city && criteria.city.trim() && criteria.city.toLowerCase() !== 'all') {
    const fCity = criteria.city.trim().toLowerCase();
    const propCity = getPropertyCity(prop).trim().toLowerCase();
    if (propCity !== fCity && !propCity.includes(fCity) && !fCity.includes(propCity)) {
      return false;
    }
  }

  // 3. Existing manual State filter (Independent filter, combined via AND logic)
  if (criteria.state && criteria.state.trim() && criteria.state.toLowerCase() !== 'all') {
    const fState = criteria.state.trim().toLowerCase();
    const propState = getPropertyState(prop).trim().toLowerCase();
    if (propState !== fState && !propState.includes(fState) && !fState.includes(propState)) {
      return false;
    }
  }

  // 4. Price filtering: Use property's existing reserve_price field
  const reservePrice = prop.reservePrice ?? (prop as any).reserve_price ?? (prop as any).price;

  if (criteria.minPrice !== undefined && criteria.minPrice !== null && criteria.minPrice !== '') {
    const minVal = Number(criteria.minPrice);
    if (!isNaN(minVal) && minVal > 0) {
      if (reservePrice === undefined || reservePrice === null || reservePrice < minVal) {
        return false;
      }
    }
  }

  if (criteria.maxPrice !== undefined && criteria.maxPrice !== null && criteria.maxPrice !== '') {
    const maxVal = Number(criteria.maxPrice);
    if (!isNaN(maxVal) && maxVal > 0) {
      if (reservePrice === undefined || reservePrice === null || reservePrice > maxVal) {
        return false;
      }
    }
  }

  // 5. Property Type: If property_type=Any, do not apply a property type restriction. Otherwise match property_type.
  if (criteria.propertyType && criteria.propertyType.trim()) {
    const fType = criteria.propertyType.trim().toLowerCase();
    if (fType !== 'any' && fType !== 'all') {
      const pType = (prop.propertyType || (prop as any).property_type || '').trim().toLowerCase();
      if (pType !== fType && !pType.includes(fType) && !fType.includes(pType)) {
        return false;
      }
    }
  }

  // 6. Property Sub-Type: If property_sub_type exists and is not empty, match property_sub_type.
  if (criteria.propertySubType && criteria.propertySubType.trim()) {
    const fSub = criteria.propertySubType.trim().toLowerCase();
    if (fSub !== 'any' && fSub !== 'all') {
      const pSub = (prop.propertySubType || (prop as any).property_sub_type || '').trim().toLowerCase();
      if (pSub !== fSub && !pSub.includes(fSub) && !fSub.includes(pSub)) {
        return false;
      }
    }
  }

  // 7. Auction Category (if selected in UI)
  if (criteria.auctionCategory && criteria.auctionCategory.trim()) {
    const fCat = criteria.auctionCategory.trim().toLowerCase();
    if (fCat !== 'any' && fCat !== 'all') {
      const pCat = (prop.auctionCategory || (prop as any).auction_category || '').trim().toLowerCase();
      if (pCat !== fCat && !pCat.includes(fCat) && !fCat.includes(pCat)) {
        return false;
      }
    }
  }

  // 8. Possession Status (if selected in UI)
  if (criteria.possessionStatus && criteria.possessionStatus.trim()) {
    const fPoss = criteria.possessionStatus.trim().toLowerCase();
    if (fPoss !== 'any' && fPoss !== 'all') {
      const pPoss = (prop.possessionStatus || (prop as any).possession_status || '').trim().toLowerCase();
      if (pPoss !== fPoss && !pPoss.includes(fPoss) && !fPoss.includes(pPoss)) {
        return false;
      }
    }
  }

  // 9. Search query keyword match
  if (criteria.search && criteria.search.trim()) {
    const q = criteria.search.trim().toLowerCase();
    const searchable = [
      prop.title,
      prop.description,
      prop.location?.city,
      prop.location?.locality,
      prop.location?.state,
      prop.location?.address,
      prop.bankName,
      prop.propertyReferenceNo,
      prop.propertyType,
      prop.propertySubType,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (!searchable.includes(q)) {
      return false;
    }
  }

  return true;
}
