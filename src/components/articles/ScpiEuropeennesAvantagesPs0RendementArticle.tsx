import React from 'react';
import { AlertTriangle, BookOpen, Calculator, Calendar, CheckCircle2, Clock, Globe, Scale, User } from 'lucide-react';
import ArticleCtaBlock from '../ArticleCtaBlock';

export const ScpiEuropeennesAvantagesPs0RendementArticle: React.FC = () => {
  return (
    <div className="space-y-12">
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-8 border border-blue-100 dark:border-gray-700">
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li><a href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Accueil</a></li>
            <li>/</li>
            <li><a href="/education" className="hover:text-blue-600 dark:hover:text-blue-400">Éducation</a></li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-semibold">Fiscalité des SCPI européennes</li>
          </ol>
        </nav>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">Fiscalité</span>
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-semibold rounded-full">Europe</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          SCPI européennes : fiscalité des revenus étrangers et prélèvements sociaux
        </h1>

        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Il n’existe pas de règle sérieuse du type « SCPI européenne = prélèvements sociaux à 0 % ». Le traitement dépend du pays où se situe l’immeuble, de la convention fiscale applicable, de la nature du revenu, du mode de détention et de la situation du contribuable. La bonne méthode consiste à ventiler les flux pays par pays à partir de la fiche fiscale annuelle de la société de gestion.
        </p>

        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2"><User className="w-4 h-4" /><span>Éric Bellaiche, CGP-CIF</span></div>
          <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>Mise à jour 2026</span></div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>12 min de lecture</span></div>
        </div>
      </section>

      <section className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-7 border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-700 mt-1 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Le raccourci « PS 0 % » est à éviter</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Une SCPI peut percevoir des revenus immobiliers de plusieurs pays et distribuer aussi d’autres catégories de revenus. La fiscalité française des revenus étrangers ne se résume donc pas à retirer mécaniquement 17,2 % du rendement brut. Le résultat dépend de la convention concernée et de la qualification fiscale de chaque flux.
            </p>
          </div>
        </div>
      </section>

      <ArticleCtaBlock variant="top" topic="general" />

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          1. Comment fonctionne réellement la fiscalité des revenus étrangers ?
        </h2>
        <div className="space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Les conventions fiscales conclues entre la France et les États étrangers organisent le droit d’imposer les revenus immobiliers et les mécanismes destinés à éviter une double imposition. Deux méthodes reviennent fréquemment : le crédit d’impôt et l’exonération avec prise en compte pour le taux effectif. Elles ne produisent pas le même résultat et ne doivent pas être confondues.
          </p>
          <p>
            Une SCPI dite « européenne » peut détenir des immeubles en Allemagne, Espagne, Pays-Bas, Italie, Belgique ou ailleurs. La société de gestion ventile les revenus par pays dans sa documentation fiscale annuelle. C’est cette ventilation, et non l’étiquette commerciale « européenne », qui permet de déterminer le traitement fiscal.
          </p>
          <p>
            La TMI du foyer intervient dans certains calculs, mais ce n’est pas un taux d’imposition global à appliquer indistinctement à tous les revenus étrangers. Le taux moyen, les autres revenus du foyer, les crédits d’impôt et les mécanismes conventionnels peuvent modifier sensiblement le résultat final.
          </p>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Scale className="w-8 h-8 text-blue-600" />
          2. Prélèvements sociaux : ce qu’il faut vérifier
        </h2>
        <div className="space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            L’application des prélèvements sociaux dépend de la nature du revenu, de sa source et de la situation du contribuable. Il est donc imprudent d’affirmer qu’une quote-part européenne est toujours soumise à « 0 % » de prélèvements sociaux ou, inversement, qu’elle supporte toujours le même taux que des revenus fonciers français.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">À vérifier chaque année</h3>
              <ul className="space-y-2 text-sm">
                <li>• pays de situation des immeubles ;</li>
                <li>• convention fiscale applicable ;</li>
                <li>• nature exacte des revenus distribués ;</li>
                <li>• fiche fiscale de la société de gestion ;</li>
                <li>• situation fiscale et sociale du contribuable.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">À ne pas faire</h3>
              <ul className="space-y-2 text-sm">
                <li>• retrancher automatiquement 17,2 % du rendement français ;</li>
                <li>• appliquer la TMI directement au rendement européen ;</li>
                <li>• généraliser un régime fiscal d’un pays à toute l’Europe ;</li>
                <li>• présenter un avantage fiscal comme garanti dans le temps.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Calculator className="w-8 h-8 text-blue-600" />
          3. Comparer France et Europe sans fabriquer un faux rendement net
        </h2>
        <div className="space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            La comparaison correcte part du même capital, du même horizon et d’hypothèses de distribution cohérentes. Pour chaque SCPI, il faut distinguer rendement distribué, frais, quote-part française, quote-part étrangère, conventions fiscales, éventuels prélèvements sociaux, puis fiscalité de sortie.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="text-left p-3 border border-gray-200 dark:border-gray-600">Élément</th>
                  <th className="text-left p-3 border border-gray-200 dark:border-gray-600">SCPI France</th>
                  <th className="text-left p-3 border border-gray-200 dark:border-gray-600">SCPI multi-pays</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="p-3 border">Rendement affiché</td><td className="p-3 border">À analyser</td><td className="p-3 border">À analyser</td></tr>
                <tr><td className="p-3 border">Fiscalité courante</td><td className="p-3 border">Principalement revenus fonciers français</td><td className="p-3 border">Ventilation pays par pays</td></tr>
                <tr><td className="p-3 border">Prélèvements sociaux</td><td className="p-3 border">Selon règles des revenus français</td><td className="p-3 border">À vérifier selon les flux et la situation</td></tr>
                <tr><td className="p-3 border">Double imposition</td><td className="p-3 border">Non concernée pour la quote-part française</td><td className="p-3 border">Convention et méthode à vérifier</td></tr>
                <tr><td className="p-3 border">Risque spécifique</td><td className="p-3 border">Cycle immobilier français</td><td className="p-3 border">Pays, change éventuel, droit local</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            Une SCPI européenne peut être fiscalement plus efficace dans certains dossiers, mais elle peut aussi être moins attractive si le rendement, les frais, la qualité du patrimoine ou le risque pays sont défavorables. Le classement ne doit jamais être automatisé sur la seule TMI.
          </p>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Globe className="w-8 h-8 text-blue-600" />
          4. Les vrais critères d’une SCPI européenne
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            ['Diversification réelle', 'Vérifier le poids de chaque pays et de chaque secteur. Une SCPI investie à 70 % dans un seul pays n’est pas réellement paneuropéenne.'],
            ['Qualité locative', 'TOF, durée résiduelle des baux, solvabilité des locataires, concentration des loyers et maturité des actifs restent prioritaires.'],
            ['Endettement', 'Le levier financier peut accroître la sensibilité aux taux et aux refinancements, quelle que soit la fiscalité.'],
            ['Prix de part', 'Décote ou surcote par rapport aux valeurs de référence doivent être croisées avec la qualité des expertises et la trajectoire des valeurs.'],
            ['Liquidité', 'La possibilité de vendre dépend du mécanisme de la SCPI, des retraits et du marché secondaire ; la fiscalité ne crée pas de liquidité.'],
            ['Gestionnaire', 'L’expérience opérationnelle dans les pays ciblés est un critère de crédibilité : sourcing, asset management, fiscalité locale et exécution.'],
          ].map(([title, text]) => (
            <div key={title} className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" />{title}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">5. Assurance-vie et revenus européens : ne pas mélanger les régimes</h2>
        <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Lorsqu’une SCPI est logée dans une assurance-vie, le souscripteur détient une unité de compte et non les parts en direct. La fiscalité du contrat s’applique au rachat. Il n’est donc pas pertinent de transposer au contrat la fiscalité annuelle d’un associé personne physique détenant directement une SCPI européenne.
          </p>
          <p>
            L’assurance-vie n’est pas non plus automatiquement hors IFI : dans un contrat rachetable, la fraction de valeur représentative d’actifs immobiliers imposables peut entrer dans l’assiette. Les informations annuelles de l’assureur doivent être utilisées.
          </p>
        </div>
      </section>

      <section className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Méthode MaximusSCPI</h2>
        <ol className="space-y-3 text-gray-700 dark:text-gray-300">
          <li><strong>1.</strong> Identifier la quote-part de revenus par pays.</li>
          <li><strong>2.</strong> Lire la fiche fiscale annuelle et la convention applicable.</li>
          <li><strong>3.</strong> Vérifier séparément IR, crédit d’impôt ou taux effectif, prélèvements sociaux et éventuelles retenues locales.</li>
          <li><strong>4.</strong> Calculer un rendement net sur des hypothèses explicites, pas avec une formule européenne unique.</li>
          <li><strong>5.</strong> Comparer ensuite TOF, endettement, prix de part, valeurs d’expertise, liquidité et frais.</li>
        </ol>
      </section>

      <section className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sources à vérifier</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Référence opérationnelle : fiche fiscale annuelle de la société de gestion. Références juridiques : conventions fiscales internationales, impots.gouv.fr et BOFiP. Les règles pouvant évoluer, les calculs doivent être actualisés pour l’année de déclaration concernée.
        </p>
      </section>

      <ArticleCtaBlock variant="bottom" topic="general" />
    </div>
  );
};

export default ScpiEuropeennesAvantagesPs0RendementArticle;
