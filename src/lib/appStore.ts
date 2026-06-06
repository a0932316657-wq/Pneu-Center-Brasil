import { Product } from '../types';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../data';
import { supabase } from './supabaseClient';

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

const PRODUCTS_KEY = 'pneu_center_products_v1';
const SETTINGS_KEY = 'pneu_center_settings_v1';
const LOGO_KEY = 'pneu_center_logo_v1';
const BRANDS_STORE_KEY = 'pneu_center_brands_v1';
const RIM_CARDS_STORE_KEY = 'pneu_center_rim_cards_v1';

// Detection variables for Supabase schemas dynamically
let settingsSchemaType: 'columns' | 'keyvalue' = 'columns';
let productColumns: string[] = [];
let brandColumns: string[] = [];
let rimCardColumns: string[] = [];

/**
 * ------------------------------------------------------------------------
 * DATABASE MAPPERS (DEFENSIVE & AUTO-RESOLVING SCHEMAS)
 * ------------------------------------------------------------------------
 */

function mapProductFromRow(row: any): Product {
  return {
    id: row.id?.toString() || '',
    name: row.name || '',
    brand: row.brand || '',
    measure: row.measure || '',
    rim: Number(row.rim) || 15,
    category: row.category || 'Carro de passeio',
    application: row.application || '',
    specs: Array.isArray(row.specs) ? row.specs : (typeof row.specs === 'string' ? JSON.parse(row.specs) : []),
    status: row.status || 'Em estoque',
    image: row.main_image_url || row.image || '',
    shortDesc: row.short_desc || row.shortDesc || row.shortdesc || '',
    fullDesc: row.full_desc || row.fullDesc || row.fulldesc || '',
    price: row.price != null ? Number(row.price) : undefined,
    priceStatus: row.price_status || row.priceStatus || row.pricestatus || 'sob_consulta',
    gallery: Array.isArray(row.gallery) ? row.gallery : (typeof row.gallery === 'string' ? JSON.parse(row.gallery) : []),
    featured: !!row.featured,
    active: row.active !== false
  };
}

function buildProductPayload(p: Product): any {
  const payload: any = {
    name: p.name,
    brand: p.brand,
    measure: p.measure,
    rim: p.rim,
    category: p.category,
    application: p.application,
    specs: p.specs,
    status: p.status,
    featured: !!p.featured,
    active: p.active !== false,
    price: p.price
  };

  if (p.id && !p.id.startsWith('temp_') && p.id.length < 15) {
    payload.id = p.id;
  }

  // Handle image and main_image_url columns dynamically
  payload.main_image_url = p.image;
  payload.image = p.image;

  // Handle description camelCase / snake_case variants
  payload.short_desc = p.shortDesc || '';
  payload.shortDesc = p.shortDesc || '';
  payload.full_desc = p.fullDesc || '';
  payload.fullDesc = p.fullDesc || '';

  // Handle price status mapping
  payload.price_status = p.priceStatus || 'sob_consulta';
  payload.priceStatus = p.priceStatus || 'sob_consulta';

  // Handle gallery mapping
  payload.gallery = p.gallery || [];

  return payload;
}

function mapBrandFromRow(row: any): Brand {
  return {
    id: row.id?.toString() || '',
    name: row.name || '',
    logo: row.logo || row.logo_url || null,
    active: row.active !== false
  };
}

function mapRimCardFromRow(row: any): RimCard {
  return {
    id: row.id?.toString() || '',
    name: row.name || '',
    rim: Number(row.rim) || 15,
    image: row.image || row.image_url || '',
    description: row.description || '',
    active: row.active !== false
  };
}

