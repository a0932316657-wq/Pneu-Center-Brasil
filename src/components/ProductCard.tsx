import React, { useState } from 'react';
import { Tag, HelpCircle, Eye, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { openWhatsAppChat, getProductMessage } from '../lib/whatsapp';
import BrandBadge from './BrandBadge';
import { slugify, resolveProductImage } from '../lib/appStore';

interface ProductCardProps {
  product: Product;
  onViewDetails: (productId: string) => void;
  key?: React.Key;
}

export default function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering onViewDetails
    const msg = getProductMessage(product.name, product.measure, product.price, product.priceStatus);
    openWhatsAppChat(msg);
  };

  const productSlug = product.slug || slugify(product.name) || product.id;

  return (
    <motion.div
      id={`product-card-${product.id}`}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-xs hover:shadow-md transition-shadow hover:border-slate-300"
    >
      {/* Product Image Panel */}
      <div 
        className="relative aspect-video w-full overflow-hidden bg-checkerboard border-b border-slate-100 cursor-pointer"
        onClick={() => onViewDetails(productSlug)}
      >
        {/* Animated tire wheel skeleton before load */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-150 animate-pulse flex items-center justify-center z-10">
            <div className="w-12 h-12 rounded-full border-4 border-dashed border-slate-300 animate-[spin_8s_linear_infinite]" />
          </div>
        )}

        <img
          src={resolveProductImage(product)}
          alt={`Pneu ${product.name}`}
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          className={`h-full w-full object-contain p-4 object-center transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        />
        {/* Brand Badge Overlay */}
        <BrandBadge brandName={product.brand} />
        
        {/* Category Overlay */}
        <div className="absolute bottom-3 left-3 rounded bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-medium text-white border border-slate-700">
          Aro {product.rim} • {product.category}
        </div>
      </div>

      {/* Card Details Body */}
      <div className="flex flex-1 flex-col p-5 bg-white">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[11px] font-bold text-orange-600 tracking-wide uppercase">
            Medida: {product.measure}
          </span>
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 font-mono">
            Aro {product.rim}
          </span>
        </div>

        <h3 
          className="font-sans text-base font-bold text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-1 cursor-pointer mb-1"
          onClick={() => onViewDetails(productSlug)}
        >
          {product.name}
        </h3>

        <p className="text-xs text-slate-500 leading-snug grow mb-3">
          Aplicação ideal para <strong className="text-slate-705 font-medium">{product.application}</strong>.
        </p>

        {/* Pricing Layout */}
        <div className="mb-1">
          {product.priceStatus === 'exibir' && product.price !== undefined ? (
            <div className="text-lg font-sans font-black text-slate-900">
              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          ) : (
            <div className="text-sm font-sans font-extrabold text-[#0B1B32] uppercase tracking-tight">
              Preço sob cotação
            </div>
          )}
        </div>

        {/* Dynamic Consultation Status & Warnings */}
        <div className="space-y-2 mb-4">
          <div className="rounded-lg px-3 py-1.5 border flex items-center gap-2 bg-[#EAFBF1] border-[#22C55E]">
            <div className="h-2.5 w-2.5 rounded-full bg-[#22C55E] animate-pulse"></div>
            <span className="font-sans text-[10px] font-black uppercase tracking-wider text-[#15803D]">
              Consultar disponibilidade
            </span>
          </div>
          <div className="text-[10px] text-slate-500 leading-normal font-sans space-y-1.5 mt-2 border-t border-slate-100 pt-2">
            <p className="font-semibold text-slate-700">• Preço e estoque sob cotação individual.</p>
            <p className="italic text-slate-500">• Imagem meramente ilustrativa. Confirme disponibilidade, medida, entrega e condições comerciais no atendimento.</p>
            <p className="border-t border-slate-100 pt-1.5 text-[9px] text-slate-400 font-medium leading-relaxed uppercase">
              • A Pneu Center Brasil atua como revendedora multimarcas independente. Marcas citadas pertencem aos seus respectivos fabricantes e são usadas apenas para identificação dos produtos.
            </p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2 mt-auto">
          <button
            id={`btn-details-${product.id}`}
            onClick={() => onViewDetails(productSlug)}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#0B1B32] hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 transition-all text-center uppercase tracking-wider font-sans cursor-pointer"
          >
            <Eye className="h-4 w-4 text-slate-300" />
            <span>Ver Detalhes</span>
            <ArrowRight className="h-3 w-3 text-slate-300 shrink-0 ml-1 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            id={`btn-whatsapp-${product.id}`}
            onClick={handleWhatsAppClick}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-green-600 text-green-700 hover:bg-green-50 font-bold text-[11px] px-3 py-2.5 active:scale-98 transition-all uppercase font-sans cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis"
          >
            <svg className="w-4 h-4 fill-green-700 shrink-0" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3 512l141.6-37.1c32.7 17.8 69.4 27.2 107.1 27.2 122.4 0 222-99.6 222-222 0-59.3-23-115.1-64.8-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-83.9 22 22.4-81.8-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
            <span className="truncate">Consultar no WhatsApp</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
