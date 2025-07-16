export enum EnumRole {
    CLIENT = 'CLIENT',
    ADMIN = 'ADMIN',
    SERVICE_PROVIDER = 'SERVICE_PROVIDER',
    STORE_OWNER = 'STORE_OWNER'
}

export const Role = [EnumRole.CLIENT, EnumRole.ADMIN, EnumRole.SERVICE_PROVIDER, EnumRole.STORE_OWNER]

export type Role = typeof Role[number];
