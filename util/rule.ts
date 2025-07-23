export const regexPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()[\]{}|\\;:'",.<>/?`~+=_-]).{6,}$/;
export const passwordRule = (value:string) => regexPassword.test(value) || 'A senha deve conter no mínimo 6 caracteres, incluindo uma letra maiúscula, um número e um caractere especial.';
export const requiredRule = (value:string) => !!value || 'Esse campo é obrigatório'
export const priceRule = (min: number) => (value:string) => parseInt(value.replace(/\D/g, '')) >= min || `O preço deve ser maior que R$${min},00`
export const maxRule = (max: number) => (value: string) => parseInt(value) <= max || `Quantidade máxima de ${max}`
export const minRule = (min: number) => (value: string) => parseInt(value) >= min || `Quantidade mínima de ${min}`
export const maxQuantRule = (max: number) => (value: []) => value.length <= max || `Quantidade máxima de ${max} items`
export const minQuantRule = (min: number) => (value: []) => value.length >= min || `Quantidade mínima de ${min} items`