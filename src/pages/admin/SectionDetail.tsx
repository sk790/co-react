import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Layers, 
  BookOpen, 
  Users, 
  UserCheck, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Search,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  Shield,
  Briefcase,
  Clock,
  Plus,
  Printer,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { apiClient } from '../../api/axios';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useSessionStore } from '../../store/sessionStore';

interface UserInfo {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface TeacherProfile {
  id: string;
  specialization?: string;
  user?: UserInfo;
}

interface StudentProfile {
  id: string;
  user?: UserInfo;
}

interface EnrollmentItem {
  id: string;
  studentId?: string;
  student?: StudentProfile;
  createdAt?: string;
}

interface ParentClass {
  id: string;
  title: string;
  description?: string;
}

interface SectionDetailData {
  id: string;
  title: string;
  capacity?: number;
  roomNumber?: string;
  classId: string;
  teacherId?: string;
  schoolId?: string;
  class?: ParentClass;
  teacher?: TeacherProfile;
  enrollments?: EnrollmentItem[];
  createdAt?: string;
}

interface PeriodItem {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subject: string;
  instructorId: string;
  sectionId: string;
  schoolId?: string;
  sessionId?: string;
  instructor?: {
    user?: {
      name?: string;
    };
  };
}

export const SectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Main States
  const [section, setSection] = useState<SectionDetailData | null>(null);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'instructor' | 'timetable'>('students');
  const [searchTerm, setSearchTerm] = useState('');

  // Timetable States
  const [periods, setPeriods] = useState<PeriodItem[]>([]);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('ALL');

