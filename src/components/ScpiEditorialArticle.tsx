import React from 'react';
import { ArrowUpRight, BookOpen, CalendarClock, FileCheck2, ShieldAlert } from 'lucide-react';
import editorialJson from '../../data/news/scpi-actualites-69.json';

export type ScpiEditorialDossier = (typeof editorialJson.dossiers)[number];

const bySlug = new Map<string, ScpiEditorialDossier>(
  editorialJson.dossiers.map((dossier) => [dossier.slug, dossier]),
);

export const getScpiEditorialDossier = (slug: string): ScpiEditorialDossier | undefined =>
  bySlug.get(slug);

export const SCPI_EDITORIAL_COUNT = editorialJson.dossiers.length;

export const ScpiEditorialArticle: React.FC<{ slug: string }> = ({ slug }) => {
  const dossier = getScpiEditorialDossier(slug);
  if (!dossier) {
    return (
      <div className="mt-6 rounded-xl border border-amber-300/40 p-5 text-sm text-gray-600 dark:text-gray-300">
        Point de veille documentaire non disponible pour cette SCPI. Aucune actualité ne sera inventée.
      </div>
    );
  }

  const withReservations = !dossier.comparisonCertified || !dossier.currentSourceCertified;
  return (
    <article aria-label={`Actualités documentées de ${dossier.name}`} className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
      <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400 mb-4">
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="h-4 w-4" />
          Bulletin analysé : {dossier.period}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FileCheck2 className="h-4 w-4" />
          {dossier.comparisonCertified ? 'Comparaison certifiée' : 'Comparaison avec réserves'}
        </span>
      </div>
      <h4 className="text-2xl sm:text-3xl font-bold leading-tight text-gray-900 dark:text-white">
        {dossier.headline}
      </h4>
      <p className="mt-4 text-base leading-7 text-gray-700 dark:text-gray-300">{dossier.lead}</p>

      {withReservations && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-400/40 bg-amber-50/70 dark:bg-amber-950/20 p-4">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" />
          <p className="text-sm text-amber-950 dark:text-amber-100">
            {dossier.currentSourceCertified
              ? "Les données de la période courante sont certifiées, mais l'historique de comparaison n'est pas validé. Aucune variation non prouvée n'est présentée."
              : "Dossier sous réserve : la source courante ou la revue documentaire exige un contrôle complémentaire."}
          </p>
        </div>
      )}

      {dossier.moreRecentBulletin && (
        <div className="mt-5 rounded-xl border border-blue-300/40 bg-blue-50/60 dark:bg-blue-950/20 p-4">
          <p className="text-sm text-blue-950 dark:text-blue-100">
            Un bulletin {dossier.moreRecentBulletin.period} est repéré. Le bilan comparatif certifié demeure celui de {dossier.period}.
            Les quelques indicateurs T3 vérifiés individuellement sont distingués ci-dessous.
          </p>
          {dossier.moreRecentBulletin.url && (
            <a href={dossier.moreRecentBulletin.url} target="_blank" rel="noopener noreferrer nofollow"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline">
              Consulter le nouveau bulletin <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>
      )}


      {dossier.t3Review && (
        <section aria-label={`Contrôle documentaire T3 de ${dossier.name}`} data-evidence-quarter="2026-T3" className="mt-6 rounded-xl border border-amber-400/30 bg-amber-950/10 p-5">
          <h5 className="text-lg font-semibold text-gray-900 dark:text-white">Point documentaire 2026-T3</h5>
          {dossier.t3Review.state === 'rejected_wrong_document' ? (
            <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
              Une pièce reçue comme bulletin trimestriel a été écartée après contrôle du type de document ou de l'identité de la SCPI.
              Aucun chiffre de cette pièce n'est utilisé pour actualiser l'analyse.
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                Bulletin officiel repéré. La comparaison trimestrielle reste certifiée sur {dossier.period}.
                Seuls les indicateurs T3 disposant d'une preuve documentaire individualisée figurent ci-dessous.
              </p>
              {dossier.t3Review.verifiedFields.length > 0 ? (
                <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dossier.t3Review.verifiedFields.slice(0, 8).map((field) => (
                    <div key={field.metric} className="rounded-lg border border-gray-600/30 p-3">
                      <dt className="text-xs text-gray-600 dark:text-gray-400">
                        {({
                          tof:'TOF', capitalisation:'Capitalisation', prix_souscription:'Prix de souscription',
                          prix_retrait:'Prix de retrait', prix_reconstitution:'Valeur de reconstitution',
                          endettement:'Endettement', walb:'WALB', walt:'WALT', nombre_associes:'Associés',
                          nombre_parts:'Parts', nombre_immeubles:'Immeubles', nombre_locataires:'Locataires',
                          parts_attente_retrait:'Parts en attente de retrait'
                        } as Record<string, string>)[field.metric] || field.metric}
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {field.value.toLocaleString('fr-FR')} {field.unit || ''}
                      </dd>
                      <dd className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                        Preuve individualisée — page {field.page}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-3 text-sm text-amber-800 dark:text-amber-200">
                  Aucun indicateur nouveau n'atteint encore le seuil de preuve nécessaire à l'affichage.
                </p>
              )}
              {dossier.t3Review.sourceUrl && (
                <a href={dossier.t3Review.sourceUrl} rel="noopener noreferrer nofollow" target="_blank"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300 hover:underline">
                  Source officielle T3 <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
              <p className="mt-3 text-xs text-amber-800 dark:text-amber-200">
                Certification globale T3 non acquise. Les écarts T2–T3 et les métriques en conflit ne sont pas publiés.
              </p>
            </>
          )}
        </section>
      )}

      <div className="mt-8 space-y-8">
        {dossier.sections.map((section, index) => (
          <section key={`${section.heading}-${index}`} className="border-b border-gray-100 dark:border-gray-700/70 pb-7 last:border-b-0">
            <h5 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">{section.heading}</h5>
            {section.basis === 'contexte_historique_non_certifie' && (
              <p className="mb-3 text-xs font-medium text-amber-700 dark:text-amber-300">
                Référentiel historique : période de valeur non confirmée. Ne pas assimiler aux indicateurs du bulletin courant.
              </p>
            )}
            <div className="space-y-3">
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex} className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {dossier.sourceUrl && (
          <a href={dossier.sourceUrl} target="_blank" rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
            <BookOpen className="h-4 w-4" />
            Consulter le document source <ArrowUpRight className="h-4 w-4" />
          </a>
        )}
      </div>
      {dossier.linkedEvents.length > 0 && (
        <div className="mt-5">
          <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Communications officielles reliées</h5>
          <ul className="space-y-2">
            {dossier.linkedEvents.map((event, index) => (
              <li key={`${event.title}-${index}`}>
                <a href={event.sourceUrl || '#'} target="_blank" rel="noopener noreferrer nofollow"
                  className="text-sm text-emerald-700 dark:text-emerald-300 hover:underline">
                  {event.date ? `${event.date} — ` : ''}{event.title} <ArrowUpRight className="inline h-3.5 w-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 text-xs text-gray-500 dark:text-gray-400">
        Analyse de veille documentaire, non personnalisée. Les SCPI présentent un risque de perte en capital et de liquidité.
        La période et le statut des données sont précisés ci-dessus ; aucune performance future n'est garantie.
      </p>
    </article>
  );
};
