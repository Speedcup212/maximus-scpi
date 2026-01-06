import React from 'react';

interface MaximusLogo3BarsProps {
  className?: string;
  width?: number;
  height?: number;
}

const MaximusLogo3Bars: React.FC<MaximusLogo3BarsProps> = ({
  className = '',
  width = 120,
  height = 120
}) => {
  return (
    <img
      src="/3-barres.svg"
      alt="MaximusSCPI Logo"
      width={width}
      height={height}
      className={className}
      loading="lazy"
    />
  );
};

export default MaximusLogo3Bars;
