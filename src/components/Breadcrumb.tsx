import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (url: string) => void;
  hideCurrentItem?: boolean;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, onNavigate, hideCurrentItem = false }) => {
  const handleClick = (e: React.MouseEvent, url: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(url);
    }
  };

  const visibleItems = hideCurrentItem && items.length > 1 ? items.slice(0, -1) : items;

  return (
    <nav
      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600 dark:text-gray-400 mb-4 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
      aria-label="Breadcrumb"
    >
      {visibleItems.map((item, index) => {
        const isCurrent = !hideCurrentItem && index === visibleItems.length - 1;

        return (
          <React.Fragment key={item.url}>
            {index === 0 ? (
              <a
                href={item.url}
                onClick={(e) => handleClick(e, item.url)}
                className="flex items-center shrink-0 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label="Accueil"
              >
                <Home className="w-4 h-4" />
              </a>
            ) : (
              <>
                <ChevronRight className="w-4 h-4 shrink-0 text-gray-400" />
                {isCurrent ? (
                  <span
                    className="min-w-0 break-words text-gray-900 dark:text-white font-medium [overflow-wrap:anywhere]"
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : (
                  <a
                    href={item.url}
                    onClick={(e) => handleClick(e, item.url)}
                    className="min-w-0 break-words hover:text-blue-600 dark:hover:text-blue-400 transition-colors [overflow-wrap:anywhere]"
                  >
                    {item.name}
                  </a>
                )}
              </>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
