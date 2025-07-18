<template>
    <v-layout>
        <v-app-bar color="#f4f1de">
        <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

        <v-toolbar-title>
            <v-img
                src="/assets/compra_facil_logo_resized.png"
                height="40"
                width="40"
            >
            </v-img>
        </v-toolbar-title>

        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn 
              icon="mdi-account" 
              variant="text"
              v-bind="props"
            >
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="(item, index) in accountMenuItems"
              :key="index"
              :value="index"
              @click="item.func"
            >
              <template v-slot:prepend>
                <v-icon :icon="item.icon"></v-icon>
              </template>
              <v-list-item-title v-text="item.title"></v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
    </v-app-bar>

    <v-navigation-drawer
        v-model="drawer"
        :location="$vuetify.display.mobile ? 'bottom' : undefined"
        temporary
      >
        <v-list
        >
          <v-list-item
            v-for="(item, index) in menuFilteredByUserRole"
            :key="index"
            :value="index"
            @click="goTo(item.value)"
          >
            <template v-slot:prepend>
              <v-icon :icon="item.icon"></v-icon>
            </template>
            <v-list-item-title v-text="item.title" ></v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

    <v-main>
      <div>
        <slot name="content"></slot>
      </div>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { EnumRole } from '~/types/Role';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const accountMenuItems = [
  { title: 'Deslogar' , icon: 'mdi-logout', func: logout}
]

function logout() {
  auth.logout()
  router.push('/')
}

const drawer = ref(false)

const menuItems = [
        {
          title: 'Materiais',
          value: 'material',
          icon: 'mdi-tools',
          role: [EnumRole.ADMIN, EnumRole.STORE_OWNER]
        },
        {
          title: 'Produtos',
          value: 'users',
          icon: 'mdi-package-variant-closed',
          role: [EnumRole.CLIENT, EnumRole.SERVICE_PROVIDER, EnumRole.STORE_OWNER, EnumRole.ADMIN]
        },
        {
          title: 'Orçamento',
          value: 'budget',
          icon: 'mdi-currency-usd',
          role: [EnumRole.CLIENT, EnumRole.SERVICE_PROVIDER, EnumRole.STORE_OWNER, EnumRole.ADMIN]
        },
        {
          title: 'Loja',
          value: 'store',
          icon: 'mdi-store',
          role: [EnumRole.STORE_OWNER]
        }
      ]

const menuFilteredByUserRole = computed(() => menuItems.filter(menu => auth.user?.role && menu.role.includes(auth.user?.role)))

const goTo = (to: string) => {
  router.push(`/${to}`)
}

</script>