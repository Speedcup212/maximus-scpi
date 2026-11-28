# RECOVERY-114 — Activation locale de Claude Code sur abonnement

**État au 5 novembre 2026 : code candidat prêt pour revue ; aucun exécuteur permanent authentifié ni publication autonome.**

## Architecture : conserver les briques existantes

- **Source de vérité** : `maximus_agents.agents/tasks/runs/issues/watchdog_incidents` sur Supabase `ygvsddcpohsnaowofuwc`. La queue existante conserve les statuts, tentatives, dépendances et baux.
- **Contrat d'exécution** : `agents/autonomous/{worker-contract,execution-contract}.md` et `scripts/agents/deepseekCorrectiveRunner.mjs` (contrat du correctif borné) ; QA indépendante obligatoire.
- **Moteur sélectionné** : Claude Code CLI en **authentification claude.ai**, avec abonnement Claude pris en charge. Pas de clé `ANTHROPIC_API_KEY`, ni de `DEEPSEEK_API_KEY`, ni de facturation API supposée. L'appel depuis une machine GitHub-hosted est impossible avec un abonnement local seul : il faut une machine hébergeant une session Claude authentifiée.
- **Sécurité** : `scripts/agents/subscriptionCliRunner.mjs` refuse les tâches autres que DATA/SEARCH `kind=execute` mono-fichier avec scope exact. Il ne revendique et ne clôture **pas** lui-même des tâches Supabase. Exécuter uniquement à partir d'une tâche authentique déjà revendiquée et d'un clone isolé. Le modèle ne dispose ni des outils shell, ni des MCP, ni de permissions ; la seule modification du fichier proposé est appliquée par Node après vérifications.
- **Contrôle zéro coût** : `scripts/agents/claudeSubscriptionPreflight.mjs` lit `claude auth status` sans appel modèle et n'affiche aucun secret. Refuse les modes de connexion API / third-party.

## Mise en route sur le poste Windows

1. Installer la version courante de Claude Code avec l'installateur officiel, par exemple `winget install Anthropic.ClaudeCode` dans PowerShell, ou suivre https://code.claude.com/docs/en/setup. **Ne pas saisir de clé API**.
2. Dans une session terminal sous **le même compte Windows** qui exécutera Claude : `claude auth login`, connexion avec l'abonnement Claude. L'option `--console` ne doit pas être utilisée.
3. Vérifier `claude --version` et `claude auth status` : JSON `"authMethod": "claude.ai"`. La compatibilité des flags `--restricted` et `--permission-prompts none` nécessite une version moderne de Claude Code ; mettre à jour le binaire si nécessaire.
4. Dans le dépôt **après revue et fusion de la PR dédiée** (ou dans une copie de test): `node scripts/agents/claudeSubscriptionPreflight.mjs`. Aucune génération de modèle n'a lieu.
5. Les tâches de correction proviennent **uniquement** de la file Supabase via son exécuteur autorisé GitHub OIDC. Le fichier de tâche et son scope ne doivent pas être construits manuellement pour forcer un correctif. Dans une branche isolée `agents/execution-...` avec dossier Git propre : `node scripts/agents/subscriptionCliRunner.mjs --provider claude --task <chemin-absolu-vers-tache-authentifiee.json>`. L'adaptateur propose **au plus une modification dans un seul fichier**, ne commit pas, ne crée pas de PR et ne déploie rien.
6. L'exécuteur doit ensuite faire `npm ci`, les tests ciblés, le build, contrôler le diff mono-fichier et créer une PR **draft** sous permissions GitHub bornées. Le QA indépendant valide ou refuse. Ne jamais déclarer une tâche `done/PASS` simplement parce que Claude a renvoyé du JSON.

## État réel de l'infrastructure

- La PR de certification `#292` est encore en draft, admission **75/100 NO GO**.
- Le watchdog GitHub/Supabase fonctionne, mais `AI_WORKERS_STALLED` est toujours actif ; le cron PostgreSQL **n'exécute aucun modèle**.
- Le pont `maximus-search-agent-oidc` existant n'autorise aujourd'hui que `.github/workflows/maximus-deepseek-search.yml@refs/heads/main`, DATA et SEARCH, sous le scope mono-fichier ; il n'est **pas branché** au compte Claude Code. L'inclusion d'un second workflow exige une modification et un redéploiement contrôlé du pont OIDC, séparés de l'adaptateur, après revue.
- Quatre tâches de diagnostic `RECOVERY-114:2026-11-05:*` ont été réellement revendiquées et clôturées avec `verdict=REVIEW`; elles ne constituent pas les quatre travailleurs permanents.
- Aucune exécution d'un modèle Claude, aucun accès de connexion Claude de l'utilisateur, aucun runner Windows enregistré, aucune attribution de signature QA ou de droits supplémentaires n'a été vérifiée.

## Nouveau workflow GitHub connecté à la file existante (phase pilote)

