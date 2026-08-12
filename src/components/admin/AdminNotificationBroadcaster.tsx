import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Send } from 'lucide-react';

export const AdminNotificationBroadcaster: React.FC = () => {
  const { setNotificationToast } = useAuth();
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifTargetRole, setNotifTargetRole] = useState('CAPTAIN');

  const handleBroadcastNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) return;
    setNotificationToast(`📢 Broadcast sent to ${notifTargetRole}s: "${notifTitle}"`);
    setNotifTitle('');
    setNotifMessage('');
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card">
        <h1 className="text-2xl font-bold text-jaxmart-navy">Operational Announcements</h1>
        <p className="text-xs text-gray-500 mt-1">
          Send regional broadcasts and operational updates to assigned Captains and Sellers.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card max-w-xl space-y-4">
        <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
          <Bell className="w-5 h-5 text-jaxmart-primary" />
          <h2 className="text-lg font-bold text-jaxmart-navy">Broadcast Operational Update</h2>
        </div>

        <form onSubmit={handleBroadcastNotification} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-gray-700 block mb-1">Target Role Scope</label>
            <select
              value={notifTargetRole}
              onChange={e => setNotifTargetRole(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
            >
              <option value="CAPTAIN">Captains Only</option>
              <option value="SELLER">Sellers Only</option>
              <option value="ALL">Captains & Sellers</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-1">Announcement Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Monthly SLA Review Meeting"
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
              placeholder="Type announcement message..."
              value={notifMessage}
              onChange={e => setNotifMessage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-jaxmart-primary text-white font-semibold rounded-lg hover:bg-jaxmart-navy transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Send Operational Broadcast</span>
          </button>
        </form>
      </div>

    </div>
  );
};
