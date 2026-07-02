import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { HoldingISInputs, HoldingISResult } from '../../../utils/holdingSimulation';
import { getVerificationProfile, getVerificationStatusLabel } from '../../../utils/expertVerification';
import { getCurrentRoleFromCache } from '../../../utils/expertAccess';

/* ── Helpers formatage ── */

/**
 * Normalise les espaces pour @react-pdf/renderer.
 * Intl.NumberFormat('fr-FR') produit des espaces insécables (\u202F, \u00A0)
 * qui ne sont pas rendus correctement par react-pdf (affichage de "/").
 * On les remplace par des espaces ASCII standards.
 */
const norm = (s: string): string => s.replace(/[\s\u202F\u00A0]/g, ' ');

const fmtEuro = (v: number): string =>
  norm(new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v));

const fmtPercent = (v: number): string =>
  norm(new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)) + ' %';

const fmtNumber = (v: number): string =>
  norm(new Intl.NumberFormat('fr-FR').format(v));

const fmtDate = () => {
  const now = new Date();
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(now);
};

const FEES_TREATMENT_SHORT: Record<string, string> = {
  'not-integrated': 'Non intégré',
  'deductible-year1': 'Déductible année 1',
  'amortized': 'Amorti sur la durée',
  'non-deductible': 'Non déductible',
};

/* ── Styles ── */

const colors = {
  dark: '#1a1a2e',
  primary: '#1e3a5f',
  accent: '#059669',
  orange: '#c2410c',
  light: '#f8fafc',
  muted: '#94a3b8',
  border: '#e2e8f0',
  rowAlt: '#f1f5f9',
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    paddingVertical: 28,
    paddingHorizontal: 36,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1e293b',
  },
  pageLandscape: {
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#1e293b',
  },
  header: {
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 1,
  },
  headerSubtitle: {
    fontSize: 10,
    color: colors.muted,
    marginBottom: 2,
  },
  headerMeta: {
    fontSize: 8,
    color: colors.muted,
    lineHeight: 1.5,
  },
  headerBadge: {
    fontSize: 7,
    color: colors.accent,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 6,
    marginTop: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 4,
  },
  grid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
    marginBottom: 4,
  },
  kpiRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  kpiCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: 6,
    marginRight: '4%',
  },
  kpiCardLast: {
    width: '48%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  kpiLabel: {
    fontSize: 7,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  kpiValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.dark,
  },
  kpiValueGreen: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.accent,
  },
  kpiValueOrange: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.orange,
  },
  kpiSublabel: {
    fontSize: 7,
    color: '#94a3b8',
    marginTop: 1,
  },
  table: {
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 2,
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowAlt: {
    backgroundColor: colors.rowAlt,
  },
  tableCell: {
    fontSize: 8,
    color: colors.dark,
  },
  tableCellRight: {
    fontSize: 8,
    color: colors.dark,
    textAlign: 'right',
  },
  tableCellMuted: {
    fontSize: 8,
    color: colors.muted,
    textAlign: 'right',
  },
  tableCellGreen: {
    fontSize: 8,
    color: colors.accent,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  tableCellOrange: {
    fontSize: 8,
    color: colors.orange,
    textAlign: 'right',
  },
  tableCellBold: {
    fontSize: 8,
    color: colors.dark,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  opinionBox: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: 8,
    marginBottom: 8,
    borderRadius: 2,
  },
  opinionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  opinionItem: {
    fontSize: 8,
    color: '#334155',
    lineHeight: 1.4,
    marginBottom: 1,
  },
  infoBox: {
    backgroundColor: colors.rowAlt,
    padding: 8,
    marginBottom: 8,
    borderRadius: 2,
  },
  infoTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  infoItem: {
    fontSize: 8,
    color: '#475569',
    lineHeight: 1.5,
    marginBottom: 1,
  },
  syntheseBox: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 2,
  },
  syntheseTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  syntheseText: {
    fontSize: 8,
    color: '#1e293b',
    lineHeight: 1.6,
  },
  conclusionText: {
    fontSize: 8,
    color: '#475569',
    lineHeight: 1.5,
    marginTop: 4,
  },
  hypothesesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  hypothesesItem: {
    width: '31%',
    marginRight: '2%',
    marginBottom: 5,
    paddingVertical: 3,
    paddingHorizontal: 7,
    backgroundColor: '#f8fafc',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  hypothesesLabel: {
    fontSize: 7,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 1,
  },
  hypothesesValue: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#334155',
  },
  detailTable: {
    marginBottom: 8,
  },
  detailTableRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailTableRowAlt: {
    backgroundColor: colors.rowAlt,
  },
  detailTableLabel: {
    fontSize: 8,
    color: colors.dark,
    flex: 2,
    fontWeight: 'bold',
  },
  detailTableValue: {
    fontSize: 8,
    color: colors.dark,
    flex: 1.5,
    textAlign: 'right',
  },
  detailTableValueGreen: {
    fontSize: 8,
    color: colors.accent,
    flex: 1.5,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  detailTableValueOrange: {
    fontSize: 8,
    color: colors.orange,
    flex: 1.5,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  vigilanceBox: {
    backgroundColor: '#fff7ed',
    borderLeftWidth: 3,
    borderLeftColor: colors.orange,
    padding: 8,
    marginTop: 6,
    borderRadius: 2,
  },
  vigilanceTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.orange,
    marginBottom: 5,
  },
  vigilanceItem: {
    fontSize: 8,
    color: '#78350f',
    lineHeight: 1.4,
    marginBottom: 1,
  },
  visaBox: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
  },
  visaTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 6,
  },
  visaText: {
    fontSize: 8,
    color: '#475569',
    lineHeight: 1.5,
    marginBottom: 6,
  },
  visaField: {
    fontSize: 8,
    color: '#334155',
    lineHeight: 1.8,
    marginBottom: 1,
  },
  vatBadge: {
    fontSize: 7,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  disclaimer: {
    backgroundColor: '#fff7ed',
    borderLeftWidth: 3,
    borderLeftColor: colors.orange,
    padding: 8,
    marginTop: 6,
    borderRadius: 2,
  },
  disclaimerText: {
    fontSize: 7,
    color: '#78350f',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 36,
    right: 36,
    fontSize: 7,
    color: colors.muted,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 5,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 14,
    right: 36,
    fontSize: 7,
    color: colors.muted,
  },
});

