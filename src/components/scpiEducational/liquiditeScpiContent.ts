import type { ScpiEducationalPageConfig } from './shared'

export const liquiditeScpiConfig: ScpiEducationalPageConfig = {
  path: '/liquidite-scpi',
  badge: 'Risque & liquidité',
  h1: 'Liquidité SCPI : peut-on revendre facilement ses parts ?',
  heroSubtitle:
    'La liquidité est un risque central en SCPI. Les parts ne se revendent pas comme une action cotée. Le délai de revente dépend du type de SCPI, de la collecte, des demandes de retrait et des conditions de marché. Elle doit être analysée avant l\'investissement, surtout si l\'investisseur peut avoir besoin de récupérer rapidement son capital.',
  seoTitle: 'Liquidité SCPI : revente, délais et risques à connaître',
  seoDescription:
    'Comprenez la liquidité des SCPI : revente des parts, délai de retrait, marché secondaire, capital variable, capital fixe et risques en cas de besoin rapide de trésorerie.',
  shortAnswerTitle: 'Pourquoi la liquidité est-elle un risque en SCPI ?',
  shortAnswer:
    'Une SCPI n\'est pas un placement coté en Bourse. Les parts se revendent via le marché secondaire ou directement auprès de la société de gestion, avec des délais qui peuvent varier de quelques semaines à plusieurs mois. En période de crise immobilière ou de demande massive de retraits, les délais peuvent s\'allonger. La liquidité dépend du type de SCPI (capital variable ou fixe), de la collecte nette, du carnet d\'ordres et de la qualité du patrimoine.',
  keyMessage:
    'La liquidité d\'une SCPI n\'est pas garantie. Elle doit être analysée avant l\'investissement, surtout si l\'investisseur peut avoir besoin de récupérer rapidement son capital.',
  definitionParagraphs: [
    'La liquidité d\'une SCPI désigne sa capacité à permettre à un associé de revendre ses parts dans un délai raisonnable et à un prix proche de la valeur de souscription. Contrairement aux actions cotées, il n\'existe pas de marché continu pour les parts de SCPI.',
    'Les SCPI à capital variable peuvent racheter directement les parts des associés qui souhaitent se retirer, dans la limite des demandes de retrait traitées périodiquement. Le délai peut être court si la collecte nette est positive, mais peut s\'allonger si les retraits dépassent les nouvelles souscriptions.',
    'Les SCPI à capital fixe disposent d\'un capital déterminé. La revente se fait exclusivement sur le marché secondaire, où se rencontrent acheteurs et vendeurs de parts existantes. Le délai dépend de l\'équilibre entre l\'offre et la demande.',
    'Le marché secondaire est organisé par la société de gestion ou par des intermédiaires spécialisés. Les ordres de vente et d\'achat sont centralisés dans un carnet d\'ordres. Le prix de cotation peut différer du prix de souscription, avec une décote ou une surcote selon le marché.',
    'En période de crise immobilière ou de tensions sur le marché, les délais de retrait peuvent s\'allonger significativement. Certaines SCPI ont historiquement suspendu temporairement les retraits pour préserver l\'égalité entre associés.',
    'La liquidité perçue en assurance-vie est différente : l\'arbitrage vers le fonds euros ou le rachat est généralement rapide, mais la valeur de rachat dépend du prix de souscription de la SCPI au moment de la sortie. La liquidité du contrat n\'équivaut pas à une garantie de valeur.',
  ],
  tableTitle: 'Liquidité SCPI : ce qu\'il faut savoir',
  tableRows: [
    {
      level: 'SCPI à capital variable',
      advantage:
        'La société de gestion rachète les parts selon un calendrier. Délai potentiellement plus court si collecte positive.',
      vigilance:
        'Le délai peut s\'allonger en cas de retraits massifs. Surveiller la collecte nette et les délais publiés.',
    },
    {
      level: 'SCPI à capital fixe',
      advantage:
        'Marché secondaire avec carnet d\'ordres. Prix de cotation potentiellement plus transparent.',
      vigilance:
        'Délai dépendant de la demande. Décote possible en cas de déséquilibre. Peu de transparence sur les files d\'attente.',
    },
    {
      level: 'Assurance-vie (UC SCPI)',
      advantage:
        'Arbitrage ou rachat généralement rapide (quelques jours). Liquidité contractuelle.',
      vigilance:
        'La valeur de rachat dépend du prix de la SCPI. Pas de garantie de valeur. Frais en cas de rachat avant 8 ans.',
    },
    {
      level: 'Marché secondaire tendu',
      advantage:
        'Identifier les SCPI avec une collecte nette positive et un carnet d\'ordres équilibré.',
      vigilance:
        'Délai de revente allongé, décote possible. Vérifier les indicateurs de liquidité avant d\'investir.',
    },
    {
      level: 'Demande massive de retraits',
      advantage:
        'Phénomène rare mais pouvant survenir en période de crise de confiance.',
      vigilance:
        'Suspension des retraits possible. Horizon long obligatoire. Diversifier les SCPI.',
    },
  ],
  tableNote:
    'Ces repères sont indicatifs. La liquidité effective dépend du contexte de marché et des conditions spécifiques de chaque SCPI.',
  criteriaTitle: 'Critères à croiser avec la liquidité',
  criteriaCards: [
    { title: 'Capitalisation', text: 'Les grandes SCPI ont souvent un marché secondaire plus actif, mais la liquidité n\'est jamais garantie.' },
    { title: 'Collecte nette', text: 'Une collecte positive facilite le rachat de parts. Une collecte en baisse peut allonger les délais.' },
    { title: 'Délai de retrait publié', text: 'La société de gestion communique un délai indicatif. Le surveiller sur plusieurs trimestres.' },
    { title: 'Prix de retrait', text: 'Comparer le prix de retrait au prix de souscription. Un écart important peut signaler une tension.' },
    { title: 'Évolution du prix de part', text: 'Un prix de part stable ou en hausse est cohérent avec une liquidité normale.' },
    { title: 'TOF', text: 'Un TOF faible peut inciter des associés à vendre, augmentant la pression sur la liquidité.' },
    { title: 'Endettement', text: 'Une SCPI très endettée peut avoir moins de flexibilité pour gérer les retraits.' },
    { title: 'Historique de liquidité', text: 'Consulter les rapports annuels pour vérifier si la SCPI a connu des périodes de suspension ou d\'allongement.' },
  ],
  commonErrors: [
    'Penser que les SCPI sont aussi liquides que des actions ou des obligations.',
    'Investir en SCPI sans horizon long terme.',
    'Ignorer le délai de retrait publié par la société de gestion.',
    'Confondre liquidité en assurance-vie et liquidité de la SCPI.',
    'Ne pas vérifier la collecte nette avant d\'investir.',
    'Croire que le prix de souscription est garanti à la revente.',
  ],
  practicalCases: [
    {
      title: 'SCPI à capital variable — collecte positive, retrait rapide',
      text: 'Une SCPI à capital variable de 800 M€ affiche une collecte nette positive et un délai de retrait de 15 jours. Les associés peuvent sortir rapidement. Simulation pédagogique : la liquidité est favorable, mais elle n\'est pas garantie en cas de retournement de collecte.',
    },
    {
      title: 'SCPI à capital fixe — carnet d\'ordres tendu',
      text: 'Une SCPI à capital fixe de 300 M€ voit les demandes de vente dépasser les demandes d\'achat. Le délai de revente passe de 2 à 6 mois. L\'associé doit attendre ou accepter une décote. Simulation pédagogique : la liquidité dépend du marché.',
    },
    {
      title: 'Assurance-vie — sortie rapide mais décote',
      text: 'Un investisseur demande un rachat de son contrat d\'assurance-vie contenant des SCPI. Le rachat est effectué sous 5 jours, mais la valeur de rachat reflète le prix de souscription du jour, en baisse de 3 %. La liquidité du contrat n\'a pas protégé contre la baisse de valeur.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI intègre la liquidité comme un critère de vigilance dans l\'analyse des SCPI. Le comparateur affiche la capitalisation, la collecte nette et le type de SCPI comme indicateurs de lecture.',
    'La première étape consiste à identifier le type de SCPI : capital variable ou fixe. Cette information, publiée dans la note d\'information, détermine le mécanisme de revente.',
    'La deuxième étape vérifie la collecte nette et son évolution. Une collecte positive facilite les retraits ; une collecte négative ou en baisse est un signal de vigilance.',
    'La troisième étape compare le prix de souscription au prix de retrait et suit le délai de retrait communiqué sur plusieurs trimestres.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. Un échange avec le Cabinet Eric Bellaiche permet d\'analyser la liquidité selon votre horizon et vos besoins.',
  ],
  conclusionParagraphs: [
    'La liquidité est un risque central des SCPI, souvent sous-estimé. Elle dépend du type de SCPI, de la collecte, du marché secondaire et du contexte immobilier. Elle doit être analysée avant d\'investir.',
    'Utilisez le comparateur MaximusSCPI pour identifier les indicateurs de liquidité, puis validez votre analyse avec un conseiller pour une approche adaptée à votre horizon.',
  ],
  faqItems: [
    {
      question: 'Une SCPI est-elle liquide ?',
      answer: 'Non. Les parts de SCPI ne sont pas cotées en Bourse et leur revente peut prendre de quelques semaines à plusieurs mois. La liquidité est structurellement limitée.',
    },
    {
      question: 'Combien de temps faut-il pour revendre des parts de SCPI ?',
      answer: 'Cela varie selon la SCPI et les conditions de marché : de 15 jours à plusieurs mois. Les SCPI à capital variable avec une collecte positive sont généralement plus rapides.',
    },
    {
      question: 'Quelle différence entre capital fixe et capital variable ?',
      answer: 'Le capital variable permet à la société de gestion de racheter les parts directement. Le capital fixe limite la revente au marché secondaire entre associés existants.',
    },
    {
      question: 'Peut-on être bloqué en SCPI ?',
      answer: 'Oui, dans certaines situations : demande massive de retraits, crise immobilière, suspension temporaire des retraits. Cela confirme l\'importance d\'un horizon long terme.',
    },
    {
      question: 'L\'assurance-vie améliore-t-elle la liquidité ?',
      answer: 'Le rachat ou l\'arbitrage en assurance-vie est généralement rapide, mais la valeur rachetée dépend du prix de la SCPI au moment de la sortie. La liquidité du contrat ne garantit pas la valeur.',
    },
    {
      question: 'Que se passe-t-il en cas de crise immobilière ?',
      answer: 'Les délais de retrait peuvent s\'allonger et les prix de cession peuvent baisser. Certaines SCPI ont suspendu temporairement les retraits par le passé.',
    },
    {
      question: 'Quels indicateurs surveiller ?',
      answer: 'Type de capital, collecte nette, délai de retrait publié, prix de retrait, taille de la SCPI et historique de liquidité.',
    },
    {
      question: 'Comment MaximusSCPI analyse la liquidité ?',
      answer: 'Le comparateur affiche les indicateurs de liquidité. MaximusSCPI encourage une analyse rigoureuse et un échange avec un conseiller avant toute souscription.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI selon leur liquidité',
}
