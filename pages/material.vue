<template>
  <v-container>
    <AppBarNavigationDrawer>
      <template v-slot:content>
        <v-card class="pa-6">
        <v-card-title>
          <v-breadcrumbs class="text-caption" :items="['Início', 'Material']">
            <template v-slot:divider>
              <v-icon icon="mdi-chevron-right"></v-icon>
            </template>
          </v-breadcrumbs>
        </v-card-title>
        <v-card-subtitle></v-card-subtitle>
        <v-card-text>
          <v-btn
            class="ml-4"
            @click="goToMaterialType"
          >
            <v-icon class="mr-2">mdi-pencil</v-icon>
            Tipo de Material
          </v-btn>
          <MaterialCard/>
        </v-card-text>
      </v-card>
      </template>
    </AppBarNavigationDrawer>
  </v-container>
</template>

<script setup lang="ts">
import MaterialCard from '~/components/MaterialCard.vue';

const router = useRouter()

const goToMaterialType = () => {
  router.push('/material-type')
}
</script>