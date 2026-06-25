import { useState, useMemo, useCallback } from 'react';
import { useProReport } from '../../contexts/ProReportContext';
import { scpiDataExtended, SCPIExtended } from '../../data/scpiDataExtended';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Plus, X, Check, Calculator, TrendingUp, Percent, Euro, Clock, ArrowRight, Search } from 'lucide-react';

// ── Constantes ──
const TMI_OPTIONS = [
  { value: 11, label: '11% — Tranche 1' },
  { value: 30, label: '30% — Tranche 2' },
  { value: 41, label: '41% — Tranche 3' },
  { value: 45, label: '45% — Tranche 4' },
];

const DURATION_OPTIONS = [5, 10, 15, 20];

const PRELEVEMENTS_SOCIAUX = 0.172; // 17.2%

interface ScpiSelection {
  scpi: SCPIExtended;
  amount: number;
}

interface ResultRow {
  scpiName: string;
  amount: number;
  grossYield: number;
  estimatedTax: number;
  netYield: number;
  netAnnualIncome: number;
}

// ── Helpers de calcul ──
function calculateTaxRate(tmi: number, mode: string): number {
  // Taux effectif d'imposition sur les revenus SCPI
  // En pleine propriété : TMI + PS sur ~50% (abattement micro-foncier pour les petits revenus)
  // En démembrement : pas d'imposition sur les revenus (ils vont à l'usufruitier)
  // À crédit : déduction des intérêts d'emprunt du revenu imposable
  switch (mode) {
    case 'comptant':
      // Revenus fonciers : TMI + PS
      return (tmi / 100 + PRELEVEMENTS_SOCIAUX) * 0.95; // ~5% d'abattement forfaitaire
    case 'demembrement':
      return 0; // Pas de revenus imposables en nue-propriété
    case 'credit':
      // Déduction partielle des intérêts
      return (tmi / 100 + PRELEVEMENTS_SOCIAUX) * 0.7; // ~30% d'économie d'impôt via crédit
    default:
      return tmi / 100 + PRELEVEMENTS_SOCIAUX;
  }
}

function computeResults(
  selections: ScpiSelection[],
  tmi: number,
  mode: string
): { results: ResultRow[]; total: ResultRow } {
  const taxRate = calculateTaxRate(tmi, mode);
  const rows: ResultRow[] = selections.map((sel) => {
    const gross = (sel.scpi.yield / 100) * sel.amount;
    const tax = gross * taxRate;
    const net = gross - tax;
    return {
      scpiName: sel.scpi.name,
      amount: sel.amount,
      grossYield: Math.round(gross),
      estimatedTax: Math.round(tax),
      netYield: Math.round(sel.scpi.yield * (1 - taxRate) * 100) / 100,
      netAnnualIncome: Math.round(net),
    };
  });

  const totalAmount = selections.reduce((s, sel) => s + sel.amount, 0);
  const totalGross = rows.reduce((s, r) => s + r.grossYield, 0);
  const totalTax = rows.reduce((s, r) => s + r.estimatedTax, 0);
  const totalNet = totalGross - totalTax;

  return {
    results: rows,
    total: {
      scpiName: 'TOTAL',
      amount: totalAmount,
      grossYield: Math.round(totalGross),
      estimatedTax: Math.round(totalTax),
      netYield: totalAmount > 0 ? Math.round((totalNet / totalAmount) * 10000) / 100 : 0,
      netAnnualIncome: Math.round(totalNet),
    },
  };
}

// ── Données graphique ──
function generateChartData(
  selections: ScpiSelection[],
  duration: number,
  taxRate: number
) {
  const years = Array.from({ length: duration + 1 }, (_, i) => i);
  return years.map((year) => {
    const entry: any = { year: `Année ${year}` };
    let totalRevenue = 0;
    selections.forEach((sel) => {
      const grossRevenue = (sel.scpi.yield / 100) * sel.amount;
      const netRevenue = grossRevenue * (1 - taxRate);
      // Revenus cumulés sur la durée
      const cumulative = Math.round(netRevenue * year);
      entry[sel.scpi.name] = cumulative;
      totalRevenue += cumulative;
    });
    entry['Total'] = totalRevenue;
    return entry;
  });
}

