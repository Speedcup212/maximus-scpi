import type { ScpiEducationalPageConfig } from './shared'

export const tmi41ScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-tmi-41/',
  badge: 'Fiscalité SCPI',
  h1: 'SCPI avec TMI 41 % : fiscalité, rendement net et arbitrages',
  heroSubtitle:
    'À 41 % de tranche marginale d\'imposition, la fiscalité devient un facteur déterminant dans l\'analyse du rendement net d\'une SCPI. Cette page explore les pistes à étudier sans constituer une recommandation personnalisée.',
  seoTitle: 'SCPI TMI 41 % : fiscalité, Europe, démembrement et rendement net',
  seoDescription:
    'Comprenez les critères d\'analyse des SCPI avec une TMI à 41 % : rendement net, fiscalité des revenus fonciers, SCPI européennes, démembrement, assurance-vie et SCI à l\'IS.',
  shortAnswerTitle: 'Pourquoi la TMI 41 % change-t-elle l\'analyse ?',
  shortAnswer:
    'Avec une TMI à 41 %, un revenu foncier de SCPI française est imposé à hauteur de 41 % au titre de l\'IR, auxquels s\'ajoutent les prélèvements sociaux. Le rendement net fiscal peut être très inférieur au rendement brut affiché. Cela ne signifie pas qu\'il faut renoncer aux SCPI, mais que l\'analyse doit intégrer la fiscalité comme critère central.',
  keyMessage:
    'À TMI 41 %, le choix d\'une SCPI doit intégrer le rendement net fiscal, pas seulement le rendement affiché.',
  definitionParagraphs: [
    'La tranche marginale d\'imposition (TMI) est le taux auquel est imposé le dernier euro de revenu d\'un foyer fiscal. En 2026, la TMI à 41 % concerne les revenus compris entre environ 80 000 € et 180 000 € pour une part de quotient familial.',
    'Les revenus fonciers issus de SCPI françaises s\'ajoutent aux autres revenus du foyer et sont imposés à la TMI correspondante. À 41 %, l\'impôt sur le revenu seul prélève 41 % des revenus fonciers perçus, avant prélèvements sociaux.',
    'Les prélèvements sociaux (au taux en vigueur) s\'ajoutent à l\'IR. Le cumul IR + PS peut représenter une part significative des revenus distribués par une SCPI française.',
    'Plusieurs pistes peuvent être étudiées pour améliorer le rendement net : SCPI européennes (crédit d\'impôt, PS réduits), démembrement (neutralisation temporaire), assurance-vie (capitalisation, fiscalité allégée au rachat), SCI à l\'IS (imposition société), ou investissement à crédit (déduction des intérêts).',
  ],
  tableTitle: 'Options potentielles avec une TMI 41 %',
  tableRows: [
    {
      level: 'SCPI françaises en direct',
      advantage: 'Simplicité. Accès à un large choix de SCPI. Frais limités.',
      vigilance: 'Rendement net fortement réduit par IR + PS. À évaluer selon l\'objectif de rendement.',
    },
    {
      level: 'SCPI européennes',
      advantage: 'Crédit d\'impôt possible. Prélèvements sociaux potentiellement réduits ou supprimés. Amélioration du rendement net.',
      vigilance: 'Fiscalité variable selon pays. Documentation à vérifier. Risque de change ou géopolitique.',
    },
    {
      level: 'Nue-propriété',
      advantage: 'Absence de revenus imposables pendant la durée du démembrement. Fiscalité neutralisée.',
      vigilance: 'Pas de revenus pendant la période. Horizon long. Décote à analyser.',
    },
    {
      level: 'Assurance-vie',
      advantage: 'Capitalisation des revenus. Fiscalité allégée après 8 ans. Transmission avantageuse.',
      vigilance: 'Frais du contrat. Choix limité de SCPI. Pas de déduction d\'intérêts d\'emprunt.',
    },
    {
      level: 'SCI à l\'IS',
      advantage: 'Imposition à l\'IS. Capitalisation possible. Amortissement comptable.',
      vigilance: 'Double imposition lors de la distribution. Frais comptables et juridiques. Complexité.',
    },
    {
      level: 'Crédit',
      advantage: 'Déduction des intérêts d\'emprunt des revenus fonciers. Effet de levier.',
      vigilance: 'Cash-flow à analyser. Endettement. Risque de taux.',
    },
  ],
  tableNote:
    'Chaque option dépend de la situation individuelle, de l\'horizon et des objectifs patrimoniaux. Aucune n\'est universellement meilleure.',
  criteriaTitle: 'Critères à croiser avec la TMI 41 %',
  criteriaCards: [
    { title: 'Rendement net fiscal', text: 'Le rendement brut doit être retraité de l\'IR et des PS. L\'écart peut être significatif à TMI 41 %.' },
    { title: 'Besoin de revenus', text: 'Avec besoin de revenus, l\'assurance-vie ou le direct sont à étudier. Sans besoin, la capitalisation ou la nue-propriété peuvent être pertinentes.' },
    { title: 'Horizon', text: 'Un horizon long (> 10 ans) peut justifier des solutions à fiscalité différée (AV, nue-propriété, SCI à l\'IS).' },
    { title: 'Origine des revenus', text: 'Les SCPI européennes peuvent améliorer le rendement net grâce au crédit d\'impôt et à une fiscalité allégée.' },
    { title: 'IFI', text: 'À vérifier selon le patrimoine global et le mode de détention. Certaines solutions (AV, nue-propriété) peuvent avoir un traitement IFI différent.' },
    { title: 'Transmission', text: 'L\'assurance-vie et la SCI à l\'IS peuvent présenter des avantages en matière de transmission, à étudier selon la situation.' },
  ],
  commonErrors: [
    'Se focaliser uniquement sur le rendement brut en ignorant l\'impact fiscal.',
    'Croire que les SCPI européennes sont toujours fiscalement meilleures : cela dépend des conventions et de la situation.',
    'Penser que l\'assurance-vie annule toute fiscalité : les plus-values sont imposées en cas de rachat.',
    'Négliger l\'impact des frais de structure (AV, SCI) dans l\'analyse globale.',
    'Oublier l\'IFI dans l\'analyse patrimoniale globale.',
  ],
  practicalCases: [
    {
      title: 'Direct TMI 41 % avec rendement brut à 6 %',
      text: 'Rendement brut : 6 %. Après IR à 41 % et PS, le rendement net fiscal peut être estimé autour de 3,2 % selon les hypothèses retenues. L\'investisseur conserve environ 53 % du rendement brut.',
    },
    {
      title: 'SCPI européenne TMI 41 %',
      text: 'Rendement brut : 6 %. Avec crédit d\'impôt et PS réduits, le rendement net fiscal peut être estimé autour de 4,5 % à 5 % selon les hypothèses. L\'écart avec une SCPI française peut être significatif.',
    },
    {
      title: 'Nue-propriété TMI 41 % sans besoin de revenus',
      text: 'Un investisseur sans besoin de revenus acquiert des parts en nue-propriété pour 10 ans. Aucun revenu imposable pendant la durée. À l\'issue, il récupère la pleine propriété sans fiscalité sur la reconstitution.',
    },
  ],
  methodParagraphs: [
    'Analyser le rendement brut affiché (TDVM ou taux de distribution sur VR).',
    'Calculer le rendement net fiscal estimé : rendement brut − IR (TMI) − prélèvements sociaux.',
    'Déterminer l\'origine des revenus (France / étranger) et le cadre fiscal applicable.',
    'Étudier les pistes d\'amélioration : SCPI européennes, démembrement, assurance-vie, SCI à l\'IS.',
    'Intégrer l\'horizon, le besoin de revenus et l\'objectif patrimonial.',
    'Ne pas conclure sur la seule base du rendement brut.',
  ],
  conclusionParagraphs: [
    'À TMI 41 %, la fiscalité est un critère central dans le choix d\'une SCPI, mais elle ne doit pas être le seul facteur. Le rendement net, l\'horizon, le besoin de revenus, l\'IFI et les objectifs de transmission doivent être analysés ensemble.',
    'Plusieurs pistes existent pour améliorer le rendement net, mais aucune n\'est universellement adaptée. Chaque situation mérite une analyse personnalisée.',
  ],
  faqItems: [
    {
      question: 'Les SCPI sont-elles adaptées à une TMI 41 % ?',
      answer: 'Oui, mais l\'analyse doit intégrer le rendement net fiscal. Le rendement brut peut être réduit d\'environ 45 à 50 % par l\'IR et les PS. Les SCPI européennes, le démembrement, l\'assurance-vie ou la SCI à l\'IS sont des pistes à étudier selon la situation.',
    },
    {
      question: 'Pourquoi la fiscalité pèse-t-elle fortement ?',
      answer: 'À 41 % de TMI, le cumul IR + prélèvements sociaux peut représenter une part importante des revenus fonciers perçus. Le rendement net fiscal est donc significativement réduit par rapport au rendement brut.',
    },
    {
      question: 'Faut-il privilégier les SCPI européennes ?',
      answer: 'Les SCPI européennes peuvent améliorer le rendement net grâce au crédit d\'impôt et à une fiscalité allégée. C\'est une piste à approfondir, mais pas une recommandation automatique.',
    },
    {
      question: 'Le démembrement est-il pertinent ?',
      answer: 'Le démembrement (nue-propriété) peut être pertinent pour un investisseur sans besoin de revenus immédiats. Il neutralise la fiscalité pendant la période de démembrement. L\'horizon et la décote doivent être analysés.',
    },
    {
      question: 'L\'assurance-vie peut-elle améliorer le cadre fiscal ?',
      answer: 'L\'assurance-vie permet de capitaliser les revenus sans imposition immédiate. La fiscalité n\'intervient qu\'en cas de rachat. C\'est une piste pour les investisseurs sans besoin de revenus immédiats.',
    },
    {
      question: 'Une SCI à l\'IS est-elle une piste ?',
      answer: 'Une SCI à l\'IS peut permettre une capitalisation des revenus à l\'IS et un amortissement comptable. Ce montage ajoute une couche fiscale, comptable et juridique qui doit être justifiée par l\'objectif patrimonial.',
    },
    {
      question: 'Quel impact sur l\'IFI ?',
      answer: 'Les parts de SCPI détenues en direct sont généralement imposables à l\'IFI. En assurance-vie ou en nue-propriété, le traitement peut différer. À vérifier selon la situation patrimoniale.',
    },
    {
      question: 'Comment MaximusSCPI analyse une TMI 41 % ?',
      answer: 'MaximusSCPI analyse le rendement brut et estime le rendement net fiscal selon la TMI et le mode de détention. L\'approche est pédagogique et ne constitue pas un conseil personnalisé.',
    },
  ],
}
