# Seed demonstrativo de desenvolvimento

O arquivo [development-demo.sql](development-demo.sql) prepara um catálogo pequeno de materiais de construção brasileiros. Não importa os arquivos JSON nem consulta o JSONBin. Nenhuma imagem é gerada ou referenciada. Não há integração automática com startup, migrations ou produção.

Todos os estabelecimentos, ofertas, estoques e combinações comerciais são fictícios. Marcas conhecidas são referências ilustrativas, sem parceria, vínculo, endosso, catálogo oficial ou disponibilidade comprovada. Os preços não são cotações atuais. Não existem contatos reais, CNPJ ou identidade jurídica de empresas neste conjunto.

## Estrutura inspecionada

Foram lidos os schemas, index, migration e metadados, tipos TypeScript, SqlAdapter, entity-map, repositories de Product/ProductStore/Store, consultas, package.json, Compose e .env.example. Em 12/09/2026, também foram consultados os metadados de `public` do PostgreSQL 17 no container `compra-facil-app-postgres-1`, identificado pelo Docker Compose deste projeto. Banco e usuário da sessão: `compra_facil`; porta publicada: 5432. A conexão de teste foi por socket dentro do container, por isso `inet_server_addr()` e `inet_server_port()` retornaram NULL. Isso não serve como comprovação de localidade para outra conexão.

Todas as PKs são `id integer` com default `nextval`, originadas de `serial`, sem identity. Nomes SQL usam snake_case. Os atributos camelCase do Drizzle são traduzidos explicitamente pelo entity-map.

| Tabela | Colunas do banco atual |
| --- | --- |
| `material_types` | `id`, `name text NOT NULL` |
| `materials` | `id`, `name text NOT NULL`, `weight numeric(12,3) NULL`, `type_id integer NOT NULL` |
| `products` | `id`, `name/brand text NOT NULL`, `desc text NULL`, `material_id integer NOT NULL`, `images text[] NOT NULL` sem default |
| `stores` | `id`; `name/street/neighbr/city/state/zip/cellphone text NOT NULL`; `nr/owner_id integer NOT NULL`; `lat/lon numeric(10,7) NOT NULL`; `description/cellphone_second/email/facebook/instagram/another text NULL` |
| `product_stores` | `id`, `id_store/id_product integer NOT NULL`, `price numeric(12,2) NOT NULL`, `quantity integer NOT NULL` |
| `users` | `id`; metadados confirmam campos text obrigatórios e enum `user_role`, sem leitura de seus valores pessoais |

Foreign keys: `materials.type_id → material_types.id`, `products.material_id → materials.id`, `stores.owner_id → users.id`, `product_stores.id_store → stores.id` e `product_stores.id_product → products.id`. Todas usam RESTRICT na exclusão e CASCADE na atualização. Há índices nas FKs; o par `(id_store,id_product)` tem índice UNIQUE. Checks exigem preço e quantidade não negativos. `users.telefone` é UNIQUE, mas nenhum valor foi consultado. O schema não limita a uma loja por owner nem exige determinado role nessa FK.

A migration inicial ainda declara `materials.brand`, ausente no schema TypeScript e no banco atual. O seed não usa essa coluna, que era nullable; nenhuma migration ou schema foi alterado. O preço fica somente em `product_stores`; o adapter o retorna como string decimal. `images` recebe `ARRAY[]::text[]`.

## Volume e catálogo

| Tabela | Novos registros |
| --- | ---: |
| `material_types` | 8 |
| `materials` | 24 |
| `products` | 48 |
| `stores` | 8 |
| `product_stores` | 96 |
| **Total** | **184** |
| `users` | **0** |

As oito categorias são Cimentos e argamassas; Blocos e alvenaria; Areia, pedra e agregados; Telhas e coberturas; Hidráulica; Elétrica; Pisos e revestimentos; Tintas e acabamentos. Cobrem da alvenaria e cobertura às instalações e acabamento, com itens comuns no Brasil e variedade para pesquisa/paginação sem grande volume.

