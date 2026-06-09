import type { ScpiEducationalPageConfig } from './shared'

export const noteInformationScpiConfig: ScpiEducationalPageConfig = {
  path: '/note-information-scpi',
  badge: 'Document clé',
  h1: 'Note d\'information SCPI : le document à lire avant de souscrire',
  heroSubtitle:
    "La note d'information est le document réglementaire central d'une SCPI. Elle détaille le fonctionnement, les frais, les risques, les modalités de souscription et de retrait, la fiscalité et la politique d'investissement. C'est le document à lire avant toute décision de souscription.",
  seoTitle: "Note d'information SCPI : frais, risques, fonctionnement et souscription",
  seoDescription:
    "Comprenez la note d'information d'une SCPI : fonctionnement, frais, risques, modalités de souscription, retrait, fiscalité, stratégie et points de vigilance.",
  shortAnswerTitle: "Qu'est-ce que la note d'information d'une SCPI ?",
  shortAnswer:
    "La note d'information est un document réglementaire obligatoire qui présente en détail le fonctionnement de la SCPI, sa stratégie d'investissement, ses frais, ses risques, ses modalités de souscription et de retrait, sa fiscalité et sa durée de vie recommandée. Elle est plus complète que le DIC et doit être remise avant toute souscription. L'investisseur doit la lire attentivement pour comprendre ce qu'il achète.",
  keyMessage: "La note d'information est un document central pour comprendre ce que l'investisseur achète réellement.",
  definitionParagraphs: [
    "La note d'information (également appelée prospectus) est le document réglementaire de référence d'une SCPI. Elle est soumise à l'AMF qui appose son visa après vérification de sa conformité. Ce visa ne constitue pas une approbation de l'opportunité d'investir, mais atteste que le document respecte les obligations réglementaires en matière d'information. La note d'information est mise à jour régulièrement pour refléter les évolutions de la SCPI.",
    "La note d'information détaille le fonctionnement de la SCPI : sa forme juridique (généralement une société civile), son objet social, ses règles de fonctionnement, la répartition des pouvoirs entre la société de gestion et les associés, la tenue des assemblées générales, les droits de vote et la répartition des bénéfices. Elle décrit également le processus de souscription et de retrait, avec les délais et les conditions applicables.",
    "Les frais sont présentés de manière exhaustive dans la note d'information : frais de souscription (payés à l'entrée, généralement entre 8 % et 12 %), frais de gestion (prélevés chaque année), frais d'acquisition et de cession des actifs immobiliers, frais de fonctionnement, et éventuels frais de sortie. Certaines notes d'information intègrent également les frais de commercialisation et les rétrocessions versées aux intermédiaires.",
    "La rubrique des risques est essentielle. La note d'information décrit l'ensemble des risques auxquels l'investisseur est exposé : risque de perte en capital, risque de liquidité (difficulté à revendre ses parts), risque locatif (vacance des locaux, impayés), risque de marché (baisse de valeur des actifs immobiliers), risque de concentration (sectorielle ou géographique), risque de dilution, risque fiscal (changement de législation). La lecture de cette rubrique est indispensable pour comprendre ce que l'on accepte en investissant.",
    "La note d'information détaille également la politique d'investissement de la SCPI : secteurs d'activité cibles (bureaux, commerces, logistique, santé, résidentiel), zones géographiques (Île-de-France, régions, Europe), types de biens, stratégie de valorisation, politique d'endettement et de gestion des liquidités. Elle permet de vérifier que la stratégie annoncée est cohérente avec les objectifs de l'investisseur.",
    "Enfin, la note d'information aborde la fiscalité applicable à la SCPI et à ses associés : régime fiscal de la SCPI, imposition des revenus distribués (revenus fonciers, plus-values, revenus de source étrangère), prélèvements sociaux, crédits d'impôt, et impact de la détention via différentes enveloppes (direct, assurance-vie, PER, SCI). Ces informations permettent d'évaluer le rendement net après impôt selon la situation personnelle de l'investisseur.",
  ],
  tableTitle: 'Rubrique / Information utile / Question à se poser',
  tableRows: [
    {
      level: 'Frais détaillés',
      advantage: 'Connaître l\'ensemble des frais (souscription, gestion, acquisition, cession) et leur impact sur le rendement.',
      vigilance: 'Les frais sont-ils en ligne avec la moyenne du marché ? Certains frais sont-ils cachés dans les frais courants ?',
    },
    {
      level: 'Risques',
      advantage: 'Comprendre les risques spécifiques de la SCPI : perte en capital, liquidité, concentration, endettement.',
      vigilance: 'Les risques décrits sont-ils acceptables au regard de ma situation et de ma tolérance au risque ?',
    },
    {
      level: 'Politique d\'investissement',
      advantage: 'Vérifier la cohérence entre la stratégie annoncée et les objectifs recherchés (revenus, diversification, valorisation).',
      vigilance: 'La stratégie est-elle cohérente avec les perspectives de marché ? La SCPI est-elle trop concentrée sur un secteur ou une zone ?',
    },
    {
      level: 'Modalités de souscription et de retrait',
      advantage: 'Comprendre les conditions d\'entrée et de sortie, les délais de retrait et les plafonds éventuels.',
      vigilance: 'Les conditions de retrait sont-elles compatibles avec mon horizon d\'investissement ? Existe-t-il un risque de blocage des retraits ?',
    },
    {
      level: 'Fiscalité',
      advantage: 'Évaluer le rendement net après impôt selon sa TMI, les PS, les crédits d\'impôt éventuels.',
      vigilance: 'La fiscalité de la SCPI est-elle adaptée à ma situation personnelle ? Y a-t-il des risques de changement fiscal ?',
    },
    {
      level: 'Équipe de gestion et société de gestion',
      advantage: 'Connaître l\'équipe qui gère la SCPI, son expérience, ses moyens et sa réputation.',
      vigilance: 'La société de gestion a-t-elle l\'expérience et les moyens nécessaires pour mettre en œuvre la stratégie annoncée ?',
    },
  ],
  tableNote:
    'Chaque rubrique de la note d\'information apporte des informations essentielles. Une lecture complète est recommandée avant toute souscription.',
  criteriaTitle: 'Points à vérifier dans la note d\'information',
  criteriaCards: [
    {
      title: 'Vérifier la date et le visa AMF',
      text: 'La note d\'information doit porter un visa AMF récent. Une note ancienne peut ne pas refléter la situation actualisée de la SCPI. Vérifier la date du visa et la date de mise à jour.',
    },
    {
      title: 'Comparer les frais avec le marché',
      text: 'Les frais de souscription, de gestion et d\'acquisition varient selon les SCPI. Comparer ces frais avec les moyennes du secteur permet d\'évaluer la compétitivité de la SCPI.',
    },
    {
      title: 'Analyser les risques spécifiques',
      text: 'Au-delà des risques génériques, certaines SCPI présentent des risques spécifiques (concentration, endettement, liquidité). Leur identification est essentielle.',
    },
    {
      title: 'Vérifier la cohérence stratégique',
      text: 'La politique d\'investissement doit être cohérente avec les objectifs de l\'investisseur. Une SCPI spécialisée dans les bureaux en Île-de-France n\'a pas le même profil qu\'une SCPI diversifiée européenne.',
    },
    {
      title: 'Lire les conditions de retrait',
      text: 'Les modalités de retrait sont un élément clé de la liquidité. Vérifier les délais, les plafonds annuels et les conditions de suspension éventuelle des retraits.',
    },
  ],
  commonErrors: [
    'Ne pas lire la note d\'information et se fier uniquement au DIC ou à la plaquette commerciale.',
    'Ne pas vérifier la date du visa AMF et la mise à jour de la note d\'information.',
    'Ignorer les frais d\'acquisition et de cession des actifs, qui s\'ajoutent aux frais de souscription et de gestion.',
    'Ne pas lire la rubrique des risques en détail et sous-estimer le risque de liquidité ou de perte en capital.',
    'Confondre stratégie d\'investissement (ce que la SCPI annonce) et résultats passés (ce qu\'elle a réalisé).',
    'Ne pas vérifier les modalités de retrait et découvrir trop tard que les conditions de sortie sont contraignantes.',
  ],
  practicalCases: [
    {
      title: 'Investisseur lisant la note d\'information avant de souscrire',
      text: 'Un investisseur télécharge la note d\'information d\'une SCPI. Il vérifie le visa AMF, lit la rubrique des frais (souscription 10 %, gestion 1,2 %, acquisition 3 %) et les compare à une autre SCPI. Il consulte également les risques et les conditions de retrait. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.',
    },
    {
      title: 'Investisseur vérifiant la stratégie d\'investissement',
      text: 'Un investisseur lit la politique d\'investissement d\'une SCPI et constate qu\'elle est concentrée sur les bureaux en Île-de-France. Compte tenu des évolutions du marché, il s\'interroge sur la pertinence de cette stratégie et décide d\'explorer une SCPI plus diversifiée. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.',
    },
    {
      title: 'Investisseur découvrant les conditions de retrait dans la note d\'information',
      text: 'Un investisseur lit dans la note d\'information que le retrait des parts est soumis à un plafond annuel et que la société de gestion peut suspendre les retraits en cas de circonstances exceptionnelles. Il intègre ce risque de liquidité dans sa réflexion et adapte son investissement en conséquence. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.',
    },
  ],
  methodParagraphs: [
    'La méthode MaximusSCPI place la lecture de la note d\'information au cœur de son processus d\'analyse. Chaque SCPI présélectionnée fait l\'objet d\'une lecture complète de sa note d\'information, avec un focus sur les frais, les risques et la stratégie.',
    'Le Cabinet Eric Bellaiche, CGP-CIF inscrit ORIAS n°13001580, utilise systématiquement la note d\'information comme source principale pour ses pré-orientations pédagogiques. Les données extraites sont vérifiées et recoupées avec le rapport annuel et les autres documents réglementaires.',
    'MaximusSCPI vous recommande de lire la note d\'information avant toute souscription de SCPI. Prenez le temps de vérifier les frais, les risques et les conditions de retrait. N\'hésitez pas à poser des questions à votre conseiller sur les points qui vous semblent obscurs.',
  ],
  conclusionParagraphs: [
    "La note d'information est le document central pour comprendre une SCPI avant d'investir. Frais, risques, stratégie, fiscalité, conditions de souscription et de retrait : elle contient toutes les informations essentielles.",
    'Sources : site AMF (amf-france.org), documents réglementaires des SCPI (note d\'information, DIC, rapport annuel), code monétaire et financier, registre ORIAS (orias.fr).',
    "Prenez le temps de lire la note d'information avant toute souscription. Consultez un CGP-CIF pour vous aider à analyser les points clés et à vérifier la cohérence avec votre situation personnelle.",
  ],
  faqItems: [
    {
      question: "Qu'est-ce que la note d'information d'une SCPI ?",
      answer: "C'est le document réglementaire de référence qui détaille le fonctionnement, les frais, les risques, la stratégie, la fiscalité et les modalités de souscription et de retrait de la SCPI.",
    },
    {
      question: "La note d'information est-elle obligatoire ?",
      answer: "Oui, elle doit être remise à tout investisseur avant la souscription. Elle est soumise au visa de l'AMF qui atteste de sa conformité réglementaire.",
    },
    {
      question: "Quelle est la différence entre le DIC et la note d'information ?",
      answer: "Le DIC est une synthèse standardisée de 2-3 pages. La note d'information est un document complet de plusieurs dizaines de pages qui détaille tous les aspects de la SCPI.",
    },
    {
      question: "Que vérifier en priorité dans la note d'information ?",
      answer: "Les frais (souscription, gestion, acquisition), les risques (perte en capital, liquidité, concentration), la stratégie d'investissement et les modalités de retrait.",
    },
    {
      question: "Le visa AMF sur la note d'information garantit-il la qualité de la SCPI ?",
      answer: "Non. Le visa AMF atteste de la conformité réglementaire du document, pas de la qualité de l'investissement ni de ses perspectives de rendement.",
    },
    {
      question: "À quelle fréquence la note d'information est-elle mise à jour ?",
      answer: "Elle est mise à jour à chaque évolution significative de la SCPI (changement de stratégie, modification des frais, actualisation des données financières) et au minimum une fois par an.",
    },
    {
      question: "Où trouver la note d'information d'une SCPI ?",
      answer: "Sur le site de la société de gestion, sur les plateformes des distributeurs, ou sur demande auprès d'un conseiller. Certaines notes sont également disponibles sur les sites d'information financière.",
    },
    {
      question: "La note d'information contient-elle des données sur la performance passée ?",
      answer: "Oui, elle inclut généralement des données historiques sur le rendement, le prix de part, le TOF et la collecte. Ces données sont utiles mais ne garantissent pas la performance future.",
    },
    {
      question: "Peut-on investir en SCPI sans lire la note d'information ?",
      answer: "C'est déconseillé. La note d'information contient des informations essentielles sur les frais, les risques et les conditions de souscription. Sa lecture est une étape obligatoire d'une analyse sérieuse.",
    },
    {
      question: "Comment MaximusSCPI utilise-t-il la note d'information ?",
      answer: 'MaximusSCPI extrait les données clés des notes d\'information pour les intégrer dans son comparateur. L\'analyse personnalisée, réalisée par le Cabinet Eric Bellaiche (CGP-CIF), s\'appuie sur une lecture approfondie de ces documents.',
    },
  ],
  comparateurCtaLabel: 'Vérifier les frais et risques dans la note d\'information',
}
