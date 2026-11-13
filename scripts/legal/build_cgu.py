"""Conditions générales d'utilisation MaximusSCPI — version du 13/11/2026.

Remplace le fichier de remplacement de 64 octets (« placeholder ») servi
jusqu'ici à /cgu_maximusscpi.pdf (RECOVERY-206). Même présentation que la
politique de confidentialité (scripts/legal/legal_docx.py).

Régénération :
    python3 scripts/legal/build_cgu.py /tmp/cgu.docx
    soffice --headless --convert-to pdf --outdir /tmp /tmp/cgu.docx
    cp /tmp/cgu.pdf public/cgu_maximusscpi.pdf
Toute modification du texte juridique doit être validée par Eric Bellaiche
et s'accompagner de la mise à jour de la date « En vigueur au ».
"""
import sys

from legal_docx import build

OUT = sys.argv[1]

SECTIONS = [
    ("1. Objet", [
        "Les présentes conditions générales d’utilisation (« CGU ») régissent l’accès et "
        "l’utilisation du site maximusscpi.com (le « Site »). Utiliser le Site vaut acceptation "
        "des CGU en vigueur au jour de la visite.",
    ]),
    ("2. Éditeur du Site", [
        "Eric Bellaiche – MaximusSCPI, entreprise individuelle immatriculée au RCS de Grenoble "
        "sous le n° 441 861 135.",
        "Adresse : 33 avenue de Savoie, 38580 Allevard – Contact : "
        "eric.bellaiche@gmail.com",
        "Conseiller en investissements financiers (CIF), adhérent n° D016571 de la CNCEF "
        "Patrimoine, association agréée par l’Autorité des marchés financiers ; immatriculé à "
        "l’ORIAS sous le n° 13001580 (www.orias.fr). Les autres habilitations (assurance, "
        "opérations de banque, immobilier) figurent dans les mentions légales.",
        "Hébergement du Site : Netlify, Inc., 2325 3rd Street, Suite 296, San Francisco, "
        "CA 94107, États-Unis.",
        "Les conseils en investissement financier sont fournis de manière non indépendante : "
        "ils peuvent donner lieu à la perception de rémunérations versées par les sociétés de "
        "gestion ou les assureurs. Le détail est communiqué avant toute prestation de conseil.",
    ]),
    ("3. Services proposés", [
        "Le Site propose gratuitement et sans inscription :",
        "- un comparateur et des fiches de SCPI ;",
        "- des simulateurs (revenus, fiscalité, délai de jouissance, etc.) ;",
        "- des contenus pédagogiques et des actualités ;",
        "- l’envoi par email d’une simulation, à la demande de l’Utilisateur ;",
        "- la prise de rendez-vous avec un conseiller.",
        "L’Espace Pro est réservé aux personnes disposant d’un accès personnel ; leurs "
        "identifiants sont strictement confidentiels.",
    ]),
    ("4. Nature des informations", [
        "Les informations, comparaisons et simulations du Site sont fournies à titre "
        "d’information générale et pédagogique. Elles ne constituent ni une recommandation "
        "personnalisée, ni un conseil en investissement, ni une offre ou une sollicitation "
        "d’achat ou de vente.",
        "Un conseil personnalisé n’est délivré qu’après un entretien, le recueil des "
        "informations nécessaires (situation patrimoniale et financière, objectifs, "
        "connaissances et expérience, tolérance au risque) et la remise des documents "
        "réglementaires (document d’entrée en relation, lettre de mission, rapport "
        "d’adéquation).",
    ]),
    ("5. Données SCPI et simulations", [
        "Les données SCPI proviennent de sources publiques et officielles : documents "
        "d’informations clés (DIC), notes d’information, bulletins trimestriels, rapports "
        "annuels, publications des sociétés de gestion, de l’ASPIM et de l’IEIF. Malgré le "
        "soin apporté à leur collecte et à leur contrôle, elles peuvent comporter des erreurs "
        "ou ne pas être à jour ; une donnée non vérifiée est signalée comme telle.",
        "Les simulations reposent sur les hypothèses choisies par l’Utilisateur et sur une "
        "fiscalité simplifiée. Leurs résultats sont indicatifs et non contractuels. Les "
        "performances passées ne préjugent pas des performances futures.",
    ]),
    ("6. Risques liés aux SCPI", [
        "Une SCPI est un placement immobilier de long terme : la durée de placement "
        "recommandée est généralement de 8 à 10 ans minimum, selon la SCPI. Elle comporte un "
        "risque de perte en capital ; les revenus ne sont pas garantis et dépendent du marché "
        "immobilier ; la liquidité est limitée, la revente des parts n’étant ni garantie ni "
        "immédiate ; des frais s’appliquent à la souscription et pendant la détention.",
        "Avant toute souscription, l’Utilisateur doit prendre connaissance du DIC et de la note "
        "d’information de la SCPI concernée.",
    ]),
    ("7. Engagements de l’Utilisateur", [
        "L’Utilisateur s’engage à :",
        "- utiliser le Site de manière loyale et conforme à sa destination ;",
        "- fournir des informations exactes lorsqu’il remplit un formulaire ;",
        "- ne pas tenter de contourner les mesures de sécurité ;",
        "- ne pas extraire de manière massive ou automatisée les données du Site sans "
        "autorisation écrite préalable.",
    ]),
    ("8. Responsabilité", [
        "MaximusSCPI met en œuvre les moyens raisonnables pour assurer l’exactitude des "
        "informations et la disponibilité du Site, sans pouvoir les garantir. MaximusSCPI ne "
        "peut être tenu responsable des décisions d’investissement prises sur la seule base "
        "des informations du Site, sans conseil personnalisé, ni du contenu des sites tiers "
        "vers lesquels le Site renvoie.",
    ]),
    ("9. Propriété intellectuelle", [
        "Les textes, graphiques, logos, outils et bases de données du Site sont protégés par le "
        "droit d’auteur et par le droit des producteurs de bases de données. Toute "
        "reproduction ou extraction substantielle sans autorisation est interdite. Les courtes "
        "citations sont permises avec mention de la source « MaximusSCPI ».",
    ]),
    ("10. Données personnelles et cookies", [
        "Le traitement des données personnelles et l’usage des cookies sont décrits dans la "
        "politique de confidentialité, accessible en bas de chaque page du Site.",
    ]),
    ("11. Réclamations et médiation", [
        "Toute réclamation doit d’abord être adressée par écrit à Eric Bellaiche "
        "(eric.bellaiche@gmail.com). Il en accuse réception sous 10 jours ouvrables au maximum "
        "et y répond sous 2 mois au maximum, conformément à l’article 325-23 du règlement "
        "général de l’AMF et à l’instruction AMF n° 2012-07.",
        "En l’absence de réponse satisfaisante, l’Utilisateur peut saisir gratuitement :",
        "- pour l’activité de conseil en investissements financiers : le Médiateur de l’AMF, "
        "Autorité des marchés financiers, 17 place de la Bourse, 75082 Paris Cedex 02 "
        "(www.amf-france.org) ;",
        "- pour les autres activités (immobilier, assurance, financement) : CNPM – Médiation de "
        "la consommation, 27 avenue de la Libération, 42400 Saint-Chamond "
        "(cnpm-mediation-consommation.eu).",
        "La procédure détaillée figure sur la page « Réclamations » du Site.",
    ]),
    ("12. Droit applicable", [
        "Les CGU sont soumises au droit français. À défaut de solution amiable, les tribunaux "
        "français sont compétents, dans les conditions du droit commun.",
    ]),
    ("13. Modifications", [
        "Les CGU peuvent être mises à jour à tout moment ; la date de mise à jour figure en "
        "haut de la page.",
    ]),
]

build(OUT, "Conditions Générales d’Utilisation", "13/11/2026", SECTIONS)
