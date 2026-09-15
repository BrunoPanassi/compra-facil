# Testes e verificações

- `yarn typecheck`: Nuxt e vue-tsc locais, sem instalação implícita.
- `yarn lint`: configuração oficial `@nuxt/eslint`; erros reais bloqueiam, dívida legada permanece como avisos.
- `yarn test`: 15 testes com `node:test` + tsx. Sem Docker ou rede externa.
- `yarn test:watch`: mesmos testes em observação.
- `yarn test:integration`: opt-in por `TEST_DATABASE_URL`, exclusivamente local, com schema previamente aplicado. Sem variável, registra skipped, não aprovação da integração.

## Cobertura

`queries.test.ts`: SQL parametrizado, propriedades permitidas/inválidas, pesquisa literal, paginação sem getAll, ordenação, COUNT, JOIN por loja, ausência de produtos, JSONBin simulado e consumo de uma resposta enriquecida no frontend.

`security.test.ts`: configuração SQL/JSONBin e padrão, DTO público sem senha/hash/token, erros sem SQL/credenciais/stack, limites de paginação, validação de IDs e payloads, serialização de CEP/telefone/preço/quantidade/imagens, pool e guard do seed.

`integration/postgresql.test.ts`: getAll/getById/getByIds, inserção com ID, update/delete com WHERE preservando outro registro, pesquisa/paginação reais, JOIN, loja sem produtos, FK, índice único e rollback após erro. Todos os registros têm marcador `step4-test-`; a transação é revertida em finally. Não usa TRUNCATE/DROP nem modifica fixtures preexistentes. Sequences podem avançar.

`smoke/preview.ts`: execute com `node --import tsx tests/smoke/preview.ts`, depois de iniciar o Nitro em `127.0.0.1:3100`, com `DATABASE_URL` local. Verifica SSR, asset, rotas, login fictício sanitizado, pesquisa/paginação e CRUD. Faz cleanup somente de IDs e marcadores próprios. Com `--unavailable`, espera health/API 503, sem fallback. Não substitui testes interativos de navegador ou um Preview real na Vercel.

## Contratos

IDs são números inteiros positivos; CEP e telefone são strings para preservar zeros. `price` é string decimal não negativa com até duas casas (PostgreSQL retorna duas); `quantity` é inteiro não negativo; `images` é array de strings. Paginação padrão: page=1/perPage=10, máximo 100 itens, busca até 200 caracteres. Propriedade de busca desconhecida retorna zero resultados quando search está preenchido, preservando o contrato anterior; busca vazia não aplica filtro. Não há fallback automático para JSONBin.

Veja [implantação](../docs/deployment-postgresql.md) e [relatório da etapa 4](../docs/step4-validation.md) para resultados e limitações.
