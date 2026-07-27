import React from 'react';
import { Users, Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';

export const Teachers = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Teachers Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage teaching staff and assign classes.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
          <Plus size={16} /> Add Teacher
        </Button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
          <Users size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">No teachers found</h3>
        <p className="text-slate-500 max-w-sm mb-6">Get started by adding your first teacher to the system. You can invite them via email or create their account directly.</p>
        <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">Import from CSV</Button>
      </div>
    </div>
  );
};
