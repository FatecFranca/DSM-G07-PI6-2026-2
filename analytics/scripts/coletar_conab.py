"""Converte a série histórica oficial de café da CONAB em CSV por UF e ano.

Fonte: CONAB, "Café total (arábica e conilon) - série histórica".
O pacote agrobr não oferece café em `conab.safras`, por isso o arquivo oficial
da CONAB é baixado e a aba "Produtividade" (sacas beneficiadas por hectare) é
convertida para toneladas por hectare (1 saca = 60 kg).

Saída: CSV com uf, anoColheita, produtividadeSacasHectare,
rendimentoToneladasHectare e fonte.
"""

from __future__ import annotations

import argparse
import urllib.request
from pathlib import Path

import pandas as pd

URL = (
    "https://www.gov.br/conab/pt-br/atuacao/informacoes-agropecuarias/safras/"
    "series-historicas/cafe/total-arabica-e-conilon/cafetotalseriehist.xls"
)
KG_POR_SACA = 60


def baixar(destino: Path) -> None:
    destino.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(URL, headers={"User-Agent": "cafe-pi-analytics/1.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        destino.write_bytes(response.read())


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--xls", type=Path, default=Path("data/raw/conab_cafe_total.xls"))
    parser.add_argument("--output", type=Path, default=Path("data/raw/safra_conab.csv"))
    parser.add_argument("--baixar", action="store_true", help="Baixa o XLS da CONAB antes de converter")
    args = parser.parse_args()

    if args.baixar or not args.xls.exists():
        baixar(args.xls)

    tabela = pd.read_excel(args.xls, sheet_name="Produtividade", header=None)
    cabecalho = tabela.index[tabela[0].astype(str).str.startswith("UNIDADE DA FEDERA")][0]
    anos = tabela.iloc[cabecalho, 1:]
    dados = tabela.iloc[cabecalho + 1:].copy()
    dados.columns = ["uf"] + list(anos)
    dados = dados[dados["uf"].astype(str).str.fullmatch(r"[A-Z]{2}")]

    longo = dados.melt(id_vars="uf", var_name="anoColheita", value_name="produtividadeSacasHectare")
    longo["anoColheita"] = pd.to_numeric(longo["anoColheita"], errors="coerce")
    longo["produtividadeSacasHectare"] = pd.to_numeric(longo["produtividadeSacasHectare"], errors="coerce")
    longo = longo.dropna()
    longo["anoColheita"] = longo["anoColheita"].astype(int)
    longo["rendimentoToneladasHectare"] = longo["produtividadeSacasHectare"] * KG_POR_SACA / 1000
    longo["fonte"] = "CONAB"

    args.output.parent.mkdir(parents=True, exist_ok=True)
    longo.sort_values(["uf", "anoColheita"]).to_csv(args.output, index=False)
    print(f"{len(longo)} linhas salvas em {args.output}")


if __name__ == "__main__":
    main()
