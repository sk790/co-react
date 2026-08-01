import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Layers, 
  Plus, 
  Search, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  Users, 
  BookOpen, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Grid, 
  List, 
  ChevronRight,
  Hash,
  MapPin
} from 'lucide-react';
import { apiClient } from '../../api/axios';
import { useSessionStore } from '../../store/sessionStore';
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

interface TeacherInfo {
  id: string;
  user?: {
    name: string;
    email?: string;
  };
}

interface ClassInfo {
  id: string;
  title: string;
}

interface EnrollmentInfo {
  id: string;
}

interface SectionItem {
  id: string;
  title: string;
  capacity?: number;
  roomNumber?: string;
  createdAt?: string;
  class?: ClassInfo;
  teacher?: TeacherInfo;
  enrollments?: EnrollmentInfo[];
}

interface ClassOption {
  id: string;
  title: string;
}

interface TeacherOption {
  id: string;
  name: string;
}

export const Sections: React.FC = () => {
  // Data States
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [classesList, setClassesList] = useState<ClassOption[]>([]);
  const [teachersList, setTeachersList] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & Display States
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Modal & Form States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    classId: '',
    teacherId: '',
    capacity: 40,
    roomNumber: ''
  });

  const [editingSection, setEditingSection] = useState<SectionItem | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    teacherId: '',
    capacity: 40,
    roomNumber: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const { activeSessionId } = useSessionStore();

  // Fetch All Sections, Classes, and Teachers
  const fetchInitialData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const [sectionsRes, classesRes, teachersRes] = await Promise.allSettled([
        apiClient.get('/sections'),
        apiClient.get('/classes'),
        apiClient.get('/teachers')
      ]);

      if (sectionsRes.status === 'fulfilled' && sectionsRes.value.data.success) {
        setSections(sectionsRes.value.data.data || []);
      } else {
        showToast('Failed to load sections', 'error');
      }

      if (classesRes.status === 'fulfilled' && classesRes.value.data.success) {
        setClassesList(classesRes.value.data.data || []);
      }

      if (teachersRes.status === 'fulfilled' && teachersRes.value.data.success) {
        const rawTeachers = teachersRes.value.data.data || [];
        setTeachersList(rawTeachers.map((t: any) => ({
          id: t.id,
          name: t.user?.name || 'Unnamed Teacher'
        })));
      }
    } catch (err: any) {
      console.error('Error fetching section directory:', err);
      showToast('Error loading section directory', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInitialData(true);
  }, [activeSessionId]);

  // Handle Create Section
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(createForm.title || '').trim() || !createForm.classId) {
      showToast('Section Title and Parent Class are required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: (createForm.title || '').trim(),
        classId: createForm.classId,
        teacherId: createForm.teacherId || undefined,
        capacity: Number(createForm.capacity) || 40,
        roomNumber: (createForm.roomNumber || '').trim() || undefined
      };

      const res = await apiClient.post('/sections', payload);
      if (res.data.success) {
        showToast('New section created successfully!');
        setIsCreateModalOpen(false);
        setCreateForm({ title: '', classId: '', teacherId: '', capacity: 40, roomNumber: '' });
        fetchInitialData(false);
      } else {
        showToast(res.data.message || 'Failed to create section', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error creating section', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Update Section
  const handleUpdateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection || !(editForm.title || '').trim()) return;

    setSubmitting(true);
    try {
      const res = await apiClient.put(`/sections/${editingSection.id}`, {
        title: (editForm.title || '').trim(),
        teacherId: editForm.teacherId, // sending "" clears instructor
        capacity: Number(editForm.capacity) || 40,
        roomNumber: (editForm.roomNumber || '').trim() || undefined
      });

      if (res.data.success) {
        showToast('Section details updated!');
        setEditingSection(null);
        fetchInitialData(false);
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
    setDeletingId(sectionId);
    try {
      const res = await apiClient.delete(`/sections/${sectionId}`);
      if (res.data.success) {
        showToast(`Section "${sectionTitle}" deleted!`);
        fetchInitialData(false);
      } else {
        showToast(res.data.message || 'Failed to delete section', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error deleting section', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter sections by search
  const filteredSections = sections.filter(sec => 
    sec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sec.class?.title && sec.class.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (sec.teacher?.user?.name && sec.teacher.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Overview Statistics
  const totalSectionsCount = sections.length;
  const totalEnrolledCount = sections.reduce((sum, sec) => sum + (sec.enrollments?.length || 0), 0);
  const assignedInstructorsCount = sections.filter(sec => sec.teacher?.id).length;
  const totalCapacityCount = sections.reduce((sum, sec) => sum + (sec.capacity || 40), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Toast Notification (z-[9999] so it floats above all modals) */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
          toast.type === 'success' 
            ? 'bg-emerald-600 text-white shadow-emerald-600/30' 
            : 'bg-rose-600 text-white shadow-rose-600/30'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 rounded-2xl shadow-xl border border-indigo-900/30">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-600/30 rounded-xl border border-purple-500/30 text-purple-300">
              <Layers size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Class Sections</h1>
              <p className="text-sm text-purple-200/75 mt-0.5">
                Manage section allocations, instructor assignments, and class rosters.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setCreateForm({
              title: '',
              classId: classesList[0]?.id || '',
              teacherId: '',
              capacity: 40,
              roomNumber:""
            });
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-sm transition-all shadow-md shadow-purple-600/30 self-start sm:self-auto active:scale-95"
        >
          <Plus size={18} />
          Create New Section
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Layers size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Sections</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalSectionsCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Enrolled Students</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalEnrolledCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <UserCheck size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned Instructors</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{assignedInstructorsCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <BookOpen size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Seat Capacity</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalCapacityCount}</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by section, class or teacher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => fetchInitialData(false)}
            title="Refresh Directory"
            className="p-2 text-slate-500 hover:text-purple-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List View"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Display */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl w-full"></div>
          ))}
        </div>
      ) : filteredSections.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center shadow-xs">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 border border-purple-100">
            <Layers size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">
            {searchTerm ? 'No matching sections found' : 'No sections created yet'}
          </h3>
          <p className="text-slate-500 text-sm max-w-md mb-6">
            {searchTerm ? `We couldn't find any section matching "${searchTerm}".` : 'Create your first section to organize class rosters.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setCreateForm({
                  title: '',
                  classId: classesList[0]?.id || '',
                  teacherId: '',
                  capacity: 40,
                  roomNumber:''
                });
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-sm transition-all shadow-md shadow-purple-600/20"
            >
              <Plus size={18} />
              Create First Section
            </button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        // TABLE / LIST VIEW (DEFAULT)
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Section Title</th>
                  <th className="px-6 py-4">Parent Class</th>
                  <th className="px-6 py-4">Room No. / Lab</th>
                  <th className="px-6 py-4">Assigned Instructor</th>
                  <th className="px-6 py-4">Enrolled Capacity</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSections.map((sec) => {
                  const enrolledCount = sec.enrollments?.length || 0;
                  const capacity = sec.capacity || 40;

                  return (
                    <tr key={sec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                        <Link 
                          to={`/admin/sections/${sec.id}`}
                          className="flex items-center gap-2.5 hover:text-purple-600 transition-colors"
                        >
                          <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
                            <Layers size={16} />
                          </div>
                          <span>{sec.title}</span>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        {sec.class?.id ? (
                          <Link 
                            to={`/admin/classes/${sec.class.id}`}
                            className="font-bold text-slate-800 hover:text-indigo-600 transition-colors bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200"
                          >
                            {sec.class.title}
                          </Link>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {sec.roomNumber ? (
                          <span className="inline-flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 text-xs">
                            <MapPin size={12} className="text-indigo-600" />
                            {sec.roomNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not Assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {sec.teacher?.id ? (
                          <Link 
                            to={`/admin/teachers/${sec.teacher.id}`}
                            className="font-bold text-indigo-700 hover:underline flex items-center gap-1.5"
                          >
                            <UserCheck size={14} className="text-emerald-600" />
                            {sec.teacher.user?.name || 'Assigned Instructor'}
                          </Link>
                        ) : (
                          <span className="text-slate-400 italic">No Instructor</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 text-[11px]">
                            {enrolledCount} / {capacity} Students
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingSection(sec);
                              setEditForm({
                                title: sec.title,
                                teacherId: sec.teacher?.id || '',
                                capacity: sec.capacity || 40,
                                roomNumber: sec.roomNumber || ''
                              });
                            }}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Section"
                          >
                            <Edit3 size={15} />
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger
                              render={
                                <button
                                  disabled={deletingId === sec.id}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Delete Section"
                                >
                                  <Trash2 size={15} />
                                </button>
                              }
                            />
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Section?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you absolutely sure you want to delete the section "{sec.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleDeleteSection(sec.id, sec.title);
                                  }}
                                  disabled={deletingId === sec.id}
                                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white bg-rose-600 text-white hover:bg-rose-700 h-10 py-2 px-4"
                                >
                                  {deletingId === sec.id ? 'Deleting...' : 'Delete'}
                                </button>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // GRID VIEW
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSections.map((sec) => {
            const enrolledCount = sec.enrollments?.length || 0;
            const capacity = sec.capacity || 40;
            const percentage = Math.min(100, Math.round((enrolledCount / capacity) * 100));

            return (
              <div 
                key={sec.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
                        <Layers size={20} />
                      </div>
                      <div>
                        <Link 
                          to={`/admin/sections/${sec.id}`}
                          className="font-bold text-slate-900 text-sm hover:text-purple-600 transition-colors"
                        >
                          {sec.title}
                        </Link>
                        {sec.class?.title && (
                          <span className="block text-[11px] font-semibold text-purple-600">
                            Class: {sec.class.title}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingSection(sec);
                          setEditForm({
                            title: sec.title,
                            teacherId: sec.teacher?.id || '',
                            capacity: sec.capacity || 40,
                            roomNumber: sec.roomNumber || ''
                          });
                        }}
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit3 size={15} />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <button
                              disabled={deletingId === sec.id}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Trash2 size={15} />
                            </button>
                          }
                        />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Section?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you absolutely sure you want to delete the section "{sec.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleDeleteSection(sec.id, sec.title);
                              }}
                              disabled={deletingId === sec.id}
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white bg-rose-600 text-white hover:bg-rose-700 h-10 py-2 px-4"
                            >
                              {deletingId === sec.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <div className="text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 font-medium">Room No. / Lab:</span>
                      {sec.roomNumber ? (
                        <span className="inline-flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 text-[11px]">
                          <MapPin size={11} className="text-indigo-600" />
                          {sec.roomNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not Assigned</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 font-medium">Instructor:</span>
                      {sec.teacher?.id ? (
                        <Link to={`/admin/teachers/${sec.teacher.id}`} className="font-bold text-indigo-700 hover:underline">
                          {sec.teacher.user?.name}
                        </Link>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-600">
                        <span>Enrolled Roster</span>
                        <span>{enrolledCount} / {capacity} Seats</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-purple-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 text-right">
                  <Link
                    to={`/admin/sections/${sec.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:underline"
                  >
                    View Section Roster <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE SECTION MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Layers className="text-purple-600" size={20} />
                <h3>Create New Section</h3>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Parent Class *
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="w-full flex items-center justify-between px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800 bg-white data-[state=open]:border-purple-300">
                      <span>{createForm.classId ? classesList.find(c => c.id === createForm.classId)?.title : "-- Select Class --"}</span>
                      <ChevronRight size={16} className="text-slate-400 rotate-90" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] p-1">
                    {classesList.map(cls => (
                      <DropdownMenuItem 
                        key={cls.id} 
                        onClick={() => setCreateForm({ ...createForm, classId: cls.id })}
                        className="cursor-pointer"
                      >
                        {cls.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Section Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Section A"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Assign Instructor (Optional)
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="w-full flex items-center justify-between px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800 bg-white data-[state=open]:border-purple-300">
                      <span>{createForm.teacherId ? teachersList.find(t => t.id === createForm.teacherId)?.name : "-- No Instructor (Unassigned) --"}</span>
                      <ChevronRight size={16} className="text-slate-400 rotate-90" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] p-1">
                    <DropdownMenuItem onClick={() => setCreateForm({ ...createForm, teacherId: '' })} className="cursor-pointer text-slate-500 italic">
                      -- No Instructor (Unassigned) --
                    </DropdownMenuItem>
                    {teachersList.map(t => (
                      <DropdownMenuItem 
                        key={t.id} 
                        onClick={() => setCreateForm({ ...createForm, teacherId: t.id })}
                        className="cursor-pointer"
                      >
                        {t.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Seat Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={createForm.capacity}
                    onChange={(e) => setCreateForm({ ...createForm, capacity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Room No. / Lab <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Room 102 / Lab 3"
                    value={createForm.roomNumber}
                    onChange={(e) => setCreateForm({ ...createForm, roomNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
                  />
                </div>
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
                  {submitting ? 'Creating...' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SECTION MODAL */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Edit3 className="text-purple-600" size={20} />
                <h3>Edit Section</h3>
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
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Assign Instructor
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="w-full flex items-center justify-between px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800 bg-white data-[state=open]:border-purple-300">
                      <span>{editForm.teacherId ? teachersList.find(t => t.id === editForm.teacherId)?.name : "-- No Instructor (Unassigned) --"}</span>
                      <ChevronRight size={16} className="text-slate-400 rotate-90" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] p-1">
                    <DropdownMenuItem onClick={() => setEditForm({ ...editForm, teacherId: '' })} className="cursor-pointer text-slate-500 italic">
                      -- No Instructor (Unassigned) --
                    </DropdownMenuItem>
                    {teachersList.map(t => (
                      <DropdownMenuItem 
                        key={t.id} 
                        onClick={() => setEditForm({ ...editForm, teacherId: t.id })}
                        className="cursor-pointer"
                      >
                        {t.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Seat Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editForm.capacity}
                    onChange={(e) => setEditForm({ ...editForm, capacity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Room No. / Lab
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Room 102"
                    value={editForm.roomNumber}
                    onChange={(e) => setEditForm({ ...editForm, roomNumber: e.target.value })}
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
