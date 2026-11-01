import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Property,
  PropertyPagination,
  AuctionAssetStats,
  AuthorityProperty,
  AuctionAsset,
} from '../types';
import { BlogPost, BlogPagination, DEFAULT_BLOG_PAGINATION } from '../data/blogData';
import { FAQItem } from '../data/faqData';
import { Testimonial } from '../data/testimonialsData';
import { parseUrlFilters, urlFiltersToApiParams } from '../utils/filterUtils';
import {
  WebsiteSettings,
  DEFAULT_WEBSITE_SETTINGS,
  getWebsiteSettings,
  getProperties,
  getPropertyById,
  getFaqs,
  getBlogs,
  getBlogBySlug,
  GetBlogsParams,
  GetBlogsResponse,
  GetBlogDetailResponse,
  getTestimonials,
  PropertyFilterParams,
  BankItem,
  NoticeItem,
  getBanks,
  getNotices,
  TeamMemberItem,
  getTeamMembers,
  getAuctionAssetStats,
} from '../services/api';

export const DEFAULT_PROPERTY_PAGINATION: PropertyPagination = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: 0,
  to: 0,
};

interface ApiContextValue {
  settings: WebsiteSettings;
  properties: Property[];
  homeProperties: Property[];
  propertyPagination: PropertyPagination;
  isLoadingProperties: boolean;
  propertiesError: string | null;
  refreshProperties: (params?: PropertyFilterParams) => Promise<void>;
  
  faqs: FAQItem[];
  isLoadingFaqs: boolean;
  faqsError: string | null;
  fetchFaqs: (category?: string) => Promise<FAQItem[]>;
  
  blogs: BlogPost[];
  blogPagination: BlogPagination;
  isLoadingBlogs: boolean;
  blogsError: string | null;
  fetchBlogs: (params?: GetBlogsParams) => Promise<GetBlogsResponse>;
  
  testimonials: Testimonial[];
  isLoadingTestimonials: boolean;
  
  banks: BankItem[];
  isLoadingBanks: boolean;
  refreshBanks: () => Promise<BankItem[]>;

  notices: NoticeItem[];
  isLoadingNotices: boolean;
  refreshNotices: () => Promise<NoticeItem[]>;

  teamMembers: TeamMemberItem[];
  isLoadingTeamMembers: boolean;
  refreshTeamMembers: () => Promise<TeamMemberItem[]>;

  // Property Enquiry Modal state (Form 1)
  enquiryModalProperty: Property | null;
  openEnquiryModal: (property: Property) => void;
  closeEnquiryModal: () => void;

  // Authority Property Enquiry Modal state
  authorityEnquiryProperty: AuthorityProperty | null;
  openAuthorityEnquiryModal: (property: AuthorityProperty) => void;
  closeAuthorityEnquiryModal: () => void;

  // Scrap & Plant Machinery Enquiry Modal state
  auctionAssetEnquiry: AuctionAsset | null;
  openAuctionAssetEnquiryModal: (asset: AuctionAsset) => void;
  closeAuctionAssetEnquiryModal: () => void;

  // Customer Requirement Modal state (Form 2)
  isCustomerRequirementOpen: boolean;
  openCustomerRequirementModal: () => void;
  closeCustomerRequirementModal: () => void;

  // Universal Share Modal state (Property or Website)
  shareModalProperty: Property | null;
  shareModalCustomUrl: string | undefined;
  isShareModalOpen: boolean;
  isWebsiteShare: boolean;
  openShareModal: (property?: Property | null, isWebsite?: boolean, customUrl?: string) => void;
  closeShareModal: () => void;

  // Single entity loaders
  fetchPropertyDetail: (id: string | number) => Promise<Property | null>;
  fetchBlogDetail: (slug: string) => Promise<GetBlogDetailResponse>;

  // Scrap & Plant Machinery Auction stats
  auctionAssetStats: AuctionAssetStats;
  isLoadingAuctionStats: boolean;
  refreshAuctionAssetStats: () => Promise<AuctionAssetStats>;
}

