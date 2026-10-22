import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../lib/api.ts';
import { Announcement } from '../../types.ts';
import { ImageUploadDropzone } from '../common/ImageUploadDropzone.tsx';
import {
  Bell,
  Pin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Maximize2,
  Calendar,
  User,
  Shield,
  Sparkles,
} from 'lucide-react';

interface AnnouncementsSectionProps {
  title?: string;
  subtitle?: string;
}

export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({
  title = 'Anuncios & Comunicados Oficiales',
  subtitle = 'Novedades, estrenos discográficos, masterclasses y noticias artísticas',
}) => {
  const { user, isOwner, isAdmin, isModerator } = useAuth();
  const canPublishAnnouncement = isOwner || isAdmin || isModerator;

  const [announcementsList, setAnnouncementsList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal create/edit state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formPinned, setFormPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  // Lightbox for announcement images
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.announcements.getAll();
      setAnnouncementsList(res.announcements || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormTitle('');
    setFormContent('');
    setFormImage('');
    setFormPinned(false);
    setFeedback(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: Announcement) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormContent(item.content);
    setFormImage(item.imageUrl || '');
    setFormPinned(item.isPinned);
    setFeedback(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      setFeedback({ type: 'error', message: 'Por favor ingresa título y contenido.' });
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const res = await api.announcements.update(editingId, {
          title: formTitle,
          content: formContent,
          imageUrl: formImage || undefined,
          isPinned: formPinned,
        });
        setFeedback({ type: 'success', message: res.message });
      } else {
        const res = await api.announcements.create({
          title: formTitle,
          content: formContent,
          imageUrl: formImage || undefined,
          isPinned: formPinned,
        });
        setFeedback({ type: 'success', message: res.message });
      }
      setModalOpen(false);
      await fetchAnnouncements();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al guardar el comunicado.' });
    } finally {
      setSaving(false);
    }
  };

  const executeDelete = async (id: number) => {
    try {
      const res = await api.announcements.delete(id);
      setFeedback({ type: 'success', message: res.message });
      setConfirmDeleteId(null);
      await fetchAnnouncements();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al eliminar comunicado.' });
    }
  };

  const handleTogglePin = async (item: Announcement) => {
    try {
      await api.announcements.update(item.id, { isPinned: !item.isPinned });
      await fetchAnnouncements();
    } catch (err: any) {
      console.error('Error toggling pin:', err);
    }
  };

  return (
    <section id="anuncios" className="py-20 border-b border-slate-800/80 bg-[#090a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold block mb-2 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              <span>Tablón de Noticias</span>
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight font-serif">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2">{subtitle}</p>
          </div>

          {canPublishAnnouncement && (
            <button
              onClick={handleOpenCreate}
              className="self-start sm:self-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Anuncio ({user?.role})</span>
            </button>
          )}
        </div>

        {feedback && (
          <div
            className={`mb-6 p-4 rounded-xl text-xs flex items-center justify-between gap-3 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-200'
                : 'bg-red-950/60 border border-red-800 text-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Announcements List */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">Cargando comunicados oficiales...</div>
        ) : announcementsList.length === 0 ? (
          <div className="py-16 text-center bg-[#13151f] border border-slate-800 rounded-2xl p-8">
            <Bell className="w-10 h-10 text-amber-500/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white font-serif mb-1">
              Aún no hay anuncios publicados
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {canPublishAnnouncement
                ? 'Como miembro del equipo con permisos, puedes publicar el primer comunicado oficial con imagen opcional pulsando el botón superior.'
                : 'Próximamente se publicarán aquí las fechas de conciertos, conferencias y lanzamientos del maestro Manuel Tejada.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {announcementsList.map((ann) => (
              <article
                key={ann.id}
                className={`relative rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  ann.isPinned
                    ? 'bg-[#151824] border-amber-500/40 shadow-xl shadow-amber-500/5'
                    : 'bg-[#13151f] border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Optional Image */}
                {ann.imageUrl && (
                  <div
                    className="relative aspect-video w-full bg-slate-900 cursor-pointer overflow-hidden group"
                    onClick={() => setLightboxImage(ann.imageUrl || null)}
                  >
                    <img
                      src={ann.imageUrl}
                      alt={ann.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col">
                  {/* Top metadata */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {ann.isPinned && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded">
                          <Pin className="w-3 h-3 fill-current" />
                          <span>Destacado</span>
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>

                    {/* Author badge */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                      <span className="font-semibold">{ann.authorName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 border border-amber-500/20 font-bold">
                        {ann.authorRole}
                      </span>
                    </div>
                  </div>

                  {/* Title & Content */}
                  <h3 className="text-lg font-bold text-white font-serif mb-2.5 leading-snug">
                    {ann.title}
                  </h3>
                  <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2 whitespace-pre-wrap flex-1">
                    {ann.content}
                  </div>

                  {/* Admin / Moderator actions on card */}
                  {canPublishAnnouncement && (
                    <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleTogglePin(ann)}
                        className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Pin className="w-3.5 h-3.5" />
                        <span>{ann.isPinned ? 'Desfijar' : 'Fijar arriba'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(ann)}
                          className="px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(ann.id)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                          title="Eliminar comunicado"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#13151f] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold">
                Gestión de Noticias
              </span>
              <h3 className="text-xl font-bold text-white mt-1 font-serif">
                {editingId ? 'Editar Anuncio' : 'Publicar Nuevo Anuncio Oficial'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Autorizado para roles OWNER, ADMIN y MODERATOR.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Título del comunicado
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ej. Estreno mundial de la Suite Dominicana en Santo Domingo"
                  className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Contenido del mensaje
                </label>
                <textarea
                  rows={5}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Escribe el texto del anuncio, fechas, sedes, enlaces o detalles del evento..."
                  className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                />
              </div>

              {/* Drag and Drop Image Dropzone */}
              <div>
                <ImageUploadDropzone
                  value={formImage}
                  onChange={(url) => setFormImage(url)}
                  label="Imagen del Anuncio (Opcional - Arrastra desde tu PC o selecciona)"
                  aspectHint="Foto de cartel, sesión de ensayo o portada (se optimiza automáticamente)."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={formPinned}
                  onChange={(e) => setFormPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-[#0a0b0e] border-slate-700 focus:ring-amber-500"
                />
                <label htmlFor="pinCheck" className="text-xs text-slate-300 cursor-pointer">
                  Fijar como anuncio destacado en la parte superior
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : editingId ? 'Actualizar Anuncio' : 'Publicar Anuncio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-lg bg-slate-900 border border-slate-800"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Detalle"
            className="max-h-[85vh] max-w-full rounded-xl border border-slate-800 shadow-2xl object-contain"
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-[#13151f] border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100">
            <h4 className="text-base font-bold text-white mb-2">Eliminar Comunicado</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              ¿Estás seguro de que deseas eliminar este comunicado oficial? Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => executeDelete(confirmDeleteId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
