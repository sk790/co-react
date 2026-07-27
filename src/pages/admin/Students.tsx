import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  Mail, 
  Phone, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Grid, 
  List, 
  Users, 
  BookOpen, 
  UserCheck, 
  Hash, 
  Calendar,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Check
} from 'lucide-react';
import { apiClient } from '../../api/axios';
import { useSessionStore } from '../../store/sessionStore';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt?: string;
}

interface ClassInfo {
  id: string;
  title: string;
}

interface SectionInfo {
  id: string;
  title: string;
  class?: ClassInfo;
}

interface EnrollmentItem {
  id: string;
  section?: SectionInfo;
  createdAt?: string;
}

interface StudentItem {
  id: string;
  enrollmentNo: string;
  createdAt?: string;
  user: UserData;
  enrollments?: EnrollmentItem[];
}

interface SectionOption {
  id: string;
  title: string;
  classTitle: string;
}

export const Students: React.FC = () => {
  // Data States
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [sectionsOptions, setSectionsOptions] = useState<SectionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Display Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Modal & Form States
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollForm, setEnrollForm] = useState({
    name: '',
    enrollmentNo: '',
    password: '',
    sectionId: ''
  });

  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    enrollmentNo: '',
    sectionId: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Students & Available Class Sections
  const fetchInitialData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const [studentsRes, classesRes] = await Promise.allSettled([
        apiClient.get('/students'),
        apiClient.get('/classes')
      ]);

      if (studentsRes.status === 'fulfilled' && studentsRes.value.data.success) {
        setStudents(studentsRes.value.data.data || []);
      } else {
        showToast('Failed to load students roster', 'error');
      }

      if (classesRes.status === 'fulfilled' && classesRes.value.data.success) {
        const rawClasses = classesRes.value.data.data || [];
        const secList: SectionOption[] = [];
        rawClasses.forEach((cls: any) => {
          if (cls.sections && Array.isArray(cls.sections)) {
            cls.sections.forEach((sec: any) => {
              secList.push({
                id: sec.id,
                title: sec.title,
                classTitle: cls.title
              });
            });
          }
        });
        setSectionsOptions(secList);
      }
    } catch (err: any) {
      console.error('Error fetching student data:', err);
      showToast('Error loading student directory', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const { sessions, activeSessionId } = useSessionStore();

  useEffect(() => {
    fetchInitialData(true);
  }, [activeSessionId]);

  // Handle Enroll Student
  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollForm.name.trim() || !enrollForm.enrollmentNo.trim()) {
      showToast('Student Name and Enrollment ID are required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        name: enrollForm.name.trim(),
        enrollmentNo: enrollForm.enrollmentNo.trim(),
        password: enrollForm.password.trim() || undefined,
        sectionIds: enrollForm.sectionId ? [enrollForm.sectionId] : undefined
      };

      const res = await apiClient.post('/students', payload);

      if (res.data.success) {
        showToast('Student enrolled successfully!');
        setIsEnrollModalOpen(false);
        setEnrollForm({ name: '', enrollmentNo: '', password: '', sectionId: '' });
        fetchInitialData(false);
      } else {
        showToast(res.data.message || 'Failed to enroll student', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error enrolling student', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Student
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editForm.name.trim()) return;

    setSubmitting(true);
    try {
      const res = await apiClient.put(`/students/${editingStudent.id}`, {
        name: editForm.name.trim(),
        enrollmentNo: editForm.enrollmentNo.trim() || undefined,
        sectionId: editForm.sectionId
      });

      if (res.data.success) {
        showToast('Student details updated!');
        setEditingStudent(null);
        fetchInitialData(false);
      } else {
        showToast(res.data.message || 'Failed to update student', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error updating student', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Student
  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Are you sure you want to remove student "${studentName}"?`)) return;

    setDeletingId(studentId);
    try {
      const res = await apiClient.delete(`/students/${studentId}`);
      if (res.data.success) {
        showToast(`Student "${studentName}" removed successfully!`);
        fetchInitialData(false);
      } else {
        showToast(res.data.message || 'Failed to remove student', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error removing student', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Promotion States
  const [isBulkPromoteModalOpen, setIsBulkPromoteModalOpen] = useState(false);
  const [singlePromoteStudent, setSinglePromoteStudent] = useState<StudentItem | null>(null);
  const [sourceSectionId, setSourceSectionId] = useState<string>('');
  const [targetSectionId, setTargetSectionId] = useState<string>('');
  const [targetSessionId, setTargetSessionId] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Handle Student Promotion (Single or Bulk)
  const handlePromoteStudents = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedSession = targetSessionId || activeSessionId;
    if (!selectedSession) {
      showToast('Please select a target Academic Session', 'error');
      return;
    }

    if (singlePromoteStudent) {
      if (!targetSectionId) {
        showToast('Please select a target class/section', 'error');
        return;
      }
      setSubmitting(true);
      try {
        const res = await apiClient.post('/students/promote', {
          targetSessionId: selectedSession,
          promotions: [
            { studentId: singlePromoteStudent.id, sectionId: targetSectionId }
          ]
        });
        if (res.data.success) {
          showToast(`Student "${singlePromoteStudent.user.name}" promoted successfully!`);
          setSinglePromoteStudent(null);
          setTargetSectionId('');
          fetchInitialData(false);
        } else {
          showToast(res.data.message || 'Failed to promote student', 'error');
        }
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Error promoting student', 'error');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Bulk promotion
    if (selectedStudentIds.length === 0 || !targetSectionId) {
      showToast('Please select at least one student and a target section', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const promotions = selectedStudentIds.map(stId => ({
        studentId: stId,
        sectionId: targetSectionId
      }));

      const res = await apiClient.post('/students/promote', {
        targetSessionId: selectedSession,
        promotions
      });

      if (res.data.success) {
        showToast(`${selectedStudentIds.length} Students promoted successfully!`);
        setIsBulkPromoteModalOpen(false);
        setSelectedStudentIds([]);
        setSourceSectionId('');
        setTargetSectionId('');
        fetchInitialData(false);
      } else {
        showToast(res.data.message || 'Failed to promote students', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error promoting students', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter students by search term
  const filteredStudents = students.filter(s => 
    s.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.enrollments && s.enrollments.some(e => 
      e.section?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.section?.class?.title.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  // Statistics
  const totalStudentsCount = students.length;
  const enrolledSectionsCount = students.filter(s => s.enrollments && s.enrollments.length > 0).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 rounded-2xl shadow-xl border border-indigo-900/30">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 rounded-xl border border-indigo-500/30 text-indigo-300">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Student Roster</h1>
              <p className="text-sm text-indigo-200/75 mt-0.5">
                Manage student enrollments, section assignments, and academic profiles.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => {
              setSelectedStudentIds([]);
              setSourceSectionId('');
              setTargetSectionId('');
              setIsBulkPromoteModalOpen(true);
            }}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-600/30 active:scale-95"
          >
            <TrendingUp size={18} />
            Promote Students
          </button>

          <button
            onClick={() => {
              setEnrollForm({ name: '', enrollmentNo: '', password: '', sectionId: '' });
              setIsEnrollModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-600/30 active:scale-95"
          >
            <Plus size={18} />
            Enroll New Student
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <GraduationCap size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Enrolled</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalStudentsCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Layers size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned to Sections</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{enrolledSectionsCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Users size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Unassigned Students</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {totalStudentsCount - enrolledSectionsCount}
            </div>
          </div>
        </div>
      </div>

      {/* Search & View Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, roll no, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => fetchInitialData(false)}
            title="Refresh Directory"
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List View"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Student Directory Display */}
      {loading ? (
        // Skeleton Loader
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl w-full"></div>
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        // Empty State
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100">
            <GraduationCap size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">
            {searchTerm ? 'No matching students found' : 'No students enrolled yet'}
          </h3>
          <p className="text-slate-500 text-sm max-w-md mb-6">
            {searchTerm 
              ? `We couldn't find any students matching "${searchTerm}".` 
              : 'Enroll your first student into class sections.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setEnrollForm({ name: '', enrollmentNo: '', password: '', sectionId: '' });
                setIsEnrollModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all shadow-md shadow-indigo-600/20"
            >
              <Plus size={18} />
              Enroll First Student
            </button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        // LIST / TABLE VIEW (DEFAULT)
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Enrollment ID</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Enrolled Section</th>
                  <th className="px-6 py-4">Registration Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-xs">
                          {s.user.name.charAt(0).toUpperCase()}
                        </div>
                        <Link to={`/admin/students/${s.id}`} className="hover:text-indigo-600 transition-colors">
                          {s.user.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                        {s.enrollmentNo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {s.user.email}
                    </td>
                    <td className="px-6 py-4">
                      {(!s.enrollments || s.enrollments.length === 0) ? (
                        <span className="text-slate-400 italic">Unassigned</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {s.enrollments.map((enr, i) => (
                            <span 
                              key={enr.id || i} 
                              className="px-2.5 py-0.5 bg-purple-50 text-purple-700 font-semibold rounded-md border border-purple-200 text-[11px]"
                            >
                              {enr.section?.class?.title ? `${enr.section.class.title} - ` : ''}{enr.section?.title || 'Section'}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSinglePromoteStudent(s);
                            setTargetSectionId('');
                          }}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Promote Student to Next Class"
                        >
                          <TrendingUp size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingStudent(s);
                            const currentSecId = s.enrollments && s.enrollments.length > 0 ? s.enrollments[0].section?.id || '' : '';
                            setEditForm({
                              name: s.user.name,
                              enrollmentNo: s.enrollmentNo,
                              sectionId: currentSecId
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Student"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(s.id, s.user.name)}
                          disabled={deletingId === s.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Remove Student"
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
      ) : (
        // GRID VIEW
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((s) => (
            <div 
              key={s.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-base">
                      {s.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <Link to={`/admin/students/${s.id}`} className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors">
                        {s.user.name}
                      </Link>
                      <span className="block font-mono text-[11px] font-semibold text-indigo-600">
                        ID: {s.enrollmentNo}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingStudent(s);
                        const currentSecId = s.enrollments && s.enrollments.length > 0 ? s.enrollments[0].section?.id || '' : '';
                        setEditForm({
                          name: s.user.name,
                          enrollmentNo: s.enrollmentNo,
                          sectionId: currentSecId
                        });
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(s.id, s.user.name)}
                      disabled={deletingId === s.id}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-2 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400" />
                    <span className="truncate">{s.user.email}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Enrolled Section
                    </span>
                    {(!s.enrollments || s.enrollments.length === 0) ? (
                      <span className="text-slate-400 italic">No section assigned</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {s.enrollments.map((enr, i) => (
                          <span key={enr.id || i} className="px-2 py-0.5 bg-purple-50 text-purple-700 font-semibold rounded-md border border-purple-200">
                            {enr.section?.class?.title ? `${enr.section.class.title} - ` : ''}{enr.section?.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Enrolled: {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md border border-emerald-200">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: ENROLL STUDENT */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <GraduationCap className="text-indigo-600" size={20} />
                <h3>Enroll New Student</h3>
              </div>
              <button 
                onClick={() => setIsEnrollModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEnrollStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={enrollForm.name}
                  onChange={(e) => setEnrollForm({ ...enrollForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Enrollment ID / Roll No *
                </label>
                <input
                  type="text"
                  placeholder="e.g. STU-2026-001"
                  value={enrollForm.enrollmentNo}
                  onChange={(e) => setEnrollForm({ ...enrollForm, enrollmentNo: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Assign Class Section (Optional)
                </label>
                <select
                  value={enrollForm.sectionId}
                  onChange={(e) => setEnrollForm({ ...enrollForm, sectionId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800 bg-white"
                >
                  <option value="">-- Select Section --</option>
                  {sectionsOptions.map(sec => (
                    <option key={sec.id} value={sec.id}>
                      {sec.classTitle} - {sec.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Account Password (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Default: Enrollment ID"
                  value={enrollForm.password}
                  onChange={(e) => setEnrollForm({ ...enrollForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Enrolling...' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT STUDENT */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Edit3 className="text-indigo-600" size={20} />
                <h3>Edit Student Information</h3>
              </div>
              <button 
                onClick={() => setEditingStudent(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Enrollment ID
                </label>
                <input
                  type="text"
                  value={editForm.enrollmentNo}
                  onChange={(e) => setEditForm({ ...editForm, enrollmentNo: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Assign Class Section
                </label>
                <select
                  value={editForm.sectionId}
                  onChange={(e) => setEditForm({ ...editForm, sectionId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800 bg-white"
                >
                  <option value="">-- No Section (Unassigned) --</option>
                  {sectionsOptions.map(sec => (
                    <option key={sec.id} value={sec.id}>
                      {sec.classTitle} - {sec.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PROMOTE SINGLE STUDENT */}
      {singlePromoteStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <TrendingUp className="text-emerald-600" size={20} />
                <h3>Promote Student</h3>
              </div>
              <button 
                onClick={() => setSinglePromoteStudent(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePromoteStudents} className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                <div className="font-bold text-slate-900 text-sm">{singlePromoteStudent.user.name}</div>
                <div className="text-slate-500">ID: <span className="font-mono text-slate-700 font-bold">{singlePromoteStudent.enrollmentNo}</span></div>
                <div className="text-slate-500">Current Class: <span className="font-semibold text-purple-700">
                  {singlePromoteStudent.enrollments?.[0]?.section?.class?.title ? `${singlePromoteStudent.enrollments[0].section.class.title} - ` : ''}
                  {singlePromoteStudent.enrollments?.[0]?.section?.title || 'Unassigned'}
                </span></div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Target Academic Session *
                </label>
                <select
                  value={targetSessionId || activeSessionId || ''}
                  onChange={(e) => setTargetSessionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/20 text-slate-800 bg-white font-medium"
                  required
                >
                  <option value="">-- Select Academic Session --</option>
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.title} {s.id === activeSessionId ? '(Current Active Session)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Promote / Transfer To Class & Section *
                </label>
                <select
                  value={targetSectionId}
                  onChange={(e) => setTargetSectionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/20 text-slate-800 bg-white font-medium"
                  required
                >
                  <option value="">-- Select Target Class & Section --</option>
                  {sectionsOptions.map(sec => (
                    <option key={sec.id} value={sec.id}>
                      {sec.classTitle} - {sec.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSinglePromoteStudent(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !targetSectionId}
                  className="px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <TrendingUp size={16} />
                  {submitting ? 'Promoting...' : 'Promote Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: BULK PROMOTE STUDENTS */}
      {isBulkPromoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <TrendingUp className="text-emerald-600" size={22} />
                <h3>Bulk Class Promotion</h3>
              </div>
              <button 
                onClick={() => setIsBulkPromoteModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePromoteStudents} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Target Academic Session *
                </label>
                <select
                  value={targetSessionId || activeSessionId || ''}
                  onChange={(e) => setTargetSessionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/20 text-slate-800 bg-white font-medium"
                  required
                >
                  <option value="">-- Select Academic Session --</option>
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.title} {s.id === activeSessionId ? '(Current Active Session)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    1. Source Class / Section
                  </label>
                  <select
                    value={sourceSectionId}
                    onChange={(e) => {
                      const secId = e.target.value;
                      setSourceSectionId(secId);
                      if (secId) {
                        const matching = students.filter(s => s.enrollments?.some(e => e.section?.id === secId)).map(s => s.id);
                        setSelectedStudentIds(matching);
                      } else {
                        setSelectedStudentIds([]);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/20 text-slate-800 bg-white font-medium"
                  >
                    <option value="">-- All Enrolled Students --</option>
                    {sectionsOptions.map(sec => (
                      <option key={sec.id} value={sec.id}>
                        {sec.classTitle} - {sec.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    2. Target Class / Section *
                  </label>
                  <select
                    value={targetSectionId}
                    onChange={(e) => setTargetSectionId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/20 text-slate-800 bg-white font-medium"
                    required
                  >
                    <option value="">-- Select Target Class & Section --</option>
                    {sectionsOptions.map(sec => (
                      <option key={sec.id} value={sec.id}>
                        {sec.classTitle} - {sec.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Select Students to Promote ({selectedStudentIds.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const pool = sourceSectionId 
                        ? students.filter(s => s.enrollments?.some(e => e.section?.id === sourceSectionId))
                        : students;
                      if (selectedStudentIds.length === pool.length) {
                        setSelectedStudentIds([]);
                      } else {
                        setSelectedStudentIds(pool.map(s => s.id));
                      }
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    {selectedStudentIds.length === (sourceSectionId ? students.filter(s => s.enrollments?.some(e => e.section?.id === sourceSectionId)).length : students.length) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-2xl p-2 divide-y divide-slate-100 bg-slate-50/50 space-y-1">
                  {(sourceSectionId 
                    ? students.filter(s => s.enrollments?.some(e => e.section?.id === sourceSectionId))
                    : students
                  ).map(s => {
                    const isChecked = selectedStudentIds.includes(s.id);
                    return (
                      <label 
                        key={s.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                          isChecked ? 'bg-indigo-50/80 border border-indigo-200/60' : 'hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudentIds([...selectedStudentIds, s.id]);
                              } else {
                                setSelectedStudentIds(selectedStudentIds.filter(id => id !== s.id));
                              }
                            }}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{s.user.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">ID: {s.enrollmentNo}</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                          {s.enrollments?.[0]?.section?.class?.title ? `${s.enrollments[0].section.class.title} - ` : ''}
                          {s.enrollments?.[0]?.section?.title || 'Unassigned'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBulkPromoteModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || selectedStudentIds.length === 0 || !targetSectionId}
                  className="px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
                >
                  <TrendingUp size={16} />
                  {submitting ? 'Promoting...' : `Promote ${selectedStudentIds.length} Students`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification (z-[999999] at the bottom of DOM tree) */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[999999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
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

    </div>
  );
};
