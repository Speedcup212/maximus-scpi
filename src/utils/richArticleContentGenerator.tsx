/**
 * GÉNÉRATEUR DE CONTENU RICHE - Articles optimisés
 */
import React from 'react';
import { Building, TrendingUp, Shield, AlertTriangle, Calculator, CheckCircle, Target, Award, BookOpen, FileText, MapPin, Clock, DollarSign, BarChart3, PieChart, ExternalLink, HelpCircle, Info } from 'lucide-react';
import type { ArticleTemplate } from '../data/articleTemplatesConfig';

export interface RichArticleSection {
  id: string;
  title: string;
  icon: any;
  content: JSX.Element;
}

export function generateRichArticleContent(template: ArticleTemplate): RichArticleSection[] {
  // Contenu spécifique par slug
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

  // Fallback générique pour les articles existants
  return generateGenericContent(template);
}

// ========================================================================
// 1. SCPI OU LMNP
// ========================================================================
function generateScpiOuLmnp(): RichArticleSection[] {
  return [
    {
      id: 'intro',
      title: '',
      icon: Target,
      content: (
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Comparer SCPI et LMNP revient à choisir entre gestion déléguée et maîtrise directe de votre investissement immobilier. 
            La SCPI offre diversification immédiate, liquidité et absence de gestion opérationnelle. 
            Le LMNP permet un amortissement comptable réduisant l'impôt, mais implique gestion locative, travaux, vacance et endettement personnel. 
            Aucune solution n'est universellement supérieure : le choix dépend de votre temps disponible, votre horizon, votre TMI et votre objectif patrimonial.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-600">
            <p className="text-gray-700 dark:text-gray-300"><strong>📌 Public concerné :</strong> Investisseurs immobiliers hésitant entre immobilier géré en direct (LMNP) et immobilier collectif délégué (SCPI).</p>
          </div>
        </div>
      )
    },
    {
      id: 'comparison-table',
      title: 'Comparaison pratique',
      icon: BarChart3,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-2xl font-bold mb-6">SCPI vs LMNP : les différences clés</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-3 text-left font-semibold">Critère</th>
                  <th className="p-3 text-left font-semibold">SCPI</th>
                  <th className="p-3 text-left font-semibold">LMNP</th>
                  <th className="p-3 text-left font-semibold">Point de vigilance</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Ticket d\'entrée', 'À partir de 1 000 €', '50 000 – 200 000 € minimum', 'Le LMNP nécessite un apport et un crédit. La SCPI est accessible dès 1 000 €.'],
                  ['Gestion', 'Déléguée à la société de gestion', 'Personnelle ou via mandat', 'La gestion LMNP est chronophage (locataires, travaux, comptabilité).'],
                  ['Diversification', 'Immédiate (plusieurs immeubles, secteurs, pays)', 'Un seul bien (sauf multi-propriétés)', 'Avec une SCPI vous diversifiez dès le premier euro.'],
                  ['Fiscalité', 'Revenus fonciers (RF) + prélèvements sociaux', 'BIC (amortissement possible)', 'L\'amortissement LMNP peut réduire fortement l\'impôt.'],
                  ['Liquidité', 'Revente des parts (délai 2-12 mois)', 'Vente du bien (délai 3-12 mois selon marché)', 'Les deux peuvent prendre du temps.'],
                  ['Effet de levier', 'Crédit possible mais pas de bien en garantie', 'Crédit standard avec bien en garantie', 'Le crédit LMNP est plus simple à obtenir.'],
                  ['Transmission', 'Parts de SCPI (succession, donation)', 'Bien immobilier (succession, donation)', 'La transmission de parts est plus souple qu\'un bien physique.'],
                  ['Risque principal', 'Perte de valeur de la part', 'Vacance locative, travaux, mauvais payeur', 'Les risques sont différents mais réels dans les deux cas.'],
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-850' : ''}>
                    <td className="p-3 font-medium">{row[0]}</td>
                    <td className="p-3">{row[1]}</td>
                    <td className="p-3">{row[2]}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: 'mechanism',
      title: 'Comprendre le choix',
      icon: BookOpen,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-2xl font-bold mb-4">SCPI ou LMNP : de quoi parle-t-on ?</h3>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p><strong>La SCPI</strong> est un placement collectif : vous achetez des parts d'une société qui possède et gère un patrimoine immobilier diversifié (bureaux, commerces, logistique, santé). Vous percevez des revenus proportionnels à votre nombre de parts. La société de gestion s'occupe de tout : acquisition, location, travaux, revente.</p>
            <p><strong>Le LMNP (Loueur Meublé Non Professionnel)</strong> est un investissement direct : vous achetez un bien immobilier que vous louez meublé. Vous gérez ou faites gérer la location. La fiscalité est celle des BIC (Bénéfices Industriels et Commerciaux), avec possibilité d'amortissement du bien qui réduit le bénéfice imposable.</p>
            <p>Ces deux approches répondent à des logiques différentes : la SCPI est un placement financier adossé à de l'immobilier, le LMNP est un investissement immobilier direct avec une gestion active.</p>
          </div>
        </div>
      )
    },
    {
      id: 'example',
      title: 'Cas pédagogique',
      icon: Calculator,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-2xl font-bold mb-4">Exemple comparatif</h3>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 mb-6">
            <p className="text-sm italic mb-4">
              Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.
            </p>
            <p className="mb-4"><strong>Profil :</strong> Investisseur 45 ans, TMI 30 %, 100 000 € disponibles, objectif revenus complémentaires sur 10-15 ans.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <h4 className="font-bold mb-2">SCPI</h4>
                <ul className="space-y-1 text-sm">
                  <li>100 000 € répartis sur 3-4 SCPI</li>
                  <li>Revenus estimés : ~5 000 €/an brut</li>
                  <li>Frais d'entrée : ~8-12 %</li>
                  <li>Gestion 100 % déléguée</li>
                  <li>Diversification immédiate</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <h4 className="font-bold mb-2">LMNP</h4>
                <ul className="space-y-1 text-sm">
                  <li>100 000 € apport + crédit pour un studio meublé</li>
                  <li>Amortissement possible ~3-4 %/an</li>
                  <li>Frais de notaire : ~7-8 %</li>
                  <li>Gestion personnelle ou mandat</li>
                  <li>Un seul bien, un seul locataire</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'erreurs',
      title: 'Erreurs fréquentes',
      icon: AlertTriangle,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="space-y-4">
            <div>
              <h4 className="font-bold mb-2">❌ Croire que l'amortissement LMNP est un gain pur</h4>
              <p className="text-gray-600 dark:text-gray-400">L'amortissement réduit le bénéfice imposable mais ne crée pas de trésorerie. À la revente, les amortissements pratiqués peuvent être réintégrés (plus-value).</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Penser que la SCPI est toujours moins rentable que le direct</h4>
              <p className="text-gray-600 dark:text-gray-400">Ramené au temps de gestion, à la diversification et au risque locatif, le rendement net de la SCPI peut être supérieur au LMNP pour un investisseur qui ne souhaite pas gérer.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Négliger la vacance et les travaux en LMNP</h4>
              <p className="text-gray-600 dark:text-gray-400">Un mois de vacance = 1/12e des revenus annuels perdus. Un ravalement ou une réfection peuvent absorber plusieurs années de rendement.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Sous-estimer les frais de souscription SCPI</h4>
              <p className="text-gray-600 dark:text-gray-400">8-12 % de frais d'entrée sur une SCPI, c'est 1 à 2 ans de rendement net absorbé au départ. À comparer avec les frais de notaire et de crédit du LMNP.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Choisir sur le seul critère fiscal</h4>
              <p className="text-gray-600 dark:text-gray-400">L'amortissement LMNP est attractif, mais la rentabilité réelle dépend aussi de la vacance, des travaux, des frais de gestion et de l'évolution du prix du bien.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'method',
      title: 'Méthode MaximusSCPI',
      icon: Shield,
      content: (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 mb-8">
          <h3 className="text-2xl font-bold mb-4">Comment MaximusSCPI analyse ce choix</h3>
          <p className="mb-4">Nous ne vous disons pas si la SCPI ou le LMNP est « mieux ». Nous vous aidons à vérifier les points suivants selon votre situation :</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <h4 className="font-bold mb-2">Pour la SCPI</h4>
              <ul className="text-sm space-y-1">
                <li>✓ Rendement, TOF, report à nouveau</li>
                <li>✓ Valeur de reconstitution et décote</li>
                <li>✓ Frais de souscription et de gestion</li>
                <li>✓ Société de gestion et sa solidité</li>
                <li>✓ Diversification sectorielle et géographique</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <h4 className="font-bold mb-2">Pour le LMNP</h4>
              <ul className="text-sm space-y-1">
                <li>✓ Emplacement et marché locatif local</li>
                <li>✓ Rendement brut et net après charges</li>
                <li>✓ Amortissement et fiscalité BIC</li>
                <li>✓ Capacité d'emprunt et effet de levier</li>
                <li>✓ Temps de gestion et coûts de mandat</li>
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
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="space-y-6">
            <div>
              <h4 className="font-bold mb-2">Peut-on cumuler SCPI et LMNP dans son patrimoine ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Oui, ces deux approches sont complémentaires. De nombreux investisseurs combinent une ou deux SCPI pour la diversification et un bien en LMNP pour l'effet de levier et l'amortissement. La cohérence patrimoniale globale est à vérifier avec un conseiller.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">LMNP au réel ou micro-BIC : quel choix selon ma situation ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Le micro-BIC (50 % d'abattement) est simple mais souvent moins avantageux que le régime réel avec amortissement. Le réel permet de déduire charges, intérêts d'emprunt et amortissement. Le choix dépend du montant des loyers et des charges réelles.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Quel ticket d'entrée pour chaque solution ?</h4>
              <p className="text-gray-600 dark:text-gray-400">La SCPI est accessible dès 1 000 €, voire 500 € sur certaines plateformes. Le LMNP nécessite généralement un apport de 50 000 à 100 000 € minimum, complété par un crédit immobilier.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">La SCPI est-elle moins risquée que le LMNP ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Pas nécessairement. Les risques sont différents : la SCPI expose au risque de baisse du prix de part et à la dépendance à la société de gestion. Le LMNP expose au risque de vacance, de mauvais payeur, de travaux et de baisse du prix de l'immobilier dans la zone.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Quelle solution est la plus liquide ?</h4>
              <p className="text-gray-600 dark:text-gray-400">La SCPI (revente de parts, délai 2 à 12 mois selon le marché). Le LMNP implique une vente immobilière complète (3 à 12 mois) avec frais de notaire et éventuelle plus-value imposable. Dans les deux cas, l'horizon minimum recommandé est de 8 à 10 ans.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'liens',
      title: 'Pour approfondir',
      icon: ExternalLink,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex flex-wrap gap-3">
            <a href="/comparateur-scpi/" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Comparer les SCPI</a>
            <a href="/fiscalite-scpi/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Fiscalité SCPI</a>
            <a href="/scpi-ou-immobilier-locatif/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">SCPI vs immobilier locatif</a>
            <a href="/articles/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Tous nos articles</a>
          </div>
        </div>
      )
    },
    {
      id: 'compliance',
      title: '',
      icon: Info,
      content: (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            Cette page est pédagogique. Elle ne constitue pas une recommandation personnalisée, un conseil en investissement ni un conseil fiscal individualisé. Avant toute souscription, il convient d'analyser votre situation, votre fiscalité, votre horizon d'investissement, vos objectifs et les documents réglementaires des SCPI.
          </p>
        </div>
      )
    }
  ];
}

