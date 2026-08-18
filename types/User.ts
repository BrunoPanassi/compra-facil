import { type Role } from "./Role";

export interface User {
  id: number;
  nome: string;
  telefone: string;
  senha: string;
  role: Role;
}

export interface UserLocation {
  latitude: number
  longitude: number
  accuracy: number
}
