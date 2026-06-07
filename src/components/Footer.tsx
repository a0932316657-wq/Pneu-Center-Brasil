import React, { useState, useEffect } from 'react';
import { Mail, MapPin, MessageSquare, ShieldAlert } from 'lucide-react';
import { AppRoute } from '../types';
import { openWhatsAppChat, DEFAULT_WHATSAPP_MESSAGE } from '../lib/whatsapp';
import { getSettings, getLogo, SiteSettings } from '../lib/appStore';

interface FooterProps {
  onNavigate: (route: AppRoute) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();
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

  return (
    <footer id="main-footer" className="bg-slate-900 border-t border-slate-800 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Column 1: Company Profile & CNPJ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {logo && logo.trim() ? (
                <img 
                  src={logo.trim() || null} 
                  alt={settings.commercialName || 'Pneu Center Brasil Logo'} 
                  className="h-10 w-auto object-contain max-w-[150px] cursor-pointer"
                  onClick={() => onNavigate('home')}
                />
              ) : (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-500 font-display font-bold text-slate-950 text-xs">
                    PCB
                  </div>
                  <span className="font-sans font-black text-lg tracking-tight uppercase italic text-white">
                    {settings.commercialName ? settings.commercialName.split(' ')[0] : 'Pneu'}{' '}
                    <span className="text-orange-500">
                      {settings.commercialName ? settings.commercialName.split(' ').slice(1).join(' ') : 'Center Brasil'}
                    </span>
                  </span>
                </>
              )}
            </div>
            <p className="text-xs leading-relaxed text-gray-400">
              Catálogo informativo online de pneus multimarcas para carros de passeio, SUVs e utilitários leves. Facilitamos sua pesquisa técnica com atendimento voltado à transparência e segurança.
            </p>
            <div className="pt-2">
              <span className="block text-[10px] font-mono tracking-widest uppercase text-gray-500 font-bold">Razão Social</span>
              <p className="text-xs font-medium text-gray-300 leading-normal mb-1">{settings.corporateName || 'CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA'}</p>
              <span className="block text-[10px] font-mono tracking-widest uppercase text-gray-500 font-bold">CNPJ</span>
              <p className="text-xs font-medium text-gray-300 font-mono">{settings.cnpj || '20.085.983/0001-13'}</p>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Navegação
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Início', route: 'home' as AppRoute },
                { label: 'Catálogo de Pneus', route: 'catalogo' as AppRoute },
                { label: 'Marcas Disponíveis', route: 'marcas' as AppRoute },
                { label: 'Como Funciona', route: 'como-funciona' as AppRoute },
                { label: 'Sobre Nós', route: 'sobre' as AppRoute },
                { label: 'Contato & Suporte', route: 'contato' as AppRoute },
              ].map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => onNavigate(item.route)}
                    className="hover:text-amber-500 hover:underline transition-all text-left cursor-pointer"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Policy / Legal Links */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Políticas e Termos
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Política de Privacidade', route: 'politica-privacidade' as AppRoute },
                { label: 'Termos de Uso', route: 'termos-uso' as AppRoute },
                { label: 'Política de Entrega e Pagamento', route: 'politica-entrega' as AppRoute },
                { label: 'Trocas, Devoluções e Garantia', route: 'politica-trocas' as AppRoute },
              ].map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => onNavigate(item.route)}
                    className="hover:text-amber-500 hover:underline text-left text-xs md:text-sm cursor-pointer"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Location & Direct Contact */}
          <div className="space-y-3 font-mono text-xs">
            <h3 className="font-display normal-case text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Atendimento Físico & Info
            </h3>
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4.5 w-4.5 text-orange-500 shrink-0 mt-0.5" />
              <p className="font-sans leading-relaxed text-slate-350 select-text">
                {settings.address || 'Av. Professor Francisco Morato, 2001, Butantã, São Paulo/SP, CEP 05513-200'}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <MessageSquare className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
              <button 
                onClick={() => openWhatsAppChat(DEFAULT_WHATSAPP_MESSAGE)}
                className="font-mono text-gray-300 hover:text-emerald-400 hover:underline text-left cursor-pointer select-text"
              >
                {settings.whatsappText || '(11) 99594-6993'}
              </button>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="h-4.5 w-4.5 text-blue-400 shrink-0" />
              <a 
                href={`mailto:${settings.email || 'contato.pneucenterbrasil@gmail.com'}`}
                className="font-mono hover:text-white hover:underline text-left select-text"
              >
                {settings.email || 'contato.pneucenterbrasil@gmail.com'}
              </a>
            </div>
            <div className="pt-2 font-sans text-[11px] leading-relaxed text-gray-500 border-t border-slate-800">
              {settings.hours ? (
                <p className="whitespace-pre-line">{settings.hours}</p>
              ) : (
                <>
                  Seg. a Sex. das 8h às 18h<br />
                  Sábados das 8h às 13h
                </>
              )}
            </div>
          </div>
        </div>

        {/* Informative transparency panel at the bottom to guarantee Google Ads safety */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="rounded-xl bg-[#0B1B32]/40 border border-slate-700/60 p-5 flex flex-col md:flex-row items-start gap-4">
            <ShieldAlert className="h-6 w-6 text-orange-500 shrink-0 mt-0.5" />
            <div className="space-y-1.5 font-sans">
              <p className="text-xs text-slate-200 font-bold uppercase tracking-wider font-sans">
                IMPORTANTE: Isenção de Checkout e Vendas Online
              </p>
              <p className="text-xs leading-relaxed text-gray-400">
                A {settings.commercialName || 'Pneu Center Brasil'} atua estritamente como um <strong>Catálogo Digital de Pneus Automotivos Multimarcas</strong>. Não operamos nenhuma modalidade de checkout virtual, carrinho de compras, faturamento ou intermediação de transações monetárias em nossa plataforma online. Todos os preços indicados, disponibilidade física, prazos de entrega específicos e formas de pagamento validadas deverão ser formalmente informados e estabelecidos no decorrer do contato direto com nossa equipe via WhatsApp. Nós nunca entraremos em contato solicitando cartões de crédito, depósitos anônimos ou transferências diretas por este site.
              </p>
              <p className="text-[10px] text-gray-500 leading-normal">
                A {settings.commercialName || 'Pneu Center Brasil'} é uma revendedora multimarcas independente. Os logotipos, especificações e marcas comerciais listados (como Pirelli, Michelin, Goodyear, Bridgestone, Continental, Dunlop, Firestone e Hankook) pertencem e são marcas registradas de seus respectivos fabricantes legítimos, sendo aplicados na plataforma exclusivamente para fins de indexação técnica e identificação do consumidor. Este site não se confunde ou constitiva portal oficial de quaisquer das montadoras listadas.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center text-[10px] sm:text-[11px] text-gray-500">
            <p className="font-mono">
              &copy; {currentYear} {settings.corporateName || 'CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA'}. Todos os direitos reservados.
            </p>
            <p className="font-sans">
              Desenvolvido com foco em Transparência e Segurabilidade.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

