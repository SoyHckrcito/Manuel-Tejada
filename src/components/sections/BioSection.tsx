import React from 'react';
import { Quote, CheckCircle2 } from 'lucide-react';

interface BioSectionProps {
  content: {
    paragraph1?: string;
    paragraph2?: string;
    quote?: string;
    author?: string;
    milestones?: string[];
  };
  title?: string;
  subtitle?: string;
}

export const BioSection: React.FC<BioSectionProps> = ({ content, title, subtitle }) => {
  return (
    <section id="biografia" className="py-20 border-b border-slate-800/80 bg-[#090a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold block mb-2">
            Biografía Oficial
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight font-serif">
            {title || 'Trayectoria & Legado'}
          </h2>
          {subtitle && <p className="text-sm sm:text-base text-slate-400 mt-2">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main prose */}
          <div className="lg:col-span-7 space-y-5 text-sm sm:text-base text-slate-300 leading-relaxed">
            <p>
              {content.paragraph1 ||
                'Nacido en Santo Domingo, Manuel Tejada inició su formación académica formal de piano y composición en el Conservatorio Nacional de Música. Su virtuosismo al teclado y su prodigiosa intuición orquestal le permitieron transformar las estructuras del merengue, el bolero, la balada pop y el jazz latino.'}
            </p>
            <p>
              {content.paragraph2 ||
                'Ha sido arquitecto sonoro de las producciones más influyentes de habla hispana, colaborando como arreglista, productor o director musical con leyendas como Juan Luis Guerra, 4.40, Wilfrido Vargas, Fernando Villalona, Olga Tañón, Celia Cruz, Ángela Carrasco y orquestas sinfónicas de América y Europa.'}
            </p>

            {/* Milestones list (unboxed clean text) */}
            {content.milestones && content.milestones.length > 0 && (
              <div className="pt-6 border-t border-slate-800/80 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Hitos Destacados
                </h3>
                <ul className="space-y-2.5">
                  {content.milestones.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Quote & Monograph Callout */}
          <div className="lg:col-span-5 bg-[#13151f] border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <Quote className="w-8 h-8 text-amber-500/40 mb-4" />
            <blockquote className="text-base sm:text-lg italic text-slate-100 font-serif leading-relaxed">
              {content.quote ||
                '«La música no es solo técnica armónica; es la verdad emocional que una orquesta entera es capaz de transmitir en un compás».'}
            </blockquote>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">
                  {content.author || 'Manuel Tejada'}
                </p>
                <p className="text-[11px] text-slate-400">Maestro, Compositor & Productor</p>
              </div>
              <span className="text-xs font-mono text-amber-400/80">Santo Domingo</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
