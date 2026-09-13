-- SOMENTE DESENVOLVIMENTO. Seed development-demo-v1: 184 registros fictícios.
-- Confirme host, porta, banco, usuário e ambiente na conexão; porta 5432 não prova localidade.
-- Não execute em produção. Leia README.md antes de executar.
-- Pré-consulta segura: execute somente até FIM DAS PRÉ-CONSULTAS para inspecionar.
SELECT current_database(), current_user, inet_server_addr(), inet_server_port();
SELECT id FROM public.users ORDER BY id;
SELECT 'material_types' AS tabela, count(*) AS quantidade FROM public.material_types
UNION ALL SELECT 'materials', count(*) FROM public.materials
UNION ALL SELECT 'products', count(*) FROM public.products
UNION ALL SELECT 'stores', count(*) FROM public.stores
UNION ALL SELECT 'product_stores', count(*) FROM public.product_stores;
-- FIM DAS PRÉ-CONSULTAS

BEGIN;
SET LOCAL search_path = pg_catalog, public;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
-- 1. Pré-validações. Serializa cargas e impede escritas concorrentes nas tabelas alvo.
LOCK TABLE public.material_types, public.materials, public.products,
           public.stores, public.product_stores IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.users IN SHARE MODE;

DO $seed$
DECLARE
    r record;
    owners integer[];
    type_ids integer[] := ARRAY[]::integer[];
    material_ids integer[] := ARRAY[]::integer[];
    product_ids integer[] := ARRAY[]::integer[];
    store_ids integer[] := ARRAY[]::integer[];
    generated_id integer;
