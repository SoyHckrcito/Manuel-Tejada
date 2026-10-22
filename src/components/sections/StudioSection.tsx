import React from 'react';
import { Sliders, Radio, Music, Cpu } from 'lucide-react';

interface StudioSpec {
  title: string;
  desc: string;
}

interface StudioSectionProps {
  content: {
    lead?: string;
    image?: string;
    specs?: StudioSpec[];
  };
  title?: string;
  subtitle?: string;
}

export const StudioSection: React.FC<StudioSectionProps> = ({ content, title, subtitle }) => {
  const specs = content.specs || [];
  const img = content.image || '/src/assets/images/studio_recording_console_1792681357218.jpg';

  return (
    <section id="estudio" className="py-20 border-b border-slate-800/80 bg-[#0b0c12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold block mb-2">
            Entorno Acústico
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight font-serif">
            {title || 'El Estudio de Grabación'}
          </h2>
          {subtitle && <p className="text-sm sm:text-base text-slate-400 mt-2">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Studio photograph */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
              <img
                src={img}
                alt="Consola analógica de grabación y sala de mezclas"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-xs text-slate-300">
                <span className="font-semibold text-white font-mono uppercase">Control Room A</span> · Santo Domingo
              </div>
            </div>
          </div>

          {/* Philosophy and gear specs */}
          <div className="lg:col-span-5 space-y-6">
            <p className="text-sm text-slate-300 leading-relaxed">
              {content.lead ||
                'Un santuario de creación acústicamente calibrado donde convergen consolas analógicas legendarias, micrófonos de tubo vintage y procesamiento digital de ultra alta resolución.'}
            </p>

            <div className="space-y-4 pt-2">
              {specs.map((spec, sIdx) => (
                <div key={sIdx} className="p-3.5 bg-[#13151f] border border-slate-800 rounded-xl">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                    {spec.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-normal">{spec.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
