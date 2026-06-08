// MaximusSCPI — PreuveSociale — refonte homepage

const METRIQUES = [
  // TODO: remplacer par les vraies valeurs
  { chiffre: '247', label: 'investisseurs accompagnés' },
  { chiffre: '12 M€', label: 'de SCPI analysées' },
  { chiffre: '4.9/5', label: 'sur Google (38 avis)' },
]

const VERBATIMS = [
  // TODO: remplacer par de vrais verbatims clients
  {
    citation:
      "J'ai enfin compris pourquoi certaines SCPI étaient à éviter selon ma situation fiscale.",
    auteur: 'Sophie M., Lyon',
  },
  {
    citation:
      'Le RDV a duré 45 minutes, concret et sans pression commerciale.',
    auteur: 'François D., Bordeaux',
  },
]

export default function PreuveSociale() {
  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: '#0D1117' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Métriques */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-8 md:gap-0">
          {METRIQUES.map((m, i) => (
            <div
              key={m.label}
              className={`flex-1 text-center ${
                i > 0 ? 'md:border-l md:border-slate-700' : ''
              }`}
            >
              <div
                className="text-3xl font-bold"
                style={{ color: '#00C896' }}
              >
                {m.chiffre}
              </div>
              <div className="text-sm text-gray-400 mt-1">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Verbatims */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {VERBATIMS.map((v) => (
            <figure
              key={v.auteur}
              className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-6"
            >
              <blockquote className="italic text-slate-200">
                «&nbsp;{v.citation}&nbsp;»
              </blockquote>
              <figcaption className="mt-3 text-sm text-gray-400">
                — {v.auteur}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
