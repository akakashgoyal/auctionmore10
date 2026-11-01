import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Property, AuctionAsset, AuthorityProperty } from './types';
import { BlogPost } from './data/blogData';
import { useApi } from './context/ApiContext';
import { getPropertyById, getAuctionAssetById } from './services/api';
import { Navbar, PageRoute } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './components/pages/HomePage';
import { MessageCircle } from 'lucide-react';
import { parsePathname, getCleanUrl, getOfficialUrl } from './utils/routes';

const PropertyEnquiryModal = lazy(() =>
  import('./components/PropertyEnquiryModal').then((m) => ({ default: m.PropertyEnquiryModal }))
);
const AuthorityPropertyEnquiryModal = lazy(() =>
  import('./components/AuthorityPropertyEnquiryModal').then((m) => ({
    default: m.AuthorityPropertyEnquiryModal,
  }))
);
const AuctionAssetEnquiryModal = lazy(() =>
  import('./components/AuctionAssetEnquiryModal').then((m) => ({
    default: m.AuctionAssetEnquiryModal,
  }))
);
const CustomerRequirementModal = lazy(() =>
  import('./components/CustomerRequirementModal').then((m) => ({ default: m.CustomerRequirementModal }))
);
const SharePropertyModal = lazy(() =>
  import('./components/SharePropertyModal').then((m) => ({ default: m.SharePropertyModal }))
);
const LegalModal = lazy(() =>
  import('./components/LegalModal').then((m) => ({ default: m.LegalModal }))
);

// Code-split secondary pages so initial homepage bundle loads and parses rapidly
const AboutPage = lazy(() => import('./components/pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const PropertyPage = lazy(() => import('./components/pages/PropertyPage').then((m) => ({ default: m.PropertyPage })));
const PropertyDetailPage = lazy(() => import('./components/pages/PropertyDetailPage').then((m) => ({ default: m.PropertyDetailPage })));
const AuthorityPropertiesPage = lazy(() => import('./components/pages/AuthorityPropertiesPage').then((m) => ({ default: m.AuthorityPropertiesPage })));
const AuthorityWisePropertiesPage = lazy(() => import('./components/pages/AuthorityWisePropertiesPage').then((m) => ({ default: m.AuthorityWisePropertiesPage })));
const AuthorityPropertyDetailPage = lazy(() => import('./components/pages/AuthorityPropertyDetailPage').then((m) => ({ default: m.AuthorityPropertyDetailPage })));
const ScrapAuctionsPage = lazy(() => import('./components/pages/ScrapAuctionsPage').then((m) => ({ default: m.ScrapAuctionsPage })));
const PlantMachineryPage = lazy(() => import('./components/pages/PlantMachineryPage').then((m) => ({ default: m.PlantMachineryPage })));
const AuctionAssetDetailPage = lazy(() => import('./components/pages/AuctionAssetDetailPage').then((m) => ({ default: m.AuctionAssetDetailPage })));
const AuctionManagementPage = lazy(() => import('./components/pages/AuctionManagementPage').then((m) => ({ default: m.AuctionManagementPage })));
const BlogsPage = lazy(() => import('./components/pages/BlogsPage').then((m) => ({ default: m.BlogsPage })));
const BlogDetailPage = lazy(() => import('./components/pages/BlogDetailPage').then((m) => ({ default: m.BlogDetailPage })));
const FaqPage = lazy(() => import('./components/pages/FaqPage').then((m) => ({ default: m.FaqPage })));
const ContactPage = lazy(() => import('./components/pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const PrivacyPolicyPage = lazy(() => import('./components/pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })));
const TermsConditionsPage = lazy(() => import('./components/pages/TermsConditionsPage').then((m) => ({ default: m.TermsConditionsPage })));