// ========================================================================
// 2. SCPI OU IMMOBILIER LOCATIF DIRECT
// ========================================================================
function generateScpiOuImmobilierLocatif(): RichArticleSection[] {
  return [
    {
      id: 'intro',
      title: '',
      icon: Target,
      content: (
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Choisir entre SCPI et immobilier locatif direct revient à départager gestion déléguée et maîtrise totale. 
            La SCPI mutualise les risques sur plusieurs immeubles et secteurs, sans contrainte de gestion. 
            L'immobilier direct offre un contrôle complet du bien, un effet de levier bancaire classique et une fiscalité différente (revenus fonciers ou BIC). 
            Le vrai critère de choix n'est pas le rendement brut, mais votre disponibilité, votre horizon et votre objectif patrimonial.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-600">
            <p className="text-gray-700 dark:text-gray-300"><strong>📌 Public concerné :</strong> Investisseurs comparant l'achat d'un bien locatif en direct et l'investissement en SCPI.</p>
          </div>
        </div>
      )
    },
    {
      id: 'comparison-table',
      title: 'SCPI vs immobilier direct : tableau comparatif',
      icon: BarChart3,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-3 text-left font-semibold">Critère</th>
                  <th className="p-3 text-left font-semibold">SCPI</th>
                  <th className="p-3 text-left font-semibold">Immobilier direct</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Investissement minimum', '500 – 1 000 €', '50 000 – 150 000 €'],
                  ['Diversification', 'Plusieurs immeubles, secteurs, pays', 'Un seul bien (sauf multi-propriétés)'],
                  ['Gestion quotidienne', 'Déléguée (société de gestion)', 'Personnelle ou mandat de gestion'],
                  ['Travaux et vacance', 'Mutualisés entre associés', '100 % à la charge du propriétaire'],
                  ['Fiscalité des revenus', 'Revenus fonciers (RF) + PS', 'RF ou BIC selon location nue/meublée'],
                  ['Effet de levier', 'Crédit possible mais conditions variables', 'Crédit standard avec garantie hypothécaire'],
                  ['Liquidité', 'Revente de parts (délai 2-12 mois)', 'Vente du bien (3-12 mois + frais)'],
                  ['Transmission', 'Parts facilement transmissibles', 'Bien immobilier (démembrement possible)'],
                  ['Temps de gestion estimé', '~1-2 h par an', '~50-100 h par an (location nue)'],
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-850' : ''}>
                    <td className="p-3 font-medium">{row[0]}</td>
                    <td className="p-3">{row[1]}</td>
                    <td className="p-3">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: 'errors',
      title: 'Erreurs fréquentes',
      icon: AlertTriangle,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="space-y-4">
            <div>
              <h4 className="font-bold mb-2">❌ Comparer uniquement le rendement brut</h4>
              <p className="text-gray-600 dark:text-gray-400">Le rendement brut d'un bien direct peut sembler supérieur, mais après déduction des charges, vacance, travaux, frais de gestion et fiscalité, le rendement net peut être inférieur à une SCPI bien sélectionnée.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Sous-estimer le temps de gestion</h4>
              <p className="text-gray-600 dark:text-gray-400">Trouver un locataire, gérer les sinistres, suivre les travaux, déclarer les revenus : le temps passé sur un bien direct est souvent sous-estimé. Pour un investisseur actif, chaque heure de gestion a un coût d'opportunité.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Ignorer le risque de concentration</h4>
              <p className="text-gray-600 dark:text-gray-400">Un seul bien = un seul locataire, une seule zone géographique, un seul secteur. En cas de vacance prolongée ou de baisse du marché local, le rendement du bien direct peut chuter brutalement.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Croire que la SCPI n'a pas de frais</h4>
              <p className="text-gray-600 dark:text-gray-400">Les frais de souscription (8-12 %) et de gestion (10-12 % HT des loyers) sont réels. Ils doivent être comparés aux frais de notaire (7-8 %), aux frais de crédit et aux coûts de gestion d'un bien direct.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'method',
      title: 'Points à vérifier avant de choisir',
      icon: Shield,
      content: (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <h4 className="font-bold mb-2">Vérifier pour une SCPI</h4>
              <ul className="text-sm space-y-1">
                <li>✓ Rendement historique sur 3-5 ans</li>
                <li>✓ TOF et évolution</li>
                <li>✓ Frais de souscription et de gestion</li>
                <li>✓ Société de gestion (agrément AMF)</li>
                <li>✓ Diversification du patrimoine</li>
                <li>✓ Valeur de reconstitution vs prix</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <h4 className="font-bold mb-2">Vérifier pour un bien direct</h4>
              <ul className="text-sm space-y-1">
                <li>✓ Prix au m² et tendances du quartier</li>
                <li>✓ Rendement locatif local</li>
                <li>✓ Travaux prévisibles (5-10 ans)</li>
                <li>✓ Capacité d'emprunt et taux</li>
                <li>✓ Fiscalité personnelle (TMI, PS)</li>
                <li>✓ Temps disponible pour la gestion</li>
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
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="space-y-6">
            <div>
              <h4 className="font-bold mb-2">Peut-on faire les deux (SCPI + immobilier direct) ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Oui, c'est même une approche équilibrée : l'immobilier direct pour l'effet de levier et le contrôle, les SCPI pour la diversification et la délégation de gestion. La répartition dépend de votre patrimoine global et de votre objectif.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Quel est le rendement net moyen après fiscalité ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Il n'existe pas de chiffre unique valable pour tous. Le rendement net dépend de la TMI, des prélèvements sociaux, des frais, de la vacance et des charges. Chaque situation doit être simulée individuellement.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">L'immobilier direct est-il toujours plus rentable sur le long terme ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Pas nécessairement. Un bien bien situé avec un bon locataire peut performer, mais une vacance prolongée, des travaux imprévus ou une baisse de marché peuvent effacer des années de rendement. La SCPI lisse ces aléas sur un grand nombre d'actifs.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Quel est le ticket d'entrée minimum pour une SCPI ?</h4>
              <p className="text-gray-600 dark:text-gray-400">La plupart des SCPI sont accessibles à partir de quelques parts, soit un investissement de 500 à 5 000 € selon le prix de souscription. Certaines plateformes proposent des fractions de parts dès 500 €.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'links',
      title: '',
      icon: ExternalLink,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex flex-wrap gap-3">
            <a href="/comparateur-scpi/" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Comparer les SCPI</a>
            <a href="/scpi-ou-lmnp/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">SCPI ou LMNP</a>
            <a href="/fiscalite-scpi/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Fiscalité SCPI</a>
            <a href="/articles/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Tous nos articles</a>
          </div>
        </div>
      )
    },
    {
      id: 'compliance',
      title: '',
      icon: Info,
      content: (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            Cette page est pédagogique. Elle ne constitue pas une recommandation personnalisée, un conseil en investissement ni un conseil fiscal individualisé. Avant toute souscription, il convient d'analyser votre situation, votre fiscalité, votre horizon d'investissement, vos objectifs et les documents réglementaires des SCPI.
          </p>
        </div>
      )
    }
  ];
}

