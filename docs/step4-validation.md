# Etapa 4 — validação e entrega

## Escopo e versões

Base `master`, confirmada pelo responsável porque `main` não existe no repositório nem no remoto. Trabalho em `sql-adapter`; árvore inicialmente limpa. Base preservada: `1d898e1015e66af3c84a8a72aec3c86926a86e77`.

| Componente | Versão |
| --- | --- |
| Node | 22.12.0 |
| Yarn | 1.22.19 |
| Nuxt | 3.19.2 |
| Vue | 3.5.22 |
| Nitro | 2.12.6 |
| PostgreSQL local | 17 (Docker) |
| Drizzle ORM / Kit | 0.45.2 / 0.31.10 |
| pg | 8.23.0 |
| TypeScript / vue-tsc (adicionados) | 5.9.3 / 3.1.1 |
| ESLint / @nuxt/eslint (adicionados) | 9.39.5 / 1.9.0 |
| @vercel/functions (adicionado) | 3.4.0 |

Módulos ativos: vuetify-nuxt-module, @pinia/nuxt, @nuxt/fonts, @nuxtjs/leaflet e o novo @nuxt/eslint. Local: preset node-server; Vercel: detecção automática do preset Node. Nenhum preset Edge ou backend paralelo.

As primeiras tentativas de instalar lint foram recusadas por engines de dependências transitivas mais recentes. Foram fixados parser Vue, plugin Vue, parser/plugin/utils TypeScript, inspector e gitignore no `resolutions`, sem `ignore-engines`. Yarn lock foi atualizado. ESLint 9 permanece necessário à integração escolhida; o registro emite aviso de fim de suporte. Planejar atualização coordenada de Node/ESLint/Nuxt separadamente. Permanecem avisos de peers de módulos existentes, inclusive pacotes Nuxt 2 legados; não foram removidos indiscriminadamente.

## Scripts e configuração

Adicionados `typecheck`, `lint:fix`, `test`, `test:watch`, `test:integration`, `db:seed`; corrigido `lint`. Mantidos `build`, `preview`, `db:generate`, `db:migrate`, `db:studio`, scripts Docker e `indexmjs`.

Typecheck usa `nuxi typecheck` e os executáveis locais instalados. Mantém `tsconfig.json` herdando `.nuxt/tsconfig.json`. Não foram adicionados any, ts-ignore ou exclusões para esconder erros. A tentativa inicial sem TypeScript/vue-tsc falhou no fallback de resolução do CLI, sem instalação bem-sucedida; as dependências foram então instaladas explicitamente.

Lint usa flat config oficial, ignora somente artefatos, sem lint:fix global. Regras estéticas foram deixadas fora da adoção inicial; warnings de any/variáveis não usadas continuam visíveis. Database, SqlAdapter e utils têm regras de promises e any como erros. Templates inválidos e imports de tipos com efeito colateral foram corrigidos pontualmente.

## Resultados locais (15/09/2026)

| Verificação | Resultado |
| --- | --- |
| `yarn typecheck` | Aprovado, zero erros |
| `yarn lint` | Aprovado, zero erros e 40 avisos |
| `yarn test` | 15/15 aprovados |
| `yarn test:watch` | 15/15; observação via tsx, ignorando artefatos |
| Integração PostgreSQL | 1 cenário composto aprovado, com todas as operações descritas em tests/README |
| Build sem DATABASE_URL/NUXT_DATABASE_URL e sem carregar .env | Aprovado |
| Build com PostgreSQL local parado | Aprovado, volume preservado |
| Preview Nitro em Node, NODE_ENV=production, SQL explícito | Aprovado |
| SSR da página inicial e asset JavaScript | HTTP 200 |
| Health, listagens, busca, paginação e loja sem produtos | Aprovados |
| IDs/paginação inválidos | HTTP 400 |
| Login fictício / senha incorreta | HTTP 200 sem hash / HTTP 401 |
| Criação, atualização e exclusão de fixture | Aprovadas; contagens restauradas |
| Banco indisponível | Health/API HTTP 503 controlado, sem SQL/URL/hash/stack nem fallback |
| Recuperação | Mesma instância do preview voltou a responder após reiniciar PostgreSQL |
| `git diff --check` | Aprovado antes do commit |

