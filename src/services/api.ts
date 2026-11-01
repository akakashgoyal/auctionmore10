/**
 * AUCTIONS & MORE — LARAVEL REST API SERVICE
 * Base URL: https://auction-admin.springstrdg.com/api/v1
 * Single source of truth for properties, content, settings, and enquiries.
 */

import {
  Property,
  PropertyCategory,
  AuthorityType,
  PossessionType,
  AuctionStatus,
  PropertyPagination,
  PropertyDocument,
  PropertyImage,
  PropertyVideo,
  TeamMember,
  AuctionAsset,
  AuctionAssetPagination,
  AuctionAssetFilterParams,
  AuctionAssetStats,
  AuctionAssetFilterMetadata,
  AuthorityInfo,
  AuthorityProperty,
  AuthorityPropertyImage,
  AuthorityPropertyDocument,
  AuthorityPropertyAmenity,
  AuthorityPropertyMilestone,
  AuthorityPropertyPagination,
  AuthorityPropertyFilterParams,
  AuthorityFilterMetadata,
} from '../types';
import { BlogPost, BLOG_POSTS, BlogPagination, DEFAULT_BLOG_PAGINATION } from '../data/blogData';
import { FAQItem, FAQ_DATA } from '../data/faqData';
import { Testimonial, TESTIMONIALS } from '../data/testimonialsData';
import { COMPANY_INFO } from '../data/companyInfo';
import { getYouTubeThumbnailUrl } from '../utils/videoUtils';

const DEFAULT_PROD_BACKEND_URL = 'https://auction-admin.springstrdg.com';

function sanitizeConfiguredUrl(rawUrl: unknown): string | null {
  if (typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  if (!trimmed) return null;
  const upper = trimmed.toUpperCase();
  if (
    upper.includes('YOUR-DOMAIN') ||
    upper.includes('EXAMPLE.COM') ||
    upper.startsWith('MY_') ||
    !trimmed.startsWith('http')
  ) {
    return null;
  }
  return trimmed;
}

export const BACKEND_URL = (() => {
  const envBackend =
    typeof import.meta !== 'undefined' ? sanitizeConfiguredUrl(import.meta.env?.VITE_BACKEND_URL) : null;
  if (envBackend) {
    return envBackend.replace(/\/api\/v1$/i, '');
  }
  return DEFAULT_PROD_BACKEND_URL;
})();

export const API_BASE_URL = (() => {
  const envApiBase =
    typeof import.meta !== 'undefined' ? sanitizeConfiguredUrl(import.meta.env?.VITE_API_BASE_URL) : null;
  if (envApiBase) {
    return /\/api\/v\d+$/i.test(envApiBase) ? envApiBase : `${envApiBase}/api/v1`;
  }
  return `${BACKEND_URL}/api/v1`;
})();

// ----------------------------------------------------------------------
// Types matching Backend Laravel API
// ----------------------------------------------------------------------

export interface OfficeTimingItem {
  day: string;
  open: string | null;
  close: string | null;
  closed: boolean;
}

export interface WebsiteSettings {
  company_name: string;
  short_name: string;
  tagline: string;
  logo: string;
  favicon?: string;
  phone_numbers: string[];
  primary_phone: string;
  alternate_phone: string;
  email_addresses: string[];
  primary_email: string;
  addresses: string[];
  primary_address: string;
  google_maps_url: string;
  google_map_url?: string;
  map_url?: string;
  map_embed_url: string;
  embed_map_url?: string;
  whatsapp_number: string;
  whatsapp_message: string;
  office_timings: string;
  office_timings_list?: OfficeTimingItem[];
  social_links: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  footer_text: string;
  copyright: string;
  website_url: string;
  default_seo_title: string;
  default_meta_description: string;
}

export interface PropertyFilterParams {
  search?: string;
  min_price?: number;
  max_price?: number;
  property_type?: string;
  property_sub_type?: string;
  state?: string;
  state_id?: number | string;
  city?: string;
  city_id?: number | string;
  preferred_areas?: string;
  auction_category?: string;
  possession_status?: string;
  per_page?: number;
  page?: number;
}

export interface PropertyEnquiryPayload {
  property_id: number | string;
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface CustomerRequirementPayload {
  name: string;
  phone: string;
  email: string;
  preferred_areas: string[];
  min_budget: number;
  max_budget: number;
  property_type: string;
  property_sub_type?: string;
  source: string;
  notes: string;
}

export interface LegalPageData {
  title: string;
  slug: string;
  content: string;
  last_updated?: string;
}

// ----------------------------------------------------------------------
// Safe Fetch Utility
// ----------------------------------------------------------------------

interface ApiResponse<T> {
  data: T;
  success: boolean;
  status: number;
  message?: string;
  errors?: Record<string, string[]>;
  pagination?: any;
  related_blogs?: any;
  raw?: any;
}

const GET_FRESH_TTL_MS = 60_000;
const GET_STALE_MAX_AGE_MS = 15 * 60_000;
const SESSION_CACHE_PREFIX = 'am_api_cache_v2:';
const MAX_SESSION_ENTRY_BYTES = 180_000;

const recentGetCache = new Map<string, { response: ApiResponse<any>; timestamp: number }>();
const inflightGetRequests = new Map<string, Promise<ApiResponse<any>>>();

function readSessionGetCache<T>(url: string): { response: ApiResponse<T>; timestamp: number } | null {
  if (typeof window === 'undefined' || !window.sessionStorage) return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_CACHE_PREFIX + url);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.timestamp === 'number' &&
      parsed.response &&
      parsed.response.success === true &&
      Date.now() - parsed.timestamp < GET_STALE_MAX_AGE_MS
    ) {
      recentGetCache.set(url, parsed);
      return parsed as { response: ApiResponse<T>; timestamp: number };
    }
  } catch {
    // Ignore storage read errors
  }
  return null;
}

function writeSessionGetCache(url: string, response: ApiResponse<any>, timestamp: number): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  try {
    const serialized = JSON.stringify({ response, timestamp });
    if (serialized.length <= MAX_SESSION_ENTRY_BYTES) {
      window.sessionStorage.setItem(SESSION_CACHE_PREFIX + url, serialized);
    }
  } catch {
    // Ignore quota errors
  }
}

function clearSessionGetCache(): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  try {
    const keysToDelete: string[] = [];
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const k = window.sessionStorage.key(i);
      if (k && k.startsWith(SESSION_CACHE_PREFIX)) {
        keysToDelete.push(k);
      }
    }
    keysToDelete.forEach((k) => window.sessionStorage.removeItem(k));
  } catch {
    // Ignore
  }
}

function delayMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function executeRequestJsonOnce<T>(
  url: string,
  options: RequestInit,
  fallbackData?: T
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (res.ok) {
      if (isJson) {
        const json = await res.json();
        const data = json && typeof json === 'object' && 'data' in json ? json.data : json;
        return {
          data: data as T,
          pagination: json?.pagination,
          related_blogs: json?.related_blogs,
          raw: json,
          message: json?.message,
          success: true,
          status: res.status,
        };
      }
      return {
        data: (fallbackData ?? ({} as unknown)) as T,
        success: false,
        status: res.status,
        message: 'Received non-JSON response',
      };
    }

    if (res.status === 422 && isJson) {
      const errorJson = await res.json();
      return {
        data: (fallbackData ?? ({} as unknown)) as T,
        success: false,
        status: 422,
        message: errorJson.message || 'Validation error',
        errors: errorJson.errors || {},
      };
    }

    if (res.status === 429) {
      let errorMsg = 'Too many requests. Please wait a moment before trying again.';
      if (isJson) {
        try {
          const errorJson = await res.json();
          errorMsg = errorJson.message || errorMsg;
        } catch {
          // ignore
        }
      }
      return {
        data: (fallbackData ?? ({} as unknown)) as T,
        success: false,
        status: 429,
        message: errorMsg,
      };
    }

    let errorMsg = `HTTP Error ${res.status}`;
    if (isJson) {
      try {
        const errorJson = await res.json();
        errorMsg = errorJson.message || errorMsg;
      } catch {
        // ignore
      }
    }

    return {
      data: (fallbackData ?? ({} as unknown)) as T,
      success: false,
      status: res.status,
      message: errorMsg,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const errorMsg = err instanceof Error ? err.message : 'Network request failed';
    return {
      data: (fallbackData ?? ({} as unknown)) as T,
      success: false,
      status: 0,
      message: errorMsg,
    };
  }
}

function fetchAndCacheGet<T>(
  url: string,
  options: RequestInit,
  fallbackData?: T
): Promise<ApiResponse<T>> {
  const existing = inflightGetRequests.get(url);
  if (existing) {
    return existing as Promise<ApiResponse<T>>;
  }

  const runner = (async (): Promise<ApiResponse<T>> => {
    const maxAttempts = 2;
    let lastRes: ApiResponse<T> | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const res = await executeRequestJsonOnce<T>(url, options, fallbackData);
      lastRes = res;

      if (res.success) {
        const now = Date.now();
        recentGetCache.set(url, { response: res, timestamp: now });
        writeSessionGetCache(url, res, now);
        return res;
      }

      const shouldRetry =
        attempt < maxAttempts &&
        (res.status === 429 || res.status === 0 || res.status === 502 || res.status === 503 || res.status === 504);

      if (!shouldRetry) {
        return res;
      }

      await delayMs(attempt * 900);
    }

    return (
      lastRes || {
        data: (fallbackData ?? ({} as unknown)) as T,
        success: false,
        status: 0,
        message: 'Network request failed',
      }
    );
  })();

  inflightGetRequests.set(url, runner);
  runner.finally(() => {
    inflightGetRequests.delete(url);
  });

  return runner;
}

async function requestJson<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackData?: T
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const method = (options.method || 'GET').toUpperCase();
  const isGet = method === 'GET' && !options.body;

  if (isGet) {
    const memCached = recentGetCache.get(url);
    if (memCached) {
      const age = Date.now() - memCached.timestamp;
      if (age < GET_FRESH_TTL_MS) {
        return memCached.response as ApiResponse<T>;
      }
      if (age < GET_STALE_MAX_AGE_MS) {
        void fetchAndCacheGet<T>(url, options, fallbackData);
        return memCached.response as ApiResponse<T>;
      }
    }

    const sessionCached = readSessionGetCache<T>(url);
    if (sessionCached) {
      if (Date.now() - sessionCached.timestamp >= GET_FRESH_TTL_MS) {
        void fetchAndCacheGet<T>(url, options, fallbackData);
      }
      return sessionCached.response;
    }

    return fetchAndCacheGet<T>(url, options, fallbackData);
  }

  recentGetCache.clear();
  clearSessionGetCache();
  return executeRequestJsonOnce<T>(url, options, fallbackData);
}

// ----------------------------------------------------------------------
// Normalizers: Mapping raw Laravel API models to frontend interfaces
// ----------------------------------------------------------------------

export function resolvePropertyImageUrl(img: any): string {
  if (!img) return '';
  if (typeof img === 'string') {
    const trimmed = img.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    const clean = trimmed.replace(/^\/+/, '');
    if (clean.startsWith('storage/')) {
      return `${BACKEND_URL}/${clean}`;
    }
    return `${BACKEND_URL}/storage/${clean}`;
  }
  if (typeof img === 'object') {
    if (img.image_url && typeof img.image_url === 'string' && img.image_url.trim().startsWith('http')) {
      return img.image_url.trim();
    }
    if (img.url && typeof img.url === 'string' && img.url.trim().startsWith('http')) {
      return img.url.trim();
    }
    const path = img.image_path || img.path || img.file_path;
    if (path && typeof path === 'string' && path.trim()) {
      const clean = path.trim().replace(/^\/+/, '');
      if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
      if (clean.startsWith('storage/')) return `${BACKEND_URL}/${clean}`;
      return `${BACKEND_URL}/storage/${clean}`;
    }
  }
  return '';
}

export function resolvePropertyDocumentUrl(doc: any): string {
  if (!doc) return '';
  if (typeof doc === 'string') {
    const trimmed = doc.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    const clean = trimmed.replace(/^\/+/, '');
    if (clean.startsWith('storage/')) return `${BACKEND_URL}/${clean}`;
    return `${BACKEND_URL}/storage/${clean}`;
  }
  if (typeof doc === 'object') {
    if (doc.url && typeof doc.url === 'string' && doc.url.startsWith('http')) return doc.url;
    const path = doc.document_path || doc.path || doc.file_path;
    if (path && typeof path === 'string') {
      const clean = path.trim().replace(/^\/+/, '');
      if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
      if (clean.startsWith('storage/')) return `${BACKEND_URL}/${clean}`;
      return `${BACKEND_URL}/storage/${clean}`;
    }
  }
  return '';
}

export function resolvePropertyVideoUrl(video: any): string {
  if (!video) return '';
  if (typeof video === 'string') {
    const trimmed = video.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    const clean = trimmed.replace(/^\/+/, '');
    if (clean.startsWith('storage/')) return `${BACKEND_URL}/${clean}`;
    return `${BACKEND_URL}/storage/${clean}`;
  }
  if (typeof video === 'object') {
    if (video.video_url && typeof video.video_url === 'string' && video.video_url.trim()) {
      return video.video_url.trim();
    }
    if (video.url && typeof video.url === 'string' && video.url.trim()) {
      return video.url.trim();
    }
    const path = video.video_path || video.path || video.file_path;
    if (path && typeof path === 'string' && path.trim()) {
      const clean = path.trim().replace(/^\/+/, '');
      if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
      if (clean.startsWith('storage/')) return `${BACKEND_URL}/${clean}`;
      return `${BACKEND_URL}/storage/${clean}`;
    }
  }
  return '';
}

