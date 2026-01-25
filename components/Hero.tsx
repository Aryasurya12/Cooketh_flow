import React, { useRef, useState } from 'react';
import { ArrowRight, Github, Sparkles, PenTool, StickyNote } from 'lucide-react';
import Button from './Button';
import Reveal from './Reveal';
import AnimatedFlow from './AnimatedFlow';
import Mascot from './Mascot';

interface HeroProps {
  onNavigateToApp: () => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigateToApp }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation (limit to small angles)
    const rotateY = ((x - centerX) / centerX) * 5; // -5 to 5 degrees
    const rotateX = ((centerY - y) / centerY) * 5; // -5 to 5 degrees

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50">
      {/* Dynamic Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
         {/* Grid Texture */}
         <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-70"></div>
         
         {/* Animated Gradient Blobs */}
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-200/40 rounded-full blur-[100px] animate-float"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-yellow-200/40 rounded-full blur-[100px] animate-float-delayed"></div>
         
         {/* Floating Icons */}
         <div className="absolute top-1/4 left-10 text-brand-300 animate-float-fast opacity-50"><Sparkles size={48} /></div>
         <div className="absolute bottom-1/3 right-20 text-yellow-400 animate-float opacity-50"><StickyNote size={40} /></div>
         <div className="absolute top-32 right-1/4 text-orange-300 animate-float-delayed opacity-40"><PenTool size={32} /></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center">
          
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-brand-100 shadow-sm text-brand-700 text-sm font-bold mb-8 hover:scale-105 transition-transform cursor-default select-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              Cooketh Flow v2.0 is live!
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="relative inline-block mb-6">
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 tracking-tight relative z-10 leading-tight">
                    Think it. <br className="md:hidden" />
                    <span className="relative inline-block mx-2">
                      <span className="relative z-10 font-handwriting text-brand-600 transform -rotate-2 inline-block text-6xl sm:text-7xl md:text-8xl">Map it.</span>
                      {/* Underline Scribble */}
                      <svg className="absolute -bottom-2 left-0 w-full h-4 text-brand-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                         <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                      </svg>
                    </span> 
                    <br className="md:hidden" />
                    Ship it.
                </h1>
                
                {/* Mascot Interaction */}
                <div className="absolute -top-16 -right-16 hidden lg:block transform rotate-12 hover:rotate-0 transition-transform duration-300 cursor-pointer">
                   <Mascot pose="wave" size={120} />
                </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              The friendliest open-source tool for brainstorming, flowcharting, and real-time collaboration. 
              <span className="block mt-2 font-handwriting text-2xl text-slate-500 transform -rotate-1">Turn your messy ideas into structured workflows.</span>
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
              <Button size="lg" icon={ArrowRight} onClick={onNavigateToApp} className="shadow-lg shadow-brand-200/50 hover:shadow-brand-300/50">
                Get Started for Free
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                icon={Github}
                onClick={() => window.open('https://github.com/cooketh-flow', '_blank')}
                className="bg-white/80 backdrop-blur-sm"
              >
                View on GitHub
              </Button>
            </div>
          </Reveal>
        </div>

        {/* 3D Interactive Hero Visual */}
        <Reveal delay={400}>
          <div 
            className="perspective-1000 mx-auto max-w-6xl relative"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            ref={containerRef}
          >
            {/* Mascot Helper */}
            <div className="absolute -left-16 bottom-12 z-20 hidden xl:block animate-bounce-slow">
                 <Mascot pose="point-right" size={180} />
            </div>

            {/* The Floating Card */}
            <div 
                className="relative rounded-2xl border-4 border-slate-900/5 bg-white shadow-2xl overflow-hidden aspect-[16/9] flex flex-col transition-transform duration-100 ease-out will-change-transform"
                style={{
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                    boxShadow: `${-rotation.y * 5}px ${rotation.x * 5}px 50px rgba(0,0,0,0.15)`
                }}
            >
                {/* Glossy Reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50 z-30 pointer-events-none"></div>

                {/* App Toolbar Mockup */}
                <div className="h-14 bg-white border-b border-slate-100 flex items-center px-6 justify-between z-20 shrink-0">
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="hidden md:flex items-center space-x-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-200 text-xs font-semibold shadow-inner">
                        <span className="text-slate-400">Project /</span>
                        <span className="text-brand-700 font-handwriting text-base">Project Workflow</span>
                    </div>
                    <div className="w-16 flex justify-end">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs border border-brand-200">CF</div>
                    </div> 
                </div>

                {/* Interactive Canvas */}
                <div className="relative flex-grow w-full bg-slate-50 overflow-hidden z-10">
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>
                    
                    {/* Animated Flow Component */}
                    <AnimatedFlow />
                </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Hero;