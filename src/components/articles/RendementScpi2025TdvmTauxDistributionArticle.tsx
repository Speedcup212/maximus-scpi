import React from 'react';
import { AlertTriangle, BarChart3, BookOpen, Calculator, Calendar, CheckCircle2, Clock, Scale, TrendingUp, User } from 'lucide-react';
import ArticleCtaBlock from '../ArticleCtaBlock';

export const RendementScpi2025TdvmTauxDistributionArticle: React.FC = () => {
  return (
    <div className="space-y-12">
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-8 border border-blue-100 dark:border-gray-700">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">Rendement SCPI</span>
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-sm font-semibold rounded-full">Méthodologie</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Rendement SCPI : taux de distribution, prix de part et rendement net réellement comparable
        </h1>

        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Le taux de distribution est utile, mais il ne mesure ni la performance globale ni le rendement net de l’investisseur. Pour comparer deux SCPI, il faut croiser distribution, évolution du prix de part, fiscalité réelle, frais, liquidité et qualité du patrimoine. Une formule unique du type « rendement brut − TMI − 17,2 % » peut être très trompeuse.
        </p>

        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2"><User className="w-4 h-4" /><span>Éric Bellaiche, CGP-CIF</span></div>
          <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>Mise à jour 2026</span></div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>13 min de lecture</span></div>
        </div>
      </section>

      <section className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-7 border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-700 mt-1 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Trois erreurs à éliminer</h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• considérer le taux de distribution comme une performance totale ;</li>
              <li>• appliquer mécaniquement la TMI et un taux de prélèvements sociaux à tous les revenus ;</li>
              <li>• supposer qu’une SCPI en assurance-vie est automatiquement hors IFI.</li>
            </ul>
          </div>
        </div>
      </section>

      <ArticleCtaBlock variant="top" topic="general" />

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          1. Ce que mesure réellement le taux de distribution
        </h2>
        <div className="space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Le taux de distribution rapporte les distributions versées au titre d’une année au prix de référence retenu par la méthodologie réglementaire. Il renseigne sur le revenu distribué, pas sur l’évolution du capital ni sur le rendement net après fiscalité.
          </p>
          <p>
            Une SCPI peut afficher un taux de distribution élevé tout en subissant une baisse du prix de part, une hausse des parts en attente de retrait, une dégradation du TOF ou une baisse des valeurs d’expertise. À l’inverse, une SCPI moins distributive peut préserver davantage la valeur de son patrimoine. Le rendement doit donc être replacé dans une trajectoire.
          </p>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          2. Les cinq étages d’une vraie analyse de rendement
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            ['Distribution', 'Taux distribué, régularité, part récurrente ou exceptionnelle, report à nouveau et résultat distribuable.'],
            ['Prix de part', 'Hausse ou baisse du prix, écart par rapport aux valeurs de réalisation et de reconstitution, historique des revalorisations.'],
            ['Patrimoine', 'TOF, qualité des locataires, WALB/WALT, secteurs, géographies, capex et concentration.'],
            ['Financement', 'Endettement, coût de la dette, maturités de refinancement et sensibilité aux taux.'],
            ['Liquidité', 'Retraits, parts en attente, collecte, marché secondaire et profondeur réelle de la demande.'],
            ['Fiscalité et enveloppe', 'Direct, Europe, assurance-vie, démembrement, crédit ou société : chaque scénario produit un net différent.'],
          ].map(([title, text]) => (
            <div key={title} className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" />{title}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Calculator className="w-8 h-8 text-blue-600" />
          3. Comment calculer un rendement net sans faux raccourci fiscal
        </h2>
        <div className="space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Pour une détention en direct, il faut d’abord identifier la nature des revenus distribués : revenus immobiliers français, revenus étrangers, revenus financiers éventuels et autres composantes. La fiscalité n’est pas uniforme entre ces catégories.
          </p>
          <p>
            Pour les revenus fonciers français, la base fiscale est le revenu net imposable après les règles du régime concerné. La TMI est un taux marginal, pas le taux moyen du foyer. Pour les revenus étrangers, les conventions fiscales peuvent utiliser un crédit d’impôt, un taux effectif ou un autre mécanisme. Il n’existe donc pas de formule européenne unique.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Formule de travail recommandée</h3>
            <p className="font-mono text-sm text-gray-800 dark:text-gray-200">
              Rendement net estimé = distributions réellement perçues − fiscalité réellement applicable − frais d’enveloppe − coûts de financement éventuels
            </p>
            <p className="text-sm mt-3">
              Cette formule ne remplace pas le calcul fiscal du foyer, mais elle évite d’inventer un taux net standard.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Scale className="w-8 h-8 text-blue-600" />
          4. Direct, Europe, assurance-vie, démembrement : ce qui change vraiment
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="text-left p-3 border border-gray-200 dark:border-gray-600">Mode</th>
                <th className="text-left p-3 border border-gray-200 dark:border-gray-600">Atout possible</th>
                <th className="text-left p-3 border border-gray-200 dark:border-gray-600">Vigilance</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-3 border">Direct France</td><td className="p-3 border">Lecture simple, univers large, crédit possible</td><td className="p-3 border">Fiscalité courante, IFI potentiel, liquidité SCPI</td></tr>
              <tr><td className="p-3 border">Direct Europe</td><td className="p-3 border">Diversification et traitement conventionnel différent</td><td className="p-3 border">Fiscalité pays par pays, déclaration, change éventuel</td></tr>
              <tr><td className="p-3 border">Assurance-vie</td><td className="p-3 border">Capitalisation dans le contrat et fiscalité au rachat</td><td className="p-3 border">Frais UC, choix limité, règles de rachat, IFI potentiellement applicable</td></tr>
              <tr><td className="p-3 border">Nue-propriété</td><td className="p-3 border">Prix d’acquisition décoté et absence de distribution au nu-propriétaire</td><td className="p-3 border">Pas de revenus, liquidité faible, clé de démembrement, IFI selon origine du démembrement</td></tr>
              <tr><td className="p-3 border">SCI à l’IS</td><td className="p-3 border">Capitalisation possible au niveau de la société</td><td className="p-3 border">Coûts, IS, distribution, sortie ; les parts de SCPI en pleine propriété ne sont pas amortissables</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          5. Exemple de comparaison correctement cadrée
        </h2>
        <div className="space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Supposons deux SCPI affichant respectivement 5 % et 6 % de taux de distribution. Il serait faux de conclure immédiatement que la seconde est meilleure. Il faut vérifier si le 6 % provient d’un niveau de risque supérieur, d’un résultat non récurrent, d’un prix de part récemment abaissé ou d’un patrimoine plus endetté.
          </p>
          <p>
            La comparaison devient robuste lorsqu’on ajoute l’évolution du prix de part, le TOF, les valeurs d’expertise, l’endettement, la liquidité et la fiscalité correspondant au dossier. Le résultat peut alors s’inverser.
          </p>
        </div>
      </section>

      <section className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Lecture MaximusSCPI</h2>
        <ol className="space-y-3 text-gray-700 dark:text-gray-300">
          <li><strong>1.</strong> Lire le taux de distribution comme un indicateur de revenu, pas comme une performance totale.</li>
          <li><strong>2.</strong> Vérifier la trajectoire du prix de part et des valeurs d’expertise.</li>
          <li><strong>3.</strong> Contrôler TOF, dette, WALB/WALT, diversification et liquidité.</li>
          <li><strong>4.</strong> Recalculer le net selon le mode de détention et la fiscalité réelle du dossier.</li>
          <li><strong>5.</strong> Comparer sur un horizon identique, avec les mêmes hypothèses de frais et de sortie.</li>
        </ol>
      </section>

      <section className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">À retenir</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Un rendement SCPI élevé n’est ni une garantie de performance ni un signal d’achat. Le bon indicateur est un rendement net contextualisé par le prix de part, le patrimoine, la dette, la liquidité, les frais et la fiscalité réelle. C’est cette lecture multi-critères que doivent alimenter le Radar, la Trajectoire et les Signaux MaximusSCPI.
        </p>
      </section>

      <ArticleCtaBlock variant="bottom" topic="general" />
    </div>
  );
};

export default RendementScpi2025TdvmTauxDistributionArticle;
