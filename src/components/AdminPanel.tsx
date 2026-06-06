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
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  clearDemoProducts
} from '../lib/appStore';
import { supabase, uploadFile, isSupabaseUrlAbsent, isSupabaseKeyAbsent } from '../lib/supabaseClient';
import { BRANDS } from '../data';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'add-product' | 'logo-identity' | 'site-settings' | 'marcas' | 'cards-do-aro'>('overview');
  
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
    slogan: ''
  });
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);

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
  const [rimCardDesc, setRimCardDesc] = useState('');
  const [rimCardActive, setRimCardActive] = useState(true);

  // Editing state for products
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  // Delete Confirmation ID Modal
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
      const priceNum = parseFloat(prodPrice);
      const parsedPrice = isNaN(priceNum) ? undefined : priceNum;

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
        active: prodIsActive
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
        active: rimCardActive
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

  const handleRimCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!(await checkAuth())) return;

    setIsUploadingImage(true);
    try {
      const publicUrl = await uploadFile('pneu-center', 'rims', file);
      setRimCardImage(publicUrl);
      triggerFeedback('Imagem do card de aro enviada com sucesso!');
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
              { id: 'marcas', label: 'Marcas', icon: Award },
              { id: 'cards-do-aro', label: 'Cards de Aro', icon: Database },
              { id: 'logo-identity', label: 'Logo e Identidade', icon: ImageIcon },
              { id: 'site-settings', label: 'Configurações do Site', icon: SettingsIcon },
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
                  onClick={() => initProductForm(null)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs uppercase px-4 py-2.5 transition-all text-center shadow-md shadow-orange-600/10 cursor-pointer"
                >
                  <Plus className="h-4.5 w-4.5" />
                  <span>Novo Pneu</span>
                </button>
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
                    {productsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-400 font-sans">
                          Nenhum pneu cadastrado no portfólio.
                        </td>
                      </tr>
                    ) : (
                      productsList.map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="h-12 w-16 rounded border bg-checkerboard overflow-hidden flex items-center justify-center">
                              <img src={prod.image} alt={prod.name} className="h-full w-full object-contain p-1" />
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
                  {productsList.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 font-sans text-xs">
                      Nenhum pneu cadastrado no portfólio.
                    </div>
                  ) : (
                    productsList.map((prod) => (
                      <div key={prod.id} className="p-4 space-y-4 font-sans">
                        <div className="flex gap-3">
                          <div className="h-16 w-20 rounded border bg-checkerboard overflow-hidden flex items-center justify-center shrink-0">
                            <img src={prod.image} alt={prod.name} className="h-full w-full object-contain p-1" />
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
                    disabled={prodPriceStatus === 'sob_consulta'}
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="Ex: 399.90"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-mono disabled:opacity-50"
                  />
                </div>

                {/* Price status choice */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Regra para Exibição de Preço
                  </label>
                  <div className="grid grid-cols-2 gap-4 mt-1">
                    {[
                      { id: 'sob_consulta', label: 'Econdido (Sob Consulta)' },
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
                            <img src={rimCardImage} alt="Rim Preview" className="h-full w-full object-cover rounded" />
                          </div>
                        )}
                        
                        <label className="flex-grow flex items-center justify-center gap-1.5 border border-slate-250 bg-slate-50 hover:bg-slate-100 px-4 py-2 text-xs font-bold text-slate-650 rounded-lg cursor-pointer transition-all">
                          <Upload className="h-3.5 w-3.5" />
                          <span>Subir pelo Celular</span>
                          <input
                            type="file"
                            accept="image/*"
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
                        <img src={card.image} alt={card.name} className="h-full w-full object-contain rounded" />
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

      </main>
    </div>
  );
}
