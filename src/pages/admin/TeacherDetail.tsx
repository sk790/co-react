import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Mail, 
  Phone, 
  Briefcase, 
  Building2, 
  Calendar, 
  MapPin, 
  HeartPulse, 
  Award, 
  Clock, 
  Layers, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  X,
  BookOpen,
  UserCheck,
  ChevronRight,
  Shield,
  Sparkles
} from 'lucide-react';
import { apiClient } from '../../api/axios';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt?: string;
}

interface MasterDataTitle {
  id?: string;
  title: string;
}

interface AssignedSectionItem {
  section?: {
    id: string;
    title: string;
    capacity?: number;
    class?: {
      id: string;
      title: string;
    };
  };
}

interface TeacherDetailItem {
  id: string;
  specialization?: string;
  profileAvatar?: string;
  gender?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  emergencyContactNumber?: string;
  residentialAddress?: string;
  teachingExperience?: number;
  joiningDate?: string;
  createdAt?: string;
  user: UserData;
  designation?: MasterDataTitle;
  department?: MasterDataTitle;
  employmentStatus?: MasterDataTitle;
  sections?: AssignedSectionItem[];
}

export const TeacherDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Component Data States
  const [teacher, setTeacher] = useState<TeacherDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'sections'>('profile');

  // Edit Modal & Form State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    specialization: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Teacher Details
  const fetchTeacherDetails = async (showLoader = true) => {
    if (!id) return;
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await apiClient.get(`/teachers/${id}`);
      if (res.data.success) {
        setTeacher(res.data.data);
      } else {
        showToast(res.data.message || 'Failed to fetch teacher profile', 'error');
      }
    } catch (err: any) {
      console.error('Error fetching teacher details:', err);
      showToast(err.response?.data?.message || 'Teacher not found', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeacherDetails(true);
  }, [id]);

  // Handle Edit Submission
  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher || !editForm.name.trim()) return;

    setSubmitting(true);
    try {
      const res = await apiClient.put(`/teachers/${teacher.id}`, {
        name: editForm.name.trim(),
        phone: editForm.phone.trim() || undefined,
        specialization: editForm.specialization.trim() || undefined
      });

      if (res.data.success) {
        showToast('Teacher profile updated successfully!');
        setIsEditModalOpen(false);
        fetchTeacherDetails(false);
      } else {
        showToast(res.data.message || 'Failed to update teacher', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error updating teacher profile', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Teacher
  const handleDeleteTeacher = async () => {
    if (!teacher) return;
    if (!window.confirm(`Are you sure you want to delete instructor "${teacher.user.name}"?`)) return;

    setDeleting(true);
    try {
      const res = await apiClient.delete(`/teachers/${teacher.id}`);
      if (res.data.success) {
        showToast('Teacher deleted successfully!');
        setTimeout(() => navigate('/admin/teachers'), 1200);
      } else {
        showToast(res.data.message || 'Failed to delete teacher', 'error');
        setDeleting(false);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error deleting teacher', 'error');
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

  if (!teacher) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-lg">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <Users size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Teacher Profile Not Found</h2>
        <p className="text-slate-500 text-xs mb-6">
          The requested faculty member does not exist or may have been deleted.
        </p>
        <button
          onClick={() => navigate('/admin/teachers')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[999999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
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

      {/* Navigation Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/teachers')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl transition-all shadow-2xs"
        >
          <ArrowLeft size={16} /> Back to Faculty Directory
        </button>

        <button
          onClick={() => fetchTeacherDetails(false)}
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white bg-slate-100 rounded-xl transition-colors"
          title="Refresh Profile"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Hero Profile Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar Emoji / Initial Badge */}
            <div className="w-20 h-20 rounded-3xl bg-indigo-600/40 border border-indigo-400/30 text-white font-extrabold flex items-center justify-center text-3xl shadow-inner shrink-0">
              {teacher.profileAvatar || teacher.user.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{teacher.user.name}</h1>
                <span className="px-3 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-full border border-emerald-500/30">
                  {teacher.employmentStatus?.title || 'Active Faculty'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-200/80 mt-1">
                <div className="flex items-center gap-1.5">
                  <Briefcase size={14} className="text-indigo-400" />
                  <span>{teacher.designation?.title || teacher.specialization || 'Faculty Member'}</span>
                </div>
                {teacher.department?.title && (
                  <div className="flex items-center gap-1.5">
                    <Building2 size={14} className="text-indigo-400" />
                    <span>Dept: {teacher.department.title}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Mail size={14} className="text-indigo-400" />
                  <span>{teacher.user.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end w-full sm:w-auto">
            <button
              onClick={() => {
                setEditForm({
                  name: teacher.user.name,
                  phone: teacher.user.phone || '',
                  specialization: teacher.specialization || ''
                });
                setIsEditModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15"
            >
              <Edit3 size={15} /> Edit Profile
            </button>
            <button
              onClick={handleDeleteTeacher}
              disabled={deleting}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              <Trash2 size={15} /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Key Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <BookOpen size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Specialization</span>
            <div className="text-sm font-bold text-slate-900 truncate mt-0.5 max-w-[150px]">
              {teacher.specialization || 'General Teaching'}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Layers size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned Sections</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {teacher.sections?.length || 0}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Experience</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {teacher.teachingExperience ? `${teacher.teachingExperience} Yrs` : 'N/A'}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Calendar size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Date of Joining</span>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <Users size={16} /> Profile Details
        </button>
        <button
          onClick={() => setActiveTab('sections')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sections'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <Layers size={16} /> Assigned Sections ({teacher.sections?.length || 0})
        </button>
      </div>

      {/* TAB 1: PROFILE DETAILS */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Account & Personal Information */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users size={18} />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Personal Information</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Full Name</span>
                <span className="font-bold text-slate-900">{teacher.user.name}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Gender</span>
                <span className="font-bold text-slate-900">{teacher.gender || 'Not specified'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Date of Birth</span>
                <span className="font-bold text-slate-900">
                  {teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Blood Group</span>
                <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  {teacher.bloodGroup || 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 font-medium">Profile Avatar Emoji</span>
                <span className="text-lg">{teacher.profileAvatar || '👨‍🏫'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Professional & Employment */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Briefcase size={18} />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Professional Details</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Designation</span>
                <span className="font-bold text-slate-900">{teacher.designation?.title || 'Faculty'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Department</span>
                <span className="font-bold text-slate-900">{teacher.department?.title || 'General'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Employment Status</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {teacher.employmentStatus?.title || 'Active'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Subject Specialization</span>
                <span className="font-bold text-slate-900">{teacher.specialization || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 font-medium">Teaching Experience</span>
                <span className="font-bold text-indigo-600">
                  {teacher.teachingExperience ? `${teacher.teachingExperience} Years` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Contact & Residential Details */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <MapPin size={18} />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Contact & Address</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Email Address</span>
                <span className="font-bold text-slate-900 truncate max-w-[170px]">{teacher.user.email}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Phone Number</span>
                <span className="font-bold text-slate-900">{teacher.user.phone || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Emergency Contact</span>
                <span className="font-bold text-rose-600">{teacher.emergencyContactNumber || 'N/A'}</span>
              </div>

              <div className="pt-1">
                <span className="block text-slate-500 font-medium mb-1">Residential Address</span>
                <div className="p-3 bg-slate-50 rounded-xl text-slate-800 leading-relaxed border border-slate-100">
                  {teacher.residentialAddress || 'No address registered.'}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: ASSIGNED SECTIONS */}
      {activeTab === 'sections' && (
        <div className="space-y-4">
          {(!teacher.sections || teacher.sections.length === 0) ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-100">
                <Layers size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Sections Assigned</h3>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                {teacher.user.name} is currently not assigned to any class section.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teacher.sections.map((secItem, idx) => {
                const sec = secItem.section || (secItem as any);
                return (
                  <div 
                    key={sec?.id || idx}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                            <Layers size={18} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-base">{sec?.title || 'Section'}</h4>
                            <span className="text-[11px] font-semibold text-purple-600">
                              Class: {sec?.class?.title || 'Class'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 space-y-1">
                        <div>Capacity: {sec?.capacity || 40} Students</div>
                      </div>
                    </div>

                    {sec?.id && (
                      <div className="pt-4 mt-3 border-t border-slate-100 text-right">
                        <Link 
                          to={`/admin/sections/${sec.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
                        >
                          View Section Details <ChevronRight size={14} />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
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
                <h3>Edit Teacher Profile</h3>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateTeacher} className="space-y-4">
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
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Subject / Specialization
                </label>
                <input
                  type="text"
                  value={editForm.specialization}
                  onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
                />
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
