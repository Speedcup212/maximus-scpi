import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#111827'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 6,
    marginBottom: 12
  },
  headerTitle: { fontSize: 12, fontWeight: 'bold' },
  headerMeta: { textAlign: 'right', fontSize: 9, color: '#4B5563' },
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#6B7280'
  },
  h1: { fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  h2: { fontSize: 11, fontWeight: 'bold', marginBottom: 6 },
  section: { marginBottom: 12 },
  infoBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 6
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  card: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    padding: 8,
    marginRight: 8,
    marginBottom: 8
  },
  cardTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  badge: {
    backgroundColor: '#111827',
    color: '#FFFFFF',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    fontSize: 7
  },
  muted: { color: '#6B7280' },
  table: { borderWidth: 1, borderColor: '#E5E7EB' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F3F4F6' },
  tableRow: { flexDirection: 'row' },
  cell: { paddingVertical: 4, paddingHorizontal: 4, fontSize: 8 },
  colYear: { width: '10%' },
  colWide: { width: '15%' },
  colMid: { width: '12%' }
});
