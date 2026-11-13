# Cadrage — Bandeau cookies non bloquant et mesure d'audience exemptée (RECOVERY-203)

13/11/2026 · Eric Bellaiche (décision « fait A et B », 13/11/2026, 8 h 55)

## En bref

Deux corrections, dans une seule pull request sans déploiement :

- **A. Le bandeau cookies ne bloque plus la page.** La fenêtre plein écran (fond noir, carte centrée) devient un bandeau en bas d'écran. Le simulateur reste visible et utilisable avant tout choix.
- **B. La mesure interne du parcours (`funnel_events`) fonctionne sans consentement**, dans le cadre de l'exemption « mesure d'audience » de la CNIL : anonyme, pour le seul compte de MaximusSCPI, sans Google, avec un droit d'opposition accessible.

Ouverture décidée explicitement par Eric le 13/11/2026, en dérogation à la règle « aucun nouveau chantier produit » d'AGENTS.md (WIP > 1 assumé par le responsable, RECOVERY-201 et RECOVERY-202 restant ouvertes).

## Constat (vérifié dans le code et la base le 13/11/2026)

| Sujet | Constat | Statut |
| --- | --- | --- |
| Fenêtre cookies | `CookieConsent.tsx` : `fixed inset-0`, fond `bg-black/60 backdrop-blur-sm`, carte centrée. Toute la page est masquée jusqu'au choix. | Certain |
| Fermer = refuser | La croix et le clic sur le fond appellent `closeBanner()`, qui enregistre `analytics: false, marketing: false`. | Certain |
| Suivi interne | `trackFunnelEvent` ne fait rien sans `analytics: true` (`funnelAnalytics.ts`). Seuls les visiteurs qui cliquent « Accepter tout » sont comptés. | Certain |
| Volume mesuré | 85 événements depuis le 29/09/2026 ; depuis le 02/11, 2 sessions seulement (quiz du 06/11 et du 12/11). | Certain |
| Lien « Gérer les cookies » du pied de page | `Footer.tsx` appelle `openSettings()` sur sa propre instance du hook `useCookieConsent` ; cette instance n'affiche rien. Le lien est sans effet. | Certain (lecture du code) |
| Choix personnalisés | `CookieSettings` enregistre via sa propre instance du hook ; la fenêtre principale garde `showBanner = true` et réapparaît après « Enregistrer mes choix », jusqu'au rechargement. | Probable (lecture du code) |
| Données stockées | L'endpoint `netlify/functions/funnel-event.ts` n'écrit que `event_name`, `session_id` (UUID aléatoire de session d'onglet), `path`, `metadata` ; pas d'adresse IP, pas d'email. | Certain |
| Lien avec les leads | 6 lignes portent `lead_request_id`, qui relie un événement à une fiche `contact_submissions` (email, nom). | Certain |
| Hébergement | Supabase `eu-north-1` (Stockholm). Région d'exécution des fonctions Netlify : non configurée dans `netlify.toml`. | Certain / à vérifier |

## A. Bandeau en bas d'écran

- Position : `fixed`, en bas, pleine largeur, carte centrée (max 64 rem), au-dessus des barres collantes du comparateur le temps du choix. Aucun fond assombri, aucun flou, aucune capture du défilement.
- Le pied de page reste atteignable : tant que le bandeau est affiché, une marge basse égale à sa hauteur est ajoutée au `body`.
- Contenu, court (2 phrases) :
  > **Cookies**
  > Avec votre accord, Google Analytics et Google Ads mesurent la fréquentation et nos campagnes. Une mesure d'audience anonyme, réservée à MaximusSCPI, reste active : vous pouvez vous y opposer dans « Personnaliser ».
- Actions : **Accepter** et **Refuser**, de même taille, côte à côte ; lien **Personnaliser** ; lien **Continuer sans accepter** en haut à droite (équivaut à Refuser, comme aujourd'hui la croix).
- Accessibilité : `role="region"`, `aria-label="Gestion des cookies"`, boutons focusables, pas de piège de focus.

## B. Mesure d'audience exemptée

### Conditions CNIL retenues et réponse apportée

| Condition (lignes directrices CNIL « cookies et autres traceurs », exemption mesure d'audience) | Réponse dans ce chantier |
| --- | --- |
| Finalité strictement limitée à la mesure d'audience du site, pour le compte exclusif de l'éditeur | Événements de parcours internes uniquement ; table `funnel_events` de MaximusSCPI ; aucun envoi à GTM, GA4 ou Google Ads sans consentement. |
| Données statistiques anonymes, sans recoupement avec d'autres traitements | Sans consentement, `lead_request_id` est retiré côté navigateur **et** refusé par l'endpoint. Pas d'IP stockée. Identifiant de session aléatoire, limité à l'onglet (`sessionStorage`). Engagement d'usage : les horodatages des événements exemptés ne sont jamais rapprochés des fiches `contact_submissions`. |
| Information des personnes et droit d'opposition simple | Mention dans le bandeau ; bloc dédié dans « Personnaliser » avec un interrupteur d'opposition ; lien « Gérer les cookies » du pied de page réparé. |
| Durée de vie du traceur limitée (13 mois maximum) | `sessionStorage` : effacé à la fermeture de l'onglet. L'opposition est mémorisée dans `localStorage` (choix de l'utilisateur, pas un traceur de mesure). |
| Conservation limitée des données collectées (25 mois maximum) | **Hors périmètre de cette PR** : purge à mettre en place avant le 29/10/2028 (première ligne : 29/09/2026). Durées à confirmer sur la version à jour des lignes directrices. |

*À vérifier :* depuis le 1er janvier 2026, la CNIL ne publie plus de liste de solutions exemptées ; c'est à l'éditeur de démontrer que son outil remplit les conditions. Ce cadrage en tient lieu de documentation technique ; la politique de confidentialité (PDF) doit être mise à jour en conséquence.

### Comportement cible de `trackFunnelEvent`

| Situation | Événement interne `/api/funnel-event` | `lead_request_id` | `dataLayer` (GTM) / GA4 | UTM en `sessionStorage` |
| --- | --- | --- | --- | --- |
| Opposition enregistrée | Rien | — | Rien | Rien |
| Consentement mesure (`analytics: true`) | Oui, inchangé | Conservé | Inchangé | Inchangé |
| Pas de consentement (absent, refusé, illisible) | Oui, avec `measurement: "exempt"` | Retiré | Rien | Rien (UTM de la page d'arrivée gardées en mémoire seulement) |

L'endpoint accepte la nouvelle clé `measurement` (valeur unique `"exempt"`) et répond `400 exempt_with_lead_reference` si une requête exemptée contient `lead_request_id`. Les lignes sans `measurement` restent les lignes consenties, ce qui permet de segmenter.

### Opposition

- Clé `localStorage` : `maximus-audience-optout` = `"1"`.
- « Personnaliser » : nouveau bloc « Mesure d'audience anonyme (sans consentement) », interrupteur actif par défaut ; le désactiver puis « Enregistrer mes choix » enregistre l'opposition.
- « Tout accepter » lève l'opposition (le consentement couvre la mesure). « Refuser » et « Continuer sans accepter » ne valent pas opposition à la mesure exemptée ; le bandeau le dit.

## Périmètre exact des fichiers

- Modifiés : `src/components/CookieConsent.tsx`, `src/components/CookieSettings.tsx` (bloc d'opposition, texte GA4 précisé, fenêtre placée au-dessus de l'en-tête), `src/hooks/useCookieConsent.ts`, `src/utils/analyticsConsent.ts`, `src/utils/funnelAnalytics.ts`, `netlify/functions/funnel-event.ts`, `src/tests/funnelAttribution.test.ts`, `src/tests/funnelEventEndpoint.test.ts`, `scripts/analytics/funnelConversions.test.mjs`, `scripts/analytics/funnelEndpoint.test.mjs`, `tasks/backlog.md`.
- Créés : `docs/cadrage/RECOVERY-203-cookies-mesure-exemptee.md`, `src/tests/cookieConsentExempt.test.ts`.
- Non touchés : les 4 fichiers protégés, `src/App.tsx`, `src/components/Footer.tsx` (le lien est réparé par le hook), Supabase (aucune migration).

## Hors périmètre, à traiter séparément

1. **Politique de confidentialité (PDF)** : ajouter la mesure d'audience exemptée, sa finalité, sa durée et le droit d'opposition. Document juridique : rédaction à valider par Eric.
2. **Purge à 25 mois** de `funnel_events` (tâche Supabase planifiée).
3. **Expéditeur des alertes « Nouveau lead »** (`onboarding@resend.dev`) : point C, non retenu à ce stade.
4. **Région des fonctions Netlify** : vérifier qu'elle est en Europe ou documenter le transit.

## Tests nommés et recette

- `npx vitest run src/tests/funnelAttribution.test.ts src/tests/funnelEventEndpoint.test.ts src/tests/cookieConsentExempt.test.ts`
- `node --test scripts/analytics/funnelEndpoint.test.mjs scripts/analytics/funnelConversions.test.mjs`
- Vitest complet ; `npx vite build`.
- Rendu du bandeau vérifié en 390 × 844 (mobile) et 1440 × 900 (desktop).
- Après mise en ligne (contrôle post-release) : en navigation privée sur `/simulateur-scpi/?utm_source=test_eric_exempt`, cliquer « Continuer sans accepter », lancer une simulation ; une ligne `simulation_start` avec `measurement = exempt` et `utm_source = test_eric_exempt` doit apparaître, sans `lead_request_id`. Puis s'opposer dans « Gérer les cookies » : plus aucune ligne.

## Indicateur

À J+14 après mise en ligne : nombre de sessions mesurées sur `/simulateur-scpi/` par semaine, comparé aux 2 sessions mesurées du 02/11 au 12/11. Si le volume reste inférieur à 10 sessions par semaine, le problème est le trafic, plus la mesure.
