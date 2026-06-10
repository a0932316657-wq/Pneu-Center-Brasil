import React, { useState } from 'react';
import { Search, MapPin, Truck, Calendar, ArrowLeft, ExternalLink, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { AppRoute } from '../types';

interface TrackingPageProps {
  key?: string;
  onBackToHome: () => void;
  onNavigate: (route: AppRoute) => void;
}

export function TrackingPage({ onBackToHome }: TrackingPageProps) {
  const [code, setCode] = useState('');
  const [searched, setSearched] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      setSearched(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 font-sans"
    >
      {/* Back button */}
      <button
        onClick={onBackToHome}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Voltar ao Início</span>
      </button>

      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="font-sans text-3xl font-black text-slate-800 sm:text-4xl uppercase tracking-tight">
          Rastreamento de Pedido
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          Acompanhe o status de envio físico dos seus pneus adquiridos através de canais autorizados de atendimento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Tracking control block */}
        <div className="md:col-span-8 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <form onSubmit={handleTrack} className="space-y-4">
              <label htmlFor="tracking-input" className="block text-xs font-black uppercase text-slate-705 tracking-wider">
                Código de Rastreamento (Correios ou Transportadora)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="tracking-input"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setSearched(false);
                  }}
                  placeholder="Ex: BR123456789BR"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold focus:border-slate-400 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-black text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  <span>Acompanhar</span>
                </button>
              </div>
            </form>

            {searched && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 border-t border-slate-100 pt-6 space-y-5"
              >
                <div className="bg-amber-50 rounded-xl border border-amber-200/60 p-4 flex gap-3">
                  <div className="rounded-lg bg-amber-100 p-2 text-amber-800 border border-amber-200/40 shrink-0">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs uppercase font-extrabold text-amber-850">Localizador Recebido</h4>
                    <p className="text-xs text-slate-650 leading-relaxed">
                      Código informado: <strong className="font-mono text-slate-800">{code.toUpperCase()}</strong>. Os detalhes do lote de despacho físico encontram-se em preparação fiscal e aguardando confirmação lógica junto ao transportador habilitado para faturamento da sua região.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">Histórico de Movimentação</h4>
                  
                  <div className="relative border-l border-slate-200 pl-6 space-y-6 text-xs">
                    <div className="relative">
                      <div className="absolute -left-[30px] top-1 h-3 w-3 rounded-full bg-orange-600 border border-white ring-4 ring-orange-100" />
                      <p className="font-extrabold text-slate-800 uppercase">Processamento de Emissão de Nota Fiscal</p>
                      <p className="text-slate-400 text-[10px] uppercase font-semibold mt-0.5">Sede Administrativa • Butantã/SP</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[30px] top-1 h-3 w-3 rounded-full bg-slate-300 border border-white ring-4 ring-slate-100" />
                      <p className="font-extrabold text-slate-500 uppercase">Separação de Lote & Marcações de Fábrica</p>
                      <p className="text-slate-400 text-[10px] uppercase font-semibold mt-0.5">Centro Distribuidor de Logística</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <span className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Você também pode consultar o rastreamento em tempo real nos Correios.
                  </span>
                  <a
                    href="https://rastreamento.correios.com.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded bg-white border border-slate-200 px-3 py-1.5 text-xs font-extrabold text-slate-700 hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Site Correios</span>
                    <ExternalLink className="h-3.0 w-3.0" />
                  </a>
                </div>
              </motion.div>
            )}
          </div>

          {/* Guidelines disclaimer block */}
          <div className="rounded-2xl bg-amber-50 border border-amber-200/50 p-6 space-y-3">
            <div className="flex items-center gap-2 text-amber-805 text-slate-800 font-extrabold uppercase text-xs tracking-wider">
              <HelpCircle className="h-4 w-4 text-amber-600" />
              <span>Aviso Importante Sobre Rastreio</span>
            </div>
            <p className="text-xs text-slate-650 leading-relaxed">
              Trabalhamos com lotes de parceiras logísticas e despachantes multimarcas. A Pneu Center Brasil emite a Nota Fiscal Eletrônica e encaminha os dados do faturamento fiscal em até 1 dia útil após a confirmação total do seu pedido de cotação via WhatsApp. Caso não localize seu código, consulte diretamente nosso suporte.
            </p>
          </div>
        </div>

        {/* Corporate specifications sidebar */}
        <div className="md:col-span-4 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4 text-xs shadow-xs text-slate-600">
            <h4 className="font-sans text-xs font-black uppercase text-slate-700 tracking-wider border-b pb-2 border-slate-200">
              Dados Cadastrais
            </h4>
            <div className="space-y-4">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Razão Social:</span>
                <p className="font-extrabold text-slate-800 uppercase">CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA</p>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">CNPJ Oficial:</span>
                <p className="font-mono font-black text-slate-800">20.085.983/0001-13</p>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Endereço Sede:</span>
                <p className="text-slate-700 font-medium">Av. Professor Francisco Morato, 2001, Butantã, São Paulo - SP</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </motion.div>
  );
}
