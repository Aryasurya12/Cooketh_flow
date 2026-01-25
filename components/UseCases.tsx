import React from 'react';
import { PlayCircle, ArrowDown } from 'lucide-react';
import { USE_CASES } from '../constants';
import Reveal from './Reveal';
import Button from './Button';
import DiagramPreview from './DiagramPreview';
import Mascot from './Mascot';

interface UseCasesProps {
  onUseCaseSelect: (prompt: string) => void;
}

const UseCases: React.FC<UseCasesProps> = ({ onUseCaseSelect }) => {
  return (
    <section id="use-cases" className="py-24 bg-slate-50 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[5%] text-slate-200 transform rotate-12 text-9xl font-handwriting opacity-20">Idea</div>
          <div className="absolute bottom-[10%] right-[5%] text-slate-200 transform -rotate-12 text-9xl font-handwriting opacity-20">Reality</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-24 relative">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Built for every way you <span className="font-handwriting text-brand-600 text-5xl relative top-1">think.</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Select a template to start visualizing immediately.
            </p>
          </Reveal>
          
          {/* Mascot Decoration */}
          <div className="absolute -top-12 left-[10%] hidden xl:block transform -rotate-12 opacity-90 animate-float-delayed">
             <Mascot pose="point-right" size={140} />
          </div>
        </div>

        {/* Vertical Connector Line (Desktop) */}
        <div className="absolute left-1/2 top-[300px] bottom-[200px] w-px border-l-2 border-dashed border-brand-200 hidden lg:block -translate-x-1/2 z-0"></div>

        <div className="space-y-32">
          {USE_CASES.map((useCase, index) => (
            <div key={index} className={`relative flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24`}>
              
              {/* Connector Dot (Desktop) */}
              <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border-4 border-brand-500 rounded-full z-10 items-center justify-center shadow-lg">
                  <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
              </div>

              {/* Text Content */}
              <div className="flex-1 relative">
                <Reveal delay={100}>
                  {/* Sticky Tape Decoration */}
                  <div className="absolute -top-6 left-0 w-24 h-8 bg-yellow-100/50 transform -rotate-3 border-l border-r border-white/50 backdrop-blur-sm hidden sm:block"></div>

                  <div className="flex gap-2 mb-4">
                    {useCase.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-4xl font-bold text-slate-900 mb-4 font-handwriting">{useCase.title}</h3>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    {useCase.description}
                  </p>
                  
                  <div className="bg-white p-5 rounded-xl border border-slate-200 mb-8 shadow-sm relative overflow-hidden group hover:border-brand-200 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                    <p className="text-xs text-slate-400 uppercase font-bold mb-2">Example Prompt</p>
                    <p className="text-slate-800 font-medium italic">"{useCase.prompt}"</p>
                  </div>

                  <Button 
                    variant="primary" 
                    icon={PlayCircle} 
                    onClick={() => onUseCaseSelect(useCase.prompt)}
                    className="shadow-lg shadow-brand-100"
                  >
                    Use this Template
                  </Button>
                </Reveal>
              </div>

              {/* Live Diagram Visual */}
              <div className="flex-1 w-full">
                <Reveal delay={200}>
                  <div 
                    className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-900/5 group cursor-pointer bg-white transform transition-transform duration-500 hover:scale-[1.02] hover:-rotate-1"
                    onClick={() => onUseCaseSelect(useCase.prompt)}
                  >
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-brand-900/5 group-hover:bg-brand-900/10 transition-colors duration-500 z-20 pointer-events-none">
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-brand-600 text-white px-6 py-2 rounded-full font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform flex items-center gap-2">
                                Start Mapping <ArrowDown size={16} className="-rotate-90"/>
                            </span>
                        </div>
                    </div>
                    
                    {/* The Actual Diagram Render */}
                    <DiagramPreview data={useCase.diagramData} />
                    
                    {/* Fake Toolbar for realism */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none opacity-50">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                        </div>
                        <div className="h-1 w-20 bg-slate-200 rounded"></div>
                    </div>
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