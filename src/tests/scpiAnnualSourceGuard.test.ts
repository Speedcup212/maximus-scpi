import {it,expect,vi} from 'vitest';
vi.mock('../data/scpiAnnualHistory.json',()=>{
 const row={scpi_slug:'private-fixture',fiscal_year:2025,distribution_totale_par_part:null,
  valeur_realisation_par_part:100,valeur_reconstitution_par_part:110,distribution_basis:'not_available',
  source_url:'https://issuer.test/report.pdf',evidence_pages:{distribution:null,realisation:9,reconstitution:9}};
 return {default:{coverage:[],rows:[row,
  {...row,evidence_pages:{...row.evidence_pages,realisation:null}},
  {...row,evidence_pages:{...row.evidence_pages,reconstitution:null}},
  {...row,evidence_pages:{...row.evidence_pages,reconstitution:0}},
  {...row,evidence_pages:null}]}};
});
import {getVerifiedAnnualRows} from '../components/trajectory/scpiAnnualHistoryData';
it('absent or null annual source pages never become verified history or reassuring zero values',()=>{
 const rows=getVerifiedAnnualRows('private-fixture');
 expect(rows).toHaveLength(1);expect(rows[0].distribution_totale_par_part).toBeNull();
 expect(rows[0].evidence_pages.realisation).toBe(9);
});
