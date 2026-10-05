import React from 'react';
import { AlertTriangle, Building2, Calculator, ExternalLink, FileText, Scale, ShieldCheck } from 'lucide-react';
import ArticleCtaBlock from '../ArticleCtaBlock';

export const IfiScpiImpotFortuneImmobiliereStrategiesArticle: React.FC = () => {
  return (
    <div className="space-y-12">
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-8 border border-blue-100 dark:border-gray-700">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">Fiscalité</span>
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-sm font-semibold rounded-full">Mis à jour le 5 octobre 2026</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          IFI et SCPI : valeur taxable, assurance-vie et points de vigilance
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
          Les parts de SCPI peuvent entrer dans l'assiette de l'impôt sur la fortune immobilière, mais la règle n'est pas « valeur de reconstitution = valeur IFI » et une SCPI logée en assurance-vie n'est pas automatiquement hors IFI. La bonne méthode consiste à retenir la fraction immobilière taxable communiquée par la société de gestion ou l'assureur.
        </p>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
          Ce qui est certain en 2026
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            ['Seuil', "L'IFI concerne le foyer dont le patrimoine immobilier net taxable excède 1,3 M€ au 1er janvier."],
            ['SCPI en direct', "La part taxable correspond à la fraction représentative d'actifs immobiliers imposables, selon les informations communiquées par la société de gestion."],
            ['Assurance-vie', "Pour un contrat rachetable en unités de compte, la fraction de la valeur de rachat représentative d'actifs immobiliers imposables peut entrer dans l'IFI."],
            ['Données à utiliser', "Il faut privilégier la valeur ou le ratio IFI fourni par la société de gestion ou l'assureur, plutôt qu'une approximation à partir du prix de souscription."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-900/40">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <ArticleCtaBlock variant="top" topic="fiscalite" />

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Calculator className="w-8 h-8 text-indigo-600" />
          Seuil et barème de l'IFI
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          Le seuil d'entrée dans l'IFI est fixé à 1,3 M€ de patrimoine immobilier net taxable. Une fois ce seuil franchi, le barème s'applique à partir de 800 000 €. Le barème reste progressif de 0 % à 1,5 %.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="p-3 text-left border border-gray-200 dark:border-gray-600">Fraction du patrimoine net taxable</th>
                <th className="p-3 text-left border border-gray-200 dark:border-gray-600">Taux</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              <tr><td className="p-3 border border-gray-200 dark:border-gray-600">Jusqu'à 800 000 €</td><td className="p-3 border border-gray-200 dark:border-gray-600">0 %</td></tr>
              <tr><td className="p-3 border border-gray-200 dark:border-gray-600">800 001 € à 1 300 000 €</td><td className="p-3 border border-gray-200 dark:border-gray-600">0,50 %</td></tr>
              <tr><td className="p-3 border border-gray-200 dark:border-gray-600">1 300 001 € à 2 570 000 €</td><td className="p-3 border border-gray-200 dark:border-gray-600">0,70 %</td></tr>
              <tr><td className="p-3 border border-gray-200 dark:border-gray-600">2 570 001 € à 5 000 000 €</td><td className="p-3 border border-gray-200 dark:border-gray-600">1 %</td></tr>
              <tr><td className="p-3 border border-gray-200 dark:border-gray-600">5 000 001 € à 10 000 000 €</td><td className="p-3 border border-gray-200 dark:border-gray-600">1,25 %</td></tr>
              <tr><td className="p-3 border border-gray-200 dark:border-gray-600">Au-delà de 10 000 000 €</td><td className="p-3 border border-gray-200 dark:border-gray-600">1,50 %</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Une décote existe pour les patrimoines nets taxables compris entre 1,3 M€ et 1,4 M€. Les règles de plafonnement, dettes déductibles et exonérations éventuelles doivent être appréciées séparément.
        </p>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-blue-600" />
          SCPI détenues en direct : quelle valeur déclarer ?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5">
          Une part de SCPI n'est pas nécessairement taxable à 100 % de sa valeur. L'assiette dépend de la fraction de la valeur de la part représentative des biens ou droits immobiliers imposables au sens de l'IFI. La société de gestion calcule généralement une valeur ou un ratio IFI destiné aux associés.
        </p>
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-lg p-5">
          <p className="font-semibold text-amber-900 dark:text-amber-200 mb-2">À ne pas faire</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Ne pas remplacer automatiquement la valeur IFI par le prix de souscription, la valeur de retrait ou la valeur de reconstitution. Ces indicateurs répondent à d'autres objectifs. Pour la déclaration, il faut partir de l'information IFI officielle du gestionnaire et vérifier sa date de référence.
          </p>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Scale className="w-8 h-8 text-purple-600" />
          SCPI en assurance-vie : pas d'exonération automatique
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5">
          Pour les contrats d'assurance-vie rachetables, l'article 972 du CGI prévoit l'intégration dans l'IFI de la fraction de la valeur de rachat correspondant aux unités de compte constituées d'actifs immobiliers imposables. Autrement dit, loger une SCPI dans une assurance-vie ne suffit pas, à lui seul, à faire disparaître l'IFI.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          L'assureur doit être en mesure de communiquer la valeur de rachat du contrat et la fraction représentative des actifs imposables. C'est cette donnée qu'il faut utiliser. Le fonds en euros n'est pas traité comme une unité de compte immobilière taxable de la même manière.
        </p>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-600" />
          Les erreurs qui faussent le plus souvent le calcul
        </h2>
        <ul className="space-y-4 text-gray-700 dark:text-gray-300">
          <li><strong>« Assurance-vie = hors IFI » :</strong> faux en présence d'unités de compte immobilières imposables dans un contrat rachetable.</li>
          <li><strong>« SCPI = 100 % taxable » :</strong> trop simplificateur ; il faut retenir la fraction immobilière taxable transmise par le gestionnaire.</li>
          <li><strong>« Valeur de reconstitution = valeur IFI » :</strong> ce n'est pas la règle fiscale de principe.</li>
          <li><strong>« Aucune dette n'est déductible » :</strong> faux ; certaines dettes afférentes aux actifs imposables peuvent être déductibles sous conditions et plafonnements.</li>
          <li><strong>« Le seuil de 1,3 M€ signifie que seuls les euros au-dessus de 1,3 M€ sont taxés » :</strong> faux ; une fois le seuil franchi, le barème commence à 800 000 €.</li>
        </ul>
      </section>

      <section className="bg-slate-50 dark:bg-gray-900 rounded-2xl p-8 border border-slate-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-3">
          <FileText className="w-7 h-7 text-slate-600" />
          Sources officielles et méthode
        </h2>
        <div className="space-y-3 text-sm">
          <a className="flex items-center gap-2 text-blue-700 dark:text-blue-300 hover:underline" href="https://bofip.impots.gouv.fr/bofip/11314-PGP.html/identifiant%3DBOI-PAT-IFI-20-20-30-30-20180608" target="_blank" rel="noreferrer">
            BOFiP — assurance-vie et actifs immobiliers dans l'IFI <ExternalLink className="w-4 h-4" />
          </a>
          <a className="flex items-center gap-2 text-blue-700 dark:text-blue-300 hover:underline" href="https://bofip.impots.gouv.fr/bofip/11343-PGP.html/identifiant%3DBOI-PAT-IFI-50-10-30-20240605" target="_blank" rel="noreferrer">
            BOFiP — informations à fournir par sociétés de gestion et assureurs <ExternalLink className="w-4 h-4" />
          </a>
          <a className="flex items-center gap-2 text-blue-700 dark:text-blue-300 hover:underline" href="https://www.economie.gouv.fr/particuliers/impots-et-fiscalite/gerer-mes-autres-impots-et-taxes/comment-fonctionne-limpot-sur-la" target="_blank" rel="noreferrer">
            Ministère de l'Économie — fonctionnement et barème de l'IFI <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-5">
          Contenu pédagogique général. La situation d'un foyer dépend notamment de la résidence fiscale, de la structure de détention, des dettes, du démembrement et des valeurs IFI communiquées pour l'année concernée.
        </p>
      </section>

      <ArticleCtaBlock variant="bottom" topic="fiscalite" />
    </div>
  );
};
