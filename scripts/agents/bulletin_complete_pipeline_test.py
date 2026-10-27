import pathlib,sys,tempfile,unittest
sys.path.insert(0,str(pathlib.Path(__file__).parent))
import bulletin_fields as fields
import bulletin_complete_pipeline as replay

def words(lines):
    out=[]
    for y,t in lines:
        x=40
        for w in t.split():
            width=max(len(w)*5,5);out.append((x,y,x+width,y+10,w));x+=width+4
    return out

class FinancialAssociationTests(unittest.TestCase):
    def parse(self,lines):
        ws=words(lines);return fields.extract([' '.join(t for _,t in lines)],[ws],[595],'2026-T3')
    def test_valuation_keeps_actual_reference_date(self):
        h,_=self.parse([(20,'Valeurs de référence au 30/06/2026'),(40,'Valeur de reconstitution 216,34 €')])
        self.assertEqual(h['prix_reconstitution'][0]['value'],216.34)
        self.assertEqual(h['prix_reconstitution'][0]['reference_date'],'2026-06-30')
    def test_no_valuation_date_is_not_current_quarter(self):
        h,_=self.parse([(40,'Valeur de reconstitution 216,34 €')]);self.assertNotIn('prix_reconstitution',h)
    def test_editorial_percentage_is_not_tof(self):
        h,_=self.parse([(20,'La situation reste stable avec un taux d’occupation financier'),(40,'et 7,40 % sur ces nouvelles acquisitions')])
        self.assertNotIn('tof',h)
    def test_pedagogical_figure_is_not_reconstitution(self):
        h,_=self.parse([(20,'Valeurs au 31/12/2025'),(40,'MIEUX COMPRENDRE LA VALEUR DE RECONSTITUTION'),(60,'130,07 €')])
        self.assertNotIn('prix_reconstitution',h)
    def test_share_count_does_not_borrow_shareholders(self):
        h,_=self.parse([(20,'NOMBRE DE PARTS'),(40,'NOMBRE D’ASSOCIÉS 4321')]);self.assertNotIn('nombre_parts',h)
    def test_fee_net_of_fees_note_is_not_fee_rate(self):
        h,_=self.parse([(20,'Tous les montants sont nets de frais de gestion mais bruts de fiscalité.'),(40,'0,62 %')]);self.assertNotIn('frais_gestion',h)
    def test_two_readers_disagreement_stays_review(self):
        a=self.parse([(20,'TOF 99,12 %')]);b=self.parse([(20,'TOF 99,72 %')])
        m,p,c,_=fields.reconcile(a,b);self.assertNotIn('tof',m);self.assertEqual(c['tof'],'needs_review')
    def test_zero_queue_is_explicit_and_not_imputed(self):
        a=self.parse([(20,'Parts en attente de retrait 0')]);m,p,c,_=fields.reconcile(a,a)
        self.assertEqual(m['parts_attente_retrait'],0)
        a=self.parse([(20,'Bulletin sans donnée de liquidité')]);m,p,c,_=fields.reconcile(a,a)
        self.assertNotIn('parts_attente_retrait',m)
    def test_number_of_subscribed_shares_is_not_stock(self):
        h,_=self.parse([(20,'Nombre de parts souscrites 134')]);self.assertNotIn('nombre_parts',h)
    def test_multi_date_table_is_not_flattened(self):
        a=self.parse([(20,'31/12/2025 30/06/2026'),(40,'Valeur de réalisation 177,04 € 187,67 €')]);m,_,_,_=fields.reconcile(a,a)
        self.assertNotIn('valeur_realisation',m)

class SourceSafetyTests(unittest.TestCase):
    def test_private_host_and_redirect_rejected_before_network(self):
        for u in ['https://extranet.example.com/doc.pdf','https://intranet.example.com/a','http://example.com/a','https://127.0.0.1/a']:
            with self.assertRaises(ValueError):replay.public_source(u)
    def test_official_public_document_permitted(self):
        self.assertEqual(replay.public_source('https://www.corum.fr/sites/default/files/a.pdf'),'https://www.corum.fr/sites/default/files/a.pdf')
    def test_wrong_product_identity_rejected(self):
        self.assertFalse(replay.identity_matches({'scpi_slug':'atream-hotel','scpi_name':'Atream Hôtels'},['SCI Atream Euro Hospitality'],[]))
    def test_true_issue_not_other_quarter(self):
        self.assertTrue(replay.period_matches('2026-T3',['Bulletin 3e trimestre 2026']))
        self.assertFalse(replay.period_matches('2026-T3',['Bulletin 2e trimestre 2026']))

if __name__=='__main__':unittest.main()
