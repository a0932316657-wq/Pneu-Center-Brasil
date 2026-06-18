import React from 'react';
import { ShieldCheck, Scale, Truck, RefreshCw, Award, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { AppRoute } from '../types';

interface PolicyProps {
  key?: string;
  onBackToHome: () => void;
  onNavigate: (route: AppRoute, productId?: string) => void;
}

const COMPANY_DETAILS = (
  <div className="mt-12 rounded-xl bg-slate-50 border border-slate-200 p-6 font-sans shadow-xs">
    <h3 className="font-sans text-base font-extrabold text-slate-800 mb-2 uppercase">Pneu Center Brasil</h3>
    <p className="text-xs text-slate-600 leading-relaxed">
      Razão Social: <strong>CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA</strong><br />
      CNPJ: <strong className="font-mono">20.085.983/0001-13</strong><br />
      Endereço: Av. Professor Francisco Morato, 2001, Butantã, São Paulo/SP, CEP 05513-200<br />
      WhatsApp: (11) 99594-5993 • E-mail: contato@pneucenterbrasil.com.br • Website: www.pneucenterbrasil.com.br
    </p>
  </div>
);

export function PrivacyPolicy({ onBackToHome }: PolicyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <button
        onClick={onBackToHome}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Voltar ao Início</span>
      </button>

      <div className="max-w-none">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded bg-emerald-50 p-2.5 text-emerald-600 shadow-xs">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="font-sans text-2xl font-black text-slate-800 md:text-3.5xl m-0 tracking-tight uppercase">
            Política de Privacidade
          </h1>
        </div>
        <p className="font-mono text-xs text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-200 pb-4 font-bold">
          Última atualização: Junho de 2026
        </p>

        <div className="space-y-6 text-sm md:text-base text-slate-600 leading-relaxed font-sans">
          <p>
            Última atualização: Junho de 2026 • PNEU CENTER BRASIL, nome fantasia de CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA, inscrita no CNPJ 20.085.983/0001-13, com sede em Av. Professor Francisco Morato, 2001, Butantã, São Paulo/SP, CEP 05513-200.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">1. Informações que Coletamos</h2>
          <p>
            Podemos coletar nome, telefone, e-mail, cidade, veículo, medida de pneu desejada e mensagem enviada pelo formulário ou WhatsApp.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">2. Finalidade do Tratamento de Dados</h2>
          <p>
            Os dados são utilizados para responder solicitações, enviar orçamentos, confirmar disponibilidade, melhorar atendimento e cumprir obrigações legais.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">3. Base Legal para Tratamento</h2>
          <p>
            O tratamento ocorre conforme a LGPD, incluindo execução de procedimentos pré-contratuais, cumprimento de obrigações legais, legítimo interesse e consentimento quando aplicável.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">4. Compartilhamento de Dados</h2>
          <p>
            Não vendemos dados pessoais. Informações podem ser compartilhadas apenas quando necessário para atendimento, entrega, emissão fiscal ou obrigações legais.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">5. Cookies e Tecnologias de Rastreamento</h2>
          <p>
            O site pode utilizar cookies e tecnologias como Google Tag Manager, Google Ads e ferramentas de análise para melhorar experiência e mensuração de campanhas.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">6. Segurança dos Dados</h2>
          <p>
            Adotamos medidas técnicas e organizacionais para proteger os dados contra acesso não autorizado, alteração, perda ou divulgação indevida.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">7. Direitos do Titular</h2>
          <p>
            O titular pode solicitar acesso, correção, exclusão, portabilidade ou informações sobre tratamento dos dados conforme LGPD.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">8. Contato</h2>
          <p>
            WhatsApp: (11) 99594-5993<br />
            E-mail: contato@pneucenterbrasil.com.br<br />
            CNPJ: 20.085.983/0001-13
          </p>
        </div>
      </div>

      {COMPANY_DETAILS}
    </motion.div>
  );
}

