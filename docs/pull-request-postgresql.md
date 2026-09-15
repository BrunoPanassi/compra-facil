## Objetivo e arquitetura

Adiciona persistência PostgreSQL selecionável por configuração, mantendo frontend Nuxt/Vue, SSR e server/api no mesmo projeto Vercel. Nitro gera Vercel Functions Node.js; PostgreSQL fica em serviço gerenciado externo e Docker somente no desenvolvimento. Base correta deste repositório: `master`, confirmada pelo responsável.

## Mudanças

- Schemas/migration Drizzle, SqlAdapter e repositories com CRUD, paginação/pesquisa SQL e JOIN de produtos por loja.
- Pool lazy reutilizável por instância, max=3, timeouts/SSL configuráveis e attachDatabasePool somente na Vercel.
- DATABASE_URL privada, JSONBin por configuração explícita e sem fallback automático.
- DTO público de usuário sem senha/hash/token, validação de entradas/updates, erros controlados e health check sem dados internos.
- CEP/telefone como strings; preço decimal como string, IDs/quantidade numéricos, imagens como array.
- Chave de imagens movida do cliente para variável privada; .env removido do índice e preservado localmente.
- Seed de desenvolvimento com guard explícito e migrations exclusivamente por comando.
- Typecheck, lint oficial proporcional e testes com node:test/tsx; correções pontuais de template/tipos e empacotamento SSR.

## Configuração e banco gerenciado

Provisionar manualmente PostgreSQL compatível e próximo da região das funções. Usar bancos separados para Preview e Production. Configurar NUXT_USE_SQL=true, DATABASE_URL e TLS no painel Vercel. Não há dependência de provedor específico. Detalhes em docs/deployment-postgresql.md e .env.example.

Migrations: backup → conferir ambiente/URL direta → yarn db:migrate → verificar → deploy autorizado. Nunca em build, startup ou requisição. Seed: apenas NODE_ENV=development yarn db:seed local, recusado na Vercel/produção. Nenhuma migration ou seed de produção foi executada.

## Validação

- Typecheck aprovado, zero erros.
- Lint aprovado, zero erros e 40 avisos legados documentados por arquivo.
- 15 testes unitários aprovados, sem Docker.
- Integração local aprovada: CRUD/WHERE/IDs, paginação/pesquisa, JOIN, loja vazia, FK, unicidade e rollback.
- Build aprovado sem URL de banco; build validado com PostgreSQL parado, sem apagar volume.
- Preview Node em modo production aprovado: SSR, assets, health, APIs, login sanitizado e CRUD de fixture.
- Banco parado: health/API 503 controlado, sem fallback. Reinício: recuperação na mesma instância.
- Fixtures removidas/revertidas e contagens preservadas.

## Como testar

```sh
yarn install --frozen-lockfile --non-interactive
yarn typecheck
yarn lint
yarn test
yarn build
```

Configurar TEST_DATABASE_URL local com schema previamente aplicado e executar yarn test:integration. Iniciar Nitro com NODE_ENV=production, NUXT_USE_SQL=true, DATABASE_URL local e porta 3100; executar node --import tsx tests/smoke/preview.ts. Consultar tests/README.md e docs/step4-validation.md.

## Riscos e limitações

- A autenticação legada não implementa sessão/autorização no servidor. Implementar controle de acesso por proprietário/papel e limites antes de exposição pública; sanitização não substitui autorização.
- Credenciais já estiveram no histórico público. Revogar/rotacionar; este PR não reescreve histórico.
- 40 avisos de lint, dependências Nuxt 2/peers legados e aviso de suporte do ESLint 9 ficam documentados. Versões transitivas de lint foram fixadas para Node 22.12 sem ignorar engines.
- Não houve Preview remoto, navegador interativo, teste de carga, TLS de provedor ou upload real. Cloudflare Workers não é alvo.
- COUNT e itens são consultas separadas; a contingência JSONBin não sincroniza dados.

## Rollback

Reimplantar a versão anterior compatível com o schema; migrations destrutivas exigem restauração/PITR ensaiada. JSONBin só pode ser habilitado manualmente após avaliar consistência/defasagem e configurar credenciais. Não há rollback automático de dados.

## Checklist

- [x] Frontend e API preservados no mesmo Nuxt/Vercel.
- [x] Typecheck, lint, unitários, integração, build e preview executados.
- [x] Pool lazy e DATABASE_URL privada; seed guardado; migrations separadas.
- [x] Respostas sem senha/hash/SQL/credenciais; ausência de fallback testada.
- [x] Documentação, baseline e limitações registrados.
- [x] Nenhuma alteração direta em master/main; nenhum merge ou deploy de produção.
- [ ] Rotacionar credenciais históricas e implementar sessão/autorização antes de produção.
- [ ] Provisionar staging, configurar variáveis manualmente e validar Preview Vercel.
- [ ] Revisão humana e checks remotos antes de integração.