export const DEFAULT_AUCTION_ASSET_STATS: AuctionAssetStats = {
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

const ApiContext = createContext<ApiContextValue | null>(null);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<WebsiteSettings>(DEFAULT_WEBSITE_SETTINGS);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [homeProperties, setHomeProperties] = useState<Property[]>([]);
  const [propertyPagination, setPropertyPagination] = useState<PropertyPagination>(DEFAULT_PROPERTY_PAGINATION);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);
  
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(true);
  const [faqsError, setFaqsError] = useState<string | null>(null);
  
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [blogPagination, setBlogPagination] = useState<BlogPagination>(DEFAULT_BLOG_PAGINATION);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);
  const [blogsError, setBlogsError] = useState<string | null>(null);
  
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);

  const [banks, setBanks] = useState<BankItem[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);

  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [isLoadingNotices, setIsLoadingNotices] = useState(true);

  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>([]);
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = useState(true);

  // Modal states
  const [enquiryModalProperty, setEnquiryModalProperty] = useState<Property | null>(null);
  const [authorityEnquiryProperty, setAuthorityEnquiryProperty] =
    useState<AuthorityProperty | null>(null);
  const [auctionAssetEnquiry, setAuctionAssetEnquiry] = useState<AuctionAsset | null>(null);
  const [isCustomerRequirementOpen, setIsCustomerRequirementOpen] = useState(false);
  const [shareModalProperty, setShareModalProperty] = useState<Property | null>(null);
  const [shareModalCustomUrl, setShareModalCustomUrl] = useState<string | undefined>(undefined);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isWebsiteShare, setIsWebsiteShare] = useState(false);

  // Auction Asset Stats state
  const [auctionAssetStats, setAuctionAssetStats] = useState<AuctionAssetStats>(DEFAULT_AUCTION_ASSET_STATS);
  const [isLoadingAuctionStats, setIsLoadingAuctionStats] = useState(false);

  // 1. Fetch Website Settings
  useEffect(() => {
    let mounted = true;
    getWebsiteSettings().then((res) => {
      if (mounted) {
        setSettings(res);
        if (res.default_seo_title) {
          document.title = res.default_seo_title;
        }
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && res.default_meta_description) {
          metaDesc.setAttribute('content', res.default_meta_description);
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Request tracking to prevent out-of-order race conditions on search/filter updates
  const activeRequestIdRef = useRef<number>(0);

  // 2. Fetch Properties with optional filters
  const refreshProperties = useCallback(async (params?: PropertyFilterParams) => {
    const currentRequestId = ++activeRequestIdRef.current;
    setIsLoadingProperties(true);
    setPropertiesError(null);
    try {
      const res = await getProperties(params);
      // Discard stale responses if a newer request was dispatched
      if (currentRequestId !== activeRequestIdRef.current) return;

      setProperties(res.properties);
      
      // Determine if this is an unfiltered/base query
      const hasActiveFilters =
        params &&
        Object.entries(params).some(
          ([k, v]) => k !== 'page' && v !== undefined && v !== '' && v !== 'Any'
        );

      // Home properties should strictly keep the default unfiltered catalog
      if (!hasActiveFilters) {
        setHomeProperties(res.properties);
      } else {
        setHomeProperties((prev) => (prev.length > 0 ? prev : res.properties));
      }

      setPropertyPagination(res.pagination);
      if (!res.success && res.error) {
        setPropertiesError(res.error);
      }
    } catch {
      if (currentRequestId === activeRequestIdRef.current) {
        setPropertiesError('Unable to load properties from backend right now.');
      }
    } finally {
      if (currentRequestId === activeRequestIdRef.current) {
        setIsLoadingProperties(false);
      }
    }
  }, []);

  useEffect(() => {
    // If URL already contains filter parameters (e.g., from a WhatsApp link or shared URL), fetch using those filters immediately
    if (typeof window !== 'undefined' && window.location.search) {
      const initialUrlFilters = parseUrlFilters();
      const apiParams = urlFiltersToApiParams(initialUrlFilters);
      const hasFilters = Object.values(apiParams).some((v) => v !== undefined && v !== '');
      if (hasFilters) {
        refreshProperties(apiParams);
        return;
      }
    }
    refreshProperties();
  }, [refreshProperties]);

  // 3. Fetch FAQs dynamically from Laravel API
  const fetchFaqs = useCallback(async (category?: string) => {
    setIsLoadingFaqs(true);
    setFaqsError(null);
    try {
      const res = await getFaqs({ category });
      if (res.success) {
        setFaqs(res.faqs);
        return res.faqs;
      } else {
        setFaqsError(res.message || 'Failed to load FAQs');
        setFaqs([]);
        return [];
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error while loading FAQs';
      setFaqsError(msg);
      setFaqs([]);
      return [];
    } finally {
      setIsLoadingFaqs(false);
    }
  }, []);

  useEffect(() => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    if (path.startsWith('/faq')) {
      fetchFaqs();
      return;
    }
    const timer = setTimeout(() => {
      fetchFaqs();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchFaqs]);

  // 4. Fetch Blogs dynamically from Laravel API
  const fetchBlogs = useCallback(async (params?: GetBlogsParams): Promise<GetBlogsResponse> => {
    setIsLoadingBlogs(true);
    setBlogsError(null);
    try {
      const res = await getBlogs(params);
      if (res.success) {
        setBlogs(res.blogs);
        setBlogPagination(res.pagination);
        return res;
      } else {
        setBlogsError(res.message || 'Failed to load blogs');
        setBlogs([]);
        setBlogPagination(DEFAULT_BLOG_PAGINATION);
        return res;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error while loading blogs';
      setBlogsError(msg);
      setBlogs([]);
      setBlogPagination(DEFAULT_BLOG_PAGINATION);
      return {
        blogs: [],
        pagination: DEFAULT_BLOG_PAGINATION,
        fromApi: false,
        success: false,
        message: msg,
      };
    } finally {
      setIsLoadingBlogs(false);
    }
  }, []);

  useEffect(() => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    if (path.startsWith('/blog') || path.startsWith('/insights')) {
      fetchBlogs();
      return;
    }
    const timer = setTimeout(() => {
      fetchBlogs();
    }, 550);
    return () => clearTimeout(timer);
  }, [fetchBlogs]);

  // 5. Fetch Testimonials (below the fold)
  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      getTestimonials().then((res) => {
        if (mounted) {
          setTestimonials(res.testimonials);
          setIsLoadingTestimonials(false);
        }
      });
    }, 350);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  // 6. Fetch Active Banks
  const refreshBanks = useCallback(async (): Promise<BankItem[]> => {
    setIsLoadingBanks(true);
    try {
      const res = await getBanks();
      const list = res.banks || [];
      setBanks(list);
      return list;
    } catch {
      setBanks([]);
      return [];
    } finally {
      setIsLoadingBanks(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshBanks();
    }, 200);
    return () => clearTimeout(timer);
  }, [refreshBanks]);

  // 7. Fetch Active Notices
  const refreshNotices = useCallback(async (): Promise<NoticeItem[]> => {
    setIsLoadingNotices(true);
    try {
      const res = await getNotices();
      const list = res.notices || [];
      setNotices(list);
      return list;
    } catch {
      setNotices([]);
      return [];
    } finally {
      setIsLoadingNotices(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshNotices();
    }, 150);
    return () => clearTimeout(timer);
  }, [refreshNotices]);

  // 8. Fetch Team Members (primarily used on About page)
  const refreshTeamMembers = useCallback(async (): Promise<TeamMemberItem[]> => {
    setIsLoadingTeamMembers(true);
    try {
      const res = await getTeamMembers();
      const list = res.teamMembers || [];
      setTeamMembers(list);
      return list;
    } catch {
      setTeamMembers([]);
      return [];
    } finally {
      setIsLoadingTeamMembers(false);
    }
  }, []);

  useEffect(() => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    if (path.startsWith('/about')) {
      refreshTeamMembers();
      return;
    }
    const timer = setTimeout(() => {
      refreshTeamMembers();
    }, 700);
    return () => clearTimeout(timer);
  }, [refreshTeamMembers]);

  const openEnquiryModal = useCallback((property: Property) => {
    setEnquiryModalProperty(property);
  }, []);

  const closeEnquiryModal = useCallback(() => {
    setEnquiryModalProperty(null);
  }, []);

  const openAuthorityEnquiryModal = useCallback((property: AuthorityProperty) => {
    setAuthorityEnquiryProperty(property);
  }, []);

  const closeAuthorityEnquiryModal = useCallback(() => {
    setAuthorityEnquiryProperty(null);
  }, []);

  const openAuctionAssetEnquiryModal = useCallback((asset: AuctionAsset) => {
    setAuctionAssetEnquiry(asset);
  }, []);

  const closeAuctionAssetEnquiryModal = useCallback(() => {
    setAuctionAssetEnquiry(null);
  }, []);

  const openCustomerRequirementModal = useCallback(() => {
    setIsCustomerRequirementOpen(true);
  }, []);

  const closeCustomerRequirementModal = useCallback(() => {
    setIsCustomerRequirementOpen(false);
  }, []);

  const openShareModal = useCallback(
    (property?: Property | null, isWebsite = false, customUrl?: string) => {
      if (property) {
        setShareModalProperty(property);
        setIsWebsiteShare(false);
      } else {
        setShareModalProperty(null);
        setIsWebsiteShare(isWebsite || true);
      }
      setShareModalCustomUrl(customUrl);
      setIsShareModalOpen(true);
    },
    []
  );

  const closeShareModal = useCallback(() => {
    setIsShareModalOpen(false);
    setShareModalProperty(null);
    setShareModalCustomUrl(undefined);
    setIsWebsiteShare(false);
  }, []);

  const fetchPropertyDetail = useCallback(async (id: string | number) => {
    const res = await getPropertyById(id);
    return res.property;
  }, []);

  const fetchBlogDetail = useCallback(async (slug: string): Promise<GetBlogDetailResponse> => {
    return await getBlogBySlug(slug);
  }, []);

  const refreshAuctionAssetStats = useCallback(async (): Promise<AuctionAssetStats> => {
    setIsLoadingAuctionStats(true);
    try {
      const stats = await getAuctionAssetStats();
      setAuctionAssetStats(stats);
      return stats;
    } catch {
      return DEFAULT_AUCTION_ASSET_STATS;
    } finally {
      setIsLoadingAuctionStats(false);
    }
  }, []);

  useEffect(() => {
    refreshAuctionAssetStats();
  }, [refreshAuctionAssetStats]);

  return (
    <ApiContext.Provider
      value={{
        settings,
        properties,
        homeProperties,
        propertyPagination,
        isLoadingProperties,
        propertiesError,
        refreshProperties,
        faqs,
        isLoadingFaqs,
        faqsError,
        fetchFaqs,
        blogs,
        blogPagination,
        isLoadingBlogs,
        blogsError,
        fetchBlogs,
        testimonials,
        isLoadingTestimonials,
        banks,
        isLoadingBanks,
        refreshBanks,
        notices,
        isLoadingNotices,
        refreshNotices,
        teamMembers,
        isLoadingTeamMembers,
        refreshTeamMembers,
        enquiryModalProperty,
        openEnquiryModal,
        closeEnquiryModal,
        authorityEnquiryProperty,
        openAuthorityEnquiryModal,
        closeAuthorityEnquiryModal,
        auctionAssetEnquiry,
        openAuctionAssetEnquiryModal,
        closeAuctionAssetEnquiryModal,
        isCustomerRequirementOpen,
        openCustomerRequirementModal,
        closeCustomerRequirementModal,
        shareModalProperty,
        shareModalCustomUrl,
        isShareModalOpen,
        isWebsiteShare,
        openShareModal,
        closeShareModal,
        fetchPropertyDetail,
        fetchBlogDetail,
        auctionAssetStats,
        isLoadingAuctionStats,
        refreshAuctionAssetStats,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export function useApi(): ApiContextValue {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
}
