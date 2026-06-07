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
  // fallback for development only
  if (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) {
    return process.env.VITE_SUPABASE_URL;
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
  // fallback for development only
  if (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_KEY) {
    return process.env.VITE_SUPABASE_KEY;
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
    v.includes('your-supabase-url') ||
    v.includes('your-project.supabase') ||
    v.includes('placeholder.co');
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

  // 1. Validar Tipo (JPG, JPEG, PNG, WEBP + Formatos de Vídeo)
  const isVideo = file.type.toLowerCase().startsWith('video/');
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
  
  if (!allowedImageTypes.includes(file.type.toLowerCase()) && !allowedVideoTypes.includes(file.type.toLowerCase()) && !isVideo) {
    throw new Error('Tipo de arquivo não permitido. Escolha imagens (JPG, JPEG, PNG, WEBP, GIF) ou vídeos (MP4, WEBM, OGG, MOV).');
  }

  // 2. Validar tamanho máximo: 8MB para Imagem, 35MB para Vídeo
  const maxImageSize = 8 * 1024 * 1024;
  const maxVideoSize = 35 * 1024 * 1024;
  const sizeLimit = isVideo ? maxVideoSize : maxImageSize;
  
  if (file.size > sizeLimit) {
    const fileClass = isVideo ? 'vídeos' : 'imagens';
    const limitName = isVideo ? '35MB' : '8MB';
    throw new Error(`Arquivo muito grande! O limite de upload para ${fileClass} é de ${limitName}. Seu arquivo possui ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
  }

  // Compress the image in-browser first if it is an image to keep the application super-light
  let fileToUpload: File | Blob = file;
  if (!isVideo) {
    try {
      fileToUpload = await compressImageIfNeeded(file);
    } catch (err) {
      console.warn('Erro ao pré-comprimir imagem, enviando arquivo original:', err);
    }
  }

  // Sanitize file name to avoid issues with special characters
  const nameToUse = (fileToUpload instanceof File) ? fileToUpload.name : file.name;
  const extMatch = file.name.match(/\.([a-zA-Z0-9]+)$/);
  const originalExt = extMatch ? extMatch[1].toLowerCase() : 'bin';
  const fileExt = fileToUpload.type === 'image/jpeg' ? 'jpg' : originalExt;
  
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

/**
 * Uploads any media (either image or video) to the pneu-center bucket
 * @param file File object to upload
 * @param folder Subfolder to place the file in like 'hero', 'institutional', 'rims', 'banners', 'site'
 */
export async function uploadMedia(file: File, folder: string): Promise<{ publicUrl: string; mediaType: 'image' | 'video' }> {
  if (isSupabaseUrlAbsent || isSupabaseKeyAbsent) {
    throw new Error('Supabase não configurado. Por favor, adicione as credenciais SUPABASE_URL e SUPABASE_KEY.');
  }

  const fileType = file.type.toLowerCase();
  const isVideo = fileType.startsWith('video/') || fileType === 'video/mp4' || fileType === 'video/webm';
  const isImage = fileType.startsWith('image/') || fileType === 'image/jpeg' || fileType === 'image/png' || fileType === 'image/webp' || fileType === 'image/gif';

  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/webm'];

  if (!allowedImageTypes.includes(fileType) && !allowedVideoTypes.includes(fileType)) {
    throw new Error('Formato não permitido. Use JPG, PNG, WEBP, MP4 ou WEBM.');
  }

  if (isVideo) {
    const maxVideoSize = 50 * 1024 * 1024;
    if (file.size > maxVideoSize) {
      throw new Error('Vídeo muito grande. Envie um MP4 ou WEBM otimizado com até 50 MB.');
    }
  } else {
    const maxImageSize = 5 * 1024 * 1024;
    if (file.size > maxImageSize) {
      throw new Error('Arquivo muito grande! O limite de upload para imagens é de 5MB.');
    }
  }

  let fileToUpload: File | Blob = file;
  if (!isVideo) {
    try {
      fileToUpload = await compressImageIfNeeded(file);
    } catch (err) {
      console.warn('Erro ao pré-comprimir imagem, enviando arquivo original:', err);
    }
  }

  const nameToUse = (fileToUpload instanceof File) ? fileToUpload.name : file.name;
  const extMatch = file.name.match(/\.([a-zA-Z0-9]+)$/);
  const originalExt = extMatch ? extMatch[1].toLowerCase() : (isVideo ? 'mp4' : 'jpg');
  const fileExt = fileToUpload.type === 'image/jpeg' ? 'jpg' : originalExt;

  const baseName = nameToUse.replace(/\.[^/.]+$/, "");
  const cleanName = baseName
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 30);

  const fileName = `${Date.now()}_${cleanName}.${fileExt}`;
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
  const filePath = cleanFolder ? `${cleanFolder}/${fileName}` : fileName;

  const { data, error } = await supabase.storage
    .from('pneu-center')
    .upload(filePath, fileToUpload, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error(`Erro no upload para o Storage [Bucket: pneu-center, Path: ${filePath}]:`, error);
    throw new Error(
      `Não foi possível enviar a mídia para a pasta "${folder}/". Verifique se o bucket "pneu-center" está criado publicamente.`
    );
  }

  const { data: urlData } = supabase.storage
    .from('pneu-center')
    .getPublicUrl(filePath);

  if (!urlData || !urlData.publicUrl) {
    throw new Error('Erro ao obter a URL pública para o arquivo enviado.');
  }

  return {
    publicUrl: urlData.publicUrl,
    mediaType: isVideo ? 'video' : 'image'
  };
}
