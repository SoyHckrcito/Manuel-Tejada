import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.ts';
import { ContactMessage } from '../../types.ts';
import { MessageSquare, RefreshCw, Eye, EyeOff, CheckCircle } from 'lucide-react';

export const ModerationPanel: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.contact.getMessages();
      setMessages(res.messages || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleHide = async (msg: ContactMessage) => {
    try {
      await api.contact.updateStatus(msg.id, { isHidden: !msg.isHidden });
      await fetchMessages();
    } catch (err) {
      console.error('Error toggling hide:', err);
    }
  };

  const handleToggleReview = async (msg: ContactMessage) => {
    try {
      await api.contact.updateStatus(msg.id, { isReviewed: !msg.isReviewed });
      await fetchMessages();
    } catch (err) {
      console.error('Error toggling review:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-500" />
            <span>Mensajes de Contacto & Moderación</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Consultas recibidas desde el formulario web. Moderadores y administradores pueden gestionar su estado.
          </p>
        </div>

        <button
          onClick={fetchMessages}
          disabled={loading}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/60 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No se han recibido consultas o mensajes aún.
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 rounded-xl border transition-colors ${
                msg.isHidden
                  ? 'bg-slate-900/30 border-red-900/40 opacity-75'
                  : 'bg-[#0f1118] border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{msg.name}</span>
                    <span className="text-xs font-normal text-slate-400 font-mono">({msg.email})</span>
                  </h4>
                  <p className="text-xs text-amber-400 font-medium">{msg.subject}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleToggleReview(msg)}
                    className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                      msg.isReviewed
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>{msg.isReviewed ? 'Revisado' : 'Marcar revisado'}</span>
                  </button>
                  <button
                    onClick={() => handleToggleHide(msg)}
                    className={`p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer ${
                      msg.isHidden ? 'text-red-400' : ''
                    }`}
                    title={msg.isHidden ? 'Desocultar' : 'Ocultar / Moderar'}
                  >
                    {msg.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {msg.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
