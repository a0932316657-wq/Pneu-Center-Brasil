import React from 'react';
import { ShieldCheck, Scale, Truck, RefreshCw, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { AppRoute } from '../types';

interface PolicyProps {
  onBackToHome: () => void;
  onNavigate: (route: AppRoute, productId?: string) => void;
  key?: React.Key;
}

const COMPANY_DETAILS = (
  <div className="mt-12 rounded-xl bg-slate-50 border border-slate-200 p-6 font-sans shadow-xs">
    <h3 className="font-sans text-base font-extrabold text-slate-800 mb-2 uppercase">Pneu Center Brasil</h3>
    <p className="text-xs text-slate-600 leading-relaxed">
      Razão Social: <strong>CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA</strong><br />
      CNPJ: <strong className="font-mono">20.085.983/0001-13</strong><br />
      Endereço: Av. Professor Francisco Morato, 2001, Butantã, São Paulo/SP, CEP 05513-200<br />
      WhatsApp: (11) 99594-6993 • E-mail: contato.pneucenterbrasil@gmail.com
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
            Na <strong>Pneu Center Brasil</strong>, a privacidade e a segurança dos dados pessoais de nossos clientes são prioritárias. Esta Política de Privacidade explica de forma transparente como lidamos com as informações coletadas por meio de nosso site de catálogo digital.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">1. Quais dados são coletados?</h2>
          <p>
            Como nosso site funciona exclusivamente em modalidade de catálogo digital eletrônico, nós não coletamos dados de faturamento diretamente pelo sistema. Coletamos apenas os dados básicos preenchidos ativamente por você em nosso formulário de contato ou através do link de redirecionamento para o WhatsApp, que incluem:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-slate-650">
            <li>Nome completo;</li>
            <li>Telefone de contato (WhatsApp);</li>
            <li>Endereço de e-mail;</li>
            <li>Cidade ou região de interesse de entrega;</li>
            <li>Medida de pneu ou veículo de preferência informado no campo de texto livre.</li>
          </ul>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">2. Como os dados são utilizados?</h2>
          <p>
            Os dados indicados são de porte exclusivo de atendimento manual e se destinam especificamente ao seguinte rol de finalidades:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-slate-650">
            <li>Responder às suas dúvidas e detalhar as especificações técnicas de pneus;</li>
            <li>Efetuar cotações de preços personalizadas;</li>
            <li>Consultar a disponibilidade imediata no estoque físico correspondente à sua região;</li>
            <li>Organizar a logística de entrega física junto a transportadoras terceiras ou parceiras comerciais autorizadas;</li>
            <li>Garantir o perfeito cumprimento de obrigações civis de assistência ao consumidor.</li>
          </ul>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">3. Sem Coleta de Dados Financeiros no Site</h2>
          <p>
            Reiteramos de forma veemente que <strong>este portal não possui formulários de checkout e não solicita sob nenhuma circunstância dados de cartões de débito, crédito, contas correntes ou senhas pessoais</strong>. Em caso de envio ou requisição desses dados, considere de imediato a ocorrência de phishing e reporte imediatamente à nossa equipe.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">4. Direitos do Titular (LGPD)</h2>
          <p>
            Em conformidade integral com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD), o usuário detém a plenitude dos direitos de solicitar a confirmação do tratamento, acessar seus dados sob controle da Pneu Center Brasil, revogar o consentimento outorgado para conversação comercial e requerer a exclusão completa de seus dados corporativos no canal designado de correspondência: <strong>contato.pneucenterbrasil@gmail.com</strong>.
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
          <p>
            Seja bem-vindo ao portal da <strong>Pneu Center Brasil</strong>. Ao acessar e utilizar este site, você concorda de maneira livre e informada com todos os regulamentos expressos neste Termos de Uso.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">1. Natureza do Site: Catálogo Digital</h2>
          <p>
            O presente endereço eletrônico destina-se puramente à listagem informativa, educacional e comercial preliminar do rol de pneus automotivos negociados. <strong>O site não é um canal de e-commerce e não opera venda virtual automática, carrinho ou faturamento eletrônico próprio.</strong> O ato de clicar ou interagir com nosso site não constitui negócio jurídico perfeito ou compromisso definitivo de venda pela nossa empresa.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">2. Flutuação de Estoque e Informações Técnicas</h2>
          <p>
            Todas as imagens de produtos contidas no site servem como referência de modelo ou padrão visual de pneus de passeio e SUV e possuem caráter ilustrativo. Os preços de pneus, sua disponibilidade física e as marcas que detêm fabricação flutuam ao longo de períodos sazonais do mercado e de logística das importadoras. As atualizações técnicas definitivas, bem como a homologação oficial para cada modelo específico de veículo, são conferidas de maneira obrigatória no atendimento telefônico ou por WhatsApp.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">3. Independência das Marcas Comerciais</h2>
          <p>
            A Pneu Center Brasil opera no mercado nacional na condição de <strong>revendedora multimarcas e independente</strong> de pneus automotivos de reposição. Marcas registradas mencionadas de terceiros (incluindo Pirelli, Michelin, Goodyear, Bridgestone, Continental, Dunlop, Firestone e Hankook) são usadas legalmente para designar especificações originais industriais do pneu. Não possuímos vínculo societário oficial ou participação acionária junto a nenhuma das referidas fábricas multinacionais.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">4. Foro Aplicável</h2>
          <p>
            Para dirimir controvérsias judiciais que decorram da leitura dos termos do site, as partes elegem preferencialmente o foro da comarca da Capital de São Paulo/SP, com renúncia a qualquer outro, por mais privilegiado que este venha a se apresentar.
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
            Política de Entrega e Pagamento
          </h1>
        </div>
        <p className="font-mono text-xs text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-200 pb-4 font-bold">
          Última atualização: Junho de 2026
        </p>

        <div className="space-y-6 text-sm md:text-base text-slate-600 leading-relaxed font-sans">
          <p>
            Esta política rege o processo comercial e logístico estritamente humano que ocorre logo após o encerramento da busca informativa em nosso catálogo eletrônico.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">1. Dinâmica da Entrega Física</h2>
          <p>
            Prazos de entrega, custos de fretes locais ou interestaduais e termos de coleta dependem exclusivamente de variáveis que envolvem peso de carga, CEP de recebimento e restrições locais de circulação de veículos de grande porte. Portanto:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-slate-650">
            <li>As condições exatas de tempo e valores de fretes são orçadas e individualizadas durante a conversa via WhatsApp;</li>
            <li>Utilizamos transportadoras profissionais terceirizadas credenciadas para envios rápidos, ou opcionalmente, disponibilizamos coordenadas de retirada física de acordo com a disponibilidade;</li>
            <li>A encomenda só é liberada para transporte após confirmação expressa do pedido e aprovação documental no atendimento comercial direto.</li>
          </ul>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">2. Condições de Pagamento de Pneus</h2>
          <p>
            Para fins de segurança jurídica mútua e prevenção a fraudes cibernéticas comuns no comércio automotivo:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-slate-650">
            <li><strong>A Pneu Center Brasil não processa Pix, boletos ou cartões de modo antecipado através deste site;</strong></li>
            <li>As verdadeiras formas de pagamento aceitas e autorizadas serão detalhadas e explicadas formalmente pelo nosso atendente no WhatsApp;</li>
            <li>As formas comerciais incluem pagamento presencial na hora da entrega física do produto, boletos validados faturados corporativos, ou cartões de débito e crédito faturados nos terminais devidamente autorizados.</li>
          </ul>

          <p className="text-amber-800 font-semibold mt-4 bg-amber-50 rounded-lg border border-amber-250 p-4 shadow-xs text-xs sm:text-sm">
            Aviso de Prevenção: Nunca faça nenhum tipo de depósito, PIX ou pagamento online direcionado para chaves de contas que constem fora do domínio de nossa razão social legítima (CENTRO AUTOMOTIVO PNEU DO MEU CARRO LTDA). Exija sempre faturamento formal.
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
            Política de Trocas, Devoluções e Garantia
          </h1>
        </div>
        <p className="font-mono text-xs text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-200 pb-4 font-bold">
          Última atualização: Junho de 2026
        </p>

        <div className="space-y-6 text-sm md:text-base text-slate-600 leading-relaxed font-sans">
          <p>
            Na <strong>Pneu Center Brasil</strong>, a satisfação total e a conformidade técnica dos pneus comercializados fundamentam nosso compromisso de atendimento.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">1. Conferência na Entrega do Produto</h2>
          <p>
            Recomendamos expressamente que o cliente ou preposto designado realize a conferência imediata dos pneus no exato momento da entrega, verificando:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-slate-650">
            <li>Se a marca, modelo e medida (com largura, perfil e aro) batem rigorosamente com o pedido acordado comercialmente;</li>
            <li>Se há alguma avaria física decorrente do transporte que possa comprometer a integridade física do produto.</li>
          </ul>
          <p>
            Verificada qualquer divergência técnica ou avaria física aparente, recuse o recebimento imediato e comunique à Pneu Center Brasil pelo WhatsApp ou e-mail corporativo.
          </p>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">2. Direito de Arrependimento legal (7 Dias)</h2>
          <p>
            Conforme artigo 49 do Código de Defesa do Consumidor brasileiro (CDC), em transações comerciais realizadas fora do estabelecimento físico, o consumidor detém o período legal de reflexão de 7 dias (contados a partir do efetivo recebimento do pneu) para solicitar a revogação da aquisição e estorno financeiro correspondente, contanto que:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-slate-650">
            <li>Os pneus permaneçam em estado de novos, não tenham sido submetidos a qualquer montagem física em rodas ou rodagem em vias;</li>
            <li>Mantenham-se intactas as etiquetas industriais de vulcanização das fábricas originais.</li>
          </ul>

          <h2 className="font-sans text-base font-bold text-slate-800 uppercase mt-8 mb-3">3. Garantia Técnica Contra Defeitos de Fabricação</h2>
          <p>
            Todos os pneus que revendemos contam com garantia legal de fabricação, conforme leis aplicáveis do país e normas declaradas pelos respectivos fabricantes. A reposição contra falhas ou defeitos de vulcanização estruturais passa por análise profissional do engenheiro ou distribuidor oficial do pneu em questão.
          </p>
          <p>
            Damos ciência de que <strong>avarias decorrentes de buracos nas vias, montagem incorreta do pneu, furos acidentais por pregos, bolhas provocadas por impactos severos ou problemas de suspensão desalinhada (desgaste irregular de banda de rodagem) não constituem defeito industrial do pneu</strong> e estão excluídos formalmente das condições básicas de garantia de revenda.
          </p>
        </div>
      </div>

      {COMPANY_DETAILS}
    </motion.div>
  );
}
