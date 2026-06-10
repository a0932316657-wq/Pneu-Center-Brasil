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
  heroMediaType?: 'image' | 'video';
  heroBorderColor?: string;
  heroGlowColor?: string;
  heroBorderRadius?: string;
  heroGlowIntensity?: string;
  institutionalMediaUrl?: string;
  institutionalMediaType?: 'image' | 'video';
  institutionalMediaAlt?: string;
  featuredMediaUrl?: string;
  featuredMediaType?: 'image' | 'video';
  featuredMediaAlt?: string;
  institutionalText?: string;
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
  mediaType?: 'image' | 'video';
}

const DEFAULT_SETTINGS: SiteSettings = {
  commercialName: 'Pneu Center Brasil',
  corporateName: 'CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA',
  cnpj: '20.085.983/0001-13',
  address: 'Av. Professor Francisco Morato, 2001, Butantã, São Paulo/SP, CEP 05513-200',
  whatsappText: '(11) 99594-6993',
  whatsappRaw: '5511995946993',
  email: 'contato@pneucenterbrasil.com.br',
  hours: 'Segunda a sexta, das 8h às 18h. Sábado, das 8h às 13h.',
  slogan: 'Catálogo Oficial Multimarcas',
  institutionalText: 'A Pneu Center Brasil é especialista independente no comércio e distribuição de pneus de alta performance. Atuando com seriedade, transparência e agilidade logística, nossa equipe comercial auxilia cada cliente na escolha ideal para o modelo de seu veículo conversando diretamente pelo WhatsApp.',
  heroImageUrl: '',
  heroMediaType: 'image',
  heroBorderColor: '#f97316',
  heroGlowColor: '#f97316',
  heroBorderRadius: '24',
  heroGlowIntensity: '0.4',
  institutionalMediaUrl: '',
  institutionalMediaType: 'image',
  institutionalMediaAlt: 'Pneu Center Brasil • Distribuição Digital',
  featuredMediaUrl: '',
  featuredMediaType: 'image',
  featuredMediaAlt: 'Destaque Especial Pneu Center Brasil'
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

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[\/\\_]/g, '-') // replace slash and underbar with dash
    .replace(/[^a-z0-9\- ]/g, '') // remove other special chars
    .replace(/\s+/g, '-') // spaces to hyphen
    .replace(/-+/g, '-') // remove double hyphens
    .replace(/^-+|-+$/g, ''); // trim hyphens
}

export function generateUniqueSlug(name: string, productId?: string, existingProducts?: Product[]): string {
  const baseSlug = slugify(name);
  if (!baseSlug) return 'pneu';
  
  const prods = existingProducts || getProducts();
  let candidate = baseSlug;
  let suffix = 2;
  
  while (prods.some(p => p.slug === candidate && p.id !== productId)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix++;
  }
  return candidate;
}

