import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import UseCases from './components/UseCases';
import Community from './components/Community';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import MapApp from './components/MapApp';
import Login from './components/Login';
import { supabase } from './services/supabase';

export type AppView = 'landing' | 'login' | 'app';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [session, setSession] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // 1. Initial Session Check
    if (supabase) {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsLoadingAuth(false);
        });

        // 2. Listen for Auth Changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            // If we are on login page and get a session, move to app
            if (session && currentView === 'login') {
                setCurrentView('app');
            }
        });

        return () => subscription.unsubscribe();
    } else {
        setIsLoadingAuth(false);
    }
  }, [currentView]);

  const handleLogout = async () => {
      if (supabase) await supabase.auth.signOut();
      setSession(null);
      setCurrentView('landing');
  };

  const navigateToApp = (prompt: string = '') => {
    setInitialPrompt(prompt);
    
    // Auth Guard
    if (session) {
        setCurrentView('app');
    } else {
        setCurrentView('login');
    }
    window.scrollTo(0, 0);
  };

  const navigateToLanding = () => {
    setCurrentView('landing');
    window.scrollTo(0, 0);
  };

  if (isLoadingAuth) {
      return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div></div>;
  }

  // View: App Workspace
  if (currentView === 'app') {
    return (
      <MapApp 
        initialPrompt={initialPrompt} 
        onBack={navigateToLanding}
        onLogout={handleLogout}
        session={session}
      />
    );
  }

  // View: Login
  if (currentView === 'login') {
      return (
          <Login 
            onLoginSuccess={() => setCurrentView('app')}
            onGuestAccess={() => setCurrentView('app')}
            onBack={navigateToLanding}
          />
      );
  }

  // View: Landing
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header 
        isLoggedIn={!!session} 
        onNavigateToApp={() => navigateToApp('')} 
        onLogout={handleLogout}
      />
      <main className="flex-grow">
        <Hero onNavigateToApp={() => navigateToApp('')} />
        <Features />
        <UseCases onUseCaseSelect={(prompt) => navigateToApp(prompt)} />
        <Community />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default App;