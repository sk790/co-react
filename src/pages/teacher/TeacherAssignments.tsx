import React, { useState } from 'react';
import { FileText, Plus, Calendar, BookOpen, Download, Trash2, CheckCircle2 } from 'lucide-react';

export const TeacherAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState([
    { id: '1', title: 'Quadratic Equations Practice Set', classTitle: 'Class 10 - Sec A', dueDate: '2026-08-05', submissions: '28 / 32 Submitted' },
    { id: '2', title: 'Newton Laws of Motion Assignment', classTitle: 'Class 9 - Sec A', dueDate: '2026-08-07', submissions: '15 / 30 Submitted' },
    { id: '3', title: 'Calculus Derivatives Exercise', classTitle: 'Class 12 - Sec A', dueDate: '2026-08-10', submissions: '10 / 25 Submitted' },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Assignments & Study Notes
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Create homework assignments, upload study materials, and track student submissions
            </p>
          </div>
        </div>

        <button className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 active:scale-95">
          <Plus size={16} /> Create Assignment
        </button>
      </div>

      {/* Assignment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((item) => (
          <div
            key={item.id}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-extrabold">
                  {item.classTitle}
                </span>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Calendar size={13} /> Due: {item.dueDate}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                {item.title}
              </h3>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={14} /> {item.submissions}
              </span>
              <button className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                <Download size={14} /> Attachment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
