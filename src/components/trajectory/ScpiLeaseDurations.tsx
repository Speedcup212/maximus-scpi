import React from 'react';
import { ExternalLink } from 'lucide-react';
import { scpiData } from '../../data/scpiData';

interface ScpiLeaseDurationsProps {
  scpiSlug: string;
  className?: string;
}

const slugify = (name: string) => name.toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const referenceDate = (value?: string) => {
  const m = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? m[3] + '/' + m[2] + '/' + m[1] : null;
};

/**
 * Durées locatives actuelles, volontairement indépendantes du graphe annuel
 * de valorisation : ne pas fabriquer de série WALT/WALB à partir d'un seul
 * bulletin. CORUM publie une durée d'engagement, dont la pondération n'est pas
 * spécifiée, et aucune WALT distincte certifiée.
 */
export const ScpiLeaseDurations: React.FC<ScpiLeaseDurationsProps> = ({
  scpiSlug,
  className = '',
}) => {
  const scpi = scpiData.find((row) => slugify(row.name) === scpiSlug);
  const isCorum = scpiSlug.startsWith('corum-');
  const walb = scpi?.walb;
  const walt = scpi?.walt;

  if (!isCorum && walb === undefined && walt === undefined) return null;
  const corumProxy = isCorum && walb !== undefined && Boolean(scpi?.walbDefinition);
  const source = scpi?.walbSourceUrl;
  const date = referenceDate(scpi?.walbReferenceDate);
  return (
    <section data-testid="scpi-lease-durations" className={`rounded-xl border border-slate-700 bg-slate-900/60 p-4 sm:p-5 ${className}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-white">Durées des baux commerciaux — WALT / WALB</h4>
        {date && <span className="text-xs text-slate-400">Référence : {date}</span>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-600 bg-slate-800/60 p-3">
          <div className="text-xs text-slate-300">
            {corumProxy ? 'Engagement locatif (assimilable WALB)' : 'WALB'}
          </div>
          <div data-testid="scpi-walb" className="mt-1 text-xl font-bold text-emerald-300">
            {walb !== undefined ? `${walb.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} ans` : 'Non renseignée'}
          </div>
          {corumProxy && <p className="mt-2 text-[11px] leading-4 text-slate-400">
            Durée moyenne d'engagement à payer les loyers publiée par CORUM.
            Pondération non précisée : ce n'est pas une WALB normalisée confirmée.
          </p>}
        </div>
        <div className="rounded-lg border border-slate-600 bg-slate-800/60 p-3">
          <div className="text-xs text-slate-300">WALT — durée jusqu'au terme contractuel</div>
          <div data-testid="scpi-walt" className="mt-1 text-xl font-bold text-white">
            {walt !== undefined ? `${walt.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} ans`
              : isCorum ? 'Non publiée' : 'Non renseignée'}
          </div>
          {isCorum && walt === undefined && <p className="mt-2 text-[11px] leading-4 text-slate-400">
            Aucune WALT distincte vérifiée dans le bulletin CORUM disponible.
            Elle ne peut pas être calculée à partir de la durée d'engagement.
          </p>}
        </div>
      </div>
      {source && <div className="mt-3 text-xs text-sky-300">
        <a className="inline-flex items-center gap-1 underline underline-offset-2"
          href={source} target="_blank" rel="noopener noreferrer">
          Bulletin officiel CORUM <ExternalLink className="h-3 w-3" />
        </a>
      </div>}
    </section>
  );
};
