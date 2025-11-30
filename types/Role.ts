export enum EnumRole {
    CLIENT = 'CLIENT',
    ADMIN = 'ADMIN',
    SERVICE_PROVIDER = 'SERVICE_PROVIDER',
    STORE_OWNER = 'STORE_OWNER'
}

export const Role = [EnumRole.CLIENT, EnumRole.ADMIN, EnumRole.SERVICE_PROVIDER, EnumRole.STORE_OWNER]

export type Role = typeof Role[number];

export interface RoleRoute {
    role: string,
    route: string
}

export const roleRoutes: RoleRoute[] = [
    {
        role: EnumRole.SERVICE_PROVIDER,
        route: '/serviceProvider'
    },
    {
        role: EnumRole.ADMIN,
        route: '/admin'
    },
    {
        role: EnumRole.STORE_OWNER,
        route: '/store'
    },
    {
        role: EnumRole.CLIENT,
        route: '/users'
    }
]
