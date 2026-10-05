import type { ScpiEducationalPageConfig } from './shared'

export const assuranceVieScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-assurance-vie',
  badge: 'Enveloppe d’investissement',
  h1: 'SCPI en assurance-vie : avantages, limites, fiscalité et liquidité',
  heroSubtitle:
    'Détenir une exposition à des SCPI via un contrat d’assurance-vie peut permettre de capitaliser dans l’enveloppe et de bénéficier de sa fiscalité lors des rachats. En contrepartie, l’investisseur dépend des supports référencés, des frais et des règles du contrat. L’assurance-vie ne transforme ni la qualité ni le risque de la SCPI sous-jacente.',
  seoTitle: 'SCPI en assurance-vie : fiscalité, frais, liquidité et transmission',
  seoDescription:
    'SCPI en assurance-vie : fonctionnement des unités de compte, fiscalité des rachats, frais, liquidité, IFI, transmission et comparaison avec la détention directe.',
  shortAnswerTitle: 'Pourquoi détenir des SCPI via une assurance-vie ?',
  shortAnswer:
    'L’assurance-vie permet d’accéder à certaines SCPI sous forme d’unités de compte et de différer l’imposition personnelle jusqu’au rachat. Lors d’un rachat, seule la quote-part de gains comprise dans le retrait est fiscalisée selon l’ancienneté du contrat et les règles applicables. L’intérêt doit être comparé aux frais du contrat, aux supports disponibles, au traitement des distributions, à la liquidité, à l’IFI et aux objectifs de transmission.',
  keyMessage:
    'L’assurance-vie est une enveloppe, pas un accélérateur de rendement : son intérêt vient du cadre fiscal et patrimonial, à comparer à ses frais et contraintes.',
  definitionParagraphs: [
    'Dans un contrat d’assurance-vie, le souscripteur détient des droits exprimés en unités de compte. Il ne devient pas directement associé de la SCPI de la même manière qu’en détention directe ; l’assureur porte juridiquement les actifs représentatifs du contrat selon ses conditions.',
    'Les produits générés dans le contrat ne sont pas imposés chaque année comme des revenus fonciers au nom du souscripteur. Lors d’un rachat, la fiscalité porte sur la quote-part de gains incluse dans la somme retirée.',
    'Après huit ans, un abattement annuel sur les gains retirés peut s’appliquer : 4 600 € pour une personne seule et 9 200 € pour un couple soumis à imposition commune. Les modalités de taxation dépendent aussi de la date et du montant des versements.',
    'Les frais doivent être lus dans les conditions du contrat et la documentation du support : frais sur versement éventuels, frais de gestion du contrat, frais spécifiques au support et conditions de souscription ou de sortie. Il ne faut pas retrancher une seconde fois des frais déjà pris en compte dans le taux de distribution publié par une SCPI.',
    'Le traitement des distributions varie selon les contrats : certains reversent tout ou partie du revenu dans le contrat, d’autres appliquent des modalités spécifiques. Il n’existe pas de « taux de reversement » universel applicable à toutes les assurances-vie.',
    'La gamme de SCPI est limitée aux supports référencés par l’assureur. Une bonne SCPI disponible en direct peut ne pas être accessible dans le contrat, et les conditions d’accès peuvent évoluer.',
    'La liquidité d’une assurance-vie repose sur l’obligation de rachat du contrat par l’assureur, dans les conditions légales et contractuelles. Il ne faut toutefois pas promettre un délai fixe de quelques heures ou quelques jours : le traitement dépend du contrat, des pièces, du support et des circonstances.',
    'Les unités de compte immobilières d’un contrat rachetable ne sont pas automatiquement hors IFI. La fraction de la valeur de rachat représentative d’actifs immobiliers imposables peut entrer dans l’assiette.',
    'Le régime successoral de l’assurance-vie peut être favorable mais dépend notamment de l’âge de l’assuré lors des versements, de leur date, des bénéficiaires et des règles fiscales applicables. L’abattement de 152 500 € par bénéficiaire ne doit pas être présenté comme applicable à tous les versements sans condition.',
    'Le capital investi en unités de compte n’est pas garanti. Les risques de baisse de valeur, de revenu et de marché immobilier demeurent.',
  ],
  tableTitle: 'Mode de détention / atouts / vigilances',
  tableRows: [
    { level: 'SCPI en direct', advantage: 'Détention directe, univers plus large, crédit et démembrement possibles.', vigilance: 'Fiscalité annuelle des revenus, liquidité non garantie et frais propres à la SCPI.' },
    { level: 'SCPI en assurance-vie', advantage: 'Fiscalité au rachat, capitalisation dans l’enveloppe et cadre successoral spécifique.', vigilance: 'Frais du contrat, choix limité, modalités de distributions, rachat et IFI des UC immobilières.' },
    { level: 'SCPI en nue-propriété', advantage: 'Pas de distribution au nu-propriétaire pendant la période et prix décoté selon la clé.', vigilance: 'Absence de revenus, durée et risque sur la valeur future de la part.' },
    { level: 'SCPI via société', advantage: 'Cadre de détention pouvant répondre à des objectifs de capitalisation ou transmission.', vigilance: 'Comptabilité, fiscalité de la société et des distributions, IFI et coûts juridiques à étudier.' },
  ],
  tableNote:
    'Comparer les modes de détention avec les mêmes hypothèses de rendement et en intégrant tous les frais et impôts. Les caractéristiques varient fortement d’un contrat à l’autre.',
  criteriaTitle: 'Critères à vérifier avant de choisir une assurance-vie',
  criteriaCards: [
    { title: 'Frais du contrat', text: 'Lire les frais de gestion UC, frais sur versement éventuels et frais spécifiques au support.' },
    { title: 'Traitement des distributions', text: 'Vérifier comment le contrat crédite ou réinvestit les revenus de la SCPI.' },
    { title: 'Supports disponibles', text: 'Contrôler la liste réelle des SCPI accessibles et les éventuels plafonds d’investissement.' },
    { title: 'Fiscalité des rachats', text: 'Simuler la quote-part de gains imposable selon l’ancienneté et l’historique des versements.' },
    { title: 'Liquidité', text: 'Lire les conditions et délais de rachat ; ne pas confondre liquidité du contrat et liquidité intrinsèque de la SCPI.' },
    { title: 'IFI', text: 'Vérifier la fraction immobilière taxable communiquée par l’assureur.' },
    { title: 'Transmission', text: 'Analyser l’âge aux versements, la clause bénéficiaire et le régime fiscal applicable.' },
    { title: 'Qualité de la SCPI', text: 'TOF, prix de part, endettement, patrimoine et liquidité restent à analyser même dans une enveloppe.' },
  ],
  commonErrors: [
    'Affirmer que l’assurance-vie rend une SCPI plus performante par elle-même.',
    'Déduire deux fois les frais de gestion immobilière déjà intégrés dans les distributions publiées.',
    'Utiliser un taux de reversement standard qui n’existe pas pour tous les contrats.',
    'Promettre un rachat en 48 ou 72 heures.',
    'Présenter les unités de compte immobilières comme automatiquement hors IFI.',
    'Présenter l’abattement successoral de 152 500 € comme universel sans conditions liées notamment à l’âge et aux versements.',
  ],
  practicalCases: [
    { title: 'Comparaison directe', text: 'Un investisseur compare la même SCPI en direct et dans un contrat qui la référence. Il utilise le rendement effectivement crédité, les frais de l’enveloppe et la fiscalité de chaque mode plutôt qu’un taux théorique standard.' },
    { title: 'Rachat après huit ans', text: 'Le souscripteur retire une partie de son contrat. Seule la quote-part de gains du rachat est fiscalisée ; l’abattement annuel éventuel s’applique aux gains selon les règles en vigueur.' },
    { title: 'Transmission', text: 'La clause bénéficiaire et la date des versements sont analysées avant d’estimer le régime fiscal successoral. Aucun abattement n’est appliqué mécaniquement sans vérifier les conditions.' },
    { title: 'IFI', text: 'L’assureur communique la fraction de la valeur de rachat représentative d’unités de compte immobilières imposables. Cette information est utilisée dans la déclaration IFI du foyer concerné.' },
  ],
  methodParagraphs: [
    'Comparer le même support ou des supports équivalents entre direct et assurance-vie.',
    'Recenser les frais réellement prélevés par le contrat et le support sans double comptage.',
    'Simuler un rachat selon l’ancienneté du contrat et l’historique des versements.',
    'Contrôler les conditions de liquidité, l’IFI et le traitement successoral avec la documentation contractuelle.',
    'Revenir ensuite à la qualité immobilière de la SCPI : une enveloppe fiscale ne corrige pas un actif fragile.',
  ],
  conclusionParagraphs: [
    'L’assurance-vie peut être un bon cadre de détention des SCPI pour capitaliser, organiser des rachats ou préparer une transmission.',
    'Son intérêt dépend des frais, du contrat, des SCPI référencées et de la situation fiscale du souscripteur.',
    'La comparaison doit être réalisée net de frais et d’impôt, avec une lecture exacte des conditions contractuelles.',
  ],
  faqItems: [
    { question: 'Peut-on acheter des SCPI en assurance-vie ?', answer: 'Oui, lorsque le contrat référence des supports en unités de compte exposés à des SCPI. Le souscripteur détient des droits sur le contrat et non directement les parts comme en détention en direct.' },
    { question: 'Les revenus sont-ils imposés chaque année ?', answer: 'Pas comme des revenus fonciers au nom du souscripteur. La fiscalité de l’assurance-vie intervient lors des rachats sur la quote-part de gains incluse dans le retrait.' },
    { question: 'L’assurance-vie garantit-elle une meilleure liquidité ?', answer: 'Elle organise le rachat au niveau du contrat, mais le délai réel dépend des conditions contractuelles et du traitement par l’assureur. Aucun délai fixe ne doit être garanti.' },
    { question: 'Les SCPI en assurance-vie sont-elles hors IFI ?', answer: 'Pas automatiquement. Dans un contrat rachetable, la fraction de la valeur de rachat représentative d’unités de compte immobilières imposables peut entrer dans l’IFI.' },
    { question: 'L’abattement de 152 500 € s’applique-t-il toujours ?', answer: 'Non. Le régime successoral dépend notamment de l’âge de l’assuré lors des versements et des règles applicables. Il faut vérifier le cas concret.' },
  ],
  comparateurCtaLabel: 'Comparer les SCPI et modes de détention',
}
