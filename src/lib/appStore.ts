import { Product } from '../types';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../data';
import { supabase, isSupabaseUrlAbsent, isSupabaseKeyAbsent } from './supabaseClient';

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
  heroImageUrl?: string;
  heroBorderColor?: string;
  heroGlowColor?: string;
  heroBorderRadius?: string;
  heroGlowIntensity?: string;
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
  heroImageUrl: '',
  heroBorderColor: '#f97316',
  heroGlowColor: '#f97316',
  heroBorderRadius: '24',
  heroGlowIntensity: '0.4',
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

/**
 * Checks if a string is a valid UUID
 */
export function isValidUUID(id: string): boolean {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Removes all non-UUID products from localStorage
 */
export function clearDemoProducts(): void {
  const current = getProducts();
  const keep = current.filter(p => isValidUUID(p.id));
  saveProducts(keep);
}

/**
 * ------------------------------------------------------------------------
 * DATABASE MAPPERS (DEFENSIVE & AUTO-RESOLVING SCHEMAS)
 * ------------------------------------------------------------------------
 */

/**
 * Helper to identify real vs demo brand IDs
 */
export function isBrandIdReal(id: string): boolean {
  if (!id) return false;
  const s = id.toString();
  if (/^b\d+$/.test(s) || s.startsWith('brand_') || s.startsWith('temp_')) return false;
  return true;
}

/**
 * Helper to identify real vs demo rim card IDs
 */
export function isRimCardIdReal(id: string): boolean {
  if (!id) return false;
  const s = id.toString();
  if (/^r\d+$/.test(s) || s.startsWith('rim_') || s.startsWith('temp_')) return false;
  return true;
}

function parseSpecs(rawSpecs: any): string[] {
  if (Array.isArray(rawSpecs)) {
    return rawSpecs;
  }
  if (typeof rawSpecs === 'string') {
    const trimmed = rawSpecs.trim();
    if (!trimmed) return [];
    
    // Check if it's a JSON array
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map(item => String(item));
        }
      } catch (e) {
        // Fallback
      }
    }
    
    // Split by pipe or newline safely
    if (trimmed.includes('|')) {
      return trimmed.split('|').map(s => s.trim()).filter(Boolean);
    } else if (trimmed.includes('\n')) {
      return trimmed.split('\n').map(s => s.trim()).filter(Boolean);
    }
    
    return [trimmed];
  }
  return [];
}

function mapProductFromRow(row: any): Product {
  const priceNum = (row.price != null && row.price !== '') ? Number(row.price) : 0;
  
  let computedShowPrice = false;
  if (priceNum > 0) {
    if (row.show_price === undefined || row.show_price === null || row.show_price === '') {
      computedShowPrice = true;
    } else if (typeof row.show_price === 'string') {
      const sp = row.show_price.trim().toLowerCase();
      if (sp === 'true' || sp === 'sim' || sp === '1' || sp === 'yes' || sp === 'exibir') {
        computedShowPrice = true;
      } else {
        computedShowPrice = false;
      }
    } else {
      computedShowPrice = !!row.show_price;
    }
  }

  return {
    id: row.id?.toString() || '',
    name: row.name || '',
    brand: row.brand || '',
    measure: row.measure || '',
    rim: Number(row.rim) || 15,
    category: row.category || 'Carro de passeio',
    application: row.application || '',
    specs: parseSpecs(row.technical_specs || row.specs),
    status: row.availability_status || row.status || 'Em estoque',
    image: row.main_image_url || row.image || '',
    shortDesc: row.short_description || row.short_desc || row.shortDesc || row.shortdesc || '',
    fullDesc: row.full_description || row.full_desc || row.fullDesc || row.fulldesc || '',
    price: priceNum > 0 ? priceNum : undefined,
    priceStatus: computedShowPrice ? 'exibir' : 'sob_consulta',
    gallery: Array.isArray(row.gallery_images) ? row.gallery_images : (Array.isArray(row.gallery) ? row.gallery : (typeof row.gallery_images === 'string' ? JSON.parse(row.gallery_images) : (typeof row.gallery === 'string' ? JSON.parse(row.gallery) : []))),
    featured: !!row.featured,
    active: row.active !== false,

    // New Technical fields
    technical_category: row.technical_category || '',
    terrain: row.terrain || '',
    load_index: row.load_index || '',
    load_capacity: row.load_capacity || '',
    speed_index: row.speed_index || '',
    max_speed: row.max_speed || '',
    compatible_rims: row.compatible_rims || '',
    width_mm: row.width_mm || '',
    diameter_mm: row.diameter_mm || '',
    treadwear: row.treadwear || '',
    traction: row.traction || '',
    temperature: row.temperature || '',
    runflat: row.runflat || '',
    extra_load: row.extra_load || '',
    rim_protector: row.rim_protector || '',
    ply_quantity: row.ply_quantity || '',
    mounting: row.mounting || '',
    letter_color: row.letter_color || '',
    groove_depth: row.groove_depth || '',
    inmetro_label_url: row.inmetro_label_url || ''
  };
}

