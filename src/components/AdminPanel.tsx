import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  LogOut, 
  TrendingUp, 
  Folder, 
  Check, 
  Trash2, 
  PlusCircle, 
  Image as ImageIcon, 
  Settings as SettingsIcon, 
  AlertCircle, 
  Database,
  Upload,
  Download,
  FileSpreadsheet,
  X,
  Plus,
  Eye,
  EyeOff,
  Wrench,
  Sparkles,
  Info,
  Calendar,
  Globe,
  MapPin,
  Clock,
  Briefcase,
  Layers,
  ChevronRight,
  Award,
  Film
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaRenderer } from './MediaRenderer';
import { Product } from '../types';
import { 
  getProducts, 
  saveProducts, 
  getSettings, 
  saveSettings, 
  getLogo, 
  saveLogo, 
  removeLogo, 
  compressImage,
  SiteSettings,
  getBrands,
  saveBrands,
  getRimCards,
  saveRimCards,
  Brand,
  RimCard,
  saveProductDb,
  deleteProductDb,
  saveBrandDb,
  deleteBrandDb,
  saveRimCardDb,
  deleteRimCardDb,
  saveSettingsDb,
  saveLogoDb,
  removeLogoDb,
  syncFromSupabase,
  clearDemoProducts,
  getRimDefaultMedia,
  saveRimDefaultMediaDb,
  getRimInmetroSeals,
  saveRimInmetroSealDb
} from '../lib/appStore';
import { supabase, uploadFile, uploadMedia, isSupabaseUrlAbsent, isSupabaseKeyAbsent } from '../lib/supabaseClient';
import { BRANDS } from '../data';

export function isVideoUrl(url: string | undefined): boolean {
  if (!url) return false;
  const lowercase = url.toLowerCase();
  return (
    lowercase.endsWith('.mp4') ||
    lowercase.endsWith('.webm') ||
    lowercase.endsWith('.ogg') ||
    lowercase.endsWith('.mov') ||
    lowercase.endsWith('.m4v') ||
    lowercase.includes('video/mp4') ||
    lowercase.includes('video/webm') ||
    lowercase.includes('video/ogg') ||
    lowercase.includes('video/quicktime')
  );
}

interface AdminPanelProps {
  key?: string;
  onBackToHome: () => void;
  onRefreshPublicData?: () => void;
}