export function formatGoogleMapsUrl(rawUrl?: string | null, fallbackQuery?: string | null): string {
  if (rawUrl && typeof rawUrl === 'string') {
    const trimmed = rawUrl.trim();
    if (trimmed) {
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
      }
      if (
        trimmed.startsWith('maps.google.') ||
        trimmed.startsWith('goo.gl/') ||
        trimmed.startsWith('www.google.') ||
        trimmed.startsWith('maps.app.goo.gl/')
      ) {
        return `https://${trimmed}`;
      }
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
    }
  }
  if (fallbackQuery && typeof fallbackQuery === 'string' && fallbackQuery.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackQuery.trim())}`;
  }
  return DEFAULT_WEBSITE_SETTINGS.google_maps_url;
}

export function formatMapEmbedUrl(
  rawEmbedUrl?: string | null,
  fallbackMapUrl?: string | null,
  fallbackAddress?: string | null
): string {
  if (rawEmbedUrl && typeof rawEmbedUrl === 'string') {
    const trimmed = rawEmbedUrl.trim();
    if (trimmed) {
      // Check if user or CMS pasted an entire <iframe> snippet
      const iframeMatch = trimmed.match(/src=["']([^"']+)["']/i);
      if (iframeMatch && iframeMatch[1]) {
        return iframeMatch[1];
      }
      // If it's already an embed URL
      if (trimmed.includes('/maps/embed') || trimmed.includes('output=embed')) {
        if (trimmed.startsWith('//')) return `https:${trimmed}`;
        if (!trimmed.startsWith('http')) return `https://${trimmed}`;
        return trimmed;
      }
      // If it starts with http/https
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        const coordMatch = trimmed.match(/([0-9]+\.[0-9]+),\s*([0-9]+\.[0-9]+)/);
        if (coordMatch) {
          return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
        }
        return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }
    }
  }

  // If fallbackMapUrl provided and has query/coordinates
  if (fallbackMapUrl && typeof fallbackMapUrl === 'string') {
    const trimmedFallback = fallbackMapUrl.trim();
    if (trimmedFallback.includes('/maps/embed') || trimmedFallback.includes('output=embed')) {
      return trimmedFallback;
    }
    const qMatch = trimmedFallback.match(/[?&]q=([^&]+)/);
    if (qMatch && qMatch[1]) {
      return `https://maps.google.com/maps?q=${qMatch[1]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
  }

  // Fallback to address search embed
  if (fallbackAddress && typeof fallbackAddress === 'string' && fallbackAddress.trim()) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackAddress.trim())}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  return DEFAULT_WEBSITE_SETTINGS.map_embed_url;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function normalizeProperty(raw: any, indexFallback: number = 1): Property {
  if (!raw) {
    return {
      id: `prop-${indexFallback}`,
      title: 'Auction Property',
      category: 'residential',
      propertyType: 'Residential',
      description: '',
      location: {
        address: '',
        locality: '',
        city: '',
        state: '',
        pinCode: '',
      },
      reservePrice: 0,
      marketEstimate: 0,
      emdAmount: 0,
      bidIncrement: 50000,
      authority: 'SBI & PSU Banks',
      bankName: 'Bank Mandate',
      possessionStatus: 'Physical Possession',
      titleClearanceStatus: 'Verified Bank Mandate',
      auctionDate: '',
      emdDeadline: '',
      inspectionDate: 'Available on Request',
      status: 'upcoming',
      images: [],
      highlights: [],
    };
  }

  const id = String(raw.id || raw.property_id || raw.slug || `prop-${indexFallback}`);
  const title = String(raw.property_title || raw.title || raw.name || 'Bank Auction Property');
  // Generate clean slug if not explicitly returned by API
  const generatedSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const slug = raw.slug ? String(raw.slug) : (generatedSlug ? `${generatedSlug}-${id}` : `property-${id}`);

  // Location handling
  const locState = typeof raw.state === 'object' && raw.state ? (raw.state.name || raw.state.title || '') : (raw.state || '');
  const locCity = typeof raw.city === 'object' && raw.city ? (raw.city.name || raw.city.title || '') : (raw.city || '');
  const locAddress = raw.address || raw.property_address || (locCity && locState ? `${locCity}, ${locState}` : locCity || locState || '');
  const locLocality = raw.area_name || raw.locality || raw.area || raw.district || locCity;
  const locPinCode = raw.pincode ? String(raw.pincode) : (raw.pin_code ? String(raw.pin_code) : '');

  // Category mapping
  let category: PropertyCategory = 'residential';
  const rawType = String(raw.property_type || raw.category || '').toLowerCase();
  if (rawType.includes('commercial') || rawType.includes('office') || rawType.includes('retail') || rawType.includes('shop')) {
    category = 'commercial';
  } else if (rawType.includes('industrial') || rawType.includes('factory') || rawType.includes('warehouse')) {
    category = 'industrial';
  } else if (rawType.includes('hospitality') || rawType.includes('hotel') || rawType.includes('resort') || rawType.includes('motel') || rawType.includes('restaurant')) {
    category = 'hospitality';
  } else if (rawType.includes('mixed')) {
    category = 'mixed-use';
  } else if (rawType.includes('agri') || rawType.includes('farm')) {
    category = 'agricultural';
  } else if (rawType.includes('inst') || rawType.includes('school') || rawType.includes('hospital') || rawType.includes('college')) {
    category = 'institutional';
  } else if (rawType.includes('special')) {
    category = 'special-purpose';
  } else if (rawType.includes('gov') || rawType.includes('psu') || rawType.includes('municipal')) {
    category = 'government';
  } else if (rawType.includes('land') || rawType.includes('plot')) {
    category = 'land';
  } else if (rawType.includes('other')) {
    category = 'other';
  }

  // Possession Status
  const possessionStatus: PossessionType = raw.possession_status || 'Physical Possession';

  // Authority & Bank
  let authority: AuthorityType = 'SBI & PSU Banks';
  const rawAuth = String(raw.bank_name || raw.authority || raw.authority_type || '').toLowerCase();
  if (rawAuth.includes('drt') || rawAuth.includes('drat') || rawAuth.includes('tribunal')) {
    authority = 'DRT / DRAT';
  } else if (rawAuth.includes('nclt') || rawAuth.includes('ibc') || rawAuth.includes('liquidat')) {
    authority = 'NCLT / IBC Liquidation';
  } else if (rawAuth.includes('private') || rawAuth.includes('hdfc') || rawAuth.includes('icici') || rawAuth.includes('axis') || rawAuth.includes('authum')) {
    authority = 'Private Banks';
  } else if (rawAuth.includes('municipal') || rawAuth.includes('govt') || rawAuth.includes('government')) {
    authority = 'Municipal & Govt';
  }

  // Financials
  const reservePrice = Number(raw.reserve_price || raw.reservePrice || raw.price || 0);
  const emdAmount = Number(raw.emd_amount || raw.emdAmount || (reservePrice > 0 ? Math.round(reservePrice * 0.1) : 0));
  const marketEstimate = Number(raw.market_estimate || raw.market_value || (reservePrice > 0 ? Math.round(reservePrice * 1.3) : 0));
  const bidIncrement = Number(raw.bid_increment || 50000);

  // Post-Auction / Bank Sale Price
  const rawPostPrice =
    raw.post_auction_price !== undefined && raw.post_auction_price !== null && raw.post_auction_price !== ''
      ? Number(raw.post_auction_price)
      : undefined;
  const postAuctionPrice =
    rawPostPrice !== undefined && !isNaN(rawPostPrice) && rawPostPrice > 0
      ? rawPostPrice
      : undefined;

  const postAuctionPriceDate =
    raw.post_auction_price_date && typeof raw.post_auction_price_date === 'string' && raw.post_auction_price_date.trim()
      ? raw.post_auction_price_date.trim()
      : undefined;

  // Status
  let status: AuctionStatus = 'upcoming';
  const rawStat = String(raw.property_status || raw.status || '').toLowerCase();
  const auctionDateStr = raw.auction_date ? String(raw.auction_date) : '';
  if (rawStat.includes('closing') || rawStat.includes('expiring')) {
    status = 'closing-soon';
  } else if (rawStat.includes('live')) {
    status = 'live-today';
  } else if (rawStat.includes('active')) {
    if (auctionDateStr) {
      const auctionDate = new Date(auctionDateStr);
      const isToday = !isNaN(auctionDate.getTime()) && auctionDate.toDateString() === new Date().toDateString();
      status = isToday ? 'live-today' : 'upcoming';
    } else {
      status = 'upcoming';
    }
  } else if (rawStat.includes('closed') || rawStat.includes('completed')) {
    status = 'closed';
  }

  // Dynamic images from relationship
  let images: string[] = [];
  const rawImagesList = Array.isArray(raw.images) ? raw.images : [];
  if (rawImagesList.length > 0) {
    const sorted = [...rawImagesList].sort((a, b) => (Number(a.sort_order || 0) - Number(b.sort_order || 0)));
    images = sorted.map((img: any) => resolvePropertyImageUrl(img)).filter(Boolean);
  } else if (raw.image_url || raw.cover_image || raw.image) {
    images = [resolvePropertyImageUrl(raw.image_url || raw.cover_image || raw.image)].filter(Boolean);
  }

  // Documents from relationship
  const rawDocsList = Array.isArray(raw.documents) ? raw.documents : [];
  const documents = rawDocsList.map((doc: any) => ({
    id: doc.id,
    property_id: doc.property_id,
    document_name: doc.document_name || 'Auction Notice / Document',
    document_path: doc.document_path || '',
    document_type: doc.document_type || 'pdf',
    visibility: doc.visibility || 'public',
    url: resolvePropertyDocumentUrl(doc),
  }));

  // Videos from relationship (Laravel PropertyVideo model: property_id, video_path, video_url, video_title, sort_order)
  let videos: PropertyVideo[] = [];
  const rawVideosList = Array.isArray(raw.videos) ? raw.videos : [];
  if (rawVideosList.length > 0) {
    const sorted = [...rawVideosList].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
    videos = sorted
      .map((v: any, idx: number) => {
        const resolvedUrl = resolvePropertyVideoUrl(v);
        return {
          id: v.id ? Number(v.id) : idx + 1,
          property_id: v.property_id ? Number(v.property_id) : id ? Number(id) : undefined,
          video_path: v.video_path || undefined,
          video_url: resolvedUrl,
          video_title: v.video_title || v.title || 'Property Video Tour',
          sort_order: v.sort_order !== undefined ? Number(v.sort_order) : idx,
        };
      })
      .filter((v) => Boolean(v.video_url || v.video_path));
  } else if (raw.video_url || raw.video_path || raw.video) {
    const singleUrl = resolvePropertyVideoUrl(raw.video_url || raw.video_path || raw.video);
    if (singleUrl) {
      videos = [
        {
          id: 1,
          property_id: id ? Number(id) : undefined,
          video_url: singleUrl,
          video_title: raw.video_title || 'Property Video Tour',
          sort_order: 0,
        },
      ];
    }
  }

  // Amenities
  let amenities: string[] | undefined;
  if (typeof raw.amenities === 'string' && raw.amenities.trim()) {
    amenities = raw.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
  } else if (Array.isArray(raw.amenities)) {
    amenities = raw.amenities.map(String).filter(Boolean);
  }

  // Google Maps URL & Coordinates from backend or fallback to precise address search
  const rawLatitude =
    raw.latitude !== undefined && raw.latitude !== null && raw.latitude !== ''
      ? Number(raw.latitude)
      : (raw.lat !== undefined && raw.lat !== null ? Number(raw.lat) : undefined);
  const rawLongitude =
    raw.longitude !== undefined && raw.longitude !== null && raw.longitude !== ''
      ? Number(raw.longitude)
      : (raw.lng !== undefined && raw.lng !== null ? Number(raw.lng) : undefined);

  const directMapUrl =
    raw.google_maps_url ||
    raw.google_map_url ||
    raw.map_url ||
    raw.maps_url ||
    raw.location_url;

  let propertyGoogleMapsUrl: string | undefined = undefined;
  if (typeof directMapUrl === 'string' && directMapUrl.trim()) {
    propertyGoogleMapsUrl = formatGoogleMapsUrl(directMapUrl);
  } else if (rawLatitude && rawLongitude && !isNaN(rawLatitude) && !isNaN(rawLongitude)) {
    propertyGoogleMapsUrl = `https://www.google.com/maps?q=${rawLatitude},${rawLongitude}`;
  } else {
    const queryParts = [locAddress, locLocality, locCity, locState, locPinCode].filter(Boolean);
    if (queryParts.length > 0) {
      propertyGoogleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        Array.from(new Set(queryParts)).join(', ')
      )}`;
    }
  }

  const sanitizedDescription = stripBankerContactDetails(raw.description || '') || '';

  return {
    id,
    title,
    slug,
    category,
    propertyType: raw.property_type || 'Residential',
    propertySubType: raw.property_sub_type || undefined,
    propertyReferenceNo: raw.property_reference_no || undefined,
    propertyStatus: raw.property_status || 'active',
    featured: Boolean(raw.featured),
    description: sanitizedDescription,

    location: {
      address: locAddress,
      locality: locLocality,
      city: locCity,
      state: locState,
      pinCode: locPinCode,
    },
    googleMapsUrl: propertyGoogleMapsUrl,
    latitude: rawLatitude && !isNaN(rawLatitude) ? rawLatitude : undefined,
    longitude: rawLongitude && !isNaN(rawLongitude) ? rawLongitude : undefined,
    country: raw.country || 'India',
    stateId: raw.state_id ? Number(raw.state_id) : undefined,
    cityId: raw.city_id ? Number(raw.city_id) : undefined,
    stateName: locState,
    cityName: locCity,
    areaName: raw.area_name || undefined,

    reservePrice,
    marketEstimate,
    postAuctionPrice,
    postAuctionPriceDate,
    emdAmount,
    bidIncrement,

    totalArea: raw.total_area ? Number(raw.total_area) : undefined,
    areaUnit: raw.area_unit || undefined,
    builtUpArea: raw.built_up_area ? Number(raw.built_up_area) : undefined,
    carpetAreaSqFt: raw.carpet_area ? Number(raw.carpet_area) : undefined,
    landArea: raw.land_area ? Number(raw.land_area) : undefined,
    plotAreaSqYards: raw.plot_area ? Number(raw.plot_area) : undefined,
    frontage: raw.frontage ? String(raw.frontage) : undefined,
    depth: raw.depth ? String(raw.depth) : undefined,

    numberOfRooms: raw.number_of_rooms ? Number(raw.number_of_rooms) : undefined,
    numberOfBedrooms: raw.number_of_bedrooms ? Number(raw.number_of_bedrooms) : undefined,
    numberOfBathrooms: raw.number_of_bathrooms ? Number(raw.number_of_bathrooms) : undefined,
    numberOfKitchens: raw.number_of_kitchens ? Number(raw.number_of_kitchens) : undefined,
    numberOfBalconies: raw.number_of_balconies ? Number(raw.number_of_balconies) : undefined,
    numberOfParkingSpaces: raw.number_of_parking_spaces ? Number(raw.number_of_parking_spaces) : undefined,
    numberOfShops: raw.number_of_shops ? Number(raw.number_of_shops) : undefined,
    numberOfOffices: raw.number_of_offices ? Number(raw.number_of_offices) : undefined,
    numberOfUnits: raw.number_of_units ? Number(raw.number_of_units) : undefined,
    numberOfFloors: raw.number_of_floors ? Number(raw.number_of_floors) : undefined,

    constructionStatus: raw.construction_status || undefined,
    roadAccess: raw.road_access || undefined,
    boundaryWall: raw.boundary_wall || undefined,

    auctionCategory: raw.auction_category || undefined,
    authority,
    bankName: raw.bank_name || undefined,
    branch: raw.branch || undefined,
    borrowerName: raw.borrower_name || undefined,
    borrowerRef: raw.borrower_name || `AM-REF-${id}`,
    auctionReferenceNo: raw.auction_reference_no || undefined,
    bankerAuctionNote: undefined,
    sarfaesiActSection: raw.auction_category ? `${raw.auction_category} Enforcement` : 'Statutory Handover',
    possessionStatus,
    titleClearanceStatus: 'Verified Title & Statutory Clearance',

    auctionDate: raw.auction_date || '',
    emdDeadline: raw.emd_submission_date || '',
    inspectionDate: 'Available on Request',
    status,
    currentHighestBid: undefined,
    totalBidsPlaced: undefined,

    amenities,
    images,
    rawImages: rawImagesList,
    documents,
    videos,
    highlights: [
      raw.auction_category ? `Auction: ${raw.auction_category}` : 'Verified Bank Auction',
      `Possession: ${possessionStatus}`,
      raw.auction_category ? `Category: ${raw.auction_category}` : 'Clear Statutory Title',
      raw.total_area && raw.area_unit ? `Area: ${raw.total_area} ${raw.area_unit}` : 'Verified Auction Asset',
    ],
    raw: raw
      ? {
          ...raw,
          banker_auction_note: null,
          coordinator_name: null,
          coordinator_phone: null,
          coordinator_email: null,
        }
      : undefined,
  };
}

/**
 * Strips internal backend admin URLs (e.g., https://auction-admin.springstrdg.com/admin/...)
 * so accidental admin panel copy-pastes never surface in public UI fields.
 */
export function stripBackendAdminUrls(input?: string | null): string | null {
  if (!input || typeof input !== 'string') return null;
  const cleaned = input
    .replace(/https?:\/\/[^\s"'<>]*?(?:auction-admin\.springstrdg\.com|springstrdg\.com\/admin|\/admin(?:\/|$))[^\s"'<>]*/gi, '')
    .replace(/(?:auction-admin\.springstrdg\.com|springstrdg\.com\/admin)[^\s"'<>]*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned || null;
}

export function sanitizePublicWebsiteUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (
    lower.includes('auction-admin') ||
    lower.includes('springstrdg.com') ||
    lower.includes('ai.studio') ||
    lower.includes('.run.app') ||
    lower.includes('/admin') ||
    lower.includes('/authorities/create') ||
    lower.includes('/create') ||
    lower.includes('/edit') ||
    lower.includes('/login') ||
    lower.includes('localhost') ||
    lower.includes('127.0.0.1')
  ) {
    return null;
  }
  return trimmed;
}

/**
 * Strips direct banker/officer/coordinator phone numbers, email addresses, contact-person lines,
 * and internal backend admin URLs from free-text fields so visitors exclusively use Auctions & More advisory channels.
 */
export function stripBankerContactDetails(input?: string | null): string | null {
  if (!input || typeof input !== 'string') return null;
  let cleaned = (stripBackendAdminUrls(input) || '')
    // Remove email addresses
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '')
    // Remove Indian mobile numbers (+91 / 91 / 0 prefixed or standalone 10-digit starting 6-9)
    .replace(/(?:\+91[\s.-]?|91[\s.-]?|0)?[6-9]\d{4}[\s.-]?\d{5}\b/g, '')
    // Remove leftover empty contact labels if they trailed a stripped phone/email
    .replace(/\(\s*(?:contact\s*person|authorised\s*officer|authorized\s*officer|mobile\s*no\.?|ph\.?|tel\.?)[:\s-]*\)/gi, '')
    .replace(/(?:contact\s*person|mobile\s*no\.?|helpline)\s*[:=-]\s*(?:[,.;|\n]|$)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return cleaned || null;
}

function sanitizeEntitySellerName(name?: string | null): string | null {
  const cleaned = stripBankerContactDetails(name);
  if (!cleaned) return null;
  if (/\b(?:authorized\s+officer|authorised\s+officer|recovery\s+officer|nodal\s+officer|chief\s+manager|branch\s+manager|agm\s+recovery|coordinator)\b/i.test(cleaned)) {
    return null;
  }
  return cleaned;
}

export function normalizeFaq(raw: any, index: number): FAQItem {
  const rawAnswer = String(raw.answer || raw.content || raw.description || '');

  return {
    id: raw.id ?? `faq-${index + 1}`,
    question: String(raw.question || raw.title || ''),
    answer: rawAnswer,
    category: String(raw.category || 'General'),
    is_verified: typeof raw.is_verified === 'boolean' ? raw.is_verified : Boolean(raw.is_verified),
    verified_text: raw.verified_text ? String(raw.verified_text) : (raw.verifiedText ? String(raw.verifiedText) : undefined),
    is_active: typeof raw.is_active === 'boolean' ? raw.is_active : true,
    sort_order: typeof raw.sort_order === 'number' ? raw.sort_order : index,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    deleted_at: raw.deleted_at,
  };
}

/**
 * Resolves cover image URL according to user specification:
 * If relative path (e.g. storage/blog/example.jpg), prepends backend base URL.
 * If already absolute (http:// or https://), returns as is.
 */
export function resolveCoverImageUrl(coverImage?: string | null): string {
  if (!coverImage || typeof coverImage !== 'string' || !coverImage.trim()) {
    return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80';
  }
  const trimmed = coverImage.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const cleanPath = trimmed.replace(/^\/+/, '');
  const base = BACKEND_URL.replace(/\/+$/, '');
  return `${base}/${cleanPath}`;
}

export function normalizeBlog(raw: any): BlogPost {
  const slug = String(raw.slug || raw.id || '');
  const id = raw.id ?? slug;
  const rawCoverImage = raw.cover_image || raw.image || raw.image_url;
  const coverImage = rawCoverImage ? resolveCoverImageUrl(rawCoverImage) : '';

  // Extract YouTube URL from any possible backend property name
  const rawYoutubeUrl =
    raw.youtube_url || raw.video_url || raw.youtube_link || raw.video_link || raw.youtube || null;
  const youtubeUrl =
    typeof rawYoutubeUrl === 'string' && rawYoutubeUrl.trim() ? rawYoutubeUrl.trim() : null;

  // If cover_image is NOT available but youtube_url exists, automatically use YouTube default thumbnail
  let fallbackImage = coverImage;
  if (!fallbackImage && youtubeUrl) {
    const ytThumb = getYouTubeThumbnailUrl(youtubeUrl);
    if (ytThumb) fallbackImage = ytThumb;
  }
  
  const authorName = raw.author_name || raw.author || 'Auctions & More Advisory Counsel';
  const authorDesignation = raw.author_designation || undefined;
  const authorCompany = raw.author_company || undefined;

  let readingTimeNum: number = 5;
  let readingTimeFormatted: string = '5 min read';
  if (typeof raw.reading_time === 'number') {
    readingTimeNum = raw.reading_time;
    readingTimeFormatted = `${raw.reading_time} min read`;
  } else if (typeof raw.reading_time === 'string' && raw.reading_time.trim()) {
    const parsed = parseInt(raw.reading_time, 10);
    if (!isNaN(parsed)) readingTimeNum = parsed;
    readingTimeFormatted = raw.reading_time.includes('min') ? raw.reading_time : `${raw.reading_time} min read`;
  } else if (raw.readTime) {
    readingTimeFormatted = String(raw.readTime);
  }

  let formattedDate = 'Recent';
  const rawDate = raw.published_at || raw.published_date || raw.created_at;
  if (rawDate) {
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      } else {
        formattedDate = String(rawDate);
      }
    } catch {
      formattedDate = String(rawDate);
    }
  }

  const rawContent = raw.content ?? raw.body ?? raw.description ?? raw.excerpt ?? '';
  const contentStr = typeof rawContent === 'string' ? rawContent : (Array.isArray(rawContent) ? rawContent.join('\n\n') : String(rawContent));

  // Extract category gracefully whether string, object with name/title, category_name, or blog_category
  let categoryName = 'General';
  if (typeof raw.category === 'string' && raw.category.trim()) {
    categoryName = raw.category.trim();
  } else if (raw.category && typeof raw.category === 'object') {
    categoryName = raw.category.name || raw.category.title || raw.category.category_name || raw.category.slug || 'General';
  } else if (typeof raw.category_name === 'string' && raw.category_name.trim()) {
    categoryName = raw.category_name.trim();
  } else if (raw.blog_category) {
    categoryName = typeof raw.blog_category === 'string' ? raw.blog_category.trim() : (raw.blog_category.name || raw.blog_category.title || 'General');
  } else if (Array.isArray(raw.categories) && raw.categories.length > 0) {
    const firstCat = raw.categories[0];
    categoryName = typeof firstCat === 'string' ? firstCat : (firstCat.name || firstCat.title || 'General');
  }

  return {
    id,
    slug,
    category: categoryName,
    title: String(raw.title || 'Bank Auction & SARFAESI Advisory Guide'),
    excerpt: String(raw.excerpt || raw.short_description || ''),
    cover_image: coverImage,
    youtube_url: youtubeUrl,
    video_url: youtubeUrl,
    author_name: authorName,
    author_designation: authorDesignation,
    author_company: authorCompany,
    reading_time: readingTimeNum,
    content: contentStr,
    published_at: raw.published_at || raw.created_at || new Date().toISOString(),
    is_published: typeof raw.is_published === 'boolean' ? raw.is_published : true,
    is_featured: typeof raw.is_featured === 'boolean' ? raw.is_featured : Boolean(raw.featured),
    sort_order: typeof raw.sort_order === 'number' ? raw.sort_order : 0,
    seo_title: raw.seo_title || undefined,
    seo_description: raw.seo_description || undefined,
    created_at: raw.created_at,
    updated_at: raw.updated_at,

    // Backward compatibility mappings
    author: authorName,
    readTime: readingTimeFormatted,
    date: formattedDate,
    image: fallbackImage || coverImage || '',
  };
}

export function normalizeTestimonial(raw: any, index: number): Testimonial {
  const cust = raw.customer && typeof raw.customer === 'object' ? raw.customer : {};
  const name = cust.name || raw.customer_name || raw.name || `Investor #${index + 1}`;
  const initials = cust.initials || raw.initials || name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'AM';
  const role = cust.designation || cust.company || raw.designation || raw.role || 'Property Investor';
  const city = cust.location || raw.location || raw.city || 'Delhi NCR';

  return {
    id: String(raw.id || `test-${index + 1}`),
    name,
    role,
    city,
    avatarText: initials,
    propertyAcquired: raw.asset_acquired || raw.property_acquired || raw.property_type || 'Auction Property',
    savingsOrValue: raw.acquired_price ? `Acquired at ${raw.acquired_price}` : (raw.savings || 'Substantial Discount vs Market'),
    quote: raw.testimonial || raw.testimonial_text || raw.quote || raw.text || 'Exceptional pre-bid clarity and seamless closing.',
    bankAuthority: raw.authority || raw.bank_authority || 'Bank Mandate',
    rating: Number(raw.rating || 5),
  };
}

