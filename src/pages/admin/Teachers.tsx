import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  Mail, 
  Phone, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Grid, 
  List, 
  UserCheck, 
  Briefcase,
  Building2,
  Calendar,
  MapPin,
  HeartPulse,
  Award,
  Sparkles,
  Shield,
  Clock
} from 'lucide-react';
import { apiClient } from '../../api/axios';

interface UserData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  createdAt?: string;
}

interface AssignedSection {
  section?: {
    id: string;
    title: string;
    class?: {
      id: string;
      title: string;
    };
  };
}

interface TeacherItem {
  id: string;
  specialization?: string;
  gender?: string;
  bloodGroup?: string;
  user: UserData;
  designation?: { id?: string; title: string };
  department?: { id?: string; title: string };
  employmentStatus?: { id?: string; title: string };
  sections?: AssignedSection[];
  teachingExperience?: number;
  joiningDate?: string;
}

interface MasterDataItem {
  id: string;
  type: 'STATUS' | 'DESIGNATION' | 'DEPARTMENT';
  title: string;
}

export const Teachers: React.FC = () => {
  // Main Data States
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [masterData, setMasterData] = useState<MasterDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Display Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Comprehensive Add Teacher Form State
  const [modalError, setModalError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormTab, setAddFormTab] = useState<'personal' | 'professional' | 'contact'>('personal');

  const initialAddFormState = {
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    profileAvatar: '👨‍🏫',
    gender: 'Male',
    dateOfBirth: '',
    bloodGroup: 'O+',
    emergencyContactNumber: '',
    residentialAddress: '',
    designationId: '',
    departmentId: '',
    employmentStatusId: '',
    teachingExperience: 0,
    joiningDate: ''
  };

  const [addForm, setAddForm] = useState(initialAddFormState);

  // Edit Teacher State
  const [editingTeacher, setEditingTeacher] = useState<TeacherItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    specialization: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Teachers list & Master Data
  const fetchInitialData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const [teacherRes, masterRes] = await Promise.allSettled([
        apiClient.get('/teachers'),
        apiClient.get('/master-data')
      ]);

      if (teacherRes.status === 'fulfilled' && teacherRes.value.data.success) {
        setTeachers(teacherRes.value.data.data || []);
      } else {
        showToast('Failed to load teachers list', 'error');
      }

      if (masterRes.status === 'fulfilled' && masterRes.value.data.success) {
        setMasterData(masterRes.value.data.data || []);
      }
    } catch (err: any) {
      console.error('Error fetching initial data:', err);
      showToast('Error loading directory data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInitialData(true);
  }, []);

  // Handle Add Teacher Form Submission
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim()) {
      const msg = 'Full Name and Email Address are required';
      setModalError(msg);
      showToast(msg, 'error');
      return;
    }

    setSubmitting(true);
    setModalError(null);
    try {
      // Format payload according to schema
      const payload: any = {
        name: addForm.name.trim(),
        email: addForm.email.trim(),
        password: addForm.password.trim() || undefined,
        phone: addForm.phone.trim() || undefined,
        specialization: addForm.specialization.trim() || undefined,
        profileAvatar: addForm.profileAvatar || undefined,
        gender: addForm.gender || undefined,
        dateOfBirth: addForm.dateOfBirth ? new Date(addForm.dateOfBirth).toISOString() : undefined,
        bloodGroup: addForm.bloodGroup || undefined,
        emergencyContactNumber: addForm.emergencyContactNumber.trim() || undefined,
        residentialAddress: addForm.residentialAddress.trim() || undefined,
        designationId: addForm.designationId || undefined,
        departmentId: addForm.departmentId || undefined,
        employmentStatusId: addForm.employmentStatusId || undefined,
        teachingExperience: Number(addForm.teachingExperience) || 0,
        joiningDate: addForm.joiningDate ? new Date(addForm.joiningDate).toISOString() : undefined
      };

      const res = await apiClient.post('/teachers', payload);

      if (res.data.success) {
        showToast('Teacher onboarded successfully!');
        setIsAddModalOpen(false);
        setModalError(null);
        setAddForm(initialAddFormState);
        fetchInitialData(false);
      } else {
        const msg = res.data.message || 'Failed to onboard teacher';
        setModalError(msg);
        showToast(msg, 'error');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error onboarding teacher';
      setModalError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Teacher Submission
  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher || !editForm.name.trim()) {
      showToast('Teacher name is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.put(`/teachers/${editingTeacher.id}`, {
        name: editForm.name.trim(),
        phone: editForm.phone.trim() || undefined,
        specialization: editForm.specialization.trim() || undefined
      });

      if (res.data.success) {
        showToast('Teacher profile updated successfully!');
        setEditingTeacher(null);
        fetchInitialData(false);
      } else {
        showToast(res.data.message || 'Failed to update teacher', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error updating teacher', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Teacher
  const handleDeleteTeacher = async (teacherId: string, teacherName: string) => {
    if (!window.confirm(`Are you sure you want to delete teacher "${teacherName}"?`)) return;

    setDeletingId(teacherId);
    try {
      const res = await apiClient.delete(`/teachers/${teacherId}`);
      if (res.data.success) {
        showToast(`Teacher "${teacherName}" deleted successfully!`);
        fetchInitialData(false);
      } else {
        showToast(res.data.message || 'Failed to delete teacher', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error deleting teacher', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter master data by type
  const designations = masterData.filter(m => m.type === 'DESIGNATION');
  const departments = masterData.filter(m => m.type === 'DEPARTMENT');
  const statuses = masterData.filter(m => m.type === 'STATUS');

  // Filter teachers by search term
  const filteredTeachers = teachers.filter(t => 
    t.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.specialization && t.specialization.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.department?.title && t.department.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.designation?.title && t.designation.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Statistics
  const totalTeachersCount = teachers.length;
  const assignedTeachersCount = teachers.filter(t => t.sections && t.sections.length > 0).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 rounded-2xl shadow-xl border border-indigo-900/30">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 rounded-xl border border-indigo-500/30 text-indigo-300">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Teachers Directory</h1>
              <p className="text-sm text-indigo-200/75 mt-0.5">
                Manage teaching staff, configure faculty profiles, and onboard new instructors.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setAddForm(initialAddFormState);
            setAddFormTab('personal');
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all shadow-md shadow-indigo-600/30 self-start sm:self-auto active:scale-95"
        >
          <Plus size={18} />
          Onboard New Teacher
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Faculty</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalTeachersCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <UserCheck size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned Instructors</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{assignedTeachersCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Briefcase size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Departments</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {departments.length > 0 ? departments.length : new Set(teachers.map(t => t.department?.title || t.specialization || 'General')).size}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, subject, dept..."
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
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Directory Display */}
      {loading ? (
        // Skeleton Loader
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredTeachers.length === 0 ? (
        // Empty State
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">
            {searchTerm ? 'No matching faculty members found' : 'No teachers registered yet'}
          </h3>
          <p className="text-slate-500 text-sm max-w-md mb-6">
            {searchTerm 
              ? `We couldn't find any teachers matching "${searchTerm}".` 
              : 'Onboard your first teacher with complete personal, professional, and contact details.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setAddForm(initialAddFormState);
                setAddFormTab('personal');
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all shadow-md shadow-indigo-600/20"
            >
              <Plus size={18} />
              Onboard First Teacher
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        // GRID VIEW
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((t) => (
            <div 
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Card Top Header */}
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-xl border border-indigo-200 shadow-xs">
                      {t.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <Link to={`/admin/teachers/${t.id}`} className="font-bold text-slate-900 text-base hover:text-indigo-600 transition-colors">
                        {t.user.name}
                      </Link>
                      <span className="block text-[11px] font-semibold text-indigo-600">
                        {t.designation?.title || t.specialization || 'Faculty Member'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingTeacher(t);
                        setEditForm({
                          name: t.user.name,
                          phone: t.user.phone || '',
                          specialization: t.specialization || ''
                        });
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Teacher Profile"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteTeacher(t.id, t.user.name)}
                      disabled={deletingId === t.id}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete Teacher"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Contact & Details */}
                <div className="p-5 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{t.user.email}</span>
                  </div>

                  {t.user.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={14} className="text-slate-400 shrink-0" />
                      <span>{t.user.phone}</span>
                    </div>
                  )}

                  {t.department?.title && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building2 size={14} className="text-slate-400 shrink-0" />
                      <span>Department: {t.department.title}</span>
                    </div>
                  )}

                  {t.teachingExperience !== undefined && t.teachingExperience > 0 && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock size={14} className="text-slate-400 shrink-0" />
                      <span>Experience: {t.teachingExperience} Years</span>
                    </div>
                  )}

                  {/* Assigned Sections Chips */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Assigned Sections ({t.sections?.length || 0})
                    </span>
                    {(!t.sections || t.sections.length === 0) ? (
                      <span className="text-slate-400 italic">No assigned classes</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {t.sections.slice(0, 3).map((sec, i) => (
                          <span 
                            key={sec.section?.id || i}
                            className="px-2 py-0.5 bg-purple-50 text-purple-700 font-semibold rounded-md border border-purple-200 text-[11px]"
                          >
                            {sec.section?.class?.title ? `${sec.section.class.title} - ` : ''}{sec.section?.title || 'Section'}
                          </span>
                        ))}
                        {t.sections.length > 3 && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-bold rounded-md border border-purple-300 text-[11px]">
                            +{t.sections.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Joined: {t.joiningDate ? new Date(t.joiningDate).toLocaleDateString() : t.user.createdAt ? new Date(t.user.createdAt).toLocaleDateString() : 'N/A'}</span>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200">
                  {t.employmentStatus?.title || 'Active'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // LIST VIEW TABLE
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Faculty Name</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Designation / Dept</th>
                  <th className="px-6 py-4">Specialization</th>
                  <th className="px-6 py-4">Assigned Sections</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-xs">
                          {t.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link to={`/admin/teachers/${t.id}`} className="hover:text-indigo-600 transition-colors">
                            {t.user.name}
                          </Link>
                          {t.gender && (
                            <span className="block text-[11px] font-normal text-slate-400">{t.gender}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="text-slate-800 font-medium">{t.user.email}</div>
                        {t.user.phone && <div className="text-slate-400">{t.user.phone}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-800">{t.designation?.title || 'Faculty'}</div>
                        {t.department?.title && <div className="text-slate-400">{t.department.title}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {t.specialization || 'General'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 items-center">
                        {(!t.sections || t.sections.length === 0) ? (
                          <span className="text-slate-400 font-normal">—</span>
                        ) : (
                          <>
                            {t.sections.slice(0, 3).map((sec, i) => (
                              <span key={sec.section?.id || i} className="px-2 py-0.5 bg-purple-50 text-purple-700 font-semibold rounded-md border border-purple-200">
                                {sec.section?.class?.title ? `${sec.section.class.title} - ` : ''}{sec.section?.title}
                              </span>
                            ))}
                            {t.sections.length > 3 && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-bold rounded-md border border-purple-300 text-[11px]">
                                +{t.sections.length - 3} more
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingTeacher(t);
                            setEditForm({
                              name: t.user.name,
                              phone: t.user.phone || '',
                              specialization: t.specialization || ''
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteTeacher(t.id, t.user.name)}
                          disabled={deletingId === t.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
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

      {/* MODAL 1: COMPREHENSIVE ONBOARD TEACHER FORM */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600/30 rounded-xl border border-indigo-500/30 text-indigo-300">
                  <Users size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Onboard New Faculty Member</h3>
                  <p className="text-xs text-indigo-200/70 mt-0.5">
                    Complete personal, professional, and contact profile details.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Section Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
              <button
                type="button"
                onClick={() => setAddFormTab('personal')}
                className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 ${
                  addFormTab === 'personal'
                    ? 'bg-white text-indigo-600 border-indigo-600 shadow-xs'
                    : 'text-slate-500 border-transparent hover:text-slate-800'
                }`}
              >
                <Users size={15} />
                1. Personal & Account
              </button>
              <button
                type="button"
                onClick={() => setAddFormTab('professional')}
                className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 ${
                  addFormTab === 'professional'
                    ? 'bg-white text-indigo-600 border-indigo-600 shadow-xs'
                    : 'text-slate-500 border-transparent hover:text-slate-800'
                }`}
              >
                <Briefcase size={15} />
                2. Professional & Status
              </button>
              <button
                type="button"
                onClick={() => setAddFormTab('contact')}
                className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 ${
                  addFormTab === 'contact'
                    ? 'bg-white text-indigo-600 border-indigo-600 shadow-xs'
                    : 'text-slate-500 border-transparent hover:text-slate-800'
                }`}
              >
                <MapPin size={15} />
                3. Address & Emergency
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleAddTeacher} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* TAB 1: PERSONAL & ACCOUNT INFO */}
              {addFormTab === 'personal' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Rajesh Kumar"
                        value={addForm.name}
                        onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. rajesh.kumar@school.com"
                        value={addForm.email}
                        onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Account Password
                      </label>
                      <input
                        type="password"
                        placeholder="Default: SecurePassword123!"
                        value={addForm.password}
                        onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. +919999988888"
                        value={addForm.phone}
                        onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Gender
                      </label>
                      <select
                        value={addForm.gender}
                        onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800 bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={addForm.dateOfBirth}
                        onChange={(e) => setAddForm({ ...addForm, dateOfBirth: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Blood Group
                      </label>
                      <select
                        value={addForm.bloodGroup}
                        onChange={(e) => setAddForm({ ...addForm, bloodGroup: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800 bg-white"
                      >
                        {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PROFESSIONAL & STATUS */}
              {addFormTab === 'professional' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Subject / Specialization
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Quantum Physics"
                        value={addForm.specialization}
                        onChange={(e) => setAddForm({ ...addForm, specialization: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Designation
                      </label>
                      <select
                        value={addForm.designationId}
                        onChange={(e) => setAddForm({ ...addForm, designationId: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800 bg-white"
                      >
                        <option value="">-- Select Designation --</option>
                        {designations.map(d => (
                          <option key={d.id} value={d.id}>{d.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Department
                      </label>
                      <select
                        value={addForm.departmentId}
                        onChange={(e) => setAddForm({ ...addForm, departmentId: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800 bg-white"
                      >
                        <option value="">-- Select Department --</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Employment Status
                      </label>
                      <select
                        value={addForm.employmentStatusId}
                        onChange={(e) => setAddForm({ ...addForm, employmentStatusId: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800 bg-white"
                      >
                        <option value="">-- Select Status --</option>
                        {statuses.map(s => (
                          <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Teaching Experience (Years)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 5"
                        value={addForm.teachingExperience}
                        onChange={(e) => setAddForm({ ...addForm, teachingExperience: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Joining Date
                      </label>
                      <input
                        type="date"
                        value={addForm.joiningDate}
                        onChange={(e) => setAddForm({ ...addForm, joiningDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CONTACT & ADDRESS */}
              {addFormTab === 'contact' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Emergency Contact Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +919999955555"
                      value={addForm.emergencyContactNumber}
                      onChange={(e) => setAddForm({ ...addForm, emergencyContactNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Residential Address
                    </label>
                    <textarea
                      placeholder="Street name, landmark, City, Pin..."
                      value={addForm.residentialAddress}
                      onChange={(e) => setAddForm({ ...addForm, residentialAddress: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800 h-24 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex gap-2">
                  {addFormTab !== 'personal' && (
                    <button
                      type="button"
                      onClick={() => setAddFormTab(addFormTab === 'contact' ? 'professional' : 'personal')}
                      className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      ← Previous Section
                    </button>
                  )}
                  {addFormTab !== 'contact' && (
                    <button
                      type="button"
                      onClick={() => setAddFormTab(addFormTab === 'personal' ? 'professional' : 'contact')}
                      className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                    >
                      Next Section →
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Onboard Teacher'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT TEACHER */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Edit3 className="text-indigo-600" size={20} />
                <h3>Edit Teacher Profile</h3>
              </div>
              <button 
                onClick={() => setEditingTeacher(null)} 
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
                  onClick={() => setEditingTeacher(null)}
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
