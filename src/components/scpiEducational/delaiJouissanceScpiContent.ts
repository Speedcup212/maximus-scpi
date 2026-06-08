import type { ScpiEducationalPageConfig } from './shared'

export const delaiJouissanceScpiConfig: ScpiEducationalPageConfig = {
  path: '/delai-jouissance-scpi',
  badge: 'Impact sur le rendement',
  h1: 'Délai de jouissance SCPI : impact réel sur le rendement',
  heroSubtitle:
    'Le délai de jouissance est souvent sous-estimé par les investisseurs. Il correspond à la période entre la souscription et le premier versement de revenus. Ce délai impacte le rendement réel de la première année et doit être comparé entre SCPI.',
  seoTitle: 'Délai de jouissance SCPI : comprendre son impact sur les revenus',
  seoDescription:
    'Comprenez le délai de jouissance d\'une SCPI, son effet sur les premiers revenus, le rendement réel la première année et les critères à comparer avant d\'investir.',
  shortAnswerTitle: 'Qu\'est-ce que le délai de jouissance et pourquoi est-ce important ?',
  shortAnswer:
    'Le délai de jouissance est la période entre la date de souscription des parts et la date à laquelle l\'investisseur commence à percevoir les revenus. Pendant cette période, les loyers perçus par la SCPI ne sont pas reversés au nouvel associé. Ce délai varie selon les SCPI : il peut être de quelques jours (jouissance rapide) ou de plusieurs mois (1er jour du trimestre suivant, ou du 4e, 5e, 6e mois). Il réduit mécaniquement le rendement de la première année et doit être intégré dans la comparaison entre SCPI.',
  keyMessage:
    'Le délai de jouissance ne change pas la qualité d\'une SCPI, mais il modifie le rendement réellement perçu au début de l\'investissement.',
  definitionParagraphs: [
    'La date de jouissance est la date à laquelle l\'investisseur devient éligible aux revenus distribués par la SCPI. Avant cette date, les loyers perçus sur les parts souscrites sont attribués au vendeur ou à la société de gestion selon le fonctionnement.',
    'Le délai de jouissance est exprimé en jours ou en mois à compter de la souscription. Certaines SCPI offrent une jouissance rapide (1er jour du mois suivant), d\'autres une jouissance au 1er jour du 4e mois suivant la souscription, voire plus.',
    'L\'impact du délai de jouissance est double : d\'une part, l\'investisseur ne perçoit pas les revenus pendant cette période ; d\'autre part, le rendement réel de la première année est mécaniquement inférieur au TDVM affiché.',
    'À titre d\'exemple pédagogique, pour un investissement de 100 000 € avec un taux de distribution théorique de 5 % et un délai de jouissance de 5 mois, les revenus de la première année seront réduits d\'environ 5/12, soit un rendement net de première année inférieur au taux affiché. Ce chiffre est une simulation indicative, pas une promesse de rendement.',
    'Le délai de jouissance n\'est pas un critère de qualité de la SCPI, mais un élément pratique à intégrer dans la comparaison. Une SCPI avec un délai court peut sembler plus attractive, mais le TOF, la capitalisation, l\'endettement et le rendement restent des critères plus déterminants.',
    'En assurance-vie, le délai de jouissance peut différer selon le contrat et la date de valorisation des UC. Il est généralement plus court qu\'en direct, mais les frais UC et le taux de reversement doivent être analysés en parallèle.',
  ],
  tableTitle: 'Délai de jouissance : impact sur la première année',
  tableRows: [
    {
      level: 'Jouissance rapide (1er jour M+1)',
      advantage:
        'Délai minimal, les premiers revenus arrivent rapidement. Impact faible sur le rendement de première année.',
      vigilance:
        'Vérifier les conditions précises de date de valeur. Peut varier selon le calendrier de souscription.',
    },
    {
      level: '1er jour du 4e mois',
      advantage:
        'Délai standard sur le marché. Environ 3 mois sans revenus.',
      vigilance:
        'Le rendement de première année est réduit d\'environ 1/4 par rapport au TDVM.',
    },
    {
      level: '1er jour du 5e ou 6e mois',
      advantage:
        'Délai plus long. Impact plus marqué sur le rendement de première année.',
      vigilance:
        'Comparer avec d\'autres SCPI. Sur un horizon long, l\'impact s\'amortit.',
    },
    {
      level: 'Investissement à crédit',
      advantage:
        'Les intérêts d\'emprunt courent dès le déblocage des fonds, avant la perception des premiers revenus.',
      vigilance:
        'L\'impact du délai de jouissance est amplifié par le coût du crédit. Simuler le cash-flow de première année.',
    },
    {
      level: 'Besoin de revenus immédiats',
      advantage:
        'Privilégier les SCPI avec un délai de jouissance court ou un investissement programmé.',
      vigilance:
        'Le délai de jouissance ne doit pas être le critère unique, mais il compte en cas de besoin de revenus rapides.',
    },
  ],
  tableNote:
    'Ces repères sont des simulations indicatives. L\'impact exact dépend du montant investi, du TDVM et du calendrier de souscription.',
  criteriaTitle: 'Critères à croiser avec le délai de jouissance',
  criteriaCards: [
    { title: 'Rendement (TDVM)', text: 'Comparer le TDVM et le délai de jouissance ensemble. Un TDVM plus élevé peut compenser un délai plus long sur un horizon long.' },
    { title: 'TOF', text: 'Un bon TOF garantit une meilleure régularité des revenus une fois la jouissance acquise.' },
    { title: 'Frais de souscription', text: 'Des frais élevés combinés à un délai long réduisent le rendement net de première année.' },
    { title: 'Capitalisation', text: 'La taille de la SCPI n\'a pas d\'impact direct sur le délai de jouissance, mais influence la régularité des distributions.' },
    { title: 'Horizon', text: 'Plus l\'horizon est long, plus l\'impact du délai de jouissance s\'amortit. Sur 10-15 ans, la différence est faible.' },
    { title: 'Mode de détention', text: 'En assurance-vie, le délai peut être différent. Vérifier la date de jouissance dans le contrat.' },
  ],
  commonErrors: [
    'Oublier d\'intégrer le délai de jouissance dans le calcul du rendement de première année.',
    'Comparer deux SCPI uniquement sur leur TDVM sans tenir compte du délai de jouissance.',
    'Sous-estimer l\'impact du délai en cas d\'investissement à crédit.',
    'Choisir une SCPI uniquement parce que son délai de jouissance est court.',
    'Ignorer le délai de jouissance en assurance-vie.',
  ],
  practicalCases: [
    {
      title: 'SCPI A — délai court, TDVM 4,5 %',
      text: 'Une SCPI avec jouissance au 1er jour du mois suivant et un TDVM de 4,5 % offre un rendement perçu la première année proche du taux affiché. Simulation pédagogique : un investisseur souscrivant en début de mois perçoit ses premiers revenus à la fin du trimestre suivant.',
    },
    {
      title: 'SCPI B — délai 5 mois, TDVM 5,5 %',
      text: 'Investissement de 100 000 €, TDVM 5,5 %, délai de jouissance de 5 mois. Les premiers revenus sont perçus au 6e mois. Le rendement réel de la première année est inférieur au TDVM. Simulation pédagogique : la différence s\'estompe sur un horizon de 10 ans.',
    },
    {
      title: 'SCPI C — achat à crédit, délai long',
      text: 'Un investisseur finance l\'achat à crédit avec un taux à 3,5 %. Le délai de jouissance de 4 mois retarde les premiers revenus, tandis que les intérêts courent dès le déblocage. Simulation pédagogique : le cash-flow de première année est négatif.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI intègre le délai de jouissance comme un critère pratique de comparaison entre SCPI. Il est mentionné dans les contenus pédagogiques pour permettre une lecture complète.',
    'La première étape consiste à identifier le délai de jouissance dans la documentation de la SCPI (note d\'information, bulletin trimestriel).',
    'La deuxième étape intègre ce délai dans une simulation indicative de rendement de première année, sans promesse de résultat.',
    'La troisième étape compare le délai avec les autres critères : TDVM, TOF, frais, capitalisation, pour une pré-orientation équilibrée.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. Un échange avec le Cabinet Eric Bellaiche permet d\'affiner la simulation selon votre situation.',
  ],
  conclusionParagraphs: [
    'Le délai de jouissance est un critère souvent sous-estimé mais impactant, surtout en première année et en cas d\'investissement à crédit. Il doit être intégré dans la comparaison des SCPI.',
    'Utilisez le comparateur MaximusSCPI pour identifier les SCPI, puis validez votre analyse avec un conseiller pour une simulation adaptée à votre calendrier de souscription.',
  ],
  faqItems: [
    {
      question: 'Qu\'est-ce que le délai de jouissance d\'une SCPI ?',
      answer: 'C\'est la période entre la souscription des parts et le début de la perception des revenus. Avant cette date, les loyers perçus ne sont pas reversés au nouvel associé.',
    },
    {
      question: 'Quand commence-t-on à percevoir les revenus ?',
      answer: 'Cela dépend de la SCPI. Certaines offrent une jouissance rapide (1er jour du mois suivant), d\'autres au 1er jour du 4e, 5e ou 6e mois après la souscription.',
    },
    {
      question: 'Quel impact sur le rendement ?',
      answer: 'Le rendement de première année est mécaniquement réduit par l\'absence de revenus pendant la période de non-jouissance. Plus le délai est long, plus l\'écart est important.',
    },
    {
      question: 'Un délai court est-il toujours préférable ?',
      answer: 'Pas nécessairement. Un délai plus long peut être compensé par un meilleur TDVM, un TOF plus élevé ou une meilleure qualité patrimoniale. L\'analyse doit être globale.',
    },
    {
      question: 'Comment comparer deux SCPI avec des délais différents ?',
      answer: 'Calculer le rendement théorique de première année en déduisant les mois sans revenus. La comparaison sur 5-10 ans s\'affranchit progressivement de ce biais.',
    },
    {
      question: 'Le délai de jouissance existe-t-il en assurance-vie ?',
      answer: 'Oui, le contrat peut prévoir une date de jouissance spécifique pour les UC. Vérifier les conditions générales du contrat.',
    },
    {
      question: 'Quel impact avec un achat à crédit ?',
      answer: 'Les intérêts d\'emprunt courent avant la perception des premiers revenus, ce qui amplifie l\'impact du délai de jouissance sur le cash-flow de première année.',
    },
    {
      question: 'Comment MaximusSCPI prend en compte le délai de jouissance ?',
      answer: 'Le délai de jouissance est intégré dans les contenus pédagogiques comme critère pratique de comparaison, sans constituer une recommandation.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI',
}
