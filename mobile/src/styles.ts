/**
 * StyleSheet compartilhado entre todas as telas e componentes.
 * Extraído do App.tsx original sem alteração de valores.
 */
import { StyleSheet } from 'react-native';

export const colors = {
  brand: '#166534',
  ink: '#17221a',
  muted: '#647067',
  border: '#d9ded5',
  bg: '#f7f5ef',
  white: '#fff',
  detailBg: '#eef2ea',
  error: '#b42318',
} as const;

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, gap: 16, padding: 24 },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },

  eyebrow: { color: colors.brand, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  title: { color: colors.ink, fontSize: 34, fontWeight: '700', lineHeight: 40 },
  heading: { color: colors.ink, fontSize: 24, fontWeight: '700', marginTop: 6 },
  subtitle: { color: colors.muted, fontSize: 16, lineHeight: 24, marginBottom: 18 },

  input: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    padding: 15,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '700' },

  header: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  logout: { color: colors.brand, fontWeight: '700', paddingTop: 5 },
  link: { color: colors.brand, fontSize: 14, fontWeight: '700', paddingVertical: 8, textAlign: 'center' },

  card: { backgroundColor: colors.white, borderRadius: 16, gap: 5, padding: 18 },
  selectedCard: { borderColor: colors.brand, borderWidth: 2 },
  cardTitle: { color: colors.ink, fontSize: 18, fontWeight: '700' },
  cardText: { color: colors.muted, fontSize: 14 },
  cardAction: { color: colors.brand, fontSize: 13, fontWeight: '700', marginTop: 8 },

  details: { backgroundColor: colors.detailBg, borderRadius: 16, gap: 12, padding: 18 },
  detailsHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  metrics: { flexDirection: 'row', gap: 8 },
  metric: { backgroundColor: colors.white, borderRadius: 10, flex: 1, gap: 4, padding: 10 },
  metricLabel: { color: colors.muted, fontSize: 11 },
  metricValue: { color: colors.ink, fontSize: 15, fontWeight: '700' },

  sectionTitle: { color: colors.ink, fontSize: 14, fontWeight: '700', marginTop: 4 },
  dataRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  disclaimer: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  error: { color: colors.error, lineHeight: 21 },
  empty: { color: colors.muted, fontSize: 16 },
});
