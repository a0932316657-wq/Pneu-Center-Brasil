import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FAQS } from '../data';

export default function FAQSection() {
  const [openIndexes, setOpenIndexes] = useState<number[]>(FAQS.map((_, i) => i));

  const toggleFAQ = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div id="faq-accordion-holder" className="space-y-4 max-w-3xl mx-auto">
      {FAQS.map((faq, index) => {
        const isOpen = openIndexes.includes(index);
        return (
          <div
            key={index}
            id={`faq-item-${index}`}
            className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all shadow-xs hover:border-slate-350 hover:shadow-sm"
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
