"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError, Regiao, SafraRendimento, api } from "@/lib/api";
import { clearSession, readSession } from "@/lib/session";

function formatNumber(value: number | null, suffix = "") {
  return value === null ? "—" : `${value.toFixed(1)}${suffix}`;
}

export default function SafraPage() {
  const [session] = useState(() => readSession());
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [safras, setSafras] = useState<SafraRendimento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) {
      window.location.replace("/login");
      return;
    }

    let cancelled = false;
    api
      .regioes(session.accessToken)
      .then((response) => {
        if (cancelled) return;
        setRegioes(response);
        setSelectedId((current) => current || response[0]?.id || "");
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
            : "Não foi possível carregar as regiões.",
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
    api
      .safras(selectedId, session.accessToken)
      .then((response) => {
        if (!cancelled) setSafras(response);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setError(
            requestError instanceof ApiError
              ? requestError.message
              : "Não foi possível carregar o histórico de safras.",
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

  if (!session) {
    return null;
  }

  const bestHarvest = safras.reduce<SafraRendimento | null>((best, item) => {
    if (item.rendimentoToneladasHectare === null) return best;
    if (!best || (best.rendimentoToneladasHectare ?? 0) < item.rendimentoToneladasHectare) {
      return item;
    }
    return best;
  }, null);

  return (
    <main className="min-h-screen bg-[#121c12] p-6 text-[#f3ead8] lg:p-8">
      <header className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div>
          <Link
            href="/dashboard"
            className="mb-3 inline-block text-sm text-[#d9cdb8]/80 hover:text-[#f3ead8]"
          >
            Voltar ao dashboard
          </Link>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-medium">
            Histórico de safras
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[#d9cdb8]/80">
            Rendimento do café em toneladas por hectare, ano a ano.
          </p>
        </div>
        {regioes.length > 0 && (
          <label className="grid gap-1 text-xs text-[#d9cdb8]/70">
            Região
            <select
              className="border border-[#f3ead8]/20 bg-[#182418] px-3 py-2 text-sm text-[#f3ead8]"
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              {regioes.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.nomeRegiao} ({region.pais})
                </option>
              ))}
            </select>
          </label>
        )}
      </header>

      {error && (
        <p className="mb-5 border border-[#f0a7a0]/30 bg-[#f0a7a0]/10 px-4 py-3 text-sm text-[#f0a7a0]">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="border border-dashed border-[#f3ead8]/25 p-8 text-center text-sm text-[#d9cdb8]">
          Carregando regiões...
        </div>
      ) : regioes.length === 0 ? (
        <div className="border border-dashed border-[#f3ead8]/25 p-8 text-center text-sm text-[#d9cdb8]">
          Nenhuma região cadastrada ainda.
        </div>
      ) : (
        <section className="border border-[#f3ead8]/10 bg-[#243824]/65 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-[#c4a35a]">
              {safras.length} safras registradas
            </h2>
            {bestHarvest && (
              <span className="text-xs text-[#d9cdb8]/80">
                Melhor ano: {bestHarvest.anoColheita} (
                {formatNumber(bestHarvest.rendimentoToneladasHectare, " t/ha")})
              </span>
            )}
            {isDetailLoading && (
              <span className="text-xs text-[#d9cdb8]/70">Atualizando...</span>
            )}
          </div>

          {safras.length === 0 && !isDetailLoading ? (
            <p className="text-sm text-[#d9cdb8]/80">
              Esta região ainda não tem safras registradas.
            </p>
          ) : (
            <div className="max-h-[60vh] overflow-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="sticky top-0 bg-[#182418] text-xs text-[#d9cdb8]/70">
                  <tr>
                    <th className="px-3 py-2 font-medium">Ano da colheita</th>
                    <th className="px-3 py-2 font-medium">Dias de crescimento</th>
                    <th className="px-3 py-2 font-medium">Rendimento</th>
                  </tr>
                </thead>
                <tbody>
                  {safras.map((item) => (
                    <tr key={item.id} className="border-t border-[#f3ead8]/8">
                      <td className="px-3 py-2">{item.anoColheita}</td>
                      <td className="px-3 py-2">{item.diasCrescimento ?? "—"}</td>
                      <td className="px-3 py-2">
                        {formatNumber(item.rendimentoToneladasHectare, " t/ha")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
