import type { ScpiEducationalPageConfig } from './shared'

export const scpiTransmissionConfig: ScpiEducationalPageConfig = {
  path: '/scpi-transmission',
  badge: 'Stratégie patrimoniale',
  h1: 'SCPI et transmission : donation, démembrement et succession',
  heroSubtitle:
    "Les SCPI peuvent s'intégrer à une stratégie de transmission via la donation de parts, le démembrement croisé, l'assurance-vie ou la succession. La fiscalité, la valorisation, la liquidité et l'objectif familial sont déterminants.",
  seoTitle: 'SCPI transmission : donation, démembrement, succession et fiscalité',
  seoDescription:
    "Comprenez l'utilisation des SCPI dans une stratégie de transmission : donation, démembrement, nue-propriété, usufruit, assurance-vie, succession et points de vigilance.",
  shortAnswerTitle: "Pourquoi intégrer des SCPI dans une stratégie de transmission ?",
  shortAnswer:
    "Les parts de SCPI peuvent être transmises par donation ou succession, avec les mêmes règles que tout actif immobilier. Le démembrement (nue-propriété / usufruit) est un mécanisme central : il permet de séparer la propriété des parts du droit de percevoir les revenus. Un parent peut donner la nue-propriété à ses enfants tout en conservant l'usufruit, c'est-à-dire les revenus, jusqu'à son décès. Ce mécanisme permet de transmettre le capital tout en conservant des revenus. L'assurance-vie constitue une autre enveloppe de transmission avec des règles fiscales spécifiques (abattement de 152 500 € par bénéficiaire). La valorisation des parts de SCPI, leur liquidité et la composition familiale sont des critères à analyser précisément avant de mettre en place une stratégie de transmission.",
  keyMessage:
    "Les SCPI peuvent s'intégrer à une stratégie de transmission, mais la fiscalité, la valorisation, l'usufruit, la liquidité et les objectifs familiaux doivent être analysés précisément.",
  definitionParagraphs: [
    "La transmission de parts de SCPI peut s'effectuer de plusieurs manières : donation simple, donation avec réserve d'usufruit, succession, ou via un contrat d'assurance-vie. Chaque mécanisme a des implications fiscales, juridiques et patrimoniales différentes.",
    "La donation de parts de SCPI est soumise aux droits de donation, avec un abattement de 100 000 € par parent et par enfant (renouvelable tous les 15 ans). Au-delà de cet abattement, le barème progressif des droits de donation s'applique. La donation avec réserve d'usufruit est un outil courant : le donateur conserve les revenus des parts jusqu'à son décès, et le donataire récupère la pleine propriété à ce moment-là, sans droits de succession supplémentaires sur la nue-propriété déjà transmise.",
    "Le démembrement de propriété (nue-propriété / usufruit) repose sur une clé de répartition fixée par l'administration fiscale en fonction de l'âge de l'usufruitier. Plus l'usufruitier est âgé, plus la valeur de l'usufruit est élevée, et plus la valeur de la nue-propriété est faible. Par exemple, pour un usufruitier de 60 ans, la nue-propriété est valorisée à 60 % de la pleine propriété ; pour un usufruitier de 70 ans, elle est valorisée à 40 %.",
    "L'assurance-vie est un support de transmission distinct : les capitaux transmis aux bénéficiaires désignés bénéficient d'un abattement de 152 500 € par bénéficiaire (pour les versements effectués avant 70 ans), au-delà duquel une taxation forfaitaire s'applique. Les SCPI logées en assurance-vie sont transmises dans ce cadre, avec les avantages et les limites de l'enveloppe (frais UC, choix limité de SCPI, taux de reversement).",
    "La succession de parts de SCPI suit le droit commun des successions. Les parts sont comprises dans l'actif successoral et évaluées à leur valeur vénale au jour du décès. Les droits de succession s'appliquent après abattements, selon le lien de parenté. Le démembrement peut être organisé par testament.",
    "La valorisation des parts de SCPI pour la donation ou la succession est un point sensible : elle doit être justifiée par une valeur de retrait ou une valeur de part récente. L'administration fiscale peut contester une valorisation trop basse. Un recours à un notaire ou à un expert est recommandé.",
    "La liquidité des SCPI dans une stratégie de transmission est un facteur à anticiper : si des droits de donation ou de succession doivent être payés en numéraire, les héritiers peuvent avoir besoin de vendre des parts. Le délai de cession (2 à 12 mois) peut poser problème si les liquidités disponibles sont insuffisantes.",
  ],
  tableTitle: 'Mécanisme / Intérêt potentiel / Vigilance',
  tableRows: [
    {
      level: 'Donation de parts',
      advantage:
        "Transmission anticipée du capital. Abattement de 100 000 € par parent et par enfant (renouvelable tous les 15 ans). Possibilité de démembrer pour conserver les revenus.",
      vigilance:
        'Fiscalité : droits de donation au-delà de l\'abattement. Valorisation des parts justifiée. Formalisme notarié obligatoire. Impact sur le patrimoine du donateur (perte de capital).',
    },
    {
      level: 'Démembrement (nue-propriété / usufruit)',
      advantage:
        "Le donateur conserve les revenus jusqu'à son décès. Le donataire acquiert la nue-propriété sans fiscalité à l'entrée (droits calculés sur la valeur de la nue-propriété seulement). Pas de droits de succession à l'extinction de l'usufruit.",
      vigilance:
        "L'usufruit s'éteint au décès de l'usufruitier : les enfants récupèrent la pleine propriété sans fiscalité supplémentaire. En contrepartie, le donateur ne peut plus disposer librement des parts (vente nécessitant l'accord du nu-propriétaire).",
    },
    {
      level: 'Nue-propriété',
      advantage:
        "Acquisition à décote (20-60 % selon l'âge de l'usufruitier). Pas de revenus imposables pendant la période de démembrement. À l'issue, pleine propriété sans fiscalité complémentaire.",
      vigilance:
        "Aucun revenu perçu pendant toute la durée du démembrement. Horizon long. La décote dépend de l'âge de l'usufruitier : plus l'usufruitier est jeune, plus la décote sur la nue-propriété est faible.",
    },
    {
      level: 'Assurance-vie',
      advantage:
        "Abattement de 152 500 € par bénéficiaire (versements avant 70 ans). Fiscalité forfaitaire au-delà. Désignation libre des bénéficiaires. Transmission hors succession.",
      vigilance:
        "Frais UC en sus. Choix limité de SCPI. Rendement reversé inférieur au TDVM brut. L'abattement est global (tous contrats confondus). Pas de démembrement possible dans l'enveloppe.",
    },
    {
      level: 'Succession',
      advantage:
        "Transmission des parts au décès selon les règles du droit commun. Abattements légaux (100 000 € par enfant). Possibilité d'organisation par testament ou donation au dernier vivant.",
      vigilance:
        'Droits de succession potentiellement élevés selon le lien de parenté. Valorisation des parts à la date du décès. Liquidité nécessaire pour payer les droits. Délais de cession si vente nécessaire.',
    },
  ],
  tableNote:
    "Ce tableau est une synthèse pédagogique. Le choix du mécanisme de transmission dépend de la situation familiale, de l'âge, du patrimoine et des objectifs de chacun. Un conseil notarial et fiscal est indispensable.",
  criteriaTitle: "Critères à croiser pour une stratégie de transmission avec SCPI",
  criteriaCards: [
    { title: 'Âge du donateur', text: "L'âge influence la valorisation de l'usufruit et donc la décote sur la nue-propriété. Plus le donateur est âgé, plus la valeur de l'usufruit est élevée, plus la transmission de la nue-propriété est fiscalement avantageuse." },
    { title: 'Objectif de conservation des revenus', text: "Si le donateur souhaite continuer à percevoir les loyers, la donation avec réserve d'usufruit est adaptée. Si les revenus ne sont pas nécessaires, la donation en pleine propriété peut être envisagée." },
    { title: 'Composition familiale', text: "Le nombre d'enfants et la situation conjugale influencent l'optimisation des abattements. Un couple peut transmettre jusqu'à 200 000 € par enfant (100 000 € par parent) sans droits de donation." },
    { title: 'Valorisation des parts', text: "La valeur retenue pour la donation doit être justifiée (dernière valeur de part connue). Une sous-évaluation peut être contestée par l'administration fiscale. Un recours à un notaire est recommandé." },
    { title: 'Liquidité', text: "Anticiper le paiement des droits de donation ou de succession. Si les liquidités sont insuffisantes, la vente de parts de SCPI peut être nécessaire, avec un délai de 2 à 12 mois." },
    { title: 'Couverture successorale', text: "Un testament ou une donation au dernier vivant peut organiser le démembrement des parts au profit du conjoint survivant. Sans organisation, les règles successorales légales s'appliquent." },
      { title: 'Compatibilité avec l\'assurance-vie', text: "L'assurance-vie offre un cadre distinct de transmission, avec des abattements propres. Les SCPI logées en assurance-vie sont transmises selon les règles de l'assurance-vie, pas du droit commun des successions." },
    { title: 'Fiscalité des donations antérieures', text: "Vérifier l'historique des donations sur les 15 dernières années. Les abattements sont renouvelables tous les 15 ans. Une donation récente réduit l'abattement disponible." },
  ],
  commonErrors: [
    "Sous-estimer la valeur des parts de SCPI dans la déclaration de donation, ce qui expose à un redressement fiscal.",
    "Oublier que la donation avec réserve d'usufruit prive le donateur de la libre disposition des parts (vente soumise à l'accord du nu-propriétaire).",
    "Confondre l'abattement de l'assurance-vie (152 500 € par bénéficiaire) avec l'abattement des donations (100 000 € par parent et par enfant).",
    "Ne pas vérifier l'impact du paiement des droits de donation ou de succession sur la trésorerie disponible.",
    "Ignorer le délai de cession des parts SCPI si les héritiers doivent vendre pour payer les droits de succession.",
    "Croire que le démembrement transmet automatiquement les revenus sans conséquence fiscale pour le donateur.",
    "Ne pas prendre en compte les donations antérieures dans le calcul des abattements disponibles.",
    "Organiser une stratégie de transmission sans consulter un notaire ou un conseiller en gestion de patrimoine spécialisé.",
  ],
  practicalCases: [
    {
      title: 'Donation de nue-propriété — Parent de 65 ans',
      text: "Hypothèses théoriques : un parent de 65 ans détient 150 000 € de parts de SCPI en pleine propriété. Il souhaite transmettre le capital à ses deux enfants tout en conservant les revenus. Donation avec réserve d'usufruit. Barème fiscal : à 65 ans, l'usufruit est valorisé à 40 % et la nue-propriété à 60 %. Valeur de la nue-propriété transmise : 90 000 € (60 % de 150 000 €). Abattement par enfant : 100 000 €. Les 90 000 € sont répartis entre les deux enfants (45 000 € chacun), en dessous de l'abattement de 100 000 €. Aucun droit de donation dû. Le parent conserve les loyers jusqu'à son décès. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.",
    },
    {
      title: "Conservation de l'usufruit — Parent de 75 ans",
      text: "Hypothèses théoriques : un parent de 75 ans détient 200 000 € de parts de SCPI. Donation avec réserve d'usufruit. Barème fiscal : à 75 ans, l'usufruit est valorisé à 50 %, la nue-propriété à 50 %. Valeur de la nue-propriété transmise : 100 000 €. Abattement par enfant (2 enfants) : 100 000 € chacun. Chaque enfant reçoit 50 000 € de nue-propriété, en dessous de l'abattement. Aucun droit de donation dû. Le parent conserve 100 % des loyers jusqu'à son décès. À son décès, les enfants récupèrent la pleine propriété sans droits de succession supplémentaires sur la nue-propriété déjà transmise. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.",
    },
    {
      title: 'Assurance-vie contenant des SCPI — Transmission à 3 bénéficiaires',
      text: "Hypothèses théoriques : un investisseur de 70 ans détient 200 000 € de SCPI dans un contrat d'assurance-vie (versements effectués avant 70 ans). Il désigne ses 3 enfants comme bénéficiaires, à parts égales. Abattement par bénéficiaire : 152 500 €. Chaque enfant reçoit 66 667 €, en dessous de l'abattement. Aucun droit de succession dû. Si le contrat avait été de 500 000 €, chaque enfant recevrait 166 667 € : l'abattement de 152 500 € s'applique, et le solde (14 167 €) est taxé à 20 % (soit 2 833 € par enfant). Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.",
    },
    {
      title: 'Transmission à plusieurs enfants — Égalité ou proportionnalité',
      text: "Hypothèses théoriques : un couple détient 300 000 € de parts de SCPI en pleine propriété. 3 enfants. Ils souhaitent transmettre de manière équitable. Donation en pleine propriété : 100 000 € par parent à chaque enfant, soit 200 000 € par enfant. Abattement : 100 000 € par parent et par enfant, soit 200 000 € par enfant. Pas de droits de donation. Si les parents souhaitent conserver les revenus, donation avec réserve d'usufruit : la valeur transmise (nue-propriété) est inférieure à la pleine propriété, ce qui permet de transmettre davantage de capital dans la limite des abattements. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.",
    },
  ],
  methodParagraphs: [
    "MaximusSCPI compare les SCPI selon leurs indicateurs clés. Pour une stratégie de transmission, l'analyse doit intégrer la valorisation des parts, la fiscalité applicable (donation, succession, assurance-vie), et la cohérence avec les objectifs familiaux.",
    "La première étape consiste à évaluer la valeur des parts de SCPI détenues et à les situer dans le patrimoine global. La valorisation doit être justifiée par des éléments objectifs (valeur de part, valeur de retrait).",
    "La deuxième étape analyse la situation familiale : âge, nombre d'enfants, situation conjugale, donations antérieures, objectifs de conservation des revenus. Ces éléments déterminent le mécanisme le plus adapté.",
    "La troisième étape compare les mécanismes : donation simple, donation avec réserve d'usufruit, assurance-vie, succession. Chaque mécanisme a des implications fiscales et patrimoniales différentes.",
    "La quatrième étape simule l'impact fiscal : droits de donation ou de succession estimés, abattements disponibles, liquidités nécessaires pour payer les droits.",
    "MaximusSCPI ne constitue pas une recommandation personnalisée. Un échange avec le Cabinet Eric Bellaiche et un notaire permet d'analyser une stratégie de transmission avec SCPI selon votre situation familiale, votre âge et vos objectifs patrimoniaux.",
  ],
  conclusionParagraphs: [
    "Les SCPI peuvent être intégrées à une stratégie de transmission via la donation, le démembrement, l'assurance-vie ou la succession. Chaque mécanisme a des avantages et des limites qui doivent être analysés en fonction de la situation familiale, de l'âge, des objectifs de revenus et de la fiscalité applicable.",
    "Sources à consulter : note d'information des SCPI, valeur de part et valeur de retrait, barème fiscal de l'usufruit (article 669 du CGI), abattements des donations et successions, contrat d'assurance-vie, conseil notarial.",
    "Utilisez le comparateur MaximusSCPI pour identifier la valeur et les caractéristiques des SCPI détenues, puis validez votre stratégie de transmission avec un notaire et un conseiller en gestion de patrimoine pour une analyse adaptée à votre situation familiale et fiscale.",
  ],
  faqItems: [
    {
      question: 'Peut-on donner des parts de SCPI de son vivant ?',
      answer: "Oui, les parts de SCPI peuvent être données par donation simple ou donation avec réserve d'usufruit. L'acte doit être passé devant notaire. Les droits de donation sont calculés après application des abattements en vigueur.",
    },
    {
      question: "Qu'est-ce que la donation avec réserve d'usufruit ?",
      answer: "Le donateur donne la nue-propriété des parts à ses enfants (ou autres bénéficiaires) tout en conservant l'usufruit, c'est-à-dire le droit de percevoir les revenus (loyers) jusqu'à son décès. À son décès, les enfants récupèrent la pleine propriété sans droits de succession supplémentaires.",
    },
    {
      question: "Quelle est la fiscalité de la donation de parts de SCPI ?",
      answer: "Les droits de donation sont calculés sur la valeur transmise (nue-propriété ou pleine propriété), après abattement de 100 000 € par parent et par enfant (renouvelable tous les 15 ans). Le barème progressif des droits de donation s'applique au-delà.",
    },
    {
      question: 'Quel est l\'intérêt du démembrement pour la transmission ?',
      answer: "Le démembrement permet de transmettre le capital (nue-propriété) à moindre coût fiscal, puisque les droits sont calculés sur la valeur de la nue-propriété seulement (décote de 20 % à 60 % selon l'âge de l'usufruitier), tout en conservant les revenus jusqu'au décès.",
    },
    {
      question: 'Les SCPI en assurance-vie sont-elles transmises hors succession ?',
      answer: "Oui, les capitaux transmis via l'assurance-vie ne font pas partie de la succession. Ils sont versés directement aux bénéficiaires désignés, avec un abattement de 152 500 € par bénéficiaire pour les versements effectués avant 70 ans.",
    },
    {
      question: "Quelle est la différence entre donation et succession pour des SCPI ?",
      answer: "La donation est une transmission anticipée du vivant du propriétaire, avec des abattements renouvelables tous les 15 ans. La succession intervient au décès, avec des abattements et un barème qui peuvent être moins avantageux selon la situation.",
    },
    {
      question: "Faut-il un notaire pour transmettre des parts de SCPI ?",
      answer: "Oui, la donation de parts de SCPI doit être constatée par un acte notarié. Pour la succession, le notaire est également nécessaire. L'assurance-vie ne nécessite pas de notaire pour la désignation des bénéficiaires.",
    },
    {
      question: "Comment valoriser les parts de SCPI pour une donation ?",
      answer: "La valeur retenue est généralement la dernière valeur de part connue au moment de la donation. La valeur de retrait (généralement inférieure de 5 % à 10 %) peut être utilisée dans certains cas. Un notaire ou expert peut confirmer la valorisation appropriée.",
    },
    {
      question: "Peut-on vendre des parts de SCPI données avec réserve d'usufruit ?",
      answer: "La vente nécessite l'accord du nu-propriétaire (l'enfant) et de l'usufruitier (le parent). Le prix de vente est réparti entre l'usufruitier et le nu-propriétaire selon la clé de démembrement. Cette contrainte limite la flexibilité.",
    },
    {
      question: "Quel est l'impact de l'âge sur la stratégie de transmission ?",
      answer: "Plus le donateur est âgé, plus la valeur de l'usufruit est élevée selon le barème fiscal, et plus la décote sur la nue-propriété est importante, ce qui rend la donation fiscalement avantageuse. L'âge influence aussi la pertinence de l'assurance-vie.",
    },
    {
      question: 'Comment MaximusSCPI aide-t-il dans une stratégie de transmission ?',
      answer: "Le comparateur MaximusSCPI permet de connaître les caractéristiques des SCPI détenues (valeur, rendement, frais). Cette analyse préalable est une piste à approfondir avec un notaire et un conseiller en gestion de patrimoine pour construire une stratégie de transmission adaptée.",
    },
  ],
  comparateurCtaLabel: "Étudier les SCPI dans une stratégie de transmission",
}