// ========================================================================
// 3. SCPI OU ASSURANCE-VIE (SCPI en direct vs SCPI en AV)
// ========================================================================
function generateScpiOuAssuranceVie(): RichArticleSection[] {
  return [
    {
      id: 'intro',
      title: '',
      icon: Target,
      content: (
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Investir en SCPI en direct ou via une assurance-vie sont deux approches différentes, pas deux actifs concurrents. 
            L'assurance-vie offre une fiscalité allégée après 8 ans, une transmission optimisée et une liquidité facilitée, mais restreint le choix des SCPI disponibles dans le contrat. 
            Le direct offre la pleine propriété des parts, un choix illimité et l'accès au démembrement, mais une fiscalité plus lourde et une liquidité moins garantie. 
            Le choix dépend de votre TMI, votre horizon et votre objectif de transmission.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-600">
            <p className="text-gray-700 dark:text-gray-300"><strong>📌 Public concerné :</strong> Épargnants hésitant entre souscrire des SCPI en direct ou via leur contrat d'assurance-vie.</p>
          </div>
        </div>
      )
    },
    {
      id: 'comparison-table',
      title: 'SCPI en direct vs SCPI en assurance-vie',
      icon: BarChart3,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-3 text-left font-semibold">Critère</th>
                  <th className="p-3 text-left font-semibold">SCPI en direct</th>
                  <th className="p-3 text-left font-semibold">SCPI en assurance-vie</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Choix des SCPI', 'Illimité (toutes les SCPI du marché)', "Limité à la sélection de l'assureur"],
                  ['Fiscalité des revenus', 'Revenus fonciers + PS (17,2 %)', 'Imposition dans le contrat (prélèvement forfaitaire ou barème)'],
                  ['Fiscalité en sortie', 'Plus-value immobilière (19 % + PS)', 'Rachat soumis à PFU ou barème (abattement après 8 ans)'],
                  ['Transmission', 'Succession (droits de succession)', 'Hors succession (clause bénéficiaire)'],
                  ['Liquidité', 'Revente de parts (2-12 mois)', 'Rachat dans le contrat (délai variable selon assureur)'],
                  ['Démembrement', 'Possible (nue-propriété / usufruit)', 'Généralement pas ou très limité'],
                  ['Frais', 'Souscription 8-12 %, gestion 10-12 % HT', "Frais d'entrée du contrat + frais de gestion du contrat + frais des UC"],
                  ['Capitalisation des revenus', 'Possible si SCPI capitalisante', 'Possible selon le contrat (option capitalisation)'],
                  ['Montant minimum', '500 – 5 000 €', 'Variable selon le contrat et la part'],
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-850' : ''}>
                    <td className="p-3 font-medium">{row[0]}</td>
                    <td className="p-3">{row[1]}</td>
                    <td className="p-3">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: 'example',
      title: 'Cas pédagogique',
      icon: Calculator,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6">
            <p className="text-sm italic mb-4">
              Simulation pédagogique simplifiée, hors frais complets, hors évolution du prix des parts, sans garantie de rendement.
            </p>
            <p className="mb-4"><strong>Profil :</strong> Investisseur 55 ans, TMI 41 %, 100 000 € à investir, objectif revenus complémentaires dans 10 ans + transmission.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <h4 className="font-bold mb-2">SCPI en direct</h4>
                <ul className="space-y-1 text-sm">
                  <li>Choix libre des SCPI</li>
                  <li>Fiscalité : RF + PS (taux effectif ~58 %)</li>
                  <li>Rendement net après impôt : ~2,5 %</li>
                  <li>Transmission : droits de succession</li>
                  <li>Démembrement possible</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <h4 className="font-bold mb-2">SCPI en assurance-vie</h4>
                <ul className="space-y-1 text-sm">
                  <li>Choix limité aux UC du contrat</li>
                  <li>Fiscalité : PFU 30 % ou barème après 8 ans</li>
                  <li>Rendement net après impôt : ~4 %</li>
                  <li>Transmission : hors succession</li>
                  <li>Pas de démembrement possible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'errors',
      title: 'Erreurs fréquentes',
      icon: AlertTriangle,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="space-y-4">
            <div>
              <h4 className="font-bold mb-2">❌ Choisir uniquement sur le nombre de SCPI disponibles en AV</h4>
              <p className="text-gray-600 dark:text-gray-400">Un contrat avec 50 SCPI n'est pas forcément meilleur qu'un contrat avec 15 SCPI bien sélectionnées et suivies par l'assureur. La qualité du suivi et des frais prime sur la quantité.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Négliger les frais du contrat d'assurance-vie</h4>
              <p className="text-gray-600 dark:text-gray-400">Frais d'entrée (0-5 %), frais de gestion du contrat (0,5-1 %/an), frais des UC (supplémentaires) : ces frais s'ajoutent à ceux des SCPI et réduisent le rendement net.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Penser que l'AV est toujours fiscalement avantageuse</h4>
              <p className="text-gray-600 dark:text-gray-400">L'avantage fiscal de l'AV (abattement après 8 ans) ne concerne que les rachats, pas les revenus courants réinvestis dans le contrat. Pour un investisseur TMI 11 %, le direct peut être plus intéressant.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Investir en AV sans vérifier la qualité des UC SCPI</h4>
              <p className="text-gray-600 dark:text-gray-400">Toutes les SCPI proposées en AV ne sont pas de qualité équivalente. Vérifiez le rendement historique, le TOF, la capitalisation et la société de gestion avant de choisir une UC SCPI.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Questions fréquentes',
      icon: HelpCircle,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="space-y-6">
            <div>
              <h4 className="font-bold mb-2">Peut-on avoir à la fois des SCPI en direct et en AV ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Oui, c'est même une stratégie courante : les SCPI en AV pour les TMI élevées (fiscalité allégée) et les SCPI en direct pour le choix libre et le démembrement.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Les SCPI en AV sont-elles plus liquides ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Oui, généralement. Le rachat de parts dans un contrat d'assurance-vie est plus rapide que la revente de parts en direct, mais des délais et des frais de rachat peuvent s'appliquer selon le contrat.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Quels frais comparer entre direct et AV ?</h4>
              <p className="text-gray-600 dark:text-gray-400">En direct : frais de souscription (8-12 %) + frais de gestion (10-12 % HT des loyers). En AV : frais d'entrée du contrat + frais de gestion du contrat + frais des UC. Le total des frais en AV est souvent plus élevé.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Le démembrement est-il possible en AV ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Très rarement. Le démembrement de SCPI (nue-propriété / usufruit) n'est généralement pas proposé dans les contrats d'assurance-vie. C'est un avantage du direct.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Quelle est la fiscalité des SCPI en AV après 8 ans ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Après 8 ans, l'abattement annuel sur les rachats est de 4 600 € (célibataire) ou 9 200 € (couple). Au-delà, l'imposition se fait au PFU (30 %) ou au barème. Les revenus capitalisés dans le contrat ne sont pas imposés tant qu'il n'y a pas de rachat.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'links',
      title: '',
      icon: ExternalLink,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex flex-wrap gap-3">
            <a href="/scpi-assurance-vie/" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">SCPI en assurance-vie</a>
            <a href="/comparateur-scpi/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Comparer les SCPI</a>
            <a href="/fiscalite-scpi/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Fiscalité SCPI</a>
            <a href="/articles/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Tous nos articles</a>
          </div>
        </div>
      )
    },
    {
      id: 'compliance',
      title: '',
      icon: Info,
      content: (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            Cette page est pédagogique. Elle ne constitue pas une recommandation personnalisée, un conseil en investissement ni un conseil fiscal individualisé. Avant toute souscription, il convient d'analyser votre situation, votre fiscalité, votre horizon d'investissement, vos objectifs et les documents réglementaires des SCPI.
          </p>
        </div>
      )
    }
  ];
}

