# Documentação do Pré-processamento de Dados

## Plataforma de Mineração de Dados Agrícolas e Climáticos do Café

**Instituição:** Faculdade de Tecnologia de Franca "Dr. Thomaz Novelino" (Centro Paula Souza)

**Curso:** Desenvolvimento de Software Multiplataforma (DSM) · **Grupo:** DSM-G07

**Nomes:** Paulo Ricardo, Thiago Cunha, Vinicius de Araujo, Patricia Nogueira

---

## 1. Introdução

O projeto indica, para cada município, quais culturas combinam com o seu clima, com destaque para o café. Antes de aplicar as técnicas de mineração de dados, os dados foram coletados e tratados. Este documento explica esse pré-processamento.

O processo está no notebook `00_preprocessamento.ipynb`, entregue junto com este documento e já executado, com as saídas visíveis. Os arquivos coletados ficam em `data/raw/` e não são alterados. O resultado é salvo em `data/processed/`.

## 2. Bases de dados

| Base | Conteúdo | Tamanho |
| --- | --- | --- |
| [NASA POWER](https://power.larc.nasa.gov) | Clima médio de longo prazo de cada município: temperatura, chuva, umidade e radiação solar | 1.576 municípios (ES, MG e SP) |
| [IBGE, Produção Agrícola Municipal (PAM)](https://sidra.ibge.gov.br) | Área colhida, produção e rendimento por município, cultura e ano, de 2001 a 2024 | 152.797 linhas (6 culturas) |
| Localização dos municípios | Latitude e longitude do centro de cada município (lista pública `kelvins/municipios-brasileiros`) | 5.571 municípios, dos quais 1.576 são usados |

**Culturas:** café, cana-de-açúcar, soja, milho, laranja e feijão.

**Por que a NASA POWER:** é pública e fornece o clima de qualquer coordenada, então cada município recebe o clima do seu próprio ponto.

**Por que o IBGE (PAM):** é a fonte oficial de produção agrícola, por município e por cultura. Isso dá escala local e permite comparar várias culturas com o mesmo método.

**Como se ligam:** pelo código do município (IBGE).

**Coleta:** feita por dois scripts Python (`coletar_clima_municipios.py` e `coletar_ibge_pam.py`). Os dois podem ser executados de novo, e o de clima retoma de onde parou.

## 3. Etapas do pré-processamento

| Etapa | O que foi feito | De → para |
| --- | --- | --- |
| Seleção de colunas | Municípios: só ES, MG e SP, com código, nome, UF e coordenadas. IBGE: só código, UF, cultura, ano, área, produção e rendimento. | Municípios: 5.571 → **1.576**. Colunas da lista de municípios: 9 → **5**. Colunas do IBGE: 8 → **7** |
| Valores nulos | Conferidos nas duas bases. O clima não tem nulos. No IBGE, só o rendimento tem vazios: 11 linhas em que a área e a produção são zero. | Clima: 0 → **0**. IBGE: **11** vazios (tratados na etapa seguinte) |
| Registros sem produção | Linhas com área e produção iguais a zero não informam nada (o município não colheu a cultura no ano). Foram removidas. | 152.797 → **152.786** linhas (11 removidas) |
| Duplicados | Clima e municípios por código; IBGE por município, cultura e ano. | 0 → **0** |
| Inconsistências | Regras de domínio: umidade entre 0 e 100, chuva e radiação não negativas, temperatura mínima menor ou igual à média, valores do IBGE não negativos e rendimento coerente com produção ÷ área (tolerância de 5%). | 0 → **0 violações** |
| Rendimentos implausíveis | Para cada cultura, rendimento acima de Q3 + 5 × IQR foi marcado como nulo (a linha é mantida, porque a área continua válida). O fator 5, mais conservador que o usual 3, evita descartar valores altos mas reais, como os do café de alta tecnologia. Maior valor encontrado no café: 9.000 kg/ha, contra uma mediana de 1.190. | **39** rendimentos marcados: café 27, feijão 9, laranja 2, soja 1 |
| Valores extremos (outliers) do clima | Contados pelo IQR e vistos em boxplot. **Não foram removidos**, porque são eventos reais (por exemplo, a chuva intensa). Chuva: 8,12%; umidade: 1,65%; temperatura mínima: 1,27%; radiação: 0,76%. | Contados e mantidos |
| Cobertura das séries | Quantos anos de registro cada município tem para cada cultura entre 2015 e 2024. Um ano sem linha significa que o município não colheu a cultura naquele ano. | **7.011** séries município-cultura: 5.025 com os 10 anos, 717 com menos de 5 anos e 200 com 1 ano só |
| Novas variáveis do clima | `chuva_anual` (chuva diária média × 365,25), `amplitude_termica` (temperatura de janeiro − julho) e `contraste_chuva` (chuva do verão − chuva da seca). | 10 → **13** variáveis de clima |
| Rótulos das culturas | Para cada município e cultura, a área colhida média de 2015 a 2024, **contando os anos sem registro como área zero** (soma das áreas dividida por 10 anos). O município é marcado como "apto" quando essa média é de pelo menos 500 ha (ver a seção 4). Também se calcula a cultura dominante (a de maior área entre as seis). | Aptos: café **368**, cana **550**, soja **423**, milho **557**, laranja **160**, feijão **162** |
| Padronização | `StandardScaler` (z-score), aplicado **dentro** dos modelos de mineração e ajustado só com os dados de treino, para o teste não receber informação do treino. | — (feito na etapa de mineração) |

## 4. O rótulo "apto"

"Apto" é o nome do rótulo e **não** quer dizer "pode plantar". Significa que o município **já cultiva** aquela cultura em escala relevante: área colhida média de **500 hectares ou mais**, de 2015 a 2024.

**Anos sem registro.** Na base do IBGE, um município que não colheu a cultura em um ano simplesmente não aparece naquele ano. Se a média fosse calculada só com os anos que aparecem, quem planta de forma intermitente teria a área superestimada. Por isso os anos sem registro contam como área zero. Com esse critério, **47 rótulos** mudaram em relação ao cálculo só com os anos informados (30 deles de soja).

O limite de 500 ha é uma escolha do grupo, para separar produtores relevantes de municípios com cultivo pequeno. Nos dados do IBGE, os municípios marcados como aptos também têm rendimento mediano maior em todas as culturas (por exemplo, café: 1,55 t/ha contra 1,27 t/ha). Mesmo assim, o rótulo mede a **área plantada**, e não a produtividade.

A cultura dominante de cada município (a de maior área entre as seis, quando há pelo menos uma apta) ficou assim: nenhuma, 582 municípios; cana, 446; café, 277; milho, 135; soja, 107; laranja, 18; feijão, 11.

## 5. Dados antes e depois do tratamento

| Item | Antes | Depois |
| --- | --- | --- |
| Municípios | 5.571 (Brasil, lista pública) | 1.576 (ES, MG e SP) |
| Clima (NASA POWER) | 1.576 linhas × 11 colunas | 1.576 linhas × 18 colunas (com identificação e as 3 variáveis novas) |
| Produção (IBGE) | 152.797 linhas × 8 colunas | 152.786 linhas × 8 colunas (7 usadas no tratamento; 11 linhas sem produção removidas) |
| Nulos no clima | 0 | 0 |
| Rendimentos nulos no IBGE | 11 | 39 (extremos marcados como nulos; os 11 vazios originais foram removidos junto com as linhas sem produção) |
| Duplicados | 0 | 0 |
| Violações de regra | 0 | 0 |
| Tabela final por município | — | **1.576 linhas × 31 colunas** (identificação, clima, área e "apto" por cultura e cultura dominante) |

**Cobertura:** Minas Gerais 853, São Paulo 645 e Espírito Santo 78 municípios. Em 54 deles não há registro de nenhuma das seis culturas.

## 6. Arquivos gerados

Salvos em `data/processed/`:

| Arquivo | Conteúdo |
| --- | --- |
| `clima_municipios_limpo.csv` | Clima tratado de cada município (1.576 × 18) |
| `pam_limpo.csv` | Produção do IBGE tratada (152.786 × 8) |
| `dataset_municipios.csv` | **Tabela final** por município: clima, área e rótulo de cada cultura e cultura dominante (1.576 × 31) |
| `boxplot_clima.png` | Boxplot das variáveis de clima (outliers) |

## 7. Limitações

1. O rótulo "apto" mede a **área plantada que já existe**, que depende também de mercado, tradição e tamanho do município, e não só do clima.
2. O clima da NASA tem resolução de cerca de 50 km e **não enxerga altitude, solo nem relevo**.
3. A cobertura se limita a **ES, MG e SP**.
4. O limite de 500 ha é uma escolha do grupo.
5. A regra de rendimentos implausíveis é estatística (Q3 + 5 × IQR) e conservadora. Valores altos que ficaram abaixo do limite, por exemplo na cana-de-açúcar, não foram marcados, porque o rendimento não entra no rótulo.
6. Em 54 municípios não há registro de nenhuma das seis culturas, e todos entram com área zero.

## 8. Próxima etapa

Com a tabela final tratada, aplicamos as técnicas de mineração de dados (agrupamento e classificação), apresentadas na etapa seguinte do projeto.
