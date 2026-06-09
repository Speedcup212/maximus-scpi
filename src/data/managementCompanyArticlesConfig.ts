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
  }
];

/** Lookup helper */
export function getManagementCompanyConfig(slug: string): ManagementCompanyConfig | undefined {
  return managementCompanyConfigs.find(c => c.slug === slug);
}
