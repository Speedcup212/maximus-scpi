import { createClient } from '@supabase/supabase-js';
import { createHash, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';

type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

export const getRequiredEnv = (): Env => {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY };
};

export const createAdminClient = () => {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = getRequiredEnv();
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
};

export const generateInviteToken = () => randomUUID();

export const generateInviteCode = () => {
  const code = randomInt(0, 1_000_000);
  return code.toString().padStart(6, '0');
};

export const hashInviteCode = (token: string, code: string) => {
  return createHash('sha256').update(`${token}:${code}`).digest('hex');
};

export const hashToken = (token: string) => {
  return createHash('sha256').update(token).digest('hex');
};

export const safeEqual = (a: string, b: string) => {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
};
