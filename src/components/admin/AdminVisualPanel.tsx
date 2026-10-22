import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api, tokenStorage } from '../../lib/api.ts';
import { SiteContentData, SiteSection } from '../../types.ts';
import { UsersActivityPanel } from './UsersActivityPanel.tsx';
import { ModerationPanel } from './ModerationPanel.tsx';
import { AuditLogsPanel } from './AuditLogsPanel.tsx';
import { SectionEditorDrawer } from './SectionEditorDrawer.tsx';
import { AnnouncementsSection } from '../sections/AnnouncementsSection.tsx';
import {
  Sliders,
  Users,
  MessageSquare,
  ShieldAlert,
  Save,
  Send,
  Undo2,
  RotateCcw,
  Plus,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  Palette,
  X,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Bell,
  LogIn,
} from 'lucide-react';

interface AdminVisualPanelProps {
  content: SiteContentData;
  onContentChange: (newContent: SiteContentData) => void;
  onClose: () => void;
}

export const AdminVisualPanel: React.FC<AdminVisualPanelProps> = ({
  content,
  onContentChange,
  onClose,
}) => {
  const { user, isOwner, isAdmin, isModerator, openLogin } = useAuth();

  const [activeTab, setActiveTab] = useState<'editor' | 'announcements' | 'users' | 'moderation' | 'audit'>('editor');
  const [editingSection, setEditingSection] = useState<SiteSection | null>(null);
  const [history, setHistory] = useState<SiteContentData[]>([]);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Theme styling sub-tab
  const [themeModalOpen, setThemeModalOpen] = useState(false);

  // Confirmation modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionText: string;
    isDestructive?: boolean;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionText: '',
    onConfirm: async () => {},
  });

  const pushHistory = (newContent: SiteContentData) => {
    setHistory((prev) => [...prev.slice(-10), JSON.parse(JSON.stringify(content))]);
    onContentChange(newContent);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    onContentChange(previous);
    setFeedback({ type: 'success', message: 'Último cambio deshecho.' });
  };

  // Section operations
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...content.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Recalculate order numbers
    newSections.forEach((s, idx) => {
      s.order = idx + 1;
    });

    pushHistory({ ...content, sections: newSections });
  };

  const toggleSectionVisibility = (index: number) => {
    const newSections = [...content.sections];
    newSections[index].visible = !newSections[index].visible;
    pushHistory({ ...content, sections: newSections });
  };

  const handleDeleteSection = (index: number) => {
    const sectionToDelete = content.sections[index];
    setConfirmModal({
      isOpen: true,
      title: `Eliminar sección «${sectionToDelete.title}»`,
      description: '¿Estás seguro de que deseas eliminar esta sección del diseño? Esta acción retirará el componente de la web.',
      actionText: 'Eliminar Sección',
      isDestructive: true,
      onConfirm: async () => {
        const newSections = content.sections.filter((_, idx) => idx !== index);
        newSections.forEach((s, idx) => {
          s.order = idx + 1;
        });
        pushHistory({ ...content, sections: newSections });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setFeedback({ type: 'success', message: `Sección «${sectionToDelete.title}» eliminada.` });
      },
    });
  };

  const handleAddNewSection = () => {
    const newId = 'custom-' + Date.now();
    const newSection: SiteSection = {
      id: newId,
      type: 'custom',
      title: 'Nueva Sección Personalizada',
      subtitle: 'Descripción breve de la nueva sección',
      visible: true,
      order: content.sections.length + 1,
      content: {
        leadText: 'Espacio para comunicar reconocimientos especiales, conciertos o anuncios del maestro Manuel Tejada.',
        buttonText: 'Más información',
        buttonLink: '#',
      },
    };

    const newSections = [...content.sections, newSection];
    pushHistory({ ...content, sections: newSections });
    setEditingSection(newSection);
  };

  const handleSaveSectionEdits = (updated: SiteSection) => {
    const newSections = content.sections.map((s) => (s.id === updated.id ? updated : s));
    pushHistory({ ...content, sections: newSections });
    setFeedback({ type: 'success', message: `Cambios aplicados a «${updated.title}».` });
  };

  // Draft & Publish
  const handleSaveDraft = async () => {
    const token = tokenStorage.get();
    if (!user && !token) {
      setFeedback({
        type: 'error',
        message: 'No has iniciado sesión o tu sesión ha caducado. Por favor inicia sesión con tu cuenta de administrador.',
      });
      openLogin();
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const res = await api.content.saveDraft(content);
      setFeedback({ type: 'success', message: res.message || 'Borrador guardado en la base de datos.' });
    } catch (err: any) {
      if (err.message && (err.message.includes('inicia sesión') || err.message.includes('No autorizado') || err.message.includes('Acceso no autorizado'))) {
        openLogin();
      }
      setFeedback({ type: 'error', message: err.message || 'Error al guardar el borrador.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePublishLive = async () => {
    const token = tokenStorage.get();
    if (!user && !token) {
      setFeedback({
        type: 'error',
        message: 'No has iniciado sesión o tu sesión ha caducado. Por favor inicia sesión como OWNER o ADMIN para publicar en vivo.',
      });
      openLogin();
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const res = await api.content.publish(content);
      setFeedback({ type: 'success', message: res.message || '¡Cambios publicados en vivo exitosamente!' });
    } catch (err: any) {
      if (err.message && (err.message.includes('inicia sesión') || err.message.includes('No autorizado') || err.message.includes('Acceso no autorizado'))) {
        openLogin();
      }
      setFeedback({ type: 'error', message: err.message || 'Error al publicar los cambios.' });
    } finally {
      setSaving(false);
    }
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (!isOwner) {
      setFeedback({ type: 'error', message: 'Solo el OWNER puede restaurar los valores iniciales de fábrica.' });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Restaurar diseño y contenidos iniciales',
      description: '¿Deseas restaurar todo el diseño y textos de la web al preset original de Manuel Tejada? IMPORTANTE: Las cuentas de usuario, roles y registros NO serán borrados.',
      actionText: 'Restaurar Predeterminado',
      isDestructive: true,
      onConfirm: async () => {
        setSaving(true);
        try {
          const res = await api.content.resetDefault();
          onContentChange(res.content);
          setFeedback({ type: 'success', message: res.message });
        } catch (err: any) {
          setFeedback({ type: 'error', message: err.message || 'Error al restaurar contenido inicial.' });
        } finally {
          setSaving(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090a0f] text-slate-100 flex flex-col overflow-hidden animate-fade-in">
      {/* Top Admin Navigation Bar */}
      <div className="h-16 border-b border-slate-800 bg-[#13151f] px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h1 className="text-sm sm:text-base font-bold text-white font-serif tracking-wider uppercase">
              Panel de Administración Visual
            </h1>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Rol: {user?.role || 'ADMIN'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={handleUndo}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors cursor-pointer"
              title="Deshacer último cambio visual"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Deshacer</span>
            </button>
          )}

          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Guardar Borrador</span>
            <span className="sm:hidden">Borrador</span>
          </button>

          <button
            onClick={handlePublishLive}
            disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-md shadow-amber-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publicar en Vivo</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2 cursor-pointer"
            title="Volver a la vista pública de la web"
            aria-label="Cerrar panel de administración"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Top Session Warning Bar if not logged in */}
      {!user && !tokenStorage.get() && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 sm:px-6 py-2.5 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Sesión no detectada:</strong> Debes iniciar sesión con tu cuenta para guardar borradores o publicar cambios en vivo en la base de datos.
            </span>
          </div>
          <button
            onClick={openLogin}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Iniciar Sesión Ahora</span>
          </button>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="bg-[#0f1118] border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 overflow-x-auto shrink-0">
        <div className="flex items-center gap-2 py-2">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'editor'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Editor Visual de Secciones</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'announcements'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Anuncios & Comunicados</span>
          </button>

          {(isOwner || isAdmin) && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Usuarios y Actividad</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'moderation'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Mensajes & Moderación</span>
          </button>

          {(isOwner || isAdmin) && (
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Auditoría</span>
            </button>
          )}
        </div>

        {/* Global style & reset triggers */}
        <div className="flex items-center gap-2 py-2">
          {activeTab === 'editor' && (
            <>
              <button
                onClick={() => setThemeModalOpen(true)}
                className="px-2.5 py-1.5 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Estilo & Colores</span>
              </button>

              {isOwner && (
                <button
                  onClick={handleResetToDefault}
                  className="px-2.5 py-1.5 text-xs text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-800/40 rounded-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  title="Restaurar diseño inicial de Manuel Tejada"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Inicial</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`px-6 py-2.5 text-xs flex items-center justify-between gap-2 shrink-0 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 text-emerald-200 border-b border-emerald-800'
              : 'bg-red-950/80 text-red-200 border-b border-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Main Content Workspace */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* TAB 1: VISUAL SECTION EDITOR */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
              <div>
                <h2 className="text-lg font-bold text-white font-serif">
                  Estructura y Orden de la Web Oficial
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reordena secciones, edita textos, cambia imágenes y oculta o publica bloques con un solo clic.
                </p>
              </div>
              <button
                onClick={handleAddNewSection}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded-lg flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir Sección</span>
              </button>
            </div>

            {/* Sections List */}
            <div className="space-y-3">
              {content.sections.map((section, idx) => (
                <div
                  key={section.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    section.visible
                      ? 'bg-[#13151f] border-slate-800'
                      : 'bg-[#0f1118] border-slate-800/50 opacity-60'
                  }`}
                >
                  {/* Left: Reorder & Info */}
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveSection(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded bg-[#0a0b0e] text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Subir sección"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveSection(idx, 'down')}
                        disabled={idx === content.sections.length - 1}
                        className="p-1 rounded bg-[#0a0b0e] text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Bajar sección"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-amber-500/80 font-bold">
                          #{idx + 1}
                        </span>
                        <h3 className="text-sm font-bold text-white font-serif">{section.title}</h3>
                        <span className="text-[10px] font-mono text-slate-500 uppercase bg-slate-800/80 px-1.5 py-0.5 rounded">
                          {section.type}
                        </span>
                      </div>
                      {section.subtitle && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-md">
                          {section.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => toggleSectionVisibility(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                        section.visible
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                      title={section.visible ? 'Ocultar en la web pública' : 'Mostrar en la web pública'}
                    >
                      {section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{section.visible ? 'Visible' : 'Oculta'}</span>
                    </button>

                    <button
                      onClick={() => setEditingSection(section)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar Contenido</span>
                    </button>

                    <button
                      onClick={() => handleDeleteSection(idx)}
                      className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="Eliminar sección permanentemente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && <AnnouncementsSection />}

        {/* TAB 2: USERS & ACTIVITY */}
        {activeTab === 'users' && <UsersActivityPanel />}

        {/* TAB 3: MODERATION */}
        {activeTab === 'moderation' && <ModerationPanel />}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === 'audit' && <AuditLogsPanel />}
      </div>

      {/* SECTION EDIT DRAWER */}
      {editingSection && (
        <SectionEditorDrawer
          section={editingSection}
          onSave={handleSaveSectionEdits}
          onClose={() => setEditingSection(null)}
        />
      )}

      {/* THEME CUSTOMIZER MODAL */}
      {themeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#13151f] border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-500" />
              <span>Personalización Visual Global</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Ajusta la paleta cromática y estética del sitio sin tocar código.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Tema y Acento</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      pushHistory({
                        ...content,
                        theme: {
                          ...content.theme,
                          name: 'Oro Dominicano Clásico',
                          primaryAccent: '#f59e0b',
                          bgCanvas: '#090a0f',
                          cardBg: '#13151f',
                        },
                      });
                    }}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer ${
                      content.theme.primaryAccent === '#f59e0b'
                        ? 'border-amber-500 bg-amber-500/10 text-white'
                        : 'border-slate-800 bg-[#0a0b0e] text-slate-400'
                    }`}
                  >
                    <span className="block font-bold text-amber-400">Oro Clásico</span>
                    <span className="text-[10px] text-slate-500">Elegante y orquestal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      pushHistory({
                        ...content,
                        theme: {
                          ...content.theme,
                          name: 'Obsidiana Minimalista',
                          primaryAccent: '#3b82f6',
                          bgCanvas: '#050507',
                          cardBg: '#0e0f14',
                        },
                      });
                    }}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer ${
                      content.theme.primaryAccent === '#3b82f6'
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-slate-800 bg-[#0a0b0e] text-slate-400'
                    }`}
                  >
                    <span className="block font-bold text-blue-400">Cobalto Estudio</span>
                    <span className="text-[10px] text-slate-500">Moderno y sobrio</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Radio de Bordes</label>
                <select
                  value={content.theme.borderRadius}
                  onChange={(e) => {
                    pushHistory({
                      ...content,
                      theme: { ...content.theme, borderRadius: e.target.value },
                    });
                  }}
                  className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="rounded-none">Sin bordes redondeados (0px)</option>
                  <option value="rounded-lg">Borde moderado (8px)</option>
                  <option value="rounded-xl">Borde refinado (12px)</option>
                  <option value="rounded-2xl">Borde amplio (16px)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setThemeModalOpen(false)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg cursor-pointer"
              >
                Aceptar y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#13151f] border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-white mb-2">{confirmModal.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">{confirmModal.description}</p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={confirmModal.onConfirm}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
                  confirmModal.isDestructive
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {saving ? 'Procesando...' : confirmModal.actionText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
