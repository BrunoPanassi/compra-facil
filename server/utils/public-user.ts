import type { User, PublicUser } from '../../types/User';

/** Explicit allowlist: newly added private fields cannot leak into API responses. */
export function publicUser(user: User): PublicUser {
  return { id: Number(user.id), nome: user.nome, telefone: String(user.telefone), role: user.role };
}
