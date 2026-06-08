import type { ScpiEducationalPageConfig } from './shared'

export const allocationScpiConfig: ScpiEducationalPageConfig = {
  path: '/allocation-scpi',
  badge: 'Pondération & diversification',
  h1: 'Allocation SCPI : diversification, fiscalité et construction cohérente',
  heroSubtitle:
    'Construire une allocation SCPI cohérente consiste à répartir un investissement entre plusieurs SCPI ou typologies en fonction du montant, de la fiscalité, du besoin de revenus, de l\'horizon, du risque accepté et des secteurs.',
  seoTitle: 'Allocation SCPI : comment diversifier entre secteurs, pays et fiscalité',
  seoDescription:
    'Comprenez comment construire une allocation SCPI cohérente : diversification sectorielle, géographique, fiscalité, rendement net, risques, TOF et liquidité.',
  shortAnswerTitle: 'Qu\'est-ce qu\'une allocation SCPI cohérente ?',
  shortAnswer:
    'Une allocation SCPI ne se résume pas à empiler plusieurs SCPI. Elle doit organiser une diversification utile : sectorielle (bureaux, santé, logistique, commerce, diversifié), géographique (France, Europe), par enveloppe (direct, assurance-vie, PER, SCI), par indicateur de risque (TOF, endettement, capitalisation) et par horizon. L\'allocation dépend du montant investi, de la fiscalité et des objectifs patrimoniaux.',
  keyMessage:
    'Une allocation SCPI cohérente ne se résume pas à empiler plusieurs SCPI. Elle doit organiser une diversification utile.',
  definitionParagraphs: [
    'L\'allocation SCPI est la répartition d\'un investissement entre plusieurs SCPI ou typologies de SCPI. Contrairement à une allocation automatique, elle doit être construite en fonction de la situation personnelle de l\'investisseur.',
    'La diversification sectorielle consiste à répartir l\'investissement entre plusieurs secteurs immobiliers : bureaux, commerces, santé, logistique, résidentiel, diversifié. Cette approche réduit la dépendance à un seul secteur.',
    'La diversification géographique peut inclure des SCPI françaises et européennes. Les SCPI européennes offrent une exposition à d\'autres marchés et une fiscalité différente (PS à 0 %).',
    'La diversification par enveloppe permet de choisir entre le direct, l\'assurance-vie, le PER ou la SCI, selon les objectifs fiscaux et patrimoniaux.',
    'La diversification par risque consiste à mixer des SCPI avec des profils différents : TOF élevé, endettement modéré, capitalisation importante, décote sur VR.',
    'Le nombre de SCPI optimal dépend du montant investi : 1 à 2 SCPI pour un petit montant, 3 à 5 SCPI pour un portefeuille de taille moyenne, 5 à 8 SCPI pour un portefeuille plus important.',
  ],
  tableTitle: 'Allocation SCPI : objectifs et diversification',
  tableRows: [
    {
      level: 'Revenus réguliers',
      advantage:
        'Privilégier des SCPI avec un TOF stable et un historique de distributions régulières.',
      vigilance:
        'Un rendement élevé peut cacher un risque plus important. Ne pas sacrifier la qualité pour le rendement.',
    },
    {
      level: 'Fiscalité',
      advantage:
        'SCPI françaises en AV, SCPI européennes en direct ou AV selon TMI.',
      vigilance:
        'La fiscalité ne doit pas être le seul critère. La qualité du patrimoine reste centrale.',
    },
    {
      level: 'Horizon long terme',
      advantage:
        'Diversification sectorielle et géographique possible. Démembrement ou nue-propriété.',
      vigilance:
        'Vérifier la liquidité et les frais de sortie. Ne pas immobiliser toute son épargne.',
    },
    {
      level: 'Réduction de concentration',
      advantage:
        'Mixer bureaux, santé, logistique, diversifié. Ajouter des SCPI européennes si pertinent.',
      vigilance:
        'Une diversification excessive peut diluer la performance. Rester lisible dans ses choix.',
    },
    {
      level: 'Transmission',
      advantage:
        'SCPI en assurance-vie pour l\'abattement successoral. Démembrement temporaire.',
      vigilance:
        'Anticiper les droits de succession et la fiscalité des héritiers.',
    },
  ],
  tableNote:
    'Ces objectifs sont des pistes à approfondir. L\'allocation doit être validée selon la situation personnelle de l\'investisseur.',
  criteriaTitle: 'Critères pour construire une allocation',
  criteriaCards: [
    { title: 'Montant investi', text: 'Détermine le nombre de SCPI possibles. Moins de 50 000 € : 1 à 3 SCPI. Plus de 150 000 € : 4 à 8 SCPI.' },
    { title: 'Secteurs', text: 'Mixer bureaux (prime), santé, logistique, commerce alimentaire, diversifié. Éviter la sur-concentration.' },
    { title: 'Géographie', text: 'France + Europe (Allemagne, Pays-Bas, Espagne, Italie) selon la fiscalité et les objectifs.' },
    { title: 'Enveloppe', text: 'Direct, assurance-vie, PER, SCI. Chaque enveloppe a des implications fiscales et de liquidité.' },
    { title: 'Risque', text: 'Équilibrer entre SCPI défensives (TOF élevé, endettement faible) et SCPI de rendement.' },
    { title: 'Fiscalité', text: 'Adapter l\'allocation à la TMI : SCPI européennes pour TMI 30-41 %, SCPI en AV pour les hauts revenus.' },
  ],
  commonErrors: [
    'Acheter trop de SCPI différentes sans stratégie claire.',
    'Investir tout son capital sur une seule SCPI.',
    'Ignorer la corrélation entre les secteurs choisis.',
    'Sur-pondérer un secteur porteur sans vérifier les risques.',
    'Négliger l\'impact fiscal dans le choix de l\'enveloppe.',
    'Augmenter le nombre de SCPI au-delà de ce que le montant permet.',
  ],
  practicalCases: [
    {
      title: 'Petit portefeuille — 30 000 €',
      text: 'Un investisseur dispose de 30 000 €. Simulation : 1 à 2 SCPI maximum. Choisir une SCPI diversifiée à capitalisation importante ou une SCPI spécialisée avec un bon TOF. Pré-orientation pédagogique : privilégier la qualité plutôt que la quantité.',
    },
    {
      title: 'Portefeuille moyen — 100 000 €',
      text: 'Un couple avec 100 000 €. Simulation : 3 à 4 SCPI. Répartition possible : 40 % SCPI diversifiée France, 30 % SCPI santé, 30 % SCPI logistique. Enveloppes : direct et assurance-vie. Simulation indicative.',
    },
    {
      title: 'Gros portefeuille — 300 000 €',
      text: 'Un investisseur avec 300 000 €. Simulation : 5 à 7 SCPI. Secteurs : bureaux prime, santé, logistique, commerce alimentaire, diversifié, SCPI européenne. Enveloppes : direct, AV, PER. Pré-orientation pédagogique à valider.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI aide à structurer une réflexion sur l\'allocation SCPI à travers ses contenus pédagogiques et son comparateur.',
    'La méthode MaximusSCPI consiste à analyser le montant disponible, la fiscalité, l\'horizon et les objectifs avant de suggérer une pré-orientation.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. L\'allocation finale doit être validée avec un conseiller.',
  ],
  conclusionParagraphs: [
    'Une allocation SCPI cohérente est une diversification utile, pas un empilement de SCPI. Elle dépend du montant, de la fiscalité, de l\'horizon et des objectifs.',
    'Utilisez le comparateur MaximusSCPI pour identifier les SCPI, puis validez votre allocation avec un conseiller.',
  ],
  faqItems: [
    {
      question: 'Combien de SCPI faut-il détenir ?',
      answer: 'Cela dépend du montant. 1 à 2 SCPI pour un petit montant, 3 à 5 pour un montant moyen, 5 à 8 pour un portefeuille important.',
    },
    {
      question: 'Comment diversifier une allocation SCPI ?',
      answer: 'Par secteurs (bureaux, santé, logistique, commerce, diversifié), par géographie (France, Europe), par enveloppe (direct, AV, PER) et par profil de risque.',
    },
    {
      question: 'Faut-il mélanger SCPI françaises et européennes ?',
      answer: 'Oui, c\'est une stratégie pertinente pour diversifier la fiscalité (PS à 0 %) et les marchés immobiliers.',
    },
    {
      question: 'Quels secteurs combiner ?',
      answer: 'Bureaux prime, santé/logistique pour la stabilité, commerce alimentaire, diversifié. Éviter la sur-concentration dans un seul secteur.',
    },
    {
      question: 'Peut-on diversifier avec un petit montant ?',
      answer: 'Oui, mais le nombre de SCPI est limité. Privilégier une SCPI diversifiée de bonne qualité plutôt que plusieurs SCPI de qualité moyenne.',
    },
    {
      question: 'Comment éviter la sur-diversification ?',
      answer: 'Limiter le nombre de SCPI à ce que le montant permet. Une SCPI avec moins de 5 000 € peut être trop marginale.',
    },
    {
      question: 'Une allocation peut-elle être automatisée ?',
      answer: 'Non, une allocation automatisée n\'est pas conforme MIF2 sans recueil d\'information préalable. Elle doit être personnalisée.',
    },
    {
      question: 'Comment MaximusSCPI aide à structurer une allocation ?',
      answer: 'Le comparateur et les contenus pédagogiques fournissent les clés pour analyser les SCPI. MaximusSCPI ne constitue pas une recommandation personnalisée.',
    },
  ],
  comparateurCtaLabel: 'Découvrir le comparateur SCPI MaximusSCPI',
}
