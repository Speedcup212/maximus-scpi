import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { AMFProfileResult } from "../utils/amfScoring";
import { normalizeGeoLabel, normalizeSectorLabel } from "../utils/labelNormalization";
import ScpiTable from "./ScpiTable";

// 🎨 Couleurs des graphiques
const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#9333ea"];

interface SCPIResultsProps {
  result: AMFProfileResult;
  onBack?: () => void;
}

const SCPIResults: React.FC<SCPIResultsProps> = ({ result, onBack }) => {
  const { profile, esgProfile, recommendations, simulation } = result;

  // 🔄 Répartition sectorielle
  const sectorData = recommendations.flatMap(r => r.scpi.repartitionSector || []);
  const aggregatedSectors = Object.values(
    sectorData.reduce((acc, s) => {
      const normalized = normalizeSectorLabel(s.name);
      acc[normalized.key] = acc[normalized.key]
        ? { ...acc[normalized.key], value: acc[normalized.key].value + s.value }
        : { ...s, name: normalized.label };
      return acc;
    }, {} as Record<string, { name: string; value: number }>)
  );

  // 🔄 Répartition géographique
  const geoData = recommendations.flatMap(r => r.scpi.repartitionGeo || []);
  const aggregatedGeo = Object.values(
    geoData.reduce((acc, g) => {
      const normalized = normalizeGeoLabel(g.name);
      acc[normalized.key] = acc[normalized.key]
        ? { ...acc[normalized.key], value: acc[normalized.key].value + g.value }
        : { ...g, name: normalized.label };
      return acc;
    }, {} as Record<string, { name: string; value: number }>)
  );

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg max-w-6xl mx-auto space-y-10">
      {/* --- Introduction --- */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-3xl font-bold mb-2">📊 Vos Résultats Personnalisés</h2>
        <p className="text-lg opacity-90">
          Ces résultats ont été calculés à partir de vos réponses, en tenant compte de votre
          expérience, de votre horizon d’investissement, de votre tolérance au risque et de vos
          préférences ESG.
        </p>
      </div>

      {/* --- Profil Investisseur --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
        <h3 className="text-2xl font-bold mb-4">🎯 Profil Investisseur</h3>
        <div className="flex items-center gap-4">
          <span className="text-4xl">{profile.icon}</span>
          <div>
            <h4 className="text-xl font-semibold" style={{ color: profile.color }}>
              {profile.name}
            </h4>
            <p className="text-gray-600 dark:text-gray-300">{profile.description}</p>
            <ul className="mt-2 text-sm text-gray-500 dark:text-gray-400 list-disc pl-5">
              <li>Horizon : {profile.characteristics.horizon}</li>
              <li>Objectif : {profile.characteristics.objective}</li>
              <li>Tolérance : {profile.characteristics.tolerance}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* --- Profil ESG --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
        <h3 className="text-2xl font-bold mb-4">🌱 Profil ESG</h3>
        <div className="flex items-center gap-4">
          <span className="text-4xl">{esgProfile.icon}</span>
          <div>
            <h4 className="text-xl font-semibold" style={{ color: esgProfile.color }}>
              {esgProfile.name}
            </h4>
            <p className="text-gray-600 dark:text-gray-300">{esgProfile.description}</p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
              <div
                className="h-3 rounded-full"
                style={{ width: `${esgProfile.impactScore}%`, backgroundColor: esgProfile.color }}
              ></div>
            </div>
            <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
              Impact Score : {esgProfile.impactScore}/100
            </p>
          </div>
        </div>
      </div>

      {/* --- Tableau SCPI --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
        <h3 className="text-2xl font-bold mb-4">💼 Portefeuille SCPI Recommandé</h3>
        <ScpiTable
          scpiList={recommendations.map(r => r.scpi)}
          selectedScpi={recommendations.map(r => r.scpi)}
          onScpiToggle={() => {}}
          onAnalyzeClick={() => {}}
        />
      </div>

      {/* --- Graphiques --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Répartition sectorielle */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold mb-4">🏢 Répartition Sectorielle</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={aggregatedSectors}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {aggregatedSectors.map((entry, index) => (
                  <Cell key={`cell-sector-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition géographique */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold mb-4">🌍 Répartition Géographique</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={aggregatedGeo}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {aggregatedGeo.map((entry, index) => (
                  <Cell key={`cell-geo-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- Indicateurs clés --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
        <h3 className="text-2xl font-bold mb-4">📌 Indicateurs Clés</h3>
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <li>
            <p className="text-sm text-gray-500">Montant investi</p>
            <p className="text-xl font-bold">{simulation.investmentAmount.toLocaleString()} €</p>
          </li>
          <li>
            <p className="text-sm text-gray-500">Revenus annuels estimés</p>
            <p className="text-xl font-bold">{simulation.annualIncome.toLocaleString()} €</p>
          </li>
          <li>
            <p className="text-sm text-gray-500">Rendement moyen</p>
            <p className="text-xl font-bold">
              {((simulation.annualIncome / simulation.investmentAmount) * 100).toFixed(2)} %
            </p>
          </li>
          <li>
            <p className="text-sm text-gray-500">Diversification</p>
            <p className="text-xl font-bold">{recommendations.length} SCPI</p>
          </li>
        </ul>
      </div>

      {/* --- Bouton Retour --- */}
      {onBack && (
        <div className="text-center">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ⬅ Refaire le questionnaire
          </button>
        </div>
      )}
    </div>
  );
};

export default SCPIResults;
