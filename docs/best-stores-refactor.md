# Refatoração da busca de melhores lojas

Implementação na branch `sql-adapter`. O frontend envia somente IDs, quantidades,
coordenadas e prioridade. O ranking é calculado no PostgreSQL por Drizzle, seguindo
Component → Pinia → H3 → Service → Repository → SQL.

## Arquivos criados

| Arquivo | Responsabilidade |
| --- | --- |
| `types/BestStore.ts` | Contratos de entrada, pesos, resultados, produtos encontrados e ausentes. |
| `server/utils/best-store-validation.ts` | Validação específica de busca. |
| `server/api/store/best.post.ts` | `POST /api/store/best`, validação e chamada ao service. |
| `server/database/queries/best-stores.ts` | Consulta parametrizada, ranking, detalhes em lote e conversão do resultado. |
| `tests/best-stores.test.ts` | Validação, pesos, adapter, rota H3, concorrência Pinia e integração PostgreSQL. |
| `docs/best-stores-refactor.md` | Relatório, limites e instruções de validação. |

## Arquivos modificados

| Arquivo | Responsabilidade |
| --- | --- |
| `server/repositories/StoreRepository.ts` | Delega a consulta especializada; recusa JSONBin com 503. |
| `server/services/StoreService.ts` | Define pesos 60/40 e encaminha parâmetros. |
| `server/utils/api-handler.ts` | Aceita validador específico opcional; mantém a validação CRUD padrão. |
| `stores/store.ts` | Estado de resultados, loading, erro e action com proteção contra respostas antigas. |
| `components/SearchProduct.vue` | Usa os produtos de `budgetProducts`, chama a action e exibe quantidades/subtotais. Corrige a key de produtos encontrados. |
| `components/SelectedProductList.vue` | Inicializa a lista com os produtos persistidos antes do watcher imediato, evitando sobrescrever a seleção na montagem. |
| `components/BudgetResult.vue` | Exibe preço unitário, quantidade solicitada e subtotal no conteúdo também usado pelo PDF. |
| `types/ProductStore.ts` | Reexporta o contrato de resultado único e acrescenta campos opcionais compatíveis para o orçamento. |

## Consulta e regras

1. `requested_products` transforma um parâmetro JSON em registros tipados. Não há interpolação de valores do usuário no texto SQL.
2. `available_products` faz JOIN por produto e exige `quantity >= quantidade solicitada`.
3. `store_coverage` conta os produtos distintos (a entrada rejeita duplicatas e o banco possui UNIQUE loja/produto) e soma `price * requested_quantity` em NUMERIC.
4. `max_coverage` e `candidates` restringem a classificação à maior cobertura positiva. Sem qualquer item atendido, o resultado é vazio.
5. A distância usa Haversine em quilômetros, raio 6371.0088, com o argumento protegido entre zero e um antes de sqrt/asin.
6. `normalized` divide preço e distância pelo respectivo máximo entre as candidatas. `NULLIF` e `COALESCE` tratam máximos zero.
7. `ranked` aplica os pesos e ordena por score, total, distância e ID, limitando a três lojas.
8. `details` cruza somente as lojas classificadas com os produtos solicitados e usa LEFT JOIN em produtos/relações. Inclui produtos inexistentes, sem relação e com estoque insuficiente entre os ausentes.

Ranking e detalhes usam **uma única instrução SQL**, portanto o mesmo snapshot do
PostgreSQL. Essa escolha substitui a segunda ida ao banco e dispensa transação de
leitura explícita. O enriquecimento não modifica a ordem. Há uma única chamada a
`db.execute()` e nenhum acesso individual por loja ou produto.

O driver node-postgres utilizado pelo Drizzle retorna `QueryResult.rows`. Os totais,
preços unitários e subtotais são explicitamente serializados como texto decimal no
SQL. `totalPrice` é convertido para number somente na fronteira de resposta, para
preservar a interface existente; distância, score e coordenadas também são
convertidos explicitamente. Valores monetários extremos podem exceder a precisão
do number da interface, embora o cálculo no PostgreSQL permaneça exato. Preços
unitários e subtotais continuam como strings decimais.

Cada resultado recebe arrays próprios. Encontrados contêm `id_product`, `id_store`,
`price`, `quantity` (quantidade solicitada), `requestedQuantity`, `availableQuantity`,
`subtotal` e `available: true`, além dos dados do produto. Ausentes contêm o produto,
quantidade solicitada e disponível; pertencer ao array de ausentes indica que o item
não pode ser atendido integralmente. Para ID inexistente, o nome é `Produto #ID`.

## Entrada e frontend

São aceitos de 1 a 100 produtos, IDs e quantidades numéricos inteiros entre 1 e
2147483647. IDs repetidos são rejeitados com HTTP 400, sem consolidação. Latitude e
longitude precisam ser números finitos nos intervalos [-90,90] e [-180,180]. A
prioridade precisa ser `price` ou `distance`. Preços e estoque enviados pelo cliente
não participam da consulta. Falhas internas usam o sanitizador existente.

