import type { ScpiEducationalPageConfig } from './shared'

export const liquiditeScpiConfig: ScpiEducationalPageConfig = {
  path: '/liquidite-scpi',
  badge: 'Risque & liquidité',
  h1: 'Liquidité SCPI : peut-on revendre facilement ses parts ?',
  heroSubtitle:
    'La liquidité est un risque central en SCPI. Les parts ne se revendent pas comme une action cotée. Le délai de revente dépend du type de SCPI, de la collecte, des demandes de retrait et des conditions de marché. Elle doit être analysée avant l\'investissement, surtout si l\'épargne peut devoir être récupérée rapidement.',
  seoTitle: 'Liquidité SCPI : revente, délais, capital variable et fixe — Guide complet',
  seoDescription:
    'Analyse complète de la liquidité des SCPI : revente des parts, délais de retrait, différence capital variable / capital fixe, marché secondaire, collecte nette, prix de retrait, suspension possible. Exemple chiffré et cas pratiques.',
  shortAnswerTitle: 'Pourquoi la liquidité est-elle un risque en SCPI ?',
  shortAnswer:
    'Une SCPI n\'est pas un placement coté en Bourse. Les parts se revendent via le marché secondaire ou directement auprès de la société de gestion, avec des délais qui peuvent varier de quelques semaines à plusieurs mois. En période de crise immobilière ou de demande massive de retraits, les délais peuvent s\'allonger, voire les retraits peuvent être suspendus temporairement. La liquidité dépend du type de SCPI (capital variable ou fixe), de la collecte nette, du carnet d\'ordres et de la qualité du patrimoine. Elle doit être anticipée avant la souscription.',
  keyMessage:
    'La liquidité d\'une SCPI n\'est pas garantie. Elle doit être analysée avant l\'investissement, surtout si l\'épargne peut devoir être récupérée rapidement.',
  definitionParagraphs: [
    'La liquidité d\'une SCPI désigne sa capacité à permettre à un associé de revendre ses parts dans un délai raisonnable et à un prix proche de la valeur de souscription. Contrairement aux actions cotées, il n\'existe pas de marché continu pour les parts de SCPI.',
    'Les SCPI à capital variable peuvent racheter directement les parts des associés qui souhaitent se retirer, dans la limite des demandes de retrait traitées périodiquement. Le délai peut être court si la collecte nette est positive, mais peut s\'allonger si les retraits dépassent les nouvelles souscriptions.',
    'Les SCPI à capital fixe disposent d\'un capital déterminé. La revente se fait exclusivement sur le marché secondaire, où se rencontrent acheteurs et vendeurs de parts existantes. Le délai dépend de l\'équilibre entre l\'offre et la demande, et le prix de cotation peut différer du prix de souscription.',
    'Le marché secondaire est organisé par la société de gestion ou par des intermédiaires spécialisés. Les ordres de vente et d\'achat sont centralisés dans un carnet d\'ordres. Le prix de cotation peut être inférieur (décote) ou supérieur (surcote) au prix de souscription selon le marché.',
    'En période de crise immobilière ou de tensions sur le marché, les délais de retrait peuvent s\'allonger significativement. Certaines SCPI ont historiquement suspendu temporairement les retraits pour préserver l\'égalité entre associés et éviter des cessions forcées à perte.',
    'La liquidité perçue en assurance-vie est différente : l\'arbitrage vers le fonds euros ou le rachat est généralement rapide (quelques jours), mais la valeur de rachat dépend du prix de souscription de la SCPI au moment de la sortie. La liquidité du contrat n\'équivaut pas à une garantie de valeur.',
    'Le prix de retrait est le prix auquel la société de gestion rachète les parts. Il peut être inférieur au prix de souscription. Surveiller son évolution est un indicateur de la liquidité effective.',
  ],
  tableTitle: 'Situation / Lecture / Vigilance / Questions à poser avant d\'investir',
  tableRows: [
    {
      level: 'SCPI à capital variable — Collecte positive',
      advantage: 'Délai généralement court (15 jours à 2 mois). La société rachète régulièrement les parts avec les nouvelles souscriptions.',
      vigilance: 'Le délai peut s\'allonger si la collecte ralentit ou devient négative. Surveiller la collecte nette trimestrielle.',
    },
    {
      level: 'SCPI à capital variable — Collecte négative',
      advantage: 'La société traite les retraits dans l\'ordre d\'arrivée, mais le délai s\'allonge.',
      vigilance: 'Vérifier le rapport retraits/souscriptions. En cas de déséquilibre persistant, le délai peut dépasser 6 mois.',
    },
    {
      level: 'SCPI à capital fixe — Marché équilibré',
      advantage: 'Le carnet d\'ordres permet une cotation régulière. Délai de 1 à 3 mois si l\'offre et la demande s\'équilibrent.',
      vigilance: 'Le prix de cotation peut différer du prix de souscription. Vérifier la décote ou surcote sur le marché secondaire.',
    },
    {
      level: 'SCPI à capital fixe — Déséquilibre vendeurs',
      advantage: 'Les ordres de vente sont enregistrés mais le délai s\'allonge.',
      vigilance: 'Délai pouvant dépasser 6 mois. Décote possible sur le prix de cession. Vérifier l\'historique de liquidité.',
    },
    {
      level: 'Assurance-vie (UC SCPI)',
      advantage: 'Arbitrage ou rachat généralement rapide (quelques jours). Liquidité contractuelle.',
      vigilance: 'La valeur de rachat dépend du prix de la SCPI au moment de la sortie. Pas de garantie de valeur malgré la rapidité.',
    },
  ],
  tableNote:
    'Ces repères sont indicatifs. La liquidité effective dépend du contexte de marché et des conditions spécifiques de chaque SCPI.',
  criteriaTitle: 'Critères à croiser avec la liquidité',
  criteriaCards: [
    { title: 'Type de capital', text: 'Capital variable : la société rachète les parts. Capital fixe : revente sur le marché secondaire seulement.' },
    { title: 'Collecte nette', text: 'Une collecte positive facilite le rachat de parts. Une collecte en baisse peut allonger les délais de retrait.' },
    { title: 'Délai de retrait publié', text: 'La société de gestion communique un délai indicatif. Le suivre sur plusieurs trimestres pour identifier les tendances.' },
    { title: 'Prix de retrait', text: 'Comparer le prix de retrait au prix de souscription. Un écart important peut signaler une tension sur la liquidité.' },
    { title: 'Capitalisation', text: 'Les grandes SCPI ont souvent un marché secondaire plus actif, mais la liquidité n\'est jamais garantie pour autant.' },
    { title: 'Évolution du prix de part', text: 'Un prix de part stable ou en hausse est cohérent avec une liquidité normale. Une baisse peut inciter aux départs.' },
    { title: 'TOF', text: 'Un TOF faible peut inciter des associés à vendre, augmentant la pression sur la liquidité.' },
    { title: 'Endettement', text: 'Une SCPI très endettée peut avoir moins de flexibilité pour gérer les retraits sans céder des actifs.' },
    { title: 'Historique de liquidité', text: 'Consulter les rapports annuels pour vérifier si la SCPI a connu des périodes de suspension ou d\'allongement des retraits.' },
  ],
  commonErrors: [
    'Penser que les SCPI sont aussi liquides que des actions ou des obligations.',
    'Investir en SCPI sans horizon long terme (8-10 ans minimum recommandé).',
    'Ignorer le délai de retrait publié par la société de gestion.',
    'Confondre liquidité en assurance-vie (rapidité du rachat) et liquidité de la SCPI (valeur de rachat).',
    'Ne pas vérifier la collecte nette avant d\'investir.',
    'Croire que le prix de souscription est garanti à la revente.',
    'Investir une épargne de précaution dans une SCPI.',
  ],
  practicalCases: [
    {
      title: 'Exemple chiffré — Besoin de 50 000 €',
      text: 'Un investisseur a besoin de récupérer 50 000 € pour un projet. Son épargne de précaution est insuffisante, il demande le retrait de ses parts de SCPI à capital variable. La collecte nette étant devenue négative, le délai annoncé est de 6 mois. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.',
    },
    {
      title: 'SCPI à capital variable — Collecte positive, retrait rapide',
      text: 'Une SCPI à capital variable de 800 M€ affiche une collecte nette positive et un délai de retrait de 15 jours. Les associés peuvent sortir rapidement si besoin. Simulation pédagogique : la liquidité est favorable, mais elle n\'est pas garantie en cas de retournement de collecte.',
    },
    {
      title: 'SCPI à capital fixe — Carnet d\'ordres tendu',
      text: 'Une SCPI à capital fixe de 300 M€ voit les demandes de vente dépasser les demandes d\'achat. Le délai de revente passe de 2 à 6 mois. L\'associé doit attendre ou accepter une décote. Simulation pédagogique : la liquidité dépend de l\'équilibre du marché secondaire.',
    },
    {
      title: 'Assurance-vie — Sortie rapide mais valeur en baisse',
      text: 'Un investisseur demande un rachat de son contrat d\'assurance-vie contenant des SCPI. Le rachat est effectué sous 5 jours, mais la valeur de rachat reflète le prix de souscription du jour, en baisse de 3 %. La liquidité du contrat n\'a pas protégé contre la baisse de valeur.',
    },
    {
      title: 'Crise immobilière — Suspension des retraits',
      text: 'En période de crise immobilière avec demande massive de retraits, certaines SCPI ont suspendu temporairement les rachats pour préserver l\'égalité entre associés. Les investisseurs ont dû attendre plusieurs mois supplémentaires. Simulation pédagogique : la liquidité peut être totalement bloquée dans des circonstances exceptionnelles.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI intègre la liquidité comme un critère de vigilance dans l\'analyse des SCPI. Le comparateur affiche la capitalisation, la collecte nette et le type de SCPI comme indicateurs de lecture.',
    'La première étape consiste à identifier le type de SCPI : capital variable ou fixe. Cette information, publiée dans la note d\'information, détermine le mécanisme de revente.',
    'La deuxième étape vérifie la collecte nette et son évolution. Une collecte positive facilite les retraits ; une collecte négative ou en baisse est un signal de vigilance.',
    'La troisième étape compare le prix de souscription au prix de retrait et suit le délai de retrait communiqué sur plusieurs trimestres.',
    'La quatrième étape évalue la compatibilité entre l\'horizon de l\'investisseur et la liquidité effective de la SCPI.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. Un échange avec le Cabinet Eric Bellaiche permet d\'analyser la liquidité selon votre horizon et vos besoins.',
  ],
  conclusionParagraphs: [
    'La liquidité est un risque central des SCPI, souvent sous-estimé. Elle dépend du type de SCPI, de la collecte, du marché secondaire et du contexte immobilier. Elle doit être analysée avant d\'investir, et l\'horizon doit être compatible avec les délais potentiels.',
    'Sources et points à vérifier : note d\'information, bulletin trimestriel, rapport annuel, délai de retrait publié, collecte nette communiquée par la société de gestion.',
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
      answer: 'Le capital variable permet à la société de gestion de racheter les parts directement. Le capital fixe limite la revente au marché secondaire entre associés.',
    },
    {
      question: 'Peut-on être bloqué en SCPI ?',
      answer: 'Oui, dans certaines situations : demande massive de retraits, crise immobilière, suspension temporaire des retraits. D\'où l\'importance d\'un horizon long terme.',
    },
    {
      question: 'L\'assurance-vie améliore-t-elle la liquidité ?',
      answer: 'Le rachat ou l\'arbitrage est généralement rapide, mais la valeur rachetée dépend du prix de la SCPI au moment de la sortie. La liquidité du contrat ne garantit pas la valeur.',
    },
    {
      question: 'Que se passe-t-il en cas de crise immobilière ?',
      answer: 'Les délais de retrait peuvent s\'allonger et les prix de cession peuvent baisser. Certaines SCPI ont suspendu temporairement les retraits par le passé.',
    },
    {
      question: 'Quels indicateurs surveiller pour la liquidité ?',
      answer: 'Type de capital (variable ou fixe), collecte nette, délai de retrait publié, prix de retrait, capitalisation et historique de liquidité.',
    },
    {
      question: 'Quelle est la différence entre livret liquide et SCPI ?',
      answer: 'Un livret d\'épargne est disponible immédiatement sans frais ni risque de perte. Une SCPI nécessite un délai de revente non garanti et expose à une baisse de valeur. Les deux placements n\'ont pas la même fonction.',
    },
    {
      question: 'Comment la collecte influence-t-elle la liquidité ?',
      answer: 'Une collecte positive permet de racheter les parts des associés sortants. Une collecte négative ou en baisse allonge les délais de retrait et peut créer des tensions.',
    },
    {
      question: 'Comment MaximusSCPI analyse la liquidité ?',
      answer: 'Le comparateur affiche les indicateurs de liquidité. L\'approche est pédagogique et ne constitue pas une recommandation personnalisée au sens de la réglementation MIF2.',
    },
  ],
  comparateurCtaLabel: 'Tester la cohérence entre SCPI et besoin de liquidité',
}
