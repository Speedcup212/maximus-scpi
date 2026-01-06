import React from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  width?: string;
  height?: string;
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  sizes = '100vw',
  width,
  height
}) => {
  // For now, use original image until optimized versions are generated
  // To enable optimized images: run 'npm install --save-dev sharp && node scripts/optimize-images.js'
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      width={width}
      height={height}
    />
  );
};

export default ResponsiveImage;
