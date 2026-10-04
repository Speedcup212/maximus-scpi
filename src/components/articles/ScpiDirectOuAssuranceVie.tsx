import React from 'react';
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Landmark,
  Shield,
  User,
  WalletCards,
} from 'lucide-react';
import ArticleCtaBlock from '../ArticleCtaBlock';

export const ScpiDirectOuAssuranceVieArticle: React.FC = () => {
  return (
    <div className="space-y-12">
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-8 border border-blue-100 dark:border-gray-700">
        <nav className="mb-6" aria-label="Fil d’Ariane">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li><a href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Accueil</a></li>
            <li>/</li>
            <li><a href="/articles/" className="hover:text-blue-600 dark:hover:text-blue-400">Articles</a></li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-semibold">SCPI en direct ou via assurance-vie</li>
          </ol>
        </nav>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">Comparatif</span>
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-sm font-semibold rounded-full">Fiscalité</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          SCPI en direct ou via assurance-vie : que choisir ?
        </h1>

        <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Il n’existe pas de réponse automatique selon la seule tranche marginale d’imposition. Le bon mode de détention dépend notamment du financement, du contrat d’assurance-vie, de la fiscalité réelle des revenus, de l’IFI, de la liquidité recherchée, des frais, de l’horizon et de la transmission.
        </p>

        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2"><User className="w-4 h-4" /><span>Éric Bellaiche, CGP-CIF</span></div>
          <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>Mis à jour le 4 octobre 2026</span></div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>10 min de lecture</span></div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-xl p-6">
          <h2 className="text-xl font-bold text-amber-900 dark:text-amber-200 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Le point à retenir
          </h2>
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
            L’assurance-vie peut apporter une enveloppe fiscale, une clause bénéficiaire et une liquidité portée par l’assureur, mais elle n’efface pas automatiquement l’IFI et ajoute les règles, frais et limites du contrat. La détention directe donne généralement accès à un univers de SCPI plus large et permet le crédit ou le démembrement, mais expose directement l’associé au risque de liquidité de la SCPI.
          </p>
        </div>
      </section>

      <ArticleCtaBlock variant="top" topic="assurance-vie" />

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          Comparatif : direct vs assurance-vie
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="p-4 text-left border border-gray-200 dark:border-gray-600">Critère</th>
                <th className="p-4 text-left border border-gray-200 dark:border-gray-600">SCPI en direct</th>
                <th className="p-4 text-left border border-gray-200 dark:border-gray-600">SCPI via assurance-vie</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              <tr>
                <td className="p-4 font-semibold border border-gray-200 dark:border-gray-600">Propriété / support</td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">Tu détiens les parts et deviens associé de la SCPI.</td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">Tu détiens une unité de compte du contrat ; l’assureur organise le référencement et les conditions d’investissement.</td>
              </tr>
              <tr className="bg-gray-50/60 dark:bg-gray-700/20">
                <td className="p-4 font-semibold border border-gray-200 dark:border-gray-600">Fiscalité courante</td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">Les revenus sont imposés selon leur nature, le pays d’origine et les conventions fiscales applicables.</td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">La fiscalité du souscripteur intervient principalement lors d’un rachat sur la quote-part de gains, selon les règles de l’assurance-vie.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold border border-gray-200 dark:border-gray-600">IFI</td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">Les actifs immobiliers imposables peuvent entrer dans l’assiette selon les règles de l’IFI.</td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">Pas d’exonération générale : la fraction de valeur de rachat représentative d’actifs immobiliers imposables peut entrer dans l’IFI.</td>
              </tr>
              <tr className="bg-gray-50/60 dark:bg-gray-700/20">
                <td className="p-4 font-semibold border border-gray-200 dark:border-gray-600">Liquidité</td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">Non garantie. Une demande de retrait peut rester en attente si la contrepartie est insuffisante.</td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">La liquidité relève de l’assureur et des conditions du contrat ; il faut vérifier délais, valorisation et éventuelles restrictions.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold border border-gray-200 dark:border-gray-600">Financement</td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">Acquisition à crédit possible sous réserve d’acceptation bancaire ; traitement fiscal des intérêts à vérifier selon le dossier.</td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">L’investissement se fait dans le contrat. Une avance d’assurance-vie est distincte d’un crédit d’acquisition de parts.</td>
              </tr>
              <tr className="bg-gray-50/60 dark:bg-gray-700/20">
                <td className="p-4 font-semibold border border-gray-200 dark:border-gray-600">Choix de SCPI</td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">Univers généralement plus large, sous réserve des conditions de souscription de chaque SCPI.</td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">Limité aux SCPI référencées par le contrat, avec des règles propres de souscription et de distribution.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold border border-gray-200 dark:border-gray-600">Démembrement</td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">Peut être possible en nue-propriété ou usufruit selon l’offre disponible.</td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">La SCPI est détenue comme unité de compte du contrat : le démembrement temporaire classique de parts n’est pas le même mécanisme.</td>
              </tr>
              <tr className="bg-gray-50/60 dark:bg-gray-700/20">
                <td className="p-4 font-semibold border border-gray-200 dark:border-gray-600">Transmission</td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">Les parts entrent dans la transmission selon le cadre civil et fiscal applicable.</td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">La clause bénéficiaire et la fiscalité décès de l’assurance-vie peuvent être utiles, mais dépendent notamment de l’âge et de la date des versements.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-3">
            <Building2 className="w-7 h-7 text-blue-600" />
            Quand le direct peut être pertinent
          </h2>
          <ul className="space-y-4 text-gray-700 dark:text-gray-300">
            <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" /><span>Tu veux financer l’acquisition à crédit et modéliser l’effet de levier.</span></li>
            <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" /><span>Tu recherches un choix de SCPI plus large ou des véhicules non référencés dans ton contrat.</span></li>
            <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" /><span>Tu envisages un démembrement temporaire de propriété.</span></li>
            <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" /><span>Tu acceptes le risque de liquidité propre aux parts et un horizon de détention long.</span></li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-3">
            <WalletCards className="w-7 h-7 text-purple-600" />
            Quand l’assurance-vie peut être pertinente
          </h2>
          <ul className="space-y-4 text-gray-700 dark:text-gray-300">
            <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" /><span>Tu disposes déjà d’un contrat compétitif et suffisamment ancien, avec des SCPI de qualité référencées.</span></li>
            <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" /><span>Tu souhaites regrouper SCPI et autres supports dans une même enveloppe.</span></li>
            <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" /><span>La clause bénéficiaire et la transmission font partie de l’objectif patrimonial.</span></li>
            <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" /><span>Tu accordes une forte importance au mécanisme de liquidité porté par l’assureur, après lecture des conditions du contrat.</span></li>
          </ul>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Landmark className="w-8 h-8 text-amber-600" />
          IFI : l’assurance-vie n’efface pas automatiquement l’immobilier
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          Pour les contrats d’assurance-vie rachetables exprimés en unités de compte, l’article 972 du CGI prévoit l’intégration à l’IFI de la valeur de rachat à hauteur de la fraction représentative d’actifs immobiliers imposables. Une unité de compte investie en SCPI peut donc générer une fraction imposable à l’IFI, selon sa composition et les règles applicables.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          L’assureur doit pouvoir communiquer les informations nécessaires concernant la valeur de rachat et la fraction représentative des actifs imposables. Pour un contribuable concerné par l’IFI, il faut utiliser l’information annuelle du contrat plutôt qu’une règle générale du type « assurance-vie = hors IFI ».
        </p>
      </section>

      <ArticleCtaBlock variant="middle" topic="assurance-vie" />

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Shield className="w-8 h-8 text-green-600" />
          Fiscalité : pourquoi une simple TMI ne suffit pas
        </h2>
        <div className="space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            En direct, la fiscalité dépend de la nature et de l’origine des revenus. Pour une SCPI investie hors de France, les conventions fiscales et les mécanismes d’élimination de la double imposition doivent être examinés pays par pays et à partir de l’imprimé fiscal fourni par la société de gestion. Il est donc imprudent de transformer une TMI de 11 %, 30 % ou 41 % en allocation automatique.
          </p>
          <p>
            En assurance-vie, les gains du contrat sont imposés lors des rachats selon les règles applicables au contrat, qui dépendent notamment de la date des versements, de l’ancienneté et du montant des primes. Après huit ans, un abattement annuel sur les gains retirés peut s’appliquer dans les conditions prévues par la réglementation. Cette fiscalité doit être comparée aux frais du contrat et aux conditions de référencement des SCPI.
          </p>
          <p>
            La bonne méthode consiste à comparer des flux nets sur le même horizon : montant investi, délai de jouissance, taux de distribution hypothétique, frais de souscription ou conditions spécifiques du contrat, frais annuels de l’assurance-vie, fiscalité, financement éventuel et valeur de sortie. Le résultat dépend du contrat et de la SCPI ; il n’existe pas de pourcentage universel de répartition direct/assurance-vie.
          </p>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-purple-600" />
          Les 7 données à modéliser avant de choisir
        </h2>
        <ol className="grid md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
          {[
            'Le coût total du contrat d’assurance-vie et les éventuelles conditions propres aux SCPI.',
            'La fiscalité réelle des revenus en direct, y compris l’origine géographique des revenus.',
            'La fiscalité du contrat lors d’un rachat et son ancienneté.',
            'L’impact IFI réel dans les deux modes de détention.',
            'Le besoin de liquidité et le délai acceptable pour récupérer le capital.',
            'La possibilité ou non d’utiliser le crédit, le démembrement ou une autre structuration patrimoniale.',
            'L’objectif de transmission et la rédaction de la clause bénéficiaire.',
          ].map((item, index) => (
            <li key={item} className="flex gap-3 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold shrink-0">{index + 1}</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-600" />
          Risques et points de vigilance
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
            <h3 className="font-bold text-red-900 dark:text-red-200 mb-2">Risque immobilier inchangé</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">L’enveloppe ne garantit ni le rendement ni la valeur économique des actifs immobiliers sous-jacents.</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6">
            <h3 className="font-bold text-orange-900 dark:text-orange-200 mb-2">Liquidité du direct</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">L’AMF rappelle qu’une demande de retrait de SCPI peut rester en attente pendant une durée indéterminée lorsqu’il manque des souscriptions en contrepartie.</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
            <h3 className="font-bold text-purple-900 dark:text-purple-200 mb-2">Règles du contrat</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">En assurance-vie, vérifie le pourcentage de revenus reversé, les frais, les délais, les restrictions d’arbitrage et la liste réelle des SCPI disponibles.</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">Crédit et effet de levier</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">Le crédit peut améliorer ou dégrader le résultat selon le coût du financement, l’évolution des distributions et la valeur des parts.</p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 dark:bg-gray-900 rounded-2xl p-8 border border-slate-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-5">Sources officielles à vérifier</h2>
        <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <li>
            <a className="text-blue-700 dark:text-blue-300 underline" href="https://bofip.impots.gouv.fr/bofip/11360-PGP.html/identifiant=BOI-PAT-IFI-20-30-20-20240605" target="_blank" rel="noreferrer">BOFiP — IFI : évaluation des contrats d’assurance-vie en unités de compte</a>
          </li>
          <li>
            <a className="text-blue-700 dark:text-blue-300 underline" href="https://bofip.impots.gouv.fr/bofip/11314-PGP.html/identifiant=BOI-PAT-IFI-20-20-30-30-20180608" target="_blank" rel="noreferrer">BOFiP — IFI : actifs immobiliers dans les unités de compte</a>
          </li>
          <li>
            <a className="text-blue-700 dark:text-blue-300 underline" href="https://www.economie.gouv.fr/particuliers/gerer-mon-argent/gerer-mon-budget-et-mon-epargne/quelle-est-la-fiscalite-de-lassurance-vie" target="_blank" rel="noreferrer">Ministère de l’Économie — fiscalité de l’assurance-vie</a>
          </li>
          <li>
            <a className="text-blue-700 dark:text-blue-300 underline" href="https://www.amf-france.org/fr/le-mediateur/journal-de-bord-du-mediateur/dossiers-du-mois/scpi-une-demande-de-retrait-meme-reguliere-peut-etre-executee-dans-un-delai-indetermine" target="_blank" rel="noreferrer">AMF — risque de liquidité et retrait des parts de SCPI</a>
          </li>
        </ul>
        <p className="mt-5 text-xs text-gray-500 dark:text-gray-400">
          Les règles fiscales et les conditions contractuelles peuvent évoluer. Cette page est pédagogique et ne remplace pas une analyse fiscale, juridique ou patrimoniale individualisée.
        </p>
      </section>

      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">Conclusion</h2>
        <p className="text-lg leading-relaxed mb-4">
          Le direct n’est pas « meilleur » que l’assurance-vie, et l’assurance-vie n’est pas automatiquement plus avantageuse lorsque la TMI augmente. Le choix doit être fait après comparaison du contrat, des SCPI accessibles, des frais, de la fiscalité, de l’IFI, de la liquidité, du financement et de la transmission.
        </p>
        <p className="leading-relaxed text-blue-100">
          Pour un dossier réel, la décision doit être chiffrée sur le même horizon et avec les hypothèses du client, plutôt qu’avec une règle générale par tranche d’imposition.
        </p>
      </section>

      <ArticleCtaBlock variant="bottom" topic="assurance-vie" />
    </div>
  );
};
