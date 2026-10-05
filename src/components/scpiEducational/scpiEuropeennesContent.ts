import type { ScpiEducationalPageConfig } from './shared'

export const scpiEuropeennesConfig: ScpiEducationalPageConfig = {
  path: '/scpi-europeennes',
  badge: 'Diversification internationale — Page pilier',
  h1: 'SCPI européennes : fiscalité, diversification et critères à analyser',
  heroSubtitle:
    'Les SCPI européennes investissent tout ou partie de leur patrimoine hors de France. Leur intérêt peut venir de la diversification et, selon les conventions fiscales, d\'un traitement fiscal différent de celui des revenus immobiliers français. La comparaison doit être faite pays par pays et en net réellement conservé.',
  seoTitle: 'SCPI européennes : fiscalité, pays, rendement net et diversification',
  seoDescription:
    'Guide SCPI européennes : conventions fiscales, revenus étrangers, crédit d\'impôt ou taux effectif selon les pays, risques, diversification et rendement net.',
  shortAnswerTitle: 'Pourquoi analyser les SCPI européennes ?',
  shortAnswer:
    'Une SCPI européenne permet d\'accéder, via un véhicule français, à des immeubles situés dans plusieurs juridictions. L\'intérêt est d\'abord économique : diversification des marchés, des locataires, des secteurs et des cycles. La fiscalité peut aussi différer de celle d\'une SCPI française, mais il n\'existe pas une règle unique « Europe = crédit d\'impôt » : la méthode d\'élimination de la double imposition dépend de chaque convention fiscale et parfois de la nature exacte du revenu.',
  keyMessage:
    'Une SCPI européenne doit être analysée pays par pays. Le gain fiscal n\'est ni uniforme ni garanti ; la diversification et la qualité des actifs restent prioritaires.',
  definitionParagraphs: [
    'Une SCPI européenne est une SCPI de droit français investissant une partie significative de son patrimoine immobilier hors de France. L\'investisseur souscrit des parts françaises, tandis que la SCPI acquiert et exploite des actifs dans plusieurs pays.',
    'Les revenus provenant d\'immeubles situés à l\'étranger sont traités selon la convention fiscale conclue entre la France et le pays concerné. Selon la convention, la double imposition peut être neutralisée notamment par un crédit d\'impôt ou par une méthode tenant compte du revenu étranger pour déterminer le taux effectif. Il faut donc éviter tout calcul fiscal unique appliqué à l\'ensemble de l\'Europe.',
    'La fiche fiscale annuelle fournie par la société de gestion est le document opérationnel de référence pour la déclaration. Elle ventile les revenus par pays et précise le traitement retenu pour l\'année concernée.',
    'Les prélèvements sociaux français ne doivent pas être ajoutés ou retranchés automatiquement dans une simulation globale. Leur traitement doit être vérifié selon la nature du revenu, la convention et la situation du contribuable.',
    'La comparaison entre SCPI françaises et européennes doit donc porter sur le revenu net après fiscalité réellement applicable, mais aussi sur la qualité du patrimoine, le taux d\'occupation financier, la dette, les valeurs d\'expertise, les frais, la collecte et la liquidité.',
    'Une SCPI investie hors zone euro peut ajouter un risque de change si les actifs ou loyers sont libellés dans une autre devise. Ce risque peut être couvert, partiellement couvert ou laissé ouvert selon la politique de la société de gestion.',
    'La diversité juridique et locative est également importante : durée des baux, indexation, répartition des charges et pratiques de marché ne sont pas identiques d\'un pays à l\'autre.',
    'L\'étiquette « européenne » ne garantit pas une diversification réelle. Une SCPI peut être majoritairement concentrée dans un seul pays, une seule devise ou un seul secteur ; il faut mesurer la concentration plutôt que compter uniquement le nombre de pays.',
  ],
  tableTitle: 'Zone / Atout potentiel / Vigilance',
  tableRows: [
    {
      level: 'Allemagne',
      advantage:
        'Marché profond sur plusieurs classes d\'actifs et convention fiscale documentée.',
      vigilance:
        'Le traitement fiscal français dépend de la convention et de la nature du revenu. Analyser également les valeurs, la vacance et le cycle local.',
    },
    {
      level: 'Pays-Bas',
      advantage:
        'Exposition à des marchés tertiaires et logistiques importants en Europe.',
      vigilance:
        'Fiscalité, réglementation et dynamique immobilière à vérifier au moment de l\'investissement. Ne pas transposer le régime allemand.',
    },
    {
      level: 'Espagne',
      advantage:
        'Diversification géographique et accès à des cycles immobiliers différents de la France.',
      vigilance:
        'Forte hétérogénéité selon les villes et secteurs ; analyser les locataires, les baux et les valeurs d\'acquisition.',
    },
    {
      level: 'Italie',
      advantage:
        'Marché important avec des opportunités variables selon les zones et classes d\'actifs.',
      vigilance:
        'Complexité administrative, fiscalité locale et liquidité des actifs à intégrer dans l\'analyse.',
    },
    {
      level: 'Belgique',
      advantage:
        'Proximité géographique et marchés tertiaires établis.',
      vigilance:
        'Concentration possible sur certaines villes ou typologies. Vérifier la convention fiscale et les métriques immobilières.',
    },
    {
      level: 'Royaume-Uni / hors zone euro',
      advantage:
        'Accès à des marchés immobiliers profonds et à des cycles différents.',
      vigilance:
        'Risque de change, convention fiscale, valorisation en devise et politique de couverture à analyser.',
    },
  ],
  tableNote:
    'Chaque pays possède sa propre fiscalité, sa propre convention avec la France et son propre cycle immobilier. La fiche fiscale annuelle de la SCPI et les textes officiels priment sur toute règle générale.',
  criteriaTitle: 'Critères à croiser pour analyser une SCPI européenne',
  criteriaCards: [
    { title: 'Répartition par pays', text: 'Mesurer la concentration réelle du patrimoine et son évolution, pas seulement le nombre de pays affiché.' },
    { title: 'Convention fiscale', text: 'Identifier pour chaque pays la méthode d\'élimination de la double imposition applicable au revenu concerné.' },
    { title: 'Fiche fiscale', text: 'Utiliser la ventilation annuelle fournie par la société de gestion pour la déclaration et la simulation nette.' },
    { title: 'TOF', text: 'Comparer le taux d\'occupation dans le temps et le rapprocher des loyers, départs de locataires et franchises.' },
    { title: 'Valeurs', text: 'Suivre prix de part, valeur de réalisation, valeur de reconstitution et évolution des expertises immobilières.' },
    { title: 'Endettement', text: 'Contrôler le niveau, le coût, les échéances et les devises de la dette.' },
    { title: 'Risque de change', text: 'Hors zone euro, vérifier la devise des actifs et la politique de couverture.' },
    { title: 'Frais', text: 'Comparer les frais réels de souscription, gestion, acquisition et arbitrage sans supposer qu\'ils sont toujours supérieurs en Europe.' },
    { title: 'Gestionnaire', text: 'Évaluer l\'expérience locale, les équipes, les partenaires et la capacité à gérer plusieurs juridictions.' },
    { title: 'Liquidité', text: 'La liquidité dépend du mécanisme de la SCPI, de la collecte et des demandes de retrait, pas de son étiquette européenne.' },
    { title: 'Secteurs', text: 'Croiser géographie et secteurs pour éviter qu\'une diversification par pays masque une concentration économique.' },
  ],
  commonErrors: [
    'Appliquer une règle fiscale unique à tous les revenus immobiliers européens.',
    'Présenter systématiquement les revenus étrangers comme soumis à un crédit d\'impôt identique en France.',
    'Ajouter ou supprimer automatiquement les prélèvements sociaux sans vérifier le traitement applicable.',
    'Comparer un taux de distribution brut avec un rendement net fiscal d\'une autre SCPI.',
    'Assimiler le nombre de pays à une diversification suffisante sans mesurer les concentrations.',
    'Ignorer le risque de change hors zone euro.',
    'Choisir une SCPI pour sa seule fiscalité sans analyser les actifs, les valeurs et la liquidité.',
  ],
  practicalCases: [
    {
      title: 'Deux pays, deux traitements fiscaux',
      text: 'Une SCPI perçoit des revenus dans plusieurs États. La fiche fiscale distingue les montants par pays et applique le mécanisme prévu par chaque convention. Le calcul net doit reprendre cette ventilation au lieu d\'appliquer un taux moyen européen.',
    },
    {
      title: 'TMI élevée',
      text: 'Une TMI élevée peut rendre le différentiel fiscal avec certains revenus étrangers plus visible, mais elle ne suffit pas à recommander une SCPI européenne. Il faut comparer le net réel, les risques et la trajectoire de la SCPI.',
    },
    {
      title: 'TMI faible',
      text: 'Avec une TMI faible, l\'écart fiscal peut être moins déterminant. La diversification géographique, la qualité des immeubles et la complémentarité avec le reste du patrimoine peuvent rester pertinentes.',
    },
    {
      title: 'SCPI concentrée sur un pays',
      text: 'Une SCPI qualifiée d\'européenne peut rester très concentrée. Une dégradation du marché local ou d\'un secteur peut alors dominer le bénéfice attendu de la diversification.',
    },
    {
      title: 'Exposition hors zone euro',
      text: 'Une SCPI détenant des actifs en livres sterling ajoute un risque de change. La performance en euros dépend alors aussi de la devise et de la politique de couverture.',
    },
  ],
  methodParagraphs: [
    'Cartographier la répartition géographique et sectorielle de la SCPI à partir du dernier rapport et des bulletins.',
    'Identifier pour chaque pays la convention fiscale pertinente et utiliser la fiche fiscale annuelle fournie par la société de gestion.',
    'Calculer un rendement net par scénario fiscal sans généraliser une méthode de crédit d\'impôt à toute l\'Europe.',
    'Croiser le rendement net avec le TOF, les valeurs, l\'endettement, la collecte, la liquidité et la trajectoire historique.',
    'Analyser le risque de change et la politique de couverture pour les actifs hors zone euro.',
    'Comparer ensuite avec des SCPI françaises ou d\'autres SCPI européennes sur la même base nette et le même horizon.',
    'Valider la déclaration et les hypothèses fiscales à partir de la fiche fiscale annuelle et, si nécessaire, avec le professionnel qui suit le dossier.',
  ],
  conclusionParagraphs: [
    'Les SCPI européennes peuvent diversifier un portefeuille et produire une fiscalité différente de celle des revenus immobiliers français, mais il n\'existe pas un régime fiscal européen unique.',
    'La bonne méthode consiste à raisonner pays par pays, puis à comparer le rendement net avec les risques immobiliers, financiers et de change.',
    'La fiscalité ne doit jamais compenser une mauvaise qualité d\'actifs, une liquidité dégradée ou une valorisation excessive.',
  ],
  faqItems: [
    {
      question: 'Qu\'est-ce qu\'une SCPI européenne ?',
      answer: 'C\'est une SCPI française qui investit une partie significative de son patrimoine immobilier dans d\'autres pays européens.',
    },
    {
      question: 'Les SCPI européennes sont-elles plus avantageuses fiscalement ?',
      answer: 'Parfois, mais pas systématiquement. Le résultat dépend des pays, des conventions fiscales, de la nature des revenus et de la situation du contribuable.',
    },
    {
      question: 'Les revenus étrangers donnent-ils toujours droit au même crédit d\'impôt ?',
      answer: 'Non. Les méthodes d\'élimination de la double imposition varient selon les conventions fiscales. Il faut vérifier pays par pays.',
    },
    {
      question: 'Les prélèvements sociaux sont-ils toujours absents ?',
      answer: 'Il ne faut pas l\'affirmer de manière générale. Leur traitement doit être vérifié selon la nature du revenu, la convention et la situation du contribuable.',
    },
    {
      question: 'Une SCPI européenne est-elle utile avec une TMI à 11 % ?',
      answer: 'Elle peut l\'être pour la diversification et la qualité des actifs. L\'avantage fiscal éventuel doit être calculé séparément.',
    },
    {
      question: 'Quels sont les risques spécifiques ?',
      answer: 'Risque pays, change hors zone euro, différences de baux, fiscalité locale, valorisation des actifs et qualité de l\'exécution du gestionnaire.',
    },
    {
      question: 'Faut-il privilégier les SCPI européennes ?',
      answer: 'Non automatiquement. Elles doivent être comparées avec les SCPI françaises et les autres solutions sur une base nette et avec les mêmes critères de risque.',
    },
    {
      question: 'Comment déclarer les revenus ?',
      answer: 'La société de gestion fournit une fiche fiscale annuelle ventilée par pays. Elle doit être rapprochée des règles de déclaration en vigueur et des conventions applicables.',
    },
    {
      question: 'Une SCPI européenne est-elle automatiquement diversifiée ?',
      answer: 'Non. Il faut mesurer les concentrations par pays, secteur, locataire et devise.',
    },
    {
      question: 'Comment MaximusSCPI analyse les SCPI européennes ?',
      answer: 'MaximusSCPI combine géographie, fiscalité pays par pays, TOF, valeurs, endettement, collecte, liquidité et trajectoire pour éviter une lecture uniquement fiscale.',
    },
  ],
  comparateurCtaLabel: 'Comparer SCPI françaises et européennes',
}
