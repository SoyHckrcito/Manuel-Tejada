import React, { useState, useEffect } from 'react';
import { X, Maximize2, Camera } from 'lucide-react';

interface GalleryImage {
  src: string;
  caption: string;
}

interface GallerySectionProps {
  content: {
    images?: GalleryImage[];
  };
  title?: string;
  subtitle?: string;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ content, title, subtitle }) => {
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);
  const images = content.images || [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section className="py-20 border-b border-slate-800/80 bg-[#0b0c12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold block mb-2">
            Archivo Visual
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight font-serif">
            {title || 'Galería Histórica'}
          </h2>
          {subtitle && <p className="text-sm sm:text-base text-slate-400 mt-2">{subtitle}</p>}
        </div>

        {/* Bento / Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {images.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setActiveImage(item)}
              className="group relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer"
            >
              <img
                src={item.src}
                alt={item.caption}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-center">
                <Maximize2 className="w-5 h-5 text-white mb-2" />
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
                <p className="text-[11px] text-slate-200 line-clamp-2">{item.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in"
          onClick={() => setActiveImage(null)}
        >
          <button
            onClick={() => setActiveImage(null)}
            className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-lg bg-slate-900/80 border border-slate-800 transition-colors z-50 cursor-pointer"
            aria-label="Cerrar vista completa"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-5xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage.src}
              alt={activeImage.caption}
              referrerPolicy="no-referrer"
              className="max-h-[75vh] w-auto max-w-full rounded-xl border border-slate-800 shadow-2xl object-contain"
            />
            <p className="mt-4 text-xs sm:text-sm text-slate-300 text-center max-w-2xl px-4">
              {activeImage.caption}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
