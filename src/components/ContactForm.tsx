import React, { useState } from 'react';
import { Send, CheckCircle2, MessageSquare, Mail, Phone, Calendar, Info } from 'lucide-react';
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Sane frontend validates
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios (Nome, Telefone e E-mail).');
      return;
    }

    setIsSubmitting(true);

    // Simulate reliable submitting to physical store operators
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({
        name: '',
        phone: '',
        email: '',
        tireMeasure: '',
        message: '',
      });
    }, 1200);
  };

  return (
    <div id="contact-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Information Cards (Left Sidebar) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-xs">
          <h3 className="font-sans text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Info className="h-5 w-5 text-orange-500 shrink-0" />
            Canais Oficiais de Suporte
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded bg-emerald-50 p-2.5 text-emerald-600 mt-1 shrink-0">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">Atendimento WhatsApp</span>
                <p className="text-sm font-semibold text-slate-800">(11) 99594-6993</p>
                <span className="block text-[11px] text-slate-500">Atendimento imediato e cotação rápida</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded bg-blue-50 p-2.5 text-blue-600 mt-1 shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">Email Comercial</span>
                <p className="text-sm font-semibold text-slate-800">contato.pneucenterbrasil@gmail.com</p>
                <span className="block text-[11px] text-slate-500">Retorno em até 24 horas úteis</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded bg-orange-50 p-2.5 text-orange-600 mt-1 shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">Horários de Operação</span>
                <p className="text-sm font-semibold text-slate-800">Segunda a Sexta: 8h às 18h</p>
                <p className="text-sm font-semibold text-slate-800">Sábados: 8h às 13h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Safe Data Promise */}
        <div className="rounded-2xl border border-slate-200 bg-slate-100/50 p-5 space-y-2">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-widest font-sans flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Segurança de Dados Garantida
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Seus dados são transmitidos de forma criptografada para fins exclusivos de orçamento. Nós <strong>nunca coletamos CPF, senhas ou informações bancárias</strong> em nossa plataforma eletrônica.
          </p>
        </div>
      </div>

      {/* Actual Form Panel (Right) */}
      <div className="lg:col-span-7">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <h2 className="font-sans text-xl font-bold text-slate-800 tracking-tight mb-2">
            Solicitar Cotação de Medidas
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mb-6">
            Preencha os dados abaixo com as dimensões de pneu que necessita. Nossa equipe comercial fará a busca imediata em nosso estoque regional.
          </p>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-bounce">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="font-sans text-lg font-bold text-emerald-800">Solicitação Recebida com Sucesso!</h3>
              <p className="text-xs text-emerald-600 leading-relaxed max-w-md mx-auto">
                Agradecemos o seu contato. Suas informações de pneu já foram encaminhadas ao nosso setor de expedição de mercadorias. Um consultor entrará em contato em breve.
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="mt-4 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs px-4 py-2 transition-all cursor-pointer font-bold"
              >
                Nova Solicitação
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-600 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome */}
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Seu Nome <span className="text-orange-550 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Carlos Silva"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-sans"
                  />
                </div>

                {/* Telefone */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Telefone WhatsApp <span className="text-orange-550 font-bold">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Ex: (11) 99594-6993"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Seu E-mail <span className="text-orange-550 font-bold">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="carlos@exemplo.com"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-sans"
                  />
                </div>

                {/* Medida do Pneu */}
                <div>
                  <label htmlFor="tireMeasure" className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Deseja qual medida de pneu?
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
              </div>

              {/* Mensagem */}
              <div>
                <label htmlFor="message" className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Mensagem Adicional (Opcional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Gostaria de consultar as marcas disponíveis para pneus Aro 15 em São Paulo capital..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-all font-sans resize-none"
                ></textarea>
              </div>

              {/* Direct submit */}
              <button
                type="submit"
                id="btn-submit-contact"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2.5 rounded-lg bg-[#0B1B32] hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-450 text-white font-bold text-sm px-6 py-3 shadow-md hover:shadow-lg transition-all cursor-pointer font-sans"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Processando cotação de pneus...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Enviar Consulta de Pneu</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

    </div>
  );
}
