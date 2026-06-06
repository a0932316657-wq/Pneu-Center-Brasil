import { createClient } from '@supabase/supabase-js';

function getSupabaseUrl(): string {
  // 1. import.meta.env.VITE_SUPABASE_URL
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) {
    return (import.meta as any).env.VITE_SUPABASE_URL;
  }
  // 3. import.meta.env.SUPABASE_URL
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.SUPABASE_URL) {
    return (import.meta as any).env.SUPABASE_URL;
  }
  // 5. process.env.SUPABASE_URL
  if (typeof process !== 'undefined' && process.env?.SUPABASE_URL) {
    return process.env.SUPABASE_URL;
  }
  return '';
}

function getSupabaseKey(): string {
  // 2. import.meta.env.VITE_SUPABASE_KEY
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_KEY) {
    return (import.meta as any).env.VITE_SUPABASE_KEY;
  }
  // 4. import.meta.env.SUPABASE_KEY
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.SUPABASE_KEY) {
    return (import.meta as any).env.SUPABASE_KEY;
  }
  // 6. process.env.SUPABASE_KEY
  if (typeof process !== 'undefined' && process.env?.SUPABASE_KEY) {
    return process.env.SUPABASE_KEY;
  }
  return '';
}

const rawUrl = getSupabaseUrl();
const rawKey = getSupabaseKey();

// Check if raw values are actually placeholder texts or empty
const hasPlaceholderUrl = (val: string): boolean => {
  const v = val.toLowerCase().trim();
  return !v || 
    v.includes('placeholder.supabase') || 
    v.includes('placeholder_supabase') || 
    v.includes('sua-url-supabase') || 
    v.includes('your-supabase-url');
};

const hasPlaceholderKey = (val: string): boolean => {
  const v = val.toLowerCase().trim();
  return !v || 
    v.includes('placeholder') || 
    v.includes('sua-chave') || 
    v.includes('your-anon-key');
};

// Flags stating whether original system env vars are absent/placeholders
export const isSupabaseUrlAbsent = hasPlaceholderUrl(rawUrl);
export const isSupabaseKeyAbsent = hasPlaceholderKey(rawKey);

// Define final URL. Use exactly "https://jpqtdcwvlchhxxovfftl.supabase.co" if absent or placeholder.
let finalUrl = isSupabaseUrlAbsent ? 'https://jpqtdcwvlchhxxovfftl.supabase.co' : rawUrl.trim();

// Ensure it doesn't end with /rest/v1 or trailing slash
finalUrl = finalUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '').trim();

// Define final key.
const finalKey = isSupabaseKeyAbsent ? '' : rawKey.trim();

// Print logs exactly as requested:
console.log(`Supabase URL carregada: ${!isSupabaseUrlAbsent ? 'sim' : 'não'}`);
console.log(`Supabase KEY carregada: ${!isSupabaseKeyAbsent ? 'sim' : 'não'}`);

export const supabase = createClient(
  finalUrl,
  finalKey || 'placeholder-key'
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
        // Compress to JPEG with 0.80 quality (highly optimized file size requested in Problem 8)
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
          0.80
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
  if (isSupabaseUrlAbsent || isSupabaseKeyAbsent) {
    throw new Error('Supabase não configurado. Por favor, adicione as credenciais SUPABASE_URL e SUPABASE_KEY.');
  }

  // 1. Validar Tipo (JPG, JPEG, PNG, WEBP)
  const allowedExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedExtensions.includes(file.type.toLowerCase())) {
    throw new Error('Tipo de imagem não permitido. Escolha JPG, JPEG, PNG ou WEBP.');
  }

  // 2. Validar tamanho máximo: 5MB Original
  const maxSize_5MB = 5 * 1024 * 1024;
  if (file.size > maxSize_5MB) {
    throw new Error(`Arquivo muito grande! O limite de upload é de 5MB. Sua foto possui ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
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

  // Perform upload
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, fileToUpload, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error(`Erro no upload para o Storage [Bucket: ${bucketName}, Path: ${filePath}]:`, error);
    throw new Error(
      `Não foi possível enviar a imagem para a pasta "${folder}/". Verifique se o bucket "${bucketName}" está criado publicamente e as regras de políticas dão permissão de upload ao usuário.`
    );
  }

  // Retrieve public URL
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  if (!urlData || !urlData.publicUrl) {
    throw new Error('Erro ao obter a URL pública para o arquivo de imagem enviado.');
  }

  return urlData.publicUrl;
}
