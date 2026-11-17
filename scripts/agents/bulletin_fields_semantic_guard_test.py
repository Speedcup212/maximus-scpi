"""REGRESSION: Novaxia NEO T3 2026 wrong "realisation 171.25" field.

Source PDF SHA a004d88d... page 7 shows realization 145.51 EUR/part
and reconstitution 171.25 EUR/part. Both PDF readers previously borrowed
the second number for the first field via adjacent caption geometry.
"""
import unittest
import bulletin_fields as f

def group(t,x,y,width=100):
    return [(x,y,x+width,y+12,t)]

class ReferenceCaptionGuardTest(unittest.TestCase):
    def test_rejects_neighbor_reconstitution_number_for_realization(self):
        realization=group("Valeur de réalisation",255,100)
        reconstitution=group("Valeur de reconstitution",255,154)
        value_reconstitution=group("171,25 €",190,154,width=60)
        self.assertTrue(f.competing_reference_caption_is_closer(
            "valeur_realisation",realization,value_reconstitution,
            [realization,reconstitution,value_reconstitution]))

    def test_preserves_correct_metric_when_it_is_closest(self):
        realization=group("Valeur de réalisation",255,100)
        reconstitution=group("Valeur de reconstitution",255,154)
        realization_value=group("145,51 €",190,100,width=60)
        self.assertFalse(f.competing_reference_caption_is_closer(
            "valeur_realisation",realization,realization_value,
            [realization,reconstitution,realization_value]))

    def test_symmetric_guard_prevents_reverse_contamination(self):
        realization=group("Valeur de réalisation",255,100)
        reconstitution=group("Valeur de reconstitution",255,154)
        realization_value=group("145,51 €",190,100,width=60)
        self.assertTrue(f.competing_reference_caption_is_closer(
            "prix_reconstitution",reconstitution,realization_value,
            [realization,reconstitution,realization_value]))

    def test_unrelated_fields_are_unchanged(self):
        realization=group("Valeur de réalisation",255,100)
        reconstitution=group("Valeur de reconstitution",255,154)
        other=group("145,51 €",190,100,width=60)
        self.assertFalse(f.competing_reference_caption_is_closer(
            "capitalisation",reconstitution,other,
            [realization,reconstitution,other]))


if __name__=="__main__":unittest.main()