// ----------------------------------------------------------------------
// Default Website Settings Fallback
// ----------------------------------------------------------------------

export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  company_name: COMPANY_INFO.name,
  short_name: 'Auctions & More',
  tagline: COMPANY_INFO.legalTagline,
  logo: '/logo.svg',
  phone_numbers: [COMPANY_INFO.contacts.primaryPhone, COMPANY_INFO.contacts.alternatePhone],
  primary_phone: COMPANY_INFO.contacts.primaryPhone,
  alternate_phone: COMPANY_INFO.contacts.alternatePhone,
  email_addresses: [COMPANY_INFO.contacts.email],
  primary_email: COMPANY_INFO.contacts.email,
  addresses: [COMPANY_INFO.contacts.address],
  primary_address: COMPANY_INFO.contacts.address,
  google_maps_url: 'https://maps.google.com/?q=Barakhamba+Road+Connaught+Place+New+Delhi',
  google_map_url: 'https://maps.google.com/?q=Barakhamba+Road+Connaught+Place+New+Delhi',
  map_url: 'https://maps.google.com/?q=Barakhamba+Road+Connaught+Place+New+Delhi',
  map_embed_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.164326084042!2d77.22557997549742!3d28.627725975667623!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd34208a0ab7%3A0xf650a320ce8f01b9!2sBarakhamba%20Rd%2C%20Connaught%20Place%2C%20New%20Delhi%2C%20Delhi%20110001!5e0!3m2!1sen!2sin!4v1710892019485!5m2!1sen!2sin',
  embed_map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.164326084042!2d77.22557997549742!3d28.627725975667623!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd34208a0ab7%3A0xf650a320ce8f01b9!2sBarakhamba%20Rd%2C%20Connaught%20Place%2C%20New%20Delhi%2C%20Delhi%20110001!5e0!3m2!1sen!2sin!4v1710892019485!5m2!1sen!2sin',
  whatsapp_number: '+919899897647',
  whatsapp_message: 'Hi Auctions & More, I would like to inquire about bank auction properties.',
  office_timings: 'Mon – Sat: 9:30 AM – 7:00 PM IST',
  social_links: {
    linkedin: 'https://linkedin.com',
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    twitter: 'https://x.com',
  },
  footer_text: COMPANY_INFO.overview,
  copyright: `© ${new Date().getFullYear()} Auctions & More Pvt Ltd. All rights reserved.`,
  website_url: 'https://auctionsandmore.in',
  default_seo_title: "Auctions & More — India's Premier Distressed Asset Resolution Platform",
  default_meta_description: 'Evolved from Eagle Capital Services (15+ Years). Transparent SARFAESI bank auction properties, IBC liquidation sales, and NCLT investor advisory.',
};

function formatOfficeTimings(rawTimings: any): { formatted: string; list: OfficeTimingItem[] } {
  if (typeof rawTimings === 'string' && rawTimings.trim()) {
    return { formatted: rawTimings.trim(), list: [] };
  }

  if (Array.isArray(rawTimings) && rawTimings.length > 0) {
    const list: OfficeTimingItem[] = rawTimings.map((item: any) => ({
      day: String(item?.day || ''),
      open: item?.open ? String(item.open) : null,
      close: item?.close ? String(item.close) : null,
      closed: Boolean(item?.closed),
    }));

    const formatTime = (timeStr: string) => {
      const parts = timeStr.split(':');
      if (parts.length >= 2) {
        const hour = parseInt(parts[0], 10);
        const minute = parts[1];
        if (!isNaN(hour)) {
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const hr12 = hour % 12 || 12;
          return `${hr12}:${minute} ${ampm}`;
        }
      }
      return timeStr;
    };

    // Filter active days with valid, non-null, non-equal open & close hours
    const activeDays = list.filter(
      (t) => !t.closed && t.open && t.close && t.open !== 'null' && t.close !== 'null'
    );

    if (activeDays.length > 0) {
      // Avoid dummy 23:59:59 to 22:59:59 test records if that's all that exists
      const valid = activeDays.filter(t => t.open !== t.close && !t.open!.startsWith('23:59'));
      if (valid.length > 0) {
        const formatted = valid
          .map((t) => `${t.day}: ${formatTime(t.open!)} – ${formatTime(t.close!)}`)
          .join(', ');
        return { formatted, list };
      }
    }

    return { formatted: DEFAULT_WEBSITE_SETTINGS.office_timings, list };
  }

  return { formatted: DEFAULT_WEBSITE_SETTINGS.office_timings, list: [] };
}

// ----------------------------------------------------------------------
// Exported API Functions
// ----------------------------------------------------------------------

/**
 * 1. GET /website-settings
 */
export async function getWebsiteSettings(): Promise<WebsiteSettings> {
  const res = await requestJson<any>('/website-settings', { method: 'GET' });
  if (res.success && res.data && typeof res.data === 'object') {
    const d = res.data;
    const comp = (d.company && typeof d.company === 'object') ? d.company : {};
    const contact = (d.contact && typeof d.contact === 'object') ? d.contact : {};
    const loc = (d.location && typeof d.location === 'object') ? d.location : {};
    const foot = (d.footer && typeof d.footer === 'object') ? d.footer : {};
    const web = (d.website && typeof d.website === 'object') ? d.website : {};

    // 1. Safe phone list
    let phoneList: string[] = [];
    if (Array.isArray(contact.phone_numbers)) {
      phoneList = contact.phone_numbers
        .map((p: any) => (typeof p === 'string' ? p : p?.number || p?.phone || ''))
        .filter(Boolean);
    } else if (Array.isArray(d.phone_numbers)) {
      phoneList = d.phone_numbers
        .map((p: any) => (typeof p === 'string' ? p : p?.number || p?.phone || ''))
        .filter(Boolean);
    }
    const fallbackPhone = contact.phone || contact.primary_phone || d.primary_phone || d.phone;
    if (phoneList.length === 0 && fallbackPhone) {
      phoneList.push(String(fallbackPhone));
    }
    if (phoneList.length === 0) {
      phoneList = DEFAULT_WEBSITE_SETTINGS.phone_numbers;
    }

    // 2. Safe email list
    let emailList: string[] = [];
    if (Array.isArray(contact.email_addresses)) {
      emailList = contact.email_addresses
        .map((e: any) => (typeof e === 'string' ? e : e?.email || ''))
        .filter(Boolean);
    } else if (Array.isArray(d.email_addresses)) {
      emailList = d.email_addresses
        .map((e: any) => (typeof e === 'string' ? e : e?.email || ''))
        .filter(Boolean);
    }
    const fallbackEmail = contact.email || contact.primary_email || d.primary_email || d.email;
    if (emailList.length === 0 && fallbackEmail) {
      emailList.push(String(fallbackEmail));
    }
    if (emailList.length === 0) {
      emailList = DEFAULT_WEBSITE_SETTINGS.email_addresses;
    }

    // 3. Safe address list
    let addressList: string[] = [];
    if (Array.isArray(contact.addresses)) {
      addressList = contact.addresses
        .map((a: any) => (typeof a === 'string' ? a : a?.address || ''))
        .filter(Boolean);
    } else if (Array.isArray(d.addresses)) {
      addressList = d.addresses
        .map((a: any) => (typeof a === 'string' ? a : a?.address || ''))
        .filter(Boolean);
    }
    const fallbackAddr = contact.address || contact.primary_address || d.primary_address || d.address;
    if (addressList.length === 0 && fallbackAddr) {
      addressList.push(String(fallbackAddr));
    }
    if (addressList.length === 0) {
      addressList = DEFAULT_WEBSITE_SETTINGS.addresses;
    }

    // 4. Safe office timings formatting
    const rawTimings = d.office_timings !== undefined ? d.office_timings : contact.office_timings;
    const { formatted: officeTimingsStr, list: officeTimingsList } = formatOfficeTimings(rawTimings);

    // 5. Safe social links
    const socialMap: Record<string, string> = { ...DEFAULT_WEBSITE_SETTINGS.social_links };
    if (Array.isArray(d.social_links)) {
      for (const s of d.social_links) {
        if (s && s.platform && s.url && s.is_active !== false) {
          socialMap[String(s.platform).toLowerCase()] = String(s.url);
        }
      }
    } else if (d.social_links && typeof d.social_links === 'object') {
      Object.assign(socialMap, d.social_links);
    }

    // Robust Google Maps URL resolution from all possible backend fields
    const rawWebsiteMapUrl =
      loc.google_maps_url ||
      loc.google_map_url ||
      loc.map_url ||
      loc.maps_url ||
      loc.location_url ||
      contact.google_maps_url ||
      contact.google_map_url ||
      contact.map_url ||
      contact.maps_url ||
      contact.location_url ||
      contact.addresses?.[0]?.google_maps_url ||
      contact.addresses?.[0]?.map_url ||
      d.google_maps_url ||
      d.google_map_url ||
      d.map_url ||
      d.maps_url ||
      d.location_url ||
      (loc.latitude && loc.longitude ? `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}` : undefined) ||
      (contact.latitude && contact.longitude ? `https://www.google.com/maps?q=${contact.latitude},${contact.longitude}` : undefined) ||
      (d.latitude && d.longitude ? `https://www.google.com/maps?q=${d.latitude},${d.longitude}` : undefined);

    const safeGoogleMapsUrl = formatGoogleMapsUrl(
      rawWebsiteMapUrl,
      addressList[0] || DEFAULT_WEBSITE_SETTINGS.primary_address
    );

    const rawEmbedMapUrl =
      loc.map_embed_url ||
      loc.embed_map_url ||
      loc.embed_url ||
      loc.map_iframe ||
      contact.map_embed_url ||
      contact.embed_map_url ||
      contact.embed_url ||
      contact.map_iframe ||
      contact.addresses?.[0]?.map_embed_url ||
      contact.addresses?.[0]?.embed_url ||
      d.map_embed_url ||
      d.embed_map_url ||
      d.embed_url ||
      d.map_iframe ||
      d.google_map_embed_url;

    const safeMapEmbedUrl = formatMapEmbedUrl(
      rawEmbedMapUrl,
      rawWebsiteMapUrl,
      addressList[0] || DEFAULT_WEBSITE_SETTINGS.primary_address
    );

    return {
      company_name: comp.name || d.company_name || d.name || DEFAULT_WEBSITE_SETTINGS.company_name,
      short_name: comp.short_name || d.short_name || DEFAULT_WEBSITE_SETTINGS.short_name,
      tagline: comp.tagline || d.tagline || DEFAULT_WEBSITE_SETTINGS.tagline,
      logo: comp.logo || d.logo || DEFAULT_WEBSITE_SETTINGS.logo,
      favicon: comp.favicon || d.favicon || DEFAULT_WEBSITE_SETTINGS.favicon,
      phone_numbers: phoneList,
      primary_phone: phoneList[0] || DEFAULT_WEBSITE_SETTINGS.primary_phone,
      alternate_phone: phoneList[1] || DEFAULT_WEBSITE_SETTINGS.alternate_phone,
      email_addresses: emailList,
      primary_email: emailList[0] || DEFAULT_WEBSITE_SETTINGS.primary_email,
      addresses: addressList,
      primary_address: addressList[0] || DEFAULT_WEBSITE_SETTINGS.primary_address,
      google_maps_url: safeGoogleMapsUrl,
      google_map_url: safeGoogleMapsUrl,
      map_url: safeGoogleMapsUrl,
      map_embed_url: safeMapEmbedUrl,
      embed_map_url: safeMapEmbedUrl,
      whatsapp_number: String(contact.whatsapp_number || d.whatsapp_number || DEFAULT_WEBSITE_SETTINGS.whatsapp_number),
      whatsapp_message: String(contact.whatsapp_message || d.whatsapp_message || DEFAULT_WEBSITE_SETTINGS.whatsapp_message),
      office_timings: officeTimingsStr,
      office_timings_list: officeTimingsList,
      social_links: socialMap,
      footer_text: foot.text || d.footer_text || DEFAULT_WEBSITE_SETTINGS.footer_text,
      copyright: foot.copyright || d.copyright || DEFAULT_WEBSITE_SETTINGS.copyright,
      website_url: DEFAULT_WEBSITE_SETTINGS.website_url,
      default_seo_title: web.default_page_title || d.default_seo_title || DEFAULT_WEBSITE_SETTINGS.default_seo_title,
      default_meta_description: web.default_meta_description || d.default_meta_description || DEFAULT_WEBSITE_SETTINGS.default_meta_description,
    };
  }
  return DEFAULT_WEBSITE_SETTINGS;
}

