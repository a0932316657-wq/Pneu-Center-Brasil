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
  AlertTriangle,
  FileText,
  MessageSquare,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Newly generated hero tire stack image asset
import heroTiresImage from './assets/images/hero_tires_1780836675879.png';

// Shared types and data
import { AppRoute, RouteState, Product } from './types';
import { BRANDS } from './data';
import { 
  getProducts, 
  getBrands, 
  getRimCards, 
  getSettings, 
  Brand, 
  RimCard, 
  getCatalogHash, 
  parseCatalogHash, 
  normalizeMeasure, 
  buildCatalogUrl, 
  parseCatalogUrl, 
  slugify,
  syncFromSupabase,
  fetchRimDefaultMediaDb,
  fetchRimInmetroSealsDb,
  isSyncedWithSupabase
} from './lib/appStore';

// Custom components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { MediaRenderer } from './components/MediaRenderer';
import ProductCard from './components/ProductCard';
import ProductDetails from './components/ProductDetails';
import ContactForm from './components/ContactForm';
import FAQSection from './components/FAQSection';
import AdminPanel from './components/AdminPanel';
import { 
  PrivacyPolicy, 
  TermsOfUse, 
  ShippingPolicy, 
  ReturnsPolicy,
  WarrantyPolicy
} from './components/Policies';
import { TrackingPage } from './components/TrackingPage';

// WhatsApp direct messenger
import { openWhatsAppChat, DEFAULT_WHATSAPP_MESSAGE, getProductMessage } from './lib/whatsapp';

function isVideoUrl(url: string | undefined): boolean {
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
    lowercase.endsWith('.quicktime') ||
    url.toLowerCase().includes('video/mp4') ||
    url.toLowerCase().includes('video/webm') ||
    url.toLowerCase().includes('video/ogg') ||
    url.toLowerCase().includes('video/quicktime')
  );
}

// Parse path hash to support standard browser hist back/forward actions
function parseHash(): RouteState {
  const hash = window.location.hash;
  
  if (!hash || hash === '#/' || hash === '#/home' || hash === '#home') {
    return { path: 'home' };
  }
  
  if (hash.startsWith('#/produto/')) {
    const id = hash.replace('#/produto/', '');
    return { path: 'produto', productId: id };
  }

  if (hash.startsWith('#/product/')) {
    const id = hash.replace('#/product/', '');
    return { path: 'produto', productId: id };
  }

  if (hash.startsWith('#/catalogo')) {
    return { path: 'catalogo' };
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
    'rastreamento',
    'politica-privacidade',
    'termos-uso',
    'politica-envio',
    'politica-entrega',
    'politica-trocas',
    'politica-garantia',
    'paineladmin'
  ];

  if (validPaths.includes(pathPart)) {
    return { path: pathPart };
  }

  return { path: 'home' };
}

