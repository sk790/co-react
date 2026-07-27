import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';

export const Settings = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Portal Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Configure your school portal preferences.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          Save Changes
        </Button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center">
            <SettingsIcon size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">General Information</h2>
            <p className="text-sm text-slate-500">Update your school details and contact info.</p>
          </div>
        </div>

        <div className="max-w-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">School Name</label>
              <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-600/20" defaultValue="ClassOrbit Demo School" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Established Year</label>
              <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-600/20" defaultValue="1995" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Email</label>
            <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-600/20" defaultValue="admin@school.com" />
          </div>
        </div>
      </div>
    </div>
  );
};
