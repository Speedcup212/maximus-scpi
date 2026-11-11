# RECOVERY-201 — Capture email après simulation : livrable

Date : 11/11/2026 · Branche : `recovery-201-capture-simulation` · Cadrage : `docs/cadrage/RECOVERY-201-capture-simulation.md`

État : **EN COURS**. Le code est prêt et testé.

Déployé et configuré le 11/11/2026 (Supabase, projet ygvsddcpohsnaowofuwc, et Brevo) :
- migration `recovery201_simulation_email_capture` appliquée (colonnes et index vérifiés en base) ;
- fonction `send-simulation-email` mise à jour en version 4 : modèle Brevo n° 6, liste n° 6 et adresse de réponse `eric.bellaiche@gmail.com` par défaut (expéditeur : `eric.bellaiche@maximusscpi.com`, vérifié dans Brevo) (les secrets du même nom, s'ils sont créés, priment) ;
- fonction `calendly-webhook` version 3, sans vérification JWT (ajout de `RDV_PRIS` uniquement) ;
- secret `BREVO_API_KEY` ajouté par Eric dans Supabase (nouvelle clé Brevo `supabase-maximusscpi`) ;
- Brevo, via une fonction ponctuelle protégée par jeton (`brevo-setup-recovery201`, neutralisée ensuite : elle répond 410 et peut être supprimée) :
    - expéditeur vérifié : Eric Bellaiche, `eric.bellaiche@maximusscpi.com`, actif ;
    - attributs créés : `PRENOM`, `TRANCHE_MONTANT`, `MONTANT_50K`, `SOURCE_PAGE`, `CONSENT_DATE`, `RDV_PRIS` ;
    - liste n° 6 « Simulateur SCPI – séquence » ;
    - modèle transactionnel n° 6 « RECOVERY-201 – Votre simulation SCPI », actif, objet « Votre simulation SCPI ».

Pas encore fait : front (pull request non fusionnée), automatisation des emails 2 à 4 (textes à valider).

## Fichiers

| Fichier | Type | Raison |
| --- | --- | --- |
| `src/utils/simulationEmailCapture.ts` | Créé | Logique pure : tranches, source, email, construction du lead et des métadonnées |
| `src/components/SimulationEmailCapture.tsx` | Créé | Le bloc (textes du cadrage mot pour mot), états, champ piège, Calendly à partir de 50 k€ |
| `src/components/ScpiDirectIncomeSimulator.tsx` | Modifié | Insertion du bloc uniquement. Aucun calcul modifié |
| `src/utils/leadSubmitter.ts` | Modifié | Canal `simulateur`, type `lead_simulation_email`, champ `consent` optionnel. Les autres formulaires ne changent pas (test dédié) |
| `src/utils/funnelAnalytics.ts` | Modifié | 3 événements et 2 clés autorisées |
| `netlify/functions/funnel-event.ts` | Modifié | Mêmes ajouts dans les listes autorisées côté serveur |
| `supabase/functions/send-simulation-email/index.ts` | Créé | Email 1 via un modèle Brevo et inscription à la liste de séquence si la case est cochée |
| `supabase/functions/send-simulation-email/logic.ts` | Créé | Validation et formatage côté serveur, testés par Vitest |
| `supabase/functions/calendly-webhook/index.ts` | Modifié | `RDV_PRIS = true` dans Brevo après une réservation, sans bloquer le webhook |
| `supabase/migrations/20261111120000_simulation_email_capture.sql` | Créé | Colonnes `confirmation_sent_at` et `confirmation_error`, plus un index (email, date) |
| `src/tests/simulationEmailCapture.test.ts` | Créé | 34 tests |
| `tasks/backlog.md` | Modifié | Entrée RECOVERY-201 |
| `docs/cadrage/RECOVERY-201-capture-simulation.md` | Créé | Cadrage de référence |

Fichiers protégés (`EducationArticlesIndexPage.tsx`, `FiscaliteScpiPage.tsx`, `InvestirScpiPillarPage.tsx`, `semanticCocon.ts`) et `src/App.tsx` : non modifiés.

## Preuves

| Contrôle | Résultat |
| --- | --- |
| `npx vitest run src/tests/simulationEmailCapture.test.ts` | PASS, 34/34 |
| `npx vitest run` (suite complète) | PASS, 317/317 (38 fichiers) |
| `npx vite build` | PASS (21 s) |
| `npx tsc -p tsconfig.app.json --noEmit` | 1 026 erreurs avant et après : aucune nouvelle, aucune dans les fichiers touchés |
| `npx eslint` sur les fichiers front et de test touchés | PASS |
| Rendu navigateur (build local, Chrome headless) | Voir ci-dessous |

Rendu vérifié :
- **/simulateur-scpi/, 50 000 € (bureau) :** le bloc apparaît après « Projet de 50 000 € ou plus ? », avec le titre « Pas encore prêt pour un échange ? … ». La tranche est préremplie à « 50 000 à 100 000 € ».
- **/simulateur-scpi/, 30 000 € (mobile 390 px) :** le bloc apparaît juste après le résultat, avec le titre court. La tranche est préremplie à « 20 000 à 50 000 € ».
- **/simulateur-revenus-nets-scpi/ :** le bloc apparaît après le résultat, sans bloc rendez-vous.
- **État de succès (via le champ piège, sans appel réseau) :** le texte du cadrage s'affiche avec le bouton « Choisir un créneau en visio ». Aucune erreur JavaScript.

## Limites

- **Fonctions Supabase non vérifiées avec Deno.** Deno n'est pas installé ici. Seule la logique (`logic.ts`) est testée. Le reste suit le même modèle que `calendly-webhook`.
- **Build complet non lancé.** `npm run build` (préchargement Puppeteer et pages statiques) ne l'a pas été, seulement `npx vite build`. La CI GitHub et Netlify le lanceront.
- **Mesure de `simulation_start` légèrement gonflée.** Saisir dans le bloc compte comme une interaction de simulation, à cause du `onChangeCapture` existant sur la grille du simulateur. Effet limité à `simulation_start` et `simulation_result`. Le taux de capture se mesure sur `simulation_email_viewed`.
- **Suivi soumis au consentement.** Les 3 nouveaux événements ne partent que si le visiteur accepte les cookies de mesure, comme les événements existants.
- **Adresse de contact RGPD à confirmer.** Elle est fixée à `eric.bellaiche@gmail.com`, l'adresse déjà affichée dans le pied de page du site.
- **Attributs Brevo à créer avant la mise en ligne** (voir étape 1 ci-dessous). *À vérifier :* le comportement de l'API si un attribut n'existe pas.
- **Règle de gouvernance.** Ce chantier déroge à AGENTS.md (nouveau chantier produit, RECOVERY-200 encore ouverte). Ouverture décidée par Eric, tracée dans `tasks/backlog.md`.

## À faire, dans cet ordre

1. **Front :** fusionner la pull request en squash avec un titre contenant `[deploy]`, par exemple `[deploy] RECOVERY-201: capture email apres simulation`.
2. **Contrôle post-release :** sur `/simulateur-scpi/?utm_source=test_eric`, faire un envoi sans la case puis un avec la case, à 100 000 €. Vérifier ensuite la boîte de réception, `contact_submissions` (`confirmation_sent_at`, `confirmation_error`) et la liste Brevo n° 6.
3. **Emails 2 à 4 :** valider les textes, puis créer l'automatisation Brevo (déclenchée par l'ajout à la liste n° 6, sortie si `RDV_PRIS` est vrai ou si le tag « RÉPONDU » est présent). D'ici là, les contacts qui cochent la case restent dans la liste sans recevoir d'email.
4. **Hors RECOVERY-201, à traiter à part :** les deux anciennes clés Brevo (« Maximus », désactivée ; « API_BREVO », en lecture seule) ne peuvent pas envoyer. Si Netlify utilise l'une d'elles, l'email de bienvenue et les réponses aux demandes d'accès ne partent plus (à vérifier dans les journaux Netlify).

