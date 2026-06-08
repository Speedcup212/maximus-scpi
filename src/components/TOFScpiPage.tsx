import React from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  Globe,
  Info,
  Scale,
  TrendingUp,
} from 'lucide-react'
import SchemaOrg, { generateBreadcrumbs } from './SchemaOrg'
import Breadcrumb from './Breadcrumb'
import { CALENDLY_URL } from '../config/calendly'

interface TOFScpiPageProps {
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}

const FAQ_ITEMS = [
  {
    question: "Qu'est-ce qu'un bon TOF pour une SCPI ?",
    answer:
      "Il n'existe pas de seuil universel. Un TOF supérieur à 95 % est souvent considéré comme solide sur le marché français, mais le secteur, la zone géographique et l'historique du patrimoine doivent être analysés. Un TOF élevé n'est qu'un indicateur parmi d'autres : capitalisation, rendement, endettement, décote ou surcote, frais et fiscalité nette.",
  },
  {
    question: 'Le TOF garantit-il le rendement ?',
    answer:
      "Non. Le TOF mesure la part des loyers encaissés par rapport aux loyers théoriques. Il ne garantit ni le montant des distributions futures, ni la stabilité du rendement. Les revenus SCPI ne sont pas garantis et peuvent fluctuer selon l'occupation, les loyers et la gestion.",
  },
  {
    question: 'Faut-il éviter une SCPI avec un TOF faible ?',
    answer:
      "Un TOF faible mérite une analyse approfondie : vacance temporaire, travaux, repositionnement ou difficulté locative structurelle. Ce n'est pas automatiquement un motif d'exclusion, mais un signal de vigilance à croiser avec l'évolution sur plusieurs exercices, le secteur et la stratégie du gestionnaire.",
  },
  {
    question: 'Quelle différence entre TOF et taux de distribution ?',
    answer:
      "Le TOF (taux d'occupation financier) mesure la capacité locative du patrimoine. Le taux de distribution (TDVM) mesure le revenu distribué aux associés par rapport au prix de la part. Une SCPI peut afficher un TOF élevé et un rendement modeste, ou l'inverse selon sa politique de distribution et ses frais.",
  },
  {
    question: 'Le TOF suffit-il pour choisir une SCPI ?',
    answer:
      "Non. Le TOF est un critère de lecture de la qualité locative, pas un critère de sélection suffisant. Il doit être croisé avec la capitalisation, le rendement, l'endettement, la décote ou surcote sur valeur de reconstitution, les frais, le report à nouveau, la zone géographique et le secteur immobilier.",
  },
]

const CRITERIA_CARDS = [
  {
    title: 'Capitalisation',
    text: "La taille de la SCPI influence sa capacité de diversification et sa résilience. Une capitalisation modeste peut concentrer le risque sur peu d'actifs.",
  },
  {
    title: 'Rendement',
    text: "Le taux de distribution est une donnée historique. Il doit être analysé avec la fiscalité nette, les frais et la soutenabilité du niveau de distribution.",
  },
  {
    title: 'Endettement',
    text: "Un endettement élevé peut amplifier les performances mais aussi les risques en période de hausse des taux ou de baisse des loyers.",
  },
  {
    title: 'Décote / surcote',
    text: "Comparer le prix de souscription à la valeur de reconstitution permet de vérifier si l'on achète le patrimoine à un prix cohérent.",
  },
  {
    title: 'Report à nouveau',
    text: "Le report à nouveau reflète la capacité de la SCPI à lisser ses distributions et à renforcer son patrimoine sur la durée.",
  },
  {
    title: 'Frais',
    text: "Les frais de souscription et de gestion pèsent directement sur le rendement net perçu par l'investisseur.",
  },
  {
    title: 'Zone géographique',
    text: "Une exposition concentrée sur une seule zone peut accentuer le risque locatif même avec un TOF élevé.",
  },
  {
    title: 'Secteur immobilier',
    text: "Bureaux, commerces, logistique ou santé n'ont pas les mêmes cycles locatifs. Le TOF doit être interprété selon le secteur.",
  },
]

const COMMON_ERRORS = [
  'Choisir une SCPI uniquement sur son rendement affiché.',
  'Ignorer le TOF ou ne regarder qu\'un seul exercice.',
  'Comparer des SCPI de secteurs différents sans contexte.',
  'Confondre TOF élevé et garantie de revenus.',
  'Ne pas analyser l\'évolution du TOF sur plusieurs périodes.',
]

const PRACTICAL_CASES = [
  {
    title: 'SCPI A — rendement élevé, TOF en baisse',
    text: "Une SCPI affiche un taux de distribution attractif, mais son TOF recule depuis deux exercices. La baisse d'occupation peut signaler une pression locative ou un repositionnement du patrimoine. Le rendement passé ne préjuge pas du rendement futur.",
  },
  {
    title: 'SCPI B — TOF élevé, surcote importante',
    text: "Le patrimoine semble bien occupé (TOF > 97 %), mais la part se négocie au-dessus de la valeur de reconstitution. L'investisseur paie une prime qui peut réduire la marge de sécurité à la revente.",
  },
  {
    title: 'SCPI C — TOF moyen, décote et relocation',
    text: "Un TOF temporairement en retrait peut coïncider avec des travaux ou une relocation stratégique. Si la décote est significative et la stratégie documentée, la situation mérite une analyse approfondie — sans constituer une préconisation.",
  },
]

