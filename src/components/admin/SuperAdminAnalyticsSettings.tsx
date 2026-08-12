import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, Settings, Bell, Send, ShieldCheck, Database, RefreshCw, Save } from 'lucide-react';

export const SuperAdminAnalyticsSettings: React.FC = () => {
  const { setNotificationToast } = useAuth();
  
  // Settings Form State
  const [siteName, setSiteName] = useState('Jaxmart B2B Platform');
  const [supportEmail, setSupportEmail] = useState('support@jaxmart.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoApproveSellers, setAutoApproveSellers] = useState(false);

  // Notification Broadcaster State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifTargetRole, setNotifTargetRole] = useState('ALL');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setNotificationToast('⚙️ System settings updated & persisted.');
  };

  const handleBroadcastNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) return;
    setNotificationToast(`📢 Broadcast sent to ${notifTargetRole}: "${notifTitle}"`);
    setNotifTitle('');
    setNotifMessage('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card">
        <h1 className="text-2xl font-bold text-jaxmart-navy">Reports, Analytics & Platform Governance</h1>
        <p className="text-xs text-gray-500 mt-1">
          Full control over platform parameters, global announcements, database operations, and executive analytics.
        </p>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Gross Annual Revenue</p>
          <h3 className="text-2xl font-extrabold text-jaxmart-navy mt-1">₹1.84 Cr</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">↑ 18.5% growth YoY</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Active Merchants</p>
          <h3 className="text-2xl font-extrabold text-jaxmart-navy mt-1">142 Sellers</h3>
          <p className="text-[11px] text-jaxmart-teal font-medium mt-1">Across 24 Regions</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Fulfillment Success Rate</p>
          <h3 className="text-2xl font-extrabold text-jaxmart-navy mt-1">99.4%</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Zero major SLA breaches</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-jaxmart-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">System Uptime</p>
          <h3 className="text-2xl font-extrabold text-jaxmart-navy mt-1">99.98%</h3>
          <p className="text-[11px] text-blue-600 font-medium mt-1">PostgreSQL 5432 Active</p>
        </div>
      </div>

      {/* Main Settings & Notification Broadcaster Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* System Settings Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card space-y-4">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
            <Settings className="w-5 h-5 text-jaxmart-teal" />
            <h2 className="text-lg font-bold text-jaxmart-navy">System Parameters & Flags</h2>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Platform Brand Name</label>
              <input
                type="text"
                value={siteName}
                onChange={e => setSiteName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">System Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={e => setSupportEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={e => setMaintenanceMode(e.target.checked)}
                  className="rounded text-jaxmart-primary focus:ring-jaxmart-teal"
                />
                <span className="font-semibold text-jaxmart-navy">Enable System Maintenance Mode</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoApproveSellers}
                  onChange={e => setAutoApproveSellers(e.target.checked)}
                  className="rounded text-jaxmart-primary focus:ring-jaxmart-teal"
                />
                <span className="font-semibold text-jaxmart-navy">Auto-Approve New Registered Sellers</span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-jaxmart-primary text-white font-semibold rounded-lg hover:bg-jaxmart-navy transition-colors flex items-center space-x-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save Platform Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Global Notification Broadcaster */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card space-y-4">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
            <Bell className="w-5 h-5 text-jaxmart-primary" />
            <h2 className="text-lg font-bold text-jaxmart-navy">Global Notification Broadcaster</h2>
          </div>

          <form onSubmit={handleBroadcastNotification} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Target Audience</label>
              <select
                value={notifTargetRole}
                onChange={e => setNotifTargetRole(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
              >
                <option value="ALL">All Users Across Ecosystem</option>
                <option value="ADMIN">Admins Only</option>
                <option value="CAPTAIN">Captains Only</option>
                <option value="SELLER">Sellers Only</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">Announcement Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Scheduled System Maintenance"
                value={notifTitle}
                onChange={e => setNotifTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">Message Content</label>
              <textarea
                required
                rows={3}
                placeholder="Type global broadcast announcement..."
                value={notifMessage}
                onChange={e => setNotifMessage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-jaxmart-teal text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors flex items-center space-x-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Announcement</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