O preview inicialmente revelou falhas preexistentes de tracing CommonJS/ESM entre Pinia, Vue Router e Vue Devtools. O build agora inclui esses pacotes no bundle SSR, com Vue tratado como dependência ESM pelo transformador CommonJS. O preview foi repetido e aprovado após a correção.

## Baseline e limitações

O erro legado de tipagem encontrado em BudgetResult era a ampliação dos literais jpeg/portrait para string; corrigido com literais const. Foram corrigidos também HTML inválido, chave de v-for e uso de v-text em componentes. Os avisos restantes do lint estão listados abaixo. Nenhuma pasta de código foi ignorada para produzir aprovação.

Não foi executado teste interativo de navegador, upload real de imagens, Preview remoto na Vercel, conexão TLS com provedor gerenciado, teste de carga ou failover de infraestrutura. A integração usa uma conexão local explícita e reverte fixtures; sequences podem avançar. Não houve seed, migration, TRUNCATE, DROP ou alteração dos dois usuários existentes. O PostgreSQL foi reiniciado e permanece disponível.

**Bloqueadores de exposição pública:** sessão e autorização no servidor ainda inexistentes no sistema legado; implementar autorização por dono/papel, proteção de uploads e limites de autenticação. As melhorias desta etapa não tornam o sistema pronto para exposição irrestrita.

**Credenciais históricas:** `.env` foi removido do índice preservando o arquivo local; uma chave de imagens foi removida do cliente. Revogar/rotacionar credenciais já expostas no histórico público. O diff contém remoções desses valores, não novos segredos. Não foi reescrito o histórico. Exemplos novos contêm somente placeholders ou dados de teste.

## Produção

Frontend, SSR e API permanecem na mesma Vercel. Banco gerenciado deve ser provisionado manualmente. DATABASE_URL privada, pool lazy reutilizável, max=3, timeouts e SSL verificável; attachDatabasePool somente em VERCEL=1. Migrations separadas por comando, nunca em build/startup. Seed bloqueado fora do desenvolvimento local. JSONBin somente por escolha explícita, sem sincronização automática.

Consulte [deployment-postgresql.md](deployment-postgresql.md) para região, provedor, SSL, variáveis Development/Preview/Production, migrations, smoke tests e rollback.

## Git e passos restantes

A descrição completa do PR está em [pull-request-postgresql.md](pull-request-postgresql.md). Destino autorizado: `sql-adapter` → `master`. Não realizar merge nem deploy nesta etapa. Se o Git local não conseguir autenticar o push, executar manualmente:

```sh
git push origin sql-adapter
gh pr create --head sql-adapter --base master --title "feat: add PostgreSQL persistence with SQL adapter" --body-file docs/pull-request-postgresql.md
```

Não inserir token na conversa. Verificar checks remotos e concluir os bloqueadores de segurança antes de produção. Nenhum banco externo, variável Vercel, migration/seed de produção, push para master/main ou merge foi autorizado/executado.

## Avisos do lint preservados

| Arquivo | Avisos |
| --- | ---: |
| `components/AddressPicker.vue` | 8 |
| `components/AppBarNavigationDrawer.vue` | 2 |
| `components/BudgetProductList.vue` | 1 |
| `components/BudgetResult.vue` | 1 |
| `components/ConfirmDialog.vue` | 2 |
| `components/CrudCard.vue` | 4 |
| `components/DeleteDialog.vue` | 1 |
| `components/DialogForm.vue` | 1 |
| `components/FormDialog.vue` | 1 |
| `components/LeafletMap.vue` | 1 |
| `components/LoginForm.vue` | 3 |
| `components/ProductCard.vue` | 5 |
| `components/ProductCombobox.vue` | 2 |
| `pages/index.vue` | 1 |
| `pages/store.vue` | 2 |
| `server/scripts/migrateToJsonBin.ts` | 1 |
| `server/services/UserLocationService.ts` | 1 |
| `stores/product.ts` | 1 |
| `util/image.ts` | 2 |

