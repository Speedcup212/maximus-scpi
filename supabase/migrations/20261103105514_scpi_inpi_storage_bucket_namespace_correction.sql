-- Applied to MaximusSCPI as migration 20261103105514.
comment on table public.scpi_inpi_documents is 'Restricted INPI acts catalog. PDFs reside in existing scpi-bulletins private storage bucket, inpi/ prefix. INPI withdrawals require removing the object.';
