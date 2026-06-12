import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, ShieldAlert, BadgeCheck, Compass, Settings, AlertTriangle, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { openWhatsAppChat, getProductMessage } from '../lib/whatsapp';
import { getRimInmetroSeals, resolveProductImage } from '../lib/appStore';
import BrandBadge from './BrandBadge';

interface ProductDetailsProps {
  product: Product;
  onBackToCatalog: () => void;
}

export default function ProductDetails({ product, onBackToCatalog }: ProductDetailsProps) {
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const handleWhatsAppClick = () => {
    const msg = getProductMessage(product.name, product.measure, product.price, product.priceStatus);
    openWhatsAppChat(msg);
  };

  const technicalSpecs = [
    { label: 'Categoria Comercial', value: product.technical_category },
    { label: 'Terreno (Terrain)', value: product.terrain },
    { label: 'Índice de Carga', value: product.load_index },
    { label: 'Capacidade de Carga', value: product.load_capacity },
    { label: 'Índice de Velocidade', value: product.speed_index },
    { label: 'Velocidade Máxima', value: product.max_speed },
    { label: 'Aros Compatíveis', value: product.compatible_rims },
    { label: 'Largura Total (mm)', value: product.width_mm },
    { label: 'Diâmetro Externo (mm)', value: product.diameter_mm },
    { label: 'Treadwear', value: product.treadwear },
    { label: 'Tração (Traction)', value: product.traction },
    { label: 'Temperatura (Temperature)', value: product.temperature },
    { label: 'RunFlat', value: product.runflat },
    { label: 'Carga Extra (XL)', value: product.extra_load },
    { label: 'Protetor de Borda', value: product.rim_protector },
    { label: 'Quantidade de Lonas', value: product.ply_quantity },
    { label: 'Montagem', value: product.mounting },
    { label: 'Cor das Letras', value: product.letter_color },
    { label: 'Profundidade do Sulco', value: product.groove_depth },
  ].filter(spec => spec.value !== undefined && spec.value !== null && String(spec.value).trim() !== '');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      {/* Back Button */}
      <button
        onClick={onBackToCatalog}
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Voltar ao Catálogo de Pneus</span>
      </button>

      {/* Main Grid: Visual & Information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        
        {/* Left Side: Premium Image Panel */}
        <div className="lg:col-span-6 flex flex-col justify-start">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-checkerboard shadow-xs">
            {/* Main image loaded visual skeleton */}
            {!mainImageLoaded && (
              <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center z-10">
                <div className="w-20 h-20 rounded-full border-4 border-dashed border-slate-300 animate-[spin_10s_linear_infinite]" />
              </div>
            )}

            {/* Dynamic support for multiple gallery images if they exist - otherwise show main single image */}
            <img
              src={resolveProductImage(product)}
              alt={`Foto detalhada do pneu ${product.name}`}
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
              onLoad={() => setMainImageLoaded(true)}
              className={`h-full w-full object-contain p-8 object-center transition-all duration-300 ${mainImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            />
            
            {/* Visual Indicators */}
            <BrandBadge brandName={product.brand} />
            
            <div className="absolute bottom-4 left-4 rounded bg-slate-900/90 backdrop-blur-md px-3.5 py-2 text-xs text-white border border-slate-700">
              Pneu Aro {product.rim} • Categoria {product.category}
            </div>
          </div>

          {/* Multiple gallery slides previews layout */}
          {product.gallery && product.gallery.length > 0 && (
            <div className="mt-4 space-y-2">
              <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">Galeria do Produto:</span>
              <div className="flex gap-2 bg-slate-100 p-2 rounded-xl overflow-x-auto">
                <div className="h-14 w-18 border-2 border-orange-500 bg-checkerboard rounded overflow-hidden flex items-center justify-center shrink-0">
                  <img src={resolveProductImage(product)} alt="principal" className="h-full w-full object-contain p-1" />
                </div>
                {product.gallery.map((galleryImg, idx) => (
                  <div key={idx} className="h-14 w-18 border border-slate-200 bg-checkerboard rounded overflow-hidden flex items-center justify-center shrink-0 hover:border-slate-400 transition-colors">
                    <img src={galleryImg || null} alt={`Foto adicional ${idx + 1}`} className="h-full w-full object-contain p-1" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Environmental warning on tires */}
          <p className="mt-3 text-[11px] text-slate-500 font-sans text-center">
            *Imagens ilustrativas. O desenho dos sulcos e banda de rodagem do pneu pode variar de acordo com o lote físico do fabricante.
          </p>

          {/* INMETRO homologation seal showing as a mini card under the tire image */}
          {(() => {
            const effectiveSealUrl = product.inmetro_label_url || getRimInmetroSeals().find(s => s.rim === product.rim)?.seal_url;
            if (!effectiveSealUrl) return null;
            return (
              <div className="mt-5 rounded-2xl border border-slate-150 p-4.5 bg-white flex items-center gap-4.5 shadow-xs animate-fade-in">
                <div className="h-20 w-16 bg-white flex items-center justify-center border border-slate-100 p-1.5 shrink-0 rounded-lg shadow-3xs">
                  <img
                    src={effectiveSealUrl}
                    alt="Selo de homologação INMETRO"
                    className="h-full w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0">
                  <span className="inline-block text-[9px] font-mono tracking-widest font-extrabold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded uppercase leading-none mb-1.5">
                    Selo de Eficiência
                  </span>
                  <h4 className="font-sans text-xs font-bold text-slate-800 uppercase leading-normal">
                    Etiqueta INMETRO/CONPET conforme modelo
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1 leading-snug">
                    As informações de etiqueta INMETRO/CONPET podem variar conforme marca, modelo, medida e lote do produto. Confirme a versão exata e a etiqueta aplicável no atendimento antes da finalização.
                  </p>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right Side: Product Metadata and Specs */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* Headline and Title */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold font-mono tracking-wide text-orange-600 border border-orange-200/50 mb-3">
                <Compass className="h-3.5 w-3.5" />
                <span>Aplicação: {product.application}</span>
              </div>
              
              <h1 className="font-sans text-2xl font-black text-slate-800 sm:text-3.5xl tracking-tight leading-tight mb-2 uppercase">
                {product.name}
              </h1>
              
              {/* Measures & Specs details */}
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
                <span className="rounded bg-slate-100 px-2.5 py-1 text-slate-700 border border-slate-200">
                  Aro: {product.rim} Polegadas
                </span>
                <span className="rounded bg-slate-100 px-2.5 py-1 text-slate-700 border border-slate-200 font-bold text-slate-800">
                  Marca: {product.brand}
                </span>
                <span className="rounded bg-slate-100 px-2.5 py-1 text-slate-700 border border-slate-200 font-bold text-orange-600">
                  Medida: {product.measure}
                </span>
              </div>
            </div>

            {/* Custom pricing widget */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 shadow-xs">
              <span className="block text-[9.5px] font-mono tracking-wider font-bold text-slate-400 uppercase leading-none mb-1.5">Preço de referência</span>
              {product.priceStatus === 'exibir' && product.price !== undefined ? (
                <div>
                  <div className="text-3xl font-sans font-black text-slate-900 leading-none">
                    R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase font-sans">
                    *Condições de pagamento, frete, disponibilidade e emissão fiscal confirmadas no WhatsApp oficial.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-sans font-black text-slate-750 uppercase tracking-tight">
                    Preço sob atendimento
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-normal font-sans">
                    Fale com nosso consultor técnico no WhatsApp para receber o orçamento imediato com preços especiais da semana.
                  </p>
                </div>
              )}
            </div>

            {/* Availability Warning State */}
            <div className="rounded-xl border p-4 flex items-center gap-3 bg-[#EAFBF1] border-[#22C55E]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAFBF1] text-[#15803D] border border-[#22C55E]/30 shadow-3xs">
                <Check className="h-5.5 w-5.5" />
              </div>
              <div className="font-sans">
                <p className="text-xs font-mono font-black uppercase tracking-widest leading-none mb-1.5 text-[#15803D]">
                  Disponibilidade sob confirmação
                </p>
                <p className="text-xs text-[#15803D] font-medium leading-relaxed">
                  Este produto pode estar disponível para atendimento conforme estoque, região de entrega e atualização comercial. Confirme disponibilidade, prazo, valor final e condições pelo WhatsApp oficial.
                </p>
              </div>
            </div>

            {/* Primary Action Button (relocated for higher conversion/visibility under the status banner) */}
            <button
              id={`details-cta-whatsapp-${product.id}`}
              onClick={handleWhatsAppClick}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm sm:text-base px-6 py-4 shadow-md font-sans active:scale-98 transition-all cursor-pointer"
            >
              <svg className="w-5 h-5 fill-white shrink-0" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3 512l141.6-37.1c32.7 17.8 69.4 27.2 107.1 27.2 122.4 0 222-99.6 222-222 0-59.3-23-115.1-64.8-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-83.9 22 22.4-81.8-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
              <span>Consultar no WhatsApp</span>
            </button>

            {/* Custom Multi-line Description if available */}
            {product.fullDesc && (
              <div className="space-y-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans border-t border-slate-100 pt-4">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição do Produto:</span>
                <p>{product.fullDesc}</p>
              </div>
            )}

            {/* Ficha Técnica Detalhada (Campos individuais estruturados opcionais) */}
            {technicalSpecs.length > 0 && (
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <h3 className="font-sans text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Settings className="h-4.5 w-4.5 text-orange-500" />
                  Ficha Técnica Detalhada
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs bg-slate-50 rounded-xl border border-slate-200 p-4 shadow-3xs">
                  {technicalSpecs.map((spec, index) => (
                    <div key={index} className="flex justify-between border-b border-slate-100 pb-1.5 pt-0.5">
                      <span className="text-slate-400 font-medium uppercase text-[10px] tracking-wide">{spec.label}</span>
                      <span className="text-slate-700 font-mono font-extrabold text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Especificações Técnicas - Do campo technical_specs */}
            {product.specs && product.specs.length > 0 && (
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <h3 className="font-sans text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Settings className="h-4.5 w-4.5 text-orange-500" />
                  Especificações Técnicas
                </h3>
                
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 shrink-0 shadow-xs">
                  <ul className="space-y-2.5 font-sans text-xs sm:text-sm text-slate-750">
                    {product.specs.map((spec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <BadgeCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700">{spec}</span>
                      </li>
                    ))}
                    <li className="flex items-start gap-2">
                      <BadgeCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-slate-705 font-medium">Os produtos seguem as garantias legais aplicáveis e, quando houver, as condições de garantia informadas pelo respectivo fabricante ou distribuidor. As regras específicas de garantia podem variar conforme marca, modelo e análise técnica.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

          </div>

          {/* Call to action & Transparency guidelines */}
          <div className="mt-8 space-y-4">
            
            {/* Clear Transparency Block */}
            <div className="rounded-xl border border-slate-200 bg-slate-100/50 p-4.5 flex flex-col gap-3 shadow-xs">
              <div className="flex gap-3">
                <ShieldAlert className="h-5.5 w-5.5 text-orange-500 shrink-0 mt-0.5" />
                <div className="text-[11px] sm:text-xs text-slate-500 leading-normal font-sans space-y-1.5">
                  <p><strong>Produto listado para fins informativos de catálogo.</strong> Confirme disponibilidade, preço atualizado, medida, entrega, garantia, emissão fiscal e forma de faturamento diretamente com o atendimento oficial.</p>
                  <p>Este site não realiza checkout financeiro automático. A confirmação final da compra, pagamento, entrega e faturamento ocorre de forma manual e humanizada pelo WhatsApp oficial.</p>
                  <p className="italic font-medium">• Imagem meramente ilustrativa. Confirme disponibilidade, medida, entrega e condições comerciais no atendimento.</p>
                </div>
              </div>
              <p className="border-t border-slate-200 pt-3 text-[10px] text-slate-400 font-extrabold uppercase leading-normal tracking-wide">
                A Pneu Center Brasil atua como revendedora multimarcas independente. Marcas citadas pertencem aos seus respectivos fabricantes e são usadas apenas para identificação dos produtos.
              </p>
            </div>

          </div>

        </div>

      </div>

    </motion.div>
  );
}