BEGIN
    IF EXISTS (SELECT 1 FROM public.material_types)
       OR EXISTS (SELECT 1 FROM public.materials)
       OR EXISTS (SELECT 1 FROM public.products)
       OR EXISTS (SELECT 1 FROM public.stores)
       OR EXISTS (SELECT 1 FROM public.product_stores) THEN
        RAISE EXCEPTION 'Seed cancelado: tabelas de destino não estão vazias. Seed já existente ou estado incompatível; confira contagens e lojas Loja Demo no README. Nenhum dado será sobrescrito.';
    END IF;

    -- 2. Verificação dos usuários. Somente IDs; nunca cria ou modifica usuários.
    SELECT array_agg(id ORDER BY id) INTO owners FROM public.users;
    IF coalesce(cardinality(owners), 0) <> 2 THEN
        RAISE EXCEPTION 'Seed cancelado: esperados exatamente dois usuários existentes para owners; encontrados %.', coalesce(cardinality(owners), 0);
    END IF;
    RAISE NOTICE 'Owners existentes (IDs): %; quatro lojas por owner.', owners;

    -- 3. Inserção dos tipos. Chaves abaixo são posições locais, não IDs persistidos.
    FOR r IN SELECT * FROM (VALUES
      (1, 'Cimentos e argamassas'),
      (2, 'Blocos e alvenaria'),
      (3, 'Areia, pedra e agregados'),
      (4, 'Telhas e coberturas'),
      (5, 'Hidráulica'),
      (6, 'Elétrica'),
      (7, 'Pisos e revestimentos'),
      (8, 'Tintas e acabamentos')
    ) AS v(k, name) ORDER BY k LOOP
        INSERT INTO public.material_types (name) VALUES (r.name) RETURNING id INTO generated_id;
        type_ids[r.k] := generated_id;
    END LOOP;

    -- 4. Inserção dos materiais. Peso genérico indefinido; embalagem está no produto.
    FOR r IN SELECT * FROM (VALUES
      (1, 'Cimento Portland', 1),
      (2, 'Argamassa colante', 1),
      (3, 'Rejunte', 1),
      (4, 'Bloco cerâmico', 2),
      (5, 'Bloco de concreto', 2),
      (6, 'Tijolo maciço', 2),
      (7, 'Areia média', 3),
      (8, 'Pedra britada', 3),
      (9, 'Areia fina', 3),
      (10, 'Telha cerâmica', 4),
      (11, 'Telha de fibrocimento', 4),
      (12, 'Manta impermeabilizante', 4),
      (13, 'Tubo de PVC', 5),
      (14, 'Conexão hidráulica', 5),
      (15, 'Caixa-d’água', 5),
      (16, 'Cabo elétrico', 6),
      (17, 'Disjuntor', 6),
      (18, 'Eletroduto', 6),
      (19, 'Piso cerâmico', 7),
      (20, 'Porcelanato', 7),
      (21, 'Revestimento de parede', 7),
      (22, 'Tinta acrílica', 8),
      (23, 'Massa corrida', 8),
      (24, 'Selador', 8)
    ) AS v(k, name, type_key) ORDER BY k LOOP
        INSERT INTO public.materials (name, weight, type_id)
        VALUES (r.name, NULL, type_ids[r.type_key]) RETURNING id INTO generated_id;
        material_ids[r.k] := generated_id;
    END LOOP;

    -- 5. Inserção dos produtos. images é text[] NOT NULL sem default.
    -- Marcas são referências demonstrativas sem vínculo; modelos não são catálogo oficial.
    FOR r IN SELECT * FROM (VALUES
      (1, 'Cimento Portland CP II-F-32 50 kg', 'Votorantim', 1),
      (2, 'Cimento Portland CP II-E-32 50 kg', 'CSN', 1),
      (3, 'Argamassa AC-II Cinza 20 kg', 'Quartzolit', 2),
      (4, 'Argamassa AC-III Cinza 20 kg', 'Votomassa', 2),
      (5, 'Rejunte Flexível Cinza 1 kg', 'Quartzolit', 3),
      (6, 'Rejunte Flexível Branco 1 kg', 'Quartzolit', 3),
      (7, 'Bloco Cerâmico Vedação 9 × 19 × 29 cm - unidade', 'Cerâmica Demo A', 4),
      (8, 'Bloco Cerâmico Vedação 14 × 19 × 29 cm - unidade', 'Cerâmica Demo B', 4),
      (9, 'Bloco de Concreto Vedação 14 × 19 × 39 cm - unidade', 'Blocos Demo A', 5),
      (10, 'Bloco de Concreto Vedação 19 × 19 × 39 cm - unidade', 'Blocos Demo B', 5),
      (11, 'Tijolo Maciço Cerâmico 5 × 10 × 20 cm - unidade', 'Cerâmica Demo A', 6),
      (12, 'Tijolo Maciço Cerâmico 5 × 10 × 22 cm - unidade', 'Cerâmica Demo B', 6),
      (13, 'Areia Média Lavada - saco 20 kg', 'Agregados Demo A', 7),
      (14, 'Areia Média Peneirada - saco 25 kg', 'Agregados Demo B', 7),
      (15, 'Pedra Britada Nº 1 - saco 20 kg', 'Agregados Demo A', 8),
      (16, 'Pedra Britada Nº 0 - saco 20 kg', 'Agregados Demo B', 8),
      (17, 'Areia Fina Lavada - saco 20 kg', 'Agregados Demo A', 9),
      (18, 'Areia Fina Peneirada - saco 25 kg', 'Agregados Demo B', 9),
      (19, 'Telha Cerâmica Romana Natural - unidade', 'Cerâmica Demo A', 10),
      (20, 'Telha Cerâmica Portuguesa Natural - unidade', 'Cerâmica Demo B', 10),
      (21, 'Telha de Fibrocimento 6 mm 2,44 × 1,10 m - unidade', 'Brasilit', 11),
      (22, 'Telha de Fibrocimento 6 mm 3,05 × 1,10 m - unidade', 'Eternit', 11),
      (23, 'Manta Asfáltica Aluminizada 3 mm - rolo 10 m²', 'Vedacit', 12),
      (24, 'Manta Asfáltica Poliéster 3 mm - rolo 10 m²', 'Viapol', 12),
      (25, 'Tubo PVC Soldável 25 mm - barra 6 m', 'Tigre', 13),
      (26, 'Tubo PVC Soldável 32 mm - barra 6 m', 'Amanco', 13),
      (27, 'Joelho PVC Soldável 90° 25 mm - unidade', 'Tigre', 14),
      (28, 'Tê PVC Soldável 25 mm - unidade', 'Amanco', 14),
      (29, 'Caixa-d’água Polietileno 500 L com Tampa - unidade', 'Tigre', 15),
      (30, 'Caixa-d’água Polietileno 1000 L com Tampa - unidade', 'Fortlev', 15),
      (31, 'Cabo Flexível 2,5 mm² Azul 750 V - rolo 100 m', 'Sil', 16),
      (32, 'Cabo Flexível 2,5 mm² Preto 750 V - rolo 100 m', 'Corfio', 16),
      (33, 'Disjuntor DIN Bipolar 32 A Curva C - unidade', 'Schneider', 17),
      (34, 'Disjuntor DIN Unipolar 20 A Curva C - unidade', 'Tramontina', 17),
      (35, 'Eletroduto Corrugado Amarelo 20 mm - rolo 25 m', 'Tigre', 18),
      (36, 'Eletroduto Corrugado Amarelo 25 mm - rolo 25 m', 'Amanco', 18),
      (37, 'Piso Cerâmico Bege 60 × 60 cm - caixa 2,16 m²', 'Eliane', 19),
      (38, 'Piso Cerâmico Cinza 45 × 45 cm - caixa 2,02 m²', 'Cecafi', 19),
      (39, 'Porcelanato Acetinado Cinza 60 × 60 cm - caixa 1,44 m²', 'Portobello', 20),
      (40, 'Porcelanato Acetinado Bege 60 × 60 cm - caixa 1,44 m²', 'Eliane', 20),
      (41, 'Revestimento de Parede Branco 30 × 60 cm - caixa 1,80 m²', 'Eliane', 21),
      (42, 'Revestimento de Parede Bege 30 × 60 cm - caixa 1,80 m²', 'Portobello', 21),
      (43, 'Tinta Acrílica Fosca Branca 18 L - lata', 'Coral', 22),
      (44, 'Tinta Acrílica Fosca Gelo 18 L - lata', 'Suvinil', 22),
      (45, 'Massa Corrida PVA Branca 25 kg - balde', 'Coral', 23),
      (46, 'Massa Corrida PVA Branca 25 kg - balde', 'Suvinil', 23),
      (47, 'Selador Acrílico Branco 18 L - lata', 'Coral', 24),
      (48, 'Selador Acrílico Branco 18 L - lata', 'Suvinil', 24)
    ) AS v(k, name, brand, material_key) ORDER BY k LOOP
        INSERT INTO public.products (name, brand, "desc", material_id, images)
        VALUES (r.name, r.brand,
                'development-demo-v1. Produto demonstrativo; preço e estoque por embalagem/unidade descrita no nome. Sem vínculo comercial ou disponibilidade real.',
                material_ids[r.material_key], ARRAY[]::text[]) RETURNING id INTO generated_id;
        product_ids[r.k] := generated_id;
    END LOOP;

    -- 6. Inserção das lojas. Região real; endereço sintético, sem ponto comercial real.
    -- Prefixo de região e sufixo DEMO evitam representar um endereço postal utilizável.
    -- Telefone 00000000000 é deliberadamente inválido; não usar para contato.
    FOR r IN SELECT * FROM (VALUES
      (1, 'Loja Demo Araçatuba Centro', 'Região da Rua Duque de Caxias (DEMO)', 317, 'Centro', 'Araçatuba', 'SP', '16010410', -21.2088, -50.4392, 1),
      (2, 'Loja Demo Araçatuba Industrial', 'Região da Rua Tibiriçá (DEMO)', 427, 'Vila Industrial', 'Araçatuba', 'SP', '16072000', -21.2041, -50.4552, 2),
      (3, 'Loja Demo Araçatuba Santana', 'Região da Avenida do Fico (DEMO)', 927, 'Santana', 'Araçatuba', 'SP', '16050500', -21.1956, -50.4403, 1),
      (4, 'Loja Demo Araçatuba Nova Yorque', 'Região da Rua Anhanguera (DEMO)', 3727, 'Jardim Nova Yorque', 'Araçatuba', 'SP', '16018390', -21.2294, -50.4408, 2),
      (5, 'Loja Demo Curitiba Centro', 'Região da Rua Marechal Deodoro (DEMO)', 1127, 'Centro', 'Curitiba', 'PR', '80060010', -25.43, -49.2622, 1),
      (6, 'Loja Demo Curitiba Portão', 'Região da Avenida República Argentina (DEMO)', 3027, 'Portão', 'Curitiba', 'PR', '80610260', -25.473, -49.2946, 2),
      (7, 'Loja Demo Curitiba Boqueirão', 'Região da Avenida Marechal Floriano Peixoto (DEMO)', 7927, 'Boqueirão', 'Curitiba', 'PR', '81650000', -25.5001, -49.2381, 1),
      (8, 'Loja Demo Curitiba Capão Raso', 'Região da Avenida Winston Churchill (DEMO)', 2327, 'Capão Raso', 'Curitiba', 'PR', '81150050', -25.5108, -49.2953, 2)
    ) AS v(k, name, street, nr, neighbr, city, state, zip, lat, lon, owner_key) ORDER BY k LOOP
        INSERT INTO public.stores
            (name, street, nr, neighbr, city, state, zip, lat, lon, owner_id, description, cellphone)
        VALUES (r.name, r.street, r.nr, r.neighbr, r.city, r.state, r.zip, r.lat, r.lon,
                owners[r.owner_key],
                'development-demo-v1. Loja fictícia. Número inventado e coordenadas aproximadas de região urbana, sem estabelecimento neste ponto. Endereço não utilizável para entregas. Sem contato real.',
                '00000000000') RETURNING id INTO generated_id;
        store_ids[r.k] := generated_id;
    END LOOP;

    -- 7. Relações produto–loja. 12 por loja; preços em BRL por unidade comercial.
    -- Chaves referem-se aos mapas RETURNING acima; nenhuma busca por nomes.
    FOR r IN SELECT * FROM (VALUES
      (1, 1, 35.05, 0),
      (1, 2, 33.15, 22),
      (1, 3, 28.4, 23),
      (1, 4, 40.75, 24),
      (1, 5, 12.25, 6),
      (1, 6, 14.15, 7),
      (1, 7, 2.75, 42),
      (1, 8, 3.99, 43),
      (1, 9, 5.61, 44),
      (1, 20, 4.27, 9),
      (1, 21, 85.41, 10),
      (1, 45, 85.41, 16),
      (2, 1, 35.61, 3),
      (2, 2, 33.68, 29),
      (2, 3, 28.85, 30),
      (2, 4, 41.4, 31),
      (2, 10, 7.62, 52),
      (2, 11, 1.16, 53),
      (2, 12, 1.45, 54),
      (2, 13, 6.66, 40),
      (2, 14, 8.59, 41),
      (2, 25, 24.03, 29),
      (2, 26, 38.5, 30),
      (2, 46, 96.4, 20),
      (3, 1, 36.16, 18),
      (3, 2, 34.2, 36),
      (3, 3, 29.3, 37),
      (3, 4, 42.04, 38),
      (3, 15, 7.74, 0),
      (3, 16, 8.33, 50),
      (3, 17, 7.35, 51),
      (3, 18, 9.31, 52),
      (3, 19, 3.82, 12),
      (3, 30, 391.9, 11),
      (3, 31, 215.5, 8),
      (3, 47, 156.7, 24),
      (4, 1, 36.72, 52),
      (4, 2, 34.73, 43),
      (4, 3, 29.75, 44),
      (4, 4, 42.69, 45),
      (4, 20, 4.48, 3),
      (4, 21, 89.45, 4),
      (4, 22, 114.33, 5),
      (4, 23, 248.65, 6),
      (4, 24, 228.75, 7),
      (4, 35, 49.65, 15),
      (4, 36, 69.55, 16),
      (4, 48, 179.0, 0),
      (5, 1, 37.27, 7),
      (5, 2, 35.25, 50),
      (5, 3, 30.2, 51),
      (5, 4, 43.33, 52),
      (5, 25, 25.15, 8),
      (5, 26, 40.3, 9),
      (5, 27, 2.52, 90),
      (5, 28, 3.94, 91),
      (5, 29, 252.4, 2),
      (5, 40, 121.1, 23),
      (5, 41, 90.8, 24),
      (5, 42, 111.0, 25),
      (6, 1, 37.82, 70),
      (6, 2, 35.77, 57),
      (6, 3, 30.65, 58),
      (6, 4, 43.97, 59),
      (6, 30, 409.9, 5),
      (6, 31, 225.4, 17),
      (6, 32, 215.15, 18),
      (6, 33, 51.15, 19),
      (6, 34, 15.27, 20),
      (6, 5, 13.22, 21),
      (6, 6, 15.27, 22),
      (6, 7, 2.97, 77),
      (7, 1, 38.38, 28),
      (7, 2, 36.3, 64),
      (7, 3, 31.1, 65),
      (7, 4, 44.62, 66),
      (7, 35, 51.9, 24),
      (7, 36, 72.7, 25),
      (7, 37, 83.1, 26),
      (7, 38, 57.1, 27),
      (7, 39, 135.1, 28),
      (7, 10, 8.22, 87),
      (7, 11, 1.25, 0),
      (7, 12, 1.56, 89),
      (8, 1, 38.93, 95),
      (8, 2, 36.82, 71),
      (8, 3, 31.54, 72),
      (8, 4, 45.26, 73),
      (8, 40, 126.49, 2),
      (8, 41, 94.84, 3),
      (8, 42, 115.94, 4),
      (8, 43, 305.84, 5),
      (8, 44, 348.04, 0),
      (8, 15, 8.33, 23),
      (8, 16, 8.97, 24),
      (8, 17, 7.91, 25)
    ) AS v(store_key, product_key, price, quantity) LOOP
        INSERT INTO public.product_stores (id_store, id_product, price, quantity)
        VALUES (store_ids[r.store_key], product_ids[r.product_key], r.price, r.quantity);
    END LOOP;
