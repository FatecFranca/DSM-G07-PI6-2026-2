import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  api,
  ApiError,
  AuthResponse,
  Climatologia,
  Compatibilidade,
  ClusterAssignment,
  Regiao,
  SafraRendimento,
} from './src/api';
import { clearSession, loadSession, saveSession } from './src/session';

export default function App() {
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    loadSession()
      .then(setSession)
      .finally(() => setCheckingSession(false));
  }, []);

  if (checkingSession) {
    return <LoadingScreen />;
  }

  if (!session) {
    return showRegister ? (
      <RegisterScreen onRegister={setSession} onBack={() => setShowRegister(false)} />
    ) : (
      <LoginScreen onLogin={setSession} onCreateAccount={() => setShowRegister(true)} />
    );
  }

  return (
    <HomeScreen
      session={session}
      onLogout={async () => {
        await clearSession();
        setSession(null);
      }}
    />
  );
}

function LoginScreen({
  onLogin,
  onCreateAccount,
}: {
  onLogin: (session: AuthResponse) => void;
  onCreateAccount: () => void;
}) {
  const [email, setEmail] = useState('tecnico@cafe-pi.local');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const response = await api.login(email.trim(), senha);
      await saveSession(response);
      onLogin(response);
    } catch (error) {
      Alert.alert(
        'Não foi possível entrar',
        error instanceof ApiError ? error.message : 'Verifique a conexão com a API.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>CAFÉ PI</Text>
        <Text style={styles.title}>Inteligência para sua produção</Text>
        <Text style={styles.subtitle}>Acesse dados de clima, produção e análise por município.</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="E-mail"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Senha"
          secureTextEntry
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
        />
        <Pressable disabled={loading} onPress={handleLogin} style={styles.primaryButton}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
        </Pressable>
        <Pressable onPress={onCreateAccount}>
          <Text style={styles.link}>Ainda não tem conta? Criar conta</Text>
        </Pressable>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function RegisterScreen({
  onRegister,
  onBack,
}: {
  onRegister: (session: AuthResponse) => void;
  onBack: () => void;
}) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!nome.trim() || !email.trim()) {
      Alert.alert('Preencha os campos', 'Informe seu nome e seu e-mail.');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Senha muito curta', 'A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmacao) {
      Alert.alert('Senhas diferentes', 'A confirmação precisa ser igual à senha.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.register(nome.trim(), email.trim(), senha);
      await saveSession(response);
      onRegister(response);
    } catch (error) {
      Alert.alert(
        'Não foi possível criar a conta',
        error instanceof ApiError ? error.message : 'Verifique a conexão com a API.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>CAFÉ PI</Text>
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>
          Cadastre-se para consultar clima, produção e análise por município.
        </Text>
        <TextInput
          autoCapitalize="words"
          placeholder="Nome completo"
          style={styles.input}
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="E-mail"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Senha (mínimo 6 caracteres)"
          secureTextEntry
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
        />
        <TextInput
          placeholder="Confirmar senha"
          secureTextEntry
          style={styles.input}
          value={confirmacao}
          onChangeText={setConfirmacao}
        />
        <Pressable disabled={loading} onPress={handleRegister} style={styles.primaryButton}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Criar conta</Text>}
        </Pressable>
        <Pressable onPress={onBack}>
          <Text style={styles.link}>Já tenho conta? Entrar</Text>
        </Pressable>
      </ScrollView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function HomeScreen({
  session,
  onLogout,
}: {
  session: AuthResponse;
  onLogout: () => Promise<void>;
}) {
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [municipioQuery, setMunicipioQuery] = useState('');
  const [municipioPage, setMunicipioPage] = useState(1);
  const [municipioPages, setMunicipioPages] = useState(1);
  const [selectedRegiao, setSelectedRegiao] = useState<Regiao | null>(null);
  const [clima, setClima] = useState<Climatologia|null>(null);
  const [safras, setSafras] = useState<SafraRendimento[]>([]);
  const [compatibilidades, setCompatibilidades] = useState<Compatibilidade[]>([]);
  const [clusters, setClusters] = useState<ClusterAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .regioes(session.accessToken, municipioQuery, municipioPage)
      .then((response) => {
        if (cancelled) return;
        setRegioes(response.data);
        setMunicipioPages(response.totalPages);
        setSelectedRegiao((current) => current && response.data.some((item) => item.id === current.id) ? current : null);
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof ApiError ? reason.message : 'Não foi possível carregar os municípios.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [session.accessToken, municipioQuery, municipioPage]);

  useEffect(() => {
    if (!selectedRegiao) {
      setClima(null);
      setSafras([]);
      return;
    }
    let cancelled = false;
    setDetailsLoading(true);
    setError(null);
    Promise.all([
      api.clima(selectedRegiao.id, session.accessToken),
      api.safras(selectedRegiao.id, session.accessToken),
      api.compatibilidades(selectedRegiao.id, session.accessToken),
      api.clusters(selectedRegiao.id, session.accessToken),
    ])
      .then(([climaResponse, safrasResponse, compatResponse, clusterResponse]) => {
        if (!cancelled) {
          setClima(climaResponse);
          setSafras(safrasResponse);
          setCompatibilidades(compatResponse);
          setClusters(clusterResponse);
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(
            reason instanceof ApiError
              ? reason.message
              : 'Não foi possível carregar os detalhes da região.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setDetailsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedRegiao, session.accessToken]);

  const latestClimate = clima;
  const latestHarvest = safras[safras.length - 1];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>PAINEL {session.perfil}</Text>
            <Text style={styles.heading}>Municípios vinculados</Text>
          </View>
          <Pressable onPress={onLogout}>
            <Text style={styles.logout}>Sair</Text>
          </Pressable>
        </View>
        <TextInput placeholder="Buscar município" value={municipioQuery} onChangeText={(value) => { setMunicipioQuery(value); setMunicipioPage(1); }} style={styles.input} />
        {loading && <ActivityIndicator color="#166534" />}
        {error && <Text style={styles.error}>{error}</Text>}
        {!loading && !error && regioes.length === 0 && (
          <Text style={styles.empty}>Nenhum município vinculado a esta conta.</Text>
        )}
        {regioes.map((regiao) => (
          <Pressable
            key={regiao.id}
            onPress={() => setSelectedRegiao(regiao)}
            style={[
              styles.card,
              selectedRegiao?.id === regiao.id && styles.selectedCard,
            ]}
          >
            <Text style={styles.cardTitle}>{regiao.nomeRegiao}</Text>
            <Text style={styles.cardText}>{regiao.pais}</Text>
            <Text style={styles.cardText}>
              {regiao.latitude ?? '—'}, {regiao.longitude ?? '—'}
            </Text>
            <Text style={styles.cardAction}>Ver clima, produção e compatibilidade →</Text>
          </Pressable>
        ))}
        {municipioPages > 1 && <View style={styles.dataRow}><Pressable disabled={municipioPage <= 1} onPress={() => setMunicipioPage((page) => page - 1)}><Text style={styles.cardAction}>Anterior</Text></Pressable><Text style={styles.cardText}>{municipioPage} / {municipioPages}</Text><Pressable disabled={municipioPage >= municipioPages} onPress={() => setMunicipioPage((page) => page + 1)}><Text style={styles.cardAction}>Próxima</Text></Pressable></View>}
        {selectedRegiao && (
          <View style={styles.details}>
            <View style={styles.detailsHeader}>
              <View>
                <Text style={styles.eyebrow}>DETALHES DA REGIÃO</Text>
                <Text style={styles.heading}>{selectedRegiao.nomeRegiao}</Text>
              </View>
              {detailsLoading && <ActivityIndicator color="#166534" />}
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
            {!detailsLoading && !error && (
              <>
                <View style={styles.metrics}>
                  <Metric label="Temperatura" value={latestClimate?.temperaturaMedia == null ? '—' : `${latestClimate.temperaturaMedia.toFixed(1)} °C`} />
                  <Metric label="Chuva" value={latestClimate?.chuvaAnual == null ? '—' : `${latestClimate.chuvaAnual.toFixed(0)} mm/ano`} />
                  <Metric label="Rendimento" value={latestHarvest?.rendimentoToneladasHectare == null ? '—' : `${latestHarvest.rendimentoToneladasHectare.toFixed(2)} t/ha`} />
                </View>
                <Text style={styles.sectionTitle}>Climatologia anual e sazonal</Text>
                {latestClimate ? (
                  <>
                    <View style={styles.dataRow}><Text style={styles.cardText}>Temperatura média</Text><Text style={styles.cardText}>{latestClimate.temperaturaMedia == null ? '—' : latestClimate.temperaturaMedia.toFixed(1) + ' °C'}</Text></View>
                    <View style={styles.dataRow}><Text style={styles.cardText}>Chuva anual estimada</Text><Text style={styles.cardText}>{latestClimate.chuvaAnual == null ? '—' : latestClimate.chuvaAnual.toFixed(0) + ' mm/ano'}</Text></View>
                    <View style={styles.dataRow}><Text style={styles.cardText}>Temperatura janeiro / julho</Text><Text style={styles.cardText}>{latestClimate.temperaturaJaneiro == null ? '—' : latestClimate.temperaturaJaneiro.toFixed(1)} / {latestClimate.temperaturaJulho == null ? '—' : latestClimate.temperaturaJulho.toFixed(1)} °C</Text></View>
                    <View style={styles.dataRow}><Text style={styles.cardText}>Umidade / radiação</Text><Text style={styles.cardText}>{latestClimate.umidade == null ? '—' : latestClimate.umidade.toFixed(0) + '%'} · {latestClimate.radiacaoSolar == null ? '—' : latestClimate.radiacaoSolar.toFixed(1)}</Text></View>
                    <Text style={styles.disclaimer}>Valores de climatologia anual e sazonal; não são medições do mês atual.</Text>
                  </>
                ) : <Text style={styles.cardText}>Nenhum dado climático para esta região.</Text>}
<Text style={styles.sectionTitle}>Safras disponíveis</Text>
                {safras.slice(-5).reverse().map((item) => (
                  <View key={item.id} style={styles.dataRow}>
                    <Text style={styles.cardText}>{item.anoColheita} · {item.cultura?.nome ?? 'Cultura não informada'}</Text>
                    <Text style={styles.cardText}>
                      {item.rendimentoToneladasHectare == null ? '—' : `${item.rendimentoToneladasHectare.toFixed(2)} t/ha`}
                    </Text>
                  </View>
                ))}
                {safras.length === 0 && <Text style={styles.cardText}>Nenhuma safra cadastrada.</Text>}
                <Text style={styles.sectionTitle}>Perfil climático</Text>
                {clusters.map((item) => <Text key={item.id} style={styles.cardText}>Grupo {item.grupo} · modelo {item.versaoModelo}{item.perfil?.nomeGrupo ? ' · ' + item.perfil.nomeGrupo : ''}</Text>)}
                <Text style={styles.sectionTitle}>Culturas compatíveis</Text>
                {compatibilidades.map((item) => (
                  <View key={item.id} style={styles.dataRow}><Text style={styles.cardText}>{item.cultura.nome}</Text><Text style={styles.cardText}>{(item.compatibilidade * 100).toFixed(1)}% · {item.versaoModelo}</Text></View>
                ))}
                {compatibilidades.length === 0 && <Text style={styles.cardText}>Resultados analíticos ainda não carregados.</Text>}
                <Text style={styles.disclaimer}>Compatibilidade exploratória; não é recomendação agronômica nem previsão de produtividade.</Text>
              </>
            )}
          </View>
        )}
      </ScrollView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function LoadingScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.center}>
        <ActivityIndicator color="#166534" size="large" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f7f5ef' },
  container: { flexGrow: 1, gap: 16, padding: 24 },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  eyebrow: { color: '#166534', fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  title: { color: '#17221a', fontSize: 34, fontWeight: '700', lineHeight: 40 },
  heading: { color: '#17221a', fontSize: 24, fontWeight: '700', marginTop: 6 },
  subtitle: { color: '#647067', fontSize: 16, lineHeight: 24, marginBottom: 18 },
  input: {
    backgroundColor: '#fff',
    borderColor: '#d9ded5',
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    padding: 15,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#166534',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  header: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  logout: { color: '#166534', fontWeight: '700', paddingTop: 5 },
  link: { color: '#166534', fontSize: 14, fontWeight: '700', paddingVertical: 8, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, gap: 5, padding: 18 },
  selectedCard: { borderColor: '#166534', borderWidth: 2 },
  cardTitle: { color: '#17221a', fontSize: 18, fontWeight: '700' },
  cardText: { color: '#647067', fontSize: 14 },
  cardAction: { color: '#166534', fontSize: 13, fontWeight: '700', marginTop: 8 },
  details: { backgroundColor: '#eef2ea', borderRadius: 16, gap: 12, padding: 18 },
  detailsHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  metrics: { flexDirection: 'row', gap: 8 },
  metric: { backgroundColor: '#fff', borderRadius: 10, flex: 1, gap: 4, padding: 10 },
  metricLabel: { color: '#647067', fontSize: 11 },
  metricValue: { color: '#17221a', fontSize: 15, fontWeight: '700' },
  sectionTitle: { color: '#17221a', fontSize: 14, fontWeight: '700', marginTop: 4 },
  dataRow: { borderBottomColor: '#d9ded5', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  disclaimer: { color: '#647067', fontSize: 12, lineHeight: 18, marginTop: 4 },
  error: { color: '#b42318', lineHeight: 21 },
  empty: { color: '#647067', fontSize: 16 },
});
