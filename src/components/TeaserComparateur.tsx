// MaximusSCPI — TeaserComparateur — refonte homepage

const CARTES = [
  // TODO: remplacer par de vraies SCPI représentatives
  {
    nom: 'SCPI Européenne A',
    gestionnaire: 'Gestionnaire 1',
    taux: '7.2%',
    note: '91/100',
    badge: 'Bureaux',
  },
  {
    nom: 'SCPI Diversifiée B',
    gestionnaire: 'Gestionnaire 2',
    taux: '6.8%',
    note: '88/100',
    badge: 'Diversifié',
  },
  {
    nom: 'SCPI Résidentielle C',
    gestionnaire: 'Gestionnaire 3',
    taux: '5.9%',
    note: '85/100',
    badge: 'Résidentiel',
  },
]

export default function TeaserComparateur() {
  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: '#0D1117' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Déjà 63 SCPI analysées et comparables en un clic
          </h2>
          <p className="mt-3 text-slate-300">
            Rendements, frais, zones géographiques, labels ISR, taux
            d'occupation — tout en un endroit.
          </p>
        </div>

        {/* 3 cartes illustratives, non cliquables, avec fondu sur les bords */}
        <div className="relative mt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CARTES.map((carte) => (
              <div
                key={carte.nom}
                aria-hidden="true"
                className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-5 select-none"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-slate-200 bg-slate-700/70">
                    {carte.badge}
                  </span>
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-md"
                    style={{ color: '#00C896', backgroundColor: 'rgba(0,200,150,0.12)' }}
                  >
                    {carte.note}
                  </span>
                </div>
                <div className="text-lg font-bold text-white">{carte.nom}</div>
                <div className="text-sm text-gray-400">{carte.gestionnaire}</div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: '#00C896' }}
                  >
                    {carte.taux}
                  </span>
                  <span className="text-xs text-gray-400">
                    taux de distribution
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Dégradé suggérant qu'il y en a plus */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
            style={{
              background:
                'linear-gradient(to bottom, rgba(13,17,23,0) 0%, #0D1117 100%)',
            }}
          />
        </div>

        {/* CTA unique outline */}
        <div className="mt-10 text-center">
          <a
            href="/comparateur-scpi"
            className="inline-flex items-center justify-center px-6 py-4 rounded-xl font-semibold border-2 transition-all duration-300 ease-in-out hover:bg-[#00C896] hover:text-[#0D1117]"
            style={{ borderColor: '#00C896', color: '#00C896' }}
          >
            Accéder au comparateur complet (63 SCPI) →
          </a>
          <p className="mt-4 text-xs text-gray-400">
            Outil informatif — non recommandation personnalisée au sens MIF2
          </p>
        </div>
      </div>
    </section>
  )
}
