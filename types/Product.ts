export interface Product {
  id: number;
  name: string;
  brand: string;
  price: string;
  quantity: number;
  material_id: number;
  images: string[]
  // O produto só é produto quando o material possui quantidade disponível e preço
}