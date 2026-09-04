# `analytics/` — Módulo Analítico (ML) do Café PI

Notebooks da parte de mineração de dados do projeto (RF01/RF02 de
`docs/documentacao-sprint1.md`): ingestão de clima, correlação, K-Means e a
ponte de regressão clima→rendimento.

## Datasets usados

- **Coffee Data Set** — <https://www.kaggle.com/datasets/escstockholm/coffee-data-set>
  → salvar como `data/raw/Coffee_Data_Set.csv`
- **Agriculture Crop Yield** — <https://www.kaggle.com/datasets/samuelotiattakorah/agriculture-crop-yield>
  → salvar como `data/raw/crop_yield.csv`

Os CSVs brutos não são versionados — cada integrante baixa os seus.

## Decisões de dados

`Coffee_Data_Set.csv` é um painel diário de clima (2000–2025) para 25
localidades reais de café em 8 países. Não tem rendimento em
toneladas/hectare, só o preço do café (`Close_USD_60kg`, igual pra todas as
regiões numa mesma data — por isso não é usado como proxy de produtividade).

`crop_yield.csv` tem rendimento real (`Yield_tons_per_hectare`), mas de
culturas genéricas (não café), sem ano e sem região geográfica real — não dá
pra unir os dois por região+ano.

A ligação entre os dois datasets é feita pelo modelo, não por um join:
`crop_yield.csv` ensina a relação clima→rendimento (`04_regressao.ipynb`),
que depois é aplicada ao clima real das 25 regiões de café. O resultado é
uma estimativa por transferência, não um rendimento observado.

## Notebooks

| Notebook | RF | Depende do Postgres? |
| --- | --- | --- |
| `01_ingestao.ipynb` | RF01 | Sim |
| `02_correlacao.ipynb` | RF02.1 | Não |
| `03_kmeans.ipynb` | RF02.2 | Não |
| `04_regressao.ipynb` | RF02.3 | Não |

## Setup

```bash
cd analytics
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
jupyter notebook
```

Baixe os dois CSVs e salve em `data/raw/` com os nomes acima antes de rodar.

## Resultados de referência

- K-Means: melhor `k=2` (silhouette 0.346), separa principalmente por
  temperatura média.
- Regressão (holdout 20%): MAE≈0.89, RMSE≈1.09, R²≈0.59.

## Próximos passos

- `Cluster_Climatico`, `Regiao_Cluster` e `Predicao_Produtividade` (modelo
  conceitual em `docs/documentacao-sprint1.md`) ainda não existem no
  `backend/prisma/schema.prisma` — combinar migration com o backend.
- `Regiao_Produtora` não tem `@@unique([nomeRegiao, pais])` — o
  `01_ingestao.ipynb` já contorna isso com find-or-create.
- Avaliar um terceiro dataset com produção real de café por país/ano para
  popular `Safra_Rendimento`.
