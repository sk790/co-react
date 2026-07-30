import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ClipboardCheck,
  GraduationCap,
  Users,
  UserCheck,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  X,
  RefreshCw,
  Save,
  Check,
  ChevronRight,
  BookOpen,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';
import { apiClient } from '../../api/axios';

interface StudentItem {
  id: string;
  enrollmentNo?: string;
  user?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  enrollments?: Array<{
    id: string;
    section?: {
      id: string;
      title: string;
      class?: {
        id: string;
        title: string;
      };
    };
  }>;
}

interface TeacherItem {
  id: string;
  employeeId?: string;
  department?: { id?: string; title?: string } | string;
  user?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

interface StaffItem {
  id: string;
  licenseNumber?: string;
  experienceYears?: number;
  user?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    role?: string;
  };
}

interface ClassOption {
  id: string;
  title: string;
  sections?: Array<{ id: string; title: string }>;
}

interface AttendanceProps {
  defaultTab?: 'students' | 'teachers' | 'staff';
}

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE';

export const Attendance: React.FC<AttendanceProps> = ({ defaultTab = 'students' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'staff'>(defaultTab);

  useEffect(() => {
    if (location.pathname.startsWith('/admin/attendance/teachers')) {
      setActiveTab('teachers');
    } else if (location.pathname.startsWith('/admin/attendance/staff')) {
      setActiveTab('staff');
    } else if (location.pathname.startsWith('/admin/attendance/students')) {
      setActiveTab('students');
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [location.pathname, defaultTab]);

  // Date selection (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');

  // Master Data & Entity Lists
  const [classesList, setClassesList] = useState<ClassOption[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [staff, setStaff] = useState<StaffItem[]>([]);

  // Attendance Records Map: [entityId]: AttendanceStatus
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceStatus>>({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Entities Data
  const fetchData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const [studentsRes, teachersRes, staffRes, classesRes] = await Promise.allSettled([
        apiClient.get('/students'),
        apiClient.get('/teachers'),
        apiClient.get('/drivers'),
        apiClient.get('/classes')
      ]);

      let initialRecords: Record<string, AttendanceStatus> = { ...attendanceRecords };

      if (studentsRes.status === 'fulfilled') {
        const raw = studentsRes.value.data;
        const fetchedStudents = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
        setStudents(fetchedStudents);
        fetchedStudents.forEach((s: StudentItem) => {
          if (!initialRecords[s.id]) initialRecords[s.id] = 'PRESENT';
        });
      }

      if (teachersRes.status === 'fulfilled') {
        const raw = teachersRes.value.data;
        const fetchedTeachers = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
        setTeachers(fetchedTeachers);
        fetchedTeachers.forEach((t: TeacherItem) => {
          if (!initialRecords[t.id]) initialRecords[t.id] = 'PRESENT';
        });
      }

      if (staffRes.status === 'fulfilled') {
        const raw = staffRes.value.data;
        const fetchedStaff = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
        setStaff(fetchedStaff);
        fetchedStaff.forEach((st: StaffItem) => {
          if (!initialRecords[st.id]) initialRecords[st.id] = 'PRESENT';
        });
      }

      if (classesRes.status === 'fulfilled') {
        const raw = classesRes.value.data;
        const fetchedClasses = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
        setClassesList(fetchedClasses);
      }

      setAttendanceRecords(initialRecords);
    } catch (err: any) {
      console.error('Error fetching attendance data:', err);
      showToast(err.response?.data?.message || 'Error fetching attendance data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  // Update Status for an Entity
  const handleSetStatus = (id: string, status: AttendanceStatus) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [id]: status
    }));
  };

  // Mark All Currently Filtered as Status
  const handleMarkAllAs = (status: AttendanceStatus) => {
    let targetIds: string[] = [];
    if (activeTab === 'students') targetIds = filteredStudents.map(s => s.id);
    else if (activeTab === 'teachers') targetIds = filteredTeachers.map(t => t.id);
    else if (activeTab === 'staff') targetIds = filteredStaff.map(s => s.id);

    setAttendanceRecords(prev => {
      const updated = { ...prev };
      targetIds.forEach(id => {
        updated[id] = status;
      });
      return updated;
    });

    showToast(`Marked all ${activeTab} as ${status}`);
  };

  // Save Attendance
  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      // Simulate saving attendance payload
      await new Promise(res => setTimeout(res, 800));
      showToast(`${activeTab.toUpperCase()} attendance for ${selectedDate} saved successfully!`);
    } catch (err: any) {
      showToast('Failed to save attendance', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Filter Logic
  const filteredStudents = students.filter(s => {
    if (selectedClassId !== 'ALL') {
      const studentClassId = s.enrollments?.[0]?.section?.class?.id;
      if (studentClassId !== selectedClassId) return false;
    }

    const currentStatus = attendanceRecords[s.id] || 'PRESENT';
    if (statusFilter !== 'ALL' && currentStatus !== statusFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = s.user?.name?.toLowerCase().includes(q);
      const matchRoll = s.enrollmentNo?.toLowerCase().includes(q);
      return matchName || matchRoll;
    }
    return true;
  });

  const filteredTeachers = teachers.filter(t => {
    const currentStatus = attendanceRecords[t.id] || 'PRESENT';
    if (statusFilter !== 'ALL' && currentStatus !== statusFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = t.user?.name?.toLowerCase().includes(q);
      const matchEmp = t.employeeId?.toLowerCase().includes(q);
      const deptStr = typeof t.department === 'object' ? t.department?.title : t.department;
      const matchDept = deptStr?.toLowerCase().includes(q);
      return matchName || matchEmp || matchDept;
    }
    return true;
  });

  const filteredStaff = staff.filter(st => {
    const currentStatus = attendanceRecords[st.id] || 'PRESENT';
    if (statusFilter !== 'ALL' && currentStatus !== statusFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = st.user?.name?.toLowerCase().includes(q);
      const matchPhone = st.user?.phone?.toLowerCase().includes(q);
      return matchName || matchPhone;
    }
    return true;
  });

  // Calculate Metrics based on active tab
  const getTabStats = () => {
    let items: Array<{ id: string }> = [];
    if (activeTab === 'students') items = students;
    else if (activeTab === 'teachers') items = teachers;
    else items = staff;

    const total = items.length;
    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;

    items.forEach(item => {
      const st = attendanceRecords[item.id] || 'PRESENT';
      if (st === 'PRESENT') present++;
      else if (st === 'ABSENT') absent++;
      else if (st === 'LATE') late++;
      else if (st === 'HALF_DAY' || st === 'ON_LEAVE') leave++;
    });

    const percent = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, late, leave, percent };
  };

  const stats = getTabStats();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
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

      {/* Main Header & Subtabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <ClipboardCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Attendance Tracker
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Mark and track daily attendance records for students, teachers, and staff members
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => fetchData(false)}
            className="p-2.5 text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            title="Refresh List"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 w-full sm:w-auto"
          >
            <Save size={16} /> {saving ? 'Saving Records...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Subtab Navigation Pills (Students / Teachers / Staff) */}
      <div className="flex items-center p-1.5 bg-slate-200/70 backdrop-blur-xs rounded-2xl border border-slate-200/80 max-w-md">
        <button
          onClick={() => {
            setActiveTab('students');
            navigate('/admin/attendance/students');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === 'students'
              ? 'bg-white text-indigo-700 shadow-sm shadow-indigo-900/10'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap size={16} />
          <span>Students</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('teachers');
            navigate('/admin/attendance/teachers');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === 'teachers'
              ? 'bg-white text-indigo-700 shadow-sm shadow-indigo-900/10'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users size={16} />
          <span>Teachers</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('staff');
            navigate('/admin/attendance/staff');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === 'staff'
              ? 'bg-white text-indigo-700 shadow-sm shadow-indigo-900/10'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck size={16} />
          <span>Staff</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total</p>
            <h4 className="text-lg font-extrabold text-slate-900">{stats.total} Records</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Present</p>
            <h4 className="text-lg font-extrabold text-emerald-600">{stats.present}</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <XCircle size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Absent</p>
            <h4 className="text-lg font-extrabold text-rose-600">{stats.absent}</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Late / Leave</p>
            <h4 className="text-lg font-extrabold text-amber-600">{stats.late + stats.leave}</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 col-span-2 lg:col-span-1">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Presence Rate</p>
            <h4 className="text-lg font-extrabold text-purple-600">{stats.percent}%</h4>
          </div>
        </div>
      </div>

      {/* Date & Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Selector */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
              <Calendar size={15} className="text-indigo-600" />
              <span>Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none"
              />
            </div>

            {/* Class Filter (Only visible for Students tab) */}
            {activeTab === 'students' && (
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                <BookOpen size={15} className="text-purple-600" />
                <span>Class:</span>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Classes</option>
                  {classesList.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
              <Filter size={14} className="text-slate-400" />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="PRESENT">Present Only</option>
                <option value="ABSENT">Absent Only</option>
                <option value="LATE">Late Only</option>
                <option value="ON_LEAVE">On Leave / Half-Day</option>
              </select>
            </div>
          </div>

          {/* Quick Mark All Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">Bulk Mark:</span>
            <button
              onClick={() => handleMarkAllAs('PRESENT')}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
            >
              <CheckCircle2 size={13} /> Mark All Present
            </button>
            <button
              onClick={() => handleMarkAllAs('ABSENT')}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
            >
              <XCircle size={13} /> Mark All Absent
            </button>
          </div>
        </div>

        {/* Search Field */}
        <div className="relative w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab} by name, roll no, phone or details...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
          />
        </div>
      </div>

      {/* Attendance Tables */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 animate-pulse">
          <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
          <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
          <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
        </div>
      ) : activeTab === 'students' ? (
        /* STUDENTS ATTENDANCE TABLE */
        filteredStudents.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
              <GraduationCap size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Student Records Found</h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              No students match the current filters or search criteria.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider text-[11px]">
                  <tr>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Roll / Enrollment No</th>
                    <th className="px-6 py-4">Class & Section</th>
                    <th className="px-6 py-4">Attendance Status</th>
                    <th className="px-6 py-4 text-right">Quick Mark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s) => {
                    const st = attendanceRecords[s.id] || 'PRESENT';
                    const sName = s.user?.name || 'Student';
                    const sClass = s.enrollments?.[0]?.section?.class?.title || 'N/A';
                    const sSection = s.enrollments?.[0]?.section?.title || 'N/A';

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                              {sName.charAt(0).toUpperCase()}
                            </div>
                            <Link
                              to={`/admin/students/${s.id}`}
                              className="hover:text-indigo-600 hover:underline"
                            >
                              {sName}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-purple-700 whitespace-nowrap">
                          {s.enrollmentNo || 'N/A'}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">
                          <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold">
                            {sClass} • Sec {sSection}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 w-fit ${
                            st === 'PRESENT'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : st === 'ABSENT'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : st === 'LATE'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {st === 'PRESENT' && <CheckCircle2 size={13} />}
                            {st === 'ABSENT' && <XCircle size={13} />}
                            {st === 'LATE' && <Clock size={13} />}
                            <span>{st}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSetStatus(s.id, 'PRESENT')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                                st === 'PRESENT'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                              }`}
                            >
                              P
                            </button>
                            <button
                              onClick={() => handleSetStatus(s.id, 'ABSENT')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                                st === 'ABSENT'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                              }`}
                            >
                              A
                            </button>
                            <button
                              onClick={() => handleSetStatus(s.id, 'LATE')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                                st === 'LATE'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                              }`}
                            >
                              L
                            </button>
                            <button
                              onClick={() => handleSetStatus(s.id, 'ON_LEAVE')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                                st === 'ON_LEAVE' || st === 'HALF_DAY'
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                              }`}
                            >
                              Leave
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : activeTab === 'teachers' ? (
        /* TEACHERS ATTENDANCE TABLE */
        filteredTeachers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-100">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Teacher Records Found</h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              No faculty members match your filter parameter.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider text-[11px]">
                  <tr>
                    <th className="px-6 py-4">Teacher Name</th>
                    <th className="px-6 py-4">Employee Code</th>
                    <th className="px-6 py-4">Department / Phone</th>
                    <th className="px-6 py-4">Attendance Status</th>
                    <th className="px-6 py-4 text-right">Quick Mark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTeachers.map((t) => {
                    const st = attendanceRecords[t.id] || 'PRESENT';
                    const tName = t.user?.name || 'Teacher';
                    const deptTitle = typeof t.department === 'object' ? t.department?.title : t.department || 'Academics';

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                              {tName.charAt(0).toUpperCase()}
                            </div>
                            <Link
                              to={`/admin/teachers/${t.id}`}
                              className="hover:text-purple-600 hover:underline"
                            >
                              {tName}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-indigo-600 whitespace-nowrap">
                          {t.employeeId || 'FAC-101'}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">
                          <div className="font-semibold">{deptTitle}</div>
                          <div className="text-[11px] text-slate-400">{t.user?.phone || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 w-fit ${
                            st === 'PRESENT'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : st === 'ABSENT'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : st === 'LATE'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {st === 'PRESENT' && <CheckCircle2 size={13} />}
                            {st === 'ABSENT' && <XCircle size={13} />}
                            {st === 'LATE' && <Clock size={13} />}
                            <span>{st}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSetStatus(t.id, 'PRESENT')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                                st === 'PRESENT'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                              }`}
                            >
                              P
                            </button>
                            <button
                              onClick={() => handleSetStatus(t.id, 'ABSENT')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                                st === 'ABSENT'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                              }`}
                            >
                              A
                            </button>
                            <button
                              onClick={() => handleSetStatus(t.id, 'LATE')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                                st === 'LATE'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                              }`}
                            >
                              L
                            </button>
                            <button
                              onClick={() => handleSetStatus(t.id, 'ON_LEAVE')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                                st === 'ON_LEAVE'
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                              }`}
                            >
                              Leave
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* STAFF ATTENDANCE TABLE */
        filteredStaff.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
              <UserCheck size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Staff Records Found</h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              No staff members or drivers match your filter criteria.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider text-[11px]">
                  <tr>
                    <th className="px-6 py-4">Staff / Driver Name</th>
                    <th className="px-6 py-4">Role / Designation</th>
                    <th className="px-6 py-4">Contact Phone</th>
                    <th className="px-6 py-4">Attendance Status</th>
                    <th className="px-6 py-4 text-right">Quick Mark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.map((stItem) => {
                    const st = attendanceRecords[stItem.id] || 'PRESENT';
                    const stName = stItem.user?.name || 'Staff Member';
                    const stRole = stItem.user?.role || 'Driver / Transport Staff';

                    return (
                      <tr key={stItem.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                              {stName.charAt(0).toUpperCase()}
                            </div>
                            <Link
                              to={`/admin/transport/drivers/${stItem.id}`}
                              className="hover:text-amber-600 hover:underline"
                            >
                              {stName}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700 whitespace-nowrap">
                          <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-800">
                            {stRole}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">
                          {stItem.user?.phone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 w-fit ${
                            st === 'PRESENT'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : st === 'ABSENT'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : st === 'LATE'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {st === 'PRESENT' && <CheckCircle2 size={13} />}
                            {st === 'ABSENT' && <XCircle size={13} />}
                            {st === 'LATE' && <Clock size={13} />}
                            <span>{st}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSetStatus(stItem.id, 'PRESENT')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                                st === 'PRESENT'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                              }`}
                            >
                              P
                            </button>
                            <button
                              onClick={() => handleSetStatus(stItem.id, 'ABSENT')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                                st === 'ABSENT'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                              }`}
                            >
                              A
                            </button>
                            <button
                              onClick={() => handleSetStatus(stItem.id, 'LATE')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                                st === 'LATE'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                              }`}
                            >
                              L
                            </button>
                            <button
                              onClick={() => handleSetStatus(stItem.id, 'ON_LEAVE')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                                st === 'ON_LEAVE'
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                              }`}
                            >
                              Leave
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
};
