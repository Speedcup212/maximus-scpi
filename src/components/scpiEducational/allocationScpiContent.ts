import type { ScpiEducationalPageConfig } from './shared'

export const allocationScpiConfig: ScpiEducationalPageConfig = {
  path: '/allocation-scpi',
  badge: 'Pondération & diversification',
  h1: 'Allocation SCPI : comment construire un portefeuille cohérent',
  heroSubtitle:
    'Construire une allocation SCPI cohérente consiste à répartir un investissement entre plusieurs SCPI ou typologies en fonction du montant, de la fiscalité, du besoin de revenus, de l\'horizon, du risque accepté et des secteurs. Il ne s\'agit pas d\'empiler des SCPI, mais d\'organiser une diversification utile.',
  seoTitle: 'Allocation SCPI : diversification sectorielle, géographique et fiscale',
  seoDescription:
    'Guide complet de l\'allocation SCPI : nombre de SCPI selon le montant, diversification sectorielle et géographique, France/Europe, fiscalité, objectifs (revenus, retraite, transmission), exemples chiffrés 50k€, 100k€, 200k€.',
  shortAnswerTitle: 'Qu\'est-ce qu\'une allocation SCPI cohérente ?',
  shortAnswer:
    'Une allocation SCPI ne se résume pas à empiler plusieurs SCPI. Elle doit organiser une diversification utile : sectorielle (bureaux, santé, logistique, commerce, diversifié), géographique (France, Europe), par enveloppe (direct, assurance-vie, PER, SCI), par indicateur de risque (TOF, endettement, capitalisation) et par horizon. L\'allocation dépend du montant investi, de la fiscalité personnelle et des objectifs patrimoniaux. Le nombre de SCPI optimal varie : 1 à 2 pour un petit montant, 3 à 5 pour un montant moyen, 5 à 8 pour un portefeuille plus important.',
  keyMessage:
    'Une allocation SCPI cohérente ne consiste pas à empiler des SCPI. Elle doit organiser une diversification utile, fiscalement lisible et compatible avec l\'horizon d\'investissement.',
  definitionParagraphs: [
    'L\'allocation SCPI est la répartition d\'un investissement entre plusieurs SCPI ou typologies de SCPI. Contrairement à une allocation automatisée, elle doit être construite en fonction de la situation personnelle de l\'investisseur.',
    'La diversification sectorielle consiste à répartir l\'investissement entre plusieurs secteurs immobiliers : bureaux, commerces, santé, logistique, résidentiel, diversifié. Cette approche réduit la dépendance à un seul secteur.',
    'La diversification géographique peut inclure des SCPI françaises et européennes. Les SCPI européennes offrent une exposition à d\'autres marchés et une fiscalité différente (PS à 0 % selon les conventions).',
    'La diversification par enveloppe permet de choisir entre le direct (simplicité, frais réduits), l\'assurance-vie (report d\'imposition, abattement après 8 ans), le PER (déduction fiscale) ou la SCI à l\'IS (pour les gros volumes).',
    'La diversification par risque consiste à mixer des SCPI avec des profils différents : SCPI défensives (TOF > 95 %, endettement faible, capitalisation importante) et SCPI de rendement (TDVM plus élevé, risque potentiellement plus élevé).',
    'Le nombre de SCPI optimal dépend du montant investi. En dessous de 50 000 €, 1 à 3 SCPI maximum. Entre 50 000 € et 150 000 €, 3 à 5 SCPI. Au-delà de 150 000 €, 5 à 8 SCPI. Au-delà de 8 SCPI, la sur-diversification peut diluer la performance sans bénéfice réel.',
    'Une allocation doit éviter deux écueils : la concentration excessive (trop de risques sur une seule SCPI ou un seul secteur) et la sur-diversification (trop de SCPI pour le montant investi, rendant chaque ligne marginale).',
  ],
  tableTitle: 'Objectif patrimonial / Construction possible / Vigilance',
  tableRows: [
    {
      level: 'Revenus complémentaires',
      advantage: 'SCPI à TOF stable et distributions régulières. Privilégier les SCPI diversifiées ou santé/logistique.',
      vigilance: 'Un rendement élevé peut cacher un risque plus important. Ne pas sacrifier la qualité du TOF pour le rendement.',
    },
    {
      level: 'Diversification patrimoniale',
      advantage: 'Mixer secteurs (bureaux prime, santé, logistique, commerce alimentaire) et géographies (France + Europe).',
      vigilance: 'Éviter la sur-concentration sur un seul secteur, même porteur. La diversification doit être réelle, pas seulement affichée.',
    },
    {
      level: 'Fiscalité',
      advantage: 'SCPI françaises en AV (flat tax après 8 ans), SCPI européennes en direct (PS 0 %), PER (déduction TMI).',
      vigilance: 'La fiscalité ne doit pas être le seul critère. La qualité du patrimoine reste centrale dans la décision.',
    },
    {
      level: 'Transmission',
      advantage: 'SCPI en assurance-vie (abattement successoral de 152 500 € par bénéficiaire). Démembrement temporaire.',
      vigilance: 'Anticiper les droits de succession selon le montant du patrimoine et la fiscalité des héritiers.',
    },
    {
      level: 'Préparation retraite',
      advantage: 'SCPI en PER ou en direct avec horizon long. Démembrement possible pour optimiser la fiscalité.',
      vigilance: 'Vérifier la liquidité à l\'âge de la retraite. Anticiper le besoin de revenus et la fiscalité des rentes.',
    },
    {
      level: 'Réduction de concentration',
      advantage: 'Mixer 3-5 SCPI de profils différents et complémentaires. Intégrer des SCPI européennes.',
      vigilance: 'La diversification excessive (> 8 SCPI) n\'apporte pas de bénéfice supplémentaire et complexifie le suivi.',
    },
  ],
  tableNote:
    'Ces objectifs sont des pistes à approfondir. L\'allocation doit être validée selon la situation personnelle de l\'investisseur.',
  criteriaTitle: 'Critères pour construire une allocation',
  criteriaCards: [
    { title: 'Montant investi', text: 'Détermine le nombre de SCPI possibles. Moins de 50 000 € : 1 à 3 SCPI. 50-150k€ : 3-5 SCPI. Plus de 150k€ : 5-8 SCPI.' },
    { title: 'Secteurs immobiliers', text: 'Mixer bureaux (prime), santé, logistique, commerce alimentaire, diversifié. Éviter la sur-concentration sectorielle.' },
    { title: 'Géographie', text: 'France + Europe (Allemagne, Pays-Bas, Espagne, Italie) selon la fiscalité et les objectifs de diversification.' },
    { title: 'Enveloppe de détention', text: 'Direct, assurance-vie, PER, SCI. Chaque enveloppe a des implications fiscales et de liquidité spécifiques.' },
    { title: 'Profil de risque', text: 'Équilibrer entre SCPI défensives (TOF élevé, endettement faible) et SCPI de rendement (TDVM plus élevé, risque maîtrisé).' },
    { title: 'Fiscalité personnelle', text: 'Adapter l\'allocation à la TMI : SCPI européennes pour TMI 30-41 %, SCPI en AV pour les hauts revenus, PER pour TMI 30 % et plus.' },
    { title: 'Horizon', text: 'Plus l\'horizon est long, plus l\'allocation peut intégrer des SCPI de rendement et du démembrement.' },
    { title: 'Liquidité', text: 'Prévoir une poche de liquidité. Ne pas immobiliser toute son épargne dans des SCPI.' },
  ],
  commonErrors: [
    'Acheter trop de SCPI différentes sans stratégie claire.',
    'Investir tout son capital sur une seule SCPI (concentration excessive).',
    'Ignorer la corrélation entre les secteurs choisis (ex : bureaux + commerces peuvent être corrélés).',
    'Sur-pondérer un secteur porteur (ex : logistique) sans vérifier les risques de valorisation.',
    'Négliger l\'impact fiscal dans le choix de l\'enveloppe de détention.',
    'Augmenter le nombre de SCPI au-delà de ce que le montant permet (sur-diversification).',
    'Construire une allocation sans objectif patrimonial clair.',
    'Oublier la liquidité : les SCPI ne sont pas disponibles comme un livret d\'épargne.',
  ],
  practicalCases: [
    {
      title: 'Exemple 50 000 € — Petit montant',
      text: 'Un investisseur dispose de 50 000 €. Simulation pédagogique : 2 SCPI maximum. Option A : 1 SCPI diversifiée France capitalisation > 500 M€ (exposition large). Option B : 1 SCPI spécialisée santé + 1 SCPI diversifiée. Enveloppe : direct ou AV selon la fiscalité. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.',
    },
    {
      title: 'Exemple 100 000 € — Montant moyen',
      text: 'Un couple TMI 30 % dispose de 100 000 €. Simulation pédagogique : 3 à 4 SCPI. Répartition possible : 35 % SCPI diversifiée France, 25 % SCPI santé, 25 % SCPI logistique, 15 % SCPI européenne. Enveloppes : 60 % direct, 40 % AV. Simulation indicative, à valider selon la situation personnelle.',
    },
    {
      title: 'Exemple 200 000 € — Montant important',
      text: 'Un investisseur TMI 41 % dispose de 200 000 €. Simulation pédagogique : 5 à 7 SCPI. Secteurs : bureaux prime (20 %), santé (20 %), logistique (15 %), diversifié (20 %), SCPI européenne (15 %), SCPI commerce alimentaire (10 %). Enveloppes : direct, AV et PER selon la fiscalité. Pré-orientation pédagogique à valider avec un conseiller.',
    },
    {
      title: 'Investisseur TMI 30 % sans besoin immédiat de revenus',
      text: 'Un investisseur TMI 30 % avec 80 000 € ne cherche pas de revenus immédiats. Simulation : privilégier les SCPI en AV pour le report d\'imposition et les SCPI européennes en direct (PS 0 %). La capitalisation des revenus permet de bénéficier de l\'effet composé.',
    },
    {
      title: 'Investisseur orienté retraite',
      text: 'Un investisseur de 50 ans prépare sa retraite avec 120 000 €. Simulation : PER avec SCPI (déduction TMI), complété par des SCPI en direct ou en AV. Objectif : capitalisation jusqu\'à la retraite, puis conversion en revenus. Pré-orientation à valider selon la situation.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI aide à structurer une réflexion sur l\'allocation SCPI à travers ses contenus pédagogiques et son comparateur.',
    'La première étape de la méthode MaximusSCPI consiste à qualifier l\'objectif patrimonial : revenus, diversification, fiscalité, transmission, retraite.',
    'La deuxième étape analyse le montant disponible, la fiscalité (TMI, PS, IFI) et l\'horizon pour déterminer le nombre de SCPI et les enveloppes adaptées.',
    'La troisième étape sélectionne les SCPI candidates selon les critères multicritères : TOF, capitalisation, endettement, décote/surcote, frais, secteurs.',
    'La quatrième étape construit l\'allocation en vérifiant la cohérence d\'ensemble : diversification réelle, absence de sur-concentration, lisibilité.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. L\'allocation finale doit être validée avec un conseiller du Cabinet Eric Bellaiche.',
  ],
  conclusionParagraphs: [
    'Une allocation SCPI cohérente est une diversification utile, pas un empilement de SCPI. Elle dépend du montant, de la fiscalité, de l\'horizon et des objectifs.',
    'Sources et points à vérifier : DIC, notes d\'information, rapports annuels, bulletins trimestriels, fiches ASPIM, données des sociétés de gestion.',
    'Utilisez le comparateur MaximusSCPI pour identifier les SCPI candidates, puis validez votre allocation avec un conseiller.',
  ],
  faqItems: [
    {
      question: 'Combien de SCPI faut-il détenir dans une allocation ?',
      answer: 'Cela dépend du montant. 1 à 2 SCPI pour un petit montant (< 50 000 €), 3 à 5 pour un montant moyen, 5 à 8 pour un portefeuille important.',
    },
    {
      question: 'Comment diversifier son allocation SCPI ?',
      answer: 'Par secteurs (bureaux, santé, logistique, commerce, diversifié), par géographie (France, Europe), par enveloppe (direct, AV, PER) et par profil de risque.',
    },
    {
      question: 'Faut-il mélanger SCPI françaises et européennes ?',
      answer: 'Oui, c\'est une stratégie pertinente pour diversifier la fiscalité (PS à 0 % pour les européennes) et les marchés immobiliers.',
    },
    {
      question: 'Quels secteurs immobiliers combiner ?',
      answer: 'Bureaux prime, santé/logistique pour la stabilité, commerce alimentaire, diversifié. Éviter la sur-concentration dans un seul secteur.',
    },
    {
      question: 'Peut-on diversifier avec un petit montant ?',
      answer: 'Oui, mais le nombre de SCPI est limité. Privilégier une SCPI diversifiée de bonne qualité plutôt que plusieurs SCPI de qualité moyenne.',
    },
    {
      question: 'Comment éviter la sur-diversification ?',
      answer: 'Limiter le nombre de SCPI à ce que le montant permet. Une ligne de moins de 5 000 € est souvent trop marginale pour être utile.',
    },
    {
      question: 'Une allocation peut-elle être automatisée ?',
      answer: 'Non. Une allocation automatisée n\'est pas conforme MIF2 sans recueil d\'information préalable. Elle doit être personnalisée.',
    },
    {
      question: 'Quel rôle joue l\'enveloppe dans l\'allocation ?',
      answer: 'L\'enveloppe détermine la fiscalité et la liquidité. Direct, AV, PER et SCI n\'ont pas les mêmes implications.',
    },
    {
      question: 'Faut-il tout investir d\'un coup ou progressivement ?',
      answer: 'Investir progressivement peut lisser le prix d\'entrée et le risque de calendrier. À valider selon la situation.',
    },
    {
      question: 'Comment MaximusSCPI aide à structurer une allocation ?',
      answer: 'Le comparateur et les contenus pédagogiques fournissent les clés pour analyser les SCPI. L\'approche est pédagogique et ne constitue pas une recommandation personnalisée.',
    },
  ],
  comparateurCtaLabel: 'Construire une allocation SCPI cohérente selon votre fiscalité et votre horizon',
}