Le workflow `.github/workflows/maximus-claude-local-worker.yml` est **préparé**, limité à `workflow_dispatch` sur **main**, avec un runner `[self-hosted, Windows, X64, maximus-claude]`. Il n'a aucun déclencheur `pull_request` ou `schedule` à ce stade : éviter qu'une PR publique ait accès aux identifiants Claude locaux ou que les jobs s'accumulent avant l'installation.

**Déploiement requis et NON encore effectué :**

1. Enregistrer un **runner GitHub Actions auto-hébergé Windows dédié** depuis le dépôt → Settings → Actions → Runners → New self-hosted runner. Ajouter le label exact `maximus-claude`. Ne jamais utiliser ce compte/runner pour des PR provenant de forks ni pour du code non revu.
2. Installer Claude Code via `winget install Anthropic.ClaudeCode`, Node 22, Git et GitHub CLI (`gh`) sur cette machine. Connecter Claude via `claude auth login` **sous le même utilisateur** que celui du service runner. Les sessions interactives et services Windows peuvent utiliser des profils différents ; le test préflight doit PASS depuis le contexte réellement exécuté.
3. Réviser puis fusionner **cette PR dédiée**, distincte de la PR de certification #292. Les scripts ne seront accessibles sur `main` qu'après cela.
4. Déployer **la version revue** de la fonction existante `maximus-search-agent-oidc` : son code n'ajoute **qu'un workflow GitHub explicitement autorisé**. Exiger `repository_id`, `workflow_ref` fixe, `ref=main`, jeton OIDC GitHub et role `DATA` ou `SEARCH`. Le code du pont est uniquement versionné dans cette PR ; la version live n'est **pas** remplacée automatiquement.
5. Lancer un `workflow_dispatch` **DATA** ou **SEARCH** depuis Actions, après avoir contrôlé qu'il existe une issue `open` de correction mono-fichier validée dans Supabase. Le nouveau job utilise `prepare_execution()`, `claim_scoped_corrective_task`, Claude Code en abonnement, vérification du diff, build et PR draft, puis `record_execution` avec la vraie référence. Les retours négatifs restent `blocked/REVIEW`; le QA distinct est toujours requis.
6. N'ajouter une cadence planifiée **qu'après** un run réel et un QA indépendant réussis. Éviter de relancer le vieux correcteur DeepSeek en parallèle sur la même issue. La file et les baux limitent les claims, mais ne remplacent pas la revue des conflits de branches.

**Limite explicite** : cette phase livre un **candidat exécuteur local DATA/SEARCH**. CONTROL, ANALYST et QA ne sont pas encore des workers permanents. Il n'existe aucune preuve de cinq agents opérant simultanément ni d'admission 100/100.

## Passage au parallélisme des cinq rôles

Ne pas faire travailler quatre clones sur un répertoire partagé. Un orchestrateur autorisé gère quatre **worktrees** distincts, et la file Supabase garde les dépendances. CONTROL supervise sans simuler un agent ; DATA collecte/analyse les sources; ANALYST contrôle la cohérence; SEARCH inspecte la conformité des surfaces et le SEO; QA **rejoue indépendamment** les preuves sans se fier au modèle du correcteur.

**Ordre de mise en service** :
1. Préflight d'authentification Claude local et validation du contrat CI (sans dépense API).
2. Connexion contrôlée de l'exécuteur durable à la file Supabase via identité GitHub OIDC sur main ; ne pas dupliquer la queue.
3. Exécution instrumentée d'une seule vraie tâche DATA/SEARCH avec lease, PR, tests et clôture SQL ; vérifier la séparation QA et le watchdog.
4. Extension progressive à ANALYST, SEARCH, DATA et QA avec rôles et autorisations distincts, puis orchestrateur CONTROL.
5. Seulement après cela : exécutions parallèles, publication admise, promotion 69→200 SCPI par lots.

## Checklist d'admission du moteur local

| Contrôle | Statut connu |
|---|---|
| Fichiers GitHub du CLI et tests présents sur branche | Oui |
| Revue CI et tests réellement exécutés | À contrôler sur PR |
| Claude Code installé sur poste cible | Non vérifié |
| Identité `claude.ai` authentifiée sur poste | Non vérifiée |
| GitHub runner auto-hébergé ou exécuteur équivalent | Non installé |
| Pont OIDC étendu au nouveau workflow | Non déployé |
| Tâche réelle exécutée et contrôlée de bout en bout | Non |
| QA indépendante & admissions SCPI à 100/100 | Non |

Le modèle par abonnement est soumis à des **limites d'utilisation** et un compte Claude peut nécessiter de la réauthentification. Ne jamais contourner ces limites par réutilisation de secrets ou exécution API non autorisée.

Documentation officielle : https://code.claude.com/docs/en/cli-reference et https://code.claude.com/docs/en/setup.