Cada categoria contém três materiais genéricos, cada material contém dois produtos comerciais. Material é uma classificação intermediária, não uma marca. `weight` fica NULL porque um grupo genérico pode conter várias embalagens; peso, dimensão, cor, classe e apresentação estão nos nomes dos produtos. Não se atribui peso arbitrário a tubo, tinta ou grupo inteiro.

Marcas de referência: Votorantim, CSN, Quartzolit, Votomassa, Brasilit, Eternit, Vedacit, Viapol, Tigre, Amanco, Fortlev, Sil, Corfio, Schneider, Tramontina, Eliane, Cecafi, Portobello, Coral e Suvinil. Cerâmica Demo A/B, Blocos Demo A/B e Agregados Demo A/B são marcas inventadas. As combinações não representam SKUs oficiais. Nenhuma marca possui vínculo com o projeto.

## Lojas, owners e localização

A inspeção segura `SELECT id FROM public.users ORDER BY id` encontrou **1 e 2**, preservados. Os IDs são relidos na execução e ordenados; não estão fixados no SQL. Exatamente dois usuários são obrigatórios: qualquer outra quantidade provoca erro antes dos inserts. Cada owner recebe quatro lojas, duas em cada cidade.

| Chave local | Loja (prefixo `Loja Demo`) | Cidade/UF | Owner observado | Produtos |
| --- | --- | --- | ---: | ---: |
| 1 | Araçatuba Centro | Araçatuba/SP | 1 | 12 |
| 2 | Araçatuba Industrial | Araçatuba/SP | 2 | 12 |
| 3 | Araçatuba Santana | Araçatuba/SP | 1 | 12 |
| 4 | Araçatuba Nova Yorque | Araçatuba/SP | 2 | 12 |
| 5 | Curitiba Centro | Curitiba/PR | 1 | 12 |
| 6 | Curitiba Portão | Curitiba/PR | 2 | 12 |
| 7 | Curitiba Boqueirão | Curitiba/PR | 1 | 12 |
| 8 | Curitiba Capão Raso | Curitiba/PR | 2 | 12 |

Os nomes têm indicação explícita Demo para não se apresentar como comércio real. Não foi copiada a identidade de empresa existente. Os logradouros são referências de regiões urbanas; o campo `street` é intencionalmente `Região da ... (DEMO)`. Os números são inventados, respeitando os trechos postais consultados quando aplicável. Esse endereço sintético não é um endereço comercial utilizável. Nenhuma ausência absoluta de coincidência do número isolado é presumida.

CEPs e bairros foram conferidos em fontes públicas em 12/09/2026. As coordenadas são aproximações manuais de áreas urbanas distintas dessas cidades, sem geocodificação de imóvel, validação cadastral ou cópia de coordenada exata de estabelecimento. Servem para mapa/distância aproximada, não para entrega ou navegação. `cellphone='00000000000'` é deliberadamente inválido, necessário porque o campo é obrigatório. Contatos opcionais ficam NULL.

