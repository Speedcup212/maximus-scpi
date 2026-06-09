/**
 * GÉNÉRATEUR DE CONTENU RICHE - Design identique aux articles existants
 * 
 * Chaque section est rendue avec les mêmes classes que le contenu fallback
 * de DynamicArticlePage.tsx :
 *  - Cards : bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8
 *  - Tables : mêmes classes que generateComparativeSection
 *  - Highlights : bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 ...
 *  - Strategy : bg-gradient-to-br from-purple-50 to-indigo-50 ...
 *  - Texte : text-gray-700 dark:text-gray-300 / text-gray-900 dark:text-white
 */
import React from 'react';
import { Target, BarChart3, BookOpen, Calculator, AlertTriangle, Shield, HelpCircle } from 'lucide-react';
import type { ArticleTemplate } from '../data/articleTemplatesConfig';

export interface RichArticleSection {
  id: string;
  title: string;
  icon: any;
  content: JSX.Element;
}

export function generateRichArticleContent(template: ArticleTemplate): RichArticleSection[] {
  const slugHandlers: Record<string, () => RichArticleSection[]> = {
    'scpi-ou-lmnp': generateScpiOuLmnp,
    'scpi-ou-immobilier-locatif': generateScpiOuImmobilierLocatif,
    'scpi-ou-assurance-vie': generateScpiOuAssuranceVie,
    'scpi-capital-fixe-capital-variable': generateCapitalFixeCapitalVariable,
    'bulletin-trimestriel-scpi': generateBulletinTrimestriel,
    'rapport-annuel-scpi': generateRapportAnnuel,
    'delai-revente-scpi': generateDelaiRevente,
    'investir-scpi-apres-50-ans': generateApres50Ans,
    'scpi-non-resident-fiscal': generateNonResident,
  };

  if (slugHandlers[template.slug]) {
    return slugHandlers[template.slug]();
  }

  return generateGenericContent(template);
}

// Utils de style - mêmes classes que DynamicArticlePage.tsx

function card(children: React.ReactNode): JSX.Element {
  return <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">{children}</div>;
}

function highlightBox(children: React.ReactNode): JSX.Element {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
      {children}
    </div>
  );
}

function strategyBox(children: React.ReactNode): JSX.Element {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border-2 border-purple-200 dark:border-purple-800">
      {children}
    </div>
  );
}

function tableHeader(label: string, variant: 'normal' | 'optA' | 'optB' = 'normal'): JSX.Element {
  const base = 'text-left p-4 font-bold';
  if (variant === 'optA') return <th className={`${base} text-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30`}>{label}</th>;
  if (variant === 'optB') return <th className={`${base} text-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30`}>{label}</th>;
  return <th className={`${base} text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700`}>{label}</th>;
}

function tableRow(cells: string[], variant: 'normal' | 'split' = 'normal', idx: number = 0): JSX.Element {
  const bgClass = idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/50' : 'bg-white dark:bg-gray-800';
  const hoverClass = 'hover:bg-gray-100 dark:hover:bg-gray-700';
  
  if (variant === 'split') {
    return (
      <tr className={`${bgClass} ${hoverClass} transition-colors`}>
        <td className="p-4 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">{cells[0]}</td>
        <td className="p-4 text-center text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">{cells[1]}</td>
        <td className="p-4 text-center text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">{cells[2]}</td>
      </tr>
    );
  }
  
  return (
    <tr className={`${bgClass} ${hoverClass} transition-colors`}>
      {cells.map((cell, i) => (
        <td key={i} className={`p-4 ${i === 0 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'} border-b border-gray-200 dark:border-gray-700`}>
          {cell}
        </td>
      ))}
    </tr>
  );
}

function multiColRow(cells: string[], idx: number): JSX.Element {
  const bgClass = idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/50' : 'bg-white dark:bg-gray-800';
  return (
    <tr className={`${bgClass} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}>
      {cells.map((cell, i) => (
        <td key={i} className={`p-4 border-b border-gray-200 dark:border-gray-700 ${i === 0 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
          {cell}
        </td>
      ))}
    </tr>
  );
}

