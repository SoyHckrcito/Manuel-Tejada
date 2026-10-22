import React from 'react';
import { Music2, Landmark } from 'lucide-react';

interface WorkItem {
  title: string;
  instrumentation: string;
  premiere: string;
  notes: string;
}

interface WorksSectionProps {
  content: {
    bannerImage?: string;
    items?: WorkItem[];
  };
  title?: string;
  subtitle?: string;
}

export const WorksSection: React.FC<WorksSectionProps> = ({ content, title, subtitle }) => {
  const items = content.items || [];
  const banner = content.bannerImage || '/src/assets/images/orchestral_session_conducting_1792681357271.jpg';

  return (
    <section id="obras" className="py-20 border-b border-slate-800/80 bg-[#090a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold block mb-2">
            Repertorio Académico & Orquestal
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight font-serif">
            {title || 'Obras Sinfónicas & Arreglos Mayores'}
          </h2>
          {subtitle && <p className="text-sm sm:text-base text-slate-400 mt-2">{subtitle}</p>}
        </div>

        {/* Banner with orchestra conducting */}
        <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden mb-12 border border-slate-800 shadow-xl">
          <img
            src={banner}
            alt="Dirección orquestal de obras de Manuel Tejada"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-widest text-amber-400 font-mono">Partituras & Ensambles</p>
              <h3 className="text-lg sm:text-2xl font-bold text-white font-serif">
                Sinfonismo Antillano Contemporáneo
              </h3>
            </div>
            <span className="text-xs text-slate-300 font-mono">Teatro Nacional / Auditorios Internacionales</span>
          </div>
        </div>

        {/* Works List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((work, idx) => (
            <div
              key={idx}
              className="bg-[#13151f] border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                  <Music2 className="w-4 h-4" />
                </div>
                <h4 className="text-base font-bold text-white font-serif mb-2">{work.title}</h4>
                <p className="text-xs text-slate-400 mb-3">{work.notes}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 font-mono">Orquestación:</span>
                  <span className="truncate">{work.instrumentation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Landmark className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-slate-400 truncate">{work.premiere}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
