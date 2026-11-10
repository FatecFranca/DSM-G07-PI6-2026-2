/**
 * HomeScreen — lista de municípios vinculados ao usuário.
 *
 * Modo demo (USE_DEMO=true): usa DEMO_REGIOES e não faz chamadas de rede.
 * Modo real  (USE_DEMO=false): chama GET /regioes com busca e paginação.
 *
 * Ao selecionar um município, chama onSelectRegiao para que o roteador
 * navegue para RegionDetailScreen.
 */
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api, ApiError, AuthResponse, Regiao } from '../api';
import { RegionCard } from '../components/RegionCard';
import { DEMO_REGIOES } from '../demo';
import { styles } from '../styles';

/** Alterne para false quando o backend estiver disponível. */
const USE_DEMO = true;

interface HomeScreenProps {
  session: AuthResponse;
  onSelectRegiao: (regiao: Regiao) => void;
  onLogout: () => Promise<void>;
}

export function HomeScreen({ session, onSelectRegiao, onLogout }: HomeScreenProps) {
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    if (USE_DEMO) {
      // Filtragem local dos dados de demo, simulando busca e paginação
      const filtered = DEMO_REGIOES.data.filter((r) =>
        r.nomeRegiao.toLowerCase().includes(query.toLowerCase()),
      );
      if (!cancelled) {
        setRegioes(filtered);
        setTotalPages(1);
        setLoading(false);
      }
      return () => { cancelled = true; };
    }

    api
      .regioes(session.accessToken, query, page)
      .then((response) => {
        if (cancelled) return;
        setRegioes(response.data);
        setTotalPages(response.totalPages);
        // Se a região selecionada sumiu da página atual, deseleciona
        setSelectedId((current) =>
          current && response.data.some((r) => r.id === current) ? current : null,
        );
      })
      .catch((reason: unknown) => {
        if (!cancelled)
          setError(
            reason instanceof ApiError
              ? reason.message
              : 'Não foi possível carregar os municípios.',
          );
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [session.accessToken, query, page]);

  function handleSelect(regiao: Regiao) {
    setSelectedId(regiao.id);
    onSelectRegiao(regiao);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>PAINEL {session.perfil}</Text>
            <Text style={styles.heading}>Municípios vinculados</Text>
          </View>
          <Pressable onPress={onLogout}>
            <Text style={styles.logout}>Sair</Text>
          </Pressable>
        </View>

        {/* Busca */}
        <TextInput
          placeholder="Buscar município"
          value={query}
          onChangeText={(v) => { setQuery(v); setPage(1); }}
          style={styles.input}
        />

        {/* Estados de lista */}
        {loading && <ActivityIndicator color="#166534" />}
        {!loading && error != null && <Text style={styles.error}>{error}</Text>}
        {!loading && error == null && regioes.length === 0 && (
          <Text style={styles.empty}>Nenhum município vinculado a esta conta.</Text>
        )}

        {/* Cards */}
        {regioes.map((regiao) => (
          <RegionCard
            key={regiao.id}
            regiao={regiao}
            selected={selectedId === regiao.id}
            onPress={handleSelect}
          />
        ))}

        {/* Paginação (oculta no modo demo pois totalPages=1) */}
        {totalPages > 1 && (
          <View style={styles.dataRow}>
            <Pressable disabled={page <= 1} onPress={() => setPage((p) => p - 1)}>
              <Text style={styles.cardAction}>Anterior</Text>
            </Pressable>
            <Text style={styles.cardText}>{page} / {totalPages}</Text>
            <Pressable disabled={page >= totalPages} onPress={() => setPage((p) => p + 1)}>
              <Text style={styles.cardAction}>Próxima</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}