function mapSettingsFromDb(rows: any[]): { settings: SiteSettings; logo: string | null } {
  const resultSettings = { ...DEFAULT_SETTINGS };
  let resultLogo: string | null = null;

  if (!rows || rows.length === 0) {
    return { settings: resultSettings, logo: null };
  }

  const firstRow = rows[0];
  const isKeyValue = ('key' in firstRow) && ('value' in firstRow);

  if (isKeyValue) {
    for (const row of rows) {
      const val = row.value;
      switch (row.key) {
        case 'commercialName':
        case 'commercial_name':
          resultSettings.commercialName = val;
          break;
        case 'corporateName':
        case 'corporate_name':
          resultSettings.corporateName = val;
          break;
        case 'cnpj':
          resultSettings.cnpj = val;
          break;
        case 'address':
          resultSettings.address = val;
          break;
        case 'whatsappText':
        case 'whatsapp_text':
          resultSettings.whatsappText = val;
          break;
        case 'whatsappRaw':
        case 'whatsapp_raw':
          resultSettings.whatsappRaw = val;
          break;
        case 'email':
          resultSettings.email = val;
          break;
        case 'hours':
          resultSettings.hours = val;
          break;
        case 'slogan':
          resultSettings.slogan = val;
          break;
        case 'logoUrl':
        case 'logo_url':
        case 'logo':
          resultLogo = val;
          break;
      }
    }
  } else {
    const row = rows[0];
    resultSettings.commercialName = row.commercial_name || row.commercialName || resultSettings.commercialName;
    resultSettings.corporateName = row.corporate_name || row.corporateName || resultSettings.corporateName;
    resultSettings.cnpj = row.cnpj || resultSettings.cnpj;
    resultSettings.address = row.address || resultSettings.address;
    resultSettings.whatsappText = row.whatsapp_text || row.whatsappText || resultSettings.whatsappText;
    resultSettings.whatsappRaw = row.whatsapp_raw || row.whatsappRaw || resultSettings.whatsappRaw;
    resultSettings.email = row.email || resultSettings.email;
    resultSettings.hours = row.hours || resultSettings.hours;
    resultSettings.slogan = row.slogan || resultSettings.slogan;
    resultLogo = row.logo_url || row.logoUrl || row.logo || null;
  }

  return { settings: resultSettings, logo: resultLogo };
}

/**
 * ------------------------------------------------------------------------
 * SYNCHRONOUS CACHED RETRIEVERS (FOR BUNDLING/FLICKER-FREE PAINT)
 * ------------------------------------------------------------------------
 */

export function getProducts(): Product[] {
  if (typeof window === 'undefined') return DEFAULT_PRODUCTS;
  try {
    const stored = localStorage.getItem(PRODUCTS_KEY);
    if (!stored) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    const parsed = JSON.parse(stored) as Product[];
    if (parsed.length === 0) return DEFAULT_PRODUCTS;
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
    console.error('Error reading site settings from localStorage', error);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: SiteSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('pneu_center_settings_updated'));
    
    // Save to Supabase in background
    saveSettingsDb(settings).catch(err => console.error('Error saving settings to DB:', err));
  } catch (error) {
    console.error('Error saving site settings to localStorage', error);
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

export function saveLogo(logoUrl: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOGO_KEY, logoUrl);
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
    
    // Remove from Supabase logo in background too
    removeLogoDb().catch(err => console.error('Error removing logo in DB:', err));
  } catch (error) {
    console.error('Error removing logo from localStorage', error);
  }
}

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
    window.dispatchEvent(new Event('pneu_center_rimcards_updated'));
  } catch (error) {
    console.error('Error saving rim cards to localStorage', error);
  }
}

/**
 * ------------------------------------------------------------------------
 * ASYNCHRONOUS CLOUD SYNCHRONIZER (BACKGROUND OR EXPLICIT PULLS)
 * ------------------------------------------------------------------------
 */

export async function syncFromSupabase(): Promise<void> {
  try {
    // 1. Fetch site_settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('site_settings')
      .select('*');

    if (!settingsError && settingsData && settingsData.length > 0) {
      if ('key' in settingsData[0] && 'value' in settingsData[0]) {
        settingsSchemaType = 'keyvalue';
      } else {
        settingsSchemaType = 'columns';
      }

      const { settings, logo } = mapSettingsFromDb(settingsData);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      if (logo) {
        localStorage.setItem(LOGO_KEY, logo);
      } else {
        localStorage.removeItem(LOGO_KEY);
      }
      window.dispatchEvent(new Event('pneu_center_settings_updated'));
      window.dispatchEvent(new Event('pneu_center_logo_updated'));
    }

    // 2. Fetch products
    const { data: prodData, error: prodError } = await supabase
      .from('products')
      .select('*');

    if (!prodError && prodData) {
      productColumns = prodData.length > 0 ? Object.keys(prodData[0]) : [];
      const mappedProducts = prodData.map(mapProductFromRow);
      if (mappedProducts.length > 0) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(mappedProducts));
        window.dispatchEvent(new Event('pneu_center_products_updated'));
      }
    }

    // 3. Fetch brands
    const { data: brandData, error: brandError } = await supabase
      .from('brands')
      .select('*');

    if (!brandError && brandData) {
      brandColumns = brandData.length > 0 ? Object.keys(brandData[0]) : [];
      const mappedBrands = brandData.map(mapBrandFromRow);
      if (mappedBrands.length > 0) {
        localStorage.setItem(BRANDS_STORE_KEY, JSON.stringify(mappedBrands));
        window.dispatchEvent(new Event('pneu_center_brands_updated'));
      }
    }

    // 4. Fetch rim cards
    const { data: rimData, error: rimError } = await supabase
      .from('rim_cards')
      .select('*');

    if (!rimError && rimData) {
      rimCardColumns = rimData.length > 0 ? Object.keys(rimData[0]) : [];
      const mappedRims = rimData.map(mapRimCardFromRow);
      if (mappedRims.length > 0) {
        localStorage.setItem(RIM_CARDS_STORE_KEY, JSON.stringify(mappedRims));
        window.dispatchEvent(new Event('pneu_center_rimcards_updated'));
      }
    }
  } catch (error) {
    console.error('Error synchronizing with Supabase database:', error);
  }
}

