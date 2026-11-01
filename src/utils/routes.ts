import { PageRoute } from '../components/Navbar';
import { Property } from '../types';
import { BlogPost } from '../data/blogData';

export interface RouteState {
  page: PageRoute;
  propertyId?: string;
  blogId?: string;
  auctionId?: string;
  authorityPropertyId?: string;
  authorityId?: string;
}

// Clean URL paths (strictly NO '#' symbols)
export const ROUTE_PATH_MAP: Record<PageRoute, string> = {
  home: '/',
  about: '/about',
  property: '/properties',
  'property-detail': '/property',
  'authority-properties': '/authority-properties',
  'authority-wise-properties': '/authority-properties/authority',
  'authority-property-detail': '/authority-properties',
  'scrap-auctions': '/scrap-auctions',
  'plant-machinery-auctions': '/plant-machinery-auctions',
  'auction-detail': '/auction-asset',
  'auction-management': '/auction-management',
  blogs: '/blogs',
  'blog-detail': '/blog',
  faq: '/faq',
  contact: '/contact',
  privacy: '/privacy',
  terms: '/terms',
};

/**
 * Parse current browser URL pathname into RouteState
 */
export function parsePathname(pathname: string): RouteState {
  // Strip any query string or hash if present
  const [pathWithoutQuery] = pathname.split('?');
  const pathWithoutHash = pathWithoutQuery.split('#')[0];

  // Clean trailing slashes except for root
  const cleanPath = pathWithoutHash.length > 1 ? pathWithoutHash.replace(/\/+$/, '') : pathWithoutHash;

  if (cleanPath === '' || cleanPath === '/' || cleanPath === '/home') {
    // If URL contains property filter query params (e.g. from WhatsApp links ?preferred_areas=...&min_price=...)
    const queryStr = pathname.includes('?') 
      ? pathname.slice(pathname.indexOf('?')) 
      : (typeof window !== 'undefined' ? window.location.search : '');
      
    if (queryStr) {
      const sp = new URLSearchParams(queryStr);
      if (
        sp.has('preferred_areas') ||
        sp.has('city') ||
        sp.has('property_type') ||
        sp.has('property_sub_type') ||
        sp.has('min_price') ||
        sp.has('max_price') ||
        sp.get('page') === 'property' ||
        sp.has('state')
      ) {
        return { page: 'property' };
      }
    }
    return { page: 'home' };
  }

  if (cleanPath === '/about' || cleanPath === '/about-us') {
    return { page: 'about' };
  }

  if (cleanPath === '/properties' || cleanPath === '/property' || cleanPath === '/auctions') {
    return { page: 'property' };
  }

  if (cleanPath.startsWith('/property/')) {
    const id = cleanPath.replace('/property/', '');
    return { page: 'property-detail', propertyId: id };
  }

  if (cleanPath === '/authority-properties') {
    return { page: 'authority-properties' };
  }

  if (cleanPath === '/authority-properties/authority') {
    return { page: 'authority-wise-properties' };
  }

  if (cleanPath.startsWith('/authority-properties/authority/')) {
    const authorityId = cleanPath.replace('/authority-properties/authority/', '');
    return { page: 'authority-wise-properties', authorityId };
  }

  if (cleanPath.startsWith('/authority-properties/')) {
    const id = cleanPath.replace('/authority-properties/', '');
    return { page: 'authority-property-detail', authorityPropertyId: id };
  }

  if (cleanPath === '/scrap-auctions' || cleanPath === '/scrap-auction' || cleanPath === '/scrap') {
    return { page: 'scrap-auctions' };
  }

  if (
    cleanPath === '/plant-machinery-auctions' ||
    cleanPath === '/plant-and-machinery-auctions' ||
    cleanPath === '/plant-machinery' ||
    cleanPath === '/machinery-auctions'
  ) {
    return { page: 'plant-machinery-auctions' };
  }

  if (cleanPath === '/auction-management' || cleanPath === '/manage-auctions') {
    return { page: 'auction-management' };
  }

  if (cleanPath.startsWith('/auction-asset/')) {
    const id = cleanPath.replace('/auction-asset/', '');
    return { page: 'auction-detail', auctionId: id };
  }

  if (cleanPath.startsWith('/auction/')) {
    const id = cleanPath.replace('/auction/', '');
    return { page: 'auction-detail', auctionId: id };
  }

  if (cleanPath === '/blogs' || cleanPath === '/blog' || cleanPath === '/insights') {
    return { page: 'blogs' };
  }

  if (cleanPath.startsWith('/blog/')) {
    const id = cleanPath.replace('/blog/', '');
    return { page: 'blog-detail', blogId: id };
  }

  if (cleanPath === '/faq' || cleanPath === '/faqs') {
    return { page: 'faq' };
  }

  if (cleanPath === '/contact' || cleanPath === '/contact-us') {
    return { page: 'contact' };
  }

  if (cleanPath === '/privacy' || cleanPath === '/privacy-policy') {
    return { page: 'privacy' };
  }

  if (cleanPath === '/terms' || cleanPath === '/terms-conditions' || cleanPath === '/terms-and-conditions') {
    return { page: 'terms' };
  }

  // Default fallback
  return { page: 'home' };
}

