import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FAQItem } from '../../data/faqData';
import { getFaqs } from '../../services/api';
import { useApi } from '../../context/ApiContext';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { PageRoute } from '../Navbar';
import { AuctionCtaBanner } from '../AuctionCtaBanner';

interface FaqPageProps {
  onNavigate: (page: PageRoute, customUrl?: string) => void;
}

// Predefined topic label dictionary for friendly UI representation
const PRESET_TOPIC_LABELS: Record<string, string> = {
  General: 'General & Heritage',
  Process: 'Possession & Timeline',
  'Bidding & EMD': 'Bidding & EMD',
  'Notifications & Alerts': 'Live Alerts & Deadlines',
  'Legal & Possession': 'Legal & Title Clearance',
};

// Check if answer contains HTML tags
function isHtmlString(str: string): boolean {
  return /<[a-z][\s\S]*>/i.test(str);
}

export const FaqPage: React.FC<FaqPageProps> = ({ onNavigate }) => {
  const { settings } = useApi();

  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [allCategoriesList, setAllCategoriesList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openItems, setOpenItems] = useState<(string | number)[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Primary API fetch function with optional category filter
  const loadFaqs = useCallback(async (categoryFilter?: string) => {
    setIsLoading(true);
    setError(null);

    const categoryParam =
      categoryFilter && categoryFilter !== 'all' ? categoryFilter : undefined;

    try {
      const res = await getFaqs({ category: categoryParam });
      if (res.success) {
        setFaqs(res.faqs);

        // Auto-open first item if available
        if (res.faqs.length > 0) {
          setOpenItems([res.faqs[0].id]);
        } else {
          setOpenItems([]);
        }

        // If loading all topics, record unique categories for sidebar
        if (!categoryParam) {
          const uniqueCats = Array.from(
            new Set(res.faqs.map((f) => f.category).filter(Boolean))
          );
          setAllCategoriesList(uniqueCats);
        }
      } else {
        setError(res.message || 'Failed to fetch FAQs.');
        setFaqs([]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network request failed';
      setError(msg);
      setFaqs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load and re-fetch on category change
  useEffect(() => {
    loadFaqs(activeCategory);
  }, [activeCategory, loadFaqs]);

  // Handle category tab change
  const handleCategoryChange = (categoryId: string) => {
    if (activeCategory === categoryId) return;
    setActiveCategory(categoryId);
  };

  // Build dynamic categories list for sidebar
  const categoryItems = useMemo(() => {
    const list: { id: string; label: string }[] = [{ id: 'all', label: 'All Topics' }];

    // Known presets + any category returned from API
    const baseKeys = ['General', 'Process', 'Bidding & EMD', 'Notifications & Alerts', 'Legal & Possession'];
    const merged = Array.from(new Set([...baseKeys, ...allCategoriesList]));

    merged.forEach((cat) => {
      list.push({
        id: cat,
        label: PRESET_TOPIC_LABELS[cat] || cat,
      });
    });

    return list;
  }, [allCategoriesList]);

  // Accordion toggle
  const toggleItem = (id: string | number) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    setOpenItems(filteredFaqs.map((f) => f.id));
  };

  const collapseAll = () => {
    setOpenItems([]);
  };

  // Filter within loaded data for client-side search bar
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const q = searchQuery.toLowerCase().trim();
    return faqs.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [faqs, searchQuery]);

  // Contact info helpers
  const primaryPhone = settings.primary_phone || '+91 9899897647';
  const rawPhone = primaryPhone.replace(/[^\d+]/g, '');
  const whatsappNumber = settings.whatsapp_number || settings.primary_phone || '919899897647';
  const rawWhatsapp = whatsappNumber.replace(/[^\d]/g, '');

  return (
    <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 space-y-10 pb-6 sm:pb-8">
      {/* 1. Header Banner with Balanced Two-Column Layout */}
      <div className="bg-[#142533] text-white rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden border border-white/10 shadow-xl group">
        {/* Subtle Architectural Texture Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity pointer-events-none transition-transform duration-700 group-hover:scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1b26]/95 via-[#142533]/90 to-[#0d1b26]/95 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#D89B30]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Title & Advisory Narrative */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#D89B30] text-xs font-mono font-medium shadow-2xs">
              <HelpCircle className="w-4 h-4 text-[#D89B30]" />
              <span>KNOWLEDGE REPOSITORY &amp; LEGAL CLARIFICATIONS</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Clear, authoritative answers on the SARFAESI Act, EMD deposits, bidding increments, receiving live deadline
              alerts, and taking 60-day physical possession across India.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D89B30]" />
                <span>SARFAESI Act 2002</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D89B30]" />
                <span>EMD Refund Protocols</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D89B30]" />
                <span>Sec 14 CMM/DM Orders</span>
              </span>
            </div>
          </div>

          {/* Right Column: Direct Legal Advisory Helpline Card */}
          <div className="lg:col-span-5">
            <div className="bg-white/10 border border-white/20 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase text-[#D89B30]">Legal Advisory Desk Live</span>
                </div>
                <span className="text-[11px] text-slate-300 font-mono">New Delhi HQ</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Have a specific property or pending DRT query? Speak directly with an empaneled advocate for immediate guidance.
              </p>
              <div className="space-y-2.5 pt-1">
                <a
                  href={`tel:${rawPhone}`}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#D89B30] hover:bg-[#C58920] text-[#142533] font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-[#142533]" />
                  <span>Call Desk: {primaryPhone}</span>
                </a>
                <a
                  href={`https://wa.me/${rawWhatsapp}?text=${encodeURIComponent('Hello, I have a legal query regarding a bank auction.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Legal Counsel</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Full-Width Content (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Sticky Sidebar with Category Filters & Support Desk) */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Search Box */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs space-y-2">
            <label className="text-xs font-semibold text-[#142533] block">Search All FAQs</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search topics (e.g. EMD, possession)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs text-[#142533] placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all"
              />
            </div>
          </div>

          {/* Categories Navigation */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-[#142533] uppercase tracking-wider">
                Filter by Topic
              </span>
              {!isLoading && (
                <span className="text-[11px] font-mono text-[#D89B30] font-semibold">
                  {filteredFaqs.length} FAQs
                </span>
              )}
            </div>

            <div className="space-y-1 pt-1">
              {categoryItems.map((cat) => {
                const isActive = activeCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#142533] text-white font-semibold shadow-xs'
                        : 'text-[#475569] hover:bg-[#F8F9FA] hover:text-[#142533]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {isActive && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/20 text-white">
                        {filteredFaqs.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Support Desk Card */}
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#E5E0D5] p-5 space-y-4">
            <div className="flex items-center gap-2 text-[#142533] font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-[#D89B30]" />
              <span>Need Case-Specific Help?</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              If your question concerns a specific DRT notice, court order, or active property file, speak directly with
              our senior advisory desk.
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <a
                href={`tel:${rawPhone}`}
                className="w-full py-2.5 px-3 rounded-xl bg-[#142533] hover:bg-[#203545] text-white font-medium flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Phone className="w-3.5 h-3.5 text-[#D89B30]" />
                <span>Call {primaryPhone}</span>
              </a>

              <a
                href={`https://wa.me/${rawWhatsapp}?text=${encodeURIComponent('Hello, I have a case-specific enquiry regarding bank auction procedures.')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Advisory Desk</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Right Column (Accordion List spanning full width) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Quick controls */}
          <div className="flex items-center justify-between text-xs text-[#64748B] px-1">
            <span>
              {isLoading ? (
                <span>Loading FAQs...</span>
              ) : (
                <span>
                  Showing <strong className="text-[#142533]">{filteredFaqs.length}</strong> questions
                </span>
              )}
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={expandAll}
                disabled={isLoading || filteredFaqs.length === 0}
                className="text-[#142533] hover:text-[#D89B30] font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                Expand All
              </button>
              <span>•</span>
              <button
                onClick={collapseAll}
                disabled={isLoading || filteredFaqs.length === 0}
                className="text-[#64748B] hover:text-[#142533] font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* 1. Loading State */}
          {isLoading && (
            <div className="space-y-3" aria-busy="true" aria-label="Loading FAQs from server">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs animate-pulse space-y-3"
                >
                  <div className="h-3 w-20 bg-slate-200 rounded-md" />
                  <div className="h-5 w-4/5 bg-slate-200 rounded-md" />
                  <div className="h-3 w-1/2 bg-slate-100 rounded-md" />
                </div>
              ))}
            </div>
          )}

          {/* 2. Error State */}
          {!isLoading && error && (
            <div className="bg-red-50/90 rounded-2xl border border-red-200 p-8 sm:p-10 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-1">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#142533]">Unable to Load FAQs</h3>
              <p className="text-xs text-red-700 max-w-md mx-auto leading-relaxed">
                {error}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => loadFaqs(activeCategory)}
                  className="px-5 py-2.5 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Fetching</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Empty State */}
          {!isLoading && !error && filteredFaqs.length === 0 && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 sm:p-12 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-1">
                <HelpCircle className="w-6 h-6" />
              </div>
              <p className="font-serif text-lg font-bold text-[#142533]">No FAQs available.</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {searchQuery.trim()
                  ? 'No questions matched your search query. Try searching with different keywords.'
                  : activeCategory !== 'all'
                  ? `There are currently no frequently asked questions under "${activeCategory}".`
                  : 'There are currently no FAQs published on the portal.'}
              </p>
              {(searchQuery.trim() || activeCategory !== 'all') && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      handleCategoryChange('all');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    View All Topics
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. Loaded FAQ Accordion Cards */}
          {!isLoading && !error && filteredFaqs.length > 0 && (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = openItems.includes(faq.id);

                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden transition-all shadow-xs hover:border-[#D89B30]/50"
                  >
                    <button
                      onClick={() => toggleItem(faq.id)}
                      className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 hover:bg-[#F8F9FA]/60 transition-colors cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <div className="space-y-1.5 flex-1 pr-2">
                        {faq.category && (
                          <span className="inline-block text-[10px] font-mono uppercase font-bold text-[#9A6007] bg-[#FAF1DE] px-2 py-0.5 rounded-md">
                            {faq.category}
                          </span>
                        )}
                        <h3 className="font-serif font-bold text-base sm:text-lg text-[#142533] leading-snug">
                          {faq.question}
                        </h3>
                      </div>

                      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 mt-1 flex-shrink-0">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#475569] leading-relaxed border-t border-[#F1EFEA] animate-in fade-in duration-200">
                        <div className="space-y-3">
                          {/* Answer: supports HTML formatted response or plain text */}
                          {isHtmlString(faq.answer) ? (
                            <div
                              className="prose prose-sm max-w-none text-[#475569] leading-relaxed [&>p]:mb-2.5 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>a]:text-[#D89B30] [&>a]:underline"
                              dangerouslySetInnerHTML={{ __html: faq.answer }}
                            />
                          ) : (
                            <p className="whitespace-pre-line leading-relaxed">{faq.answer}</p>
                          )}

                          {/* Verification status and badge if verified */}
                          {Boolean(faq.is_verified) && (
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 pt-2 border-t border-slate-100">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="capitalize">
                                {faq.verified_text || 'Verified answer'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom CTA Banner */}
      <AuctionCtaBanner onNavigate={onNavigate} className="px-0 sm:px-0 lg:px-0 xl:px-0" />
    </div>
  );
};
