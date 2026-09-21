/**
 * YouTube Utility for Safe, Privacy-Enhanced Video and Playlist Embedding
 * Complies with DPDP Act 2023 by strictly utilizing youtube-nocookie.com
 */

export interface YouTubeEmbedInfo {
  isValid: boolean;
  type: 'video' | 'playlist';
  id?: string;
  videoId?: string;
  playlistId?: string;
  isPlaylist: boolean;
  embedUrl: string | null;
  thumbnailUrl: string | null;
}

/**
 * Extracts YouTube Video ID or Playlist ID from various standard formats:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://www.youtube.com/playlist?list=PL123456789
 */
export function extractYouTubeEmbedInfo(rawUrl: string): YouTubeEmbedInfo {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      isValid: false,
      type: 'video',
      isPlaylist: false,
      embedUrl: null,
      thumbnailUrl: null
    };
  }

  const url = rawUrl.trim();
  if (!url) {
    return {
      isValid: false,
      type: 'video',
      isPlaylist: false,
      embedUrl: null,
      thumbnailUrl: null
    };
  }

  // 1. Playlist URL check
  const playlistMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/i);
  if (playlistMatch && (url.includes('playlist') || !url.match(/watch\?v=[a-zA-Z0-9_-]{11}/))) {
    const playlistId = playlistMatch[1];
    return {
      isValid: true,
      type: 'playlist',
      id: playlistId,
      playlistId,
      isPlaylist: true,
      embedUrl: `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(playlistId)}&rel=0&modestbranding=1`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80'
    };
  }

  // 2. Video ID Extraction
  let videoId: string | null = null;

  // Short URL: youtu.be/VIDEO_ID
  const youtuBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (youtuBeMatch) {
    videoId = youtuBeMatch[1];
  }

  // Standard Watch URL: youtube.com/watch?v=VIDEO_ID
  if (!videoId) {
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
    if (watchMatch) {
      videoId = watchMatch[1];
    }
  }

  // Shorts URL: youtube.com/shorts/VIDEO_ID
  if (!videoId) {
    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
    if (shortsMatch) {
      videoId = shortsMatch[1];
    }
  }

  // Embed URL: youtube.com/embed/VIDEO_ID
  if (!videoId) {
    const embedMatch = url.match(/youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{11})/i);
    if (embedMatch) {
      videoId = embedMatch[1];
    }
  }

  // Direct 11-char ID entered by user
  if (!videoId && /^[a-zA-Z0-9_-]{11}$/.test(url)) {
    videoId = url;
  }

  if (!videoId) {
    return {
      isValid: false,
      type: 'video',
      isPlaylist: false,
      embedUrl: null,
      thumbnailUrl: null
    };
  }

  return {
    isValid: true,
    type: 'video',
    id: videoId,
    videoId,
    isPlaylist: false,
    embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0&modestbranding=1`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  };
}

/**
 * Validates whether a given URL is a plausible YouTube channel link.
 */
export function isValidYouTubeChannelUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim().toLowerCase();
  if (clean.startsWith('@')) return /^@[a-zA-Z0-9_.-]+$/.test(clean);
  const isYoutube = (
    clean.startsWith('https://youtube.com/') ||
    clean.startsWith('https://www.youtube.com/') ||
    clean.startsWith('http://youtube.com/') ||
    clean.startsWith('http://www.youtube.com/') ||
    clean.startsWith('youtube.com/') ||
    clean.startsWith('www.youtube.com/')
  );
  if (!isYoutube) return false;
  return (
    clean.includes('/@') ||
    clean.includes('/channel/') ||
    clean.includes('/c/') ||
    clean.includes('/user/')
  );
}

/**
 * Formats a clean outbound channel URL with https protocol.
 */
export function formatYouTubeChannelUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const clean = url.trim();
  if (!clean) return '';
  if (clean.startsWith('@')) {
    return `https://www.youtube.com/${clean}`;
  }
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    return `https://${clean}`;
  }
  return clean;
}
