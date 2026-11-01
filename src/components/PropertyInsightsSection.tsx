import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { BlogPost } from '../data/blogData';
import { PageRoute } from './Navbar';
import { BookOpen, Clock, ArrowRight, Calendar } from 'lucide-react';
import { BlogCardMedia } from './BlogCardMedia';
import { BlogVideoModal } from './BlogVideoModal';

interface PropertyInsightsSectionProps {
  onNavigate: (page: PageRoute, customUrl?: string) => void;
  onSelectBlog?: (post: BlogPost) => void;
}

export const PropertyInsightsSection: React.FC<PropertyInsightsSectionProps> = ({
  onNavigate,
  onSelectBlog,
}) => {
  const { blogs } = useApi();

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

  // Pick top 3 blogs
  const displayBlogs = (blogs || []).slice(0, 3);

  // If no blogs returned by API, do not display broken cards or large whitespace
  if (displayBlogs.length === 0) {
    return null;
  }

  const handleBlogClick = (post: BlogPost) => {
    if (onSelectBlog) {
      onSelectBlog(post);
    } else {
      const slug = post.slug || String(post.id);
      onNavigate('blog-detail', `/blog/${slug}`);
    }
  };

  return (
    <section
      className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-8 sm:py-12 space-y-6"
      aria-label="Property Insights & Market Guides"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#9A6007]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>PROPERTY INSIGHTS &amp; MARKET ADVISORY</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#142533]">
            Expert Guides, SARFAESI Law &amp; Auction Insights
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Navigate distressed asset acquisitions with empirical research, sub-registrar protocols, and due diligence frameworks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('blogs', '/blogs')}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-[#142533] text-white text-xs sm:text-sm font-semibold hover:bg-[#203545] transition-colors flex items-center gap-2 shadow-xs shrink-0 cursor-pointer"
        >
          <span>View All Guides &amp; Insights</span>
          <ArrowRight className="w-4 h-4 text-[#D89B30]" />
        </button>
      </div>

      {/* 3-Column Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {displayBlogs.map((post) => (
          <article
            key={post.id}
            onClick={() => handleBlogClick(post)}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-[#D89B30]/70 hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer group"
          >
            {/* Blog Image & Video Media (omitted if neither cover_image nor youtube_url exists) */}
            <BlogCardMedia
              post={post}
              onPlayVideo={handlePlayVideo}
              className="h-44 sm:h-48 w-full overflow-hidden relative bg-slate-900 shrink-0"
              categoryBadge={
                <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-[#142533]/85 text-[#D89B30] text-[10px] font-mono font-bold tracking-wide backdrop-blur-xs">
                  {post.category || 'Advisory Guide'}
                </span>
              }
              featuredBadge={
                post.is_featured ? (
                  <span className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-md bg-[#D89B30] text-[#142533] text-[9px] font-mono font-extrabold uppercase shadow-sm">
                    Featured
                  </span>
                ) : undefined
              }
            />

            {/* Body */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-[11px] text-[#64748B] font-mono">
                  {post.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#D89B30]" />
                      <span>{post.date}</span>
                    </span>
                  )}
                  {post.date && post.readTime && <span>•</span>}
                  {post.readTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#D89B30]" />
                      <span>{post.readTime}</span>
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-lg font-bold text-[#142533] group-hover:text-[#9A6007] transition-colors leading-snug line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-xs text-[#475569] leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              </div>

              {/* Card Footer with Read More CTA */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-[#142533] font-bold text-[10px] flex items-center justify-center font-mono">
                    {post.author ? post.author.charAt(0) : 'A'}
                  </div>
                  <span className="text-[11px] font-medium text-slate-600 truncate max-w-[120px]">
                    {post.author || 'Advisory Team'}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#142533] group-hover:text-[#9A6007] transition-colors">
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D89B30] group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* YouTube Video Modal Player */}
      <BlogVideoModal
        isOpen={videoModal.isOpen}
        onClose={() => setVideoModal((prev) => ({ ...prev, isOpen: false }))}
        videoUrl={videoModal.url}
        title={videoModal.title}
      />
    </section>
  );
};
