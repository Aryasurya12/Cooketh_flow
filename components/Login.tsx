import React, { useState, useEffect } from 'react';
import { Loader2, ArrowRight, User, Mail, Lock, AlertCircle, Utensils, Lightbulb, Sparkles, Star, ChefHat } from 'lucide-react';
import { supabase } from '../services/supabase';
import Button from './Button';
import Mascot from './Mascot';

interface LoginProps {
  onLoginSuccess: () => void;
  onGuestAccess: () => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onGuestAccess, onBack }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI Interaction State
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [isGuestHovered, setIsGuestHovered] = useState(false);
  
  // Animation Trigger State
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Trigger a brief animation lock when toggling mode
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 700);
    return () => clearTimeout(timer);
  }, [isSignUp]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
        onGuestAccess();
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        const { data: { session } } = await supabase.auth.getSession();
        if(session) onLoginSuccess();
        else setError("Account created! Please check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic Pose Logic
  const getMainMascotPose = () => {
    if (isLoading) return 'celebrate';
    if (focusedField === 'email') return 'thinking';
    if (focusedField === 'password') return 'guard';
    if (isSignUp) return 'point-right'; 
    return 'wave'; 
  };

  return (
    <div className="min-h-screen w-full flex bg-white selection:bg-brand-200 selection:text-brand-900 overflow-hidden font-sans relative">
      
      {/* =========================================================
          LEFT PANEL: IMMERSIVE BRAND EXPERIENCE (Base Layer)
          - Swaps to RIGHT side when isSignUp is true
          - overflow-hidden ensures internal SVGs don't bleed out
      ========================================================= */}
      <div className={`hidden lg:flex w-1/2 relative overflow-hidden flex-col items-center justify-center text-white transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform transform-gpu z-0 ${isSignUp ? 'lg:translate-x-full' : 'lg:translate-x-0'}`}
           style={{ background: isSignUp ? 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' : 'linear-gradient(135deg, #f97316 0%, #d97706 100%)' }}>
          
          {/* Animated Texture Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:32px_32px] opacity-40 animate-pulse"></div>
          
          {/* Floating Abstract Shapes */}
          <div className={`absolute top-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] transition-all duration-1000 ease-in-out ${isSignUp ? 'left-[20%]' : 'left-[-10%]'}`}></div>
          <div className={`absolute bottom-[-10%] w-[600px] h-[600px] bg-yellow-400/20 rounded-full blur-[120px] transition-all duration-1000 ease-in-out ${isSignUp ? 'right-[20%]' : 'right-[-10%]'}`}></div>
          
          {/* Floating UI Cards (Decoration) */}
          <div className={`absolute top-1/4 left-10 w-40 h-24 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center transition-all duration-1000 ${isSignUp ? 'translate-x-12 rotate-[-6deg]' : '-rotate-12'}`}>
               <div className="flex gap-2 items-center">
                   <div className="w-8 h-8 rounded-full bg-white/20"></div>
                   <div className="space-y-2">
                       <div className="w-16 h-2 bg-white/30 rounded"></div>
                       <div className="w-10 h-2 bg-white/20 rounded"></div>
                   </div>
               </div>
          </div>
          <div className={`absolute bottom-1/3 right-12 w-48 h-32 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center transition-all duration-1000 ${isSignUp ? '-translate-x-12 rotate-12' : 'rotate-6'}`}>
                <div className="text-center">
                    <div className="w-10 h-10 mx-auto bg-amber-300/40 rounded-full flex items-center justify-center mb-2">
                         <ChefHat size={20} className="text-white"/>
                    </div>
                    <div className="w-20 h-2 bg-white/40 rounded mx-auto"></div>
                </div>
          </div>

          {/* Large Hero Mascot - Slides slightly */}
          <div className={`relative z-10 transition-transform duration-700 ${isSignUp ? 'translate-x-8 scale-105' : 'translate-x-0 scale-100'}`}>
               <Mascot pose={isSignUp ? 'artist' : 'chef'} size={320} animate={true} />
               <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-8 bg-black/20 blur-xl rounded-full"></div>
          </div>
          
          {/* Brand Tagline */}
          <div className="relative z-10 mt-8 text-center px-8">
              <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-sm mb-2">COOKETH FLOW</h1>
              <p className="text-amber-100 text-lg font-medium opacity-90 max-w-md mx-auto">
                  {isSignUp ? "Join the creative revolution." : "Think it. Map it. Ship it."}
              </p>
          </div>
      </div>

      {/* =========================================================
          RIGHT PANEL: INTERACTION & FORM (Overlay Layer)
          - Swaps to LEFT side when isSignUp is true
          - Z-index=10 ensures it slides over the background panel
          - overflow-hidden contains mascots strictly inside this panel
      ========================================================= */}
      <div className={`w-full lg:w-1/2 relative bg-slate-50 flex flex-col z-10 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform transform-gpu shadow-2xl overflow-hidden ${isSignUp ? 'lg:-translate-x-full' : 'lg:translate-x-0'}`}>
          
          {/* Top Bar / Navigation */}
          <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-30">
             <button onClick={onBack} className="text-slate-500 hover:text-brand-600 text-sm font-bold flex items-center gap-2 group bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-slate-200 hover:border-brand-200 transition-all shadow-sm">
                <ArrowRight className="rotate-180 text-slate-400 group-hover:text-brand-600 transition-colors" size={16} />
                <span className="group-hover:translate-x-1 transition-transform">Back to Home</span>
             </button>
             {/* Mobile Brand Hint */}
             <div className="lg:hidden font-bold text-slate-400 text-xs tracking-widest uppercase">Cooketh Flow</div>
          </div>

          {/* 
             PARALLAX MASCOTS (Background Decoration)
             - FIXED: z-0 ensures they stay BEHIND the form card (z-20)
             - pointer-events-none ensures they don't block interaction
             - CONDITIONAL: Removed on Sign Up page as requested (balloon & sleep)
          */}
          {!isSignUp && (
            <>
                <div className="absolute top-6 right-6 z-0 hidden sm:block pointer-events-none">
                    <Mascot pose="balloon" size={100} animate />
                </div>
                <div className="absolute bottom-6 left-6 z-0 opacity-80 hidden sm:block pointer-events-none">
                    <Mascot pose="sleep" size={80} />
                </div>
            </>
          )}
          
          <div className={`absolute top-20 right-12 z-0 transition-opacity duration-500 hidden sm:block pointer-events-none ${isSignUp ? 'opacity-100' : 'opacity-0'}`}>
              <Mascot pose="love" size={110} animate />
          </div>
           <div className={`absolute bottom-0 right-8 z-0 transition-opacity duration-500 hidden sm:block pointer-events-none ${isSignUp ? 'opacity-100' : 'opacity-0'}`}>
              <Mascot pose="peek" size={130} />
          </div>


          {/* Center Form Area */}
          <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-20">
              
              <div className="w-full max-w-md relative z-20">
                 
                 {/* Dynamic Mascot Above Form */}
                 <div className="flex justify-center mb-[-10px] relative z-20 pointer-events-none">
                     <div className={`transform transition-all duration-500 ${animating ? 'scale-90 opacity-80' : 'scale-100 opacity-100'} hover:translate-y-2`}>
                        <Mascot pose={getMainMascotPose() as any} size={140} animate={true} />
                     </div>
                 </div>

                 {/* Login Card */}
                 <div className="bg-white rounded-[2rem] shadow-2xl shadow-brand-900/10 border border-slate-100 overflow-visible relative z-10">
                    <div className="p-8 pb-4 text-center">
                        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                            {isSignUp ? "Join the Kitchen" : "Welcome Back"}
                        </h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">
                            {isSignUp ? "Start cooking up your brilliant ideas." : "Your workspace is ready."}
                        </p>
                    </div>

                    <div className="p-8 pt-2">
                        <form onSubmit={handleAuth} className="space-y-5">
                            {error && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-2 animate-shake">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <span className="font-medium">{error}</span>
                            </div>
                            )}

                            {/* Email */}
                            <div className="space-y-1 group">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-brand-500 transition-colors">Email</label>
                                <div className="relative transition-all duration-300 group-focus-within:scale-[1.01]">
                                    <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'email' ? 'text-brand-500' : 'text-slate-300'}`}>
                                        <Mail size={18} />
                                    </div>
                                    <input 
                                    type="email" 
                                    value={email}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-0 focus:border-brand-400 outline-none transition-all text-slate-900 placeholder:text-slate-300 font-medium text-sm shadow-sm"
                                    placeholder="chef@cooketh.com"
                                    required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1 group">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-brand-500 transition-colors">Password</label>
                                <div className="relative transition-all duration-300 group-focus-within:scale-[1.01]">
                                    <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'password' ? 'text-brand-500' : 'text-slate-300'}`}>
                                        <Lock size={18} />
                                    </div>
                                    <input 
                                    type="password" 
                                    value={password}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-0 focus:border-brand-400 outline-none transition-all text-slate-900 placeholder:text-slate-300 font-medium text-sm shadow-sm"
                                    placeholder="••••••••"
                                    required
                                    />
                                </div>
                            </div>

                            <Button 
                            fullWidth 
                            size="lg" 
                            type="submit" 
                            disabled={isLoading}
                            className={`mt-2 shadow-lg shadow-brand-200 rounded-xl py-3.5 text-base font-bold transform hover:scale-[1.02] active:scale-95 transition-all ${isSignUp ? 'bg-gradient-to-r from-brand-600 to-red-500' : ''}`}
                            >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={18} /> Processing...
                                </div>
                            ) : (isSignUp ? "Create Account" : "Sign In")}
                            </Button>
                        </form>

                        <div className="mt-6 mb-4 relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                            <div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-slate-400 font-medium">or continue as</span></div>
                        </div>

                        <button 
                            type="button"
                            onClick={onGuestAccess}
                            onMouseEnter={() => setIsGuestHovered(true)}
                            onMouseLeave={() => setIsGuestHovered(false)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl text-slate-600 text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all group shadow-sm"
                        >
                            <User size={16} className={`transition-colors ${isGuestHovered ? 'text-brand-500' : 'text-slate-400'}`}/>
                            Guest User
                        </button>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs rounded-b-[2rem]">
                        <span className="text-slate-500 font-medium">
                            {isSignUp ? "Already a chef?" : "New here?"}
                        </span>
                        <button 
                            type="button"
                            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                            className="ml-2 font-bold text-brand-600 hover:text-brand-700 hover:underline transition-all"
                        >
                            {isSignUp ? "Log In" : "Sign Up"}
                        </button>
                    </div>
                 </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Login;