# Cartographie MaximusSCPI

Audit réalisé le 2026-05-19. À mettre à jour après chaque refonte majeure.

---

## 1. Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + TypeScript 5.5, Vite 5.4 |
| Styling | Tailwind CSS 3.4 (dark mode via class) |
| Backend | Netlify Functions (serverless) |
| Base de données | Supabase (auth + BDD) |
| SEO | Prerender.io (optionnel), `SEOHead.tsx`, `SchemaOrg.tsx` |
| Hébergement | Netlify |
| Pipeline data | `scpi-ingestion/` (Node.js + Playwright) |
| Tests | Vitest (golden snapshots) |
| Math financière | Decimal.js (40 décimales, ROUND_HALF_UP) |

---

## 2. Navigation (router custom)

Pas de React Router. Navigation via `currentView` dans `App.tsx` + `window.history.pushState`.

### Vues principales

```
home                          → Page d'accueil (LandingPage)
comparateur                   → Comparateur SCPI principal ⚠️ STRATÉGIQUE
scpi-detail                   → Fiche SCPI individuelle
simulateurs                   → Hub des simulateurs
guided-journey                → Parcours guidé investisseur
```

### Simulateurs (6)

```
simulateur-impact-fiscal      → Impact fiscal (SCI IR/IS, Holding IS, Direct IR) ⚠️
simulateur-tresorerie-is      → Trésorerie entreprise IS ⚠️
simulateur-credit             → Crédit SCPI
simulateur-demembrement       → Démembrement temporaire
simulateur-enveloppes         → Comparateur enveloppes (AV, direct, SCI)
simulateur-profil-investisseur → Profil investisseur
comparateur-demembrement      → Comparateur démembrement SCPI
```

### Pages piliers SEO

```
investir-scpi                 → Pilier "Investir en SCPI"
rendement-scpi                → Pilier "Rendement SCPI"
fiscalite-scpi                → Page Fiscalité SCPI
acheter-scpi                  → Page Acheter SCPI
comprendre                    → Guide Comprendre SCPI
faq                           → FAQ
```

### Articles (30+)

```
article-scpi-direct-av
article-scpi-credit
article-demembrement
article-scpi-tmi-11 / tmi-30 / tmi-41
article-scpi-europeennes
article-scpi-fiscales
article-scpi-sante / bureaux / commerces / logistique / residentielles
article-per-scpi / sci-scpi / ifi-scpi / succession-scpi
article-diversification-scpi
article-rendement-scpi-2025
article-risques-scpi / frais-scpi / revente-scpi
article-scpi-vs-etf / vs-opci
article-premier-investissement
article-scpi-jeune-actif
```

### Pages conformité / légal

```
mentions-legales              → MentionsLegalesPage
avertissements-risques        → AvertissementsRisquesPage ⚠️
conditions                    → ConditionsUtilisationPage
reclamation                   → ReclamationPage
methodologie-donnees          → MethodologieDonneesPage
expertise-orias               → ExpertiseOriasPage
politique-confidentialite     → PolitiqueConfidentialitePage
```

### Espace B2B / partenaires

```
app-entry / app-login / app-signup
app-client / app-client-cases / app-client-case
app-partner / app-partner-clients / app-partner-client / app-partner-case
app-admin / app-admin-requests
partenaire-cabinet            → Page publique partenaires cabinet
```

---

## 3. Composants sensibles (à ne pas casser)

| Composant | Risque | Raison |
|-----------|--------|--------|
| `App.tsx` | CRITIQUE | Router central — toute vue passe par là |
| `ComparateurScpi.tsx` | CRITIQUE | Comparateur principal — cœur du produit |
| `ComparisonTable.tsx` | CRITIQUE | Rendu tableau comparateur |
| `src/domain/` | CRITIQUE | Calculs financiers purs (Decimal.js) |
| `src/data/scpiData.ts` | CRITIQUE | Données maître 150+ SCPI |
| `SEOHead.tsx` | ÉLEVÉ | Métadonnées SEO par page |
| `SchemaOrg.tsx` | ÉLEVÉ | Schema.org JSON-LD |
| `ScpiDetailPage.tsx` | ÉLEVÉ | Fiche SCPI — page clé SEO |
| `SimulateurImpactFiscal` | ÉLEVÉ | Simulateur le plus complexe |
| `SimulateurTresorerieIS` | ÉLEVÉ | Simulateur B2B stratégique |
| `DisclaimerBox.tsx` | MOYEN | Conformité CIF |
| `LegalFooter.tsx` | MOYEN | Conformité CIF |
| `ComparisonWarning.tsx` | MOYEN | Conformité CIF — comparateur |

---

## 4. Simulateurs existants — détail