## Email 1 (texte du modèle Brevo n° 6, objet : « Votre simulation SCPI »)

```text
{% if params.PRENOM %}Bonjour {{ params.PRENOM }},{% else %}Bonjour,{% endif %}

Voici la simulation que vous avez faite sur MaximusSCPI.

Vos hypothèses
- Montant : {{ params.MONTANT }}
- Hypothèse de taux de distribution : {{ params.TAUX }} par an
- Délai de jouissance : {{ params.DELAI }}
- Origine des revenus : {{ params.ORIGINE }}
- Tranche marginale d'imposition : {{ params.TMI }}
- Horizon : {{ params.HORIZON }}

Vos résultats estimés
- Revenu brut annuel : {{ params.BRUT_ANNUEL }}
- Revenu net annuel après fiscalité estimée : {{ params.NET_ANNUEL }} ({{ params.NET_MENSUEL }} par mois en année pleine)
- Première année : {{ params.PREMIERE_ANNEE }}
- Revenus nets cumulés sur {{ params.HORIZON }}, sans réinvestissement : {{ params.CUMUL }}

Ces chiffres reposent uniquement sur vos hypothèses et sur une approche fiscale simplifiée. La base imposable réelle, la situation de votre foyer et la SCPI retenue peuvent modifier le résultat. Simulation indicative et non contractuelle, qui ne constitue pas une recommandation personnalisée.

Refaire ma simulation : {{ params.LIEN_SIMULATION }}

Une question sur ces chiffres ? Répondez simplement à cet email.

Eric Bellaiche, conseiller financier – MaximusSCPI · CIF immatriculé à l'ORIAS sous le n° 13001580 (orias.fr), adhérent CNCEF Patrimoine.
Les SCPI présentent un risque de perte en capital et de liquidité. Les revenus ne sont pas garantis et dépendent du marché immobilier. Durée de placement recommandée : 8 à 10 ans minimum.
```

Pas d'appel au rendez-vous dans cet email : il part à tous, case cochée ou non (cadrage, section Conformité).