export const OFFICIAL_DOMAIN = 'auctionsandmore.in';
export const OFFICIAL_SITE_URL = `https://${OFFICIAL_DOMAIN}`;

/**
 * Resolve any pathname/search (or current browser path) onto https://auctionsandmore.in
 */
export function getOfficialUrl(pathnameAndSearch?: string): string {
  if (pathnameAndSearch !== undefined && pathnameAndSearch.trim() !== '') {
    const trimmed = pathnameAndSearch.trim();
    if (/^https?:\/\//i.test(trimmed)) {
      try {
        const parsed = new URL(trimmed);
        const full = `${parsed.pathname || '/'}${parsed.search || ''}`;
        return full === '/' ? OFFICIAL_SITE_URL : `${OFFICIAL_SITE_URL}${full}`;
      } catch {
        return OFFICIAL_SITE_URL;
      }
    }
    const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return normalized === '/' ? OFFICIAL_SITE_URL : `${OFFICIAL_SITE_URL}${normalized}`;
  }

  if (typeof window !== 'undefined' && window.location) {
    const fullPath = `${window.location.pathname || '/'}${window.location.search || ''}`;
    return fullPath === '/' ? OFFICIAL_SITE_URL : `${OFFICIAL_SITE_URL}${fullPath}`;
  }

  return OFFICIAL_SITE_URL;
}

/**
 * Generate an absolute shareable URL on https://auctionsandmore.in for any property or route
 */
export function getShareableUrl(page: PageRoute, paramId?: string, customBaseUrl?: string): string {
  const path = getCleanUrl(page, paramId);

  if (customBaseUrl && customBaseUrl.trim()) {
    const lower = customBaseUrl.trim().toLowerCase();
    if (
      !lower.includes('ai.studio') &&
      !lower.includes('.run.app') &&
      !lower.includes('localhost') &&
      !lower.includes('127.0.0.1') &&
      !lower.includes('springstrdg.com') &&
      lower.includes(OFFICIAL_DOMAIN)
    ) {
      const cleanBase = customBaseUrl.trim().replace(/\/+$/, '');
      return path === '/' ? cleanBase : `${cleanBase}${path}`;
    }
  }

  return path === '/' ? OFFICIAL_SITE_URL : `${OFFICIAL_SITE_URL}${path}`;
}

/**
 * Generate a clean URL string from page and optional params
 */
export function getCleanUrl(page: PageRoute, paramId?: string): string {
  if (page === 'property-detail' && paramId) {
    return `/property/${paramId}`;
  }
  if (page === 'authority-wise-properties') {
    return paramId ? `/authority-properties/authority/${paramId}` : '/authority-properties/authority';
  }
  if (page === 'authority-property-detail' && paramId) {
    return `/authority-properties/${paramId}`;
  }
  if (page === 'blog-detail' && paramId) {
    return `/blog/${paramId}`;
  }
  if (page === 'auction-detail' && paramId) {
    return `/auction-asset/${paramId}`;
  }
  return ROUTE_PATH_MAP[page] || '/';
}
