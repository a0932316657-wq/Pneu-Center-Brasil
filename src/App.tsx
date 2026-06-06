import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  HelpCircle, 
  ShieldCheck, 
  ChevronRight, 
  Award, 
  Truck, 
  CreditCard, 
  BadgeHelp,
  SlidersHorizontal,
  Search,
  Undo2,
  Wrench,
  UserCheck,
  Building2,
  Calendar,
  Sparkles,
  RefreshCw,
  FolderLock,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Shared types and data
import { AppRoute, RouteState, Product } from './types';
import { BRANDS } from './data';
import { getProducts, getBrands, getRimCards, Brand, RimCard } from './lib/appStore';

// Custom components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';
import ProductDetails from './components/ProductDetails';
import ContactForm from './components/ContactForm';
import FAQSection from './components/FAQSection';
import AdminPanel from './components/AdminPanel';
import { 
  PrivacyPolicy, 
  TermsOfUse, 
  ShippingPolicy, 
  ReturnsPolicy 
} from './components/Policies';

// WhatsApp direct messenger
import { openWhatsAppChat, DEFAULT_WHATSAPP_MESSAGE, getProductMessage } from './lib/whatsapp';

export default function App() {
  const [routeState, setRouteState] = useState<RouteState>({ path: 'home' });
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [brands, setBrands] = useState<Brand[]>(getBrands());
  const [rimCards, setRimCards] = useState<RimCard[]>(getRimCards());

  // Filter & Search states for the Catalog Page
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRim, setSelectedRim] = useState('Todos');
  const [selectedBrand, setSelectedBrand] = useState('Todas');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [sortBy, setSortBy] = useState('marca');

  // Parse path hash to support standard browser hist back/forward actions
  const parseHash = (): RouteState => {
    const hash = window.location.hash;
    
    if (!hash || hash === '#/' || hash === '#/home' || hash === '#home') {
      return { path: 'home' };
    }
    
    if (hash.startsWith('#/produto/')) {
      const id = hash.replace('#/produto/', '');
      return { path: 'produto', productId: id };
    }

    const pathPart = hash.replace('#/', '') as AppRoute;
    const validPaths: AppRoute[] = [
      'home',
      'catalogo',
      'produto',
      'marcas',
      'como-funciona',
      'sobre',
      'contato',
      'politica-privacidade',
      'termos-uso',
      'politica-entrega',
      'politica-trocas',
      'paineladmin'
    ];

    if (validPaths.includes(pathPart)) {
      return { path: pathPart };
    }

    return { path: 'home' };
  };

  // Refs to always access the latest state inside popstate callback
  const selectedRimRef = React.useRef(selectedRim);
  const selectedBrandRef = React.useRef(selectedBrand);
  useEffect(() => { selectedRimRef.current = selectedRim; }, [selectedRim]);
  useEffect(() => { selectedBrandRef.current = selectedBrand; }, [selectedBrand]);

  const smoothScrollTo = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    }
    return false;
  };

  const filterByRim = (rim: string, push = true) => {
    setSelectedRim(rim);
    if (push) {
      window.history.pushState({
        path: 'catalogo',
        selectedRim: rim,
        selectedBrand: selectedBrandRef.current
      }, '', '#/catalogo');
      setRouteState({ path: 'catalogo' });
    }
  };

  const filterByBrand = (brand: string, push = true) => {
    setSelectedBrand(brand);
    if (push) {
      window.history.pushState({
        path: 'catalogo',
        selectedRim: selectedRimRef.current,
        selectedBrand: brand
      }, '', '#/catalogo');
      setRouteState({ path: 'catalogo' });
    }
  };

  // Nav helper function that pushes correct browser history
  const navigateTo = (route: AppRoute, productId?: string) => {
    const currentRim = selectedRimRef.current;
    const currentBrand = selectedBrandRef.current;

    if (route === 'marcas') {
      if (routeState.path === 'home') {
        smoothScrollTo('marcas-section');
        window.history.pushState({ path: 'home', hash: 'marcas', selectedRim: currentRim, selectedBrand: currentBrand }, '', '#marcas');
      } else {
        window.history.pushState({ path: 'home', hash: 'marcas', selectedRim: currentRim, selectedBrand: currentBrand }, '', '#marcas');
        setRouteState({ path: 'home' });
        setTimeout(() => smoothScrollTo('marcas-section'), 120);
      }
      return;
    }

    if (route === 'sobre') {
      if (routeState.path === 'home') {
        smoothScrollTo('sobre-section');
        window.history.pushState({ path: 'home', hash: 'sobre', selectedRim: currentRim, selectedBrand: currentBrand }, '', '#sobre');
      } else {
        window.history.pushState({ path: 'home', hash: 'sobre', selectedRim: currentRim, selectedBrand: currentBrand }, '', '#sobre');
        setRouteState({ path: 'home' });
        setTimeout(() => smoothScrollTo('sobre-section'), 120);
      }
      return;
    }

    if (route === 'contato') {
      window.history.pushState({ path: 'contato', selectedRim: currentRim, selectedBrand: currentBrand }, '', '#/contato');
      setRouteState({ path: 'contato' });
      return;
    }

    if (route === 'home') {
      window.history.pushState({ path: 'home', selectedRim: currentRim, selectedBrand: currentBrand }, '', '#/');
      setRouteState({ path: 'home' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (route === 'catalogo') {
      window.history.pushState({ path: 'catalogo', selectedRim: currentRim, selectedBrand: currentBrand }, '', '#/catalogo');
      setRouteState({ path: 'catalogo' });
      return;
    }

    if (route === 'produto' && productId) {
      window.history.pushState({ path: 'produto', productId, selectedRim: currentRim, selectedBrand: currentBrand }, '', `#/produto/${productId}`);
      setRouteState({ path: 'produto', productId });
      return;
    }

    let hash = `#/${route}`;
    window.history.pushState({ path: route, selectedRim: currentRim, selectedBrand: currentBrand }, '', hash);
    setRouteState({ path: route });
  };

  // Setup hash and store listeners on load
  useEffect(() => {
    // Initial state replacement
    const initRoute = parseHash();
    if (!window.history.state) {
      window.history.replaceState({
        path: initRoute.path,
        productId: initRoute.productId,
        selectedRim: selectedRimRef.current,
        selectedBrand: selectedBrandRef.current
      }, '');
    }

    const handleHashChange = () => {
      // Re-parse hash if state POP didn't handle it (for standard external bookmarking/hash URLs)
      const parsed = parseHash();
      setRouteState((prev) => {
        if (prev.path === parsed.path && prev.productId === parsed.productId) return prev;
        return parsed;
      });
    };

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state) {
        setSelectedRim(state.selectedRim || 'Todos');
        setSelectedBrand(state.selectedBrand || 'Todas');
        setRouteState({ path: state.path, productId: state.productId });

        if (state.path === 'home') {
          if (state.hash === 'marcas') {
            setTimeout(() => smoothScrollTo('marcas-section'), 80);
          } else if (state.hash === 'aros') {
            setTimeout(() => smoothScrollTo('aros-section'), 80);
          } else if (state.hash === 'sobre') {
            setTimeout(() => smoothScrollTo('sobre-section'), 80);
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      } else {
        const parsed = parseHash();
        setRouteState(parsed);
      }
    };

    const handleProductsChange = () => {
      setProducts(getProducts());
    };

    const handleBrandsChange = () => {
      setBrands(getBrands());
    };

    const handleRimCardsChange = () => {
      setRimCards(getRimCards());
    };

    // Parse initial hash scrolls
    const initialHash = window.location.hash;
    if (initialHash === '#marcas') {
      setTimeout(() => smoothScrollTo('marcas-section'), 250);
    } else if (initialHash === '#aros') {
      setTimeout(() => smoothScrollTo('aros-section'), 250);
    } else if (initialHash === '#sobre') {
      setTimeout(() => smoothScrollTo('sobre-section'), 250);
    }

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pneu_center_products_updated', handleProductsChange);
    window.addEventListener('pneu_center_brands_updated', handleBrandsChange);
    window.addEventListener('pneu_center_rimcards_updated', handleRimCardsChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pneu_center_products_updated', handleProductsChange);
      window.removeEventListener('pneu_center_brands_updated', handleBrandsChange);
      window.removeEventListener('pneu_center_rimcards_updated', handleRimCardsChange);
    };
  }, []);

  // Guarantee page scrolls back to top during dynamic route shiftings (except on landing page anchor links)
  useEffect(() => {
    const hash = window.location.hash;
    const isSectionHash = ['#marcas', '#aros', '#sobre', '#contato'].includes(hash);
    if (!isSectionHash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [routeState]);

  // Catalog item filtering logic (excludes inactive items)
  const filteredProducts = products.filter((p) => p.active !== false).filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.measure.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBrand = selectedBrand === 'Todas' || product.brand === selectedBrand;

    let matchesRim = true;
    if (selectedRim !== 'Todos') {
      if (selectedRim === 'SUV') {
        matchesRim = product.category === 'SUV e utilitário leve';
      } else {
        const rimNum = parseInt(selectedRim.replace('Aro ', ''));
        matchesRim = product.rim === rimNum;
      }
    }

    const matchesCategory = selectedCategory === 'Todas' || product.category === selectedCategory;

    return matchesSearch && matchesBrand && matchesRim && matchesCategory;
  });

  // Category / Brand sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'marca') {
      return a.brand.localeCompare(b.brand);
    } else if (sortBy === 'medida') {
      return a.measure.localeCompare(b.measure);
    }
    return 0;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRim('Todos');
    setSelectedBrand('Todas');
    setSelectedCategory('Todas');
    setSortBy('marca');
  };

  // Quick navigation shortcut for home featured items
  const handleFeatureTireClick = (id: string) => {
    navigateTo('produto', id);
  };

  return (
    <div id="app-viewport" className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-800 selection:bg-slate-900 selection:text-white">
      
      {/* Header Bar */}
      {routeState.path !== 'paineladmin' && <Navbar currentRoute={routeState.path} onNavigate={navigateTo} />}

      {/* Main Pages Content with dynamic AnimatePresence */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          
          {/* 1. HOME VIEW */}
          {routeState.path === 'home' && (
            <motion.div
              key="home-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* HERO SECTION */}
              <section id="hero-block" className="relative overflow-hidden bg-radial from-slate-900 via-slate-950 to-slate-950 py-16 sm:py-24 border-b border-slate-900">
                {/* Visual grid backdrop styling */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
                  {/* Small tag */}
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3.5 py-1 text-xs font-mono font-medium text-orange-400 border border-orange-500/15">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Catálogo Autorizado de Reposição</span>
                  </div>

                  {/* Main Display Headlines */}
                  <div className="space-y-4 max-w-3xl mx-auto">
                    <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl uppercase">
                      Pneus multimarcas <br className="hidden sm:block" />
                      <span className="text-orange-500">para o seu carro</span>
                    </h1>
                    <p className="text-base text-gray-300 md:text-lg leading-relaxed">
                      Consulte modelos, medidas e disponibilidade com atendimento especializado. A Pneu Center Brasil funciona como catálogo digital de pneus automotivos, com atendimento via WhatsApp para dúvidas, orientações e condições de entrega.
                    </p>
                  </div>

                  {/* Call to Actions buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                    <button
                      id="hero-btn-catalog"
                      onClick={() => navigateTo('catalogo')}
                      className="w-full sm:w-auto rounded-xl bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold px-8 py-4 transition-all hover:shadow-lg hover:shadow-orange-500/10 cursor-pointer font-display"
                    >
                      Consultar Catálogo
                    </button>
                    <button
                      id="hero-btn-whatsapp"
                      onClick={() => openWhatsAppChat(DEFAULT_WHATSAPP_MESSAGE)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-4 transition-all hover:shadow-lg hover:shadow-emerald-500/15 cursor-pointer font-display"
                    >
                      <span>Tirar Dúvidas no WhatsApp</span>
                    </button>
                  </div>

                  {/* Sane disclosure message */}
                  <p className="text-[11px] sm:text-xs text-gray-400 max-w-lg mx-auto font-sans leading-normal">
                    *Site informativo de catálogo. Não realizamos pagamento online, transações virtuais de faturamento ou cobranças antecipadas neste domínio eletrônico.
                  </p>

                  {/* TRUST STRIP */}
                  <div className="pt-8 border-t border-slate-900/85">
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-y-4 gap-x-2 text-center">
                      {[
                        { label: 'Empresa com CNPJ ativo', value: '20.085.983/0001-13', icon: ShieldCheck, iconColor: 'text-orange-500' },
                        { label: 'Atendimento especializado', value: 'Consultores Humanos', icon: Award, iconColor: 'text-blue-400' },
                        { label: 'Pneus automotivos multimarcas', value: 'Passeio & SUV', icon: Wrench, iconColor: 'text-amber-500' },
                        { label: 'Sem checkout online', value: 'Segurança Garantida', icon: CreditCard, iconColor: 'text-emerald-400' },
                        { label: 'Entrega acordada individual', value: 'Sob Consulta', icon: Truck, iconColor: 'text-indigo-400' },
                      ].map((strip, idx) => (
                        <div key={idx} className="p-3 bg-slate-900/30 rounded-xl border border-slate-800/40">
                          <strip.icon className={`h-5 w-5 mx-auto ${strip.iconColor} mb-1.5`} />
                          <span className="block text-[10px] uppercase font-mono tracking-wider text-gray-500">{strip.label}</span>
                          <span className="block text-[11px] font-semibold text-gray-300 font-display mt-0.5">{strip.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </section>

              {/* HOW IT WORKS PREVIEW */}
              <section className="py-16 bg-slate-100/50 font-sans border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-xl mx-auto mb-12">
                    <h2 className="font-sans text-2xl font-black text-slate-800 uppercase tracking-tight">
                      Como funciona o atendimento
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2">
                      Fácil, ágil e seguro. Sem surpresas ou cobranças automáticas.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { step: '1', title: 'Escolha o pneu', desc: 'Navegue pelo catálogo e veja medidas, marcas e especificações.' },
                      { step: '2', title: 'Tire dúvidas', desc: 'Nossa equipe informa disponibilidade, características e condições comerciais.' },
                      { step: '3', title: 'Combine a entrega', desc: 'As condições de entrega são informadas durante o atendimento, conforme região e modelo.' },
                      { step: '4', title: 'Receba e confira', desc: 'O cliente recebe as orientações de entrega e pode conferir o pneu conforme combinado.' },
                    ].map((step, idx) => (
                      <div key={idx} className="relative p-6 rounded-xl border border-slate-200 bg-white shadow-xs">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600 font-sans font-extrabold text-slate-950 mb-3.5">
                          {step.step}
                        </div>
                        <h4 className="font-sans font-bold text-base text-slate-800 mb-1.5 uppercase">{step.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-sans">{step.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 text-center bg-white border border-slate-200 rounded-xl p-5 max-w-3xl mx-auto shadow-xs">
                    <p className="text-xs text-slate-650 leading-relaxed font-medium">
                      O contato pelo WhatsApp não representa compra automática. A confirmação da encomenda, disponibilidade corporal, entrega física e pagamentos válidos são feitos somente conversando com o atendente.
                    </p>
                  </div>
                </div>
              </section>

              {/* BUSQUE POR MARCA */}
              <section id="marcas-section" className="py-16 bg-white border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-xl mx-auto mb-10">
                    <h2 className="font-sans text-2xl font-black text-slate-800 uppercase tracking-tight">
                      Busque pneus por marca
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2 font-sans">
                      Selecione o fabricante de sua preferência para visualizar os modelos disponíveis em nosso catálogo de reposição.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                    {brands.filter(b => b.active).map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => {
                          filterByBrand(brand.name);
                        }}
                        className="group flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-orange-500/5 border border-slate-200 hover:border-orange-500 rounded-2xl w-24 sm:w-28 h-24 sm:h-28 transition-all duration-300 hover:shadow-md cursor-pointer shrink-0"
                      >
                        <div className="h-10 sm:h-12 w-full flex items-center justify-center p-1 overflow-hidden transition-transform group-hover:scale-105 duration-350">
                          {brand.logo ? (
                            <img src={brand.logo} alt={brand.name} className="h-full w-full object-contain" />
                          ) : (
                            <div className="text-xs sm:text-sm font-sans font-black text-slate-400 uppercase tracking-wider">
                              {brand.name.substring(0, 3).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] sm:text-xs font-sans font-bold uppercase text-slate-700 group-hover:text-orange-600 mt-1 sm:mt-1.5 truncate max-w-full">
                          {brand.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* BUSQUE PELO ARO */}
              <section id="aros-section" className="py-16 bg-slate-50 border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-xl mx-auto mb-10">
                    <h2 className="font-sans text-2xl font-black text-slate-800 uppercase tracking-tight">
                      Busque pneus pelo aro
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2 font-sans">
                      Clique no diâmetro do aro do seu veículo para ver instantaneamente a gama de marcas e perfis disponíveis.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                    {rimCards.filter(rc => rc.active).map((card) => (
                      <button
                        key={card.id}
                        onClick={() => {
                          filterByRim(`Aro ${card.rim}`);
                        }}
                        className="group relative h-40 rounded-2xl overflow-hidden border border-slate-200 shadow-sm cursor-pointer hover:shadow-lg transition-all duration-300 flex flex-col justify-end p-4 text-left w-full"
                      >
                        {/* Background Image of standard tire */}
                        <div className="absolute inset-0 z-0 bg-slate-900">
                          {card.image && (
                            <img
                              src={card.image}
                              alt={card.name}
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />
                        </div>

                        {/* Title block */}
                        <div className="relative z-10 font-sans">
                          <span className="block text-orange-500 text-[10px] uppercase font-mono tracking-wider font-extrabold leading-none mb-1">
                            Diâmetro R{card.rim}
                          </span>
                          <h4 className="font-sans font-black text-white text-base sm:text-lg uppercase italic tracking-tight leading-none">
                            {card.name}
                          </h4>
                          <p className="text-[10px] text-slate-300 font-sans leading-tight mt-1 opacity-90 truncate hover:text-white transition-colors">
                            {card.description || `${card.name} de passeio`}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* HIGHLIGHT PRODUCTS */}
              <section className="py-16 sm:py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
                    <div>
                      <h2 className="font-sans text-2xl font-black uppercase text-slate-800 tracking-tight">
                        Pneus em Destaque
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Alguns dos modelos mais procurados no Butantã e em toda São Paulo
                      </p>
                    </div>
                    <button
                      onClick={() => navigateTo('catalogo')}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors uppercase font-sans cursor-pointer"
                    >
                      <span>Ver Catálogo Completo</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Top 4 high profile tires mapping */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {(() => {
                      const featured = products.filter((p) => p.active !== false && p.featured === true);
                      const itemsToRender = featured.length > 0 ? featured.slice(0, 8) : products.filter((p) => p.active !== false).slice(0, 4);
                      return itemsToRender.map((prod) => (
                        <ProductCard
                          key={prod.id}
                          product={prod}
                          onViewDetails={handleFeatureTireClick}
                        />
                      ));
                    })()}
                  </div>
                </div>
              </section>

              {/* SEÇÃO DE CONFIANÇA & SOBRE NÓS INTEGRADO */}
              <section id="sobre-section" className="py-16 bg-white border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    
                    {/* Left text column: Institutional overview */}
                    <div className="lg:col-span-7 space-y-6">
                      <div className="space-y-2">
                        <span className="inline-block text-[11px] font-mono uppercase bg-orange-100 text-orange-700 rounded px-2.5 py-1 font-bold leading-none">
                          CONFIABILIDADE DOCUMENTADA
                        </span>
                        <h2 className="font-sans text-3xl font-black text-slate-800 uppercase tracking-tight leading-tight">
                          Pneu Center Brasil • Distribuição Digital
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 font-sans">
                          Unimos a agilidade das pesquisas do catálogo virtual com a segurança de nossa curadoria técnica individualizada.
                        </p>
                      </div>

                      <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                        <p>
                          A <strong>Pneu Center Brasil</strong> é operada de forma consolidada pela empresa sob razão social de <strong>CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA</strong>, portadora do CNPJ oficial e regularizado <strong>20.085.983/0001-13</strong>. Nossa operação técnica comercial está localizada em sede física estabelecida na Av. Professor Francisco Morato, 2001, no bairro do Butantã, São Paulo - SP.
                        </p>
                        <p>
                          Defendemos uma postura profissional transparente: <strong>não operamos com sistemas robóticos de faturamento direto online</strong>. Ao encontrar um pneu correspondente no catálogo, nosso consultor técnico inicia um contato direto via WhatsApp para garantir que a medida do pneu selecionado atenda perfeitamente o manual do condutor de seu carro, confirmando fisicamente o estoque antes de qualquer cobrança comercial.
                        </p>
                      </div>

                      <div className="border-l-4 border-orange-500 bg-slate-50 p-4 rounded-r-xl border border-slate-200">
                        <p className="text-xs text-slate-750 font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5 font-bold">
                          <ShieldCheck className="h-4.5 w-4.5 text-emerald-650" />
                          Compromisso Antigolpe & Anti-Fraude
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed font-sans">
                          Não solicitamos senhas de acesso, dados sigilosos ou depósitos direcionados a terceiros não homologados em nosso portal. Nossa negociação é transparente do início ao fim com emissão de nota fiscal garantida.
                        </p>
                      </div>
                    </div>

                    {/* Right column: Bento Trust badges */}
                    <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-350 transition-colors flex flex-col justify-between min-h-[140px]">
                        <Building2 className="h-7 w-7 text-orange-600" />
                        <div>
                          <h4 className="font-sans font-extrabold text-sm uppercase text-slate-800 tracking-wider">Razão Social Registrada</h4>
                          <p className="text-[11px] text-slate-500 font-sans leading-tight mt-1">Razão oficial CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA comprovada legalmente.</p>
                        </div>
                      </div>

                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-350 transition-colors flex flex-col justify-between min-h-[140px]">
                        <ShieldCheck className="h-7 w-7 text-emerald-600" />
                        <div>
                          <h4 className="font-sans font-extrabold text-sm uppercase text-slate-800 tracking-wider">Garantia Comercial Integral</h4>
                          <p className="text-[11px] text-slate-500 font-sans leading-tight mt-1">Todos os pneus distribuídos de catálogo possuem cobertura contratual de garantia dos respectivos fabricantes.</p>
                        </div>
                      </div>

                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-350 transition-colors flex flex-col justify-between min-h-[140px]">
                        <UserCheck className="h-7 w-7 text-indigo-600" />
                        <div>
                          <h4 className="font-sans font-extrabold text-sm uppercase text-slate-800 tracking-wider">Atendimento Especializado</h4>
                          <p className="text-[11px] text-slate-500 font-sans leading-tight mt-1">Consultores humanos aptos para orientar sobre índices de velocidade e especificações de carga técnica.</p>
                        </div>
                      </div>

                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-350 transition-colors flex flex-col justify-between min-h-[140px]">
                        <Wrench className="h-7 w-7 text-blue-600" />
                        <div>
                          <h4 className="font-sans font-extrabold text-sm uppercase text-slate-800 tracking-wider">Showroom no Butantã</h4>
                          <p className="text-[11px] text-slate-500 font-sans leading-tight mt-1">Sede moderna e de fácil acesso integrada para logística rápida de retirada por agendamentos.</p>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              </section>

              {/* FAQS SEGMENT */}
              <section className="py-16 sm:py-20 bg-slate-100/50 border-t border-slate-205">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-xl mx-auto mb-12">
                    <h2 className="font-sans text-2xl font-black text-slate-800 uppercase tracking-tight">
                      Respostas Rápidas (FAQ)
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Esclareça as principais dúvidas de nossos clientes antes de chamar no WhatsApp
                    </p>
                  </div>

                  <FAQSection />
                </div>
              </section>
            </motion.div>
          )}

          {/* 2. CATALOGUE VIEW */}
          {routeState.path === 'catalogo' && (
            <motion.div
              key="catalogo-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
            >
              <div className="mb-10 text-center md:text-left">
                <h1 className="font-sans text-3xl font-black text-slate-800 tracking-tight sm:text-4xl uppercase">
                  Catálogo de Pneus Automotivos
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Encontre a medida perfeita para seu carro de passeio ou SUV. Todos com status de "disponibilidade sob consulta".
                </p>
              </div>

              {/* Filter Controls block */}
              <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="font-sans text-sm font-extrabold text-slate-800 tracking-wide uppercase flex items-center gap-1.5 text-orange-600">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtros de Pesquisa
                  </span>
                  
                  <button
                    onClick={resetFilters}
                    className="text-[11px] font-mono text-slate-400 hover:text-slate-800 transition-all uppercase underline underline-offset-3 cursor-pointer font-bold"
                  >
                    Redefinir Tudo
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Search input field */}
                  <div className="md:col-span-4 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Medida do pneu... (Ex: 175/70)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-mono"
                    />
                  </div>

                  {/* Brand select */}
                  <div className="md:col-span-3">
                    <select
                      value={selectedBrand}
                      onChange={(e) => filterByBrand(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-orange-500 transition-all font-sans cursor-pointer"
                    >
                      <option value="Todas">Fabricante: Todos</option>
                      {Array.from(new Set([
                        ...brands.filter(b => b.active).map(b => b.name),
                        ...products.filter(p => p.active !== false).map(p => p.brand)
                      ])).sort().map((br) => (
                        <option key={br} value={br}>{br}</option>
                      ))}
                    </select>
                  </div>

                  {/* Rim size select */}
                  <div className="md:col-span-3">
                    <select
                      value={selectedRim}
                      onChange={(e) => filterByRim(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-orange-500 transition-all font-sans cursor-pointer"
                    >
                      <option value="Todos">Diâmetro: Todos</option>
                      {rimCards.filter(rc => rc.active).map((rc) => (
                        <option key={rc.id} value={`Aro ${rc.rim}`}>{rc.name}</option>
                      ))}
                      <option value="SUV">SUV e utilitários leves</option>
                    </select>
                  </div>

                  {/* Sort Selection dropdown */}
                  <div className="md:col-span-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs sm:text-sm text-amber-700 font-mono outline-none focus:border-orange-500 transition-all cursor-pointer font-bold"
                    >
                      <option value="marca">Ordenar: Marca</option>
                      <option value="medida">Ordenar: Medida</option>
                    </select>
                  </div>
                </div>

                {/* Info summary labels */}
                <div className="pt-2 text-[11px] text-slate-500 font-sans flex flex-wrap items-center gap-1">
                  <span>Filtrando</span>
                  <strong className="text-slate-800 font-bold">{sortedProducts.length}</strong>
                  <span>pneus de</span>
                  <strong className="text-slate-800 font-bold">{products.filter((p) => p.active !== false).length}</strong>
                  <span>cadastrados. Todos destinados a carros de passeio e utilitários urbanos.</span>
                </div>
              </div>

              {/* Catalog Items Listing Grid */}
              {sortedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {sortedProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onViewDetails={(id) => navigateTo('produto', id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-250 bg-white p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400 border border-slate-200">
                    <BadgeHelp className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-sans font-extrabold text-slate-800 text-base uppercase">Nenhum Pneu Localizado</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Não encontramos pneus correspondentes para os filtros selecionados. Lembramos que trabalhamos apenas com pneus de passeio, SUVs e utilitários compactos.
                    </p>
                  </div>
                  <button
                    onClick={resetFilters}
                    className="rounded-lg bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs px-4 py-2 transition-all font-sans cursor-pointer uppercase"
                  >
                    Listar Todos os Pneus
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* 3. PRODUCT DETAILS VIEW */}
          {routeState.path === 'produto' && (
            <div key="produto-detalhes-container">
              {(() => {
                const item = products.find((p) => p.id === routeState.productId);
                if (item) {
                  return (
                    <ProductDetails
                      product={item}
                      onBackToCatalog={() => navigateTo('catalogo')}
                    />
                  );
                } else {
                  // Fallback detail item 404
                  return (
                    <div className="mx-auto max-w-md text-center py-20 px-4 space-y-5">
                      <div className="h-14 w-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200 shadow-xs">
                        <AlertTriangle className="h-8 w-8" />
                      </div>
                      <h2 className="font-sans font-extrabold text-[#0B1B32] text-xl uppercase tracking-tight">Produto Não Encontrado</h2>
                      <p className="text-xs text-slate-500 leading-relaxed font-sans">
                        Desculpe, o pneu solicitado não consta cadastrado em nosso catálogo ou foi descontinuado temporariamente.
                      </p>
                      <button
                        onClick={() => navigateTo('catalogo')}
                        className="rounded-lg bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs px-5 py-2.5 transition-all font-sans cursor-pointer uppercase"
                      >
                        Retornar ao Catálogo
                      </button>
                    </div>
                  );
                }
              })()}
            </div>
          )}

          {/* 4. MARCAS VIEW */}
          {routeState.path === 'marcas' && (
            <motion.div
              key="marcas-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
            >
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h1 className="font-sans text-3xl font-black text-slate-800 sm:text-4xl uppercase tracking-tight">
                  Marcas Disponíveis no Portfólio
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-2">
                  Trabalhamos de forma independente com as maiores marcas globais de pneus, garantindo nota fiscal e segurança técnica.
                </p>
              </div>

              {/* Grid of brand designs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {brands.filter(b => b.active).map((brand) => (
                  <div
                    key={brand.id}
                    onClick={() => {
                      filterByBrand(brand.name);
                    }}
                    className="group rounded-xl border border-slate-200 bg-white p-6 flex flex-col items-center justify-center gap-2 text-center transition-all hover:border-orange-550 hover:bg-slate-50 hover:shadow-md duration-300 cursor-pointer"
                  >
                    {/* Brand Logo Panel */}
                    <div className="h-12 w-20 flex items-center justify-center rounded-lg bg-white border border-slate-150 p-1.5 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                      {brand.logo ? (
                        <img src={brand.logo} alt={brand.name} className="h-full w-full object-contain" />
                      ) : (
                        <div className="text-sm font-black text-slate-400 font-mono">
                          {brand.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="font-sans font-extrabold text-slate-800 text-sm md:text-base group-hover:text-orange-600 transition-colors uppercase mt-1">
                      {brand.name}
                    </span>
                    <span className="font-mono text-[9px] text-slate-400 tracking-wider font-bold">
                      REPOSIÇÃO ORIGINAL
                    </span>
                  </div>
                ))}
              </div>

              {/* Specific Disclaimer requested */}
              <div className="mt-12 rounded-xl bg-slate-50 border border-slate-200 p-6 max-w-3xl mx-auto space-y-2 shadow-xs text-slate-650">
                <p className="text-xs font-extrabold uppercase tracking-wider font-sans text-orange-600">
                  Nota de Esclarecimento sobre Propriedade Industrial
                </p>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  A Pneu Center Brasil é uma revendedora independente de pneus multimarcas. Os nomes, logotipos e marcas citados pertencem de forma integral aos seus respectivos fabricantes multinacionais de origem e legítimos titulares, sendo aqui apresentados pura e exclusivamente para identificação e especificação comercial exata dos produtos disponíveis no catálogo informativo.
                </p>
              </div>
            </motion.div>
          )}

          {/* 5. COMO FUNCIONA VIEW */}
          {routeState.path === 'como-funciona' && (
            <motion.div
              key="como-funciona-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8"
            >
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h1 className="font-sans text-3xl font-black text-slate-800 sm:text-4xl uppercase">
                  Como funciona o atendimento
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-2">
                  Facilitamos seu processo técnico de escolha e entrega, garantindo a ausência de burocracias virtuais.
                </p>
              </div>

              {/* Dynamic steps detailed list */}
              <div className="space-y-8 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
                {[
                  {
                    step: '1',
                    title: 'Escolha o pneu ideal',
                    desc: 'Navegue pelo nosso catálogo digital. Filtrando de forma rápida por aro, fabricante ou medida específica de rodado automotivo de passeio.'
                  },
                  {
                    step: '2',
                    title: 'Tire dúvidas e faça cotação',
                    desc: 'Logo após selecionar o modelo desejado, basta clicar em "Consultar Distribuidor". Você será instantaneamente direcionado para o WhatsApp com um consultor comercial que confirmará o estoque de forma física e tirará suas dúvidas de índices de carga.'
                  },
                  {
                    step: '3',
                    title: 'Combine a entrega de forma direta',
                    desc: 'O preço final do frete local, as transportadoras homologadas para o Butantã e São Paulo, bem como a liberação para retirada física oficial são totalmente coordenadas em atendimento direto.'
                  },
                  {
                    step: '4',
                    title: 'Receba e confira com total segurabilidade',
                    desc: 'Após combinados os prazos, o cliente recebe em sua localidade. Indicamos que confira as vulcanizações e especificações industriais antes de assinar o canhoto.'
                  }
                ].map((st, idx) => (
                  <div key={idx} className="relative flex gap-6 items-start">
                    <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-600 font-sans font-black text-slate-950 text-lg shadow-md shadow-orange-500/5">
                      {st.step}
                    </div>
                    <div className="pl-16 space-y-1">
                      <h3 className="font-sans text-lg font-bold text-slate-800 tracking-tight uppercase">{st.title}</h3>
                      <p className="text-sm text-slate-650 leading-relaxed font-sans">{st.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Direct Warning block */}
              <div className="mt-12 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-xs">
                <p className="text-xs leading-relaxed text-slate-600 font-sans max-w-2xl mx-auto font-medium">
                  <strong className="text-amber-850">IMPORTANTE:</strong> O contato pelo WhatsApp não representa compra automática ou faturamento fiscal imediato. A confirmação da encomenda de pneus, os preços finais oficiais, prazos e métodos de pagamentos válidos são ajustados de maneira individualizada conversando de forma direta.
                </p>
              </div>
            </motion.div>
          )}

          {/* 6. SOBRE NÓS VIEW */}
          {routeState.path === 'sobre' && (
            <motion.div
              key="sobre-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 font-sans"
            >
              <div className="text-center max-w-2xl mx-auto mb-4">
                <h1 className="font-sans text-3xl font-black text-slate-800 sm:text-4xl uppercase">
                  Sobre Nós
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-2">
                  A história e as diretrizes corporativas da Pneu Center Brasil
                </p>
              </div>

              <div className="max-w-none text-sm md:text-base text-slate-650 space-y-5 leading-relaxed font-sans">
                <p>
                  A <strong>Pneu Center Brasil</strong> é o nome comercial da empresa registrada legalmente sob a razão social <strong>CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA</strong>, constituída sob o CNPJ <strong>20.085.983/0001-13</strong>, com sede física estabelecida na Av. Professor Francisco Morato, 2001, Butantã, São Paulo/SP, CEP 05513-200.
                </p>
                
                <p>
                  Atuamos com catálogo online moderno e atendimento técnico humanizado especializado para reposição de pneus automotivos multimarcas, auxiliando motoristas, frotistas e proprietários de veículos na escolha de modelos de pneus perfeitamente compatíveis com as medidas indicadas pelas respectivas montadoras de automóveis.
                </p>

                <p>
                  Diferente de sistemas de e-commerce tradicionais suscetíveis a inconsistências de estoque físicos e custos adicionais imprevistos de entrega interestaduais, nós optamos e defendemos um canal comercial direto e humanizado por WhatsApp.
                </p>

                <p className="border-l-4 border-orange-500 bg-white border border-slate-200 p-5 rounded-r-xl text-slate-650 shadow-xs">
                  Nosso site tem finalidade estritamente informativa de catálogo digital e facilita o contato inicial rápido com a equipe comercial. Não realizamos checkout eletrônico neste domínio, não solicitamos dados financeiros dos usuários pelo ar de nosso site e não efetuamos cobranças antecipadas em ambiente virtual.
                </p>
              </div>

              {/* Dynamic highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {[
                  { title: 'Revenda Independente', desc: 'Ampla gama de pneus Pirelli, Michelin, Goodyear, Bridgestone, Continental, Dunlop...', icon: Building2 },
                  { title: 'Butantã / São Paulo', desc: 'Atendimento estendido para facilitade logística imediata de retirada na capital paulista.', icon: Wrench },
                  { title: 'Privacidade Total', desc: 'Livre de cookies invasivos ou requisição abusiva de faturas de crédito no ambiente web.', icon: FolderLock },
                ].map((item, id) => (
                  <div key={id} className="p-6 rounded-xl border border-slate-200 bg-white space-y-2 shadow-xs">
                    <item.icon className="h-6 w-6 text-orange-600" />
                    <h4 className="font-sans font-extrabold text-slate-800 text-sm uppercase">{item.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 7. CONTATO VIEW */}
          {routeState.path === 'contato' && (
            <motion.div
              key="contato-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
            >
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h1 className="font-sans text-3xl font-black text-slate-800 sm:text-4xl uppercase">
                  Fale com a Pneu Center Brasil
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 font-sans">
                  Obtenha cotações completas de pneus de reposição, agende sua retirada jurídica ou consulte fretes regionais rápidos.
                </p>
              </div>

              {/* Dynamic Contact form layout */}
              <ContactForm />
            </motion.div>
          )}

          {/* 8. POLICIES ROUTES VIEWS */}
          {routeState.path === 'politica-privacidade' && (
            <PrivacyPolicy key="privacy" onBackToHome={() => navigateTo('home')} onNavigate={navigateTo} />
          )}

          {/* 9. TERMS VIEW */}
          {routeState.path === 'termos-uso' && (
            <TermsOfUse key="terms" onBackToHome={() => navigateTo('home')} onNavigate={navigateTo} />
          )}

          {/* 10. SHIPPING RULES VIEW */}
          {routeState.path === 'politica-entrega' && (
            <ShippingPolicy key="delivery" onBackToHome={() => navigateTo('home')} onNavigate={navigateTo} />
          )}

          {/* 11. EXCHANGES / RETURNS VIEW */}
          {routeState.path === 'politica-trocas' && (
            <ReturnsPolicy key="exchanges" onBackToHome={() => navigateTo('home')} onNavigate={navigateTo} />
          )}

          {/* 12. ADMIN PANEL VIEW */}
          {routeState.path === 'paineladmin' && (
            <AdminPanel key="admin-panel" onBackToHome={() => navigateTo('home')} />
          )}

        </AnimatePresence>
      </main>

      {/* Footer block */}
      {routeState.path !== 'paineladmin' && <Footer onNavigate={navigateTo} />}

    </div>
  );
}
