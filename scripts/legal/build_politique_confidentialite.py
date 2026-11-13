"""Politique de confidentialité MaximusSCPI — version du 13/11/2026.

Reprend la structure et la mise en forme de la version du 28/04/2025
(python-docx, modèle par défaut, titres bleus #0056B3) ; seules changent
la date d'entrée en vigueur, la section 5 (durée de conservation des
statistiques de mesure d'audience) et la section 9 (cookies et mesure
d'audience exemptée, RECOVERY-203).

Régénération (RECOVERY-205) :
    python3 scripts/legal/build_politique_confidentialite.py /tmp/politique.docx
    soffice --headless --convert-to pdf --outdir /tmp /tmp/politique.docx
    cp /tmp/politique.pdf public/politique_confidentialite_maximusscpi.pdf
Toute modification du texte juridique doit être validée par Eric Bellaiche
et s'accompagner de la mise à jour de la date « En vigueur au ».
"""
import sys
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt, RGBColor

OUT = sys.argv[1]
BLUE = RGBColor(0x00, 0x56, 0xB3)

SECTIONS = [
    ("1. Responsable du traitement", [
        "MaximusSCPI – Eric Bellaiche",
        "Conseiller en Gestion de Patrimoine – CIF-CGP",
        "Email : eric.bellaiche@gmail.com",
        "Siège social : Coublevie, France",
    ]),
    ("2. Données collectées", [
        "- Données d’identification : nom, prénom, adresse email, numéro de téléphone.",
        "- Données de connexion : adresse IP, logs, cookies.",
        "- Données patrimoniales transmises pour les simulations et audits.",
        "- Documents transmis via le Portail (pièces justificatives, relevés, etc.).",
    ]),
    ("3. Finalités du traitement", [
        "- Accès aux simulateurs et comparateurs SCPI.",
        "- Création et gestion de compte client.",
        "- Conseil patrimonial personnalisé.",
        "- Conformité réglementaire (LCB-FT, KYC).",
        "- Communication avec l’Utilisateur.",
        "- Établissement de relations commerciales.",
    ]),
    ("4. Base légale", [
        "- Consentement de l’Utilisateur.",
        "- Exécution d’un contrat.",
        "- Obligations légales et réglementaires (CIF-CGP).",
    ]),
    ("5. Durée de conservation", [
        "- Données commerciales : 5 ans après la fin de la relation.",
        "- Données légales : durée imposée par la réglementation.",
        "- Cookies : 13 mois maximum.",
        "- Statistiques de mesure d’audience : 25 mois maximum.",
    ]),
    ("6. Partage des données", [
        "- Sociétés de gestion de SCPI, assureurs, établissements bancaires.",
        "- Prestataires techniques (IONOS, signature électronique).",
        "- Autorités de contrôle (ACPR, AMF) si requis.",
        "Aucune donnée n’est vendue à des tiers.",
    ]),
    ("7. Sécurité", [
        "Des mesures techniques et organisationnelles sont mises en place",
        "pour protéger les données contre la perte, l’altération ou l’accès non autorisé.",
    ]),
    ("8. Droits des Utilisateurs", [
        "Conformément au RGPD, l’Utilisateur dispose des droits suivants :",
        "- Accès, rectification, effacement.",
        "- Limitation, opposition, portabilité.",
        "Demande à adresser à : eric.bellaiche@gmail.com",
        "Réclamation possible auprès de la CNIL (www.cnil.fr).",
    ]),
    ("9. Cookies et mesure d’audience", [
        "Lors de la première visite, un bandeau permet d’accepter, de refuser ou de personnaliser "
        "les cookies soumis au consentement. Refuser n’empêche pas d’utiliser le site. "
        "L’Utilisateur peut modifier ses choix à tout moment grâce au lien « Gérer les cookies » "
        "en bas de chaque page. Ses choix sont conservés 13 mois au maximum.",
        "",
        "- Cookies nécessaires : indispensables au fonctionnement du site (mémorisation des choix "
        "de l’Utilisateur, sécurité). Ils ne nécessitent pas de consentement.",
        "- Mesure d’audience anonyme : MaximusSCPI mesure, pour son seul compte, la fréquentation "
        "du site (pages consultées, étapes des simulateurs, provenance de la visite) afin de "
        "l’améliorer. Un identifiant aléatoire est utilisé le temps de la session et effacé à la "
        "fermeture de l’onglet ; l’adresse IP n’est pas conservée par cet outil ; aucune donnée "
        "n’est transmise à un tiers ni rapprochée de l’identité de l’Utilisateur. Conformément "
        "aux lignes directrices de la CNIL, cette mesure est dispensée de consentement. "
        "L’Utilisateur peut s’y opposer à tout moment dans « Gérer les cookies », rubrique "
        "« Mesure d’audience anonyme ». Les statistiques sont conservées 25 mois au maximum.",
        "- Cookies analytiques, avec l’accord de l’Utilisateur : Google Analytics, pour une "
        "mesure détaillée de la fréquentation.",
        "- Cookies marketing, avec l’accord de l’Utilisateur : Google Ads, pour mesurer "
        "l’efficacité des campagnes publicitaires.",
        "Ces deux services sont fournis par Google ; des données peuvent être transférées hors de "
        "l’Union européenne, dans le cadre des garanties prévues par le RGPD.",
    ]),
    ("10. Modifications", [
        "Cette politique peut être mise à jour à tout moment.",
        "La date de mise à jour figure en haut de la page.",
    ]),
]

doc = Document()
doc.core_properties.author = "MaximusSCPI"
doc.core_properties.title = "Politique de Confidentialité – MaximusSCPI"

doc.add_heading("MaximusSCPI", 0).alignment = WD_ALIGN_PARAGRAPH.CENTER

title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = title.add_run("Politique de Confidentialité")
run.bold = True
run.font.size = Pt(16)

date = doc.add_paragraph("En vigueur au 13/11/2026")
date.alignment = WD_ALIGN_PARAGRAPH.CENTER
doc.add_page_break()

for heading, lines in SECTIONS:
    if heading.startswith("9."):
        # La section 9 s'allonge : elle commence sur une nouvelle page
        # plutôt que d'être coupée au milieu d'un paragraphe.
        doc.add_page_break()
    h = doc.add_heading(level=1)
    h_run = h.add_run(heading)
    h_run.font.color.rgb = BLUE
    # Espaces insécables autour des guillemets français : pas de « orphelin.
    body = "\n".join(lines).replace("« ", "«\u00a0").replace(" »", "\u00a0»")
    doc.add_paragraph("\n" + body + "\n")

doc.save(OUT)
