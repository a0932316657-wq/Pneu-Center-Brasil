import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Search, 
  Frown, 
  MessageSquare, 
  Building2, 
  Building,
  ShieldCheck, 
  Award, 
  Truck, 
  CreditCard, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  FileText,
  ShieldAlert,
  HelpCircle,
  SlidersHorizontal,
  Tag,
  CircleDot
} from 'lucide-react';
import { Product } from '../types';
import { Brand, RimCard } from '../lib/appStore';
import ProductCard from './ProductCard';
import FAQSection from './FAQSection';
import { openWhatsAppChat, DEFAULT_WHATSAPP_MESSAGE } from '../lib/whatsapp';

// Local images/fallbacks helper
import heroTiresImage from '../assets/images/hero_tires_1780836675879.png';

interface HomeViewNewProps {
  products: Product[];
  brands: Brand[];
  rimCards: RimCard[];
  siteSettings: any;
  navigateTo: (route: any, productId?: string) => void;
  filterByBrand: (brandName: string) => void;
  filterByRim: (rimName: string) => void;
}

export default function HomeViewNew({
  products,
  brands,
  rimCards,
  siteSettings,
  navigateTo,
  filterByBrand,
  filterByRim
}: HomeViewNewProps) {
  // Failed brand logosearch map
  const [failedBrandLogos, setFailedBrandLogos] = useState<Record<string, boolean>>({});

  // Buscador states
  const [activeSearchTab, setActiveSearchTab] = useState<'medida' | 'marca' | 'aro' | 'rapida'>('medida');
  const [searchMedidaLargura, setSearchMedidaLargura] = useState('');
  const [searchMedidaAltura, setSearchMedidaAltura] = useState('');
  const [searchMedidaAro, setSearchMedidaAro] = useState('');
  const [searchMarca, setSearchMarca] = useState('');
  const [searchAro, setSearchAro] = useState('');
  const [searchRapidaText, setSearchRapidaText] = useState('');

  // Search Results States
  const [homeSearchActive, setHomeSearchActive] = useState(false);
  const [homeSearchResults, setHomeSearchResults] = useState<Product[]>([]);
  const [homeSearchQueryLabel, setHomeSearchQueryLabel] = useState('');

  // Accordion details
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);

  const handleHomeSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    let filtered: Product[] = [];
    let queryLabel = '';
    let searchString = '';
    
    if (activeSearchTab === 'medida') {
      const w = searchMedidaLargura.trim();
      const h = searchMedidaAltura.trim();
      const r = searchMedidaAro.trim();
      queryLabel = `${w}/${h} R${r}`.trim();
      searchString = queryLabel;
      
      filtered = products.filter(p => {
        if (p.active === false) return false;
        const cleanP = p.measure.replace(/\s+/g, '').toLowerCase();
        let match = true;
        if (w) match = match && cleanP.includes(w.toLowerCase());
        if (h) match = match && cleanP.includes('/' + h.toLowerCase());
        if (r) match = match && cleanP.includes('r' + r.toLowerCase());
        return match;
      });
    } else if (activeSearchTab === 'marca') {
      const m = searchMarca.trim();
      queryLabel = m;
      searchString = m;
      filtered = products.filter(p => {
        if (p.active === false) return false;
        return p.brand.toLowerCase() === m.toLowerCase();
      });
    } else if (activeSearchTab === 'aro') {
      const a = searchAro.trim();
      queryLabel = `Aro ${a}`;
      searchString = a;
      filtered = products.filter(p => {
        if (p.active === false) return false;
        return p.rim === Number(a);
      });
    } else {
      const val = searchRapidaText.trim();
      queryLabel = val;
      searchString = val;
      filtered = products.filter(p => {
        if (p.active === false) return false;
        const s = val.toLowerCase();
        return (
          p.name.toLowerCase().includes(s) ||
          p.measure.toLowerCase().includes(s) ||
          p.brand.toLowerCase().includes(s)
        );
      });
    }
    
    setHomeSearchResults(filtered);
    setHomeSearchQueryLabel(queryLabel);
    setHomeSearchActive(true);
    
    // GTM event trigger
    try {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: 'search',
        search_string: searchString,
        filter_type: activeSearchTab,
        content_category: 'Pneus'
      });
    } catch (err) {
      console.warn("GTM push failed:", err);
    }
    
    // Smooth scroll to results
    setTimeout(() => {
      const el = document.getElementById('search-results-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const isVideoUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    const cleanUrl = url.split('?')[0].split('#')[0];
    const lowercase = cleanUrl.toLowerCase();
    return (
      lowercase.endsWith('.mp4') ||
      lowercase.endsWith('.webm') ||
      lowercase.endsWith('.ogg') ||
      lowercase.endsWith('.mov') ||
      lowercase.endsWith('.m4v') ||
      lowercase.endsWith('.3gp') ||
      lowercase.endsWith('.quicktime')
    );
  };

  return (
    <div className="bg-white">
      {/* 1. HERO PRINCIPAL SIMPLES */}
      <section id="hero-block" className="relative overflow-hidden bg-radial from-slate-900 via-slate-950 to-slate-950 py-6 sm:py-16 md:py-20 border-b border-slate-900 font-sans">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 lg:gap-x-10 items-center text-center lg:text-left">
            
            {/* HERO CONTENT */}
            <div className="lg:col-span-7 flex flex-col space-y-4 sm:space-y-6 lg:items-start lg:text-left">
              {/* Mobile Hero Image - Centered and visible only under lg breakpoint */}
              <div className="block lg:hidden w-full max-w-xs mx-auto mb-2 overflow-visible relative flex items-center justify-center">
                {/* Background glow */}
                <div className="absolute h-32 w-32 rounded-full bg-orange-500/15 blur-2xl z-0" />
                
                {(() => {
                  const borderClr = siteSettings?.heroBorderColor || '#f97316';
                  const glowClr = siteSettings?.heroGlowColor || '#f97316';
                  const bRad = `${siteSettings?.heroBorderRadius || 24}px`;
                  const gIntensity = parseFloat(siteSettings?.heroGlowIntensity || '0.4');
                  const hasCustomHero = siteSettings?.heroImageUrl && siteSettings?.heroImageUrl.trim() !== '';
                  const activeHeroUrl = hasCustomHero ? siteSettings.heroImageUrl : heroTiresImage;
                  const isCustomVideo = hasCustomHero && (siteSettings.heroMediaType === 'video' || isVideoUrl(siteSettings.heroImageUrl));

                  return (
                    <motion.div
                      animate={{
                        y: [0, -6, 0],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="z-10 bg-slate-950/70 backdrop-blur-md inline-block relative shrink-0 transition-all p-3"
                      style={{
                        borderRadius: bRad,
                        border: `1px solid ${borderClr}`,
                        boxShadow: `0 0 ${12 * gIntensity}px ${borderClr}, inset 0 0 ${6 * gIntensity}px ${borderClr}, 0 0 ${20 * gIntensity}px ${glowClr}`
                      }}
                    >
                      {isCustomVideo ? (
                        <video
                          src={activeHeroUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="h-32 sm:h-40 w-auto object-contain select-none pointer-events-none block rounded-xl"
                        />
                      ) : (
                        <img
                          src={activeHeroUrl}
                          alt="Destaque Pneu"
                          className="h-32 sm:h-40 w-auto object-contain select-none pointer-events-none block rounded-xl"
                        />
                      )}
                    </motion.div>
                  );
                })()}
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3.5 py-1 text-[10px] sm:text-xs font-mono font-medium text-orange-400 border border-orange-500/15 mx-auto lg:mx-0">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Catálogo Oficial Multimarcas</span>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <h1 className="font-display text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-white uppercase leading-tight sm:leading-none">
                  Pneus multimarcas <span className="text-orange-500 block">para seu carro</span>
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed max-w-2xl font-sans">
                  Consulte pneus por aro, medida ou marca e fale direto com nossa equipe pelo WhatsApp.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-md mx-auto lg:mx-0">
                <button
                  onClick={() => openWhatsAppChat(DEFAULT_WHATSAPP_MESSAGE)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-555 text-white font-bold px-5 py-3 sm:px-8 sm:py-4 transition-all hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer font-display uppercase tracking-wide text-[10px] sm:text-xs whitespace-nowrap"
                >
                  Consultar no WhatsApp
                </button>
                <button
                  onClick={() => navigateTo('catalogo')}
                  className="w-full sm:w-auto rounded-xl bg-orange-600 hover:bg-orange-550 text-slate-950 font-bold px-5 py-3 sm:px-8 sm:py-4 transition-all hover:shadow-lg hover:shadow-orange-500/15 cursor-pointer font-display uppercase tracking-wide text-[10px] sm:text-xs whitespace-nowrap"
                >
                  Ver catálogo
                </button>
              </div>

              <p className="text-[10px] sm:text-[11px] text-gray-400 font-sans leading-normal text-center lg:text-left max-w-md pt-2 border-t border-slate-900/60 w-full">
                Catálogo digital. Valores, estoque e entrega são confirmados no atendimento.
              </p>
            </div>

            {/* FLOATING TIRE ON THE RIGHT */}
            <div className="hidden lg:flex lg:col-span-5 flex-col items-center justify-center relative mt-6 lg:mt-0">
               <div className="relative w-full max-w-sm sm:max-w-md h-72 sm:h-96 flex items-center justify-center overflow-visible">
                
                {/* Background glow */}
                <div className="absolute h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-orange-500/10 blur-3xl z-0" />
                
                {/* Orbiting Brand cards */}
                {(() => {
                  const displayOrbitingBrands = brands && brands.filter(b => b.active).length > 0 
                    ? brands.filter(b => b.active)
                    : [
                        { id: '1', name: "Pirelli", logo: "" },
                        { id: '2', name: "Michelin", logo: "" },
                        { id: '3', name: "Goodyear", logo: "" },
                        { id: '4', name: "Continental", logo: "" }
                      ];

                  return displayOrbitingBrands.map((brand, idx) => {
                    const total = displayOrbitingBrands.length;
                    const angleOffset = (idx * 2 * Math.PI) / total;
                    
                    const steps = 8;
                    const xArr = [];
                    const yArr = [];
                    const scaleArr = [];
                    const opacityArr = [];
                    const zIndexArr = [];
                    
                    for (let k = 0; k <= steps; k++) {
                      const angle = angleOffset + (k * 2 * Math.PI) / steps;
                      const sinAngle = Math.sin(angle);
                      const cosAngle = Math.cos(angle);
                      
                      xArr.push(cosAngle * 135);
                      yArr.push(sinAngle * 45);
                      
                      const scale = 0.85 + sinAngle * 0.25;
                      scaleArr.push(scale);
                      
                      const isBehind = sinAngle < -0.15;
                      opacityArr.push(isBehind ? 0.05 : 0.95);
                      zIndexArr.push(isBehind ? 5 : 20);
                    }

                    return (
                      <motion.div
                        key={brand.id || idx}
                        onClick={() => filterByBrand(brand.name)}
                        animate={{
                          x: xArr,
                          y: yArr,
                          scale: scaleArr,
                          zIndex: zIndexArr,
                          opacity: opacityArr,
                        }}
                        transition={{
                          duration: 16,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute cursor-pointer select-none bg-slate-900/95 backdrop-blur-md border border-orange-500/20 text-white shadow-2xl rounded-2xl p-2 flex items-center justify-center hover:border-orange-500 transition-all hover:scale-110"
                      >
                        {brand.logo && brand.logo.trim() && !failedBrandLogos[brand.id || idx] ? (
                          <div className="h-6 w-9 rounded-lg bg-white overflow-hidden flex items-center justify-center p-0.5">
                            <img 
                              src={brand.logo.trim()} 
                              alt={brand.name} 
                              onError={() => setFailedBrandLogos(p => ({ ...p, [brand.id || idx]: true }))}
                              className="h-full w-full object-contain" 
                            />
                          </div>
                        ) : (
                          <span className="h-6 w-6 rounded-full bg-orange-600 text-slate-950 font-black text-xs flex items-center justify-center">
                            {brand.name.substring(0, 1).toUpperCase()}
                          </span>
                        )}
                      </motion.div>
                    );
                  });
                })()}

                {/* Central Floating Premium Tire card */}
                {(() => {
                  const borderClr = siteSettings?.heroBorderColor || '#f97316';
                  const glowClr = siteSettings?.heroGlowColor || '#f97316';
                  const bRad = `${siteSettings?.heroBorderRadius || 24}px`;
                  const gIntensity = parseFloat(siteSettings?.heroGlowIntensity || '0.4');
                  const hasCustomHero = siteSettings?.heroImageUrl && siteSettings?.heroImageUrl.trim() !== '';
                  const activeHeroUrl = hasCustomHero ? siteSettings.heroImageUrl : heroTiresImage;
                  const isCustomVideo = hasCustomHero && (siteSettings.heroMediaType === 'video' || isVideoUrl(siteSettings.heroImageUrl));

                  return (
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 0.4, -0.4, 0],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="z-10 bg-slate-950/70 backdrop-blur-md inline-block relative shrink-0 transition-all"
                      style={{
                        padding: '16px',
                        borderRadius: bRad,
                        border: `1px solid ${borderClr}`,
                        boxShadow: `0 0 ${16 * gIntensity}px ${borderClr}, inset 0 0 ${8 * gIntensity}px ${borderClr}, 0 0 ${28 * gIntensity}px ${glowClr}`
                      }}
                    >
                      {isCustomVideo ? (
                        <video
                          src={activeHeroUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="h-48 sm:h-64 h-auto object-contain select-none pointer-events-none block rounded-2xl"
                        />
                      ) : (
                        <img
                          src={activeHeroUrl}
                          alt="Destaque Pneu"
                          className="h-48 sm:h-64 h-auto object-contain select-none pointer-events-none block rounded-2xl"
                          style={{ mixBlendMode: hasCustomHero ? 'normal' : 'lighten' }}
                        />
                      )}
                    </motion.div>
                  );
                })()}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. BUSCADOR PRINCIPAL DE PNEUS */}
      <section className="py-6 sm:py-10 bg-slate-50 border-b border-slate-200 font-sans">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-4 sm:mb-6">
            <h2 className="font-sans text-xl sm:text-3xl font-black text-slate-800 uppercase tracking-tight">
              Encontre seu pneu
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
              Busque por medida, aro ou marca.
            </p>
          </div>

          <div className="max-w-2xl mx-auto bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-4 sm:p-7 relative overflow-hidden">
            {/* Top design accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 animate-pulse" />

            {/* Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-slate-800 pb-4 mb-6">
              {[
                { id: 'medida', label: 'Por medida', icon: SlidersHorizontal },
                { id: 'marca', label: 'Por marca', icon: Tag },
                { id: 'aro', label: 'Por aro', icon: CircleDot },
                { id: 'rapida', label: 'Busca rápida', icon: Search },
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isSelected = activeSearchTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSearchTab(tab.id as any)}
                    className={`py-2 px-2.5 rounded-xl text-[10px] sm:text-xs font-sans font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-orange-600 text-slate-950 shadow-lg shadow-orange-600/20 scale-[1.03]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <IconComponent className="h-3.5 w-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleHomeSearch} className="space-y-6">
              {activeSearchTab === 'medida' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl">
                    <span className="block text-[10px] font-mono font-bold tracking-widest text-orange-400 uppercase text-center mb-4">
                      INSIRA A MEDIDA EXATA DO SEU PNEU
                    </span>
                    
                    <div className="flex items-center justify-center gap-1.5 sm:gap-4 max-w-md mx-auto">
                      {/* Largura */}
                      <div className="flex-1">
                        <label className="block text-[9px] uppercase font-mono font-extrabold text-slate-400 text-center mb-1">Largura</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="205"
                          value={searchMedidaLargura}
                          onChange={(e) => setSearchMedidaLargura(e.target.value)}
                          className="w-full text-center py-2.5 sm:py-3 px-2 bg-slate-900 border border-slate-750 hover:border-slate-650 focus:border-orange-500 rounded-xl font-display font-black text-sm sm:text-base text-white focus:outline-none transition-all placeholder:text-slate-600"
                        />
                      </div>
                      
                      {/* Slash 1 */}
                      <span className="text-slate-600 font-display font-black text-lg py-4 self-end">/</span>
                      
                      {/* Altura */}
                      <div className="flex-1">
                        <label className="block text-[9px] uppercase font-mono font-extrabold text-slate-400 text-center mb-1">Perfil</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="55"
                          value={searchMedidaAltura}
                          onChange={(e) => setSearchMedidaAltura(e.target.value)}
                          className="w-full text-center py-2.5 sm:py-3 px-2 bg-slate-900 border border-slate-750 hover:border-slate-650 focus:border-orange-500 rounded-xl font-display font-black text-sm sm:text-base text-white focus:outline-none transition-all placeholder:text-slate-600"
                        />
                      </div>
                      
                      {/* Slash 2 */}
                      <span className="text-slate-600 font-display font-black text-lg py-4 self-end">R</span>
                      
                      {/* Aro */}
                      <div className="flex-1">
                        <label className="block text-[9px] uppercase font-mono font-extrabold text-slate-400 text-center mb-1">Aro</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="16"
                          value={searchMedidaAro}
                          onChange={(e) => setSearchMedidaAro(e.target.value)}
                          className="w-full text-center py-2.5 sm:py-3 px-2 bg-slate-900 border border-slate-750 hover:border-slate-650 focus:border-orange-500 rounded-xl font-display font-black text-sm sm:text-base text-white focus:outline-none transition-all placeholder:text-slate-600"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-center font-mono text-[10px] sm:text-xs text-slate-400 bg-slate-950/40 py-1.5 px-3 rounded-full inline-block mx-auto w-full">
                    Geralmente gravado na lateral do pneu como: <strong className="text-orange-400 font-mono">205/55R16</strong>
                  </p>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-550 text-white font-sans font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 sm:py-4.5 rounded-2xl cursor-pointer transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2 transform active:scale-98"
                  >
                    <Search className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span>Buscar Pneu por Medida</span>
                  </button>
                </div>
              )}

              {activeSearchTab === 'marca' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl">
                    <label className="block text-[10px] font-mono font-bold tracking-widest text-orange-400 uppercase text-center mb-2">
                      SELECIONE A MARCA DO CATÁLOGO
                    </label>
                    <select
                      value={searchMarca}
                      onChange={(e) => setSearchMarca(e.target.value)}
                      className="w-full py-3.5 px-4 bg-slate-900 border border-slate-750 hover:border-orange-500 text-white rounded-xl font-sans font-bold text-sm focus:outline-none cursor-pointer transition-all"
                    >
                      <option value="" className="text-slate-500">Selecione uma marca...</option>
                      {Array.from(new Set(products.map(p => p.brand))).filter(Boolean).map((br, idx) => (
                        <option key={idx} value={br} className="bg-slate-900 text-white">{br}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-555 text-white font-sans font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 sm:py-4.5 rounded-2xl cursor-pointer transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2 transform active:scale-98"
                  >
                    <Search className="h-4 w-4" />
                    <span>Buscar Pneus desta Marca</span>
                  </button>
                </div>
              )}

              {activeSearchTab === 'aro' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl">
                    <label className="block text-[10px] font-mono font-bold tracking-widest text-orange-400 uppercase text-center mb-3">
                      ESCOLHA O TAMANHO DO ARO
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {['13', '14', '15', '16', '17', '18'].map((aroVal) => {
                        const isAroSelected = searchAro === aroVal;
                        return (
                          <button
                            key={aroVal}
                            type="button"
                            onClick={() => setSearchAro(aroVal)}
                            className={`py-3 rounded-xl border-2 font-display font-black text-xs sm:text-sm uppercase transition-all duration-150 cursor-pointer ${
                              isAroSelected
                                ? 'border-orange-500 bg-orange-600/10 text-orange-400'
                                : 'border-slate-800 hover:border-slate-750 text-slate-350 hover:bg-slate-900'
                            }`}
                          >
                            Aro {aroVal}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-555 text-white font-sans font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 sm:py-4.5 rounded-2xl cursor-pointer transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2 transform active:scale-98"
                  >
                    <Search className="h-4 w-4" />
                    <span>Buscar Pneus Aro {searchAro || 'Selecionado'}</span>
                  </button>
                </div>
              )}

              {activeSearchTab === 'rapida' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl">
                    <label className="block text-[10px] font-mono font-bold tracking-widest text-orange-400 uppercase text-center mb-2">
                      DIGITE O QUE VOCÊ BUSCA
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 205/55 R16, Pirelli, Aro 15..."
                      value={searchRapidaText}
                      onChange={(e) => setSearchRapidaText(e.target.value)}
                      className="w-full py-3.5 px-4 bg-slate-900 border border-slate-750 hover:border-orange-500 text-white rounded-xl font-sans font-bold text-sm focus:outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-555 text-white font-sans font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 sm:py-4.5 rounded-2xl cursor-pointer transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2 transform active:scale-98"
                  >
                    <Search className="h-4 w-4" />
                    <span>Realizar Busca Inteligente</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* SEARCH RESULTS VIEW */}
      <AnimatePresence>
        {homeSearchActive && (
          <motion.section
            id="search-results-section"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="py-6 sm:py-10 bg-white border-b border-slate-200 scroll-mt-20 font-sans"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                <div className="text-center md:text-left">
                  <h3 className="font-sans font-black text-slate-800 text-lg uppercase tracking-tight">
                    Resultados para: <span className="text-orange-655">"{homeSearchQueryLabel}"</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                    Fale no WhatsApp para consulta de preços e prazos.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 font-sans font-black text-[11px] text-emerald-700 uppercase tracking-wider">
                  Encontramos {homeSearchResults.length} {homeSearchResults.length === 1 ? 'opção' : 'opções'}
                </span>
              </div>

              {homeSearchResults.length > 0 ? (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {homeSearchResults.slice(0, 8).map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        onViewDetails={(id) => {
                          window.history.pushState({ path: 'produto', productId: id }, '', `#/produto/${id}`);
                          navigateTo('produto', id);
                        }}
                      />
                    ))}
                  </div>
                  {homeSearchResults.length > 8 && (
                    <div className="text-center mt-8">
                      <button
                        onClick={() => {
                          filterByBrand(homeSearchQueryLabel);
                          navigateTo('catalogo');
                        }}
                        className="rounded-xl border border-slate-300 hover:border-orange-500 font-sans font-black text-xs text-slate-850 uppercase tracking-widest py-3 px-6 transition-colors cursor-pointer"
                      >
                        Ver todos no catálogo completo
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-w-md mx-auto text-center py-8 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <Frown className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                  <h4 className="font-sans font-extrabold text-slate-850 text-base uppercase tracking-tight">
                    Não encontramos essa medida no catálogo
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 w-full max-w-sm mx-auto font-sans mb-5 leading-normal">
                    Fale com nossa equipe para consultar disponibilidade no estoque físico de nossos canais gerais.
                  </p>
                  <button
                    onClick={() => openWhatsAppChat(`Olá, vim pelo site Pneu Center Brasil e gostaria de consultar pneus relacionados a: ${homeSearchQueryLabel || 'Pneus'}`)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-555 text-white font-sans font-black text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl cursor-pointer transition-all shadow-md"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Consultar no WhatsApp</span>
                  </button>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 3. MARCAS */}
      <section id="marcas-section" className="py-6 sm:py-10 bg-white border-b border-slate-200 font-sans">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-4 sm:mb-6">
            <h2 className="font-sans text-lg sm:text-2xl font-black text-slate-800 uppercase tracking-tight">
              Busque por marca
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 font-sans">
              Escolha uma marca para ver as opções disponíveis.
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {(() => {
              const activeBrands = brands.filter(b => b.active);
              const listToDisplay = activeBrands.length > 0 
                ? activeBrands 
                : Array.from(new Set(products.map(p => p.brand))).filter(Boolean).map((n, i) => ({ id: `dyn-${i}`, name: n, logo: '', active: true }));
              
              return listToDisplay.map((brand, idx) => (
                <button
                  key={brand.id || idx}
                  onClick={() => filterByBrand(brand.name)}
                  className="flex flex-col items-center justify-center p-2 sm:p-3 border border-slate-150 hover:border-orange-500 hover:bg-slate-50/50 rounded-xl transition-all cursor-pointer text-center group h-14 sm:h-20"
                >
                  {brand.logo && brand.logo.trim() && !failedBrandLogos[brand.id || idx] ? (
                    <img
                      src={brand.logo.trim()}
                      alt={brand.name}
                      onError={() => setFailedBrandLogos(p => ({ ...p, [brand.id || idx]: true }))}
                      className="h-4 sm:h-6 max-w-full object-contain filter group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <span className="font-display font-black text-[10px] sm:text-xs uppercase text-slate-800 tracking-wider group-hover:text-orange-600 transition-colors truncate w-full px-1">
                      {brand.name}
                    </span>
                  )}
                </button>
              ));
            })()}
          </div>
        </div>
      </section>

      {/* 4. PNEUS EM DESTAQUE */}
      <section className="py-6 sm:py-10 bg-slate-50/50 border-b border-slate-200 font-sans">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-4 sm:mb-6">
            <h2 className="font-sans text-lg sm:text-2xl font-black text-slate-800 uppercase tracking-tight">
              Pneus em destaque
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 font-sans">
              Destaque de pneus com excelente performance e durabilidade.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.filter(p => p.active !== false).slice(0, 8).map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onViewDetails={(id) => {
                  window.history.pushState({ path: 'produto', productId: id }, '', `#/produto/${id}`);
                  navigateTo('produto', id);
                }}
              />
            ))}
          </div>

          <div className="text-center mt-6 sm:mt-8">
            <button
              onClick={() => navigateTo('catalogo')}
              className="rounded-xl bg-orange-600 hover:bg-orange-550 text-slate-950 font-sans font-black text-[11px] sm:text-xs uppercase tracking-widest py-2.5 px-6 sm:py-3.5 sm:px-8 transition-colors cursor-pointer"
            >
              Ver catálogo completo
            </button>
          </div>
        </div>
      </section>

      {/* 5. BUSCA POR ARO */}
      <section id="aros-section" className="py-6 sm:py-10 bg-white border-b border-slate-200 font-sans">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-4 sm:mb-6">
            <h2 className="font-sans text-lg sm:text-2xl font-black text-slate-800 uppercase tracking-tight">
              Escolha o aro do pneu
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 font-sans">
              Pesquise especificamente pelo aro de roda do seu carro.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
            {['13', '14', '15', '16', '17', '18'].map((aroNum) => {
              const matchedRimCard = rimCards.find(rc => Number(rc.rim) === Number(aroNum));
              const customImage = (matchedRimCard && matchedRimCard.image && matchedRimCard.image.trim()) || 'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&q=80&w=400';
              return (
                <div
                  key={aroNum}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-orange-500 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between p-3 sm:p-4 bg-slate-950 h-32 sm:h-48 text-left"
                >
                  <div className="absolute inset-0 z-0 opacity-40 group-hover:scale-105 transition-transform duration-500">
                    <img
                      src={customImage}
                      alt={`Aro ${aroNum}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
                  </div>

                  <div className="relative z-10">
                    <span className="inline-block rounded bg-orange-600 text-slate-950 px-1 py-0.5 text-[8px] sm:text-[9px] font-mono font-black uppercase tracking-wider mb-1 sm:mb-1.5">
                      Aro {aroNum}
                    </span>
                    <h3 className="font-sans font-black text-white text-xs sm:text-sm uppercase leading-tight">
                      Pneus Aro {aroNum}
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      filterByRim(`Aro ${aroNum}`);
                    }}
                    className="relative z-10 w-full bg-orange-600 group-hover:bg-white text-slate-950 group-hover:text-slate-950 font-display font-extrabold text-[8px] sm:text-[9px] uppercase tracking-wider py-1 sm:py-1.5 rounded-lg text-center transition-colors cursor-pointer"
                  >
                    Consultar Aro
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. COMO FUNCIONA */}
      <section className="py-6 sm:py-10 bg-slate-50/30 border-b border-slate-200 font-sans">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-4 sm:mb-6">
            <h2 className="font-sans text-lg sm:text-2xl font-black text-slate-800 uppercase tracking-tight">
              Como funciona
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 font-sans">
              Pronto, rápido e sem complicações.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mx-auto max-w-4xl">
            {[
              { step: '1', title: 'Escolha a medida, aro ou marca', desc: 'Faça a consulta instantânea no catálogo informativo.' },
              { step: '2', title: 'Consulte disponibilidade', desc: 'Bata um papo rápido com nossos técnicos comerciais.' },
              { step: '3', title: 'Fale com nossa equipe pelo WhatsApp', desc: 'Finalize sua cotação e agende a entrega do seu pneu de forma segura.' },
            ].map((st, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 flex flex-col justify-between hover:shadow-xs transition-all text-center sm:text-left">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-orange-600 font-sans font-extrabold text-slate-950 text-xs sm:text-sm mb-2 mx-auto sm:mx-0">
                  {st.step}
                </div>
                <div>
                  <h4 className="font-sans font-bold text-[11px] sm:text-xs uppercase text-slate-800 tracking-wide mb-1 leading-normal">{st.title}</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 leading-normal font-sans">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CONFIANÇA E SEGURANÇA */}
      <section className="py-6 sm:py-10 bg-white border-b border-slate-200 font-sans">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-4 sm:mb-6">
            <h2 className="font-sans text-lg sm:text-2xl font-black text-slate-800 uppercase tracking-tight">
              Confiança e Segurança
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 font-sans">
              Catálogo oficial que preza pela segurança jurídica e transparência no faturamento de pneus.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-6">
            {[
              { title: 'Empresa com CNPJ', icon: Building2, desc: 'Registrada e regularizada' },
              { title: 'Atendimento oficial', icon: MessageSquare, desc: 'Equipe especializada' },
              { title: 'Catálogo digital', icon: Sparkles, desc: 'Informativo e técnico' },
              { title: 'Sem checkout online', icon: ShieldCheck, desc: 'Prevenção de dados/fraude' },
              { title: 'Valores no faturamento', icon: FileText, desc: 'Atualizados individualmente' },
              { title: 'Nota fiscal eletrônica', icon: Award, desc: 'Garantia legal de fábrica' },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div key={idx} className="flex flex-col items-center justify-center text-center p-2.5 sm:p-3 border border-slate-150 rounded-xl bg-slate-50/50">
                  <Icon className="h-4.5 w-4.5 text-orange-500 mb-1 shrink-0" />
                  <h4 className="font-sans font-extrabold text-[9px] sm:text-[10px] uppercase text-slate-800 leading-tight mb-0.5">{card.title}</h4>
                  <p className="text-[8px] sm:text-[9px] text-slate-450 leading-tight font-sans">{card.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Collapsible Accordion details */}
          <div className="max-w-xl mx-auto border border-slate-200 rounded-xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setShowCompanyDetails(!showCompanyDetails)}
              className="w-full flex items-center justify-between gap-4 p-3.5 text-left font-sans font-bold text-slate-800 text-xs focus:outline-none cursor-pointer bg-slate-50 hover:bg-slate-100/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-orange-500 shrink-0" />
                <span>Ver informações da empresa (CNPJ, Sede e Compromisso)</span>
              </div>
              {showCompanyDetails ? (
                <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {showCompanyDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="p-4 border-t border-slate-150 space-y-3 text-[11px] text-slate-600 font-sans leading-relaxed bg-slate-50/30">
                    <div>
                      <p className="font-bold text-slate-800">Razão Social:</p>
                      <p>CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">CNPJ Operacional:</p>
                      <p>20.085.983/0001-13 (Situação Ativa)</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Endereço da Sede Fisica:</p>
                      <p>Av. Professor Francisco Morato, 2001, Butantã, São Paulo/SP, CEP 05513-200</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-orange-600 uppercase">Compromisso Google Ads Antifraude:</p>
                      <p>
                        Trabalhamos devidamente de acordo com as normas de conformidade jurídica do Google Ads, aplicando total transparência contra práticas de fraude técnica ou financeira. Esclarecemos que não há transação bancária direta ou pagamento no ambiente virtual deste site. Compras físicas ocorrem exclusivamente através de faturamento homologado, com Nota Fiscal Eletrônica e garantia original direta do respectivo fabricante.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 8. FAQ CURTO */}
      <section className="py-6 sm:py-10 bg-slate-50/50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-4 sm:mb-6">
            <h2 className="font-sans text-lg sm:text-2xl font-black text-slate-800 uppercase tracking-tight">
              Dúvidas frequentes
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 font-sans">
              Tudo o que você precisa saber sobre nosso catálogo.
            </p>
          </div>

          <FAQSection />
        </div>
      </section>
    </div>
  );
}
