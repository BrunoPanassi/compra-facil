<template>
    <v-card>
        <v-card-title>Orçamento</v-card-title>
        <v-card-subtitle>
            {{ `Loja: ${budgetStore.getStore().name}` }}
        </v-card-subtitle>
    </v-card>
</template>

<script setup lang="ts">
import { useBudgetStore } from '~/stores/budget';

const budgetStore = useBudgetStore()

</script>

<style scoped>

</style>