export function normalizeMeasure(m: string): string {
  if (!m) return '';
  return m.toLowerCase().replace(/[\/\s]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}

function formatRimForUrl(rim: string): string {
  if (!rim || rim === 'Todos') return '';
  if (rim === 'SUV') return 'aro-suv';
  const match = rim.match(/\d+/);
  if (match) return `aro-${match[0]}`;
  return '';
}

function parseRimFromUrl(part: string): string {
  if (!part) return 'Todos';
  if (part === 'aro-suv') return 'SUV';
  const match = part.match(/^aro-(\d+)$/);
  if (match) return `Aro ${match[1]}`;
  return 'Todos';
}

function formatBrandForUrl(brand: string): string {
  if (!brand || brand === 'Todas') return '';
  return brand.toLowerCase().trim();
}

function parseBrandFromUrl(part: string, brands: { name: string }[]): string {
  if (!part) return 'Todas';
  const matched = brands.find(b => b.name.toLowerCase().trim() === part.toLowerCase().trim());
  return matched ? matched.name : 'Todas';
}

export interface CatalogFilters {
  rim?: string;
  brand?: string;
  measure?: string;
  search?: string;
}

export function buildCatalogUrl(filters: CatalogFilters): string {
  let hash = '#/catalogo';
  const { rim, brand, measure, search } = filters;

  // 1. Rim
  if (rim && rim !== 'Todos') {
    if (rim === 'SUV') {
      hash += '/aro-suv';
    } else {
      const match = rim.match(/\d+/);
      if (match) {
        hash += `/aro-${match[0]}`;
      } else if (rim.startsWith('aro-')) {
        hash += `/${rim}`;
      }
    }
  }

  // 2. Brand
  if (brand && brand !== 'Todas') {
    const brandSlug = slugify(brand);
    if (brandSlug) {
      hash += `/marca/${brandSlug}`;
    }
  }

  // 3. Measure
  if (measure) {
    const measureSlug = normalizeMeasure(measure);
    if (measureSlug) {
      hash += `/medida/${measureSlug}`;
    }
  }

  // 4. Search query
  if (search && search.trim() !== '') {
    hash += `?q=${encodeURIComponent(search.trim())}`;
  }

  return hash;
}

export function parseCatalogUrl(hash: string, brands: { name: string }[] = []): { rim: string; brand: string; measure: string; search: string } {
  let rim = 'Todos';
  let brand = 'Todas';
  let measure = '';
  let search = '';

  if (!hash || !hash.startsWith('#/catalogo')) {
    return { rim, brand, measure, search };
  }

  const qIndex = hash.indexOf('?');
  let pathStr = hash;
  if (qIndex >= 0) {
    pathStr = hash.substring(0, qIndex);
    const queryStr = hash.substring(qIndex + 1);
    const params = new URLSearchParams(queryStr);
    search = params.get('q') || '';
  }

  const path = pathStr.replace('#/catalogo', '');
  if (!path || path === '/') {
    return { rim, brand, measure, search };
  }

  const parts = path.split('/').map(p => p.trim()).filter(p => p && p !== '');

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === 'aro-suv') {
      rim = 'SUV';
    } else if (part.startsWith('aro-')) {
      const match = part.match(/^aro-(\d+)$/);
      if (match) {
        rim = `Aro ${match[1]}`;
      }
    } else if (part === 'marca' && i + 1 < parts.length) {
      const val = parts[i + 1].toLowerCase().trim();
      const matched = brands.find(b => slugify(b.name) === val || b.name.toLowerCase().trim() === val);
      brand = matched ? matched.name : parts[i + 1];
      if (!matched && val) {
        brand = val.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
      i++;
    } else if (part === 'medida' && i + 1 < parts.length) {
      measure = parts[i + 1];
      i++;
    }
  }

  return { rim, brand, measure, search };
}

export function getCatalogHash(rim: string, brand: string, measure: string): string {
  return buildCatalogUrl({ rim, brand, measure });
}

