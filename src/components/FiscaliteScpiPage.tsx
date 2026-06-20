import React from 'react';
import { AlertTriangle, BookOpen, ArrowRight, Globe, TrendingUp, Shield, Info } from 'lucide-react';
import SchemaOrg, { generateBreadcrumbs } from './SchemaOrg';
import Breadcrumb from './Breadcrumb';

interface FiscaliteScpiPageProps {
  onNavigate?: (path: string) => void;
  onRdvClick?: () => void;
  onComparateurClick?: () => void;
}

const FiscaliteScpiPage: React.FC<FiscaliteScpiPageProps> = ({ onNavigate, onRdvClick, onComparateurClick }) => {
  const breadcrumbs = generateBreadcrumbs('/fiscalite-scpi');
  const currentDate = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const isoDate = new Date().toISOString().split('T')[0];

  const handleRdvClick = () => { if (onRdvClick) onRdvClick(); };
  const handleComparateurClick = () => {
    if (onComparateurClick) { onComparateurClick(); }
    else if (onNavigate) { onNavigate('/comparateur-scpi'); }
  };

  const btnPrimaryClass = "inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors";
  const btnSecondaryClass = "inline-flex items-center gap-2 bg-slate-800 text-blue-300 border border-blue-500/50 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors";

  const relatedArticles = [
    { title: "SCPI en direct ou en assurance-vie : quelle enveloppe choisir ?", url: "/articles/scpi-en-direct-ou-assurance-vie/" },
    { title: "Démembrement de propriété SCPI : nue-propriété et usufruit", url: "/articles/demembrement-scpi-nue-propriete-usufruit/" },
    { title: "PER et SCPI : déduction fiscale et préparation à la retraite", url: "/articles/per-scpi-retraite-deduction-fiscale/" },
    { title: "SCI et SCPI : détention via une société civile immobilière", url: "/articles/sci-scpi-societe-civile-immobiliere-parts/" },
    { title: "Investir en SCPI : guide complet pour débutants", url: "/articles/premier-investissement-scpi-debutant-guide/" },
    { title: "SCPI pour jeunes actifs : investir entre 25 et 35 ans", url: "/articles/investir-scpi-jeune-actif-25-35-ans/" },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">

      {/* ── Schema.org ── */}
      <SchemaOrg type="BreadcrumbList" data={{ items: breadcrumbs }} />
      <SchemaOrg
        type="FAQPage"
        data={{
          questions: [
            {
              question: "Comment sont imposés les revenus d'une SCPI ?",
              answer: "Les revenus d'une SCPI relèvent le plus souvent de la catégorie des revenus fonciers, imposés selon la tranche marginale d'imposition (TMI) du contribuable, auxquels s'ajoutent 17,2 % de prélèvements sociaux. Le régime fiscal varie selon le mode de détention : direct, assurance-vie, PER, démembrement ou SCI à l'IS. Ces informations sont générales et ne constituent pas un conseil fiscal personnalisé.",
            },
            {
              question: "Quel est le taux des prélèvements sociaux sur les revenus de SCPI ?",
              answer: "Les prélèvements sociaux s'élèvent à 17,2 % sur les revenus fonciers issus de SCPI (taux global en vigueur : CSG 9,2 %, CRDS 0,5 %, prélèvement de solidarité 7,5 %). La CSG est partiellement déductible (6,8 %) au régime réel l'année suivante. Ce taux est susceptible d'évoluer selon la législation fiscale.",
            },
            {
              question: "Les SCPI européennes sont-elles moins imposées en France ?",
              answer: "Les revenus de SCPI européennes peuvent bénéficier d'une imposition réduite en France grâce aux conventions fiscales bilatérales, via la méthode du taux effectif ou un crédit d'impôt. Cela ne signifie pas une exonération totale. Les prélèvements sociaux peuvent s'appliquer selon les cas. Vérifiez la notice fiscale de chaque SCPI et consultez un professionnel habilité.",
            },
            {
              question: "Peut-on réduire la fiscalité de ses revenus SCPI ?",
              answer: "Plusieurs enveloppes peuvent modifier la fiscalité applicable : assurance-vie (imposition différée aux rachats), PER (déductibilité à l'entrée sous conditions), démembrement temporaire (pas de revenus imposables pendant la nue-propriété), SCI à l'IS (imposition au taux IS). Ces dispositifs comportent des avantages et des risques spécifiques. Ces informations ne constituent pas un conseil personnalisé.",
            },
            {
              question: "Les parts de SCPI sont-elles soumises à l'IFI ?",
              answer: "Les parts de SCPI entrent dans l'assiette de l'IFI à hauteur de la fraction représentant la valeur des actifs immobiliers détenus par la SCPI. Chaque société de gestion communique annuellement la quote-part IFI par part. Les SCPI détenues via un contrat d'assurance-vie peuvent bénéficier sous conditions d'une exonération partielle selon la composition du contrat. Consultez un professionnel habilité.",
            },
            {
              question: "Quels sont les risques fiscaux d'un investissement en SCPI ?",
              answer: "La fiscalité française évolue chaque année (loi de finances, conventions bilatérales, taux de prélèvements sociaux). Le taux de distribution affiché est brut de fiscalité : le rendement net dépend de votre TMI. Investir en SCPI comporte des risques de perte en capital, de revenus non garantis et de liquidité limitée, indépendamment de la fiscalité.",
            },
          ],
        }}
      />
      <SchemaOrg
        type="Article"
        data={{
          title: "Fiscalité des SCPI : comprendre l'imposition de vos revenus fonciers",
          description: "Guide complet sur la fiscalité des SCPI : revenus fonciers, TMI, prélèvements sociaux, SCPI européennes, assurance-vie, PER, démembrement, IFI. Données pédagogiques, non personnalisées.",
          datePublished: "2026-01-01",
          dateModified: isoDate,
          url: "/fiscalite-scpi",
        }}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Date */}
        <div className="text-sm text-slate-400 mb-3">
          📅 Dernière mise à jour : {currentDate}
        </div>

        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbs} onNavigate={onNavigate} />

        {/* ── Avertissement CIF ── */}
        <div className="bg-amber-950/50 border-l-4 border-amber-500 rounded-xl p-4 mb-6 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200">
            <strong>Information générale uniquement.</strong> Les informations fiscales présentées sont d'ordre pédagogique et ne constituent pas un conseil fiscal ou en investissement personnalisé au sens de la réglementation CIF/AMF. La fiscalité dépend de votre situation individuelle. Consultez un professionnel habilité. Investir en SCPI comporte des risques : perte en capital, revenus non garantis, liquidité limitée.
          </p>
        </div>

        {/* ══════════════════════════════════════
            HERO
        ══════════════════════════════════════ */}
        <div className="bg-slate-900/80 border border-slate-700/70 rounded-2xl shadow-2xl p-6 md:p-10 mb-8">
          <div className="space-y-6">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-300">
              <TrendingUp className="h-4 w-4" />
              Fiscalité SCPI
            </div>

            {/* H1 + sous-titre */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Fiscalité des SCPI : comprendre l'imposition de vos revenus fonciers
              </h1>
              <p className="text-lg md:text-xl text-slate-300">
                Comprendre et anticiper l'imposition de vos revenus fonciers
              </p>
            </div>

            {/* Intro */}
            <div className="rounded-xl border-l-4 border-blue-500 bg-blue-950/40 p-5">
              <p className="text-slate-200 leading-relaxed">
                Investir en SCPI génère des revenus fonciers imposables selon votre tranche marginale d'imposition (TMI), auxquels s'ajoutent les prélèvements sociaux à 17,2 %. <strong className="text-white">Le rendement net après impôt peut être significativement inférieur au taux de distribution brut affiché.</strong> Cette page détaille les règles fiscales applicables, les dispositifs d'optimisation existants et les points de vigilance, à titre strictement pédagogique.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={handleRdvClick} className={`${btnPrimaryClass} w-full sm:w-auto`}>
                Analyser ma fiscalité SCPI
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
              <button type="button" onClick={handleComparateurClick} className={`${btnSecondaryClass} w-full sm:w-auto`}>
                Comparer les SCPI
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            SOMMAIRE
        ══════════════════════════════════════ */}
        <nav aria-label="Sommaire" className="bg-slate-900/80 border border-slate-700/70 rounded-2xl p-6 mb-10">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            Sommaire
          </h2>
          <ol className="space-y-2 text-sm">
            <li><a href="#revenus-fonciers" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">1. Comprendre les revenus fonciers issus de SCPI</a></li>
            <li><a href="#tmi-prelevements" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">2. Impôt sur le revenu, TMI et prélèvements sociaux</a></li>
            <li><a href="#scpi-europeennes" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">3. SCPI européennes et revenus de source étrangère</a></li>
            <li><a href="#optimisation" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">4. Optimiser sa fiscalité : assurance-vie, PER, démembrement, SCI à l'IS</a></li>
            <li><a href="#ifi-succession" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">5. IFI, succession et détention patrimoniale</a></li>
            <li><a href="#risques" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">6. Risques fiscaux et points de vigilance</a></li>
          </ol>
        </nav>

        {/* ══════════════════════════════════════
            SECTION 1 — Revenus fonciers
        ══════════════════════════════════════ */}
        <section id="revenus-fonciers" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Info className="w-7 h-7 text-blue-400 flex-shrink-0" />
            1. Comprendre les revenus fonciers issus de SCPI
          </h2>

          <h3 className="text-xl font-semibold text-slate-100 mb-3">Nature fiscale des revenus distribués</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            Les revenus distribués par une SCPI relèvent dans la plupart des cas de la catégorie des <strong className="text-white">revenus fonciers</strong>, dès lors que la SCPI détient des immeubles loués nus. Lorsque la SCPI perçoit des loyers de locaux meublés, d'hôtels ou de résidences gérées, une part des revenus peut relever des <strong className="text-white">bénéfices industriels et commerciaux (BIC)</strong>. La nature exacte des revenus est précisée dans l'annexe fiscale communiquée annuellement aux associés par la société de gestion.
          </p>

          <div className="bg-slate-800/60 border border-slate-600/50 rounded-xl p-4 mb-6">
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">Source :</strong> Les distributions et leur nature fiscale sont issues des documents réglementaires de chaque SCPI (DIC, note d'information, bulletin trimestriel, rapport annuel). MaximusSCPI ne procède à aucune extrapolation.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-slate-100 mb-3">Le régime micro-foncier</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            Si vos revenus fonciers bruts annuels (SCPI + autres revenus fonciers directs) ne dépassent pas <strong className="text-white">15 000 €</strong> et si vous ne détenez pas de biens soumis à certains régimes spéciaux (Malraux, monuments historiques…), vous pouvez relever du régime micro-foncier. Un abattement forfaitaire de <strong className="text-white">30 %</strong> est appliqué automatiquement : vous n'êtes imposé que sur 70 % de vos revenus bruts. Ce régime est simple mais peut s'avérer moins avantageux si vos charges réelles dépassent 30 %.
          </p>

          <h3 className="text-xl font-semibold text-slate-100 mb-3">Le régime réel</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            Le régime réel permet de déduire les charges réelles : intérêts d'emprunt (si financement à crédit), frais de gestion, travaux… Si le résultat est négatif (<strong className="text-white">déficit foncier</strong>), il peut être imputé sur le revenu global dans la limite de <strong className="text-white">10 700 € par an</strong> (hors intérêts d'emprunt). L'excédent de déficit est reportable sur les revenus fonciers des 10 années suivantes.
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-800/80">
                  <th className="px-4 py-3 text-left border border-slate-600 text-slate-200">Régime</th>
                  <th className="px-4 py-3 text-center border border-slate-600 text-slate-200">Condition</th>
                  <th className="px-4 py-3 text-center border border-slate-600 text-slate-200">Revenu net imposable</th>
                  <th className="px-4 py-3 text-center border border-slate-600 text-slate-200">Avantage clé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                <tr>
                  <td className="px-4 py-3 text-slate-300 border border-slate-600 font-semibold">Micro-foncier</td>
                  <td className="px-4 py-3 text-center text-slate-300 border border-slate-600">Revenus bruts ≤ 15 000 €</td>
                  <td className="px-4 py-3 text-center text-slate-300 border border-slate-600">Revenus bruts × 70 %</td>
                  <td className="px-4 py-3 text-center text-slate-300 border border-slate-600">Simplicité</td>
                </tr>
                <tr className="bg-slate-800/40">
                  <td className="px-4 py-3 text-slate-300 border border-slate-600 font-semibold">Réel</td>
                  <td className="px-4 py-3 text-center text-slate-300 border border-slate-600">Tous cas (obligatoire &gt; 15 000 €)</td>
                  <td className="px-4 py-3 text-center text-slate-300 border border-slate-600">Revenus bruts − charges réelles</td>
                  <td className="px-4 py-3 text-center text-slate-300 border border-slate-600">Déduction des charges, déficit foncier</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-amber-950/40 border-l-4 border-amber-500 rounded-xl p-4">
            <p className="text-sm text-amber-200">
              <strong>⚠️ Information générale :</strong> Le choix du régime fiscal dépend de votre situation personnelle et de l'ensemble de vos revenus. Ces informations ne valent pas conseil fiscal personnalisé.
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════
            SECTION 2 — TMI & Prélèvements sociaux
        ══════════════════════════════════════ */}
        <section id="tmi-prelevements" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Shield className="w-7 h-7 text-blue-400 flex-shrink-0" />
            2. Impôt sur le revenu, TMI et prélèvements sociaux
          </h2>

          <h3 className="text-xl font-semibold text-slate-100 mb-3">La tranche marginale d'imposition (TMI)</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            Les revenus fonciers de SCPI s'ajoutent à vos autres revenus imposables et sont soumis au barème progressif de l'impôt sur le revenu selon votre <strong className="text-white">tranche marginale d'imposition (TMI)</strong>. En France, les tranches du barème applicable aux revenus 2024 sont : 0 %, 11 %, 30 %, 41 %, 45 %. Plus votre TMI est élevée, plus l'effort fiscal sur vos revenus SCPI est important, et plus l'écart entre le taux de distribution brut et le rendement net après impôt est significatif.
          </p>

          <h3 className="text-xl font-semibold text-slate-100 mb-3">Les prélèvements sociaux à 17,2 %</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            En sus de l'impôt sur le revenu, les revenus fonciers de SCPI sont soumis aux <strong className="text-white">prélèvements sociaux au taux global de 17,2 %</strong> (taux en vigueur, susceptible d'évoluer). Ils se décomposent ainsi : CSG (9,2 %) dont 6,8 % déductibles l'année suivante en régime réel, CRDS (0,5 %) et prélèvement de solidarité (7,5 %).
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-800/80">
                  <th className="px-4 py-3 text-left border border-slate-600 text-slate-200">TMI</th>
                  <th className="px-4 py-3 text-center border border-slate-600 text-slate-200">Impôt sur le revenu</th>
                  <th className="px-4 py-3 text-center border border-slate-600 text-slate-200">Prélèvements sociaux</th>
                  <th className="px-4 py-3 text-center border border-slate-600 text-slate-200">Taux global indicatif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                <tr>
                  <td className="px-4 py-3 text-slate-300 border border-slate-600">11 %</td>
                  <td className="px-4 py-3 text-center text-slate-300 border border-slate-600">11 %</td>
                  <td className="px-4 py-3 text-center text-slate-300 border border-slate-600">17,2 %</td>
                  <td className="px-4 py-3 text-center font-semibold text-orange-300 border border-slate-600">≈ 28,2 %</td>
                </tr>
                <tr className="bg-slate-800/40">
                  <td className="px-4 py-3 text-slate-300 border border-slate-600">30 %</td>
                  <td className="px-4 py-3 text-center text-slate-300 border border-slate-600">30 %</td>
                  <td className="px-4 py-3 text-center text-slate-300 border border-slate-600">17,2 %</td>
                  <td className="px-4 py-3 text-center font-semibold text-orange-400 border border-slate-600">≈ 47,2 %</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-slate-300 border border-slate-600">41 %</td>
                  <td className="px-4 py-3 text-center text-slate-300 border border-slate-600">41 %</td>
                  <td className="px-4 py-3 text-center text-slate-300 border border-slate-600">17,2 %</td>
                  <td className="px-4 py-3 text-center font-semibold text-red-400 border border-slate-600">≈ 58,2 %</td>
                </tr>
                <tr className="bg-slate-800/40">
                  <td className="px-4 py-3 text-slate-300 border border-slate-600">45 %</td>
                  <td className="px-4 py-3 text-center text-slate-300 border border-slate-600">45 %</td>
                  <td className="px-4 py-3 text-center text-slate-300 border border-slate-600">17,2 %</td>
                  <td className="px-4 py-3 text-center font-semibold text-red-500 border border-slate-600">≈ 62,2 %</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-amber-950/40 border-l-4 border-amber-500 rounded-xl p-4 mb-8">
            <p className="text-sm text-amber-200">
              <strong>⚠️ Ces chiffres sont indicatifs</strong> et ne tiennent pas compte de la déductibilité partielle de la CSG ni des charges déductibles au régime réel. Le taux effectif réel dépend de votre situation personnelle. La législation fiscale est susceptible d'évoluer.
            </p>
          </div>

          {/* CTA intermédiaire 1 */}
          <div className="rounded-xl border border-blue-700/50 border-l-4 border-l-blue-500 bg-blue-950/40 p-5 md:p-6">
            <p className="text-slate-200 font-semibold mb-4">
              Votre rendement net dépend directement de votre TMI. Une analyse personnalisée nécessite la connaissance de votre situation patrimoniale complète.
            </p>
            <button type="button" onClick={handleRdvClick} className={`${btnPrimaryClass} w-full sm:w-auto`}>
              Analyser ma fiscalité SCPI
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </section>

        {/* ══════════════════════════════════════
            SECTION 3 — SCPI européennes
        ══════════════════════════════════════ */}
        <section id="scpi-europeennes" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Globe className="w-7 h-7 text-blue-400 flex-shrink-0" />
            3. SCPI européennes et revenus de source étrangère
          </h2>

          <h3 className="text-xl font-semibold text-slate-100 mb-3">Conventions fiscales bilatérales</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            De nombreuses SCPI investissent en dehors de France : Allemagne, Pays-Bas, Espagne, Irlande, Pologne… Ces SCPI bénéficient souvent des <strong className="text-white">conventions fiscales bilatérales</strong> conclues entre la France et les pays où les immeubles sont situés. En règle générale, les revenus immobiliers de source européenne sont <strong className="text-white">exonérés d'impôt sur le revenu en France</strong> mais pris en compte pour le calcul du taux effectif d'imposition applicable aux autres revenus français du contribuable (méthode du taux effectif), ou font l'objet d'un crédit d'impôt.
          </p>

          <div className="bg-slate-800/60 border border-slate-600/50 border-l-4 border-l-green-500 rounded-xl p-5 mb-6">
            <h4 className="font-semibold text-green-300 mb-2">Exemple illustratif — non garanti</h4>
            <p className="text-sm text-slate-300">
              Une SCPI détenant des immeubles en Allemagne distribue des revenus de source allemande. Ces revenus sont imposés en Allemagne selon les règles locales et sont généralement exonérés d'IR en France via la convention franco-allemande. Toutefois, les prélèvements sociaux (17,2 %) peuvent s'appliquer selon la situation du contribuable. <strong className="text-slate-200">Vérifiez impérativement la notice fiscale de chaque SCPI.</strong>
            </p>
          </div>

          <h3 className="text-xl font-semibold text-slate-100 mb-3">Déclaration des revenus de source étrangère</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            Les associés de SCPI percevant des revenus de source étrangère doivent les déclarer sur leur déclaration française via les formulaires <strong className="text-white">2047</strong> (revenus encaissés à l'étranger) et <strong className="text-white">2044</strong> selon les cas. Chaque SCPI communique annuellement à ses associés un <strong className="text-white">récapitulatif fiscal</strong> précisant la nature, la source géographique et le montant des revenus distribués, à conserver pour la déclaration.
          </p>

          <div className="bg-amber-950/40 border-l-4 border-amber-500 rounded-xl p-4">
            <p className="text-sm text-amber-200">
              <strong>⚠️ Information générale :</strong> La fiscalité internationale des SCPI est complexe et varie selon chaque convention bilatérale et la situation personnelle de l'investisseur. Un expert-comptable ou conseiller fiscal habilité peut vous accompagner dans vos déclarations.
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════
            SECTION 4 — Optimisation fiscale
        ══════════════════════════════════════ */}
        <section id="optimisation" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-blue-400 flex-shrink-0" />
            4. Optimiser sa fiscalité : assurance-vie, PER, démembrement, SCI à l'IS
          </h2>

          <div className="bg-amber-950/40 border-l-4 border-amber-500 rounded-xl p-4 mb-8">
            <p className="text-sm text-amber-200">
              <strong>Rappel CIF :</strong> Les dispositifs présentés ci-dessous sont fournis à titre pédagogique. L'optimisation fiscale dépend de votre situation personnelle (revenus, TMI, patrimoine, horizon de placement). Ces informations ne constituent pas une garantie de réduction d'impôt ni un conseil personnalisé. Consultez un professionnel habilité avant toute décision d'investissement.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-slate-100 mb-3">Investir en SCPI via l'assurance-vie</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            En logeant des parts de SCPI dans un contrat d'assurance-vie (en unités de compte), les revenus ne sont pas soumis à l'IR chaque année mais <strong className="text-white">capitalisent au sein du contrat</strong>. La fiscalité s'applique uniquement lors des rachats, avec des abattements annuels après 8 ans (4 600 € pour une personne seule, 9 200 € pour un couple) et un PFU de 7,5 % au-delà pour les contrats de plus de 8 ans. Certaines SCPI investissant en Europe peuvent en outre bénéficier d'une neutralisation fiscale supplémentaire selon les contrats.
          </p>
          <p className="text-sm text-slate-400 mb-6">
            Toutes les SCPI ne sont pas disponibles en assurance-vie. Les frais du contrat (unités de compte, gestion) impactent le rendement net.{' '}
            <a href="/articles/scpi-en-direct-ou-assurance-vie/" className="text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1">
              Comparer SCPI en direct vs assurance-vie <ArrowRight className="w-3 h-3" />
            </a>
          </p>

          <h3 className="text-xl font-semibold text-slate-100 mb-3">Investir en SCPI via le Plan d'Épargne Retraite (PER)</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            Certaines SCPI sont accessibles au sein d'un PER individuel en unités de compte. Les versements volontaires sont <strong className="text-white">déductibles du revenu imposable</strong> dans la limite des plafonds légaux (10 % des revenus professionnels nets, plafonné selon les règles en vigueur). La fiscalité s'applique à la sortie (rente ou capital), ce qui peut être avantageux si la TMI à la retraite est inférieure à la TMI actuelle.
          </p>
          <p className="text-sm text-slate-400 mb-6">
            <a href="/articles/per-scpi-retraite-deduction-fiscale/" className="text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1">
              En savoir plus sur le PER et les SCPI <ArrowRight className="w-3 h-3" />
            </a>
          </p>

          <h3 className="text-xl font-semibold text-slate-100 mb-3">Le démembrement de propriété</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            L'acquisition en <strong className="text-white">nue-propriété</strong> permet d'acheter des parts de SCPI avec une décote (généralement 15 % à 40 % selon la durée du démembrement, sans garantie de résultat). Pendant la période de démembrement, le nu-propriétaire ne perçoit pas de revenus fonciers et n'a donc <strong className="text-white">aucun revenu imposable à déclarer</strong> à ce titre. À l'extinction du démembrement, il récupère la pleine propriété. Cette stratégie peut convenir aux investisseurs fortement imposés qui cherchent à différer les revenus.
          </p>
          <p className="text-sm text-slate-400 mb-6">
            <a href="/articles/demembrement-scpi-nue-propriete-usufruit/" className="text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1">
              Comprendre le démembrement SCPI <ArrowRight className="w-3 h-3" />
            </a>
          </p>

          <h3 className="text-xl font-semibold text-slate-100 mb-3">La SCI à l'impôt sur les sociétés (IS)</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            Une SCI soumise à l'IS peut acquérir des parts de SCPI. Les revenus sont alors imposés au <strong className="text-white">taux de l'impôt sur les sociétés</strong> (15 % jusqu'à 42 500 € de bénéfices, puis 25 % au-delà), plutôt qu'au barème progressif de l'IR. Cette option peut réduire la pression fiscale annuelle pour les contribuables fortement imposés, mais implique une imposition supplémentaire à la sortie (distribution de dividendes ou cession de parts de SCI).
          </p>
          <p className="text-sm text-slate-400 mb-8">
            <a href="/articles/sci-scpi-societe-civile-immobiliere-parts/" className="text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1">
              SCI et SCPI : fonctionnement détaillé <ArrowRight className="w-3 h-3" />
            </a>
          </p>

          {/* CTA intermédiaire 2 */}
          <div className="rounded-xl border border-slate-600/50 bg-slate-800/60 p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-slate-200 font-semibold">
              Comparez les modes de détention SCPI selon votre profil fiscal.
            </p>
            <button type="button" onClick={handleComparateurClick} className={`${btnSecondaryClass} w-full sm:w-auto flex-shrink-0`}>
              Comparer les SCPI
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </section>

        {/* ══════════════════════════════════════
            SECTION 5 — IFI, succession
        ══════════════════════════════════════ */}
        <section id="ifi-succession" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-blue-400 flex-shrink-0" />
            5. IFI, succession et détention patrimoniale
          </h2>

          <h3 className="text-xl font-semibold text-slate-100 mb-3">SCPI et Impôt sur la Fortune Immobilière (IFI)</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            Les parts de SCPI entrent dans l'assiette de l'<strong className="text-white">IFI</strong> à hauteur de la fraction représentant la valeur des actifs immobiliers détenus par la SCPI au 1er janvier de l'année d'imposition. Chaque société de gestion communique annuellement aux associés la <strong className="text-white">quote-part IFI par part</strong>, à reporter sur l'annexe 2042-IFI. La valeur retenue peut différer du prix d'achat ou de la valeur de retrait.
          </p>

          <div className="bg-slate-800/60 border border-slate-600/50 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-300">
              Les parts de SCPI détenues via un contrat d'assurance-vie peuvent, sous certaines conditions, bénéficier d'une <strong className="text-slate-200">exonération partielle de l'IFI</strong> lorsque les SCPI représentent moins de 20 % de l'actif brut des unités de compte du contrat. Les règles exactes évoluent et dépendent de la composition de chaque contrat. Consultez un conseiller patrimonial.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-slate-100 mb-3">Transmission, succession et droits de donation</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            Les parts de SCPI entrent dans l'actif successoral à leur valeur vénale au jour du décès et sont soumises aux <strong className="text-white">droits de succession</strong> selon les règles de droit commun et le lien de parenté. Les abattements légaux s'appliquent (100 000 € entre parents et enfants, renouvelables tous les 15 ans). Une stratégie de <strong className="text-white">donation de la nue-propriété du vivant</strong> peut permettre de transmettre des parts à moindre coût fiscal, l'assiette étant calculée sur la valeur de la seule nue-propriété, décotée selon l'âge du donateur.
          </p>

          <div className="bg-amber-950/40 border-l-4 border-amber-500 rounded-xl p-4">
            <p className="text-sm text-amber-200">
              <strong>⚠️ Information générale :</strong> La transmission patrimoniale est un sujet complexe qui nécessite une analyse personnalisée de votre situation familiale et patrimoniale. Ces informations ne constituent pas un conseil en gestion de patrimoine.
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════
            SECTION 6 — Risques
        ══════════════════════════════════════ */}
        <section id="risques" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-orange-400 flex-shrink-0" />
            6. Risques fiscaux et points de vigilance
          </h2>

          <h3 className="text-xl font-semibold text-slate-100 mb-3">Évolution de la législation fiscale</h3>
          <div className="bg-red-950/40 border-l-4 border-red-500 rounded-xl p-5 mb-6">
            <p className="text-slate-200 mb-3">
              La fiscalité française est susceptible d'évoluer chaque année lors des lois de finances. Les taux de prélèvements sociaux, les plafonds de déduction du déficit foncier, les règles des conventions fiscales internationales et les conditions d'accès aux enveloppes fiscales (PER, assurance-vie) peuvent être modifiés par le législateur. <strong className="text-white">Aucune garantie ne peut être donnée quant au maintien du régime fiscal actuel.</strong>
            </p>
            <p className="text-sm text-red-300 font-medium">
              Ce risque fait partie des risques inhérents à tout investissement immobilier de long terme.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-slate-100 mb-3">Taux de distribution brut ≠ rendement net</h3>
          <p className="text-slate-300 leading-relaxed mb-6">
            Le taux de distribution (TDVM) communiqué par une SCPI est un taux <strong className="text-white">brut de fiscalité</strong>. Selon votre TMI, le rendement net après impôt peut être fortement réduit. À titre strictement illustratif, pour un TDVM brut de 5 % et une TMI de 41 %, le rendement net après impôts et prélèvements sociaux se situerait autour de 2 %. Ce chiffre est indicatif et ne constitue pas une projection de rendement.
          </p>

          <div className="bg-slate-800/60 border border-slate-600/50 rounded-xl p-6">
            <h4 className="font-bold text-slate-100 mb-4">Risques inhérents à tout investissement en SCPI — mentions réglementaires</h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2">
                <span className="text-red-400 font-bold flex-shrink-0">⚠</span>
                <span><strong className="text-slate-200">Perte en capital :</strong> la valeur des parts de SCPI n'est pas garantie et peut évoluer à la baisse selon les conditions du marché immobilier.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-400 font-bold flex-shrink-0">⚠</span>
                <span><strong className="text-slate-200">Revenus non garantis :</strong> les distributions passées ne préjugent pas des distributions futures. Les loyers perçus peuvent baisser selon le taux d'occupation et les conditions locatives.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-400 font-bold flex-shrink-0">⚠</span>
                <span><strong className="text-slate-200">Liquidité limitée :</strong> la revente de parts de SCPI peut prendre plusieurs mois. Les SCPI ne sont pas des produits liquides comparables à des actions cotées.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-400 font-bold flex-shrink-0">⚠</span>
                <span><strong className="text-slate-200">Risque fiscal :</strong> la législation fiscale applicable aux SCPI peut évoluer et modifier significativement le rendement net perçu.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-400 font-bold flex-shrink-0">⚠</span>
                <span><strong className="text-slate-200">Risque de marché immobilier :</strong> les actifs détenus par la SCPI sont exposés aux cycles du marché immobilier, aux variations de taux d'intérêt et aux évolutions réglementaires (normes énergétiques, urbanisme).</span>
              </li>
            </ul>
          </div>
        </section>

        {/* ══════════════════════════════════════
            ARTICLES CONNEXES
        ══════════════════════════════════════ */}
        <section id="articles" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-400" />
            Articles connexes — maillage interne
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {relatedArticles.map((article, index) => (
              <a
                key={index}
                href={article.url}
                className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/60 hover:border-blue-700/50 transition-colors group"
              >
                <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white mb-2 transition-colors">
                  {article.title}
                </h3>
                <span className="text-xs text-blue-400 inline-flex items-center gap-1">
                  Lire l'article <ArrowRight className="w-3 h-3" />
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════
            CTA FINAL
        ══════════════════════════════════════ */}
        <div className="rounded-2xl border border-blue-700/50 border-l-4 border-l-blue-500 bg-blue-950/40 p-6 md:p-8 mb-8">
          <p className="text-white font-bold text-lg mb-2">
            Analysez la fiscalité de votre portefeuille SCPI
          </p>
          <p className="text-sm text-slate-300 mb-5">
            Toute analyse fiscale personnalisée nécessite la connaissance de votre situation patrimoniale complète (revenus, charges, TMI, objectifs, horizon). MaximusSCPI est Conseiller en Investissements Financiers (CIF), enregistré à l'ORIAS.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button type="button" onClick={handleRdvClick} className={`${btnPrimaryClass} w-full sm:w-auto`}>
              Analyser ma fiscalité SCPI
              <ArrowRight className="w-4 h-4" aria-hidden />
            </button>
            <button type="button" onClick={handleComparateurClick} className={`${btnSecondaryClass} w-full sm:w-auto`}>
              Comparer les SCPI
              <ArrowRight className="w-4 h-4" aria-hidden />
            </button>
          </div>
        </div>

        {/* ── Mentions légales ── */}
        <div className="border-t border-slate-700 pt-6">
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong className="text-slate-400">Mentions légales et avertissements :</strong> Les informations présentées sur cette page sont de nature pédagogique et générale. Elles ne constituent pas un conseil en investissement ni un conseil fiscal personnalisé au sens de la réglementation CIF/AMF. Les taux et seuils fiscaux correspondent à la législation française en vigueur à la date de mise à jour de cette page et sont susceptibles d'évoluer. L'investissement en SCPI présente des risques de perte en capital, des revenus non garantis et une liquidité limitée. Les performances passées ne préjugent pas des performances futures. MaximusSCPI est enregistré à l'ORIAS en qualité de Conseiller en Investissements Financiers. Données issues des documents réglementaires des sociétés de gestion (DIC, bulletins trimestriels, rapports annuels, ASPIM).
          </p>
        </div>

      </div>
    </div>
  );
};

export default FiscaliteScpiPage;
