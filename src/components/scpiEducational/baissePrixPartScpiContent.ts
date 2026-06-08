import type { ScpiEducationalPageConfig } from './shared'

export const baissePrixPartScpiConfig: ScpiEducationalPageConfig = {
  path: '/baisse-prix-part-scpi',
  badge: 'Risque & valorisation',
  h1: 'Baisse du prix de part SCPI : comprendre les causes et les conséquences',
  heroSubtitle:
    'Une baisse du prix de part n\'est pas un accident impossible en SCPI. Elle peut provenir d\'une dégradation du marché immobilier, d\'une surcote excessive, d\'une baisse des valeurs d\'expertise, d\'un TOF dégradé ou d\'un endettement mal maîtrisé. L\'investisseur doit comprendre ces mécanismes pour analyser sereinement.',
  seoTitle: 'Baisse prix de part SCPI : causes, risques et analyse',
  seoDescription:
    'Comprenez pourquoi une SCPI peut baisser son prix de part : valeur du patrimoine, marché immobilier, taux, expertises, décote, surcote et conséquences pour l\'investisseur.',
  shortAnswerTitle: 'Pourquoi le prix de part d\'une SCPI peut-il baisser ?',
  shortAnswer:
    'Le prix de part d\'une SCPI n\'est pas fixe. Il peut être ajusté à la baisse par la société de gestion si la valeur du patrimoine immobilier diminue, si les expertises baissent, si le TOF se dégrade, si l\'endettement pèse ou si le marché immobilier se retourne. Une surcote excessive par rapport à la valeur de reconstitution est souvent un signal précurseur. L\'investisseur doit suivre ces indicateurs et adapter son horizon.',
  keyMessage:
    'Une baisse du prix de part rappelle que la SCPI n\'est pas un support garanti. Le prix doit être analysé avec la valeur de reconstitution, la qualité du patrimoine, le TOF, l\'endettement et la stratégie de gestion.',
  definitionParagraphs: [
    'Le prix de souscription est le prix auquel un investisseur achète une part de SCPI. Il intègre la valeur de reconstitution du patrimoine et les frais de souscription. Il peut être modifié par la société de gestion, généralement une fois par an ou en cas d\'événement patrimonial significatif.',
    'La valeur de reconstitution est la référence patrimoniale : elle estime le coût de reconstruction du patrimoine immobilier. Quand le prix de souscription s\'éloigne de cette valeur (surcote), le risque de baisse augmente à terme.',
    'Les expertises immobilières réalisées périodiquement par des experts indépendants peuvent conduire à une révision à la baisse de la valeur des actifs si le marché locatif se dégrade, si les loyers baissent ou si les taux de capitalisation immobiliers augmentent.',
    'Une baisse du TOF (taux d\'occupation financier) réduit les revenus locatifs et peut impacter la valorisation du patrimoine. Si elle est durable, elle peut justifier une baisse du prix de part.',
    'La hausse des taux d\'intérêt peut entraîner une baisse des valeurs immobilières : les investisseurs exigent un rendement plus élevé pour compenser le coût du crédit, ce qui mécaniquement réduit la valorisation des actifs.',
    'L\'endettement peut amplifier le mouvement : une SCPI endettée avec des actifs dont la valeur baisse voit son ratio prêt/valeur se dégrader, ce qui peut peser sur la notation financière et le prix de part.',
  ],
  tableTitle: 'Causes de baisse du prix de part : ce qu\'il faut surveiller',
  tableRows: [
    {
      level: 'Surcote élevée',
      advantage:
        'Un écart important entre prix de souscription et valeur de reconstitution peut signaler un risque de correction.',
      vigilance:
        'Comparer régulièrement le prix de souscription à la VR. Suivre l\'évolution de l\'écart sur plusieurs trimestres.',
    },
    {
      level: 'Baisse des expertises',
      advantage:
        'Les expertises périodiques peuvent réévaluer le patrimoine à la baisse si les conditions de marché se dégradent.',
      vigilance:
        'Consulter les rapports annuels et les bulletins trimestriels pour suivre l\'évolution des valeurs d\'expertise.',
    },
    {
      level: 'Baisse du TOF',
      advantage:
        'Un TOF en baisse durable réduit les loyers et peut impacter la valorisation du patrimoine.',
      vigilance:
        'Analyser les causes de la baisse (vacance, travaux, repositionnement) et la durée estimée.',
    },
    {
      level: 'Endettement sous pression',
      advantage:
        'Une dette élevée combinée à une baisse des valeurs d\'actifs dégrade le ratio prêt/valeur.',
      vigilance:
        'Vérifier le coût moyen de la dette, sa maturité et la part à taux variable.',
    },
    {
      level: 'Hausse des taux immobiliers',
      advantage:
        'La hausse des taux de capitalisation réduit mécaniquement la valorisation des actifs immobiliers.',
      vigilance:
        'Suivre l\'évolution des taux de rendement immobiliers dans les secteurs de la SCPI.',
    },
    {
      level: 'Collecte en baisse',
      advantage:
        'Une collecte nette négative peut signaler une perte de confiance et peser sur le prix.',
      vigilance:
        'Surveiller le rapport collecte/capitalisation. Une collecte négative persistante est un signal.',
    },
  ],
  tableNote:
    'Ces causes peuvent se cumuler. Une baisse de prix de part n\'est pas automatiquement synonyme de mauvaise SCPI, mais elle mérite une analyse approfondie des raisons.',
  criteriaTitle: 'Critères à croiser avec le prix de part',
  criteriaCards: [
    { title: 'Valeur de reconstitution', text: 'Comparer le prix de souscription à la VR pour évaluer la surcote ou décote. Suivre l\'évolution trimestrielle.' },
    { title: 'TOF', text: 'Un TOF en baisse durable peut précéder une baisse de prix. Analyser l\'évolution sur plusieurs exercices.' },
    { title: 'Endettement', text: 'Un endettement élevé amplifie le risque de baisse en cas de retournement du marché immobilier.' },
    { title: 'Expertises', text: 'Les expertises périodiques sont le principal déclencheur d\'une révision de prix. Les consulter dans les rapports annuels.' },
    { title: 'Collecte nette', text: 'Une collecte positive soutient le prix ; une collecte négative peut l\'affaiblir.' },
    { title: 'Secteur immobilier', text: 'Les secteurs en tension (bureaux secondaires, commerces fragiles) sont plus exposés au risque de baisse.' },
    { title: 'Historique de prix', text: 'Une SCPI qui n\'a jamais baissé son prix n\'est pas immunisée. L\'historique sur 10-15 ans est plus parlant.' },
  ],
  commonErrors: [
    'Considérer qu\'une SCPI qui n\'a jamais baissé son prix est sans risque.',
    'Acheter une SCPI sans vérifier l\'écart avec la valeur de reconstitution.',
    'Paniquer et vendre après une baisse sans analyser les causes.',
    'Ignorer les expertises immobilières et leur impact sur le prix.',
    'Confondre stabilité passée et garantie future du prix.',
    'Ne pas diversifier pour réduire l\'impact d\'une baisse isolée.',
  ],
  practicalCases: [
    {
      title: 'SCPI en surcote — ajustement à la baisse',
      text: 'Une SCPI de commerces affichait une surcote de 12 % par rapport à sa VR. Après une baisse des valeurs d\'expertise liée au marché du retail, le prix de souscription a été réduit de 8 %. Les associés de long terme ont vu leur investissement temporairement baisser.',
    },
    {
      title: 'SCPI bureaux — hausse des taux, baisse des valeurs',
      text: 'La hausse des taux d\'intérêt a entraîné une baisse des valeurs d\'expertise dans le secteur des bureaux en région. Le prix de part d\'une SCPI spécialisée a été ajusté à la baisse de 5 %. Le TOF reste élevé.',
    },
    {
      title: 'SCPI diversifiée — baisse limitée, résilience',
      text: 'Malgré un contexte immobilier difficile, une SCPI diversifiée (logistique, santé, bureaux prime) a limité la baisse de son prix de part à 2 %. La diversification sectorielle a joué son rôle.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI suit le prix de part et l\'écart avec la valeur de reconstitution dans son comparateur, comme indicateur de lecture patrimoniale.',
    'La première étape consiste à comparer le prix de souscription à la VR et à suivre l\'évolution de cet écart sur plusieurs trimestres.',
    'La deuxième étape analyse les causes potentielles de baisse : évolution du TOF, de l\'endettement, du secteur immobilier et du contexte macroéconomique.',
    'La troisième étape intègre l\'horizon : une baisse temporaire peut être absorbée sur un horizon long, mais une baisse durable mérite une réévaluation.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. Un échange avec le Cabinet Eric Bellaiche permet d\'analyser l\'évolution du prix dans votre situation.',
  ],
  conclusionParagraphs: [
    'Le prix de part d\'une SCPI peut baisser. C\'est un risque à connaître, à anticiper et à gérer par une analyse régulière du TOF, de la VR, de l\'endettement et du contexte immobilier.',
    'Utilisez le comparateur MaximusSCPI pour suivre les indicateurs de prix, puis validez votre analyse avec un conseiller pour une approche adaptée à votre horizon.',
  ],
  faqItems: [
    {
      question: 'Pourquoi une SCPI baisse-t-elle son prix de part ?',
      answer: 'Baisse des valeurs d\'expertise, dégradation du TOF, surcote excessive, hausse des taux, endettement sous pression, collecte négative ou retournement du marché immobilier.',
    },
    {
      question: 'Une baisse du prix de part signifie-t-elle que la SCPI est mauvaise ?',
      answer: 'Pas nécessairement. Elle peut refléter un contexte de marché défavorable. L\'analyse des causes est essentielle avant de conclure.',
    },
    {
      question: 'Quelle différence entre prix de part et rendement ?',
      answer: 'Le prix de part reflète la valorisation du patrimoine. Le rendement (TDVM) mesure les distributions par rapport au prix. Les deux peuvent évoluer indépendamment.',
    },
    {
      question: 'Peut-on anticiper une baisse de prix ?',
      answer: 'Surveiller la surcote, les expertises, l\'évolution du TOF, l\'endettement et le secteur immobilier permet d\'identifier des signaux, sans garantie de prédiction.',
    },
    {
      question: 'Quel rôle joue la valeur de reconstitution ?',
      answer: 'La VR est la référence patrimoniale. Un écart important et durable entre prix de souscription et VR est un signal de risque de correction.',
    },
    {
      question: 'Faut-il vendre après une baisse ?',
      answer: 'Cela dépend des causes de la baisse et de l\'horizon de l\'investisseur. Une vente précipitée peut transformer une baisse temporaire en perte définitive.',
    },
    {
      question: 'Comment analyser une SCPI qui a baissé son prix ?',
      answer: 'Analyser les causes (TOF, expertises, endettement, secteur), vérifier la réaction de la société de gestion, et recouper avec la tendance du marché.',
    },
    {
      question: 'Comment MaximusSCPI suit le prix de part ?',
      answer: 'Le comparateur affiche le prix de souscription et la VR. Les contenus pédagogiques aident à interpréter les écarts. MaximusSCPI ne constitue pas une recommandation.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI selon leur prix de part',
}
