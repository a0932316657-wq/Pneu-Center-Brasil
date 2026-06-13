import { Product, PresellSettings, PresellRimCard, PresellBrandCard } from '../types';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../data';
import { supabase, isSupabaseUrlAbsent, isSupabaseKeyAbsent } from './supabaseClient';

export interface SiteSettings {
  id?: string | number;
  mobile_fixed_button?: boolean;
  active?: boolean;
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

  // Exact Supabase field names for full confidence
  about_commercial_name?: string;
  about_legal_name?: string;
  about_cnpj?: string;
  about_address?: string;
  about_text?: string;
  about_media_url?: string;
  about_media_type?: string;
  about_media_alt?: string;

  hero_media_url?: string;
  hero_media_type?: string;
  hero_border_color?: string;
  hero_glow_color?: string;
  hero_border_radius?: string;
  hero_glow_intensity?: string;

  extra_banner_url?: string;
  extra_banner_type?: string;
  extra_banner_alt?: string;

  presell_hero_title?: string;
  presell_hero_subtitle?: string;
  presell_button_text?: string;
  presell_whatsapp_message?: string;
  presell_hero_media_url?: string;
  presell_hero_media_type?: string;
  presell_background_image_url?: string;
  presell_notice_text?: string;
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
  subtitle?: string;
  button_text?: string;
  whatsapp_message?: string;
  sort_order?: number;
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
  featuredMediaAlt: 'Destaque Especial Pneu Center Brasil',

  // Extra extended defaults
  about_commercial_name: 'Pneu Center Brasil',
  about_legal_name: 'CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA',
  about_cnpj: '20.085.983/0001-13',
  about_address: 'Av. Professor Francisco Morato, 2001, Butantã, São Paulo/SP, CEP 05513-200',
  about_text: 'A Pneu Center Brasil é especialista independente no comércio e distribuição de pneus de alta performance. Atuando com seriedade, transparência e agilidade logística, nossa equipe comercial auxilia cada cliente na escolha ideal para o modelo de seu veículo conversando diretamente pelo WhatsApp.',
  about_media_url: '',
  about_media_type: 'image',
  about_media_alt: 'Pneu Center Brasil • Distribuição Digital',

  hero_media_url: '',
  hero_media_type: 'image',
  hero_border_color: '#f97316',
  hero_glow_color: '#f97316',
  hero_border_radius: '24',
  hero_glow_intensity: '0.4',

  extra_banner_url: '',
  extra_banner_type: 'image',
  extra_banner_alt: 'Destaque Especial Pneu Center Brasil',