// Internal request deduplication and memory cache for properties
const propertiesCache = new Map<
  string,
  {
    data: {
      properties: Property[];
      pagination: PropertyPagination;
      fromApi: boolean;
      success: boolean;
      error?: string;
    };
    timestamp: number;
  }
>();

const inFlightPropertiesRequests = new Map<
  string,
  Promise<{
    properties: Property[];
    pagination: PropertyPagination;
    fromApi: boolean;
    success: boolean;
    error?: string;
  }>
>();

// Cache TTL: 20 seconds
const PROPERTIES_CACHE_TTL_MS = 20000;

// Retain last successful properties across any call to safeguard against 429 rate limit
let fallbackPropertiesCatalog: Property[] = [];
let fallbackPropertiesPagination: PropertyPagination = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: 0,
  to: 0,
};

/**
 * 2. GET /properties
 * Supports: min_price, max_price, property_type, property_sub_type, state_id, auction_category, possession_status, per_page, page
 */
export async function getProperties(params?: PropertyFilterParams): Promise<{
  properties: Property[];
  pagination: PropertyPagination;
  fromApi: boolean;
  success: boolean;
  error?: string;
}> {
  const query = new URLSearchParams();
  if (params) {
    if (params.search && params.search.trim()) {
      query.set('search', params.search.trim());
    }
    if (params.min_price !== undefined && params.min_price !== null && params.min_price > 0) {
      query.set('min_price', String(params.min_price));
    }
    if (params.max_price !== undefined && params.max_price !== null && params.max_price > 0) {
      query.set('max_price', String(params.max_price));
    }
    if (params.property_type && params.property_type !== 'all' && params.property_type !== 'Any') {
      query.set('property_type', params.property_type);
    }
    if (params.property_sub_type && params.property_sub_type !== 'all' && params.property_sub_type !== 'Any') {
      query.set('property_sub_type', params.property_sub_type);
    }
    if (params.state && params.state !== 'all' && params.state !== 'All') {
      query.set('state', params.state);
    }
    if (params.state_id && params.state_id !== 'all') {
      query.set('state_id', String(params.state_id));
    }
    if (params.city && params.city !== 'all' && params.city !== 'All') {
      query.set('city', params.city);
    }
    if (params.city_id && params.city_id !== 'all') {
      query.set('city_id', String(params.city_id));
    }
    if (params.preferred_areas && params.preferred_areas !== 'all' && params.preferred_areas !== 'All') {
      query.set('preferred_areas', params.preferred_areas);
    }
    if (params.auction_category && params.auction_category !== 'all') {
      query.set('auction_category', params.auction_category);
    }
    if (params.possession_status && params.possession_status !== 'all') {
      query.set('possession_status', params.possession_status);
    }
    if (params.per_page) {
      query.set('per_page', String(params.per_page));
    }
    if (params.page) {
      query.set('page', String(params.page));
    }
  }

  const endpoint = `/properties${query.toString() ? `?${query.toString()}` : ''}`;
  const now = Date.now();

  // 1. Check in-memory cache
  const cached = propertiesCache.get(endpoint);
  if (cached && now - cached.timestamp < PROPERTIES_CACHE_TTL_MS) {
    return cached.data;
  }

  // 2. Check in-flight request
  if (inFlightPropertiesRequests.has(endpoint)) {
    return inFlightPropertiesRequests.get(endpoint)!;
  }

  // 3. Initiate request with in-flight tracking
  const fetchPromise = (async () => {
    try {
      const res = await requestJson<any>(endpoint, { method: 'GET' });

      if (res.success && Array.isArray(res.data)) {
        const list = res.data.map((item: any, idx: number) => normalizeProperty(item, idx + 1));
        const pagination: PropertyPagination = res.pagination
          ? {
              current_page: Number(res.pagination.current_page || 1),
              last_page: Number(res.pagination.last_page || 1),
              per_page: Number(res.pagination.per_page || 15),
              total: Number(res.pagination.total ?? list.length),
              from: res.pagination.from ?? (list.length > 0 ? 1 : 0),
              to: res.pagination.to ?? list.length,
            }
          : {
              current_page: params?.page || 1,
              last_page: 1,
              per_page: params?.per_page || 15,
              total: list.length,
              from: list.length > 0 ? 1 : 0,
              to: list.length,
            };

        const result = {
          properties: list,
          pagination,
          fromApi: true,
          success: true,
        };

        // Cache successful response
        propertiesCache.set(endpoint, { data: result, timestamp: Date.now() });

        // Update fallback if this was base/unfiltered or contains items
        if (list.length > 0) {
          fallbackPropertiesCatalog = list;
          fallbackPropertiesPagination = pagination;
        }

        return result;
      }

      // If rate limited (429) or error, serve fallback properties if available
      if (fallbackPropertiesCatalog.length > 0) {
        return {
          properties: fallbackPropertiesCatalog,
          pagination: fallbackPropertiesPagination,
          fromApi: false,
          success: true,
          error: res.status === 429 
            ? 'Backend rate limit reached (429). Displaying cached properties.' 
            : (res.message || 'Displaying cached properties.'),
        };
      }

      return {
        properties: [],
        pagination: {
          current_page: params?.page || 1,
          last_page: 1,
          per_page: params?.per_page || 15,
          total: 0,
          from: 0,
          to: 0,
        },
        fromApi: false,
        success: false,
        error: res.message || 'Failed to fetch properties from server.',
      };
    } finally {
      inFlightPropertiesRequests.delete(endpoint);
    }
  })();

  inFlightPropertiesRequests.set(endpoint, fetchPromise);
  return fetchPromise;
}

/**
 * Complete list of all 28 Indian States and 8 Union Territories
 */
export const ALL_INDIAN_STATES: { id: number; name: string }[] = [
  { id: 1, name: 'Andhra Pradesh' },
  { id: 2, name: 'Arunachal Pradesh' },
  { id: 3, name: 'Assam' },
  { id: 4, name: 'Bihar' },
  { id: 5, name: 'Chhattisgarh' },
  { id: 6, name: 'Goa' },
  { id: 7, name: 'Gujarat' },
  { id: 8, name: 'Haryana' },
  { id: 9, name: 'Himachal Pradesh' },
  { id: 10, name: 'Jharkhand' },
  { id: 11, name: 'Karnataka' },
  { id: 12, name: 'Kerala' },
  { id: 13, name: 'Madhya Pradesh' },
  { id: 14, name: 'Maharashtra' },
  { id: 15, name: 'Manipur' },
  { id: 16, name: 'Meghalaya' },
  { id: 17, name: 'Mizoram' },
  { id: 18, name: 'Nagaland' },
  { id: 19, name: 'Odisha' },
  { id: 20, name: 'Punjab' },
  { id: 21, name: 'Rajasthan' },
  { id: 22, name: 'Sikkim' },
  { id: 23, name: 'Tamil Nadu' },
  { id: 24, name: 'Telangana' },
  { id: 25, name: 'Tripura' },
  { id: 26, name: 'Uttar Pradesh' },
  { id: 27, name: 'Uttarakhand' },
  { id: 28, name: 'West Bengal' },
  { id: 29, name: 'Andaman and Nicobar Islands' },
  { id: 30, name: 'Chandigarh' },
  { id: 31, name: 'Dadra and Nagar Haveli and Daman and Diu' },
  { id: 32, name: 'Delhi' },
  { id: 33, name: 'Jammu and Kashmir' },
  { id: 34, name: 'Ladakh' },
  { id: 35, name: 'Lakshadweep' },
  { id: 36, name: 'Puducherry' },
];

/**
 * 3. GET /properties/{property} (supports lookup by slug or id)
 */
export async function getPropertyById(idOrSlug: string | number): Promise<{
  property: Property | null;
  fromApi: boolean;
  success: boolean;
  error?: string;
}> {
  // First try direct API endpoint with slug or id
  const res = await requestJson<any>(`/properties/${idOrSlug}`, { method: 'GET' });
  if (res.success && res.data) {
    return {
      property: normalizeProperty(res.data),
      fromApi: true,
      success: true,
    };
  }

  // If not found directly and idOrSlug is string/slug, try finding from property listings
  try {
    const listRes = await getProperties({ per_page: 50 });
    if (listRes.success && listRes.properties.length > 0) {
      const match = listRes.properties.find(
        (p) => p.slug === String(idOrSlug) || String(p.id) === String(idOrSlug)
      );
      if (match) {
        return {
          property: match,
          fromApi: true,
          success: true,
        };
      }
    }
  } catch {
    // Ignore fallback error
  }

  return {
    property: null,
    fromApi: false,
    success: false,
    error: res.message || 'Property details not found.',
  };
}

/**
 * 4. GET /faqs (or /api/faqs)
 * Optional category filter: GET /faqs?category={category}
 */
export async function getFaqs(params?: { category?: string }): Promise<{
  faqs: FAQItem[];
  fromApi: boolean;
  success: boolean;
  message?: string;
}> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'all' && params.category.trim() !== '') {
    query.set('category', params.category.trim());
  }
  const queryString = query.toString() ? `?${query.toString()}` : '';

  // 1. First attempt: via standard API endpoint
  const endpoint = `/faqs${queryString}`;
  const res = await requestJson<any>(endpoint, { method: 'GET' });

  if (res.success && Array.isArray(res.data)) {
    return {
      faqs: res.data.map((item: any, idx: number) => normalizeFaq(item, idx)),
      fromApi: true,
      success: true,
      message: res.message || 'FAQs fetched successfully.',
    };
  }

  // 2. Direct fallback attempt: try direct backend URL variations
  try {
    const directUrls = [
      `${BACKEND_URL.replace(/\/+$/, '')}/api/v1/faqs${queryString}`,
      `${BACKEND_URL.replace(/\/+$/, '')}/api/faqs${queryString}`,
    ];
    for (const url of directUrls) {
      const altRes = await fetch(url, { headers: { Accept: 'application/json' } });
      if (altRes.ok) {
        const json = await altRes.json();
        if (json && (json.success === true || Array.isArray(json.data) || Array.isArray(json))) {
          const list = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
          return {
            faqs: list.map((item: any, idx: number) => normalizeFaq(item, idx)),
            fromApi: true,
            success: true,
            message: json.message || 'FAQs fetched successfully.',
          };
        }
      }
    }
  } catch {
    // Network or fallback error
  }

  return {
    faqs: [],
    fromApi: false,
    success: false,
    message: res.message || 'Failed to connect to FAQ service.',
  };
}

/**
 * GET /faqs/{id}
 */
export async function getFaq(id: string | number): Promise<{
  faq: FAQItem | null;
  success: boolean;
  message?: string;
}> {
  const res = await requestJson<any>(`/faqs/${id}`, { method: 'GET' });
  if (res.success && res.data) {
    return {
      faq: normalizeFaq(res.data, 0),
      success: true,
      message: res.message,
    };
  }

  try {
    const directUrl = `${BACKEND_URL.replace(/\/+$/, '')}/api/v1/faqs/${id}`;
    const altRes = await fetch(directUrl, { headers: { Accept: 'application/json' } });
    if (altRes.ok) {
      const json = await altRes.json();
      if (json && json.data) {
        return {
          faq: normalizeFaq(json.data, 0),
          success: true,
          message: json.message,
        };
      }
    }
  } catch {
    // ignore
  }

  return {
    faq: null,
    success: false,
    message: res.message || 'FAQ not found.',
  };
}

export interface GetBlogsParams {
  category?: string;
  featured?: boolean | string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface GetBlogsResponse {
  blogs: BlogPost[];
  pagination: BlogPagination;
  fromApi: boolean;
  success: boolean;
  message?: string;
}

export interface GetBlogDetailResponse {
  blog: BlogPost | null;
  related_blogs: BlogPost[];
  fromApi: boolean;
  success: boolean;
  message?: string;
}

/**
 * 5. GET /blogs
 * Query parameters: category, featured, search, per_page, page
 */
export async function getBlogs(params?: GetBlogsParams): Promise<GetBlogsResponse> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'all' && params.category !== 'All' && params.category.trim() !== '') {
    query.set('category', params.category.trim());
  }
  if (params?.featured !== undefined && params.featured !== '') {
    query.set('featured', String(params.featured));
  }
  if (params?.search && params.search.trim()) {
    query.set('search', params.search.trim());
  }
  if (params?.per_page) {
    query.set('per_page', String(Math.min(100, Math.max(1, params.per_page))));
  }
  if (params?.page) {
    query.set('page', String(Math.max(1, params.page)));
  }

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const endpoint = `/blogs${queryString}`;

  // 1. Primary attempt via requestJson
  const res = await requestJson<any>(endpoint, { method: 'GET' });

  if (res.success && Array.isArray(res.data)) {
    const rawPag = res.pagination || {};
    const pagination: BlogPagination = {
      current_page: rawPag.current_page || params?.page || 1,
      last_page: rawPag.last_page || 1,
      per_page: rawPag.per_page || params?.per_page || 12,
      total: typeof rawPag.total === 'number' ? rawPag.total : res.data.length,
      from: rawPag.from ?? (res.data.length > 0 ? 1 : null),
      to: rawPag.to ?? res.data.length,
    };

    return {
      blogs: res.data.map((item: any) => normalizeBlog(item)),
      pagination,
      fromApi: true,
      success: true,
      message: res.message || 'Blogs fetched successfully.',
    };
  }

  // 2. Direct fallback attempt via backend URLs
  try {
    const directUrls = [
      `${BACKEND_URL.replace(/\/+$/, '')}/api/v1/blogs${queryString}`,
      `${BACKEND_URL.replace(/\/+$/, '')}/api/blogs${queryString}`,
    ];
    for (const url of directUrls) {
      const altRes = await fetch(url, { headers: { Accept: 'application/json' } });
      if (altRes.ok) {
        const json = await altRes.json();
        if (json && (json.success === true || Array.isArray(json.data) || Array.isArray(json))) {
          const list = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
          const rawPag = json.pagination || {};
          const pagination: BlogPagination = {
            current_page: rawPag.current_page || params?.page || 1,
            last_page: rawPag.last_page || 1,
            per_page: rawPag.per_page || params?.per_page || 12,
            total: typeof rawPag.total === 'number' ? rawPag.total : list.length,
            from: rawPag.from ?? (list.length > 0 ? 1 : null),
            to: rawPag.to ?? list.length,
          };

          return {
            blogs: list.map((item: any) => normalizeBlog(item)),
            pagination,
            fromApi: true,
            success: true,
            message: json.message || 'Blogs fetched successfully.',
          };
        }
      }
    }
  } catch {
    // Network or fallback error
  }

  return {
    blogs: [],
    pagination: DEFAULT_BLOG_PAGINATION,
    fromApi: false,
    success: false,
    message: res.message || 'Failed to fetch blogs from server.',
  };
}

