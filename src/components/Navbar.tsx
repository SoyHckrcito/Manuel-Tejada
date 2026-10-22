import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { User, Shield, Menu, X, Sliders, LogOut } from 'lucide-react';

interface NavbarProps {
  onOpenAdminPanel?: () => void;
  brandName?: string;
  links?: { id: string; label: string; href: string }[];
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAdminPanel,
  brandName = 'MANUEL TEJADA',
  links = [
    { id: 'nav-bio', label: 'Biografía', href: '#biografia' },
    { id: 'nav-discography', label: 'Discografía', href: '#discografia' },
    { id: 'nav-works', label: 'Obras Sinfónicas', href: '#obras' },
    { id: 'nav-studio', label: 'Estudio', href: '#estudio' },
    { id: 'nav-videos', label: 'Vídeos', href: '#videos' },
    { id: 'nav-contact', label: 'Contacto', href: '#contacto' },
  ],
}) => {
  const { user, role, canAccessAdmin, openLogin, openRegister, openProfile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090a0f]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-18">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <a
          href="#"
          className="text-lg md:text-xl font-bold tracking-wider text-white whitespace-nowrap shrink-0 hover:text-amber-400 transition-colors uppercase font-serif"
        >
          {brandName}
        </a>

        {/* Zone 2: Navigation Links (single-line, subtle hover underlines) */}
        <nav className="hidden lg:flex items-center gap-7 text-xs tracking-wider uppercase font-medium text-slate-300">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Primary Action / User Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {!user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={openLogin}
                className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Iniciar sesión
              </button>
              <button
                onClick={openRegister}
                className="text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
              >
                Crear cuenta
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#13151f] hover:bg-[#1a1e2b] border border-slate-800 text-xs text-slate-200 transition-colors cursor-pointer"
                aria-expanded={userDropdownOpen}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px]">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-medium max-w-[100px] truncate">{user.username}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {user.role}
                </span>
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-[#13151f] border border-slate-800 rounded-xl shadow-2xl py-1 text-xs text-slate-200 z-50 animate-fade-in"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800/80">
                    <p className="font-semibold text-white truncate">{user.username}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <p className="text-[10px] text-amber-400 font-mono mt-0.5">Rol: {user.role}</p>
                  </div>

                  {canAccessAdmin && (
                    <button
                      onClick={onOpenAdminPanel}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 text-amber-400 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Panel de Administración</span>
                    </button>
                  )}

                  <button
                    onClick={openProfile}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mi Perfil</span>
                  </button>

                  <div className="border-t border-slate-800/80 my-1"></div>

                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 hover:bg-red-950/40 text-red-400 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-slate-400 hover:text-white p-1.5 transition-colors cursor-pointer"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#090a0f] px-6 py-4 space-y-3 animate-fade-in">
          <nav className="flex flex-col space-y-2.5 text-sm uppercase tracking-wider text-slate-300">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-amber-400 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          {canAccessAdmin && (
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminPanel?.();
                }}
                className="w-full text-left py-2 text-xs font-semibold text-amber-400 flex items-center gap-2"
              >
                <Sliders className="w-4 h-4" />
                <span>Abrir Panel de Administración</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