`budgetProducts` é a fonte de verdade para a lista visível e suas quantidades,
incluindo remoção ao reduzir a quantidade a zero. A busca não usa `fetch()` de lojas
nem a action que carrega todas as relações. A action limpa resultados no início,
controla loading/erro e só permite que a requisição mais recente altere o estado.
A busca vazia limpa resultados e informa que nenhuma loja possui estoque suficiente.

O botão Seguir mantém `budgetStore.add(foundProducts, store)` e a navegação para
`/budget`. A página e o gerador de PDF permanecem os mesmos. O conteúdo do orçamento
passa a mostrar unitário × quantidade = subtotal; os campos novos são opcionais no
contrato legado para manter compatibilidade com outros consumidores.

## Testes e validações

- `yarn lint`: passou, zero erros; 40 avisos existentes no projeto.
- `yarn typecheck`: passou.
- `yarn test`: 19 passaram e 1 integração foi ignorada sem `TEST_DATABASE_URL`.
- `TEST_DATABASE_URL=... yarn test`: 20 passaram, nenhuma integração ignorada.
- `yarn build`: passou.
- `git diff --check`: passou.

O teste PostgreSQL exige URL local, recusa produção/Vercel, cria tabelas TEMP que
sombreiam as tabelas reais e executa ROLLBACK no final. Não altera registros
existentes. Cobre ausência de lojas/produtos, cobertura completa/parcial, estoque
zero/insuficiente, quantidades, subtotal/total, ambos os pesos, desempates, zeros,
limite de três, encontrados/ausentes e uma única instrução SQL. Os testes adicionais
cobrem limites, coordenadas, duplicatas, JSONBin, proteção de erros, validação CRUD
e respostas concorrentes/obsoletas no Pinia.

Foram encontrados e corrigidos durante a validação: incompatibilidade de boolean
com a index signature de Product; preço NUMERIC dentro de JSON precisando de cast
explícito para texto; mensagem de erro da action que precisava de estado visível;
e inicialização da seleção após o watcher imediato.

Avisos de build incluem bases Browserslist/Baseline desatualizadas, plugin
`the-mask-client.ts` vazio e tamanho de chunks. Não foram alterados arquivos não
relacionados para removê-los.

## Plano de execução e índices

`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` foi executado exclusivamente nas tabelas
temporárias locais. Uma execução da fixture levou aproximadamente 0,69 ms, com
planejamento de 0,93 ms. O plano apresentou agregação, Hash Join, Sort/Limit,
WindowAgg, Index Scan em stores e Bitmap Index Scan em product_stores. Houve
Sequential Scan nas tabelas pequenas (10 relações e 3 produtos), decisão esperada
para essa fixture. Foram observados hits em buffers locais, sem buffers temporários
de disco; esse cenário não representa volume ou latência de produção.

Os índices existentes foram preservados. Não há evidência suficiente para
recomendar um novo índice. Reavaliar em desenvolvimento com volume representativo,
observando linhas reais/estimadas, buffers e tempo; nenhum índice foi criado nas
tabelas da aplicação. Os índices temporários existem apenas dentro do teste.

## Validação local e revisão manual

Com o PostgreSQL de desenvolvimento já provisionado e o schema existente:

```sh
yarn lint
yarn typecheck
yarn test
TEST_DATABASE_URL='postgresql://usuario:senha@localhost:5432/banco_de_teste' yarn test
yarn build
NUXT_USE_SQL=true yarn dev
```

Configure `DATABASE_URL` ou `NUXT_DATABASE_URL` no ambiente local sem expor credenciais.
Não execute seed/migrate/push para validar esta mudança.

Exemplo de chamada na aplicação em execução:

```sh
curl -X POST http://localhost:3000/api/store/best \
  -H 'Content-Type: application/json' \
  -d '{"products":[{"productId":1,"quantity":2}],"latitude":-21.2076,"longitude":-50.4401,"priority":"price"}'
```

Use IDs reais do banco de desenvolvimento. Revise manualmente
`SearchProduct.vue`, `SelectedProductList.vue` e `BudgetResult.vue`: selecionar,
alterar quantidades, remover a zero, escolher destino, alternar prioridades, buscar,
abrir resultados, Seguir e gerar o PDF. A interação visual/PDF no navegador não foi
validada automaticamente. Também convém revisar o SQL com dados representativos.

## Neon PostgreSQL

Use uma branch Neon de desenvolvimento já provisionada, com o mesmo schema.
Configure `NUXT_USE_SQL=true`, `DATABASE_URL` com a URL dessa branch e, conforme a
configuração existente, `DATABASE_SSL=true`. Execute a aplicação e o POST acima.
A rota faz apenas leitura. Teste cobertura, estoque e prioridades com dados já
presentes nessa branch. Não aponte `TEST_DATABASE_URL` para Neon: a integração com
fixtures é deliberadamente restrita a localhost. Não foi realizado teste remoto
no Neon nem medição de performance com dados representativos.

## Confirmações

Não foram executados seed, migrate, db:push ou migrações destrutivas. Não foram
alterados dados existentes, adapter base, pool, configuração Neon/Vercel ou branch
main. Não foram instaladas dependências. Não houve merge ou push. As alterações
permanecem locais para revisão. Pendências: revisão visual/PDF e análise de carga
representativa/Neon; nenhuma implementação ficou parcialmente preenchida.
