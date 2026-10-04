import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');
const sourcePath = path.join(distDir, 'index.html');
const SITE = 'https://maximusscpi.com';

if (!fs.existsSync(sourcePath)) {
  console.error('❌ dist/index.html introuvable.');
  process.exit(1);
}

const PAGES = [
  {
    slug: 'amf-scpi',
    title: 'AMF et SCPI : agrément, visa, contrôles et limites | MaximusSCPI',
    description: 'Comprendre le rôle de l’AMF pour les SCPI : sociétés de gestion, note d’information, visa, contrôles et ce que l’AMF ne garantit pas.',
    h1: 'AMF et SCPI : ce que le contrôle réglementaire signifie vraiment',
    intro: 'L’AMF encadre le marché et les sociétés de gestion. Son intervention ne constitue ni une garantie du capital, ni une garantie de rendement ou de liquidité.',
    sections: [
      ['Société de gestion', 'La gestion d’une SCPI est exercée par une société de gestion disposant des autorisations requises et soumise au cadre réglementaire applicable.'],
      ['Documents et visa', 'La documentation réglementaire doit être lue avant toute décision. Un visa ou un contrôle réglementaire ne valide pas la performance future du placement.'],
      ['Risques inchangés', 'Perte en capital, baisse des revenus et délai de revente restent possibles malgré l’encadrement réglementaire.']
    ]
  },
  {
    slug: 'orias-scpi',
    title: 'ORIAS et SCPI : vérifier un intermédiaire et son statut | MaximusSCPI',
    description: 'À quoi sert l’ORIAS lors d’un investissement en SCPI : vérification de l’intermédiaire, statuts, limites et bonnes pratiques.',
    h1: 'ORIAS et SCPI : vérifier le statut de l’intermédiaire',
    intro: 'L’ORIAS permet de vérifier l’immatriculation de certains intermédiaires. Cette vérification ne remplace ni l’analyse du produit ni l’évaluation de son adéquation à ta situation.',
    sections: [
      ['Vérifier l’immatriculation', 'Le registre ORIAS permet de contrôler les catégories d’immatriculation déclarées par l’intermédiaire.'],
      ['Distinguer statut et produit', 'L’immatriculation d’un professionnel ne signifie pas qu’une SCPI donnée est sans risque ou adaptée à tous les investisseurs.'],
      ['Conserver les documents', 'Le cadre de conseil, les informations sur les risques et les documents remis doivent être conservés et relus.']
    ]
  },
  {
    slug: 'dic-scpi',
    title: 'DIC SCPI : lire le document d’informations clés | MaximusSCPI',
    description: 'Comment lire le DIC d’une SCPI : risque, horizon, scénarios, coûts et limites avant d’investir.',
    h1: 'DIC SCPI : les points à lire avant d’investir',
    intro: 'Le document d’informations clés synthétise notamment le risque, l’horizon recommandé, les scénarios de performance et les coûts. Il doit être lu avec la note d’information et les rapports de la SCPI.',
    sections: [
      ['Risque et horizon', 'Le niveau de risque et l’horizon recommandé donnent un cadre de lecture mais ne résument pas tous les risques immobiliers et de liquidité.'],
      ['Scénarios', 'Les scénarios sont normalisés et ne constituent pas une prévision certaine du rendement futur.'],
      ['Coûts', 'Les coûts doivent être rapprochés du prix de souscription, des frais de gestion et de ton horizon de détention.']
    ]
  },
  {
    slug: 'note-information-scpi',
    title: 'Note d’information SCPI : comment la lire | MaximusSCPI',
    description: 'Guide de lecture de la note d’information d’une SCPI : fonctionnement, frais, souscription, retrait, risques et gouvernance.',
    h1: 'Note d’information SCPI : le document de référence à lire',
    intro: 'La note d’information décrit les règles de fonctionnement de la SCPI. Elle permet de vérifier les modalités de souscription, de retrait, les frais et les principaux risques.',
    sections: [
      ['Souscription et retrait', 'Les modalités diffèrent selon le type de capital et doivent être comprises avant l’investissement.'],
      ['Frais', 'Frais de souscription, de gestion et autres commissions doivent être analysés sur la durée de détention envisagée.'],
      ['Risques et gouvernance', 'Le document précise le cadre de gestion, les organes de contrôle et les risques propres au véhicule.']
    ]
  },
  {
    slug: 'tof-scpi',
    title: 'TOF SCPI : taux d’occupation financier, calcul et lecture | MaximusSCPI',
    description: 'Comprendre le TOF d’une SCPI : définition, calcul, évolution et limites pour analyser l’occupation du patrimoine.',
    h1: 'TOF SCPI : comprendre le taux d’occupation financier',
    intro: 'Le TOF mesure l’occupation financière du patrimoine selon une définition normalisée. Sa trajectoire est souvent plus informative qu’un chiffre isolé.',
    sections: [
      ['Niveau actuel', 'Un TOF élevé peut traduire une bonne occupation, mais il doit être lu avec les franchises, impayés et renégociations.'],
      ['Trajectoire', 'Une baisse durable ou rapide du TOF peut signaler une dégradation locative à analyser dans les bulletins successifs.'],
      ['Limites', 'Le TOF ne mesure ni la liquidité des parts, ni la qualité de tous les locataires, ni la valeur future du patrimoine.']
    ]
  },
  {
    slug: 'capitalisation-scpi',
    title: 'Capitalisation SCPI : taille, diversification et limites | MaximusSCPI',
    description: 'Comprendre la capitalisation d’une SCPI : calcul, taille du fonds, diversification et limites pour comparer des SCPI.',
    h1: 'Capitalisation d’une SCPI : ce que la taille du fonds indique',
    intro: 'La capitalisation mesure la taille de la SCPI à partir du nombre de parts et du prix de référence. Elle aide à contextualiser la diversification sans préjuger de la qualité du patrimoine.',
    sections: [
      ['Taille du fonds', 'Une capitalisation élevée peut faciliter la diversification immobilière mais ne garantit ni rendement ni liquidité.'],
      ['Concentration', 'Il faut regarder le nombre d’actifs, de locataires, de secteurs et de zones géographiques en complément.'],
      ['Évolution', 'Une variation de capitalisation doit être rapprochée de la collecte, des retraits, des acquisitions et des évolutions de prix de part.']
    ]
  },
  {
    slug: 'decote-valeur-reconstitution-scpi',
    title: 'Décote SCPI et valeur de reconstitution : calcul et analyse | MaximusSCPI',
    description: 'Comparer prix de part et valeur de reconstitution d’une SCPI : décote, surcote, limites et trajectoire.',
    h1: 'Décote et valeur de reconstitution des SCPI',
    intro: 'L’écart entre prix de souscription et valeur de reconstitution aide à lire le niveau de valorisation d’une SCPI. Cet écart doit être suivi dans le temps et interprété avec prudence.',
    sections: [
      ['Valeur de reconstitution', 'Elle reflète la valeur du patrimoine et les coûts nécessaires pour le reconstituer dans les conditions prévues par la réglementation.'],
      ['Décote ou surcote', 'Un prix inférieur ou supérieur à la valeur de reconstitution n’est pas, à lui seul, un signal d’achat ou de vente.'],
      ['Trajectoire', 'L’évolution des valeurs d’expertise, du prix de part et de la liquidité permet de contextualiser l’écart observé.']
    ]
  },
  {
    slug: 'endettement-scpi',
    title: 'Endettement SCPI : levier, ratio et risques | MaximusSCPI',
    description: 'Comprendre l’endettement d’une SCPI : effet de levier, ratio, coût de la dette, échéances et risques.',
    h1: 'Endettement des SCPI : lire le levier et ses risques',
    intro: 'L’endettement peut soutenir les acquisitions et amplifier les résultats, mais il augmente aussi la sensibilité au coût du financement et à la valeur des actifs.',
    sections: [
      ['Niveau de dette', 'Le ratio d’endettement doit être comparé à la stratégie du fonds et à la qualité des actifs financés.'],
      ['Coût et maturité', 'Taux fixes ou variables, échéances et refinancements futurs modifient le risque financier.'],
      ['Effet de levier', 'Le levier peut améliorer ou dégrader la performance selon le rendement des actifs, les taux et l’évolution des valeurs.']
    ]
  },
  {
    slug: 'rendement-net-scpi',
    title: 'Rendement net SCPI : du taux de distribution au revenu net | MaximusSCPI',
    description: 'Passer du taux de distribution au rendement net d’une SCPI : frais, fiscalité, origine des revenus et hypothèses.',
    h1: 'Rendement net d’une SCPI : ne pas s’arrêter au taux affiché',
    intro: 'Le taux de distribution est une donnée historique. Le revenu réellement perçu dépend notamment des frais, de la fiscalité, de l’origine des revenus et du mode de détention.',
    sections: [
      ['Taux distribué', 'Le taux publié doit être rapproché du prix de part et de la politique de distribution de la SCPI.'],
      ['Fiscalité', 'Le traitement fiscal varie selon la provenance des revenus, la situation du détenteur et l’enveloppe utilisée.'],
      ['Rendement économique', 'La variation du prix de part et les frais doivent être intégrés à l’analyse sur l’horizon de détention.']
    ]
  },
  {
    slug: 'frais-scpi',
    title: 'Frais SCPI : souscription, gestion et coût réel | MaximusSCPI',
    description: 'Comprendre les frais des SCPI : souscription, gestion, cession, acquisition et impact sur le rendement à long terme.',
    h1: 'Frais des SCPI : comprendre le coût réel',
    intro: 'Les frais d’une SCPI ne se limitent pas à la commission de souscription. Ils doivent être lus dans la documentation et replacés dans l’horizon de détention.',
    sections: [
      ['Souscription', 'Les modalités de frais d’entrée diffèrent selon les SCPI et peuvent influencer le prix de retrait ou la valeur économique à court terme.'],
      ['Gestion', 'La commission de gestion est prélevée selon les règles définies par chaque SCPI et doit être rapprochée du revenu distribué.'],
      ['Autres frais', 'Cessions, acquisitions, travaux ou opérations spécifiques peuvent générer d’autres commissions prévues par la documentation.']
    ]
  },
  {
    slug: 'risques-scpi',
    title: 'Risques SCPI : capital, revenus, liquidité et immobilier | MaximusSCPI',
    description: 'Les principaux risques des SCPI : perte en capital, baisse des revenus, vacance, liquidité, dette et valorisation.',
    h1: 'Risques des SCPI : les points à mesurer avant d’investir',
    intro: 'Une SCPI est un placement immobilier non garanti. Le rendement, la valeur des parts et le délai de revente peuvent évoluer défavorablement.',
    sections: [
      ['Capital', 'La valeur des parts peut baisser en fonction des expertises, du marché immobilier et des décisions de gestion.'],
      ['Revenus', 'La distribution peut diminuer en cas de vacance, impayés, renégociations ou baisse des résultats.'],
      ['Liquidité', 'La revente peut prendre du temps et dépend du mécanisme de marché propre à la SCPI.']
    ]
  },
  {
    slug: 'delai-jouissance-scpi',
    title: 'Délai de jouissance SCPI : fonctionnement et impact | MaximusSCPI',
    description: 'Comprendre le délai de jouissance d’une SCPI : date d’entrée en jouissance, premier revenu et impact sur le rendement de la première année.',
    h1: 'Délai de jouissance des SCPI',
    intro: 'Le délai de jouissance décale le début des droits aux revenus après la souscription. Il doit être intégré au calcul de rendement sur les premières années.',
    sections: [
      ['Date d’effet', 'La documentation précise le nombre de mois ou la date à partir de laquelle les parts entrent en jouissance.'],
      ['Premier revenu', 'La date de versement dépend ensuite du calendrier de distribution de la SCPI.'],
      ['Comparaison', 'Comparer deux SCPI uniquement sur leur taux de distribution sans intégrer le délai de jouissance peut fausser une projection de court terme.']
    ]
  },
  {
    slug: 'scpi-demembrement',
    title: 'SCPI en démembrement : nue-propriété, usufruit et risques | MaximusSCPI',
    description: 'Comprendre le démembrement de SCPI : nue-propriété, usufruit, clés, durée, fiscalité et risques.',
    h1: 'SCPI en démembrement : fonctionnement et points de vigilance',
    intro: 'Le démembrement sépare temporairement nue-propriété et usufruit. Il peut répondre à certains objectifs patrimoniaux mais impose un horizon et des contraintes spécifiques.',
    sections: [
      ['Nue-propriété', 'Le nu-propriétaire renonce temporairement aux revenus en contrepartie d’un prix d’acquisition tenant compte de la clé de démembrement.'],
      ['Usufruit', 'L’usufruitier perçoit les revenus pendant la durée prévue, avec un traitement fiscal qui dépend de sa situation.'],
      ['Durée et liquidité', 'La durée est contractuelle et la sortie anticipée peut être difficile : la liquidité doit être appréciée avant la souscription.']
    ]
  },
  {
    slug: 'scpi-ifi',
    title: 'SCPI et IFI : valeur imposable, déclaration et cas particuliers | MaximusSCPI',
    description: 'Comprendre l’IFI des SCPI : valeur à déclarer, quote-part immobilière, démembrement et détention indirecte.',
    h1: 'SCPI et IFI : principes de déclaration',
    intro: 'Les parts de SCPI peuvent entrer dans l’assiette de l’IFI selon leur composition et le mode de détention. La valeur pertinente est communiquée selon les règles applicables et la situation du détenteur.',
    sections: [
      ['Valeur IFI', 'Les sociétés de gestion publient généralement les informations nécessaires au calcul de la valeur imposable des parts.'],
      ['Détention indirecte', 'Assurance-vie, sociétés et autres enveloppes peuvent modifier les modalités de détermination de l’assiette.'],
      ['Situation personnelle', 'Démembrement, dettes déductibles et autres éléments patrimoniaux nécessitent une analyse adaptée au contribuable.']
    ]
  },
  {
    slug: 'scpi-expatrie-fiscalite',
    title: 'SCPI et expatrié : fiscalité des non-résidents | MaximusSCPI',
    description: 'SCPI pour non-résidents : revenus français ou étrangers, conventions fiscales et points de vigilance.',
    h1: 'SCPI et expatriation : comprendre la fiscalité des non-résidents',
    intro: 'La fiscalité dépend du pays de résidence, de la source des revenus et des conventions fiscales. Une comparaison de rendement brut ne suffit pas.',
    sections: [
      ['Résidence fiscale', 'Le pays de résidence fiscale conditionne l’analyse et doit être déterminé avant toute simulation.'],
      ['Source des revenus', 'Les revenus immobiliers français et étrangers peuvent relever de traitements différents selon les conventions.'],
      ['Vérification', 'Les règles fiscales évoluent et doivent être vérifiées pour la situation et l’année concernées.']
    ]
  },
  {
    slug: 'scpi-sci-is-fiscalite',
    title: 'SCPI en SCI à l’IS : fiscalité, comptabilité et risques | MaximusSCPI',
    description: 'Détenir des SCPI via une SCI à l’IS : fiscalité, comptabilité, trésorerie, sortie et points de vigilance.',
    h1: 'SCPI en SCI à l’IS : analyser la structure avant le rendement',
    intro: 'La détention de SCPI via une structure soumise à l’IS modifie la fiscalité, la comptabilité et la logique de sortie. Elle doit être étudiée sur la durée.',
    sections: [
      ['Résultat fiscal', 'Les revenus et charges sont traités dans le cadre fiscal de la société, selon les règles applicables à sa situation.'],
      ['Trésorerie', 'L’impôt payé par la société et la fiscalité d’une distribution ultérieure aux associés doivent être distingués.'],
      ['Sortie', 'Cession des parts, cession de la société ou distribution de trésorerie peuvent produire des conséquences différentes.']
    ]
  },
  {
    slug: 'societes-de-gestion-scpi',
    title: 'Sociétés de gestion SCPI : comparer les gestionnaires | MaximusSCPI',
    description: 'Comparer les sociétés de gestion de SCPI : encours, gammes, historique, collecte, gouvernance et qualité de gestion.',
    h1: 'Sociétés de gestion de SCPI : comparer au-delà des produits',
    intro: 'Une SCPI dépend aussi de sa société de gestion. Historique, organisation, discipline d’investissement et gestion de la liquidité doivent compléter l’analyse du fonds.',
    sections: [
      ['Historique', 'L’ancienneté apporte du recul mais ne garantit pas la performance future.'],
      ['Discipline de gestion', 'Collecte, acquisitions, arbitrages, dette et gestion locative doivent être cohérents avec la stratégie annoncée.'],
      ['Gamme', 'Plusieurs SCPI d’un même gestionnaire peuvent suivre des stratégies et présenter des risques très différents.']
    ]
  },
  {
    slug: 'gestionnaire-scpi',
    title: 'Gestionnaire de SCPI : rôle, responsabilités et critères | MaximusSCPI',
    description: 'Comprendre le rôle du gestionnaire d’une SCPI : acquisitions, gestion locative, dette, collecte, liquidité et information des associés.',
    h1: 'Gestionnaire de SCPI : quel rôle dans la performance et le risque ?',
    intro: 'La société de gestion prend les décisions d’investissement, de financement, d’arbitrage et de gestion locative dans le cadre défini par la SCPI.',
    sections: [
      ['Investissement', 'Le gestionnaire sélectionne les actifs et pilote les arbitrages selon la stratégie du fonds.'],
      ['Exploitation', 'Location, travaux, recouvrement et relation avec les locataires influencent directement les revenus.'],
      ['Liquidité et information', 'La collecte, les retraits et la communication aux associés sont des éléments à suivre dans le temps.']
    ]
  },
  {
    slug: 'choisir-scpi',
    title: 'Choisir une SCPI : 10 critères à comparer | MaximusSCPI',
    description: 'Méthode pour choisir une SCPI : rendement, TOF, valorisation, dette, liquidité, frais, patrimoine et diversification.',
    h1: 'Choisir une SCPI : une méthode multicritère',
    intro: 'Le meilleur taux de distribution du moment ne suffit pas. Le choix doit associer revenus, valorisation, occupation, dette, liquidité et diversification.',
    sections: [
      ['Revenus et occupation', 'Taux de distribution, TOF, impayés et baux donnent une première lecture de la qualité des revenus.'],
      ['Valorisation et dette', 'Prix de part, valeur de reconstitution, expertises et levier permettent d’évaluer la trajectoire patrimoniale.'],
      ['Liquidité et diversification', 'Marché des parts, collecte, secteurs, pays et gestionnaires complètent la lecture du risque.']
    ]
  },
  {
    slug: 'combien-investir-scpi',
    title: 'Combien investir en SCPI ? Allocation, diversification et liquidité | MaximusSCPI',
    description: 'Déterminer un montant d’investissement en SCPI selon patrimoine, horizon, besoin de liquidité, risque et diversification.',
    h1: 'Combien investir en SCPI ?',
    intro: 'Il n’existe pas de montant universel. L’allocation dépend du patrimoine global, de l’horizon, des besoins de liquidité et de la capacité à supporter une baisse de valeur ou de revenus.',
    sections: [
      ['Patrimoine global', 'La SCPI doit être replacée dans l’ensemble des actifs, dettes et réserves de liquidité.'],
      ['Horizon', 'Un horizon long est généralement cohérent avec la nature immobilière et les frais du placement.'],
      ['Diversification', 'Le montant doit permettre une diversification adaptée sans concentrer excessivement le patrimoine sur l’immobilier indirect.']
    ]
  },
  {
    slug: 'scpi-commerce',
    title: 'SCPI commerce : rendement, locataires et risques | MaximusSCPI',
    description: 'Analyser les SCPI de commerces : emplacements, locataires, baux, rendement, valorisation, dette et risques sectoriels.',
    h1: 'SCPI de commerces : critères et risques à suivre',
    intro: 'Les SCPI de commerces doivent être lues à travers la qualité des emplacements, les enseignes, les baux, la vacance et l’évolution des usages.',
    sections: [
      ['Emplacements', 'Centralité, flux et zone de chalandise influencent la demande locative et la valeur des actifs.'],
      ['Locataires et baux', 'Diversification des enseignes, durée des baux et taux d’effort doivent être analysés ensemble.'],
      ['Cycle sectoriel', 'E-commerce, consommation et arbitrages immobiliers peuvent modifier les revenus et les valeurs.']
    ]
  },
  {
    slug: 'scpi-hotellerie-tourisme',
    title: 'SCPI hôtellerie et tourisme : rendement et risques | MaximusSCPI',
    description: 'Analyser les SCPI hôtellerie et tourisme : exploitants, baux, fréquentation, localisation, dette et risques.',
    h1: 'SCPI hôtellerie et tourisme : comprendre les risques spécifiques',
    intro: 'L’hôtellerie et le tourisme sont sensibles à la qualité des exploitants, aux baux, à la fréquentation et au cycle économique.',
    sections: [
      ['Exploitants', 'La solidité financière et la diversification des exploitants sont centrales dans l’analyse des revenus.'],
      ['Baux', 'Durée, indexation, garanties et répartition des charges doivent être rapprochées de la qualité des actifs.'],
      ['Cycle touristique', 'Fréquentation, saisonnalité et événements externes peuvent affecter les performances du secteur.']
    ]
  },
  {
    slug: 'scpi-revenus-etrangers',
    title: 'SCPI revenus étrangers : fiscalité et lecture du rendement | MaximusSCPI',
    description: 'Comprendre les revenus étrangers des SCPI : conventions fiscales, impôt acquitté à l’étranger et comparaison du rendement net.',
    h1: 'Revenus étrangers des SCPI : comprendre la fiscalité',
    intro: 'Les revenus immobiliers étrangers sont traités selon le pays source et la convention fiscale applicable. Les mécanismes diffèrent d’un pays à l’autre.',
    sections: [
      ['Pays source', 'Il faut identifier l’origine des revenus et les règles de la convention fiscale concernée.'],
      ['Méthode d’élimination', 'Crédit d’impôt ou taux effectif peuvent s’appliquer selon les conventions et la situation du contribuable.'],
      ['Rendement comparable', 'Un taux de distribution ne doit pas être comparé sans comprendre les modalités de présentation et la fiscalité associée.']
    ]
  }
];

