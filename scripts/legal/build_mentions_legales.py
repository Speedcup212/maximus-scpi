"""Mentions légales — version du 13/11/2026 (RECOVERY-207).

Reprend mot pour mot le texte de la version Word du 11/09/2025, avec la
présentation commune des documents juridiques (legal_docx.py). Seuls
changent :
- l'adresse, désormais 33 avenue de Savoie, 38580 Allevard, dans
  « Éditeur du site » et dans « Réclamation – Médiation CIF » ;
- l'hébergeur : Netlify (le site n'est plus servi par IONOS).

Deux variantes : `maximusscpi` (public/mentions_legales_maximusscpi.pdf) et
`eric-bellaiche` (public/ml.pdf du site eric-bellaiche.fr).

Régénération :
    python3 scripts/legal/build_mentions_legales.py maximusscpi /tmp/ml.docx
    soffice --headless --convert-to pdf --outdir /tmp /tmp/ml.docx
Toute modification du texte juridique doit être validée par Eric Bellaiche.
"""
import sys

from legal_docx import build

VARIANT, OUT = sys.argv[1], sys.argv[2]
EDITOR_HEADING = {
    "maximusscpi": "Éditeur du site MaximusSCPI",
    "eric-bellaiche": "Éditeur du site",
}[VARIANT]

ADDRESS = "33 avenue de Savoie, 38580 Allevard"

