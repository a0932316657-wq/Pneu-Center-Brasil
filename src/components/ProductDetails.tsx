import React from 'react';
import { ArrowLeft, MessageSquare, ShieldAlert, BadgeCheck, Compass, Settings, AlertTriangle, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { openWhatsAppChat, getProductMessage } from '../lib/whatsapp';
import { getRimInmetroSeals } from '../lib/appStore';
import BrandBadge from './BrandBadge';

interface ProductDetailsProps {
  product: Product;
  onBackToCatalog: () => void;
}

export default function ProductDetails({ product, onBackToCatalog }: ProductDetailsProps) {
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
  ].filter(spec => spec.value && spec.value.trim() !== '');

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
            {/* Dynamic support for multiple gallery images if they exist - otherwise show main single image */}
            <img
              src={product.image || null}
              alt={`Foto detalhada do pneu ${product.name}`}
              referrerPolicy="no-referrer"
              className="h-full w-full object-contain p-8 object-center"
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
                  <img src={product.image || null} alt="principal" className="h-full w-full object-contain p-1" />
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
                  Marca: {product.brand} Original
                </span>
                <span className="rounded bg-slate-100 px-2.5 py-1 text-slate-700 border border-slate-200 font-bold text-orange-600">
                  Medida: {product.measure}
                </span>
              </div>
            </div>

            {/* Custom pricing widget */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 shadow-xs">
              <span className="block text-[9.5px] font-mono tracking-wider font-bold text-slate-400 uppercase leading-none mb-1.5">Preço Recomendado</span>
              {product.priceStatus === 'exibir' && product.price !== undefined ? (
                <div>
                  <div className="text-3xl font-sans font-black text-slate-900 leading-none">
                    R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase font-sans">
                    *Condições de pagamento e impostos faturados confirmados no WhatsApp.
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
            <div className={`rounded-xl border p-4 flex items-center gap-3 ${product.status?.toLowerCase().includes('indisponível') ? 'border-rose-200 bg-rose-50/55' : 'border-emerald-200 bg-emerald-50/55'}`}>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${product.status?.toLowerCase().includes('indisponível') ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {product.status?.toLowerCase().includes('indisponível') ? <AlertTriangle className="h-5.5 w-5.5" /> : <Check className="h-5.5 w-5.5" />}
              </div>
              <div className="font-sans">
                <p className={`text-xs font-mono font-extrabold uppercase tracking-widest leading-none mb-1 ${product.status?.toLowerCase().includes('indisponível') ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {product.status?.toLowerCase().includes('indisponível') ? 'Indisponível Temporariamente' : 'Disponível'}
                </p>
                <p className="text-xs text-slate-700">
                  {product.status?.toLowerCase().includes('indisponível') 
                    ? 'Produto temporariamente indisponível.' 
                    : 'Produto disponível para atendimento. Para informações sobre entrega, condições comerciais e suporte, fale com nossa equipe pelo WhatsApp.'}
                </p>
              </div>
            </div>

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
                      <span className="text-slate-705 font-medium">Garantia integral de fábrica de 5 anos contra defeitos de fabricação</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* INMETRO homologation seal if present */}
            {(() => {
              const effectiveSealUrl = product.inmetro_label_url || getRimInmetroSeals().find(s => s.rim === product.rim)?.seal_url;
              if (!effectiveSealUrl) return null;
              return (
                <div className="rounded-xl border border-slate-150 p-4 bg-white flex items-center gap-4 shadow-xs animate-fade-in mt-4">
                  <div className="h-20 w-16 bg-white flex items-center justify-center border border-slate-100 p-1 shrink-0 rounded">
                    <img
                      src={effectiveSealUrl}
                      alt="Selo de homologação INMETRO"
                      className="h-full w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="block text-[9px] font-mono tracking-wider font-extrabold text-orange-600 uppercase">Selo de Eficiência</span>
                    <h4 className="font-sans text-xs font-bold text-slate-800 uppercase mt-0.5 leading-tight">Homologado pelo INMETRO / CONPET</h4>
                    <p className="text-[11px] text-slate-500 leading-normal mt-1 leading-snug">Este model passou pelos testes nacionais obrigatórios de resistência ao rolamento, aderência em pista molhada e ruído externo.</p>
                  </div>
                </div>
              );
            })()}

          </div>

          {/* Call to action & Transparency guidelines */}
          <div className="mt-8 space-y-4">
            
            {/* Primary Action Button */}
            <button
              id={`details-cta-whatsapp-${product.id}`}
              onClick={handleWhatsAppClick}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm sm:text-base px-6 py-4 shadow-md font-sans active:scale-98 transition-all cursor-pointer"
            >
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <span>Consultar Consultor Técnico no WhatsApp</span>
            </button>

            {/* Clear Transparency Block */}
            <div className="rounded-xl border border-slate-200 bg-slate-100/50 p-4.5 flex gap-3 shadow-xs">
              <ShieldAlert className="h-5.5 w-5.5 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-[11px] sm:text-xs text-slate-500 leading-normal font-sans">
                <strong>Catálogo e Transparência:</strong> Este produto faz parte do catálogo comercial online da Pneu Center Brasil. A disponibilidade, prazos específicos e condições de entrega são confirmados diretamente no atendimento. <strong>Não possuímos checkout eletrônico ou transações virtuais de autoatendimento neste domínio.</strong>
              </p>
            </div>

          </div>

        </div>

      </div>

    </motion.div>
  );
}
