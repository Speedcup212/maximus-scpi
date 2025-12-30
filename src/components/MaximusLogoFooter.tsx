import React from 'react';

interface MaximusLogoFooterProps {
  className?: string;
}

const MaximusLogoFooter: React.FC<MaximusLogoFooterProps> = ({ className = "h-16" }) => {
  return (
    <img
      src="/Maximus logo 250x50 4.svg"
      alt="MaximusSCPI - Comparateur Intelligent"
      className={`object-contain ${className}`}
      style={{ aspectRatio: '5/1' }}
      loading="lazy"
      decoding="async"
    />
  );
};

export default MaximusLogoFooter;
