import pdfplumber, hashlib, os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

DOCS = [
    r'C:\Users\ericb\Desktop\Liste SCPI + Doc\SCPI Altixia Cadence 12\doc1-20250526-145625.pdf',
    r'C:\Users\ericb\Desktop\Liste SCPI + Doc\SCPI Altixia Cadence 12\doc1-20250617-153722.pdf',
    r'C:\Users\ericb\Desktop\Liste SCPI + Doc\SCPI Altixia Cadence 12\doc1-20260309-180655.pdf',
    r'C:\Users\ericb\Desktop\Liste SCPI + Doc\SCPI Altixia Cadence 12\doc1-20260430-122013.pdf',
]

for path in DOCS:
    fname = os.path.basename(path)
    print(f'\n{"="*60}')
    print(f'FILE: {fname}')
    # Hash
    with open(path, 'rb') as f:
        data = f.read()
        sha256 = hashlib.sha256(data).hexdigest()
    print(f'SHA256: {sha256}')
    with pdfplumber.open(path) as pdf:
        nb_pages = len(pdf.pages)
        print(f'PAGES: {nb_pages}')
        # Extract text from first 4 pages
        for i, page in enumerate(pdf.pages[:4]):
            text = page.extract_text() or ''
            print(f'\n--- Page {i+1} ---')
            print(text[:2000])
