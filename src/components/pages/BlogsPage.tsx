import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BlogPost, BlogPagination, DEFAULT_BLOG_PAGINATION } from '../../data/blogData';
import { useApi } from '../../context/ApiContext';
import {
  BookOpen,
  Clock,
  Calendar,
  ArrowRight,
  User,
  X,
  Search,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Scale,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { PageRoute } from '../Navbar';
import { AuctionCtaBanner } from '../AuctionCtaBanner';
import { BlogCardMedia } from '../BlogCardMedia';
import { BlogVideoModal } from '../BlogVideoModal';

interface BlogsPageProps {
  onNavigate: (page: PageRoute, customUrl?: string) => void;
  onSelectPost?: (post: BlogPost) => void;
}

export const BlogsPage: React.FC<BlogsPageProps> = ({ onNavigate, onSelectPost }) => {
  const { fetchBlogs } = useApi();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<BlogPagination>(DEFAULT_BLOG_PAGINATION);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // YouTube Video Modal State
  const [videoModal, setVideoModal] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: '',
  });

  const handlePlayVideo = (url: string, title?: string) => {
    setVideoModal({
      isOpen: true,
      url,
      title: title || 'YouTube Video Guide',
    });
  };

  // Available categories accumulator - dynamically populated strictly from backend API
  const [allCategories, setAllCategories] = useState<string[]>(['all']);

  // Debounce search query input by 400ms
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(val.trim());
      setCurrentPage(1);
    }, 400);
  };

  // Perform API fetch when filter, search, or page changes (NO featured filter)
  const loadBlogsFromApi = useCallback(
    async (pageToLoad: number = 1) => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const res = await fetchBlogs({
          category: activeCategory !== 'all' ? activeCategory : undefined,
          search: debouncedSearch ? debouncedSearch : undefined,
          page: pageToLoad,
          per_page: 12,
        });

        if (res.success) {
          setPosts(res.blogs);
          setPagination(res.pagination);

          // Dynamically harvest distinct categories returned from backend panel
          if (res.blogs.length > 0) {
            const dynamicCategories = Array.from(
              new Set(
                res.blogs
                  .map((b) => b.category?.trim())
                  .filter((cat): cat is string => Boolean(cat && cat.toLowerCase() !== 'all'))
              )
            );
            setAllCategories(['all', ...dynamicCategories]);
          }
        } else {
          setErrorMessage(res.message || 'Unable to retrieve blogs from the server.');
          setPosts([]);
          setPagination(DEFAULT_BLOG_PAGINATION);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Network error loading blogs.';
        setErrorMessage(msg);
        setPosts([]);
        setPagination(DEFAULT_BLOG_PAGINATION);
      } finally {
        setIsLoading(false);
      }
    },
    [activeCategory, debouncedSearch, fetchBlogs]
  );

  // Trigger load whenever filters change or active page changes
  useEffect(() => {
    loadBlogsFromApi(currentPage);
  }, [loadBlogsFromApi, currentPage]);

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  };

  const handlePostClick = (post: BlogPost) => {
    if (onSelectPost) {
      onSelectPost(post);
    } else {
      setSelectedPost(post);
    }
  };

  const featuredPost = posts.find((p) => p.is_featured) || posts[0];
  const regularPosts = posts.length > 1 ? posts.filter((p) => p.id !== featuredPost?.id) : [];

  return (
    <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-6 sm:py-10 space-y-8 pb-10">
      {/* 1. Header Banner with Prestigious Editorial Identity */}
      <div className="bg-[#142533] text-white rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden border border-white/10 shadow-xl group">
        {/* Subtle Architectural Texture Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-luminosity pointer-events-none transition-transform duration-700 group-hover:scale-105"
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
              <BookOpen className="w-4 h-4 text-[#D89B30]" />
              <span>EXPERT KNOWLEDGE BASE &amp; ADVISORY INSIGHTS</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Bank Auction Guides &amp; Market Insights
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              In-depth legal analysis of the SARFAESI Act 2002, IBC liquidation rules, pre-bid legal due diligence, title
              search protocols, and securing registered physical possession in India.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D89B30]" />
                <span>30-Yr Title Search</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                <Scale className="w-3.5 h-3.5 text-[#D89B30]" />
                <span>Sec 14 DM Orders</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                <FileText className="w-3.5 h-3.5 text-[#D89B30]" />
                <span>IBC Clean Slates</span>
              </span>
            </div>
          </div>

          {/* Right Column: Featured Guide Spotlight Card (if blog loaded) */}
          <div className="lg:col-span-5">
            {featuredPost ? (
              <div
                onClick={() => handlePostClick(featuredPost)}
                className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xl transition-all cursor-pointer group/card block"
              >
                <BlogCardMedia
                  post={featuredPost}
                  onPlayVideo={handlePlayVideo}
                  className="relative rounded-xl overflow-hidden aspect-[16/9] mb-3.5 bg-slate-900"
                />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-300 font-mono">
                    <span className="text-[#D89B30] font-semibold uppercase">{featuredPost.category}</span>
                    <span>·</span>
                    <span>{featuredPost.readTime}</span>
                    <span>·</span>
                    <span className="text-slate-400">{featuredPost.date}</span>
                  </div>
                  <h3 className="font-serif font-bold text-white text-base sm:text-lg line-clamp-2 group-hover/card:text-[#D89B30] transition-colors leading-snug">
                    {featuredPost.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs text-[#D89B30] font-semibold border-t border-white/10">
                    <span className="flex items-center gap-1">
                      <span>Read Advisory Guide</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/card:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">{featuredPost.author}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center text-slate-300 space-y-3">
                <BookOpen className="w-8 h-8 text-[#D89B30] mx-auto opacity-75" />
                <p className="text-sm font-medium">Bank Auction Advisory Dossier</p>
                <p className="text-xs text-slate-400">Curated legal guides updated directly from our advisory desk.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Controls Bar (Category Filter Tabs + Search - "Featured Only" REMOVED) */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Tabs (Segmented Navigation) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#142533] text-white shadow-xs'
                  : 'bg-[#F8F9FA] text-[#64748B] hover:text-[#142533] hover:bg-[#F1EFEA]'
              }`}
            >
              {cat === 'all' ? 'All Articles' : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] sm:min-w-[320px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search guides (e.g. SARFAESI, EMD, IBC)..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-9 py-2 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#142533] placeholder-[#94A3B8] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setDebouncedSearch('');
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Loading Skeletons */}
      {isLoading && (
        <div className="space-y-6 animate-pulse">
          {/* Top Story Skeleton */}
          <div className="h-64 sm:h-80 bg-white rounded-3xl border border-slate-200" />
          {/* Grid Skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 h-96 flex flex-col overflow-hidden">
                <div className="aspect-[16/10] bg-slate-100" />
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                    <div className="h-5 bg-slate-200 rounded w-4/5" />
                    <div className="h-3 bg-slate-200 rounded w-full" />
                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                  </div>
                  <div className="h-4 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Error State */}
      {!isLoading && errorMessage && (
        <div className="bg-white rounded-3xl border border-rose-200 p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-slate-900">Failed to Load Articles</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{errorMessage}</p>
          <button
            onClick={() => loadBlogsFromApi(currentPage)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* 5. Main Content: Magazine Lead Story & 3-Column Editorial Grid */}
      {!isLoading && !errorMessage && posts.length > 0 && (
        <div className="space-y-8">
          {/* Featured Top Story (Lead Article) */}
          {featuredPost && (
            <article
              onClick={() => handlePostClick(featuredPost)}
              className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden hover:border-[#D89B30]/60 hover:shadow-xl transition-all cursor-pointer grid grid-cols-1 lg:grid-cols-12 group"
            >
              {Boolean(featuredPost.cover_image || featuredPost.youtube_url) && (
                <div className="lg:col-span-7 h-64 sm:h-80 lg:h-auto min-h-[280px] relative overflow-hidden bg-slate-900">
                  <BlogCardMedia
                    post={featuredPost}
                    onPlayVideo={handlePlayVideo}
                    className="w-full h-full min-h-[280px] relative overflow-hidden bg-slate-900"
                  />
                </div>
              )}

              <div
                className={`${
                  Boolean(featuredPost.cover_image || featuredPost.youtube_url) ? 'lg:col-span-5' : 'lg:col-span-12'
                } p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6`}
              >
                <div className="space-y-4">
                  {/* Clean unboxed metadata with middle dots */}
                  <div className="flex items-center gap-2 text-xs text-[#64748B]">
                    <span className="text-[#9A6007] font-bold font-mono uppercase tracking-wider">
                      {featuredPost.category}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-[#D89B30]" />
                      {featuredPost.readTime}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-400">{featuredPost.date}</span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#142533] group-hover:text-[#D89B30] transition-colors leading-snug">
                    {featuredPost.title}
                  </h2>

                  <p className="text-sm text-[#475569] leading-relaxed line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F1EFEA] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#142533] text-[#D89B30] font-bold text-xs flex items-center justify-center">
                      {featuredPost.author.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#142533] block">{featuredPost.author}</span>
                      <span className="text-[10px] text-slate-400">Advisory Desk</span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-[#142533] group-hover:text-[#D89B30] flex items-center gap-1.5 transition-colors">
                    <span>Read Guide</span>
                    <ArrowRight className="w-4 h-4 text-[#D89B30] group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </article>
          )}

          {/* Full 3-Column Grid of Regular Posts */}
          {regularPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => handlePostClick(post)}
                  className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:border-[#D89B30]/60 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                >
                  {/* Blog Image & Video Media */}
                  <BlogCardMedia
                    post={post}
                    onPlayVideo={handlePlayVideo}
                    className="aspect-[16/10] w-full overflow-hidden relative bg-slate-900 shrink-0"
                  />

                  {/* Content Body */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      {/* Unboxed Metadata Header */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#9A6007] font-bold font-mono text-[11px] uppercase tracking-wider">
                          {post.category}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                          <Clock className="w-3 h-3 text-[#D89B30]" />
                          {post.readTime}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] text-slate-400">{post.date}</span>
                      </div>

                      <h3 className="font-serif font-bold text-base sm:text-lg text-[#142533] group-hover:text-[#D89B30] transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#475569] leading-relaxed line-clamp-2 sm:line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-3.5 border-t border-[#F1EFEA] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-[#142533] font-bold text-[10px] flex items-center justify-center border border-slate-200">
                          {post.author.charAt(0)}
                        </div>
                        <span className="text-[#64748B] text-xs font-medium truncate max-w-[150px]">
                          {post.author}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-[#142533] group-hover:text-[#D89B30] flex items-center gap-1 transition-colors">
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#D89B30] group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* 6. Dynamic Pagination Controls */}
          {pagination.last_page > 1 && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="text-xs text-slate-500 font-mono">
                Showing Page <strong className="text-[#142533]">{pagination.current_page}</strong> of{' '}
                <strong className="text-[#142533]">{pagination.last_page}</strong> ({pagination.total} articles)
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#142533] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                    .filter((page) => {
                      if (pagination.last_page <= 7) return true;
                      if (page === 1 || page === pagination.last_page) return true;
                      return Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, idx, arr) => (
                      <React.Fragment key={page}>
                        {idx > 0 && page - arr[idx - 1] > 1 && (
                          <span className="px-2 text-slate-400 text-xs font-mono">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 rounded-xl text-xs font-mono font-semibold transition-colors cursor-pointer ${
                            currentPage === page
                              ? 'bg-[#142533] text-white shadow-xs'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.last_page}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#142533] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. Empty State (No posts match category or search) */}
      {!isLoading && !errorMessage && posts.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto shadow-xs">
          <BookOpen className="w-12 h-12 text-[#D89B30] mx-auto opacity-75" />
          <h3 className="font-serif text-xl font-bold text-[#142533]">No Articles Found</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {searchQuery || activeCategory !== 'all'
              ? 'No guides match your active search or category selection. Try resetting filters to explore all topics.'
              : 'Our legal and research teams are currently finalizing new auction dossiers. Check back shortly.'}
          </p>
          {(searchQuery || activeCategory !== 'all') && (
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
                setDebouncedSearch('');
                setCurrentPage(1);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      )}

      {/* 8. Bottom Auction CTA Banner */}
      <AuctionCtaBanner onNavigate={onNavigate} />

      {/* YouTube Video Modal Player */}
      <BlogVideoModal
        isOpen={videoModal.isOpen}
        onClose={() => setVideoModal((prev) => ({ ...prev, isOpen: false }))}
        videoUrl={videoModal.url}
        title={videoModal.title}
      />
    </div>
  );
};