/**
 * ------------------------------------------------------------------------
 * WRITE OPERATIONS DIRECT TO SUPABASE DB
 * ------------------------------------------------------------------------
 */

export async function saveProductDb(product: Product): Promise<Product> {
  const payload = buildProductPayload(product);

  let resultRow: any = null;

  // Try upserting first if the ID looks like a valid primary key
  if (product.id && !product.id.startsWith('temp_') && product.id.length < 15) {
    const { data, error } = await supabase
      .from('products')
      .upsert({ id: product.id, ...payload })
      .select();

    if (!error && data && data.length > 0) {
      resultRow = data[0];
    } else {
      console.warn('Id-based upsert failed, trying general insert:', error);
    }
  }

  // If no success yet, insert as raw row to let Supabase trigger generation (Serial/UUID)
  if (!resultRow) {
    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select();

    if (error) {
      console.error('Error inserting product into Supabase:', error);
      throw error;
    }
    resultRow = data?.[0];
  }

  const mapped = mapProductFromRow(resultRow);
  
  // Re-sync local storage cache
  const currentLocal = getProducts().filter(p => p.id !== product.id && p.id !== mapped.id);
  saveProducts([mapped, ...currentLocal]);
  
  return mapped;
}

export async function deleteProductDb(id: string): Promise<void> {
  // Try deletion with original string cast, then fall back to integer representation
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    const numId = Number(id);
    if (!isNaN(numId)) {
      await supabase.from('products').delete().eq('id', numId);
    }
  }

  // Update local cache
  const updated = getProducts().filter(p => p.id !== id);
  saveProducts(updated);
}

export async function saveBrandDb(brand: Brand): Promise<Brand> {
  const payload: any = {
    name: brand.name,
    logo: brand.logo,
    active: brand.active
  };

  let resultRow: any = null;

  if (brand.id && !brand.id.startsWith('brand_') && brand.id.length < 15) {
    const { data, error } = await supabase
      .from('brands')
      .upsert({ id: brand.id, ...payload })
      .select();
    
    if (!error && data && data.length > 0) {
      resultRow = data[0];
    }
  }

  if (!resultRow) {
    const { data, error } = await supabase
      .from('brands')
      .insert(payload)
      .select();

    if (error) {
      console.error('Error inserting brand to Supabase:', error);
      throw error;
    }
    resultRow = data?.[0];
  }

  const mapped = mapBrandFromRow(resultRow);

  const currentLocal = getBrands().filter(b => b.id !== brand.id && b.id !== mapped.id);
  saveBrands([mapped, ...currentLocal]);

  return mapped;
}

export async function deleteBrandDb(id: string): Promise<void> {
  const { error } = await supabase.from('brands').delete().eq('id', id);
  if (error) {
    const numId = Number(id);
    if (!isNaN(numId)) {
      await supabase.from('brands').delete().eq('id', numId);
    }
  }

  const updated = getBrands().filter(b => b.id !== id);
  saveBrands(updated);
}

