import type { ScpiEducationalPageConfig } from './shared'

export const tmi45ScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-tmi-45/',
  badge: 'Fiscalité SCPI',
  h1: 'SCPI avec TMI 45 % : analyse fiscale renforcée',
  heroSubtitle:
    'À 45 % de tranche marginale d\'imposition, l\'analyse fiscale est déterminante. Les revenus fonciers français peuvent être fortement fiscalisés, ce qui impose d\'étudier sérieusement les alternatives sans présenter aucune solution comme automatiquement meilleure.',
  seoTitle: 'SCPI TMI 45 % : fiscalité, rendement net et stratégies à étudier',
  seoDescription:
    'Comprenez les points de vigilance des SCPI avec une TMI à 45 % : fiscalité élevée, rendement net, SCPI européennes, démembrement, assurance-vie, SCI à l\'IS et IFI.',
  shortAnswerTitle: 'Pourquoi la TMI 45 % nécessite-t-elle une analyse renforcée ?',
  shortAnswer:
    'À 45 %, un revenu foncier de SCPI française supporte une pression fiscale maximale. Le cumul IR + prélèvements sociaux peut réduire le rendement net de moitié ou plus. Plusieurs solutions peuvent être étudiées pour améliorer la situation, mais aucune n\'est universelle : chaque piste a ses avantages, ses limites et ses conditions de pertinence.',
  keyMessage:
    'À TMI 45 %, une SCPI doit être analysée à travers le rendement net, la fiscalité, l\'horizon et la structure de détention.',
  definitionParagraphs: [
    'La tranche marginale d\'imposition (TMI) à 45 % est la plus élevée du barème progressif de l\'impôt sur le revenu. Elle concerne les plus hauts revenus et s\'applique à la fraction des revenus dépassant le seuil correspondant.',
    'Les revenus fonciers issus de SCPI françaises sont imposés à cette TMI, auxquels s\'ajoutent les prélèvements sociaux. Le coût fiscal total peut dépasser 50 % des revenus perçus.',
    'La fiscalité peut fortement réduire l\'attractivité d\'une SCPI en direct. Cela ne signifie pas que les SCPI sont à exclure, mais que l\'analyse doit être plus large : rendement net, origine des revenus, mode de détention, horizon, besoin de revenus, IFI et transmission.',
    'Les SCPI européennes, le démembrement, l\'assurance-vie, la SCI à l\'IS ou le recours au crédit sont des pistes pouvant améliorer le rendement net, à condition d\'être adaptées à la situation.',
  ],
  tableTitle: 'Pistes à étudier selon la situation — TMI 45 %',
  tableRows: [
    {
      level: 'Besoin de revenus immédiats',
      advantage: 'Assurance-vie ou direct avec SCPI européennes peuvent être étudiés pour améliorer le rendement net.',
      vigilance: 'Le direct France est fiscalement lourd à TMI 45 %. À comparer avec les alternatives disponibles.',
    },
    {
      level: 'Absence de besoin de revenus',
      advantage: 'Nue-propriété ou assurance-vie en capitalisation. Pas de revenus imposables immédiats. Fiscalité différée.',
      vigilance: 'Horizon long nécessaire. Analyser la décote et la qualité de la SCPI sous-jacente pour la nue-propriété.',
    },
    {
      level: 'Objectif transmission',
      advantage: 'Assurance-vie ou SCI à l\'IS peuvent présenter des avantages transmission.',
      vigilance: 'Complexité et coûts à mettre en balance avec l\'objectif. À étudier avec un professionnel.',
    },
    {
      level: 'Détention via société',
      advantage: 'SCI à l\'IS : capitalisation à l\'IS, amortissement comptable, rémunération différée.',
      vigilance: 'Double imposition lors de la distribution. Frais comptables, juridiques, de structure.',
    },
    {
      level: 'Volonté de diversification européenne',
      advantage: 'SCPI européennes : crédit d\'impôt, PS réduits, diversification géographique.',
      vigilance: 'Fiscalité variable selon pays. Documentation à vérifier. Risques spécifiques.',
    },
  ],
  tableNote:
    'Ces pistes sont des orientations à approfondir selon la situation. Aucune n\'est universellement recommandable.',
  criteriaTitle: 'Critères à croiser avec la TMI 45 %',
  criteriaCards: [
    { title: 'Rendement net fiscal', text: 'À TMI 45 %, le rendement net d\'une SCPI française en direct peut être fortement réduit. L\'écart avec le brut est à quantifier.' },
    { title: 'Besoin de revenus', text: 'Avec besoin de revenus, les solutions à fiscalité immédiate sont à comparer. Sans besoin, la capitalisation ou le démembrement sont des pistes.' },
    { title: 'Origine des revenus', text: 'Les revenus étrangers peuvent bénéficier d\'un traitement fiscal plus favorable (crédit d\'impôt, PS réduits, taux effectif).' },
    { title: 'Structure de détention', text: 'Le choix de l\'enveloppe (direct, AV, SCI, nue-propriété) a un impact direct sur le rendement net.' },
    { title: 'IFI', text: 'Les parts de SCPI en direct sont imposables à l\'IFI. Certaines enveloppes peuvent modifier le traitement.' },
    { title: 'Transmission', text: 'L\'objectif de transmission peut orienter le choix vers l\'assurance-vie ou la SCI à l\'IS.' },
  ],
  commonErrors: [
    'Éviter systématiquement les SCPI par crainte de la fiscalité sans analyser les alternatives.',
    'Choisir une SCPI européenne sans vérifier la convention fiscale applicable.',
    'Opter pour une structure complexe (SCI à l\'IS) sans que l\'objectif patrimonial ne le justifie.',
    'Sous-estimer les frais et contraintes des solutions alternatives (AV, SCI, démembrement).',
    'Oublier que le rendement n\'est qu\'un critère parmi d\'autres : risque, liquidité, horizon.',
  ],
  practicalCases: [
    {
      title: 'Direct TMI 45 % avec rendement brut à 6 %',
      text: 'Rendement brut : 6 %. Après IR à 45 % et PS, le rendement net fiscal peut être estimé autour de 2,8 % à 3 % selon les hypothèses. L\'investisseur conserve environ 45 à 50 % du rendement brut.',
    },
    {
      title: 'SCPI européenne TMI 45 % avec crédit d\'impôt',
      text: 'Rendement brut : 6,5 %. Avec crédit d\'impôt et absence de PS selon le pays, le rendement net fiscal peut être estimé entre 4,5 % et 5,5 % selon les hypothèses et la convention applicable.',
    },
    {
      title: 'Assurance-vie en capitalisation TMI 45 %',
      text: 'Un investisseur place 100 000 € en SCPI via assurance-vie. Les revenus sont capitalisés sans imposition immédiate. Au bout de 10 ans, la fiscalité n\'intervient qu\'en cas de rachat, avec un abattement de 4 600 € par an.',
    },
  ],
  methodParagraphs: [
    'Analyser le rendement brut et le retraiter de la fiscalité applicable (IR + PS).',
    'Déterminer l\'origine des revenus et les conventions fiscales concernées.',
    'Étudier les différentes enveloppes : direct, AV, nue-propriété, SCI à l\'IS, crédit.',
    'Intégrer l\'horizon, le besoin de revenus, l\'IFI et les objectifs de transmission.',
    'Comparer les rendements nets estimés de chaque option.',
    'Ne pas choisir une solution complexe sans que l\'objectif patrimonial ne la justifie.',
  ],
  conclusionParagraphs: [
    'À TMI 45 %, l\'analyse fiscale est incontournable. Elle ne doit pas conduire à écarter systématiquement les SCPI, mais à les analyser avec les bons outils : rendement net, origine des revenus, mode de détention, horizon et objectifs.',
    'Les solutions alternatives (Europe, démembrement, AV, SCI) peuvent améliorer le rendement net, mais leur pertinence dépend de chaque situation. Un accompagnement professionnel est recommandé.',
  ],
  faqItems: [
    {
      question: 'Les SCPI sont-elles fiscalement pénalisées avec une TMI 45 % ?',
      answer: 'Les SCPI françaises en direct sont fiscalement lourdes à TMI 45 % en raison du cumul IR + PS. Cela ne signifie pas qu\'elles sont à exclure, mais que l\'analyse doit intégrer le rendement net et les alternatives.',
    },
    {
      question: 'Faut-il éviter les SCPI françaises ?',
      answer: 'Pas nécessairement. Tout dépend de l\'objectif, de l\'horizon et du besoin de revenus. Les SCPI françaises peuvent être pertinentes si l\'objectif patrimonial le justifie, malgré le poids fiscal.',
    },
    {
      question: 'Les SCPI européennes sont-elles plus pertinentes ?',
      answer: 'Les SCPI européennes peuvent améliorer le rendement net grâce au crédit d\'impôt et à une fiscalité allégée. C\'est une piste à approfondir, sous réserve de vérifier la convention fiscale applicable.',
    },
    {
      question: 'Le démembrement est-il une solution ?',
      answer: 'Le démembrement (nue-propriété) peut être pertinent pour un investisseur sans besoin de revenus immédiats. Il neutralise la fiscalité pendant la durée du démembrement.',
    },
    {
      question: 'L\'assurance-vie est-elle préférable ?',
      answer: 'L\'assurance-vie peut être intéressante pour capitaliser les revenus sans imposition immédiate, notamment pour les investisseurs sans besoin de revenus. Le choix des UC SCPI et les frais sont à vérifier.',
    },
    {
      question: 'Une SCI à l\'IS peut-elle être utile ?',
      answer: 'Une SCI à l\'IS peut permettre une capitalisation à l\'IS et un amortissement. Ce montage est complexe et doit être justifié par un objectif patrimonial spécifique.',
    },
    {
      question: 'Quel impact sur l\'IFI ?',
      answer: 'Les parts de SCPI détenues en direct sont imposables à l\'IFI selon leur valeur IFI communiquée. En assurance-vie, le traitement peut différer. À vérifier selon la situation.',
    },
    {
      question: 'Comment MaximusSCPI analyse les projets à TMI 45 % ?',
      answer: 'MaximusSCPI analyse le rendement net fiscal selon la TMI, l\'origine des revenus et le mode de détention. L\'approche est pédagogique et ne constitue pas un conseil personnalisé.',
    },
  ],
}
