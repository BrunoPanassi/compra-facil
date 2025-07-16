import { type Order } from './Order';

export interface OrderAmount {
  id: number;
  orders: Order[];
  value: number;
  // O total dos pedidos, uma vez que pode conter vários pedidos de várias lojas diferentes
}