import React from 'react';
import { ArrowRight, Github } from 'lucide-react';
import Button from './Button';
import Reveal from './Reveal';
import AnimatedFlow from './AnimatedFlow';

interface HeroProps {
  onNavigateToApp: () => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigateToApp }) => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-200/40 rounded-full blur-[100px] opacity-70 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-[100px] opacity-70"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            v2.0 is now live
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
            Think it. <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-orange-500">Map it.</span> Cook it.
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Cooketh Flow is the open-source visual thinking tool for brainstorming, flowcharting, and real-time collaboration. Turn your chaotic ideas into structured reality.
          </p>
        </Reveal>

        <Reveal delay={300}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" icon={ArrowRight} onClick={onNavigateToApp}>
              Try it out
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              icon={Github}
              onClick={() => window.open('https://github.com/cooketh-flow', '_blank')}
            >
              View on GitHub
            </Button>
          </div>
        </Reveal>

        {/* Dynamic Hero Visual */}
        <Reveal delay={400}>
          <div className="relative mx-auto max-w-5xl rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden aspect-[16/9] group flex flex-col">
            
            {/* App Toolbar Mockup */}
            <div className="h-12 bg-white/90 backdrop-blur border-b border-slate-100 flex items-center px-4 justify-between z-20 shrink-0">
               <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-slate-50 rounded-md border border-slate-200 text-xs shadow-sm">
                <span className="text-slate-400 font-medium">Project /</span>
                <span className="text-slate-900 font-semibold">Workflow Automation</span>
              </div>
              <div className="w-16"></div> 
            </div>

            {/* Interactive Canvas */}
            <div className="relative flex-grow w-full bg-slate-50/30 overflow-hidden z-10">
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>
                
                {/* Animated Flow Component */}
                <AnimatedFlow />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Hero;