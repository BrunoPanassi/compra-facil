import type { Store } from "~/types/Store";
import { StoreRepository } from "../repositories/StoreRepository";
import { BaseService } from "./BaseService";

export class StoreService extends BaseService<Store, StoreRepository> {
  
  constructor(repo: StoreRepository = new StoreRepository()) {
    super(repo);
  }   
}