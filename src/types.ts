export interface Product {
  id: string;
  name: string;
  brand: string;
  measure: string;
  rim: number;
  category: string; // "Carro de passeio" | "SUV e utilitário leve"
  application: string;
  specs: string[];
  status: string;
  image: string;
  shortDesc?: string;
  fullDesc?: string;
  price?: number;
  priceStatus?: 'exibir' | 'sob_consulta';
  gallery?: string[];
  featured?: boolean;
  active?: boolean;

  // Technical info fields
  technical_category?: string;
  terrain?: string;
  load_index?: string;
  load_capacity?: string;
  speed_index?: string;
  max_speed?: string;
  compatible_rims?: string;
  width_mm?: string;
  diameter_mm?: string;
  treadwear?: string;
  traction?: string;
  temperature?: string;
  runflat?: string;
  extra_load?: string;
  rim_protector?: string;
  ply_quantity?: string;
  mounting?: string;
  letter_color?: string;
  groove_depth?: string;
  inmetro_label_url?: string;
  slug?: string;
  original_price?: number;
}

export type AppRoute =
  | 'home'
  | 'catalogo'
  | 'produto'
  | 'marcas'
  | 'como-funciona'
  | 'sobre'
  | 'contato'
  | 'rastreamento'
  | 'politica-privacidade'
  | 'termos-uso'
  | 'politica-envio'
  | 'politica-entrega'
  | 'politica-trocas'
  | 'politica-garantia'
  | 'paineladmin'
  | 'presell';

export interface RouteState {
  path: AppRoute;
  productId?: string;
}

export interface ContactFormInput {
  name: string;
  phone: string;
  email: string;
  tireMeasure: string;
  message: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface PresellSettings {
  id?: string;
  hero_title: string;
  hero_subtitle: string;
  hero_button_text: string;
  hero_whatsapp_message: string;
  hero_media_url?: string;
  hero_media_type?: string; 
  background_image_url?: string;
  notice_text: string;
  mobile_fixed_button: boolean;
  active: boolean;
}

export interface PresellRimCard {
  id: string;
  title: string;
  rim?: string;
  subtitle?: string;
  image_url?: string;
  button_text?: string;
  whatsapp_message?: string;
  active: boolean;
  sort_order: number;
}

export interface PresellBrandCard {
  id: string;
  brand_name: string;
  logo_url?: string;
  whatsapp_message?: string;
  active: boolean;
  sort_order: number;
}
