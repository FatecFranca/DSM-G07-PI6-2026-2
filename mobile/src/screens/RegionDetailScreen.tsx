/**
 * RegionDetailScreen — detalhe completo de um município.
 *
 * Seções:
 *   1. Métricas rápidas (temperatura, chuva, rendimento)
 *   2. Climatologia anual e sazonal
 *   3. Safras disponíveis (últimas 5)
 *   4. Perfil climático (clusters)
 *   5. Culturas compatíveis
 *   6. Previsões de produtividade  ← nova seção
 *
 * Modo demo (USE_DEMO=true): carrega DEMO_DETAILS[regiao.id] sem rede.
 * Modo real  (USE_DEMO=false): faz Promise.all com as 5 chamadas de API.
 *
 * O backend lança 404 quando não há predições — tratado como estado vazio,
 * não como erro fatal, para não bloquear as outras seções.
 */
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { api, ApiError, Regiao } from '../api';
import { Metric } from '../components/Metric';
import { DEMO_DETAILS } from '../demo';
import { styles } from '../styles';
import type { RegionDetail } from '../types';

/** Alterne para false quando o backend estiver disponível. */
const USE_DEMO = true;

interface RegionDetailScreenProps {
  regiao: Regiao;
  token: string;
  onBack: () => void;
}

const EMPTY_DETAIL: RegionDetail = {
  clima: null,
  safras: [],
  compatibilidades: [],
  clusters: [],
  predicoes: [],
};

