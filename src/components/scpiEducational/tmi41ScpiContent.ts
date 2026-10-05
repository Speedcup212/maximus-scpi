import type { ScpiEducationalPageConfig } from './shared'

export const tmi41ScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-tmi-41',
  badge: 'Fiscalité & profil',
  h1: 'SCPI avec TMI 41 % : comment choisir le mode de détention ?',
  heroSubtitle:
    'Une TMI à 41 % accroît le poids fiscal potentiel des revenus fonciers français détenus en direct. Elle rend pertinente la comparaison avec l’assurance-vie, les SCPI européennes ou le démembrement, sans qu’aucune solution soit automatiquement supérieure.',
  seoTitle: 'SCPI TMI 41 % : fiscalité, assurance-vie, Europe et démembrement',
  seoDescription:
    'SCPI et TMI 41 % : comparer direct, assurance-vie, SCPI européennes, nue-propriété et crédit avec une approche fiscale réaliste et sans recommandation automatique.',
  shortAnswerTitle: 'Que change une TMI à 41 % pour un investissement SCPI ?',
  shortAnswer:
    'Elle peut rendre la fiscalité annuelle des revenus fonciers français particulièrement sensible, mais elle ne suffit pas à choisir une enveloppe. Il faut comparer le rendement net après fiscalité et frais, la convention fiscale des revenus étrangers, l’IFI, la liquidité, le besoin de revenus et l’horizon. Assurance-vie, Europe et démembrement sont des alternatives à étudier, pas des réponses automatiques.',
  keyMessage:
    'TMI élevée ne signifie pas « 100 % assurance-vie » : elle impose surtout une comparaison nette et documentée des modes de détention.',
  definitionParagraphs: [
    'La TMI de 41 % s’applique à la tranche supérieure du revenu imposable, pas à la totalité du revenu du foyer. Pour les revenus 2025 déclarés en 2026, cette tranche concerne la fraction par part comprise entre 84 578 € et 181 917 €.',
    'Les revenus fonciers français supplémentaires peuvent être imposés en partie à 41 %, auxquels s’ajoutent les prélèvements sociaux applicables. Charges et intérêts déductibles peuvent modifier le résultat imposable.',
    'Pour les actifs immobiliers étrangers, la convention fiscale applicable est déterminante : crédit d’impôt, taux effectif ou imposition locale peuvent modifier fortement le rendement net.',
    'L’assurance-vie permet une capitalisation au sein du contrat et une fiscalité lors des rachats sur la quote-part de gains. Après huit ans, un abattement annuel sur les gains retirés peut s’appliquer selon la situation familiale.',
    'La nue-propriété temporaire peut correspondre à un investisseur qui n’a pas besoin de revenus pendant la période de démembrement. Elle ne garantit ni la valeur future de la part ni une rentabilité déterminée.',
    'Une TMI élevée peut évoluer avant la retraite ou au cours de la détention. Le scénario fiscal futur doit donc être testé au lieu d’être figé sur la situation actuelle.',
  ],
  tableTitle: 'Option / intérêt possible / vigilance',
  tableRows: [
    { level: 'Direct France', advantage: 'Revenus immédiats, crédit possible, choix large.', vigilance: 'Frottement fiscal potentiellement élevé ; liquidité et frais à intégrer.' },
    { level: 'Direct Europe', advantage: 'Diversification et traitement fiscal potentiellement différent.', vigilance: 'Convention fiscale pays par pays, imposition locale et qualité immobilière.' },
    { level: 'Assurance-vie', advantage: 'Fiscalité différée jusqu’au rachat et cadre successoral spécifique.', vigilance: 'Frais, choix de supports, modalités de rachat et IFI éventuel des UC immobilières.' },
    { level: 'Nue-propriété', advantage: 'Pas de distribution au nu-propriétaire pendant la période.', vigilance: 'Capital immobilisé, absence de revenus et risque de valeur au terme.' },
    { level: 'Crédit', advantage: 'Effet de levier potentiel et déductibilité possible de certains intérêts.', vigilance: 'Coût du crédit, effort d’épargne et risque de distribution insuffisante.' },
  ],
  tableNote:
    'Les écarts fiscaux doivent être calculés avec les données du foyer et les règles en vigueur. La TMI seule ne détermine pas l’allocation.',
  criteriaTitle: 'Critères décisifs à TMI 41 %',
  criteriaCards: [
    { title: 'Fiscalité marginale', text: 'Mesurer l’impôt réellement ajouté par les distributions, pas un taux théorique appliqué au capital.' },
    { title: 'Besoin de revenus', text: 'Assurance-vie capitalisante et nue-propriété ne répondent pas au même besoin qu’une détention directe distributive.' },
    { title: 'Conventions fiscales', text: 'Les revenus étrangers doivent être ventilés par pays et traités selon la convention applicable.' },
    { title: 'Frais', text: 'Un avantage fiscal peut être neutralisé par des frais d’enveloppe ou un support moins performant.' },
    { title: 'IFI', text: 'La détention via assurance-vie n’exonère pas automatiquement les UC immobilières imposables.' },
    { title: 'Liquidité', text: 'Aucun délai de sortie fixe ne doit être promis, ni en direct ni dans une enveloppe.' },
    { title: 'Transmission', text: 'Le cadre de l’assurance-vie peut être utile, mais dépend notamment de l’âge et de la date des versements.' },
    { title: 'Évolution de la TMI', text: 'Tester une baisse de TMI à la retraite ou une variation des revenus avant de choisir une structure longue.' },
  ],
  commonErrors: [
    'Présenter l’assurance-vie comme incontournable à TMI 41 %.',
    'Appliquer 41 % à l’ensemble des revenus ou des distributions sans simulation marginale.',
    'Considérer toutes les SCPI européennes comme fiscalement équivalentes.',
    'Présenter l’assurance-vie comme totalement hors IFI.',
    'Utiliser une hypothèse de rendement net fixe sur 10 ou 20 ans.',
  ],
  practicalCases: [
    { title: 'Capitalisation', text: 'Un investisseur fortement imposé sans besoin de revenus compare assurance-vie et nue-propriété en intégrant frais, durée, fiscalité de sortie et risque de valeur.' },
    { title: 'Revenus immédiats', text: 'Le direct peut rester cohérent si le revenu est recherché, à condition d’assumer la fiscalité et le risque de liquidité dans le calcul net.' },
    { title: 'Europe', text: 'Le portefeuille immobilier est ventilé par pays afin de calculer la fiscalité conventionnelle réelle au lieu d’utiliser un taux moyen générique.' },
    { title: 'Retraite proche', text: 'Une baisse future de TMI peut modifier l’intérêt relatif du direct et des enveloppes. La simulation doit intégrer le calendrier de revenus.' },
  ],
  methodParagraphs: [
    'Calculer les flux nets après impôt et frais pour chaque mode de détention.',
    'Ventiler les revenus étrangers selon les pays et conventions fiscales.',
    'Tester l’absence de revenus pendant un démembrement et les frais d’une assurance-vie.',
    'Intégrer un scénario de baisse de distribution, de valeur de part et de liquidité.',
    'Réévaluer la stratégie si la TMI ou les objectifs changent.',
  ],
  conclusionParagraphs: [
    'À TMI 41 %, la fiscalité justifie un travail d’arbitrage plus fin, pas une solution unique.',
    'Assurance-vie, Europe, démembrement et direct peuvent chacun être cohérents selon l’objectif et les contraintes.',
    'La décision doit reposer sur une simulation nette et sur des hypothèses prudentes de rendement et de liquidité.',
  ],
  faqItems: [
    { question: 'L’assurance-vie est-elle incontournable à TMI 41 % ?', answer: 'Non. Elle peut être pertinente pour capitaliser et différer l’imposition, mais ses frais, ses supports, l’IFI et les objectifs doivent être comparés au direct et au démembrement.' },
    { question: 'Les SCPI européennes sont-elles préférables ?', answer: 'Pas par principe. Leur fiscalité peut être différente mais varie selon les pays et les conventions. La qualité du patrimoine reste déterminante.' },
    { question: 'La nue-propriété est-elle adaptée à une forte TMI ?', answer: 'Elle peut être cohérente si aucun revenu n’est nécessaire pendant la période, mais elle impose une immobilisation et ne garantit pas la valeur future.' },
    { question: 'L’assurance-vie supprime-t-elle l’IFI ?', answer: 'Non automatiquement. La fraction immobilière imposable des unités de compte d’un contrat rachetable peut entrer dans l’assiette.' },
    { question: 'Faut-il décider uniquement sur la TMI actuelle ?', answer: 'Non. L’horizon peut inclure une retraite, une baisse ou une hausse de revenus. La TMI future doit être testée.' },
  ],
  comparateurCtaLabel: 'Comparer les SCPI et modes de détention',
}
