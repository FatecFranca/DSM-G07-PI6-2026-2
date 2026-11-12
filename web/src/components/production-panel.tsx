"use client";

import { useState } from "react";
import type { SafraRendimento } from "@/lib/api";
import BarChart from "./bar-chart";

type ProductionPanelProps = {
  harvests: SafraRendimento[];
  className: string;
};

function formatNumber(value: number | null, digits = 1) {
  return value == null
    ? "—"
    : value.toLocaleString("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: digits,
      });
}

export default function ProductionPanel({ harvests, className }: ProductionPanelProps) {
  const [selected, setSelected] = useState("");

  const options = Array.from(
    new Map(
      harvests.map((item) => [
        item.cultura?.slug ?? "legado",
        item.cultura?.nome ?? "Legado",
      ]),
    ),
  ).map(([slug, nome]) => ({ slug, nome }));

  const active = options.some((option) => option.slug === selected)
    ? selected
    : (options[0]?.slug ?? "");

  const rows = harvests
    .filter((item) => (item.cultura?.slug ?? "legado") === active)
    .sort((a, b) => a.anoColheita - b.anoColheita);

  return (
    <article className={className}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[#c4a35a]">Produção por cultura e ano</h3>
        {options.length > 0 && (
          <label className="flex items-center gap-2 text-xs text-[#d9cdb8]/70">
            Cultura
            <select
              aria-label="Cultura da produção"
              value={active}
              onChange={(event) => setSelected(event.target.value)}
              className="bg-[#182418] px-3 py-2 text-sm text-[#f3ead8]"
            >
              {options.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.nome}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {rows.length === 0 ? (
        <p>Safras ainda não carregadas.</p>
      ) : (
        <>
          <BarChart
            title="Rendimento por ano (t/ha)"
            unit="t/ha"
            decimals={2}
            data={rows.map((item) => ({
              label: String(item.anoColheita),
              value: item.rendimentoToneladasHectare,
            }))}
          />
          <div className="mt-5 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th>Ano</th>
                  <th>Área (ha)</th>
                  <th>Produção (t)</th>
                  <th>Rendimento (t/ha)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id} className="border-t border-white/10">
                    <td className="py-2">{item.anoColheita}</td>
                    <td>{formatNumber(item.areaColhidaHa)}</td>
                    <td>{formatNumber(item.producaoT)}</td>
                    <td>{formatNumber(item.rendimentoToneladasHectare, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </article>
  );
}
