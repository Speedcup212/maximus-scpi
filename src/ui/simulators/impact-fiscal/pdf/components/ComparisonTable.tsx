import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { styles } from '../styles';
import { ReportScenario } from '../reportModel';

export const ComparisonTable = ({ scenarios }: { scenarios: ReportScenario[] }) => (
  <View style={styles.table}>
    <View style={styles.tableHeader}>
      {['Structure', 'Cash net', 'Impôts perso', 'Impôts société', 'Valeur nette', 'Impôt sortie', 'TRI net'].map(label => (
        <Text key={label} style={[styles.cell, styles.colWide]}>{label}</Text>
      ))}
    </View>
    {scenarios.map((scenario, idx) => (
      <View key={scenario.label} style={[styles.tableRow, idx % 2 === 0 ? { backgroundColor: '#F9FAFB' } : {}]}>
        <Text style={[styles.cell, styles.colWide]}>
          {scenario.label}
          {scenario.isBestCash ? ' • Cash+' : ''}
          {scenario.isBestNet ? ' • Net+' : ''}
        </Text>
        <Text style={[styles.cell, styles.colWide]}>{scenario.cashNetAvg}</Text>
        <Text style={[styles.cell, styles.colWide]}>
          {scenario.taxesPersonalLabel} : {scenario.taxesPersonal}
        </Text>
        <Text style={[styles.cell, styles.colWide]}>{scenario.taxesCorporate}</Text>
        <Text style={[styles.cell, styles.colWide]}>{scenario.netWorthAfterExit}</Text>
        <Text style={[styles.cell, styles.colWide]}>{scenario.exitTax}</Text>
        <Text style={[styles.cell, styles.colWide]}>{scenario.irrNet}</Text>
      </View>
    ))}
  </View>
);