END
$seed$;

-- 8. Verificação das sequences. IDs vieram dos defaults serial, sem faixa reservada.
-- Não há setval: evita regressão e mantém a sequence de users intocada.
-- nextval é não transacional: mesmo ROLLBACK deixa lacunas, o que é esperado.
DO $sequences$
DECLARE
    t text;
    seq regclass;
    last_id bigint;
    called boolean;
    max_id bigint;
    increment_by bigint;
    cycles boolean;
BEGIN
    FOREACH t IN ARRAY ARRAY['material_types', 'materials', 'products', 'stores', 'product_stores'] LOOP
        seq := pg_get_serial_sequence(format('public.%I', t), 'id')::regclass;
        IF seq IS NULL THEN RAISE EXCEPTION 'Sequence ausente em %.', t; END IF;
        EXECUTE format('SELECT last_value, is_called FROM %s', seq) INTO last_id, called;
        SELECT seqincrement, seqcycle INTO increment_by, cycles FROM pg_sequence WHERE seqrelid = seq;
        EXECUTE format('SELECT max(id) FROM public.%I', t) INTO max_id;
        IF increment_by <> 1 OR cycles OR NOT called OR last_id < max_id OR last_id >= 2147483647 THEN
            RAISE EXCEPTION 'Sequence incompatível ou sem capacidade em %.', t;
        END IF;
    END LOOP;
