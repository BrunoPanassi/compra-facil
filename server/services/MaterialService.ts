import { BaseService } from "./BaseService";
import { MaterialRepository } from "../repositories/MaterialRepository";
import type { Material } from "~/types/Material";

export class MaterialService extends BaseService<Material, MaterialRepository> {
  
  constructor(repo: MaterialRepository = new MaterialRepository()) {
    super(repo);
  }
}