export function parseCatalogHash(hash: string, brands: { name: string }[]): { rim: string; brand: string; measure: string } {
  const parsed = parseCatalogUrl(hash, brands);
  return { rim: parsed.rim, brand: parsed.brand, measure: parsed.measure };
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
    inmetro_label_url: row.inmetro_label_url || '',
    slug: row.slug || ''
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
    inmetro_label_url: p.inmetro_label_url || '',
    slug: p.slug || ''
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

export function cleanDescription(desc: string | undefined | null): string {
  if (!desc) return '';
  return desc.replace(/\[INMETRO_SEAL:.*?\]/g, '').replace(/\[DEFAULT_MEDIA:.*?\]/g, '').trim();
}

export function extractTag(desc: string | undefined | null, tagPrefix: string): string | null {
  if (!desc) return null;
  const regex = new RegExp(`\\[${tagPrefix}:([^\\]]*)\\]`);
  const match = desc.match(regex);
  return match ? match[1] : null;
}

export function preserveMetadataTags(newDesc: string, oldDesc: string | undefined | null): string {
  if (!oldDesc) return newDesc;
  let finalDesc = newDesc;
  const sealMatch = oldDesc.match(/\[INMETRO_SEAL:.*?\]/);
  if (sealMatch) {
    if (!finalDesc.includes('[INMETRO_SEAL:')) {
      finalDesc += ' ' + sealMatch[0];
    }
  }
  const mediaMatch = oldDesc.match(/\[DEFAULT_MEDIA:.*?\]/);
  if (mediaMatch) {
    if (!finalDesc.includes('[DEFAULT_MEDIA:')) {
      finalDesc += ' ' + mediaMatch[0];
    }
  }
  return finalDesc.trim();
}

function mapRimCardFromRow(row: any): RimCard {
  return {
    id: row.id?.toString() || '',
    name: row.title || row.name || '',
    rim: Number(row.rim) || 15,
    image: row.image_url || row.image || '',
    description: cleanDescription(row.description),
    active: row.active !== false,
    mediaType: row.media_type || row.mediaType || 'image'
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
        case 'hero_media_type':
        case 'heroMediaType':
          resultSettings.heroMediaType = val;
          break;
        case 'featured_media_url':
        case 'featuredMediaUrl':
          resultSettings.featuredMediaUrl = val;
          break;
        case 'featured_media_type':
        case 'featuredMediaType':
          resultSettings.featuredMediaType = val;
          break;
        case 'featured_media_alt':
        case 'featuredMediaAlt':
          resultSettings.featuredMediaAlt = val;
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
        case 'institutional_media_url':
        case 'institutionalMediaUrl':
          resultSettings.institutionalMediaUrl = val;
          break;
        case 'institutional_media_type':
        case 'institutionalMediaType':
          resultSettings.institutionalMediaType = val;
          break;
        case 'institutional_media_alt':
        case 'institutionalMediaAlt':
          resultSettings.institutionalMediaAlt = val;
          break;
        case 'institutional_text':
        case 'institutionalText':
          resultSettings.institutionalText = val;
          break;
        case 'rim_default_media_fallback':
          try {
            if (val) {
              localStorage.setItem('pneu_center_rim_default_media_v1', val);
              window.dispatchEvent(new Event('pneu_center_rim_default_media_updated'));
            }
          } catch (e) {
            console.warn('Error reading fallback media:', e);
          }
          break;
        case 'rim_inmetro_seals_fallback':
          try {
            if (val) {
              localStorage.setItem('pneu_center_rim_inmetro_seals_v1', val);
              window.dispatchEvent(new Event('pneu_center_rim_inmetro_seals_updated'));
            }
          } catch (e) {
            console.warn('Error reading fallback seals:', e);
          }
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
    resultSettings.institutionalText = row.institutional_text || row.institutionalText || resultSettings.institutionalText;
    resultSettings.heroImageUrl = row.hero_image_url || row.heroImageUrl || resultSettings.heroImageUrl;
    resultSettings.heroMediaType = row.hero_media_type || row.heroMediaType || resultSettings.heroMediaType;
    resultSettings.featuredMediaUrl = row.featured_media_url || row.featuredMediaUrl || resultSettings.featuredMediaUrl;
    resultSettings.featuredMediaType = row.featured_media_type || row.featuredMediaType || resultSettings.featuredMediaType;
    resultSettings.featuredMediaAlt = row.featured_media_alt || row.featuredMediaAlt || resultSettings.featuredMediaAlt;
    resultSettings.heroBorderColor = row.hero_border_color || row.heroBorderColor || resultSettings.heroBorderColor;
    resultSettings.heroGlowColor = row.hero_glow_color || row.heroGlowColor || resultSettings.heroGlowColor;
    resultSettings.heroBorderRadius = row.hero_border_radius || row.heroBorderRadius || resultSettings.heroBorderRadius;
    resultSettings.heroGlowIntensity = row.hero_glow_intensity || row.heroGlowIntensity || resultSettings.heroGlowIntensity;
    resultSettings.institutionalMediaUrl = row.institutional_media_url || row.institutionalMediaUrl || resultSettings.institutionalMediaUrl;
    resultSettings.institutionalMediaType = row.institutional_media_type || row.institutionalMediaType || resultSettings.institutionalMediaType;
    resultSettings.institutionalMediaAlt = row.institutional_media_alt || row.institutionalMediaAlt || resultSettings.institutionalMediaAlt;
    resultLogo = row.logo_url || row.logoUrl || row.logo || null;

    if (row.rim_default_media_fallback) {
      try {
        localStorage.setItem('pneu_center_rim_default_media_v1', row.rim_default_media_fallback);
        window.dispatchEvent(new Event('pneu_center_rim_default_media_updated'));
      } catch (e) {}
    }
    if (row.rim_inmetro_seals_fallback) {
      try {
        localStorage.setItem('pneu_center_rim_inmetro_seals_v1', row.rim_inmetro_seals_fallback);
        window.dispatchEvent(new Event('pneu_center_rim_inmetro_seals_updated'));
      } catch (e) {}
    }
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

let isSupabaseSynced = false;

export function isSyncedWithSupabase(): boolean {
  return isSupabaseSynced;
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

      // Parse inline inmetro seals and fallback media from rim cards description column
      const fallbackSeals: RimInmetroSeal[] = [];
      const fallbackMedia: RimDefaultMedia[] = [];

      for (const row of rimData) {
        const rimNum = Number(row.rim);
        if (rimNum) {
          const sealUrl = extractTag(row.description, 'INMETRO_SEAL');
          if (sealUrl) {
            fallbackSeals.push({ rim: rimNum, seal_url: sealUrl });
          }
          const mediaUrl = extractTag(row.description, 'DEFAULT_MEDIA');
          if (mediaUrl) {
            fallbackMedia.push({ rim: rimNum, image_url: mediaUrl });
          }
        }
      }

      if (fallbackSeals.length > 0) {
        saveRimInmetroSeals(fallbackSeals);
      }
      if (fallbackMedia.length > 0) {
        saveRimDefaultMedia(fallbackMedia);
      }

      window.dispatchEvent(new Event('pneu_center_rimcards_updated'));
    }
    isSupabaseSynced = true;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('pneu_center_sync_completed'));
    }
  } catch (error) {
    console.error('Error synchronizing with Supabase database:', error);
    isSupabaseSynced = true;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('pneu_center_sync_completed'));
    }
  }
}

