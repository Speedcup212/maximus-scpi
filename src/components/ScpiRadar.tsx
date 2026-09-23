import React from 'react';

type RadarMetric = {
  label: string;
  value: string;
  note?: string;
};

type RadarRow = {
  label: string;
  value: string;
};

export interface ScpiRadarData {
  title: string;
  period: string;
  summary: string;
  metrics: RadarMetric[];
  priceRows: RadarRow[];
  activityRows: RadarRow[];
  reconstitutionHistory: RadarRow[];
  distributionHistory: RadarRow[];
  distributionNote: string;
  favorable: string[];
  vigilance: string[];
  readings: string[];
}

interface ScpiRadarProps {
  data: ScpiRadarData;
}

export const COMETE_RADAR_T2_2026: ScpiRadarData = {
  title: 'Radar Maximus — Comète',
  period: 'Mise à jour T2 2026',
  summary:
    'À ce stade, les données disponibles ne montrent pas de dégradation majeure des fondamentaux de Comète.',
  metrics: [
    { label: 'TOF', value: '99,60 %', note: 'T2 2026' },
    { label: 'Collecte nette', value: '133,11 M€', note: 'T2 2026' },
    { label: 'Investissements', value: '72,60 M€', note: 'T2 2026' },
    { label: 'Capitalisation', value: '≈787 M€', note: 'T2 2026' },
    { label: 'Dividende', value: '5,56 €/part', note: 'T2 2026' },
    { label: 'TD 2025', value: '9,00 %', note: 'Non extrapolable' },
  ],
  priceRows: [
    { label: 'Prix de souscription', value: '250,00 €' },
    { label: 'Valeur de reconstitution', value: '254,73 €' },
    { label: 'Écart prix / reconstitution', value: '-1,86 %' },
    { label: 'Valeur de retrait', value: '225,00 €' },
    { label: 'Valeur de réalisation', value: '217,17 €' },
    { label: 'Objectif de distribution long terme', value: '6,00 %' },
    { label: 'TRI 10 ans', value: '6,50 %' },
  ],
  activityRows: [
    { label: 'TOF', value: '99,60 %' },
    { label: 'Collecte nette T2', value: '133,11 M€' },
    { label: 'Investissements T2', value: '72,60 M€' },
    { label: 'Capitalisation', value: '≈787 M€' },
    { label: 'Dividende T2', value: '5,56 €/part' },
  ],
  reconstitutionHistory: [
    { label: '2023', value: '248,38 €' },
    { label: '2024', value: '258,45 €' },
    { label: '2025', value: '253,83 €' },
    { label: '2026', value: '254,73 €' },
  ],
  distributionHistory: [
    { label: 'T1 2025', value: '6,56 €' },
    { label: 'T2 2025', value: '5,64 €' },
    { label: 'T3 2025', value: '5,37 €' },
    { label: 'T4 2025', value: '4,92 €' },
    { label: 'T1 2026', value: '4,69 €' },
    { label: 'T2 2026', value: '5,56 €' },
  ],
  distributionNote: 'Cumul S1 2026 : 10,25 €/part.',
  favorable: [
    'TOF très élevé à 99,60 %.',
    'Prix de 250 € inférieur à la valeur de reconstitution de 254,73 €.',
    'Patrimoine récent et diversification internationale.',
    'Aucun signal majeur de dégradation opérationnelle à ce stade.',
  ],
  vigilance: [
    'Collecte très rapide : 133,11 M€ nets sur le trimestre.',
    'Le déploiement des capitaux doit rester discipliné, sans baisse des critères d’acquisition.',
    'Surveiller les concentrations géographiques du portefeuille.',
    'Le taux de distribution 2025 de 9 % ne doit pas être extrapolé mécaniquement.',
    'Historique encore court depuis le lancement fin 2023.',
  ],
  readings: [
    'La priorité de surveillance porte sur la capacité à absorber la croissance de la collecte tout en maintenant la qualité des acquisitions, la diversification et une distribution durable.',
    'Après le recul constaté en 2025, la valeur de reconstitution remonte légèrement en 2026. Une période plus longue reste nécessaire pour déterminer une véritable tendance.',
  ],
};

const DataTable: React.FC<{ title: string; rows: RadarRow[]; note?: string }> = ({
  title,
  rows,
  note,
}) => (
  <div className="rounded-xl border border-slate-700/70 bg-slate-900/50 overflow-hidden">
    <div className="px-4 py-3 border-b border-slate-700/70 bg-slate-900/80">
      <h4 className="text-sm font-black text-white">{title}</h4>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-slate-800 last:border-b-0">
              <td className="px-4 py-3 text-slate-300 font-medium">{row.label}</td>
              <td className="px-4 py-3 text-right text-white font-black whitespace-nowrap">
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {note && (
      <div className="px-4 py-3 border-t border-slate-700/70 text-xs font-semibold text-emerald-300">
        {note}
      </div>
    )}
  </div>
);

const ScpiRadar: React.FC<ScpiRadarProps> = ({ data }) => (
  <section
    aria-labelledby="radar-maximus-title"
    className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-5 sm:p-6 shadow-xl"
  >
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5">
      <div>
        <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400 mb-2">
          Analyse propriétaire
        </div>
        <h3 id="radar-maximus-title" className="text-2xl font-black text-white">
          {data.title}
        </h3>
        <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-3xl">{data.summary}</p>
      </div>
      <span className="self-start rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-xs font-black text-emerald-300 whitespace-nowrap">
        {data.period}
      </span>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
      {data.metrics.map((metric) => (
        <div key={metric.label} className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <div className="text-xs font-bold text-slate-400">{metric.label}</div>
          <div className="mt-1 text-xl font-black text-white">{metric.value}</div>
          {metric.note && <div className="mt-1 text-[11px] font-semibold text-emerald-300">{metric.note}</div>}
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <DataTable title="Prix, valeurs et objectifs" rows={data.priceRows} />
      <DataTable title="Activité — T2 2026" rows={data.activityRows} />
      <DataTable title="Valeur de reconstitution — évolution" rows={data.reconstitutionHistory} />
      <DataTable
        title="Distribution par part — historique trimestriel"
        rows={data.distributionHistory}
        note={data.distributionNote}
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
        <h4 className="text-base font-black text-emerald-300 mb-3">Fondamentaux favorables</h4>
        <ul className="space-y-2">
          {data.favorable.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-slate-200 leading-relaxed">
              <span className="text-emerald-400 font-black">+</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
        <h4 className="text-base font-black text-amber-300 mb-3">Points de vigilance</h4>
        <ul className="space-y-2">
          {data.vigilance.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-slate-200 leading-relaxed">
              <span className="text-amber-400 font-black">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
      <h4 className="text-base font-black text-blue-300 mb-3">Lecture Maximus</h4>
      <div className="space-y-3">
        {data.readings.map((reading) => (
          <p key={reading} className="text-sm text-slate-200 leading-relaxed">
            {reading}
          </p>
        ))}
      </div>
    </div>
  </section>
);

export default ScpiRadar;
