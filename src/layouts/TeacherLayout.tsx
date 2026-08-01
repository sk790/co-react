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
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  Clock,
  GraduationCap,
  Award,
  LogOut,
  Bell,
  Menu,
  ChevronDown,
  Sparkles,
  FileText,
  Layers
} from 'lucide-react';

interface NavSubItem {
  name: string;
  href: string;
  icon: any;
}

interface NavGroupItem {
  type: 'group';
  name: string;
  icon: any;
  items: NavSubItem[];
}

interface NavSingleItem {
  type: 'single';
  name: string;
  href: string;
  icon: any;
}

type MenuItem = NavSingleItem | NavGroupItem;

export const TeacherLayout = () => {
  const { user, logout } = useAuthStore();
  const { schoolName } = useTenantStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Expanded dropdown state for My Classes
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({
    'My Classes': true,
  });

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const menuStructure: MenuItem[] = [
    {
      type: 'single',
      name: 'Dashboard',
      href: '/teacher/dashboard',
      icon: LayoutDashboard,
    },
    // DROPDOWN: My Classes (with Classes & Sections)
    {
      type: 'group',
      name: 'My Classes & Sections',
      icon: BookOpen,
      items: [
        { name: 'Classes', href: '/teacher/classes', icon: BookOpen },
        { name: 'Sections', href: '/teacher/sections', icon: Layers },
      ],
    },
    {
      type: 'single',
      name: 'Attendance',
      href: '/teacher/attendance',
      icon: ClipboardCheck,
    },
    {
      type: 'single',
      name: 'My Timetable',
      href: '/teacher/timetable',
      icon: Clock,
    },
    {
      type: 'single',
      name: 'My Students',
      href: '/teacher/students',
      icon: GraduationCap,
    },
    {
      type: 'single',
      name: 'Marks & Exams',
      href: '/teacher/marks',
      icon: Award,
    },
    {
      type: 'single',
      name: 'Assignments',
      href: '/teacher/assignments',
      icon: FileText,
    },
  ];

  // Auto-expand My Classes group if current path belongs to it
  useEffect(() => {
    menuStructure.forEach(item => {
      if (item.type === 'group') {
        const hasActive = item.items.some(sub => location.pathname === sub.href || location.pathname.startsWith(`${sub.href}/`));
        if (hasActive) {
          setOpenGroups(prev => ({ ...prev, [item.name]: true }));
        }
      }
    });
  }, [location.pathname]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <aside
        className={`
        fixed lg:sticky top-0 h-screen z-50 w-72 bg-slate-900 text-white transition-transform duration-300 ease-in-out shrink-0 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 bg-slate-950/60 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-8.5 h-8.5 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight text-white leading-none">
                {schoolName || 'ClassOrbit'}
              </h2>
              <span className="text-[11px] text-purple-400 font-semibold uppercase tracking-wider">
                Teacher Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
          <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Main Menu
          </div>

          {menuStructure.map((item) => {
            if (item.type === 'single') {
              const isActive = location.pathname === item.href || (item.href !== '/teacher/dashboard' && location.pathname.startsWith(`${item.href}/`));
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-xs font-bold
                    ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }
                  `}
                >
                  <item.icon size={18} className={isActive ? 'text-white' : 'text-purple-400'} />
                  <span>{item.name}</span>
                </NavLink>
              );
            }

            // Dropdown Group Header (My Classes)
            const isOpen = openGroups[item.name] ?? false;
            const isGroupActive = item.items.some(sub => location.pathname === sub.href || location.pathname.startsWith(`${sub.href}/`));

            return (
              <div key={item.name} className="space-y-1 pt-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(item.name)}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200
                    ${isGroupActive ? 'text-purple-300 bg-slate-800/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className={isGroupActive ? 'text-purple-400' : 'text-slate-400'} />
                    <span>{item.name}</span>
                  </div>
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-300 text-slate-400 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown Sub-Items with Smooth CSS Height & Opacity Animation */}
                <div
                  className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'grid-rows-[1fr] opacity-100 mt-1 mb-1' : 'grid-rows-[0fr] opacity-0 my-0'
                  }`}
                >
                  <div className="overflow-hidden pl-4 space-y-1 border-l-2 border-slate-800 ml-5">
                    {item.items.map(sub => {
                      const isSubActive = location.pathname === sub.href || (sub.href !== '/teacher/classes' && location.pathname.startsWith(`${sub.href}/`));
                      return (
                        <NavLink
                          key={sub.name}
                          to={sub.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`
                            flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 text-[12px] font-semibold
                            ${
                              isSubActive
                                ? 'bg-purple-600 text-white shadow-xs font-bold'
                                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                            }
                          `}
                        >
                          <sub.icon size={15} className={isSubActive ? 'text-white' : 'text-purple-400'} />
                          <span>{sub.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Logged in Teacher Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-extrabold flex items-center justify-center shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'T'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Teacher'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || 'Faculty Staff'}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-600 rounded-full"></span>
            </button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'T'}
                </div>
                <div className="hidden md:block text-left leading-tight">
                  <p className="text-xs font-bold text-slate-900">{user?.name || 'Teacher'}</p>
                  <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Faculty</p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl border border-slate-200">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>
                <DropdownMenuItem
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
