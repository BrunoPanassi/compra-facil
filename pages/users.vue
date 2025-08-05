<template>
  <v-container>
    <AppBarNavigationDrawer>
      <template v-slot:content>
        <SearchProduct/>
      </template>
    </AppBarNavigationDrawer>
  </v-container>
</template>

<script setup lang="ts">
import AppBarNavigationDrawer from '~/components/AppBarNavigationDrawer.vue';
</script>