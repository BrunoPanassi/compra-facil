export interface Address {
  id: number;
  street: string;
  nr: number;
  neighbr: string;
  city: string;
  state: string;
  zip: number;
}

export function compare(from: Address, to:Address) {
  return from.state == to.state
    && from.city == to.city
    && from.neighbr == to.neighbr
    && from.street == to.street
    && from.nr == to.nr
    && from.zip == to.zip
}