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
  const [session] = useState(() => readSession());
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [clima, setClima] = useState<CondicaoClimatica[]>([]);
  const [safras, setSafras] = useState<SafraRendimento[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) {
      window.location.replace("/login");
      return;
    }

    let cancelled = false;
    Promise.all([api.regioes(session.accessToken), api.clusters(session.accessToken)])
      .then(([regionsResponse, clustersResponse]) => {
        if (cancelled) return;
        setRegioes(regionsResponse);
        setSelectedId((current) => current || regionsResponse[0]?.id || "");
        setClusters(clustersResponse.clusters);
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
  }, [session]);

  useEffect(() => {
    if (!session || !selectedId) return;

    let cancelled = false;
    setIsDetailLoading(true);
    Promise.all([
      api.clima(selectedId, session.accessToken),
      api.safras(selectedId, session.accessToken),
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
  }, [selectedId, session]);

  const selectedRegion = useMemo(
    () => regioes.find((region) => region.id === selectedId),
    [regioes, selectedId],
  );
  const selectedCluster = clusters.find((cluster) =>
    cluster.regioes.some((region) => region.regiaoId === selectedId),
  );
  const latestClimate = clima[clima.length - 1];
  const latestHarvest = safras[safras.length - 1];

  function logout() {
    clearSession();
    window.location.replace("/login");
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
                      {formatNumber(latestClimate?.temperaturaMedia ?? null, "°C")}
                    </strong>
                  </article>
                  <article className="border border-[#f3ead8]/10 bg-[#243824]/65 p-5">
                    <span className="block text-xs uppercase tracking-[0.08em] text-[#d9cdb8]/70">Precipitação</span>
                    <strong className="mt-3 block text-2xl font-medium">
                      {formatNumber(latestClimate?.precipitacao ?? null, " mm")}
                    </strong>
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
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="mt-5 border border-[#f3ead8]/10 bg-[#243824]/65 p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-[#c4a35a]">Perfil climático preliminar</h2>
                <span className="text-xs text-[#d9cdb8]/70">K-Means · k=2</span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {clusters.map((cluster) => (
                  <div key={cluster.cluster} className="flex items-center gap-3 border border-[#f3ead8]/8 bg-[#0f1a0f]/30 px-4 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#c4a35a]" />
                    <div>
                      <strong className="block text-sm">Cluster {cluster.cluster + 1}</strong>
                      <small className="mt-1 block text-xs text-[#d9cdb8]/70">
                        Centroide de {cluster.centroideTemperaturaMedia.toFixed(1)}°C
                      </small>
                    </div>
                    <span className="ml-auto text-xs text-[#d9cdb8]/70">{cluster.regioes.length} regiões</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
