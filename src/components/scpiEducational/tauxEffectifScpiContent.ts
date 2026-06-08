import type { ScpiEducationalPageConfig } from './shared'

export const tauxEffectifScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-taux-effectif/',
  badge: 'Fiscalité SCPI',
  h1: 'Taux effectif SCPI : comprendre la fiscalité des revenus étrangers',
  heroSubtitle:
    'Le taux effectif est un mécanisme fiscal spécifique prévu par certaines conventions fiscales. Il diffère du crédit d\'impôt et peut avoir un impact sur l\'imposition globale du foyer. Cette page explique son fonctionnement et comment il s\'applique aux SCPI.',
  seoTitle: 'Taux effectif SCPI : mécanisme, calcul et différence avec le crédit d\'impôt',
  seoDescription:
    'Analyse complète du taux effectif applicable aux revenus étrangers de SCPI : principe, pays concernés, calcul, impact sur l\'imposition globale, différence avec le crédit d\'impôt. Cas pratiques et exemples chiffrés.',
  shortAnswerTitle: 'Qu\'est-ce que le taux effectif pour les SCPI ?',
  shortAnswer:
    'Le taux effectif est un mécanisme prévu par certaines conventions fiscales : les revenus étrangers de SCPI ne sont pas imposés en France, mais ils sont pris en compte pour déterminer le taux d\'imposition applicable aux autres revenus du foyer. Cela peut augmenter l\'impôt sur les revenus français, même si les revenus étrangers eux-mêmes échappent à l\'IR. Ce mécanisme s\'applique notamment pour certains pays comme les Pays-Bas. Il ne doit pas être confondu avec le crédit d\'impôt, qui impute l\'impôt étranger sur l\'impôt français.',
  keyMessage:
    'Le taux effectif est un mécanisme fiscal à comprendre pour lire correctement les revenus étrangers de SCPI et leur impact sur l\'impôt global. Il diffère du crédit d\'impôt et peut avoir un impact indirect significatif.',
  definitionParagraphs: [
    'Le taux effectif est un mécanisme de calcul de l\'impôt prévu par certaines conventions fiscales. Il s\'applique à des revenus de source étrangère qui, selon la convention, ne sont pas imposables en France mais sont retenus pour le calcul du taux d\'imposition.',
    'Concrètement, le revenu étranger est ajouté aux autres revenus du foyer pour déterminer le taux d\'imposition moyen applicable à l\'ensemble des revenus. Ce taux est ensuite appliqué aux seuls revenus imposables en France (hors revenus étrangers exonérés).',
    'L\'effet du taux effectif dépend du montant des revenus étrangers et de leur poids relatif dans le revenu total du foyer. Plus les revenus étrangers sont élevés, plus le taux effectif peut augmenter, et plus l\'impôt sur les autres revenus peut être impacté.',
    'Le taux effectif ne doit pas être confondu avec le crédit d\'impôt. Le crédit d\'impôt impute l\'impôt étranger sur l\'impôt français. Le taux effectif exonère le revenu étranger d\'IR en France mais augmente le taux applicable aux autres revenus.',
    'Toutes les conventions fiscales ne prévoient pas un taux effectif. Certaines privilégient le crédit d\'impôt (Allemagne, Espagne, Italie). D\'autres prévoient un taux effectif (Pays-Bas). La distinction dépend du pays d\'origine et des stipulations de la convention.',
    'La société de gestion transmet une fiche fiscale indiquant, pour chaque pays, si le mécanisme applicable est le crédit d\'impôt ou le taux effectif. Cette information est essentielle pour la déclaration.',
    'Comprendre la différence entre crédit d\'impôt et taux effectif est important pour analyser correctement le rendement net d\'une SCPI européenne et son impact fiscal global.',
  ],
  tableTitle: 'Comparaison : crédit d\'impôt vs taux effectif',
  tableRows: [
    {
      level: 'Crédit d\'impôt',
      advantage: 'L\'impôt étranger est imputé sur l\'IR français. Neutralise la double imposition.',
      vigilance: 'Plafonné à l\'impôt français. Excédent non remboursable.',
    },
    {
      level: 'Taux effectif',
      advantage: 'Le revenu étranger n\'est pas imposé en France.',
      vigilance: 'Augmente le taux applicable aux autres revenus. Impact indirect.',
    },
    {
      level: 'Revenus français',
      advantage: 'Imposition au barème standard selon la TMI.',
      vigilance: 'Aucun mécanisme spécifique. IR + PS applicables.',
    },
    {
      level: 'Revenus étrangers (crédit)',
      advantage: 'Imposés en France avec déduction de l\'impôt étranger.',
      vigilance: 'Déclaration spécifique. Plafonnement à vérifier.',
    },
    {
      level: 'Revenus étrangers (taux effectif)',
      advantage: 'Non imposés en France.',
      vigilance: 'Augmentation du taux sur les autres revenus. Impact à calculer.',
    },
  ],
  tableNote:
    'Le mécanisme applicable dépend de la convention fiscale avec chaque pays d\'investissement.',
  criteriaTitle: 'Critères à croiser avec le taux effectif',
  criteriaCards: [
    { title: 'Convention fiscale', text: 'Le taux effectif est prévu par la convention applicable. À vérifier selon le pays d\'investissement.' },
    { title: 'Montant des revenus étrangers', text: 'Plus les revenus étrangers sont élevés, plus l\'impact sur le taux effectif peut être significatif.' },
    { title: 'Autres revenus du foyer', text: 'Le taux effectif impacte l\'imposition des autres revenus. À analyser globalement.' },
    { title: 'TMI', text: 'L\'impact du taux effectif dépend de la TMI et de la composition des revenus du foyer.' },
    { title: 'Comparaison avec crédit d\'impôt', text: 'Selon les cas et les montants, l\'un ou l\'autre mécanisme peut être plus favorable.' },
  ],
  commonErrors: [
    'Confondre taux effectif et crédit d\'impôt : les mécanismes sont différents et ont des impacts différents.',
    'Croire que le taux effectif est automatiquement favorable : il peut augmenter l\'impôt sur les autres revenus.',
    'Oublier que le taux effectif impacte l\'imposition globale du foyer, pas seulement celle des revenus étrangers.',
    'Négliger la déclaration spécifique des revenus étrangers soumis au taux effectif.',
    'Penser que toutes les conventions fiscales prévoient le même mécanisme.',
  ],
  practicalCases: [
    {
      title: 'Taux effectif — TMI 30 %',
      text: 'Revenus imposables France : 80 000 €. Revenus étrangers (taux effectif) : 20 000 €. Taux effectif calculé sur 100 000 € = 25 %. Impôt dû : 25 % × 80 000 € = 20 000 € (au lieu de 22 % × 80 000 € = 17 600 € sans taux effectif). L\'augmentation est de 2 400 €.',
    },
    {
      title: 'Taux effectif — TMI 41 %',
      text: 'Revenus France : 120 000 €. Revenus étrangers : 30 000 €. Taux effectif sur 150 000 € = 35 %. Impôt dû : 35 % × 120 000 € = 42 000 €. Sans taux effectif : 33 % × 120 000 € = 39 600 €. Augmentation : 2 400 €.',
    },
    {
      title: 'Comparaison crédit d\'impôt vs taux effectif',
      text: 'Pour une SCPI allemande (crédit d\'impôt) : le revenu étranger est imposé en France avec déduction de l\'impôt allemand. Pour une SCPI néerlandaise (taux effectif) : le revenu n\'est pas imposé mais augmente le taux. Le choix entre SCPI selon le pays peut avoir un impact fiscal.',
    },
    {
      title: 'Impact limité du taux effectif',
      text: 'Si les revenus étrangers représentent une faible part du revenu total (ex : 5 000 € sur 150 000 €), l\'impact du taux effectif sur l\'impôt global peut être marginal, voire négligeable.',
    },
    {
      title: 'SCPI multi-pays avec mécanismes mixtes',
      text: 'Une SCPI diversifiée peut avoir des revenus d\'Allemagne (crédit d\'impôt) et des Pays-Bas (taux effectif). La fiche fiscale détaille chaque mécanisme par pays. La déclaration doit distinguer les deux.',
    },
  ],
  methodParagraphs: [
    'Identifier les pays d\'investissement de la SCPI et les conventions fiscales applicables.',
    'Déterminer, via la fiche fiscale, si le mécanisme applicable est le crédit d\'impôt ou le taux effectif.',
    'Calculer l\'impact du taux effectif sur l\'impôt global.',
    'Comparer avec le mécanisme de crédit d\'impôt pour évaluer l\'écart.',
    'Intégrer l\'impact dans l\'estimation du rendement net fiscal.',
    'Ne pas choisir une SCPI uniquement sur le critère du mécanisme fiscal applicable.',
  ],
  conclusionParagraphs: [
    'Le taux effectif est un mécanisme fiscal complexe mais important pour les SCPI investies dans certains pays européens (notamment les Pays-Bas). Il peut avoir un impact indirect sur l\'imposition globale du foyer.',
    'La distinction entre crédit d\'impôt et taux effectif est essentielle pour analyser correctement la fiscalité des SCPI européennes. La fiche fiscale de la société de gestion est le document de référence.',
    'L\'analyse ne doit pas être uniquement fiscale : la diversification, la qualité du patrimoine et les objectifs patrimoniaux sont tout aussi importants.',
  ],
  faqItems: [
    {
      question: 'Qu\'est-ce que le taux effectif ?',
      answer: 'Le taux effectif est un mécanisme où certains revenus étrangers ne sont pas imposés en France mais sont pris en compte pour calculer le taux d\'imposition applicable aux autres revenus du foyer.',
    },
    {
      question: 'Comment s\'applique-t-il aux SCPI ?',
      answer: 'Pour les SCPI investies dans des pays dont la convention prévoit un taux effectif, les revenus étrangers sont ajoutés au revenu global pour calculer le taux d\'imposition, mais ne sont pas eux-mêmes imposés.',
    },
    {
      question: 'Quelle différence avec le crédit d\'impôt ?',
      answer: 'Le crédit d\'impôt impute l\'impôt étranger sur l\'IR français. Le taux effectif exonère le revenu étranger d\'IR mais augmente le taux applicable aux autres revenus.',
    },
    {
      question: 'Est-ce fiscalement avantageux ?',
      answer: 'Cela dépend de la situation. Le taux effectif peut être favorable si l\'augmentation du taux est faible par rapport à l\'impôt qui serait dû sans exonération. À analyser au cas par cas.',
    },
    {
      question: 'Est-ce valable pour toutes les SCPI européennes ?',
      answer: 'Non, cela dépend des pays et des conventions fiscales applicables. Certains pays prévoient un crédit d\'impôt, d\'autres un taux effectif (notamment les Pays-Bas).',
    },
    {
      question: 'Quel impact sur le rendement net ?',
      answer: 'Le taux effectif améliore le rendement brut des SCPI concernées (pas d\'IR direct), mais peut augmenter l\'impôt sur les autres revenus. L\'impact net dépend de la situation individuelle.',
    },
    {
      question: 'Comment déclarer ces revenus ?',
      answer: 'La société de gestion transmet une fiche fiscale indiquant le mécanisme applicable. La déclaration suit des règles spécifiques selon le pays. Les formulaires peuvent varier.',
    },
    {
      question: 'Peut-on choisir entre crédit d\'impôt et taux effectif ?',
      answer: 'Non, le mécanisme applicable est déterminé par la convention fiscale avec chaque pays. L\'investisseur ne peut pas choisir.',
    },
    {
      question: 'Le taux effectif est-il cumulable avec d\'autres dispositifs ?',
      answer: 'Le taux effectif est un mécanisme de droit commun prévu par la convention. Il s\'applique indépendamment des autres dispositifs fiscaux.',
    },
    {
      question: 'Comment MaximusSCPI l\'intègre dans l\'analyse ?',
      answer: 'MaximusSCPI distingue crédit d\'impôt et taux effectif dans l\'analyse du rendement net des SCPI européennes, selon les conventions applicables. L\'approche est pédagogique.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI par pays d\'investissement',
}
