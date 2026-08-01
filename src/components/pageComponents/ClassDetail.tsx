import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Layers,
  UserCheck,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  AlertCircle,
  Search,
  GraduationCap,
  ChevronRight,
  Grid,
  List,
  MapPin,
  ClipboardCheck,
  Calendar,
  Filter
} from 'lucide-react';

import {
  type TeacherUser,
  type TeacherProfile,
  type StudentUser,
  type StudentItem,
  type EnrollmentItem,
  type SectionItem,
  type ClassDetailData,
  type ClassDetailProps
} from '../../types/classDetail';

export type {
  TeacherUser,
  TeacherProfile,
  StudentUser,
  StudentItem,
  EnrollmentItem,
  SectionItem,
  ClassDetailData,
  ClassDetailProps
};

export const ClassDetail: React.FC<ClassDetailProps> = ({
  classData,
  loading = false,
  isRefreshing = false,
  onRefresh,
  backLink,
  backLinkLabel = 'Classes',
  getSectionDetailLink,
  getStudentDetailLink,
  getTeacherDetailLink,
  role = 'ADMIN',
  headerActions,
  onAddSection,
  onEditClass,
  onDeleteClass,
  onEditSection,
  onDeleteSection,
  attendanceLink = role === 'TEACHER' ? '/teacher/attendance' : '/admin/attendance',
  timetableLink = role === 'TEACHER' ? '/teacher/timetable' : '/admin/timetables',
}) => {
  const [activeTab, setActiveTab] = useState<'sections' | 'students'>('sections');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');

  const defaultBackLink = backLink || (role === 'TEACHER' ? '/teacher/classes' : '/admin/classes');

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-48"></div>
        <div className="h-40 bg-slate-200 rounded-3xl w-full"></div>
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
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-12 shadow-xs font-sans">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Class Not Found</h3>
        <p className="text-slate-500 text-xs mb-6">The requested class details could not be found or have been removed.</p>
        <Link
          to={defaultBackLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-purple-600/20"
        >
          <ArrowLeft size={16} />
          Back to {backLinkLabel}
        </Link>
      </div>
    );
  }

  // Consolidate all enrolled students across sections
  const allStudents = (classData.sections || []).flatMap(section =>
    (section.enrollments || []).map(enr => ({
      enrollmentId: enr.id,
      studentId: enr.student?.id || '',
      enrollmentNo: enr.student?.enrollmentNo || 'N/A',
      name: enr.student?.user?.name || 'Unnamed Student',
      email: enr.student?.user?.email || 'No email',
      phone: enr.student?.user?.phone || 'No phone',
      sectionId: section.id,
      sectionTitle: section.title,
      enrolledAt: enr.createdAt
    }))
  );

  const filteredStudents = allStudents.filter(st => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.sectionTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSection = selectedSectionFilter === 'all' || st.sectionId === selectedSectionFilter;
    return matchesSearch && matchesSection;
  });

  const filteredSections = (classData.sections || []).filter(sec =>
    sec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sec.teacher?.user?.name && sec.teacher.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (sec.roomNumber && sec.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to={defaultBackLink} className="hover:text-purple-600 flex items-center gap-1 transition-colors">
          <ArrowLeft size={14} /> {backLinkLabel}
        </Link>
        <ChevronRight size={12} />
        <span className="text-slate-900 font-bold">{classData.title}</span>
      </div>

      {/* Class Overview Banner */}
      <div className="bg-linear-to-r from-slate-900 via-purple-950 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-purple-900/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="p-3.5 bg-purple-500/20 rounded-2xl border border-purple-400/30 text-purple-300 backdrop-blur-xs">
              <BookOpen size={28} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{classData.title}</h1>
                <span className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold rounded-full">
                  {classData.sections?.length || 0} {classData.sections?.length === 1 ? 'Section' : 'Sections'}
                </span>
                {classData.classTeacher?.user?.name && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold rounded-full">
                    <UserCheck size={13} />
                    Class Teacher: {classData.classTeacher.user.name}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-purple-200/80 mt-1 max-w-2xl">
                {classData.description || 'Academic program and sections management overview.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
          {headerActions ? (
            headerActions
          ) : role === 'ADMIN' ? (
            <>
              {onAddSection && (
                <button
                  onClick={onAddSection}
                  className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/30 active:scale-95"
                >
                  <Plus size={16} />
                  Add Section
                </button>
              )}
              {onEditClass && (
                <button
                  onClick={onEditClass}
                  className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors"
                  title="Edit Class Details"
                >
                  <Edit3 size={16} />
                </button>
              )}
              {onDeleteClass && (
                <button
                  onClick={onDeleteClass}
                  className="p-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl border border-rose-800/40 transition-colors"
                  title="Delete Class"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </>
          ) : (
            <>
              <Link
                to={attendanceLink}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/30 active:scale-95"
              >
                <ClipboardCheck size={16} />
                Attendance
              </Link>
              <Link
                to={timetableLink}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-all backdrop-blur-xs"
              >
                <Calendar size={16} />
                Timetable
              </Link>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
            <Layers size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Sections</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{classData.sections?.length || 0}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <GraduationCap size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Enrolled Students</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{allStudents.length}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <UserCheck size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Class Teacher</span>
            <div className="text-sm font-extrabold text-slate-900 mt-0.5 truncate max-w-[180px]">
              {classData.classTeacher?.id && getTeacherDetailLink ? (
                <Link to={getTeacherDetailLink(classData.classTeacher.id)} className="hover:text-purple-600 transition-colors">
                  {classData.classTeacher.user?.name || 'Assigned Teacher'}
                </Link>
              ) : (
                classData.classTeacher?.user?.name || 'Not Assigned'
              )}
            </div>
            {classData.classTeacher?.user?.email && (
              <div className="text-[11px] text-slate-400 font-medium truncate max-w-[180px]">
                {classData.classTeacher.user.email}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar & Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab('sections')}
            className={`flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'sections' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            <Layers size={15} />
            Sections ({classData.sections?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'students' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            <GraduationCap size={15} />
            Enrolled Students ({allStudents.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {activeTab === 'students' && (classData.sections?.length || 0) > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Filter size={14} className="text-slate-400" />
              <select
                value={selectedSectionFilter}
                onChange={(e) => setSelectedSectionFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Sections</option>
                {classData.sections?.map(sec => (
                  <option key={sec.id} value={sec.id}>
                    Section {sec.title} ({sec.enrollments?.length || 0})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative w-full md:w-60">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === 'sections' ? "Search sections..." : "Search students..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
            />
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh Details"
              className="p-2 text-slate-500 hover:text-purple-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          )}

          {activeTab === 'sections' && (
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                title="Grid View"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
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
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-purple-100">
                <Layers size={28} />
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-1">
                {searchTerm ? 'No matching sections' : 'No sections added yet'}
              </h4>
              <p className="text-slate-500 text-xs max-w-sm mx-auto mb-4">
                {searchTerm ? `No sections match "${searchTerm}".` : `Add your first section to organize students in ${classData.title}.`}
              </p>
              {!searchTerm && onAddSection && (
                <button
                  onClick={onAddSection}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20"
                >
                  <Plus size={16} /> Add First Section
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSections.map((sec) => {
                const sectionUrl = getSectionDetailLink ? getSectionDetailLink(sec) : null;

                return (
                  <div
                    key={sec.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Section Card Header */}
                      <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {sectionUrl ? (
                            <Link
                              to={sectionUrl}
                              className="p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl border border-purple-100 font-bold text-sm transition-colors"
                              title="View Section Details"
                            >
                              {sec.title}
                            </Link>
                          ) : (
                            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100 font-bold text-sm">
                              {sec.title}
                            </div>
                          )}
                          <div>
                            <span className="block text-[11px] text-slate-500 font-medium">
                              Capacity: {sec.capacity || 40} seats
                            </span>
                          </div>
                        </div>

                        {(onEditSection || onDeleteSection) && (
                          <div className="flex items-center gap-1">
                            {onEditSection && (
                              <button
                                onClick={() => onEditSection(sec)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Edit Section"
                              >
                                <Edit3 size={15} />
                              </button>
                            )}
                            {onDeleteSection && (
                              <button
                                onClick={() => onDeleteSection(sec)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete Section"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Section Body */}
                      <div className="p-5 space-y-3.5 text-xs">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-500 font-semibold">Room / Lab:</span>
                          {sec.roomNumber ? (
                            <span className="inline-flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100 text-[11px]">
                              <MapPin size={12} className="text-indigo-600" />
                              {sec.roomNumber}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Not Specified</span>
                          )}
                        </div>

                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <UserCheck size={16} className="text-purple-600" />
                            <span className="font-semibold text-slate-700">Section Teacher:</span>
                          </div>
                          <span className="font-bold text-slate-900">
                            {sec.teacher?.user?.name || 'Unassigned'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between px-1">
                          <span className="text-slate-500 font-semibold">Enrolled Students:</span>
                          <span className="font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                            {sec.enrollments?.length || 0} students
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section Footer Actions */}
                    <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                      {sectionUrl ? (
                        <Link
                          to={sectionUrl}
                          className="flex-1 text-center py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                        >
                          Section Details
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedSectionFilter(sec.id);
                            setActiveTab('students');
                          }}
                          className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                        >
                          View Students
                        </button>
                      )}
                      <Link
                        to={attendanceLink}
                        className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold rounded-xl text-xs transition-colors"
                      >
                        Attendance
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST / TABLE VIEW */
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider text-[11px]">
                    <tr>
                      <th className="px-6 py-4">Section Name</th>
                      <th className="px-6 py-4">Room No / Lab</th>
                      <th className="px-6 py-4">Section Teacher</th>
                      <th className="px-6 py-4">Enrolled Students</th>
                      <th className="px-6 py-4">Max Capacity</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSections.map((sec) => {
                      const sectionUrl = getSectionDetailLink ? getSectionDetailLink(sec) : null;

                      return (
                        <tr key={sec.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                            <div className="flex items-center gap-2.5">
                              {sectionUrl ? (
                                <Link
                                  to={sectionUrl}
                                  className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg font-bold text-xs transition-colors"
                                  title="View Section Details"
                                >
                                  {sec.title}
                                </Link>
                              ) : (
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg font-bold text-xs">
                                  {sec.title}
                                </div>
                              )}
                            </div>
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
                          <td className="px-6 py-4 font-semibold text-slate-800">
                            {sec.teacher?.user?.name || 'Unassigned'}
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
                              {sectionUrl && (
                                <Link
                                  to={sectionUrl}
                                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-xl transition-colors text-xs"
                                >
                                  Details
                                </Link>
                              )}
                              {onEditSection && (
                                <button
                                  onClick={() => onEditSection(sec)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Edit Section"
                                >
                                  <Edit3 size={15} />
                                </button>
                              )}
                              {onDeleteSection && (
                                <button
                                  onClick={() => onDeleteSection(sec)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Delete Section"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                              <Link
                                to={attendanceLink}
                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors text-xs"
                              >
                                Attendance
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ENROLLED STUDENTS */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-indigo-100">
                <GraduationCap size={28} />
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-1">No enrolled students found</h4>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                {searchTerm || selectedSectionFilter !== 'all'
                  ? `No students match your filter settings.`
                  : `There are currently no students enrolled in sections for ${classData.title}.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider text-[11px]">
                  <tr>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Roll / Enrollment No</th>
                    <th className="px-6 py-4">Section</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Contact Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st, idx) => {
                    const studentUrl = getStudentDetailLink ? getStudentDetailLink(st.studentId) : null;

                    return (
                      <tr key={st.enrollmentId || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 text-sm whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-xs border border-purple-200">
                              {st.name.charAt(0).toUpperCase()}
                            </div>
                            {studentUrl ? (
                              <Link to={studentUrl} className="hover:text-purple-600 transition-colors">
                                {st.name}
                              </Link>
                            ) : (
                              <span>{st.name}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-indigo-700 whitespace-nowrap">
                          {st.enrollmentNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold">
                            Section {st.sectionTitle}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap font-medium">
                          {st.email}
                        </td>
                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap font-medium">
                          {st.phone}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