export async function saveRimCardDb(card: RimCard): Promise<RimCard> {
  const payload: any = {
    name: card.name,
    rim: card.rim,
    image: card.image,
    description: card.description,
    active: card.active
  };

  let resultRow: any = null;

  if (card.id && !card.id.startsWith('rim_') && card.id.length < 15) {
    const { data, error } = await supabase
      .from('rim_cards')
      .upsert({ id: card.id, ...payload })
      .select();
    
    if (!error && data && data.length > 0) {
      resultRow = data[0];
    }
  }

  if (!resultRow) {
    const { data, error } = await supabase
      .from('rim_cards')
      .insert(payload)
      .select();

    if (error) {
      console.error('Error inserting rim card to Supabase:', error);
      throw error;
    }
    resultRow = data?.[0];
  }

  const mapped = mapRimCardFromRow(resultRow);

  const currentLocal = getRimCards().filter(r => r.id !== card.id && r.id !== mapped.id);
  saveRimCards([mapped, ...currentLocal]);

  return mapped;
}

export async function deleteRimCardDb(id: string): Promise<void> {
  const { error } = await supabase.from('rim_cards').delete().eq('id', id);
  if (error) {
    const numId = Number(id);
    if (!isNaN(numId)) {
      await supabase.from('rim_cards').delete().eq('id', numId);
    }
  }

  const updated = getRimCards().filter(r => r.id !== id);
  saveRimCards(updated);
}

export async function saveSettingsDb(settings: SiteSettings): Promise<void> {
  if (settingsSchemaType === 'keyvalue') {
    const keys = [
      { key: 'commercial_name', value: settings.commercialName },
      { key: 'corporate_name', value: settings.corporateName },
      { key: 'cnpj', value: settings.cnpj },
      { key: 'address', value: settings.address },
      { key: 'whatsapp_text', value: settings.whatsappText },
      { key: 'whatsapp_raw', value: settings.whatsappRaw },
      { key: 'email', value: settings.email },
      { key: 'hours', value: settings.hours },
      { key: 'slogan', value: settings.slogan }
    ];
    await supabase.from('site_settings').upsert(keys);
  } else {
    const payload = {
      commercial_name: settings.commercialName,
      corporate_name: settings.corporateName,
      cnpj: settings.cnpj,
      address: settings.address,
      whatsapp_text: settings.whatsappText,
      whatsapp_raw: settings.whatsappRaw,
      email: settings.email,
      hours: settings.hours,
      slogan: settings.slogan
    };
    
    const { data: rows } = await supabase.from('site_settings').select('*').limit(1);
    if (rows && rows.length > 0) {
      const rowId = rows[0].id;
      await supabase.from('site_settings').update(payload).eq('id', rowId);
    } else {
      await supabase.from('site_settings').insert(payload);
    }
  }
}

export async function saveLogoDb(logoUrl: string): Promise<void> {
  saveLogo(logoUrl);

  if (settingsSchemaType === 'keyvalue') {
    await supabase.from('site_settings').upsert({ key: 'logo_url', value: logoUrl });
  } else {
    const { data: rows } = await supabase.from('site_settings').select('*').limit(1);
    if (rows && rows.length > 0) {
      const rowId = rows[0].id;
      const cols = Object.keys(rows[0]);
      const payload: any = {};
      if (cols.includes('logo_url')) payload.logo_url = logoUrl;
      else if (cols.includes('logo')) payload.logo = logoUrl;
      else if (cols.includes('logoUrl')) payload.logoUrl = logoUrl;
      else payload.logo_url = logoUrl;
      
      await supabase.from('site_settings').update(payload).eq('id', rowId);
    } else {
      await supabase.from('site_settings').insert({ logo_url: logoUrl });
    }
  }
}

export async function removeLogoDb(): Promise<void> {
  if (settingsSchemaType === 'keyvalue') {
    await supabase.from('site_settings').delete().eq('key', 'logo_url');
  } else {
    const { data: rows } = await supabase.from('site_settings').select('*').limit(1);
    if (rows && rows.length > 0) {
      const rowId = rows[0].id;
      const cols = Object.keys(rows[0]);
      const payload: any = {};
      
      if (cols.includes('logo_url')) payload.logo_url = null;
      else if (cols.includes('logo')) payload.logo = null;
      else if (cols.includes('logoUrl')) payload.logoUrl = null;
      else payload.logo_url = null;
      
      await supabase.from('site_settings').update(payload).eq('id', rowId);
    }
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

// Background startup sync on client load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncFromSupabase();
  }, 150);
}
