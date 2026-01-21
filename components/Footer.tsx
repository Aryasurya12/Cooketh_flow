import React from 'react';
import { ChefHat } from 'lucide-react';
import { SOCIAL_LINKS, APP_NAME } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-brand-600 p-1.5 rounded-lg text-white">
                <ChefHat size={20} strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold text-slate-900">{APP_NAME}</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Think it. Map it. Cook it. <br/>
              The open-source visual thinking tool for modern teams.
            </p>
            <div className="flex space-x-4">
              {SOCIAL_LINKS.map((link) => (
                <a 
                  key={link.platform} 
                  href={link.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-brand-600 transition-colors"
                  aria-label={link.platform}
                >
                  <link.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#features" className="hover:text-brand-600">Features</a></li>
              <li><a href="#use-cases" className="hover:text-brand-600">Use Cases</a></li>
              <li><a href="#" className="hover:text-brand-600">Roadmap</a></li>
              <li><a href="#" className="hover:text-brand-600">Download</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-brand-600">GitHub Discussions</a></li>
              <li><a href="#" className="hover:text-brand-600">Discord Server</a></li>
              <li><a href="#" className="hover:text-brand-600">Contributing</a></li>
              <li><a href="#" className="hover:text-brand-600">Code of Conduct</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-brand-600">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-600">Terms of Service</a></li>
              <li><a href="#" className="hover:text-brand-600">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} {APP_NAME}. Open Source MIT License.
          </p>
          <div className="text-slate-400 text-sm flex items-center gap-2">
            <span>Made with</span>
            <span className="text-red-500 text-xs">❤</span>
            <span>by the community</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;