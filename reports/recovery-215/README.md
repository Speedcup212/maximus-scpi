# RECOVERY-215 — PAREF Hexa T3 2026: composante confondue avec le TOF

Tâche P0 du ticket #311. Périmètre: script SQL de correction ciblée, preuve documentaire, rapport. Aucun changement des seuils ou de la vue de certification, aucune admission SCPI, aucun déploiement frontend.

Le PDF officiel PAREF Hexa T3 2026, SHA-256 `ca4a3569a990f99b376268875440ebc1e1aadefa85aab582ebca96cbce0c62ce`, 1 775 561 octets, page 5, affiche **TOF T3 2026 86,0 %** au centre du graphique et dans son historique trimestriel. **84,5 % désigne les locaux occupés**, composante du total, et ne doit pas être publié comme TOF. La page mentionne la méthodologie ASPIM. Téléchargement direct de l'émetteur le 15/11/2026, SHA identique à l'archive Supabase; lectures MuPDF et Poppler et inspection du rendu concordantes. Aucune attestation humaine.

Le contrôle RECOVERY-151 encodait à tort 84,5 %. Il reste bloquant et inchangé: la correction des chiffres ne doit pas créer artificiellement un PASS. Sa nouvelle preuve et son remplacement contrôlé restent à traiter.

Tests: exécution intégrale en transaction annulée; assertions d'identité, SHA, taille d'archive, valeur antérieure, préservation des autres données live et non-régression de toute la cohorte PASS. Après application, relire extraction, certificat, historique et indicateur live; rejouer la valeur erronée en transaction annulée pour contrôler le garde existant.

## Validation exécutée le 15/11/2026
- Correction complète exécutée via `BEGIN ... ROLLBACK`: PASS après ajustement de l'ordre de correction (historique avant rafraîchissement du bulletin, puis certificat, live et registre de rejet). Aucun garde désactivé.
- Rejeu du faux 84,5 % sur le certificat: bloqué par le garde existant, 86 % conservé.
- Appel réel de `refresh_scpi_metric_certifications('paref-hexa')` en transaction annulée: 86 % et page 5 conservés.
- Cohorte strictement inchangée: 38 PASS / 31 FAIL / 69. PAREF Hexa reste FAIL, car le verrou RECOVERY-151 attend une preuve sémantiquement erronée qui ne doit pas être restaurée.
- SQL DML uniquement: aucune nouvelle fonction, table, permission, modification frontend ou désactivation de protection. Build applicatif non pertinent pour ces scripts SQL; validation sur la base via transaction annulée.
- État avant publication de cette PR: correction testée, pas encore appliquée de manière persistante. Le résultat final sera vérifié directement dans Supabase.
