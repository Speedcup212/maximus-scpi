import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { styles } from '../styles';
import { ReportScenario } from '../reportModel';

export const KpiGrid = ({ scenarios }: { scenarios: ReportScenario[] }) => (
  <View style={styles.grid}>
    {scenarios.map(scenario => (
      <View key={scenario.label} style={styles.card}>
        <Text style={styles.cardTitle}>{scenario.label}</Text>
        <View style={styles.cardRow}>
          <Text>Cash net moyen</Text>
          <Text>{scenario.cashNetAvg}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text>{scenario.taxesPersonalLabel}</Text>
          <Text>{scenario.taxesPersonal}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text>Impôts société (hors sortie)</Text>
          <Text>{scenario.taxesCorporate}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text>Valeur nette après sortie</Text>
          <Text>{scenario.netWorthAfterExit}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text>Impôt de sortie estimé</Text>
          <Text>{scenario.exitTax}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text>TRI net</Text>
          <Text>{scenario.irrNet}</Text>
        </View>
        <View style={[styles.cardRow, { marginTop: 4 }]}>
          {scenario.isBestCash && <Text style={styles.badge}>Meilleur cash net</Text>}
          {scenario.isBestNet && <Text style={styles.badge}>Meilleure valeur nette</Text>}
        </View>
      </View>
    ))}
  </View>
);