### `SimulateurImpactFiscal` (src/pages/)
- Domaine : `src/domain/strategies/` (runDirectIR, runSciIR, runSciIS, runHoldingIS)
- Calculs : Decimal.js, amortissement mensuel agrégé annuel
- Tests : `src/tests/golden/` (golden snapshots case1…caseN.json)
- PDF export : `src/lib/pdfImpactFiscal.ts`
- UI : `src/ui/simulators/impact-fiscal/`
- ⚠️ Ne pas modifier sans relancer `npm test`

### `SimulateurTresorerieIS` (src/pages/)
- Calculs IS : `src/lib/calculsIS.ts`
- Cible : chefs d'entreprise, trésorerie société

### `ScpiCreditSimulator` (src/components/)
- Simulation SCPI à crédit

### `ScpiDemembrementSimulator` (src/components/)
- Démembrement temporaire (nue-propriété / usufruit)

### `ScpiEnvelopeComparator` (src/components/)
- Comparateur enveloppes : AV, direct, SCI IS
- Backup existant : `ScpiEnvelopeComparator.tsx.backup`

### `InvestorProfileSimulator` (src/components/)
- Qualification du profil investisseur

### `ComparateurDemembrementScpi` (src/components/)
- Comparateur spécifique démembrement entre SCPI

---

## 5. Fonctions Netlify

| Fonction | Rôle |
|----------|------|
| `request-access` | Création demandes d'accès partenaires |
| `claim-invite` | Activation lien d'invitation |
| `invite-user` | Envoi invitation utilisateur |
| `admin-invite-user` | Invitation admin |
| `admin-list-access-requests` | Liste des demandes admin |
| `admin-decide-access-request` | Validation/refus demande |
| `generate_partner_pdf` | Génération PDF partenaire |
| `_invite-utils` | Utilitaires partagés auth |

---

## 6. Pipeline data (`scpi-ingestion/`)

Projet Node.js séparé :
- `downloader.ts` — Playwright, téléchargement PDFs bulletins trimestriels
- `extractor.ts` — Extraction HTML/texte depuis PDFs
- `supabase.ts` — Upload vers Supabase
- `qa.ts` — Contrôles qualité
- `scoring/maximusScore.ts` — Algorithme de scoring SCPI
- Données générées → `src/data/scpiData.ts` ou Supabase

---

## 7. Points de risque SEO

| Risque | Localisation | Priorité |
|--------|-------------|----------|
| SEOHead absent sur certaines vues | Vérifier chaque `currentView` | ÉLEVÉE |
| Schema.org incomplet sur fiches SCPI | `ScpiDetailPage.tsx` | ÉLEVÉE |
| Pages statiques générées au build | `npm run build` doit tourner sans erreur | ÉLEVÉE |
| Maillage interne via `semanticCocon.ts` | Vérifier cohérence avec nouvelles pages | MOYENNE |
| Vitesse de chargement | Lazy loading à maintenir | MOYENNE |
| URLs propres via `pushState` | Toute nouvelle vue doit avoir une URL logique | ÉLEVÉE |

---

## 8. Points de risque conformité

| Risque | Localisation | Priorité |
|--------|-------------|----------|
| Simulateurs sans disclaimer visible | `SimulateurImpactFiscal`, `ScpiCreditSimulator` | CRITIQUE |
| Résultats de simulation sans mention "indicatif" | Tous les simulateurs | CRITIQUE |
| CTA trop directifs ("achetez maintenant") | `Hero.tsx`, landing pages | ÉLEVÉE |
| Articles sans mention risque en bas | Articles thématiques | ÉLEVÉE |
| Comparateur sans avertissement | `ComparateurScpi.tsx` (disclaimer présent — à maintenir) | MOYENNE |
| Données SCPI présentées comme garanties | `ScpiDetailPage`, `scpiData.ts` | ÉLEVÉE |

---

## 9. Zones à ne pas modifier sans validation

1. **`src/domain/`** — Logique métier financière. Tout changement = relancer `npm test`
2. **`src/data/scpiData.ts`** — Données maître. Modifier uniquement via pipeline ou manuellement avec source vérifiée
3. **`App.tsx` (router)** — Toute nouvelle vue doit suivre le pattern existant exactement
4. **`SEOHead.tsx` + `SchemaOrg.tsx`** — Ne pas modifier la signature sans vérifier tous les appelants
5. **`ComparateurScpi.tsx`** — Composant stratégique. Toute modification = test manuel complet
6. **Fonctions Netlify** — Auth critique. Ne pas modifier sans tester le flux complet
7. **`src/tests/golden/`** — Golden snapshots. Ne modifier que si les calculs ont intentionnellement changé

---

## 10. Proposition de suite

Voir `docs/agents/README.md` pour les règles opérationnelles complètes.

Prochaines actions suggérées par priorité :
1. **Audit conformité CIF** des simulateurs (disclaimers, hypothèses visibles) — Agent 04
2. **Audit SEO** des pages piliers (Hn, schema.org, maillage) — Agent 01
3. **Fiabilisation data** SCPI (sources manquantes, données "à vérifier") — Agent 03
4. **Audit UX** du comparateur et du hero — Agent 06
