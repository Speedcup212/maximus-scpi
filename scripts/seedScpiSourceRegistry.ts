import { createClient } from '@supabase/supabase-js';
import scpiCatalog from '../src/data/scpi_complet.json' with { type: 'json' };
import sourceCatalog from '../data/scpi-investment-news-sources.json' with { type: 'json' };

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const slugify = (value: string) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const sourceMap = new Map(
  (sourceCatalog as any[]).map((source) => [source.slug, source]),
);

const exactPages: Record<string, string> = {
  comete: 'https://alderan.fr/scpi-comete-documentation/',
  activimmo: 'https://alderan.fr/scpi-activimmo/',
  'novaxia-neo': 'https://www.novaxia-investissement.fr/produits/novaxia-neo/',
  'perial-opportunites-europe': 'https://www.perial.com/scpi/perial-opportunites-europe',
  'iroko-zen': 'https://www.iroko.eu/scpi-iroko-zen/',
  'remake-live': 'https://www.remake.fr/remake-live/',
  'altixia-cadence-12': 'https://www.altixia.fr/scpi-cadence.php',
  'ficommerce-proximite': 'https://www.fiducial-gerance.fr/investir-en-scpi/nos-scpi/ficommerce-proximite',
  'esg-pierre-capital': 'https://fr.swisslife-am.com/fr/particuliers/documentation/scpi-pierre-capitale.html',
};

const rows = (scpiCatalog as any[]).map((scpi) => {
  const slug = slugify(scpi['Nom SCPI']);
  const source: any = sourceMap.get(slug);

  const pageUrl =
    exactPages[slug] ||
    (source?.newsUrl && /\/bt\/?$/.test(source.newsUrl) ? source.newsUrl : source?.officialUrl) ||
    null;

  let sourceDomain: string | null = null;
  if (pageUrl) {
    try {
      sourceDomain = new URL(pageUrl).origin;
    } catch {
      sourceDomain = null;
    }
  }

  return {
    scpi_slug: slug,
    scpi_name: scpi['Nom SCPI'],
    management_company: scpi['Société de gestion'] || source?.managementCompany || 'À vérifier',
    official_scpi_page_url: pageUrl,
    source_domain: sourceDomain,
    automation_enabled: source?.enabled !== false,
    updated_at: new Date().toISOString(),
  };
});

const { error } = await supabase
  .from('scpi_source_registry')
  .upsert(rows, { onConflict: 'scpi_slug' });

if (error) throw error;

console.log(`[SCPI sources] ${rows.length} sources synchronisées.`);