// ========================================================================
// 4. CAPITAL FIXE / CAPITAL VARIABLE
// ========================================================================
function generateCapitalFixeCapitalVariable(): RichArticleSection[] {
  return [
    {
      id: 'intro',
      title: '',
      icon: Target,
      content: (
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Les SCPI à capital variable et à capital fixe diffèrent fondamentalement sur le mécanisme d'émission et de retrait des parts. 
            En capital variable, la société de gestion émet ou supprime des parts selon la demande, à un prix fixé périodiquement. 
            En capital fixe, le nombre de parts est limité : les transactions passent par un marché secondaire au prix de l'offre et de la demande. 
            Cette différence a un impact direct sur la liquidité, le prix de souscription et la stabilité du capital.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-600">
            <p className="text-gray-700 dark:text-gray-300"><strong>📌 Public concerné :</strong> Investisseurs SCPI cherchant à comprendre la différence entre capital fixe et capital variable avant d'investir.</p>
          </div>
        </div>
      )
    },
    {
      id: 'comparison-table',
      title: 'Capital fixe vs capital variable',
      icon: BarChart3,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-3 text-left font-semibold">Critère</th>
                  <th className="p-3 text-left font-semibold">Capital variable</th>
                  <th className="p-3 text-left font-semibold">Capital fixe</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Émission de parts', 'Continue (selon la demande)', 'Limitée au nombre de parts existantes'],
                  ['Prix de souscription', 'Fixe (révisé périodiquement par la SG)', 'Libre (marché secondaire, offre/demande)'],
                  ['Retrait des parts', 'La SG rachète au prix de retrait', 'Pas de rachat par la SG : vente sur le marché'],
                  ['Liquidité', 'Fonction des nouvelles souscriptions', 'Fonction du carnet d\'ordres'],
                  ['Suspension', 'Possible si déséquilibre souscriptions/retraits', 'Pas de suspension (marché secondaire)'],
                  ['Décote possible', 'Non (le prix est fixé par la SG)', 'Oui, si offre > demande'],
                  ['Surcote possible', 'Non (le prix est fixé par la SG)', 'Oui, si demande > offre'],
                  ['Stabilité du capital', 'Variable (fluctuation des souscriptions)', 'Stable (capital fixe)'],
                  ['Rôle de la SG', 'Ajuste le capital selon la demande', 'Ne gère pas le marché secondaire'],
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-850' : ''}>
                    <td className="p-3 font-medium">{row[0]}</td>
                    <td className="p-3">{row[1]}</td>
                    <td className="p-3">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: 'mechanism',
      title: 'Comprendre le mécanisme',
      icon: BookOpen,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-2xl font-bold mb-4">Comment fonctionne chaque structure ?</h3>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p><strong>SCPI à capital variable :</strong> Le capital de la SCPI évolue en permanence. Quand un investisseur souscrit, la société de gestion crée de nouvelles parts. Quand un investisseur demande le retrait, la SG rachète les parts (dans la limite des nouvelles souscriptions). Le prix de souscription et de retrait est fixé par la SG et révisé périodiquement. La liquidité dépend de l'équilibre entre souscriptions et retraits.</p>
            <p><strong>SCPI à capital fixe :</strong> Le nombre de parts est fixe. Pour acheter ou vendre des parts, les investisseurs passent par un marché secondaire (hors Bourse, de gré à gré ou via un intermédiaire). Le prix se forme librement selon l'offre et la demande. La SG n'intervient pas dans la transaction. Il peut y avoir une décote ou une surcote par rapport à la valeur de reconstitution.</p>
          </div>
        </div>
      )
    },
    {
      id: 'errors',
      title: 'Erreurs fréquentes',
      icon: AlertTriangle,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="space-y-4">
            <div>
              <h4 className="font-bold mb-2">❌ Croire que le capital variable garantit une liquidité immédiate</h4>
              <p className="text-gray-600 dark:text-gray-400">La SG n'est pas tenue de racheter les parts si les souscriptions sont insuffisantes. En cas de crise, le retrait peut être suspendu. La liquidité n'est jamais garantie.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Penser que le capital fixe est toujours décoté</h4>
              <p className="text-gray-600 dark:text-gray-400">Certaines SCPI à capital fixe peuvent se négocier avec une surcote si la demande est forte. La décote dépend du marché et de la qualité perçue de la SCPI.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Ignorer le risque de suspension en capital variable</h4>
              <p className="text-gray-600 dark:text-gray-400">Plusieurs SCPI à capital variable ont suspendu le retrait de leurs parts lors de la crise immobilière 2008-2012. Investir sans horizon de 8-10 ans expose à un blocage temporaire.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Choisir capital fixe sans vérifier le marché secondaire</h4>
              <p className="text-gray-600 dark:text-gray-400">Si le marché secondaire est peu actif, la revente peut prendre plusieurs mois, voire dépasser un an. Vérifiez le nombre de transactions récentes avant d'investir.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Questions fréquentes',
      icon: HelpCircle,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="space-y-6">
            <div>
              <h4 className="font-bold mb-2">Quel type de capital est le plus répandu ?</h4>
              <p className="text-gray-600 dark:text-gray-400">La majorité des SCPI françaises sont à capital variable. Le capital fixe concerne principalement des SCPI historiques ou à taille limitée. Avant d'investir, vérifiez le statut dans le DIC ou la note d'information.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Le prix de souscription est-il le même que le prix de retrait en capital variable ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Non. Le prix de souscription inclut les frais d'entrée. Le prix de retrait est égal au prix de souscription moins les frais (généralement 8-12 % inférieur). La différence constitue la décote de souscription.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Une SCPI à capital fixe peut-elle devenir à capital variable ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Théoriquement oui, si l'assemblée générale des associés vote le changement de statut. C'est rare, mais cela arrive lors de restructurations. Les statuts de la SCPI doivent être modifiés en conséquence.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Quel impact sur la liquidité ?</h4>
              <p className="text-gray-600 dark:text-gray-400">En capital variable, la liquidité dépend de l'activité de souscription. En capital fixe, elle dépend de l'activité du marché secondaire. Dans les deux cas, le délai de revente peut aller de quelques semaines à plusieurs mois.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'links',
      title: '',
      icon: ExternalLink,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex flex-wrap gap-3">
            <a href="/comparateur-scpi/" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Comparer les SCPI</a>
            <a href="/liquidite-scpi/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Liquidité SCPI</a>
            <a href="/baisse-prix-part-scpi/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Baisse du prix de part</a>
            <a href="/articles/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Tous nos articles</a>
          </div>
        </div>
      )
    },
    {
      id: 'compliance',
      title: '',
      icon: Info,
      content: (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            Cette page est pédagogique. Elle ne constitue pas une recommandation personnalisée, un conseil en investissement ni un conseil fiscal individualisé. Avant toute souscription, il convient d'analyser votre situation, votre fiscalité, votre horizon d'investissement, vos objectifs et les documents réglementaires des SCPI.
          </p>
        </div>
      )
    }
  ];
}

