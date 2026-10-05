import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');

const words = (html) => html
  .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z0-9#]+;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .split(' ')
  .filter(Boolean).length;

const patchTitle = (html, title) => html
  .replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
  .replace(/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${title}" />`)
  .replace(/<meta\s+(?:name|property)=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${title}" />`);

// Article LMNP / SCPI : snippet plus court et un seul H1 dans le HTML crawler.
{
  const file = path.join(distDir, 'articles', 'lmnp-ou-scpi', 'index.html');
  if (fs.existsSync(file)) {
    let html = fs.readFileSync(file, 'utf8');
    const title = 'LMNP ou SCPI : comparatif immobilier | MaximusSCPI';
    html = patchTitle(html, title);

    let seenH1 = false;
    html = html.replace(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi, (_match, attrs, body) => {
      if (!seenH1) {
        seenH1 = true;
        return `<h1${attrs}>${body}</h1>`;
      }
      return `<h2${attrs}>${body}</h2>`;
    });

    fs.writeFileSync(file, html, 'utf8');
    const h1Count = (html.match(/<h1\b/gi) || []).length;
    if (title.length > 60) throw new Error(`LMNP/SCPI title trop long: ${title.length}`);
    if (h1Count !== 1) throw new Error(`LMNP/SCPI doit contenir 1 H1, trouvé: ${h1Count}`);
    console.log('✅ LMNP/SCPI : title et H1 normalisés');
  }
}

// FAQ : rendre le HTML initial suffisamment explicite pour les crawlers et moteurs de réponse.
{
  const file = path.join(distDir, 'faq', 'index.html');
  if (fs.existsSync(file)) {
    let html = fs.readFileSync(file, 'utf8');
    html = html.replace(/<section[^>]*data-faq-seo-depth=["']true["'][^>]*>[\s\S]*?<\/section>/i, '');

    const block = `<section data-faq-seo-depth="true" aria-label="Repères essentiels sur les SCPI"><h2>Les repères essentiels avant d’investir en SCPI</h2><p>Une SCPI est un placement immobilier collectif dont le capital, les revenus et la liquidité ne sont pas garantis. Avant de comparer les rendements, il faut examiner la qualité des immeubles, le taux d’occupation financier, les locataires, la durée des baux, l’endettement, les besoins de travaux, les valeurs d’expertise et le fonctionnement des retraits. Le taux de distribution constitue un indicateur de revenu sur une période donnée, pas une promesse de performance future.</p><p>La fiscalité dépend du mode de détention et de la nature des revenus. Une détention en direct, une assurance-vie, un démembrement ou une société ne produisent pas les mêmes flux ni les mêmes conséquences fiscales. Pour les revenus immobiliers étrangers, les conventions fiscales doivent être étudiées pays par pays : il n’existe pas de règle uniforme applicable à toutes les SCPI européennes.</p><p>La revente mérite une attention particulière. Selon la structure de la SCPI et l’équilibre entre souscriptions et retraits, le délai de sortie peut s’allonger. Les parts en attente, la collecte nette et l’évolution du prix de part sont donc à suivre avec le rendement. MaximusSCPI utilise le Radar, la Trajectoire et les Signaux du marché pour replacer ces indicateurs dans le temps et distinguer une variation ponctuelle d’une dégradation plus structurelle.</p><p>Pour approfondir, consulte le <a href="/comparateur-scpi/">comparateur SCPI</a>, les <a href="/risques-scpi/">risques des SCPI</a>, la page <a href="/scpi-ifi/">SCPI et IFI</a> et les <a href="/articles/">guides pédagogiques</a>. Les informations du site restent générales : une décision doit tenir compte de l’horizon, de la capacité de perte, du besoin de liquidité et de la situation patrimoniale de l’investisseur.</p></section>`;

    html = html.includes('</main>') ? html.replace('</main>', `${block}</main>`) : html.replace('</body>', `${block}</body>`);
    fs.writeFileSync(file, html, 'utf8');
    const count = words(html);
    if (count < 250) throw new Error(`FAQ statique encore trop courte: ${count} mots`);
    console.log(`✅ FAQ statique enrichie : ${count} mots`);
  }
}
