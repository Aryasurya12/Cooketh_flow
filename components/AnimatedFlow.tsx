import React, { useEffect, useState } from 'react';
import { Database, GitMerge, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

const AnimatedFlow: React.FC = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 6);
    }, 2000); // Change step every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const getOpacity = (triggerStep: number) => {
    return step >= triggerStep ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4';
  };

  const getLineClass = (triggerStep: number) => {
    return step >= triggerStep ? 'stroke-brand-500 stroke-[3px]' : 'stroke-slate-200 stroke-[1px]';
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-50/50 overflow-hidden">
      
      {/* 
         Container for fixed-coordinate flowchart. 
         Width 800px matches the content bounds (40px margin + 720px content + 40px margin).
         Height 400px.
         Scale logic makes it responsive.
      */}
      <div className="relative w-[800px] h-[400px] shrink-0 transform scale-[0.55] sm:scale-[0.7] md:scale-[0.85] lg:scale-100 origin-center transition-transform duration-500">
        
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0">
            <defs>
            <marker id="anim-head" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" className="fill-brand-500" />
            </marker>
            <marker id="anim-head-gray" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" className="fill-slate-200" />
            </marker>
            </defs>
            
            {/* Edge 1: Start -> Process (Straight) */}
            <path 
            d="M 160 150 L 230 150" 
            className={`transition-all duration-1000 ease-out ${getLineClass(1)}`}
            fill="none" 
            markerEnd={step >= 1 ? "url(#anim-head)" : "url(#anim-head-gray)"}
            />

            {/* Edge 2: Process -> Decision (Straight) */}
            <path 
            d="M 370 150 L 430 150" 
            className={`transition-all duration-1000 ease-out ${getLineClass(2)}`}
            fill="none" 
            markerEnd={step >= 2 ? "url(#anim-head)" : "url(#anim-head-gray)"}
            />

            {/* Edge 3: Decision -> Database (YES - Straight Down) */}
            <path 
            d="M 500 220 L 500 260" 
            className={`transition-all duration-1000 ease-out ${getLineClass(3)}`}
            fill="none" 
            markerEnd={step >= 3 ? "url(#anim-head)" : "url(#anim-head-gray)"}
            />

            {/* Edge 4: Decision -> End (NO - Straight Right) */}
            <path 
            d="M 570 150 L 640 150" 
            className={`transition-all duration-1000 ease-out ${getLineClass(3)}`}
            fill="none" 
            strokeDasharray="5,5"
            markerEnd={step >= 3 ? "url(#anim-head)" : "url(#anim-head-gray)"}
            />
        </svg>

        {/* Node 1: Start (Centered Y=150) */}
        <div className={`absolute top-[125px] left-[40px] w-[120px] h-[50px] bg-white rounded-full border-2 border-brand-500 flex items-center justify-center shadow-lg transition-all duration-700 ${getOpacity(0)} z-10`}>
          <span className="font-bold text-slate-800">Start</span>
        </div>

        {/* Node 2: Process (Centered Y=150) */}
        <div className={`absolute top-[110px] left-[230px] w-[140px] h-[80px] bg-white rounded-lg border-2 border-blue-500 flex items-center justify-center shadow-lg transition-all duration-700 delay-100 ${getOpacity(1)} z-10`}>
          <div className="flex flex-col items-center">
             <FileText size={16} className="text-blue-500 mb-1"/>
             <span className="font-semibold text-sm text-slate-700">Parse Data</span>
          </div>
        </div>

        {/* Node 3: Decision (Centered Y=150) */}
        <div className={`absolute top-[100px] left-[430px] w-[140px] h-[100px] flex items-center justify-center transition-all duration-700 delay-200 ${getOpacity(2)} z-10`}>
            {/* Diamond Shape CSS */}
            <div className="w-[100px] h-[100px] bg-yellow-50 border-2 border-yellow-500 transform rotate-45 shadow-lg absolute"></div>
            <div className="relative z-10 flex flex-col items-center">
                 <span className="font-bold text-xs text-yellow-800">Valid?</span>
            </div>
        </div>

        {/* Label YES (Vertical Path) */}
        <div className={`absolute top-[230px] left-[510px] bg-white px-1 text-[10px] font-bold text-green-600 transition-opacity duration-700 ${step >= 3 ? 'opacity-100' : 'opacity-0'} z-20`}>YES</div>
        
        {/* Label NO (Horizontal Path) */}
        <div className={`absolute top-[130px] left-[600px] bg-white px-1 text-[10px] font-bold text-red-600 transition-opacity duration-700 ${step >= 3 ? 'opacity-100' : 'opacity-0'} z-20`}>NO</div>


        {/* Node 4: Database (Below Decision, Y=300) */}
        <div className={`absolute top-[260px] left-[430px] w-[140px] h-[80px] flex items-center justify-center transition-all duration-700 delay-300 ${getOpacity(3)} z-10`}>
           <div className="absolute inset-0 bg-emerald-50 border-2 border-emerald-500 rounded-[20px] shadow-lg flex flex-col items-center justify-center">
               <div className="w-full h-4 border-b border-emerald-200 absolute top-2"></div>
               <Database size={20} className="text-emerald-600 mb-1 mt-2"/>
               <span className="font-semibold text-sm text-emerald-800">Save</span>
           </div>
        </div>

        {/* Node 5: End (Right of Decision, Y=150) */}
        <div className={`absolute top-[125px] left-[640px] w-[120px] h-[50px] bg-slate-100 rounded-full border-2 border-slate-400 flex items-center justify-center shadow-lg transition-all duration-700 delay-300 ${getOpacity(3)} z-10`}>
          <span className="font-bold text-slate-600">Stop</span>
        </div>
      </div>
    </div>
  );
};

export default AnimatedFlow;