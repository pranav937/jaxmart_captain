import React from 'react';
import { ActivityLog } from '../../types';
import { X, ShieldCheck, Clock, Monitor, Terminal, Layers, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';

interface DrawerProps {
  log: ActivityLog | null;
  onClose: () => void;
}

export const ActivityDetailDrawer: React.FC<DrawerProps> = ({ log, onClose }) => {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-jaxmart-navy/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-white shadow-jaxmart-drawer flex flex-col h-full z-10 border-l border-gray-200 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-6 bg-jaxmart-navy text-white flex items-center justify-between border-b border-jaxmart-primary">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-jaxmart-teal text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Audit Log Inspection
              </span>
              <span className="text-xs font-mono text-gray-300">ID: {log.id}</span>
            </div>
            <h2 className="text-xl font-bold mt-1 tracking-tight">{log.description}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-jaxmart-bg/40">
          
          {/* Action & Status Card */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-jaxmart-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-500 font-semibold block uppercase">Action Type</span>
              <span className="font-bold text-jaxmart-primary text-sm mt-0.5 block">{log.action}</span>
            </div>

            <div>
              <span className="text-gray-500 font-semibold block uppercase">Target Entity</span>
              <span className="font-bold text-jaxmart-navy text-sm mt-0.5 block">{log.entity}</span>
            </div>

            <div>
              <span className="text-gray-500 font-semibold block uppercase">Module</span>
              <span className="font-bold text-jaxmart-mediumBlue mt-0.5 block truncate">{log.module}</span>
            </div>

            <div>
              <span className="text-gray-500 font-semibold block uppercase">Execution Status</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-block mt-1">
                {log.status}
              </span>
            </div>
          </div>

          {/* Actor Metadata & Hierarchy Context */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm space-y-4">
            <h3 className="text-xs font-bold text-jaxmart-navy uppercase tracking-wider border-b pb-2 flex items-center space-x-1.5">
              <UserCheck className="w-4 h-4 text-jaxmart-teal" />
              <span>Actor & Business Hierarchy Context</span>
            </h3>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-jaxmart-navy text-white font-bold flex items-center justify-center text-sm shrink-0">
                {(log.userName || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold text-jaxmart-navy">{log.userName}</div>
                <div className="text-xs text-gray-500">Role: <span className="font-semibold text-jaxmart-primary">{log.userRole}</span> (ID: {log.userId})</div>
              </div>
            </div>

            {log.hierarchyContext && (
              <div className="p-3 bg-jaxmart-bg rounded-lg border border-gray-200 text-xs">
                <span className="font-semibold text-jaxmart-mediumBlue block mb-1">Hierarchy Path:</span>
                <div className="flex items-center space-x-2 text-gray-700 font-medium">
                  <span>Super Admin</span>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                  <span>Admin: <strong>{log.hierarchyContext.adminName || 'Rahul Sharma'}</strong></span>
                  {log.hierarchyContext.captainName && (
                    <>
                      <ArrowRight className="w-3 h-3 text-gray-400" />
                      <span>Captain: <strong>{log.hierarchyContext.captainName}</strong></span>
                    </>
                  )}
                  {log.hierarchyContext.sellerName && (
                    <>
                      <ArrowRight className="w-3 h-3 text-gray-400" />
                      <span>Seller: <strong>{log.hierarchyContext.sellerName}</strong></span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 10: Value Diffs (OLD VALUE vs NEW VALUE) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm space-y-3">
            <h3 className="text-xs font-bold text-jaxmart-navy uppercase tracking-wider border-b pb-2 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-jaxmart-teal" />
              <span>Field-Level Value Differences (Before vs After)</span>
            </h3>

            {log.diffs && log.diffs.length > 0 ? (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-jaxmart-bg text-jaxmart-mediumBlue font-semibold border-b">
                      <th className="p-2.5">Field Changed</th>
                      <th className="p-2.5 text-red-700 bg-red-50/50">Old Value</th>
                      <th className="p-2.5 text-emerald-700 bg-emerald-50/50">New Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {log.diffs.map((diff, i) => (
                      <tr key={i} className="hover:bg-jaxmart-bg/50 font-mono">
                        <td className="p-2.5 font-bold text-jaxmart-navy font-sans">{diff.field}</td>
                        <td className="p-2.5 text-red-700 bg-red-50/30 line-through">{String(diff.oldValue)}</td>
                        <td className="p-2.5 text-emerald-700 bg-emerald-50/30 font-bold">{String(diff.newValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No previous/new diff state recorded for this event.</p>
            )}
          </div>

          {/* Device, Network & Timestamp Details */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm space-y-3 text-xs">
            <h3 className="text-xs font-bold text-jaxmart-navy uppercase tracking-wider border-b pb-2 flex items-center space-x-1.5">
              <Terminal className="w-4 h-4 text-jaxmart-teal" />
              <span>Security & Network Telemetry</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500 block">Execution Timestamp</span>
                <span className="font-semibold text-jaxmart-navy flex items-center mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-jaxmart-teal mr-1" />
                  {log.date} at {log.time}
                </span>
              </div>

              <div>
                <span className="text-gray-500 block">Client IP Address</span>
                <span className="font-mono text-jaxmart-navy font-semibold mt-0.5 block">{log.ipAddress}</span>
              </div>

              <div className="col-span-2">
                <span className="text-gray-500 block">Browser & Device Information</span>
                <span className="font-mono text-gray-700 bg-jaxmart-bg px-2 py-1 rounded border border-gray-200 mt-1 block">
                  <Monitor className="w-3.5 h-3.5 text-gray-500 inline mr-1" />
                  {log.deviceInfo}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500">Immutable Audit Record</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-jaxmart-primary text-white rounded-lg text-xs font-semibold hover:bg-jaxmart-navy"
          >
            Close Drawer
          </button>
        </div>

      </div>
    </div>
  );
};
