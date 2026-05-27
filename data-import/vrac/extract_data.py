import pdfplumber, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

DOCS = {
    'rapport_annuel': r'C:\Users\ericb\Desktop\Liste SCPI + Doc\SCPI Altixia Cadence 12\doc1-20250526-145625.pdf',
    'dic_priips':     r'C:\Users\ericb\Desktop\Liste SCPI + Doc\SCPI Altixia Cadence 12\doc1-20250617-153722.pdf',
    'note_info':      r'C:\Users\ericb\Desktop\Liste SCPI + Doc\SCPI Altixia Cadence 12\doc1-20260309-180655.pdf',
    'bulletin_t1':    r'C:\Users\ericb\Desktop\Liste SCPI + Doc\SCPI Altixia Cadence 12\doc1-20260430-122013.pdf',
}

def extract_pages(path, pages):
    with pdfplumber.open(path) as pdf:
        for i in pages:
            if i < len(pdf.pages):
                text = pdf.pages[i].extract_text() or ''
                print(f'\n--- {path.split(chr(92))[-1]} p{i+1} ---')
                print(text[:3000])

# Rapport annuel: pages 4-20 (identité, performance, patrimoine, répartitions, comptes)
print('\n\n=== RAPPORT ANNUEL 2024 ===')
extract_pages(DOCS['rapport_annuel'], range(4, 22))

# Bulletin T1 2026: all 11 pages
print('\n\n=== BULLETIN T1 2026 ===')
extract_pages(DOCS['bulletin_t1'], range(0, 11))

# DIC: all 3 pages (already read)
print('\n\n=== DIC PRIIPS ===')
extract_pages(DOCS['dic_priips'], range(0, 3))

# Note d'info: pages with frais, jouissance (ch I, II, III)
print('\n\n=== NOTE INFORMATION (frais, jouissance) ===')
extract_pages(DOCS['note_info'], range(11, 28))
