import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn, Layout } from 'lucide-react';
import Button from './Button';
import Mascot from './Mascot';
import { APP_NAME, NAV_ITEMS } from '../constants';

interface HeaderProps {
  isLoggedIn?: boolean;
  onNavigateToApp: () => void;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn = false, onNavigateToApp, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer group select-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
              <Mascot pose="logo" size={48} animate={false} />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-amber-950">
              COOKETH <span className="text-brand-600">FLOW</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <a 
                key={item.label} 
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a href="https://github.com/cooketh-flow" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Star on GitHub
            </a>
            {isLoggedIn ? (
                <Button size="sm" onClick={onNavigateToApp} icon={Layout}>Open Workspace</Button>
            ) : (
                <Button size="sm" onClick={onNavigateToApp} icon={LogIn}>Sign In</Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-slate-600 hover:text-slate-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-100 shadow-lg p-4 flex flex-col gap-4">
          {NAV_ITEMS.map((item) => (
            <a 
              key={item.label} 
              href={item.href}
              className="text-base font-medium text-slate-600 hover:text-brand-600 py-2"
              onClick={(e) => handleNavClick(e, item.href)}
            >
              {item.label}
            </a>
          ))}
          <div className="h-px bg-slate-100 my-2"></div>
          {isLoggedIn ? (
             <Button fullWidth onClick={() => { setMobileMenuOpen(false); onNavigateToApp(); }}>Open Workspace</Button>
          ) : (
             <Button fullWidth onClick={() => { setMobileMenuOpen(false); onNavigateToApp(); }}>Sign In</Button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;