function buildProductPayload(p: Product): any {
  return {
    name: p.name,
    brand: p.brand,
    measure: p.measure,
    rim: p.rim,
    category: p.category,
    application: p.application,
    technical_specs: p.specs || [],
    availability_status: p.status || 'Em estoque',
    featured: !!p.featured,
    active: p.active !== false,
    price: p.price,
    show_price: p.priceStatus === 'exibir',
    main_image_url: p.image || '',
    short_description: p.shortDesc || '',
    full_description: p.fullDesc || '',
    gallery_images: p.gallery || [],

    // New Technical fields
    technical_category: p.technical_category || '',
    terrain: p.terrain || '',
    load_index: p.load_index || '',
    load_capacity: p.load_capacity || '',
    speed_index: p.speed_index || '',
    max_speed: p.max_speed || '',
    compatible_rims: p.compatible_rims || '',
    width_mm: p.width_mm || '',
    diameter_mm: p.diameter_mm || '',
    treadwear: p.treadwear || '',
    traction: p.traction || '',
    temperature: p.temperature || '',
    runflat: p.runflat || '',
    extra_load: p.extra_load || '',
    rim_protector: p.rim_protector || '',
    ply_quantity: p.ply_quantity || '',
    mounting: p.mounting || '',
    letter_color: p.letter_color || '',
    groove_depth: p.groove_depth || '',
    inmetro_label_url: p.inmetro_label_url || ''
  };
}

function mapBrandFromRow(row: any): Brand {
  return {
    id: row.id?.toString() || '',
    name: row.name || '',
    logo: row.logo_url || row.logo || null,
    active: row.active !== false
  };
}

function mapRimCardFromRow(row: any): RimCard {
  return {
    id: row.id?.toString() || '',
    name: row.title || row.name || '',
    rim: Number(row.rim) || 15,
    image: row.image_url || row.image || '',
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
        case 'hero_image_url':
        case 'heroImageUrl':
          resultSettings.heroImageUrl = val;
          break;
        case 'hero_border_color':
        case 'heroBorderColor':
          resultSettings.heroBorderColor = val;
          break;
        case 'hero_glow_color':
        case 'heroGlowColor':
          resultSettings.heroGlowColor = val;
          break;
        case 'hero_border_radius':
        case 'heroBorderRadius':
          resultSettings.heroBorderRadius = val;
          break;
        case 'hero_glow_intensity':
        case 'heroGlowIntensity':
          resultSettings.heroGlowIntensity = val;
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
    resultSettings.heroImageUrl = row.hero_image_url || row.heroImageUrl || resultSettings.heroImageUrl;
    resultSettings.heroBorderColor = row.hero_border_color || row.heroBorderColor || resultSettings.heroBorderColor;
    resultSettings.heroGlowColor = row.hero_glow_color || row.heroGlowColor || resultSettings.heroGlowColor;
    resultSettings.heroBorderRadius = row.hero_border_radius || row.heroBorderRadius || resultSettings.heroBorderRadius;
    resultSettings.heroGlowIntensity = row.hero_glow_intensity || row.heroGlowIntensity || resultSettings.heroGlowIntensity;
    resultLogo = row.logo_url || row.logoUrl || row.logo || null;
  }

  return { settings: resultSettings, logo: resultLogo };
}

