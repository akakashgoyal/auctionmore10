import React, { useState } from 'react';
import { PropertyVideo } from '../types';
import {
  extractYouTubeId,
  getYouTubeThumbnailUrl,
  getYouTubeWatchUrl,
} from '../utils/videoUtils';
import { Video, Play, ExternalLink } from 'lucide-react';

interface PropertyVideoPlayerProps {
  videos: PropertyVideo[];
  propertyTitle?: string;
  className?: string;
}

export const PropertyVideoPlayer: React.FC<PropertyVideoPlayerProps> = ({
  videos,
  propertyTitle,
  className = '',
}) => {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  if (!videos || videos.length === 0) {
    return null;
  }

  const activeVideo = videos[activeVideoIndex] || videos[0];
  const rawVideoUrl = activeVideo.video_url || activeVideo.video_path || '';
  const externalYouTubeUrl = getYouTubeWatchUrl(rawVideoUrl);
  const youtubeId = extractYouTubeId(rawVideoUrl);
  const thumbnailUrl = youtubeId ? getYouTubeThumbnailUrl(rawVideoUrl) : null;

  const currentTitle =
    activeVideo.video_title?.trim() ||
    (videos.length > 1
      ? `Property Video Tour #${activeVideoIndex + 1}`
      : 'On-Site Property Walkthrough & Inspection');

  return (
    <div
      className={`rounded-3xl border border-[#E2DDD2] bg-white overflow-hidden shadow-xs space-y-0 ${className}`}
      id="property-video-tour"
    >
      {/* Video Section Header */}
      <div className="p-4 sm:p-5 border-b border-[#E8E2D5] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Play className="w-5 h-5 fill-white text-white ml-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Video className="w-3 h-3 text-red-600" />
                <span>YouTube Video Tour</span>
              </span>
              {videos.length > 1 && (
                <span className="text-[10px] font-mono text-slate-500 font-semibold">
                  {activeVideoIndex + 1} of {videos.length} videos
                </span>
              )}
            </div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#142533] mt-0.5 leading-snug">
              {currentTitle}
            </h3>
          </div>
        </div>

        {/* Direct Watch on YouTube External Button */}
        <a
          href={externalYouTubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-102 shrink-0 w-fit cursor-pointer"
          title="Open video on YouTube"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Watch on YouTube</span>
          <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
        </a>
      </div>

      {/* Main Video Viewport - Entire area clicks and redirects directly to YouTube */}
      <a
        href={externalYouTubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block aspect-video w-full bg-slate-950 overflow-hidden cursor-pointer focus:outline-hidden focus:ring-4 focus:ring-red-500/50"
        title={`Click to watch "${currentTitle}" directly on YouTube`}
        aria-label={`Watch "${currentTitle}" on YouTube`}
      >
        {/* Background High-Res Video Thumbnail */}
        {thumbnailUrl && !imageError ? (
          <img
            src={thumbnailUrl}
            alt={currentTitle}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-90 group-hover:brightness-100"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 flex items-center justify-center" />
        )}

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/50 group-hover:from-black/75 transition-colors" />

        {/* Center Prominent Red YouTube Play Button & Click-to-Redirect Badge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
          <div className="relative mb-3 flex items-center justify-center">
            {/* Subtle Pulsing Halo */}
            <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-red-600/30 animate-ping group-hover:bg-red-600/50" />

            {/* Iconic Red YouTube Button */}
            <div className="relative w-18 h-12 sm:w-22 sm:h-15 rounded-2xl bg-[#FF0000] group-hover:bg-[#CC0000] text-white flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110">
              <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-white text-white ml-0.5" />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white font-bold text-xs sm:text-sm border border-white/20 shadow-xl group-hover:border-red-500/70 transition-colors">
            <ExternalLink className="w-3.5 h-3.5 text-red-500" />
            <span>Click to Watch on YouTube</span>
          </span>

          <p className="text-slate-200 text-xs sm:text-sm font-medium mt-2 max-w-md line-clamp-1 drop-shadow-md">
            {currentTitle}
          </p>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5">
            Opens official property video in YouTube
          </span>
        </div>

        {/* Top Info Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-white text-[11px] font-semibold border border-white/10">
            <Video className="w-3.5 h-3.5 text-red-500" />
            <span>Official Video Tour</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FF0000] text-white text-[11px] font-bold shadow-xs">
            <span>YouTube</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
          <span className="text-[11px] font-mono text-white/90 drop-shadow-sm truncate">
            {propertyTitle || 'Auctions & More Property Inspection'}
          </span>
          <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1 drop-shadow-sm shrink-0">
            <span>Watch Full Video</span>
            <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </a>

      {/* Multi-Video Selector Strip (when property has more than 1 video) */}
      {videos.length > 1 && (
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-[#E8E2D5] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">
              Available Video Tours ({videos.length}):
            </span>
            <span className="text-[10px] text-slate-400">
              Click any video to select or watch on YouTube
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {videos.map((vid, idx) => {
              const isActive = idx === activeVideoIndex;
              const thumbUrl = getYouTubeThumbnailUrl(vid.video_url || vid.video_path);
              const title = vid.video_title?.trim() || `Tour Video #${idx + 1}`;
              const targetUrl = getYouTubeWatchUrl(vid.video_url || vid.video_path);

              return (
                <div
                  key={vid.id || idx}
                  className={`group/vid relative rounded-xl overflow-hidden border-2 transition-all p-1.5 flex items-center gap-2 ${
                    isActive
                      ? 'border-red-600 bg-red-50/50 shadow-sm'
                      : 'border-transparent bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveVideoIndex(idx);
                      setImageError(false);
                    }}
                    className="relative aspect-video w-16 rounded-lg overflow-hidden bg-slate-900 shrink-0 cursor-pointer text-left"
                    title={`Select ${title}`}
                  >
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={title}
                        className="w-full h-full object-cover group-hover/vid:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                        <Video className="w-4 h-4" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 fill-white text-white opacity-80 group-hover/vid:opacity-100" />
                    </div>
                  </button>

                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveVideoIndex(idx);
                        setImageError(false);
                      }}
                      className="text-xs font-bold text-[#142533] block truncate text-left w-full hover:text-red-600 cursor-pointer"
                      title={title}
                    >
                      {title}
                    </button>
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-0.5 mt-0.5"
                      title="Open on YouTube"
                    >
                      <span>YouTube</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
