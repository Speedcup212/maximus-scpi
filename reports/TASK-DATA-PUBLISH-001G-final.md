# TASK-DATA-PUBLISH-001G — Rapport final

**Date :** 2026-05-26  
**Branche :** `claude/issue-1-20260515-1418`  
**Statut :** ✅ Complété (4 SCPI testées)

---

## Résultats par SCPI

### 1. Comète (Alderan) ✅

| Champ | Valeur |
|---|---|
| URL testée | `https://alderan.fr/scpi-comete-documentation/` |
| PDF sélectionné | `20250415-Rapport-Annuel-Comete-2024.pdf` |
| Taille | 12 MB |
| TD extrait | **10,62%** (2024) |
| Pattern | P8 — table `Taux de distribution sur valeur de marché \t0,00% 10,62%` |
| Supabase | ✅ écrit |

**Note conformité :** le rapport mentionne deux calculs : 10,62% selon Alderan (méthode interne, tenant compte de réduction d'honoraires sponsor) et 11,18% selon ASPIM. Valeur Alderan retenue car source officielle du rapport. À signaler pour revue manuelle.

---

### 2. Transitions Europe (Arkéa REIM) ✅

| Champ | Valeur |
|---|---|
| URL initiale (sources.yaml) | `arkeaim.com` — DOMAINE INEXISTANT |
| URL corrigée | `https://www.arkea-reim.com/immobilier/pa_89367/scpi-transitions-europe` |
| PDF sélectionné | `ra_2024_te.pdf` (13 MB) |
| TD extrait | **8,25%** (2024) |
| Pattern | P7 fallback — `Taux de distribution = 8,25% + 175,37/171,36 -1 (variation de valeur de réalisation 2024` |
| Supabase | ✅ écrit (après retry — erreur réseau transiente au 1er run) |

**Note :** La table `Taux de Distribution Brut 8,16% 8,25%` suggère deux colonnes (probablement 2023=8,16% et 2024=8,25%). La formule TRI confirme 8,25% comme composante distribution 2024. À confirmer manuellement.

---

### 3. Activimmo (Alderan) ✅

| Champ | Valeur |
|---|---|
| URL initiale (sources.yaml) | `alderan.fr/scpi-activimmo-documentation/` — 404 |
| URL corrigée | `https://alderan.fr/scpi-documentation/` |
| PDF sélectionné | `20250417-Rapport-Annuel-ActivImmo-2024.pdf` (22 MB) |
| TD extrait | **5,50%** (2024) |
| Pattern | P8 — table `Taux de distribution sur valeur de marché \t6,05 % \t6,02 % \t5,50% \t5,52% \t5,50%` |
| Supabase | ✅ écrit |

**Note :** Table à 5 colonnes historiques (2020–2024). Deux valeurs 5,50% aux positions 3 et 5 — dernière valeur retenue comme 2024. À confirmer manuellement.

---

### 4. Remake Live (Remake Asset Management) ⛔ inaccessible

| Champ | Valeur |
|---|---|
| URL testée | `remake.eu`, `remake.immo`, `remake-am.com` |
| Résultat | DNS non résolu / 403 Forbidden (anti-bot) |
| TD disponible | 7,50% (2024) — déjà dans le bulletin T3 2025 |

**Conclusion :** Le site Remake Asset Management bloque toutes les requêtes HTTP et Playwright (réponse 403, 58 octets). L'URL `remake.immo` ne résout plus. Le taux de distribution 2024 (7,50%) est déjà disponible via le bulletin trimestriel T3 2025 qui le mentionne explicitement. L'extraction RA n'est pas nécessaire.

---

## Corrections pipeline appliquées pendant 001G

| Fix | Impact |
|---|---|
| `RA_INCLUDE` : `\s*` → `[\s-]*` | Détection de `Rapport-Annuel` (tiret) dans les URLs alderan.fr |
| `RA_INCLUDE` : ajout `\|[-_\/]ra[-_\.]` | Détection de `-ra-` dans URLs arkea-reim.com |
| `RA_EXCLUDE_BULLETIN` : ajout `sfdr\|bd[6-9]\|extra.financier\|durabilit\|article.(?:6\|8\|9)` | Exclure rapports ESG/durabilité du sélecteur RA |
| `resolveBaseUrl()` dans `extractPdfLinks` | Respect du `<base href>` HTML — résolution correcte des URLs relatives sur arkea-reim.com |
| Pattern P8 : `{0,60}` → `{0,40}?` (non-greedy) | Fix capture `2` au lieu de `10,62` dans table multi-colonnes |
| Pattern P8 : nouveau pattern table `Taux de distribution sur valeur de marché` | Extraction depuis tables multi-colonnes sans texte |
| Pattern P9 : `taux de distribution de X%` (sans année) | Extraction quand l'année est sur une ligne séparée |
| `sources.yaml` : 3 URLs corrigées | `arkeaim.com` → `arkea-reim.com/...`, `scpi-activimmo-documentation/` → `scpi-documentation/`, `transitions-europe` marqué ✅ |

---

## Supabase — État final

| SCPI | td | td_annee | Statut |
|---|---|---|---|
| iroko-zen | 0.0732 (7,32%) | 2024 | ✅ (001E/001F) |
| comete | 0.1062 (10,62%) | 2024 | ✅ (001G) |
| transitions-europe | 0.0825 (8,25%) | 2024 | ✅ (001G) |
| activimmo | 0.055 (5,50%) | 2024 | ✅ (001G) |
| remake-live | — | — | TD disponible (7,50%) dans bulletin — écriture RA non nécessaire |

---

## Points d'attention conformité

1. **Comète 10,62%** : valeur Alderan vs 11,18% ASPIM — valeur officielle Alderan retenue, note de bas de page sur biais phase sponsor
2. **Transitions Europe 8,25%** : extrait de formule TRI, table montre aussi 8,16% (probablement 2023) — 8,25% = composante distribution 2024
3. **Activimmo 5,50%** : dernière colonne d'un tableau historique à 5 valeurs — cohérent avec TDVM Activimmo publiquement connu

---

## Contraintes respectées

- ✅ Une seule SCPI à la fois
- ✅ Seuls td, td_annee, ra_source_period, ra_source_sha256, ra_updated_at écrits (via updateTdFromRapportAnnuel)
- ✅ Champs bulletin (tof, capitalisation, source_period, source_confidence) intouchés
- ✅ Arrêt sur Remake Live (source inaccessible)
- ✅ Pas de passage à 20 SCPI
- ✅ Pas de git add/commit/push effectué
