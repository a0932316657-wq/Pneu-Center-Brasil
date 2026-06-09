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
  const cleanUrl = src ? src.split('?')[0].split('#')[0] : '';
  const isVideo = mediaType === 'video' || (!mediaType && (
    cleanUrl.toLowerCase().endsWith('.mp4') ||
    cleanUrl.toLowerCase().endsWith('.webm') ||
    cleanUrl.toLowerCase().endsWith('.ogg') ||
    cleanUrl.toLowerCase().endsWith('.mov') ||
    cleanUrl.toLowerCase().endsWith('.m4v') ||
    cleanUrl.toLowerCase().endsWith('.3gp') ||
    cleanUrl.toLowerCase().endsWith('.quicktime') ||
    (src && (
      src.toLowerCase().includes('video/mp4') ||
      src.toLowerCase().includes('video/webm') ||
      src.toLowerCase().includes('video/ogg') ||
      src.toLowerCase().includes('video/quicktime')
    ))
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
