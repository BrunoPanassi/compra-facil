export function resizeAndCompressImage(
  file: File,
  options: {
    maxWidth: number;
    maxHeight: number;
    quality: number;
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
