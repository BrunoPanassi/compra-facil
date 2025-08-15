export interface Product {
  id: number;
  [key:string]: string|number|string[]|undefined;
  name: string;
  brand: string
  desc?: string;
  material_id: number;
  images: string[];
  // O produto só é produto quando o material possui quantidade disponível e preço
}