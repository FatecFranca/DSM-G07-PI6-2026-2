import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { apiConfig, getClimate, getHarvest, getRegions, login } from './src/api';
import { getMockAnalytics } from './src/mocks';
import { colors, spacing } from './src/theme';
import {
  clearSession,
  getCachedRegions,
  getSession,
  getSnapshot,
  saveRegions,
  saveSession,
  saveSnapshot,
} from './src/storage';
import type {
  AnalyticsSnapshot,
  ClimateRecord,
  HarvestRecord,
  Region,
  Session,
} from './src/types';

type Screen = 'regions' | 'detail';
type Snapshot = {
  regionId: number;
  climate: ClimateRecord[];
  harvest: HarvestRecord[];
  analytics: AnalyticsSnapshot;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${value}T12:00:00`));
}

function Button({
  children,
  onPress,
  secondary = false,
}: {
  children: React.ReactNode;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.buttonSecondaryText]}>{children}</Text>
    </Pressable>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.eyebrow}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.muted}>{detail}</Text>
    </View>
  );
}

function LoadingState({ label = 'Carregando seus dados...' }: { label?: string }) {
  return (
    <View style={styles.centerState}>
      <ActivityIndicator color={colors.forest} size="large" />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

function LoginScreen({ onLogin }: { onLogin: (session: Session) => void }) {
  const [email, setEmail] = useState('produtor@cafeinsight.demo');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || password.length < 4) {
      setError('Informe um e-mail e uma senha com pelo menos 4 caracteres.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const session = await login({ email: email.trim(), senha: password });
      await saveSession(session);
      onLogin(session);
    } catch {
      setError('Não foi possível entrar. Verifique a conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.loginContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>CI</Text>
        </View>
        <Text style={styles.kicker}>PLATAFORMA DE CAMPO</Text>
        <Text style={styles.loginTitle}>Clareza para cada safra.</Text>
        <Text style={styles.loginSubtitle}>
          Acompanhe clima, rendimento e os sinais da sua região em um só lugar.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Acessar conta</Text>
          <Text style={styles.inputLabel}>E-mail</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="voce@exemplo.com"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={email}
          />
          <Text style={styles.inputLabel}>Senha</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={setPassword}
            placeholder="Sua senha"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={styles.input}
            value={password}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {loading ? <LoadingState label="Autenticando..." /> : <Button onPress={handleLogin}>Entrar na plataforma</Button>}
        </View>
        <Text style={styles.demoNote}>
          Protótipo Sprint 1 · modo demonstração ativo
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function RegionsScreen({
  session,
  regions,
  offline,
  onSelect,
  onLogout,
}: {
  session: Session;
  regions: Region[];
  offline: boolean;
  onSelect: (region: Region) => void;
  onLogout: () => void;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.pageContainer}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.kicker}>BOM DIA, {session.perfil}</Text>
            <Text style={styles.pageTitle}>Suas regiões</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={onLogout} style={styles.avatar}>
            <Text style={styles.avatarText}>{session.email.slice(0, 1).toUpperCase()}</Text>
          </Pressable>
        </View>

        {offline ? (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineDot}>●</Text>
            <Text style={styles.offlineText}>Mostrando o último snapshot salvo.</Text>
          </View>
        ) : null}

        <View style={styles.heroPanel}>
          <View style={styles.heroAccent} />
          <Text style={styles.heroLabel}>VISÃO GERAL</Text>
          <Text style={styles.heroTitle}>Decisões melhores começam com dados próximos.</Text>
          <Text style={styles.heroBody}>Selecione uma região para acompanhar o pulso da sua lavoura.</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Regiões vinculadas</Text>
          <Text style={styles.sectionCount}>{regions.length.toString().padStart(2, '0')}</Text>
        </View>

        {regions.map((region) => (
          <Pressable
            accessibilityRole="button"
            key={region.id}
            onPress={() => onSelect(region)}
            style={({ pressed }) => [styles.regionCard, pressed && styles.pressed]}
          >
            <View style={styles.regionIcon}><Text style={styles.regionIconText}>↗</Text></View>
            <View style={styles.regionCopy}>
              <Text style={styles.regionName}>{region.nomeRegiao}</Text>
              <Text style={styles.muted}>{region.pais} · {region.latitude.toFixed(2)}°, {region.longitude.toFixed(2)}°</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailScreen({
  region,
  snapshot,
  offline,
  onBack,
}: {
  region: Region;
  snapshot: Snapshot;
  offline: boolean;
  onBack: () => void;
}) {
  const latestClimate = snapshot.climate.at(-1);
  const latestHarvest = snapshot.harvest.at(-1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.pageContainer}>
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹  Todas as regiões</Text>
        </Pressable>
        <Text style={styles.kicker}>{region.pais.toUpperCase()}</Text>
        <Text style={styles.pageTitle}>{region.nomeRegiao}</Text>
        <Text style={styles.muted}>Atualizado em 30 ago 2026</Text>

        {offline ? (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineDot}>●</Text>
            <Text style={styles.offlineText}>Dados salvos localmente · podem estar desatualizados</Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Agora na região</Text>
        <View style={styles.metricsGrid}>
          <MetricCard label="TEMPERATURA" value={`${latestClimate?.temperaturaMedia.toFixed(1) ?? '--'}°C`} detail="média recente" />
          <MetricCard label="UMIDADE" value={`${latestClimate?.umidade ?? '--'}%`} detail="último registro" />
          <MetricCard label="CHUVA" value={`${latestClimate?.precipitacao.toFixed(1) ?? '--'} mm`} detail="precipitação" />
          <MetricCard label="RENDIMENTO" value={`${latestHarvest?.rendimentoToneladasHectare.toFixed(1) ?? '--'} t/ha`} detail={`${latestHarvest?.anoColheita ?? '--'} · safra`} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Perfil analítico</Text>
          <View style={styles.mockPill}><Text style={styles.mockPillText}>DEMO</Text></View>
        </View>
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsRow}>
            <View style={styles.analyticsBadge}><Text style={styles.analyticsBadgeText}>C</Text></View>
            <View style={styles.analyticsCopy}>
              <Text style={styles.analyticsLabel}>CLUSTER CLIMÁTICO</Text>
              <Text style={styles.analyticsTitle}>{snapshot.analytics.cluster}</Text>
              <Text style={styles.muted}>{snapshot.analytics.clusterDescription}</Text>
            </View>
          </View>
          <View style={styles.analyticsDivider} />
          <View style={styles.predictionRow}>
            <View>
              <Text style={styles.analyticsLabel}>PREDIÇÃO DE PRODUTIVIDADE</Text>
              <Text style={styles.predictionValue}>{snapshot.analytics.prediction.toFixed(1)} <Text style={styles.predictionUnit}>t/ha</Text></Text>
            </View>
            <Text style={styles.predictionMargin}>± {snapshot.analytics.margin.toFixed(1)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Histórico de rendimento</Text>
        <View style={styles.harvestCard}>
          {snapshot.harvest.map((record, index) => (
            <View key={record.id} style={styles.harvestRow}>
              <Text style={styles.harvestYear}>{record.anoColheita}</Text>
              <View style={styles.barTrack}><View style={[styles.barFill, { width: `${Math.min(record.rendimentoToneladasHectare / 4 * 100, 100)}%` }]} /></View>
              <Text style={styles.harvestValue}>{record.rendimentoToneladasHectare.toFixed(1)}</Text>
              {index === snapshot.harvest.length - 1 ? <Text style={styles.currentTag}>ATUAL</Text> : null}
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Clima recente</Text>
        <View style={styles.climateCard}>
          {snapshot.climate.map((record) => (
            <View key={record.id} style={styles.climateRow}>
              <Text style={styles.climateDate}>{formatDate(record.data)}</Text>
              <Text style={styles.climateValue}>{record.temperaturaMedia.toFixed(1)}°C</Text>
              <Text style={styles.climateSecondary}>{record.precipitacao.toFixed(1)} mm</Text>
              <Text style={styles.climateSecondary}>{record.umidade}%</Text>
            </View>
          ))}
        </View>
        <Text style={styles.footerNote}>Cluster e predição serão conectados aos módulos analíticos nas próximas sprints.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [screen, setScreen] = useState<Screen>('regions');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function restore() {
      const savedSession = await getSession();
      if (savedSession) {
        setSession(savedSession);
        await loadRegions(savedSession);
      }
      setLoading(false);
    }
    void restore();
  }, []);

  async function loadRegions(currentSession: Session) {
    try {
      const data = await getRegions(currentSession.accessToken);
      setRegions(data);
      await saveRegions(data);
      setOffline(false);
    } catch {
      const cached = await getCachedRegions();
      if (cached.length) {
        setRegions(cached);
        setOffline(true);
      } else {
        setError('Não foi possível carregar suas regiões.');
      }
    }
  }

  async function openRegion(region: Region) {
    if (!session) return;
    setSelectedRegion(region);
    setScreen('detail');
    setDetailLoading(true);
    setError('');
    try {
      const [climate, harvest] = await Promise.all([
        getClimate(region.id, session.accessToken),
        getHarvest(region.id, session.accessToken),
      ]);
      const nextSnapshot = {
        regionId: region.id,
        climate,
        harvest,
        analytics: getMockAnalytics(region.id),
      };
      setSnapshot(nextSnapshot);
      await saveSnapshot(nextSnapshot);
      setOffline(false);
    } catch {
      const cached = await getSnapshot<Snapshot>();
      if (cached?.regionId === region.id) {
        setSnapshot(cached);
        setOffline(true);
      } else {
        setError('Não foi possível carregar os dados desta região.');
      }
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleLogout() {
    await clearSession();
    setSession(null);
    setRegions([]);
    setSelectedRegion(null);
    setSnapshot(null);
    setScreen('regions');
  }

  if (loading) {
    return <SafeAreaView style={styles.safeArea}><LoadingState /></SafeAreaView>;
  }

  if (!session) return <LoginScreen onLogin={(nextSession) => { setSession(nextSession); void loadRegions(nextSession); }} />;

  if (screen === 'detail' && selectedRegion) {
    if (detailLoading || !snapshot) return <SafeAreaView style={styles.safeArea}><LoadingState label="Organizando os dados da região..." /></SafeAreaView>;
    return <DetailScreen region={selectedRegion} snapshot={snapshot} offline={offline} onBack={() => setScreen('regions')} />;
  }

  return (
    <>
      <RegionsScreen session={session} regions={regions} offline={offline} onSelect={openRegion} onLogout={handleLogout} />
      {error ? <Text style={styles.globalError}>{error}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  loginContainer: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  pageContainer: { padding: spacing.lg, paddingBottom: 48 },
  brandMark: { alignItems: 'center', backgroundColor: colors.forest, borderRadius: 18, height: 64, justifyContent: 'center', marginBottom: spacing.lg, width: 64 },
  brandMarkText: { color: colors.gold, fontSize: 22, fontWeight: '800', letterSpacing: 1 },
  kicker: { color: colors.soil, fontSize: 11, fontWeight: '800', letterSpacing: 1.6, marginBottom: spacing.xs },
  loginTitle: { color: colors.ink, fontSize: 38, fontWeight: '800', lineHeight: 43, maxWidth: 300 },
  loginSubtitle: { color: colors.muted, fontSize: 16, lineHeight: 23, marginTop: spacing.sm, maxWidth: 330 },
  formCard: { backgroundColor: colors.paper, borderColor: colors.line, borderRadius: 18, borderWidth: 1, marginTop: spacing.xl, padding: spacing.lg },
  formTitle: { color: colors.ink, fontSize: 20, fontWeight: '800', marginBottom: spacing.lg },
  inputLabel: { color: colors.ink, fontSize: 12, fontWeight: '700', marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { backgroundColor: colors.cream, borderColor: colors.line, borderRadius: 10, borderWidth: 1, color: colors.ink, fontSize: 16, paddingHorizontal: 14, paddingVertical: 13 },
  button: { alignItems: 'center', backgroundColor: colors.forest, borderRadius: 10, justifyContent: 'center', marginTop: spacing.lg, minHeight: 52, paddingHorizontal: spacing.md },
  buttonSecondary: { backgroundColor: colors.forestLight },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: '800' },
  buttonSecondaryText: { color: colors.forest },
  pressed: { opacity: 0.72 },
  errorText: { color: colors.danger, fontSize: 13, lineHeight: 18, marginTop: spacing.sm },
  demoNote: { color: colors.muted, fontSize: 12, marginTop: spacing.lg, textAlign: 'center' },
  centerState: { alignItems: 'center', flex: 1, gap: spacing.sm, justifyContent: 'center', padding: spacing.xl },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
  pageTitle: { color: colors.ink, fontSize: 31, fontWeight: '800', lineHeight: 37 },
  avatar: { alignItems: 'center', backgroundColor: colors.forestLight, borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  avatarText: { color: colors.forest, fontSize: 17, fontWeight: '800' },
  offlineBanner: { alignItems: 'center', backgroundColor: '#fff1d6', borderRadius: 10, flexDirection: 'row', marginBottom: spacing.md, padding: spacing.sm },
  offlineDot: { color: colors.gold, fontSize: 12, marginRight: spacing.sm },
  offlineText: { color: colors.soil, flex: 1, fontSize: 12, fontWeight: '700' },
  heroPanel: { backgroundColor: colors.forest, borderRadius: 18, marginBottom: spacing.xl, overflow: 'hidden', padding: spacing.lg },
  heroAccent: { backgroundColor: colors.gold, height: 5, left: 0, position: 'absolute', top: 0, width: 74 },
  heroLabel: { color: '#b8d0bd', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: spacing.sm, marginTop: spacing.xs },
  heroTitle: { color: colors.white, fontSize: 23, fontWeight: '800', lineHeight: 29, maxWidth: 300 },
  heroBody: { color: '#d5e2d7', fontSize: 14, lineHeight: 20, marginTop: spacing.sm },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm, marginTop: spacing.sm },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '800', marginBottom: spacing.sm, marginTop: spacing.lg },
  sectionCount: { color: colors.soil, fontSize: 15, fontWeight: '800' },
  regionCard: { alignItems: 'center', backgroundColor: colors.paper, borderColor: colors.line, borderRadius: 14, borderWidth: 1, flexDirection: 'row', marginBottom: spacing.sm, minHeight: 82, padding: spacing.md },
  regionIcon: { alignItems: 'center', backgroundColor: colors.forestLight, borderRadius: 12, height: 42, justifyContent: 'center', marginRight: spacing.md, width: 42 },
  regionIconText: { color: colors.forest, fontSize: 22, fontWeight: '700' },
  regionCopy: { flex: 1 },
  regionName: { color: colors.ink, fontSize: 16, fontWeight: '800', marginBottom: 3 },
  chevron: { color: colors.moss, fontSize: 30, fontWeight: '300', marginLeft: spacing.sm },
  backButton: { alignSelf: 'flex-start', marginBottom: spacing.xl },
  backText: { color: colors.forest, fontSize: 14, fontWeight: '800' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metricCard: { backgroundColor: colors.paper, borderColor: colors.line, borderRadius: 14, borderWidth: 1, minHeight: 110, padding: spacing.md, width: '48%' },
  eyebrow: { color: colors.soil, fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginBottom: spacing.sm },
  metricValue: { color: colors.ink, fontSize: 24, fontWeight: '800', marginBottom: 4 },
  mockPill: { backgroundColor: '#fff1d6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  mockPillText: { color: colors.soil, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  analyticsCard: { backgroundColor: colors.paper, borderColor: colors.line, borderRadius: 16, borderWidth: 1, padding: spacing.md },
  analyticsRow: { alignItems: 'center', flexDirection: 'row' },
  analyticsBadge: { alignItems: 'center', backgroundColor: colors.forest, borderRadius: 14, height: 48, justifyContent: 'center', marginRight: spacing.md, width: 48 },
  analyticsBadgeText: { color: colors.gold, fontSize: 22, fontWeight: '800' },
  analyticsCopy: { flex: 1 },
  analyticsLabel: { color: colors.soil, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  analyticsTitle: { color: colors.ink, fontSize: 16, fontWeight: '800', marginBottom: 3 },
  analyticsDivider: { backgroundColor: colors.line, height: 1, marginVertical: spacing.md },
  predictionRow: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' },
  predictionValue: { color: colors.forest, fontSize: 31, fontWeight: '800' },
  predictionUnit: { fontSize: 15, fontWeight: '700' },
  predictionMargin: { color: colors.moss, fontSize: 13, fontWeight: '700', marginBottom: 5 },
  harvestCard: { backgroundColor: colors.paper, borderColor: colors.line, borderRadius: 16, borderWidth: 1, padding: spacing.md },
  harvestRow: { alignItems: 'center', flexDirection: 'row', minHeight: 42 },
  harvestYear: { color: colors.ink, fontSize: 13, fontWeight: '700', width: 42 },
  barTrack: { backgroundColor: colors.forestLight, borderRadius: 5, flex: 1, height: 9, overflow: 'hidden' },
  barFill: { backgroundColor: colors.moss, borderRadius: 5, height: '100%' },
  harvestValue: { color: colors.ink, fontSize: 13, fontWeight: '800', marginLeft: spacing.sm, textAlign: 'right', width: 32 },
  currentTag: { color: colors.soil, fontSize: 9, fontWeight: '800', marginLeft: spacing.sm, width: 35 },
  climateCard: { backgroundColor: colors.paper, borderColor: colors.line, borderRadius: 16, borderWidth: 1, padding: spacing.md },
  climateRow: { alignItems: 'center', borderBottomColor: colors.line, borderBottomWidth: 1, flexDirection: 'row', minHeight: 42 },
  climateDate: { color: colors.ink, fontSize: 13, width: 76 },
  climateValue: { color: colors.forest, fontSize: 14, fontWeight: '800', width: 68 },
  climateSecondary: { color: colors.muted, flex: 1, fontSize: 12, textAlign: 'right' },
  footerNote: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: spacing.lg },
  globalError: { backgroundColor: '#ffe6e2', bottom: 18, color: colors.danger, left: 18, padding: spacing.sm, position: 'absolute', right: 18, textAlign: 'center' },
});
