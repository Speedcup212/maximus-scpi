# RECOVERY-227 — réconciliation de la contradiction 54 / 69 (mesure du 2026-11-28)

Document de preuve, en lecture seule. Aucune écriture Supabase, aucune fusion,
aucun déploiement.

## La contradiction signalée

La revue indépendante oppose deux mesures :

| Source | Requête | Résultat annoncé |
|---|---|---|
| ChatGPT | `SELECT count(*), count(*) FILTER (WHERE last_document_period IS NULL AND source_ready IS NULL) FROM public.scpi_operational_status` | `69 / 0` |
| Cursor (passe 41) | même intention, via le client `anon` du site | `54 / 54` |

Les deux chiffres sont exacts. Ils ne mesurent pas la même chose.

## Ce qui est mesuré ici

Rejeu reproductible avec la clé publique `anon` réellement servie par
`https://maximusscpi.com` (celle du bundle `assets/supabaseRest-*.js`), en GET
seulement. Aucune clé de service, aucun jeton de management.

```
GET /rest/v1/scpi_operational_status?select=scpi_slug,pilot_order,...   → 54 lignes
GET /rest/v1/scpi_crash_test_strict_v2?select=scpi_slug                → 54 lignes
GET /rest/v1/scpi_crash_test_strict_v2?select=*&scpi_slug=eq.…         → 401
    42501  permission denied for function independent_tof_geometric_proof_valid
```

Les `pilot_order` visibles ne sont pas contigus :

```
min 1, max 69, 54 valeurs, 15 trous :
11, 13, 14, 19, 33, 35, 37, 39, 44, 46, 49, 55, 57, 60, 61
```

Ces 15 positions correspondent exactement aux 15 fonds pour lesquels
`maximus_scpi_is_in_public_cohort(slug)` renvoie `false` :

```
activimmo, atream-hotel, coeur-d-europe, coeur-de-region, coeur-de-ville,
credit-mutuel-pierre-1, grand-paris-residentiel, novapierre-residentiel,
paref-evo, patrimmo-croissance-impact, perial-grand-paris,
perial-hospitalite-europe, remake-uk-2025, selectinvest-1, selectipierre-2
```

Contrôle de fermeture : l'ensemble des lignes visibles est **égal** à l'ensemble
des slugs pour lesquels la RPC répond `true` (54 = 54, aucune différence dans les
deux sens).

## L'explication

`public.scpi_crash_test_strict_v2` est une vue alimentée par
`scpi_operational_status`, laquelle lit des tables soumises à la politique RLS
`allow_select_anon` :

```sql
ALTER POLICY "allow_select_anon" ON public.scpi_indicators
USING (true AND public.maximus_scpi_is_in_public_cohort(scpi_slug));
```

Le rôle `anon` ne voit donc **que** les fonds du cohort public. La restriction
est une propriété de la politique, pas des données. Les 15 fonds absents ne sont
pas supprimés : ils ne sont pas publiés à ce rôle.

- mesure **`anon`** → 54 lignes, toutes `last_document_period IS NULL` et
  `source_ready IS NULL` (54 / 54) ;
- mesure **rôle privilégié** (SQL direct ChatGPT) → 69 lignes, dont 0 en
  `NULL / NULL`.

`69 / 0` et `54 / 54` ne se contredisent pas : la seconde décrit un sous-ensemble
filtré par RLS, la première décrit le même objet vu sans filtre.

## Conséquence pour le diagnostic de la passe 41

La conclusion « aucun fonds ne peut structurellement atteindre `PASS_100` depuis
cet état » reste **vraie pour les 54 fonds observés** : tous portent
`operational_status='INCOMPLETE'` et la vue stricte exige `'DONE'`.
Elle n'a **pas** été établie pour les 69, et ne doit pas être généralisée.
La mesure de la passe 41 est à corriger sur ce point ; elle n'est pas annulée.

## Ce que ce document ne prouve pas

- Il ne prouve pas l'état des 15 fonds hors cohorte : ils ne sont pas lisibles
  avec la clé `anon`, et aucun accès privilégié n'est disponible ici.
- Il ne certifie aucune donnée financière.
- Il ne tranche pas la revue séparée des grants/RLS demandée par ChatGPT.

## Reproduire

```bash
# clé publique servie par le site, en lecture seule
curl -s https://maximusscpi.com/assets/supabaseRest-*.js   # URL + clé anon
curl -s -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
  "$URL/rest/v1/scpi_operational_status?select=pilot_order,scpi_slug&limit=200"
curl -s -X POST -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
  -H "Content-Type: application/json" -d '{"p_slug":"paref-evo"}' \
  "$URL/rest/v1/rpc/maximus_scpi_is_in_public_cohort"
```
