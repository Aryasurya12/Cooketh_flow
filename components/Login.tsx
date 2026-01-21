import React, { useState } from 'react';
import { ChefHat, Loader2, ArrowRight, User, Mail, Lock, AlertCircle, Github } from 'lucide-react';
import { supabase } from '../services/supabase';
import Button from './Button';
import { APP_NAME } from '../constants';

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
        // Fallback if supabase not configured
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
        // Auto login usually happens on signup in supabase unless email confirm is on
        // But let's check session or show message
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 animate-fade-in-up">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative">
        {/* Header */}
        <div className="p-8 text-center bg-white border-b border-slate-50">
           <div className="inline-flex items-center justify-center p-3 bg-brand-50 rounded-xl mb-4 text-brand-600 shadow-sm cursor-pointer" onClick={onBack}>
              <ChefHat size={32} strokeWidth={2.5} />
           </div>
           <h2 className="text-2xl font-bold text-slate-900 mb-2">
             {isSignUp ? "Create an account" : "Welcome back"}
           </h2>
           <p className="text-slate-500 text-sm">
             Turn your chaotic ideas into clear visual flows.
           </p>
        </div>

        {/* Form */}
        <div className="p-8 pt-6">
          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-2 animate-pulse">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-slate-900"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-slate-900"
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
              className="mt-6"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : (isSignUp ? "Sign Up" : "Sign In")}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <button 
                type="button"
                onClick={onGuestAccess}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-100 rounded-xl text-slate-600 font-medium hover:border-slate-300 hover:bg-slate-50 transition-all focus:ring-2 focus:ring-offset-1 focus:ring-slate-200"
              >
                <User size={18} />
                Continue as Guest
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-sm">
          <span className="text-slate-500">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
          </span>
          <button 
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            className="ml-2 font-semibold text-brand-600 hover:text-brand-700 hover:underline"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
      
      <button onClick={onBack} className="mt-8 text-slate-400 hover:text-slate-600 text-sm flex items-center gap-1 transition-colors">
         <ArrowRight className="rotate-180" size={14} /> Back to Home
      </button>
    </div>
  );
};

export default Login;