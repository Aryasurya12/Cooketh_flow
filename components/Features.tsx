import React from 'react';
import { FEATURES } from '../constants';
import Reveal from './Reveal';

const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Reveal>
            <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-3">Features</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to visualize ideas
            </h3>
            <p className="text-lg text-slate-600">
              Powerful tools that help your team think clearer, work faster, and build better together.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {FEATURES.map((feature, index) => (
            <Reveal key={index} delay={index * 100}>
              <div className="group p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-100 hover:bg-brand-50/30 transition-all duration-300 hover:shadow-xl hover:shadow-brand-100/50">
                <div className="h-12 w-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-brand-600 mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <feature.icon size={24} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;