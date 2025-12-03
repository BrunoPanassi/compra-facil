import { defineStore } from 'pinia';
import { type Role } from '~/types/Role';
import type { User } from '~/types/User';
import { showErrorMessage } from '~/util/Util';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null
  }),
  actions: {
    async login(telefone: string, senha: string) {
      const { data, error } = await useFetch('/api/user/login', {
        method: 'POST',
        body: { telefone, senha }
      });

      if (error.value) {
        const data = error.value.data
        const defaultMessage = 'Erro ao se autenticar, tente novamente.'
        throw new Error(showErrorMessage(defaultMessage, data?.message))
      }
      this.user = data.value as any;
    },
    async register(nome: string, telefone: string, senha: string, role: Role) {
      const { data, error } = await useFetch('/api/user/register', {
        method: 'POST',
        body: { nome, telefone, senha, role }
      });

      if (error.value) {
        const data = error.value.data
        const defaultMessage = 'Falha ao cadastrar'
        showErrorMessage(defaultMessage, data?.message)
      }
      this.user = data.value as any;
    },
    logout() {
      this.user = null;
    }
  },
  getters: {
    getId: (state) => {
      return () => state.user?.id ?? 0
    }
  }
});
