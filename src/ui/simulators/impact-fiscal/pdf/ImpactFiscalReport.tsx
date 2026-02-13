import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { buildImpactFiscalReportModel, ImpactFiscalReportModel } from './reportModel';
import { styles } from './styles';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SectionTitle } from './components/SectionTitle';
import { KpiGrid } from './components/KpiGrid';
import { ComparisonTable } from './components/ComparisonTable';
import { ScenarioTable } from './components/ScenarioTable';
import { CashBarChart, StackedBarChart } from './components/Charts';

export type ReportOptions = {
  includeDetails?: boolean;
};

const Disclaimer = () => (
  <Text style={styles.muted}>
    Simulation informative — pas une recommandation d’investissement.
  </Text>
);

export const buildImpactFiscalPdf = (model: ImpactFiscalReportModel, options?: ReportOptions) => {
  const totalPages = options?.includeDetails ? 4 + model.scenarios.length : 4;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header meta={model.meta} title={model.title} />
        <View style={styles.section}>
          <SectionTitle>Hypothèses de simulation</SectionTitle>
          <View style={styles.infoBox}>
            {model.assumptions.map((line) => (
              <Text key={line}>{line}</Text>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <SectionTitle>Comparatif des structures</SectionTitle>
          <KpiGrid scenarios={model.scenarios} />
        </View>
        <View style={styles.section}>
          <SectionTitle>Lecture rapide</SectionTitle>
          <View style={styles.infoBox}>
            {model.quickRead.map((line) => (
              <Text key={line}>• {line}</Text>
            ))}
          </View>
        </View>
        <Disclaimer />
        <Footer page={1} total={totalPages} />
      </Page>

      <Page size="A4" style={styles.page}>
        <Header meta={model.meta} title="Synthèse comparatif" />
        <View style={styles.section}>
          <SectionTitle>Comparaison des scénarios</SectionTitle>
          <ComparisonTable scenarios={model.scenarios} />
          <Text style={styles.muted}>
            Chaque KPI mesure un impact fiscal ou de trésorerie. Lecture informative.
          </Text>
        </View>
        <Footer page={2} total={totalPages} />
      </Page>

      <Page size="A4" style={styles.page}>
        <Header meta={model.meta} title="Graphiques comparatifs" />
        <View style={styles.section}>
          <SectionTitle>Cash net annuel moyen (€/an)</SectionTitle>
          <CashBarChart
            data={model.scenarios.map(s => ({ label: s.label, value: s.cashNetAvgValue }))}
          />
        </View>
        <View style={styles.section}>
          <SectionTitle>Impôts cumulés (perso vs société)</SectionTitle>
          <StackedBarChart data={model.taxesSeries} />
        </View>
        <Footer page={3} total={totalPages} />
      </Page>

      {!options?.includeDetails && (
        <Page size="A4" style={styles.page}>
          <Header meta={model.meta} title="Hypothèses & Glossaire" />
          <View style={styles.section}>
            <SectionTitle>Hypothèses & limites</SectionTitle>
            <Text>• Rendement et revalorisation constants.</Text>
            <Text>• Fiscalité paramétrée, susceptible d’évolution.</Text>
            <Text>• Frais de souscription intégrés au prix de revient.</Text>
            {model.coherenceWarnings.length > 0 && (
              <View style={[styles.infoBox, { marginTop: 6 }]}>
                <Text>Contrôles de cohérence</Text>
                {model.coherenceWarnings.map(line => (
                  <Text key={line}>• {line}</Text>
                ))}
              </View>
            )}
          </View>
          <View style={styles.section}>
            <SectionTitle>Glossaire</SectionTitle>
            {model.glossary.map(line => (
              <Text key={line}>{line}</Text>
            ))}
          </View>
          <Footer page={4} total={totalPages} />
        </Page>
      )}

      {options?.includeDetails &&
        model.scenarios.map((scenario, index) => (
          <Page key={scenario.label} size="A4" style={styles.page}>
            <Header meta={model.meta} title={`Détails — ${scenario.label}`} />
            <View style={styles.section}>
              <SectionTitle>Lecture rapide</SectionTitle>
              <View style={styles.infoBox}>
                {scenario.quickNotes.map(note => (
                  <Text key={note}>• {note}</Text>
                ))}
              </View>
            </View>
            <View style={styles.section}>
              <SectionTitle>Tableau annuel (Essentiel)</SectionTitle>
              <ScenarioTable scenario={scenario} />
            </View>
            <Footer page={4 + index} total={totalPages} />
          </Page>
        ))}

      {options?.includeDetails && (
        <Page size="A4" style={styles.page}>
          <Header meta={model.meta} title="Hypothèses & Glossaire" />
          <View style={styles.section}>
            <SectionTitle>Hypothèses & limites</SectionTitle>
            <Text>• Rendement et revalorisation constants.</Text>
            <Text>• Fiscalité paramétrée, susceptible d’évolution.</Text>
            <Text>• Frais de souscription intégrés au prix de revient.</Text>
            {model.coherenceWarnings.length > 0 && (
              <View style={[styles.infoBox, { marginTop: 6 }]}>
                <Text>Contrôles de cohérence</Text>
                {model.coherenceWarnings.map(line => (
                  <Text key={line}>• {line}</Text>
                ))}
              </View>
            )}
          </View>
          <View style={styles.section}>
            <SectionTitle>Glossaire</SectionTitle>
            {model.glossary.map(line => (
              <Text key={line}>{line}</Text>
            ))}
          </View>
          <Footer page={totalPages} total={totalPages} />
        </Page>
      )}
    </Document>
  );
};
