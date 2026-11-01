/**
 * Video Utilities for Real Estate Property Video Tours
 * Supports YouTube links (standard, youtu.be, shorts, embeds) and direct video formats
 */

/**
 * Extracts a YouTube Video ID from any standard, shortened, or shorts YouTube URL.
 */
export function extractYouTubeId(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Common YouTube URL regex patterns
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
  );
  if (match && match[1]) {
    return match[1];
  }

  // Handle bare 11-char alphanumeric YouTube video IDs if user pasted only the ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Returns a privacy-enhanced YouTube embed URL (youtube-nocookie.com)
 */
export function getYouTubeEmbedUrl(url?: string | null): string | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`;
}

/**
 * Returns the high-resolution YouTube video thumbnail URL
 */
export function getYouTubeThumbnailUrl(url?: string | null): string | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Checks if the URL is a direct HTML5 video file
 */
export function isDirectVideoFile(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim().toLowerCase().split('?')[0];
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.ogg') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.m4v')
  );
}

/**
 * Determines if a video record has playable content
 */
export function isPlayableVideo(url?: string | null): boolean {
  if (!url) return false;
  return Boolean(extractYouTubeId(url) || isDirectVideoFile(url) || url.startsWith('http'));
}

/**
 * Returns the direct official YouTube watch link to open/redirect in YouTube
 */
export function getYouTubeWatchUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return 'https://www.youtube.com';
  const videoId = extractYouTubeId(url);
  if (videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
  return url.trim();
}
