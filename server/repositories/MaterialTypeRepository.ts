import type { MaterialType } from "~/types/MaterialType";
import { BaseRepository } from "./BaseRepository"

export class MaterialTypeRepository extends BaseRepository<MaterialType> {
    constructor(useSql?: boolean) {
        super('material-types', useSql)
    }
}
