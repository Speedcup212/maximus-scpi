import type { ScpiEducationalPageConfig } from './shared'

export const assuranceVieScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-assurance-vie',
  badge: 'Enveloppe d\'investissement',
  h1: 'SCPI en assurance-vie : avantages, limites et frais à analyser',
  heroSubtitle:
    'Détenir une exposition à des SCPI via un contrat d\'assurance-vie peut modifier la fiscalité, la liquidité contractuelle et la transmission, mais ajoute les règles et frais de l\'assureur. Il faut analyser le contrat autant que la SCPI sous-jacente.',
  seoTitle: 'SCPI en assurance-vie : fiscalité, frais, IFI, liquidité et transmission',
  seoDescription:
    'SCPI en assurance-vie : unités de compte, fiscalité des rachats, frais du contrat, taux de distribution crédité, IFI, liquidité et transmission.',
  shortAnswerTitle: 'Pourquoi détenir une SCPI via l\'assurance-vie ?',
  shortAnswer:
    'Dans un contrat d\'assurance-vie, l\'épargnant ne détient pas directement les parts : il détient une créance sur l\'assureur adossée à des unités de compte. Les revenus et variations de valeur restent dans le contrat tant qu\'il n\'y a pas de rachat ; lors d\'un rachat, seule la quote-part de gains comprise dans la somme retirée entre dans la fiscalité du rachat. En contrepartie, il faut intégrer les frais du contrat, les règles de valorisation, le niveau de distribution effectivement crédité et la liste de SCPI référencées.',
  keyMessage:
    'L\'assurance-vie change l\'enveloppe, pas la qualité de la SCPI. La comparaison doit se faire en net de frais, fiscalité, contraintes contractuelles et IFI éventuel.',
  definitionParagraphs: [
    'Les SCPI peuvent être référencées comme unités de compte dans certains contrats d\'assurance-vie. Juridiquement, les actifs sont détenus par l\'assureur ; le souscripteur détient des droits exprimés en unités de compte dans le contrat.',
    'Les revenus et variations de valeur ne déclenchent pas, à eux seuls, une imposition annuelle à l\'impôt sur le revenu chez le souscripteur. La fiscalité intervient notamment lors d\'un rachat, sur la fraction de gains comprise dans le montant retiré, selon l\'ancienneté du contrat, la date et le montant des primes ainsi que l\'option fiscale applicable.',
    'Après huit ans, un abattement annuel sur la fraction de gains imposable des rachats peut s\'appliquer selon les règles en vigueur. Cet abattement ne signifie pas que le rachat entier est exonéré.',
    'Le contrat peut prélever des frais de gestion sur les unités de compte et prévoir des modalités spécifiques sur les supports immobiliers : frais d\'entrée, décote éventuelle, pourcentage des distributions crédité, délai de jouissance ou contraintes d\'arbitrage. Il faut lire les conditions du contrat support par support.',
    'Le taux de distribution publié par la SCPI n\'est pas nécessairement le rendement crédité dans le contrat. Certains assureurs reversent l\'intégralité des distributions avant frais du contrat, d\'autres appliquent des règles différentes. La documentation contractuelle est la référence.',
    'Le choix de SCPI est limité aux supports référencés par l\'assureur. Cette sélection peut simplifier l\'accès mais restreindre la diversification et empêcher d\'acheter une SCPI non référencée.',
    'La liquidité relève du contrat d\'assurance-vie et des conditions applicables aux unités de compte. Un rachat n\'est pas équivalent à une vente directe de parts de SCPI et ne doit pas être présenté comme une liquidité garantie en quelques jours.',
    'En matière d\'IFI, une SCPI logée dans une assurance-vie rachetable n\'est pas automatiquement hors assiette : la fraction de la valeur de rachat représentative d\'actifs immobiliers imposables peut être taxable. L\'assureur fournit l\'information nécessaire lorsqu\'elle est applicable.',
    'Au décès, l\'assurance-vie bénéficie d\'un régime propre, mais le traitement dépend notamment de l\'âge lors des versements, de la date des primes et de la clause bénéficiaire. Le seuil de 152 500 € par bénéficiaire ne doit pas être présenté comme une règle universelle pour toutes les primes.',
    'Le risque économique de la SCPI subsiste : perte en capital, baisse des distributions, baisse de valeur des unités de compte et risque immobilier. L\'assurance-vie ne garantit pas le capital investi sur ces supports.',
  ],
  tableTitle: 'Mode de détention / Fiscalité / Frais / Liquidité / Vigilance',
  tableRows: [
    {
      level: 'SCPI en direct',
      advantage:
        'Détention directe des parts, accès à une offre plus large et lecture simple des distributions et de la liquidité propre à la SCPI.',
      vigilance:
        'Fiscalité annuelle des revenus selon leur nature et la situation de l\'associé. Liquidité non garantie.',
    },
    {
      level: 'SCPI en assurance-vie',
      advantage:
        'Capitalisation dans le contrat, fiscalité du rachat propre à l\'assurance-vie et régime civil/fiscal spécifique en cas de décès.',
      vigilance:
        'Frais et règles du contrat, choix limité, valorisation des UC, IFI potentiel et distribution effectivement créditée à vérifier.',
    },
    {
      level: 'SCPI en nue-propriété',
      advantage:
        'Absence de revenus pendant le démembrement et acquisition de la nue-propriété à une valeur décotée selon la clé retenue.',
      vigilance:
        'Aucun revenu pendant la période, liquidité réduite et traitement civil/fiscal à vérifier selon l\'origine du démembrement.',
    },
    {
      level: 'SCPI via SCI à l\'IS',
      advantage:
        'Capitalisation possible au niveau de la société après IS.',
      vigilance:
        'Coûts de structure, fiscalité de distribution et de sortie. Les parts de SCPI détenues en pleine propriété ne sont pas amortissables.',
    },
  ],
  tableNote:
    'Ce tableau est pédagogique. Les conditions exactes dépendent du contrat, de la SCPI, de la fiscalité applicable et de la situation de l\'investisseur.',
  criteriaTitle: 'Critères à croiser pour les SCPI en assurance-vie',
  criteriaCards: [
    { title: 'Frais du contrat', text: 'Vérifier les frais de gestion UC, de versement, d\'arbitrage et les éventuels frais spécifiques au support SCPI.' },
    { title: 'Distribution créditée', text: 'Comparer le taux de distribution de la SCPI avec la part réellement créditée dans le contrat après règles de l\'assureur et frais.' },
    { title: 'Choix de SCPI', text: 'Contrôler la liste des SCPI disponibles, leur qualité et la possibilité de construire une allocation réellement diversifiée.' },
    { title: 'Fiscalité du rachat', text: 'Simuler la quote-part de gains taxable selon l\'ancienneté du contrat, les primes et le régime fiscal applicable.' },
    { title: 'IFI', text: 'Si le foyer est concerné, récupérer auprès de l\'assureur la fraction de valeur de rachat représentative d\'actifs immobiliers imposables.' },
    { title: 'Liquidité contractuelle', text: 'Lire les conditions de rachat et d\'arbitrage propres aux unités de compte immobilières. Ne pas confondre délai contractuel et liquidité garantie.' },
    { title: 'Qualité de la SCPI', text: 'TOF, endettement, valeurs, collecte, liquidité et trajectoire restent déterminants, quelle que soit l\'enveloppe.' },
    { title: 'Horizon et transmission', text: 'L\'ancienneté du contrat et la clause bénéficiaire peuvent être importantes, mais les règles doivent être analysées selon l\'âge et la date des versements.' },
  ],
  commonErrors: [
    'Croire que l\'assurance-vie améliore mécaniquement la performance de la SCPI.',
    'Additionner ou comparer des frais sans lire la documentation exacte du contrat et du support.',
    'Supposer que 100 % de la distribution de la SCPI est toujours créditée au contrat.',
    'Présenter le rachat comme une liquidité garantie en quelques jours.',
    'Croire qu\'une SCPI logée en assurance-vie est automatiquement hors IFI.',
    'Présenter l\'abattement de 152 500 € au décès comme applicable à toutes les primes sans distinguer l\'âge et le régime fiscal.',
    'Comparer uniquement la fiscalité et négliger la qualité de la SCPI sous-jacente.',
  ],
  practicalCases: [
    {
      title: 'Comparaison en net de frais',
      text: 'Deux contrats référencent la même SCPI mais appliquent des frais UC et des règles de distribution différents. Le bon comparatif porte sur la performance réellement créditée dans chaque contrat, pas sur le seul taux de distribution publié par la SCPI.',
    },
    {
      title: 'Rachat après huit ans',
      text: 'Lors d\'un rachat, seule la fraction de gains comprise dans la somme retirée est concernée par la fiscalité du rachat. L\'abattement annuel après huit ans s\'applique à cette fraction de gains selon les règles en vigueur.',
    },
    {
      title: 'Contrat avec choix limité',
      text: 'Un contrat peut proposer peu de SCPI ou des SCPI de qualité inégale. Un avantage fiscal théorique ne compense pas automatiquement un univers d\'investissement trop restreint ou mal diversifié.',
    },
    {
      title: 'IFI',
      text: 'Un foyer soumis à l\'IFI détient des unités de compte investies en SCPI dans un contrat rachetable. Il doit utiliser l\'information fournie par l\'assureur pour déterminer la fraction immobilière imposable de la valeur de rachat.',
    },
    {
      title: 'Transmission',
      text: 'Le traitement au décès dépend notamment de l\'âge lors des versements et des règles applicables aux primes. La clause bénéficiaire et la chronologie des versements doivent être examinées avant de chiffrer l\'avantage successoral.',
    },
  ],
  methodParagraphs: [
    'Identifier la ou les SCPI pertinentes indépendamment de l\'enveloppe.',
    'Lire la notice du contrat et les annexes propres aux supports SCPI : frais, valorisation, distribution créditée, arbitrage et rachat.',
    'Comparer la détention directe et l\'assurance-vie sur un même horizon, en net de tous frais et de fiscalité.',
    'Simuler la fiscalité d\'un rachat sur la seule quote-part de gains et selon l\'ancienneté du contrat.',
    'Intégrer l\'IFI lorsque le foyer est concerné et récupérer les données officielles de l\'assureur.',
    'Analyser séparément l\'objectif de transmission et la clause bénéficiaire selon l\'âge et la date des versements.',
    'Ne retenir l\'assurance-vie que si le contrat et les supports disponibles restent cohérents avec l\'allocation patrimoniale.',
  ],
  conclusionParagraphs: [
    'L\'assurance-vie peut être une bonne enveloppe pour certaines SCPI, mais son intérêt doit être démontré en net de frais, fiscalité, contraintes contractuelles et IFI éventuel.',
    'La documentation du contrat et de l\'assureur prime sur les moyennes de marché pour les frais, le taux crédité et la liquidité.',
    'La qualité intrinsèque de la SCPI reste le premier filtre avant le choix de l\'enveloppe.',
  ],
  faqItems: [
    {
      question: 'Peut-on acheter des SCPI en assurance-vie ?',
      answer: 'Oui, lorsqu\'elles sont référencées comme unités de compte dans le contrat. Le souscripteur détient des droits dans le contrat ; l\'assureur détient les actifs correspondants.',
    },
    {
      question: 'Est-ce fiscalement plus intéressant qu\'en direct ?',
      answer: 'Pas automatiquement. Il faut comparer les frais, la fiscalité des rachats, l\'horizon, la distribution créditée et la situation fiscale de l\'investisseur.',
    },
    {
      question: 'Quels frais faut-il regarder ?',
      answer: 'Les frais du contrat et ceux propres au support SCPI : gestion UC, versement, arbitrage, éventuels frais d\'entrée et règles de valorisation. Les montants exacts figurent dans la documentation contractuelle.',
    },
    {
      question: 'Le rendement est-il reversé à 100 % ?',
      answer: 'Cela dépend du contrat. Il faut vérifier la part des distributions créditée à l\'unité de compte et les frais prélevés par l\'assureur.',
    },
    {
      question: 'La liquidité est-elle garantie ?',
      answer: 'Non au sens d\'une disponibilité instantanée et sans risque de valeur. Les rachats sont encadrés par le contrat et le Code des assurances, mais les unités de compte immobilières restent exposées à leur valorisation et à des contraintes spécifiques.',
    },
    {
      question: 'Les SCPI en assurance-vie sont-elles hors IFI ?',
      answer: 'Non, pas automatiquement. Dans un contrat rachetable, la fraction de la valeur de rachat représentative d\'actifs immobiliers imposables peut entrer dans l\'assiette IFI.',
    },
    {
      question: 'Quelle différence avec les SCPI en direct ?',
      answer: 'En direct, l\'investisseur détient les parts. En assurance-vie, il détient des droits dans un contrat adossé à des unités de compte, avec une fiscalité, des frais et des règles de sortie propres à l\'assureur.',
    },
    {
      question: 'Faut-il attendre huit ans pour racheter ?',
      answer: 'Non. Huit ans correspond à un jalon fiscal important, mais un rachat reste possible avant selon les conditions du contrat. Le traitement fiscal doit être calculé au moment du rachat.',
    },
    {
      question: 'Quel est l\'intérêt successoral ?',
      answer: 'L\'assurance-vie dispose d\'un régime spécifique au décès, mais l\'avantage dépend notamment de l\'âge lors des versements, des primes concernées et de la clause bénéficiaire.',
    },
    {
      question: 'Le capital est-il garanti ?',
      answer: 'Non. Les unités de compte investies en SCPI supportent un risque de perte en capital et de baisse de valeur.',
    },
    {
      question: 'Comment MaximusSCPI compare les SCPI en assurance-vie ?',
      answer: 'MaximusSCPI sépare la qualité de la SCPI de la qualité de l\'enveloppe puis compare les modes de détention en net de frais, fiscalité et contraintes.',
    },
  ],
  comparateurCtaLabel: 'Comparer SCPI en direct et SCPI en assurance-vie',
}
