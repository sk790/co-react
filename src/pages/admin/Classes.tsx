import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Grid,
  List,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { apiClient } from '../../api/axios';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";

interface SectionTeacher {
  user?: {
    name?: string;
  };
}

interface SectionItem {
  id: string;
  title: string;
  teacher?: SectionTeacher;
}

interface ClassItem {
  id: string;
  title: string;
  description?: string;
  classTeacherId?: string;
  sections?: SectionItem[];
  createdAt?: string;
}

interface TeacherProfile {
  id: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
  };
}

export const Classes: React.FC = () => {
  // Main Data States
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Display Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Modal & Form States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    sectionName: 'Section A',
    teacherId: ''
  });

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [selectedClassForSection, setSelectedClassForSection] = useState<ClassItem | null>(null);
  const [sectionForm, setSectionForm] = useState({
    title: '',
    teacherId: ''
  });

  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Classes and Teachers
  const fetchClassesData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const [classRes, teacherRes] = await Promise.allSettled([
        apiClient.get('/classes'),
        apiClient.get('/teachers')
      ]);

      if (classRes.status === 'fulfilled' && classRes.value.data.success) {
        setClasses(classRes.value.data.data || []);
      } else if (classRes.status === 'rejected') {
        console.warn('Failed to fetch classes:', classRes.reason);
        showToast('Could not load classes list', 'error');
      }

      if (teacherRes.status === 'fulfilled' && teacherRes.value.data.success) {
        setTeachers(teacherRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      showToast('Failed to load classes data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClassesData(true);
  }, []);

  // Handle Class Creation
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim()) {
      showToast('Class title is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post('/classes', {
        title: createForm.title.trim(),
        description: createForm.description.trim() || undefined,
        sectionName: createForm.sectionName.trim() || 'Section A',
        teacherId: createForm.teacherId || undefined
      });

      if (res.data.success) {
        showToast('Class created successfully!');
        setIsCreateModalOpen(false);
        setCreateForm({ title: '', description: '', sectionName: 'Section A', teacherId: '' });
        fetchClassesData(false);
      } else {
        showToast(res.data.message || 'Failed to create class', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error creating class', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Adding Section to an existing Class
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassForSection || !sectionForm.title.trim()) {
      showToast('Section title is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post('/sections', {
        classId: selectedClassForSection.id,
        title: sectionForm.title.trim(),
        teacherId: sectionForm.teacherId || undefined
      });

      if (res.data.success) {
        showToast(`Section "${sectionForm.title}" added to ${selectedClassForSection.title}!`);
        setIsSectionModalOpen(false);
        setSelectedClassForSection(null);
        setSectionForm({ title: '', teacherId: '' });
        fetchClassesData(false);
      } else {
        showToast(res.data.message || 'Failed to add section', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error adding section', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Editing Class
  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !editForm.title.trim()) {
      showToast('Class title is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.put(`/classes/${editingClass.id}`, {
        title: editForm.title.trim(),
        description: editForm.description.trim() || undefined
      });

      if (res.data.success) {
        showToast('Class updated successfully!');
        setEditingClass(null);
        fetchClassesData(false);
      } else {
        showToast(res.data.message || 'Failed to update class', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error updating class', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Deleting Class
  const handleDeleteClass = async (classId: string) => {
    setDeletingId(classId);
    try {
      const res = await apiClient.delete(`/classes/${classId}`);
      if (res.data.success) {
        showToast('Class deleted successfully!');
        fetchClassesData(false);
      } else {
        showToast(res.data.message || 'Failed to delete class', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error deleting class', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter classes by search term
  const filteredClasses = classes.filter(cls =>
    cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cls.description && cls.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    cls.sections?.some(sec => sec.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Stats Calculations
  const totalClassesCount = classes.length;
  const totalSectionsCount = classes.reduce((acc, c) => acc + (c.sections?.length || 0), 0);
  const totalTeachersAssigned = classes.reduce((acc, c) => {
    const assignedSecTeachers = c.sections?.filter(s => s.teacher?.user?.name).length || 0;
    return acc + (c.classTeacherId ? 1 : 0) + assignedSecTeachers;
  }, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-999999 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${toast.type === 'success'
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-slate-900 via-purple-950 to-indigo-900 text-white p-6 rounded-2xl shadow-xl border border-purple-900/30">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-600/30 rounded-xl border border-purple-500/30 text-purple-300">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Classes & Sections</h1>
              <p className="text-sm text-purple-200/75 mt-0.5">
                Organize academic grades, sections, and assign class instructors.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setCreateForm({ title: '', description: '', sectionName: 'Section A', teacherId: '' });
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-sm transition-all shadow-md shadow-purple-600/30 self-start sm:self-auto active:scale-95"
        >
          <Plus size={18} />
          Create New Class
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <BookOpen size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Classes</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalClassesCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Layers size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Sections</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalSectionsCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserCheck size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Instructors Assigned</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalTeachersAssigned}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search classes or sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => fetchClassesData(false)}
            title="Refresh Classes"
            className="p-2 text-slate-500 hover:text-purple-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        // Loading Skeleton
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              <div className="space-y-2 pt-2">
                <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
                <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredClasses.length === 0 ? (
        // Empty State
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 border border-purple-100">
            <BookOpen size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">
            {searchTerm ? 'No matching classes found' : 'No classes created yet'}
          </h3>
          <p className="text-slate-500 text-sm max-w-md mb-6">
            {searchTerm
              ? `We couldn't find any classes matching "${searchTerm}". Try a different keyword.`
              : 'Get started by creating your first academic class and assigning sections and teachers.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setCreateForm({ title: '', description: '', sectionName: 'Section A', teacherId: '' });
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-sm transition-all shadow-md shadow-purple-600/20"
            >
              <Plus size={18} />
              Create First Class
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        // GRID VIEW
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/classes/${cls.id}`}
                        className="font-bold text-slate-900 text-lg hover:text-purple-600 transition-colors"
                      >
                        {cls.title}
                      </Link>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        {cls.sections?.length || 0} {cls.sections?.length === 1 ? 'Section' : 'Sections'}
                      </span>
                    </div>
                    {cls.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cls.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingClass(cls);
                        setEditForm({ title: cls.title, description: cls.description || '' });
                      }}
                      title="Edit Class"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit3 size={15} />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          disabled={deletingId === cls.id}
                          title="Delete Class"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Class?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you absolutely sure you want to delete the class "{cls.title}" and all its associated sections? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteClass(cls.id);
                            }}
                            disabled={deletingId === cls.id}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white bg-rose-600 text-white hover:bg-rose-700 h-10 py-2 px-4"
                          >
                            {deletingId === cls.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Sections List */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>Sections ({cls.sections?.length || 0})</span>
                    <span>Assigned Teacher</span>
                  </div>

                  {(!cls.sections || cls.sections.length === 0) ? (
                    <div className="py-4 text-center text-xs text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No sections created for this class yet.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {cls.sections.slice(0, 3).map((sec) => (
                        <div
                          key={sec.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-purple-200 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2 font-semibold text-slate-800">
                            <Layers size={14} className="text-purple-600" />
                            <span>{sec.title}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-slate-600">
                            <UserCheck size={13} className="text-slate-400" />
                            <span className="font-medium truncate max-w-[120px]">
                              {sec.teacher?.user?.name || 'Unassigned'}
                            </span>
                          </div>
                        </div>
                      ))}
                      {cls.sections.length > 3 && (
                        <Link
                          to={`/admin/classes/${cls.id}`}
                          className="block text-center py-1 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
                        >
                          +{cls.sections.length - 3} more sections
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedClassForSection(cls);
                    setSectionForm({ title: `Section ${String.fromCharCode(65 + (cls.sections?.length || 0))}`, teacherId: '' });
                    setIsSectionModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-purple-700 font-semibold rounded-xl text-xs transition-all shadow-xs"
                >
                  <Plus size={14} />
                  Add New Section
                </button>
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
                  <th className="px-6 py-4">Class Title</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Sections</th>
                  <th className="px-6 py-4">Total Sections</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClasses.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                          <BookOpen size={16} />
                        </div>
                        <Link to={`/admin/classes/${cls.id}`} className="hover:text-purple-600 transition-colors">
                          {cls.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                      {cls.description || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {(!cls.sections || cls.sections.length === 0) ? (
                          <span className="text-slate-400 font-normal">—</span>
                        ) : (
                          <>
                            {cls.sections.slice(0, 3).map(sec => (
                              <span key={sec.id} className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded-md border border-slate-200">
                                {sec.title}
                              </span>
                            ))}
                            {cls.sections.length > 3 && (
                              <Link
                                to={`/admin/classes/${cls.id}`}
                                className="px-2 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-md border border-purple-200 text-[11px] transition-colors"
                              >
                                +{cls.sections.length - 3} more
                              </Link>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                        {cls.sections?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedClassForSection(cls);
                            setSectionForm({ title: `Section ${String.fromCharCode(65 + (cls.sections?.length || 0))}`, teacherId: '' });
                            setIsSectionModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Plus size={14} /> Section
                        </button>
                        <button
                          onClick={() => {
                            setEditingClass(cls);
                            setEditForm({ title: cls.title, description: cls.description || '' });
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit3 size={15} />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              disabled={deletingId === cls.id}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Trash2 size={15} />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Class?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you absolutely sure you want to delete the class "{cls.title}" and all its associated sections? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDeleteClass(cls.id);
                                }}
                                disabled={deletingId === cls.id}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white bg-rose-600 text-white hover:bg-rose-700 h-10 py-2 px-4"
                              >
                                {deletingId === cls.id ? 'Deleting...' : 'Delete'}
                              </button>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE CLASS */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <BookOpen className="text-purple-600" size={20} />
                <h3>Create New Class</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Class Name / Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Class 10, Grade 5, Nursery"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Initial Section Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Section A"
                  value={createForm.sectionName}
                  onChange={(e) => setCreateForm({ ...createForm, sectionName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Class Teacher (Optional)
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="w-full flex items-center justify-between px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800 bg-white data-[state=open]:border-purple-300">
                      <span>{createForm.teacherId ? teachers.find(t => t.id === createForm.teacherId)?.user?.name || 'Unnamed Teacher' : "-- Select Class Instructor --"}</span>
                      <ChevronRight size={16} className="text-slate-400 rotate-90" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] p-1 max-h-64 overflow-y-auto">
                    <DropdownMenuItem onClick={() => setCreateForm({ ...createForm, teacherId: '' })} className="cursor-pointer text-slate-500 italic">
                      -- Select Class Instructor --
                    </DropdownMenuItem>
                    {teachers.map(t => (
                      <DropdownMenuItem 
                        key={t.id} 
                        onClick={() => setCreateForm({ ...createForm, teacherId: t.id })}
                        className="cursor-pointer"
                      >
                        {t.user?.name || 'Unnamed Teacher'} ({t.user?.email || 'No email'})
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="e.g. Secondary academic division covering Science & Math curriculum."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 h-20 resize-none text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD SECTION TO CLASS */}
      {isSectionModalOpen && selectedClassForSection && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Layers className="text-purple-600" size={20} />
                <h3>Add Section to {selectedClassForSection.title}</h3>
              </div>
              <button
                onClick={() => setIsSectionModalOpen(false)}
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
                  placeholder="e.g. Section B, Section C, Morning Batch"
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="w-full flex items-center justify-between px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800 bg-white data-[state=open]:border-purple-300">
                      <span>{sectionForm.teacherId ? teachers.find(t => t.id === sectionForm.teacherId)?.user?.name || 'Unnamed Teacher' : "-- Select Instructor --"}</span>
                      <ChevronRight size={16} className="text-slate-400 rotate-90" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] p-1 max-h-64 overflow-y-auto">
                    <DropdownMenuItem onClick={() => setSectionForm({ ...sectionForm, teacherId: '' })} className="cursor-pointer text-slate-500 italic">
                      -- Select Instructor --
                    </DropdownMenuItem>
                    {teachers.map(t => (
                      <DropdownMenuItem 
                        key={t.id} 
                        onClick={() => setSectionForm({ ...sectionForm, teacherId: t.id })}
                        className="cursor-pointer"
                      >
                        {t.user?.name || 'Unnamed Teacher'} ({t.user?.email || 'No email'})
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT CLASS */}
      {editingClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Edit3 className="text-purple-600" size={20} />
                <h3>Edit Class</h3>
              </div>
              <button
                onClick={() => setEditingClass(null)}
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
                  placeholder="e.g. Class 10"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Class description..."
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 h-24 resize-none text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