/**
 * ------------------------------------------------------------------------
 * SYNCHRONOUS CACHED RETRIEVERS (FOR FAST INTERFACE REDUCTION)
 * ------------------------------------------------------------------------
 */

export function getProducts(): Product[] {
  if (typeof window === 'undefined') return DEFAULT_PRODUCTS;
  try {
    const isSupabaseConnected = !isSupabaseUrlAbsent && !isSupabaseKeyAbsent;
    const stored = localStorage.getItem(PRODUCTS_KEY);
    
    if (isSupabaseConnected) {
      if (stored) {
        const parsed = JSON.parse(stored) as Product[];
        // Prioritize only products with valid UUIDs from Supabase
        return parsed.filter(p => isValidUUID(p.id));
      }
      return [];
    } else {
      if (!stored) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
        return DEFAULT_PRODUCTS;
      }
      const parsed = JSON.parse(stored) as Product[];
      if (parsed.length === 0) return DEFAULT_PRODUCTS;
      return parsed;
    }
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
    
    // Save to Supabase in background without blocking current thread
    saveSettingsDb(settings).catch(err => console.error('Error saving settings to Supabase in background:', err));
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
    
    // Remove in background
    removeLogoDb().catch(err => console.error('Error removing logo in background:', err));
  } catch (error) {
    console.error('Error removing logo from localStorage', error);
  }
}

