import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layers,
  Edit3,
  X,
  ChevronRight
} from 'lucide-react';
import { apiClient } from '../../api/axios';
import { useSessionStore } from '../../store/sessionStore';
import { toast } from '../../store/toastStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { ClassDetail as ReusableClassDetail, type ClassDetailData, type SectionItem, type TeacherProfile } from '../../components/pageComponents/ClassDetail';

export const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Data States
  const [classData, setClassData] = useState<ClassDetailData | null>(null);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal & Form States
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [sectionForm, setSectionForm] = useState({
    title: '',
    teacherId: '',
    capacity: 40,
    roomNumber: ''
  });

  const [editingSection, setEditingSection] = useState<SectionItem | null>(null);
  const [editSectionForm, setEditSectionForm] = useState({
    title: '',
    teacherId: '',
    capacity: 40,
    roomNumber: ''
  });

  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const [editClassForm, setEditClassForm] = useState({
    title: '',
    description: '',
    classTeacherId: ''
  });

  const [submitting, setSubmitting] = useState(false);

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
          description: fetchedClass.description || '',
          classTeacherId: fetchedClass.classTeacherId || ''
        });
      } else {
        toast.error('Could not load class details');
      }

      if (teacherRes.status === 'fulfilled' && teacherRes.value.data.success) {
        setTeachers(teacherRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching class details:', err);
      toast.error('Error loading class details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const { activeSessionId } = useSessionStore();

  useEffect(() => {
    fetchClassDetails(true);
  }, [id, activeSessionId]);

  // Handle Add Section
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !(sectionForm.title || '').trim()) {
      toast.error('Section title is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post('/sections', {
        classId: id,
        title: (sectionForm.title || '').trim(),
        teacherId: sectionForm.teacherId || undefined,
        capacity: Number(sectionForm.capacity) || 40,
        roomNumber: (sectionForm.roomNumber || '').trim() || undefined
      });

      if (res.data.success) {
        toast.success(`Section "${sectionForm.title}" added successfully!`);
        setIsAddSectionModalOpen(false);
        setSectionForm({ title: '', teacherId: '', capacity: 40, roomNumber: '' });
        fetchClassDetails(false);
      } else {
        toast.error(res.data.message || 'Failed to create section');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error adding section');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Update Section
  const handleUpdateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection || !(editSectionForm.title || '').trim()) {
      toast.error('Section title is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.put(`/sections/${editingSection.id}`, {
        title: (editSectionForm.title || '').trim(),
        teacherId: editSectionForm.teacherId || undefined,
        capacity: Number(editSectionForm.capacity) || undefined,
        roomNumber: (editSectionForm.roomNumber || '').trim() || undefined
      });

      if (res.data.success) {
        toast.success('Section updated successfully!');
        setEditingSection(null);
        fetchClassDetails(false);
      } else {
        toast.error(res.data.message || 'Failed to update section');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error updating section');
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
        toast.success(`Section "${sectionTitle}" deleted!`);
        fetchClassDetails(false);
      } else {
        toast.error(res.data.message || 'Failed to delete section');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error deleting section');
    }
  };

  // Handle Update Class Details
  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !(editClassForm.title || '').trim()) {
      toast.error('Class title is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.put(`/classes/${id}`, {
        title: (editClassForm.title || '').trim(),
        description: (editClassForm.description || '').trim() || undefined,
        classTeacherId: editClassForm.classTeacherId || undefined
      });

      if (res.data.success) {
        toast.success('Class details updated!');
        setIsEditClassModalOpen(false);
        fetchClassDetails(false);
      } else {
        toast.error(res.data.message || 'Failed to update class');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error updating class');
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
        toast.success('Class deleted!');
        navigate('/admin/classes');
      } else {
        toast.error(res.data.message || 'Failed to delete class');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error deleting class');
    }
  };

  return (
    <div className="relative">

      {/* Dynamic Reusable Class Detail Component */}
      <ReusableClassDetail
        classData={classData}
        loading={loading}
        isRefreshing={refreshing}
        onRefresh={() => fetchClassDetails(false)}
        role="ADMIN"
        backLink="/admin/classes"
        backLinkLabel="Classes List"
        getSectionDetailLink={(sec) => `/admin/sections/${sec.id}`}
        getStudentDetailLink={(studentId) => `/admin/students/${studentId}`}
        getTeacherDetailLink={(teacherId) => `/admin/teachers/${teacherId}`}
        onAddSection={() => {
          setSectionForm({
            title: `Section ${String.fromCharCode(65 + (classData?.sections?.length || 0))}`,
            teacherId: '',
            capacity: 40,
            roomNumber: ''
          });
          setIsAddSectionModalOpen(true);
        }}
        onEditClass={() => setIsEditClassModalOpen(true)}
        onDeleteClass={handleDeleteClass}
        onEditSection={(sec) => {
          setEditingSection(sec);
          setEditSectionForm({
            title: sec.title,
            teacherId: sec.teacherId || sec.teacher?.id || '',
            capacity: sec.capacity || 40,
            roomNumber: sec.roomNumber || ''
          });
        }}
        onDeleteSection={(sec) => handleDeleteSection(sec.id, sec.title)}
      />

      {/* MODAL 1: ADD SECTION */}
      {isAddSectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="w-full flex items-center justify-between px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800 bg-white data-[state=open]:border-purple-300">
                      <span>
                        {sectionForm.teacherId
                          ? teachers.find(t => t.id === sectionForm.teacherId)?.user?.name || 'Unnamed Teacher'
                          : "-- Select Instructor --"}
                      </span>
                      <ChevronRight size={16} className="text-slate-400 rotate-90" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] p-1">
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

              <div className="grid grid-cols-2 gap-3">
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

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Room No. / Lab <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Room 101"
                    value={sectionForm.roomNumber}
                    onChange={(e) => setSectionForm({ ...sectionForm, roomNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
                  />
                </div>
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
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="w-full flex items-center justify-between px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800 bg-white data-[state=open]:border-purple-300">
                      <span>
                        {editSectionForm.teacherId
                          ? teachers.find(t => t.id === editSectionForm.teacherId)?.user?.name || 'Unnamed Teacher'
                          : "-- Select Instructor --"}
                      </span>
                      <ChevronRight size={16} className="text-slate-400 rotate-90" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] p-1">
                    <DropdownMenuItem onClick={() => setEditSectionForm({ ...editSectionForm, teacherId: '' })} className="cursor-pointer text-slate-500 italic">
                      -- Select Instructor --
                    </DropdownMenuItem>
                    {teachers.map(t => (
                      <DropdownMenuItem
                        key={t.id}
                        onClick={() => setEditSectionForm({ ...editSectionForm, teacherId: t.id })}
                        className="cursor-pointer"
                      >
                        {t.user?.name || 'Unnamed Teacher'} ({t.user?.email || 'No email'})
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-2 gap-3">
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

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Room No. / Lab
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Room 101"
                    value={editSectionForm.roomNumber}
                    onChange={(e) => setEditSectionForm({ ...editSectionForm, roomNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
                  />
                </div>
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
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
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
                  Class Teacher / In-charge
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="w-full flex items-center justify-between px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800 bg-white data-[state=open]:border-purple-300">
                      <span>
                        {editClassForm.classTeacherId
                          ? teachers.find(t => t.id === editClassForm.classTeacherId)?.user?.name || 'Unnamed Teacher'
                          : "-- Select Class Teacher --"}
                      </span>
                      <ChevronRight size={16} className="text-slate-400 rotate-90" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] p-1">
                    <DropdownMenuItem onClick={() => setEditClassForm({ ...editClassForm, classTeacherId: '' })} className="cursor-pointer text-slate-500 italic">
                      -- None / Unassigned --
                    </DropdownMenuItem>
                    {teachers.map(t => (
                      <DropdownMenuItem
                        key={t.id}
                        onClick={() => setEditClassForm({ ...editClassForm, classTeacherId: t.id })}
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