// ========================================================================
// 5. BULLETIN TRIMESTRIEL SCPI
// ========================================================================
function generateBulletinTrimestriel(): RichArticleSection[] {
  return [
    {
      id: 'intro',
      title: '',
      icon: Target,
      content: (
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Le bulletin trimestriel (BT) est le document d'information périodique publié par une SCPI. Il permet de suivre l'activité locative, la collecte, la distribution et les principaux indicateurs de performance. 
            Contrairement au rapport annuel, il n'est pas certifié par un commissaire aux comptes, mais il donne une vision régulière de la santé de la SCPI. 
            Savoir lire un BT est essentiel pour surveiller son investissement entre deux rapports annuels et détecter les signaux faibles.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-600">
            <p className="text-gray-700 dark:text-gray-300"><strong>📌 Public concerné :</strong> Investisseurs SCPI qui souhaitent suivre leurs investissements et comprendre les bulletins trimestriels.</p>
          </div>
        </div>
      )
    },
    {
      id: 'reading-table',
      title: 'Guide de lecture du bulletin trimestriel',
      icon: BarChart3,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-2xl font-bold mb-6">Rubrique du bulletin — Ce qu'il faut regarder</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-3 text-left font-semibold">Rubrique</th>
                  <th className="p-3 text-left font-semibold">Ce que cela signifie</th>
                  <th className="p-3 text-left font-semibold">Pourquoi c'est important</th>
                  <th className="p-3 text-left font-semibold">Point de vigilance</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Période concernée', 'Trimestre couvert par le bulletin', 'Vérifier que le bulletin est à jour', 'Un retard de publication peut être un signal faible'],
                  ['Distribution trimestrielle', 'Montant distribué par part sur le trimestre', 'Permet de calculer le rendement courant', 'Comparer avec le trimestre précédent et N-1'],
                  ['Taux de distribution (TDVM)', 'Rendement annualisé basé sur la distribution', 'Indicateur de performance clé', 'Un TDVM qui baisse sur plusieurs trimestres mérite analyse'],
                  ['Collecte nette', 'Différence entre souscriptions et retraits', 'Reflet de la confiance des investisseurs', 'Une collecte négative peut indiquer une défiance'],
                  ['Capitalisation', 'Taille totale de la SCPI (valeur des parts)', 'Impact sur la mutualisation des risques', 'Une capitalisation qui fond = des associés qui partent'],
                  ["Nombre d'associés", 'Nombre d\'investisseurs dans la SCPI', 'Indicateur de notoriété et de dispersion', 'Stable ou en hausse = bonne santé'],
                  ["Prix de souscription", "Prix d'entrée dans la SCPI pour un nouvel investisseur", 'Peut avoir été révisé par la SG', 'Une hausse de prix peut réduire le rendement futur'],
                  ["Délai de jouissance", "Délai avant de percevoir les premiers revenus après souscription", 'Impact sur le rendement réel la première année', 'Un délai long réduit le rendement effectif'],
                  ['TOF / TOP', "Taux d'occupation financier ou physique", "Reflet du taux d'occupation du patrimoine", "Un TOF < 90 % mérite une explication de la SG"],
                  ['Acquisitions / Arbitrages', 'Achats ou ventes d\'immeubles sur le trimestre', 'Stratégie d\'investissement de la SG', 'Absence d\'acquisition sur plusieurs trimestres = attentisme'],
                  ['Dette / Endettement', 'Niveau d\'endettement et échéances', 'Risque financier de la SCPI', 'Une hausse rapide de l\'endettement peut être un signal'],
                  ['Report à nouveau', 'Réserves accumulées non distribuées', 'Capacité à maintenir la distribution', 'Un RAN qui baisse = distribution non couverte par les loyers'],
                  ['Commentaire de gestion', 'Analyse de la SG sur le trimestre', 'Comprendre la stratégie et les perspectives', 'Un commentaire vague peut masquer des difficultés'],
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-850' : ''}>
                    <td className="p-3 font-medium">{row[0]}</td>
                    <td className="p-3">{row[1]}</td>
                    <td className="p-3">{row[2]}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: 'limits',
      title: 'Limites du bulletin trimestriel',
      icon: AlertTriangle,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-2xl font-bold mb-4">Ce que le BT ne dit pas</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-bold mb-2">Pas d'expertise du patrimoine</h4>
              <p className="text-gray-600 dark:text-gray-400">La valeur de reconstitution et la valeur de réalisation ne sont actualisées que dans le rapport annuel. Le BT ne donne pas d'indication sur l'évolution de la valeur du patrimoine.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Pas de certification</h4>
              <p className="text-gray-600 dark:text-gray-400">Le BT n'est pas audité par un commissaire aux comptes. Les chiffres sont fournis par la société de gestion sans contrôle externe. Le rapport annuel seul est certifié.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Pas de comptes détaillés</h4>
              <p className="text-gray-600 dark:text-gray-400">Le BT ne contient pas le compte de résultat ni le bilan détaillé. Pour une analyse financière complète, il faut attendre le rapport annuel.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Données partielles</h4>
              <p className="text-gray-600 dark:text-gray-400">Certains indicateurs (frais, ventilation sectorielle détaillée, maturité de la dette) peuvent ne pas figurer dans le BT. Le rapport annuel reste la source complète.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'method',
      title: 'Méthode MaximusSCPI : comment nous lisons les BT',
      icon: Shield,
      content: (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 mb-8">
          <h3 className="text-2xl font-bold mb-4">Notre check-list de lecture</h3>
          <p className="mb-4">Chaque trimestre, nous vérifions ces points pour les SCPI suivies :</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <h4 className="font-bold mb-2">Indicateurs de performance</h4>
              <ul className="text-sm space-y-1">
                <li>✓ Distribution en hausse, stable ou baisse ?</li>
                <li>✓ TOF stable ou en baisse ?</li>
                <li>✓ Collecte nette positive ?</li>
                <li>✓ Capitalisation en hausse ?</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <h4 className="font-bold mb-2">Signaux faibles</h4>
              <ul className="text-sm space-y-1">
                <li>✓ BT publié dans les délais ?</li>
                <li>✓ Commentaire de gestion transparent ?</li>
                <li>✓ Acquisitions récentes cohérentes ?</li>
                <li>✓ Endettement maîtrisé ?</li>
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
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="space-y-6">
            <div>
              <h4 className="font-bold mb-2">Où trouver le bulletin trimestriel d'une SCPI ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Le BT est généralement publié sur le site internet de la société de gestion, dans l'espace associés ou la rubrique documentation. Il peut aussi être envoyé par email aux associés.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Quelle est la différence entre le BT et le rapport annuel ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Le BT est un document d'information périodique non certifié. Le rapport annuel est certifié par un commissaire aux comptes et contient les comptes annuels, l'expertise du patrimoine et le rapport de gestion.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Le BT est-il obligatoire ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Oui, les SCPI doivent publier un bulletin trimestriel dans un délai maximum de deux mois après la fin de chaque trimestre civil (ou du trimestre de clôture de la SCPI).</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Quels indicateurs surveiller en priorité ?</h4>
              <p className="text-gray-600 dark:text-gray-400">La distribution trimestrielle, le TOF, la collecte nette, la capitalisation et le nombre d'associés sont les indicateurs les plus importants à suivre trimestre après trimestre.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Un retard de publication est-il grave ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Un retard ponctuel peut être technique, mais des retards répétés ou un BT manquant peuvent indiquer des difficultés internes. C'est un signal faible à prendre en compte.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'links',
      title: '',
      icon: ExternalLink,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex flex-wrap gap-3">
            <a href="/rapport-annuel-scpi/" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Lire un rapport annuel</a>
            <a href="/documents-reglementaires-scpi/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Documents réglementaires</a>
            <a href="/tof-scpi/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">TOF SCPI</a>
            <a href="/articles/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Tous nos articles</a>
          </div>
        </div>
      )
    },
    {
      id: 'compliance',
      title: '',
      icon: Info,
      content: (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            Cette page est pédagogique. Elle ne constitue pas une recommandation personnalisée, un conseil en investissement ni un conseil fiscal individualisé. Avant toute souscription, il convient d'analyser votre situation, votre fiscalité, votre horizon d'investissement, vos objectifs et les documents réglementaires des SCPI.
          </p>
        </div>
      )
    }
  ];
}

// ========================================================================
// 6. RAPPORT ANNUEL SCPI
// ========================================================================
function generateRapportAnnuel(): RichArticleSection[] {
  return [
    {
      id: 'intro',
      title: '',
      icon: Target,
      content: (
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Le rapport annuel est le document de référence d'une SCPI. Contrairement au bulletin trimestriel, il est certifié par un commissaire aux comptes et contient les comptes annuels, l'expertise du patrimoine immobilier, la valeur de reconstitution et le rapport de gestion. 
            C'est le seul document qui permet une analyse financière complète et fiable de la SCPI. 
            Savoir lire un rapport annuel est indispensable avant d'investir ou pour suivre un investissement existant.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-600">
            <p className="text-gray-700 dark:text-gray-300"><strong>📌 Public concerné :</strong> Investisseurs SCPI souhaitant analyser en profondeur leurs investissements via le rapport annuel.</p>
          </div>
        </div>
      )
    },
    {
      id: 'reading-table',
      title: 'Guide de lecture du rapport annuel',
      icon: BarChart3,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-2xl font-bold mb-6">Sections du rapport annuel</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-3 text-left font-semibold">Section du rapport annuel</th>
                  <th className="p-3 text-left font-semibold">Information à extraire</th>
                  <th className="p-3 text-left font-semibold">Utilité pour l'investisseur</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Rapport de gestion', 'Stratégie, faits marquants, perspectives', 'Comprendre la vision de la SG et les événements de l\'année'],
                  ['Compte de résultat', 'Loyers perçus, charges, distribution', 'Vérifier que les loyers couvrent la distribution'],
                  ['Bilan', 'Actif immobilier, dettes, capitaux propres', 'Analyser la structure financière et le niveau d\'endettement'],
                  ['Patrimoine immobilier', 'Liste des immeubles, surfaces, taux d\'occupation', 'Vérifier la diversification et la qualité du patrimoine'],
                  ['Expertise immobilière', 'Valeur vénale des immeubles (expert indépendant)', 'Évaluer la valeur réelle du patrimoine et la décote/surcote'],
                  ['Valeur de reconstitution', 'Prix de reconstitution du patrimoine par part', 'Comparer avec le prix de souscription pour détecter une surcote'],
                  ['Valeur de réalisation', 'Valeur nette du patrimoine après frais', 'Indicateur de la valeur de sortie potentielle'],
                  ['Distribution (TDVM, DVM)', 'Taux de distribution, montant distribué par part', 'Mesurer le rendement réel de la SCPI'],
                  ['TOF / TOP', 'Taux d\'occupation financier ou physique', 'Évaluer le taux d\'occupation du patrimoine'],
                  ['Frais', 'Frais de gestion, frais de souscription, autres frais', 'Comprendre l\'impact des frais sur le rendement'],
                  ["Rapport du commissaire aux comptes", 'Certification des comptes, réserves éventuelles', 'Vérifier la fiabilité des comptes'],
                  ['Rapport spécial sur les conventions réglementées', 'Conventions entre la SG et la SCPI', 'Détecter d\'éventuels conflits d\'intérêts'],
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-850' : ''}>
                    <td className="p-3 font-medium">{row[0]}</td>
                    <td className="p-3">{row[1]}</td>
                    <td className="p-3">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: 'key-points',
      title: 'Les 5 points à vérifier en priorité',
      icon: CheckCircle,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="space-y-6">
            <div>
              <h4 className="font-bold mb-2">1. La distribution est-elle couverte par les loyers ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Comparez le montant total des loyers perçus avec le montant total distribué. Si la distribution dépasse les loyers, la SCPI puise dans ses réserves (report à nouveau), ce qui n'est pas viable à long terme.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">2. La valeur de reconstitution progresse-t-elle ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Comparez la valeur de reconstitution par part sur 3-5 ans. Une baisse régulière peut indiquer une dégradation de la qualité du patrimoine ou des expertises trop optimistes les années précédentes.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">3. Le TOF est-il stable ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Un TOF en baisse sur plusieurs années peut indiquer des difficultés locatives structurelles. Vérifiez également le TOP (taux d'occupation physique) s'il est publié.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">4. L'endettement est-il maîtrisé ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Un endettement excessif ({'>'} 40-50 %) peut fragiliser la SCPI en cas de hausse des taux. Vérifiez aussi la maturité de la dette et la part à taux fixe ou variable.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">5. Y a-t-il des réserves dans le rapport du commissaire aux comptes ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Le commissaire aux comptes peut émettre des réserves sur la fiabilité des comptes. Des réserves répétées ou graves doivent alerter l'investisseur.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'errors',
      title: 'Erreurs fréquentes',
      icon: AlertTriangle,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="space-y-4">
            <div>
              <h4 className="font-bold mb-2">❌ Se fier uniquement au taux de distribution</h4>
              <p className="text-gray-600 dark:text-gray-400">Un TDVM élevé peut masquer une distribution non couverte par les loyers, une baisse de la valeur du patrimoine ou une augmentation du risque. Croisez toujours le rendement avec les autres indicateurs.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Ignorer le rapport du commissaire aux comptes</h4>
              <p className="text-gray-600 dark:text-gray-400">C'est la seule section certifiée du rapport annuel. Si le commissaire émet des réserves, c'est un signal d'alarme important qui mérite une analyse approfondie.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Ne pas comparer avec les années précédentes</h4>
              <p className="text-gray-600 dark:text-gray-400">Un rapport annuel isolé ne permet pas de déceler les tendances. Comparez les indicateurs sur 3 à 5 ans pour évaluer la trajectoire de la SCPI.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Oublier de vérifier les conventions réglementées</h4>
              <p className="text-gray-600 dark:text-gray-400">Les conventions entre la société de gestion et la SCPI (prestations de services, refacturations) peuvent cacher des frais supplémentaires ou des conflits d'intérêts.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Questions fréquentes',
      icon: HelpCircle,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="space-y-6">
            <div>
              <h4 className="font-bold mb-2">Où trouver le rapport annuel d'une SCPI ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Le rapport annuel est disponible sur le site de la société de gestion, généralement dans l'espace documentation ou espace associés. Il peut aussi être demandé directement à la SG.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Quelle est la différence entre valeur de reconstitution et valeur de réalisation ?</h4>
              <p className="text-gray-600 dark:text-gray-400">La valeur de reconstitution est le coût de reconstruction du patrimoine à l'identique. La valeur de réalisation est la valeur nette après frais de cession. La différence entre ces deux valeurs donne une indication sur la liquidité du patrimoine.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Le rapport annuel est-il obligatoire ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Oui, toute SCPI doit publier un rapport annuel certifié dans les six mois suivant la clôture de l'exercice. C'est une obligation réglementaire (AMF).</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Que faire si une SCPI ne publie pas son rapport annuel ?</h4>
              <p className="text-gray-600 dark:text-gray-400">C'est un signal très préoccupant. En tant qu'associé, vous pouvez exiger la communication du rapport annuel. En cas de refus persistant, vous pouvez saisir l'AMF.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'links',
      title: '',
      icon: ExternalLink,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex flex-wrap gap-3">
            <a href="/bulletin-trimestriel-scpi/" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Lire un bulletin trimestriel</a>
            <a href="/dic-scpi/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">DIC SCPI</a>
            <a href="/documents-reglementaires-scpi/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Documents réglementaires</a>
            <a href="/articles/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Tous nos articles</a>
          </div>
        </div>
      )
    },
    {
      id: 'compliance',
      title: '',
      icon: Info,
      content: (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            Cette page est pédagogique. Elle ne constitue pas une recommandation personnalisée, un conseil en investissement ni un conseil fiscal individualisé. Avant toute souscription, il convient d'analyser votre situation, votre fiscalité, votre horizon d'investissement, vos objectifs et les documents réglementaires des SCPI.
          </p>
        </div>
      )
    }
  ];
}

