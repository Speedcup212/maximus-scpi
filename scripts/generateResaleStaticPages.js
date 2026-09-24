import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');
const sourcePath = path.join(distDir, 'index.html');

if (!fs.existsSync(sourcePath)) {
  console.error('❌ dist/index.html introuvable pour les pages revente statiques.');
  process.exit(1);
}

const sourceHtml = fs.readFileSync(sourcePath, 'utf-8');

const pages = [
  {
    slug: 'revendre-parts-scpi-delais-marche-secondaire',
    title: 'Revendre ses parts de SCPI en 2026 : retrait, marché secondaire, prix et délais',
    description: 'Comment revendre des parts de SCPI en 2026 ? Retrait, marché secondaire, parts en attente, prix d’exécution, délais et méthode pour décider.',
    h1: 'Revendre ses parts de SCPI en 2026 : retrait, marché secondaire, prix et délais',
    intro: 'Revendre des parts de SCPI ne fonctionne pas comme vendre une action cotée. Selon la SCPI, la sortie passe par une demande de retrait, un marché secondaire ou une cession de gré à gré. Le prix et le délai ne sont jamais garantis.',
    sections: [
      ['Capital variable : la demande de retrait', 'Dans une SCPI à capital variable, une demande complète est inscrite au registre selon son ordre chronologique. Son exécution dépend notamment des nouvelles souscriptions disponibles et, lorsqu’il existe et peut être mobilisé, d’un fonds de remboursement. Une demande peut rester en attente pendant une durée indéterminée.'],
      ['Capital fixe ou variabilité suspendue : marché secondaire', 'Le vendeur transmet un ordre de vente avec un prix limite. Les ordres d’achat et de vente sont confrontés selon la périodicité prévue par la note d’information. Le prix d’exécution dépend de l’offre et de la demande et peut être très différent de l’ancien prix de souscription.'],
      ['Marché 2026 : liquidité encore très contrastée', 'Au 30 juin 2026, l’ASPIM indiquait encore 1,9 milliard d’euros de parts en attente, soit 2,2 % de la capitalisation du marché. Le stock avait diminué sur six mois, notamment sous l’effet de SCPI ayant suspendu leur variabilité et ouvert un marché secondaire.'],
      ['Avant de vendre : les informations à récupérer', 'Date et prix d’achat, nombre de parts, distributions déjà encaissées, mécanisme de sortie actuel, prix de retrait ou dernier prix d’exécution, parts en attente, valeurs de réalisation et de reconstitution, endettement, frais et fiscalité.'],
      ['Vendre maintenant ou conserver', 'La comparaison doit porter sur le bilan économique cumulé : capital récupérable aujourd’hui, revenus déjà encaissés, revenus futurs hypothétiques, risques de conservation et coût d’opportunité. Une baisse de prix ne suffit pas, à elle seule, pour conclure.']
    ],
    links: [
      ['/simulateur-marche-secondaire-scpi/', 'Simuler une revente de parts SCPI'],
      ['/articles/scpi-parts-en-attente-retrait-que-faire/', 'Parts en attente de retrait : que faire ?'],
      ['/articles/scpi-capital-fixe-marche-secondaire-prix-execution/', 'Comprendre le marché secondaire à capital fixe'],
      ['/articles/primovie-revente-parts-marche-secondaire-2026/', 'Primovie : revente sur le marché secondaire en 2026'],
      ['/articles/scpi-baisse-vendre-ou-attendre/', 'SCPI en baisse : vendre ou attendre ?']
    ]
  },
  {
    slug: 'scpi-parts-en-attente-retrait-que-faire',
    title: 'Parts de SCPI en attente de retrait : que faire en 2026 ?',
    description: 'Parts SCPI bloquées ou en attente ? Rang de retrait, registre, documents, fonds de remboursement et passage éventuel au marché secondaire.',
    h1: 'Parts de SCPI en attente de retrait : que faire en 2026 ?',
    intro: 'Une demande de retrait non exécutée ne signifie pas qu’il faut renvoyer immédiatement un nouveau bulletin. Il faut d’abord vérifier votre rang, le stock de parts devant vous et le mécanisme de sortie encore applicable à la SCPI.',
    sections: [
      ['Demandez votre rang exact', 'Pour une SCPI à capital variable, les demandes complètes sont enregistrées par ordre chronologique. L’AMF rappelle qu’une demande de retrait n’a pas à être renouvelée simplement parce qu’elle attend depuis longtemps.'],
      ['Demandez trois chiffres', 'Votre rang dans le registre, le nombre ou le montant de parts en attente devant votre ordre et le volume de retraits réellement exécutés au dernier trimestre permettent de mesurer la vitesse réelle d’écoulement.'],
      ['Vérifiez si le mode de sortie a changé', 'Certaines SCPI peuvent suspendre la variabilité de leur capital et basculer vers un marché secondaire. Le vendeur doit alors utiliser un ordre de vente et un prix limite au lieu de l’ancien registre de retrait.'],
      ['Ne confondez pas registre et carnet d’ordres', 'Le registre de retrait d’une SCPI à capital variable et le carnet d’ordres d’un marché secondaire sont deux mécanismes différents. Leur lecture et leurs règles d’exécution ne sont pas interchangeables.']
    ],
    links: [
      ['/articles/revendre-parts-scpi-delais-marche-secondaire/', 'Guide complet de la revente SCPI'],
      ['/simulateur-marche-secondaire-scpi/', 'Simulateur revente SCPI']
    ]
  },
  {
    slug: 'scpi-capital-fixe-marche-secondaire-prix-execution',
    title: 'SCPI à capital fixe : marché secondaire et prix d’exécution',
    description: 'Comment vendre une SCPI à capital fixe ? Carnet d’ordres, confrontation, prix limite, prix d’exécution, net vendeur et décote.',
    h1: 'SCPI à capital fixe : comment fonctionne le marché secondaire et le prix d’exécution ?',
    intro: 'Dans une SCPI à capital fixe, vendre ses parts signifie trouver un acheteur. La société de gestion organise un marché secondaire où les ordres d’achat et de vente sont confrontés périodiquement.',
    sections: [
      ['Le vendeur choisit un prix limite', 'L’ordre de vente indique le nombre de parts et le prix minimum accepté. Il rejoint le carnet d’ordres jusqu’à exécution, modification ou expiration selon les règles de la SCPI.'],
      ['Prix d’exécution, net vendeur et prix acquéreur', 'Le prix d’exécution est le prix de marché issu de la confrontation. Le net vendeur tient compte des frais imputables au vendeur ; le prix acquéreur inclut les frais et droits applicables à l’acheteur.'],
      ['Pourquoi une forte décote est possible', 'La valeur de reconstitution est une mesure patrimoniale alors que le prix d’exécution est un prix de marché. Si les vendeurs sont nombreux et les acheteurs rares, la décote peut devenir importante.'],
      ['Lire un carnet d’ordres', 'Regardez les meilleurs ordres d’achat, les ordres de vente les plus bas, les quantités correspondantes et le volume réellement exécuté. Un prix sans volume n’est pas une preuve de liquidité.']
    ],
    links: [
      ['/articles/revendre-parts-scpi-delais-marche-secondaire/', 'Guide revente SCPI 2026'],
      ['/articles/primovie-revente-parts-marche-secondaire-2026/', 'Cas Primovie 2026'],
      ['/simulateur-marche-secondaire-scpi/', 'Simuler votre prix de sortie']
    ]
  },
  {
    slug: 'primovie-revente-parts-marche-secondaire-2026',
    title: 'Primovie : revente des parts sur le marché secondaire en 2026',
    description: 'Primovie a suspendu la variabilité de son capital en juin 2026. Comment vendre désormais ? Prix limite, marché secondaire et valeurs à connaître.',
    h1: 'Primovie : comment revendre ses parts sur le marché secondaire en 2026 ?',
    intro: 'Primovie a suspendu temporairement la variabilité de son capital le 23 juin 2026. Les demandes de souscription et de retrait ont été annulées et la sortie passe désormais par un marché secondaire organisé par Praemia REIM France.',
    sections: [
      ['Depuis juin 2026 : un nouveau mécanisme de sortie', 'L’ancien prix de retrait n’est plus le mécanisme de sortie. Le vendeur doit placer un ordre de vente et raisonner avec un prix limite et un prix d’exécution issu de la confrontation des ordres.'],
      ['Les repères patrimoniaux publiés', 'Au 30 juin 2026, Praemia REIM publiait une valeur de réalisation de 123,76 € par part et une valeur de reconstitution de 146,51 € par part. Ces valeurs sont des repères patrimoniaux et non un prix de vente garanti.'],
      ['Choisir un prix limite', 'Un vendeur pressé peut privilégier la probabilité d’exécution au prix d’une décote plus forte. Un vendeur sans besoin immédiat peut fixer une limite plus élevée, au risque de ne pas être exécuté.'],
      ['Exemple simplifié', 'Pour 200 parts, un écart de 20 € par part entre deux prix d’exécution représente 4 000 € de capital. Le choix du prix limite doit donc être confronté au besoin de liquidité et aux perspectives de la SCPI.']
    ],
    links: [
      ['/simulateur-marche-secondaire-scpi/', 'Tester vos propres chiffres'],
      ['/articles/scpi-capital-fixe-marche-secondaire-prix-execution/', 'Comprendre le marché secondaire'],
      ['/articles/scpi-baisse-vendre-ou-attendre/', 'Vendre ou attendre après une baisse ?']
    ]
  },
  {
    slug: 'scpi-baisse-vendre-ou-attendre',
    title: 'SCPI en baisse : vendre ses parts ou attendre ? 7 critères',
    description: 'Prix de part en baisse : faut-il vendre une SCPI ou attendre ? Liquidité, valeurs immobilières, dette, revenus, horizon et coût d’opportunité.',
    h1: 'SCPI en baisse : vendre ses parts ou attendre ? 7 critères à analyser',
    intro: 'Une baisse du prix de part ne suffit pas pour décider. Il faut comparer la perte cristallisée aujourd’hui au rendement et aux risques attendus si les parts sont conservées.',
    sections: [
      ['1. Votre besoin de liquidité', 'Un besoin de trésorerie proche rend la capacité réelle à sortir prioritaire. Sans besoin immédiat, l’analyse des fondamentaux peut peser davantage.'],
      ['2. Le prix réellement exécutable', 'Utilisez le prix de retrait applicable ou le dernier prix d’exécution du marché secondaire, pas seulement l’ancien prix de souscription.'],
      ['3. Les valeurs immobilières', 'Suivez la valeur de réalisation et la valeur de reconstitution. Leur évolution aide à apprécier si la correction du prix a déjà absorbé une partie de la baisse patrimoniale.'],
      ['4. L’endettement', 'Une dette élevée peut accroître la sensibilité aux baisses de valeurs et aux refinancements. Regardez le ratio, les échéances et les taux.'],
      ['5. La qualité des revenus', 'TOF, WALT, WALB, impayés, renégociations, locataires et cessions d’actifs sont plus informatifs que le seul taux de distribution.'],
      ['6. Les revenus déjà encaissés', 'Une moins-value en capital n’est pas le bilan économique complet. Les distributions encaissées doivent être intégrées sans masquer une détérioration future.'],
      ['7. Le coût d’opportunité', 'Conserver immobilise un capital qui pourrait être réalloué. Comparez plusieurs scénarios plutôt qu’une seule hypothèse optimiste.']
    ],
    links: [
      ['/simulateur-marche-secondaire-scpi/', 'Calculer le bilan économique et le point mort'],
      ['/articles/revendre-parts-scpi-delais-marche-secondaire/', 'Guide revente SCPI 2026'],
      ['/baisse-prix-part-scpi/', 'Comprendre la baisse du prix de part']
    ]
  }
];

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

