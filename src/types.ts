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
  | 'paineladmin';

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
