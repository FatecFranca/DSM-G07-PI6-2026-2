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
import { api, ApiError, AuthResponse, Regiao } from './src/api';
import { clearSession, loadSession, saveSession } from './src/session';

export default function App() {
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    loadSession()
      .then(setSession)
      .finally(() => setCheckingSession(false));
  }, []);

  if (checkingSession) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <LoginScreen onLogin={setSession} />;
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

function LoginScreen({ onLogin }: { onLogin: (session: AuthResponse) => void }) {
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
        <Text style={styles.subtitle}>Acesse os dados climáticos e de produtividade.</Text>
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
      </View>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .regioes(session.accessToken)
      .then(setRegioes)
      .catch((reason: unknown) => {
        setError(reason instanceof ApiError ? reason.message : 'Não foi possível carregar as regiões.');
      })
      .finally(() => setLoading(false));
  }, [session.accessToken]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>PAINEL {session.perfil}</Text>
            <Text style={styles.heading}>Regiões produtoras</Text>
          </View>
          <Pressable onPress={onLogout}>
            <Text style={styles.logout}>Sair</Text>
          </Pressable>
        </View>
        {loading && <ActivityIndicator color="#166534" />}
        {error && <Text style={styles.error}>{error}</Text>}
        {!loading && !error && regioes.length === 0 && (
          <Text style={styles.empty}>Nenhuma região cadastrada.</Text>
        )}
        {regioes.map((regiao) => (
          <View key={regiao.id} style={styles.card}>
            <Text style={styles.cardTitle}>{regiao.nomeRegiao}</Text>
            <Text style={styles.cardText}>{regiao.pais}</Text>
            <Text style={styles.cardText}>
              {regiao.latitude ?? '—'}, {regiao.longitude ?? '—'}
            </Text>
          </View>
        ))}
      </ScrollView>
      <StatusBar style="dark" />
    </SafeAreaView>
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
  card: { backgroundColor: '#fff', borderRadius: 16, gap: 5, padding: 18 },
  cardTitle: { color: '#17221a', fontSize: 18, fontWeight: '700' },
  cardText: { color: '#647067', fontSize: 14 },
  error: { color: '#b42318', lineHeight: 21 },
  empty: { color: '#647067', fontSize: 16 },
});
