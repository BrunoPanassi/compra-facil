<template>
    <v-card class="pa-6" max-width="800" min-width="350" color="#f4f1de" elevation="6" rounded="xl">
        <div class="d-flex justify-center align-content-center">
          <v-img
            src="/assets/compra_facil_logo_resized.png"
            height="80"
            width="80"
          >
          </v-img>
        </div>
        <p class="text-h5 d-flex justify-center align-content-center mb-4 title">
          comprafacil
        </p>
        <v-card-text>
          <v-form 
            ref="form" 
            fast-fail 
            @submit.prevent="handleRegisterLogin" 
            validate-on="input" 
          >
              <div v-if="toRegister">
                <p class="text-subtitle-2 font-weight-bold">Quero me cadastrar como:</p>
                <v-btn-toggle 
                  v-model="role" 
                  elevation="4" 
                  mandatory 
                  color="#1b4332" 
                  class="column mb-4 d-flex"
                  divided 
                  style="height: 127px;"
                >
                    <v-btn :value=EnumRole.CLIENT elevation="4" class="py-2">
                        <v-icon size="large">mdi-account</v-icon>
                        Cliente
                    </v-btn>
                    <v-btn :value=EnumRole.SERVICE_PROVIDER elevation="4" class="py-2 my-2">
                        <v-icon size="large">mdi-tools</v-icon>
                        Prestador de Serviços
                    </v-btn>
                    <v-btn :value=EnumRole.STORE_OWNER elevation="4" class="py-2">
                        <v-icon size="large">mdi-store</v-icon>
                        Lojista
                    </v-btn>
                </v-btn-toggle>
              </div>
              <v-text-field
                v-if="toRegister" 
                prepend-inner-icon="mdi-account" 
                density="comfortable" 
                variant="outlined" 
                v-model="name" 
                label="Nome" 
                :rules="[requiredRule]"
              />
              <v-text-field 
                prepend-inner-icon="mdi-phone" 
                density="comfortable" 
                variant="outlined" 
                v-maska="'(##) ##### ####'" 
                v-model="telefone" 
                label="Telefone" 
                :rules="[requiredRule, telefoneRule]"
              />
              <v-text-field 
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="seePassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                @click:append-inner="toggleViewPassword" 
                density="comfortable" 
                variant="outlined" 
                v-model="senha" 
                label="Senha" 
                :type="seePassword ? 'text' : 'password'"
                :rules="toRegister ? [passwordRule, requiredRule] : [requiredRule]"
              />
              <v-text-field 
                v-if="toRegister" 
                prepend-inner-icon="mdi-lock-outline" 
                :append-inner-icon="seePassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                density="comfortable"
                variant="outlined" 
                v-model="senhaConfirm" 
                label="Confirmar senha"
                :disabled="!senha"
                :type="seePassword ? 'text' : 'password'"
                class="mb-3" 
                :rules="[requiredRule, senhaConfirmRule]"
              />
              <v-btn 
                type="submit" 
                color="#2d6a4f"
                rounded
                block
              >
                {{ toRegister ? 'Registrar' : 'Logar' }}
              </v-btn>
              <v-btn 
                class="mt-2" 
                @click="toggleToRegister" 
                color="#40916c"
                rounded
                block
              >
                {{ toRegister ? 'Já tenho conta' : 'Criar conta' }}
              </v-btn>
              <v-alert v-if="error" type="error" class="mt-3">{{ error }}</v-alert>
          </v-form>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { EnumRole, type Role } from '~/types/Role';
import { vMaska } from 'maska/vue';
import { requiredRule, passwordRule } from '~/util/rule';

const form = ref()
const auth = useAuthStore();
const router = useRouter();
const name = ref('');
const telefone = ref('');
const senha = ref('');
const senhaConfirm = ref('')
const error = ref('');
const role = ref(EnumRole.CLIENT)
const toRegister = ref(false);
const seePassword = ref(false)

const telefoneRawValue = computed(() => telefone.value.replace('(', '').replace(')', '').replaceAll(' ', ''))
const telefoneRule = () => (!!telefoneRawValue.value && telefoneRawValue.value.length == 11) || 'Telefone precisa conter 11 dígitos, incluindo o DDD'
const senhaConfirmRule = (value:string) => (!!value && value == senha.value) || 'A senha confirmada não é a mesma informada.'

function toggleViewPassword() {
  seePassword.value = !seePassword.value
}

async function toggleToRegister() {
  toRegister.value = !toRegister.value
  if (!toRegister.value) name.value = ''
}

async function handleRegisterLogin() {
  if (toRegister.value) {
    return await handleRegister()
  } else {
    return await handleLogin()
  }
}

async function handleRegister() {
  error.value = '';
  if (form.value) {
    const { valid } = await form.value.validate()

    if (valid) {
      try {
        await auth.register(name.value, telefoneRawValue.value, senha.value, role.value as Role)
        routerPushOnUserRole()
      } catch (e: any) {
        error.value = e.message || 'Erro ao cadastrar';
      }
    }
  }
}

async function handleLogin() {
  error.value = '';
  if (form.value) {
    const { valid } = await form.value.validate()
    if (valid) {
      try {
      await auth.login(telefoneRawValue.value, senha.value);
      routerPushOnUserRole()
    } catch (e: any) {
      error.value = e.message || 'Erro ao fazer login';
    }
    }
  }
}

async function routerPushOnUserRole() {
  if (auth.user?.role === EnumRole.SERVICE_PROVIDER) {
    router.push('/serviceProvider');
  } else if (auth.user?.role === EnumRole.STORE_OWNER) {
    router.push('/store');
  } else {
    router.push('/users');
  }
}
</script>

<style>
.column{
  flex-direction: column;
}

.title {
  font-family: "Fredoka", sans-serif;
  font-optical-sizing: auto;
  font-weight: 700;
  font-style: normal;
  font-variation-settings:
    "wdth" 100;
}
</style>
