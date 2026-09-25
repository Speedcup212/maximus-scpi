import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Database,
  Minus,
  ShieldAlert,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

type ChangeRow = {
  scpi_slug: string;
  previous_period: string | null;
  current_period: string | null;
  previous_source_document: string | null;
  current_source_document: string | null;
  previous_source_url: string | null;
  current_source_url: string | null;

  previous_td: number | string | null;
  current_td: number | string | null;
  td_delta: number | string | null;
  previous_tof: number | string | null;
  current_tof: number | string | null;
  tof_delta: number | string | null;
  previous_capitalisation: number | string | null;
  current_capitalisation: number | string | null;
  capitalisation_delta: number | string | null;
  previous_prix_souscription: number | string | null;
  current_prix_souscription: number | string | null;
  prix_souscription_delta: number | string | null;
  previous_prix_reconstitution: number | string | null;
  current_prix_reconstitution: number | string | null;
  prix_reconstitution_delta: number | string | null;
  previous_prix_retrait: number | string | null;
  current_prix_retrait: number | string | null;
  prix_retrait_delta: number | string | null;
  previous_valeur_realisation: number | string | null;
  current_valeur_realisation: number | string | null;
  valeur_realisation_delta: number | string | null;
  previous_endettement: number | string | null;
  current_endettement: number | string | null;
  endettement_delta: number | string | null;
  previous_walt: number | string | null;
  current_walt: number | string | null;
  walt_delta: number | string | null;
  previous_walb: number | string | null;
  current_walb: number | string | null;
  walb_delta: number | string | null;
  previous_collecte_nette: number | string | null;
  current_collecte_nette: number | string | null;
  collecte_nette_delta: number | string | null;
  previous_distribution_par_part: number | string | null;
  current_distribution_par_part: number | string | null;
  distribution_par_part_delta: number | string | null;
  previous_nombre_locataires: number | string | null;
  current_nombre_locataires: number | string | null;
  nombre_locataires_delta: number | string | null;
  previous_nombre_immeubles: number | string | null;
  current_nombre_immeubles: number | string | null;
  nombre_immeubles_delta: number | string | null;
  previous_parts_attente_retrait: number | string | null;
  current_parts_attente_retrait: number | string | null;
  parts_attente_retrait_delta: number | string | null;
};

interface ScpiIndicatorHistoryProps {
  scpiSlug: string;
  scpiName: string;
}

type Metric = {
  key: string;
  label: string;
  previous: number;
  current: number;
  delta: number;
  format: (value: number) => string;
  deltaFormat: (value: number) => string;
};

const toNumber = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
};

const formatPct = (value: number) =>
  `${value.toFixed(2).replace('.', ',')} %`;

const formatEuros = (value: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value) + ' €';

