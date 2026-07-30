import React, { useState, useEffect } from 'react';
import { GraduationCap, Search, RefreshCw, Mail, Phone, BookOpen, Layers } from 'lucide-react';
import { apiClient } from '../../api/axios';

export const TeacherStudents: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/students');
      const data = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students for teacher:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const nameMatch = s.user?.name?.toLowerCase().includes(q);
    const rollMatch = s.enrollmentNo?.toLowerCase().includes(q);
    return nameMatch || rollMatch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <GraduationCap size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Enrolled Students Directory
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              View students enrolled across your assigned classes and sections
            </p>
          </div>
        </div>

        <button
          onClick={fetchStudents}
          className="p-2.5 text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search students by name or roll number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 shadow-xs"
        />
      </div>

      {/* Table List */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 animate-pulse">
          <div className="h-10 bg-slate-100 rounded-xl"></div>
          <div className="h-10 bg-slate-100 rounded-xl"></div>
          <div className="h-10 bg-slate-100 rounded-xl"></div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <GraduationCap size={36} className="mx-auto text-indigo-400 mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Students Found</h3>
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
                  <th className="px-6 py-4">Contact Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => {
                  const sName = s.user?.name || 'Student';
                  const sClass = s.enrollments?.[0]?.section?.class?.title || 'Class 10';
                  const sSection = s.enrollments?.[0]?.section?.title || 'A';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                            {sName.charAt(0).toUpperCase()}
                          </div>
                          <span>{sName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-purple-700 whitespace-nowrap">
                        {s.enrollmentNo || 'STU-1001'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800">
                          {sClass} • Sec {sSection}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {s.user?.email || s.user?.phone || 'Parent Contact Available'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
