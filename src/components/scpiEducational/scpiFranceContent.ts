import type { ScpiEducationalPageConfig } from './shared'

export const scpiFranceConfig: ScpiEducationalPageConfig = {
  path: '/scpi-france',
  badge: 'Analyse SCPI',
  h1: 'SCPI France : fiscalité, rendement et points de vigilance',
  heroSubtitle:
    "Une SCPI investie principalement en France doit être analysée sur sa distribution, la qualité de son patrimoine, son prix de part, sa liquidité et la fiscalité réellement applicable à l'investisseur. Le rendement net ne se déduit pas d'une formule automatique par TMI.",
  seoTitle: 'SCPI France : fiscalité, rendement, risques et critères d\'analyse',
  seoDescription:
    "Guide SCPI France : revenus fonciers, prélèvements sociaux, rendement net, TOF, prix de part, dette, liquidité et comparaison avec les autres modes de détention.",
  shortAnswerTitle: "Qu'est-ce qu'une SCPI France ?",
  shortAnswer:
    "Une SCPI France détient principalement des actifs immobiliers situés en France. Pour un associé personne physique en détention directe, la composante immobilière française est en principe imposée dans la catégorie des revenus fonciers, selon la situation fiscale du foyer. Le rendement réellement conservé dépend de la base imposable, des charges, des prélèvements sociaux, du mode de détention et des frais. Une comparaison sérieuse doit aussi intégrer prix de part, valeurs d'expertise, TOF, endettement et liquidité.",
  keyMessage:
    "Une SCPI France ne se juge pas sur son taux de distribution seul. Le net fiscal, la trajectoire du prix de part et la liquidité peuvent changer complètement le diagnostic.",
  definitionParagraphs: [
    "Une SCPI France est une SCPI dont le patrimoine est majoritairement exposé au marché immobilier français. La part exacte investie en France doit être vérifiée dans le rapport annuel et les bulletins de la société de gestion.",
    "Les distributions peuvent comprendre plusieurs composantes. Pour une détention directe par une personne physique, la quote-part de revenus immobiliers français relève généralement des revenus fonciers. La base fiscale doit être déterminée selon le régime applicable et non à partir du seul montant brut distribué.",
    "Les prélèvements sociaux applicables aux revenus fonciers français sont calculés selon les règles en vigueur sur la base imposable concernée. La TMI est un taux marginal et ne constitue pas à elle seule le taux réel d'imposition du foyer.",
    "Le taux de distribution renseigne sur le revenu distribué mais ne mesure pas la performance totale. Une baisse du prix de part, une dégradation des valeurs d'expertise ou une hausse des retraits peuvent annuler l'intérêt apparent d'un rendement élevé.",
    "Le TOF, la qualité des locataires, la durée des baux, les besoins de travaux, la diversification sectorielle et géographique ainsi que l'endettement déterminent la capacité de la SCPI à maintenir ses distributions.",
    "Le mode de détention modifie la chronologie et parfois la nature de l'imposition. Direct, assurance-vie, démembrement, crédit ou détention sociétaire doivent être comparés avec leurs frais, leur liquidité et leur fiscalité de sortie.",
    "Comparer une SCPI France à une SCPI européenne nécessite de traiter séparément les revenus étrangers selon les conventions fiscales applicables. Il n'existe pas de règle générale du type « Europe = prélèvements sociaux à 0 % » ni de crédit d'impôt uniforme pour tous les pays.",
  ],
  tableTitle: 'Critère / Lecture utile / Vigilance',
  tableRows: [
    {
      level: 'Taux de distribution',
      advantage: 'Mesure le revenu distribué sur la période selon la méthodologie publiée.',
      vigilance: 'Ne mesure ni la variation du prix de part ni le rendement net fiscal.',
    },
    {
      level: 'Fiscalité des revenus',
      advantage: 'Le cadre des revenus immobiliers français est documenté et la société de gestion fournit une information fiscale annuelle.',
      vigilance: 'Base imposable, charges, TMI, prélèvements sociaux et autres revenus du foyer doivent être distingués.',
    },
    {
      level: 'TOF et baux',
      advantage: "Permettent d'évaluer l'occupation et la visibilité locative.",
      vigilance: 'Un TOF élevé ne garantit pas la solidité des loyers ; analyser locataires, baux et échéances.',
    },
    {
      level: 'Prix et valeurs',
      advantage: 'Prix de part, valeur de réalisation et valeur de reconstitution donnent plusieurs angles de lecture.',
      vigilance: "Une décote ou une surcote n'est pas un signal d'achat ou de vente à elle seule.",
    },
    {
      level: 'Liquidité',
      advantage: 'Le mécanisme de retrait ou de marché secondaire est encadré.',
      vigilance: "Le délai de sortie n'est pas garanti et peut s'allonger fortement si les demandes de retrait dépassent les souscriptions.",
    },
    {
      level: 'Endettement',
      advantage: 'Un levier maîtrisé peut financer des acquisitions et lisser certains besoins de trésorerie.',
      vigilance: 'Coût de la dette, maturités et refinancement doivent être suivis dans le temps.',
    },
  ],
  tableNote:
    "Ces critères doivent être lus ensemble. Une fiscalité favorable ou un rendement élevé ne compense pas automatiquement une mauvaise liquidité ou une dégradation du patrimoine.",
  criteriaTitle: 'Critères à croiser pour une SCPI France',
  criteriaCards: [
    { title: 'Rendement net', text: "Partir des distributions réellement perçues puis intégrer la fiscalité et les frais propres au dossier, sans appliquer une formule TMI + PS à tous les flux." },
    { title: 'TOF', text: "Suivre le niveau actuel mais surtout sa trajectoire, les franchises de loyers et les relocations." },
    { title: 'Valeurs d\'expertise', text: "Comparer prix de part, valeur de réalisation et valeur de reconstitution et suivre leurs évolutions." },
    { title: 'Endettement', text: "Contrôler ratio, coût, échéances et sensibilité aux taux plutôt qu'un seuil universel." },
    { title: 'Liquidité', text: "Regarder les retraits, parts en attente, collecte nette et fonctionnement du marché secondaire." },
    { title: 'Secteurs et géographies', text: "Identifier les concentrations réelles et les zones exposées à une vacance structurelle ou à de lourds capex." },
    { title: 'Mode de détention', text: "Direct, assurance-vie, démembrement ou société modifient frais, fiscalité, IFI et liquidité." },
  ],
  commonErrors: [
    "Confondre taux de distribution et performance totale.",
    "Appliquer mécaniquement TMI + prélèvements sociaux au rendement brut de la SCPI.",
    "Considérer qu'une SCPI France est fiscalement moins bonne qu'une SCPI européenne par principe.",
    "Comparer France et Europe sans lire les conventions fiscales pays par pays.",
    "Négliger les retraits et les délais de liquidité.",
    "Se satisfaire d'un TOF élevé sans regarder les baux, locataires et franchises.",
    "Ignorer la trajectoire du prix de part et des valeurs d'expertise.",
  ],
  practicalCases: [
    {
      title: 'Détention directe',
      text: "Le calcul du net part de la fiche fiscale annuelle, de la base foncière imposable et de la situation globale du foyer. Il ne suffit pas de retrancher un pourcentage fixe au taux de distribution.",
    },
    {
      title: 'SCPI à rendement élevé mais prix de part en baisse',
      text: "Un taux de distribution élevé peut coexister avec une baisse du prix de part. L'analyse doit intégrer la variation de capital et la cause de la baisse avant de conclure à une bonne performance.",
    },
    {
      title: 'SCPI avec retraits en hausse',
      text: "Une distribution stable peut masquer une liquidité qui se dégrade. Parts en attente, collecte nette et délais de retrait doivent être ajoutés au diagnostic.",
    },
    {
      title: 'Comparaison France / Europe',
      text: "La fiscalité européenne est ventilée pays par pays à partir de la fiche fiscale et des conventions. La comparaison porte ensuite sur le rendement net, les risques et la liquidité à horizon identique.",
    },
  ],
  methodParagraphs: [
    "Identifier la part réellement investie en France et les principaux secteurs du patrimoine.",
    "Analyser le taux de distribution avec le prix de part et les valeurs d'expertise.",
    "Suivre TOF, baux, locataires, capex, endettement et liquidité sur plusieurs périodes.",
    "Calculer le rendement net à partir de la fiscalité réelle du foyer et du mode de détention.",
    "Comparer ensuite avec d'autres SCPI sur un horizon identique et avec les mêmes hypothèses de frais et de sortie.",
    "Utiliser la Trajectoire et les Signaux MaximusSCPI pour détecter les ruptures plutôt que de figer une photographie annuelle.",
  ],
  conclusionParagraphs: [
    "Une SCPI France peut être pertinente pour diversifier un patrimoine, mais elle doit être évaluée sur un ensemble de critères : distribution, prix de part, qualité locative, dette, liquidité, frais et fiscalité réelle.",
    "La comparaison avec l'Europe n'a de sens qu'après traitement conventionnel des revenus étrangers et mise à niveau des risques immobiliers.",
    "La décision ne doit jamais reposer sur la seule TMI ni sur le seul taux de distribution.",
  ],
  faqItems: [
    {
      question: "Qu'est-ce qu'une SCPI France ?",
      answer: "Une SCPI principalement exposée à des actifs immobiliers situés en France. La répartition exacte doit être vérifiée dans ses documents officiels.",
    },
    {
      question: 'Comment sont fiscalisés les revenus ?',
      answer: "Pour une détention directe par une personne physique, la composante immobilière française relève généralement des revenus fonciers. Le calcul dépend de la base imposable et de la situation du foyer.",
    },
    {
      question: 'Peut-on calculer le rendement net avec TMI + prélèvements sociaux ?',
      answer: "C'est au mieux une approximation marginale. Il faut intégrer la base nette imposable, les charges, le taux moyen, les autres revenus et le mode de détention.",
    },
    {
      question: 'Une SCPI européenne est-elle fiscalement meilleure ?',
      answer: "Pas automatiquement. Les conventions fiscales, les pays, les frais, la qualité du patrimoine et les risques peuvent inverser le résultat.",
    },
    {
      question: 'Que regarder au-delà du rendement ?',
      answer: "TOF, trajectoire des valeurs, dette, baux, locataires, capex, collecte, retraits et parts en attente.",
    },
    {
      question: 'La liquidité est-elle garantie ?',
      answer: "Non. La sortie dépend de la structure de la SCPI et de l'équilibre entre souscriptions et retraits ou du marché secondaire.",
    },
    {
      question: 'Comment MaximusSCPI analyse une SCPI France ?',
      answer: "MaximusSCPI croise les chiffres clés, le Radar, la Trajectoire, les Signaux du marché, la liquidité et la fiscalité du mode de détention.",
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI France sur leurs fondamentaux',
}
