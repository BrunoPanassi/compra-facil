# Validação das consultas

Execute com as dependências existentes:

```sh
TSX_TSCONFIG_PATH=tests/tsconfig.json node --import tsx --test --experimental-test-isolation=none tests/queries.test.ts
```

Os seis testes usam o query builder real do Drizzle com transporte PostgreSQL simulado e JSONBin simulado. Não acessam serviços nem modificam dados reais. Verificam parâmetros, whitelist, filtros, limite/offset, ordenação, delegação sem getAll, JOIN único, mapeamento, IDs inválidos, fallback JSON e estrutura do fluxo do componente. Não substituem integração com PostgreSQL nem teste de navegador.

Mapa de uso: ProductCombobox → stores/product.fetch → GET /api/product → ProductService.getPaginated → ProductRepository.getPaginated. A store product-store.fetch expõe GET /api/product-store → ProductStoreService.getPaginated → ProductStoreRepository.getPaginated; não foi encontrado consumidor visual dessa paginação. São os únicos dois repositories paginados e ambos usavam getAll. Material, MaterialType, Store e User não implementam paginação e foram preservados.

ProductCard.onStoreSelect → stores/product-store.byStore → GET /api/product-store/store → ProductStoreService.getByStore → ProductStoreRepository.getByStore agora retorna ProductStoreWithProduct[]. O tipo preserva id, id_store, id_product, price, quantity e acrescenta product. A segunda chamada a product.fetch com ids foi removida apenas desse fluxo; getByIds continua disponível para outros usos.

Paginação: contrato { items, total }, padrões page=1/perPage=10/prop=name; entradas inválidas retornam erro 400. COUNT e itens compartilham o filtro, com ORDER BY id, LIMIT e OFFSET. Propriedade desconhecida com search retorna zero correspondências; search vazio não filtra. A propriedade padrão name não existe na associação e continua sem correspondências quando há busca. Whitelists: products(id,name,brand,desc,material_id,images), product-store(id,id_store,id_product,price,quantity). Busca parcial sem trim, sem distinção de caixa, com caracteres especiais literais; números continuam pesquisados como texto e arrays como lista separada por vírgulas. Campos extras não declarados nas entidades JSON não são pesquisáveis.

JOIN: product_stores.id_product = products.id, WHERE product_stores.id_store parametrizado. Preço/quantidade vêm da associação; nome/marca/descrição/material/imagens vêm do produto. JSONBin compõe o mesmo formato no servidor com uma busca em lote e descarta associações órfãs, como o INNER JOIN. Não há N+1. A store Pinia foi alterada para tipar a resposta enriquecida; o utilitário compartilhado centraliza validação. Services não precisaram mudar.

Validações nesta execução: testes 6/6; yarn build aprovado; yarn lint indisponível (eslint ausente); nenhum script typecheck, tsc ou vue-tsc instalado; docker compose up -d bloqueado por permissão no socket; yarn db:migrate terminou com erro. Nenhum teste de integração real ou validação visual/Network SQL e JSONBin foi executado. Iniciar o PostgreSQL manualmente e concluir essas verificações antes de considerar todos os critérios de aceite atendidos.

Os índices product_stores_id_store_idx e product_stores_id_product_idx e o índice único composto já existem no schema e na migration inicial. Não foram criadas migrations. Busca por substring/conversão textual pode demandar índices especializados conforme métricas reais; nenhum índice adicional é proposto sem medição. COUNT e itens são consultas separadas e podem observar alterações concorrentes. Diferenças de locale entre lower do PostgreSQL e JavaScript devem ser verificadas com os dados reais.

Não houve importação, seed, alteração de autenticação, operação Git remota, commit ou início da terceira etapa.
