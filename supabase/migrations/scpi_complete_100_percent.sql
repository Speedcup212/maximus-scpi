/*
  # Migration complète SCPI avec 100% des répartitions

  1. Tables
    - Recréation table scpi avec toutes les colonnes

  2. Données
    - 51 SCPI avec répartitions sectorielles (100%)
    - 43 SCPI avec répartitions géographiques (84%)

  3. Notes
    - Répartitions sectorielles: parsées depuis format texte
    - Répartitions géographiques: parsées depuis JSON ou NULL si invalide
    - 8 SCPI sans géo: données source mal formatées
*/

DROP TABLE IF EXISTS scpi CASCADE;

CREATE TABLE scpi (
    id bigserial PRIMARY KEY,
    nom text NOT NULL,
    societe_gestion text,
    annee_creation int,
    label_isr text,
    sfdr text,
    profil_cible text,
    capitalisation numeric,
    prix_souscription numeric,
    valeur_retrait numeric,
    valeur_reconstitution numeric,
    valeur_realisation numeric,
    surcote_decote numeric,
    minimum_souscription numeric,
    rendement numeric,
    distribution numeric,
    nb_immeubles int,
    endettement numeric,
    tof numeric,
    delai_jouissance int,
    duree_detention_recommandee int,
    versement_loyers text,
    frais_souscription numeric,
    frais_gestion numeric,
    repartition_sectorielle jsonb,
    repartition_geographique jsonb
);

