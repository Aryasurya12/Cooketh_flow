import React from 'react';
import Reveal from './Reveal';
import Mascot from './Mascot';
import { 
  Zap, Users, Layout, Palette, FolderOpen, 
  Command, Check, Sparkles, MousePointer2
} from 'lucide-react';

const Features: React.FC = () => {
  return (
    <section id="features" className="py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <Reveal>
            <div className="inline-flex items-center justify-center p-2 mb-6 rounded-full bg-brand-50 border border-brand-100 shadow-sm">
                <Sparkles size={16} className="text-brand-500 mr-2" />
                <span className="text-brand-700 font-bold text-sm uppercase tracking-wide">Full Feature List</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6">
              Everything in the <span className="font-handwriting text-brand-600">Workspace.</span>
            </h2>
            <p className="text-lg text-slate-600">
              Cooketh Flow isn't just a whiteboard; it's a complete visual operating system for your ideas.
            </p>
          </Reveal>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
          
          {/* 1. Core Canvas (Large Block) */}
          <div className="md:col-span-2 md:row-span-1">
             <Reveal>
                <div className="bg-slate-50 rounded-[2rem] p-8 sm:p-10 border border-slate-200 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-100/50 transition-all duration-300 h-full relative group overflow-hidden">
                  
                  {/* SVG Scene: Infinite Canvas Explorer */}
                  <div className="absolute -right-16 -bottom-16 w-80 h-80 pointer-events-none opacity-90 transition-transform duration-500 group-hover:scale-105 group-hover:-translate-x-2 group-hover:-translate-y-2">
                     <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible">
                        {/* Perspective Grid */}
                        <defs>
                          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                          </pattern>
                        </defs>
                        <rect x="0" y="50" width="300" height="250" fill="url(#grid)" transform="skewX(-15)" opacity="0.5" />
                        
                        {/* Floating Nodes */}
                        <rect x="40" y="80" width="60" height="40" rx="8" fill="white" stroke="#94a3b8" strokeWidth="2" className="animate-float" />
                        <rect x="180" y="60" width="50" height="50" rx="25" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" className="animate-float-delayed" />
                        
                        {/* Connection Line */}
                        <path d="M 100 100 C 140 100, 140 85, 180 85" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" fill="none" className="animate-pulse" />
                     </svg>
                     
                     {/* Mascot Pointing */}
                     <div className="absolute bottom-10 left-10 transform scale-x-[-1]">
                        <Mascot pose="point-right" size={160} />
                     </div>
                  </div>

                  <div className="relative z-10 flex flex-col h-full justify-between max-w-lg">
                    <div>
                        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 shadow-sm rotate-3 group-hover:rotate-0 transition-transform">
                           <Layout size={28} />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-4">Infinite Canvas</h3>
                        <p className="text-slate-600 text-lg mb-6 max-w-md">
                            An endless space for your biggest ideas. Zoom, pan, and explore without boundaries.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-slate-700 font-medium"><Check size={18} className="text-brand-500"/> Smart Drag & Resize</div>
                        <div className="flex items-center gap-2 text-slate-700 font-medium"><Check size={18} className="text-brand-500"/> Labeled Connections</div>
                        <div className="flex items-center gap-2 text-slate-700 font-medium"><Check size={18} className="text-brand-500"/> Database & Image Nodes</div>
                        <div className="flex items-center gap-2 text-slate-700 font-medium"><Check size={18} className="text-brand-500"/> Sticky Notes</div>
                    </div>
                  </div>
                </div>
             </Reveal>
          </div>

          {/* 2. AI & Automation (Vertical Block) */}
          <div className="md:col-span-1 md:row-span-2">
            <Reveal delay={100}>
                <div className="bg-gradient-to-b from-amber-50 to-white rounded-[2rem] p-8 border border-amber-200 hover:border-amber-400 hover:shadow-xl transition-all duration-300 h-full relative group overflow-hidden flex flex-col">
                  {/* Decorative Blur */}
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-200 rounded-full blur-3xl opacity-20"></div>
                  
                  <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6 shadow-sm -rotate-3 group-hover:rotate-0 transition-transform">
                    <Zap size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">AI Copilot</h3>
                  <p className="text-slate-600 mb-8 relative z-10">
                      Stuck? Let Gemini AI generate a flowchart or mind map from a simple text prompt.
                  </p>
                  
                  {/* Mock UI for prompt */}
                  <div className="flex-grow space-y-4 relative z-10">
                     <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm text-sm text-slate-600 italic">
                        "Generate a marketing plan..."
                     </div>
                     <div className="flex justify-center py-2">
                        <ArrowDownIcon />
                     </div>
                     {/* Result Card */}
                     <div className="bg-white p-2 rounded-xl border border-amber-100 shadow-sm opacity-80 scale-95 origin-top transform group-hover:translate-y-1 transition-transform">
                        <div className="flex justify-center"><div className="w-8 h-8 rounded-full bg-brand-100 mb-2"></div></div>
                        <div className="h-2 bg-slate-100 rounded w-3/4 mx-auto mb-1"></div>
                        <div className="h-2 bg-slate-100 rounded w-1/2 mx-auto"></div>
                     </div>
                  </div>

                  {/* SVG Scene: AI Chef */}
                  <div className="absolute bottom-4 right-4 transform group-hover:scale-110 transition-transform">
                    {/* Magic Sparkles */}
                    <div className="absolute -top-6 -left-4 animate-pulse text-yellow-400"><Sparkles size={24} /></div>
                    <div className="absolute top-0 right-0 animate-bounce text-amber-300 delay-100"><Sparkles size={16} /></div>
                    <Mascot pose="chef" size={130} />
                  </div>
                </div>
            </Reveal>
          </div>

          {/* 3. Collaboration (Standard Block) */}
          <div className="md:col-span-1 md:row-span-1">
            <Reveal delay={200}>
                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-200 hover:border-green-300 hover:shadow-xl transition-all duration-300 h-full relative group overflow-hidden">
                  
                  {/* SVG Scene: Real-time Sync */}
                  <div className="absolute -right-2 top-4 w-40 h-40 pointer-events-none">
                      <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                          {/* Connection Lines */}
                          <path d="M 100 100 L 140 60" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4,4" />
                          <path d="M 100 100 L 60 140" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4,4" />
                          
                          {/* Floating Cursors */}
                          <g className="animate-float">
                             <path d="M 140 60 L 150 85 L 130 85 Z" fill="#3b82f6" stroke="white" strokeWidth="2" transform="rotate(-15 140 60)"/>
                             <rect x="150" y="55" width="40" height="20" rx="4" fill="#3b82f6" />
                             <text x="170" y="69" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">Alex</text>
                          </g>
                          <g className="animate-float-delayed" transform="translate(-40, 40)">
                             <path d="M 80 100 L 90 125 L 70 125 Z" fill="#ef4444" stroke="white" strokeWidth="2" transform="rotate(-15 80 100)"/>
                          </g>
                      </svg>
                      {/* Mascot Waving */}
                      <div className="absolute top-10 left-0 transform scale-x-[-1] opacity-90">
                          <Mascot pose="wave" size={100} />
                      </div>
                  </div>

                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6 shadow-sm rotate-2 group-hover:rotate-0 transition-transform relative z-10">
                    <Users size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 relative z-10">Real-time Sync</h3>
                  <p className="text-slate-600 text-sm mb-6 relative z-10">
                      See live cursors and edits from your team instantly.
                  </p>
                  
                  {/* Avatar Pile */}
                  <div className="flex -space-x-3 mt-auto relative z-10">
                     {[1,2,3].map(i => (
                         <div key={i} className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm transform transition-transform hover:-translate-y-1 ${i===1?'bg-blue-500':i===2?'bg-red-500':'bg-amber-500'}`}>
                             {i===1?'JD':i===2?'AK':'You'}
                         </div>
                     ))}
                     <div className="w-10 h-10 rounded-full border-2 border-slate-200 bg-white flex items-center justify-center text-xs text-slate-400 font-bold">+5</div>
                  </div>
                </div>
            </Reveal>
          </div>

          {/* 4. Styling (Standard Block) */}
          <div className="md:col-span-1 md:row-span-1">
            <Reveal delay={300}>
                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 h-full relative group overflow-hidden">
                  
                  {/* SVG Scene: Total Control Artist */}
                  <div className="absolute right-0 bottom-0 w-32 h-32 pointer-events-none">
                      <div className="absolute inset-0 flex items-end justify-end p-2 opacity-90 transition-transform group-hover:scale-105 group-hover:rotate-3">
                         <Mascot pose="artist" size={120} />
                      </div>
                      {/* Floating Shapes */}
                      <div className="absolute top-0 left-0 w-full h-full">
                          <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-red-400 animate-float"></div>
                          <div className="absolute top-10 right-10 w-6 h-6 bg-blue-400 rotate-12 animate-float-delayed"></div>
                          <div className="absolute bottom-10 left-0 w-6 h-6 bg-yellow-400 rotate-45 animate-wiggle"></div>
                      </div>
                  </div>

                  <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6 shadow-sm -rotate-2 group-hover:rotate-0 transition-transform relative z-10">
                    <Palette size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 relative z-10">Total Control</h3>
                  <p className="text-slate-600 text-sm mb-6 relative z-10 max-w-[60%]">
                      Custom colors, shapes, and font styles to match your vibe.
                  </p>
                </div>
            </Reveal>
          </div>

          {/* 5. Management & Productivity (Wide Block) */}
          <div className="md:col-span-3">
             <Reveal delay={400}>
                <div className="bg-slate-900 rounded-[2rem] p-8 sm:p-12 text-white relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[120px] -mr-32 -mt-32"></div>
                   
                   <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                      <div className="flex-1">
                          <div className="inline-flex items-center gap-2 text-brand-400 font-bold uppercase tracking-wider text-sm mb-4">
                              <Command size={16} /> Power User Ready
                          </div>
                          <h3 className="text-3xl font-bold mb-4">Master Your Workflow</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-300">
                              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div> Document Outline Mode</li>
                              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div> Undo / Redo History</li>
                              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div> Export to PDF/PNG/JSON</li>
                              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div> Keyboard Shortcuts</li>
                          </div>
                      </div>
                      <div className="flex-1 flex justify-center md:justify-end">
                          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-2xl transform rotate-3 group-hover:rotate-0 transition-transform duration-500 relative">
                             {/* Mini Mascot peeking from top of the folder list */}
                             <div className="absolute -top-10 -right-6 transform rotate-12">
                                 <Mascot pose="peek" size={80} />
                             </div>

                             <div className="flex items-center gap-4 mb-4 border-b border-slate-700 pb-4">
                                 <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center"><FolderOpen size={20} className="text-slate-400"/></div>
                                 <div>
                                     <div className="text-sm font-bold">My Projects</div>
                                     <div className="text-xs text-slate-500">12 maps created</div>
                                 </div>
                             </div>
                             <div className="space-y-2">
                                 <div className="h-2 bg-slate-700 rounded w-48"></div>
                                 <div className="h-2 bg-slate-700 rounded w-32"></div>
                                 <div className="h-2 bg-slate-700 rounded w-40"></div>
                             </div>
                          </div>
                      </div>
                   </div>
                </div>
             </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
};

// Simple Arrow SVG helper
const ArrowDownIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-300 animate-bounce">
        <path d="M12 5V19M12 19L19 12M12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export default Features;