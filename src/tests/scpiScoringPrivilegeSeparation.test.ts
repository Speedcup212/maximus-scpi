import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

// Contrat de sécurité : la fonction scpi-scoring sépare strictement
//  - la simulation publique (lecture seule, clé publishable) ;
//  - la persistance backend (save_to_db=true, clé secrète uniquement).
// Une clé publishable (publique, embarquée dans le frontend) ne doit JAMAIS
// pouvoir déclencher une écriture privilégiée.
const src = readFileSync(
  new URL('../../supabase/functions/scpi-scoring/index.ts', import.meta.url),
  'utf8',
);

describe('scpi-scoring : séparation simulation publique / persistance backend', () => {
  it('importe à la fois requirePublishableKey et requireSecretKey', () => {
    expect(src).toContain('import { requirePublishableKey, requireSecretKey }');
  });

  it('détecte save_to_db et n\'écrit qu\'après une autorisation par clé secrète', () => {
    // Le branchement write est déclenché par save_to_db === true.
    expect(src).toMatch(/const wantsWrite = body\?\.save_to_db === true/);
    // La garde write exige une clé secrète, jamais une clé publishable.
    expect(src).toMatch(/requireSecretKey\(req,[\s\S]*?legacyJwt: false \}\)/);
    expect(src).not.toMatch(/requirePublishableKey\(req,[\s\S]*?save_to_db/);
  });

  it('réserve requireSecretKey au chemin write et requirePublishableKey au chemin lecture', () => {
    const ifWrite = src.indexOf('if (wantsWrite) {');
    const elseIdx = src.indexOf('} else {', ifWrite);
    const scoresIdx = src.indexOf('const scores = scoreScpiBatch');
    const writeBranch = src.slice(ifWrite, elseIdx);
    const readBranch = src.slice(elseIdx, scoresIdx);
    expect(writeBranch).toContain('requireSecretKey');
    expect(writeBranch).not.toContain('requirePublishableKey');
    expect(readBranch).toContain('requirePublishableKey');
    expect(readBranch).not.toContain('requireSecretKey');
  });

  it('l\'écriture privilégiée est conditionnée par wantsWrite (jamais pour une simulation publique)', () => {
    const writeGuard = src.indexOf('if (wantsWrite) {');
    const secretCheck = src.indexOf('requireSecretKey', writeGuard);
    expect(writeGuard).toBeGreaterThan(0);
    expect(secretCheck).toBeGreaterThan(writeGuard);
    // L'insertion en base n'existe que dans le bloc wantsWrite.
    const insert = src.indexOf("from('scores_scpi').insert");
    expect(insert).toBeGreaterThan(secretCheck);
  });
});
