<template>
  <v-container>
    <AppBarNavigationDrawer>
      <template v-slot:content>
        <p>Bem-vindo, {{ auth.user?.nome }}, esta é a tela de usuários</p>
      </template>
    </AppBarNavigationDrawer>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import AppBarNavigationDrawer from '~/components/AppBarNavigationDrawer.vue';

const auth = useAuthStore();
const router = useRouter();

function logout() {
  auth.logout()
  router.push('/')
}
</script>