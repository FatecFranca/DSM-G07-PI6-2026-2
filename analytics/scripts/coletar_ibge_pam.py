"""Coleta a Produção Agrícola Municipal (PAM) do IBGE para as culturas do projeto.

Fonte: IBGE/SIDRA, tabelas 1612 (lavouras temporárias) e 1613 (lavouras
permanentes), via API de agregados. Para cada município e ano traz área
colhida, quantidade produzida e rendimento médio.

Saída (formato longo): cod, municipio, uf, cultura, ano, area_colhida_ha,
producao_t, rendimento_kg_ha.
"""

from __future__ import annotations

import argparse
import gzip
import json
import time
import urllib.request
from pathlib import Path

import pandas as pd

BASE = "https://servicodados.ibge.gov.br/api/v3/agregados"
# cultura -> (tabela, classificação, categoria)
CULTURAS = {
    "Café": (1613, 82, 2723),
    "Laranja": (1613, 82, 2733),
    "Cana-de-açúcar": (1612, 81, 2696),
    "Soja": (1612, 81, 2713),
    "Milho": (1612, 81, 2711),
    "Feijão": (1612, 81, 2702),
}
VARIAVEIS = {216: "area_colhida_ha", 214: "producao_t", 112: "rendimento_kg_ha"}
UFS = {31: "MG", 32: "ES", 35: "SP"}


def get(url: str):
    for tentativa in range(4):
        try:
            request = urllib.request.Request(
                url, headers={"User-Agent": "cafe-pi-analytics/1.0", "Accept-Encoding": "gzip"}
            )
            with urllib.request.urlopen(request, timeout=180) as response:
                dados = response.read()
            if dados[:2] == b"\x1f\x8b":
                dados = gzip.decompress(dados)
            return json.loads(dados.decode("utf-8"))
        except Exception:
            if tentativa == 3:
                raise
            time.sleep(3 * (tentativa + 1))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path("data/raw/pam_culturas_municipios.csv"))
    parser.add_argument("--ano-inicio", type=int, default=2001)
    parser.add_argument("--ano-fim", type=int, default=2024)
    args = parser.parse_args()

    anos = "|".join(str(a) for a in range(args.ano_inicio, args.ano_fim + 1))
    linhas = []
    for cultura, (tabela, classif, categoria) in CULTURAS.items():
        for uf_cod, uf in UFS.items():
            # uma variável por consulta: a API recusa consultas com valores demais
            respostas = []
            for codigo in VARIAVEIS:
                url = (
                    f"{BASE}/{tabela}/periodos/{anos}/variaveis/{codigo}"
                    f"?localidades=N6[N3[{uf_cod}]]&classificacao={classif}[{categoria}]"
                )
                respostas.extend(get(url))
            for variavel in respostas:
                nome = VARIAVEIS[int(variavel["id"])]
                for resultado in variavel["resultados"]:
                    for serie in resultado["series"]:
                        local = serie["localidade"]
                        for ano, valor in serie["serie"].items():
                            linhas.append(
                                {
                                    "cod": int(local["id"]),
                                    "municipio": local["nome"].rsplit(" - ", 1)[0],
                                    "uf": uf,
                                    "cultura": cultura,
                                    "ano": int(ano),
                                    "variavel": nome,
                                    "valor": valor,
                                }
                            )
            print(cultura, uf, "ok", len(linhas))

    longo = pd.DataFrame(linhas)
    longo["valor"] = pd.to_numeric(longo["valor"], errors="coerce")
    largo = longo.pivot_table(
        index=["cod", "municipio", "uf", "cultura", "ano"], columns="variavel", values="valor"
    ).reset_index()
    largo.columns.name = None
    args.output.parent.mkdir(parents=True, exist_ok=True)
    largo.to_csv(args.output, index=False)
    print(f"{len(largo)} linhas salvas em {args.output}")


if __name__ == "__main__":
    main()
