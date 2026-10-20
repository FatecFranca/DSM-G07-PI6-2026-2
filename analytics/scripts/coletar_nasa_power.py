"""Coleta dados climáticos diários da NASA POWER para regiões cadastradas.

Entrada: CSV com id,nomeRegiao,pais,latitude,longitude.
Saída: CSV normalizado com uma linha por região e data.
"""

from __future__ import annotations

import argparse
import csv
import json
import urllib.parse
import urllib.request
from pathlib import Path

PARAMETERS = (
    "T2M,PRECTOTCORR,RH2M,ALLSKY_SFC_SW_DWN"
)


def fetch_region(region: dict[str, str], start: str, end: str) -> list[dict[str, str]]:
    query = urllib.parse.urlencode(
        {
            "parameters": PARAMETERS,
            "community": "AG",
            "longitude": region["longitude"],
            "latitude": region["latitude"],
            "start": start,
            "end": end,
            "format": "JSON",
        }
    )
    url = f"https://power.larc.nasa.gov/api/temporal/daily/point?{query}"
    request = urllib.request.Request(url, headers={"User-Agent": "cafe-pi-analytics/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = json.load(response)

    values = payload["properties"]["parameter"]
    dates = sorted(values["T2M"])
    rows = []
    for date in dates:
        row = {
            "regiaoId": region["id"],
            "data": f"{date[:4]}-{date[4:6]}-{date[6:]}",
            "temperaturaMedia": values["T2M"].get(date, ""),
            "precipitacao": values["PRECTOTCORR"].get(date, ""),
            "umidade": values["RH2M"].get(date, ""),
            "radiacaoSolar": values["ALLSKY_SFC_SW_DWN"].get(date, ""),
        }
        if all(value not in ("", -999, -999.0) for value in row.values()):
            rows.append(row)
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--regions", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--start", required=True, help="Data inicial no formato YYYYMMDD")
    parser.add_argument("--end", required=True, help="Data final no formato YYYYMMDD")
    args = parser.parse_args()

    with args.regions.open(newline="", encoding="utf-8") as file:
        regions = list(csv.DictReader(file))
    required = {"id", "latitude", "longitude"}
    missing = required - set(regions[0]) if regions else required
    if missing:
        raise ValueError(f"CSV de regiões sem colunas: {', '.join(sorted(missing))}")

    rows = []
    for region in regions:
        if not region["latitude"] or not region["longitude"]:
            raise ValueError(f"Região {region['id']} sem latitude/longitude")
        rows.extend(fetch_region(region, args.start, args.end))

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=list(rows[0]) if rows else [
            "regiaoId", "data", "temperaturaMedia", "precipitacao", "umidade", "radiacaoSolar"
        ])
        writer.writeheader()
        writer.writerows(rows)


if __name__ == "__main__":
    main()
