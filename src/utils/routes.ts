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
  'not-found': '/404',
};

/**
 * Parse current browser URL pathname into RouteState
 */
export function parsePathname(pathname: string): RouteState {
  if (!pathname) {
    return { page: 'home' };
  }

  // Strip query string and hash
  const [pathWithoutQuery] = pathname.split('?');
  const pathWithoutHash = pathWithoutQuery.split('#')[0].trim();

  // Safe URI decoding to handle encoded characters like %20, %2D, etc.
  let decodedPath = pathWithoutHash;
  try {
    decodedPath = decodeURIComponent(pathWithoutHash);
  } catch {
    decodedPath = pathWithoutHash;
  }

  // Clean trailing slashes except for root "/"
  const cleanPath = decodedPath.length > 1 ? decodedPath.replace(/\/+$/, '') : decodedPath;
  const lowerPath = cleanPath.toLowerCase();

  // Root or homepage
  if (cleanPath === '' || cleanPath === '/' || lowerPath === '/home') {
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

  if (lowerPath === '/about' || lowerPath === '/about-us') {
    return { page: 'about' };
  }

  if (lowerPath === '/properties' || lowerPath === '/property' || lowerPath === '/auctions') {
    return { page: 'property' };
  }

  // Dynamic Property routes: /property/:slug or /properties/:slug
  if (lowerPath.startsWith('/property/')) {
    const slug = cleanPath.slice('/property/'.length).replace(/\/+$/, '').trim();
    if (!slug) return { page: 'property' };
    return { page: 'property-detail', propertyId: slug };
  }

  if (lowerPath.startsWith('/properties/')) {
    const slug = cleanPath.slice('/properties/'.length).replace(/\/+$/, '').trim();
    if (!slug) return { page: 'property' };
    return { page: 'property-detail', propertyId: slug };
  }

  // Authority Properties main catalog
  if (lowerPath === '/authority-properties') {
    return { page: 'authority-properties' };
  }

  // Authority-wise catalog: /authority-properties/authority
  if (lowerPath === '/authority-properties/authority') {
    return { page: 'authority-wise-properties' };
  }

  // Authority-wise single authority catalog: /authority-properties/authority/:authorityId
  if (lowerPath.startsWith('/authority-properties/authority/')) {
    const authorityId = cleanPath.slice('/authority-properties/authority/'.length).replace(/\/+$/, '').trim();
    if (!authorityId) return { page: 'authority-wise-properties' };
    return { page: 'authority-wise-properties', authorityId };
  }

  // Authority single property detail: /authority-properties/:id
  if (lowerPath.startsWith('/authority-properties/')) {
    const id = cleanPath.slice('/authority-properties/'.length).replace(/\/+$/, '').trim();
    if (!id) return { page: 'authority-properties' };
    return { page: 'authority-property-detail', authorityPropertyId: id };
  }

  // Scrap auctions catalog
  if (lowerPath === '/scrap-auctions' || lowerPath === '/scrap-auction' || lowerPath === '/scrap') {
    return { page: 'scrap-auctions' };
  }

  // Plant & Machinery auctions catalog
  if (
    lowerPath === '/plant-machinery-auctions' ||
    lowerPath === '/plant-and-machinery-auctions' ||
    lowerPath === '/plant-machinery' ||
    lowerPath === '/machinery-auctions'
  ) {
    return { page: 'plant-machinery-auctions' };
  }

  // Auction management portal
  if (lowerPath === '/auction-management' || lowerPath === '/manage-auctions') {
    return { page: 'auction-management' };
  }

  // Auction asset detail: /auction-asset/:id or /auction/:id
  if (lowerPath.startsWith('/auction-asset/')) {
    const id = cleanPath.slice('/auction-asset/'.length).replace(/\/+$/, '').trim();
    if (!id) return { page: 'plant-machinery-auctions' };
    return { page: 'auction-detail', auctionId: id };
  }

  if (lowerPath.startsWith('/auction/')) {
    const id = cleanPath.slice('/auction/'.length).replace(/\/+$/, '').trim();
    if (!id) return { page: 'property' };
    return { page: 'auction-detail', auctionId: id };
  }

  // Blogs & Insights
  if (lowerPath === '/blogs' || lowerPath === '/blog' || lowerPath === '/insights') {
    return { page: 'blogs' };
  }

  // Blog detail: /blog/:slug
  if (lowerPath.startsWith('/blog/')) {
    const id = cleanPath.slice('/blog/'.length).replace(/\/+$/, '').trim();
    if (!id) return { page: 'blogs' };
    return { page: 'blog-detail', blogId: id };
  }

  // FAQs
  if (lowerPath === '/faq' || lowerPath === '/faqs') {
    return { page: 'faq' };
  }

  // Contact
  if (lowerPath === '/contact' || lowerPath === '/contact-us') {
    return { page: 'contact' };
  }

  // Privacy Policy
  if (lowerPath === '/privacy' || lowerPath === '/privacy-policy') {
    return { page: 'privacy' };
  }

  // Terms & Conditions
  if (lowerPath === '/terms' || lowerPath === '/terms-conditions' || lowerPath === '/terms-and-conditions') {
    return { page: 'terms' };
  }

  // Explicit 404 page for any unmapped URL
  return { page: 'not-found' };
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