  // Modal & Form States
  const [modalError, setModalError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    teacherId: '',
    capacity: 40,
    roomNumber: ''
  });

  const [isAddPeriodModalOpen, setIsAddPeriodModalOpen] = useState(false);
  const [periodForm, setPeriodForm] = useState({
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '09:45',
    subject: '',
    instructorId: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Section Details & Teachers List
  const fetchSectionDetails = async (showLoader = true) => {
    if (!id) return;
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const [sectionRes, teacherRes] = await Promise.allSettled([
        apiClient.get(`/sections/${id}`),
        apiClient.get('/teachers')
      ]);

      if (sectionRes.status === 'fulfilled' && sectionRes.value.data.success) {
        const data = sectionRes.value.data.data;
        setSection(data);
        setEditForm({
          title: data.title || '',
          teacherId: data.teacherId || data.teacher?.id || '',
          capacity: data.capacity || 40,
          roomNumber: data.roomNumber || ''
        });
      } else {
        showToast('Could not load section details', 'error');
      }

      if (teacherRes.status === 'fulfilled' && teacherRes.value.data.success) {
        setTeachers(teacherRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Error loading section details:', err);
      showToast('Error loading section details', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch Section Timetable Periods
  const fetchTimetable = async () => {
    if (!id) return;
    setTimetableLoading(true);
    try {
      const res = await apiClient.get(`/lecture/section/${id}`);
      if (res.data.success) {
        setPeriods(res.data.data || []);
      }
    } catch (err: any) {
      console.error('Error loading timetable:', err);
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
    if (!id || !editForm.title.trim()) {
      showToast('Section title is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.put(`/sections/${id}`, {
        title: editForm.title.trim(),
        teacherId: editForm.teacherId || undefined,
        capacity: Number(editForm.capacity) || 40,
        roomNumber: editForm.roomNumber.trim() || undefined
      });

      if (res.data.success) {
        showToast('Section updated successfully!');
        setIsEditModalOpen(false);
        fetchSectionDetails(false);
      } else {
        showToast(res.data.message || 'Failed to update section', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error updating section', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Section
  const handleDeleteSection = async () => {
    if (!id || !section) return;
    if (!window.confirm(`Are you sure you want to delete "${section.title}"? This cannot be undone.`)) return;

    try {
      const res = await apiClient.delete(`/sections/${id}`);
      if (res.data.success) {
        showToast('Section deleted successfully!');
        navigate(section.classId ? `/admin/classes/${section.classId}` : '/admin/classes');
      } else {
        showToast(res.data.message || 'Failed to delete section', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error deleting section', 'error');
    }
  };

  // Handle Add Timetable Period
  const handleAddPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !periodForm.subject.trim() || !periodForm.instructorId) {
      const msg = 'Subject Name and Instructor selection are required';
      setModalError(msg);
      showToast(msg, 'error');
      return;
    }

    setSubmitting(true);
    setModalError(null);
    try {
      const payload = {
        dayOfWeek: periodForm.dayOfWeek,
        startTime: periodForm.startTime,
        endTime: periodForm.endTime,
        subject: periodForm.subject.trim(),
        instructorId: periodForm.instructorId,
        sectionId: id,
        schoolId: section?.schoolId
      };

      const res = await apiClient.post('/lecture', payload);
      if (res.data.success) {
        showToast('Timetable period scheduled successfully!');
        setIsAddPeriodModalOpen(false);
        setModalError(null);
        setPeriodForm({
          dayOfWeek: 'MONDAY',
          startTime: '09:00',
          endTime: '09:45',
          subject: '',
          instructorId: ''
        });
        fetchTimetable();
      } else {
        const msg = res.data.message || 'Failed to schedule period';
        setModalError(msg);
        showToast(msg, 'error');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error scheduling period';
      setModalError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Period
  const handleDeletePeriod = async (periodId: string) => {
    if (!window.confirm('Are you sure you want to remove this timetable period?')) return;

    try {
      const res = await apiClient.delete(`/lecture/${periodId}`);
      if (res.data.success) {
        showToast('Period deleted!');
        fetchTimetable();
      } else {
        showToast(res.data.message || 'Failed to delete period', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error deleting period', 'error');
    }
  };

  // Handle Print Timetable (Day or Full Week)
  const handlePrintTimetable = (mode: 'day' | 'week') => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) {
      showToast('Popup blocked! Please allow popups to print timetable.', 'error');
      return;
    }

    const targetDay = selectedDayFilter;
    const daysList = (mode === 'day' && targetDay !== 'ALL')
      ? [targetDay]
      : ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

    const documentTitle = `Timetable_${section?.class?.title || 'Class'}_${section?.title || 'Section'}_${mode === 'day' ? targetDay : 'FullWeek'}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${documentTitle}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 32px; color: #0f172a; bg: #ffffff; }
            .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #4338ca; padding-bottom: 16px; }
            .header h1 { margin: 0; font-size: 26px; color: #312e81; font-weight: 800; tracking-tight; }
            .header p { margin: 6px 0 0; font-size: 13px; color: #64748b; font-weight: 600; }
            .meta-grid { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px; font-size: 12px; font-weight: 600; }
            .meta-item { display: flex; gap: 6px; }
            .meta-label { color: #64748b; }
            .meta-val { color: #0f172a; font-weight: 700; }
            .day-title { margin: 20px 0 10px; font-size: 15px; color: #4338ca; font-weight: 800; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; display: flex; align-items: center; gap: 8px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
            th { background-color: #f1f5f9; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .subject { font-weight: 700; color: #312e81; font-size: 13px; }
            .teacher { font-size: 11px; color: #059669; font-weight: 600; }
            .time { font-weight: 700; color: #2563eb; }
            .empty-msg { text-align: center; color: #94a3b8; font-style: italic; padding: 12px; }
            .footer { margin-top: 48px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px; }
            .sig-box { text-align: center; border-top: 1px solid #94a3b8; width: 180px; padding-top: 4px; font-weight: 600; color: #334155; }
            @media print {
              body { padding: 0; }
              @page { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CLASSORBIT ACADEMIC ROUTINE</h1>
            <p>Official Timetable Schedule Sheet</p>
          </div>

          <div class="meta-grid">
            <div class="meta-item"><span class="meta-label">Class:</span> <span class="meta-val">${section?.class?.title || 'Class'}</span></div>
            <div class="meta-item"><span class="meta-label">Section:</span> <span class="meta-val">${section?.title || 'Section'}</span></div>
            <div class="meta-item"><span class="meta-label">Section Instructor:</span> <span class="meta-val">${section?.teacher?.user?.name || 'Unassigned'}</span></div>
            <div class="meta-item"><span class="meta-label">Report Mode:</span> <span class="meta-val">${mode === 'day' ? `${targetDay} Routine` : 'Full Week Master Schedule'}</span></div>
          </div>

          ${daysList.map(day => {
            const dayPeriods = periods.filter(p => p.dayOfWeek === day);
            if (mode === 'week' && dayPeriods.length === 0) return '';
            return `
              <div>
                <div class="day-title">📅 ${day}</div>
                <table>
                  <thead>
                    <tr>
                      <th style="width: 25%;">Time Period</th>
                      <th style="width: 40%;">Subject Name</th>
                      <th style="width: 35%;">Assigned Instructor</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${dayPeriods.length === 0 ? `
                      <tr><td colspan="3" class="empty-msg">No classes scheduled for ${day}</td></tr>
                    ` : dayPeriods.map(p => `
                      <tr>
                        <td class="time">⏰ ${p.startTime} - ${p.endTime}</td>
                        <td class="subject">📘 ${p.subject}</td>
                        <td class="teacher">👨‍🏫 ${p.instructor?.user?.name || 'Assigned Instructor'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `;
          }).join('')}

          <div class="footer">
            <div>
              <div>Generated: ${new Date().toLocaleString()}</div>
              <div>ClassOrbit Smart School Management</div>
            </div>
            <div class="sig-box">
              Authorized Principal Signature
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Enrolled Students list
  const studentsList = (section?.enrollments || []).map(enr => ({
    enrollmentId: enr.id,
    studentId: enr.student?.id || '',
    name: enr.student?.user?.name || 'Unnamed Student',
    email: enr.student?.user?.email || 'No email',
    phone: enr.student?.user?.phone || 'N/A',
    enrolledAt: enr.createdAt
  }));

  const filteredStudents = studentsList.filter(st => 
    st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    st.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const enrolledCount = studentsList.length;
  const totalCapacity = section?.capacity || 40;
  const availableSeats = Math.max(0, totalCapacity - enrolledCount);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48"></div>
        <div className="h-32 bg-slate-200 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-28 bg-slate-200 rounded-2xl"></div>
          <div className="h-28 bg-slate-200 rounded-2xl"></div>
          <div className="h-28 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-12 shadow-sm">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Section Not Found</h3>
        <p className="text-slate-500 text-sm mb-6">The requested section could not be found or has been removed.</p>
        <Link
          to="/admin/classes"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-purple-600/20"
        >
          <ArrowLeft size={16} />
          Back to Classes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">

      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/admin/classes" className="hover:text-purple-600 transition-colors">Classes</Link>
        <ChevronRight size={12} />
        {section.class && (
          <>
            <Link to={`/admin/classes/${section.class.id}`} className="hover:text-purple-600 transition-colors">
              {section.class.title}
            </Link>
            <ChevronRight size={12} />
          </>
        )}
        <span className="text-slate-900 font-bold">{section.title}</span>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-900/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="p-3 bg-indigo-600/30 rounded-2xl border border-indigo-500/30 text-indigo-300">
              <Layers size={28} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-extrabold tracking-tight">{section.title}</h1>
                {section.class && (
                  <span className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold rounded-full flex items-center gap-1.5">
                    <BookOpen size={13} /> {section.class.title}
                  </span>
                )}
              </div>
              <p className="text-sm text-indigo-200/80 mt-1 flex items-center gap-3 flex-wrap">
                <span>Academic Section</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold text-white">
                  <MapPin size={13} className="text-indigo-300" />
                  Room: {section.roomNumber || 'Not Assigned'}
                </span>
                <span>•</span>
                <span>Instructor: <span className="font-bold text-white">{section.teacher?.user?.name || 'Unassigned'}</span></span>
              </p>
            </div>
          </div>
        </div>

        {/* Header Quick Actions */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 active:scale-95"
          >
            <Edit3 size={15} /> Edit Section
          </button>

          <button
            onClick={handleDeleteSection}
            className="p-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl border border-rose-800/40 transition-colors"
            title="Delete Section"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <GraduationCap size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Enrolled Students</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{enrolledCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <MapPin size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Room / Lab</span>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5 truncate max-w-[140px]">
              {section.roomNumber || 'Not Assigned'}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Users size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Seat Capacity / Free</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {enrolledCount} / {totalCapacity} <span className="text-xs text-emerald-600 font-semibold">({availableSeats} free)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <UserCheck size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Section Instructor</span>
            <div className="text-base font-bold text-slate-900 mt-0.5 truncate max-w-[160px]">
              {section.teacher?.id && section.teacher?.user?.name ? (
                <Link to={`/admin/teachers/${section.teacher.id}`} className="hover:text-purple-600 transition-colors">
                  {section.teacher.user.name}
                </Link>
              ) : (
                'Unassigned'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'students' 
                ? 'bg-white text-indigo-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap size={15} />
            Students Roster ({enrolledCount})
          </button>
          <button
            onClick={() => setActiveTab('instructor')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'instructor' 
                ? 'bg-white text-indigo-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck size={15} />
            Instructor & Info
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'timetable' 
                ? 'bg-white text-indigo-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock size={15} />
            Timetable & Schedule ({periods.length})
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {activeTab === 'students' && (
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
              />
            </div>
          )}

          <button
            onClick={() => fetchSectionDetails(false)}
            title="Refresh Details"
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* TAB 1: STUDENTS ROSTER */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <GraduationCap size={28} />
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-1">
                {searchTerm ? 'No matching students' : 'No students enrolled in this section'}
              </h4>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                {searchTerm 
                  ? `No students match "${searchTerm}".` 
                  : `Currently there are no active student enrollments for ${section.title}.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Enrollment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st, idx) => (
                    <tr key={st.enrollmentId || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-xs">
                            {st.name.charAt(0).toUpperCase()}
                          </div>
                          {st.studentId ? (
                            <Link to={`/admin/students/${st.studentId}`} className="hover:text-purple-600 transition-colors">
                              {st.name}
                            </Link>
                          ) : (
                            <span>{st.name}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{st.email}</td>
                      <td className="px-6 py-4 text-slate-600">{st.phone}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200 text-[11px]">
                          Enrolled
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {st.enrolledAt ? new Date(st.enrolledAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INSTRUCTOR & SECTION INFO */}
      {activeTab === 'instructor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Instructor Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserCheck className="text-indigo-600" size={18} />
                Assigned Section Instructor
              </h3>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Change Instructor
              </button>
            </div>

            {section.teacher ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 font-bold text-lg flex items-center justify-center border border-indigo-100">
                    {section.teacher.user?.name?.charAt(0).toUpperCase() || 'T'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{section.teacher.user?.name || 'Unnamed Teacher'}</h4>
                    <p className="text-xs text-slate-500">{section.teacher.specialization || 'General Faculty'}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail size={14} className="text-slate-400" />
                    <span>{section.teacher.user?.email || 'No email registered'}</span>
                  </div>
                  {section.teacher.user?.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={14} className="text-slate-400" />
                      <span>{section.teacher.user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                <p>No section instructor has been assigned yet.</p>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-semibold shadow-xs hover:bg-indigo-700 transition-colors"
                >
                  Assign Instructor Now
                </button>
              </div>
            )}
          </div>

          {/* Section Metadata Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Layers className="text-purple-600" size={18} />
                Section Configuration
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-600">Section Title:</span>
                <span className="font-bold text-slate-900">{section.title}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-600">Parent Academic Class:</span>
                <span className="font-bold text-purple-700">{section.class?.title || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-600">Max Capacity:</span>
                <span className="font-bold text-slate-900">{totalCapacity} Seats</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-600">Room / Lab Location:</span>
                <span className="font-bold text-indigo-700">{section.roomNumber || 'Not Assigned'}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-600">Creation Date:</span>
                <span className="font-bold text-slate-900">
                  {section.createdAt ? new Date(section.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TIMETABLE & SCHEDULE */}
      {activeTab === 'timetable' && (
        <div className="space-y-6">
          {/* Timetable Header & Day Filter */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
              {['ALL', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDayFilter(day)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedDayFilter === day
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
              <button
                onClick={() => handlePrintTimetable('week')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all active:scale-95"
                title="Print Complete Weekly Master Timetable Sheet"
              >
                <Printer size={15} className="text-indigo-600" />
                Print Timetable
              </button>

              <button
                onClick={() => {
                  setPeriodForm({
                    dayOfWeek: selectedDayFilter !== 'ALL' ? selectedDayFilter : 'MONDAY',
                    startTime: '09:00',
                    endTime: '09:45',
                    subject: '',
                    instructorId: section.teacherId || section.teacher?.id || teachers[0]?.id || ''
                  });
                  setIsAddPeriodModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 active:scale-95"
              >
                <Plus size={16} /> Schedule Period
              </button>
            </div>
          </div>

          {/* Timetable Grid / List */}
          {timetableLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4 animate-pulse">
              <div className="h-16 bg-slate-100 rounded-xl w-full"></div>
              <div className="h-16 bg-slate-100 rounded-xl w-full"></div>
            </div>
          ) : periods.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Clock size={32} />
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-1">No Timetable Periods Scheduled</h4>
              <p className="text-slate-500 text-xs max-w-sm mx-auto mb-6">
                Create subject schedules and assign teachers to time slots for {section.title}.
              </p>
              <button
                onClick={() => {
                  setPeriodForm({
                    dayOfWeek: 'MONDAY',
                    startTime: '09:00',
                    endTime: '09:45',
                    subject: '',
                    instructorId: section.teacherId || section.teacher?.id || teachers[0]?.id || ''
                  });
                  setIsAddPeriodModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20"
              >
                <Plus size={16} /> Schedule First Period
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Day</th>
                      <th className="px-6 py-4">Time Slot</th>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Assigned Instructor</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {periods
                      .filter(p => selectedDayFilter === 'ALL' || p.dayOfWeek === selectedDayFilter)
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">
                            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-[11px]">
                              {p.dayOfWeek}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-800">
                            <div className="flex items-center gap-1.5">
                              <Clock size={14} className="text-slate-400" />
                              <span>{p.startTime} - {p.endTime}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-indigo-700 text-sm">
                            {p.subject}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-700">
                            <div className="flex items-center gap-1.5">
                              <UserCheck size={14} className="text-emerald-600" />
                              <span>{p.instructor?.user?.name || 'Assigned Instructor'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeletePeriod(p.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Period"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: EDIT SECTION */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Edit3 className="text-indigo-600" size={20} />
                <h3>Edit Section</h3>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateSection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Section Title *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Section Instructor
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="w-full flex items-center justify-between px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800 bg-white data-[state=open]:border-indigo-300">
                      <span>{editForm.teacherId ? teachers.find(t => t.id === editForm.teacherId)?.user?.name || 'Unnamed Teacher' : "-- Select Instructor --"}</span>
                      <ChevronRight size={16} className="text-slate-400 rotate-90" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] p-1 max-h-64 overflow-y-auto">
                    <DropdownMenuItem onClick={() => setEditForm({ ...editForm, teacherId: '' })} className="cursor-pointer text-slate-500 italic">
                      -- Select Instructor --
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
                    Capacity Seats
                  </label>
                  <input
                    type="number"
                    value={editForm.capacity}
                    onChange={(e) => setEditForm({ ...editForm, capacity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Room No. / Lab
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Room 102"
                    value={editForm.roomNumber}
                    onChange={(e) => setEditForm({ ...editForm, roomNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
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
                  className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD TIMETABLE PERIOD */}
      {isAddPeriodModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Clock className="text-purple-600" size={20} />
                <h3>Schedule Timetable Period</h3>
              </div>
              <button 
                onClick={() => setIsAddPeriodModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddPeriod} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Day of Week *
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="w-full flex items-center justify-between px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800 bg-white data-[state=open]:border-purple-300">
                      <span>{periodForm.dayOfWeek || "-- Select Day --"}</span>
                      <ChevronRight size={16} className="text-slate-400 rotate-90" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] p-1">
                    {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(d => (
                      <DropdownMenuItem 
                        key={d} 
                        onClick={() => setPeriodForm({ ...periodForm, dayOfWeek: d })}
                        className="cursor-pointer"
                      >
                        {d}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Subject Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics"
                  value={periodForm.subject}
                  onChange={(e) => setPeriodForm({ ...periodForm, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Assigned Instructor *
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="w-full flex items-center justify-between px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800 bg-white data-[state=open]:border-purple-300">
                      <span>{periodForm.instructorId ? teachers.find(t => t.id === periodForm.instructorId)?.user?.name || 'Unnamed Teacher' : "-- Select Instructor --"}</span>
                      <ChevronRight size={16} className="text-slate-400 rotate-90" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] p-1 max-h-64 overflow-y-auto">
                    <DropdownMenuItem onClick={() => setPeriodForm({ ...periodForm, instructorId: '' })} className="cursor-pointer text-slate-500 italic">
                      -- Select Instructor --
                    </DropdownMenuItem>
                    {teachers.map(t => (
                      <DropdownMenuItem 
                        key={t.id} 
                        onClick={() => setPeriodForm({ ...periodForm, instructorId: t.id })}
                        className="cursor-pointer"
                      >
                        {t.user?.name || 'Unnamed Teacher'}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
                  {submitting ? 'Scheduling...' : 'Schedule Period'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification (z-[999999] at the bottom of DOM tree) */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[999999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
          toast.type === 'success' 
            ? 'bg-emerald-600 text-white shadow-emerald-600/30' 
            : 'bg-rose-600 text-white shadow-rose-600/30'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
            <X size={16} />
          </button>
        </div>
      )}

    </div>
  );
};
