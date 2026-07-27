import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  GraduationCap, 
  Mail, 
  Phone, 
  Layers, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  X,
  BookOpen,
  Calendar,
  Hash,
  ChevronRight,
  Shield,
  Sparkles,
  Users
} from 'lucide-react';
import { apiClient } from '../../api/axios';

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

interface StudentDetailItem {
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

export const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Data States
  const [student, setStudent] = useState<StudentDetailItem | null>(null);
  const [sectionsOptions, setSectionsOptions] = useState<SectionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'academic'>('profile');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    enrollmentNo: '',
    sectionId: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Student Details & Sections
  const fetchStudentDetails = async (showLoader = true) => {
    if (!id) return;
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const [res, classesRes] = await Promise.allSettled([
        apiClient.get(`/students/${id}`),
        apiClient.get('/classes')
      ]);

      if (res.status === 'fulfilled' && res.value.data.success) {
        setStudent(res.value.data.data);
      } else {
        showToast('Student record not found', 'error');
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
      console.error('Error fetching student details:', err);
      showToast('Error loading student profile', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudentDetails(true);
  }, [id]);

  // Handle Edit Student
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !editForm.name.trim()) return;

    setSubmitting(true);
    try {
      const res = await apiClient.put(`/students/${student.id}`, {
        name: editForm.name.trim(),
        enrollmentNo: editForm.enrollmentNo.trim() || undefined,
        sectionId: editForm.sectionId
      });

      if (res.data.success) {
        showToast('Student profile updated successfully!');
        setIsEditModalOpen(false);
        fetchStudentDetails(false);
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
  const handleDeleteStudent = async () => {
    if (!student) return;
    if (!window.confirm(`Are you sure you want to remove student "${student.user.name}"?`)) return;

    setDeleting(true);
    try {
      const res = await apiClient.delete(`/students/${student.id}`);
      if (res.data.success) {
        showToast('Student removed successfully!');
        setTimeout(() => navigate('/admin/students'), 1200);
      } else {
        showToast(res.data.message || 'Failed to remove student', 'error');
        setDeleting(false);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error deleting student', 'error');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 rounded-xl"></div>
        <div className="h-44 bg-slate-200 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-lg">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <GraduationCap size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Student Profile Not Found</h2>
        <p className="text-slate-500 text-xs mb-6">
          The requested student profile does not exist or may have been removed.
        </p>
        <button
          onClick={() => navigate('/admin/students')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
        >
          <ArrowLeft size={16} /> Back to Student Roster
        </button>
      </div>
    );
  }

  const primaryEnrollment = student.enrollments && student.enrollments.length > 0 ? student.enrollments[0] : null;

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

      {/* Navigation Back Control */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/students')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl transition-all shadow-2xs"
        >
          <ArrowLeft size={16} /> Back to Student Roster
        </button>

        <button
          onClick={() => fetchStudentDetails(false)}
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white bg-slate-100 rounded-xl transition-colors"
          title="Refresh Record"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-purple-600/40 border border-purple-400/30 text-white font-extrabold flex items-center justify-center text-3xl shadow-inner shrink-0">
              🎓
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{student.user.name}</h1>
                <span className="px-3 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-full border border-emerald-500/30">
                  Active Student
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-200/80 mt-1">
                <div className="flex items-center gap-1.5">
                  <Hash size={14} className="text-indigo-400" />
                  <span>Enrollment ID: <strong className="text-white">{student.enrollmentNo}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail size={14} className="text-indigo-400" />
                  <span>{student.user.email}</span>
                </div>
                {primaryEnrollment?.section?.title && (
                  <div className="flex items-center gap-1.5">
                    <Layers size={14} className="text-purple-400" />
                    <span>Section: {primaryEnrollment.section.class?.title ? `${primaryEnrollment.section.class.title} - ` : ''}{primaryEnrollment.section.title}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end w-full sm:w-auto">
            <button
              onClick={() => {
                const currentSecId = student.enrollments && student.enrollments.length > 0 ? student.enrollments[0].section?.id || '' : '';
                setEditForm({
                  name: student.user.name,
                  enrollmentNo: student.enrollmentNo,
                  sectionId: currentSecId
                });
                setIsEditModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15"
            >
              <Edit3 size={15} /> Edit Student
            </button>
            <button
              onClick={handleDeleteStudent}
              disabled={deleting}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              <Trash2 size={15} /> Remove
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Hash size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Enrollment ID</span>
            <div className="text-sm font-bold text-slate-900 truncate mt-0.5">
              {student.enrollmentNo}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <BookOpen size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Class</span>
            <div className="text-sm font-bold text-slate-900 truncate mt-0.5 max-w-[150px]">
              {primaryEnrollment?.section?.class?.title || 'Unassigned'}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Layers size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Section</span>
            <div className="text-sm font-bold text-slate-900 truncate mt-0.5">
              {primaryEnrollment?.section?.title || 'Unassigned'}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Calendar size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Enrolled On</span>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <GraduationCap size={16} /> Student Profile
        </button>
        <button
          onClick={() => setActiveTab('academic')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'academic'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <Layers size={16} /> Section Enrollments ({student.enrollments?.length || 0})
        </button>
      </div>

      {/* TAB 1: PROFILE DETAILS */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Student Information */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <GraduationCap size={18} />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Student Information</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Full Name</span>
                <span className="font-bold text-slate-900">{student.user.name}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Enrollment ID</span>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  {student.enrollmentNo}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Contact Email</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">{student.user.email}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Account Status</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 font-medium">Registration Date</span>
                <span className="font-bold text-slate-900">
                  {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Current Class & Section Details */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <BookOpen size={18} />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Academic Assignment</h3>
            </div>

            {(!student.enrollments || student.enrollments.length === 0) ? (
              <div className="py-8 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Student is currently unassigned to any class section.
              </div>
            ) : (
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Class Name</span>
                  <span className="font-bold text-slate-900">{primaryEnrollment?.section?.class?.title || 'Class'}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Section Title</span>
                  <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                    {primaryEnrollment?.section?.title || 'Section'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-medium">Capacity</span>
                  <span className="font-bold text-slate-900">{primaryEnrollment?.section?.class ? '40 Seats' : 'N/A'}</span>
                </div>

                {primaryEnrollment?.section?.id && (
                  <div className="pt-2 border-t border-slate-100 text-right">
                    <Link
                      to={`/admin/sections/${primaryEnrollment.section.id}`}
                      className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:underline"
                    >
                      View Section Details →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: ACADEMIC ENROLLMENTS */}
      {activeTab === 'academic' && (
        <div className="space-y-4">
          {(!student.enrollments || student.enrollments.length === 0) ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-100">
                <Layers size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Enrollments Found</h3>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                {student.user.name} is currently not enrolled in any class section.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {student.enrollments.map((enr, idx) => (
                <div 
                  key={enr.id || idx}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                          <Layers size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{enr.section?.title || 'Section'}</h4>
                          <span className="text-[11px] font-semibold text-purple-600">
                            Class: {enr.section?.class?.title || 'Class'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {enr.section?.id && (
                    <div className="pt-4 mt-3 border-t border-slate-100 text-right">
                      <Link 
                        to={`/admin/sections/${enr.section.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
                      >
                        View Section Roster <ChevronRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Edit3 className="text-indigo-600" size={20} />
                <h3>Edit Student Profile</h3>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
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
                  Enrollment ID / Roll No
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
                  onClick={() => setIsEditModalOpen(false)}
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

    </div>
  );
};
