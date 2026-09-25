import React, { lazy, Suspense, useEffect, useState } from 'react';
import Header from './components/Header';
import SEOHead from './components/SEOHead';
import Footer from './components/Footer';
import { CookieConsent } from './components/CookieConsent';

const FintechComparator = lazy(() => import('./components/fintech/FintechComparator'));
const RdvModal = lazy(() => import('./components/RdvModal'));

const go = (path: string) => {
  window.location.href = path;
};

const ComparatorApp: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });
  const [isRdvModalOpen, setIsRdvModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-slate-900">
      <SEOHead
        title="Comparateur SCPI 2026 : rendement, TOF, frais et risques"
        description="Comparez les SCPI selon taux de distribution, TOF, frais, capitalisation, décote, endettement, secteurs, géographie et liquidité observée."
        keywords={['comparateur SCPI', 'comparatif SCPI', 'comparer SCPI', 'rendement SCPI', 'TOF SCPI', 'frais SCPI', 'liquidité SCPI']}
        canonical="https://maximusscpi.com/comparateur-scpi/"
        schemaData={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebApplication',
              name: 'Comparateur SCPI MaximusSCPI',
              url: 'https://maximusscpi.com/comparateur-scpi/',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web',
              description: 'Outil de comparaison multicritères de SCPI : taux de distribution, TOF, frais, capitalisation, décote ou surcote, endettement, secteurs, géographie et indicateurs de liquidité.'
            },
            {
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'Comment comparer deux SCPI ?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Il faut comparer plusieurs critères ensemble : taux de distribution, prix de part, valeur de reconstitution, TOF, endettement, frais, capitalisation, répartition sectorielle et géographique, qualité locative et liquidité du marché des parts.'
                  }
                },
                {
                  '@type': 'Question',
                  name: 'Le rendement suffit-il pour choisir une SCPI ?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Non. Le taux de distribution est un indicateur historique qui ne garantit pas les distributions futures. Il doit être lu avec la qualité du patrimoine, le TOF, les baux, l’endettement, les frais, la valorisation et la liquidité.'
                  }
                },
                {
                  '@type': 'Question',
                  name: 'Que signifie une décote ou une surcote de SCPI ?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'La décote ou surcote compare le prix de souscription à la valeur de reconstitution par part. Elle constitue un indicateur de valorisation, mais ne permet pas à elle seule de conclure qu’une SCPI est attractive ou chère.'
                  }
                }
              ]
            }
          ]
        }}
      />

      <Header
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode(v => !v)}
        onContactClick={() => setIsRdvModalOpen(true)}
        onAboutClick={() => go('/qui-sommes-nous/')}
        onLogoClick={() => go('/')}
        onScpiPageClick={(slug) => go(`/${slug}/`)}
        onFaqClick={() => go('/faq/')}
        onUnderstandingClick={() => go('/comprendre-les-scpi/')}
        onAboutSectionClick={() => go('/qui-sommes-nous/')}
        onAboutNavigation={(path) => go(path.startsWith('/') ? path : `/${path}`)}
        onComparateurClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onSimulateurClick={() => go('/simulateurs/')}
        onArticlesClick={() => go('/articles/')}
        onActualitesClick={() => go('/actualites/')}
        onProClick={() => go('/professionnels')}
        currentView="comparateur"
      />

      <main>
        <div id="comparator" data-comparator className="pt-6 sm:pt-8 pb-16 sm:pb-20">
          <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-5">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Comparateur SCPI 2026
              </h1>
              <p className="mt-1 text-sm text-slate-400 max-w-3xl">
                Comparez les SCPI selon leurs indicateurs clés : rendement, frais, TOF, capitalisation, secteurs et zones géographiques.
              </p>
            </div>

            <Suspense fallback={
              <div className="min-h-[520px] rounded-2xl border border-slate-800 bg-slate-950/40 flex items-center justify-center text-slate-400">
                Chargement du comparateur…
              </div>
            }>
              <FintechComparator
                onCloseAnalysis={() => go('/')}
                onGuidedJourneyClick={() => go('/parcours-guide')}
                hideTitle={true}
                zScoreVariant="compact"
              />
            </Suspense>

            <section className="max-w-5xl mx-auto mt-16 sm:mt-20 border-t border-slate-800 pt-10 text-slate-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-3">Comment utiliser le comparateur SCPI ?</h2>
                <p className="leading-relaxed text-slate-400">
                  Le comparateur MaximusSCPI permet de confronter plusieurs SCPI sur des critères homogènes. Le taux de distribution est utile pour mesurer la distribution passée, mais il ne suffit pas pour évaluer une SCPI. Une comparaison robuste doit aussi intégrer la valorisation des parts, l’occupation locative, l’endettement, les frais, la diversification et la liquidité du marché des parts.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-5 mb-10">
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                  <h3 className="font-semibold text-white mb-2">Rendement et distribution</h3>
                  <p className="text-sm leading-relaxed text-slate-400">Le taux de distribution est un indicateur historique. Une distribution élevée peut refléter une bonne exploitation, mais aussi un patrimoine jeune, une stratégie plus risquée ou des éléments non récurrents. Les performances passées ne garantissent pas les distributions futures.</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                  <h3 className="font-semibold text-white mb-2">Prix de part et valeur de reconstitution</h3>
                  <p className="text-sm leading-relaxed text-slate-400">Comparer le prix de souscription à la valeur de reconstitution permet d’identifier une décote ou une surcote. Cet indicateur doit être combiné à la qualité des actifs, aux expertises immobilières et aux perspectives de marché.</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                  <h3 className="font-semibold text-white mb-2">TOF, WALT et WALB</h3>
                  <p className="text-sm leading-relaxed text-slate-400">Le TOF renseigne sur l’occupation financière du patrimoine. WALT et WALB apportent une lecture complémentaire sur la durée résiduelle des baux et les prochaines possibilités de rupture. Aucun de ces indicateurs ne mesure directement la liquidité des parts.</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                  <h3 className="font-semibold text-white mb-2">Liquidité du marché des parts</h3>
                  <p className="text-sm leading-relaxed text-slate-400">La liquidité d’une SCPI n’est pas garantie. MaximusSCPI distingue désormais l’occupation locative de la liquidité et s’appuie notamment sur la présence de parts en attente de retrait lorsque cette donnée est disponible.</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                  <h3 className="font-semibold text-white mb-2">Endettement et capitalisation</h3>
                  <p className="text-sm leading-relaxed text-slate-400">L’endettement peut amplifier la performance comme le risque. La capitalisation donne une indication de taille, mais une grande SCPI n’est pas automatiquement plus solide qu’une petite : concentration, dette, collecte et qualité des actifs restent déterminants.</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                  <h3 className="font-semibold text-white mb-2">Secteurs et géographie</h3>
                  <p className="text-sm leading-relaxed text-slate-400">Bureaux, commerces, logistique, santé, hôtellerie et résidentiel réagissent différemment aux cycles économiques. La diversification géographique peut aussi modifier la fiscalité, le risque locatif et l’exposition aux devises.</p>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-5 mb-10">
                <h2 className="text-xl font-bold text-white mb-2">Méthodologie et sources des données</h2>
                <p className="text-sm leading-relaxed text-slate-400">
                  Les données sont consolidées à partir des documents publics des sociétés de gestion : bulletins trimestriels, rapports annuels, DIC, notes d’information et communications officielles. La période de référence est affichée sur les cartes lorsqu’elle est disponible. La note MaximusSCPI est un indicateur propriétaire multicritères et ne constitue ni une notation réglementaire, ni une prévision de performance.
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <a href="/methodologie-donnees/" className="text-emerald-400 hover:text-emerald-300">Voir la méthodologie des données →</a>
                  <a href="/articles/revendre-parts-scpi-delais-marche-secondaire/" className="text-emerald-400 hover:text-emerald-300">Comprendre la revente des parts →</a>
                  <a href="/risques-scpi/" className="text-emerald-400 hover:text-emerald-300">Voir les principaux risques →</a>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Questions fréquentes sur la comparaison des SCPI</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white">Quelle est la meilleure SCPI ?</h3>
                    <p className="text-sm text-slate-400 mt-1">Il n’existe pas de meilleure SCPI universelle. Le choix dépend de l’horizon, de la fiscalité, du besoin de revenus, du niveau de risque accepté, de la diversification recherchée et du reste du patrimoine.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Faut-il choisir la SCPI qui affiche le rendement le plus élevé ?</h3>
                    <p className="text-sm text-slate-400 mt-1">Non. Un rendement élevé doit être confronté à la qualité du patrimoine, au TOF, à l’endettement, aux frais, à la valorisation et à la liquidité. Le comparateur trie initialement les SCPI par taux de distribution pour faciliter la lecture, pas pour établir un classement de qualité.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Comment analyser une SCPI avant d’investir ?</h3>
                    <p className="text-sm text-slate-400 mt-1">Commencez par la distribution, la valeur de reconstitution, le TOF, la dette et les frais, puis examinez les baux, les locataires, la diversification, la collecte et le marché des parts. La décision finale doit rester cohérente avec votre situation personnelle.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />

      <Suspense fallback={null}>
        {isRdvModalOpen && (
          <RdvModal
            isOpen={isRdvModalOpen}
            onClose={() => setIsRdvModalOpen(false)}
          />
        )}
      </Suspense>
      <CookieConsent />
    </div>
  );
};

export default ComparatorApp;
