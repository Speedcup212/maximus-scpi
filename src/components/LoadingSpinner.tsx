import React from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen = false, size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const spinner = (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} border-4 border-green-200 border-t-green-600 dark:border-gray-700 dark:border-t-green-500 rounded-full animate-spin`}></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-50 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return (
    <div className="py-12">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
