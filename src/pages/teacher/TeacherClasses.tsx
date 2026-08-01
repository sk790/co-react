import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { apiClient } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { ClassList, type ClassItem } from '../../components/ClassList';

export const TeacherClasses: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [classesList, setClassesList] = useState<ClassItem[]>([]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const teacherId = user?.teacherProfileId;
      const res = await apiClient.get(`/classes?teacherId=${teacherId}`);
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
  }, [user]);

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
      </div>

      {/* Reusable Class List Component */}
      <ClassList
        classes={classesList}
        loading={loading}
        initialViewMode="list"
        onRefresh={fetchClasses}
        getDetailLink={(cls) => `/teacher/classes/${cls.id}`}
        getStudentsLink={() => '/teacher/students'}
        getAttendanceLink={() => '/teacher/attendance'}
        emptyMessage="You currently have no assigned academic classes."
      />
    </div>
  );
};