/**
 * ------------------------------------------------------------------------
 * WRITE OPERATIONS DIRECT TO SUPABASE DB
 * ------------------------------------------------------------------------
 */

export async function saveProductDb(product: Product): Promise<Product> {
  // Auto-generate or update slug if creation, name changed, or slug is empty
  const localProducts = getProducts();
  const original = localProducts.find(p => p.id === product.id);
  if (!product.slug || !original || original.name !== product.name) {
    product.slug = generateUniqueSlug(product.name, product.id, localProducts);
  }

  // Automatic default rim image assignment if none is specified
  if (!product.image || product.image.trim() === '') {
    const defaults = getRimDefaultMedia();
    const match = defaults.find(m => m.rim === product.rim);
    if (match && match.image_url) {
      product.image = match.image_url;
    }
  }

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
          'mounting', 'letter_color', 'groove_depth', 'inmetro_label_url', 'slug'
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

  try {
    const { data: colsCheck } = await supabase.from('rim_cards').select('*').limit(1);
    if (colsCheck && colsCheck.length > 0) {
      if ('media_type' in colsCheck[0]) {
        payload.media_type = card.mediaType || 'image';
      } else if ('mediaType' in colsCheck[0]) {
        payload.mediaType = card.mediaType || 'image';
      }
    } else {
      // If table is empty, we try setting media_type and we can fallback if it fails
      payload.media_type = card.mediaType || 'image';
    }
  } catch (err) {
    console.warn('Could not check rim_cards columns:', err);
  }

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
        { key: 'hero_media_type', value: settings.heroMediaType || 'image' },
        { key: 'heroMediaType', value: settings.heroMediaType || 'image' },
        { key: 'featured_media_url', value: settings.featuredMediaUrl || '' },
        { key: 'featuredMediaUrl', value: settings.featuredMediaUrl || '' },
        { key: 'featured_media_type', value: settings.featuredMediaType || 'image' },
        { key: 'featuredMediaType', value: settings.featuredMediaType || 'image' },
        { key: 'featured_media_alt', value: settings.featuredMediaAlt || '' },
        { key: 'featuredMediaAlt', value: settings.featuredMediaAlt || '' },
        { key: 'hero_border_color', value: settings.heroBorderColor || '' },
        { key: 'heroBorderColor', value: settings.heroBorderColor || '' },
        { key: 'hero_glow_color', value: settings.heroGlowColor || '' },
        { key: 'heroGlowColor', value: settings.heroGlowColor || '' },
        { key: 'hero_border_radius', value: settings.heroBorderRadius || '' },
        { key: 'heroBorderRadius', value: settings.heroBorderRadius || '' },
        { key: 'hero_glow_intensity', value: settings.heroGlowIntensity || '' },
        { key: 'heroGlowIntensity', value: settings.heroGlowIntensity || '' },
        { key: 'institutional_media_url', value: settings.institutionalMediaUrl || '' },
        { key: 'institutionalMediaUrl', value: settings.institutionalMediaUrl || '' },
        { key: 'institutional_media_type', value: settings.institutionalMediaType || 'image' },
        { key: 'institutionalMediaType', value: settings.institutionalMediaType || 'image' },
        { key: 'institutional_media_alt', value: settings.institutionalMediaAlt || '' },
        { key: 'institutionalMediaAlt', value: settings.institutionalMediaAlt || '' },
        { key: 'institutional_text', value: settings.institutionalText || '' },
        { key: 'institutionalText', value: settings.institutionalText || '' }
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
          { key: 'hero_media_type', value: settings.heroMediaType || 'image' },
          { key: 'featured_media_url', value: settings.featuredMediaUrl || '' },
          { key: 'featured_media_type', value: settings.featuredMediaType || 'image' },
          { key: 'featured_media_alt', value: settings.featuredMediaAlt || '' },
          { key: 'hero_border_color', value: settings.heroBorderColor || '' },
          { key: 'hero_glow_color', value: settings.heroGlowColor || '' },
          { key: 'hero_border_radius', value: settings.heroBorderRadius || '' },
          { key: 'hero_glow_intensity', value: settings.heroGlowIntensity || '' },
          { key: 'institutional_media_url', value: settings.institutionalMediaUrl || '' },
          { key: 'institutional_media_type', value: settings.institutionalMediaType || 'image' },
          { key: 'institutional_media_alt', value: settings.institutionalMediaAlt || '' },
          { key: 'institutional_text', value: settings.institutionalText || '' }
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
      setField('hero_media_type', settings.heroMediaType || 'image');
      setField('heroMediaType', settings.heroMediaType || 'image');
      setField('featured_media_url', settings.featuredMediaUrl || '');
      setField('featuredMediaUrl', settings.featuredMediaUrl || '');
      setField('featured_media_type', settings.featuredMediaType || 'image');
      setField('featuredMediaType', settings.featuredMediaType || 'image');
      setField('featured_media_alt', settings.featuredMediaAlt || '');
      setField('featuredMediaAlt', settings.featuredMediaAlt || '');
      setField('hero_border_color', settings.heroBorderColor || '');
      setField('heroBorderColor', settings.heroBorderColor || '');
      setField('hero_glow_color', settings.heroGlowColor || '');
      setField('heroGlowColor', settings.heroGlowColor || '');
      setField('hero_border_radius', settings.heroBorderRadius || '');
      setField('heroBorderRadius', settings.heroBorderRadius || '');
      setField('hero_glow_intensity', settings.heroGlowIntensity || '');
      setField('heroGlowIntensity', settings.heroGlowIntensity || '');
      setField('institutional_media_url', settings.institutionalMediaUrl || '');
      setField('institutionalMediaUrl', settings.institutionalMediaUrl || '');
      setField('institutional_media_type', settings.institutionalMediaType || 'image');
      setField('institutionalMediaType', settings.institutionalMediaType || 'image');
      setField('institutional_media_alt', settings.institutionalMediaAlt || '');
      setField('institutionalMediaAlt', settings.institutionalMediaAlt || '');
      setField('institutional_text', settings.institutionalText || '');
      setField('institutionalText', settings.institutionalText || '');

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
    fetchRimMediaSettingsDb().catch(() => {});
  }, 150);
}

