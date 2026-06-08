import type { ScpiEducationalPageConfig } from './shared'

export const meilleuresScpiAttentionConfig: ScpiEducationalPageConfig = {
  path: '/meilleures-scpi-attention',
  badge: 'Limites des classements',
  h1: 'Meilleures SCPI : pourquoi les classements peuvent tromper',
  heroSubtitle:
    'Une \"meilleure SCPI\" n\'existe pas de manière universelle. Un classement fondé uniquement sur le rendement peut ignorer la fiscalité, le risque de liquidité, le prix de part, la qualité du patrimoine, la concentration sectorielle ou l\'horizon de détention.',
  seoTitle: 'Meilleures SCPI : limites des classements et critères à vérifier',
  seoDescription:
    'Comprenez pourquoi les classements des meilleures SCPI peuvent être trompeurs : rendement, frais, fiscalité, liquidité, risque, TOF, capitalisation et horizon.',
  shortAnswerTitle: 'Pourquoi les classements SCPI peuvent-ils induire en erreur ?',
  shortAnswer:
    'Les classements de SCPI sont souvent construits sur un seul critère, généralement le taux de distribution. Cette approche ignore des dimensions essentielles : la fiscalité de l\'investisseur, le risque de liquidité, l\'écart avec la valeur de reconstitution, le niveau d\'endettement, le TOF, les frais réels, la concentration sectorielle ou géographique et l\'horizon d\'investissement. Une SCPI bien classée peut être inadaptée à un profil donné.',
  keyMessage:
    'Le classement peut aider à repérer des SCPI, mais il ne remplace jamais une analyse patrimoniale et multicritère.',
  definitionParagraphs: [
    'Un classement SCPI est un ordre établi sur un ou plusieurs indicateurs, généralement le TDVM (taux de distribution). Il donne une photographie instantanée de la performance passée, sans tenir compte de la situation personnelle de l\'investisseur.',
    'Le rendement passé n\'est pas un indicateur fiable du rendement futur. Une SCPI en tête de classement une année peut se retrouver en bas de tableau l\'année suivante si son TOF baisse ou si elle ajuste son prix de part.',
    'Les classements ignorent la fiscalité individuelle : une SCPI française avec un TDVM de 5,5 % peut offrir un rendement net inférieur à une SCPI européenne avec un TDVM de 5 % selon la TMI de l\'investisseur.',
    'La liquidité n\'est jamais prise en compte dans les classements. Une SCPI bien classée peut être difficile à revendre rapidement.',
    'Les frais de souscription et de gestion ne sont pas toujours intégrés. Une SCPI avec des frais plus élevés peut afficher un meilleur TDVM tout en offrant un rendement net inférieur.',
    'Les SCPI récentes bénéficient parfois d\'un avantage mécanique : peu d\'actifs, TOF élevé par construction, frais limités. Leur classement peut ne pas refléter leur maturité.',
    'La capitalisation et la diversification sont rarement pondérées. Une petite SCPI très concentrée peut temporairement surperformer une grande SCPI diversifiée.',
  ],
  tableTitle: 'Classements SCPI : utilité et limites',
  tableRows: [
    {
      level: 'Classement par rendement',
      advantage:
        'Permet d\'identifier les SCPI avec les meilleurs taux de distribution historiques.',
      vigilance:
        'Ignore la fiscalité, les frais, le risque et la liquidité. Le rendement passé ne préjuge pas de l\'avenir.',
    },
    {
      level: 'Classement par capitalisation',
      advantage:
        'Repère les SCPI les plus importantes et potentiellement les plus diversifiées.',
      vigilance:
        'La taille ne garantit ni le rendement, ni la qualité de gestion, ni la liquidité.',
    },
    {
      level: 'Classement par secteur',
      advantage:
        'Aide à identifier les SCPI spécialisées dans un secteur recherché.',
      vigilance:
        'Un secteur porteur ne garantit pas la qualité de chaque SCPI. Analyser chaque actif.',
    },
    {
      level: 'Classement par notoriété',
      advantage:
        'Met en avant des sociétés de gestion reconnues.',
      vigilance:
        'La notoriété ne remplace pas l\'analyse des indicateurs clés de la SCPI.',
    },
    {
      level: 'Classement multicritère',
      advantage:
        'Approche plus complète, intégrant plusieurs indicateurs.',
      vigilance:
        'La pondération des critères reste subjective. Vérifier la méthodologie utilisée.',
    },
  ],
  tableNote:
    'Ces repères sont valables quel que soit le classement consulté. Aucun classement ne peut remplacer une analyse personnalisée.',
  criteriaTitle: 'Critères à vérifier au-delà du classement',
  criteriaCards: [
    { title: 'Rendement net', text: 'Calculer le rendement après fiscalité (TMI + PS) et après frais de souscription et de gestion.' },
    { title: 'TOF et évolution', text: 'Un TOF stable et élevé est plus important qu\'un classement ponctuel.' },
    { title: 'Capitalisation', text: 'Vérifier si la SCPI est suffisamment capitalisée pour mutualiser les risques.' },
    { title: 'Endettement', text: 'Analyser le niveau et le coût de l\'endettement, ainsi que la part à taux fixe.' },
    { title: 'Frais réels', text: 'Comparer les frais de souscription et de gestion entre SCPI du même classement.' },
    { title: 'Décote / surcote', text: 'Comparer le prix de souscription à la valeur de reconstitution.' },
    { title: 'Liquidité', text: 'Vérifier le type de capital et le délai de retrait publié.' },
  ],
  commonErrors: [
    'Choisir une SCPI uniquement parce qu\'elle est en tête d\'un classement.',
    'Ignorer la fiscalité personnelle dans l\'analyse du rendement.',
    'Confondre classement ponctuel et qualité patrimoniale durable.',
    'Ne pas vérifier si le classement intègre les frais.',
    'Croire qu\'une SCPI récemment créée est moins risquée car elle est bien classée.',
    'Se fier à un seul classement sans recouper les sources.',
  ],
  practicalCases: [
    {
      title: 'SCPI A — tête de classement, TOF en baisse',
      text: 'Une SCPI affiche le meilleur TDVM de sa catégorie. Cependant, son TOF est passé de 97 % à 85 % en deux ans et son prix de part n\'a pas été ajusté. Simulation pédagogique : le classement reflète le passé, pas la tendance locative.',
    },
    {
      title: 'SCPI B — classement moyen, patrimoine solide',
      text: 'Une SCPI diversifiée de 2 Mds€ affiche un TDVM de 5 % (contre 6 % pour la tête de classement). Son TOF est stable à 96 %, son endettement est modéré et sa VR est cohérente. Simulation pédagogique : un classement moyen peut cacher une SCPI de qualité.',
    },
    {
      title: 'Investisseur — classement vs situation personnelle',
      text: 'Deux investisseurs comparent une SCPI française bien classée et une SCPI européenne moins bien classée. Selon leur TMI (11 % ou 41 %), le rendement net après fiscalité peut inverser la hiérarchie. Simulation pédagogique : la fiscalité personnelle change tout.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI ne diffuse pas de classement unique des SCPI, car une \"meilleure SCPI\" n\'existe pas de manière absolue. Le comparateur affiche les indicateurs clés pour que chaque investisseur puisse construire sa propre analyse.',
    'La méthode MaximusSCPI encourage une pré-orientation pédagogique basée sur le croisement des critères, jamais sur un classement simplifié.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. L\'analyse des classements doit être approfondie avec un conseiller en investissements financiers.',
  ],
  conclusionParagraphs: [
    'Les classements SCPI sont des outils de repérage utiles, mais ils ne doivent pas être utilisés comme unique critère de décision. Une analyse multicritère et personnalisée est indispensable.',
    'Utilisez le comparateur MaximusSCPI pour analyser les SCPI sur plusieurs indicateurs, puis validez votre pré-orientation avec un conseiller.',
  ],
  faqItems: [
    {
      question: 'Existe-t-il une meilleure SCPI ?',
      answer: 'Non. La meilleure SCPI dépend de la situation patrimoniale, fiscale, de l\'horizon et des objectifs de chaque investisseur.',
    },
    {
      question: 'Pourquoi les classements SCPI peuvent-ils être trompeurs ?',
      answer: 'Ils sont souvent basés sur un seul critère (le rendement), ignorent la fiscalité personnelle, les frais réels, le risque de liquidité et le contexte de marché.',
    },
    {
      question: 'Faut-il suivre les tops rendement ?',
      answer: 'Avec prudence. Un rendement élevé peut être le signe d\'un risque plus important. Il doit être croisé avec le TOF, l\'endettement et la qualité du patrimoine.',
    },
    {
      question: 'Comment comparer les SCPI sans biais ?',
      answer: 'Utiliser une grille multicritère intégrant le rendement net fiscal, le TOF, la capitalisation, l\'endettement, les frais, la décote/surcote et la liquidité.',
    },
    {
      question: 'Une SCPI récente peut-elle être mieux classée ?',
      answer: 'Oui, mécaniquement, une SCPI récente peut afficher un TOF élevé par construction et un rendement temporairement avantageux, sans recul suffisant.',
    },
    {
      question: 'Quel rôle joue la fiscalité ?',
      answer: 'La fiscalité personnelle peut modifier significativement le rendement net. Un classement brut ne tient pas compte de cet élément.',
    },
    {
      question: 'Comment MaximusSCPI évite les classements simplistes ?',
      answer: 'Le comparateur affiche plusieurs indicateurs sans pondération unique. MaximusSCPI privilégie une approche pédagogique et transparente.',
    },
    {
      question: 'Quelle méthode utiliser à la place ?',
      answer: 'Analyser plusieurs critères, les croiser avec sa situation personnelle, diversifier et consulter un conseiller certifié.',
    },
  ],
  comparateurCtaLabel: 'Découvrir le comparateur SCPI MaximusSCPI',
}