/**
 * 6. GET /blogs/{slug}
 * Response returns data (main blog) and related_blogs
 */
export async function getBlogBySlug(slug: string): Promise<GetBlogDetailResponse> {
  const endpoint = `/blogs/${encodeURIComponent(slug)}`;
  const res = await requestJson<any>(endpoint, { method: 'GET' });

  if (res.success && res.data) {
    const related = Array.isArray(res.related_blogs)
      ? res.related_blogs.map((item: any) => normalizeBlog(item))
      : [];

    return {
      blog: normalizeBlog(res.data),
      related_blogs: related,
      fromApi: true,
      success: true,
      message: res.message || 'Blog fetched successfully.',
    };
  }

  // Direct fallback attempt via backend URLs
  try {
    const directUrls = [
      `${BACKEND_URL.replace(/\/+$/, '')}/api/v1/blogs/${encodeURIComponent(slug)}`,
      `${BACKEND_URL.replace(/\/+$/, '')}/api/blogs/${encodeURIComponent(slug)}`,
    ];
    for (const url of directUrls) {
      const altRes = await fetch(url, { headers: { Accept: 'application/json' } });
      if (altRes.ok) {
        const json = await altRes.json();
        if (json && json.data) {
          const related = Array.isArray(json.related_blogs)
            ? json.related_blogs.map((item: any) => normalizeBlog(item))
            : [];

          return {
            blog: normalizeBlog(json.data),
            related_blogs: related,
            fromApi: true,
            success: true,
            message: json.message || 'Blog fetched successfully.',
          };
        }
      }
    }
  } catch {
    // Network error
  }

  return {
    blog: null,
    related_blogs: [],
    fromApi: false,
    success: false,
    message: res.message || 'Blog not found.',
  };
}

/**
 * 7. GET /testimonials
 */
export async function getTestimonials(): Promise<{ testimonials: Testimonial[]; fromApi: boolean }> {
  const res = await requestJson<any>('/testimonials', { method: 'GET' });
  if (res.success && Array.isArray(res.data) && res.data.length > 0) {
    return {
      testimonials: res.data.map((item: any, idx: number) => normalizeTestimonial(item, idx)),
      fromApi: true,
    };
  }
  return { testimonials: TESTIMONIALS, fromApi: false };
}

/**
 * 8. GET /legal-pages/{pageType}
 */
export async function getLegalPage(pageType: 'privacy-policy' | 'terms-conditions' | string): Promise<{
  page: LegalPageData | null;
  fromApi: boolean;
}> {
  const res = await requestJson<any>(`/legal-pages/${pageType}`, { method: 'GET' });
  if (res.success && res.data) {
    const d = res.data;
    return {
      page: {
        title: d.title || (pageType === 'privacy-policy' ? 'Privacy Policy' : 'Terms & Conditions'),
        slug: d.slug || pageType,
        content: d.content || d.body || '',
        last_updated: d.last_updated || d.updated_at,
      },
      fromApi: true,
    };
  }
  return { page: null, fromApi: false };
}

/**
 * 9. FORM 1 — PROPERTY ENQUIRY
 * POST /enquiries
 * Payload: { property_id, name, email, phone, message }
 */
export async function postPropertyEnquiry(payload: PropertyEnquiryPayload): Promise<{
  success: boolean;
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}> {
  const body = JSON.stringify({
    property_id: payload.property_id,
    name: payload.name.trim(),
    email: payload.email.trim(),
    phone: payload.phone.trim(),
    message: payload.message.trim(),
  });

  const res = await requestJson<any>('/enquiries', {
    method: 'POST',
    body,
  });

  if (res.success || res.status === 201 || res.status === 200) {
    return {
      success: true,
      status: res.status || 201,
      message: 'Thank you. Your enquiry has been submitted successfully. Our team will contact you shortly.',
    };
  }

  return {
    success: false,
    status: res.status,
    message: res.message || 'Unable to submit enquiry right now. Please try again.',
    errors: res.errors,
  };
}

/**
 * 10. FORM 2 — CUSTOMER REQUIREMENT / PROPERTY SEARCH
 * POST /customers
 * Payload: { name, phone, email, preferred_areas, min_budget, max_budget, property_type, source, notes }
 */
export async function postCustomerRequirement(payload: CustomerRequirementPayload): Promise<{
  success: boolean;
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}> {
  // MySQL table customers has a strict ENUM/short column for `source`.
  // Acceptable database value is 'website'. Any other arbitrary string causes SQL truncation error 1265.
  const safeSource = payload.source === 'direct' || payload.source === 'referral' ? payload.source : 'website';

  const body = JSON.stringify({
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    email: payload.email.trim(),
    preferred_areas: Array.isArray(payload.preferred_areas) && payload.preferred_areas.length > 0
      ? payload.preferred_areas
      : ['Delhi NCR'],
    min_budget: Number(payload.min_budget) || 0,
    max_budget: Number(payload.max_budget) || 0,
    property_type: payload.property_type || 'Residential',
    property_sub_type: payload.property_sub_type || undefined,
    source: safeSource,
    notes: (payload.property_sub_type && !payload.notes.includes(payload.property_sub_type)
      ? `[Sub-Type: ${payload.property_sub_type}] ${payload.notes || ''}`
      : payload.notes || ''
    ).trim(),
  });

  const res = await requestJson<any>('/customers', {
    method: 'POST',
    body,
  });

  if (res.success || res.status === 201 || res.status === 200) {
    return {
      success: true,
      status: res.status || 201,
      message: 'Thank you! Your property requirement has been submitted successfully. Our team will review your requirement and contact you shortly.',
    };
  }

  return {
    success: false,
    status: res.status,
    message: res.message || 'Unable to submit your requirement right now. Please try again.',
    errors: res.errors,
  };
}

export interface AuthorityPropertyEnquiryPayload {
  property: AuthorityProperty;
  name: string;
  email: string;
  phone: string;
  enquiry_purpose?: string;
  message: string;
}

/**
 * 10B. FORM — AUTHORITY PROPERTY ENQUIRY
 * Submits structured Authority Property enquiry lead to Laravel `/customers` CRM endpoint.
 */
export async function postAuthorityPropertyEnquiry(
  payload: AuthorityPropertyEnquiryPayload
): Promise<{
  success: boolean;
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}> {
  const validTypes = [
    'Residential',
    'Commercial',
    'Industrial',
    'Land',
    'Hospitality',
    'Mixed-Use',
    'Agricultural',
    'Institutional',
    'Special Purpose',
    'Government',
    'Other',
  ];

  const rawType = (payload.property.property_type || '').trim();
  const matchedType =
    validTypes.find((t) => t.toLowerCase() === rawType.toLowerCase()) || 'Government';

  const areas = [payload.property.city_name, payload.property.state_name]
    .map((v) => (v ? v.trim() : ''))
    .filter(Boolean);

  const budgetVal =
    payload.property.reserve_price !== null &&
    payload.property.reserve_price !== undefined &&
    !isNaN(Number(payload.property.reserve_price))
      ? Number(payload.property.reserve_price)
      : 0;

  const metaParts = [
    `[Authority Property Enquiry]`,
    `Property ID: #${payload.property.id}`,
    payload.property.property_code ? `Code: ${payload.property.property_code}` : '',
    payload.property.title ? `Title: ${payload.property.title}` : '',
    payload.property.authority?.name
      ? `Authority: ${payload.property.authority.name}${
          payload.property.authority.short_name ? ` (${payload.property.authority.short_name})` : ''
        }`
      : '',
    payload.property.scheme_name ? `Scheme: ${payload.property.scheme_name}` : '',
    payload.enquiry_purpose ? `Purpose: ${payload.enquiry_purpose}` : '',
  ].filter(Boolean);

  const notes = `${metaParts.join(' | ')} — Message: ${payload.message.trim()}`;

  const body = JSON.stringify({
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    email: payload.email.trim(),
    preferred_areas: areas.length > 0 ? areas : ['Pan India'],
    min_budget: budgetVal,
    max_budget: budgetVal,
    property_type: matchedType,
    property_sub_type: payload.property.property_sub_type || undefined,
    source: 'website',
    notes,
  });

  const res = await requestJson<any>('/customers', {
    method: 'POST',
    body,
  });

  if (res.success || res.status === 201 || res.status === 200) {
    return {
      success: true,
      status: res.status || 201,
      message:
        'Thank you. Your authority property enquiry has been submitted successfully. Our advisory desk will contact you shortly.',
    };
  }

  return {
    success: false,
    status: res.status,
    message: res.message || 'Unable to submit enquiry right now. Please try again.',
    errors: res.errors,
  };
}

export interface AuctionAssetEnquiryPayload {
  asset: AuctionAsset;
  name: string;
  email: string;
  phone: string;
  company_name?: string;
  enquiry_purpose?: string;
  message: string;
}

/**
 * 10C. FORM — SCRAP & PLANT MACHINERY AUCTION ENQUIRY
 * Submits structured Scrap / Plant & Machinery lot enquiry lead to Laravel `/customers` CRM endpoint.
 */
export async function postAuctionAssetEnquiry(
  payload: AuctionAssetEnquiryPayload
): Promise<{
  success: boolean;
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}> {
  const locationLabel = [payload.asset.city, payload.asset.state]
    .map((v) => (v ? v.trim() : ''))
    .filter(Boolean)
    .join(', ');

  const budgetVal =
    payload.asset.reserve_price !== null &&
    payload.asset.reserve_price !== undefined &&
    !isNaN(Number(payload.asset.reserve_price))
      ? Number(payload.asset.reserve_price)
      : 0;

  const categoryLabel = payload.asset.category || 'Scrap & Machinery';
  const metaParts = [
    `[${categoryLabel} Auction Enquiry]`,
    `Asset ID: #${payload.asset.id}`,
    payload.asset.reference_no ? `Ref: ${payload.asset.reference_no}` : '',
    payload.asset.sub_type ? `Sub-Type: ${payload.asset.sub_type}` : '',
    payload.asset.title ? `Title: ${payload.asset.title}` : '',
    payload.company_name?.trim() ? `Company: ${payload.company_name.trim()}` : '',
    payload.enquiry_purpose ? `Purpose: ${payload.enquiry_purpose}` : '',
  ].filter(Boolean);

  const notes = `${metaParts.join(' | ')} — Message: ${payload.message.trim()}`;

  const body = JSON.stringify({
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    email: payload.email.trim(),
    preferred_areas: locationLabel ? [locationLabel] : ['Pan India'],
    min_budget: budgetVal,
    max_budget: budgetVal,
    property_type: 'Industrial',
    property_sub_type: payload.asset.sub_type || categoryLabel,
    source: 'website',
    notes,
  });

  const res = await requestJson<any>('/customers', {
    method: 'POST',
    body,
  });

  if (res.success || res.status === 201 || res.status === 200) {
    return {
      success: true,
      status: res.status || 201,
      message:
        'Thank you. Your auction asset enquiry has been submitted successfully. Our industrial auction desk will contact you shortly.',
    };
  }

  return {
    success: false,
    status: res.status,
    message: res.message || 'Unable to submit enquiry right now. Please try again.',
    errors: res.errors,
  };
}

// ----------------------------------------------------------------------
// 11. BANKS & INSTITUTIONS API
// GET /banks
// ----------------------------------------------------------------------

export interface BankItem {
  id: number | string;
  name: string;
  short_name?: string | null;
  logo: string | null;
  website_url?: string | null;
  status: boolean;
  sort_order?: number;
}

