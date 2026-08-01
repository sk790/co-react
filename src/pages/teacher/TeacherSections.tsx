import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Users,
  Search,
  MapPin,
  GraduationCap,
  ChevronRight,
  ClipboardCheck,
  BookOpen,
  Grid,
  List,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

interface TeacherUser {
  name?: string;
}

interface TeacherProfile {
  id: string;
  user?: TeacherUser;
}

interface EnrollmentItem {
  id: string;
}

interface SectionItem {
  id: string;
  title: string;
  capacity?: number;
  roomNumber?: string;
  teacher?: TeacherProfile;
  enrollments?: EnrollmentItem[];
  classId?: string;
  classTitle?: string;
}

interface ClassItem {
  id: string;
  title: string;
  sections?: SectionItem[];
}

export const TeacherSections: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const fetchTeacherSections = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const teacherId = user?.teacherProfileId;
      const res = await apiClient.get(`/classes?teacherId=${teacherId}`);
      const rawClasses: ClassItem[] = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);

      const secList: SectionItem[] = [];
      rawClasses.forEach(cls => {
        if (cls.sections && Array.isArray(cls.sections)) {
          cls.sections.forEach(sec => {
            secList.push({
              ...sec,
              classId: cls.id,
              classTitle: cls.title
            });
          });
        }
      });

      setSections(secList);
    } catch (err) {
      console.error('Error fetching teacher sections:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeacherSections(true);
  }, [user]);

  const filteredSections = sections.filter(sec => {
    const title = sec.title || '';
    const classTitle = sec.classTitle || '';
    const room = sec.roomNumber || '';
    const query = searchTerm.toLowerCase();
    return title.toLowerCase().includes(query) || classTitle.toLowerCase().includes(query) || room.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
            <Layers size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Assigned Class Sections
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              View and manage all your assigned academic class sections and rosters
            </p>
          </div>
        </div>
      </div>

      {/* Filter & View Mode Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search section or class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => fetchTeacherSections(false)}
            className="p-2 text-slate-500 hover:text-purple-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Refresh Sections List"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>

          {/* Grid / List View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-purple-700 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid / Card View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-purple-700 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List / Table View"
            >
              <List size={16} />
            </button>
          </div>

          <span className="text-xs font-bold text-slate-500">
            {filteredSections.length} Sections
          </span>
        </div>
      </div>

      {/* Sections Data Render */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-slate-200 rounded-3xl"></div>
          ))}
        </div>
      ) : filteredSections.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-100">
            <Layers size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Class Sections Found</h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            {searchTerm ? 'No section matches your search criteria.' : 'There are currently no sections assigned to you.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID / CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSections.map(sec => {
            const studentCount = sec.enrollments?.length || 0;
            const capacity = sec.capacity || 40;

            return (
              <div
                key={sec.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-xl font-bold text-xs">
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                          {sec.title.toLowerCase().startsWith('section') ? sec.title : `Section ${sec.title}`}
                        </h3>
                        <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
                          Class: {sec.classTitle || 'Academic Class'}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-extrabold text-xs rounded-full border border-purple-200">
                      {sec.title}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <Users size={14} className="text-purple-500" /> Enrolled Students
                      </span>
                      <span className="font-bold text-slate-900">{studentCount} / {capacity}</span>
                    </div>

                    {sec.roomNumber && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                          <MapPin size={14} className="text-purple-500" /> Room / Lab
                        </span>
                        <span className="font-bold text-slate-900">{sec.roomNumber}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <GraduationCap size={14} className="text-purple-500" /> Instructor
                      </span>
                      <span className="font-bold text-slate-900 truncate max-w-[140px]">
                        {sec.teacher?.user?.name || user?.name || 'Assigned Teacher'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to="/teacher/attendance"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-purple-600 transition-colors"
                  >
                    <ClipboardCheck size={13} /> Attendance
                  </Link>

                  <Link
                    to={`/teacher/sections/${sec.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline"
                  >
                    Section Details <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST / TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Section</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4">Enrolled Ratio</th>
                <th className="px-6 py-4">Room / Lab</th>
                <th className="px-6 py-4">Faculty In-Charge</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSections.map((sec) => {
                const studentCount = sec.enrollments?.length || 0;
                const capacity = sec.capacity || 40;

                return (
                  <tr key={sec.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-extrabold rounded-lg border border-purple-200">
                        {sec.title.toLowerCase().startsWith('section') ? sec.title : `Section ${sec.title}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {sec.classTitle || 'Academic Class'}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {studentCount} / {capacity}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {sec.roomNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {sec.teacher?.user?.name || user?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-4 whitespace-nowrap">
                        <Link
                          to="/teacher/attendance"
                          className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-purple-600 transition-colors"
                        >
                          <ClipboardCheck size={14} />
                          <span>Attendance</span>
                        </Link>
                        <Link
                          to={`/teacher/sections/${sec.id}`}
                          className="inline-flex items-center gap-1 font-bold text-purple-600 hover:underline transition-colors"
                        >
                          <span>Details</span>
                          <ChevronRight size={14} />
                        </Link>
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
  );
};
