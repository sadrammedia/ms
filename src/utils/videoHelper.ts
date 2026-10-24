/**
 * Helper to parse various video URLs (YouTube watch, shorts, youtu.be, Vimeo, direct MP4)
 * into responsive embeddable URLs or direct video streams.
 */

export interface ParsedVideoInfo {
  type: 'youtube' | 'vimeo' | 'direct' | 'unknown';
  embedUrl: string;
  originalUrl: string;
  isValid: boolean;
}

export function parseVideoUrl(rawUrl: string): ParsedVideoInfo {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { type: 'unknown', embedUrl: '', originalUrl: '', isValid: false };
  }

  const url = rawUrl.trim();

  // 1. YouTube standard watch, embed, shorts, or youtu.be
  // Examples:
  // - https://www.youtube.com/watch?v=dQw4w9WgXcQ
  // - https://youtu.be/dQw4w9WgXcQ
  // - https://www.youtube.com/shorts/dQw4w9WgXcQ
  // - https://www.youtube.com/embed/dQw4w9WgXcQ
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`,
      originalUrl: url,
      isValid: true
    };
  }

  // 2. Vimeo
  // Examples:
  // - https://vimeo.com/123456789
  // - https://player.vimeo.com/video/123456789
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[3]) {
    const videoId = vimeoMatch[3];
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`,
      originalUrl: url,
      isValid: true
    };
  }

  // 3. Direct video format (.mp4, .webm, .ogg)
  const isDirect = /\.(mp4|webm|ogg)($|\?)/i.test(url);
  if (isDirect || url.startsWith('blob:') || url.startsWith('data:video/')) {
    return {
      type: 'direct',
      embedUrl: url,
      originalUrl: url,
      isValid: true
    };
  }

  // Fallback: if it's already an embed link
  if (url.includes('/embed/') || url.includes('player.')) {
    return {
      type: 'youtube',
      embedUrl: url,
      originalUrl: url,
      isValid: true
    };
  }

  return {
    type: 'unknown',
    embedUrl: url,
    originalUrl: url,
    isValid: url.startsWith('http://') || url.startsWith('https://')
  };
}
