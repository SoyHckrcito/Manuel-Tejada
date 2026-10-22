import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { X, Lock, Mail, User, Shield, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

export const AuthModals: React.FC = () => {
  const {
    user,
    isLoginOpen,
    closeLogin,
    isRegisterOpen,
    closeRegister,
    isProfileOpen,
    closeProfile,
    isRecoveryOpen,
    closeRecovery,
    openLogin,
    openRegister,
    openRecovery,
    login,
    register,
    updateProfile,
    logout,
  } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPassConfirm, setRegPassConfirm] = useState('');
  const [regAvatar, setRegAvatar] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Recovery form state
  const [recEmail, setRecEmail] = useState('');
  const [recCode, setRecCode] = useState('');
  const [recNewPass, setRecNewPass] = useState('');
  const [recStep, setRecStep] = useState<1 | 2>(1);
  const [recLoading, setRecLoading] = useState(false);
  const [recMessage, setRecMessage] = useState<string | null>(null);
  const [recError, setRecError] = useState<string | null>(null);

  // Profile form state
  const [profUsername, setProfUsername] = useState(user?.username || '');
  const [profAvatar, setProfAvatar] = useState(user?.avatarUrl || '');
  const [profCurrentPass, setProfCurrentPass] = useState('');
  const [profNewPass, setProfNewPass] = useState('');
  const [profLoading, setProfLoading] = useState(false);
  const [profMsg, setProfMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reset errors when switching modals
  const handleSwitchToRegister = () => {
    closeLogin();
    setLoginError(null);
    openRegister();
  };

  const handleSwitchToLogin = () => {
    closeRegister();
    closeRecovery();
    setRegError(null);
    openLogin();
  };

  const handleSwitchToRecovery = () => {
    closeLogin();
    setLoginError(null);
    openRecovery();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      await login(loginEmail, loginPass);
      setLoginEmail('');
      setLoginPass('');
    } catch (err: any) {
      setLoginError(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (regPass !== regPassConfirm) {
      setRegError('Las contraseñas no coinciden.');
      return;
    }

    setRegLoading(true);
    try {
      const res = await register(regEmail, regUsername, regPass, regAvatar || undefined);
      setRegSuccess(res.message);
      setTimeout(() => {
        setRegEmail('');
        setRegUsername('');
        setRegPass('');
        setRegPassConfirm('');
        setRegAvatar('');
        setRegSuccess(null);
      }, 2500);
    } catch (err: any) {
      setRegError(err.message || 'Error al registrar la cuenta.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecError(null);
    setRecMessage(null);
    setRecLoading(true);

    try {
      if (recStep === 1) {
        const { api } = await import('../../lib/api.ts');
        const res = await api.auth.recoverPassword({ email: recEmail });
        setRecMessage(res.message);
        if (res.recoveryCode) {
          setRecCode(res.recoveryCode);
        }
        setRecStep(2);
      } else {
        const { api } = await import('../../lib/api.ts');
        const res = await api.auth.recoverPassword({
          email: recEmail,
          recoveryCode: recCode,
          newPassword: recNewPass,
        });
        setRecMessage(res.message);
        setTimeout(() => {
          handleSwitchToLogin();
        }, 2000);
      }
    } catch (err: any) {
      setRecError(err.message || 'Error en la recuperación de contraseña.');
    } finally {
      setRecLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfMsg(null);
    setProfLoading(true);
    try {
      await updateProfile({
        username: profUsername,
        avatarUrl: profAvatar,
        currentPassword: profCurrentPass || undefined,
        newPassword: profNewPass || undefined,
      });
      setProfMsg({ type: 'success', text: 'Perfil actualizado correctamente.' });
      setProfCurrentPass('');
      setProfNewPass('');
    } catch (err: any) {
      setProfMsg({ type: 'error', text: err.message || 'Error al actualizar el perfil.' });
    } finally {
      setProfLoading(false);
    }
  };

  return (
    <>
      {/* 1. LOGIN MODAL */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#13151f] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl text-slate-100">
            <button
              onClick={closeLogin}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Web Oficial</span>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">Iniciar Sesión</h2>
              <p className="text-xs text-slate-400 mt-1">
                Accede a tu cuenta de Manuel Tejada para gestionar permisos y contenidos.
              </p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-red-950/50 border border-red-800/80 rounded-lg text-xs text-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Contraseña</label>
                  <button
                    type="button"
                    onClick={handleSwitchToRecovery}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loginLoading ? 'Iniciando sesión...' : 'Entrar'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400">
                ¿No tienes una cuenta aún?{' '}
                <button
                  type="button"
                  onClick={handleSwitchToRegister}
                  className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  Crear cuenta gratuita
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. REGISTER MODAL */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-md bg-[#13151f] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl text-slate-100 my-8">
            <button
              onClick={closeRegister}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Web Oficial</span>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">Crear Cuenta</h2>
              <div className="mt-2 p-2.5 bg-amber-950/30 border border-amber-800/40 rounded-lg text-xs text-amber-300/90 leading-relaxed">
                <span className="font-semibold block mb-0.5">Regla de asignación atómica:</span>
                La primera cuenta registrada en el sistema recibe automáticamente el rol de{' '}
                <strong>OWNER (Propietario)</strong> con control total de la web. Los registros siguientes recibirán rol USER.
              </div>
            </div>

            {regError && (
              <div className="mb-4 p-3 bg-red-950/50 border border-red-800/80 rounded-lg text-xs text-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-lg text-xs text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>{regSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nombre de usuario</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Ej. manuel_fan o tu nombre"
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      placeholder="Mín. 6 caract."
                      className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Confirmar</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={regPassConfirm}
                      onChange={(e) => setRegPassConfirm(e.target.value)}
                      placeholder="Repite pass"
                      className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">URL de avatar (opcional)</label>
                <input
                  type="url"
                  value={regAvatar}
                  onChange={(e) => setRegAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full mt-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {regLoading ? 'Registrando cuenta...' : 'Crear Cuenta'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400">
                ¿Ya posees una cuenta registrada?{' '}
                <button
                  type="button"
                  onClick={handleSwitchToLogin}
                  className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  Iniciar sesión
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. RECOVERY MODAL */}
      {isRecoveryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#13151f] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl text-slate-100">
            <button
              onClick={closeRecovery}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Seguridad</span>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">Recuperar Contraseña</h2>
              <p className="text-xs text-slate-400 mt-1">
                {recStep === 1
                  ? 'Introduce tu correo para verificar tu cuenta y recibir el código seguro.'
                  : 'Ingresa el código de verificación y define tu nueva contraseña.'}
              </p>
            </div>

            {recError && (
              <div className="mb-4 p-3 bg-red-950/50 border border-red-800/80 rounded-lg text-xs text-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{recError}</span>
              </div>
            )}

            {recMessage && (
              <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-lg text-xs text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>{recMessage}</span>
              </div>
            )}

            <form onSubmit={handleRecoverySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    disabled={recStep === 2}
                    value={recEmail}
                    onChange={(e) => setRecEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 disabled:opacity-60 transition-colors"
                  />
                </div>
              </div>

              {recStep === 2 && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Código de recuperación</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={recCode}
                        onChange={(e) => setRecCode(e.target.value)}
                        placeholder="Código de seguridad"
                        className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Nueva contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        required
                        value={recNewPass}
                        onChange={(e) => setRecNewPass(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={recLoading}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {recLoading ? 'Procesando...' : recStep === 1 ? 'Solicitar Código' : 'Restablecer Contraseña'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
              <button
                type="button"
                onClick={handleSwitchToLogin}
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                Volver a Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. PROFILE MODAL */}
      {isProfileOpen && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#13151f] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeProfile}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Mi Cuenta</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-medium border border-amber-500/20">
                  {user.role}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">Perfil de Usuario</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <span>{user.email}</span>
                <span>·</span>
                <span>Registrado el {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {profMsg && (
              <div
                className={`mb-4 p-3 rounded-lg text-xs flex items-start gap-2 ${
                  profMsg.type === 'success'
                    ? 'bg-emerald-950/50 border border-emerald-800/80 text-emerald-200'
                    : 'bg-red-950/50 border border-red-800/80 text-red-200'
                }`}
              >
                {profMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                )}
                <span>{profMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Nombre de usuario</label>
                <input
                  type="text"
                  required
                  value={profUsername}
                  onChange={(e) => setProfUsername(e.target.value)}
                  className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">URL de Avatar</label>
                <input
                  type="url"
                  value={profAvatar}
                  onChange={(e) => setProfAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-xs font-semibold text-slate-300 block mb-2">Cambiar Contraseña (opcional)</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Contraseña actual</label>
                    <input
                      type="password"
                      value={profCurrentPass}
                      onChange={(e) => setProfCurrentPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nueva contraseña</label>
                    <input
                      type="password"
                      value={profNewPass}
                      onChange={(e) => setProfNewPass(e.target.value)}
                      placeholder="Mín. 6 caract."
                      className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeProfile();
                  }}
                  className="px-4 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors"
                >
                  Cerrar Sesión
                </button>

                <button
                  type="submit"
                  disabled={profLoading}
                  className="py-2 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {profLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
