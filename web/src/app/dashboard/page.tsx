"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ApiError,
  Cluster,
  CondicaoClimatica,
  Regiao,
  SafraRendimento,
  api,
} from "@/lib/api";
import { clearSession, readSession } from "@/lib/session";

function formatNumber(value: number | null, suffix = "") {
  return value === null ? "—" : `${value.toFixed(1)}${suffix}`;
}

export default function DashboardPage() {
  const [session, setSession] = useState<ReturnType<typeof readSession>>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [clima, setClima] = useState<CondicaoClimatica[]>([]);
  const [safras, setSafras] = useState<SafraRendimento[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [clusterQuality, setClusterQuality] = useState<{
    metrica: string;
    valor: number | null;
    observacao: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [climateFrom, setClimateFrom] = useState("");
  const [climateTo, setClimateTo] = useState("");
  const [harvestYear, setHarvestYear] = useState("");

  useEffect(() => {
    setSession(readSession());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || !session) {
      if (isHydrated) {
        window.location.replace("/login");
      }
      return;
    }

    let cancelled = false;
    Promise.all([api.regioes(session.accessToken), api.clusters(session.accessToken)])
      .then(([regionsResponse, clustersResponse]) => {
        if (cancelled) return;
        setRegioes(regionsResponse);
        setSelectedId((current) => current || regionsResponse[0]?.id || "");
        setClusters(clustersResponse.clusters);
        setClusterQuality(clustersResponse.qualidade);
      })
      .catch((requestError: unknown) => {
        if (cancelled) return;
        if (requestError instanceof ApiError && requestError.status === 401) {
          clearSession();
          window.location.replace("/login");
          return;
        }
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "Não foi possível carregar os dados do dashboard.",
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isHydrated, session]);

  useEffect(() => {
    if (!session || !selectedId) return;

    let cancelled = false;
    setIsDetailLoading(true);
    setError("");
    Promise.all([
      api.clima(selectedId, session.accessToken, {
        de: climateFrom || undefined,
        ate: climateTo || undefined,
      }),
      api.safras(
        selectedId,
        session.accessToken,
        harvestYear ? Number(harvestYear) : undefined,
      ),
    ])
      .then(([climaResponse, safrasResponse]) => {
        if (cancelled) return;
        setClima(climaResponse);
        setSafras(safrasResponse);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setError(
            requestError instanceof ApiError
              ? requestError.message
              : "Não foi possível carregar os detalhes da região.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsDetailLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [climateFrom, climateTo, harvestYear, selectedId, session]);

  const selectedRegion = useMemo(
    () => regioes.find((region) => region.id === selectedId),
    [regioes, selectedId],
  );
  const selectedCluster = clusters.find((cluster) =>
    cluster.regioes.some((region) => region.regiaoId === selectedId),
  );
  const latestHarvest = safras[safras.length - 1];
  const climateAverage = useMemo(() => {
    const values = clima
      .map((item) => item.temperaturaMedia)
      .filter((value): value is number => value !== null);
    return values.length
      ? values.reduce((total, value) => total + value, 0) / values.length
      : null;
  }, [clima]);
  const totalRain = useMemo(
    () =>
      clima.reduce(
        (total, item) => total + (item.precipitacao ?? 0),
        0,
      ),
    [clima],
  );

  function logout() {
    clearSession();
    window.location.replace("/login");
  }

  if (!isHydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#121c12] text-sm text-[#d9cdb8]">
        Carregando sessão...
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#121c12] text-[#f3ead8] lg:grid-cols-[260px_1fr]">
      <aside className="flex flex-col gap-6 border-b border-[#f3ead8]/10 bg-[#182418] p-5 lg:border-r lg:border-b-0">
        <Link href="/" className="font-[family-name:var(--font-display)] text-xl">
          Café PI
        </Link>
        <div className="grid gap-1 border-y border-[#f3ead8]/10 py-4 text-xs text-[#d9cdb8]">
          <span>Usuário autenticado</span>
          <strong className="break-all text-sm text-[#f3ead8]">{session.email}</strong>
        </div>
        <nav className="flex flex-col gap-2 text-sm">
          <span className="border-l-2 border-[#c4a35a] px-3 py-2 text-[#c4a35a]">Regiões</span>
          <span className="px-3 py-2 text-[#d9cdb8]/70">Clima</span>
          <span className="px-3 py-2 text-[#d9cdb8]/70">Safra</span>
          <button className="px-3 py-2 text-left text-[#d9cdb8]/80 hover:text-[#f3ead8]" type="button" onClick={logout}>
            Sair
          </button>
          <Link className="px-3 py-2 text-[#d9cdb8]/80 hover:text-[#f3ead8]" href="/">Voltar à landing</Link>
        </nav>
      </aside>

      <main className="p-6 lg:p-8">
        <header className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#c4a35a]">Visão operacional</p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-medium">Dashboard</h1>
            <p className="mt-2 max-w-xl text-sm text-[#d9cdb8]/80">
              Dados reais da API NestJS para clima, safra e perfil climático.
            </p>
          </div>
          {selectedRegion && (
            <div className="border border-[#f3ead8]/10 bg-[#243824]/65 px-4 py-3">
              <span className="block text-xs uppercase tracking-[0.1em] text-[#d9cdb8]/70">Região selecionada</span>
              <strong className="mt-1 block text-lg">{selectedRegion.nomeRegiao}</strong>
            </div>
          )}
        </header>

        {error && <p className="mb-5 border border-[#f0a7a0]/30 bg-[#f0a7a0]/10 px-4 py-3 text-sm text-[#f0a7a0]">{error}</p>}
        {isLoading ? (
          <div className="border border-dashed border-[#f3ead8]/25 p-8 text-center text-sm text-[#d9cdb8]">Carregando regiões e clusters...</div>
        ) : regioes.length === 0 ? (
          <div className="border border-dashed border-[#f3ead8]/25 p-8 text-center text-sm text-[#d9cdb8]">Nenhuma região disponível.</div>
        ) : (
          <>
            <section className="grid gap-5 xl:grid-cols-[280px_1fr]">
              <div className="border border-[#f3ead8]/10 bg-[#243824]/65 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-[#c4a35a]">Regiões produtoras</h2>
                  <span className="text-xs text-[#d9cdb8]/70">{regioes.length} cadastradas</span>
                </div>
                <div className="grid gap-2">
                  {regioes.map((region) => (
                    <button
                      type="button"
                      key={region.id}
                      className={`border-l-2 px-3 py-3 text-left text-sm transition ${
                        selectedId === region.id
                          ? "border-[#c4a35a] bg-[#c4a35a]/12"
                          : "border-transparent bg-[#0f1a0f]/45 hover:border-[#c4a35a]/60"
                      }`}
                      onClick={() => setSelectedId(region.id)}
                    >
                      <span className="block">{region.nomeRegiao}</span>
                      <small className="mt-1 block text-xs text-[#d9cdb8]/65">{region.pais}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid content-start gap-5">
                <div className="grid gap-3 md:grid-cols-3">
                  <article className="border border-[#f3ead8]/10 bg-[#243824]/65 p-5">
                    <span className="block text-xs uppercase tracking-[0.08em] text-[#d9cdb8]/70">Temperatura média</span>
                    <strong className="mt-3 block text-2xl font-medium">
                      {formatNumber(climateAverage, "°C")}
                    </strong>
                    <small className="mt-1 block text-xs text-[#d9cdb8]/60">média do período</small>
                  </article>
                  <article className="border border-[#f3ead8]/10 bg-[#243824]/65 p-5">
                    <span className="block text-xs uppercase tracking-[0.08em] text-[#d9cdb8]/70">Precipitação</span>
                    <strong className="mt-3 block text-2xl font-medium">
                      {formatNumber(totalRain, " mm")}
                    </strong>
                    <small className="mt-1 block text-xs text-[#d9cdb8]/60">acumulado do período</small>
                  </article>
                  <article className="border border-[#f3ead8]/10 bg-[#243824]/65 p-5">
                    <span className="block text-xs uppercase tracking-[0.08em] text-[#d9cdb8]/70">Rendimento</span>
                    <strong className="mt-3 block text-2xl font-medium">
                      {formatNumber(
                        latestHarvest?.rendimentoToneladasHectare ?? null,
                        " t/ha",
                      )}
                    </strong>
                  </article>
                </div>

                <div className="border border-[#f3ead8]/10 bg-[#243824]/65 p-5">
                  <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-[#c4a35a]">Filtros de análise</h2>
                      <p className="mt-1 text-xs text-[#d9cdb8]/65">Consulte somente o período necessário sem alterar os dados originais.</p>
                    </div>
                    <button
                      type="button"
                      className="text-left text-xs text-[#c4a35a] hover:text-[#f3ead8] sm:text-right"
                      onClick={() => {
                        setClimateFrom("");
                        setClimateTo("");
                        setHarvestYear("");
                      }}
                    >
                      Limpar filtros
                    </button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="grid gap-1 text-xs text-[#d9cdb8]/70">
                      Clima a partir de
                      <input
                        type="date"
                        value={climateFrom}
                        onChange={(event) => setClimateFrom(event.target.value)}
                        className="border border-[#f3ead8]/15 bg-[#0f1a0f]/60 px-3 py-2 text-sm text-[#f3ead8]"
                      />
                    </label>
                    <label className="grid gap-1 text-xs text-[#d9cdb8]/70">
                      Clima até
                      <input
                        type="date"
                        value={climateTo}
                        onChange={(event) => setClimateTo(event.target.value)}
                        className="border border-[#f3ead8]/15 bg-[#0f1a0f]/60 px-3 py-2 text-sm text-[#f3ead8]"
                      />
                    </label>
                    <label className="grid gap-1 text-xs text-[#d9cdb8]/70">
                      Ano da safra
                      <input
                        type="number"
                        min="1900"
                        max="2100"
                        placeholder="Todos"
                        value={harvestYear}
                        onChange={(event) => setHarvestYear(event.target.value)}
                        className="border border-[#f3ead8]/15 bg-[#0f1a0f]/60 px-3 py-2 text-sm text-[#f3ead8] placeholder:text-[#d9cdb8]/35"
                      />
                    </label>
                  </div>
                </div>

                <div className="border border-[#f3ead8]/10 bg-[#243824]/65 p-5">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-[#c4a35a]">Detalhes da região</h2>
                    {isDetailLoading && <span className="text-xs text-[#d9cdb8]/70">Atualizando...</span>}
                  </div>
                  {selectedRegion && (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <span className="block text-xs uppercase tracking-[0.08em] text-[#d9cdb8]/65">País</span>
                        <strong className="mt-1 block">{selectedRegion.pais}</strong>
                      </div>
                      <div>
                        <span className="block text-xs uppercase tracking-[0.08em] text-[#d9cdb8]/65">Cluster climático</span>
                        <strong className="mt-1 block">
                          {selectedCluster
                            ? `Cluster ${selectedCluster.cluster + 1}`
                            : "Sem dados"}
                        </strong>
                      </div>
                      <div>
                        <span className="block text-xs uppercase tracking-[0.08em] text-[#d9cdb8]/65">Última safra</span>
                        <strong className="mt-1 block">{latestHarvest?.anoColheita ?? "—"}</strong>
                      </div>
                      <div>
                        <span className="block text-xs uppercase tracking-[0.08em] text-[#d9cdb8]/65">Observações climáticas</span>
                        <strong className="mt-1 block">{clima.length}</strong>
                      </div>
                      <div>
                        <span className="block text-xs uppercase tracking-[0.08em] text-[#d9cdb8]/65">Período consultado</span>
                        <strong className="mt-1 block text-sm">
                          {clima.length ? `${clima[0].data.slice(0, 10)} a ${clima[clima.length - 1].data.slice(0, 10)}` : "Sem dados"}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-2">
              <div className="border border-[#f3ead8]/10 bg-[#243824]/65 p-5">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-[#c4a35a]">Série de temperatura</h2>
                    <p className="mt-1 text-xs text-[#d9cdb8]/60">Média diária retornada pela API</p>
                  </div>
                  <span className="text-xs text-[#d9cdb8]/70">{clima.length} pontos</span>
                </div>
                {clima.length === 0 ? (
                  <p className="text-sm text-[#d9cdb8]/70">Nenhum dado climático para os filtros selecionados.</p>
                ) : (
                  <div className="flex h-36 items-end gap-1 overflow-hidden">
                    {clima.slice(-30).map((item) => {
                      const value = item.temperaturaMedia ?? 0;
                      const height = Math.max(8, Math.min(100, (value / 40) * 100));
                      return (
                        <div key={item.id} className="group flex min-w-2 flex-1 flex-col justify-end" title={`${item.data.slice(0, 10)}: ${formatNumber(item.temperaturaMedia, "°C")}`}>
                          <div className="bg-[#c4a35a] transition group-hover:bg-[#f3ead8]" style={{ height: `${height}%` }} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border border-[#f3ead8]/10 bg-[#243824]/65 p-5">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-[#c4a35a]">Histórico de safra</h2>
                    <p className="mt-1 text-xs text-[#d9cdb8]/60">Rendimento informado pela API</p>
                  </div>
                  <span className="text-xs text-[#d9cdb8]/70">{safras.length} safras</span>
                </div>
                {safras.length === 0 ? (
                  <p className="text-sm text-[#d9cdb8]/70">Nenhuma safra para o ano selecionado.</p>
                ) : (
                  <div className="grid gap-2">
                    {safras.map((harvest) => (
                      <div key={harvest.id} className="flex items-center justify-between border-b border-[#f3ead8]/8 py-2 text-sm last:border-0">
                        <span>{harvest.anoColheita}</span>
                        <span className="text-[#c4a35a]">{formatNumber(harvest.rendimentoToneladasHectare, " t/ha")}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-4 text-xs leading-5 text-[#d9cdb8]/55">A produtividade da CONAB é uma referência agregada por UF, não uma medição individual da propriedade.</p>
              </div>
            </section>

            <section className="mt-5 border border-[#f3ead8]/10 bg-[#243824]/65 p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-[#c4a35a]">Perfil climático preliminar</h2>
                <span className="text-xs text-[#d9cdb8]/70">K-Means · k=2</span>
              </div>
              {clusterQuality && (
                <p className="mb-4 border-l-2 border-[#c4a35a] bg-[#0f1a0f]/30 px-3 py-2 text-xs leading-5 text-[#d9cdb8]/70">
                  {clusterQuality.metrica}: {clusterQuality.valor === null ? "aguardando cálculo no pipeline analítico" : clusterQuality.valor.toFixed(3)}. {clusterQuality.observacao}
                </p>
              )}
              <div className="grid gap-2 md:grid-cols-2">
                {clusters.map((cluster) => (
                  <div key={cluster.cluster} className="flex items-center gap-3 border border-[#f3ead8]/8 bg-[#0f1a0f]/30 px-4 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#c4a35a]" />
                    <div>
                      <strong className="block text-sm">Cluster {cluster.cluster + 1}</strong>
                      <small className="mt-1 block text-xs text-[#d9cdb8]/70">
                        {cluster.centroide.temperaturaMedia.toFixed(1)}°C ·{" "}
                        {cluster.centroide.precipitacaoMedia.toFixed(0)} mm de chuva
                      </small>
                    </div>
                    <span className="ml-auto text-xs text-[#d9cdb8]/70">{cluster.regioes.length} regiões</span>
                  </div>
                ))}
              </div>
              {clusters.length === 0 && <p className="text-sm text-[#d9cdb8]/70">Ainda não há dados suficientes para formar os clusters.</p>}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
