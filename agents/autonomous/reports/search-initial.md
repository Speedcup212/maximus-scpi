# SEARCH — premier cycle réel

TYPE DE LIVRABLE : Audit technique et correctifs candidats
MOT-CLÉ PRINCIPAL : analyses SCPI
INTENTION DE RECHERCHE : informationnelle / commerciale
ANGLE ÉDITORIAL : fiabilité du HTML initial
FORMAT IA RECOMMANDÉ : tableaux sourcés
ENTITÉS NOMMÉES À INCLURE : Comète, Transitions Europe
SCHÉMA ORG RECOMMANDÉ : à contrôler lors du correctif
MENTIONS RÉGLEMENTAIRES REQUISES : oui, aucun indicateur ne garantit revenus ou capital
CONFORMITÉ CIF : aucune nouvelle recommandation produite ; contenu futur à revoir
VALIDATION REQUISE AVANT MODIFICATION SITE : oui

Tâche `037e707d-0c59-485a-8719-f7379ce2f678`. Verdict **REVIEW**. Aucun déploiement ni changement public.

## Contrôles réussis

Home, comparateur, analyses et deux fiches répondent 200. Robots autorise les pages publiques et annonce le sitemap. Sitemap XML valide : 404 URL uniques, toutes HTTPS sur l’hôte canonique. HTTP, www et comparateur sans slash redirigent en 301. Comparateur et deux fiches ont un canonical propre. Indicateurs et actualités de fiches extractibles sans JavaScript.

## Anomalies et corrections candidates

### SEARCH-001 — high — certain

Route utilisée dans le bundle public (chaîne /analyses/) ; réponse HTML initiale 200 avec canonical de la home, H1 et contenu de home. Pas présente dans le sitemap.

Correction exacte proposée : Générer une page initiale dédiée /analyses/ : canonical https://maximusscpi.com/analyses/, title et H1 spécifiques à la page, résumé de sa méthodologie et liens vers analyses vérifiées ; ajouter au sitemap généré seulement après contrôle. Ne pas maintenir un canonical home pour une page publique distincte.

### SEARCH-002 — medium — certain

H1 initial générique identique SCPI Testez. Comparez. Décidez. ; nom SCPI absent du H1. Deux séquences littérales backslash-n apparaissent dans le texte extrait.

Correction exacte proposée : Remplacer les H1 initiaux respectivement par SCPI Comète : analyse, indicateurs et risques et SCPI Transitions Europe : analyse, indicateurs et risques. Émettre des vrais retours à la ligne dans le HTML généré, pas les deux caractères backslash et n.

### SEARCH-003 — high — certain

Actualité trimestrielle texte T3 2025 mais étiquette Période : 2026-T2. Contradiction directement extractible. La bonne période et la fraîcheur de la donnée métier restent à vérifier.

Correction exacte proposée : Bâtir le bloc actualité à partir d’un unique enregistrement documenté, avec texte, période et date provenant de la même source. Si ce texte est bien T3 2025, étiqueter 2025-T3 et distinguer explicitement la période des indicateurs techniques. Si le bloc doit exposer 2026-T2, remplacer le texte par le contenu vérifié du bulletin 2026-T2 ; ne pas déplacer la date seule.

### SEARCH-004 — medium — certain

Le HTML initial expose indicateurs techniques, vigilances et actualité mais aucun historique chiffré sur plusieurs périodes ni signaux/trajectoire détaillés. Le rendu React hydraté n’a pas été audité.

Correction exacte proposée : Ajouter un tableau HTML de périodes comparables et vérifiées, date et liens vers source ; exposer les signaux avec critères/date, uniquement après validation DATA/ANALYST. Aucune extrapolation.

## Preuves