export function TermsOfUse({ onBackToHome }: PolicyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <button
        onClick={onBackToHome}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Voltar ao Início</span>
      </button>

      <div className="max-w-none">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded bg-orange-50 p-2.5 text-orange-600 shadow-xs">
            <Scale className="h-7 w-7" />
          </div>
          <h1 className="font-sans text-2xl font-black text-slate-800 md:text-3.5xl m-0 tracking-tight uppercase">
            Termos de Uso
          </h1>
        </div>
        <p className="font-mono text-xs text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-200 pb-4 font-bold">
          Última atualização: Junho de 2026
        </p>

        <div className="space-y-6 text-sm md:text-base text-slate-600 leading-relaxed font-sans">
          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar o site da Pneu Center Brasil, o usuário declara estar ciente e concordar com estes Termos de Uso.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">2. Descrição do Serviço</h2>
          <p>
            O site funciona como catálogo digital para apresentação de pneus automotivos multimarcas. As consultas, orçamentos, confirmações de disponibilidade, entrega e condições comerciais são realizadas pelo atendimento oficial.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">3. Preços e Pagamento</h2>
          <p>
            Os preços exibidos são referências comerciais e podem variar conforme estoque, região de entrega, forma de pagamento e atualização de produto. A confirmação final ocorre no atendimento.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">4. Envio e Entrega</h2>
          <p>
            As condições de envio e entrega são informadas antes da confirmação da compra, conforme região, produto e disponibilidade logística.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">5. Propriedade Intelectual</h2>
          <p>
            Textos, imagens, marcas, layout e elements gráficos do site são protegidos conforme legislação aplicável. Marcas de fabricantes são usadas apenas para identificação dos produtos.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">6. Limitação de Responsabilidade</h2>
          <p>
            As imagens podem ser meramente ilustrativas. O cliente deve confirmar medida, marca, modelo, índice de carga, índice de velocidade e demais especificações antes da finalização.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">7. Contato</h2>
          <p>
            WhatsApp: (11) 99594-5993<br />
            E-mail: contato@pneucenterbrasil.com.br<br />
            CNPJ: 20.085.983/0001-13
          </p>
        </div>
      </div>

      {COMPANY_DETAILS}
    </motion.div>
  );
}

export function ShippingPolicy({ onBackToHome }: PolicyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <button
        onClick={onBackToHome}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Voltar ao Início</span>
      </button>

      <div className="max-w-none">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded bg-blue-50 p-2.5 text-blue-600 shadow-xs">
            <Truck className="h-7 w-7" />
          </div>
          <h1 className="font-sans text-2xl font-black text-slate-800 md:text-3.5xl m-0 tracking-tight uppercase">
            Política de Envio e Entrega
          </h1>
        </div>
        <p className="font-mono text-xs text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-200 pb-4 font-bold">
          Última atualização: Junho de 2026
        </p>

        <div className="space-y-6 text-sm md:text-base text-slate-600 leading-relaxed font-sans">
          <p>
            PNEU CENTER BRASIL, nome fantasia de CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA, inscrita no CNPJ 20.085.983/0001-13, com sede em Av. Professor Francisco Morato, 2001, Butantã, São Paulo/SP, CEP 05513-200.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">1. Área de Cobertura</h2>
          <p>
            A Pneu Center Brasil atende clientes em diferentes regiões, mediante confirmação de disponibilidade logística, prazo e condições de entrega.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">2. Prazo de Envio</h2>
          <p>
            O prazo de envio pode variar conforme o produto escolhido, disponibilidade, região de destino e transportadora/parceiro logístico utilizado. As informações são confirmadas durante o atendimento.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">3. Valor do Frete</h2>
          <p>
            O valor do frete é calculado conforme região, peso, volume, disponibilidade logística e modalidade de entrega. O valor é informado antes da confirmação da compra.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">4. Rastreamento</h2>
          <p>
            Quando houver entrega com rastreamento, o código será enviado ao cliente após postagem ou despacho.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">5. Embalagem</h2>
          <p>
            Os produtos são preparados para transporte conforme tipo de pneu e modalidade de envio, buscando preservar a integridade durante o deslocamento.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">6. Problemas na Entrega</h2>
          <p>
            Em caso de atraso, avaria ou divergência, o cliente deve entrar em contato pelos canais oficiais para análise e orientação.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">7. Contato</h2>
          <p>
            WhatsApp: (11) 99594-5993<br />
            E-mail: contato@pneucenterbrasil.com.br<br />
            CNPJ: 20.085.983/0001-13
          </p>
        </div>
      </div>

      {COMPANY_DETAILS}
    </motion.div>
  );
}