const formatMillions = (value: number) => {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(2).replace('.', ',')} Md€`;
  }
  return `${value.toFixed(value >= 100 ? 0 : 1).replace('.', ',')} M€`;
};

const formatParts = (value: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) + ' parts';

const formatYears = (value: number) =>
  `${value.toFixed(1).replace('.', ',')} ans`;

const formatDeltaPoints = (value: number) =>
  `${value > 0 ? '+' : ''}${value.toFixed(2).replace('.', ',')} pt`;

const formatDeltaValue = (value: number, suffix: string) =>
  `${value > 0 ? '+' : ''}${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value)}${suffix}`;

const ScpiIndicatorHistory: React.FC<ScpiIndicatorHistoryProps> = ({ scpiSlug, scpiName }) => {
  const [data, setData] = useState<ChangeRow | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!supabase) return;

      const { data: row, error } = await supabase
        .from('scpi_indicator_changes')
        .select('*')
        .eq('scpi_slug', scpiSlug)
        .maybeSingle();

      if (!active) return;
      if (error || !row) {
        setData(null);
        return;
      }

      setData(row as ChangeRow);
    };

    void load();
    return () => {
      active = false;
    };
  }, [scpiSlug]);

  const metrics = useMemo<Metric[]>(() => {
    if (!data) return [];

    const raw = [
      {
        key: 'tof',
        label: 'TOF',
        previous: toNumber(data.previous_tof),
        current: toNumber(data.current_tof),
        delta: toNumber(data.tof_delta),
        format: formatPct,
        deltaFormat: formatDeltaPoints,
      },
      {
        key: 'endettement',
        label: 'Endettement',
        previous: toNumber(data.previous_endettement),
        current: toNumber(data.current_endettement),
        delta: toNumber(data.endettement_delta),
        format: formatPct,
        deltaFormat: formatDeltaPoints,
      },
      {
        key: 'parts_attente_retrait',
        label: 'Parts en attente',
        previous: toNumber(data.previous_parts_attente_retrait),
        current: toNumber(data.current_parts_attente_retrait),
        delta: toNumber(data.parts_attente_retrait_delta),
        format: formatParts,
        deltaFormat: (v: number) => formatDeltaValue(v, ' parts'),
      },
      {
        key: 'capitalisation',
        label: 'Capitalisation',
        previous: toNumber(data.previous_capitalisation),
        current: toNumber(data.current_capitalisation),
        delta: toNumber(data.capitalisation_delta),
        format: formatMillions,
        deltaFormat: (v: number) => formatDeltaValue(v, ' M€'),
      },
      {
        key: 'prix_souscription',
        label: 'Prix de la part',
        previous: toNumber(data.previous_prix_souscription),
        current: toNumber(data.current_prix_souscription),
        delta: toNumber(data.prix_souscription_delta),
        format: formatEuros,
        deltaFormat: (v: number) => formatDeltaValue(v, ' €'),
      },
      {
        key: 'prix_reconstitution',
        label: 'Valeur de reconstitution',
        previous: toNumber(data.previous_prix_reconstitution),
        current: toNumber(data.current_prix_reconstitution),
        delta: toNumber(data.prix_reconstitution_delta),
        format: formatEuros,
        deltaFormat: (v: number) => formatDeltaValue(v, ' €'),
      },
      {
        key: 'prix_retrait',
        label: 'Prix de retrait',
        previous: toNumber(data.previous_prix_retrait),
        current: toNumber(data.current_prix_retrait),
        delta: toNumber(data.prix_retrait_delta),
        format: formatEuros,
        deltaFormat: (v: number) => formatDeltaValue(v, ' €'),
      },
      {
        key: 'walt',
        label: 'WALT',
        previous: toNumber(data.previous_walt),
        current: toNumber(data.current_walt),
        delta: toNumber(data.walt_delta),
        format: formatYears,
        deltaFormat: (v: number) => formatDeltaValue(v, ' an'),
      },
      {
        key: 'walb',
        label: 'WALB',
        previous: toNumber(data.previous_walb),
        current: toNumber(data.current_walb),
        delta: toNumber(data.walb_delta),
        format: formatYears,
        deltaFormat: (v: number) => formatDeltaValue(v, ' an'),
      },
    ];

    return raw
      .filter((metric) => metric.previous !== null && metric.current !== null && metric.delta !== null)
      .map((metric) => ({
        ...metric,
        previous: metric.previous as number,
        current: metric.current as number,
        delta: metric.delta as number,
      }))
      .slice(0, 6);
  }, [data]);

  const observations = useMemo(() => {
    if (!data) return [];

    const result: string[] = [];
    const tofDelta = toNumber(data.tof_delta);
    const debtDelta = toNumber(data.endettement_delta);
    const previousWaiting = toNumber(data.previous_parts_attente_retrait);
    const currentWaiting = toNumber(data.current_parts_attente_retrait);
    const previousReconstitution = toNumber(data.previous_prix_reconstitution);
    const currentReconstitution = toNumber(data.current_prix_reconstitution);

    if (tofDelta !== null && Math.abs(tofDelta) >= 0.5) {
      result.push(
        `TOF ${tofDelta < 0 ? 'en baisse' : 'en hausse'} de ${Math.abs(tofDelta).toFixed(2).replace('.', ',')} point${Math.abs(tofDelta) >= 2 ? 's' : ''}.`
      );
    }

    if (debtDelta !== null && Math.abs(debtDelta) >= 1) {
      result.push(
        `Endettement ${debtDelta > 0 ? 'en hausse' : 'en baisse'} de ${Math.abs(debtDelta).toFixed(2).replace('.', ',')} point${Math.abs(debtDelta) >= 2 ? 's' : ''}.`
      );
    }

    if (previousWaiting !== null && currentWaiting !== null && previousWaiting !== currentWaiting) {
      if (currentWaiting === 0 && previousWaiting > 0) {
        result.push(`Parts en attente : ${formatParts(previousWaiting)} → aucune part signalée sur la dernière période structurée.`);
      } else {
        result.push(`Parts en attente : ${formatParts(previousWaiting)} → ${formatParts(currentWaiting)}.`);
      }
    }

    if (
      previousReconstitution !== null &&
      currentReconstitution !== null &&
      previousReconstitution !== 0
    ) {
      const pct = ((currentReconstitution - previousReconstitution) / previousReconstitution) * 100;
      if (Math.abs(pct) >= 1) {
        result.push(
          `Valeur de reconstitution ${pct > 0 ? 'en hausse' : 'en baisse'} de ${Math.abs(pct).toFixed(1).replace('.', ',')} %.`
        );
      }
    }

    return result.slice(0, 3);
  }, [data]);

  if (!data || !data.previous_period || !data.current_period || metrics.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#F8FAFC] py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-emerald-900/10 bg-white p-5 sm:p-7 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-emerald-700">
                <Activity className="w-4 h-4" />
                Évolution documentée
              </div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-950">
                Ce qui a changé sur {scpiName}
              </h2>
              <p className="mt-2 text-slate-600">
                Comparaison des indicateurs publiés entre {data.previous_period} et {data.current_period}.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">
              <Database className="w-4 h-4 text-emerald-300" />
              Historique MaximusSCPI
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {metrics.map((metric) => {
              const isUp = metric.delta > 0;
              const isDown = metric.delta < 0;
              const Icon = isUp ? ArrowUpRight : isDown ? ArrowDownRight : Minus;

              return (
                <div key={metric.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-bold text-slate-700">{metric.label}</div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700">
                      <Icon className="w-3.5 h-3.5" />
                      {metric.deltaFormat(metric.delta)}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-slate-400">{data.previous_period}</div>
                      <div className="mt-1 font-bold text-slate-700">{metric.format(metric.previous)}</div>
                    </div>
                    <div className="text-slate-300">→</div>
                    <div className="text-right">
                      <div className="text-[11px] uppercase tracking-wide text-slate-400">{data.current_period}</div>
                      <div className="mt-1 font-black text-slate-950">{metric.format(metric.current)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {observations.length > 0 && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
                <div>
                  <div className="font-black text-amber-950">Évolutions à surveiller</div>
                  <ul className="mt-2 space-y-1.5 text-sm text-amber-950/85">
                    {observations.map((observation) => (
                      <li key={observation}>• {observation}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
            <div>
              Source actuelle : {data.current_source_document || data.current_period}
              {data.previous_source_document ? ` · Source précédente : ${data.previous_source_document}` : ''}
            </div>
            <div>
              Une variation d’indicateur ne constitue pas, à elle seule, un signal d’achat ou de vente.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScpiIndicatorHistory;
