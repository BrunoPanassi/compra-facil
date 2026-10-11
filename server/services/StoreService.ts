import type { BestStoreSearchParams } from '../../types/BestStore';
import type { Store } from "~/types/Store";
import { StoreRepository } from "../repositories/StoreRepository";
import { BaseService } from "./BaseService";

export class StoreService extends BaseService<Store, StoreRepository> {
  
  constructor(repo: StoreRepository = new StoreRepository()) {
    super(repo);
  }

  async findBestStores(params: BestStoreSearchParams) {
    return this.repository.findBestStores({ ...params,
      priceWeight: params.priority === 'price' ? 0.6 : 0.4,
      distanceWeight: params.priority === 'distance' ? 0.6 : 0.4,
    });
  }

  async findByOwner(owner_id: number): Promise<Store | undefined> {
    return this.repository.findByOwner(owner_id)
  }   
}