| Referência regional | Bairro | CEP | Fonte consultada |
| --- | --- | --- | --- |
| Rua Duque de Caxias, Araçatuba | Centro | 16010-410 | [CEPBrasil](https://cepbrasil.org/sao-paulo/aracatuba/centro/16010410) |
| Rua Tibiriçá, Araçatuba | Vila Industrial | 16072-000 | [ListaCEP](https://listacep.com/sp/aracatuba/vila-industrial) |
| Avenida do Fico, Araçatuba | Santana | 16050-500 | [Rua CEP](https://www.ruacep.com.br/sp/aracatuba/santana/16050500-avenida-do-fico/) |
| Rua Anhanguera, Araçatuba | Jardim Nova Yorque | 16018-390 | [Rua CEP](https://www.ruacep.com.br/sp/aracatuba/jardim-nova-yorque/16018390-rua-anhanguera/) |
| Rua Marechal Deodoro, Curitiba | Centro | 80060-010 | [Rua CEP](https://www.ruacep.com.br/pr/curitiba/centro/80060010-rua-marechal-deodoro/) |
| Avenida República Argentina, Curitiba | Portão | 80610-260 | [Rua CEP](https://www.ruacep.com.br/pr/curitiba/portao/80610260-avenida-republica-argentina/) |
| Avenida Marechal Floriano Peixoto, Curitiba | Boqueirão | 81650-000 | [Rua CEP](https://www.ruacep.com.br/pr/curitiba/boqueirao/81650000-avenida-marechal-floriano-peixoto/) |
| Avenida Winston Churchill, Curitiba | Capão Raso | 81150-050 | [Rua CEP](https://www.ruacep.com.br/pr/curitiba/capao-raso/81150050-avenida-winston-churchill/) |

## Ofertas e unidades

Todos os 48 produtos têm associação. Quatro produtos básicos (dois cimentos e duas argamassas) aparecem nas oito lojas. Outros 20 aparecem em duas lojas e 24 são exclusivos de uma loja. Há compartilhamento entre cidades e dentro de uma cidade. Cada loja combina básicos com uma seleção mais especializada, totalizando 12 itens, sem repetição do par loja/produto.

Preços-base são estimativas fictícias de demonstração, ajustadas à apresentação: cimento 50 kg em torno de R$ 35–39, conexão pequena em torno de R$ 2–4, cabo por rolo de 100 m em torno de R$ 215–226, tinta 18 L em torno de R$ 306–349. Aplicou-se um fator por loja de 0,95 a 1,055, com incremento de 0,015 e arredondamento a centavos. Os valores finais estão explícitos no SQL, com ponto decimal. Não houve pesquisa de cotação atual ou promessa de preço oficial.

A aplicação não tem coluna de unidade comercial. Por isso cada preço/quantidade representa a embalagem indicada no nome: saco, barra, rolo, caixa, balde, lata ou peça. Pisos/revestimentos são vendidos **por caixa**, nunca misturando preço por m² com estoque por caixa. Agregados são sacos; não se simula quantidade fracionária de caminhão ou metro cúbico.

Estoques são inteiros entre 0 e 100, com cenários de falta, 1–5, 6–30 e 31–100. Caixas-d’água, mantas e telhas têm lotes menores; conexões e blocos, maiores; acabamentos têm quantidades intermediárias. Produtos compartilhados possuem variação de preço e estoque. Estoque zero é aceito pelo banco; o formulário atual usa verificações de valor truthy em alguns caminhos e precisa de validação visual separada para edição desse caso.

## IDs, reexecução e transação

Os inserts omitem IDs. Cada `RETURNING id` alimenta um array local de mapeamento em PL/pgSQL. Os números 1–48 no catálogo são chaves locais, sem relação com IDs reais ou sequências começando em 1. Não se busca relação por nome. Defaults também geram IDs das associações. A seção 8 verifica sequences dos cinco destinos, incremento, ausência de ciclo, capacidade e posição igual ou superior ao maior ID. Não usa `setval` nem modifica a sequence de usuários.

A execução exige todas as cinco tabelas vazias. É uma proteção deliberadamente conservadora: qualquer carga anterior, inclusive parcial ou renomeada, interrompe o seed com erro claro. Não há sobrescrita, limpeza automática ou `ON CONFLICT`. Locks transacionais evitam duas cargas simultâneas e mantêm os owners estáveis. Em desenvolvimento, execute sem escritas concorrentes; lock timeout é 5 s e statement timeout é 60 s. Não mantenha a transação aberta por longo tempo.

Toda a carga fica entre `BEGIN` e `COMMIT`. Os blocos de validação usam exceções reais (não apenas resultados visuais) para contagens, relacionamentos, distribuição, duplicatas, imagens e valores. Qualquer erro aborta a transação. Execute `ROLLBACK` na mesma conexão após falha. Nenhum comando destrutivo ou mudança estrutural está incluído.

**Sequences não são transacionais:** um ensaio com `ROLLBACK` desfaz os registros, mas pode consumir IDs. Isso é esperado e não exige restaurar sequences; lacunas não causam colisões. Os testes locais consumiram IDs somente dos destinos. Nenhum novo usuário foi inserido, modificado ou recriado.

## Execução pelo DBeaver

1. Inicie o PostgreSQL local do projeto. Existe o script `npm run db:up`; se Docker exigir privilégio administrativo, inicie o container manualmente, sem executar sudo automaticamente. O teste desta entrega usou o container já ativo.
2. Abra o DBeaver e selecione a conexão de desenvolvimento. Confira **host, porta, nome do banco, usuário e ambiente** nas propriedades da conexão. Não confunda localhost de um túnel com servidor local; 5432 isoladamente não comprova nada. Não copie credenciais para documentação ou logs.
3. Abra um SQL Editor vinculado à conexão e abra/cole `server/database/seeds/development-demo.sql`. Confira novamente a conexão ativa do editor. Use uma sessão sem transação anterior pendente.
4. Desative autocommit e commits intermediários/por instrução. Nas opções de processamento SQL, configure interrupção em erro, preferencialmente rollback em erro. Não escolha ignorar erros, execução paralela em abas separadas ou execução de instruções em conexões distintas.
5. Selecione somente as pré-consultas no início, até `FIM DAS PRÉ-CONSULTAS`. Execute essa seleção. Confira a identificação da sessão, exatamente dois IDs de usuários e contagens zero nas cinco tabelas. Não execute inserts se o destino não for o local esperado.
6. Para **ensaio sem persistência**, substitua o `COMMIT;` final por `ROLLBACK;` em uma cópia do editor. Execute todo esse conteúdo como script. Não envolva o arquivo original em outro `BEGIN`: o `COMMIT` interno confirmaria a carga.
7. Para **carga com revisão antes da confirmação**, selecione desde `BEGIN;` até antes da seção 11, excluindo `COMMIT;`, e execute a seleção como script na mesma conexão. Confira os resultados e só então execute `COMMIT;` como instrução separada, se desejar persistir. Para desistir, execute `ROLLBACK;` nessa conexão.
8. Para **carga já revisada**, o arquivo completo original pode ser executado como script, ciente de que seu `COMMIT` final persiste os dados automaticamente se não houver erro. O botão de autocommit desligado não bloqueia um `COMMIT` explícito.
9. Use o menu **SQL Editor → Execute SQL Script** (ou a opção equivalente no menu Execute do editor, conforme idioma/versão). Executar uma instrução roda somente a instrução selecionada/sob o cursor; executar script processa sequencialmente todas as instruções selecionadas ou do arquivo, inclusive blocos `DO`. Atalhos variam por sistema. Consulte a [documentação oficial de execução SQL do DBeaver](https://dbeaver.com/docs/dbeaver/SQL-Execution/).
10. As validações esperam 8/24/48/8/96 registros, quatro lojas por cidade, quatro por owner, 12 produtos por loja e zero linhas nas consultas de anomalias. Se houver erro ou divergência antes do commit, interrompa e execute `ROLLBACK`; investigue a causa antes de recomeçar.

O Codex executou apenas cópias terminadas em ROLLBACK; **não executou COMMIT**. A aplicação só exibirá esses dados depois da carga deliberada e quando estiver usando o adapter SQL já configurável no projeto. Nenhum arquivo de ambiente foi alterado.

## Conferência após execução

As consultas das seções 9 e 10 podem ser repetidas separadamente. Para identificar este seed depois de novos cadastros, use o marcador nas descrições (as contagens globais da primeira carga deixarão de ser exatas):

```sql
SELECT id, name, city, state, owner_id
FROM public.stores
WHERE description LIKE 'development-demo-v1.%'
ORDER BY id;

SELECT count(*) AS produtos_demo
FROM public.products
WHERE "desc" LIKE 'development-demo-v1.%';

SELECT count(*) AS ofertas_demo
FROM public.product_stores ps
JOIN public.stores s ON s.id = ps.id_store
WHERE s.description LIKE 'development-demo-v1.%';
```

Após a primeira carga: 8 lojas, 48 produtos e 96 ofertas. Ausência de marcador não autoriza reexecução sobre destinos ocupados: o bloqueio olha todas as tabelas. Não remova dados para contornar esse bloqueio; confirme o estado manualmente.

Exemplos de conferência somente leitura para pesquisa, filtro e paginação:

```sql
SELECT id, name, brand FROM public.products
WHERE name ILIKE '%cimento%' ORDER BY id LIMIT 10 OFFSET 0;
SELECT id, name, brand FROM public.products
WHERE brand ILIKE '%Tigre%' ORDER BY id LIMIT 10 OFFSET 0;
SELECT id, name FROM public.products ORDER BY id LIMIT 10 OFFSET 10;
SELECT ps.id_store, p.name, p.brand, ps.price, ps.quantity
FROM public.product_stores ps JOIN public.products p ON p.id = ps.id_product
WHERE ps.id_store = (
  SELECT min(id) FROM public.stores WHERE description LIKE 'development-demo-v1.%'
) ORDER BY p.id;
```

## Validações realizadas e limites

- PostgreSQL local real: sintaxe e execução completas aprovadas em transação encerrada com ROLLBACK. Contagens 8/24/48/8/96; FKs, UNIQUE, preços, estoques, imagens e distribuição aprovados. Todas as consultas de anomalias retornaram zero linhas. Ao final, os destinos estavam vazios e os IDs de usuários permaneciam 1 e 2.
- Proteção de reexecução: uma segunda tentativa na mesma transação foi recusada com o erro esperado, capturado em subtransação de teste; ao final, ROLLBACK. Cadastro adicional em `material_types` recebeu o próximo ID sem colisão; também desfeito. As sequences dos cinco destinos foram verificadas pelo próprio SQL.
- `npm run build`: aprovado.
- `npm run lint`: não pôde executar, pois `eslint` não está instalado (`eslint: not found`). Não foram instaladas dependências nem alterados scripts.
- Typecheck: não há script em package.json, nem executáveis locais `tsc`/`vue-tsc`; não executado. Build não equivale a typecheck.
- Testes existentes: 6/6 aprovados pelo comando documentado em `tests/README.md`: `TSX_TSCONFIG_PATH=tests/tsconfig.json node --import tsx --test --experimental-test-isolation=none tests/queries.test.ts`. Esses testes usam transporte simulado, inclusive JSONBin simulado; não leem o serviço JSONBin nem compõem dados do seed.
- O erro por número incorreto de usuários foi revisado no SQL, sem apagar, inserir ou modificar usuários para provocá-lo. Não houve teste interativo de DBeaver ou navegador.

`StoreRepository.findByOwner` retorna apenas a primeira loja do owner, apesar de o banco aceitar múltiplas. O seed testa a relação permitida pelo banco; não altera esse fluxo existente. Paginação atualmente existe nos repositories de produtos e associações; categorias, materiais e lojas não passam a ter paginação por causa do seed.

Coordenadas não são endereços geocodificados; telefone inválido pode não passar pelas regras de um formulário de edição; unidades ficam no nome, sem conversão automática; representações comerciais não substituem catálogo real. O conjunto não mede desempenho em grande escala. O drift entre migration e schema permanece documentado, sem reparação estrutural nesta etapa.

Etapa 4 não iniciada. Ficam para planejamento posterior: imagens, conferência visual dos fluxos com SQL, comportamento de múltiplas lojas por owner e edição de estoque zero, além de eventual normalização de unidades e revisão geográfica. Este trabalho não define nem implementa essas mudanças. Nenhum JSON foi migrado, usuário alterado, commit/push/PR/merge executado ou branch modificada; nenhuma operação Git remota foi realizada.
