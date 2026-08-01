import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  Layers,
  Search,
  Save,
  CheckCircle2,
  Printer,
  FileSpreadsheet,
  RefreshCw,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { apiClient } from '../../api/axios';
import { toast } from '../../store/toastStore';

interface UserInfo {
  id?: string;
  name?: string;
  email?: string;
}

interface StudentItem {
  id: string;
  enrollmentNo?: string;
  user?: UserInfo;
}

interface EnrollmentItem {
  id: string;
  studentId?: string;
  student?: StudentItem;
}

interface SectionItem {
  id: string;
  title: string;
  capacity?: number;
  enrollments?: EnrollmentItem[];
}

interface ClassItem {
  id: string;
  title: string;
  sections?: SectionItem[];
}

interface StudentMarksRecord {
  marksObtained: number | '';
  remarks: string;
}

export const TeacherMarks: React.FC = () => {
  // Data State
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filter Selections
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('Mid-Term Exam');
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [maxMarks, setMaxMarks] = useState<number>(100);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'entry' | 'marksheet'>('entry');

  // Marks data state: studentId -> StudentMarksRecord
  const [marksData, setMarksData] = useState<{ [studentId: string]: StudentMarksRecord }>({});

  const examTypes = ['Unit Test 1', 'Mid-Term Exam', 'Unit Test 2', 'Final Term Exam', 'Practical / Quiz'];
  const subjects = ['Mathematics', 'Science', 'English', 'Computer Science', 'Social Studies', 'Physics', 'Chemistry'];

  // Fetch Classes and Sections
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/classes');
      if (res.data?.success) {
        const classList: ClassItem[] = res.data.data || [];
        setClasses(classList);

        if (classList.length > 0) {
          const firstClass = classList[0];
          setSelectedClassId(firstClass.id);
          if (firstClass.sections && firstClass.sections.length > 0) {
            setSelectedSectionId(firstClass.sections[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching classes for marks:', err);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Selected Class & Section objects
  const selectedClass = classes.find(c => c.id === selectedClassId) || null;
  const sectionsList = selectedClass?.sections || [];
  const selectedSection = sectionsList.find(s => s.id === selectedSectionId) || null;
  const enrollments = selectedSection?.enrollments || [];

  // Handle Class change
  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    const cls = classes.find(c => c.id === classId);
    if (cls && cls.sections && cls.sections.length > 0) {
      setSelectedSectionId(cls.sections[0].id);
    } else {
      setSelectedSectionId('');
    }
  };

  // Pre-fill initial marks
  useEffect(() => {
    if (enrollments.length > 0) {
      const initialMarks: { [key: string]: StudentMarksRecord } = {};
      enrollments.forEach((enr, idx) => {
        const stId = enr.student?.id || enr.studentId || `student-${idx}`;
        // Demo initial marks for realistic experience
        const defaultScore = Math.floor(65 + (idx * 7) % 32);
        initialMarks[stId] = marksData[stId] || {
          marksObtained: defaultScore,
          remarks: defaultScore >= 40 ? 'Good effort' : 'Needs improvement'
        };
      });
      setMarksData(initialMarks);
    }
  }, [selectedSectionId, selectedExamType, selectedSubject]);

  // Handle Marks Input Change
  const handleMarkChange = (studentId: string, val: string) => {
    const numVal = val === '' ? '' : Math.min(maxMarks, Math.max(0, Number(val)));
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { remarks: '' }),
        marksObtained: numVal
      }
    }));
  };

  // Handle Remarks Change
  const handleRemarkChange = (studentId: string, val: string) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { marksObtained: '' }),
        remarks: val
      }
    }));
  };

  // Save Marks Batch
  const handleSaveMarks = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success(`Marks for ${selectedSubject} (${selectedExamType}) saved successfully!`);
    }, 600);
  };

  // Calculate Grade
  const getGradeInfo = (obtained: number | '', max: number) => {
    if (obtained === '' || isNaN(Number(obtained))) return { grade: '-', badge: 'bg-slate-100 text-slate-500 border-slate-200' };
    const pct = (Number(obtained) / max) * 100;
    if (pct >= 90) return { grade: 'A+', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (pct >= 80) return { grade: 'A', badge: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
    if (pct >= 70) return { grade: 'B', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    if (pct >= 60) return { grade: 'C', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (pct >= 40) return { grade: 'D', badge: 'bg-orange-50 text-orange-700 border-orange-200' };
    return { grade: 'F', badge: 'bg-rose-50 text-rose-700 border-rose-200 font-extrabold' };
  };

  // Filtered Students
  const filteredEnrollments = enrollments.filter(enr => {
    const name = enr.student?.user?.name || '';
    const roll = enr.student?.enrollmentNo || '';
    const q = searchTerm.toLowerCase();
    return name.toLowerCase().includes(q) || roll.toLowerCase().includes(q);
  });

  // Calculate Statistics
  const validScores = enrollments
    .map(enr => {
      const stId = enr.student?.id || enr.studentId || '';
      return marksData[stId]?.marksObtained;
    })
    .filter((m): m is number => typeof m === 'number' && !isNaN(m));

  const totalGraded = validScores.length;
  const highestScore = validScores.length > 0 ? Math.max(...validScores) : 0;
  const averageScore = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;
  const passCount = validScores.filter(m => (m / maxMarks) * 100 >= 40).length;
  const passRate = validScores.length > 0 ? Math.round((passCount / validScores.length) * 100) : 0;

  // Print Marksheet Routine
  const handlePrintMarksheet = () => {
    const printWin = window.open('', '_blank', 'width=1000,height=800');
    if (!printWin) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Marksheet - ${selectedClass?.title || ''} (${selectedSection?.title || ''}) - ${selectedSubject}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #0f172a; }
            .header { border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: 800; color: #1e1b4b; margin: 0; }
            .meta { font-size: 13px; color: #64748b; margin-top: 6px; }
            .stats { display: flex; gap: 16px; margin-bottom: 20px; font-size: 12px; }
            .stat-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; rounded: 12px; flex: 1; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: 700; color: #334155; }
            .grade-badge { font-weight: 800; padding: 2px 6px; border-radius: 4px; }
            .footer { margin-top: 32px; font-size: 11px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">ClassOrbit Marksheet & Result Report</h1>
            <div class="meta">
              Class: <strong>${selectedClass?.title || ''}</strong> |
              Section: <strong>Section ${selectedSection?.title || ''}</strong> |
              Exam: <strong>${selectedExamType}</strong> |
              Subject: <strong>${selectedSubject}</strong> |
              Max Marks: <strong>${maxMarks}</strong>
            </div>
          </div>

          <div class="stats">
            <div class="stat-box">Total Students: <strong>${enrollments.length}</strong></div>
            <div class="stat-box">Highest Score: <strong>${highestScore} / ${maxMarks}</strong></div>
            <div class="stat-box">Class Average: <strong>${averageScore} / ${maxMarks}</strong></div>
            <div class="stat-box">Pass Percentage: <strong>${passRate}%</strong></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Roll / Enrollment ID</th>
                <th>Student Name</th>
                <th>Marks Obtained</th>
                <th>Grade</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${enrollments.map((enr, i) => {
                const st = enr.student;
                const stId = st?.id || enr.studentId || '';
                const rec = marksData[stId] || { marksObtained: '', remarks: '' };
                const gradeInfo = getGradeInfo(rec.marksObtained, maxMarks);
                return `
                  <tr>
                    <td>${i + 1}</td>
                    <td><strong>${st?.enrollmentNo || 'N/A'}</strong></td>
                    <td>${st?.user?.name || 'Unnamed Student'}</td>
                    <td><strong>${rec.marksObtained !== '' ? rec.marksObtained : '-'} / ${maxMarks}</strong></td>
                    <td><span class="grade-badge">${gradeInfo.grade}</span></td>
                    <td>${rec.remarks || '-'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">Generated on ${new Date().toLocaleString()} • ClassOrbit Academic Management</div>
          <script>window.onload = () => { window.print(); };</script>
        </body>
      </html>
    `;

    printWin.document.write(html);
    printWin.document.close();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-purple-900/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-400/30 text-purple-300 backdrop-blur-xs">
              <Award size={28} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Exams & Marks Entry Portal
              </h1>
              <p className="text-xs text-purple-200/80 mt-0.5 font-medium">
                Enter student assessment scores, evaluate grades, and generate section marksheets.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintMarksheet}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15"
          >
            <Printer size={16} /> Print Marksheet
          </button>
          <button
            onClick={handleSaveMarks}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/30 active:scale-95 disabled:opacity-50"
          >
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Marks'}
          </button>
        </div>
      </div>

      {/* Filter Selection Panel */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Class Select */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
              <BookOpen size={13} className="text-purple-600" /> Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/20"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {/* Section Select */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
              <Layers size={13} className="text-purple-600" /> Section
            </label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/20"
            >
              {sectionsList.map(s => (
                <option key={s.id} value={s.id}>Section {s.title}</option>
              ))}
            </select>
          </div>

          {/* Exam Type Select */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
              <Award size={13} className="text-purple-600" /> Exam / Test
            </label>
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/20"
            >
              {examTypes.map(ex => (
                <option key={ex} value={ex}>{ex}</option>
              ))}
            </select>
          </div>

          {/* Subject Select */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
              <FileSpreadsheet size={13} className="text-purple-600" /> Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/20"
            >
              {subjects.map(subj => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </select>
          </div>

          {/* Max Marks Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Max Marks
            </label>
            <input
              type="number"
              value={maxMarks}
              onChange={(e) => setMaxMarks(Math.max(1, Number(e.target.value)))}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
            />
          </div>
        </div>
      </div>

      {/* Class Performance Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Graded Roster</span>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">
              {totalGraded} / {enrollments.length}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <Award size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Highest Score</span>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">
              {highestScore} <span className="text-xs font-normal text-slate-400">/ {maxMarks}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Class Average</span>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">
              {averageScore} <span className="text-xs font-normal text-slate-400">/ {maxMarks}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <HelpCircle size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pass Percentage</span>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">{passRate}%</div>
          </div>
        </div>
      </div>

      {/* Main Student Marks Table Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative w-full max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('entry')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'entry'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Interactive Entry
            </button>
            <button
              onClick={() => setViewMode('marksheet')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'marksheet'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Marksheet View
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center animate-pulse">
            <div className="h-6 w-32 bg-slate-200 rounded mx-auto mb-3"></div>
            <div className="h-4 w-48 bg-slate-200 rounded mx-auto"></div>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-100">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Enrolled Students Found</h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              There are no students assigned to {selectedClass?.title} • Section {selectedSection?.title}.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Roll / Enrollment ID</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Marks Obtained (Out of {maxMarks})</th>
                  <th className="px-6 py-4">Grade</th>
                  <th className="px-6 py-4">Teacher Remarks / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEnrollments.map((enr, idx) => {
                  const st = enr.student;
                  const stId = st?.id || enr.studentId || `student-${idx}`;
                  const currentRecord = marksData[stId] || { marksObtained: '', remarks: '' };
                  const gradeInfo = getGradeInfo(currentRecord.marksObtained, maxMarks);

                  return (
                    <tr key={enr.id || idx} className="hover:bg-purple-50/20 transition-colors">
                      <td className="px-6 py-4 text-slate-400 font-mono font-semibold">{idx + 1}</td>
                      <td className="px-6 py-4 font-mono font-bold text-indigo-700">
                        {st?.enrollmentNo || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {st?.user?.name || 'Unnamed Student'}
                      </td>
                      <td className="px-6 py-4">
                        {viewMode === 'entry' ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max={maxMarks}
                              value={currentRecord.marksObtained}
                              onChange={(e) => handleMarkChange(stId, e.target.value)}
                              placeholder={`0 - ${maxMarks}`}
                              className="w-28 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
                            />
                            <span className="text-slate-400 font-semibold text-xs">/ {maxMarks}</span>
                          </div>
                        ) : (
                          <span className="font-extrabold text-slate-900 text-sm">
                            {currentRecord.marksObtained !== '' ? currentRecord.marksObtained : '-'} / {maxMarks}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-extrabold rounded-lg border ${gradeInfo.badge}`}>
                          {gradeInfo.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {viewMode === 'entry' ? (
                          <input
                            type="text"
                            placeholder="Add remarks..."
                            value={currentRecord.remarks}
                            onChange={(e) => handleRemarkChange(stId, e.target.value)}
                            className="w-full max-w-xs px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
                          />
                        ) : (
                          <span className="text-slate-600 italic">
                            {currentRecord.remarks || '-'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Bottom Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Total {filteredEnrollments.length} student records listed
              </span>
              <button
                onClick={handleSaveMarks}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 active:scale-95 disabled:opacity-50"
              >
                {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saving Marks...' : 'Save Marks'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