export function RegionDetailScreen({ regiao, token, onBack }: RegionDetailScreenProps) {
  const [detail, setDetail] = useState<RegionDetail>(EMPTY_DETAIL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    if (USE_DEMO) {
      const data = DEMO_DETAILS[regiao.id] ?? EMPTY_DETAIL;
      if (!cancelled) {
        setDetail(data);
        setLoading(false);
      }
      return () => { cancelled = true; };
    }

    // Modo real: busca predições separadamente para tratar 404 como vazio
    Promise.all([
      api.clima(regiao.id, token),
      api.safras(regiao.id, token),
      api.compatibilidades(regiao.id, token),
      api.clusters(regiao.id, token),
      // Predições: 404 é estado válido (nenhuma publicada ainda)
      api.predicoes(regiao.id, token).catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }),
    ])
      .then(([clima, safras, compatibilidades, clusters, predicaoResponse]) => {
        if (!cancelled) {
          setDetail({
            clima,
            safras,
            compatibilidades,
            clusters,
            predicoes: predicaoResponse?.previsoes ?? [],
          });
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled)
          setError(
            reason instanceof ApiError
              ? reason.message
              : 'Não foi possível carregar os detalhes da região.',
          );
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [regiao.id, token]);

  const { clima, safras, compatibilidades, clusters, predicoes } = detail;
  const latestHarvest = safras.at(-1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Cabeçalho com botão de voltar */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>DETALHES DA REGIÃO</Text>
            <Text style={styles.heading}>{regiao.nomeRegiao}</Text>
            {regiao.uf != null && (
              <Text style={styles.cardText}>{regiao.uf} · {regiao.codigoIbge ?? '—'}</Text>
            )}
          </View>
          <Pressable onPress={onBack}>
            <Text style={styles.logout}>← Voltar</Text>
          </Pressable>
        </View>

        {loading && <ActivityIndicator color="#166534" />}
        {!loading && error != null && <Text style={styles.error}>{error}</Text>}

        {!loading && error == null && (
          <View style={styles.details}>
            {/* ── 1. Métricas rápidas ── */}
            <View style={styles.metrics}>
              <Metric
                label="Temperatura"
                value={
                  clima?.temperaturaMedia == null
                    ? '—'
                    : `${clima.temperaturaMedia.toFixed(1)} °C`
                }
              />
              <Metric
                label="Chuva"
                value={
                  clima?.chuvaAnual == null
                    ? '—'
                    : `${clima.chuvaAnual.toFixed(0)} mm/ano`
                }
              />
              <Metric
                label="Rendimento"
                value={
                  latestHarvest?.rendimentoToneladasHectare == null
                    ? '—'
                    : `${latestHarvest.rendimentoToneladasHectare.toFixed(2)} t/ha`
                }
              />
            </View>

            {/* ── 2. Climatologia ── */}
            <Text style={styles.sectionTitle}>Climatologia anual e sazonal</Text>
            {clima != null ? (
              <>
                <View style={styles.dataRow}>
                  <Text style={styles.cardText}>Temperatura média</Text>
                  <Text style={styles.cardText}>
                    {clima.temperaturaMedia == null ? '—' : `${clima.temperaturaMedia.toFixed(1)} °C`}
                  </Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.cardText}>Chuva anual estimada</Text>
                  <Text style={styles.cardText}>
                    {clima.chuvaAnual == null ? '—' : `${clima.chuvaAnual.toFixed(0)} mm/ano`}
                  </Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.cardText}>Temperatura jan / jul</Text>
                  <Text style={styles.cardText}>
                    {clima.temperaturaJaneiro == null ? '—' : clima.temperaturaJaneiro.toFixed(1)}
                    {' / '}
                    {clima.temperaturaJulho == null ? '—' : clima.temperaturaJulho.toFixed(1)} °C
                  </Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.cardText}>Umidade / radiação</Text>
                  <Text style={styles.cardText}>
                    {clima.umidade == null ? '—' : `${clima.umidade.toFixed(0)}%`}
                    {' · '}
                    {clima.radiacaoSolar == null ? '—' : clima.radiacaoSolar.toFixed(1)}
                  </Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.cardText}>Amplitude térmica</Text>
                  <Text style={styles.cardText}>
                    {clima.amplitudeTermica == null ? '—' : `${clima.amplitudeTermica.toFixed(1)} °C`}
                  </Text>
                </View>
                {clima.periodoInicio != null && clima.periodoFim != null && (
                  <Text style={styles.disclaimer}>
                    Climatologia de longo prazo ({clima.periodoInicio}–{clima.periodoFim}).
                    Não são medições do mês atual.
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.cardText}>Nenhum dado climático para esta região.</Text>
            )}

            {/* ── 3. Safras ── */}
            <Text style={styles.sectionTitle}>Safras disponíveis</Text>
            {safras.length === 0 ? (
              <Text style={styles.cardText}>Nenhuma safra cadastrada.</Text>
            ) : (
              safras.slice(-5).reverse().map((item) => (
                <View key={item.id} style={styles.dataRow}>
                  <Text style={styles.cardText}>
                    {item.anoColheita} · {item.cultura?.nome ?? 'Cultura não informada'}
                  </Text>
                  <Text style={styles.cardText}>
                    {item.rendimentoToneladasHectare == null
                      ? '—'
                      : `${item.rendimentoToneladasHectare.toFixed(2)} t/ha`}
                  </Text>
                </View>
              ))
            )}

            {/* ── 4. Clusters ── */}
            <Text style={styles.sectionTitle}>Perfil climático</Text>
            {clusters.length === 0 ? (
              <Text style={styles.cardText}>Perfil climático ainda não calculado.</Text>
            ) : (
              clusters.map((item) => (
                <Text key={item.id} style={styles.cardText}>
                  Grupo {item.grupo} · modelo {item.versaoModelo}
                  {item.perfil?.nomeGrupo != null ? ` · ${item.perfil.nomeGrupo}` : ''}
                </Text>
              ))
            )}

            {/* ── 5. Compatibilidades ── */}
            <Text style={styles.sectionTitle}>Culturas compatíveis</Text>
            {compatibilidades.length === 0 ? (
              <Text style={styles.cardText}>Resultados analíticos ainda não carregados.</Text>
            ) : (
              compatibilidades.map((item) => (
                <View key={item.id} style={styles.dataRow}>
                  <Text style={styles.cardText}>{item.cultura.nome}</Text>
                  <Text style={styles.cardText}>
                    {(item.compatibilidade * 100).toFixed(1)}% · {item.versaoModelo}
                  </Text>
                </View>
              ))
            )}
            <Text style={styles.disclaimer}>
              Compatibilidade exploratória; não é recomendação agronômica nem previsão
              de produtividade.
            </Text>

            {/* ── 6. Previsões de produtividade ── */}
            <Text style={styles.sectionTitle}>Previsões de produtividade</Text>
            {predicoes.length === 0 ? (
              <Text style={styles.cardText}>
                Nenhuma previsão de produtividade publicada para este município.
              </Text>
            ) : (
              predicoes.map((item) => (
                <View key={item.id} style={styles.dataRow}>
                  <Text style={styles.cardText}>
                    {item.ano} · {item.cultura.nome}
                  </Text>
                  <Text style={styles.cardText}>
                    {item.valor.toFixed(2)} {item.unidade}
                  </Text>
                </View>
              ))
            )}
            {predicoes.length > 0 && (
              <Text style={styles.disclaimer}>
                {predicoes[0].aviso}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}
