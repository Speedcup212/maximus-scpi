import { useState, type FormEvent } from 'react';
import SEOHead from '../components/SEOHead';
import { submitLead } from '../utils/leadSubmitter';

const enabled = import.meta.env.VITE_PARTNER_RECRUITMENT_ENABLED === 'true';
const initial = { name: '', email: '', profile: '', platform: '', url: '', audience: '', message: '', website: '' };
const benefits = [
  ['Des outils utiles à votre audience', 'Comparateur, simulateurs et ressources pédagogiques sur les SCPI.'],
  ['Une relation claire', 'Vous présentez les outils et invitez votre audience à découvrir MaximusSCPI. Le cabinet assure le conseil personnalisé.'],
  ['Une collaboration sans droit d’entrée', 'Pas de quota de vente ni de rémunération au recrutement de nouveaux partenaires.'],
  ['Une rémunération encadrée', 'Les modalités éventuelles de rémunération à la performance sont définies dans une convention, après validation de votre candidature.'],
];
const steps = [
  ['Candidatez', 'Présentez votre activité et votre audience.'],
  ['Échangeons', 'Un entretien permet de vérifier la complémentarité et le cadre de collaboration.'],
  ['Formalisez', 'Convention et règles de communication avant toute activation.'],
  ['Partagez', 'Après validation, diffusez les supports autorisés et votre lien personnalisé.'],
];
const faqs = [
  ['Dois-je être conseiller financier ?', 'Ce programme vise uniquement la mise en relation. Le partenaire ne fournit ni recommandation personnalisée, ni conseil en investissement, ni service de placement. Le cabinet examine les besoins et l’adéquation de chaque investissement.'],
  ['Puis-je communiquer sur les réseaux sociaux ?', 'Uniquement après validation du partenariat et dans le respect des supports autorisés. Le caractère commercial doit être clairement indiqué et les risques présentés de manière équilibrée. Les créateurs sont invités à se former et à obtenir le certificat ARPP de l’influence responsable dans la finance.'],
  ['Comment suis-je rémunéré ?', 'Les conditions, l’assiette et les modalités de paiement éventuelles figurent dans la convention. Une visite, un clic, une demande de rendez-vous ou un rendez-vous ne déclenchent pas à eux seuls de rémunération. Aucun revenu n’est garanti.'],
  ['Puis-je recommander une SCPI ou recueillir une souscription ?', 'Non. Le programme ne permet ni recommandation de produit ou d’allocation, ni démarchage financier, ni collecte de fonds, d’ordres ou de données patrimoniales des investisseurs. Les personnes intéressées prennent directement contact avec le cabinet.'],
  ['La candidature vaut-elle acceptation ?', 'Non. Elle ouvre uniquement une prise de contact. Aucun lien de diffusion ni engagement de rémunération n’est activé avant validation et signature de la convention.'],
];