export function getBrands(): Brand[] {
  if (typeof window === 'undefined') return DEFAULT_BRANDS;
  try {
    const isSupabaseConnected = !isSupabaseUrlAbsent && !isSupabaseKeyAbsent;
    const stored = localStorage.getItem(BRANDS_STORE_KEY);
    
    let parsed: Brand[] = [];
    if (stored) {
      parsed = JSON.parse(stored) as Brand[];
    }
    
    // In local mode, if there are brands in localStorage, we can use them directly
    if (!isSupabaseConnected) {
      if (parsed.length === 0) return DEFAULT_BRANDS;
      return parsed;
    }
    
    // In database mode, we extract real database rows and merge with default list
    const dbBrands = parsed.filter(b => isBrandIdReal(b.id));
    
    const mergedMap = new Map<string, Brand>();
    // First insert defaults
    for (const b of DEFAULT_BRANDS) {
      mergedMap.set(b.name.toLowerCase().trim(), b);
    }
    // Then overwrite with database brands (if they have the same name) or add new custom brands
    for (const b of dbBrands) {
      mergedMap.set(b.name.toLowerCase().trim(), b);
    }
    
    return Array.from(mergedMap.values());
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
    const isSupabaseConnected = !isSupabaseUrlAbsent && !isSupabaseKeyAbsent;
    const stored = localStorage.getItem(RIM_CARDS_STORE_KEY);
    
    let parsed: RimCard[] = [];
    if (stored) {
      parsed = JSON.parse(stored) as RimCard[];
    }
    
    // In local mode, if there are rim cards in localStorage, we use them directly
    if (!isSupabaseConnected) {
      if (parsed.length === 0) return DEFAULT_RIM_CARDS;
      return parsed;
    }
    
    // In database mode, extract real database rim records and merge with default presets
    const dbRimCards = parsed.filter(r => isRimCardIdReal(r.id));
    
    const mergedMap = new Map<number, RimCard>();
    // First, insert defaults
    for (const r of DEFAULT_RIM_CARDS) {
      mergedMap.set(r.rim, r);
    }
    // Then, override with database ones or insert brand-new ones
    for (const r of dbRimCards) {
      mergedMap.set(r.rim, r);
    }
    
    return Array.from(mergedMap.values()).sort((a, b) => a.rim - b.rim);
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
      const mappedProducts = prodData.map(mapProductFromRow);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(mappedProducts));
      window.dispatchEvent(new Event('pneu_center_products_updated'));
    }

    // 3. Fetch brands
    const { data: brandData, error: brandError } = await supabase
      .from('brands')
      .select('*');

    if (!brandError && brandData) {
      const mappedBrands = brandData.map(mapBrandFromRow);
      localStorage.setItem(BRANDS_STORE_KEY, JSON.stringify(mappedBrands));
      window.dispatchEvent(new Event('pneu_center_brands_updated'));
    }

    // 4. Fetch rim cards
    const { data: rimData, error: rimError } = await supabase
      .from('rim_cards')
      .select('*');

    if (!rimError && rimData) {
      const mappedRims = rimData.map(mapRimCardFromRow);
      localStorage.setItem(RIM_CARDS_STORE_KEY, JSON.stringify(mappedRims));
      window.dispatchEvent(new Event('pneu_center_rimcards_updated'));
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
  const isSupabaseConnected = !isSupabaseUrlAbsent && !isSupabaseKeyAbsent;
  const payload = buildProductPayload(product);
  let resultRow: any = null;

  if (isSupabaseConnected) {
    // Since Supabase uses UUID for products, check if it's a valid UUID
    const isIdReal = product.id && isValidUUID(product.id);

    const attemptSave = async (pay: any) => {
      if (isIdReal) {
        const { data, error } = await supabase
          .from('products')
          .update(pay)
          .eq('id', product.id)
          .select();

        if (!error && data && data.length > 0) {
          return data[0];
        }
        if (error && (error.message?.includes('column') || error.code === '42703')) {
          throw error; // Propagate column error for retry handling
        }
      }

      const { data, error } = await supabase
        .from('products')
        .insert(pay)
        .select();

      if (error) {
        throw error;
      }
      return data?.[0];
    };

    try {
      resultRow = await attemptSave(payload);
    } catch (saveError: any) {
      const isColError = saveError.message?.includes('column') || saveError.code === '42703';
      if (isColError) {
        console.warn('New technical columns not found on Supabase schema yet. Stripping and retrying with standard columns...');
        const stripped = { ...payload };
        const technicalKeys = [
          'technical_category', 'terrain', 'load_index', 'load_capacity',
          'speed_index', 'max_speed', 'compatible_rims', 'width_mm',
          'diameter_mm', 'treadwear', 'traction', 'temperature',
          'runflat', 'extra_load', 'rim_protector', 'ply_quantity',
          'mounting', 'letter_color', 'groove_depth', 'inmetro_label_url'
        ];
        technicalKeys.forEach(k => {
          delete stripped[k];
        });

        try {
          resultRow = await attemptSave(stripped);
        } catch (retryError: any) {
          console.error('Fatal saving even with stripped columns:', retryError);
          throw new Error(`Erro ao salvar produto no Supabase: ${retryError.message}`);
        }
      } else {
        console.error('Save error occurred:', saveError);
        throw new Error(`Erro ao salvar produto no Supabase: ${saveError.message}`);
      }
    }
  }

  const mapped = resultRow ? mapProductFromRow(resultRow) : {
    ...product,
    id: isValidUUID(product.id) ? product.id : 'prod_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 4)
  };
  
  // Update local storage instantly to reflect changes immediately
  const currentLocal = getProducts().filter(p => p.id !== product.id && p.id !== mapped.id);
  saveProducts([mapped, ...currentLocal]);
  
  window.dispatchEvent(new Event('pneu_center_products_updated'));
  return mapped;
}

export async function deleteProductDb(id: string): Promise<void> {
  const isSupabaseConnected = !isSupabaseUrlAbsent && !isSupabaseKeyAbsent;
  if (isSupabaseConnected && isValidUUID(id)) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete product from Supabase:', error);
      throw new Error(`Erro ao deletar produto do Supabase: ${error.message}`);
    }
  } else {
    console.log('ID is not a valid UUID or offline, skipping Supabase delete (treating as local/demo product):', id);
  }

  // Update local cache immediately
  const updated = getProducts().filter(p => p.id !== id);
  saveProducts(updated);
}

