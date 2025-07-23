<template>
  <v-container>
    <AppBarNavigationDrawer>
      <template v-slot:content>
        <v-card class="pa-6">
        <v-card-title>
          <v-breadcrumbs class="text-caption" :items="['Início', 'Lojas']">
            <template v-slot:divider>
              <v-icon icon="mdi-chevron-right"></v-icon>
            </template>
          </v-breadcrumbs>
        </v-card-title>
        <v-card-subtitle></v-card-subtitle>
        <v-card-text>
          <StoreCard/>
          <p class="mt-6"></p>
          <ProductCard/>
        </v-card-text>
      </v-card>
      </template>
    </AppBarNavigationDrawer>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import StoreCard from '~/components/StoreCard.vue';

const auth = useAuthStore();
const router = useRouter();
</script>