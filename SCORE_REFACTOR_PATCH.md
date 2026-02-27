# Frontend score refactor — maximus_score_value

## Full diff patch

```diff
--- a/src/utils/scpiScoringService.ts
+++ b/src/utils/scpiScoringService.ts
@@ -149,26 +149,65 @@ export async function getLatestScpiScores(): Promise<{
 }

+/** Bulletin row from scpi_bulletins (typed for getScoreBySlug). */
+interface BulletinScoreRow {
+  maximus_score_value: number | null;
+  maximus_score: Record<string, unknown> | null;
+  period: string;
+}
+
 /**
  * Reads the latest ingestion-pipeline score for a SCPI identified by its slug.
  *
- * Queries public.scpi_bulletins (populated by the ingestion pipeline) for the
- * most recent row with a non-null maximus_score for the given slug.
+ * Queries public.scpi_bulletins for maximus_score_value (numeric).
+ * Defensive fallback: if maximus_score_value is null but maximus_score JSON exists,
+ * derives score from maximus_score->>'score_total' (or 'score') once and logs a warning.
  *
  * Returns null when no ingestion score exists yet (fallback to scoreScpiBatch).
  */
 export async function getScoreBySlug(scpiSlug: string): Promise<{
   success: boolean;
   score: ScpiScores | null;
   error?: string;
 }> {
   try {
     if (!supabase) return { success: false, score: null, error: 'Supabase not configured' };

     const { data, error } = await supabase
       .from('scpi_bulletins')
       .select('maximus_score_value, period, maximus_score')
       .eq('scpi_slug', scpiSlug)
       .order('found_at', { ascending: false })
       .limit(1)
       .maybeSingle();

-    if (error) return { success: false, score: null, error: error.message };
-    if (!data || !data.maximus_score) return { success: true, score: null };
-
-    const ms = data.maximus_score as Record<string, unknown>;
-
-    // Map ingestion MaximusScoreResult to the ScpiScores shape used by the UI
+    if (error) return { success: false, score: null, error: error.message };
+    if (!data) return { success: true, score: null };
+
+    const row = data as BulletinScoreRow;
+    let value: number | null = null;
+
+    if (row.maximus_score_value != null && typeof row.maximus_score_value === 'number') {
+      value = row.maximus_score_value;
+    } else if (row.maximus_score != null && typeof row.maximus_score === 'object') {
+      const ms = row.maximus_score as Record<string, unknown>;
+      const fromTotal = ms['score_total'] != null ? Number(ms['score_total']) : NaN;
+      const fromScore = ms['score'] != null ? Number(ms['score']) : NaN;
+      value = !Number.isNaN(fromTotal) ? fromTotal : !Number.isNaN(fromScore) ? fromScore : null;
+      if (value != null) {
+        console.warn('[getScoreBySlug] maximus_score_value null but maximus_score present; derived score from JSON (use DB migration to populate maximus_score_value)', { scpiSlug, period: row.period });
+      }
+    }
+
+    if (value == null) return { success: true, score: null };
+
+    if (import.meta.env?.DEV) {
+      console.debug('[getScoreBySlug]', { scpiSlug, maximus_score_value: value, period: row.period });
+    }
+
     const score: ScpiScores & { source: string; version: string } = {
-      nom:              scpiSlug,
-      score_total:      Number(ms['score_total'])     || 0,
-      score_rendement:  Number(ms['score_rendement'])  || 0,
-      score_secteur:    Number(ms['score_secteur'])    || 0,
-      score_geo:        Number(ms['score_geo'])        || 0,
-      score_qualite:    Number(ms['score_qualite'])    || 0,
-      score_taille:     Number(ms['score_taille'])     || 0,
-      audit_trail:      Array.isArray(ms['audit_trail'])
-                          ? (ms['audit_trail'] as string[])
-                          : [],
-      source:           'DB',
-      version:          (ms['version'] as string) || 'v1',
+      nom:             scpiSlug,
+      score_total:     value,
+      score_rendement: 0,
+      score_secteur:   0,
+      score_geo:       0,
+      score_qualite:   0,
+      score_taille:    0,
+      audit_trail:     [],
+      source:          'DB',
+      version:         'v1',
     };

     return { success: true, score };
-  } catch (error) {
+  } catch (err) {
     return {
       success: false,
       score:   null,
-      error:   error instanceof Error ? error.message : 'Unknown error',
+      error:   err instanceof Error ? err.message : 'Unknown error',
     };
   }
 }
```

---

## Updated service function

```typescript
// src/utils/scpiScoringService.ts — getScoreBySlug

const { data, error } = await supabase
  .from('scpi_bulletins')
  .select('maximus_score_value, period, maximus_score')
  .eq('scpi_slug', slug)
  .order('found_at', { ascending: false })
  .limit(1)
  .maybeSingle();

if (error) return { success: false, score: null, error: error.message };
if (!data) return { success: true, score: null };

// Use data.maximus_score_value; fallback to maximus_score JSON if value is null
```

---

## Updated component snippet

```tsx
// AnalysisModal.tsx / ScpiDetailPage.tsx / AnalysisDetailModal.tsx
// No changes required — already uses result.score?.score_total

getScoreBySlug(slug).then(result => {
  const score = result.success && result.score != null ? result.score.score_total : null;
  setQualityScore(score !== null ? Math.round(score) : null);
  // Display: score !== null ? `${score}/100` : 'N/A'
});
```

---

## Console log example (debugging)

```
[getScoreBySlug] { scpiSlug: 'comete', maximus_score_value: 72, period: '2025-T4' }
```

Fallback warning when maximus_score_value is null:
```
[getScoreBySlug] maximus_score_value null but maximus_score present; derived score from JSON (use DB migration to populate maximus_score_value) { scpiSlug: 'comete', period: '2025-T4' }
```
