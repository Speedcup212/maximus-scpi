// MaximusSCPI — TeaserComparateur — refonte homepage

const CARTES = [
  {
    titre: 'SCPI européennes',
    badge: 'Fiscalité',
    indicateurs: [
      'Revenus étrangers',
      'Diversification zone euro',
      'À comparer net de fiscalité',
    ],
  },
  {
    titre: 'SCPI diversifiées',
    badge: 'Allocation',
    indicateurs: [
      'Bureaux • commerces • santé',
      'Mutualisation sectorielle',
      'Analyse rendement / risque',
    ],
  },
  {
    titre: 'SCPI spécialisées',
    badge: 'Thématique',
    indicateurs: [
      'Santé • logistique • résidentiel',
      'Cycle immobilier spécifique',
      'À croiser avec horizon',
    ],
  },
]

export default function TeaserComparateur() {
  return (
    <section className="relative py-14 sm:py-16" style={{ backgroundColor: '#0D1117' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Trois grandes familles de SCPI à comparer
          </h2>
          <p className="mt-3 text-slate-400">
            Rendements, frais, zones géographiques, labels ISR, taux
            d'occupation — une analyse multicritère pour comparer plus vite.
          </p>
        </div>

        {/* 3 cartes génériques, aspect dashboard fintech */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {CARTES.map((carte) => (
            <div
              key={carte.titre}
              aria-hidden="true"
              className="rounded-2xl border border-emerald-400/15 p-5 shadow-2xl shadow-emerald-500/5 select-none transition-all duration-200 hover:border-emerald-400/40"
              style={{
                background:
                  'linear-gradient(160deg, rgba(15,23,42,0.9) 0%, rgba(13,17,23,0.95) 100%)',
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{carte.titre}</h3>
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ color: '#00C896', backgroundColor: 'rgba(0,200,150,0.12)' }}
                >
                  {carte.badge}
                </span>
              </div>

              <div className="mt-4 h-px w-full bg-slate-700/50" />

              <ul className="mt-4 space-y-2.5">
                {carte.indicateurs.map((ind) => (
                  <li
                    key={ind}
                    className="flex items-center gap-2.5 text-sm text-slate-300"
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: '#00C896' }}
                    />
                    {ind}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA unique outline */}
        <div className="mt-10 text-center">
          <a
            href="/comparateur-scpi"
            className="inline-flex items-center justify-center px-6 py-4 rounded-xl font-semibold border-2 transition-all duration-200 hover:bg-[#00C896] hover:text-[#0D1117]"
            style={{ borderColor: '#00C896', color: '#00C896' }}
          >
            Accéder au comparateur complet →
          </a>
          <p className="mt-4 text-xs text-slate-500">
            Outil pédagogique — ne constitue pas une recommandation
            personnalisée au sens de la réglementation MIF2.
          </p>
        </div>
      </div>
    </section>
  )
}
