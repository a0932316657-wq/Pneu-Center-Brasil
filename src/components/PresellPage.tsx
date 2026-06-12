import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MessageSquare, 
  ChevronRight, 
  Award, 
  Truck, 
  CreditCard, 
  Clock, 
  UserCheck, 
  Building2, 
  Sparkles, 
  AlertTriangle,
  FileText,
  HelpCircle,
  CheckCircle,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getPresellSettings, 
  getPresellRimCards, 
  getPresellBrandCards, 
  getLogo,
  getSettings,
  getBrands,
  Brand
} from '../lib/appStore';
import { PresellRimCard, PresellBrandCard, PresellSettings } from '../types';
import { supabase } from '../lib/supabaseClient';

// Backup image imports if custom URLs are missing
import defaultHeroTire from '../assets/images/hero_tires_1780836675879.png';

const WhatsAppIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg 
    className={`${className}`} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.006c6.56 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function PresellPage() {
  const [settings, setSettings] = useState<PresellSettings>(getPresellSettings());
  const [rimCards, setRimCards] = useState<PresellRimCard[]>(() => {
    return getPresellRimCards().filter((card) => card.active);
  });

  // State to record failed image URLs to fall back to text
  const [failedBrandImages, setFailedBrandImages] = useState<Record<string, boolean>>({});

  // Fetch active brands directly from the 'brands' table in Supabase
  const loadBrandsLiveFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('active', true);
      
      if (error) throw error;
      
      if (data) {
        const loaded = data.map((row: any) => ({
          id: row.id?.toString() || '',
          brand_name: row.name || '',
          logo_url: row.logo_url || row.logo || '',
          active: row.active !== false,
          whatsapp_message: `Olá, gostaria de consultar pneus da marca ${row.name}.`
        }));
        
        // Remove duplicates by brand_name to ensure clean presentation
        const tracker = new Set<string>();
        const uniqueList: any[] = [];
        for (const item of loaded) {
          const key = (item.brand_name || '').trim().toLowerCase();
          if (key && !tracker.has(key)) {
            tracker.add(key);
            uniqueList.push(item);
          }
        }
        setBrandCards(uniqueList);
      }
    } catch (err) {
      console.warn('Erro ao carregar marcas diretamente do Supabase na página Presell:', err);
    }
  };

  const [brandCards, setBrandCards] = useState<any[]>(() => {
    // Immediate render with local cache on initialization
    return getBrands().filter(b => b.active).map(b => ({
      id: b.id,
      brand_name: b.name,
      logo_url: b.logo || '',
      whatsapp_message: `Olá, gostaria de consultar pneus da marca ${b.name}.`,
      active: b.active
    }));
  });

  const [logo, setLogo] = useState<string | null>(getLogo());
  const [storeSettings, setStoreSettings] = useState(() => getSettings());

  // Policies active accordion state
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  useEffect(() => {
    loadBrandsLiveFromSupabase();

    const handleSettingsUpdate = () => {
      setSettings(getPresellSettings());
    };
    const handleRimCardsUpdate = () => {
      setRimCards(getPresellRimCards().filter((card) => card.active));
    };
    const handleBrandsUpdate = () => {
      loadBrandsLiveFromSupabase();
    };
    const handleLogoUpdate = () => {
      setLogo(getLogo());
    };
    const handleStoreSettingsUpdate = () => {
      setStoreSettings(getSettings());
    };

    window.addEventListener('pneu_center_presell_settings_updated', handleSettingsUpdate);
    window.addEventListener('pneu_center_presell_rim_cards_updated', handleRimCardsUpdate);
    window.addEventListener('pneu_center_brands_updated', handleBrandsUpdate);
    window.addEventListener('pneu_center_presell_brand_cards_updated', handleBrandsUpdate);
    window.addEventListener('pneu_center_logo_updated', handleLogoUpdate);
    window.addEventListener('pneu_center_settings_updated', handleStoreSettingsUpdate);

    return () => {
      window.removeEventListener('pneu_center_presell_settings_updated', handleSettingsUpdate);
      window.removeEventListener('pneu_center_presell_rim_cards_updated', handleRimCardsUpdate);
      window.removeEventListener('pneu_center_brands_updated', handleBrandsUpdate);
      window.removeEventListener('pneu_center_presell_brand_cards_updated', handleBrandsUpdate);
      window.removeEventListener('pneu_center_logo_updated', handleLogoUpdate);
      window.removeEventListener('pneu_center_settings_updated', handleStoreSettingsUpdate);
    };
  }, []);

  // WhatsApp core sender & dataLayer tracker
  const handleWhatsAppAction = (
    url: string, 
    clickArea: 'hero' | 'rim_card' | 'brand_card' | 'fixed_button', 
    rimNum?: string | null, 
    brandName?: string | null
  ) => {
    // 12. GTM / META / TIKTOK Tag Tracking
    try {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: 'whatsapp_click',
        lead_type: 'whatsapp',
        source: 'presell',
        click_area: clickArea,
        rim: rimNum || null,
        brand: brandName || null,
        whatsapp_url: url,
        page_url: window.location.href
      });
      console.log('GTM Tag Dispatched: whatsapp_click', { clickArea, rimNum, brandName });
    } catch (e) {
      console.error('Error dispatching GTM dataLayer push:', e);
    }
  };

  const getRimSpecs = (rimValue: any) => {
    const r = parseInt(String(rimValue).replace(/\D/g, '')) || 15;
    switch (r) {
      case 13:
        return {
          popularMeasures: ['165/70 R13', '175/70 R13'],
          brandsStr: 'Pirelli, Goodyear, Firestone, Marshal',
          badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
          badgeText: 'Linha Compactos',
          stock: '350+ pneus'
        };
      case 14:
        return {
          popularMeasures: ['175/65 R14', '185/60 R14', '185/65 R14'],
          brandsStr: 'Michelin, Pirelli, Goodyear, Firestone',
          badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
          badgeText: 'Alta Rotatibilidade',
          stock: '980+ pneus'
        };
      case 15:
        return {
          popularMeasures: ['185/60 R15', '185/65 R15', '195/60 R15', '195/65 R15', '195/55 R15'],
          brandsStr: 'Michelin, Pirelli, Goodyear, Continental, Bridgestone',
          badgeColor: 'border-red-500/30 text-red-400 bg-red-500/10',
          badgeText: 'Mais Procurado 🔥',
          stock: '1.450+ pneus'
        };
      case 16:
        return {
          popularMeasures: ['205/55 R16', '205/60 R16', '195/55 R16', '215/65 R16'],
          brandsStr: 'Pirelli, Goodyear, Michelin, Continental, Dunlop',
          badgeColor: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10',
          badgeText: 'Passeio & SUV',
          stock: '1.100+ pneus'
        };
      case 17:
        return {
          popularMeasures: ['215/50 R17', '225/45 R17', '225/50 R17', '225/65 R17'],
          brandsStr: 'Continental, Pirelli, Michelin, Goodyear, Kumho',
          badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
          badgeText: 'Premium & Utilitários',
          stock: '620+ pneus'
        };
      case 18:
        return {
          popularMeasures: ['225/40 R18', '225/45 R18', '235/50 R18', '235/60 R18'],
          brandsStr: 'Michelin, Pirelli, Continental, Dunlop, Yokohama',
          badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
          badgeText: 'Alta Performance',
          stock: '350+ pneus'
        };
      default:
        return {
          popularMeasures: ['Consulte medidas'],
          brandsStr: 'Pirelli, Michelin, Goodyear, Yokohama',
          badgeColor: 'border-slate-500/30 text-slate-400 bg-slate-500/10',
          badgeText: 'Consumo sob Medida',
          stock: 'Disponível'
        };
    }
  };

  const WHATSAPP_NUM = '5511995946993';

  const generateWhatsAppUrl = (message: string): string => {
    return `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(message)}`;
  };

  const mainWhatsAppUrl = generateWhatsAppUrl(settings.hero_whatsapp_message || 'Olá, gostaria de consultar pneus para meu carro.');

  // Accordion details
  const policyItems = [
    {
      id: 'privacidade',
      title: 'Privacidade e Proteção de Dados',
      content: `A Pneu Center Brasil valoriza a sua privacidade. Usamos o WhatsApp exclusivamente para prover atendimento personalizado de esclarecimento comercial. Seus dados cadastrais fornecidos de forma voluntária no WhatsApp são tratados sob rígidos padrões de segurança em total conformidade com a LGPD (Lei Geral de Proteção de Dados Pessoais - Lei 13.709/2018). Suas informações são utilizadas apenas por nossa equipe autorizada para formalizar a sua solicitação ou pesquisa e em hipótese alguma são vendidas, compartilhadas ou transferidas a terceiros não associados.`
    },
    {
      id: 'termos',
      title: 'Termos de Uso do Serviço',
      content: `Ao utilizar e consultar nosso catálogo de pneus online, você expressamente declara compreender que este domínio serve apenas como portfólio informativo e aproximador de negócios. Nenhuma compra automática, checkout com gateway ou cobrança eletrônica ocorre de maneira autônoma nesta landing page. Os preços listados porventura atuam estritamente como preços sugeridos de referência. Todas as condições comerciais como forma de pagamento, descontos adicionais, emissão de nota fiscal de mercadoria e faturamento são negociadas única e exclusivamente com o especialista oficial de plantão no canal de WhatsApp oficial.`
    },
    {
      id: 'garantia',
      title: 'Garantia e Laudo Técnico',
      content: `Todos os pneus listados em nosso portfólio de fornecedores multimarcas nacionais contam com garantia legal contra falha de fabricação estrutural nos termos do Código de Defesa do Consumidor (CDC) e políticas comerciais sob responsabilidade direta dos seus respectivos fabricantes oficiais (geralmente de 5 anos contados a partir da emissão da Nota Fiscal de venda). Reclamações técnicas ou eventuais desgastes irregulares requerem análise via laudo de assistência oficial do fabricante. Para sanhar dúvidas, consulte nossa equipe pós-venda.`
    },
    {
      id: 'entrega',
      title: 'Condições de Entrega e Retirada',
      content: `As opções de entrega de pneus novos comprados em nossa distribuidora são pactuadas no contato com os vendedores. Atendemos a região conforme taxas de envio calculadas sob medida de acordo com as quantidades, dimensão, peso físico dos pneus encomendados e endereço CEP de destino. O prazo médio de transporte, restrições e retirada agendada física no balcão obedecem às normas e políticas logísticas acordadas no momento do fechamento da transação no WhatsApp.`
    },
    {
      id: 'trocas',
      title: 'Trocas e Devoluções',
      content: `De acordo com o Art. 49 do Código de Defesa do Consumidor (CDC), para compras concluídas de forma remota/online, o adquirente possui direito de arrependimento no prazo soberano de até 7 (sete) dias corridos a contar da entrega física dos produtos. O pneu devolvido ou solicitado troca deve estar em perfeitas condições originais (com etiquetas do fabricante, sem ranhuras de asfalto, sem sinais visíveis de tentativa de montagem ou rodagem). Todos os custos e fluxos operacionais para devolução serão fornecidos e detalhados por nossa equipe de atendimento.`
    }
  ];

  const backgroundStyle = settings.background_image_url && settings.background_image_url.trim() !== ''
    ? { 
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.92)), url(${settings.background_image_url})`, 
        backgroundSize: 'cover', 
        backgroundAttachment: 'fixed', 
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : undefined;

  return (
    <div style={backgroundStyle} className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-slate-950">
      
      {/* Dynamic Keyframe Animation Styles for Smooth Infinite Marquee */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Dynamic Inventory Status Top Ribbon */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-slate-950 font-sans font-black text-center text-[10px] sm:text-xs py-2 px-4 uppercase tracking-wider flex items-center justify-center gap-2 relative z-50">
        <span className="flex h-2.5 w-2.5 relative shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-900 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-700"></span>
        </span>
        <span>⚡ CATÁLOGO ATIVO COM <strong className="underline text-slate-950 font-black">4.850 PNEUS DISPONÍVEIS</strong> À PRONTA-ENTREGA • ENVIAMOS IMEDIATAMENTE! ⚡</span>
      </div>

      {/* 1. TOPO DA PRESELL */}
      <header className="bg-slate-900 border-b border-slate-800/80 px-4 py-3 sm:py-4 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          
          {/* Logo & Slogan info */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            {logo ? (
              <img 
                src={logo} 
                alt="Pneu Center Brasil" 
                className="h-9 sm:h-11 w-auto object-contain max-w-[200px]" 
              />
            ) : (
              <div className="font-display font-black tracking-tighter text-lg sm:text-xl text-white uppercase flex items-center gap-0.5">
                <span className="text-orange-500">PNEU</span> 
                <span className="text-slate-300">CENTER</span> 
                <span className="bg-orange-600 text-slate-950 px-1 py-0.5 rounded text-xs ml-1">BRASIL</span>
              </div>
            )}
            <div className="hidden sm:block h-6 w-px bg-slate-800" />
            <div className="flex flex-col text-left">
              <span className="text-xs text-slate-300 font-bold uppercase tracking-wider font-sans text-left">
                Pneus multimarcas para o seu carro
              </span>
              <span className="text-[10px] text-slate-450 tracking-wide mt-0.5 text-left">
                Catálogo informativo online • Atendimento 100% via WhatsApp • CNPJ informado
              </span>
            </div>
          </div>

          {/* Quick Header WhatsApp CTA */}
          <a
            href={mainWhatsAppUrl}
            onClick={() => handleWhatsAppAction(mainWhatsAppUrl, 'fixed_button')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-555 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 transition-all cursor-pointer shadow-md shadow-emerald-500/10 shrink-0 hover:scale-[1.03]"
          >
            <WhatsAppIcon className="h-4 w-4 text-white" />
            <span>Consultar no WhatsApp</span>
          </a>
        </div>
      </header>

      {/* 2. HERO PRINCIPAL */}
      <section className="relative overflow-hidden bg-radial from-slate-900 via-slate-950 to-slate-950 py-16 sm:py-24 border-b border-slate-900">
        
        {/* Background mesh grid effects */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Glowing visual abstract decorations (Orange & Blue) */}
        <div className="absolute top-10 left-[10%] w-72 h-72 rounded-full bg-orange-600/10 blur-3xl" />
        <div className="absolute bottom-10 right-[15%] w-80 h-80 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Lead Content Box - order-2 on mobile layout so it is below the image */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start order-2 lg:order-1">
              
              <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3.5 py-1 text-xs font-mono font-medium text-orange-400 border border-orange-500/15">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                <span>Atendimento Oficial Especializado</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white uppercase leading-tight font-display">
                {settings.hero_title}
              </h1>

              <p className="text-sm sm:text-base text-slate-350 leading-relaxed max-w-2xl font-sans">
                {settings.hero_subtitle}
              </p>

              {/* Mega CTA Button */}
              <div className="w-full max-w-md pt-2">
                <a
                  href={mainWhatsAppUrl}
                  onClick={() => handleWhatsAppAction(mainWhatsAppUrl, 'hero')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl bg-emerald-600 hover:bg-emerald-550 text-white font-extrabold text-base uppercase tracking-wider px-8 py-5 transition-all shadow-xl shadow-emerald-500/15 hover:shadow-emerald-500/25 hover:scale-[1.02]"
                >
                  <WhatsAppIcon className="h-6 w-6 text-white" />
                  <span>{settings.hero_button_text}</span>
                </a>
              </div>

              {/* Compliance / Small Notice */}
              <div className="flex gap-2 bg-slate-900/60 border border-slate-850 rounded-xl p-3.5 max-w-xl text-left">
                <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  {settings.notice_text}
                </p>
              </div>

            </div>

            {/* Media/Illustration Box - order-1 on mobile so image is rendered on top of context tags */}
            <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
              <div className="relative w-full max-w-sm sm:max-w-md h-72 sm:h-96 flex items-center justify-center">
                
                {/* Radiant border behind image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 to-orange-500/30 rounded-3xl blur-xl" />
                
                {/* Main Hero Media Visualizer */}
                <div className="relative z-10 w-full h-full bg-slate-900 border-2 border-orange-500/20 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center p-4">
                  {settings.hero_media_url && settings.hero_media_url.trim() !== '' ? (
                    settings.hero_media_type === 'video' ? (
                      <video 
                        src={settings.hero_media_url} 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover rounded-2xl" 
                      />
                    ) : (
                      <img 
                        src={settings.hero_media_url} 
                        alt="Catálogo Pneus" 
                        loading="eager"
                        className="w-full h-full object-cover rounded-2xl" 
                      />
                    )
                  ) : (
                    <div className="relative flex flex-col justify-center items-center text-center p-6 space-y-4">
                      {/* Changed to stay still / stopped spinning */}
                      <img 
                        src={defaultHeroTire} 
                        alt="Pneu Esportivo Premium" 
                        className="w-48 h-48 sm:w-64 sm:h-64 object-contain" 
                        onError={(e) => {
                          // Failover to icon in case import fails
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950/80 backdrop-blur-md border border-orange-500/20 px-3 py-1.5 rounded-full z-15">
                        <span className="text-[10px] font-sans text-orange-500 font-extrabold tracking-widest uppercase">
                          Cotação Grátis
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. MINI CARDS DE MARCAS EM MOVIMENTO - Positioned directly above the rim cards */}
      <section className="bg-slate-900 py-12 overflow-hidden border-y border-slate-850/60">
        <div className="space-y-8">
          
          <div className="text-center space-y-1 px-4">
            <h2 className="text-xl sm:text-2xl font-black uppercase font-display text-white tracking-tight">
              Marcas no catálogo
            </h2>
            <p className="text-[11px] text-slate-400">
              Movimento contínuo. Clique na marca de interesse para consultar no atendimento.
            </p>
          </div>

          {/* Infinite Marquee block */}
          <div className="relative w-full overflow-hidden flex py-2 bg-slate-950/40">
            {/* Left and Right gradient fades for cinematic integration */}
            <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee gap-6 pr-6">
              {/* Combine twice to make loop seamless */}
              {[...brandCards, ...brandCards, ...brandCards].map((brand, idx) => {
                const brandMsg = brand.whatsapp_message || `Olá, gostaria de consultar pneus da marca ${brand.brand_name || brand.name}.`;
                const brandWaUrl = generateWhatsAppUrl(brandMsg);
                const brandNameText = brand.brand_name || brand.name || '';
                const brandImgLogo = brand.logo_url || brand.logo;
                const isImageFailedOrAbsent = !brandImgLogo || brandImgLogo.trim() === '' || failedBrandImages[`${brand.id || idx}`];

                return (
                  <a
                    key={`${brand.id || idx}-${idx}`}
                    href={brandWaUrl}
                    onClick={() => handleWhatsAppAction(brandWaUrl, 'brand_card', null, brandNameText)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-orange-500/40 px-5 py-3 rounded-2xl select-none transition-all cursor-pointer shrink-0"
                  >
                    {!isImageFailedOrAbsent ? (
                      <div className="h-7 w-12 bg-white rounded flex items-center justify-center p-0.5 overflow-hidden">
                        <img 
                          src={brandImgLogo} 
                          alt={brandNameText} 
                          loading="lazy"
                          onError={() => {
                            setFailedBrandImages(prev => ({ ...prev, [`${brand.id || idx}`]: true }));
                          }}
                          className="h-full w-full object-contain" 
                        />
                      </div>
                    ) : (
                      <div className="h-7 w-7 rounded-sm bg-orange-600 text-slate-950 font-black text-xs flex items-center justify-center font-mono">
                        {brandNameText.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs sm:text-sm font-bold text-white tracking-wider uppercase font-sans">
                      {brandNameText}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Compliance Brand disclaimers */}
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-[10px] text-slate-450 leading-relaxed max-w-2xl mx-auto">
              A Pneu Center Brasil atua como revendedora multimarcas independente. As marcas citadas pertencem aos seus respectivos fabricantes e são usadas apenas para identificação e identificação de compatibilidade técnica dos produtos.
            </p>
          </div>

        </div>
      </section>

      {/* 4. CARDS DE ARO 1:1 */}
      <section className="bg-slate-950 py-16 px-4">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase font-display text-white tracking-tight">
              Escolha o aro do seu pneu
            </h2>
            <p className="text-xs sm:text-sm text-slate-450 max-w-xl mx-auto">
              Clique no aro correspondente para consultar o catálogo de pneus específicos no WhatsApp com atendimento imediato.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rimCards.map((card) => {
              const cardWaUrl = generateWhatsAppUrl(card.whatsapp_message || `Olá, gostaria de conferir o catálogo de pneus aro ${card.rim}.`);
              const specs = getRimSpecs(card.rim);
              
              return (
                <div 
                  key={card.id}
                  className="bg-slate-900 border border-slate-800/80 rounded-3xl overflow-hidden hover:border-orange-500/50 transition-all duration-300 shadow-xl hover:shadow-orange-500/5 flex flex-col h-full group transform hover:-translate-y-1"
                >
                  {/* Square 1:1 image slot */}
                  <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
                    {card.image_url ? (
                      <img 
                        src={card.image_url} 
                        alt={card.title} 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 p-6">
                        <Sparkles className="h-12 w-12 text-orange-500/20 mb-2" />
                        <span className="text-3xl font-black font-display text-slate-700">ARO {card.rim}</span>
                      </div>
                    )}
                    
                    {/* Floating badge for Rim Size */}
                    <div className="absolute top-4 left-4 bg-orange-600 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-lg uppercase tracking-wider shadow-lg">
                      Aro {card.rim}
                    </div>

                    {/* Floating status tag - e.g. "Mais Procurado" */}
                    <div className={`absolute top-4 right-4 border px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-md ${specs.badgeColor}`}>
                      {specs.badgeText}
                    </div>

                    {/* Bottom overlay for active stock */}
                    <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-sm border border-slate-800/60 rounded-xl px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] text-slate-200 font-bold uppercase tracking-wider">Estoque Pronta-Entrega</span>
                      </div>
                      <span className="text-xs text-orange-400 font-black font-mono">{specs.stock}</span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex-grow flex flex-col justify-between gap-5 text-left">
                    <div className="space-y-4 text-left">
                      <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight font-display text-left">{card.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5 font-sans leading-relaxed text-left">{card.subtitle}</p>
                      </div>

                      {/* Suggested typical tire sizes (measures) */}
                      <div className="space-y-1.5 text-left">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block text-left">Algumas Medidas Disponíveis:</span>
                        <div className="flex flex-wrap gap-1 text-left">
                          {specs.popularMeasures.map((measure) => (
                            <span 
                              key={measure} 
                              className="text-[10px] font-mono font-bold bg-slate-950 text-slate-300 px-2.5 py-1 rounded border border-slate-800 hover:border-orange-500/40 hover:text-orange-400 transition-colors"
                            >
                              {measure}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Display of premium brands for this rim size */}
                      <div className="space-y-1 border-t border-slate-850 pt-3 text-left">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block text-left">Marcas em Estoque:</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-sans font-medium text-left">
                          {specs.brandsStr}
                        </p>
                      </div>
                    </div>

                    <a
                      href={cardWaUrl}
                      onClick={() => handleWhatsAppAction(cardWaUrl, 'rim_card', card.rim)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-550 text-slate-950 font-black text-xs uppercase tracking-wider py-4 transition-all duration-300 cursor-pointer shadow-lg shadow-orange-500/5 hover:shadow-orange-500/15"
                    >
                      <WhatsAppIcon className="h-4.5 w-4.5 text-slate-950" />
                      <span>{card.button_text || `Consultar Aro ${card.rim}`}</span>
                    </a>
                  </div>
                </div>
              );
            })}

            {/* Custom "Não sei meu aro" card */}
            <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl overflow-hidden p-6 hover:border-blue-500/40 transition-all shadow-lg flex flex-col justify-between h-full min-h-[350px]">
              <div className="flex-grow flex flex-col justify-center items-center text-center space-y-4 py-6">
                <div className="bg-blue-500/10 p-5 rounded-full border border-blue-500/15 text-blue-400">
                  <QuestionIcon className="h-10 w-10" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">Não sei meu aro</h3>
                  <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed">
                    Nossa equipe ajuda você a encontrar a largura, aro e medida correta para o seu veículo.
                  </p>
                </div>
              </div>

              {(() => {
                const helperMsg = 'Olá, preciso de ajuda para encontrar o aro e a medida correta do pneu do meu carro.';
                const helperWaUrl = generateWhatsAppUrl(helperMsg);
                return (
                  <a
                    href={helperWaUrl}
                    onClick={() => handleWhatsAppAction(helperWaUrl, 'rim_card', 'não sei')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold text-xs uppercase tracking-wider py-3.5 transition-all cursor-pointer"
                  >
                    <WhatsAppIcon className="h-4 w-4 text-white" />
                    <span>Pedir Ajuda no WhatsApp</span>
                  </a>
                );
              })()}
            </div>

          </div>
        </div>
      </section>

      {/* 7. BLOCO DE CONFIANÇA SEM LINKS DE SAÍDA */}
      <section className="bg-slate-950 py-16 px-4">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold uppercase font-display text-white tracking-tight">
              Prevenção e Segurança Comercial
            </h2>
            <p className="text-xs text-slate-400">
              Conheça nossas regras e políticas de conformidade e integridade jurídica operacional.
            </p>
          </div>

          {/* Solid Value Cards Grid - strictly non-clickable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-3 flex flex-col justify-start">
              <div className="bg-orange-500/10 p-3 rounded-xl text-orange-400 w-fit">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">CNPJ Informado</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Operamos com total transparência tributária nacional sob CNPJ e endereços físicos claramente auditáveis mostrados em nossa landing page principal.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-3 flex flex-col justify-start">
              <div className="bg-orange-500/10 p-3 rounded-xl text-orange-400 w-fit">
                <UserCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Atendimento Oficial</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                O único número oficial autorizado para negociações em nossa central de vendas é o (11) 99594-6993. Não responda a contatos estranhos.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-3 flex flex-col justify-start">
              <div className="bg-orange-500/10 p-3 rounded-xl text-orange-400 w-fit">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Nota Fiscal Conforme Operação</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Cada pneu faturado e entregue acompanha estritamente sua devida e correspondente Nota Fiscal Eletrônica de mercadorias para resguardar seus direitos fiscais.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-3 flex flex-col justify-start">
              <div className="bg-orange-500/10 p-3 rounded-xl text-orange-400 w-fit">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Garantia conforme fabricante</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Garantia estrutural contra falhas de borracha válida nos exatos moldes determinados pelos seus fabricantes de origem, válida por 5 anos mediante as devidas notas.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-3 flex flex-col justify-start">
              <div className="bg-orange-500/10 p-3 rounded-xl text-orange-400 w-fit">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Preço de Referência</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Preços expostos representam preços de referência sugeridos e válidos no dia. Valores e encargos de transporte requerem a sua confirmação.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-3 flex flex-col justify-start">
              <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-450 w-fit">
                <CheckCircle className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Compra sob Confirmação</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                A compra definitiva, faturamento e opções de pagamento ocorrem única e exclusivamente por meio humano, confirmando via o canal de WhatsApp.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 8. INFORMAÇÕES LEGAIS & ACCORDIONS */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 px-4 mt-auto">
        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* Header footer */}
          <div className="text-center space-y-3 border-b border-slate-800 pb-8">
            <span className="text-slate-200 font-bold uppercase tracking-widest text-xs">
              Informações de Transparência
            </span>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl mx-auto">
              Este site funciona estritamente como página de campanha e catálogo informativo online. Não realizamos checkout automático, processamento de carrinho, cobrança eletrônica ou venda direta dentro desta landing page. A confirmação final de estoque disponível, preços do momento, logística de entrega, faturamento, emissão fiscal e procedimentos de garantia ocorre via atendimento humano no canal de WhatsApp.
            </p>
          </div>

          {/* Compact Company Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/40 p-6 rounded-2xl border border-slate-850/60 text-xs text-slate-400">
            <div className="space-y-2">
              <p className="font-bold text-white text-sm uppercase">Pneu Center Brasil</p>
              <p><span className="text-slate-500 font-medium">Razão Social:</span> CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA</p>
              <p><span className="text-slate-500 font-medium">CNPJ Cadastral:</span> 20.085.983/0001-13</p>
              <p><span className="text-slate-500 font-medium">Sede Operacional:</span> Av. Professor Francisco Morato, 2001, Butantã, São Paulo/SP, CEP 05513-200</p>
            </div>
            <div className="space-y-2 md:border-l md:border-slate-800 md:pl-6">
              <p className="font-bold text-white text-sm uppercase">Contato Oficial</p>
              <p><span className="text-slate-500 font-medium font-sans">WhatsApp SAC:</span> (11) 99594-6993</p>
              <p><span className="text-slate-500 font-medium">E-mail:</span> contato.pneucenterbrasil@gmail.com</p>
              <p><span className="text-slate-500 font-medium">Atendimento:</span> Multimarcas Independente de Venda Consultiva</p>
            </div>
          </div>

          {/* Accordion List - 100% opening inside without routing away */}
          <div className="space-y-3.5 pt-4">
            {policyItems.map((item) => {
              const isOpen = activeAccordion === item.id;
              
              return (
                <div 
                  key={item.id}
                  className="border border-slate-800 bg-slate-950/20 rounded-xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveAccordion(isOpen ? null : item.id)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm uppercase tracking-wide text-slate-200 hover:bg-slate-850/30 transition-all font-sans"
                  >
                    <span>{item.title}</span>
                    <ChevronRight className={`h-4 w-4 text-orange-500 font-bold transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-4 pb-4 pt-1.5 text-xs text-slate-450 leading-relaxed border-t border-slate-800/50 bg-slate-950/30 font-sans">
                          {item.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* copyright bottom */}
          <div className="text-center text-[10px] text-slate-550 border-t border-slate-800/50 pt-6">
            <p>© {new Date().getFullYear()} Pneu Center Brasil • Todos os direitos reservados.</p>
          </div>

        </div>
      </footer>

      {/* 9. BOTÃO FIXO NO MOBILE */}
      {settings.mobile_fixed_button && (
        <div className="block sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-slate-900/90 border-t border-slate-800/80 backdrop-blur-md z-45">
          <a
            href={mainWhatsAppUrl}
            onClick={() => handleWhatsAppAction(mainWhatsAppUrl, 'fixed_button')}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-555 text-white font-extrabold text-xs uppercase tracking-wider py-4 transition-all shadow-lg cursor-pointer"
          >
            <WhatsAppIcon className="h-5 w-5 text-white" />
            <span>Consultar Pneus no WhatsApp</span>
          </a>
        </div>
      )}

    </div>
  );
}