export function ReturnsPolicy({ onBackToHome }: PolicyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <button
        onClick={onBackToHome}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Voltar ao Início</span>
      </button>

      <div className="max-w-none">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded bg-amber-50 p-2.5 text-amber-600 shadow-xs">
            <RefreshCw className="h-7 w-7" />
          </div>
          <h1 className="font-sans text-2xl font-black text-slate-800 md:text-3.5xl m-0 tracking-tight uppercase">
            Política de Troca e Devolução
          </h1>
        </div>
        <p className="font-mono text-xs text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-200 pb-4 font-bold">
          Última atualização: Junho de 2026
        </p>

        <div className="space-y-6 text-sm md:text-base text-slate-600 leading-relaxed font-sans">
          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">1. Direito de Arrependimento</h2>
          <p>
            Quando aplicável, o cliente poderá solicitar cancelamento ou devolução conforme legislação brasileira vigente e condições da contratação.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">2. Condições para Troca ou Devolução</h2>
          <p>
            O produto deve estar sem sinais de uso indevido, sem instalação quando aplicável, com nota fiscal e em condições adequadas para análise.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">3. Produto com Defeito</h2>
          <p>
            Em caso de possível defeito de fabricação, a solicitação será analisada conforme política de garantia, legislação aplicável e regras do fabricante.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">4. Procedimento para Solicitação</h2>
          <p>
            O cliente deve entrar em contato pelo WhatsApp ou e-mail oficial informando dados do pedido, produto e motivo da solicitação.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">5. Reembolso</h2>
          <p>
            Quando aplicável, o reembolso será realizado após análise do produto e confirmação das condições de devolução.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">6. Custos de Envio</h2>
          <p>
            Custos de envio podem variar conforme motivo da solicitação, análise técnica, região e legislação aplicável.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">7. Contato</h2>
          <p>
            WhatsApp: (11) 99594-5993<br />
            E-mail: contato@pneucenterbrasil.com.br<br />
            CNPJ: 20.085.983/0001-13
          </p>
        </div>
      </div>

      {COMPANY_DETAILS}
    </motion.div>
  );
}

export function WarrantyPolicy({ onBackToHome }: PolicyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <button
        onClick={onBackToHome}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Voltar ao Início</span>
      </button>

      <div className="max-w-none">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded bg-sky-50 p-2.5 text-sky-600 shadow-xs">
            <Award className="h-7 w-7" />
          </div>
          <h1 className="font-sans text-2xl font-black text-slate-800 md:text-3.5xl m-0 tracking-tight uppercase">
            Política de Garantia
          </h1>
        </div>
        <p className="font-mono text-xs text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-200 pb-4 font-bold">
          Última atualização: Junho de 2026
        </p>

        <div className="space-y-6 text-sm md:text-base text-slate-600 leading-relaxed font-sans">
          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">1. Cobertura da Garantia</h2>
          <p>
            Os pneus comercializados possuem garantia legal e/ou garantia do fabricante, conforme regras aplicáveis, nota fiscal e condições de uso.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">2. Prazo de Garantia</h2>
          <p>
            O prazo de garantia pode variar conforme fabricante, modelo do pneu e legislação aplicável. As informações devem ser confirmadas no atendimento e documentação fiscal.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">3. Condições para Acionar a Garantia</h2>
          <p>
            Para acionar a garantia, o cliente deve apresentar nota fiscal, informações do produto e relatar o problema identificado.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">4. Exclusões da Garantia</h2>
          <p>
            A garantia pode não cobrir danos causados por uso inadequado, instalação incorreta, calibragem inadequada, impactos, cortes, desgaste natural, desalinhamento, sobrecarga, alterações no produto ou uso fora das especificações.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">5. Procedimento</h2>
          <p>
            O cliente deve entrar em contato pelos canais oficiais informando dados do pedido, nota fiscal, fotos do produto e descrição do problema.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">6. Contato</h2>
          <p>
            WhatsApp: (11) 99594-5993<br />
            E-mail: contato@pneucenterbrasil.com.br<br />
            CNPJ: 20.085.983/0001-13
          </p>
        </div>
      </div>

      {COMPANY_DETAILS}
    </motion.div>
  );
}
