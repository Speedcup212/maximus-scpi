import type { ScpiEducationalPageConfig } from './shared'

export const documentsReglementairesScpiConfig: ScpiEducationalPageConfig = {
  path: '/documents-reglementaires-scpi',
  badge: 'Analyse SCPI',
  h1: 'Documents réglementaires SCPI : DIC, note d\'information, statuts et rapports',
  heroSubtitle:
    "Une SCPI met à disposition plusieurs documents réglementaires : DIC, note d'information, statuts, rapport annuel, bulletin trimestriel. Chacun apporte des informations différentes. Les lire permet de comprendre ce que l'on achète vraiment.",
  seoTitle: 'Documents réglementaires SCPI : comprendre DIC, note, statuts et rapports',
  seoDescription:
    "Comprenez les documents réglementaires d'une SCPI : DIC, note d'information, statuts, rapport annuel, bulletin trimestriel, frais, risques et indicateurs clés.",
  shortAnswerTitle: "Quels sont les documents réglementaires d'une SCPI ?",
  shortAnswer:
    "Les principaux documents réglementaires d'une SCPI sont : le DIC (Document d'Informations Clés), la note d'information, les statuts, le rapport annuel, le bulletin trimestriel et le rapport extra-financier. Chaque document répond à un objectif différent : le DIC offre une synthèse, la note d'information détaille le fonctionnement et les risques, le rapport annuel présente les comptes et la stratégie, le bulletin trimestriel suit l'actualité.",
  keyMessage: "La plaquette commerciale ne suffit pas. Une analyse sérieuse de SCPI doit s'appuyer sur les documents réglementaires.",
  definitionParagraphs: [
    "Les SCPI sont des produits financiers réglementés. À ce titre, les sociétés de gestion sont tenues de publier et de mettre à disposition des investisseurs plusieurs documents réglementaires. Chacun de ces documents répond à une obligation légale et apporte un éclairage spécifique sur la SCPI. Lire ces documents est indispensable pour comprendre ce que l'on achète et éviter de se fier uniquement à une plaquette commerciale ou à un classement.",
    "Le DIC (Document d'Informations Clés) est le document synthétique obligatoire remis avant toute souscription. Il résume le niveau de risque (échelle de 1 à 7), la durée de détention recommandée, les frais (souscription, gestion), des scénarios de performance et le coût dans le temps. Sa lecture est rapide mais ne dispense pas de consulter les autres documents. Le DIC est standardisé pour permettre une première comparaison entre SCPI.",
    "La note d'information (ou prospectus) est le document réglementaire central. Elle détaille le fonctionnement de la SCPI, sa stratégie d'investissement, ses frais (souscription, gestion, acquisition, cession), ses risques, ses modalités de souscription et de retrait, sa fiscalité et sa durée de vie recommandée. La note d'information est visée par l'AMF, ce qui atteste de sa conformité réglementaire mais pas de la qualité de l'investissement.",
    "Les statuts de la SCPI sont le document fondateur qui définit les règles de fonctionnement : objet social, droits des associés, modalités de prise de décision en assemblée générale, règles de souscription et de retrait, répartition des bénéfices. La lecture des statuts permet de comprendre les droits et obligations de l'associé et les conditions de sortie de la SCPI.",
    "Le rapport annuel est publié chaque année par la société de gestion. Il présente les comptes annuels (bilan, compte de résultat, annexes), le rapport de gestion, l'évolution du patrimoine immobilier, le taux d'occupation financier (TOF), la collecte nette, le prix de souscription et de retrait, et les perspectives. Le rapport annuel est le document de référence pour analyser la santé financière de la SCPI.",
    "Le bulletin trimestriel est une publication périodique qui suit l'actualité de la SCPI entre deux rapports annuels. Il présente la collecte du trimestre, les acquisitions et cessions, l'évolution du taux d'occupation, les dividendes versés et les faits marquants. Le rapport extra-financier (article 29 de la loi énergie-climat ou SFDR) complète ces documents avec les informations ESG (environnementales, sociales et de gouvernance).",
  ],
  tableTitle: 'Document / Ce qu\'il contient / Pourquoi le lire / Vigilance',
  tableRows: [
    {
      level: 'DIC (Document d\'Informations Clés)',
      advantage: 'Synthèse standardisée : risque, frais, durée recommandée, scénarios de performance.',
      vigilance: 'Les scénarios sont indicatifs. Le DIC ne remplace pas la note d\'information pour comprendre le fonctionnement détaillé.',
    },
    {
      level: 'Note d\'information (prospectus)',
      advantage: 'Document complet : fonctionnement, frais, risques, fiscalité, souscription, retrait, stratégie.',
      vigilance: 'Vérifier la date du visa AMF. Une note d\'information ancienne peut ne pas refléter la situation actualisée de la SCPI.',
    },
    {
      level: 'Statuts de la SCPI',
      advantage: 'Règles de fonctionnement, droits des associés, modalités de sortie, répartition des bénéfices.',
      vigilance: 'Les statuts sont rarement mis à jour. Vérifier qu\'ils correspondent à la version en vigueur.',
    },
    {
      level: 'Rapport annuel',
      advantage: 'Comptes annuels, TOF, collecte, patrimoine, perspectives. Document de référence pour l\'analyse financière.',
      vigilance: 'Les données sont historiques. Un bon rapport annuel passé ne préjuge pas de la performance future.',
    },
    {
      level: 'Bulletin trimestriel',
      advantage: 'Suivi en temps réel de la collecte, des acquisitions, du TOF et des dividendes.',
      vigilance: 'Un trimestre isolé peut être atypique. Analyser la tendance sur plusieurs trimestres.',
    },
    {
      level: 'Rapport extra-financier (ESG)',
      advantage: 'Informations sur la stratégie environnementale, sociale et de gouvernance de la SCPI.',
      vigilance: 'Les méthodologies ESG varient selon les sociétés de gestion. Comparer avec précaution.',
    },
  ],
  tableNote:
    'Chaque document apporte une pièce du puzzle. L\'analyse complète d\'une SCPI nécessite la lecture croisée de plusieurs documents réglementaires.',
  criteriaTitle: 'Pourquoi lire plusieurs documents',
  criteriaCards: [
    {
      title: 'Le DIC pour une première orientation',
      text: 'Le DIC permet de comparer rapidement le risque, les frais et la durée recommandée entre plusieurs SCPI. Il constitue un premier filtre utile mais insuffisant.',
    },
    {
      title: 'La note d\'information pour approfondir',
      text: 'La note d\'information détaille ce que le DIC résume : stratégie, frais réels, modalités de souscription et de retrait, fiscalité. C\'est le document à lire avant toute décision.',
    },
    {
      title: 'Le rapport annuel pour vérifier la santé financière',
      text: 'Le rapport annuel permet de vérifier la cohérence entre la stratégie annoncée et les résultats réalisés : TOF, collecte, endettement, qualité du patrimoine.',
    },
    {
      title: 'Les statuts pour connaître ses droits',
      text: 'Les statuts définissent les droits de vote, les conditions de retrait et la répartition des bénéfices. Leur lecture est utile avant de devenir associé.',
    },
    {
      title: 'Le bulletin trimestriel pour le suivi',
      text: 'Entre deux rapports annuels, le bulletin trimestriel permet de suivre l\'actualité de la SCPI et de détecter les évolutions importantes.',
    },
  ],
  commonErrors: [
    'Se fier uniquement à la plaquette commerciale sans lire les documents réglementaires.',
    'Confondre le DIC avec une analyse complète de la SCPI : le DIC est une synthèse, pas un document d\'analyse.',
    'Ne pas vérifier la date des documents réglementaires : des documents obsolètes peuvent donner une image inexacte.',
    'Lire le rapport annuel sans le comparer aux années précédentes pour identifier les tendances.',
    'Ignorer les statuts et découvrir les conditions de retrait uniquement au moment de vouloir revendre ses parts.',
    'Ne pas consulter le rapport extra-financier alors que les critères ESG peuvent avoir un impact sur la performance locative et la valorisation du patrimoine à long terme.',
  ],
  practicalCases: [
    {
      title: 'Investisseur comparant deux SCPI via leurs documents réglementaires',
      text: 'Un investisseur télécharge le DIC et la note d\'information de deux SCPI. Il compare les frais de souscription, la durée de détention recommandée et le niveau de risque. Il constate que des frais différents impactent le rendement net. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.',
    },
    {
      title: 'Investisseur lisant le rapport annuel avant d\'investir',
      text: 'Un investisseur consulte le rapport annuel d\'une SCPI pour vérifier le TOF, la collecte nette et l\'évolution du prix de part. Il constate une baisse du TOF sur les deux derniers exercices et décide d\'approfondir son analyse. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.',
    },
    {
      title: 'Investisseur découvrant les conditions de retrait dans les statuts',
      text: 'Avant d\'investir, un investisseur lit les statuts de la SCPI et découvre que le retrait est soumis à un préavis de 6 mois et à un plafond annuel de retraits. Il intègre cette contrainte de liquidité dans son analyse. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.',
    },
  ],
  methodParagraphs: [
    'La méthode MaximusSCPI repose sur l\'analyse croisée de l\'ensemble des documents réglementaires. Nous ne nous arrêtons pas au DIC : chaque SCPI fait l\'objet d\'une lecture de sa note d\'information, de son rapport annuel et de ses statuts.',
    'Le Cabinet Eric Bellaiche, CGP-CIF inscrit ORIAS n°13001580, utilise ces documents comme source principale pour ses analyses et pré-orientations pédagogiques. Les données extraites sont vérifiées et sourcées.',
    'MaximusSCPI met à disposition un comparateur qui s\'appuie sur les données issues des documents réglementaires. L\'analyse personnalisée reste réalisée par un CGP-CIF dans le cadre d\'un accompagnement adapté à chaque situation.',
  ],
  conclusionParagraphs: [
    'Les documents réglementaires d\'une SCPI forment un ensemble cohérent qui permet à l\'investisseur de comprendre ce qu\'il achète. DIC, note d\'information, statuts, rapport annuel, bulletin trimestriel et rapport extra-financier : chaque document a sa fonction et son importance.',
    'Sources : site AMF (amf-france.org), registre ORIAS (orias.fr), documents réglementaires des SCPI (note d\'information, DIC, rapport annuel, statuts), code monétaire et financier.',
    'Ne vous limitez pas à la plaquette commerciale. Prenez le temps de lire les documents réglementaires avant toute souscription de SCPI. Consultez un CGP-CIF pour vous accompagner dans cette analyse.',
  ],
  faqItems: [
    {
      question: 'Quels sont les documents réglementaires obligatoires d\'une SCPI ?',
      answer: 'Le DIC, la note d\'information, les statuts, le rapport annuel et le bulletin trimestriel sont les principaux documents réglementaires. Le rapport extra-financier peut être obligatoire selon la taille de la SCPI.',
    },
    {
      question: 'Le DIC suffit-il pour analyser une SCPI ?',
      answer: 'Non. Le DIC est une synthèse utile pour une première comparaison, mais il ne remplace pas la lecture de la note d\'information qui contient les informations détaillées sur les frais, les risques et le fonctionnement.',
    },
    {
      question: 'Où trouver les documents réglementaires d\'une SCPI ?',
      answer: 'Sur le site de la société de gestion, sur les plateformes de distribution, ou sur demande auprès du conseiller. Les SCPI cotées publient également leurs documents sur les sites d\'information financière.',
    },
    {
      question: 'À quelle fréquence les documents sont-ils mis à jour ?',
      answer: 'Le rapport annuel est publié une fois par an. Le bulletin trimestriel est publié chaque trimestre. La note d\'information est mise à jour lors des évolutions significatives. Le DIC est actualisé au moins une fois par an.',
    },
    {
      question: 'Que vérifier en priorité dans la note d\'information ?',
      answer: 'Les frais (souscription, gestion, acquisition, cession), les risques, les modalités de souscription et de retrait, la fiscalité, et la stratégie d\'investissement.',
    },
    {
      question: 'Les statuts d\'une SCPI sont-ils modifiables ?',
      answer: 'Oui, les statuts peuvent être modifiés par décision de l\'assemblée générale des associés, selon les règles prévues dans les statuts eux-mêmes.',
    },
    {
      question: 'Que faire si les documents réglementaires ne sont pas accessibles ?',
      answer: 'C\'est un signal d\'alerte. La société de gestion est tenue de mettre ces documents à disposition. En l\'absence de transparence, il est préférable de ne pas investir.',
    },
    {
      question: 'Le visa AMF garantit-il la qualité des documents ?',
      answer: 'Le visa AMF atteste de la conformité réglementaire de la note d\'information. Il ne valide pas la pertinence de l\'investissement ni ses perspectives de rendement.',
    },
    {
      question: 'Comment MaximusSCPI utilise les documents réglementaires ?',
      answer: 'MaximusSCPI extrait et analyse les données des documents réglementaires pour alimenter son comparateur. Chaque donnée est sourcée et vérifiée. L\'analyse personnalisée est réalisée par un CGP-CIF.',
    },
    {
      question: 'Peut-on investir en SCPI sans lire les documents réglementaires ?',
      answer: 'C\'est déconseillé. Les documents réglementaires contiennent des informations essentielles sur les frais, les risques, la liquidité et les conditions de souscription. Leur lecture est une étape obligatoire d\'une analyse sérieuse.',
    },
  ],
  comparateurCtaLabel: 'Analyser les documents SCPI avant de comparer les rendements',
}