export default function App() {
  const {
    properties: apiProperties,
    homeProperties,
    blogs: apiBlogs,
    enquiryModalProperty,
    openEnquiryModal,
    closeEnquiryModal,
    authorityEnquiryProperty,
    closeAuthorityEnquiryModal,
    auctionAssetEnquiry,
    closeAuctionAssetEnquiryModal,
    isCustomerRequirementOpen,
    closeCustomerRequirementModal,
    shareModalProperty,
    shareModalCustomUrl,
    isShareModalOpen,
    isWebsiteShare,
    closeShareModal,
    settings,
  } = useApi();

  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [currentBlogSlug, setCurrentBlogSlug] = useState<string | null>(null);
  const [selectedAuctionAsset, setSelectedAuctionAsset] = useState<AuctionAsset | null>(null);
  const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null);
  const [selectedAuthorityProperty, setSelectedAuthorityProperty] = useState<AuthorityProperty | null>(null);
  const [selectedAuthorityPropertyId, setSelectedAuthorityPropertyId] = useState<number | string | null>(null);
  const [selectedAuthorityId, setSelectedAuthorityId] = useState<number | null>(null);
  const [authorityBackPage, setAuthorityBackPage] = useState<'authority-properties' | 'authority-wise-properties'>('authority-properties');
  const [interestModalProperty, setInterestModalProperty] = useState<Property | null>(null);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms' | null>(null);

  // Sync state from current URL pathname
  const syncRouteFromLocation = useCallback(() => {
    // If there is an accidental hash like #/about or #about, clean it
    let path = window.location.pathname;
    if (window.location.hash && window.location.hash.startsWith('#/')) {
      path = window.location.hash.replace('#', '');
    } else if (window.location.hash && !window.location.hash.startsWith('#how-we-work')) {
      path = '/' + window.location.hash.replace('#', '');
    }

    const route = parsePathname(path);
    setCurrentPage(route.page);

    if (route.page === 'property-detail' && route.propertyId) {
      const propId = route.propertyId;
      const match = apiProperties.find((p) => p.id === propId || p.slug === propId);
      if (match) {
        setSelectedProperty(match);
      } else {
        // Fetch dynamically from API
        getPropertyById(propId).then((res) => {
          if (res.property) {
            setSelectedProperty(res.property);
          }
        });
      }
    }

    if (route.page === 'auction-detail' && route.auctionId) {
      const aId = Number(route.auctionId);
      setSelectedAuctionId(aId);
      getAuctionAssetById(aId).then((res) => {
        if (res && res.asset) {
          setSelectedAuctionAsset(res.asset);
        }
      }).catch((err) => console.error('Failed to resolve auction asset route:', err));
    }

    if (route.page === 'authority-wise-properties') {
      if (route.authorityId) {
        const parsedId = Number(route.authorityId);
        setSelectedAuthorityId(!isNaN(parsedId) && parsedId > 0 ? parsedId : null);
      } else {
        setSelectedAuthorityId(null);
      }
    }

    if (route.page === 'authority-property-detail' && route.authorityPropertyId) {
      setSelectedAuthorityPropertyId(route.authorityPropertyId);
      setSelectedAuthorityProperty((prev) =>
        prev && String(prev.id) === String(route.authorityPropertyId) ? prev : null
      );
    }

    if (route.page === 'blog-detail' && route.blogId) {
      setCurrentBlogSlug(route.blogId);
      const match = apiBlogs.find((b) => (b.slug && b.slug === route.blogId) || String(b.id) === String(route.blogId));
      if (match) {
        setSelectedBlogPost(match);
      }
    }
  }, [apiProperties, apiBlogs]);

  // Listen for browser Back/Forward navigation & handle initial URL load
  useEffect(() => {
    syncRouteFromLocation();

    const handlePopState = () => {
      syncRouteFromLocation();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [syncRouteFromLocation]);

  // Keep canonical, og:url, and twitter:url synced to https://auctionsandmore.in across routes
  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;
    const canonicalHref = getOfficialUrl(window.location.pathname || '/');

    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalHref);

    const ogUrlEl = document.querySelector('meta[property="og:url"]');
    if (ogUrlEl) {
      ogUrlEl.setAttribute('content', canonicalHref);
    }

    const twitterUrlEl = document.querySelector('meta[name="twitter:url"]');
    if (twitterUrlEl) {
      twitterUrlEl.setAttribute('content', canonicalHref);
    }
  }, [
    currentPage,
    selectedProperty,
    selectedBlogPost,
    selectedAuctionId,
    selectedAuthorityPropertyId,
    selectedAuthorityId,
  ]);

  // Clean navigation pushing state without hash, respecting query strings
  const handleNavigate = (page: PageRoute, customUrl?: string) => {
    const targetUrl = customUrl || getCleanUrl(page);
    const currentUrl = window.location.pathname + window.location.search;
    if (currentUrl !== targetUrl) {
      window.history.pushState({ page }, '', targetUrl);
      window.dispatchEvent(new Event('app-url-change'));
    }

    const parsed = parsePathname(targetUrl);
    if (parsed.page === 'authority-wise-properties') {
      const parsedId = parsed.authorityId ? Number(parsed.authorityId) : NaN;
      setSelectedAuthorityId(!isNaN(parsedId) && parsedId > 0 ? parsedId : null);
    } else if (parsed.page === 'authority-property-detail' && parsed.authorityPropertyId) {
      setSelectedAuthorityPropertyId(parsed.authorityPropertyId);
      setSelectedAuthorityProperty((prev) =>
        prev && String(prev.id) === String(parsed.authorityPropertyId) ? prev : null
      );
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAuthorityProperty = (
    property: AuthorityProperty,
    fromPage: 'authority-properties' | 'authority-wise-properties' = 'authority-properties'
  ) => {
    setAuthorityBackPage(fromPage);
    setSelectedAuthorityProperty(property);
    setSelectedAuthorityPropertyId(property.id);
    const targetUrl = `/authority-properties/${property.id}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(
        { page: 'authority-property-detail', authorityPropertyId: String(property.id) },
        '',
        targetUrl
      );
    }
    setCurrentPage('authority-property-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAuthority = (authorityId: number) => {
    setSelectedAuthorityId(authorityId);
    const targetUrl = `/authority-properties/authority/${authorityId}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(
        { page: 'authority-wise-properties', authorityId: String(authorityId) },
        '',
        targetUrl
      );
    }
    setCurrentPage('authority-wise-properties');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
    const slugOrId = property.slug || property.id;
    const targetUrl = `/property/${slugOrId}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({ page: 'property-detail', propertyId: slugOrId }, '', targetUrl);
    }
    setCurrentPage('property-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAuction = (asset: AuctionAsset) => {
    setSelectedAuctionAsset(asset);
    setSelectedAuctionId(asset.id);
    const targetUrl = `/auction/${asset.id}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({ page: 'auction-detail', auctionId: asset.id }, '', targetUrl);
    }
    setCurrentPage('auction-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBlog = (post: BlogPost) => {
    setSelectedBlogPost(post);
    const slug = post.slug || String(post.id);
    setCurrentBlogSlug(slug);
    const targetUrl = `/blog/${slug}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({ page: 'blog-detail', blogId: slug }, '', targetUrl);
    }
    setCurrentPage('blog-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-[#142533] antialiased overflow-x-clip w-full max-w-full selection:bg-[#D89B30]/20 selection:text-[#142533]">
      {/* Universal Clean Navbar */}
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Page Content - Full Width */}
      <main className="flex-1 w-full">
        <Suspense
          fallback={
            <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden animate-pulse"
                  >
                    <div className="aspect-16/10 bg-slate-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                      <div className="h-5 bg-slate-200 rounded w-5/6" />
                      <div className="h-10 bg-slate-100 rounded-xl mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        >
        {currentPage === 'home' && (
          <HomePage
            properties={homeProperties && homeProperties.length > 0 ? homeProperties : apiProperties}
            onSelectProperty={handleSelectProperty}
            onExpressInterest={(p) => openEnquiryModal(p)}
            onNavigate={handleNavigate}
            onSelectBlog={handleSelectBlog}
            onSelectAuthorityProperty={(prop) => handleSelectAuthorityProperty(prop, 'authority-properties')}
            onSelectAuthority={handleSelectAuthority}
            onSelectAuction={handleSelectAuction}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage
            onNavigate={handleNavigate}
            onSelectProperty={handleSelectProperty}
            onExpressInterest={(p) => openEnquiryModal(p)}
          />
        )}

        {currentPage === 'property' && (
          <PropertyPage
            properties={apiProperties}
            onSelectProperty={handleSelectProperty}
            onExpressInterest={(p) => openEnquiryModal(p)}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'property-detail' && (selectedProperty || apiProperties[0]) && (
          <PropertyDetailPage
            property={selectedProperty || apiProperties[0]}
            onBack={() => handleNavigate('property')}
            onExpressInterest={(p) => openEnquiryModal(p)}
            onSelectRelatedProperty={(p) => {
              setSelectedProperty(p);
              const slugOrId = p.slug || p.id;
              const targetUrl = `/property/${slugOrId}`;
              if (window.location.pathname !== targetUrl) {
                window.history.pushState({ page: 'property-detail', propertyId: slugOrId }, '', targetUrl);
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'authority-properties' && (
          <AuthorityPropertiesPage
            onSelectProperty={(prop) => handleSelectAuthorityProperty(prop, 'authority-properties')}
            onSelectAuthority={handleSelectAuthority}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'authority-wise-properties' && (
          <AuthorityWisePropertiesPage
            authorityId={selectedAuthorityId}
            onSelectProperty={(prop) => handleSelectAuthorityProperty(prop, 'authority-wise-properties')}
            onSelectAuthority={handleSelectAuthority}
            onBackToAll={() => handleNavigate('authority-properties', '/authority-properties')}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'authority-property-detail' &&
          (selectedAuthorityPropertyId !== null || selectedAuthorityProperty !== null) && (
            <AuthorityPropertyDetailPage
              propertyId={selectedAuthorityPropertyId || selectedAuthorityProperty!.id}
              initialProperty={selectedAuthorityProperty}
              onBack={() => {
                if (authorityBackPage === 'authority-wise-properties' && selectedAuthorityId) {
                  handleNavigate(
                    'authority-wise-properties',
                    `/authority-properties/authority/${selectedAuthorityId}`
                  );
                } else {
                  handleNavigate('authority-properties', '/authority-properties');
                }
              }}
              onSelectAuthority={handleSelectAuthority}
              onNavigate={handleNavigate}
            />
          )}

        {currentPage === 'scrap-auctions' && (
          <ScrapAuctionsPage
            onViewAuction={handleSelectAuction}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'plant-machinery-auctions' && (
          <PlantMachineryPage
            onViewAuction={handleSelectAuction}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'auction-detail' && (
          <AuctionAssetDetailPage
            assetId={selectedAuctionId || selectedAuctionAsset?.id || 1}
            initialAsset={selectedAuctionAsset}
            onNavigate={handleNavigate}
            onBack={() => {
              if (selectedAuctionAsset?.category === 'Scrap') {
                handleNavigate('scrap-auctions', '/scrap-auctions');
              } else {
                handleNavigate('plant-machinery-auctions', '/plant-machinery-auctions');
              }
            }}
          />
        )}

        {currentPage === 'auction-management' && (
          <AuctionManagementPage
            onViewAuction={handleSelectAuction}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'blogs' && (
          <BlogsPage
            onNavigate={handleNavigate}
            onSelectPost={handleSelectBlog}
          />
        )}

        {currentPage === 'blog-detail' && (
          <BlogDetailPage
            post={selectedBlogPost}
            slug={currentBlogSlug || (typeof window !== 'undefined' && window.location.pathname.startsWith('/blog/') ? window.location.pathname.replace('/blog/', '') : undefined)}
            onBack={() => handleNavigate('blogs')}
            onSelectRelatedPost={(p) => {
              handleSelectBlog(p);
            }}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'faq' && <FaqPage onNavigate={handleNavigate} />}

        {currentPage === 'contact' && <ContactPage />}

        {currentPage === 'privacy' && <PrivacyPolicyPage />}

        {currentPage === 'terms' && <TermsConditionsPage />}
        </Suspense>
      </main>

      {/* Lazy-mounted Modals (loaded and rendered only when opened) */}
      <Suspense fallback={null}>
        {(Boolean(enquiryModalProperty) || Boolean(interestModalProperty)) && (
          <PropertyEnquiryModal
            property={enquiryModalProperty || interestModalProperty}
            isOpen={Boolean(enquiryModalProperty) || Boolean(interestModalProperty)}
            onClose={() => {
              closeEnquiryModal();
              setInterestModalProperty(null);
            }}
          />
        )}

        {Boolean(authorityEnquiryProperty) && (
          <AuthorityPropertyEnquiryModal
            property={authorityEnquiryProperty}
            isOpen={Boolean(authorityEnquiryProperty)}
            onClose={closeAuthorityEnquiryModal}
          />
        )}

        {Boolean(auctionAssetEnquiry) && (
          <AuctionAssetEnquiryModal
            asset={auctionAssetEnquiry}
            isOpen={Boolean(auctionAssetEnquiry)}
            onClose={closeAuctionAssetEnquiryModal}
          />
        )}

        {isCustomerRequirementOpen && (
          <CustomerRequirementModal
            isOpen={isCustomerRequirementOpen}
            onClose={closeCustomerRequirementModal}
          />
        )}

        {isShareModalOpen && (
          <SharePropertyModal
            property={shareModalProperty}
            customShareUrl={shareModalCustomUrl}
            isOpen={isShareModalOpen}
            onClose={closeShareModal}
            isWebsiteShare={isWebsiteShare}
          />
        )}

        {Boolean(legalModalTab) && (
          <LegalModal
            isOpen={Boolean(legalModalTab)}
            initialTab={legalModalTab || 'privacy'}
            onClose={() => setLegalModalTab(null)}
          />
        )}
      </Suspense>

      {/* Floating WhatsApp Quick Action (Icon Button) */}
      <aside className="fixed bottom-6 right-6 z-40" aria-label="Quick contact desk">
        <a
          href={`https://wa.me/${(settings.whatsapp_number || settings.primary_phone || '919899897647').replace(/[^0-9]/g, '')}?text=Hi%20Auctions%20%26%20More%2C%20I%20would%20like%20to%20inquire%20about%20bank%20auction%20properties.`}
          target="_blank"
          rel="noreferrer"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all group focus:outline-hidden focus:ring-4 focus:ring-emerald-400/30"
          title={`Chat on WhatsApp (${settings.whatsapp_number || settings.primary_phone || '+91 9899897647'})`}
          aria-label={`Chat on WhatsApp (${settings.whatsapp_number || settings.primary_phone || '+91 9899897647'})`}
        >
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform fill-white/10 stroke-white" />
        </a>
      </aside>

      {/* Universal Footer */}
      <Footer
        onNavigate={handleNavigate}
        onSelectProperty={handleSelectProperty}
        onOpenLegal={(type) => setLegalModalTab(type)}
      />
    </div>
  );
}
