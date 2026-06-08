import type { ScpiEducationalPageConfig } from './shared'

export const risquesScpiConfig: ScpiEducationalPageConfig = {
  path: '/risques-scpi',
  badge: 'Risques & vigilance',
  h1: 'Risques SCPI : liquidité, revenus, prix de part et fiscalité',
  heroSubtitle:
    'Une SCPI est un placement immobilier de long terme. Elle peut générer des revenus réguliers, mais elle expose aussi l\'investisseur à des risques réels : perte en capital, liquidité limitée, revenus non garantis, baisse du prix de part, endettement, fiscalité et concentration sectorielle ou géographique.',
  seoTitle: 'Risques SCPI : comprendre les risques avant d\'investir',
  seoDescription:
    'Comprenez les principaux risques des SCPI : perte en capital, liquidité limitée, revenus non garantis, baisse du prix de part, fiscalité, endettement et risque immobilier.',
  shortAnswerTitle: 'Pourquoi faut-il connaître les risques des SCPI ?',
  shortAnswer:
    'Tout investissement comporte des risques. Les SCPI ne font pas exception : perte en capital possible, revenus non garantis, liquidité limitée, baisse du prix de part, dépendance au gestionnaire, risque sectoriel, risque géographique, endettement et fiscalité. Connaître ces risques permet de les anticiper, de les réduire par la diversification et de choisir une SCPI cohérente avec son horizon et sa tolérance au risque.',
  keyMessage:
    'Une SCPI est un placement immobilier de long terme. Elle peut générer des revenus, mais elle expose aussi l\'investisseur à une perte en capital, une liquidité limitée et des revenus non garantis.',
  definitionParagraphs: [
    'Le risque de perte en capital est le risque principal : la valeur des parts peut diminuer si le patrimoine immobilier se déprécie, si le marché immobilier recule ou si la société de gestion rencontre des difficultés. L\'investisseur peut récupérer moins que son investissement initial.',
    'Les revenus distribués par une SCPI ne sont pas garantis. Ils dépendent du taux d\'occupation financier (TOF), des loyers perçus, des frais de gestion, de l\'endettement et de la politique de distribution de la société de gestion. Un rendement passé élevé ne préjuge pas des distributions futures.',
    'La liquidité des SCPI est structurellement limitée. Les parts ne sont pas cotées en Bourse et se revendent via le marché secondaire ou directement auprès de la société de gestion. Le délai de revente peut varier de quelques semaines à plusieurs mois, voire être allongé en période de crise.',
    'Le prix de souscription d\'une SCPI peut baisser. Une surcote excessive, une baisse des valeurs d\'expertise, une dégradation du TOF, un endettement mal maîtrisé ou un contexte de marché défavorable peuvent entraîner une révision à la baisse du prix de part.',
    'Le risque fiscal existe : la fiscalité des SCPI françaises suit le régime des revenus fonciers (TMI + prélèvements sociaux). Les SCPI européennes ont une fiscalité différente selon les pays. Une modification de la législation fiscale peut impacter le rendement net.',
    'Le risque de gestion est lié à la qualité de la société de gestion : sa compétence, son équipe, sa transparence, sa politique d\'investissement et sa capacité à gérer les cycles immobiliers. Un changement d\'équipe ou de stratégie peut affecter la performance.',
    'La diversification — par le nombre d\'actifs, le nombre de locataires, les secteurs et les zones géographiques — est le principal outil de réduction des risques. Une SCPI concentrée sur un seul secteur ou une seule zone est plus vulnérable qu\'une SCPI diversifiée.',
  ],
  tableTitle: 'Risques SCPI : ce qu\'il faut savoir',
  tableRows: [
    {
      level: 'Perte en capital',
      advantage:
        'La valeur des parts peut baisser si le patrimoine se déprécie ou si le marché immobilier recule.',
      vigilance:
        'Horizon long terme recommandé (8-10 ans minimum). Analyser la valeur de reconstitution et son évolution.',
    },
    {
      level: 'Revenus non garantis',
      advantage:
        'Les distributions dépendent du TOF, des loyers et de la politique de distribution. Aucune garantie.',
      vigilance:
        'Analyser la régularité des distributions, le TOF, le report à nouveau et l\'endettement.',
    },
    {
      level: 'Liquidité limitée',
      advantage:
        'Délai de revente non garanti. Peut varier de quelques semaines à plusieurs mois.',
      vigilance:
        'Privilégier un horizon long. Surveiller la collecte nette et les délais de retrait publiés.',
    },
    {
      level: 'Baisse du prix de part',
      advantage:
        'Surcote excessive, baisse des expertises, TOF dégradé ou crise immobilière peuvent entraîner une révision.',
      vigilance:
        'Comparer prix de souscription et valeur de reconstitution. Suivre l\'évolution trimestrielle.',
    },
    {
      level: 'Fiscalité',
      advantage:
        'Les SCPI françaises sont imposées comme revenus fonciers. Les SCPI européennes ont une fiscalité spécifique.',
      vigilance:
        'Simuler le rendement net selon sa TMI. Anticiper les évolutions législatives possibles.',
    },
    {
      level: 'Endettement',
      advantage:
        'La dette amplifie les performances en période favorable mais augmente le risque en période de taux élevés.',
      vigilance:
        'Analyser le coût moyen, la maturité et la part fixe/variable de la dette.',
    },
    {
      level: 'Vacance locative',
      advantage:
        'Un TOF faible réduit les loyers perçus et peut peser sur les distributions et la valorisation.',
      vigilance:
        'Surveiller l\'évolution du TOF sur plusieurs trimestres et les causes de la vacance.',
    },
    {
      level: 'Concentration',
      advantage:
        'Peu d\'actifs, peu de locataires, un seul secteur ou une seule zone = risque accru.',
      vigilance:
        'Vérifier le nombre d\'actifs, la diversification géographique et sectorielle dans les documents.',
    },
  ],
  tableNote:
    'Ce tableau est une synthèse pédagogique. Chaque risque doit être analysé dans le contexte de la SCPI, du marché et de la situation personnelle de l\'investisseur.',
  criteriaTitle: 'Critères à croiser avec les risques',
  criteriaCards: [
    { title: 'TOF', text: 'Un TOF en baisse est un signal de risque locatif. Analyser l\'évolution sur plusieurs exercices.' },
    { title: 'Capitalisation', text: 'Une grande capitalisation n\'élimine pas le risque mais peut réduire l\'impact d\'un sinistre isolé.' },
    { title: 'Endettement', text: 'Un endettement élevé amplifie le risque en période de hausse des taux ou de baisse des loyers.' },
    { title: 'Décote / surcote', text: 'Une surcote excessive expose au risque de baisse du prix de part si le marché se retourne.' },
    { title: 'Frais', text: 'Des frais élevés pèsent sur le rendement net sans réduire le risque.' },
    { title: 'Diversification', text: 'La diversification sectorielle, géographique et locative est le principal outil de réduction des risques.' },
    { title: 'Collecte nette', text: 'Une collecte en baisse persistante peut signaler une perte de confiance ou des difficultés de gestion.' },
    { title: 'Régularité des distributions', text: 'Un historique de distributions stables est rassurant mais ne garantit pas l\'avenir.' },
  ],
  commonErrors: [
    'Penser que les SCPI sont sans risque car elles sont immobilières.',
    'Confondre rendement passé et rendement futur garanti.',
    'Investir sans vérifier le TOF, la capitalisation et l\'endettement.',
    'Sous-estimer le risque de liquidité et le délai de revente.',
    'Ignorer le risque fiscal, surtout pour les SCPI européennes.',
    'Ne pas diversifier son portefeuille de SCPI.',
  ],
  practicalCases: [
    {
      title: 'SCPI A — rendement attractif, TOF en baisse',
      text: 'Une SCPI affiche un TDVM de 6 % mais son TOF est passé de 96 % à 88 % en 18 mois. Le rendement passé attire, mais la baisse d\'occupation peut signaler des difficultés locatives. Simulation pédagogique : analyser le TOF avant le rendement.',
    },
    {
      title: 'SCPI B — très capitalisée, prix de part ajusté',
      text: 'Une grande SCPI de bureaux a réduit son prix de souscription de 8 % après une baisse des valeurs d\'expertise liée à la hausse des taux. L\'investisseur de long terme a vu la valeur de son investissement baisser temporairement.',
    },
    {
      title: 'SCPI C — besoin urgent de liquidité',
      text: 'Un investisseur doit récupérer son capital rapidement pour un imprévu personnel. Sa SCPI à capital variable affiche un délai de retrait de 6 mois. Simulation pédagogique : anticiper le besoin de liquidité avant d\'investir en SCPI.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI aborde les risques de manière transparente dans chaque contenu pédagogique. Le comparateur affiche les indicateurs clés — TOF, capitalisation, endettement, décote/surcote, frais — pour permettre une pré-orientation qui intègre les risques.',
    'La première étape de la méthode MaximusSCPI consiste à identifier les risques intrinsèques de chaque SCPI : analyse du TOF, de l\'endettement, de la surcote et de la concentration.',
    'La deuxième étape évalue la compatibilité avec le profil de l\'investisseur : horizon, besoin de liquidité, tolérance au risque, TMI.',
    'La troisième étape recommande la diversification : plusieurs SCPI, plusieurs secteurs, plusieurs zones géographiques.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. L\'analyse des risques doit être approfondie avec un conseiller en investissements financiers.',
  ],
  conclusionParagraphs: [
    'Les risques des SCPI sont réels mais peuvent être anticipés et gérés par une analyse rigoureuse, une diversification patrimoniale et un horizon d\'investissement adapté.',
    'Utilisez le comparateur MaximusSCPI pour identifier les indicateurs de risque de chaque SCPI, puis validez votre analyse avec le Cabinet Eric Bellaiche pour une approche personnalisée.',
  ],
  faqItems: [
    {
      question: 'Quels sont les principaux risques des SCPI ?',
      answer: 'Perte en capital, revenus non garantis, liquidité limitée, baisse du prix de part, endettement, fiscalité, vacance locative, concentration sectorielle ou géographique, qualité du gestionnaire.',
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
      question: 'Peut-on revendre facilement ses parts ?',
      answer: 'Non. La liquidité des SCPI est limitée. Le délai de revente varie de quelques semaines à plusieurs mois selon le type de SCPI, la collecte et les conditions de marché.',
    },
    {
      question: 'Que se passe-t-il si le prix de part baisse ?',
      answer: 'La valeur de l\'investissement diminue. Si l\'investisseur vend pendant une baisse, il subit une perte en capital. Un horizon long permet d\'attendre une éventuelle revalorisation, sans garantie.',
    },
    {
      question: 'La fiscalité est-elle un risque ?',
      answer: 'Oui. La fiscalité des SCPI suit les règles des revenus fonciers. Une hausse des prélèvements sociaux ou une modification du barème de l\'IR peut réduire le rendement net perçu par l\'investisseur.',
    },
    {
      question: 'Comment réduire les risques SCPI ?',
      answer: 'Diversifier ses SCPI (nombre d\'actifs, secteurs, zones), choisir un horizon long, analyser le TOF et l\'endettement, comparer prix et valeur de reconstitution, et consulter un conseiller.',
    },
    {
      question: 'Comment MaximusSCPI analyse les risques ?',
      answer: 'Le comparateur et les contenus pédagogiques présentent les indicateurs de risque de chaque SCPI. MaximusSCPI encourage une analyse rigoureuse sans constituer une recommandation personnalisée.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI selon leurs indicateurs de risque',
}
