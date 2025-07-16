<template>
  <v-container>
    <v-card class="pa-6">
      <v-card-title class="text-h5">Prestador de Serviços Dashboard</v-card-title>
      <v-card-text>
        <p>Bem-vindo, {{ auth.user?.nome }}</p>
        <v-btn color="error" class="mt-4" @click="auth.logout(); router.push('/')">Sair</v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
</script>