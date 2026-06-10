import React from 'react'
import { ArrowRight, BookOpen, Target, AlertTriangle, Building2, Scale, Lightbulb, TrendingUp, CheckCircle2 } from 'lucide-react'
import SEOHead from './SEOHead'
import SchemaOrg from './SchemaOrg'

const ConstruirePortefeuilleScpiPage: React.FC = () => {
  const sectionClass = 'bg-slate-900/80 border border-slate-700/70 rounded-2xl p-6 md:p-8 mb-8'

  const newGuides = [
    {
      slug: 'scpi-expatrie-fiscalite',
      title: 'SCPI pour expatrié : opportunité ou complexité fiscale ?',
      desc: 'Fiscalité internationale, conventions, déclaration et vigilance pour investir en SCPI depuis l\'étranger.',
      icon: '🌍',
    },
    {
      slug: 'declaration-revenus-scpi-erreurs',
      title: 'Déclaration des revenus SCPI : les erreurs fréquentes',
      desc: 'IFU, brut/net, revenus étrangers, assurance-vie : les 10 erreurs à éviter dans sa déclaration.',
      icon: '📋',
    },
    {
      slug: 'scpi-investir-en-couple',
      title: 'SCPI en couple : faut-il investir seul, à deux ou via société ?',
      desc: 'Indivision, communauté, séparation, société : quel mode de détention choisir ?',
      icon: '👫',
    },
    {
      slug: 'scpi-hotellerie-tourisme',
      title: 'SCPI hôtellerie et tourisme : opportunité ou volatilité ?',
      desc: 'Analyse du secteur hôtelier : rendement, cyclicité, baux, dépendance aux opérateurs.',
      icon: '🏨',
    },
    {
      slug: 'investir-scpi-une-fois-ou-progressivement',
      title: 'SCPI : faut-il investir en une fois ou progressivement ?',
      desc: 'Comparaison des deux approches : exposition immédiate, lissage du prix, frais, risque de calendrier.',
      icon: '📊',
    },
    {
      slug: 'scpi-internationales-diversification',
      title: 'SCPI internationales : diversification ou effet marketing ?',
      desc: 'Distinguer SCPI européennes et internationales : zones, change, fiscalité, marketing.',
      icon: '🌐',
    },
  ]

  const existingGuides = [
    { slug: 'combien-investir-scpi', title: 'Combien investir en SCPI selon son patrimoine' },
    { slug: 'allocation-scpi', title: 'Allocation SCPI : diversification et fiscalité' },
    { slug: 'scpi-revenus-complementaires', title: 'SCPI revenus complémentaires' },
    { slug: 'scpi-retraite', title: 'SCPI pour la retraite' },
    { slug: 'scpi-credit', title: 'SCPI à crédit' },
    { slug: 'scpi-demembrement', title: 'Démembrement SCPI' },
    { slug: 'scpi-fiscalite', title: 'Fiscalité SCPI' },
    { slug: 'liquidite-scpi', title: 'Liquidité SCPI' },
    { slug: 'frais-scpi', title: 'Frais SCPI' },
    { slug: 'rendement-net-scpi', title: 'Rendement net SCPI' },
    { slug: 'decote-valeur-reconstitution-scpi', title: 'Décote et valeur de reconstitution SCPI' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <SchemaOrg
        type="Article"
        data={{
          title: 'Construire son portefeuille SCPI intelligemment',
          description: 'Guides, méthodes et points de vigilance pour comprendre comment assembler une allocation SCPI cohérente.',
          datePublished: '2026-06-10',
          dateModified: '2026-06-10',
          url: 'https://maximusscpi.com/articles/construire-portefeuille-scpi',
        }}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className={sectionClass}>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-300 mb-5">
            <BookOpen className="h-4 w-4" />
            Collection spéciale
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
            Construire son portefeuille SCPI intelligemment
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            Guides, méthodes et points de vigilance pour comprendre comment assembler une allocation SCPI
            cohérente selon son montant, son horizon, sa fiscalité et son besoin de revenus.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="/comparateur-scpi"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Comparer les SCPI
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <a
              href="/#quiz-section"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-emerald-300 transition-colors hover:bg-slate-700"
            >
              Faire le questionnaire investisseur
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>

        {/* Pourquoi cette collection */}
        <section className={sectionClass}>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            Pourquoi cette collection existe
          </h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            Un portefeuille de SCPI ne se construit pas uniquement sur le taux de distribution. Beaucoup
            d'investisseurs commettent l'erreur de choisir leurs SCPI sur le seul rendement affiché, sans
            vérifier la cohérence globale de leur allocation.
          </p>
          <p className="text-slate-300 leading-relaxed mb-6">
            Une allocation SCPI cohérente prend en compte plusieurs dimensions :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { title: 'Objectif patrimonial', desc: 'Revenus, transmission, fiscalité, diversification' },
              { title: 'Fiscalité', desc: 'TMI, enveloppe (direct, AV, PER), démembrement' },
              { title: 'Horizon', desc: '8-10 ans minimum, adapter la stratégie à l\'âge' },
              { title: 'Besoin de revenus', desc: 'Distribution immédiate ou capitalisation différée' },
              { title: 'Liquidité', desc: 'Anticiper les délais de revente et la collecte' },
              { title: 'Diversification', desc: 'Secteurs, géographies, sociétés de gestion' },
              { title: 'Cohérence du prix', desc: 'Prix de part, valeur de reconstitution, décote' },
              { title: 'Risques', desc: 'Perte en capital, vacance, cyclicité, endettement' },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
                <h3 className="text-sm font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Nouveaux guides */}
        <section className={sectionClass}>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-emerald-400" />
            Les nouveaux guides ajoutés
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Des articles inédits pour approfondir des angles spécifiques de la construction de portefeuille SCPI.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {newGuides.map((guide) => (
              <a
                key={guide.slug}
                href={`/${guide.slug}`}
                className="group bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 hover:border-emerald-500/50 hover:bg-slate-800 transition-all duration-200"
              >
                <span className="text-2xl mb-3 block">{guide.icon}</span>
                <h3 className="text-sm font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                  {guide.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">{guide.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Guides existants */}
        <section className={sectionClass}>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            Guides existants à lire aussi
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Ces articles complètent la collection et abordent des aspects essentiels de l'allocation SCPI.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {existingGuides.map((guide) => (
              <a
                key={guide.slug}
                href={`/${guide.slug}`}
                className="group bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 hover:border-emerald-500/50 hover:bg-slate-800 transition-all duration-200"
              >
                <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  {guide.title}
                </h3>
              </a>
            ))}
          </div>
        </section>

        {/* Méthode */}
        <section className={sectionClass}>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            Méthode MaximusSCPI : construire son allocation en 5 étapes
          </h2>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Définir le besoin', desc: 'Revenus, retraite, fiscalité, diversification. Quel est votre objectif principal ?' },
              { step: '2', title: 'Évaluer l\'horizon d\'investissement', desc: 'Quand aurez-vous besoin de récupérer votre capital ? Plus l\'horizon est long, plus la diversification est possible.' },
              { step: '3', title: 'Comparer les indicateurs financiers et immobiliers', desc: 'TDVM, TOF, capitalisation, endettement, report à nouveau, valeur de reconstitution : croiser plusieurs indicateurs.' },
              { step: '4', title: 'Vérifier la fiscalité et le mode de détention', desc: 'Direct, assurance-vie, PER, démembrement, SCI : le choix de l\'enveloppe impacte le rendement net.' },
              { step: '5', title: 'Construire une allocation diversifiée et cohérente', desc: 'Secteurs, géographies, sociétés de gestion : répartir pour mutualiser les risques sans sur-diversifier.' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4 rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-emerald-400">{item.step}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Points de vigilance */}
        <section className={sectionClass}>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Points de vigilance
          </h2>
          <ul className="space-y-2">
            {[
              'Capital non garanti — la valeur des parts peut baisser.',
              'Revenus non garantis — ils dépendent de l\'occupation et de la conjoncture.',
              'Liquidité non garantie — la revente peut prendre plusieurs mois.',
              'Horizon long terme — 8 à 10 ans minimum recommandé.',
              'Fiscalité à anticiper — l\'imposition impacte significativement le rendement net.',
              'Performances passées non garanties — elles ne préjugent pas des résultats futurs.',
              'Allocation à adapter à la situation personnelle — il n\'existe pas de portefeuille universel.',
            ].map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
            <p className="text-xs text-amber-200 leading-relaxed">
              Les SCPI présentent un risque de perte en capital, des revenus non garantis et une liquidité limitée.
              Les informations présentées sont pédagogiques et ne constituent pas une recommandation personnalisée.
            </p>
          </div>
        </section>

        {/* CTA final */}
        <section className="bg-gradient-to-br from-emerald-900/40 to-slate-900/60 border border-emerald-500/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Avant de choisir une SCPI, vérifiez la cohérence de votre allocation
          </h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Utilisez le comparateur MaximusSCPI pour analyser les indicateurs clés, ou faites le questionnaire
            investisseur pour obtenir une pré-orientation pédagogique.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/comparateur-scpi"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Comparer les SCPI
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <a
              href="/#quiz-section"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-6 py-3 text-sm font-semibold text-emerald-300 transition-colors hover:bg-slate-700"
            >
              Faire le questionnaire investisseur
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </section>

        {/* Mention risques */}
        <p className="text-center text-xs text-slate-500 mt-8 leading-relaxed">
          Les SCPI présentent un risque de perte en capital, des revenus non garantis et une liquidité limitée.
          Les informations présentées sont pédagogiques et ne constituent pas une recommandation personnalisée.
        </p>
      </div>
    </div>
  )
}

export default ConstruirePortefeuilleScpiPage
