import type { ViaCepResponse } from "~/types/ViaCEPResponse";

// server/api/via-cep/[cep].ts
export default defineEventHandler(async (event) => {
  const cep = event.context.params?.cep?.replace(/\D/g, '');

  if (!cep || cep.length !== 8) {
    throw createError({ statusCode: 400, statusMessage: 'CEP inválido' });
  }

  try {
    const response = await $fetch<ViaCepResponse>(`https://viacep.com.br/ws/${cep}/json/`);
    if ('erro' in response) {
      throw createError({ statusCode: 404, statusMessage: 'CEP não encontrado' });
    }

    return response;
  } catch (err) {
    console.error(err);
    throw createError({ statusCode: 500, statusMessage: 'Erro ao buscar o CEP' });
  }
});
