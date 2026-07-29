import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Plus, 
  Calendar, 
  Printer, 
  Search, 
  Filter, 
  Trash2, 
  Edit3,
  BookOpen, 
  UserCheck, 
  Layers, 
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { apiClient } from '../../api/axios';
import { useSessionStore } from '../../store/sessionStore';

interface Section {
  id: string;
  title: string;
  class?: {
    id: string;
    title: string;
  };
}

interface Teacher {
  id: string;
  specialization?: string;
  user: {
    name: string;
    email: string;
  };
}

interface PeriodItem {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subject?: string;
  sectionId: string;
  instructorId?: string;
  section?: Section;
  instructor?: Teacher;
}

export const Timetables: React.FC = () => {
  const { activeSessionId } = useSessionStore();
  
  // Data states
  const [periods, setPeriods] = useState<PeriodItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [selectedDay, setSelectedDay] = useState<string>('ALL');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal & Form states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '09:45',
    subject: '',
    sectionId: '',
    instructorId: ''
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Master Data & Timetable
  const fetchData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const [periodsRes, sectionsRes, teachersRes] = await Promise.all([
        apiClient.get('/lecture'),
        apiClient.get('/sections'),
        apiClient.get('/teachers')
      ]);

      if (periodsRes.data.success) {
        setPeriods(periodsRes.data.data || []);
      }
      if (sectionsRes.data.success) {
        setSections(sectionsRes.data.data || []);
      }
      if (teachersRes.data.success) {
        setTeachers(teachersRes.data.data || []);
      }
    } catch (err: any) {
      console.error('Error fetching timetables data:', err);
      showToast(err.response?.data?.message || 'Error loading timetable data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, [activeSessionId]);

  // Open Modal for Editing
  const handleOpenEditModal = (p: PeriodItem) => {
    setEditingPeriodId(p.id);
    setForm({
      dayOfWeek: p.dayOfWeek,
      startTime: p.startTime,
      endTime: p.endTime,
      subject: p.subject || '',
      sectionId: p.sectionId,
      instructorId: p.instructorId || ''
    });
    setModalError(null);
    setIsAddModalOpen(true);
  };

  // Open Modal for Creating
  const handleOpenCreateModal = () => {
    setEditingPeriodId(null);
    setForm({
      dayOfWeek: selectedDay !== 'ALL' ? selectedDay : 'MONDAY',
      startTime: '09:00',
      endTime: '09:45',
      subject: '',
      sectionId: selectedSection !== 'ALL' ? selectedSection : (sections[0]?.id || ''),
      instructorId: selectedTeacher !== 'ALL' ? selectedTeacher : ''
    });
    setModalError(null);
    setIsAddModalOpen(true);
  };

  // Handle Create / Edit Submission
  const handleSavePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sectionId || !form.subject.trim()) {
      setModalError('Please select a section and enter subject name.');
      return;
    }

    setSubmitting(true);
    setModalError(null);
    try {
      const payload = {
        dayOfWeek: form.dayOfWeek,
        startTime: form.startTime,
        endTime: form.endTime,
        subject: form.subject.trim(),
        sectionId: form.sectionId,
        instructorId: form.instructorId || undefined
      };

      const res = editingPeriodId 
        ? await apiClient.put(`/lecture/${editingPeriodId}`, payload)
        : await apiClient.post('/lecture', payload);

      if (res.data.success) {
        showToast(editingPeriodId ? 'Period updated successfully!' : 'Timetable period scheduled successfully!');
        setIsAddModalOpen(false);
        setEditingPeriodId(null);
        setForm({
          dayOfWeek: 'MONDAY',
          startTime: '09:00',
          endTime: '09:45',
          subject: '',
          sectionId: sections[0]?.id || '',
          instructorId: ''
        });
        fetchData(false);
      } else {
        setModalError(res.data.message || 'Failed to save period');
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Error saving period');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Period
  const handleDeletePeriod = async (periodId: string) => {
    if (!window.confirm('Are you sure you want to delete this timetable period?')) return;

    try {
      const res = await apiClient.delete(`/lecture/${periodId}`);
      if (res.data.success) {
        showToast('Period deleted successfully!');
        fetchData(false);
      } else {
        showToast(res.data.message || 'Failed to delete period', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error deleting period', 'error');
    }
  };

  // Print Timetable
  const handlePrint = () => {
    window.print();
  };

  // Filtered Periods
  const filteredPeriods = periods.filter((p) => {
    if (selectedDay !== 'ALL' && p.dayOfWeek !== selectedDay) return false;
    if (selectedSection !== 'ALL' && p.sectionId !== selectedSection) return false;
    if (selectedTeacher !== 'ALL' && p.instructorId !== selectedTeacher) return false;
    
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      const subjectMatch = p.subject?.toLowerCase().includes(query);
      const sectionMatch = p.section?.title.toLowerCase().includes(query) || p.section?.class?.title.toLowerCase().includes(query);
      const teacherMatch = p.instructor?.user?.name.toLowerCase().includes(query);
      return subjectMatch || sectionMatch || teacherMatch;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[999999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
          toast.type === 'success' 
            ? 'bg-emerald-600 text-white shadow-emerald-600/20' 
            : 'bg-rose-600 text-white shadow-rose-600/20'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <Clock size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Master Timetables</h1>
            <p className="text-xs text-slate-500 font-medium">Manage and view timetable schedules across all classes and faculty members</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => fetchData(false)}
            className="p-2.5 text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            title="Refresh Timetables"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 active:scale-95"
          >
            <Printer size={16} /> Print Timetable
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-95"
          >
            <Plus size={16} /> Schedule New Period
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Day Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {['ALL', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedDay === day
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {day === 'ALL' ? 'All Days' : day}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search subject, class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
            />
          </div>
        </div>

        {/* Secondary Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <span className="font-semibold text-slate-500">Filter By Section:</span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            >
              <option value="ALL">All Sections</option>
              {sections.map(sec => (
                <option key={sec.id} value={sec.id}>
                  {sec.class?.title ? `${sec.class.title} - ${sec.title}` : sec.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <UserCheck size={14} className="text-slate-400" />
            <span className="font-semibold text-slate-500">Filter By Teacher:</span>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            >
              <option value="ALL">All Teachers</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.user.name}
                </option>
              ))}
            </select>
          </div>

          {(selectedDay !== 'ALL' || selectedSection !== 'ALL' || selectedTeacher !== 'ALL' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedDay('ALL');
                setSelectedSection('ALL');
                setSelectedTeacher('ALL');
                setSearchTerm('');
              }}
              className="text-xs font-bold text-rose-600 hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Timetable Display Table */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 animate-pulse">
          <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
          <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
          <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
        </div>
      ) : filteredPeriods.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
            <Clock size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Timetable Periods Found</h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto mb-6">
            There are no periods matching your selected filters or scheduled for this academic session.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            <Plus size={16} /> Schedule First Period
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Day</th>
                  <th className="px-6 py-4">Time Slot</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Class & Section</th>
                  <th className="px-6 py-4">Assigned Instructor</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPeriods.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold">
                        {p.dayOfWeek}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400" />
                        <span>{p.startTime} - {p.endTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-600 text-sm">
                      {p.subject || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">
                      {p.section ? (
                        <Link
                          to={`/admin/sections/${p.section.id}`}
                          className="inline-flex items-center gap-1 text-purple-700 font-bold hover:underline"
                        >
                          {p.section.class?.title || 'Class'} - {p.section.title}
                        </Link>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">
                      {p.instructor?.user ? (
                        <Link
                          to={`/admin/teachers/${p.instructor.id}`}
                          className="inline-flex items-center gap-1.5 text-slate-800 font-bold hover:text-indigo-600"
                        >
                          <UserCheck size={14} className="text-emerald-600" />
                          <span>{p.instructor.user.name}</span>
                        </Link>
                      ) : (
                        <span className="text-slate-400 font-normal">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors mr-1"
                        title="Edit Period"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePeriod(p.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Period"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SCHEDULE / EDIT PERIOD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Clock className="text-indigo-600" size={20} />
                <h3>{editingPeriodId ? 'Edit Timetable Period' : 'Schedule New Period'}</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                <AlertCircle size={16} className="shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSavePeriod} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Class Section *
                </label>
                <select
                  value={form.sectionId}
                  onChange={(e) => setForm({ ...form, sectionId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800 bg-white"
                  required
                >
                  <option value="">Select Class Section</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.class?.title ? `${sec.class.title} - ${sec.title}` : sec.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Day of Week *
                </label>
                <select
                  value={form.dayOfWeek}
                  onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800 bg-white"
                  required
                >
                  {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Subject Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics, Science"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Assigned Teacher (Optional)
                </label>
                <select
                  value={form.instructorId}
                  onChange={(e) => setForm({ ...form, instructorId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800 bg-white"
                >
                  <option value="">Select Teacher (Optional)</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.user.name} {t.specialization ? `(${t.specialization})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingPeriodId ? 'Update Period' : 'Save Period'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
