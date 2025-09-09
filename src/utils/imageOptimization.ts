import imageCompression from 'browser-image-compression';

export const optimizeImage = async (file: File, maxSizeMB = 1, maxWidthOrHeight = 1920) => {
  const options = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    maxIteration: 10,
    fileType: 'webp'
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Image compression error:', error);
    return file;
  }
};

export const convertToWebP = async (file: File) => {
  try {
    const img = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0);

    return await new Promise<File>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
            type: 'image/webp'
          });
          resolve(webpFile);
        } else {
          reject(new Error('Blob creation failed'));
        }
      }, 'image/webp');
    });
  } catch (error) {
    console.error('WebP conversion error:', error);
    return file;
  }
};