export async function getBanks(): Promise<{
  success: boolean;
  banks: BankItem[];
  message?: string;
}> {
  try {
    const res = await requestJson<any>('/banks');
    const rawList = Array.isArray(res.data) ? res.data : (Array.isArray(res.raw?.data) ? res.raw.data : []);

    const sanitizedBanks: BankItem[] = rawList
      .filter((b: any) => Boolean(b && (b.status === true || b.status === 1 || b.status === '1' || b.status === 'true')))
      .map((b: any) => ({
        id: b.id,
        name: String(b.name || '').trim(),
        short_name: b.short_name ? String(b.short_name).trim() : null,
        logo: b.logo && typeof b.logo === 'string' && b.logo.trim() ? b.logo.trim() : null,
        website_url: b.website_url && typeof b.website_url === 'string' && b.website_url.trim() ? b.website_url.trim() : null,
        status: true,
        sort_order: typeof b.sort_order === 'number' ? b.sort_order : (parseInt(b.sort_order, 10) || 0),
      }))
      // Sort according to sort_order ascending
      .sort((a: BankItem, b: BankItem) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    return {
      success: true,
      banks: sanitizedBanks,
      message: res.message,
    };
  } catch (err: unknown) {
    return {
      success: false,
      banks: [],
      message: err instanceof Error ? err.message : 'Failed to fetch banks',
    };
  }
}

// ----------------------------------------------------------------------
// 12. NOTICES API
// GET /notices
// ----------------------------------------------------------------------

export interface NoticeItem {
  id: number | string;
  title: string;
  image: string;
  status: boolean;
  sort_order?: number;
}

export async function getNotices(): Promise<{
  success: boolean;
  notices: NoticeItem[];
  message?: string;
}> {
  try {
    const res = await requestJson<any>('/notices');
    const rawList = Array.isArray(res.data) ? res.data : (Array.isArray(res.raw?.data) ? res.raw.data : []);

    const sanitizedNotices: NoticeItem[] = rawList
      .filter((n: any) => {
        const isActive = Boolean(n && (n.status === true || n.status === 1 || n.status === '1' || n.status === 'true'));
        const hasImage = Boolean(n && n.image && typeof n.image === 'string' && n.image.trim());
        return isActive && hasImage;
      })
      .map((n: any) => ({
        id: n.id,
        title: String(n.title || 'Important Auction Notice').trim(),
        image: String(n.image).trim(),
        status: true,
        sort_order: typeof n.sort_order === 'number' ? n.sort_order : (parseInt(n.sort_order, 10) || 0),
      }))
      // Sort according to sort_order ascending (lowest first)
      .sort((a: NoticeItem, b: NoticeItem) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    return {
      success: true,
      notices: sanitizedNotices,
      message: res.message,
    };
  } catch (err: unknown) {
    return {
      success: false,
      notices: [],
      message: err instanceof Error ? err.message : 'Failed to fetch notices',
    };
  }
}

// ----------------------------------------------------------------------
// 13. TEAM MEMBERS API
// GET /team-members
// ----------------------------------------------------------------------

export type TeamMemberItem = TeamMember;

export async function getTeamMembers(): Promise<{
  success: boolean;
  teamMembers: TeamMember[];
  message?: string;
}> {
  try {
    const res = await requestJson<any>('/team-members');
    const rawList = Array.isArray(res.data) ? res.data : (Array.isArray(res.raw?.data) ? res.raw.data : []);

    const sanitizedMembers: TeamMember[] = rawList
      .filter((m: any) => Boolean(m && m.name))
      .map((m: any) => {
        let profileImg = String(m.profile_image || '').trim();
        if (profileImg && !profileImg.startsWith('http://') && !profileImg.startsWith('https://')) {
          const cleanPath = profileImg.replace(/^\/+/, '');
          if (cleanPath.startsWith('storage/')) {
            profileImg = `${BACKEND_URL}/${cleanPath}`;
          } else {
            profileImg = `${BACKEND_URL}/storage/${cleanPath}`;
          }
        }
        return {
          id: m.id,
          name: String(m.name || '').trim(),
          designation: String(m.designation || '').trim(),
          experience: String(m.experience || '').trim(),
          profile_image: profileImg,
          about: String(m.about || '').trim(),
          sort_order: typeof m.sort_order === 'number' ? m.sort_order : (parseInt(m.sort_order, 10) || 0),
        };
      })
      // Sort strictly according to sort_order ascending
      .sort((a: TeamMember, b: TeamMember) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    return {
      success: true,
      teamMembers: sanitizedMembers,
      message: res.message,
    };
  } catch (err: unknown) {
    return {
      success: false,
      teamMembers: [],
      message: err instanceof Error ? err.message : 'Failed to fetch team members',
    };
  }
}

// ----------------------------------------------------------------------
// AUCTION ASSETS (Scrap & Plant Machinery Auctions)
// Endpoints:
// GET /auction-assets
// GET /auction-assets/{id}
// POST /auction-assets
// PUT /auction-assets/{id} (or POST with _method=PUT for multipart)
// PATCH /auction-assets/{id}
// DELETE /auction-assets/{id}
// ----------------------------------------------------------------------

export function normalizeAuctionAsset(raw: any): AuctionAsset {
  if (!raw || typeof raw !== 'object') {
    return {
      id: 0,
      reference_no: '',
      title: '',
      status: 'Active',
      category: 'Scrap',
      state: '',
      city: '',
      detail_address: '',
      reserve_price: 0,
      emd_amount: 0,
    };
  }

  // Resolve image URL
  let imageUrl: string | null = null;
  const rawImg = raw.image_path || raw.image_url || raw.image;
  if (rawImg && typeof rawImg === 'string' && rawImg.trim()) {
    const trimmed = rawImg.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      imageUrl = trimmed;
    } else {
      const clean = trimmed.replace(/^\/+/, '');
      if (clean.startsWith('storage/')) {
        imageUrl = `${BACKEND_URL}/${clean}`;
      } else {
        imageUrl = `${BACKEND_URL}/storage/${clean}`;
      }
    }
  }

  // Resolve notice URL
  let noticeUrl: string | null = null;
  const rawNotice = raw.notice_path || raw.notice_url || raw.notice_pdf || raw.notice;
  if (rawNotice && typeof rawNotice === 'string' && rawNotice.trim()) {
    const trimmed = rawNotice.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      noticeUrl = trimmed;
    } else {
      const clean = trimmed.replace(/^\/+/, '');
      if (clean.startsWith('storage/')) {
        noticeUrl = `${BACKEND_URL}/${clean}`;
      } else {
        noticeUrl = `${BACKEND_URL}/storage/${clean}`;
      }
    }
  }

  const completeAddress = raw.complete_address ? String(raw.complete_address).trim() : String(raw.detail_address || '').trim();
  const auctionDate = raw.auction_date ? String(raw.auction_date) : (raw.auction_at ? String(raw.auction_at) : null);
  const emdDate = raw.emd_submission_date ? String(raw.emd_submission_date) : (raw.emd_submission_at ? String(raw.emd_submission_at) : null);

  return {
    id: typeof raw.id === 'number' ? raw.id : parseInt(String(raw.id), 10) || 0,
    reference_no: String(raw.reference_no || '').trim(),
    title: String(raw.title || '').trim(),
    status: String(raw.status || 'Active').trim(),
    category: String(raw.category || 'Scrap').trim(),
    sub_type: raw.sub_type ? String(raw.sub_type).trim() : null,
    listing_source: raw.listing_source ? stripBackendAdminUrls(String(raw.listing_source)) : null,
    state: String(raw.state || '').trim(),
    city: String(raw.city || '').trim(),
    detail_address: completeAddress,
    complete_address: completeAddress,
    possession_status: raw.possession_status ? String(raw.possession_status).trim() : null,
    condition: raw.condition ? String(raw.condition).trim() : null,
    sale_basis: raw.sale_basis ? String(raw.sale_basis).trim() : null,
    quantity: raw.quantity !== undefined && raw.quantity !== null ? raw.quantity : null,
    unit: raw.unit ? String(raw.unit).trim() : null,
    reserve_price_basis: raw.reserve_price_basis ? String(raw.reserve_price_basis).trim() : null,
    reserve_price: raw.reserve_price !== undefined && raw.reserve_price !== null ? raw.reserve_price : 0,
    emd_amount: raw.emd_amount !== undefined && raw.emd_amount !== null ? raw.emd_amount : 0,
    emd_submission_at: emdDate,
    emd_submission_date: emdDate,
    auction_at: auctionDate,
    auction_date: auctionDate,
    auction_platform: raw.auction_platform ? stripBackendAdminUrls(String(raw.auction_platform)) : null,
    seller_type: raw.seller_type ? String(raw.seller_type).trim() : null,
    bank_name: raw.bank_name ? String(raw.bank_name).trim() : null,
    seller_name: raw.seller_name ? sanitizeEntitySellerName(String(raw.seller_name)) : null,
    inspection_details: raw.inspection_details ? stripBankerContactDetails(String(raw.inspection_details)) : null,
    coordinator_name: null,
    coordinator_phone: null,
    coordinator_email: null,
    plant_address: raw.plant_address ? String(raw.plant_address).trim() : null,
    internal_notes: null,
    created_at: raw.created_at ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at ? String(raw.updated_at) : undefined,
    image_path: raw.image_path || null,
    image_url: imageUrl,
    asset_image: imageUrl,
    notice_path: raw.notice_path || null,
    notice_url: noticeUrl,
    auction_notice_pdf: noticeUrl,
  };
}

export const DEFAULT_AUCTION_ASSET_PAGINATION: AuctionAssetPagination = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: 0,
  to: 0,
};

let cachedBackendAuctionAssets: { items: AuctionAsset[]; timestamp: number } | null = null;
let cachedAuctionAssetMetadata: { meta: AuctionAssetFilterMetadata; timestamp: number } | null = null;
let inflightAuctionAssetsPromise: Promise<AuctionAsset[]> | null = null;
const AUCTION_ASSET_CACHE_TTL_MS = 30_000;

export function invalidateAuctionAssetsCache(): void {
  cachedBackendAuctionAssets = null;
  cachedAuctionAssetMetadata = null;
}

async function fetchAllBackendAuctionAssets(forceRefresh = false): Promise<AuctionAsset[]> {
  if (
    !forceRefresh &&
    cachedBackendAuctionAssets &&
    Date.now() - cachedBackendAuctionAssets.timestamp < AUCTION_ASSET_CACHE_TTL_MS
  ) {
    return cachedBackendAuctionAssets.items;
  }

  if (!forceRefresh && inflightAuctionAssetsPromise) {
    return inflightAuctionAssetsPromise;
  }

  inflightAuctionAssetsPromise = (async () => {
    try {
      const res = await requestJson<any>('/auction-assets?per_page=100&page=1');
      if (!res.success) {
        throw new Error(res.message || 'Failed to fetch auction assets from backend');
      }

      const allRaw: any[] = [];
      let lastPage = 1;

      const payload = res.raw?.data ?? res.data;
      if (payload && Array.isArray(payload.data)) {
        allRaw.push(...payload.data);
        lastPage = Number(payload.last_page) || 1;
      } else if (Array.isArray(payload)) {
        allRaw.push(...payload);
      } else if (Array.isArray(res.data)) {
        allRaw.push(...res.data);
      }

      const maxPagesToFetch = Math.min(lastPage, 5);
      for (let p = 2; p <= maxPagesToFetch; p++) {
        const nextRes = await requestJson<any>(`/auction-assets?per_page=100&page=${p}`);
        const nextPayload = nextRes.raw?.data ?? nextRes.data;
        if (nextPayload && Array.isArray(nextPayload.data)) {
          allRaw.push(...nextPayload.data);
        } else if (Array.isArray(nextPayload)) {
          allRaw.push(...nextPayload);
        }
      }

      const seenIds = new Set<number | string>();
      const normalized: AuctionAsset[] = [];
      for (const rawItem of allRaw) {
        const item = normalizeAuctionAsset(rawItem);
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          normalized.push(item);
        }
      }

      cachedBackendAuctionAssets = {
        items: normalized,
        timestamp: Date.now(),
      };

      return normalized;
    } finally {
      inflightAuctionAssetsPromise = null;
    }
  })();

  return inflightAuctionAssetsPromise;
}

export async function getAuctionAssets(
  params?: AuctionAssetFilterParams
): Promise<{
  success: boolean;
  assets: AuctionAsset[];
  data: AuctionAsset[];
  pagination: AuctionAssetPagination;
  message?: string;
}> {
  try {
    const apiAssets = await fetchAllBackendAuctionAssets();

    // Filter strictly over real backend records (zero mock fallback)
    let filtered = [...apiAssets];
    if (params) {
      if (params.category && params.category !== 'all' && params.category !== 'All') {
        const catLower = params.category.toLowerCase();
        filtered = filtered.filter((a) => {
          const itemCat = (a.category || '').toLowerCase();
          if (catLower.includes('scrap')) return itemCat.includes('scrap');
          if (catLower.includes('plant') || catLower.includes('machinery')) {
            return itemCat.includes('plant') || itemCat.includes('machinery');
          }
          return itemCat === catLower;
        });
      }

      if (params.sub_type && params.sub_type !== 'all' && params.sub_type !== 'All') {
        const stLower = params.sub_type.toLowerCase();
        filtered = filtered.filter((a) => (a.sub_type || '').trim().toLowerCase() === stLower);
      }

      if (params.state && params.state !== 'all' && params.state !== 'All') {
        const stateLower = params.state.toLowerCase();
        filtered = filtered.filter((a) => (a.state || '').trim().toLowerCase() === stateLower);
      }

      if (params.city && params.city !== 'all' && params.city !== 'All') {
        const cityLower = params.city.toLowerCase();
        filtered = filtered.filter((a) => (a.city || '').trim().toLowerCase() === cityLower);
      }

      if (params.bank_name && params.bank_name !== 'all' && params.bank_name !== 'All') {
        const bankLower = params.bank_name.toLowerCase();
        filtered = filtered.filter((a) => (a.bank_name || '').trim().toLowerCase() === bankLower);
      }

      if (params.status && params.status !== 'all' && params.status !== 'All') {
        const stLower = params.status.toLowerCase();
        filtered = filtered.filter((a) => (a.status || '').trim().toLowerCase() === stLower);
      }

      if (params.min_price && params.min_price > 0) {
        filtered = filtered.filter((a) => Number(a.reserve_price) >= Number(params.min_price));
      }

      if (params.max_price && params.max_price > 0) {
        filtered = filtered.filter((a) => Number(a.reserve_price) <= Number(params.max_price));
      }

      if (params.search && params.search.trim()) {
        const s = params.search.toLowerCase().trim();
        filtered = filtered.filter((a) =>
          (a.title || '').toLowerCase().includes(s) ||
          (a.reference_no || '').toLowerCase().includes(s) ||
          (a.sub_type || '').toLowerCase().includes(s) ||
          (a.city || '').toLowerCase().includes(s) ||
          (a.state || '').toLowerCase().includes(s) ||
          (a.bank_name || '').toLowerCase().includes(s) ||
          (a.complete_address || '').toLowerCase().includes(s)
        );
      }

      if (params.reference_no && params.reference_no.trim()) {
        const ref = params.reference_no.toLowerCase().trim();
        filtered = filtered.filter((a) => (a.reference_no || '').toLowerCase().includes(ref));
      }

      if (params.auction_date) {
        filtered = filtered.filter((a) => a.auction_date && a.auction_date >= params.auction_date!);
      }

      // Sort
      if (params.sort_by === 'reserve_price') {
        filtered.sort((a, b) => {
          const diff = Number(a.reserve_price || 0) - Number(b.reserve_price || 0);
          return params.sort_order === 'desc' ? -diff : diff;
        });
      } else if (params.sort_by === 'auction_date') {
        filtered.sort((a, b) => {
          const da = a.auction_date ? new Date(a.auction_date).getTime() : 0;
          const db = b.auction_date ? new Date(b.auction_date).getTime() : 0;
          return params.sort_order === 'desc' ? db - da : da - db;
        });
      } else if (params.sort_by === 'created_at') {
        filtered.sort((a, b) => {
          const da = a.created_at ? new Date(a.created_at).getTime() : Number(a.id);
          const db = b.created_at ? new Date(b.created_at).getTime() : Number(b.id);
          return params.sort_order === 'asc' ? da - db : db - da;
        });
      }
    }

    const perPage = params?.per_page || 12;
    const page = params?.page || 1;
    const total = filtered.length;
    const startIndex = (page - 1) * perPage;
    const paginatedItems = filtered.slice(startIndex, startIndex + perPage);

    const resultPagination: AuctionAssetPagination = {
      current_page: page,
      last_page: Math.max(1, Math.ceil(total / perPage)),
      per_page: perPage,
      total,
      from: total > 0 ? startIndex + 1 : null,
      to: total > 0 ? Math.min(startIndex + perPage, total) : null,
    };

    return {
      success: true,
      assets: paginatedItems,
      data: paginatedItems,
      pagination: resultPagination,
    };
  } catch (err: unknown) {
    return {
      success: false,
      assets: [],
      data: [],
      pagination: DEFAULT_AUCTION_ASSET_PAGINATION,
      message: err instanceof Error ? err.message : 'Failed to fetch auction assets',
    };
  }
}

export async function getAuctionAssetFilterMetadata(
  forceRefresh = false
): Promise<AuctionAssetFilterMetadata> {
  if (
    !forceRefresh &&
    cachedAuctionAssetMetadata &&
    Date.now() - cachedAuctionAssetMetadata.timestamp < AUCTION_ASSET_CACHE_TTL_MS
  ) {
    return cachedAuctionAssetMetadata.meta;
  }

  try {
    const items = await fetchAllBackendAuctionAssets(forceRefresh);

    const scrapSubSet = new Set<string>();
    const machinerySubSet = new Set<string>();
    const allSubSet = new Set<string>();
    const stateSet = new Set<string>();
    const citiesByStateMap: Record<string, Set<string>> = {};
    const allCitiesSet = new Set<string>();
    const bankSet = new Set<string>();
    const statusSet = new Set<string>();

    let scrapCount = 0;
    let machineryCount = 0;

    for (const item of items) {
      const cat = (item.category || '').toLowerCase();
      const isScrap = cat.includes('scrap');
      const isMachinery = cat.includes('plant') || cat.includes('machinery');

      if (isScrap) scrapCount++;
      else if (isMachinery) machineryCount++;

      const sub = (item.sub_type || '').trim();
      if (sub) {
        allSubSet.add(sub);
        if (isScrap) scrapSubSet.add(sub);
        if (isMachinery) machinerySubSet.add(sub);
      }

      const st = (item.state || '').trim();
      const ct = (item.city || '').trim();
      if (st) {
        stateSet.add(st);
        if (!citiesByStateMap[st]) {
          citiesByStateMap[st] = new Set<string>();
        }
        if (ct) {
          citiesByStateMap[st].add(ct);
        }
      }
      if (ct) {
        allCitiesSet.add(ct);
      }

      const bank = (item.bank_name || '').trim();
      if (bank) {
        bankSet.add(bank);
      }

      const status = (item.status || '').trim().toLowerCase();
      if (status) {
        statusSet.add(status);
      }
    }

    const citiesByState: Record<string, string[]> = {};
    for (const [stKey, citySet] of Object.entries(citiesByStateMap)) {
      citiesByState[stKey] = Array.from(citySet).sort((a, b) => a.localeCompare(b));
    }

    const meta: AuctionAssetFilterMetadata = {
      scrapSubTypes: Array.from(scrapSubSet).sort((a, b) => a.localeCompare(b)),
      machinerySubTypes: Array.from(machinerySubSet).sort((a, b) => a.localeCompare(b)),
      allSubTypes: Array.from(allSubSet).sort((a, b) => a.localeCompare(b)),
      states: Array.from(stateSet).sort((a, b) => a.localeCompare(b)),
      citiesByState,
      allCities: Array.from(allCitiesSet).sort((a, b) => a.localeCompare(b)),
      banks: Array.from(bankSet).sort((a, b) => a.localeCompare(b)),
      statuses: Array.from(statusSet),
      scrapCount,
      machineryCount,
      totalCount: items.length,
    };

    cachedAuctionAssetMetadata = {
      meta,
      timestamp: Date.now(),
    };

    return meta;
  } catch {
    return {
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
  }
}

export async function getAuctionAssetById(
  id: number | string
): Promise<{
  success: boolean;
  asset: AuctionAsset | null;
  message?: string;
}> {
  try {
    const res = await requestJson<any>(`/auction-assets/${id}`);
    const raw = res.raw?.data || res.data;
    if (res.success && raw && typeof raw === 'object' && ('id' in raw || 'title' in raw)) {
      return {
        success: true,
        asset: normalizeAuctionAsset(raw),
        message: res.message,
      };
    }

    return {
      success: false,
      asset: null,
      message: res.message || 'Auction asset not found',
    };
  } catch (err: unknown) {
    return {
      success: false,
      asset: null,
      message: err instanceof Error ? err.message : 'Failed to load auction asset',
    };
  }
}

export async function createAuctionAsset(
  data: FormData | Record<string, any>
): Promise<{
  success: boolean;
  asset?: AuctionAsset;
  message?: string;
  errors?: Record<string, string[]>;
}> {
  const url = `${API_BASE_URL}/auction-assets`;
  try {
    let headers: Record<string, string> = {
      Accept: 'application/json',
    };
    let body: any;

    if (data instanceof FormData) {
      body = data;
      // Do not set Content-Type header so browser automatically sets multipart boundary!
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(data);
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });

    const isJson = (res.headers.get('content-type') || '').includes('application/json');
    const json = isJson ? await res.json() : null;

    if (res.ok) {
      invalidateAuctionAssetsCache();
      const assetData = json?.data || json?.asset || json;
      return {
        success: true,
        asset: assetData ? normalizeAuctionAsset(assetData) : undefined,
        message: json?.message || 'Auction asset created successfully',
      };
    }

    if (res.status === 422) {
      return {
        success: false,
        message: json?.message || 'Validation error while creating auction asset',
        errors: json?.errors || {},
      };
    }

    return {
      success: false,
      message: json?.message || `HTTP ${res.status} Error while saving auction asset`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error while creating auction asset',
    };
  }
}

