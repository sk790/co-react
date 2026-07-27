import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const TeacherLayout = () => {
  const { logout } = useAuthStore();
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white shadow-sm border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800">Teacher Portal</h1>
        <button onClick={logout} className="text-sm bg-slate-800 text-white px-3 py-1 rounded">Logout</button>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};
