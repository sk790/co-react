/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Edit3,
  Layers,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { apiClient } from '../../api/axios';
import { ClassList } from '../../components/ClassList';
import { Modal } from '../../components/Modal';
import { toast } from '../../store/toastStore';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

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

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    if (type === 'error') toast.error(text);
    else toast.success(text);
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // Stats Calculations
  const totalClassesCount = classes.length;
  const totalSectionsCount = classes.reduce((acc, c) => acc + (c.sections?.length || 0), 0);
  const totalTeachersAssigned = classes.reduce((acc, c) => {
    const assignedSecTeachers = c.sections?.filter(s => s.teacher?.user?.name).length || 0;
    return acc + (c.classTeacherId ? 1 : 0) + assignedSecTeachers;
  }, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
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

      {/* Reusable Class List Component */}
      <ClassList
        classes={classes}
        loading={loading}
        initialViewMode="list"
        onRefresh={() => fetchClassesData(false)}
        isRefreshing={refreshing}
        showAdminActions={true}
        getDetailLink={(cls) => `/admin/classes/${cls.id}`}
        onEditClass={(cls) => {
          setEditingClass(cls);
          setEditForm({ title: cls.title, description: cls.description || '' });
        }}
        onDeleteClass={(classId) => handleDeleteClass(classId)}
        onAddSection={(cls) => {
          setSelectedClassForSection(cls);
          setSectionForm({ title: `Section ${String.fromCharCode(65 + (cls.sections?.length || 0))}`, teacherId: '' });
          setIsSectionModalOpen(true);
        }}
        deletingId={deletingId}
        emptyMessage="Get started by creating your first academic class and assigning sections and teachers."
      />

      {/* MODAL 1: CREATE CLASS */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Class"
        icon={BookOpen}
      >
        <form onSubmit={handleCreateClass} className="space-y-4">
          <div>
            <Label htmlFor="create-title">Class Name / Title *</Label>
            <Input
              id="create-title"
              type="text"
              placeholder="e.g. Class 10, Grade 5, Nursery"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="create-section">Initial Section Title</Label>
            <Input
              id="create-section"
              type="text"
              placeholder="e.g. Section A"
              value={createForm.sectionName}
              onChange={(e) => setCreateForm({ ...createForm, sectionName: e.target.value })}
            />
          </div>

          <div>
            <Label>Class Teacher (Optional)</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="w-full flex items-center justify-between px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800 bg-white">
                  <span>{createForm.teacherId ? teachers.find(t => t.id === createForm.teacherId)?.user?.name || 'Unnamed Teacher' : "-- Select Class Instructor --"}</span>
                  <ChevronRight size={16} className="text-slate-400 rotate-90" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width) min-w-50 p-1 max-h-64 overflow-y-auto">
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
            <Label htmlFor="create-desc">Description</Label>
            <Textarea
              id="create-desc"
              placeholder="e.g. Secondary academic division covering Science & Math curriculum."
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="h-20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20"
            >
              {submitting ? 'Creating...' : 'Create Class'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: ADD SECTION TO CLASS */}
      <Modal
        isOpen={isSectionModalOpen && !!selectedClassForSection}
        onClose={() => setIsSectionModalOpen(false)}
        title={`Add Section to ${selectedClassForSection?.title || ''}`}
        icon={Layers}
      >
        <form onSubmit={handleAddSection} className="space-y-4">
          <div>
            <Label htmlFor="section-title">Section Title *</Label>
            <Input
              id="section-title"
              type="text"
              placeholder="e.g. Section B, Section C, Morning Batch"
              value={sectionForm.title}
              onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>Section Instructor (Optional)</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="w-full flex items-center justify-between px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800 bg-white">
                  <span>{sectionForm.teacherId ? teachers.find(t => t.id === sectionForm.teacherId)?.user?.name || 'Unnamed Teacher' : "-- Select Instructor --"}</span>
                  <ChevronRight size={16} className="text-slate-400 rotate-90" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width) min-w-50 p-1 max-h-64 overflow-y-auto">
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
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsSectionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20"
            >
              {submitting ? 'Adding...' : 'Add Section'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: EDIT CLASS */}
      <Modal
        isOpen={!!editingClass}
        onClose={() => setEditingClass(null)}
        title="Edit Class"
        icon={Edit3}
      >
        <form onSubmit={handleUpdateClass} className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Class Name / Title *</Label>
            <Input
              id="edit-title"
              type="text"
              placeholder="e.g. Class 10"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-desc">Description</Label>
            <Textarea
              id="edit-desc"
              placeholder="Class description..."
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="h-24"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditingClass(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
