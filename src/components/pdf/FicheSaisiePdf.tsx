import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { SubscriptionState } from '../../types/subscription';
import { taxRates } from '../../utils/subscriptionLists';

interface FicheSaisiePdfProps {
  formData: SubscriptionState;
}

// Styles compacts pour fiche technique
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottom: '2px solid #000000',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000000',
  },
  date: {
    fontSize: 9,
    color: '#666666',
  },
  section: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#000000',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
    fontSize: 10,
  },
  label: {
    width: '35%',
    fontWeight: 'bold',
    color: '#000000',
  },
  value: {
    width: '65%',
    color: '#333333',
  },
  compactList: {
    fontSize: 9,
    lineHeight: 1.4,
    marginTop: 3,
  },
  compactRow: {
    flexDirection: 'row',
    marginBottom: 2,
    fontSize: 9,
  },
  compactLabel: {
    width: '40%',
    fontWeight: 'bold',
  },
  compactValue: {
    width: '60%',
  },
  separator: {
    borderTop: '1px solid #CCCCCC',
    marginVertical: 8,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#999999',
    fontSize: 8,
  },
});

// Fonctions utilitaires
const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || amount === 0) {
    return 'N/A';
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
    return 'N/A';
  }
  if (dateStr.includes('-') && dateStr.length === 10) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

const getValueOrEmpty = (value: string | number | boolean | null | undefined, emptyText = 'N/A'): string => {
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
  return taxRate ? taxRate.label : rate > 0 ? `${rate}%` : 'N/A';
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
  return labels[status || ''] || status || 'N/A';
};