// ========================================================================
// 7. DÉLAI DE REVENTE SCPI
// ========================================================================
function generateDelaiRevente(): RichArticleSection[] {
  return [
    {
      id: 'intro',
      title: '',
      icon: Target,
      content: (
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Revendre des parts de SCPI peut prendre de quelques semaines à plus d'un an, selon le type de capital (fixe ou variable), l'état du marché et la SCPI concernée. 
            La liquidité des SCPI n'est pas garantie : elle dépend du mécanisme de retrait (capital variable) ou de l'activité du marché secondaire (capital fixe). 
            Avant d'investir, il est essentiel de comprendre les délais potentiels et les conditions de revente pour ne pas être pris au dépourvu.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-600">
            <p className="text-gray-700 dark:text-gray-300"><strong>📌 Public concerné :</strong> Investisseurs SCPI qui s'interrogent sur les conditions et délais de revente des parts.</p>
          </div>
        </div>
      )
    },
    {
      id: 'mechanism',
      title: 'Comment fonctionne la revente ?',
      icon: BookOpen,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-2xl font-bold mb-4">Deux mécanismes selon le type de capital</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
              <h4 className="font-bold mb-3">SCPI à capital variable</h4>
              <p className="text-sm mb-3">Vous demandez le rachat de vos parts à la société de gestion. La SG rachète vos parts au prix de retrait (prix de souscription moins les frais). Le rachat est compensé par les nouvelles souscriptions. La SG peut suspendre le rachat si les souscriptions sont insuffisantes.</p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-sm">
                <p><strong>Délai théorique :</strong> Quelques jours à quelques semaines</p>
                <p><strong>Délai réel :</strong> 1 à 12 mois (variable selon l'activité)</p>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
              <h4 className="font-bold mb-3">SCPI à capital fixe</h4>
              <p className="text-sm mb-3">Vous vendez vos parts sur le marché secondaire. Le prix est libre, déterminé par l'offre et la demande. La société de gestion n'intervient pas. Le délai dépend de la présence d'acheteurs et du prix demandé.</p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-sm">
                <p><strong>Délai théorique :</strong> Variable selon le carnet d'ordres</p>
                <p><strong>Délai réel :</strong> 2 à 18 mois (ou plus si peu de demande)</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'delays-table',
      title: 'Délais constatés',
      icon: Clock,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-2xl font-bold mb-4">Délais de revente par situation</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-3 text-left font-semibold">Situation</th>
                  <th className="p-3 text-left font-semibold">Délai estimé</th>
                  <th className="p-3 text-left font-semibold">Risque</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Marché normal, SCPI active (capital variable)', '2 à 4 semaines', 'Faible si souscriptions régulières'],
                  ['Marché normal, SCPI active (capital fixe)', '1 à 6 mois', 'Moyen (dépend du carnet d\'ordres)'],
                  ['Marché tendu (crise, collecte négative)', '6 à 12 mois ou plus', 'Élevé (suspension possible)'],
                  ['SCPI de petite taille (< 100 M€)', '3 à 12 mois', 'Élevé (peu d\'acheteurs potentiels)'],
                  ['SCPI de grande taille (> 1 Md€)', '2 à 6 mois', 'Moyen (plus de liquidité)'],
                  ['Revente avec décote acceptée', 'Plus rapide (si acheteur)', 'Décote sur le prix'],
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-850' : ''}>
                    <td className="p-3 font-medium">{row[0]}</td>
                    <td className="p-3">{row[1]}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: 'errors',
      title: 'Erreurs fréquentes',
      icon: AlertTriangle,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="space-y-4">
            <div>
              <h4 className="font-bold mb-2">❌ Investir sans horizon de 8 à 10 ans</h4>
              <p className="text-gray-600 dark:text-gray-400">Les SCPI sont des placements immobiliers non liquides à court terme. Investir de l'argent dont vous pourriez avoir besoin dans les 5 ans expose à un blocage ou une revente à perte.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Croire que la revente est immédiate</h4>
              <p className="text-gray-600 dark:text-gray-400">Même en capital variable, la SG n'est pas tenue de racheter immédiatement. Le délai dépend du flux de souscriptions. Certaines SCPI ont suspendu le retrait pendant plusieurs mois.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Choisir une SCPI sans vérifier ses conditions de retrait</h4>
              <p className="text-gray-600 dark:text-gray-400">Chaque SCPI a des conditions de retrait spécifiques (délai, prix, suspension). Ces informations figurent dans la note d'information et le DIC. Vérifiez-les avant d'investir.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Ignorer les frais et la fiscalité de cession</h4>
              <p className="text-gray-600 dark:text-gray-400">La revente de parts de SCPI peut générer une plus-value imposable (19 % + PS) et des frais de cession. En cas de décote, la moins-value est également possible.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Questions fréquentes',
      icon: HelpCircle,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="space-y-6">
            <div>
              <h4 className="font-bold mb-2">Peut-on vendre ses parts de SCPI à tout moment ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Oui, la demande de retrait peut être faite à tout moment. Mais le délai d'exécution n'est pas garanti. En capital variable, la SG traite les demandes dans l'ordre d'arrivée, en fonction des souscriptions.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Quel est le prix de revente des parts ?</h4>
              <p className="text-gray-600 dark:text-gray-400">En capital variable, le prix de retrait est fixé par la SG (généralement le prix de souscription moins les frais). En capital fixe, le prix est libre et peut être inférieur ou supérieur au prix de souscription initial.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Que se passe-t-il si la SCPI suspend les retraits ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Les associés doivent attendre la reprise des retraits. La SG peut fixer des conditions (quotas, ordre de priorité). Il est impossible de forcer la revente pendant une suspension.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Comment améliorer ses chances de revente rapide ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Accepter une décote sur le prix peut accélérer la revente, surtout en capital fixe. Pour le capital variable, il faut que les souscriptions soient actives. Une SCPI de grande taille et bien gérée sera plus liquide.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">La fiscalité est-elle différente en cas de revente avec décote ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Si vous revendez à perte (moins-value), il n'y a pas d'impôt sur la plus-value (puisqu'il n'y a pas de gain). La moins-value peut être imputée sur d'éventuelles plus-values immobilières futures, dans certaines limites.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'links',
      title: '',
      icon: ExternalLink,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex flex-wrap gap-3">
            <a href="/liquidite-scpi/" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Liquidité SCPI</a>
            <a href="/risques-scpi/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Risques SCPI</a>
            <a href="/baisse-prix-part-scpi/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Baisse du prix de part</a>
            <a href="/articles/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Tous nos articles</a>
          </div>
        </div>
      )
    },
    {
      id: 'compliance',
      title: '',
      icon: Info,
      content: (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            Cette page est pédagogique. Elle ne constitue pas une recommandation personnalisée, un conseil en investissement ni un conseil fiscal individualisé. Avant toute souscription, il convient d'analyser votre situation, votre fiscalité, votre horizon d'investissement, vos objectifs et les documents réglementaires des SCPI.
          </p>
        </div>
      )
    }
  ];
}

