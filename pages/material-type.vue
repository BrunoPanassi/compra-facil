<template>
  <v-container>
    <AppBarNavigationDrawer>
      <template v-slot:content>
        <v-card class="pa-6">
        <v-card-title>
          <v-icon
            @click="goBack"
          >
            mdi-arrow-left
          </v-icon>
          <v-breadcrumbs class="text-caption" :items="['Início', 'Material', 'Tipo de Material']">
            <template v-slot:divider>
              <v-icon icon="mdi-chevron-right"></v-icon>
            </template>
          </v-breadcrumbs>
        </v-card-title>
        <v-card-subtitle></v-card-subtitle>
        <v-card-text>
          <MaterialTypeCard />
        </v-card-text>
      </v-card>
      </template>
    </AppBarNavigationDrawer>
  </v-container>
</template>

<script setup lang="ts">
const router = useRouter()

const goBack = () => {
    router.push('/material')
}
</script>