export async function updateAuctionAsset(
  id: number | string,
  data: FormData | Record<string, any>
): Promise<{
  success: boolean;
  asset?: AuctionAsset;
  message?: string;
  errors?: Record<string, string[]>;
}> {
  try {
    let url = `${API_BASE_URL}/auction-assets/${id}`;
    let method = 'PUT';
    let headers: Record<string, string> = {
      Accept: 'application/json',
    };
    let body: any;

    if (data instanceof FormData) {
      if (!data.has('_method')) {
        data.append('_method', 'PUT');
      }
      method = 'POST';
      body = data;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(data);
    }

    const res = await fetch(url, {
      method,
      headers,
      body,
    });

    const isJson = (res.headers.get('content-type') || '').includes('application/json');
    const json = isJson ? await res.json() : null;

    if (res.ok) {
      invalidateAuctionAssetsCache();
      const assetData = json?.data || json?.asset || json;
      return {
        success: true,
        asset: assetData ? normalizeAuctionAsset(assetData) : undefined,
        message: json?.message || 'Auction asset updated successfully',
      };
    }

    if (res.status === 422) {
      return {
        success: false,
        message: json?.message || 'Validation error while updating auction asset',
        errors: json?.errors || {},
      };
    }

    return {
      success: false,
      message: json?.message || `HTTP ${res.status} Error while updating auction asset`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error while updating auction asset',
    };
  }
}

export async function deleteAuctionAsset(
  id: number | string
): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const url = `${API_BASE_URL}/auction-assets/${id}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    });

    const isJson = (res.headers.get('content-type') || '').includes('application/json');
    const json = isJson ? await res.json() : null;

    if (res.ok) {
      invalidateAuctionAssetsCache();
      return {
        success: true,
        message: json?.message || 'Auction asset deleted successfully',
      };
    }

    return {
      success: false,
      message: json?.message || `Failed to delete auction asset (HTTP ${res.status})`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error while deleting auction asset',
    };
  }
}

export async function changeAuctionAssetStatus(
  id: number | string,
  status: string
): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const url = `${API_BASE_URL}/auction-assets/${id}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    const isJson = (res.headers.get('content-type') || '').includes('application/json');
    const json = isJson ? await res.json() : null;

    if (res.ok) {
      invalidateAuctionAssetsCache();
      return {
        success: true,
        message: json?.message || `Status updated to ${status}`,
      };
    }

    // Fallback if PATCH is unsupported by some servers: try PUT
    const putRes = await fetch(url, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (putRes.ok) {
      invalidateAuctionAssetsCache();
      const putJson = (putRes.headers.get('content-type') || '').includes('application/json')
        ? await putRes.json()
        : null;
      return {
        success: true,
        message: putJson?.message || `Status updated to ${status}`,
      };
    }

    return {
      success: false,
      message: json?.message || 'Failed to update status',
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error updating status',
    };
  }
}

export async function getAuctionAssetStats(): Promise<AuctionAssetStats> {
  const defaultStats: AuctionAssetStats = {
    total_scrap: 0,
    total_plant_machinery: 0,
    active: 0,
    upcoming: 0,
    closed: 0,
    total: 0,
    totalScrap: 0,
    totalPlantMachinery: 0,
    activeAuctions: 0,
    upcomingAuctions: 0,
    closedAuctions: 0,
  };

  try {
    const res = await getAuctionAssets({ per_page: 500 });
    if (!res.success) {
      return defaultStats;
    }

    const items = res.assets;
    let scrapCount = 0;
    let pmCount = 0;
    let activeCount = 0;
    let upcomingCount = 0;
    let closedCount = 0;

    items.forEach((item) => {
      const cat = (item.category || '').toLowerCase();
      if (cat.includes('scrap')) {
        scrapCount++;
      } else if (cat.includes('plant') || cat.includes('machinery')) {
        pmCount++;
      }

      const st = (item.status || '').toLowerCase();
      if (st === 'active' || st === 'live') {
        activeCount++;
      } else if (st === 'upcoming') {
        upcomingCount++;
      } else if (st === 'closed' || st === 'sold' || st === 'completed') {
        closedCount++;
      }
    });

    const total = res.pagination.total || items.length;

    return {
      total_scrap: scrapCount,
      total_plant_machinery: pmCount,
      active: activeCount,
      upcoming: upcomingCount,
      closed: closedCount,
      total,
      totalScrap: scrapCount,
      totalPlantMachinery: pmCount,
      activeAuctions: activeCount,
      upcomingAuctions: upcomingCount,
      closedAuctions: closedCount,
    };
  } catch {
    return defaultStats;
  }
}

// ----------------------------------------------------------------------
// AUTHORITY PROPERTIES MODULE API
// Endpoints:
// GET /authority-properties
// GET /authority-properties/{id}
// GET /authority-properties/authority/{authorityId}
// ----------------------------------------------------------------------

export const DEFAULT_AUTHORITY_PAGINATION: AuthorityPropertyPagination = {
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 0,
  from: null,
  to: null,
};

export function resolveAuthorityMediaUrl(rawUrlOrPath?: string | null): string {
  if (!rawUrlOrPath || typeof rawUrlOrPath !== 'string') return '';
  const trimmed = rawUrlOrPath.trim();
  if (!trimmed) return '';
  if (/\/admin(?:\/|$)/i.test(trimmed)) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const clean = trimmed.replace(/^\/+/, '');
  if (clean.startsWith('storage/')) {
    return `${BACKEND_URL.replace(/\/+$/, '')}/${clean}`;
  }
  return `${BACKEND_URL.replace(/\/+$/, '')}/storage/${clean}`;
}

export function stripHtmlToText(rawHtml?: string | null): string {
  if (!rawHtml || typeof rawHtml !== 'string') return '';
  return rawHtml
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function normalizeAuthorityInfo(raw: any): AuthorityInfo | null {
  if (!raw || typeof raw !== 'object' || !raw.id) return null;

  const stateStr =
    typeof raw.state === 'object' && raw.state !== null
      ? (raw.state.name || raw.state.title || null)
      : (raw.state ? String(raw.state).trim() : null);

  const cityStr =
    typeof raw.city === 'object' && raw.city !== null
      ? (raw.city.name || raw.city.title || null)
      : (raw.city ? String(raw.city).trim() : null);

  return {
    id: Number(raw.id),
    name: stripBackendAdminUrls(String(raw.name || '')) || String(raw.name || '').trim(),
    short_name: raw.short_name ? stripBackendAdminUrls(String(raw.short_name)) : null,
    state: stateStr || null,
    city: cityStr || null,
    website: sanitizePublicWebsiteUrl(raw.website ? String(raw.website) : null),
    description:
      raw.description && String(raw.description).trim()
        ? stripBankerContactDetails(stripHtmlToText(String(raw.description)))
        : null,
    logo: raw.logo ? resolveAuthorityMediaUrl(String(raw.logo)) : null,
    is_active:
      raw.is_active === undefined || raw.is_active === null
        ? true
        : Boolean(raw.is_active === true || Number(raw.is_active) === 1),
  };
}

export function isRecordPublished(raw: any): boolean {
  if (!raw || typeof raw !== 'object') return false;
  if (raw.deleted_at) return false;
  if (raw.is_published === undefined || raw.is_published === null) return true;
  if (typeof raw.is_published === 'boolean') return raw.is_published;
  if (typeof raw.is_published === 'number') return raw.is_published === 1;
  const s = String(raw.is_published).toLowerCase().trim();
  return s === '1' || s === 'true' || s === 'yes' || s === 'published';
}

export function normalizeAuthorityProperty(raw: any): AuthorityProperty {
  const id = Number(raw?.id || 0);
  const authority = normalizeAuthorityInfo(raw?.authority);
  const authorityId =
    raw?.authority_id !== undefined && raw?.authority_id !== null
      ? Number(raw.authority_id)
      : authority?.id ?? null;

  const stateObj =
    raw?.state && typeof raw.state === 'object' && raw.state.id
      ? {
          id: Number(raw.state.id),
          name: String(raw.state.name || '').trim(),
          code: raw.state.code ? String(raw.state.code).trim() : undefined,
        }
      : null;

  const cityObj =
    raw?.city && typeof raw.city === 'object' && raw.city.id
      ? {
          id: Number(raw.city.id),
          state_id:
            raw.city.state_id !== undefined && raw.city.state_id !== null
              ? Number(raw.city.state_id)
              : undefined,
          name: String(raw.city.name || '').trim(),
        }
      : null;

  const stateName =
    (raw?.state_name && String(raw.state_name).trim()) ||
    stateObj?.name ||
    (typeof raw?.state === 'string' && raw.state.trim() ? raw.state.trim() : null);

  const cityName =
    (raw?.city_name && String(raw.city_name).trim()) ||
    cityObj?.name ||
    (typeof raw?.city === 'string' && raw.city.trim() ? raw.city.trim() : null);

  const stateId =
    raw?.state_id !== undefined && raw?.state_id !== null && String(raw.state_id).trim() !== ''
      ? Number(raw.state_id)
      : stateObj?.id ?? null;

  const cityId =
    raw?.city_id !== undefined && raw?.city_id !== null && String(raw.city_id).trim() !== ''
      ? Number(raw.city_id)
      : cityObj?.id ?? null;

  // Parse numeric values strictly: preserve null when backend value is null/empty
  const parseOptionalNumber = (val: any): number | null => {
    if (val === undefined || val === null || String(val).trim() === '') return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  };

  const parseOptionalString = (val: any): string | null => {
    if (val === undefined || val === null) return null;
    const s = String(val).trim();
    return s.length > 0 ? s : null;
  };

  // Images array from API
  const rawImages = Array.isArray(raw?.images) ? raw.images : [];
  const images: AuthorityPropertyImage[] = rawImages
    .map((img: any, idx: number) => {
      const resolved = resolveAuthorityMediaUrl(img?.image_url || img?.image_path);
      return {
        id: Number(img?.id || idx + 1),
        image_path: parseOptionalString(img?.image_path),
        image_url: resolved,
        alt_text: parseOptionalString(img?.alt_text),
        sort_order: typeof img?.sort_order === 'number' ? img.sort_order : Number(img?.sort_order || idx),
        is_primary: Boolean(img?.is_primary === true || Number(img?.is_primary) === 1),
      };
    })
    .filter((img: AuthorityPropertyImage) => Boolean(img.image_url))
    .sort((a: AuthorityPropertyImage, b: AuthorityPropertyImage) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return a.sort_order - b.sort_order;
    });

  // Primary image from API (use primary_image directly, or primary from images array)
  const rawPrimary = resolveAuthorityMediaUrl(raw?.primary_image);
  const primaryImage = rawPrimary || (images.length > 0 ? images[0].image_url : null);

  // If primary_image exists in backend but wasn't in images[], include it so detail gallery shows it
  if (primaryImage && images.length === 0) {
    images.push({
      id: 1,
      image_url: primaryImage,
      alt_text: parseOptionalString(raw?.title),
      sort_order: 0,
      is_primary: true,
    });
  }

  // Public documents ONLY (Security rule: never expose private documents)
  const rawDocs = Array.isArray(raw?.documents) ? raw.documents : [];
  const documents: AuthorityPropertyDocument[] = rawDocs
    .filter((doc: any) => {
      if (!doc || typeof doc !== 'object') return false;
      if (doc.visibility && String(doc.visibility).toLowerCase().trim() !== 'public') {
        return false;
      }
      const fileUrl = resolveAuthorityMediaUrl(doc.file_url || doc.file_path);
      return Boolean(fileUrl);
    })
    .map((doc: any, idx: number) => ({
      id: Number(doc.id || idx + 1),
      title: parseOptionalString(doc.title || doc.document_name) || `Document ${idx + 1}`,
      document_type: parseOptionalString(doc.document_type),
      file_path: parseOptionalString(doc.file_path),
      file_url: resolveAuthorityMediaUrl(doc.file_url || doc.file_path),
      visibility: parseOptionalString(doc.visibility) || 'public',
    }));

  // Amenities from API
  const rawAmenities = Array.isArray(raw?.amenities) ? raw.amenities : [];
  const amenities: AuthorityPropertyAmenity[] = rawAmenities
    .filter((am: any) => Boolean(am && am.name && String(am.name).trim()))
    .map((am: any, idx: number) => ({
      id: Number(am.id || idx + 1),
      authority_property_id: am.authority_property_id ? Number(am.authority_property_id) : undefined,
      name: String(am.name).trim(),
      category: parseOptionalString(am.category),
      distance_km:
        am.distance_km !== undefined && am.distance_km !== null && String(am.distance_km).trim() !== ''
          ? String(am.distance_km).trim()
          : null,
      description: parseOptionalString(am.description) ? stripHtmlToText(String(am.description)) : null,
      sort_order: typeof am.sort_order === 'number' ? am.sort_order : Number(am.sort_order || idx),
    }))
    .sort((a: AuthorityPropertyAmenity, b: AuthorityPropertyAmenity) => a.sort_order - b.sort_order);

  // Payment milestones from API
  const rawMilestones = Array.isArray(raw?.payment_milestones) ? raw.payment_milestones : [];
  const paymentMilestones: AuthorityPropertyMilestone[] = rawMilestones
    .filter((ms: any) => Boolean(ms && (ms.title || ms.amount !== null || ms.percentage !== null)))
    .map((ms: any, idx: number) => ({
      id: Number(ms.id || idx + 1),
      authority_property_id: ms.authority_property_id ? Number(ms.authority_property_id) : undefined,
      title: parseOptionalString(ms.title) || `Milestone ${idx + 1}`,
      amount: parseOptionalNumber(ms.amount),
      percentage: parseOptionalNumber(ms.percentage),
      due_days:
        ms.due_days !== undefined && ms.due_days !== null && String(ms.due_days).trim() !== ''
          ? Number(ms.due_days)
          : null,
      description: parseOptionalString(ms.description) ? stripHtmlToText(String(ms.description)) : null,
      sort_order: typeof ms.sort_order === 'number' ? ms.sort_order : Number(ms.sort_order || idx),
    }))
    .sort((a: AuthorityPropertyMilestone, b: AuthorityPropertyMilestone) => a.sort_order - b.sort_order);

  return {
    id,
    authority_id: authorityId,
    title: parseOptionalString(raw?.title) || '',
    property_code: parseOptionalString(raw?.property_code),
    property_type: stripBackendAdminUrls(parseOptionalString(raw?.property_type)),
    property_sub_type: stripBackendAdminUrls(parseOptionalString(raw?.property_sub_type)),
    listing_source: stripBackendAdminUrls(parseOptionalString(raw?.listing_source)),
    scheme_name: stripBackendAdminUrls(parseOptionalString(raw?.scheme_name)),
    state_id: stateId && !isNaN(stateId) ? stateId : null,
    city_id: cityId && !isNaN(cityId) ? cityId : null,
    state_name: stateName,
    city_name: cityName,
    address: stripBackendAdminUrls(parseOptionalString(raw?.address)),
    area: parseOptionalNumber(raw?.area),
    area_unit: parseOptionalString(raw?.area_unit),
    reserve_price_basis: parseOptionalString(raw?.reserve_price_basis),
    reserve_price: parseOptionalNumber(raw?.reserve_price),
    emd_amount: parseOptionalNumber(raw?.emd_amount),
    emd_submission_at: parseOptionalString(raw?.emd_submission_at),
    auction_start_at: parseOptionalString(raw?.auction_start_at),
    auction_end_at: parseOptionalString(raw?.auction_end_at),
    auction_platform: stripBackendAdminUrls(parseOptionalString(raw?.auction_platform)),
    seller_type: parseOptionalString(raw?.seller_type),
    seller_name: sanitizeEntitySellerName(parseOptionalString(raw?.seller_name)),
    inspection_details: parseOptionalString(raw?.inspection_details)
      ? stripBankerContactDetails(stripHtmlToText(String(raw.inspection_details)))
      : null,
    description: parseOptionalString(raw?.description)
      ? stripBankerContactDetails(stripHtmlToText(String(raw.description)))
      : null,
    status: parseOptionalString(raw?.status),
    is_published: isRecordPublished(raw),
    primary_image: primaryImage,
    authority,
    state: stateObj,
    city: cityObj,
    images,
    documents,
    amenities,
    payment_milestones: paymentMilestones,
    created_at: parseOptionalString(raw?.created_at),
    updated_at: parseOptionalString(raw?.updated_at),
  };
}

