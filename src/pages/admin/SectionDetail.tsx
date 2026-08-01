import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layers,
  Edit3,
  Clock,
  ChevronRight
} from 'lucide-react';
import { apiClient } from '../../api/axios';
import { useSessionStore } from '../../store/sessionStore';
import { toast } from '../../store/toastStore';
import { Modal } from '../../components/Modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  SectionDetail as ReusableSectionDetail,
  type SectionDetailData,
  type PeriodItem,
  type TeacherProfile
} from '../../components/pageComponents/SectionDetail';

export const SectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Main States
  const [section, setSection] = useState<SectionDetailData | null>(null);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Timetable States
  const [periods, setPeriods] = useState<PeriodItem[]>([]);
  const [timetableLoading, setTimetableLoading] = useState(false);

  // Modal & Form States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    teacherId: '',
    capacity: 40,
    roomNumber: ''
  });

  const [isAddPeriodModalOpen, setIsAddPeriodModalOpen] = useState(false);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [periodForm, setPeriodForm] = useState({
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '09:45',
    subject: '',
    instructorId: ''
  });

  const [submitting, setSubmitting] = useState(false);

  // Fetch Section Details & Teachers List
  const fetchSectionDetails = async (showLoader = true) => {
    if (!id) return;
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const [res, teacherRes] = await Promise.allSettled([
        apiClient.get(`/sections/${id}`),
        apiClient.get('/teachers')
      ]);

      if (res.status === 'fulfilled' && res.value.data.success) {
        const fetchedSec = res.value.data.data;
        setSection(fetchedSec);
        setEditForm({
          title: fetchedSec.title || '',
          teacherId: fetchedSec.teacherId || '',
          capacity: fetchedSec.capacity || 40,
          roomNumber: fetchedSec.roomNumber || ''
        });
      } else {
        toast.error('Section record not found');
      }

      if (teacherRes.status === 'fulfilled' && teacherRes.value.data.success) {
        setTeachers(teacherRes.value.data.data || []);
      }
    } catch (err: any) {
      console.error('Error fetching section details:', err);
      toast.error('Error loading section profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch Timetable Periods
  const fetchTimetable = async () => {
    if (!id) return;
    setTimetableLoading(true);
    try {
      const res = await apiClient.get(`/lecture/section/${id}`);
      if (res.data.success) {
        setPeriods(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching section timetable:', err);
    } finally {
      setTimetableLoading(false);
    }
  };

  const { activeSessionId } = useSessionStore();

  useEffect(() => {
    fetchSectionDetails(true);
    fetchTimetable();
  }, [id, activeSessionId]);

  // Handle Edit Section
  const handleUpdateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!section || !editForm.title.trim()) return;

    setSubmitting(true);
    try {
      const res = await apiClient.put(`/sections/${section.id}`, {
        title: editForm.title.trim(),
        teacherId: editForm.teacherId || undefined,
        capacity: Number(editForm.capacity) || 40,
        roomNumber: editForm.roomNumber.trim() || undefined
      });

      if (res.data.success) {
        toast.success('Section updated successfully!');
        setIsEditModalOpen(false);
        fetchSectionDetails(false);
      } else {
        toast.error(res.data.message || 'Failed to update section');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error updating section');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Section
  const handleDeleteSection = async () => {
    if (!section) return;
    if (!window.confirm(`Are you sure you want to delete section "${section.title}"?`)) return;

    try {
      const res = await apiClient.delete(`/sections/${section.id}`);
      if (res.data.success) {
        toast.success(`Section "${section.title}" deleted!`);
        navigate(section.classId ? `/admin/classes/${section.classId}` : '/admin/classes');
      } else {
        toast.error(res.data.message || 'Failed to delete section');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error deleting section');
    }
  };

  // Handle Save Period (Create or Update)
  const handleSavePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !periodForm.subject.trim()) {
      toast.error('Subject name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        sectionId: id,
        dayOfWeek: periodForm.dayOfWeek,
        startTime: periodForm.startTime,
        endTime: periodForm.endTime,
        subject: periodForm.subject.trim(),
        instructorId: periodForm.instructorId || undefined
      };

      let res;
      if (editingPeriodId) {
        res = await apiClient.put(`/lecture/${editingPeriodId}`, payload);
      } else {
        res = await apiClient.post('/lecture', payload);
      }

      if (res.data.success) {
        toast.success(editingPeriodId ? 'Period updated successfully!' : 'Period added to timetable!');
        setIsAddPeriodModalOpen(false);
        setEditingPeriodId(null);
        setPeriodForm({
          dayOfWeek: 'MONDAY',
          startTime: '09:00',
          endTime: '09:45',
          subject: '',
          instructorId: ''
        });
        fetchTimetable();
      } else {
        toast.error(res.data.message || 'Failed to save period');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving period');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Period
  const handleDeletePeriod = async (periodId: string) => {
    if (!window.confirm('Are you sure you want to delete this lecture period?')) return;

    try {
      const res = await apiClient.delete(`/lecture/${periodId}`);
      if (res.data.success) {
        toast.success('Period removed from schedule!');
        fetchTimetable();
      } else {
        toast.error(res.data.message || 'Failed to delete period');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error deleting period');
    }
  };

  return (
    <div className="relative font-sans">
      {/* Dynamic Reusable Section Detail Component */}
      <ReusableSectionDetail
        section={section}
        periods={periods}
        loading={loading}
        timetableLoading={timetableLoading}
        isRefreshing={refreshing}
        onRefresh={() => {
          fetchSectionDetails(false);
          fetchTimetable();
        }}
        role="ADMIN"
        backLink={section?.classId ? `/admin/classes/${section.classId}` : '/admin/classes'}
        backLinkLabel="Class Details"
        getClassDetailLink={(classId) => `/admin/classes/${classId}`}
        getStudentDetailLink={(studentId) => `/admin/students/${studentId}`}
        getTeacherDetailLink={(teacherId) => `/admin/teachers/${teacherId}`}
        onEditSection={() => setIsEditModalOpen(true)}
        onDeleteSection={handleDeleteSection}
        onAddPeriod={() => {
          setEditingPeriodId(null);
          setPeriodForm({
            dayOfWeek: 'MONDAY',
            startTime: '09:00',
            endTime: '09:45',
            subject: '',
            instructorId: section?.teacherId || ''
          });
          setIsAddPeriodModalOpen(true);
        }}
        onEditPeriod={(period) => {
          setEditingPeriodId(period.id);
          setPeriodForm({
            dayOfWeek: period.dayOfWeek,
            startTime: period.startTime,
            endTime: period.endTime,
            subject: period.subject,
            instructorId: period.instructorId || ''
          });
          setIsAddPeriodModalOpen(true);
        }}
        onDeletePeriod={handleDeletePeriod}
      />

      {/* MODAL 1: EDIT SECTION */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Section ${section?.title || ''}`}
        icon={Edit3}
        iconColor="text-purple-600"
      >
        <form onSubmit={handleUpdateSection} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Section Title *
            </label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Assign Section Instructor
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="w-full flex items-center justify-between px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800 bg-white data-[state=open]:border-purple-300">
                  <span>
                    {editForm.teacherId
                      ? teachers.find(t => t.id === editForm.teacherId)?.user?.name || 'Unnamed Teacher'
                      : "-- Select Instructor --"}
                  </span>
                  <ChevronRight size={16} className="text-slate-400 rotate-90" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] p-1">
                <DropdownMenuItem onClick={() => setEditForm({ ...editForm, teacherId: '' })} className="cursor-pointer text-slate-500 italic">
                  -- Unassigned --
                </DropdownMenuItem>
                {teachers.map(t => (
                  <DropdownMenuItem
                    key={t.id}
                    onClick={() => setEditForm({ ...editForm, teacherId: t.id })}
                    className="cursor-pointer"
                  >
                    {t.user?.name || 'Unnamed Teacher'} ({t.user?.email || 'No email'})
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Capacity
              </label>
              <input
                type="number"
                value={editForm.capacity}
                onChange={(e) => setEditForm({ ...editForm, capacity: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Room No. / Hall
              </label>
              <input
                type="text"
                placeholder="e.g. Room 101"
                value={editForm.roomNumber}
                onChange={(e) => setEditForm({ ...editForm, roomNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all shadow-md shadow-purple-600/20 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: ADD / EDIT TIMETABLE PERIOD */}
      <Modal
        isOpen={isAddPeriodModalOpen}
        onClose={() => setIsAddPeriodModalOpen(false)}
        title={editingPeriodId ? 'Edit Timetable Period' : 'Add Timetable Period'}
        icon={Clock}
        iconColor="text-purple-600"
      >
        <form onSubmit={handleSavePeriod} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Day of Week *
            </label>
            <select
              value={periodForm.dayOfWeek}
              onChange={(e) => setPeriodForm({ ...periodForm, dayOfWeek: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800 bg-white"
            >
              {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Subject Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Mathematics, Computer Science"
              value={periodForm.subject}
              onChange={(e) => setPeriodForm({ ...periodForm, subject: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Start Time *
              </label>
              <input
                type="time"
                value={periodForm.startTime}
                onChange={(e) => setPeriodForm({ ...periodForm, startTime: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                End Time *
              </label>
              <input
                type="time"
                value={periodForm.endTime}
                onChange={(e) => setPeriodForm({ ...periodForm, endTime: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Subject Instructor (Optional)
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="w-full flex items-center justify-between px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800 bg-white data-[state=open]:border-purple-300">
                  <span>
                    {periodForm.instructorId
                      ? teachers.find(t => t.id === periodForm.instructorId)?.user?.name || 'Unnamed Teacher'
                      : "-- Default / Unassigned --"}
                  </span>
                  <ChevronRight size={16} className="text-slate-400 rotate-90" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] p-1">
                <DropdownMenuItem onClick={() => setPeriodForm({ ...periodForm, instructorId: '' })} className="cursor-pointer text-slate-500 italic">
                  -- Default / Unassigned --
                </DropdownMenuItem>
                {teachers.map(t => (
                  <DropdownMenuItem
                    key={t.id}
                    onClick={() => setPeriodForm({ ...periodForm, instructorId: t.id })}
                    className="cursor-pointer"
                  >
                    {t.user?.name || 'Unnamed Teacher'} ({t.user?.email || 'No email'})
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddPeriodModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all shadow-md shadow-purple-600/20 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingPeriodId ? 'Update Period' : 'Add Period'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
