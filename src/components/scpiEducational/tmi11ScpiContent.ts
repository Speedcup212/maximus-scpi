import type { ScpiEducationalPageConfig } from './shared'

export const tmi11ScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-tmi-11',
  badge: 'Fiscalité & profil',
  h1: 'SCPI avec TMI 11 % : quels critères analyser avant d\'investir ?',
  heroSubtitle:
    'Avec une tranche marginale d\'imposition à 11 %, l\'enjeu fiscal n\'est pas aussi fort qu\'à TMI 30 % ou 41 %, mais il ne doit pas être négligé. Les prélèvements sociaux (taux en vigueur) s\'appliquent quoi qu\'il en soit. Le rendement net après impôt reste généralement compétitif, et la diversification, les SCPI européennes et l\'assurance-vie peuvent être explorées sans se limiter à l\'optimisation fiscale.',
  seoTitle: 'SCPI TMI 11 % : fiscalité, rendement net, SCPI européennes et options',
  seoDescription:
    'Analyse complète des SCPI avec une tranche marginale d\'imposition à 11 % : fiscalité, rendement net après IR et PS, SCPI européennes, assurance-vie, démembrement, crédit. Tableau comparatif, exemples chiffrés et cas pratiques.',
  shortAnswerTitle: 'Les SCPI sont-elles intéressantes avec une TMI à 11 % ?',
  shortAnswer:
    'Oui. Une TMI à 11 % ne rend pas les SCPI inintéressantes : le rendement net après impôt (TMI + prélèvements sociaux) reste compétitif par rapport à d\'autres placements. L\'analyse doit porter sur le rendement net plutôt que sur le TDVM brut, intégrer les prélèvements sociaux qui s\'appliquent sur les revenus fonciers (taux en vigueur, à vérifier au moment de l\'imposition), et considérer la diversification géographique et sectorielle comme critères complémentaires. Les SCPI européennes peuvent présenter un intérêt même à TMI 11 %, non pour l\'optimisation fiscale maximale, mais pour la diversification et l\'accès à d\'autres marchés immobiliers.',
  keyMessage:
    'Une TMI faible ne dispense pas d\'analyser le rendement net, les prélèvements sociaux, les frais et la qualité de la SCPI.',
  definitionParagraphs: [
    'La tranche marginale d\'imposition (TMI) est le taux auquel sont imposés les derniers euros de revenus du foyer fiscal. En France, la TMI à 11 % concerne les revenus compris entre environ 11 000 € et 28 000 € par part fiscale (seuils indicatifs susceptibles d\'être revalorisés chaque année).',
    'Les revenus des SCPI françaises détenues en direct sont imposés comme des revenus fonciers : ils s\'ajoutent au revenu global du foyer et sont soumis au barème progressif de l\'impôt sur le revenu, plus les prélèvements sociaux au taux en vigueur. Pour une TMI à 11 %, le taux marginal total est d\'environ 28,2 % (11 % + taux PS applicable).',
    'Le rendement net après impôt pour un investisseur en TMI 11 % reste généralement compétitif par rapport à des placements monétaires ou obligataires, surtout si la SCPI bénéficie d\'un bon TOF, d\'une capitalisation solide et d\'une régularité de distributions.',
    'Les SCPI européennes peuvent présenter un intérêt même à TMI 11 %, non pas pour l\'optimisation fiscale maximale (qui bénéficie davantage aux TMI 30 % et plus), mais pour la diversification géographique, la fiscalité nette potentiellement légèrement plus favorable selon les pays d\'investissement, et l\'accès à des marchés immobiliers européens dynamiques comme l\'Allemagne ou les Pays-Bas.',
    'Le démembrement en nue-propriété est moins pertinent à TMI 11 % si l\'investisseur a besoin de revenus immédiats, car il ne perçoit rien pendant la période. En revanche, si l\'investisseur n\'a pas besoin de revenus, le démembrement conserve son intérêt patrimonial (décote, absence de fiscalité) indépendamment du niveau de TMI.',
    'L\'assurance-vie reste une option à considérer, notamment pour l\'horizon de détention, la fiscalité différée et l\'éventuel objectif de transmission. À TMI 11 %, l\'avantage fiscal pur de l\'assurance-vie est moins marqué qu\'à TMI 30 % ou 41 %, mais le cadre patrimonial global peut justifier le choix.',
    'Les frais de souscription et le délai de jouissance pèsent proportionnellement sur le rendement net quel que soit le niveau de TMI. L\'analyse doit intégrer ces coûts dans l\'estimation du rendement réellement perçu.',
  ],
  tableTitle: 'Option / Intérêt possible avec TMI 11 % / Vigilance',
  tableRows: [
    {
      level: 'SCPI françaises en direct',
      advantage:
        'Simplicité, choix large. Rendement net après IR (11 %) + PS compétitif par rapport à d\'autres placements.',
      vigilance:
        'Ne pas négliger les prélèvements sociaux (taux en vigueur). Comparer avec d\'autres enveloppes selon horizon.',
    },
    {
      level: 'SCPI européennes',
      advantage:
        'Diversification géographique. Fiscalité nette potentiellement légèrement plus favorable selon pays. Intérêt patrimonial.',
      vigilance:
        'Le gain fiscal pur est moindre qu\'à TMI 30 %, mais la diversification reste un critère pertinent. Déclarations spécifiques.',
    },
    {
      level: 'SCPI en assurance-vie',
      advantage:
        'Capitalisation sans imposition immédiate. Cadre successoral. Horizon long.',
      vigilance:
        'À TMI 11 %, l\'avantage fiscal est moins marqué. Comparer le rendement net avec le direct selon les frais UC.',
    },
    {
      level: 'SCPI en démembrement',
      advantage:
        'Intérêt patrimonial si absence de besoin de revenus. Prix d\'entrée décoté. Pas de fiscalité pendant la période.',
      vigilance:
        'Pertinent uniquement si l\'investisseur n\'a pas besoin de revenus immédiats. À TMI 11 %, l\'économie fiscale est moindre qu\'à TMI plus élevée.',
    },
    {
      level: 'SCPI à crédit',
      advantage:
        'Effet de levier potentiel. Intérêts d\'emprunt déductibles des revenus fonciers sous conditions.',
      vigilance:
        'Le coût du crédit et le risque de taux doivent être compatibles avec le rendement de la SCPI. Endettement personnel à intégrer.',
    },
  ],
  tableNote:
    'Ces repères sont indicatifs. La situation personnelle (horizon, besoin de revenus, objectifs) prime sur l\'optimisation fiscale seule.',
  criteriaTitle: 'Critères à croiser avec une TMI à 11 %',
  criteriaCards: [
    { title: 'Rendement net fiscal', text: 'Le TDVM brut doit être retraité de la TMI (11 %) et des prélèvements sociaux. Le rendement net est le chiffre pertinent pour comparer les options.' },
    { title: 'TOF', text: 'Un TOF élevé garantit une meilleure régularité des distributions, quel que soit le niveau de TMI de l\'investisseur.' },
    { title: 'Capitalisation', text: 'La taille de la SCPI et sa diversification sectorielle et géographique sont des critères de résilience importants.' },
    { title: 'Frais', text: 'Des frais de souscription élevés pèsent sur le rendement net, surtout si l\'horizon est court. Les amortir sur la durée est essentiel.' },
    { title: 'SCPI européennes', text: 'À TMI 11 %, l\'intérêt des SCPI européennes repose sur la diversification et la fiscalité nette, pas sur l\'optimisation pure.' },
    { title: 'Endettement', text: 'Une SCPI endettée peut réduire les distributions, ce qui impacte le rendement net après impôt.' },
    { title: 'Horizon', text: 'Plus l\'horizon est long, plus l\'impact des frais d\'entrée s\'amortit et plus la capitalisation des revenus a d\'effet.' },
    { title: 'Prélèvements sociaux', text: 'Ils s\'appliquent sur les revenus fonciers quel que soit le niveau de TMI. À intégrer impérativement dans le calcul.' },
  ],
  commonErrors: [
    'Penser que les SCPI sont réservées aux contribuables fortement imposés.',
    'Ignorer les prélèvements sociaux (taux en vigueur) dans le calcul du rendement net.',
    'Négliger les frais de souscription qui pèsent sur le rendement réel quels que soient les revenus.',
    'Écarter les SCPI européennes sous prétexte que la TMI est trop faible pour en tirer un avantage fiscal.',
    'Choisir une SCPI uniquement sur son TDVM brut sans calculer le rendement net après impôt.',
    'Sous-estimer l\'importance du TOF, de la capitalisation et de l\'endettement dans l\'analyse fondamentale.',
  ],
  practicalCases: [
    {
      title: 'Exemple chiffré — 10 000 € de revenus fonciers, TMI 11 %',
      text: 'Revenus fonciers bruts théoriques : 10 000 €. IR à 11 % = 1 100 €. Prélèvements sociaux (taux en vigueur) : environ 1 720 €. Total prélevé : environ 2 820 €. Net perçu : environ 7 180 €. Rendement net : 71,8 % du brut. Simulation pédagogique simplifiée, hors frais de souscription, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.',
    },
    {
      title: 'SCPI française en direct — TMI 11 %, TDVM 5 %',
      text: 'Un investisseur en TMI 11 % détient une SCPI française en direct avec un TDVM de 5 %. Après impôt (IR 11 % + PS), le rendement net est d\'environ 3,6 %. Le rendement reste compétitif par rapport à d\'autres placements, mais doit être comparé avec le rendement net en assurance-vie ou en SCPI européenne.',
    },
    {
      title: 'SCPI européenne — TMI 11 %, diversification Allemagne / Pays-Bas',
      text: 'Un jeune investisseur en TMI 11 % choisit une SCPI européenne investie en Allemagne et aux Pays-Bas. Le gain fiscal pur est modeste, mais la diversification géographique et sectorielle permet d\'accéder à des marchés immobiliers différents. Simulation pédagogique : l\'intérêt est autant patrimonial que fiscal.',
    },
    {
      title: 'Assurance-vie — TMI 11 %, horizon 10 ans',
      text: 'Un investisseur place des SCPI dans une assurance-vie avec un horizon de 10 ans. La capitalisation sans impôt immédiat et l\'abattement après 8 ans peuvent améliorer le rendement net par rapport au direct, selon les frais UC du contrat. Simulation pédagogique : comparer le rendement net estimé dans les deux cas.',
    },
    {
      title: 'Démembrement — Pas de besoin de revenus',
      text: 'Un investisseur en TMI 11 % sans besoin de revenus place en nue-propriété pour 10 ans. La décote à l\'entrée et l\'absence de fiscalité pendant la période sont des avantages, mais l\'économie d\'impôt est moins significative qu\'à TMI 41 %. Le démembrement reste pertinent si l\'objectif est patrimonial.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI analyse chaque projet SCPI selon la TMI de l\'investisseur, en comparant le rendement net après impôt des différentes options : direct, européennes, assurance-vie, démembrement, crédit.',
    'La première étape consiste à calculer le rendement net fiscal prévisionnel à partir du TDVM brut, de la TMI et des prélèvements sociaux (taux en vigueur à vérifier).',
    'La deuxième étape intègre les frais de souscription et de gestion, amortis sur l\'horizon d\'investissement.',
    'La troisième étape compare les options entre elles : direct, assurance-vie, démembrement, SCPI européennes, crédit. Le comparateur MaximusSCPI facilite cette pré-orientation.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. Un échange avec le Cabinet Eric Bellaiche permet de simuler le rendement net selon votre TMI réelle et votre situation patrimoniale.',
  ],
  conclusionParagraphs: [
    'Les SCPI sont accessibles et pertinentes à TMI 11 %, à condition d\'analyser le rendement net après impôt et prélèvements sociaux, la qualité de la SCPI, les frais et l\'adéquation avec l\'horizon et les objectifs patrimoniaux.',
    'Sources et points à vérifier : barème de l\'IR en vigueur, taux des prélèvements sociaux, DIC et notes d\'information des SCPI, documents réglementaires.',
    'Utilisez le comparateur MaximusSCPI pour identifier les SCPI à approfondir, puis validez votre analyse avec un conseiller pour une simulation adaptée à votre TMI réelle.',
  ],
  faqItems: [
    {
      question: 'Les SCPI sont-elles intéressantes avec une TMI à 11 % ?',
      answer: 'Oui. Le rendement net après impôt (TMI + prélèvements sociaux) reste compétitif par rapport à d\'autres placements. L\'analyse doit porter sur le rendement net et la qualité de la SCPI.',
    },
    {
      question: 'Faut-il privilégier les SCPI européennes avec une TMI 11 % ?',
      answer: 'L\'intérêt des SCPI européennes à TMI 11 % repose davantage sur la diversification géographique que sur l\'optimisation fiscale. La fiscalité nette peut être légèrement plus favorable selon les pays.',
    },
    {
      question: 'Les prélèvements sociaux changent-ils l\'analyse ?',
      answer: 'Oui, les prélèvements sociaux (taux en vigueur) s\'appliquent sur les revenus fonciers des SCPI françaises, quel que soit le niveau de TMI. Ils doivent être intégrés dans le calcul du rendement net.',
    },
    {
      question: 'Le démembrement est-il utile avec TMI 11 % ?',
      answer: 'Pas si l\'investisseur a besoin de revenus immédiats. Si l\'investisseur n\'a pas besoin de revenus, le démembrement conserve son intérêt patrimonial (décote, pas de fiscalité), bien que l\'économie d\'impôt soit moindre qu\'aux TMI plus élevées.',
    },
    {
      question: 'Assurance-vie ou SCPI en direct avec TMI 11 % ?',
      answer: 'Cela dépend de l\'horizon, des frais du contrat et des objectifs de transmission. À TMI 11 %, l\'avantage fiscal de l\'AV est moins marqué, mais le cadre patrimonial peut justifier le choix.',
    },
    {
      question: 'Comment calculer le rendement net à TMI 11 % ?',
      answer: 'Partez du TDVM brut, appliquez la TMI (11 %) et les prélèvements sociaux (taux en vigueur), puis déduisez les frais amortis sur l\'horizon. Un conseiller peut réaliser cette simulation.',
    },
    {
      question: 'Les frais de souscription sont-ils plus pénalisants à TMI 11 % ?',
      answer: 'Ils le sont proportionnellement tout autant qu\'à d\'autres TMI, mais leur poids relatif dans le rendement net peut être plus visible si le rendement après impôt est plus faible.',
    },
    {
      question: 'Quels critères regarder en priorité avec TMI 11 % ?',
      answer: 'Le TOF, la capitalisation, le rendement net fiscal, les frais, et la diversification sectorielle et géographique. La fiscalité n\'est pas le critère dominant à cette TMI.',
    },
    {
      question: 'Les SCPI à crédit sont-elles pertinentes à TMI 11 % ?',
      answer: 'L\'effet de levier peut être intéressant, et les intérêts d\'emprunt peuvent être déductibles sous conditions. L\'analyse du cash-flow et du coût du crédit est essentielle.',
    },
    {
      question: 'Comment MaximusSCPI analyse un projet avec TMI 11 % ?',
      answer: 'Le comparateur affiche le TDVM brut et les indicateurs clés. Les contenus pédagogiques aident à calculer le rendement net selon la TMI. L\'analyse personnalisée relève d\'un échange avec un conseiller.',
    },
  ],
  comparateurCtaLabel: 'Analyser le rendement net SCPI avec une TMI à 11 %',
}
