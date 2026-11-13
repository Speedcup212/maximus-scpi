"""Mise en forme commune des documents juridiques MaximusSCPI (RECOVERY-206).

Reproduit la présentation de la politique de confidentialité du 28/04/2025 :
modèle python-docx par défaut (format Letter), titre « MaximusSCPI »,
sous-titre en gras 16 pt, date d'entrée en vigueur, puis une section par
page de titres bleus #0056B3.

Conversion en PDF :
    soffice --headless --convert-to pdf --outdir /tmp /tmp/document.docx
"""
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt, RGBColor

BLUE = RGBColor(0x00, 0x56, 0xB3)


def build(out, title, effective_date, sections, page_break_before=()):
    doc = Document()
    doc.core_properties.author = "MaximusSCPI"
    doc.core_properties.title = f"{title} – MaximusSCPI"

    doc.add_heading("MaximusSCPI", 0).alignment = WD_ALIGN_PARAGRAPH.CENTER

    heading = doc.add_paragraph()
    heading.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = heading.add_run(title)
    run.bold = True
    run.font.size = Pt(16)

    date = doc.add_paragraph(f"En vigueur au {effective_date}")
    date.alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_page_break()

    for section_title, lines in sections:
        if section_title.split(" ", 1)[0] in page_break_before:
            # Section longue : elle commence sur une nouvelle page plutôt que
            # d'être coupée au milieu d'un paragraphe.
            doc.add_page_break()
        h = doc.add_heading(level=1)
        h.add_run(section_title).font.color.rgb = BLUE
        # Espaces insécables autour des guillemets français : pas de « orphelin.
        body = "\n".join(lines).replace("« ", "« ").replace(" »", " »")
        paragraph = doc.add_paragraph("\n" + body + "\n")
        # Un bloc de texte n'est jamais coupé entre deux pages : il passe en
        # entier sur la page suivante, avec son titre (« keep with next »).
        paragraph.paragraph_format.keep_together = True
        paragraph.paragraph_format.widow_control = True

    doc.save(out)