// ========================================================================
// 8. INVESTIR EN SCPI APRÈS 50 ANS
// ========================================================================
function generateApres50Ans(): RichArticleSection[] {
  return [
    {
      id: 'intro',
      title: '',
      icon: Target,
      content: (
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Investir en SCPI après 50 ans répond à des objectifs spécifiques : préparer sa retraite, générer des revenus complémentaires, optimiser sa fiscalité et organiser sa transmission. 
            L'horizon de placement (15-20 ans à 50 ans) reste compatible avec les SCPI, mais les priorités évoluent : la recherche de revenus immédiats peut primer sur la croissance du capital. 
            Le choix de l'enveloppe (direct ou assurance-vie), du démembrement et des SCPI elles-mêmes doit être adapté à cette phase de vie.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-600">
            <p className="text-gray-700 dark:text-gray-300"><strong>📌 Public concerné :</strong> Investisseurs de 50 à 65 ans cherchant à adapter leur stratégie SCPI à leur âge et à leurs objectifs.</p>
          </div>
        </div>
      )
    },
    {
      id: 'keys',
      title: 'Points clés à 50-65 ans',
      icon: MapPin,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <h4 className="font-bold mb-2">Horizon de placement</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">À 50 ans, l'espérance de vie permet encore un horizon de 15-30 ans. Les SCPI restent pertinentes, mais la part investie doit tenir compte des besoins de cash à 5-10 ans.</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <h4 className="font-bold mb-2">Revenus complémentaires</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Les SCPI distribuent des revenus trimestriels qui peuvent compléter une pension de retraite. C'est l'objectif principal après 50 ans pour de nombreux investisseurs.</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <h4 className="font-bold mb-2">Fiscalité</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">La TMI peut baisser à la retraite (passage de 41 % à 30 %). Les SCPI en assurance-vie permettent de différer l'impôt et d'optimiser la fiscalité des revenus.</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
              <h4 className="font-bold mb-2">Transmission</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">L'assurance-vie permet une transmission hors succession. Le démembrement (nue-propriété aux enfants, usufruit pour soi) permet de transmettre tout en gardant des revenus.</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
              <h4 className="font-bold mb-2">Liquidité</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Plus on avance en âge, plus le besoin de liquidité potentiel augmente (santé, dépendance). Ne pas surinvestir en SCPI au détriment d'une épargne de précaution disponible.</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
              <h4 className="font-bold mb-2">Cohérence patrimoniale</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">La part des SCPI dans le patrimoine global doit être cohérente avec l'ensemble des actifs (immobilier direct, financier, liquidités) et les besoins futurs.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'errors',
      title: 'Erreurs fréquentes',
      icon: AlertTriangle,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="space-y-4">
            <div>
              <h4 className="font-bold mb-2">❌ Surinvestir en SCPI sans liquidités de précaution</h4>
              <p className="text-gray-600 dark:text-gray-400">Après 50 ans, le besoin de cash peut augmenter (santé, aidant, travaux). Ne pas bloquer tout son patrimoine dans des SCPI non liquides. Gardez 6 à 12 mois de dépenses disponibles.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Ignorer l'assurance-vie pour la transmission</h4>
              <p className="text-gray-600 dark:text-gray-400">L'assurance-vie permet de transmettre des SCPI hors succession avec un abattement de 152 500 € par bénéficiaire. C'est un outil fiscal puissant après 50 ans.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Choisir des SCPI trop risquées pour le rendement</h4>
              <p className="text-gray-600 dark:text-gray-400">À l'approche de la retraite, la préservation du capital et la régularité des revenus priment. Privilégiez des SCPI historiques, diversifiées, avec un TOF stable et une société de gestion solide.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Ne pas anticiper la transmission</h4>
              <p className="text-gray-600 dark:text-gray-400">La donation de parts de SCPI ou la mise en place d'un démembrement prend du temps. Anticiper permet d'optimiser fiscalement et d'éviter des droits de succession élevés.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Questions fréquentes',
      icon: HelpCircle,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="space-y-6">
            <div>
              <h4 className="font-bold mb-2">Est-il encore temps d'investir en SCPI à 60 ans ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Oui, l'espérance de vie à 60 ans est de 25-30 ans, ce qui laisse un horizon suffisant. Privilégiez les SCPI distributives pour des revenus réguliers et l'assurance-vie pour la transmission.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Faut-il privilégier le démembrement après 50 ans ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Le démembrement (achat en nue-propriété) consiste à investir sans recevoir de revenus pendant une période, puis à récupérer l'usufruit. Cette stratégie est intéressante si vous n'avez pas besoin de revenus immédiats et que vous souhaitez transmettre. À 50-55 ans, un démembrement sur 10-15 ans peut être cohérent.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Quelle part de son patrimoine investir en SCPI après 50 ans ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Il n'y a pas de règle universelle. Une piste à étudier : 20-40 % du patrimoine financier en SCPI, en fonction de votre tolérance au risque, de vos autres actifs immobiliers et de vos besoins de liquidité.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Les SCPI sont-elles adaptées pour préparer sa retraite ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Oui, elles peuvent constituer un complément de retraite via les distributions trimestrielles. Le PER et l'assurance-vie sont d'autres enveloppes à considérer selon votre situation fiscale et votre horizon.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Quel est le risque de liquidité après 70 ans ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Le risque est réel si vous avez besoin de cash rapidement. À partir de 70-75 ans, il est prudent de réduire la part des SCPI dans votre patrimoine ou d'investir via l'assurance-vie pour faciliter les rachats.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'links',
      title: '',
      icon: ExternalLink,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex flex-wrap gap-3">
            <a href="/scpi-retraite/" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">SCPI et retraite</a>
            <a href="/scpi-revenus-complementaires/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Revenus complémentaires</a>
            <a href="/scpi-transmission/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Transmission SCPI</a>
            <a href="/articles/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Tous nos articles</a>
          </div>
        </div>
      )
    },
    {
      id: 'compliance',
      title: '',
      icon: Info,
      content: (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            Cette page est pédagogique. Elle ne constitue pas une recommandation personnalisée, un conseil en investissement ni un conseil fiscal individualisé. Avant toute souscription, il convient d'analyser votre situation, votre fiscalité, votre horizon d'investissement, vos objectifs et les documents réglementaires des SCPI.
          </p>
        </div>
      )
    }
  ];
}