END
$sequences$;

-- 9. Validação automática das quantidades e da distribuição.
DO $validate$
BEGIN
    IF (SELECT count(*) FROM public.material_types) <> 8
       OR (SELECT count(*) FROM public.materials) <> 24
       OR (SELECT count(*) FROM public.products) <> 48
       OR (SELECT count(*) FROM public.stores) <> 8
       OR (SELECT count(*) FROM public.product_stores) <> 96
       OR (SELECT count(*) FROM public.users) <> 2 THEN
        RAISE EXCEPTION 'Contagens divergentes: esperados 8/24/48/8/96 e dois usuários.';
    END IF;
    IF (SELECT count(*) FROM public.stores WHERE city = 'Araçatuba' AND state = 'SP') <> 4
       OR (SELECT count(*) FROM public.stores WHERE city = 'Curitiba' AND state = 'PR') <> 4
       OR EXISTS (SELECT s.id FROM public.stores s LEFT JOIN public.product_stores ps ON ps.id_store = s.id GROUP BY s.id HAVING count(ps.id) <> 12)
       OR EXISTS (SELECT owner_id FROM public.stores GROUP BY owner_id HAVING count(*) <> 4)
       OR EXISTS (SELECT owner_id, city FROM public.stores GROUP BY owner_id, city HAVING count(*) <> 2)
       OR EXISTS (SELECT type_id FROM public.materials GROUP BY type_id HAVING count(*) <> 3)
       OR EXISTS (SELECT material_id FROM public.products GROUP BY material_id HAVING count(*) <> 2)
       OR (SELECT count(DISTINCT id_product) FROM public.product_stores) <> 48 THEN
        RAISE EXCEPTION 'Distribuição de lojas, owners, catálogo ou disponibilidade inválida.';
    END IF;
    IF NOT EXISTS (SELECT id_product FROM public.product_stores GROUP BY id_product HAVING count(*) = 1)
       OR NOT EXISTS (SELECT ps.id_product FROM public.product_stores ps JOIN public.stores s ON s.id = ps.id_store GROUP BY ps.id_product HAVING count(DISTINCT s.city) = 2)
       OR NOT EXISTS (SELECT ps.id_product, s.city FROM public.product_stores ps JOIN public.stores s ON s.id = ps.id_store GROUP BY ps.id_product, s.city HAVING count(*) > 1)
       OR EXISTS (SELECT id_product FROM public.product_stores GROUP BY id_product HAVING count(*) > 1 AND (min(price) = max(price) OR min(quantity) = max(quantity)))
       OR NOT EXISTS (SELECT 1 FROM public.product_stores WHERE quantity = 0)
       OR NOT EXISTS (SELECT 1 FROM public.product_stores WHERE quantity BETWEEN 1 AND 5)
       OR NOT EXISTS (SELECT 1 FROM public.product_stores WHERE quantity BETWEEN 6 AND 30)
       OR NOT EXISTS (SELECT 1 FROM public.product_stores WHERE quantity BETWEEN 31 AND 100) THEN
        RAISE EXCEPTION 'Faltam cenários de comparação, exclusividade ou estoque.';
    END IF;
