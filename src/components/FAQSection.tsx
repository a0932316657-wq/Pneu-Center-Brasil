import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LOCAL_FAQS = [
  {
    question: 'O site vende direto?',
    answer: 'Não. Este site é um catálogo digital informativo. Não há checkout ou pagamento online. Toda transação é negociada e finalizada de forma segura por nossa equipe comercial.'
  },
  {
    question: 'Como confirmo disponibilidade?',
    answer: 'Basta escolher a medida ou modelo no site e clicar em "Consultar no WhatsApp" para que nossa equipe confirme o estoque instantaneamente.'
  },
  {
    question: 'Os preços podem variar?',
    answer: 'Sim. Devido à alta rotatividade e flutuação de custos de distribuidores, os preços e condições são sempre confirmados e garantidos no atendimento direto.'
  },
  {
    question: 'Como falar com o atendimento?',
    answer: 'Você pode clicar em qualquer botão de WhatsApp do site para ser direcionado ao nosso canal oficial de atendimento humano.'
  }
];

export default function FAQSection() {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  const toggleFAQ = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div id="faq-accordion-holder" className="space-y-4 max-w-3xl mx-auto font-sans">
      {LOCAL_FAQS.map((faq, index) => {
        const isOpen = openIndexes.includes(index);
        return (
          <div
            key={index}
            id={`faq-item-${index}`}
            className="rounded-xl border border-slate-205 bg-white overflow-hidden transition-all shadow-xs hover:border-slate-350 hover:shadow-sm"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex items-center justify-between gap-4 p-5 text-left text-slate-800 font-bold font-sans focus:outline-none cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-orange-500 shrink-0" />
                <span className="text-sm md:text-base">{faq.question}</span>
              </div>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-slate-400 shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-5 pt-0 border-t border-slate-100 text-xs md:text-sm text-slate-650 leading-relaxed font-sans">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
