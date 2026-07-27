import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const ParentLayout = () => {
  const { logout } = useAuthStore();
  
  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <header className="bg-green-600 shadow p-4 flex justify-between items-center text-white">
        <h1 className="text-xl font-bold">Parent Portal</h1>
        <button onClick={logout} className="text-sm bg-white text-green-600 px-3 py-1 rounded">Logout</button>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};