const esc = (v = '') => String(v)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const canonical = (slug) => `${SITE}/${slug.replace(/^\/+|\/+$/g, '')}/`;

function extractMeta(html, pattern) {
  const match = html.match(pattern);
  return match ? match[1].trim() : '';
}

function needsRepair(target, page) {
  if (!fs.existsSync(target)) return true;
  const html = fs.readFileSync(target, 'utf-8');
  const title = extractMeta(html, /<title>([\s\S]*?)<\/title>/i);
  const canonicalHref = extractMeta(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i)
    || extractMeta(html, /<link\s+href=["']([^"']+)["']\s+rel=["']canonical["'][^>]*>/i);
  const h1 = extractMeta(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const generic = /Chargement en cours|Investir en SCPI avec un Expert Certifié ORIAS|Analysez\.\s*Comparez\.\s*Investissez/i.test(html);
  const badCanonical = canonicalHref && canonicalHref.replace(/\/$/, '') !== canonical(page.slug).replace(/\/$/, '');
  const missingEssentials = !title || !canonicalHref || !h1;
  return generic || badCanonical || missingEssentials;
}

function replaceOrInsert(html, pattern, replacement) {
  return pattern.test(html)
    ? html.replace(pattern, replacement)
    : html.replace('</head>', `    ${replacement}\n  </head>`);
}

function replaceRoot(html, root) {
  const start = html.indexOf('<div id="root">');
  if (start < 0) throw new Error('#root introuvable');
  const openEnd = html.indexOf('>', start);
  const re = /<\/?div\b[^>]*>/g;
  re.lastIndex = openEnd + 1;
  let depth = 1;
  let end = -1;
  let match;
  while ((match = re.exec(html))) {
    depth += match[0].startsWith('</') ? -1 : 1;
    if (depth === 0) {
      end = re.lastIndex;
      break;
    }
  }
  if (end < 0) throw new Error('fermeture #root introuvable');
  return html.slice(0, start) + root + html.slice(end);
}

function schema(page) {
  const url = canonical(page.slug);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: 'fr-FR',
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@type': 'Thing', name: page.h1 }
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: page.h1, item: url }
        ]
      }
    ]
  };
}

