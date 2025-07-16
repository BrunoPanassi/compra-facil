import type { MaterialType } from "~/types/MaterialType";
import { BaseRepository } from "./BaseRepository"

export class MaterialTypeRepository extends BaseRepository<MaterialType> {
    constructor(useSql: boolean = false) {
        super('material-types', useSql)
    }
}