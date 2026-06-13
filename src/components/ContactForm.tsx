import React, { useState } from 'react';
import { Send, MessageSquare, Mail, MapPin, Building2 } from 'lucide-react';
import { motion } from 'motion/react';
import { ContactFormInput } from '../types';

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormInput>({
    name: '',
    phone: '',
    email: '',
    tireMeasure: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWhatsAppRedirect = (text: string) => {
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/551195796840?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const messageTemplate = `Olá, gostaria de solicitar um orçamento para pneus na Pneu Center Brasil:
• Nome: ${formData.name}
• E-mail: ${formData.email}
• Telefone: ${formData.phone}
• Medida do Pneu: ${formData.tireMeasure || 'Não informada'}
• Mensagem: ${formData.message}`;

    setTimeout(() => {
      setIsSubmitting(false);
      handleWhatsAppRedirect(messageTemplate);
    }, 600);
  };

  return (
    <div className="space-y-12">
      <div id="contact-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Coluna Esquerda: Canais de Atendimento */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-xs font-sans">
            <h3 className="font-sans text-lg font-black text-slate-800 tracking-tight uppercase border-b pb-3 border-slate-100">
              Canais de Atendimento
            </h3>
            
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="rounded bg-emerald-50 p-2.5 text-emerald-600 mt-1 shrink-0">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Telefone/WhatsApp:</span>
                  <p className="text-base font-extrabold text-slate-800 select-all">
                    Principal: (11) 9579-6840
                  </p>
                  <p className="text-sm font-semibold text-slate-550 select-all">
                    Secundário: (11) 99594-6993
                  </p>
                  <span className="block text-[11px] text-slate-500">Clique no botão abaixo ou chame diretamente</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded bg-blue-50 p-2.5 text-blue-600 mt-1 shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">E-mail:</span>
                  <p className="text-base font-extrabold text-slate-800 select-all">contato@pneucenterbrasil.com.br</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded bg-orange-50 p-2.5 text-orange-600 mt-1 shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Endereço:</span>
                  <p className="text-sm font-semibold text-slate-700">
                    Av. Professor Francisco Morato, 2001, Butantã, São Paulo - SP, CEP 05513-200
                  </p>
                </div>
              </div>
            </div>

            {/* Empresa identificada block */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-start gap-2.5">
                <Building2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-500 leading-relaxed">
                  <p className="font-extrabold text-slate-700">CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA</p>
                  <p className="font-mono">CNPJ: 20.085.983/0001-13</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleWhatsAppRedirect("Olá! Gostaria de falar com o atendimento técnico da Pneu Center Brasil.")}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 transition-colors cursor-pointer shadow-xs"
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span>Falar pelo WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Formulário */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs font-sans">
            <h3 className="font-sans text-lg font-black text-slate-800 tracking-tight uppercase border-b pb-3 border-slate-100 mb-6">
              Solicitar Orçamento por Mensagem
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                  Nome <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Carlos Silva"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                    E-mail <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="carlos@exemplo.com"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                    Telefone <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Ex: (11) 9579-6840"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="tireMeasure" className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                  Medida do Pneu Desejada
                </label>
                <input
                  type="text"
                  id="tireMeasure"
                  name="tireMeasure"
                  value={formData.tireMeasure}
                  onChange={handleChange}
                  placeholder="Ex: 205/55 R16"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-mono"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Olá! Gostaria de verificar preço e prazo de entrega para pneus de passeio multimarcas..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                id="btn-submit-contact"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-orange-655 bg-orange-600 hover:bg-orange-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider py-4 shadow-md transition-all cursor-pointer font-sans"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></div>
                    <span>Redirecionando...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 text-slate-950" />
                    <span>Enviar Mensagem (Abrir WhatsApp)</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Google Maps Iframe */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
        <h4 className="font-sans bg-slate-50 px-6 py-4 uppercase font-black text-slate-700 tracking-wider text-xs border-b border-slate-100">
          Nossa Localização Física em São Paulo
        </h4>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.7720980425717!2d-46.72658822538965!3d-23.57662!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce570be485d4cb%3A0x8be5b72dfa4f5fbe!2sAv.%20Prof.%20Francisco%20Morato%2C%25202001%2520-%2520Butant%25C3%25A3%252C%2520S%25C3%25A3o%2520Paulo%2520-%2520SP%252C%252005513-300!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr"
          width="100%"
          height="350"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          title="Google Map Pneu Center Brasil"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
