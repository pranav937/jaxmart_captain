import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, ShieldAlert, Monitor, CheckCircle2, AlertTriangle } from 'lucide-react';

export const SecurityLogTable: React.FC = () => {
  const { securityEvents } = useAuth();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="bg-red-100 text-jaxmart-error text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-red-200">
            System Security & Authentication Monitor
          </span>
          <h1 className="text-2xl font-bold text-jaxmart-navy mt-1">Security & Login History</h1>
          <p className="text-sm text-gray-500 mt-1">
            Super Admin real-time monitoring of successful logins, failed auth attempts, IP addresses, and active sessions.
          </p>
        </div>
      </div>

      {/* Security Threat Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center space-x-3">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">2FA Enforced Rate</span>
            <span className="text-xl font-bold text-jaxmart-navy">100% Active</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center space-x-3">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">Failed Login Attempts (24h)</span>
            <span className="text-xl font-bold text-amber-600">3 Blocked</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-jaxmart-sm flex items-center space-x-3">
          <div className="p-3 bg-purple-100 text-purple-700 rounded-lg">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">Active User Sessions</span>
            <span className="text-xl font-bold text-purple-800">14 Sessions</span>
          </div>
        </div>
      </div>

      {/* Security Events Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-jaxmart-card overflow-hidden">
        <div className="p-4 border-b border-gray-200 font-bold text-jaxmart-navy">
          Authentication & Session Security Log
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-jaxmart-bg text-jaxmart-mediumBlue font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">User Identity</th>
                <th className="p-3.5">Event Type</th>
                <th className="p-3.5">Client IP Address</th>
                <th className="p-3.5">Device & Location</th>
                <th className="p-3.5">Security Status</th>
                <th className="p-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {securityEvents.map(event => (
                <tr key={event.id} className="hover:bg-jaxmart-bg/50">
                  <td className="p-3.5 font-medium text-gray-600 whitespace-nowrap">{event.timestamp}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-jaxmart-navy">{event.userName}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{event.userRole}</div>
                  </td>
                  <td className="p-3.5 font-semibold text-jaxmart-primary">{event.eventType}</td>
                  <td className="p-3.5 font-mono text-gray-700">{event.ipAddress}</td>
                  <td className="p-3.5 text-gray-600">
                    <div>{event.device}</div>
                    <div className="text-[11px] text-gray-400">{event.location}</div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      event.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-jaxmart-error'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-gray-700 font-medium">{event.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