SECTIONS = [
    (EDITOR_HEADING, [
        "Eric Bellaiche",
        "Entreprise individuelle immatriculée au RCS de Grenoble sous le numéro 441861135, "
        "code NAF : 6619B.",
        f"Adresse : {ADDRESS}",
        "eric.bellaiche@gmail.com",
    ]),
    ("Hébergeur du site", [
        "Netlify, Inc.",
        "2325 3rd Street, Suite 296",
        "San Francisco, CA 94107",
        "États-Unis",
        "Ce site utilise des cookies. Veuillez-vous référer à la politique de confidentialité et "
        "aux conditions générales d'utilisation.",
    ]),
    ("Conseils", [
        "Le conseil en investissement financier, en courtage d’assurance et de crédit, ainsi "
        "qu'en immobilier, est réalisé par Eric Bellaiche, enregistré auprès de l'ORIAS sous le "
        "numéro 13001580. Membre de la CNCEF Patrimoine, association professionnelle agréée par "
        "l'Autorité des Marchés Financiers (AMF).",
    ]),
    ("Habilitations", [
        "Conseiller en investissements financiers : N° D016571 – ORIAS : n°13001580. Les conseils "
        "en investissement financier sont fournis de manière non-indépendante.",
        "Courtier en assurance et en réassurance : ORIAS : n°13001580. Sous le contrôle de l’ACPR, "
        "4 Place de Budapest CS 92459, 75436 Paris.",
        "Mandataire non exclusif en opération de banque & services de paiements : ORIAS : "
        "n°13001580. Sous le contrôle de l’ACPR, 4 Place de Budapest CS 92459, 75436 Paris.",
        "Mandataire immobilier détenteur de l’attestation d’habilitation : Transactions sur "
        "Immeubles sans réception de fonds. Attestation n° ADC44012023000001232, délivrée par la "
        "Chambre de Commerce et d’Industrie de Nantes-Saint Nazaire.",
        "Garantie Financière et Assurance Responsabilité Civile Professionnelle conformes au Code "
        "des Assurances.",
    ]),
    ("Protection des données personnelles", [
        "Afin de répondre au mieux aux attentes de l’utilisateur et à l’occasion de la "
        "consultation du site ou de l’accès à l’Espace Membre, Eric Bellaiche peut être amené à "
        "recueillir des informations concernant l’utilisateur, susceptibles de faire l’objet de "
        "traitements automatisés.",
        "Eric Bellaiche met tout en œuvre pour assurer la sécurité et la confidentialité des "
        "données de l’utilisateur du site dans le respect de la législation en vigueur. En "
        "revanche, Eric Bellaiche ne peut garantir la sécurité des infrastructures hors de son "
        "contrôle (installations finales) à partir desquelles l’utilisateur initie sa connexion.",
        "Pour plus d’information sur le traitement de vos données, Eric Bellaiche vous invite à "
        "consulter sa politique de protection des données.",
    ]),
    ("Cookies", [
        "Lors d’une visite sur le site, un cookie est installé dans le terminal de l’utilisateur "
        "sous réserve des choix et options qui résultent des paramètres de son logiciel de "
        "navigation.",
        "Les cookies sont des données utilisées par un serveur pour envoyer des informations "
        "d’état au navigateur d’un utilisateur, et par ce navigateur pour renvoyer des "
        "informations d’état au serveur d’origine.",
        "Les informations collectées par ce biais ne seront utilisées que pour suivre le volume, "
        "le type et la configuration du trafic utilisant ce site, pour en développer la "
        "conception et l'agencement et à d'autres fins administratives et de planification et "
        "plus généralement pour améliorer le service que nous vous offrons.",
        "Les informations d’état peuvent être par exemple un identifiant de session, une langue, "
        "une date d’expiration, un domaine de réponse, etc.",
        "Les cookies permettent de conserver, pendant la durée de validité du cookie concerné, des "
        "informations d'état lorsqu’un navigateur accède aux différentes pages d'un site ou "
        "lorsque ce navigateur retourne ultérieurement sur ce site.",
        "La durée de conservation maximale de ces cookies est établie à 13 mois.",
        "Seul l’émetteur d’un cookie peut lire ou modifier les informations qui y sont contenues.",
        "Il existe différents types de cookies :",
        "- des cookies de session qui disparaissent dès que l’Utilisateur quitte le site ;",
        "- des cookies permanents qui demeurent sur le terminal jusqu’à expiration de leur durée "
        "de vie ou jusqu’à ce qu’ils soient supprimés à l’aide des fonctionnalités du navigateur.",
        "Certains de ces cookies ont pour finalité exclusive de permettre ou faciliter la "
        "communication par voie électronique.",
        "D’autres sont strictement nécessaires à la fourniture d'un service de communication en "
        "ligne.",
        "En l’espèce la finalité des cookies est :",
        "• de faciliter la navigation sur le site ;",
        "• d’optimiser le site ;",
        "• analyser des tendances et des mesures d’audience du site et établir des statistiques ;",
        "• permettre la fourniture d’un service expressément demandé par l’utilisateur.",
        "L’utilisateur dispose de plusieurs options pour gérer les cookies. Il peut faire le choix "
        "à tout moment d'exprimer et de modifier ses souhaits en matière de cookies, par les "
        "moyens décrits ci-dessous.",
        "En effet, si la plupart des navigateurs sont paramétrés par défaut et acceptent "
        "l’installation de cookies, l’Utilisateur a la possibilité, s’il le souhaite, de choisir "
        "d’accepter tous les cookies, ou de les rejeter systématiquement ou encore de choisir "
        "ceux qu’il accepte selon l’émetteur.",
        "L’Utilisateur peut également paramétrer son navigateur pour accepter ou refuser au cas "
        "par cas les cookies préalablement à leur installation. Il peut également régulièrement "
        "supprimer les cookies de son terminal via son navigateur.",
        "Il ne doit pas oublier de paramétrer l’ensemble des navigateurs de ses différents "
        "terminaux (tablettes, smartphones, ordinateurs...).",
        "Pour la gestion des cookies et des choix, la configuration de chaque navigateur est "
        "différente. Elle est décrite dans le menu d'aide du navigateur, qui permettra à "
        "l’Utilisateur de savoir de quelle manière modifier ses souhaits en matière de cookies.",
        "Il est précisé qu’une désactivation des cookies pourrait empêcher l’utilisation ou "
        "l’accès à certaines fonctionnalités du site.",
        "Plus d’informations sur les cookies : https://www.cnil.fr/fr/site-web-cookies-et-autres-"
        "traceurs et https://www.cnil.fr/fr/cookies-les-outils-pour-les-maitriser.",
    ]),
    ("Propriété intellectuelle et responsabilité", [
        "L’ensemble du site, ses éléments et ses contenus relève de la législation internationale "
        "sur le droit d’auteur, le droit des marques et, de façon générale, sur la propriété "
        "intellectuelle et sont la propriété exclusive de Eric Bellaiche. L'utilisation et "
        "l’accès à l’Espace Membre du site ne vous confèrent aucun droit de propriété sur le "
        "site, ses éléments constitutifs ou leurs dénominations. Par exception, certains "
        "contenus (textes, images) sont la propriété de leurs auteurs respectifs.",
        "La reproduction ou représentation, intégrale ou partielle, des pages, des données et de "
        "toute autre élément constitutif du site, par quelque procédé ou support que ce soit, est "
        "interdite et constitue, sans autorisation de l'éditeur, une contrefaçon susceptible "
        "d’engager la responsabilité civile et pénale du contrefacteur.",
        "Les représentations, reproductions, diffusions, extractions ou réutilisation, partielles "
        "ou totales, des bases de données accessibles par l'intermédiaire du site sont "
        "expressément interdites en vertu des dispositions du Code de la propriété "
        "intellectuelle.",
        "En aucun cas les utilisateurs ne sont autorisés à publier, retransmettre ou reproduire de "
        "quelque façon que ce soit tout ou partie des informations, illustrations, photographies "
        "diffusées, à d'autres personnes ou organismes. Eric Bellaiche ne peut être tenu "
        "responsable de toute utilisation détournée ou sortie de son contexte des informations "
        "fournies sur ses sites, ainsi que de toute inexactitude, erreur ou omission dans les "
        "informations communiquées. Il n'est pas non plus responsable du transfert des données, "
        "de la qualité et de la disponibilité des réseaux de télécommunication, ni des "
        "interruptions de service.",
    ]),
    ("Réclamation – Médiation CIF", [
        "Modalités de saisine de l’entreprise",
        "Pour toute réclamation, le client s'adresse préalablement à Eric Bellaiche afin de "
        "trouver une solution amiable. La réclamation s’effectuant, sur support durable, est "
        "adressée à :",
        "Mail : eric.bellaiche@gmail.com",
        f"Courrier : {ADDRESS}",
        "",
        "Traitement des réclamations",
        "(Article 325-23 du RGAMF et Instruction AMF n° 2012-07 du 13/07/2012 - MAJ 24/04/2013, "
        "20/11/2013 et 17/10/2014 et 12/12/2016 avec effet au 01/05/2017)",
        "ATTENTION / RAPPEL : S’agissant des procédures et de l’organisation du traitement des "
        "réclamations, il convient de se reporter également au Code Intérieur / Traitement des "
        "Réclamations-Procédures et Organisation.",
        "",
        "Traitement des réclamations – Médiation CIF :",
        "Eric Bellaiche s’engage à traiter votre réclamation dans les délais suivants :",
        "➢ Dix jours ouvrables maximum à compter de la réception de la réclamation, pour accuser "
        "réception, sauf si la réponse elle-même est apportée au client dans ce délai ;",
        "➢ Deux mois maximum entre la date de réception de la réclamation et la date d’envoi de "
        "la réponse au client, sauf survenance de circonstances particulières dûment justifiées.",
        "Si la réponse apportée à sa réclamation ne lui apparaît pas satisfaisante, le client peut "
        "saisir le médiateur de la consommation compétent suivant :",
        "➢ Au titre de l’activité de conseiller en investissements financiers :",
        "   Le Médiateur – Autorité des marchés financiers – 17, place de la Bourse – "
        "75082 PARIS CEDEX 02",
        "➢ Au titre des autres activités :",
        "   Le Médiateur – CNPM - MÉDIATION DE LA CONSOMMATION. En cas de litige, vous pouvez "
        "déposer votre réclamation sur son site : http://cnpm-mediation-consommation.eu ou par "
        "voie postale en écrivant à CNPM - MÉDIATION - CONSOMMATION - 27, Avenue de la Libération "
        "– 42400 SAINT CHAMOND",
    ]),
]

build(OUT, "Mentions légales", "13/11/2026", SECTIONS)
