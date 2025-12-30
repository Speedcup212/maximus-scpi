import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
  isDarkMode?: boolean;
  iconVariant?: 'gladiator';
}

const Logo: React.FC<LogoProps> = ({ className = '', variant = 'full' }) => {
  if (variant === 'icon') {
    return (
      <img
        src="/Maximus logo 250x50 4.svg"
        alt="MaximusSCPI Logo"
        className={`object-contain ${className}`}
        style={{ aspectRatio: '5/1' }}
      />
    );
  }

  return (
    <img
      src="/Maximus logo 250x50 4.svg"
      alt="MaximusSCPI - Comparateur Intelligent"
      className={`object-contain ${className}`}
      style={{ aspectRatio: '5/1' }}
      loading="eager"
      decoding="async"
      fetchpriority="high"
    />
  );
};

export default Logo;
