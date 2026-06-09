/**
 * GÉNÉRATEUR DE CONTENU RICHE - Contenu fallback pour articles standards
 */
import React from 'react';
import { Target } from 'lucide-react';
import type { ArticleTemplate } from '../data/articleTemplatesConfig';

export interface RichArticleSection {
  id: string;
  title: string;
  icon: any;
  content: JSX.Element;
}

export function generateRichArticleContent(template: ArticleTemplate): RichArticleSection[] {
  return generateGenericContent(template);
}

// ========================================================================
// CONTENU GÉNÉRIQUE (fallback pour articles existants)
// ========================================================================
function generateGenericContent(template: ArticleTemplate): RichArticleSection[] {
  return [
    {
      id: 'intro',
      title: '',
      icon: Target,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {template.searchIntent}
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
            <p className="text-gray-800 dark:text-gray-200">
              <strong>Public :</strong> {template.targetAudience}
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'content',
      title: '',
      icon: Target,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Consultez nos articles dédiés et notre comparateur pour une analyse personnalisée selon votre situation.
          </p>
        </div>
      )
    },
  ];
}
