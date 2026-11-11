import test from 'node:test';
import assert from 'node:assert/strict';
import {historicalIssuerIdentityMatches as match} from '../../supabase/functions/maximus-scpi-ocr-oidc/historicalIdentity.mjs';
const url='https://paref-gestion.com/wp-content/uploads/2024/old.pdf';
test('issuer-resolved legal renames permit only the same historical PAREF entity',()=>{
  for(const [slug,alias,other] of [
    ['paref-evo','interpierre europe centrale','interpierre france'],
    ['paref-hexa','interpierre france','interpierre europe centrale']]){
    assert.equal(match(slug,'2022-T2',url,alias),true);
    assert.equal(match(slug,'2023-RA',url,alias),true);
    assert.equal(match(slug,'2022-T2',url,other),false);
    for(const period of ['2026-T3','2024-T3','2024-RA','2022-T8',''])
      assert.equal(match(slug,period,url,alias),false);
    for(const source of ['https://paref-gestion.com.attacker.org/wp-content/uploads/x.pdf',
      'http://paref-gestion.com/wp-content/uploads/x.pdf','https://user@paref-gestion.com/wp-content/uploads/x.pdf',
      'https://paref-gestion.com:8080/wp-content/uploads/x.pdf','https://paref-gestion.com/other.pdf'])
      assert.equal(match(slug,'2022-T2',source,alias),false);
    assert.equal(match(slug,'2022-T2',url,'interpierre'),false);
  }
});
