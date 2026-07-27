import React from 'react';
import { Users, GraduationCap, BookOpen, IndianRupee, TrendingUp, MoreVertical } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTenantStore } from '../../store/tenantStore';

// MOCK DATA DICTIONARY FOR MULTIPLE TENANTS
const mockSchoolData: Record<string, any> = {
  'dps': {
    name: 'Delhi Public School',
    stats: [
      { label: 'Total Students', value: '3,250', change: '+15.2%', isUp: true, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Total Teachers', value: '180', change: '+3.4%', isUp: true, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Active Classes', value: '110', change: '0%', isUp: true, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Monthly Revenue', value: '₹22.5L', change: '+12.1%', isUp: true, icon: IndianRupee, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ],
    chartData: [
      { name: 'Jan', revenue: 6000, expenses: 3400 },
      { name: 'Feb', revenue: 5000, expenses: 2398 },
      { name: 'Mar', revenue: 7000, expenses: 4800 },
      { name: 'Apr', revenue: 6500, expenses: 4908 },
      { name: 'May', revenue: 8000, expenses: 5800 },
      { name: 'Jun', revenue: 7500, expenses: 4800 },
      { name: 'Jul', revenue: 9500, expenses: 5300 },
    ],
    recentActivity: [
      { id: 1, user: 'Amit Verma', action: 'added a new assignment to', target: 'Class 10A Science', time: '1 hour ago', avatar: 'bg-emerald-100 text-emerald-700' },
      { id: 2, user: 'Neha Sharma', action: 'paid term fees for', target: 'Rahul Sharma (Grade 8)', time: '3 hours ago', avatar: 'bg-blue-100 text-blue-700' },
      { id: 3, user: 'Admin User', action: 'updated the school calendar for', target: 'Winter Break 2026', time: 'Yesterday', avatar: 'bg-indigo-100 text-indigo-700' },
      { id: 4, user: 'Priya Patel', action: 'marked attendance for', target: 'Class 12B Mathematics', time: 'Yesterday', avatar: 'bg-emerald-100 text-emerald-700' },
    ]
  },
  'kv': {
    name: 'Kendriya Vidyalaya',
    stats: [
      { label: 'Total Students', value: '1,845', change: '+5.5%', isUp: true, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Total Teachers', value: '85', change: '-1.1%', isUp: false, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Active Classes', value: '62', change: '0%', isUp: true, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Monthly Revenue', value: '₹9.2L', change: '+2.4%', isUp: true, icon: IndianRupee, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ],
    chartData: [
      { name: 'Jan', revenue: 3000, expenses: 2000 },
      { name: 'Feb', revenue: 2800, expenses: 1900 },
      { name: 'Mar', revenue: 3500, expenses: 2200 },
      { name: 'Apr', revenue: 3400, expenses: 2100 },
      { name: 'May', revenue: 4200, expenses: 2800 },
      { name: 'Jun', revenue: 4000, expenses: 2700 },
      { name: 'Jul', revenue: 4800, expenses: 3100 },
    ],
    recentActivity: [
      { id: 1, user: 'Rajesh Kumar', action: 'created a new event', target: 'Annual Sports Day', time: '2 hours ago', avatar: 'bg-amber-100 text-amber-700' },
      { id: 2, user: 'Sunita Devi', action: 'submitted grades for', target: 'Class 9C Hindi', time: '5 hours ago', avatar: 'bg-purple-100 text-purple-700' },
      { id: 3, user: 'Admin User', action: 'promoted students in', target: 'Class 5 to Class 6', time: 'Yesterday', avatar: 'bg-indigo-100 text-indigo-700' },
    ]
  },
  'default': {
    name: 'ClassOrbit Demo School',
    stats: [
      { label: 'Total Students', value: '500', change: '+12.5%', isUp: true, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Total Teachers', value: '45', change: '+2.1%', isUp: true, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Active Classes', value: '24', change: '0%', isUp: true, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Monthly Revenue', value: '₹1.5L', change: '+5.0%', isUp: true, icon: IndianRupee, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ],
    chartData: [
      { name: 'Jan', revenue: 1000, expenses: 600 },
      { name: 'Feb', revenue: 1200, expenses: 700 },
      { name: 'Mar', revenue: 1500, expenses: 800 },
      { name: 'Apr', revenue: 1400, expenses: 750 },
      { name: 'May', revenue: 1800, expenses: 900 },
      { name: 'Jun', revenue: 1700, expenses: 850 },
      { name: 'Jul', revenue: 2000, expenses: 1000 },
    ],
    recentActivity: [
      { id: 1, user: 'System Admin', action: 'initialized system settings for', target: 'Academic Year 2026', time: 'Just now', avatar: 'bg-indigo-100 text-indigo-700' },
    ]
  }
};

export const AdminDashboard = () => {
  const { tenant } = useTenantStore();
  
  // Get data for the current tenant, fallback to default if not found
  const activeData = (tenant && mockSchoolData[tenant.toLowerCase()]) 
    ? mockSchoolData[tenant.toLowerCase()] 
    : mockSchoolData['default'];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{activeData.name}</h1>
        <p className="text-sm text-slate-500 mt-1">Dashboard Overview - Here's what's happening at your school today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {activeData.stats.map((stat: any, idx: number) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={22} strokeWidth={2.5} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold ${stat.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stat.isUp ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                {stat.change}
              </span>
              <span className="text-xs text-slate-400">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Chart Section */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Revenue & Expenses</h2>
              <p className="text-sm text-slate-500">Financial overview for the current academic year.</p>
            </div>
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="expenses" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View All</button>
          </div>
          
          <div className="space-y-6">
            {activeData.recentActivity.map((activity: any) => (
              <div key={activity.id} className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm ${activity.avatar}`}>
                  {activity.user.charAt(0)}
                </div>
                <div>
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{activity.user}</span> {activity.action} <span className="font-medium text-indigo-600">{activity.target}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
