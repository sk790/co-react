import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useAuthStore } from '../store/authStore';
import { useTenantStore } from '../store/tenantStore';
import { useSessionStore } from '../store/sessionStore';
import { CreateSessionModal } from '../components/CreateSessionModal';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Layers,
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Menu,
  X,
  Globe,
  ChevronDown,
  Calendar,
  ShieldCheck,
  UserCircle,
  Clock,
  Bus,
  MapPin,
  Plus
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const { tenant, schoolName } = useTenantStore();
  const { sessions, activeSessionId, setActiveSessionId, fetchSessions } = useSessionStore();
  const location = useLocation();
  // const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] = useState(false);
  const [academicDropdownOpen, setAcademicDropdownOpen] = useState(
    location.pathname.startsWith('/admin/classes') || location.pathname.startsWith('/admin/sections')
  );
  const [transportDropdownOpen, setTransportDropdownOpen] = useState(
    location.pathname.startsWith('/admin/transport')
  );

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (location.pathname.startsWith('/admin/classes') || location.pathname.startsWith('/admin/sections')) {
      setAcademicDropdownOpen(true);
    }
    if (location.pathname.startsWith('/admin/transport')) {
      setTransportDropdownOpen(true);
    }
  }, [location.pathname]);

  const mainNav = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Teachers', href: '/admin/teachers', icon: Users },
    { name: 'Students', href: '/admin/students', icon: GraduationCap },
    { name: 'Parents', href: '/admin/parents', icon: UserCircle },
    { name: 'Timetables', href: '/admin/timetables', icon: Clock },
  ];

  const bottomNav = [
    { name: 'Academic Sessions', href: '/admin/sessions', icon: Calendar },
    { name: 'Roles & Statuses', href: '/admin/roles-permissions', icon: ShieldCheck },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 h-screen z-50 w-72 bg-indigo-900 text-white transition-transform duration-300 ease-in-out shrink-0 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
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
          
          {mainNav.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm
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

          {/* Classes & Sections Collapsible Dropdown */}
          <div className="py-0.5">
            <button
              onClick={() => setAcademicDropdownOpen(!academicDropdownOpen)}
              className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm
                ${(location.pathname.startsWith('/admin/classes') || location.pathname.startsWith('/admin/sections'))
                  ? 'bg-indigo-800/80 text-white font-medium'
                  : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <BookOpen size={20} className="text-indigo-400 group-hover:text-indigo-300" />
                <span>Classes & Sections</span>
              </div>
              <ChevronDown 
                size={16} 
                className={`text-indigo-300 transition-transform duration-300 ease-in-out ${academicDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Smooth Collapsible Submenu with CSS Grid Animation */}
            <div className={`
              grid transition-all duration-300 ease-in-out overflow-hidden
              ${academicDropdownOpen 
                ? 'grid-rows-[1fr] opacity-100 mt-1' 
                : 'grid-rows-[0fr] opacity-0 mt-0'
              }
            `}>
              <div className="min-h-0 ml-4 pl-3 border-l-2 border-indigo-700/60 space-y-1">
                <NavLink
                  to="/admin/classes"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150
                    ${isActive 
                      ? 'bg-indigo-700 text-white font-bold shadow-xs' 
                      : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'
                    }
                  `}
                >
                  <BookOpen size={15} className="text-indigo-300" />
                  <span>Classes</span>
                </NavLink>

                <NavLink
                  to="/admin/sections"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150
                    ${isActive 
                      ? 'bg-indigo-700 text-white font-bold shadow-xs' 
                      : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'
                    }
                  `}
                >
                  <Layers size={15} className="text-purple-300" />
                  <span>Sections</span>
                </NavLink>
              </div>
            </div>
          </div>

          {/* Transport Collapsible Dropdown */}
          <div className="py-0.5">
            <button
              onClick={() => setTransportDropdownOpen(!transportDropdownOpen)}
              className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm
                ${location.pathname.startsWith('/admin/transport')
                  ? 'bg-indigo-800/80 text-white font-medium'
                  : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Bus size={20} className="text-amber-400 group-hover:text-amber-300" />
                <span>Transport</span>
              </div>
              <ChevronDown 
                size={16} 
                className={`text-indigo-300 transition-transform duration-300 ease-in-out ${transportDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Smooth Collapsible Submenu with CSS Grid Animation */}
            <div className={`
              grid transition-all duration-300 ease-in-out overflow-hidden
              ${transportDropdownOpen 
                ? 'grid-rows-[1fr] opacity-100 mt-1' 
                : 'grid-rows-[0fr] opacity-0 mt-0'
              }
            `}>
              <div className="min-h-0 ml-4 pl-3 border-l-2 border-indigo-700/60 space-y-1">
                <NavLink
                  to="/admin/transport/vehicles"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150
                    ${isActive 
                      ? 'bg-indigo-700 text-white font-bold shadow-xs' 
                      : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'
                    }
                  `}
                >
                  <Bus size={15} className="text-amber-300" />
                  <span>Vehicles</span>
                </NavLink>

                <NavLink
                  to="/admin/transport/routes"
                  end
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150
                    ${isActive 
                      ? 'bg-indigo-700 text-white font-bold shadow-xs' 
                      : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'
                    }
                  `}
                >
                  <MapPin size={15} className="text-purple-300" />
                  <span>Routes</span>
                </NavLink>

                <NavLink
                  to="/admin/transport/drivers"
                  end
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150
                    ${isActive 
                      ? 'bg-indigo-700 text-white font-bold shadow-xs' 
                      : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'
                    }
                  `}
                >
                  <UserCircle size={15} className="text-indigo-300" />
                  <span>Drivers & Staff</span>
                </NavLink>
              </div>
            </div>
          </div>

          {bottomNav.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm
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

      {/* Main Content (Independently Scrollable) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 rounded-lg transition-colors text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 data-[state=open]:border-indigo-300 data-[state=open]:bg-indigo-50"
                >
                  <Calendar size={16} className="text-indigo-600" />
                  {sessions.find(s => s.id === activeSessionId)?.title || 'No Session'}
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1">
                <div className="px-2 py-1.5 text-xs font-bold tracking-wider text-slate-400 uppercase mb-1">
                  Select Session
                </div>
                {sessions.map((session) => (
                  <DropdownMenuItem
                    key={session.id}
                    onClick={() => setActiveSessionId(session.id)}
                    className={`flex items-center justify-between cursor-pointer rounded-md px-2 py-2 text-sm font-medium transition-colors focus:bg-slate-50 ${
                      activeSessionId === session.id 
                        ? 'text-indigo-600 bg-indigo-50/50' 
                        : 'text-slate-600'
                    }`}
                  >
                    <span>{session.title}</span>
                    {session.status.title === 'ACTIVE' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        ACTIVE
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
                
                <div className="border-t border-slate-100 pt-1 mt-1">
                  <DropdownMenuItem
                    onClick={() => setIsCreateSessionModalOpen(true)}
                    className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50"
                  >
                    <Plus size={14} />
                    <span>Create New Session</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            
            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 data-[state=open]:bg-slate-50 data-[state=open]:border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-inner">
                    {user?.name.charAt(0) || 'A'}
                  </div>
                  <div className="hidden md:block text-sm text-left">
                    <p className="font-semibold text-slate-700 leading-none">{user?.name}</p>
                    <p className="text-slate-500 text-xs mt-1 leading-none capitalize">{user?.role?.replace('_', ' ').toLowerCase()}</p>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-1">
                <DropdownMenuItem onClick={logout} className="text-rose-600 cursor-pointer flex items-center gap-2 px-2 py-2">
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Create Session Modal */}
      <CreateSessionModal
        isOpen={isCreateSessionModalOpen}
        onClose={() => setIsCreateSessionModalOpen(false)}
      />

    </div>
  );
};
