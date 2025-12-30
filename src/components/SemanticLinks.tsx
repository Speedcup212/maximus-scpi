import React from 'react';
import {
  ArrowRight, TrendingUp, MapPin, Building, Leaf, Euro, Users, Award,
  Trophy, Globe, Home, BookOpen, FileText, Percent, ShoppingCart, Heart,
  Flag, PiggyBank, BarChart, HelpCircle, Recycle
} from 'lucide-react';

interface SemanticLink {
  title: string;
  url: string;
  description: string;
  icon: string;
  type: 'parent' | 'sibling' | 'child';
}

interface SemanticLinksProps {
  currentPage: string;
  links: SemanticLink[];
  title?: string;
  compact?: boolean;
}

const getIcon = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    'trending-up': <TrendingUp className="w-5 h-5" />,
    'map-pin': <MapPin className="w-5 h-5" />,
    'building': <Building className="w-5 h-5" />,
    'leaf': <Leaf className="w-5 h-5" />,
    'euro': <Euro className="w-5 h-5" />,
    'users': <Users className="w-5 h-5" />,
    'award': <Award className="w-5 h-5" />,
    'trophy': <Trophy className="w-5 h-5" />,
    'globe': <Globe className="w-5 h-5" />,
    'home': <Home className="w-5 h-5" />,
    'book-open': <BookOpen className="w-5 h-5" />,
    'file-text': <FileText className="w-5 h-5" />,
    'percent': <Percent className="w-5 h-5" />,
    'shopping-cart': <ShoppingCart className="w-5 h-5" />,
    'heart': <Heart className="w-5 h-5" />,
    'flag': <Flag className="w-5 h-5" />,
    'piggy-bank': <PiggyBank className="w-5 h-5" />,
    'bar-chart': <BarChart className="w-5 h-5" />,
    'help-circle': <HelpCircle className="w-5 h-5" />,
    'recycle': <Recycle className="w-5 h-5" />
  };
  return icons[iconName] || <ArrowRight className="w-5 h-5" />;
};

const SemanticLinks: React.FC<SemanticLinksProps> = ({
  currentPage,
  links,
  title = 'Découvrez aussi',
  compact = false
}) => {
  if (!links || links.length === 0) return null;

  const parentLinks = links.filter(l => l.type === 'parent');
  const siblingLinks = links.filter(l => l.type === 'sibling');
  const childLinks = links.filter(l => l.type === 'child');

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 md:p-8 my-8 border border-green-200">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
        {title}
      </h2>

      <div className="space-y-6">
        {parentLinks.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Guides principaux
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {parentLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className="group bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-green-200 hover:border-green-500"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors">
                      {getIcon(link.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors line-clamp-2">
                        {link.title}
                      </h4>
                      {!compact && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {link.description}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-green-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {siblingLinks.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Guides complémentaires
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {siblingLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className="group bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-blue-200 hover:border-blue-500"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      {getIcon(link.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 mb-1 text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
                        {link.title}
                      </h4>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {childLinks.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-purple-700 mb-3 flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Pour aller plus loin
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              {childLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className="group bg-white rounded-lg p-3 shadow hover:shadow-lg transition-all duration-300 border border-purple-200 hover:border-purple-500"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      {getIcon(link.icon)}
                    </div>
                    <h4 className="font-semibold text-gray-900 text-xs group-hover:text-purple-600 transition-colors line-clamp-2 flex-1">
                      {link.title}
                    </h4>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-green-200">
        <p className="text-sm text-gray-600 text-center">
          💡 <strong>Navigation intelligente :</strong> Ces liens vous guident vers les ressources les plus pertinentes pour approfondir votre connaissance des SCPI
        </p>
      </div>
    </div>
  );
};

export default SemanticLinks;
