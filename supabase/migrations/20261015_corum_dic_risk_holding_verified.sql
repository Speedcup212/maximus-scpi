-- CORUM DIC evidence, scoped to the identical publisher PDF fingerprint.
-- SRI 3/7 Origin/Eurion, 4/7 XL/USA; holding period 10 years for all.
-- A changed DIC cannot silently inherit the old risk classification.
CREATE TABLE IF NOT EXISTS maximus_agents.scpi_candidate_regulatory_metric_evidence (
 scpi_slug text NOT NULL REFERENCES maximus_agents.scpi_universe(scpi_slug),
 metric text NOT NULL CHECK(metric IN ('risk_sri','recommended_holding_years')),
 numeric_value numeric(10,2) NOT NULL,
 unit text NOT NULL,
 document_kind text NOT NULL DEFAULT 'dic' CHECK(document_kind='dic'),
 source_url text NOT NULL,
 source_sha256 text NOT NULL CHECK(source_sha256 ~ '^[a-f0-9]{64}$'),
 source_page integer NOT NULL CHECK(source_page BETWEEN 1 AND 30),
 evidence_text text NOT NULL CHECK(length(evidence_text)>40),
 qa_status text NOT NULL DEFAULT 'qa_pass' CHECK(qa_status='qa_pass'),
 independently_verified_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(scpi_slug,metric)
);
REVOKE ALL ON maximus_agents.scpi_candidate_regulatory_metric_evidence FROM PUBLIC,anon,authenticated;
WITH evidence(slug,metric,amount,unit,pageno,url,pdf_hash,excerpt) AS (
 VALUES
('corum-eurion','recommended_holding_years','10.00','YEARS','2','https://www.corum.fr/sites/default/files/2026-10/CORUM%20Eurion%20-%20FR1%20-%20Document%20d%27Informations%20Cl%C3%A9s%20%28KID%29%20-%202026.pdf','f1e3a7fb2737f6bdcb19727b1ce3bff3b2f82f19bc68466e6d6ebace860a92f1','que vous conservez le produit pendant 10 années. Vous risquez de ne pas pouvoir vendre facilement votre produit, ou de devoir le vendre à un prix qui influera sensiblement sur le montant que vous percevrez en retour. L’indicateur synthétique de risque permet d’apprécier le niveau de risque de ce produit par rapport à d’autres. Il indique la probabilité que ce produit enregistre des pertes en cas de mouvements sur les marchés. À risque faible À ri'),
('corum-eurion','risk_sri','3.00','SRI_1_TO_7','2','https://www.corum.fr/sites/default/files/2026-10/CORUM%20Eurion%20-%20FR1%20-%20Document%20d%27Informations%20Cl%C3%A9s%20%28KID%29%20-%202026.pdf','f1e3a7fb2737f6bdcb19727b1ce3bff3b2f82f19bc68466e6d6ebace860a92f1','indicateur exact. Ce que vous obtiendrez dépendra de l’évolution du marché et de la durée pendant laquelle vous conserverez l’investissement ou le produit. Il n’est pas facile de sortir de ce produit. Si vous sortez de l’investissement avant la fin de période de détention recommandée, aucune garantie ne vous est donnée et vous pourriez subir des coûts supplémentaires. QUELS SONT LES RISQUES ET QU’EST-CE QUE CELA POURRAIT ME RAPPORTER ? Nous avons'),
('corum-origin','recommended_holding_years','10.00','YEARS','3','https://www.corum.fr/sites/default/files/2026-10/CORUM%20Origin%20-%20FR1%20-%20Document%20d%27Informations%20Cl%C3%A9s%20%28KID%29-%202026.pdf','e46448c398fc741464e0f4cd3e64a9699e4de000d27a7164b0930de00b0babad','demande à conformite@ corumlepargne.fr. Vous pouvez formuler une réclamation en écrivant à l’adresse conformite@corumlepargne.fr. COMBIEN DE TEMPS DOIS-JE LE CONSERVER ET PUIS-JE RETIRER DE L’ARGENT DE FAÇON ANTICIPÉE ? PÉRIODE DE DÉTENTION RECOMMANDÉE : 10 ANS Il est possible de racheter ses parts au prix de retrait avant la fin de la période de détention recommandée. Il n’y a pas de frais de sortie ni de pénalité. La sortie n’est possible que s'),
('corum-origin','risk_sri','3.00','SRI_1_TO_7','1','https://www.corum.fr/sites/default/files/2026-10/CORUM%20Origin%20-%20FR1%20-%20Document%20d%27Informations%20Cl%C3%A9s%20%28KID%29-%202026.pdf','e46448c398fc741464e0f4cd3e64a9699e4de000d27a7164b0930de00b0babad','ÉMENTAIRES : La documentation légale obligatoire (statuts, note d’information, rapports annuels) et les documents de souscription sont disponibles sur www. corumbutler.com. Nous avons classé ce produit dans la classe de risque 3 sur 7, qui est une classe de risque moyenne. Autrement dit, les pertes potentielles liées aux futurs résultats du produit se situent à un niveau entre faible et moyen et, si la situation venait à se détériorer sur les mar'),
('corum-usa','recommended_holding_years','10.00','YEARS','2','https://www.corum.fr/sites/default/files/2026-10/CORUM%20USA%20-%20FR2%20-%20Document%20d%27Information%20Cl%C3%A9s%20-%202026.pdf','e3c51c4038625fe410377c04005a88b7c488d3af00f269c4e5fe4c680e9b0650','par le dépositaire ne seront pas affectés. En cas de défaillance du dépositaire, le risque de perte financière de CORUM USA est atténué en raison de la ségrégation légale des actifs du dépositaire de ceux de CORUM USA. L’investissement dans une SCPI n’est pas garanti ni couvert par un système national de compensation. INVESTISSEMENT 10 000€ 1 an 5 ans 10 ans SCÉNARIOS DURÉE DE DÉTENTION RECOMMANDÉE : 10 ans Scénario de tensions Scénario défavorab'),
('corum-usa','risk_sri','4.00','SRI_1_TO_7','2','https://www.corum.fr/sites/default/files/2026-10/CORUM%20USA%20-%20FR2%20-%20Document%20d%27Information%20Cl%C3%A9s%20-%202026.pdf','e3c51c4038625fe410377c04005a88b7c488d3af00f269c4e5fe4c680e9b0650','P.2/4 DOCUMENTS D’INFORMATIONS CLÉS QUELS SONT LES RISQUES ET QU’EST-CE QUE CELA POURRAIT ME RAPPORTER ? L’indicateur synthétique de risque part de l’hypothèse que vous conservez le produit pendant 10 années. Vous risquez de ne pas pouvoir vendre facilement votre produit, ou de devoir le vendre à un prix qui influera sensiblement sur le montant que vous percevrez en retour. L’indicateur synthétique de risque permet d’apprécier le niveau de risque'),
('corum-xl','recommended_holding_years','10.00','YEARS','3','https://www.corum.fr/sites/default/files/2026-10/CORUM%20XL%20-%20FR1%20-%20Document%20d%27Informations%20Cl%C3%A9s%20%28KID%29-2026.pdf','ca423d98cf7b51d7ea281a51ac63f8ff2b482648b2d92600243d01f5f5ea913b','demande à conformite@ corumlepargne.fr. Vous pouvez formuler une réclamation en écrivant à l’adresse conformite@corumlepargne.fr. COMBIEN DE TEMPS DOIS-JE LE CONSERVER ET PUIS-JE RETIRER DE L’ARGENT DE FAÇON ANTICIPÉE ? PÉRIODE DE DÉTENTION RECOMMANDÉE : 10 ANS Il est possible de racheter ses parts au prix de retrait avant la fin de la période de détention recommandée. Il n’y a pas de frais de sortie ni de pénalité. La sortie n’est possible que s'),
('corum-xl','risk_sri','4.00','SRI_1_TO_7','1','https://www.corum.fr/sites/default/files/2026-10/CORUM%20XL%20-%20FR1%20-%20Document%20d%27Informations%20Cl%C3%A9s%20%28KID%29-2026.pdf','ca423d98cf7b51d7ea281a51ac63f8ff2b482648b2d92600243d01f5f5ea913b','que vous conservez le produit pendant 10 années. Vous risquez de ne pas pouvoir vendre facilement votre produit, ou de devoir le vendre à un prix qui influera sensiblement sur le montant que vous percevrez en retour. L’indicateur synthétique de risque permet d’apprécier le niveau de risque de ce produit par rapport à d’autres. Il indique la probabilité que ce produit enregistre des pertes en cas de mouvements sur les marchés. Nous avons classé ce')
)
INSERT INTO maximus_agents.scpi_candidate_regulatory_metric_evidence
 (scpi_slug,metric,numeric_value,unit,source_url,source_sha256,source_page,evidence_text)
SELECT e.slug,e.metric,e.amount::numeric,e.unit,e.url,e.pdf_hash,e.pageno::integer,e.excerpt
FROM evidence e
JOIN maximus_agents.scpi_candidate_regulatory_documents d
 ON d.scpi_slug=e.slug AND d.document_kind='dic'
 AND d.source_url=e.url AND d.pdf_sha256=e.pdf_hash
 WHERE d.identity_verified=true AND d.kind_verified=true AND
 ((e.metric='risk_sri' AND e.amount::numeric BETWEEN 1 AND 7) OR
 (e.metric='recommended_holding_years' AND e.amount::numeric=10))
 ON CONFLICT (scpi_slug,metric) DO NOTHING;
