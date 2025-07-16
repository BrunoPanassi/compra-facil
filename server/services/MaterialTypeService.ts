import type { MaterialType } from "~/types/MaterialType";
import { BaseService } from "./BaseService";
import { MaterialTypeRepository } from "../repositories/MaterialTypeRepository";

export class MaterialTypeService extends BaseService<MaterialType, MaterialTypeRepository> {
  
  constructor(repo: MaterialTypeRepository = new MaterialTypeRepository()) {
    super(repo);
  }
}