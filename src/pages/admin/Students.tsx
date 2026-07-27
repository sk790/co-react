import React from 'react';
import { GraduationCap, Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';

export const Students = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Roster</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all enrolled students across all classes.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
          <Plus size={16} /> Enroll Student
        </Button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
          <GraduationCap size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Student records empty</h3>
        <p className="text-slate-500 max-w-sm mb-6">Enroll your first student or run a bulk import to populate the roster.</p>
        <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">Bulk Import</Button>
      </div>
    </div>
  );
};
