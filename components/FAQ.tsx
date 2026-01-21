import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { FAQS } from '../constants';
import Reveal from './Reveal';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate-600">
              Got questions? We've got answers.
            </p>
          </Reveal>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <Reveal key={index} delay={index * 50}>
              <div 
                className={`border rounded-xl transition-all duration-300 ${
                  openIndex === index 
                    ? 'border-brand-200 bg-brand-50/30 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className={`text-lg font-semibold ${openIndex === index ? 'text-brand-700' : 'text-slate-900'}`}>
                    {faq.question}
                  </span>
                  <span className={`ml-4 p-1 rounded-full ${openIndex === index ? 'bg-brand-200 text-brand-700' : 'bg-slate-100 text-slate-500'}`}>
                    {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                  </span>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="p-6 pt-0 text-slate-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;