END
$validate$;

SELECT 'material_types' AS tabela, count(*) AS quantidade FROM public.material_types
UNION ALL SELECT 'materials', count(*) FROM public.materials
UNION ALL SELECT 'products', count(*) FROM public.products
UNION ALL SELECT 'stores', count(*) FROM public.stores
UNION ALL SELECT 'product_stores', count(*) FROM public.product_stores;
SELECT city, state, count(*) AS lojas FROM public.stores GROUP BY city, state ORDER BY city;
SELECT owner_id, city, count(*) AS lojas FROM public.stores GROUP BY owner_id, city ORDER BY owner_id, city;
SELECT s.id, s.name, count(ps.id) AS produtos FROM public.stores s
LEFT JOIN public.product_stores ps ON ps.id_store = s.id GROUP BY s.id ORDER BY s.id;
SELECT p.id, p.name, count(ps.id) AS lojas, min(ps.price) AS menor_preco, max(ps.price) AS maior_preco
FROM public.products p LEFT JOIN public.product_stores ps ON ps.id_product = p.id GROUP BY p.id ORDER BY p.id;
SELECT p.id, p.name, count(*) AS lojas, min(ps.price) AS menor_preco, max(ps.price) AS maior_preco
FROM public.products p JOIN public.product_stores ps ON ps.id_product = p.id
GROUP BY p.id HAVING count(*) > 1 ORDER BY p.id;

