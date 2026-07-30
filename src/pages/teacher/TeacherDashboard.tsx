import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Clock,
  ClipboardCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../api/axios';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [classesCount, setClassesCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [todayClasses, setTodayClasses] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const todayEnum = dayNames[new Date().getDay()];

      // Fetch teachers directory to identify specific logged-in teacher profile ID
      const teachersRes = await apiClient.get('/teachers');
      const rawTeachers = teachersRes.data;
      const teachersList = Array.isArray(rawTeachers?.data) ? rawTeachers.data : (Array.isArray(rawTeachers) ? rawTeachers : []);

      const teacherProfile = teachersList.find((t: any) =>
        t.user?.id === user?.id || t.userId === user?.id || t.user?.email === user?.email
      );

      if (teacherProfile?.id) {
        // Fetch SPECIFIC teacher detail and SPECIFIC teacher timetable by teacher ID
        const [detailRes, timetableRes] = await Promise.allSettled([
          apiClient.get(`/teachers/${teacherProfile.id}`),
          apiClient.get(`/timetable/teacher/${teacherProfile.id}`)
        ]);

        if (detailRes.status === 'fulfilled') {
          const rawDetail = detailRes.value.data;
          const detail = rawDetail?.data || rawDetail || {};
          const assignedSections = detail.sections || teacherProfile.sections || [];
          setClassesCount(assignedSections.length);

          let count = 0;
          assignedSections.forEach((s: any) => {
            const sec = s.section || s;
            if (sec._count?.students) count += sec._count.students;
            else if (sec.studentsCount) count += sec.studentsCount;
          });
          setStudentsCount(count);
        } else {
          setClassesCount(teacherProfile.sections?.length || 0);
        }

        if (timetableRes.status === 'fulfilled') {
          const rawTT = timetableRes.value.data;
          const periods = Array.isArray(rawTT?.data) ? rawTT.data : (Array.isArray(rawTT) ? rawTT : []);
          const todayPeriods = periods.filter((p: any) => p.dayOfWeek === todayEnum);
          setTodayClasses(todayPeriods);
        }
      } else {
        setClassesCount(0);
        setTodayClasses([]);
      }
    } catch (err) {
      console.error('Error loading specific teacher dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-pulse">
        <div className="h-36 bg-slate-200 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 lg:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-purple-300 uppercase tracking-wider bg-purple-500/20 px-3 py-1 rounded-full w-fit border border-purple-500/30">
              <Sparkles size={14} /> Faculty Dashboard
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
              Welcome back, {user?.name || 'Teacher'}! 👋
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 max-w-xl font-medium">
              You have {todayClasses.length} lectures scheduled for today. Keep track of attendance, timetable, and student academic progress.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/teacher/attendance"
              className="flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-purple-600/30 active:scale-95"
            >
              <ClipboardCheck size={16} /> Take Attendance
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Assigned Classes</p>
            <h4 className="text-xl font-extrabold text-slate-900">{classesCount} Classes</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Students</p>
            <h4 className="text-xl font-extrabold text-indigo-600">{studentsCount} Students</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Today's Lectures</p>
            <h4 className="text-xl font-extrabold text-amber-600">{todayClasses.length} Periods</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Avg Attendance</p>
            <h4 className="text-xl font-extrabold text-emerald-600">Active</h4>
          </div>
        </div>
      </div>

      {/* Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Clock size={20} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Today's Teaching Schedule</h3>
              </div>
              <Link
                to="/teacher/timetable"
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                Full Timetable <ArrowRight size={14} />
              </Link>
            </div>

            {todayClasses.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">No periods scheduled for today.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayClasses.map((item, idx) => {
                  const classTitle = item.section?.class?.title || 'Class';
                  const secTitle = item.section?.title || 'Sec';
                  const subjectName = item.subject || 'Subject';

                  return (
                    <div
                      key={item.id || idx}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-purple-200 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-purple-600 font-bold text-xs">
                          <Clock size={16} />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">
                            {classTitle} • Section {secTitle}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {subjectName} • Period {idx + 1} • {item.startTime} - {item.endTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to="/teacher/attendance"
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                          Attendance
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links & Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
              Faculty Shortcuts
            </h3>

            <div className="space-y-2">
              <Link
                to="/teacher/classes"
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 rounded-2xl border border-slate-200 transition-all text-xs font-bold text-slate-800 hover:text-purple-700 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl border border-slate-200 text-purple-600 group-hover:border-purple-200">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <p className="font-extrabold">My Classes & Sections</p>
                    <p className="text-[11px] font-normal text-slate-400">View enrolled students list</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-purple-600" />
              </Link>

              <Link
                to="/teacher/attendance"
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 rounded-2xl border border-slate-200 transition-all text-xs font-bold text-slate-800 hover:text-indigo-700 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl border border-slate-200 text-indigo-600 group-hover:border-indigo-200">
                    <ClipboardCheck size={16} />
                  </div>
                  <div>
                    <p className="font-extrabold">Daily Attendance</p>
                    <p className="text-[11px] font-normal text-slate-400">Mark student attendance</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600" />
              </Link>

              <Link
                to="/teacher/students"
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 rounded-2xl border border-slate-200 transition-all text-xs font-bold text-slate-800 hover:text-emerald-700 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl border border-slate-200 text-emerald-600 group-hover:border-emerald-200">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="font-extrabold">Student Profiles</p>
                    <p className="text-[11px] font-normal text-slate-400">Search student directory</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-emerald-600" />
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-purple-950 text-white rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-xl">
                <Bell size={20} className="text-amber-400" />
              </div>
              <h3 className="font-extrabold text-base">Academic Notice</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Mid-term examinations start next week. Please complete class attendance and submit internal marks assessment on time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
