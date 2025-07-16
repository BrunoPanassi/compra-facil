import { type Material } from './Material';

export interface Product {
  id: number;
  price: number;
  quantity: number;
  material: Material;
  // O produto só é produto quando o material possui quantidade disponível e preço
}