import React, { useState, useEffect } from 'react';
import { Mail, MapPin, MessageSquare, ShieldCheck, Lock, FileText, Award, Truck, HelpCircle } from 'lucide-react';
import { AppRoute } from '../types';
import { openWhatsAppChat } from '../lib/whatsapp';
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
    <footer id="main-footer" className="bg-slate-950 border-t border-slate-800 text-slate-400 font-sans">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        
        {/* Three Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-slate-800 pb-12">
          
          {/* Column 1: Logo & text */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {logo && logo.trim() ? (
                <img 
                  src={logo.trim()} 
                  alt="Pneu Center Brasil" 
                  className="h-10 w-auto object-contain max-w-[150px] cursor-pointer"
                  onClick={() => onNavigate('home')}
                />
              ) : (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-500 font-display font-bold text-slate-950 text-xs shrink-0">
                    PC
                  </div>
                  <span className="font-sans font-black text-lg tracking-tight uppercase italic text-white">
                    Pneu <span className="text-orange-500">Center Brasil</span>
                  </span>
                </>
              )}
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Pneu Center Brasil: pneus automotivos multimarcas com atendimento especializado, nota fiscal e garantia conforme fabricante.
            </p>
          </div>

          {/* Column 2: Links Úteis */}
          <div className="space-y-4 md:pl-8">
            <h3 className="font-sans text-sm font-black text-white tracking-wider uppercase">
              Links Úteis:
            </h3>
            <ul className="space-y-2 text-xs">
              {[
                { label: 'Rastrear Pedido', route: 'rastreamento' as AppRoute },
                { label: 'Política de Privacidade', route: 'politica-privacidade' as AppRoute },
                { label: 'Termos de Uso', route: 'termos-uso' as AppRoute },
                { label: 'Política de Garantia', route: 'politica-garantia' as AppRoute },
                { label: 'Política de Troca e Devolução', route: 'politica-trocas' as AppRoute },
                { label: 'Política de Envio e Entrega', route: 'politica-envio' as AppRoute },
              ].map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => onNavigate(item.route)}
                    className="hover:text-orange-500 transition-colors text-left font-semibold"
                  >
                    • {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contato */}
          <div className="space-y-4">
            <h3 className="font-sans text-sm font-black text-white tracking-wider uppercase">
              Contato:
            </h3>
            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <p className="font-bold">CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA</p>
              <p>CNPJ: <span className="font-mono">20.085.983/0001-13</span></p>
              
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-500 shrink-0" />
                <button 
                  onClick={() => openWhatsAppChat("Olá, gostaria de solicitar um orçamento para pneus.")}
                  className="font-mono hover:text-green-400 text-left transition-colors font-bold"
                >
                  (11) 99594-6993
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                <a 
                  href="mailto:contato.pneucenterbrasil@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  contato.pneucenterbrasil@gmail.com
                </a>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                <p>
                  Av. Professor Francisco Morato, 2001, Butantã, São Paulo/SP, CEP 05513-200
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Confidence Cards Grid */}
        <div className="mt-12">
          <h4 className="text-center font-sans text-xs font-black text-white uppercase tracking-widest mb-6 opacity-80">
            Nossos Compromissos de Transparência & Confiança
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Lock, iconColor: 'text-blue-400 border-blue-500/20 bg-blue-500/5', title: 'Conexão Segura', desc: 'Criptografia SSL' },
              { icon: FileText, iconColor: 'text-amber-500 border-amber-500/20 bg-amber-500/5', title: 'Nota Fiscal', desc: 'NF-e conforme operação comercial' },
              { icon: Award, iconColor: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5', title: 'Garantia', desc: 'Conforme fabricante e política da empresa' },
              { icon: Truck, iconColor: 'text-indigo-400 border-indigo-400/20 bg-indigo-400/5', title: 'Rastreamento', desc: 'Acompanhamento quando disponível' },
              { icon: ShieldCheck, iconColor: 'text-orange-500 border-orange-500/20 bg-orange-500/5', title: 'CNPJ informado', desc: '20.085.983/0001-13' },
              { icon: HelpCircle, iconColor: 'text-purple-400 border-purple-400/20 bg-purple-400/5', title: 'Atendimento', desc: 'Suporte especializado' },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div key={idx} className="flex flex-col items-center justify-center text-center p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900 transition-colors">
                  <div className={`p-2 rounded-lg border mb-2 ${card.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h5 className="font-sans text-[11px] font-black uppercase text-white tracking-wider select-none">
                    {card.title}
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight leading-none leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Small Legal Disclaimer */}
        <p className="mt-8 text-center text-[10px] text-slate-500 leading-relaxed font-sans border-t border-slate-900 pt-6">
          *A Pneu Center Brasil atua como um catálogo informativo online independente. Não possuímos checkout financeiro eletrônico automático ou transações diretas em ambiente web neste domínio. Toda a negociação comercial é intermediada e validada de maneira manual no atendimento humano por telefone ou WhatsApp.*
        </p>

        {/* copyright and credit */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center text-[10px] text-slate-600 border-t border-slate-900/40 pt-4">
          <p className="font-mono">
            &copy; {currentYear} CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA. Todos os direitos reservados.
          </p>
          <p className="font-sans uppercase tracking-wider font-semibold">
            CNPJ Legítimo: 20.085.983/0001-13
          </p>
        </div>

      </div>
    </footer>
  );
}
