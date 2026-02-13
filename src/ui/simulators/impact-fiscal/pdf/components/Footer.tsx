import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { styles } from '../styles';

export const Footer = ({ page, total }: { page: number; total: number }) => (
  <View style={styles.footer} fixed>
    <Text>Simulation informative — pas une recommandation</Text>
    <Text>Page {page} / {total}</Text>
  </View>
);
