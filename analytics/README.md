# `analytics/` — Módulo Analítico (ML) do Café PI

Mineração de dados do projeto (RF01/RF02 de `docs/documentacao-sprint1.md`):
coleta e tratamento, K-Means e classificação supervisionada que indica **quais
culturas combinam com o clima de cada município**.

## Fontes de dados

| Base | Fonte | Script | Saída bruta |
| --- | --- | --- | --- |
| Clima (climatologia) de 1.576 municípios de ES, MG e SP | NASA POWER | `scripts/coletar_clima_municipios.py` | `data/raw/clima_municipios.csv` |
| Área, produção e rendimento por município, cultura e ano (2001–2024) | IBGE / PAM | `scripts/coletar_ibge_pam.py` | `data/raw/pam_culturas_municipios.csv` |
| Latitude e longitude dos municípios | `kelvins/municipios-brasileiros` | (baixado pelo script de clima) | `data/raw/municipios_coord.csv` |

Culturas: café, cana-de-açúcar, soja, milho, laranja e feijão. As bases se ligam pelo
código do município (IBGE).

Os arquivos de `data/raw/` e `data/processed/` não são versionados: cada pessoa roda
a coleta e os notebooks.

## Execução

```powershell
cd analytics
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# 1) coleta (precisa de internet; a do clima leva alguns minutos e retoma de onde parou)
python scripts\coletar_clima_municipios.py
python scripts\coletar_ibge_pam.py

# 2) notebooks (execute 00, 02, 03 e 04; depois exporte pelo 01)
cd notebooks
jupyter notebook
```

Depois de executar os notebooks 00, 02, 03 e 04, execute 01 para gerar o artefato e importe-o na API:

```powershell
cd ..\..\backend
npm run data:import:agricultural -- ..\analytics\data\processed\artefato_agricola_v1.json
```

| Notebook | Conteúdo | Depende do Postgres? |
| --- | --- | --- |
| `00_preprocessamento.ipynb` | Tratamento, novas variáveis e rótulos de aptidão | Não |
| `01_ingestao.ipynb` | Exporta um artefato JSON versionado para o importador da API | Não |
| `02_correlacao.ipynb` | Correlação de Spearman: clima x área de cada cultura | Não |
| `03_kmeans.ipynb` | Agrupamento (não supervisionado) e cruzamento com as culturas | Não |
| `04_classificacao.ipynb` | Classificação supervisionada, matrizes de confusão e compatibilidade exploratória | Não |

Os notebooks 02 a 04 leem só de `data/processed/` (saída do 00). O notebook 01 exporta os resultados integrados depois que 00, 02, 03 e 04 gerarem seus arquivos.

## Dois algoritmos, de natureza diferente

| Algoritmo | Tipo | Pergunta |
| --- | --- | --- |
| **K-Means** | Não supervisionado | Quais municípios têm clima parecido? |
| **Classificação** (regressão logística, Random Forest e Gradient Boosting, comparados) | Supervisionado | O município corresponde ao rótulo histórico de área colhida da cultura X? |

A validação da classificação é **espacial**: municípios em células de 1° não ficam
em treino e teste ao mesmo tempo.

## Resultados de referência

- **Pré-processamento:** 5.571 → 1.576 municípios (ES, MG e SP); PAM com 152.797
  linhas; sem nulos no clima, sem duplicados e sem violações de regra.
- **K-Means:** melhor k = 7, silhouette 0,334 (separação moderada).
- **Classificação (melhor modelo por cultura):**

| Cultura | Acurácia | Baseline | Acurácia balanceada | AUC |
| --- | --- | --- | --- | --- |
| Café | 87,9% | 76,6% | 81,1% | 0,903 |
| Cana-de-açúcar | 91,8% | 64,7% | 90,6% | 0,948 |
| Soja | 80,3% | 71,3% | 79,2% | 0,896 |
| Milho | 73,4% | 64,6% | 69,9% | 0,776 |
| Laranja | 73,6% | 89,8% | 80,1% | 0,816 |
| Feijão | 67,8% | 89,2% | 66,5% | 0,680 |

  Laranja e feijão são raros, e os modelos foram balanceados para achá-los (recall
  alto, precisão baixa), então a acurácia fica abaixo do baseline.
- **Cultura dominante (multiclasse):** acurácia 72%, balanceada 51%.
- **Saída exploratória:** `data/processed/compatibilidade_culturas.csv` contém a probabilidade fora da amostra de corresponder ao rótulo histórico de área colhida, com ranking; não é recomendação agronômica.

## Saídas principais (`data/processed/`)

`dataset_municipios.csv`, `clusters_municipios.csv`, `kmeans_grupo_x_cultura.csv`,
`classificacao_melhores.csv`, `classificacao_todos_modelos.csv`,
`matrizes_confusao.png/.csv`, `matriz_confusao_multiclasse.png/.csv`,
`classificacao_sensibilidade_limite.csv`, `classificacao_importancia_variaveis.csv`
e `compatibilidade_culturas.csv`.

## Limitações

- "Apto" é medido pela área colhida que já existe (média 2015–2024 ≥ 500 ha), e isso
  depende também de mercado e tradição.
- O clima da NASA tem cerca de 50 km de resolução e não enxerga altitude, solo ou relevo.
- Só ES, MG e SP. Laranja e feijão têm poucos exemplos positivos.
- A previsão de produtividade (t/ha) foi testada com dados da CONAB (por estado) e do
  IBGE (por município) e foi fraca (R² próximo de zero em anos futuros). Por isso o
  foco é a aptidão. Os scripts `coletar_nasa_power.py` e `coletar_conab.py` ficam como
  histórico desse teste.
