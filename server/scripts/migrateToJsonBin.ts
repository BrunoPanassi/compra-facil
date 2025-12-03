import { readFileSync } from 'fs';
import { join } from 'path';

interface Bins {
    [key: string]: string | number;
    "users": string,
    "stores": string,
    "products": string,
    "materials": string,
    "material-types": string,
    "product-store": string
}

const bins = {
  "products": '691258eed0ea881f40e06d73',
} as Bins;

const baseUrl = 'https://api.jsonbin.io/v3/b';
const apiKey = '$2a$10$xcZD2CiTV5dVvZJikEDsieoujDmMWbSh9D.tKyICwGn8wzJ5XyTGm';

const imageHostingUrl = 'https://api.imgbb.com/1/upload?key=83881527799e244d9d01f87dd33f90e9'

export async function uploadJson(entity: string) {
  const binId = bins[entity];
  if (!binId) return console.error(`❌ Bin não encontrado para ${entity}`);

 try {
    const filePath = join(process.cwd(), 'server', 'data', `${entity}.json`);
    const data = JSON.parse(readFileSync(filePath, 'utf8'));

    const images: Array<String> = data[0]['images']
    let imagesUrl: Array<String> = []

    for(let image of images) {
      const form = new FormData();
      form.append('image', image.split(',').pop() || ''); // ou convert to base64 as API requires
      const resp = await fetch(imageHostingUrl, {
        method: 'POST',
        body: form
      });

      imagesUrl.push((resp as any).data.url)
    }
    data[0]['images'] = imagesUrl

    const res = await fetch(`${baseUrl}/${binId}`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': apiKey
    },
    body: JSON.stringify(data)
    });
    console.log(`✅ ${entity} atualizado:`, res);
 } catch (e) {
    console.log(`❌ Erro ao tentar salvar ${entity} :`, e);
 }

  
}

async function main() {
  for (const entity of Object.keys(bins)) {
    await uploadJson(entity);
  }
}

main().catch(console.error);
