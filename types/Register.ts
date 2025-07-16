import type { OrderAmount } from "./OrderAmount";
import type { Project } from "./Project";
import type { RegisterItemAmount } from "./RegisterItemAmount";


export interface Register {
  id: number;
  when: Date;
  project_id: Project;
  register_item_amount: RegisterItemAmount;
  order_amount: OrderAmount;
  value: number;
  // O registro do dia para ser incluso no projeto, podendo conter quais materiais ou pedidos foram inclusos e seu valor total
}