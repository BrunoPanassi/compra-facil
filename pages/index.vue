<template>
  <v-container class="d-flex justify-center">
    <p>Landing Page</p>
    <v-btn 
      color="secondary" 
      class="mt-4" 
      @click="navigateToLogin()"
      :loading="loadingStore.getLoading()"
    >
      Login
    </v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { showErrorMessage } from '~/util/Util';

const loadingStore = useLoadingStore()

const router = useRouter()

const navigateToLogin = async () => {
  try {
    loadingStore.updateLoading(true)
    await router.push('/login')
  } catch (e: any) {
    const message = `Erro ao ir para a página de login: ${e}`
    showErrorMessage(message, e)
  } finally {
    loadingStore.updateLoading(false)
  }
}

</script>
