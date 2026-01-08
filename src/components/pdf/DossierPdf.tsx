import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { SubscriptionState } from '../../types/subscription';
import { taxRates } from '../../utils/subscriptionLists';

interface DossierPdfProps {
  formData: SubscriptionState;
}

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#059669',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
    color: '#374151',
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    textAlign: 'center',
    color: '#1F2937',
  },
  date: {
    fontSize: 12,
    marginTop: 20,
    textAlign: 'center',
    color: '#6B7280',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#059669',
    borderBottom: '2px solid #059669',
    paddingBottom: 5,
  },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    color: '#374151',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingVertical: 4,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
    color: '#4B5563',
  },
  value: {
    width: '60%',
    color: '#1F2937',
  },
  emptyValue: {
    width: '60%',
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  table: {
    width: '100%',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #E5E7EB',
    paddingVertical: 6,
  },
  tableHeader: {
    backgroundColor: '#F3F4F6',
    fontWeight: 'bold',
    paddingVertical: 8,
  },
  tableCell: {
    width: '50%',
    paddingHorizontal: 8,
  },
  separator: {
    borderTop: '1px solid #E5E7EB',
    marginVertical: 15,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 9,
  },
  note: {
    fontSize: 10,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 10,
    lineHeight: 1.5,
  },
});

// Fonctions utilitaires
const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || amount === 0) {
    return 'Non renseigné';
  }
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr: string | undefined | null): string => {
  if (!dateStr || dateStr.trim() === '') {
    return 'Non renseigné';
  }
  // Si format YYYY-MM-DD, convertir en DD/MM/YYYY
  if (dateStr.includes('-') && dateStr.length === 10) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
  // Si déjà format DD/MM/YYYY, retourner tel quel
  return dateStr;
};

const getValueOrEmpty = (value: string | number | boolean | null | undefined, emptyText = 'Non renseigné'): string => {
  if (value === null || value === undefined || value === '' || value === 0) {
    return emptyText;
  }
  if (typeof value === 'boolean') {
    return value ? 'Oui' : 'Non';
  }
  return String(value);
};

const getTaxRateLabel = (rate: number): string => {
  const taxRate = taxRates.find(r => r.value === rate);
  return taxRate ? taxRate.label : rate > 0 ? `${rate}%` : 'Non renseigné';
};

const getMaritalStatusLabel = (status: string | undefined): string => {
  const labels: Record<string, string> = {
    'celibataire': 'Célibataire',
    'marie': 'Marié(e)',
    'pacs': 'PACS',
    'divorce': 'Divorcé(e)',
    'veuf': 'Veuf(ve)',
    'concubinage': 'Concubinage',
  };
  return labels[status || ''] || status || 'Non renseigné';
};

const getFundingModeLabel = (mode: string | undefined): string => {
  const labels: Record<string, string> = {
    'fonds_propres': 'Fonds propres',
    'credit': 'Crédit',
    'mixte': 'Mixte (fonds propres + crédit)',
  };
  return labels[mode || ''] || mode || 'Non renseigné';
};

const getRiskToleranceLabel = (tolerance: string | undefined): string => {
  const labels: Record<string, string> = {
    'faible': 'Faible',
    'moderee': 'Modérée',
    'elevee': 'Élevée',
  };
  return labels[tolerance || ''] || tolerance || 'Non renseigné';
};

const getRiskReactionLabel = (reaction: string | undefined): string => {
  const labels: Record<string, string> = {
    'securiser': 'Je privilégierais la prudence et chercherais à limiter mon exposition',
    'conserver': 'Je resterais investi, en cohérence avec mon horizon de placement',
    'renforcer': 'Je verrais cette situation comme une opportunité d\'investissement',
  };
  return labels[reaction || ''] || reaction || 'Non renseigné';
};

const getScpiKnowledgeLabel = (knowledge: string | undefined): string => {
  const labels: Record<string, string> = {
    'aucune': 'Non, je découvre ces produits',
    'generale': 'Oui, j\'en ai une connaissance générale (fonctionnement, risques principaux)',
    'experimente': 'Oui, j\'ai déjà investi et je comprends les risques et modalités de sortie',
  };
  return labels[knowledge || ''] || knowledge || 'Non renseigné';
};

