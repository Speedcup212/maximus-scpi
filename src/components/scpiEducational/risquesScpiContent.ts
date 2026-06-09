import type { ScpiEducationalPageConfig } from './shared'

export const risquesScpiConfig: ScpiEducationalPageConfig = {
  path: '/risques-scpi',
  badge: 'Risques & vigilance — Page pilier',
  h1: 'Risques SCPI : perte en capital, liquidité, fiscalité et points de vigilance',
  heroSubtitle:
    'Une SCPI est un placement immobilier non coté. Elle peut générer des revenus réguliers, mais elle expose aussi l\'investisseur à des risques réels : perte en capital, liquidité limitée, revenus non garantis, baisse du prix de part, endettement, fiscalité, concentration sectorielle ou géographique. Cette page pilier détaille chaque risque pour permettre une analyse éclairée.',
  seoTitle: 'Risques SCPI : perte en capital, liquidité, vacance, fiscalité — Guide complet',
  seoDescription:
    'Guide complet des risques SCPI : perte en capital, revenus non garantis, liquidité limitée, baisse du prix de part, vacance locative, endettement, fiscalité, concentration sectorielle et géographique. Tableau des risques et cas pratiques.',
  shortAnswerTitle: 'Quels sont les risques d\'un investissement en SCPI ?',
  shortAnswer:
    'Les SCPI présentent plusieurs risques qu\'un investisseur doit connaître avant de souscrire. Le risque principal est la perte en capital : la valeur des parts peut baisser et l\'investisseur peut récupérer moins que son investissement initial. Les revenus distribués ne sont pas garantis : ils dépendent du TOF, des loyers perçus et de la politique de distribution. La liquidité est structurellement limitée : la revente des parts peut prendre plusieurs mois, voire être suspendue temporairement. Le prix de part peut être ajusté à la baisse en cas de dégradation du patrimoine, de baisse des expertises ou de retournement du marché immobilier. La fiscalité pèse sur le rendement net. La concentration sectorielle ou géographique amplifie les risques. L\'endettement de la SCPI peut amplifier les difficultés en période de hausse des taux.',
  keyMessage:
    'Une SCPI est un placement immobilier non coté. Elle peut générer des revenus, mais elle expose aussi à une perte en capital, une liquidité limitée et des revenus non garantis.',
  definitionParagraphs: [
    'Le risque de perte en capital est le risque principal : la valeur des parts peut diminuer si le patrimoine immobilier se déprécie, si le marché immobilier recule ou si la société de gestion rencontre des difficultés. L\'investisseur peut récupérer moins que son investissement initial, surtout s\'il doit revendre dans un contexte défavorable.',
    'Les revenus distribués par une SCPI ne sont pas garantis. Ils dépendent du taux d\'occupation financier (TOF), des loyers perçus, des frais de gestion, de l\'endettement et de la politique de distribution. Un rendement passé élevé ne préjuge pas des distributions futures.',
    'La liquidité des SCPI est structurellement limitée. Les parts ne sont pas cotées en Bourse et se revendent via le marché secondaire ou directement auprès de la société de gestion. Le délai de revente peut varier de quelques semaines à plusieurs mois, voire être allongé en période de crise immobilière où les retraits peuvent être suspendus.',
    'Le risque de baisse du prix de part est lié à la dégradation du patrimoine, à la baisse des expertises, à une surcote excessive, à un endettement mal maîtrisé ou à un retournement du marché. Une baisse de prix réduit la valeur de l\'investissement même si les revenus restent stables.',
    'Le risque de vacance locative (baisse du TOF) réduit les loyers perçus et peut impacter les distributions et la valorisation. Il peut être temporaire (travaux, relocation) ou structurel (baisse d\'attractivité d\'un secteur ou d\'une zone).',
    'Le risque de concentration sectorielle ou géographique amplifie l\'impact d\'une crise sur un secteur ou une zone spécifique. Une SCPI concentrée sur les bureaux en région ou sur un seul type de commerce est plus vulnérable qu\'une SCPI diversifiée.',
    'Le risque fiscal existe : la fiscalité des SCPI françaises suit le régime des revenus fonciers (TMI + prélèvements sociaux). Les SCPI européennes ont une fiscalité différente selon les pays. Une modification de la législation fiscale peut impacter le rendement net.',
    'Le risque de gestion est lié à la qualité de la société de gestion : compétence, équipe, transparence, politique d\'investissement, capacité à gérer les cycles immobiliers. Un changement d\'équipe ou de stratégie peut affecter la performance.',
  ],
  tableTitle: 'Risque / Ce que cela signifie / Indicateurs à surveiller / Vigilance',
  tableRows: [
    {
      level: 'Perte en capital',
      advantage: 'La valeur des parts peut baisser si le patrimoine se déprécie, si le marché recule ou si la gestion est défaillante.',
      vigilance: 'Horizon long terme recommandé (8-10 ans minimum). Analyser la valeur de reconstitution, la qualité du patrimoine et l\'endettement.',
    },
    {
      level: 'Revenus non garantis',
      advantage: 'Les distributions dépendent du TOF, des loyers, des frais et de la politique de distribution.',
      vigilance: 'Analyser la régularité des distributions, le TOF sur 3-5 ans, le report à nouveau et l\'endettement.',
    },
    {
      level: 'Liquidité limitée',
      advantage: 'Délai de revente non garanti. Peut varier de quelques semaines à plusieurs mois, voire être suspendu.',
      vigilance: 'Privilégier un horizon long. Surveiller la collecte nette et les délais de retrait publiés par la société de gestion.',
    },
    {
      level: 'Baisse du prix de part',
      advantage: 'Surcote excessive, baisse des expertises, TOF dégradé, endettement ou crise immobilière peuvent entraîner une révision.',
      vigilance: 'Comparer prix de souscription et valeur de reconstitution. Suivre l\'évolution sur plusieurs trimestres.',
    },
    {
      level: 'Vacance locative (TOF bas)',
      advantage: 'Un TOF faible réduit les loyers perçus et peut peser sur les distributions et la valorisation.',
      vigilance: 'Surveiller l\'évolution du TOF sur plusieurs exercices. Distinguer vacance temporaire et structurelle.',
    },
    {
      level: 'Concentration sectorielle',
      advantage: 'Une SCPI concentrée sur un seul secteur (bureaux, commerces) est plus vulnérable aux cycles de ce secteur.',
      vigilance: 'Vérifier la répartition sectorielle dans la note d\'information. Privilégier la diversification.',
    },
    {
      level: 'Concentration géographique',
      advantage: 'Une SCPI concentrée sur une seule zone géographique dépend des conditions économiques et immobilières locales.',
      vigilance: 'Analyser la répartition géographique. Les SCPI européennes offrent une diversification supplémentaire.',
    },
    {
      level: 'Endettement',
      advantage: 'La dette amplifie les performances en période favorable mais augmente le risque en période de taux élevés ou de baisse des loyers.',
      vigilance: 'Analyser le coût moyen, la maturité et la part fixe/variable de la dette. Croiser avec le TOF.',
    },
    {
      level: 'Fiscalité',
      advantage: 'Les SCPI françaises sont imposées comme revenus fonciers. Les SCPI européennes ont une fiscalité spécifique selon les conventions.',
      vigilance: 'Simuler le rendement net selon sa TMI et les PS. Anticiper les évolutions législatives possibles.',
    },
    {
      level: 'Qualité du gestionnaire',
      advantage: 'La compétence et la transparence de la société de gestion influencent directement la performance et la gestion des risques.',
      vigilance: 'Analyser l\'historique, l\'équipe, la politique d\'investissement et la communication de la société de gestion.',
    },
  ],
  tableNote:
    'Ce tableau est une synthèse pédagogique. Chaque risque doit être analysé dans le contexte de la SCPI, du marché et de la situation personnelle de l\'investisseur.',
  criteriaTitle: 'Critères à croiser avec les risques',
  criteriaCards: [
    { title: 'TOF', text: 'Un TOF en baisse est un signal de risque locatif. Analyser l\'évolution sur plusieurs exercices pour distinguer tendance et aléa.' },
    { title: 'Capitalisation', text: 'Une grande capitalisation n\'élimine pas le risque mais peut réduire l\'impact d\'un sinistre isolé sur l\'ensemble du patrimoine.' },
    { title: 'Endettement', text: 'Un endettement élevé amplifie le risque en période de hausse des taux ou de baisse des loyers. Vérifier le coût et la maturité.' },
    { title: 'Décote / surcote', text: 'Une surcote excessive expose au risque de baisse du prix de part si le marché se retourne ou si les expertises baissent.' },
    { title: 'Frais', text: 'Des frais élevés pèsent sur le rendement net sans réduire le risque. En AV, les frais UC s\'ajoutent.' },
    { title: 'Diversification', text: 'La diversification sectorielle, géographique et locative est le principal outil de réduction des risques.' },
    { title: 'Collecte nette', text: 'Une collecte en baisse persistante peut signaler une perte de confiance ou des difficultés de gestion sous-jacentes.' },
    { title: 'Régularité des distributions', text: 'Un historique stable est rassurant mais ne garantit pas l\'avenir. Croiser avec le TOF et le RAN.' },
    { title: 'Horizon', text: 'Un horizon long (10+ ans) permet d\'absorber les cycles immobiliers et de réduire le risque de perte en capital.' },
    { title: 'Société de gestion', text: 'La transparence, l\'ancienneté et la réputation du gestionnaire sont des critères de réduction du risque de gestion.' },
  ],
  commonErrors: [
    'Penser que les SCPI sont sans risque car elles sont immobilières.',
    'Confondre rendement passé et rendement futur garanti.',
    'Investir sans vérifier le TOF, la capitalisation et l\'endettement.',
    'Sous-estimer le risque de liquidité : les SCPI ne se revendent pas comme des actions ou obligations.',
    'Ignorer le risque fiscal, surtout pour les SCPI européennes et l\'IFI.',
    'Ne pas diversifier son portefeuille de SCPI (multi-secteurs, multi-zones).',
    'Investir avec un horizon trop court (< 8 ans) qui expose au risque de sortie en période défavorable.',
    'Choisir une SCPI uniquement sur son rendement passé sans analyser la soutenabilité de la distribution.',
  ],
  practicalCases: [
    {
      title: 'Investisseur attiré uniquement par le rendement',
      text: 'Un investisseur choisit une SCPI affichant 7 % de TDVM sans analyser le TOF (82 %) ni l\'endettement (38 %). Après deux ans, le TOF continue de baisser, les distributions sont réduites de 30 %. Simulation pédagogique : le rendement passé ne garantit pas le rendement futur et peut masquer des risques importants.',
    },
    {
      title: 'Investisseur qui veut récupérer son capital rapidement',
      text: 'Un investisseur place 50 000 € en SCPI en prévoyant de récupérer son capital sous 6 mois pour un projet immobilier. La SCPI à capital variable affiche un délai de retrait de 4 mois. Au moment de la demande, le délai passe à 8 mois en raison d\'une collecte nette négative. Simulation pédagogique : la liquidité doit être anticipée avant l\'investissement.',
    },
    {
      title: 'SCPI avec prix de part en baisse',
      text: 'Une SCPI de bureaux a réduit son prix de souscription de 10 % après une baisse des valeurs d\'expertise liée à la hausse des taux. Les associés de long terme voient la valeur de leur investissement baisser, mais les distributions restent stables. Simulation pédagogique : la baisse du prix de part n\'entraîne pas automatiquement une baisse des revenus.',
    },
    {
      title: 'SCPI avec TOF en baisse durable',
      text: 'Une SCPI diversifiée voit son TOF passer de 96 % à 84 % sur 18 mois après le départ de plusieurs locataires. Les distributions sont maintenues grâce au report à nouveau, mais la tendance est inquiétante. Simulation pédagogique : le RAN retarde l\'impact mais ne le supprime pas.',
    },
    {
      title: 'SCPI fortement exposée à un secteur en tension',
      text: 'Une SCPI concentrée à 60 % sur les commerces de centre-ville subit la baisse de fréquentation et la vacance locative. Le TOF passe sous 80 %. Le prix de part est ajusté à la baisse. Simulation pédagogique : la concentration sectorielle amplifie le risque.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI aborde les risques de manière transparente dans chaque contenu pédagogique. Le comparateur affiche les indicateurs clés — TOF, capitalisation, endettement, décote/surcote, frais — pour permettre une pré-orientation qui intègre les risques.',
    'La première étape consiste à identifier les risques intrinsèques de chaque SCPI : analyse du TOF, de l\'endettement, de la surcote, de la concentration sectorielle et géographique.',
    'La deuxième étape évalue la compatibilité avec le profil de l\'investisseur : horizon, besoin de liquidité, tolérance au risque, TMI, objectifs patrimoniaux.',
    'La troisième étape vérifie la diversification : plusieurs SCPI, plusieurs secteurs, plusieurs zones géographiques, voire plusieurs modes de détention (direct, AV, démembrement).',
    'La quatrième étape intègre la fiscalité et l\'IFI si le patrimoine global le justifie.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. L\'analyse des risques doit être approfondie avec un conseiller en investissements financiers.',
  ],
  conclusionParagraphs: [
    'Les risques des SCPI sont réels mais peuvent être anticipés et gérés par une analyse rigoureuse, une diversification patrimoniale et un horizon d\'investissement adapté. Une SCPI bien choisie, diversifiée et détenue sur le long terme reste un placement crédible dans une allocation patrimoniale équilibrée.',
    'Sources et points à vérifier : DIC, note d\'information, rapport annuel, bulletin trimestriel, documents des sociétés de gestion, site ASPIM. Pour les aspects fiscaux : impots.gouv.fr.',
    'Utilisez le comparateur MaximusSCPI pour identifier les indicateurs de risque de chaque SCPI, puis validez votre analyse avec le Cabinet Eric Bellaiche pour une approche personnalisée.',
  ],
  faqItems: [
    {
      question: 'Quels sont les principaux risques des SCPI ?',
      answer: 'Perte en capital, revenus non garantis, liquidité limitée, baisse du prix de part, vacance locative, concentration sectorielle et géographique, endettement, fiscalité, qualité du gestionnaire.',
    },
    {
      question: 'Peut-on perdre de l\'argent avec une SCPI ?',
      answer: 'Oui. La valeur des parts peut baisser et l\'investisseur peut récupérer moins que son investissement initial. Les revenus ne sont pas garantis et peuvent baisser ou être suspendus.',
    },
    {
      question: 'Les revenus d\'une SCPI sont-ils garantis ?',
      answer: 'Non. Les distributions dépendent des loyers perçus, du TOF, des frais de gestion et de la politique de distribution. Aucun rendement n\'est garanti, passé ou futur.',
    },
    {
      question: 'Peut-on revendre facilement ses parts de SCPI ?',
      answer: 'Non. La liquidité est limitée. Le délai de revente peut varier de quelques semaines à plusieurs mois, voire être suspendu en période de crise immobilière.',
    },
    {
      question: 'Que se passe-t-il si le prix de part baisse ?',
      answer: 'La valeur de l\'investissement diminue. Si l\'investisseur vend pendant une baisse, il subit une perte en capital. Un horizon long permet d\'attendre une éventuelle revalorisation, sans garantie.',
    },
    {
      question: 'La fiscalité est-elle un risque en SCPI ?',
      answer: 'Oui. La fiscalité des SCPI suit les règles des revenus fonciers (TMI + PS). Une hausse des prélèvements sociaux ou une modification du barème de l\'IR peut réduire le rendement net.',
    },
    {
      question: 'Comment réduire les risques SCPI ?',
      answer: 'Diversifier ses SCPI (plusieurs secteurs, plusieurs zones), choisir un horizon long (> 10 ans), analyser le TOF, l\'endettement et la surcote, et consulter un conseiller.',
    },
    {
      question: 'Quel est l\'impact de l\'endettement sur le risque ?',
      answer: 'L\'endettement amplifie les performances en période favorable mais augmente le risque en période de hausse des taux ou de baisse des loyers.',
    },
    {
      question: 'Qu\'est-ce que le risque de société de gestion ?',
      answer: 'La compétence, la transparence et la stratégie de la société de gestion influencent la performance de la SCPI. Un changement d\'équipe ou de stratégie peut affecter la qualité du véhicule.',
    },
    {
      question: 'Les SCPI européennes présentent-elles des risques spécifiques ?',
      answer: 'Oui : risque pays, risque de change (hors zone euro), complexité fiscale, différence de droit immobilier et liquidité parfois plus limitée que les SCPI françaises.',
    },
    {
      question: 'Faut-il investir en SCPI avec un horizon court ?',
      answer: 'L\'horizon recommandé est de 8 à 10 ans minimum. Un horizon plus court expose au risque de devoir vendre pendant une baisse du marché ou avec un délai de revente allongé.',
    },
    {
      question: 'Comment MaximusSCPI analyse les risques ?',
      answer: 'Le comparateur et les contenus pédagogiques présentent les indicateurs de risque de chaque SCPI. L\'approche est pédagogique et ne constitue pas une recommandation personnalisée.',
    },
  ],
  comparateurCtaLabel: 'Vérifier si les risques SCPI sont cohérents avec votre horizon',
}
