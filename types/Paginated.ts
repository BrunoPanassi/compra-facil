export interface Options {
    prop: string,
    search?: string,
    page?: number,
    perPage?: number,
    id?: number,
    ids?: number[] | string
}

export interface Response<T> {
    items: T[],
    total: number
}

export interface DataAdapter<T> {
    getPaginated(options: Options): Promise<Response<T>>
}

