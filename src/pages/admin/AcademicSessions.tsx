import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Clock, 
  Check, 
  Layers,
  Sparkles
} from 'lucide-react';
import { useSessionStore, } from '../../store/sessionStore';
import { CreateSessionModal } from '../../components/CreateSessionModal';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";

export const AcademicSessions: React.FC = () => {
  const { sessions, activeSessionId, setActiveSessionId, fetchSessions, deleteSession, isLoading } = useSessionStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteSession(id);
      showToast(`Session "${title}" deleted successfully.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete session', 'error');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all transform animate-in slide-in-from-bottom-5 ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : 'bg-rose-900 text-rose-100 border-rose-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-400 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Sessions</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {sessions.length} Sessions
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage academic years, create new sessions, and set the default active session for your portal.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => fetchSessions()}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
            title="Refresh Sessions"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin text-indigo-600' : ''} />
          </button>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01]"
          >
            <Plus size={18} />
            <span>Create New Session</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Session</p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">
              {sessions.find(s => s.id === activeSessionId)?.title || 'None Selected'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Configured</p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">
              {sessions.length} Academic Years
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Layers size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status Overview</p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">
              {sessions.filter(s => s.status?.title === 'ACTIVE').length} Active / {sessions.filter(s => s.status?.title !== 'ACTIVE').length} Inactive
            </p>
          </div>
        </div>
      </div>

      {/* Main Sessions List Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Clock size={18} className="text-indigo-600" />
            <span>Academic Session Directory</span>
          </h2>
        </div>

        {sessions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Academic Sessions Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              Create your school's first academic session year to start organizing classes, sections, and student enrollments.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md transition-all"
            >
              <Plus size={18} />
              <span>Create First Session</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Session Title</th>
                  <th className="py-3.5 px-6">Start Date</th>
                  <th className="py-3.5 px-6">End Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {sessions.map((session) => {
                  const isActiveContext = session.id === activeSessionId;
                  const isStatusActive = session.status?.title === 'ACTIVE';

                  return (
                    <tr 
                      key={session.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isActiveContext ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <span>{session.title}</span>
                          {isActiveContext && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200">
                              <Check size={12} />
                              Active Context
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-600">
                        {formatDate(session.startDate)}
                      </td>

                      <td className="py-4 px-6 text-slate-600">
                        {formatDate(session.endDate)}
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isStatusActive
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isStatusActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {session.status?.title || 'STATUS'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isActiveContext && (
                            <button
                              onClick={() => setActiveSessionId(session.id)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-xs font-semibold text-slate-700 transition-colors"
                            >
                              Switch to this
                            </button>
                          )}

                          <AlertDialog>
                            <AlertDialogTrigger
                              render={
                                <button
                                  onClick={() => setDeletingId(session.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Delete Session"
                                >
                                  <Trash2 size={16} />
                                </button>
                              }
                            />
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Academic Session?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete session <strong>"{session.title}"</strong>? 
                                  This action cannot be undone and may affect associated records.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeletingId(null)}>
                                  Cancel
                                </AlertDialogCancel>
                                <button
                                  onClick={() => handleDelete(session.id, session.title)}
                                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-sm transition-colors"
                                >
                                  Delete Session
                                </button>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      <CreateSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          showToast('Academic session created successfully!');
        }}
      />
    </div>
  );
};