function root(page) {
  const cards = page.sections
    .map(([heading, text]) => `<article class="seo-card"><h2>${esc(heading)}</h2><p>${esc(text)}</p></article>`)
    .join('');
  return `<div id="root"><main class="seo-shell"><header class="seo-head"><a href="/"><img src="/Maximus logo 250x50 4.svg" width="250" height="50" alt="MaximusSCPI" /></a><nav><a href="/comparateur-scpi/">Comparateur</a><a href="/simulateurs/">Simulateurs</a><a href="/articles/">Apprendre</a></nav></header><section class="seo-main"><nav class="seo-crumb"><a href="/">Accueil</a><span>›</span><span>${esc(page.h1)}</span></nav><p class="seo-kicker">MaximusSCPI · Analyse pédagogique</p><h1>${esc(page.h1)}</h1><p class="seo-lead">${esc(page.intro)}</p><section class="seo-grid">${cards}</section><nav class="seo-links"><a href="/comparateur-scpi/">Comparer les SCPI</a><span>·</span><a href="/methodologie-donnees-scpi/">Méthodologie et sources</a><span>·</span><a href="/avertissements-risques-scpi/">Risques des SCPI</a></nav><p class="seo-note">Informations générales, non personnalisées. Les SCPI présentent notamment un risque de perte en capital et une liquidité non garantie. Les règles fiscales et réglementaires doivent être vérifiées selon la situation et la date concernées.</p></section></main><style>.seo-shell{min-height:100vh;background:#0D1117;color:#e2e8f0;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.seo-head{height:64px;max-width:1280px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1f2937;background:#111827}.seo-head img{width:205px;height:auto}.seo-head nav{display:flex;gap:20px}.seo-head a{color:#e5e7eb;text-decoration:none;font-size:14px;font-weight:650}.seo-main{max-width:1120px;margin:0 auto;padding:46px 24px 72px}.seo-crumb{display:flex;gap:8px;color:#94a3b8;font-size:13px;margin-bottom:42px}.seo-crumb a,.seo-links a{color:#6ee7b7;text-decoration:none}.seo-kicker{color:#6ee7b7;text-transform:uppercase;letter-spacing:.08em;font-size:12px;font-weight:800}.seo-main h1{max-width:920px;color:#fff;font-size:clamp(38px,5vw,60px);line-height:1.06;letter-spacing:-.035em;margin:12px 0 20px}.seo-lead{max-width:900px;color:#cbd5e1;font-size:19px;line-height:1.65;margin:0 0 34px}.seo-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.seo-card{border:1px solid #263244;border-radius:14px;background:#121a25;padding:20px}.seo-card h2{color:#fff;font-size:18px;margin:0 0 9px}.seo-card p{color:#aebbd0;line-height:1.65;margin:0}.seo-links{margin-top:28px;display:flex;gap:10px;flex-wrap:wrap}.seo-note{margin-top:34px;padding-top:20px;border-top:1px solid #263244;color:#94a3b8;font-size:13px}@media(max-width:760px){.seo-head nav{display:none}.seo-grid{grid-template-columns:1fr}.seo-main h1{font-size:40px}}</style></div>`;
}

