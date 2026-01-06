import React, { useState } from 'react';
import { Building, MapPin, Globe, Heart, ShoppingBag, Warehouse, Home, Hotel, Grid2x2 as Grid, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { allLandingPages, LandingPageContent } from '../utils/landingPagesContent';

interface LandingPagesMenuProps {
  onPageClick: (slug: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  'bureaux': <Building className="w-5 h-5" />,
  'commerces': <ShoppingBag className="w-5 h-5" />,
  'sante': <Heart className="w-5 h-5" />,
  'logistique': <Warehouse className="w-5 h-5" />,
  'residentiel': <Home className="w-5 h-5" />,
  'hotellerie': <Hotel className="w-5 h-5" />,
  'diversifie': <Grid className="w-5 h-5" />,
  'france': <MapPin className="w-5 h-5" />,
  'europe': <Globe className="w-5 h-5" />,
  'international': <Globe className="w-5 h-5" />,
  'scpi': <TrendingUp className="w-5 h-5" />
};

const LandingPagesMenu: React.FC<LandingPagesMenuProps> = ({ onPageClick }) => {
  const [showAllScpi, setShowAllScpi] = useState(false);

  const sectorPages = allLandingPages.filter(p => p.type === 'sector');
  const geoPages = allLandingPages.filter(p => p.type === 'geography');
  const scpiPages = allLandingPages.filter(p => p.type === 'scpi');

  const getIcon = (page: LandingPageContent) => {
    if (page.type === 'scpi') return iconMap['scpi'];
    const key = page.urlFilter.sector || page.urlFilter.geo || '';
    return iconMap[key] || <Building className="w-5 h-5" />;
  };

  const handleClick = (e: React.MouseEvent, slug: string) => {
    console.log('LandingPagesMenu - Event type:', e.type, 'slug:', slug);
    onPageClick(slug);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-600 mb-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Pages Spécialisées SCPI
      </h2>

      {/* Par Secteur */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-600" />
          Par Secteur
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {sectorPages.map((page) => (
            <button
              key={page.slug}
              onClick={(e) => handleClick(e, page.slug)}
              type="button"
              className="flex items-center gap-3 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl border-2 border-blue-200 dark:border-blue-800 transition-all text-left group active:scale-[0.98] touch-manipulation select-none"
            >
              <div className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shrink-0">
                {getIcon(page)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                  {page.urlFilter.sector?.charAt(0).toUpperCase() + (page.urlFilter.sector?.slice(1) || '')}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Voir les SCPI
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Par Géographie */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-green-600" />
          Par Géographie
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          {geoPages.map((page) => (
            <button
              key={page.slug}
              onClick={(e) => handleClick(e, page.slug)}
              type="button"
              className="flex items-center gap-3 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl border-2 border-green-200 dark:border-green-800 transition-all text-left group active:scale-[0.98] touch-manipulation select-none"
            >
              <div className="text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform shrink-0">
                {getIcon(page)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                  {page.urlFilter.geo?.charAt(0).toUpperCase() + (page.urlFilter.geo?.slice(1) || '')}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Voir les SCPI
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Toutes les SCPI (collapsible) */}
      <div>
        <button
          onClick={() => setShowAllScpi(!showAllScpi)}
          type="button"
          className="w-full flex items-center justify-between text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors touch-manipulation"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span>Toutes les SCPI ({scpiPages.length})</span>
          </div>
          {showAllScpi ? (
            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>

        {showAllScpi && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 max-h-[500px] overflow-y-auto pr-1 sm:pr-2">
            {scpiPages.map((page) => (
              <button
                key={page.slug}
                onClick={(e) => handleClick(e, page.slug)}
                type="button"
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/40 rounded-lg border border-gray-200 dark:border-gray-600 transition-all text-left group active:scale-[0.98] touch-manipulation select-none"
              >
                <div className="text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                    {page.scpiName}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center">
          💡 <strong>Conseil :</strong> Explorez nos pages spécialisées avec analyses détaillées et filtres pré-appliqués
        </p>
      </div>
    </div>
  );
};

export default LandingPagesMenu;
