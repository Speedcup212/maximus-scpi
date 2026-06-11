import React from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Building2,
  Globe,
  Info,
  Lightbulb,
  Scale,
  Target,
  TrendingUp,
} from 'lucide-react'
import SchemaOrg, { generateBreadcrumbs } from './SchemaOrg'
import Breadcrumb from './Breadcrumb'
import ScpiLeadCta from './ScpiLeadCta'
import { CALENDLY_URL } from '../config/calendly'
import {
  AUTHOR_CREDIT,
  COMPLIANCE_TEXT,
  INTERNAL_LINKS,
  RISK_REMINDER,
  type ScpiEducationalPageConfig,
} from './scpiEducational/shared'

interface ScpiEducationalPageLayoutProps {
  config: ScpiEducationalPageConfig
  onNavigate?: (path: string) => void
  onComparateurClick?: () => void
}

const sectionClass = 'bg-slate-900/80 border border-slate-700/70 rounded-2xl p-6 md:p-8 mb-8'
const h2Class = 'text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2'

const ScpiEducationalPageLayout: React.FC<ScpiEducationalPageLayoutProps> = ({
  config,
  onNavigate,
  onComparateurClick,
}) => {
  const breadcrumbs = generateBreadcrumbs(config.path)
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const isoDate = new Date().toISOString().split('T')[0]
  const comparateurLabel = config.comparateurCtaLabel ?? 'Comparer les SCPI'

  const handleComparateurClick = () => {
    if (onComparateurClick) onComparateurClick()
    else if (onNavigate) onNavigate('/comparateur-scpi')
  }

  const internalLinks = INTERNAL_LINKS.filter((link) => link.href !== config.path)

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      <SchemaOrg type="BreadcrumbList" data={{ items: breadcrumbs }} />
      <SchemaOrg type="FAQPage" data={{ questions: config.faqItems }} />
      <SchemaOrg
        type="Article"
        data={{
          title: config.seoTitle,
          description: config.seoDescription,
          datePublished: '2026-01-01',
          dateModified: isoDate,
          url: config.path,
        }}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-sm text-slate-400 mb-1">Dernière mise à jour : {currentDate}</div>
        <p className="text-xs text-slate-500 mb-3">{AUTHOR_CREDIT}</p>

        <Breadcrumb items={breadcrumbs} onNavigate={onNavigate} />

        {/* Hero */}
        <div className={`${sectionClass} mb-8`}>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-300 mb-5">
            <Target className="h-4 w-4" />
            {config.badge}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
            {config.h1}
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed mb-6">{config.heroSubtitle}</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleComparateurClick}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              {comparateurLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-emerald-300 transition-colors hover:bg-slate-700"
            >
              Prendre rendez-vous avec le Cabinet Eric Bellaiche
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>

        {/* Réponse courte IA */}
        <section className={sectionClass}>
          <h2 className={h2Class}>
            <Info className="w-5 h-5 text-emerald-400" />
            {config.shortAnswerTitle}
          </h2>
          <p className="text-slate-300 leading-relaxed">{config.shortAnswer}</p>
        </section>

        {/* À retenir */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 md:p-8 mb-8">
          <h2 className="text-lg font-bold text-emerald-300 mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            À retenir
          </h2>
          <p className="text-slate-200 leading-relaxed font-medium">{config.keyMessage}</p>
        </div>

        {/* Définition */}
        <section className={sectionClass}>
          <h2 className={h2Class}>
            <BookOpen className="w-5 h-5 text-emerald-400" />
            Définition pédagogique
          </h2>
          <div className="space-y-4 text-slate-300 leading-relaxed">
            {config.definitionParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </section>

        {/* Tableau */}
        <section className={sectionClass}>
          <h2 className={h2Class}>
            <Scale className="w-5 h-5 text-emerald-400" />
            {config.tableTitle}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="py-3 pr-4 font-semibold text-slate-200">Repère</th>
                  <th className="py-3 pr-4 font-semibold text-emerald-300">Lecture possible</th>
                  <th className="py-3 font-semibold text-amber-300">Point de vigilance</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {config.tableRows.map((row, index) => (
                  <tr
                    key={row.level}
                    className={index < config.tableRows.length - 1 ? 'border-b border-slate-800' : ''}
                  >
                    <td className="py-4 pr-4 font-medium text-white whitespace-nowrap">{row.level}</td>
                    <td className="py-4 pr-4">{row.advantage}</td>
                    <td className="py-4">{row.vigilance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {config.tableNote && (
            <p className="mt-4 text-xs text-slate-500 leading-relaxed">{config.tableNote}</p>
          )}
        </section>

        {/* Critères */}
        <section className={sectionClass}>
          <h2 className={h2Class}>
            <Building2 className="w-5 h-5 text-emerald-400" />
            {config.criteriaTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {config.criteriaCards.map((card) => (
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

        {/* Erreurs */}
        <section className={sectionClass}>
          <h2 className={h2Class}>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Erreurs fréquentes
          </h2>
          <ul className="space-y-2">
            {config.commonErrors.map((error) => (
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
            Exemples génériques à titre de simulation pédagogique — ne constituent pas une
            analyse de SCPI identifiées ni une recommandation personnalisée au sens de la
            réglementation MIF2.
          </p>
          <div className="space-y-4">
            {config.practicalCases.map((cas) => (
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

        {/* Méthode MaximusSCPI */}
        <section className={sectionClass}>
          <h2 className={h2Class}>
            <Target className="w-5 h-5 text-emerald-400" />
            Méthode MaximusSCPI
          </h2>
          <div className="space-y-4 text-slate-300 leading-relaxed">
            {config.methodParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className={sectionClass}>
          <h2 className={h2Class}>Questions fréquentes</h2>
          <div className="space-y-4">
            {config.faqItems.map((item) => (
              <div key={item.question} className="border-b border-slate-800 pb-4 last:border-0">
                <h3 className="text-sm font-semibold text-white mb-2">{item.question}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Conclusion */}
        <section className={sectionClass}>
          <h2 className={h2Class}>Conclusion</h2>
          <div className="space-y-4 text-slate-300 leading-relaxed mb-6">
            {config.conclusionParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleComparateurClick}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              {comparateurLabel}
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-emerald-300 transition-colors hover:bg-slate-700"
            >
              Valider mon analyse avec un expert
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        {/* Lead CTA — Analyse personnalisée */}
        <ScpiLeadCta />

        {/* Maillage */}
        <section className={sectionClass}>
          <h2 className={h2Class}>
            <Globe className="w-5 h-5 text-emerald-400" />
            Poursuivre votre analyse
          </h2>
          <ul className="space-y-2 text-sm">
            {internalLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-emerald-400 hover:underline">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Conformité */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 mb-8">
          <p className="text-xs text-slate-500 leading-relaxed">
            {COMPLIANCE_TEXT} {RISK_REMINDER}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ScpiEducationalPageLayout
