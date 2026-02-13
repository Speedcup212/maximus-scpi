import React from 'react';

const SimulateursHub: React.FC = () => {
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const header = document.querySelector('header');
      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      const offset = headerHeight + 16;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400">Nos simulateurs</p>
          <h1 className="text-3xl md:text-4xl font-semibold">Structurer votre décision SCPI</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Avant d’investir, comprenez votre profil et votre cadre fiscal.
          </p>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-300">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
            <div className="text-xs uppercase tracking-wide text-emerald-300">Niveau 1 — Comprendre</div>
            <p className="mt-2">Pédagogie et prise de conscience.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
            <div className="text-xs uppercase tracking-wide text-blue-300">Niveau 2 — Structurer</div>
            <p className="mt-2">Construire une stratégie adaptée.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
            <div className="text-xs uppercase tracking-wide text-purple-300">Niveau 3 — Arbitrer</div>
            <p className="mt-2">Comparer et optimiser les choix.</p>
          </div>
        </div>

        <section id="comprendre" className="mt-10 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wide text-emerald-300">Niveau 1 — Comprendre</span>
            <span className="text-xs text-gray-400">Avant d’investir</span>
          </div>
          <h2 className="text-xl font-semibold">Comprendre votre profil et votre cadre fiscal</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Ces outils sont des prérequis décisionnels pour clarifier votre situation.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5">
              <h3 className="text-sm font-semibold">Profil investisseur</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Évaluez votre profil AMF et votre tolérance au risque.
              </p>
              <button
                type="button"
                onClick={() => navigateTo('/simulateur-profil-investisseur')}
                className="inline-flex mt-4 text-sm text-emerald-300 hover:text-emerald-200"
              >
                Lancer le simulateur →
              </button>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5">
              <h3 className="text-sm font-semibold">Impact fiscal SCPI</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Direct IR vs SCI IR vs IS.
              </p>
              <button
                type="button"
                onClick={() => navigateTo('/simulateur-impact-fiscal-scpi')}
                className="inline-flex mt-4 text-sm text-emerald-300 hover:text-emerald-200"
              >
                Lancer le simulateur →
              </button>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5">
              <h3 className="text-sm font-semibold">Fonds euros vs SCPI</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Comparatif de réallocation.
              </p>
              <button
                type="button"
                onClick={() => navigateTo('/simulateur-fonds-euros-scpi')}
                className="inline-flex mt-4 text-sm text-emerald-300 hover:text-emerald-200"
              >
                Lancer le simulateur →
              </button>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => scrollToSection('structurer')}
              className="text-sm text-emerald-300 hover:text-emerald-200"
            >
              Passer à “Structurer votre stratégie” →
            </button>
          </div>
        </section>

        <section id="structurer" className="mt-12 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wide text-blue-300">Niveau 2 — Structurer</span>
            <span className="text-xs text-gray-400">Leviers patrimoniaux</span>
          </div>
          <h2 className="text-xl font-semibold">Structurer votre stratégie d’investissement</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Choisissez le levier adapté à votre situation patrimoniale.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5">
              <h3 className="text-sm font-semibold">SCPI à crédit</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Effet de levier et cash-flow.
              </p>
              <button
                type="button"
                onClick={() => navigateTo('/simulateur-credit-scpi')}
                className="inline-flex mt-4 text-sm text-blue-300 hover:text-blue-200"
              >
                Lancer →
              </button>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5">
              <h3 className="text-sm font-semibold">Démembrement SCPI</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Nue-propriété vs usufruit.
              </p>
              <button
                type="button"
                onClick={() => navigateTo('/simulateur-demembrement-scpi')}
                className="inline-flex mt-4 text-sm text-blue-300 hover:text-blue-200"
              >
                Lancer →
              </button>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5">
              <h3 className="text-sm font-semibold">Trésorerie IS – SCPI</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Projection cash net IS.
              </p>
              <button
                type="button"
                onClick={() => navigateTo('/simulateur-tresorerie-is')}
                className="inline-flex mt-4 text-sm text-blue-300 hover:text-blue-200"
              >
                Lancer →
              </button>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5">
              <h3 className="text-sm font-semibold">Revenus nets SCPI (IR)</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Estimez vos revenus réels
              </p>
              <button
                type="button"
                onClick={() => navigateTo('/simulateur-revenus-nets-scpi')}
                className="inline-flex mt-4 text-sm text-blue-300 hover:text-blue-200"
              >
                Lancer →
              </button>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => scrollToSection('arbitrer')}
              className="text-sm text-blue-300 hover:text-blue-200"
            >
              Passer à “Arbitrer et optimiser” →
            </button>
          </div>
        </section>

        <section id="arbitrer" className="mt-12 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wide text-purple-300">Niveau 3 — Arbitrer</span>
            <span className="text-xs text-gray-400">Outils d’expert</span>
          </div>
          <h2 className="text-xl font-semibold">Arbitrer et optimiser vos choix</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Outils d’arbitrage avancé pour comparer et optimiser.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5">
              <h3 className="text-sm font-semibold">Comparateur d’enveloppes</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Direct, assurance-vie ou SCI IS.
              </p>
              <button
                type="button"
                onClick={() => navigateTo('/simulateur-enveloppes-scpi')}
                className="inline-flex mt-4 text-sm text-purple-300 hover:text-purple-200"
              >
                Lancer →
              </button>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5">
              <h3 className="text-sm font-semibold">Comparateur démembrement</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                PP vs Nue-propriété vs Usufruit.
              </p>
              <button
                type="button"
                onClick={() => navigateTo('/comparateur-demembrement-scpi')}
                className="inline-flex mt-4 text-sm text-purple-300 hover:text-purple-200"
              >
                Lancer →
              </button>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
};

export default SimulateursHub;
