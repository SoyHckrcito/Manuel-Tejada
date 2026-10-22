import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../lib/api.ts';
import { User, UserRole, UserStatus, AnalyticsSummary } from '../../types.ts';
import {
  Users,
  Search,
  Filter,
  Shield,
  UserCheck,
  UserX,
  Trash2,
  Activity,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Info,
} from 'lucide-react';

export const UsersActivityPanel: React.FC = () => {
  const { user: currentUser, isOwner, isAdmin } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'users' | 'visitors'>('users');
  const [usersList, setUsersList] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters & search for users
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Confirmation modal state
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

  const fetchData = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const [usersRes, analyticsRes] = await Promise.all([
        api.admin.getUsers(),
        api.admin.getAnalytics(),
      ]);
      setUsersList(usersRes.users || []);
      setAnalytics(analyticsRes || null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al cargar los datos de usuarios y actividad.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = (targetUser: User, newRole: UserRole) => {
    if (!isOwner) {
      setFeedback({ type: 'error', message: 'Solo el OWNER (Propietario) puede modificar roles administrativos.' });
      return;
    }

    if (targetUser.role === 'OWNER') {
      setFeedback({ type: 'error', message: 'No es posible degradar al OWNER desde este menú.' });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: `Cambiar rol de ${targetUser.username}`,
      description: `¿Estás seguro de asignar el rol de ${newRole} a ${targetUser.username} (${targetUser.email})? Esta acción se registrará en la auditoría del sistema.`,
      actionText: `Asignar ${newRole}`,
      isDestructive: false,
      onConfirm: async () => {
        setActionLoading(true);
        try {
          const res = await api.admin.updateRole(targetUser.id, newRole);
          setFeedback({ type: 'success', message: res.message });
          await fetchData();
        } catch (err: any) {
          setFeedback({ type: 'error', message: err.message || 'Error al cambiar rol.' });
        } finally {
          setActionLoading(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleToggleStatus = (targetUser: User) => {
    const newStatus: UserStatus = targetUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const isSuspending = newStatus === 'SUSPENDED';

    if (targetUser.role === 'OWNER') {
      setFeedback({ type: 'error', message: 'Por seguridad, no se puede suspender al OWNER.' });
      return;
    }

    if (!isOwner && isAdmin && targetUser.role === 'ADMIN') {
      setFeedback({ type: 'error', message: 'Un ADMIN no puede suspender a otro administrador.' });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: `${isSuspending ? 'Suspender' : 'Reactivar'} cuenta de ${targetUser.username}`,
      description: isSuspending
        ? `Al suspender esta cuenta, el usuario no podrá iniciar sesión ni realizar ninguna acción administrativa hasta ser reactivado.`
        : `La cuenta volverá a tener acceso normal a la web con su rol correspondiente.`,
      actionText: isSuspending ? 'Suspender Cuenta' : 'Reactivar Cuenta',
      isDestructive: isSuspending,
      onConfirm: async () => {
        setActionLoading(true);
        try {
          const res = await api.admin.updateStatus(targetUser.id, newStatus);
          setFeedback({ type: 'success', message: res.message });
          await fetchData();
        } catch (err: any) {
          setFeedback({ type: 'error', message: err.message || 'Error al actualizar estado.' });
        } finally {
          setActionLoading(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleDeleteUser = (targetUser: User) => {
    if (!isOwner) {
      setFeedback({ type: 'error', message: 'Solo el OWNER puede eliminar cuentas definitivamente.' });
      return;
    }

    if (targetUser.role === 'OWNER') {
      setFeedback({ type: 'error', message: 'Acción bloqueada: No puedes eliminar la cuenta de un OWNER.' });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: `Eliminar cuenta de ${targetUser.username}`,
      description: `ADVERTENCIA: Esta acción es irreversible. Se eliminarán permanentemente los datos y el acceso de ${targetUser.username} (${targetUser.email}).`,
      actionText: 'Eliminar Definitivamente',
      isDestructive: true,
      onConfirm: async () => {
        setActionLoading(true);
        try {
          const res = await api.admin.deleteUser(targetUser.id);
          setFeedback({ type: 'success', message: res.message });
          await fetchData();
        } catch (err: any) {
          setFeedback({ type: 'error', message: err.message || 'Error al eliminar usuario.' });
        } finally {
          setActionLoading(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Sub-Tabs: Cuentas Registradas vs Actividad de Visitantes */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeSubTab === 'users'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Cuentas Registradas ({usersList.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('visitors')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeSubTab === 'visitors'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Actividad y Visitantes Anónimos</span>
          </button>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/60 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-200'
              : 'bg-red-950/60 border border-red-800 text-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* SUB-TAB 1: USERS */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          {/* Controls bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por usuario o correo..."
                className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">Todos los roles</option>
                <option value="OWNER">OWNER (Propietario)</option>
                <option value="ADMIN">ADMIN (Administrador)</option>
                <option value="MODERATOR">MODERATOR (Moderador)</option>
                <option value="USER">USER (Usuario regular)</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#0a0b0e] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">Todos los estados</option>
                <option value="ACTIVE">Activo</option>
                <option value="SUSPENDED">Suspendido</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0f1118]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#141722] text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Correo</th>
                  <th className="py-3 px-4">Rol Asignado</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Registro</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No se encontraron usuarios que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = currentUser?.id === u.id;
                    const isTargetOwner = u.role === 'OWNER';

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            {u.avatarUrl ? (
                              <img
                                src={u.avatarUrl}
                                alt={u.username}
                                referrerPolicy="no-referrer"
                                className="w-7 h-7 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/20">
                                {u.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-white flex items-center gap-1.5">
                                <span>{u.username}</span>
                                {isSelf && (
                                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1 rounded">
                                    Tú
                                  </span>
                                )}
                              </p>
                              <span className="text-[10px] text-slate-500 font-mono">ID: {u.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {u.email}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              u.role === 'OWNER'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : u.role === 'ADMIN'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                : u.role === 'MODERATOR'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                                : 'bg-red-950/60 text-red-400 border border-red-800/60'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? 'Activo' : 'Suspendido'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Role Assignment Dropdown (Strictly OWNER only) */}
                            {isOwner && !isTargetOwner && (
                              <select
                                value={u.role}
                                onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                                className="bg-[#0a0b0e] border border-slate-700 rounded px-2 py-1 text-[11px] text-amber-300 focus:outline-none cursor-pointer"
                                title="Cambiar rol de usuario"
                              >
                                <option value="USER">Asignar: USER</option>
                                <option value="MODERATOR">Asignar: MODERATOR</option>
                                <option value="ADMIN">Asignar: ADMIN</option>
                              </select>
                            )}

                            {/* Suspend / Reactivate */}
                            {!isTargetOwner && (
                              <button
                                onClick={() => handleToggleStatus(u)}
                                className={`p-1.5 rounded transition-colors ${
                                  u.status === 'ACTIVE'
                                    ? 'hover:bg-amber-950/40 text-amber-400'
                                    : 'hover:bg-emerald-950/40 text-emerald-400'
                                }`}
                                title={u.status === 'ACTIVE' ? 'Suspender cuenta' : 'Reactivar cuenta'}
                              >
                                {u.status === 'ACTIVE' ? (
                                  <UserX className="w-3.5 h-3.5" />
                                ) : (
                                  <UserCheck className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}

                            {/* Delete User (OWNER only) */}
                            {isOwner && !isTargetOwner && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded hover:bg-red-950/40 text-red-400 transition-colors"
                                title="Eliminar cuenta definitivamente"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: VISITORS & ANONYMOUS ACTIVITY */}
      {activeSubTab === 'visitors' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#13151f] border border-slate-800 rounded-xl p-4">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Total de Visitas Registradas
              </span>
              <span className="text-2xl font-bold font-mono text-white mt-1 block">
                {analytics?.totalViews ?? 0}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">Páginas vistas en total</span>
            </div>

            <div className="bg-[#13151f] border border-slate-800 rounded-xl p-4">
              <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold block">
                Visitantes Anónimos
              </span>
              <span className="text-2xl font-bold font-mono text-amber-300 mt-1 block">
                {analytics?.anonymousVisits ?? 0}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">Sin inicio de sesión requerido</span>
            </div>

            <div className="bg-[#13151f] border border-slate-800 rounded-xl p-4">
              <span className="text-[11px] uppercase tracking-wider text-blue-400 font-semibold block">
                Visitas Autenticadas
              </span>
              <span className="text-2xl font-bold font-mono text-blue-300 mt-1 block">
                {analytics?.registeredVisits ?? 0}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">De usuarios registrados</span>
            </div>
          </div>

          {/* Privacy statement callout */}
          <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Cumplimiento y Privacidad Técnica:</strong> Para visitantes anónimos, únicamente se computa un
              identificador de sesión aleatorio temporal en memoria y la página consultada. No se capturan direcciones IP,
              huellas digitales ni datos personales no consentidos.
            </p>
          </div>

          {/* Top Pages & Recent Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Top Pages */}
            <div className="lg:col-span-5 bg-[#0f1118] border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Secciones Más Visitadas</span>
              </h4>
              <div className="space-y-2">
                {(!analytics?.topPages || analytics.topPages.length === 0) ? (
                  <p className="text-xs text-slate-500 py-4 text-center">Aún no hay visitas registradas.</p>
                ) : (
                  analytics.topPages.map((page, pIdx) => (
                    <div
                      key={pIdx}
                      className="flex items-center justify-between p-2 rounded bg-[#141722] text-xs"
                    >
                      <span className="font-mono text-slate-200 truncate pr-2">
                        {page.page_path || '/'}
                      </span>
                      <div className="flex items-center gap-3 shrink-0 text-slate-400 font-mono">
                        <span className="text-amber-400 font-semibold">{page.views} vistas</span>
                        <span>{page.avg_duration}s prom.</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Timeline */}
            <div className="lg:col-span-7 bg-[#0f1118] border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Registro Reciente de Actividad</span>
              </h4>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {(!analytics?.recentVisits || analytics.recentVisits.length === 0) ? (
                  <p className="text-xs text-slate-500 py-4 text-center">Sin actividad reciente registrada.</p>
                ) : (
                  analytics.recentVisits.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded bg-[#141722] text-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            item.isAnonymous ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                        />
                        <span className="font-semibold text-white truncate">
                          {item.isAnonymous ? 'Visitante anónimo' : `Usuario #${item.userId}`}
                        </span>
                        <span className="text-slate-400 truncate">en {item.pagePath}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 shrink-0 font-mono">
                        {new Date(item.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
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
                disabled={actionLoading}
                onClick={confirmModal.onConfirm}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
                  confirmModal.isDestructive
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {actionLoading ? 'Procesando...' : confirmModal.actionText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
