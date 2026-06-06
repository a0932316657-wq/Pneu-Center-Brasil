import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  ((import.meta as any).env?.VITE_SUPABASE_URL) || 
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) || 
  '';

const supabaseKey = 
  ((import.meta as any).env?.VITE_SUPABASE_KEY) || 
  (typeof process !== 'undefined' && process.env?.SUPABASE_KEY) || 
  '';

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'As credenciais do Supabase não foram encontradas! Certifique-se de configurar SUPABASE_URL e SUPABASE_KEY nas Variáveis de Ambiente.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

/**
 * Compress an image in the browser to make it lightweight before uploading
 */
function compressImageIfNeeded(file: File): Promise<File | Blob> {
  return new Promise((resolve) => {
    // Only compress common image files, and exclude GIFs to avoid breaking animations
    if (!file.type.startsWith('image/') || file.type === 'image/gif') {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Keep maximum dimension to 1200px for outstanding crispness yet minimal file size
        const MAX_DIM = 1200;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress to JPEG with 0.75 quality (highly optimized file size)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const baseName = file.name.replace(/\.[^/.]+$/, "");
              const compressedFile = new File([blob], `${baseName}.jpg`, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.75
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

/**
 * Uploads a file to a Supabase bucket folder and returns the public URL.
 * Automatically compresses image files to keep mobile visits light and fast.
 * 
 * @param bucketName Name of the storage bucket
 * @param folder Subfolder path inside the bucket, e.g. "products", "brands", "rims", "logo"
 * @param file The file object to upload
 */
export async function uploadFile(bucketName: string, folder: string, file: File): Promise<string> {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase não configurado. Por favor, configure as Variáveis de Ambiente.');
  }

  // Compress the image in-browser first to make the application super-light
  let fileToUpload: File | Blob = file;
  try {
    fileToUpload = await compressImageIfNeeded(file);
  } catch (err) {
    console.warn('Erro ao pré-comprimir imagem, enviando arquivo original:', err);
  }

  // Sanitize file name to avoid issues with special characters
  const nameToUse = (fileToUpload instanceof File) ? fileToUpload.name : file.name;
  const fileExt = 'jpg'; // We convert to jpg in compression, fallback to original extension
  const baseName = nameToUse.replace(/\.[^/.]+$/, "");
  const cleanName = baseName
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 30);
  
  const fileName = `${Date.now()}_${cleanName}.${fileExt}`;
  
  // Assemble final path
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
  const filePath = cleanFolder ? `${cleanFolder}/${fileName}` : fileName;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, fileToUpload, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Erro no upload do Supabase Storage:', error);
    throw error;
  }

  // Retrieve public URL
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}