function replaceRoot(html, staticRoot) {
  const rootStart = html.indexOf('<div id="root">');
  if (rootStart === -1) throw new Error('#root introuvable');
  const rootOpenEnd = html.indexOf('>', rootStart);
  const divRegex = /<\/?div\b[^>]*>/g;
  divRegex.lastIndex = rootOpenEnd + 1;
  let depth = 1;
  let rootEnd = -1;
  let match;
  while ((match = divRegex.exec(html)) !== null) {
    if (match[0].startsWith('</')) depth -= 1;
    else depth += 1;
    if (depth === 0) {
      rootEnd = divRegex.lastIndex;
      break;
    }
  }
  if (rootEnd === -1) throw new Error('fermeture #root introuvable');
  return html.slice(0, rootStart) + staticRoot + html.slice(rootEnd);
}

for (const page of pages) {
  const url = `https://maximusscpi.com/articles/${page.slug}/`;
  let html = sourceHtml
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(page.title)} | MaximusSCPI</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(page.description)}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeHtml(page.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeHtml(page.description)}" />`);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    description: page.description,
    url,
    dateModified: '2026-09-24',
    author: {
      '@type': 'Person',
      name: 'Eric Bellaiche',
      jobTitle: 'Conseiller en investissements financiers (CIF)'
    },
    publisher: { '@type': 'Organization', name: 'MaximusSCPI' }
  };
  html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(schema)}</script></head>`);

  const sectionHtml = page.sections.map(([title, body]) =>
    `<section><h2>${escapeHtml(title)}</h2><p>${escapeHtml(body)}</p></section>`
  ).join('');
  const linksHtml = page.links.map(([href, label]) =>
    `<li><a href="${href}">${escapeHtml(label)}</a></li>`
  ).join('');

  const staticRoot = `<div id="root">
    <main class="resale-static">
      <article>
        <p class="eyebrow">Revente & liquidité SCPI</p>
        <h1>${escapeHtml(page.h1)}</h1>
        <p class="updated">Éric Bellaiche, CGP-CIF · Mise à jour 24 septembre 2026</p>
        <p class="intro">${escapeHtml(page.intro)}</p>
        ${sectionHtml}
        <aside>
          <h2>Outils et analyses liés</h2>
          <ul>${linksHtml}</ul>
        </aside>
        <p class="disclaimer">Contenu pédagogique, non personnalisé. Les parts de SCPI présentent un risque de perte en capital et de liquidité. Les prix, délais et distributions futurs ne sont pas garantis.</p>
      </article>
    </main>
  </div>`;

  const css = `<style>
    .resale-static{min-height:100vh;background:#0f172a;color:#e2e8f0;font-family:system-ui,-apple-system,sans-serif;padding:48px 20px}
    .resale-static article{max-width:820px;margin:0 auto}.resale-static .eyebrow{color:#34d399;font-weight:700;text-transform:uppercase;letter-spacing:.08em;font-size:.78rem}
    .resale-static h1{font-size:clamp(2rem,5vw,3.25rem);line-height:1.08;color:#fff;margin:12px 0 12px}.resale-static .updated{color:#94a3b8;font-size:.9rem;margin-bottom:28px}
    .resale-static .intro{font-size:1.15rem;line-height:1.75;color:#cbd5e1}.resale-static h2{font-size:1.4rem;color:#fff;margin:34px 0 10px;padding-left:12px;border-left:4px solid #10b981}
    .resale-static p,.resale-static li{line-height:1.75;color:#cbd5e1}.resale-static aside{margin-top:36px;border:1px solid #334155;background:#111827;border-radius:14px;padding:20px}
    .resale-static a{color:#34d399}.resale-static .disclaimer{border-top:1px solid #334155;margin-top:36px;padding-top:18px;color:#64748b;font-size:.82rem}
  </style>`;
  html = html.replace('</head>', css + '</head>');
  html = replaceRoot(html, staticRoot);

  const outDir = path.join(distDir, 'articles', page.slug);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
  console.log(`✅ Revente statique : /articles/${page.slug}/`);
}

console.log(`✅ ${pages.length} pages revente statiques générées`);
