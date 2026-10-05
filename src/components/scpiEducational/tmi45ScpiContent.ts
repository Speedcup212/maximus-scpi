import type { ScpiEducationalPageConfig } from './shared'

export const tmi45ScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-tmi-45',
  badge: 'Fiscalité & profil',
  h1: 'SCPI avec TMI 45 % : comment limiter le frottement fiscal ?',
  heroSubtitle:
    'À TMI 45 %, les revenus fonciers français détenus en direct peuvent subir une fiscalité marginale élevée. Cela renforce l’intérêt d’une comparaison avec l’assurance-vie, les revenus immobiliers étrangers, le démembrement ou d’autres structures, sans rendre aucune solution automatique.',
  seoTitle: 'SCPI TMI 45 % : fiscalité, assurance-vie, Europe et démembrement',
  seoDescription:
    'SCPI et TMI 45 % : comparer direct, assurance-vie, SCPI européennes, nue-propriété et crédit avec une simulation nette et des hypothèses prudentes.',
  shortAnswerTitle: 'Quelle approche SCPI avec une TMI à 45 % ?',
  shortAnswer:
    'La priorité est de mesurer le rendement net après fiscalité et frais. La TMI de 45 % n’est pas le taux moyen du foyer et ne suffit pas à choisir une enveloppe. Les revenus étrangers suivent les conventions fiscales, l’assurance-vie diffère l’imposition jusqu’au rachat et le démembrement peut différer les revenus. Chaque option comporte des coûts, contraintes et risques spécifiques.',
  keyMessage:
    'À TMI 45 %, le risque principal est de raisonner uniquement en économie d’impôt et d’oublier les frais, le risque immobilier, la liquidité et l’horizon.',
  definitionParagraphs: [
    'La tranche à 45 % est la tranche supérieure du barème progressif. Pour les revenus 2025 déclarés en 2026, elle s’applique à la fraction de revenu imposable par part supérieure à 181 917 €.',
    'Les revenus fonciers français supplémentaires peuvent être imposés en partie dans cette tranche et supporter les prélèvements sociaux applicables. Le résultat imposable peut toutefois être modifié par certaines charges et intérêts déductibles.',
    'Les revenus immobiliers étrangers relèvent de conventions fiscales bilatérales. Le mécanisme de crédit d’impôt ou de taux effectif, ainsi que l’imposition locale, doivent être examinés pays par pays.',
    'L’assurance-vie permet de capitaliser dans le contrat et reporte l’imposition au moment des rachats sur la quote-part de gains. Ses frais et son univers de supports doivent être comparés au direct.',
    'Le démembrement temporaire de propriété peut convenir à un investisseur qui accepte de ne percevoir aucun revenu pendant plusieurs années. Il ne constitue pas une garantie de performance.',
    'La fiscalité n’est qu’un paramètre : qualité du patrimoine, prix de part, liquidité, endettement de la SCPI et diversification restent déterminants.',
  ],
  tableTitle: 'Option / intérêt potentiel / vigilance',
  tableRows: [
    { level: 'Direct France', advantage: 'Revenus immédiats, crédit possible, univers large.', vigilance: 'Frottement fiscal potentiellement très élevé et risque de liquidité.' },
    { level: 'Direct Europe', advantage: 'Diversification et fiscalité conventionnelle parfois différente.', vigilance: 'Analyse pays par pays ; imposition locale et qualité des actifs.' },
    { level: 'Assurance-vie', advantage: 'Capitalisation et fiscalité lors des rachats.', vigilance: 'Frais, supports limités, règles de rachat et IFI possible des UC immobilières.' },
    { level: 'Nue-propriété', advantage: 'Absence de distribution au nu-propriétaire pendant la durée.', vigilance: 'Pas de revenu, durée de blocage et valeur future non garantie.' },
    { level: 'Crédit', advantage: 'Levier potentiel et déductibilité possible de certains intérêts.', vigilance: 'Coût du financement et effort d’épargne à supporter même si les distributions baissent.' },
  ],
  tableNote:
    'Une fiscalité élevée ne justifie jamais de surpayer un support, d’ignorer la liquidité ou de sélectionner une SCPI de moindre qualité.',
  criteriaTitle: 'Critères décisifs à TMI 45 %',
  criteriaCards: [
    { title: 'Rendement net', text: 'Comparer les flux réellement disponibles après fiscalité et frais.' },
    { title: 'Fiscalité future', text: 'Tester une baisse de TMI à la retraite ou lors d’une baisse de revenus.' },
    { title: 'Conventions fiscales', text: 'Traiter les revenus étrangers selon la géographie réelle du portefeuille.' },
    { title: 'Frais', text: 'Mesurer le coût cumulé des frais de souscription, de contrat et de financement.' },
    { title: 'IFI', text: 'Vérifier la fraction immobilière taxable quel que soit le mode de détention.' },
    { title: 'Liquidité', text: 'Ne retenir aucun délai de sortie comme garanti.' },
    { title: 'Transmission', text: 'Comparer le cadre successoral de l’assurance-vie avec les autres objectifs du foyer.' },
    { title: 'Qualité immobilière', text: 'La fiscalité ne compense pas un portefeuille immobilier mal acheté ou peu liquide.' },
  ],
  commonErrors: [
    'Choisir une SCPI uniquement pour réduire la fiscalité.',
    'Appliquer 45 % à la totalité des revenus ou distributions sans calcul marginal.',
    'Présenter toutes les SCPI européennes comme fiscalement équivalentes.',
    'Supposer que l’assurance-vie supprime automatiquement l’IFI.',
    'Supposer qu’une forte TMI rend la nue-propriété ou l’assurance-vie toujours meilleure.',
  ],
  practicalCases: [
    { title: 'Capitalisation avant retraite', text: 'Un investisseur sans besoin de revenus compare assurance-vie et nue-propriété en intégrant une possible baisse de TMI lors de la retraite.' },
    { title: 'Revenus immédiats', text: 'Le direct peut rester cohérent si les revenus sont prioritaires, mais la fiscalité nette et la liquidité doivent être acceptées explicitement.' },
    { title: 'Diversification européenne', text: 'Le calcul de rendement net est ventilé par pays et conventions fiscales au lieu d’utiliser un avantage fiscal moyen.' },
    { title: 'Patrimoine déjà soumis à l’IFI', text: 'Chaque option est analysée avec sa fraction immobilière taxable réelle, y compris les unités de compte immobilières d’un contrat rachetable.' },
  ],
  methodParagraphs: [
    'Construire un scénario central et un scénario dégradé de rendement et de valeur de part.',
    'Calculer la fiscalité marginale réelle du foyer et la fiscalité conventionnelle des revenus étrangers.',
    'Intégrer tous les frais et coûts de financement.',
    'Tester l’évolution probable de la TMI et du besoin de revenus sur la durée.',
    'Vérifier IFI, liquidité et transmission avant toute recommandation personnalisée.',
  ],
  conclusionParagraphs: [
    'À TMI 45 %, l’optimisation fiscale peut créer de la valeur, mais elle ne doit jamais devenir le seul moteur de sélection.',
    'Le bon montage est celui qui reste cohérent après frais, impôt et scénario de marché défavorable.',
    'La stratégie doit être réévaluée lorsque les revenus, la retraite ou le patrimoine immobilier du foyer évoluent.',
  ],
  faqItems: [
    { question: 'Faut-il éviter les SCPI françaises en direct à TMI 45 % ?', answer: 'Pas systématiquement. Leur fiscalité peut être lourde, mais le direct peut répondre à un besoin de revenus, de crédit ou de choix de supports. Il faut le comparer net.' },
    { question: 'L’assurance-vie est-elle toujours meilleure ?', answer: 'Non. Elle apporte une fiscalité différée et un cadre successoral spécifique, mais ajoute des frais et limite souvent les SCPI disponibles.' },
    { question: 'Les SCPI européennes réduisent-elles forcément l’impôt ?', answer: 'Non. Le traitement dépend de chaque pays et de chaque convention fiscale. Le résultat net doit être calculé géographie par géographie.' },
    { question: 'La nue-propriété est-elle optimale à forte TMI ?', answer: 'Elle peut être adaptée si aucun revenu n’est nécessaire pendant la durée, mais elle immobilise le capital et ne garantit pas la valeur future.' },
    { question: 'La TMI actuelle suffit-elle pour décider ?', answer: 'Non. Une TMI à 45 % peut baisser avant la fin de l’investissement, notamment à la retraite. Il faut simuler cette évolution.' },
  ],
  comparateurCtaLabel: 'Comparer les SCPI et modes de détention',
}
