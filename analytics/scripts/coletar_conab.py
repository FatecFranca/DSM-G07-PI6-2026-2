"""Normaliza dados de café da CONAB obtidos pelo pacote agrobr.

O pacote é opcional e de terceiros. Este script falha explicitamente quando
não está instalado para evitar uma carga com dados incompletos ou inventados.
"""

from __future__ import annotations

import argparse
import csv
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--safra", required=True)
    parser.add_argument("--uf", required=True, help="UF da região, por exemplo MG")
    args = parser.parse_args()

    try:
        from agrobr.sync import conab  # type: ignore
    except ImportError as error:
        raise RuntimeError(
            "Instale a dependência agrobr antes da coleta: pip install agrobr"
        ) from error

    result = conab.safras(
        produto="cafe",
        safra=args.safra,
        uf=args.uf,
    )
    if result is None or result.empty:
        raise RuntimeError("A CONAB não retornou dados para a safra e UF informadas")

    rows = []
    for _, item in result.iterrows():
        produtividade = item.get("produtividade")
        if produtividade is None:
            continue
        rows.append(
            {
                "uf": str(item.get("uf", args.uf)).upper(),
                "anoColheita": int(str(item.get("safra", args.safra))[:4]),
                "rendimentoToneladasHectare": float(produtividade) / 1000,
                "fonte": "CONAB/agrobr",
            }
        )
    if not rows:
        raise RuntimeError("A resposta não contém produtividade em sacas por hectare")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=rows[0])
        writer.writeheader()
        writer.writerows(rows)


if __name__ == "__main__":
    main()
