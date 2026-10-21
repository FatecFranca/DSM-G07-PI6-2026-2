# Documentação do Pré-processamento e da Mineração de Dados

## Plataforma de Mineração de Dados Agrícolas e Climáticos do Café

**Instituição:** Faculdade de Tecnologia de Franca "Dr. Thomaz Novelino" (Centro Paula Souza)

**Curso:** Desenvolvimento de Software Multiplataforma (DSM) · **Grupo:** DSM-G07

---

## 1. Introdução

O objetivo é indicar, para cada município, quais culturas combinam com o seu clima, com destaque para o café. Este documento explica como os dados foram coletados e tratados e quais técnicas foram aplicadas: **K-Means** (agrupamento) e **classificação supervisionada** (o município é apto ou não para a cultura?).

O processo está em `analytics/notebooks/`. Os arquivos coletados ficam em `analytics/data/raw/` e não são alterados. O resultado vai para `analytics/data/processed/`, e os notebooks seguintes leem só dessa pasta.

## 2. Bases de dados

| Base | Conteúdo | Tamanho |
| --- | --- | --- |
| [NASA POWER](https://power.larc.nasa.gov) | Clima médio de longo prazo (climatologia) de cada município: temperatura, chuva, umidade e radiação solar, por mês | 1.576 municípios (ES, MG e SP) |
| [IBGE, Produção Agrícola Municipal (PAM)](https://sidra.ibge.gov.br) | Área colhida, produção e rendimento por município, cultura e ano, de 2001 a 2024 | 152.797 linhas (6 culturas) |
| Localização dos municípios | Latitude e longitude do centro de cada município (`kelvins/municipios-brasileiros`) | 5.571 municípios, 1.576 usados |

**Culturas:** café, cana-de-açúcar, soja, milho, laranja e feijão.

**Por que a NASA POWER:** é pública e fornece o clima de qualquer coordenada, então cada município recebe o clima do seu próprio ponto.

**Por que o IBGE (PAM):** é a fonte oficial de produção agrícola, **por município** e por cultura. Isso dá escala local e permite comparar várias culturas com o mesmo método.

**Como se ligam:** pelo código do município (IBGE). O clima de cada município é unido às áreas colhidas das culturas dele.

**Coleta:** `scripts/coletar_clima_municipios.py` e `scripts/coletar_ibge_pam.py`. Os dois são reexecutáveis, e o de clima retoma de onde parou.

## 3. Etapas do pré-processamento

| Etapa | O que foi feito | Resultado |
| --- | --- | --- |
| Seleção de colunas | Municípios: só ES, MG e SP, com código, nome, UF e coordenadas. PAM: só código, UF, cultura, ano, área, produção e rendimento. | Municípios 5.571 → 1.576; colunas da lista de municípios 9 → 5 |
| Nulos | Clima sem nulos. Na PAM, só o rendimento tem vazios (área ou produção igual a zero). | Clima 0; PAM 11 rendimentos vazios, mantidos por não serem usados como rótulo |
| Duplicados | Clima e municípios por código; PAM por município, cultura e ano. | 0 encontrados |
| Inconsistências | Regras: umidade de 0 a 100, chuva ≥ 0, radiação ≥ 0, temperatura mínima ≤ média, valores da PAM ≥ 0 e rendimento coerente com produção ÷ área (5%). | 0 violações |
| Outliers | Contados pelo IQR e vistos em boxplot. **Não removidos**, porque são casos reais (por exemplo, os maiores produtores). Clima: chuva 8,12%, temperatura mínima 1,27%, umidade 1,65%, radiação 0,76%. | Não removidos |
| Novas variáveis do clima | `chuva_anual` (chuva diária média × 365,25), `amplitude_termica` (temperatura de janeiro − julho) e `contraste_chuva` (chuva do verão − da seca). | 3 variáveis |
| Rótulos das culturas | Área colhida média de 2015 a 2024 de cada município e cultura. **Apto** = área média ≥ 500 ha (limite `LIMITE_HA`); sem registro, área 0. Também se calcula a **cultura dominante**. | Aptos: café 369, cana 556, soja 453, milho 558, laranja 161, feijão 170 |
| Padronização | `StandardScaler` aplicado dentro do K-Means e dos modelos, ajustado só no treino. | — |

**Cobertura:** 1.576 municípios (MG 853, SP 645 e ES 78). Em 54 deles não há registro de nenhuma das seis culturas.

**Arquivos gerados** em `data/processed/`: `clima_municipios_limpo.csv` (1.576 × 18), `pam_limpo.csv` (152.797 × 8) e `dataset_municipios.csv` (1.576 × 31).

## 4. Resultados com os dados tratados

### 4.1 Correlação (Spearman)
As correlações do clima com a área colhida são moderadas. A cana-de-açúcar tem as maiores: radiação 0,53, umidade −0,51 e temperatura média 0,49. A soja se associa à temperatura mínima (−0,46) e à radiação (0,47). O café tem correlações fracas (até 0,12 em módulo), o que indica que ele depende da combinação de variáveis, e não de uma só.

### 4.2 K-Means (não supervisionado)
Agrupa os municípios pelo perfil climático, sem usar a cultura. O melhor valor foi **k = 7**, com silhouette de **0,334**. A silhouette é parecida para k entre 4 e 7, então a separação é **moderada**. Cruzando os grupos com as culturas, por exemplo, o Grupo 7 (temperatura mínima mais alta, cerca de 11,6 °C) tem 55% dos municípios aptos para café, e o Grupo 4 tem 88% aptos para cana.

### 4.3 Classificação supervisionada
Para cada cultura, um modelo responde **apto ou não apto** com o clima e a localização. Foram comparados três algoritmos (regressão logística, Random Forest e Gradient Boosting) com **validação cruzada espacial**: os municípios são agrupados em células de 1° e células iguais nunca ficam em treino e teste ao mesmo tempo. Isso evita que municípios vizinhos, de clima quase idêntico, inflem o resultado. O melhor modelo de cada cultura foi escolhido pela **acurácia balanceada**.

| Cultura | Modelo | % aptos | Baseline (acurácia) | Acurácia | Acurácia balanceada | Precisão | Recall | AUC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Café | Random Forest | 23,4% | 76,6% | **87,9%** | 81,1% | 77,5% | 68,3% | 0,903 |
| Cana-de-açúcar | Gradient Boosting | 35,3% | 64,7% | **91,8%** | 90,6% | 89,4% | 86,9% | 0,948 |
| Soja | Random Forest | 28,7% | 71,3% | 80,3% | 79,2% | 62,9% | 76,6% | 0,896 |
| Milho | Gradient Boosting | 35,4% | 64,6% | 73,4% | 69,9% | 63,5% | 58,2% | 0,776 |
| Laranja | Regressão logística | 10,2% | 89,8% | 73,6% | 80,1% | 26,3% | 88,2% | 0,816 |
| Feijão | Regressão logística | 10,8% | 89,2% | 67,8% | 66,5% | 19,7% | 64,7% | 0,680 |

O *baseline* é a acurácia de responder sempre "não apto". Café, cana, soja e milho **superam o baseline**. Para laranja e feijão, que são raros, a acurácia fica **abaixo** do baseline porque os modelos foram balanceados para encontrar os aptos (alto recall, baixa precisão); nesses casos a medida adequada é a acurácia balanceada.

**Matriz de confusão do café** (1.576 municípios): 1.134 verdadeiros negativos, 73 falsos positivos, 117 falsos negativos e 252 verdadeiros positivos. **Matriz da cana:** 963, 57, 73 e 483. As matrizes de todas as culturas estão em `data/processed/matrizes_confusao.png` e `.csv`.

**Sensibilidade ao limite:** repetindo o teste com 200, 500 e 1.000 ha, a acurácia balanceada do café fica entre 79% e 81%, e a da cana entre 87% e 92%. A escolha do limite pesa, mas não muda a conclusão.

**Variáveis mais importantes** (importância por permutação): a localização (longitude e latitude) pesa mais em todas as culturas; entre as variáveis de clima se destacam radiação e umidade (café), temperatura mínima (laranja) e chuva na estação seca (feijão).

**Cultura dominante (multiclasse, 7 classes):** acurácia de 72% (baseline 36,9%) e acurácia balanceada de 51%. É um problema bem mais difícil que o sim ou não, e o modelo acerta bem a cana (86% dos municípios dessa classe) e a classe "nenhuma" (79%), razoavelmente o café (65%) e a soja (61%), e pouco o milho (31%), a laranja (33%) e o feijão (0%).

### 4.4 Recomendação por município
A **compatibilidade** de cada cultura é a probabilidade de "apto" do melhor modelo, calculada **fora da amostra**. Ela é salva em `data/processed/compatibilidade_culturas.csv`, com o ranking de culturas de cada município. Exemplos: Varginha (MG) tem o café em 1º lugar (compatibilidade 0,995, e o município é de fato apto); Franca (SP) tem cana (0,996), café (0,929) e soja (0,821).

## 5. Limitações

1. **"Apto" é medido pela área plantada que já existe.** Ela depende também de mercado, tradição e tamanho do município, e não só do clima. O modelo recomenda culturas parecidas com as de municípios de clima semelhante, não o melhor uso agronômico.
2. O clima da NASA tem resolução de cerca de 50 km e **não enxerga altitude, solo nem relevo**, que são decisivos para o café.
3. Cobertura limitada a **ES, MG e SP**.
4. O limite de 500 ha é uma escolha; foi testada a sensibilidade a ele.
5. Laranja e feijão são culturas raras nos dados, e os modelos têm baixa precisão. A cultura dominante (multiclasse) tem desempenho modesto.
6. Foi testada também a **previsão de produtividade (t/ha)** do café por regressão (dados da CONAB por estado e do IBGE por município). O clima sozinho explicou pouco (R² próximo de zero em anos futuros), e por isso o foco passou para a classificação.

## 6. Próximos passos

- Incluir **altitude e solo** (por exemplo, SRTM e Embrapa) para melhorar a aptidão do café.
- Ampliar a cobertura para outros estados e culturas.
- Carregar os resultados no banco (tabelas de cultura, compatibilidade, cluster e métricas) e integrar ao back-end e ao dashboard.
