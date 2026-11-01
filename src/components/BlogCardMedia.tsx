import React, { useState } from 'react';
import { BlogPost } from '../data/blogData';
import { getYouTubeThumbnailUrl } from '../utils/videoUtils';
import { Play, Video, BookOpen, ShieldCheck } from 'lucide-react';

interface BlogCardMediaProps {
  post: BlogPost;
  onPlayVideo?: (videoUrl: string, title?: string) => void;
  className?: string;
  imageClassName?: string;
  categoryBadge?: React.ReactNode;
  featuredBadge?: React.ReactNode;
  priority?: boolean;
}

export const BlogCardMedia: React.FC<BlogCardMediaProps> = ({
  post,
  onPlayVideo,
  className = 'aspect-[16/10] w-full overflow-hidden relative bg-slate-900',
  imageClassName = 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-500',
  categoryBadge,
  featuredBadge,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  // 1. Check for available cover_image and youtube_url
  const hasCoverImage = Boolean(post.cover_image && post.cover_image.trim());
  const youtubeUrl = post.youtube_url?.trim() || post.video_url?.trim() || null;

  // 2. If neither cover_image nor youtube_url exists, return styled fallback
  if (!hasCoverImage && !youtubeUrl) {
    return (
      <div className={`relative ${className} select-none bg-gradient-to-br from-[#142533] via-[#1b3245] to-[#0d1a24] flex items-center justify-center p-6 text-center border-b border-white/5`}>
        <div className="space-y-2 max-w-xs">
          <div className="w-10 h-10 rounded-full bg-white/10 text-[#D89B30] flex items-center justify-center mx-auto border border-white/10 shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#D89B30] block font-semibold">
            {post.category || 'Auction Guide'}
          </span>
          <p className="font-serif text-white/90 text-xs sm:text-sm line-clamp-2 leading-snug">
            {post.title}
          </p>
        </div>
        {categoryBadge}
      </div>
    );
  }

  // 3. Thumbnail Resolution
  let thumbnailSrc = '';
  if (hasCoverImage && !imageFailed) {
    thumbnailSrc = post.cover_image.trim();
  } else if (youtubeUrl) {
    thumbnailSrc = getYouTubeThumbnailUrl(youtubeUrl) || '';
  }

  const handlePlayClick = (e: React.MouseEvent) => {
    if (youtubeUrl && onPlayVideo) {
      e.stopPropagation();
      e.preventDefault();
      onPlayVideo(youtubeUrl, post.title);
    }
  };

  return (
    <div className={`relative ${className} select-none group/media`}>
      {thumbnailSrc && !imageFailed ? (
        <img
          src={thumbnailSrc}
          alt={post.title}
          className={imageClassName}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#142533] via-[#1a3348] to-[#0c1822] flex items-center justify-center p-6 text-center">
          <div className="space-y-2">
            <div className="w-11 h-11 rounded-full bg-white/10 text-[#D89B30] flex items-center justify-center mx-auto border border-white/15">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#D89B30] block">
              {post.category}
            </span>
          </div>
        </div>
      )}

      {/* Subtle Bottom Scrim for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

      {/* Optional badges if provided */}
      {categoryBadge}
      {featuredBadge}

      {/* Video Indicator & Interactive Play Button */}
      {youtubeUrl && (
        <>
          {/* Subtle YouTube Tag on Top Right */}
          <div className="absolute top-3 right-3 z-10 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[10px] font-mono font-semibold border border-white/20 shadow-md">
            <Video className="w-3 h-3 text-red-500" />
            <span>Video Guide</span>
          </div>

          {/* Centered Play Button */}
          <div
            onClick={handlePlayClick}
            className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer group/play"
            title={`Watch video: ${post.title}`}
            role="button"
            aria-label={`Play YouTube video for ${post.title}`}
          >
            {/* Soft Ambient Glow Halo on hover */}
            <div className="absolute w-16 h-16 rounded-full bg-red-600/30 group-hover/play:scale-125 group-hover/play:bg-red-600/50 transition-all duration-300 pointer-events-none" />

            {/* Iconic YouTube Red Button */}
            <div className="relative w-12 h-8 sm:w-14 sm:h-9 rounded-xl bg-[#FF0000] group-hover/play:bg-[#E60000] text-white flex items-center justify-center shadow-xl group-hover/play:scale-110 transition-transform duration-300 border border-white/20">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white ml-0.5" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
