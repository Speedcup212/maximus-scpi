alter table public.scpi_news_items
  add column if not exists image_url text not null default '',
  add column if not exists image_alt text not null default '',
  add column if not exists image_credit text not null default '',
  add column if not exists yield_aem text not null default '',
  add column if not exists annual_rent text not null default '',
  add column if not exists rooms text not null default '',
  add column if not exists location_context text not null default '',
  add column if not exists tenant_context text not null default '',
  add column if not exists portfolio_context text not null default '',
  add column if not exists maximus_analysis text not null default '',
  add column if not exists source_document_label text not null default '';