const TOFScpiPage: React.FC<TOFScpiPageProps> = ({ onNavigate, onComparateurClick }) => {
  const breadcrumbs = generateBreadcrumbs('/tof-scpi')
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const isoDate = new Date().toISOString().split('T')[0]

  const handleComparateurClick = () => {
    if (onComparateurClick) onComparateurClick()
    else if (onNavigate) onNavigate('/comparateur-scpi')
  }

  const sectionClass = 'bg-slate-900/80 border border-slate-700/70 rounded-2xl p-6 md:p-8 mb-8'
  const h2Class = 'text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2'

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      <SchemaOrg type="BreadcrumbList" data={{ items: breadcrumbs }} />
      <SchemaOrg type="FAQPage" data={{ questions: FAQ_ITEMS }} />
      <SchemaOrg
        type="Article"
        data={{
          title: 'TOF SCPI : définition, calcul et analyse avant d\'investir',
          description:
            'Comprenez le TOF d\'une SCPI, ses limites et les critères à croiser : rendement, capitalisation, endettement, décote, frais et fiscalité.',
          datePublished: '2026-01-01',
          dateModified: isoDate,
          url: '/tof-scpi',
        }}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-sm text-slate-400 mb-3">
          Dernière mise à jour : {currentDate}
        </div>

        <Breadcrumb items={breadcrumbs} onNavigate={onNavigate} />

        {/* Hero */}
        <div className={`${sectionClass} mb-8`}>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-300 mb-5">
            <BarChart3 className="h-4 w-4" />
            Indicateur SCPI
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
            TOF SCPI : comprendre le taux d'occupation financier avant d'investir
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            Le TOF mesure la part des loyers effectivement encaissés par rapport aux
            loyers qui seraient facturés si tout le patrimoine était loué. C'est un
            indicateur clé pour évaluer la qualité locative d'une SCPI.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleComparateurClick}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Comparer les SCPI selon leur TOF
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-emerald-300 transition-colors hover:bg-slate-700"
            >
              Prendre rendez-vous
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>

        {/* Réponse courte */}
        <section className={sectionClass}>
          <h2 className={h2Class}>
            <Info className="w-5 h-5 text-emerald-400" />
            À quoi sert le TOF d'une SCPI ?
          </h2>
          <p className="text-slate-300 leading-relaxed">
            Le TOF aide à mesurer la capacité d'une SCPI à louer son patrimoine et à
            encaisser ses loyers. Un TOF élevé peut indiquer une bonne occupation
            locative, mais il doit être analysé avec d'autres critères : capitalisation,
            rendement, endettement, report à nouveau, frais, décote ou surcote sur valeur
            de reconstitution.
          </p>
        </section>

        {/* Définition */}
        <section className={sectionClass}>
          <h2 className={h2Class}>
            <BookOpen className="w-5 h-5 text-emerald-400" />
            Définition pédagogique
          </h2>
          <div className="space-y-4 text-slate-300 leading-relaxed">
            <p>
              Le <strong className="text-white">TOF (taux d'occupation financier)</strong>{' '}
              exprime le rapport entre les loyers effectivement encaissés et les loyers
              théoriques qui seraient perçus si l'ensemble du patrimoine était occupé et
              générateur de loyers.
            </p>
            <p>
              Il ne faut pas le confondre avec le{' '}
              <strong className="text-white">taux d'occupation physique</strong>, qui
              mesure la surface louée. Deux indicateurs complémentaires, mais distincts.
            </p>
            <p>
              Un TOF de 100 % n'est pas automatiquement synonyme de bonne SCPI : il peut
              coïncider avec un rendement faible, une surcote importante ou une
              concentration sectorielle défavorable.
            </p>
            <p>
              Un TOF faible peut signaler une vacance locative, des travaux en cours, un
              repositionnement stratégique ou des difficultés d'attractivité du patrimoine.
              L'évolution sur plusieurs exercices est plus informative qu'une photographie
              ponctuelle.
            </p>
          </div>
        </section>

        {/* Tableau comparatif */}
        <section className={sectionClass}>
          <h2 className={h2Class}>
            <Scale className="w-5 h-5 text-emerald-400" />
            Comment interpréter le niveau de TOF ?
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="py-3 pr-4 font-semibold text-slate-200">Niveau</th>
                  <th className="py-3 pr-4 font-semibold text-emerald-300">Avantage possible</th>
                  <th className="py-3 font-semibold text-amber-300">Point de vigilance</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-slate-800">
                  <td className="py-4 pr-4 font-medium text-white whitespace-nowrap">TOF ≥ 95 %</td>
                  <td className="py-4 pr-4">
                    Occupation financière élevée, généralement rassurante sur la capacité à
                    facturer les loyers.
                  </td>
                  <td className="py-4">
                    Ne garantit pas le rendement. À croiser avec le prix de souscription, la
                    surcote éventuelle et la qualité du patrimoine.
                  </td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-4 pr-4 font-medium text-white whitespace-nowrap">TOF entre 90 % et 95 %</td>
                  <td className="py-4 pr-4">
                    Niveau généralement solide, compatible avec une SCPI correctement occupée.
                  </td>
                  <td className="py-4">
                    Analyser l'évolution sur plusieurs trimestres et comprendre les éventuelles
                    vacances ou relocations.
                  </td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-4 pr-4 font-medium text-white whitespace-nowrap">TOF entre 85 % et 90 %</td>
                  <td className="py-4 pr-4">
                    Situation parfois temporaire : travaux, arbitrages, relocation ou
                    repositionnement du patrimoine.
                  </td>
                  <td className="py-4">
                    Zone de vigilance. Il faut identifier les causes et vérifier si la baisse
                    est ponctuelle ou structurelle.
                  </td>
                </tr>
                <tr>
                  <td className="py-4 pr-4 font-medium text-white whitespace-nowrap">TOF &lt; 85 %</td>
                  <td className="py-4 pr-4">
                    Potentiel de redressement si la vacance est temporaire et bien expliquée.
                  </td>
                  <td className="py-4">
                    Signal faible. Risque de vacance durable, baisse des revenus ou difficulté
                    d'attractivité du patrimoine.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-slate-500 leading-relaxed">
            Ces seuils sont des repères indicatifs. Ils ne suffisent pas à juger une SCPI. Le
            TOF doit être croisé avec le secteur immobilier, la capitalisation, le rendement,
            l'endettement, les frais, la décote ou surcote sur valeur de reconstitution et
            l'évolution historique du patrimoine.
          </p>
        </section>

        {/* Critères à croiser */}
        <section className={sectionClass}>
          <h2 className={h2Class}>
            <Building2 className="w-5 h-5 text-emerald-400" />
            Critères à croiser avec le TOF
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CRITERIA_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4"
              >
                <h3 className="text-sm font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Erreurs fréquentes */}
        <section className={sectionClass}>
          <h2 className={h2Class}>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Erreurs fréquentes
          </h2>
          <ul className="space-y-2">
            {COMMON_ERRORS.map((error) => (
              <li key={error} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-amber-400 shrink-0 mt-0.5">✕</span>
                {error}
              </li>
            ))}
          </ul>
        </section>

        {/* Cas pratiques */}
        <section className={sectionClass}>
          <h2 className={h2Class}>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Cas pratiques pédagogiques
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Exemples génériques à titre de simulation pédagogique — ne constituent pas
            une analyse de SCPI identifiées.
          </p>
          <div className="space-y-4">
            {PRACTICAL_CASES.map((cas) => (
              <div
                key={cas.title}
                className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4"
              >
                <h3 className="text-sm font-semibold text-white mb-2">{cas.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{cas.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className={sectionClass}>
          <h2 className={h2Class}>Questions fréquentes</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <div key={item.question} className="border-b border-slate-800 pb-4 last:border-0">
                <h3 className="text-sm font-semibold text-white mb-2">{item.question}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Maillage interne */}
        <section className={sectionClass}>
          <h2 className={h2Class}>
            <Globe className="w-5 h-5 text-emerald-400" />
            Poursuivre votre analyse
          </h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/comparateur-scpi" className="text-emerald-400 hover:underline">
                Comparateur SCPI — filtrer par TOF, rendement et secteur
              </a>
            </li>
            <li>
              <a href="/scpi-europeennes" className="text-emerald-400 hover:underline">
                SCPI européennes — diversification géographique
              </a>
            </li>
          </ul>
        </section>

        {/* Mention conformité */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 mb-8">
          <p className="text-xs text-slate-500 leading-relaxed">
            Cette page est pédagogique. Elle ne constitue pas une recommandation
            personnalisée ni un conseil en investissement. Avant toute souscription, il
            convient d'analyser votre situation, votre fiscalité, votre horizon, vos
            objectifs et les documents réglementaires des SCPI. Investir en SCPI comporte
            des risques : perte en capital, revenus non garantis, liquidité limitée.
          </p>
        </div>

        {/* CTA final */}
        <div className="flex flex-col gap-3 sm:flex-row justify-center mb-8">
          <button
            type="button"
            onClick={handleComparateurClick}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Comparer les SCPI selon leur TOF
            <ArrowRight className="h-4 w-4" />
          </button>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-slate-800 px-6 py-3 text-sm font-semibold text-emerald-300 transition-colors hover:bg-slate-700"
          >
            Prendre rendez-vous
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default TOFScpiPage
