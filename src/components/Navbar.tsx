import React, { useState, useEffect } from 'react';
import { Menu, X, MessageSquare, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppRoute } from '../types';
import { openWhatsAppChat, DEFAULT_WHATSAPP_MESSAGE } from '../lib/whatsapp';
import { getSettings, getLogo, SiteSettings } from '../lib/appStore';

interface NavbarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute, productId?: string) => void;
}

export default function Navbar({ currentRoute, onNavigate }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(getSettings());
  const [logo, setLogo] = useState<string | null>(getLogo());

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setSettings(getSettings());
    };
    const handleLogoUpdate = () => {
      setLogo(getLogo());
    };

    window.addEventListener('pneu_center_settings_updated', handleSettingsUpdate);
    window.addEventListener('pneu_center_logo_updated', handleLogoUpdate);

    return () => {
      window.removeEventListener('pneu_center_settings_updated', handleSettingsUpdate);
      window.removeEventListener('pneu_center_logo_updated', handleLogoUpdate);
    };
  }, []);

  const navItems = [
    { label: 'Início', route: 'home' as AppRoute },
    { label: 'Pneus', route: 'catalogo' as AppRoute },
    { label: 'Como Funciona', route: 'como-funciona' as AppRoute },
    { label: 'Garantia', route: 'politica-garantia' as AppRoute },
    { label: 'Sobre', route: 'sobre' as AppRoute },
    { label: 'Contato', route: 'contato' as AppRoute },
    { label: 'Rastreamento', route: 'rastreamento' as AppRoute },
  ];

  const handleNavClick = (route: AppRoute) => {
    onNavigate(route);
    setIsOpen(false);
  };

  return (
    <>
      <header id="main-header" className="sticky top-0 z-50 w-full border-b border-slate-700 bg-[#0B1B32]/95 backdrop-blur-md text-white">
        {/* Transparency Banner Top */}
        <div id="transparency-banner-top" className="bg-[#061021] px-4 py-2 text-center text-xs font-semibold tracking-wide text-orange-400 md:text-sm border-b border-slate-800/80">
          <span className="inline-flex items-center gap-1.5 justify-center flex-wrap font-sans">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Fixo e WhatsApp: <strong>(11) 99594-6993</strong></span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span>Catálogo Informativo Online • Nenhuma venda direta no site • Atendimento 100% via WhatsApp</span>
          </span>
        </div>

        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo Brand */}
          <div 
            id="brand-logo" 
            className="flex cursor-pointer items-center gap-2.5 group shrink-0" 
            onClick={() => handleNavClick('home')}
          >
            {logo && logo.trim() ? (
              <img 
                src={logo.trim()} 
                alt={settings.commercialName || 'Pneu Center Brasil Logo'} 
                className="h-11 sm:h-13 w-auto object-contain max-w-[200px] sm:max-w-[280px] md:max-w-[320px] cursor-pointer"
              />
            ) : (
              <>
                <div className="relative flex h-10 w-10 items-center justify-center rounded bg-orange-500 overflow-hidden shadow-md shadow-orange-500/10 shrink-0">
                  {/* Decorative tire pattern inside logo */}
                  <div className="absolute inset-0 border-y-4 border-dashed border-slate-950/30 opacity-70"></div>
                  <span className="font-display font-black text-lg text-slate-950 tracking-tighter">PC</span>
                </div>
                <div>
                  <span className="block font-sans font-black text-lg sm:text-xl tracking-tight uppercase italic text-white group-hover:text-orange-400 transition-colors">
                    {settings.commercialName ? settings.commercialName.split(' ')[0] : 'Pneu'}{' '}
                    <span className="text-orange-500">
                      {settings.commercialName ? settings.commercialName.split(' ').slice(1).join(' ') : 'Center Brasil'}
                    </span>
                  </span>
                  <span className="block font-mono text-[9px] uppercase tracking-widest text-slate-400 leading-none mt-0.5">
                    {settings.slogan || 'Catálogo Oficial Multimarcas'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav id="desktop-nav" className="hidden xl:flex items-center gap-4 text-sm font-medium uppercase tracking-wide opacity-90">
            {navItems.map((item) => {
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  id={`nav-link-${item.route}`}
                  onClick={() => handleNavClick(item.route)}
                  className={`relative py-1.5 font-sans text-xs font-bold uppercase tracking-wider transition-colors hover:text-orange-500 ${
                    isActive ? 'text-orange-500 border-b-2 border-orange-500' : 'text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Desktop Call to Action Button */}
          <div className="hidden lg:flex items-center shrink-0 gap-3">
            {/* Solicitar Orçamento or fallback inline route link if not fully wide */}
            <button
              id="cta-whatsapp-header"
              onClick={() => openWhatsAppChat("Olá, vim pelo site Pneu Center Brasil e gostaria de consultar disponibilidade, preço atualizado e condições de atendimento para pneus.")}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-2 transition-colors cursor-pointer uppercase font-sans tracking-wide"
            >
              <svg className="w-4 h-4 fill-white animate-pulse" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <span>Solicitar Orçamento</span>
            </button>
          </div>

          {/* Quick link on tablet view to let them navigate to contact since xl navigation only displays on full screen */}
          <div className="hidden lg:flex xl:hidden gap-3 font-medium text-xs text-white uppercase">
            {navItems.slice(0, 5).map((item) => (
              <button key={item.route} onClick={() => handleNavClick(item.route)} className="hover:text-orange-500">
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex lg:hidden">
            <button
              id="mobile-menu-btn"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2.5 text-slate-100 hover:bg-[#12253f] hover:text-white focus:outline-none"
              aria-label="Abrir menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay & Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              id="mobile-drawer-content"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-xs border-l border-slate-800 bg-slate-900 p-6 shadow-2xl flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                {/* Header within drawer */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    {logo && logo.trim() ? (
                      <img src={logo.trim()} alt={settings.commercialName} className="h-9 sm:h-11 w-auto object-contain max-w-[160px] sm:max-w-[220px]" />
                    ) : (
                      <>
                        <div className="h-8 w-8 flex items-center justify-center rounded bg-orange-500 font-display font-black text-sm text-slate-950">
                          PC
                        </div>
                        <div>
                          <span className="font-sans font-black text-sm tracking-tight text-white block uppercase">
                            {settings.commercialName ? settings.commercialName.split(' ')[0] : 'Pneu'}{' '}
                            <span className="text-orange-500">
                              {settings.commercialName ? settings.commercialName.split(' ').slice(1).join(' ') : 'Center'}
                            </span>
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    id="mobile-drawer-close"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-1 text-gray-400 hover:text-white hover:bg-slate-800 focus:outline-none cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile Links */}
                <nav id="mobile-nav-links" className="space-y-2">
                  {navItems.map((item) => {
                    const isActive = currentRoute === item.route;
                    return (
                      <button
                        key={item.route}
                        id={`mob-link-${item.route}`}
                        onClick={() => handleNavClick(item.route)}
                        className={`w-full text-left px-4 py-3 rounded-lg font-sans text-xs font-bold uppercase transition-colors flex items-center justify-between ${
                          isActive 
                            ? 'bg-slate-800 text-orange-500 border-l-4 border-orange-500 pl-3' 
                            : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span>{item.label}</span>
                        {isActive && <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Drawer CTA */}
              <div className="mt-auto pt-6 border-t border-slate-800">
                <p className="text-[9px] text-gray-400 font-mono text-center mb-4 leading-normal uppercase">
                  {settings.corporateName || 'CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA'}
                  {settings.cnpj && <span className="block mt-0.5">CNPJ: {settings.cnpj}</span>}
                </p>
                <button
                  id="cta-whatsapp-drawer"
                  onClick={() => {
                    openWhatsAppChat(DEFAULT_WHATSAPP_MESSAGE);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-3 uppercase text-xs font-sans tracking-wide cursor-pointer shadow-md"
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span>Falar no WhatsApp</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
