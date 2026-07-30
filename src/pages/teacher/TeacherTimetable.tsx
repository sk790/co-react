import React, { useState, useEffect } from 'react';
import { Clock, Calendar, BookOpen, MapPin, RefreshCw } from 'lucide-react';
import { apiClient } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

interface PeriodItem {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subject?: string;
  instructorId?: string;
  sectionId?: string;
  section?: {
    id: string;
    title: string;
    class?: {
      id: string;
      title: string;
    };
  };
  instructor?: {
    id: string;
    userId?: string;
    user?: {
      id: string;
      name: string;
    };
  };
}

export const TeacherTimetable: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [periods, setPeriods] = useState<PeriodItem[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      // 1. Fetch Teachers and School Timetable from Backend API
      const [teachersRes, timetableRes] = await Promise.allSettled([
        apiClient.get('/teachers'),
        apiClient.get('/timetable/school')
      ]);

      let teacherProfileId: string | null = null;

      if (teachersRes.status === 'fulfilled') {
        const raw = teachersRes.value.data;
        const teachersList = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
        const matched = teachersList.find((t: any) =>
          t.user?.id === user?.id || t.userId === user?.id || t.user?.email === user?.email
        );
        if (matched) {
          teacherProfileId = matched.id;
        }
      }

      let allPeriods: PeriodItem[] = [];

      if (timetableRes.status === 'fulfilled') {
        const raw = timetableRes.value.data;
        allPeriods = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
      }

      // If teacher profile or user is found, attempt dedicated endpoint or filter
      if (teacherProfileId) {
        try {
          const directRes = await apiClient.get(`/timetable/teacher/${teacherProfileId}`);
          const directData = Array.isArray(directRes.data?.data)
            ? directRes.data.data
            : (Array.isArray(directRes.data) ? directRes.data : []);
          if (directData.length > 0) {
            setPeriods(directData);
            return;
          }
        } catch (e) {
          // fallback to filtering allPeriods
        }
      }

      // Filter allPeriods for this teacher
      let teacherPeriods = allPeriods;
      if (teacherProfileId || user?.id) {
        const filtered = allPeriods.filter((p: PeriodItem) =>
          (teacherProfileId && p.instructorId === teacherProfileId) ||
          (user?.id && p.instructor?.userId === user.id)
        );
        if (filtered.length > 0) {
          teacherPeriods = filtered;
        }
      }

      setPeriods(teacherPeriods);
    } catch (err) {
      console.error('Error fetching teacher timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [user]);

  // Filter periods for the currently selected day
  const currentDayPeriods = periods.filter((p) => {
    if (!p.dayOfWeek) return false;
    return p.dayOfWeek.toUpperCase() === selectedDay.toUpperCase();
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
            <Clock size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              My Teaching Timetable
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Real-time assigned periods, subject schedules, and classroom locations
            </p>
          </div>
        </div>

        <button
          onClick={fetchTimetable}
          className="p-2.5 text-slate-500 hover:text-purple-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          title="Refresh Timetable"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap ${selectedDay === day
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Schedule Period Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Calendar size={18} className="text-purple-600" />
          <span>{selectedDay} Schedule ({currentDayPeriods.length} Periods)</span>
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            <div className="h-32 bg-slate-200 rounded-3xl"></div>
            <div className="h-32 bg-slate-200 rounded-3xl"></div>
          </div>
        ) : currentDayPeriods.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs space-y-2">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto border border-purple-100">
              <Clock size={24} />
            </div>
            <h4 className="text-base font-bold text-slate-900">No Periods Scheduled</h4>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              There are no assigned periods for {selectedDay} in your timetable schedule.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentDayPeriods.map((item, idx) => {
              const classTitle = item.section?.class?.title || 'Class';
              const sectionTitle = item.section?.title || 'Sec';
              const subjectName = item.subject || 'Subject';

              return (
                <div
                  key={item.id || idx}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex items-start gap-4"
                >
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100 font-black text-sm shrink-0">
                    P{idx + 1}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-purple-700">
                      {item.startTime} - {item.endTime}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 truncate">{subjectName}</h4>
                    <p className="text-xs font-bold text-slate-600">
                      {classTitle} • Section {sectionTitle}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin size={12} /> Class Section Room
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
