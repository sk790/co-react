import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTenantStore } from '../store/tenantStore';
import { useSessionStore } from '../store/sessionStore';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Menu,
  X,
  Globe,
  ChevronDown,
  Calendar
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const { tenant, schoolName } = useTenantStore();
  const { sessions, activeSessionId, setActiveSessionId } = useSessionStore();
  const location = useLocation();
  // const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  
  const sessionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sessionRef.current && !sessionRef.current.contains(event.target as Node)) {
        setSessionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Teachers', href: '/admin/teachers', icon: Users },
    { name: 'Students', href: '/admin/students', icon: GraduationCap },
    { name: 'Classes', href: '/admin/classes', icon: BookOpen },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-indigo-900 text-white transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 bg-indigo-950/50 border-b border-indigo-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/30 flex items-center justify-center text-indigo-300">
              <Globe size={18} />
            </div>
            <span className="font-bold text-lg tracking-wide truncate max-w-[180px]">
              {schoolName || (tenant ? <span className="uppercase">{tenant}</span> : 'ClassOrbit')}
            </span>
          </div>
          <button 
            className="ml-auto lg:hidden text-indigo-300 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-4 px-2">
            Main Menu
          </div>
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-indigo-800 text-white font-medium shadow-sm shadow-indigo-900/20' 
                    : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'
                  }
                `}
              >
                <item.icon size={20} className={isActive ? 'text-indigo-400' : 'text-indigo-400 group-hover:text-indigo-300'} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-indigo-800/50">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-indigo-200 hover:bg-rose-500/10 hover:text-rose-400 transition-colors group"
          >
            <LogOut size={20} className="text-indigo-400 group-hover:text-rose-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            {/* Search */}
            <div className="hidden md:flex items-center relative">
              <Search size={16} className="absolute left-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:bg-white transition-all w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Academic Session Dropdown */}
            <div className="relative hidden sm:block" ref={sessionRef}>
              <button 
                onClick={() => setSessionOpen(!sessionOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 rounded-lg transition-colors text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              >
                <Calendar size={16} className="text-indigo-600" />
                {sessions.find(s => s.id === activeSessionId)?.title || 'No Session'}
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${sessionOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {sessionOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/50 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-2 text-xs font-bold tracking-wider text-slate-400 uppercase border-b border-slate-100 mb-1">
                    Select Session
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {sessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => {
                          setActiveSessionId(session.id);
                          setSessionOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-50 ${
                          activeSessionId === session.id 
                            ? 'text-indigo-600 bg-indigo-50/50' 
                            : 'text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{session.title}</span>
                          {session.status.title === 'ACTIVE' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            
            {/* User Profile */}
            <div className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-inner">
                {user?.name.charAt(0) || 'A'}
              </div>
              <div className="hidden md:block text-sm">
                <p className="font-semibold text-slate-700 leading-none">{user?.name}</p>
                <p className="text-slate-500 text-xs mt-1 leading-none capitalize">{user?.role?.replace('_', ' ').toLowerCase()}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
};
