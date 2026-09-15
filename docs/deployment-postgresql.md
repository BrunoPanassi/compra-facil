# PostgreSQL e implantação na Vercel

## Arquitetura

O frontend Nuxt/Vue, SSR e `server/api` permanecem no mesmo projeto. Nitro converte as rotas em Vercel Functions com runtime Node.js; não há API externa paralela. Nitro 2.12.6 detecta a Vercel automaticamente. A configuração inclui Pinia/Vue Router e suas dependências Devtools no bundle SSR para evitar resolução incorreta de uma dependência transitiva pelo tracing do Nitro. Não configure `vercel-edge`: `pg` usa TCP e o runtime Node.js. Docker Compose e seu volume PostgreSQL são somente locais e não serão publicados.

## Provedor e região

Provisione manualmente PostgreSQL gerenciado: Vercel Marketplace, Neon, Supabase, Railway, Amazon RDS ou outro serviço compatível. Compare backup/PITR, limites de conexões, disponibilidade regional, rede, custo e suporte a pooling. Escolha a região do banco próxima da região das funções Vercel. Não basta escolher uma região próxima dos visitantes: latência entre função e banco afeta cada consulta.

Obtenha a connection string no painel do provedor. Prefira o endpoint de pooling recomendado para serverless, com usuário de aplicação de privilégio mínimo. Use uma conexão direta separada para migrations, se exigido pelo provedor. Não coloque IP fixo, localhost, credenciais ou URLs reais no código/documentação.

## Variáveis privadas

Cadastre manualmente em Project Settings → Environment Variables da Vercel, selecionando cada ambiente. Faça novo deploy após alterações. Nunca use `runtimeConfig.public` para segredos.

| Variável | Development local | Preview | Production |
| --- | --- | --- | --- |
| `NUXT_USE_SQL` | `true` | `true` | `true` |
| `DATABASE_URL` | PostgreSQL local | Banco de staging | Banco de produção |
| `NODE_ENV` | `development` | `production` | `production` |
| `DATABASE_SSL` | `false` | `true` | `true` |
| `DATABASE_POOL_MAX` | `3` | `3` | `3` |

`DATABASE_URL` é lida somente no servidor, no primeiro acesso ao banco. `NUXT_DATABASE_URL` continua aceito como alias legado de menor prioridade. `NUXT_USE_SQL` prevalece sobre o legado `PRIVATE_USE_SQL`; ausência seleciona JSONBin. Configure explicitamente `NUXT_USE_SQL` em cada ambiente.

`DATABASE_CONNECT_TIMEOUT_MS=5000`, `DATABASE_IDLE_TIMEOUT_MS=10000` e `DATABASE_STATEMENT_TIMEOUT_MS=10000` são os padrões. Ajuste conforme limites do provedor. `DATABASE_DIRECT_URL` é exclusiva do comando de migrations; nela configure SSL pela connection string conforme o provedor (por exemplo, `sslmode=verify-full`). As opções `DATABASE_SSL*` do pool da aplicação não são aplicadas automaticamente pelo Drizzle Kit. `IMAGE_HOSTING_API_KEY` fica apenas no backend. Consulte `.env.example` para mapas e JSONBin.

Preview e Production devem usar bancos diferentes. A Vercel não acessa o Docker local. Não copie o `.env` local para a configuração de produção.

## SSL e pool

O pool é lazy, compartilhado por instância aquecida e limitado a três conexões por padrão. O total potencial depende do número de instâncias, portanto combine limite conservador com pooling do provedor. Não há pool por repository, conexão no build, migration em cold start ou fallback após erro.

`DATABASE_SSL=true` exige verificação do certificado e prevalece sobre parâmetros SSL da URL. Para CA privada, configure `DATABASE_SSL_CA` com o PEM (aceita `\n`). Nunca desative `rejectUnauthorized`. `DATABASE_SSL=false` deixa a configuração SSL da connection string ser interpretada pelo pg; use somente com a configuração adequada ao ambiente.

