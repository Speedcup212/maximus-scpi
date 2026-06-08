import type { ScpiEducationalPageConfig } from './shared'

export const scpiEuropeennesConfig: ScpiEducationalPageConfig = {
  path: '/scpi-europeennes',
  badge: 'Diversification internationale',
  h1: 'SCPI européennes : fiscalité, diversification et critères à analyser',
  heroSubtitle:
    'Les SCPI européennes investissent hors de France et offrent une diversification géographique patrimoniale. Elles ne sont pas réservées aux foyers fortement imposés : même à TMI 11 %, elles peuvent être pertinentes pour la diversification et la fiscalité nette, sous réserve d\'une analyse approfondie.',
  seoTitle: 'SCPI européennes : fiscalité, rendement net et diversification',
  seoDescription:
    'Comprenez les avantages et limites des SCPI européennes : fiscalité, rendement net, diversification géographique, TOF, capitalisation, endettement et risques à analyser.',
  shortAnswerTitle: 'Pourquoi analyser les SCPI européennes ?',
  shortAnswer:
    'Les SCPI européennes permettent d\'investir dans l\'immobilier d\'entreprise en Europe (Allemagne, Pays-Bas, Espagne, Italie, Belgique, etc.) via un véhicule français. Elles offrent une diversification géographique et sectorielle complémentaire aux SCPI françaises. Sur le plan fiscal, les revenus étrangers sont en principe imposés au taux effectif du pays source, avec un crédit d\'impôt en France — ce qui peut améliorer le rendement net selon la TMI et les pays d\'investissement. Elles ne sont pas automatiquement supérieures aux SCPI françaises : la qualité du patrimoine, le TOF, les frais, l\'endettement et les risques pays doivent être analysés.',
  keyMessage:
    'Les SCPI européennes ne sont pas seulement un outil fiscal. Elles sont aussi un outil de diversification géographique et patrimoniale.',
  definitionParagraphs: [
    'Une SCPI européenne est une société civile de placement immobilier de droit français qui investit principalement dans des actifs immobiliers situés hors de France, en Europe. L\'investisseur souscrit des parts en euros, via un intermédiaire français, et perçoit des revenus liés aux loyers européens.',
    'La fiscalité des revenus étrangers repose sur le principe du crédit d\'impôt : les revenus sont imposés au taux effectif du pays source (souvent entre 15 % et 25 % selon les conventions fiscales), puis l\'investisseur bénéficie d\'un crédit d\'impôt en France. Pour un foyer en TMI élevée, le gain fiscal peut être significatif par rapport à une SCPI française imposée à la TMI + prélèvements sociaux.',
    'Même à TMI 11 %, les SCPI européennes peuvent présenter un intérêt. Le différentiel fiscal est moindre, mais la diversification géographique, l\'accès à des marchés immobiliers dynamiques (logistique allemande, bureaux néerlandais) et la mutualisation européenne peuvent justifier une analyse approfondie dans une allocation théorique indicative.',
    'Les risques spécifiques incluent le risque pays (instabilité réglementaire, fiscalité locale évolutive), le risque de change si les loyers sont libellés dans une autre devise, et la complexité des baux commerciaux qui varient selon les juridictions. La typologie des baux (net, double net, triple net) influence la soutenabilité des revenus.',
    'La comparaison avec les SCPI françaises doit se faire en rendement net fiscal, pas en TDVM brut. Une SCPI européenne à 4 % de TDVM peut produire un rendement net supérieur à une SCPI française à 5 % pour un foyer en TMI 30 % ou plus, selon les pays d\'investissement.',
    'Le démembrement est possible sur certaines SCPI européennes : la nue-propriété peut convenir à un investisseur sans besoin de revenus immédiats, tandis que l\'usufruit cible les revenus. La fiscalité du démembrement sur revenus étrangers mérite une analyse spécifique avec un conseiller.',
    'Les SCPI européennes ne doivent pas être privilégiées automatiquement. Elles doivent être intégrées dans l\'analyse patrimoniale globale, puis arbitrées selon la qualité du patrimoine, le TOF, le rendement net, les frais, la capitalisation, l\'endettement et la liquidité.',
  ],
  tableTitle: 'Quel intérêt des SCPI européennes selon le profil investisseur ?',
  tableRows: [
    {
      level: 'TMI 11 %',
      advantage:
        'Diversification géographique, accès à des marchés immobiliers européens, fiscalité nette parfois compétitive.',
      vigilance:
        'Le gain fiscal pur est limité à cette TMI. L\'intérêt repose davantage sur la diversification que sur l\'optimisation fiscale.',
    },
    {
      level: 'TMI 30 %',
      advantage:
        'Enjeu fiscal plus marqué : le crédit d\'impôt étranger peut améliorer sensiblement le rendement net.',
      vigilance:
        'Déclarations fiscales spécifiques, analyse pays par pays, risque de change selon les actifs.',
    },
    {
      level: 'TMI 41 % / 45 %',
      advantage:
        'Différentiel fiscal potentiellement important par rapport aux SCPI françaises de TDVM équivalent.',
      vigilance:
        'Ne pas choisir uniquement pour la fiscalité : qualité du patrimoine et TOF restent prioritaires.',
    },
    {
      level: 'Investisseur long terme',
      advantage:
        'Horizon cohérent avec la liquidité limitée des SCPI et la diversification patrimoniale européenne.',
      vigilance:
        'Anticiper l\'évolution réglementaire et fiscale européenne sur la durée de détention.',
    },
    {
      level: 'Investisseur revenus',
      advantage:
        'Revenus trimestriels potentiellement réguliers si le TOF est élevé et le patrimoine qualitatif.',
      vigilance:
        'Calculer le rendement net fiscal réel, pas le TDVM brut. Intégrer frais et fiscalité étrangère.',
    },
    {
      level: 'Sans besoin immédiat de revenus',
      advantage:
        'Démembrement en nue-propriété possible : décote à l\'entrée, pas de fiscalité sur revenus courants.',
      vigilance:
        'Aucun revenu pendant la durée du démembrement. Horizon long obligatoire. Liquidité limitée.',
    },
  ],
  tableNote:
    'Ces profils sont des repères pédagogiques. Chaque situation patrimoniale est unique. L\'analyse doit être personnalisée avec un conseiller en investissements financiers avant toute souscription.',
  criteriaTitle: 'Critères à croiser pour analyser une SCPI européenne',
  criteriaCards: [
    { title: 'Pays d\'investissement', text: 'Chaque pays a sa fiscalité, sa réglementation locative et son cycle immobilier. L\'analyse doit être pays par pays.' },
    { title: 'Fiscalité pays par pays', text: 'Le taux effectif d\'imposition varie selon les conventions fiscales bilatérales et la nature des revenus.' },
    { title: 'TOF', text: 'Un TOF élevé en Europe ne garantit pas la soutenabilité des loyers : vérifier la qualité des baux et des locataires.' },
    { title: 'Capitalisation', text: 'La taille de la SCPI influence la diversification géographique réelle au sein de l\'Europe.' },
    { title: 'Rendement net fiscal', text: 'Comparer en rendement net, pas en TDVM brut, selon la TMI et les pays d\'investissement.' },
    { title: 'Endettement', text: 'Une dette en devise étrangère ajoute un risque de change à la charge financière.' },
    { title: 'Frais', text: 'Frais de souscription et de gestion parfois plus élevés sur les SCPI européennes que sur les SCPI françaises.' },
    { title: 'Décote / surcote', text: 'Le marché peut valoriser différemment les SCPI européennes selon la perception du risque pays.' },
    { title: 'Gestionnaire', text: 'L\'expérience du gestionnaire sur les marchés européens cibles est un critère de crédibilité.' },
    { title: 'Liquidité', text: 'Le marché secondaire des SCPI européennes peut être moins actif que celui des SCPI françaises majeures.' },
    { title: 'Diversification sectorielle', text: 'Logistique, bureaux, commerces : les cycles diffèrent selon les pays et les secteurs.' },
  ],
  commonErrors: [
    'Considérer que les SCPI européennes sont toujours fiscalement supérieures.',
    'Ignorer le risque pays et le risque de change.',
    'Comparer le TDVM brut d\'une SCPI européenne avec le rendement net d\'une SCPI française.',
    'Négliger la complexité des déclarations fiscales pour les revenus étrangers.',
    'Penser que les SCPI européennes sont réservées aux TMI élevées.',
    'Oublier de croiser avec le TOF, l\'endettement et les frais.',
  ],
  practicalCases: [
    {
      title: 'SCPI A — européenne, TMI 30 %, TDVM 4,5 %',
      text: 'Un investisseur en TMI 30 % détient une SCPI européenne investie en Allemagne et aux Pays-Bas. Le TDVM brut est de 4,5 %, mais le rendement net fiscal, après crédit d\'impôt étranger, se rapproche de ce qu\'une SCPI française à 5,5 % produirait après impôt. Simulation pédagogique : le rendement net prime sur le brut.',
    },
    {
      title: 'SCPI B — européenne, TMI 11 %, diversification',
      text: 'Un jeune investisseur en TMI 11 % cherche à diversifier son patrimoine immobilier sans se limiter à la France. La SCPI européenne offre une exposition logistique allemande et bureaux néerlandais. Le gain fiscal est modeste, mais la diversification géographique justifie l\'analyse dans une allocation théorique indicative.',
    },
    {
      title: 'SCPI C — européenne, TOF faible, risque pays',
      text: 'Une SCPI européenne concentrée sur un seul pays affiche un TOF en baisse et une décote croissante. Le risque pays et la concentration géographique amplifient la vigilance. Simulation pédagogique : la dimension européenne n\'élimine pas le risque locatif.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI intègre les SCPI européennes dans le comparateur avec les mêmes critères que les SCPI françaises : TOF, rendement, capitalisation, endettement, décote et frais. L\'objectif est de faciliter une pré-orientation structurée, sans privilégier automatiquement les véhicules européens.',
    'La première étape consiste à identifier les SCPI européennes dans le comparateur et à analyser leur répartition géographique et sectorielle. Une SCPI « européenne » concentrée sur un seul pays offre moins de diversification qu\'une SCPI répartie sur quatre ou cinq pays.',
    'La deuxième étape évalue le rendement net fiscal selon la TMI de l\'investisseur et les pays d\'investissement. MaximusSCPI propose des contenus pédagogiques et des simulateurs pour approfondir cette dimension.',
    'La troisième étape croise le TOF, l\'endettement, les frais et la décote. Une SCPI européenne attractive fiscalement mais avec un TOF faible ou une surcote importante mérite une vigilance renforcée.',
    'La pré-orientation MaximusSCPI ne constitue pas une recommandation personnalisée. Un échange avec le Cabinet Eric Bellaiche permet d\'arbitrer les SCPI européennes selon votre fiscalité, votre horizon et votre besoin de revenus.',
  ],
  conclusionParagraphs: [
    'Les SCPI européennes sont un outil de diversification géographique et patrimoniale, pas uniquement un levier fiscal. Elles méritent une place dans l\'analyse, quel que soit le niveau de TMI, à condition de croiser tous les critères : TOF, rendement net, capitalisation, endettement, frais et risques pays.',
    'Utilisez le comparateur MaximusSCPI pour identifier les SCPI européennes à approfondir, puis validez votre analyse avec un conseiller pour une simulation adaptée à votre situation fiscale et patrimoniale.',
  ],
  faqItems: [
    {
      question: 'Qu\'est-ce qu\'une SCPI européenne ?',
      answer: 'C\'est une SCPI de droit français qui investit principalement dans des actifs immobiliers situés en Europe hors de France. L\'investisseur souscrit en euros via un intermédiaire français et perçoit des revenus liés aux loyers européens.',
    },
    {
      question: 'Les SCPI européennes sont-elles fiscalement plus avantageuses ?',
      answer: 'Potentiellement, selon la TMI et les pays d\'investissement. Les revenus étrangers sont imposés au taux effectif du pays source, avec un crédit d\'impôt en France. Le gain est généralement plus marqué pour les foyers en TMI 30 % et plus, mais des avantages existent aussi à TMI 11 % selon les cas.',
    },
    {
      question: 'Les SCPI européennes sont-elles utiles avec une TMI à 11 % ?',
      answer: 'Oui, pour la diversification géographique et l\'accès à des marchés immobiliers européens. Le gain fiscal pur est limité à cette TMI, mais la diversification patrimoniale et le rendement net peuvent justifier une analyse, sans constituer une préconisation.',
    },
    {
      question: 'Quelle fiscalité pour les revenus de SCPI européennes ?',
      answer: 'Les revenus sont en principe imposés au taux effectif du pays source (via conventions fiscales), puis l\'investisseur bénéficie d\'un crédit d\'impôt en France. La déclaration fiscale est plus complexe qu\'pour une SCPI française. Un conseiller peut accompagner cette démarche.',
    },
    {
      question: 'Quels sont les risques des SCPI européennes ?',
      answer: 'Risque pays, risque de change, complexité des baux étrangers, fiscalité évolutive, liquidité secondaire parfois limitée, et risques locatifs identiques aux SCPI françaises (vacance, baisse des loyers). La diversification ne supprime pas le risque.',
    },
    {
      question: 'Faut-il privilégier les SCPI européennes ?',
      answer: 'Non automatiquement. Elles doivent être intégrées dans l\'analyse patrimoniale globale et arbitrées selon la qualité du patrimoine, le TOF, le rendement net, les frais, la capitalisation et l\'endettement. MaximusSCPI les présente comme une piste centrale d\'analyse, pas comme une recommandation systématique.',
    },
    {
      question: 'Peut-on acheter des SCPI européennes en démembrement ?',
      answer: 'Oui, sur certaines SCPI européennes. La nue-propriété convient aux investisseurs sans besoin de revenus immédiats ; l\'usufruit cible les revenus. La fiscalité du démembrement sur revenus étrangers mérite une analyse spécifique avec un conseiller.',
    },
    {
      question: 'Comment MaximusSCPI analyse les SCPI européennes ?',
      answer: 'Les SCPI européennes sont intégrées dans le comparateur avec les mêmes indicateurs clés (TOF, rendement, capitalisation, endettement, décote, frais). L\'objectif est une pré-orientation pédagogique structurée, complétée par un entretien personnalisé avec le Cabinet Eric Bellaiche.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI européennes',
}
