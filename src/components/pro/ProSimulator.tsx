import { useState, useMemo } from 'react';
import { useProReport } from '../../contexts/ProReportContext';
import { scpiDataExtended, SCPIExtended } from '../../data/scpiDataExtended';
import { getFavoriteScpiIds } from '../../utils/proFavorites';
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
import {
  Plus, X, Check, Calculator, TrendingUp, Percent, Euro, Clock, ArrowRight, Search,
  Landmark, Scale, Info,
} from 'lucide-react';

/* ── Constantes ── */
const TMI_OPTIONS = [
  { value: 0, label: '0% — Non imposable' },
  { value: 11, label: '11% — Tranche 1' },
  { value: 30, label: '30% — Tranche 2' },
  { value: 41, label: '41% — Tranche 3' },
  { value: 45, label: '45% — Tranche 4' },
];

const DURATION_OPTIONS = [5, 8, 10, 15, 20];
const CREDIT_DURATION_OPTIONS = [10, 15, 20, 25];
const DEMEMBREMENT_DURATION_OPTIONS = [5, 7, 8, 10, 12, 15];
const PRELEVEMENTS_SOCIAUX = 0.172;

/* ── Types ── */
interface ScpiSelection {
  scpi: SCPIExtended;
  allocation: number;
}

interface ScpiAllocationRow {
  scpiName: string;
  yield: number;
  price: number;
  minInvestment: number;
  allocation: number;
  parts: number;
  montantReel: number;
}

interface ResultRow {
  scpiName: string;
  allocation: number;
  montantReel: number;
  grossYield: number;
  estimatedTax: number;
  netAnnualIncome: number;
}

interface CreditResult {
  mensualiteHorsAssurance: number;
  mensualiteAssurance: number;
  mensualiteTotale: number;
  coutTotalCredit: number;
  revenusBrutsAnnuels: number;
  revenusNetsAnnuels: number;
  cashFlowMensuel: number;
  effortEpargneMensuel: number;
}

interface DemembrementResult {
  prixSouscription: number;
  decotePourcent: number;
  valeurPPTerme: number;
  gainLatent: number;
  revenusAnnuelsBruts: number;
  revenusCumules: number;
  rendementEconomique: number;
}

/* ── Clé de démembrement (articles 669 / 762 CGI simplifiés) ── */
const USUFRUIT_TABLE: Record<number, number> = {
  5: 0.20, 7: 0.28, 8: 0.32, 10: 0.40, 12: 0.48, 15: 0.60,
};

function getCleDemembrement(duree: number, type: 'nue-propriete' | 'usufruit'): number {
  const us = USUFRUIT_TABLE[duree] ?? 0.40;
  return type === 'usufruit' ? us : 1 - us;
}

/* ── Helpers financement ── */
function calcMensualite(capital: number, tauxAnnuel: number, dureeAns: number): number {
  const tauxMensuel = tauxAnnuel / 100 / 12;
  const n = dureeAns * 12;
  if (tauxMensuel === 0) return capital / n;
  return (capital * tauxMensuel * Math.pow(1 + tauxMensuel, n)) / (Math.pow(1 + tauxMensuel, n) - 1);
}

function calcTauxAssuranceMensuel(capital: number, tauxAssAnnuel: number): number {
  return (capital * (tauxAssAnnuel / 100)) / 12;
}

/* ── Calcul des parts ── */
function computeAllocation(allocation: number, price: number, minInvestment: number): { parts: number; montantReel: number } {
  if (price <= 0) return { parts: 0, montantReel: 0 };
  let parts = Math.floor(allocation / price);
  const minParts = minInvestment > 0 ? Math.ceil(minInvestment / price) : 0;
  if (parts < minParts) parts = 0;
  const montantReel = parts * price;
  return { parts, montantReel };
}

