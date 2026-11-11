# Cadrage — Capture après simulation (MaximusSCPI)

Nov 11, 2026 · @Eric Bellaiche

## En bref

**Décision proposée : ajouter sous le résultat du simulateur un bloc « Recevoir ma simulation par email » (email + tranche de montant), sans pop-up et sans bloquer le résultat.** Une case facultative, non cochée, ouvre une séquence de 3 emails qui mène au rendez-vous si le montant atteint 50 k€.

- **Pourquoi** *(certain, vu dans ta base)* : depuis le 7 octobre, 8 sessions ont affiché un résultat de simulation, et aucune n'a laissé de coordonnées en dehors de ton test. Le seul bouton proposé aujourd'hui, c'est le rendez-vous. Il n'existe aucune étape plus légère.
- **Limite brutale** *(certain, arithmétique)* : même avec 10 % de capture, 8 sessions en 5 semaines donnent moins d'un contact par mois. Ce correctif est nécessaire, mais il ne suffit pas : le trafic reste le goulot. Les sessions sont en plus sous-comptées, puisque le suivi ne compte que les visiteurs qui acceptent les cookies de mesure.
- **Deux décisions de ta part avant de coller le prompt :**
  1. **Ouvrir la tâche RECOVERY-201.** Ton AGENTS.md interdit tout nouveau chantier produit en mode Recovery, avec une seule P0 à la fois, et RECOVERY-200 est encore en cours.
  2. **Valider les textes et le consentement** des sections 4 et 5, en particulier la règle « aucun appel au rendez-vous dans le premier email ».

## Objectif, indicateurs et règle d'arrêt

L'objectif : obtenir un email qualifié par le montant auprès des visiteurs qui ont fait une simulation sans prendre rendez-vous, puis transformer une partie d'entre eux en rendez-vous à 50 k€ ou plus.

| Indicateur | Définition | Cible à J+30 | Source |
| --- | --- | --- | --- |
| Taux de capture | Envois du formulaire / sessions ayant vu le bloc | 10 % (hypothèse de travail à recaler, pas une donnée de marché) | `funnel_events` |
| Taux d'opt-in | Envois avec la case cochée / envois | Aucune cible : à mesurer | `contact_submissions` |
| Contacts à 50 k€ ou plus | Envois avec une tranche égale ou supérieure à 50 k€ | Aucune cible : à mesurer | `contact_submissions` |
| Rendez-vous issus du bloc | Réservations Calendly avec utm\_content = simulateur-scpi-email ou simulateur-revenus-nets-scpi-email (distinctes des réservations via RdvModal) | Au moins 1 | `calendly-webhook` |

**Règle d'arrêt à J+30 :**

- **Moins de 50 sessions ont vu le bloc :** on ne tire aucune conclusion. Le problème est le trafic, pas le bloc.
- **50 sessions ou plus, et moins de 3 % de capture :** on change la promesse (titre, emplacement) une seule fois, puis on remesure pendant 30 jours.
- **Au moins 3 % de capture, mais aucun rendez-vous à J+60 :** on revoit le contenu des emails 2 à 4, pas le bloc.

## État des lieux (vérifié dans le code et la base, le 11/11/2026)

Un seul composant porte le simulateur concerné. Brevo, Calendly et l'enregistrement des leads existent déjà : on ne crée aucun nouvel outil.

| Sujet | Ce qui existe | Statut |
| --- | --- | --- |
| Simulateur | `src/components/ScpiDirectIncomeSimulator.tsx`, monté sur /simulateur-scpi/ (via `ScpiAcquisitionSimulatorPage.tsx`, avec `onRdvClick`) et sur /simulateur-revenus-nets-scpi/ (via `App.tsx`, sans `onRdvClick`). 7 des 8 sessions mesurées sont sur /simulateur-scpi/. | Certain |
| Appels à l'action actuels | À partir de 50 k€ : « Faire analyser ma simulation » ouvre `RdvModal` (nom, prénom, email, montant, Calendly). En dessous de 50 k€ : un lien vers le comparateur. Rien entre les deux. | Certain |
| Suivi | `trackFunnelEvent` n'envoie rien sans le consentement aux cookies de mesure (`funnelAnalytics.ts`, ligne 70). L'endpoint `/api/funnel-event` refuse tout événement ou clé inconnus (`netlify/functions/funnel-event.ts`). | Certain |
| Leads | `submitLead()` écrit dans `contact_submissions`. Les colonnes `consentement_marketing` et `consentement_date` existent, mais ne sont jamais remplies (0 ligne sur 5). Aucune contrainte CHECK sur `form_type`. | Certain |
| Emails | Brevo est déjà branché : la fonction `sender-add-contact` ajoute à la liste n° 5, et `netlify/functions/utils/email-sender.ts` envoie via `/v3/smtp/email`. La notification admin passe par Resend (`send-lead-notification`). | Certain |
| Calendly | `buildCalendlyUrl` et `openCalendlyPopup` existent. `calendly-webhook` enregistre un `lead_rdv` à chaque réservation. | Certain |
| Composant mort | `EmailSimulationModal.tsx` n'est monté nulle part, n'a aucun consentement et redirige vers une page de remerciement. **À ne pas réutiliser.** | Certain |
| Fichiers protégés | Aucun des 4 fichiers protégés n'est touché par ce chantier. | Certain |
| Gouvernance | AGENTS.md : mode Recovery, aucun nouveau chantier produit, WIP limité à 1 P0. RECOVERY-200 est « EN COURS ». | Certain |

**Trois écarts trouvés en chemin, hors périmètre, à traiter dans une tâche séparée :**

