import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.ts';
import { AuditLogItem } from '../../types.ts';
import { ShieldAlert, RefreshCw, Clock, UserCheck } from 'lucide-react';

export const AuditLogsPanel: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getAuditLogs();
      setLogs(res.logs || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Registro Oficial de Auditoría y Seguridad</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Historial inmutable de cambios de roles, permisos, suspensiones y publicaciones.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/60 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0f1118]">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#141722] text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
            <tr>
              <th className="py-3 px-4">Fecha & Hora</th>
              <th className="py-3 px-4">Operador</th>
              <th className="py-3 px-4">Acción Realizada</th>
              <th className="py-3 px-4">Destinatario / Recurso</th>
              <th className="py-3 px-4">Detalles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No hay registros de auditoría almacenados aún.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-sans font-medium text-white">
                    {log.actorUsername || 'Sistema'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action.includes('ROLE')
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : log.action.includes('SUSPEND') || log.action.includes('DELETE')
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : log.action.includes('PUBLISH') || log.action.includes('RESET')
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {log.targetId || 'N/A'}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-300">
                    {log.details || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