/* ── Props ── */

interface ExpertHoldingReportPdfProps {
  inputs: HoldingISInputs;
  result: HoldingISResult;
  isSansOperation: number;
}

/* ── Composant Document ── */

const ExpertHoldingReportPdf: React.FC<ExpertHoldingReportPdfProps> = ({ inputs, result, isSansOperation }) => {
  const tresorerieResiduelle = inputs.availableCash - result.effortEconomique;
  const dossierTitle = (inputs.dossierName || 'MaximusSCPI').replace(/[^a-zA-Z0-9\-_]/g, '-').substring(0, 50);
  const verificationProfile = getVerificationProfile();
  const isDeclared = verificationProfile?.status === 'declared_oec_registered';
  const isAdmin = getCurrentRoleFromCache() === 'admin';

  const headerFragment = (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerTitle}>Note de chiffrage Expert-Comptable</Text>
          <Text style={styles.headerSubtitle}>Société IS — Usufruit temporaire SCPI</Text>
        </View>
        <View>
          {isAdmin ? (
            <>
              <Text style={{ ...styles.headerBadge, backgroundColor: '#7c3aed20', color: '#a78bfa' }}>Mode admin — document de test</Text>
            </>
          ) : (
            <>
              <Text style={styles.headerBadge}>Espace Expert-Comptable</Text>
              {isDeclared && (
                <Text style={{ ...styles.headerBadge, backgroundColor: '#065f46', color: '#a7f3d0', marginTop: 4 }}>
                  {getVerificationStatusLabel(verificationProfile!.status)}
                </Text>
              )}
              {!isDeclared && (
                <Text style={{ fontSize: 7, color: '#94a3b8', marginTop: 4, textAlign: 'right' }}>
                  Cabinet non déclaré
                </Text>
              )}
            </>
          )}
        </View>
      </View>
      <View style={styles.headerMeta}>
        <Text>Date : {fmtDate()}</Text>
        <Text>Dossier : {inputs.dossierName || 'Simulation Holding IS'}</Text>
        <Text>Type de société : {inputs.companyType}</Text>
        <Text>Simulation indicative — validation cabinet requise</Text>
      </View>
    </View>
  );

  const footerFragment = (page: number) => (
    <>
      <Text style={styles.footer}>
        MaximusSCPI — Espace Expert-Comptable — {fmtDate()} — {dossierTitle}
      </Text>
      <Text style={styles.pageNumber}>Page {page}</Text>
    </>
  );

  return (
    <Document
      title={`Rapport Holding IS – ${dossierTitle}`}
      author="MaximusSCPI – Espace Expert-Comptable"
      subject="Note de chiffrage — Société IS, Usufruit temporaire SCPI"
    >
      {/* ═══════════════════════════════════════════════════════
          PAGE 1 — Synthèse décisionnelle
          ═══════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page} wrap={false}>
        {headerFragment}

        {/* Hypothèses principales retenues */}
        <Text style={styles.sectionTitle}>Hypothèses principales retenues</Text>
        <View style={styles.hypothesesGrid}>
          <View style={styles.hypothesesItem}>
            <Text style={styles.hypothesesLabel}>Type de société</Text>
            <Text style={styles.hypothesesValue}>{inputs.companyType}</Text>
          </View>
          <View style={styles.hypothesesItem}>
            <Text style={styles.hypothesesLabel}>Régime IS</Text>
            <Text style={styles.hypothesesValue}>
              {inputs.reducedRateEligible ? 'Taux réduit PME (15 % / 25 %)' : 'Taux normal (25 %)'}
            </Text>
          </View>
          <View style={styles.hypothesesItem}>
            <Text style={styles.hypothesesLabel}>Trésorerie disponible</Text>
            <Text style={styles.hypothesesValue}>{fmtEuro(inputs.availableCash)}</Text>
          </View>
          <View style={styles.hypothesesItem}>
            <Text style={styles.hypothesesLabel}>Usufruit investi</Text>
            <Text style={styles.hypothesesValue}>{fmtEuro(inputs.usufruitInvestment)}</Text>
          </View>
          <View style={styles.hypothesesItem}>
            <Text style={styles.hypothesesLabel}>Durée de l'usufruit</Text>
            <Text style={styles.hypothesesValue}>{inputs.usufruitDuration} ans</Text>
          </View>
          <View style={styles.hypothesesItem}>
            <Text style={styles.hypothesesLabel}>Clé d'usufruit</Text>
            <Text style={styles.hypothesesValue}>{fmtPercent(inputs.usufruitKeyPercent)}</Text>
          </View>
          <View style={styles.hypothesesItem}>
            <Text style={styles.hypothesesLabel}>Taux distribution brut</Text>
            <Text style={styles.hypothesesValue}>{fmtPercent(inputs.grossYieldRate)}</Text>
          </View>
          <View style={styles.hypothesesItem}>
            <Text style={styles.hypothesesLabel}>Revalorisation annuelle</Text>
            <Text style={styles.hypothesesValue}>{inputs.revalorizationRate} %</Text>
          </View>
          {inputs.feesEnabled && (
            <>
              <View style={styles.hypothesesItem}>
                <Text style={styles.hypothesesLabel}>Frais de mission HT</Text>
                <Text style={styles.hypothesesValue}>{fmtEuro(result.feesHT)}</Text>
              </View>
              <View style={styles.hypothesesItem}>
                <Text style={styles.hypothesesLabel}>TVA récupérable</Text>
                <Text style={styles.hypothesesValue}>{inputs.feesVatRecoverable ? 'Oui' : 'Non'}</Text>
              </View>
              <View style={{ ...styles.hypothesesItem, width: '64%' }}>
                <Text style={styles.hypothesesLabel}>Traitement frais de mission</Text>
                <Text style={styles.hypothesesValue}>{FEES_TREATMENT_SHORT[inputs.feesTreatment]}</Text>
              </View>
            </>
          )}
        </View>

        {/* Synthèse de l'opération */}
        <View style={styles.syntheseBox}>
          <Text style={styles.syntheseTitle}>Synthèse de l'opération</Text>
          <Text style={styles.syntheseText}>
            La société mobilise {fmtEuro(result.effortEconomique)} sur une trésorerie disponible de {fmtEuro(inputs.availableCash)}.
          </Text>
          <Text style={styles.syntheseText}>
            Trésorerie résiduelle théorique après opération : {fmtEuro(tresorerieResiduelle)}.
          </Text>
          <Text style={styles.syntheseText}>
            Flux net année 1 après frais de mission initiaux : {fmtEuro(result.annualNetCashFlowAfterFees)}.
          </Text>
          <Text style={styles.syntheseText}>
            Impact IS année 1 : {result.annualISImpact >= 0 ? '+' : ''}{fmtEuro(result.annualISImpact)}.
          </Text>
          <Text style={styles.syntheseText}>
            Rendement net moyen annuel : {fmtPercent(result.netCompanyYieldAvgAnnual)} sur {inputs.usufruitDuration} ans.
          </Text>
          {inputs.feesEnabled && (
            <Text style={styles.syntheseText}>
              Les frais de mission sont supposés payés au démarrage et intégrés dans l'effort initial. Ils sont isolés en année 1 pour mesurer le flux net complet de lancement de l'opération.
            </Text>
          )}
        </View>

        {/* Vue synthétique */}
        <Text style={styles.sectionTitle}>Vue synthétique</Text>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Effort initial total</Text>
            <Text style={styles.kpiValue}>{fmtEuro(result.effortEconomique)}</Text>
            <Text style={styles.kpiSublabel}>Dont frais de mission au démarrage</Text>
          </View>
          <View style={styles.kpiCardLast}>
            <Text style={styles.kpiLabel}>Trésorerie résiduelle</Text>
            <Text style={tresorerieResiduelle >= 0 ? styles.kpiValueGreen : styles.kpiValueOrange}>
              {fmtEuro(tresorerieResiduelle)}
            </Text>
          </View>
        </View>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Flux net année 1</Text>
            <Text style={result.annualNetCashFlowAfterFees >= 0 ? styles.kpiValueGreen : styles.kpiValueOrange}>
              {fmtEuro(result.annualNetCashFlowAfterFees)}
            </Text>
            <Text style={styles.kpiSublabel}>Après frais de mission initiaux</Text>
          </View>
          <View style={styles.kpiCardLast}>
            <Text style={styles.kpiLabel}>Impact IS année 1</Text>
            <Text style={styles.kpiValueOrange}>
              {result.annualISImpact >= 0 ? '+' : ''}{fmtEuro(result.annualISImpact)}
            </Text>
          </View>
        </View>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Rendement net moyen annuel</Text>
            <Text style={result.netCompanyYieldAvgAnnual >= 0 ? styles.kpiValueGreen : styles.kpiValueOrange}>
              {fmtPercent(result.netCompanyYieldAvgAnnual)}
            </Text>
            <Text style={styles.kpiSublabel}>Sur {inputs.usufruitDuration} ans</Text>
          </View>
          <View style={styles.kpiCardLast}>
            <Text style={styles.kpiLabel}>Cash-flow net cumulé</Text>
            <Text style={styles.kpiValueGreen}>{fmtEuro(result.cumulativeNetCashFlowAfterFees)}</Text>
            <Text style={styles.kpiSublabel}>Sur {inputs.usufruitDuration} ans</Text>
          </View>
        </View>

        {/* Conclusion courte */}
        <Text style={styles.conclusionText}>
          L'opération génère un résultat fiscal additionnel de {fmtEuro(result.annualFiscalResultOperationOnly)} la première année.{' '}
          Le cash-flow net cumulé sur {inputs.usufruitDuration} ans atteint {fmtEuro(result.cumulativeNetCashFlowAfterFees)}.{' '}
          Validation comptable et fiscale requise avant toute présentation client.
        </Text>

        {footerFragment(1)}
      </Page>

      {/* ═══════════════════════════════════════════════════════
          PAGE 2 — Analyse fiscale détaillée
          ═══════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page} wrap={false}>
        {/* Frais de mission et TVA — tableau compact */}
        {inputs.feesEnabled && result.feesHT > 0 && (
          <>
            <Text style={styles.sectionTitle}>Frais de mission et TVA</Text>
            <View style={styles.detailTable}>
              <View style={styles.detailTableRow}>
                <Text style={styles.detailTableLabel}>Frais de mission HT</Text>
                <Text style={styles.detailTableValue}>{fmtEuro(result.feesHT)}</Text>
              </View>
              <View style={{ ...styles.detailTableRow, ...styles.detailTableRowAlt }}>
                <Text style={styles.detailTableLabel}>TVA ({inputs.feesVatRate} %)</Text>
                <Text style={styles.detailTableValue}>{fmtEuro(result.feesVAT)}</Text>
              </View>
              <View style={styles.detailTableRow}>
                <Text style={styles.detailTableLabel}>Frais de mission TTC</Text>
                <Text style={styles.detailTableValue}>{fmtEuro(result.feesTTC)}</Text>
              </View>
              <View style={{ ...styles.detailTableRow, ...styles.detailTableRowAlt }}>
                <Text style={styles.detailTableLabel}>TVA</Text>
                <Text style={inputs.feesVatRecoverable ? styles.detailTableValueGreen : styles.detailTableValueOrange}>
                  {inputs.feesVatRecoverable ? 'Récupérable' : 'Non récupérable'}
                </Text>
              </View>
              <View style={styles.detailTableRow}>
                <Text style={styles.detailTableLabel}>Traitement fiscal/comptable retenu</Text>
                <Text style={styles.detailTableValue}>{FEES_TREATMENT_SHORT[inputs.feesTreatment]}</Text>
              </View>
            </View>
          </>
        )}

        {/* Détail résultat fiscal et IS — année 1 */}
        <Text style={styles.sectionTitle}>Détail résultat fiscal et IS — année 1</Text>
        <View style={styles.detailTable}>
          <View style={styles.detailTableRow}>
            <Text style={styles.detailTableLabel}>Résultat fiscal avant opération</Text>
            <Text style={styles.detailTableValue}>{fmtEuro(inputs.preTaxProfit)}</Text>
          </View>
          <View style={{ ...styles.detailTableRow, ...styles.detailTableRowAlt }}>
            <Text style={styles.detailTableLabel}>Résultat fiscal de l'opération</Text>
            <Text style={styles.detailTableValue}>{fmtEuro(result.annualFiscalResultOperationOnly)}</Text>
          </View>
          <View style={styles.detailTableRow}>
            <Text style={styles.detailTableLabel}>Résultat fiscal après opération</Text>
            <Text style={styles.detailTableValue}>{fmtEuro(result.annualFiscalResultAfterOperation)}</Text>
          </View>
          <View style={{ ...styles.detailTableRow, ...styles.detailTableRowAlt }}>
            <Text style={styles.detailTableLabel}>IS sans opération</Text>
            <Text style={styles.detailTableValue}>{fmtEuro(isSansOperation)}</Text>
          </View>
          <View style={styles.detailTableRow}>
            <Text style={styles.detailTableLabel}>IS avec opération</Text>
            <Text style={styles.detailTableValueOrange}>{fmtEuro(result.annualISAfterOperation)}</Text>
          </View>
          <View style={{ ...styles.detailTableRow, ...styles.detailTableRowAlt }}>
            <Text style={styles.detailTableLabel}>Impact IS net</Text>
            <Text style={styles.detailTableValueOrange}>
              {result.annualISImpact >= 0 ? '+' : ''}{fmtEuro(result.annualISImpact)}
            </Text>
          </View>
          <View style={styles.detailTableRow}>
            <Text style={styles.detailTableLabel}>Revenus bruts annuels SCPI</Text>
            <Text style={styles.detailTableValue}>{fmtEuro(result.annualGrossIncome)}</Text>
          </View>
          <View style={{ ...styles.detailTableRow, ...styles.detailTableRowAlt }}>
            <Text style={styles.detailTableLabel}>Amortissement annuel usufruit</Text>
            <Text style={styles.detailTableValue}>{fmtEuro(result.annualAmortization)}</Text>
          </View>
          <View style={styles.detailTableRow}>
            <Text style={styles.detailTableLabel}>Frais de mission — année 1</Text>
            <Text style={styles.detailTableValue}>{fmtEuro(result.feesFiscalYear1)}</Text>
          </View>
        </View>

        {footerFragment(2)}
      </Page>

      {/* ═══════════════════════════════════════════════════════
          PAGE 3 — Comparatif avant / après
          ═══════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page} wrap={false}>
        <Text style={styles.sectionTitle}>Comparatif avant / après opération (année 1)</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.tableHeaderCell, width: '40%' }}>Indicateur</Text>
            <Text style={{ ...styles.tableHeaderCell, width: '20%', textAlign: 'right' }}>Sans opération</Text>
            <Text style={{ ...styles.tableHeaderCell, width: '20%', textAlign: 'right' }}>Avec opération</Text>
            <Text style={{ ...styles.tableHeaderCell, width: '20%', textAlign: 'right' }}>Montant / Impact</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={{ ...styles.tableCell, width: '40%' }}>Résultat fiscal société</Text>
            <Text style={{ ...styles.tableCellMuted, width: '20%' }}>{fmtNumber(inputs.preTaxProfit)} €</Text>
            <Text style={{ ...styles.tableCell, width: '20%', textAlign: 'right' }}>{fmtNumber(result.annualFiscalResultAfterOperation)} €</Text>
            <Text style={{ ...styles.tableCellBold, width: '20%' }}>+{fmtNumber(result.annualFiscalResultAfterOperation - inputs.preTaxProfit)} €</Text>
          </View>

          <View style={{ ...styles.tableRow, ...styles.tableRowAlt }}>
            <Text style={{ ...styles.tableCell, width: '40%' }}>IS estimé</Text>
            <Text style={{ ...styles.tableCellMuted, width: '20%' }}>{fmtNumber(isSansOperation)} €</Text>
            <Text style={{ ...styles.tableCell, width: '20%', textAlign: 'right' }}>{fmtNumber(result.annualISAfterOperation)} €</Text>
            <Text style={{ ...styles.tableCellOrange, width: '20%', fontWeight: 'bold' }}>
              {result.annualISImpact >= 0 ? '+' : ''}{fmtNumber(result.annualISImpact)} €
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={{ ...styles.tableCell, width: '40%' }}>Revenus bruts SCPI</Text>
            <Text style={{ ...styles.tableCellMuted, width: '20%' }}>0 €</Text>
            <Text style={{ ...styles.tableCell, width: '20%', textAlign: 'right' }}>{fmtNumber(result.annualGrossIncome)} €</Text>
            <Text style={{ ...styles.tableCellBold, width: '20%' }}>+{fmtNumber(result.annualGrossIncome)} €</Text>
          </View>

          <View style={{ ...styles.tableRow, ...styles.tableRowAlt }}>
            <Text style={{ ...styles.tableCell, width: '40%' }}>Charge déductible : amort. usufruit</Text>
            <Text style={{ ...styles.tableCellMuted, width: '20%' }}>0 €</Text>
            <Text style={{ ...styles.tableCell, width: '20%', textAlign: 'right' }}>{fmtNumber(result.annualAmortization)} €</Text>
            <Text style={{ ...styles.tableCellOrange, width: '20%' }}>Charge retenue : {fmtNumber(result.annualAmortization)} €</Text>
          </View>

          {inputs.feesEnabled && result.feesFiscalYear1 > 0 && (
            <View style={styles.tableRow}>
              <Text style={{ ...styles.tableCell, width: '40%' }}>Frais de mission — année 1</Text>
              <Text style={{ ...styles.tableCellMuted, width: '20%' }}>0 €</Text>
              <Text style={{ ...styles.tableCell, width: '20%', textAlign: 'right' }}>{fmtNumber(result.feesFiscalYear1)} €</Text>
              <Text style={{ ...styles.tableCellOrange, width: '20%' }}>Charge retenue : {fmtNumber(result.feesFiscalYear1)} €</Text>
            </View>
          )}

          <View style={{ ...styles.tableRow, backgroundColor: '#d1fae5' }}>
            <Text style={{ ...styles.tableCell, width: '40%', fontWeight: 'bold' }}>Flux net société (après frais de mission)</Text>
            <Text style={{ ...styles.tableCellMuted, width: '20%' }}>0 €</Text>
            <Text style={{ ...styles.tableCell, width: '20%', textAlign: 'right', fontWeight: 'bold' }}>{fmtNumber(result.annualNetCashFlowAfterFees)} €</Text>
            <Text style={{ ...styles.tableCellGreen, width: '20%' }}>+{fmtNumber(result.annualNetCashFlowAfterFees)} €</Text>
          </View>
        </View>

        {/* Lecture comptable courte */}
        <View style={styles.opinionBox}>
          <Text style={styles.opinionTitle}>Lecture comptable</Text>
          <Text style={styles.opinionItem}>
            L'effort initial total de {fmtEuro(result.effortEconomique)} intègre l'usufruit et les frais de mission payés au démarrage.
          </Text>
          <Text style={styles.opinionItem}>
            Après prise en compte des revenus générés et de l'impact IS, le flux net année 1 ressort à {fmtEuro(result.annualNetCashFlowAfterFees)}.
          </Text>
          <Text style={styles.opinionItem}>
            Le rendement net moyen annuel de {fmtPercent(result.netCompanyYieldAvgAnnual)} sur {inputs.usufruitDuration} ans s'entend après impact fiscal et frais de mission.
          </Text>
          {inputs.feesEnabled && (
            <Text style={styles.opinionItem}>
              Frais de mission : {fmtEuro(result.feesHT)} HT + {fmtEuro(result.feesVAT)} TVA = {fmtEuro(result.feesTTC)} TTC
              {inputs.feesVatRecoverable ? ' (TVA récupérable)' : ' (TVA non récupérable)'}.
            </Text>
          )}
        </View>

        {/* Points de vigilance */}
        <View style={styles.vigilanceBox}>
          <Text style={styles.vigilanceTitle}>Points de vigilance</Text>
          <Text style={styles.vigilanceItem}>• L'usufruit temporaire n'offre pas de valeur de revente à l'échéance.</Text>
          <Text style={styles.vigilanceItem}>• Les revenus futurs des SCPI ne sont pas garantis et dépendent du marché immobilier.</Text>
          <Text style={styles.vigilanceItem}>• La fiscalité IS dépend de la structure juridique et de l'éligibilité au taux réduit.</Text>
          {inputs.feesEnabled && (
            <Text style={styles.vigilanceItem}>• Le traitement fiscal des frais de mission doit être validé selon la nature de la facture et le régime TVA de la société.</Text>
          )}
          <Text style={styles.vigilanceItem}>• Ce document constitue une note de travail, pas un conseil fiscal engageant.</Text>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Simulation indicative. Ce document constitue une note de travail. Il ne constitue ni un conseil fiscal,
            ni une recommandation d'investissement. Les hypothèses fiscales, comptables et financières doivent
            être validées par l'expert-comptable selon la situation réelle de la société.
          </Text>
        </View>

        {footerFragment(3)}
      </Page>

      {/* ═══════════════════════════════════════════════════════
          PAGE 4 — Projection annuelle (paysage)
          ═══════════════════════════════════════════════════════ */}
      <Page size="A4" orientation="landscape" style={styles.pageLandscape} wrap={false}>
        <Text style={styles.sectionTitle}>Projection annuelle sur la durée retenue ({inputs.usufruitDuration} ans)</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.tableHeaderCell, flex: 0.6 }}>Année</Text>
            <Text style={{ ...styles.tableHeaderCell, flex: 1.2, textAlign: 'right' }}>Revenus</Text>
            <Text style={{ ...styles.tableHeaderCell, flex: 1.1, textAlign: 'right' }}>Amort.</Text>
            {inputs.feesEnabled && (
              <Text style={{ ...styles.tableHeaderCell, flex: 1, textAlign: 'right' }}>Mission</Text>
            )}
            <Text style={{ ...styles.tableHeaderCell, flex: 1.3, textAlign: 'right' }}>Rés. fiscal op.</Text>
            <Text style={{ ...styles.tableHeaderCell, flex: 1.2, textAlign: 'right' }}>IS sans</Text>
            <Text style={{ ...styles.tableHeaderCell, flex: 1.2, textAlign: 'right' }}>IS avec</Text>
            <Text style={{ ...styles.tableHeaderCell, flex: 1.2, textAlign: 'right' }}>Impact IS</Text>
            <Text style={{ ...styles.tableHeaderCell, flex: 1.4, textAlign: 'right' }}>Cash-flow net</Text>
          </View>

          {result.projections.map((row, i) => (
            <View key={row.year} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
              <Text style={{ ...styles.tableCell, flex: 0.6, fontWeight: 'bold' }}>A{row.year}</Text>
              <Text style={{ ...styles.tableCellRight, flex: 1.2, color: '#7c3aed' }}>{fmtNumber(row.grossIncome)} €</Text>
              <Text style={{ ...styles.tableCellRight, flex: 1.1 }}>{fmtNumber(row.amortization)} €</Text>
              {inputs.feesEnabled && (
                <Text style={{ ...styles.tableCellRight, flex: 1 }}>
                  {row.feesFiscal > 0 ? fmtNumber(row.feesFiscal) + ' €' : '—'}
                </Text>
              )}
              <Text style={{ ...styles.tableCellRight, flex: 1.3 }}>{fmtNumber(row.fiscalResultOperationOnly)} €</Text>
              <Text style={{ ...styles.tableCellMuted, flex: 1.2 }}>{fmtNumber(row.isBeforeOperation)} €</Text>
              <Text style={{ ...styles.tableCellOrange, flex: 1.2 }}>{fmtNumber(row.isAfterOperation)} €</Text>
              <Text style={{ ...styles.tableCellRight, flex: 1.2, fontWeight: 'bold', color: row.isImpact > 0 ? colors.orange : colors.accent }}>
                {row.isImpact >= 0 ? '+' : ''}{fmtNumber(row.isImpact)} €
              </Text>
              <Text style={{ ...styles.tableCellGreen, flex: 1.4 }}>
                {fmtNumber(inputs.feesEnabled ? row.netCashFlowAfterFees : row.netCashFlow)} €
              </Text>
            </View>
          ))}
        </View>

        {/* Cumul */}
        <View style={{ ...styles.infoBox, marginTop: -4 }}>
          <Text style={styles.infoTitle}>Cash-flow net cumulé</Text>
          <Text style={styles.infoItem}>
            Après frais de mission : {fmtEuro(inputs.feesEnabled ? result.cumulativeNetCashFlowAfterFees : result.cumulativeNetCashFlow)}
          </Text>
          <Text style={styles.infoItem}>
            Hors frais de mission : {fmtEuro(result.cumulativeNetCashFlow)}
          </Text>
        </View>

        {/* Hypothèses fiscales */}
        <Text style={styles.sectionTitle}>Hypothèses comptables et fiscales</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoItem}>• Usufruit temporaire amorti linéairement sur la durée retenue.</Text>
          <Text style={styles.infoItem}>• Aucune valeur résiduelle retenue à l'échéance de l'usufruit.</Text>
          <Text style={styles.infoItem}>• Revenus SCPI supposés constants sur la durée, sauf revalorisation renseignée ({inputs.revalorizationRate} %).</Text>
          <Text style={styles.infoItem}>• Simulation hors frais spécifiques, hors délais de jouissance et hors fiscalité étrangère.</Text>
          <Text style={styles.infoItem}>• Taux d'IS : taux réduit PME (15 % / 25 %) ou taux normal (25 %) selon éligibilité déclarée ({inputs.reducedRateEligible ? 'éligible' : 'non éligible'}).</Text>
          {inputs.feesEnabled && (
            <>
              <Text style={styles.infoItem}>• Les frais de mission sont supposés payés au démarrage et intégrés dans l'effort initial. Ils sont isolés en année 1 pour mesurer le flux net complet de lancement.</Text>
              <Text style={styles.infoItem}>• Frais de mission : {inputs.feesVatMode}, TVA {inputs.feesVatRate} %, {inputs.feesVatRecoverable ? 'récupérable' : 'non récupérable'}.</Text>
              <Text style={styles.infoItem}>• Traitement fiscal : {FEES_TREATMENT_SHORT[inputs.feesTreatment].toLowerCase()}.</Text>
              <Text style={styles.infoItem}>• Déductibilité sur base {inputs.feesVatRecoverable ? 'HT' : 'TTC'}.</Text>
              <Text style={styles.infoItem}>• Le traitement des frais de mission dépend de leur nature, justification et comptabilisation.</Text>
            </>
          )}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Ce document constitue une note de travail indicative. Il ne constitue ni un conseil fiscal,
            ni une recommandation d'investissement, ni une déclaration d'adéquation. Les hypothèses fiscales,
            comptables et financières doivent être validées par l'expert-comptable selon la situation réelle
            de la société.
          </Text>
        </View>

        {/* Visa cabinet */}
        <View style={styles.visaBox}>
          <Text style={styles.visaTitle}>Visa cabinet</Text>
          <Text style={styles.visaText}>
            Document visé pour intégration au dossier de travail du cabinet.
          </Text>
          <Text style={styles.visaField}>Date de validation : ____ / ____ / ________</Text>
          <Text style={styles.visaField}>Nom du cabinet : ____________________________________________</Text>
          <Text style={styles.visaField}>Visa de l'Expert-Comptable : ____________________________________________</Text>
          <Text style={styles.visaField}>Observations : ____________________________________________</Text>
        </View>

        {footerFragment(4)}
      </Page>
    </Document>
  );
};

export default ExpertHoldingReportPdf;
