// import { PrismaClient } from "@/generated/prisma";
// import { createClient } from "@supabase/supabase-js";
// import fs from "fs";

// const prisma = new PrismaClient();
// const supabase = createClient(
//   process.env.NUXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

// async function uploadBase64Image(base64: string, fileName: string): Promise<string | null> {
//   try {
//     const buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), "base64");

//     const { data, error } = await supabase.storage
//       .from(process.env.SUPABASE_BUCKET!)
//       .upload(`products/${fileName}.png`, buffer, {
//         contentType: "image/png",
//         upsert: true,
//       });

//     if (error) throw new Error(error.message);

//     const { data: publicUrl } = supabase.storage
//       .from(process.env.SUPABASE_BUCKET!)
//       .getPublicUrl(data.path);

//     return publicUrl.publicUrl;
//   } catch (err: any) {
//     console.error(`❌ Erro ao enviar imagem ${fileName}: ${err.message}`);
//     return null;
//   }
// }

// async function main() {
//   console.log("🚀 Iniciando migração de dados para Supabase...");

//   // 1️⃣ MATERIAL TYPES
//   console.log("📦 Importando Material Types...");
//   const materialTypes = JSON.parse(fs.readFileSync("./server/data/material-types.json", "utf-8"));
//   for (const type of materialTypes) {
//     try {
//       await prisma.materialType.create({ data: { id: type.id.toString(), name: type.name } });
//     } catch (err: any) {
//       console.error(`❌ Erro em MaterialType (${type.name}): ${err.message}`);
//     }
//   }

//   // 2️⃣ MATERIALS
//   console.log("📦 Importando Materials...");
//   const materials = JSON.parse(fs.readFileSync("./server/data/materials.json", "utf-8"));
//   for (const mat of materials) {
//     try {
//       await prisma.material.create({
//         data: {
//           id: mat.id.toString(),
//           name: mat.name,
//           typeId: mat.type_id.toString(),
//         },
//       });
//     } catch (err: any) {
//       console.error(`❌ Erro em Material (${mat.name}): ${err.message}`);
//     }
//   }

//   // 3️⃣ USERS
//   console.log("👤 Importando Users...");
//   const users = JSON.parse(fs.readFileSync("./server/data/users.json", "utf-8"));
//   for (const user of users) {
//     try {
//       await prisma.user.create({
//         data: {
//           id: user.id.toString(),
//           nome: user.nome,
//           telefone: user.telefone,
//           role: user.role,
//         },
//       });
//     } catch (err: any) {
//       console.error(`❌ Erro em User (${user.nome}): ${err.message}`);
//     }
//   }

//   // 4️⃣ STORES
//   console.log("🏪 Importando Stores...");
//   const stores = JSON.parse(fs.readFileSync("./server/data/stores.json", "utf-8"));
//   for (const store of stores) {
//     try {
//       await prisma.store.create({
//         data: {
//           id: store.id.toString(),
//           name: store.name,
//           street: store.street,
//           nr: store.nr,
//           neighbr: store.neighbr,
//           city: store.city,
//           state: store.state,
//           zip: store.zip,
//           lat: store.lat,
//           lon: store.lon,
//           owner_id: store.owner_id.toString(),
//           description: store.description,
//           cellphone: store.cellphone,
//           cellphone_second: store.cellphone_second ?? null,
//           email: store.email,
//           facebook: store.facebook ?? null,
//           instagram: store.instagram ?? null,
//           another: store.another ?? null,
//         },
//       });
//     } catch (err: any) {
//       console.error(`❌ Erro em Store (${store.name}): ${err.message}`);
//     }
//   }

//   // 5️⃣ PRODUCTS (com imagens base64)
//   console.log("🧴 Importando Products...");
//   const products = JSON.parse(fs.readFileSync("./server/data/products.json", "utf-8"));

//   for (const product of products) {
//     try {
//       // Primeiro cria o produto sem imagens
//       const created = await prisma.product.create({
//         data: {
//           id: product.id.toString(),
//           name: product.name,
//           desc: product.desc,
//           brand: product.brand,
//           materialId: product.material_id.toString(),
//         },
//       });

//       // Agora faz upload das imagens base64
//       if (product.images && product.images.length > 0) {
//         const uploadedUrls: string[] = [];

//         for (let i = 0; i < product.images.length; i++) {
//           const base64 = product.images[i];
//           const url = await uploadBase64Image(base64, `${created.id}_${i}`);
//           if (url) uploadedUrls.push(url);
//         }

//         // Atualiza o produto com os URLs públicos
//         await prisma.product.update({
//           where: { id: created.id },
//           data: { images: uploadedUrls },
//         });
//       }
//     } catch (err: any) {
//       console.error(`❌ Erro em Product (${product.name}): ${err.message}`);
//     }
//   }

//   // 6️⃣ PRODUCT STORE (N:N)
//   console.log("🔗 Importando ProductStore (relações N:N)...");
//   const productStores = JSON.parse(fs.readFileSync("./server/data/product-store.json", "utf-8"));

//   for (const ps of productStores) {
//     try {
//       await prisma.productStore.create({
//         data: {
//           id: ps.id.toString(),
//           id_store: ps.id_store.toString(),
//           id_product: ps.id_product.toString(),
//           price: ps.price,
//           quantity: ps.quantity,
//         },
//       });
//     } catch (err: any) {
//       console.error(`❌ Erro em ProductStore (${ps.id_store}/${ps.id_product}): ${err.message}`);
//     }
//   }

//   console.log("✅ Migração finalizada com sucesso!");
// }

// main()
//   .catch((e) => console.error("💥 Erro fatal na migração:", e))
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