- `https://maximusscpi.com/comparateur-scpi/` — 2026-10-05T10:49:57.969405+00:00 : {"http_status": 200, "final_url": "https://maximusscpi.com/comparateur-scpi/", "canonical": ["https://maximusscpi.com/comparateur-scpi/"], "h1": "Comparateur SCPI 2026", "visible_text_chars": 4370, "jsonld_count": 1}
- `https://maximusscpi.com/analyses/` — 2026-10-05T10:49:57.804246+00:00 : {"http_status": 200, "final_url": "https://maximusscpi.com/analyses/", "canonical": ["https://maximusscpi.com/"], "h1": "Analysez. Comparez. \n                 Investissez sur  MaximusSCPI.", "visible_text_chars": 2349, "jsonld_count": 1}
- `https://maximusscpi.com/comete/` — 2026-10-05T10:49:57.937839+00:00 : {"http_status": 200, "final_url": "https://maximusscpi.com/comete/", "canonical": ["https://maximusscpi.com/comete/"], "h1": "SCPI \n                 Testez. Comparez. Décidez.", "visible_text_chars": 2145, "jsonld_count": 1}
- `https://maximusscpi.com/transitions-europe/` — 2026-10-05T10:49:58.006113+00:00 : {"http_status": 200, "final_url": "https://maximusscpi.com/transitions-europe/", "canonical": ["https://maximusscpi.com/transitions-europe/"], "h1": "SCPI \n                 Testez. Comparez. Décidez.", "visible_text_chars": 2197, "jsonld_count": 1}
- `https://maximusscpi.com/comparateur-scpi` — 2026-10-05T10:50:03.780240+00:00 : {"http_status": 200, "final_url": "https://maximusscpi.com/comparateur-scpi/", "canonical": ["https://maximusscpi.com/comparateur-scpi/"], "h1": "Comparateur SCPI 2026", "visible_text_chars": 4370, "jsonld_count": 1}
- `https://www.maximusscpi.com/` — 2026-10-05T10:49:57.893221+00:00 : {"http_status": 200, "final_url": "https://maximusscpi.com/", "canonical": ["https://maximusscpi.com/"], "h1": "Analysez. Comparez. \n                 Investissez sur  MaximusSCPI.", "visible_text_chars": 2349, "jsonld_count": 1}
- `http://maximusscpi.com/` — 2026-10-05T10:49:57.871753+00:00 : {"http_status": 200, "final_url": "https://maximusscpi.com/", "canonical": ["https://maximusscpi.com/"], "h1": "Analysez. Comparez. \n                 Investissez sur  MaximusSCPI.", "visible_text_chars": 2349, "jsonld_count": 1}
- `https://maximusscpi.com/robots.txt` — 2026-10-05T10:52:30.806208+00:00 : "200 ; User-agent * Allow / ; sitemap annoncé, exclusions app/api/admin/test/qa/merci et JSON."
- `https://maximusscpi.com/sitemap.xml` — 2026-10-05T10:52:30.806208+00:00 : "200 application/xml ; XML valide, 404 URL uniques, toutes HTTPS sous maximusscpi.com ; /analyses/ absent."
- `HTTP redirects` — 2026-10-05T10:52:30.806208+00:00 : "http://maximusscpi.com/ 301 vers HTTPS ; www home 301 vers non-www ; /comparateur-scpi 301 vers /comparateur-scpi/."
- `https://maximusscpi.com/assets/index-dR1JZjig.js` — 2026-10-05T10:52:30.806208+00:00 : "Bundle public contient la chaîne route /analyses/ et le lien Découvrir les analyses."

## Limites et suite

Échantillon HTTP, pas certification des 61 fiches. Rendu React hydraté, données source, indexation Google/Bing et citations IA non vérifiés. Corrections à rattacher au générateur réel et à revoir par QA avant modification du site.

- QA revoir les quatre anomalies avec preuves HTTP avant release.
- ANALYST vérifier la contradiction de période éditoriale Transitions Europe.
- Préparer un lot unique de corrections du générateur statique après autorisation existante ; aucun deploy par agent.
- Mesurer indexation via Search Console/Bing si connecteurs et données disponibles ; ne pas déduire indexation de HTTP 200.
