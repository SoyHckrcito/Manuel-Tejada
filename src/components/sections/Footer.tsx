import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Shield, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { openLegal, user, openLogin } = useAuth();

  return (
    <footer className="w-full bg-[#07080b] border-t border-slate-900 py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Brand & copyright */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <p className="font-serif font-bold tracking-widest text-white text-sm">MANUEL TEJADA</p>
          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} Todos los derechos reservados. Música, partituras y grabaciones protegidas.
          </p>
        </div>

        {/* Center: Legal & transparency links */}
        <div className="flex items-center gap-5 text-slate-400">
          <button
            onClick={openLegal}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Política de Privacidad
          </button>
          <span>·</span>
          <button
            onClick={openLegal}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Cookies y Rastreo Anónimo
          </button>
          <span>·</span>
          <button
            onClick={openLegal}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Condiciones de Uso
          </button>
        </div>

        {/* Right: Security & account status */}
        <div className="flex items-center gap-3">
          <button
            onClick={openLegal}
            className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200"
          >
            <Shield className="w-3.5 h-3.5 text-amber-500/80" />
            <span>Datos Seguros & RGPD</span>
          </button>
          {!user && (
            <button
              onClick={openLogin}
              className="text-[11px] text-slate-500 hover:text-slate-300 ml-2"
            >
              Acceso Gestión
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