/* ── Composant ── */
export default function ProSimulator() {
  const { setSimulation } = useProReport();

  /* ─── Paramètres communs ─── */
  const [montantTotal, setMontantTotal] = useState<number>(() => {
    const stored = localStorage.getItem('pro_sim_montant');
    return stored ? Number(stored) : 50000;
  });
  const [tmi, setTmi] = useState<number>(() => {
    const stored = localStorage.getItem('pro_sim_tmi');
    return stored ? Number(stored) : 30;
  });
  const [duration, setDuration] = useState<number>(() => {
    const stored = localStorage.getItem('pro_sim_duration');
    return stored ? Number(stored) : 10;
  });
  const [mode, setMode] = useState<'comptant' | 'credit' | 'demembrement'>(() => {
    const stored = localStorage.getItem('pro_sim_mode');
    return (stored as any) || 'comptant';
  });

  /* ─── Paramètres crédit ─── */
  const [apport, setApport] = useState<number>(() => {
    const stored = localStorage.getItem('pro_sim_apport');
    return stored ? Number(stored) : 20000;
  });
  const [dureeCredit, setDureeCredit] = useState<number>(() => {
    const stored = localStorage.getItem('pro_sim_dureeCredit');
    return stored ? Number(stored) : 20;
  });
  const [tauxNominal, setTauxNominal] = useState<number>(() => {
    const stored = localStorage.getItem('pro_sim_tauxNominal');
    return stored ? Number(stored) : 3.5;
  });
  const [tauxAssurance, setTauxAssurance] = useState<number>(() => {
    const stored = localStorage.getItem('pro_sim_tauxAssurance');
    return stored ? Number(stored) : 0.36;
  });
  const [fraisGarantie, setFraisGarantie] = useState<number>(() => {
    const stored = localStorage.getItem('pro_sim_fraisGarantie');
    return stored ? Number(stored) : 1500;
  });
  const [fraisDossier, setFraisDossier] = useState<number>(() => {
    const stored = localStorage.getItem('pro_sim_fraisDossier');
    return stored ? Number(stored) : 1000;
  });
  const [differe, setDiffere] = useState<'aucun' | 'partiel' | 'total'>(() => {
    const stored = localStorage.getItem('pro_sim_differe');
    return (stored as any) || 'aucun';
  });
  const [dureeDiffere, setDureeDiffere] = useState<number>(() => {
    const stored = localStorage.getItem('pro_sim_dureeDiffere');
    return stored ? Number(stored) : 2;
  });

  /* ─── Paramètres démembrement ─── */
  const [typeDemembrement, setTypeDemembrement] = useState<'nue-propriete' | 'usufruit'>(() => {
    const stored = localStorage.getItem('pro_sim_typeDem');
    return (stored as any) || 'nue-propriete';
  });
  const [dureeDemembrement, setDureeDemembrement] = useState<number>(() => {
    const stored = localStorage.getItem('pro_sim_dureeDem');
    return stored ? Number(stored) : 10;
  });
  const [clePersonnalisee, setClePersonnalisee] = useState<number | null>(() => {
    const stored = localStorage.getItem('pro_sim_clePerso');
    return stored ? Number(stored) : null;
  });
  const [cleTouched, setCleTouched] = useState<boolean>(() => {
    return localStorage.getItem('pro_sim_cleTouched') === '1';
  });

  /* ─── Sélection SCPI ─── */
  const [selections, setSelections] = useState<ScpiSelection[]>(() => {
    const stored = localStorage.getItem('pro_sim_scpis');
    if (stored) {
      try {
        const ids: number[] = JSON.parse(stored);
        const found = ids.map((id) => scpiDataExtended.find((s) => s.id === id)).filter(Boolean) as SCPIExtended[];
        if (found.length >= 2) {
          const eq = Math.floor(montantTotal / found.length / 1000) * 1000;
          return found.map((s) => ({ scpi: s, allocation: eq }));
        }
      } catch {}
    }
    const eq = Math.floor(montantTotal / 2 / 1000) * 1000;
    return [
      { scpi: scpiDataExtended[0], allocation: eq },
      { scpi: scpiDataExtended[1] || scpiDataExtended[0], allocation: eq },
    ];
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [feedback, setFeedback] = useState(false);

  /* ─── Sélecteur SCPI (modal d'ajout) ─── */
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectorTab, setSelectorTab] = useState<'favorites' | 'all'>('favorites');
  const [selectorSearch, setSelectorSearch] = useState('');
  const [selectorChecked, setSelectorChecked] = useState<Set<number>>(new Set());
  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(new Set());

  /* ─── Persistance paramètres communs ─── */
  const updateMontantTotal = (v: number) => { setMontantTotal(Math.max(1000, v)); localStorage.setItem('pro_sim_montant', String(v)); };
  const updateTmi = (v: number) => { setTmi(v); localStorage.setItem('pro_sim_tmi', String(v)); };
  const updateDuration = (v: number) => { setDuration(v); localStorage.setItem('pro_sim_duration', String(v)); };
  const updateMode = (v: 'comptant' | 'credit' | 'demembrement') => { setMode(v); localStorage.setItem('pro_sim_mode', v); };

  /* ─── Priorité parts (entrée manuelle du CGP) ─── */
  const [partsOverrides, setPartsOverrides] = useState<Record<number, number>>({});

  const updateAllocation = (index: number, val: number) => {
    setSelections((prev) => prev.map((s, i) => (i === index ? { ...s, allocation: Math.max(1000, val) } : s)));
    setPartsOverrides((prev) => { const n = { ...prev }; delete n[index]; return n; });
  };

  const updateParts = (index: number, nb: number) => {
    const parts = Math.max(0, Math.round(nb));
    setSelections((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        const price = s.scpi.price;
        const alloc = price > 0 ? parts * price : s.allocation;
        return { ...s, allocation: alloc };
      }),
    );
    setPartsOverrides((prev) => ({ ...prev, [index]: parts }));
  };
  const updateCleDemembrement = (v: number) => {
    const clamped = Math.min(99, Math.max(1, Math.round(v)));
    setClePersonnalisee(clamped / 100);
    setCleTouched(true);
    localStorage.setItem('pro_sim_clePerso', String(clamped / 100));
    localStorage.setItem('pro_sim_cleTouched', '1');
  };
  const replaceScpi = (index: number, scpi: SCPIExtended) => {
    setSelections((prev) => prev.map((s, i) => (i === index ? { ...s, scpi } : s)));
    setPartsOverrides((prev) => { const n = { ...prev }; delete n[index]; return n; });
    setDropdownOpen(false);
  };
  const addSelection = () => {
    if (selections.length >= 6) return;
    const usedIds = new Set(selections.map((s) => s.scpi.id));
    const available = scpiDataExtended.find((s) => !usedIds.has(s.id));
    if (available) setSelections((prev) => [...prev, { scpi: available, allocation: 5000 }]);
  };
  const removeSelection = (index: number) => {
    if (selections.length <= 1) return;
    setSelections((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      persistScpis(updated);
      return updated;
    });
    setPartsOverrides((prev) => {
      const n: Record<number, number> = {};
      for (const [k, v] of Object.entries(prev)) {
        const ki = Number(k);
        if (ki < index) n[ki] = v;
        else if (ki > index) n[ki - 1] = v;
        // (ki === index => dropped)
      }
      return n;
    });
  };

  const toggleCheck = (index: number) => {
    setCheckedIndices((prev) => {
      if (index === -1) {
        // select-all / deselect-all
        if (prev.size === selections.length) return new Set<number>();
        return new Set(selections.map((_, i) => i));
      }
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const removeCheckedSelections = () => {
    if (checkedIndices.size === 0) return;
    const sorted = [...checkedIndices].sort((a, b) => b - a);
    setSelections((prev) => {
      let updated = [...prev];
      for (const idx of sorted) {
        updated = updated.filter((_, i) => i !== idx);
      }
      persistScpis(updated);
      return updated;
    });
    setPartsOverrides({});
    setCheckedIndices(new Set());
  };
  const persistScpis = (sel: ScpiSelection[]) => {
    localStorage.setItem('pro_sim_scpis', JSON.stringify(sel.map((s) => s.scpi.id)));
  };

  /* ─── Sélecteur : ajout multiple ─── */
  const addMultipleSelections = (ids: number[]) => {
    if (ids.length === 0) return;
    const usedIds = new Set(selections.map((s) => s.scpi.id));
    const newScpis = ids
      .filter((id) => !usedIds.has(id))
      .map((id) => scpiDataExtended.find((s) => s.id === id))
      .filter(Boolean) as SCPIExtended[];
    if (newScpis.length === 0) return;
    const prevLen = selections.length;
    const updated = [...selections, ...newScpis.map((s) => ({ scpi: s, allocation: 0 }))].slice(0, 6);
    setSelections(updated);
    // Conserver les overrides existants; les nouvelles lignes n'en ont pas
    if (updated.length > prevLen) {
      setPartsOverrides((prev) => ({ ...prev }));
    }
    persistScpis(updated);
  };

  /* ─── Répartition cash restant sur les SCPI à 0 € ─── */
  const repartirCashRestant = () => {
    const zeroIndices = selections
      .map((s, i) => (s.allocation === 0 ? i : -1))
      .filter((i) => i >= 0);
    if (zeroIndices.length === 0 || cashRestant <= 0) return;
    const each = Math.floor(cashRestant / zeroIndices.length / 1000) * 1000;
    if (each < 1000) return;
    setSelections((prev) =>
      prev.map((s, i) => (zeroIndices.includes(i) ? { ...s, allocation: each } : s)),
    );
    setPartsOverrides((prev) => {
      const n = { ...prev };
      zeroIndices.forEach((i) => delete n[i]);
      return n;
    });
  };

  const availableScpis = useMemo(() => {
    const usedIds = new Set(selections.map((s) => s.scpi.id));
    let list = scpiDataExtended.filter((s) => !usedIds.has(s.id));
    if (dropdownSearch.trim()) {
      const q = dropdownSearch.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [selections, dropdownSearch]);

  /* ─── Calculs allocation / parts ─── */
  const allocationRows: ScpiAllocationRow[] = useMemo(() => {
    return selections.map((sel, i) => {
      const hasOverride = partsOverrides[i] !== undefined;
      const parts = hasOverride ? partsOverrides[i] : computeAllocation(sel.allocation, sel.scpi.price, sel.scpi.minInvestment).parts;
      const montantReel = parts * sel.scpi.price;
      return {
        scpiName: sel.scpi.name,
        yield: sel.scpi.yield,
        price: sel.scpi.price,
        minInvestment: sel.scpi.minInvestment,
        allocation: sel.allocation,
        parts,
        montantReel,
      };
    });
  }, [selections, partsOverrides]);

  const totalMontantReel = allocationRows.reduce((s, r) => s + r.montantReel, 0);
  const totalAllocation = allocationRows.reduce((s, r) => s + r.allocation, 0);
  const cashRestant = montantTotal - totalMontantReel;

  /* ─── Résultats revenus ─── */
  const results: ResultRow[] = useMemo(() => {
    let taxRate: number;
    if (mode === 'demembrement' && typeDemembrement === 'nue-propriete') {
      taxRate = 0; // NP : pas de revenus
    } else if (mode === 'demembrement') {
      taxRate = tmi / 100 + PRELEVEMENTS_SOCIAUX;
    } else if (mode === 'credit') {
      taxRate = (tmi / 100 + PRELEVEMENTS_SOCIAUX) * 0.7;
    } else {
      taxRate = (tmi / 100 + PRELEVEMENTS_SOCIAUX) * 0.95;
    }
    return allocationRows.map((r) => {
      const gross = (r.yield / 100) * r.montantReel;
      const tax = mode === 'demembrement' && typeDemembrement === 'nue-propriete' ? 0 : gross * taxRate;
      return {
        scpiName: r.scpiName,
        allocation: r.allocation,
        montantReel: r.montantReel,
        grossYield: Math.round(gross),
        estimatedTax: Math.round(tax),
        netAnnualIncome: Math.round(gross - tax),
      };
    });
  }, [allocationRows, tmi, mode, typeDemembrement]);

  const totalGross = results.reduce((s, r) => s + r.grossYield, 0);
  const totalTax = results.reduce((s, r) => s + r.estimatedTax, 0);
  const totalNet = totalGross - totalTax;
  const rendementNet = totalMontantReel > 0 ? Math.round((totalNet / totalMontantReel) * 10000) / 100 : 0;

  /* ─── Calculs crédit ─── */
  const creditResult: CreditResult | null = useMemo(() => {
    if (mode !== 'credit') return null;
    const finance = montantTotal - apport;
    const mHa = calcMensualite(finance, tauxNominal, dureeCredit);
    const mAss = calcTauxAssuranceMensuel(finance, tauxAssurance);
    const mTotale = mHa + mAss;
    const coutTotal = mTotale * dureeCredit * 12 - finance + fraisGarantie + fraisDossier;
    // si différé partiel/total, les 2 premières années: l'assurance reste due
    // différé total => pas de mensualité hors assurance pdt différé; différé partiel => que les intérêts
    let mHaEffective = mHa;
    let mTotaleEffective = mTotale;
    const differeMois = dureeDiffere * 12;
    if (differe === 'total') {
      mHaEffective = finance * (tauxNominal / 100) / 12; // intérêts seuls en différé total ? Non, total = rien
      // Simplification : différé total = 0 mensualité hors assurance pdt différé
    }
    const revenusBruts = totalGross;
    // Pendant le différé, les SCPI paient quand même leurs loyers
    const revenusNets = mode === 'demembrement' && typeDemembrement === 'nue-propriete' ? 0 : totalNet;
    const cashFlowMensuel = Math.round((revenusNets / 12) - mTotale);
    const effortMensuel = mTotale - (revenusNets / 12);
    return {
      mensualiteHorsAssurance: Math.round(mHa),
      mensualiteAssurance: Math.round(mAss),
      mensualiteTotale: Math.round(mTotale),
      coutTotalCredit: Math.round(coutTotal),
      revenusBrutsAnnuels: revenusBruts,
      revenusNetsAnnuels: revenusNets,
      cashFlowMensuel,
      effortEpargneMensuel: Math.round(effortMensuel > 0 ? effortMensuel : 0),
    };
  }, [mode, montantTotal, apport, tauxNominal, dureeCredit, tauxAssurance, fraisGarantie, fraisDossier, differe, dureeDiffere, totalGross, totalNet, typeDemembrement]);

  /* ─── Calculs démembrement ─── */
  const demembrementResult: DemembrementResult | null = useMemo(() => {
    if (mode !== 'demembrement') return null;
    const cleBrute = clePersonnalisee ?? getCleDemembrement(dureeDemembrement, typeDemembrement);
    const cle = Math.min(0.99, Math.max(0.01, cleBrute)); // clamp 1-99%
    const montantInvesti = totalMontantReel > 0 ? totalMontantReel : montantTotal;
    const prixSouscription = Math.round(montantInvesti * cle);
    const decote = Math.round((1 - cle) * 100);
    const valeurPPTerme = montantInvesti;
    const gainLatent = Math.round(valeurPPTerme - prixSouscription);
    const revenusAnnuelsBruts = typeDemembrement === 'usufruit' ? totalGross : 0;
    const revenusCumules = Math.round(revenusAnnuelsBruts * dureeDemembrement);
    const rendementEco = prixSouscription > 0
      ? Math.round(((typeDemembrement === 'nue-propriete' ? gainLatent : revenusCumules) / prixSouscription) * 10000) / 100
      : 0;
    return {
      prixSouscription,
      decotePourcent: decote,
      valeurPPTerme,
      gainLatent,
      revenusAnnuelsBruts,
      revenusCumules,
      rendementEconomique: rendementEco,
    };
  }, [mode, dureeDemembrement, typeDemembrement, clePersonnalisee, totalMontantReel, montantTotal, totalGross, totalNet]);

  /* ─── Graphique ─── */
  const chartData = useMemo(() => {
    if (mode === 'demembrement' && typeDemembrement === 'nue-propriete') return [];
    const years = Array.from({ length: duration + 1 }, (_, i) => i);
    return years.map((year) => {
      const entry: any = { year: `Année ${year}` };
      let totalRev = 0;
      results.forEach((r) => {
        const cumulative = r.netAnnualIncome * year;
        entry[r.scpiName] = cumulative;
        totalRev += cumulative;
      });
      entry['Total'] = totalRev;
      return entry;
    });
  }, [results, duration, mode, typeDemembrement]);

  /* ─── Intégrer au rapport ─── */
  const handleAddToReport = () => {
    setSimulation({
      tmi,
      duration,
      mode,
      montantTotal,
      results: results.map((r) => ({
        scpiId: selections.find((s) => s.scpi.name === r.scpiName)?.scpi.id || 0,
        scpiName: r.scpiName,
        amount: r.montantReel,
        grossYield: r.grossYield,
        estimatedTax: r.estimatedTax,
        netYield: rendementNet,
        netAnnualIncome: r.netAnnualIncome,
      })),
    });
    setFeedback(true);
    setTimeout(() => setFeedback(false), 3000);
  };

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  /* ─── JSX ─── */
  return (
    <div className="space-y-8 pb-10">
      {/* ═══════════════════════════════════════
          PARAMÈTRES CLIENT
          ═══════════════════════════════════════ */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-5 flex items-center gap-2">
          <Calculator size={20} className="text-emerald-400" />
          Paramètres client
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Montant total */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Montant total à investir
            </label>
            <div className="relative">
              <Euro size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="number"
                value={montantTotal}
                onChange={(e) => updateMontantTotal(Number(e.target.value))}
                min={1000}
                step={5000}
                className="w-full pl-8 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-right"
              />
            </div>
          </div>

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
                <option key={opt.value} value={opt.value}>{opt.label}</option>
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
              step={1}
              value={duration}
              onChange={(e) => updateDuration(Number(e.target.value))}
              className="w-full accent-emerald-500 h-2 rounded-lg appearance-none bg-slate-700 cursor-pointer"
            />
            <div className="flex justify-between mt-1 flex-wrap gap-1">
              {DURATION_OPTIONS.map((y) => (
                <button
                  key={y}
                  onClick={() => updateDuration(y)}
                  className={`text-xs px-2 py-0.5 rounded transition ${
                    duration === y ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >{y} ans</button>
              ))}
            </div>
          </div>

          {/* Mode */}
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

      {/* ═══════════════════════════════════════
          HYPOTHÈSES COMPTANT
          ═══════════════════════════════════════ */}
      {mode === 'comptant' && (
        <HypothesesComptant
          allocations={allocationRows}
          montantTotal={montantTotal}
          cashRestant={cashRestant}
          onAllocationChange={updateAllocation}
          selections={selections}
          onReplaceScpi={replaceScpi}
          onAdd={addSelection}
          onRemove={removeSelection}
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
          dropdownSearch={dropdownSearch}
          setDropdownSearch={setDropdownSearch}
          availableScpis={availableScpis}
          persistScpis={persistScpis}
          onOpenSelector={() => { setSelectorOpen(true); setSelectorChecked(new Set()); setSelectorSearch(''); setSelectorTab('favorites'); }}
          hasZeroAllocation={selections.some((s) => s.allocation === 0)}
          onRepartirCashRestant={repartirCashRestant}
          onPartsChange={updateParts}
          checkedIndices={checkedIndices}
          onToggleCheck={toggleCheck}
          onRemoveChecked={removeCheckedSelections}
        />
      )}

      {/* ═══════════════════════════════════════
          HYPOTHÈSES DE FINANCEMENT (CRÉDIT)
          ═══════════════════════════════════════ */}
      {mode === 'credit' && (
        <HypothesesCredit
          apport={apport}
          setApport={(v) => { setApport(v); localStorage.setItem('pro_sim_apport', String(v)); }}
          montantTotal={montantTotal}
          dureeCredit={dureeCredit}
          setDureeCredit={(v) => { setDureeCredit(v); localStorage.setItem('pro_sim_dureeCredit', String(v)); }}
          tauxNominal={tauxNominal}
          setTauxNominal={(v) => { setTauxNominal(v); localStorage.setItem('pro_sim_tauxNominal', String(v)); }}
          tauxAssurance={tauxAssurance}
          setTauxAssurance={(v) => { setTauxAssurance(v); localStorage.setItem('pro_sim_tauxAssurance', String(v)); }}
          fraisGarantie={fraisGarantie}
          setFraisGarantie={(v) => { setFraisGarantie(v); localStorage.setItem('pro_sim_fraisGarantie', String(v)); }}
          fraisDossier={fraisDossier}
          setFraisDossier={(v) => { setFraisDossier(v); localStorage.setItem('pro_sim_fraisDossier', String(v)); }}
          differe={differe}
          setDiffere={(v) => { setDiffere(v); localStorage.setItem('pro_sim_differe', v); }}
          dureeDiffere={dureeDiffere}
          setDureeDiffere={(v) => { setDureeDiffere(v); localStorage.setItem('pro_sim_dureeDiffere', String(v)); }}
          allocations={allocationRows}
          cashRestant={cashRestant}
          onAllocationChange={updateAllocation}
          selections={selections}
          onReplaceScpi={replaceScpi}
          onAdd={addSelection}
          onRemove={removeSelection}
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
          dropdownSearch={dropdownSearch}
          setDropdownSearch={setDropdownSearch}
          availableScpis={availableScpis}
          persistScpis={persistScpis}
          onOpenSelector={() => { setSelectorOpen(true); setSelectorChecked(new Set()); setSelectorSearch(''); setSelectorTab('favorites'); }}
          hasZeroAllocation={selections.some((s) => s.allocation === 0)}
          onRepartirCashRestant={repartirCashRestant}
          onPartsChange={updateParts}
          checkedIndices={checkedIndices}
          onToggleCheck={toggleCheck}
          onRemoveChecked={removeCheckedSelections}
        />
      )}

      {/* ═══════════════════════════════════════
          HYPOTHÈSES DE DÉMEMBREMENT
          ═══════════════════════════════════════ */}
      {mode === 'demembrement' && (
        <HypothesesDemembrement
          typeDemembrement={typeDemembrement}
          setTypeDemembrement={(v) => { setTypeDemembrement(v); localStorage.setItem('pro_sim_typeDem', v); }}
          dureeDemembrement={dureeDemembrement}
          setDureeDemembrement={(v) => {
            setDureeDemembrement(v);
            localStorage.setItem('pro_sim_dureeDem', String(v));
            if (!cleTouched) {
              setClePersonnalisee(null);
              localStorage.removeItem('pro_sim_clePerso');
              localStorage.removeItem('pro_sim_cleTouched');
            }
          }}
          clePersonnalisee={clePersonnalisee}
          onCleChange={updateCleDemembrement}
          montantTotal={montantTotal}
          allocations={allocationRows}
          cashRestant={cashRestant}
          onAllocationChange={updateAllocation}
          selections={selections}
          onReplaceScpi={replaceScpi}
          onAdd={addSelection}
          onRemove={removeSelection}
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
          dropdownSearch={dropdownSearch}
          setDropdownSearch={setDropdownSearch}
          availableScpis={availableScpis}
          persistScpis={persistScpis}
          onOpenSelector={() => { setSelectorOpen(true); setSelectorChecked(new Set()); setSelectorSearch(''); setSelectorTab('favorites'); }}
          hasZeroAllocation={selections.some((s) => s.allocation === 0)}
          onRepartirCashRestant={repartirCashRestant}
          onPartsChange={updateParts}
          checkedIndices={checkedIndices}
          onToggleCheck={toggleCheck}
          onRemoveChecked={removeCheckedSelections}
        />
      )}

      {/* ═══════════════════════════════════════
          ALLOCATION RÉELLE
          ═══════════════════════════════════════ */}
      <AllocationReelle
        rows={allocationRows}
        totalMontantReel={totalMontantReel}
        cashRestant={cashRestant}
        onPartsChange={updateParts}
        onRemove={removeSelection}
      />

      {/* ═══════════════════════════════════════
          RÉSULTATS DE SIMULATION
          ═══════════════════════════════════════ */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Percent size={20} className="text-emerald-400" />
            Résultats de simulation
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase tracking-wider text-slate-500 bg-slate-950/60">
              <tr>
                <th className="py-3 px-4">SCPI</th>
                <th className="py-3 px-4 text-right">Alloc. cible</th>
                <th className="py-3 px-4 text-right">Montant réel</th>
                <th className="py-3 px-4 text-right">Revenu brut</th>
                <th className="py-3 px-4 text-right">Fiscalité</th>
                <th className="py-3 px-4 text-right">Revenu annuel net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {results.map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-semibold text-slate-200">{row.scpiName}</td>
                  <td className="py-3 px-4 text-right">{row.allocation.toLocaleString('fr-FR')} €</td>
                  <td className="py-3 px-4 text-right">{row.montantReel.toLocaleString('fr-FR')} €</td>
                  <td className="py-3 px-4 text-right">{row.grossYield.toLocaleString('fr-FR')} €</td>
                  <td className="py-3 px-4 text-right text-amber-400">-{row.estimatedTax.toLocaleString('fr-FR')} €</td>
                  <td className="py-3 px-4 text-right text-emerald-300 font-bold">{row.netAnnualIncome.toLocaleString('fr-FR')} €</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-950/80 border-t-2 border-slate-700">
                <td className="py-3 px-4 font-bold text-slate-100">TOTAL</td>
                <td className="py-3 px-4 text-right font-bold text-slate-100">{totalAllocation.toLocaleString('fr-FR')} €</td>
                <td className="py-3 px-4 text-right font-bold text-slate-100">{totalMontantReel.toLocaleString('fr-FR')} €</td>
                <td className="py-3 px-4 text-right font-bold text-slate-100">{totalGross.toLocaleString('fr-FR')} €</td>
                <td className="py-3 px-4 text-right font-bold text-amber-400">-{totalTax.toLocaleString('fr-FR')} €</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-300 text-lg">{totalNet.toLocaleString('fr-FR')} €</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="p-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div><span className="text-xs text-slate-500">Montant investi réel</span><p className="text-lg font-bold text-white">{totalMontantReel.toLocaleString('fr-FR')} €</p></div>
          <div><span className="text-xs text-slate-500">Cash restant</span><p className="text-lg font-bold text-amber-400">{cashRestant.toLocaleString('fr-FR')} €</p></div>
          <div><span className="text-xs text-slate-500">Rendement net indicatif</span><p className="text-lg font-bold text-emerald-400">{rendementNet} %</p></div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          RÉSULTAT SPÉCIFIQUE CRÉDIT
          ═══════════════════════════════════════ */}
      {creditResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Landmark size={20} className="text-emerald-400" />
              Résultat crédit
            </h2>
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-5">
            <div><span className="text-xs text-slate-500">Montant financé</span><p className="text-lg font-bold text-white">{(montantTotal - apport).toLocaleString('fr-FR')} €</p></div>
            <div><span className="text-xs text-slate-500">Mensualité estimée</span><p className="text-lg font-bold text-white">{creditResult.mensualiteTotale.toLocaleString('fr-FR')} €<span className="text-xs text-slate-500 font-normal"> /mois</span></p></div>
            <div><span className="text-xs text-slate-500">Revenus mensuels nets SCPI</span><p className="text-lg font-bold text-emerald-400">{Math.round(creditResult.revenusNetsAnnuels / 12).toLocaleString('fr-FR')} €</p></div>
            <div><span className="text-xs text-slate-500">Cash-flow mensuel</span><p className={`text-lg font-bold ${creditResult.cashFlowMensuel >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{creditResult.cashFlowMensuel.toLocaleString('fr-FR')} €</p></div>
            <div><span className="text-xs text-slate-500">Effort d'épargne</span><p className="text-lg font-bold text-amber-400">{creditResult.effortEpargneMensuel.toLocaleString('fr-FR')} €<span className="text-xs text-slate-500 font-normal"> /mois</span></p></div>
            <div><span className="text-xs text-slate-500">Coût total crédit</span><p className="text-lg font-bold text-red-400">{creditResult.coutTotalCredit.toLocaleString('fr-FR')} €</p></div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          RÉSULTAT SPÉCIFIQUE DÉMEMBREMENT
          ═══════════════════════════════════════ */}
      {demembrementResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Scale size={20} className="text-emerald-400" />
              Résultat démembrement — {typeDemembrement === 'nue-propriete' ? 'Nue-propriété' : 'Usufruit'}
            </h2>
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-5">
            <div><span className="text-xs text-slate-500">Type</span><p className="text-lg font-bold text-white">{typeDemembrement === 'nue-propriete' ? 'Nue-propriété' : 'Usufruit temporaire'}</p></div>
            <div><span className="text-xs text-slate-500">Durée</span><p className="text-lg font-bold text-white">{dureeDemembrement} ans</p></div>
            <div><span className="text-xs text-slate-500">Clé appliquée</span><p className="text-lg font-bold text-emerald-400">{Math.round(getCleDemembrement(dureeDemembrement, typeDemembrement) * 100)} %</p></div>
            <div><span className="text-xs text-slate-500">Montant réel souscrit</span><p className="text-lg font-bold text-white">{demembrementResult.prixSouscription.toLocaleString('fr-FR')} €</p></div>
            <div><span className="text-xs text-slate-500">Valeur PP théorique</span><p className="text-lg font-bold text-slate-300">{demembrementResult.valeurPPTerme.toLocaleString('fr-FR')} €</p></div>
            {typeDemembrement === 'nue-propriete' ? (
              <>
                <div><span className="text-xs text-slate-500">Décote économique</span><p className="text-lg font-bold text-emerald-400">{demembrementResult.decotePourcent} %</p></div>
                <div><span className="text-xs text-slate-500">Gain latent à terme</span><p className="text-lg font-bold text-emerald-400">{demembrementResult.gainLatent.toLocaleString('fr-FR')} €</p></div>
                <div><span className="text-xs text-slate-500">Revenus pendant la période</span><p className="text-lg font-bold text-slate-500">0 €</p></div>
              </>
            ) : (
              <>
                <div><span className="text-xs text-slate-500">Revenus annuels bruts</span><p className="text-lg font-bold text-emerald-400">{demembrementResult.revenusAnnuelsBruts.toLocaleString('fr-FR')} €</p></div>
                <div><span className="text-xs text-slate-500">Revenus cumulés estimés</span><p className="text-lg font-bold text-emerald-400">{demembrementResult.revenusCumules.toLocaleString('fr-FR')} €</p></div>
                <div><span className="text-xs text-slate-500">Rendement économique</span><p className="text-lg font-bold text-emerald-400">{demembrementResult.rendementEconomique} %</p></div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          GRAPHIQUE ÉVOLUTION
          ═══════════════════════════════════════ */}
      {chartData.length > 0 && (
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
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
                  formatter={(value: number) => [`${value.toLocaleString('fr-FR')} €`, undefined]}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                {results.map((_r, i) => (
                  <Line
                    key={i}
                    type="monotone"
                    dataKey={results[i].scpiName}
                    stroke={colors[i % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
                <Line type="monotone" dataKey="Total" stroke="#fbbf24" strokeWidth={3} strokeDasharray="8 4" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          BOUTON INTÉGRER AU RAPPORT
          ═══════════════════════════════════════ */}
      <div className="flex justify-center">
        <button
          onClick={handleAddToReport}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition shadow-lg ${
            feedback ? 'bg-emerald-600 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {feedback ? (
            <><Check size={18} />Simulation ajoutée au rapport ✓</>
          ) : (
            <><ArrowRight size={18} />Intégrer au rapport</>
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════
          DISCLAIMER
          ═══════════════════════════════════════ */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
        <div className="flex items-start gap-2.5">
          <Info size={16} className="text-slate-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed">
            Outil d'aide à la simulation. Les résultats sont indicatifs et ne constituent pas une recommandation personnalisée.
            Les performances passées ne préjugent pas des performances futures. Le capital investi n'est pas garanti.
            La liquidité des parts de SCPI est limitée.
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          PANEL DE SÉLECTION SCPI
          ═══════════════════════════════════════ */}
      {selectorOpen && (
        <ScpiSelectorPanel
          tab={selectorTab}
          onChangeTab={setSelectorTab}
          search={selectorSearch}
          setSearch={setSelectorSearch}
          checked={selectorChecked}
          setChecked={setSelectorChecked}
          usedIds={new Set(selections.map((s) => s.scpi.id))}
          onClose={() => { setSelectorOpen(false); setSelectorChecked(new Set()); }}
          onAddSelection={addMultipleSelections}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────
   Sous-composants
   ────────────────────────────────────────── */

/** Props communes pour les champs de sélection SCPI */
interface ScpiSelectProps {
  allocations: ScpiAllocationRow[];
  cashRestant: number;
  onAllocationChange: (index: number, val: number) => void;
  onPartsChange: (index: number, parts: number) => void;
  selections: ScpiSelection[];
  onReplaceScpi: (index: number, scpi: SCPIExtended) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  dropdownOpen: boolean;
  setDropdownOpen: (v: boolean) => void;
  dropdownSearch: string;
  setDropdownSearch: (v: string) => void;
  availableScpis: SCPIExtended[];
  persistScpis: (sel: ScpiSelection[]) => void;
  onOpenSelector?: () => void;
  hasZeroAllocation?: boolean;
  onRepartirCashRestant?: () => void;
  checkedIndices?: Set<number>;
  onToggleCheck?: (index: number) => void;
  onRemoveChecked?: () => void;
}

function ScpiSelectorBlock(props: ScpiSelectProps & { title: string; icon: React.ReactNode }) {
  const {
    allocations, cashRestant, onAllocationChange, onPartsChange,
    selections,
    onOpenSelector, hasZeroAllocation, onRepartirCashRestant,
    checkedIndices, onToggleCheck, onRemoveChecked,
    title, icon,
  } = props;

  const hasChecked = (checkedIndices?.size ?? 0) > 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          {icon}
          {title} ({selections.length}/6)
        </h2>
        <div className="flex items-center gap-2">
          <button
            disabled={selections.length >= 6}
            onClick={() => onOpenSelector?.()}
            className={`flex items-center gap-1.5 text-sm font-medium transition ${
              selections.length >= 6
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-emerald-400 hover:text-emerald-300'
            }`}
            title={selections.length >= 6 ? 'Maximum 6 SCPI atteint' : 'Ajouter une SCPI'}
          >
            <Plus size={16} /> Ajouter une SCPI
          </button>
          {selections.length > 1 && (
            <button
              disabled={!hasChecked}
              onClick={() => onRemoveChecked?.()}
              className={`flex items-center gap-1.5 text-xs font-medium transition ${
                !hasChecked
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-red-400 hover:text-red-300'
              }`}
              title={!hasChecked ? 'Cochez au moins une SCPI à retirer' : 'Retirer les SCPI cochées'}
            >
              <X size={14} /> Retirer sélection
            </button>
          )}
          {hasZeroAllocation && (
            <button
              onClick={() => onRepartirCashRestant?.()}
              className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition font-medium"
            >
              Répartir le cash restant
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase tracking-wider text-slate-500 bg-slate-950/40">
            <tr>
              <th className="py-2.5 px-2 w-8">
                <input
                  type="checkbox"
                  checked={hasChecked && checkedIndices!.size === selections.length}
                  onChange={() => {
                    if (checkedIndices!.size === selections.length) {
                      onToggleCheck?.( -1); // special: deselect all
                    } else {
                      selections.forEach((_, i) => onToggleCheck?.(i));
                    }
                  }}
                  className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-emerald-500 accent-emerald-500"
                />
              </th>
              <th className="py-2.5 px-3">SCPI</th>
              <th className="py-2.5 px-3 text-right">Rendt</th>
              <th className="py-2.5 px-3 text-right">Prix part</th>
              <th className="py-2.5 px-3 text-right">Min.</th>
              <th className="py-2.5 px-3 text-right">Alloc. €</th>
              <th className="py-2.5 px-3 text-right">Parts</th>
              <th className="py-2.5 px-3 text-right">Montant réel</th>
              <th className="py-2.5 px-3 text-right">Écart</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {allocations.map((row, i) => {
              const ecart = row.allocation - row.montantReel;
              const isChecked = checkedIndices?.has(i) ?? false;
              return (
                <tr key={i} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleCheck?.(i)}
                      className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-emerald-500 accent-emerald-500"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px] block">{row.scpiName}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 text-xs">{row.yield}%</td>
                  <td className="py-2.5 px-3 text-right text-slate-400 text-xs">{row.price.toLocaleString('fr-FR')} €</td>
                  <td className="py-2.5 px-3 text-right text-slate-500 text-xs">{row.minInvestment > 0 ? `${row.minInvestment.toLocaleString('fr-FR')} €` : '—'}</td>
                  <td className="py-2.5 px-3 text-right">
                    <input
                      type="number"
                      value={row.allocation}
                      onChange={(e) => onAllocationChange(i, Number(e.target.value))}
                      min={1000}
                      step={1000}
                      className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <input
                      type="number"
                      value={row.parts}
                      onChange={(e) => onPartsChange(i, Number(e.target.value))}
                      min={0}
                      step={1}
                      className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-right text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right text-white text-xs">{row.montantReel.toLocaleString('fr-FR')} €</td>
                  <td className={`py-2.5 px-3 text-right text-xs ${ecart >= 0 ? 'text-slate-500' : 'text-red-400'}`}>{ecart > 0 ? `+${ecart.toLocaleString('fr-FR')} €` : ecart === 0 ? '0 €' : `${ecart.toLocaleString('fr-FR')} €`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-between text-xs text-slate-400">
        <span>Cash restant : <span className="text-amber-400 font-bold">{cashRestant.toLocaleString('fr-FR')} €</span></span>
        <span>Total souscrit : <span className="text-emerald-400 font-bold">{allocations.reduce((s, r) => s + r.montantReel, 0).toLocaleString('fr-FR')} €</span></span>
      </div>
    </div>
  );
}

function HypothesesComptant(props: ScpiSelectProps & { montantTotal: number }) {
  return (
    <ScpiSelectorBlock
      {...props}
      title="Allocation SCPI"
      icon={<TrendingUp size={20} className="text-emerald-400" />}
    />
  );
}

function HypothesesCredit(props: ScpiSelectProps & {
  apport: number; setApport: (v: number) => void;
  montantTotal: number;
  dureeCredit: number; setDureeCredit: (v: number) => void;
  tauxNominal: number; setTauxNominal: (v: number) => void;
  tauxAssurance: number; setTauxAssurance: (v: number) => void;
  fraisGarantie: number; setFraisGarantie: (v: number) => void;
  fraisDossier: number; setFraisDossier: (v: number) => void;
  differe: string; setDiffere: (v: 'aucun' | 'partiel' | 'total') => void;
  dureeDiffere: number; setDureeDiffere: (v: number) => void;
}) {
  const { apport, setApport, montantTotal, dureeCredit, setDureeCredit, tauxNominal, setTauxNominal, tauxAssurance, setTauxAssurance, fraisGarantie, setFraisGarantie, fraisDossier, setFraisDossier, differe, setDiffere, dureeDiffere, setDureeDiffere } = props;
  const finance = montantTotal - apport;

  return (
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-5 flex items-center gap-2">
          <Landmark size={20} className="text-emerald-400" />
          Hypothèses de financement
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Apport personnel</label>
            <div className="relative">
              <Euro size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="number" value={apport} onChange={(e) => setApport(Number(e.target.value))} min={0} step={5000} className="w-full pl-8 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Montant financé</label>
            <p className="px-3 py-2.5 text-sm text-white font-semibold">{finance.toLocaleString('fr-FR')} €</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Durée du crédit</label>
            <div className="flex gap-1 flex-wrap">
              {CREDIT_DURATION_OPTIONS.map((y) => (
                <button key={y} onClick={() => setDureeCredit(y)} className={`text-xs px-2.5 py-1.5 rounded transition ${dureeCredit === y ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>{y} ans</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Taux nominal annuel (%)</label>
            <input type="number" value={tauxNominal} onChange={(e) => setTauxNominal(Number(e.target.value))} min={0} max={10} step={0.1} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Assurance emprunteur (%/an)</label>
            <input type="number" value={tauxAssurance} onChange={(e) => setTauxAssurance(Number(e.target.value))} min={0} max={2} step={0.01} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Frais de garantie</label>
            <div className="relative">
              <Euro size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="number" value={fraisGarantie} onChange={(e) => setFraisGarantie(Number(e.target.value))} min={0} step={100} className="w-full pl-8 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Frais de dossier</label>
            <div className="relative">
              <Euro size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="number" value={fraisDossier} onChange={(e) => setFraisDossier(Number(e.target.value))} min={0} step={100} className="w-full pl-8 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Différé</label>
            <select value={differe} onChange={(e) => setDiffere(e.target.value as any)} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="aucun">Aucun</option>
              <option value="partiel">Partiel</option>
              <option value="total">Total</option>
            </select>
          </div>
          {differe !== 'aucun' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Durée du différé</label>
              <select value={dureeDiffere} onChange={(e) => setDureeDiffere(Number(e.target.value))} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {[1, 2, 3, 5].map((y) => <option key={y} value={y}>{y} an{y > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      <ScpiSelectorBlock
        {...props}
        title="Allocation SCPI (crédit)"
        icon={<TrendingUp size={20} className="text-emerald-400" />}
      />
    </>
  );
}

function HypothesesDemembrement(props: ScpiSelectProps & {
  typeDemembrement: 'nue-propriete' | 'usufruit';
  setTypeDemembrement: (v: 'nue-propriete' | 'usufruit') => void;
  dureeDemembrement: number;
  setDureeDemembrement: (v: number) => void;
  clePersonnalisee: number | null;
  onCleChange: (v: number) => void;
  montantTotal: number;
}) {
  const { typeDemembrement, setTypeDemembrement, dureeDemembrement, setDureeDemembrement, clePersonnalisee, onCleChange, montantTotal } = props;
  const cleDefaut = getCleDemembrement(dureeDemembrement, typeDemembrement);
  const cleEffective = clePersonnalisee ?? cleDefaut;
  const clePct = Math.round(cleEffective * 100);
  const prixDemembre = Math.round(montantTotal * cleEffective);

  const labelCle = typeDemembrement === 'nue-propriete' ? 'Clé nue-propriété (%)' : 'Clé usufruit (%)';
  const CLE_RAPIDE = [40, 50, 60, 65, 70, 75, 80];

  return (
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-5 flex items-center gap-2">
          <Scale size={20} className="text-emerald-400" />
          Hypothèses de démembrement
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Type</label>
            <div className="flex rounded-lg border border-slate-700 overflow-hidden">
              {(['nue-propriete', 'usufruit'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeDemembrement(t)}
                  className={`flex-1 py-2.5 text-xs font-medium transition ${typeDemembrement === t ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  {t === 'nue-propriete' ? 'Nue-propriété' : 'Usufruit'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Durée</label>
            <div className="flex gap-1 flex-wrap">
              {DEMEMBREMENT_DURATION_OPTIONS.map((y) => (
                <button key={y} onClick={() => setDureeDemembrement(y)} className={`text-xs px-2.5 py-1.5 rounded transition ${dureeDemembrement === y ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>{y} ans</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{labelCle}</label>
            <input
              type="number"
              value={clePct}
              onChange={(e) => onCleChange(Number(e.target.value))}
              min={1}
              max={99}
              step={1}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-emerald-400 font-bold text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {CLE_RAPIDE.map((pct) => (
                <button
                  key={pct}
                  onClick={() => onCleChange(pct)}
                  className={`text-[10px] px-1.5 py-0.5 rounded transition ${clePct === pct ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >{pct}%</button>
              ))}
            </div>
            <p className="text-[9px] text-slate-600 mt-1 leading-tight">
              Clé modifiable selon les conditions de démembrement propres à chaque SCPI.
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Prix {typeDemembrement === 'nue-propriete' ? 'NP' : 'usufruit'} estimé</label>
            <p className="px-3 py-2.5 text-sm text-white font-bold">{prixDemembre.toLocaleString('fr-FR')} €</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Prix pleine propriété</label>
            <p className="px-3 py-2.5 text-sm text-slate-400">{montantTotal.toLocaleString('fr-FR')} €</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Revenus pendant la période</label>
            <p className="px-3 py-2.5 text-sm text-slate-500">{typeDemembrement === 'nue-propriete' ? 'Aucun (0 €)' : 'Perçus (100 %)'}</p>
          </div>
        </div>
      </div>

      <ScpiSelectorBlock
        {...props}
        title={`Allocation SCPI (${typeDemembrement === 'nue-propriete' ? 'Nue-propriété' : 'Usufruit'})`}
        icon={<TrendingUp size={20} className="text-emerald-400" />}
      />
    </>
  );
}

function AllocationReelle({ rows, totalMontantReel, cashRestant, onPartsChange, onRemove }: {
  rows: ScpiAllocationRow[];
  totalMontantReel: number;
  cashRestant: number;
  onPartsChange: (index: number, parts: number) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Euro size={20} className="text-emerald-400" />
          Allocation réelle
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="text-[10px] uppercase tracking-wider text-slate-500 bg-slate-950/60">
            <tr>
              <th className="py-2.5 px-4">SCPI</th>
              <th className="py-2.5 px-4 text-right">Alloc. cible</th>
              <th className="py-2.5 px-4 text-right">Prix part</th>
              <th className="py-2.5 px-4 text-right">Parts</th>
              <th className="py-2.5 px-4 text-right">Montant réel</th>
              <th className="py-2.5 px-4 text-right">Écart</th>
              <th className="py-2.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {rows.map((row, i) => {
              const ecart = row.allocation - row.montantReel;
              return (
                <tr key={i} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-4 font-semibold text-slate-200">{row.scpiName}</td>
                  <td className="py-2.5 px-4 text-right">{row.allocation.toLocaleString('fr-FR')} €</td>
                  <td className="py-2.5 px-4 text-right text-slate-400">{row.price.toLocaleString('fr-FR')} €</td>
                  <td className="py-2.5 px-4 text-right">
                    <input
                      type="number"
                      value={row.parts}
                      onChange={(e) => onPartsChange(i, Number(e.target.value))}
                      min={0}
                      step={1}
                      className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-right text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-2.5 px-4 text-right text-white">{row.montantReel.toLocaleString('fr-FR')} €</td>
                  <td className={`py-2.5 px-4 text-right ${ecart >= 0 ? 'text-slate-500' : 'text-red-400'}`}>{ecart > 0 ? `+${ecart.toLocaleString('fr-FR')} €` : ecart === 0 ? '0 €' : `${ecart.toLocaleString('fr-FR')} €`}</td>
                  <td className="py-2.5 px-4 text-center">
                    {rows.length > 1 && (
                      <button
                        onClick={() => onRemove(i)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[10px] text-slate-500 hover:text-red-400 bg-slate-800/60 hover:bg-red-950/30 border border-slate-700/50 hover:border-red-800/30 rounded transition"
                      >
                        <X size={12} /> Retirer
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-950/80 border-t-2 border-slate-700">
              <td className="py-2.5 px-4 font-bold text-slate-100">TOTAL</td>
              <td className="py-2.5 px-4 text-right font-bold text-slate-100">{rows.reduce((s, r) => s + r.allocation, 0).toLocaleString('fr-FR')} €</td>
              <td></td>
              <td className="py-2.5 px-4 text-right font-bold text-white">{rows.reduce((s, r) => s + r.parts, 0)}</td>
              <td className="py-2.5 px-4 text-right font-bold text-emerald-400">{totalMontantReel.toLocaleString('fr-FR')} €</td>
              <td className="py-2.5 px-4 text-right font-bold text-amber-400">{cashRestant > 0 ? `+${cashRestant.toLocaleString('fr-FR')} €` : `${cashRestant.toLocaleString('fr-FR')} €`}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

interface ScpiSelectorPanelProps {
  tab: 'favorites' | 'all';
  onChangeTab: (v: 'favorites' | 'all') => void;
  search: string;
  setSearch: (v: string) => void;
  checked: Set<number>;
  setChecked: (v: Set<number>) => void;
  usedIds: Set<number>;
  onClose: () => void;
  onAddSelection: (ids: number[]) => void;
}

function ScpiSelectorPanel(props: ScpiSelectorPanelProps) {
  const { tab, onChangeTab, search, setSearch, checked, setChecked, usedIds, onClose, onAddSelection } = props;

  const favoriteIds = useMemo(() => getFavoriteScpiIds(), []);

  const filtered = useMemo(() => {
    let list = scpiDataExtended;
    if (tab === 'favorites') {
      list = list.filter((s) => favoriteIds.has(s.id));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.managementCompany.toLowerCase().includes(q) ||
          s.sectors.some((sec) => sec.name.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [tab, search, favoriteIds]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aUsed = usedIds.has(a.id);
      const bUsed = usedIds.has(b.id);
      if (aUsed !== bUsed) return aUsed ? 1 : -1;
      return b.yield - a.yield;
    });
  }, [filtered, usedIds]);

  const getDominantSector = (scpi: SCPIExtended): string => {
    if (!scpi.sectors || scpi.sectors.length === 0) return scpi.category || '—';
    const top = [...scpi.sectors].sort((a, b) => b.value - a.value)[0];
    return `${top.name} ${top.value}%`;
  };

  const selectable = sorted.filter((s) => !usedIds.has(s.id));
  const selectedCount = [...checked].filter((id) => selectable.some((s) => s.id === id)).length;

  const toggleCheck = (id: number) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChecked(next);
  };

  const handleAdd = () => {
    const ids = [...checked].filter((id) => !usedIds.has(id));
    if (ids.length === 0) return;
    onAddSelection(ids);
    setChecked(new Set());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/60" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[75vh] flex flex-col mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 shrink-0">
          <h2 className="text-base font-bold text-slate-100">Ajouter une SCPI à l&apos;allocation</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-3 border-b border-slate-800 shrink-0">
          <div className="flex rounded-lg border border-slate-700 overflow-hidden shrink-0">
            <button
              onClick={() => onChangeTab('favorites')}
              className={`px-3 py-1.5 text-xs font-medium transition ${tab === 'favorites' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              SCPI préférées
            </button>
            <button
              onClick={() => onChangeTab('all')}
              className={`px-3 py-1.5 text-xs font-medium transition ${tab === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              Toutes les SCPI
            </button>
          </div>
          <div className="relative flex-1 w-full sm:w-auto">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher nom, société de gestion, secteur..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Colonnes en-tête */}
        <div className="grid grid-cols-12 gap-2 px-5 py-2 text-[10px] uppercase tracking-wider text-slate-600 border-b border-slate-800/50 shrink-0">
          <span className="col-span-4">SCPI</span>
          <span className="col-span-3">Société de gestion</span>
          <span className="col-span-2 text-right">Rendt</span>
          <span className="col-span-2 text-right">Prix part</span>
          <span className="col-span-1 text-right">Min.</span>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1">
          {sorted.length === 0 && (
            <p className="text-center text-xs text-slate-500 py-12">
              {tab === 'favorites' ? 'Aucune SCPI préférée trouvée.' : 'Aucune SCPI trouvée.'}
            </p>
          )}
          {sorted.map((scpi) => {
            const alreadyUsed = usedIds.has(scpi.id);
            return (
              <label
                key={scpi.id}
                className={`flex items-center gap-3 px-5 py-2.5 border-b border-slate-800/50 transition cursor-pointer ${
                  alreadyUsed ? 'opacity-40 bg-slate-950/50' : 'hover:bg-slate-800/30'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked.has(scpi.id)}
                  onChange={() => !alreadyUsed && toggleCheck(scpi.id)}
                  disabled={alreadyUsed}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500 shrink-0 accent-emerald-500"
                />
                <div className="grid grid-cols-12 gap-2 flex-1 min-w-0 items-center">
                  <span className="col-span-4 text-sm font-semibold text-slate-200 truncate" title={scpi.name}>
                    {scpi.name}
                  </span>
                  <span className="col-span-3 text-xs text-slate-500 truncate" title={scpi.managementCompany}>
                    {scpi.managementCompany}
                  </span>
                  <span className="col-span-2 text-xs text-emerald-400 font-medium text-right">
                    {scpi.yield}%
                  </span>
                  <span className="col-span-2 text-xs text-slate-400 text-right">
                    {scpi.price.toLocaleString('fr-FR')} €
                  </span>
                  <span className="col-span-1 text-xs text-slate-500 text-right">
                    {scpi.minInvestment > 0 ? `${(scpi.minInvestment).toLocaleString('fr-FR')} €` : '—'}
                  </span>
                </div>
                {alreadyUsed && (
                  <span className="text-[10px] text-slate-600 italic shrink-0">Déjà ajoutée</span>
                )}
              </label>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 shrink-0">
          <span className="text-xs text-slate-500">
            {selectedCount} SCPI sélectionnée{selectedCount !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              Annuler
            </button>
            <button
              onClick={handleAdd}
              disabled={selectedCount === 0}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition ${
                selectedCount > 0
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              Ajouter à l&apos;allocation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