// ========================================================================
// 9. SCPI POUR NON-RÉSIDENT FISCAL
// ========================================================================
function generateNonResident(): RichArticleSection[] {
  return [
    {
      id: 'intro',
      title: '',
      icon: Target,
      content: (
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Investir en SCPI en tant que non-résident fiscal est possible, mais la fiscalité applicable dépend de votre pays de résidence, de l'existence d'une convention fiscale avec la France et de la nature des revenus perçus. 
            Les revenus distribués par des SCPI françaises sont considérés comme des revenus fonciers de source française, soumis à un prélèvement à la source dans certains cas. 
            La situation est différente selon que vous êtes résident de l'UE, d'un pays conventionné ou d'un État tiers, et selon les SCPI (françaises ou européennes). 
            Un conseil fiscal spécialisé est indispensable avant d'investir.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-600">
            <p className="text-gray-700 dark:text-gray-300"><strong>📌 Public concerné :</strong> Expatriés français et non-résidents fiscaux souhaitant investir en SCPI.</p>
          </div>
        </div>
      )
    },
    {
      id: 'verification-table',
      title: 'Points à vérifier pour un non-résident',
      icon: MapPin,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-2xl font-bold mb-6">Guide de vérification avant d'investir</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-3 text-left font-semibold">Point à vérifier</th>
                  <th className="p-3 text-left font-semibold">Pourquoi c'est important</th>
                  <th className="p-3 text-left font-semibold">Document ou source à consulter</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Résidence fiscale actuelle', 'La fiscalité applicable dépend du pays de résidence, pas de la nationalité', 'Avis d\'imposition du pays de résidence, certificat de résidence fiscale'],
                  ['Convention fiscale France — pays de résidence', 'Peut exonérer ou limiter l\'imposition en France', 'BOFiP, site impots.gouv.fr (conventions fiscales)'],
                  ['Prélèvement à la source en France', 'Les revenus fonciers de source française sont soumis à un prélèvement de 20 % (hors UE) ou 12 % (UE)', 'DIC de la SCPI, IFU (imprimé fiscal unique)'],
                  ['Imposition dans le pays de résidence', 'Les revenus perçus peuvent être imposés dans le pays de résidence (avec ou sans crédit d\'impôt)', 'Législation fiscale locale, conseiller fiscal local'],
                  ['SCPI françaises ou européennes', 'Les SCPI européennes peuvent avoir une fiscalité différente', 'DIC et note d\'information de chaque SCPI'],
                  ['Risque de double imposition', 'Certains revenus peuvent être imposés deux fois sans convention', 'Convention fiscale applicable, conseiller fiscal'],
                  ['Banque et devise', 'Les revenus sont versés en euros. Frais de change et IBAN étranger possibles', 'Contrat de banque, conditions de la SG'],
                  ['Retour futur en France', 'La fiscalité peut changer au retour. Anticiper l\'impact fiscal différé', 'Conseiller fiscal, simulation de retour'],
                  ['Déclaration en France', 'Même en étant non-résident, certains revenus doivent être déclarés en France', 'Cerfa 2042, service des impôts des non-résidents'],
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-850' : ''}>
                    <td className="p-3 font-medium">{row[0]}</td>
                    <td className="p-3">{row[1]}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: 'mechanism',
      title: 'Fiscalité des SCPI pour un non-résident',
      icon: Calculator,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-2xl font-bold mb-4">Principe général</h3>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>Les SCPI françaises perçoivent des loyers provenant d'immeubles situés en France et à l'étranger. Pour un non-résident fiscal :</p>
            <ul className="space-y-2">
              <li><strong>Revenus de source française</strong> (immeubles en France) : soumis à un prélèvement à la source de 20 % (résidents hors UE) ou 12 % (résidents UE), sauf convention fiscale plus favorable.</li>
              <li><strong>Revenus de source étrangère</strong> (immeubles hors France) : fiscalité différente selon le pays d'implantation de l'immeuble. Le crédit d'impôt peut s'appliquer.</li>
              <li><strong>Prélèvements sociaux</strong> (17,2 %) : les non-résidents affiliés à un régime de sécurité sociale hors France peuvent être exonérés sous conditions.</li>
            </ul>
            <p>Ces règles générales peuvent varier selon la convention fiscale entre la France et votre pays de résidence. Chaque situation est spécifique.</p>
          </div>
        </div>
      )
    },
    {
      id: 'errors',
      title: 'Erreurs fréquentes',
      icon: AlertTriangle,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="space-y-4">
            <div>
              <h4 className="font-bold mb-2">❌ Croire qu'en tant que non-résident on ne paie pas d'impôt en France</h4>
              <p className="text-gray-600 dark:text-gray-400">Les revenus fonciers de source française sont imposables en France, même pour un non-résident. Le prélèvement à la source s'applique sauf convention contraire.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Penser que l'assurance-vie résout tout</h4>
              <p className="text-gray-600 dark:text-gray-400">L'assurance-vie française peut avoir une fiscalité spécifique pour les non-résidents. Vérifiez la fiscalité des rachats et des UC SCPI dans votre pays de résidence.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Ignorer les conventions fiscales</h4>
              <p className="text-gray-600 dark:text-gray-400">Chaque convention fiscale est unique. Certaines exonèrent totalement les revenus fonciers en France (qui sont alors imposés dans le pays de résidence). D'autres maintiennent une imposition en France.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">❌ Investir sans conseil fiscal spécialisé</h4>
              <p className="text-gray-600 dark:text-gray-400">La fiscalité des non-résidents est complexe et chaque situation est unique. Un conseil fiscal expert en fiscalité internationale est indispensable avant d'investir en SCPI.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Questions fréquentes',
      icon: HelpCircle,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="space-y-6">
            <div>
              <h4 className="font-bold mb-2">Un non-résident peut-il investir dans toutes les SCPI ?</h4>
              <p className="text-gray-600 dark:text-gray-400">La plupart des SCPI françaises sont ouvertes aux non-résidents, mais certaines peuvent avoir des restrictions (notamment les SCPI fiscales type Malraux ou déficit foncier). Vérifiez les conditions dans le DIC ou la note d'information.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Quel est le prélèvement à la source pour un non-résident ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Le taux standard est de 20 % pour les résidents hors UE et 12 % pour les résidents UE, sous réserve des conventions fiscales applicables. Certains revenus (plus-values) ont des règles spécifiques.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Les SCPI européennes sont-elles plus avantageuses pour un non-résident ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Pas nécessairement. Les SCPI européennes investissent dans plusieurs pays, ce qui peut complexifier encore la fiscalité. L'avantage dépend de votre pays de résidence et des conventions fiscales applicables.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Faut-il déclarer ses SCPI en France quand on est non-résident ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Oui, les revenus de source française (y compris les distributions de SCPI) doivent être déclarés en France, même si vous êtes non-résident. Le service des impôts des non-résidents (SINR) est compétent.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Un retour en France change-t-il la fiscalité des SCPI ?</h4>
              <p className="text-gray-600 dark:text-gray-400">Oui, au retour en France, vous redevienez résident fiscal français. La fiscalité des revenus SCPI bascule vers le régime des revenus fonciers français (TMI + PS). Anticipez cet impact dans votre stratégie.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'sources',
      title: 'Sources et points à vérifier',
      icon: Info,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-2xl font-bold mb-4">Sources fiables à consulter</h3>
          <ul className="space-y-2">
            <li>• <a href="https://www.impots.gouv.fr" target="_blank" rel="nofollow" className="text-blue-600 hover:underline">impots.gouv.fr</a> — conventions fiscales et fiscalité des non-résidents</li>
            <li>• <a href="https://bofip.impots.gouv.fr" target="_blank" rel="nofollow" className="text-blue-600 hover:underline">BOFiP</a> — Bulletin officiel des finances publiques</li>
            <li>• DIC et note d'information de chaque SCPI</li>
            <li>• IFU (imprimé fiscal unique) transmis par la société de gestion chaque année</li>
            <li>• Service des impôts des non-résidents (SINR)</li>
            <li>• Conseiller fiscal expert en fiscalité internationale</li>
          </ul>
        </div>
      )
    },
    {
      id: 'links',
      title: '',
      icon: ExternalLink,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex flex-wrap gap-3">
            <a href="/fiscalite-scpi/" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Fiscalité SCPI</a>
            <a href="/scpi-revenus-etrangers/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Revenus étrangers SCPI</a>
            <a href="/scpi-credit-impot/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Crédit d'impôt SCPI</a>
            <a href="/articles/" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Tous nos articles</a>
          </div>
        </div>
      )
    },
    {
      id: 'compliance',
      title: '',
      icon: Info,
      content: (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            Cette page est pédagogique. Elle ne constitue pas une recommandation personnalisée, un conseil en investissement ni un conseil fiscal individualisé. Avant toute souscription, il convient d'analyser votre situation, votre fiscalité, votre horizon d'investissement, vos objectifs et les documents réglementaires des SCPI.
          </p>
        </div>
      )
    }
  ];
}

// ========================================================================
// CONTENU GÉNÉRIQUE (fallback pour articles existants)
// ========================================================================
function generateGenericContent(template: ArticleTemplate): RichArticleSection[] {
  const sections: RichArticleSection[] = [];

  sections.push({
    id: 'intro',
    title: '',
    icon: Target,
    content: (
      <div className="prose prose-lg max-w-none mb-12">
        <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          {template.searchIntent}. Ce guide vous apporte les clés pour comprendre le sujet et analyser les critères pertinents.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-600">
          <p className="text-gray-700 dark:text-gray-300"><strong>📌 Public :</strong> {template.targetAudience}</p>
        </div>
      </div>
    )
  });

  sections.push({
    id: 'analyse',
    title: 'Points clés à comprendre',
    icon: BookOpen,
    content: (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
        <p className="text-gray-700 dark:text-gray-300">
          Ce sujet nécessite une analyse selon votre situation personnelle. Les critères à prendre en compte incluent votre TMI, votre horizon d'investissement, votre tolérance au risque et vos objectifs patrimoniaux.
        </p>
      </div>
    )
  });

  sections.push({
    id: 'vigilance',
    title: 'Points de vigilance',
    icon: AlertTriangle,
    content: (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
        <div className="space-y-4">
          <div>
            <h4 className="font-bold mb-2">❌ Risque de perte en capital</h4>
            <p>Le prix des parts de SCPI peut baisser. Le capital investi n'est pas garanti.</p>
          </div>
          <div>
            <h4 className="font-bold mb-2">❌ Liquidité</h4>
            <p>La revente des parts peut prendre du temps. Horizon minimum 8-10 ans recommandé.</p>
          </div>
          <div>
            <h4 className="font-bold mb-2">❌ Revenus non garantis</h4>
            <p>Les distributions dépendent de l'occupation locative et de la performance de la SCPI.</p>
          </div>
          <div>
            <h4 className="font-bold mb-2">❌ Fiscalité personnelle</h4>
            <p>L'impact fiscal varie selon votre TMI et votre situation.</p>
          </div>
        </div>
      </div>
    )
  });

  sections.push({
    id: 'method',
    title: 'Méthode MaximusSCPI',
    icon: Shield,
    content: (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 mb-8">
        <p>MaximusSCPI analyse les SCPI selon des critères objectifs : rendement, TOF, report à nouveau, valeur de reconstitution, frais, société de gestion, diversification, fiscalité, liquidité et cohérence patrimoniale.</p>
      </div>
    )
  });

  sections.push({
    id: 'faq',
    title: 'Questions fréquentes',
    icon: HelpCircle,
    content: (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
        <p className="text-gray-600 dark:text-gray-400">Consultez nos autres articles sur le sujet pour des informations complémentaires, ou utilisez notre comparateur pour analyser les SCPI du marché.</p>
      </div>
    )
  });

  sections.push({
    id: 'compliance',
    title: '',
    icon: Info,
    content: (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          Cette page est pédagogique. Elle ne constitue pas une recommandation personnalisée, un conseil en investissement ni un conseil fiscal individualisé. Avant toute souscription, il convient d'analyser votre situation, votre fiscalité, votre horizon d'investissement, vos objectifs et les documents réglementaires des SCPI.
        </p>
      </div>
    )
  });

  return sections;
}
