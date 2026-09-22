# Agent 06 — Veille investissements immobiliers SCPI

## Architecture de production

La veille n'est plus alimentée par un JSON généré manuellement.

Flux de production :

```
Sources officielles
  → Supabase Edge Function scpi-news-watch
  → validation / dédoublonnage
  → public.scpi_news_items
  → public.scpi_news_sources
  → /actualites/ (lecture Supabase côté site)
```

Un snapshot validé reste conservé dans `data/news/scpi-investment-news-latest.json` uniquement comme fallback si Supabase est temporairement indisponible.

## Fréquence

Le job Supabase `scpi-news-watch-daily` s'exécute chaque jour à **05:15 UTC**.

Chaque source conserve :
- `last_checked_at`
- `last_success_at`
- `last_error`
- `last_items_found`
- `status` : `active`, `incomplete` ou `error`

Le frontend ne doit jamais afficher « Veille active » sur la seule présence d'une URL : il affiche l'état réel enregistré dans Supabase.

## Périmètre STRICT

### Inclus
- acquisitions d'immeubles par une SCPI ;
- portefeuilles immobiliers ;
- VEFA ;
- entrées / extensions de patrimoine ;
- opérations rattachables à une SCPI nommée et à une source officielle.

### Exclus
- rendement / TD / prix de part ;
- TOF / collecte / capitalisation ;
- nominations / gouvernance ;
- interviews / salons / récompenses ;
- fiscalité / ISR / SFDR seuls ;
- opérations d'autres fonds d'une même société de gestion ;
- pages corporate génériques ;
- acquisitions historiques non récentes.

## Règles d'attribution

Une actualité n'est attribuée à une SCPI que si son nom (ou un alias contrôlé) est identifiable dans le titre, l'URL ou le contexte local de l'acquisition. Le simple fait qu'une société de gestion ne possède qu'une SCPI dans le registre ne suffit jamais.

Les pages HTML et les PDF sont distingués d'après le contenu réellement retourné. Une page HTML ne doit plus être rejetée comme « PDF reçu en HTML ».

## Sources

Registre versionné :
`data/scpi-investment-news-sources.json`

Registre de production :
`public.scpi_news_sources`

Toute nouvelle SCPI doit être ajoutée aux deux référentiels.

## Sorties

- Supabase : `public.scpi_news_items` — source de vérité du site ;
- Supabase : `public.scpi_news_runs` — diagnostics d'exécution privés ;
- JSON : `data/news/scpi-investment-news-latest.json` — fallback ;
- JSON : `data/news/scpi-investment-news-history.json` — snapshot local.

## Contrôle qualité

Avant publication, l'item doit au minimum disposer de :
1. une SCPI identifiable ;
2. un signal explicite d'acquisition / entrée au patrimoine ;
3. un actif immobilier ;
4. une source officielle ;
5. une attribution non ambiguë.

Le moteur privilégie les faux négatifs aux faux positifs : une actualité douteuse ne doit pas être affectée automatiquement à une SCPI.

## Conformité

Rester factuel et sourcé. Ne jamais écrire : « meilleure SCPI », « sans risque », « garanti », « rendement assuré », « opportunité unique », « placement sécurisé », « SCPI à privilégier ».
