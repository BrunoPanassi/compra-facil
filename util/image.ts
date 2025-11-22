export function resizeAndCompressImage(
  file: File,
  options = {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.7
  }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) return reject(new Error('Erro ao ler imagem'));

      img.src = e.target.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Redimensiona mantendo proporção
        if (width > options.maxWidth || height > options.maxHeight) {
          const ratio = Math.min(
            options.maxWidth / width,
            options.maxHeight / height
          );
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Erro no contexto do canvas'));

        ctx.drawImage(img, 0, 0, width, height);

        // Converte para base64 com compressão
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const base64 = canvas.toDataURL(mimeType, options.quality);

        resolve(base64);
      };

      img.onerror = reject;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function processImageAndReturnUrl(imageObject: File | string) {
  if (imageObject instanceof File) {
    const data = await resizeAndCompressImage(imageObject)
    return await uploadImageHostingReturnUrl(data)
  }
  if (typeof imageObject === 'string') {
    if (isValidURL(imageObject)) {
      return imageObject
    }
    if (isValidBase64(imageObject)) {
      return await uploadImageHostingReturnUrl(imageObject)
    }
  }
  return imageObject
}

export function isValidURL(url: string) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

export function isValidBase64(str: string) {
  // Regular expression to match Base64 characters and padding
  const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

  // Check if the string matches the Base64 pattern
  if (!base64Regex.test(str)) {
    return false;
  }

  // Attempt to decode the string to verify its integrity
  try {
    atob(str);
    return true;
  } catch (e) {
    return false;
  }
}

export async function uploadImageHostingReturnUrl(imageBase64: string) {
  const imageHostingUrl = 'https://api.imgbb.com/1/upload?key=83881527799e244d9d01f87dd33f90e9'
  const form = new FormData();
  form.append('image', imageBase64.split(',').pop() || ''); // ou convert to base64 as API requires
  const resp = await $fetch(imageHostingUrl, {
    method: 'POST',
    body: form
  });
  return (resp as any).data.url as string
}
