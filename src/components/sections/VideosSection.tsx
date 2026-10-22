import React from 'react';
import { Film, Play } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  embedUrl: string;
  description: string;
}

interface VideosSectionProps {
  content: {
    videos?: VideoItem[];
  };
  title?: string;
  subtitle?: string;
}

export const VideosSection: React.FC<VideosSectionProps> = ({ content, title, subtitle }) => {
  const videos = content.videos || [];

  return (
    <section id="videos" className="py-20 border-b border-slate-800/80 bg-[#090a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold block mb-2">
            Archivo Audiovisual
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight font-serif">
            {title || 'Vídeos & Sesiones en Vivo'}
          </h2>
          {subtitle && <p className="text-sm sm:text-base text-slate-400 mt-2">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="bg-[#13151f] border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="relative aspect-video w-full bg-slate-950">
                <iframe
                  src={vid.embedUrl}
                  title={vid.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-amber-400 font-mono mb-1.5">
                  <Film className="w-3.5 h-3.5" />
                  <span>Sesión Oficial</span>
                </div>
                <h3 className="text-base font-bold text-white font-serif mb-1">{vid.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{vid.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
