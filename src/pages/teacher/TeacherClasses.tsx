import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Layers,
  Search,
  RefreshCw,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import { apiClient } from '../../api/axios';

interface ClassSection {
  id: string;
  title: string;
  class?: {
    id: string;
    title: string;
  };
  studentsCount?: number;
}

export const TeacherClasses: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/classes');
      const data = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      setClassesList(data);
    } catch (err) {
      console.error('Error fetching teacher classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const filteredClasses = classesList.filter(c => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return c.title?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              My Classes & Sections
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage your assigned academic classes, sections, and student roster
            </p>
          </div>
        </div>

        <button
          onClick={fetchClasses}
          className="p-2.5 text-slate-500 hover:text-purple-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          title="Refresh Classes"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search classes by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800 shadow-xs"
        />
      </div>

      {/* Class Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 bg-slate-200 rounded-3xl"></div>
          ))}
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-100">
            <BookOpen size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Classes Assigned</h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            You currently have no assigned academic classes matching your filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-extrabold">
                    Grade Level
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {item.sections ? `${item.sections.length} Sections` : '1 Section'}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Class Orbit Academic Program
                  </p>
                </div>

                {/* Section Pills */}
                {item.sections && item.sections.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {item.sections.map((sec: any) => (
                      <span
                        key={sec.id}
                        className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
                      >
                        Sec {sec.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  to="/teacher/students"
                  className="flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700"
                >
                  <Users size={14} /> View Students
                </Link>

                <Link
                  to="/teacher/attendance"
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                >
                  <ClipboardCheck size={14} /> Attendance
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
