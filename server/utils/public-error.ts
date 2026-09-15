import { createError } from 'h3';

/** Only explicitly classified failures cross the public boundary. */
export function publicError(error: unknown) {
  const status = error && typeof error === 'object' && 'statusCode' in error ? error.statusCode : 500;
  const messages: Record<number, string> = {
    400: 'Dados inválidos.', 401: 'Telefone ou senha inválidos.', 403: 'Operação não permitida.',
    404: 'Registro não encontrado.', 405: 'Método não permitido.', 409: 'Registro em conflito.',
  };
  const code = typeof status === 'number' && Object.hasOwn(messages, status) ? status : 503;
  return createError({ statusCode: code, statusMessage: messages[code] || 'Serviço temporariamente indisponível.', stack: '' });
}
