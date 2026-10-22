import React, { useState } from 'react';
import { SiteSection } from '../../types.ts';
import { ImageUploadDropzone } from '../common/ImageUploadDropzone.tsx';
import { X, Check, Eye, EyeOff, Plus, Trash2, Image, Link, Music, Video, Sparkles } from 'lucide-react';

interface SectionEditorDrawerProps {
  section: SiteSection;
  onSave: (updatedSection: SiteSection) => void;
  onClose: () => void;
}

export const SectionEditorDrawer: React.FC<SectionEditorDrawerProps> = ({ section, onSave, onClose }) => {
  const [draftSection, setDraftSection] = useState<SiteSection>(JSON.parse(JSON.stringify(section)));

  const handleFieldChange = (field: string, val: any) => {
    setDraftSection((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleContentChange = (contentKey: string, val: any) => {
    setDraftSection((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [contentKey]: val,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(draftSection);
    onClose();
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-[#13151f] border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 animate-slide-left">
      {/* Drawer Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-800">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500 font-bold">
            Editor Visual de Sección
          </span>
          <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
            {draftSection.title || 'Sección'}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        {/* Core Properties */}
        <div className="space-y-3 bg-[#0a0b0e] p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300">Visibilidad en la Web</span>
            <button
              type="button"
              onClick={() => handleFieldChange('visible', !draftSection.visible)}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                draftSection.visible
                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {draftSection.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{draftSection.visible ? 'Visible' : 'Oculta'}</span>
            </button>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Título de la sección</label>
            <input
              type="text"
              value={draftSection.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="w-full bg-[#13151f] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Subtítulo o descripción corta</label>
            <input
              type="text"
              value={draftSection.subtitle || ''}
              onChange={(e) => handleFieldChange('subtitle', e.target.value)}
              className="w-full bg-[#13151f] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Dynamic type-specific fields */}
        {draftSection.type === 'hero' && (
          <div className="space-y-3 bg-[#0a0b0e] p-4 rounded-xl border border-slate-800/80">
            <h4 className="font-semibold text-amber-400 uppercase tracking-wider text-[11px]">
              Contenido del Encabezado Principal (Hero)
            </h4>

            <div>
              <label className="block text-slate-400 mb-1">Kicker / Texto superior</label>
              <input
                type="text"
                value={draftSection.content.kicker || ''}
                onChange={(e) => handleContentChange('kicker', e.target.value)}
                className="w-full bg-[#13151f] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Texto de presentación (Lead)</label>
              <textarea
                rows={3}
                value={draftSection.content.leadText || ''}
                onChange={(e) => handleContentChange('leadText', e.target.value)}
                className="w-full bg-[#13151f] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Botón Principal (Texto)</label>
                <input
                  type="text"
                  value={draftSection.content.primaryCtaText || ''}
                  onChange={(e) => handleContentChange('primaryCtaText', e.target.value)}
                  className="w-full bg-[#13151f] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Botón Principal (Enlace)</label>
                <input
                  type="text"
                  value={draftSection.content.primaryCtaLink || ''}
                  onChange={(e) => handleContentChange('primaryCtaLink', e.target.value)}
                  className="w-full bg-[#13151f] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Drag & Drop Hero Image */}
            <div>
              <ImageUploadDropzone
                value={draftSection.content.heroImage}
                onChange={(url) => handleContentChange('heroImage', url)}
                label="Foto de Portada del Hero (Arrastra desde tu PC o selecciona)"
                aspectHint="Retrato editorial del maestro (recomendado 16:9 o 4:3)"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Texto de Galardones</label>
              <input
                type="text"
                value={draftSection.content.awardsSummary || ''}
                onChange={(e) => handleContentChange('awardsSummary', e.target.value)}
                className="w-full bg-[#13151f] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {draftSection.type === 'bio' && (
          <div className="space-y-3 bg-[#0a0b0e] p-4 rounded-xl border border-slate-800/80">
            <h4 className="font-semibold text-amber-400 uppercase tracking-wider text-[11px]">
              Narrativa Biográfica
            </h4>

            <div>
              <label className="block text-slate-400 mb-1">Párrafo 1 (Formación y Comienzos)</label>
              <textarea
                rows={3}
                value={draftSection.content.paragraph1 || ''}
                onChange={(e) => handleContentChange('paragraph1', e.target.value)}
                className="w-full bg-[#13151f] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Párrafo 2 (Trayectoria y Colaboraciones)</label>
              <textarea
                rows={3}
                value={draftSection.content.paragraph2 || ''}
                onChange={(e) => handleContentChange('paragraph2', e.target.value)}
                className="w-full bg-[#13151f] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Cita Musical</label>
              <textarea
                rows={2}
                value={draftSection.content.quote || ''}
                onChange={(e) => handleContentChange('quote', e.target.value)}
                className="w-full bg-[#13151f] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>
        )}

        {draftSection.type === 'discography' && (
          <div className="space-y-3 bg-[#0a0b0e] p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-amber-400 uppercase tracking-wider text-[11px]">
                Álbumes y Obras Musicales
              </h4>
              <button
                type="button"
                onClick={() => {
                  const newAlbums = [
                    ...(draftSection.content.albums || []),
                    {
                      id: 'alb-' + Date.now(),
                      title: 'Nuevo Álbum',
                      artist: 'Manuel Tejada',
                      year: '2026',
                      role: 'Compositor & Productor',
                      cover: '',
                      tracks: [{ title: 'Pista 1', duration: '4:15' }],
                    },
                  ];
                  handleContentChange('albums', newAlbums);
                }}
                className="px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Añadir Álbum</span>
              </button>
            </div>

            <div className="space-y-4">
              {(draftSection.content.albums || []).map((album: any, aIdx: number) => (
                <div key={album.id || aIdx} className="p-3.5 bg-[#13151f] border border-slate-800 rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Álbum #{aIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newAlbums = [...draftSection.content.albums];
                        newAlbums.splice(aIdx, 1);
                        handleContentChange('albums', newAlbums);
                      }}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={album.title}
                    placeholder="Título del álbum"
                    onChange={(e) => {
                      const newAlbums = [...draftSection.content.albums];
                      newAlbums[aIdx].title = e.target.value;
                      handleContentChange('albums', newAlbums);
                    }}
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded px-2.5 py-1 text-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={album.role}
                      placeholder="Rol (ej. Compositor / Arreglista)"
                      onChange={(e) => {
                        const newAlbums = [...draftSection.content.albums];
                        newAlbums[aIdx].role = e.target.value;
                        handleContentChange('albums', newAlbums);
                      }}
                      className="w-full bg-[#0a0b0e] border border-slate-800 rounded px-2.5 py-1 text-white"
                    />
                    <input
                      type="text"
                      value={album.year}
                      placeholder="Año"
                      onChange={(e) => {
                        const newAlbums = [...draftSection.content.albums];
                        newAlbums[aIdx].year = e.target.value;
                        handleContentChange('albums', newAlbums);
                      }}
                      className="w-full bg-[#0a0b0e] border border-slate-800 rounded px-2.5 py-1 text-white"
                    />
                  </div>

                  {/* Album Cover Dropzone */}
                  <ImageUploadDropzone
                    value={album.cover}
                    onChange={(url) => {
                      const newAlbums = [...draftSection.content.albums];
                      newAlbums[aIdx].cover = url;
                      handleContentChange('albums', newAlbums);
                    }}
                    label="Portada del Álbum (Arrastra o selecciona de tu PC)"
                    aspectHint="Cuadrada 1:1"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {draftSection.type === 'studio' && (
          <div className="space-y-3 bg-[#0a0b0e] p-4 rounded-xl border border-slate-800/80">
            <h4 className="font-semibold text-amber-400 uppercase tracking-wider text-[11px]">
              Datos del Estudio de Grabación
            </h4>
            <div>
              <label className="block text-slate-400 mb-1">Filosofía de Grabación</label>
              <textarea
                rows={3}
                value={draftSection.content.lead || ''}
                onChange={(e) => handleContentChange('lead', e.target.value)}
                className="w-full bg-[#13151f] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
            {/* Studio Image Dropzone */}
            <div>
              <ImageUploadDropzone
                value={draftSection.content.image}
                onChange={(url) => handleContentChange('image', url)}
                label="Fotografía del Estudio / Consola (Arrastra desde tu PC o selecciona)"
                aspectHint="Relación de aspecto 4:3 o 16:9 recomendada"
              />
            </div>
          </div>
        )}

        {draftSection.type === 'works' && (
          <div className="space-y-3 bg-[#0a0b0e] p-4 rounded-xl border border-slate-800/80">
            <h4 className="font-semibold text-amber-400 uppercase tracking-wider text-[11px]">
              Obras Sinfónicas & Arreglos Mayores
            </h4>
            <ImageUploadDropzone
              value={draftSection.content.bannerImage}
              onChange={(url) => handleContentChange('bannerImage', url)}
              label="Banner de Dirección Orquestal (Arrastra desde tu PC)"
              aspectHint="Panorámica 16:9 o cinematográfica"
            />
          </div>
        )}

        {draftSection.type === 'gallery' && (
          <div className="space-y-3 bg-[#0a0b0e] p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-amber-400 uppercase tracking-wider text-[11px]">
                Imágenes de la Galería
              </h4>
              <button
                type="button"
                onClick={() => {
                  const newImages = [
                    ...(draftSection.content.images || []),
                    { src: '', caption: 'Nueva fotografía del maestro Manuel Tejada.' },
                  ];
                  handleContentChange('images', newImages);
                }}
                className="px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Añadir Foto</span>
              </button>
            </div>

            <div className="space-y-3">
              {(draftSection.content.images || []).map((imgItem: any, iIdx: number) => (
                <div key={iIdx} className="p-3 bg-[#13151f] border border-slate-800 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Foto #{iIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = [...draftSection.content.images];
                        newImages.splice(iIdx, 1);
                        handleContentChange('images', newImages);
                      }}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <ImageUploadDropzone
                    value={imgItem.src}
                    onChange={(url) => {
                      const newImages = [...draftSection.content.images];
                      newImages[iIdx].src = url;
                      handleContentChange('images', newImages);
                    }}
                    label="Subir foto desde tu PC o arrastrar"
                  />
                  <input
                    type="text"
                    value={imgItem.caption}
                    placeholder="Descripción o pie de foto..."
                    onChange={(e) => {
                      const newImages = [...draftSection.content.images];
                      newImages[iIdx].caption = e.target.value;
                      handleContentChange('images', newImages);
                    }}
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded px-2.5 py-1 text-xs text-white"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {draftSection.type === 'custom' && (
          <div className="space-y-3 bg-[#0a0b0e] p-4 rounded-xl border border-slate-800/80">
            <h4 className="font-semibold text-amber-400 uppercase tracking-wider text-[11px]">
              Sección Personalizada
            </h4>
            <div>
              <label className="block text-slate-400 mb-1">Texto Principal</label>
              <textarea
                rows={3}
                value={draftSection.content.leadText || ''}
                onChange={(e) => handleContentChange('leadText', e.target.value)}
                className="w-full bg-[#13151f] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Texto del botón"
                value={draftSection.content.buttonText || ''}
                onChange={(e) => handleContentChange('buttonText', e.target.value)}
                className="w-full bg-[#13151f] border border-slate-800 rounded px-2 py-1 text-white"
              />
              <input
                type="text"
                placeholder="Enlace (# o https://...)"
                value={draftSection.content.buttonLink || ''}
                onChange={(e) => handleContentChange('buttonLink', e.target.value)}
                className="w-full bg-[#13151f] border border-slate-800 rounded px-2 py-1 text-white"
              />
            </div>
          </div>
        )}

        {/* Drawer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-[#13151f] py-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Aplicar Cambios</span>
          </button>
        </div>
      </form>
    </div>
  );
};