export async function saveBrandDb(brand: Brand): Promise<Brand> {
  const payload: any = {
    name: brand.name,
    logo_url: brand.logo,
    active: brand.active
  };

  let resultRow: any = null;
  const isIdReal = isBrandIdReal(brand.id);
  const numericId = isIdReal && !isNaN(Number(brand.id)) ? Number(brand.id) : null;
  const brandIdToUse = numericId !== null ? numericId : brand.id;

  if (isIdReal) {
    const { data, error } = await supabase
      .from('brands')
      .update(payload)
      .eq('id', brandIdToUse)
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
      throw new Error(`Erro ao cadastrar marca no Supabase: ${error.message}`);
    }
    resultRow = data?.[0];
  }

  if (!resultRow) {
    throw new Error('Supabase retornou um resultado nulo ao salvar marca.');
  }

  const mapped = mapBrandFromRow(resultRow);

  const currentLocal = getBrands().filter(b => b.id !== brand.id && b.id !== mapped.id);
  saveBrands([mapped, ...currentLocal]);

  return mapped;
}

export async function deleteBrandDb(id: string): Promise<void> {
  if (isBrandIdReal(id)) {
    const numericId = !isNaN(Number(id)) ? Number(id) : null;
    const idValue = numericId !== null ? numericId : id;

    const { error } = await supabase.from('brands').delete().eq('id', idValue);
    if (error) {
      console.error('Error deleting brand:', error);
      throw new Error(`Erro ao deletar marca do Supabase: ${error.message}`);
    }
  }

  const updated = getBrands().filter(b => b.id !== id);
  saveBrands(updated);
}

export async function saveRimCardDb(card: RimCard): Promise<RimCard> {
  const payload: any = {
    title: card.name,
    rim: card.rim,
    image_url: card.image,
    description: card.description,
    active: card.active
  };

  let resultRow: any = null;
  const isIdReal = isRimCardIdReal(card.id);
  const numericId = isIdReal && !isNaN(Number(card.id)) ? Number(card.id) : null;
  const cardIdToUse = numericId !== null ? numericId : card.id;

  if (isIdReal) {
    const { data, error } = await supabase
      .from('rim_cards')
      .update(payload)
      .eq('id', cardIdToUse)
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
      throw new Error(`Erro ao salvar card de aro no Supabase: ${error.message}`);
    }
    resultRow = data?.[0];
  }

  if (!resultRow) {
    throw new Error('Supabase retornou um resultado nulo ao salvar card de aro.');
  }

  const mapped = mapRimCardFromRow(resultRow);

  const currentLocal = getRimCards().filter(r => r.id !== card.id && r.id !== mapped.id);
  saveRimCards([mapped, ...currentLocal]);

  return mapped;
}

export async function deleteRimCardDb(id: string): Promise<void> {
  if (isRimCardIdReal(id)) {
    const numericId = !isNaN(Number(id)) ? Number(id) : null;
    const idValue = numericId !== null ? numericId : id;

    const { error } = await supabase.from('rim_cards').delete().eq('id', idValue);
    if (error) {
      console.error('Error deleting rim card:', error);
      throw new Error(`Erro ao deletar card de aro do Supabase: ${error.message}`);
    }
  }

  const updated = getRimCards().filter(r => r.id !== id);
  saveRimCards(updated);
}