export interface RimMediaSetting {
  id?: string;
  rim: string;
  default_image_url?: string | null;
  inmetro_label_url?: string | null;
  default_image_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RimDefaultMedia {
  id?: string;
  rim: number;
  image_url: string;
}

export interface RimInmetroSeal {
  id?: string;
  rim: number;
  seal_url: string;
}

// Global in-memory state which serves as the active cache across all pages
let rimMediaSettingsMemory: RimMediaSetting[] = [];

export function getRimMediaSettings(): RimMediaSetting[] {
  return rimMediaSettingsMemory;
}

export function saveRimMediaSettingsLocal(items: RimMediaSetting[]): void {
  rimMediaSettingsMemory = items;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('pneu_center_rim_media_settings_updated'));
    window.dispatchEvent(new Event('pneu_center_rim_default_media_updated'));
    window.dispatchEvent(new Event('pneu_center_rim_inmetro_seals_updated'));
  }
}

// Deprecated local storage helper only kept for compatibility/backwards sync
const RIM_DEFAULT_MEDIA_KEY = 'pneu_center_rim_default_media_v1';
const RIM_INMETRO_SEALS_KEY = 'pneu_center_rim_inmetro_seals_v1';

export function getRimDefaultMedia(): RimDefaultMedia[] {
  return rimMediaSettingsMemory
    .filter(m => m.default_image_url)
    .map(m => ({
      id: m.id,
      rim: Number(m.rim),
      image_url: m.default_image_url!
    }));
}

