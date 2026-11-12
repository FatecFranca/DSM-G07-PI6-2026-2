"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ApiError,
  Compatibilidade,
  Cultura,
  Page,
  Regiao,
  api,
} from "@/lib/api";
import { clearSession, readSession } from "@/lib/session";

type RankingItem = Compatibilidade & { regiao?: Regiao };
type RankingResponse = Page<Compatibilidade> & { aviso: string };

const UFS = ["ES", "MG", "SP"];
const MIN_OPTIONS = [
  { label: "Qualquer compatibilidade", value: 0 },
  { label: "Pelo menos 50%", value: 0.5 },
  { label: "Pelo menos 70%", value: 0.7 },
  { label: "Pelo menos 80%", value: 0.8 },
];
const LIMIT = 20;
const box = "border border-[#f3ead8]/10 bg-[#243824]/65 p-5";
const selectClass = "bg-[#182418] px-3 py-2 text-sm";

function describeError(error: unknown) {
  if (error instanceof ApiError && error.status === 401) {
    clearSession();
    window.location.replace("/login");
    return "";
  }
  return error instanceof ApiError
    ? error.message
    : "Não foi possível carregar o ranking.";
}

export default function RankingPage() {
  const [session, setSession] = useState<ReturnType<typeof readSession>>(null);
  const [ready, setReady] = useState(false);
  const [cultures, setCultures] = useState<Cultura[]>([]);
  const [crop, setCrop] = useState("");
  const [uf, setUf] = useState("");
  const [min, setMin] = useState(0);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<RankingResponse | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setSession(readSession());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      window.location.replace("/login");
      return;
    }
    let stop = false;
    api
      .culturas(session.accessToken)
      .then((items) => {
        if (!stop) setCultures(items);
      })
      .catch(() => {});
    return () => {
      stop = true;
    };
  }, [ready, session]);

  useEffect(() => {
    if (!ready || !session) return;
    let stop = false;
    setBusy(true);
    setError("");
    api
      .ranking(session.accessToken, {
        cultura: crop || undefined,
        uf: uf || undefined,
        min,
        page,
        limit: LIMIT,
      })
      .then((response) => {
        if (!stop) setResult(response);
      })
      .catch((requestError: unknown) => {
        if (!stop) setError(describeError(requestError));
      })
      .finally(() => {
        if (!stop) setBusy(false);
      });
    return () => {
      stop = true;
    };
  }, [ready, session, crop, uf, min, page]);

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#121c12] text-[#f3ead8]">
        Carregando…
      </main>
    );
  }
  if (!session) return null;

  const items = (result?.data ?? []) as RankingItem[];
  const offset = ((result?.page ?? page) - 1) * LIMIT;
  const totalPages = Math.max(1, result?.totalPages ?? 1);

  return (
    <main className="min-h-screen bg-[#121c12] p-5 text-[#f3ead8] lg:p-8">
      <header className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-[#d9cdb8]/80 transition hover:text-[#f3ead8]"
        >
          ← Voltar ao dashboard
        </Link>
        <p className="mt-4 text-xs uppercase tracking-widest text-[#c4a35a]">
          Compatibilidade exploratória
        </p>
        <h1 className="mt-2 text-4xl">Ranking de municípios por cultura</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#d9cdb8]/70">
          Municípios ordenados pela compatibilidade climática com cada cultura,
          segundo o modelo analítico do projeto.
        </p>
      </header>

      {error && (
        <p role="alert" className="mb-4 text-[#f0a7a0]">
          {error}
        </p>
      )}

      <section className="mb-5 grid gap-2 md:grid-cols-3">
        <select
          aria-label="Cultura"
          value={crop}
          onChange={(event) => {
            setCrop(event.target.value);
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="">Todas as culturas</option>
          {cultures.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.nome}
            </option>
          ))}
        </select>
        <select
          aria-label="UF"
          value={uf}
          onChange={(event) => {
            setUf(event.target.value);
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="">Todas as UFs</option>
          {UFS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          aria-label="Compatibilidade mínima"
          value={min}
          onChange={(event) => {
            setMin(Number(event.target.value));
            setPage(1);
          }}
          className={selectClass}
        >
          {MIN_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </section>

      <section className={box}>
        <div className="mb-3 flex justify-between text-xs uppercase text-[#c4a35a]">
          <span>Resultados</span>
          <span>{result?.total ?? 0}</span>
        </div>

        {busy ? (
          <p aria-live="polite">Carregando…</p>
        ) : items.length === 0 ? (
          <p>Nenhum município encontrado para os filtros escolhidos.</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Município</th>
                  <th>UF</th>
                  <th>Cultura</th>
                  <th className="min-w-40">Compatibilidade</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="border-t border-white/10">
                    <td className="py-2">{offset + index + 1}</td>
                    <td>{item.regiao?.nomeRegiao ?? item.regiaoId}</td>
                    <td>{item.regiao?.uf ?? "—"}</td>
                    <td>{item.cultura.nome}</td>
                    <td>
                      <span>{(item.compatibilidade * 100).toFixed(1)}%</span>
                      <div className="mt-1 h-1.5 bg-white/10" aria-hidden="true">
                        <div
                          className="h-1.5 bg-[#c4a35a]"
                          style={{
                            width:
                              Math.min(
                                100,
                                Math.max(0, item.compatibilidade * 100),
                              ) + "%",
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex justify-between text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Anterior
          </button>
          <span>
            {result?.page ?? page} / {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Próxima
          </button>
        </div>
      </section>

      <p className="mt-4 text-xs text-[#d9cdb8]/50">
        {result?.aviso ??
          "Compatibilidade exploratória; não é recomendação agronômica nem previsão de produtividade."}
      </p>
    </main>
  );
}
