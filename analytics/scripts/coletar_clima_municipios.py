"""Coleta a climatologia da NASA POWER para os municípios de ES, MG e SP.

Para cada município usa a latitude e a longitude do centro do município
(lista pública `kelvins/municipios-brasileiros`) e consulta a climatologia
mensal da NASA POWER (médias de longo prazo). O script retoma de onde parou:
municípios já presentes no arquivo de saída não são consultados de novo.

Saída: cod, temp_media, temp_min, chuva_mm_dia, umidade, radiacao, temp_jan,
temp_jul, temp_min_jul, chuva_seca (jun-ago) e chuva_verao (dez-fev).
"""

from __future__ import annotations

import argparse
import json
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np
import pandas as pd

MUNICIPIOS_URL = (
    "https://raw.githubusercontent.com/kelvins/municipios-brasileiros/main/csv/municipios.csv"
)
PARAMETROS = "T2M,T2M_MIN,PRECTOTCORR,RH2M,ALLSKY_SFC_SW_DWN"
UFS = {31: "MG", 32: "ES", 35: "SP"}


def consultar(linha) -> dict | None:
    query = urllib.parse.urlencode(
        {
            "parameters": PARAMETROS,
            "community": "AG",
            "longitude": linha.longitude,
            "latitude": linha.latitude,
            "format": "JSON",
        }
    )
    url = f"https://power.larc.nasa.gov/api/temporal/climatology/point?{query}"
    for tentativa in range(5):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "cafe-pi-analytics/1.0"})
            with urllib.request.urlopen(request, timeout=120) as response:
                p = json.load(response)["properties"]["parameter"]
            return {
                "cod": int(linha.codigo_ibge),
                "temp_media": p["T2M"]["ANN"],
                "temp_min": p["T2M_MIN"]["ANN"],
                "chuva_mm_dia": p["PRECTOTCORR"]["ANN"],
                "umidade": p["RH2M"]["ANN"],
                "radiacao": p["ALLSKY_SFC_SW_DWN"]["ANN"],
                "temp_jan": p["T2M"]["JAN"],
                "temp_jul": p["T2M"]["JUL"],
                "temp_min_jul": p["T2M_MIN"]["JUL"],
                "chuva_seca": float(np.mean([p["PRECTOTCORR"][m] for m in ("JUN", "JUL", "AUG")])),
                "chuva_verao": float(np.mean([p["PRECTOTCORR"][m] for m in ("DEC", "JAN", "FEB")])),
            }
        except Exception:
            time.sleep(2 + 3 * tentativa)
    return None


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--municipios", type=Path, default=Path("data/raw/municipios_coord.csv"))
    parser.add_argument("--output", type=Path, default=Path("data/raw/clima_municipios.csv"))
    parser.add_argument("--threads", type=int, default=6)
    args = parser.parse_args()

    precisa_baixar = not args.municipios.exists() or "codigo_uf" not in pd.read_csv(args.municipios, nrows=1)
    if precisa_baixar:
        args.municipios.parent.mkdir(parents=True, exist_ok=True)
        pd.read_csv(MUNICIPIOS_URL).to_csv(args.municipios, index=False)
    municipios = pd.read_csv(args.municipios)
    municipios = municipios[municipios["codigo_uf"].isin(UFS)]

    feitos = pd.read_csv(args.output) if args.output.exists() else pd.DataFrame()
    ja = set(feitos["cod"]) if len(feitos) else set()
    pendentes = municipios[~municipios["codigo_ibge"].isin(ja)]
    print(f"{len(municipios)} municípios; {len(ja)} já coletados; {len(pendentes)} pendentes")

    with ThreadPoolExecutor(args.threads) as pool:
        novos = [r for r in pool.map(consultar, pendentes.itertuples()) if r]
    saida = pd.concat([feitos, pd.DataFrame(novos)], ignore_index=True)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    saida.to_csv(args.output, index=False)
    print(f"{len(saida)} municípios em {args.output} ({len(pendentes) - len(novos)} falharam)")


if __name__ == "__main__":
    main()
