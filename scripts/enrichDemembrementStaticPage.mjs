import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const file = path.join(__dirname, '../dist/comparateur-demembrement-scpi/index.html');
const canonical = 'https://maximusscpi.com/comparateur-demembrement-scpi/';

if (!fs.existsSync(file)) throw new Error('Page /comparateur-demembrement-scpi/ absente');
let html = fs.readFileSync(file, 'utf-8');

const extra = `
<section id="demembrement-seo-depth" style="max-width:1100px;margin:0 auto;padding:12px 24px 56px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <h2 style="font-size:28px;line-height:1.2;margin:26px 0 14px">Comment comparer les clés de démembrement SCPI ?</h2>
  <p style="line-height:1.75;color:#475569;margin:0 0 16px">Une clé de démembrement répartit la valeur économique des parts entre nue-propriété et usufruit pour une durée déterminée. Comparer deux offres impose donc de travailler à durée identique et de vérifier les conditions propres à chaque SCPI. Une décote plus élevée n’est pas automatiquement meilleure : elle doit être rapprochée de la durée d’immobilisation, de la qualité de la SCPI, des modalités de reconstitution de la pleine propriété et de la liquidité disponible.</p>
  <p style="line-height:1.75;color:#475569;margin:0 0 22px">Pendant le démembrement, le nu-propriétaire ne perçoit pas les distributions attachées à l’usufruit. La logique patrimoniale diffère donc d’un investissement en pleine propriété destiné à produire un revenu immédiat. Le comparateur doit aider à confronter les clés et les durées, mais l’adéquation dépend de l’horizon, du besoin de revenus, de la fiscalité et de la capacité à immobiliser le capital.</p>

  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;margin:24px 0 30px">
    <article style="border:1px solid #e2e8f0;border-radius:12px;padding:18px;background:white"><h3 style="margin:0 0 8px">Durée</h3><p style="margin:0;color:#64748b;line-height:1.65">Comparez des durées identiques. Une clé sur 5 ans ne peut pas être mise en concurrence directement avec une clé sur 10 ans sans intégrer l’horizon d’immobilisation.</p></article>
    <article style="border:1px solid #e2e8f0;border-radius:12px;padding:18px;background:white"><h3 style="margin:0 0 8px">Décote d’acquisition</h3><p style="margin:0;color:#64748b;line-height:1.65">La décote représente la fraction de valeur correspondant à l’absence temporaire d’usufruit. Elle ne constitue ni un rendement garanti, ni une protection contre la baisse de valeur de la part.</p></article>
    <article style="border:1px solid #e2e8f0;border-radius:12px;padding:18px;background:white"><h3 style="margin:0 0 8px">Qualité de la SCPI</h3><p style="margin:0;color:#64748b;line-height:1.65">TOF, valorisation, dette, patrimoine, société de gestion et liquidité restent essentiels. Une clé attractive ne compense pas mécaniquement une trajectoire opérationnelle dégradée.</p></article>
    <article style="border:1px solid #e2e8f0;border-radius:12px;padding:18px;background:white"><h3 style="margin:0 0 8px">Sortie et pleine propriété</h3><p style="margin:0;color:#64748b;line-height:1.65">La pleine propriété se reconstitue selon les conditions prévues à l’échéance. Une sortie anticipée peut être difficile : le démembrement doit être considéré comme un engagement de durée.</p></article>
  </div>

  <h2 style="font-size:24px;margin:0 0 12px">Nue-propriété ou pleine propriété : deux objectifs différents</h2>
  <p style="line-height:1.75;color:#475569;margin:0 0 16px">La nue-propriété peut répondre à une logique d’investissement différé lorsque l’investisseur accepte de ne pas percevoir de revenus pendant la période. La pleine propriété répond davantage à une logique de détention avec droit aux distributions, sous réserve des performances de la SCPI. Le bon choix ne peut donc pas être déduit de la seule clé de démembrement.</p>

  <h2 style="font-size:24px;margin:28px 0 12px">Vérifications avant de sélectionner une SCPI en démembrement</h2>
  <ul style="line-height:1.75;color:#475569;padding-left:22px;margin:0 0 22px">
    <li>vérifier la durée exacte et la clé proposée au moment de la souscription ;</li>
    <li>contrôler la documentation de la SCPI et les modalités de démembrement ;</li>
    <li>analyser la trajectoire de la SCPI au-delà du rendement affiché ;</li>
    <li>intégrer le risque de perte en capital et l’absence de liquidité garantie ;</li>
    <li>faire valider les conséquences fiscales et patrimoniales selon la situation réelle.</li>
  </ul>

  <p style="line-height:1.75;color:#475569;margin:0"><a href="/scpi-demembrement/" style="color:#047857;font-weight:700">Comprendre le démembrement SCPI</a> · <a href="/comparateur-scpi/" style="color:#047857;font-weight:700">Comparer les SCPI</a> · <a href="/risques-scpi/" style="color:#047857;font-weight:700">Risques des SCPI</a> · <a href="/societes-de-gestion-scpi/" style="color:#047857;font-weight:700">Sociétés de gestion</a> · <a href="/articles/" style="color:#047857;font-weight:700">Guides SCPI</a> · <a href="/methodologie-donnees-scpi/" style="color:#047857;font-weight:700">Méthodologie des données</a></p>
</section>`;

if (!html.includes('id="demembrement-seo-depth"')) {
  const mainEnd = html.lastIndexOf('</main>');
  if (mainEnd === -1) throw new Error('Fermeture </main> absente sur démembrement');
  html = html.slice(0, mainEnd) + extra + html.slice(mainEnd);
}
fs.writeFileSync(file, html, 'utf-8');

const text = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const words = text.split(' ').filter(Boolean).length;
const links = (html.match(/href=["']\//gi) || []).length;
if (words < 500) throw new Error(`Démembrement trop mince : ${words} mots`);
if (links < 7) throw new Error(`Maillage démembrement insuffisant : ${links} liens`);
if (!html.includes(`<link rel="canonical" href="${canonical}"`)) throw new Error('Canonical démembrement non self');
console.log(`✅ /comparateur-demembrement-scpi/ enrichi : ${words} mots, ${links} liens internes`);