export function saveRimDefaultMedia(items: RimDefaultMedia[]): void {
  // Synchronize memory state to reflect these items
  const copy = [...rimMediaSettingsMemory];
  for (const item of items) {
    const existing = copy.find(m => Number(m.rim) === item.rim);
    if (existing) {
      existing.default_image_url = item.image_url;
    } else {
      copy.push({
        rim: item.rim.toString(),
        default_image_url: item.image_url,
        inmetro_label_url: null,
        default_image_type: 'image'
      });
    }
  }
  saveRimMediaSettingsLocal(copy);
}

export function getRimInmetroSeals(): RimInmetroSeal[] {
  return rimMediaSettingsMemory
    .filter(m => m.inmetro_label_url)
    .map(m => ({
      id: m.id,
      rim: Number(m.rim),
      seal_url: m.inmetro_label_url!
    }));
}

export function saveRimInmetroSeals(items: RimInmetroSeal[]): void {
  // Synchronize memory state to reflect these items
  const copy = [...rimMediaSettingsMemory];
  for (const item of items) {
    const existing = copy.find(m => Number(m.rim) === item.rim);
    if (existing) {
      existing.inmetro_label_url = item.seal_url;
    } else {
      copy.push({
        rim: item.rim.toString(),
        default_image_url: null,
        inmetro_label_url: item.seal_url,
        default_image_type: 'image'
      });
    }
  }
  saveRimMediaSettingsLocal(copy);
}

