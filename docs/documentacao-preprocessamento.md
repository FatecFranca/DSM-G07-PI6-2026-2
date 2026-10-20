# Documentação do Pré-processamento de Dados

## Plataforma de Mineração de Dados Agrícolas e Climáticos do Café

**Instituição:** Faculdade de Tecnologia de Franca "Dr. Thomaz Novelino" (Centro Paula Souza)

**Curso:** Desenvolvimento de Software Multiplataforma (DSM) · **Grupo:** DSM-G07

---

## 1. Introdução

Este documento explica como os dados foram tratados antes das técnicas de mineração (correlação, K-Means e regressão). O processo está em `analytics/notebooks/00_preprocessamento.ipynb`. Os arquivos originais ficam em `analytics/data/raw/` e não são alterados. O resultado vai para `analytics/data/processed/`, e os demais notebooks leem só dessa pasta.

## 2. Bases de dados

| Base | Conteúdo | Tamanho |
| --- | --- | --- |
| [Coffee Data Set](https://www.kaggle.com/datasets/escstockholm/coffee-data-set) | Clima diário de 25 regiões de café em 8 países, de 2000 a 2025 | 233.000 linhas |
| [Agriculture Crop Yield](https://www.kaggle.com/datasets/samuelotiattakorah/agriculture-crop-yield) | Chuva, temperatura e rendimento (t/ha) de lavouras | 1.000.000 linhas |

**Por que o Coffee Data Set:** foi a única base encontrada com clima de regiões de café reais, com muitos anos de dados. Ela não tem produtividade. O preço do café que vem nela é igual para todas as regiões na mesma data, então não serve como medida de produtividade.

**Por que o Crop Yield:** é a base aberta que traz rendimento junto de chuva e temperatura, variáveis que também existem no Coffee Data Set. Mas as culturas são variadas (não só café) e não há região nem ano.

**Como se ligam:** como não dá para juntar por região e ano, a ligação é feita por um modelo de regressão. Ele aprende a relação clima → rendimento no Crop Yield e é aplicado ao clima médio das 25 regiões de café. O resultado é uma estimativa, não um rendimento medido.

## 3. Etapas do pré-processamento

| Etapa | O que foi feito | Resultado |
| --- | --- | --- |
| Seleção de colunas | Clima: 19 → 9 colunas (sem preço, câmbio e colunas de data repetidas). Rendimento: 10 → 3 (chuva, temperatura e rendimento, as únicas que também existem no clima). | — |
| Nulos | Só `Solar_Radiation` tinha nulos. Preenchidos por interpolação dentro de cada região, porque é uma série diária e a média geral misturaria climas diferentes. | 28 → 0 |
| Duplicados | Clima: mesma região na mesma data. Rendimento: linha inteira repetida. | 0 encontrados |
| Inconsistências | Regras: temperatura mínima ≤ máxima, chuva ≥ 0, umidade entre 0 e 100, rendimento ≥ 0. | 231 rendimentos negativos removidos |
| Outliers | Contados pelo IQR e vistos em boxplot. **Não removidos**, porque chuva forte e temperatura extrema são clima real. A chuva tem 8,5% de outliers, as demais variáveis ficam abaixo de 2,5%. | — |
| Novas variáveis | `pais` e `regiao` separados de `Location`; `temperatura_media = (máx + mín) / 2`; perfil por região (média de cada variável, 25 linhas); `precipitacao_anual` = chuva diária média × 365,25. | — |
| Padronização | `StandardScaler` (z-score) aplicado dentro do K-Means e da regressão, e não no pré-processamento. Na regressão é ajustado só com o treino, para não vazar dados do teste. | — |

A chuva anual é necessária porque a chuva do Crop Yield está em mm por ano (100 a 1000) e a do Coffee Data Set em mm por dia.

**Arquivos gerados** em `data/processed/`: `clima_limpo.csv` (233.000 × 9), `perfil_regiao.csv` (25 × 9) e `crop_yield_limpo.csv` (999.769 × 3).

## 4. Resultados com os dados tratados

- **K-Means:** melhor k = 2 (silhouette 0,346). Um grupo mais frio e chuvoso (cerca de 19,9 °C e 1.853 mm/ano) e outro mais quente e seco (cerca de 22,5 °C e 1.350 mm/ano).
- **Regressão** (validação cruzada, R²): linear 0,593, CART 0,583, KNN 0,566. No teste, a linear teve MAE 0,878, RMSE 1,079 e R² 0,593.

## 5. Limitações

1. Das 25 regiões, 23 têm chuva anual acima de 1.000 mm, o máximo visto no treino. Limitamos a entrada a essa faixa, e com isso quase todas as regiões saem com um rendimento parecido (6,7 a 6,9 t/ha). A estimativa não diferencia as regiões, e o R² de 0,59 vale para o Crop Yield, não para o café.
2. O rendimento do Crop Yield mistura várias culturas.
3. São só 25 regiões no K-Means, e o silhouette indica separação moderada.

## 6. Próximos passos

- Buscar uma base com produção real de café por região e ano, para fazer a junção direta e treinar com café.
- Criar no banco as tabelas de cluster e predição e integrar com o backend.