-- 10. Foreign keys e integridade: erro impede COMMIT, além das constraints existentes.
DO $integrity$
BEGIN
    IF EXISTS (SELECT 1 FROM public.materials m LEFT JOIN public.material_types t ON t.id = m.type_id WHERE t.id IS NULL)
       OR EXISTS (SELECT 1 FROM public.products p LEFT JOIN public.materials m ON m.id = p.material_id WHERE m.id IS NULL)
       OR EXISTS (SELECT 1 FROM public.stores s LEFT JOIN public.users u ON u.id = s.owner_id WHERE u.id IS NULL)
       OR EXISTS (SELECT 1 FROM public.product_stores ps LEFT JOIN public.stores s ON s.id = ps.id_store LEFT JOIN public.products p ON p.id = ps.id_product WHERE s.id IS NULL OR p.id IS NULL)
       OR EXISTS (SELECT id_store, id_product FROM public.product_stores GROUP BY id_store, id_product HAVING count(*) > 1)
       OR EXISTS (SELECT 1 FROM public.product_stores WHERE price IS NULL OR price <= 0 OR quantity IS NULL OR quantity NOT BETWEEN 0 AND 100)
       OR EXISTS (SELECT 1 FROM public.products WHERE images IS NULL OR cardinality(images) <> 0) THEN
        RAISE EXCEPTION 'Integridade inválida: órfãos, duplicatas, preços, estoques ou imagens.';
    END IF;
