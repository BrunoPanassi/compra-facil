import type { Material } from './Material';

export interface RegisterItem {
  id: number;
  material: Material;
  value: number;
  quantity: number;
  // Qual o valor e quantidade de cada material a ser incluso no projeto
}