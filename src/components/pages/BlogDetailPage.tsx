import React, { useState, useEffect } from 'react';
import { BlogPost } from '../../data/blogData';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  Phone,
  FileText,
  Building,
  ArrowRight,
  MessageSquare,
  Home,
  ChevronRight,
  BookOpen,
  AlertCircle,
  RefreshCw,
  Play,
  Video,
  ExternalLink,
  Maximize2,
  Share2,
  Copy,
  Check,
  Scale,
  Gavel,
} from 'lucide-react';
import { PageRoute } from '../Navbar';
import { getShareableUrl } from '../../utils/routes';
import { AuctionCtaBanner } from '../AuctionCtaBanner';
import { useApi } from '../../context/ApiContext';
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl, getYouTubeWatchUrl } from '../../utils/videoUtils';
import { BlogCardMedia } from '../BlogCardMedia';
import { BlogVideoModal } from '../BlogVideoModal';

interface BlogDetailPageProps {
  post?: BlogPost | null;
  slug?: string;
  onBack: () => void;
  onSelectRelatedPost: (post: BlogPost) => void;
  onNavigate: (page: PageRoute, customUrl?: string) => void;
}

export const BlogDetailPage: React.FC<BlogDetailPageProps> = ({
  post: initialPost,
  slug: initialSlug,
  onBack,
  onSelectRelatedPost,
  onNavigate,
}) => {
  const { fetchBlogDetail, blogs: contextBlogs, settings } = useApi();

  const [activePost, setActivePost] = useState<BlogPost | null>(initialPost || null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(!initialPost);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // In-place YouTube video playback & modal state
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
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

  // Derive target slug
  const targetSlug =
    initialSlug ||
    initialPost?.slug ||
    (initialPost ? String(initialPost.id) : '') ||
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/blog/')
      ? window.location.pathname.replace('/blog/', '')
      : '');

  // Fetch full single blog & related blogs dynamically from Laravel API
  useEffect(() => {
    if (!targetSlug) return;

    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    fetchBlogDetail(targetSlug)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.blog) {
          setActivePost(res.blog);

          // Update SEO Title & Description
          if (res.blog.seo_title) {
            document.title = res.blog.seo_title;
          } else if (res.blog.title) {
            document.title = `${res.blog.title} | Auctions & More`;
          }

          if (res.blog.seo_description) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
              metaDesc.setAttribute('content', res.blog.seo_description);
            }
          }

          // Use API's related_blogs or fallback to context blogs excluding current
          if (res.related_blogs && res.related_blogs.length > 0) {
            setRelatedPosts(res.related_blogs.slice(0, 3));
          } else {
            const fallbackRelated = contextBlogs
              .filter((b) => (b.slug || String(b.id)) !== targetSlug)
              .slice(0, 3);
            setRelatedPosts(fallbackRelated);
          }
        } else {
          // If initial post exists, keep it as fallback, else show error
          if (!initialPost) {
            setErrorMessage(res.message || 'The requested article could not be found.');
          }
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Network error loading article.';
        if (!initialPost) {
          setErrorMessage(msg);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [targetSlug, fetchBlogDetail, initialPost, contextBlogs]);

  const post = activePost || initialPost;

  const getArticleShareUrl = () => {
    const slugOrId = post ? post.slug || String(post.id) : targetSlug || '';
    return slugOrId ? getShareableUrl('blog-detail', slugOrId) : getShareableUrl('blogs');
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(getArticleShareUrl());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    if (!post) return;
    const url = getArticleShareUrl();
    const text = encodeURIComponent(`Read this bank auction advisory guide: "${post.title}"\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // 1. Loading Skeleton
  if (isLoading && !post) {
    return (
      <div className="w-full min-h-[600px] max-w-[1100px] mx-auto p-6 sm:p-12 space-y-8 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/4" />
        <div className="space-y-4">
          <div className="h-10 sm:h-14 bg-slate-200 rounded w-5/6" />
          <div className="h-5 bg-slate-200 rounded w-2/3" />
        </div>
        <div className="aspect-[16/9] bg-slate-200 rounded-3xl w-full" />
        <div className="space-y-4 pt-6">
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-11/12" />
          <div className="h-4 bg-slate-200 rounded w-4/5" />
        </div>
      </div>
    );
  }

  // 2. Error / Not Found State
  if (!post) {
    return (
      <div className="w-full min-h-[500px] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-8 sm:p-12 max-w-lg text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-[#D89B30] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#142533]">Article Not Found</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {errorMessage || 'The advisory guide you are looking for does not exist or has been archived.'}
          </p>
          <div className="pt-2">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#D89B30]" />
              <span>Return to All Articles</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if content contains HTML tags
  const isHtmlContent = /<[a-z][\s\S]*>/i.test(post.content);

  // Check visual media & YouTube support
  const hasCoverImage = Boolean(post.cover_image && post.cover_image.trim());
  const youtubeUrl = post.youtube_url?.trim() || post.video_url?.trim() || null;
  const hasMedia = hasCoverImage || Boolean(youtubeUrl);
  const thumbnailSrc = hasCoverImage
    ? post.cover_image.trim()
    : youtubeUrl
    ? getYouTubeThumbnailUrl(youtubeUrl) || ''
    : '';
  const embedUrl = youtubeUrl ? getYouTubeEmbedUrl(youtubeUrl) : null;
  const watchUrl = youtubeUrl ? getYouTubeWatchUrl(youtubeUrl) : null;

  return (
    <article className="w-full flex flex-col bg-[#FBF9F5]">
      {/* 1. Refined Minimalist Breadcrumb Bar */}
      <nav
        aria-label="Breadcrumb"
        className="w-full bg-white border-b border-[#E2E8F0] py-3 text-xs text-slate-500 shadow-2xs"
      >
        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 flex items-center justify-between gap-4">
          {/* Breadcrumb Trail */}
          <ol className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            <li>
              <button
                onClick={() => onNavigate('home')}
                className="hover:text-[#142533] transition-colors flex items-center gap-1 cursor-pointer font-medium"
              >
                <Home className="w-3.5 h-3.5 text-slate-400" />
                <span>Home</span>
              </button>
            </li>
            <li className="text-slate-300" aria-hidden="true">
              <ChevronRight className="w-3 h-3" />
            </li>
            <li>
              <button
                onClick={onBack}
                className="hover:text-[#142533] transition-colors cursor-pointer font-medium"
              >
                Guides &amp; Insights
              </button>
            </li>
            <li className="text-slate-300" aria-hidden="true">
              <ChevronRight className="w-3 h-3" />
            </li>
            <li>
              <span className="text-[#9A6007] font-semibold uppercase tracking-wider text-[11px] font-mono">
                {post.category}
              </span>
            </li>
          </ol>

          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#D89B30] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#D89B30]" />
            <span>All Articles</span>
          </button>
        </div>
      </nav>

      {/* 2. Prestigious Editorial Header (Light, High-Legibility Canvas) */}
      <header className="w-full bg-white border-b border-[#E2E8F0] py-8 sm:py-12 lg:py-14">
        <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-8 space-y-6">
          {/* Unboxed Metadata Kicker */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="text-[#9A6007] font-bold font-mono uppercase tracking-wider">
              {post.category}
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1 text-slate-600 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-[#D89B30]" />
              {post.readTime}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 flex items-center gap-1 text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {post.date}
            </span>
            {youtubeUrl && (
              <>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1 text-red-600 font-mono font-semibold text-[11px]">
                  <Video className="w-3.5 h-3.5 text-red-500" />
                  <span>Includes Video Guide</span>
                </span>
              </>
            )}
          </div>

          {/* Noble Serif Headline */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#142533] tracking-tight leading-[1.2] text-balance">
            {post.title}
          </h1>

          {/* Subtitle / Excerpt Dek */}
          {post.excerpt && (
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 font-normal leading-relaxed max-w-3xl pt-1">
              {post.excerpt}
            </p>
          )}

          {/* Author Byline & Social Share Toolbar */}
          <div className="pt-6 border-t border-[#F1EFEA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Author Identification */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#142533] text-[#D89B30] font-serif font-bold text-sm flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs">
                {(post.author_name || post.author).slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#142533]">{post.author_name || post.author}</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FAF1DE] text-[#9A6007] font-semibold">
                    <ShieldCheck className="w-3 h-3 text-[#D89B30]" />
                    <span>Verified Legal Desk</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {post.author_designation ? `${post.author_designation} · ` : ''}
                  {post.author_company || 'Auctions & More Advisory Counsel'}
                </p>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Share via WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copy Article Link"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Hero Visual Media (Cover Photo or Inline Video Player) */}
      {hasMedia && (
        <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-8 -mt-6 sm:-mt-8 z-10">
          <div className="rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-xl bg-slate-900 aspect-[16/9] relative group">
            {isPlayingVideo && embedUrl ? (
              <div className="relative w-full h-full bg-black">
                <iframe
                  src={`${embedUrl}&autoplay=1`}
                  title={post.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
                <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePlayVideo(youtubeUrl!, post.title)}
                    className="p-2 rounded-xl bg-black/80 hover:bg-black text-white text-xs flex items-center gap-1 shadow-md transition-all cursor-pointer backdrop-blur-xs"
                    title="Open in full screen modal"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  {watchUrl && (
                    <a
                      href={watchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs flex items-center gap-1 shadow-md transition-all"
                      title="Open directly on YouTube"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <>
                <img
                  src={thumbnailSrc}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#142533]/85 via-transparent to-black/25 pointer-events-none" />

                {/* YouTube Video Overlay & Centered Play Button */}
                {youtubeUrl && (
                  <>
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-mono font-bold border border-white/20 shadow-md pointer-events-none">
                      <Video className="w-3.5 h-3.5 text-red-500" />
                      <span>YouTube Video Guide</span>
                    </div>

                    <div
                      onClick={() => setIsPlayingVideo(true)}
                      className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 text-center cursor-pointer group/play"
                      title="Click to play video guide"
                      role="button"
                      aria-label={`Play YouTube video for ${post.title}`}
                    >
                      <div className="relative mb-2 flex items-center justify-center">
                        <div className="absolute w-20 h-20 rounded-full bg-red-600/30 group-hover/play:scale-125 group-hover/play:bg-red-600/50 transition-all duration-300" />
                        <div className="relative w-16 h-11 sm:w-20 sm:h-14 rounded-2xl bg-[#FF0000] group-hover/play:bg-[#E60000] text-white flex items-center justify-center shadow-2xl group-hover/play:scale-110 transition-transform duration-300 border border-white/20">
                          <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white text-white ml-0.5" />
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white font-bold text-xs border border-white/20 shadow-lg group-hover/play:border-red-500/80 transition-colors">
                        <span>Click to Watch Video Guide</span>
                      </span>
                    </div>
                  </>
                )}

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-white bg-[#142533]/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 shadow-lg pointer-events-none">
                  <span className="flex items-center gap-2 text-[#D89B30] font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Statutory Mandate Dossier · Auctions &amp; More</span>
                  </span>
                  <span className="text-slate-300 font-medium">{post.readTime}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 4. Main Article Content & Advisory Sidebar */}
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Main Article Body (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Executive Diligence Takeaways Box */}
            <div className="bg-[#FAF8F5] border-l-4 border-[#D89B30] border-y border-r border-[#E5E0D5] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#9A6007]">
                <ShieldCheck className="w-4 h-4 text-[#D89B30]" />
                <span>EXECUTIVE DILIGENCE SUMMARY</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#142533]">
                Critical Takeaways for Auction Bidders
              </h3>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 text-sm text-[#334155]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Bank auction acquisitions are protected by central statutes (SARFAESI Act 2002 &amp; IBC 2016),
                    providing legal priority over subsequent or unpledged claims.
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm text-[#334155]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Demand an independent 30-year sub-registrar encumbrance search and Section 14 CMM/DM physical
                    possession order confirmation before depositing 10% EMD.
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm text-[#334155]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    The statutory Rule 9 Sale Certificate issued by the Authorized Officer confers indefeasible legal title
                    with delivery of physical keys.
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Body Paragraphs or HTML Content */}
            <div className="space-y-6 text-base sm:text-lg text-slate-800 leading-[1.8] font-normal">
              {isHtmlContent ? (
                <div
                  className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-[#142533] prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:font-bold prose-h2:pt-4 prose-h2:pb-2 prose-h3:text-xl prose-h3:font-bold prose-p:text-slate-700 prose-p:leading-[1.8] prose-li:text-slate-700 prose-blockquote:border-l-4 prose-blockquote:border-[#D89B30] prose-blockquote:bg-[#FAF8F5] prose-blockquote:p-6 prose-blockquote:rounded-r-2xl prose-blockquote:font-serif prose-blockquote:italic"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              ) : (
                post.content
                  .split('\n\n')
                  .filter(Boolean)
                  .map((para, idx) => (
                    <div key={idx} className="space-y-6">
                      <p className="leading-[1.8] text-slate-700">{para}</p>
                      {idx === 1 && (
                        <blockquote className="p-6 sm:p-8 rounded-2xl bg-[#142533] text-white border-l-4 border-[#D89B30] my-8 shadow-sm space-y-2">
                          <p className="font-serif italic text-base sm:text-lg leading-relaxed text-slate-100">
                            "A disciplined bidder does not guess market prices on auction day. Success is 90% pre-bid title
                            verification, and 10% disciplined bidding on the portal."
                          </p>
                          <span className="block not-italic text-xs font-mono font-bold text-[#D89B30] pt-1">
                            — Auctions &amp; More Advisory Protocol
                          </span>
                        </blockquote>
                      )}
                    </div>
                  ))
              )}
            </div>

            {/* Pre-Bid Verification Protocol Checklist */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#9A6007] uppercase tracking-wider">
                <FileText className="w-4 h-4 text-[#D89B30]" />
                <span>PRE-BID VERIFICATION PROTOCOL</span>
              </div>
              <h4 className="font-serif text-lg sm:text-xl font-bold text-[#142533]">
                Standard 5-Point Diligence Checklist Before Tendering EMD
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs sm:text-sm text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>30-Year Non-Encumbrance Certificate (NEC)</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs sm:text-sm text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>CMM/DM Physical Eviction Order Verification</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs sm:text-sm text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Municipal Property Tax &amp; Water Dues Clearance</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs sm:text-sm text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Society Maintenance &amp; Electricity Meter Arrears</span>
                </div>
              </div>
            </div>

            {/* Share & Feedback Bar at Article Bottom */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h5 className="font-bold text-sm text-[#142533]">Found this guide helpful?</h5>
                <p className="text-xs text-slate-500">Share it with your business partners or fellow auction bidders.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Share on WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied Link' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Sticky Advisory Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Card 1: Confidential Legal Advisory Consultation */}
            <div className="bg-[#142533] text-white rounded-3xl p-6 sm:p-8 space-y-5 border border-white/10 shadow-xl relative overflow-hidden group">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#142533] via-[#142533]/90 to-[#142533]/95" />

              <div className="relative z-10 space-y-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#D89B30] text-[11px] font-mono font-bold tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D89B30]" />
                  <span>LEGAL DUE DILIGENCE DESK</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-snug">
                  Found an Auction Property You Want to Bid On?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Our empaneled advocates examine court stay risks, outstanding statutory arrears, and Section 14
                  possession status before you tender EMD.
                </p>
              </div>

              <div className="relative z-10 space-y-2.5 pt-2">
                <a
                  href={`tel:${settings.primary_phone}`}
                  className="w-full py-3 px-4 rounded-xl bg-[#D89B30] hover:bg-[#C58920] text-[#142533] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Legal Desk: {settings.primary_phone}</span>
                </a>

                <a
                  href={`https://wa.me/${(settings.whatsapp_number || settings.primary_phone || '919899897647').replace(/[^0-9]/g, '')}?text=Hi%20Auctions%20%26%20More%2C%20I%20need%20legal%20guidance%20on%20a%20bank%20auction%20after%20reading%20"${encodeURIComponent(post.title)}".`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Legal Desk</span>
                </a>
              </div>
            </div>

            {/* Card 2: Live Property Quick Link */}
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#9A6007]">
                <Building className="w-4 h-4 text-[#D89B30]" />
                <span>INVENTORY SPOTLIGHT</span>
              </div>
              <h4 className="font-serif text-lg font-bold text-[#142533]">
                Looking for Verified Bank Auction Assets?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Explore handpicked commercial, industrial, and luxury residential properties across Delhi NCR, Mumbai, and
                Bengaluru.
              </p>
              <button
                onClick={() => onNavigate('property')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Browse Live Auctions</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D89B30]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Dynamic Related Articles Section */}
      {relatedPosts.length > 0 && (
        <section className="w-full bg-white border-t border-[#E2E8F0] py-12 sm:py-16">
          <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#9A6007] block mb-1">
                  FURTHER ADVISORY DOSSIERS
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#142533]">
                  Related Guides &amp; Insights
                </h3>
              </div>
              <button
                onClick={onBack}
                className="text-xs sm:text-sm font-semibold text-[#D89B30] hover:text-[#9A6007] flex items-center gap-1 cursor-pointer"
              >
                <span>All Articles</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rel) => (
                <article
                  key={rel.id}
                  onClick={() => {
                    setIsPlayingVideo(false);
                    onSelectRelatedPost(rel);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:border-[#D89B30]/60 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                >
                  <BlogCardMedia
                    post={rel}
                    onPlayVideo={handlePlayVideo}
                    className="aspect-[16/10] relative overflow-hidden bg-slate-900 shrink-0"
                  />

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                        <span className="text-[#9A6007] font-bold uppercase">{rel.category}</span>
                        <span>·</span>
                        <span>{rel.readTime}</span>
                      </div>
                      <h4 className="font-serif font-bold text-base text-[#142533] group-hover:text-[#D89B30] transition-colors line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {rel.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-[#142533] group-hover:text-[#D89B30] pt-3 border-t border-slate-100 transition-colors">
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#D89B30]" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Bottom CTA Banner */}
      <AuctionCtaBanner onNavigate={onNavigate} />

      {/* YouTube Video Modal Player */}
      <BlogVideoModal
        isOpen={videoModal.isOpen}
        onClose={() => setVideoModal((prev) => ({ ...prev, isOpen: false }))}
        videoUrl={videoModal.url}
        title={videoModal.title}
      />
    </article>
  );
};
