import type { ScpiEducationalPageConfig } from './shared'

export const scpiSanteConfig: ScpiEducationalPageConfig = {
  path: '/scpi-sante',
  badge: 'Secteur santé',
  h1: 'SCPI santé : stabilité défensive et limites à connaître',
  heroSubtitle:
    'Le secteur santé (cliniques, laboratoires, cabinets médicaux, EHPAD) bénéficie de tendances structurelles favorables liées au vieillissement de la population. Cependant, il comporte des risques spécifiques : dépendance aux exploitants, concentration sectorielle, enjeux réglementaires et valorisation.',
  seoTitle: 'SCPI santé : avantages, risques, rendement et critères d\'analyse',
  seoDescription:
    'Analyse complète des SCPI santé : cliniques, laboratoires, cabinets médicaux, EHPAD, baux longs, rendement, stabilité locative, dépendance aux exploitants, risque réglementaire, cas pratiques et comparaison avec les autres secteurs.',
  shortAnswerTitle: 'Que sont les SCPI santé et quels sont leurs atouts ?',
  shortAnswer:
    'Les SCPI santé investissent dans l\'immobilier dédié à la santé : cliniques privées, laboratoires d\'analyses, cabinets médicaux, EHPAD, centres de soins. Le secteur bénéficie d\'une demande structurelle liée au vieillissement de la population et aux besoins de soins, avec des baux souvent longs (6 à 12 ans) et indexés. Cependant, la dépendance aux exploitants, la réglementation spécifique (notamment en EHPAD), la concentration sectorielle et la valorisation des actifs doivent être analysées avec attention. Le secteur santé peut avoir une logique défensive, mais il ne supprime ni le risque immobilier, ni le risque de liquidité, ni le risque de baisse du prix de part.',
  keyMessage:
    'Le secteur santé peut apporter une logique défensive, mais il ne supprime ni le risque immobilier, ni le risque de liquidité, ni le risque de baisse du prix de part.',
  definitionParagraphs: [
    'Une SCPI santé est une société civile de placement immobilier spécialisée dans les actifs du secteur de la santé : cliniques privées, laboratoires d\'analyses médicales, cabinets de ville, EHPAD, centres de soins, résidences médicalisées.',
    'Le secteur santé est souvent présenté comme défensif car la demande de soins est structurelle et moins cyclique que d\'autres secteurs immobiliers. Cependant, cette stabilité relative n\'est pas une garantie de performance ni d\'absence de risque.',
    'Les baux dans le secteur santé sont souvent longs (6 à 12 ans) et indexés, ce qui peut apporter une visibilité sur les loyers. Mais la qualité du locataire (exploitant) est déterminante : un défaut de paiement ou une perte d\'agrément peut entraîner une vacance longue.',
    'La dépendance aux exploitants est un risque spécifique : si l\'exploitant rencontre des difficultés (financières, réglementaires, d\'agrément), la SCPI peut subir une vacance locative et une baisse de valorisation des actifs. La diversification interne est essentielle.',
    'Le secteur EHPAD nécessite une vigilance particulière : la réglementation, la solvabilité des résidents et la qualité des exploitants sont des facteurs clés. Certaines SCPI santé excluent les EHPAD de leur périmètre.',
    'La diversification au sein du secteur santé (plusieurs exploitants, plusieurs régions, plusieurs sous-secteurs) est essentielle pour réduire les risques. Les SCPI santé européennes peuvent offrir une diversification géographique supplémentaire.',
  ],
  tableTitle: 'Type d\'actif santé / Atout potentiel / Vigilance / Critères à croiser',
  tableRows: [
    {
      level: 'Cliniques privées',
      advantage: 'Baux longs (9-12 ans), exploitants généralement solides, demande structurelle de soins.',
      vigilance: 'Dépendance à l\'exploitant, risque réglementaire (autorisations), concentration possible sur quelques opérateurs.',
    },
    {
      level: 'Laboratoires d\'analyses',
      advantage: 'Baux longs, peu de vacance, activité régulière, besoin constant.',
      vigilance: 'Évolution possible de la réglementation des analyses, concentration des réseaux de laboratoires.',
    },
    {
      level: 'Cabinets médicaux',
      advantage: 'Actifs polyvalents, relocation possible plus facile, demande de proximité.',
      vigilance: 'Baux souvent plus courts, dépendance au bassin de patients et à la démographie médicale.',
    },
    {
      level: 'EHPAD / résidences seniors',
      advantage: 'Demande liée au vieillissement, baux longs possibles.',
      vigilance: 'Risque réglementaire élevé, solvabilité des résidents, qualité de l\'exploitant déterminante.',
    },
    {
      level: 'SCPI santé européenne',
      advantage: 'Diversification géographique, fiscalité différente (PS 0 % selon conventions).',
      vigilance: 'Marchés hétérogènes, réglementation locale, liquidité parfois plus limitée.',
    },
  ],
  tableNote:
    'Ces repères sont indicatifs. Chaque SCPI santé doit être analysée individuellement, notamment la qualité des exploitants et la diversification interne.',
  criteriaTitle: 'Critères à croiser pour une SCPI santé',
  criteriaCards: [
    { title: 'Qualité des exploitants', text: 'Analyser leur solvabilité, leur ancienneté, leur diversification géographique et leur conformité réglementaire.' },
    { title: 'Durée des baux', text: 'Des baux longs (9-12 ans) apportent de la visibilité. Vérifier le taux d\'indexation et les clauses de renégociation.' },
    { title: 'TOF', text: 'Un TOF élevé et stable est un indicateur de bonne occupation. Analyser l\'évolution sur plusieurs exercices.' },
    { title: 'Capitalisation', text: 'Une capitalisation suffisante permet de mutualiser les risques entre plusieurs actifs et exploitants.' },
    { title: 'Endettement', text: 'Un endettement modéré est préférable dans un secteur spécialisé où la liquidité peut être limitée.' },
    { title: 'Diversification interne', text: 'Nombre d\'exploitants, nombre d\'actifs, répartition géographique et sous-secteurs (cliniques, labos, EHPAD).' },
    { title: 'Réglementation', text: 'Vérifier l\'exposition aux secteurs régulés (EHPAD, cliniques). Un changement réglementaire peut impacter les loyers.' },
    { title: 'Valorisation', text: 'Comparer le prix de souscription à la VR. Les actifs spécialisés santé peuvent avoir une décote ou surcote spécifique.' },
  ],
  commonErrors: [
    'Considérer que toutes les SCPI santé sont défensives et sans risque.',
    'Ignorer la dépendance aux exploitants (un seul exploitant = risque élevé).',
    'Ne pas vérifier la diversification au sein du secteur santé.',
    'Sous-estimer le risque réglementaire (EHPAD, cliniques).',
    'Oublier que la liquidité peut être plus limitée sur des actifs spécialisés.',
    'Confondre secteur défensif et placement sans risque.',
  ],
  practicalCases: [
    {
      title: 'Investisseur prudent attiré par la santé',
      text: 'Un investisseur de 55 ans cherche une SCPI défensive. Il choisit une SCPI santé de 800 M€ avec 15 exploitants différents, TOF stable à 97 %, endettement 18 %. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.',
    },
    {
      title: 'SCPI santé très concentrée sur un exploitant',
      text: 'Une SCPI santé de 200 M€ dont 80 % des loyers proviennent d\'un seul exploitant d\'EHPAD. Si l\'exploitant rencontre des difficultés réglementaires ou financières, la SCPI est très exposée. Simulation pédagogique : analyser la concentration avant d\'investir.',
    },
    {
      title: 'SCPI santé européenne diversifiée',
      text: 'Une SCPI santé investit en France (50 %), Allemagne (30 %) et Espagne (20 %) avec des cliniques et laboratoires. La diversification géographique réduit la dépendance à un seul marché réglementaire. Simulation pédagogique : la diversification paneuropéenne peut être un atout.',
    },
    {
      title: 'SCPI santé avec rendement élevé mais capitalisation faible',
      text: 'Une SCPI santé de 80 M€ affiche un TDVM de 6,5 % mais seulement 10 actifs et 3 exploitants. Le rendement élevé peut masquer un risque de concentration important. Simulation pédagogique : un rendement élevé doit être croisé avec la taille et la diversification.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI analyse les SCPI santé comme tout autre secteur : TOF, capitalisation, endettement, frais, rendement, diversification.',
    'La méthode MaximusSCPI accorde une attention particulière à la qualité des exploitants et à la diversification interne du secteur santé.',
    'La comparaison avec les autres secteurs (logistique, bureaux, diversifiées) permet de vérifier la cohérence de l\'allocation.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. Un conseiller peut approfondir l\'analyse sectorielle.',
  ],
  conclusionParagraphs: [
    'Les SCPI santé peuvent apporter une diversification utile et une certaine stabilité, mais elles ne sont pas sans risque. L\'analyse des exploitants, de la réglementation et de la concentration est essentielle.',
    'Sources et points à vérifier : DIC, note d\'information, rapport annuel, bulletin trimestriel, ventilation par exploitant et par sous-secteur.',
    'Utilisez le comparateur MaximusSCPI pour identifier les SCPI santé, puis validez votre analyse avec un conseiller.',
  ],
  faqItems: [
    {
      question: 'Qu\'est-ce qu\'une SCPI santé ?',
      answer: 'Une SCPI spécialisée dans l\'immobilier de santé : cliniques, laboratoires, cabinets médicaux, EHPAD, centres de soins, résidences médicalisées.',
    },
    {
      question: 'Les SCPI santé sont-elles plus stables que les autres secteurs ?',
      answer: 'Elles bénéficient d\'une demande structurelle liée au vieillissement, mais la stabilité dépend de la qualité des exploitants, des baux et de la diversification.',
    },
    {
      question: 'Quels actifs détiennent les SCPI santé ?',
      answer: 'Cliniques privées, laboratoires d\'analyses, cabinets médicaux, EHPAD, centres de soins, résidences médicalisées.',
    },
    {
      question: 'Quels sont les risques spécifiques des SCPI santé ?',
      answer: 'Dépendance aux exploitants, risque réglementaire (EHPAD, cliniques), concentration sectorielle, liquidité potentiellement plus limitée.',
    },
    {
      question: 'Faut-il privilégier la santé dans une allocation SCPI ?',
      answer: 'La santé peut être un complément pertinent à une allocation diversifiée, mais ne doit pas être le seul secteur. La diversification multi-secteurs reste recommandée.',
    },
    {
      question: 'Quelle différence entre SCPI santé et SCPI diversifiée ?',
      answer: 'Une SCPI santé est concentrée sur un seul secteur, ce qui augmente le risque sectoriel. Une SCPI diversifiée répartit entre plusieurs secteurs dont la santé.',
    },
    {
      question: 'Les SCPI santé peuvent-elles être européennes ?',
      answer: 'Oui, certaines SCPI santé investissent en Europe (Allemagne, Espagne, Italie) pour diversifier les marchés et bénéficier d\'une fiscalité différente.',
    },
    {
      question: 'Comment analyser le risque exploitant ?',
      answer: 'Vérifier le nombre d\'exploitants, leur solvabilité, leur ancienneté, la répartition des loyers et la diversification géographique.',
    },
    {
      question: 'Les EHPAD sont-ils risqués dans une SCPI santé ?',
      answer: 'Oui, le secteur EHPAD est soumis à une réglementation stricte et à des risques de solvabilité des résidents. Certaines SCPI santé excluent volontairement les EHPAD.',
    },
    {
      question: 'Comment MaximusSCPI analyse les SCPI santé ?',
      answer: 'Le comparateur intègre les indicateurs clés. Les contenus pédagogiques aident à comprendre les spécificités du secteur. MaximusSCPI ne constitue pas une recommandation personnalisée.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI santé avec les autres secteurs immobiliers',
}
