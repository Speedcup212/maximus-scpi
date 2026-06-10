import type { ScpiEducationalPageConfig } from './shared'

export const scpiCreditConfig: ScpiEducationalPageConfig = {
  path: '/scpi-credit',
  badge: 'Financement',
  h1: 'SCPI à crédit : effet de levier, fiscalité et risques à analyser',
  heroSubtitle:
    "Financer l'achat de parts de SCPI par un crédit immobilier permet de potentiellement amplifier l'investissement, mais expose à plusieurs risques : taux, revenus non garantis, liquidité. L'effet de levier dépend du rendement net, du taux d'emprunt et de la fiscalité.",
  seoTitle: 'SCPI à crédit : financement, fiscalité, cash-flow et risques',
  seoDescription:
    "Comprenez l'investissement en SCPI à crédit : effet de levier, intérêts d'emprunt, fiscalité, cash-flow, risque de taux, revenus non garantis et points de vigilance.",
  shortAnswerTitle: "Pourquoi financer des SCPI à crédit ?",
  shortAnswer:
    "Financer l'achat de parts de SCPI par un crédit immobilier permet d'acquérir davantage de parts sans mobiliser la totalité du capital. Les loyers perçus servent à rembourser les échéances, et les intérêts d'emprunt sont déductibles des revenus fonciers, ce qui peut réduire l'impôt. L'effet de levier amplifie le rendement potentiel lorsque le taux de rendement de la SCPI est supérieur au coût du crédit. Mais il amplifie aussi les risques : les loyers ne sont pas garantis, le taux d'emprunt peut varier (crédit à taux variable ou révisable), et la revente des parts peut prendre plusieurs mois. L'opération doit être analysée en termes de cash-flow net de fiscalité, de capacité d'endettement et d'horizon.",
  keyMessage:
    "Le crédit peut amplifier l'investissement en SCPI, mais il amplifie aussi l'exigence de cohérence entre revenus, fiscalité, mensualité et horizon.",
  definitionParagraphs: [
    "Le crédit immobilier appliqué aux SCPI fonctionne comme un prêt classique : la banque prête un capital que l'emprunteur rembourse mensuellement sur une durée déterminée (10 à 20 ans généralement). Les fonds empruntés servent à souscrire des parts de SCPI, dont les loyers perçus viennent en déduction des échéances de remboursement.",
    "L'effet de levier est le mécanisme central : si le rendement net moyen des SCPI (après frais de gestion et fiscalité) est supérieur au taux d'intérêt moyen du crédit (après prise en compte de la déductibilité des intérêts), l'opération génère un gain supplémentaire par rapport à un achat au comptant. À l'inverse, si le rendement net devient inférieur au coût du crédit, l'effet de levier devient négatif.",
    "Les intérêts d'emprunt sont déductibles des revenus fonciers dans la catégorie des revenus fonciers au même titre que les autres charges (frais de gestion, travaux, etc.). Cette déductibilité réduit l'assiette imposable et donc l'impôt dû, ce qui améliore le cash-flow net mensuel.",
    "Le cash-flow mensuel est la différence entre les loyers perçus (nets de frais de gestion SCPI) et l'échéance de crédit (hors assurance emprunteur et frais de dossier). Un cash-flow positif signifie que les loyers couvrent la mensualité ; un cash-flow négatif impose un apport personnel complémentaire chaque mois.",
    "Le risque de taux est réel, particulièrement pour les crédits à taux variable ou révisable. Une hausse des taux peut augmenter significativement la mensualité et dégrader le cash-flow. Les crédits à taux fixe sécurisent la mensualité mais sont généralement plus élevés à l'origine.",
    "La liquidité des SCPI est un risque majeur dans un montage à crédit : si l'investisseur doit revendre ses parts pour rembourser le crédit, le délai de cession sur le marché secondaire peut atteindre 2 à 12 mois selon les SCPI et le contexte de marché. Pendant cette période, les échéances de crédit restent dues.",
    "Exemple chiffré théorique : pour un investissement de 100 000 € de SCPI financé à crédit sur 15 ans à un taux fixe de 3,5 % (hors assurance), la mensualité s'élève à environ 715 €. Avec un rendement brut moyen de 5 % (5 000 € par an, soit 417 € par mois), le cash-flow mensuel est négatif d'environ 298 € avant fiscalité. Après déduction des intérêts d'emprunt (environ 3 200 € la première année) et économie d'impôt selon la TMI, le cash-flow net peut devenir moins négatif, voire positif selon le taux marginal d'imposition. Simulation pédagogique simplifiée, hors frais de souscription (8-12 %), hors assurance emprunteur, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.",
    "La capacité d'endettement de l'investisseur est un préalable : le taux d'endettement (échéance rapportée aux revenus) ne doit pas dépasser les critères bancaires (généralement 33 % à 35 % des revenus nets). Les loyers SCPI peuvent être pris en compte en quotient (70 % à 80 % de leur montant) par certaines banques.",
    "Le démembrement temporaire peut être combiné avec un crédit : l'acquéreur de nue-propriété ne perçoit pas de loyers pendant la durée du démembrement, ce qui rend le crédit difficile à rembourser sans revenus. Cette configuration est déconseillée sauf pour des profils très spécifiques avec capacité de remboursement sans recours aux loyers.",
    "L'assurance emprunteur est obligatoire pour un crédit immobilier. Son coût (0,2 % à 0,5 % du capital emprunté par an) doit être intégré dans l'analyse de rentabilité globale de l'opération.",
  ],
  tableTitle: 'Variable / Impact sur le projet / Vigilance',
  tableRows: [
    {
      level: "Taux d'emprunt",
      advantage:
        'Déterminant du coût du crédit. Un taux bas améliore le cash-flow. La déductibilité des intérêts réduit le coût réel après fiscalité.',
      vigilance:
        'Comparer taux fixe, révisable et variable. Un taux bas initial peut masquer des risques de hausse. Le TAEG inclut assurance et frais de dossier.',
    },
    {
      level: 'Durée du crédit',
      advantage:
        "Une durée longue (15-20 ans) réduit la mensualité et améliore le cash-flow apparent. L'effet de levier joue sur une période étendue.",
      vigilance:
        "Une durée longue augmente le coût total du crédit (intérêts totaux plus élevés). L'horizon doit rester compatible avec la liquidité des SCPI.",
    },
    {
      level: 'Rendement SCPI',
      advantage:
        'Un rendement brut élevé (TDVM > 5 %) améliore la marge entre loyers et mensualité. Le rendement net après frais de gestion est le bon indicateur.',
      vigilance:
        'Le rendement passé ne préjuge pas du rendement futur. Un TDVM élevé peut cacher un risque locatif accru (secteur volatil, TOF bas, endettement élevé).',
    },
    {
      level: 'Fiscalité (TMI)',
      advantage:
        "La déductibilité des intérêts d'emprunt des revenus fonciers est d'autant plus valorisable que la TMI est élevée. Un investisseur à 41 % ou 45 % peut améliorer significativement son cash-flow net.",
      vigilance:
        "La fiscalité seule ne justifie pas l'opération. Le rendement net après impôt reste tributaire de la qualité de la SCPI et du coût du crédit.",
    },
    {
      level: 'Cash-flow',
      advantage:
        'Un cash-flow positif signifie que les loyers couvrent la mensualité. L\'opération est alors "autoportante".',
      vigilance:
        'Un cash-flow négatif nécessite un apport personnel mensuel. Il peut devenir positif après économie d\'impôt selon la TMI. Le cash-flow n\'est pas garanti dans le temps.',
    },
  ],
  tableNote:
    "Ce tableau est une synthèse pédagogique. Les impacts réels dépendent du taux négocié, de la SCPI sélectionnée, de la TMI de l'investisseur et des conditions bancaires.",
  criteriaTitle: "Critères à croiser pour un projet SCPI à crédit",
  criteriaCards: [
    { title: 'Coût réel du crédit (TAEG)', text: "Le TAEG inclut le taux nominal, l'assurance emprunteur et les frais de dossier. C'est le coût complet à comparer au rendement net espéré de la SCPI." },
    { title: "Taux de rendement net de la SCPI", text: 'Le TDVM brut doit être réduit des frais de gestion (10-12 % des loyers). Le rendement net de frais de gestion est le bon référentiel pour comparer au coût du crédit.' },
    { title: 'Cash-flow après fiscalité', text: "Simuler le cash-flow mensuel net après déduction des intérêts et économie d'impôt. Un cash-flow négatif avant fiscalité peut devenir positif selon la TMI." },
    { title: 'Liquidité et horizon', text: 'La durée du crédit doit être cohérente avec le délai de revente des parts. Un crédit sur 15 ans impose de pouvoir conserver les parts au moins 15 ans, sauf à rembourser par anticipation.' },
    { title: 'Capacité d\'endettement', text: 'Le taux d\'endettement (mensualité / revenus) ne doit pas dépasser 33-35 %. Les banques intègrent les loyers SCPI avec une décote de 20-30 %.' },
    { title: 'Risque de taux', text: 'Un crédit à taux variable expose à une hausse des mensualités. Préférer un taux fixe quand les taux sont bas, ou un taux révisable plafonné avec vigilance.' },
    { title: 'Frais de souscription', text: 'Les frais de souscription des SCPI (8-12 %) réduisent le capital investi net. L\'effet de levier doit intégrer ce coût initial dans le calcul de rentabilité globale.' },
    { title: 'Horizon de détention', text: 'Un crédit suppose un horizon long (10-20 ans). Un investisseur proche de la retraite doit vérifier que les mensualités restent soutenables après la baisse de revenus éventuelle.' },
  ],
  commonErrors: [
    "Confondre rendement brut de la SCPI et rendement net après fiscalité et frais de gestion.",
    "Ne pas intégrer les frais de souscription (8-12 %) dans le calcul de rentabilité globale du montage à crédit.",
    'Oublier que les loyers ne sont pas garantis : une baisse des distributions peut transformer un cash-flow positif en cash-flow négatif.',
    "Ignorer le risque de liquidité : si les parts ne peuvent pas être revendues rapidement, l'investisseur reste engagé sur le crédit.",
    "Considérer que l'économie d'impôt compense mécaniquement un cash-flow négatif sans analyser la TMI réelle et le montant des intérêts déductibles.",
    "Sous-estimer l'impact de l'assurance emprunteur sur le coût total du crédit (0,2 % à 0,5 % du capital par an).",
    "Croire qu'un crédit à taux variable est toujours plus avantageux qu'un taux fixe sur la durée totale sans scénario de hausse des taux.",
    "Ne pas vérifier la capacité de la banque à financer des SCPI (certains établissements ne financent pas ce type d'actif ou appliquent des conditions spécifiques).",
  ],
  practicalCases: [
    {
      title: 'Hausse des taux et effet de levier inversé',
      text: 'Un investisseur emprunte à taux variable pour financer 100 000 € de SCPI. Simulation pédagogique : si les taux passent de 3 % à 5 %, la mensualité augmente significativement. Le rendement net de la SCPI peut devenir inférieur au coût du crédit, générant un effet de levier négatif. Simulation non contractuelle.',
    },
    {
      title: 'Baisse des distributions et cash-flow tendu',
      text: 'Un investisseur a monté un crédit sur la base d\'un rendement SCPI de 5 %. Simulation pédagogique : si la SCPI réduit sa distribution à 3,5 % (baisse de taux d\'occupation, travaux), les revenus ne couvrent plus les mensualités. L\'effort d\'épargne augmente ou le crédit doit être renégocié. Simulation non contractuelle.',
    },
    {
      title: 'Revente impossible et mensualités qui courent',
      text: 'Un investisseur doit revendre ses parts pour rembourser son crédit. Simulation pédagogique : le délai de revente peut atteindre 6 à 12 mois. Pendant cette période, les mensualités restent dues. Si les parts sont cédées avec une décote, la perte en capital s\'ajoute au coût du crédit. Simulation non contractuelle.',
    },
    {
      title: 'Investisseur TMI 30 % — Crédit de 100 000 € sur 15 ans',
      text: "Hypothèses théoriques : souscription de 100 000 € de parts de SCPI (frais inclus). Rendement brut : 5 % (5 000 €/an). Crédit à 3,5 % fixe sur 15 ans : mensualité de 715 € (hors assurance). Intérêts première année : environ 3 200 €. Économie d'impôt TMI 30 % : 960 €. Loyers nets de frais de gestion : environ 4 400 €/an (367 €/mois). Cash-flow mensuel net après économie d'impôt : environ -268 €. Le projet nécessite un apport mensuel complémentaire. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.",
    },
    {
      title: 'Investisseur TMI 41 % — Même montage',
      text: "Mêmes hypothèses : 100 000 € de SCPI, crédit 3,5 % sur 15 ans, rendement brut 5 %. Intérêts première année : 3 200 €. Économie d'impôt à 41 % : 1 312 €. Cash-flow après fiscalité : environ -230 €/mois. L'économie d'impôt plus élevée améliore le cash-flow net par rapport à la TMI 30 %, mais ne le rend pas nécessairement positif. La différence entre TMI 30 % et 41 % est d'environ 38 € par mois la première année, soit 456 € sur un an. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.",
    },
    {
      title: 'Investisseur avec horizon court (7 ans)',
      text: "Hypothèses : souscription de 50 000 € de SCPI, crédit sur 10 ans à 3,2 %, rendement brut 4,5 %. Mensualité : 488 €/mois. Loyers nets : 206 €/mois. Cash-flow mensuel net avant fiscalité : -282 €. L'investisseur prévoit de revendre les parts dans 7 ans pour rembourser le capital restant dû. Le risque de moins-value à la revente et le délai de cession sont des facteurs critiques. L'horizon court réduit l'intérêt potentiel du crédit et augmente le risque de sortie. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.",
    },
    {
      title: "Investisseur avec capacité d'endettement limitée",
      text: "Hypothèses : revenus mensuels nets de 3 500 €, capacité d'endettement maximale de 1 167 € (33 %). Projet : souscription de 60 000 € de SCPI, crédit sur 20 ans à 3,6 %, mensualité de 351 €. Le taux d'endettement sans loyers est de 10 %. Avec prise en compte des loyers à 80 % (240 €/mois x 0,8 = 192 €), l'endettement net est de 159 €, soit 4,5 % des revenus. Le projet est compatible avec la capacité d'endettement. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.",
    },
  ],
  methodParagraphs: [
    "MaximusSCPI compare les SCPI selon leurs indicateurs clés. Pour un projet à crédit, l'analyse doit intégrer le taux d'emprunt, la durée, le rendement net de la SCPI, la fiscalité de l'investisseur et le cash-flow résultant.",
    "La première étape consiste à sélectionner plusieurs SCPI dans le comparateur et à relever leur TDVM, leur TOF, leur capitalisation et leur endettement. Ces indicateurs permettent d'évaluer la régularité potentielle des distributions.",
    "La deuxième étape consiste à simuler le crédit : montant, durée, taux fixe ou variable, assurance emprunteur, frais de dossier. Le TAEG est le coût complet à retenir.",
    "La troisième étape croise le rendement net de la SCPI (après frais de gestion) avec le coût du crédit pour estimer l'effet de levier potentiel. Un écart positif d'au moins 1 % est généralement recherché.",
    "La quatrième étape simule le cash-flow mensuel avant et après fiscalité selon la TMI de l'investisseur, en intégrant la déductibilité des intérêts d'emprunt.",
    "La cinquième étape vérifie la cohérence entre la durée du crédit, l'horizon de détention et la liquidité de la SCPI. Une sortie anticipée peut remettre en cause l'intérêt du montage.",
    "MaximusSCPI ne constitue pas une recommandation personnalisée. Un échange avec le Cabinet Eric Bellaiche permet de simuler un projet SCPI à crédit selon votre situation personnelle, votre TMI et votre capacité d'endettement.",
  ],
  conclusionParagraphs: [
    "Le financement de SCPI à crédit peut présenter un intérêt dans une stratégie patrimoniale, à condition d'analyser rigoureusement le coût du crédit, le rendement net de la SCPI, la fiscalité de l'investisseur et le cash-flow résultant. L'effet de levier fonctionne dans les deux sens : il amplifie les gains potentiels comme les pertes.",
    "Sources à consulter : DIC des SCPI, bulletins trimestriels, rapports annuels, conditions générales du crédit immobilier (offre de prêt). Simulation à réaliser avec un conseiller en gestion de patrimoine pour valider la cohérence globale du montage.",
    "Utilisez le comparateur MaximusSCPI pour identifier les SCPI à approfondir, puis validez l'étude de financement avec un professionnel pour une simulation adaptée à votre TMI, votre capacité d'endettement et votre horizon.",
  ],
  faqItems: [
    {
      question: 'Peut-on financer des SCPI à crédit comme un bien immobilier ?',
      answer: "Oui, de nombreuses banques proposent des crédits immobiliers pour financer l'achat de parts de SCPI, avec des conditions proches de l'immobilier physique (durée, taux, assurance). Certains établissements sont plus réticents et peuvent appliquer des décotes sur les loyers.",
    },
    {
      question: "Les intérêts d'emprunt sont-ils déductibles des revenus fonciers ?",
      answer: "Oui, les intérêts d'emprunt sont déductibles des revenus fonciers dans la catégorie des revenus fonciers, au même titre que les autres charges (frais de gestion, travaux). Cette déductibilité réduit l'impôt dû et améliore le cash-flow net.",
    },
    {
      question: "Quel est l'effet de levier attendu avec des SCPI ?",
      answer: "L'effet de levier est positif lorsque le rendement net de la SCPI (après frais de gestion) est supérieur au coût du crédit (après déduction fiscale des intérêts). Un écart d'au moins 1 % est généralement recherché pour justifier le montage. L'effet de levier n'est pas garanti.",
    },
    {
      question: 'Quel est le risque principal d\'un crédit SCPI ?',
      answer: "Le risque principal est la baisse des loyers : si les distributions diminuent, le cash-flow se dégrade et l'investisseur doit compenser. Le second risque est la liquidité : si les parts ne peuvent être revendues rapidement, l'engagement de crédit reste dû.",
    },
    {
      question: 'Faut-il préférer un taux fixe ou variable ?',
      answer: "Le taux fixe sécurise la mensualité sur toute la durée et est généralement recommandé pour un investissement long terme. Le taux variable peut être intéressant si les taux sont élevés et devraient baisser, mais il expose à des hausses futures. Le choix dépend de la sensibilité au risque de l'investisseur.",
    },
    {
      question: 'Quelle durée de crédit choisir ?',
      answer: "La durée doit être cohérente avec l'horizon de détention des SCPI (généralement 10-15 ans minimum). Une durée plus longue réduit la mensualité mais augmente le coût total du crédit. Une durée trop courte peut dégrader le cash-flow mensuel.",
    },
    {
      question: 'Le cash-flow doit-il être positif ?',
      answer: "Un cash-flow positif est l'idéal mais n'est pas obligatoire. Un cash-flow légèrement négatif peut être accepté s'il est compensé par une économie d'impôt significative, à condition que l'investisseur puisse assumer l'apport mensuel complémentaire sans difficulté.",
    },
    {
      question: "Quel est l'impact de l'assurance emprunteur ?",
      answer: "L'assurance emprunteur représente 0,2 % à 0,5 % du capital emprunté par an. Elle doit être intégrée dans le TAEG et dans le calcul du cash-flow. La délégation d'assurance peut permettre de réduire ce coût.",
    },
    {
      question: "Les banques financent-elles facilement les SCPI ?",
      answer: "Certaines banques sont spécialisées dans le financement de SCPI et acceptent ce type d'opération. D'autres sont plus réticentes et peuvent refuser ou appliquer des conditions plus strictes (apport personnel minimum, décote sur les loyers, taux majoré).",
    },
    {
      question: 'Peut-on rembourser le crédit par anticipation ?',
      answer: "Oui, le remboursement anticipé est généralement possible, sous réserve du paiement d'une indemnité de remboursement anticipé (IRA) plafonnée à 3 % du capital restant dû ou 6 mois d'intérêts. Cette option peut être utile si les SCPI sont revendues avant le terme du crédit.",
    },
    {
      question: 'Comment MaximusSCPI aide-t-il à analyser un projet à crédit ?',
      answer: "Le comparateur MaximusSCPI permet de visualiser les indicateurs clés des SCPI (rendement, TOF, capitalisation, endettement). Cette analyse préalable est une piste à approfondir pour construire un montage cohérent avec un conseiller en gestion de patrimoine.",
    },
  ],
  comparateurCtaLabel: "Simuler un projet SCPI à crédit avant de souscrire",
}
