import type { ScpiEducationalPageConfig } from './shared'

export const demembrementScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-demembrement',
  badge: 'Mode d\'investissement',
  h1: 'SCPI en démembrement : comprendre la nue-propriété avant d\'investir',
  heroSubtitle:
    'Le démembrement sépare la nue-propriété des parts et leur usufruit pendant une durée déterminée. Le nu-propriétaire ne perçoit pas les distributions pendant cette période et acquiert ses droits selon une clé de démembrement. À l\'échéance, l\'usufruit s\'éteint et la pleine propriété se reconstitue selon les règles civiles applicables.',
  seoTitle: 'SCPI démembrement : nue-propriété, durée, clé, fiscalité et IFI',
  seoDescription:
    'SCPI en démembrement : nue-propriété, usufruit, clé de répartition, absence de revenus, IFI, liquidité, reconstitution et points de vigilance.',
  shortAnswerTitle: 'Pourquoi envisager la nue-propriété de SCPI ?',
  shortAnswer:
    'La nue-propriété peut convenir à un investisseur qui n\'a pas besoin de revenus pendant une durée connue. Le prix payé correspond à la valeur économique de la nue-propriété selon la clé proposée ; l\'usufruitier reçoit les distributions pendant la période. À l\'échéance, le nu-propriétaire retrouve la pleine propriété. Le mécanisme n\'est pas une remise gratuite ni une exonération fiscale générale : il faut comparer la clé, l\'horizon, la qualité de la SCPI, l\'IFI et la liquidité.',
  keyMessage:
    'Le démembrement modifie les droits économiques et leur calendrier. Il ne réduit ni le risque immobilier ni le besoin d\'analyser la SCPI sous-jacente.',
  definitionParagraphs: [
    'Le démembrement sépare la propriété des parts entre un nu-propriétaire et un usufruitier. Pendant le démembrement, les droits financiers et politiques sont répartis selon la loi, les statuts de la SCPI et les conventions applicables.',
    'Dans un démembrement temporaire, la durée est fixée dès l\'origine. La société de gestion ou la plateforme peut proposer plusieurs clés de répartition entre nue-propriété et usufruit ; ces clés sont commerciales et économiques, et ne constituent pas une garantie de performance.',
    'Le nu-propriétaire ne perçoit normalement pas les distributions attachées à l\'usufruit pendant la durée du démembrement. Il ne faut donc pas présenter l\'opération comme un placement de revenus différés : les revenus de la période appartiennent à l\'usufruitier et ne sont pas récupérés ultérieurement par le nu-propriétaire.',
    'À l\'extinction de l\'usufruit temporaire, la pleine propriété se reconstitue au profit du nu-propriétaire. En principe, l\'extinction de l\'usufruit par arrivée du terme ne constitue pas une nouvelle acquisition à prix de marché ; les modalités civiles, fiscales et administratives doivent néanmoins être vérifiées selon le montage.',
    'La fiscalité courante du nu-propriétaire est différente de celle d\'un associé en pleine propriété puisqu\'il ne perçoit pas les revenus attribués à l\'usufruitier. Cela n\'équivaut pas à une « économie d\'impôt » certaine : la comparaison doit porter sur le prix payé, l\'absence de distributions et la valeur future des parts.',
    'En matière d\'IFI, l\'article 968 du CGI prévoit un principe d\'imposition chez l\'usufruitier sur la valeur en pleine propriété, avec des exceptions selon l\'origine du démembrement. Il faut donc éviter d\'affirmer que la nue-propriété est toujours hors IFI.',
    'La cession d\'une nue-propriété avant le terme peut être difficile : il faut un acquéreur compatible, l\'accord ou les formalités prévues par la société de gestion et une valorisation des droits restants. La liquidité est donc généralement plus contrainte qu\'en pleine propriété.',
    'La performance finale dépend toujours de la SCPI : évolution du prix de part, valeurs d\'expertise, qualité du patrimoine, endettement, collecte, retraits et gestion locative.',
  ],
  tableTitle: 'Durée / Intérêt potentiel / Vigilance',
  tableRows: [
    {
      level: 'Durée courte',
      advantage:
        'Immobilisation plus limitée et visibilité plus proche sur la reconstitution de la pleine propriété.',
      vigilance:
        'La clé peut offrir un écart de prix limité ; comparer précisément la valeur économique avec la pleine propriété.',
    },
    {
      level: 'Durée intermédiaire',
      advantage:
        'Peut correspondre à un horizon de retraite, de disponibilité future ou de baisse attendue du besoin de liquidité.',
      vigilance:
        'Aucun revenu pendant la période pour le nu-propriétaire ; vérifier le besoin de trésorerie et la qualité de la SCPI.',
    },
    {
      level: 'Durée longue',
      advantage:
        'Prix de nue-propriété généralement plus faible en proportion de la pleine propriété selon la clé proposée.',
      vigilance:
        'Risque immobilier, réglementaire et de valorisation plus long ; liquidité particulièrement contrainte.',
    },
  ],
  tableNote:
    'Les clés de démembrement varient selon les SCPI, les durées, les contreparties et les conditions de marché. Il faut utiliser la clé effectivement proposée au moment de l\'opération.',
  criteriaTitle: 'Critères à croiser avec le démembrement',
  criteriaCards: [
    { title: 'Qualité de la SCPI', text: 'TOF, valeurs, endettement, liquidité, collecte, patrimoine et trajectoire restent prioritaires.' },
    { title: 'Durée', text: 'La durée doit être compatible avec l\'absence de distributions et l\'indisponibilité potentielle du capital.' },
    { title: 'Clé de démembrement', text: 'Comparer la valeur de nue-propriété proposée avec les distributions abandonnées et les scénarios de valeur future.' },
    { title: 'Liquidité', text: 'Une sortie avant terme peut être complexe et dépend du marché, de la société de gestion et des contreparties disponibles.' },
    { title: 'IFI', text: 'Vérifier l\'origine du démembrement et l\'application de l\'article 968 du CGI au cas précis.' },
    { title: 'Fiscalité future', text: 'À l\'issue du démembrement, les revenus futurs seront imposés selon les règles en vigueur lorsque le plein propriétaire les percevra.' },
    { title: 'Valeur des parts', text: 'La reconstitution de la pleine propriété ne garantit pas que le prix de part aura progressé.' },
    { title: 'Contrepartie usufruitière', text: 'Vérifier les modalités opérationnelles de constitution du démembrement et la solidité du processus de la société de gestion.' },
  ],
  commonErrors: [
    'Présenter la clé de nue-propriété comme une décote gratuite ou un rendement garanti.',
    'Parler d\'impôt « économisé » sans comparer avec les distributions auxquelles le nu-propriétaire renonce.',
    'Croire que les revenus non perçus seront récupérés à la fin du démembrement.',
    'Affirmer que la nue-propriété est toujours hors IFI sans vérifier l\'origine du démembrement.',
    'Sous-estimer la difficulté d\'une revente avant terme.',
    'Choisir une SCPI médiocre uniquement parce que sa clé de démembrement semble attractive.',
    'Utiliser une clé indicative ancienne au lieu de la clé réellement proposée.',
  ],
  practicalCases: [
    {
      title: 'Préparation d\'un revenu futur',
      text: 'Un investisseur n\'a pas besoin de distributions pendant plusieurs années mais souhaite retrouver la pleine propriété à une date proche de sa retraite. La nue-propriété peut être étudiée si la durée, la clé et la SCPI correspondent à cet horizon.',
    },
    {
      title: 'Besoin de revenus immédiats',
      text: 'Un investisseur cherche un complément de revenu dès aujourd\'hui. La nue-propriété n\'est pas cohérente avec cet objectif puisqu\'elle ne lui attribue pas les distributions pendant le démembrement.',
    },
    {
      title: 'IFI',
      text: 'Un foyer concerné par l\'IFI envisage un démembrement. Le traitement dépend de l\'origine juridique du démembrement et ne doit pas être déduit de la seule étiquette « nue-propriété ».',
    },
    {
      title: 'Sortie anticipée',
      text: 'Un besoin de liquidité apparaît avant le terme. La valeur de la nue-propriété restante doit être négociée et un acquéreur trouvé ; la vente peut donc être plus difficile qu\'une cession de pleine propriété.',
    },
    {
      title: 'Transmission',
      text: 'Une donation de nue-propriété est une stratégie distincte d\'une simple souscription en nue-propriété. Sa valorisation et ses droits obéissent à des règles civiles et fiscales spécifiques qui doivent être traitées avec le notaire.',
    },
  ],
  methodParagraphs: [
    'Vérifier d\'abord que l\'investisseur peut se passer de revenus et de liquidité pendant toute la durée retenue.',
    'Analyser la SCPI comme en pleine propriété : patrimoine, TOF, valeurs, dette, collecte, retraits, frais et gestionnaire.',
    'Récupérer la clé de démembrement réellement proposée et la comparer aux scénarios de distributions abandonnées et de valeur future.',
    'Examiner les règles de sortie anticipée et les conditions de cession des droits démembrés.',
    'Vérifier le traitement IFI au regard de l\'article 968 du CGI et de l\'origine du démembrement.',
    'Distinguer une souscription en nue-propriété d\'une opération de donation ou de transmission, qui répond à d\'autres règles.',
    'Valider l\'opération avec les professionnels concernés lorsque les enjeux fiscaux, successoraux ou sociétaires sont significatifs.',
  ],
  conclusionParagraphs: [
    'La nue-propriété de SCPI peut être cohérente lorsque l\'investisseur accepte l\'absence de revenus et une liquidité réduite jusqu\'à une échéance connue.',
    'La clé de démembrement doit être analysée comme un prix économique, pas comme une remise ni comme une économie fiscale garantie.',
    'La qualité de la SCPI et le traitement IFI du cas précis restent déterminants.',
  ],
  faqItems: [
    {
      question: 'Qu\'est-ce que le démembrement de SCPI ?',
      answer: 'Il sépare la nue-propriété des parts et leur usufruit. L\'usufruitier reçoit les distributions pendant la période et le nu-propriétaire retrouve la pleine propriété à l\'extinction de l\'usufruit.',
    },
    {
      question: 'Pourquoi la nue-propriété coûte-t-elle moins cher ?',
      answer: 'Parce que le nu-propriétaire n\'a pas droit aux distributions pendant la durée du démembrement. La clé traduit la valeur économique respective des deux droits.',
    },
    {
      question: 'Les revenus non perçus sont-ils récupérés à la fin ?',
      answer: 'Non. Les distributions de la période appartiennent à l\'usufruitier. Le nu-propriétaire récupère la pleine propriété pour l\'avenir.',
    },
    {
      question: 'Peut-on revendre avant le terme ?',
      answer: 'Oui dans certains cas, mais la cession d\'un droit démembré peut être difficile et dépend des règles de la SCPI et des contreparties disponibles.',
    },
    {
      question: 'La nue-propriété est-elle toujours hors IFI ?',
      answer: 'Non. Le traitement dépend notamment de l\'origine du démembrement et des exceptions prévues par l\'article 968 du CGI.',
    },
    {
      question: 'La reconstitution de la pleine propriété déclenche-t-elle forcément un impôt ?',
      answer: 'L\'extinction normale de l\'usufruit n\'est pas assimilée à une nouvelle souscription en pleine propriété, mais le traitement exact doit être vérifié selon le montage et les règles applicables.',
    },
    {
      question: 'Le démembrement protège-t-il contre une baisse du prix de part ?',
      answer: 'Non. Le prix de part et la valeur économique de la SCPI peuvent baisser pendant la durée du démembrement.',
    },
    {
      question: 'La donation de nue-propriété est-elle la même chose ?',
      answer: 'Non. Une donation de nue-propriété est une opération de transmission soumise à ses propres règles de valorisation et de droits. Elle ne doit pas être confondue avec une simple souscription démembrée.',
    },
    {
      question: 'Comment MaximusSCPI analyse le démembrement ?',
      answer: 'MaximusSCPI croise la clé proposée, la durée, la liquidité, l\'IFI et la qualité de la SCPI afin de comparer le démembrement avec la pleine propriété et les autres modes de détention.',
    },
  ],
  comparateurCtaLabel: 'Étudier la nue-propriété de SCPI selon votre horizon',
}
