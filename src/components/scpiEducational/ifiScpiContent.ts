import type { ScpiEducationalPageConfig } from './shared'

export const ifiScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-ifi/',
  badge: 'Fiscalité SCPI',
  h1: 'SCPI et IFI : faut-il déclarer ses parts ?',
  heroSubtitle:
    'Les parts de SCPI peuvent entrer dans l\'assiette de l\'Impôt sur la Fortune Immobilière (IFI) selon le mode de détention et la fraction immobilière. Cette page explique les grands principes sans se substituer à un conseil fiscal personnalisé.',
  seoTitle: 'SCPI IFI : déclaration, valorisation et points de vigilance',
  seoDescription:
    'Comprenez le traitement des SCPI à l\'IFI : parts imposables, valeur à déclarer, détention en direct, assurance-vie, nue-propriété, SCI et points de vigilance.',
  shortAnswerTitle: 'Les SCPI sont-elles imposables à l\'IFI ?',
  shortAnswer:
    'En principe, les parts de SCPI détenues en direct sont considérées comme des actifs immobiliers imposables à l\'IFI, à hauteur de leur valeur IFI communiquée par la société de gestion. Le traitement peut différer selon le mode de détention : assurance-vie, nue-propriété, usufruit ou SCI. Les modalités exactes dépendent de la situation patrimoniale de chaque investisseur.',
  keyMessage:
    'Les SCPI peuvent avoir un impact IFI. La valeur à retenir dépend du mode de détention, des informations transmises et de la situation patrimoniale.',
  definitionParagraphs: [
    'L\'Impôt sur la Fortune Immobilière (IFI) est un impôt annuel qui frappe le patrimoine immobilier net des personnes physiques dont la valeur dépasse un certain seuil. En 2026, le seuil et les taux sont à vérifier selon la réglementation en vigueur.',
    'Les parts de SCPI sont généralement considérées comme des actifs immobiliers pour l\'IFI, car elles représentent une fraction d\'un patrimoine composé majoritairement d\'immeubles. La valeur à déclarer est la valeur IFI communiquée par la société de gestion.',
    'La société de gestion transmet chaque année une valeur IFI par part, qui peut différer du prix de souscription ou de la valeur de reconstitution. Cette valeur tient compte de la quote-part immobilière du patrimoine de la SCPI.',
    'En assurance-vie, les parts de SCPI détenues en unités de compte (UC) ne sont généralement pas imposables à l\'IFI, car elles sont considérées comme des actifs financiers au sein du contrat. Ce principe mérite d\'être vérifié selon la situation.',
    'En démembrement, le traitement IFI diffère entre le nu-propriétaire et l\'usufruitier : en principe, l\'usufruitier déclare la valeur des parts à l\'IFI. En cas de démembrement temporaire, les règles peuvent varier.',
    'Les dettes contractées pour l\'acquisition de parts de SCPI peuvent, sous conditions, être déductibles du patrimoine IFI. Les modalités de déduction dépendent de la nature de la dette et de son affectation.',
  ],
  tableTitle: 'Traitement IFI selon le mode de détention',
  tableRows: [
    {
      level: 'Détention en direct',
      advantage: 'Valeur IFI communiquée par la société de gestion.',
      vigilance: 'Généralement imposable à l\'IFI. Valeur à déclarer chaque année.',
    },
    {
      level: 'Assurance-vie (UC)',
      advantage: 'Généralement non imposable à l\'IFI (actif financier du contrat).',
      vigilance: 'Principe à vérifier selon la situation et la réglementation.',
    },
    {
      level: 'Nue-propriété',
      advantage: 'L\'usufruitier déclare en principe la valeur à l\'IFI.',
      vigilance: 'Traitement variable selon la nature et la durée du démembrement.',
    },
    {
      level: 'Usufruit',
      advantage: 'L\'usufruitier déclare en principe la valeur à l\'IFI.',
      vigilance: 'À vérifier selon les règles applicables au démembrement.',
    },
    {
      level: 'SCI',
      advantage: 'Les parts de SCPI détenues par une SCI sont imposables à l\'IFI au niveau des associés selon leur quote-part.',
      vigilance: 'La valeur IFI doit être répartie. Déclaration à effectuer selon les règles de transparence.',
    },
    {
      level: 'Crédit',
      advantage: 'La dette d\'acquisition peut être déductible du patrimoine IFI sous conditions.',
      vigilance: 'Conditions de déductibilité à vérifier. Affectation de la dette à justifier.',
    },
  ],
  tableNote:
    'Les règles IFI peuvent évoluer. À vérifier selon la réglementation en vigueur au moment de la déclaration.',
  criteriaTitle: 'Critères à croiser avec l\'IFI',
  criteriaCards: [
    { title: 'Seuil IFI', text: 'L\'IFI s\'applique au-delà d\'un seuil de patrimoine immobilier net. À vérifier selon la réglementation.' },
    { title: 'Valeur IFI', text: 'Communiquée chaque année par la société de gestion. À utiliser pour la déclaration.' },
    { title: 'Mode de détention', text: 'Direct, AV, nue-propriété, SCI : le traitement IFI peut varier.' },
    { title: 'Dette déductible', text: 'Les dettes d\'acquisition peuvent être déductibles sous conditions.' },
    { title: 'Patrimoine global', text: 'L\'IFI s\'apprécie au niveau du patrimoine immobilier net total, pas SCPI par SCPI.' },
  ],
  commonErrors: [
    'Oublier de déclarer les parts de SCPI à l\'IFI.',
    'Confondre prix de souscription et valeur IFI.',
    'Croire que l\'assurance-vie exonère automatiquement (c\'est généralement le cas, mais à vérifier).',
    'Négliger la déductibilité des dettes d\'acquisition.',
    'Ne pas répartir correctement la valeur en cas de détention via une SCI.',
  ],
  practicalCases: [
    {
      title: 'Détention directe avec valeur IFI',
      text: 'Un investisseur détient 100 parts de SCPI. Valeur IFI unitaire communiquée : 200 €. Valeur IFI totale : 20 000 €. Cette valeur s\'ajoute aux autres actifs immobiliers imposables.',
    },
    {
      title: 'Détention en assurance-vie',
      text: 'Un investisseur détient des parts de SCPI via un contrat d\'assurance-vie. Les parts sont considérées comme des actifs financiers du contrat. Elles ne sont généralement pas imposables à l\'IFI.',
    },
    {
      title: 'Détention avec crédit',
      text: 'Un investisseur a souscrit un emprunt de 50 000 € pour acquérir des parts de SCPI. Sous conditions, cette dette peut être déduite du patrimoine IFI, réduisant l\'assiette imposable.',
    },
  ],
  methodParagraphs: [
    'Vérifier si le patrimoine immobilier net dépasse le seuil IFI.',
    'Identifier les parts de SCPI détenues et leur mode de détention.',
    'Récupérer la valeur IFI communiquée par chaque société de gestion.',
    'Déduire les dettes éligibles sous conditions.',
    'Déclarer le patrimoine immobilier net selon les modalités en vigueur.',
  ],
  conclusionParagraphs: [
    'Les SCPI peuvent avoir un impact sur l\'IFI. Leur traitement dépend du mode de détention et de la valeur communiquée.',
    'Il est recommandé de vérifier chaque année la valeur IFI transmise par les sociétés de gestion et de s\'assurer de la correcte déclaration selon sa situation.',
  ],
  faqItems: [
    {
      question: 'Les SCPI entrent-elles dans l\'IFI ?',
      answer: 'En principe, les parts de SCPI détenues en direct sont considérées comme des actifs immobiliers imposables à l\'IFI. Leur valeur IFI est communiquée par la société de gestion.',
    },
    {
      question: 'Quelle valeur déclarer ?',
      answer: 'La valeur IFI communiquée par la société de gestion. Elle peut différer du prix de souscription ou de la valeur de reconstitution.',
    },
    {
      question: 'Qui fournit la valeur IFI ?',
      answer: 'La société de gestion transmet chaque année la valeur IFI par part. Elle figure généralement dans le bulletin trimestriel ou le relevé annuel.',
    },
    {
      question: 'Les SCPI en assurance-vie sont-elles concernées ?',
      answer: 'En règle générale, les SCPI détenues en unités de compte dans un contrat d\'assurance-vie ne sont pas imposables à l\'IFI. Ce principe est à vérifier selon la situation.',
    },
    {
      question: 'Que se passe-t-il en démembrement ?',
      answer: 'En principe, l\'usufruitier déclare la valeur des parts à l\'IFI. Les règles peuvent varier selon la nature du démembrement.',
    },
    {
      question: 'Peut-on déduire une dette ?',
      answer: 'Les dettes contractées pour l\'acquisition de parts de SCPI peuvent être déductibles sous conditions. L\'affectation et la nature de la dette doivent être justifiées.',
    },
    {
      question: 'Les SCPI européennes sont-elles concernées ?',
      answer: 'Les SCPI investies en Europe sont généralement soumises aux mêmes règles IFI que les SCPI françaises, sous réserve des conventions applicables.',
    },
    {
      question: 'Comment MaximusSCPI intègre l\'IFI ?',
      answer: 'MaximusSCPI intègre l\'IFI dans l\'analyse selon le mode de détention et les informations communiquées par les sociétés de gestion. L\'approche est pédagogique.',
    },
  ],
}
