/**
 * Configuration des articles "Sociétés de gestion SCPI" — Batch 1
 * Architecture scalable pour 50+ sociétés.
 * Les SCPI associées viennent de data-import/scpi_management_companies_master_2026.json
 */

import type { ArticleTemplate } from './articleTemplatesConfig';

export interface ManagementCompanyConfig {
  slug: string;
  name: string;
  displayName: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  mainKeyword: string;
  keywords: string[];
  category: string;
  managedScpis: { name: string; status: 'verified' | 'to_verify'; sector?: string }[];
  summary: string;
  keyPoints: string[];
  vigilancePoints: { critere: string; importance: string; vigilance: string }[];
  casPratiques: { titre: string; description: string }[];
  faq: { question: string; reponse: string }[];
  internalLinks: { label: string; url: string }[];
  angle: string;
}

export const managementCompanyConfigs: ManagementCompanyConfig[] = [
  {
    slug: 'arkea-reim',
    name: 'Arkéa REIM',
    displayName: 'Arkéa REIM',
    title: 'Arkéa REIM : SCPI gérées, stratégie et points de vigilance',
    seoTitle: 'Arkéa REIM SCPI : société de gestion, SCPI gérées et analyse | MaximusSCPI',
    metaDescription: 'Analyse de Arkéa REIM, société de gestion immobilière. SCPI Transitions Europe, stratégie d\'investissement, indicateurs clés et points de vigilance.',
    mainKeyword: 'Arkéa REIM SCPI',
    keywords: ['Arkéa REIM', 'société de gestion SCPI', 'Transitions Europe', 'SCPI Arkéa', 'gestionnaire SCPI', 'AMF'],
    category: 'gestionnaires-acteurs',
    managedScpis: [
      { name: 'Transitions Europe', status: 'verified', sector: 'Diversifié Europe' }
    ],
    summary: 'Arkéa REIM est une société de gestion immobilière à analyser à travers les SCPI qu\'elle gère, leur stratégie, leur capitalisation, leur rendement, leur niveau d\'endettement, leur taux d\'occupation, leurs frais et les documents réglementaires disponibles. Une société de gestion ne garantit ni le rendement, ni la liquidité, ni le capital.',
    keyPoints: [
      'Société de gestion du groupe Arkéa, acteur mutualiste breton',
      'SCPI Transitions Europe : diversification européenne',
      'Stratégie immobilière orientée transitions (énergétique, numérique, démographique)',
      'À analyser via les indicateurs : capitalisation, TOF, endettement, frais, rendement'
    ],
    vigilancePoints: [
      { critere: 'Historique de gestion', importance: 'Évaluer la stabilité et l\'expérience de l\'équipe', vigilance: 'Société récente dans la gestion SCPI — historique à suivre' },
      { critere: 'Capitalisation des véhicules', importance: 'Un véhicule de petite taille peut être plus volatil', vigilance: 'Transitions Europe : capitalisation à vérifier dans le dernier bulletin' },
      { critere: 'TOF', importance: 'Reflet de l\'occupation locative', vigilance: 'Comparer avec la moyenne du marché (85-95%)' },
      { critere: 'Endettement', importance: 'Impact sur la résilience en cas de crise', vigilance: 'Vérifier le ratio d\'endettement et la maturité de la dette' },
      { critere: 'Frais', importance: 'Impact direct sur le rendement net', vigilance: 'Frais de souscription et de gestion à comparer avec le marché' },
      { critere: 'Transparence documentaire', importance: 'Qualité de l\'information financière', vigilance: 'Vérifier la disponibilité des DIC, notes d\'information, rapports annuels' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui compare deux SCPI d\'une même société', description: 'Un investisseur regarde Transitions Europe face à d\'autres SCPI européennes. Il compare les TOF, l\'endettement, la diversification géographique et la qualité du reporting avant de se positionner.' },
      { titre: 'Investisseur qui choisit uniquement sur le rendement', description: 'Un rendement apparent élevé peut masquer un endettement important ou une vacance locative préoccupante. L\'analyse croisée des indicateurs est indispensable.' },
      { titre: 'Investisseur fortement fiscalisé', description: 'Un investisseur TMI 41% analyse si Transitions Europe est éligible en assurance-vie pour optimiser la fiscalité des revenus fonciers.' }
    ],
    faq: [
      { question: 'Une société de gestion garantit-elle le rendement d\'une SCPI ?', reponse: 'Non. Aucune société de gestion ne garantit le rendement d\'une SCPI. Les distributions passées ne préjugent pas des distributions futures. Le prix de part peut varier à la hausse comme à la baisse.' },
      { question: 'Faut-il privilégier une grande société de gestion ?', reponse: 'La taille n\'est pas un gage de qualité. Une petite société peutêtre plus réactive et spécialisée. L\'important est d\'analyser les indicateurs de chaque SCPI, pas seulement la notoriété du gestionnaire.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'AMF SCPI', url: '/amf-scpi/' },
      { label: 'ORIAS SCPI', url: '/orias-scpi/' },
      { label: 'Documents réglementaires SCPI', url: '/documents-reglementaires-scpi/' },
      { label: 'DIC SCPI', url: '/dic-scpi/' },
      { label: 'Note d\'information SCPI', url: '/note-information-scpi/' },
      { label: 'Choisir une SCPI', url: '/choisir-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' },
      { label: 'Frais SCPI', url: '/frais-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Rendement net SCPI', url: '/rendement-net-scpi/' },
      { label: 'TOF SCPI', url: '/tof-scpi/' },
      { label: 'Capitalisation SCPI', url: '/capitalisation-scpi/' },
      { label: 'Endettement SCPI', url: '/endettement-scpi/' }
    ],
    angle: 'Société de gestion à analyser notamment via ses SCPI et sa stratégie immobilière orientée transitions.'
  },
  {
    slug: 'iroko',
    name: 'Iroko',
    displayName: 'Iroko',
    title: 'Iroko : SCPI gérées, frais et stratégie d\'investissement',
    seoTitle: 'Iroko SCPI : société de gestion, Iroko Zen, Iroko Atlas | MaximusSCPI',
    metaDescription: 'Analyse de Iroko, société de gestion. SCPI Iroko Zen et Iroko Atlas, frais d\'entrée, stratégie, indicateurs et points de vigilance.',
    mainKeyword: 'Iroko société de gestion SCPI',
    keywords: ['Iroko', 'Iroko Zen', 'Iroko Atlas', 'société de gestion SCPI', 'frais réduits', 'SCPI digitale', 'gestion immobilière'],
    category: 'gestionnaires-acteurs',
    managedScpis: [
      { name: 'Iroko Zen', status: 'verified', sector: 'Diversifié France/Europe' },
      { name: 'Iroko Atlas', status: 'verified', sector: 'Diversifié Europe' }
    ],
    summary: 'Iroko est une société de gestion immobilière connue pour Iroko Zen et son modèle à frais d\'entrée réduits. Ce modèle est à analyser avec prudence : des frais réduits ne signifient pas un risque réduit ni un rendement garanti. L\'analyse doit porter sur la stratégie d\'investissement, la qualité du patrimoine, le TOF, l\'endettement, la collecte et la transparence documentaire.',
    keyPoints: [
      'Société de gestion récente, modèle digital et frais d\'entrée réduits',
      'Iroko Zen : SCPI grand public, frais de souscription réduits (2-3%)',
      'Iroko Atlas : diversification européenne',
      'Points de vigilance : historique encore limité, croissance rapide à suivre',
      'Transparence : vérifier DIC, notes d\'information, rapports annuels'
    ],
    vigilancePoints: [
      { critere: 'Historique de gestion', importance: 'La société est récente — peu de recul sur un cycle immobilier complet', vigilance: 'Suivre l\'évolution du TOF, de la collecte et du prix de part dans la durée' },
      { critere: 'Frais réduits', importance: 'Des frais d\'entrée bas peuvent réduire le coût d\'acquisition mais ne garantissent pas la performance', vigilance: 'Comparer le rendement net après frais de gestion, pas seulement les frais d\'entrée' },
      { critere: 'Croissance rapide', importance: 'Une collecte élevée peut diluer la qualité des investissements', vigilance: 'Vérifier la capacité à déployer la collecte dans des actifs de qualité' },
      { critere: 'TOF', importance: 'Reflet de l\'occupation locative et de la pertinence des investissements', vigilance: 'Surveiller l\'évolution trimestrielle du TOF' },
      { critere: 'Liquidité', importance: 'Capacité à répondre aux demandes de retrait', vigilance: 'Vérifier le nombre de parts en attente de retrait dans les bulletins trimestriels' }
    ],
    casPratiques: [
      { titre: 'Investisseur attiré par les frais réduits', description: 'Un investisseur compare Iroko Zen (frais d\'entrée 2-3%) avec une SCPI classique (8-12%). Il doit aussi comparer le rendement net après frais de gestion, la qualité du patrimoine et la liquidité.' },
      { titre: 'Investisseur qui regarde une SCPI récente avec peu d\'historique', description: 'Un investisseur analyse Iroko Atlas, SCPI récente. Il vérifie le déploiement de la collecte, la qualité des premiers investissements et le reporting trimestriel.' },
      { titre: 'Investisseur qui diversifie entre plusieurs sociétés de gestion', description: 'Un investisseur répartit son allocation entre Iroko (frais réduits), une société historique (stabilité) et une société spécialisée (secteur santé par exemple).' }
    ],
    faq: [
      { question: 'Les frais réduits d\'Iroko rendent-ils la SCPI plus performante ?', reponse: 'Des frais d\'entrée réduits diminuent le coût d\'acquisition mais n\'ont pas d\'impact direct sur le rendement locatif ni sur la qualité du patrimoine. L\'analyse doit porter sur le rendement net après tous les frais.' },
      { question: 'Une société récente est-elle forcément plus risquée ?', reponse: 'Pas nécessairement, mais elle dispose de moins de recul. Il est important de suivre régulièrement les indicateurs (TOF, collecte, prix de part) et la qualité du reporting.' },
      { question: 'Peut-on investir dans plusieurs SCPI d\'Iroko ?', reponse: 'Oui, il est possible de diversifier entre Iroko Zen et Iroko Atlas, à condition d\'analyser la cohérence globale de l\'allocation.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Frais SCPI', url: '/frais-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' },
      { label: 'AMF SCPI', url: '/amf-scpi/' },
      { label: 'DIC SCPI', url: '/dic-scpi/' },
      { label: 'Documents réglementaires SCPI', url: '/documents-reglementaires-scpi/' },
      { label: 'Choisir une SCPI', url: '/choisir-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Rendement net SCPI', url: '/rendement-net-scpi/' },
      { label: 'TOF SCPI', url: '/tof-scpi/' },
      { label: 'Capitalisation SCPI', url: '/capitalisation-scpi/' },
      { label: 'Endettement SCPI', url: '/endettement-scpi/' }
    ],
    angle: 'Société de gestion connue pour Iroko Zen, frais d\'entrée réduits — modèle à analyser avec prudence.'
  },
  {
    slug: 'corum-am',
    name: 'Corum AM',
    displayName: 'Corum AM',
    title: 'Corum AM : SCPI gérées, fiscalité européenne et diversification',
    seoTitle: 'Corum AM SCPI : société de gestion, SCPI européennes et analyse | MaximusSCPI',
    metaDescription: 'Analyse de Corum AM, société de gestion spécialisée dans les SCPI européennes et internationales. Corum Origin, Corum Convictions, Corum XL — données à vérifier.',
    mainKeyword: 'Corum AM société de gestion SCPI',
    keywords: ['Corum AM', 'Corum Origin', 'Corum Convictions', 'Corum XL', 'SCPI européennes', 'société de gestion SCPI', 'PS 0%', 'fiscalité SCPI'],
    category: 'gestionnaires-acteurs',
    managedScpis: [
      { name: 'Corum Origin', status: 'to_verify', sector: 'Diversifié Europe' },
      { name: 'Corum Convictions', status: 'to_verify', sector: 'Diversifié Europe' },
      { name: 'Corum XL', status: 'to_verify', sector: 'Immobilier de prestige' }
    ],
    summary: 'Corum AM est une société de gestion très visible sur le marché des SCPI européennes et internationales, à analyser via la fiscalité, la diversification géographique, les devises si concernées et la documentation réglementaire. Les données d\'association SCPI ↔ société de gestion sont à vérifier auprès des sources officielles (ASPIM, DIC, site de la société de gestion).',
    keyPoints: [
      'Acteur majeur des SCPI européennes et internationales',
      'SCPI identifiées : Corum Origin, Corum Convictions, Corum XL — à vérifier',
      'Avantage fiscal des prélèvements sociaux réduits sur revenus étrangers',
      'Diversification géographique : plusieurs pays européens',
      'Points de vigilance : risque de change si investissement hors zone euro, liquidité, documentation'
    ],
    vigilancePoints: [
      { critere: 'Association SCPI ↔ société de gestion', importance: 'Les données internes ne contiennent pas encore Corum AM', vigilance: 'Donnée à vérifier — consulter l\'ASPIM, l\'AMF/GECO et les DIC' },
      { critere: 'Fiscalité des revenus étrangers', importance: 'Les SCPI européennes peuvent bénéficier de prélèvements sociaux à 0%', vigilance: 'Vérifier le crédit d\'impôt applicable et le taux effectif selon les pays' },
      { critere: 'Risque de change', importance: 'Certains investissements hors zone euro peuvent exposer au risque de change', vigilance: 'Vérifier la répartition géographique et la politique de couverture de change' },
      { critere: 'Liquidité', importance: 'Les SCPI internationales peuvent avoir une liquidité différente', vigilance: 'Consulter les bulletins trimestriels pour le suivi des retraits' }
    ],
    casPratiques: [
      { titre: 'Investisseur cherchant une exposition européenne', description: 'Un investisseur souhaite diversifier son patrimoine en Europe via des SCPI. Il compare Corum Origin et Corum Convictions sur le rendement net après fiscalité, la répartition géographique et la liquidité.' },
      { titre: 'Investisseur fortement fiscalisé', description: 'Un investisseur TMI 41% analyse l\'intérêt des SCPI européennes pour réduire l\'impact des prélèvements sociaux. Il vérifie le crédit d\'impôt et le taux effectif.' },
      { titre: 'Investisseur qui vérifie la documentation', description: 'Avant d\'investir, l\'investisseur consulte le DIC, la note d\'information et les rapports annuels de chaque SCPI pour vérifier les risques, les frais et la stratégie.' }
    ],
    faq: [
      { question: 'Les SCPI européennes sont-elles plus avantageuses fiscalement ?', reponse: 'Les revenus de SCPI européennes peuvent bénéficier de prélèvements sociaux réduits ou nuls selon les pays, mais le rendement net dépend aussi du crédit d\'impôt et du taux effectif. L\'analyse doit être faite au cas par cas.' },
      { question: 'Faut-il vérifier les SCPI gérées par Corum AM ?', reponse: 'Oui, il est recommandé de vérifier la liste exacte des SCPI gérées sur le site officiel de la société de gestion, l\'ASPIM ou l\'AMF/GECO.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'SCPI européennes', url: '/scpi-europeennes/' },
      { label: 'Fiscalité SCPI', url: '/scpi-fiscalite/' },
      { label: 'AMF SCPI', url: '/amf-scpi/' },
      { label: 'Documents réglementaires SCPI', url: '/documents-reglementaires-scpi/' },
      { label: 'DIC SCPI', url: '/dic-scpi/' },
      { label: 'Rendement net SCPI', url: '/rendement-net-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' }
    ],
    angle: 'Acteur très visible sur les SCPI européennes et internationales, à analyser via fiscalité, diversification, documentation.'
  },
  {
    slug: 'alderan',
    name: 'Alderan',
    displayName: 'Alderan',
    title: 'Alderan : SCPI gérées, stratégie logistique et analyse',
    seoTitle: 'Alderan SCPI : société de gestion, Activimmo, Comète | MaximusSCPI',
    metaDescription: 'Analyse de Alderan, société de gestion. SCPI Activimmo et Comète, exposition logistique, indicateurs clés et points de vigilance.',
    mainKeyword: 'Alderan société de gestion SCPI',
    keywords: ['Alderan', 'Activimmo', 'Comète', 'SCPI logistique', 'société de gestion SCPI', 'gestion immobilière'],
    category: 'gestionnaires-acteurs',
    managedScpis: [
      { name: 'Activimmo', status: 'verified', sector: 'Logistique' },
      { name: 'Comète', status: 'verified', sector: 'Diversifié' }
    ],
    summary: 'Alderan est une société de gestion à analyser via ses SCPI, notamment Activimmo (orientation logistique) et Comète (diversification). L\'analyse porte sur l\'exposition sectorielle, la diversification, la collecte, la qualité du patrimoine et les indicateurs de performance.',
    keyPoints: [
      'Gestionnaire des SCPI Activimmo (logistique) et Comète (diversifié)',
      'Activimmo : forte exposition à la logistique (entrepôts, locaux d\'activité)',
      'Comète : diversification multi-secteurs',
      'Points de vigilance : concentration sectorielle, évolution du TOF, endettement'
    ],
    vigilancePoints: [
      { critere: 'Concentration sectorielle', importance: 'Activimmo est très exposé à la logistique', vigilance: 'Un choc sur le secteur logistique pourrait impacter le rendement' },
      { critere: 'TOF', importance: 'Reflet de l\'occupation locative', vigilance: 'Surveiller l\'évolution trimestrielle, notamment sur les actifs les plus récents' },
      { critere: 'Endettement', importance: 'Impact sur la résilience', vigilance: 'Vérifier le ratio d\'endettement et la maturité dans les rapports annuels' },
      { critere: 'Collecte', importance: 'Capacité à maintenir la collecte', vigilance: 'Une baisse de collecte peut indiquer un essoufflement ou un désintérêt du marché' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui compare deux SCPI d\'Alderan', description: 'Un investisseur compare Activimmo (logistique, rendement potentiel plus élevé mais concentration sectorielle) et Comète (diversification, risque potentiellement plus faible).' },
      { titre: 'Investisseur qui analyse l\'exposition logistique', description: 'Un investisseur déjà exposé à l\'immobilier logistique en direct analyse si Activimmo apporte une diversification ou au contraire une concentration du risque.' }
    ],
    faq: [
      { question: 'La concentration sectorielle d\'Activimmo est-elle un risque ?', reponse: 'Oui, une forte concentration dans un secteur (logistique) expose la SCPI aux aléas de ce secteur. C\'est un point de vigilance à croiser avec la qualité des actifs, la durée des baux et la solidité des locataires.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'SCPI logistique', url: '/scpi-logistique/' },
      { label: 'Capitalisation SCPI', url: '/capitalisation-scpi/' },
      { label: 'TOF SCPI', url: '/tof-scpi/' },
      { label: 'Endettement SCPI', url: '/endettement-scpi/' },
      { label: 'Rendement net SCPI', url: '/rendement-net-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' },
      { label: 'Frais SCPI', url: '/frais-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' }
    ],
    angle: 'Gestionnaire à analyser via ses SCPI, notamment exposition sectorielle, diversification, collecte, qualité du patrimoine.'
  },
  {
    slug: 'atland-voisin',
    name: 'Atland Voisin',
    displayName: 'Atland Voisin',
    title: 'Atland Voisin : SCPI gérées, stratégie patrimoniale et indicateurs',
    seoTitle: 'Atland Voisin SCPI : société de gestion, Épargne Pierre | MaximusSCPI',
    metaDescription: 'Analyse de Atland Voisin, société de gestion immobilière historique. SCPI Épargne Pierre, Épargne Pierre Europe, stratégie, indicateurs et points de vigilance.',
    mainKeyword: 'Atland Voisin société de gestion SCPI',
    keywords: ['Atland Voisin', 'Épargne Pierre', 'Épargne Pierre Europe', 'société de gestion SCPI', 'SCPI patrimoniale', 'gestion immobilière'],
    category: 'gestionnaires-acteurs',
    managedScpis: [
      { name: 'Épargne Pierre', status: 'verified', sector: 'Diversifié France' },
      { name: 'Épargne Pierre Europe', status: 'verified', sector: 'Diversifié Europe' }
    ],
    summary: 'Atland Voisin est une société de gestion immobilière historique et structurante, à analyser via ses véhicules Épargne Pierre et Épargne Pierre Europe. L\'analyse porte sur la diversification, la qualité du reporting, les indicateurs de performance et la transparence.',
    keyPoints: [
      'Société de gestion historique (Atland Voisin)',
      'Épargne Pierre : SCPI patrimoniale diversifiée France',
      'Épargne Pierre Europe : diversification géographique',
      'À analyser via : capitalisation, TOF, endettement, frais, rendement, transparence'
    ],
    vigilancePoints: [
      { critere: 'Diversification', importance: 'Évaluer la répartition sectorielle et géographique', vigilance: 'Vérifier l\'équilibre entre secteurs et zones géographiques dans les rapports annuels' },
      { critere: 'TOF', importance: 'Reflet de l\'occupation locative', vigilance: 'Comparer avec les SCPI du même segment' },
      { critere: 'Frais', importance: 'Impact sur le rendement net', vigilance: 'Analyser les frais de souscription et de gestion, les comparer au marché' },
      { critere: 'Reporting', importance: 'Qualité de l\'information des associés', vigilance: 'Vérifier la disponibilité et la régularité des bulletins trimestriels et rapports annuels' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui compare deux SCPI d\'Atland Voisin', description: 'Un investisseur compare Épargne Pierre (France, diversification) et Épargne Pierre Europe (exposition internationale) pour choisir selon sa fiscalité et son horizon.' },
      { titre: 'Investisseur qui vérifie la qualité du reporting', description: 'Avant d\'investir, l\'investisseur consulte les bulletins trimestriels et rapports annuels pour évaluer la transparence et la qualité de l\'information.' }
    ],
    faq: [
      { question: 'Atland Voisin est-elle une société de gestion fiable ?', reponse: 'Atland Voisin est une société historique. La fiabilité s\'analyse en croisant les indicateurs de ses SCPI, la qualité du reporting et la transparence documentaire, pas uniquement la notoriété.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Capitalisation SCPI', url: '/capitalisation-scpi/' },
      { label: 'TOF SCPI', url: '/tof-scpi/' },
      { label: 'Rendement net SCPI', url: '/rendement-net-scpi/' },
      { label: 'Frais SCPI', url: '/frais-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' }
    ],
    angle: 'Société historique et structurante, analyse des véhicules, diversification, reporting, indicateurs.'
  },
  {
    slug: 'sofidy',
    name: 'Sofidy',
    displayName: 'Sofidy',
    title: 'Sofidy : SCPI gérées, gamme de produits et analyse patrimoniale',
    seoTitle: 'Sofidy SCPI : société de gestion, Immorente, Efimmo 1, Sofiprime | MaximusSCPI',
    metaDescription: 'Analyse de Sofidy, société de gestion historique. SCPI Immorente, Efimmo 1, Sofiprime, gamme de produits, indicateurs et points de vigilance.',
    mainKeyword: 'Sofidy société de gestion SCPI',
    keywords: ['Sofidy', 'Immorente', 'Efimmo 1', 'Sofiprime', 'société de gestion SCPI', 'SCPI Sofidy', 'gestion immobilière'],
    category: 'gestionnaires-acteurs',
    managedScpis: [
      { name: 'Immorente', status: 'verified', sector: 'Commerces' },
      { name: 'Efimmo 1', status: 'verified', sector: 'Bureaux' },
      { name: 'Sofiprime', status: 'verified', sector: 'Bureaux/Commerces' }
    ],
    summary: 'Sofidy est une société de gestion historique du marché SCPI, à analyser via la profondeur de sa gamme (Immorente, Efimmo 1, Sofiprime), sa stratégie d\'investissement, la qualité de son patrimoine et sa documentation. Une société de gestion ne garantit ni le rendement, ni la liquidité, ni le capital.',
    keyPoints: [
      'Société de gestion historique reconnue sur le marché SCPI',
      'Gamme de 3 SCPI : Immorente (commerces), Efimmo 1 (bureaux), Sofiprime (bureaux/commerces)',
      'Capitalisation cumulée significative',
      'À analyser via : rendement, TOF, endettement, frais, transparence, liquidité'
    ],
    vigilancePoints: [
      { critere: 'Exposition sectorielle', importance: 'Commerces et bureaux sont des secteurs en mutation', vigilance: 'Analyser la résilience du patrimoine (télétravail pour les bureaux, e-commerce pour les commerces)' },
      { critere: 'TOF', importance: 'Reflet de l\'occupation locative', vigilance: 'Surveiller l\'évolution trimestrielle du TOF de chaque SCPI' },
      { critere: 'Endettement', importance: 'Impact sur la résilience en cas de baisse de valorisation', vigilance: 'Vérifier le ratio d\'endettement consolidé et la maturité de la dette' },
      { critere: 'Liquidité', importance: 'Capacité à répondre aux demandes de retrait', vigilance: 'Consulter les bulletins trimestriels pour le délai de retrait moyen' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui choisit entre les SCPI Sofidy', description: 'Un investisseur compare Immorente (commerces), Efimmo 1 (bureaux) et Sofiprime selon son aversion au risque sectoriel et son horizon d\'investissement.' },
      { titre: 'Investisseur qui diversifie entre plusieurs sociétés de gestion', description: 'Un investisseur répartit son allocation entre Sofidy (société historique) et une société plus récente pour équilibrer stabilité et potentiel.' }
    ],
    faq: [
      { question: 'Sofidy est-elle une société de gestion fiable ?', reponse: 'Sofidy est une société historique avec une gamme établie. La fiabilité s\'analyse en croisant les indicateurs de chaque SCPI, la qualité du reporting et la transparence.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Frais SCPI', url: '/frais-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' },
      { label: 'Rendement net SCPI', url: '/rendement-net-scpi/' },
      { label: 'TOF SCPI', url: '/tof-scpi/' },
      { label: 'Capitalisation SCPI', url: '/capitalisation-scpi/' },
      { label: 'Endettement SCPI', url: '/endettement-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' }
    ],
    angle: 'Société historique du marché SCPI, à analyser via profondeur de gamme, stratégie, patrimoine et documentation.'
  },
  {
    slug: 'remake-am',
    name: 'Remake AM',
    displayName: 'Remake AM',
    title: 'Remake AM : SCPI gérées, stratégie et points de vigilance',
    seoTitle: 'Remake AM SCPI : société de gestion, Remake Live, Remake UK 2025 | MaximusSCPI',
    metaDescription: 'Analyse de Remake AM, société de gestion. SCPI Remake Live et Remake UK 2025, frais, stratégie, indicateurs et points de vigilance.',
    mainKeyword: 'Remake AM société de gestion SCPI',
    keywords: ['Remake AM', 'Remake Live', 'Remake UK 2025', 'société de gestion SCPI', 'SCPI résidentiel', 'gestion immobilière'],
    category: 'gestionnaires-acteurs',
    managedScpis: [
      { name: 'Remake Live', status: 'verified', sector: 'Résidentiel France' },
      { name: 'Remake UK 2025', status: 'verified', sector: 'Résidentiel Royaume-Uni' }
    ],
    summary: 'Remake AM est une société de gestion récente et visible sur le marché SCPI, notamment via Remake Live (résidentiel France) et Remake UK 2025 (Royaume-Uni). Son modèle est à analyser via les frais, la stratégie, la collecte, l\'historique encore limité et la transparence documentaire.',
    keyPoints: [
      'Société de gestion récente, spécialisée résidentiel',
      'Remake Live : résidentiel locatif en France',
      'Remake UK 2025 : exposition au marché immobilier britannique',
      'Points de vigilance : historique limité, risque de change pour le Royaume-Uni, collecte à suivre'
    ],
    vigilancePoints: [
      { critere: 'Historique de gestion', importance: 'La société est récente — peu de recul', vigilance: 'Suivre l\'évolution des indicateurs trimestriels sur la durée' },
      { critere: 'Exposition Royaume-Uni', importance: 'Risque de change et marché immobilier spécifique', vigilance: 'Analyser la politique de couverture de change et les perspectives du marché britannique' },
      { critere: 'Collecte', importance: 'Capacité à déployer la collecte dans des actifs de qualité', vigilance: 'Vérifier le rythme d\'investissement et la qualité des acquisitions' },
      { critere: 'Transparence', importance: 'Qualité du reporting et de l\'information des associés', vigilance: 'Consulter les DIC, notes d\'information et rapports annuels disponibles' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui regarde une SCPI récente', description: 'Un investisseur analyse Remake Live. Il vérifie le déploiement de la collecte, la qualité des premiers actifs acquis et le TOF avant de se positionner.' },
      { titre: 'Investisseur qui compare Remake UK 2025 à une SCPI européenne', description: 'Un investisseur compare l\'exposition Royaume-Uni (Remake UK 2025) avec une SCPI européenne zone euro pour évaluer le risque de change et le potentiel de rendement.' }
    ],
    faq: [
      { question: 'Remake AM est-elle une société de gestion récente ?', reponse: 'Oui, Remake AM est une société récente. Cela implique un historique limité, ce qui renforce l\'importance de suivre régulièrement les indicateurs et la qualité du reporting.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Frais SCPI', url: '/frais-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Rendement net SCPI', url: '/rendement-net-scpi/' },
      { label: 'TOF SCPI', url: '/tof-scpi/' },
      { label: 'Capitalisation SCPI', url: '/capitalisation-scpi/' }
    ],
    angle: 'Société récente et visible, modèle à analyser via frais, stratégie, collecte, historique encore limité.'
  },
  {
    slug: 'wemo-reim',
    name: 'Wemo REIM',
    displayName: 'Wemo REIM',
    title: 'Wemo REIM : SCPI Wemo One, stratégie et analyse',
    seoTitle: 'Wemo REIM SCPI : société de gestion, Wemo One | MaximusSCPI',
    metaDescription: 'Analyse de Wemo REIM, société de gestion. SCPI Wemo One, stratégie d\'investissement, indicateurs et points de vigilance.',
    mainKeyword: 'Wemo REIM société de gestion SCPI',
    keywords: ['Wemo REIM', 'Wemo One', 'société de gestion SCPI', 'SCPI', 'gestion immobilière'],
    category: 'gestionnaires-acteurs',
    managedScpis: [
      { name: 'Wemo One', status: 'verified', sector: 'Diversifié' }
    ],
    summary: 'Wemo REIM est un acteur récent à analyser avec prudence sur l\'historique, la collecte, les actifs, la transparence et la liquidité. La SCPI Wemo One est son premier véhicule. Une société de gestion ne garantit ni le rendement, ni la liquidité, ni le capital.',
    keyPoints: [
      'Acteur récent sur le marché SCPI',
      'Wemo One : première SCPI de la société',
      'Points de vigilance : historique limité, collecte à suivre, transparence à vérifier',
      'À analyser via : rendement, TOF, endettement, frais, liquidité'
    ],
    vigilancePoints: [
      { critere: 'Historique de gestion', importance: 'Très peu de recul sur la capacité à gérer un cycle immobilier', vigilance: 'Suivre trimestriellement l\'évolution des indicateurs' },
      { critere: 'Collecte', importance: 'Capacité à lever des fonds et à les déployer', vigilance: 'Analyser le rythme de collecte et la qualité des acquisitions' },
      { critere: 'Transparence documentaire', importance: 'Qualité de l\'information des associés', vigilance: 'Vérifier la disponibilité des DIC, notes d\'information et rapports' },
      { critere: 'Liquidité', importance: 'Capacité à répondre aux demandes de retrait', vigilance: 'Surveiller le marché secondaire et les délais de retrait' }
    ],
    casPratiques: [
      { titre: 'Investisseur prudent face à une société récente', description: 'Un investisseur analyse Wemo One avec une attention renforcée sur la qualité des premiers actifs, le TOF et la transparence du reporting.' },
      { titre: 'Investisseur qui compare plusieurs petites SCPI', description: 'Un investisseur compare Wemo One avec d\'autres SCPI de petite capitalisation pour évaluer le rapport risque/rendement potentiel.' }
    ],
    faq: [
      { question: 'Wemo REIM a-t-elle un historique suffisant ?', reponse: 'Wemo REIM est une société récente. L\'historique limité renforce la nécessité de suivre attentivement les indicateurs trimestriels et la qualité du reporting.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' },
      { label: 'Frais SCPI', url: '/frais-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Rendement net SCPI', url: '/rendement-net-scpi/' },
      { label: 'TOF SCPI', url: '/tof-scpi/' }
    ],
    angle: 'Acteur récent à analyser avec prudence sur historique, collecte, actifs, transparence et liquidité.'
  },
  {
    slug: 'sogenial-immobilier',
    name: 'Sogenial Immobilier',
    displayName: 'Sogenial Immobilier',
    title: 'Sogenial Immobilier : SCPI gérées et analyse patrimoniale',
    seoTitle: 'Sogenial Immobilier SCPI : société de gestion, Coeur de Région | MaximusSCPI',
    metaDescription: 'Analyse de Sogenial Immobilier, société de gestion. SCPI Coeur de Région, Coeur de ville, Coeur d\'Europe, stratégie et indicateurs.',
    mainKeyword: 'Sogenial Immobilier société de gestion SCPI',
    keywords: ['Sogenial Immobilier', 'Coeur de Région', 'Coeur de ville', 'Coeur d\'Europe', 'société de gestion SCPI', 'SCPI Sogenial'],
    category: 'gestionnaires-acteurs',
    managedScpis: [
      { name: 'Coeur de Région', status: 'verified', sector: 'Bureaux/Commerces régions' },
      { name: 'Coeur de ville', status: 'verified', sector: 'Commerces de proximité' },
      { name: 'Coeur d\'Europe', status: 'verified', sector: 'Diversifié Europe' }
    ],
    summary: 'Sogenial Immobilier est une société de gestion à analyser via ses SCPI gérées (Coeur de Région, Coeur de ville, Coeur d\'Europe), leur stratégie, leurs secteurs, la taille des véhicules et la qualité du reporting.',
    keyPoints: [
      'Gamme de 3 SCPI couvrant plusieurs segments',
      'Coeur de Région : bureaux/commerces en régions françaises',
      'Coeur de ville : commerces de proximité',
      'Coeur d\'Europe : diversification européenne',
      'À analyser via : capitalisation, TOF, endettement, frais, rendement, transparence'
    ],
    vigilancePoints: [
      { critere: 'Exposition aux commerces de proximité', importance: 'Secteur en mutation face au e-commerce', vigilance: 'Analyser la résilience des actifs et la solidité des locataires' },
      { critere: 'Taille des véhicules', importance: 'Des SCPI de taille modeste peuvent être moins liquides', vigilance: 'Vérifier la capitalisation et le nombre d\'associés' },
      { critere: 'TOF', importance: 'Reflet de l\'occupation locative', vigilance: 'Surveiller l\'évolution trimestrielle pour chaque SCPI' },
      { critere: 'Reporting', importance: 'Qualité de l\'information', vigilance: 'Vérifier la régularité et la complétude des bulletins trimestriels' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui compare les SCPI Sogenial', description: 'Un investisseur compare Coeur de Région, Coeur de ville et Coeur d\'Europe selon son exposition géographique souhaitée et son aversion au risque sectoriel.' },
      { titre: 'Investisseur qui vérifie la taille des SCPI', description: 'Un investisseur vérifie la capitalisation de chaque SCPI Sogenial pour évaluer la liquidité potentielle et la mutualisation du risque.' }
    ],
    faq: [
      { question: 'Les SCPI de Sogenial Immobilier sont-elles liquides ?', reponse: 'La liquidité dépend de la capitalisation de chaque SCPI et du marché secondaire. Il est recommandé de consulter les bulletins trimestriels pour le suivi des retraits.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Capitalisation SCPI', url: '/capitalisation-scpi/' },
      { label: 'TOF SCPI', url: '/tof-scpi/' },
      { label: 'Rendement net SCPI', url: '/rendement-net-scpi/' },
      { label: 'Frais SCPI', url: '/frais-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' }
    ],
    angle: 'Société à analyser via SCPI gérées, stratégie, secteurs, taille des véhicules et qualité de reporting.'
  },
  {
    slug: 'norma-capital',
    name: 'Norma Capital',
    displayName: 'Norma Capital',
    title: 'Norma Capital : SCPI gérées, diversification et analyse',
    seoTitle: 'Norma Capital SCPI : société de gestion, NCap Régions | MaximusSCPI',
    metaDescription: 'Analyse de Norma Capital, société de gestion. SCPI NCap Régions, NCap Education Santé, NCap Continent, indicateurs et points de vigilance.',
    mainKeyword: 'Norma Capital société de gestion SCPI',
    keywords: ['Norma Capital', 'NCap Régions', 'NCap Education Santé', 'NCap Continent', 'société de gestion SCPI', 'SCPI Norma'],
    category: 'gestionnaires-acteurs',
    managedScpis: [
      { name: 'NCap Régions', status: 'verified', sector: 'Bureaux/Commerces régions' },
      { name: 'NCap Education Santé', status: 'verified', sector: 'Santé/Éducation' },
      { name: 'NCap Continent', status: 'verified', sector: 'Diversifié Europe' }
    ],
    summary: 'Norma Capital est une société de gestion à analyser via les SCPI associées (NCap Régions, NCap Education Santé, NCap Continent), leur diversification, leurs indicateurs, leur fiscalité et leurs risques.',
    keyPoints: [
      'Gamme de 3 SCPI thématiques',
      'NCap Régions : immobilier d\'entreprise en régions',
      'NCap Education Santé : secteurs défensifs (crèches, écoles, santé)',
      'NCap Continent : diversification européenne',
      'À analyser via : rendement, TOF, endettement, frais, transparence, liquidité'
    ],
    vigilancePoints: [
      { critere: 'Exposition aux secteurs défensifs', importance: 'Santé et éducation sont des secteurs résilients mais spécifiques', vigilance: 'Analyser la qualité des exploitants et la durée des baux' },
      { critere: 'Taille des véhicules', importance: 'Des SCPI de taille modeste peuvent être moins liquides', vigilance: 'Vérifier la capitalisation et le nombre d\'associés dans les rapports annuels' },
      { critere: 'TOF', importance: 'Reflet de l\'occupation locative', vigilance: 'Surveiller l\'évolution trimestrielle pour chaque SCPI' },
      { critere: 'Frais', importance: 'Impact sur le rendement net', vigilance: 'Comparer les frais de souscription et de gestion avec le marché' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui compare les SCPI Norma Capital', description: 'Un investisseur compare NCap Régions, NCap Education Santé et NCap Continent selon son exposition sectorielle et géographique souhaitée.' },
      { titre: 'Investisseur qui analyse le secteur santé/éducation', description: 'Un investisseur intéressé par les actifs défensifs analyse NCap Education Santé : qualité des locataires, durée des baux, résilience du secteur.' }
    ],
    faq: [
      { question: 'Le secteur santé/éducation est-il plus résilient ?', reponse: 'Les secteurs santé et éducation sont généralement considérés comme plus résilients car moins sensibles aux cycles économiques, mais ils restent exposés aux risques spécifiques (réglementaires, dépendance aux exploitants).' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'SCPI santé', url: '/scpi-sante/' },
      { label: 'Capitalisation SCPI', url: '/capitalisation-scpi/' },
      { label: 'TOF SCPI', url: '/tof-scpi/' },
      { label: 'Rendement net SCPI', url: '/rendement-net-scpi/' },
      { label: 'Frais SCPI', url: '/frais-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' }
    ],
    angle: 'Société de gestion à analyser via les SCPI associées, diversification, indicateurs, fiscalité et risques.'
  },
  // ============================================================
  // Batch 2 — Sociétés structurantes
  // ============================================================
  {
    slug: 'bnp-paribas-reim-france',
    name: 'BNP Paribas REIM France',
    displayName: 'BNP Paribas REIM France',
    title: 'BNP Paribas REIM France : SCPI gérées, stratégie et analyse',
    seoTitle: 'BNP Paribas REIM France SCPI : société de gestion, Accès Valeur Pierre | MaximusSCPI',
    metaDescription: 'Analyse de BNP Paribas REIM France, société de gestion du groupe BNP Paribas. Accès Valeur Pierre, Diversipierre — données à vérifier.',
    mainKeyword: 'BNP Paribas REIM France SCPI',
    keywords: ['BNP Paribas REIM France', 'Accès Valeur Pierre', 'Diversipierre', 'société de gestion SCPI', 'groupe BNP Paribas', 'gestionnaire SCPI', 'AMF'],
    category: 'gestionnaires-acteurs',
    managedScpis: [
      { name: 'Accès Valeur Pierre', status: 'to_verify', sector: 'Diversifié France' },
      { name: 'Diversipierre', status: 'to_verify', sector: 'Diversifié France' }
    ],
    summary: 'BNP Paribas REIM France est la société de gestion immobilière du groupe BNP Paribas, à analyser avec prudence. Les SCPI associées (Accès Valeur Pierre, Diversipierre) sont à vérifier auprès des sources officielles (ASPIM, AMF/GECO, DIC, site de la société de gestion). Une société de gestion ne garantit ni le rendement, ni la liquidité, ni le capital.',
    keyPoints: [
      'Société de gestion du groupe BNP Paribas, acteur bancaire de premier plan',
      'SCPI identifiées : Accès Valeur Pierre, Diversipierre — à vérifier',
      'Stratégie orientée diversification France',
      'Points de vigilance : vérifier la liste exacte des SCPI gérées via l\'ASPIM'
    ],
    vigilancePoints: [
      { critere: 'Association SCPI ↔ société de gestion', importance: 'Les données internes sont à confirmer', vigilance: 'Donnée à vérifier — consulter l\'ASPIM, l\'AMF/GECO et les DIC des SCPI' },
      { critere: 'Capitalisation des véhicules', importance: 'La taille des SCPI influence la liquidité', vigilance: 'Vérifier la capitalisation dans les bulletins trimestriels' },
      { critere: 'TOF', importance: 'Reflet de l\'occupation locative', vigilance: 'Comparer avec la moyenne du marché (85-95%)' },
      { critere: 'Endettement', importance: 'Impact sur la résilience en cas de crise', vigilance: 'Vérifier le ratio d\'endettement dans les rapports annuels' },
      { critere: 'Frais', importance: 'Impact direct sur le rendement net', vigilance: 'Frais de souscription et de gestion à comparer avec le marché' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui vérifie les SCPI gérées par BNP Paribas REIM France', description: 'Un investisseur identifie Accès Valeur Pierre et Diversipierre comme SCPI potentielles du groupe. Il vérifie sur le site de la société de gestion et l\'ASPIM avant toute analyse.' },
      { titre: 'Investisseur qui compare avec d\'autres sociétés de gestion bancaires', description: 'Un investisseur compare BNP Paribas REIM France avec Amundi Immobilier et La Française REM pour évaluer la gamme, les frais et le rendement.' }
    ],
    faq: [
      { question: 'BNP Paribas REIM France est-elle une société de gestion importante ?', reponse: 'BNP Paribas REIM France bénéficie de la solidité du groupe BNP Paribas. L\'importance se mesure à la capitalisation des SCPI gérées, à la qualité du patrimoine et à la transparence documentaire.' },
      { question: 'Faut-il vérifier les SCPI gérées par BNP Paribas REIM France ?', reponse: 'Oui, il est recommandé de vérifier la liste exacte des SCPI gérées sur le site officiel de la société de gestion ou l\'ASPIM.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Sociétés de gestion SCPI', url: '/societes-de-gestion-scpi/' },
      { label: 'AMF SCPI', url: '/amf-scpi/' },
      { label: 'ORIAS SCPI', url: '/orias-scpi/' },
      { label: 'Documents réglementaires SCPI', url: '/documents-reglementaires-scpi/' },
      { label: 'DIC SCPI', url: '/dic-scpi/' },
      { label: 'Note d\'information SCPI', url: '/note-information-scpi/' },
      { label: 'Choisir une SCPI', url: '/choisir-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' },
      { label: 'Frais SCPI', url: '/frais-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Rendement net SCPI', url: '/rendement-net-scpi/' },
      { label: 'TOF SCPI', url: '/tof-scpi/' },
      { label: 'Capitalisation SCPI', url: '/capitalisation-scpi/' },
      { label: 'Endettement SCPI', url: '/endettement-scpi/' }
    ],
    angle: 'Société de gestion du groupe BNP Paribas, données SCPI à vérifier auprès des sources officielles.'
  },
  {
    slug: 'amundi-immobilier',
    name: 'Amundi Immobilier',
    displayName: 'Amundi Immobilier',
    title: 'Amundi Immobilier : SCPI gérées, stratégie et analyse patrimoniale',
    seoTitle: 'Amundi Immobilier SCPI : société de gestion, Edissimo, Rivoli Avenir Patrimoine | MaximusSCPI',
    metaDescription: 'Analyse de Amundi Immobilier, société de gestion du groupe Amundi (Crédit Agricole). SCPI Edissimo et Rivoli Avenir Patrimoine, indicateurs et points de vigilance.',
    mainKeyword: 'Amundi Immobilier société de gestion SCPI',
    keywords: ['Amundi Immobilier', 'Edissimo', 'Rivoli Avenir Patrimoine', 'société de gestion SCPI', 'Crédit Agricole', 'gestionnaire SCPI', 'AMF'],
    category: 'gestionnaires-acteurs',
    managedScpis: [
      { name: 'Edissimo', status: 'verified', sector: 'Éducation' },
      { name: 'Rivoli Avenir Patrimoine', status: 'verified', sector: 'Diversifié France' }
    ],
    summary: 'Amundi Immobilier est une société de gestion appartenant au groupe Amundi (Crédit Agricole), à analyser via ses SCPI Edissimo (secteur éducation) et Rivoli Avenir Patrimoine (diversification France). L\'analyse porte sur la stratégie, la diversification, la collecte et les indicateurs de performance.',
    keyPoints: [
      'Société de gestion du groupe Amundi / Crédit Agricole, acteur financier majeur',
      'Edissimo : SCPI spécialisée dans l\'immobilier éducatif (crèches, écoles)',
      'Rivoli Avenir Patrimoine : diversification France multi-secteurs',
      'À analyser via : capitalisation, TOF, endettement, frais, rendement, transparence'
    ],
    vigilancePoints: [
      { critere: 'Spécialisation éducation', importance: 'Edissimo est exposé au secteur éducatif (crèches, écoles)', vigilance: 'Analyser la résilience du secteur et la solidité des exploitants' },
      { critere: 'Taille des véhicules', importance: 'Edissimo est une SCPI de niche', vigilance: 'Vérifier la capitalisation et la liquidité potentielle' },
      { critere: 'TOF', importance: 'Reflet de l\'occupation locative', vigilance: 'Surveiller l\'évolution trimestrielle pour chaque SCPI' },
      { critere: 'Frais', importance: 'Impact sur le rendement net', vigilance: 'Comparer les frais avec le marché' }
    ],
    casPratiques: [
      { titre: 'Investisseur intéressé par le secteur éducatif', description: 'Un investisseur analyse Edissimo d\'Amundi Immobilier : qualité des exploitants, durée des baux, résilience du secteur éducatif.' },
      { titre: 'Investisseur qui compare les SCPI du groupe Amundi', description: 'Un investisseur compare Edissimo et Rivoli Avenir Patrimoine pour évaluer la complémentarité et la cohérence de l\'allocation.' }
    ],
    faq: [
      { question: 'Le secteur éducatif des SCPI est-il résilient ?', reponse: 'L\'immobilier éducatif (crèches, écoles) est généralement considéré comme résilient car les besoins éducatifs sont peu sensibles aux cycles économiques. La qualité des exploitants et la durée des baux restent des critères clés.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Sociétés de gestion SCPI', url: '/societes-de-gestion-scpi/' },
      { label: 'AMF SCPI', url: '/amf-scpi/' },
      { label: 'ORIAS SCPI', url: '/orias-scpi/' },
      { label: 'Documents réglementaires SCPI', url: '/documents-reglementaires-scpi/' },
      { label: 'DIC SCPI', url: '/dic-scpi/' },
      { label: 'Note d\'information SCPI', url: '/note-information-scpi/' },
      { label: 'Choisir une SCPI', url: '/choisir-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' },
      { label: 'Frais SCPI', url: '/frais-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Rendement net SCPI', url: '/rendement-net-scpi/' },
      { label: 'TOF SCPI', url: '/tof-scpi/' },
      { label: 'Capitalisation SCPI', url: '/capitalisation-scpi/' },
      { label: 'Endettement SCPI', url: '/endettement-scpi/' }
    ],
    angle: 'Société de gestion du groupe Amundi (Crédit Agricole), SCPI Edissimo (éducation) et Rivoli Avenir Patrimoine à analyser.'
  },
  {
    slug: 'la-francaise-rem',
    name: 'La Française REM',
    displayName: 'La Française REM',
    title: 'La Française REM : SCPI gérées, stratégie et gamme étendue',
    seoTitle: 'La Française REM SCPI : société de gestion, LF Europimmo, Opportunité Immo | MaximusSCPI',
    metaDescription: 'Analyse de La Française REM, société de gestion immobilière. SCPI LF Europimmo, LF Avenir Santé, LF Grand Paris Patrimoine, Opportunité Immo, Épargne Foncière — indicateurs.',
    mainKeyword: 'La Française REM société de gestion SCPI',
    keywords: ['La Française REM', 'LF Europimmo', 'LF Avenir Santé', 'LF Grand Paris Patrimoine', 'Opportunité Immo', 'Épargne Foncière', 'Selectinvest 1', 'Crédit Mutuel Pierre 1', 'société de gestion SCPI', 'gestionnaire SCPI'],
    category: 'gestionnaires-acteurs',
    managedScpis: [
      { name: 'Crédit Mutuel Pierre 1', status: 'verified', sector: 'Diversifié France' },
      { name: 'LF Avenir Santé', status: 'verified', sector: 'Santé' },
      { name: 'LF Europimmo', status: 'verified', sector: 'Diversifié Europe' },
      { name: 'LF Grand Paris Patrimoine', status: 'verified', sector: 'Bureaux/Commerces Grand Paris' },
      { name: 'Opportunité Immo', status: 'verified', sector: 'Diversifié France' },
      { name: 'Selectinvest 1', status: 'verified', sector: 'Diversifié France' },
      { name: 'Épargne Foncière', status: 'verified', sector: 'Diversifié France' }
    ],
    summary: 'La Française REM est une société de gestion immobilière majeure, à analyser via la profondeur de sa gamme (7 SCPI identifiées), sa stratégie multi-secteurs, la diversification géographique et la qualité du reporting. Une société de gestion ne garantit ni le rendement, ni la liquidité, ni le capital.',
    keyPoints: [
      'Société de gestion immobilière importante, gamme de 7 SCPI',
      'Couverture multi-secteurs : santé, bureaux, commerces, diversification Europe',
      'LF Europimmo : diversification européenne',
      'LF Avenir Santé : exposition à l\'immobilier santé',
      'À analyser via : rendement, TOF, endettement, frais, transparence pour chaque SCPI'
    ],
    vigilancePoints: [
      { critere: 'Gamme étendue', importance: 'Chaque SCPI a sa propre stratégie et ses propres indicateurs', vigilance: 'Analyser chaque SCPI individuellement, ne pas se fier à la seule notoriété du gestionnaire' },
      { critere: 'Exposition santé', importance: 'LF Avenir Santé est exposé au secteur médical', vigilance: 'Analyser la qualité des exploitants et la durée des baux' },
      { critere: 'TOF', importance: 'Reflet de l\'occupation locative', vigilance: 'Surveiller l\'évolution trimestrielle pour chaque SCPI' },
      { critere: 'Transparence', importance: 'La qualité du reporting varie selon les SCPI', vigilance: 'Consulter les DIC, notes d\'information et rapports annuels disponibles' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui compare les SCPI de La Française REM', description: 'Un investisseur compare LF Europimmo (Europe), LF Avenir Santé (santé) et Opportunité Immo (France) selon son allocation souhaitée.' },
      { titre: 'Investisseur qui diversifie entre plusieurs SCPI du même gestionnaire', description: 'Un investisseur construit une allocation avec plusieurs SCPI de La Française REM en vérifiant la cohérence globale (secteurs, zones géographiques, risque de concentration).' }
    ],
    faq: [
      { question: 'La Française REM est-elle une société de gestion fiable ?', reponse: 'La Française REM est un acteur établi avec une gamme étendue. La fiabilité s\'analyse en croisant les indicateurs de chaque SCPI, la qualité du reporting et la transparence documentaire.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Sociétés de gestion SCPI', url: '/societes-de-gestion-scpi/' },
      { label: 'SCPI santé', url: '/scpi-sante/' },
      { label: 'AMF SCPI', url: '/amf-scpi/' },
      { label: 'Documents réglementaires SCPI', url: '/documents-reglementaires-scpi/' },
      { label: 'DIC SCPI', url: '/dic-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' },
      { label: 'Frais SCPI', url: '/frais-scpi/' },
      { label: 'Rendement net SCPI', url: '/rendement-net-scpi/' },
      { label: 'TOF SCPI', url: '/tof-scpi/' },
      { label: 'Capitalisation SCPI', url: '/capitalisation-scpi/' }
    ],
    angle: 'Société de gestion majeure, gamme étendue de 7 SCPI à analyser individuellement.'
  },
  {
    slug: 'praemia-reim',
    name: 'Praemia REIM',
    displayName: 'Praemia REIM',
    title: 'Praemia REIM : SCPI gérées, stratégie et analyse immobilière',
    seoTitle: 'Praemia REIM SCPI : société de gestion, Patrimmo Commerce, Praemia Hôtels Europe | MaximusSCPI',
    metaDescription: 'Analyse de Praemia REIM, société de gestion. SCPI Patrimmo Commerce, Patrimmo Croissance Impact, Praemia Hôtels Europe, Primovie — indicateurs et vigilance.',
    mainKeyword: 'Praemia REIM société de gestion SCPI',
    keywords: ['Praemia REIM', 'Patrimmo Commerce', 'Patrimmo Croissance Impact', 'Praemia Hôtels Europe', 'Primovie', 'société de gestion SCPI', 'gestionnaire SCPI'],
    category: 'gestionnaires-acteurs',
    managedScpis: [
      { name: 'Patrimmo Commerce', status: 'verified', sector: 'Commerces' },
      { name: 'Patrimmo Croissance Impact', status: 'verified', sector: 'Diversifié' },
      { name: 'Praemia Hôtels Europe', status: 'verified', sector: 'Hôtellerie Europe' },
      { name: 'Primovie', status: 'verified', sector: 'Diversifié France' }
    ],
    summary: 'Praemia REIM est une société de gestion structurante, à analyser via sa gamme de 4 SCPI (Patrimmo Commerce, Patrimmo Croissance Impact, Praemia Hôtels Europe, Primovie). L\'analyse porte sur la diversification sectorielle et géographique, les indicateurs de performance et la qualité du reporting.',
    keyPoints: [
      'Gamme de 4 SCPI couvrant plusieurs segments',
      'Patrimmo Commerce : immobilier commercial',
      'Praemia Hôtels Europe : exposition hôtelière européenne',
      'Primovie : diversification France',
      'Patrimmo Croissance Impact : stratégie à impact'
    ],
    vigilancePoints: [
      { critere: 'Exposition hôtelière', importance: 'Praemia Hôtels Europe est exposé au secteur hôtelier, cyclique', vigilance: 'Analyser la résilience du secteur et la qualité des enseignes exploitées' },
      { critere: 'Exposition commerce', importance: 'Patrimmo Commerce est exposé au retail', vigilance: 'Évaluer l\'impact du e-commerce et la qualité des emplacements' },
      { critere: 'TOF', importance: 'Reflet de l\'occupation locative', vigilance: 'Surveiller l\'évolution trimestrielle pour chaque SCPI' },
      { critere: 'Endettement', importance: 'Impact sur la résilience', vigilance: 'Vérifier le ratio d\'endettement consolidé' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui compare les SCPI Praemia REIM', description: 'Un investisseur compare Patrimmo Commerce, Praemia Hôtels Europe et Primovie selon son exposition sectorielle et géographique souhaitée.' },
      { titre: 'Investisseur qui analyse l\'exposition hôtelière', description: 'Un investisseur analyse Praemia Hôtels Europe : saisonnalité, qualité des exploitants, localisation des actifs, résilience post-crise.' }
    ],
    faq: [
      { question: 'Le secteur hôtelier en SCPI est-il risqué ?', reponse: 'L\'hôtellerie est un secteur cyclique, plus sensible aux crises économiques que d\'autres secteurs (bureaux, santé). Il est important d\'analyser la qualité des exploitants, la localisation et la diversification.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Sociétés de gestion SCPI', url: '/societes-de-gestion-scpi/' },
      { label: 'SCPI commerce', url: '/scpi-commerce/' },
      { label: 'AMF SCPI', url: '/amf-scpi/' },
      { label: 'DIC SCPI', url: '/dic-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' },
      { label: 'Frais SCPI', url: '/frais-scpi/' },
      { label: 'Rendement net SCPI', url: '/rendement-net-scpi/' },
      { label: 'TOF SCPI', url: '/tof-scpi/' },
      { label: 'Capitalisation SCPI', url: '/capitalisation-scpi/' },
      { label: 'Endettement SCPI', url: '/endettement-scpi/' }
    ],
    angle: 'Société structurante, gamme de 4 SCPI, diversification sectorielle, indicateurs à analyser.'
  },
  {
    slug: 'aew',
    name: 'AEW',
    displayName: 'AEW',
    title: 'AEW : société de gestion immobilière européenne',
    seoTitle: 'AEW SCPI : société de gestion immobilière européenne | MaximusSCPI',
    metaDescription: 'Analyse de AEW, société de gestion immobilière européenne de premier plan. SCPI associées à vérifier — données à confirmer auprès des sources officielles.',
    mainKeyword: 'AEW société de gestion SCPI',
    keywords: ['AEW', 'société de gestion SCPI', 'immobilier européen', 'gestionnaire SCPI', 'AMF', 'documents réglementaires'],
    category: 'gestionnaires-acteurs',
    managedScpis: [],
    summary: 'AEW est une société de gestion immobilière internationale, acteur majeur de l\'immobilier tertiaire en Europe, à analyser avec prudence. Les SCPI associées à AEW sont à vérifier dans les documents réglementaires (ASPIM, AMF/GECO, DIC, site officiel de la société de gestion). Aucune SCPI n\'a été identifiée dans le référentiel interne à ce stade.',
    keyPoints: [
      'Acteur majeur de l\'immobilier tertiaire en Europe',
      'Présence internationale significative',
      'SCPI associées non identifiées dans les données internes',
      'Données à vérifier : ASPIM, AMF/GECO, site officiel',
      'Points de vigilance : transparence, documentation, vérification des SCPI gérées'
    ],
    vigilancePoints: [
      { critere: 'Association SCPI ↔ société de gestion', importance: 'Aucune SCPI associée identifiée dans les données internes', vigilance: 'Donnée à vérifier — consulter l\'ASPIM, l\'AMF/GECO et le site officiel' },
      { critere: 'Transparence documentaire', importance: 'Vérifier la disponibilité des documents réglementaires', vigilance: 'Rechercher les DIC, notes d\'information et rapports annuels des SCPI gérées' },
      { critere: 'Présence internationale', importance: 'Exposition à plusieurs pays et devises', vigilance: 'Analyser les risques de change et la diversification géographique' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui recherche les SCPI gérées par AEW', description: 'Un investisseur consulte l\'ASPIM et le site officiel d\'AEW pour identifier les SCPI gérées avant toute analyse complémentaire.' },
      { titre: 'Investisseur qui compare AEW à d\'autres gestionnaires européens', description: 'Un investisseur compare le positionnement d\'AEW (immobilier tertiaire européen) avec Corum AM ou La Française REM sur les SCPI européennes.' }
    ],
    faq: [
      { question: 'Quelles SCPI sont gérées par AEW ?', reponse: 'Les SCPI gérées par AEW sont à vérifier auprès des sources officielles : ASPIM, AMF/GECO, site de la société de gestion. Les données internes ne contiennent pas cette information à ce stade.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Sociétés de gestion SCPI', url: '/societes-de-gestion-scpi/' },
      { label: 'AMF SCPI', url: '/amf-scpi/' },
      { label: 'Documents réglementaires SCPI', url: '/documents-reglementaires-scpi/' },
      { label: 'DIC SCPI', url: '/dic-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' },
      { label: 'SCPI européennes', url: '/scpi-europeennes/' }
    ],
    angle: 'Acteur majeur de l\'immobilier tertiaire européen, SCPI associées à vérifier.'
  },
  {
    slug: 'perial-asset-management',
    name: 'Perial Asset Management',
    displayName: 'Perial Asset Management',
    title: 'Perial Asset Management : SCPI gérées et stratégie patrimoniale',
    seoTitle: 'Perial Asset Management SCPI : société de gestion, Perial Grand Paris | MaximusSCPI',
    metaDescription: 'Analyse de Perial Asset Management, société de gestion. SCPI Perial Grand Paris, Perial O2, Perial Hospitalité Europe, Perial Opportunités Europe — indicateurs.',
    mainKeyword: 'Perial Asset Management société de gestion SCPI',
    keywords: ['Perial Asset Management', 'Perial Grand Paris', 'Perial O2', 'Perial Hospitalité Europe', 'Perial Opportunités Europe', 'société de gestion SCPI', 'gestionnaire SCPI'],
    category: 'gestionnaires-acteurs',
    managedScpis: [
      { name: 'Perial Grand Paris', status: 'verified', sector: 'Bureaux/Commerces Grand Paris' },
      { name: 'Perial Hospitalité Europe', status: 'verified', sector: 'Hôtellerie Europe' },
      { name: 'Perial O2', status: 'verified', sector: 'Diversifié France' },
      { name: 'Perial Opportunités Europe', status: 'verified', sector: 'Diversifié Europe' }
    ],
    summary: 'Perial Asset Management est une société de gestion à analyser via sa gamme de 4 SCPI (Perial Grand Paris, Perial O2, Perial Hospitalité Europe, Perial Opportunités Europe). L\'analyse porte sur la diversification, la stratégie d\'investissement et les indicateurs de performance.',
    keyPoints: [
      'Gamme de 4 SCPI couvrant plusieurs segments',
      'Perial Grand Paris : exposition au marché francilien',
      'Perial Hospitalité Europe : diversification hôtelière européenne',
      'Perial O2 et Perial Opportunités Europe : diversification',
      'À analyser via : rendement, TOF, endettement, frais, transparence'
    ],
    vigilancePoints: [
      { critere: 'Exposition Grand Paris', importance: 'Perial Grand Paris est concentré sur la région parisienne', vigilance: 'Analyser la diversification au sein du patrimoine francilien' },
      { critere: 'Exposition hôtelière', importance: 'Perial Hospitalité Europe est exposé à l\'hôtellerie', vigilance: 'Évaluer la résilience sectorielle et la qualité des exploitants' },
      { critere: 'TOF', importance: 'Reflet de l\'occupation locative', vigilance: 'Surveiller l\'évolution trimestrielle pour chaque SCPI' },
      { critere: 'Frais', importance: 'Impact sur le rendement net', vigilance: 'Comparer les frais de souscription et de gestion avec le marché' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui compare les SCPI Perial', description: 'Un investisseur compare Perial Grand Paris, Perial O2 et Perial Hospitalité Europe selon son exposition géographique et sectorielle souhaitée.' },
      { titre: 'Investisseur qui analyse l\'exposition francilienne', description: 'Un investisseur déjà exposé à l\'immobilier francilien en direct analyse si Perial Grand Paris apporte une diversification ou une concentration du risque.' }
    ],
    faq: [
      { question: 'Perial Asset Management est-elle une société de gestion diversifiée ?', reponse: 'Perial Asset Management propose une gamme diversifiée couvrant la France et l\'Europe, avec des expositions sectorielles variées. Chaque SCPI doit être analysée individuellement.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Sociétés de gestion SCPI', url: '/societes-de-gestion-scpi/' },
      { label: 'AMF SCPI', url: '/amf-scpi/' },
      { label: 'DIC SCPI', url: '/dic-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' },
      { label: 'Frais SCPI', url: '/frais-scpi/' },
      { label: 'Rendement net SCPI', url: '/rendement-net-scpi/' },
      { label: 'TOF SCPI', url: '/tof-scpi/' },
      { label: 'Capitalisation SCPI', url: '/capitalisation-scpi/' },
      { label: 'Endettement SCPI', url: '/endettement-scpi/' }
    ],
    angle: 'Société de gestion à analyser via sa gamme de 4 SCPI, diversification, indicateurs et transparence.'
  },
  {
    slug: 'swiss-life-asset-managers-france',
    name: 'Swiss Life Asset Managers France',
    displayName: 'Swiss Life Asset Managers France',
    title: 'Swiss Life Asset Managers France : SCPI gérées et analyse',
    seoTitle: 'Swiss Life Asset Managers France SCPI : société de gestion, ESG Pierre Capital | MaximusSCPI',
    metaDescription: 'Analyse de Swiss Life Asset Managers France, société de gestion. SCPI ESG Pierre Capital, stratégie ESG, indicateurs et points de vigilance.',
    mainKeyword: 'Swiss Life Asset Managers France société de gestion SCPI',
    keywords: ['Swiss Life Asset Managers France', 'ESG Pierre Capital', 'société de gestion SCPI', 'SCPI ESG', 'gestionnaire SCPI', 'assureur SCPI'],
    category: 'gestionnaires-acteurs',
    managedScpis: [
      { name: 'ESG Pierre Capital', status: 'verified', sector: 'Diversifié France' }
    ],
    summary: 'Swiss Life Asset Managers France est la société de gestion immobilière du groupe Swiss Life en France, à analyser via la SCPI ESG Pierre Capital et sa stratégie responsable. L\'analyse porte sur les critères ESG, la diversification, les indicateurs de performance et la transparence.',
    keyPoints: [
      'Société de gestion du groupe d\'assurance Swiss Life',
      'ESG Pierre Capital : SCPI intégrant des critères ESG',
      'Stratégie immobilière responsable',
      'À analyser via : capitalisation, TOF, endettement, frais, rendement, transparence'
    ],
    vigilancePoints: [
      { critere: 'Intégration ESG', importance: 'Les critères ESG peuvent structurer la stratégie d\'investissement', vigilance: 'Vérifier la définition des critères ESG et leur impact sur la sélection des actifs' },
      { critere: 'Taille du véhicule', importance: 'ESG Pierre Capital a une capitalisation à vérifier', vigilance: 'Consulter les bulletins trimestriels pour la capitalisation et la liquidité' },
      { critere: 'TOF', importance: 'Reflet de l\'occupation locative', vigilance: 'Surveiller l\'évolution trimestrielle' },
      { critere: 'Transparence', importance: 'Qualité du reporting ESG et financier', vigilance: 'Vérifier la disponibilité des rapports annuels et des DIC' }
    ],
    casPratiques: [
      { titre: 'Investisseur sensible aux critères ESG', description: 'Un investisseur analyse ESG Pierre Capital pour son intégration de critères environnementaux, sociaux et de gouvernance dans la sélection des actifs.' },
      { titre: 'Investisseur qui compare les SCPI d\'assureurs', description: 'Un investisseur compare ESG Pierre Capital (Swiss Life) avec d\'autres SCPI gérées par des assureurs (Groupama Gan REIM, Allianz Immovalor).' }
    ],
    faq: [
      { question: 'Les critères ESG garantissent-ils une meilleure performance ?', reponse: 'Non, les critères ESG ne garantissent pas une performance supérieure. Ils peuvent orienter la sélection des actifs et réduire certains risques mais n\'assurent pas le rendement.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Sociétés de gestion SCPI', url: '/societes-de-gestion-scpi/' },
      { label: 'AMF SCPI', url: '/amf-scpi/' },
      { label: 'Documents réglementaires SCPI', url: '/documents-reglementaires-scpi/' },
      { label: 'DIC SCPI', url: '/dic-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' },
      { label: 'Frais SCPI', url: '/frais-scpi/' },
      { label: 'Rendement net SCPI', url: '/rendement-net-scpi/' },
      { label: 'TOF SCPI', url: '/tof-scpi/' },
      { label: 'Capitalisation SCPI', url: '/capitalisation-scpi/' }
    ],
    angle: 'Société de gestion du groupe Swiss Life, SCPI ESG Pierre Capital à analyser via critères ESG et indicateurs.'
  },
  {
    slug: 'euryale-am',
    name: 'Euryale AM',
    displayName: 'Euryale AM',
    title: 'Euryale AM : SCPI gérées, stratégie santé et analyse',
    seoTitle: 'Euryale AM SCPI : société de gestion, Pierval Santé | MaximusSCPI',
    metaDescription: 'Analyse de Euryale AM, société de gestion. SCPI Pierval Santé, stratégie immobilière santé, indicateurs et points de vigilance.',
    mainKeyword: 'Euryale AM société de gestion SCPI',
    keywords: ['Euryale AM', 'Pierval Santé', 'société de gestion SCPI', 'SCPI santé', 'gestionnaire SCPI', 'immobilier médical'],
    category: 'gestionnaires-acteurs',
    managedScpis: [
      { name: 'Pierval Santé', status: 'verified', sector: 'Santé' }
    ],
    summary: 'Euryale AM est une société de gestion à analyser via la SCPI Pierval Santé (immobilier médical). L\'analyse porte sur la stratégie santé, la qualité du patrimoine, les indicateurs de performance et la transparence documentaire.',
    keyPoints: [
      'Société de gestion spécialisée, SCPI Pierval Santé',
      'Exposition à l\'immobilier médical et paramédical',
      'Secteur santé : résilience potentielle mais dépendance aux exploitants',
      'À analyser via : capitalisation, TOF, endettement, frais, rendement, transparence'
    ],
    vigilancePoints: [
      { critere: 'Spécialisation santé', importance: 'Pierval Santé est concentré sur le secteur médical', vigilance: 'Analyser la dépendance aux exploitants, la durée des baux et la réglementation sanitaire' },
      { critere: 'Taille du véhicule', importance: 'La capitalisation influence la liquidité', vigilance: 'Vérifier la capitalisation et le nombre d\'associés dans le rapport annuel' },
      { critere: 'TOF', importance: 'Reflet de l\'occupation locative', vigilance: 'Surveiller l\'évolution trimestrielle' },
      { critere: 'Frais', importance: 'Impact sur le rendement net', vigilance: 'Comparer les frais avec le marché des SCPI santé' }
    ],
    casPratiques: [
      { titre: 'Investisseur intéressé par l\'immobilier santé', description: 'Un investisseur analyse Pierval Santé d\'Euryale AM : qualité des établissements de santé, solidité des exploitants, résilience du secteur.' },
      { titre: 'Investisseur qui compare les SCPI santé', description: 'Un investisseur compare Pierval Santé avec LF Avenir Santé (La Française REM) et NCap Education Santé (Norma Capital) pour évaluer le positionnement.' }
    ],
    faq: [
      { question: 'L\'immobilier santé est-il un secteur résilient ?', reponse: 'L\'immobilier santé est généralement considéré comme défensif car les besoins de santé sont peu sensibles aux cycles économiques. La résilience dépend de la qualité des exploitants, de la durée des baux et de la diversification au sein du secteur.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Sociétés de gestion SCPI', url: '/societes-de-gestion-scpi/' },
      { label: 'SCPI santé', url: '/scpi-sante/' },
      { label: 'AMF SCPI', url: '/amf-scpi/' },
      { label: 'DIC SCPI', url: '/dic-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' },
      { label: 'Frais SCPI', url: '/frais-scpi/' },
      { label: 'Rendement net SCPI', url: '/rendement-net-scpi/' },
      { label: 'TOF SCPI', url: '/tof-scpi/' },
      { label: 'Capitalisation SCPI', url: '/capitalisation-scpi/' }
    ],
    angle: 'Société de gestion spécialisée, SCPI Pierval Santé (immobilier médical) à analyser.'
  },
  {
    slug: 'advenis-reim',
    name: 'Advenis REIM',
    displayName: 'Advenis REIM',
    title: 'Advenis REIM : SCPI gérées, stratégie et points de vigilance',
    seoTitle: 'Advenis REIM SCPI : société de gestion | MaximusSCPI',
    metaDescription: 'Analyse de Advenis REIM, société de gestion de diversification. SCPI associées à vérifier — données à confirmer auprès des sources officielles.',
    mainKeyword: 'Advenis REIM société de gestion SCPI',
    keywords: ['Advenis REIM', 'société de gestion SCPI', 'gestionnaire SCPI', 'AMF', 'documents réglementaires'],
    category: 'gestionnaires-acteurs',
    managedScpis: [],
    summary: 'Advenis REIM est une société de gestion à analyser avec prudence. Les SCPI associées à Advenis REIM sont à vérifier dans les documents réglementaires (ASPIM, AMF/GECO, DIC, site officiel de la société de gestion). Aucune SCPI n\'a été identifiée dans le référentiel interne à ce stade.',
    keyPoints: [
      'Société de gestion de diversification',
      'SCPI associées non identifiées dans les données internes',
      'Données à vérifier : ASPIM, AMF/GECO, site officiel',
      'Points de vigilance : transparence, documentation, vérification des SCPI gérées'
    ],
    vigilancePoints: [
      { critere: 'Association SCPI ↔ société de gestion', importance: 'Aucune SCPI associée identifiée dans les données internes', vigilance: 'Donnée à vérifier — consulter l\'ASPIM, l\'AMF/GECO et le site officiel' },
      { critere: 'Transparence documentaire', importance: 'Vérifier la disponibilité des documents réglementaires', vigilance: 'Rechercher les DIC, notes d\'information et rapports annuels' },
      { critere: 'Historique de gestion', importance: 'Évaluer l\'ancienneté et l\'expérience', vigilance: 'Consulter les sources officielles pour connaître l\'historique' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui recherche les SCPI gérées par Advenis REIM', description: 'Un investisseur consulte l\'ASPIM et le site officiel d\'Advenis REIM pour identifier les SCPI gérées avant toute analyse complémentaire.' }
    ],
    faq: [
      { question: 'Quelles SCPI sont gérées par Advenis REIM ?', reponse: 'Les SCPI gérées par Advenis REIM sont à vérifier auprès des sources officielles : ASPIM, AMF/GECO, site de la société de gestion.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Sociétés de gestion SCPI', url: '/societes-de-gestion-scpi/' },
      { label: 'AMF SCPI', url: '/amf-scpi/' },
      { label: 'Documents réglementaires SCPI', url: '/documents-reglementaires-scpi/' },
      { label: 'DIC SCPI', url: '/dic-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' }
    ],
    angle: 'Société de gestion à vérifier — SCPI associées non identifiées dans les données internes.'
  },
  {
    slug: 'altixia-reim',
    name: 'Altixia REIM',
    displayName: 'Altixia REIM',
    title: 'Altixia REIM : SCPI gérées, stratégie et analyse immobilière',
    seoTitle: 'Altixia REIM SCPI : société de gestion, Altixia Cadence 12 | MaximusSCPI',
    metaDescription: 'Analyse de Altixia REIM, société de gestion. SCPI Altixia Cadence 12, Altixia Commerces, stratégie, indicateurs et points de vigilance.',
    mainKeyword: 'Altixia REIM société de gestion SCPI',
    keywords: ['Altixia REIM', 'Altixia Cadence 12', 'Altixia Commerces', 'société de gestion SCPI', 'gestionnaire SCPI'],
    category: 'gestionnaires-acteurs',
    managedScpis: [
      { name: 'Altixia Cadence 12', status: 'verified', sector: 'Diversifié France' },
      { name: 'Altixia Commerces', status: 'verified', sector: 'Commerces' }
    ],
    summary: 'Altixia REIM est une société de gestion à analyser via ses SCPI Altixia Cadence 12 (diversification France) et Altixia Commerces (immobilier commercial). L\'analyse porte sur la diversification, la stratégie, les indicateurs de performance et la transparence.',
    keyPoints: [
      'Gamme de 2 SCPI : Altixia Cadence 12 et Altixia Commerces',
      'Altixia Commerces : exposition au secteur commercial',
      'Altixia Cadence 12 : diversification France',
      'Points de vigilance : exposition commerce, taille des véhicules, TOF'
    ],
    vigilancePoints: [
      { critere: 'Exposition commerce', importance: 'Altixia Commerces est exposé au retail', vigilance: 'Analyser l\'impact du e-commerce et la qualité des emplacements' },
      { critere: 'Taille des véhicules', importance: 'Des SCPI de taille modeste peuvent être moins liquides', vigilance: 'Vérifier la capitalisation dans les rapports annuels' },
      { critere: 'TOF', importance: 'Reflet de l\'occupation locative', vigilance: 'Surveiller l\'évolution trimestrielle pour chaque SCPI' },
      { critere: 'Frais', importance: 'Impact sur le rendement net', vigilance: 'Comparer les frais avec le marché' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui compare les SCPI Altixia REIM', description: 'Un investisseur compare Altixia Cadence 12 et Altixia Commerces selon son exposition sectorielle souhaitée.' },
      { titre: 'Investisseur qui analyse l\'exposition commerce', description: 'Un investisseur analyse la résilience d\'Altixia Commerces face à l\'évolution du commerce physique.' }
    ],
    faq: [
      { question: 'Altixia REIM est-elle une société de gestion récente ?', reponse: 'Altixia REIM est une société de gestion à analyser via ses SCPI et son historique. Il est recommandé de consulter les documents réglementaires pour évaluer son expérience.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Sociétés de gestion SCPI', url: '/societes-de-gestion-scpi/' },
      { label: 'SCPI commerce', url: '/scpi-commerce/' },
      { label: 'AMF SCPI', url: '/amf-scpi/' },
      { label: 'DIC SCPI', url: '/dic-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' },
      { label: 'Frais SCPI', url: '/frais-scpi/' },
      { label: 'Rendement net SCPI', url: '/rendement-net-scpi/' },
      { label: 'TOF SCPI', url: '/tof-scpi/' },
      { label: 'Capitalisation SCPI', url: '/capitalisation-scpi/' }
    ],
    angle: 'Société de gestion à analyser via ses SCPI, diversification et exposition commerce.'
  },
  // ============================================================
  // Batch 3 — Sociétés complémentaires
  // ============================================================
  {
    slug: 'aestiam',
    name: 'Aestiam',
    displayName: 'Aestiam',
    title: 'Aestiam : SCPI gérées, gamme patrimoniale et analyse',
    seoTitle: 'Aestiam SCPI : société de gestion, Aestiam Agora, Aestiam Pierre Rendement | MaximusSCPI',
    metaDescription: 'Analyse de Aestiam, société de gestion. SCPI Aestiam Agora, Aestiam Cap\'Hebergimmo, Aestiam Horizon, Aestiam Pierre Rendement — indicateurs.',
    mainKeyword: 'Aestiam société de gestion SCPI',
    keywords: ['Aestiam', 'Aestiam Agora', 'Aestiam Cap\'Hebergimmo', 'Aestiam Horizon', 'Aestiam Pierre Rendement', 'société de gestion SCPI', 'gestionnaire SCPI'],
    category: 'gestionnaires-acteurs',
    managedScpis: [
      { name: 'Aestiam Agora', status: 'verified', sector: 'Diversifié France' },
      { name: 'Aestiam Cap\'Hebergimmo', status: 'verified', sector: 'Diversifié' },
      { name: 'Aestiam Horizon', status: 'verified', sector: 'Diversifié France' },
      { name: 'Aestiam Pierre Rendement', status: 'verified', sector: 'Diversifié France' }
    ],
    summary: 'Aestiam est une société de gestion à analyser via sa gamme de 4 SCPI (Aestiam Agora, Aestiam Cap\'Hebergimmo, Aestiam Horizon, Aestiam Pierre Rendement). L\'analyse porte sur la diversification, les indicateurs de performance et la transparence documentaire.',
    keyPoints: [
      'Gamme de 4 SCPI multi-segments',
      'Aestiam Pierre Rendement : SCPI de rendement diversifiée',
      'Aestiam Horizon : diversification France',
      'Aestiam Cap\'Hebergimmo : diversification',
      'À analyser via : capitalisation, TOF, endettement, frais, rendement'
    ],
    vigilancePoints: [
      { critere: 'Gamme étendue', importance: 'Plusieurs SCPI à analyser individuellement', vigilance: 'Ne pas se fier à la seule marque Aestiam — chaque SCPI a ses propres indicateurs' },
      { critere: 'Taille des véhicules', importance: 'Des SCPI de taille modeste peuvent être moins liquides', vigilance: 'Vérifier la capitalisation de chaque SCPI dans les rapports annuels' },
      { critere: 'TOF', importance: 'Reflet de l\'occupation locative', vigilance: 'Surveiller l\'évolution trimestrielle pour chaque SCPI' },
      { critere: 'Frais', importance: 'Impact sur le rendement net', vigilance: 'Comparer les frais avec le marché' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui compare les SCPI Aestiam', description: 'Un investisseur compare Aestiam Agora, Aestiam Pierre Rendement et Aestiam Horizon selon son profil et ses objectifs.' },
      { titre: 'Investisseur qui analyse la gamme Aestiam', description: 'Un investisseur évalue la cohérence de la gamme Aestiam et la complémentarité entre les différents véhicules.' }
    ],
    faq: [
      { question: 'Peut-on investir dans plusieurs SCPI Aestiam ?', reponse: 'Oui, il est possible de diversifier entre les SCPI de la gamme Aestiam, à condition d\'analyser la cohérence globale de l\'allocation et d\'éviter la concentration.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Sociétés de gestion SCPI', url: '/societes-de-gestion-scpi/' },
      { label: 'AMF SCPI', url: '/amf-scpi/' },
      { label: 'DIC SCPI', url: '/dic-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' },
      { label: 'Frais SCPI', url: '/frais-scpi/' },
      { label: 'Rendement net SCPI', url: '/rendement-net-scpi/' },
      { label: 'TOF SCPI', url: '/tof-scpi/' },
      { label: 'Capitalisation SCPI', url: '/capitalisation-scpi/' }
    ],
    angle: 'Société de gestion à analyser via sa gamme de 4 SCPI, diversification et transparence.'
  },
  {
    slug: 'allianz-immovalor',
    name: 'Allianz Immovalor',
    displayName: 'Allianz Immovalor',
    title: 'Allianz Immovalor : SCPI gérées, stratégie et analyse',
    seoTitle: 'Allianz Immovalor SCPI : société de gestion | MaximusSCPI',
    metaDescription: 'Analyse de Allianz Immovalor, société de gestion du groupe Allianz. SCPI associées à vérifier — données à confirmer auprès des sources officielles.',
    mainKeyword: 'Allianz Immovalor société de gestion SCPI',
    keywords: ['Allianz Immovalor', 'société de gestion SCPI', 'groupe Allianz', 'assureur SCPI', 'gestionnaire SCPI', 'AMF'],
    category: 'gestionnaires-acteurs',
    managedScpis: [],
    summary: 'Allianz Immovalor est la société de gestion immobilière du groupe Allianz en France, à analyser avec prudence. Les SCPI associées à Allianz Immovalor sont à vérifier dans les documents réglementaires (ASPIM, AMF/GECO, DIC, site officiel de la société de gestion). Aucune SCPI n\'a été identifiée dans le référentiel interne à ce stade.',
    keyPoints: [
      'Société de gestion du groupe d\'assurance Allianz',
      'SCPI associées non identifiées dans les données internes',
      'Données à vérifier : ASPIM, AMF/GECO, site officiel',
      'Points de vigilance : transparence, documentation, vérification des SCPI gérées'
    ],
    vigilancePoints: [
      { critere: 'Association SCPI ↔ société de gestion', importance: 'Aucune SCPI associée identifiée dans les données internes', vigilance: 'Donnée à vérifier — consulter l\'ASPIM, l\'AMF/GECO et le site officiel' },
      { critere: 'Transparence documentaire', importance: 'Vérifier la disponibilité des documents réglementaires', vigilance: 'Rechercher les DIC, notes d\'information et rapports annuels' },
      { critere: 'Solidité du groupe', importance: 'Le groupe Allianz est un assureur de premier plan', vigilance: 'La solidité du groupe ne préjuge pas de la performance des SCPI gérées' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui recherche les SCPI gérées par Allianz Immovalor', description: 'Un investisseur consulte l\'ASPIM et le site officiel d\'Allianz Immovalor pour identifier les SCPI gérées avant toute analyse complémentaire.' }
    ],
    faq: [
      { question: 'Quelles SCPI sont gérées par Allianz Immovalor ?', reponse: 'Les SCPI gérées par Allianz Immovalor sont à vérifier auprès des sources officielles : ASPIM, AMF/GECO, site de la société de gestion.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Sociétés de gestion SCPI', url: '/societes-de-gestion-scpi/' },
      { label: 'AMF SCPI', url: '/amf-scpi/' },
      { label: 'Documents réglementaires SCPI', url: '/documents-reglementaires-scpi/' },
      { label: 'DIC SCPI', url: '/dic-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' }
    ],
    angle: 'Société de gestion du groupe Allianz, SCPI associées à vérifier dans les documents réglementaires.'
  },
  {
    slug: 'atream',
    name: 'Atream',
    displayName: 'Atream',
    title: 'Atream : SCPI Atream Hotel, stratégie hôtelière et analyse',
    seoTitle: 'Atream SCPI : société de gestion, Atream Hotel | MaximusSCPI',
    metaDescription: 'Analyse de Atream, société de gestion. SCPI Atream Hotel, stratégie hôtelière, indicateurs et points de vigilance.',
    mainKeyword: 'Atream société de gestion SCPI',
    keywords: ['Atream', 'Atream Hotel', 'société de gestion SCPI', 'SCPI hôtelière', 'gestionnaire SCPI', 'immobilier hôtelier'],
    category: 'gestionnaires-acteurs',
    managedScpis: [
      { name: 'Atream Hotel', status: 'verified', sector: 'Hôtellerie' }
    ],
    summary: 'Atream est une société de gestion à analyser via la SCPI Atream Hotel, spécialisée dans l\'immobilier hôtelier. L\'analyse porte sur la stratégie hôtelière, la qualité des exploitants, la localisation des actifs et les indicateurs de performance.',
    keyPoints: [
      'Société de gestion spécialisée, SCPI Atream Hotel',
      'Exposition au secteur hôtelier',
      'Segments hôteliers à analyser : économiques, milieu de gamme, haut de gamme',
      'Points de vigilance : cyclicité du secteur, saisonnalité, dépendance aux exploitants'
    ],
    vigilancePoints: [
      { critere: 'Exposition hôtelière', importance: 'L\'hôtellerie est un secteur cyclique', vigilance: 'Analyser la résilience du secteur et la qualité des enseignes exploitées' },
      { critere: 'Dépendance aux exploitants', importance: 'La qualité de l\'exploitation impacte directement les revenus', vigilance: 'Vérifier la solidité des chaînes hôtelières et la durée des baux' },
      { critere: 'TOF', importance: 'Reflet de l\'occupation locative', vigilance: 'Surveiller l\'évolution trimestrielle' },
      { critere: 'Saisonnalité', importance: 'Les revenus hôteliers peuvent varier selon les saisons', vigilance: 'Analyser les variations saisonnières et leur impact sur les distributions' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui analyse une SCPI hôtelière', description: 'Un investisseur analyse Atream Hotel : qualité des enseignes, localisation, saisonnalité, résilience du secteur hôtelier.' },
      { titre: 'Investisseur qui compare Atream à Praemia Hôtels Europe', description: 'Un investisseur compare Atream Hotel (France ou Europe) avec Praemia Hôtels Europe pour évaluer le positionnement et la diversification.' }
    ],
    faq: [
      { question: 'L\'hôtellerie en SCPI est-elle plus risquée ?', reponse: 'L\'hôtellerie est un secteur cyclique qui peut offrir des rendements attractifs mais avec une volatilité plus élevée. L\'analyse de la qualité des exploitants et de la localisation est primordiale.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Sociétés de gestion SCPI', url: '/societes-de-gestion-scpi/' },
      { label: 'AMF SCPI', url: '/amf-scpi/' },
      { label: 'DIC SCPI', url: '/dic-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' },
      { label: 'Frais SCPI', url: '/frais-scpi/' },
      { label: 'Rendement net SCPI', url: '/rendement-net-scpi/' },
      { label: 'TOF SCPI', url: '/tof-scpi/' }
    ],
    angle: 'Société de gestion spécialisée en immobilier hôtelier, SCPI Atream Hotel à analyser.'
  },
  {
    slug: 'axipit-real-estate-partners',
    name: 'Axipit Real Estate Partners',
    displayName: 'Axipit Real Estate Partners',
    title: 'Axipit Real Estate Partners : SCPI gérées et analyse',
    seoTitle: 'Axipit Real Estate Partners SCPI : société de gestion | MaximusSCPI',
    metaDescription: 'Analyse de Axipit Real Estate Partners, société de gestion. SCPI associées à vérifier — données à confirmer auprès des sources officielles.',
    mainKeyword: 'Axipit Real Estate Partners société de gestion SCPI',
    keywords: ['Axipit Real Estate Partners', 'société de gestion SCPI', 'gestionnaire SCPI', 'AMF', 'documents réglementaires'],
    category: 'gestionnaires-acteurs',
    managedScpis: [],
    summary: 'Axipit Real Estate Partners est une société de gestion à analyser avec prudence. Les SCPI associées à Axipit Real Estate Partners sont à vérifier dans les documents réglementaires (ASPIM, AMF/GECO, DIC, site officiel de la société de gestion). Aucune SCPI n\'a été identifiée dans le référentiel interne à ce stade.',
    keyPoints: [
      'Société de gestion à vérifier',
      'SCPI associées non identifiées dans les données internes',
      'Données à vérifier : ASPIM, AMF/GECO, site officiel',
      'Points de vigilance : transparence, documentation, vérification des SCPI gérées'
    ],
    vigilancePoints: [
      { critere: 'Association SCPI ↔ société de gestion', importance: 'Aucune SCPI associée identifiée dans les données internes', vigilance: 'Donnée à vérifier — consulter l\'ASPIM, l\'AMF/GECO et le site officiel' },
      { critere: 'Transparence documentaire', importance: 'Vérifier la disponibilité des documents réglementaires', vigilance: 'Rechercher les DIC, notes d\'information et rapports annuels' },
      { critere: 'Historique de gestion', importance: 'Évaluer l\'ancienneté et l\'expérience', vigilance: 'Consulter les sources officielles pour connaître l\'historique' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui recherche les SCPI gérées par Axipit', description: 'Un investisseur consulte l\'ASPIM et le site officiel d\'Axipit Real Estate Partners pour identifier les SCPI gérées.' }
    ],
    faq: [
      { question: 'Quelles SCPI sont gérées par Axipit Real Estate Partners ?', reponse: 'Les SCPI gérées par Axipit Real Estate Partners sont à vérifier auprès des sources officielles : ASPIM, AMF/GECO, site de la société de gestion.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Sociétés de gestion SCPI', url: '/societes-de-gestion-scpi/' },
      { label: 'AMF SCPI', url: '/amf-scpi/' },
      { label: 'Documents réglementaires SCPI', url: '/documents-reglementaires-scpi/' },
      { label: 'DIC SCPI', url: '/dic-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' }
    ],
    angle: 'Société de gestion à vérifier — SCPI associées non identifiées dans les données internes.'
  },
  {
    slug: 'consultim-am',
    name: 'Consultim AM',
    displayName: 'Consultim AM',
    title: 'Consultim AM : SCPI Optimale, stratégie et analyse',
    seoTitle: 'Consultim AM SCPI : société de gestion, Optimale | MaximusSCPI',
    metaDescription: 'Analyse de Consultim AM, société de gestion. SCPI Optimale, stratégie, indicateurs et points de vigilance.',
    mainKeyword: 'Consultim AM société de gestion SCPI',
    keywords: ['Consultim AM', 'Optimale', 'société de gestion SCPI', 'gestionnaire SCPI', 'immobilier'],
    category: 'gestionnaires-acteurs',
    managedScpis: [
      { name: 'Optimale', status: 'verified', sector: 'Diversifié France' }
    ],
    summary: 'Consultim AM est une société de gestion à analyser via la SCPI Optimale. L\'analyse porte sur la stratégie d\'investissement, la diversification, les indicateurs de performance et la transparence documentaire.',
    keyPoints: [
      'Société de gestion, SCPI Optimale',
      'Stratégie diversifiée France',
      'Points de vigilance : capitalisation, TOF, endettement, frais, rendement',
      'À analyser via les documents réglementaires disponibles'
    ],
    vigilancePoints: [
      { critere: 'Taille du véhicule', importance: 'Optimale a une capitalisation à vérifier', vigilance: 'Consulter les bulletins trimestriels pour la capitalisation et la liquidité' },
      { critere: 'TOF', importance: 'Reflet de l\'occupation locative', vigilance: 'Surveiller l\'évolution trimestrielle' },
      { critere: 'Frais', importance: 'Impact sur le rendement net', vigilance: 'Comparer les frais avec le marché' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui analyse la SCPI Optimale', description: 'Un investisseur analyse Optimale de Consultim AM : capitalisation, TOF, endettement, frais, rendement et transparence.' }
    ],
    faq: [
      { question: 'La SCPI Optimale est-elle accessible aux petits budgets ?', reponse: 'Le prix de souscription d\'Optimale est à vérifier dans le DIC. Certaines SCPI ont un prix de part accessible, d\'autres non.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Sociétés de gestion SCPI', url: '/societes-de-gestion-scpi/' },
      { label: 'AMF SCPI', url: '/amf-scpi/' },
      { label: 'DIC SCPI', url: '/dic-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' },
      { label: 'Frais SCPI', url: '/frais-scpi/' },
      { label: 'Rendement net SCPI', url: '/rendement-net-scpi/' },
      { label: 'TOF SCPI', url: '/tof-scpi/' },
      { label: 'Capitalisation SCPI', url: '/capitalisation-scpi/' }
    ],
    angle: 'Société de gestion à analyser via sa SCPI Optimale, indicateurs et transparence.'
  },
  {
    slug: 'darwin-invest',
    name: 'Darwin Invest',
    displayName: 'Darwin Invest',
    title: 'Darwin Invest : SCPI gérées, stratégie et analyse',
    seoTitle: 'Darwin Invest SCPI : société de gestion | MaximusSCPI',
    metaDescription: 'Analyse de Darwin Invest, société de gestion. SCPI associées à vérifier — données à confirmer auprès des sources officielles.',
    mainKeyword: 'Darwin Invest société de gestion SCPI',
    keywords: ['Darwin Invest', 'société de gestion SCPI', 'gestionnaire SCPI', 'AMF', 'documents réglementaires'],
    category: 'gestionnaires-acteurs',
    managedScpis: [],
    summary: 'Darwin Invest est une société de gestion à analyser avec prudence. Les SCPI associées à Darwin Invest sont à vérifier dans les documents réglementaires (ASPIM, AMF/GECO, DIC, site officiel de la société de gestion). Aucune SCPI n\'a été identifiée dans le référentiel interne à ce stade.',
    keyPoints: [
      'Société de gestion à vérifier',
      'SCPI associées non identifiées dans les données internes',
      'Données à vérifier : ASPIM, AMF/GECO, site officiel',
      'Points de vigilance : transparence, documentation'
    ],
    vigilancePoints: [
      { critere: 'Association SCPI ↔ société de gestion', importance: 'Aucune SCPI associée identifiée', vigilance: 'Donnée à vérifier — consulter l\'ASPIM et l\'AMF/GECO' },
      { critere: 'Transparence documentaire', importance: 'Vérifier la disponibilité des documents réglementaires', vigilance: 'Rechercher les DIC, notes d\'information et rapports annuels' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui recherche les SCPI gérées par Darwin Invest', description: 'Un investisseur consulte l\'ASPIM et le site officiel de Darwin Invest pour identifier les SCPI gérées.' }
    ],
    faq: [
      { question: 'Quelles SCPI sont gérées par Darwin Invest ?', reponse: 'Les SCPI gérées par Darwin Invest sont à vérifier auprès des sources officielles : ASPIM, AMF/GECO, site de la société de gestion.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Sociétés de gestion SCPI', url: '/societes-de-gestion-scpi/' },
      { label: 'AMF SCPI', url: '/amf-scpi/' },
      { label: 'Documents réglementaires SCPI', url: '/documents-reglementaires-scpi/' },
      { label: 'DIC SCPI', url: '/dic-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' }
    ],
    angle: 'Société de gestion à vérifier — SCPI associées non identifiées dans les données internes.'
  },
  {
    slug: 'fiducial-gerance',
    name: 'Fiducial Gérance',
    displayName: 'Fiducial Gérance',
    title: 'Fiducial Gérance : SCPI gérées, stratégie et analyse',
    seoTitle: 'Fiducial Gérance SCPI : société de gestion, Buroboutic Métropoles | MaximusSCPI',
    metaDescription: 'Analyse de Fiducial Gérance, société de gestion. SCPI Buroboutic Métropoles, Ficommerce Proximité, Selectipierre 2 — indicateurs et vigilance.',
    mainKeyword: 'Fiducial Gérance société de gestion SCPI',
    keywords: ['Fiducial Gérance', 'Buroboutic Métropoles', 'Ficommerce Proximité', 'Selectipierre 2', 'société de gestion SCPI', 'gestionnaire SCPI'],
    category: 'gestionnaires-acteurs',
    managedScpis: [
      { name: 'Buroboutic Métropoles', status: 'verified', sector: 'Bureaux' },
      { name: 'Ficommerce Proximité', status: 'verified', sector: 'Commerces de proximité' },
      { name: 'Selectipierre 2', status: 'verified', sector: 'Diversifié France' }
    ],
    summary: 'Fiducial Gérance est une société de gestion à analyser via sa gamme de 3 SCPI (Buroboutic Métropoles, Ficommerce Proximité, Selectipierre 2). L\'analyse porte sur la diversification, les indicateurs de performance et la transparence.',
    keyPoints: [
      'Gamme de 3 SCPI : bureaux, commerces de proximité, diversification',
      'Buroboutic Métropoles : exposition aux bureaux en régions',
      'Ficommerce Proximité : commerces de proximité',
      'Selectipierre 2 : diversification France',
      'À analyser via : TOF, endettement, frais, rendement, capitalisation'
    ],
    vigilancePoints: [
      { critere: 'Exposition bureaux', importance: 'Buroboutic Métropoles est exposé aux bureaux en régions', vigilance: 'Analyser la résilience du marché des bureaux en régions face au télétravail' },
      { critere: 'Exposition commerces de proximité', importance: 'Ficommerce Proximité est exposé au retail', vigilance: 'Évaluer la résilience des commerces de proximité' },
      { critere: 'TOF', importance: 'Reflet de l\'occupation locative', vigilance: 'Surveiller l\'évolution trimestrielle pour chaque SCPI' },
      { critere: 'Taille des véhicules', importance: 'Des SCPI de taille modeste peuvent être moins liquides', vigilance: 'Vérifier la capitalisation dans les rapports annuels' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui compare les SCPI Fiducial Gérance', description: 'Un investisseur compare Buroboutic Métropoles, Ficommerce Proximité et Selectipierre 2 selon son exposition sectorielle souhaitée.' },
      { titre: 'Investisseur qui analyse les commerces de proximité', description: 'Un investisseur analyse Ficommerce Proximité : qualité des emplacements, solidité des locataires, résilience face au e-commerce.' }
    ],
    faq: [
      { question: 'Fiducial Gérance propose-t-elle des SCPI diversifiées ?', reponse: 'Fiducial Gérance propose 3 SCPI couvrant les bureaux, les commerces de proximité et la diversification France. Chaque SCPI doit être analysée individuellement.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Sociétés de gestion SCPI', url: '/societes-de-gestion-scpi/' },
      { label: 'SCPI bureaux', url: '/scpi-bureaux/' },
      { label: 'SCPI commerce', url: '/scpi-commerce/' },
      { label: 'AMF SCPI', url: '/amf-scpi/' },
      { label: 'DIC SCPI', url: '/dic-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' },
      { label: 'Frais SCPI', url: '/frais-scpi/' },
      { label: 'Rendement net SCPI', url: '/rendement-net-scpi/' },
      { label: 'TOF SCPI', url: '/tof-scpi/' },
      { label: 'Capitalisation SCPI', url: '/capitalisation-scpi/' }
    ],
    angle: 'Société de gestion à analyser via sa gamme de 3 SCPI, diversification et indicateurs.'
  },
  {
    slug: 'foncieres-et-territoires',
    name: 'Foncières & Territoires',
    displayName: 'Foncières & Territoires',
    title: 'Foncières & Territoires : SCPI gérées et analyse',
    seoTitle: 'Foncières & Territoires SCPI : société de gestion | MaximusSCPI',
    metaDescription: 'Analyse de Foncières & Territoires, société de gestion. SCPI associées à vérifier — données à confirmer auprès des sources officielles.',
    mainKeyword: 'Foncières & Territoires société de gestion SCPI',
    keywords: ['Foncières et Territoires', 'Foncières & Territoires', 'société de gestion SCPI', 'gestionnaire SCPI', 'AMF'],
    category: 'gestionnaires-acteurs',
    managedScpis: [],
    summary: 'Foncières & Territoires est une société de gestion à analyser avec prudence. Les SCPI associées à Foncières & Territoires sont à vérifier dans les documents réglementaires (ASPIM, AMF/GECO, DIC, site officiel de la société de gestion). Aucune SCPI n\'a été identifiée dans le référentiel interne à ce stade.',
    keyPoints: [
      'Société de gestion à vérifier',
      'SCPI associées non identifiées dans les données internes',
      'Données à vérifier : ASPIM, AMF/GECO, site officiel',
      'Points de vigilance : transparence, documentation'
    ],
    vigilancePoints: [
      { critere: 'Association SCPI ↔ société de gestion', importance: 'Aucune SCPI associée identifiée', vigilance: 'Donnée à vérifier — consulter l\'ASPIM et l\'AMF/GECO' },
      { critere: 'Transparence documentaire', importance: 'Vérifier la disponibilité des documents réglementaires', vigilance: 'Rechercher les DIC, notes d\'information et rapports annuels' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui recherche les SCPI gérées par Foncières & Territoires', description: 'Un investisseur consulte l\'ASPIM et le site officiel de Foncières & Territoires pour identifier les SCPI gérées.' }
    ],
    faq: [
      { question: 'Quelles SCPI sont gérées par Foncières & Territoires ?', reponse: 'Les SCPI gérées par Foncières & Territoires sont à vérifier auprès des sources officielles : ASPIM, AMF/GECO, site de la société de gestion.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Sociétés de gestion SCPI', url: '/societes-de-gestion-scpi/' },
      { label: 'AMF SCPI', url: '/amf-scpi/' },
      { label: 'Documents réglementaires SCPI', url: '/documents-reglementaires-scpi/' },
      { label: 'DIC SCPI', url: '/dic-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' }
    ],
    angle: 'Société de gestion à vérifier — SCPI associées non identifiées dans les données internes.'
  },
  {
    slug: 'groupama-gan-reim',
    name: 'Groupama Gan REIM',
    displayName: 'Groupama Gan REIM',
    title: 'Groupama Gan REIM : SCPI gérées et analyse',
    seoTitle: 'Groupama Gan REIM SCPI : société de gestion | MaximusSCPI',
    metaDescription: 'Analyse de Groupama Gan REIM, société de gestion du groupe Groupama. SCPI associées à vérifier — données à confirmer auprès des sources officielles.',
    mainKeyword: 'Groupama Gan REIM société de gestion SCPI',
    keywords: ['Groupama Gan REIM', 'société de gestion SCPI', 'groupe Groupama', 'assureur SCPI', 'gestionnaire SCPI', 'AMF'],
    category: 'gestionnaires-acteurs',
    managedScpis: [],
    summary: 'Groupama Gan REIM est la société de gestion immobilière du groupe Groupama, à analyser avec prudence. Les SCPI associées à Groupama Gan REIM sont à vérifier dans les documents réglementaires (ASPIM, AMF/GECO, DIC, site officiel de la société de gestion). Aucune SCPI n\'a été identifiée dans le référentiel interne à ce stade.',
    keyPoints: [
      'Société de gestion du groupe d\'assurance Groupama Gan',
      'SCPI associées non identifiées dans les données internes',
      'Données à vérifier : ASPIM, AMF/GECO, site officiel',
      'Points de vigilance : transparence, documentation'
    ],
    vigilancePoints: [
      { critere: 'Association SCPI ↔ société de gestion', importance: 'Aucune SCPI associée identifiée', vigilance: 'Donnée à vérifier — consulter l\'ASPIM et l\'AMF/GECO' },
      { critere: 'Transparence documentaire', importance: 'Vérifier la disponibilité des documents réglementaires', vigilance: 'Rechercher les DIC, notes d\'information et rapports annuels' },
      { critere: 'Solidité du groupe', importance: 'Le groupe Groupama est un assureur mutualiste', vigilance: 'La solidité du groupe ne préjuge pas de la performance des SCPI gérées' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui recherche les SCPI gérées par Groupama Gan REIM', description: 'Un investisseur consulte l\'ASPIM et le site officiel de Groupama Gan REIM pour identifier les SCPI gérées.' }
    ],
    faq: [
      { question: 'Quelles SCPI sont gérées par Groupama Gan REIM ?', reponse: 'Les SCPI gérées par Groupama Gan REIM sont à vérifier auprès des sources officielles : ASPIM, AMF/GECO, site de la société de gestion.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Sociétés de gestion SCPI', url: '/societes-de-gestion-scpi/' },
      { label: 'AMF SCPI', url: '/amf-scpi/' },
      { label: 'Documents réglementaires SCPI', url: '/documents-reglementaires-scpi/' },
      { label: 'DIC SCPI', url: '/dic-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' }
    ],
    angle: 'Société de gestion du groupe Groupama, SCPI associées à vérifier dans les documents réglementaires.'
  },
  {
    slug: 'inter-gestion-reim',
    name: 'Inter Gestion REIM',
    displayName: 'Inter Gestion REIM',
    title: 'Inter Gestion REIM : SCPI gérées, stratégie et analyse',
    seoTitle: 'Inter Gestion REIM SCPI : société de gestion, Cristal Life, Cristal Rente | MaximusSCPI',
    metaDescription: 'Analyse de Inter Gestion REIM, société de gestion. SCPI Cristal Life, Cristal Rente, Grand Paris Résidentiel — indicateurs et points de vigilance.',
    mainKeyword: 'Inter Gestion REIM société de gestion SCPI',
    keywords: ['Inter Gestion REIM', 'Cristal Life', 'Cristal Rente', 'Grand Paris Résidentiel', 'société de gestion SCPI', 'gestionnaire SCPI'],
    category: 'gestionnaires-acteurs',
    managedScpis: [
      { name: 'Cristal Life', status: 'verified', sector: 'Diversifié' },
      { name: 'Cristal Rente', status: 'verified', sector: 'Diversifié' },
      { name: 'Grand Paris Résidentiel', status: 'verified', sector: 'Résidentiel Grand Paris' }
    ],
    summary: 'Inter Gestion REIM est une société de gestion à analyser via sa gamme de 3 SCPI (Cristal Life, Cristal Rente, Grand Paris Résidentiel). L\'analyse porte sur la diversification, les indicateurs de performance et la transparence documentaire.',
    keyPoints: [
      'Gamme de 3 SCPI : Cristal Life, Cristal Rente, Grand Paris Résidentiel',
      'Cristal Life et Cristal Rente : SCPI diversifiées',
      'Grand Paris Résidentiel : exposition au résidentiel francilien',
      'À analyser via : capitalisation, TOF, endettement, frais, rendement'
    ],
    vigilancePoints: [
      { critere: 'Exposition résidentiel Grand Paris', importance: 'Grand Paris Résidentiel est concentré sur le marché francilien', vigilance: 'Analyser la diversification au sein du patrimoine résidentiel francilien' },
      { critere: 'Taille des véhicules', importance: 'Des SCPI de taille modeste peuvent être moins liquides', vigilance: 'Vérifier la capitalisation dans les rapports annuels' },
      { critere: 'TOF', importance: 'Reflet de l\'occupation locative', vigilance: 'Surveiller l\'évolution trimestrielle pour chaque SCPI' },
      { critere: 'Frais', importance: 'Impact sur le rendement net', vigilance: 'Comparer les frais avec le marché' }
    ],
    casPratiques: [
      { titre: 'Investisseur qui compare les SCPI Inter Gestion REIM', description: 'Un investisseur compare Cristal Life, Cristal Rente et Grand Paris Résidentiel selon son profil de risque et ses objectifs.' },
      { titre: 'Investisseur intéressé par le résidentiel francilien', description: 'Un investisseur analyse Grand Paris Résidentiel : typologie des logements, localisation, qualité locative, résilience du marché francilien.' }
    ],
    faq: [
      { question: 'Inter Gestion REIM est-elle une société de gestion diversifiée ?', reponse: 'Inter Gestion REIM propose une gamme de 3 SCPI couvrant plusieurs segments. Chaque SCPI doit être analysée individuellement.' }
    ],
    internalLinks: [
      { label: 'Comprendre les SCPI', url: '/articles/' },
      { label: 'Société de gestion SCPI', url: '/societe-gestion-scpi/' },
      { label: 'Gestionnaire de SCPI', url: '/gestionnaire-scpi/' },
      { label: 'Sociétés de gestion SCPI', url: '/societes-de-gestion-scpi/' },
      { label: 'AMF SCPI', url: '/amf-scpi/' },
      { label: 'ORIAS SCPI', url: '/orias-scpi/' },
      { label: 'DIC SCPI', url: '/dic-scpi/' },
      { label: 'Note d\'information SCPI', url: '/note-information-scpi/' },
      { label: 'Comparateur SCPI', url: '/comparateur-scpi/' },
      { label: 'Risques SCPI', url: '/risques-scpi/' },
      { label: 'Frais SCPI', url: '/frais-scpi/' },
      { label: 'Rendement net SCPI', url: '/rendement-net-scpi/' },
      { label: 'TOF SCPI', url: '/tof-scpi/' },
      { label: 'Capitalisation SCPI', url: '/capitalisation-scpi/' },
      { label: 'Endettement SCPI', url: '/endettement-scpi/' }
    ],
    angle: 'Société de gestion à analyser via sa gamme de 3 SCPI, diversification et indicateurs.'
  }
];

export function getManagementCompanyConfig(slug: string): ManagementCompanyConfig | undefined {
  return managementCompanyConfigs.find(c => c.slug === slug);
}
