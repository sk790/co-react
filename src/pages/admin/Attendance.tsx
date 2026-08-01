/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useMemo } from 'react';
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
  RefreshCw,
  Save,
  BookOpen,
  Layers,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '../../api/axios';
import { toast } from '../../store/toastStore';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';

interface EnrollmentInfo {
  id?: string;
  sectionId?: string;
  section?: {
    id: string;
    title: string;
    class?: {
      id: string;
      title: string;
    };
  };
}

interface UserRosterItem {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  enrollmentNo?: string;
  enrollments?: EnrollmentInfo[];
  teacherProfile?: {
    id?: string;
    specialization?: string;
    profileAvatar?: string;
    designation?: { title?: string };
    department?: { title?: string };
  };
  driverInfo?: Array<{
    id?: string;
    licenseNumber?: string;
  }>;
  attendanceId?: string | null;
  status?: AttendanceStatus | null;
  isMarked?: boolean;
  sectionId?: string | null;
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

  const isTeacherPortal = location.pathname.startsWith('/teacher');
  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'staff'>(defaultTab);

  useEffect(() => {
    if (isTeacherPortal) {
      setActiveTab('students');
    } else if (location.pathname.startsWith('/admin/attendance/teachers')) {
      setActiveTab('teachers');
    } else if (location.pathname.startsWith('/admin/attendance/staff')) {
      setActiveTab('staff');
    } else if (location.pathname.startsWith('/admin/attendance/students')) {
      setActiveTab('students');
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [location.pathname, defaultTab, isTeacherPortal]);

  // Date selection (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('ALL');

  // Master Data & Roster Lists
  const [classesList, setClassesList] = useState<ClassOption[]>([]);
  const [roster, setRoster] = useState<UserRosterItem[]>([]);

  // Attendance Records Map: [userId]: AttendanceStatus
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceStatus>>({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Compute available sections dynamically based on selectedClassId
  const availableSections = useMemo(() => {
    if (!selectedClassId || selectedClassId === 'ALL') {
      return [];
    }
    const targetClass = classesList.find((c) => c.id === selectedClassId);
    return targetClass?.sections || [];
  }, [classesList, selectedClassId]);

  // Fetch Attendance Roster Data from Backend
  const fetchData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      // 1. Fetch Class List if empty
      if (classesList.length === 0) {
        const classesRes = await apiClient.get('/classes');
        const rawClasses = Array.isArray(classesRes.data?.data)
          ? classesRes.data.data
          : Array.isArray(classesRes.data)
            ? classesRes.data
            : [];
        setClassesList(rawClasses);
      }

      // 2. Map activeTab to Role parameter
      let roleParam = 'STUDENT';
      if (activeTab === 'teachers') roleParam = 'TEACHER';
      else if (activeTab === 'staff') roleParam = 'STAFF';

      if (activeTab === 'students' && selectedSectionId === 'ALL') {
        setRoster([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const params: any = {
        date: selectedDate,
        role: roleParam,
      };

      if (activeTab === 'students' && selectedSectionId !== 'ALL') {
        params.sectionId = selectedSectionId;
      }

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      const res = await apiClient.get('/attendance', { params });

      if (res.data?.success && res.data?.data) {
        const { users = [] } = res.data.data;

        // Standardize IDs and Roster Items
        const formattedUsers: UserRosterItem[] = users.map((u: any) => ({
          ...u,
          id: u.userId || u.id,
          userId: u.userId || u.id,
        }));

        setRoster(formattedUsers);

        // Pre-fill local attendanceRecords map ONLY for users who have attendance marked in database
        const recMap: Record<string, AttendanceStatus> = {};
        formattedUsers.forEach((u) => {
          if (u.status) {
            recMap[u.userId] = u.status;
          }
        });
        setAttendanceRecords(recMap);
      }
    } catch (err: any) {
      console.error('Error fetching attendance data:', err);
      toast.error(
        err.response?.data?.message || 'Error fetching attendance data',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Re-fetch when date, activeTab, selectedClassId, or selectedSectionId changes
  useEffect(() => {
    fetchData(true);
  }, [selectedDate, activeTab, selectedClassId, selectedSectionId]);

  // Update Status for a single User
  const handleSetStatus = (userId: string, status: AttendanceStatus) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [userId]: status,
    }));
  };

  // Mark All Currently Filtered Users as Status
  const handleMarkAllAs = (status: AttendanceStatus) => {
    const targetIds = filteredRoster.map((u) => u.userId);

    setAttendanceRecords((prev) => {
      const updated = { ...prev };
      targetIds.forEach((id) => {
        updated[id] = status;
      });
      return updated;
    })
  };

  // Save Attendance to Backend
  const handleSaveAttendance = async () => {
    if (roster.length === 0) {
      toast.error('No users available to mark attendance for.');
      return;
    }

    setSaving(true);
    try {
      const records = roster.map((u) => {
        const st = attendanceRecords[u.userId] || 'PRESENT';
        const finalStatus = st === 'ON_LEAVE' ? 'HALF_DAY' : st;
        const secId =
          selectedSectionId !== 'ALL'
            ? selectedSectionId
            : u.sectionId || u.enrollments?.[0]?.section?.id;

        return {
          userId: u.userId,
          status: finalStatus,
          sectionId: secId || undefined,
        };
      });

      const payload = {
        date: selectedDate,
        records,
      };

      const res = await apiClient.post('/attendance', payload);

      if (res.data?.success) {
        toast.success(
          `${activeTab.toUpperCase()} attendance for ${selectedDate} saved successfully!`,
        );
        fetchData(false);
      }
    } catch (err: any) {
      console.error('Error saving attendance:', err);
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  // Client-side search and status filter
  const filteredRoster = roster.filter((u) => {
    const currentStatus = attendanceRecords[u.userId];
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'UNMARKED') {
        if (currentStatus) return false;
      } else if (currentStatus !== statusFilter) {
        return false;
      }
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEnroll = u.enrollmentNo?.toLowerCase().includes(q);
      const matchPhone = u.phone?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      return matchName || matchEnroll || matchPhone || matchEmail;
    }

    return true;
  });

  // Calculate local live metrics for current active tab
  const getTabStats = () => {
    const total = roster.length;
    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;
    let unmarked = 0;

    roster.forEach((item) => {
      const st = attendanceRecords[item.userId];
      if (st === 'PRESENT') present++;
      else if (st === 'ABSENT') absent++;
      else if (st === 'LATE') late++;
      else if (st === 'HALF_DAY' || st === 'ON_LEAVE') leave++;
      else unmarked++;
    });

    const markedTotal = present + absent + late + leave;
    const percent =
      markedTotal > 0
        ? Math.round(
          ((present + late * 0.5 + leave * 0.5) / markedTotal) * 100,
        )
        : 0;

    return { total, present, absent, late, leave, unmarked, percent };
  };

  const stats = getTabStats();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">

      {/* Main Header & Actions */}
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
            className="p-2.5 text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleSaveAttendance}
            disabled={saving || loading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 w-full sm:w-auto cursor-pointer"
          >
            <Save size={16} /> {saving ? 'Saving Records...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Subtab Navigation Pills (Students / Teachers / Staff) - Only shown in Admin Portal */}
      {!isTeacherPortal && (
        <div className="flex items-center p-1.5 bg-slate-200/70 backdrop-blur-xs rounded-2xl border border-slate-200/80 max-w-md">
          <button
            onClick={() => {
              setActiveTab('students');
              navigate('/admin/attendance/students');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${activeTab === 'students'
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
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${activeTab === 'teachers'
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
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${activeTab === 'staff'
              ? 'bg-white text-indigo-700 shadow-sm shadow-indigo-900/10'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <UserCheck size={16} />
            <span>Staff</span>
          </button>
        </div>
      )}

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
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              />
            </div>

            {/* Class Filter (Only visible for Students tab) */}
            {activeTab === 'students' && (
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                <BookOpen size={15} className="text-purple-600" />
                <span>Class:</span>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    setSelectedSectionId('ALL');
                  }}
                  className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Classes</option>
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Section Filter (Only visible for Students tab) */}
            {activeTab === 'students' && (
              <div
                className={`flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 transition-opacity ${selectedClassId === 'ALL' ? 'opacity-60' : ''
                  }`}
              >
                <Layers size={15} className="text-indigo-600" />
                <span>Section:</span>
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  disabled={selectedClassId === 'ALL'}
                  className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer disabled:cursor-not-allowed"
                >
                  {selectedClassId === 'ALL' ? (
                    <option value="ALL">Select Class First</option>
                  ) : (
                    <>
                      <option value="ALL">All Sections</option>
                      {availableSections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </>
                  )}
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
                <option value="PRESENT">PRESENT</option>
                <option value="ABSENT">ABSENT</option>
                <option value="LATE">LATE</option>
                <option value="HALF_DAY">HALF_DAY</option>
                <option value="UNMARKED">UNMARKED</option>
              </select>
            </div>
          </div>

          {/* Quick Mark All Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">
              Bulk Mark:
            </span>
            <button
              onClick={() => handleMarkAllAs('PRESENT')}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle2 size={13} /> Mark All Present
            </button>
            <button
              onClick={() => handleMarkAllAs('ABSENT')}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <XCircle size={13} /> Mark All Absent
            </button>
          </div>
        </div>

        {/* Search Field */}
        <div className="relative w-full">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
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
      {loading || refreshing ? (
        <LoadingState />
      ) : activeTab === 'students' ? (
        /* STUDENTS ATTENDANCE TABLE */
        selectedSectionId === 'ALL' ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
              <Layers size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Select Class & Section First
            </h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              Please select a Class and Section from the filters above to view and mark student attendance.
            </p>
          </div>
        ) : filteredRoster.length === 0 ? (
          <EmptyState title='No Record found!' />
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
                  {filteredRoster.map((s) => {
                    const st = attendanceRecords[s.userId];
                    const sName = s.name || 'Student';
                    const currentSelectedClass = classesList.find((c) => c.id === selectedClassId);
                    const currentSelectedSection = availableSections.find((sec) => sec.id === selectedSectionId);

                    const sClass =
                      s.enrollments?.[0]?.section?.class?.title ||
                      currentSelectedClass?.title ||
                      'N/A';
                    const sSection =
                      s.enrollments?.[0]?.section?.title ||
                      currentSelectedSection?.title?.split(' - ').pop() ||
                      'N/A';

                    return (
                      <tr
                        key={s.userId}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                              {sName.charAt(0).toUpperCase()}
                            </div>
                            <Link
                              to={`/admin/students/${s.userId}`}
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
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 w-fit ${st === 'PRESENT'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : st === 'ABSENT'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : st === 'LATE'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : st === 'HALF_DAY' || st === 'ON_LEAVE'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}
                          >
                            {st === 'PRESENT' && <CheckCircle2 size={13} />}
                            {st === 'ABSENT' && <XCircle size={13} />}
                            {st === 'LATE' && <Clock size={13} />}
                            {(st === 'HALF_DAY' || st === 'ON_LEAVE') && <Clock size={13} />}
                            {!st && <AlertCircle size={13} className="text-slate-400" />}
                            <span>
                              {st
                                ? st === 'HALF_DAY'
                                  ? 'HALF DAY'
                                  : st
                                : 'Not Marked'}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSetStatus(s.userId, 'PRESENT')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${st === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                            >
                              P
                            </button>
                            <button
                              onClick={() => handleSetStatus(s.userId, 'ABSENT')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${st === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                                }`}
                            >
                              A
                            </button>
                            <button
                              onClick={() => handleSetStatus(s.userId, 'LATE')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${st === 'LATE'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                                }`}
                            >
                              L
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
        filteredRoster.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-100">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              No Teacher Records Found
            </h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              No faculty members match your filter parameter for date {selectedDate}.
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
                  {filteredRoster.map((t) => {
                    const st = attendanceRecords[t.userId];
                    const tName = t.name || 'Teacher';
                    const deptTitle =
                      t.teacherProfile?.department?.title || 'Academics';
                    const code = t.teacherProfile?.id
                      ? t.teacherProfile.id.substring(0, 7).toUpperCase()
                      : 'FAC-101';

                    return (
                      <tr
                        key={t.userId}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                              {tName.charAt(0).toUpperCase()}
                            </div>
                            <Link
                              to={`/admin/teachers/${t.userId}`}
                              className="hover:text-purple-600 hover:underline"
                            >
                              {tName}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-indigo-600 whitespace-nowrap">
                          {code}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">
                          <div className="font-semibold">{deptTitle}</div>
                          <div className="text-[11px] text-slate-400">
                            {t.phone || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 w-fit ${st === 'PRESENT'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : st === 'ABSENT'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : st === 'LATE'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : st === 'HALF_DAY' || st === 'ON_LEAVE'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}
                          >
                            {st === 'PRESENT' && <CheckCircle2 size={13} />}
                            {st === 'ABSENT' && <XCircle size={13} />}
                            {st === 'LATE' && <Clock size={13} />}
                            {(st === 'HALF_DAY' || st === 'ON_LEAVE') && <Clock size={13} />}
                            {!st && <AlertCircle size={13} className="text-slate-400" />}
                            <span>
                              {st
                                ? st === 'HALF_DAY'
                                  ? 'HALF DAY'
                                  : st
                                : 'Not Marked'}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSetStatus(t.userId, 'PRESENT')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${st === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                            >
                              P
                            </button>
                            <button
                              onClick={() => handleSetStatus(t.userId, 'ABSENT')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${st === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                                }`}
                            >
                              A
                            </button>
                            <button
                              onClick={() => handleSetStatus(t.userId, 'LATE')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${st === 'LATE'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                                }`}
                            >
                              L
                            </button>
                            <button
                              onClick={() => handleSetStatus(t.userId, 'HALF_DAY')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${st === 'HALF_DAY' || st === 'ON_LEAVE'
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                                }`}
                            >
                              Half-Day
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
        filteredRoster.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
              <UserCheck size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              No Staff Records Found
            </h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              No staff members or drivers match your filter criteria for date {selectedDate}.
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
                  {filteredRoster.map((stItem) => {
                    const st = attendanceRecords[stItem.userId];
                    const stName = stItem.name || 'Staff Member';
                    const stRole = stItem.role || 'Staff / Transport Staff';

                    return (
                      <tr
                        key={stItem.userId}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                              {stName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-900">
                              {stName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700 whitespace-nowrap">
                          <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-800">
                            {stRole}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">
                          {stItem.phone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 w-fit ${st === 'PRESENT'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : st === 'ABSENT'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : st === 'LATE'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : st === 'HALF_DAY' || st === 'ON_LEAVE'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}
                          >
                            {st === 'PRESENT' && <CheckCircle2 size={13} />}
                            {st === 'ABSENT' && <XCircle size={13} />}
                            {st === 'LATE' && <Clock size={13} />}
                            {(st === 'HALF_DAY' || st === 'ON_LEAVE') && <Clock size={13} />}
                            {!st && <AlertCircle size={13} className="text-slate-400" />}
                            <span>
                              {st
                                ? st === 'HALF_DAY'
                                  ? 'HALF DAY'
                                  : st
                                : 'Not Marked'}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSetStatus(stItem.userId, 'PRESENT')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${st === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                            >
                              P
                            </button>
                            <button
                              onClick={() => handleSetStatus(stItem.userId, 'ABSENT')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${st === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                                }`}
                            >
                              A
                            </button>
                            <button
                              onClick={() => handleSetStatus(stItem.userId, 'LATE')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${st === 'LATE'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                                }`}
                            >
                              L
                            </button>
                            <button
                              onClick={() => handleSetStatus(stItem.userId, 'HALF_DAY')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${st === 'HALF_DAY' || st === 'ON_LEAVE'
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                                }`}
                            >
                              Half-Day
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
