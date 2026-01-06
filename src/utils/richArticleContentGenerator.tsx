/**
 * GÉNÉRATEUR DE CONTENU RICHE - Articles optimisés
 */
import React from 'react';
import { Building, TrendingUp, Shield, AlertTriangle, Calculator, CheckCircle, Target, Award, Zap } from 'lucide-react';
import type { ArticleTemplate } from '../data/articleTemplatesConfig';

export interface RichArticleSection {
  id: string;
  title: string;
  icon: any;
  content: JSX.Element;
}

export function generateRichArticleContent(template: ArticleTemplate): RichArticleSection[] {
  // Pour l'instant, utiliser le générateur par défaut
  // Les articles optimisés seront chargés depuis Supabase ou des fichiers statiques
  const sections: RichArticleSection[] = [];

  // Section 1: Introduction
  sections.push({
    id: 'intro',
    title: '',
    icon: Target,
    content: (
      <div className="prose prose-lg max-w-none mb-12">
        <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Janvier 2025 : {template.searchIntent}. Ce guide complet vous apporte toutes les réponses avec des exemples chiffrés.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-600">
          <p className="text-gray-700 dark:text-gray-300"><strong>📌 Public :</strong> {template.targetAudience}</p>
        </div>
      </div>
    )
  });

  // Section 2: Contexte
  sections.push({
    id: 'context',
    title: 'Contexte 2025',
    icon: TrendingUp,
    content: (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
        <h3 className="text-2xl font-bold mb-4">Pourquoi maintenant ?</h3>
        <p className="mb-6">Avec taux à 3-4%, inflation 2%, SCPI à 5-6,5%.</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-600">5-6,5%</div>
            <div className="text-sm">Rendement SCPI</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-600">2%</div>
            <div className="text-sm">Inflation</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-orange-600">3-4%</div>
            <div className="text-sm">Taux crédit</div>
          </div>
        </div>
      </div>
    )
  });

  // Section 3: Analyse TMI
  sections.push({
    id: 'analysis',
    title: 'Analyse par profil fiscal',
    icon: Calculator,
    content: (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
        <h3 className="text-2xl font-bold mb-4">Calculs selon votre TMI</h3>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-4">
          <h4 className="font-bold mb-2">TMI 11% : 50k€ → 3,59% net</h4>
          <p>2 500€ brut - IR 275€ - PS 430€ = 1 795€ net/an</p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 mb-4">
          <h4 className="font-bold mb-2">TMI 30% : 100k€ → 2,64% net</h4>
          <p>5 000€ brut - IR 1 500€ - PS 860€ = 2 640€ net/an</p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6">
          <h4 className="font-bold mb-2">TMI 41% : 200k€ → 2,09% net</h4>
          <p>10 000€ brut - IR 4 100€ - PS 1 720€ = 4 180€ net/an</p>
        </div>
      </div>
    )
  });

  // Section 4: Avantages/Inconvénients
  sections.push({
    id: 'pros-cons',
    title: 'Pour et contre',
    icon: Shield,
    content: (
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <h3 className="text-2xl font-bold">Avantages</h3>
          </div>
          <ul className="space-y-2">
            <li>✓ Rendement 5-6,5% brut</li>
            <li>✓ Diversification immobilière</li>
            <li>✓ Gestion déléguée</li>
            <li>✓ Accès dès 1 000€</li>
            <li>✓ Revenus trimestriels</li>
          </ul>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <h3 className="text-2xl font-bold">Inconvénients</h3>
          </div>
          <ul className="space-y-2">
            <li>✗ Capital non garanti</li>
            <li>✗ Liquidité limitée 2-6 mois</li>
            <li>✗ Fiscalité élevée TMI &gt; 30%</li>
            <li>✗ Frais entrée 8-12%</li>
            <li>✗ Horizon 8-10 ans min</li>
          </ul>
        </div>
      </div>
    )
  });

  // Section 5: Stratégies
  sections.push({
    id: 'strategies',
    title: 'Stratégies par profil',
    icon: Target,
    content: (
      <div className="space-y-6 mb-12">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-3">🛡️ Prudent : 20-30% SCPI</h3>
          <p>Assurance-vie, 3-4 SCPI grandes, 70% fonds euros</p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-3">⚖️ Équilibré : 40-60% SCPI</h3>
          <p>Mix FR/EU, 5-7 SCPI diversifiées, AV fiscalité optimale</p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-3">⚡ Dynamique : 60-80% SCPI</h3>
          <p>SCPI EU 6,5%, 6-10 SCPI, crédit si TMI ≥ 30%</p>
        </div>
      </div>
    )
  });

  // Section 6: Vigilance
  sections.push({
    id: 'vigilance',
    title: 'Erreurs à éviter',
    icon: AlertTriangle,
    content: (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
        <div className="space-y-4">
          <div>
            <h4 className="font-bold mb-2">❌ Mono-SCPI</h4>
            <p>Minimum 3-4 SCPI pour diluer risques</p>
          </div>
          <div>
            <h4 className="font-bold mb-2">❌ Court terme</h4>
            <p>Horizon 8-10 ans minimum requis</p>
          </div>
          <div>
            <h4 className="font-bold mb-2">❌ Ignorer TMI</h4>
            <p>TMI 41% → AV obligatoire pour préserver rendement</p>
          </div>
          <div>
            <h4 className="font-bold mb-2">❌ Focus rendement seul</h4>
            <p>Vérifier TOF, patrimoine, historique 5-10 ans</p>
          </div>
        </div>
      </div>
    )
  });

  // Section 7: Verdict
  sections.push({
    id: 'verdict',
    title: 'Verdict 2025',
    icon: Award,
    content: (
      <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-8 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">💡 Notre recommandation</h3>
          <p className="text-lg mb-4">{getRecommendationText(template)}</p>
          <p>Sélection rigoureuse, calcul fiscal TMI, horizon 8-10 ans minimum.</p>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-xl p-6 border-2 border-blue-600">
          <p className="text-center font-semibold">
            📊 Comparateur 50+ SCPI + simulateurs fiscaux disponibles
          </p>
        </div>
      </div>
    )
  });

  return sections;
}

function getRecommendationText(template: ArticleTemplate): string {
  const kw = template.mainKeyword.toLowerCase();
  if (kw.includes('assurance')) return "AV + SCPI = meilleur compromis : fiscalité post-8 ans, capitalisation, transmission optimale.";
  if (kw.includes('crédit') || kw.includes('credit')) return "Crédit pertinent si TMI ≥ 30%, épargne régulière, horizon 15-20 ans.";
  if (kw.includes('démembrement') || kw.includes('demembrement')) return "Démembrement idéal 40-55 ans : -20-30% fiscalité immédiate, revenus retraite garantis.";
  return "Stratégie adaptée profils risque modéré, rendement > sécuritaire, 8 ans minimum.";
}
