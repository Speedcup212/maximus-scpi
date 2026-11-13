"""Politique de confidentialité MaximusSCPI — version du 13/11/2026.

Reprend la structure et la mise en forme de la version du 28/04/2025
(python-docx, modèle par défaut, titres bleus #0056B3) ; seules changent
la date d'entrée en vigueur, la section 5 (durée de conservation des
statistiques de mesure d'audience) et la section 9 (cookies et mesure
d'audience exemptée, RECOVERY-203), puis les sections 5 (prospects /
clients) et 6 (prestataires et transferts hors UE), RECOVERY-206.

Régénération (RECOVERY-205) :
    python3 scripts/legal/build_politique_confidentialite.py /tmp/politique.docx
    soffice --headless --convert-to pdf --outdir /tmp /tmp/politique.docx
    cp /tmp/politique.pdf public/politique_confidentialite_maximusscpi.pdf
Toute modification du texte juridique doit être validée par Eric Bellaiche
et s'accompagner de la mise à jour de la date « En vigueur au ».
"""
import sys

from legal_docx import build

OUT = sys.argv[1]

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
        "- Prospects (demandes de simulation, de rendez-vous ou d’information) : 3 ans après "
        "le dernier contact.",
        "- Clients : 5 ans après la fin de la relation.",
        "- Données légales : durée imposée par la réglementation.",
        "- Cookies : 13 mois maximum.",
        "- Statistiques de mesure d’audience : 25 mois maximum.",
    ]),
    ("6. Partage des données", [
        "- Sociétés de gestion de SCPI, assureurs, établissements bancaires et plateformes de "
        "souscription partenaires, pour l’exécution des opérations demandées par l’Utilisateur.",
        "- Prestataires techniques agissant pour le compte de MaximusSCPI :",
        "   • hébergement du site : Netlify (États-Unis) ;",
        "   • base de données : Supabase, hébergée dans l’Union européenne (Suède) ;",
        "   • envoi des emails : Resend (États-Unis) et Brevo (France) ;",
        "   • prise de rendez-vous en ligne : Calendly (États-Unis) ;",
        "   • mesure d’audience et publicité, avec l’accord de l’Utilisateur : Google ;",
        "   • autres : IONOS, prestataire de signature électronique.",
        "- Autorités de contrôle (ACPR, AMF) si requis.",
        "Certains prestataires sont établis aux États-Unis. Ces transferts de données hors de "
        "l’Union européenne sont encadrés par les garanties prévues par le RGPD : décision "
        "d’adéquation « Data Privacy Framework » pour les entreprises certifiées, ou clauses "
        "contractuelles types de la Commission européenne.",
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

build(OUT, "Politique de Confidentialité", "13/11/2026", SECTIONS, )
