import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Search } from 'lucide-react';
import SemanticLinks from './SemanticLinks';
import { getSemanticLinks } from '../data/semanticCocon';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQPage: React.FC = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqs: FAQItem[] = [
    {
      category: "Généralités",
      question: "Qu'est-ce qu'une SCPI exactement ?",
      answer: "Une SCPI (Société Civile de Placement Immobilier) est un placement collectif qui permet d'investir dans l'immobilier professionnel sans les contraintes de la gestion locative. En achetant des parts, vous devenez co-propriétaire d'un patrimoine immobilier diversifié géré par des professionnels. C'est l'équivalent d'un fonds d'investissement, mais dédié à l'immobilier d'entreprise."
    },
    {
      category: "Généralités",
      question: "Quelle est la différence entre une SCPI et un investissement locatif classique ?",
      answer: "Contrairement à l'investissement locatif classique, la SCPI ne nécessite aucune gestion de votre part : pas de recherche de locataire, pas de travaux à gérer, pas de risque d'impayés à supporter seul. Vous investissez à partir de quelques milliers d'euros au lieu de plusieurs centaines de milliers. Votre patrimoine est automatiquement diversifié sur plusieurs dizaines de biens et locataires."
    },
    {
      category: "Rendement",
      question: "Quels sont les rendements moyens des SCPI ?",
      answer: "Les SCPI de rendement offrent en moyenne entre 4% et 6% de rendement annuel brut. Ce taux varie selon le type de SCPI (bureaux, commerces, santé...) et sa stratégie d'investissement. Par exemple, les SCPI de bureaux en Île-de-France ont historiquement délivré des rendements autour de 4,5%, tandis que certaines SCPI diversifiées peuvent atteindre 5,5% à 6%. Les performances passées ne présagent pas des performances futures."
    },
    {
      category: "Rendement",
      question: "Comment sont calculés et versés les revenus des SCPI ?",
      answer: "Les revenus proviennent des loyers perçus par la SCPI, diminués des charges de gestion et des frais. Ces revenus sont distribués mensuellement ou trimestriellement selon les SCPI, proportionnellement au nombre de parts détenues. Le rendement affiché correspond aux revenus distribués divisés par le prix de souscription, exprimé en pourcentage annuel."
    },
    {
      category: "Risques",
      question: "Mon capital est-il garanti dans une SCPI ?",
      answer: "Non, comme tout investissement immobilier, les SCPI comportent des risques. La valeur des parts peut fluctuer à la hausse comme à la baisse selon l'évolution du marché immobilier. Les revenus peuvent également varier en fonction du taux d'occupation des biens et de la conjoncture économique. C'est pourquoi nous recommandons de diversifier votre investissement sur plusieurs SCPI et de considérer cet investissement sur le long terme (8-10 ans minimum) pour lisser les variations du marché."
    },
    {
      category: "Risques",
      question: "Quels sont les principaux risques d'un investissement en SCPI ?",
      answer: "Les principaux risques sont : le risque de perte en capital (baisse de la valeur des parts), le risque de liquidité (délai de revente), le risque locatif (baisse du taux d'occupation ou des loyers), le risque de marché (évolution défavorable de l'immobilier), et le risque lié à la concentration géographique ou sectorielle. Une bonne diversification et un horizon d'investissement long terme permettent de mitiger ces risques."
    },
    {
      category: "Investissement",
      question: "Combien faut-il investir au minimum dans une SCPI ?",
      answer: "L'investissement minimum varie selon les SCPI, généralement entre 200€ et 1000€ par part. Le prix moyen d'une part de SCPI se situe autour de 200€ à 1000€. Avec MaximusSCPI, nous vous aidons à construire un portefeuille diversifié adapté à votre budget, même avec un capital de départ de 5000€ à 10000€. Il est possible d'investir progressivement pour étaler votre investissement dans le temps."
    },
    {
      category: "Investissement",
      question: "Peut-on investir en SCPI avec un crédit immobilier ?",
      answer: "Oui, il est tout à fait possible d'investir en SCPI à crédit. Cette solution présente plusieurs avantages : effet de levier sur votre investissement, déductibilité des intérêts d'emprunt de vos revenus fonciers, et préservation de votre épargne. Les banques financent généralement jusqu'à 100% de l'investissement. Le crédit permet d'amplifier les rendements mais augmente aussi les risques. MaximusSCPI vous aide à simuler différents scénarios pour trouver la solution optimale."
    },
    {
      category: "Investissement",
      question: "Qu'est-ce que le délai de jouissance en SCPI ?",
      answer: "Le délai de jouissance est la période qui s'écoule entre la date de souscription (achat des parts) et la date à partir de laquelle vous commencez à percevoir les revenus locatifs. Ce délai varie selon les SCPI :\n\n- Jouissance immédiate : vous percevez les loyers dès le mois suivant votre souscription\n- Jouissance différée : vous commencez à percevoir les loyers après 3 à 6 mois, le temps que la SCPI investisse vos fonds dans de nouveaux actifs\n\nPendant le délai de jouissance, vos fonds ne génèrent pas de revenus mais la SCPI peut vous verser un intérêt de substitution. Ce délai permet à la société de gestion de déployer efficacement les capitaux collectés dans de nouveaux investissements immobiliers."
    },
    {
      category: "Fiscalité",
      question: "Quelle est la fiscalité applicable aux revenus de SCPI ?",
      answer: "Les revenus des SCPI sont imposés dans la catégorie des revenus fonciers et soumis aux prélèvements sociaux (17,2%). Vous avez deux options : le régime micro-foncier (abattement de 30% si revenus < 15000€) ou le régime réel (déduction des charges réelles). Pour optimiser la fiscalité, plusieurs solutions existent : investir via une assurance-vie, opter pour le démembrement temporaire, ou utiliser le crédit (intérêts déductibles). MaximusSCPI vous conseille sur la meilleure stratégie selon votre situation."
    },
    {
      category: "Fiscalité",
      question: "Comment optimiser la fiscalité de mon investissement en SCPI ?",
      answer: "Plusieurs stratégies existent : investir en démembrement temporaire (nue-propriété) pour réduire la base imposable, utiliser l'assurance-vie pour bénéficier de sa fiscalité avantageuse après 8 ans, emprunter pour déduire les intérêts, ou encore opter pour des SCPI fiscales (Malraux, Déficit foncier, Monuments historiques) qui offrent des réductions d'impôt. Le choix dépend de votre Tranche Marginale d'Imposition (TMI) et de vos objectifs."
    },
    {
      category: "Durée",
      question: "Quelle est la durée de placement recommandée ?",
      answer: "La durée de placement recommandée pour une SCPI est de 8 à 10 ans minimum. Cette durée permet de lisser les fluctuations du marché immobilier et de bénéficier pleinement du potentiel de revalorisation des parts. Sur le long terme, l'immobilier professionnel a historiquement démontré sa capacité à préserver le capital et générer des revenus réguliers. Une sortie anticipée peut entraîner des frais et une moins-value si le marché est défavorable."
    },
    {
      category: "Revente",
      question: "Comment revendre mes parts de SCPI ?",
      answer: "Pour les SCPI à capital variable, vous pouvez revendre vos parts à la société de gestion au prix de retrait (généralement le prix de souscription moins des frais). Pour les SCPI à capital fixe, la revente s'effectue sur le marché secondaire, via un bulletin de cession. Le délai de revente peut varier de quelques semaines à plusieurs mois selon la liquidité de la SCPI. Certaines SCPI proposent un service de contrepartie pour faciliter les transactions."
    },
    {
      category: "Revente",
      question: "Combien de temps faut-il pour revendre ses parts de SCPI ?",
      answer: "Le délai de revente varie considérablement selon le type de SCPI et les conditions de marché. Pour une SCPI à capital variable avec un bon service de contrepartie, cela peut prendre quelques jours à quelques semaines. Pour une SCPI à capital fixe sur le marché secondaire, comptez généralement 2 à 6 mois. En période de forte demande, les délais sont réduits, tandis qu'en période de marché difficile, ils peuvent s'allonger."
    },
    {
      category: "Frais",
      question: "Quels sont les frais associés aux SCPI ?",
      answer: "Les SCPI comportent plusieurs types de frais : les frais de souscription (8% à 12% en moyenne), les frais de gestion annuels (environ 10% HT des loyers collectés), et d'éventuels frais de cession lors de la revente (généralement 5%). Ces frais sont déjà intégrés dans le calcul du rendement net. Chez MaximusSCPI, nous vous orientons vers les SCPI offrant le meilleur rapport rendement/frais et notre accompagnement est totalement gratuit pour vous."
    },
    {
      category: "Types de SCPI",
      question: "Quelle est la différence entre une SCPI de rendement et une SCPI fiscale ?",
      answer: "Une SCPI de rendement vise à générer des revenus réguliers via des loyers d'immeubles professionnels (bureaux, commerces, santé). Elle offre un rendement de 4% à 6% sans avantage fiscal particulier. Une SCPI fiscale investit dans l'immobilier ancien avec rénovation patrimoniale, permettant de bénéficier de réductions d'impôt (Malraux, Déficit foncier, Monuments historiques) en contrepartie d'un engagement de détention de 9 à 15 ans."
    },
    {
      category: "Types de SCPI",
      question: "Qu'est-ce que le démembrement de parts de SCPI ?",
      answer: "Le démembrement consiste à séparer la nue-propriété (droit de propriété) de l'usufruit (droit de percevoir les revenus). L'investisseur achète la nue-propriété à prix réduit (40% à 70% selon la durée), ne perçoit pas de revenus pendant la période de démembrement, et récupère la pleine propriété à l'issue sans fiscalité. C'est une stratégie d'optimisation fiscale particulièrement intéressante pour les hauts revenus."
    },
    {
      category: "Stratégie",
      question: "Les SCPI sont-elles adaptées à la préparation de la retraite ?",
      answer: "Oui, les SCPI sont particulièrement adaptées à la préparation de la retraite. Elles offrent des revenus complémentaires réguliers et prévisibles, essentiels pour maintenir son niveau de vie. La revalorisation progressive des parts protège contre l'inflation. Pour optimiser votre stratégie retraite, nous recommandons de commencer tôt (10-15 ans avant la retraite), de diversifier sur plusieurs SCPI, et d'envisager le démembrement temporaire pour réduire la fiscalité pendant la phase d'acquisition."
    },
    {
      category: "Stratégie",
      question: "Comment diversifier son portefeuille de SCPI ?",
      answer: "Une bonne diversification passe par plusieurs axes : diversification sectorielle (bureaux, commerces, santé, logistique), géographique (France, Europe, zones urbaines/régionales), et par type de SCPI (rendement, fiscale). Nous recommandons d'investir dans au moins 3 à 5 SCPI différentes pour répartir les risques. MaximusSCPI utilise des algorithmes d'IA pour construire un portefeuille optimal selon votre profil et vos objectifs."
    },
    {
      category: "MaximusSCPI",
      question: "Pourquoi MaximusSCPI est-il gratuit ?",
      answer: "MaximusSCPI est rémunéré directement par les sociétés de gestion de SCPI lors de vos souscriptions. Nous ne facturons jamais nos clients, notre rémunération n'augmente pas le coût de votre investissement car elle est déjà incluse dans les frais de souscription, que vous passiez par nous ou non. Notre objectif est de démocratiser l'accès aux SCPI en offrant des outils d'analyse avancés et un accompagnement expert, sans barrière financière."
    },
    {
      category: "MaximusSCPI",
      question: "Quelle est la différence entre un conseiller SCPI gratuit et payant ?",
      answer: "**Conseillers gratuits (comme MaximusSCPI) :**\n\nAvantages : aucun frais pour l'investisseur, rémunération par les sociétés de gestion, accès à un large choix de SCPI, outils d'analyse et accompagnement personnalisé sans surcoût.\n\nInconvénients : certains conseillers peuvent privilégier les SCPI qui les rémunèrent le mieux, risque de conflit d'intérêts potentiel.\n\n**Conseillers payants (CGP indépendants au forfait) :**\n\nAvantages : indépendance totale (pas de commissions des sociétés de gestion), conseil objectif et personnalisé, vision globale de votre patrimoine (immobilier, financier, fiscal).\n\nInconvénients : honoraires à votre charge (souvent 1000€ à 3000€ pour une mission de conseil), rentable uniquement pour des patrimoines importants.\n\n**Notre approche chez MaximusSCPI :** Nous combinons le meilleur des deux mondes en offrant gratuitement des outils d'analyse objectifs basés sur 35 critères et l'intelligence artificielle, tout en maintenant une totale transparence sur notre méthodologie de sélection."
    },
    {
      category: "MaximusSCPI",
      question: "Comment MaximusSCPI sélectionne-t-il les meilleures SCPI ?",
      answer: "Notre méthodologie repose sur l'analyse approfondie de 35 critères quantitatifs et qualitatifs : rendement historique, qualité du patrimoine, taux d'occupation, report à nouveau, distribution, politique d'investissement, équipe de gestion, transparence, frais, liquidité, etc. Nous utilisons également des algorithmes d'intelligence artificielle pour identifier les SCPI les plus performantes et construire des portefeuilles optimisés selon votre profil de risque et vos objectifs patrimoniaux."
    },
    {
      category: "MaximusSCPI",
      question: "Qui est Eric Bellaiche ?",
      answer: "Eric Bellaiche est le fondateur de MaximusSCPI. Expert reconnu en investissement financier et en SCPI, il cumule plus de 15 ans d'expérience dans le conseil en gestion de patrimoine et a accompagné des centaines d'investisseurs dans la construction et la valorisation de leur patrimoine immobilier.\n\nDétenteur de plusieurs certifications reconnues en finance et en gestion de patrimoine, Eric a développé une méthodologie d'analyse exclusive alliant expertise humaine et intelligence artificielle, afin d'identifier les meilleures opportunités d'investissement en SCPI.\n\nSa mission : rendre l'investissement en SCPI plus accessible, transparent et performant pour tous les épargnants français.\n\nAuteur du livre « Boostez vos réseaux d'affaires: avec l'échelle de Clubinaire », il à été également fondateur et président d'un club d'affaires réunissant plus de quarante dirigeants dans l'agglomération de Grenoble."
    },
    {
      category: "Gestionnaires",
      question: "Qui sont les principaux gestionnaires de SCPI en France ?",
      answer: "Les principaux gestionnaires de SCPI en France incluent Primonial REIM, Atland Voisin, Sofidy, Perial, Corum AM, La Française REM, Paref Gestion, Advenis REIM, et Norma Capital. Ces sociétés de gestion ont fait leurs preuves avec plusieurs décennies d'expérience, des équipes spécialisées, et des encours sous gestion de plusieurs milliards d'euros. Le choix du gestionnaire est crucial car il détermine la qualité de la gestion du patrimoine et la performance de votre investissement."
    },
    {
      category: "Gestionnaires",
      question: "Comment évaluer la qualité d'un gestionnaire de SCPI ?",
      answer: "Plusieurs critères permettent d'évaluer un gestionnaire : l'ancienneté et l'expérience (minimum 10 ans), l'encours total sous gestion (signe de confiance des investisseurs), la performance historique de ses SCPI, la transparence de l'information, la qualité des rapports annuels, la solidité financière, la réputation sur le marché, et les éventuelles distinctions professionnelles. Un bon gestionnaire démontre une stratégie d'investissement claire, une gestion prudente, et communique régulièrement avec ses associés."
    },
    {
      category: "Gestionnaires",
      question: "Qu'est-ce que l'AMF et quel est son rôle pour les SCPI ?",
      answer: "L'AMF (Autorité des Marchés Financiers) est le régulateur français des marchés financiers. Elle délivre l'agrément obligatoire pour toutes les SCPI, contrôle leur fonctionnement, vérifie la régularité de leurs opérations, et protège les épargnants. Chaque SCPI doit obtenir un visa AMF avant de pouvoir commercialiser ses parts. L'AMF exige des rapports réguliers, contrôle les communications commerciales, et peut sanctionner les manquements. Cette supervision offre une garantie de sérieux et de conformité réglementaire."
    },
    {
      category: "Gestionnaires",
      question: "Que se passe-t-il si le gestionnaire de ma SCPI fait faillite ?",
      answer: "En cas de défaillance du gestionnaire, vos parts de SCPI sont protégées car elles représentent une propriété sur des actifs immobiliers réels, distincts du gestionnaire. L'AMF intervient pour nommer un administrateur provisoire qui assure la continuité de la gestion. Un nouveau gestionnaire peut être désigné par l'assemblée générale des associés. Les immeubles appartiennent à la SCPI (donc aux associés), pas au gestionnaire. Cette séparation patrimoniale garantit la sécurité de votre investissement même en cas de problème du gestionnaire."
    },
    {
      category: "Locataires",
      question: "Qui sont les locataires types des SCPI ?",
      answer: "Les SCPI louent principalement à des entreprises, administrations publiques, et organismes institutionnels. Les secteurs varient selon le type de SCPI : grandes entreprises du CAC40 et ETI pour les bureaux (Société Générale, Orange, Ministères), enseignes nationales pour les commerces (Carrefour, Décathlon, Leclerc), groupes hospitaliers et établissements de santé (Korian, Orpea, cliniques privées), entrepôts de e-commerce et logistique (Amazon, Cdiscount). Ces locataires sont généralement solvables avec des baux longue durée (3-6-9 ans ou plus)."
    },
    {
      category: "Locataires",
      question: "Comment les SCPI sélectionnent-elles leurs locataires ?",
      answer: "Les gestionnaires de SCPI effectuent une analyse approfondie avant de signer un bail : vérification de la santé financière du locataire (bilans, notations, chiffre d'affaires), analyse du secteur d'activité et de ses perspectives, évaluation de la qualité de crédit, demande de garanties (dépôt de garantie, caution bancaire), et diversification pour limiter le risque de concentration. Les SCPI privilégient des locataires de qualité avec une bonne signature pour assurer la pérennité des loyers et minimiser les risques d'impayés."
    },
    {
      category: "Locataires",
      question: "Que se passe-t-il si un locataire ne paie pas son loyer ?",
      answer: "Les SCPI disposent de plusieurs mécanismes de protection : un report à nouveau (réserve financière) qui permet de maintenir les distributions même en cas d'impayés temporaires, des garanties locatives (cautions, dépôts de garantie), une procédure de recouvrement rapide et professionnelle, et la diversification du patrimoine qui limite l'impact d'un défaut isolé. Les impayés sont généralement très faibles dans les SCPI de qualité (moins de 1%), grâce à la sélection rigoureuse des locataires et à la mutualisation des risques."
    },
    {
      category: "Locataires",
      question: "Comment évoluent les loyers dans une SCPI ?",
      answer: "Les loyers des SCPI évoluent selon plusieurs mécanismes : indexation automatique des baux (souvent sur l'ILC - Indice du Coût de la Construction ou l'ILAT - Indice des Loyers des Activités Tertiaires), renégociation lors des renouvellements de baux pour s'adapter au marché, et revalorisation progressive du patrimoine par des acquisitions stratégiques. Historiquement, les loyers des SCPI progressent de 1% à 2% par an en moyenne, offrant une protection contre l'inflation et contribuant à la revalorisation de la valeur des parts."
    },
    {
      category: "Patrimoine",
      question: "Combien d'immeubles possède une SCPI en moyenne ?",
      answer: "Une SCPI de taille significative possède généralement entre 50 et 200 immeubles, selon sa capitalisation et sa stratégie. Les plus grandes SCPI comme Corum Origin peuvent détenir plus de 150 actifs. Cette diversification géographique et sectorielle est essentielle pour répartir les risques. Un patrimoine diversifié limite l'impact d'une vacance locative ou d'un problème sur un bien spécifique. Plus le nombre d'actifs est élevé, plus la mutualisation des risques est efficace."
    },
    {
      category: "Patrimoine",
      question: "Dans quels pays les SCPI investissent-elles ?",
      answer: "Les SCPI peuvent investir en France exclusivement (SCPI domestiques) ou en Europe (SCPI européennes). Les destinations européennes privilégiées incluent l'Allemagne (Berlin, Francfort, Munich), les Pays-Bas (Amsterdam, Rotterdam), l'Espagne (Madrid, Barcelone), l'Italie (Milan, Rome), et le Portugal (Lisbonne). Certaines SCPI comme Corum Origin investissent également en Irlande, Finlande, ou Pologne. L'investissement européen offre une diversification géographique supplémentaire et accès à des marchés porteurs."
    },
    {
      category: "Patrimoine",
      question: "Qu'est-ce que le taux d'occupation financier (TOF) ?",
      answer: "Le Taux d'Occupation Financier (TOF) mesure le pourcentage de loyers effectivement perçus par rapport aux loyers potentiels si tous les biens étaient loués. Un TOF de 95% signifie que 5% du patrimoine est vacant ou en cours de relocation. C'est un indicateur clé de la santé d'une SCPI : un TOF supérieur à 90% est considéré comme bon, au-dessus de 95% comme excellent. Un TOF en baisse peut signaler des difficultés de relocation et impacter les distributions futures."
    },
    {
      category: "Indicateurs",
      question: "Qu'est-ce que le taux d'endettement d'une SCPI ?",
      answer: "Le taux d'endettement représente la part de dette bancaire dans le financement du patrimoine de la SCPI, exprimé en pourcentage de la valeur des actifs. Un taux d'endettement de 20% signifie que 20% de la valeur du patrimoine est financé par crédit, et 80% par les fonds propres (capitaux des associés). L'endettement permet d'amplifier les rendements grâce à l'effet de levier, mais augmente aussi les risques. Un taux d'endettement raisonnable se situe généralement entre 10% et 40%. Un endettement trop élevé (>50%) peut fragiliser la SCPI en cas de retournement du marché."
    },
    {
      category: "Indicateurs",
      question: "Quelle est la différence entre valeur de réalisation et valeur de retrait ?",
      answer: "La valeur de réalisation correspond à la valeur estimée des parts si la SCPI vendait l'ensemble de son patrimoine dans des conditions normales de marché, après déduction de tous les frais et dettes. C'est une valorisation patrimoniale théorique.\n\nLa valeur de retrait est le prix auquel un associé peut revendre ses parts à la SCPI (pour les SCPI à capital variable). Elle est généralement égale au prix de souscription diminué des frais de souscription non amortis.\n\nLa différence entre ces deux valeurs peut indiquer une surcote (valeur de réalisation > valeur de retrait) ou une décote (valeur de réalisation < valeur de retrait)."
    },
    {
      category: "Indicateurs",
      question: "Qu'est-ce que la surcote et la décote d'une SCPI ?",
      answer: "Le prix de souscription d'une SCPI peut être comparé à sa valeur de reconstitution, c'est-à-dire le prix qu'il faudrait payer pour recréer son patrimoine immobilier à l'identique.\n\nLorsque le prix de la part est inférieur à cette valeur, on parle de décote : l'investisseur achète alors les actifs de la SCPI en dessous de leur valeur réelle, ce qui peut représenter une opportunité d'achat intéressante, à condition que la qualité du patrimoine et la gestion soient solides.\n\nÀ l'inverse, une surcote se produit lorsque le prix de souscription est supérieur à la valeur de reconstitution. Cela signifie que l'investisseur paie plus cher que la valeur estimée des immeubles détenus, un signal de prudence à surveiller, car il réduit la marge de sécurité et le potentiel de revalorisation."
    },
    {
      category: "Indicateurs",
      question: "Qu'est-ce que la valeur de reconstitution ?",
      answer: "La valeur de reconstitution correspond au coût théorique pour reconstituer à l'identique le patrimoine de la SCPI à la date d'évaluation. Elle se calcule en additionnant : la valeur vénale des immeubles (valeur de marché), les frais d'acquisition qui seraient nécessaires (droits d'enregistrement, honoraires), et les autres actifs nets.\n\nC'est un indicateur important pour évaluer si le prix de souscription de la SCPI est cohérent avec la valeur réelle du patrimoine. Un prix de souscription proche de la valeur de reconstitution (±10%) témoigne d'une valorisation juste."
    },
    {
      category: "Indicateurs",
      question: "Qu'est-ce que le WALB et le WALT ?",
      answer: "WALB (Weighted Average Lease Break) : durée moyenne pondérée restant à courir jusqu'à la première possibilité de sortie des baux par les locataires. Un WALB de 5 ans signifie qu'en moyenne, les locataires peuvent quitter leurs locaux dans 5 ans. Plus le WALB est élevé, plus la visibilité sur les revenus futurs est importante.\n\nWALT (Weighted Average Lease Term) : durée moyenne pondérée restant à courir jusqu'à l'échéance ferme des baux. Un WALT de 7 ans indique une durée contractuelle moyenne de 7 ans.\n\nCes indicateurs mesurent la sécurité et la prévisibilité des revenus locatifs. Un WALB/WALT élevé (>5 ans) est généralement positif car il garantit des revenus stables sur le moyen terme."
    },
    {
      category: "Patrimoine",
      question: "Comment les SCPI gèrent-elles les travaux et la rénovation des biens ?",
      answer: "Les sociétés de gestion anticipent et planifient les travaux nécessaires : entretien courant et gros œuvre sont budgétés annuellement, les rénovations importantes sont provisionnées, la mise aux normes (énergétiques, sécurité, accessibilité) est anticipée pour maintenir la valeur et l'attractivité des actifs. Les coûts de travaux sont supportés par la SCPI et impactent les résultats, mais ils permettent de maintenir des loyers compétitifs et d'attirer des locataires de qualité. La qualité de la gestion patrimoniale est un facteur clé de performance long terme."
    },
    {
      category: "Performance",
      question: "Qu'est-ce que le report à nouveau et pourquoi est-il important ?",
      answer: "Le report à nouveau est une réserve financière constituée par la SCPI lorsque les revenus encaissés sont supérieurs aux distributions. Cette réserve sert de coussin de sécurité pour maintenir les distributions en cas de baisse temporaire des revenus (vacance locative, travaux importants, retard de paiement). Un report à nouveau représentant 6 à 12 mois de distribution est considéré comme sain. C'est un indicateur de la solidité financière de la SCPI et de sa capacité à traverser les périodes difficiles sans réduire les distributions."
    },
    {
      category: "Performance",
      question: "Comment est calculée la valeur de reconstitution d'une part de SCPI ?",
      answer: "La valeur de reconstitution représente le prix qu'il faudrait payer aujourd'hui pour recréer le patrimoine de la SCPI à l'identique, incluant : la valeur vénale des immeubles (expertisée en détail tous les 5 ans et actualisée deux fois par an par des experts indépendants), les frais d'acquisition qui seraient nécessaires (droits de mutation, frais de notaire), et les frais de collecte. Elle se distingue du prix de souscription et donne une indication de la valeur réelle des actifs sous-jacents. Un prix de souscription proche de la valeur de reconstitution indique une valorisation équilibrée."
    },
    {
      category: "Performance",
      question: "Quelle est la différence entre rendement et performance globale ?",
      answer: "Le rendement correspond uniquement aux revenus distribués divisés par le prix de souscription (généralement 4% à 6% pour les SCPI de rendement). La performance globale additionne le rendement annuel ET la variation de la valeur de la part. Par exemple, si une SCPI distribue 5% et que la valeur de la part augmente de 2%, la performance globale est de 7%. C'est la performance globale qui mesure véritablement le gain de l'investisseur, car elle intègre à la fois les revenus et la plus-value potentielle."
    },
    {
      category: "Performance",
      question: "Les SCPI protègent-elles contre l'inflation ?",
      answer: "Oui, les SCPI offrent une protection relative contre l'inflation grâce à plusieurs mécanismes : l'indexation des loyers sur des indices qui suivent l'inflation (ILC, ILAT), la revalorisation du prix des parts qui suit généralement la hausse des valeurs immobilières, et la nature tangible de l'actif immobilier qui préserve le pouvoir d'achat. Historiquement, l'immobilier professionnel a démontré sa capacité à maintenir sa valeur réelle en période d'inflation modérée. C'est l'un des avantages structurels des SCPI face aux placements monétaires."
    },
    {
      category: "Comparaison",
      question: "SCPI vs assurance-vie en fonds euros : quel est le meilleur placement ?",
      answer: "Ces deux placements sont complémentaires plutôt que concurrents. Les fonds euros offrent sécurité et liquidité avec des rendements faibles (1,5% à 2,5%), capital garanti, fiscalité avantageuse après 8 ans, et disponibilité immédiate. Les SCPI offrent des rendements supérieurs (4% à 6%), diversification sur l'immobilier professionnel, protection contre l'inflation, mais avec des risques plus élevés et moins de liquidité. Pour optimiser, beaucoup d'investisseurs combinent les deux : fonds euros pour l'épargne de précaution, SCPI pour les revenus complémentaires long terme."
    },
    {
      category: "Comparaison",
      question: "Peut-on détenir des SCPI dans une assurance-vie ?",
      answer: "Oui, de nombreuses assurances-vie proposent des SCPI en unités de compte. Cette solution combine les avantages des deux supports : revenus des SCPI, fiscalité attractive de l'assurance-vie après 8 ans (abattement sur les plus-values, prélèvement forfaitaire réduit), transmission facilitée avec abattement successoral jusqu'à 152500€ par bénéficiaire. Les inconvénients sont : frais de gestion supplémentaires de l'assurance-vie, choix de SCPI parfois limité, et impossibilité de revente des parts avant le rachat global du contrat."
    },
    {
      category: "Comparaison",
      question: "SCPI ou OPCI : quelles différences ?",
      answer: "Les SCPI et les OPCI (Organismes de Placement Collectif Immobilier) sont deux véhicules d'investissement immobilier avec des différences notables. Les SCPI investissent 100% en immobilier physique, sont moins liquides, et offrent des rendements de 4% à 6%. Les OPCI combinent immobilier physique (60% minimum) et actifs financiers (liquidités, obligations), offrent plus de liquidité avec des valeurs liquidatives hebdomadaires ou quotidiennes, mais des rendements généralement inférieurs (3% à 4%). Les OPCI sont disponibles principalement en assurance-vie, les SCPI en direct ou en assurance-vie."
    },
    {
      category: "Comparaison",
      question: "Investir en SCPI ou acheter un bien locatif ?",
      answer: "Chaque solution a ses avantages. L'investissement locatif direct offre : contrôle total sur le bien, effet de levier via le crédit, optimisation fiscale possible (déficit foncier, dispositifs Denormandie/Loc'Avantages), et transmission facilitée. Les SCPI offrent : ticket d'entrée accessible (quelques milliers d'euros), aucune gestion locative, diversification immédiate sur des dizaines de biens, mutualisation des risques, et liquidité relative. Pour la plupart des investisseurs, les SCPI sont plus simples et permettent une meilleure diversification, tandis que l'investissement direct convient aux investisseurs expérimentés avec du temps à consacrer."
    },
    {
      category: "Juridique",
      question: "Qu'est-ce qu'une SCPI à capital fixe vs capital variable ?",
      answer: "Dans une SCPI à capital fixe, le nombre de parts est limité et défini dans les statuts. Les nouvelles souscriptions nécessitent une augmentation de capital votée en assemblée générale. Les parts s'échangent sur un marché secondaire entre acheteurs et vendeurs, avec des délais de transaction variables. Dans une SCPI à capital variable, de nouvelles parts peuvent être créées en continu selon la demande, facilitant les souscriptions. Les parts sont rachetées directement par la société de gestion, offrant plus de liquidité mais avec un délai de retrait parfois réglementé."
    },
    {
      category: "Juridique",
      question: "Quels sont mes droits en tant qu'associé d'une SCPI ?",
      answer: "En tant qu'associé de SCPI, vous disposez de plusieurs droits : droit de vote en assemblée générale proportionnel à vos parts, droit à l'information (rapports annuels, comptes, stratégie), droit aux distributions des revenus locatifs, droit de céder vos parts selon les modalités prévues, droit de contester les décisions en justice si nécessaire, et droit de participer aux décisions importantes (vente d'actifs majeurs, changement de stratégie). Vous recevez régulièrement des bulletins trimestriels et un rapport annuel détaillé."
    },
    {
      category: "Juridique",
      question: "Comment se déroule l'assemblée générale d'une SCPI ?",
      answer: "L'assemblée générale se tient au moins une fois par an. Elle approuve les comptes de l'exercice écoulé, vote sur les résolutions proposées par la société de gestion (vente ou acquisition d'actifs importants, modification des statuts, nomination d'experts), élit le conseil de surveillance qui contrôle la gestion, et permet aux associés de poser des questions. Vous pouvez y participer physiquement, par visioconférence, ou voter par correspondance. Chaque part donne droit à une voix. C'est un moment clé de la vie démocratique de la SCPI."
    },
    {
      category: "Juridique",
      question: "Puis-je transmettre mes parts de SCPI à mes enfants ?",
      answer: "Oui, les parts de SCPI sont transmissibles par donation ou succession selon les règles du droit civil. Plusieurs stratégies sont possibles : donation en pleine propriété avec abattement de 100000€ par parent et par enfant tous les 15 ans, donation en démembrement (parents conservent l'usufruit et les revenus, enfants reçoivent la nue-propriété), ou transmission via assurance-vie pour optimiser la fiscalité successorale. Les parts de SCPI facilitent la transmission fractionnée du patrimoine (contrairement à un bien immobilier unique) et permettent d'organiser sa succession progressivement."
    },
    {
      category: "Marché",
      question: "Comment la crise du COVID-19 a-t-elle impacté les SCPI ?",
      answer: "La crise COVID-19 a eu des impacts différenciés selon les typologies de SCPI. Les SCPI de commerces ont été les plus touchées (fermetures administratives, difficultés des enseignes), avec des baisses de distribution temporaires. Les SCPI de bureaux ont mieux résisté malgré l'essor du télétravail. Les SCPI de santé et de logistique ont surperformé (demande accrue). La plupart des SCPI de qualité ont utilisé leur report à nouveau pour maintenir les distributions, démontrant la résilience du modèle. La crise a accéléré les transformations du marché immobilier tertiaire et renforcé l'importance de la diversification."
    },
    {
      category: "Marché",
      question: "Les SCPI de bureaux sont-elles menacées par le télétravail ?",
      answer: "Le télétravail transforme le marché des bureaux mais ne le menace pas fondamentalement. Les entreprises réorganisent leurs espaces plutôt que de les abandonner : flex office, espaces collaboratifs, bureaux nouvelle génération avec services. Les SCPI s'adaptent en investissant dans des immeubles modernes et bien situés, en rénovant pour répondre aux nouvelles attentes (confort, RSE, connectivité), et en diversifiant vers des zones attractives. Les bureaux prime dans les grandes métropoles restent très demandés. La qualité et la localisation des actifs deviennent encore plus déterminantes."
    },
    {
      category: "Marché",
      question: "Quelle est l'évolution du marché des SCPI en France ?",
      answer: "Le marché des SCPI connaît une croissance continue depuis 20 ans. La capitalisation totale dépasse 90 milliards d'euros en 2024, avec plus de 200 SCPI actives et près de 6 millions de porteurs de parts. Cette popularité s'explique par : la recherche de rendement dans un environnement de taux bas, la démocratisation via les plateformes digitales, l'amélioration de la transparence et de l'information, et la reconnaissance des SCPI comme classe d'actifs incontournable de la diversification patrimoniale. Les nouvelles générations de SCPI intègrent mieux les enjeux ESG et innovent sur les typologies d'actifs."
    },
    {
      category: "ESG",
      question: "Qu'est-ce qu'une SCPI responsable ou ISR ?",
      answer: "Une SCPI ISR (Investissement Socialement Responsable) intègre des critères environnementaux, sociaux et de gouvernance dans sa stratégie. Elle privilégie des immeubles performants énergétiquement (labels BBC, HQE, BREEAM), favorise le bien-être des occupants, sélectionne des locataires responsables, et communique de manière transparente sur ses impacts. Le label ISR, délivré par un organisme indépendant, garantit le respect d'un cahier des charges strict. Investir dans une SCPI ISR permet de concilier performance financière et impact positif, tout en anticipant les futures réglementations environnementales."
    },
    {
      category: "ESG",
      question: "Comment les SCPI intègrent-elles la transition énergétique ?",
      answer: "Les SCPI sont au cœur de la transition énergétique du parc immobilier tertiaire. Elles réalisent des travaux de rénovation énergétique (isolation, systèmes de chauffage performants, panneaux solaires), acquièrent des bâtiments neufs respectant les normes RT2012/RE2020, obtiennent des certifications environnementales, et anticipent les obligations réglementaires (décret tertiaire imposant -40% de consommation d'ici 2030). Ces investissements maintiennent la valeur des actifs, réduisent les charges, et attirent des locataires sensibles aux enjeux RSE. C'est un facteur différenciant majeur entre SCPI de qualité et SCPI en retard."
    }
  ];

  const categories = ['all', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Foire Aux Questions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Toutes les réponses à vos questions sur les SCPI et MaximusSCPI
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une question..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {category === 'all' ? 'Toutes' : category}
              </button>
            ))}
          </div>
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Aucune question ne correspond à votre recherche.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1 pr-4">
                    <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-full mb-2">
                      {faq.category}
                    </div>
                    <div className="font-bold text-lg text-gray-900 dark:text-white">
                      {faq.question}
                    </div>
                  </div>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6 pt-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-750">
                    <p className="text-gray-700 dark:text-gray-200 leading-loose text-base font-normal">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-3">
            Vous ne trouvez pas la réponse à votre question ?
          </h3>
          <p className="text-blue-100 mb-6">
            Notre équipe d'experts est là pour vous accompagner et répondre à toutes vos questions personnalisées.
          </p>
          <button
            onClick={() => (window as any).openRdvModal?.()}
            className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors"
          >
            Prendre rendez-vous
          </button>
        </div>
      </div>

      {/* Cocon Sémantique - Maillage interne SEO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <SemanticLinks
          currentPage="/faq"
          links={getSemanticLinks('/faq')}
          title="Complétez vos connaissances"
        />
      </div>
    </div>
  );
};

export default FAQPage;
