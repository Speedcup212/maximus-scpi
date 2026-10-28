# Backlog — MaximusSCPI Recovery

> Ordre strict. Aucun chantier ne saute la file sans défaut P0 de production.
> WIP = 1.

---

## File de reprise

| Ordre | ID | Priorité | Description | Statut |
|------:|----|----------|-------------|--------|
| 1 | RECOVERY-001 | P0 | Régimes de liquidité / comparabilité / consommateurs montés | ✅ Code + build validés ; publication différée au RC |
| 2 | RECOVERY-002 | P1 | Restaurer uniquement les décisions UX déjà validées sur la home : H1 validé, cartes outils, `Comprendre`, retrait des chiffres 4 650 / 330 M€, responsive, sans changer logo/header/footer hors décision existante | 🔄 En cours |
| 3 | RECOVERY-003 | P1 | Simplifier la CI : un seul flux test → build → package ; supprimer le doublon de packaging ; sortir les artefacts `.netlify/` du suivi Git | ⏸️ Gelé jusqu'à RECOVERY-002 |
| 4 | RECOVERY-004 | P0 release | Construire RC-1 et exécuter le gate complet avant un unique déploiement Netlify | ⏸️ En attente |
| 5 | RECOVERY-005 | P2 | Reprendre la dette TypeScript par petits lots uniquement après RC-1 | ⏸️ Différé |

---

## Chantiers volontairement gelés

- Surveillance / Monitor.
- Extension de 61 à 212 SCPI.
- Plugin ChatGPT.
- Nouvelles fonctionnalités espace client hors correction bloquante.
- Nouvelle refonte graphique.
- Recherche de moat / nouveaux modèles commerciaux.
- Nettoyage TypeScript global.
- Nouveaux déploiements Netlify hors RC-1 ou hotfix production critique.

---

## Anciennes tâches

Les anciennes tâches `TASK-*` restent historiquement traçables dans Git et `tasks/done.md`, mais ne pilotent plus la phase Recovery. Toute reprise doit être requalifiée en `RECOVERY-*` et replacée dans l'ordre ci-dessus.


## RECOVERY-027 — CORUM document backfill (autorisé le 27/10/2026)

P0 actif : découverte officielle complète, double extraction PDF, preuves et reprise idempotente ; aucun changement des seuils de readiness. Périmètre : scripts/agents/corum_document_pipeline*, tests dédiés, workflow planifié, routage Supabase du pipeline et migration de journalisation privée. Vérification des 65 fonds et des exceptions existantes.

RECOVERY-027 — Jalons atteints : 65 PASS / 65 readiness, pipeline protégé appliqué et exécution OIDC réelle PASS. Certification exhaustive des anciennes archives : 36 bulletins encore en QA ; aucune clôture fictive. Livraison du code via PR #212, fusion conditionnée aux checks exacts.

## RECOVERY-028 — Hotfix conformité éditoriale production (autorisé le 28/10/2026)

Exception P0 de production explicitement autorisée par Eric Bellaiche le 28/10/2026.
Branche : `hotfix/conformite-editoriale-20261028`, depuis `main` (`b9cfca2`).
RECOVERY-002 et RECOVERY-027 restent inchangés ; aucune nouvelle fonctionnalité.

Périmètre exact (textes, gabarits, gardes SEO et tests ; aucune donnée SCPI) :

