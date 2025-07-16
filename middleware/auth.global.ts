import { useAuthStore } from '@/stores/auth';
import { EnumRole } from '~/types/Role';

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();

  const notAuthenticatedRoutes = [
    '/',
    '/login'
  ]

  if (!auth.user && !notAuthenticatedRoutes.includes(to.path)) {
    if (to.path === '/') return navigateTo('/');
    if (to.path === '/login') return navigateTo('/login');
  }

  if (auth.user && auth.user.role == EnumRole.ADMIN && to.path === '/admin') {
    return navigateTo('/admin')
  }
});
