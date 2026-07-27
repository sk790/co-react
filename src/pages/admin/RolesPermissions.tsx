import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Sliders, 
  Plus, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  Shield, 
  Tag, 
  Briefcase, 
  Building2,
  RefreshCw,
  Info
} from 'lucide-react';
import { apiClient } from '../../api/axios';

interface CustomRole {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  rolePermissions?: { permissionId: string; permission?: { id: string; resource: string; action: string } }[];
}

interface PermissionItem {
  id: string;
  resource: string;
  action: string;
  description?: string;
}

interface MasterDataItem {
  id: string;
  type: 'STATUS' | 'DESIGNATION' | 'DEPARTMENT';
  title: string;
  description?: string;
  createdAt?: string;
}

// Fallback resources if DB has none seeded yet
const DEFAULT_RESOURCES = ['STUDENTS', 'TEACHERS', 'ATTENDANCE', 'CLASSES', 'TIMETABLE', 'FEES', 'SETTINGS', 'REPORTS'];
const DEFAULT_ACTIONS = ['READ', 'CREATE', 'UPDATE', 'DELETE'];

export const RolesPermissions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'statuses'>('roles');
  
  // Custom Roles State
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleForm, setRoleForm] = useState({ name: '', description: '' });
  
  // Permissions State
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [selectedRoleType, setSelectedRoleType] = useState<'system' | 'custom'>('system');
  const [selectedSystemRole, setSelectedSystemRole] = useState<string>('TEACHER');
  const [selectedCustomRoleId, setSelectedCustomRoleId] = useState<string>('');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  
  // Master Data / Statuses State
  const [masterData, setMasterData] = useState<MasterDataItem[]>([]);
  const [masterTypeFilter, setMasterTypeFilter] = useState<'STATUS' | 'DESIGNATION' | 'DEPARTMENT'>('STATUS');
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [editingMasterItem, setEditingMasterItem] = useState<MasterDataItem | null>(null);
  const [masterForm, setMasterForm] = useState({ type: 'STATUS' as 'STATUS' | 'DESIGNATION' | 'DEPARTMENT', title: '', description: '' });

  // UI Feedback
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const syncPermissionSelection = (roleType: 'system' | 'custom', roleId: string, rolesList: CustomRole[]) => {
    if (roleType === 'custom' && roleId) {
      const roleObj = rolesList.find(r => r.id === roleId);
      const assignedIds = roleObj?.rolePermissions?.map(rp => rp.permissionId) || [];
      setSelectedPermissionIds(assignedIds);
    } else {
      setSelectedPermissionIds([]);
    }
  };

  const fetchCustomRoles = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await apiClient.get('/role-permissions/custom-roles');
      if (res.data.success && res.data.data) {
        const rolesData: CustomRole[] = res.data.data;
        setCustomRoles(rolesData);
        let activeRoleId = selectedCustomRoleId;
        if (rolesData.length > 0 && !activeRoleId) {
          activeRoleId = rolesData[0].id;
          setSelectedCustomRoleId(activeRoleId);
        }
        syncPermissionSelection(selectedRoleType, activeRoleId, rolesData);
      }
    } catch (err) {
      console.warn('Could not fetch custom roles:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleSelectRoleType = (type: 'system' | 'custom') => {
    setSelectedRoleType(type);
    syncPermissionSelection(type, selectedCustomRoleId, customRoles);
  };

  const handleSelectCustomRole = (roleId: string) => {
    setSelectedCustomRoleId(roleId);
    syncPermissionSelection(selectedRoleType, roleId, customRoles);
  };

  const handleConfigurePermissions = (roleId: string) => {
    setSelectedRoleType('custom');
    setSelectedCustomRoleId(roleId);
    syncPermissionSelection('custom', roleId, customRoles);
    setActiveTab('permissions');
  };

  const fetchAllPermissions = async () => {
    try {
      const res = await apiClient.get('/role-permissions/resources');
      if (res.data.success && res.data.data) {
        setPermissions(res.data.data);
      }
    } catch (err) {
      console.warn('Could not fetch permissions:', err);
    }
  };

  const fetchMasterData = async () => {
    try {
      const res = await apiClient.get('/master-data');
      if (res.data.success && res.data.data) {
        setMasterData(res.data.data);
      }
    } catch (err) {
      console.warn('Could not fetch master data:', err);
    }
  };

  // Fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        fetchCustomRoles(false),
        fetchAllPermissions(),
        fetchMasterData()
      ]);
      setLoading(false);
    };
    loadInitialData();
  }, []);


  // Create new Custom Role
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      showToast('Role name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await apiClient.post('/role-permissions/custom-roles', roleForm);
      if (res.data.success) {
        showToast('Custom role created successfully!');
        setRoleForm({ name: '', description: '' });
        setIsRoleModalOpen(false);
        fetchCustomRoles();
      } else {
        showToast(res.data.message || 'Failed to create role', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error creating custom role', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Toggle permission check state
  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissionIds(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // Quick Select/Deselect All for a Resource
  const handleToggleResourceAll = (resource: string, pList: PermissionItem[]) => {
    const resourcePermissionIds = pList.filter(p => p.resource === resource).map(p => p.id);
    const allSelected = resourcePermissionIds.every(id => selectedPermissionIds.includes(id));

    if (allSelected) {
      setSelectedPermissionIds(prev => prev.filter(id => !resourcePermissionIds.includes(id)));
    } else {
      setSelectedPermissionIds(prev => Array.from(new Set([...prev, ...resourcePermissionIds])));
    }
  };

  // Save Role Permissions Matrix
  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      const payload = {
        systemRole: selectedRoleType === 'system' ? selectedSystemRole : undefined,
        customRoleId: selectedRoleType === 'custom' ? selectedCustomRoleId : undefined,
        permissionIds: selectedPermissionIds
      };

      const res = await apiClient.post('/role-permissions/role', payload);
      if (res.data.success) {
        showToast('Permissions updated successfully!');
        fetchCustomRoles();
      } else {
        showToast(res.data.message || 'Failed to update permissions', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error saving permissions', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Create or Edit Master Data (Status, Designation, Department)
  const handleSaveMasterItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterForm.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingMasterItem) {
        const res = await apiClient.put(`/master-data/${editingMasterItem.id}`, {
          title: masterForm.title,
          description: masterForm.description
        });
        if (res.data.success) {
          showToast('Updated successfully!');
          setIsMasterModalOpen(false);
          setEditingMasterItem(null);
          fetchMasterData();
        }
      } else {
        const res = await apiClient.post('/master-data', masterForm);
        if (res.data.success) {
          showToast('Added successfully!');
          setIsMasterModalOpen(false);
          fetchMasterData();
        }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error saving item', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete Master Data Item
  const handleDeleteMasterItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const res = await apiClient.delete(`/master-data/${id}`);
      if (res.data.success) {
        showToast('Item deleted successfully!');
        fetchMasterData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete item', 'error');
    }
  };

  // Prepare permission resources table
  const groupedPermissions: Record<string, PermissionItem[]> = {};
  permissions.forEach(p => {
    if (!groupedPermissions[p.resource]) {
      groupedPermissions[p.resource] = [];
    }
    groupedPermissions[p.resource].push(p);
  });

  const availableResources = Object.keys(groupedPermissions).length > 0 
    ? Object.keys(groupedPermissions) 
    : DEFAULT_RESOURCES;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Toast Notification */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
          message.type === 'success' 
            ? 'bg-emerald-600 text-white shadow-emerald-600/20' 
            : 'bg-rose-600 text-white shadow-rose-600/20'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-2 hover:opacity-80">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-900/30">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 rounded-xl border border-indigo-500/30 text-indigo-300">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Roles, Permissions & Statuses</h1>
              <p className="text-sm text-indigo-200/75 mt-0.5">
                Configure school-wide custom roles, access permissions matrix, and master statuses.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'roles' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Shield size={16} />
            Custom Roles
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'permissions' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <KeyRound size={16} />
            Permissions Matrix
          </button>
          <button
            onClick={() => setActiveTab('statuses')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'statuses' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Sliders size={16} />
            Statuses & Master Data
          </button>
        </div>
      </div>

      {/* TAB 1: CUSTOM ROLES */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Custom Roles Management</h2>
              <p className="text-sm text-slate-500">Create and manage custom organizational roles for your institution.</p>
            </div>
            <button
              onClick={() => {
                setRoleForm({ name: '', description: '' });
                setIsRoleModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm shadow-indigo-600/20"
            >
              <Plus size={18} />
              Create Custom Role
            </button>
          </div>

          {/* System Pre-defined Roles Info Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { title: 'SCHOOL_ADMIN', desc: 'Full administrative access to school operations.', color: 'border-purple-200 bg-purple-50/50 text-purple-800' },
              { title: 'TEACHER', desc: 'Classroom management, attendance, and grading.', color: 'border-blue-200 bg-blue-50/50 text-blue-800' },
              { title: 'STUDENT', desc: 'Access to learning materials, schedule, and grades.', color: 'border-emerald-200 bg-emerald-50/50 text-emerald-800' },
              { title: 'PARENT', desc: 'View child progress, fees, and school notifications.', color: 'border-amber-200 bg-amber-50/50 text-amber-800' },
            ].map(sysRole => (
              <div key={sysRole.title} className={`p-4 rounded-xl border ${sysRole.color}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm tracking-wide">{sysRole.title}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/80 border border-current">System</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mt-2">{sysRole.desc}</p>
              </div>
            ))}
          </div>

          {/* Custom Roles List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-md">Your School Custom Roles ({customRoles.length})</h3>
              <button onClick={fetchCustomRoles} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors">
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            {customRoles.length === 0 ? (
              <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl">
                <Shield className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h4 className="font-semibold text-slate-700">No Custom Roles Created Yet</h4>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
                  Create custom roles like 'Vice Principal', 'Accountant', 'Librarian', or 'Transport Coordinator' tailored to your school structure.
                </p>
                <button
                  onClick={() => setIsRoleModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 font-semibold rounded-xl text-sm hover:bg-indigo-100 transition-colors"
                >
                  <Plus size={16} />
                  Add First Custom Role
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customRoles.map((role) => (
                  <div 
                    key={role.id}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all bg-white flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                            {role.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{role.name}</h4>
                            <span className="text-[11px] text-slate-400">Custom Role</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {role.rolePermissions?.length || 0} permissions
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed min-h-[36px] line-clamp-2">
                        {role.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => handleConfigurePermissions(role.id)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                      >
                        <KeyRound size={14} />
                        Configure Permissions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PERMISSIONS MATRIX */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          
          {/* Target Role Selector Header */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Access Permissions Matrix</h2>
                <p className="text-sm text-slate-500">Select a role and toggle resource access capabilities.</p>
              </div>

              <button
                onClick={handleSavePermissions}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-all shadow-md shadow-emerald-600/20 self-start md:self-auto disabled:opacity-50"
              >
                <Check size={18} />
                {saving ? 'Saving Changes...' : 'Save Permissions Matrix'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              {/* Role Type Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Role Category
                </label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => handleSelectRoleType('system')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      selectedRoleType === 'system' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    System Roles
                  </button>
                  <button
                    onClick={() => handleSelectRoleType('custom')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      selectedRoleType === 'custom' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Custom Roles
                  </button>
                </div>
              </div>

              {/* Target Role Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Target Role
                </label>
                {selectedRoleType === 'system' ? (
                  <select
                    value={selectedSystemRole}
                    onChange={(e) => setSelectedSystemRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  >
                    <option value="TEACHER">TEACHER</option>
                    <option value="STUDENT">STUDENT</option>
                    <option value="PARENT">PARENT</option>
                  </select>
                ) : (
                  <select
                    value={selectedCustomRoleId}
                    onChange={(e) => handleSelectCustomRole(e.target.value)}
                    disabled={customRoles.length === 0}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 disabled:opacity-50"
                  >
                    {customRoles.length === 0 ? (
                      <option value="">No custom roles available</option>
                    ) : (
                      customRoles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))
                    )}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resource Domain</span>
              <div className="flex items-center gap-6 text-xs font-bold text-slate-500 uppercase tracking-wider pr-4">
                {DEFAULT_ACTIONS.map(act => (
                  <span key={act} className="w-16 text-center">{act}</span>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {availableResources.map((resource) => {
                const resPermissions = groupedPermissions[resource] || [];

                return (
                  <div key={resource} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-indigo-50/30 transition-colors">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 text-sm tracking-wide">{resource}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleResourceAll(resource, resPermissions)}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline"
                        >
                          Toggle Row
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Manage permissions for {resource.toLowerCase()} data module.</p>
                    </div>

                    <div className="flex items-center gap-6 pr-4 self-end sm:self-center">
                      {DEFAULT_ACTIONS.map((action) => {
                        // Find matching permission item if present
                        const matchedPerm = resPermissions.find(p => p.action === action);
                        const permId = matchedPerm ? matchedPerm.id : `${resource}_${action}`;
                        const isChecked = selectedPermissionIds.includes(permId);

                        return (
                          <label key={action} className="w-16 flex flex-col items-center justify-center cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePermission(permId)}
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <span className={`text-[10px] font-medium mt-1 transition-colors ${isChecked ? 'text-indigo-600 font-bold' : 'text-slate-400 group-hover:text-slate-600'}`}>
                              {action}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STATUSES & MASTER DATA */}
      {activeTab === 'statuses' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Statuses & Master Data</h2>
              <p className="text-sm text-slate-500">Configure custom statuses, designations, and departments for your school.</p>
            </div>

            <button
              onClick={() => {
                setEditingMasterItem(null);
                setMasterForm({ type: masterTypeFilter, title: '', description: '' });
                setIsMasterModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm shadow-indigo-600/20"
            >
              <Plus size={18} />
              Add New {masterTypeFilter}
            </button>
          </div>

          {/* Sub Navigation Filter */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            {[
              { type: 'STATUS', label: 'Statuses', icon: Tag },
              { type: 'DESIGNATION', label: 'Designations', icon: Briefcase },
              { type: 'DEPARTMENT', label: 'Departments', icon: Building2 },
            ].map(tab => (
              <button
                key={tab.type}
                onClick={() => setMasterTypeFilter(tab.type as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  masterTypeFilter === tab.type 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filtered Master Data Cards */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            {masterData.filter(d => d.type === masterTypeFilter).length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <Sliders className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <h4 className="font-semibold text-slate-700">No {masterTypeFilter} configured</h4>
                <p className="text-xs text-slate-400 mt-1 mb-4">Add your school's custom {masterTypeFilter.toLowerCase()} entries here.</p>
                <button
                  onClick={() => {
                    setEditingMasterItem(null);
                    setMasterForm({ type: masterTypeFilter, title: '', description: '' });
                    setIsMasterModalOpen(true);
                  }}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl text-xs hover:bg-indigo-100 transition-colors"
                >
                  Create {masterTypeFilter}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {masterData.filter(d => d.type === masterTypeFilter).map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 flex items-start justify-between bg-slate-50/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                        {masterTypeFilter === 'STATUS' && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{item.description || 'No description'}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingMasterItem(item);
                          setMasterForm({ type: item.type, title: item.title, description: item.description || '' });
                          setIsMasterModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteMasterItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE ROLE MODAL */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Create Custom Role</h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Role Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vice Principal, Exam Controller"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Responsibilities and purpose of this custom role..."
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 h-24 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MASTER DATA MODAL */}
      {isMasterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingMasterItem ? `Edit ${masterForm.type}` : `Add New ${masterForm.type}`}
              </h3>
              <button onClick={() => setIsMasterModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMasterItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Category Type
                </label>
                <select
                  value={masterForm.type}
                  onChange={(e) => setMasterForm({ ...masterForm, type: e.target.value as any })}
                  disabled={!!editingMasterItem}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 disabled:opacity-60"
                >
                  <option value="STATUS">STATUS</option>
                  <option value="DESIGNATION">DESIGNATION</option>
                  <option value="DEPARTMENT">DEPARTMENT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  placeholder={`e.g. ${masterForm.type === 'STATUS' ? 'Probation' : masterForm.type === 'DESIGNATION' ? 'Senior HOD' : 'Science Dept'}`}
                  value={masterForm.title}
                  onChange={(e) => setMasterForm({ ...masterForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Optional details or note..."
                  value={masterForm.description}
                  onChange={(e) => setMasterForm({ ...masterForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 h-20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMasterModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingMasterItem ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
