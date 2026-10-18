# Da escolha da base ao pré-processamento

## 1. Problema

O Café PI precisa responder duas perguntas com dados: **quais regiões produtoras têm clima parecido** (RF02.2) e **como o clima se relaciona com a produtividade** (RF02.3). Isso pede uma base de clima por região e uma base com rendimento (produtividade) associado a clima.

## 2. Por que essas duas bases

### Coffee Data Set (clima das regiões de café)
- **Por que:** é o único conjunto que encontramos com clima diário de **regiões reais de café**: 25 localidades em 8 países (Brasil, Colômbia, Etiópia, Guatemala, Honduras, México, Peru, China), de 2000 a 2025, 9.320 dias por região, 233.000 linhas.
- **O que traz:** temperatura máxima e mínima, umidade, radiação solar, chuva, latitude e longitude. Também traz preço do café e câmbio.
- **O que NÃO traz:** rendimento em toneladas por hectare. O preço (`Close_USD_60kg`) é igual para todas as regiões na mesma data, então não mede produtividade de nenhuma região. Por isso ele não é usado como alvo.
- **Serve para:** correlação, K-Means e carga no banco (`Condicao_Climatica`, `Regiao_Produtora`).

### Agriculture Crop Yield (rendimento)
- **Por que:** é a base grande e aberta que tem **rendimento real** (`Yield_tons_per_hectare`) junto de chuva e temperatura. 1.000.000 de linhas, sem nulos.
- **Limitações:** são culturas genéricas, não só café, sem ano e sem região geográfica real. Só rendimento, chuva e temperatura se repetem nas duas bases, então não dá para juntar por região+ano.
- **Serve para:** ensinar um modelo clima → rendimento.

### Como as duas se ligam
Não há join. O modelo aprende a relação em `crop_yield` e é aplicado ao clima médio das 25 regiões de café. O resultado é uma **estimativa por transferência**, não um rendimento observado.

## 3. Pré-processamento (`00_preprocessamento.ipynb`)

Entrada: `data/raw/`. Saída: `data/processed/clima_limpo.csv`, `perfil_regiao.csv`, `crop_yield_limpo.csv`.

| # | Etapa | O que foi feito | Resultado | Por quê |
|---|-------|-----------------|-----------|---------|
| 1 | Seleção de colunas | Clima: ficam local, coordenadas, data e 5 variáveis climáticas. Rendimento: ficam chuva, temperatura e alvo. | 19 → 9 colunas no clima; 10 → 3 no rendimento | Preço e câmbio não medem produtividade; ano/mês/dia repetem `Date`; as demais colunas do rendimento (solo, cultura, fertilizante) não existem no clima e não podem ser usadas na transferência. |
| 2 | Nulos | Interpolação no tempo dentro de cada região em `Solar_Radiation`. | 28 nulos → 0 | São 0,01% das linhas, e é série diária, então interpolar é melhor que apagar ou usar a média geral. Interpolar por região evita misturar climas diferentes. |
| 3 | Duplicados | Chave (região, data) no clima; linha inteira no rendimento. | 0 e 0 | Garante uma observação por região por dia. |
| 4 | Inconsistências | Regras de domínio: Temp_Min ≤ Temp_Max, chuva ≥ 0, umidade 0–100, rendimento ≥ 0. | Clima: 0 violações. Rendimento: **231 negativos removidos** | Rendimento negativo é fisicamente impossível. |
| 5 | Outliers | Contagem por IQR + boxplot (`boxplot_clima.png`). **Não removidos.** | Chuva 8,5%, umidade 2,2%, Temp_Min 1,2%, Temp_Max 0,6%, radiação 0,5% | Chuva forte e temperatura extrema são clima real e é o que interessa estudar. Chuva é naturalmente assimétrica. |
| 6 | Novas variáveis | `pais`, `regiao` (separados de `Location`), `temperatura_media = (máx+mín)/2`, e perfil por região com `precipitacao_anual = média diária × 365,25`. | 25 regiões no perfil | A chuva do rendimento está em mm/ano (100–1000), não diária; sem converter, as escalas não casam. |
| 7 | Padronização | `StandardScaler` dentro do K-Means (03) e do pipeline da regressão (04). | — | K-Means e KNN usam distância. No 04 é ajustado só no treino de cada fold para não vazar informação do teste. |
| 8 | Salvar | CSVs em `data/processed/`. | clima 233.000×9, perfil 25×9, rendimento 999.769×3 | Os notebooks 01–04 leem daqui, não do bruto. |

## 4. O que usa o resultado

- **02 Correlação:** matriz e pairplot das 4 variáveis climáticas.
- **03 K-Means:** 25 regiões padronizadas; melhor k = 2 (silhouette 0,346), separando por temperatura média (cluster 0: ~19,9 °C e ~1853 mm/ano; cluster 1: ~22,5 °C e ~1350 mm/ano).
- **04 Regressão:** compara Linear (R² 0,593), CART (0,583) e KNN (0,566) por validação cruzada de 5 folds. Teste: MAE 0,878, RMSE 1,079, R² 0,593.

## 5. Limitações (para falar na apresentação)

1. **Transferência fraca.** 23 das 25 regiões têm chuva anual acima de 1000 mm, o máximo visto no treino. Limitamos a entrada a essa faixa para não extrapolar, e então quase todas as regiões saem com ~6,7–6,9 t/ha. A estimativa não discrimina regiões. O R² de 0,59 vale para `crop_yield`, não para café.
2. **Alvo genérico.** O rendimento é de culturas variadas, sem café específico.
3. **Chuva domina o modelo.** No `crop_yield`, a chuva tem correlação ~0,76 com o rendimento e a temperatura ~0,09.
4. **K-Means com poucos pontos.** Só 25 regiões, e silhouette 0,346 é separação moderada.
5. **Próximo passo:** um dataset de produção real de café por país/ano, que permitiria um join real e treinar direto com café.
