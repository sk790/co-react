import React, { useState, useEffect } from 'react';
import { Clock, Calendar, MapPin, RefreshCw, ChevronDown, LayoutGrid, List, Users } from 'lucide-react';
import { apiClient } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { LoadingState } from '@/components/LoadingState';

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
    capacity?: number;
    roomNumber?: string;
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
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      if (user?.id) {
        try {
          const directRes = await apiClient.get(`/lecture/teacher/${user.teacherProfileId}?day=${selectedDay}`);
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
      setPeriods(periods);
    } catch (err) {
      console.error('Error fetching teacher timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [user, selectedDay]);

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

      {/* Controls: Day Selector & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Day Selector Dropdown */}
        <div className="w-full sm:w-64">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-extrabold text-slate-700 shadow-xs hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-purple-600/20"
              >
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="text-purple-600" />
                  <span>{selectedDay}</span>
                </div>
                <ChevronDown size={16} className="text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl z-50">
              {days.map((day) => (
                <DropdownMenuItem
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center justify-between ${selectedDay === day
                      ? 'bg-purple-50 text-purple-600 font-extrabold'
                      : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <span>{day}</span>
                  {selectedDay === day && (
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('card')}
            className={`flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'card'
                ? 'bg-white text-purple-600 shadow-xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Card View"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-white text-purple-600 shadow-xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="List View"
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Schedule Period Cards / List */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Calendar size={18} className="text-purple-600" />
          <span>{selectedDay} Schedule ({currentDayPeriods.length} Periods)</span>
        </h3>

        {loading ? (
          <LoadingState message='Loading timetable...'  />
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
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentDayPeriods.map((item, idx) => {
              const classTitle = item.section?.class?.title || 'Class';
              const sectionTitle = item.section?.title || 'Sec';
              const subjectName = item.subject || 'Subject';
              const roomNumber = item.section?.roomNumber ? `Room ${item.section.roomNumber}` : 'No Room';
              const capacity = item.section?.capacity ? `${item.section.capacity} Capacity` : null;

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
                      {classTitle} • {sectionTitle}
                    </p>
                    <div className="text-xs text-slate-500 flex items-center gap-3 mt-1.5 font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-slate-400" />
                        {roomNumber}
                      </span>
                      {capacity && (
                        <span className="flex items-center gap-1 text-slate-400 border-l border-slate-200 pl-3">
                          <Users size={13} />
                          {capacity}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
            {currentDayPeriods.map((item, idx) => {
              const classTitle = item.section?.class?.title || 'Class';
              const sectionTitle = item.section?.title || 'Sec';
              const subjectName = item.subject || 'Subject';
              const roomNumber = item.section?.roomNumber ? `Room ${item.section.roomNumber}` : 'No Room';
              const capacity = item.section?.capacity ? `${item.section.capacity} Capacity` : null;

              return (
                <div
                  key={item.id || idx}
                  className="p-4 sm:px-6 hover:bg-slate-50/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100 font-black text-xs flex items-center justify-center shrink-0">
                      P{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-extrabold text-slate-900 truncate">{subjectName}</h4>
                      <p className="text-xs font-medium text-slate-500">
                        {classTitle} • {sectionTitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 shrink-0 text-xs">
                    <div className="flex items-center gap-3 text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-slate-400" />
                        <span>{roomNumber}</span>
                      </span>
                      {capacity && (
                        <span className="hidden md:flex items-center gap-1 text-slate-400 border-l border-slate-200 pl-3">
                          <Users size={13} />
                          <span>{capacity}</span>
                        </span>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl text-xs font-bold">
                      {item.startTime} - {item.endTime}
                    </span>
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
