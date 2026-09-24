import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Gauge,
  Landmark,
  MapPin,
  Newspaper,
  ShieldCheck,
} from 'lucide-react';
import type { Scpi } from '../types/scpi';
import type { ScpiLandingData } from '../data/landingPagesData';
import type { InvestmentNewsItem } from '../types/investmentNews';
import { ASSET_TYPE_LABELS } from '../types/investmentNews';
import { createSlugFromName } from '../utils/scpiSlugMapper';
import { supabase } from '../supabaseClient';
import newsJson from '../../data/news/scpi-investment-news-latest.json';

interface ScpiPremiumAnalysisProps {
  scpi: Scpi;
  landingData: ScpiLandingData;
}

interface WatchStatus {
  status: string | null;
  lastSuccessAt: string | null;
}

type RadarAxis = {
  label: string;
  value: number | null;
  fact: string;
};

const FALLBACK_NEWS: InvestmentNewsItem[] = Array.isArray(newsJson)
  ? (newsJson as InvestmentNewsItem[])
  : [];

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

const formatCurrency = (value?: number | null) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Non disponible';
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} Md€`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} M€`;
  }
  return `${value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`;
};

const formatPercent = (value?: number | null) =>
  typeof value === 'number' && Number.isFinite(value)
    ? `${value.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} %`
    : 'Non disponible';

const formatNumber = (value?: number | null) =>
  typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString('fr-FR')
    : 'Non disponible';

