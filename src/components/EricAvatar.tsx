import React from 'react';

interface EricAvatarProps {
  className?: string;
  size?: number;
}

const EricAvatar: React.FC<EricAvatarProps> = ({
  className = '',
  size = 80
}) => {
  return (
    <img
      src="/cercle Eric Bellaiche bleu.svg"
      alt="Eric Bellaiche - Expert MaximusSCPI"
      style={{ width: size, height: size }}
      className={`rounded-full object-cover ${className}`}
      loading="lazy"
    />
  );
};

export default EricAvatar;