- *Certain :* `RdvModal` collecte nom, email et téléphone sans aucune mention d'information RGPD.
- *Probable :* `LeadMagnetEmailForm` impose la case marketing pour télécharger le guide. Un consentement exigé pour accéder à un contenu risque de ne pas être jugé « libre ».
- *À vérifier :* `calendly-webhook` accepte n'importe quelle requête si le secret `CALENDLY_WEBHOOK_SIGNING_KEY` n'est pas défini. Quelqu'un pourrait alors créer de fausses réservations.

## Parcours UX

Le bloc est toujours visible sous le résultat. Le résultat reste consultable sans email : pas de pop-up, pas de contenu bloqué.

**Emplacement.** Dans la colonne de droite de `ScpiDirectIncomeSimulator`, juste sous la carte « Résultat de la simulation ».

- **Montant simulé de 50 k€ ou plus :** l'ordre devient résultat, puis le bloc rendez-vous actuel (inchangé), puis le bloc email, présenté en solution de repli.
- **Moins de 50 k€ :** l'ordre devient résultat, puis le bloc email (principal), puis le lien vers le comparateur.
- **Sur mobile :** la grille s'empile et le bloc arrive après le résultat. Aucun bandeau collant.
- **Les deux pages** (/simulateur-scpi/ et /simulateur-revenus-nets-scpi/) affichent le bloc. Sur la seconde, il n'y a pas de bloc rendez-vous : le bloc email est donc toujours en position principale.

**Champs :**

1. Email : obligatoire, validé au format.
2. Prénom : facultatif, sert à personnaliser l'email.
3. Montant envisagé : liste obligatoire avec 5 tranches (moins de 20 000 €, 20 à 50 k€, 50 à 100 k€, 100 à 300 k€, plus de 300 k€). Elle est préremplie d'après le montant simulé et reste modifiable.
4. Case « recevoir des informations » : facultative et non cochée. **L'envoi de la simulation ne dépend jamais de cette case.**
5. Champ piège invisible (honeypot) contre les robots : s'il est rempli, on affiche un succès, mais rien n'est enregistré ni envoyé.

**Ce qui est envoyé :** une copie figée de la simulation au moment du clic. Elle comprend le montant, l'hypothèse de taux de distribution, le délai de jouissance, l'origine des revenus, la tranche d'imposition, l'horizon, le revenu net annuel et mensuel, la première année et le cumul.

**États du bloc :**

1. **Repos :** le formulaire.
2. **Envoi :** le bouton est désactivé et affiche « Envoi… ».
3. **Succès :** un message s'affiche sur place, sans redirection, puis l'étape suivante s'adapte au montant (voir la section Routage).
4. **Erreur :** un message s'affiche avec la possibilité de réessayer. Le repli `lead-fallback` existant reste actif.
5. **Déjà envoyé dans la session :** l'état de succès s'affiche directement, pour éviter les doublons.

**Accessibilité :** chaque champ a un `label`, le message d'état est en `aria-live="polite"`, la navigation au clavier est complète, et le bloc suit les couleurs actuelles (vert MaximusSCPI) en clair comme en sombre.

## Textes exacts à l'écran

Ces textes sont à reprendre mot pour mot dans le code. Une seule chose reste à compléter : l'adresse de contact pour les données personnelles.

| Élément | Texte |
| --- | --- |
| Titre (moins de 50 k€, ou page sans bloc rendez-vous) | Recevez votre simulation par email |
| Titre (50 k€ ou plus) | Pas encore prêt pour un échange ? Recevez votre simulation par email |
| Sous-titre | Le détail de vos hypothèses et de vos résultats, pour y revenir à tête reposée. |
| Champ email | Votre email |
| Champ prénom | Votre prénom (facultatif) |
| Champ montant | Montant que vous envisagez de placer |
| Case à cocher (facultative, non cochée) | J'accepte de recevoir par email des informations sur l'investissement en SCPI et des propositions de rendez-vous de la part d'Eric Bellaiche, conseiller financier (MaximusSCPI). Je peux me désinscrire à tout moment. *(version `sim-email-v2` du 11/11/2026 ; la v1 ne mentionnait pas les rendez-vous)* |
| Bouton | Recevoir ma simulation |
| Mention sous le bouton | Vos données sont utilisées par Eric Bellaiche (MaximusSCPI) pour vous envoyer cette simulation et, si vous avez coché la case, des informations sur les SCPI. Elles sont conservées 3 ans après votre dernier contact. Pour y accéder, les corriger ou les supprimer : \[adresse à confirmer\]. Politique de confidentialité |
| Succès (50 k€ ou plus) | C'est envoyé. Vérifiez votre boîte de réception, et vos indésirables. Vous voulez qu'on regarde cette simulation ensemble ? |
| Bouton après succès (50 k€ ou plus) | Choisir un créneau en visio |
| Succès (moins de 50 k€) | C'est envoyé. Vérifiez votre boîte de réception, et vos indésirables. |
| Lien après succès (moins de 50 k€) | Comparer les SCPI |
| Erreur | L'envoi n'a pas abouti. Réessayez dans un instant. |
| Email invalide | Vérifiez votre adresse email. |

**Points à vérifier avant la mise en ligne :**

- La politique de confidentialité (le PDF dans `public/`) doit mentionner ce traitement et Brevo comme sous-traitant.
- Toutes les mentions disent « conseiller financier », conformément à ta règle de communication grand public. Le statut CIF et le numéro ORIAS figurent dans le pied de chaque email.

## Conformité

La règle structurante : le premier email (la simulation) part à tout le monde parce qu'il a été demandé. Les emails 2 à 4 ne partent qu'avec la case cochée. Et chaque email qui montre des chiffres rappelle les risques.

