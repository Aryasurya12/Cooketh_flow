import React from 'react';
import { Github, Heart, MessageCircle } from 'lucide-react';
import Button from './Button';
import Reveal from './Reveal';
import Mascot from './Mascot';

const Community: React.FC = () => {
  return (
    <section id="community" className="py-24 bg-slate-900 text-white overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-600/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Mascot Peeking out */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 z-20 animate-float">
             <Mascot pose="love" size={140} />
        </div>

        <Reveal>
          <div className="inline-flex items-center justify-center p-3 mb-8 bg-slate-800 rounded-full border border-slate-700 shadow-xl mt-8">
             <Heart className="text-red-500 h-5 w-5 mr-2 fill-current" />
             <span className="text-slate-300 font-medium">Loved by developers worldwide</span>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            It's Free. It's Open Source.
          </h2>
          <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
            We believe in transparent, collaborative software. Join our community, contribute code, or host it yourself.
          </p>
        </Reveal>

        <Reveal delay={200}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="primary" icon={Github} onClick={() => window.open('https://github.com', '_blank')}>
              Star on GitHub
            </Button>
            <Button size="lg" variant="secondary" className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700" icon={MessageCircle} onClick={() => window.open('https://discord.com', '_blank')}>
              Join Discord
            </Button>
          </div>
        </Reveal>

        <Reveal delay={300}>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center border-t border-slate-800 pt-12">
            <div>
              <div className="text-3xl font-bold text-white mb-1">5k+</div>
              <div className="text-slate-500 text-sm">GitHub Stars</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">120+</div>
              <div className="text-slate-500 text-sm">Contributors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">10k+</div>
              <div className="text-slate-500 text-sm">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-slate-500 text-sm">Free & Open</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Community;