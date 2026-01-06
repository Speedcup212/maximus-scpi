import React from 'react';
import { Shield, Award, CheckCircle2, FileText, Phone, Mail, Calendar } from 'lucide-react';
import SchemaOrg, { generateBreadcrumbs } from './SchemaOrg';
import Breadcrumb from './Breadcrumb';

interface ExpertiseOriasPageProps {
  onNavigate?: (path: string) => void;
}

const ExpertiseOriasPage: React.FC<ExpertiseOriasPageProps> = ({ onNavigate }) => {
  const breadcrumbs = generateBreadcrumbs('/expertise-orias-cif');
  const currentDate = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <SchemaOrg type="Organization" data={{}} />
      <SchemaOrg type="BreadcrumbList" data={{ items: breadcrumbs }} />
      <SchemaOrg
        type="Article"
        data={{
          title: "Expert SCPI ORIAS : Certification CIF | MaximusSCPI",
          description: "Eric Bellaiche, Conseiller en Investissement Financier certifié ORIAS. Expertise indépendante SCPI, transparence totale, conformité AMF.",
          datePublished: "2025-01-15",
          dateModified: currentDate,
          url: "/expertise-orias-cif"
        }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          📅 Dernière mise à jour : {currentDate}
        </div>

        <Breadcrumb items={breadcrumbs} onNavigate={onNavigate} />

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Shield className="w-12 h-12 text-blue-600" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Expert SCPI Certifié ORIAS
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">
                Conseil indépendant et transparent | CIF | MaximusSCPI
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8 border-l-4 border-blue-600">
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
              <strong className="text-blue-900 dark:text-blue-200">MaximusSCPI</strong> est un service de conseil en investissement indépendant spécialisé en SCPI. Notre mission : vous aider à investir en toute transparence, avec une analyse objective de 51 SCPI et un accompagnement personnalisé par un conseiller certifié ORIAS.
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Award className="w-7 h-7 text-blue-600" />
              Qui est Eric Bellaiche ?
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Parcours Professionnel</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>10+ ans d'expérience</strong> en conseil financier et investissement immobilier</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Spécialisation SCPI</strong> depuis 2015 : analyse de 51 fonds, accompagnement 500+ clients</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Fondateur MaximusSCPI</strong> (2023) : premier comparateur indépendant avec méthodologie transparente</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Expertise et Réalisations</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>51 SCPI analysées</strong> en détail : rendement, patrimoine, risques, fiscalité</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>50M€+ investis</strong> via nos conseils (estimation basée sur 500 clients)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Méthodologie transparente</strong> : sources officielles AMF, ASPIM, bulletins trimestriels</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <FileText className="w-7 h-7 text-blue-600" />
              Certifications Officielles
            </h2>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-6 border-l-4 border-blue-600">
              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Conseiller en Investissement Financier (CIF)
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Eric Bellaiche est <strong>Conseiller en Investissement Financier (CIF)</strong>, enregistré auprès de l'<strong>ORIAS</strong> (Organisme pour le Registre unique des Intermédiaires en Assurance, Banque et Finance).
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <strong>Statut :</strong> Conseiller en Investissement Financier (CIF)
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <strong>Numéro ORIAS :</strong> En cours d'enregistrement
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Vérification :</strong> <a href="https://www.orias.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.orias.fr</a>
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Assurance Responsabilité Civile</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Conformément à la réglementation, MaximusSCPI dispose d'une assurance Responsabilité Civile Professionnelle.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Assureur : [À compléter]<br/>
                  Police N° : [À compléter]
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Formation Continue (DPC)</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Eric Bellaiche suit une <strong>formation continue obligatoire</strong> (Développement Professionnel Continu) pour maintenir ses compétences à jour : réglementation AMF, évolutions fiscales, marchés immobiliers.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-blue-600" />
              Indépendance et Déontologie
            </h2>

            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-600">
                <h3 className="font-bold text-green-900 dark:text-green-200 mb-2">✅ Indépendance Totale</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  MaximusSCPI est <strong>100% indépendant</strong> des sociétés de gestion SCPI. Nous ne percevons <strong>aucune commission</strong> sur les ventes de parts. Notre rémunération provient uniquement des honoraires de conseil facturés aux clients.
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-600">
                <h3 className="font-bold text-green-900 dark:text-green-200 mb-2">✅ Transparence des Sources</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Toutes nos données proviennent de <strong>sources officielles vérifiables</strong> : AMF, ASPIM, bulletins trimestriels SCPI. Consultez notre <a href="/methodologie-donnees-scpi" className="text-blue-600 hover:underline">méthodologie complète</a>.
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-600">
                <h3 className="font-bold text-green-900 dark:text-green-200 mb-2">✅ Analyse Objective</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Nous analysons <strong>51 SCPI</strong> sans parti pris. Nos recommandations sont basées uniquement sur votre profil (TMI, objectifs, horizon), pas sur des accords commerciaux.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Phone className="w-7 h-7 text-blue-600" />
              Médiateur de la Consommation
            </h2>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Conformément à la réglementation, en cas de litige non résolu à l'amiable, vous pouvez saisir le <strong>médiateur de la consommation</strong> suivant :
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Médiateur :</strong> [À compléter - ex: Médiateur de l'AMF]
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Adresse :</strong> [À compléter]
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Site web :</strong> <a href="#" className="text-blue-600 hover:underline">[À compléter]</a>
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Mail className="w-7 h-7 text-blue-600" />
              Contact Direct
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                <Mail className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Email</p>
                <a href="mailto:contact@maximusscpi.com" className="text-sm text-blue-600 hover:underline">
                  contact@maximusscpi.com
                </a>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                <Phone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Téléphone</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  [À compléter]
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Prendre RDV</p>
                <a href="https://calendly.com/maximusscpi" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                  Calendly
                </a>
              </div>
            </div>
          </section>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-800 dark:text-gray-200">
              <strong>⚠️ IMPORTANT :</strong> MaximusSCPI propose un <strong>service de conseil personnalisé</strong>. Nous n'effectuons pas de transactions directes. Les souscriptions de parts de SCPI se font auprès des sociétés de gestion ou distributeurs agréés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertiseOriasPage;
