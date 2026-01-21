import React from 'react';
import { CheckCircle2, PlayCircle } from 'lucide-react';
import { USE_CASES } from '../constants';
import Reveal from './Reveal';
import Button from './Button';

interface UseCasesProps {
  onUseCaseSelect: (prompt: string) => void;
}

const UseCases: React.FC<UseCasesProps> = ({ onUseCaseSelect }) => {
  return (
    <section id="use-cases" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Built for every way you think
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Select a template to start visualizing immediately.
            </p>
          </Reveal>
        </div>

        <div className="space-y-24">
          {USE_CASES.map((useCase, index) => (
            <div key={index} className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}>
              {/* Text Content */}
              <div className="flex-1">
                <Reveal delay={100}>
                  <div className="flex gap-2 mb-4">
                    {useCase.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-4">{useCase.title}</h3>
                  <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                    {useCase.description}
                  </p>
                  <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6 shadow-sm">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-2">Example Prompt</p>
                    <p className="text-slate-700 italic">"{useCase.prompt}"</p>
                  </div>
                  <Button 
                    variant="outline" 
                    icon={PlayCircle} 
                    onClick={() => onUseCaseSelect(useCase.prompt)}
                  >
                    Use this Template
                  </Button>
                </Reveal>
              </div>

              {/* Image Visual */}
              <div className="flex-1 w-full">
                <Reveal delay={200}>
                  <div 
                    className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 group cursor-pointer"
                    onClick={() => onUseCaseSelect(useCase.prompt)}
                  >
                    <div className="absolute inset-0 bg-brand-600/10 group-hover:bg-brand-600/0 transition-colors duration-500 z-10">
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-brand-600 text-white px-6 py-2 rounded-full font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">Start Mapping</span>
                        </div>
                    </div>
                    <img 
                      src={useCase.image} 
                      alt={useCase.title} 
                      className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                </Reveal>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;