const getHousingSituationLabel = (situation: string | undefined): string => {
  const labels: Record<string, string> = {
    'proprietaire': 'Propriétaire',
    'locataire': 'Locataire',
    'heberge': 'Logé à titre gratuit',
  };
  return labels[situation || ''] || situation || 'Non renseigné';
};

const getFundOriginLabel = (origin: string | undefined): string => {
  const labels: Record<string, string> = {
    'salaires': 'Salaires',
    'heritage': 'Héritage',
    'donation': 'Donation',
    'vente_immobilier': 'Vente immobilier',
    'assurance_vie': 'Assurance-vie',
    'epargne': 'Épargne',
    'autre': 'Autre',
  };
  return labels[origin || ''] || origin || 'Non renseigné';
};

const getPepStatusLabel = (pep: string | undefined): string => {
  const labels: Record<string, string> = {
    'non': 'Non',
    'oui_personne': 'Oui, je suis une PEP',
    'oui_proche': 'Oui, un membre de ma famille proche est une PEP',
  };
  return labels[pep || ''] || pep || 'Non renseigné';
};

const getMaritalRegimeLabel = (regime: string | null | undefined): string => {
  if (!regime) return 'Non renseigné';
  const labels: Record<string, string> = {
    'communaute_universelle': 'Communauté universelle',
    'communaute_reduite_aux_acquets': 'Communauté réduite aux acquêts',
    'separation_biens': 'Séparation de biens',
    'participation_aux_acquets': 'Participation aux acquêts',
    'communaute_biens_meubles_acquets': 'Communauté de biens meubles et acquêts',
    'indivision': 'Indivision',
    'autre': 'Autre',
  };
  return labels[regime] || regime;
};

// Composant pour une ligne de données
const DataRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label} :</Text>
    <Text style={value === 'Non renseigné' ? styles.emptyValue : styles.value}>{value}</Text>
  </View>
);

// Composant pour une section
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