| Règle | Ce qu'on applique | Statut | Source |
| --- | --- | --- | --- |
| Prospection par email vers des particuliers : consentement préalable, libre, avec une case dédiée non pré-cochée | Case facultative, décochée, distincte du bouton | Certain | [CNIL, prospection par email](https://www.cnil.fr/la-prospection-commerciale-par-courrier-electronique) |
| Le consentement doit être libre | L'envoi de la simulation ne dépend jamais de la case | Certain | [CNIL, prospection par email](https://www.cnil.fr/la-prospection-commerciale-par-courrier-electronique) |
| Un message qui découle du service demandé et ne promeut pas d'autres offres n'est pas de la prospection | Email 1 envoyé à tous. Sans la case : aucun appel au rendez-vous, seulement « Refaire ma simulation » et l'invitation à répondre. Avec la case et 50 k€ ou plus : bouton « Faire analyser ma simulation » (Calendly), couvert par le consentement v2, et pied avec moyen d'opposition (« répondez STOP ») | Probable : requalification possible si la part commerciale est significative ; d'où le bouton réservé aux personnes qui ont coché la case | [CNIL, communications électroniques](https://www.cnil.fr/fr/communication-electronique-quelles-regles) |
| Informer à la collecte : identité, finalité, droits | Mention sous le bouton (section Textes) | Certain | [CNIL, communications électroniques](https://www.cnil.fr/fr/communication-electronique-quelles-regles) |
| Chaque sollicitation indique l'émetteur et offre un moyen simple et gratuit de refuser | Pied d'email identique partout, lien de désinscription Brevo dans les emails 2 à 4 | Certain | [CNIL, prospection par email](https://www.cnil.fr/la-prospection-commerciale-par-courrier-electronique) |
| Prospect non client : conservation 3 ans à compter de la collecte ou du dernier contact | Purge 3 ans après le dernier contact venant du prospect (réponse, clic, rendez-vous) | Certain sur les 3 ans. Probable sur ce qui compte comme contact | [CNIL, fiche Commerce](https://www.cnil.fr/sites/default/files/typo/document/Parrainage_Fiches_Commerce.pdf) |
| Pouvoir prouver le consentement | Enregistrer la case, la date, la version du texte et la page | Certain | RGPD, art. 7.1 |
| Communication SCPI équilibrée : les risques doivent figurer dès qu'on présente des avantages. Les CIF sont explicitement visés | Mention des risques dans chaque email chiffré | Certain | [AMF, 12/03/2025](https://pierrepapier.fr/wp-content/uploads/2025/03/2025_03_12_AMF_rappel_acteurs_distribution_promotion_SCPI_obligations.pdf) |
| Un taux de distribution s'accompagne d'un indicateur de performance globale sur la même période. Aucune performance sur moins de 12 mois d'historique | Aucune SCPI nommée avec son taux dans les emails | Certain | [AMF, 12/03/2025](https://pierrepapier.fr/wp-content/uploads/2025/03/2025_03_12_AMF_rappel_acteurs_distribution_promotion_SCPI_obligations.pdf) |
| Pas de recommandation personnalisée sans recueil préalable des informations du client | Contenus généraux par tranche, jamais « cette SCPI est faite pour vous » | Certain (AGENTS.md). La frontière entre information et conseil est à vérifier avec la CNCEF | AGENTS.md |
| Sous-traitants : Brevo, Supabase, Resend | Région d'hébergement Supabase et contrats de sous-traitance à vérifier | À vérifier | — |
| Pixel de suivi des ouvertures : consentement requis pour mesurer les ouvertures individuellement (recommandation CNIL du 14/04/2026) | La case ne couvre pas ce suivi. Chaque envoi passe `contactPixelTrackingConsent: false` et le réglage Brevo « consentement au pixel par contact » doit être activé, contacts inconnus non suivis | Certain sur la règle. À vérifier : le réglage Brevo activé par Eric | [CNIL, pixels de suivi](https://www.cnil.fr/fr/recommandation-pixel-suivi-courriels) |
| Double opt-in | Non mis en place au départ. À activer dans Brevo si les rebonds ou les plaintes augmentent | Probable : non exigé par les textes cités | — |

**Arbitrage à assumer.** Tes règles pour les vidéos (ne pas dire « non garantie », ne pas parler des frais) ne s'appliquent pas à ces emails. Un email reste une trace écrite et conservée, et le rappel de l'AMF couvre toute communication commerciale sur les SCPI, CIF compris. Les risques et les frais y sont donc écrits noir sur blanc.

## Données et suivi

On réutilise `contact_submissions` et `submitLead()`, avec un nouveau `form_type`. L'email et le prénom ne sortent jamais vers `funnel_events`, GTM ou GA4.

**Ligne enregistrée dans `contact_submissions` :**

| Champ | Valeur |
| --- | --- |
| `form_type` | `lead_simulation_email` (nouveau, à ajouter au type `LeadFormType`) |
| `channel` | `simulateur` (nouveau, à ajouter au type `LeadChannel`) |
| `context_slug` | `simulateur-scpi` ou `simulateur-revenus-nets-scpi`, selon la page |
| `email`, `prenom` | Saisis par le visiteur (prénom facultatif) |
| `consentement_marketing`, `consentement_date` | La case et l'horodatage. **Ces colonnes sont remplies pour la première fois.** |
| `answers` | `tranche_montant`, `montant_simule`, `taux_hypothese`, `delai_jouissance_mois`, `origine`, `tmi`, `horizon_ans`, `revenu_brut_annuel, revenu_net_annuel`, `revenu_net_mensuel`, `revenu_premiere_annee`, `cumul_horizon`, `consent_text_version` (par exemple `sim-email-v1`) et `action: "email_simulation"` |
| `confirmation_sent_at`, `confirmation_error` | Nouvelles colonnes (migration) : trace de l'envoi de l'email 1 |

**Nouveaux événements de suivi.** Ils sont à ajouter aux deux listes autorisées : `src/utils/funnelAnalytics.ts` et `netlify/functions/funnel-event.ts`.

| Événement | Quand | Métadonnées |
| --- | --- | --- |
| `simulation_email_viewed` | Le bloc entre à l'écran (une fois par session) | `source` |
| `simulation_email_submitted` | L'envoi a réussi | `source`, `tranche_montant`, `consent_marketing`, `lead_request_id` |
| `simulation_email_calendly_clicked` | Clic sur « Choisir un créneau en visio » après le succès | `source`, `tranche_montant` |

Les clés `tranche_montant` et `consent_marketing` sont à ajouter aux deux listes `METADATA_KEYS` et `allowed`.

**Brevo :**

- Créer une liste « Simulateur SCPI – séquence ». L'identifiant sera fourni à la fonction par le secret `BREVO_SIM_LIST_ID`.
- Attributs : `PRENOM`, `TRANCHE_MONTANT`, `MONTANT_50K` (booléen), `SOURCE_PAGE`, `CONSENT_DATE`, `RDV_PRIS` (booléen).
- Un contact n'est ajouté à la liste que si la case est cochée. Sans la case, Brevo ne fait que l'envoi transactionnel de l'email 1.

**Nouvelle fonction Supabase `send-simulation-email` :**

1. Elle reçoit `{ request_id }` et relit la ligne côté serveur. Elle ne fait jamais confiance au contenu envoyé par le navigateur.
2. Elle refuse si `form_type` diffère de `lead_simulation_email`, si la ligne a plus de 15 minutes, ou si `confirmation_sent_at` est déjà rempli.
3. Elle limite à 3 envois par adresse sur 24 h, en comptant les lignes en base, pour éviter qu'on s'en serve pour bombarder une adresse.
4. Elle valide les nombres par plages (montant entre 1 000 et 5 000 000, taux entre 2 et 10, tranche d'imposition parmi 0, 11, 30, 41 et 45). Aucun texte libre n'apparaît dans l'email, à part le prénom, nettoyé et limité à 40 caractères.
5. Elle envoie l'email 1 via le modèle Brevo (`/v3/smtp/email`, `templateId`), avec Eric en adresse de réponse.
6. Si la case est cochée, elle crée ou met à jour le contact dans la liste de séquence (`/v3/contacts`, `updateEnabled: true`).
7. Elle renseigne `confirmation_sent_at`, ou `confirmation_error` en cas d'échec.

**`calendly-webhook` :** après l'insertion d'une réservation, il met `RDV_PRIS = true` sur le contact Brevo de même email, s'il existe. Cette mise à jour ne bloque jamais le webhook.

## Séquence Brevo : 4 emails

L'email 1 est transactionnel et part à tous. Les emails 2 à 4 forment une automatisation Brevo réservée aux contacts qui ont coché la case. L'appel à l'action change selon `MONTANT_50K`.

| N° | Envoi | Pour qui | Objet | Contenu | Appel à l'action |
| --- | --- | --- | --- | --- | --- |
| 1 | Immédiat | Tous | Votre simulation SCPI : {montant} | Rappel des hypothèses (montant, taux de distribution supposé, délai de jouissance, origine des revenus, tranche d'imposition, horizon) et des résultats (revenu net annuel et mensuel, première année, cumul). Puis le paragraphe « Bon à savoir » (limites et risques) | Case cochée et 50 k€ ou plus : « Faire analyser ma simulation » (Calendly prérempli, `utm_campaign=simulation_email_1`), puis lien « Refaire ma simulation ». Sinon : bouton « Refaire ma simulation » seul. Pour tous : « Une question sur ces chiffres ? Répondez à cet email, je vous réponds personnellement. » |
| 2 | J+2 | Case cochée | 3 chiffres à vérifier avant de choisir une SCPI | Taux d'occupation, endettement, parts en attente de retrait. Pourquoi le taux de distribution affiché ne suffit pas à juger une SCPI | 50 k€ ou plus : « Faire analyser ma simulation » (Calendly). Moins de 50 k€ : « Comparer les SCPI » |
| 3 | J+5 | Case cochée | Détention directe, assurance-vie, démembrement : même somme, autre résultat | Le principe de chaque mode de détention et l'effet général de la tranche d'imposition, sans recommandation | Idem |
| 4 | J+9 | Case cochée | Ce que coûte une SCPI, et ce que paient ces frais | Frais de souscription et de gestion, avec une fourchette de marché à sourcer sur des DIC avant envoi. Horizon de 8 à 10 ans. Ce que fait un conseiller : étude, choix de l'enveloppe, suivi. Dernier email de la série | Idem, plus « C'est le dernier email de cette série. » |

**Pied commun aux 4 emails :**

> Eric Bellaiche, conseiller financier – MaximusSCPI · CIF immatriculé à l'ORIAS sous le n° 13001580 (orias.fr), adhérent CNCEF Patrimoine. Les SCPI présentent un risque de perte en capital et de liquidité. Les revenus ne sont pas garantis et dépendent du marché immobilier. Les chiffres de la simulation reposent sur vos seules hypothèses. Durée de placement recommandée : 8 à 10 ans minimum. \[Se désinscrire\] (emails 2 à 4). Dans l'email 1, pour les personnes qui ont coché la case : « Pour ne plus en recevoir, répondez « STOP » à cet email. » Le lien de désinscription Brevo d'un email transactionnel ne retire pas le contact des envois marketing : d'où la réponse STOP, à traiter à la main (retirer le contact de la liste n° 6).

**La séquence s'arrête quand :**

- un rendez-vous est réservé (`RDV_PRIS = true`, via `calendly-webhook`) ;
- le contact se désinscrit ou que l'adresse rebondit définitivement ;
- le contact répond à un email : Eric ajoute alors le tag « RÉPONDU » à la main dans Brevo, et l'automatisation sort ce contact.

**À vérifier :** « 8 à 10 ans » est un ordre de grandeur courant. Aligne-le sur la durée de placement recommandée indiquée dans le DIC des SCPI que tu places réellement.

## Routage selon le montant et la case

Après l'envoi du formulaire, la ligne est enregistrée et l'email 1 part à tous. Ensuite :

- **À l'écran, selon la tranche :**
    - tranche de 50 k€ ou plus : bouton « Choisir un créneau en visio » (Calendly, nom et email préremplis) ;
    - tranche inférieure à 50 k€ : lien « Comparer les SCPI ».
- **Par email, selon la case :**
    - case cochée : emails 2 à 4 (J+2, J+5, J+9), avec un lien Calendly si la tranche est de 50 k€ ou plus ;
    - case non cochée : aucun autre email.
- **Rendez-vous réservé** (depuis l'écran ou depuis un email) : `RDV_PRIS = true`, et la séquence s'arrête.

Le montant décide de ce qui s'affiche à l'écran, et la case décide de ce qui part ensuite par email. Les deux chemins mènent au rendez-vous, qui arrête la séquence.

## Critères d'acceptation

Le chantier n'est terminé que si chaque ligne ci-dessous est vérifiée. L'affichage se vérifie en local. Les envois, Brevo et le suivi se vérifient en production, car l'endpoint de suivi n'accepte que maximusscpi.com.

- [ ] Le bloc s'affiche sous le résultat sur /simulateur-scpi/ et sur /simulateur-revenus-nets-scpi/, à tous les montants, sur mobile et sur ordinateur, en clair et en sombre
- [ ] Le résultat reste entièrement visible sans saisir d'email
- [ ] La tranche est préremplie d'après le montant simulé (par exemple, 75 000 € donne « 50 à 100 k€ »)
- [ ] Un envoi sans la case crée une ligne avec `consentement_marketing = false`, déclenche l'email 1, et n'ajoute aucun contact à la liste Brevo de séquence
- [ ] Un envoi avec la case crée une ligne avec `consentement_marketing = true`, `consentement_date` et `consent_text_version`, et ajoute le contact à la liste avec `MONTANT_50K` exact
- [ ] L'email 1 arrive en moins de 2 minutes, avec les chiffres affichés à l'écran, la mention des risques, et Eric en adresse de réponse
- [ ] Un quatrième envoi vers la même adresse en 24 h n'envoie pas d'email
- [ ] Le champ piège rempli n'enregistre rien
- [ ] À 50 k€ ou plus, « Choisir un créneau en visio » ouvre Calendly avec le nom et l'email préremplis, et une réservation passe `RDV_PRIS` à true
- [ ] Les 3 nouveaux événements arrivent dans `funnel_events` (avec le consentement aux cookies), et l'endpoint ne renvoie aucune erreur 400
- [ ] Aucune adresse email dans `funnel_events`, `dataLayer` ou GA4
- [ ] Tests nommés PASS, Vitest complet PASS, `npm run build` PASS, et aucun des 4 fichiers protégés modifié
- [ ] Contrôle après mise en production : un envoi réel avec `utm_source=test_eric`, vérifié en base et dans la boîte de réception

## Hors périmètre

Ce chantier ne touche qu'au simulateur direct et aux emails qui en découlent.

- Les autres simulateurs (crédit, démembrement, marché secondaire, enveloppes) et l'espace Pro (`ProDashboard`, qui monte un autre fichier)
- `RdvModal`, le quiz et `LeadMagnetEmailForm` : leurs écarts RGPD sont à traiter dans une tâche séparée
- La suppression de `EmailSimulationModal.tsx`, composant mort : une tâche de nettoyage séparée
- Le PDF de simulation : pas de PDF dans l'email 1, seulement du HTML
- La mesure d'audience sans cookie, pour corriger le sous-comptage des sessions
- La page « Pourquoi un conseiller plutôt qu'une plateforme » et les blocs de vente sur les fiches SCPI
- La remise du DER avant le rendez-vous : elle reste gérée comme aujourd'hui

## Prompt Claude pour Cursor

À coller tel quel dans Cursor, une fois RECOVERY-201 ouverte et ce cadrage placé dans le dépôt (étape 1 du bloc git ci-dessous).

```text
Tu travailles sur le dépôt Speedcup212/maximus-scpi (React/Vite/TypeScript/Tailwind, Supabase, Netlify).
Tâche unique : RECOVERY-201 — capture email après simulation sur le simulateur SCPI direct.

0. AVANT TOUTE MODIFICATION
- Lis AGENTS.md en entier et applique-le. RECOVERY-201 est la seule tâche active.
- Lis docs/cadrage/RECOVERY-201-capture-simulation.md. Ce fichier fait foi pour les textes à l'écran (mot pour mot), la conformité, les données, la séquence d'emails et les critères d'acceptation. N'invente et ne reformule aucun texte. En cas de doute, ce fichier l'emporte sur tes préférences.
- Ne modifie jamais : src/components/EducationArticlesIndexPage.tsx, src/components/FiscaliteScpiPage.tsx, src/components/InvestirScpiPillarPage.tsx, src/data/semanticCocon.ts.
- Ne touche pas à : src/App.tsx, src/components/RdvModal.tsx, src/components/EmailSimulationModal.tsx, ni à aucun autre simulateur, ni aux calculs de ScpiDirectIncomeSimulator.
- Ne fais aucun commit ni push : je m'en charge.

1. PÉRIMÈTRE EXACT (tout autre fichier : arrête-toi et explique pourquoi avant de le toucher)
Créer :
- src/utils/simulationEmailCapture.ts (logique pure, testable)
- src/components/SimulationEmailCapture.tsx
- supabase/functions/send-simulation-email/index.ts
- supabase/migrations/20261111120000_simulation_email_capture.sql
- src/tests/simulationEmailCapture.test.ts
- reports/recovery-201/RECOVERY-201-livrable.md
Modifier :
- src/components/ScpiDirectIncomeSimulator.tsx (insertion du bloc uniquement)
- src/utils/leadSubmitter.ts
- src/utils/funnelAnalytics.ts
- netlify/functions/funnel-event.ts
- supabase/functions/calendly-webhook/index.ts
- tasks/backlog.md

2. BACKLOG
Dans tasks/backlog.md, ajoute à la fin : "## RECOVERY-201 — Capture email après simulation (11/11/2026)" avec l'objectif, la liste des fichiers de l'étape 1, les tests de l'étape 11 et "État : EN COURS".

3. src/utils/leadSubmitter.ts
- Ajoute 'simulateur' à LeadChannel et 'lead_simulation_email' à LeadFormType.
- Ajoute à LeadPayload un champ optionnel consent?: { marketing: boolean; textVersion: string }.
- Uniquement si payload.consent est défini, ajoute à la ligne insérée : consentement_marketing = consent.marketing ; consentement_date = maintenant (ISO) si marketing est vrai, sinon null ; answers.consent_text_version = consent.textVersion.
- Les autres formulaires doivent se comporter exactement comme avant. Ne change rien d'autre.

4. src/utils/funnelAnalytics.ts ET netlify/functions/funnel-event.ts
- Ajoute les événements simulation_email_viewed, simulation_email_submitted et simulation_email_calendly_clicked (au type FunnelEventName et au Set EVENTS).
- Ajoute les clés tranche_montant et consent_marketing (au Set allowed et à METADATA_KEYS). Les booléens sont déjà acceptés par l'endpoint : vérifie-le, sans réécrire la boucle.
- Aucun email ni prénom ne doit jamais passer dans ces métadonnées.

5. src/utils/simulationEmailCapture.ts (fonctions pures, exportées)
- type Tranche = 'moins-20k' | '20-50k' | '50-100k' | '100-300k' | 'plus-300k', avec ces libellés : "Moins de 20 000 €", "20 000 à 50 000 €", "50 000 à 100 000 €", "100 000 à 300 000 €", "Plus de 300 000 €".
- trancheFromAmount(n) : < 20 000 donne moins-20k ; 20 000 à 49 999, 20-50k ; 50 000 à 99 999, 50-100k ; 100 000 à 299 999, 100-300k ; 300 000 et plus, plus-300k.
- isAtLeast50k(tranche) : vrai pour 50-100k, 100-300k et plus-300k.
- sourceFromPath(pathname) : 'simulateur-revenus-nets-scpi' si le chemin commence par /simulateur-revenus-nets-scpi, sinon 'simulateur-scpi'.
- buildLeadPayload(input) : retourne l'objet passé à submitLead (voir étape 6), avec consent.textVersion = 'sim-email-v1'.
- isValidEmail(s) : contrôle simple (un @, un point après, pas d'espace).

6. src/components/SimulationEmailCapture.tsx
Props : { snapshot: SimulationSnapshot; hasRdvBlock: boolean }.
SimulationSnapshot = { montantSimule, tauxHypothese, delaiJouissanceMois, origine: 'france' | 'international', tmi, horizonAns, revenuBrutAnnuel, revenuNetAnnuel: number | null, revenuNetMensuel: number | null, revenuPremiereAnnee: number | null, cumulHorizon: number | null }.
Comportement (sections "Parcours UX", "Textes exacts" et "Routage" du cadrage) :
- Titre : "Pas encore prêt pour un échange ? Recevez votre simulation par email" si hasRdvBlock est vrai et le montant simulé ≥ 50 000 € ; sinon "Recevez votre simulation par email".
- Champs : email (obligatoire), prénom (facultatif), tranche (select obligatoire, préremplie avec trancheFromAmount(montantSimule)), case de consentement NON cochée et NON obligatoire.
- Champ piège name="website" : hors écran (classe sr-only), tabIndex -1, autoComplete off, aria-hidden. S'il est rempli : afficher le succès, sans appel réseau.
- À l'envoi :
    1. submitLead({ channel: 'simulateur', form_type: 'lead_simulation_email', context_type: 'simulateur', context_slug: sourceFromPath(location.pathname), identity: { email, prenom }, answers: { tranche_montant, montant_simule, taux_hypothese, delai_jouissance_mois, origine, tmi, horizon_ans, revenu_brut_annuel, revenu_net_annuel, revenu_net_mensuel, revenu_premiere_annee, cumul_horizon, action: 'email_simulation' }, consent: { marketing, textVersion: 'sim-email-v1' } }).
    2. Si result.ok est vrai : supabase.functions.invoke('send-simulation-email', { body: { request_id: result.request_id } }). En cas d'échec de l'invoke : console.warn sans l'email, et on affiche quand même le succès (le lead est enregistré).
    3. trackFunnelEvent('simulation_email_submitted', { source, tranche_montant, consent_marketing, lead_request_id }).
    4. sessionStorage 'maximus_sim_email_sent' = '1'. Au montage, si cette clé vaut '1', afficher directement l'état de succès.
- simulation_email_viewed : via IntersectionObserver (seuil 0.5), une seule fois par session (sessionStorage 'maximus_sim_email_viewed').
- Succès, tranche ≥ 50k : texte du cadrage, puis un bouton "Choisir un créneau en visio". Au clic : trackFunnelEvent('simulation_email_calendly_clicked', …), puis openCalendlyPopup(buildCalendlyUrl(`${source}-email`, { name: prenom, email })). Le suffixe -email sert à distinguer ces réservations de celles qui passent par RdvModal.
- Succès, tranche < 50k : texte du cadrage, puis un lien "Comparer les SCPI" vers /comparateur-scpi/.
- Erreur : "L'envoi n'a pas abouti. Réessayez dans un instant." Email invalide : "Vérifiez votre adresse email."
- Sous le bouton : la mention RGPD du cadrage, avec le lien /politique_confidentialite_maximusscpi.pdf.
- Style : les mêmes classes Tailwind que les blocs voisins (rounded-2xl, shadow-sm, bouton bg-green-600), mode sombre inclus, labels sur chaque champ, message d'état en aria-live="polite".

7. src/components/ScpiDirectIncomeSimulator.tsx
- Construis le snapshot à partir des états et de `calculations` existants (revenuNetAnnuel = netAnnual, revenuNetMensuel = netMonthly, revenuPremiereAnnee = firstYearNet, cumulHorizon = calculations.cumulativeNet, revenuBrutAnnuel = calculations.fullYearGross). Aucun calcul ne change.
- Rends <SimulationEmailCapture hasRdvBlock={Boolean(onRdvClick)} …/> dans la colonne de droite :
    - si onRdvClick est défini et le montant ≥ 50 000 : après le bloc "Projet de 50 000 € ou plus ?" ;
    - sinon : juste après la carte "Résultat de la simulation", avant le bloc "Projet inférieur à 50 000 € ?".
- Ne modifie rien d'autre dans ce fichier.

8. supabase/migrations/20261111120000_simulation_email_capture.sql
alter table public.contact_submissions add column if not exists confirmation_sent_at timestamptz;
alter table public.contact_submissions add column if not exists confirmation_error text;
create index if not exists contact_submissions_email_created_idx on public.contact_submissions (email, created_at desc);
Ne touche à aucune policy RLS.

9. supabase/functions/send-simulation-email/index.ts
Même style que supabase/functions/calendly-webhook/index.ts (Deno.serve, npm:@supabase/supabase-js@2, client service role).
- CORS limité à https://maximusscpi.com, https://www.maximusscpi.com et http://localhost:5173 (développement), avec OPTIONS et POST uniquement.
- Entrée : { request_id } au format UUID, sinon 400.
- Relis la ligne par request_id. Si form_type n'est pas lead_simulation_email, si la ligne a plus de 15 minutes, ou si confirmation_sent_at est déjà rempli : 200 { ok: true, skipped: true }.
- Limite : si au moins 3 lignes lead_simulation_email avec confirmation_sent_at non nul existent pour cet email sur les 24 dernières heures, confirmation_error = 'rate_limited' et skip.
- Valide answers : montant_simule entre 1000 et 5000000, taux_hypothese entre 2 et 10, tmi parmi 0, 11, 30, 41 et 45, horizon_ans parmi 10, 15 et 20, revenus numériques ou null. Sinon, confirmation_error = 'invalid_payload'. Le prénom est nettoyé (lettres, espaces, tirets, apostrophes) et limité à 40 caractères.
- Envoi Brevo : POST https://api.brevo.com/v3/smtp/email, en-tête api-key = BREVO_API_KEY. Corps : { to: [{ email, name: prenom || undefined }], templateId: Number(BREVO_SIM_TEMPLATE_ID), replyTo: { email: SIM_REPLY_TO }, params: { PRENOM, MONTANT, TAUX, DELAI, ORIGINE, TMI, HORIZON, BRUT_ANNUEL, NET_ANNUEL, NET_MENSUEL, PREMIERE_ANNEE, CUMUL, LIEN_SIMULATION } }. Les montants sont formatés côté serveur en fr-FR avec le symbole €, et "non calculé" quand la valeur est null. LIEN_SIMULATION = https://www.maximusscpi.com/ suivi de context_slug et d'un slash.
- Si consentement_marketing est vrai : POST https://api.brevo.com/v3/contacts avec { email, attributes: { PRENOM, TRANCHE_MONTANT, MONTANT_50K, SOURCE_PAGE, CONSENT_DATE, RDV_PRIS: false }, listIds: [Number(BREVO_SIM_LIST_ID)], updateEnabled: true }.
- Met à jour confirmation_sent_at (succès) ou confirmation_error (message court, sans données personnelles).
- Secrets requis : BREVO_API_KEY (déjà présent), BREVO_SIM_TEMPLATE_ID, BREVO_SIM_LIST_ID, SIM_REPLY_TO. S'il en manque un : confirmation_error = 'missing_secret:<NOM>', et aucun envoi.
- Ne renvoie jamais le contenu de la ligne dans la réponse.
- La fonction sera déployée sans vérification JWT : la sécurité repose sur les contrôles ci-dessus. Écris-le en tête de fichier.

10. supabase/functions/calendly-webhook/index.ts
Après l'insertion réussie d'une réservation (invitee.created), et seulement si BREVO_API_KEY existe : PUT https://api.brevo.com/v3/contacts/{encodeURIComponent(email)} avec { attributes: { RDV_PRIS: true } }. Sans await bloquant, avec un .catch qui ne fait que console.warn. Ignore les 404. Ne modifie rien d'autre.

11. TESTS
- Pas de nouvelle dépendance. Inspire-toi de src/tests/rdvCalendlyOverlay.test.tsx pour les mocks.
- src/tests/simulationEmailCapture.test.ts doit couvrir : trancheFromAmount aux bornes (19999, 20000, 49999, 50000, 99999, 100000, 299999, 300000) ; isAtLeast50k ; sourceFromPath ; isValidEmail ; buildLeadPayload, avec consent.marketing false par défaut, true quand la case est cochée, et aucune clé email ou prénom dans answers ; leadSubmitter (supabase mocké), qui n'ajoute les colonnes de consentement que si consent est fourni ; les métadonnées de simulation_email_submitted, sans email ni prénom.
- Lance, dans l'ordre : npx vitest run src/tests/simulationEmailCapture.test.ts, puis npm test, puis npx vite build. Si tu peux, lance aussi npm run build et npm run typecheck, et signale toute erreur déjà présente avant ton travail.

12. LIVRABLE
Écris reports/recovery-201/RECOVERY-201-livrable.md avec : les fichiers modifiés (et la raison pour chacun), les résultats exacts des tests et du build, les limites, les secrets à créer, les commandes de déploiement de la fonction et de la migration, et ce qu'Eric doit faire dans Brevo (modèle de l'email 1, liste, automatisation des emails 2 à 4).
Termine par la liste des fichiers à ajouter un par un avec git add, sans aucune commande git -A ni git add ..
```

## Bloc git et ordre de mise en ligne

L'ordre compte : base, secrets et fonction d'abord, front ensuite. Sinon le formulaire enregistre le lead mais aucun email ne part.

**Étape 1 — Placer le cadrage dans le dépôt (avant Cursor).** Enregistre le fichier Markdown de ce cadrage dans `docs/cadrage/RECOVERY-201-capture-simulation.md`, à la racine de ton clone local.

```bash
git status
git checkout main
git pull --rebase origin main
git checkout -b recovery-201-capture-simulation
git add docs/cadrage/RECOVERY-201-capture-simulation.md
git commit -m "RECOVERY-201: cadrage capture email apres simulation"
git push -u origin recovery-201-capture-simulation
```

**Étape 2 — Cursor.** Colle le prompt de la section précédente. Lis ensuite le livrable `reports/recovery-201/RECOVERY-201-livrable.md`.

**Étape 3 — Vérifier, puis commiter le code, fichier par fichier.**

```bash
git status
git diff --name-only
git add tasks/backlog.md
git add src/utils/leadSubmitter.ts
git add src/utils/funnelAnalytics.ts
git add netlify/functions/funnel-event.ts
git add src/utils/simulationEmailCapture.ts
git add src/components/SimulationEmailCapture.tsx
git add src/components/ScpiDirectIncomeSimulator.tsx
git add supabase/migrations/20261111120000_simulation_email_capture.sql
git add supabase/functions/send-simulation-email/index.ts
git add supabase/functions/calendly-webhook/index.ts
git add src/tests/simulationEmailCapture.test.ts
git add reports/recovery-201/RECOVERY-201-livrable.md
git status
git commit -m "RECOVERY-201: capture email apres simulation (bloc, lead, fonction Brevo, suivi)"
git push
```

Si le push est rejeté : `git pull --rebase origin recovery-201-capture-simulation`, puis `git push`. Avant le commit, `git diff --name-only` ne doit lister aucun des 4 fichiers protégés, ni `src/App.tsx`.

**Étape 4 — Brevo (dans l'interface Brevo, avant toute mise en ligne) :**

1. Créer le modèle transactionnel « Votre simulation SCPI » avec les paramètres `{{ params.MONTANT }}`, etc., d'après la section Séquence. Noter son identifiant.
2. Créer la liste « Simulateur SCPI – séquence ». Noter son identifiant.
3. Créer les attributs de contact `TRANCHE_MONTANT`, `MONTANT_50K`, `SOURCE_PAGE`, `CONSENT_DATE` et `RDV_PRIS`.
4. Créer l'automatisation des emails 2 à 4 (J+2, J+5, J+9), déclenchée par l'ajout à la liste, avec une sortie si `RDV_PRIS` est vrai ou si le tag « RÉPONDU » est présent.

**Étape 5 — Supabase (migration, secrets, fonctions), depuis ton clone, CLI Supabase connectée :**

1. **Migration.** Ne lance pas `supabase db push` : il peut tenter d'appliquer d'autres migrations locales absentes de l'historique distant *(probable)*. Deux options : soit tu me dis « applique la migration RECOVERY-201 » et je l'applique seule depuis ici, soit tu passes par Supabase → SQL Editor → New query, tu colles le contenu du fichier `supabase/migrations/20261111120000_simulation_email_capture.sql`, puis Run.
2. **Secrets et fonctions**, depuis ton clone, avec la CLI Supabase connectée :

```bash
supabase secrets set BREVO_SIM_TEMPLATE_ID=<id> BREVO_SIM_LIST_ID=<id> SIM_REPLY_TO=<ton-email> --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy send-simulation-email --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy calendly-webhook --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
```

*Probable :* le fichier `calendly-webhook` du dépôt correspond à la version 2 déployée (mêmes repères dans le code). Le redéploiement ne devrait donc rien changer d'autre que l'ajout de `RDV_PRIS`.

**Étape 6 — Front en production.** Sur GitHub, ouvre la pull request de `recovery-201-capture-simulation` vers `main`, vérifie que la CI est verte, puis fusionne en squash avec ce titre exact : `[deploy] RECOVERY-201: capture email apres simulation`. Sans `[deploy]`, `[release]` ou `[hotfix]` dans le titre, Netlify ne publie rien (`scripts/netlify-ignore.mjs`).

**Étape 7 — Contrôle après mise en ligne.** Ouvre `https://www.maximusscpi.com/simulateur-scpi/?utm_source=test_eric` et fais 2 envois : un sans la case, un avec la case, montant de 100 000 €. Ensuite, vérifie la boîte de réception, `contact_submissions` et la liste Brevo. Je peux faire la vérification en base pour toi.