  presell_hero_title: 'CONSULTAR PREÇO AGORA NO COMPRE DIRETO',
  presell_hero_subtitle: 'Fale com nossos especialistas por WhatsApp e garanta a melhor oferta em pneus para seu veículo.',
  presell_button_text: 'FALAR COM ESPECIALISTA',
  presell_whatsapp_message: 'Olá, gostaria de consultar pneus para meu carro.',
  presell_hero_media_url: '',
  presell_hero_media_type: 'image',
  presell_background_image_url: '',
  presell_notice_text: '⚠️ ATENÇÃO: Preços promocionais válidos por tempo limitado ou enquanto durarem os estoques de campanha.'
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

export function mapProductFromRow(row: any): Product {
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
    slug: row.slug || '',
    original_price: (row.original_price != null && row.original_price !== '') ? Number(row.original_price) : (priceNum > 0 ? priceNum : undefined)
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
    slug: p.slug || '',
    original_price: p.original_price
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
    mediaType: row.media_type || row.mediaType || 'image',
    subtitle: row.subtitle || '',
    button_text: row.button_text || '',
    whatsapp_message: row.whatsapp_message || '',
    sort_order: row.sort_order !== undefined ? Number(row.sort_order) : undefined
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
        case 'about_commercial_name':
        case 'aboutCommercialName':
          resultSettings.about_commercial_name = val;
          break;
        case 'about_legal_name':
        case 'aboutLegalName':
          resultSettings.about_legal_name = val;
          break;
        case 'about_cnpj':
        case 'aboutCnpj':
          resultSettings.about_cnpj = val;
          break;
        case 'about_address':
        case 'aboutAddress':
          resultSettings.about_address = val;
          break;
        case 'about_text':
        case 'aboutText':
          resultSettings.about_text = val;
          break;
        case 'about_media_url':
        case 'aboutMediaUrl':
          resultSettings.about_media_url = val;
          break;
        case 'about_media_type':
        case 'aboutMediaType':
          resultSettings.about_media_type = val;
          break;
        case 'about_media_alt':
        case 'aboutMediaAlt':
          resultSettings.about_media_alt = val;
          break;
        case 'hero_media_url':
        case 'heroMediaUrl':
          resultSettings.hero_media_url = val;
          break;
        case 'hero_media_type':
        case 'heroMediaType':
          resultSettings.hero_media_type = val;
          break;
        case 'hero_border_color':
        case 'heroBorderColor':
          resultSettings.hero_border_color = val;
          break;
        case 'hero_glow_color':
        case 'heroGlowColor':
          resultSettings.hero_glow_color = val;
          break;
        case 'hero_border_radius':
        case 'heroBorderRadius':
          resultSettings.hero_border_radius = val;
          break;
        case 'hero_glow_intensity':
        case 'heroGlowIntensity':
          resultSettings.hero_glow_intensity = val;
          break;
        case 'extra_banner_url':
        case 'extraBannerUrl':
          resultSettings.extra_banner_url = val;
          break;
        case 'extra_banner_type':
        case 'extraBannerType':
          resultSettings.extra_banner_type = val;
          break;
        case 'extra_banner_alt':
        case 'extraBannerAlt':
          resultSettings.extra_banner_alt = val;
          break;
        case 'presell_hero_title':
        case 'presellHeroTitle':
          resultSettings.presell_hero_title = val;
          break;
        case 'presell_hero_subtitle':
        case 'presellHeroSubtitle':
          resultSettings.presell_hero_subtitle = val;
          break;
        case 'presell_button_text':
        case 'presellButtonText':
          resultSettings.presell_button_text = val;
          break;
        case 'presell_whatsapp_message':
        case 'presellWhatsappMessage':
          resultSettings.presell_whatsapp_message = val;
          break;
        case 'presell_hero_media_url':
        case 'presellHeroMediaUrl':
          resultSettings.presell_hero_media_url = val;
          break;
        case 'presell_hero_media_type':
        case 'presellHeroMediaType':
          resultSettings.presell_hero_media_type = val;
          break;
        case 'presell_background_image_url':
        case 'presellBackgroundImageUrl':
          resultSettings.presell_background_image_url = val;
          break;
        case 'presell_notice_text':
        case 'presellNoticeText':
          resultSettings.presell_notice_text = val;
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

    // Extended database settings columns mapping with fallbacks to avoid blank configurations
    resultSettings.about_commercial_name = row.about_commercial_name || row.aboutCommercialName || resultSettings.about_commercial_name || row.commercial_name || row.commercialName || resultSettings.commercialName;
    resultSettings.about_legal_name = row.about_legal_name || row.aboutLegalName || resultSettings.about_legal_name || row.corporate_name || row.corporateName || resultSettings.corporateName;
    resultSettings.about_cnpj = row.about_cnpj || row.aboutCnpj || resultSettings.about_cnpj || row.cnpj || resultSettings.cnpj;
    resultSettings.about_address = row.about_address || row.aboutAddress || resultSettings.about_address || row.address || resultSettings.address;
    resultSettings.about_text = row.about_text || row.aboutText || resultSettings.about_text || row.institutional_text || row.institutionalText || resultSettings.institutionalText;
    resultSettings.about_media_url = row.about_media_url || row.aboutMediaUrl || resultSettings.about_media_url || row.institutional_media_url || row.institutionalMediaUrl || resultSettings.institutionalMediaUrl;
    resultSettings.about_media_type = row.about_media_type || row.aboutMediaType || resultSettings.about_media_type || row.institutional_media_type || row.institutionalMediaType || resultSettings.institutionalMediaType;
    resultSettings.about_media_alt = row.about_media_alt || row.aboutMediaAlt || resultSettings.about_media_alt || row.institutional_media_alt || row.institutionalMediaAlt || resultSettings.institutionalMediaAlt;

    resultSettings.hero_media_url = row.hero_media_url || row.heroMediaUrl || resultSettings.hero_media_url || row.hero_image_url || row.heroImageUrl || resultSettings.heroImageUrl;
    resultSettings.hero_media_type = row.hero_media_type || row.heroMediaType || resultSettings.hero_media_type || row.heroMediaType || resultSettings.heroMediaType;
    resultSettings.hero_border_color = row.hero_border_color || row.heroBorderColor || resultSettings.hero_border_color || resultSettings.heroBorderColor;
    resultSettings.hero_glow_color = row.hero_glow_color || row.heroGlowColor || resultSettings.hero_glow_color || resultSettings.heroGlowColor;
    resultSettings.hero_border_radius = row.hero_border_radius || row.heroBorderRadius || resultSettings.hero_border_radius || resultSettings.heroBorderRadius;
    resultSettings.hero_glow_intensity = row.hero_glow_intensity || row.heroGlowIntensity || resultSettings.hero_glow_intensity || resultSettings.heroGlowIntensity;

    resultSettings.extra_banner_url = row.extra_banner_url || row.extraBannerUrl || resultSettings.extra_banner_url || row.featured_media_url || row.featuredMediaUrl || resultSettings.featuredMediaUrl;
    resultSettings.extra_banner_type = row.extra_banner_type || row.extraBannerType || resultSettings.extra_banner_type || row.featured_media_type || row.featuredMediaType || resultSettings.featuredMediaType;
    resultSettings.extra_banner_alt = row.extra_banner_alt || row.extraBannerAlt || resultSettings.extra_banner_alt || row.featured_media_alt || row.featuredMediaAlt || resultSettings.featuredMediaAlt;

    resultSettings.presell_hero_title = row.presell_hero_title || row.presellHeroTitle || resultSettings.presell_hero_title;
    resultSettings.presell_hero_subtitle = row.presell_hero_subtitle || row.presellHeroSubtitle || resultSettings.presell_hero_subtitle;
    resultSettings.presell_button_text = row.presell_button_text || row.presellButtonText || resultSettings.presell_button_text;
    resultSettings.presell_whatsapp_message = row.presell_whatsapp_message || row.presellWhatsappMessage || resultSettings.presell_whatsapp_message;
    resultSettings.presell_hero_media_url = row.presell_hero_media_url || row.presellHeroMediaUrl || resultSettings.presell_hero_media_url;
    resultSettings.presell_hero_media_type = row.presell_hero_media_type || row.presellHeroMediaType || resultSettings.presell_hero_media_type;
    resultSettings.presell_background_image_url = row.presell_background_image_url || row.presellBackgroundImageUrl || resultSettings.presell_background_image_url;
    resultSettings.presell_notice_text = row.presell_notice_text || row.presellNoticeText || resultSettings.presell_notice_text;

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

  // Enforce bidirectionality and legacy structures match the modern custom keys
  resultSettings.commercialName = resultSettings.about_commercial_name || resultSettings.commercialName;
  resultSettings.corporateName = resultSettings.about_legal_name || resultSettings.corporateName;
  resultSettings.cnpj = resultSettings.about_cnpj || resultSettings.cnpj;
  resultSettings.address = resultSettings.about_address || resultSettings.address;
  resultSettings.institutionalText = resultSettings.about_text || resultSettings.institutionalText;
  resultSettings.institutionalMediaUrl = resultSettings.about_media_url || resultSettings.institutionalMediaUrl;
  resultSettings.institutionalMediaType = (resultSettings.about_media_type as any) || resultSettings.institutionalMediaType;
  resultSettings.institutionalMediaAlt = resultSettings.about_media_alt || resultSettings.institutionalMediaAlt;

  resultSettings.heroImageUrl = resultSettings.hero_media_url || resultSettings.heroImageUrl;
  resultSettings.heroMediaType = (resultSettings.hero_media_type as any) || resultSettings.heroMediaType;
  resultSettings.heroBorderColor = resultSettings.hero_border_color || resultSettings.heroBorderColor;
  resultSettings.heroGlowColor = resultSettings.hero_glow_color || resultSettings.heroGlowColor;
  resultSettings.heroBorderRadius = resultSettings.hero_border_radius || resultSettings.heroBorderRadius;
  resultSettings.heroGlowIntensity = resultSettings.hero_glow_intensity || resultSettings.heroGlowIntensity;

  resultSettings.featuredMediaUrl = resultSettings.extra_banner_url || resultSettings.featuredMediaUrl;
  resultSettings.featuredMediaType = (resultSettings.extra_banner_type as any) || resultSettings.featuredMediaType;
  resultSettings.featuredMediaAlt = resultSettings.extra_banner_alt || resultSettings.featuredMediaAlt;

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
    const stored = localStorage.getItem(BRANDS_STORE_KEY);
    if (stored !== null) {
      return JSON.parse(stored) as Brand[];
    }
    
    // First run initialization: save defaults so they can be managed
    saveBrands(DEFAULT_BRANDS);
    return DEFAULT_BRANDS;
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

// Presell storage keys
const PRESELL_SETTINGS_KEY = 'pneu_center_presell_settings';
const PRESELL_RIM_CARDS_KEY = 'pneu_center_presell_rim_cards';
const PRESELL_BRAND_CARDS_KEY = 'pneu_center_presell_brand_cards';

// Default initial configurations for the campaign presell
export const DEFAULT_PRESELL_SETTINGS: PresellSettings = {
  hero_title: 'Encontre pneus para o seu carro',
  hero_subtitle: 'Escolha o aro desejado e fale com nosso atendimento para consultar opções, disponibilidade, preço de referência, entrega e condições comerciais.',
  hero_button_text: 'Consultar Pneus no WhatsApp',
  hero_whatsapp_message: 'Olá, gostaria de consultar pneus para meu carro.',
  hero_media_url: '',
  hero_media_type: 'image',
  background_image_url: '',
  notice_text: 'Catálogo informativo online. A confirmação de disponibilidade, preço, entrega e pagamento ocorre pelo atendimento oficial no WhatsApp.',
  mobile_fixed_button: true,
  active: true
};

export const DEFAULT_PRESELL_RIM_CARDS: PresellRimCard[] = [
  {
    id: 'rc-13',
    title: 'Pneus Aro 13',
    rim: '13',
    subtitle: 'Consulte opções para aro 13',
    image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop',
    button_text: 'Consultar Aro 13',
    whatsapp_message: 'Olá, gostaria de conferir o catálogo de pneus aro 13.',
    active: true,
    sort_order: 1
  },
  {
    id: 'rc-14',
    title: 'Pneus Aro 14',
    rim: '14',
    subtitle: 'Consulte opções para aro 14',
    image_url: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?q=80&w=600&auto=format&fit=crop',
    button_text: 'Consultar Aro 14',
    whatsapp_message: 'Olá, gostaria de conferir o catálogo de pneus aro 14.',
    active: true,
    sort_order: 2
  },
  {
    id: 'rc-15',
    title: 'Pneus Aro 15',
    rim: '15',
    subtitle: 'Consulte opções para aro 15',
    image_url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=600&auto=format&fit=crop',
    button_text: 'Consultar Aro 15',
    whatsapp_message: 'Olá, gostaria de conferir o catálogo de pneus aro 15.',
    active: true,
    sort_order: 3
  },
  {
    id: 'rc-16',
    title: 'Pneus Aro 16',
    rim: '16',
    subtitle: 'Consulte opções para aro 16',
    image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d0a269e?q=80&w=600&auto=format&fit=crop',
    button_text: 'Consultar Aro 16',
    whatsapp_message: 'Olá, gostaria de conferir o catálogo de pneus aro 16.',
    active: true,
    sort_order: 4
  },
  {
    id: 'rc-17',
    title: 'Pneus Aro 17',
    rim: '17',
    subtitle: 'Consulte opções para aro 17',
    image_url: 'https://images.unsplash.com/photo-1615887023516-9b6bcd559e87?q=80&w=600&auto=format&fit=crop',
    button_text: 'Consultar Aro 17',
    whatsapp_message: 'Olá, gostaria de conferir o catálogo de pneus aro 17.',
    active: true,
    sort_order: 5
  },
  {
    id: 'rc-18',
    title: 'Pneus Aro 18',
    rim: '18',
    subtitle: 'Consulte opções para aro 18',
    image_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=600&auto=format&fit=crop',
    button_text: 'Consultar Aro 18',
    whatsapp_message: 'Olá, gostaria de conferir o catálogo de pneus aro 18.',
    active: true,
    sort_order: 6
  }
];

export const DEFAULT_PRESELL_BRAND_CARDS: PresellBrandCard[] = [
  { id: 'bc-1', brand_name: 'Pirelli', logo_url: 'https://pneucenterbrasil.com.br/logos/pirelli.png', whatsapp_message: 'Olá, gostaria de consultar pneus da marca Pirelli.', active: true, sort_order: 1 },
  { id: 'bc-2', brand_name: 'Michelin', logo_url: 'https://pneucenterbrasil.com.br/logos/michelin.png', whatsapp_message: 'Olá, gostaria de consultar pneus da marca Michelin.', active: true, sort_order: 2 },
  { id: 'bc-3', brand_name: 'Goodyear', logo_url: 'https://pneucenterbrasil.com.br/logos/goodyear.png', whatsapp_message: 'Olá, gostaria de consultar pneus da marca Goodyear.', active: true, sort_order: 3 },
  { id: 'bc-4', brand_name: 'Bridgestone', logo_url: '', whatsapp_message: 'Olá, gostaria de consultar pneus da marca Bridgestone.', active: true, sort_order: 4 },
  { id: 'bc-5', brand_name: 'Continental', logo_url: '', whatsapp_message: 'Olá, gostaria de consultar pneus da marca Continental.', active: true, sort_order: 5 },
  { id: 'bc-6', brand_name: 'Dunlop', logo_url: '', whatsapp_message: 'Olá, gostaria de consultar pneus da marca Dunlop.', active: true, sort_order: 6 },
  { id: 'bc-7', brand_name: 'Firestone', logo_url: '', whatsapp_message: 'Olá, gostaria de consultar pneus da marca Firestone.', active: true, sort_order: 7 },
  { id: 'bc-8', brand_name: 'Hankook', logo_url: '', whatsapp_message: 'Olá, gostaria de consultar pneus da marca Hankook.', active: true, sort_order: 8 }
];

let presellSettingsCache: PresellSettings = DEFAULT_PRESELL_SETTINGS;
let presellRimCardsCache: PresellRimCard[] = DEFAULT_PRESELL_RIM_CARDS;
let presellBrandCardsCache: PresellBrandCard[] = DEFAULT_PRESELL_BRAND_CARDS;

export function getPresellSettings(): PresellSettings {
  if (typeof window === 'undefined') return DEFAULT_PRESELL_SETTINGS;
  try {
    const stored = localStorage.getItem(PRESELL_SETTINGS_KEY);
    return stored ? JSON.parse(stored) : (presellSettingsCache || DEFAULT_PRESELL_SETTINGS);
  } catch (err) {
    console.error('Error getting presell settings', err);
    return presellSettingsCache || DEFAULT_PRESELL_SETTINGS;
  }
}

export function savePresellSettingsLocal(settings: PresellSettings): void {
  presellSettingsCache = settings;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRESELL_SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('pneu_center_presell_settings_updated'));
  } catch (err) {
    console.error('Error saving presell settings', err);
  }
}