Regras: `vue/require-default-prop` (11), `@typescript-eslint/no-explicit-any` (17), `@typescript-eslint/no-unused-vars` (11), `vue/no-template-shadow` (1).

## Arquivos alterados nesta etapa

- `.env`: removido somente do índice, arquivo local preservado.
- `.env.example`
- `.gitignore`
- `components/AppBarNavigationDrawer.vue`
- `components/BudgetResult.vue`
- `components/ConfirmDialog.vue`
- `components/CrudCard.vue`
- `components/ProductCard.vue`
- `components/StoreCard.vue`
- `docs/deployment-postgresql.md`
- `docs/pull-request-postgresql.md`
- `docs/step4-validation.md`
- `drizzle.config.ts`
- `eslint.config.mjs`
- `nuxt.config.ts`
- `package.json`
- `server/adapters/JSONBinAdapter.ts`
- `server/api/health.get.ts`
- `server/api/image.post.ts`
- `server/api/material-type/[id].delete.ts`
- `server/api/material-type/[id].put.ts`
- `server/api/material-type/index.post.ts`
- `server/api/material-type/index.ts`
- `server/api/material/[id].delete.ts`
- `server/api/material/[id].put.ts`
- `server/api/material/index.ts`
- `server/api/product-store/[id].delete.ts`
- `server/api/product-store/[id].put.ts`
- `server/api/product-store/index.ts`
- `server/api/product-store/store.get.ts`
- `server/api/product/[id].delete.ts`
- `server/api/product/[id].put.ts`
- `server/api/product/index.ts`
- `server/api/search-address/open-street-map-url.get.ts`
- `server/api/search-address/photon-map-url.get.ts`
- `server/api/store/[id].delete.ts`
- `server/api/store/[id].put.ts`
- `server/api/store/by-owner.get.ts`
- `server/api/store/index.post.ts`
- `server/api/store/index.ts`
- `server/api/user/login.post.ts`
- `server/api/user/register.post.ts`
- `server/api/via-cep/[cep].ts`
- `server/database/client.ts`
- `server/database/entity-map.ts`
- `server/database/pool-options.ts`
- `server/database/seeds/README.md`
- `server/database/seeds/development-demo.sql`
- `server/database/seeds/guard.ts`
- `server/database/seeds/run.ts`
- `server/repositories/BaseRepository.ts`
- `server/repositories/ProductStoreRepository.ts`
- `server/repositories/UserRepository.ts`
- `server/scripts/migrateToJsonBin.ts`
- `server/services/BaseService.ts`
- `server/services/ProductService.ts`
- `server/services/UserService.ts`
- `server/utils/adapter.ts`
- `server/utils/api-handler.ts`
- `server/utils/pagination.ts`
- `server/utils/public-error.ts`
- `server/utils/public-user.ts`
- `server/utils/validation.ts`
- `stores/auth.ts`
- `stores/store.ts`
- `tests/README.md`
- `tests/integration/postgresql.test.ts`
- `tests/queries.test.ts`
- `tests/runtime.ts`
- `tests/security.test.ts`
- `tests/smoke/preview.ts`
- `types/Address.ts`
- `types/Material.ts`
- `types/OrderAmount.ts`
- `types/ProductStore.ts`
- `types/Store.ts`
- `types/User.ts`
- `util/image.ts`
- `util/rule.ts`
- `yarn.lock`

## Resultado do envio

Commit principal local: `266f38f` (`chore: prepare PostgreSQL persistence for production`). O push HTTPS foi tentado somente para `sql-adapter` e falhou porque não há credencial Git local configurada (`could not read Username`, prompts desabilitados). O conector GitHub consegue consultar o repositório, mas não foi usado para criar PR de uma branch remota desatualizada. Nenhum token foi solicitado.

PR preparado em `docs/pull-request-postgresql.md`; não criado. Após configurar autenticação Git local, execute os comandos acima. Não existem checks remotos deste commit, pois ele não foi enviado. Todos os resultados de checks neste relatório são locais.

A revisão acumulada contra master encontrou sete espaços no fim de linhas oriundos das etapas anteriores; foram removidos em uma limpeza final, sem alteração de comportamento.