export default function App() {
  const [routeState, setRouteState] = useState<RouteState>(parseHash);
  const [isLoadingProducts, setIsLoadingProducts] = useState(!isSyncedWithSupabase());
  const [productsLoaded, setProductsLoaded] = useState(isSyncedWithSupabase());
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [brands, setBrands] = useState<Brand[]>(getBrands());
  const [rimCards, setRimCards] = useState<RimCard[]>(getRimCards());
  const [siteSettings, setSiteSettings] = useState(getSettings());

  const refreshStoreData = () => {
    setProducts(getProducts());
    setBrands(getBrands());
    setRimCards(getRimCards());
    setSiteSettings(getSettings());
  };
  
  // Minute counter to tick and auto-refresh the hourly rotate list and countdown
  const [minutesCounter, setMinutesCounter] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setMinutesCounter(prev => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Deterministically selects 8 products that rotate every hour
  const getHourlyFeaturedProducts = () => {
    const activeProducts = products.filter(p => p.active !== false);
    if (activeProducts.length === 0) return { list1: [], list2: [] };

    // Get current hour index from epoch
    const hourIndex = Math.floor(Date.now() / (3600 * 1000));

    const selected: Product[] = [];
    const tempActive = [...activeProducts];

    // Select 8 unique products using deterministic LCG-like jump selection
    for (let i = 0; i < 8; i++) {
      if (tempActive.length === 0) break;
      const pickIndex = (hourIndex + i * 3) % tempActive.length;
      selected.push(tempActive[pickIndex]);
      tempActive.splice(pickIndex, 1);
    }

    // In case we don't have enough to fill 8, repeat active list items safely
    while (selected.length < 8 && activeProducts.length > 0) {
      selected.push(activeProducts[selected.length % activeProducts.length]);
    }

    return {
      list1: selected.slice(0, 4),
      list2: selected.slice(4, 8)
    };
  };

  const hourlyFeatured = getHourlyFeaturedProducts();

  // Filter & Search states for the Catalog Page
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRim, setSelectedRim] = useState('Todos');
  const [selectedBrand, setSelectedBrand] = useState('Todas');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedMeasure, setSelectedMeasure] = useState('');
  const [showFilterNotice, setShowFilterNotice] = useState(false);
  const [sortBy, setSortBy] = useState('marca');

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
      const newHash = buildCatalogUrl({ rim, brand: selectedBrand, measure: selectedMeasure, search: searchQuery });
      window.location.hash = newHash;
      setRouteState({ path: 'catalogo' });
    }
  };

  const filterByBrand = (brand: string, push = true) => {
    setSelectedBrand(brand);
    if (push) {
      const newHash = buildCatalogUrl({ rim: selectedRim, brand, measure: selectedMeasure, search: searchQuery });
      window.location.hash = newHash;
      setRouteState({ path: 'catalogo' });
    }
  };

  const filterByMeasure = (measure: string, push = true) => {
    setSelectedMeasure(measure);
    if (push) {
      const newHash = buildCatalogUrl({ rim: selectedRim, brand: selectedBrand, measure, search: searchQuery });
      window.location.hash = newHash;
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
      const newHash = getCatalogHash(currentRim, currentBrand, selectedMeasure);
      window.history.pushState({ path: 'catalogo', selectedRim: currentRim, selectedBrand: currentBrand, selectedMeasure }, '', newHash);
      setRouteState({ path: 'catalogo' });
      return;
    }

    if (route === 'produto' && productId) {
      const match = products.find(p => p.id === productId || p.slug === productId);
      const targetParam = (match && match.slug) ? match.slug : productId;
      window.history.pushState({ path: 'produto', productId: targetParam, selectedRim: currentRim, selectedBrand: currentBrand }, '', `#/produto/${targetParam}`);
      setRouteState({ path: 'produto', productId: targetParam });
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

    const handleSettingsChange = () => {
      setSiteSettings(getSettings());
    };

    const handleRimDefaultMediaChange = () => {
      refreshStoreData();
    };

    const handleRimInmetroSealsChange = () => {
      refreshStoreData();
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

    // Handle loading states
    if (isSyncedWithSupabase()) {
      setIsLoadingProducts(false);
      setProductsLoaded(true);
    }

    const handleSyncComplete = () => {
      setIsLoadingProducts(false);
      setProductsLoaded(true);
      refreshStoreData();
    };

    // Defensive fallback timeout: If fetching is incredibly slow or offline, resolve to false after 4s
    const fallbackTimer = setTimeout(() => {
      setIsLoadingProducts(false);
      setProductsLoaded(true);
      refreshStoreData();
    }, 4500);

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pneu_center_products_updated', handleProductsChange);
    window.addEventListener('pneu_center_brands_updated', handleBrandsChange);
    window.addEventListener('pneu_center_rimcards_updated', handleRimCardsChange);
    window.addEventListener('pneu_center_settings_updated', handleSettingsChange);
    window.addEventListener('pneu_center_rim_default_media_updated', handleRimDefaultMediaChange);
    window.addEventListener('pneu_center_rim_inmetro_seals_updated', handleRimInmetroSealsChange);
    window.addEventListener('pneu_center_sync_completed', handleSyncComplete);
    
    // Securely pull data on start from Supabase so any browser on any device is updated instantaneously
    syncFromSupabase().catch(err => console.warn('Supabase sync error on mount:', err));
    fetchRimDefaultMediaDb().catch(err => console.warn('Rim default media sync error on mount:', err));
    fetchRimInmetroSealsDb().catch(err => console.warn('Rim inmetro seals sync error on mount:', err));

    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pneu_center_products_updated', handleProductsChange);
      window.removeEventListener('pneu_center_brands_updated', handleBrandsChange);
      window.removeEventListener('pneu_center_rimcards_updated', handleRimCardsChange);
      window.removeEventListener('pneu_center_settings_updated', handleSettingsChange);
      window.removeEventListener('pneu_center_rim_default_media_updated', handleRimDefaultMediaChange);
      window.removeEventListener('pneu_center_rim_inmetro_seals_updated', handleRimInmetroSealsChange);
      window.removeEventListener('pneu_center_sync_completed', handleSyncComplete);
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

  // Coordenador de Url Filtros do Catalogo
  useEffect(() => {
    const handleUrlFiltersSync = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/catalogo')) {
        const { rim, brand, measure, search } = parseCatalogUrl(hash, brands);
        setSelectedRim(rim || 'Todos');
        setSelectedBrand(brand || 'Todas');
        setSelectedMeasure(measure || '');
        if (search !== undefined) {
          setSearchQuery(search);
        }
        
        // Ativar aviso de filtro se houver algum filtro ativo
        if (rim !== 'Todos' || brand !== 'Todas' || measure !== '' || (search && search.trim() !== '')) {
          setShowFilterNotice(true);
        } else {
          setShowFilterNotice(false);
        }
      } else {
        setShowFilterNotice(false);
      }
    };

    handleUrlFiltersSync();

    window.addEventListener('hashchange', handleUrlFiltersSync);
    return () => {
      window.removeEventListener('hashchange', handleUrlFiltersSync);
    };
  }, [brands]);

  // Synchronize searchQuery with hash silently using replaceState (avoiding history pollution)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#/catalogo')) {
      const { search } = parseCatalogUrl(hash, brands);
      if (search !== searchQuery) {
        const newHash = buildCatalogUrl({
          rim: selectedRim,
          brand: selectedBrand,
          measure: selectedMeasure,
          search: searchQuery
        });
        window.history.replaceState(window.history.state, '', newHash);
      }
    }
  }, [searchQuery, selectedRim, selectedBrand, selectedMeasure, brands]);

  // Redirecionamento UUID para Slug Amigavel e rota /product para /produto
  useEffect(() => {
    if (routeState.path === 'produto' && routeState.productId && products.length > 0) {
      const productId = routeState.productId;
      const hash = window.location.hash;
      const isOldRoute = hash.startsWith('#/product/');

      const matchById = products.find(p => p.id === productId);
      const matchBySlug = products.find(p => (p.slug || slugify(p.name)) === productId);
      const match = matchById || matchBySlug;

      if (match) {
        const targetSlug = match.slug || slugify(match.name);
        if (productId === match.id || isOldRoute) {
          window.history.replaceState({
            path: 'produto',
            productId: targetSlug,
            selectedRim,
            selectedBrand
          }, '', `#/produto/${targetSlug}`);
          setRouteState({ path: 'produto', productId: targetSlug });
        }
      }
    }
  }, [routeState, products, selectedRim, selectedBrand]);

  // Catalog item filtering logic (excludes inactive items)
  const filteredProducts = products.filter((p) => p.active !== false).filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.measure.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBrand = selectedBrand === 'Todas' || product.brand.trim().toLowerCase() === selectedBrand.trim().toLowerCase();

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

    const matchesMeasure = !selectedMeasure || normalizeMeasure(product.measure) === selectedMeasure;

    return matchesSearch && matchesBrand && matchesRim && matchesCategory && matchesMeasure;
  });

  // Category / Brand sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'marca') {
      return a.brand.localeCompare(b.brand);
    } else if (sortBy === 'medida') {
      return a.measure.localeCompare(b.measure);
    } else if (sortBy === 'preco_asc') {
      const aHasPrice = a.priceStatus === 'exibir' && a.price !== undefined && a.price > 0;
      const bHasPrice = b.priceStatus === 'exibir' && b.price !== undefined && b.price > 0;
      if (aHasPrice && bHasPrice) {
        return (a.price || 0) - (b.price || 0);
      }
      if (aHasPrice) return -1;
      if (bHasPrice) return 1;
      return a.brand.localeCompare(b.brand);
    } else if (sortBy === 'preco_desc') {
      const aHasPrice = a.priceStatus === 'exibir' && a.price !== undefined && a.price > 0;
      const bHasPrice = b.priceStatus === 'exibir' && b.price !== undefined && b.price > 0;
      if (aHasPrice && bHasPrice) {
        return (b.price || 0) - (a.price || 0);
      }
      if (aHasPrice) return -1;
      if (bHasPrice) return 1;
      return a.brand.localeCompare(b.brand);
    }
    return 0;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRim('Todos');
    setSelectedBrand('Todas');
    setSelectedCategory('Todas');
    setSelectedMeasure('');
    setShowFilterNotice(false);
    setSortBy('marca');
    
    window.location.hash = '#/catalogo';
    setRouteState({ path: 'catalogo' });
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
            >              {/* HERO SECTION */}
              <section id="hero-block" className="relative overflow-hidden bg-radial from-slate-900 via-slate-950 to-slate-950 py-16 sm:py-24 border-b border-slate-900">
                {/* Visual grid backdrop styling */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
                  
                  {/* Two-Column Responsive Split Layout with Text on Left and Animation on Right */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-center lg:text-left">
                    
                    {/* LEFT COLUMN: HERO CONTENT WITH DISPLAY HEADLINES, COUNTERS & CTAS */}
                    <div className="lg:col-span-7 flex flex-col space-y-6 lg:items-start lg:text-left order-1 lg:order-1">
                      {/* Small tag */}
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3.5 py-1 text-xs font-mono font-medium text-orange-400 border border-orange-500/15 mx-auto lg:mx-0">
                        <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                        <span>Catálogo de Pneus Multimarcas</span>
                      </div>

                      {/* Main Display Headlines */}
                      <div className="space-y-4">
                        <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl uppercase leading-none">
                          Pneus multimarcas <br className="hidden sm:block" />
                          <span className="text-orange-500">para carro, SUV e utilitários leves</span>
                        </h1>
                        <p className="text-sm text-gray-300 md:text-base leading-relaxed max-w-2xl">
                          Consulte pneus por medida, aro e marca. A Pneu Center Brasil funciona como catálogo informativo, com atendimento humano via WhatsApp para confirmar disponibilidade, condições comerciais, entrega e formas de pagamento.
                        </p>
                      </div>

                      {/* Dynamic Product Counter display badge */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 bg-orange-500/10 hover:bg-orange-500/15 border border-orange-500/20 rounded-2xl p-4 sm:p-5 w-full max-w-xl shadow-sm transition-all duration-300 text-center sm:text-left mx-auto lg:mx-0">
                        <div className="flex items-center justify-center bg-orange-600 font-display font-black text-slate-950 text-xl sm:text-2xl h-11 w-11 rounded-xl shrink-0 shadow-md animate-pulse">
                          {products.filter(p => p.active !== false).length}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-sans font-bold text-white uppercase tracking-wide">
                            Modelos Disponíveis para Cotação
                          </p>
                          <p className="text-[11px] sm:text-xs text-slate-300 font-sans mt-0.5 leading-tight">
                            Consulte cotações gratuitas de mais de <span className="font-extrabold text-orange-500">{products.filter(p => p.active !== false).length}</span> modelos de pneus cadastrados em nosso catálogo de reposição.
                          </p>
                        </div>
                      </div>

                      {/* Call to Actions buttons */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md mx-auto lg:mx-0">
                        <button
                          id="hero-btn-catalog"
                          onClick={() => navigateTo('catalogo')}
                          className="w-full sm:w-auto rounded-xl bg-orange-600 hover:bg-orange-550 text-slate-950 font-bold px-8 py-4 transition-all hover:shadow-lg hover:shadow-orange-500/15 cursor-pointer font-display uppercase tracking-wide text-xs whitespace-nowrap"
                        >
                          Consultar pneus
                        </button>
                        <button
                          id="hero-btn-whatsapp"
                          onClick={() => openWhatsAppChat(DEFAULT_WHATSAPP_MESSAGE)}
                          className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-555 text-white font-semibold px-8 py-4 transition-all hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer font-display uppercase tracking-wide text-xs whitespace-nowrap"
                        >
                          <span>Falar com atendimento</span>
                        </button>
                      </div>

                      {/* Small notice near buttons */}
                      <p className="text-[10px] text-gray-400 font-sans leading-relaxed text-center lg:text-left max-w-md border-t border-slate-900/60 pt-2 shrink-0">
                        Este site não realiza pagamento online, checkout, carrinho de compras ou venda automática. As informações comerciais são confirmadas diretamente no atendimento.
                      </p>
                    </div>

                    {/* RIGHT COLUMN: GORGEOUS ANIMATED TIRE WITH CIRCULATING BRANDS */}
                    <div className="lg:col-span-5 flex flex-col items-center justify-center relative order-2 lg:order-2">
                       <div className="relative w-full max-w-sm sm:max-w-md h-72 sm:h-96 flex items-center justify-center overflow-visible">
                        
                        {/* Radiant background glow behind the tire */}
                        <div className="absolute h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-orange-500/10 blur-3xl z-0" />
                        
                        {/* Orbiting brand cards - Only logos, appearing and disappearing */}
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
                            
                            // Generate keys for continuous beautiful 3D-circular path around the tire
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
                              
                              // Horizontal & Vertical perspectives
                              xArr.push(cosAngle * 135);
                              yArr.push(sinAngle * 45);
                              
                              // Scale perspective: larger on front, smaller on back
                              const scale = 0.85 + sinAngle * 0.25;
                              scaleArr.push(scale);
                              
                              // Opacity transitions: goes behind -> disappears ("some"), goes front -> shines ("aparece")
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
                                {brand.logo && brand.logo.trim() ? (
                                  <div className="h-6 w-9 rounded-lg bg-white overflow-hidden flex items-center justify-center p-0.5">
                                    <img src={brand.logo.trim() || null} alt={brand.name} className="h-full w-full object-contain" />
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

                        {/* Central Floating/Hovering Premium Tire Card with customized neon LED border and glow */}
                        {(() => {
                          const borderClr = siteSettings.heroBorderColor || '#f97316';
                          const glowClr = siteSettings.heroGlowColor || '#f97316';
                          const bRad = `${siteSettings.heroBorderRadius || 24}px`;
                          const gIntensity = parseFloat(siteSettings.heroGlowIntensity || '0.4');
                          const hasCustomHero = siteSettings.heroImageUrl && siteSettings.heroImageUrl.trim() !== '';
                          const activeHeroUrl = hasCustomHero ? siteSettings.heroImageUrl : heroTiresImage;
                          const isCustomVideo = hasCustomHero && (siteSettings.heroMediaType === 'video' || isVideoUrl(siteSettings.heroImageUrl));

                          return (
                            <motion.div
                              animate={{
                                y: [0, -12, 0],
                                rotate: [0, 0.5, -0.5, 0],
                              }}
                              transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              className="z-10 bg-slate-950/70 backdrop-blur-md inline-block relative shrink-0 transition-all duration-300 select-none pointer-events-none"
                              style={{
                                padding: hasCustomHero ? '0px' : '20px',
                                borderRadius: bRad,
                                border: `1px solid ${borderClr}`,
                                boxShadow: `0 0 ${18 * gIntensity}px ${borderClr}, inset 0 0 ${10 * gIntensity}px ${borderClr}, 0 0 ${35 * gIntensity}px ${glowClr}`
                              }}
                            >
                              {isCustomVideo ? (
                                <video
                                  src={activeHeroUrl}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  className="h-52 sm:h-72 w-auto object-contain select-none pointer-events-none block animate-fade-in"
                                  style={{
                                    borderRadius: bRad,
                                  }}
                                />
                              ) : (
                                <img
                                  src={activeHeroUrl}
                                  alt="Destaque Pneu Center Brasil"
                                  referrerPolicy="no-referrer"
                                  className="h-52 sm:h-72 w-auto object-contain select-none pointer-events-none block animate-fade-in"
                                  style={{
                                    borderRadius: bRad,
                                    mixBlendMode: hasCustomHero ? 'normal' : 'lighten'
                                  }}
                                />
                              )}
                            </motion.div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                                {/* HIGHLY OPTIMIZED TRUST BANNER (COMPLIANT AND INFORMATION-CENTRIC) */}
                  <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-900/60">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                      
                      {/* CARD 1: CATÁLOGO INFORMATIVO */}
                      <div className="bg-orange-950/40 border-2 border-orange-500/80 rounded-2xl p-5 flex flex-col justify-between hover:bg-orange-950/60 transition-all shadow-lg shadow-orange-500/15">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="p-2 rounded-lg bg-orange-500/20 text-orange-400 shrink-0 border border-orange-500/30">
                            <Sparkles className="h-5 w-5 text-orange-400" />
                          </span>
                          <span className="text-[11px] sm:text-xs font-sans font-black text-orange-400 uppercase tracking-widest">
                            Catálogo Técnico
                          </span>
                        </div>
                        <div>
                          <h4 className="font-sans font-black text-white text-base uppercase leading-tight tracking-tight">
                            Catálogo informativo
                          </h4>
                          <p className="text-sm font-medium text-slate-200 font-sans mt-2.5 leading-relaxed">
                            Consulte modelos, medidas e marcas disponíveis antes de falar com nosso atendimento técnico especializado.
                          </p>
                        </div>
                      </div>
 
                      {/* CARD 2: ATENDIMENTO HUMANO */}
                      <div className="bg-emerald-950/40 border-2 border-emerald-500/80 rounded-2xl p-5 flex flex-col justify-between hover:bg-emerald-950/60 transition-all shadow-lg shadow-emerald-500/15">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 border border-emerald-500/30">
                            <HelpCircle className="h-5 w-5 text-emerald-400" />
                          </span>
                          <span className="text-[11px] sm:text-xs font-sans font-black text-emerald-400 uppercase tracking-widest">
                            Falar no WhatsApp
                          </span>
                        </div>
                        <div>
                          <h4 className="font-sans font-black text-white text-base uppercase leading-tight tracking-tight">
                            Atendimento humano
                          </h4>
                          <p className="text-sm font-medium text-slate-200 font-sans mt-2.5 leading-relaxed">
                            Dúvidas sobre medidas, disponibilidade, entrega e pagamento são tratadas de forma humana diretamente pelo WhatsApp.
                          </p>
                        </div>
                      </div>
 
                      {/* CARD 3: EMPRESA IDENTIFICADA */}
                      <div className="bg-amber-950/40 border-2 border-amber-500/80 rounded-2xl p-5 flex flex-col justify-between hover:bg-amber-950/60 transition-all shadow-lg shadow-amber-500/15">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="p-2 rounded-lg bg-amber-500/20 text-amber-500 shrink-0 border border-amber-500/30">
                            <Building2 className="h-5 w-5 text-amber-400" />
                          </span>
                          <span className="text-[11px] sm:text-xs font-sans font-black text-amber-400 uppercase tracking-widest">
                            Transparência Total
                          </span>
                        </div>
                        <div>
                          <h4 className="font-sans font-black text-white text-base uppercase leading-tight tracking-tight">
                            Empresa identificada
                          </h4>
                          <p className="text-sm font-medium text-slate-200 font-sans mt-2.5 leading-relaxed">
                            Informações completas de razão social, CNPJ ativo, endereço real, telefone e e-mail disponíveis publicamente no site.
                          </p>
                        </div>
                      </div>
 
                      {/* CARD 4: SEM CHECKOUT ONLINE */}
                      <div className="bg-sky-950/40 border-2 border-sky-400 rounded-2xl p-5 flex flex-col justify-between hover:bg-sky-950/60 transition-all shadow-lg shadow-sky-400/15">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="p-2 rounded-lg bg-sky-500/20 text-sky-400 shrink-0 border border-sky-500/30">
                            <CreditCard className="h-5 w-5 text-sky-400" />
                          </span>
                          <span className="text-[11px] sm:text-xs font-sans font-black text-sky-400 uppercase tracking-widest">
                            Sem Pagamento Web
                          </span>
                        </div>
                        <div>
                          <h4 className="font-sans font-black text-white text-base uppercase leading-tight tracking-tight">
                            Sem checkout online
                          </h4>
                          <p className="text-sm font-medium text-slate-200 font-sans mt-2.5 leading-relaxed">
                            O site não solicita cartão, senhas, dados bancários ou pagamentos dentro da plataforma. Segurança digital preservada.
                          </p>
                        </div>
                      </div>
 
                    </div>
                  </div>
 
                  {/* Sane disclosure message */}
                   <p className="text-[11px] sm:text-xs text-gray-400 max-w-xl mx-auto font-sans leading-normal text-center">
                     *A Pneu Center Brasil atua como catálogo informativo de pneus multimarcas. Todas as informações comerciais são validadas de forma manual e individual no atendimento humano via WhatsApp.*
                   </p>

                   {/* TRUST STRIP */}
                  <div className="pt-8 border-t border-slate-900/85">
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-y-4 gap-x-2 text-center">
                      {[
                        { label: 'Empresa com CNPJ ativo', value: '20.085.983/0001-13', icon: ShieldCheck, iconColor: 'text-orange-500' },
                        { label: 'Atendimento especializado', value: 'Consultores Humanos', icon: Award, iconColor: 'text-blue-400' },
                        { label: 'Pneus automotivos multimarcas', value: 'Passeio & SUV', icon: Wrench, iconColor: 'text-amber-500' },
                        { label: 'Sem checkout online', value: 'Consulta Segura', icon: CreditCard, iconColor: 'text-emerald-400' },
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

              {/* AVISO DE TRANSPARÊNCIA ABAIXO DO HERO */}
              <section className="bg-amber-50 border-b border-amber-200/80 py-5 font-sans">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
                    <div className="rounded-full bg-amber-100 p-2 text-amber-800 shrink-0 border border-amber-200/60 shadow-xs">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 font-extrabold max-w-4xl tracking-tight leading-relaxed">
                      <span className="text-amber-700 bg-amber-100/60 px-1.5 py-0.5 rounded font-black mr-1 uppercase">AVISO:</span> Trabalhamos com pneus novos multimarcas. Todos os produtos possuem procedência, nota fiscal e garantia conforme política da empresa. Confirme disponibilidade, medida, entrega e condições comerciais no atendimento.
                    </p>
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
                      { step: '1', title: 'Consulte o catálogo', desc: 'Veja os pneus disponíveis no site por medida, aro e marca.' },
                      { step: '2', title: 'Inicie o contato', desc: 'Clique para falar com nossa equipe pelo WhatsApp no modelo de sua escolha.' },
                      { step: '3', title: 'Confirme as condições', desc: 'Confirmamos o estoque físico, preço do dia, custos e prazos de transporte.' },
                      { step: '4', title: 'Conclua sua cotação', desc: 'Sem transações digitais no site. Todas as cotações e combinações são concluídas diretamente no atendimento.' },
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
                    <p className="text-xs text-slate-650 leading-relaxed font-bold">
                      Este site é estritamente um catálogo de pneus multimarcas independente. Não comercializamos produtos diretamente por checkout, carrinho ou cobranças automáticas neste domínio. Todas as encomendas necessitam de atendimento humano.
                    </p>
                  </div>
                </div>
              </section>

              {/* SEÇÃO "GARANTIA E PROCEDÊNCIA" */}
              <section className="py-16 bg-white font-sans border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-xl mx-auto mb-12">
                    <h2 className="font-sans text-2xl font-black text-slate-800 uppercase tracking-tight">
                      Garantia, Procedência & Segurança
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2">
                      Nosso catálogo e processos de atendimento são estruturados para garantir sua total segurança jurídica e clareza comercial.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      {
                        title: 'Garantia conforme o fabricante',
                        desc: 'Todos os pneus comercializados (como Pirelli, Goodyear, Continental, Michelin, Dunlop e Hankook) possuem garantia legal de fabricação regulamentada pelas respectivas marcas conforme as especificações fiscais de compra.',
                        icon: Award,
                        color: 'text-orange-600 bg-orange-50 border-orange-100'
                      },
                      {
                        title: 'Nota fiscal eletrônica (NF-e)',
                        desc: 'Emitimos Nota Fiscal Eletrônica em 100% de nossas operações de fornecimento de pneus, garantindo procedência fiscal completa e segurança legal para pessoa física ou jurídica.',
                        icon: FileText,
                        color: 'text-blue-600 bg-blue-50 border-blue-100'
                      },
                      {
                        title: 'Procedência Confiável',
                        desc: 'Revendemos exclusivamente pneus novos multimarcas originais de distribuidores autorizados. Não comercializamos pneus remold, reformados, recapeados ou de origem usada.',
                        icon: ShieldCheck,
                        color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
                      },
                      {
                        title: 'Atendimento Especializado',
                        desc: 'Nossa equipe técnica comercial auxilia você de forma humanizada a esclarecer dúvidas de especificações, marcas ideais e compatibilidade dos índices de carga/velocidade para seu veículo.',
                        icon: MessageSquare,
                        color: 'text-purple-600 bg-purple-50 border-purple-100'
                      },
                      {
                        title: 'Acompanhamento do Envio',
                        desc: 'As remessas contam com suporte logístico qualificado e acompanhamento por canais oficiais de contato para que você saiba exatamente o status físico de sua entrega.',
                        icon: Truck,
                        color: 'text-indigo-600 bg-indigo-50 border-indigo-100'
                      },
                      {
                        title: 'Empresa Identificada & Sede',
                        desc: 'Pneu Center Brasil é um nome comercial legítimo operado pela razão social CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA, CNPJ 20.085.983/0001-13 com endereço real de operação física em São Paulo - SP.',
                        icon: Building2,
                        color: 'text-rose-600 bg-rose-50 border-rose-100'
                      }
                    ].map((card, idx) => {
                      const Icon = card.icon;
                      return (
                        <div key={idx} className="flex flex-col justify-between p-6 border border-slate-200 rounded-2xl hover:border-slate-300 hover:bg-slate-50/50 transition-all duration-300">
                          <div>
                            <div className={`inline-flex rounded-xl p-3 border ${card.color} mb-4`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <h4 className="font-sans font-extrabold text-sm uppercase text-slate-800 tracking-wider mb-2">
                              {card.title}
                            </h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-sans">
                              {card.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
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
                          {brand.logo && brand.logo.trim() ? (
                            <img src={brand.logo.trim() || null} alt={brand.name} className="h-full w-full object-contain" />
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

              {/* FEATURED BANNER EXTRA */}
              {siteSettings.featuredMediaUrl && siteSettings.featuredMediaUrl.trim() !== '' && (
                <section id="banner-destaque-home" className="py-12 bg-slate-100/30 border-b border-slate-200">
                  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="group relative h-48 sm:h-64 rounded-3xl overflow-hidden border border-slate-200/80 hover:border-orange-500/50 hover:shadow-2xl transition-all duration-300 shadow-lg flex flex-col justify-end p-6 sm:p-8 text-left bg-slate-900"
                    >
                      {/* Background Visual Banner */}
                      <div className="absolute inset-0 z-0">
                        <MediaRenderer
                          src={siteSettings.featuredMediaUrl}
                          mediaType={siteSettings.featuredMediaType}
                          alt={siteSettings.featuredMediaAlt || 'Destaque Pneu Center Brasil'}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
                      </div>

                      {/* Foreground Promotion message */}
                      <div className="relative z-10 max-w-xl space-y-2">
                        <span className="inline-flex items-center rounded-md bg-orange-500/25 px-2.5 py-0.5 text-[10px] font-mono font-black text-orange-400 border border-orange-500/20 uppercase tracking-widest animate-pulse">
                          Destaque do Mês
                        </span>
                        <h3 className="font-sans font-black text-xl sm:text-2xl text-white uppercase tracking-tight leading-none drop-shadow-md">
                          {siteSettings.featuredMediaAlt || 'Condições Especiais Pneu Center Brasil'}
                        </h3>
                        <p className="text-xs text-slate-300 leading-normal max-w-md drop-shadow font-sans">
                          Confira com nossos especialistas os modelos participantes e as melhores taxas de mercado no atendimento pelo WhatsApp.
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </section>
              )}

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

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rimCards.filter(rc => rc.active).map((card) => (
                      <button
                        key={card.id}
                        onClick={() => {
                          filterByRim(`Aro ${card.rim}`);
                        }}
                        className="group relative h-56 rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-orange-500 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-5 text-left w-full cursor-pointer bg-slate-900"
                      >
                        {/* Background Image of standard tire */}
                        <div className="absolute inset-0 z-0">
                          {card.image && card.image.trim() ? (
                            <MediaRenderer
                              src={card.image.trim()}
                              mediaType={card.mediaType}
                              alt={card.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-40 group-hover:opacity-50"
                            />
                          ) : null}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/60" />
                        </div>

                        {/* Top Area: Badge & Header */}
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="inline-flex items-center rounded-md bg-orange-500/10 px-2 py-1 text-[10px] font-mono font-black text-orange-400 border border-orange-500/20 uppercase tracking-widest">
                              Diâmetro R{card.rim}
                            </span>
                          </div>
                          <h3 className="font-sans font-black text-white text-lg sm:text-xl uppercase tracking-tight group-hover:text-orange-400 transition-colors">
                            Pneus {card.name}
                          </h3>
                        </div>

                        {/* Bottom Area: Custom CTA / Description */}
                        <div className="relative z-10 w-full mt-auto">
                          <p className="text-xs text-slate-300 font-sans leading-normal mb-3 opacity-90">
                            {card.description || `Disponíveis em diversas medidas e marcas para o seu veículo.`}
                          </p>
                          <div className="w-full bg-orange-600 group-hover:bg-orange-500 text-slate-950 font-display font-extrabold text-[11px] uppercase tracking-wider py-2.5 px-4 rounded-xl flex items-center justify-between transition-colors shadow-md">
                            <span>Ver modelos disponíveis para aro {card.rim}</span>
                            <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* HIGHLIGHT PRODUCTS */}
              <section className="py-16 sm:py-20 bg-slate-50 border-t border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  
                  {/* Section Title with Hourly Rotation Notice */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
                    <div className="space-y-1.5">
                      <h2 className="font-sans text-2xl font-black uppercase text-slate-800 tracking-tight">
                        Pneus em Destaque
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 leading-normal flex flex-wrap items-center gap-2">
                        <span>Alguns dos modelos mais procurados no Butantã e em toda São Paulo</span>
                        <span className="inline-flex items-center gap-1 bg-orange-500/10 text-orange-700 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border border-orange-500/20 uppercase tracking-wider animate-pulse">
                          <RefreshCw className="h-2.5 w-2.5 animate-spin duration-[6000ms]" />
                          Vitrine Rotativa de Hora em Hora
                        </span>
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

                  {/* Two lists stacked: First Grid (Row 1) and Second Grid (Row 2) */}
                  <div className="space-y-12">
                    
                    {/* Grid 1: Top selection of 4 tires */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-xs font-mono font-black uppercase text-slate-450 tracking-widest">
                          SELEÇÃO ROTATIVA • BLOCO A
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {hourlyFeatured.list1.map((prod) => (
                          <ProductCard
                            key={prod.id}
                            product={prod}
                            onViewDetails={handleFeatureTireClick}
                          />
                        ))}
                        {hourlyFeatured.list1.length === 0 && (
                          <p className="col-span-full text-center text-xs text-slate-400 font-sans py-6">
                            Nenhum pneu ativo disponível nesta rotação.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Grid 2: Bottom selection of 4 tires */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-xs font-mono font-black uppercase text-slate-450 tracking-widest">
                          SELEÇÃO ROTATIVA • BLOCO B
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {hourlyFeatured.list2.map((prod) => (
                          <ProductCard
                            key={prod.id}
                            product={prod}
                            onViewDetails={handleFeatureTireClick}
                          />
                        ))}
                        {hourlyFeatured.list2.length === 0 && (
                          <p className="col-span-full text-center text-xs text-slate-400 font-sans py-6">
                            Nenhum pneu ativo disponível nesta rotação.
                          </p>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Big prominent centered bottom Catalog CTA Button */}
                  <div className="mt-14 flex justify-center">
                    <button
                      id="btn-destaque-catalogo-completo-centered"
                      onClick={() => navigateTo('catalogo')}
                      className="inline-flex items-center justify-center gap-3 rounded-2xl bg-orange-600 hover:bg-orange-550 text-slate-950 font-display font-black text-xs uppercase tracking-widest px-10 py-5 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-orange-500/15 cursor-pointer max-w-sm w-full sm:w-auto"
                    >
                      <Compass className="h-4.5 w-4.5 shrink-0" />
                      <span>Ver Catálogo Completo</span>
                      <ChevronRight className="h-4.5 w-4.5 shrink-0 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>

                </div>
              </section>

              {/* SEÇÃO DE CONFIANÇA & SOBRE NÓS INTEGRADO */}
              <section id="sobre-section" className="py-16 bg-white border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  
                  {/* Top area: main layout with text on left and 9:16 media on right */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                    
                    {/* Left text column: Institutional overview */}
                    <div className="lg:col-span-7 space-y-6">
                      <div className="space-y-2">
                        <span className="inline-block text-[11px] font-mono uppercase bg-orange-100 text-orange-700 rounded px-2.5 py-1 font-bold leading-none">
                          CONFIABILIDADE DOCUMENTADA
                        </span>
                        <h2 className="font-sans text-3xl font-black text-slate-800 uppercase tracking-tight leading-tight">
                          {siteSettings.commercialName || 'Pneu Center Brasil'} • Distribuição Digital
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 font-sans font-semibold">
                          Unimos a agilidade das pesquisas do catálogo virtual com a segurança de nossa curadoria técnica individualizada.
                        </p>
                      </div>

                      <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                        <p>
                          A <strong>{siteSettings.commercialName || 'Pneu Center Brasil'}</strong> é operada de forma consolidada pela empresa sob razão social de <strong>{siteSettings.corporateName || 'CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA'}</strong>, portadora do CNPJ oficial e regularizado <strong>{siteSettings.cnpj || '20.085.983/0001-13'}</strong>. Nossa operação técnica comercial está localizada em sede física estabelecida na {siteSettings.address || 'Av. Professor Francisco Morato, 2001, no bairro do Butantã, São Paulo - SP'}.
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

                    {/* Right column: 9:16 vertical media container */}
                    <div className="lg:col-span-5 flex justify-center w-full">
                      <div className="relative w-full max-w-[340px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-950 flex items-center justify-center group/inst">
                        {/* Soft overlay pattern */}
                        <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 via-transparent to-transparent opacity-40 group-hover/inst:opacity-60 transition-opacity duration-300 pointer-events-none z-10" />

                        {siteSettings.institutionalMediaUrl ? (
                          <MediaRenderer
                            src={siteSettings.institutionalMediaUrl}
                            mediaType={siteSettings.institutionalMediaType || (isVideoUrl(siteSettings.institutionalMediaUrl) ? 'video' : 'image')}
                            alt={siteSettings.institutionalMediaAlt || 'Distribuição Digital de Pneus'}
                            className="w-full h-full object-cover select-none pointer-events-none block"
                          />
                        ) : (
                          // Premium fallback 9:16 card when no custom media is configured
                          <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 p-6 flex flex-col justify-between">
                            <div className="absolute inset-0 opacity-5" style={{
                              backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)',
                              backgroundSize: '24px 24px'
                            }} />
                            <div className="space-y-4 pt-4">
                              <div className="inline-flex rounded-xl bg-orange-500/10 p-3 border border-orange-500/20">
                                <Award className="h-6 w-6 text-orange-500" />
                              </div>
                              <h3 className="font-sans text-xl font-bold uppercase tracking-wide text-slate-200 leading-tight">
                                Distribuição<br />
                                de Alta<br />
                                Performance
                              </h3>
                              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                                Logística otimizada, envio assegurado e suporte de especialistas dedicados para todo o território nacional.
                              </p>
                            </div>
                            
                            {/* Visual decorative circles/rims */}
                            <div className="relative h-28 w-full scale-110 translate-y-6 flex justify-end items-end opacity-20 group-hover/inst:opacity-30 transition-opacity duration-300">
                              <div className="w-24 h-24 rounded-full border-4 border-dashed border-slate-400 animate-[spin_60s_linear_infinite]" />
                              <div className="w-16 h-16 rounded-full border-4 border-dashed border-slate-400 animate-[spin_40s_linear_infinite] -ml-6" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Bottom area: 4 trust badges in grid */}
                  <div className="mt-16 pt-10 border-t border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      
                      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-300 hover:bg-slate-50/40 transition-all duration-300 flex flex-col justify-between min-h-[160px] group/card">
                        <div className="inline-flex rounded-lg bg-orange-500/10 p-2.5 border border-orange-500/20 w-fit">
                          <Building2 className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="mt-4">
                          <h4 className="font-sans font-extrabold text-sm uppercase text-slate-800 tracking-wider">Razão Social Registrada</h4>
                          <p className="text-[11px] text-slate-500 font-sans leading-relaxed mt-1.5Packed">Razão oficial CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA comprovada legalmente.</p>
                        </div>
                      </div>

                      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-300 hover:bg-slate-50/40 transition-all duration-300 flex flex-col justify-between min-h-[160px] group/card">
                        <div className="inline-flex rounded-lg bg-emerald-500/10 p-2.5 border border-emerald-500/20 w-fit">
                          <ShieldCheck className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="mt-4">
                          <h4 className="font-sans font-extrabold text-sm uppercase text-slate-800 tracking-wider">Garantias & NF Confirmadas</h4>
                          <p className="text-[11px] text-slate-500 font-sans leading-relaxed mt-1.5">1 ano de garantia total garantido pela nossa loja e 5 anos oficial direto de fábrica. Pneus novos originais com Nota Fiscal tudo certinho.</p>
                        </div>
                      </div>

                      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-300 hover:bg-slate-50/40 transition-all duration-300 flex flex-col justify-between min-h-[160px] group/card">
                        <div className="inline-flex rounded-lg bg-indigo-500/10 p-2.5 border border-indigo-500/20 w-fit">
                          <UserCheck className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="mt-4">
                          <h4 className="font-sans font-extrabold text-sm uppercase text-slate-800 tracking-wider">Atendimento Especializado</h4>
                          <p className="text-[11px] text-slate-500 font-sans leading-relaxed mt-1.5">Consultores humanos aptos para orientar sobre índices de velocidade e especificações de carga técnica.</p>
                        </div>
                      </div>

                      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-300 hover:bg-slate-50/40 transition-all duration-300 flex flex-col justify-between min-h-[160px] group/card">
                        <div className="inline-flex rounded-lg bg-blue-500/10 p-2.5 border border-blue-500/20 w-fit">
                          <Wrench className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="mt-4">
                          <h4 className="font-sans font-extrabold text-sm uppercase text-slate-800 tracking-wider">Showroom no Butantã</h4>
                          <p className="text-[11px] text-slate-500 font-sans leading-relaxed mt-1.5">Sede moderna e de fácil acesso integrada para logística rápida de retirada por agendamentos.</p>
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
              {showFilterNotice && (
                <div className="mb-4 rounded-xl bg-orange-600/10 border border-orange-500/20 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-orange-905 font-sans">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-orange-600 animate-pulse" />
                    <span>
                      <strong className="text-orange-950 font-extrabold uppercase text-[10px] tracking-wide inline-block bg-orange-600/20 px-1.5 py-0.5 rounded mr-1.5">Filtro Ativo</strong>
                      {selectedRim !== 'Todos' ? `Aro: ${selectedRim}` : ''}
                      {selectedBrand !== 'Todas' ? ` • Marca: ${selectedBrand}` : ''}
                      {selectedMeasure ? ` • Medida: ${selectedMeasure.replace(/-/g, ' ').toUpperCase()}` : ''}
                    </span>
                  </div>
                  <button
                    onClick={resetFilters}
                    className="text-[11px] font-bold uppercase underline hover:text-orange-700 transition cursor-pointer"
                  >
                    Limpar filtros
                  </button>
                </div>
              )}

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
                      {(() => {
                        const brandNamesMap = new Map<string, string>();
                        // First establishing known cased active brands
                        brands.filter(b => b.active).forEach((b) => {
                          const trimName = b.name.trim();
                          if (trimName) {
                            brandNamesMap.set(trimName.toLowerCase(), trimName);
                          }
                        });
                        // Incorporate dynamically seen active products brands
                        products.filter(p => p.active !== false).forEach((p) => {
                          const trimBrand = p.brand.trim();
                          if (trimBrand) {
                            const key = trimBrand.toLowerCase();
                            if (!brandNamesMap.has(key)) {
                              brandNamesMap.set(key, trimBrand);
                            }
                          }
                        });
                        return Array.from(brandNamesMap.values()).sort().map((br) => (
                          <option key={br} value={br}>{br}</option>
                        ));
                      })()}
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
                  <div className="md:col-span-2 font-sans">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs sm:text-sm text-amber-750 font-sans outline-none focus:border-orange-500 transition-all cursor-pointer font-bold"
                    >
                      <option value="marca">Ordenar: Fabricante/Marca</option>
                      <option value="medida">Ordenar: Medida da Banda</option>
                      <option value="preco_asc">Ordenar: Menor Preço (R$)</option>
                      <option value="preco_desc">Ordenar: Maior Preço (R$)</option>
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
              {isLoadingProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div key={n} className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 animate-pulse">
                      <div className="relative aspect-video w-full bg-slate-100/70 rounded-lg flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full border-4 border-dashed border-slate-200 animate-[spin_8s_linear_infinite]" />
                      </div>
                      <div className="space-y-2.5">
                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                        <div className="h-4 bg-slate-100 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                      </div>
                      <div className="h-8 bg-slate-100 rounded-lg w-full mt-4" />
                    </div>
                  ))}
                </div>
              ) : sortedProducts.length > 0 ? (
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
                if (isLoadingProducts) {
                  return (
                    <div className="mx-auto max-w-md text-center py-20 px-4 space-y-4">
                      <div className="flex justify-center">
                        <RefreshCw className="h-10 w-10 text-orange-600 animate-spin" />
                      </div>
                      <h2 className="font-display font-black text-xl text-slate-800 uppercase tracking-tight">Carregando produto...</h2>
                      <p className="text-xs text-slate-500 font-sans">Buscando informações em tempo real no Supabase. Aguarde, por favor.</p>
                    </div>
                  );
                }

                const item = products.find((p) => p.slug === routeState.productId || p.id === routeState.productId);
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
                      {brand.logo && brand.logo.trim() ? (
                        <img src={brand.logo.trim() || null} alt={brand.name} className="h-full w-full object-contain" />
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
              className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 font-sans"
            >
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h1 className="font-sans text-3xl font-black text-slate-800 sm:text-4xl uppercase">
                  Como Funciona o Processo de Compra
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-2">
                  Passo a passo com total transparência e segurança comercial, sem cobranças automáticas ou checkout eletrônico.
                </p>
              </div>

              {/* Detailed 7 Steps purchased logic */}
              <div className="space-y-8 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
                {[
                  {
                    step: '1',
                    title: 'Navegação no Catálogo',
                    desc: 'Navegue pelo nosso catálogo digital informativo e escolha pneus multimarcas adequados para o modelo e necessidades do seu tipo de veículo.'
                  },
                  {
                    step: '2',
                    title: 'Consulta de Disponibilidade',
                    desc: 'Inicie um contato via WhatsApp com um de nossos atendentes diretos para confirmar o estoque físico imediato dos pneus selecionados.'
                  },
                  {
                    step: '3',
                    title: 'Cotação de Valores',
                    desc: 'Um consultor especializado apresentará os valores atualizados do dia, opções de parcelamento, prazos de entrega específicos ou formas de retirada física.'
                  },
                  {
                    step: '4',
                    title: 'Confirmação do Atendimento',
                    desc: 'Realizamos a validação final técnica das medidas indicadas e índices corretos de carga e velocidade para assegurar que o pneu é 100% adequado e seguro para seu automóvel.'
                  },
                  {
                    step: '5',
                    title: 'Liberação do Pedido',
                    desc: 'O pedido de cotação é finalizado de forma manual e os produtos originais com Nota Fiscal são devidamente preparados, faturados e liberados para o envio ou retirada.'
                  },
                  {
                    step: '6',
                    title: 'Acompanhamento de Entrega',
                    desc: 'Fornecemos suporte qualificado contínuo sobre o status de entrega logística física e enviamos o código de rastreamento do despacho, quando aplicável e disponível.'
                  },
                  {
                    step: '7',
                    title: 'Recebimento e Conferência',
                    desc: 'Você recebe o pneu novo original, realiza a conferência das marcações industriais e efetua o pagamento de forma segura na entrega física (quando aplicável) ou conforme acordado.'
                  }
                ].map((st, idx) => (
                  <div key={idx} className="relative flex gap-6 items-start">
                    <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 font-sans font-black text-white text-lg border border-slate-750 shadow-xs z-10">
                      {st.step}
                    </div>
                    <div className="pl-16 space-y-1">
                      <h3 className="font-sans text-base font-extrabold text-slate-800 tracking-tight uppercase leading-relaxed">{st.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed font-sans">{st.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Institutional Registration corporate info */}
              <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4">
                <h4 className="font-sans text-xs font-black uppercase text-slate-700 tracking-widest border-b pb-2 border-slate-200">
                  Dados da Empresa
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-slate-600">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Razão Social:</span>
                    <p className="font-bold text-slate-800 uppercase">CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA</p>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">CNPJ Cadastral:</span>
                    <p className="font-mono font-bold text-slate-800">20.085.983/0001-13</p>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Endereço Comercial Sede:</span>
                    <p className="text-slate-700">Av. Professor Francisco Morato, 2001, Butantã, São Paulo - SP, CEP 05513-200</p>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Canais Oficiais:</span>
                    <p className="text-slate-700">WhatsApp: (11) 99594-6993 • E-mail: contato@pneucenterbrasil.com.br</p>
                  </div>
                </div>
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
              className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12 font-sans"
            >
              <div className="text-center max-w-2xl mx-auto">
                <h1 className="font-sans text-3xl font-black text-slate-800 sm:text-4xl uppercase">
                  Sobre a Empresa
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-2">
                  Conheça nossa trajetória, compromissos técnicos e canais legítimos de distribuição de pneus automotivos.
                </p>
              </div>

              {/* Layout Content Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Column left: Text detailed info */}
                <div className="lg:col-span-7 space-y-6 text-sm text-slate-650 leading-relaxed">
                  <p>
                    A <strong>Pneu Center Brasil</strong> é uma operação comercial voltada à listagem e intermediação informativa de pneus automotivos multimarcas, vinculada juridicamente e operada de forma legítima pela empresa <strong>CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA</strong>, inscrita no CNPJ sob o número <strong>20.085.983/0001-13</strong>, com sede física em São Paulo - SP.
                  </p>

                  <p>
                    Nossa atuação no setor automotivo brasileiro pauta-se pelo compromisso rigoroso de fornecer informações técnicas qualificadas, descomplicando o processo de reposição de pneus para carros nacionais, importados, SUVs e utilitários leves. Atuamos como revendedora multimarcas independente, trazendo as principais marcas globais ao alcance do motorista, sem burocracia virtual.
                  </p>

                  <p className="border-l-4 border-orange-500 bg-slate-50 p-4 rounded-r-xl text-xs font-semibold leading-relaxed shadow-xs text-slate-600">
                    Defendemos que um pneu seguro exige validação especializada. Por isso, recusamos processos de checkout automatizados em ambiente eletrônico web. Toda compra e faturamento só são confirmados após diálogo humano direto e personalizado visando validar os índices adequados para sua segurança de rodagem.
                  </p>
                </div>

                {/* Column right: Institutional image */}
                <div className="lg:col-span-5">
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100/50 shadow-sm relative group">
                    <img 
                      src={siteSettings.institutionalMediaUrl || "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800"} 
                      alt={siteSettings.institutionalMediaAlt || "Pneu Center Brasil - Atendimento Sede"} 
                      className="w-full h-64 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3 bg-slate-900/85 text-[10px] uppercase font-bold text-white px-2.5 py-1 rounded">
                      Instalações e Logística
                    </div>
                  </div>
                </div>

              </div>

              {/* Specific Trust blocks requested */}
              <div className="space-y-4">
                <h3 className="font-sans text-xs font-black uppercase text-slate-700 tracking-wider">
                  Nossos Pilares de Confiança
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: 'Garantia conforme o fabricante',
                      desc: 'Todos os pneus possuem garantia legal contra avarias estruturais industriais, conforme regras específicas e manuais oficiais dos respectivos fabricantes (Pirelli, Goodyear, Continental, etc).',
                      icon: Award
                    },
                    {
                      title: 'Nota fiscal',
                      desc: 'Emitimos Nota Fiscal Eletrônica (NF-e) em conformidade tributária integral nas operações de venda de pneus, proporcionando transparência e segurança jurídica ao comprador.',
                      icon: FileText
                    },
                    {
                      title: 'Atendimento especializado',
                      desc: 'Equipe de consultores técnicos para conferir exatidão de medidas, compatibilidade de aros, velocidade, carga e aplicação viária correta para seu carro.',
                      icon: Wrench
                    },
                    {
                      title: 'Empresa identificada',
                      desc: 'CNPJ ativo e cadastrado regularizado sob Razão Social CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA • 20.085.983/0001-13.',
                      icon: ShieldCheck
                    },
                    {
                      title: 'Endereço Comercial',
                      desc: 'Sede própria com endereço de faturamento real em Av. Professor Francisco Morato, 2001, Butantã, São Paulo - SP, CEP 05513-200.',
                      icon: MapPin
                    }
                  ].map((block, i) => (
                    <div key={i} className="flex gap-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-xs items-start hover:border-slate-300 transition-colors">
                      <div className="rounded-xl bg-orange-50 p-2 text-orange-600 shrink-0 border border-orange-100">
                        <block.icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-sans font-extrabold text-slate-800 text-sm uppercase tracking-wide">{block.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-sans">{block.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map embed segment */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                <div className="bg-slate-50 px-6 py-4 uppercase font-black text-slate-700 tracking-wider text-xs border-b border-slate-100 flex items-center justify-between">
                  <span>Localização de Faturamento & Armazenagem</span>
                  <span className="text-[10px] text-slate-400 font-mono normal-case">Butantã, São Paulo/SP</span>
                </div>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.7720980425717!2d-46.72658822538965!3d-23.57662!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce570be485d4cb%3A0x8be5b72dfa4f5fbe!2sAv.%20Prof.%20Francisco%20Morato%2C%25202001%2520-%2520Butant%25C3%25A3%252C%2520S%25C3%25Aao%2520Paulo%2520-%2520SP%252C%252005513-300!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  title="Sede Pneu Center Brasil"
                  referrerPolicy="no-referrer"
                />
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
          {(routeState.path === 'politica-entrega' || routeState.path === 'politica-envio') && (
            <ShippingPolicy key="delivery" onBackToHome={() => navigateTo('home')} onNavigate={navigateTo} />
          )}

          {/* 11. EXCHANGES / RETURNS VIEW */}
          {routeState.path === 'politica-trocas' && (
            <ReturnsPolicy key="exchanges" onBackToHome={() => navigateTo('home')} onNavigate={navigateTo} />
          )}

          {/* 11b. WARRANTY POLICY VIEW */}
          {routeState.path === 'politica-garantia' && (
            <WarrantyPolicy key="warranty" onBackToHome={() => navigateTo('home')} onNavigate={navigateTo} />
          )}

          {/* 11c. TRACKING VIEW */}
          {routeState.path === 'rastreamento' && (
            <TrackingPage key="tracking" onBackToHome={() => navigateTo('home')} onNavigate={navigateTo} />
          )}

          {/* 12. ADMIN PANEL VIEW */}
          {routeState.path === 'paineladmin' && (
            <AdminPanel key="admin-panel" onBackToHome={() => navigateTo('home')} onRefreshPublicData={refreshStoreData} />
          )}

        </AnimatePresence>
      </main>

      {/* Footer block */}
      {routeState.path !== 'paineladmin' && <Footer onNavigate={navigateTo} />}

    </div>
  );
}
