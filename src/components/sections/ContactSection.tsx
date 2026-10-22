import React, { useState } from 'react';
import { api } from '../../lib/api.ts';
import { Mail, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface ContactSectionProps {
  content: {
    officeEmail?: string;
    location?: string;
    managementNote?: string;
  };
  title?: string;
  subtitle?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ content, title, subtitle }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await api.contact.send(formData);
      setSuccessMsg(res.message);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al enviar el mensaje.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contacto" className="py-20 border-b border-slate-800/80 bg-[#090a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold block mb-2">
            Gestión Artística & Proyectos
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight font-serif">
            {title || 'Contacto & Contrataciones'}
          </h2>
          {subtitle && <p className="text-sm sm:text-base text-slate-400 mt-2">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-6">
            <p className="text-sm text-slate-300 leading-relaxed">
              {content.managementNote ||
                'Para comisiones sinfónicas, arreglos orquestales, bandas sonoras de cine o dirección musical, complete el formulario oficial.'}
            </p>

            <div className="p-6 bg-[#13151f] border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-white">Oficina Artística</p>
                  <a
                    href={`mailto:${content.officeEmail || 'contacto@manueltejada.com'}`}
                    className="text-xs text-amber-400 hover:underline"
                  >
                    {content.officeEmail || 'contacto@manueltejada.com'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-white">Ubicación</p>
                  <p className="text-xs text-slate-400">
                    {content.location || 'Santo Domingo, República Dominicana / Proyectos Internacionales'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7 bg-[#13151f] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-950/50 border border-emerald-800/80 rounded-xl text-xs sm:text-sm text-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-950/50 border border-red-800/80 rounded-xl text-xs sm:text-sm text-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Nombre completo</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Roberto Sánchez"
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Correo electrónico</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Asunto / Tipo de Proyecto</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Ej. Comisión sinfónica, Producción discográfica, Arreglos orquestales"
                  className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Detalles del mensaje</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe la propuesta musical o proyecto artístico..."
                  className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Enviando mensaje...' : 'Enviar Consulta Oficial'}
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
