// MaximusSCPI — PreuveSociale — refonte homepage

import { Database, Scale, Users } from 'lucide-react'

const CARTES = [
  {
    Icon: Database,
    titre: 'Données structurées',
    texte:
      'Rendements, frais, TOF, zones géographiques et indicateurs clés regroupés pour comparer plus vite.',
  },
  {
    Icon: Scale,
    titre: 'Lecture fiscale',
    texte:
      'Une première grille de lecture selon TMI, horizon et objectif patrimonial.',
  },
  {
    Icon: Users,
    titre: 'Accompagnement humain',
    texte:
      'Le simulateur ne remplace pas un conseil personnalisé : il prépare un échange utile.',
  },
]

export default function PreuveSociale() {
  return (
    <section className="relative py-14 sm:py-16" style={{ backgroundColor: '#0D1117' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CARTES.map(({ Icon, titre, texte }) => (
            <div
              key={titre}
              className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-6 shadow-2xl shadow-emerald-500/5 backdrop-blur-sm transition-all duration-200 hover:border-emerald-400/40"
            >
              <div
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/20"
                style={{ backgroundColor: 'rgba(0,200,150,0.10)' }}
              >
                <Icon className="h-5 w-5" style={{ color: '#00C896' }} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{titre}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {texte}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Outil pédagogique — ne constitue pas une recommandation personnalisée
          au sens de la réglementation MIF2.
        </p>
      </div>
    </section>
  )
}