END
$integrity$;

-- Todas as consultas de anomalias abaixo devem retornar zero linhas.
SELECT 'material sem tipo' AS problema, m.id FROM public.materials m LEFT JOIN public.material_types t ON t.id = m.type_id WHERE t.id IS NULL
UNION ALL SELECT 'produto sem material', p.id FROM public.products p LEFT JOIN public.materials m ON m.id = p.material_id WHERE m.id IS NULL
UNION ALL SELECT 'loja sem owner', s.id FROM public.stores s LEFT JOIN public.users u ON u.id = s.owner_id WHERE u.id IS NULL
UNION ALL SELECT 'associação órfã', ps.id FROM public.product_stores ps LEFT JOIN public.stores s ON s.id = ps.id_store LEFT JOIN public.products p ON p.id = ps.id_product WHERE s.id IS NULL OR p.id IS NULL;
SELECT id_store, id_product, count(*) FROM public.product_stores GROUP BY id_store, id_product HAVING count(*) > 1;
SELECT id, price FROM public.product_stores WHERE price IS NULL OR price <= 0;
SELECT id, quantity FROM public.product_stores WHERE quantity IS NULL OR quantity NOT BETWEEN 0 AND 100;
SELECT id, images FROM public.products WHERE images IS NULL OR cardinality(images) <> 0;

-- 11. COMMIT. Para revisão humana, execute até antes desta seção e confira os resultados.
-- Para ensaio sem persistência, substitua a instrução final por ROLLBACK.
COMMIT;
