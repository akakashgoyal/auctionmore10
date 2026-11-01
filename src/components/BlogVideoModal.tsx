import React, { useEffect } from 'react';
import { getYouTubeEmbedUrl, getYouTubeWatchUrl } from '../utils/videoUtils';
import { X, Play, ExternalLink } from 'lucide-react';

interface BlogVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string | null;
  title?: string;
}

export const BlogVideoModal: React.FC<BlogVideoModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  title,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !videoUrl) return null;

  const embedUrl = getYouTubeEmbedUrl(videoUrl);
  const watchUrl = getYouTubeWatchUrl(videoUrl);
  // Ensure autoplay=1 for instant playback when user clicks play
  const finalEmbedUrl = embedUrl ? `${embedUrl}&autoplay=1` : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
    >
      <div
        className="relative w-full max-w-4xl bg-slate-950 rounded-3xl shadow-2xl border border-white/15 overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="bg-[#142533] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 border-b border-white/10 text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center shrink-0 shadow-xs">
              <Play className="w-4 h-4 fill-white text-white ml-0.5" />
            </span>
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-400 block">
                YouTube Video Guide
              </span>
              <h3
                id="video-modal-title"
                className="font-serif text-xs sm:text-sm font-bold truncate text-slate-100 max-w-md sm:max-w-xl"
              >
                {title || 'Video Guide'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {watchUrl && (
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 hover:text-white transition-colors border border-white/10 cursor-pointer"
                title="Watch directly on YouTube"
              >
                <span>Open in YouTube</span>
                <ExternalLink className="w-3.5 h-3.5 text-red-500" />
              </a>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Close video"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 16:9 Responsive Video Viewport */}
        <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
          {finalEmbedUrl ? (
            <iframe
              src={finalEmbedUrl}
              title={title || 'YouTube Video'}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="p-8 text-center text-white space-y-3">
              <p className="text-sm font-medium text-slate-300">
                Unable to load video embed.
              </p>
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar for Mobile */}
        <div className="bg-slate-900/95 px-4 py-2.5 flex sm:hidden items-center justify-between text-xs text-slate-400 border-t border-white/10">
          <span className="font-mono text-[11px] truncate">Auctions &amp; More Video</span>
          {watchUrl && (
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 font-semibold inline-flex items-center gap-1"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