const getMaritalRegimeLabel = (regime: string | null | undefined): string => {
  if (!regime) return 'N/A';
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

const getFundingModeLabel = (mode: string | undefined): string => {
  const labels: Record<string, string> = {
    'fonds_propres': 'Fonds propres',
    'credit': 'Crédit',
    'mixte': 'Mixte',
  };
  return labels[mode || ''] || mode || 'N/A';
};

const getRiskToleranceLabel = (tolerance: string | undefined): string => {
  const labels: Record<string, string> = {
    'faible': 'Faible',
    'moderee': 'Modérée',
    'elevee': 'Élevée',
  };
  return labels[tolerance || ''] || tolerance || 'N/A';
};

const getRiskReactionLabel = (reaction: string | undefined): string => {
  const labels: Record<string, string> = {
    'securiser': 'Sécuriser',
    'conserver': 'Conserver',
    'renforcer': 'Renforcer',
  };
  return labels[reaction || ''] || reaction || 'N/A';
};

const getScpiKnowledgeLabel = (knowledge: string | undefined): string => {
  const labels: Record<string, string> = {
    'aucune': 'Aucune',
    'generale': 'Générale',
    'experimente': 'Expérimenté',
  };
  return labels[knowledge || ''] || knowledge || 'N/A';
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
  return labels[origin || ''] || origin || 'N/A';
};

const getPepStatusLabel = (pep: string | undefined): string => {
  const labels: Record<string, string> = {
    'non': 'Non',
    'oui_personne': 'Oui (personne)',
    'oui_proche': 'Oui (proche)',
  };
  return labels[pep || ''] || pep || 'N/A';
};

// Composant pour une ligne de données
const DataRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label} :</Text>
    <Text style={styles.value}>{value}</Text>
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
const FicheSaisiePdfDocument: React.FC<FicheSaisiePdfProps> = ({ formData }) => {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
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
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>FICHE DE SAISIE PSI - {clientName.toUpperCase()}</Text>
          <Text style={styles.date}>Date de soumission : {currentDate}</Text>
        </View>

        {/* ÉTAPE 1 : CONTEXTE */}
        <Section title="--- ÉTAPE 1 : CONTEXTE ---">
          <DataRow label="Acceptation" value={formData.contextAccepted ? 'Oui' : 'Non'} />
        </Section>

        {/* ÉTAPE 2 : PROJET */}
        <Section title="--- ÉTAPE 2 : PROJET ---">
          <DataRow 
            label="Objectifs" 
            value={allObjectives.length > 0 ? allObjectives.join(', ') : 'N/A'} 
          />
          <DataRow label="Horizon" value={formData.horizon ? `${formData.horizon} ans` : 'N/A'} />
          <DataRow label="Montant" value={formatCurrency(formData.amount)} />
          <DataRow label="Financement" value={getFundingModeLabel(formData.fundingMode)} />
          <DataRow 
            label="Profil Risque" 
            value={`${getRiskToleranceLabel(formData.riskTolerance)} / ${getRiskReactionLabel(formData.riskReaction)}`} 
          />
          <DataRow label="Connaissance SCPI" value={getScpiKnowledgeLabel(formData.scpiKnowledge)} />
        </Section>

        {/* ÉTAPE 3 : IDENTITÉ SOUSCRIPTEUR 1 */}
        <Section title="--- ÉTAPE 3 : IDENTITÉ (SOUSCRIPTEUR 1) ---">
          <DataRow 
            label="Civilité / Nom / Prénom" 
            value={`${getValueOrEmpty(formData.civility)} ${getValueOrEmpty(formData.lastName)} ${getValueOrEmpty(formData.firstName)}`} 
          />
          <DataRow 
            label="Nom de Naissance" 
            value={formData.civility === 'Madame' ? getValueOrEmpty(formData.birthLastName) : 'N/A'} 
          />
          <DataRow 
            label="Né(e) le" 
            value={`${formatDate(formData.birthDate)} à ${getValueOrEmpty(formData.birthCity)}, ${getValueOrEmpty(formData.birthCountry)}`} 
          />
          <DataRow label="Nationalité" value={getValueOrEmpty(formData.nationality)} />
          <DataRow 
            label="Adresse" 
            value={`${getValueOrEmpty(formData.address)}, ${getValueOrEmpty(formData.postalCode)} ${getValueOrEmpty(formData.city)}, ${getValueOrEmpty(formData.country)}`} 
          />
          <DataRow 
            label="Contact" 
            value={`${getValueOrEmpty(formData.phone)} / ${getValueOrEmpty(formData.email)}`} 
          />
        </Section>

        {/* ÉTAPE 3 BIS : CO-SOUSCRIPTEUR */}
        {formData.subscriptionType === 'biens_communs' && formData.coSubscriber ? (
          <Section title="--- ÉTAPE 3 BIS : CO-SOUSCRIPTEUR ---">
            <DataRow 
              label="Civilité / Nom / Prénom" 
              value={`${getValueOrEmpty(formData.coSubscriber.civility)} ${getValueOrEmpty(formData.coSubscriber.lastName)} ${getValueOrEmpty(formData.coSubscriber.firstName)}`} 
            />
            <DataRow 
              label="Nom de Naissance" 
              value={formData.coSubscriber.civility === 'Madame' ? getValueOrEmpty(formData.coSubscriber.birthLastName) : 'N/A'} 
            />
            <DataRow 
              label="Né(e) le" 
              value={`${formatDate(formData.coSubscriber.birthDate)} à ${getValueOrEmpty(formData.coSubscriber.birthCity)}, ${getValueOrEmpty(formData.coSubscriber.birthCountry)}`} 
            />
            <DataRow label="Nationalité" value={getValueOrEmpty(formData.coSubscriber.nationality)} />
            <DataRow 
              label="Adresse" 
              value={`${getValueOrEmpty(formData.coSubscriber.address)}, ${getValueOrEmpty(formData.coSubscriber.postalCode)} ${getValueOrEmpty(formData.coSubscriber.city)}, ${getValueOrEmpty(formData.coSubscriber.country)}`} 
            />
            <DataRow 
              label="Contact" 
              value={`${getValueOrEmpty(formData.coSubscriber.phone)} / ${getValueOrEmpty(formData.coSubscriber.email)}`} 
            />
          </Section>
        ) : (
          <Section title="--- ÉTAPE 3 BIS : CO-SOUSCRIPTEUR ---">
            <Text style={styles.value}>AUCUN</Text>
          </Section>
        )}

        {/* ÉTAPE 4 : SITUATION FAMILLE & PRO */}
        <Section title="--- ÉTAPE 4 : SITUATION FAMILLE & PRO ---">
          <DataRow 
            label="Matrimonial" 
            value={`${getMaritalStatusLabel(formData.maritalStatus)}${(formData.maritalStatus === 'marie' || formData.maritalStatus === 'pacs') ? ` (Régime: ${getMaritalRegimeLabel(formData.maritalRegime)})` : ''}`} 
          />
          <DataRow 
            label="Enfants à charge" 
            value={formData.dependentChildren !== undefined && formData.dependentChildren !== null 
              ? String(formData.dependentChildren)
              : 'N/A'} 
          />
          <DataRow 
            label="Profession" 
            value={`${getValueOrEmpty(formData.profession)} (${getValueOrEmpty(formData.activitySector)})`} 
          />
          <DataRow label="Employeur" value={getValueOrEmpty(formData.employer)} />
          <DataRow label="Activité hors UE" value={formData.activityOutsideEU ? 'Oui' : 'Non'} />
        </Section>

        {/* ÉTAPE 4 BIS : CO-SOUSCRIPTEUR (si applicable) */}
        {formData.subscriptionType === 'biens_communs' && formData.coSubscriber && (
          <Section title="--- ÉTAPE 4 BIS : SITUATION FAMILLE & PRO (CO-SOUSCRIPTEUR) ---">
            <DataRow 
              label="Matrimonial" 
              value={`${getMaritalStatusLabel(formData.coSubscriber.maritalStatus)}${(formData.coSubscriber.maritalStatus === 'marie' || formData.coSubscriber.maritalStatus === 'pacs') ? ` (Régime: ${getMaritalRegimeLabel(formData.coSubscriber.maritalRegime)})` : ''}`} 
            />
            <DataRow 
              label="Enfants à charge" 
              value={formData.coSubscriber.dependentChildren !== undefined && formData.coSubscriber.dependentChildren !== null 
                ? String(formData.coSubscriber.dependentChildren)
                : 'N/A'} 
            />
            <DataRow 
              label="Profession" 
              value={`${getValueOrEmpty(formData.coSubscriber.profession)} (${getValueOrEmpty(formData.coSubscriber.activitySector)})`} 
            />
            <DataRow label="Employeur" value={getValueOrEmpty(formData.coSubscriber.employer)} />
            <DataRow label="Activité hors UE" value={formData.coSubscriber.activityOutsideEU ? 'Oui' : 'Non'} />
          </Section>
        )}

        {/* ÉTAPE 5 : FISCALITÉ */}
        <Section title="--- ÉTAPE 5 : FISCALITÉ ---">
          <DataRow label="Résidence Fiscale" value={getValueOrEmpty(formData.taxResidence)} />
          <DataRow label="NIF" value={getValueOrEmpty(formData.nif)} />
          <DataRow label="TMI" value={getTaxRateLabel(formData.averageTaxRate)} />
          <DataRow label="US Person" value={formData.usPerson ? 'Oui' : 'Non'} />
          {formData.usPerson && (
            <>
              <DataRow 
                label="  - Obligation fiscale US" 
                value={formData.usTaxObligation === null ? 'N/A' : formData.usTaxObligation ? 'Oui' : 'Non'} 
              />
              <DataRow 
                label="  - Citoyenneté US" 
                value={formData.usCitizenship === null ? 'N/A' : formData.usCitizenship ? 'Oui' : 'Non'} 
              />
            </>
          )}
          <DataRow label="PEP" value={getPepStatusLabel(formData.pep)} />
        </Section>

        {/* ÉTAPE 5 BIS : FISCALITÉ CO-SOUSCRIPTEUR (si applicable) */}
        {formData.subscriptionType === 'biens_communs' && formData.coSubscriber && (
          <Section title="--- ÉTAPE 5 BIS : FISCALITÉ (CO-SOUSCRIPTEUR) ---">
            <DataRow label="Résidence Fiscale" value={getValueOrEmpty(formData.coSubscriber.taxResidence)} />
            <DataRow label="NIF" value={getValueOrEmpty(formData.coSubscriber.nif)} />
            <DataRow label="TMI" value={getTaxRateLabel(formData.coSubscriber.averageTaxRate)} />
            <DataRow label="US Person" value={formData.coSubscriber.usPerson ? 'Oui' : 'Non'} />
            {formData.coSubscriber.usPerson && (
              <>
                <DataRow 
                  label="  - Obligation fiscale US" 
                  value={formData.coSubscriber.usTaxObligation === null ? 'N/A' : formData.coSubscriber.usTaxObligation ? 'Oui' : 'Non'} 
                />
                <DataRow 
                  label="  - Citoyenneté US" 
                  value={formData.coSubscriber.usCitizenship === null ? 'N/A' : formData.coSubscriber.usCitizenship ? 'Oui' : 'Non'} 
                />
              </>
            )}
            <DataRow label="PEP" value={getPepStatusLabel(formData.coSubscriber.pep)} />
          </Section>
        )}

        {/* ÉTAPE 6 : PATRIMOINE & BUDGET */}
        <Section title="--- ÉTAPE 6 : PATRIMOINE & BUDGET ---">
          <Text style={styles.sectionTitle}>Patrimoine Brut :</Text>
          <View style={styles.compactList}>
            <Text style={styles.compactRow}>Résidence principale: {formatCurrency(formData.primaryResidence)}</Text>
            <Text style={styles.compactRow}>Résidence secondaire: {formatCurrency(formData.secondaryResidence)}</Text>
            <Text style={styles.compactRow}>Locatif: {formatCurrency(formData.rentalRealEstate)}</Text>
            <Text style={styles.compactRow}>Valeurs mobilières: {formatCurrency(formData.securities)}</Text>
            <Text style={styles.compactRow}>Assurance-vie: {formatCurrency(formData.assuranceVie)}</Text>
            <Text style={styles.compactRow}>Liquidités: {formatCurrency(formData.liquidities)}</Text>
            <Text style={styles.compactRow}>Livrets: {formatCurrency(formData.livrets)}</Text>
            <Text style={styles.compactRow}>Or: {formatCurrency(formData.or)}</Text>
            <Text style={styles.compactRow}>Collection: {formatCurrency(formData.collection)}</Text>
            <Text style={styles.compactRow}>Objets d'art: {formatCurrency(formData.objetsArt)}</Text>
            <Text style={styles.compactRow}>Actifs pro: {formatCurrency(formData.actifsProfessionnels)}</Text>
            <Text style={styles.compactRow}>Forêts: {formatCurrency(formData.forets)}</Text>
            <Text style={styles.compactRow}>Emprunts: {formatCurrency(formData.debts)}</Text>
            <Text style={styles.compactRow}>Autres: {formatCurrency(formData.otherAssets)}</Text>
          </View>

          <View style={styles.separator} />

          <Text style={styles.sectionTitle}>Revenus Annuels :</Text>
          <View style={styles.compactList}>
            <Text style={styles.compactRow}>Salaire: {formatCurrency(formData.salary)}</Text>
            <Text style={styles.compactRow}>Locatifs: {formatCurrency(formData.rentalIncome)}</Text>
            <Text style={styles.compactRow}>Financiers: {formatCurrency(formData.financialIncome)}</Text>
            <Text style={styles.compactRow}>Pensions: {formatCurrency(formData.pensions)}</Text>
            <Text style={styles.compactRow}>Autres: {formatCurrency(formData.otherIncome)}</Text>
          </View>

          <View style={styles.separator} />

          <Text style={styles.sectionTitle}>Charges Annuelles :</Text>
          <View style={styles.compactList}>
            <Text style={styles.compactRow}>Loyer: {formatCurrency(formData.rent)}</Text>
            <Text style={styles.compactRow}>Crédits résidences: {formatCurrency(formData.creditsResidences)}</Text>
            <Text style={styles.compactRow}>Crédits locatif: {formatCurrency(formData.creditsLocatif)}</Text>
            <Text style={styles.compactRow}>Crédits conso: {formatCurrency(formData.creditsConsommation)}</Text>
            <Text style={styles.compactRow}>IR: {formatCurrency(formData.incomeTax)}</Text>
            <Text style={styles.compactRow}>IFI: {formatCurrency(formData.ifi)}</Text>
            <Text style={styles.compactRow}>Autres charges: {formatCurrency(formData.otherCharges)}</Text>
          </View>
        </Section>

        {/* ÉTAPE 6 BIS : PATRIMOINE CO-SOUSCRIPTEUR (si applicable) */}
        {formData.subscriptionType === 'biens_communs' && formData.coSubscriber && (
          <Section title="--- ÉTAPE 6 BIS : PATRIMOINE & BUDGET (CO-SOUSCRIPTEUR) ---">
            <Text style={styles.sectionTitle}>Patrimoine Brut :</Text>
            <View style={styles.compactList}>
              <Text style={styles.compactRow}>Résidence principale: {formatCurrency(formData.coSubscriber.primaryResidence)}</Text>
              <Text style={styles.compactRow}>Résidence secondaire: {formatCurrency(formData.coSubscriber.secondaryResidence)}</Text>
              <Text style={styles.compactRow}>Locatif: {formatCurrency(formData.coSubscriber.rentalRealEstate)}</Text>
              <Text style={styles.compactRow}>Valeurs mobilières: {formatCurrency(formData.coSubscriber.securities)}</Text>
              <Text style={styles.compactRow}>Assurance-vie: {formatCurrency(formData.coSubscriber.assuranceVie)}</Text>
              <Text style={styles.compactRow}>Liquidités: {formatCurrency(formData.coSubscriber.liquidities)}</Text>
              <Text style={styles.compactRow}>Livrets: {formatCurrency(formData.coSubscriber.livrets)}</Text>
              <Text style={styles.compactRow}>Or: {formatCurrency(formData.coSubscriber.or)}</Text>
              <Text style={styles.compactRow}>Collection: {formatCurrency(formData.coSubscriber.collection)}</Text>
              <Text style={styles.compactRow}>Objets d'art: {formatCurrency(formData.coSubscriber.objetsArt)}</Text>
              <Text style={styles.compactRow}>Actifs pro: {formatCurrency(formData.coSubscriber.actifsProfessionnels)}</Text>
              <Text style={styles.compactRow}>Forêts: {formatCurrency(formData.coSubscriber.forets)}</Text>
              <Text style={styles.compactRow}>Emprunts: {formatCurrency(formData.coSubscriber.debts)}</Text>
              <Text style={styles.compactRow}>Autres: {formatCurrency(formData.coSubscriber.otherAssets)}</Text>
            </View>

            <View style={styles.separator} />

            <Text style={styles.sectionTitle}>Revenus Annuels :</Text>
            <View style={styles.compactList}>
              <Text style={styles.compactRow}>Salaire: {formatCurrency(formData.coSubscriber.salary)}</Text>
              <Text style={styles.compactRow}>Locatifs: {formatCurrency(formData.coSubscriber.rentalIncome)}</Text>
              <Text style={styles.compactRow}>Financiers: {formatCurrency(formData.coSubscriber.financialIncome)}</Text>
              <Text style={styles.compactRow}>Pensions: {formatCurrency(formData.coSubscriber.pensions)}</Text>
              <Text style={styles.compactRow}>Autres: {formatCurrency(formData.coSubscriber.otherIncome)}</Text>
            </View>

            <View style={styles.separator} />

            <Text style={styles.sectionTitle}>Charges Annuelles :</Text>
            <View style={styles.compactList}>
              <Text style={styles.compactRow}>Loyer: {formatCurrency(formData.coSubscriber.rent)}</Text>
              <Text style={styles.compactRow}>Crédits résidences: {formatCurrency(formData.coSubscriber.creditsResidences)}</Text>
              <Text style={styles.compactRow}>Crédits locatif: {formatCurrency(formData.coSubscriber.creditsLocatif)}</Text>
              <Text style={styles.compactRow}>Crédits conso: {formatCurrency(formData.coSubscriber.creditsConsommation)}</Text>
              <Text style={styles.compactRow}>IR: {formatCurrency(formData.coSubscriber.incomeTax)}</Text>
              <Text style={styles.compactRow}>IFI: {formatCurrency(formData.coSubscriber.ifi)}</Text>
              <Text style={styles.compactRow}>Autres charges: {formatCurrency(formData.coSubscriber.otherCharges)}</Text>
            </View>
          </Section>
        )}

        {/* ÉTAPE 7 : ORIGINE DES FONDS */}
        <Section title="--- ÉTAPE 7 : ORIGINE DES FONDS ---">
          <DataRow label="Origine" value={getFundOriginLabel(formData.primaryFundOrigin)} />
          <DataRow label="Pays provenance" value={getValueOrEmpty(formData.fundOriginCountry)} />
        </Section>

        {/* ÉTAPE 7 BIS : ORIGINE DES FONDS CO-SOUSCRIPTEUR (si applicable) */}
        {formData.subscriptionType === 'biens_communs' && formData.coSubscriber && (
          <Section title="--- ÉTAPE 7 BIS : ORIGINE DES FONDS (CO-SOUSCRIPTEUR) ---">
            <DataRow 
              label="Origine" 
              value={formData.coSubscriber && 'primaryFundOrigin' in formData.coSubscriber 
                ? getFundOriginLabel((formData.coSubscriber as any).primaryFundOrigin)
                : 'N/A'} 
            />
            <DataRow 
              label="Pays provenance" 
              value={formData.coSubscriber && 'fundOriginCountry' in formData.coSubscriber
                ? getValueOrEmpty((formData.coSubscriber as any).fundOriginCountry)
                : 'N/A'} 
            />
          </Section>
        )}

        {/* ÉTAPE 10 : VALIDATIONS */}
        <Section title="--- ÉTAPE 10 : VALIDATIONS ---">
          <DataRow label="Exactitude infos" value={formData.informationAccuracy ? 'Oui' : 'Non'} />
          <DataRow label="Compréhension risques" value={formData.riskUnderstanding ? 'Oui' : 'Non'} />
          <DataRow label="Accord analyse CIF" value={formData.cifAnalysisAgreement ? 'Oui' : 'Non'} />
          <DataRow label="Compréhension processus" value={formData.subscriptionUnderstanding ? 'Oui' : 'Non'} />
        </Section>

        <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
      </Page>
    </Document>
  );
};

// Composant wrapper pour le téléchargement
export const FicheSaisiePdfDownload: React.FC<{ formData: SubscriptionState }> = ({ formData }) => {
  const fileName = `Dossier_Saisie_PSI_${formData.lastName || 'Client'}_${new Date().toISOString().split('T')[0]}.pdf`;

  return (
    <PDFDownloadLink
      document={<FicheSaisiePdfDocument formData={formData} />}
      fileName={fileName}
      style={{
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        backgroundColor: '#4B5563',
        color: '#ffffff',
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: '14px',
      }}
      className="hover:bg-gray-700"
    >
      {({ loading }) => (
        loading 
          ? '⏳ Génération...' 
          : '📋 Télécharger Fiche Saisie PSI (PDF)'
      )}
    </PDFDownloadLink>
  );
};

export default FicheSaisiePdfDocument;
