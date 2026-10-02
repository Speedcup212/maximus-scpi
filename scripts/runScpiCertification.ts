import { spawn } from 'node:child_process';

const maxAttempts = 4;
const delaysMs = [0, 1500, 3500, 7000];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const runCertification = async (attempt: number): Promise<number> => {
  if (delaysMs[attempt - 1] > 0) {
    console.warn(`[SCPI certification] Nouvelle tentative ${attempt}/${maxAttempts} dans ${delaysMs[attempt - 1]} ms...`);
    await sleep(delaysMs[attempt - 1]);
  }

  const env = { ...process.env };
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    env.VITE_SUPABASE_ANON_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  }

  return await new Promise<number>((resolve) => {
    const child = spawn(process.execPath, ['--import', 'tsx', 'scripts/checkScpiCertification.ts'], {
      stdio: 'inherit',
      env,
    });

    child.on('exit', (code) => resolve(code ?? 1));
    child.on('error', (error) => {
      console.error('[SCPI certification] Impossible de lancer le contrôle :', error.message);
      resolve(1);
    });
  });
};

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  const code = await runCertification(attempt);
  if (code === 0) process.exit(0);

  if (attempt === maxAttempts) {
    console.error(`[SCPI certification] Échec après ${maxAttempts} tentatives. Le build reste bloqué.`);
    process.exit(code);
  }
}
