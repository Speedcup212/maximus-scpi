import React from 'react';
import { Text } from '@react-pdf/renderer';
import { styles } from '../styles';

export const SectionTitle = ({ children }: { children: string }) => (
  <Text style={styles.h2}>{children}</Text>
);
