import React from 'react';

interface MediaRendererProps {
  src: string | undefined | null;
  mediaType?: 'image' | 'video';
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  fallbackSrc?: string;
}

export function MediaRenderer({
  src,
  mediaType,
  alt = 'Media content',
  className = '',
  style = {},
  fallbackSrc
}: MediaRendererProps) {
  if (!src) {
    if (fallbackSrc) {
      return (
        <img
          src={fallbackSrc}
          alt={alt}
          className={className}
          style={style}
          referrerPolicy="no-referrer"
        />
      );
    }
    return null;
  }

  // Detect type if not provided explicitly or defaulted
  const isVideo = mediaType === 'video' || (!mediaType && (
    src.toLowerCase().endsWith('.mp4') ||
    src.toLowerCase().endsWith('.webm') ||
    src.toLowerCase().endsWith('.ogg') ||
    src.toLowerCase().endsWith('.mov') ||
    src.toLowerCase().endsWith('.m4v') ||
    src.includes('video/mp4') ||
    src.includes('video/webm')
  ));

  if (isVideo) {
    return (
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        className={className}
        style={style}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      referrerPolicy="no-referrer"
    />
  );
}