// Baseline (3 col standard split)
function baseTableHeader(cols: string[]): JSX.Element {
  return (
    <thead>
      <tr className="border-b-2 border-gray-300 dark:border-gray-600">
        {cols.map((col, i) => (
          <th key={i} className={`text-left p-4 font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 ${i > 0 ? 'text-center' : ''}`}>
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function baseTable(headers: string[], rows: string[][]): JSX.Element {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300 dark:border-gray-600">
              {headers.map((col, i) => (
                <th key={i} className={`text-left p-4 font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 ${i > 0 ? 'text-center' : ''}`}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {rows.map((row, idx) => (
              <tr key={idx} className={`${idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/50' : 'bg-white dark:bg-gray-800'} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}>
                {row.map((cell, i) => (
                  <td key={i} className={`p-4 ${i === 0 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'} ${i > 0 ? 'text-center' : ''}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function errorItem(title: string, desc: string, idx: number): JSX.Element {
  return (
    <div key={idx} className="flex gap-4 items-start">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-bold">
        {idx + 1}
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h4>
        <p className="text-gray-700 dark:text-gray-300">{desc}</p>
      </div>
    </div>
  );
}

// ========================================================================
// 1. SCPI OU LMNP
// ========================================================================
function generateScpiOuLmnp(): RichArticleSection[] {
  return [
    {
      id: 'intro',
      title: 'SCPI ou LMNP : les différences fondamentales',
      icon: BarChart3,
      content: card(
        <>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            La SCPI est un placement collectif : vous achetez des parts d'une société qui possède un patrimoine immobilier diversifié (bureaux, commerces, logistique, santé). La société de gestion s'occupe de tout. Le LMNP est un investissement direct : vous achetez un bien que vous louez meublé, avec une fiscalité BIC et un amortissement qui réduit l'impôt.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Ces deux approches répondent à des logiques différentes : la SCPI est un placement financier adossé à de l'immobilier, le LMNP est un investissement immobilier direct avec gestion active.
          </p>
          {highlightBox(
            <p className="text-gray-800 dark:text-gray-200">
              <strong>À savoir :</strong> Le choix dépend de votre temps disponible, votre TMI, votre horizon et votre objectif patrimonial. Aucune solution n'est universellement supérieure.
            </p>
          )}
        </>
      )
    },
    {
      id: 'comparison',
      title: 'Comparaison détaillée',
      icon: BarChart3,
      content: baseTable(
        ['Critère', 'SCPI', 'LMNP'],
        [
          ["Ticket d'entrée", 'À partir de 1 000 €', '50 000 – 200 000 € minimum'],
          ['Gestion', 'Déléguée à la société de gestion', 'Personnelle ou via mandat'],
          ['Diversification', 'Immédiate (plusieurs immeubles)', 'Un seul bien (sauf multi-propriétés)'],
          ['Fiscalité', 'Revenus fonciers (RF) + PS', 'BIC (amortissement possible)'],
          ['Liquidité', 'Revente des parts (2-12 mois)', 'Vente du bien (3-12 mois)'],
          ['Effet de levier', 'Crédit possible mais pas de bien en garantie', 'Crédit standard avec bien en garantie'],
          ['Transmission', 'Parts facilement transmissibles', 'Bien immobilier (succession)'],
          ['Temps de gestion', '~1-2 h par an', '~50-100 h par an (location nue)'],
        ]
      )
    },
    {
      id: 'example',
      title: 'Cas pédagogique',
      icon: Calculator,
      content: card(
        <div>
          <p className="text-sm italic text-gray-500 dark:text-gray-400 mb-4">
            Simulation pédagogique simplifiée, hors frais complets et fiscalité personnelle, sans garantie de rendement.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <strong>Profil :</strong> Investisseur 45 ans, TMI 30 %, 100 000 € disponibles, objectif revenus complémentaires sur 10-15 ans.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-500">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">SCPI</h4>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>100 000 € répartis sur 3-4 SCPI</li>
                <li>Revenus estimés : ~5 000 €/an brut</li>
                <li>Frais d'entrée : ~8-12 %</li>
                <li>Gestion 100 % déléguée</li>
                <li>Diversification immédiate</li>
              </ul>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border-l-4 border-green-500">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">LMNP</h4>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>100 000 € apport + crédit pour un studio</li>
                <li>Amortissement possible ~3-4 %/an</li>
                <li>Frais de notaire : ~7-8 %</li>
                <li>Gestion personnelle ou mandat</li>
                <li>Un seul bien, un seul locataire</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'erreurs',
      title: 'Erreurs fréquentes à éviter',
      icon: AlertTriangle,
      content: card(
        <div className="space-y-6">
          {[
            ['Croire que l\'amortissement LMNP est un gain pur', 'L\'amortissement réduit le bénéfice imposable mais ne crée pas de trésorerie. À la revente, les amortissements peuvent être réintégrés (plus-value).'],
            ['Penser que la SCPI est toujours moins rentable que le direct', 'Ramené au temps de gestion, à la diversification et au risque locatif, le rendement net de la SCPI peut être supérieur pour un investisseur passif.'],
            ['Négliger la vacance et les travaux en LMNP', 'Un mois de vacance = 1/12e des revenus annuels. Un ravalement ou une réfection peuvent absorber plusieurs années de rendement.'],
            ['Sous-estimer les frais de souscription SCPI', '8-12 % de frais d\'entrée = 1 à 2 ans de rendement net absorbé au départ. À comparer avec les frais de notaire et de crédit du LMNP.'],
            ['Choisir sur le seul critère fiscal', 'L\'amortissement LMNP est attractif, mais la rentabilité réelle dépend aussi de la vacance, des travaux, des frais de gestion et de l\'évolution du prix du bien.'],
          ].map(([title, desc], idx) => errorItem(title, desc, idx))}
        </div>
      )
    },
    {
      id: 'method',
      title: 'Notre méthode d\'analyse',
      icon: Shield,
      content: strategyBox(
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Comment MaximusSCPI analyse ce choix</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Pour la SCPI</h4>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>Rendement, TOF, report à nouveau</li>
                <li>Valeur de reconstitution et décote</li>
                <li>Frais de souscription et de gestion</li>
                <li>Société de gestion et sa solidité</li>
                <li>Diversification sectorielle/géographique</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Pour le LMNP</h4>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>Emplacement et marché locatif local</li>
                <li>Rendement brut et net après charges</li>
                <li>Amortissement et fiscalité BIC</li>
                <li>Capacité d'emprunt et effet de levier</li>
                <li>Temps de gestion et coûts de mandat</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Questions fréquentes',
      icon: HelpCircle,
      content: card(
        <div className="space-y-6">
          {[
            ['Peut-on cumuler SCPI et LMNP dans son patrimoine ?', 'Oui, ces deux approches sont complémentaires. De nombreux investisseurs combinent une ou deux SCPI pour la diversification et un bien en LMNP pour l\'effet de levier et l\'amortissement.'],
            ['Quel ticket d\'entrée pour chaque solution ?', 'La SCPI est accessible dès 1 000 €, le LMNP nécessite généralement un apport de 50 000 à 100 000 € minimum complété par un crédit.'],
            ['Quelle solution est la plus liquide ?', 'La SCPI (revente de parts, délai 2 à 12 mois). Le LMNP implique une vente immobilière complète (3 à 12 mois) avec frais de notaire et éventuelle plus-value.'],
            ['Le LMNP est-il toujours plus rentable ?', 'Pas nécessairement. Un bien bien situé avec un bon locataire peut performer, mais la vacance, les travaux imprévus ou une baisse du marché peuvent effacer des années de rendement.'],
            ['La SCPI est-elle moins risquée que le LMNP ?', 'Les risques sont différents : la SCPI expose au risque de baisse du prix de part, le LMNP expose au risque de vacance, de mauvais payeur et de travaux.'],
          ].map(([q, a], idx) => (
            <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
              <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                  {idx + 1}
                </span>
                <span className="flex-1">{q}</span>
              </h4>
              <p className="text-gray-700 dark:text-gray-300 ml-11">{a}</p>
            </div>
          ))}
        </div>
      )
    },
  ];
}

// ========================================================================
// 2. SCPI OU IMMOBILIER LOCATIF DIRECT
// ========================================================================
function generateScpiOuImmobilierLocatif(): RichArticleSection[] {
  return [
    {
      id: 'intro',
      title: 'SCPI ou immobilier direct : deux logiques différentes',
      icon: BarChart3,
      content: card(
        <>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Choisir entre SCPI et immobilier locatif direct revient à départager gestion déléguée et maîtrise totale. 
            La SCPI mutualise les risques sur plusieurs immeubles sans contrainte de gestion. 
            L'immobilier direct offre un contrôle complet du bien, un effet de levier bancaire classique et une fiscalité différente (revenus fonciers ou BIC).
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Le vrai critère de choix n'est pas le rendement brut, mais votre disponibilité, votre horizon et votre objectif patrimonial.
          </p>
          {highlightBox(
            <p className="text-gray-800 dark:text-gray-200">
              <strong>À savoir :</strong> Comparer uniquement le rendement brut est trompeur. Après charges, vacance, travaux, frais de gestion et fiscalité, le rendement net dépend beaucoup de votre situation personnelle.
            </p>
          )}
        </>
      )
    },
    {
      id: 'comparison',
      title: 'Tableau comparatif',
      icon: BarChart3,
      content: baseTable(
        ['Critère', 'SCPI', 'Immobilier direct'],
        [
          ['Investissement minimum', '500 – 1 000 €', '50 000 – 150 000 €'],
          ['Diversification', 'Plusieurs immeubles, secteurs, pays', 'Un seul bien (sauf multi-propriétés)'],
          ['Gestion quotidienne', 'Déléguée (société de gestion)', 'Personnelle ou mandat de gestion'],
          ['Travaux et vacance', 'Mutualisés entre associés', '100 % à la charge du propriétaire'],
          ['Fiscalité des revenus', 'Revenus fonciers (RF) + PS', 'RF ou BIC selon location nue/meublée'],
          ['Effet de levier', 'Crédit possible mais conditions variables', 'Crédit standard avec garantie hypothécaire'],
          ['Liquidité', 'Revente de parts (2-12 mois)', 'Vente du bien (3-12 mois + frais)'],
          ['Transmission', 'Parts facilement transmissibles', 'Bien immobilier (démembrement possible)'],
          ['Temps de gestion estimé', '~1-2 h par an', '~50-100 h par an'],
        ]
      )
    },
    {
      id: 'errors',
      title: 'Erreurs fréquentes',
      icon: AlertTriangle,
      content: card(
        <div className="space-y-6">
          {[
            ['Comparer uniquement le rendement brut', 'Le rendement brut d\'un bien direct peut sembler supérieur, mais après charges, vacance, travaux et fiscalité, le rendement net peut être inférieur à une SCPI bien sélectionnée.'],
            ['Sous-estimer le temps de gestion', 'Trouver un locataire, gérer les sinistres, suivre les travaux : le temps passé sur un bien direct est souvent sous-estimé.'],
            ['Ignorer le risque de concentration', 'Un seul bien = un seul locataire, une seule zone géographique. En cas de vacance prolongée, le rendement peut chuter brutalement.'],
            ['Oublier les frais de souscription SCPI', 'Les frais SCPI (8-12 %) doivent être comparés aux frais de notaire (7-8 %) et aux coûts de gestion d\'un bien direct.'],
          ].map(([t, d], idx) => errorItem(t, d, idx))}
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Questions fréquentes',
      icon: HelpCircle,
      content: card(
        <div className="space-y-6">
          {[
            ['Peut-on faire les deux (SCPI + immobilier direct) ?', 'Oui, c\'est même une approche équilibrée : l\'immobilier direct pour l\'effet de levier et le contrôle, les SCPI pour la diversification et la délégation de gestion.'],
            ['Quel est le rendement net moyen après fiscalité ?', 'Il n\'existe pas de chiffre unique valable pour tous. Le rendement net dépend de la TMI, des prélèvements sociaux, des frais, de la vacance et des charges. Chaque situation doit être simulée individuellement.'],
            ['L\'immobilier direct est-il toujours plus rentable sur le long terme ?', 'Pas nécessairement. Une vacance prolongée, des travaux imprévus ou une baisse de marché peuvent effacer des années de rendement. La SCPI lisse ces aléas.'],
            ['Quel est le ticket d\'entrée minimum pour une SCPI ?', 'La plupart des SCPI sont accessibles à partir de 500 à 5 000 € selon le prix de souscription. Certaines plateformes proposent des fractions de parts dès 500 €.'],
          ].map(([q, a], idx) => (
            <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
              <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">{idx + 1}</span>
                <span className="flex-1">{q}</span>
              </h4>
              <p className="text-gray-700 dark:text-gray-300 ml-11">{a}</p>
            </div>
          ))}
        </div>
      )
    },
  ];
}

// ========================================================================
// 3. SCPI OU ASSURANCE-VIE (SCPI en direct vs SCPI en AV)
// ========================================================================
function generateScpiOuAssuranceVie(): RichArticleSection[] {
  return [
    {
      id: 'intro',
      title: 'SCPI en direct ou en assurance-vie : deux enveloppes différentes',
      icon: BarChart3,
      content: card(
        <>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Investir en SCPI en direct ou via une assurance-vie sont deux approches différentes. L'assurance-vie offre une fiscalité allégée après 8 ans, une transmission optimisée et une liquidité facilitée, mais restreint le choix des SCPI disponibles dans le contrat. Le direct offre la pleine propriété des parts et l'accès au démembrement, mais une fiscalité plus lourde.
          </p>
          {highlightBox(
            <p className="text-gray-800 dark:text-gray-200">
              <strong>À savoir :</strong> Il ne s'agit pas de comparer SCPI VS assurance-vie comme produits concurrents, mais de choisir l'enveloppe la plus adaptée pour détenir ses SCPI selon sa situation fiscale et ses objectifs.
            </p>
          )}
        </>
      )
    },
    {
      id: 'comparison',
      title: 'Comparaison détaillée',
      icon: BarChart3,
      content: baseTable(
        ['Critère', 'SCPI en direct', 'SCPI en assurance-vie'],
        [
          ['Choix des SCPI', 'Illimité (toutes les SCPI)', 'Limité à la sélection de l\'assureur'],
          ['Fiscalité des revenus', 'Revenus fonciers + PS (17,2 %)', 'Capitalisation dans le contrat (PFU à la sortie)'],
          ['Fiscalité en sortie', 'Plus-value immobilière (19 % + PS)', 'Rachat soumis à PFU ou barème (abattement après 8 ans)'],
          ['Transmission', 'Succession (droits de succession)', 'Hors succession (clause bénéficiaire)'],
          ['Liquidité', 'Revente de parts (2-12 mois)', 'Rachat dans le contrat (délai variable)'],
          ['Démembrement', 'Possible (nue-propriété / usufruit)', 'Généralement pas ou très limité'],
          ['Frais', 'Souscription 8-12 %, gestion 10-12 % HT', 'Frais d\'entrée + frais gestion contrat + frais UC'],
        ]
      )
    },
    {
      id: 'example',
      title: 'Cas pédagogique',
      icon: Calculator,
      content: card(
        <div>
          <p className="text-sm italic text-gray-500 dark:text-gray-400 mb-4">
            Simulation pédagogique simplifiée, sans garantie de rendement.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <strong>Profil :</strong> Investisseur 55 ans, TMI 41 %, 100 000 €, objectif revenus complémentaires dans 10 ans + transmission.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-500">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">SCPI en direct</h4>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>Choix libre des SCPI</li>
                <li>Fiscalité : RF + PS (~58 % effectif)</li>
                <li>Rendement net après impôt : ~2,5 %</li>
                <li>Transmission : droits de succession</li>
                <li>Démembrement possible</li>
              </ul>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border-l-4 border-green-500">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">SCPI en assurance-vie</h4>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>Choix limité aux UC du contrat</li>
                <li>Fiscalité : PFU 30 % ou barème après 8 ans</li>
                <li>Rendement net après impôt : ~4 %</li>
                <li>Transmission : hors succession</li>
                <li>Pas de démembrement possible</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'errors',
      title: 'Erreurs fréquentes',
      icon: AlertTriangle,
      content: card(
        <div className="space-y-6">
          {[
            ['Choisir uniquement sur le nombre de SCPI disponibles en AV', 'Un contrat avec 50 SCPI n\'est pas forcément meilleur qu\'un contrat avec 15 SCPI bien sélectionnées. La qualité du suivi et des frais prime sur la quantité.'],
            ['Négliger les frais du contrat d\'assurance-vie', 'Frais d\'entrée (0-5 %), frais de gestion du contrat (0,5-1 %/an), frais des UC : ces frais s\'ajoutent à ceux des SCPI.'],
            ['Penser que l\'AV est toujours fiscalement avantageuse', 'L\'avantage fiscal (abattement après 8 ans) ne concerne que les rachats. Pour un TMI 11 %, le direct peut être plus intéressant.'],
            ['Investir en AV sans vérifier la qualité des UC SCPI', 'Toutes les SCPI proposées en AV ne sont pas de qualité équivalente. Vérifiez le rendement historique, le TOF et la société de gestion.'],
          ].map(([t, d], idx) => errorItem(t, d, idx))}
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Questions fréquentes',
      icon: HelpCircle,
      content: card(
        <div className="space-y-6">
          {[
            ['Peut-on avoir à la fois des SCPI en direct et en AV ?', 'Oui, c\'est même une stratégie courante : SCPI en AV pour les TMI élevées (fiscalité allégée) et SCPI en direct pour le choix libre et le démembrement.'],
            ['Les SCPI en AV sont-elles plus liquides ?', 'Oui, généralement. Le rachat de parts dans un contrat d\'assurance-vie est plus rapide que la revente en direct, mais des délais et frais de rachat peuvent s\'appliquer.'],
            ['Le démembrement est-il possible en AV ?', 'Très rarement. Le démembrement de SCPI n\'est généralement pas proposé dans les contrats d\'assurance-vie. C\'est un avantage du direct.'],
            ['Quels frais comparer entre direct et AV ?', 'En direct : souscription 8-12 % + gestion 10-12 % HT. En AV : entrée contrat + gestion contrat + UC. Le total est souvent plus élevé en AV.'],
            ['Quelle est la fiscalité après 8 ans en AV ?', 'Après 8 ans, abattement annuel de 4 600 € (célibataire) ou 9 200 € (couple). Au-delà, PFU 30 % ou barème. Les revenus capitalisés ne sont pas imposés avant rachat.'],
          ].map(([q, a], idx) => (
            <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
              <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">{idx + 1}</span>
                <span className="flex-1">{q}</span>
              </h4>
              <p className="text-gray-700 dark:text-gray-300 ml-11">{a}</p>
            </div>
          ))}
        </div>
      )
    },
  ];
}

// ========================================================================
// 4. CAPITAL FIXE / CAPITAL VARIABLE
// ========================================================================
function generateCapitalFixeCapitalVariable(): RichArticleSection[] {
  return [
    {
      id: 'intro',
      title: 'Capital fixe ou variable : comprendre le mécanisme',
      icon: BookOpen,
      content: card(
        <>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Les SCPI à capital variable et à capital fixe diffèrent fondamentalement sur le mécanisme d'émission et de retrait des parts. En capital variable, la société de gestion émet ou supprime des parts selon la demande. En capital fixe, le nombre de parts est limité : les transactions passent par un marché secondaire au prix de l'offre et de la demande.
          </p>
          {highlightBox(
            <p className="text-gray-800 dark:text-gray-200">
              <strong>À savoir :</strong> Cette différence a un impact direct sur la liquidité, le prix de souscription et la stabilité du capital de votre investissement.
            </p>
          )}
        </>
      )
    },
    {
      id: 'comparison',
      title: 'Comparaison détaillée',
      icon: BarChart3,
      content: baseTable(
        ['Critère', 'Capital variable', 'Capital fixe'],
        [
          ['Émission de parts', 'Continue (selon la demande)', 'Limitée au nombre de parts existantes'],
          ['Prix de souscription', 'Fixe (révisé par la SG)', 'Libre (marché secondaire)'],
          ['Retrait des parts', 'La SG rachète au prix de retrait', 'Vente sur le marché secondaire'],
          ['Liquidité', 'Fonction des nouvelles souscriptions', 'Fonction du carnet d\'ordres'],
          ['Suspension possible', 'Oui (déséquilibre souscriptions/retraits)', 'Non (marché secondaire)'],
          ['Décote possible', 'Non', 'Oui, si offre > demande'],
          ['Surcote possible', 'Non', 'Oui, si demande > offre'],
          ['Stabilité du capital', 'Variable', 'Stable'],
        ]
      )
    },
    {
      id: 'errors',
      title: 'Erreurs fréquentes',
      icon: AlertTriangle,
      content: card(
        <div className="space-y-6">
          {[
            ['Croire que le capital variable garantit une liquidité immédiate', 'La SG n\'est pas tenue de racheter si les souscriptions sont insuffisantes. En cas de crise, le retrait peut être suspendu.'],
            ['Penser que le capital fixe est toujours décoté', 'Certaines SCPI à capital fixe peuvent se négocier avec une surcote si la demande est forte.'],
            ['Ignorer le risque de suspension en capital variable', 'Plusieurs SCPI à capital variable ont suspendu le retrait lors de la crise 2008-2012. Horizon 8-10 ans recommandé.'],
            ['Choisir capital fixe sans vérifier le marché secondaire', 'Si le marché est peu actif, la revente peut prendre plusieurs mois, voire dépasser un an.'],
          ].map(([t, d], idx) => errorItem(t, d, idx))}
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Questions fréquentes',
      icon: HelpCircle,
      content: card(
        <div className="space-y-6">
          {[
            ['Quel type de capital est le plus répandu ?', 'La majorité des SCPI françaises sont à capital variable. Le capital fixe concerne principalement des SCPI historiques ou à taille limitée.'],
            ['Le prix de souscription est-il le même que le prix de retrait ?', 'Non. Le prix de souscription inclut les frais d\'entrée. Le prix de retrait est égal au prix de souscription moins les frais (généralement 8-12 % inférieur).'],
            ['Quel impact sur la liquidité ?', 'En capital variable, la liquidité dépend de l\'activité de souscription. En capital fixe, elle dépend du marché secondaire. Délai : quelques semaines à plusieurs mois.'],
            ['Une SCPI à capital fixe peut-elle devenir à capital variable ?', 'Oui, si l\'assemblée générale vote le changement. C\'est rare mais peut arriver lors de restructurations.'],
          ].map(([q, a], idx) => (
            <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
              <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">{idx + 1}</span>
                <span className="flex-1">{q}</span>
              </h4>
              <p className="text-gray-700 dark:text-gray-300 ml-11">{a}</p>
            </div>
          ))}
        </div>
      )
    },
  ];
}

// ========================================================================
// 5. BULLETIN TRIMESTRIEL SCPI
// ========================================================================
function generateBulletinTrimestriel(): RichArticleSection[] {
  return [
    {
      id: 'intro',
      title: 'À quoi sert un bulletin trimestriel ?',
      icon: BookOpen,
      content: card(
        <>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Le bulletin trimestriel (BT) est le document d'information périodique publié par une SCPI. Il permet de suivre l'activité locative, la collecte, la distribution et les principaux indicateurs. Contrairement au rapport annuel, il n'est pas certifié par un commissaire aux comptes.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Savoir lire un BT est essentiel pour surveiller son investissement entre deux rapports annuels et détecter les signaux faibles.
          </p>
          {highlightBox(
            <p className="text-gray-800 dark:text-gray-200">
              <strong>Bon à savoir :</strong> Le BT doit être publié dans les deux mois suivant la fin de chaque trimestre. Un retard de publication peut être un signal d'alerte.
            </p>
          )}
        </>
      )
    },
    {
      id: 'reading',
      title: 'Guide de lecture rubrique par rubrique',
      icon: BarChart3,
      content: baseTable(
        ['Rubrique', 'Ce que cela signifie', 'Pourquoi c\'est important'],
        [
          ['Période concernée', 'Trimestre couvert', 'Vérifier que le bulletin est à jour'],
          ['Distribution trimestrielle', 'Montant distribué par part', 'Permet de calculer le rendement courant'],
          ['Taux de distribution (TDVM)', 'Rendement annualisé', 'Indicateur de performance clé'],
          ['Collecte nette', 'Souscriptions - retraits', 'Reflet de la confiance des investisseurs'],
          ['Capitalisation', 'Taille totale de la SCPI', 'Impact sur la mutualisation des risques'],
          ["Nombre d'associés", "Nombre d'investisseurs", 'Indicateur de notoriété'],
          ['Prix de souscription', "Prix d'entrée", 'Peut avoir été révisé par la SG'],
          ["Délai de jouissance", "Délai avant premiers revenus", "Impact sur le rendement la 1ère année"],
          ['TOF / TOP', "Taux d'occupation", "Reflet de l'occupation du patrimoine"],
          ['Acquisitions / Arbitrages', 'Achats ou ventes', 'Stratégie de la SG'],
          ['Dette / Endettement', "Niveau d'endettement", 'Risque financier'],
          ['Report à nouveau', 'Réserves non distribuées', 'Capacité à maintenir la distribution'],
          ['Commentaire de gestion', 'Analyse de la SG', 'Comprendre la stratégie'],
        ]
      )
    },
    {
      id: 'limits',
      title: 'Limites du bulletin trimestriel',
      icon: AlertTriangle,
      content: card(
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300 mb-4">Le BT ne remplace pas le rapport annuel. Voici ce qu'il ne dit pas :</p>
          <div className="space-y-4">
            {[
              ['Pas d\'expertise du patrimoine', 'La valeur de reconstitution et de réalisation ne sont actualisées que dans le rapport annuel.'],
              ['Pas de certification', 'Le BT n\'est pas audité par un commissaire aux comptes. Seul le rapport annuel est certifié.'],
              ['Pas de comptes détaillés', 'Pas de compte de résultat ni de bilan détaillé. Pour une analyse financière complète, attendre le rapport annuel.'],
              ['Données partielles', 'Certains indicateurs (frais, ventilation sectorielle, maturité de la dette) peuvent ne pas figurer dans le BT.'],
            ].map(([t, d], idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 text-xs font-bold">{idx + 1}</span>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{t}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'method',
      title: 'Check-list de lecture MaximusSCPI',
      icon: Shield,
      content: strategyBox(
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ce que nous vérifions chaque trimestre</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Indicateurs de performance</h4>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>Distribution en hausse, stable ou baisse ?</li>
                <li>TOF stable ou en baisse ?</li>
                <li>Collecte nette positive ?</li>
                <li>Capitalisation en hausse ?</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Signaux faibles</h4>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>BT publié dans les délais ?</li>
                <li>Commentaire de gestion transparent ?</li>
                <li>Acquisitions récentes cohérentes ?</li>
                <li>Endettement maîtrisé ?</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Questions fréquentes',
      icon: HelpCircle,
      content: card(
        <div className="space-y-6">
          {[
            ['Où trouver le bulletin trimestriel d\'une SCPI ?', 'Le BT est publié sur le site de la société de gestion, dans l\'espace associés ou la rubrique documentation.'],
            ['Quelle est la différence avec le rapport annuel ?', 'Le BT est un document d\'information périodique non certifié. Le rapport annuel est certifié par un commissaire aux comptes.'],
            ['Le BT est-il obligatoire ?', 'Oui, les SCPI doivent publier un BT dans les deux mois suivant la fin de chaque trimestre civil.'],
            ['Un retard de publication est-il grave ?', 'Un retard ponctuel peut être technique, mais des retards répétés peuvent indiquer des difficultés internes.'],
            ['Quels indicateurs surveiller en priorité ?', 'La distribution trimestrielle, le TOF, la collecte nette, la capitalisation et le nombre d\'associés.'],
          ].map(([q, a], idx) => (
            <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
              <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">{idx + 1}</span>
                <span className="flex-1">{q}</span>
              </h4>
              <p className="text-gray-700 dark:text-gray-300 ml-11">{a}</p>
            </div>
          ))}
        </div>
      )
    },
  ];
}

// ========================================================================
// 6. RAPPORT ANNUEL SCPI
// ========================================================================
function generateRapportAnnuel(): RichArticleSection[] {
  return [
    {
      id: 'intro',
      title: 'Pourquoi le rapport annuel est le document de référence',
      icon: BookOpen,
      content: card(
        <>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Le rapport annuel est le document de référence d'une SCPI. Contrairement au bulletin trimestriel, il est certifié par un commissaire aux comptes et contient les comptes annuels, l'expertise du patrimoine immobilier, la valeur de reconstitution et le rapport de gestion.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            C'est le seul document qui permet une analyse financière complète et fiable de la SCPI.
          </p>
          {highlightBox(
            <p className="text-gray-800 dark:text-gray-200">
              <strong>Bon à savoir :</strong> Le rapport annuel doit être publié dans les six mois suivant la clôture de l'exercice. C'est une obligation réglementaire AMF.
            </p>
          )}
        </>
      )
    },
    {
      id: 'reading',
      title: 'Guide de lecture du rapport annuel',
      icon: BarChart3,
      content: baseTable(
        ['Section du rapport', 'Information à extraire', 'Utilité pour l\'investisseur'],
        [
          ['Rapport de gestion', 'Stratégie, faits marquants', 'Comprendre la vision de la SG'],
          ['Compte de résultat', 'Loyers perçus, charges, distribution', 'Vérifier la couverture de la distribution'],
          ['Bilan', 'Actif immobilier, dettes, capitaux', 'Analyser la structure financière'],
          ['Patrimoine immobilier', 'Immeubles, surfaces, taux occ.', 'Vérifier la diversification'],
          ['Expertise immobilière', 'Valeur vénale (expert indépendant)', 'Évaluer la valeur réelle du patrimoine'],
          ['Valeur de reconstitution', 'Prix de reconstitution par part', 'Comparer avec le prix de souscription'],
          ['Valeur de réalisation', 'Valeur nette après frais', 'Indicateur de valeur de sortie'],
          ['Distribution (TDVM)', 'Taux de distribution', 'Mesurer le rendement réel'],
          ['TOF / TOP', "Taux d'occupation", 'Évaluer l\'occupation'],
          ['Frais', 'Frais de gestion, souscription', 'Comprendre l\'impact sur le rendement'],
          ['Rapport du CAC', 'Certification, réserves', 'Vérifier la fiabilité des comptes'],
          ['Conventions réglementées', 'Liens SG / SCPI', 'Détecter les conflits d\'intérêts'],
        ]
      )
    },
    {
      id: 'keypoints',
      title: 'Les 5 points à vérifier en priorité',
      icon: Shield,
      content: card(
        <div className="space-y-6">
          {[
            ['La distribution est-elle couverte par les loyers ?', 'Comparez le total des loyers perçus avec le total distribué. Si la distribution dépasse les loyers, la SCPI puise dans ses réserves (report à nouveau).'],
            ['La valeur de reconstitution progresse-t-elle ?', 'Comparez sur 3-5 ans. Une baisse régulière peut indiquer une dégradation de la qualité du patrimoine.'],
            ['Le TOF est-il stable ?', 'Un TOF en baisse sur plusieurs années peut indiquer des difficultés locatives structurelles.'],
            ['L\'endettement est-il maîtrisé ?', 'Un endettement excessif (> 40-50 %) peut fragiliser la SCPI en cas de hausse des taux.'],
            ['Y a-t-il des réserves dans le rapport du CAC ?', 'Le commissaire aux comptes peut émettre des réserves. Des réserves graves doivent alerter l\'investisseur.'],
          ].map(([t, d], idx) => (
            <div key={idx} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 font-bold">{idx + 1}</div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">{t}</h4>
                <p className="text-gray-700 dark:text-gray-300">{d}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'errors',
      title: 'Erreurs fréquentes',
      icon: AlertTriangle,
      content: card(
        <div className="space-y-6">
          {[
            ['Se fier uniquement au taux de distribution', 'Un TDVM élevé peut masquer une distribution non couverte par les loyers ou une baisse de la valeur du patrimoine.'],
            ['Ignorer le rapport du commissaire aux comptes', 'C\'est la seule section certifiée. Des réserves du CAC méritent une analyse approfondie.'],
            ['Ne pas comparer avec les années précédentes', 'Un rapport isolé ne permet pas de déceler les tendances. Comparez sur 3 à 5 ans.'],
            ['Oublier les conventions réglementées', 'Les conventions entre la SG et la SCPI peuvent cacher des frais supplémentaires ou des conflits d\'intérêts.'],
          ].map(([t, d], idx) => errorItem(t, d, idx))}
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Questions fréquentes',
      icon: HelpCircle,
      content: card(
        <div className="space-y-6">
          {[
            ['Où trouver le rapport annuel d\'une SCPI ?', 'Sur le site de la société de gestion, espace documentation ou espace associés. Peut aussi être demandé directement à la SG.'],
            ['Différence entre valeur de reconstitution et valeur de réalisation ?', 'La valeur de reconstitution est le coût de reconstruction à l\'identique. La valeur de réalisation est la valeur nette après frais de cession.'],
            ['Le rapport annuel est-il obligatoire ?', 'Oui, toute SCPI doit publier un rapport annuel certifié dans les six mois suivant la clôture de l\'exercice.'],
            ['Que faire si une SCPI ne publie pas son rapport annuel ?', 'C\'est un signal très préoccupant. L\'associé peut exiger sa communication. En cas de refus, saisir l\'AMF.'],
          ].map(([q, a], idx) => (
            <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
              <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">{idx + 1}</span>
                <span className="flex-1">{q}</span>
              </h4>
              <p className="text-gray-700 dark:text-gray-300 ml-11">{a}</p>
            </div>
          ))}
        </div>
      )
    },
  ];
}

// ========================================================================
// 7. DÉLAI DE REVENTE SCPI
// ========================================================================
function generateDelaiRevente(): RichArticleSection[] {
  return [
    {
      id: 'intro',
      title: 'Revendre des parts de SCPI : comment ça marche ?',
      icon: BookOpen,
      content: card(
        <>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Revendre des parts de SCPI peut prendre de quelques semaines à plus d'un an, selon le type de capital (fixe ou variable), l'état du marché et la SCPI concernée. La liquidité des SCPI n'est pas garantie.
          </p>
          {highlightBox(
            <p className="text-gray-800 dark:text-gray-200">
              <strong>À savoir :</strong> Avant d'investir, il est essentiel de comprendre les délais potentiels et les conditions de revente. L'horizon minimum recommandé est de 8 à 10 ans.
            </p>
          )}
        </>
      )
    },
    {
      id: 'mechanism',
      title: 'Deux mécanismes selon le type de capital',
      icon: BookOpen,
      content: card(
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-500">
            <h4 className="font-bold text-gray-900 dark:text-white mb-3">Capital variable</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Vous demandez le rachat à la SG. Elle rachète au prix de retrait, compensé par les nouvelles souscriptions. La SG peut suspendre si les souscriptions sont insuffisantes.
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-sm">
              <p className="text-gray-700 dark:text-gray-300"><strong>Délai théorique :</strong> quelques jours</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Délai réel :</strong> 1 à 12 mois</p>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border-l-4 border-green-500">
            <h4 className="font-bold text-gray-900 dark:text-white mb-3">Capital fixe</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Vous vendez sur le marché secondaire. Le prix est libre, déterminé par l'offre et la demande. La SG n'intervient pas. Le délai dépend des acheteurs.
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-sm">
              <p className="text-gray-700 dark:text-gray-300"><strong>Délai théorique :</strong> variable</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Délai réel :</strong> 2 à 18 mois</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'delays',
      title: 'Délais constatés par situation',
      icon: BarChart3,
      content: baseTable(
        ['Situation', 'Délai estimé', 'Risque'],
        [
          ['Marché normal, capital variable', '2 à 4 semaines', 'Faible'],
          ['Marché normal, capital fixe', '1 à 6 mois', 'Moyen'],
          ['Marché tendu (crise, collecte négative)', '6 à 12 mois ou plus', 'Élevé'],
          ['SCPI de petite taille (< 100 M€)', '3 à 12 mois', 'Élevé'],
          ['SCPI de grande taille (> 1 Md€)', '2 à 6 mois', 'Moyen'],
          ['Revente avec décote acceptée', 'Plus rapide', 'Décote sur le prix'],
        ]
      )
    },
    {
      id: 'errors',
      title: 'Erreurs fréquentes',
      icon: AlertTriangle,
      content: card(
        <div className="space-y-6">
          {[
            ['Investir sans horizon de 8 à 10 ans', 'Les SCPI sont des placements non liquides à court terme. Investir de l\'argent dont vous pourriez avoir besoin dans les 5 ans expose à un blocage.'],
            ['Croire que la revente est immédiate', 'Même en capital variable, la SG n\'est pas tenue de racheter immédiatement. Certaines SCPI ont suspendu le retrait pendant plusieurs mois.'],
            ['Ne pas vérifier les conditions de retrait', 'Chaque SCPI a des conditions spécifiques (délai, prix, suspension). Vérifiez dans la note d\'information et le DIC.'],
            ['Ignorer les frais et la fiscalité de cession', 'La revente peut générer une plus-value imposable (19 % + PS) et des frais de cession. Une décote est également possible.'],
          ].map(([t, d], idx) => errorItem(t, d, idx))}
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Questions fréquentes',
      icon: HelpCircle,
      content: card(
        <div className="space-y-6">
          {[
            ['Peut-on vendre ses parts à tout moment ?', 'Oui, la demande peut être faite à tout moment. Mais le délai d\'exécution n\'est pas garanti. La SG traite les demandes dans l\'ordre d\'arrivée.'],
            ['Quel est le prix de revente ?', 'En capital variable, le prix de retrait est fixé par la SG. En capital fixe, le prix est libre (offre/demande).'],
            ['Que se passe-t-il si la SG suspend les retraits ?', 'Les associés doivent attendre la reprise. Impossible de forcer la revente pendant une suspension.'],
            ['Comment améliorer ses chances de revente rapide ?', 'Accepter une décote peut accélérer la vente. Pour le capital variable, il faut que les souscriptions soient actives.'],
            ['La fiscalité en cas de revente avec décote ?', 'Si vous revendez à perte (moins-value), pas d\'impôt sur la plus-value. La moins-value peut être imputée sur des plus-values futures.'],
          ].map(([q, a], idx) => (
            <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
              <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">{idx + 1}</span>
                <span className="flex-1">{q}</span>
              </h4>
              <p className="text-gray-700 dark:text-gray-300 ml-11">{a}</p>
            </div>
          ))}
        </div>
      )
    },
  ];
}

// ========================================================================
// 8. INVESTIR EN SCPI APRÈS 50 ANS
// ========================================================================
function generateApres50Ans(): RichArticleSection[] {
  return [
    {
      id: 'intro',
      title: 'Investir en SCPI après 50 ans : une question de priorité',
      icon: BookOpen,
      content: card(
        <>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Investir en SCPI après 50 ans répond à des objectifs spécifiques : préparer sa retraite, générer des revenus complémentaires, optimiser sa fiscalité et organiser sa transmission. L'horizon de placement (15-20 ans à 50 ans) reste compatible avec les SCPI, mais les priorités évoluent.
          </p>
          {highlightBox(
            <p className="text-gray-800 dark:text-gray-200">
              <strong>À savoir :</strong> Le choix de l'enveloppe (direct ou assurance-vie), du démembrement et des SCPI elles-mêmes doit être adapté à cette phase de vie.
            </p>
          )}
        </>
      )
    },
    {
      id: 'keys',
      title: 'Points clés à 50-65 ans',
      icon: Shield,
      content: card(
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            ['Horizon de placement', 'À 50 ans, horizon de 15-30 ans possible. La part investie doit tenir compte des besoins de cash à 5-10 ans.'],
            ['Revenus complémentaires', 'Les SCPI distribuent des revenus trimestriels qui peuvent compléter une pension de retraite.'],
            ['Fiscalité', 'La TMI peut baisser à la retraite. Les SCPI en AV permettent de différer l\'impôt.'],
            ['Transmission', 'L\'AV permet une transmission hors succession. Le démembrement aussi.'],
            ['Liquidité', 'Plus on avance en âge, plus le besoin de liquidité potentiel augmente (santé, dépendance).'],
            ['Cohérence patrimoniale', 'La part des SCPI doit être cohérente avec l\'ensemble des actifs et les besoins futurs.'],
          ].map(([t, d], idx) => (
            <div key={idx} className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-l-4 border-blue-500">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">{t}</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">{d}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'errors',
      title: 'Erreurs fréquentes après 50 ans',
      icon: AlertTriangle,
      content: card(
        <div className="space-y-6">
          {[
            ['Surinvestir en SCPI sans liquidités de précaution', 'Après 50 ans, le besoin de cash peut augmenter (santé, aidant). Gardez 6 à 12 mois de dépenses disponibles.'],
            ['Ignorer l\'assurance-vie pour la transmission', 'L\'AV permet de transmettre des SCPI hors succession avec abattement de 152 500 € par bénéficiaire.'],
            ['Choisir des SCPI trop risquées pour le rendement', 'À l\'approche de la retraite, la préservation du capital et la régularité des revenus priment.'],
            ['Ne pas anticiper la transmission', 'La donation de parts ou le démembrement prend du temps. Anticiper permet d\'éviter des droits élevés.'],
          ].map(([t, d], idx) => errorItem(t, d, idx))}
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Questions fréquentes',
      icon: HelpCircle,
      content: card(
        <div className="space-y-6">
          {[
            ['Est-il encore temps d\'investir en SCPI à 60 ans ?', 'Oui, l\'espérance de vie à 60 ans est de 25-30 ans. Privilégiez les SCPI distributives et l\'assurance-vie.'],
            ['Faut-il privilégier le démembrement après 50 ans ?', 'Le démembrement est intéressant si vous n\'avez pas besoin de revenus immédiats. À 50-55 ans, un démembrement sur 10-15 ans peut être cohérent.'],
            ['Quelle part de son patrimoine investir en SCPI ?', 'Une piste : 20-40 % du patrimoine financier, selon votre tolérance au risque et vos besoins de liquidité.'],
            ['Les SCPI sont-elles adaptées pour préparer sa retraite ?', 'Oui, elles peuvent constituer un complément de retraite via les distributions trimestrielles.'],
            ['Quel est le risque de liquidité après 70 ans ?', 'Il est prudent de réduire la part des SCPI ou d\'investir via l\'AV pour faciliter les rachats.'],
          ].map(([q, a], idx) => (
            <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
              <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">{idx + 1}</span>
                <span className="flex-1">{q}</span>
              </h4>
              <p className="text-gray-700 dark:text-gray-300 ml-11">{a}</p>
            </div>
          ))}
        </div>
      )
    },
  ];
}

// ========================================================================
// 9. SCPI POUR NON-RÉSIDENT FISCAL
// ========================================================================
function generateNonResident(): RichArticleSection[] {
  return [
    {
      id: 'intro',
      title: 'Non-résident fiscal et SCPI : les bases à connaître',
      icon: BookOpen,
      content: card(
        <>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Investir en SCPI en tant que non-résident fiscal est possible, mais la fiscalité applicable dépend de votre pays de résidence, de l'existence d'une convention fiscale avec la France et de la nature des revenus perçus. Les revenus distribués par des SCPI françaises sont considérés comme des revenus fonciers de source française.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Un conseil fiscal spécialisé est indispensable avant d'investir.
          </p>
          {highlightBox(
            <p className="text-gray-800 dark:text-gray-200">
              <strong>À savoir :</strong> La fiscalité applicable dépend du pays de résidence, pas de la nationalité. Chaque convention fiscale est unique.
            </p>
          )}
        </>
      )
    },
    {
      id: 'verification',
      title: 'Points à vérifier avant d\'investir',
      icon: BarChart3,
      content: baseTable(
        ['Point à vérifier', 'Pourquoi c\'est important', 'Document ou source'],
        [
          ['Résidence fiscale actuelle', 'La fiscalité dépend du pays de résidence', 'Avis d\'imposition, certificat de résidence'],
          ['Convention fiscale France — pays', 'Peut exonérer ou limiter l\'imposition en France', 'BOFiP, impots.gouv.fr'],
          ['Prélèvement à la source', '20 % (hors UE) ou 12 % (UE)', 'DIC de la SCPI, IFU'],
          ['Imposition dans le pays', 'Revenus imposables localement', 'Législation locale, conseiller fiscal'],
          ['SCPI françaises ou européennes', 'Fiscalité différente selon la SCPI', 'DIC, note d\'information'],
          ['Risque de double imposition', 'Certains revenus peuvent être imposés deux fois', 'Convention fiscale'],
          ['Banque et devise', 'Revenus versés en euros, frais de change', 'Contrat de banque, conditions SG'],
          ['Retour futur en France', 'La fiscalité change au retour', 'Conseiller fiscal'],
          ['Déclaration en France', 'Obligation de déclarer même non-résident', 'Cerfa 2042, SINR'],
        ]
      )
    },
    {
      id: 'fiscalite',
      title: 'Fiscalité : principes généraux',
      icon: Calculator,
      content: card(
        <div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Pour un non-résident fiscal, les revenus de source française sont soumis à un prélèvement à la source. Le taux est de 20 % pour les résidents hors UE et 12 % pour les résidents UE, sous réserve des conventions fiscales applicables. Les prélèvements sociaux (17,2 %) peuvent ne pas s'appliquer si vous êtes affilié à un régime de sécurité sociale hors France.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Ces règles varient selon la convention fiscale entre la France et votre pays de résidence. Chaque situation est spécifique.
          </p>
        </div>
      )
    },
    {
      id: 'errors',
      title: 'Erreurs fréquentes',
      icon: AlertTriangle,
      content: card(
        <div className="space-y-6">
          {[
            ['Croire qu\'en tant que non-résident on ne paie pas d\'impôt en France', 'Les revenus fonciers de source française sont imposables en France, même pour un non-résident.'],
            ['Penser que l\'assurance-vie résout tout', 'L\'AV française peut avoir une fiscalité spécifique pour les non-résidents. Vérifiez dans votre pays de résidence.'],
            ['Ignorer les conventions fiscales', 'Chaque convention est unique. Certaines exonèrent totalement les revenus fonciers en France.'],
            ['Investir sans conseil fiscal spécialisé', 'La fiscalité des non-résidents est complexe. Un conseil expert en fiscalité internationale est indispensable.'],
          ].map(([t, d], idx) => errorItem(t, d, idx))}
        </div>
      )
    },
    {
      id: 'sources',
      title: 'Sources à consulter',
      icon: Shield,
      content: strategyBox(
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ressources fiables pour non-résidents</h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• <a href="https://www.impots.gouv.fr" target="_blank" rel="nofollow" className="text-blue-600 dark:text-blue-400 hover:underline">impots.gouv.fr</a> — conventions fiscales et fiscalité des non-résidents</li>
              <li>• <a href="https://bofip.impots.gouv.fr" target="_blank" rel="nofollow" className="text-blue-600 dark:text-blue-400 hover:underline">BOFiP</a> — Bulletin officiel des finances publiques</li>
              <li>• DIC et note d'information de chaque SCPI</li>
              <li>• IFU (imprimé fiscal unique) transmis par la SG</li>
              <li>• Service des impôts des non-résidents (SINR)</li>
              <li>• Conseiller fiscal expert en fiscalité internationale</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Questions fréquentes',
      icon: HelpCircle,
      content: card(
        <div className="space-y-6">
          {[
            ['Un non-résident peut-il investir dans toutes les SCPI ?', 'La plupart des SCPI sont ouvertes aux non-résidents, mais certaines peuvent avoir des restrictions (Malraux, déficit foncier). Vérifiez dans le DIC.'],
            ['Quel est le prélèvement à la source ?', '20 % pour les résidents hors UE et 12 % pour les résidents UE, sous réserve des conventions fiscales.'],
            ['Les SCPI européennes sont-elles plus avantageuses ?', 'Pas nécessairement. La fiscalité dépend de votre pays de résidence et des conventions applicables.'],
            ['Faut-il déclarer ses SCPI en France ?', 'Oui, les revenus de source française doivent être déclarés en France, même pour un non-résident (SINR).'],
            ['Un retour en France change-t-il la fiscalité ?', 'Oui, vous redevenez résident fiscal français. Les revenus SCPI passent sous le régime des revenus fonciers français (TMI + PS).'],
          ].map(([q, a], idx) => (
            <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
              <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">{idx + 1}</span>
                <span className="flex-1">{q}</span>
              </h4>
              <p className="text-gray-700 dark:text-gray-300 ml-11">{a}</p>
            </div>
          ))}
        </div>
      )
    },
  ];
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
          {highlightBox(
            <p className="text-gray-800 dark:text-gray-200">
              <strong>Public :</strong> {template.targetAudience}
            </p>
          )}
        </div>
      )
    },
    {
      id: 'content',
      title: '',
      icon: BookOpen,
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
