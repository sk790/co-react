import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const StudentLayout = () => {
  const { logout } = useAuthStore();
  
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <header className="bg-blue-600 shadow p-4 flex justify-between items-center text-white">
        <h1 className="text-xl font-bold">Student Portal</h1>
        <button onClick={logout} className="text-sm bg-white text-blue-600 px-3 py-1 rounded">Logout</button>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};
