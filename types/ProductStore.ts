export interface ProductStore {
  id: number;
  [key:string]: string|number;
  id_store: number;
  id_product: number;
  price: string;
  // Qual produto cada loja contém
}