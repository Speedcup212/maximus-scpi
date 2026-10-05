import type { ScpiEducationalPageConfig } from './shared'

export const prelevementsSociauxScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-prelevements-sociaux/',
  badge: 'Fiscalité SCPI',
  h1: 'Prélèvements sociaux SCPI : impact sur le rendement net',
  heroSubtitle:
    'Les revenus fonciers français supportent en principe des prélèvements sociaux en plus de l\'impôt sur le revenu. Leur base est le revenu net imposable, pas automatiquement le revenu brut distribué par la SCPI. Pour les revenus étrangers et les autres modes de détention, le traitement doit être vérifié séparément.',
  seoTitle: 'Prélèvements sociaux SCPI : taux, base, France, Europe et assurance-vie',
  seoDescription:
    'Prélèvements sociaux SCPI : taux en vigueur, base nette imposable, revenus français et étrangers, assurance-vie, démembrement et rendement net.',
  shortAnswerTitle: 'Comment intégrer les prélèvements sociaux dans une analyse SCPI ?',
  shortAnswer:
    'Pour des revenus fonciers français détenus en direct, les prélèvements sociaux s\'appliquent en principe au revenu net imposable. Le taux applicable aux revenus fonciers est de 17,2 % en 2026, sous réserve d\'une évolution législative. Il ne faut donc pas calculer systématiquement 17,2 % du montant brut distribué par la SCPI. Pour les revenus étrangers, l\'assurance-vie ou un démembrement, le traitement diffère et doit être analysé selon les règles propres au flux concerné.',
  keyMessage:
    'Base taxable et taux doivent être distingués. Le bon calcul porte sur le revenu net imposable correspondant au régime applicable, pas sur un pourcentage appliqué mécaniquement au rendement affiché.',
  definitionParagraphs: [
    'Les prélèvements sociaux sur les revenus du patrimoine comprennent notamment la CSG, la CRDS et le prélèvement de solidarité. Leur taux global applicable aux revenus fonciers est fixé par la loi et peut évoluer.',
    'Pour les revenus fonciers français, les prélèvements sociaux sont calculés sur le revenu net imposable : après l\'abattement du micro-foncier lorsqu\'il est applicable ou après déduction des charges admises au régime réel. Ils ne sont donc pas nécessairement égaux à un pourcentage du revenu brut distribué par une SCPI.',
    'La TMI et les prélèvements sociaux ne doivent pas être simplement additionnés à tous les flux de la SCPI. La nature du revenu, les charges, la CSG déductible éventuelle et le régime fiscal du foyer modifient le calcul réel.',
    'Pour les revenus immobiliers étrangers, le traitement des prélèvements sociaux français doit être vérifié au regard de la nature du revenu, des conventions applicables et de la situation du contribuable. Il n\'existe pas de règle unique « Europe = zéro prélèvement social ».',
    'Dans une assurance-vie, les distributions de la SCPI sont intégrées à la valeur de l\'unité de compte. Les prélèvements sociaux suivent les règles du contrat et de ses gains, notamment lors des rachats ou autres événements taxables, plutôt qu\'une taxation annuelle directe des loyers de la SCPI chez le souscripteur.',
    'En nue-propriété, le nu-propriétaire ne perçoit pas les distributions attribuées à l\'usufruitier pendant le démembrement. Il n\'a donc pas, au titre de ces distributions, le même flux imposable qu\'un plein propriétaire.',
    'La comparaison de rendement doit partir du revenu net fiscal réel dans chaque scénario, et non d\'un taux de distribution auquel on retranche forfaitairement la TMI et 17,2 %.',
  ],
  tableTitle: 'Situation / traitement à vérifier / vigilance',
  tableRows: [
    {
      level: 'Revenus fonciers France — direct',
      advantage: 'Règles connues et base nette identifiable à partir de la déclaration foncière.',
      vigilance: 'Le taux de prélèvements sociaux s\'applique au revenu net imposable, pas automatiquement au brut distribué.',
    },
    {
      level: 'Régime réel',
      advantage: 'Certaines charges peuvent réduire le revenu foncier imposable lorsqu\'elles sont déductibles.',
      vigilance: 'Chaque charge doit remplir les conditions légales ; les intérêts suivent notamment des règles spécifiques.',
    },
    {
      level: 'Revenus étrangers',
      advantage: 'Le traitement peut différer du revenu immobilier français.',
      vigilance: 'Vérifier pays, convention et situation du contribuable. Pas d\'exonération automatique.',
    },
    {
      level: 'Assurance-vie',
      advantage: 'Pas de taxation annuelle directe chez le souscripteur sur les distributions internes de l\'UC SCPI.',
      vigilance: 'Les gains du contrat supportent leurs propres règles de prélèvements sociaux lors des événements concernés.',
    },
    {
      level: 'Nue-propriété',
      advantage: 'Le nu-propriétaire ne reçoit pas les distributions pendant la période.',
      vigilance: 'Cela ne constitue pas une exonération générale ; il faut analyser les autres conséquences fiscales et l\'IFI.',
    },
  ],
  tableNote:
    'Taux et règles à vérifier pour l\'année d\'imposition. En 2026, impots.gouv.fr indique 17,2 % pour les revenus d\'une location nue imposés comme revenus fonciers.',
  criteriaTitle: 'Critères à croiser avec les prélèvements sociaux',
  criteriaCards: [
    { title: 'Base imposable', text: 'Identifier le revenu net imposable après abattement ou charges admises, plutôt que le revenu brut distribué.' },
    { title: 'Taux en vigueur', text: 'Vérifier le taux légal applicable à l\'année concernée.' },
    { title: 'Nature du revenu', text: 'Fonciers français, financiers, étrangers et gains d\'assurance-vie peuvent suivre des règles différentes.' },
    { title: 'Charges', text: 'Au régime réel, la déductibilité des charges influence directement la base des prélèvements sociaux.' },
    { title: 'Revenus étrangers', text: 'Contrôler le traitement conventionnel et domestique avant de conclure à une exonération.' },
    { title: 'Mode de détention', text: 'Direct, assurance-vie, démembrement et société modifient la nature du flux taxable.' },
  ],
  commonErrors: [
    'Calculer les prélèvements sociaux sur le revenu brut distribué alors que la base fiscale est nette.',
    'Utiliser un taux erroné ou ancien sans vérifier l\'année d\'imposition.',
    'Additionner mécaniquement TMI et prélèvements sociaux pour tous les revenus d\'une SCPI.',
    'Supposer que tous les revenus étrangers sont exonérés de prélèvements sociaux.',
    'Présenter l\'assurance-vie comme supprimant définitivement les prélèvements sociaux.',
    'Comparer France et Europe sans partir de la même base nette fiscale.',
  ],
  practicalCases: [
    {
      title: 'Revenu foncier au régime réel',
      text: 'La simulation part du revenu foncier net après charges admises. Les prélèvements sociaux sont calculés sur cette base fiscale, puis l\'impôt sur le revenu est intégré selon la situation du foyer.',
    },
    {
      title: 'Micro-foncier',
      text: 'Lorsque le régime micro-foncier est applicable, la base imposable tient compte de l\'abattement légal. Le calcul ne part donc pas du montant brut avant abattement.',
    },
    {
      title: 'Revenus étrangers',
      text: 'Avant de chiffrer le net, la simulation vérifie le pays, le mécanisme conventionnel et le traitement des prélèvements sociaux plutôt que d\'appliquer zéro par défaut.',
    },
    {
      title: 'Assurance-vie',
      text: 'Les distributions de la SCPI restent dans le contrat et ne sont pas taxées chaque année comme des revenus fonciers chez le souscripteur. La fiscalité et les prélèvements sociaux sont analysés au niveau du contrat et du rachat.',
    },
    {
      title: 'Nue-propriété',
      text: 'Le nu-propriétaire ne reçoit pas le revenu attribué à l\'usufruitier pendant la période ; il n\'y a donc pas de prélèvements sociaux à calculer chez lui sur ce flux inexistant.',
    },
  ],
  methodParagraphs: [
    'Identifier la nature et le pays d\'origine du revenu.',
    'Déterminer la base nette imposable selon le régime fiscal applicable.',
    'Vérifier le taux légal de prélèvements sociaux pour l\'année concernée.',
    'Appliquer séparément l\'impôt sur le revenu et les prélèvements sociaux au lieu d\'utiliser un taux global approximatif.',
    'Pour les revenus étrangers, vérifier la convention et les règles françaises applicables.',
    'Pour l\'assurance-vie ou le démembrement, analyser le flux taxable propre au mode de détention.',
    'Comparer ensuite les rendements nets sur des bases homogènes.',
  ],
  conclusionParagraphs: [
    'Les prélèvements sociaux sont importants dans la fiscalité des revenus fonciers français, mais leur impact ne se calcule pas correctement à partir du seul rendement brut de la SCPI.',
    'La base nette imposable, la nature du revenu et le mode de détention doivent être identifiés avant toute simulation.',
    'Pour les revenus étrangers, l\'absence de règle uniforme impose une vérification pays par pays.',
  ],
  faqItems: [
    {
      question: 'Quel est le taux des prélèvements sociaux sur les revenus fonciers ?',
      answer: 'En 2026, impots.gouv.fr indique un taux global de 17,2 % pour les revenus d\'une location nue relevant des revenus fonciers. Le taux doit être vérifié pour l\'année concernée.',
    },
    {
      question: 'Sur quelle base sont-ils calculés ?',
      answer: 'Sur le revenu net imposable : après abattement au micro-foncier ou après déduction des charges admises au régime réel.',
    },
    {
      question: 'Peut-on simplement ajouter 17,2 % à la TMI ?',
      answer: 'C\'est une approximation marginale qui ne tient pas compte du taux moyen, des charges, de la CSG déductible ni de la nature exacte des revenus.',
    },
    {
      question: 'Les revenus étrangers sont-ils exonérés ?',
      answer: 'Pas automatiquement. Le traitement doit être vérifié selon le pays, la convention et la situation du contribuable.',
    },
    {
      question: 'L\'assurance-vie change-t-elle le traitement ?',
      answer: 'Oui. Les distributions de la SCPI ne sont pas imposées annuellement comme revenus fonciers chez le souscripteur ; les gains du contrat suivent les règles propres à l\'assurance-vie.',
    },
    {
      question: 'Le démembrement évite-t-il les prélèvements sociaux ?',
      answer: 'Le nu-propriétaire ne reçoit pas les distributions de la période et n\'a donc pas de prélèvements sociaux à acquitter sur ce flux. Les autres aspects fiscaux doivent être analysés séparément.',
    },
    {
      question: 'Comment MaximusSCPI les intègre-t-il ?',
      answer: 'MaximusSCPI part de la base fiscale nette correspondant au type de revenu et évite d\'appliquer un taux forfaitaire identique à tous les scénarios.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI avec l\'impact des prélèvements sociaux',
}
