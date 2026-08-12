import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckSquare, Calendar, Plus, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';

interface TaskItem {
  id: string;
  sellerName: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface FollowupItem {
  id: string;
  sellerName: string;
  notes: string;
  date: string;
  nextFollowupDate: string;
}

const mockTasks: TaskItem[] = [
  { id: 'TSK-101', sellerName: 'ABC Traders', title: 'Verify GSTIN & Onboarding Documents', description: 'Check GSTIN 24AAAAA0000A1Z5 verification documents for ABC Traders', dueDate: '2026-08-14', status: 'IN_PROGRESS', priority: 'HIGH' },
  { id: 'TSK-102', sellerName: 'ABC Traders', title: 'Onboard 10 New Electrical Tools SKUs', description: 'Assist seller in adding circuit breaker and cable products to catalog', dueDate: '2026-08-16', status: 'PENDING', priority: 'MEDIUM' },
];

const mockFollowups: FollowupItem[] = [
  { id: 'FLP-201', sellerName: 'ABC Traders', notes: 'Spoke with Rajesh Mehta regarding bulk discount rates for angle grinders.', date: '2026-08-11', nextFollowupDate: '2026-08-15' },
];

export const CaptainTasksFollowups: React.FC = () => {
  const { users, setNotificationToast } = useAuth();
  const [activeTab, setActiveTab] = useState<'TASKS' | 'FOLLOWUPS'>('TASKS');
  const [tasks, setTasks] = useState<TaskItem[]>(mockTasks);
  const [followups, setFollowups] = useState<FollowupItem[]>(mockFollowups);

  // New Task State
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskSeller, setNewTaskSeller] = useState('ABC Traders');
  const [newTaskPriority, setNewTaskPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');

  // New Follow-up State
  const [showAddFollowupModal, setShowAddFollowupModal] = useState(false);
  const [newFollowupNotes, setNewFollowupNotes] = useState('');
  const [newFollowupSeller, setNewFollowupSeller] = useState('ABC Traders');

  const mySellers = users.filter(u => u.role === 'SELLER' && !u.isDeleted);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    const newTask: TaskItem = {
      id: `TSK-${Math.floor(100 + Math.random() * 900)}`,
      sellerName: newTaskSeller,
      title: newTaskTitle,
      description: newTaskDesc,
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      status: 'PENDING',
      priority: newTaskPriority
    };
    setTasks(prev => [newTask, ...prev]);
    setNotificationToast(`📋 Task "${newTaskTitle}" created!`);
    setShowAddTaskModal(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
  };

  const handleAddFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFollowupNotes) return;
    const newF: FollowupItem = {
      id: `FLP-${Math.floor(100 + Math.random() * 900)}`,
      sellerName: newFollowupSeller,
      notes: newFollowupNotes,
      date: new Date().toISOString().split('T')[0],
      nextFollowupDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]
    };
    setFollowups(prev => [newF, ...prev]);
    setNotificationToast(`💬 Follow-up note saved for ${newFollowupSeller}!`);
    setShowAddFollowupModal(false);
    setNewFollowupNotes('');
  };

  const handleUpdateTaskStatus = (id: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    setNotificationToast(`✅ Task status updated to ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card">
        <div>
          <h1 className="text-2xl font-bold text-jaxmart-navy">Field Tasks & Seller Follow-ups</h1>
          <p className="text-xs text-gray-500 mt-1">
            Track daily field activities, seller onboarding tasks, update statuses, and log follow-up notes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'TASKS' ? (
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="px-4 py-2 bg-jaxmart-teal text-white text-xs font-semibold rounded-lg hover:bg-teal-600 flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Task</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddFollowupModal(true)}
              className="px-4 py-2 bg-jaxmart-primary text-white text-xs font-semibold rounded-lg hover:bg-jaxmart-navy flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Log Follow-up Note</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-jaxmart-card space-y-4">
        <div className="flex items-center space-x-2 border-b border-gray-200 pb-3">
          <button
            onClick={() => setActiveTab('TASKS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'TASKS' ? 'bg-jaxmart-navy text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Field Tasks ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('FOLLOWUPS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'FOLLOWUPS' ? 'bg-jaxmart-navy text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Follow-up Notes ({followups.length})</span>
          </button>
        </div>

        {/* TASKS VIEW */}
        {activeTab === 'TASKS' && (
          <div className="space-y-3">
            {tasks.map(t => (
              <div key={t.id} className="p-4 rounded-xl border border-gray-200 bg-jaxmart-bg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-jaxmart-navy text-sm">{t.title}</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      t.priority === 'HIGH' ? 'bg-red-100 text-jaxmart-error' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.priority} Priority
                    </span>
                    <span className="text-[11px] bg-white border border-gray-200 text-jaxmart-teal px-2 py-0.5 rounded font-semibold">
                      Seller: {t.sellerName}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{t.description}</p>
                  <div className="text-[11px] text-gray-400 flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Due: {t.dueDate}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {(['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => handleUpdateTaskStatus(t.id, st)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                        t.status === st
                          ? st === 'COMPLETED' ? 'bg-emerald-600 text-white shadow-sm' : st === 'IN_PROGRESS' ? 'bg-blue-600 text-white shadow-sm' : 'bg-amber-500 text-white shadow-sm'
                          : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FOLLOWUPS VIEW */}
        {activeTab === 'FOLLOWUPS' && (
          <div className="space-y-3">
            {followups.map(f => (
              <div key={f.id} className="p-4 rounded-xl border border-gray-200 bg-jaxmart-bg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-jaxmart-navy">{f.sellerName}</span>
                  <span className="text-gray-400">{f.date}</span>
                </div>
                <p className="text-xs text-gray-700 font-medium">{f.notes}</p>
                <div className="text-[11px] text-jaxmart-teal font-semibold flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Next Follow-up Scheduled: {f.nextFollowupDate}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* CREATE TASK MODAL */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-jaxmart-navy">Create Field Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Target Seller</label>
                <select
                  value={newTaskSeller}
                  onChange={e => setNewTaskSeller(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                >
                  {mySellers.map(s => <option key={s.id} value={s.companyName || s.name}>{s.companyName || s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Collect catalog photos"
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Task Description</label>
                <textarea
                  value={newTaskDesc}
                  onChange={e => setNewTaskDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={e => setNewTaskPriority(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                >
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowAddTaskModal(false)} className="px-3 py-1.5 border border-gray-300 rounded-lg font-semibold">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-jaxmart-teal text-white font-semibold rounded-lg">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG FOLLOWUP MODAL */}
      {showAddFollowupModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-jaxmart-navy">Log Seller Follow-up Note</h3>
            <form onSubmit={handleAddFollowup} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Target Seller</label>
                <select
                  value={newFollowupSeller}
                  onChange={e => setNewFollowupSeller(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                >
                  {mySellers.map(s => <option key={s.id} value={s.companyName || s.name}>{s.companyName || s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Follow-up Discussion Notes *</label>
                <textarea
                  required
                  value={newFollowupNotes}
                  onChange={e => setNewFollowupNotes(e.target.value)}
                  rows={3}
                  placeholder="Record summary of discussion with seller..."
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowAddFollowupModal(false)} className="px-3 py-1.5 border border-gray-300 rounded-lg font-semibold">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-jaxmart-primary text-white font-semibold rounded-lg">Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
