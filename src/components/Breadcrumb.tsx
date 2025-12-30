import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (url: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, onNavigate }) => {
  const handleClick = (e: React.MouseEvent, url: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(url);
    }
  };

  return (
    <nav
      className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => (
        <React.Fragment key={item.url}>
          {index === 0 ? (
            <a
              href={item.url}
              onClick={(e) => handleClick(e, item.url)}
              className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              aria-label="Accueil"
            >
              <Home className="w-4 h-4" />
            </a>
          ) : (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              {index === items.length - 1 ? (
                <span className="text-gray-900 dark:text-white font-medium" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <a
                  href={item.url}
                  onClick={(e) => handleClick(e, item.url)}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {item.name}
                </a>
              )}
            </>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
