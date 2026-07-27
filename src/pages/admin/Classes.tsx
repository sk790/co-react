import React from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';

export const Classes = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Class Management</h1>
          <p className="text-sm text-slate-500 mt-1">Organize grades, sections, and subjects.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
          <Plus size={16} /> Create Class
        </Button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4">
          <BookOpen size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">No active classes</h3>
        <p className="text-slate-500 max-w-sm mb-6">Create your first class/section to start assigning teachers and students.</p>
        <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">View Templates</Button>
      </div>
    </div>
  );
};
