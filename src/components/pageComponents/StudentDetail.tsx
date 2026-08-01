import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  GraduationCap,
  Mail,
  Phone,
  Layers,
  Edit3,
  Trash2,
  RefreshCw,
  AlertCircle,
  BookOpen,
  Calendar,
  Hash,
  ChevronRight,
  User,
  ClipboardCheck
} from 'lucide-react';
import {
  type StudentDetailItem,
  type StudentDetailProps,
  type EnrollmentItem
} from '../../types/studentDetail';

export type { StudentDetailItem, StudentDetailProps };

export const StudentDetail: React.FC<StudentDetailProps> = ({
  student,
  loading = false,
  isRefreshing = false,
  onRefresh,
  backLink,
  backLinkLabel = 'Enrolled Students',
  getSectionDetailLink,
  getClassDetailLink,
  role = 'ADMIN',
  headerActions,
  onEditStudent,
  onDeleteStudent,
  isDeleting = false,
  attendanceLink = role === 'TEACHER' ? '/teacher/attendance' : '/admin/attendance',
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'academic'>('profile');

  const defaultBackLink = backLink || (role === 'TEACHER' ? '/teacher/students' : '/admin/students');

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-48"></div>
        <div className="h-40 bg-slate-200 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-24 bg-slate-200 rounded-2xl"></div>
          <div className="h-24 bg-slate-200 rounded-2xl"></div>
          <div className="h-24 bg-slate-200 rounded-2xl"></div>
          <div className="h-24 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-xs font-sans">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Student Profile Not Found</h2>
        <p className="text-slate-500 text-xs mb-6">
          The requested student profile does not exist or may have been removed.
        </p>
        <Link
          to={defaultBackLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
        >
          <ArrowLeft size={16} /> Back to {backLinkLabel}
        </Link>
      </div>
    );
  }

  const primaryEnrollment = student.enrollments && student.enrollments.length > 0 ? student.enrollments[0] : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to={defaultBackLink} className="hover:text-indigo-600 flex items-center gap-1 transition-colors">
            <ArrowLeft size={14} /> {backLinkLabel}
          </Link>
          <ChevronRight size={12} />
          <span className="text-slate-900 font-bold">{student.user.name}</span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white bg-slate-100 rounded-xl transition-colors"
            title="Refresh Profile"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-purple-600/40 border border-purple-400/30 text-white font-extrabold flex items-center justify-center text-3xl shadow-inner shrink-0 backdrop-blur-xs">
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
                    <span>
                      {primaryEnrollment.section.class?.title ? `${primaryEnrollment.section.class.title} • ` : ''}
                      Section {primaryEnrollment.section.title}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end w-full sm:w-auto">
            {headerActions ? (
              headerActions
            ) : role === 'ADMIN' ? (
              <>
                {onEditStudent && (
                  <button
                    onClick={onEditStudent}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15"
                  >
                    <Edit3 size={15} /> Edit Student
                  </button>
                )}
                {onDeleteStudent && (
                  <button
                    onClick={onDeleteStudent}
                    disabled={isDeleting}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    <Trash2 size={15} /> {isDeleting ? 'Removing...' : 'Remove'}
                  </button>
                )}
              </>
            ) : (
              <Link
                to={attendanceLink}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/30 active:scale-95"
              >
                <ClipboardCheck size={16} /> Mark Attendance
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <Hash size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Enrollment ID</span>
            <div className="text-sm font-extrabold text-slate-900 truncate mt-0.5 font-mono">
              {student.enrollmentNo}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
            <BookOpen size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Class</span>
            <div className="text-sm font-extrabold text-slate-900 truncate mt-0.5 max-w-[150px]">
              {primaryEnrollment?.section?.class?.title || 'Unassigned'}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <Layers size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Section</span>
            <div className="text-sm font-extrabold text-slate-900 truncate mt-0.5">
              {primaryEnrollment?.section?.title ? `Section ${primaryEnrollment.section.title}` : 'Unassigned'}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <Calendar size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Enrolled On</span>
            <div className="text-sm font-extrabold text-slate-900 mt-0.5">
              {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <GraduationCap size={16} /> Student Profile
        </button>
        <button
          onClick={() => setActiveTab('academic')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'academic'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <Layers size={16} /> Section Enrollments ({student.enrollments?.length || 0})
        </button>
      </div>

      {/* TAB 1: PROFILE DETAILS */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <User size={18} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Student Information</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-semibold">Full Name</span>
                <span className="font-bold text-slate-900">{student.user.name}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-semibold">Enrollment ID</span>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                  {student.enrollmentNo}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-semibold">Contact Email</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">{student.user.email}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-semibold">Contact Phone</span>
                <span className="font-bold text-slate-900">{student.user.phone || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 font-semibold">Account Status</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                  Active Student
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <BookOpen size={18} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Academic Assignment</h3>
            </div>

            {(!student.enrollments || student.enrollments.length === 0) ? (
              <div className="py-8 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Student is currently unassigned to any class section.
              </div>
            ) : (
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500 font-semibold">Class Name</span>
                  <span className="font-bold text-slate-900">{primaryEnrollment?.section?.class?.title || 'Class'}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500 font-semibold">Section Title</span>
                  <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                    Section {primaryEnrollment?.section?.title || 'N/A'}
                  </span>
                </div>

                {primaryEnrollment?.section?.id && getSectionDetailLink && (
                  <div className="pt-3 border-t border-slate-100 text-right">
                    <Link
                      to={getSectionDetailLink(primaryEnrollment.section.id)}
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
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Active Enrollments</h3>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                {student.user.name} is currently not enrolled in any class section.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {student.enrollments.map((enr: EnrollmentItem, idx: number) => {
                const secUrl = enr.section?.id && getSectionDetailLink ? getSectionDetailLink(enr.section.id) : null;

                return (
                  <div
                    key={enr.id || idx}
                    className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl font-bold text-xs">
                            {enr.section?.title || 'Section'}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-base">Section {enr.section?.title || 'Section'}</h4>
                            <span className="text-[11px] font-semibold text-purple-600">
                              Class: {enr.section?.class?.title || 'Class'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {secUrl && (
                      <div className="pt-4 mt-3 border-t border-slate-100 text-right">
                        <Link
                          to={secUrl}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
                        >
                          View Section Roster <ChevronRight size={14} />
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
    </div>
  );
};
