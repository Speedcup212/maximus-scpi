type CacheEntry<T> = {
  expiresAt: number;
  data: T;
};

type RestSelectOptions = {
  cacheTtlMs?: number;
  deferMs?: number;
};

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '');
const memoryCache = new Map<string, CacheEntry<unknown>>();
const CACHE_PREFIX = 'maximus:supabase-rest:';

export const hasSupabaseRest = Boolean(supabaseUrl && supabaseAnonKey);

const cacheKeyFor = (table: string, params: URLSearchParams) =>
  `${CACHE_PREFIX}${table}?${params.toString()}`;

const readCache = <T,>(key: string): T | null => {
  const now = Date.now();
  const inMemory = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (inMemory) {
    if (inMemory.expiresAt > now) return inMemory.data;
    memoryCache.delete(key);
  }

  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (!parsed || parsed.expiresAt <= now) {
      window.sessionStorage.removeItem(key);
      return null;
    }
    memoryCache.set(key, parsed as CacheEntry<unknown>);
    return parsed.data;
  } catch {
    return null;
  }
};

const writeCache = <T,>(key: string, data: T, ttlMs: number) => {
  const entry: CacheEntry<T> = {
    expiresAt: Date.now() + ttlMs,
    data,
  };
  memoryCache.set(key, entry as CacheEntry<unknown>);

  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Le cache navigateur est une optimisation : un quota plein ne doit jamais bloquer les données.
  }
};

const waitForBackgroundSlot = async (deferMs: number) => {
  if (typeof window === 'undefined') return;

  if (deferMs > 0) {
    await new Promise<void>((resolve) => window.setTimeout(resolve, deferMs));
  }

  const idleWindow = window as Window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
  };

  if (typeof idleWindow.requestIdleCallback === 'function') {
    await new Promise<void>((resolve) => {
      idleWindow.requestIdleCallback?.(() => resolve(), { timeout: 700 });
    });
  }
};

/**
 * Lecture publique PostgREST sans charger @supabase/supabase-js.
 * Le comparateur peut ainsi rendre ses données statiques immédiatement puis hydrater
 * les valeurs Supabase en arrière-plan, avec un petit cache de session.
 */
export async function selectSupabaseRest<T>(
  table: string,
  params: URLSearchParams,
  options: RestSelectOptions = {},
): Promise<T[]> {
  if (!hasSupabaseRest) return [];

  const {
    cacheTtlMs = 5 * 60 * 1000,
    deferMs = 0,
  } = options;
  const cacheKey = cacheKeyFor(table, params);
  const cached = readCache<T[]>(cacheKey);
  if (cached) return cached;

  await waitForBackgroundSlot(deferMs);

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${params.toString()}`, {
    method: 'GET',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase REST ${table}: ${response.status}`);
  }

  const data = (await response.json()) as T[];
  writeCache(cacheKey, data, cacheTtlMs);
  return data;
}
