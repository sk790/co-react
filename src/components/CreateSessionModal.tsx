import React, { useState, useEffect } from 'react';
import { Calendar, Plus, X, AlertCircle, Loader2 } from 'lucide-react';
import { useSessionStore } from '../store/sessionStore';
import { apiClient } from '../api/axios';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface MasterDataStatus {
  id: string;
  title: string;
}

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createSession } = useSessionStore();
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusId, setStatusId] = useState('');
  const [statuses, setStatuses] = useState<MasterDataStatus[]>([]);
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch status options from master data
  useEffect(() => {
    if (isOpen) {
      const fetchStatuses = async () => {
        setLoadingStatuses(true);
        try {
          const res = await apiClient.get('/master-data?type=STATUS');
          if (res.data.success && res.data.data) {
            setStatuses(res.data.data);
            // Default to ACTIVE status if available
            const activeObj = res.data.data.find(
              (s: MasterDataStatus) => s.title.toUpperCase() === 'ACTIVE'
            );
            if (activeObj) {
              setStatusId(activeObj.id);
            } else if (res.data.data.length > 0) {
              setStatusId(res.data.data[0].id);
            }
          }
        } catch (err) {
          console.error('Failed to fetch status master data:', err);
        } finally {
          setLoadingStatuses(false);
        }
      };

      fetchStatuses();
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form Validations
    if (!title.trim()) {
      setErrorMessage('Please enter a session title (e.g. 2025-2026)');
      return;
    }
    if (!startDate) {
      setErrorMessage('Please select a start date');
      return;
    }
    if (!endDate) {
      setErrorMessage('Please select an end date');
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setErrorMessage('Start date must be before end date');
      return;
    }
    if (!statusId) {
      setErrorMessage('Please select a session status');
      return;
    }

    setIsSubmitting(true);
    try {
      await createSession({
        title: title.trim(),
        startDate,
        endDate,
        statusId,
      });

      // Reset form
      setTitle('');
      setStartDate('');
      setEndDate('');
      setStatusId('');

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create academic session');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden transition-all transform animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Create Academic Session
              </h2>
              <p className="text-xs text-slate-500">
                Add a new session year for your school
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              <AlertCircle size={18} className="shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Session Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Session Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 2025-2026 or Fall 2025"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:bg-white transition-all"
            />
          </div>

          {/* Start Date & End Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                End Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Session Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Status <span className="text-rose-500">*</span>
            </label>
            {loadingStatuses ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                <Loader2 size={16} className="animate-spin text-indigo-600" />
                Loading status choices...
              </div>
            ) : (
              <select
                value={statusId}
                onChange={(e) => setStatusId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:bg-white transition-all"
              >
                <option value="">Select Status</option>
                {statuses.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Modal Footer / Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Create Session</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
