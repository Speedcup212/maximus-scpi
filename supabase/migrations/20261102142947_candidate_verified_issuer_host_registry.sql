-- Supabase applied migration 20261102142947 candidate_verified_issuer_host_registry.
-- No public issuer authorization and no financial approvals.
create table if not exists maximus_agents.scpi_candidate_issuer_hosts (
 hostname text primary key,
 issuer_name text not null,
 approval_source text not null,
 approved_at timestamptz not null default now(),
 constraint scpi_candidate_issuer_hosts_hostname_check check (hostname ~ '^[a-z0-9]+([.-][a-z0-9]+)*$'),
 constraint scpi_candidate_issuer_hosts_approval_check check (approval_source like 'https://%')
);
alter table maximus_agents.scpi_candidate_issuer_hosts enable row level security;
revoke all on maximus_agents.scpi_candidate_issuer_hosts from public, anon, authenticated, service_role;
grant select on maximus_agents.scpi_candidate_issuer_hosts to service_role;
insert into maximus_agents.scpi_candidate_issuer_hosts (hostname,issuer_name,approval_source) values
 ('www.corum.fr','CORUM','https://www.corum.fr/'),
 ('reim.bnpparibas-am.com','BNP Paribas REIM','https://reim.bnpparibas-am.com/'),
 ('www.sofidy.com','Sofidy','https://www.sofidy.com/solutions/sofidynamic/')
on conflict (hostname) do nothing;
create or replace function maximus_agents.is_verified_candidate_issuer_source(p_source text)
returns boolean language sql stable security invoker
set search_path = pg_catalog, maximus_agents
as $$
 select p_source is not null and
   exists (
     select 1 from maximus_agents.scpi_candidate_issuer_hosts a
     where p_source like ('https://' || a.hostname || '/%')
   )
$$;
revoke all on function maximus_agents.is_verified_candidate_issuer_source(text) from public, anon, authenticated;
grant execute on function maximus_agents.is_verified_candidate_issuer_source(text) to service_role;
alter table maximus_agents.scpi_candidate_metric_evidence
 drop constraint scpi_candidate_metric_evidence_source_url_check;
alter table maximus_agents.scpi_candidate_metric_evidence
 add constraint scpi_candidate_metric_evidence_source_url_check
 check (maximus_agents.is_verified_candidate_issuer_source(source_url));
alter table maximus_agents.scpi_candidate_regulatory_documents
 drop constraint scpi_candidate_regulatory_documents_source_url_check;
alter table maximus_agents.scpi_candidate_regulatory_documents
 add constraint scpi_candidate_regulatory_documents_source_url_check
 check (maximus_agents.is_verified_candidate_issuer_source(source_url));
