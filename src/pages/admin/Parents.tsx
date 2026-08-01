import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  Phone,
  GraduationCap,
  Grid,
  List,
  User
} from 'lucide-react';
import { apiClient } from '../../api/axios';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { DataCard } from '@/components/DataCard';

interface ParentData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  parentProfile?: {
    studentParents: {
      relation: string;
      student: {
        user: {
          name: string;
        }
      }
    }[]
  }
}

export const Parents: React.FC = () => {
  const [parents, setParents] = useState<ParentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const fetchParents = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await apiClient.get('/parents');
      if (res.data.success) {
        setParents(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching parents:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const filteredParents = parents.filter(parent =>
    parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (parent.phone && parent.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <Users size={28} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Parents Directory</h1>
            <p className="text-sm text-slate-500 mt-1">Manage all parent and guardian accounts</p>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search parents by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
          <button
            onClick={() => fetchParents(true)}
            className={`p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100 ${refreshing ? 'animate-spin text-indigo-600' : ''}`}
            title="Refresh Data"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <LoadingState message='Loading parents directory...' />
      ) : filteredParents.length === 0 ? (
        <EmptyState
          title="No Parents Found"
          icon={User}
        />
      ) : (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParents.map((parent) => (
              <DataCard
                key={parent.id}
                title={parent.name}
                subtitle={parent.email}
                icon={User}
                badge={`${parent.parentProfile?.studentParents?.length || 0} Linked`}
                details={
                  parent.phone
                    ? [{ label: 'Phone', value: parent.phone, icon: Phone }]
                    : []
                }
              >
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <GraduationCap size={14} className="text-indigo-500" />
                    <span>Linked Students</span>
                  </div>

                  {parent.parentProfile?.studentParents && parent.parentProfile.studentParents.length > 0 ? (
                    <div className="space-y-2">
                      {parent.parentProfile.studentParents.map((sp, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm bg-white p-2 rounded-lg border border-slate-100 shadow-xs">
                          <span className="font-medium text-slate-800">{sp.student.user.name}</span>
                          <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-medium">
                            {sp.relation}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic px-1">No linked students found.</p>
                  )}
                </div>
              </DataCard>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">Parent Name</th>
                    <th className="px-6 py-4 font-bold">Contact Info</th>
                    <th className="px-6 py-4 font-bold">Linked Students</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredParents.map((parent) => (
                    <tr key={parent.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 font-bold text-sm rounded-full flex items-center justify-center">
                            {parent.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{parent.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail size={14} className="text-slate-400" />
                            {parent.email}
                          </div>
                          {parent.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone size={14} className="text-slate-400" />
                              {parent.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {parent.parentProfile?.studentParents && parent.parentProfile.studentParents.length > 0 ? (
                            parent.parentProfile.studentParents.map((sp, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-medium border border-indigo-100/50">
                                <span>{sp.student.user.name}</span>
                                <span className="opacity-50">({sp.relation})</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-slate-400 italic">None</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
};