export async function fetchRimMediaSettingsDb(): Promise<RimMediaSetting[]> {
  const isSupabaseConnected = !isSupabaseUrlAbsent && !isSupabaseKeyAbsent;
  if (!isSupabaseConnected) return rimMediaSettingsMemory;

  try {
    const { data, error } = await supabase
      .from('rim_media_settings')
      .select('*');

    if (error) {
      console.warn('Error fetching from rim_media_settings database table:', error.message);
      return rimMediaSettingsMemory;
    }

    if (data) {
      const mapped: RimMediaSetting[] = data.map((row: any) => ({
        id: row.id?.toString(),
        rim: row.rim?.toString() || '',
        default_image_url: row.default_image_url || null,
        inmetro_label_url: row.inmetro_label_url || null,
        default_image_type: row.default_image_type || 'image'
      }));
      saveRimMediaSettingsLocal(mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('Failed to query rim_media_settings table from Supabase:', err);
  }
  return rimMediaSettingsMemory;
}

export async function fetchRimDefaultMediaDb(): Promise<RimDefaultMedia[]> {
  await fetchRimMediaSettingsDb();
  return getRimDefaultMedia();
}

export async function fetchRimInmetroSealsDb(): Promise<RimInmetroSeal[]> {
  await fetchRimMediaSettingsDb();
  return getRimInmetroSeals();
}

export async function saveRimDefaultMediaDb(rim: number, imageUrl: string): Promise<void> {
  const isSupabaseConnected = !isSupabaseUrlAbsent && !isSupabaseKeyAbsent;
  if (!isSupabaseConnected) {
    const existing = rimMediaSettingsMemory.find(m => Number(m.rim) === rim);
    if (existing) {
      existing.default_image_url = imageUrl;
    } else {
      rimMediaSettingsMemory.push({
        rim: rim.toString(),
        default_image_url: imageUrl,
        inmetro_label_url: null,
        default_image_type: 'image'
      });
    }
    saveRimMediaSettingsLocal([...rimMediaSettingsMemory]);
    return;
  }

  try {
    // Check if a setting for this rim already exists in rim_media_settings
    const { data, error } = await supabase
      .from('rim_media_settings')
      .select('*')
      .eq('rim', rim.toString());

    if (!error && data && data.length > 0) {
      // Update
      const { error: updateError } = await supabase
        .from('rim_media_settings')
        .update({
          default_image_url: imageUrl,
          default_image_type: 'image',
          updated_at: new Date().toISOString()
        })
        .eq('rim', rim.toString());
      if (updateError) throw updateError;
    } else {
      // Insert
      const { error: insertError } = await supabase
        .from('rim_media_settings')
        .insert({
          rim: rim.toString(),
          default_image_url: imageUrl,
          default_image_type: 'image'
        });
      if (insertError) throw insertError;
    }

    await fetchRimMediaSettingsDb();
  } catch (err: any) {
    console.error('Error saving default media image to Supabase:', err);
    throw new Error(`Erro ao salvar imagem oficial no Supabase: ${err.message || err}`);
  }
}

export async function saveRimInmetroSealDb(rim: number, sealUrl: string): Promise<void> {
  const isSupabaseConnected = !isSupabaseUrlAbsent && !isSupabaseKeyAbsent;
  if (!isSupabaseConnected) {
    const existing = rimMediaSettingsMemory.find(m => Number(m.rim) === rim);
    if (existing) {
      existing.inmetro_label_url = sealUrl;
    } else {
      rimMediaSettingsMemory.push({
        rim: rim.toString(),
        default_image_url: null,
        inmetro_label_url: sealUrl,
        default_image_type: 'image'
      });
    }
    saveRimMediaSettingsLocal([...rimMediaSettingsMemory]);
    return;
  }

  try {
    // Check if a setting for this rim already exists in rim_media_settings
    const { data, error } = await supabase
      .from('rim_media_settings')
      .select('*')
      .eq('rim', rim.toString());

    if (!error && data && data.length > 0) {
      // Update
      const { error: updateError } = await supabase
        .from('rim_media_settings')
        .update({
          inmetro_label_url: sealUrl,
          updated_at: new Date().toISOString()
        })
        .eq('rim', rim.toString());
      if (updateError) throw updateError;
    } else {
      // Insert
      const { error: insertError } = await supabase
        .from('rim_media_settings')
        .insert({
          rim: rim.toString(),
          inmetro_label_url: sealUrl,
          default_image_type: 'image'
        });
      if (insertError) throw insertError;
    }

    await fetchRimMediaSettingsDb();
  } catch (err: any) {
    console.error('Error saving Inmetro label to Supabase:', err);
    throw new Error(`Erro ao salvar selo INMETRO no Supabase: ${err.message || err}`);
  }
}

export async function migrateLocalMediaToSupabase(): Promise<{ migratedCount: number; errorsCount: number }> {
  let migratedCount = 0;
  let errorsCount = 0;

  // Retrieve old localized fallback settings
  let oldMedia: RimDefaultMedia[] = [];
  let oldSeals: RimInmetroSeal[] = [];

  try {
    const mSt = localStorage.getItem(RIM_DEFAULT_MEDIA_KEY);
    if (mSt) oldMedia = JSON.parse(mSt);
  } catch (_) {}

  try {
    const sSt = localStorage.getItem(RIM_INMETRO_SEALS_KEY);
    if (sSt) oldSeals = JSON.parse(sSt);
  } catch (_) {}

  // Gather items to migrate grouped by rim
  const grouped = new Map<string, { default_img?: string; seal_img?: string }>();

  for (const m of oldMedia) {
    const rimStr = m.rim.toString();
    if (rimStr && m.image_url) {
      grouped.set(rimStr, { ...grouped.get(rimStr), default_img: m.image_url });
    }
  }

  for (const s of oldSeals) {
    const rimStr = s.rim.toString();
    if (rimStr && s.seal_url) {
      grouped.set(rimStr, { ...grouped.get(rimStr), seal_img: s.seal_url });
    }
  }

  // Fallback to parse other older tables or inline descriptions mapped in localStorage card copies
  try {
    const storedCards = localStorage.getItem('pneu_center_rim_cards_v1');
    if (storedCards) {
      const parsed = JSON.parse(storedCards);
      for (const card of parsed) {
        const rimStr = card.rim?.toString();
        if (rimStr && card.description) {
          const sealUrl = extractTag(card.description, 'INMETRO_SEAL');
          const mediaUrl = extractTag(card.description, 'DEFAULT_MEDIA');
          if (sealUrl || mediaUrl) {
            const currentObj = grouped.get(rimStr) || {};
            if (sealUrl && !currentObj.seal_img) currentObj.seal_img = sealUrl;
            if (mediaUrl && !currentObj.default_img) currentObj.default_img = mediaUrl;
            grouped.set(rimStr, currentObj);
          }
        }
      }
    }
  } catch (_) {}

  // Push to Supabase rim_media_settings table
  for (const [rimStr, value] of grouped.entries()) {
    try {
      const { data, error } = await supabase
        .from('rim_media_settings')
        .select('*')
        .eq('rim', rimStr);

      if (!error && data && data.length > 0) {
        const payload: any = { updated_at: new Date().toISOString() };
        if (value.default_img) payload.default_image_url = value.default_img;
        if (value.seal_img) payload.inmetro_label_url = value.seal_img;
        
        const { error: errUp } = await supabase
          .from('rim_media_settings')
          .update(payload)
          .eq('rim', rimStr);
        if (errUp) throw errUp;
      } else {
        const { error: errIn } = await supabase
          .from('rim_media_settings')
          .insert({
            rim: rimStr,
            default_image_url: value.default_img || null,
            inmetro_label_url: value.seal_img || null,
            default_image_type: 'image'
          });
        if (errIn) throw errIn;
      }
      migratedCount++;
    } catch (err) {
      console.error(`Migration error for rim ${rimStr}:`, err);
      errorsCount++;
    }
  }

  // Delete legacy local storage blocks after migrating successfully
  localStorage.removeItem(RIM_DEFAULT_MEDIA_KEY);
  localStorage.removeItem(RIM_INMETRO_SEALS_KEY);

  await fetchRimMediaSettingsDb();
  return { migratedCount, errorsCount };
}

/**
 * Resolves the primary image to display for a tire, including dynamic fallback to the rim-default media.
 */
export function resolveProductImage(product: { image?: string; rim?: number } | undefined | null): string {
  if (!product) {
    return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600';
  }
  if (product.image && product.image.trim() !== '') {
    return product.image;
  }
  try {
    const defaults = getRimDefaultMedia();
    const match = defaults.find(m => m.rim === Number(product.rim));
    if (match && match.image_url && match.image_url.trim() !== '') {
      return match.image_url;
    }
  } catch (err) {
    console.warn('Failed to resolve custom brand media:', err);
  }
  return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600';
}