export async function savePresellSettingsDb(settings: PresellSettings): Promise<PresellSettings | null> {
  savePresellSettingsLocal(settings);

  const isSupabaseConnected = !isSupabaseUrlAbsent && !isSupabaseKeyAbsent;
  if (!isSupabaseConnected) return settings;

  try {
    const { data: rows, error: selectErr } = await supabase.from('presell_settings').select('*');
    if (selectErr) throw selectErr;

    const cols = rows && rows.length > 0 ? Object.keys(rows[0]) : [];

    const payload: any = {
      id: 1,
      hero_title: settings.hero_title,
      hero_subtitle: settings.hero_subtitle,
      button_text: settings.hero_button_text,
      whatsapp_message: settings.hero_whatsapp_message,
      hero_media_url: settings.hero_media_url || null,
      hero_media_type: settings.hero_media_type || 'image',
      background_image_url: settings.background_image_url || null,
      notice_text: settings.notice_text || null,
      updated_at: new Date().toISOString()
    };

    if (cols.includes('active') || cols.length === 0) {
      payload.active = settings.active !== false;
    }
    if (cols.includes('mobile_fixed_button')) {
      payload.mobile_fixed_button = settings.mobile_fixed_button !== false;
    }

    const { error: upsertErr } = await supabase
      .from('presell_settings')
      .upsert(payload, { onConflict: 'id' });

    if (upsertErr) throw upsertErr;

    // Depois de salvar, buscar novamente singularmente
    const { data: freshRow, error: refreshErr } = await supabase
      .from('presell_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (refreshErr) throw refreshErr;
    if (freshRow) {
      const mapped = {
        id: freshRow.id?.toString() || '1',
        hero_title: freshRow.hero_title || '',
        hero_subtitle: freshRow.hero_subtitle || '',
        hero_button_text: freshRow.button_text || freshRow.hero_button_text || '',
        hero_whatsapp_message: freshRow.whatsapp_message || freshRow.hero_whatsapp_message || '',
        hero_media_url: freshRow.hero_media_url || '',
        hero_media_type: freshRow.hero_media_type || 'image',
        background_image_url: freshRow.background_image_url || '',
        notice_text: freshRow.notice_text || '',
        mobile_fixed_button: freshRow.mobile_fixed_button !== false,
        active: freshRow.active !== false
      };
      savePresellSettingsLocal(mapped);
    }
  } catch (err: any) {
    console.error('Supabase savePresellSettings failed:', err);
    throw new Error(`Erro no salvamento no Supabase: ${err.message || err}`);
  }
  return settings;
}

export function getPresellRimCards(): PresellRimCard[] {
  if (typeof window === 'undefined') return DEFAULT_PRESELL_RIM_CARDS;
  try {
    const stored = localStorage.getItem(PRESELL_RIM_CARDS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return presellRimCardsCache.length > 0 ? presellRimCardsCache : DEFAULT_PRESELL_RIM_CARDS;
}

export function savePresellRimCardsLocal(cards: PresellRimCard[]): void {
  presellRimCardsCache = cards;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRESELL_RIM_CARDS_KEY, JSON.stringify(cards));
    window.dispatchEvent(new Event('pneu_center_presell_rim_cards_updated'));
  } catch (err) {
    console.error('Error saving presell rim cards', err);
  }
}

export async function savePresellRimCardDb(card: PresellRimCard): Promise<PresellRimCard> {
  const isSupabaseConnected = !isSupabaseUrlAbsent && !isSupabaseKeyAbsent;
  let resultRow: any = null;

  const payload: any = {
    title: card.title,
    rim: card.rim || '15',
    image_url: card.image_url || null,
    subtitle: card.subtitle || '',
    button_text: card.button_text || 'FALAR COM ESPECIALISTA',
    whatsapp_message: card.whatsapp_message || '',
    active: card.active !== false,
    sort_order: Number(card.sort_order) || 0,
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConnected) {
    const isIdReal = card.id && (card.id.length === 36 || (!card.id.startsWith('rc-') && isNaN(Number(card.id)) === false));
    const numericId = isIdReal && !isNaN(Number(card.id)) ? Number(card.id) : null;
    const dbId = numericId !== null ? numericId : card.id;

    if (isIdReal) {
      const { data, error } = await supabase
        .from('presell_rim_cards')
        .update(payload)
        .eq('id', dbId)
        .select();
      if (!error && data && data.length > 0) {
        resultRow = data[0];
      } else if (error) {
        console.error('Error updating rim card in presell flow:', error);
        throw error;
      }
    } else {
      const { data, error } = await supabase
        .from('presell_rim_cards')
        .upsert(payload, { onConflict: 'rim' })
        .select();
      if (!error && data && data.length > 0) {
        resultRow = data[0];
      } else if (error) {
        console.error('Error upserting rim card by rim in presell flow:', error);
        throw error;
      }
    }
  }

  const mappedResult: PresellRimCard = {
    id: resultRow?.id?.toString() || card.id,
    title: resultRow?.title || card.title,
    rim: resultRow?.rim?.toString() || card.rim,
    subtitle: resultRow?.subtitle || card.subtitle,
    image_url: resultRow?.image_url || card.image_url,
    button_text: resultRow?.button_text || card.button_text,
    whatsapp_message: resultRow?.whatsapp_message || card.whatsapp_message,
    active: resultRow?.active !== false,
    sort_order: resultRow?.sort_order !== undefined ? Number(resultRow.sort_order) : card.sort_order
  };

  if (isSupabaseConnected) {
    const { data: allRows } = await supabase
      .from('presell_rim_cards')
      .select('*')
      .order('sort_order', { ascending: true });
    if (allRows && allRows.length > 0) {
      const mappedList: PresellRimCard[] = allRows.map((row: any) => ({
        id: row.id?.toString(),
        title: row.title || `Aro ${row.rim}`,
        rim: row.rim?.toString() || '15',
        subtitle: row.subtitle || row.description || '',
        image_url: row.image_url || '',
        button_text: row.button_text || 'FALAR COM ESPECIALISTA',
        whatsapp_message: row.whatsapp_message || `Olá, gostaria de consultar pneus Aro ${row.rim}.`,
        active: row.active !== false,
        sort_order: row.sort_order !== undefined ? Number(row.sort_order) : 0
      }));
      savePresellRimCardsLocal(mappedList);
      
      const updatedMatch = mappedList.find(rc => rc.rim === mappedResult.rim);
      if (updatedMatch) {
        return updatedMatch;
      }
    }
  }

  const otherRims = presellRimCardsCache.filter(rc => rc.id !== mappedResult.id && rc.rim !== mappedResult.rim);
  const updatedRims = [...otherRims, mappedResult].sort((a, b) => a.sort_order - b.sort_order);
  savePresellRimCardsLocal(updatedRims);

  return mappedResult;
}

export async function deletePresellRimCardDb(id: string): Promise<void> {
  const isSupabaseConnected = !isSupabaseUrlAbsent && !isSupabaseKeyAbsent;
  
  const currentRims = getPresellRimCards().filter(rc => rc.id !== id);
  savePresellRimCardsLocal(currentRims);

  if (isSupabaseConnected && id && id.length === 36 && !id.startsWith('rc-')) {
    try {
      await supabase.from('presell_rim_cards').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete presell_rim_cards failed:', err);
    }
  }
}

export function getPresellBrandCards(): PresellBrandCard[] {
  if (typeof window === 'undefined') return DEFAULT_PRESELL_BRAND_CARDS;
  try {
    const stored = localStorage.getItem(PRESELL_BRAND_CARDS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return presellBrandCardsCache.length > 0 ? presellBrandCardsCache : DEFAULT_PRESELL_BRAND_CARDS;
}

export function savePresellBrandCardsLocal(cards: PresellBrandCard[]): void {
  presellBrandCardsCache = cards;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRESELL_BRAND_CARDS_KEY, JSON.stringify(cards));
    window.dispatchEvent(new Event('pneu_center_presell_brand_cards_updated'));
  } catch (err) {
    console.error('Error saving presell brand cards', err);
  }
}

export async function savePresellBrandCardDb(card: PresellBrandCard): Promise<PresellBrandCard> {
  const isSupabaseConnected = !isSupabaseUrlAbsent && !isSupabaseKeyAbsent;
  let resultRow: any = null;

  const payload: any = {
    brand_name: card.brand_name,
    logo_url: card.logo_url || null,
    whatsapp_message: card.whatsapp_message || '',
    active: card.active !== false,
    sort_order: Number(card.sort_order) || 0
  };

  if (isSupabaseConnected) {
    const isIdReal = card.id && (card.id.length === 36 || !card.id.startsWith('bc-') || !isNaN(Number(card.id)));
    const numericId = isIdReal && !isNaN(Number(card.id)) ? Number(card.id) : null;
    const dbId = numericId !== null ? numericId : card.id;

    if (isIdReal) {
      const { data, error } = await supabase
        .from('presell_brand_cards')
        .update(payload)
        .eq('id', dbId)
        .select();
      if (!error && data && data.length > 0) {
        resultRow = data[0];
      } else if (error) {
        console.error('Error updating pre-sell brand in presell flow:', error);
        throw error;
      }
    }

    if (!resultRow) {
      const { data, error } = await supabase
        .from('presell_brand_cards')
        .insert([payload])
        .select();
      if (error) {
        console.error('Error inserting brand to presell_brand_cards:', error);
        throw error;
      }
      resultRow = data?.[0];
    }
  }

  const mappedResult: PresellBrandCard = {
    id: resultRow?.id?.toString() || card.id,
    brand_name: resultRow?.brand_name || card.brand_name,
    logo_url: resultRow?.logo_url || card.logo_url,
    whatsapp_message: resultRow?.whatsapp_message || card.whatsapp_message,
    active: resultRow?.active !== false,
    sort_order: resultRow?.sort_order !== undefined ? Number(resultRow.sort_order) : card.sort_order
  };

  const otherBrands = presellBrandCardsCache.filter(b => b.id !== mappedResult.id);
  const updatedBrands = [...otherBrands, mappedResult].sort((a, b) => a.sort_order - b.sort_order);
  savePresellBrandCardsLocal(updatedBrands);

  return mappedResult;
}

export async function deletePresellBrandCardDb(id: string): Promise<void> {
  const isSupabaseConnected = !isSupabaseUrlAbsent && !isSupabaseKeyAbsent;
  
  const currentBrands = getPresellBrandCards().filter(b => b.id !== id);
  savePresellBrandCardsLocal(currentBrands);

  if (isSupabaseConnected && id && id.length === 36 && !id.startsWith('bc-')) {
    try {
      await supabase.from('presell_brand_cards').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete presell_brand_cards failed:', err);
    }
  }
}

let isSupabaseSynced = false;

export function isSyncedWithSupabase(): boolean {
  return isSupabaseSynced;
}

export async function fetchAllProducts(): Promise<{ data: any[] | null; error: any }> {
  try {
    const allProducts: any[] = [];
    let from = 0;
    const limit = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .range(from, from + limit - 1);

      if (error) {
        return { data: null, error };
      }

      if (data && data.length > 0) {
        allProducts.push(...data);
        if (data.length < limit) {
          hasMore = false;
        } else {
          from += limit;
        }
      } else {
        hasMore = false;
      }
    }
    return { data: allProducts, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * ------------------------------------------------------------------------
 * ASYNCHRONOUS CLOUD SYNCHRONIZER (BACKGROUND OR EXPLICIT PULLS)
 * ------------------------------------------------------------------------
 */

export async function syncFromSupabase(): Promise<void> {
  try {
    // Execute all table fetches in parallel to reduce load time from multiple sequential roundtrips to 1 concurrent batch
    const [
      settingsResult,
      productsResult,
      brandsResult,
      rimsResult,
      rimMediaResult,
      presellSettingsResult,
      presellRimsResult,
      presellBrandsResult
    ] = await Promise.all([
      supabase.from('site_settings').select('*'),
      fetchAllProducts(),
      supabase.from('brands').select('*'),
      supabase.from('rim_cards').select('*'),
      supabase.from('rim_media_settings').select('*'),
      supabase.from('presell_settings').select('*'),
      supabase.from('presell_rim_cards').select('*').order('sort_order', { ascending: true }),
      supabase.from('presell_brand_cards').select('*').order('sort_order', { ascending: true })
    ]);

    const { data: settingsData, error: settingsError } = settingsResult;
    const { data: prodData, error: prodError } = productsResult;
    const { data: brandData, error: brandError } = brandsResult;
    const { data: rimData, error: rimError } = rimsResult;
    const { data: rimMediaData, error: rimMediaError } = rimMediaResult;
    const { data: pSettingsData, error: pSettingsError } = presellSettingsResult;
    const { data: pRimsData, error: pRimsError } = presellRimsResult;
    const { data: pBrandsData, error: pBrandsError } = presellBrandsResult;

    // 1. Process site_settings
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

      console.log("site_settings carregado:", settings);
      console.log("about_media_url:", settings.about_media_url);
      console.log("hero_media_url:", settings.hero_media_url);
      console.log("extra_banner_url:", settings.extra_banner_url);
    }

    // Process presell_settings
    if (!pSettingsError && pSettingsData && pSettingsData.length > 0) {
      const row = pSettingsData[0];
      const mappedPresellSettings: PresellSettings = {
        id: row.id?.toString(),
        hero_title: row.hero_title || '',
        hero_subtitle: row.hero_subtitle || '',
        hero_button_text: row.hero_button_text || row.button_text || '',
        hero_whatsapp_message: row.hero_whatsapp_message || row.whatsapp_message || '',
        hero_media_url: row.hero_media_url || '',
        hero_media_type: row.hero_media_type || 'image',
        background_image_url: row.background_image_url || '',
        notice_text: row.notice_text || '',
        mobile_fixed_button: row.mobile_fixed_button !== false,
        active: row.active !== false
      };
      savePresellSettingsLocal(mappedPresellSettings);
    }

    // 2. Process products
    if (!prodError && prodData) {
      const mappedProducts = prodData.map(mapProductFromRow);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(mappedProducts));
      window.dispatchEvent(new Event('pneu_center_products_updated'));
    }

    // 3. Process brands
    if (!brandError && brandData) {
      const mappedBrands = brandData.map(mapBrandFromRow);
      localStorage.setItem(BRANDS_STORE_KEY, JSON.stringify(mappedBrands));
      window.dispatchEvent(new Event('pneu_center_brands_updated'));
      console.log("brands carregadas:", mappedBrands);
    }

    // Process presell_brand_cards
    if (!pBrandsError && pBrandsData && pBrandsData.length > 0) {
      const mappedPresellBrands: PresellBrandCard[] = pBrandsData.map((row: any) => ({
        id: row.id?.toString(),
        brand_name: row.brand_name || '',
        logo_url: row.logo_url || '',
        whatsapp_message: row.whatsapp_message || `Olá, gostaria de consultar pneus da marca ${row.brand_name}.`,
        active: row.active !== false,
        sort_order: row.sort_order !== undefined ? Number(row.sort_order) : 0
      }));
      savePresellBrandCardsLocal(mappedPresellBrands);
    } else {
      // Fallback: If presell_brand_cards are empty, extract dynamic presell brands from active brands
      const storedBrands = getBrands().filter(b => b.active);
      const mappedPresellBrands = storedBrands.map((b, idx) => ({
        id: b.id,
        brand_name: b.name,
        logo_url: b.logo || '',
        whatsapp_message: `Olá, gostaria de consultar pneus da marca ${b.name}.`,
        active: b.active,
        sort_order: idx
      }));
      savePresellBrandCardsLocal(mappedPresellBrands);
    }

    // 4. Process rim_media_settings
    if (!rimMediaError && rimMediaData) {
      const mappedRimMedia: RimMediaSetting[] = rimMediaData.map((row: any) => ({
        id: row.id?.toString(),
        rim: row.rim?.toString() || '',
        default_image_url: row.default_image_url || null,
        inmetro_label_url: row.inmetro_label_url || null,
        default_image_type: row.default_image_type || 'image'
      }));
      saveRimMediaSettingsLocal(mappedRimMedia);
    }

    // 5. Process rim_cards (standard site rim cards)
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
      console.log("rim_cards carregados:", mappedRims);
    }

    // Process presell_rim_cards
    if (!pRimsError && pRimsData && pRimsData.length > 0) {
      const mappedPresellRims: PresellRimCard[] = pRimsData.map((row: any) => ({
        id: row.id?.toString(),
        title: row.title || `Aro ${row.rim}`,
        rim: row.rim?.toString() || '15',
        subtitle: row.subtitle || row.description || '',
        image_url: row.image_url || '',
        button_text: row.button_text || 'FALAR COM ESPECIALISTA',
        whatsapp_message: row.whatsapp_message || `Olá, gostaria de consultar pneus Aro ${row.rim}.`,
        active: row.active !== false,
        sort_order: row.sort_order !== undefined ? Number(row.sort_order) : 0
      }));
      savePresellRimCardsLocal(mappedPresellRims);
    } else {
      // Fallback: If presell_rim_cards are empty, extract dynamic presell rims from standard rim cards
      const mappedRims = getRimCards();
      const mappedPresellRims = mappedRims.map(rc => ({
        id: rc.id,
        title: rc.name,
        rim: rc.rim.toString(),
        subtitle: rc.subtitle || rc.description || '',
        image_url: rc.image || '',
        button_text: rc.button_text || 'FALAR COM ESPECIALISTA',
        whatsapp_message: rc.whatsapp_message || `Olá, gostaria de consultar pneus Aro ${rc.rim}.`,
        active: rc.active,
        sort_order: rc.sort_order ?? rc.rim
      })).sort((a, b) => a.sort_order - b.sort_order);
      savePresellRimCardsLocal(mappedPresellRims);
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
          'mounting', 'letter_color', 'groove_depth', 'inmetro_label_url', 'slug', 'original_price'
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
        { key: 'institutionalText', value: settings.institutionalText || '' },

        // Modern Custom Keys (About / Institutional)
        { key: 'about_commercial_name', value: settings.about_commercial_name || settings.commercialName },
        { key: 'about_legal_name', value: settings.about_legal_name || settings.corporateName },
        { key: 'about_cnpj', value: settings.about_cnpj || settings.cnpj },
        { key: 'about_address', value: settings.about_address || settings.address },
        { key: 'about_text', value: settings.about_text || settings.institutionalText },
        { key: 'about_media_url', value: settings.about_media_url || settings.institutionalMediaUrl },
        { key: 'about_media_type', value: settings.about_media_type || settings.institutionalMediaType },
        { key: 'about_media_alt', value: settings.about_media_alt || settings.institutionalMediaAlt },

        // Modern Custom Keys (Hero Card / Image)
        { key: 'hero_media_url', value: settings.hero_media_url || settings.heroImageUrl },
        { key: 'hero_media_type', value: settings.hero_media_type || settings.heroMediaType },
        { key: 'hero_border_color', value: settings.hero_border_color || settings.heroBorderColor },
        { key: 'hero_glow_color', value: settings.hero_glow_color || settings.heroGlowColor },
        { key: 'hero_border_radius', value: settings.hero_border_radius || settings.heroBorderRadius },
        { key: 'hero_glow_intensity', value: settings.hero_glow_intensity || settings.heroGlowIntensity },

        // Modern Custom Keys (Extra Banner / featured)
        { key: 'extra_banner_url', value: settings.extra_banner_url || settings.featuredMediaUrl },
        { key: 'extra_banner_type', value: settings.extra_banner_type || settings.featuredMediaType },
        { key: 'extra_banner_alt', value: settings.extra_banner_alt || settings.featuredMediaAlt },

        // Modern Custom Keys (Presell settings)
        { key: 'presell_hero_title', value: settings.presell_hero_title || '' },
        { key: 'presell_hero_subtitle', value: settings.presell_hero_subtitle || '' },
        { key: 'presell_button_text', value: settings.presell_button_text || '' },
        { key: 'presell_whatsapp_message', value: settings.presell_whatsapp_message || '' },
        { key: 'presell_hero_media_url', value: settings.presell_hero_media_url || '' },
        { key: 'presell_hero_media_type', value: settings.presell_hero_media_type || 'image' },
        { key: 'presell_background_image_url', value: settings.presell_background_image_url || '' },
        { key: 'presell_notice_text', value: settings.presell_notice_text || '' }
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
        const initialKeys = keys.map(k => ({ key: k.key, value: k.value }));
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

      // Modern Custom Keys (About / Institutional)
      setField('about_commercial_name', settings.about_commercial_name || settings.commercialName);
      setField('about_legal_name', settings.about_legal_name || settings.corporateName);
      setField('about_cnpj', settings.about_cnpj || settings.cnpj);
      setField('about_address', settings.about_address || settings.address);
      setField('about_text', settings.about_text || settings.institutionalText);
      setField('about_media_url', settings.about_media_url || settings.institutionalMediaUrl);
      setField('about_media_type', settings.about_media_type || settings.institutionalMediaType);
      setField('about_media_alt', settings.about_media_alt || settings.institutionalMediaAlt);

      // Hero Card
      setField('hero_media_url', settings.hero_media_url || settings.heroImageUrl);
      setField('hero_media_type', settings.hero_media_type || settings.heroMediaType);
      setField('hero_border_color', settings.hero_border_color || settings.heroBorderColor);
      setField('hero_glow_color', settings.hero_glow_color || settings.heroGlowColor);
      setField('hero_border_radius', settings.hero_border_radius || settings.heroBorderRadius);
      setField('hero_glow_intensity', settings.hero_glow_intensity || settings.heroGlowIntensity);

      // Extra Banner
      setField('extra_banner_url', settings.extra_banner_url || settings.featuredMediaUrl);
      setField('extra_banner_type', settings.extra_banner_type || settings.featuredMediaType);
      setField('extra_banner_alt', settings.extra_banner_alt || settings.featuredMediaAlt);

      // Presell Campaign
      setField('presell_hero_title', settings.presell_hero_title);
      setField('presell_hero_subtitle', settings.presell_hero_subtitle);
      setField('presell_button_text', settings.presell_button_text);
      setField('presell_whatsapp_message', settings.presell_whatsapp_message);
      setField('presell_hero_media_url', settings.presell_hero_media_url);
      setField('presell_hero_media_type', settings.presell_hero_media_type);
      setField('presell_background_image_url', settings.presell_background_image_url);
      setField('presell_notice_text', settings.presell_notice_text);

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

/**
 * Tests persistence on site_settings and verifies Supabase write capability
 */
export async function testSupabaseSave(): Promise<{ success: boolean; message: string }> {
  try {
    const isSupabaseConnected = !isSupabaseUrlAbsent && !isSupabaseKeyAbsent;
    if (!isSupabaseConnected) {
      return { success: false, message: 'Supabase não está conectado (ausente de URL ou chave).' };
    }
    const currentSettings = getSettings();
    await saveSettingsDb(currentSettings);
    return { success: true, message: 'Sucesso: Conexão ativa e gravação realizada com sucesso!' };
  } catch (err: any) {
    console.error('testSupabaseSave error:', err);
    return { success: false, message: `Erro de banco: ${err.message || JSON.stringify(err)}` };
  }
}

