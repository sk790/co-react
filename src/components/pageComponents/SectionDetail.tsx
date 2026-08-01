import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Layers,
  BookOpen,
  Users,
  UserCheck,
  Edit3,
  Trash2,
  RefreshCw,
  AlertCircle,
  Search,
  GraduationCap,
  Mail,
  Phone,
  Clock,
  MapPin,
  ChevronRight,
  ClipboardCheck,
  Printer,
  Filter,
  Plus,
  Calendar,
  Briefcase
} from 'lucide-react';
import {
  type SectionDetailData,
  type PeriodItem,
  type SectionDetailProps,
  type EnrollmentItem
} from '../../types/sectionDetail';

export type { SectionDetailData, PeriodItem, SectionDetailProps };

export const SectionDetail: React.FC<SectionDetailProps> = ({
  section,
  periods = [],
  loading = false,
  timetableLoading = false,
  isRefreshing = false,
  onRefresh,
  backLink,
  backLinkLabel = 'Class Details',
  getClassDetailLink,
  getStudentDetailLink,
  getTeacherDetailLink,
  role = 'ADMIN',
  headerActions,
  onEditSection,
  onDeleteSection,
  onAddPeriod,
  onEditPeriod,
  onDeletePeriod,
  attendanceLink = role === 'TEACHER' ? '/teacher/attendance' : '/admin/attendance',
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'timetable' | 'instructor'>('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('ALL');

  const defaultBackLink = backLink || (section?.classId ? (role === 'TEACHER' ? `/teacher/classes/${section.classId}` : `/admin/classes/${section.classId}`) : (role === 'TEACHER' ? '/teacher/classes' : '/admin/classes'));

  // Printable Timetable Function
  const handlePrintTimetable = (mode: 'day' | 'week') => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return;

    const targetDay = selectedDayFilter;
    const daysList = (mode === 'day' && targetDay !== 'ALL')
      ? [targetDay]
      : ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

    const filteredForPrint = periods.filter(p => daysList.includes(p.dayOfWeek.toUpperCase()));

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Timetable - Section ${section?.title || ''} (${section?.class?.title || ''})</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #0f172a; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; }
            .title { font-size: 24px; font-weight: 800; color: #1e1b4b; margin: 0; }
            .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
            .grid { width: 100%; border-collapse: collapse; margin-top: 16px; }
            .grid th, .grid td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; font-size: 13px; }
            .grid th { background-color: #f8fafc; font-weight: 700; color: #334155; }
            .day-badge { font-weight: 800; color: #4338ca; text-transform: uppercase; font-size: 11px; }
            .footer { margin-top: 32px; font-size: 11px; color: #94a3b8; text-align: center; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">ClassOrbit Routine Schedule</h1>
            <div class="subtitle">Class: <strong>${section?.class?.title || 'N/A'}</strong> | Section: <strong>${section?.title || 'N/A'}</strong> | Room: <strong>${section?.roomNumber || 'N/A'}</strong></div>
          </div>

          <table class="grid">
            <thead>
              <tr>
                <th>Day</th>
                <th>Time Window</th>
                <th>Subject Name</th>
                <th>Assigned Instructor</th>
              </tr>
            </thead>
            <tbody>
              ${filteredForPrint.length === 0 ? '<tr><td colspan="4" style="text-align:center;">No periods scheduled</td></tr>' : ''}
              ${filteredForPrint.map(p => `
                <tr>
                  <td><span class="day-badge">${p.dayOfWeek}</span></td>
                  <td><strong>${p.startTime} - ${p.endTime}</strong></td>
                  <td>${p.subject}</td>
                  <td>${p.instructor?.user?.name || 'Unassigned'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">Generated on ${new Date().toLocaleString()} • ClassOrbit Academic Portal</div>
          <script>
            window.onload = () => { window.print(); };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-48"></div>
        <div className="h-40 bg-slate-200 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-xs font-sans">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Section Not Found</h2>
        <p className="text-slate-500 text-xs mb-6">
          The requested section details do not exist or may have been deleted.
        </p>
        <Link
          to={defaultBackLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20"
        >
          <ArrowLeft size={16} /> Back to {backLinkLabel}
        </Link>
      </div>
    );
  }

  const enrolledStudents = section.enrollments || [];
  const filteredStudents = enrolledStudents.filter(enr => {
    const name = enr.student?.user?.name || '';
    const email = enr.student?.user?.email || '';
    const roll = enr.student?.enrollmentNo || '';
    const query = searchTerm.toLowerCase();
    return name.toLowerCase().includes(query) || email.toLowerCase().includes(query) || roll.toLowerCase().includes(query);
  });

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const filteredPeriods = periods.filter(p => {
    if (selectedDayFilter === 'ALL') return true;
    return p.dayOfWeek.toUpperCase() === selectedDayFilter.toUpperCase();
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to={defaultBackLink} className="hover:text-purple-600 flex items-center gap-1 transition-colors">
            <ArrowLeft size={14} /> {backLinkLabel}
          </Link>
          <ChevronRight size={12} />
          <span className="text-slate-900 font-bold">{section.class?.title || 'Class'} • {section.title}</span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 text-slate-500 hover:text-purple-600 hover:bg-white bg-slate-100 rounded-xl transition-colors"
            title="Refresh Details"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-400/30 text-purple-300 backdrop-blur-xs">
              <Layers size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  {section.class?.title || 'Academic Class'}
                </span>
                <span className="px-2.5 py-0.5 bg-purple-500/30 text-purple-200 text-xs font-extrabold rounded-full border border-purple-400/30">
                  {section.title}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
                {section.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-200/80 pt-2">
            <div className="flex items-center gap-1.5">
              <GraduationCap size={14} className="text-purple-400" />
              <span>Instructor: <strong className="text-white">{section.teacher?.user?.name || 'Unassigned'}</strong></span>
            </div>
            {section.roomNumber && (
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-purple-400" />
                <span>Room / Lab: <strong className="text-white">{section.roomNumber}</strong></span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-purple-400" />
              <span>Capacity: <strong className="text-white">{enrolledStudents.length} / {section.capacity || 40} Students</strong></span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {headerActions ? (
            headerActions
          ) : role === 'ADMIN' ? (
            <>
              {onAddPeriod && (
                <button
                  onClick={onAddPeriod}
                  className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/30 active:scale-95"
                >
                  <Plus size={16} /> Add Period
                </button>
              )}
              {onEditSection && (
                <button
                  onClick={onEditSection}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15"
                >
                  <Edit3 size={15} /> Edit Section
                </button>
              )}
              {onDeleteSection && (
                <button
                  onClick={onDeleteSection}
                  className="flex items-center gap-2 px-4 py-2.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all"
                >
                  <Trash2 size={15} /> Delete
                </button>
              )}
            </>
          ) : (
            <Link
              to={attendanceLink}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/30 active:scale-95"
            >
              <ClipboardCheck size={16} /> Mark Section Attendance
            </Link>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
            <Users size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Students</span>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">{enrolledStudents.length}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <UserCheck size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Capacity</span>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">{section.capacity || 40} seats</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <GraduationCap size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Faculty In-Charge</span>
            <div className="text-sm font-extrabold text-slate-900 truncate mt-0.5 max-w-[150px]">
              {section.teacher?.user?.name || 'Unassigned'}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <MapPin size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Room / Hall</span>
            <div className="text-sm font-extrabold text-slate-900 mt-0.5">
              {section.roomNumber || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'students'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Users size={16} /> Enrolled Roster ({enrolledStudents.length})
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'timetable'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Clock size={16} /> Routine Timetable ({periods.length})
          </button>
          <button
            onClick={() => setActiveTab('instructor')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'instructor'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <GraduationCap size={16} /> Instructor Info
          </button>
        </div>

        {/* Timetable Print Actions */}
        {activeTab === 'timetable' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePrintTimetable('day')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
            >
              <Printer size={14} /> Print Day Routine
            </button>
            <button
              onClick={() => handlePrintTimetable('week')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold rounded-xl transition-all"
            >
              <Printer size={14} /> Print Weekly Routine
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: ENROLLED STUDENTS */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full max-w-sm">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
              />
            </div>
            <span className="text-xs font-bold text-slate-500">
              Showing {filteredStudents.length} of {enrolledStudents.length} students
            </span>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-100">
                <Users size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Enrolled Students Found</h3>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                {searchTerm ? 'No student matches your search query.' : 'There are currently no students assigned to this section.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">#</th>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Enrollment / Roll ID</th>
                    <th className="px-6 py-4">Email Address</th>
                    <th className="px-6 py-4">Enrolled Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((enr: EnrollmentItem, idx: number) => {
                    const st = enr.student;
                    const stId = st?.id || enr.studentId;
                    const studentUrl = stId && getStudentDetailLink ? getStudentDetailLink(stId) : null;

                    return (
                      <tr key={enr.id || idx} className="hover:bg-purple-50/30 transition-colors">
                        <td className="px-6 py-4 text-slate-400 font-mono font-semibold">{idx + 1}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {studentUrl ? (
                            <Link to={studentUrl} className="hover:text-purple-600 transition-colors">
                              {st?.user?.name || 'Unnamed Student'}
                            </Link>
                          ) : (
                            <span>{st?.user?.name || 'Unnamed Student'}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-indigo-700">
                          {st?.enrollmentNo || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{st?.user?.email || 'N/A'}</td>
                        <td className="px-6 py-4 text-slate-500">
                          {enr.createdAt ? new Date(enr.createdAt).toLocaleDateString() : 'N/A'}
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

      {/* TAB 2: ROUTINE TIMETABLE */}
      {activeTab === 'timetable' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <Filter size={16} className="text-slate-400" />
              <label className="text-xs font-bold text-slate-600">Filter Day:</label>
              <select
                value={selectedDayFilter}
                onChange={(e) => setSelectedDayFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/20"
              >
                <option value="ALL">All Schedule Days</option>
                {daysOfWeek.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {role === 'ADMIN' && onAddPeriod && (
              <button
                onClick={onAddPeriod}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Plus size={14} /> Add Timetable Period
              </button>
            )}
          </div>

          {timetableLoading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center animate-pulse">
              <div className="h-6 w-32 bg-slate-200 rounded mx-auto mb-3"></div>
              <div className="h-4 w-48 bg-slate-200 rounded mx-auto"></div>
            </div>
          ) : filteredPeriods.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                <Clock size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Timetable Periods Scheduled</h3>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                There are no routine lecture periods scheduled for this section.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Day</th>
                    <th className="px-6 py-4">Time Window</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Instructor</th>
                    {role === 'ADMIN' && (onEditPeriod || onDeletePeriod) && (
                      <th className="px-6 py-4 text-right">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPeriods.map((period: PeriodItem) => (
                    <tr key={period.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-bold rounded-lg border border-purple-200 uppercase tracking-wider text-[11px]">
                          {period.dayOfWeek}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-800">
                        {period.startTime} - {period.endTime}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{period.subject}</td>
                      <td className="px-6 py-4 text-slate-600">{period.instructor?.user?.name || 'Unassigned'}</td>
                      {role === 'ADMIN' && (onEditPeriod || onDeletePeriod) && (
                        <td className="px-6 py-4 text-right space-x-2">
                          {onEditPeriod && (
                            <button
                              onClick={() => onEditPeriod(period)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit Period"
                            >
                              <Edit3 size={15} />
                            </button>
                          )}
                          {onDeletePeriod && (
                            <button
                              onClick={() => onDeletePeriod(period.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Period"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INSTRUCTOR INFO */}
      {activeTab === 'instructor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <GraduationCap size={18} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Section Instructor Profile</h3>
            </div>

            {!section.teacher ? (
              <div className="py-8 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No instructor is assigned to this section yet.
              </div>
            ) : (
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500 font-semibold">Faculty Name</span>
                  <span className="font-bold text-slate-900">{section.teacher.user?.name || 'Unnamed'}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500 font-semibold">Specialization</span>
                  <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                    {section.teacher.specialization || 'General Faculty'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500 font-semibold">Email</span>
                  <span className="font-bold text-slate-900">{section.teacher.user?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-500 font-semibold">Phone</span>
                  <span className="font-bold text-slate-900">{section.teacher.user?.phone || 'N/A'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <BookOpen size={18} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Class Context</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-semibold">Parent Class</span>
                <span className="font-bold text-slate-900">{section.class?.title || 'Academic Class'}</span>
              </div>

              {section.class?.description && (
                <div className="py-2 text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {section.class.description}
                </div>
              )}

              {section.classId && getClassDetailLink && (
                <div className="pt-3 border-t border-slate-100 text-right">
                  <Link
                    to={getClassDetailLink(section.classId)}
                    className="inline-flex items-center gap-1 font-bold text-purple-600 hover:underline"
                  >
                    View Parent Class Overview →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