export async function saveSettingsDb(settings: SiteSettings): Promise<void> {
  try {
    const { data: rows, error: selectErr } = await supabase.from('site_settings').select('*');
    if (selectErr) throw selectErr;

    const isKeyValue = rows && rows.length > 0 && 'key' in rows[0] && 'value' in rows[0];

    if (isKeyValue) {
      const keys = [
        { key: 'commercial_name', value: settings.commercialName },
        { key: 'commercialName', value: settings.commercialName },
        { key: 'corporate_name', value: settings.corporateName },
        { key: 'corporateName', value: settings.corporateName },
        { key: 'cnpj', value: settings.cnpj },
        { key: 'address', value: settings.address },
        { key: 'whatsapp_text', value: settings.whatsappText },
        { key: 'whatsappText', value: settings.whatsappText },
        { key: 'whatsapp_raw', value: settings.whatsappRaw },
        { key: 'whatsappRaw', value: settings.whatsappRaw },
        { key: 'email', value: settings.email },
        { key: 'hours', value: settings.hours },
        { key: 'slogan', value: settings.slogan },
        { key: 'hero_image_url', value: settings.heroImageUrl || '' },
        { key: 'heroImageUrl', value: settings.heroImageUrl || '' },
        { key: 'hero_border_color', value: settings.heroBorderColor || '' },
        { key: 'heroBorderColor', value: settings.heroBorderColor || '' },
        { key: 'hero_glow_color', value: settings.heroGlowColor || '' },
        { key: 'heroGlowColor', value: settings.heroGlowColor || '' },
        { key: 'hero_border_radius', value: settings.heroBorderRadius || '' },
        { key: 'heroBorderRadius', value: settings.heroBorderRadius || '' },
        { key: 'hero_glow_intensity', value: settings.heroGlowIntensity || '' },
        { key: 'heroGlowIntensity', value: settings.heroGlowIntensity || '' }
      ];
      
      const validDbKeys = rows.map(r => r.key);
      const payloadKeys = keys.filter(k => validDbKeys.includes(k.key));
      
      if (payloadKeys.length > 0) {
        for (const item of payloadKeys) {
          const match = rows.find(r => r.key === item.key);
          if (match) {
            await supabase.from('site_settings').upsert({ id: match.id, key: item.key, value: item.value });
          } else {
            await supabase.from('site_settings').insert({ key: item.key, value: item.value });
          }
        }
      } else {
        const initialKeys = [
          { key: 'commercial_name', value: settings.commercialName },
          { key: 'corporate_name', value: settings.corporateName },
          { key: 'cnpj', value: settings.cnpj },
          { key: 'address', value: settings.address },
          { key: 'whatsapp_text', value: settings.whatsappText },
          { key: 'whatsapp_raw', value: settings.whatsappRaw },
          { key: 'email', value: settings.email },
          { key: 'hours', value: settings.hours },
          { key: 'slogan', value: settings.slogan },
          { key: 'hero_image_url', value: settings.heroImageUrl || '' },
          { key: 'hero_border_color', value: settings.heroBorderColor || '' },
          { key: 'hero_glow_color', value: settings.heroGlowColor || '' },
          { key: 'hero_border_radius', value: settings.heroBorderRadius || '' },
          { key: 'hero_glow_intensity', value: settings.heroGlowIntensity || '' }
        ];
        await supabase.from('site_settings').upsert(initialKeys);
      }
    } else {
      const payload: any = {};
      const cols = rows && rows.length > 0 ? Object.keys(rows[0]) : [];
      
      const setField = (dbField: string, val: any) => {
        if (cols.includes(dbField)) payload[dbField] = val;
      };

      setField('commercial_name', settings.commercialName);
      setField('commercialName', settings.commercialName);
      setField('corporate_name', settings.corporateName);
      setField('corporateName', settings.corporateName);
      setField('cnpj', settings.cnpj);
      setField('address', settings.address);
      setField('whatsapp_text', settings.whatsappText);
      setField('whatsappText', settings.whatsappText);
      setField('whatsapp_raw', settings.whatsappRaw);
      setField('whatsappRaw', settings.whatsappRaw);
      setField('email', settings.email);
      setField('hours', settings.hours);
      setField('slogan', settings.slogan);
      setField('hero_image_url', settings.heroImageUrl || '');
      setField('heroImageUrl', settings.heroImageUrl || '');
      setField('hero_border_color', settings.heroBorderColor || '');
      setField('heroBorderColor', settings.heroBorderColor || '');
      setField('hero_glow_color', settings.heroGlowColor || '');
      setField('heroGlowColor', settings.heroGlowColor || '');
      setField('hero_border_radius', settings.heroBorderRadius || '');
      setField('heroBorderRadius', settings.heroBorderRadius || '');
      setField('hero_glow_intensity', settings.heroGlowIntensity || '');
      setField('heroGlowIntensity', settings.heroGlowIntensity || '');

      if (rows && rows.length > 0) {
        const rowId = rows[0].id;
        const { error: updateErr } = await supabase.from('site_settings').update(payload).eq('id', rowId);
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase.from('site_settings').insert(payload);
        if (insertErr) throw insertErr;
      }
    }
  } catch (err: any) {
    console.error('Failed to save settings in Supabase DB:', err);
    throw new Error(`Erro ao salvar configurações no Supabase: ${err.message || err}`);
  }
}