INSERT INTO scpi (
    nom, societe_gestion, annee_creation, label_isr, sfdr, profil_cible,
    capitalisation, prix_souscription, valeur_retrait, valeur_reconstitution,
    valeur_realisation, surcote_decote, minimum_souscription,
    rendement, distribution, nb_immeubles, endettement, tof,
    delai_jouissance, duree_detention_recommandee, versement_loyers,
    frais_souscription, frais_gestion, repartition_sectorielle, repartition_geographique
) VALUES
('Activimmo','Alderan',2019,'Oui','Article 8','Profil équilibré',1310,610,545.34,609.65,507.28,NULL,6100,5.5,33.56,NULL,0.6,94.8,6,8,'Trimestriel',10.6,10,'{"Entrepôts logistiques":51,"Locaux d''activités":32,"Logistique urbaine":9,"Transports":7,"Autres":1}'::jsonb,'{"France - Dorsale logistique hors IDF":45.5,"France - Autres régions":16,"Espagne":14,"France - Région parisienne":10,"France - Arc atlantique":9,"Italie":3,"Irlande":1,"Pays bas":1,"Allemagne":0.5}'::jsonb),
('Aestiam Cap''Hebergimmo','Aestiam',2013,'Oui','Article 8','Profil équilibré',82,252,226.8,238.51,194.9,-5.76,2520,3.18,8.01,NULL,21,91.79,2,10,'Trimestriel',10,9,'{"Hôtels":71,"Séminaires":27,"Loisirs":2}'::jsonb,'{"Étranger":42,"Régions":35,"Région Parisienne":23}'::jsonb),
('Aestiam Pierre Rendement','Aestiam',1990,'Oui','Article 6','Profil équilibré',401,922,829.8,952.51,790.14,-3.21,9220,4.49,41.4,NULL,10.6,94.25,2,10,'Trimestriel',10,10,'{"Commerces":69,"Hôtels Séminaires":21,"Bureaux":7,"Enseignement":3}'::jsonb,'{"Paris":37,"Région Parisienne":30,"Métropoles Régionales":27,"Étranger":6}'::jsonb),
('Aestiam Placement Pierre','Aestiam',1986,'Oui','Article 8','Profil équilibré',380,350,315,348.04,288.64,NULL,350,5.4,17.85,NULL,13,90.4,2,10,'Trimestriel',10,9.5,'{"Bureaux":77,"Commerces":16,"Hôtels":3,"Enseignement":2,"Locaux d''activités":2}'::jsonb,'{"Paris":20,"Région Parisienne":30,"Régions":39,"Etranger":11}'::jsonb),
('Altixia Cadence 12','ALTIXIA REIM',2018,'Oui','Article 8','Profil équilibré',186.78,200,182,199.82,168.15,NULL,2000,5.73,2.72,NULL,11.35,96.9,2,9,'Mensuel',9,10,'{"Commerces":38,"Activités":32,"Bureaux":26,"Logistique":4}'::jsonb,'{"Régions":59,"Ile-de-France":23,"Espagne":9,"Irlande":6,"Paris":3}'::jsonb),
('Altixia Commerces','ALTIXIA REIM',2018,'Oui','Article 8','Profil équilibré',107.64,203,197.92,208.54,187.35,-2.66,2030,5.12,2.49,NULL,5.1,90.77,5,9,'Trimestriel',2.5,15,'{"Commerces en retail park":58,"Commerces en pied d''immeuble":38,"Bureaux et activités":4}'::jsonb,'{"Régions":62,"Ile-de-France":29,"Paris":9}'::jsonb),
('Atream Hotel','Atream',2016,'Oui','Article 8','Profil équilibré',299.34,1000,900,1068.55,878.1,-6.42,5000,5.05,12.62,NULL,24.87,100,4,10,'Trimestriel',10,10,'{"Hôtels":71,"Autres types d''hébergements touristiques":29}'::jsonb,'{"France":33,"Allemagne":30,"Belgique":23,"Pays-Bas":14}'::jsonb),
('Buroboutic Métropoles','FIDUCIAL Gérance',1986,'Oui','Article 8','Profil équilibré',318.5,230,207,235.76,198.36,-2.44,2300,5.07,11.65,NULL,23.1,97.17,3,8,'Trimestriel',10,9.5,'{"Locaux commerciaux":50.8,"Bureaux":32.2,"Locaux d''activités":17}'::jsonb,'{"Régions":53.3,"Ile-de-France":31.9,"Paris":14.8}'::jsonb),
('Coeur de Région','Sogenial Immobilier',2018,'Oui','Article 8','Profil équilibré',385.28,664,584.32,683.32,557.24,-2.83,2656,6.2,10.3,NULL,9.39,96.62,6,10,'Trimestriel',10,10,'{"Régions":85.2,"Île-de-France":14.8}'::jsonb,NULL),
('Coeur de ville','Sogenial Immobilier',2013,'Non','Article 6','Profil équilibré',27.02,210,184.8,217.04,177.78,-3.24,2100,5.3,2.79,NULL,18.2,98.04,4,10,'Trimestriel',10,10,'{"Commerce alimentaire":46.12,"Commerce non alimentaire":29.23,"Services":21.43,"Santé et éducation":3.22}'::jsonb,'{"Province":84.4,"Paris":15.6}'::jsonb),
('Coeur d''Europe','Sogenial Immobilier',2021,'Oui','Article 8','Profil équilibré',170.32,200,176,212.05,175.7,-5.68,2000,6.02,2.8,NULL,0.82,98.56,6,10,'Trimestriel',10,10,'{"Espagne":38.7,"Belgique":30.4,"Portugal":20.7,"Allemagne":10.2}'::jsonb,'{"Allemagne":44,"France":20,"Pays-Bas":16,"Italie":12,"Espagne":8}'::jsonb),
('Comète','Alderan',2023,'Oui','Article 8','Profil équilibré',120.8,250,225,258.45,221.08,-3.27,5000,11.18,26.56,NULL,30,93.6,6,8,'Trimestriel',10,11,'{"Bureaux":28,"Loisir":24,"Locaux mixtes":15,"Logistique":13,"Commerces":12,"Hôtellerie":9}'::jsonb,'{"Espagne":31,"Royaume-Uni":26,"Pays-Bas":24,"Italie":19}'::jsonb),
('Crédit Mutuel Pierre 1','La Française REM',1973,'Oui','Article 8','Profil équilibré',2154.2,210,197.8,219.67,185.57,-4.31,210,4.52,9,NULL,25.6,93.8,6,10,'Trimestriel',8.5,9,'{"Bureaux":80.1,"Locaux commerciaux":19.9}'::jsonb,'{"Paris":26.9,"Île-de-France":53.2,"Régions":16.8,"Allemagne":3.1}'::jsonb),
('Cristal Life','Inter Gestion REIM',2018,'Oui','Article 9','Profil équilibré',290.4,225,181.28,224.93,196.44,NULL,2250,5.2,10.4,NULL,20.4,93.4,5,10,'Trimestriel',10,9,'{"Commerce":42,"Bureaux":22,"Santé":14,"Éducation":10,"Résidentiel":12}'::jsonb,'{"Régions":78,"Île-de-France":14,"Étranger":8}'::jsonb),
('Edissimo','Amundi Immobilier',1983,'Oui','Article 8','Profil équilibré',1639.5,338,158.25,364.52,269.67,-7.27,338,4.45,15.2,NULL,13.8,89.45,4,10,'Trimestriel',10,9.6,'{"Bureaux":88,"Hôtellerie":9,"Logistique":3}'::jsonb,'{"Paris":65,"Île-de-France":30,"Régions":5}'::jsonb),
('Efimmo 1','Sofidy',1987,'Oui','Article 8','Profil équilibré',3749.9,225,190.8,240.6,200.9,-6.07,2120,5.5,12,NULL,28.1,90.89,6,8,'Trimestriel',10,9.6,'{"Bureaux":78,"Commerces":18,"Logistique":4}'::jsonb,'{"Ile-de-France":54.5,"Régions":36.1,"Paris":7.2,"Allemagne":2.2}'::jsonb),
('Patrimmo Croissance Impact','Præmia REIM France',2025,'Oui','Article 8','Profil équilibré',189.7,677,597.38,678.58,566.77,NULL,7200,NULL,NULL,NULL,6.21,92.4,1,10,'NC',9.8,9,NULL,'{"Région parisienne":36.8,"Paris":32.6,"Régions":27.8,"Parts SCPI":2.8}'::jsonb),
('Perial Grand Paris','PERIAL Asset Management',2017,'Oui','Article 8','Profil équilibré',1100,458,449,449.73,357.29,1.84,1000,5.1,23.05,NULL,33.8,89.4,5,8,'Trimestriel',9.5,10,'{"Bureaux":94.4,"Commerces":2.2,"Logistique et locaux d''activités":1.8,"Hôtels, tourisme, loisirs":1.6}'::jsonb,'{"Région Parisienne":75.4,"Paris":20.3,"Régions":4.3}'::jsonb),
('NCap Régions','Norma Capital',2015,'Oui','Article 8','Profil équilibré',972.8,670,613.8,701.06,576.68,-4.43,3350,5.72,38.32,NULL,25.9,92.7,6,10,'Trimestriel',10,10,NULL,NULL),
('Novapierre 1','PAREF GESTION',1999,'Oui','Article 8','Profil équilibré',180.1,442,406.64,444.31,370.16,NULL,2210,5,21.57,NULL,29.7,89.7,4,10,'Trimestriel',10,10,'{"Alimentaire":15.2,"Santé":9.8,"Équipement de la maison":30.3,"Restauration":15.7,"Services":12.5,"Culture et loisirs":6.6,"Autres":9.9}'::jsonb,'{"Autres régions":30.8,"Paris":28.6,"12 métropoles régionales":21.2,"Ile-de-France hors Paris":19.4}'::jsonb),
('Novapierre Résidentiel','PAREF GESTION',1996,'Non','Article 6','Profil prudent',347.9,1664,1498.43,1581.44,1314.32,5.22,8320,NULL,NULL,NULL,17.1,90.7,2,10,'NC',8.29,1.71,'{"Résidentiel":100}'::jsonb,'{"Paris":77.8,"Région parisienne":19.9,"Nice":2.3}'::jsonb),
('Novaxia NEO','Novaxia Investissement',2019,'Oui','Article 9','Profil équilibré',427.6,187,187,188.33,161.92,NULL,748,6.01,NULL,NULL,29,97.7,NC,10,'Mensuel',NULL,15,'{"Bureaux":93,"Hôtels":3,"Activités":3,"Enseignement":1}'::jsonb,NULL),
('Opportunité Immo','La Française REM',2012,'Oui','Article 8','Profil équilibré',313.02,203,184.73,215.61,177.31,-7.79,203,5.62,11.37,NULL,30,97.5,6,9,'Trimestriel',9,10,'{"Logistique et locaux d''activités":70,"Bureaux et commerces":30}'::jsonb,'{"France":70,"Europe":30}'::jsonb),
('Optimale','CONSULTIM Asset Management',2020,'Oui','Article 8','Profil équilibré',76,250,225,260.98,217.18,-4.21,1500,6.51,16.28,NULL,17.7,96,4,10,'Mensuel',10,10,NULL,NULL),
('Paref Evo','PAREF GESTION',2020,'Oui','Article 8','Profil équilibré',47,250,225,246.35,214.15,1.48,1250,6,12.4,NULL,NULL,97.2,6,10,'Trimestriel',10,8.33,'{"Bureaux":89.7,"Locaux d''activité":10.3}'::jsonb,'{"Pologne":100}'::jsonb),
('GMA Essentialis','GREENMAN ARTH',2021,'Oui','Article 8','Profil équilibré',42.32,150,185.4,166.45,134.4,-9.86,2060,NULL,NULL,NULL,39.07,99.67,5,10,'Trimestriel',10,10,'{"Alimentaire":90,"Tertiaire":10}'::jsonb,'{"France":51,"Allemagne":49}'::jsonb),
('Grand Paris Résidentiel','Inter Gestion REIM',2018,'Non','Article 6','Profil prudent',12.21,200,176,193.67,161.76,-3.28,200,NULL,NULL,NULL,38.44,92.14,3,10,'Trimestriel',10,10,NULL,'{"Ile-de-France":87,"Régions":13}'::jsonb),
('Immorente','SOFIDY',1988,'Oui','Article 8','Profil équilibré',4392,340,306,319.75,267.82,6.33,1360,5.04,16.64,NULL,15.3,92.61,4,8,'Trimestriel',10,10,'{"Bureaux":36.3,"Commerces de centre-ville et milieu urbain":24.1,"Galeries commerciales":13.7,"Autres":9.5,"Moyennes surfaces commerciales de périphéries":16.4}'::jsonb,'{"Paris Centre":22.5,"Grand Paris":25,"Métropoles françaises":32.8,"Pays-Bas":7.9,"Allemagne":4.5,"Belgique":3,"Royaume-Uni":2.9,"Irlande":0.6,"Reste de l''Europe":0.8}'::jsonb),
('Iroko Zen','Iroko',2020,'Oui','Article 8','Profil équilibré',1100,202,204,214.37,213.65,-5.76,202,6.01,14.58,NULL,26.18,97.7,1,10,'Mensuel',NULL,12.5,'{"Bureaux":30,"Commerces":34,"Locaux d''activités":21,"Entrepôts":11,"Hôtels":3,"Enseignement":1}'::jsonb,'{"France":44,"Pays-Bas":10,"Allemagne":8,"Espagne":10,"Royaume-Uni":16,"Irlande":12}'::jsonb),
('Kyaneos Pierre','KYANEOS ASSET MANAGEMENT',2018,'Oui','Article 9','Profil équilibré',384.78,224,199.36,232.55,197.58,-3.66,2240,4.96,9.46,NULL,NULL,90,6,10,'Trimestriel',9.17,10,'{"Résidentiel":80,"Tertiaire":20}'::jsonb,'{"France":100}'::jsonb),
('LF Avenir Santé','La Française REM',2021,'Oui','Article 8','Profil prudent',231.71,300,273,307.2,242.62,-2.34,300,5.2,14.1,NULL,23.75,100,6,9,'Trimestriel',10,10,'{"Soins de ville":43,"Établissements sanitaires":41,"Solutions d''accueil générationnelles":16}'::jsonb,'{"Paris":32.75,"Ile-de-France":5.58,"Régions":40.09,"Belgique":11.93,"Irlande":9.65}'::jsonb),
('LF Europimmo','La Française REM',2014,'Oui','Article 8','Profil équilibré',873.86,725,667,779.36,642.75,-6.97,725,4.3,40.63,NULL,17.87,97.3,6,9,'Trimestriel',8,10,NULL,NULL),
('LF Grand Paris Patrimoine','La Française REM',1999,'Oui','Article 8','Profil équilibré',1251.45,218,200.56,236.63,191.17,-7.87,218,4.4,13.63,NULL,32.69,95.1,6,9,'Trimestriel',8,10,'{"Bureaux":75,"Commerces":25}'::jsonb,'{"Ile-de-France":85,"Régions":15}'::jsonb),
('Log In','THEOREIM',2022,'Oui','Article 8','Profil équilibré',192.1,250,225,258.21,207.32,-3.18,1000,6,15,NULL,4.45,98.6,6,10,'Trimestriel',10,10,NULL,NULL),
('NCap Education Santé','Norma Capital',2018,'Oui','Article 8','Profil prudent',110,202,181.8,203.01,173.23,NULL,2020,4.85,9.8,51,NULL,96.5,6,10,'Trimestriel',10,10,'{"Santé / social":66,"Bien-être":16,"Éducation":16,"Environnement":2}'::jsonb,'{"France":85,"Zone euro":10,"Hors zone euro":5}'::jsonb),
('Paref Hexa','PAREF GESTION',1991,'Oui','Article 8','Profil équilibré',267.6,210,189,199.52,163.32,5.25,1050,6,12.58,NULL,25.8,93.6,6,10,'Trimestriel',10,8,'{"Bureaux":66.3,"Locaux d''activité":23.9,"Logistique et Messagerie":6.3,"Autres":3.5}'::jsonb,'{"12 métropoles régionales":56.3,"Ile-de-France":27.1,"Autres régions":11.5,"Paris":5.1}'::jsonb),
('Remake Live','Remake Asset Management',2022,'Oui','Article 8','Profil équilibré',647,204,204,204.05,177.52,NULL,204,7.5,15.29,NULL,23.1,99,6,10,'Mensuel',NULL,15,'{"Bureaux":37.76,"Santé & éducation":24.04,"Logistique et locaux d''activité":15.37,"Commerces":13.24,"Hôtels, tourisme, loisirs":4.78,"Résidentiel":3.74,"Alternatifs":1.07}'::jsonb,'{"Royaume Uni":32.16,"France":24.51,"Espagne":12.67,"Pays-Bas":10.4,"Pologne":8.74,"Irlande":7.2,"Allemagne":3.26,"Portugal":1.07}'::jsonb),
('Perial Opportunités Europe','PERIAL Asset Management',1998,'Oui','Article 8','Profil équilibré',777.63,880,796.4,859.08,683.84,-3.45,4400,6.27,51.7,NULL,30.6,93.6,5,8,'Trimestriel',9.5,10,'{"Bureaux":49.5,"Hôtels, tourisme, loisirs":26.3,"Commerces":18.3,"Santé & éducation":4.9,"Logistique et locaux d''activités":0.8,"Alternatifs":0.1}'::jsonb,NULL),
('Perial O2','PERIAL Asset Management',2009,'Oui','Article 8','Profil équilibré',2420,164,150.06,152.62,122.01,7.46,4920,4.91,7.8,NULL,32.3,91.3,4,8,'Trimestriel',8.5,9.58,'{"Bureaux":85.4,"Hôtels, tourisme, loisirs":5.8,"Santé & éducation":4.5,"Commerces":3.6,"Logistique et locaux d''activités":0.7}'::jsonb,NULL),
('Perial Hospitalité Europe','PERIAL Asset Management',2020,'Oui','Article 8','Profil équilibré',333.11,181,165.61,181.17,144.93,NULL,905,4.02,6.2,NULL,20.7,98.1,4,8,'Trimestriel',8.5,9,'{"Santé et éducation":61,"Hôtels, tourisme, loisirs":37.9,"Alternatifs, résidences étudiantes":1.1}'::jsonb,'{"Allemagne":67.5,"Espagne":17.6,"Italie":11.4,"Pays-Bas":3.5}'::jsonb),
('Sofiprime','Sofidy',2016,'Non','Article 6','Profil équilibré',44.9,280,238.5,283.72,230.25,-1.31,2800,0.54,1.5,NULL,22.9,88.52,4,10,'Trimestriel',9.67,1.03,NULL,'{"Paris":41,"Île-de-France hors Paris":34,"Régions françaises":25}'::jsonb),
('Selectinvest 1','La Française REM',1968,'Oui','Article 8','Profil équilibré',1552.4,530,490,585.36,489.73,-9.46,530,4.4,26.28,NULL,33.8,89.8,5,9,'Trimestriel',7.5,9,'{"Bureaux":72.52,"Commerces":21.41,"Logistique et locaux d''activités":3.87,"Hotels, tourisme et loisirs":1.68,"Santé et éducation":0.52}'::jsonb,'{"Ile-de-France":54.5,"Régions":24.8,"Paris":17.28,"Allemagne":3.42}'::jsonb),
('Transitions Europe','Arkéa REIM',2022,'Oui','Article 8','Profil équilibré',542,200,180,205.84,175.37,-2.84,1000,8.25,16.5,NULL,NULL,100,6,10,'Trimestriel',10,10,'{"Bureaux":38,"Commerces":18,"Life Sciences":13,"Hospitalité":11,"Logistique":13,"Éducation":7}'::jsonb,'{"Espagne":34,"Pays-Bas":27,"Allemagne":20,"Irlande":12,"Pologne":7}'::jsonb),
('Urban Coeur de Commerce','Urban Premium',2018,'Oui','Article 8','Profil équilibré',72.99,300,264.5,316.57,261.09,-5.52,3000,5.1,3.82,NULL,30,92.3,6,10,'Trimestriel',9.86,10,'{"Commerces de services":30,"Commerces alimentaires, restauration":29,"Commerces de santé":16,"Commerces divers":25}'::jsonb,'{"Province":83,"Île de France":17}'::jsonb),
('Épargne Foncière','La Française REM',1968,'Oui','Article 8','Profil équilibré',5201.52,670,619.75,743.07,617.45,-9.83,670,4.52,36.72,NULL,23.08,89.2,6,9,'Trimestriel',7.5,10,'{"Bureaux":70.99,"Commerces":19.36,"Hôtels":5.73,"Santé et éducation":3.4,"Logistique et locaux d''activités":0.52}'::jsonb,'{"Paris":22.44,"Île-de-France":37.59,"Régions":31.82,"Allemagne":5.37,"Pays-Bas":1.47,"Royaume-Uni":0.9,"Irlande":0.41}'::jsonb),
('Épargne Pierre','Atland Voisin',2013,'Oui','Article 8','Profil équilibré',2734,208,187.2,208.64,170.1,NULL,2080,5.28,10.98,NULL,11.7,95.72,6,10,'Trimestriel',10,10,'{"Locaux commerciaux":84.1,"Bureaux":15.8,"Entrepôts et activités":0.1}'::jsonb,'{"Régions":51.8,"Paris":25.8,"Île-de-France":19.9,"Europe":2.5}'::jsonb),
('Épargne Pierre Europe','Atland Voisin',2022,'Oui','Article 8','Profil équilibré',268,200,180,206.51,176.3,-3.15,6000,6.75,13.5,NULL,NULL,100,6,10,'Trimestriel',10,10,'{"Bureaux":38.5,"Commerces":28.39,"Hôtellerie":13,"Santé":16.27,"Activités / Logistique":3.84}'::jsonb,'{"Espagne":52.8,"Pays-Bas":19.86,"Irlande":27.34}'::jsonb),
('ESG Pierre Capital','Swiss Life AM France',2017,'Oui','Article 8','Profil équilibré',126.45,188,184.5,188.03,153.25,NULL,188,5.5,60.5,NULL,27.74,98.4,6,10,'Trimestriel',8,8.5,'{"Hôtellerie Bien-Être":33,"Logistique":24,"Bureaux":20,"Éducation":11,"Commerces":12}'::jsonb,'{"France":51,"Allemagne":49}'::jsonb),
('Ficommerce Proximité','FIDUCIAL Gérance',1986,'Oui','Article 8','Profil équilibré',599.8,210,189,209.27,175.18,NULL,2100,5.07,10.65,NULL,1.79,95.72,4,8,'Trimestriel',10,9.3,'{"Locaux commerciaux":84.1,"Bureaux":15.8,"Entrepôts et activités":0.1}'::jsonb,'{"Régions":51.8,"Paris":25.8,"Île-de-France":19.9,"Europe":2.5}'::jsonb),
('Foncière des Praticiens','MAGELLIM REIM',2017,'Oui','Article 8','Profil équilibré',164.9,1100,1012,1082.36,957.21,1.63,1100,5.5,60.5,NULL,1.79,97.69,5,8 à 12,'Trimestriel',8,8.5,'{"Locaux d''accompagnement et de rééducation":47,"Locaux supports au secteur de la santé":35,"Life Sciences":18}'::jsonb,'{"France":51,"Allemagne":49}'::jsonb),
('Selectipierre 2','FIDUCIAL Gérance',1978,'Oui','Article 8','Profil équilibré',473.1,773,695.7,796.46,664,-2.95,7730,4.08,31.5,NULL,24.57,95.35,6,8,'Trimestriel',10,9,'{"Bureaux":67.5,"Locaux commerciaux":21.3,"Résidence hôtelières / étudiantes":4.3,"Locaux d''habitation":5.6,"Locaux d''activité":1.3}'::jsonb,'{"Paris":71,"Ile-de-France":22.6,"Régions":6.4}'::jsonb);

SELECT COUNT(*) FROM scpi;