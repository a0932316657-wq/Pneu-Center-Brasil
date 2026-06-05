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
}

export type AppRoute =
  | 'home'
  | 'catalogo'
  | 'produto'
  | 'marcas'
  | 'como-funciona'
  | 'sobre'
  | 'contato'
  | 'politica-privacidade'
  | 'termos-uso'
  | 'politica-entrega'
  | 'politica-trocas'
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
