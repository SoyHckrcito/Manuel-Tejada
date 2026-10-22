import React from 'react';
import { Award, ChevronRight, Play } from 'lucide-react';

interface HeroSectionProps {
  content: {
    kicker?: string;
    leadText?: string;
    primaryCtaText?: string;
    primaryCtaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    heroImage?: string;
    awardsSummary?: string;
    stats?: { value: string; label: string }[];
  };
  title?: string;
  subtitle?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ content, title, subtitle }) => {
  const heroImg = content.heroImage || '/src/assets/images/hero_manuel_tejada_1792681355172.jpg';

  return (
    <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Split Screen Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-stretch">
          {/* Left Column: Typographic Hierarchy */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {content.kicker && (
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-500 font-semibold mb-3">
                <span>{content.kicker}</span>
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] font-serif text-balance">
              {title || 'Maestro Manuel Tejada'}
            </h1>

            {subtitle && (
              <p className="text-lg sm:text-xl font-medium text-amber-200/90 mt-3 font-serif">
                {subtitle}
              </p>
            )}

            <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed max-w-2xl">
              {content.leadText ||
                'Pionero de la orquestación contemporánea caribeña y creador de arreglos inmortales que definieron el sonido de la música latina ante el mundo.'}
            </p>

            {content.awardsSummary && (
              <div className="mt-5 flex items-center gap-2 text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg max-w-xl">
                <Award className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{content.awardsSummary}</span>
              </div>
            )}

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={content.primaryCtaLink || '#discografia'}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors inline-flex items-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                <span>{content.primaryCtaText || 'Explorar Obra y Discografía'}</span>
                <ChevronRight className="w-4 h-4" />
              </a>

              <a
                href={content.secondaryCtaLink || '#contacto'}
                className="px-6 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-medium text-xs uppercase tracking-wider rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{content.secondaryCtaText || 'Contacto Artístico'}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Visual Container (High-Fidelity Editorial Portrait) */}
          <div className="lg:col-span-5 flex items-center">
            <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:h-[480px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group bg-slate-900">
              <img
                src={heroImg}
                alt="Maestro Manuel Tejada en el piano y consola de grabación"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 filter grayscale contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4 text-left">
                <p className="text-xs font-semibold text-white uppercase tracking-wider font-serif">Manuel Tejada</p>
                <p className="text-[11px] text-slate-400">Piano de cola y consola analógica · Sesión de estudio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width 4-Column KPI strip below split */}
        {content.stats && content.stats.length > 0 && (
          <div className="mt-16 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6">
            {content.stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
                  {stat.value}
                </span>
                <span className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
