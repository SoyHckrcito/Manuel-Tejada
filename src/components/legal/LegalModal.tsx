import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { X, ShieldCheck, Lock, EyeOff, FileText, CheckCircle } from 'lucide-react';

export const LegalModal: React.FC = () => {
  const { isLegalOpen, closeLegal } = useAuth();
  const [activeTab, setActiveTab] = useState<'privacy' | 'cookies' | 'terms'>('privacy');

  if (!isLegalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#13151f] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl text-slate-100 max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
              Transparencia, Privacidad y Términos
            </h2>
          </div>
          <button
            onClick={closeLegal}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md"
            aria-label="Cerrar modal legal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'privacy'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Política de Privacidad
          </button>
          <button
            onClick={() => setActiveTab('cookies')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'cookies'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cookies y Rastreo Anónimo
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'terms'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Condiciones de Uso
          </button>
        </div>

        {/* Modal content body */}
        <div className="overflow-y-auto py-5 pr-2 text-xs md:text-sm text-slate-300 leading-relaxed space-y-4">
          {activeTab === 'privacy' && (
            <>
              <h3 className="text-base font-semibold text-white">1. Tratamiento de Datos Personales</h3>
              <p>
                La web oficial de <strong>Manuel Tejada</strong> está diseñada bajo el principio de minimización de datos.
                Cualquier persona puede navegar y escuchar las obras sin registrarse ni proporcionar datos personales.
              </p>
              <h4 className="text-sm font-semibold text-white pt-2">2. Cuentas Registradas y Contraseñas</h4>
              <p>
                Si decides registrarte voluntariamente, recopilamos únicamente tu nombre de usuario y correo electrónico.
                Las contraseñas se almacenan mediante algoritmos criptográficos unidireccionales (hashing salted scrypt) y nunca en texto plano.
              </p>
              <h4 className="text-sm font-semibold text-white pt-2">3. Derechos de Acceso y Supresión</h4>
              <p>
                Conforme al RGPD y normativas internacionales de protección de datos, tienes derecho a consultar tus datos, modificar tu perfil
                o solicitar la eliminación total y definitiva de tu cuenta a través del propietario de la web.
              </p>
            </>
          )}

          {activeTab === 'cookies' && (
            <>
              <h3 className="text-base font-semibold text-white">1. Medición Técnica No Invasiva</h3>
              <p>
                Este sitio web <strong>no utiliza huellas digitales (fingerprinting) invasivas</strong> ni rastreadores publicitarios de terceros.
              </p>
              <h4 className="text-sm font-semibold text-white pt-2">2. Sesiones de Visitante Anónimo</h4>
              <p>
                Para los visitantes que navegan libremente sin cuenta, el sistema genera únicamente un identificador temporal aleatorio en memoria de sesión
                (sessionStorage) para computar visitas agregadas (página vista y duración aproximada). No se registra dirección IP, ubicación geográfica exacta
                ni datos personales.
              </p>
              <h4 className="text-sm font-semibold text-white pt-2">3. Retención de Registros</h4>
              <p>
                Los registros de actividad se consolidan de forma agregada para estadísticas y se descartan periódicamente para proteger la intimidad del usuario.
              </p>
            </>
          )}

          {activeTab === 'terms' && (
            <>
              <h3 className="text-base font-semibold text-white">1. Propiedad Intelectual</h3>
              <p>
                Todas las composiciones, arreglos musicales, grabaciones de audio, partituras, fotografías y textos presentes en este sitio son propiedad exclusiva del
                maestro Manuel Tejada o de sus respectivos titulares bajo licencia.
              </p>
              <h4 className="text-sm font-semibold text-white pt-2">2. Roles y Conducta</h4>
              <p>
                El uso de cuentas con roles administrativos (OWNER, ADMIN, MODERATOR) está sujeto al cumplimiento estricto de la ética profesional y la seguridad de la plataforma.
                Cualquier intento de alteración no autorizada de privilegios conllevará la suspensión inmediata de la cuenta.
              </p>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={closeLegal}
            className="px-5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            Entendido y Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