```text
index.html
public/merci-guide-comparatif.html
public/merci-landing-page copy.html
public/merci-landing-page.calendly.html
public/merci-landing-page.html
scripts/enrichScpiStaticHtml.mjs
scripts/generateArticleStaticPages.js
scripts/generateArticlesFromTSX.js
scripts/generateOptimizedStaticPages.js
scripts/generateOptimizedThematicPages.js
scripts/generateSeoStaticShells.js
scripts/generateStaticPages.js
scripts/test-execution-seo.mjs
scripts/test-editorial-browser.mjs
scripts/test-static-scpi-history.mjs
src/App.tsx
src/SurveillanceApp.tsx
src/components/AboutModal.tsx
src/components/AboutUsPage.tsx
src/components/AvertissementsRisquesPage.tsx
src/components/ConditionsUtilisationPage.tsx
src/components/DynamicHero.tsx
src/components/ExpertBanner.tsx
src/components/ExpertiseOriasPage.tsx
src/components/FAQPage.tsx
src/components/Footer.tsx
src/components/LandingPage.tsx
src/components/LeadMagnetEmailForm.tsx
src/components/LegalFooter.tsx
src/components/MethodologieDonneesPage.tsx
src/components/OptimizedArticlePage.tsx
src/components/OptimizedThematicLandingPage.tsx
src/components/ReviewsModal.tsx
src/components/SEOHead.tsx
src/components/ScpiCreditSimulator.tsx
src/components/ScpiDemembrementSimulator.tsx
src/components/ScpiExamplePage.tsx
src/components/ScpiGestionnairesHubPage.tsx
src/components/ScpiIndicatorHistory.tsx
src/components/ScpiLandingPage.tsx
src/components/ScpiObjectifsHubPage.tsx
src/components/ScpiSecteursHubPage.tsx
src/components/ThematicLandingPage.tsx
src/components/UnderstandingSCPI.tsx
src/components/articles/100000EurosFondsEurosCoutOpportuniteArticle.tsx
src/components/articles/AchatScpiCreditEffetLevierFiscaliteArticle.tsx
src/components/articles/DiversificationScpiCombienNombrePartsArticle.tsx
src/components/articles/FraisScpiSouscriptionGestionPerformanceArticle.tsx
src/components/articles/Investir200000EurosScpiPortefeuilleDiversifieArticle.tsx
src/components/articles/PerScpiRetraiteDeductionFiscaleArticle.tsx
src/components/articles/PremierInvestissementScpiDebutantGuideArticle.tsx
src/components/articles/RisquesScpiVacanceLocativeLiquiditeArticle.tsx
src/components/articles/SciScpiSocieteCivileImmobilierePartsArticle.tsx
src/components/articles/ScpiBureauxTertiaireTeletravail2025Article.tsx
src/components/articles/ScpiCommercesRetailECommerceOpportunitesArticle.tsx
src/components/articles/ScpiFiscalesMalrauxDeficitFoncier2025Article.tsx
src/components/articles/ScpiLogistiqueEntrepotsECommerce2025Article.tsx
src/components/articles/ScpiOuEtfImmobilierReitComparatifArticle.tsx
src/components/articles/ScpiOuImmobilierLocatifComparatif20AnsArticle.tsx
src/components/articles/ScpiOuOpciDifferencesAvantagesArticle.tsx
src/components/articles/ScpiResidentiellesLogementLocatifScpiHabitationArticle.tsx
src/components/articles/SuccessionScpiTransmissionDroitsHeritageArticle.tsx
src/components/fintech/ProFintechComparator.tsx
src/components/fintech/SCPICardDark.tsx
src/components/scpiEducational/documentsReglementairesScpiContent.ts
src/components/scpiEducational/fraisScpiContent.ts
src/components/scpiEducational/retrocommissionsScpiContent.ts
src/data/thematicLandingPages.ts
src/utils/articleGenerator.ts
src/utils/landingPageConfig.ts
src/utils/landingPagesContent.ts
src/utils/pdfGenerator.ts
tasks/backlog.md
```

Validation : `npm run build` (ou Vite et générateurs hors réseau si blocage),
`node --test scripts/test-execution-seo.mjs`, test historique, `npm test`,
recherches source et dist, comparaison HTML / React sur les neuf routes demandées.
Défaut `/actualites/` démontré par HTTP 404 le 28/10/2026 ; seule l'exception
d'index est autorisée, avec maintien de la garde 404 sur les slugs inconnus.

Résultats locaux : Vite compilé, 65/65 fiches générées, contrôles SEO ciblés et
historique validés ; Vitest 144 tests / 22 fichiers. Contrôle des HTML générés et
du JSON-LD documenté dans le rapport. Le build standard est bloqué par tsx
(IPC EPERM) ; Chromium est bloqué par socket() EPERM, donc le gate de
pré-rendu / profondeur des articles reste à valider dans la CI. Aucun secret
Supabase n'a été inventé ; aucun contrôle financier distant n'est revendiqué.

Le test SEO existant déclenche aussi le contrôle Chromium des neuf routes en CI
(ou RUN_EDITORIAL_BROWSER=true). Les réponses FAQ sont effectivement ouvertes,
les erreurs React et les notes structurées sont contrôlées. La preuve JSON est
incluse dans l'artefact CI scpi-existing-browser déjà prévu par le dépôt.

Statut : correctif implémenté, PR vers main à examiner, sans merge ni
déploiement. Gate navigateur/build complet requis avant fusion. Clôture
conditionnée au report sur Recovery et au contrôle public après décision de
fusion d'Eric. Le défaut de production reste ouvert jusqu'à ce contrôle.
