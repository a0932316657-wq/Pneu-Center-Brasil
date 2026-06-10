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
            <svg className="w-4 h-4 fill-green-700 shrink-0" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            <span className="truncate">Consultar no WhatsApp</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
