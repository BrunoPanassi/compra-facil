import { type Role } from "./Role";

export interface User {
  id: number;
  nome: string;
  telefone: string;
  senha: string;
  role: Role;
}
