import { Product } from '../types';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../data';

export interface SiteSettings {
  commercialName: string;
  corporateName: string;
  cnpj: string;
  address: string;
  whatsappText: string;
  whatsappRaw: string;
  email: string;
  hours: string;
  slogan: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  commercialName: 'Pneu Center Brasil',
  corporateName: 'CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA',
  cnpj: '20.085.983/0001-13',
  address: 'Av. Professor Francisco Morato, 2001, Butantã, São Paulo/SP, CEP 05513-200',
  whatsappText: '(11) 99594-6993',
  whatsappRaw: '5511995946993',
  email: 'contato.pneucenterbrasil@gmail.com',
  hours: 'Segunda a sexta, das 8h às 18h. Sábado, das 8h às 13h.',
  slogan: 'Catálogo Oficial Multimarcas',
};

const PRODUCTS_KEY = 'pneu_center_products_v1';
const SETTINGS_KEY = 'pneu_center_settings_v1';
const LOGO_KEY = 'pneu_center_logo_v1';

/**
 * ------------------------------------------------------------------------
 * PERSISTENCE LAYER - PNEU CENTER BRASIL
 * ------------------------------------------------------------------------
 * Note for future maintenance:
 * Currently, this store operates client-side using localStorage as a robust
 * offline-first fallback. This ensures the admin panel can be previewed
 * immediately on any browser.
 * 
 * TO CONNECT TO A REAL DATABASE (e.g. Firebase Firestore, Cloud SQL, Supabase):
 * 1. Replace the localStorage getters/setters with async fetch/sdk operations.
 * 2. Example for Firebase:
 *    import { db, storage } from './firebaseConfig';
 *    import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
 * 
 *    export async function getProductsDb() {
 *       const querySnapshot = await getDocs(collection(db, 'products'));
 *       return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
 *    }
 * 3. Make sure to adapt React components to handle async Promises (with state loading spin).
 */

export function getProducts(): Product[] {
  if (typeof window === 'undefined') return DEFAULT_PRODUCTS;
  try {
    const stored = localStorage.getItem(PRODUCTS_KEY);
    if (!stored) {
      // Initialize localStorage with defaults to make them immediately editable
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    
    const parsed = JSON.parse(stored) as Product[];
    // Fallback: merge default products if stored array is empty to prevent blank catalog on first boot
    if (parsed.length === 0) {
      return DEFAULT_PRODUCTS;
    }
    return parsed;
  } catch (error) {
    console.error('Error reading products from localStorage', error);
    return DEFAULT_PRODUCTS;
  }
}

export function saveProducts(products: Product[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    // Trigger custom event to notify other mounted components if necessary
    window.dispatchEvent(new Event('pneu_center_products_updated'));
  } catch (error) {
    console.error('Error saving products to localStorage', error);
  }
}

export function getSettings(): SiteSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(stored) as SiteSettings;
  } catch (error) {
    console.error('Error reading settings from localStorage', error);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: SiteSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('pneu_center_settings_updated'));
  } catch (error) {
    console.error('Error saving settings to localStorage', error);
  }
}

export function getLogo(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(LOGO_KEY);
  } catch (error) {
    console.error('Error reading logo from localStorage', error);
    return null;
  }
}

export function saveLogo(base64Image: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOGO_KEY, base64Image);
    window.dispatchEvent(new Event('pneu_center_logo_updated'));
  } catch (error) {
    console.error('Error saving logo to localStorage', error);
  }
}

export function removeLogo(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LOGO_KEY);
    window.dispatchEvent(new Event('pneu_center_logo_updated'));
  } catch (error) {
    console.error('Error removing logo from localStorage', error);
  }
}

/**
 * Optimizes/Compresses an image file to safe JPEG Base64 to prevent localStorage quota issues
 */
export function compressImage(file: File, maxWidth = 800, maxHeight = 600, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string); // Keep original if canvas fails
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export interface Brand {
  id: string;
  name: string;
  logo: string | null;
  active: boolean;
}

export interface RimCard {
  id: string;
  name: string;
  rim: number;
  image: string;
  description: string;
  active: boolean;
}

const BRANDS_STORE_KEY = 'pneu_center_brands_v1';
const RIM_CARDS_STORE_KEY = 'pneu_center_rim_cards_v1';

const DEFAULT_BRANDS: Brand[] = [
  { id: 'b1', name: 'Pirelli', logo: null, active: true },
  { id: 'b2', name: 'Michelin', logo: null, active: true },
  { id: 'b3', name: 'Goodyear', logo: null, active: true },
  { id: 'b4', name: 'Bridgestone', logo: null, active: true },
  { id: 'b5', name: 'Continental', logo: null, active: true },
  { id: 'b6', name: 'Dunlop', logo: null, active: true },
  { id: 'b7', name: 'Firestone', logo: null, active: true },
  { id: 'b8', name: 'Hankook', logo: null, active: true },
];

const DEFAULT_RIM_CARDS: RimCard[] = [
  { id: 'r13', name: 'Aro 13', rim: 13, image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400', description: 'Para compactos urbanos', active: true },
  { id: 'r14', name: 'Aro 14', rim: 14, image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=400', description: 'Para hatches e compactos', active: true },
  { id: 'r15', name: 'Aro 15', rim: 15, image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=400', description: 'Para hatches e sedans médios', active: true },
  { id: 'r16', name: 'Aro 16', rim: 16, image: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&q=80&w=400', description: 'Excelente estabilidade e conforto', active: true },
  { id: 'r17', name: 'Aro 17', rim: 17, image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400', description: 'Para esportivos e premium', active: true },
  { id: 'r18', name: 'Aro 18', rim: 18, image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=400', description: 'Para SUVs de alto rendimento', active: true },
];

export function getBrands(): Brand[] {
  if (typeof window === 'undefined') return DEFAULT_BRANDS;
  try {
    const stored = localStorage.getItem(BRANDS_STORE_KEY);
    if (!stored) {
      localStorage.setItem(BRANDS_STORE_KEY, JSON.stringify(DEFAULT_BRANDS));
      return DEFAULT_BRANDS;
    }
    return JSON.parse(stored) as Brand[];
  } catch (error) {
    console.error('Error reading brands from localStorage', error);
    return DEFAULT_BRANDS;
  }
}

export function saveBrands(brands: Brand[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BRANDS_STORE_KEY, JSON.stringify(brands));
    window.dispatchEvent(new Event('pneu_center_brands_updated'));
  } catch (error) {
    console.error('Error saving brands to localStorage', error);
  }
}

export function getRimCards(): RimCard[] {
  if (typeof window === 'undefined') return DEFAULT_RIM_CARDS;
  try {
    const stored = localStorage.getItem(RIM_CARDS_STORE_KEY);
    if (!stored) {
      localStorage.setItem(RIM_CARDS_STORE_KEY, JSON.stringify(DEFAULT_RIM_CARDS));
      return DEFAULT_RIM_CARDS;
    }
    return JSON.parse(stored) as RimCard[];
  } catch (error) {
    console.error('Error reading rim cards from localStorage', error);
    return DEFAULT_RIM_CARDS;
  }
}

export function saveRimCards(rimCards: RimCard[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RIM_CARDS_STORE_KEY, JSON.stringify(rimCards));
    window.dispatchEvent(new Event('pneu_center_rim_cards_updated'));
  } catch (error) {
    console.error('Error saving rim cards to localStorage', error);
  }
}
