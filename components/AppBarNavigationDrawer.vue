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

        <v-btn 
          icon
          @click="toggleDialogBudgetList"
        >
          <v-badge
            v-if="budgetProductsStore.getTotal()"
            location="top right" 
            color="success" 
            :content="budgetProductsStore.getTotal()"
          >
            <v-icon icon="mdi-format-list-bulleted-square"></v-icon>
          </v-badge>
          <v-icon v-else icon="mdi-format-list-bulleted-square"></v-icon>
        </v-btn>

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
      <v-progress-linear :indeterminate="loadingStore.getLoading()"></v-progress-linear>
      <v-list>
        <v-list-item
          v-for="(item, index) in menuFilteredByUserRole"
          :key="index"
          :value="item.value"
          @click="goTo(item.value)"
          :disabled="currentPathName == item.value"
        >
          <template v-slot:prepend>
            <v-icon :icon="item.icon"></v-icon>
          </template>
          <v-list-item-title v-text="item.title"></v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <BudgetProductList
      v-model="dialogBudgetList"
    />

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
import { showErrorMessage } from '~/util/Util';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const budgetProductsStore = useBudgetProductsStore()

const accountMenuItems = [
  { title: 'Deslogar' , icon: 'mdi-logout', func: logout}
]

async function logout() {
  try {
    loadingStore.updateLoading(true)
    auth.logout()
    await router.push('/')
  } catch (e: any) {
    showErrorMessage(`Erro ao deslogar: ${e}`, e)
  } finally {
    loadingStore.updateLoading(false)
  }
}

const dialogBudgetList = ref(false)

const currentPathName = computed(() => route.name)

function toggleDialogBudgetList() {
  dialogBudgetList.value = !dialogBudgetList.value
}

const drawer = ref(false)

const menuItems = [
        {
          title: 'Pesquisar Produtos',
          value: 'users',
          icon: 'mdi-magnify',
          role: [EnumRole.CLIENT, EnumRole.SERVICE_PROVIDER, EnumRole.STORE_OWNER, EnumRole.ADMIN]
        },
        {
          title: 'Materiais',
          value: 'material',
          icon: 'mdi-tools',
          role: [EnumRole.ADMIN, EnumRole.STORE_OWNER]
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

const loadingStore = useLoadingStore()

const goTo = async (to: string) => {
  try {
    loadingStore.updateLoading(true)
    await router.push(`/${to}`)
  } catch (e: any) {
    showErrorMessage(`Erro ao mudar de página: ${e}`, e)
  } finally {
    loadingStore.updateLoading(false)
  }
}

</script>