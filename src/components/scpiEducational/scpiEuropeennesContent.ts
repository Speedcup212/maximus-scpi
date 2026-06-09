import type { ScpiEducationalPageConfig } from './shared'

export const scpiEuropeennesConfig: ScpiEducationalPageConfig = {
  path: '/scpi-europeennes',
  badge: 'Diversification internationale — Page pilier',
  h1: 'SCPI européennes : fiscalité, diversification et critères à analyser',
  heroSubtitle:
    'Les SCPI européennes investissent hors de France et offrent une diversification géographique patrimoniale. Elles ne sont pas réservées aux foyers fortement imposés : même à TMI 11 %, elles peuvent être pertinentes pour la diversification et le rendement net. Cette page pilier détaille les avantages fiscaux, les risques spécifiques, les cas pratiques selon la TMI et la méthode d\'analyse MaximusSCPI.',
  seoTitle: 'SCPI européennes : fiscalité, pays, rendement net et diversification — Guide pilier',
  seoDescription:
    'Guide pilier sur les SCPI européennes : fiscalité des revenus étrangers, crédit d\'impôt, taux effectif, comparaison par pays (Allemagne, Pays-Bas, Espagne, Italie), rendement net selon TMI, cas pratiques, risques et méthode MaximusSCPI.',
  shortAnswerTitle: 'Pourquoi analyser les SCPI européennes ?',
  shortAnswer:
    'Les SCPI européennes permettent d\'investir dans l\'immobilier d\'entreprise en Europe (Allemagne, Pays-Bas, Espagne, Italie, Belgique, etc.) via un véhicule français. Elles offrent une diversification géographique et sectorielle complémentaire aux SCPI françaises. Sur le plan fiscal, les revenus étrangers sont imposés au taux effectif du pays source, avec un crédit d\'impôt en France — ce qui peut améliorer le rendement net selon la TMI et les pays d\'investissement. Elles ne sont pas automatiquement supérieures aux SCPI françaises : la qualité du patrimoine, le TOF, les frais, l\'endettement et les risques pays doivent être analysés. L\'intérêt dépasse la seule fiscalité : diversification géographique, accès à des marchés différents et mutualisation européenne.',
  keyMessage:
    'Les SCPI européennes ne sont pas seulement un outil fiscal. Elles peuvent aussi apporter diversification géographique, exposition à d\'autres marchés et lecture différente du rendement net.',
  definitionParagraphs: [
    'Une SCPI européenne est une société civile de placement immobilier de droit français qui investit principalement dans des actifs immobiliers situés hors de France, en Europe. L\'investisseur souscrit des parts en euros, via un intermédiaire français, et perçoit des revenus liés aux loyers européens.',
    'La fiscalité des revenus étrangers repose sur le principe du crédit d\'impôt : les revenus sont imposés au taux effectif du pays source (souvent entre 15 % et 25 % selon les conventions fiscales), puis l\'investisseur bénéficie d\'un crédit d\'impôt en France. Pour un foyer en TMI élevée, le gain fiscal peut être significatif par rapport à une SCPI française imposée à la TMI + prélèvements sociaux.',
    'Même à TMI 11 %, les SCPI européennes peuvent présenter un intérêt. Le différentiel fiscal est moindre, mais la diversification géographique, l\'accès à des marchés immobiliers dynamiques (logistique allemande, bureaux néerlandais) et la mutualisation européenne peuvent justifier une analyse approfondie.',
    'Les risques spécifiques incluent le risque pays (instabilité réglementaire, fiscalité locale évolutive), le risque de change si les loyers sont libellés dans une autre devise (hors zone euro), et la complexité des baux commerciaux qui varient selon les juridictions. La typologie des baux (net, double net, triple net) influence la soutenabilité des revenus.',
    'La comparaison avec les SCPI françaises doit se faire en rendement net fiscal, pas en TDVM brut. Une SCPI européenne à 4 % de TDVM peut produire un rendement net supérieur à une SCPI française à 5 % pour un foyer en TMI 30 % ou plus, selon les pays d\'investissement.',
    'Le démembrement est possible sur certaines SCPI européennes : la nue-propriété peut convenir à un investisseur sans besoin de revenus immédiats, tandis que l\'usufruit cible les revenus. La fiscalité du démembrement sur revenus étrangers mérite une analyse spécifique avec un conseiller.',
    'Les SCPI européennes ne doivent pas être privilégiées automatiquement. Elles doivent être intégrées dans l\'analyse patrimoniale globale, puis arbitrées selon la qualité du patrimoine, le TOF, le rendement net, les frais, la capitalisation et l\'endettement.',
    'Certaines SCPI dites « européennes » sont en réalité fortement concentrées sur 1 ou 2 pays. Une diversification paneuropéenne réelle suppose une répartition sur au moins 4 à 5 pays, avec des actifs de qualité dans chacun d\'eux.',
  ],
  tableTitle: 'Pays / Atout potentiel / Vigilance',
  tableRows: [
    {
      level: 'Allemagne',
      advantage:
        'Premier marché immobilier européen. Stabilité économique. Baux longs. Fiscalité conventionnelle claire. Crédit d\'impôt.',
      vigilance:
        'Marché tendu sur certaines classes d\'actifs. Concurrence élevée. Rendements parfois comprimés.',
    },
    {
      level: 'Pays-Bas',
      advantage:
        'Marché dynamique. Logistique performante. Baux indexés. Fiscalité potentiellement intéressante.',
      vigilance:
        'Taux effectif (pas crédit d\'impôt). Marché de taille modeste. Risque de surchauffe sur certains secteurs.',
    },
    {
      level: 'Espagne',
      advantage:
        'Marché en reprise. Rendements parfois plus élevés qu\'en France. Diversification géographique réelle.',
      vigilance:
        'Volatilité économique et politique. Marché locatif moins mature. Risque de vacance sur certains actifs.',
    },
    {
      level: 'Italie',
      advantage:
        'Marché de grande taille. Opportunités sur certains segments. Conventions fiscales applicables.',
      vigilance:
        'Complexité administrative. Volatilité économique. Marché locatif hétérogène selon les régions.',
    },
    {
      level: 'Belgique',
      advantage:
        'Proximité géographique. Marché des bureaux et commerces actif. Fiscalité connue.',
      vigilance:
        'Marché de taille modeste. Concurrence des REITs belges. Sensibilité aux cycles politiques.',
    },
    {
      level: 'Royaume-Uni (hors UE)',
      advantage:
        'Marché immobilier liquide. Baux longs dans certains secteurs. Profondeur du marché.',
      vigilance:
        'Hors UE : fiscalité spécifique. Risque de change (GBP). Convention fiscale à vérifier. Volatilité politique.',
    },
  ],
  tableNote:
    'Ce tableau est une synthèse pédagogique. Chaque pays a sa propre convention fiscale et son cycle immobilier. L\'analyse doit être faite pays par pays, SCPI par SCPI.',
  criteriaTitle: 'Critères à croiser pour analyser une SCPI européenne',
  criteriaCards: [
    { title: 'Pays d\'investissement', text: 'Chaque pays a sa fiscalité, sa réglementation locative et son cycle immobilier. Une SCPI vraiment européenne est diversifiée sur 4 à 5 pays.' },
    { title: 'Fiscalité par pays', text: 'Le taux effectif d\'imposition et le crédit d\'impôt varient selon les conventions. Allemagne = crédit d\'impôt, Pays-Bas = taux effectif.' },
    { title: 'TOF', text: 'Un TOF élevé en Europe ne garantit pas la soutenabilité des loyers. Vérifier la qualité des baux et des locataires selon le droit local.' },
    { title: 'Capitalisation', text: 'La taille de la SCPI influence sa capacité à diversifier réellement entre plusieurs pays européens.' },
    { title: 'Rendement net fiscal', text: 'Comparer en rendement net après crédit d\'impôt et PS réduits, pas en TDVM brut. C\'est le seul indicateur pertinent.' },
    { title: 'Endettement', text: 'Une dette en devise étrangère ajoute un risque de change à la charge financière. Vérifier la répartition par devise.' },
    { title: 'Frais', text: 'Frais de souscription et de gestion parfois plus élevés sur les SCPI européennes (complexité de gestion multi-pays).' },
    { title: 'Décote / surcote', text: 'Le marché peut valoriser différemment les SCPI européennes selon la perception du risque pays et la qualité du patrimoine.' },
    { title: 'Gestionnaire', text: 'L\'expérience du gestionnaire sur les marchés européens cibles est un critère essentiel de crédibilité et de compétence.' },
    { title: 'Liquidité', text: 'Le marché secondaire des SCPI européennes peut être moins actif que celui des SCPI françaises majeures.' },
    { title: 'Diversification sectorielle', text: 'Logistique, bureaux, commerces, santé : les cycles diffèrent selon les pays et les secteurs. Une SCPI multi-pays multi-secteurs offre la meilleure diversification.' },
  ],
  commonErrors: [
    'Considérer que les SCPI européennes sont toujours fiscalement supérieures aux SCPI françaises.',
    'Ignorer le risque pays et le risque de change (notamment hors zone euro).',
    'Comparer le TDVM brut d\'une SCPI européenne avec le rendement net d\'une SCPI française.',
    'Négliger la complexité des déclarations fiscales pour les revenus étrangers (fiche fiscale par pays).',
    'Penser que les SCPI européennes sont réservées aux TMI élevées (la diversification profite aussi aux TMI 11 %).',
    'Oublier de croiser le TOF, l\'endettement et les frais comme pour toute SCPI.',
    'Croire qu\'une SCPI « européenne » est automatiquement diversifiée (vérifier le nombre réel de pays).',
  ],
  practicalCases: [
    {
      title: 'TMI 11 % — Diversification européenne',
      text: 'Un jeune investisseur en TMI 11 % cherche à diversifier son patrimoine au-delà de la France. Une SCPI européenne investie en Allemagne et aux Pays-Bas offre une exposition logistique et bureaux. Simulation pédagogique : le gain fiscal pur est modeste à cette TMI, mais la diversification géographique et sectorielle justifie l\'analyse dans une allocation théorique indicative.',
    },
    {
      title: 'TMI 30 % — Comparaison France / Europe',
      text: 'SCPI française : TDVM 5,5 %. Après IR (30 %) + PS, rendement net estimé ~3,2 %. SCPI européenne : TDVM 4,5 %. Après crédit d\'impôt et PS réduits, rendement net estimé ~3,5 à 4 %. Simulation pédagogique : le rendement net peut être meilleur en Europe malgré un TDVM brut inférieur.',
    },
    {
      title: 'TMI 41 % — Gain fiscal renforcé',
      text: 'SCPI française : TDVM 5,5 %, net après IR+PS ~2,5 %. SCPI européenne Allemagne/Pays-Bas : TDVM 4,5 %, net après crédit d\'impôt ~3,5 %. L\'écart de rendement net peut dépasser 1 point. Simulation pédagogique : l\'arbitrage en faveur de l\'Europe est une piste sérieuse à TMI 41 %, sous réserve de vérifier la qualité du patrimoine.',
    },
    {
      title: 'Investisseur sans besoin de revenus — Nue-propriété européenne',
      text: 'Un investisseur sans besoin de revenus immédiats acquiert des parts en nue-propriété d\'une SCPI européenne. Pas de revenus courants, pas de fiscalité immédiate. À terme, la pleine propriété est reconstituée. Simulation pédagogique : la nue-propriété européenne combine les avantages du démembrement et de la diversification géographique.',
    },
    {
      title: 'SCPI européenne concentrée — Risque pays',
      text: 'Une SCPI européenne concentrée sur un seul pays (Espagne) affiche un TOF en baisse et une décote croissante. Le risque pays et la concentration géographique amplifient la vigilance. Simulation pédagogique : la simple étiquette « européenne » ne suffit pas. Vérifier la répartition réelle des actifs.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI intègre les SCPI européennes dans le comparateur avec les mêmes critères que les SCPI françaises : TOF, rendement, capitalisation, endettement, décote et frais. L\'objectif est de faciliter une pré-orientation structurée.',
    'La première étape consiste à identifier les SCPI européennes dans le comparateur et à analyser leur répartition géographique et sectorielle. Une SCPI « européenne » concentrée sur un seul pays offre moins de diversification qu\'une SCPI répartie sur quatre ou cinq pays.',
    'La deuxième étape évalue le rendement net fiscal selon la TMI de l\'investisseur et les pays d\'investissement. MaximusSCPI propose des contenus pédagogiques et des simulateurs pour approfondir cette dimension.',
    'La troisième étape croise le TOF, l\'endettement, les frais et la décote. Une SCPI européenne attractive fiscalement mais avec un TOF faible ou une surcote importante mérite une vigilance renforcée.',
    'La quatrième étape analyse les risques spécifiques : risque pays, risque de change (si hors zone euro), complexité des baux locaux et qualité du gestionnaire sur les marchés cibles.',
    'La pré-orientation MaximusSCPI ne constitue pas une recommandation personnalisée. Un échange avec le Cabinet Eric Bellaiche permet d\'arbitrer les SCPI européennes selon votre fiscalité, votre horizon et votre besoin de revenus.',
  ],
  conclusionParagraphs: [
    'Les SCPI européennes sont un outil de diversification géographique et patrimoniale, pas uniquement un levier fiscal. Elles méritent une place dans l\'analyse, quel que soit le niveau de TMI, à condition de croiser tous les critères : TOF, rendement net, capitalisation, endettement, frais, risques pays et qualité du patrimoine.',
    'Sources et points à vérifier : fiches fiscales des sociétés de gestion, bulletins trimestriels, rapports annuels, conventions fiscales des pays concernés, site ASPIM. Pour la fiscalité : impots.gouv.fr et BOFiP.',
    'Utilisez le comparateur MaximusSCPI pour identifier les SCPI européennes à approfondir, puis validez votre analyse avec un conseiller pour une simulation adaptée à votre situation fiscale et patrimoniale.',
  ],
  faqItems: [
    {
      question: 'Qu\'est-ce qu\'une SCPI européenne ?',
      answer: 'C\'est une SCPI de droit français qui investit principalement dans des actifs immobiliers situés en Europe hors de France. L\'investisseur souscrit en euros via un intermédiaire français et perçoit des revenus liés aux loyers européens.',
    },
    {
      question: 'Les SCPI européennes sont-elles plus avantageuses fiscalement ?',
      answer: 'Potentiellement, selon la TMI et les pays. Les revenus étrangers sont imposés au taux effectif du pays source, avec un crédit d\'impôt en France. Le gain est généralement plus marqué aux TMI 30 % et plus.',
    },
    {
      question: 'Une SCPI européenne est-elle utile avec une TMI à 11 % ?',
      answer: 'Oui, pour la diversification géographique et l\'accès à des marchés immobiliers européens. Le gain fiscal pur est limité à cette TMI, mais la diversification patrimoniale peut justifier une analyse.',
    },
    {
      question: 'Quelle fiscalité pour les revenus de SCPI européennes ?',
      answer: 'Les revenus sont imposés au taux effectif du pays source, puis l\'investisseur bénéficie d\'un crédit d\'impôt en France. La déclaration fiscale est plus complexe que pour une SCPI française.',
    },
    {
      question: 'Quels sont les risques des SCPI européennes ?',
      answer: 'Risque pays, risque de change (hors zone euro), complexité des baux étrangers, fiscalité évolutive, liquidité secondaire parfois limitée, et risques locatifs identiques aux SCPI françaises.',
    },
    {
      question: 'Faut-il privilégier les SCPI européennes ?',
      answer: 'Pas automatiquement. Elles doivent être intégrées dans l\'analyse patrimoniale globale et arbitrées selon la qualité du patrimoine, le TOF, le rendement net, les frais et les risques.',
    },
    {
      question: 'Une SCPI européenne est-elle plus risquée qu\'une SCPI française ?',
      answer: 'Pas nécessairement, mais les risques sont différents : risque pays, risque de change, complexité juridique. La diversification peut réduire certains risques mais en introduit d\'autres.',
    },
    {
      question: 'Quel pays est le plus représenté dans les SCPI européennes ?',
      answer: 'L\'Allemagne est le premier pays d\'investissement des SCPI européennes, suivie des Pays-Bas, de l\'Espagne et de l\'Italie. La répartition varie selon les SCPI.',
    },
    {
      question: 'Peut-on acheter des SCPI européennes en démembrement ?',
      answer: 'Oui, sur certaines SCPI européennes. La fiscalité du démembrement sur revenus étrangers mérite une analyse spécifique avec un conseiller.',
    },
    {
      question: 'Comment déclarer les revenus de SCPI européennes ?',
      answer: 'La société de gestion transmet une fiche fiscale annuelle détaillant les revenus par pays et les crédits d\'impôt correspondants. La déclaration suit des règles spécifiques selon le pays.',
    },
    {
      question: 'Les SCPI européennes sont-elles liquides ?',
      answer: 'Leur liquidité sur le marché secondaire peut être plus limitée que celle des grandes SCPI françaises, en raison d\'une notoriété parfois moindre et d\'un nombre de parts en circulation plus réduit.',
    },
    {
      question: 'Comment MaximusSCPI analyse les SCPI européennes ?',
      answer: 'Les SCPI européennes sont intégrées dans le comparateur avec les mêmes indicateurs que les SCPI françaises, dans une logique de pré-orientation pédagogique.',
    },
  ],
  comparateurCtaLabel: 'Comparer SCPI françaises et européennes',
}