// Composant principal du PDF
const DossierPdfDocument: React.FC<DossierPdfProps> = ({ formData }) => {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const clientName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Client';

  // Objectifs sélectionnés
  const allObjectives = [
    formData.primaryObjective,
    ...formData.secondaryObjectives,
  ].filter(obj => obj && obj.trim() !== '');

  return (
    <Document>
      {/* Page de garde */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          <Text style={styles.title}>DOSSIER DE SOUSCRIPTION</Text>
          <Text style={styles.subtitle}>Connaissance Client</Text>
          <Text style={styles.clientName}>{clientName}</Text>
          <Text style={styles.date}>Généré le {currentDate}</Text>
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
      </Page>

      {/* ÉTAPE 1 : Votre accompagnement */}
      <Page size="A4" style={styles.page}>
        <Section title="ÉTAPE 1 : Votre accompagnement">
          <DataRow label="Contexte accepté" value={formData.contextAccepted ? 'Oui' : 'Non'} />
        </Section>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
      </Page>

      {/* ÉTAPE 2 : Projet & Profil */}
      <Page size="A4" style={styles.page}>
        <Section title="ÉTAPE 2 : Projet & Profil">
          <Text style={styles.subsectionTitle}>Objectifs principaux</Text>
          {allObjectives.length > 0 ? (
            allObjectives.map((obj, index) => (
              <Text key={index} style={styles.value}>• {obj}</Text>
            ))
          ) : (
            <Text style={styles.emptyValue}>Non renseigné</Text>
          )}

          <View style={styles.separator} />

          <DataRow label="Horizon d'investissement" value={formData.horizon ? `${formData.horizon} ans` : 'Non renseigné'} />
          <DataRow label="Montant envisagé" value={formatCurrency(formData.amount)} />
          <DataRow label="Mode de financement" value={getFundingModeLabel(formData.fundingMode)} />
          <DataRow label="Tolérance au risque" value={getRiskToleranceLabel(formData.riskTolerance)} />
          <DataRow label="Réaction en cas de baisse" value={getRiskReactionLabel(formData.riskReaction)} />
          <DataRow label="Connaissance des risques" value={getScpiKnowledgeLabel(formData.scpiKnowledge)} />
        </Section>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
      </Page>

      {/* ÉTAPE 3 : Identité & Contact - Souscripteur */}
      <Page size="A4" style={styles.page}>
        <Section title="ÉTAPE 3 : Identité & Contact - Souscripteur principal">
          <DataRow label="Type de souscription" value={formData.subscriptionType === 'biens_propres' ? 'Biens propres' : 'Biens communs'} />
          
          <Text style={styles.subsectionTitle}>Identité</Text>
          <DataRow label="Civilité" value={getValueOrEmpty(formData.civility)} />
          <DataRow label="Nom" value={getValueOrEmpty(formData.lastName)} />
          {formData.civility === 'Madame' && (
            <DataRow label="Nom de naissance" value={getValueOrEmpty(formData.birthLastName)} />
          )}
          <DataRow label="Prénom" value={getValueOrEmpty(formData.firstName)} />
          <DataRow label="Date de naissance" value={formatDate(formData.birthDate)} />
          <DataRow label="Pays de naissance" value={getValueOrEmpty(formData.birthCountry)} />
          <DataRow label="Ville de naissance" value={getValueOrEmpty(formData.birthCity)} />
          <DataRow label="Nationalité" value={getValueOrEmpty(formData.nationality)} />

          <Text style={styles.subsectionTitle}>Adresse</Text>
          <DataRow label="Adresse complète" value={getValueOrEmpty(formData.address)} />
          <DataRow label="Code postal" value={getValueOrEmpty(formData.postalCode)} />
          <DataRow label="Ville" value={getValueOrEmpty(formData.city)} />
          <DataRow label="Pays" value={getValueOrEmpty(formData.country)} />

          <Text style={styles.subsectionTitle}>Contact</Text>
          <DataRow label="Téléphone" value={getValueOrEmpty(formData.phone)} />
          <DataRow label="Email" value={getValueOrEmpty(formData.email)} />
        </Section>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
      </Page>

      {/* ÉTAPE 3 : Co-souscripteur (si applicable) */}
      {formData.subscriptionType === 'biens_communs' && formData.coSubscriber && (
        <Page size="A4" style={styles.page}>
          <Section title="ÉTAPE 3 : Identité & Contact - Co-souscripteur">
            <Text style={styles.subsectionTitle}>Identité</Text>
            <DataRow label="Civilité" value={getValueOrEmpty(formData.coSubscriber.civility)} />
            <DataRow label="Nom" value={getValueOrEmpty(formData.coSubscriber.lastName)} />
            {formData.coSubscriber.civility === 'Madame' && (
              <DataRow label="Nom de naissance" value={getValueOrEmpty(formData.coSubscriber.birthLastName)} />
            )}
            <DataRow label="Prénom" value={getValueOrEmpty(formData.coSubscriber.firstName)} />
            <DataRow label="Date de naissance" value={formatDate(formData.coSubscriber.birthDate)} />
            <DataRow label="Pays de naissance" value={getValueOrEmpty(formData.coSubscriber.birthCountry)} />
            <DataRow label="Ville de naissance" value={getValueOrEmpty(formData.coSubscriber.birthCity)} />
            <DataRow label="Nationalité" value={getValueOrEmpty(formData.coSubscriber.nationality)} />

            <Text style={styles.subsectionTitle}>Adresse</Text>
            <DataRow label="Adresse complète" value={getValueOrEmpty(formData.coSubscriber.address)} />
            <DataRow label="Code postal" value={getValueOrEmpty(formData.coSubscriber.postalCode)} />
            <DataRow label="Ville" value={getValueOrEmpty(formData.coSubscriber.city)} />
            <DataRow label="Pays" value={getValueOrEmpty(formData.coSubscriber.country)} />

            <Text style={styles.subsectionTitle}>Contact</Text>
            <DataRow label="Téléphone" value={getValueOrEmpty(formData.coSubscriber.phone)} />
            <DataRow label="Email" value={getValueOrEmpty(formData.coSubscriber.email)} />
          </Section>
          <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
        </Page>
      )}

      {/* ÉTAPE 4 : Situation familiale & professionnelle - Souscripteur */}
      <Page size="A4" style={styles.page}>
        <Section title="ÉTAPE 4 : Situation familiale & professionnelle - Souscripteur principal">
          <Text style={styles.subsectionTitle}>Situation familiale</Text>
          <DataRow label="Situation matrimoniale" value={getMaritalStatusLabel(formData.maritalStatus)} />
          {(formData.maritalStatus === 'marie' || formData.maritalStatus === 'pacs') && (
            <DataRow label="Régime matrimonial" value={getMaritalRegimeLabel(formData.maritalRegime)} />
          )}
          <DataRow 
            label="Nombre d'enfants à charge" 
            value={formData.dependentChildren !== undefined && formData.dependentChildren !== null 
              ? formData.dependentChildren === 0 ? 'Aucun' : `${formData.dependentChildren} enfant${formData.dependentChildren > 1 ? 's' : ''}`
              : 'Non renseigné'} 
          />

          <Text style={styles.subsectionTitle}>Situation professionnelle</Text>
          <DataRow label="Profession" value={getValueOrEmpty(formData.profession)} />
          <DataRow label="Secteur d'activité" value={getValueOrEmpty(formData.activitySector)} />
          <DataRow label="Employeur" value={getValueOrEmpty(formData.employer)} />
          <DataRow label="Activité hors UE" value={formData.activityOutsideEU ? 'Oui' : 'Non'} />
        </Section>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
      </Page>

      {/* ÉTAPE 4 : Co-souscripteur (si applicable) */}
      {formData.subscriptionType === 'biens_communs' && formData.coSubscriber && (
        <Page size="A4" style={styles.page}>
          <Section title="ÉTAPE 4 : Situation familiale & professionnelle - Co-souscripteur">
            <Text style={styles.subsectionTitle}>Situation familiale</Text>
            <DataRow label="Situation matrimoniale" value={getMaritalStatusLabel(formData.coSubscriber.maritalStatus)} />
            {(formData.coSubscriber.maritalStatus === 'marie' || formData.coSubscriber.maritalStatus === 'pacs') && (
              <DataRow label="Régime matrimonial" value={getMaritalRegimeLabel(formData.coSubscriber.maritalRegime)} />
            )}
            <DataRow 
              label="Nombre d'enfants à charge" 
              value={formData.coSubscriber.dependentChildren !== undefined && formData.coSubscriber.dependentChildren !== null 
                ? formData.coSubscriber.dependentChildren === 0 ? 'Aucun' : `${formData.coSubscriber.dependentChildren} enfant${formData.coSubscriber.dependentChildren > 1 ? 's' : ''}`
                : 'Non renseigné'} 
            />

            <Text style={styles.subsectionTitle}>Situation professionnelle</Text>
            <DataRow label="Profession" value={getValueOrEmpty(formData.coSubscriber.profession)} />
            <DataRow label="Secteur d'activité" value={getValueOrEmpty(formData.coSubscriber.activitySector)} />
            <DataRow label="Employeur" value={getValueOrEmpty(formData.coSubscriber.employer)} />
            <DataRow label="Activité hors UE" value={formData.coSubscriber.activityOutsideEU ? 'Oui' : 'Non'} />
          </Section>
          <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
        </Page>
      )}

      {/* ÉTAPE 5 : Situation fiscale & résidentielle - Souscripteur */}
      <Page size="A4" style={styles.page}>
        <Section title="ÉTAPE 5 : Situation fiscale & résidentielle - Souscripteur principal">
          <DataRow label="Situation logement" value={getHousingSituationLabel(formData.housingSituation)} />
          
          <Text style={styles.subsectionTitle}>Résidence fiscale</Text>
          <DataRow label="Pays de résidence fiscale" value={getValueOrEmpty(formData.taxResidence)} />
          {formData.taxResidence !== formData.country && (
            <DataRow label="Pays de résidence fiscale si différent" value={getValueOrEmpty(formData.taxResidenceCountry)} />
          )}
          <DataRow 
            label="Détail de la résidence fiscale" 
            value={formData.taxResidenceSameAsPrincipal === null 
              ? 'Non renseigné' 
              : formData.taxResidenceSameAsPrincipal 
                ? 'Oui, même que la résidence principale' 
                : 'Non, différente de la résidence principale'} 
          />
          <DataRow label="NIF (Numéro d'identification fiscale)" value={formData.nif && formData.nif !== 'A voir en RDV' ? getValueOrEmpty(formData.nif) : 'A récupérer en RDV'} />
          <DataRow label="Taux marginal d'imposition" value={formData.averageTaxRate && formData.averageTaxRate !== 0 ? getTaxRateLabel(formData.averageTaxRate) : 'A récupérer en RDV'} />

          <Text style={styles.subsectionTitle}>Statut fiscal</Text>
          <DataRow label="US Person" value={formData.usPerson ? 'Oui' : 'Non'} />
          {formData.usPerson && (
            <>
              <DataRow 
                label="Obligation fiscale aux États-Unis" 
                value={formData.usTaxObligation === null ? 'Non renseigné' : formData.usTaxObligation ? 'Oui' : 'Non'} 
              />
              <DataRow 
                label="Citoyenneté américaine" 
                value={formData.usCitizenship === null ? 'Non renseigné' : formData.usCitizenship ? 'Oui' : 'Non'} 
              />
            </>
          )}
          <DataRow label="Statut PEP" value={getPepStatusLabel(formData.pep)} />
        </Section>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
      </Page>

      {/* ÉTAPE 5 : Co-souscripteur (si applicable) */}
      {formData.subscriptionType === 'biens_communs' && formData.coSubscriber && (
        <Page size="A4" style={styles.page}>
          <Section title="ÉTAPE 5 : Situation fiscale & résidentielle - Co-souscripteur">
            <DataRow label="Situation logement" value={getHousingSituationLabel(formData.coSubscriber.housingSituation)} />
            
            <Text style={styles.subsectionTitle}>Résidence fiscale</Text>
            <DataRow label="Pays de résidence fiscale" value={getValueOrEmpty(formData.coSubscriber.taxResidence)} />
            {formData.coSubscriber.taxResidence !== formData.coSubscriber.country && (
              <DataRow label="Pays de résidence fiscale si différent" value={getValueOrEmpty(formData.coSubscriber.taxResidenceCountry)} />
            )}
            <DataRow 
              label="Détail de la résidence fiscale" 
              value={formData.coSubscriber.taxResidenceSameAsPrincipal === null 
                ? 'Non renseigné' 
                : formData.coSubscriber.taxResidenceSameAsPrincipal 
                  ? 'Oui, même que la résidence principale' 
                  : 'Non, différente de la résidence principale'} 
            />
            <DataRow label="NIF (Numéro d'identification fiscale)" value={formData.coSubscriber.nif && formData.coSubscriber.nif !== 'A voir en RDV' ? getValueOrEmpty(formData.coSubscriber.nif) : 'A récupérer en RDV'} />
            <DataRow label="Taux marginal d'imposition" value={formData.coSubscriber.averageTaxRate && formData.coSubscriber.averageTaxRate !== 0 ? getTaxRateLabel(formData.coSubscriber.averageTaxRate) : 'A récupérer en RDV'} />

            <Text style={styles.subsectionTitle}>Statut fiscal</Text>
            <DataRow label="US Person" value={formData.coSubscriber.usPerson ? 'Oui' : 'Non'} />
            {formData.coSubscriber.usPerson && (
              <>
                <DataRow 
                  label="Obligation fiscale aux États-Unis" 
                  value={formData.coSubscriber.usTaxObligation === null ? 'Non renseigné' : formData.coSubscriber.usTaxObligation ? 'Oui' : 'Non'} 
                />
                <DataRow 
                  label="Citoyenneté américaine" 
                  value={formData.coSubscriber.usCitizenship === null ? 'Non renseigné' : formData.coSubscriber.usCitizenship ? 'Oui' : 'Non'} 
                />
              </>
            )}
            <DataRow label="Statut PEP" value={getPepStatusLabel(formData.coSubscriber.pep)} />
          </Section>
          <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
        </Page>
      )}

      {/* ÉTAPE 6 : Patrimoine - Souscripteur */}
      <Page size="A4" style={styles.page}>
        <Section title="ÉTAPE 6 : Patrimoine - Souscripteur principal">
          <Text style={styles.subsectionTitle}>Patrimoine</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Actif</Text>
              <Text style={styles.tableCell}>Montant</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Résidence principale</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.primaryResidence)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Résidence secondaire</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.secondaryResidence)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Investissement locatif</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.rentalRealEstate)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Valeurs mobilières</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.securities)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Assurance-vie</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.assuranceVie)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Liquidités</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.liquidities)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Livrets</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.livrets)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Or</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.or)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Collection</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.collection)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Objets d'art</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.objetsArt)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Actifs professionnels</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.actifsProfessionnels)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Forêts</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.forets)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Capital restant dû (emprunts)</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.debts)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Autres actifs</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.otherAssets)}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <Text style={styles.subsectionTitle}>Revenus annuels bruts</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Type de revenu</Text>
              <Text style={styles.tableCell}>Montant</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Salaire</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.salary)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Revenus locatifs</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.rentalIncome)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Revenus financiers</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.financialIncome)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Pensions</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.pensions)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Autres revenus</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.otherIncome)}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <Text style={styles.subsectionTitle}>Charges annuelles brutes</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Type de charge</Text>
              <Text style={styles.tableCell}>Montant</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Loyer</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.rent)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Crédits résidences</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.creditsResidences)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Crédits locatif</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.creditsLocatif)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Crédits consommation</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.creditsConsommation)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Impôt sur le revenu</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.incomeTax)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>IFI</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.ifi)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Autres charges</Text>
              <Text style={styles.tableCell}>{formatCurrency(formData.otherCharges)}</Text>
            </View>
          </View>
        </Section>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
      </Page>

      {/* ÉTAPE 6 : Patrimoine Co-souscripteur (si applicable) */}
      {formData.subscriptionType === 'biens_communs' && formData.coSubscriber && (
        <Page size="A4" style={styles.page}>
          <Section title="ÉTAPE 6 : Patrimoine - Co-souscripteur">
            <Text style={styles.subsectionTitle}>Patrimoine</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Actif</Text>
                <Text style={styles.tableCell}>Montant</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Résidence principale</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.primaryResidence)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Résidence secondaire</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.secondaryResidence)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Investissement locatif</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.rentalRealEstate)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Valeurs mobilières</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.securities)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Assurance-vie</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.assuranceVie)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Liquidités</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.liquidities)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Livrets</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.livrets)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Or</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.or)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Collection</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.collection)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Objets d'art</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.objetsArt)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Actifs professionnels</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.actifsProfessionnels)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Forêts</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.forets)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Capital restant dû (emprunts)</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.debts)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Autres actifs</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.otherAssets)}</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <Text style={styles.subsectionTitle}>Revenus annuels bruts</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Type de revenu</Text>
                <Text style={styles.tableCell}>Montant</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Salaire</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.salary)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Revenus locatifs</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.rentalIncome)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Revenus financiers</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.financialIncome)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Pensions</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.pensions)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Autres revenus</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.otherIncome)}</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <Text style={styles.subsectionTitle}>Charges annuelles brutes</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Type de charge</Text>
                <Text style={styles.tableCell}>Montant</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Loyer</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.rent)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Crédits résidences</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.creditsResidences)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Crédits locatif</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.creditsLocatif)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Crédits consommation</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.creditsConsommation)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Impôt sur le revenu</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.incomeTax)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>IFI</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.ifi)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Autres charges</Text>
                <Text style={styles.tableCell}>{formatCurrency(formData.coSubscriber.otherCharges)}</Text>
              </View>
            </View>
          </Section>
          <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
        </Page>
      )}

      {/* ÉTAPE 7 : Origine des fonds */}
      <Page size="A4" style={styles.page}>
        <Section title="ÉTAPE 7 : Origine des fonds (LCB-FT)">
          <DataRow label="Origine principale des fonds" value={getFundOriginLabel(formData.primaryFundOrigin)} />
          <DataRow label="Origines multiples" value={formData.multipleOrigins ? 'Oui' : 'Non'} />
          <DataRow label="Pays de provenance des fonds" value={getValueOrEmpty(formData.fundOriginCountry)} />
        </Section>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
      </Page>

      {/* ÉTAPE 7 : Origine des fonds Co-souscripteur (si applicable) */}
      {formData.subscriptionType === 'biens_communs' && formData.coSubscriber && (
        <Page size="A4" style={styles.page}>
          <Section title="ÉTAPE 7 : Origine des fonds (LCB-FT) - Co-souscripteur">
            <DataRow 
              label="Origine principale des fonds" 
              value={getFundOriginLabel((formData.coSubscriber as any).primaryFundOrigin)} 
            />
            <DataRow 
              label="Pays de provenance des fonds" 
              value={getValueOrEmpty((formData.coSubscriber as any).fundOriginCountry)} 
            />
          </Section>
          <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
        </Page>
      )}

      {/* ÉTAPE 8 : Justificatifs */}
      <Page size="A4" style={styles.page}>
        <Section title="ÉTAPE 8 : Justificatifs">
          <Text style={styles.subsectionTitle}>Documents à collecter</Text>
          <DataRow 
            label="Statut" 
            value="Documents à collecter en RDV" 
          />
          <Text style={styles.note}>
            Les pièces justificatives (Pièce d'identité, Justificatif de domicile, etc.) seront collectées directement avec votre conseiller lors de votre rendez-vous.
          </Text>
        </Section>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
      </Page>

      {/* ÉTAPE 9 : Consentements */}
      <Page size="A4" style={styles.page}>
        <Section title="ÉTAPE 9 : Communication & Consentements">
          <DataRow label="Documents électroniques" value={formData.electronicDocuments ? 'Oui' : 'Non'} />
          <DataRow label="Informations par email" value={formData.emailConsent ? 'Oui' : 'Non'} />
          <DataRow label="Informations par SMS" value={formData.smsConsent ? 'Oui' : 'Non'} />
        </Section>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
      </Page>

      {/* ÉTAPE 10 : Engagements */}
      <Page size="A4" style={styles.page}>
        <Section title="ÉTAPE 10 : Validation finale">
          <DataRow label="Exactitude des informations fournies" value={formData.informationAccuracy ? 'Oui' : 'Non'} />
          <DataRow label="Compréhension des risques SCPI / FIA" value={formData.riskUnderstanding ? 'Oui' : 'Non'} />
          <DataRow label="Accord pour analyse CIF" value={formData.cifAnalysisAgreement ? 'Oui' : 'Non'} />
          <DataRow label="Compréhension du processus de souscription" value={formData.subscriptionUnderstanding ? 'Oui' : 'Non'} />
        </Section>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
      </Page>
    </Document>
  );
};

// Composant wrapper pour le téléchargement
export const DossierPdfDownload: React.FC<{ formData: SubscriptionState }> = ({ formData }) => {
  const fileName = `Dossier_Souscription_${formData.lastName || 'Client'}_${new Date().toISOString().split('T')[0]}.pdf`;

  return (
    <PDFDownloadLink
      document={<DossierPdfDocument formData={formData} />}
      fileName={fileName}
      style={{
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        backgroundColor: '#2563eb',
        color: '#ffffff',
        borderRadius: '12px',
        fontWeight: 600,
        transition: 'background-color 0.2s',
      }}
      className="hover:bg-blue-700"
    >
      {({ loading }) => (
        loading 
          ? '⏳ Génération du PDF...' 
          : '📄 Télécharger mon dossier (PDF)'
      )}
    </PDFDownloadLink>
  );
};

export default DossierPdfDocument;