export default function Partenaires() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const change = (key: keyof typeof initial, value: string) => setForm(previous => ({ ...previous, [key]: value }));
  const input = 'mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white';
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled || status === 'sending' || form.website) return;
    const name = form.name.trim(), email = form.email.trim(), url = form.url.trim();
    if (!name || !email || !form.profile || !form.platform || !url) return;
    try {
      const parsed = new URL(url);
      if (!['https:', 'http:'].includes(parsed.protocol)) { setStatus('error'); return; }
      setStatus('sending');
      const result = await submitLead({
        channel: 'partner', form_type: 'lead_partner', context_type: 'partner_recruitment',
        context_slug: 'createur-apporteur',
        identity: { nom: name, email },
        answers: { profile: form.profile, platform: form.platform, public_profile_url: url, audience_band: form.audience, application_version: 'v1' },
        message: form.message.trim(),
      });
      setStatus(result.ok ? 'success' : 'error');
      if (result.ok) setForm(initial);
    } catch { setStatus('error'); }
  }

  return (
    <main className="text-slate-900 dark:text-white">
      <SEOHead title="Devenir partenaire | MaximusSCPI Partners" description="Créateurs de contenu, blogueurs et professionnels : découvrez le projet de partenariat MaximusSCPI autour de la pédagogie et des outils SCPI." canonical="https://maximusscpi.com/partenaires/" noIndex={!enabled} />
      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">MaximusSCPI Partners</p>
            <h1 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">Valorisez votre audience. Nous assurons le conseil.</h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-300">Vous créez du contenu sur l’immobilier, l’épargne ou la retraite ? Faites découvrir à votre communauté des outils pour mieux comprendre les SCPI, dans un cadre de partenariat transparent.</p>
            <a href="#candidature" className="mt-8 inline-flex rounded-xl bg-amber-300 px-6 py-3 font-semibold text-slate-950 hover:bg-amber-200">Découvrir la candidature</a>
            <p className="mt-4 text-sm text-slate-400">Sans droit d’entrée • Collaboration sur sélection • Aucun revenu garanti</p>
          </div>
          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-7">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">Deux rôles complémentaires</p>
            <h2 className="mt-5 text-2xl font-semibold">Vous créez le lien.</h2>
            <p className="mt-2 text-slate-300">Vous présentez nos ressources pédagogiques à votre communauté, sans conseiller de placement.</p>
            <div className="my-6 border-t border-slate-700" />
            <h2 className="text-2xl font-semibold">Nous prenons en charge le conseil.</h2>
            <p className="mt-2 text-slate-300">Un conseiller en investissements financiers étudie les besoins, les risques et l’adéquation avant toute éventuelle souscription.</p>
            <a href="/expertise-orias-cif/" className="mt-5 inline-block text-sm text-amber-300 underline">Découvrir notre cadre professionnel</a>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-3xl font-semibold">Un partenariat conçu pour les créateurs de confiance</h2>
        <p className="mt-4 max-w-3xl text-slate-600 dark:text-slate-300">Créateurs YouTube, Instagram ou TikTok, blogueurs, auteurs de newsletters, podcasteurs et professionnels : nous recherchons des audiences francophones intéressées par l’investissement et une démarche pédagogique responsable.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {benefits.map(([title, description]) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"><h3 className="text-lg font-semibold">{title}</h3><p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">{description}</p></article>)}
        </div>
      </section>
      <section className="bg-slate-100 dark:bg-slate-800/50">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="text-3xl font-semibold">Comment ça fonctionne ?</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-4">
            {steps.map(([title, description], index) => <li key={title}><span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 font-bold text-white dark:bg-amber-300 dark:text-slate-900">{index + 1}</span><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{description}</p></li>)}
          </ol>
        </div>
      </section>
      <section id="candidature" className="mx-auto grid max-w-6xl scroll-mt-24 gap-8 px-6 py-14 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold">Devenez partenaire MaximusSCPI</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">Parlez-nous de votre activité. La candidature ne constitue ni une acceptation, ni un engagement de rémunération.</p>
          <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">Les SCPI présentent notamment un risque de perte en capital, de liquidité limitée et de revenus non garantis.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          {!enabled && <p className="mb-5 rounded-xl bg-slate-100 p-4 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">Programme en préparation. Les candidatures ne sont pas encore ouvertes.</p>}
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-medium">Nom ou nom professionnel *<input className={input} required maxLength={120} autoComplete="name" value={form.name} onChange={e => change('name', e.target.value)} /></label>
            <label className="block text-sm font-medium">Email professionnel *<input className={input} required type="email" maxLength={254} autoComplete="email" value={form.email} onChange={e => change('email', e.target.value)} /></label>
            <label className="block text-sm font-medium">Votre profil *<select className={input} required value={form.profile} onChange={e => change('profile', e.target.value)}><option value="">Sélectionner</option>{['Créateur de contenu', 'Blogueur / newsletter', 'Podcasteur', 'Professionnel de l’immobilier', 'Autre professionnel'].map(p => <option key={p}>{p}</option>)}</select></label>
            <label className="block text-sm font-medium">Canal principal *<select className={input} required value={form.platform} onChange={e => change('platform', e.target.value)}><option value="">Sélectionner</option>{['YouTube', 'Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'Blog / newsletter', 'Podcast', 'Autre'].map(p => <option key={p}>{p}</option>)}</select></label>
            <label className="block text-sm font-medium">Lien vers votre profil public ou site *<input className={input} type="url" required maxLength={500} placeholder="https://…" value={form.url} onChange={e => change('url', e.target.value)} /></label>
            <label className="block text-sm font-medium">Taille de votre audience (facultatif)<select className={input} value={form.audience} onChange={e => change('audience', e.target.value)}><option value="">Non renseignée</option>{['Moins de 1 000', '1 000 à 5 000', '5 000 à 20 000', '20 000 à 50 000', 'Plus de 50 000'].map(p => <option key={p}>{p}</option>)}</select></label>
            <label className="block text-sm font-medium">Votre projet (facultatif)<textarea className={input} rows={3} maxLength={1000} value={form.message} onChange={e => change('message', e.target.value)} placeholder="Thématiques abordées, type de collaboration envisagé… Ne transmettez pas de données de vos abonnés." /></label>
            <div className="hidden" aria-hidden="true"><label>Site secondaire<input tabIndex={-1} autoComplete="off" value={form.website} onChange={e => change('website', e.target.value)} /></label></div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">Vos données sont utilisées par le cabinet exploitant MaximusSCPI pour examiner votre candidature et répondre à votre demande. Les champs marqués * sont nécessaires au traitement. Consultez notre <a className="underline" href="/politique_confidentialite_maximusscpi.pdf">politique de confidentialité</a> et nos <a className="underline" href="/mentions_legales_maximusscpi.pdf">mentions légales</a> pour connaître les modalités de traitement et exercer vos droits.</p>
            <button type="submit" disabled={!enabled || status === 'sending'} className="w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-300 dark:text-slate-950">{status === 'sending' ? 'Envoi en cours…' : 'Envoyer ma candidature'}</button>
            <div aria-live="polite">{status === 'success' && <p className="text-sm text-green-700 dark:text-green-300">Votre candidature a bien été reçue. Merci.</p>}{status === 'error' && <p className="text-sm text-red-700 dark:text-red-300">Impossible d’envoyer la demande. Vérifiez vos informations et réessayez.</p>}</div>
          </form>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-6 pb-16">
        <h2 className="text-3xl font-semibold">Questions fréquentes</h2>
        <div className="mt-6 space-y-3">{faqs.map(([question, answer]) => <details key={question} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"><summary className="cursor-pointer font-semibold">{question}</summary><p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">{answer}</p></details>)}</div>
      </section>
    </main>
  );
}
