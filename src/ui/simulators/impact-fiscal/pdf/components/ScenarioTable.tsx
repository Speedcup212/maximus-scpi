import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { styles } from '../styles';
import { ReportScenario } from '../reportModel';

export const ScenarioTable = ({ scenario }: { scenario: ReportScenario }) => (
  <View style={styles.table}>
    <View style={styles.tableHeader}>
      {['Année', 'Revenus', 'Net perso', 'Tréso société', 'CRD', 'Valeur parts', 'Valeur nette'].map(label => (
        <Text key={label} style={[styles.cell, styles.colWide]}>{label}</Text>
      ))}
    </View>
    {scenario.tableRows.map((row, idx) => (
      <View key={row.year} style={[styles.tableRow, idx % 2 === 0 ? { backgroundColor: '#F9FAFB' } : {}]}>
        <Text style={[styles.cell, styles.colYear]}>{row.year}</Text>
        <Text style={[styles.cell, styles.colWide]}>{row.revenues}</Text>
        <Text style={[styles.cell, styles.colWide]}>{row.netPersonal}</Text>
        <Text style={[styles.cell, styles.colWide]}>{row.cashCompany}</Text>
        <Text style={[styles.cell, styles.colMid]}>{row.remainingDebt}</Text>
        <Text style={[styles.cell, styles.colWide]}>{row.partValue}</Text>
        <Text style={[styles.cell, styles.colWide]}>{row.netWorth}</Text>
      </View>
    ))}
  </View>
);