const formatDate = (value?: string | null) => {
  if (!value) return 'Date non publiée';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const topEntry = (items?: { name: string; value: number }[]) => {
  if (!items?.length) return null;
  return [...items].sort((a, b) => b.value - a.value)[0];
};

const diversityScore = (items?: { name: string; value: number }[]) => {
  if (!items?.length) return null;
  const top = topEntry(items);
  if (!top) return null;
  return Math.round(clamp((100 - top.value) * 0.9 + Math.min(items.length * 7, 35)));
};

const valuationGap = (scpi: Scpi) => {
  if (
    typeof scpi.price !== 'number' ||
    typeof scpi.valeurReconstitution !== 'number' ||
    scpi.valeurReconstitution <= 0
  ) {
    return null;
  }
  return ((scpi.price - scpi.valeurReconstitution) / scpi.valeurReconstitution) * 100;
};

const articleSlug = (item: InvestmentNewsItem) =>
  `${item.date || 'actualite'}-${createSlugFromName(item.title || 'actualite-scpi').slice(0, 90)}`;

const mapNewsRow = (row: any): InvestmentNewsItem => ({
  id: row.id,
  scpi: row.scpi_name || '',
  managementCompany: row.management_company || '',
  operationType: row.operation_type || 'acquisition',
  assetType: row.asset_type || 'autre_immobilier',
  country: row.country || '',
  city: row.city || '',
  area: row.area || '',
  address: row.address || '',
  tenant: row.tenant || '',
  amount: row.amount || '',
  surface: row.surface || '',
  leaseDuration: row.lease_duration || '',
  title: row.title || 'Actualité SCPI',
  summary: row.summary || '',
  sourceUrl: row.source_url || '',
  sourceOfficial: row.source_official !== false,
  imageUrl: row.image_url || '',
  imageAlt: row.image_alt || '',
  imageCredit: row.image_credit || '',
  yieldAem: row.yield_aem || '',
  annualRent: row.annual_rent || '',
  rooms: row.rooms || '',
  locationContext: row.location_context || '',
  tenantContext: row.tenant_context || '',
  portfolioContext: row.portfolio_context || '',
  maximusAnalysis: row.maximus_analysis || '',
  sourceDocumentLabel: row.source_document_label || '',
  date: row.published_date || (row.detected_at ? String(row.detected_at).slice(0, 10) : ''),
  detectedAt: row.detected_at || '',
  investmentRelated: true,
  dataQuality: row.data_quality || 'standard',
  editorialPriority: row.editorial_priority || 2,
  confidence: Number(row.confidence || 0.85),
  disclaimer: "Information factuelle issue d'une source officielle. Ne constitue pas une recommandation d'investissement.",
});

const RadarChart: React.FC<{ axes: RadarAxis[] }> = ({ axes }) => {
  const center = 210;
  const radius = 138;
  const angleStep = (Math.PI * 2) / axes.length;

  const point = (index: number, value: number, customRadius = radius) => {
    const angle = -Math.PI / 2 + angleStep * index;
    const r = customRadius * (clamp(value) / 100);
    return {
      x: center + Math.cos(angle) * r,
      y: center + Math.sin(angle) * r,
    };
  };

  const polygonFor = (level: number) =>
    axes
      .map((_, index) => {
        const p = point(index, level);
        return `${p.x},${p.y}`;
      })
      .join(' ');

  const dataPolygon = axes
    .map((axis, index) => {
      const p = point(index, axis.value ?? 0);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  const shortLabel = (label: string) => {
    if (label === 'Diversif. géo') return ['Diversification', 'géographique'];
    if (label === 'Diversif. secteurs') return ['Diversification', 'sectorielle'];
    if (label === 'Structure fin.') return ['Structure', 'financière'];
    return [label];
  };

  return (
    <div className="w-full max-w-[560px] mx-auto">
      <svg viewBox="0 0 420 420" role="img" aria-label="Radar Maximus">
        <defs>
          <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {[25, 50, 75, 100].map((level) => (
          <polygon
            key={level}
            points={polygonFor(level)}
            fill={level === 100 ? 'rgba(15,23,42,0.28)' : 'none'}
            stroke="#64748b"
            strokeOpacity={0.7}
            strokeWidth={level === 100 ? 1.5 : 1}
          />
        ))}

        {[25, 50, 75, 100].map((level) => {
          const y = center - radius * (level / 100);
          return (
            <text
              key={`tick-${level}`}
              x={center + 6}
              y={y + 3}
              fontSize="9"
              fill="#94a3b8"
            >
              {level}
            </text>
          );
        })}

        {axes.map((_, index) => {
          const p = point(index, 100);
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="#64748b"
              strokeWidth="1.1"
            />
          );
        })}

        <polygon
          points={dataPolygon}
          fill="rgba(16, 185, 129, 0.32)"
          stroke="#10b981"
          strokeWidth="2.5"
        />

        {axes.map((axis, index) => {
          const p = point(index, axis.value ?? 0);
          const labelPoint = point(index, 100, 174);
          const lines = shortLabel(axis.label);
          const scoreY = labelPoint.y + (lines.length > 1 ? 16 : 13);

          return (
            <g key={axis.label}>
              <circle cx={p.x} cy={p.y} r="3.5" fill="#10b981" stroke="#a7f3d0" strokeWidth="1" />

              <text
                x={labelPoint.x}
                y={labelPoint.y - (lines.length > 1 ? 6 : 0)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#f8fafc"
              >
                {lines.map((line, lineIndex) => (
                  <tspan
                    key={line}
                    x={labelPoint.x}
                    dy={lineIndex === 0 ? 0 : 13}
                  >
                    {line}
                  </tspan>
                ))}
              </text>

              <text
                x={labelPoint.x}
                y={scoreY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11.5"
                fontWeight="700"
                fill="#a7f3d0"
              >
                {axis.value == null ? 'ND' : `${Math.round(axis.value)}/100`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const ScpiPremiumAnalysis: React.FC<ScpiPremiumAnalysisProps> = ({ scpi, landingData }) => {
  const slug = createSlugFromName(scpi.name);
  const localFallbackNews = useMemo(
    () =>
      FALLBACK_NEWS
        .filter((item) => createSlugFromName(item.scpi) === slug)
        .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
        .slice(0, 4),
    [slug]
  );

  const [news, setNews] = useState<InvestmentNewsItem[]>(localFallbackNews);
  const [watchStatus, setWatchStatus] = useState<WatchStatus>({ status: null, lastSuccessAt: null });

  useEffect(() => {
    let cancelled = false;

    // Important lors d'une navigation SPA d'une fiche SCPI à une autre :
    // ne jamais conserver les actualités / le statut de veille de la fiche précédente.
    setNews(localFallbackNews);
    setWatchStatus({ status: null, lastSuccessAt: null });

    const loadNews = async () => {
      if (!supabase) return;

      try {
        const [newsResult, sourceResult] = await Promise.all([
          supabase
            .from('scpi_news_items')
            .select('*')
            .eq('scpi_slug', slug)
            .eq('status', 'published')
            .gt('editorial_priority', 0)
            .order('published_date', { ascending: false })
            .order('detected_at', { ascending: false })
            .limit(4),
          supabase
            .from('scpi_news_sources')
            .select('status,last_success_at')
            .eq('slug', slug)
            .maybeSingle(),
        ]);

        if (cancelled) return;

        if (!newsResult.error && Array.isArray(newsResult.data)) {
          setNews(
            newsResult.data
              .map(mapNewsRow)
              .filter((item) => item.dataQuality !== 'weak')
          );
        }

        if (!sourceResult.error && sourceResult.data) {
          setWatchStatus({
            status: sourceResult.data.status || null,
            lastSuccessAt: sourceResult.data.last_success_at || null,
          });
        }
      } catch (error) {
        console.warn('[ScpiPremiumAnalysis] Veille indisponible, fallback local conservé.', error);
      }
    };

    loadNews();
    return () => {
      cancelled = true;
    };
  }, [slug, localFallbackNews]);

  const gap = valuationGap(scpi);
  const age = scpi.creation ? Math.max(0, new Date().getFullYear() - scpi.creation) : null;
  const topGeo = topEntry(scpi.repartitionGeo);
  const topSector = topEntry(scpi.repartitionSector);

  const radarAxes: RadarAxis[] = [
    {
      label: 'Occupation',
      value: typeof scpi.tof === 'number' ? clamp(scpi.tof) : null,
      fact: typeof scpi.tof === 'number' ? `TOF ${formatPercent(scpi.tof)}` : 'TOF non disponible',
    },
    {
      label: 'Diversif. géo',
      value: diversityScore(scpi.repartitionGeo),
      fact: scpi.repartitionGeo?.length
        ? `${scpi.repartitionGeo.length} zones · 1re exposition ${topGeo?.name} ${formatPercent(topGeo?.value)}`
        : 'Répartition géographique non disponible',
    },
    {
      label: 'Diversif. secteurs',
      value: diversityScore(scpi.repartitionSector),
      fact: scpi.repartitionSector?.length
        ? `${scpi.repartitionSector.length} secteurs · 1re exposition ${topSector?.name} ${formatPercent(topSector?.value)}`
        : 'Répartition sectorielle non disponible',
    },
    {
      label: 'Structure fin.',
      value: typeof scpi.debt === 'number' ? Math.round(clamp(100 - scpi.debt * 2)) : null,
      fact: typeof scpi.debt === 'number' ? `Endettement ${formatPercent(scpi.debt)}` : 'Endettement non disponible',
    },
    {
      label: 'Valorisation',
      value: gap == null ? null : Math.round(clamp(70 - gap * 4)),
      fact: gap == null
        ? 'Valeur de reconstitution non disponible'
        : `${gap <= 0 ? 'Décote' : 'Surcote'} ${formatPercent(Math.abs(gap))} vs valeur de reconstitution`,
    },
    {
      label: 'Ancienneté',
      value: age == null ? null : Math.round(clamp(age * 8 + 20, 20, 100)),
      fact: age == null ? 'Année de création non disponible' : `${age} an${age > 1 ? 's' : ''} d'historique`,
    },
  ];

  const strengths = useMemo(() => {
    const items: string[] = [];
    if (scpi.tof >= 95) items.push(`Occupation très élevée : TOF de ${formatPercent(scpi.tof)}.`);
    else if (scpi.tof >= 90) items.push(`Occupation élevée : TOF de ${formatPercent(scpi.tof)}.`);

    if (typeof scpi.debt === 'number' && scpi.debt <= 15) {
      items.push(`Levier limité : endettement de ${formatPercent(scpi.debt)}.`);
    }

    if (gap != null && gap <= -2) {
      items.push(`Prix de part inférieur de ${formatPercent(Math.abs(gap))} à la valeur de reconstitution publiée.`);
    }

    if (scpi.repartitionGeo && scpi.repartitionGeo.length >= 5 && (topGeo?.value ?? 100) < 50) {
      items.push(`Diversification géographique étendue sur ${scpi.repartitionGeo.length} zones.`);
    }

    if (scpi.repartitionSector && scpi.repartitionSector.length >= 4 && (topSector?.value ?? 100) < 50) {
      items.push(`Diversification sectorielle répartie sur ${scpi.repartitionSector.length} segments.`);
    }

    if (scpi.capitalization >= 500_000_000) {
      items.push(`Capitalisation significative : ${formatCurrency(scpi.capitalization)}.`);
    } else if (scpi.capitalization >= 100_000_000) {
      items.push(`Capitalisation supérieure à 100 M€ : ${formatCurrency(scpi.capitalization)}.`);
    }

    if (scpi.fees === 0) items.push('Aucun frais de souscription affiché.');
    if (scpi.isr) items.push('Label ISR indiqué dans les données de la SCPI.');

    return items.slice(0, 3);
  }, [scpi, gap, topGeo, topSector]);

  const watchPoints = useMemo(() => {
    const items: string[] = [];

    for (const warning of scpi.maximusWarnings || []) {
      if (warning && !items.includes(warning)) items.push(warning);
    }

    if (age != null && age < 3) {
      items.push(`Historique court : SCPI créée en ${scpi.creation}.`);
    }
    if (typeof scpi.tof === 'number' && scpi.tof < 90) {
      items.push(`TOF sous 90 % : ${formatPercent(scpi.tof)}.`);
    }
    if (typeof scpi.debt === 'number' && scpi.debt >= 30) {
      items.push(`Endettement à surveiller : ${formatPercent(scpi.debt)}.`);
    }
    if (gap != null && gap >= 5) {
      items.push(`Surcote supérieure à 5 % par rapport à la valeur de reconstitution : ${formatPercent(gap)}.`);
    }
    if ((topGeo?.value ?? 0) >= 50) {
      items.push(`Concentration géographique : ${topGeo?.name} représente ${formatPercent(topGeo?.value)}.`);
    }
    if ((topSector?.value ?? 0) >= 50) {
      items.push(`Concentration sectorielle : ${topSector?.name} représente ${formatPercent(topSector?.value)}.`);
    }
    if (scpi.capitalization < 100_000_000) {
      items.push(`Capitalisation encore limitée : ${formatCurrency(scpi.capitalization)}.`);
    }
    if (scpi.fees >= 10) {
      items.push(`Frais de souscription élevés : ${formatPercent(scpi.fees)}.`);
    }
    if (!scpi.repartitionGeo?.length) {
      items.push('Répartition géographique détaillée non disponible dans la base structurée.');
    }
    if (!scpi.repartitionSector?.length) {
      items.push('Répartition sectorielle détaillée non disponible dans la base structurée.');
    }

    return items.slice(0, 3);
  }, [age, gap, scpi, topGeo, topSector]);

  const narrative = useMemo(() => {
    const positionParts = [
      `${scpi.name} est gérée par ${scpi.company || landingData.societe_gestion}.`,
      scpi.creation ? `Créée en ${scpi.creation}, elle dispose d'un historique de ${age ?? 0} an${(age ?? 0) > 1 ? 's' : ''}.` : null,
      `Le taux de distribution affiché dans la base MaximusSCPI est de ${formatPercent(scpi.yield)}, avec un TOF de ${formatPercent(scpi.tof)}.`,
      `La capitalisation ressort à ${formatCurrency(scpi.capitalization)}.`,
    ].filter(Boolean).join(' ');

    const allocationParts = [
      scpi.repartitionGeo?.length
        ? `Le patrimoine est réparti sur ${scpi.repartitionGeo.length} zones géographiques, avec ${topGeo?.name} comme première exposition à ${formatPercent(topGeo?.value)}.`
        : 'La répartition géographique détaillée reste à documenter.',
      scpi.repartitionSector?.length
        ? `La répartition sectorielle couvre ${scpi.repartitionSector.length} segments, dominés par ${topSector?.name} à ${formatPercent(topSector?.value)}.`
        : 'La répartition sectorielle détaillée reste à documenter.',
      scpi.nbImmeubles ? `Le portefeuille compte ${formatNumber(scpi.nbImmeubles)} immeubles.` : null,
      scpi.nombreLocataires ? `Le nombre de locataires publié est de ${formatNumber(scpi.nombreLocataires)}.` : null,
    ].filter(Boolean).join(' ');

    const riskParts = [
      typeof scpi.debt === 'number' ? `L'endettement est de ${formatPercent(scpi.debt)}.` : "L'endettement n'est pas renseigné.",
      gap != null
        ? `Le prix de part de ${formatCurrency(scpi.price)} se situe ${gap <= 0 ? 'sous' : 'au-dessus de'} la valeur de reconstitution de ${formatCurrency(scpi.valeurReconstitution)}, soit un écart de ${formatPercent(Math.abs(gap))}.`
        : `Le prix de part est de ${formatCurrency(scpi.price)} ; la valeur de reconstitution n'est pas suffisamment documentée pour calculer un écart fiable.`,
      scpi.walt ? `WALT : ${scpi.walt.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} ans.` : null,
      scpi.walb ? `WALB : ${scpi.walb.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} ans.` : null,
    ].filter(Boolean).join(' ');

    return [`${positionParts} ${allocationParts}`, riskParts];
  }, [age, gap, landingData.societe_gestion, scpi, topGeo, topSector]);

  const quarterlyFallback = useMemo(() => {
    const parts = (scpi.actualitesTrimestrielles || '')
      .split('|')
      .map((item) => item.trim())
      .filter(Boolean);
    return parts.slice(0, 2);
  }, [scpi.actualitesTrimestrielles]);

  return (
    <section className="bg-slate-950 py-12 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200">
            <Gauge className="h-4 w-4" />
            Analyse MaximusSCPI
          </div>
          <h2 className="mt-5 text-3xl sm:text-4xl font-bold">
            Analyse Maximus de {landingData.nom}
          </h2>
          <p className="mt-4 text-slate-300 leading-relaxed">
            Les indicateurs essentiels, les points de vigilance et la veille utile, sans répéter les chiffres déjà affichés plus haut.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-slate-700/80 bg-slate-900/75 p-5 sm:p-6 shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-2xl font-bold">Radar Maximus</h3>
                <p className="text-sm text-slate-400 mt-1">6 dimensions · données disponibles uniquement</p>
              </div>
              <Activity className="h-8 w-8 text-emerald-300" />
            </div>
            <RadarChart axes={radarAxes} />
            <div className="mt-2 grid sm:grid-cols-2 gap-2.5">
              {radarAxes.map((axis) => (
                <div
                  key={axis.label}
                  className="rounded-lg border border-white/10 bg-slate-950/70 px-3.5 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {axis.label}
                    </span>
                    <span className="rounded-md bg-emerald-400/10 px-2 py-0.5 text-xs font-bold text-emerald-200">
                      {axis.value == null ? 'ND' : `${Math.round(axis.value)}/100`}
                    </span>
                  </div>
                  <div className="mt-1.5 text-sm leading-snug text-slate-200">{axis.fact}</div>
                </div>
              ))}
            </div>
            <details className="mt-4 text-xs text-slate-500">
              <summary className="cursor-pointer text-slate-400">Méthode du Radar Maximus</summary>
              <p className="mt-2">
                Chaque sommet correspond exactement au score affiché dans les cases. Les anneaux représentent 0, 25, 50, 75 et 100.
                Occupation = TOF ; diversification = concentration et nombre de poches ; structure financière = endettement ;
                valorisation = écart prix/reconstitution ; ancienneté = historique depuis la création. Donnée absente = « ND ».
              </p>
            </details>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
              <h3 className="text-xl font-bold mb-4">Lecture Maximus</h3>
              <div className="space-y-3">
                {narrative.map((paragraph, index) => (
                  <p key={index} className="text-slate-300 leading-relaxed">{paragraph}</p>
                ))}
              </div>
            </div>

            {scpi.liquidite && (
              <div className="rounded-2xl border border-sky-400/20 bg-sky-400/[0.07] p-5">
                <div className="flex items-center gap-2 text-sky-200 font-semibold">
                  <Landmark className="h-5 w-5" />
                  Liquidité / marché des parts
                </div>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">{scpi.liquidite}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.07] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                  <h3 className="font-bold text-lg">Points favorables</h3>
                </div>
                <ul className="space-y-3 text-sm text-slate-200">
                  {(strengths.length ? strengths : ['Aucun point favorable automatique suffisamment documenté à mettre en avant.']).map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-emerald-300">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-amber-400/20 bg-amber-400/[0.07] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-300" />
                  <h3 className="font-bold text-lg">Points de vigilance</h3>
                </div>
                <ul className="space-y-3 text-sm text-slate-200">
                  {(watchPoints.length
                    ? watchPoints
                    : ["Pas d'alerte quantitative majeure sur les indicateurs disponibles ; les risques immobiliers, de liquidité et de perte en capital restent présents."]).map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-amber-300">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-emerald-300" />
                <h3 className="text-2xl font-bold">Actualités & acquisitions</h3>
              </div>
              <p className="text-slate-400 mt-2">
                Veille MaximusSCPI : priorité aux sources officielles et aux opérations immobilières documentées.
              </p>
            </div>
            <div className="text-sm text-slate-400">
              {watchStatus.lastSuccessAt
                ? `Veille contrôlée le ${formatDate(watchStatus.lastSuccessAt)}`
                : watchStatus.status
                  ? `Statut de veille : ${watchStatus.status}`
                  : 'Veille automatisée active'}
            </div>
          </div>

          {news.length > 0 ? (
            <div className="grid lg:grid-cols-2 gap-px bg-white/10">
              {news.slice(0, 2).map((item) => (
                <a
                  key={item.id || item.title}
                  href={`/actualites/${slug}/${articleSlug(item)}/`}
                  className="group bg-slate-950 p-5 sm:p-6 hover:bg-slate-900 transition-colors"
                >
                  {item.imageUrl && (
                    <div className="mb-4 overflow-hidden rounded-xl bg-slate-900 aspect-[16/8]">
                      <img
                        src={item.imageUrl}
                        alt={item.imageAlt || item.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-3">
                    <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-emerald-200">
                      {ASSET_TYPE_LABELS[item.assetType] || 'Immobilier'}
                    </span>
                    <span>{formatDate(item.date)}</span>
                    {(item.city || item.country) && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {[item.city, item.country].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-white group-hover:text-emerald-200 transition-colors">
                    {item.title}
                  </h4>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-300">
                    {item.amount && <span>Montant : {item.amount}</span>}
                    {item.surface && <span>Surface : {item.surface}</span>}
                    {item.tenant && <span>Locataire : {item.tenant}</span>}
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
                    Lire l'analyse Maximus
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              ))}
            </div>
          ) : quarterlyFallback.length > 0 ? (
            <div className="p-6 sm:p-8">
              <div className="text-sm font-semibold text-slate-200 mb-4">
                Faits marquants du dernier bulletin disponible
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {quarterlyFallback.map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Newspaper className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="mt-4 text-slate-300 font-semibold">
                Aucune actualité suffisamment qualifiée n'est publiée pour cette SCPI à ce jour.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Cela ne signifie pas qu'aucun événement n'a eu lieu : la veille ne publie que les éléments dont la source et la qualité sont suffisantes.
              </p>
            </div>
          )}

          <div className="p-5 sm:px-8 border-t border-white/10 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-xs text-slate-500">
            <span>
              Données : catalogue MaximusSCPI, bulletins disponibles et veille de sources officielles.
            </span>
            <a href={`/actualites/${slug}/`} className="text-emerald-300 hover:text-emerald-200 font-semibold">
              Voir toute la veille {landingData.nom}
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-xs text-slate-500 leading-relaxed">
          Les performances passées ne préjugent pas des performances futures. Les SCPI présentent notamment
          un risque de perte en capital et de liquidité. Les indicateurs ci-dessus sont une grille de lecture
          éditoriale construite à partir des données disponibles ; les données non publiées ou non fiabilisées
          ne sont pas extrapolées.
        </div>
      </div>
    </section>
  );
};

export default ScpiPremiumAnalysis;
