/**
 * Source éditoriale React commune aux articles MaximusSCPI.
 * Cette fonction alimente directement DynamicArticlePage puis le pré-rendu HTML.
 * Aucun contenu SEO parallèle ne doit diverger de cette source.
 */
import React from 'react';
import {
  Target,
  BarChart3,
  ShieldAlert,
  History,
  GitCompare,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import type { ArticleTemplate } from '../data/articleTemplatesConfig';

export interface RichArticleSection {
  id: string;
  title: string;
  icon: any;
  content: JSX.Element;
}

type EditorialProfile = {
  angle: string;
  criteria: string[];
  risks: string[];
  questions: string[];
};

const commonTrajectory = [
  'taux de distribution et régularité de la distribution',
  'TOF et évolution de l’occupation',
  'prix de part, valeur de réalisation et valeur de reconstitution',
  'niveau d’endettement et échéances de financement',
  'liquidité : retraits, collecte et éventuelles parts en attente',
  'évolution du patrimoine, des locataires et des durées de baux'
];

const profiles: Record<string, EditorialProfile> = {
  comparatifs: {
    angle: 'Comparer à périmètre identique, sur le même horizon, avec les mêmes hypothèses de frais, de fiscalité et de liquidité.',
    criteria: ['rendement brut et rendement net', 'frais à l’entrée, en gestion et à la sortie', 'fiscalité selon le mode de détention', 'liquidité et délai de sortie', 'risque de perte en capital et volatilité des valeurs'],
    risks: ['comparer des rendements calculés sur des bases différentes', 'négliger les frais ou la fiscalité', 'confondre disponibilité théorique et liquidité réelle', 'raisonner uniquement sur une année de performance'],
    questions: ['Quel résultat net reste-t-il après frais et fiscalité ?', 'Quel horizon est nécessaire ?', 'Que se passe-t-il dans un scénario défavorable ?', 'Quelle solution conserve le plus de flexibilité ?']
  },
  'choix-comparatifs': {
    angle: 'Comparer les solutions sur des critères homogènes avant de chercher un classement ou un vainqueur.',
    criteria: ['objectif patrimonial', 'rendement net', 'frais', 'fiscalité', 'liquidité', 'risque'],
    risks: ['surpondérer le rendement affiché', 'ignorer la durée de détention', 'sous-estimer les conditions de revente', 'choisir un support sans lien avec l’objectif'],
    questions: ['Quel est l’objectif principal ?', 'Quel niveau de perte est acceptable ?', 'Quand les fonds pourraient-ils être nécessaires ?', 'Quel résultat net est réellement comparable ?']
  },
  fiscalite: {
    angle: 'Raisonner en rendement net après fiscalité, sans isoler l’impôt du reste de la stratégie patrimoniale.',
    criteria: ['tranche marginale d’imposition', 'origine française ou étrangère des revenus', 'mode de détention', 'horizon de placement', 'impact des frais et de l’IFI le cas échéant'],
    risks: ['appliquer une règle fiscale générale à une situation particulière', 'raisonner uniquement en économie d’impôt', 'oublier les conventions fiscales internationales', 'négliger la liquidité et le risque du support'],
    questions: ['Quelle est la fiscalité marginale réelle ?', 'Le revenu est-il français ou étranger ?', 'Le mode de détention modifie-t-il le résultat net ?', 'L’optimisation reste-t-elle pertinente sur tout l’horizon ?']
  },
  'fiscalite-modes': {
    angle: 'Comparer les modes de détention en intégrant fiscalité, disponibilité des fonds, transmission et frais.',
    criteria: ['imposition des revenus', 'imposition à la sortie', 'frais d’enveloppe', 'transmission', 'souplesse des arbitrages'],
    risks: ['retenir une enveloppe uniquement pour sa fiscalité', 'ignorer les contraintes contractuelles', 'oublier les frais récurrents', 'comparer des supports qui ne donnent pas accès aux mêmes SCPI'],
    questions: ['Quelle enveloppe détient réellement les SCPI visées ?', 'Quels frais s’ajoutent ?', 'Quelle disponibilité à la sortie ?', 'Quel effet sur la transmission ?']
  },
  'fiscalite-avancee': {
    angle: 'Traiter la fiscalité avancée comme une conséquence de la structure patrimoniale, pas comme un objectif isolé.',
    criteria: ['structure de détention', 'flux de revenus', 'financement', 'transmission', 'IFI', 'fiscalité internationale'],
    risks: ['complexifier la structure sans gain net démontré', 'sous-estimer les coûts juridiques et comptables', 'figer une stratégie trop tôt', 'négliger les conséquences à la sortie'],
    questions: ['Quel gain net justifie la complexité ?', 'Quels coûts récurrents sont ajoutés ?', 'La stratégie reste-t-elle souple ?', 'Quelle fiscalité s’applique à la sortie ?']
  },
  strategies: {
    angle: 'Partir de l’objectif patrimonial, puis vérifier que l’horizon, la liquidité et le risque sont cohérents avec les SCPI retenues.',
    criteria: ['objectif de revenus ou de capitalisation', 'horizon', 'besoin futur de liquidité', 'diversification', 'fiscalité', 'capacité de perte'],
    risks: ['empiler des SCPI très corrélées', 'surconcentrer un gestionnaire ou un secteur', 'utiliser un financement sans marge de sécurité', 'confondre revenu distribué et rendement total'],
    questions: ['Quel rôle les SCPI jouent-elles dans le patrimoine ?', 'Quelle part du capital peut rester immobilisée ?', 'La diversification est-elle réelle ?', 'Quel scénario de sortie est prévu ?']
  },
  'strategies-patrimoniales': {
    angle: 'Construire la stratégie autour des objectifs, des flux futurs et des contraintes du foyer avant de sélectionner les véhicules.',
    criteria: ['revenus recherchés', 'retraite', 'transmission', 'horizon', 'liquidité', 'allocation globale'],
    risks: ['traiter les SCPI comme une allocation autonome', 'ignorer les autres actifs immobiliers', 'sous-estimer le besoin de trésorerie', 'ne pas prévoir la sortie'],
    questions: ['Quel besoin futur doit être financé ?', 'Quel poids immobilier total est acceptable ?', 'Quelle réserve de liquidité doit rester disponible ?', 'Comment l’allocation évoluera-t-elle dans le temps ?']
  },
  marche: {
    angle: 'Distinguer le niveau actuel d’un indicateur de sa trajectoire et replacer chaque donnée dans la période du document source.',
    criteria: ['distribution', 'TOF', 'collecte', 'valeurs de part', 'valeurs d’expertise', 'dette', 'liquidité'],
    risks: ['extrapoler un trimestre', 'confondre baisse ponctuelle et rupture structurelle', 'mélanger des périodes de publication différentes', 'tirer une conclusion d’un seul indicateur'],
    questions: ['La tendance dure-t-elle plusieurs périodes ?', 'Les autres indicateurs confirment-ils le signal ?', 'La source est-elle récente ?', 'Le mouvement vient-il du marché ou de la gestion propre à la SCPI ?']
  },
  analyse: {
    angle: 'Lire plusieurs indicateurs ensemble afin d’éviter qu’un bon chiffre masque une faiblesse structurelle.',
    criteria: commonTrajectory,
    risks: ['juger une SCPI sur son seul rendement', 'ignorer la qualité des sources', 'confondre niveau absolu et dégradation', 'négliger la liquidité'],
    questions: ['Quel indicateur se dégrade réellement ?', 'Depuis quand ?', 'Quelle est la cause documentée ?', 'Les fondamentaux compensent-ils ce risque ?']
  },
  'analyse-criteres': {
    angle: 'Définir précisément l’indicateur, son unité, sa date et sa source avant toute interprétation.',
    criteria: commonTrajectory,
    risks: ['comparer des définitions différentes', 'utiliser une donnée non datée', 'isoler un indicateur de son historique', 'transformer un signal en verdict automatique'],
    questions: ['Quelle définition est utilisée ?', 'Quelle période est observée ?', 'Quel historique est disponible ?', 'Quels autres indicateurs doivent être croisés ?']
  },
  'risques-vigilance': {
    angle: 'Identifier des signaux documentés avant qu’ils ne deviennent des pertes irréversibles ou une crise de liquidité.',
    criteria: ['parts en attente de retrait', 'TOF', 'valeurs de part et de reconstitution', 'endettement', 'collecte', 'concentration locative'],
    risks: ['absence de liquidité', 'baisse durable des valeurs', 'vacance croissante', 'refinancement défavorable', 'concentration d’actifs ou de locataires'],
    questions: ['Le signal est-il isolé ou répété ?', 'La liquidité se détériore-t-elle ?', 'La dette amplifie-t-elle le risque ?', 'La société de gestion agit-elle pour corriger la situation ?']
  },
  'secteurs-immo': {
    angle: 'Relier la dynamique du secteur à la qualité des actifs, des locataires, des baux et au prix payé par la SCPI.',
    criteria: ['demande locative', 'vacance', 'durée des baux', 'capex', 'localisation', 'concentration sectorielle'],
    risks: ['confondre secteur porteur et bon investissement', 'sous-estimer les travaux', 'ignorer la qualité des locataires', 'payer trop cher une thématique attractive'],
    questions: ['La demande locative est-elle durable ?', 'Les actifs restent-ils adaptés aux usages ?', 'Quel investissement futur sera nécessaire ?', 'La valorisation est-elle cohérente avec le risque ?']
  },
  'gestionnaires-acteurs': {
    angle: 'Séparer la qualité de la société de gestion de la situation propre à chacune des SCPI qu’elle administre.',
    criteria: ['historique de gestion', 'collecte', 'acquisitions et cessions', 'politique de dette', 'gestion de la liquidité', 'transparence documentaire'],
    risks: ['extrapoler la réputation d’un gestionnaire à tous ses fonds', 'ignorer les différences de stratégie', 'négliger la liquidité d’une SCPI particulière', 's’appuyer sur des données trop anciennes'],
    questions: ['Comment le gestionnaire traverse-t-il le cycle ?', 'Les décisions sont-elles cohérentes avec la stratégie annoncée ?', 'La communication documente-t-elle les risques ?', 'Les SCPI du gestionnaire évoluent-elles de la même manière ?']
  },
  'reglementation-transparence': {
    angle: 'Partir des documents officiels et distinguer clairement information générale, données réglementaires et conseil personnalisé.',
    criteria: ['note d’information', 'DIC', 'bulletins trimestriels', 'rapports annuels', 'statut du distributeur', 'date et provenance des données'],
    risks: ['utiliser une donnée sans source', 'mélanger information commerciale et document réglementaire', 'négliger la date de mise à jour', 'présenter une information générale comme un conseil individualisé'],
    questions: ['Quel document fait foi ?', 'La donnée est-elle récente ?', 'Qui publie l’information ?', 'Quelle limite doit être explicitée ?']
  },
  guides: {
    angle: 'Suivre une méthode reproductible : objectif, données, comparaison, risques, scénario de sortie puis décision.',
    criteria: ['objectif', 'budget', 'horizon', 'fiscalité', 'diversification', 'liquidité'],
    risks: ['commencer par le produit au lieu du besoin', 'négliger les frais', 'oublier la revente', 'concentrer l’allocation'],
    questions: ['Quel est le besoin concret ?', 'Quelles données doivent être vérifiées ?', 'Quel risque est acceptable ?', 'Quelle sortie est envisageable ?']
  }
};

const defaultProfile: EditorialProfile = {
  angle: 'Replacer le sujet dans le fonctionnement global des SCPI et croiser rendement, risque, fiscalité, liquidité et horizon.',
  criteria: commonTrajectory,
  risks: ['se limiter à un chiffre isolé', 'utiliser une donnée non datée', 'négliger les frais', 'oublier le risque de perte en capital'],
  questions: ['Quel est l’objectif ?', 'Quelle donnée est déterminante ?', 'Quel risque doit être surveillé ?', 'Quelle sortie est prévue ?']
};

const getProfile = (category: string) => profiles[category] || defaultProfile;

const BulletList = ({ items }: { items: string[] }) => (
  <ul className="space-y-3 text-gray-700 dark:text-gray-300">
    {items.map((item) => (
      <li key={item} className="flex gap-3">
        <span className="text-emerald-600 font-bold">•</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

export function generateRichArticleContent(template: ArticleTemplate): RichArticleSection[] {
  const profile = getProfile(template.category);
  const keywords = (template.keywords || []).slice(0, 6);

  return [
    {
      id: 'cadre-analyse',
      title: `Comprendre l’enjeu : ${template.mainKeyword}`,
      icon: Target,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-5">
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">{template.metaDescription}</p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            L’objectif de cette page est de {template.searchIntent}. Le public principalement concerné est : <strong>{template.targetAudience}</strong>.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{profile.angle}</p>
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {keywords.map((keyword) => <span key={keyword} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-200">{keyword}</span>)}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'criteres',
      title: 'Les critères à vérifier avant de décider',
      icon: BarChart3,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-5">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Une analyse utile ne se limite jamais au taux de distribution. Pour {template.mainKeyword}, les critères suivants doivent être lus ensemble et sur une période cohérente.
          </p>
          <BulletList items={profile.criteria} />
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Chaque donnée doit être reliée à sa source et à sa date. Deux chiffres identiques peuvent conduire à des lectures différentes si leur trajectoire ou leur contexte de marché ne sont pas les mêmes.
          </p>
        </div>
      )
    },
    {
      id: 'trajectoire',
      title: 'La trajectoire compte plus qu’une photographie',
      icon: History,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-5">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            MaximusSCPI privilégie une lecture chronologique des bulletins trimestriels et rapports annuels. Le but est d’identifier une amélioration, une stabilité ou une rupture plutôt que de commenter un chiffre isolé.
          </p>
          <BulletList items={commonTrajectory} />
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Une baisse ponctuelle n’est pas automatiquement une dégradation structurelle. À l’inverse, plusieurs signaux concordants sur plusieurs périodes justifient une analyse plus approfondie.
          </p>
        </div>
      )
    },
    {
      id: 'vigilances',
      title: `Points de vigilance sur ${template.mainKeyword}`,
      icon: ShieldAlert,
      content: (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl p-8 space-y-5">
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
            Les principaux biais ou risques à surveiller ne sont pas tous visibles dans le rendement affiché. Ils doivent être documentés avant toute conclusion.
          </p>
          <BulletList items={profile.risks} />
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Les performances passées ne préjugent pas des performances futures. Les revenus et la valeur des parts ne sont pas garantis et la revente peut prendre du temps.
          </p>
        </div>
      )
    },
    {
      id: 'methode-comparaison',
      title: 'Comment utiliser les outils MaximusSCPI',
      icon: GitCompare,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-5">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            La méthode consiste à partir du sujet traité ici, vérifier les données de chaque SCPI, comparer les métriques sur un même périmètre, puis regarder la trajectoire et les vigilances documentées avant de simuler l’impact patrimonial.
          </p>
          <ol className="space-y-3 text-gray-700 dark:text-gray-300 list-decimal pl-6">
            <li>Filtrer les SCPI adaptées au besoin dans le comparateur.</li>
            <li>Ouvrir l’analyse détaillée et contrôler les chiffres clés, le risque, le radar et les sources.</li>
            <li>Lire la trajectoire historique : occupation, valeurs, dette, distribution et liquidité.</li>
            <li>Tester le résultat avec les simulateurs de revenus, de crédit, de démembrement ou de revente selon le projet.</li>
          </ol>
          <div className="flex flex-wrap gap-3 pt-2">
            <a href="/comparateur-scpi/" className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Ouvrir le comparateur</a>
            <a href="/simulateurs/" className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Voir les simulateurs</a>
            <a href="/methodologie-donnees-scpi/" className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Méthodologie des données</a>
          </div>
        </div>
      )
    },
    {
      id: 'questions-decision',
      title: 'Les questions à trancher avant d’agir',
      icon: CheckCircle2,
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-5">
          <BulletList items={profile.questions} />
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Si une de ces réponses reste incertaine, il vaut mieux approfondir les documents et les scénarios plutôt que de forcer une conclusion. Une bonne décision patrimoniale doit rester compréhensible, documentée et cohérente avec la situation globale de l’investisseur.
          </p>
        </div>
      )
    },
    {
      id: 'retenir',
      title: 'À retenir',
      icon: BookOpen,
      content: (
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-8 space-y-4">
          <p className="leading-relaxed">
            Pour {template.mainKeyword}, la bonne lecture ne consiste pas à chercher un chiffre magique mais à croiser objectif, rendement net, risque, liquidité et trajectoire. Les outils MaximusSCPI servent à rendre cette comparaison vérifiable et reproductible.
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            Cette analyse est pédagogique et générale. Elle ne constitue pas une recommandation personnalisée d’investissement, d’arbitrage ou de vente.
          </p>
        </div>
      )
    }
  ];
}
