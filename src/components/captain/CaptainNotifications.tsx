import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, ShieldCheck } from 'lucide-react';

export const CaptainNotifications: React.FC = () => {
  return (
    <div className="space-y-6">
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card">
        <h1 className="text-2xl font-bold text-jaxmart-navy">System & Admin Announcements</h1>
        <p className="text-xs text-gray-500 mt-1">
          Operational broadcasts and platform notifications from your Admin supervisor and Super Admin.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card space-y-4">
        <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
          <Bell className="w-5 h-5 text-jaxmart-teal" />
          <h2 className="text-lg font-bold text-jaxmart-navy">Recent Announcements</h2>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-gray-200 bg-jaxmart-bg space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-jaxmart-navy text-xs flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-jaxmart-teal" />
                <span>Super Admin System Announcement</span>
              </span>
              <span className="text-[10px] text-gray-400">2026-08-11</span>
            </div>
            <p className="text-xs text-gray-600">Welcome to the unified Jaxmart B2B Captain Platform! Please verify all assigned sellers GSTIN documents.</p>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 bg-jaxmart-bg space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-jaxmart-navy text-xs flex items-center space-x-1.5">
                <Bell className="w-4 h-4 text-blue-600" />
                <span>Admin Rahul Sharma: Monthly SLA Review Meeting</span>
              </span>
              <span className="text-[10px] text-gray-400">2026-08-12</span>
            </div>
            <p className="text-xs text-gray-600">Reminder for all field Captains to log weekly seller follow-up notes and complete pending onboarding tasks.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