// ── Composant ──
export default function ProSimulator() {
  const { setSimulation, hasSimulation } = useProReport();

  // Paramètres client — persistés en localStorage
  const [tmi, setTmi] = useState<number>(() => {
    const stored = localStorage.getItem('pro_simulator_tmi');
    return stored ? Number(stored) : 30;
  });
  const [duration, setDuration] = useState<number>(() => {
    const stored = localStorage.getItem('pro_simulator_duration');
    return stored ? Number(stored) : 10;
  });
  const [mode, setMode] = useState<'comptant' | 'credit' | 'demembrement'>(() => {
    const stored = localStorage.getItem('pro_simulator_mode');
    return (stored as any) || 'comptant';
  });

  // Sélection SCPI
  const [selections, setSelections] = useState<ScpiSelection[]>([
    { scpi: scpiDataExtended[0], amount: 5000 },
    { scpi: scpiDataExtended[1] || scpiDataExtended[0], amount: 5000 },
  ]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [feedback, setFeedback] = useState(false);

  // Persister les paramètres
  const updateTmi = (val: number) => {
    setTmi(val);
    localStorage.setItem('pro_simulator_tmi', String(val));
  };
  const updateDuration = (val: number) => {
    setDuration(val);
    localStorage.setItem('pro_simulator_duration', String(val));
  };
  const updateMode = (val: 'comptant' | 'credit' | 'demembrement') => {
    setMode(val);
    localStorage.setItem('pro_simulator_mode', val);
  };

  // Modifier le montant d'une SCPI
  const updateAmount = (index: number, amount: number) => {
    setSelections((prev) =>
      prev.map((sel, i) => (i === index ? { ...sel, amount: Math.max(1000, amount) } : sel))
    );
  };

  // Remplacer une SCPI
  const replaceScpi = (index: number, scpi: SCPIExtended) => {
    setSelections((prev) =>
      prev.map((sel, i) => (i === index ? { ...sel, scpi } : sel))
    );
    setDropdownOpen(false);
  };

  // Ajouter une SCPI (max 4)
  const addSelection = () => {
    if (selections.length >= 4) return;
    const usedIds = new Set(selections.map((s) => s.scpi.id));
    const available = scpiDataExtended.find((s) => !usedIds.has(s.id));
    if (available) {
      setSelections((prev) => [...prev, { scpi: available, amount: 5000 }]);
    }
  };

  // Retirer une SCPI (min 2)
  const removeSelection = (index: number) => {
    if (selections.length <= 2) return;
    setSelections((prev) => prev.filter((_, i) => i !== index));
  };

  // SCPI disponibles pour le dropdown
  const availableScpis = useMemo(() => {
    const usedIds = new Set(selections.map((s) => s.scpi.id));
    let list = scpiDataExtended.filter((s) => !usedIds.has(s.id));
    if (dropdownSearch.trim()) {
      const q = dropdownSearch.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [selections, dropdownSearch]);

  // Calculs
  const taxRate = useMemo(() => calculateTaxRate(tmi, mode), [tmi, mode]);
  const { results, total } = useMemo(
    () => computeResults(selections, tmi, mode),
    [selections, tmi, mode]
  );

  const chartData = useMemo(
    () => generateChartData(selections, duration, taxRate),
    [selections, duration, taxRate]
  );

  // Intégrer au rapport
  const handleAddToReport = () => {
    setSimulation({
      tmi,
      duration,
      mode,
      results: results.map((r) => ({
        scpiId: selections.find((s) => s.scpi.name === r.scpiName)?.scpi.id || 0,
        scpiName: r.scpiName,
        amount: r.amount,
        grossYield: r.grossYield,
        estimatedTax: r.estimatedTax,
        netYield: r.netYield,
        netAnnualIncome: r.netAnnualIncome,
      })),
    });
    setFeedback(true);
    setTimeout(() => setFeedback(false), 3000);
  };

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8 pb-10">
      {/* ── PARAMÈTRES CLIENT ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-5 flex items-center gap-2">
          <Calculator size={20} className="text-emerald-400" />
          Paramètres client
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TMI */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              TMI du client
            </label>
            <select
              value={tmi}
              onChange={(e) => updateTmi(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              {TMI_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Durée */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                Durée de détention : {duration} ans
              </span>
            </label>
            <input
              type="range"
              min={5}
              max={20}
              step={5}
              value={duration}
              onChange={(e) => updateDuration(Number(e.target.value))}
              className="w-full accent-emerald-500 h-2 rounded-lg appearance-none bg-slate-700 cursor-pointer"
            />
            <div className="flex justify-between mt-1">
              {DURATION_OPTIONS.map((y) => (
                <button
                  key={y}
                  onClick={() => updateDuration(y)}
                  className={`text-xs px-2 py-0.5 rounded transition ${
                    duration === y
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {y} ans
                </button>
              ))}
            </div>
          </div>

          {/* Mode d'investissement */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Mode d'investissement
            </label>
            <div className="flex rounded-lg border border-slate-700 overflow-hidden">
              {(['comptant', 'credit', 'demembrement'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => updateMode(m)}
                  className={`flex-1 py-2.5 text-xs font-medium transition ${
                    mode === m
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m === 'comptant' ? 'Comptant' : m === 'credit' ? 'Crédit' : 'Démembrement'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SÉLECTION MULTI-SCPI ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-400" />
            SCPI sélectionnées ({selections.length}/4)
          </h2>
          {selections.length < 4 && (
            <button
              onClick={addSelection}
              className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition font-medium"
            >
              <Plus size={16} />
              Ajouter une SCPI
            </button>
          )}
        </div>

        <div className="space-y-4">
          {selections.map((sel, index) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 group"
            >
              {/* Indice */}
              <span className="text-xs font-bold text-slate-500 bg-slate-900 rounded-full w-7 h-7 flex items-center justify-center shrink-0">
                {index + 1}
              </span>

              {/* Sélecteur SCPI */}
              <div className="relative min-w-0 flex-1">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 hover:border-slate-600 transition text-left"
                >
                  <span className="truncate">{sel.scpi.name}</span>
                  <span className="text-xs text-slate-500 shrink-0">{sel.scpi.yield}%</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-30 max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-slate-800">
                      <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={dropdownSearch}
                          onChange={(e) => setDropdownSearch(e.target.value)}
                          placeholder="Rechercher..."
                          className="w-full pl-7 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-48">
                      {availableScpis.slice(0, 20).map((scpi) => (
                        <button
                          key={scpi.id}
                          onClick={() => {
                            replaceScpi(index, scpi);
                            setDropdownSearch('');
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-800 transition"
                        >
                          <span className="text-slate-300 truncate">{scpi.name}</span>
                          <span className="text-emerald-400 font-medium shrink-0 ml-2">{scpi.yield}%</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Montant investi */}
              <div className="shrink-0 w-40">
                <div className="relative">
                  <Euro size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="number"
                    value={sel.amount}
                    onChange={(e) => updateAmount(index, Number(e.target.value))}
                    min={1000}
                    step={1000}
                    className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-right"
                  />
                </div>
              </div>

              {/* Retirer (si > 2) */}
              {selections.length > 2 && (
                <button
                  onClick={() => removeSelection(index)}
                  className="shrink-0 p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition opacity-0 group-hover:opacity-100"
                  title="Retirer cette SCPI"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Total investi */}
        <div className="mt-4 text-right">
          <span className="text-sm text-slate-400">
            Montant total :{' '}
            <span className="text-white font-bold text-lg">
              {selections.reduce((s, sel) => s + sel.amount, 0).toLocaleString('fr-FR')} €
            </span>
          </span>
        </div>
      </div>

      {/* ── RÉSULTATS ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Percent size={20} className="text-emerald-400" />
            Résultats de la simulation
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase tracking-wider text-slate-500 bg-slate-950/60">
              <tr>
                <th className="py-3 px-4">SCPI</th>
                <th className="py-3 px-4 text-right">Montant</th>
                <th className="py-3 px-4 text-right">Rendement brut</th>
                <th className="py-3 px-4 text-right">Fiscalité estimée</th>
                <th className="py-3 px-4 text-right">Rendement net</th>
                <th className="py-3 px-4 text-right">Revenus annuels nets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {results.map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-semibold text-slate-200">{row.scpiName}</td>
                  <td className="py-3 px-4 text-right">{row.amount.toLocaleString('fr-FR')} €</td>
                  <td className="py-3 px-4 text-right">{row.grossYield.toLocaleString('fr-FR')} €</td>
                  <td className="py-3 px-4 text-right text-amber-400">-{row.estimatedTax.toLocaleString('fr-FR')} €</td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-medium">{row.netYield}%</td>
                  <td className="py-3 px-4 text-right text-emerald-300 font-bold">{row.netAnnualIncome.toLocaleString('fr-FR')} €</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-950/80 border-t-2 border-slate-700">
                <td className="py-3 px-4 font-bold text-slate-100">TOTAL</td>
                <td className="py-3 px-4 text-right font-bold text-slate-100">
                  {total.amount.toLocaleString('fr-FR')} €
                </td>
                <td className="py-3 px-4 text-right font-bold text-slate-100">
                  {total.grossYield.toLocaleString('fr-FR')} €
                </td>
                <td className="py-3 px-4 text-right font-bold text-amber-400">
                  -{total.estimatedTax.toLocaleString('fr-FR')} €
                </td>
                <td className="py-3 px-4 text-right font-bold text-emerald-400">{total.netYield}%</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-300 text-lg">
                  {total.netAnnualIncome.toLocaleString('fr-FR')} €
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── GRAPHIQUE ÉVOLUTION ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">
          Évolution des revenus nets cumulés sur {duration} ans
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                }}
                formatter={(value: number) => [`${value.toLocaleString('fr-FR')} €`, undefined]}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
              />
              {selections.map((sel, i) => (
                <Line
                  key={sel.scpi.id}
                  type="monotone"
                  dataKey={sel.scpi.name}
                  stroke={colors[i % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
              <Line
                type="monotone"
                dataKey="Total"
                stroke="#fbbf24"
                strokeWidth={3}
                strokeDasharray="8 4"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── BOUTON INTÉGRER AU RAPPORT ── */}
      <div className="flex justify-center">
        <button
          onClick={handleAddToReport}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition shadow-lg ${
            feedback
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {feedback ? (
            <>
              <Check size={18} />
              Simulation ajoutée au rapport ✓
            </>
          ) : (
            <>
              <ArrowRight size={18} />
              Intégrer au rapport
            </>
          )}
        </button>
      </div>

      {/* ── DISCLAIMER ── */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
        <p className="text-xs text-slate-500 leading-relaxed">
          <strong className="text-slate-400">Avertissement :</strong> Les simulations sont fournies à titre indicatif.
          Les performances passées ne préjugent pas des performances futures. Les revenus distribués par les SCPI
          sont variables et peuvent évoluer à la hausse comme à la baisse. Le capital investi n'est pas garanti.
          La liquidité des parts de SCPI est limitée. Ce document constitue une aide à la décision et ne saurait
          être considéré comme un conseil en investissement personnalisé. L'investisseur est invité à prendre
          connaissance des Documents d'Information Clé (DIC) de chaque SCPI avant toute souscription.
        </p>
      </div>
    </div>
  );
}
