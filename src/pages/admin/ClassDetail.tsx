import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Layers, 
  Users, 
  UserCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Search,
  GraduationCap,
  Calendar,
  MoreVertical,
  ChevronRight,
  Grid,
  List
} from 'lucide-react';
import { apiClient } from '../../api/axios';

interface TeacherUser {
  name?: string;
  email?: string;
  phone?: string;
}

interface TeacherProfile {
  id: string;
  user?: TeacherUser;
}

interface StudentUser {
  name?: string;
  email?: string;
}

interface StudentItem {
  id: string;
  user?: StudentUser;
}

interface EnrollmentItem {
  id: string;
  student?: StudentItem;
  createdAt?: string;
}

interface SectionItem {
  id: string;
  title: string;
  capacity?: number;
  teacherId?: string;
  teacher?: TeacherProfile;
  enrollments?: EnrollmentItem[];
  createdAt?: string;
}

interface ClassDetailItem {
  id: string;
  title: string;
  description?: string;
  classTeacherId?: string;
  sections?: SectionItem[];
  createdAt?: string;
}

export const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Data States
  const [classData, setClassData] = useState<ClassDetailItem | null>(null);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'sections' | 'students'>('sections');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal & Form States
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [sectionForm, setSectionForm] = useState({
    title: '',
    teacherId: '',
    capacity: 40
  });

  const [editingSection, setEditingSection] = useState<SectionItem | null>(null);
  const [editSectionForm, setEditSectionForm] = useState({
    title: '',
    teacherId: '',
    capacity: 40
  });

  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const [editClassForm, setEditClassForm] = useState({
    title: '',
    description: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Class Details & Teachers List
  const fetchClassDetails = async (showLoader = true) => {
    if (!id) return;
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const [classRes, teacherRes] = await Promise.allSettled([
        apiClient.get(`/classes/${id}`),
        apiClient.get('/teachers')
      ]);

      if (classRes.status === 'fulfilled' && classRes.value.data.success) {
        const fetchedClass = classRes.value.data.data;
        setClassData(fetchedClass);
        setEditClassForm({
          title: fetchedClass.title || '',
          description: fetchedClass.description || ''
        });
      } else {
        showToast('Could not load class details', 'error');
      }

      if (teacherRes.status === 'fulfilled' && teacherRes.value.data.success) {
        setTeachers(teacherRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching class details:', err);
      showToast('Error loading class details', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClassDetails(true);
  }, [id]);

  // Handle Add Section
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !sectionForm.title.trim()) {
      showToast('Section title is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post('/sections', {
        classId: id,
        title: sectionForm.title.trim(),
        teacherId: sectionForm.teacherId || undefined,
        capacity: Number(sectionForm.capacity) || 40
      });

      if (res.data.success) {
        showToast(`Section "${sectionForm.title}" added successfully!`);
        setIsAddSectionModalOpen(false);
        setSectionForm({ title: '', teacherId: '', capacity: 40 });
        fetchClassDetails(false);
      } else {
        showToast(res.data.message || 'Failed to create section', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error adding section', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Update Section
  const handleUpdateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection || !editSectionForm.title.trim()) {
      showToast('Section title is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.put(`/sections/${editingSection.id}`, {
        title: editSectionForm.title.trim(),
        teacherId: editSectionForm.teacherId || undefined,
        capacity: Number(editSectionForm.capacity) || undefined
      });

      if (res.data.success) {
        showToast('Section updated successfully!');
        setEditingSection(null);
        fetchClassDetails(false);
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
  const handleDeleteSection = async (sectionId: string, sectionTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete section "${sectionTitle}"?`)) return;

    try {
      const res = await apiClient.delete(`/sections/${sectionId}`);
      if (res.data.success) {
        showToast(`Section "${sectionTitle}" deleted!`);
        fetchClassDetails(false);
      } else {
        showToast(res.data.message || 'Failed to delete section', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error deleting section', 'error');
    }
  };

  // Handle Update Class Details
  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !editClassForm.title.trim()) {
      showToast('Class title is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.put(`/classes/${id}`, {
        title: editClassForm.title.trim(),
        description: editClassForm.description.trim() || undefined
      });

      if (res.data.success) {
        showToast('Class details updated!');
        setIsEditClassModalOpen(false);
        fetchClassDetails(false);
      } else {
        showToast(res.data.message || 'Failed to update class', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error updating class', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Class
  const handleDeleteClass = async () => {
    if (!id || !classData) return;
    if (!window.confirm(`Are you sure you want to delete ${classData.title}? This action cannot be undone.`)) return;

    try {
      const res = await apiClient.delete(`/classes/${id}`);
      if (res.data.success) {
        showToast('Class deleted!');
        navigate('/admin/classes');
      } else {
        showToast(res.data.message || 'Failed to delete class', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error deleting class', 'error');
    }
  };

  // Consolidate enrolled students across all sections for the students tab
  const allStudents = (classData?.sections || []).flatMap(section => 
    (section.enrollments || []).map(enr => ({
      enrollmentId: enr.id,
      studentId: enr.student?.id || '',
      name: enr.student?.user?.name || 'Unnamed Student',
      email: enr.student?.user?.email || 'No email',
      sectionTitle: section.title,
      enrolledAt: enr.createdAt
    }))
  );

  const filteredStudents = allStudents.filter(st => 
    st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    st.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    st.sectionTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSections = (classData?.sections || []).filter(sec => 
    sec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sec.teacher?.user?.name && sec.teacher.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  if (!classData) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-12 shadow-sm">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Class Not Found</h3>
        <p className="text-slate-500 text-sm mb-6">The requested class could not be found or has been removed.</p>
        <Link
          to="/admin/classes"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-purple-600/20"
        >
          <ArrowLeft size={16} />
          Back to Classes List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
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

      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/admin/classes" className="hover:text-purple-600 flex items-center gap-1 transition-colors">
          <ArrowLeft size={14} /> Classes List
        </Link>
        <ChevronRight size={12} />
        <span className="text-slate-900 font-bold">{classData.title}</span>
      </div>

      {/* Class Details Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-purple-900/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="p-3 bg-purple-600/30 rounded-2xl border border-purple-500/30 text-purple-300">
              <BookOpen size={28} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight">{classData.title}</h1>
                <span className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold rounded-full">
                  {classData.sections?.length || 0} {classData.sections?.length === 1 ? 'Section' : 'Sections'}
                </span>
              </div>
              <p className="text-sm text-purple-200/80 mt-1 max-w-2xl">
                {classData.description || 'No specific description set for this academic class.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => {
              setSectionForm({ 
                title: `Section ${String.fromCharCode(65 + (classData.sections?.length || 0))}`, 
                teacherId: '', 
                capacity: 40 
              });
              setIsAddSectionModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/30 active:scale-95"
          >
            <Plus size={16} />
            Add Section
          </button>

          <button
            onClick={() => setIsEditClassModalOpen(true)}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors"
            title="Edit Class Details"
          >
            <Edit3 size={16} />
          </button>

          <button
            onClick={handleDeleteClass}
            className="p-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl border border-rose-800/40 transition-colors"
            title="Delete Class"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Layers size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Sections</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{classData.sections?.length || 0}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <GraduationCap size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Enrolled Students</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{allStudents.length}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <UserCheck size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned Instructors</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {classData.sections?.filter(s => s.teacher?.user?.name).length || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('sections')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'sections' 
                ? 'bg-white text-purple-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers size={15} />
            Sections ({classData.sections?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'students' 
                ? 'bg-white text-purple-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap size={15} />
            Enrolled Students ({allStudents.length})
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === 'sections' ? "Search sections..." : "Search students..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
            />
          </div>

          <button
            onClick={() => fetchClassDetails(false)}
            title="Refresh Details"
            className="p-2 text-slate-500 hover:text-purple-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>

          {activeTab === 'sections' && (
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid View"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="List View"
              >
                <List size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: SECTIONS LIST */}
      {activeTab === 'sections' && (
        <div className="space-y-4">
          {filteredSections.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Layers size={28} />
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-1">
                {searchTerm ? 'No matching sections' : 'No sections added yet'}
              </h4>
              <p className="text-slate-500 text-xs max-w-sm mx-auto mb-4">
                {searchTerm ? `No sections match "${searchTerm}".` : `Add your first section to organize students in ${classData.title}.`}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setIsAddSectionModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20"
                >
                  <Plus size={16} /> Add First Section
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            // GRID VIEW
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSections.map((sec) => (
                <div 
                  key={sec.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Section Card Header */}
                    <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                          <Layers size={18} />
                        </div>
                        <div>
                          <Link 
                            to={`/admin/sections/${sec.id}`}
                            className="font-bold text-slate-900 text-md hover:text-purple-600 transition-colors"
                          >
                            {sec.title}
                          </Link>
                          <span className="block text-[11px] text-slate-500">
                            Capacity: {sec.capacity || 40} seats
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingSection(sec);
                            setEditSectionForm({
                              title: sec.title,
                              teacherId: sec.teacherId || sec.teacher?.id || '',
                              capacity: sec.capacity || 40
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Section"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(sec.id, sec.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Section"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Section Instructor & Student Stats */}
                    <div className="p-5 space-y-4 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserCheck size={16} className="text-purple-600" />
                          <span className="font-semibold text-slate-700">Section Instructor:</span>
                        </div>
                        {sec.teacher?.id && sec.teacher?.user?.name ? (
                          <Link to={`/admin/teachers/${sec.teacher.id}`} className="font-bold text-slate-900 hover:text-purple-600 transition-colors">
                            {sec.teacher.user.name}
                          </Link>
                        ) : (
                          <span className="font-bold text-slate-900">Unassigned</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between px-1">
                        <span className="text-slate-500 font-semibold">Enrolled Students:</span>
                        <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                          {sec.enrollments?.length || 0} students
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Created: {sec.createdAt ? new Date(sec.createdAt).toLocaleDateString() : 'N/A'}</span>
                    <Link to={`/admin/sections/${sec.id}`} className="font-semibold text-purple-600 hover:underline">
                      Section Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // LIST / TABLE VIEW
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Section Title</th>
                      <th className="px-6 py-4">Section Instructor</th>
                      <th className="px-6 py-4">Enrolled Students</th>
                      <th className="px-6 py-4">Capacity</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSections.map((sec) => (
                      <tr key={sec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                              <Layers size={16} />
                            </div>
                            <Link to={`/admin/sections/${sec.id}`} className="hover:text-purple-600 transition-colors">
                              {sec.title}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {sec.teacher?.id && sec.teacher?.user?.name ? (
                            <Link to={`/admin/teachers/${sec.teacher.id}`} className="hover:text-purple-600 font-semibold transition-colors">
                              {sec.teacher.user.name}
                            </Link>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                            {sec.enrollments?.length || 0} students
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-semibold">
                          {sec.capacity || 40} Seats
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/admin/sections/${sec.id}`}
                              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg transition-colors"
                            >
                              Details
                            </Link>
                            <button
                              onClick={() => {
                                setEditingSection(sec);
                                setEditSectionForm({
                                  title: sec.title,
                                  teacherId: sec.teacherId || sec.teacher?.id || '',
                                  capacity: sec.capacity || 40
                                });
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteSection(sec.id, sec.title)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
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

      {/* TAB 2: ENROLLED STUDENTS */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <GraduationCap size={28} />
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-1">No enrolled students found</h4>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                {searchTerm ? `No students match "${searchTerm}".` : `There are currently no students enrolled in sections for ${classData.title}.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Assigned Section</th>
                    <th className="px-6 py-4">Enrollment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st, idx) => (
                    <tr key={st.enrollmentId || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-xs">
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
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-bold rounded-lg border border-purple-200">
                          {st.sectionTitle}
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

      {/* MODAL 1: ADD SECTION */}
      {isAddSectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Layers className="text-purple-600" size={20} />
                <h3>Add New Section</h3>
              </div>
              <button 
                onClick={() => setIsAddSectionModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Section Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Section B, Section C"
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Section Instructor (Optional)
                </label>
                <select
                  value={sectionForm.teacherId}
                  onChange={(e) => setSectionForm({ ...sectionForm, teacherId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800 bg-white"
                >
                  <option value="">-- Select Instructor --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.user?.name || 'Unnamed Teacher'} ({t.user?.email || 'No email'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Student Capacity
                </label>
                <input
                  type="number"
                  placeholder="40"
                  value={sectionForm.capacity}
                  onChange={(e) => setSectionForm({ ...sectionForm, capacity: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSectionModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT SECTION */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Edit3 className="text-purple-600" size={20} />
                <h3>Edit Section {editingSection.title}</h3>
              </div>
              <button 
                onClick={() => setEditingSection(null)} 
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
                  placeholder="e.g. Section A"
                  value={editSectionForm.title}
                  onChange={(e) => setEditSectionForm({ ...editSectionForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Section Instructor
                </label>
                <select
                  value={editSectionForm.teacherId}
                  onChange={(e) => setEditSectionForm({ ...editSectionForm, teacherId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800 bg-white"
                >
                  <option value="">-- Select Instructor --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.user?.name || 'Unnamed Teacher'} ({t.user?.email || 'No email'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Capacity
                </label>
                <input
                  type="number"
                  value={editSectionForm.capacity}
                  onChange={(e) => setEditSectionForm({ ...editSectionForm, capacity: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Update Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT CLASS */}
      {isEditClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Edit3 className="text-purple-600" size={20} />
                <h3>Edit Class Details</h3>
              </div>
              <button 
                onClick={() => setIsEditClassModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Class Name / Title *
                </label>
                <input
                  type="text"
                  value={editClassForm.title}
                  onChange={(e) => setEditClassForm({ ...editClassForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Description
                </label>
                <textarea
                  value={editClassForm.description}
                  onChange={(e) => setEditClassForm({ ...editClassForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 h-24 resize-none text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditClassModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