const source = fs.readFileSync(sourcePath, 'utf-8');
let generated = 0;
let preserved = 0;

for (const page of PAGES) {
  const dir = path.join(distDir, ...page.slug.split('/'));
  const target = path.join(dir, 'index.html');
  if (!needsRepair(target, page)) {
    preserved++;
    continue;
  }

  const url = canonical(page.slug);
  let html = source;
  html = replaceOrInsert(html, /<title>[\s\S]*?<\/title>/i, `<title>${esc(page.title)}</title>`);
  html = replaceOrInsert(html, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${esc(page.description)}" />`);
  html = replaceOrInsert(html, /<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />');
  html = replaceOrInsert(html, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${url}" />`);
  html = replaceOrInsert(html, /<link\s+rel=["']alternate["'][^>]*hreflang=["']fr["'][^>]*>/i, `<link rel="alternate" hreflang="fr" href="${url}" />`);

  const socialTags = [
    ['og:url', url], ['og:title', page.title], ['og:description', page.description],
    ['twitter:url', url], ['twitter:title', page.title], ['twitter:description', page.description]
  ];
  for (const [prop, value] of socialTags) {
    html = replaceOrInsert(
      html,
      new RegExp(`<meta\\s+property=["']${prop.replace(':', '\\:')}["'][^>]*>`, 'i'),
      `<meta property="${prop}" content="${esc(value)}" />`
    );
  }

  html = html.replace('</head>', `    <script id="priority-seo-schema" type="application/ld+json">${JSON.stringify(schema(page)).replace(/</g, '\\u003c')}</script>\n  </head>`);
  html = replaceRoot(html, root(page));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(target, html, 'utf-8');
  generated++;
}

console.log(`✅ SEO prioritaire : ${generated} page(s) réparée(s), ${preserved} page(s) déjà correcte(s).`);