export async function saveLogoDb(logoUrl: string): Promise<void> {
  // Save locally first to be instantaneous
  saveLogo(logoUrl);

  try {
    const { data: rows, error: selectErr } = await supabase.from('site_settings').select('*');
    if (selectErr) throw selectErr;

    if (rows && rows.length > 0) {
      const isKeyValue = 'key' in rows[0] && 'value' in rows[0];
      if (isKeyValue) {
        const existingLogo = rows.find(r => r.key === 'logo_url' || r.key === 'logoUrl' || r.key === 'logo');
        if (existingLogo) {
          const { error: upsertErr } = await supabase
            .from('site_settings')
            .upsert({ id: existingLogo.id, key: existingLogo.key, value: logoUrl });
          if (upsertErr) throw upsertErr;
        } else {
          const { error: insertErr } = await supabase
            .from('site_settings')
            .insert({ key: 'logo_url', value: logoUrl });
          if (insertErr) throw insertErr;
        }
      } else {
        const rowId = rows[0].id;
        const cols = Object.keys(rows[0]);
        const payload: any = {};
        if (cols.includes('logo_url')) payload.logo_url = logoUrl;
        else if (cols.includes('logo')) payload.logo = logoUrl;
        else if (cols.includes('logoUrl')) payload.logoUrl = logoUrl;
        else payload.logo_url = logoUrl;

        const { error: updateErr } = await supabase
          .from('site_settings')
          .update(payload)
          .eq('id', rowId);
        if (updateErr) throw updateErr;
      }
    } else {
      const { error: insertErr } = await supabase
        .from('site_settings')
        .insert({ logo_url: logoUrl });
      
      if (insertErr) {
        await supabase.from('site_settings').insert({ key: 'logo_url', value: logoUrl });
      }
    }
  } catch (err: any) {
    console.error('Failed to save logo in Supabase DB:', err);
    throw new Error(`Erro ao salvar logo no Supabase: ${err.message || err}`);
  }
}

export async function removeLogoDb(): Promise<void> {
  // Update locally first
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOGO_KEY);
    window.dispatchEvent(new Event('pneu_center_logo_updated'));
  }

  try {
    const { data: rows, error: selectErr } = await supabase.from('site_settings').select('*');
    if (selectErr) throw selectErr;

    if (rows && rows.length > 0) {
      const isKeyValue = 'key' in rows[0] && 'value' in rows[0];
      if (isKeyValue) {
        const existingLogo = rows.find(r => r.key === 'logo_url' || r.key === 'logoUrl' || r.key === 'logo');
        if (existingLogo) {
          await supabase.from('site_settings').delete().eq('id', existingLogo.id);
        }
      } else {
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
  } catch (err: any) {
    console.error('Failed to delete logo from Supabase DB:', err);
    throw new Error(`Erro ao remover logo do Supabase: ${err.message || err}`);
  }
}

/**
 * Optimizes/Compresses an image file to safe JPEG Base64 as secondary utility
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
          resolve(event.target?.result as string);
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