export default function AdminPanel({ onBackToHome, onRefreshPublicData = () => {} }: AdminPanelProps) {
  // Session authentication states
  const [email, setEmail] = useState('contato.pneucenterbrasil@gmail.com');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Dashboard navigation tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'add-product' | 'logo-identity' | 'site-settings' | 'sobre-empresa' | 'marcas' | 'cards-do-aro' | 'import-export' | 'hero-image' | 'midia-massa'>('overview');
  
  // App states loaded from store
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [brandsList, setBrandsList] = useState<Brand[]>([]);
  const [rimCardsList, setRimCardsList] = useState<RimCard[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    commercialName: '',
    corporateName: '',
    cnpj: '',
    address: '',
    whatsappText: '',
    whatsappRaw: '',
    email: '',
    hours: '',
    slogan: '',
    heroImageUrl: '',
    heroBorderColor: '#f97316',
    heroGlowColor: '#f97316',
    heroBorderRadius: '24',
    heroGlowIntensity: '0.4',
    institutionalMediaUrl: '',
    institutionalMediaType: 'image',
    institutionalMediaAlt: 'Pneu Center Brasil • Distribuição Digital'
  });
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);

  // CSV Import / Export states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [errorsList, setErrorsList] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [reports, setReports] = useState<{ created: number; updated: number; total: number } | null>(null);

  // Editing / managing brand state forms
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState('');
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [brandActive, setBrandActive] = useState(true);

  // Editing rim card state forms
  const [editingRimCard, setEditingRimCard] = useState<RimCard | null>(null);
  const [rimCardName, setRimCardName] = useState('');
  const [rimCardNumber, setRimCardNumber] = useState<number>(15);
  const [rimCardImage, setRimCardImage] = useState('');
  const [rimCardMediaType, setRimCardMediaType] = useState<'image' | 'video'>('image');
  const [rimCardDesc, setRimCardDesc] = useState('');
  const [rimCardActive, setRimCardActive] = useState(true);

  // Editing state for products
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // States to filter the product list in the admin view
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminRimFilter, setAdminRimFilter] = useState<string>('Todos');
  const [adminBrandFilter, setAdminBrandFilter] = useState<string>('Todas');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<string>('Todas');

  // Form states for creating/editing products
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('Pirelli');
  const [prodMeasure, setProdMeasure] = useState('');
  const [prodRim, setProdRim] = useState<number>(15);
  const [prodCategory, setProdCategory] = useState('Carro de passeio');
  const [prodApplication, setProdApplication] = useState('');
  const [prodShortDesc, setProdShortDesc] = useState('');
  const [prodFullDesc, setProdFullDesc] = useState('');
  const [prodSpecsText, setProdSpecsText] = useState(''); // newline separated specs
  const [prodPrice, setProdPrice] = useState<string>('');
  const [prodPriceStatus, setProdPriceStatus] = useState<'exibir' | 'sob_consulta'>('sob_consulta');
  const [prodStatus, setProdStatus] = useState('Em estoque');
  const [prodImage, setProdImage] = useState('');
  const [prodGallery, setProdGallery] = useState<string[]>([]);
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodIsActive, setProdIsActive] = useState(true);

  // New Technical States
  const [prodTechnicalCategory, setProdTechnicalCategory] = useState('');
  const [prodTerrain, setProdTerrain] = useState('');
  const [prodLoadIndex, setProdLoadIndex] = useState('');
  const [prodLoadCapacity, setProdLoadCapacity] = useState('');
  const [prodSpeedIndex, setProdSpeedIndex] = useState('');
  const [prodMaxSpeed, setProdMaxSpeed] = useState('');
  const [prodCompatibleRims, setProdCompatibleRims] = useState('');
  const [prodWidthMm, setProdWidthMm] = useState('');
  const [prodDiameterMm, setProdDiameterMm] = useState('');
  const [prodTreadwear, setProdTreadwear] = useState('');
  const [prodTraction, setProdTraction] = useState('');
  const [prodTemperature, setProdTemperature] = useState('');
  const [prodRunflat, setProdRunflat] = useState('');
  const [prodExtraLoad, setProdExtraLoad] = useState('');
  const [prodRimProtector, setProdRimProtector] = useState('');
  const [prodPlyQuantity, setProdPlyQuantity] = useState('');
  const [prodMounting, setProdMounting] = useState('');
  const [prodLetterColor, setProdLetterColor] = useState('');
  const [prodGrooveDepth, setProdGrooveDepth] = useState('');
  const [prodInmetroLabelUrl, setProdInmetroLabelUrl] = useState('');

  // Form states for custom logo
  const [tempLogo, setTempLogo] = useState<string | null>(null);

  // Status notification messaging
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Loading/saving spinners
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const [isSavingRim, setIsSavingRim] = useState(false);
  const [isSavingLogo, setIsSavingLogo] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  // Bulk features state
  const [rimDefaultMedia, setRimDefaultMediaState] = useState<any[]>(getRimDefaultMedia());
  const [rimInmetroSeals, setRimInmetroSealsState] = useState<any[]>(getRimInmetroSeals());
  const [bulkPriceAction, setBulkPriceAction] = useState<'add' | 'subtract'>('add');
  const [bulkPricePercent, setBulkPricePercent] = useState<string>('');
  const [bulkPriceRimFilter, setBulkPriceRimFilter] = useState<string>('Todos');
  const [bulkPriceBrandFilter, setBulkPriceBrandFilter] = useState<string>('Todas');
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [selectedRimBulkTab, setSelectedRimBulkTab] = useState<number>(13);

  // Delete Confirmation ID Modal
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter products for the admin dashboard list
  const filteredAdminProducts = productsList.filter((prod) => {
    const matchesSearch = 
      adminSearchQuery.trim() === '' ||
      prod.name.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
      prod.brand.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
      prod.measure.toLowerCase().includes(adminSearchQuery.toLowerCase());

    const matchesRim = 
      adminRimFilter === 'Todos' || 
      String(prod.rim) === adminRimFilter;

    const matchesBrand = 
      adminBrandFilter === 'Todas' || 
      prod.brand.trim().toLowerCase() === adminBrandFilter.trim().toLowerCase();

    const matchesCategory = 
      adminCategoryFilter === 'Todas' || 
      prod.category === adminCategoryFilter;

    return matchesSearch && matchesRim && matchesBrand && matchesCategory;
  });

  // Computes for Unsaved changes warnings
  const hasUnsavedBrandChanges = editingBrand ? (
    brandName.trim() !== editingBrand.name ||
    brandLogo !== editingBrand.logo ||
    brandActive !== editingBrand.active
  ) : (
    brandName.trim() !== '' || brandLogo !== null
  );

  const hasUnsavedRimCardChanges = editingRimCard ? (
    rimCardName.trim() !== editingRimCard.name ||
    Number(rimCardNumber) !== editingRimCard.rim ||
    rimCardImage !== editingRimCard.image ||
    rimCardDesc.trim() !== editingRimCard.description ||
    rimCardActive !== editingRimCard.active
  ) : (
    rimCardName.trim() !== '' ||
    (rimCardImage !== '' && rimCardImage !== 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400') ||
    rimCardDesc.trim() !== ''
  );

  const hasUnsavedProductChanges = editingProduct ? (
    prodName.trim() !== editingProduct.name ||
    prodBrand !== editingProduct.brand ||
    prodMeasure.trim() !== editingProduct.measure ||
    Number(prodRim) !== editingProduct.rim ||
    prodCategory !== editingProduct.category ||
    prodApplication.trim() !== editingProduct.application ||
    prodStatus !== editingProduct.status ||
    prodImage !== editingProduct.image ||
    prodShortDesc.trim() !== (editingProduct.shortDesc || '') ||
    prodFullDesc.trim() !== (editingProduct.fullDesc || '') ||
    prodPrice !== (editingProduct.price !== undefined ? editingProduct.price.toString() : '') ||
    prodPriceStatus !== editingProduct.priceStatus ||
    prodIsFeatured !== (editingProduct.featured === true) ||
    prodIsActive !== (editingProduct.active !== false)
  ) : (
    prodName.trim() !== '' ||
    prodMeasure.trim() !== '' ||
    prodPrice !== '' ||
    prodImage !== '' ||
    prodShortDesc.trim() !== '' ||
    prodFullDesc.trim() !== ''
  );

  // Load persistence states on mount and configure initial sessions
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsLoggedIn(true);
        } else {
          const authSession = localStorage.getItem('pneu_center_admin_session');
          if (authSession === 'authenticated_117711') {
            setIsLoggedIn(true);
          }
        }
      } catch (err) {
        console.warn('Erro ao checar sessao do Supabase:', err);
        const authSession = localStorage.getItem('pneu_center_admin_session');
        if (authSession === 'authenticated_117711') {
          setIsLoggedIn(true);
        }
      }
    };
    checkSession();

    setProductsList(getProducts());
    setSiteSettings(getSettings());
    setCurrentLogo(getLogo());
    setBrandsList(getBrands());
    setRimCardsList(getRimCards());
    setRimDefaultMediaState(getRimDefaultMedia());
    setRimInmetroSealsState(getRimInmetroSeals());

    const handleMediaUpdate = () => setRimDefaultMediaState(getRimDefaultMedia());
    const handleSealsUpdate = () => setRimInmetroSealsState(getRimInmetroSeals());

    window.addEventListener('pneu_center_rim_default_media_updated', handleMediaUpdate);
    window.addEventListener('pneu_center_rim_inmetro_seals_updated', handleSealsUpdate);

    return () => {
      window.removeEventListener('pneu_center_rim_default_media_updated', handleMediaUpdate);
      window.removeEventListener('pneu_center_rim_inmetro_seals_updated', handleSealsUpdate);
    };
  }, []);

  const triggerFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback(null);
    }, 5000);
  };

  // Handle login challenge using Supabase Auth with hardcoded credentials and local backup
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (error) {
        // Safe robust fallback for local review / sandbox sessions
        if (email.trim() === 'contato.pneucenterbrasil@gmail.com' && password.trim() === '117711') {
          localStorage.setItem('pneu_center_admin_session', 'authenticated_117711');
          setIsLoggedIn(true);
          triggerFeedback('Painel Administrativo liberado (Credenciais locais corretas)!');
        } else {
          setLoginError(error.message || 'Senha incorreta ou erro de login no Supabase Auth.');
        }
      } else {
        setIsLoggedIn(true);
        triggerFeedback('Login efetuado com sucesso via Supabase Auth!');
      }
    } catch (err: any) {
      console.error(err);
      if (email.trim() === 'contato.pneucenterbrasil@gmail.com' && password.trim() === '117711') {
        localStorage.setItem('pneu_center_admin_session', 'authenticated_117711');
        setIsLoggedIn(true);
        triggerFeedback('Painel Administrativo liberado (Modo local/offline de seguranca)!');
      } else {
        setLoginError('Falha no servico de autenticacao do Supabase.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Erro ao sair do Supabase Auth:', e);
    }
    localStorage.removeItem('pneu_center_admin_session');
    setIsLoggedIn(false);
    setPassword('');
    triggerFeedback('Sessão encerrada com sucesso.');
  };

  // Initialize form fields for either creation or editing target pneu
  const initProductForm = (target: Product | null) => {
    if (target) {
      setEditingProduct(target);
      setProdName(target.name);
      setProdBrand(target.brand);
      setProdMeasure(target.measure);
      setProdRim(target.rim);
      setProdCategory(target.category);
      setProdApplication(target.application);
      setProdShortDesc(target.shortDesc || '');
      setProdFullDesc(target.fullDesc || '');
      setProdSpecsText(target.specs ? target.specs.join('\n') : '');
      setProdPrice(target.price !== undefined ? target.price.toString() : '');
      setProdPriceStatus(target.priceStatus || 'sob_consulta');
      setProdStatus(target.status || 'Em estoque');
      setProdImage(target.image || '');
      setProdGallery(target.gallery || []);
      setProdIsFeatured(target.featured !== undefined ? target.featured : false);
      setProdIsActive(target.active !== undefined ? target.active : true);

      // Populate Technical Fields
      setProdTechnicalCategory(target.technical_category || '');
      setProdTerrain(target.terrain || '');
      setProdLoadIndex(target.load_index || '');
      setProdLoadCapacity(target.load_capacity || '');
      setProdSpeedIndex(target.speed_index || '');
      setProdMaxSpeed(target.max_speed || '');
      setProdCompatibleRims(target.compatible_rims || '');
      setProdWidthMm(target.width_mm || '');
      setProdDiameterMm(target.diameter_mm || '');
      setProdTreadwear(target.treadwear || '');
      setProdTraction(target.traction || '');
      setProdTemperature(target.temperature || '');
      setProdRunflat(target.runflat || '');
      setProdExtraLoad(target.extra_load || '');
      setProdRimProtector(target.rim_protector || '');
      setProdPlyQuantity(target.ply_quantity || '');
      setProdMounting(target.mounting || '');
      setProdLetterColor(target.letter_color || '');
      setProdGrooveDepth(target.groove_depth || '');
      setProdInmetroLabelUrl(target.inmetro_label_url || '');

      setActiveTab('add-product');
    } else {
      setEditingProduct(null);
      setProdName('');
      setProdBrand('Pirelli');
      setProdMeasure('');
      setProdRim(15);
      setProdCategory('Carro de passeio');
      setProdApplication('');
      setProdShortDesc('Pneu automotivo multimarcas com alta durabilidade e aderência.');
      setProdFullDesc('Produto disponível para atendimento e encomenda no catálogo Pneu Center Brasil. Fale com nossa equipe pelo WhatsApp para informações sobre entrega, condições comerciais e suporte.');
      setProdSpecsText('');
      setProdPrice('');
      setProdPriceStatus('sob_consulta');
      setProdStatus('Em estoque');
      setProdImage('');
      setProdGallery([]);
      setProdIsFeatured(false);
      setProdIsActive(true);

      // Reset Technical Fields
      setProdTechnicalCategory('');
      setProdTerrain('');
      setProdLoadIndex('');
      setProdLoadCapacity('');
      setProdSpeedIndex('');
      setProdMaxSpeed('');
      setProdCompatibleRims('');
      setProdWidthMm('');
      setProdDiameterMm('');
      setProdTreadwear('');
      setProdTraction('');
      setProdTemperature('');
      setProdRunflat('');
      setProdExtraLoad('');
      setProdRimProtector('');
      setProdPlyQuantity('');
      setProdMounting('');
      setProdLetterColor('');
      setProdGrooveDepth('');
      setProdInmetroLabelUrl('');
    }
  };

  // Session check tool to guarantee actions run against authentic credentials
  const checkAuth = async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const localSession = localStorage.getItem('pneu_center_admin_session');
        if (localSession !== 'authenticated_117711') {
          setIsLoggedIn(false);
          triggerFeedback('Sessão expirada. Faça login novamente.', 'error');
          return false;
        }
      }
      return true;
    } catch (e) {
      console.warn('Erro ao verificar sessão do Supabase:', e);
      const localSession = localStorage.getItem('pneu_center_admin_session');
      if (localSession !== 'authenticated_117711') {
        setIsLoggedIn(false);
        triggerFeedback('Sessão expirada. Faça login novamente.', 'error');
        return false;
      }
      return true;
    }
  };

  // Test Supabase connection (tables, storage, session)
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus({ type: 'idle', message: 'Iniciando testes de conectividade...' });
    
    try {
      if (isSupabaseUrlAbsent || isSupabaseKeyAbsent) {
        setConnectionStatus({
          type: 'error',
          message: 'Falha crítica: As chaves do Supabase (VITE_SUPABASE_URL e VITE_SUPABASE_KEY) não estão preenchidas no ambiente atual.'
        });
        setIsTestingConnection(false);
        return;
      }

      const authOk = await checkAuth();
      if (!authOk) {
        setConnectionStatus({
          type: 'error',
          message: 'Falha de Autenticação: Sua sessão administrativa local ou no Supabase está corrompida. Desconecte e faça login novamente.'
        });
        setIsTestingConnection(false);
        return;
      }

      // Step 1: Query site_settings
      const { error: errSettings } = await supabase.from('site_settings').select('id').limit(1);
      if (errSettings) throw new Error(`Banco conectado, mas a tabela 'site_settings' está inacessível: ${errSettings.message}`);

      // Step 2: Query brands
      const { error: errBrands } = await supabase.from('brands').select('id').limit(1);
      if (errBrands) throw new Error(`Banco conectado, mas a tabela 'brands' está inacessível: ${errBrands.message}`);

      // Step 3: Query rim_cards
      const { error: errRims } = await supabase.from('rim_cards').select('id').limit(1);
      if (errRims) throw new Error(`Banco conectado, mas a tabela 'rim_cards' está inacessível: ${errRims.message}`);

      // Step 4: Query products
      const { error: errProducts } = await supabase.from('products').select('id').limit(1);
      if (errProducts) throw new Error(`Banco conectado, mas a tabela 'products' está inacessível: ${errProducts.message}`);

      // Step 5: Test Storage buckets lists
      const { data: buckets, error: errBucket } = await supabase.storage.listBuckets();
      if (errBucket) {
        throw new Error(`Falha ao acessar o serviço de armazenamento de mídias (Storage): ${errBucket.message}`);
      }
      
      const hasBucket = buckets ? buckets.some(b => b.name === 'pneu-center') : false;
      if (!hasBucket) {
        throw new Error(`O bucket de fotos 'pneu-center' não está criado no seu Storage do Supabase. Crie-o como público para salvar as logos e fotos.`);
      }

      setConnectionStatus({
        type: 'success',
        message: 'Conectado com sucesso! Comunicação de dados ao Supabase, tabelas de controle e bucket de arquivos públicos de mídia testados e operacionais.'
      });
    } catch (err: any) {
      console.error('Supabase connection diagnostics failed:', err);
      setConnectionStatus({
        type: 'error',
        message: `Falha no Diagnóstico: ${err.message || err}`
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Upload main image to Supabase storage bucket pneu-center under products/ folder
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!(await checkAuth())) return;

    setIsUploadingImage(true);
    try {
      const url = await uploadFile('pneu-center', 'products', file);
      setProdImage(url);
      triggerFeedback('Imagem do pneu enviada com sucesso!');
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Falha no upload do pneu: ${err.message || err}`, 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Upload product gallery images into Supabase storage
  const handleGalleryAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!(await checkAuth())) return;

    setIsUploadingImage(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFile('pneu-center', 'products', files[i]);
        newUrls.push(url);
      }
      setProdGallery([...prodGallery, ...newUrls]);
      triggerFeedback(`${newUrls.length} imagem(ns) enviada(s) com sucesso para a galeria!`);
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro no upload da galeria: ${err.message || err}`, 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setProdGallery(prodGallery.filter((_, idx) => idx !== indexToRemove));
    triggerFeedback('Imagem removida da visualização prévia.');
  };

  // Save product logic (Supports BOTH edit or creation fallback)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prodName.trim()) {
      triggerFeedback('O nome do produto é obrigatório.', 'error');
      return;
    }
    if (!prodMeasure.trim()) {
      triggerFeedback('A medida do pneu é obrigatória.', 'error');
      return;
    }

    if (!(await checkAuth())) return;

    setIsSavingProduct(true);
    try {
      let parsedPrice: number | undefined = undefined;
      if (prodPrice) {
        let cleaned = prodPrice.toString().toLowerCase().replace('r$', '').replace(/\s/g, '');
        if (cleaned.includes('.') && cleaned.includes(',')) {
          cleaned = cleaned.replace(/\./g, '').replace(/,/g, '.');
        } else if (cleaned.includes(',')) {
          cleaned = cleaned.replace(/,/g, '.');
        }
        const pNum = parseFloat(cleaned);
        if (!isNaN(pNum) && pNum > 0) {
          parsedPrice = pNum;
        }
      }

      // Split specs from multi-line text input
      const parsedSpecs = prodSpecsText
        ? prodSpecsText.split('\n').map(s => s.trim()).filter(s => s.length > 0)
        : [
            `Medida: ${prodMeasure}`,
            `Aro: ${prodRim}`,
            `Categoria: ${prodCategory}`,
            `Marca: ${prodBrand}`,
            `Aplicação: ${prodApplication || 'veículos de passeio'}`
          ];

      const finalImage = prodImage || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600';

      const cleanProduct: Product = {
        id: editingProduct ? editingProduct.id : 'temp_' + Date.now().toString(),
        name: prodName.trim(),
        brand: prodBrand,
        measure: prodMeasure.trim(),
        rim: Number(prodRim),
        category: prodCategory,
        application: prodApplication.trim() || 'veículos de passeio',
        specs: parsedSpecs,
        status: prodStatus,
        image: finalImage,
        shortDesc: prodShortDesc.trim(),
        fullDesc: prodFullDesc.trim(),
        price: parsedPrice,
        priceStatus: prodPriceStatus,
        gallery: prodGallery,
        featured: prodIsFeatured,
        active: prodIsActive,

        // Technical specs
        technical_category: prodTechnicalCategory.trim(),
        terrain: prodTerrain.trim(),
        load_index: prodLoadIndex.trim(),
        load_capacity: prodLoadCapacity.trim(),
        speed_index: prodSpeedIndex.trim(),
        max_speed: prodMaxSpeed.trim(),
        compatible_rims: prodCompatibleRims.trim(),
        width_mm: prodWidthMm.trim(),
        diameter_mm: prodDiameterMm.trim(),
        treadwear: prodTreadwear.trim(),
        traction: prodTraction.trim(),
        temperature: prodTemperature.trim(),
        runflat: prodRunflat.trim(),
        extra_load: prodExtraLoad.trim(),
        rim_protector: prodRimProtector.trim(),
        ply_quantity: prodPlyQuantity.trim(),
        mounting: prodMounting.trim(),
        letter_color: prodLetterColor.trim(),
        groove_depth: prodGrooveDepth.trim(),
        inmetro_label_url: prodInmetroLabelUrl.trim()
      };

      await saveProductDb(cleanProduct);
      
      // Fetch latest states from local storage instantly
      setProductsList(getProducts());
      triggerFeedback(editingProduct ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
      onRefreshPublicData();
      setActiveTab('products');

      // Trigger background synchronization silently
      syncFromSupabase().catch(err => console.warn('Background sync failed:', err));
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro ao salvar produto: ${err.message || err}`, 'error');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Toggle active/inactive state quickly from products list
  const toggleProductActive = async (target: Product) => {
    if (!(await checkAuth())) return;

    try {
      const nextActive = target.active === false;
      const updatedProduct = { ...target, active: nextActive };
      
      await saveProductDb(updatedProduct);
      setProductsList(getProducts());
      onRefreshPublicData();
      triggerFeedback(`Pneu "${target.name}" foi ${nextActive ? 'ativado' : 'desativado'} com sucesso!`);
      
      syncFromSupabase().catch(err => console.warn('Background sync failed:', err));
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro ao alterar status: ${err.message || err}`, 'error');
    }
  };

  const handleProductActiveToggleDb = async (id: string, activeStatus: boolean) => {
    if (!(await checkAuth())) return;

    setIsDeletingProduct(true);
    try {
      const target = productsList.find(p => p.id === id);
      if (target) {
        const updatedProduct = { ...target, active: activeStatus };
        await saveProductDb(updatedProduct);
        setProductsList(getProducts());
        onRefreshPublicData();
        triggerFeedback(`Pneu "${target.name}" foi ${activeStatus ? 'ativado' : 'desativado'} com sucesso!`);
      }
      setConfirmDeleteId(null);
      syncFromSupabase().catch(err => console.warn('Background sync failed:', err));
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro ao atualizar status: ${err.message || err}`, 'error');
    } finally {
      setIsDeletingProduct(false);
    }
  };

  const handleProductDeleteDb = async (id: string) => {
    if (!(await checkAuth())) return;

    setIsDeletingProduct(true);
    try {
      await deleteProductDb(id);
      setProductsList(getProducts());
      onRefreshPublicData();
      triggerFeedback('Pneu excluído definitivamente com sucesso!');
      setConfirmDeleteId(null);
      syncFromSupabase().catch(err => console.warn('Background sync failed:', err));
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro ao deletar produto definitivamente: ${err.message || err}`, 'error');
    } finally {
      setIsDeletingProduct(false);
    }
  };

  // Profile and basic global details overrides
  const handleSaveSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(await checkAuth())) return;

    try {
      saveSettings(siteSettings);
      triggerFeedback('Configurações salvas com sucesso!');
      onRefreshPublicData();
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro ao salvar configurações: ${err.message || err}`, 'error');
    }
  };

  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isUploadingInstitutional, setIsUploadingInstitutional] = useState(false);
  const [isSavingInstitutional, setIsSavingInstitutional] = useState(false);

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!(await checkAuth())) return;

    setIsUploadingHero(true);
    try {
      const { publicUrl, mediaType } = await uploadMedia(file, 'hero');
      setSiteSettings(prev => ({
        ...prev,
        heroImageUrl: publicUrl,
        heroMediaType: mediaType
      }));
      triggerFeedback('Mídia de destaque (Imagem/Vídeo) enviada com sucesso! Lembre-se de clicar em salvar para aplicar.');
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro ao enviar mídia de destaque: ${err.message || err}`, 'error');
    } finally {
      setIsUploadingHero(false);
    }
  };

  const handleRemoveHeroImage = () => {
    setSiteSettings(prev => ({
      ...prev,
      heroImageUrl: '',
      heroMediaType: 'image'
    }));
    triggerFeedback('Imagem de destaque removida. Clique em salvar para confirmar.');
  };

  const handleFeaturedMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!(await checkAuth())) return;

    setIsUploadingHero(true);
    try {
      const { publicUrl, mediaType } = await uploadMedia(file, 'banners');
      setSiteSettings(prev => ({
        ...prev,
        featuredMediaUrl: publicUrl,
        featuredMediaType: mediaType
      }));
      triggerFeedback('Mídia de banner de destaque enviada com sucesso! Lembre-se de salvar.');
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro ao enviar mídia de banner: ${err.message || err}`, 'error');
    } finally {
      setIsUploadingHero(false);
    }
  };

  const handleRemoveFeaturedMedia = () => {
    setSiteSettings(prev => ({
      ...prev,
      featuredMediaUrl: '',
      featuredMediaType: 'image'
    }));
    triggerFeedback('Mídia de banner removida. Clique em salvar para confirmar.');
  };

  const handleSaveHeroSettings = async () => {
    if (!(await checkAuth())) return;

    setIsSavingLogo(true);
    try {
      await saveSettingsDb(siteSettings);
      saveSettings(siteSettings);
      triggerFeedback('Configurações da Imagem de Destaque salvas no Supabase!');
      onRefreshPublicData();
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro ao salvar configurações da imagem de destaque: ${err.message || err}`, 'error');
    } finally {
      setIsSavingLogo(false);
    }
  };

  const handleInstitutionalMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!(await checkAuth())) return;

    setIsUploadingInstitutional(true);
    try {
      const { publicUrl, mediaType } = await uploadMedia(file, 'institutional');
      
      setSiteSettings(prev => ({
        ...prev,
        institutionalMediaUrl: publicUrl,
        institutionalMediaType: mediaType
      }));
      triggerFeedback('Mídia institucional enviada com sucesso! Lembre-se de clicar em salvar para aplicar.');
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro ao enviar mídia institucional: ${err.message || err}`, 'error');
    } finally {
      setIsUploadingInstitutional(false);
    }
  };

  const handleRemoveInstitutionalMedia = () => {
    setSiteSettings(prev => ({
      ...prev,
      institutionalMediaUrl: '',
      institutionalMediaType: 'image'
    }));
    triggerFeedback('Mídia institucional removida. Clique em salvar para confirmar.');
  };

  const handleSaveInstitutionalSettings = async () => {
    if (!(await checkAuth())) return;

    setIsSavingInstitutional(true);
    try {
      await saveSettingsDb(siteSettings);
      saveSettings(siteSettings);
      triggerFeedback('Configurações de Mídia Institucional salvas com sucesso!');
      onRefreshPublicData();
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro ao salvar configurações de mídia institucional: ${err.message || err}`, 'error');
    } finally {
      setIsSavingInstitutional(false);
    }
  };

  // Logo file selections & overrides
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!(await checkAuth())) return;

    setIsUploadingImage(true);
    try {
      const publicUrl = await uploadFile('pneu-center', 'logo', file);
      setTempLogo(publicUrl);
      triggerFeedback('Nova logo enviada! Clique no botão Salvar abaixo para aplicar.');
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro ao subir logo: ${err.message || err}`, 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveLogo = async () => {
    if (tempLogo) {
      if (!(await checkAuth())) return;

      setIsSavingLogo(true);
      try {
        await saveLogoDb(tempLogo);
        setCurrentLogo(tempLogo);
        setTempLogo(null);
        triggerFeedback('Logo institucional atualizada com sucesso!');
        onRefreshPublicData();

        syncFromSupabase().catch(err => console.warn('Background sync failed:', err));
      } catch (err: any) {
        console.error(err);
        triggerFeedback(`Erro ao salvar logo: ${err.message || err}`, 'error');
      } finally {
        setIsSavingLogo(false);
      }
    }
  };

  const handleRemoveLogo = async () => {
    if (!(await checkAuth())) return;

    try {
      await removeLogoDb();
      setCurrentLogo(null);
      setTempLogo(null);
      triggerFeedback('Logo institucional removida de Supabase.');
      onRefreshPublicData();

      syncFromSupabase().catch(err => console.warn('Background sync failed:', err));
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro ao remover logo: ${err.message || err}`, 'error');
    }
  };

  // ==========================================
  // BRAND MANAGEMENT METHODS
  // ==========================================
  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      triggerFeedback('O nome da marca é obrigatório.', 'error');
      return;
    }

    if (!(await checkAuth())) return;

    setIsSavingBrand(true);
    try {
      const cleanBrand: Brand = {
        id: editingBrand ? editingBrand.id : 'brand_' + Date.now().toString(),
        name: brandName.trim(),
        logo: brandLogo,
        active: brandActive
      };

      await saveBrandDb(cleanBrand);
      setBrandsList(getBrands());
      triggerFeedback(editingBrand ? 'Marca atualizada com sucesso!' : 'Marca cadastrada com sucesso!');
      onRefreshPublicData();
      
      // Clear form
      setEditingBrand(null);
      setBrandName('');
      setBrandLogo(null);
      setBrandActive(true);

      syncFromSupabase().catch(err => console.warn('Background sync failed:', err));
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro ao salvar marca: ${err.message || err}`, 'error');
    } finally {
      setIsSavingBrand(false);
    }
  };

  const initBrandEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setBrandLogo(brand.logo);
    setBrandActive(brand.active);
  };

  const handleDeleteBrand = async (id: string) => {
    if (!(await checkAuth())) return;

    try {
      await deleteBrandDb(id);
      setBrandsList(getBrands());
      onRefreshPublicData();
      triggerFeedback('Marca removida definitivamente!');
      
      syncFromSupabase().catch(err => console.warn('Background sync failed:', err));
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro ao excluir marca: ${err.message || err}`, 'error');
    }
  };

  const toggleBrandActive = async (brand: Brand) => {
    if (!(await checkAuth())) return;

    try {
      const updated = { ...brand, active: !brand.active };
      await saveBrandDb(updated);
      setBrandsList(getBrands());
      onRefreshPublicData();
      triggerFeedback(`Marca "${brand.name}" foi ${!brand.active ? 'ativada' : 'desativada'}!`);
      
      syncFromSupabase().catch(err => console.warn('Background sync failed:', err));
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro ao alterar status da marca: ${err.message || err}`, 'error');
    }
  };

  const handleBrandLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!(await checkAuth())) return;

    setIsUploadingImage(true);
    try {
      const publicUrl = await uploadFile('pneu-center', 'brands', file);
      setBrandLogo(publicUrl);
      triggerFeedback('Logo da marca enviado com sucesso!');
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro no upload da logo da marca: ${err.message || err}`, 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // ==========================================
  // CSV IMPORT AND EXPORT METHODS
  // ==========================================
  const parseCSV = (text: string): { headers: string[]; rows: string[][] } => {
    const lines: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentValue = '';

    // Auto-detect delimiter - look at first line
    const firstLine = text.split('\n')[0] || '';
    const delimiter = firstLine.includes(';') ? ';' : ',';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentValue += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        row.push(currentValue.trim());
        currentValue = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++; // skip LF
        }
        row.push(currentValue.trim());
        if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
          lines.push(row);
        }
        row = [];
        currentValue = '';
      } else {
        currentValue += char;
      }
    }

    if (currentValue !== '' || row.length > 0) {
      row.push(currentValue.trim());
      if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
        lines.push(row);
      }
    }

    if (lines.length === 0) {
      return { headers: [], rows: [] };
    }

    const headers = lines[0].map(h => h.toLowerCase().trim().replace(/^["']|["']$/g, ''));
    const dataRows = lines.slice(1);

    return { headers, rows: dataRows };
  };

  const handleDownloadTemplate = () => {
    try {
      const csvContent = "\uFEFFname;brand;measure;rim;category;application;short_description;full_description;technical_specs;price;show_price;availability_status;main_image_url;featured;active\n" +
        "Pneu Pirelli 175/70 R13;Pirelli;175/70 R13;13;Passeio;Uso urbano;Pneu aro 13;Descrição completa;Especificações;379.90;true;Disponível;;false;true\n" +
        "Pneu Michelin 175/70 R13;Michelin;175/70 R13;13;Passeio;Uso urbano;Pneu aro 13;Descrição completa;Especificações;399.90;true;Disponível;;false;true";

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'modelo-produtos-pneu-center.csv';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerFeedback('Modelo CSV baixado de forma offline com sucesso!');
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro ao baixar modelo CSV: ${err.message || err}`, 'error');
    }
  };

  const handleExportCatalog = () => {
    try {
      const headers = [
        'name',
        'brand',
        'measure',
        'rim',
        'category',
        'application',
        'short_description',
        'full_description',
        'technical_specs',
        'price',
        'show_price',
        'availability_status',
        'main_image_url',
        'featured',
        'active',
        'technical_category',
        'terrain',
        'load_index',
        'load_capacity',
        'speed_index',
        'max_speed',
        'compatible_rims',
        'width_mm',
        'diameter_mm',
        'treadwear',
        'traction',
        'temperature',
        'runflat',
        'extra_load',
        'rim_protector',
        'ply_quantity',
        'mounting',
        'letter_color',
        'groove_depth',
        'inmetro_label_url',
        'slug'
      ];

      const rows = productsList.map(p => {
        return [
          p.name || '',
          p.brand || '',
          p.measure || '',
          (p.rim || '').toString(),
          p.category || '',
          p.application || '',
          p.shortDesc || '',
          p.fullDesc || '',
          JSON.stringify(p.specs || []),
          p.price != null ? p.price.toString() : '',
          p.priceStatus === 'exibir' ? 'true' : 'false',
          p.status || 'Em estoque',
          p.image || '',
          p.featured ? 'true' : 'false',
          p.active !== false ? 'true' : 'false',
          p.technical_category || '',
          p.terrain || '',
          p.load_index || '',
          p.load_capacity || '',
          p.speed_index || '',
          p.max_speed || '',
          p.compatible_rims || '',
          p.width_mm || '',
          p.diameter_mm || '',
          p.treadwear || '',
          p.traction || '',
          p.temperature || '',
          p.runflat || '',
          p.extra_load || '',
          p.rim_protector || '',
          p.ply_quantity || '',
          p.mounting || '',
          p.letter_color || '',
          p.groove_depth || '',
          p.inmetro_label_url || '',
          p.slug || ''
        ].map(val => {
          const escaped = val.replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(';');
      });

      const csvContent = "\uFEFF" + [headers.join(';'), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'catalogo_produtos_exportado.csv';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerFeedback(`Catálogo exportado com sucesso! ${productsList.length} produtos incluídos.`);
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro ao exportar catálogo: ${err.message || err}`, 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setParsedData(null);
      setErrorsList([]);
      setReports(null);
    }
  };

  const handleParseAndValidate = () => {
    if (!selectedFile) {
      triggerFeedback('Por favor, selecione primeiro um arquivo de formato .csv!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setErrorsList(['Erro ao ler o conteúdo do arquivo CSV. Certifique-se de que o arquivo não está corrompido.']);
        return;
      }

      try {
        const parsed = parseCSV(text);
        if (parsed.headers.length === 0 || parsed.rows.length === 0) {
          setErrorsList(['Arquivo vazio ou cabeçalho incorreto. Verifique o modelo CSV.']);
          return;
        }

        const requiredHeaders = ['name', 'brand', 'measure', 'rim'];
        const missingHeaders = requiredHeaders.filter(req => !parsed.headers.includes(req));

        if (missingHeaders.length > 0) {
          setErrorsList([`Inconsistência nos cabeçalhos: Colunas essenciais faltando: [${missingHeaders.join(', ')}]. Utilize o modelo de exportação.`]);
          return;
        }

        const colIndices: Record<string, number> = {};
        parsed.headers.forEach((h, index) => {
          colIndices[h] = index;
        });

        const validationErrors: string[] = [];
        const validRows: string[][] = [];

        parsed.rows.forEach((row, rowIndex) => {
          const humanRow = rowIndex + 2;

          if (row.length === 0 || (row.length === 1 && row[0] === '')) {
            return;
          }

          const name = row[colIndices['name']] || '';
          const brand = row[colIndices['brand']] || '';
          const measure = row[colIndices['measure']] || '';
          const rimStr = row[colIndices['rim']] || '';
          const priceStr = row[colIndices['price']] || '';

          if (!name.trim()) {
            validationErrors.push(`Linha ${humanRow}: O nome do produto de pneu está vazio.`);
          }
          if (!brand.trim()) {
            validationErrors.push(`Linha ${humanRow}: A marca/fabricante está vazia.`);
          }
          if (!measure.trim()) {
            validationErrors.push(`Linha ${humanRow}: A especificação de medida está vazia.`);
          }
          
          if (!rimStr.trim()) {
            validationErrors.push(`Linha ${humanRow}: O número do Aro está vazio.`);
          } else {
            const parsedRim = Number(rimStr);
            if (isNaN(parsedRim) || parsedRim < 10 || parsedRim > 35) {
              validationErrors.push(`Linha ${humanRow}: O Aro "${rimStr}" é inválido (deve ser um inteiro entre 10 e 35).`);
            }
          }

          if (priceStr.trim()) {
            const cleanedPrice = priceStr.replace('R$', '').replace(/\s/g, '').replace(',', '.');
            const parsedPrice = Number(cleanedPrice);
            if (isNaN(parsedPrice)) {
              validationErrors.push(`Linha ${humanRow}: Preço de pneu "${priceStr}" não pôde ser convertido em número.`);
            }
          }

          validRows.push(row);
        });

        if (validationErrors.length > 0) {
          setErrorsList(validationErrors);
          triggerFeedback('Validação falhou. Verifique os erros listados.', 'error');
        } else {
          setParsedData(parsed);
          setErrorsList([]);
          triggerFeedback(`Validação concluída com sucesso! ${validRows.length} linhas de produtos estruturadas e prontas.`);
        }
      } catch (err: any) {
        console.error(err);
        setErrorsList([`Falha fatal no processamento do arquivo: ${err.message || err}`]);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImportData = async () => {
    if (!parsedData || parsedData.rows.length === 0) return;

    if (!(await checkAuth())) return;

    setIsImporting(true);
    setReports(null);
    setImportProgress({ current: 0, total: parsedData.rows.length });

    const colIndices: Record<string, number> = {};
    parsedData.headers.forEach((h, index) => {
      colIndices[h] = index;
    });

    let createdCount = 0;
    let updatedCount = 0;
    
    // Refresh local lists
    const existingProducts = getProducts();
    const existingMap = new Map<string, Product>();
    for (const p of existingProducts) {
      existingMap.set(p.name.trim().toLowerCase(), p);
    }

    const currentBrands = getBrands();
    const activeBrandNamesSet = new Set(currentBrands.map(b => b.name.trim().toLowerCase()));

    try {
      for (let i = 0; i < parsedData.rows.length; i++) {
        const row = parsedData.rows[i];
        setImportProgress({ current: i + 1, total: parsedData.rows.length });

        const name = (row[colIndices['name']] || '').trim();
        if (!name) continue;

        const brand = (row[colIndices['brand']] || '').trim();
        const measure = (row[colIndices['measure']] || '').trim();
        const rim = Number(row[colIndices['rim']]) || 15;
        const category = (row[colIndices['category']] || 'Carro de passeio').trim();
        const application = (row[colIndices['application']] || '').trim();
        const shortDesc = (row[colIndices['short_description']] || '').trim();
        const fullDesc = (row[colIndices['full_description']] || '').trim();
        const availabilityStatus = (row[colIndices['availability_status']] || 'Em estoque').trim();
        const mainImageUrl = (row[colIndices['main_image_url']] || '').trim();
        const featuredStr = (row[colIndices['featured']] || '').trim().toLowerCase();
        const activeStr = (row[colIndices['active']] || '').trim().toLowerCase();
        const priceStr = (row[colIndices['price']] || '').trim();
        const showPriceStr = (row[colIndices['show_price']] || '').trim().toLowerCase();
        
        const technicalSpecsStr = (row[colIndices['technical_specs']] || '').trim();

        // Safe fetch from potentially unmapped CSV technical columns
        const technical_category = colIndices['technical_category'] !== undefined ? (row[colIndices['technical_category']] || '').trim() : '';
        const terrain = colIndices['terrain'] !== undefined ? (row[colIndices['terrain']] || '').trim() : '';
        const load_index = colIndices['load_index'] !== undefined ? (row[colIndices['load_index']] || '').trim() : '';
        const load_capacity = colIndices['load_capacity'] !== undefined ? (row[colIndices['load_capacity']] || '').trim() : '';
        const speed_index = colIndices['speed_index'] !== undefined ? (row[colIndices['speed_index']] || '').trim() : '';
        const max_speed = colIndices['max_speed'] !== undefined ? (row[colIndices['max_speed']] || '').trim() : '';
        const compatible_rims = colIndices['compatible_rims'] !== undefined ? (row[colIndices['compatible_rims']] || '').trim() : '';
        const width_mm = colIndices['width_mm'] !== undefined ? (row[colIndices['width_mm']] || '').trim() : '';
        const diameter_mm = colIndices['diameter_mm'] !== undefined ? (row[colIndices['diameter_mm']] || '').trim() : '';
        const treadwear = colIndices['treadwear'] !== undefined ? (row[colIndices['treadwear']] || '').trim() : '';
        const traction = colIndices['traction'] !== undefined ? (row[colIndices['traction']] || '').trim() : '';
        const temperature = colIndices['temperature'] !== undefined ? (row[colIndices['temperature']] || '').trim() : '';
        const runflat = colIndices['runflat'] !== undefined ? (row[colIndices['runflat']] || '').trim() : '';
        const extra_load = colIndices['extra_load'] !== undefined ? (row[colIndices['extra_load']] || '').trim() : '';
        const rim_protector = colIndices['rim_protector'] !== undefined ? (row[colIndices['rim_protector']] || '').trim() : '';
        const ply_quantity = colIndices['ply_quantity'] !== undefined ? (row[colIndices['ply_quantity']] || '').trim() : '';
        const mounting = colIndices['mounting'] !== undefined ? (row[colIndices['mounting']] || '').trim() : '';
        const letter_color = colIndices['letter_color'] !== undefined ? (row[colIndices['letter_color']] || '').trim() : '';
        const groove_depth = colIndices['groove_depth'] !== undefined ? (row[colIndices['groove_depth']] || '').trim() : '';
        const inmetro_label_url = colIndices['inmetro_label_url'] !== undefined ? (row[colIndices['inmetro_label_url']] || '').trim() : '';

        if (brand && !activeBrandNamesSet.has(brand.toLowerCase())) {
          try {
            const newBrandObj: Brand = {
              id: 'brand_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 4),
              name: brand,
              logo: null,
              active: true
            };
            await saveBrandDb(newBrandObj);
            activeBrandNamesSet.add(brand.toLowerCase());
          } catch (brandErr) {
            console.error('Error auto-registering brand:', brandErr);
          }
        }

        let specs: string[] = [];
        if (technicalSpecsStr) {
          const trimmed = technicalSpecsStr.trim();
          if (trimmed) {
            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
              try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                  specs = parsed.map(item => String(item));
                } else {
                  specs = [trimmed];
                }
              } catch (e) {
                specs = trimmed.split('|').map(s => s.trim()).filter(Boolean);
              }
            } else if (trimmed.includes('|')) {
              specs = trimmed.split('|').map(s => s.trim()).filter(Boolean);
            } else if (trimmed.includes('\n')) {
              specs = trimmed.split('\n').map(s => s.trim()).filter(Boolean);
            } else {
              specs = trimmed.split(',').map(s => s.trim()).filter(s => s.length > 0);
            }
          }
        }

        let price: number | undefined = undefined;
        if (priceStr) {
          let cleaned = priceStr.toLowerCase().replace('r$', '').replace(/\s/g, '');
          if (cleaned.includes('.') && cleaned.includes(',')) {
            cleaned = cleaned.replace(/\./g, '').replace(/,/g, '.');
          } else if (cleaned.includes(',')) {
            cleaned = cleaned.replace(/,/g, '.');
          }
          const parsedPrice = Number(cleaned);
          if (!isNaN(parsedPrice) && parsedPrice > 0) {
            price = parsedPrice;
          }
        }

        const hasPrice = price !== undefined && price > 0;
        const normalizedShowPrice = showPriceStr.trim().toLowerCase();
        
        let showPriceBool = false;
        
        const trueValues = ['true', 'sim', '1', 'yes', 'exibir'];
        const falseValues = ['false', 'não', 'nao', '0', 'no', 'vazio', 'null', 'undefined', ''];
        
        if (trueValues.includes(normalizedShowPrice)) {
          showPriceBool = true;
        } else if (falseValues.includes(normalizedShowPrice)) {
          showPriceBool = false;
          // Exception: "Se price vier preenchido e show_price vier vazio, assumir automaticamente: show_price = true"
          if (hasPrice && normalizedShowPrice === '') {
            showPriceBool = true;
          }
        } else {
          // If price > 0, default to true
          if (hasPrice) {
            showPriceBool = true;
          }
        }
        
        // Enforce price > 0 default to true unless explicitly false-valued
        if (hasPrice && !falseValues.includes(normalizedShowPrice)) {
          showPriceBool = true;
        }

        const priceStatus = showPriceBool ? 'exibir' : 'sob_consulta';

        const existingProd = existingMap.get(name.toLowerCase());
        
        const productData: Product = {
          id: existingProd ? existingProd.id : 'temp_prod_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 4),
          name,
          brand,
          measure,
          rim,
          category,
          application,
          specs,
          status: availabilityStatus,
          image: mainImageUrl,
          shortDesc,
          fullDesc,
          price,
          priceStatus,
          featured: featuredStr === 'true',
          active: activeStr !== 'false',

          // Injecting new specifications
          technical_category,
          terrain,
          load_index,
          load_capacity,
          speed_index,
          max_speed,
          compatible_rims,
          width_mm,
          diameter_mm,
          treadwear,
          traction,
          temperature,
          runflat,
          extra_load,
          rim_protector,
          ply_quantity,
          mounting,
          letter_color,
          groove_depth,
          inmetro_label_url
        };

        await saveProductDb(productData);

        if (existingProd) {
          updatedCount++;
        } else {
          createdCount++;
        }
      }

      setReports({
        created: createdCount,
        updated: updatedCount,
        total: parsedData.rows.length
      });
      
      triggerFeedback(`Importação concluída com sucesso! ${createdCount} criados e ${updatedCount} atualizados.`);
      
      setProductsList(getProducts());
      setBrandsList(getBrands());
      onRefreshPublicData();
      
      setSelectedFile(null);
      setParsedData(null);
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro durante a importação: ${err.message || err}`, 'error');
    } finally {
      setIsImporting(false);
    }
  };

  // ==========================================
  // RIM CARD MANAGEMENT METHODS
  // ==========================================
  const handleSaveRimCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rimCardName.trim()) {
      triggerFeedback('O nome do aro é obrigatório (ex: Aro 15).', 'error');
      return;
    }

    if (!(await checkAuth())) return;

    setIsSavingRim(true);
    try {
      const cleanRimCard: RimCard = {
        id: editingRimCard ? editingRimCard.id : 'rim_' + Date.now().toString(),
        name: rimCardName.trim(),
        rim: Number(rimCardNumber),
        image: rimCardImage || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400',
        description: rimCardDesc.trim(),
        active: rimCardActive,
        mediaType: rimCardMediaType
      };

      await saveRimCardDb(cleanRimCard);
      setRimCardsList(getRimCards());
      onRefreshPublicData();
      triggerFeedback(editingRimCard ? 'Card de Aro atualizado com sucesso!' : 'Card de Aro cadastrado com sucesso!');

      // Clear form
      setEditingRimCard(null);
      setRimCardName('');
      setRimCardNumber(15);
      setRimCardImage('');
      setRimCardMediaType('image');
      setRimCardDesc('');
      setRimCardActive(true);

      syncFromSupabase().catch(err => console.warn('Background sync failed:', err));
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro ao salvar card de aro: ${err.message || err}`, 'error');
    } finally {
      setIsSavingRim(false);
    }
  };

  const initRimCardEdit = (card: RimCard) => {
    setEditingRimCard(card);
    setRimCardName(card.name);
    setRimCardNumber(card.rim);
    setRimCardImage(card.image);
    setRimCardMediaType(card.mediaType || 'image');
    setRimCardDesc(card.description);
    setRimCardActive(card.active);
  };

  const handleDeleteRimCard = async (id: string) => {
    if (!(await checkAuth())) return;

    try {
      await deleteRimCardDb(id);
      setRimCardsList(getRimCards());
      onRefreshPublicData();
      triggerFeedback('Card de Aro excluído definitivamente!');
      
      syncFromSupabase().catch(err => console.warn('Background sync failed:', err));
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro ao excluir card de aro: ${err.message || err}`, 'error');
    }
  };

  const toggleRimCardActive = async (card: RimCard) => {
    if (!(await checkAuth())) return;

    try {
       const updated = { ...card, active: !card.active };
       await saveRimCardDb(updated);
       setRimCardsList(getRimCards());
       onRefreshPublicData();
       triggerFeedback(`Card de Aro "${card.name}" foi ${!card.active ? 'ativado' : 'desativado'}!`);
       
       syncFromSupabase().catch(err => console.warn('Background sync failed:', err));
    } catch (err: any) {
       console.error(err);
       triggerFeedback(`Erro ao alterar status do aro: ${err.message || err}`, 'error');
    }
  };

  // Bulk Media & Seal uploads / triggers
  const handleUploadRimMedia = async (rim: number, file: File) => {
    if (!(await checkAuth())) return;
    if (!file) return;
    
    // Validate
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      triggerFeedback('Tipo de arquivo inválido. Use apenas JPG, PNG ou WEBP.', 'error');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      triggerFeedback('Arquivo muito grande. O tamanho máximo permitido é 5MB.', 'error');
      return;
    }
    
    setBulkProcessing(true);
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const filePath = `bulk-rim-images/rim-${rim}-${Date.now()}.${fileExt}`;
      const res = await uploadMedia(file, filePath);
      await saveRimDefaultMediaDb(rim, res.publicUrl);
      setRimDefaultMediaState(getRimDefaultMedia());
      triggerFeedback(`Imagem padrão para o Aro ${rim} enviada com sucesso!`);
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro ao enviar imagem padrão: ${err.message || err}`, 'error');
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleUploadRimSeal = async (rim: number, file: File) => {
    if (!(await checkAuth())) return;
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      triggerFeedback('Tipo de arquivo inválido. Use apenas JPG, PNG ou WEBP.', 'error');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      triggerFeedback('Arquivo muito grande. O tamanho máximo permitido é 5MB.', 'error');
      return;
    }
    
    setBulkProcessing(true);
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const filePath = `inmetro/seal-${rim}-${Date.now()}.${fileExt}`;
      const res = await uploadMedia(file, filePath);
      await saveRimInmetroSealDb(rim, res.publicUrl);
      setRimInmetroSealsState(getRimInmetroSeals());
      triggerFeedback(`Selo INMETRO para o Aro ${rim} enviado com sucesso!`);
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro ao enviar selo INMETRO: ${err.message || err}`, 'error');
    } finally {
      setBulkProcessing(false);
    }
  };

  const triggerBulkApplyImages = async (rim: number, mode: 'only_empty' | 'replace_all') => {
    if (!(await checkAuth())) return;
    
    const defaults = getRimDefaultMedia();
    const match = defaults.find(m => m.rim === rim);
    if (!match || !match.image_url) {
      triggerFeedback(`Nenhuma imagem padrão configurada para o Aro ${rim}.`, 'error');
      return;
    }
    
    const confirmPrompt = mode === 'only_empty'
      ? `Deseja associar a imagem padrão do Aro ${rim} apenas aos pneus sem foto?`
      : `Deseja SUBSTITUIR a imagem de TODOS os pneus do Aro ${rim} pela imagem padrão?`;
      
    if (!window.confirm(confirmPrompt)) return;
    
    setBulkProcessing(true);
    let updatedCount = 0;
    try {
      for (const p of productsList) {
        if (p.rim === rim) {
          const hasNoImg = !p.image || p.image.trim() === '';
          if (mode === 'replace_all' || (mode === 'only_empty' && hasNoImg)) {
            const updated = { ...p, image: match.image_url, mediaType: 'image' as const };
            await saveProductDb(updated);
            updatedCount++;
          }
        }
      }
      triggerFeedback(`Processo concluído! ${updatedCount} pneus do Aro ${rim} foram atualizados.`);
      setProductsList(getProducts());
      onRefreshPublicData();
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro ao aplicar em lote: ${err.message || err}`, 'error');
    } finally {
      setBulkProcessing(false);
    }
  };

  const triggerBulkApplySeals = async (rim: number, mode: 'only_empty' | 'replace_all') => {
    if (!(await checkAuth())) return;
    
    const seals = getRimInmetroSeals();
    const match = seals.find(s => s.rim === rim);
    if (!match || !match.seal_url) {
      triggerFeedback(`Nenhum selo INMETRO configurado para o Aro ${rim}.`, 'error');
      return;
    }
    
    const confirmPrompt = mode === 'only_empty'
      ? `Deseja associar o selo do Aro ${rim} apenas aos pneus sem selo configurado?`
      : `Deseja SUBSTITUIR o selo de TODOS os pneus do Aro ${rim} pelo cadastrado?`;
      
    if (!window.confirm(confirmPrompt)) return;
    
    setBulkProcessing(true);
    let updatedCount = 0;
    try {
      for (const p of productsList) {
        if (p.rim === rim) {
          const hasNoSeal = !p.inmetro_label_url || p.inmetro_label_url.trim() === '';
          if (mode === 'replace_all' || (mode === 'only_empty' && hasNoSeal)) {
            const updated = { ...p, inmetro_label_url: match.seal_url };
            await saveProductDb(updated);
            updatedCount++;
          }
        }
      }
      triggerFeedback(`Processo concluído! ${updatedCount} pneus do Aro ${rim} foram atualizados com o selo.`);
      setProductsList(getProducts());
      onRefreshPublicData();
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro ao aplicar selos em lote: ${err.message || err}`, 'error');
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkPriceAdjustment = async () => {
    if (!(await checkAuth())) return;
    
    const percent = parseFloat(bulkPricePercent);
    if (isNaN(percent) || percent <= 0) {
      triggerFeedback('Insira uma porcentagem válida de reajuste (maior que zero).', 'error');
      return;
    }
    
    const confirmMsg = `Deseja aplicar um reajuste de ${bulkPriceAction === 'add' ? '+' : '-'}${percent}% ` +
      `nos pneus com filtro de Aro: ${bulkPriceRimFilter} e Marca: ${bulkPriceBrandFilter}?`;
      
    if (!window.confirm(confirmMsg)) return;
    
    setBulkProcessing(true);
    let updatedCount = 0;
    try {
      for (const p of productsList) {
        const matchesRim = bulkPriceRimFilter === 'Todos' || String(p.rim) === bulkPriceRimFilter;
        const matchesBrand = bulkPriceBrandFilter === 'Todas' || p.brand.trim().toLowerCase() === bulkPriceBrandFilter.trim().toLowerCase();
        
        if (matchesRim && matchesBrand) {
          if (p.price && p.price > 0) {
            let newPrice = p.price;
            if (bulkPriceAction === 'add') {
              newPrice = p.price * (1 + percent / 100);
            } else {
              newPrice = p.price * (1 - percent / 100);
            }
            
            // Round to 2 decimal places
            newPrice = Math.round(newPrice * 100) / 100;
            
            // Lower bounds check: price cannot drop below R$ 1,00
            if (newPrice < 1.00) {
               newPrice = 1.00;
            }
            
            const updated = { ...p, price: newPrice };
            await saveProductDb(updated);
            updatedCount++;
          }
        }
      }
      triggerFeedback(`Sucesso! ${updatedCount} pneus foram reajustados em ${bulkPriceAction === 'add' ? '+' : '-'}${percent}%.`);
      setProductsList(getProducts());
      onRefreshPublicData();
      setBulkPricePercent('');
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro no reajuste de preço: ${err.message || err}`, 'error');
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleRimCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!(await checkAuth())) return;

    setIsUploadingImage(true);
    try {
      const { publicUrl, mediaType } = await uploadMedia(file, 'rims');
      setRimCardImage(publicUrl);
      setRimCardMediaType(mediaType);
      triggerFeedback('Mídia do card de aro enviada com sucesso!');
    } catch (err: any) {
      console.error(err);
      triggerFeedback(`Erro no upload da imagem do aro: ${err.message || err}`, 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Summary widgets statistics helpers
  const stats = {
    total: productsList.length,
    active: productsList.filter(p => p.active !== false).length,
    featured: productsList.filter(p => p.featured === true).length,
    unavailable: productsList.filter(p => p.status === 'Indisponível temporariamente').length,
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans px-4">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo brand preview */}
          <div className="flex items-center gap-2 justify-center mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-orange-600 font-sans font-black text-slate-100 uppercase italic">
              PC
            </div>
            <span className="font-sans font-black text-2xl uppercase tracking-tight text-slate-800">
              Pneu Center <span className="text-orange-600">Brasil</span>
            </span>
          </div>
          
          <div className="bg-white py-8 px-4 shadow-md rounded-2xl border border-slate-200 sm:px-10">
            <div className="flex items-center gap-2.5 mb-6 text-slate-800">
              <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold tracking-tight uppercase">Acesso Administrativo</h3>
                <p className="text-xs text-slate-500">Digite a senha oficial credenciada para acessar o sistema.</p>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Supabase connection warnings on login screen */}
              {(isSupabaseUrlAbsent || isSupabaseKeyAbsent) && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-xs flex gap-3 items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-sans font-black text-red-800 text-xs uppercase tracking-wider">Supabase não configurado</h4>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {isSupabaseUrlAbsent && (
                        <span className="inline-flex items-center rounded bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-800 uppercase border border-red-200 animate-pulse">
                          SUPABASE_URL ausente
                        </span>
                      )}
                      {isSupabaseKeyAbsent && (
                        <span className="inline-flex items-center rounded bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-800 uppercase border border-red-200 animate-pulse">
                          SUPABASE_KEY ausente
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-red-650 mt-1 leading-relaxed">
                      Por favor, configure as credenciais públicas nas Variáveis de Ambiente do Google AI Studio/Netlify.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  E-mail do Administrador
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-sans mb-3"
                />

                <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Senha de Administrador
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-mono"
                />
              </div>

              {loginError && (
                <div className="rounded-lg bg-red-50 p-3.5 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 font-medium leading-relaxed">
                  <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="w-1/2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold text-xs uppercase px-4 py-3.5 transition-all text-center cursor-pointer"
                >
                  Voltar ao Início
                </button>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-1/2 rounded-lg bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs uppercase px-4 py-3.5 transition-all text-center shadow-md shadow-orange-600/10 cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn ? 'Entrando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col lg:flex-row relative">
      
      {/* Floating alert banners */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-4 left-1/2 z-50 rounded-xl px-5 py-3.5 shadow-lg border flex items-center gap-3 w-11/12 max-w-md ${
              feedback.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <Check className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-semibold">{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADMIN ASIDE PANEL */}
      <aside className="w-full lg:w-72 bg-[#0B1B32] text-slate-200 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-700/60 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              {currentLogo ? (
                <img src={currentLogo} alt="Logo Admin" className="h-10 w-auto rounded object-contain max-w-[120px]" />
              ) : (
                <div className="h-10 w-10 flex items-center justify-center rounded bg-orange-500 font-black text-slate-950 text-lg">
                  PC
                </div>
              )}
              <div>
                <span className="block font-sans font-black text-base uppercase tracking-tight leading-4 text-white">
                  {siteSettings.commercialName || 'Pneu Center'} <span className="text-orange-500">Admin</span>
                </span>
                <span className="block font-mono text-[8.5px] uppercase tracking-widest text-slate-400">
                  Painel de Controle v1.1
                </span>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
              { id: 'products', label: 'Produtos', icon: Layers },
              { id: 'add-product', label: 'Adicionar Produto', icon: PlusCircle, onClick: () => initProductForm(null) },
              { id: 'import-export', label: 'Importar / Exportar', icon: FileSpreadsheet },
              { id: 'marcas', label: 'Marcas', icon: Award },
              { id: 'cards-do-aro', label: 'Cards de Aro', icon: Database },
              { id: 'midia-massa', label: 'Mídias e Selos em Lote', icon: Folder },
              { id: 'logo-identity', label: 'Logo e Identidade', icon: ImageIcon },
              { id: 'sobre-empresa', label: 'Sobre a Empresa', icon: Info },
              { id: 'site-settings', label: 'Configurações do Site', icon: SettingsIcon },
              { id: 'hero-image', label: 'Imagem de Destaque', icon: Sparkles },
            ].map((btn) => {
              const Icon = btn.icon;
              const isSel = activeTab === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => {
                    if (btn.onClick) btn.onClick();
                    setActiveTab(btn.id as any);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isSel 
                      ? 'bg-orange-500 text-slate-950 font-extrabold shadow-md shadow-orange-500/10' 
                      : 'hover:bg-slate-800 text-slate-350 hover:text-white'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-800/80 space-y-3.5">
          <div className="rounded-lg bg-[#061021] p-3 text-center border border-slate-800/60">
            <span className="block text-[9px] font-mono tracking-widest uppercase text-slate-500 font-bold mb-0.5">Sessão</span>
            <p className="text-[11px] font-semibold text-slate-300 font-mono truncate">ID: 117711 (Ativo)</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onBackToHome}
              className="w-1/2 rounded-lg border border-slate-700 hover:bg-slate-800 hover:text-white text-slate-350 font-bold text-[10px] uppercase py-2.5 transition-all text-center cursor-pointer"
            >
              Ver Site
            </button>
            <button
              onClick={handleLogout}
              className="w-1/2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-200 font-bold text-[10px] uppercase py-2.5 flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer"
            >
              <LogOut className="h-3 w-3 shrink-0" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER CONTENT VIEW */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-6 animate-fade-in">
        
        {/* Banner with clear status of Supabase configuration */}
        {(isSupabaseUrlAbsent || isSupabaseKeyAbsent) && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-xs flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-3.5 items-start">
              <div className="bg-red-100 p-2.5 rounded-lg text-red-650 shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="space-y-1">
                <h4 className="font-sans font-black text-red-800 text-sm uppercase tracking-wider">Atenção: Supabase não conectado</h4>
                <p className="text-xs sm:text-sm text-red-650 leading-relaxed font-sans">
                  Detector de ambiente ativo identificou inconsistências nas Variáveis de Ambiente do catálogo:
                </p>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {isSupabaseUrlAbsent && (
                    <span className="inline-flex items-center rounded bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-850 uppercase border border-red-200">
                      SUPABASE_URL ausente
                    </span>
                  )}
                  {isSupabaseKeyAbsent && (
                    <span className="inline-flex items-center rounded bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-850 uppercase border border-red-200">
                      SUPABASE_KEY ausente
                    </span>
                  )}
                </div>
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-red-500 shrink-0 self-end sm:self-center">
              Apenas LocalStorage ativo
            </span>
          </div>
        )}

        {/* TAB 1: OVERVIEW SCREEN */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div>
              <h1 className="font-sans text-2xl sm:text-3xl font-black text-slate-800 uppercase tracking-tight">Visão Geral</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Estatísticas consolidadas e métricas imediatas do catálogo local.</p>
            </div>

            {/* Quick dashboard numbers in responsive grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[
                { label: 'Total de Produtos', num: stats.total, color: 'border-slate-200 bg-white text-slate-800' },
                { label: 'Produtos Ativos', num: stats.active, color: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
                { label: 'Em Destaque (Home)', num: stats.featured, color: 'border-orange-200 bg-orange-50 text-orange-850' },
                { label: 'Indisponíveis', num: stats.unavailable, color: 'border-red-200 bg-red-50 text-red-850' },
              ].map((card, idx) => (
                <div key={idx} className={`rounded-xl border p-5 shadow-xs flex flex-col justify-between ${card.color}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">{card.label}</span>
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 block">{card.num}</span>
                </div>
              ))}
            </div>

            {/* Informational and maintenance banner */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-5 items-start">
                <div className="bg-orange-50 p-2.5 rounded text-orange-600 shrink-0">
                  <Database className="h-6 w-6" />
                </div>
                <div className="space-y-2 text-left">
                  <h4 className="font-sans font-extrabold text-slate-800 text-sm uppercase tracking-wider">Persistência, Arquitetura e Demonstração</h4>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-3xl">
                    Seu portal suporta modo híbrido local/nuvem. Ao conectar as credenciais do Supabase, o catálogo irá priorizar somente os dados sincronizados em nuvem. Se restarem produtos de demonstração antigos no navegador, você pode removê-los com segurança usando o botão abaixo.
                  </p>
                  <p className="text-xs text-slate-400 font-medium italic mt-1 leading-normal">
                    *Para que as alterações fiquem visíveis globalmente para todos os visitantes da internet, lembre de conectar este painel administrativo a um banco de dados persistente em nuvem (como Firebase Firestore ou PostgreSQL) seguindo a estrutura pré-preparada em /src/lib/appStore.ts.
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
                <button
                  type="button"
                  id="btn-clear-demo"
                  onClick={async () => {
                    if (window.confirm("Deseja realmente remover do navegador todos os produtos de demonstração do catálogo? (Esta ação não afeta produtos reais no Supabase)")) {
                      try {
                        clearDemoProducts();
                        setProductsList(getProducts());
                        onRefreshPublicData();
                        triggerFeedback("Produtos de demonstração removidos com sucesso!", "success");
                      } catch (err: any) {
                        triggerFeedback(`Erro ao limpar demonstração: ${err.message || err}`, "error");
                      }
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs uppercase px-4 py-2 transition-all cursor-pointer shadow-xs"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                  <span>Limpar produtos de demonstração / localStorage</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs uppercase px-4 py-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Database className={`h-4 w-4 text-teal-650 ${isTestingConnection ? 'animate-spin' : ''}`} />
                  <span>{isTestingConnection ? 'Verificando...' : 'Testar Conexão Supabase'}</span>
                </button>
              </div>

              {connectionStatus.type !== 'idle' && (
                <div className={`mt-3 rounded-lg p-3 text-xs font-sans font-bold leading-relaxed border ${
                  connectionStatus.type === 'success' 
                    ? 'bg-teal-50 border-teal-250 text-teal-800' 
                    : 'bg-rose-50 border-rose-250 text-rose-700'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <div className="shrink-0 mt-0.5">
                      {connectionStatus.type === 'success' ? (
                        <div className="h-2 w-2 rounded-full bg-teal-500 animate-ping inline-block mr-1.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                      )}
                    </div>
                    <span>{connectionStatus.message}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Recent activities overview or Quick Links */}
            <div className="space-y-4">
              <h3 className="font-sans text-base font-extrabold text-slate-800 uppercase tracking-wider">Atalhos Administrativos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('products')}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 p-5 shadow-xs text-left cursor-pointer transition-all hover:border-slate-300 group flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="block text-xs font-bold text-slate-800 uppercase">Gerenciar Produtos</span>
                    <span className="block text-[11px] text-slate-500">Editar medidas, preços e status do catálogo.</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => initProductForm(null)}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 p-5 shadow-xs text-left cursor-pointer transition-all hover:border-slate-300 group flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="block text-xs font-bold text-slate-800 uppercase">Adicionar Novo Pneu</span>
                    <span className="block text-[11px] text-slate-500">Cadastrar medida, especificações e fazer upload de foto.</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setActiveTab('site-settings')}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 p-5 shadow-xs text-left cursor-pointer transition-all hover:border-slate-300 group flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="block text-xs font-bold text-slate-800 uppercase">Configurar Coordenadas</span>
                    <span className="block text-[11px] text-slate-500">Editar número de WhatsApp comercial e horário.</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: PRODUCTS LIST TAB */}
        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-sans text-2xl sm:text-3xl font-black text-slate-800 uppercase tracking-tight">Produtos Cadastrados</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Gerencie a listagem com edição completa, exclusão de itens e controle de visibilidade da bandeira.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id="btn-clear-demo-products-list"
                  onClick={async () => {
                    if (window.confirm("Deseja realmente remover do navegador todos os produtos de demonstração do catálogo? (Esta ação não afeta produtos reais no Supabase)")) {
                      try {
                        clearDemoProducts();
                        setProductsList(getProducts());
                        onRefreshPublicData();
                        triggerFeedback("Produtos de demonstração removidos com sucesso!", "success");
                      } catch (err: any) {
                        triggerFeedback(`Erro ao limpar demonstração: ${err.message || err}`, "error");
                      }
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs uppercase px-4 py-2.5 transition-all text-center shadow-xs cursor-pointer"
                >
                  <Trash2 className="h-4.5 w-4.5 text-red-650" />
                  <span>Limpar Demonstração</span>
                </button>

                <button
                  type="button"
                  id="btn-show-prices-all-prods"
                  onClick={async () => {
                    if (window.confirm("Deseja realmente exibir o preço de todos os produtos que possuem preço maior que R$ 0,00 cadastrado?")) {
                      setIsSavingProduct(true);
                      try {
                        const currentList = getProducts();
                        let updatedCount = 0;
                        for (const p of currentList) {
                          if (p.price && p.price > 0 && p.priceStatus !== 'exibir') {
                            const updated = { ...p, priceStatus: 'exibir' as const };
                            await saveProductDb(updated);
                            updatedCount++;
                          }
                        }
                        // Refresh state
                        setProductsList(getProducts());
                        onRefreshPublicData();
                        triggerFeedback(`Sucesso! Exibição de preço ativada para ${updatedCount} produtos.`, "success");
                      } catch (err: any) {
                        console.error(err);
                        triggerFeedback(`Erro ao atualizar preços: ${err.message || err}`, 'error');
                      } finally {
                        setIsSavingProduct(false);
                      }
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-850 font-bold text-xs uppercase px-4 py-2.5 transition-all text-center shadow-xs cursor-pointer"
                >
                  <Eye className="h-4.5 w-4.5 text-orange-600" />
                  <span>Exibir preço em todos os produtos com valor</span>
                </button>

                <button
                  onClick={() => initProductForm(null)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs uppercase px-4 py-2.5 transition-all text-center shadow-md shadow-orange-600/10 cursor-pointer"
                >
                  <Plus className="h-4.5 w-4.5" />
                  <span>Novo Pneu</span>
                </button>
              </div>
            </div>

            {/* Filtros de Busca e Organização */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* Campo de pesquisa por texto */}
              <div className="sm:col-span-4 relative">
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Pesquisar</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nome, marca ou medida..."
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-lg border border-slate-200 bg-white pl-3 pr-8 py-2 text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-sans"
                  />
                  {adminSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setAdminSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filtro de Aro (Diâmetro) */}
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Aro (Diâmetro)</label>
                <select
                  value={adminRimFilter}
                  onChange={(e) => setAdminRimFilter(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-orange-500 transition-all font-sans font-bold cursor-pointer"
                >
                  <option value="Todos">Todos os Aros</option>
                  {Array.from(new Set(productsList.map(p => p.rim)))
                    .sort((a: number, b: number) => a - b)
                    .map((rim) => (
                      <option key={rim} value={String(rim)}>Aro {rim}</option>
                  ))}
                </select>
              </div>

              {/* Filtro de Marca */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Fabricante</label>
                <select
                  value={adminBrandFilter}
                  onChange={(e) => setAdminBrandFilter(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-orange-500 transition-all font-sans cursor-pointer"
                >
                  <option value="Todas">Todas</option>
                  {Array.from(new Set(productsList.map(p => p.brand)))
                    .sort()
                    .map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Filtro de Categoria */}
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Categoria da Carga</label>
                <select
                  value={adminCategoryFilter}
                  onChange={(e) => setAdminCategoryFilter(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-orange-500 transition-all font-sans cursor-pointer"
                >
                  <option value="Todas">Todas</option>
                  {Array.from(new Set(productsList.map(p => p.category)))
                    .sort()
                    .map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Desktop and table view of list. Transposed as responsive cards on mobile. */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden/hidden">
              <div className="overflow-x-auto min-w-full">
                <table className="min-w-full divide-y divide-slate-100 text-left text-sm font-sans hidden md:table">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4.5">Foto</th>
                      <th className="px-6 py-4.5">Pneu / Marca</th>
                      <th className="px-6 py-4.5">Medida / Aro</th>
                      <th className="px-6 py-4.5">Preço</th>
                      <th className="px-6 py-4.5">Status / Visibilidade</th>
                      <th className="px-6 py-4.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-650">
                    {filteredAdminProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-400 font-sans">
                          Nenhum pneu encontrado com os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      filteredAdminProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="h-12 w-16 rounded border bg-checkerboard overflow-hidden flex items-center justify-center">
                              <img src={prod.image || null} alt={prod.name} className="h-full w-full object-contain p-1" />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="block font-bold text-slate-800 line-clamp-1">{prod.name}</span>
                            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">{prod.brand}</span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs">
                            <span className="block font-bold text-slate-700">{prod.measure}</span>
                            <span className="block font-sans text-[10px] text-slate-400">Aro {prod.rim} • {prod.category}</span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs">
                            {prod.priceStatus === 'exibir' && prod.price ? (
                              <span className="font-bold text-slate-800">
                                R$ {prod.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            ) : (
                              <span className="text-[10px] font-sans font-bold bg-slate-100 text-slate-500 rounded px-2 py-0.5 uppercase tracking-wide">
                                Sob Consulta
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className={`inline-block h-2 w-2 rounded-full ${
                                prod.status === 'Indisponível temporariamente' ? 'bg-red-500' : 'bg-amber-500'
                              }`} />
                              <span className="text-[11px] font-semibold text-slate-600">{prod.status}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {prod.active !== false ? (
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 uppercase border border-emerald-150">Ativo</span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-extrabold text-slate-500 uppercase border border-slate-200">Inativo</span>
                              )}
                              {prod.featured && (
                                <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-[9px] font-extrabold text-orange-700 uppercase border border-orange-150">Destaque</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2.5">
                              <button
                                onClick={() => toggleProductActive(prod)}
                                className={`rounded p-1.5 text-xs font-bold border transition-all cursor-pointer ${
                                  prod.active !== false
                                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                                    : 'bg-emerald-50 hover:bg-emerald-150 border-emerald-200 text-emerald-800'
                                }`}
                                title={prod.active !== false ? "Desativar pneu" : "Ativar pneu"}
                              >
                                {prod.active !== false ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                              </button>
                              <button
                                onClick={() => initProductForm(prod)}
                                className="rounded p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                                title="Editar especificações"
                              >
                                {editingProduct?.id === prod.id ? 'Editando...' : 'Editar'}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(prod.id)}
                                className="rounded p-1.5 bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-700 transition-all cursor-pointer"
                                title="Excluir produto do catálogo"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Mobile list representation for cards */}
                <div className="block md:hidden divide-y divide-slate-100">
                  {filteredAdminProducts.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 font-sans text-xs">
                      Nenhum pneu encontrado com os filtros selecionados.
                    </div>
                  ) : (
                    filteredAdminProducts.map((prod) => (
                      <div key={prod.id} className="p-4 space-y-4 font-sans">
                        <div className="flex gap-3">
                          <div className="h-16 w-20 rounded border bg-checkerboard overflow-hidden flex items-center justify-center shrink-0">
                            <img src={prod.image || null} alt={prod.name} className="h-full w-full object-contain p-1" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{prod.brand}</span>
                              <span className="font-mono text-[10px] font-bold text-slate-500">Aro {prod.rim}</span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm truncate">{prod.name}</h4>
                            <span className="block font-mono text-xs font-bold text-slate-600 mt-1">{prod.measure}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-50">
                          <div>
                            <span className="block text-[9px] text-slate-400 font-bold uppercase">Preço</span>
                            {prod.priceStatus === 'exibir' && prod.price ? (
                              <strong className="text-slate-800 font-bold font-mono">
                                R$ {prod.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </strong>
                            ) : (
                              <span className="text-[9px] font-extrabold text-slate-450 uppercase font-mono">Sob Consulta</span>
                            )}
                          </div>
                          <div>
                            <span className="block text-[9px] text-slate-400 font-bold uppercase text-right">Status</span>
                            <span className="text-[11px] font-medium text-slate-600 block text-right">{prod.status}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-[9px] text-slate-400 font-bold uppercase text-right">Filtros</span>
                            <div className="flex items-center gap-1.5 justify-end">
                              {prod.active !== false ? (
                                <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-extrabold text-emerald-700 uppercase border border-emerald-150">Ativo</span>
                              ) : (
                                <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-extrabold text-slate-500 uppercase border border-slate-250">Inativo</span>
                              )}
                              {prod.featured && (
                                <span className="inline-block rounded-full bg-orange-50 px-2 py-0.5 text-[8px] font-extrabold text-orange-700 uppercase border border-orange-150">Destaque</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => toggleProductActive(prod)}
                            className={`flex-1 py-2 font-bold text-[10px] uppercase border rounded select-none block text-center cursor-pointer transition-all ${
                              prod.active !== false
                                ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
                                : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-250 text-emerald-800'
                            }`}
                          >
                            {prod.active !== false ? 'Desativar' : 'Ativar'}
                          </button>
                          <button
                            onClick={() => initProductForm(prod)}
                            className="flex-1 py-2 font-bold text-[10px] uppercase bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded select-none block text-center cursor-pointer transition-all"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(prod.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded cursor-pointer"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AnimatePresence>
              {confirmDeleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4"
                  >
                    <div className="flex items-center gap-3 text-red-650">
                      <div className="bg-red-100 p-2.5 rounded-full text-red-600 border border-red-200 shadow-xs">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                      <h3 className="font-sans font-extrabold text-slate-800 text-lg uppercase tracking-tight">Confirmar Exclusão</h3>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed font-sans">
                      Deseja desativar este pneu temporariamente ou excluí-lo definitivamente do banco de dados?
                    </p>
                    <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-3">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        disabled={isDeletingProduct}
                        className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-bold uppercase text-slate-500 hover:bg-slate-50 cursor-pointer text-center disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          if (confirmDeleteId) {
                            handleProductActiveToggleDb(confirmDeleteId, false);
                          }
                        }}
                        disabled={isDeletingProduct}
                        className="rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2.5 text-xs font-bold uppercase cursor-pointer shadow-md shadow-amber-500/10 text-center disabled:opacity-50"
                      >
                        {isDeletingProduct ? 'Pendente...' : 'Desativar Produto'}
                      </button>
                      <button
                        onClick={() => {
                          if (confirmDeleteId) {
                            handleProductDeleteDb(confirmDeleteId);
                          }
                        }}
                        disabled={isDeletingProduct}
                        className="rounded-lg bg-red-650 hover:bg-red-500 text-white px-5 py-2.5 text-xs font-bold uppercase cursor-pointer shadow-md shadow-red-600/10 text-center disabled:opacity-50"
                      >
                        {isDeletingProduct ? 'Removendo...' : 'Excluir definitivamente'}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* TAB 3: ADD AND EDIT FORMS */}
        {activeTab === 'add-product' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div>
              <h1 className="font-sans text-2xl sm:text-3xl font-black text-slate-800 uppercase tracking-tight">
                {editingProduct ? 'Editar Pneu Automotivo' : 'Adicionar Novo Pneu'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Preencha os campos abaixo. Itens com asterisco (*) são obrigatórios.</p>
            </div>

            <form onSubmit={handleSaveProduct} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Nome Comercial do Pneu *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="Ex: Pneu Pirelli 195/55 R15"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-sans"
                  />
                </div>

                {/* Brand */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Fabricante / Marca *
                  </label>
                  <select
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-orange-500 transition-all font-sans cursor-pointer"
                  >
                    {BRANDS.map((br) => (
                      <option key={br} value={br}>{br}</option>
                    ))}
                    {/* fallback dynamic brands if not inside defaults */}
                    {!BRANDS.includes(prodBrand) && (
                      <option value={prodBrand}>{prodBrand}</option>
                    )}
                  </select>
                </div>

                {/* Measure */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Medida Técnica (Perfil) *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodMeasure}
                    onChange={(e) => setProdMeasure(e.target.value)}
                    placeholder="Ex: 195/55 R15"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-mono"
                  />
                </div>

                {/* Rim Diameter */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Diâmetro do Aro (Ex: 15) *
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={28}
                    value={prodRim}
                    onChange={(e) => setProdRim(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-orange-500 transition-all font-mono"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Categoria da Carga *
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-orange-500 transition-all font-sans cursor-pointer"
                  >
                    <option value="Carro de passeio">Carro de passeio</option>
                    <option value="SUV e utilitário leve">SUV e utilitário leve</option>
                  </select>
                </div>

                {/* Vehicle Target Application */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Aplicação recomendada (Veículos)
                  </label>
                  <input
                    type="text"
                    value={prodApplication}
                    onChange={(e) => setProdApplication(e.target.value)}
                    placeholder="Ex: veículos compactos, sedans e hatchs médios"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-sans"
                  />
                </div>

                {/* Price numeric value */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Preço (R$)
                  </label>
                  <input
                    type="text"
                    value={prodPrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProdPrice(val);
                      // Auto-toggle "Exibir Valor R$" if price is positive
                      const cleanedVal = val.toLowerCase().replace('r$', '').replace(/\s/g, '').replace(',', '.');
                      const numericVal = parseFloat(cleanedVal);
                      if (!isNaN(numericVal) && numericVal > 0) {
                        setProdPriceStatus('exibir');
                      } else if (val.trim() === '' || numericVal === 0) {
                        setProdPriceStatus('sob_consulta');
                      }
                    }}
                    placeholder="Ex: 399.90"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-mono"
                  />
                </div>

                {/* Price status choice */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Regra para Exibição de Preço
                  </label>
                  <div className="grid grid-cols-2 gap-4 mt-1">
                    {[
                      { id: 'sob_consulta', label: 'Escondido / Sob Consulta' },
                      { id: 'exibir', label: 'Exibir Valor R$' },
                    ].map((st) => (
                      <label key={st.id} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer font-sans">
                        <input
                          type="radio"
                          name="prodPriceStatus"
                          value={st.id}
                          checked={prodPriceStatus === st.id}
                          onChange={() => setProdPriceStatus(st.id as any)}
                          className="text-orange-600 focus:ring-orange-500 h-4 w-4 border-slate-350"
                        />
                        <span>{st.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability status option list */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status de Disponibilidade
                  </label>
                  <select
                    value={prodStatus}
                    onChange={(e) => setProdStatus(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-orange-500 transition-all font-sans cursor-pointer"
                  >
                    <option value="Disponível">Disponível</option>
                    <option value="Em estoque">Em estoque</option>
                    <option value="Indisponível temporariamente">Indisponível temporariamente</option>
                  </select>
                </div>

                {/* Active and Featured checks */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Sinalizadores do Pneu
                  </label>
                  <div className="flex flex-col gap-2 mt-1.5">
                    <label className="flex items-center gap-2.5 text-xs text-slate-755 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodIsActive}
                        onChange={(e) => setProdIsActive(e.target.checked)}
                        className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
                      />
                      <span className="font-semibold text-slate-700">Pneu Ativo no Catálogo Público (Visível)</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-xs text-slate-755 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodIsFeatured}
                        onChange={(e) => setProdIsFeatured(e.target.checked)}
                        className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
                      />
                      <span className="font-semibold text-slate-700">Destaque na Página Principal ("Pneus em Destaque")</span>
                    </label>
                  </div>
                </div>

              </div>

              {/* Text Description Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Short Description */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Descrição Curta comercial (Resumo)
                  </label>
                  <textarea
                    rows={2}
                    value={prodShortDesc}
                    onChange={(e) => setProdShortDesc(e.target.value)}
                    placeholder="Pneu automotivo multimarcas com disponibilidade sob consulta..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-sans"
                  />
                </div>

                {/* Full Description text area */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Descrição Completa (Fundações)
                  </label>
                  <textarea
                    rows={2}
                    value={prodFullDesc}
                    onChange={(e) => setProdFullDesc(e.target.value)}
                    placeholder="Descrição detalhada sobre fabricação e utilidades..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-sans"
                  />
                </div>

                {/* Specifications technical Multi-line array input */}
                <div className="space-y-1.5 md:col-span-2">
                  <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    Especificações Técnicas (Linhas Individuais)
                    <span className="text-[10px] lowercase text-slate-400 font-normal italic">(Um item por linha)</span>
                  </span>
                  <textarea
                    rows={4}
                    value={prodSpecsText}
                    onChange={(e) => setProdSpecsText(e.target.value)}
                    placeholder={`Exemplo:\nModelo: Cinturato P1\nÍndice de Carga: 82\nÍndice de Velocidade: T\nEstrutura: Radial (Tubeless)`}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-mono leading-relaxed"
                  />
                </div>

              </div>

              {/* Informações Técnicas Conpet/Inmetro Opcionais */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 uppercase tracking-wide">Ficha Técnica Detalhada (Campos Opcionais)</h3>
                  <p className="text-[11px] text-slate-500">Todos os campos abaixo são opcionais e só serão exibidos no site caso sejam preenchidos.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Categoria Comercial</label>
                    <input type="text" value={prodTechnicalCategory} onChange={e => setProdTechnicalCategory(e.target.value)} placeholder="Ex: Passeio" className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Terreno (Terrain)</label>
                    <input type="text" value={prodTerrain} onChange={e => setProdTerrain(e.target.value)} placeholder="Ex: HT (Highway Terrain)" className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Índice de Carga</label>
                    <input type="text" value={prodLoadIndex} onChange={e => setProdLoadIndex(e.target.value)} placeholder="Ex: 82" className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Capacidade de Carga</label>
                    <input type="text" value={prodLoadCapacity} onChange={e => setProdLoadCapacity(e.target.value)} placeholder="Ex: 475 kg por pneu" className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Índice de Velocidade</label>
                    <input type="text" value={prodSpeedIndex} onChange={e => setProdSpeedIndex(e.target.value)} placeholder="Ex: H" className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Velocidade Máxima</label>
                    <input type="text" value={prodMaxSpeed} onChange={e => setProdMaxSpeed(e.target.value)} placeholder="Ex: 210 km/h" className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Aros Compatíveis</label>
                    <input type="text" value={prodCompatibleRims} onChange={e => setProdCompatibleRims(e.target.value)} placeholder="Ex: 13, 13.5" className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Largura Total (mm)</label>
                    <input type="text" value={prodWidthMm} onChange={e => setProdWidthMm(e.target.value)} placeholder="Ex: 177 mm" className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Diâmetro Externo (mm)</label>
                    <input type="text" value={prodDiameterMm} onChange={e => setProdDiameterMm(e.target.value)} placeholder="Ex: 568 mm" className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Treadwear</label>
                    <input type="text" value={prodTreadwear} onChange={e => setProdTreadwear(e.target.value)} placeholder="Ex: 420" className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Tração (Traction)</label>
                    <input type="text" value={prodTraction} onChange={e => setProdTraction(e.target.value)} placeholder="Ex: A" className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Temperatura (Temperature)</label>
                    <input type="text" value={prodTemperature} onChange={e => setProdTemperature(e.target.value)} placeholder="Ex: B" className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">RunFlat</label>
                    <input type="text" value={prodRunflat} onChange={e => setProdRunflat(e.target.value)} placeholder="Ex: Não / Sim" className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Extra Load (XL)</label>
                    <input type="text" value={prodExtraLoad} onChange={e => setProdExtraLoad(e.target.value)} placeholder="Ex: Sim" className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Protetor de Borda</label>
                    <input type="text" value={prodRimProtector} onChange={e => setProdRimProtector(e.target.value)} placeholder="Ex: Sim" className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Quantidade de Lonas</label>
                    <input type="text" value={prodPlyQuantity} onChange={e => setProdPlyQuantity(e.target.value)} placeholder="Ex: 4" className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Montagem</label>
                    <input type="text" value={prodMounting} onChange={e => setProdMounting(e.target.value)} placeholder="Ex: Sem câmara (TL)" className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Cor das Letras</label>
                    <input type="text" value={prodLetterColor} onChange={e => setProdLetterColor(e.target.value)} placeholder="Ex: Pretas" className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Profundidade do Sulco</label>
                    <input type="text" value={prodGrooveDepth} onChange={e => setProdGrooveDepth(e.target.value)} placeholder="Ex: 7.2 mm" className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-orange-500" />
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-200">
                  <span className="block text-[11px] font-bold text-slate-700 uppercase">Selo de Eficiência Energética (INMETRO / CONPET)</span>
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white rounded-lg border border-slate-200 p-3">
                    <div className="h-16 w-20 border bg-checkerboard rounded flex items-center justify-center shrink-0">
                      {prodInmetroLabelUrl ? (
                        <img src={prodInmetroLabelUrl} alt="Selo Inmetro" className="h-full w-full object-contain p-0.5 animate-fade-in" />
                      ) : (
                        <span className="text-[9px] text-slate-400 font-mono italic">Sem Selo</span>
                      )}
                    </div>
                    <div className="space-y-2 w-full">
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded cursor-pointer transition-all">
                          <span>Subir Selo do Dispositivo</span>
                          <input type="file" accept="image/*" onChange={async (e) => {
                            const files = e.target.files;
                            if (files && files[0]) {
                              if (!(await checkAuth())) return;
                              setIsSavingProduct(true);
                              try {
                                const url = await uploadFile('pneu-center', 'products', files[0]);
                                setProdInmetroLabelUrl(url);
                                triggerFeedback('Selo INMETRO carregado com sucesso!');
                              } catch (err: any) {
                                console.error(err);
                                triggerFeedback(`Erro ao subir selo: ${err.message || err}`, 'error');
                              } finally {
                                setIsSavingProduct(false);
                              }
                            }
                          }} className="hidden" />
                        </label>
                        {prodInmetroLabelUrl && (
                          <button type="button" onClick={() => setProdInmetroLabelUrl('')} className="text-[10px] font-bold text-red-650 hover:underline">REMOVER SELO</button>
                        )}
                      </div>
                      <input type="text" value={prodInmetroLabelUrl} onChange={e => setProdInmetroLabelUrl(e.target.value)} placeholder="Ou cole a URL direta do selo de homologação do pneu..." className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] text-slate-650 outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo uploading blocks */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Mídias do Produto (Foto do celular / Galeria)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Main Product image */}
                  <div className="rounded-xl border border-slate-200 p-4 space-y-4 bg-slate-50">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase">Foto Principal do Pneu</h4>
                      <p className="text-[11px] text-slate-500 leading-normal">Escolha uma foto da galeria ou use a câmera do seu celular.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Product image Preview Panel */}
                      <div className="h-24 w-32 border bg-checkerboard rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                        {prodImage ? (
                          <img src={prodImage} alt="Preview principal" className="h-full w-full object-contain p-1" />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400 text-[10px] font-mono leading-none">
                            <span className="italic block">SEM FOTO</span>
                            <span className="text-[8px] tracking-tight block text-slate-300 mt-1">placeholder ativo</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2.5 w-full">
                        <label className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-500 hover:text-slate-950 font-bold text-xs uppercase px-4 py-2.5 text-center text-slate-950 transition-all cursor-pointer">
                          <Upload className="h-4 w-4 shrink-0" />
                          <span>Mudar Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleProductImageUpload}
                            className="hidden"
                          />
                        </label>
                        {prodImage && (
                          <button
                            type="button"
                            onClick={() => {
                              setProdImage('');
                              triggerFeedback('Foto principal limpa. Usando placeholder.');
                            }}
                            className="w-full text-center text-[10px] font-medium text-red-600 hover:underline uppercase block cursor-pointer"
                          >
                            Remover Imagem principal
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Multi gallery add panel */}
                  <div className="rounded-xl border border-slate-200 p-4 space-y-4 bg-slate-50">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase">Galeria de Fotos adicionais</h4>
                      <p className="text-[11px] text-slate-500 leading-normal">Carregue mais fotos para o painel de slides de detalhes.</p>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center justify-center gap-2 rounded-lg border border-slate-350 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase px-4 py-2.5 transition-all cursor-pointer">
                        <Plus className="h-4 w-4 shrink-0" />
                        <span>Adicionar na Galeria</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleGalleryAdd}
                          className="hidden"
                        />
                      </label>

                      {/* Horizontal list preview gallery */}
                      {prodGallery.length > 0 && (
                        <div className="flex flex-wrap gap-2.5 pt-1">
                          {prodGallery.map((img, index) => (
                            <div key={index} className="relative h-14 w-18 border bg-checkerboard rounded overflow-hidden group/gal flex items-center justify-center shrink-0">
                              <img src={img} alt={`Gallery ${index}`} className="h-full w-full object-contain p-1" />
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(index)}
                                className="absolute -top-1 -right-1 bg-red-650 hover:bg-red-500 text-white rounded-full p-0.5 shadow-md flex items-center justify-center cursor-pointer"
                                title="Remover da galeria"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Product Unsaved Warning */}
              {hasUnsavedProductChanges && (
                <div className="text-xs font-sans font-bold text-amber-600 flex items-center gap-1.5 bg-amber-50 border border-amber-250 rounded-xl p-3 animate-pulse">
                  <AlertCircle className="h-4.5 w-4.5 text-amber-550 shrink-0" />
                  <span>Você tem alterações não salvas no formulário deste pneu</span>
                </div>
              )}

              {/* Action Buttons footer */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="rounded-lg border border-slate-200 px-5 py-3 text-xs font-bold uppercase text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Voltar à Listagem
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="rounded-lg bg-orange-600 hover:bg-orange-500 text-slate-950 px-6 py-3 text-xs font-bold uppercase cursor-pointer shadow-md shadow-orange-600/10 disabled:opacity-50"
                >
                  {isSavingProduct ? 'Salvando...' : (editingProduct ? 'Salvar Alterações' : 'Cadastrar Pneu')}
                </button>
              </div>

            </form>
          </motion.div>
        )}

        {/* TAB 4: LOGO AND IDENTIFICATION */}
        {activeTab === 'logo-identity' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div>
              <h1 className="font-sans text-2xl sm:text-3xl font-black text-slate-800 uppercase tracking-tight">Identidade Visual & Logo</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Upload ou alteração da logo principal do site que é exibida no menu superior e no rodapé.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                
                {/* Logo Control Panel */}
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-slate-800 uppercase">Subir Nova Logo Imagem</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Formatos recomendados: PNG transparente, JPG ou WEBP. A imagem será otimizada fisicamente pelo navegador.</p>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center justify-center gap-2.5 rounded-lg bg-[#0B1B32] hover:bg-slate-850 text-white font-bold text-xs uppercase px-5 py-3.5 transition-all text-center cursor-pointer shadow-sm">
                      <Upload className="h-4.5 w-4.5 shrink-0" />
                      <span>Selecionar Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>

                    {(currentLogo || tempLogo) && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="w-full text-center text-xs font-semibold text-red-600 hover:underline uppercase cursor-pointer border border-red-200 hover:bg-red-50 py-3.5 rounded-lg transition-colors border-dashed"
                      >
                        Remover Logo (Usar texto nominal original)
                      </button>
                    )}
                  </div>
                </div>

                {/* Previews Panel block */}
                <div className="rounded-xl border border-slate-200 p-5 bg-slate-50 space-y-5">
                  <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">Painel de Pré-visualização</h4>

                  {/* Active logo */}
                  <div className="space-y-1.5">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Logo Ativa Atualmente</span>
                    <div className="h-20 bg-checkerboard border border-slate-200 rounded-lg flex items-center justify-center p-4">
                      {currentLogo ? (
                        <img src={currentLogo} alt="Logo Ativa" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-xs text-slate-400 italic">Nenhuma logo imagem. Usando texto comercial default: "Pneu Center Brasil"</span>
                      )}
                    </div>
                  </div>

                  {/* Pending selection logo preview */}
                  {tempLogo && (
                    <motion.div
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-1.5 border-t border-slate-200 pt-4"
                    >
                      <span className="block text-[11px] font-bold text-slate-650 uppercase tracking-widest text-orange-600">Prévia Pendente</span>
                      <div className="h-20 bg-checkerboard border border-orange-200 rounded-lg flex items-center justify-center p-4">
                        <img src={tempLogo} alt="Preview pendente" className="max-h-full max-w-full object-contain" />
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveLogo}
                        className="w-full rounded-lg bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs uppercase py-2.5 transition-all cursor-pointer text-center"
                      >
                        Salvar Nova Logo
                      </button>
                    </motion.div>
                  )}

                </div>

              </div>
              
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 leading-normal text-xs text-slate-500 flex items-start gap-2.5">
                <Info className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
                <p>
                  A logo é aplicada dinamicamente no menu superior móvel/desktop, bem como nas orientações do rodapé. Caso a remova, o código exibirá automaticamente a marca textual do site <strong>"Pneu Center Brasil"</strong> estilizada com a paleta oficial de laranjas e gradientes.
                </p>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 5: SITE SETTINGS / PROFILE OVERRIDES */}
        {activeTab === 'site-settings' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div>
              <h1 className="font-sans text-2xl sm:text-3xl font-black text-slate-800 uppercase tracking-tight">Configurações Gerais</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Modifique as informações comerciais, razão social, CNPJ, dados de WhatsApp e e-mail de correspondência pública.</p>
            </div>

            <form onSubmit={handleSaveSettingsSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Commercial Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Nome Comercial Portador *
                  </label>
                  <input
                    type="text"
                    required
                    value={siteSettings.commercialName}
                    onChange={(e) => setSiteSettings({ ...siteSettings, commercialName: e.target.value })}
                    placeholder="Ex: Pneu Center Brasil"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-sans"
                  />
                </div>

                {/* Slogan */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Slogan ou Subtítulo Comercial
                  </label>
                  <input
                    type="text"
                    value={siteSettings.slogan}
                    onChange={(e) => setSiteSettings({ ...siteSettings, slogan: e.target.value })}
                    placeholder="Ex: Catálogo Oficial Multimarcas"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-sans"
                  />
                </div>

                {/* WhatsApp displayed text */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Telefone WhatsApp Formatado (Exibição) *
                  </label>
                  <input
                    type="text"
                    required
                    value={siteSettings.whatsappText}
                    onChange={(e) => setSiteSettings({ ...siteSettings, whatsappText: e.target.value })}
                    placeholder="Ex: (11) 99594-6993"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-mono"
                  />
                </div>

                {/* WhatsApp raw number (No symbols, with country code) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Número WhatsApp Limpo (API celular - Ex: 5511995946993) *
                  </label>
                  <input
                    type="text"
                    required
                    value={siteSettings.whatsappRaw}
                    onChange={(e) => setSiteSettings({ ...siteSettings, whatsappRaw: e.target.value.replace(/\D/g, '') })}
                    placeholder="Ex: 5511995946993"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-mono"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    E-mail de Contato Comercial *
                  </label>
                  <input
                    type="email"
                    required
                    value={siteSettings.email}
                    onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                    placeholder="Ex: contato.pneucenterbrasil@gmail.com"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-mono"
                  />
                </div>

                {/* Opening Hours */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Horário de Atendimento Físico *
                  </label>
                  <input
                    type="text"
                    required
                    value={siteSettings.hours}
                    onChange={(e) => setSiteSettings({ ...siteSettings, hours: e.target.value })}
                    placeholder="Ex: Segunda a sexta, das 8h às 18h..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-sans"
                  />
                </div>

                {/* Legal Corporate name (Reason Social) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Razão Social Legítima *
                  </label>
                  <input
                    type="text"
                    required
                    value={siteSettings.corporateName}
                    onChange={(e) => setSiteSettings({ ...siteSettings, corporateName: e.target.value })}
                    placeholder="Ex: CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-sans font-semibold text-slate-655"
                  />
                </div>

                {/* CNPJ Registry */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    CNPJ Oficial Corporativo *
                  </label>
                  <input
                    type="text"
                    required
                    value={siteSettings.cnpj}
                    onChange={(e) => setSiteSettings({ ...siteSettings, cnpj: e.target.value })}
                    placeholder="Ex: 20.085.983/0001-13"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-mono font-semibold"
                  />
                </div>

                {/* Physical Location Address */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Endereço de Sede Física Comercial *
                  </label>
                  <input
                    type="text"
                    required
                    value={siteSettings.address}
                    onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                    placeholder="Av. Professor Francisco Morato, 2001, Butantã, São Paulo/SP..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-sans"
                  />
                </div>

              </div>

              <div className="rounded-lg bg-orange-50/50 p-4 leading-normal text-xs text-orange-800 border border-orange-200/50 flex items-start gap-2.5">
                <Info className="h-4.5 w-4.5 text-orange-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Importante:</strong> Esses dados influenciam todos os cabeçalhos de visualização pública, as páginas explicativas de termos e também as linhas do rodapé oficial de forma síncrona.
                </p>
              </div>

              {/* Submitions control */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="rounded-lg bg-orange-600 hover:bg-orange-500 text-slate-950 px-6 py-3.5 text-xs font-bold uppercase cursor-pointer"
                >
                  Salvar Parâmetros Básicos
                </button>
              </div>

            </form>

          </motion.div>
        )}

        {/* TAB: SOBRE A EMPRESA */}
        {activeTab === 'sobre-empresa' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 text-slate-800"
          >
            <div>
              <h1 className="font-sans text-2xl sm:text-3xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <Info className="h-7 w-7 text-orange-500" />
                Sobre a Empresa (Mídia e Capa)
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Configure os textos corporativos de garantia e compliance, além da mídia vertical (imagem ou vídeo 9:16) do bloco "Distribuição de Alta Performance" do site.
              </p>
            </div>

            {/* Quick texts section for easy context editing */}
            <form onSubmit={handleSaveSettingsSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-md font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-2 font-sans">
                  <Briefcase className="h-5 w-5 text-orange-500" />
                  Textos Institucionais do Bloco Quem Somos
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Estes dados alteram em tempo real o cabeçalho técnico "Distribuição de Alta Performance" e as garantias mostradas no About Us.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Nome Comercial Portador *
                  </label>
                  <input
                    type="text"
                    required
                    value={siteSettings.commercialName}
                    onChange={(e) => setSiteSettings({ ...siteSettings, commercialName: e.target.value })}
                    placeholder="Ex: Pneu Center Brasil"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Razão Social Legítima *
                  </label>
                  <input
                    type="text"
                    required
                    value={siteSettings.corporateName}
                    onChange={(e) => setSiteSettings({ ...siteSettings, corporateName: e.target.value })}
                    placeholder="Ex: CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-sans font-semibold text-slate-655"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    CNPJ Oficial Corporativo *
                  </label>
                  <input
                    type="text"
                    required
                    value={siteSettings.cnpj}
                    onChange={(e) => setSiteSettings({ ...siteSettings, cnpj: e.target.value })}
                    placeholder="Ex: 20.085.983/0001-13"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Endereço de Sede Física Comercial *
                  </label>
                  <input
                    type="text"
                    required
                    value={siteSettings.address}
                    onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                    placeholder="Av. Professor Francisco Morato, 2001, Butantã, São Paulo/SP..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-sans"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="rounded-lg bg-orange-600 hover:bg-orange-500 text-slate-950 px-6 py-3.5 text-xs font-bold uppercase cursor-pointer"
                >
                  Salvar Textos Institucionais
                </button>
              </div>
            </form>

            {/* CARD: INSTITUTIONAL SECTION MEDIA */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-md font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-2 font-sans">
                  <Film className="h-5 w-5 text-orange-500" />
                  Mídia da Seção Institucional
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure o banner ou vídeo vertical no formato 9:16 da seção quem somos ("Pneu Center Brasil • Distribuição Digital").
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-2">
                <div className="lg:col-span-7 space-y-4">
                  {/* Media Type selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Tipo de Mídia Ativa
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSiteSettings(prev => ({ ...prev, institutionalMediaType: 'image' }));
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                          (siteSettings.institutionalMediaType || 'image') === 'image'
                            ? 'bg-orange-600 text-slate-950 shadow cursor-pointer'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-150 cursor-pointer'
                        }`}
                      >
                        Imagem
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSiteSettings(prev => ({ ...prev, institutionalMediaType: 'video' }));
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                          siteSettings.institutionalMediaType === 'video'
                            ? 'bg-orange-600 text-slate-950 shadow cursor-pointer'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-150 cursor-pointer'
                        }`}
                      >
                        Vídeo
                      </button>
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {(siteSettings.institutionalMediaType || 'image') === 'video' ? 'Subir Vídeo Vertical (9:16)' : 'Subir Imagem Vertical (9:16)'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
                        siteSettings.institutionalMediaUrl ? 'border-green-300 bg-green-50/20' : 'border-slate-350 hover:border-orange-400 bg-slate-50'
                      }`}>
                        <Upload className={`h-8 w-8 mb-2 ${siteSettings.institutionalMediaUrl ? 'text-green-500 animate-bounce' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold uppercase text-slate-700">
                          {isUploadingInstitutional ? 'Fazendo Upload...' : 'Subir Arquivo'}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">
                          {(siteSettings.institutionalMediaType || 'image') === 'video' ? 'Formatos: MP4, WEBM (Máx 35MB)' : 'Formatos: PNG, JPG, WEBP, GIF (Máx 8MB)'}
                        </span>
                        <input
                          type="file"
                          accept={(siteSettings.institutionalMediaType || 'image') === 'video' ? 'video/*' : 'image/*'}
                          onChange={handleInstitutionalMediaUpload}
                          disabled={isUploadingInstitutional}
                          className="hidden"
                        />
                      </label>

                      {/* Remove action */}
                      {siteSettings.institutionalMediaUrl ? (
                        <div className="flex flex-col justify-center bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-2 truncate">Ativo:</span>
                          <p className="text-[10px] font-mono text-slate-600 break-all leading-normal bg-white p-2 rounded border border-slate-150 max-h-12 overflow-y-auto mb-3">
                            {siteSettings.institutionalMediaUrl}
                          </p>
                          <button
                            type="button"
                            onClick={handleRemoveInstitutionalMedia}
                            className="text-center rounded-lg border border-red-200 hover:bg-red-50 hover:border-red-300 text-red-655 font-bold text-[10px] uppercase py-2 transition-colors cursor-pointer"
                          >
                            Remover Mídia
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col justify-center items-center bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
                          <span className="text-[11px] font-semibold text-slate-400 italic">Nenhum arquivo enviado</span>
                          <span className="text-[10px] text-slate-400 mt-1 leading-normal">
                            Usando imagem padrão na home.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text alt tag */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Texto Alternativo de Acessibilidade (Alt)
                    </label>
                    <input
                      type="text"
                      value={siteSettings.institutionalMediaAlt || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, institutionalMediaAlt: e.target.value })}
                      placeholder="Ex: Pneu Center Brasil Distribuição Digital de Pneus"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-orange-500 font-sans"
                    />
                  </div>
                </div>

                {/* Live Sandbox 9:16 Preview Card */}
                <div className="lg:col-span-5 bg-[#091122] rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-1">
                      <span className="text-[9px] font-mono font-extrabold uppercase text-slate-400 tracking-wider">PREVISÃO 9:16 REAIS</span>
                      <span className="text-[9px] font-mono bg-orange-950 text-orange-400 font-bold uppercase rounded px-1.5 py-0.5 border border-orange-550/20">
                        {siteSettings.institutionalMediaType === 'video' ? 'VÍDEO' : 'IMAGEM'}
                      </span>
                    </div>

                    <div className="h-64 w-full rounded bg-slate-950 border border-slate-900 flex items-center justify-center p-3 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
                        backgroundSize: '16px 16px'
                      }} />

                      {/* 9:16 Aspect Box */}
                      <div className="aspect-[9/16] h-full rounded border border-slate-800 shadow-xl overflow-hidden bg-slate-900 relative flex items-center justify-center">
                        {siteSettings.institutionalMediaUrl ? (
                          siteSettings.institutionalMediaType === 'video' ? (
                            <video
                              src={siteSettings.institutionalMediaUrl}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={siteSettings.institutionalMediaUrl}
                              alt={siteSettings.institutionalMediaAlt || 'Preview'}
                              className="w-full h-full object-cover"
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-center p-3 bg-slate-900 text-slate-500">
                            <Film className="h-6 w-6 mb-1 text-slate-600 animate-pulse" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Mídia Padrão</span>
                            <span className="text-[8px] mt-0.5 text-slate-600">Representação de tires da Home</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-[10px] text-slate-400 leading-snug border-t border-slate-800 pt-2.5">
                    Esta mídia aparecerá ocupando o lado direito em telas de computador na proporção vertical perfeita de <strong>9:16</strong>, e logo abaixo do texto em formatos mobile.
                  </div>
                </div>
              </div>

              {/* Save institutional configuration */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleSaveInstitutionalSettings}
                  disabled={isSavingInstitutional || isUploadingInstitutional}
                  className="rounded-lg bg-orange-600 hover:bg-orange-500 text-slate-950 px-6 py-3.5 text-xs font-black uppercase cursor-pointer shadow-md shadow-orange-655/10 disabled:opacity-50"
                >
                  {isSavingInstitutional ? 'Salvando...' : 'Salvar Mídia Institucional'}
                </button>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 5.5: HERO IMAGE CARD SETTINGS */}
        {activeTab === 'hero-image' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 animate-fade-in text-slate-800"
          >
            <div>
              <h1 className="font-sans text-2xl sm:text-3xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <Sparkles className="h-7 w-7 text-orange-500" />
                Imagem ou Vídeo de Destaque / Card Hero
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Suba e configure a imagem ou vídeo de destaque da vitrine principal. A borda neon e o glow se ajustam automaticamente ao redor do seu arquivo (suporta MP4 e WebM).
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* CONFIG PANEL - 7 cols */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-150 pb-2">
                    Uploader e Parâmetros
                  </h3>

                  {/* Image/Video Select Control */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Selecione uma Imagem ou Vídeo (Com ou sem fundo)
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
                        siteSettings.heroImageUrl ? 'border-green-300 bg-green-50/20' : 'border-slate-350 hover:border-orange-400 bg-slate-50'
                      }`}>
                        <Upload className={`h-8 w-8 mb-2 ${siteSettings.heroImageUrl ? 'text-green-500 animate-bounce' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold uppercase text-slate-700">
                          {isUploadingHero ? 'Enviando Arquivo...' : 'Subir Vídeo ou Imagem'}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">Formatos: PNG, JPG, WEBP, GIF, MP4, WEBM</span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleHeroImageUpload}
                          disabled={isUploadingHero}
                          className="hidden"
                        />
                      </label>

                      {/* Remove Image Action */}
                      {siteSettings.heroImageUrl ? (
                        <div className="flex flex-col justify-center bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-2 truncate">URL da mídia ativa:</span>
                          <p className="text-[10px] font-mono text-slate-600 break-all leading-normal bg-white p-2 rounded border border-slate-150 max-h-12 overflow-y-auto mb-3">
                            {siteSettings.heroImageUrl}
                          </p>
                          <button
                            type="button"
                            onClick={handleRemoveHeroImage}
                            className="text-center rounded-lg border border-red-200 hover:bg-red-50 hover:border-red-300 text-red-650 font-bold text-[10px] uppercase py-2.5 transition-colors cursor-pointer"
                          >
                            Remover Mídia / Usar Padrão
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col justify-center items-center bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
                          <span className="text-[11px] font-semibold text-slate-400 italic">Nenhuma mídia enviada ainda.</span>
                          <span className="text-[10px] text-slate-400 mt-1 leading-normal">Utilizando pneu padrão da Home com borda neon laranja.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Neon custom values sliders */}
                  <div className="space-y-4 pt-4 border-t border-slate-150">
                    
                    {/* Borda Neon Presets */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Atalhos de Cores Neon (Temas Rápidos)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { name: 'Laranja LED', border: '#f97316', glow: '#ea580c' },
                          { name: 'Vermelho Nitro', border: '#ef4444', glow: '#b91c1c' },
                          { name: 'Verde Ácido', border: '#22c55e', glow: '#15803d' },
                          { name: 'Laser Ciano', border: '#06b6d4', glow: '#0891b2' },
                          { name: 'Voltagem Amarela', border: '#eab308', glow: '#ca8a04' },
                          { name: 'Plasma Roxo', border: '#a855f7', glow: '#7e22ce' },
                        ].map((swatch, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSiteSettings(prev => ({
                                ...prev,
                                heroBorderColor: swatch.border,
                                heroGlowColor: swatch.glow
                              }));
                              triggerFeedback(`Cor alterada para ${swatch.name}!`);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-350 text-[10px] font-extrabold uppercase bg-white cursor-pointer transition-all"
                          >
                            <span className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ backgroundColor: swatch.border }} />
                            <span>{swatch.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Border Color Pick */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Cor da Borda Neon Fina
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={siteSettings.heroBorderColor || '#f97316'}
                            onChange={(e) => setSiteSettings({ ...siteSettings, heroBorderColor: e.target.value })}
                            className="h-10 w-12 rounded cursor-pointer border border-slate-250 p-1 bg-transparent"
                          />
                          <input
                            type="text"
                            value={siteSettings.heroBorderColor || '#f97316'}
                            onChange={(e) => setSiteSettings({ ...siteSettings, heroBorderColor: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800 uppercase outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>

                      {/* Glow Color Pick */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Cor do Brilho / Glow
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={siteSettings.heroGlowColor || '#f97316'}
                            onChange={(e) => setSiteSettings({ ...siteSettings, heroGlowColor: e.target.value })}
                            className="h-10 w-12 rounded cursor-pointer border border-slate-250 p-1 bg-transparent"
                          />
                          <input
                            type="text"
                            value={siteSettings.heroGlowColor || '#f97316'}
                            onChange={(e) => setSiteSettings({ ...siteSettings, heroGlowColor: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800 uppercase outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      {/* Border Radius px Slider */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Arredondamento dos Cantos
                          </label>
                          <span className="text-[10px] font-mono font-bold text-slate-400">{(siteSettings.heroBorderRadius || '24')}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="60"
                          step="1"
                          value={siteSettings.heroBorderRadius || '24'}
                          onChange={(e) => setSiteSettings({ ...siteSettings, heroBorderRadius: e.target.value })}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none focus:ring-0"
                        />
                        <span className="block text-[8.5px] text-slate-400 leading-normal">Determina os cantos redondos da imagem e da borda neon ligada à ela.</span>
                      </div>

                      {/* Glow Strength Slider */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Intensidade do Neon & Brilho
                          </label>
                          <span className="text-[10px] font-mono font-bold text-slate-400">{(parseFloat(siteSettings.heroGlowIntensity || '0.4') * 100).toFixed(0)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={siteSettings.heroGlowIntensity || '0.4'}
                          onChange={(e) => setSiteSettings({ ...siteSettings, heroGlowIntensity: e.target.value })}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none focus:ring-0"
                        />
                        <span className="block text-[8.5px] text-slate-400 leading-normal">Controla a opacidade e a força do brilho holográfico projetado atrás do card.</span>
                      </div>
                    </div>

                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-150">
                    <button
                      type="button"
                      onClick={handleSaveHeroSettings}
                      disabled={isSavingLogo}
                      className="rounded-lg bg-orange-600 hover:bg-orange-500 text-slate-950 px-6 py-3.5 text-xs font-black uppercase cursor-pointer shadow-md shadow-orange-600/10 disabled:opacity-50"
                    >
                      {isSavingLogo ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>

                </div>

                {/* FEATURED BANNER CARD CONTROLS */}
                <div id="banner-destaque-config" className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-150 pb-2">
                    Banner de Destaque Extra (Home)
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    Gerencie aqui um banner visual de promoção ou propaganda em destaque na Home (suporta imagens ou vídeos em formato horizontal).
                  </p>

                  <div className="space-y-4">
                    {/* URL Field input */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        URL do Banner Destaque
                      </label>
                      <input
                        type="text"
                        value={siteSettings.featuredMediaUrl || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, featuredMediaUrl: e.target.value })}
                        placeholder="Ex: Link direto da imagem/vídeo ou faça o upload abaixo..."
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-orange-500 transition-all font-sans font-medium"
                      />
                    </div>

                    {/* Alt Text field */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Texto Alternativo (Alt / Acessibilidade)
                      </label>
                      <input
                        type="text"
                        value={siteSettings.featuredMediaAlt || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, featuredMediaAlt: e.target.value })}
                        placeholder="Ex: Oferta Especial Pneus Pirelli"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-orange-500 transition-all font-sans font-medium"
                      />
                    </div>

                    {/* Type select */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Tipo de Mídia
                      </label>
                      <select
                        value={siteSettings.featuredMediaType || 'image'}
                        onChange={(e) => setSiteSettings({ ...siteSettings, featuredMediaType: e.target.value as 'image' | 'video' })}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-orange-500 transition-all font-sans font-medium"
                      >
                        <option value="image">Imagem (JPG, PNG, WEBP)</option>
                        <option value="video">Vídeo (MP4, WEBM)</option>
                      </select>
                    </div>

                    {/* Uploader */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
                        siteSettings.featuredMediaUrl ? 'border-green-300 bg-green-50/20' : 'border-slate-350 hover:border-orange-400 bg-slate-50'
                      }`}>
                        <Upload className={`h-8 w-8 mb-2 ${siteSettings.featuredMediaUrl ? 'text-green-500 animate-bounce' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold uppercase text-slate-700 font-sans">
                          {isUploadingHero ? 'Enviando...' : 'Subir Vídeo ou Imagem'}
                        </span>
                        <span className="text-[9px] text-slate-400 mt-1">PNG, JPG, WEBP, MP4, WEBM</span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleFeaturedMediaUpload}
                          disabled={isUploadingHero}
                          className="hidden"
                        />
                      </label>

                      {siteSettings.featuredMediaUrl ? (
                        <div className="flex flex-col justify-center bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Previsualização do Banner:</span>
                          <div className="relative h-20 w-full rounded border border-slate-200 bg-slate-100 flex items-center justify-center p-0.5 shrink-0 overflow-hidden mb-3">
                            <MediaRenderer 
                              src={siteSettings.featuredMediaUrl} 
                              mediaType={siteSettings.featuredMediaType} 
                              alt="Banner de Destaque" 
                              className="h-full w-full object-cover rounded" 
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveFeaturedMedia}
                            className="text-center rounded-lg border border-red-200 hover:bg-red-50 hover:border-red-300 text-red-650 font-bold text-[10px] uppercase py-2 transition-colors cursor-pointer font-sans"
                          >
                            Remover Banner
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col justify-center items-center bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
                          <span className="text-[11px] font-semibold text-slate-400 italic font-sans animate-fade-in">Nenhum banner ativo.</span>
                          <span className="text-[10px] text-slate-400 mt-1 leading-normal font-sans">O banner de destaque não será exibido na página inicial se estiver vazio.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar for Featured Banner */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-150">
                    <button
                      type="button"
                      onClick={handleSaveHeroSettings}
                      disabled={isSavingLogo}
                      className="rounded-lg bg-orange-600 hover:bg-orange-500 text-slate-950 px-6 py-3.5 text-xs font-black uppercase cursor-pointer shadow-md shadow-orange-600/10 disabled:opacity-50"
                    >
                      {isSavingLogo ? 'Salvando...' : 'Salvar Banner Destaque'}
                    </button>
                  </div>
                </div>
              </div>

              {/* LIVE DOCK PREVIEW CARD - 5 cols */}
              <div className="lg:col-span-5 flex flex-col justify-between rounded-xl bg-[#091122] border border-slate-800 p-5 shadow-inner">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/85 pb-2">
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400">PRÉ-VISUALIZAÇÃO EM TEMPO REAL</span>
                    <span className="flex items-center gap-1 text-[9px] font-mono bg-orange-900/40 text-orange-400 font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border border-orange-500/25">
                      ● Simulador
                    </span>
                  </div>

                  <div className="h-72 w-full rounded-lg bg-slate-950 border border-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
                    
                    {/* Dark Grid Automotive style background */}
                    <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
                      backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px), radial-gradient(#1e293b 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 10px 10px'
                    }} />

                    {/* Background Soft Glow */}
                    <div 
                      className="absolute rounded-full pointer-events-none blur-3xl transition-all duration-300"
                      style={{
                        width: '280px',
                        height: '280px',
                        backgroundColor: siteSettings.heroGlowColor || '#f97316',
                        opacity: parseFloat(siteSettings.heroGlowIntensity || '0.4') * 0.15,
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    />

                    {/* Animated Neon Wrapper adjusted closely around image or video */}
                    <div
                      className="inline-block relative shrink-0 max-w-full max-h-full transition-all duration-300"
                      style={{
                        borderRadius: `${siteSettings.heroBorderRadius || 24}px`,
                        border: `1px solid ${siteSettings.heroBorderColor || '#f97316'}`,
                        boxShadow: `0 0 ${8 * parseFloat(siteSettings.heroGlowIntensity || '0.4')}px ${siteSettings.heroBorderColor || '#f97316'}, inset 0 0 ${4 * parseFloat(siteSettings.heroGlowIntensity || '0.4')}px ${siteSettings.heroBorderColor || '#f97316'}, 0 0 ${30 * parseFloat(siteSettings.heroGlowIntensity || '0.4')}px ${siteSettings.heroGlowColor || '#f97316'}`
                      }}
                    >
                      {isVideoUrl(siteSettings.heroImageUrl) ? (
                        <video
                          src={siteSettings.heroImageUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="max-h-56 max-w-full object-contain block select-none pointer-events-none"
                          style={{
                            borderRadius: `${siteSettings.heroBorderRadius || 24}px`,
                          }}
                        />
                      ) : (
                        <img
                          src={siteSettings.heroImageUrl || 'https://raw.githubusercontent.com/antigravityai/wheelcenter/main/assets/featured-tire.png'}
                          alt="Preview Destaque"
                          className="max-h-56 max-w-full object-contain block select-none pointer-events-none"
                          style={{
                            borderRadius: `${siteSettings.heroBorderRadius || 24}px`,
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400';
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-2 border-t border-slate-800/80 pt-4 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest block">Ajuste de Container:</span>
                    <span className="text-emerald-400 font-bold block">Automático (Conteúdo Útil)</span>
                  </div>
                  <p className="leading-snug text-[10px] text-slate-500">
                    O card se alinha perfeitamente ao redor do desenho físico da sua imagem ou vídeo! Evitando caixas vazias ou sobrando espaços mortos. Os cantos arredondados suavizam o corte automático.
                  </p>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 6: BRAND MANAGEMENT (MARCAS) */}
        {activeTab === 'marcas' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 animate-fade-in text-slate-800"
          >
            <div>
              <h1 className="font-sans text-2xl sm:text-3xl font-black text-slate-800 uppercase tracking-tight">Gerenciamento de Marcas</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Adicione, edite e remova marcas do catálogo. Configure os logotipos oficiais para exibição na página inicial e filtros do site.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* BRAND FORM */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-fit space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-150 pb-2 flex items-center gap-2">
                  <PlusCircle className="h-4.5 w-4.5 text-orange-500" />
                  {editingBrand ? 'Editar Marca' : 'Adicionar Nova Marca'}
                </h3>
                
                <form onSubmit={handleSaveBrand} className="space-y-4">
                  {/* Brand Name Input */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Nome da Marca
                    </label>
                    <input
                      type="text"
                      required
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="Ex: Pirelli"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-orange-500 transition-all font-sans font-medium"
                    />
                  </div>

                  {/* Brand Logo Uploader */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Logo da Marca
                    </label>
                    
                    <div className="flex items-center gap-3 mt-1.5">
                      {brandLogo ? (
                        <div className="relative h-14 w-20 rounded border border-slate-200 bg-slate-100 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                          <img src={brandLogo} alt="Preview" className="h-full w-full object-contain" />
                          <button
                            type="button"
                            onClick={() => setBrandLogo(null)}
                            className="absolute -top-1 -right-1 bg-rose-500 hover:bg-rose-600 text-white p-0.5 rounded-full shadow cursor-pointer flex items-center justify-center"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-14 w-20 rounded border-2 border-dashed border-slate-200 shrink-0 flex items-center justify-center text-slate-400">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}

                      <label className="flex-grow flex items-center justify-center gap-1.5 border border-slate-250 bg-slate-50 hover:bg-slate-100 px-4 py-2 text-xs font-bold text-slate-650 rounded-lg cursor-pointer transition-all">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Subir Imagem</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBrandLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Brand Active Checkbox */}
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="brandActive"
                      checked={brandActive}
                      onChange={(e) => setBrandActive(e.target.checked)}
                      className="rounded border-slate-200 text-orange-550 focus:ring-orange-500 h-4 w-4"
                    />
                    <label htmlFor="brandActive" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                      Marca Ativa no Catálogo
                    </label>
                  </div>

                  {/* Brand Unsaved Warning */}
                  {hasUnsavedBrandChanges && (
                    <div className="text-[11px] font-sans font-bold text-amber-600 flex items-center gap-1.5 bg-amber-50 border border-amber-250 rounded-lg p-2 animate-pulse">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-550 shrink-0" />
                      <span>Alterações não salvas</span>
                    </div>
                  )}

                  {/* Actions Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={isSavingBrand}
                      className="flex-1 bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs py-2.5 rounded-lg uppercase transition-all tracking-wider cursor-pointer disabled:opacity-50"
                    >
                      {isSavingBrand ? 'Salvando...' : (editingBrand ? 'Salvar Alterações' : 'Cadastrar')}
                    </button>
                    {editingBrand && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBrand(null);
                          setBrandName('');
                          setBrandLogo(null);
                          setBrandActive(true);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs px-3.5 py-2.5 rounded-lg uppercase cursor-pointer"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* BRAND LIST DISPLAY */}
              <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-150 pb-2 flex items-center gap-2">
                  <Award className="h-4.5 w-4.5 text-orange-500" />
                  Marcas Cadastradas ({brandsList.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {brandsList.map((brand) => (
                    <div
                      key={brand.id}
                      className={`rounded-xl border p-4 flex flex-col justify-between space-y-3 transition-all ${
                        brand.active ? 'border-slate-200 bg-slate-50' : 'border-slate-150 bg-slate-50/40 opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-16 bg-checkerboard border border-slate-150 rounded p-1 flex items-center justify-center shrink-0">
                          {brand.logo ? (
                            <img src={brand.logo} alt={brand.name} className="h-full w-full object-contain" />
                          ) : (
                            <div className="text-[10px] uppercase font-bold text-slate-400 font-mono text-center leading-none">
                              Sem Logo
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 font-sans">
                          <h4 className="font-bold text-slate-800 truncate text-sm">{brand.name}</h4>
                          <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                            brand.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {brand.active ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-150/65 mt-auto">
                        <button
                          type="button"
                          onClick={() => toggleBrandActive(brand)}
                          className={`text-[10px] font-bold uppercase tracking-wide cursor-pointer ${
                            brand.active ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'
                          }`}
                        >
                          {brand.active ? 'Desativar' : 'Ativar'}
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => initBrandEdit(brand)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold uppercase px-2 py-1 rounded cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBrand(brand.id)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold uppercase p-1.5 rounded cursor-pointer flex items-center justify-center"
                            title="Excluir marca"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 7: RIM CHECK MANAGEMENT (CARDS-DO-ARO) */}
        {activeTab === 'cards-do-aro' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 animate-fade-in text-slate-800"
          >
            <div>
              <h1 className="font-sans text-2xl sm:text-3xl font-black text-slate-800 uppercase tracking-tight">Gerenciamento de Cards de Aro</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Configure os cards de aros com imagens realistas e descrições personalizadas para a seção pública do site.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

              {/* RIM CARD FORM */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-fit space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-150 pb-2 flex items-center gap-2">
                  <PlusCircle className="h-4.5 w-4.5 text-orange-500" />
                  {editingRimCard ? 'Editar Card de Aro' : 'Adicionar Card de Aro'}
                </h3>

                <form onSubmit={handleSaveRimCard} className="space-y-4">
                  {/* Card Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Nome do Card
                    </label>
                    <input
                      type="text"
                      required
                      value={rimCardName}
                      onChange={(e) => setRimCardName(e.target.value)}
                      placeholder="Ex: Aro 15"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-orange-500 transition-all font-sans font-medium"
                    />
                  </div>

                  {/* Rim Number Input */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Número do Aro (Filtro numérico)
                    </label>
                    <input
                      type="number"
                      required
                      min="10"
                      max="30"
                      value={rimCardNumber}
                      onChange={(e) => setRimCardNumber(Number(e.target.value))}
                      placeholder="Ex: 15"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-orange-500 transition-all font-mono font-medium"
                    />
                  </div>

                  {/* Rim Image Input */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Imagem de Fundo do Card
                    </label>
                    
                    <div className="space-y-2 mt-1">
                      <input
                        type="text"
                        value={rimCardImage}
                        onChange={(e) => setRimCardImage(e.target.value)}
                        placeholder="Ex: Link da imagem ou suba um arquivo..."
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-orange-500 transition-all font-sans font-medium"
                      />

                      <div className="flex items-center gap-3">
                        {rimCardImage && (
                          <div className="relative h-14 w-20 rounded border border-slate-200 bg-slate-50 flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                            <MediaRenderer src={rimCardImage} mediaType={rimCardMediaType} alt="Rim Preview" className="h-full w-full object-cover rounded" />
                          </div>
                        )}
                        
                        <label className="flex-grow flex items-center justify-center gap-1.5 border border-slate-250 bg-slate-50 hover:bg-slate-100 px-4 py-2 text-xs font-bold text-slate-650 rounded-lg cursor-pointer transition-all">
                          <Upload className="h-3.5 w-3.5" />
                          <span>Subir pelo Celular</span>
                          <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleRimCardImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Rim Short Description */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Descrição Curta
                    </label>
                    <input
                      type="text"
                      value={rimCardDesc}
                      onChange={(e) => setRimCardDesc(e.target.value)}
                      placeholder="Ex: Para sedans e compactos"
                      className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-orange-500 transition-all font-sans font-medium"
                    />
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="rimCardActive"
                      checked={rimCardActive}
                      onChange={(e) => setRimCardActive(e.target.checked)}
                      className="rounded border-slate-200 text-orange-500 focus:ring-orange-500 h-4 w-4"
                    />
                    <label htmlFor="rimCardActive" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                      Card de Aro Ativo
                    </label>
                  </div>

                  {/* Rim Card Unsaved Warning */}
                  {hasUnsavedRimCardChanges && (
                    <div className="text-[11px] font-sans font-bold text-amber-600 flex items-center gap-1.5 bg-amber-50 border border-amber-250 rounded-lg p-2 animate-pulse">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-550 shrink-0" />
                      <span>Alterações não salvas</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={isSavingRim}
                      className="flex-1 bg-orange-650 hover:bg-orange-600 text-white font-bold text-xs py-2.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSavingRim ? 'Salvando...' : (editingRimCard ? 'Salvar Alterações' : 'Cadastrar')}
                    </button>
                    {editingRimCard && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRimCard(null);
                          setRimCardName('');
                          setRimCardNumber(15);
                          setRimCardImage('');
                          setRimCardDesc('');
                          setRimCardActive(true);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs px-3.5 py-2.5 rounded-lg uppercase cursor-pointer"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* RIMS LIST DISPLAY */}
              <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 font-sans">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-150 pb-2 flex items-center gap-2">
                  <Database className="h-4.5 w-4.5 text-orange-500" />
                  Cards de Aro Cadastrados ({rimCardsList.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rimCardsList.map((card) => (
                    <div
                      key={card.id}
                      className={`rounded-xl border p-4 flex gap-4 items-start ${
                        card.active ? 'border-slate-200 bg-slate-50' : 'border-slate-150 bg-slate-50/40 opacity-70'
                      }`}
                    >
                      <div className="h-16 w-16 bg-checkerboard border border-slate-200 rounded overflow-hidden p-0.5 shrink-0 flex items-center justify-center">
                        <MediaRenderer src={card.image} mediaType={card.mediaType} alt={card.name} className="h-full w-full object-contain rounded animate-fade-in" />
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-slate-800 text-sm truncate">{card.name} (Aro {card.rim})</h4>
                          <span className={`inline-block text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                            card.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {card.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{card.description || 'Sem descrição cadastrada'}</p>
                        
                        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-150/40">
                          <button
                            type="button"
                            onClick={() => toggleRimCardActive(card)}
                            className={`text-[9px] font-bold uppercase tracking-wide cursor-pointer ${
                              card.active ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'
                            }`}
                          >
                            {card.active ? 'Desativar' : 'Ativar'}
                          </button>
                          
                          <div className="flex items-center gap-2 ml-auto">
                            <button
                              type="button"
                              onClick={() => initRimCardEdit(card)}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[9px] font-bold uppercase px-2 py-0.5 rounded cursor-pointer"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRimCard(card.id)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1 rounded cursor-pointer flex items-center justify-center"
                              title="Excluir card"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 8: CSV IMPORT & EXPORT */}
        {activeTab === 'import-export' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 animate-fade-in text-slate-800"
          >
            <div>
              <h1 className="font-sans text-2xl sm:text-3xl font-black text-slate-800 uppercase tracking-tight">Importar e Exportar Catálogo</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Gerencie todos os seus pneus em lote através de arquivos CSV. Atualize preços, aros, descrições e crie novos produtos instantaneamente sem complicação manual.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CARD 1: DOWNLOAD PATTERN AND CATALOG EXPORT */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2 uppercase tracking-wide">
                    <Download className="h-4.5 w-4.5 text-orange-500" />
                    Exportações e Arquivo de Modelo
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Baixe o arquivo de modelo pré-formatado ou extraia o catálogo atualizado do seu site em formato padrão Excel/CSV.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">1. Modelo de Cadastro Padrão</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                      O arquivo modelo contém todas as 15 colunas obrigatórias e opcionais pré-configuradas. Use-o para preencher e organizar os pneus de acordo com o nosso motor de importação.
                    </p>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="inline-flex items-center gap-2 rounded-lg bg-orange-650 hover:bg-orange-600 text-white text-[10px] font-bold uppercase transition-all tracking-wider px-4 py-2 cursor-pointer shadow-xs"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Baixar Modelo CSV
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">2. Backup do Catálogo Atual</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                      Deseja atualizar dados em lote? Exporte o catálogo atual, faça todas as correções de preços, descrições ou novas medidas de forma prática no Google Planilhas ou Excel, e depois envie novamente.
                    </p>
                    <button
                      type="button"
                      onClick={handleExportCatalog}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-white text-[10px] font-bold uppercase transition-all tracking-wider px-4 py-2 cursor-pointer shadow-xs"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Exportar Todos ({productsList.length}) Pneus
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD 2: FILE LOADER */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2 uppercase tracking-wide">
                    <Upload className="h-4.5 w-4.5 text-blue-500" />
                    Enviar e Importar Planilha CSV
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Carregue seu arquivo de extensão CSV e o motor irá varrer linha a linha atualizando pneus existentes e adicionando os novos em massa.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-200 hover:border-orange-400 rounded-xl p-6 text-center cursor-pointer transition-all bg-slate-50 hover:bg-slate-50/80 relative">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-2 flex flex-col items-center justify-center">
                      <Upload className="h-8 w-8 text-slate-400" />
                      <div className="text-xs font-bold text-slate-700 select-none">
                        {selectedFile ? selectedFile.name : 'Vincule seu arquivo para iniciar...'}
                      </div>
                      <p className="text-[10px] text-slate-400 select-none">Tamanho máximo: 10MB. Extensão: .csv</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={handleParseAndValidate}
                      disabled={!selectedFile || isImporting}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-850 font-bold text-xs uppercase py-3 rounded-lg transition-all cursor-pointer disabled:opacity-50 text-center"
                    >
                      Analisar e Validar Dados
                    </button>
                    <button
                      type="button"
                      onClick={handleImportData}
                      disabled={!parsedData || isImporting || errorsList.length > 0}
                      className="flex-1 bg-orange-650 hover:bg-orange-600 text-white font-bold text-xs uppercase py-3 rounded-lg transition-all cursor-pointer disabled:opacity-50 text-center shadow-md shadow-orange-650/15"
                    >
                      {isImporting ? 'Cadastrando...' : 'Confirmar Importação'}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* ERROR REPORT LOG OR CONFIRMATION DIALS */}
            {(reports || errorsList.length > 0 || isImporting) && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 font-sans">
                <h3 className="font-sans font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center justify-between">
                  <span>Relatório de Execução & Diagnóstico</span>
                  {isImporting && (
                    <span className="text-xs text-amber-600 animate-pulse font-mono font-bold">
                      Processando e gravando linha {importProgress.current} de {importProgress.total}...
                    </span>
                  )}
                </h3>

                {isImporting && (
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-orange-500 h-full transition-all duration-300"
                      style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                    />
                  </div>
                )}

                {/* Validation Errors Panel */}
                {errorsList.length > 0 && (
                  <div className="rounded-xl border border-rose-250 bg-rose-50 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-rose-700 font-bold text-xs font-sans">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                      <span>Inconsistências Encontradas - Correção Requerida antes de prosseguir:</span>
                    </div>
                    <ul className="text-[11px] text-rose-600 font-mono space-y-1 list-disc list-inside max-h-48 overflow-y-auto">
                      {errorsList.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Success Report Panel */}
                {reports && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-lg border border-emerald-250 bg-emerald-50 p-4 text-center">
                      <span className="text-[10px] text-emerald-700 uppercase tracking-widest block font-bold mb-1">Novos Pneus Gravados</span>
                      <p className="text-2xl font-black text-emerald-850">{reports.created}</p>
                    </div>
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-center">
                      <span className="text-[10px] text-indigo-700 uppercase tracking-widest block font-bold mb-1">Pneus Atualizados</span>
                      <p className="text-2xl font-black text-indigo-850">{reports.updated}</p>
                    </div>
                    <div className="rounded-lg border border-amber-250 bg-amber-50 p-4 text-center">
                      <span className="text-[10px] text-amber-700 uppercase tracking-widest block font-bold mb-1">Total de Linhas</span>
                      <p className="text-2xl font-black text-amber-800">{reports.total}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 10: BULK ADJUSTMENTS & MEDIA */}
        {activeTab === 'midia-massa' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 animate-fade-in text-slate-800"
          >
            <div>
              <h1 className="font-sans text-2xl sm:text-3xl font-black text-slate-800 uppercase tracking-tight">Ajustes e Processamento em Lote</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Configure mídias e selos padrão por aro para aplicação em massa ou realize reajustes de preço globais rapidamente com filtros avançados.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">

              {/* SECTION: ADMIN BULK MEDIA & SEALS BY RIM */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2 uppercase tracking-wide">
                      <Folder className="h-4.5 w-4.5 text-orange-500" />
                      Mídias e Selos Padrão por Aro
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Defina uma foto padrão do pneu ou um selo do INMETRO/CONPET específico para cada Aro. Ao clicar nas ações de lote, todos os pneus correspondentes serão atualizados automaticamente.
                    </p>
                  </div>

                  {bulkProcessing && (
                    <div className="p-4 bg-orange-50 border border-orange-200 text-orange-850 rounded-lg flex items-center gap-2.5 animate-pulse text-xs font-bold uppercase tracking-wider">
                      <Clock className="h-4.5 w-4.5 text-orange-600 animate-spin" />
                      Processando alterações em lote na base de dados... Por favor, aguarde.
                    </div>
                  )}

                  {/* Rim Selection Tabs */}
                  <div className="space-y-2 pb-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest font-sans">
                      Selecione o Aro para Configurar:
                    </label>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((rNum) => (
                        <button
                          key={rNum}
                          type="button"
                          onClick={() => setSelectedRimBulkTab(rNum)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border cursor-pointer ${
                            selectedRimBulkTab === rNum
                              ? 'bg-orange-600 text-slate-950 border-orange-600 shadow-md shadow-orange-500/10 font-bold'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-750 border-slate-200'
                          }`}
                        >
                          Aro {rNum}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    {(() => {
                      const rimNum = selectedRimBulkTab;
                      const mediaItem = rimDefaultMedia.find(m => m.rim === rimNum);
                      const sealItem = rimInmetroSeals.find(s => s.rim === rimNum);

                      return (
                        <div key={rimNum} className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-5 animate-fade-in text-slate-800">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <span className="font-sans font-black text-slate-800 text-sm uppercase tracking-wide">Mídias e Selo do Aro {rimNum}</span>
                            <span className="text-[10px] text-slate-400 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">Aro {rimNum} Ativo</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* BLOCK 1: DEFAULT IMAGE */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-4 flex flex-col justify-between">
                              <div>
                                <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                  <ImageIcon className="h-4 w-4 text-orange-500" />
                                  Foto Padrão do Aro {rimNum}
                                </h4>
                                {mediaItem?.image_url ? (
                                  <div className="h-32 w-full border border-slate-150 rounded-lg overflow-hidden p-1 bg-checkerboard flex items-center justify-center relative group">
                                    <img 
                                      src={mediaItem.image_url} 
                                      alt={`Preview Aro ${rimNum}`} 
                                      className="h-full w-full object-contain rounded" 
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <a 
                                        href={mediaItem.image_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-white text-[11px] font-bold underline"
                                        referrerPolicy="no-referrer"
                                      >
                                        Ver original
                                      </a>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-32 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400">
                                    <ImageIcon className="h-7 w-7 text-slate-300 mb-1" />
                                    <span className="text-[10px] font-semibold uppercase text-slate-40 tracking-wider">Sem foto padrão</span>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-3 mt-3">
                                <label className="block">
                                  <span className="sr-only">Escolher foto</span>
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    disabled={bulkProcessing}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleUploadRimMedia(rimNum, file);
                                    }}
                                    className="block w-full text-[11px] text-slate-500 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                                  />
                                </label>

                                {mediaItem?.image_url && (
                                  <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                                    <button
                                      type="button"
                                      disabled={bulkProcessing}
                                      onClick={() => triggerBulkApplyImages(rimNum, 'only_empty')}
                                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-755 text-xs font-bold py-2 px-2 rounded-lg uppercase tracking-wider text-center cursor-pointer border border-slate-250 transition-colors"
                                      title="Aplica somente nos pneus que estão sem imagem"
                                    >
                                      Aplicar apenas nos sem foto (Aro {rimNum})
                                    </button>
                                    <button
                                      type="button"
                                      disabled={bulkProcessing}
                                      onClick={() => triggerBulkApplyImages(rimNum, 'replace_all')}
                                      className="w-full bg-orange-500 hover:bg-orange-400 text-slate-950 text-xs font-black py-2 px-2 rounded-lg uppercase tracking-wider text-center cursor-pointer shadow-sm transition-colors"
                                      title="Substitui a imagem de todos os pneus deste aro com a foto padrão"
                                    >
                                      Substituir TODOS do Aro {rimNum}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* BLOCK 2: INMETRO SEAL */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-4 flex flex-col justify-between">
                              <div>
                                <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                  <Award className="h-4 w-4 text-orange-500" />
                                  Selo INMETRO / CONPET Aro {rimNum}
                                </h4>
                                {sealItem?.seal_url ? (
                                  <div className="h-32 w-full border border-slate-150 rounded-lg overflow-hidden p-1 bg-checkerboard flex items-center justify-center relative group">
                                    <img 
                                      src={sealItem.seal_url} 
                                      alt={`Selo Aro ${rimNum}`} 
                                      className="h-full w-full object-contain rounded" 
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <a 
                                        href={sealItem.seal_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-white text-[11px] font-bold underline"
                                        referrerPolicy="no-referrer"
                                      >
                                        Ver original
                                      </a>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-32 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400">
                                    <Award className="h-7 w-7 text-slate-300 mb-1" />
                                    <span className="text-[10px] font-semibold uppercase text-slate-45 tracking-wider">Sem selo padrão</span>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-3 mt-3">
                                <label className="block">
                                  <span className="sr-only">Escolher selo</span>
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    disabled={bulkProcessing}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleUploadRimSeal(rimNum, file);
                                    }}
                                    className="block w-full text-[11px] text-slate-500 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                                  />
                                </label>

                                {sealItem?.seal_url && (
                                  <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                                    <button
                                      type="button"
                                      disabled={bulkProcessing}
                                      onClick={() => triggerBulkApplySeals(rimNum, 'only_empty')}
                                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-755 text-xs font-bold py-2 px-2 rounded-lg uppercase tracking-wider text-center cursor-pointer border border-slate-250 transition-colors"
                                      title="Associa o selo apenas aos pneus que não possuem selo ainda"
                                    >
                                      Aplicar apenas nos sem selo (Aro {rimNum})
                                    </button>
                                    <button
                                      type="button"
                                      disabled={bulkProcessing}
                                      onClick={() => triggerBulkApplySeals(rimNum, 'replace_all')}
                                      className="w-full bg-orange-500 hover:bg-orange-400 text-slate-950 text-xs font-black py-2 px-2 rounded-lg uppercase tracking-wider text-center cursor-pointer shadow-sm transition-colors"
                                      title="Substitui o selo de todos os pneus deste aro pelo cadastrado"
                                    >
                                      Substituir TODOS do Aro {rimNum}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* SIDE SECTION: BULK PRICE ADJUSTMENTS */}
              <div className="space-y-6">
                <div className="bg-[#0B1B32] text-white rounded-xl border border-slate-700/60 p-6 shadow-md space-y-6">
                  <div>
                    <h3 className="font-sans font-bold text-white text-sm flex items-center gap-2 border-b border-slate-700/60 pb-2 uppercase tracking-wide">
                      <Wrench className="h-4.5 w-4.5 text-orange-500" />
                      Reajuste de Preço em Massa
                    </h3>
                    <p className="text-xs text-slate-350 mt-1 leading-relaxed">
                      Efetue reajustes de preço globais ou direcionados em massa na base de dados de forma instantânea.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* OPERATION: ADD / SUBTRACT */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-350 block">Operação Comercial</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setBulkPriceAction('add')}
                          className={`py-2 px-3 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            bulkPriceAction === 'add'
                              ? 'bg-orange-500 text-slate-950 font-black shadow-md'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                          }`}
                        >
                          Acrescentar % (+)
                        </button>
                        <button
                          type="button"
                          onClick={() => setBulkPriceAction('subtract')}
                          className={`py-2 px-3 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            bulkPriceAction === 'subtract'
                              ? 'bg-orange-500 text-slate-950 font-black shadow-md'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                          }`}
                        >
                          Descontar % (-)
                        </button>
                      </div>
                    </div>

                    {/* VALOR PERCENTUAL */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-350 block" htmlFor="bulk-percent">Porcentagem do Ajuste (%)</label>
                      <div className="relative">
                        <input
                          id="bulk-percent"
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="Ex: 5 ou 11.5"
                          value={bulkPricePercent}
                          onChange={(e) => setBulkPricePercent(e.target.value)}
                          className="w-full bg-[#132742] hover:bg-[#162d4c] focus:bg-[#183256] text-white border border-slate-700 rounded-lg py-2.5 px-4 text-sm font-bold placeholder-slate-500 outline-hidden transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="absolute right-3.5 top-2.5 text-slate-400 font-bold text-sm select-none">%</span>
                      </div>
                    </div>

                    {/* FILTER ARO */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-350 block" htmlFor="bulk-rim">Filtrar por Aro</label>
                      <select
                        id="bulk-rim"
                        value={bulkPriceRimFilter}
                        onChange={(e) => setBulkPriceRimFilter(e.target.value)}
                        className="w-full bg-[#132742] border border-slate-700 text-slate-200 rounded-lg py-2.5 px-3 text-xs font-bold block outline-hidden cursor-pointer"
                      >
                        <option value="Todos">Todos os Aros</option>
                        {[13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map(rim => (
                          <option key={rim} value={String(rim)}>Aro {rim}</option>
                        ))}
                      </select>
                    </div>

                    {/* FILTER MARCA */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-350 block" htmlFor="bulk-brand">Filtrar por Marca</label>
                      <select
                        id="bulk-brand"
                        value={bulkPriceBrandFilter}
                        onChange={(e) => setBulkPriceBrandFilter(e.target.value)}
                        className="w-full bg-[#132742] border border-slate-700 text-slate-200 rounded-lg py-2.5 px-3 text-xs font-bold block outline-hidden cursor-pointer"
                      >
                        <option value="Todas">Todas as Marcas</option>
                        {brandsList.map(brand => (
                          <option key={brand.id} value={brand.name}>{brand.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-4 border-t border-slate-700/60 !mt-6 space-y-3.5">
                      <button
                        type="button"
                        disabled={bulkProcessing || !bulkPricePercent}
                        onClick={handleBulkPriceAdjustment}
                        className="w-full bg-orange-500 hover:bg-orange-450 disabled:bg-slate-750 disabled:text-slate-500 text-slate-950 font-extrabold text-xs uppercase tracking-widest rounded-lg py-3 transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
                      >
                        {bulkProcessing ? (
                          <>
                            <Clock className="w-4 h-4 animate-spin text-slate-950" />
                            Processando...
                          </>
                        ) : (
                          'Aplicar Reajuste em Lote'
                        )}
                      </button>

                      <div className="p-3 bg-[#132742] border border-slate-700 rounded-lg space-y-1.5 select-none animate-fade-in">
                        <span className="block text-[8px] font-black uppercase tracking-widest text-orange-400">Regras de Validação</span>
                        <ul className="text-[9.5px] text-slate-350 leading-relaxed font-mono list-disc list-inside space-y-1">
                          <li>Preço nunca será menor que R$ 1,00.</li>
                          <li>Preços sofrem arredondamento de 2 casas decimais.</li>
                          <li>Aparece de forma nativa no site (reajuste interno, sem tags de desconto ou promoção).</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
}
