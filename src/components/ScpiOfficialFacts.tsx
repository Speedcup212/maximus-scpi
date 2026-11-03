import React from 'react';
import type { Scpi } from '../types/scpi';
import { isPublishedWithReserves, getMetricDate } from '../utils/scpiPublicationQuality';
import { getScpiDatedDiscount } from '../utils/scpiDatedDiscount';

const money = (n: number | undefined) =>
  n === undefined || !Number.isFinite(n) ? 'Non communiqué' :
  new Intl.NumberFormat('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n)+' €';
const whole = (n: number | undefined) =>
  n === undefined || !Number.isFinite(n) ? 'Non communiqué' :
  new Intl.NumberFormat('fr-FR').format(n);
const number = (n: number | undefined, suffix = '') =>
  n === undefined || !Number.isFinite(n) ? 'Non communiqué' :
  new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2}).format(n)+suffix;

/** Supplemental official values; never turn missing issuer disclosures into zeros. */
export default function ScpiOfficialFacts({ scpi }: { scpi: Scpi }) {
  if (!isPublishedWithReserves(scpi)) return null;
  const annualDate = getMetricDate(scpi,'prix_reconstitution');
  const priceDate = getMetricDate(scpi,'prix_souscription');
  const quarter = scpi.maximusSourcePeriode || 'période non renseignée';
  const dated = getScpiDatedDiscount(scpi);
  const facts: Array<[string,string]> = [
    ['Valeur de retrait ('+quarter+')',money(scpi.valeurRetrait)],
    ['Valeur de reconstitution ('+(annualDate || 'date non communiquée')+')',money(scpi.valeurReconstitution)],
    ['Valeur de réalisation ('+(getMetricDate(scpi,'valeur_realisation') || 'date non communiquée')+')',money(scpi.valeurRealisation)],
    ['Distribution du trimestre ('+quarter+')',money(scpi.distribution)],
    ['Nombre de parts ('+quarter+')',whole(scpi.nbPartsTotal)],
    ['Associés ('+quarter+')',whole(scpi.nombreAssocies)],
    ['Immeubles ('+quarter+')',whole(scpi.nbImmeubles)],
    ['Unités locatives ('+quarter+')',whole(scpi.nombreUnitesLocatives)],
    ['Parts en attente de retrait ('+quarter+')',whole(scpi.partsAttenteRetrait)],
    ['Endettement ('+quarter+')',number(scpi.debt,' %')],
    ['Frais de souscription TTC',number(scpi.fees,' %')],
    ['Frais de sortie avant 8 ans (TTC)',number(scpi.metricProvenance?.frais_sortie_avant_huit_ans?.value_numeric,' %')],
    ['Frais de gestion HT'+(scpi.fraisGestionAssiette?' — sur produits locatifs et financiers encaissés':''),number(scpi.fraisGestion,' %')],
    ['Délai de jouissance',number(scpi.delaiJouissance,' mois')],
    ['Durée de détention recommandée',number(scpi.dureeDetentionRecommandee,' ans')],
    ['Profil de risque (DIC)',scpi.profilRisque === undefined?'Non communiqué':scpi.profilRisque+'/7'],
    ['WALT',number(scpi.walt,' ans')],
    ['WALB',number(scpi.walb,' ans')],
    ['Nombre de locataires',whole(scpi.nombreLocataires)],
  ];
  return (
    <section data-testid="scpi-official-facts" aria-label="Données financières vérifiées et informations non communiquées"
      className="mx-auto max-w-7xl rounded-xl border border-slate-200 bg-white p-5 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
      <h2 className="text-lg font-bold">Données financières et patrimoniales</h2>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
        Bulletin officiel {quarter} ; valeurs patrimoniales reprises du dernier rapport annuel connu.
        Une unité locative n’est pas nécessairement un locataire.
      </p>
      {dated && (
        <p data-testid="scpi-indicative-dated-discount" className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
          <strong>{dated.label} : {dated.formatted}</strong>. {dated.comparisonLabel}
        </p>
      )}
      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        {facts.map(([label,value])=>(
          <div key={label} className="flex justify-between gap-3 border-b border-slate-200 py-2 text-sm dark:border-slate-700">
            <dt className="text-slate-600 dark:text-slate-300">{label}</dt>
            <dd className="text-right font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      {priceDate && <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Prix de souscription vérifié au {priceDate} ; toute comparaison de valorisation doit afficher ses deux dates.</p>}
    </section>
  );
}
