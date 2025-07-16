import type { RegisterItem } from './RegisterItem';

export interface RegisterItemAmount {
  id: number;
  register_items: RegisterItem[];
  value: number;
  // O total dos materiais com os seus valores e quantidades a serem inclusos no projeto
}