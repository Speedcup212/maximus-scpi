import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { styles } from '../styles';
import { ReportMeta } from '../reportModel';

export const Header = ({ meta, title }: { meta: ReportMeta; title: string }) => (
  <View style={styles.header}>
    <View>
      <Text style={styles.headerTitle}>MaximusSCPI</Text>
      <Text>{title}</Text>
    </View>
    <View>
      <Text style={styles.headerMeta}>Simulation: {meta.simulationId}</Text>
      <Text style={styles.headerMeta}>{meta.dateLabel}</Text>
    </View>
  </View>
);