`attachDatabasePool` de `@vercel/functions` é chamado uma única vez na criação do pool quando `VERCEL=1`, para gerenciamento de conexões ociosas no Fluid Compute. Localmente e em testes essa integração não é ativada. Referências: [pooling Vercel](https://vercel.com/kb/guide/connection-pooling-with-functions), [API attachDatabasePool](https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package).

## Migrations separadas

Nunca execute migrations em build, postinstall, startup, requisição ou health check. O comando explícito é `yarn db:migrate`.

1. Faça backup e verifique a restauração/PITR.
2. Confira o ambiente e injete `DATABASE_DIRECT_URL` ou `DATABASE_URL` corretos pelo mecanismo de segredos; não coloque a URL no histórico do shell.
3. Execute `yarn db:migrate` em uma estação ou job autorizado com acesso ao banco.
4. Verifique o resultado e a compatibilidade do schema com a versão atual e a próxima versão da aplicação.
5. Só então faça deploy da aplicação.

Migrations de produção não foram autorizadas nesta etapa. Prefira alterações aditivas compatíveis com rollback da aplicação. `db:generate` gera arquivos para revisão; não altera o banco.

## Seed

Execute somente `NODE_ENV=development yarn db:seed` localmente. O runner recusa produção, ambientes Vercel, ambiente ausente e host remoto. O SQL exige um marcador de sessão definido pelo runner. A proteção não substitui permissões de banco: um administrador pode editar SQL ou definir marcadores manualmente.

O seed continua recusando bases incompatíveis e não modifica os dois usuários existentes. Não execute o seed em Preview, Production, migration, build ou startup. Não execute novamente em uma base já populada. Veja as pré-condições em `server/database/seeds/README.md`.

## Validações locais

```sh
yarn install --frozen-lockfile --non-interactive
yarn typecheck
yarn lint
yarn test
yarn build
```

Testes unitários usam `node:test` e `tsx`, sem Docker nem JSONBin remoto. `yarn test:integration` requer `TEST_DATABASE_URL` explicitamente configurada para PostgreSQL local com schema aplicado; sem ela, o teste é marcado como skipped. Fixtures usam transação revertida e savepoints, sem TRUNCATE, DROP ou limpeza de registros existentes. Consomem valores das sequences mesmo com rollback.

Para preview, configure as variáveis privadas no processo (`NODE_ENV=production`, `NUXT_USE_SQL=true`, `DATABASE_URL` local) e execute `yarn preview` ou `node .output/server/index.mjs`. O entrypoint Nitro não carrega `.env` automaticamente.

Smoke tests: `/`, assets `/_nuxt/`, `/api/health`, login, listagens, busca/paginação, `/api/product-store/store?store_id=<id>`, cadastro/atualização/exclusão de fixture própria e ausência de campos sensíveis. Health retorna apenas aplicação, adapter e disponibilidade do banco.

Para testar build sem banco, quando o container local for exclusivo do trabalho: `docker compose stop postgres`, `yarn build`, `docker compose start postgres`. Nunca use `down -v`. Para indisponibilidade, mantenha o preview ativo, pare o banco, confira health 503 e API 503 sem detalhes internos, reinicie e confirme recuperação. Não execute esses procedimentos contra produção.

## Preview e produção

Após configurar staging e executar migrations separadamente, publique manualmente um Preview da branch `sql-adapter`. Repita os smoke tests e confira região, TLS, limites de conexão e logs sem segredos. Não use o banco de produção em Preview.

A base deste repositório é `master` (confirmado pelo responsável), não `main`. Após revisão, checks e autorização de merge, a integração em `master` pode acionar o fluxo de deploy configurado na Vercel. Esta tarefa não faz merge nem deploy de produção.

## Rollback e contingência

Republique a versão anterior da aplicação se compatível com o schema. Para alterações destrutivas de dados, use backup/PITR com procedimento ensaiado; Drizzle não desfaz migrations automaticamente. Evite restaurar uma base sem planejar a recuperação das escritas posteriores ao backup.

JSONBin permanece uma contingência manual: configure `NUXT_USE_SQL=false`, `JSONBIN_BASE_URL`, `JSONBIN_API_KEY` e os seis `JSONBIN_*_ID`, depois faça um deploy autorizado. Não há sincronização automática entre os bancos; avaliar defasagem, conflitos e consistência antes de trocar. Falha SQL nunca provoca fallback automático.

## Limitações e segurança preexistente

Cloudflare Workers não é alvo desta configuração: `pg`/TCP e bcrypt nativo pressupõem Node.js. Exigiria uma revisão específica de driver, bindings e autenticação.

A aplicação preexistente usa identidade no Pinia e não possui sessão autenticada validada pelo servidor nem autorização nas rotas CRUD. Sanitização, validação e bloqueio de autoatribuição de ADMIN não resolvem essa ausência. Antes de disponibilizar publicamente, implementar sessão, autorização por proprietário/papel, proteção de uploads, limitação de tentativas de login e política de acesso. Não considerar esta etapa uma certificação de segurança para produção.

O `.env` já estava versionado e uma chave de imagens estava no código cliente. Remover do índice/código não remove o histórico: revogue/rotacione credenciais potencialmente expostas antes de qualquer produção. Não houve reescrita de histórico nesta etapa.