function buildAuthorityPropertiesQuery(params?: AuthorityPropertyFilterParams): string {
  if (!params) return '';
  const sp = new URLSearchParams();

  if (params.search && String(params.search).trim()) {
    sp.set('search', String(params.search).trim());
  }
  if (params.authority_id !== undefined && params.authority_id !== '' && params.authority_id !== 'all') {
    sp.set('authority_id', String(params.authority_id).trim());
  }
  if (params.property_type && params.property_type !== '' && params.property_type !== 'all') {
    sp.set('property_type', params.property_type.trim());
  }
  if (params.property_sub_type && params.property_sub_type !== '' && params.property_sub_type !== 'all') {
    sp.set('property_sub_type', params.property_sub_type.trim());
  }
  if (params.state_id !== undefined && params.state_id !== '' && params.state_id !== 'all') {
    sp.set('state_id', String(params.state_id).trim());
  }
  if (params.city_id !== undefined && params.city_id !== '' && params.city_id !== 'all') {
    sp.set('city_id', String(params.city_id).trim());
  }
  if (params.min_price !== undefined && String(params.min_price).trim() !== '') {
    const min = Number(params.min_price);
    if (!isNaN(min) && min >= 0) {
      sp.set('min_price', String(min));
    }
  }
  if (params.max_price !== undefined && String(params.max_price).trim() !== '') {
    const max = Number(params.max_price);
    if (!isNaN(max) && max > 0) {
      sp.set('max_price', String(max));
    }
  }
  if (params.status && params.status !== '' && params.status !== 'all') {
    sp.set('status', params.status.trim());
  }
  if (params.sort_by && params.sort_by.trim()) {
    sp.set('sort_by', params.sort_by.trim());
  }
  if (params.sort_order && (params.sort_order === 'asc' || params.sort_order === 'desc')) {
    sp.set('sort_order', params.sort_order);
  }
  if (params.per_page && params.per_page > 0) {
    sp.set('per_page', String(params.per_page));
  }
  if (params.page && params.page > 0) {
    sp.set('page', String(params.page));
  }

  return sp.toString();
}

function extractLaravelPagination(
  payload: any,
  fallbackPerPage: number = 12,
  fallbackPage: number = 1
): { items: any[]; pagination: AuthorityPropertyPagination } {
  if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
    return {
      items: payload.data,
      pagination: {
        current_page: Number(payload.current_page || fallbackPage),
        last_page: Math.max(1, Number(payload.last_page || 1)),
        per_page: Number(payload.per_page || fallbackPerPage),
        total: typeof payload.total === 'number' ? payload.total : payload.data.length,
        from: payload.from ?? (payload.data.length > 0 ? 1 : null),
        to: payload.to ?? (payload.data.length > 0 ? payload.data.length : null),
      },
    };
  }

  if (Array.isArray(payload)) {
    return {
      items: payload,
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: payload.length || fallbackPerPage,
        total: payload.length,
        from: payload.length > 0 ? 1 : null,
        to: payload.length > 0 ? payload.length : null,
      },
    };
  }

  return {
    items: [],
    pagination: { ...DEFAULT_AUTHORITY_PAGINATION, per_page: fallbackPerPage, current_page: fallbackPage },
  };
}

// Shared cache for unfiltered page-1 Authority Properties so Navbar & HomePage share 1 request
let cachedAuthorityBaseCatalog: {
  properties: AuthorityProperty[];
  total: number;
  timestamp: number;
} | null = null;
let inflightAuthorityBasePromise: Promise<{
  success: boolean;
  properties: AuthorityProperty[];
  pagination: AuthorityPropertyPagination;
  message?: string;
}> | null = null;

function isDefaultUnfilteredAuthorityQuery(params?: AuthorityPropertyFilterParams): boolean {
  if (!params) return true;
  const hasFilters = Boolean(
    (params.search && String(params.search).trim()) ||
      (params.authority_id !== undefined && params.authority_id !== '' && params.authority_id !== 'all') ||
      (params.property_type && params.property_type !== '' && params.property_type !== 'all') ||
      (params.property_sub_type && params.property_sub_type !== '' && params.property_sub_type !== 'all') ||
      (params.state_id !== undefined && params.state_id !== '' && params.state_id !== 'all') ||
      (params.city_id !== undefined && params.city_id !== '' && params.city_id !== 'all') ||
      (params.min_price !== undefined && String(params.min_price).trim() !== '') ||
      (params.max_price !== undefined && String(params.max_price).trim() !== '') ||
      (params.status && params.status !== '' && params.status !== 'all')
  );
  if (hasFilters) return false;
  const isDefaultSort =
    !params.sort_by || (params.sort_by === 'created_at' && (!params.sort_order || params.sort_order === 'desc'));
  const isFirstPage = !params.page || params.page === 1;
  return isDefaultSort && isFirstPage;
}

async function fetchBaseAuthorityCatalog(): Promise<{
  success: boolean;
  properties: AuthorityProperty[];
  pagination: AuthorityPropertyPagination;
  message?: string;
}> {
  if (
    cachedAuthorityBaseCatalog &&
    Date.now() - cachedAuthorityBaseCatalog.timestamp < 120_000
  ) {
    const items = cachedAuthorityBaseCatalog.properties;
    return {
      success: true,
      properties: items,
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: items.length || 100,
        total: cachedAuthorityBaseCatalog.total,
        from: items.length > 0 ? 1 : null,
        to: items.length > 0 ? items.length : null,
      },
    };
  }

  if (inflightAuthorityBasePromise) {
    return inflightAuthorityBasePromise;
  }

  inflightAuthorityBasePromise = (async () => {
    try {
      const res = await requestJson<any>('/authority-properties?per_page=100&page=1', { method: 'GET' });
      if (!res.success) {
        return {
          success: false,
          properties: [],
          pagination: { ...DEFAULT_AUTHORITY_PAGINATION, per_page: 100, current_page: 1 },
          message: res.message || 'Unable to load authority properties from server.',
        };
      }

      const payload = res.raw?.data ?? res.data;
      const { items, pagination } = extractLaravelPagination(payload, 100, 1);
      const publishedProperties = items.filter(isRecordPublished).map(normalizeAuthorityProperty);
      const total = pagination.total || publishedProperties.length;

      cachedAuthorityBaseCatalog = {
        properties: publishedProperties,
        total,
        timestamp: Date.now(),
      };

      return {
        success: true,
        properties: publishedProperties,
        pagination: { ...pagination, total },
        message: res.message,
      };
    } finally {
      inflightAuthorityBasePromise = null;
    }
  })();

  return inflightAuthorityBasePromise;
}

/**
 * GET /authority-properties
 * Fetches paginated published authority properties strictly from the Laravel backend.
 */
export async function getAuthorityProperties(
  params?: AuthorityPropertyFilterParams
): Promise<{
  success: boolean;
  properties: AuthorityProperty[];
  pagination: AuthorityPropertyPagination;
  message?: string;
}> {
  const requestedPerPage = params?.per_page || 12;

  // Reuse shared page-1 catalog when unfiltered (eliminates duplicate requests across Navbar, HomePage & Listing page)
  if (isDefaultUnfilteredAuthorityQuery(params) && requestedPerPage <= 100) {
    const baseRes = await fetchBaseAuthorityCatalog();
    if (baseRes.success && baseRes.properties.length >= Math.min(requestedPerPage, baseRes.pagination.total)) {
      const sliced = baseRes.properties.slice(0, requestedPerPage);
      const total = baseRes.pagination.total;
      return {
        success: true,
        properties: sliced,
        pagination: {
          current_page: 1,
          last_page: Math.max(1, Math.ceil(total / requestedPerPage)),
          per_page: requestedPerPage,
          total,
          from: sliced.length > 0 ? 1 : null,
          to: sliced.length > 0 ? sliced.length : null,
        },
        message: baseRes.message,
      };
    }
  }

  const query = buildAuthorityPropertiesQuery(params);
  const endpoint = `/authority-properties${query ? `?${query}` : ''}`;
  const res = await requestJson<any>(endpoint, { method: 'GET' });

  if (!res.success) {
    return {
      success: false,
      properties: [],
      pagination: {
        ...DEFAULT_AUTHORITY_PAGINATION,
        per_page: requestedPerPage,
        current_page: params?.page || 1,
      },
      message: res.message || 'Unable to load authority properties from server.',
    };
  }

  const payload = res.raw?.data ?? res.data;
  const { items, pagination } = extractLaravelPagination(
    payload,
    requestedPerPage,
    params?.page || 1
  );

  const publishedProperties = items
    .filter(isRecordPublished)
    .map(normalizeAuthorityProperty);

  return {
    success: true,
    properties: publishedProperties,
    pagination,
    message: res.message,
  };
}

/**
 * GET /authority-properties/{id}
 * Fetches complete details for a single published authority property from the Laravel backend.
 */
export async function getAuthorityPropertyById(
  id: number | string
): Promise<{
  success: boolean;
  property: AuthorityProperty | null;
  message?: string;
}> {
  const cleanId = encodeURIComponent(String(id).trim());
  const res = await requestJson<any>(`/authority-properties/${cleanId}`, { method: 'GET' });

  if (!res.success) {
    return {
      success: false,
      property: null,
      message: res.message || 'Unable to load authority property details.',
    };
  }

  const raw = res.raw?.data ?? res.data;
  if (!raw || typeof raw !== 'object' || !raw.id) {
    return {
      success: false,
      property: null,
      message: 'Property not found.',
    };
  }

  if (!isRecordPublished(raw)) {
    return {
      success: false,
      property: null,
      message: 'This property is not publicly available.',
    };
  }

  return {
    success: true,
    property: normalizeAuthorityProperty(raw),
    message: res.message,
  };
}

/**
 * GET /authority-properties/authority/{authorityId}
 * Fetches authority profile information and paginated properties belonging to that authority.
 */
export async function getAuthorityPropertiesByAuthority(
  authorityId: number | string,
  params?: AuthorityPropertyFilterParams
): Promise<{
  success: boolean;
  authority: AuthorityInfo | null;
  properties: AuthorityProperty[];
  pagination: AuthorityPropertyPagination;
  message?: string;
}> {
  const cleanAuthId = encodeURIComponent(String(authorityId).trim());
  const query = buildAuthorityPropertiesQuery(params);
  const endpoint = `/authority-properties/authority/${cleanAuthId}${query ? `?${query}` : ''}`;
  const res = await requestJson<any>(endpoint, { method: 'GET' });

  if (!res.success) {
    return {
      success: false,
      authority: null,
      properties: [],
      pagination: {
        ...DEFAULT_AUTHORITY_PAGINATION,
        per_page: params?.per_page || 12,
        current_page: params?.page || 1,
      },
      message: res.message || 'Unable to load properties for this authority.',
    };
  }

  const payload = res.raw?.data ?? res.data;
  const { items, pagination } = extractLaravelPagination(
    payload,
    params?.per_page || 12,
    params?.page || 1
  );

  const publishedProperties = items
    .filter(isRecordPublished)
    .map(normalizeAuthorityProperty);

  const authority =
    normalizeAuthorityInfo(res.raw?.authority) ||
    (publishedProperties.length > 0 ? publishedProperties[0].authority ?? null : null);

  return {
    success: true,
    authority,
    properties: publishedProperties,
    pagination,
    message: res.message,
  };
}

// In-memory cache for backend filter options so Navbar & Listing pages share a single fetch
let cachedAuthorityMetadata: AuthorityFilterMetadata | null = null;
let inflightMetadataPromise: Promise<AuthorityFilterMetadata> | null = null;

/**
 * Dynamically extracts ONLY the real authorities, property types, sub-types, states, cities,
 * and statuses present in the backend database so filter dropdowns never show dummy options.
 */
export async function getAuthorityFilterMetadata(forceRefresh = false): Promise<AuthorityFilterMetadata> {
  if (forceRefresh) {
    cachedAuthorityBaseCatalog = null;
    cachedAuthorityMetadata = null;
  }
  if (!forceRefresh && cachedAuthorityMetadata) {
    return cachedAuthorityMetadata;
  }
  if (!forceRefresh && inflightMetadataPromise) {
    return inflightMetadataPromise;
  }

  inflightMetadataPromise = (async () => {
    try {
      const res = await getAuthorityProperties({ per_page: 100, page: 1 });
      const authoritiesMap = new Map<number, AuthorityInfo>();
      const typesSet = new Set<string>();
      const subTypesSet = new Set<string>();
      const statesMap = new Map<number, string>();
      const citiesMap = new Map<number, { id: number; state_id?: number | null; name: string }>();
      const statusesSet = new Set<string>();

      for (const item of res.properties) {
        if (item.authority && item.authority.id && item.authority.name) {
          authoritiesMap.set(item.authority.id, item.authority);
        }
        if (item.property_type) {
          typesSet.add(item.property_type);
        }
        if (item.property_sub_type) {
          subTypesSet.add(item.property_sub_type);
        }
        if (item.state_id && item.state_name) {
          statesMap.set(item.state_id, item.state_name);
        } else if (item.state?.id && item.state?.name) {
          statesMap.set(item.state.id, item.state.name);
        }
        if (item.city_id && item.city_name) {
          citiesMap.set(item.city_id, {
            id: item.city_id,
            state_id: item.state_id ?? item.city?.state_id ?? null,
            name: item.city_name,
          });
        } else if (item.city?.id && item.city?.name) {
          citiesMap.set(item.city.id, {
            id: item.city.id,
            state_id: item.city.state_id ?? item.state_id ?? null,
            name: item.city.name,
          });
        }
        if (item.status) {
          statusesSet.add(item.status);
        }
      }

      const metadata: AuthorityFilterMetadata = {
        authorities: Array.from(authoritiesMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
        propertyTypes: Array.from(typesSet).sort((a, b) => a.localeCompare(b)),
        propertySubTypes: Array.from(subTypesSet).sort((a, b) => a.localeCompare(b)),
        states: Array.from(statesMap.entries())
          .map(([id, name]) => ({ id, name }))
          .sort((a, b) => a.name.localeCompare(b.name)),
        cities: Array.from(citiesMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
        statuses: Array.from(statusesSet).sort((a, b) => a.localeCompare(b)),
        totalCount: res.pagination.total || res.properties.length,
      };

      if (res.success) {
        cachedAuthorityMetadata = metadata;
      }
      return metadata;
    } catch {
      return {
        authorities: [],
        propertyTypes: [],
        propertySubTypes: [],
        states: [],
        cities: [],
        statuses: [],
        totalCount: 0,
      };
    } finally {
      inflightMetadataPromise = null;
    }
  })();

  return inflightMetadataPromise;
}




